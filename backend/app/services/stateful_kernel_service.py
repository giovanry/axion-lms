import ast
import base64
import contextlib
import io
import time
import traceback
from typing import Any, Dict, List, Optional
from pydantic import BaseModel


class NotebookExecuteRequest(BaseModel):
    session_id: str
    code: str
    test_assertions: Optional[str] = None
    reset_session: bool = False


class DataFrameMetadata(BaseModel):
    shape: List[int]
    columns: List[Dict[str, Any]]
    rows: List[List[Any]]


class NotebookExecuteResponse(BaseModel):
    success: bool
    stdout: str
    stderr: str
    dataframe: Optional[DataFrameMetadata] = None
    plot_base64: Optional[str] = None
    execution_time_ms: float
    passed_asserts: bool
    error_message: Optional[str] = None


class StatefulKernelManager:
    def __init__(self):
        self._sessions: Dict[str, Dict[str, Any]] = {}

    def get_or_create_namespace(self, session_id: str) -> Dict[str, Any]:
        if session_id not in self._sessions:
            ns: Dict[str, Any] = {
                "__name__": "__main__",
                "__doc__": None,
                "__package__": None,
            }
            # Pre-populate common scientific tools safely if installed
            try:
                import numpy as np
                ns["np"] = np
                ns["numpy"] = np
            except ImportError:
                pass
            try:
                import pandas as pd
                ns["pd"] = pd
                ns["pandas"] = pd
            except ImportError:
                pass
            self._sessions[session_id] = ns
        return self._sessions[session_id]

    def reset_session(self, session_id: str) -> None:
        if session_id in self._sessions:
            del self._sessions[session_id]

    def execute(
        self,
        session_id: str,
        code: str,
        test_assertions: Optional[str] = None,
        reset_first: bool = False,
    ) -> NotebookExecuteResponse:
        start_time = time.perf_counter()

        if reset_first:
            self.reset_session(session_id)

        ns = self.get_or_create_namespace(session_id)

        stdout_buf = io.StringIO()
        stderr_buf = io.StringIO()
        plot_base64: Optional[str] = None
        df_metadata: Optional[DataFrameMetadata] = None
        passed_asserts = False
        error_msg: Optional[str] = None
        success = True

        # Setup matplotlib plot capture if available
        plt_module = None
        try:
            import matplotlib
            matplotlib.use("Agg")  # Non-interactive headless backend
            import matplotlib.pyplot as plt
            plt_module = plt
            plt.clf()
            plt.close("all")
        except Exception:
            pass

        try:
            with contextlib.redirect_stdout(stdout_buf), contextlib.redirect_stderr(stderr_buf):
                # 1. Parse AST to evaluate last expression if it's an expression (like Jupyter)
                parsed = ast.parse(code)
                last_expr = None
                if parsed.body and isinstance(parsed.body[-1], ast.Expr):
                    last_expr = parsed.body.pop()

                # Compile and execute statement body
                if parsed.body:
                    mod = ast.Module(body=parsed.body, type_ignores=[])
                    compiled_code = compile(mod, filename="<axion_cell>", mode="exec")
                    exec(compiled_code, ns)

                # Evaluate final expression if exists
                if last_expr is not None:
                    expr_ast = ast.Expression(body=last_expr.value)
                    compiled_expr = compile(expr_ast, filename="<axion_cell>", mode="eval")
                    result_obj = eval(compiled_expr, ns)

                    # Inspect if result_obj is a pandas DataFrame
                    df_metadata = self._extract_dataframe_metadata(result_obj)
                    if df_metadata is None and result_obj is not None:
                        # Print string representation if not None and not already printed
                        print(repr(result_obj))

                # 2. Capture Matplotlib plot if generated
                if plt_module is not None:
                    figs = [plt_module.figure(n) for n in plt_module.get_fignums()]
                    if figs:
                        img_buf = io.BytesIO()
                        figs[0].savefig(img_buf, format="png", bbox_inches="tight", dpi=120)
                        img_buf.seek(0)
                        b64_str = base64.b64encode(img_buf.read()).decode("utf-8")
                        plot_base64 = f"data:image/png;base64,{b64_str}"
                        plt_module.close("all")

                # 3. Execute Auto-Grader Assertion Tests if provided
                if test_assertions and test_assertions.strip():
                    compiled_asserts = compile(test_assertions, filename="<auto_grader>", mode="exec")
                    exec(compiled_asserts, ns)
                    passed_asserts = True
                else:
                    passed_asserts = True  # Standard run without assert tests

        except AssertionError as ae:
            success = False
            passed_asserts = False
            tb_lines = traceback.format_exc().strip().splitlines()
            error_msg = f"AssertionError: {ae}" if str(ae) else "AssertionError: Hasil kode Anda belum memenuhi kriteria uji modul."
            stderr_buf.write(f"\n[AUTO-GRADER FAILED] {error_msg}\n")
        except Exception as e:
            success = False
            passed_asserts = False
            error_msg = f"{type(e).__name__}: {str(e)}"
            tb = traceback.format_exc()
            stderr_buf.write(tb)

        elapsed_ms = (time.perf_counter() - start_time) * 1000

        return NotebookExecuteResponse(
            success=success,
            stdout=stdout_buf.getvalue(),
            stderr=stderr_buf.getvalue(),
            dataframe=df_metadata,
            plot_base64=plot_base64,
            execution_time_ms=round(elapsed_ms, 2),
            passed_asserts=passed_asserts,
            error_message=error_msg,
        )

    def _extract_dataframe_metadata(self, obj: Any) -> Optional[DataFrameMetadata]:
        try:
            # Check pandas DataFrame
            type_name = type(obj).__name__
            module_name = type(obj).__module__

            if "pandas" in module_name and type_name == "DataFrame":
                shape = [int(obj.shape[0]), int(obj.shape[1])]
                columns = []
                for col in obj.columns:
                    col_str = str(col)
                    col_type = str(obj[col].dtype)
                    null_count = int(obj[col].isna().sum())
                    columns.append({
                        "name": col_str,
                        "type": col_type,
                        "nulls": null_count,
                    })

                # Sample first 10 rows
                head_df = obj.head(10)
                rows = []
                for _, row in head_df.iterrows():
                    row_vals = [
                        None if (val != val or val is None) else (
                            float(val) if isinstance(val, (int, float)) and not isinstance(val, bool)
                            else str(val)
                        )
                        for val in row.values
                    ]
                    rows.append(row_vals)

                return DataFrameMetadata(shape=shape, columns=columns, rows=rows)

            # Check numpy 2D array
            if "numpy" in module_name and type_name == "ndarray" and getattr(obj, "ndim", 0) == 2:
                shape = [int(obj.shape[0]), int(obj.shape[1])]
                columns = [{"name": f"col_{i}", "type": str(obj.dtype), "nulls": 0} for i in range(shape[1])]
                head_arr = obj[:10]
                rows = head_arr.tolist()
                return DataFrameMetadata(shape=shape, columns=columns, rows=rows)

        except Exception:
            pass
        return None


# Global singleton instance
kernel_manager = StatefulKernelManager()

import os
import shutil
import subprocess
import sys
import tempfile
import time
from typing import Dict, List, Optional
from backend.app.models.schema import (
    CodeforcesExecuteResponse,
    ScriptExecutionResponse,
    TestCaseResult,
)


def execute_python_script(
    code: str,
    test_code: Optional[str] = None,
    timeout_seconds: int = 10,
) -> ScriptExecutionResponse:
    start_time = time.perf_counter()
    full_code = code
    if test_code:
        full_code = f"{code}\n\n# --- AUTOMATED ASSERTION TESTS ---\n{test_code}"

    with tempfile.NamedTemporaryFile("w", suffix=".py", delete=False, encoding="utf-8") as temp_file:
        temp_file.write(full_code)
        temp_file_path = temp_file.name

    try:
        process = subprocess.run(
            [sys.executable, temp_file_path],
            capture_output=True,
            text=True,
            timeout=timeout_seconds,
            encoding="utf-8",
        )
        elapsed_ms = (time.perf_counter() - start_time) * 1000
        
        passed_asserts = (process.returncode == 0)
        error_msg = None if process.returncode == 0 else process.stderr.strip()

        return ScriptExecutionResponse(
            success=process.returncode == 0,
            stdout=process.stdout,
            stderr=process.stderr,
            exit_code=process.returncode,
            execution_time_ms=round(elapsed_ms, 2),
            passed_asserts=passed_asserts,
            error_message=error_msg,
        )
    except subprocess.TimeoutExpired:
        elapsed_ms = (time.perf_counter() - start_time) * 1000
        return ScriptExecutionResponse(
            success=False,
            stdout="",
            stderr=f"Execution timed out after {timeout_seconds} seconds.",
            exit_code=-1,
            execution_time_ms=round(elapsed_ms, 2),
            passed_asserts=False,
            error_message="Time Limit Exceeded",
        )
    except Exception as exc:
        elapsed_ms = (time.perf_counter() - start_time) * 1000
        return ScriptExecutionResponse(
            success=False,
            stdout="",
            stderr=str(exc),
            exit_code=-1,
            execution_time_ms=round(elapsed_ms, 2),
            passed_asserts=False,
            error_message=str(exc),
        )
    finally:
        if os.path.exists(temp_file_path):
            try:
                os.remove(temp_file_path)
            except OSError:
                pass


def normalize_output(text: str) -> str:
    lines = [line.rstrip() for line in text.strip().splitlines()]
    return "\n".join(lines)


def find_cpp_compiler() -> Optional[str]:
    import shutil
    compiler = shutil.which("g++") or shutil.which("clang++")
    if compiler:
        return compiler
    candidates = [
        r"C:\Program Files\CodeBlocks\MinGW\bin\g++.exe",
        r"C:\MinGW\bin\g++.exe",
        r"C:\msys64\mingw64\bin\g++.exe",
    ]
    for c in candidates:
        if os.path.exists(c):
            return c
    return None


def execute_codeforces_solution(
    code: str,
    test_cases: List[Dict[str, str]],
    timeout_seconds: int = 2,
    language: str = "python",
) -> CodeforcesExecuteResponse:
    is_cpp = language.lower() in ["cpp", "c++"]
    temp_dir = tempfile.mkdtemp()
    results: List[TestCaseResult] = []
    all_passed = True
    total_time_ms = 0.0
    overall_verdict = "ACCEPTED"

    try:
        if is_cpp:
            compiler_bin = find_cpp_compiler()
            if not compiler_bin:
                return CodeforcesExecuteResponse(
                    verdict="COMPILATION_ERROR",
                    all_passed=False,
                    results=[
                        TestCaseResult(
                            case_number=1,
                            input_data="",
                            expected_output="",
                            actual_output="",
                            passed=False,
                            execution_time_ms=0,
                            error_message="Kompilator C++ (g++) tidak ditemukan di PATH sistem.",
                        )
                    ],
                    total_time_ms=0,
                )

            import hashlib
            from backend.app.core.config import settings

            bin_cache_dir = settings.cache_dir / "cpp_bins"
            bin_cache_dir.mkdir(parents=True, exist_ok=True)
            code_hash = hashlib.sha256(code.strip().encode("utf-8")).hexdigest()
            cached_exe = bin_cache_dir / f"{code_hash}.exe"

            if cached_exe.exists() and cached_exe.stat().st_size > 0:
                exec_command = [str(cached_exe)]
            else:
                src_file = os.path.join(temp_dir, "solution.cpp")
                temp_exe = os.path.join(temp_dir, "solution.exe")

                with open(src_file, "w", encoding="utf-8") as f:
                    f.write(code)

                # Compile C++ solution with g++ -O3 -std=c++17
                compile_start = time.perf_counter()
                compile_proc = subprocess.run(
                    [compiler_bin, "-O3", "-std=c++17", src_file, "-o", temp_exe],
                    capture_output=True,
                    text=True,
                    timeout=10,
                )
                if compile_proc.returncode != 0:
                    return CodeforcesExecuteResponse(
                        verdict="COMPILATION_ERROR",
                        all_passed=False,
                        results=[
                            TestCaseResult(
                                case_number=1,
                                input_data="",
                                expected_output="",
                                actual_output="",
                                passed=False,
                                execution_time_ms=round((time.perf_counter() - compile_start) * 1000, 2),
                                error_message=compile_proc.stderr.strip() or "Compilation Error",
                            )
                        ],
                        total_time_ms=round((time.perf_counter() - compile_start) * 1000, 2),
                    )
                # Persist to binary cache for 0ms instant re-execution
                try:
                    shutil.copy2(temp_exe, str(cached_exe))
                except Exception:
                    pass
                exec_command = [temp_exe]
        else:
            py_file = os.path.join(temp_dir, "solution.py")
            with open(py_file, "w", encoding="utf-8") as f:
                f.write(code)
            exec_command = [sys.executable, py_file]

        for idx, tc in enumerate(test_cases, start=1):
            input_data = tc.get("input", "")
            expected_output = tc.get("output", "")

            case_start = time.perf_counter()
            try:
                process = subprocess.run(
                    exec_command,
                    input=input_data,
                    capture_output=True,
                    text=True,
                    timeout=timeout_seconds,
                    encoding="utf-8",
                )
                case_elapsed_ms = (time.perf_counter() - case_start) * 1000
                total_time_ms += case_elapsed_ms

                actual_output = process.stdout
                if process.returncode != 0:
                    all_passed = False
                    overall_verdict = "RUNTIME_ERROR"
                    results.append(
                        TestCaseResult(
                            case_number=idx,
                            input_data=input_data,
                            expected_output=expected_output,
                            actual_output=actual_output,
                            passed=False,
                            execution_time_ms=round(case_elapsed_ms, 2),
                            error_message=process.stderr.strip() or f"Process exited with code {process.returncode}",
                        )
                    )
                    break
                else:
                    is_match = normalize_output(actual_output) == normalize_output(expected_output)
                    if not is_match:
                        all_passed = False
                        if overall_verdict == "ACCEPTED":
                            overall_verdict = "WRONG_ANSWER"
                    results.append(
                        TestCaseResult(
                            case_number=idx,
                            input_data=input_data,
                            expected_output=expected_output,
                            actual_output=actual_output,
                            passed=is_match,
                            execution_time_ms=round(case_elapsed_ms, 2),
                            error_message=None if is_match else "Output does not match expected output.",
                        )
                    )
            except subprocess.TimeoutExpired:
                case_elapsed_ms = (time.perf_counter() - case_start) * 1000
                total_time_ms += case_elapsed_ms
                all_passed = False
                overall_verdict = "TIME_LIMIT_EXCEEDED"
                results.append(
                    TestCaseResult(
                        case_number=idx,
                        input_data=input_data,
                        expected_output=expected_output,
                        actual_output="",
                        passed=False,
                        execution_time_ms=round(case_elapsed_ms, 2),
                        error_message=f"Time limit of {timeout_seconds}s exceeded.",
                    )
                )
                break
    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)

    return CodeforcesExecuteResponse(
        verdict=overall_verdict,
        all_passed=all_passed,
        results=results,
        total_time_ms=round(total_time_ms, 2),
    )

from datetime import datetime, timezone
import functools
import json
from typing import Any, Callable, Dict, Optional
from sqlmodel import Session, select
from backend.app.core.database import engine
from backend.app.models.schema import Dataset, Leaderboard


def track_accuracy(
    model_name: str,
    accuracy: float,
    f1: Optional[float] = None,
    solution_version: Optional[str] = "v1.0",
    parameters: Optional[Dict[str, Any]] = None,
    notebook_id: Optional[int] = None,
    dataset_id: Optional[int] = None,
    dataset_ref: Optional[str] = None,
    pipeline_flow: Optional[str] = None,
    version: Optional[str] = None,
) -> Leaderboard:
    params = dict(parameters or {})
    if pipeline_flow:
        params["pipeline_flow"] = pipeline_flow
    if dataset_ref:
        params["dataset_ref"] = dataset_ref
    effective_version = version or solution_version or "v1.0"
    params["solution_version"] = effective_version

    resolved_dataset_id = dataset_id
    with Session(engine) as session:
        if dataset_ref and not resolved_dataset_id:
            ds = session.exec(select(Dataset).where(Dataset.kaggle_ref == dataset_ref)).first()
            if not ds:
                from backend.app.core.config import settings
                ds = Dataset(kaggle_ref=dataset_ref, local_path=str(settings.datasets_dir / dataset_ref.replace("/", "_")), size_mb=1.0)
                session.add(ds)
                session.commit()
                session.refresh(ds)
            resolved_dataset_id = ds.id

        entry = Leaderboard(
            notebook_id=notebook_id,
            dataset_id=resolved_dataset_id,
            model_name=model_name,
            accuracy_score=float(accuracy),
            f1_score=float(f1) if f1 is not None else None,
            parameters_json=json.dumps(params),
            timestamp=datetime.now(timezone.utc),
        )
        session.add(entry)
        session.commit()
        session.refresh(entry)

    try:
        from backend.app.api.routes import invalidate_leaderboard_cache
        invalidate_leaderboard_cache()
    except Exception:
        pass

    return entry


def lms_track_accuracy(
    model_name: str = "PyTorchModel",
    solution_version: Optional[str] = "v1.0",
    parameters: Optional[Dict[str, Any]] = None,
    notebook_id: Optional[int] = None,
    dataset_id: Optional[int] = None,
    dataset_ref: Optional[str] = None,
    pipeline_flow: Optional[str] = None,
    version: Optional[str] = None,
) -> Callable:
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            result = func(*args, **kwargs)
            acc = 0.0
            f1 = None
            if isinstance(result, tuple) and len(result) >= 2:
                acc = float(result[0])
                f1 = float(result[1])
            elif isinstance(result, (float, int)):
                acc = float(result)
            elif isinstance(result, dict):
                acc = float(result.get("accuracy", 0.0))
                f1 = float(result.get("f1", 0.0)) if "f1" in result else None

            track_accuracy(
                model_name=model_name,
                accuracy=acc,
                f1=f1,
                solution_version=version or solution_version or "v1.0",
                parameters=parameters or {},
                notebook_id=notebook_id,
                dataset_id=dataset_id,
                dataset_ref=dataset_ref,
                pipeline_flow=pipeline_flow,
            )
            return result
        return wrapper
    return decorator

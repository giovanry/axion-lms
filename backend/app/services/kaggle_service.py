from datetime import datetime, timedelta, timezone
import os
from pathlib import Path
import shutil
from typing import Any, Dict, List
from sqlmodel import Session, select
from backend.app.core.config import settings
from backend.app.core.database import engine
from backend.app.models.schema import Dataset, Notebook


def has_kaggle_credentials() -> bool:
    kaggle_home = Path.home() / ".kaggle" / "kaggle.json"
    return kaggle_home.exists() or "KAGGLE_USERNAME" in os.environ


def search_kaggle_datasets(query: str) -> List[Dict[str, Any]]:
    curated = [
        {"ref": "uciml/iris", "title": "Iris Species", "size_mb": 0.01, "description": "Classic classification benchmark dataset."},
        {"ref": "camnugent/california-housing-prices", "title": "California Housing Prices", "size_mb": 0.4, "description": "Spatial regression challenge."},
        {"ref": "blastchar/telco-customer-churn", "title": "Telco Customer Churn", "size_mb": 0.17, "description": "Binary customer churn classification."},
        {"ref": "yasserh/titanic-dataset", "title": "Titanic Dataset", "size_mb": 0.03, "description": "Binary survival classification on the Titanic."},
        {"ref": "zalando-research/fashionmnist", "title": "Fashion MNIST", "size_mb": 30.5, "description": "70,000 28x28 grayscale images of fashion items."},
    ]

    if not has_kaggle_credentials():
        return [d for d in curated if query.lower() in d["ref"].lower() or query.lower() in d["title"].lower()] or curated

    try:
        from kaggle.api.kaggle_api_extended import KaggleApi
        api = KaggleApi()
        api.authenticate()
        datasets = api.dataset_list(search=query)
        results = []
        for d in datasets[:15]:
            total_bytes = getattr(d, "total_bytes", None) or getattr(d, "totalBytes", None) or getattr(d, "size", 0) or 0
            size_mb = round(total_bytes / (1024 * 1024), 2)
            desc = getattr(d, "subtitle", "") or getattr(d, "description", "") or "Dataset dari Kaggle"
            results.append({
                "ref": d.ref,
                "title": d.title,
                "size_mb": size_mb,
                "description": desc,
            })
        return results if results else [d for d in curated if query.lower() in d["ref"].lower() or query.lower() in d["title"].lower()]
    except Exception as exc:
        matched = [d for d in curated if query.lower() in d["ref"].lower() or query.lower() in d["title"].lower()]
        return matched if matched else curated


def fetch_dataset_sync(kaggle_ref: str) -> Dict[str, Any]:
    target_dir = settings.datasets_dir / kaggle_ref.replace("/", "_")
    target_dir.mkdir(parents=True, exist_ok=True)

    size_mb = 0.0
    if has_kaggle_credentials():
        try:
            from kaggle.api.kaggle_api_extended import KaggleApi
            api = KaggleApi()
            api.authenticate()
            api.dataset_download_files(kaggle_ref, path=str(target_dir), unzip=True)
            for file in target_dir.glob("**/*"):
                if file.is_file():
                    size_mb += file.stat().st_size
            size_mb = round(size_mb / (1024 * 1024), 2)
        except Exception as exc:
            return {"success": False, "error": str(exc)}
    else:
        # Create a sample mock dataset for local offline testing
        sample_file = target_dir / "data.csv"
        if not sample_file.exists():
            with open(sample_file, "w", encoding="utf-8") as f:
                f.write("feature_1,feature_2,feature_3,target\n")
                for i in range(100):
                    f.write(f"{i*0.1:.2f},{i*0.2:.2f},{i*0.05:.2f},{i % 2}\n")
        size_mb = 0.01

    with Session(engine) as session:
        existing = session.exec(select(Dataset).where(Dataset.kaggle_ref == kaggle_ref)).first()
        if existing:
            existing.last_accessed = datetime.now(timezone.utc)
            existing.size_mb = size_mb
            session.add(existing)
        else:
            new_dataset = Dataset(
                kaggle_ref=kaggle_ref,
                local_path=str(target_dir),
                size_mb=size_mb,
                last_accessed=datetime.now(timezone.utc),
            )
            session.add(new_dataset)
        session.commit()

    return {"success": True, "local_path": str(target_dir), "size_mb": size_mb}


def cleanup_stale_datasets(retention_days: int = 14) -> Dict[str, Any]:
    cutoff = datetime.now(timezone.utc) - timedelta(days=retention_days)
    purged_count = 0
    reclaimed_mb = 0.0

    with Session(engine) as session:
        referenced_ids = set(
            session.exec(select(Notebook.dataset_id).where(Notebook.dataset_id.is_not(None))).all()
        )
        stale_datasets = session.exec(
            select(Dataset).where(Dataset.last_accessed < cutoff)
        ).all()

        for ds in stale_datasets:
            if ds.id not in referenced_ids:
                local_dir = Path(ds.local_path)
                if local_dir.exists():
                    shutil.rmtree(local_dir, ignore_errors=True)
                reclaimed_mb += ds.size_mb
                session.delete(ds)
                purged_count += 1
        session.commit()

    return {
        "purged_datasets_count": purged_count,
        "reclaimed_mb": round(reclaimed_mb, 2),
    }

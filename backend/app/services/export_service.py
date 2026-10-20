from datetime import datetime
import json
from pathlib import Path
import tempfile
import zipfile
from sqlmodel import Session, select
from backend.app.core.config import settings
from backend.app.core.database import engine
from backend.app.models.schema import Leaderboard, VideoNote


def generate_backup_archive() -> Path:
    temp_dir = Path(tempfile.mkdtemp())
    zip_path = temp_dir / f"olympus_backup_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.zip"

    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        if settings.db_path.exists():
            zf.write(settings.db_path, arcname="database/olympus.db")

        for nb in settings.notebooks_dir.glob("**/*.ipynb"):
            rel = nb.relative_to(settings.notebooks_dir)
            zf.write(nb, arcname=f"notebooks/{rel}")

        with Session(engine) as session:
            notes = session.exec(select(VideoNote)).all()
            notes_data = [
                {
                    "lesson_id": n.lesson_id,
                    "timestamp_seconds": n.timestamp_seconds,
                    "note_text": n.note_text,
                    "created_at": n.created_at.isoformat(),
                }
                for n in notes
            ]
            zf.writestr("notes/video_notes.json", json.dumps(notes_data, indent=2))

            leaderboards = session.exec(select(Leaderboard)).all()
            lb_data = [
                {
                    "notebook_id": lb.notebook_id,
                    "dataset_id": lb.dataset_id,
                    "model_name": lb.model_name,
                    "accuracy_score": lb.accuracy_score,
                    "f1_score": lb.f1_score,
                    "parameters": json.loads(lb.parameters_json),
                    "timestamp": lb.timestamp.isoformat(),
                }
                for lb in leaderboards
            ]
            zf.writestr("leaderboard/experiments.json", json.dumps(lb_data, indent=2))

    return zip_path

from typing import Generator
from sqlmodel import Session, SQLModel, create_engine, select
from backend.app.core.config import settings
from backend.app.models.schema import User

engine = create_engine(
    f"sqlite:///{settings.db_path}",
    echo=False,
    connect_args={"check_same_thread": False},
)


def ensure_database_indexes() -> None:
    index_statements = [
        "CREATE INDEX IF NOT EXISTS ix_notebooks_dataset_id ON notebooks (dataset_id);",
        "CREATE INDEX IF NOT EXISTS ix_notebooks_last_modified ON notebooks (last_modified DESC);",
        "CREATE INDEX IF NOT EXISTS ix_datasets_last_accessed ON datasets (last_accessed DESC);",
        "CREATE INDEX IF NOT EXISTS ix_leaderboard_accuracy_score ON leaderboard (accuracy_score DESC);",
        "CREATE INDEX IF NOT EXISTS ix_leaderboard_dataset_id ON leaderboard (dataset_id);",
        "CREATE INDEX IF NOT EXISTS ix_leaderboard_notebook_id ON leaderboard (notebook_id);",
        "CREATE INDEX IF NOT EXISTS ix_leaderboard_timestamp ON leaderboard (timestamp DESC);",
        "CREATE INDEX IF NOT EXISTS ix_modules_lessons_is_completed ON modules_lessons (is_completed);",
        "CREATE INDEX IF NOT EXISTS ix_modules_lessons_mod_order ON modules_lessons (module_id, order_index);",
        "CREATE INDEX IF NOT EXISTS ix_video_notes_lesson_ts ON video_notes (lesson_id, timestamp_seconds);",
    ]
    with engine.connect() as conn:
        for stmt in index_statements:
            conn.exec_driver_sql(stmt)
        conn.commit()


def init_db() -> None:
    settings.db_path.parent.mkdir(parents=True, exist_ok=True)
    settings.datasets_dir.mkdir(parents=True, exist_ok=True)
    settings.notebooks_dir.mkdir(parents=True, exist_ok=True)
    settings.codeforces_cache_dir.mkdir(parents=True, exist_ok=True)
    
    SQLModel.metadata.create_all(engine)
    ensure_database_indexes()
    
    with Session(engine) as session:
        user = session.exec(select(User).where(User.id == 1)).first()
        if not user:
            default_user = User(id=1, name="Olympus Scholar", daily_streak=0)
            session.add(default_user)
            session.commit()


def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session

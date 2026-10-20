from datetime import date, datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field
from sqlmodel import Field as SQLField, SQLModel


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class LessonType(str, Enum):
    THEORY = "THEORY"
    CODING = "CODING"
    JUPYTER_PROJECT = "JUPYTER_PROJECT"


class User(SQLModel, table=True):
    __tablename__ = "users"

    id: int = SQLField(default=1, primary_key=True)
    name: str = SQLField(default="Olympus Scholar")
    daily_streak: int = SQLField(default=0)
    last_active_date: Optional[date] = SQLField(default=None)
    codeforces_handle: Optional[str] = SQLField(default=None)
    kaggle_username: Optional[str] = SQLField(default=None)


class ModuleLesson(SQLModel, table=True):
    __tablename__ = "modules_lessons"

    id: str = SQLField(primary_key=True)
    module_id: str = SQLField(index=True)
    module_title: str
    title: str
    type: LessonType = SQLField(default=LessonType.THEORY)
    content_path: str
    is_completed: bool = SQLField(default=False, index=True)
    order_index: int = SQLField(default=0, index=True)


class Notebook(SQLModel, table=True):
    __tablename__ = "notebooks"

    id: Optional[int] = SQLField(default=None, primary_key=True)
    title: str
    file_path: str
    dataset_id: Optional[int] = SQLField(default=None, foreign_key="datasets.id", index=True)
    created_at: datetime = SQLField(default_factory=utc_now)
    last_modified: datetime = SQLField(default_factory=utc_now, index=True)


class Dataset(SQLModel, table=True):
    __tablename__ = "datasets"

    id: Optional[int] = SQLField(default=None, primary_key=True)
    kaggle_ref: str = SQLField(index=True)
    local_path: str
    size_mb: float = SQLField(default=0.0)
    last_accessed: datetime = SQLField(default_factory=utc_now, index=True)


class Leaderboard(SQLModel, table=True):
    __tablename__ = "leaderboard"

    id: Optional[int] = SQLField(default=None, primary_key=True)
    notebook_id: Optional[int] = SQLField(default=None, foreign_key="notebooks.id", index=True)
    dataset_id: Optional[int] = SQLField(default=None, foreign_key="datasets.id", index=True)
    accuracy_score: float = SQLField(index=True)
    f1_score: Optional[float] = SQLField(default=None)
    model_name: str
    parameters_json: str = SQLField(default="{}")
    timestamp: datetime = SQLField(default_factory=utc_now, index=True)


class VideoNote(SQLModel, table=True):
    __tablename__ = "video_notes"

    id: Optional[int] = SQLField(default=None, primary_key=True)
    lesson_id: str = SQLField(index=True, foreign_key="modules_lessons.id")
    timestamp_seconds: int = SQLField(index=True)
    note_text: str
    created_at: datetime = SQLField(default_factory=utc_now)


class CodeforcesProblem(SQLModel, table=True):
    __tablename__ = "codeforces_problems"

    id: str = SQLField(primary_key=True)
    contest_id: Optional[int] = SQLField(default=None, index=True)
    index: Optional[str] = SQLField(default=None)
    title: str
    time_limit_ms: int = SQLField(default=1000)
    memory_limit_mb: int = SQLField(default=256)
    statement_en: str
    statement_id: Optional[str] = SQLField(default=None)
    input_specification_en: str = SQLField(default="")
    output_specification_en: str = SQLField(default="")
    input_specification_id: Optional[str] = SQLField(default=None)
    output_specification_id: Optional[str] = SQLField(default=None)
    sample_cases_json: str = SQLField(default="[]")
    last_synced: datetime = SQLField(default_factory=utc_now)


class ScriptExecutionRequest(BaseModel):
    code: str
    test_code: Optional[str] = None
    timeout_seconds: Optional[int] = 10


class ScriptExecutionResponse(BaseModel):
    success: bool
    stdout: str
    stderr: str
    exit_code: int
    execution_time_ms: float
    passed_asserts: bool
    error_message: Optional[str] = None


class CodeforcesExecuteRequest(BaseModel):
    problem_id: str
    code: str
    language: Optional[str] = "python"
    custom_input: Optional[str] = None


class UserUpdateRequest(BaseModel):
    name: Optional[str] = None
    codeforces_handle: Optional[str] = None
    kaggle_username: Optional[str] = None
    kaggle_key: Optional[str] = None


class TestCaseResult(BaseModel):
    case_number: int
    input_data: str
    expected_output: str
    actual_output: str
    passed: bool
    execution_time_ms: float
    error_message: Optional[str] = None


class CodeforcesExecuteResponse(BaseModel):
    verdict: str
    all_passed: bool
    results: List[TestCaseResult]
    total_time_ms: float


class ExplainErrorRequest(BaseModel):
    code: str
    error_output: str
    context: Optional[str] = None


class LeaderboardEntryCreate(BaseModel):
    notebook_id: Optional[int] = None
    dataset_id: Optional[int] = None
    dataset_ref: Optional[str] = None
    pipeline_flow: Optional[str] = None
    accuracy_score: float
    f1_score: Optional[float] = None
    model_name: str
    solution_version: Optional[str] = "v1.0"
    parameters: Dict[str, Any] = Field(default_factory=dict)

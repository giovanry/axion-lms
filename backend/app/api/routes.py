import json
import os
import time
from pathlib import Path
from typing import Any, Dict, List, Optional
import httpx
from pydantic import BaseModel
from fastapi import APIRouter, BackgroundTasks, Depends, File, Form, HTTPException, Query, UploadFile, WebSocket, WebSocketDisconnect
from fastapi.responses import FileResponse, StreamingResponse
from sqlmodel import Session, desc, select
from backend.app.core.config import settings
from backend.app.core.database import get_session
from backend.app.core.cache import memory_cache
from backend.app.models.schema import (
    CodeforcesExecuteRequest,
    CodeforcesExecuteResponse,
    CodeforcesProblem,
    Dataset,
    ExplainErrorRequest,
    Leaderboard,
    LeaderboardEntryCreate,
    Notebook,
    ScriptExecutionRequest,
    ScriptExecutionResponse,
    User,
    UserUpdateRequest,
    VideoNote,
)
from backend.app.services.ai_service import check_ai_status, check_ollama_status, stream_explain_error
from backend.app.services.codeforces_service import (
    fetch_or_get_problem,
    query_problemset,
    translate_and_cache_problem,
)
from backend.app.services.curriculum_service import (
    get_curriculum_tree,
    get_lesson_detail,
    mark_lesson_complete,
)
from backend.app.services.curriculum_ingest_service import (
    ingest_service,
    GeneratedModuleData,
    IngestModuleRequest,
)
from backend.app.services.execution_service import (
    execute_codeforces_solution,
    execute_python_script,
)
from backend.app.services.export_service import generate_backup_archive
from backend.app.services.kaggle_service import (
    cleanup_stale_datasets,
    fetch_dataset_sync,
    search_kaggle_datasets,
)
from backend.app.services.socratic_ai_service import (
    socratic_service,
    YouTubeTranscriptRequest,
    SocraticChatRequest,
)
from backend.app.services.stateful_kernel_service import (
    kernel_manager,
    NotebookExecuteRequest,
    NotebookExecuteResponse,
)

api_router = APIRouter()


# --- User Stats & Account Settings ---
# --- User Stats, Axion Vault & Kaggle Datasets ---
class KaggleJsonUploadRequest(BaseModel):
    username: str
    key: str

class TestGeminiRequest(BaseModel):
    api_key: Optional[str] = None

class FetchDatasetRequest(BaseModel):
    kaggle_ref: str


@api_router.get("/user/stats")
def get_user_stats(session: Session = Depends(get_session)) -> Dict[str, Any]:
    from pathlib import Path
    from backend.app.models.schema import ModuleLesson

    user = session.exec(select(User).where(User.id == 1)).first()
    if not user:
        user = User(id=1, name="Axion Scholar", daily_streak=0)
        session.add(user)
        session.commit()
        session.refresh(user)

    completed_lessons = len(session.exec(select(ModuleLesson.id).where(ModuleLesson.is_completed == True)).all())
    osn_readiness = min(100, 50 + completed_lessons * 4)

    kaggle_path = Path.home() / ".kaggle" / "kaggle.json"
    has_kaggle = kaggle_path.exists() and bool(user.kaggle_username)
    return {
        "id": user.id,
        "name": user.name,
        "daily_streak": user.daily_streak,
        "last_active_date": str(user.last_active_date) if user.last_active_date else None,
        "codeforces_handle": user.codeforces_handle,
        "kaggle_username": user.kaggle_username or None,
        "has_kaggle": has_kaggle,
        "completed_lessons": completed_lessons,
        "hours_learned": round(completed_lessons * 1.5, 1),
        "osn_readiness_score": osn_readiness,
    }


@api_router.post("/vault/kaggle-json")
def upload_kaggle_json(payload: KaggleJsonUploadRequest, session: Session = Depends(get_session)) -> Dict[str, Any]:
    kaggle_dir = Path.home() / ".kaggle"
    kaggle_dir.mkdir(parents=True, exist_ok=True)
    kaggle_file = kaggle_dir / "kaggle.json"
    with open(kaggle_file, "w", encoding="utf-8") as f:
        json.dump({
            "username": payload.username.strip(),
            "key": payload.key.strip(),
        }, f, indent=2)

    user = session.exec(select(User).where(User.id == 1)).first()
    if user:
        user.kaggle_username = payload.username.strip()
        session.add(user)
        session.commit()

    return {
        "success": True,
        "username": payload.username.strip(),
        "message": "Kredensial Kaggle berhasil disimpan di ~/.kaggle/kaggle.json",
        "has_kaggle": True,
    }


@api_router.post("/vault/test-gemini")
async def test_gemini_connection(payload: Optional[TestGeminiRequest] = None) -> Dict[str, Any]:
    key = payload.api_key if (payload and payload.api_key) else settings.gemini_api_key
    if not key:
        return {"success": False, "error": "Kunci GEMINI_API_KEY tidak ditemukan di konfigurasi."}

    start = time.perf_counter()
    try:
        url = f"{settings.gemini_base_url}/models?key={key}"
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(url)
            latency = round((time.perf_counter() - start) * 1000, 2)
            if resp.status_code in [200, 503]:
                return {
                    "success": True,
                    "model": "gemini-3.6-flash",
                    "latency_ms": latency,
                    "message": f"Terhubung ke Google Gemini 3.6 Flash ({latency}ms)",
                }
            else:
                return {
                    "success": False,
                    "error": f"API mengembalikan status {resp.status_code}: {resp.text[:120]}",
                }
    except Exception as exc:
        return {"success": False, "error": str(exc)}


class GeminiKeyRequest(BaseModel):
    api_key: str


@api_router.post("/vault/gemini-key")
def save_gemini_key(payload: GeminiKeyRequest) -> Dict[str, Any]:
    key = payload.api_key.strip()
    settings.gemini_api_key = key
    env_path = settings.base_dir / ".env"
    if env_path.exists():
        lines = env_path.read_text(encoding="utf-8").splitlines()
        found = False
        new_lines = []
        for line in lines:
            if line.startswith("GEMINI_API_KEY="):
                new_lines.append(f'GEMINI_API_KEY="{key}"')
                found = True
            else:
                new_lines.append(line)
        if not found:
            new_lines.append(f'GEMINI_API_KEY="{key}"')
        env_path.write_text("\n".join(new_lines), encoding="utf-8")
    return {"success": True, "message": "Kunci Gemini API berhasil diperbarui."}


@api_router.get("/kaggle/search")
def search_datasets(q: str = Query("")) -> List[Dict[str, Any]]:
    return search_kaggle_datasets(q)


@api_router.post("/kaggle/fetch")
def fetch_dataset(payload: FetchDatasetRequest) -> Dict[str, Any]:
    return fetch_dataset_sync(payload.kaggle_ref)


@api_router.post("/user/settings")
def update_user_settings(payload: UserUpdateRequest, session: Session = Depends(get_session)) -> Dict[str, Any]:
    user = session.exec(select(User).where(User.id == 1)).first()
    if not user:
        user = User(id=1, name="Axion Scholar", daily_streak=0)
        session.add(user)

    if payload.name:
        user.name = payload.name
    if payload.codeforces_handle is not None:
        user.codeforces_handle = payload.codeforces_handle.strip()
    if payload.kaggle_username is not None:
        user.kaggle_username = payload.kaggle_username.strip()

    session.add(user)
    session.commit()
    return {"success": True, "message": "Pengaturan akun berhasil disimpan."}


@api_router.post("/user/reset")
def reset_all_user_data(session: Session = Depends(get_session)) -> Dict[str, Any]:
    from backend.app.models.schema import ModuleLesson, Notebook, VideoNote

    # 1. Reset user table to clean slate
    user = session.exec(select(User).where(User.id == 1)).first()
    if not user:
        user = User(id=1, name="Axion Scholar", daily_streak=0)
        session.add(user)
    else:
        user.name = "Axion Scholar"
        user.daily_streak = 0
        user.last_active_date = None
        user.codeforces_handle = None
        user.kaggle_username = None
        session.add(user)

    # 2. Reset completed lessons
    lessons = session.exec(select(ModuleLesson)).all()
    for l in lessons:
        if l.is_completed:
            l.is_completed = False
            session.add(l)

    # 3. Clear video notes
    notes = session.exec(select(VideoNote)).all()
    for n in notes:
        session.delete(n)

    # 4. Clear notebooks
    nbs = session.exec(select(Notebook)).all()
    for nb in nbs:
        session.delete(nb)

    session.commit()

    # 5. Clean notebooks directory
    if settings.notebooks_dir.exists():
        for p in settings.notebooks_dir.glob("*.ipynb"):
            try:
                p.unlink(missing_ok=True)
            except Exception:
                pass

    # Invalidate cache
    memory_cache.invalidate("curriculum_tree")

    return {
        "success": True,
        "message": "Semua data pengguna, riwayat progres materi, notebook, dan catatan berhasil direset total."
    }


@api_router.get("/codeforces/user/{handle}")
async def get_codeforces_user_profile(handle: str) -> Dict[str, Any]:
    import httpx
    url = f"https://codeforces.com/api/user.info?handles={handle.strip()}"
    try:
        async with httpx.AsyncClient(timeout=6.0) as client:
            resp = await client.get(url)
            if resp.status_code == 200:
                data = resp.json()
                if data.get("status") == "OK" and len(data.get("result", [])) > 0:
                    user_info = data["result"][0]
                    return {
                        "handle": user_info.get("handle"),
                        "rank": user_info.get("rank", "unrated"),
                        "rating": user_info.get("rating", 0),
                        "max_rank": user_info.get("maxRank", "unrated"),
                        "max_rating": user_info.get("maxRating", 0),
                        "avatar": user_info.get("titlePhoto"),
                    }
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Gagal mengambil profil Codeforces: {str(exc)}")

    raise HTTPException(status_code=404, detail="Handle Codeforces tidak ditemukan.")


# --- Curriculum Endpoints ---
@api_router.get("/curriculum")
def list_curriculum() -> List[Dict[str, Any]]:
    return get_curriculum_tree()


@api_router.get("/lessons/{lesson_id}")
def read_lesson(lesson_id: str) -> Dict[str, Any]:
    detail = get_lesson_detail(lesson_id)
    if not detail:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return detail


@api_router.post("/lessons/{lesson_id}/complete")
def complete_lesson(lesson_id: str) -> Dict[str, Any]:
    return mark_lesson_complete(lesson_id)


# --- Code Execution Endpoints ---
@api_router.post("/execute/script", response_model=ScriptExecutionResponse)
def execute_script(payload: ScriptExecutionRequest) -> ScriptExecutionResponse:
    return execute_python_script(
        code=payload.code,
        test_code=payload.test_code,
        timeout_seconds=payload.timeout_seconds or 10,
    )


@api_router.post("/execute/codeforces", response_model=CodeforcesExecuteResponse)
async def execute_codeforces(payload: CodeforcesExecuteRequest) -> CodeforcesExecuteResponse:
    problem = await fetch_or_get_problem(payload.problem_id)
    if not problem:
        raise HTTPException(status_code=404, detail="Codeforces problem not found.")

    test_cases: List[Dict[str, str]] = []
    if payload.custom_input is not None and payload.custom_input.strip():
        test_cases = [{"input": payload.custom_input, "output": ""}]
    else:
        test_cases = problem.get("sample_cases", [])

    if not test_cases:
        test_cases = [{"input": "", "output": ""}]

    return execute_codeforces_solution(
        code=payload.code,
        test_cases=test_cases,
        timeout_seconds=problem.get("time_limit_ms", 1000) // 1000 + 1,
        language=payload.language or "python",
    )


# --- Stateful Interactive Notebook & Auto-Grader ---
@api_router.post("/notebook/execute", response_model=NotebookExecuteResponse)
def execute_notebook_cell(payload: NotebookExecuteRequest, session: Session = Depends(get_session)) -> NotebookExecuteResponse:
    res = kernel_manager.execute(
        session_id=payload.session_id,
        code=payload.code,
        test_assertions=payload.test_assertions,
        reset_first=payload.reset_session,
    )

    # If assertions passed on a curriculum module, update lesson progress & streak
    if payload.test_assertions and res.passed_asserts and res.success:
        try:
            mark_lesson_complete(payload.session_id)
        except Exception:
            pass

    return res


@api_router.post("/notebook/reset/{session_id}")
def reset_notebook_session(session_id: str) -> Dict[str, Any]:
    kernel_manager.reset_session(session_id)
    return {
        "session_id": session_id,
        "status": "reset",
        "message": "Kernel namespace reset successfully."
    }


@api_router.websocket("/execute/kernel/{notebook_id}")
async def websocket_kernel(websocket: WebSocket, notebook_id: str):
    await websocket.accept()
    try:
        await websocket.send_text(json.dumps({
            "type": "kernel_status",
            "status": "ready",
            "message": f"Connected to stateful kernel for {notebook_id}",
        }))
        while True:
            data = await websocket.receive_text()
            payload = json.loads(data)
            code = payload.get("code", "")
            test_code = payload.get("test_assertions", None)
            res = kernel_manager.execute(
                session_id=notebook_id,
                code=code,
                test_assertions=test_code,
            )
            await websocket.send_text(json.dumps({
                "type": "execution_result",
                "stdout": res.stdout,
                "stderr": res.stderr,
                "success": res.success,
                "dataframe": res.dataframe.model_dump() if res.dataframe else None,
                "plot_base64": res.plot_base64,
                "passed_asserts": res.passed_asserts,
                "execution_time_ms": res.execution_time_ms,
                "error_message": res.error_message,
            }))
    except WebSocketDisconnect:
        pass


# --- Codeforces Problems & Indonesian Translation ---
@api_router.get("/codeforces/problems")
def list_codeforces_problems(
    limit: int = 50,
    offset: int = 0,
    session: Session = Depends(get_session),
) -> List[Dict[str, Any]]:
    # Hindari SELECT * pada kolom teks statement/sample cases raksasa; proyeksikan kolom esensial saja
    stmt = (
        select(
            CodeforcesProblem.id,
            CodeforcesProblem.title,
            CodeforcesProblem.contest_id,
            CodeforcesProblem.index,
            CodeforcesProblem.time_limit_ms,
            CodeforcesProblem.statement_id,
        )
        .order_by(CodeforcesProblem.contest_id, CodeforcesProblem.index)
        .offset(offset)
        .limit(limit)
    )
    rows = session.exec(stmt).all()
    return [
        {
            "id": r[0],
            "title": r[1],
            "contest_id": r[2],
            "index": r[3],
            "time_limit_ms": r[4],
            "has_translation": bool(r[5] and not r[5].startswith("[Terjemahan otomatis")),
        }
        for r in rows
    ]


@api_router.get("/codeforces/problemset")
async def get_codeforces_problemset(
    q: Optional[str] = Query(None),
    rating: Optional[int] = Query(None),
    tag: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
) -> Dict[str, Any]:
    return await query_problemset(search=q, rating=rating, tag=tag, limit=limit, offset=offset)


@api_router.get("/codeforces/problem/{problem_id}")
async def get_codeforces_problem(problem_id: str) -> Dict[str, Any]:
    prob = await fetch_or_get_problem(problem_id)
    if not prob:
        raise HTTPException(status_code=404, detail="Codeforces problem could not be found or loaded.")
    return prob


@api_router.post("/codeforces/problem/add")
async def add_codeforces_problem(payload: Dict[str, str]) -> Dict[str, Any]:
    raw_id = payload.get("problem_id", "").strip().upper()
    if not raw_id:
        raise HTTPException(status_code=400, detail="Kode problem ID tidak boleh kosong.")
    prob = await fetch_or_get_problem(raw_id)
    if not prob:
        raise HTTPException(
            status_code=404,
            detail=f"Soal '{raw_id}' tidak ditemukan di Codeforces. Pastikan format benar (contoh: 1A, 71A, 231A).",
        )
    return prob


@api_router.post("/codeforces/translate")
async def translate_codeforces_problem(payload: Dict[str, str]) -> Dict[str, Any]:
    problem_id = payload.get("problem_id")
    if not problem_id:
        raise HTTPException(status_code=400, detail="Missing problem_id")
    translated = await translate_and_cache_problem(problem_id)
    if not translated:
        raise HTTPException(status_code=404, detail="Problem could not be translated")
    return translated


# --- Kaggle Datasets ---
@api_router.get("/datasets/search")
def search_datasets(q: str = Query(..., min_length=1)) -> List[Dict[str, Any]]:
    return search_kaggle_datasets(q)


@api_router.post("/datasets/fetch")
def fetch_dataset(payload: Dict[str, str], background_tasks: BackgroundTasks) -> Dict[str, Any]:
    kaggle_ref = payload.get("kaggle_ref")
    if not kaggle_ref:
        raise HTTPException(status_code=400, detail="Missing kaggle_ref")
    background_tasks.add_task(fetch_dataset_sync, kaggle_ref)
    return {"message": f"Download task initiated for {kaggle_ref}", "status": "downloading"}


@api_router.get("/datasets/cleanup")
def cleanup_datasets() -> Dict[str, Any]:
    return cleanup_stale_datasets()


@api_router.get("/datasets/local")
def list_local_datasets(
    limit: int = 50,
    offset: int = 0,
    session: Session = Depends(get_session),
) -> List[Dict[str, Any]]:
    stmt = (
        select(Dataset.id, Dataset.kaggle_ref, Dataset.local_path, Dataset.size_mb, Dataset.last_accessed)
        .order_by(desc(Dataset.last_accessed))
        .offset(offset)
        .limit(limit)
    )
    datasets = session.exec(stmt).all()
    return [
        {
            "id": d[0],
            "kaggle_ref": d[1],
            "local_path": d[2],
            "size_mb": d[3],
            "last_accessed": d[4].isoformat() if hasattr(d[4], "isoformat") else str(d[4]),
        }
        for d in datasets
    ]


@api_router.get("/datasets/files")
def get_dataset_files(
    ref: Optional[str] = Query(None),
    dataset_id: Optional[int] = Query(None),
    session: Session = Depends(get_session),
) -> Dict[str, Any]:
    target_path = None
    dataset_name = ref or "dataset"

    if dataset_id:
        ds = session.get(Dataset, dataset_id)
        if ds:
            target_path = Path(ds.local_path)
            dataset_name = ds.kaggle_ref
    elif ref:
        ds = session.exec(select(Dataset).where(Dataset.kaggle_ref == ref)).first()
        if ds:
            target_path = Path(ds.local_path)
        else:
            folder_candidate = settings.datasets_dir / ref.replace("/", "_")
            if folder_candidate.exists():
                target_path = folder_candidate

    files_list = []
    if target_path and target_path.exists():
        for root, _, files in os.walk(target_path):
            for file in files:
                full_p = Path(root) / file
                try:
                    rel_p = full_p.relative_to(target_path)
                    files_list.append({
                        "name": file,
                        "relative_path": str(rel_p).replace("\\", "/"),
                        "full_path": str(full_p).replace("\\", "/"),
                        "size_bytes": full_p.stat().st_size,
                        "extension": full_p.suffix.lower(),
                    })
                except Exception:
                    pass

    return {
        "dataset_ref": dataset_name,
        "input_directory": f"/kaggle/input/{dataset_name.split('/')[-1]}",
        "files": files_list,
    }


# --- Notebooks (Kaggle-style Workspace) ---
@api_router.get("/notebooks")
def list_notebooks(
    limit: int = 50,
    offset: int = 0,
    session: Session = Depends(get_session),
) -> List[Dict[str, Any]]:
    # Eager outer join Notebook dengan Dataset untuk mengeliminasi 100% N+1 query problem
    stmt = (
        select(Notebook, Dataset.kaggle_ref)
        .outerjoin(Dataset, Notebook.dataset_id == Dataset.id)
        .order_by(desc(Notebook.last_modified))
        .offset(offset)
        .limit(limit)
    )
    rows = session.exec(stmt).all()
    res = []
    for nb, ds_ref in rows:
        res.append({
            "id": nb.id,
            "title": nb.title,
            "dataset_ref": ds_ref,
            "dataset_id": nb.dataset_id,
            "file_path": nb.file_path,
            "created_at": nb.created_at.isoformat(),
            "last_modified": nb.last_modified.isoformat(),
        })
    return res


@api_router.post("/notebooks")
def create_notebook(payload: Dict[str, Any], session: Session = Depends(get_session)) -> Dict[str, Any]:
    from datetime import datetime, timezone
    title = payload.get("title") or "Untitled Kaggle Notebook"
    dataset_ref = payload.get("dataset_ref")
    dataset_id = payload.get("dataset_id")

    if dataset_ref and not dataset_id:
        ds = session.exec(select(Dataset).where(Dataset.kaggle_ref == dataset_ref)).first()
        if ds:
            dataset_id = ds.id

    settings.notebooks_dir.mkdir(parents=True, exist_ok=True)
    slug = "".join(c if c.isalnum() else "_" for c in title.lower())
    timestamp_str = datetime.now().strftime("%Y%m%d_%H%M%S")
    file_name = f"{slug}_{timestamp_str}.ipynb"
    file_path = settings.notebooks_dir / file_name

    clean_ref = dataset_ref or "dataset"
    short_dir = clean_ref.split("/")[-1]

    initial_code = (
        "# This Python 3 environment comes with many helpful analytics libraries installed\n"
        "# It is defined by the Olympus / Kaggle environment\n"
        "import numpy as np # linear algebra\n"
        "import pandas as pd # data processing, CSV file I/O (e.g. pd.read_csv)\n"
        "import os\n\n"
        f"# Input data files are available in the '/kaggle/input/{short_dir}' directory\n"
        "for dirname, _, filenames in os.walk('data/datasets'):\n"
        "    for filename in filenames:\n"
        "        print(os.path.join(dirname, filename))\n"
    )

    initial_cells = [
        {
            "id": "cell_1",
            "type": "markdown",
            "content": f"# {title}\n\nAnalisis Data Eksploratif (EDA) dan Pemodelan Machine Learning.",
            "output": "",
            "execution_count": None,
        },
        {
            "id": "cell_2",
            "type": "code",
            "content": initial_code,
            "output": "",
            "execution_count": None,
        },
    ]

    with open(file_path, "w", encoding="utf-8") as f:
        json.dump({"cells": initial_cells}, f, indent=2)

    nb = Notebook(
        title=title,
        file_path=str(file_path),
        dataset_id=dataset_id,
        created_at=datetime.now(timezone.utc),
        last_modified=datetime.now(timezone.utc),
    )
    session.add(nb)
    session.commit()
    session.refresh(nb)

    return {
        "id": nb.id,
        "title": nb.title,
        "dataset_id": nb.dataset_id,
        "dataset_ref": dataset_ref,
        "file_path": nb.file_path,
        "cells": initial_cells,
    }


@api_router.get("/notebooks/{notebook_id}")
def get_notebook(notebook_id: int, session: Session = Depends(get_session)) -> Dict[str, Any]:
    from datetime import datetime, timezone

    nb = session.get(Notebook, notebook_id)
    if not nb:
        raise HTTPException(status_code=404, detail="Notebook not found")

    # Update last_modified so recently opened notebooks are tracked
    nb.last_modified = datetime.now(timezone.utc)
    session.add(nb)
    session.commit()
    session.refresh(nb)

    ds = session.get(Dataset, nb.dataset_id) if nb.dataset_id else None
    cells = []
    if os.path.exists(nb.file_path):
        try:
            with open(nb.file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                cells = data.get("cells", [])
        except Exception:
            cells = []

    return {
        "id": nb.id,
        "title": nb.title,
        "dataset_id": nb.dataset_id,
        "dataset_ref": ds.kaggle_ref if ds else None,
        "file_path": nb.file_path,
        "cells": cells,
        "created_at": nb.created_at.isoformat(),
        "last_modified": nb.last_modified.isoformat(),
    }


@api_router.put("/notebooks/{notebook_id}")
def update_notebook(notebook_id: int, payload: Dict[str, Any], session: Session = Depends(get_session)) -> Dict[str, Any]:
    from datetime import datetime, timezone

    nb = session.get(Notebook, notebook_id)
    if not nb:
        raise HTTPException(status_code=404, detail="Notebook not found")

    if "title" in payload and payload["title"]:
        nb.title = payload["title"]

    nb.last_modified = datetime.now(timezone.utc)

    if "cells" in payload:
        cells = payload["cells"]
        try:
            with open(nb.file_path, "w", encoding="utf-8") as f:
                json.dump({"cells": cells}, f, indent=2)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to save notebook: {str(e)}")

    session.add(nb)
    session.commit()
    session.refresh(nb)

    return {
        "message": "Notebook saved successfully",
        "id": nb.id,
        "last_modified": nb.last_modified.isoformat(),
    }


# --- AI Assistant (Gemini 3.6 Primary, Llama Fallback) ---
@api_router.get("/ai/status")
async def get_ai_status() -> Dict[str, Any]:
    return await check_ai_status()


@api_router.post("/ai/explain-error")
async def explain_error(payload: ExplainErrorRequest):
    async def sse_generator():
        async for chunk in stream_explain_error(
            code=payload.code,
            error_output=payload.error_output,
            context=payload.context,
        ):
            yield f"data: {json.dumps({'text': chunk})}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(sse_generator(), media_type="text/event-stream")


# --- Video Notes ---
@api_router.get("/notes/{lesson_id}")
def list_video_notes(lesson_id: str, session: Session = Depends(get_session)) -> List[Dict[str, Any]]:
    notes = session.exec(
        select(VideoNote)
        .where(VideoNote.lesson_id == lesson_id)
        .order_by(VideoNote.timestamp_seconds)
    ).all()
    return [
        {
            "id": n.id,
            "lesson_id": n.lesson_id,
            "timestamp_seconds": n.timestamp_seconds,
            "note_text": n.note_text,
            "created_at": n.created_at.isoformat(),
        }
        for n in notes
    ]


@api_router.post("/notes")
def create_video_note(payload: Dict[str, Any], session: Session = Depends(get_session)) -> Dict[str, Any]:
    note = VideoNote(
        lesson_id=payload["lesson_id"],
        timestamp_seconds=int(payload.get("timestamp_seconds", 0)),
        note_text=payload["note_text"],
    )
    session.add(note)
    session.commit()
    session.refresh(note)
    return {"id": note.id, "success": True}


# --- Leaderboard & Experiment Tracking (Per-Dataset Pipelines) ---
def seed_initial_leaderboard_data():
    from backend.app.core.database import engine

    with Session(engine) as session:
        # Ensure seed datasets exist in DB so competitions are registered
        datasets_meta = [
            {"kaggle_ref": "uciml/iris", "local_path": str(settings.datasets_dir / "uciml_iris"), "size_mb": 0.02},
            {"kaggle_ref": "heptapod/titanic", "local_path": str(settings.datasets_dir / "heptapod_titanic"), "size_mb": 0.06},
            {"kaggle_ref": "zalando-research/fashionmnist", "local_path": str(settings.datasets_dir / "fashionmnist"), "size_mb": 30.5},
            {"kaggle_ref": "camnugent/california-housing-prices", "local_path": str(settings.datasets_dir / "california_housing"), "size_mb": 1.4},
        ]
        for d in datasets_meta:
            found = session.exec(select(Dataset).where(Dataset.kaggle_ref == d["kaggle_ref"])).first()
            if not found:
                found = Dataset(kaggle_ref=d["kaggle_ref"], local_path=d["local_path"], size_mb=d["size_mb"])
                session.add(found)
                session.commit()
                session.refresh(found)


KAGGLE_COMPETITIONS_META: Dict[str, Dict[str, str]] = {
    "uciml/iris": {
        "competition_title": "Iris Species Classification Challenge",
        "category": "Getting Started",
        "badge": "Knowledge Competition",
        "problem_statement": "Klasifikasikan spesies bunga Iris (Setosa, Versicolour, Virginica) berdasarkan fitur morfologi sepal dan petal.",
        "evaluation_metric": "Categorical Accuracy (Multi-Class)",
        "dataset_rows": "150 sampel, 4 fitur",
        "overview_markdown": "Tantangan klasifikasi bunga Iris klasik dari Fisher. Gunakan teknik preprocessing, reduksi dimensi (PCA), dan algoritma klasifikasi (XGBoost, SVM, MLP) untuk mencapai akurasi tertinggi.",
    },
    "heptapod/titanic": {
        "competition_title": "Titanic: Machine Learning from Disaster",
        "category": "Getting Started",
        "badge": "Featured Tabular",
        "problem_statement": "Prediksi probabilitas kelangsungan hidup penumpang kapal Titanic berdasarkan data sosiodemografis dan tiket perjalanan.",
        "evaluation_metric": "Binary Classification Accuracy",
        "dataset_rows": "891 sampel latih, 12 fitur",
        "overview_markdown": "Tantangan legendaris Kaggle: Memprediksi siapa yang selamat dari bencana kapal Titanic. Uji rekayasa fitur (gelar penumpang, ukuran keluarga, dek kabin) dan algoritma boosting (CatBoost, LightGBM).",
    },
    "zalando-research/fashionmnist": {
        "competition_title": "Fashion-MNIST Clothing Classification",
        "category": "Computer Vision",
        "badge": "Vision Challenge",
        "problem_statement": "Klasifikasikan citra pakaian berukuran 28x28 grayscale ke dalam 10 kategori busana Zalando.",
        "evaluation_metric": "Macro F1-Score & Accuracy",
        "dataset_rows": "70.000 citra, 28x28 grayscale",
        "overview_markdown": "Dataset benchmark visi komputer modern yang menggantikan MNIST klasik. Tantang arsitektur Deep Learning (Convolutional Neural Networks / ViT) untuk mengklasifikasikan 10 kategori pakaian.",
    },
    "camnugent/california-housing-prices": {
        "competition_title": "California Housing Price Prediction",
        "category": "Tabular",
        "badge": "Tabular Regression",
        "problem_statement": "Prediksi median harga rumah di berbagai distrik California berdasarkan fitur geografis dan sosioekonomi.",
        "evaluation_metric": "R2 Score / RMSE",
        "dataset_rows": "20.640 baris, 10 fitur",
        "overview_markdown": "Tantangan prediksi regresi harga properti California. Gunakan rekayasa fitur geospasial, imputasi nilai hilang, dan algoritma regresi (XGBoost Regressor, LightGBM, Random Forest).",
    },
}

_LEADERBOARD_BY_DATASET_CACHE: Optional[List[Dict[str, Any]]] = None


def invalidate_leaderboard_cache():
    global _LEADERBOARD_BY_DATASET_CACHE
    _LEADERBOARD_BY_DATASET_CACHE = None
    memory_cache.invalidate("leaderboard_by_dataset")


@api_router.get("/leaderboard/by-dataset")
def list_leaderboard_by_dataset(session: Session = Depends(get_session)) -> List[Dict[str, Any]]:
    global _LEADERBOARD_BY_DATASET_CACHE
    cached = memory_cache.get("leaderboard_by_dataset")
    if cached is not None:
        return cached
    if _LEADERBOARD_BY_DATASET_CACHE is not None:
        return _LEADERBOARD_BY_DATASET_CACHE

    datasets = session.exec(select(Dataset)).all()
    ds_lookup = {d.id: d.kaggle_ref for d in datasets}

    all_runs = session.exec(select(Leaderboard).order_by(desc(Leaderboard.accuracy_score))).all()

    grouped: Dict[str, Dict[str, Any]] = {}
    for d in datasets:
        meta = KAGGLE_COMPETITIONS_META.get(d.kaggle_ref, {})
        title = meta.get("competition_title") or d.kaggle_ref.split("/")[-1].replace("-", " ").replace("_", " ").title()
        grouped[d.kaggle_ref] = {
            "dataset_ref": d.kaggle_ref,
            "dataset_id": d.id,
            "dataset_title": title,
            "runs": [],
        }

    for r in all_runs:
        params: Dict[str, Any] = {}
        try:
            params = json.loads(r.parameters_json)
        except Exception:
            params = {}

        d_ref = params.get("dataset_ref") or (ds_lookup.get(r.dataset_id) if r.dataset_id else None) or "uciml/iris"
        if d_ref not in grouped:
            meta = KAGGLE_COMPETITIONS_META.get(d_ref, {})
            title = meta.get("competition_title") or d_ref.split("/")[-1].replace("-", " ").replace("_", " ").title()
            grouped[d_ref] = {
                "dataset_ref": d_ref,
                "dataset_id": r.dataset_id,
                "dataset_title": title,
                "runs": [],
            }

        pipeline_flow = params.get("pipeline_flow") or f"Standard Pipeline ({r.model_name})"
        solution_version = params.get("solution_version") or params.get("version") or "v1.0"
        grouped[d_ref]["runs"].append({
            "id": r.id,
            "notebook_id": r.notebook_id,
            "dataset_id": r.dataset_id,
            "dataset_ref": d_ref,
            "model_name": r.model_name,
            "solution_version": solution_version,
            "pipeline_flow": pipeline_flow,
            "accuracy_score": r.accuracy_score,
            "f1_score": r.f1_score,
            "parameters": {k: v for k, v in params.items() if k not in ["pipeline_flow", "dataset_ref", "solution_version", "version"]},
            "timestamp": r.timestamp.isoformat(),
        })

    result = []
    for d_ref, group in grouped.items():
        runs = group["runs"]
        # Sort runs by accuracy descending
        runs.sort(key=lambda x: x["accuracy_score"], reverse=True)
        for rank_idx, run in enumerate(runs, start=1):
            run["rank"] = rank_idx
            run["is_best"] = (rank_idx == 1)

        best_run = runs[0] if runs else None
        meta = KAGGLE_COMPETITIONS_META.get(d_ref, {
            "competition_title": group["dataset_title"],
            "category": "Tabular",
            "badge": "Community Challenge",
            "problem_statement": f"Tantangan evaluasi model prediksi pada dataset {d_ref}.",
            "evaluation_metric": "Classification Accuracy",
            "dataset_rows": "Dataset Lokal",
            "overview_markdown": f"Kompetisi analisis machine learning untuk dataset {d_ref}.",
        })

        result.append({
            "dataset_ref": d_ref,
            "dataset_id": group["dataset_id"],
            "dataset_title": meta.get("competition_title", group["dataset_title"]),
            "category": meta.get("category", "Getting Started"),
            "badge": meta.get("badge", "Knowledge Competition"),
            "problem_statement": meta.get("problem_statement", ""),
            "evaluation_metric": meta.get("evaluation_metric", "Accuracy"),
            "dataset_rows": meta.get("dataset_rows", "Tersedia"),
            "overview_markdown": meta.get("overview_markdown", ""),
            "total_models": len(runs),
            "best_accuracy": best_run["accuracy_score"] if best_run else 0.0,
            "best_model": best_run["model_name"] if best_run else "-",
            "best_version": best_run["solution_version"] if best_run else "-",
            "best_pipeline": best_run["pipeline_flow"] if best_run else "-",
            "runs": runs,
        })

    _LEADERBOARD_BY_DATASET_CACHE = result
    memory_cache.set("leaderboard_by_dataset", result, ttl=300)
    return result


@api_router.get("/leaderboard")
def list_leaderboard(
    dataset_id: Optional[int] = None,
    dataset_ref: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    session: Session = Depends(get_session),
) -> List[Dict[str, Any]]:
    # Eager outerjoin with Dataset to prevent N+1 query and avoid loading all datasets
    query = (
        select(Leaderboard, Dataset.kaggle_ref)
        .outerjoin(Dataset, Leaderboard.dataset_id == Dataset.id)
    )
    if dataset_id is not None:
        query = query.where(Leaderboard.dataset_id == dataset_id)
    elif dataset_ref is not None:
        query = query.where(Dataset.kaggle_ref == dataset_ref)

    query = query.order_by(desc(Leaderboard.accuracy_score)).offset(offset).limit(limit)
    results = session.exec(query).all()

    res = []
    for r, k_ref in results:
        params: Dict[str, Any] = {}
        try:
            params = json.loads(r.parameters_json)
        except Exception:
            params = {}

        d_ref = params.get("dataset_ref") or k_ref or "general"
        if dataset_ref and d_ref != dataset_ref:
            continue

        pipeline_flow = params.get("pipeline_flow") or f"Standard Pipeline ({r.model_name})"
        solution_version = params.get("solution_version") or params.get("version") or "v1.0"
        res.append({
            "id": r.id,
            "notebook_id": r.notebook_id,
            "dataset_id": r.dataset_id,
            "dataset_ref": d_ref,
            "model_name": r.model_name,
            "solution_version": solution_version,
            "pipeline_flow": pipeline_flow,
            "accuracy_score": r.accuracy_score,
            "f1_score": r.f1_score,
            "parameters": {k: v for k, v in params.items() if k not in ["pipeline_flow", "dataset_ref", "solution_version", "version"]},
            "timestamp": r.timestamp.isoformat(),
        })
    return res


@api_router.post("/leaderboard")
@api_router.post("/leaderboard/record")
def record_leaderboard(payload: LeaderboardEntryCreate, session: Session = Depends(get_session)) -> Dict[str, Any]:
    resolved_dataset_id = payload.dataset_id
    if payload.dataset_ref and not resolved_dataset_id:
        ds = session.exec(select(Dataset).where(Dataset.kaggle_ref == payload.dataset_ref)).first()
        if not ds:
            ds = Dataset(
                kaggle_ref=payload.dataset_ref,
                local_path=str(settings.datasets_dir / payload.dataset_ref.replace("/", "_")),
                size_mb=1.0,
            )
            session.add(ds)
            session.commit()
            session.refresh(ds)
        resolved_dataset_id = ds.id

    params = dict(payload.parameters)
    if payload.pipeline_flow:
        params["pipeline_flow"] = payload.pipeline_flow
    if payload.dataset_ref:
        params["dataset_ref"] = payload.dataset_ref
    if payload.solution_version:
        params["solution_version"] = payload.solution_version

    entry = Leaderboard(
        notebook_id=payload.notebook_id,
        dataset_id=resolved_dataset_id,
        model_name=payload.model_name,
        accuracy_score=payload.accuracy_score,
        f1_score=payload.f1_score,
        parameters_json=json.dumps(params),
    )
    session.add(entry)
    session.commit()
    session.refresh(entry)
    invalidate_leaderboard_cache()
    return {"id": entry.id, "success": True}


# --- Backup & Export ---
@api_router.get("/export/backup")
def export_backup():
    zip_path = generate_backup_archive()
    return FileResponse(
        path=str(zip_path),
        filename=zip_path.name,
        media_type="application/zip",
    )


# --- Milestone 5: Smart Dropzone Curriculum Ingestion & Socratic AI Tutor ---

@api_router.post("/curriculum/ingest")
async def ingest_curriculum_document(
    file: Optional[UploadFile] = File(None),
    raw_text: Optional[str] = Form(None),
    target_track_id: str = Form("track_2"),
    youtube_url: Optional[str] = Form(None),
    custom_title: Optional[str] = Form(None),
):
    extracted_text = ""
    if file:
        temp_dir = settings.workspace_dir / "uploads"
        temp_dir.mkdir(parents=True, exist_ok=True)
        temp_path = temp_dir / file.filename
        try:
            content = await file.read()
            with open(temp_path, "wb") as f:
                f.write(content)
            extracted_text = ingest_service.extract_text_from_file(temp_path)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Gagal memproses file upload: {e}")
        finally:
            if temp_path.exists():
                try:
                    os.remove(temp_path)
                except Exception:
                    pass
    elif raw_text and raw_text.strip():
        extracted_text = raw_text.strip()
    else:
        raise HTTPException(status_code=400, detail="Wajib mengunggah file materi atau menyertakan raw_text.")

    module_data = await ingest_service.generate_curriculum_module(
        content_text=extracted_text,
        target_track_id=target_track_id,
        youtube_url=youtube_url,
        custom_title=custom_title,
    )
    return module_data


@api_router.post("/curriculum/ingest-json")
async def ingest_curriculum_json(req: IngestModuleRequest):
    if not req.raw_text or not req.raw_text.strip():
        raise HTTPException(status_code=400, detail="raw_text tidak boleh kosong.")
    module_data = await ingest_service.generate_curriculum_module(
        content_text=req.raw_text.strip(),
        target_track_id=req.target_track_id or "track_2",
        youtube_url=req.youtube_url,
        custom_title=req.module_title,
    )
    return module_data


@api_router.post("/curriculum/commit")
def commit_curriculum_module(module_data: GeneratedModuleData):
    return ingest_service.commit_module_to_curriculum(module_data)


@api_router.post("/ai/youtube-transcript")
def get_youtube_transcript(req: YouTubeTranscriptRequest):
    return socratic_service.fetch_youtube_transcript(req.video_url)


@api_router.post("/ai/socratic-chat")
async def socratic_chat(req: SocraticChatRequest):
    return await socratic_service.chat(req)


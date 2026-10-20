from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.api.routes import api_router, seed_initial_leaderboard_data
from backend.app.core.config import settings
from backend.app.core.database import init_db
from backend.app.services.codeforces_service import seed_initial_problems
from backend.app.services.curriculum_service import sync_curriculum_to_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    sync_curriculum_to_db()
    seed_initial_problems()
    seed_initial_leaderboard_data()
    yield


app = FastAPI(
    title=settings.app_name,
    description="Local-First Personal Learning Management System for Python, Data Science, and AI.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.api_v1_str)


@app.get("/health")
@app.get("/api/v1/health")
def health_check():
    return {"status": "healthy", "platform": "Olympus LMS"}

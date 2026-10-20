from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Axion LMS Backend"
    api_v1_str: str = "/api/v1"
    
    base_dir: Path = Path(__file__).resolve().parent.parent.parent.parent
    db_path: Path = base_dir / "olympus.db"
    datasets_dir: Path = base_dir / "data" / "datasets"
    notebooks_dir: Path = base_dir / "data" / "notebooks"
    curriculum_dir: Path = base_dir / "curriculum"
    codeforces_cache_dir: Path = base_dir / "data" / "codeforces_cache"
    cache_dir: Path = base_dir / "data" / "cache"
    
    # Gemini AI Configuration (Primary)
    gemini_api_key: str = ""
    gemini_model: str = "gemini-3.6-flash"
    gemini_fallback_models: str = "gemini-3.5-flash,gemini-flash-lite-latest,gemini-3.1-flash-lite"
    gemini_base_url: str = "https://generativelanguage.googleapis.com/v1beta"

    # Ollama Local Engine (Fallback)
    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "llama3"
    
    dataset_retention_days: int = 14
    execution_timeout_seconds: int = 10
    
    jupyter_ws_url: str = "ws://localhost:8888"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()

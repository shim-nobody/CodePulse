from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    app_name: str = "CodePulse"
    app_version: str = "1.0.0"
    debug: bool = False
    database_url: str = "sqlite:///./codepulse.db"
    secret_key: str = "CHANGE_ME_IN_PRODUCTION_USE_RANDOM_256BIT_KEY"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 10080
    cors_origins: list[str] = ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"]
    max_code_size_bytes: int = 500000
    max_file_count: int = 50
    analysis_timeout_seconds: int = 30
    ai_enabled: bool = False

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

@lru_cache()
def get_settings() -> Settings:
    return Settings()

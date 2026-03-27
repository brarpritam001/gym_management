"""Application configuration settings."""

from pathlib import Path
from pydantic_settings import BaseSettings


# Resolve .env relative to this file (backend/app/core/.env)
_ENV_FILE = Path(__file__).resolve().parent / ".env"


class Settings(BaseSettings):
    # App
    APP_NAME: str = "Gym Management SaaS"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # Database
    #DATABASE_URL: str | None = "sqlite:///./gym.db"
    database_hostname: str | None = None
    database_port: int | None = None
    database_username: str | None = None
    database_password: str | None = None
    databnase_name: str | None = None

    # JWT
    SECRET_KEY: str = "super-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://localhost:3000"]

    class Config:
        env_file = str(_ENV_FILE)
        extra = "allow"


settings = Settings()

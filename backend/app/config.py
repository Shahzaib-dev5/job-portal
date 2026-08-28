from pathlib import Path
from typing import Any, List

from pydantic import field_validator
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parents[1]


class Settings(BaseSettings):
    PROJECT_NAME: str = "Job Portal API"
    API_V1_PREFIX: str = "/api/v1"

    # Database
    DB_HOST: str = "localhost"
    DB_PORT: int = 3306
    DB_USER: str = "root"
    DB_PASSWORD: str = ""
    DB_NAME: str = "job_portal"

    @property
    def SQLALCHEMY_DATABASE_URL(self) -> str:
        return f"mysql+pymysql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

    # JWT
    JWT_SECRET_KEY: str = "your-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # LMS (Odoo)
    LMS_API_URL: str = ""
    LMS_DB_NAME: str = "9july"
    LMS_API_ENDPOINT: str = "/web/session/authenticate"
    LMS_PROFILE_MODEL: str = "res.users"
    LMS_TIMEOUT_SECONDS: float = 10.0

    # File uploads
    MAX_UPLOAD_SIZE: int = 5 * 1024 * 1024
    ALLOWED_EXTENSIONS: List[str] = [".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png"]

    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
    ]

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def parse_allowed_origins(cls, value: Any) -> Any:
        if value is None:
            return []
        if isinstance(value, list):
            return value
        if isinstance(value, str):
            stripped = value.strip()
            if not stripped:
                return []
            try:
                parsed = __import__("json").loads(stripped)
                if isinstance(parsed, list):
                    return parsed
            except Exception:
                pass
            return [item.strip() for item in stripped.split(",") if item.strip()]
        return value

    class Config:
        env_file = str(BASE_DIR / ".env")
        env_file_encoding = "utf-8"


settings = Settings()
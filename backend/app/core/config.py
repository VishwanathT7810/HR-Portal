from functools import lru_cache
from typing import List

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    ENVIRONMENT: str = Field(default="development")

    DATABASE_URL: str = Field(
        default=(
            "sqlite:///./hr_dev.db"
        ),
        description="SQLAlchemy connection URL. For SQL Server use: "
        "mssql+pyodbc://user:pass@host/DB?driver=ODBC+Driver+18+for+SQL+Server&TrustServerCertificate=yes",
    )


    CORS_ORIGINS: str = Field(
        default="http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173,http://127.0.0.1:5174",
        description="Comma-separated list of allowed CORS origins.",
    )

    ADMIN_USERNAME: str | None = Field(default=None)
    ADMIN_PASSWORD: str | None = Field(default=None)
    ADMIN_FULL_NAME: str | None = Field(default="HR Administrator")
    ADMIN_EMAIL: str | None = Field(default=None)

    DEMO_ADMIN_USERNAME: str | None = Field(default="demo.admin@example.com")
    DEMO_ADMIN_EMAIL: str | None = Field(default="demo.admin@example.com")
    DEMO_ADMIN_PASSWORD: str | None = Field(default="Demo@12345")
    DEMO_ADMIN_FULL_NAME: str | None = Field(default="Demo Administrator")

    INVITATION_DEFAULT_VALID_DAYS: int = Field(default=7, ge=1, le=365)

    API_V1_PREFIX: str = Field(default="/api/v1")

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def strip_cors(cls, v: object) -> object:
        if isinstance(v, str):
            return ",".join(origin.strip() for origin in v.split(",") if origin.strip())
        return v

    @property
    def cors_origin_list(self) -> List[str]:
        if not self.CORS_ORIGINS:
            return []
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT.lower() in {"production", "prod", "staging"}


@lru_cache
def get_settings() -> Settings:
    return Settings()

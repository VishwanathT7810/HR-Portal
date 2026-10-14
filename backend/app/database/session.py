from datetime import datetime
from typing import Annotated

from fastapi import Depends
from sqlalchemy import DateTime, create_engine, event
from sqlalchemy.engine import Engine
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column, sessionmaker

from app.core.config import get_settings

settings = get_settings()


class Base(DeclarativeBase):
    pass


_connect_args: dict = {}
_url = settings.DATABASE_URL
if _url.startswith("sqlite"):
    _connect_args = {"check_same_thread": False}


def _set_sqlite_pragmas(dbapi_connection, connection_record):  # noqa: ARG001
    if settings.DATABASE_URL.startswith("sqlite"):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()


engine = create_engine(
    settings.DATABASE_URL,
    connect_args=_connect_args,
    pool_pre_ping=True,
    pool_recycle=3600,
    echo=not settings.is_production,
)

event.listen(engine, "connect", _set_sqlite_pragmas)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    expire_on_commit=False,
)


def get_db():
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()


DbSession = Annotated[Session, Depends(get_db)]


def init_database() -> None:
    from app.database.models import audit_log, employee_form  # noqa: F401

    Base.metadata.create_all(bind=engine)

    # Automatically ensure new columns exist in existing tables
    try:
        from sqlalchemy import inspect, text

        inspector = inspect(engine)
        existing_tables = [t.lower() for t in inspector.get_table_names()]

        if "employee_forms" in existing_tables:
            columns = [c["name"].lower() for c in inspector.get_columns("employee_forms")]
            with engine.begin() as conn:
                if "experience_years" not in columns:
                    conn.execute(text("ALTER TABLE employee_forms ADD experience_years INT DEFAULT 0"))
                if "experience_months" not in columns:
                    conn.execute(text("ALTER TABLE employee_forms ADD experience_months INT DEFAULT 0"))

        if "audit_logs" in existing_tables:
            columns = [c["name"].lower() for c in inspector.get_columns("audit_logs")]
            with engine.begin() as conn:
                if "admin_username" not in columns:
                    conn.execute(text("ALTER TABLE audit_logs ADD admin_username VARCHAR(64) NULL"))
    except Exception:
        # Schema is managed externally or already up-to-date
        pass

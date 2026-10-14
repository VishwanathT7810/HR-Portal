r"""Seed admin users (primary admin and demo admin) from environment variables.

Run from backend/ folder:
    .venv\Scripts\python.exe scripts\seed_admin.py
"""

from __future__ import annotations

import sys
from pathlib import Path

# Ensure backend root directory is in sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.database import SessionLocal, init_database
from app.modules.auth.repositories.admin_user_repository import AdminUserRepository
from app.core.config import get_settings
from app.core.security import hash_password


def main() -> None:
    settings = get_settings()
    init_database()

    seeded_any = False

    with SessionLocal() as db:
        repo = AdminUserRepository(db)

        # 1. Primary Admin (if configured)
        if settings.ADMIN_USERNAME and settings.ADMIN_PASSWORD:
            existing = repo.get_by_username_or_email(settings.ADMIN_USERNAME)
            if existing is not None:
                print(f"[INFO] Primary admin '{settings.ADMIN_USERNAME}' already exists (id={existing.id}). No changes.")
            else:
                data = {
                    "username": settings.ADMIN_USERNAME,
                    "email": settings.ADMIN_EMAIL,
                    "full_name": settings.ADMIN_FULL_NAME or "HR Administrator",
                    "hashed_password": hash_password(settings.ADMIN_PASSWORD),
                    "is_active": True,
                }
                created = repo.create(data)
                db.commit()
                print(f"[SUCCESS] Created primary admin '{created.username}' (id={created.id}).")
            seeded_any = True

        # 2. Demo Admin (for local development/testing)
        demo_email = settings.DEMO_ADMIN_EMAIL or "demo.admin@example.com"
        demo_password = settings.DEMO_ADMIN_PASSWORD or "Demo@12345"
        demo_username = settings.DEMO_ADMIN_USERNAME or demo_email
        demo_full_name = settings.DEMO_ADMIN_FULL_NAME or "Demo Administrator"

        if demo_email and demo_password:
            existing_demo = repo.get_by_username_or_email(demo_email) or repo.get_by_username_or_email(demo_username)
            if existing_demo is not None:
                print(f"[INFO] Demo admin '{demo_email}' already exists (id={existing_demo.id}). No changes.")
            else:
                demo_data = {
                    "username": demo_username,
                    "email": demo_email,
                    "full_name": demo_full_name,
                    "hashed_password": hash_password(demo_password),
                    "is_active": True,
                }
                created_demo = repo.create(demo_data)
                db.commit()
                print(f"[SUCCESS] Created demo admin '{demo_email}' (id={created_demo.id}, username='{created_demo.username}').")
            seeded_any = True

    if not seeded_any:
        print("[WARN] No admin credentials found in environment variables to seed.")


if __name__ == "__main__":
    main()


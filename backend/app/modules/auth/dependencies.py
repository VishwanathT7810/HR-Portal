from __future__ import annotations

from typing import Any, Optional

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer

from app.core.config import get_settings
from app.database import DbSession
from app.database.models.admin_user import AdminUser
from app.modules.auth.repositories.admin_user_repository import AdminUserRepository

settings = get_settings()
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_PREFIX.rstrip('/')}/auth/login-form",
    auto_error=False,
)


def extract_admin_identifier(request: Request, bearer_token: Optional[str] = None) -> Optional[str]:
    # 1. Custom admin header
    admin_header = request.headers.get("X-Admin-Username")
    if admin_header and admin_header.strip():
        return admin_header.strip()

    # 2. Bearer or custom token from OAuth2PasswordBearer
    if bearer_token and bearer_token.strip():
        return bearer_token.strip()

    # 3. Direct Authorization header
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.strip():
        parts = auth_header.strip().split(maxsplit=1)
        if len(parts) == 2 and parts[0].lower() in {"bearer", "admin", "token"}:
            return parts[1].strip()
        return auth_header.strip()

    return None


async def get_current_admin_user(
    request: Request,
    db: DbSession,
    token: Optional[str] = Depends(oauth2_scheme),
) -> AdminUser:
    identifier = extract_admin_identifier(request, token)
    if not identifier:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Admin"},
        )

    user = AdminUserRepository(db).get_by_username_or_email(identifier)
    if user is None or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials or inactive admin user",
            headers={"WWW-Authenticate": "Admin"},
        )
    return user


CurrentAdminUser = Depends(get_current_admin_user)

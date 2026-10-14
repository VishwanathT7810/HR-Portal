from __future__ import annotations

from typing import Optional

from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.security import (
    hash_password,
    verify_password,
)
from app.database.models.admin_user import AdminUser
from app.modules.auth.repositories.admin_user_repository import AdminUserRepository
from app.modules.auth.schemas import AdminUserInfo, TokenResponse

settings = get_settings()


class AuthService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.admin_repo = AdminUserRepository(db)

    def authenticate_admin(self, username: str, password: str) -> Optional[AdminUser]:
        user = self.admin_repo.get_by_username_or_email(username)
        if not user or not user.is_active:
            return None

        # Check configured passwords or password verify
        valid = False
        if user.id == 1 and settings.ADMIN_PASSWORD and password == settings.ADMIN_PASSWORD:
            valid = True
        elif user.id == 2 and settings.DEMO_ADMIN_PASSWORD and password == settings.DEMO_ADMIN_PASSWORD:
            valid = True
        elif verify_password(password, user.hashed_password):
            valid = True

        if not valid:
            return None
        return user

    def create_auth_session(self, admin_user: AdminUser) -> TokenResponse:
        user_info = AdminUserInfo(
            id=admin_user.id,
            username=admin_user.username,
            email=admin_user.email,
            full_name=admin_user.full_name,
        )
        return TokenResponse(
            success=True,
            message="Authenticated successfully",
            user=user_info,
            token=admin_user.username,
            access_token=admin_user.username,
            refresh_token="",
            token_type="bearer",
        )

    def issue_tokens(self, admin_user: AdminUser) -> TokenResponse:
        """Compatibility wrapper: returns auth session without JWT."""
        return self.create_auth_session(admin_user)

    def refresh_access_token(self, refresh_token_value: str) -> TokenResponse:
        """Compatibility method for refresh token endpoint."""
        user = self.admin_repo.get_by_username_or_email(refresh_token_value)
        if user and user.is_active:
            return self.create_auth_session(user)
        # Fallback to active admin
        active = self.admin_repo.get_by_username_or_email(settings.DEMO_ADMIN_USERNAME or "demo.admin@example.com")
        if active:
            return self.create_auth_session(active)
        raise ValueError("Invalid session")

    def logout(self, token_value: Optional[str] = None) -> None:
        pass


def seed_demo_admin_if_needed(db: Optional[Session] = None) -> Optional[AdminUser]:
    return AdminUserRepository(db).get_by_username_or_email(settings.DEMO_ADMIN_USERNAME or "demo.admin@example.com")


def seed_initial_admin_if_needed() -> None:
    pass

from typing import Optional
from app.core.config import get_settings
from app.core.security import hash_password
from app.database.models.admin_user import AdminUser


class AdminUserRepository:
    def __init__(self, db=None) -> None:
        self.db = db

    def _get_admins(self) -> list[AdminUser]:
        settings = get_settings()
        admins = []
        if settings.ADMIN_USERNAME:
            admins.append(
                AdminUser(
                    id=1,
                    username=settings.ADMIN_USERNAME,
                    email=settings.ADMIN_EMAIL or f"{settings.ADMIN_USERNAME}@example.com",
                    full_name=settings.ADMIN_FULL_NAME or "HR Administrator",
                    hashed_password=hash_password(settings.ADMIN_PASSWORD or "ChangeMe123!"),
                    is_active=True,
                )
            )
        if settings.DEMO_ADMIN_USERNAME or settings.DEMO_ADMIN_EMAIL:
            demo_user = settings.DEMO_ADMIN_USERNAME or settings.DEMO_ADMIN_EMAIL or "demo.admin@example.com"
            demo_email = settings.DEMO_ADMIN_EMAIL or demo_user
            admins.append(
                AdminUser(
                    id=2,
                    username=demo_user,
                    email=demo_email,
                    full_name=settings.DEMO_ADMIN_FULL_NAME or "Demo Administrator",
                    hashed_password=hash_password(settings.DEMO_ADMIN_PASSWORD or "Demo@12345"),
                    is_active=True,
                )
            )
        return admins

    def get_by_username(self, username: str) -> Optional[AdminUser]:
        for admin in self._get_admins():
            if admin.username.lower() == username.lower():
                return admin
        return None

    def get_by_email(self, email: str) -> Optional[AdminUser]:
        for admin in self._get_admins():
            if admin.email and admin.email.lower() == email.lower():
                return admin
        return None

    def get_by_username_or_email(self, identifier: str) -> Optional[AdminUser]:
        id_lower = identifier.lower().strip()
        for admin in self._get_admins():
            if admin.username.lower() == id_lower or (admin.email and admin.email.lower() == id_lower):
                return admin
        return None

    def get_by_id(self, id: int) -> Optional[AdminUser]:
        for admin in self._get_admins():
            if admin.id == id:
                return admin
        return None

    def create(self, data: dict) -> AdminUser:
        return AdminUser(**data)

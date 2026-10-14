from datetime import datetime, timezone
from typing import Optional


class AdminUser:
    def __init__(
        self,
        id: int = 1,
        username: str = "demo.admin@example.com",
        email: Optional[str] = "demo.admin@example.com",
        full_name: Optional[str] = "Demo Administrator",
        hashed_password: str = "",
        is_active: bool = True,
        created_at: Optional[datetime] = None,
        updated_at: Optional[datetime] = None,
    ) -> None:
        self.id = id
        self.username = username
        self.email = email
        self.full_name = full_name
        self.hashed_password = hashed_password
        self.is_active = is_active
        self.created_at = created_at or datetime.now(timezone.utc)
        self.updated_at = updated_at or datetime.now(timezone.utc)

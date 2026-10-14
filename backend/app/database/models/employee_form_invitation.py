from datetime import datetime, timezone
from typing import Optional


class EmployeeFormInvitation:
    def __init__(
        self,
        id: int = 1,
        token: str = "direct-token",
        mobile_number: Optional[str] = None,
        invited_by_admin_id: Optional[int] = None,
        expires_at: Optional[datetime] = None,
        is_used: bool = False,
        used_at: Optional[datetime] = None,
        created_at: Optional[datetime] = None,
    ) -> None:
        self.id = id
        self.token = token
        self.mobile_number = mobile_number
        self.invited_by_admin_id = invited_by_admin_id
        self.expires_at = expires_at or datetime.now(timezone.utc)
        self.is_used = is_used
        self.used_at = used_at
        self.created_at = created_at or datetime.now(timezone.utc)

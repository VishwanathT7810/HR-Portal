from datetime import datetime, timedelta
from typing import Optional

from app.core.security import utc_now
from app.database.models.employee_form_invitation import EmployeeFormInvitation


class InvitationRepository:
    def __init__(self, db=None) -> None:
        self.db = db

    def get_by_token(self, token: str) -> Optional[EmployeeFormInvitation]:
        return EmployeeFormInvitation(
            id=1,
            token=token,
            is_used=False,
            expires_at=utc_now() + timedelta(days=365),
        )

    def mark_used(self, token: str) -> None:
        pass

    def create(self, data: dict) -> EmployeeFormInvitation:
        return EmployeeFormInvitation(**data)

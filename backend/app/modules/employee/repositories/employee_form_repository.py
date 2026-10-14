from datetime import datetime, timedelta
from typing import List, Optional

from sqlalchemy import desc, func, select

from app.common.base_repository import BaseRepository
from app.core.security import utc_now
from app.database.models.employee_form import EmployeeForm


class EmployeeFormRepository(BaseRepository[EmployeeForm]):
    model = EmployeeForm

    def get_by_mobile(self, mobile_number: str) -> List[EmployeeForm]:
        mobile = (mobile_number or "").strip()
        stmt = (
            select(EmployeeForm)
            .where(EmployeeForm.mobile_number == mobile)
            .order_by(desc(EmployeeForm.created_at))
        )
        return list(self.db.scalars(stmt).all())

    def get_latest_by_mobile(self, mobile_number: str) -> Optional[EmployeeForm]:
        mobile = (mobile_number or "").strip()
        stmt = (
            select(EmployeeForm)
            .where(EmployeeForm.mobile_number == mobile)
            .order_by(desc(EmployeeForm.created_at))
        )
        return self.db.scalars(stmt).first()

    def get_by_submission_reference(self, reference: str) -> Optional[EmployeeForm]:
        stmt = select(EmployeeForm).where(EmployeeForm.submission_reference == reference)
        return self.db.scalars(stmt).first()

    def get_by_invitation_id(self, invitation_id: int) -> Optional[EmployeeForm]:
        stmt = select(EmployeeForm).where(EmployeeForm.invitation_id == invitation_id)
        return self.db.scalars(stmt).first()

    def list_recent(self, limit: int = 10) -> List[EmployeeForm]:
        limit = max(min(limit, 200), 1)
        stmt = select(EmployeeForm).order_by(desc(EmployeeForm.created_at)).limit(limit)
        return list(self.db.scalars(stmt).all())

    def count_last_n_days(self, days: int = 7) -> int:
        cutoff = utc_now() - timedelta(days=max(days, 0))
        stmt = select(func.count()).select_from(EmployeeForm).where(EmployeeForm.created_at >= cutoff)
        result = self.db.execute(stmt).scalar_one()
        return int(result or 0)

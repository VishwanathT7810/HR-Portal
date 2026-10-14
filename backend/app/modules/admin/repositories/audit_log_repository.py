from typing import List, Optional

from sqlalchemy import desc, select

from app.common.base_repository import BaseRepository
from app.database.models.audit_log import AuditLog


class AuditLogRepository(BaseRepository[AuditLog]):
    model = AuditLog

    def list_by_admin(self, admin_user_id: int, limit: int = 50) -> List[AuditLog]:
        stmt = (
            select(AuditLog)
            .where(AuditLog.admin_user_id == admin_user_id)
            .order_by(desc(AuditLog.timestamp))
            .limit(max(min(limit, 500), 1))
        )
        return list(self.db.scalars(stmt).all())

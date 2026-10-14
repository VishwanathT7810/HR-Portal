from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, ConfigDict


class AdminDashboardSummary(BaseModel):
    total_employees: int
    last_7_days: int
    recent_count: int


class AuditLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    timestamp: datetime
    action_type: str
    details_json: Optional[Any] = None
    ip_address: Optional[str] = None

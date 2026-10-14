from __future__ import annotations

import secrets
from datetime import timedelta
from typing import Any, Optional

from fastapi import HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.security import utc_now
from app.database.models.admin_user import AdminUser
from app.database.models.employee_form_invitation import EmployeeFormInvitation
from app.modules.employee.repositories.invitation_repository import InvitationRepository
from app.modules.employee.schemas import InvitationCreate, InvitationResponse
from app.modules.admin.services.audit_service import log_admin_action

settings = get_settings()


class InvitationService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.repo = InvitationRepository(db)

    def create_invitation(
        self,
        payload: InvitationCreate,
        *,
        created_by: Optional[AdminUser],
        request: Optional[Request] = None,
    ) -> InvitationResponse:
        token = secrets.token_urlsafe(32)
        valid_days = payload.valid_days or settings.INVITATION_DEFAULT_VALID_DAYS
        expires_at = utc_now() + timedelta(days=valid_days)
        data: dict[str, Any] = {
            "token": token,
            "mobile_number": payload.mobile_number,
            "invited_by_admin_id": created_by.id if created_by else None,
            "expires_at": expires_at,
            "is_used": False,
            "used_at": None,
        }
        entity = self.repo.create(data)
        if created_by:
            log_admin_action(
                self.db,
                admin_user=created_by,
                action_type="admin.invitation_created",
                details={"mobile_number": payload.mobile_number, "valid_days": valid_days},
                request=request,
            )
        self.db.commit()
        return InvitationResponse.model_validate(entity)

    def validate_and_get(self, token: str) -> EmployeeFormInvitation:
        entity = self.repo.get_by_token(token)
        if entity is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invitation not found or invalid.",
            )
        now = utc_now()
        if entity.expires_at.tzinfo is None:
            exp_utc = entity.expires_at.replace(tzinfo=now.tzinfo)
        else:
            exp_utc = entity.expires_at
        if exp_utc < now:
            raise HTTPException(
                status_code=status.HTTP_410_GONE,
                detail="This invitation has expired. Please contact HR for a new link.",
            )
        if entity.is_used:
            raise HTTPException(
                status_code=status.HTTP_410_GONE,
                detail="This form has already been submitted. Thank you!",
            )
        return entity

    def mark_used(self, token: str) -> None:
        self.repo.mark_used(token)
        self.db.commit()

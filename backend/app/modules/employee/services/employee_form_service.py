from __future__ import annotations

import secrets
from datetime import datetime
from typing import Any

from fastapi import HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.security import utc_now
from app.database.models.admin_user import AdminUser
from app.modules.employee.repositories.employee_form_repository import EmployeeFormRepository
from app.modules.admin.schemas import AdminDashboardSummary
from app.modules.employee.schemas import (
    EmployeeFormResponse,
    EmployeeFormSubmit,
    EmployeeSearchResult,
)
from app.modules.employee.services.invitation_service import InvitationService
from app.modules.admin.services.audit_service import log_admin_action


def _generate_submission_reference() -> str:
    now = utc_now()
    date_part = now.strftime("%y%m%d")
    random_hex = secrets.token_hex(3).upper()
    return f"EMP-{date_part}-{random_hex}"


class EmployeeFormService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.repo = EmployeeFormRepository(db)
        self.invitation_svc = InvitationService(db)

    def submit_form(self, *, token: str, payload: EmployeeFormSubmit) -> EmployeeFormResponse:
        invitation = self.invitation_svc.validate_and_get(token)
        # Validate mobile matches invitation hint if any
        if invitation.mobile_number and invitation.mobile_number != payload.mobile:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Mobile number does not match the invitation. Please use the link sent to your registered mobile.",
            )

        reference = _generate_submission_reference()
        data: dict[str, Any] = {
            "submission_reference": reference,
            "invitation_id": invitation.id,
            "mobile_number": payload.mobile,
            "post": payload.post,
            "name": payload.name,
            "email": payload.email,
            "date_of_birth": payload.date_of_birth,
            "gender": payload.gender,
            "local_address": payload.local_address,
            "permanent_address": payload.permanent_address,
            "landline": payload.landline,
            "qualification": payload.qualification,
            "computer_course": payload.computer_course,
            "interview_date": payload.interview_date,
            "reference_name": payload.reference_name,
            "date_of_joining": payload.date_of_joining,
            "experience_value": payload.experience_years if payload.experience_years is not None else payload.experience_value,
            "experience_unit": "years",
            "experience_years": payload.experience_years if payload.experience_years is not None else (payload.experience_value if payload.experience_unit == "years" else 0),
            "experience_months": payload.experience_months if payload.experience_months is not None else (payload.experience_value if payload.experience_unit == "months" else 0),
            "emergency_mobile": payload.emergency_mobile,
            "emergency_person_name": payload.emergency_person_name,
            "emergency_relation": payload.emergency_relation,
            "blood_group": payload.blood_group,
            "willingness_donate_blood": payload.willingness_donate_blood,
            "marital_status": payload.marital_status,
            "medical_history": payload.medical_history,
            "legal_history": payload.legal_history,
            "religion": payload.religion,
            "caste": payload.caste,
            "spouse_name": payload.spouse_name,
            "anniversary_date": payload.anniversary_date,
            "submission_status": "submitted",
        }
        try:
            with self.db.begin_nested():
                entity = self.repo.create(data)
                self.invitation_svc.mark_used(token)
            self.db.commit()
        except Exception:
            self.db.rollback()
            raise

        self.db.refresh(entity)
        return EmployeeFormResponse.model_validate(entity)

    def get_by_mobile(self, mobile_number: str) -> EmployeeFormResponse | None:
        entity = self.repo.get_latest_by_mobile(mobile_number)
        if not entity:
            return None
        return EmployeeFormResponse.model_validate(entity)

    def register_or_update_form(self, payload: EmployeeFormSubmit) -> EmployeeFormResponse:
        existing = self.repo.get_latest_by_mobile(payload.mobile)

        data: dict[str, Any] = {
            "mobile_number": payload.mobile,
            "post": payload.post,
            "name": payload.name,
            "email": payload.email,
            "date_of_birth": payload.date_of_birth,
            "gender": payload.gender,
            "local_address": payload.local_address,
            "permanent_address": payload.permanent_address,
            "landline": payload.landline,
            "qualification": payload.qualification,
            "computer_course": payload.computer_course,
            "interview_date": payload.interview_date,
            "reference_name": payload.reference_name,
            "date_of_joining": payload.date_of_joining,
            "experience_value": payload.experience_years if payload.experience_years is not None else payload.experience_value,
            "experience_unit": "years",
            "experience_years": payload.experience_years if payload.experience_years is not None else (payload.experience_value if payload.experience_unit == "years" else 0),
            "experience_months": payload.experience_months if payload.experience_months is not None else (payload.experience_value if payload.experience_unit == "months" else 0),
            "emergency_mobile": payload.emergency_mobile,
            "emergency_person_name": payload.emergency_person_name,
            "emergency_relation": payload.emergency_relation,
            "blood_group": payload.blood_group,
            "willingness_donate_blood": payload.willingness_donate_blood,
            "marital_status": payload.marital_status,
            "medical_history": payload.medical_history,
            "legal_history": payload.legal_history,
            "religion": payload.religion,
            "caste": payload.caste,
            "spouse_name": payload.spouse_name,
            "anniversary_date": payload.anniversary_date,
            "submission_status": "submitted",
            "updated_at": utc_now(),
        }

        if existing:
            for key, val in data.items():
                setattr(existing, key, val)
            entity = existing
        else:
            data["submission_reference"] = _generate_submission_reference()
            data["invitation_id"] = None
            data["created_at"] = utc_now()
            entity = self.repo.create(data)

        self.db.commit()
        self.db.refresh(entity)
        return EmployeeFormResponse.model_validate(entity)

    def get_for_admin(
        self,
        *,
        submission_reference: str,
        admin_user: AdminUser,
        request: Request,
    ) -> EmployeeFormResponse:
        entity = self.repo.get_by_submission_reference(submission_reference)
        if entity is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Employee record not found.",
            )
        log_admin_action(
            self.db,
            admin_user=admin_user,
            action_type="admin.employee_viewed",
            details={"submission_reference": submission_reference, "mobile_number": entity.mobile_number},
            request=request,
        )
        self.db.commit()
        return EmployeeFormResponse.model_validate(entity)

    def update_by_admin(
        self,
        *,
        submission_reference: str,
        payload: EmployeeFormSubmit,
        admin_user: AdminUser,
        request: Request,
    ) -> EmployeeFormResponse:
        entity = self.repo.get_by_submission_reference(submission_reference)
        if entity is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Employee record not found.",
            )

        data: dict[str, Any] = {
            "mobile_number": payload.mobile,
            "post": payload.post,
            "name": payload.name,
            "email": payload.email,
            "date_of_birth": payload.date_of_birth,
            "gender": payload.gender,
            "local_address": payload.local_address,
            "permanent_address": payload.permanent_address,
            "landline": payload.landline,
            "qualification": payload.qualification,
            "computer_course": payload.computer_course,
            "interview_date": payload.interview_date,
            "reference_name": payload.reference_name,
            "date_of_joining": payload.date_of_joining,
            "experience_value": payload.experience_years if payload.experience_years is not None else payload.experience_value,
            "experience_unit": "years",
            "experience_years": payload.experience_years if payload.experience_years is not None else (payload.experience_value if payload.experience_unit == "years" else 0),
            "experience_months": payload.experience_months if payload.experience_months is not None else (payload.experience_value if payload.experience_unit == "months" else 0),
            "emergency_mobile": payload.emergency_mobile,
            "emergency_person_name": payload.emergency_person_name,
            "emergency_relation": payload.emergency_relation,
            "blood_group": payload.blood_group,
            "willingness_donate_blood": bool(payload.willingness_donate_blood) if payload.willingness_donate_blood is not None else bool(entity.willingness_donate_blood),
            "marital_status": payload.marital_status,
            "medical_history": payload.medical_history,
            "legal_history": payload.legal_history,
            "religion": payload.religion,
            "caste": payload.caste,
            "spouse_name": payload.spouse_name,
            "anniversary_date": payload.anniversary_date,
            "updated_at": utc_now(),
        }

        if payload.created_at is not None:
            from datetime import time, timezone
            data["created_at"] = datetime.combine(payload.created_at, time.min).replace(tzinfo=timezone.utc)

        for key, val in data.items():
            setattr(entity, key, val)

        log_admin_action(
            self.db,
            admin_user=admin_user,
            action_type="admin.employee_updated",
            details={"submission_reference": submission_reference, "mobile_number": entity.mobile_number},
            request=request,
        )
        self.db.commit()
        self.db.refresh(entity)
        return EmployeeFormResponse.model_validate(entity)

    def search_by_mobile(
        self,
        *,
        mobile: str,
        admin_user: AdminUser,
        request: Request,
    ) -> list[EmployeeSearchResult]:
        normalized = (mobile or "").strip()
        entities = self.repo.get_by_mobile(normalized)
        log_admin_action(
            self.db,
            admin_user=admin_user,
            action_type="admin.employee_search",
            details={"mobile": normalized, "results": len(entities)},
            request=request,
        )
        self.db.commit()
        return [EmployeeSearchResult.model_validate(e) for e in entities]

    def list_recent(self, limit: int = 10) -> list[EmployeeSearchResult]:
        entities = self.repo.list_recent(limit=limit)
        return [EmployeeSearchResult.model_validate(e) for e in entities]

    def get_dashboard_summary(self) -> AdminDashboardSummary:
        total = self.repo.count()
        last_7_days = self.repo.count_last_n_days(7)
        recent = min(total, 10)
        return AdminDashboardSummary(
            total_employees=total,
            last_7_days=last_7_days,
            recent_count=recent,
        )

from __future__ import annotations

from typing import Any, Optional

from fastapi import APIRouter, Depends, Path, Query, Request, status

from app.database import DbSession
from app.database.models.admin_user import AdminUser
from app.modules.auth.dependencies import get_current_admin_user
from app.modules.admin.schemas import AdminDashboardSummary, AuditLogResponse
from app.modules.admin.repositories.audit_log_repository import AuditLogRepository
from app.modules.employee.schemas import (
    EmployeeFormResponse,
    EmployeeFormSubmit,
    EmployeeSearchResult,
    InvitationCreate,
    InvitationResponse,
)
from app.modules.employee.services.employee_form_service import EmployeeFormService
from app.modules.employee.services.invitation_service import InvitationService

router = APIRouter(prefix="/admin")


@router.get("/dashboard/summary", response_model=AdminDashboardSummary)
def dashboard_summary(
    db: DbSession,
    current_user: AdminUser = Depends(get_current_admin_user),
) -> AdminDashboardSummary:
    return EmployeeFormService(db).get_dashboard_summary()


@router.get("/employees/search", response_model=list[EmployeeSearchResult])
def search_employees(
    request: Request,
    mobile: str = Query(..., min_length=1, max_length=32),
    db: DbSession = ...,
    current_user: AdminUser = Depends(get_current_admin_user),
) -> list[EmployeeSearchResult]:
    return EmployeeFormService(db).search_by_mobile(
        mobile=mobile,
        admin_user=current_user,
        request=request,
    )


@router.get("/employees/recent", response_model=list[EmployeeSearchResult])
def recent_employees(
    limit: int = Query(default=10, ge=1, le=200),
    db: DbSession = ...,
    current_user: AdminUser = Depends(get_current_admin_user),
) -> list[EmployeeSearchResult]:
    return EmployeeFormService(db).list_recent(limit=limit)


@router.get("/employees", response_model=list[EmployeeSearchResult])
def list_employees(
    page: int = Query(default=1, ge=1),
    size: int = Query(default=20, ge=1, le=200),
    db: DbSession = ...,
    current_user: AdminUser = Depends(get_current_admin_user),
) -> list[EmployeeSearchResult]:
    from app.modules.employee.repositories.employee_form_repository import EmployeeFormRepository

    repo = EmployeeFormRepository(db)
    items, _total, _pages = repo.paginate(page=page, size=size)
    return [EmployeeSearchResult.model_validate(e) for e in items]


@router.get("/employees/{submission_reference}", response_model=EmployeeFormResponse)
def get_employee_details(
    request: Request,
    submission_reference: str = Path(..., min_length=4),
    db: DbSession = ...,
    current_user: AdminUser = Depends(get_current_admin_user),
) -> EmployeeFormResponse:
    return EmployeeFormService(db).get_for_admin(
        submission_reference=submission_reference,
        admin_user=current_user,
        request=request,
    )


@router.put("/employees/{submission_reference}", response_model=EmployeeFormResponse)
def update_employee_details(
    request: Request,
    payload: EmployeeFormSubmit,
    submission_reference: str = Path(..., min_length=4),
    db: DbSession = ...,
    current_user: AdminUser = Depends(get_current_admin_user),
) -> EmployeeFormResponse:
    return EmployeeFormService(db).update_by_admin(
        submission_reference=submission_reference,
        payload=payload,
        admin_user=current_user,
        request=request,
    )


@router.post(
    "/invitations",
    response_model=InvitationResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_invitation(
    request: Request,
    payload: InvitationCreate,
    db: DbSession = ...,
    current_user: AdminUser = Depends(get_current_admin_user),
) -> InvitationResponse:
    return InvitationService(db).create_invitation(
        payload=payload,
        created_by=current_user,
        request=request,
    )


@router.get("/audit-logs", response_model=list[AuditLogResponse])
def get_audit_logs(
    limit: int = Query(default=50, ge=1, le=500),
    db: DbSession = ...,
    current_user: AdminUser = Depends(get_current_admin_user),
) -> list[AuditLogResponse]:
    logs = AuditLogRepository(db).list_by_admin(current_user.id, limit=limit)
    return [AuditLogResponse.model_validate(l) for l in logs]

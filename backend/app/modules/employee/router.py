from __future__ import annotations

from typing import Any

from fastapi import APIRouter, HTTPException, Path, Query, Request, status, Depends
from pydantic import BaseModel, Field

from app.database import DbSession
from app.modules.employee.schemas import (
    EmployeeFormResponse,
    EmployeeFormSubmit,
    InvitationResponse,
)
from app.modules.employee.services.employee_form_service import EmployeeFormService
from app.modules.employee.services.invitation_service import InvitationService

router = APIRouter(prefix="/employee")


@router.get("/lookup", response_model=EmployeeFormResponse)
def lookup_employee_by_mobile(
    mobile: str = Query(..., min_length=10, max_length=15),
    db: DbSession = ...,
) -> EmployeeFormResponse:
    result = EmployeeFormService(db).get_by_mobile(mobile)
    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No registration found for this mobile number.",
        )
    return result


@router.post(
    "/register",
    response_model=EmployeeFormResponse,
    status_code=status.HTTP_201_CREATED,
)
def register_employee(
    payload: EmployeeFormSubmit,
    db: DbSession = ...,
) -> EmployeeFormResponse:
    return EmployeeFormService(db).register_or_update_form(payload=payload)


class InvitationPublicInfo(BaseModel):
    token: str
    mobile_number: str | None = None
    expires_at: str


@router.get("/form/{token}", response_model=InvitationPublicInfo)
def validate_invitation(
    token: str = Path(..., min_length=16),
    db: DbSession = ...,
) -> InvitationPublicInfo:
    svc = InvitationService(db)
    entity = svc.validate_and_get(token)
    return InvitationPublicInfo(
        token=entity.token,
        mobile_number=entity.mobile_number,
        expires_at=entity.expires_at.isoformat(),
    )


@router.post(
    "/form/{token}",
    response_model=EmployeeFormResponse,
    status_code=status.HTTP_201_CREATED,
)
def submit_employee_form(
    request: Request,
    payload: EmployeeFormSubmit,
    token: str = Path(..., min_length=16),
    db: DbSession = ...,
) -> EmployeeFormResponse:
    return EmployeeFormService(db).submit_form(token=token, payload=payload)

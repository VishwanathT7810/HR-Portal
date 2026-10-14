from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordRequestForm

from app.database import DbSession
from app.modules.auth.dependencies import get_current_admin_user
from app.modules.auth.schemas import (
    LoginRequest,
    MessageResponse,
    RefreshRequest,
    TokenResponse,
)
from app.modules.auth.services.auth_service import AuthService
from app.modules.admin.services.audit_service import log_admin_action

router = APIRouter(prefix="/auth")


@router.post("/login", response_model=TokenResponse, status_code=status.HTTP_200_OK)
def login(
    request: Request,
    payload: LoginRequest,
    db: DbSession,
) -> TokenResponse:
    svc = AuthService(db)
    user = svc.authenticate_admin(payload.username, payload.password)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )
    auth_response = svc.create_auth_session(user)
    try:
        log_admin_action(
            db,
            admin_user=user,
            action_type="admin.login",
            details={"username": user.username, "success": True},
            request=request,
        )
        db.commit()
    except Exception:  # noqa: BLE001
        db.rollback()
    return auth_response


@router.post("/login-form", response_model=TokenResponse, status_code=status.HTTP_200_OK, include_in_schema=False)
def login_form(
    request: Request,
    db: DbSession,
    form: OAuth2PasswordRequestForm = Depends(),
) -> TokenResponse:
    svc = AuthService(db)
    user = svc.authenticate_admin(form.username, form.password)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )
    auth_response = svc.create_auth_session(user)
    try:
        log_admin_action(
            db,
            admin_user=user,
            action_type="admin.login",
            details={"username": user.username, "success": True},
            request=request,
        )
        db.commit()
    except Exception:  # noqa: BLE001
        db.rollback()
    return auth_response


@router.post("/refresh", response_model=TokenResponse)
def refresh_token(
    payload: RefreshRequest,
    db: DbSession,
) -> TokenResponse:
    try:
        return AuthService(db).refresh_access_token(payload.refresh_token or "")
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
        ) from exc


@router.post("/logout", response_model=MessageResponse)
def logout(
    request: Request,
    db: DbSession,
    payload: Optional[RefreshRequest] = None,
    current_user=Depends(get_current_admin_user),
) -> MessageResponse:
    token_value = payload.refresh_token if payload else None
    AuthService(db).logout(token_value)
    try:
        log_admin_action(
            db,
            admin_user=current_user,
            action_type="admin.logout",
            details={"username": current_user.username},
            request=request,
        )
        db.commit()
    except Exception:  # noqa: BLE001
        db.rollback()
    return MessageResponse(message="Logged out successfully")

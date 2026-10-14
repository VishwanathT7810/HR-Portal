from __future__ import annotations

from typing import Any, Optional

from fastapi import Request
from sqlalchemy.orm import Session

from app.database.models.admin_user import AdminUser
from app.modules.admin.repositories.audit_log_repository import AuditLogRepository


def _get_client_ip(request: Request) -> Optional[str]:
    try:
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return request.client.host if request.client else None
    except Exception:  # noqa: BLE001
        return None


def _get_user_agent(request: Request) -> Optional[str]:
    return request.headers.get("User-Agent")


def _sanitize_details(details: Optional[dict[str, Any]]) -> Optional[dict[str, Any]]:
    if not details:
        return details
    blocked = {"password", "hashed_password", "token", "access_token", "refresh_token", "jwt"}
    return {
        k: "***" if isinstance(k, str) and k.lower() in blocked else v
        for k, v in details.items()
    }


def log_admin_action(
    db: Session,
    *,
    admin_user: Optional[AdminUser],
    action_type: str,
    details: Optional[dict[str, Any]] = None,
    request: Optional[Request] = None,
) -> None:
    repo = AuditLogRepository(db)
    safe_details = _sanitize_details(details)
    data: dict[str, Any] = {
        "admin_user_id": admin_user.id if admin_user else None,
        "action_type": action_type,
        "details_json": safe_details,
        "ip_address": _get_client_ip(request) if request else None,
        "user_agent": _get_user_agent(request) if request else None,
    }
    repo.create(data)

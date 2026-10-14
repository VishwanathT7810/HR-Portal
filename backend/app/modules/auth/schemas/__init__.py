from typing import Optional

from pydantic import BaseModel, ConfigDict


class LoginRequest(BaseModel):
    username: str
    password: str


class AdminUserInfo(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    username: str
    email: Optional[str] = None
    full_name: Optional[str] = None


class TokenResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    success: bool = True
    message: str = "Authenticated successfully"
    user: Optional[AdminUserInfo] = None
    token: Optional[str] = None
    access_token: Optional[str] = ""
    refresh_token: Optional[str] = ""
    token_type: str = "bearer"


# Alias for readability
LoginResponse = TokenResponse


class TokenData(BaseModel):
    username: str
    admin_id: Optional[int] = None


class RefreshRequest(BaseModel):
    refresh_token: Optional[str] = None


class MessageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    message: str

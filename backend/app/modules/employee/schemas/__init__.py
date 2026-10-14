import re
from datetime import date, datetime
from typing import Literal, Optional

from pydantic import (
    BaseModel,
    ConfigDict,
    EmailStr,
    Field,
    field_serializer,
    field_validator,
)


MOBILE_REGEX = re.compile(r"^[6-9]\d{9}$")


def _validate_mobile(v: Optional[str]) -> Optional[str]:
    if v is None:
        return v
    if not MOBILE_REGEX.match(v):
        raise ValueError("Mobile number must start with 6-9 and have exactly 10 digits")
    return v


def _parse_dd_mm_yyyy_date(v):
    if not v:
        return None
    if isinstance(v, date):
        return v
    if isinstance(v, str):
        v = v.strip()
        if not v:
            return None
        for fmt in ("%d/%m/%Y", "%d-%m-%Y", "%Y-%m-%d"):
            try:
                return datetime.strptime(v, fmt).date()
            except ValueError:
                pass
        raise ValueError(f"Date '{v}' must be in dd/mm/yyyy format")
    return v


class InvitationCreate(BaseModel):
    mobile_number: Optional[str] = None
    valid_days: int = Field(default=7, ge=1, le=365)


class InvitationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    token: str
    expires_at: datetime
    mobile_number: Optional[str]
    is_used: bool


class EmployeeFormPhase1(BaseModel):
    mobile: str
    post: Optional[str] = None
    name: str
    email: Optional[EmailStr] = None
    date_of_birth: Optional[date] = None
    gender: Optional[Literal["male", "female", "other"]] = None
    local_address: Optional[str] = None
    permanent_address: Optional[str] = None
    landline: Optional[str] = None
    same_address: bool = False

    @field_validator("mobile")
    @classmethod
    def validate_mobile(cls, v: str) -> str:
        if not MOBILE_REGEX.match(v):
            raise ValueError("Mobile number must start with 6-9 and have exactly 10 digits")
        return v


class EmployeeFormPhase2(BaseModel):
    qualification: Optional[str] = None
    computer_course: Optional[str] = None
    interview_date: Optional[date] = None
    reference_name: Optional[str] = None
    date_of_joining: Optional[date] = None
    experience_value: Optional[int] = Field(default=None, ge=0)
    experience_unit: Optional[Literal["years", "months"]] = None


class EmployeeFormPhase3(BaseModel):
    emergency_mobile: Optional[str] = None
    emergency_person_name: Optional[str] = None
    emergency_relation: Optional[str] = None
    blood_group: Optional[Literal["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]] = None
    willingness_donate_blood: Optional[bool] = None
    marital_status: Optional[Literal["single", "married", "other"]] = None
    medical_history: Optional[str] = None
    legal_history: Optional[str] = None


class EmployeeFormPhase4(BaseModel):
    religion: Optional[str] = None
    caste: Optional[str] = None
    spouse_name: Optional[str] = None
    anniversary_date: Optional[date] = None


class EmployeeFormSubmit(BaseModel):
    mobile: str
    post: Optional[str] = None
    name: str
    email: Optional[EmailStr] = None
    date_of_birth: Optional[date] = None
    gender: Optional[Literal["male", "female", "other"]] = None
    local_address: Optional[str] = None
    permanent_address: Optional[str] = None
    landline: Optional[str] = None
    qualification: Optional[str] = None
    computer_course: Optional[str] = None
    interview_date: Optional[date] = None
    reference_name: Optional[str] = None
    date_of_joining: Optional[date] = None
    experience_value: Optional[int] = Field(default=None, ge=0)
    experience_unit: Optional[str] = None
    experience_years: Optional[int] = Field(default=0, ge=0)
    experience_months: Optional[int] = Field(default=0, ge=0)
    emergency_mobile: Optional[str] = None
    emergency_person_name: Optional[str] = None
    emergency_relation: Optional[str] = None
    blood_group: Optional[str] = None
    willingness_donate_blood: Optional[bool] = None
    marital_status: Optional[str] = None
    medical_history: Optional[str] = None
    legal_history: Optional[str] = None
    religion: Optional[str] = None
    caste: Optional[str] = None
    spouse_name: Optional[str] = None
    anniversary_date: Optional[date] = None
    created_at: Optional[date] = None

    @field_validator("mobile")
    @classmethod
    def validate_mobile(cls, v: str) -> str:
        if not MOBILE_REGEX.match(v):
            raise ValueError("Mobile number must start with 6-9 and have exactly 10 digits")
        return v

    @field_validator("email", mode="before")
    @classmethod
    def parse_empty_email(cls, v):
        if not v or (isinstance(v, str) and not v.strip()):
            return None
        return v

    @field_validator("gender", mode="before")
    @classmethod
    def parse_gender(cls, v):
        if not v or (isinstance(v, str) and not v.strip()):
            return None
        if isinstance(v, str):
            v_lower = v.strip().lower()
            if v_lower in ("male", "female", "other"):
                return v_lower
        return v

    @field_validator("date_of_birth", "interview_date", "date_of_joining", "anniversary_date", "created_at", mode="before")
    @classmethod
    def parse_submit_dates(cls, v):
        return _parse_dd_mm_yyyy_date(v)

    @field_validator("date_of_birth")
    @classmethod
    def validate_age_18(cls, v: Optional[date]) -> Optional[date]:
        if v is None:
            return v
        today = date.today()
        age = today.year - v.year - ((today.month, today.day) < (v.month, v.day))
        if age < 18:
            raise ValueError("Employee must be at least 18 years old")
        return v


class EmployeeFormResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    submission_reference: str
    submission_status: str
    created_at: datetime
    updated_at: datetime
    mobile_number: str
    post: Optional[str]
    name: str
    email: Optional[str]
    date_of_birth: Optional[date]
    gender: Optional[str]
    local_address: Optional[str]
    permanent_address: Optional[str]
    landline: Optional[str]
    qualification: Optional[str]
    computer_course: Optional[str]
    interview_date: Optional[date]
    reference_name: Optional[str]
    date_of_joining: Optional[date]
    experience_value: Optional[int]
    experience_unit: Optional[str]
    experience_years: Optional[int] = 0
    experience_months: Optional[int] = 0
    emergency_mobile: Optional[str]
    emergency_person_name: Optional[str]
    emergency_relation: Optional[str]
    blood_group: Optional[str]
    willingness_donate_blood: Optional[bool]
    marital_status: Optional[str]
    medical_history: Optional[str]
    legal_history: Optional[str]
    religion: Optional[str]
    caste: Optional[str]
    spouse_name: Optional[str]
    anniversary_date: Optional[date]

    @field_serializer("date_of_birth", "interview_date", "date_of_joining", "anniversary_date", when_used="json")
    def serialize_dates(self, v: Optional[date]) -> Optional[str]:
        if v is None:
            return None
        return v.strftime("%d/%m/%Y")


class EmployeeSearchResult(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    submission_reference: str
    name: str
    mobile_number: str
    post: Optional[str]
    date_of_joining: Optional[date]
    created_at: datetime

    @field_serializer("date_of_joining", when_used="json")
    def serialize_joining_date(self, v: Optional[date]) -> Optional[str]:
        if v is None:
            return None
        return v.strftime("%d/%m/%Y")

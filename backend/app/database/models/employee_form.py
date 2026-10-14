from datetime import date, datetime
from typing import Optional

from sqlalchemy import (
    Date,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.security import utc_now
from app.database.base import Base


class ExperienceUnit:
    YEARS = "years"
    MONTHS = "months"


class EmployeeForm(Base):
    __tablename__ = "employee_forms"

    id: Mapped[int] = mapped_column(primary_key=True)
    submission_reference: Mapped[str] = mapped_column(String(32), unique=True, nullable=False)

    invitation_id: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
        index=True,
    )

    # Phase 1 - Basic & Contact
    mobile_number: Mapped[str] = mapped_column(String(16), nullable=False)
    post: Mapped[Optional[str]] = mapped_column(String(128))
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[Optional[str]] = mapped_column(String(255))
    date_of_birth: Mapped[Optional[date]] = mapped_column(Date())
    gender: Mapped[Optional[str]] = mapped_column(String(16))
    local_address: Mapped[Optional[str]] = mapped_column(Text())
    permanent_address: Mapped[Optional[str]] = mapped_column(Text())
    landline: Mapped[Optional[str]] = mapped_column(String(32))

    # Phase 2 - Education & Employment
    qualification: Mapped[Optional[str]] = mapped_column(String(255))
    computer_course: Mapped[Optional[str]] = mapped_column(String(255))
    interview_date: Mapped[Optional[date]] = mapped_column(Date())
    reference_name: Mapped[Optional[str]] = mapped_column(String(255))
    date_of_joining: Mapped[Optional[date]] = mapped_column(Date())
    experience_value: Mapped[Optional[int]] = mapped_column(Integer())
    experience_unit: Mapped[Optional[str]] = mapped_column(String(16))
    experience_years: Mapped[Optional[int]] = mapped_column(Integer(), default=0)
    experience_months: Mapped[Optional[int]] = mapped_column(Integer(), default=0)

    # Phase 3 - Emergency & Personal
    emergency_mobile: Mapped[Optional[str]] = mapped_column(String(16))
    emergency_person_name: Mapped[Optional[str]] = mapped_column(String(255))
    emergency_relation: Mapped[Optional[str]] = mapped_column(String(64))
    blood_group: Mapped[Optional[str]] = mapped_column(String(8))
    willingness_donate_blood: Mapped[Optional[bool]] = mapped_column()
    marital_status: Mapped[Optional[str]] = mapped_column(String(16))
    medical_history: Mapped[Optional[str]] = mapped_column(Text())
    legal_history: Mapped[Optional[str]] = mapped_column(Text())

    # Phase 4 - Additional Personal
    religion: Mapped[Optional[str]] = mapped_column(String(64))
    caste: Mapped[Optional[str]] = mapped_column(String(64))
    spouse_name: Mapped[Optional[str]] = mapped_column(String(255))
    anniversary_date: Mapped[Optional[date]] = mapped_column(Date())

    submission_status: Mapped[str] = mapped_column(String(32), default="submitted", nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        default=utc_now,
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        default=utc_now,
        onupdate=utc_now,
        nullable=False,
    )


    __table_args__ = (
        Index("ix_employee_forms_mobile_number", "mobile_number"),
        Index("ix_employee_forms_submission_reference", "submission_reference", unique=True),
        Index("ix_employee_forms_created_at", "created_at"),
    )

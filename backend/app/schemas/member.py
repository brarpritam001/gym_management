"""Member schemas."""

from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date, datetime


class MemberCreate(BaseModel):
    full_name: str
    email: EmailStr
    phone: str = ""
    date_of_birth: Optional[date] = None
    gender: str = "other"
    address: str = ""
    emergency_contact: str = ""
    # Membership fields (optional — can create member without membership)
    plan_id: Optional[int] = None  # predefined plan → auto-fill duration + fee
    membership_name: str = ""
    membership_start_date: Optional[date] = None
    membership_end_date: Optional[date] = None
    membership_duration_days: Optional[int] = None  # custom duration override
    membership_fee: Optional[float] = None  # custom fee override


class MemberUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    address: Optional[str] = None
    emergency_contact: Optional[str] = None
    is_active: Optional[bool] = None
    membership_name: Optional[str] = None
    membership_start_date: Optional[date] = None
    membership_end_date: Optional[date] = None
    membership_fee: Optional[float] = None


class MemberResponse(BaseModel):
    id: int
    full_name: str
    email: str
    phone: str
    date_of_birth: Optional[date]
    gender: str
    address: str
    emergency_contact: str
    is_active: bool
    membership_name: str
    membership_start_date: Optional[date]
    membership_end_date: Optional[date]
    membership_fee: float
    joined_date: date
    created_at: datetime

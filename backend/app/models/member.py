"""Member profile model."""

from typing import Optional
from datetime import datetime, date, timezone
from sqlmodel import SQLModel, Field


class MemberProfile(SQLModel, table=True):
    __tablename__ = "members"

    id: Optional[int] = Field(default=None, primary_key=True)
    full_name: str = Field(index=True)
    email: str = Field(unique=True, index=True)
    phone: str = Field(default="")
    date_of_birth: Optional[date] = None
    gender: str = Field(default="other")  # male | female | other
    address: str = Field(default="")
    emergency_contact: str = Field(default="")
    photo_url: str = Field(default="")
    is_active: bool = Field(default=True)
    gym_id: Optional[int] = Field(default=None, foreign_key="gyms.id", index=True)
    # Membership fields (inline on member)
    membership_name: str = Field(default="")
    membership_start_date: Optional[date] = None
    membership_end_date: Optional[date] = None
    membership_fee: float = Field(default=0.0)
    joined_date: date = Field(default_factory=lambda: datetime.now(timezone.utc).date())
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

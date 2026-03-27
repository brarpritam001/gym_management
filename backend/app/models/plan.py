"""Membership plan model."""

from typing import Optional
from datetime import datetime, timezone
from sqlmodel import SQLModel, Field


class MembershipPlan(SQLModel, table=True):
    __tablename__ = "membership_plans"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    description: str = Field(default="")
    duration_days: int  # e.g. 30, 90, 365
    price: float
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

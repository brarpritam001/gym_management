"""Membership model linking members to plans."""

from typing import Optional
from datetime import datetime, date, timezone
from sqlmodel import SQLModel, Field


class Membership(SQLModel, table=True):
    __tablename__ = "memberships"

    id: Optional[int] = Field(default=None, primary_key=True)
    member_id: int = Field(foreign_key="members.id", index=True)
    plan_id: int = Field(foreign_key="membership_plans.id")
    start_date: date
    end_date: date
    status: str = Field(default="active")  # active | expired | cancelled
    auto_renew: bool = Field(default=False)
    gym_id: Optional[int] = Field(default=None, foreign_key="gyms.id", index=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

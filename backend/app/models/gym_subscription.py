"""Gym subscription model — links a gym to a SaaS plan."""

from typing import Optional
from datetime import datetime, date, timezone
from sqlmodel import SQLModel, Field


class GymSubscription(SQLModel, table=True):
    __tablename__ = "gym_subscriptions"

    id: Optional[int] = Field(default=None, primary_key=True)
    gym_id: int = Field(foreign_key="gyms.id", index=True)
    plan_id: int = Field(foreign_key="subscription_plans.id")
    start_date: date = Field(default_factory=lambda: datetime.now(timezone.utc).date())
    end_date: date
    status: str = Field(default="trial")  # trial | active | expired
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

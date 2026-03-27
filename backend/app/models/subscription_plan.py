"""SaaS subscription plan model (FREE, BASIC, PRO, etc.)."""

from typing import Optional
from datetime import datetime, timezone
from sqlmodel import SQLModel, Field


class SubscriptionPlan(SQLModel, table=True):
    __tablename__ = "subscription_plans"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(unique=True, index=True)  # FREE, BASIC, PRO
    member_limit: int = Field(default=10)  # max members allowed
    price: float = Field(default=0.0)  # monthly price
    duration_days: int = Field(default=30)  # billing cycle
    features: str = Field(default="")  # comma-separated feature flags
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

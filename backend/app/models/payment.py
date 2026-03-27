"""Payment model."""

from typing import Optional
from datetime import datetime, timezone
from sqlmodel import SQLModel, Field


class Payment(SQLModel, table=True):
    __tablename__ = "payments"

    id: Optional[int] = Field(default=None, primary_key=True)
    member_id: int = Field(foreign_key="members.id", index=True)
    membership_id: Optional[int] = Field(default=None, foreign_key="memberships.id")
    amount: float
    payment_method: str = Field(default="cash")  # cash | card | upi | online
    status: str = Field(default="completed")  # completed | pending | failed
    notes: str = Field(default="")
    gym_id: Optional[int] = Field(default=None, foreign_key="gyms.id", index=True)
    paid_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

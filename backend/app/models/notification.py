"""Notification model."""

from typing import Optional
from datetime import datetime, timezone
from sqlmodel import SQLModel, Field


class Notification(SQLModel, table=True):
    __tablename__ = "notifications"

    id: Optional[int] = Field(default=None, primary_key=True)
    gym_id: Optional[int] = Field(default=None, foreign_key="gyms.id", index=True)
    user_id: Optional[int] = Field(default=None, foreign_key="users.id", index=True)
    # Optional links used for deduping and auditability
    member_id: Optional[int] = Field(default=None, foreign_key="members.id", index=True)
    membership_id: Optional[int] = Field(default=None, foreign_key="memberships.id", index=True)
    title: str
    message: str
    type: str = Field(default="info")  # info | warning | success | error | expiring | expired | payment_failed | payment_success
    is_read: bool = Field(default=False)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

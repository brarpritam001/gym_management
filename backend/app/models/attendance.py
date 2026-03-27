"""Attendance model."""

from typing import Optional
from datetime import datetime, timezone
from sqlmodel import SQLModel, Field


class Attendance(SQLModel, table=True):
    __tablename__ = "attendance"

    id: Optional[int] = Field(default=None, primary_key=True)
    member_id: int = Field(foreign_key="members.id", index=True)
    check_in: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    check_out: Optional[datetime] = None
    gym_id: Optional[int] = Field(default=None, foreign_key="gyms.id", index=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

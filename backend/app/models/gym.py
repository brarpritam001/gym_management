"""Gym (tenant) model."""

from typing import Optional
from datetime import datetime, timezone
from sqlmodel import SQLModel, Field


class Gym(SQLModel, table=True):
    __tablename__ = "gyms"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    owner_user_id: int = Field(foreign_key="users.id", index=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

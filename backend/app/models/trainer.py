"""Trainer model."""

from typing import Optional
from datetime import datetime, timezone
from sqlmodel import SQLModel, Field


class Trainer(SQLModel, table=True):
    __tablename__ = "trainers"

    id: Optional[int] = Field(default=None, primary_key=True)
    full_name: str = Field(index=True)
    email: str = Field(unique=True)
    phone: str = Field(default="")
    specialization: str = Field(default="")
    salary: float = Field(default=0.0)
    is_active: bool = Field(default=True)
    gym_id: Optional[int] = Field(default=None, foreign_key="gyms.id", index=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

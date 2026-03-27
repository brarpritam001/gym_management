"""User model for authentication."""

from typing import Optional
from datetime import datetime, timezone
from sqlmodel import SQLModel, Field


class User(SQLModel, table=True):
    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    full_name: str
    hashed_password: str
    role: str = Field(default="admin")  # admin | staff
    is_active: bool = Field(default=True)
    gym_id: Optional[int] = Field(default=None, foreign_key="gyms.id", index=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

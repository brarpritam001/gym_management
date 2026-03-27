"""Membership plan schemas."""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class PlanCreate(BaseModel):
    name: str
    description: str = ""
    duration_days: int
    price: float


class PlanUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    duration_days: Optional[int] = None
    price: Optional[float] = None
    is_active: Optional[bool] = None


class PlanResponse(BaseModel):
    id: int
    name: str
    description: str
    duration_days: int
    price: float
    is_active: bool
    created_at: datetime

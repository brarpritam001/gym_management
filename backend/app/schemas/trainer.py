"""Trainer schemas."""

from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class TrainerCreate(BaseModel):
    full_name: str
    email: EmailStr
    phone: str = ""
    specialization: str = ""
    salary: float = 0.0


class TrainerUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    specialization: Optional[str] = None
    salary: Optional[float] = None
    is_active: Optional[bool] = None


class TrainerResponse(BaseModel):
    id: int
    full_name: str
    email: str
    phone: str
    specialization: str
    salary: float
    is_active: bool
    created_at: datetime

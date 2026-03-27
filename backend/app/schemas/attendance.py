"""Attendance schemas."""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class CheckInRequest(BaseModel):
    member_id: int


class CheckOutRequest(BaseModel):
    member_id: int


class AttendanceResponse(BaseModel):
    id: int
    member_id: int
    check_in: datetime
    check_out: Optional[datetime]
    member_name: Optional[str] = None

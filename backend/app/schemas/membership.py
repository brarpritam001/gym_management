"""Membership schemas."""

from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime


class MembershipCreate(BaseModel):
    member_id: int
    plan_id: int
    start_date: date
    auto_renew: bool = False


class MembershipUpdate(BaseModel):
    status: Optional[str] = None
    auto_renew: Optional[bool] = None


class MembershipResponse(BaseModel):
    id: int
    member_id: int
    plan_id: int
    start_date: date
    end_date: date
    status: str
    auto_renew: bool
    created_at: datetime
    # Joined fields
    member_name: Optional[str] = None
    plan_name: Optional[str] = None

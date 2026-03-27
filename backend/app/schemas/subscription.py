"""SaaS subscription schemas."""

from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional


class SubscriptionPlanResponse(BaseModel):
    id: int
    name: str
    member_limit: int
    price: float
    duration_days: int
    features: str
    is_active: bool


class GymSubscriptionResponse(BaseModel):
    id: int
    gym_id: int
    plan_id: int
    plan_name: str = ""
    member_limit: int = 0
    start_date: date
    end_date: date
    status: str
    current_members: int = 0


class UpgradePlanRequest(BaseModel):
    plan_id: int

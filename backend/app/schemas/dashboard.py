"""Dashboard schemas."""

from pydantic import BaseModel


class DashboardStats(BaseModel):
    total_members: int
    active_memberships: int
    expiring_soon: int  # expiring within 7 days
    monthly_revenue: float
    total_trainers: int
    today_check_ins: int
    member_limit: int = 0  # from SaaS subscription plan
    current_plan: str = ""  # current SaaS plan name

"""Dashboard analytics service."""

from typing import Optional
from datetime import datetime, timezone
from sqlmodel import Session
from app.repositories.member_repo import MemberRepository
from app.repositories.membership_repo import MembershipRepository
from app.repositories.payment_repo import PaymentRepository
from app.repositories.attendance_repo import AttendanceRepository
from app.repositories.trainer_repo import TrainerRepository
from app.repositories.gym_repo import GymRepository
from app.schemas.dashboard import DashboardStats


class DashboardService:
    def __init__(self, session: Session, gym_id: Optional[int] = None):
        self.member_repo = MemberRepository(session, gym_id)
        self.membership_repo = MembershipRepository(session, gym_id)
        self.payment_repo = PaymentRepository(session, gym_id)
        self.attendance_repo = AttendanceRepository(session, gym_id)
        self.trainer_repo = TrainerRepository(session, gym_id)
        self.gym_repo = GymRepository(session)
        self.gym_id = gym_id

    def get_stats(self) -> DashboardStats:
        now = datetime.now(timezone.utc)

        # Get subscription info if gym_id is set
        member_limit = 0
        current_plan = ""
        if self.gym_id:
            sub = self.gym_repo.get_active_subscription(self.gym_id)
            if sub:
                plan = self.gym_repo.get_subscription_plan(sub.plan_id)
                if plan:
                    member_limit = plan.member_limit
                    current_plan = plan.name

        return DashboardStats(
            total_members=self.member_repo.count(),
            active_memberships=self.membership_repo.count_active(),
            expiring_soon=self.membership_repo.count_expiring_soon(7),
            monthly_revenue=self.payment_repo.monthly_revenue(now.year, now.month),
            total_trainers=self.trainer_repo.count_active(),
            today_check_ins=self.attendance_repo.today_count(),
            member_limit=member_limit,
            current_plan=current_plan,
        )

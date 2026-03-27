"""Gym repository."""

from typing import Optional
from sqlmodel import Session, select
from app.models.gym import Gym
from app.models.gym_subscription import GymSubscription
from app.models.subscription_plan import SubscriptionPlan


class GymRepository:
    def __init__(self, session: Session):
        self.session = session

    def get_by_id(self, gym_id: int) -> Optional[Gym]:
        return self.session.get(Gym, gym_id)

    def get_by_owner(self, user_id: int) -> Optional[Gym]:
        return self.session.exec(
            select(Gym).where(Gym.owner_user_id == user_id)
        ).first()

    def create(self, gym: Gym) -> Gym:
        self.session.add(gym)
        self.session.commit()
        self.session.refresh(gym)
        return gym

    def get_active_subscription(self, gym_id: int) -> Optional[GymSubscription]:
        return self.session.exec(
            select(GymSubscription).where(
                GymSubscription.gym_id == gym_id,
                GymSubscription.status.in_(["trial", "active"]),
            )
        ).first()

    def get_subscription_plan(self, plan_id: int) -> Optional[SubscriptionPlan]:
        return self.session.get(SubscriptionPlan, plan_id)

    def get_member_count(self, gym_id: int) -> int:
        from app.models.member import MemberProfile
        return len(
            self.session.exec(
                select(MemberProfile).where(MemberProfile.gym_id == gym_id)
            ).all()
        )

    def create_subscription(self, sub: GymSubscription) -> GymSubscription:
        self.session.add(sub)
        self.session.commit()
        self.session.refresh(sub)
        return sub

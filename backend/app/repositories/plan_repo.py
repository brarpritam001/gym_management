"""Membership plan repository."""

from typing import Optional
from sqlmodel import Session, select
from app.models.plan import MembershipPlan


class PlanRepository:
    def __init__(self, session: Session):
        self.session = session

    def get_all(self) -> list[MembershipPlan]:
        return list(self.session.exec(select(MembershipPlan)).all())

    def get_by_id(self, plan_id: int) -> Optional[MembershipPlan]:
        return self.session.get(MembershipPlan, plan_id)

    def create(self, plan: MembershipPlan) -> MembershipPlan:
        self.session.add(plan)
        self.session.commit()
        self.session.refresh(plan)
        return plan

    def update(self, plan: MembershipPlan, data: dict) -> MembershipPlan:
        for key, value in data.items():
            if value is not None:
                setattr(plan, key, value)
        self.session.add(plan)
        self.session.commit()
        self.session.refresh(plan)
        return plan

    def delete(self, plan: MembershipPlan) -> None:
        self.session.delete(plan)
        self.session.commit()

"""Membership plan service."""

from fastapi import HTTPException
from sqlmodel import Session
from app.models.plan import MembershipPlan
from app.repositories.plan_repo import PlanRepository
from app.schemas.plan import PlanCreate, PlanUpdate, PlanResponse


class PlanService:
    def __init__(self, session: Session):
        self.repo = PlanRepository(session)

    def list_plans(self) -> list[PlanResponse]:
        plans = self.repo.get_all()
        return [PlanResponse.model_validate(p, from_attributes=True) for p in plans]

    def get_plan(self, plan_id: int) -> PlanResponse:
        plan = self.repo.get_by_id(plan_id)
        if not plan:
            raise HTTPException(status_code=404, detail="Plan not found")
        return PlanResponse.model_validate(plan, from_attributes=True)

    def create_plan(self, data: PlanCreate) -> PlanResponse:
        plan = MembershipPlan(**data.model_dump())
        plan = self.repo.create(plan)
        return PlanResponse.model_validate(plan, from_attributes=True)

    def update_plan(self, plan_id: int, data: PlanUpdate) -> PlanResponse:
        plan = self.repo.get_by_id(plan_id)
        if not plan:
            raise HTTPException(status_code=404, detail="Plan not found")
        plan = self.repo.update(plan, data.model_dump(exclude_unset=True))
        return PlanResponse.model_validate(plan, from_attributes=True)

    def delete_plan(self, plan_id: int) -> dict:
        plan = self.repo.get_by_id(plan_id)
        if not plan:
            raise HTTPException(status_code=404, detail="Plan not found")
        self.repo.delete(plan)
        return {"detail": "Plan deleted"}

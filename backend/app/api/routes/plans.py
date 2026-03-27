"""Membership plan routes."""

from fastapi import APIRouter, Depends
from sqlmodel import Session
from app.database.session import get_session
from app.services.plan_service import PlanService
from app.schemas.plan import PlanCreate, PlanUpdate, PlanResponse
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/plans", tags=["Plans"], dependencies=[Depends(get_current_user)])


@router.get("/", response_model=list[PlanResponse])
def list_plans(session: Session = Depends(get_session)):
    return PlanService(session).list_plans()


@router.get("/{plan_id}", response_model=PlanResponse)
def get_plan(plan_id: int, session: Session = Depends(get_session)):
    return PlanService(session).get_plan(plan_id)


@router.post("/", response_model=PlanResponse)
def create_plan(data: PlanCreate, session: Session = Depends(get_session)):
    return PlanService(session).create_plan(data)


@router.put("/{plan_id}", response_model=PlanResponse)
def update_plan(plan_id: int, data: PlanUpdate, session: Session = Depends(get_session)):
    return PlanService(session).update_plan(plan_id, data)


@router.delete("/{plan_id}")
def delete_plan(plan_id: int, session: Session = Depends(get_session)):
    return PlanService(session).delete_plan(plan_id)

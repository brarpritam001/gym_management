"""SaaS subscription routes."""

from datetime import date, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.database.session import get_session
from app.models.subscription_plan import SubscriptionPlan
from app.models.gym_subscription import GymSubscription
from app.repositories.gym_repo import GymRepository
from app.schemas.subscription import SubscriptionPlanResponse, GymSubscriptionResponse, UpgradePlanRequest
from app.core.dependencies import get_current_user, get_current_gym_id

router = APIRouter(prefix="/subscription", tags=["Subscription"], dependencies=[Depends(get_current_user)])


@router.get("/plans", response_model=list[SubscriptionPlanResponse])
def list_subscription_plans(session: Session = Depends(get_session)):
    """List all available SaaS subscription plans."""
    plans = session.exec(select(SubscriptionPlan).where(SubscriptionPlan.is_active == True)).all()
    return [SubscriptionPlanResponse.model_validate(p, from_attributes=True) for p in plans]


@router.get("/current", response_model=GymSubscriptionResponse)
def get_current_subscription(session: Session = Depends(get_session), gym_id: int = Depends(get_current_gym_id)):
    """Get the current gym's active subscription."""
    repo = GymRepository(session)
    sub = repo.get_active_subscription(gym_id)
    if not sub:
        raise HTTPException(status_code=404, detail="No active subscription")
    plan = repo.get_subscription_plan(sub.plan_id)
    current_members = repo.get_member_count(gym_id)
    return GymSubscriptionResponse(
        id=sub.id,
        gym_id=sub.gym_id,
        plan_id=sub.plan_id,
        plan_name=plan.name if plan else "",
        member_limit=plan.member_limit if plan else 0,
        start_date=sub.start_date,
        end_date=sub.end_date,
        status=sub.status,
        current_members=current_members,
    )


@router.post("/upgrade", response_model=GymSubscriptionResponse)
def upgrade_plan(data: UpgradePlanRequest, session: Session = Depends(get_session), gym_id: int = Depends(get_current_gym_id)):
    """Upgrade the gym's subscription plan (placeholder — no payment yet)."""
    repo = GymRepository(session)
    new_plan = repo.get_subscription_plan(data.plan_id)
    if not new_plan:
        raise HTTPException(status_code=404, detail="Plan not found")

    # Expire current subscription
    current_sub = repo.get_active_subscription(gym_id)
    if current_sub:
        current_sub.status = "expired"
        session.add(current_sub)

    # Create new subscription
    new_sub = GymSubscription(
        gym_id=gym_id,
        plan_id=new_plan.id,
        start_date=date.today(),
        end_date=date.today() + timedelta(days=new_plan.duration_days),
        status="active",
    )
    session.add(new_sub)
    session.commit()
    session.refresh(new_sub)

    current_members = repo.get_member_count(gym_id)
    return GymSubscriptionResponse(
        id=new_sub.id,
        gym_id=new_sub.gym_id,
        plan_id=new_sub.plan_id,
        plan_name=new_plan.name,
        member_limit=new_plan.member_limit,
        start_date=new_sub.start_date,
        end_date=new_sub.end_date,
        status=new_sub.status,
        current_members=current_members,
    )

"""Dashboard routes."""

from fastapi import APIRouter, Depends
from sqlmodel import Session
from app.database.session import get_session
from app.services.dashboard_service import DashboardService
from app.schemas.dashboard import DashboardStats
from app.core.dependencies import get_current_user, get_current_gym_id

router = APIRouter(prefix="/dashboard", tags=["Dashboard"], dependencies=[Depends(get_current_user)])


@router.get("/stats", response_model=DashboardStats)
def get_stats(session: Session = Depends(get_session), gym_id: int = Depends(get_current_gym_id)):
    return DashboardService(session, gym_id).get_stats()

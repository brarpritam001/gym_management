"""Payment routes."""

from fastapi import APIRouter, Depends
from sqlmodel import Session
from app.database.session import get_session
from app.services.payment_service import PaymentService
from app.schemas.payment import PaymentCreate, PaymentResponse
from app.core.dependencies import get_current_user, get_current_gym_id

router = APIRouter(prefix="/payments", tags=["Payments"], dependencies=[Depends(get_current_user)])


@router.get("/", response_model=list[PaymentResponse])
def list_payments(skip: int = 0, limit: int = 100, session: Session = Depends(get_session), gym_id: int = Depends(get_current_gym_id)):
    return PaymentService(session, gym_id).list_payments(skip, limit)


@router.post("/", response_model=PaymentResponse)
def create_payment(data: PaymentCreate, session: Session = Depends(get_session), gym_id: int = Depends(get_current_gym_id)):
    return PaymentService(session, gym_id).create_payment(data)


@router.get("/member/{member_id}", response_model=list[PaymentResponse])
def member_payments(member_id: int, session: Session = Depends(get_session), gym_id: int = Depends(get_current_gym_id)):
    return PaymentService(session, gym_id).get_member_payments(member_id)

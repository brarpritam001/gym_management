"""Payment service."""

from typing import Optional
from fastapi import HTTPException
from sqlmodel import Session
from app.models.payment import Payment
from app.repositories.payment_repo import PaymentRepository
from app.repositories.member_repo import MemberRepository
from app.schemas.payment import PaymentCreate, PaymentResponse
from app.services.notification_service import NotificationService


class PaymentService:
    def __init__(self, session: Session, gym_id: Optional[int] = None):
        self.repo = PaymentRepository(session, gym_id)
        self.member_repo = MemberRepository(session, gym_id)
        self.notifications = NotificationService(session, gym_id)

    def list_payments(self, skip: int = 0, limit: int = 100) -> list[PaymentResponse]:
        payments = self.repo.get_all(skip, limit)
        return [self._enrich(p) for p in payments]

    def create_payment(self, data: PaymentCreate) -> PaymentResponse:
        member = self.member_repo.get_by_id(data.member_id)
        if not member:
            raise HTTPException(status_code=404, detail="Member not found")
        payment = Payment(**data.model_dump())
        payment = self.repo.create(payment)
        enriched = self._enrich(payment)
        if payment.status.lower() == "failed":
            self.notifications.payment_failed(payment, member)
        else:
            self.notifications.payment_success(payment, member)
        return enriched

    def get_member_payments(self, member_id: int) -> list[PaymentResponse]:
        return [self._enrich(p) for p in self.repo.get_by_member(member_id)]

    def _enrich(self, p: Payment) -> PaymentResponse:
        member = self.member_repo.get_by_id(p.member_id)
        return PaymentResponse(
            id=p.id,
            member_id=p.member_id,
            membership_id=p.membership_id,
            amount=p.amount,
            payment_method=p.payment_method,
            status=p.status,
            notes=p.notes,
            paid_at=p.paid_at,
            created_at=p.created_at,
            member_name=member.full_name if member else None,
        )

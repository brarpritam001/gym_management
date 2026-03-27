"""Payment repository."""

from typing import Optional
from sqlmodel import Session, select
from app.models.payment import Payment


class PaymentRepository:
    def __init__(self, session: Session, gym_id: Optional[int] = None):
        self.session = session
        self.gym_id = gym_id

    def _base_query(self):
        stmt = select(Payment)
        if self.gym_id is not None:
            stmt = stmt.where(Payment.gym_id == self.gym_id)
        return stmt

    def get_all(self, skip: int = 0, limit: int = 100) -> list[Payment]:
        return list(
            self.session.exec(self._base_query().order_by(Payment.paid_at.desc()).offset(skip).limit(limit)).all()
        )

    def get_by_member(self, member_id: int) -> list[Payment]:
        stmt = self._base_query().where(Payment.member_id == member_id).order_by(Payment.paid_at.desc())
        return list(self.session.exec(stmt).all())

    def create(self, payment: Payment) -> Payment:
        if self.gym_id is not None:
            payment.gym_id = self.gym_id
        self.session.add(payment)
        self.session.commit()
        self.session.refresh(payment)
        return payment

    def monthly_revenue(self, year: int, month: int) -> float:
        stmt = self._base_query().where(Payment.status == "completed")
        payments = self.session.exec(stmt).all()
        total = 0.0
        for p in payments:
            if p.paid_at.year == year and p.paid_at.month == month:
                total += p.amount
        return total

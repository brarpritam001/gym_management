"""Membership repository."""

from typing import Optional
from datetime import date, timedelta
from sqlmodel import Session, select
from app.models.membership import Membership


class MembershipRepository:
    def __init__(self, session: Session, gym_id: Optional[int] = None):
        self.session = session
        self.gym_id = gym_id

    def _base_query(self):
        stmt = select(Membership)
        if self.gym_id is not None:
            stmt = stmt.where(Membership.gym_id == self.gym_id)
        return stmt

    def get_all(self, skip: int = 0, limit: int = 100) -> list[Membership]:
        return list(self.session.exec(self._base_query().offset(skip).limit(limit)).all())

    def get_by_id(self, membership_id: int) -> Optional[Membership]:
        m = self.session.get(Membership, membership_id)
        if m and self.gym_id is not None and m.gym_id != self.gym_id:
            return None
        return m

    def get_by_member(self, member_id: int) -> list[Membership]:
        stmt = self._base_query().where(Membership.member_id == member_id)
        return list(self.session.exec(stmt).all())

    def create(self, membership: Membership) -> Membership:
        if self.gym_id is not None:
            membership.gym_id = self.gym_id
        self.session.add(membership)
        self.session.commit()
        self.session.refresh(membership)
        return membership

    def update(self, membership: Membership, data: dict) -> Membership:
        for key, value in data.items():
            if value is not None:
                setattr(membership, key, value)
        self.session.add(membership)
        self.session.commit()
        self.session.refresh(membership)
        return membership

    def count_active(self) -> int:
        stmt = self._base_query().where(Membership.status == "active")
        return len(self.session.exec(stmt).all())

    def count_expiring_soon(self, days: int = 7) -> int:
        threshold = date.today() + timedelta(days=days)
        stmt = self._base_query().where(
            Membership.status == "active",
            Membership.end_date <= threshold,
            Membership.end_date >= date.today(),
        )
        return len(self.session.exec(stmt).all())

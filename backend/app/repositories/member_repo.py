"""Member repository."""

from typing import Optional
from sqlmodel import Session, select
from app.models.member import MemberProfile


class MemberRepository:
    def __init__(self, session: Session, gym_id: Optional[int] = None):
        self.session = session
        self.gym_id = gym_id

    def _base_query(self):
        stmt = select(MemberProfile)
        if self.gym_id is not None:
            stmt = stmt.where(MemberProfile.gym_id == self.gym_id)
        return stmt

    def get_all(self, skip: int = 0, limit: int = 100) -> list[MemberProfile]:
        return list(self.session.exec(self._base_query().offset(skip).limit(limit)).all())

    def get_by_id(self, member_id: int) -> Optional[MemberProfile]:
        member = self.session.get(MemberProfile, member_id)
        if member and self.gym_id is not None and member.gym_id != self.gym_id:
            return None
        return member

    def get_by_email(self, email: str) -> Optional[MemberProfile]:
        return self.session.exec(select(MemberProfile).where(MemberProfile.email == email)).first()

    def create(self, member: MemberProfile) -> MemberProfile:
        if self.gym_id is not None:
            member.gym_id = self.gym_id
        self.session.add(member)
        self.session.commit()
        self.session.refresh(member)
        return member

    def update(self, member: MemberProfile, data: dict) -> MemberProfile:
        for key, value in data.items():
            if value is not None:
                setattr(member, key, value)
        self.session.add(member)
        self.session.commit()
        self.session.refresh(member)
        return member

    def delete(self, member: MemberProfile) -> None:
        self.session.delete(member)
        self.session.commit()

    def count(self) -> int:
        return len(self.session.exec(self._base_query()).all())

    def count_active(self) -> int:
        stmt = self._base_query().where(MemberProfile.is_active == True)
        return len(self.session.exec(stmt).all())

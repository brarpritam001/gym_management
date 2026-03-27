"""Notification repository."""

from typing import Optional, Iterable
from sqlmodel import Session, select
from app.models.notification import Notification


class NotificationRepository:
    def __init__(self, session: Session, gym_id: Optional[int] = None):
        self.session = session
        self.gym_id = gym_id

    def _base_query(self):
        stmt = select(Notification)
        if self.gym_id is not None:
            stmt = stmt.where(Notification.gym_id == self.gym_id)
        return stmt

    def count(self) -> int:
        return len(self.session.exec(self._base_query()).all())

    def list(self, skip: int = 0, limit: int = 50) -> list[Notification]:
        return list(
            self.session.exec(
                self._base_query()
                .order_by(Notification.created_at.desc())
                .offset(skip)
                .limit(limit)
            ).all()
        )

    def create(self, notification: Notification) -> Notification:
        if self.gym_id is not None:
            notification.gym_id = self.gym_id
        self.session.add(notification)
        self.session.commit()
        self.session.refresh(notification)
        return notification

    def mark_read(self, notification_id: int) -> Optional[Notification]:
        n = self.session.get(Notification, notification_id)
        if not n:
            return None
        if self.gym_id is not None and n.gym_id != self.gym_id:
            return None
        n.is_read = True
        self.session.add(n)
        self.session.commit()
        self.session.refresh(n)
        return n

    def exists(self, *, type: str, member_id: Optional[int], membership_id: Optional[int], message: str) -> bool:
        stmt = self._base_query().where(
            Notification.type == type,
            Notification.message == message,
        )
        if member_id is not None:
            stmt = stmt.where(Notification.member_id == member_id)
        if membership_id is not None:
            stmt = stmt.where(Notification.membership_id == membership_id)
        return self.session.exec(stmt).first() is not None

    def delete_for_member(self, member_id: int, types: Iterable[str]) -> int:
        stmt = self._base_query().where(
            Notification.member_id == member_id,
            Notification.type.in_(list(types)),
        )
        rows = self.session.exec(stmt).all()
        deleted = 0
        for r in rows:
            self.session.delete(r)
            deleted += 1
        if deleted:
            self.session.commit()
        return deleted

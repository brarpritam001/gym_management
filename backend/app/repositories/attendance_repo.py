"""Attendance repository."""

from typing import Optional
from datetime import date
from sqlmodel import Session, select
from app.models.attendance import Attendance


class AttendanceRepository:
    def __init__(self, session: Session, gym_id: Optional[int] = None):
        self.session = session
        self.gym_id = gym_id

    def _base_query(self):
        stmt = select(Attendance)
        if self.gym_id is not None:
            stmt = stmt.where(Attendance.gym_id == self.gym_id)
        return stmt

    def get_all(self, skip: int = 0, limit: int = 100) -> list[Attendance]:
        return list(
            self.session.exec(
                self._base_query().order_by(Attendance.check_in.desc()).offset(skip).limit(limit)
            ).all()
        )

    def get_open_session(self, member_id: int) -> Optional[Attendance]:
        """Find an active check-in (no check-out yet)."""
        stmt = self._base_query().where(
            Attendance.member_id == member_id,
            Attendance.check_out == None,
        )
        return self.session.exec(stmt).first()

    def create(self, attendance: Attendance) -> Attendance:
        if self.gym_id is not None:
            attendance.gym_id = self.gym_id
        self.session.add(attendance)
        self.session.commit()
        self.session.refresh(attendance)
        return attendance

    def update(self, attendance: Attendance) -> Attendance:
        self.session.add(attendance)
        self.session.commit()
        self.session.refresh(attendance)
        return attendance

    def today_count(self) -> int:
        today = date.today()
        records = self.session.exec(self._base_query()).all()
        return len([r for r in records if r.check_in.date() == today])

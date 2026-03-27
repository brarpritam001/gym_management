"""Attendance service."""

from typing import Optional
from datetime import datetime, timezone
from fastapi import HTTPException
from sqlmodel import Session
from app.models.attendance import Attendance
from app.repositories.attendance_repo import AttendanceRepository
from app.repositories.member_repo import MemberRepository
from app.schemas.attendance import AttendanceResponse


class AttendanceService:
    def __init__(self, session: Session, gym_id: Optional[int] = None):
        self.repo = AttendanceRepository(session, gym_id)
        self.member_repo = MemberRepository(session, gym_id)

    def list_attendance(self, skip: int = 0, limit: int = 100) -> list[AttendanceResponse]:
        records = self.repo.get_all(skip, limit)
        return [self._enrich(r) for r in records]

    def check_in(self, member_id: int) -> AttendanceResponse:
        member = self.member_repo.get_by_id(member_id)
        if not member:
            raise HTTPException(status_code=404, detail="Member not found")
        # Prevent double check-in
        existing = self.repo.get_open_session(member_id)
        if existing:
            raise HTTPException(status_code=400, detail="Member already checked in")
        attendance = Attendance(member_id=member_id)
        attendance = self.repo.create(attendance)
        return self._enrich(attendance)

    def check_out(self, member_id: int) -> AttendanceResponse:
        session = self.repo.get_open_session(member_id)
        if not session:
            raise HTTPException(status_code=400, detail="No active check-in found")
        session.check_out = datetime.now(timezone.utc)
        session = self.repo.update(session)
        return self._enrich(session)

    def _enrich(self, a: Attendance) -> AttendanceResponse:
        member = self.member_repo.get_by_id(a.member_id)
        return AttendanceResponse(
            id=a.id,
            member_id=a.member_id,
            check_in=a.check_in,
            check_out=a.check_out,
            member_name=member.full_name if member else None,
        )

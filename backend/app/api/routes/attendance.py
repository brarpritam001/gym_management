"""Attendance routes."""

from fastapi import APIRouter, Depends
from sqlmodel import Session
from app.database.session import get_session
from app.services.attendance_service import AttendanceService
from app.schemas.attendance import CheckInRequest, CheckOutRequest, AttendanceResponse
from app.core.dependencies import get_current_user, get_current_gym_id

router = APIRouter(prefix="/attendance", tags=["Attendance"], dependencies=[Depends(get_current_user)])


@router.get("/", response_model=list[AttendanceResponse])
def list_attendance(skip: int = 0, limit: int = 100, session: Session = Depends(get_session), gym_id: int = Depends(get_current_gym_id)):
    return AttendanceService(session, gym_id).list_attendance(skip, limit)


@router.post("/checkin", response_model=AttendanceResponse)
def check_in(data: CheckInRequest, session: Session = Depends(get_session), gym_id: int = Depends(get_current_gym_id)):
    return AttendanceService(session, gym_id).check_in(data.member_id)


@router.post("/checkout", response_model=AttendanceResponse)
def check_out(data: CheckOutRequest, session: Session = Depends(get_session), gym_id: int = Depends(get_current_gym_id)):
    return AttendanceService(session, gym_id).check_out(data.member_id)

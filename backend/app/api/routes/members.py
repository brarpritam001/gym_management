"""Member CRUD routes."""

from fastapi import APIRouter, Depends
from sqlmodel import Session
from app.database.session import get_session
from app.services.member_service import MemberService
from app.schemas.member import MemberCreate, MemberUpdate, MemberResponse
from app.core.dependencies import get_current_user, get_current_gym_id, check_member_limit

router = APIRouter(prefix="/members", tags=["Members"], dependencies=[Depends(get_current_user)])


@router.get("/", response_model=list[MemberResponse])
def list_members(skip: int = 0, limit: int = 100, session: Session = Depends(get_session), gym_id: int = Depends(get_current_gym_id)):
    return MemberService(session, gym_id).list_members(skip, limit)


@router.get("/{member_id}", response_model=MemberResponse)
def get_member(member_id: int, session: Session = Depends(get_session), gym_id: int = Depends(get_current_gym_id)):
    return MemberService(session, gym_id).get_member(member_id)


@router.post("/", response_model=MemberResponse)
def create_member(data: MemberCreate, session: Session = Depends(get_session), gym_id: int = Depends(check_member_limit)):
    return MemberService(session, gym_id).create_member(data)


@router.put("/{member_id}", response_model=MemberResponse)
def update_member(member_id: int, data: MemberUpdate, session: Session = Depends(get_session), gym_id: int = Depends(get_current_gym_id)):
    return MemberService(session, gym_id).update_member(member_id, data)


@router.delete("/{member_id}")
def delete_member(member_id: int, session: Session = Depends(get_session), gym_id: int = Depends(get_current_gym_id)):
    return MemberService(session, gym_id).delete_member(member_id)

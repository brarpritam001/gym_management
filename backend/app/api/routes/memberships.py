"""Membership routes."""

from fastapi import APIRouter, Depends
from sqlmodel import Session
from app.database.session import get_session
from app.services.membership_service import MembershipService
from app.schemas.membership import MembershipCreate, MembershipUpdate, MembershipResponse
from app.core.dependencies import get_current_user, get_current_gym_id

router = APIRouter(prefix="/memberships", tags=["Memberships"], dependencies=[Depends(get_current_user)])


@router.get("/", response_model=list[MembershipResponse])
def list_memberships(skip: int = 0, limit: int = 100, session: Session = Depends(get_session), gym_id: int = Depends(get_current_gym_id)):
    return MembershipService(session, gym_id).list_memberships(skip, limit)


@router.get("/{membership_id}", response_model=MembershipResponse)
def get_membership(membership_id: int, session: Session = Depends(get_session), gym_id: int = Depends(get_current_gym_id)):
    return MembershipService(session, gym_id).get_membership(membership_id)


@router.post("/", response_model=MembershipResponse)
def create_membership(data: MembershipCreate, session: Session = Depends(get_session), gym_id: int = Depends(get_current_gym_id)):
    return MembershipService(session, gym_id).create_membership(data)


@router.put("/{membership_id}", response_model=MembershipResponse)
def update_membership(membership_id: int, data: MembershipUpdate, session: Session = Depends(get_session), gym_id: int = Depends(get_current_gym_id)):
    return MembershipService(session, gym_id).update_membership(membership_id, data)

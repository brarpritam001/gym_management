"""Member service."""

from typing import Optional
from datetime import timedelta
from fastapi import HTTPException
from sqlmodel import Session
from app.models.member import MemberProfile
from app.repositories.member_repo import MemberRepository
from app.repositories.plan_repo import PlanRepository
from app.schemas.member import MemberCreate, MemberUpdate, MemberResponse
from app.services.notification_service import NotificationService


class MemberService:
    def __init__(self, session: Session, gym_id: Optional[int] = None):
        self.repo = MemberRepository(session, gym_id)
        self.plan_repo = PlanRepository(session)
        self.notifications = NotificationService(session, gym_id)

    def list_members(self, skip: int = 0, limit: int = 100) -> list[MemberResponse]:
        members = self.repo.get_all(skip, limit)
        return [MemberResponse.model_validate(m, from_attributes=True) for m in members]

    def get_member(self, member_id: int) -> MemberResponse:
        member = self.repo.get_by_id(member_id)
        if not member:
            raise HTTPException(status_code=404, detail="Member not found")
        return MemberResponse.model_validate(member, from_attributes=True)

    def create_member(self, data: MemberCreate) -> MemberResponse:
        if self.repo.get_by_email(data.email):
            raise HTTPException(status_code=400, detail="Email already exists")

        # Extract membership-specific fields before creating the model
        plan_id = data.plan_id
        custom_duration = data.membership_duration_days
        custom_fee = data.membership_fee
        start_date = data.membership_start_date
        end_date = data.membership_end_date
        membership_name = data.membership_name

        # Build the member with core fields only
        member_data = data.model_dump(exclude={
            "plan_id", "membership_duration_days", "membership_fee",
            "membership_start_date", "membership_end_date", "membership_name",
        })
        member = MemberProfile(**member_data)

        # Apply membership from predefined plan if selected
        if plan_id:
            plan = self.plan_repo.get_by_id(plan_id)
            if not plan:
                raise HTTPException(status_code=404, detail="Membership plan not found")
            # Use plan defaults, but allow overrides
            member.membership_name = membership_name or plan.name
            member.membership_fee = custom_fee if custom_fee is not None else plan.price
            duration = custom_duration if custom_duration else plan.duration_days
            if start_date:
                member.membership_start_date = start_date
                member.membership_end_date = end_date or (start_date + timedelta(days=duration))
            else:
                from datetime import date as date_type
                member.membership_start_date = date_type.today()
                member.membership_end_date = end_date or (date_type.today() + timedelta(days=duration))
        elif membership_name or start_date or custom_fee is not None:
            # Custom membership (no plan selected)
            member.membership_name = membership_name or "Custom"
            member.membership_fee = custom_fee if custom_fee is not None else 0.0
            if start_date:
                member.membership_start_date = start_date
                if end_date:
                    member.membership_end_date = end_date
                elif custom_duration:
                    member.membership_end_date = start_date + timedelta(days=custom_duration)

        member = self.repo.create(member)
        self.notifications.member_created(member)
        return MemberResponse.model_validate(member, from_attributes=True)

    def update_member(self, member_id: int, data: MemberUpdate) -> MemberResponse:
        member = self.repo.get_by_id(member_id)
        if not member:
            raise HTTPException(status_code=404, detail="Member not found")
        member = self.repo.update(member, data.model_dump(exclude_unset=True))
        return MemberResponse.model_validate(member, from_attributes=True)

    def delete_member(self, member_id: int) -> dict:
        member = self.repo.get_by_id(member_id)
        if not member:
            raise HTTPException(status_code=404, detail="Member not found")
        self.repo.delete(member)
        return {"detail": "Member deleted"}

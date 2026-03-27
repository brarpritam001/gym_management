"""Membership service with auto expiry calculation."""

from typing import Optional
from datetime import timedelta
from fastapi import HTTPException
from sqlmodel import Session
from app.models.membership import Membership
from app.repositories.membership_repo import MembershipRepository
from app.repositories.plan_repo import PlanRepository
from app.repositories.member_repo import MemberRepository
from app.schemas.membership import MembershipCreate, MembershipUpdate, MembershipResponse
from app.services.notification_service import NotificationService


class MembershipService:
    def __init__(self, session: Session, gym_id: Optional[int] = None):
        self.repo = MembershipRepository(session, gym_id)
        self.plan_repo = PlanRepository(session)
        self.member_repo = MemberRepository(session, gym_id)
        self.notifications = NotificationService(session, gym_id)

    def list_memberships(self, skip: int = 0, limit: int = 100) -> list[MembershipResponse]:
        memberships = self.repo.get_all(skip, limit)
        return [self._enrich(m) for m in memberships]

    def get_membership(self, membership_id: int) -> MembershipResponse:
        m = self.repo.get_by_id(membership_id)
        if not m:
            raise HTTPException(status_code=404, detail="Membership not found")
        return self._enrich(m)

    def create_membership(self, data: MembershipCreate) -> MembershipResponse:
        # Validate member and plan exist
        member = self.member_repo.get_by_id(data.member_id)
        if not member:
            raise HTTPException(status_code=404, detail="Member not found")
        plan = self.plan_repo.get_by_id(data.plan_id)
        if not plan:
            raise HTTPException(status_code=404, detail="Plan not found")
        # Auto-calculate end_date from plan duration
        end_date = data.start_date + timedelta(days=plan.duration_days)
        membership = Membership(
            member_id=data.member_id,
            plan_id=data.plan_id,
            start_date=data.start_date,
            end_date=end_date,
            auto_renew=data.auto_renew,
        )
        membership = self.repo.create(membership)
        enriched = self._enrich(membership)
        self.notifications.membership_created(membership, member)
        return enriched

    def update_membership(self, membership_id: int, data: MembershipUpdate) -> MembershipResponse:
        m = self.repo.get_by_id(membership_id)
        if not m:
            raise HTTPException(status_code=404, detail="Membership not found")
        previous_status = m.status
        m = self.repo.update(m, data.model_dump(exclude_unset=True))
        enriched = self._enrich(m)
        member = self.member_repo.get_by_id(m.member_id)
        if member and data.status and data.status.lower() == "active" and previous_status != "active":
            # Treat re-activation as a renewal event
            self.notifications.membership_renewed(m, member)
        return enriched

    def _enrich(self, m: Membership) -> MembershipResponse:
        """Add member_name and plan_name to response."""
        member = self.member_repo.get_by_id(m.member_id)
        plan = self.plan_repo.get_by_id(m.plan_id)
        return MembershipResponse(
            id=m.id,
            member_id=m.member_id,
            plan_id=m.plan_id,
            start_date=m.start_date,
            end_date=m.end_date,
            status=m.status,
            auto_renew=m.auto_renew,
            created_at=m.created_at,
            member_name=member.full_name if member else None,
            plan_name=plan.name if plan else None,
        )

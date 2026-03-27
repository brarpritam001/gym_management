"""Notification service."""

from __future__ import annotations

from datetime import date, timedelta
from typing import Optional
from sqlmodel import Session, select
from app.models.notification import Notification
from app.models.member import MemberProfile
from app.models.membership import Membership
from app.models.payment import Payment
from app.repositories.notification_repo import NotificationRepository
from app.repositories.member_repo import MemberRepository


class NotificationService:
    def __init__(self, session: Session, gym_id: Optional[int] = None):
        self.session = session
        self.gym_id = gym_id
        self.repo = NotificationRepository(session, gym_id)
        self.member_repo = MemberRepository(session, gym_id)

    # ---------- Generic helpers ----------
    def _create_once(
        self,
        *,
        type: str,
        title: str,
        message: str,
        user_id: Optional[int] = None,
        member_id: Optional[int] = None,
        membership_id: Optional[int] = None,
        gym_id: Optional[int] = None,
    ) -> Optional[Notification]:
        target_repo = self.repo if gym_id is None or gym_id == self.gym_id else NotificationRepository(self.session, gym_id)
        if target_repo.exists(type=type, member_id=member_id, membership_id=membership_id, message=message):
            return None
        notification = Notification(
            title=title,
            message=message,
            type=type,
            user_id=user_id,
            member_id=member_id,
            membership_id=membership_id,
        )
        if gym_id is not None:
            notification.gym_id = gym_id
        return target_repo.create(notification)

    def mark_read(self, notification_id: int) -> Optional[Notification]:
        return self.repo.mark_read(notification_id)

    # ---------- Event-specific helpers ----------
    def member_created(self, member: MemberProfile, user_id: Optional[int] = None):
        self._create_once(
            type="member_created",
            title="New member added",
            message=f"{member.full_name} (ID {member.id}) was added to your gym.",
            user_id=user_id,
            member_id=member.id,
            gym_id=member.gym_id,
        )

    def membership_created(self, membership: Membership, member: MemberProfile):
        self._remove_expiry_notifications(member.id)
        self._create_once(
            type="membership_created",
            title="Membership created",
            message=f"{member.full_name}'s membership is active until {membership.end_date.isoformat()} (member #{member.id}).",
            member_id=member.id,
            membership_id=membership.id,
            gym_id=membership.gym_id,
        )

    def membership_renewed(self, membership: Membership, member: MemberProfile):
        # treat renew similar to create but different type for UX
        self._remove_expiry_notifications(member.id)
        self._create_once(
            type="membership_renewed",
            title="Membership renewed",
            message=f"{member.full_name}'s membership was renewed to {membership.end_date.isoformat()} (member #{member.id}).",
            member_id=member.id,
            membership_id=membership.id,
            gym_id=membership.gym_id,
        )

    def payment_success(self, payment: Payment, member: Optional[MemberProfile]):
        name = member.full_name if member else f"Member #{payment.member_id}"
        self._create_once(
            type="payment_success",
            title="Payment received",
            message=f"Payment of ₹{payment.amount:.2f} recorded for {name}.",
            member_id=payment.member_id,
            membership_id=payment.membership_id,
            gym_id=payment.gym_id,
        )

    def payment_failed(self, payment: Payment, member: Optional[MemberProfile]):
        name = member.full_name if member else f"Member #{payment.member_id}"
        self._create_once(
            type="payment_failed",
            title="Payment failed",
            message=f"Payment of ₹{payment.amount:.2f} failed for {name}. Please retry.",
            member_id=payment.member_id,
            membership_id=payment.membership_id,
            gym_id=payment.gym_id,
        )

    def trainer_assigned(self, trainer_name: str, trainer_id: Optional[int] = None):
        self._create_once(
            type="trainer_assigned",
            title="Trainer added",
            message=f"Trainer {trainer_name} has been added to your gym.",
            member_id=None,
            membership_id=None,
            gym_id=self.gym_id,
        )

    # ---------- Membership expiry cron ----------
    def generate_membership_expiry_notifications(self):
        """Create expiring/expired notifications for active memberships."""
        today = date.today()
        soon_threshold = today + timedelta(days=3)

        stmt = select(Membership).where(Membership.status == "active")
        # If gym scoped, filter here to avoid extra work
        if self.gym_id is not None:
            stmt = stmt.where(Membership.gym_id == self.gym_id)
        memberships = self.session.exec(stmt).all()

        for m in memberships:
            # Ensure gym scoping
            if self.gym_id is not None and m.gym_id != self.gym_id:
                continue
            member = self.member_repo.get_by_id(m.member_id)
            if not member:
                continue

            if m.end_date < today:
                self._notify_membership_expired(member, m)
            elif m.end_date <= soon_threshold:
                self._notify_membership_expiring(member, m)

    def _notify_membership_expiring(self, member: MemberProfile, membership: Membership):
        message = (
            f"{member.full_name}'s membership expires on {membership.end_date.isoformat()} "
            f"(member #{member.id})."
        )
        self._create_once(
            type="membership_expiring",
            title="Membership expiring soon",
            message=message,
            member_id=member.id,
            membership_id=membership.id,
            gym_id=membership.gym_id,
        )

    def _notify_membership_expired(self, member: MemberProfile, membership: Membership):
        message = (
            f"{member.full_name}'s membership expired on {membership.end_date.isoformat()} "
            f"(member #{member.id})."
        )
        self._create_once(
            type="membership_expired",
            title="Membership expired",
            message=message,
            member_id=member.id,
            membership_id=membership.id,
            gym_id=membership.gym_id,
        )

    def _remove_expiry_notifications(self, member_id: int):
        """Remove stale expiry notifications once membership is renewed/created."""
        self.repo.delete_for_member(member_id, ["membership_expiring", "membership_expired"])

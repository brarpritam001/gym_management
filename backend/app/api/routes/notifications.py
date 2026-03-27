"""Notification routes."""

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from app.database.session import get_session
from app.core.dependencies import get_current_user, get_current_gym_id
from app.repositories.notification_repo import NotificationRepository
from app.schemas.notification import NotificationResponse, NotificationList

router = APIRouter(prefix="/notifications", tags=["Notifications"], dependencies=[Depends(get_current_user)])


@router.get("/", response_model=NotificationList)
def list_notifications(
    skip: int = 0,
    limit: int = 50,
    session: Session = Depends(get_session),
    gym_id: int = Depends(get_current_gym_id),
):
    repo = NotificationRepository(session, gym_id)
    limit = min(limit, 100)
    items = repo.list(skip, limit)
    total = repo.count()
    return NotificationList(
        items=[
            NotificationResponse.model_validate(n, from_attributes=True)
            for n in items
        ],
        total=total,
    )


@router.patch("/{notification_id}/read", response_model=NotificationResponse)
def mark_notification_read(
    notification_id: int,
    session: Session = Depends(get_session),
    gym_id: int = Depends(get_current_gym_id),
):
    repo = NotificationRepository(session, gym_id)
    n = repo.mark_read(notification_id)
    if not n:
        raise HTTPException(status_code=404, detail="Notification not found")
    return NotificationResponse.model_validate(n, from_attributes=True)

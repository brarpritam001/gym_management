"""Notification schemas."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class NotificationResponse(BaseModel):
    id: int
    gym_id: Optional[int] = None
    user_id: Optional[int] = None
    member_id: Optional[int] = None
    membership_id: Optional[int] = None
    type: str
    title: str
    message: str
    is_read: bool
    created_at: datetime


class NotificationList(BaseModel):
    items: list[NotificationResponse]
    total: int

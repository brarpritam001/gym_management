"""Payment schemas."""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class PaymentCreate(BaseModel):
    member_id: int
    membership_id: Optional[int] = None
    amount: float
    payment_method: str = "cash"
    status: str = "completed"
    notes: str = ""


class PaymentResponse(BaseModel):
    id: int
    member_id: int
    membership_id: Optional[int]
    amount: float
    payment_method: str
    status: str
    notes: str
    paid_at: datetime
    created_at: datetime
    member_name: Optional[str] = None

"""Import all models so SQLModel can discover them."""

from app.models.gym import Gym
from app.models.subscription_plan import SubscriptionPlan
from app.models.gym_subscription import GymSubscription
from app.models.user import User
from app.models.member import MemberProfile
from app.models.plan import MembershipPlan
from app.models.membership import Membership
from app.models.payment import Payment
from app.models.attendance import Attendance
from app.models.trainer import Trainer
from app.models.notification import Notification

__all__ = [
    "Gym",
    "SubscriptionPlan",
    "GymSubscription",
    "User",
    "MemberProfile",
    "MembershipPlan",
    "Membership",
    "Payment",
    "Attendance",
    "Trainer",
    "Notification",
]

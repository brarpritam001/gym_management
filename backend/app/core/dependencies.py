"""Shared FastAPI dependencies."""

import logging
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session
from app.database.session import get_session
from app.core.security import decode_access_token
from app.models.user import User

logger = logging.getLogger(__name__)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    session: Session = Depends(get_session),
) -> User:
    """Extract and validate the current user from JWT token."""
    payload = decode_access_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )
    sub = payload.get("sub")
    if sub is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")
    try:
        user_id = int(sub)
    except (TypeError, ValueError):
        logger.warning("Invalid sub claim type: %s", type(sub))
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")
    user = session.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


def get_current_gym_id(
    current_user: User = Depends(get_current_user),
) -> int:
    """Return the gym_id for the current user. Raises 403 if no gym assigned."""
    if current_user.gym_id is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No gym associated with your account",
        )
    return current_user.gym_id


def check_member_limit(
    gym_id: int = Depends(get_current_gym_id),
    session: Session = Depends(get_session),
) -> int:
    """Check if the gym has reached its member limit. Returns gym_id if OK."""
    from app.repositories.gym_repo import GymRepository

    repo = GymRepository(session)
    subscription = repo.get_active_subscription(gym_id)
    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No active subscription. Please subscribe to a plan.",
        )
    plan = repo.get_subscription_plan(subscription.plan_id)
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Subscription plan not found",
        )
    current_count = repo.get_member_count(gym_id)
    if current_count >= plan.member_limit:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Member limit reached ({current_count}/{plan.member_limit}). Upgrade your plan.",
        )
    return gym_id

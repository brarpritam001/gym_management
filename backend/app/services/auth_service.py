"""Authentication service."""

from datetime import date, timedelta
from fastapi import HTTPException, status
from sqlmodel import Session, select
from app.models.user import User
from app.models.gym import Gym
from app.models.subscription_plan import SubscriptionPlan
from app.models.gym_subscription import GymSubscription
from app.repositories.user_repo import UserRepository
from app.core.security import hash_password, verify_password, create_access_token
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse, UserResponse


class AuthService:
    def __init__(self, session: Session):
        self.repo = UserRepository(session)
        self.session = session

    def register(self, data: RegisterRequest) -> UserResponse:
        if self.repo.get_by_email(data.email):
            raise HTTPException(status_code=400, detail="Email already registered")
        user = User(
            email=data.email,
            full_name=data.full_name,
            hashed_password=hash_password(data.password),
        )
        user = self.repo.create(user)

        # Auto-create gym for new user
        gym = Gym(name=f"{data.full_name}'s Gym", owner_user_id=user.id)
        self.session.add(gym)
        self.session.commit()
        self.session.refresh(gym)

        # Assign gym to user
        user.gym_id = gym.id
        self.session.add(user)
        self.session.commit()
        self.session.refresh(user)

        # Assign FREE trial subscription
        free_plan = self.session.exec(
            select(SubscriptionPlan).where(SubscriptionPlan.name == "FREE")
        ).first()
        if free_plan:
            sub = GymSubscription(
                gym_id=gym.id,
                plan_id=free_plan.id,
                start_date=date.today(),
                end_date=date.today() + timedelta(days=free_plan.duration_days),
                status="trial",
            )
            self.session.add(sub)
            self.session.commit()

        return UserResponse(
            id=user.id, email=user.email, full_name=user.full_name,
            role=user.role, is_active=user.is_active, gym_id=user.gym_id,
        )

    def login(self, data: LoginRequest) -> TokenResponse:
        user = self.repo.get_by_email(data.email)
        if not user or not verify_password(data.password, user.hashed_password):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
        token = create_access_token({"sub": str(user.id)})
        return TokenResponse(access_token=token)

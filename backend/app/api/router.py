"""Aggregate all API routers."""

from fastapi import APIRouter
from app.api.routes import (
    auth,
    members,
    plans,
    memberships,
    payments,
    attendance,
    trainers,
    dashboard,
    subscription,
    notifications,
)

api_router = APIRouter(prefix="/api")

api_router.include_router(auth.router)
api_router.include_router(members.router)
api_router.include_router(plans.router)
api_router.include_router(memberships.router)
api_router.include_router(payments.router)
api_router.include_router(attendance.router)
api_router.include_router(trainers.router)
api_router.include_router(dashboard.router)
api_router.include_router(subscription.router)
api_router.include_router(notifications.router)

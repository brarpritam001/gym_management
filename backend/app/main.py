"""FastAPI application entry point."""

import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.database.session import init_db
from app.api.router import api_router
from app.database.session import engine
from sqlmodel import Session
from app.services.notification_service import NotificationService

# Import models so they are registered with SQLModel
import app.models  # noqa: F401

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(api_router)


@app.on_event("startup")
def on_startup():
    init_db()


@app.on_event("startup")
async def start_schedulers():
    # Launch membership expiry checker (daily)
    async def membership_expiry_worker():
        # small delay to avoid clashing with startup migrations
        await asyncio.sleep(3)
        while True:
            try:
                with Session(engine) as session:
                    NotificationService(session).generate_membership_expiry_notifications()
            except Exception:
                # avoid crashing the loop; in real systems log this
                pass
            await asyncio.sleep(60 * 60 * 24)  # run daily

    app.state.membership_expiry_task = asyncio.create_task(membership_expiry_worker())


@app.on_event("shutdown")
async def stop_schedulers():
    task = getattr(app.state, "membership_expiry_task", None)
    if task:
        task.cancel()


@app.get("/")
def health():
    return {"status": "ok"}

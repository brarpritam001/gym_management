"""Database session management."""

from sqlmodel import SQLModel, Session, create_engine
from app.core.config import settings

# Use check_same_thread=False for SQLite
connect_args = {}
# if settings.DATABASE_URL and settings.DATABASE_URL.startswith("sqlite"):
#     connect_args["check_same_thread"] = False

engine = create_engine(f"postgresql://{settings.database_username}:{settings.database_password}@{settings.database_hostname}:{settings.database_port}/{settings.database_name}")


def init_db():
    """Create all tables."""
    SQLModel.metadata.create_all(engine)


def get_session():
    """Dependency that yields a database session."""
    with Session(engine) as session:
        yield session

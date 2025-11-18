import os
from typing import Generator

from dotenv import load_dotenv

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker, Session


load_dotenv()

class Base(DeclarativeBase):
    """
    Base class for all ORM models.
    """
    pass


def _get_database_url() -> str:
    """
    Return DATABASE_URL from environment.
    Raise if missing.
    """
    url = os.getenv("DATABASE_URL")
    if not url:
        raise RuntimeError(
            "DATABASE_URL not set. Please define in environment or .env"
        )
    return url


# SQLAlchemy connection pool
engine = create_engine(
    _get_database_url(),
    pool_pre_ping=True,
)

# Session objects factory
SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,
)


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency that provides a scoped Session.
    Usage: 
        def endpoint(db: Session = Depends(get_db)): 
            ...
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

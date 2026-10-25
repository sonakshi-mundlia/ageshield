from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from sqlalchemy.orm import DeclarativeBase

from app.config import settings


# ============================================================
# DATABASE ENGINE
# ============================================================

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
)


# ============================================================
# ASYNC SESSION
# ============================================================

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


# ============================================================
# BASE MODEL
# ============================================================

class Base(DeclarativeBase):
    pass


# ============================================================
# DATABASE DEPENDENCY
# ============================================================

async def get_db():

    async with AsyncSessionLocal() as session:

        yield session
import jwt
import hashlib

from fastapi import Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.config import settings
from app.database.db import get_db
from app.models.user_model import User
from app.models.agent_model import Agent


async def current_user(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    token = request.cookies.get("access_token")

    if not token:
        raise HTTPException(
            status_code=401,
            detail="Not authenticated",
        )

    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM],
        )

        user_id = int(payload["sub"])

    except (jwt.InvalidTokenError, KeyError, ValueError, TypeError):
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token",
        )

    user = await db.get(User, user_id)

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="User not found",
        )

    return user



async def current_agent(
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> Agent:
    authorization = request.headers.get("Authorization", "")

    scheme, _, api_key = authorization.partition(" ")

    if scheme.lower() != "bearer" or not api_key.strip():
        raise HTTPException(
            status_code=401,
            detail="Missing or invalid agent API key",
        )

    api_key = api_key.strip()

    if not api_key.startswith("ags_"):
        raise HTTPException(
            status_code=401,
            detail="Invalid agent API key",
        )

    api_key_hash = hashlib.sha256(
        api_key.encode("utf-8")
    ).hexdigest()

    result = await db.execute(
        select(Agent).where(
            Agent.api_key_hash == api_key_hash,
            Agent.active.is_(True),
        )
    )

    agent = result.scalar_one_or_none()

    if agent is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid or deactivated agent",
        )

    return agent

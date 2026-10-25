from datetime import datetime, timedelta, timezone

import jwt
from passlib.context import CryptContext

from app.config import settings


password_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
)


def hash_password(password: str):

    return password_context.hash(password)


def verify_password(
    password: str,
    password_hash: str,
):

    return password_context.verify(
        password,
        password_hash,
    )


def create_token(user_id: int):

    expiration = (
        datetime.now(timezone.utc)
        + timedelta(
            minutes=settings.ACCESS_TOKEN_MINUTES
        )
    )

    payload = {
        "sub": str(user_id),
        "exp": expiration,
    }

    return jwt.encode(
        payload,
        settings.JWT_SECRET,
        algorithm=settings.JWT_ALGORITHM,
    )

def verify_token(token: str) -> dict:
    return jwt.decode(
        token,
        settings.JWT_SECRET,
        algorithms=[settings.JWT_ALGORITHM],
    )
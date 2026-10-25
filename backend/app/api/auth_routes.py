from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.db import get_db
from app.models.company_model import Company
from app.models.user_model import User
from app.schemas.auth_schema import (
    LoginRequest,
    RegisterRequest,
)
from app.services.authentication_service import (
    create_token,
    hash_password,
    verify_password,
)
from app.dependencies import current_user


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


# ============================================================
# AUTH COOKIE
# ============================================================

def set_auth_cookie(response: Response, token: str):
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=False,  # Set True when deployed with HTTPS
        samesite="lax",
        max_age=30 * 60,
        path="/",
    )


# ============================================================
# USER RESPONSE
# ============================================================

async def user_response(
    user: User,
    db: AsyncSession,
) -> dict:
    result = await db.execute(
        select(Company).where(
            Company.id == user.company_id
        )
    )

    company = result.scalar_one_or_none()

    return {
        "company_name": company.name if company else None,
        "name": user.name,
        "email": user.email,
        "role": user.role,
    }


# ============================================================
# REGISTER
# ============================================================

@router.post("/register")
async def register(
    data: RegisterRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    # Check whether the email is already registered
    result = await db.execute(
        select(User).where(
            User.email == data.email
        )
    )

    existing_user = result.scalar_one_or_none()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered",
        )

    # Create the company
    company = Company(
        name=data.company_name
    )

    db.add(company)

    await db.flush()

    # Create the company administrator
    user = User(
        company_id=company.id,
        name=data.name,
        email=data.email,
        password_hash=hash_password(data.password),
        role="admin",
    )

    db.add(user)

    await db.commit()
    await db.refresh(user)

    # Create JWT and set HttpOnly cookie
    token = create_token(user.id)
    set_auth_cookie(response, token)

    # Return user and company information
    return await user_response(user, db)


# ============================================================
# LOGIN
# ============================================================

@router.post("/login")
async def login(
    data: LoginRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(User).where(
            User.email == data.email
        )
    )

    user = result.scalar_one_or_none()

    if user is None or not verify_password(
        data.password,
        user.password_hash,
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    # Create JWT and set HttpOnly cookie
    token = create_token(user.id)
    set_auth_cookie(response, token)

    # Return user and company information
    return await user_response(user, db)


# ============================================================
# LOGOUT
# ============================================================

@router.post("/logout")
async def logout(
    response: Response,
):
    response.delete_cookie(
        key="access_token",
        path="/",
        httponly=True,
        secure=False,  # Match the cookie settings above
        samesite="lax",
    )

    return {
        "message": "Logged out successfully"
    }


# ============================================================
# GET CURRENT USER
# ============================================================

@router.get("/me")
async def me(
    current_user: User = Depends(current_user),
    db: AsyncSession = Depends(get_db),
):
    return await user_response(
        current_user,
        db,
    )
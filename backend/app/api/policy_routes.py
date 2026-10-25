from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.db import get_db
from app.dependencies import current_user
from app.models.policy_model import Policy
from app.models.user_model import User
from app.schemas.policy_schema import (
    PolicyCreate,
    PolicyResponse,
)


router = APIRouter(
    prefix="/policies",
    tags=["Policies"],
)


@router.post(
    "",
    response_model=PolicyResponse,
)
async def create_policy(
    data: PolicyCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_user),
):

    if (
        data.min_amount is not None
        and data.max_amount is not None
        and data.min_amount > data.max_amount
    ):

        raise HTTPException(
            status_code=400,
            detail="min_amount cannot exceed max_amount",
        )

    policy = Policy(
        company_id=user.company_id,
        name=data.name,
        tool_name=data.tool_name,
        action=data.action,
        min_amount=data.min_amount,
        max_amount=data.max_amount,
        enabled=data.enabled,
        conditions=data.conditions,
    )

    db.add(policy)

    await db.commit()
    await db.refresh(policy)

    return policy


@router.get(
    "",
    response_model=list[PolicyResponse],
)
async def list_policies(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_user),
):

    result = await db.execute(
        select(Policy)
        .where(
            Policy.company_id == user.company_id
        )
        .order_by(Policy.id.desc())
    )

    return list(result.scalars().all())


@router.delete(
    "/{policy_id}",
)
async def delete_policy(
    policy_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_user),
):

    result = await db.execute(
        select(Policy).where(
            Policy.id == policy_id,
            Policy.company_id == user.company_id,
        )
    )

    policy = result.scalar_one_or_none()

    if policy is None:

        raise HTTPException(
            status_code=404,
            detail="Policy not found",
        )

    await db.delete(policy)

    await db.commit()

    return {
        "message": "Policy deleted",
        "policy_id": policy_id,
    }
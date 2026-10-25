
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.approvals.approval_service import approval_service
from app.database.db import get_db
from app.dependencies import current_user
from app.models.user_model import User
from app.schemas.approval_schema import (
    ApprovalResponse,
    ApprovalDecision,
)


router = APIRouter(
    prefix="/approvals",
    tags=["Approvals"],
)


@router.get(
    "/pending",
    response_model=list[ApprovalResponse],
)
async def pending_approvals(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_user),
):
    return await approval_service.list_pending(
        db=db,
        company_id=user.company_id,
    )


@router.get(
    "/{approval_id}",
    response_model=ApprovalResponse,
)
async def get_approval(
    approval_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_user),
):
    approval = await approval_service.get_approval(
        db=db,
        company_id=user.company_id,
        approval_id=approval_id,
    )

    if approval is None:
        raise HTTPException(
            status_code=404,
            detail="Approval not found.",
        )

    return approval


@router.post(
    "/{approval_id}/decision",
    response_model=ApprovalResponse,
)
async def decide_approval(
    approval_id: int,
    data: ApprovalDecision,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_user),
):
    try:
        approval = await approval_service.decide(
            db=db,
            company_id=user.company_id,
            approval_id=approval_id,
            decision=data.decision,
        )

        return approval

    except ValueError as error:
        message = str(error)

        status_code = (
            404
            if message in {
                "Approval not found",
                "Associated tool call was not found",
            }
            else 409
            if "already been decided" in message
            else 400
        )

        raise HTTPException(
            status_code=status_code,
            detail=message,
        ) from error

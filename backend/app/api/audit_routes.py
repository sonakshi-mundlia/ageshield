from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.audit.audit_service import audit_service
from app.database.db import get_db
from app.dependencies import current_user
from app.models.user_model import User
from app.schemas.tool_call_schema import SecurityEventResponse


router = APIRouter(
    prefix="/audit",
    tags=["Audit"],
)


@router.get(
    "",
    response_model=list[SecurityEventResponse],
)
async def get_audit_events(
    limit: int = Query(
        default=100,
        ge=1,
        le=500,
    ),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_user),
):

    return await audit_service.list_events(
        db,
        user.company_id,
        limit,
    )
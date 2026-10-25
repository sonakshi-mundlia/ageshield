
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.db import get_db
from app.dependencies import current_user
from app.models.user_model import User
from app.schemas.tool_schema import ToolCreate, ToolResponse
from app.tools.tool_service import tool_service


router = APIRouter(
    prefix="/tools",
    tags=["Tools"],
)


@router.post(
    "",
    response_model=ToolResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_tool(
    data: ToolCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_user),
):
    try:
        tool = await tool_service.create_tool(
            db=db,
            company_id=user.company_id,
            name=data.name,
            description=data.description,
            risk_level=data.risk_level,
        )

        return tool

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        ) from error


@router.get(
    "",
    response_model=list[ToolResponse],
)
async def list_tools(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_user),
):
    return await tool_service.list_tools(
        db=db,
        company_id=user.company_id,
    )


@router.get(
    "/{tool_id}",
    response_model=ToolResponse,
)
async def get_tool(
    tool_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_user),
):
    tool = await tool_service.get_tool(
        db=db,
        company_id=user.company_id,
        tool_id=tool_id,
    )

    if tool is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tool not found",
        )

    return tool

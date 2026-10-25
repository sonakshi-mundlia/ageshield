
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.agent_service import agent_service
from app.database.db import get_db
from app.dependencies import current_user
from app.models.user_model import User
from app.schemas.agent_schema import (
    AgentCreate,
    AgentResponse,
    AgentRegistrationResponse,
)


router = APIRouter(
    prefix="/agents",
    tags=["Agents"],
)


# ----------------------------------------------------------
# REGISTER AGENT
# POST /api/agents
# Returns the raw API key only once.
# ----------------------------------------------------------

@router.post(
    "",
    response_model=AgentRegistrationResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_agent(
    data: AgentCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_user),
):
    try:
        agent, api_key = await agent_service.create_agent(
            db=db,
            company_id=user.company_id,
            name=data.name,
            description=data.description or "",
        )
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        ) from error

    return AgentRegistrationResponse(
        id=agent.id,
        company_id=agent.company_id,
        name=agent.name,
        description=agent.description,
        active=agent.active,
        api_key=api_key,
    )


# ----------------------------------------------------------
# LIST COMPANY AGENTS
# GET /api/agents
# Never return API keys or API key hashes.
# ----------------------------------------------------------

@router.get(
    "",
    response_model=list[AgentResponse],
)
async def list_agents(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_user),
):
    return await agent_service.list_agents(
        db=db,
        company_id=user.company_id,
    )


# ----------------------------------------------------------
# GET ONE AGENT
# GET /api/agents/{agent_id}
# Only returns agents belonging to the current company.
# ----------------------------------------------------------

@router.get(
    "/{agent_id}",
    response_model=AgentResponse,
)
async def get_agent(
    agent_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_user),
):
    agent = await agent_service.get_agent(
        db=db,
        company_id=user.company_id,
        agent_id=agent_id,
    )

    if agent is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found",
        )

    return agent


# ----------------------------------------------------------
# DEACTIVATE AGENT
# DELETE /api/agents/{agent_id}
# Preserves the agent record and its history.
# ----------------------------------------------------------

@router.delete(
    "/{agent_id}",
    status_code=status.HTTP_200_OK,
)
async def deactivate_agent(
    agent_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_user),
):
    agent = await agent_service.deactivate_agent(
        db=db,
        company_id=user.company_id,
        agent_id=agent_id,
    )

    if agent is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found",
        )

    return {
        "message": "Agent deactivated successfully",
        "agent_id": agent.id,
        "active": agent.active,
    }


# ----------------------------------------------------------
# PERMANENT DELETE
# DELETE /api/agents/{agent_id}/permanent
#
# Requires agent_service.delete_agent() to be implemented
# with safe handling of related records and audit history.
# ----------------------------------------------------------

@router.delete(
    "/{agent_id}/permanent",
    status_code=status.HTTP_200_OK,
)
async def permanently_delete_agent(
    agent_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_user),
):
    agent = await agent_service.delete_agent(
        db=db,
        company_id=user.company_id,
        agent_id=agent_id,
    )

    if agent is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found",
        )

    return {
        "message": "Agent permanently deleted",
        "agent_id": agent_id,
    }

@router.get("/{agent_id}/api-key")
async def get_agent_api_key(
    agent_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(current_user),
):
    agent = await agent_service.get_agent(
        db=db,
        company_id=current_user.company_id,
        agent_id=agent_id,
    )

    if agent is None:
        raise HTTPException(
            status_code=404,
            detail="Agent not found",
        )

    if not agent.api_key_encrypted:
        raise HTTPException(
            status_code=409,
            detail="This agent has no recoverable API key. Generate a new key.",
        )

    try:
        api_key = agent_service.decrypt_api_key(
            agent.api_key_encrypted
        )
    except RuntimeError:
        raise HTTPException(
            status_code=500,
            detail="Could not decrypt the API key. Check the encryption configuration.",
        )

    return {
        "agent_id": agent.id,
        "api_key": api_key,
    }

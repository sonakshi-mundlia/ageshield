
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.agent_model import Agent
from app.models.tool_call_model import ToolCall


class AgentRegistry:

    async def register(
        self,
        db: AsyncSession,
        company_id: int,
        name: str,
        description: str = "",
        api_key_hash: str | None = None,
        api_key_encrypted: str | None = None,
    ) -> Agent:
        """Register a new agent for a company."""

        agent = Agent(
            company_id=company_id,
            name=name.strip(),
            description=description.strip(),
            api_key_hash=api_key_hash,
            api_key_encrypted=api_key_encrypted,
            active=True,
        )

        try:
            db.add(agent)
            await db.commit()
            await db.refresh(agent)
            return agent
        except Exception:
            await db.rollback()
            raise

    async def get(
        self,
        db: AsyncSession,
        company_id: int,
        agent_id: int,
    ) -> Agent | None:
        """Get an agent belonging to the specified company."""

        result = await db.execute(
            select(Agent).where(
                Agent.id == agent_id,
                Agent.company_id == company_id,
            )
        )

        return result.scalar_one_or_none()

    async def list(
        self,
        db: AsyncSession,
        company_id: int,
    ) -> list[Agent]:
        """List only agents belonging to the specified company."""

        result = await db.execute(
            select(Agent)
            .where(Agent.company_id == company_id)
            .order_by(Agent.id.desc())
        )

        return list(result.scalars().all())

    async def deactivate(
        self,
        db: AsyncSession,
        company_id: int,
        agent_id: int,
    ) -> Agent | None:
        """Disable API access without deleting the agent's history."""

        agent = await self.get(db, company_id, agent_id)

        if agent is None:
            return None

        if not agent.active:
            return agent

        try:
            agent.active = False
            await db.commit()
            await db.refresh(agent)
            return agent
        except Exception:
            await db.rollback()
            raise

    async def delete(
        self,
        db: AsyncSession,
        company_id: int,
        agent_id: int,
    ) -> Agent | None:
        """Permanently delete an agent with no tool-call history."""

        agent = await self.get(db, company_id, agent_id)

        if agent is None:
            return None

        # Preserve agents referenced by security/tool-call history.
        result = await db.execute(
            select(ToolCall.id)
            .where(
                ToolCall.agent_id == agent.id,
                ToolCall.company_id == company_id,
            )
            .limit(1)
        )

        if result.scalar_one_or_none() is not None:
            raise ValueError(
                "This agent has tool-call history and cannot be "
                "permanently deleted. Deactivate it instead."
            )

        try:
            await db.delete(agent)
            await db.commit()
            return agent
        except Exception:
            await db.rollback()
            raise

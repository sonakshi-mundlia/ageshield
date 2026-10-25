
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.tool_model import Tool
from app.tools.tool_registry import ToolRegistry


VALID_RISK_LEVELS = {
    "low",
    "medium",
    "high",
    "critical",
}


class ToolService:

    def __init__(self):
        self.registry = ToolRegistry()

    async def create_tool(
        self,
        db: AsyncSession,
        company_id: int,
        name: str,
        description: str = "",
        risk_level: str = "medium",
    ) -> Tool:

        name = name.strip()
        description = description.strip()
        risk_level = risk_level.lower().strip()

        if company_id <= 0:
            raise ValueError("Invalid company ID")

        if not name:
            raise ValueError("Tool name cannot be empty")

        if len(name) > 200:
            raise ValueError("Tool name cannot exceed 200 characters")

        if len(description) > 500:
            raise ValueError(
                "Tool description cannot exceed 500 characters"
            )

        if risk_level not in VALID_RISK_LEVELS:
            raise ValueError("Invalid risk level")

        existing = await self.registry.get_by_name(
            db,
            company_id,
            name,
        )

        if existing:
            raise ValueError("Tool already exists")

        return await self.registry.register(
            db=db,
            company_id=company_id,
            name=name,
            description=description,
            risk_level=risk_level,
        )

    async def get_tool(
        self,
        db: AsyncSession,
        company_id: int,
        tool_id: int,
    ) -> Tool | None:
        return await self.registry.get(
            db,
            company_id,
            tool_id,
        )

    async def get_tool_by_name(
        self,
        db: AsyncSession,
        company_id: int,
        tool_name: str,
    ) -> Tool | None:
        return await self.registry.get_by_name(
            db,
            company_id,
            tool_name.strip(),
        )

    async def list_tools(
        self,
        db: AsyncSession,
        company_id: int,
    ) -> list[Tool]:
        return await self.registry.list(
            db,
            company_id,
        )


tool_service = ToolService()

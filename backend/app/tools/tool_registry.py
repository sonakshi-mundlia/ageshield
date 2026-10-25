
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.tool_model import Tool


class ToolRegistry:

    async def register(
        self,
        db: AsyncSession,
        company_id: int,
        name: str,
        description: str = "",
        risk_level: str = "medium",
    ) -> Tool:

        tool = Tool(
            company_id=company_id,
            name=name,
            description=description,
            risk_level=risk_level,
        )

        try:
            db.add(tool)
            await db.commit()
            await db.refresh(tool)
            return tool

        except Exception:
            await db.rollback()
            raise

    async def get(
        self,
        db: AsyncSession,
        company_id: int,
        tool_id: int,
    ) -> Tool | None:

        result = await db.execute(
            select(Tool).where(
                Tool.id == tool_id,
                Tool.company_id == company_id,
            )
        )

        return result.scalar_one_or_none()

    async def get_by_name(
        self,
        db: AsyncSession,
        company_id: int,
        tool_name: str,
    ) -> Tool | None:

        result = await db.execute(
            select(Tool).where(
                Tool.company_id == company_id,
                Tool.name == tool_name,
            )
        )

        return result.scalar_one_or_none()

    async def list(
        self,
        db: AsyncSession,
        company_id: int,
    ) -> list[Tool]:

        result = await db.execute(
            select(Tool)
            .where(Tool.company_id == company_id)
            .order_by(Tool.id.desc())
        )

        return list(result.scalars().all())


tool_registry = ToolRegistry()

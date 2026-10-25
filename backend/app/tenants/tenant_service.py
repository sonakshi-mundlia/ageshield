from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.company_model import Company
from app.models.user_model import User


class TenantService:

    async def get_company(
        self,
        db: AsyncSession,
        company_id: int,
    ) -> Company | None:

        return await db.get(
            Company,
            company_id,
        )

    async def get_company_users(
        self,
        db: AsyncSession,
        company_id: int,
    ) -> list[User]:

        result = await db.execute(
            select(User)
            .where(
                User.company_id == company_id
            )
            .order_by(User.id)
        )

        return list(result.scalars().all())

    async def verify_resource_owner(
        self,
        db: AsyncSession,
        company_id: int,
        resource_company_id: int,
    ) -> bool:

        return company_id == resource_company_id


tenant_service = TenantService()
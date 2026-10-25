from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.db import AsyncSessionLocal
from app.models.configuration_model import (
    CompanyConfiguration
)


class ConfigurationService:

    # ============================================================
    # SAVE COMPANY CONFIGURATION
    # ============================================================

    async def save_configuration(
        self,
        company_id: int,
        configuration: dict[str, Any]
    ):

        async with AsyncSessionLocal() as db:

            config = CompanyConfiguration(
                company_id=company_id,

                version=configuration.get(
                    "version",
                    "1.0"
                ),

                configuration=configuration
            )

            db.add(config)

            await db.commit()

            await db.refresh(config)

            return config

    # ============================================================
    # GET LATEST COMPANY CONFIGURATION
    # ============================================================

    async def get_configuration(
        self,
        company_id: int
    ):

        async with AsyncSessionLocal() as db:

            result = await db.execute(
                select(CompanyConfiguration)
                .where(
                    CompanyConfiguration.company_id
                    == company_id
                )
                .order_by(
                    CompanyConfiguration.created_at.desc()
                )
            )

            return result.scalars().first()

    # ============================================================
    # GET CONFIGURATION DATA
    # ============================================================

    async def get_configuration_data(
        self,
        company_id: int
    ) -> dict[str, Any] | None:

        config = await self.get_configuration(
            company_id
        )

        if config is None:
            return None

        return config.configuration

    async def get_configuration_for_session(
        self,
        db: AsyncSession,
        company_id: int,
    ):
        result = await db.execute(
            select(CompanyConfiguration)
            .where(CompanyConfiguration.company_id == company_id)
            .order_by(CompanyConfiguration.created_at.desc())
        )

        return result.scalars().first()
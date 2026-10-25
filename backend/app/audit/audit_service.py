from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.security_event_model import SecurityEvent


class AuditService:

    async def record(
        self,
        db: AsyncSession,
        company_id: int,
        event_type: str,
        severity: str,
        message: str,
        metadata: dict | None = None,
    ) -> SecurityEvent:

        event = SecurityEvent(
            company_id=company_id,
            event_type=event_type,
            severity=severity,
            message=message,
            metadata_json=metadata or {},
        )

        db.add(event)

        await db.commit()
        await db.refresh(event)

        return event

    async def list_events(
        self,
        db: AsyncSession,
        company_id: int,
        limit: int = 100,
    ) -> list[SecurityEvent]:

        limit = min(
            max(limit, 1),
            500,
        )

        result = await db.execute(
            select(SecurityEvent)
            .where(
                SecurityEvent.company_id == company_id
            )
            .order_by(
                SecurityEvent.id.desc()
            )
            .limit(limit)
        )

        return list(result.scalars().all())


audit_service = AuditService()
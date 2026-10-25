from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, JSON, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.db import Base


def utc_now_naive() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


class Approval(Base):
    __tablename__ = "approvals"

    id: Mapped[int] = mapped_column(primary_key=True)

    company_id: Mapped[int] = mapped_column(
        ForeignKey("companies.id"),
        index=True,
    )

    tool_call_id: Mapped[int] = mapped_column(
        ForeignKey("tool_calls.id"),
    )

    status: Mapped[str] = mapped_column(
        String(30),
        default="pending",
    )

    details: Mapped[dict] = mapped_column(
        JSON,
        default=dict,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=utc_now_naive,
    )

    decided_at: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True,
    )
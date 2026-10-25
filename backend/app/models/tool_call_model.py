from datetime import datetime, timezone

from sqlalchemy import (
    DateTime,
    ForeignKey,
    JSON,
    String,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.database.db import Base


class ToolCall(Base):
    __tablename__ = "tool_calls"

    id: Mapped[int] = mapped_column(
        primary_key=True
    )

    company_id: Mapped[int] = mapped_column(
        ForeignKey("companies.id"),
        index=True
    )

    agent_id: Mapped[int] = mapped_column(
        ForeignKey("agents.id")
    )

    tool_name: Mapped[str] = mapped_column(
        String(200)
    )

    arguments: Mapped[dict] = mapped_column(
        JSON,
        default=dict
    )

    decision: Mapped[str] = mapped_column(
        String(40)
    )

    risk_score: Mapped[int] = mapped_column(
        default=0
    )

    reason: Mapped[str] = mapped_column(
        String(1000),
        default=""
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=lambda: datetime.now(timezone.utc).replace(tzinfo=None)
    )
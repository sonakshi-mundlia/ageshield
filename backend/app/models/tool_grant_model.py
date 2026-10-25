
from datetime import datetime, timezone

from sqlalchemy import String, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.database.db import Base


def utc_now_naive() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


class ToolGrant(Base):
    """
    Persistent tool decision for one company.

    An approved grant prevents repeated approval prompts for that tool.
    A rejected grant blocks that tool until an administrator changes it.
    """

    __tablename__ = "tool_grants"

    __table_args__ = (
        UniqueConstraint(
            "company_id",
            "tool_name",
            name="uq_tool_grants_company_tool",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    company_id: Mapped[int] = mapped_column(
        ForeignKey("companies.id"),
        nullable=False,
        index=True,
    )
    tool_name: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
    )
    decision: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=utc_now_naive,
        onupdate=utc_now_naive,
        nullable=False,
    )

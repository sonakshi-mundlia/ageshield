from sqlalchemy import (
    Boolean,
    ForeignKey,
    JSON,
    String,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.database.db import Base


class Policy(Base):
    __tablename__ = "policies"

    id: Mapped[int] = mapped_column(
        primary_key=True
    )

    company_id: Mapped[int] = mapped_column(
        ForeignKey("companies.id"),
        index=True,
        nullable=False
    )

    name: Mapped[str] = mapped_column(
        String(200),
        nullable=False
    )

    tool_name: Mapped[str] = mapped_column(
        String(200),
        nullable=False
    )

    action: Mapped[str] = mapped_column(
        String(40),
        default="allow"
    )

    min_amount: Mapped[float | None] = mapped_column(
        nullable=True
    )

    max_amount: Mapped[float | None] = mapped_column(
        nullable=True
    )

    enabled: Mapped[bool] = mapped_column(
        Boolean,
        default=True
    )

    conditions: Mapped[dict] = mapped_column(
        JSON,
        default=dict
    )
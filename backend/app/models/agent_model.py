
from sqlalchemy import Boolean, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database.db import Base


class Agent(Base):
    __tablename__ = "agents"

    id: Mapped[int] = mapped_column(primary_key=True)

    company_id: Mapped[int] = mapped_column(
        ForeignKey("companies.id"),
        index=True,
        nullable=False
    )

    name: Mapped[str] = mapped_column(
        String(200),
        nullable=False
    )

    description: Mapped[str] = mapped_column(
        String(500),
        default=""
    )

    # Used to authenticate incoming agent requests
    api_key_hash: Mapped[str | None] = mapped_column(
        String(64),
        unique=True,
        nullable=True
    )

    # Stores the encrypted API key for authorized retrieval
    api_key_encrypted: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False
    )

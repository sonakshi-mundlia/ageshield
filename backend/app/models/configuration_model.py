from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    ForeignKey,
    JSON
)

from sqlalchemy.sql import func

from app.database.db import Base


class CompanyConfiguration(Base):

    __tablename__ = "company_configurations"

    # ============================================================
    # PRIMARY KEY
    # ============================================================

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    # ============================================================
    # COMPANY
    # ============================================================

    company_id = Column(
        Integer,
        ForeignKey("companies.id"),
        nullable=False,
        index=True
    )

    # ============================================================
    # CONFIGURATION VERSION
    # ============================================================

    version = Column(
        String(20),
        nullable=False,
        default="1.0"
    )

    # ============================================================
    # COMPANY CONFIGURATION JSON
    # ============================================================

    configuration = Column(
        JSON,
        nullable=False
    )

    # ============================================================
    # CREATED TIME
    # ============================================================

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    # ============================================================
    # UPDATED TIME
    # ============================================================

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


RiskLevel = Literal[
    "low",
    "medium",
    "high",
    "critical",
]


class ToolCreate(BaseModel):
    name: str = Field(
        min_length=1,
        max_length=200,
    )

    description: str = Field(
        default="",
        max_length=500,
    )

    risk_level: RiskLevel = "medium"


class ToolResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    company_id: int
    name: str
    description: str
    risk_level: RiskLevel
    active: bool
    created_at: datetime

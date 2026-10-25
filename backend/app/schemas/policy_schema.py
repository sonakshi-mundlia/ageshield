from typing import Literal

from pydantic import BaseModel, Field


PolicyAction = Literal[
    "allow",
    "deny",
    "approval",
]


class PolicyCreate(BaseModel):

    name: str = Field(
        min_length=1,
        max_length=200,
    )

    tool_name: str = Field(
        min_length=1,
        max_length=200,
    )

    action: PolicyAction = "allow"

    min_amount: float | None = None

    max_amount: float | None = None

    enabled: bool = True

    conditions: dict = Field(
        default_factory=dict
    )


class PolicyResponse(BaseModel):

    id: int

    company_id: int

    name: str

    tool_name: str

    action: str

    min_amount: float | None

    max_amount: float | None

    enabled: bool

    conditions: dict

    class Config:
        from_attributes = True
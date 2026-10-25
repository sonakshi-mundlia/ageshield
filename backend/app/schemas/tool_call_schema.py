
from typing import Any, Literal
from pydantic import BaseModel, ConfigDict, Field


SecurityDecision = Literal[
    "ALLOW",
    "BLOCK",
    "APPROVAL_REQUIRED",
]


class ToolCallRequest(BaseModel):
    tool_name: str = Field(
        min_length=1,
        max_length=200,
    )

    arguments: dict[str, Any] = Field(
        default_factory=dict,
    )

class ToolCallResponse(BaseModel):
    decision: SecurityDecision
    risk_score: int = Field(ge=0, le=100)
    reason: str
    approval_id: int | None = None
    tool_call_id: int | None = None


class SecurityEventResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    company_id: int
    event_type: str
    severity: str
    message: str
    metadata_json: dict[str, Any]
    created_at: Any

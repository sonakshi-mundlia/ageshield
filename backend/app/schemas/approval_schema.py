from typing import Literal

from pydantic import BaseModel


class ApprovalDecision(BaseModel):

    decision: Literal[
        "approved",
        "rejected",
    ]


class ApprovalResponse(BaseModel):

    id: int

    company_id: int

    tool_call_id: int

    status: str

    details: dict

    created_at: object

    decided_at: object | None

    class Config:
        from_attributes = True
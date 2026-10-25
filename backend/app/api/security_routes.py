
from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.db import get_db
from app.dependencies import current_agent
from app.models.agent_model import Agent
from app.models.tool_call_model import ToolCall
from app.models.tool_grant_model import ToolGrant
from app.models.approval_model import Approval
from app.schemas.tool_call_schema import ToolCallRequest, ToolCallResponse

from app.configuration.configuration_service import ConfigurationService
from app.configuration.configuration_merger import merge_configuration

from app.security.permission_engine import PermissionEngine
from app.security.policy_engine import PolicyEngine
from app.security.risk_engine import RiskEngine
from app.security.injection_detector import detect_injection
from app.security.data_guard import detect_sensitive_data

from app.approvals.approval_service import approval_service
from app.audit.audit_service import audit_service


router = APIRouter(prefix="/security", tags=["Security"])

configuration_service = ConfigurationService()
permission_engine = PermissionEngine()
policy_engine = PolicyEngine()
risk_engine = RiskEngine()


def utc_now_naive() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


def redact_arguments(value: Any) -> Any:
    sensitive_names = {
        "password", "passwd", "passcode", "pin",
        "secret", "secret_key", "private_key",
        "api_key", "apikey", "api_secret",
        "token", "access_token", "refresh_token",
        "auth_token", "bearer_token", "credentials",
        "credit_card", "credit_card_number", "card_number",
        "cvv", "cvc", "security_code",
        "bank_account", "bank_account_number",
        "account_number", "routing_number",
        "database_url", "db_url", "connection_string",
        "aadhaar", "aadhaar_number", "pan", "pan_number",
        "passport_number", "ssn",
    }

    if isinstance(value, dict):
        cleaned = {}

        for key, item in value.items():
            normalized_key = str(key).lower()

            if (
                normalized_key in sensitive_names
                or any(
                    marker in normalized_key
                    for marker in (
                        "password",
                        "secret",
                        "token",
                        "api_key",
                        "private_key",
                    )
                )
            ):
                cleaned[str(key)] = "[REDACTED]"
            else:
                cleaned[str(key)] = redact_arguments(item)

        return cleaned

    if isinstance(value, list):
        return [redact_arguments(item) for item in value]

    return value


def make_response(
    decision: str,
    score: int,
    reason: str,
    tool_call_id: int | None = None,
    approval_id: int | None = None,
) -> dict:
    return {
        "decision": decision,
        "risk_score": max(0, min(100, int(score))),
        "reason": reason,
        "tool_call_id": tool_call_id,
        "approval_id": approval_id,
    }


async def save_tool_call(
    db: AsyncSession,
    agent: Agent,
    tool_name: str,
    arguments: dict,
    decision: str,
    risk_score: int,
    reason: str,
) -> ToolCall:
    record = ToolCall(
        company_id=agent.company_id,
        agent_id=agent.id,
        tool_name=tool_name,
        arguments=redact_arguments(arguments),
        decision=decision,
        risk_score=risk_score,
        reason=reason,
        created_at=utc_now_naive(),
    )

    db.add(record)
    await db.commit()
    await db.refresh(record)

    return record


async def record_security_event(
    db: AsyncSession,
    agent: Agent,
    tool_name: str,
    decision: str,
    risk_score: int,
    reason: str,
    tool_call_id: int | None,
) -> None:
    severity = (
        "critical"
        if decision == "BLOCK" and risk_score >= 80
        else "high"
        if decision != "ALLOW"
        else "low"
    )

    await audit_service.record(
        db=db,
        company_id=agent.company_id,
        event_type="AGENT_TOOL_AUTHORIZATION",
        severity=severity,
        message=reason,
        metadata={
            "agent_id": agent.id,
            "tool_name": tool_name,
            "decision": decision,
            "risk_score": risk_score,
            "tool_call_id": tool_call_id,
        },
    )


async def get_saved_grant(
    db: AsyncSession,
    company_id: int,
    tool_name: str,
) -> ToolGrant | None:
    result = await db.execute(
        select(ToolGrant).where(
            ToolGrant.company_id == company_id,
            ToolGrant.tool_name == tool_name,
        )
    )

    return result.scalar_one_or_none()


@router.post("/authorize", response_model=ToolCallResponse)
async def authorize_tool_call(
    data: ToolCallRequest,
    agent: Agent = Depends(current_agent),
    db: AsyncSession = Depends(get_db),
):
    company_id = agent.company_id
    arguments = data.arguments or {}
    tool_name = data.tool_name.strip()

    if not tool_name:
        raise HTTPException(
            status_code=422,
            detail="Tool name is required.",
        )

    # 1. Load the company's effective configuration.
    config_record = (
        await configuration_service.get_configuration_for_session(
            db, company_id
        )
    )

    company_config = (
        config_record.configuration
        if config_record is not None
        else {}
    )

    effective_config = merge_configuration(company_config)
    security_config = effective_config.get("security", {})

    request = {
        "agent_id": agent.id,
        "tool_name": tool_name,
        "arguments": arguments,
    }

    # 2. Detect prompt injection and sensitive data.
    injection_detected = False
    injection_reason = ""

    if security_config.get("prompt_injection_detection", True):
        injection_detected, injection_reason = detect_injection(
            arguments
        )

    sensitive_fields = []

    if security_config.get("sensitive_data_detection", True):
        sensitive_fields = detect_sensitive_data(arguments)

    request["injection"] = injection_detected
    request["sensitive"] = sensitive_fields

    # 3. Check whether this company is allowed to use the tool.
    permission_result = await permission_engine.check(
        db,
        company_id,
        request,
        effective_config,
    )

    if not isinstance(permission_result, dict):
        raise HTTPException(
            status_code=500,
            detail="Permission engine returned an invalid result.",
        )

    permission_decision = str(
        permission_result.get("decision", "BLOCK")
    ).upper()

    tool = permission_result.get("tool")

    if tool is not None:
        request["risk_level"] = getattr(
            tool, "risk_level", "medium"
        )
    else:
        request["risk_level"] = "medium"

    # 4. Evaluate risk independently of saved approvals.
    risk_result = risk_engine.evaluate(
        request,
        effective_config,
    )

    if not isinstance(risk_result, dict):
        raise HTTPException(
            status_code=500,
            detail="Risk engine returned an invalid result.",
        )

    risk_score = int(risk_result.get("score", 0))
    risk_score = max(0, min(100, risk_score))

    risk_decision = str(
        risk_result.get("decision", "BLOCK")
    ).upper()

    risk_level = str(
        risk_result.get("level", "")
    ).lower()

    # 5. Read the persistent company + tool decision.
    grant = await get_saved_grant(
        db,
        company_id,
        tool_name,
    )

    saved_decision = (
        str(grant.decision).strip().lower()
        if grant is not None
        else None
    )

    decision = "BLOCK"
    reason = "Authorization failed."

    # 6. Mandatory security checks take precedence over grants.
    # Any permission result other than ALLOW fails closed.
    if permission_decision != "ALLOW":
        decision = "BLOCK"
        reason = permission_result.get(
            "reason",
            "Tool permission denied or the tool is not registered and active.",
        )

    elif injection_detected:
        decision = "BLOCK"
        reason = (
            injection_reason
            or "Prompt injection detected. The request was blocked."
        )

    elif risk_decision in {"BLOCK", "DENY", "REJECT"}:
        decision = "BLOCK"
        reason = (
            "Risk assessment blocked this request "
            f"(risk score: {risk_score})."
        )

    # A rejected grant stays blocked until its saved decision is
    # explicitly changed by an authorized administrator.
    elif saved_decision == "rejected":
        decision = "BLOCK"
        reason = (
            f"Tool '{tool_name}' has been rejected for this company. "
            "An administrator must explicitly change its saved decision."
        )

    else:
        # 7. Evaluate policies before honoring an approved grant.
        policy_result = await policy_engine.evaluate(
            db,
            company_id,
            request,
            effective_config,
        )

        if not isinstance(policy_result, dict):
            raise HTTPException(
                status_code=500,
                detail="Policy engine returned an invalid result.",
            )

        policy_decision = str(
            policy_result.get("decision", "BLOCK")
        ).upper()

        policy_reason = policy_result.get(
            "reason",
            "Policy evaluation failed.",
        )

        if policy_decision == "BLOCK":
            decision = "BLOCK"
            reason = policy_reason

        elif saved_decision == "approved":
            # The saved approval removes repeated human approval
            # prompts, but does not bypass mandatory security checks.
            decision = "ALLOW"
            reason = (
                f"Tool '{tool_name}' is approved for this company "
                "and passed the mandatory security checks."
            )

        elif (
            policy_decision == "APPROVAL_REQUIRED"
            or risk_decision in {
                "REVIEW",
                "APPROVAL",
                "REQUIRE_APPROVAL",
                "APPROVAL_REQUIRED",
            }
            or (
                security_config.get("high_risk_approval", True)
                and risk_level in {"high", "critical"}
            )
        ):
            decision = "APPROVAL_REQUIRED"

            if policy_decision == "APPROVAL_REQUIRED":
                reason = policy_reason
            else:
                reason = (
                    "Human approval required "
                    f"(risk score: {risk_score})."
                )

        elif policy_decision == "ALLOW":
            decision = "ALLOW"
            reason = "Tool request passed authorization checks."

        else:
            # Unknown policy decisions must not accidentally allow a
            # tool call.
            decision = "BLOCK"
            reason = (
                "Policy engine returned an unrecognized decision: "
                f"{policy_decision}"
            )

    # 8. Persist this authorization attempt.
    tool_call = await save_tool_call(
        db=db,
        agent=agent,
        tool_name=tool_name,
        arguments=arguments,
        decision=decision,
        risk_score=risk_score,
        reason=reason,
    )

    # 9. Create a human approval request only when needed.
    # Saved approvals and saved rejections never create another one.
    approval_id = None

    if decision == "APPROVAL_REQUIRED":
        approval = await approval_service.create_approval(
            db=db,
            company_id=company_id,
            tool_call_id=tool_call.id,
            details={
                "agent_id": agent.id,
                "tool_name": tool_name,
                "arguments": redact_arguments(arguments),
                "risk_score": risk_score,
                "reason": reason,
            },
        )

        approval_id = approval.id

    # 10. Record the decision in the audit log.
    await record_security_event(
        db=db,
        agent=agent,
        tool_name=tool_name,
        decision=decision,
        risk_score=risk_score,
        reason=reason,
        tool_call_id=tool_call.id,
    )

    return make_response(
        decision=decision,
        score=risk_score,
        reason=reason,
        tool_call_id=tool_call.id,
        approval_id=approval_id,
    )



@router.get("/status/{tool_call_id}")
async def get_tool_call_status(
    tool_call_id: int,
    agent: Agent = Depends(current_agent),
    db: AsyncSession = Depends(get_db),
):
    """
    Read the status of an existing tool authorization attempt.
    Does not execute the tool or call Gemini.
    """

    # Restrict access to tool calls belonging to this company
    # and this authenticated agent.
    result = await db.execute(
        select(ToolCall).where(
            ToolCall.id == tool_call_id,
            ToolCall.company_id == agent.company_id,
            ToolCall.agent_id == agent.id,
        )
    )
    tool_call = result.scalar_one_or_none()

    if tool_call is None:
        raise HTTPException(
            status_code=404,
            detail="Tool call not found.",
        )

    # Find the approval associated with this tool call, if any.
    approval_result = await db.execute(
        select(Approval)
        .where(
            Approval.tool_call_id == tool_call.id,
            Approval.company_id == agent.company_id,
        )
        .order_by(Approval.id.desc())
        .limit(1)
    )
    approval = approval_result.scalar_one_or_none()

    # Read the persistent company + tool decision.
    grant = await get_saved_grant(
        db,
        agent.company_id,
        tool_call.tool_name,
    )

    saved_decision = (
        str(grant.decision).strip().lower()
        if grant is not None
        else None
    )

    approval_status = (
        str(approval.status).strip().lower()
        if approval is not None
        else None
    )

    decision = str(tool_call.decision).strip().upper()

    if approval_status == "pending":
        operation_status = "approval_pending"
    elif approval_status == "rejected" or saved_decision == "rejected":
        operation_status = "blocked"
    elif approval_status == "approved" or decision == "APPROVED":
        operation_status = "approved_authorized_not_executed"
    elif decision == "ALLOW":
        operation_status = "allowed"
    elif decision == "BLOCK":
        operation_status = "blocked"
    elif decision == "APPROVAL_REQUIRED":
        operation_status = "approval_pending"
    else:
        operation_status = "unverified"

    return {
        "tool_call_id": tool_call.id,
        "tool_name": tool_call.tool_name,
        "operation_status": operation_status,
        "decision": decision,
        "risk_score": tool_call.risk_score,
        "reason": tool_call.reason,
        "approval_id": approval.id if approval else None,
        "approval_status": approval_status,
        "saved_tool_decision": saved_decision,
        "created_at": tool_call.created_at,
        "decided_at": approval.decided_at if approval else None,
        "executed": False,
    }

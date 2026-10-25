from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.agent_registry import AgentRegistry
from app.approvals.approval_service import approval_service
from app.audit.audit_service import audit_service
from app.security.data_guard import (
    detect_sensitive_data,
)
from app.security.injection_detector import (
    detect_injection,
)
from app.security.permission_engine import (
    check_permission,
)
from app.security.policy_engine import (
    evaluate_policy,
)
from app.security.risk_engine import (
    calculate_risk,
)
from app.models.tool_call_model import ToolCall


class ToolCallService:

    def __init__(self):

        self.agent_registry = AgentRegistry()

    async def authorize(
        self,
        db: AsyncSession,
        company_id: int,
        agent_id: int,
        tool_name: str,
        arguments: dict,
    ):

        # ------------------------------------------------
        # 1. Check that the agent belongs to this company
        # ------------------------------------------------

        agent = await self.agent_registry.get(
            db,
            company_id,
            agent_id,
        )

        if agent is None:

            raise ValueError(
                "Agent not found"
            )

        if not agent.active:

            raise ValueError(
                "Agent is inactive"
            )

        # ------------------------------------------------
        # 2. Check that the tool belongs to the company
        # ------------------------------------------------

        allowed, tool = await check_permission(
            db=db,
            company_id=company_id,
            tool_name=tool_name,
        )

        if not allowed:

            await audit_service.record(
                db=db,
                company_id=company_id,
                event_type="TOOL_NOT_REGISTERED",
                severity="high",
                message=(
                    f"Agent attempted to use "
                    f"unregistered tool '{tool_name}'."
                ),
                metadata={
                    "agent_id": agent_id,
                    "tool_name": tool_name,
                },
            )

            return {
                "decision": "denied",
                "risk_score": 100,
                "reason": "Tool is not registered.",
                "approval_id": None,
                "tool_call_id": None,
            }

        # ------------------------------------------------
        # 3. Prompt injection detection
        # ------------------------------------------------

        injection, injection_reason = (
            detect_injection(arguments)
        )

        # ------------------------------------------------
        # 4. Sensitive data detection
        # ------------------------------------------------

        sensitive_fields = detect_sensitive_data(
            arguments
        )

        # ------------------------------------------------
        # 5. Calculate risk
        # ------------------------------------------------

        risk_score = calculate_risk(
            risk_level=tool.risk_level,
            arguments=arguments,
            injection=injection,
            sensitive=sensitive_fields,
        )

        # ------------------------------------------------
        # 6. Evaluate company policy
        # ------------------------------------------------

        policy_action, policy_reason = (
            await evaluate_policy(
                db=db,
                company_id=company_id,
                tool_name=tool_name,
                arguments=arguments,
            )
        )

        # ------------------------------------------------
        # 7. Determine final decision
        # ------------------------------------------------

        if injection:

            decision = "denied"

            reason = injection_reason

        elif policy_action == "deny":

            decision = "denied"

            reason = policy_reason

        elif policy_action == "approval":

            decision = "approval_required"

            reason = policy_reason

        elif risk_score >= 85:

            decision = "approval_required"

            reason = (
                "Risk score is high enough "
                "to require human approval."
            )

        else:

            decision = "allowed"

            reason = (
                "Tool call passed Ageshield security checks."
            )

        # ------------------------------------------------
        # 8. Store tool call
        # ------------------------------------------------

        tool_call = ToolCall(
            company_id=company_id,
            agent_id=agent_id,
            tool_name=tool_name,
            arguments=arguments,
            decision=decision,
            risk_score=risk_score,
            reason=reason,
        )

        db.add(tool_call)

        await db.commit()
        await db.refresh(tool_call)

        # ------------------------------------------------
        # 9. Audit security decision
        # ------------------------------------------------

        severity = "info"

        if decision == "approval_required":
            severity = "warning"

        elif decision == "denied":
            severity = "high"

        await audit_service.record(
            db=db,
            company_id=company_id,
            event_type="TOOL_CALL",
            severity=severity,
            message=reason,
            metadata={
                "tool_call_id": tool_call.id,
                "agent_id": agent_id,
                "tool_name": tool_name,
                "risk_score": risk_score,
                "decision": decision,
                "injection_detected": injection,
                "sensitive_fields": sensitive_fields,
            },
        )

        # ------------------------------------------------
        # 10. Create human approval if required
        # ------------------------------------------------

        approval_id = None

        if decision == "approval_required":

            approval = (
                await approval_service.create_approval(
                    db=db,
                    company_id=company_id,
                    tool_call_id=tool_call.id,
                    details={
                        "agent_id": agent_id,
                        "agent_name": agent.name,
                        "tool_name": tool_name,
                        "arguments": arguments,
                        "risk_score": risk_score,
                        "reason": reason,
                    },
                )
            )

            approval_id = approval.id

        # ------------------------------------------------
        # 11. Return decision
        # ------------------------------------------------

        return {
            "decision": decision,
            "risk_score": risk_score,
            "reason": reason,
            "approval_id": approval_id,
            "tool_call_id": tool_call.id,
        }


tool_call_service = ToolCallService()
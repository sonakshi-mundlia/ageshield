
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.approval_model import Approval
from app.models.tool_call_model import ToolCall
from app.models.tool_grant_model import ToolGrant
from app.models.tool_grant_model import ToolGrant


def utc_now_naive() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


class ApprovalService:

    async def create_approval(
        self,
        db: AsyncSession,
        company_id: int,
        tool_call_id: int,
        details: dict,
    ) -> Approval:
        approval = Approval(
            company_id=company_id,
            tool_call_id=tool_call_id,
            status="pending",
            details=details,
        )

        db.add(approval)
        await db.commit()
        await db.refresh(approval)
        return approval

    async def get_approval(
        self,
        db: AsyncSession,
        company_id: int,
        approval_id: int,
    ) -> Approval | None:
        result = await db.execute(
            select(Approval).where(
                Approval.id == approval_id,
                Approval.company_id == company_id,
            )
        )
        return result.scalar_one_or_none()

    async def list_pending(
        self,
        db: AsyncSession,
        company_id: int,
    ) -> list[Approval]:
        result = await db.execute(
            select(Approval)
            .where(
                Approval.company_id == company_id,
                Approval.status == "pending",
            )
            .order_by(Approval.id.desc())
        )
        return list(result.scalars().all())

    async def decide(
        self,
        db: AsyncSession,
        company_id: int,
        approval_id: int,
        decision: str,
    ) -> Approval:
        decision = decision.strip().lower()

        if decision not in {"approved", "rejected"}:
            raise ValueError(
                "Decision must be approved or rejected"
            )

        try:
            # Lock the approval to prevent concurrent decisions.
            result = await db.execute(
                select(Approval)
                .where(
                    Approval.id == approval_id,
                    Approval.company_id == company_id,
                )
                .with_for_update()
            )
            approval = result.scalar_one_or_none()

            if approval is None:
                raise ValueError("Approval not found")

            if approval.status != "pending":
                raise ValueError(
                    "Approval has already been decided"
                )

            # Lock the associated tool call and verify tenant ownership.
            tool_result = await db.execute(
                select(ToolCall)
                .where(
                    ToolCall.id == approval.tool_call_id,
                    ToolCall.company_id == company_id,
                )
                .with_for_update()
            )
            tool_call = tool_result.scalar_one_or_none()

            if tool_call is None:
                raise ValueError(
                    "Associated tool call was not found"
                )

            tool_name = tool_call.tool_name.strip()
            if not tool_name:
                raise ValueError(
                    "Associated tool call has no tool name"
                )

            # Lock any existing persistent decision for this company/tool.
            grant_result = await db.execute(
                select(ToolGrant)
                .where(
                    ToolGrant.company_id == company_id,
                    ToolGrant.tool_name == tool_name,
                )
                .with_for_update()
            )
            grant = grant_result.scalar_one_or_none()

            # Persist the final decision for future authorization requests.
            if grant is None:
                grant = ToolGrant(
                    company_id=company_id,
                    tool_name=tool_name,
                    decision=decision,
                    updated_at=utc_now_naive(),
                )
                db.add(grant)
            else:
                grant.decision = decision
                grant.updated_at = utc_now_naive()

            # Finalize this approval record.
            approval.status = decision
            approval.decided_at = utc_now_naive()

            # This records the decision; it does not execute the tool.
            if decision == "approved":
                tool_call.decision = "APPROVED"
                tool_call.reason = (
                    f"{tool_call.reason} "
                    "Human reviewer approved this tool. "
                    "The original operation has not been "
                    "confirmed as executed."
                )[:1000]
            else:
                tool_call.decision = "BLOCK"
                tool_call.reason = (
                    f"{tool_call.reason} "
                    "Human reviewer rejected this tool. "
                    "The operation must not execute."
                )[:1000]

            # Commit approval, tool-call update, and persistent grant together.
            await db.commit()
            await db.refresh(approval)

            return approval

        except Exception:
            await db.rollback()
            raise


approval_service = ApprovalService()

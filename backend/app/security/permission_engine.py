
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.tool_model import Tool


class PermissionEngine:

    async def check(
        self,
        db: AsyncSession,
        company_id: int,
        request: dict[str, Any],
        configuration: dict[str, Any],
    ) -> dict[str, Any]:

        # 1. Validate tool name.
        tool_name = request.get("tool_name")

        if not isinstance(tool_name, str) or not tool_name.strip():
            return {
                "decision": "BLOCK",
                "reason": "A valid tool name is required.",
                "tool": None,
            }

        tool_name = tool_name.strip()

        # 2. Validate security configuration.
        if not isinstance(configuration, dict):
            return {
                "decision": "BLOCK",
                "reason": "Invalid security configuration.",
                "tool": None,
            }

        security = configuration.get("security", {})

        if not isinstance(security, dict):
            return {
                "decision": "BLOCK",
                "reason": "Invalid security configuration.",
                "tool": None,
            }

        # 3. Tool permission checks must always be enabled.
        if security.get("tool_permission_check", True) is not True:
            return {
                "decision": "BLOCK",
                "reason": "Tool permission checking cannot be disabled.",
                "tool": None,
            }

        # 4. Find the tool registered for this company.
        result = await db.execute(
            select(Tool).where(
                Tool.company_id == company_id,
                Tool.name == tool_name,
            )
        )

        tool = result.scalar_one_or_none()

        # 5. Block unregistered tools.
        if tool is None:
            return {
                "decision": "BLOCK",
                "reason": (
                    f"Tool '{tool_name}' is not registered "
                    "for this company."
                ),
                "tool": None,
            }

        # 6. Check active status if the model supports it.
        if hasattr(tool, "is_active") and not tool.is_active:
            return {
                "decision": "BLOCK",
                "reason": f"Tool '{tool_name}' is disabled.",
                "tool": None,
            }

        if hasattr(tool, "active") and not tool.active:
            return {
                "decision": "BLOCK",
                "reason": f"Tool '{tool_name}' is disabled.",
                "tool": None,
            }

        # 7. Registration check passed.
        # Policy and risk engines still make the final decision.
        return {
            "decision": "ALLOW",
            "reason": f"Tool '{tool_name}' is registered for this company.",
            "tool": tool,
        }




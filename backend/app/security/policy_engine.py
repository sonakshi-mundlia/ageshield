
from typing import Any

from sqlalchemy import select

from app.models.policy_model import Policy


class PolicyEngine:
    async def evaluate(
        self,
        db,
        company_id: int,
        request: dict[str, Any],
        configuration: dict[str, Any],
    ) -> dict[str, Any]:
        tool_name = request.get("tool_name")
        arguments = request.get("arguments", {})

        if not isinstance(arguments, dict):
            arguments = {}

        normalized_arguments = {
            str(key).lower(): value
            for key, value in arguments.items()
        }

        # Check policies in the effective configuration first.
        configured_policies = configuration.get("policies", {})
        if isinstance(configured_policies, dict):
            configured_policies = list(configured_policies.values())

        if isinstance(configured_policies, list):
            for policy in configured_policies:
                if not isinstance(policy, dict):
                    continue

                if policy.get("enabled", True) is False:
                    continue

                # Wildcard policies must not block every registered tool.
                # PermissionEngine handles unregistered tools.
                policy_tool = policy.get(
                    "tool_name",
                    policy.get("tool"),
                )
                if not policy_tool or policy_tool == "*":
                    continue

                if policy_tool != tool_name:
                    continue

                if not self._amount_matches(
                    policy, normalized_arguments
                ):
                    continue

                if not self._conditions_match(
                    policy.get("conditions", {}),
                    normalized_arguments,
                ):
                    continue

                return self._result(
                    action=policy.get("action", "BLOCK"),
                    policy_name=policy.get("name", "Configured policy"),
                    reason=f"Configured policy '{policy.get('name', 'Unnamed policy')}' matched.",
                )

        # Then check policies stored for this company in the database.
        result = await db.execute(
            select(Policy).where(
                Policy.company_id == company_id,
                Policy.tool_name == tool_name,
                Policy.enabled.is_(True),
            )
        )
        policies = result.scalars().all()

        for policy in policies:
            if not self._amount_matches(
                {
                    "min_amount": policy.min_amount,
                    "max_amount": policy.max_amount,
                },
                normalized_arguments,
            ):
                continue

            if not self._conditions_match(
                policy.conditions,
                normalized_arguments,
            ):
                continue

            return self._result(
                action=policy.action,
                policy_name=policy.name,
                reason=f"Company policy '{policy.name}' matched.",
                policy_id=policy.id,
            )

        return {
            "decision": "ALLOW",
            "action": "allow",
            "policy_id": None,
            "policy_name": None,
            "reason": "No restrictive policy matched.",
        }

    @staticmethod
    def _amount_matches(
        policy: dict[str, Any],
        arguments: dict[str, Any],
    ) -> bool:
        minimum = policy.get("min_amount")
        maximum = policy.get("max_amount")

        if minimum is None and maximum is None:
            return True

        amount = arguments.get("amount")

        if (
            not isinstance(amount, (int, float))
            or isinstance(amount, bool)
        ):
            return False

        if minimum is not None and amount < minimum:
            return False

        if maximum is not None and amount > maximum:
            return False

        return True

    @staticmethod
    def _conditions_match(
        conditions: Any,
        arguments: dict[str, Any],
    ) -> bool:
        if not conditions:
            return True

        if not isinstance(conditions, dict):
            # Fail closed for malformed policy conditions.
            return False

        for key, expected_value in conditions.items():
            if arguments.get(str(key).lower()) != expected_value:
                return False

        return True

    @staticmethod
    def _result(
        action: Any,
        policy_name: str,
        reason: str,
        policy_id: int | None = None,
    ) -> dict[str, Any]:
        normalized_action = str(action).strip().lower()

        if normalized_action in {"block", "deny", "reject"}:
            decision = "BLOCK"
            normalized_action = "deny"
        elif normalized_action in {
            "approval",
            "require_approval",
            "approval_required",
            "review",
        }:
            decision = "APPROVAL_REQUIRED"
            normalized_action = "require_approval"
        elif normalized_action == "allow":
            decision = "ALLOW"
        else:
            # Unknown policy actions must not grant access.
            decision = "BLOCK"
            normalized_action = "deny"

        return {
            "decision": decision,
            "action": normalized_action,
            "policy_id": policy_id,
            "policy_name": policy_name,
            "reason": reason,
        }

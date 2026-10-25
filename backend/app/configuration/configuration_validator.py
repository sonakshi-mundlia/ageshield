from typing import Any


# ============================================================
# REQUIRED GLOBAL CONFIGURATION SECTIONS
# ============================================================

REQUIRED_SECTIONS = [
    "security",
    "risk",
    "policies",
    "approval_rules",
    "data_patterns",
    "guidelines",
    "agents",
]


# ============================================================
# REQUIRED SECURITY SETTINGS
# ============================================================

REQUIRED_SECURITY_SETTINGS = [
    "prompt_injection_detection",
    "sensitive_data_detection",
    "tool_permission_check",
    "audit_logging",
]


# ============================================================
# NON-OVERRIDABLE SECURITY SETTINGS
# ============================================================

NON_OVERRIDABLE_SECURITY = {
    "prompt_injection_detection",
    "audit_logging",
    "sensitive_data_detection",
    "tool_permission_check",
}


# ============================================================
# VALID RISK LEVELS / ACTIONS
# ============================================================

VALID_RISK_LEVELS = {
    "low",
    "medium",
    "high",
}

VALID_ACTIONS = {
    "ALLOW",
    "BLOCK",
    "REVIEW",
    "DETECT",
    "REQUIRE_APPROVAL",
}


# ============================================================
# MAIN VALIDATOR
# ============================================================

def validate_configuration(
    configuration: dict[str, Any]
) -> tuple[bool, list[str]]:

    errors: list[str] = []

    # --------------------------------------------------------
    # Root validation
    # --------------------------------------------------------

    if not isinstance(configuration, dict):
        return False, [
            "Configuration must be a JSON object."
        ]

    # --------------------------------------------------------
    # Required sections
    # --------------------------------------------------------

    for section in REQUIRED_SECTIONS:

        if section not in configuration:

            errors.append(
                f"Missing required section: {section}"
            )

    # --------------------------------------------------------
    # Security validation
    # --------------------------------------------------------

    security = configuration.get("security", {})

    if not isinstance(security, dict):

        errors.append(
            "security must be an object."
        )

    else:

        for setting in REQUIRED_SECURITY_SETTINGS:

            if setting not in security:

                errors.append(
                    f"Missing security setting: {setting}"
                )

            elif not isinstance(
                security[setting],
                bool
            ):

                errors.append(
                    f"security.{setting} must be a boolean."
                )

        # Companies cannot disable mandatory security
        for setting in NON_OVERRIDABLE_SECURITY:

            if (
                setting in security
                and security[setting] is False
            ):

                errors.append(
                    f"security.{setting} cannot be disabled."
                )

    # --------------------------------------------------------
    # Risk validation
    # --------------------------------------------------------

    risk = configuration.get("risk", {})

    if not isinstance(risk, dict):

        errors.append(
            "risk must be an object."
        )

    else:

        required_thresholds = [
            "low_threshold",
            "medium_threshold",
            "high_threshold",
        ]

        for threshold in required_thresholds:

            if threshold not in risk:

                errors.append(
                    f"Missing risk setting: {threshold}"
                )

            elif not isinstance(
                risk[threshold],
                (int, float)
            ):

                errors.append(
                    f"risk.{threshold} must be a number."
                )

        # Validate threshold ordering
        if all(
            isinstance(
                risk.get(key),
                (int, float)
            )
            for key in required_thresholds
        ):

            low = risk["low_threshold"]
            medium = risk["medium_threshold"]
            high = risk["high_threshold"]

            if not (0 <= low < medium < high <= 100):

                errors.append(
                    "Risk thresholds must satisfy "
                    "0 <= low < medium < high <= 100."
                )

        # Validate risk actions
        actions = risk.get("actions", {})

        if not isinstance(actions, dict):

            errors.append(
                "risk.actions must be an object."
            )

        else:

            for level in VALID_RISK_LEVELS:

                if level not in actions:

                    errors.append(
                        f"Missing risk action: {level}"
                    )

                elif actions[level] not in VALID_ACTIONS:

                    errors.append(
                        f"Invalid action for risk level "
                        f"'{level}': {actions[level]}"
                    )

    # --------------------------------------------------------
    # Policies validation
    # --------------------------------------------------------

    policies = configuration.get("policies", [])

    if not isinstance(policies, list):

        errors.append(
            "policies must be an array."
        )

    else:

        for index, policy in enumerate(policies):

            if not isinstance(policy, dict):

                errors.append(
                    f"policies[{index}] must be an object."
                )
                continue

            # Required policy fields
            required_fields = [
                "id",
                "name",
                "tool",
                "action",
            ]

            for field in required_fields:

                if field not in policy:

                    errors.append(
                        f"policies[{index}] "
                        f"missing required field: {field}"
                    )

            # Validate action
            if (
                "action" in policy
                and policy["action"] not in VALID_ACTIONS
            ):

                errors.append(
                    f"policies[{index}].action "
                    f"must be one of: "
                    f"{', '.join(sorted(VALID_ACTIONS))}."
                )

            # Validate enabled
            if (
                "enabled" in policy
                and not isinstance(
                    policy["enabled"],
                    bool
                )
            ):

                errors.append(
                    f"policies[{index}].enabled "
                    f"must be a boolean."
                )

    # --------------------------------------------------------
    # Approval rules validation
    # --------------------------------------------------------

    approval_rules = configuration.get(
        "approval_rules",
        []
    )

    if not isinstance(
        approval_rules,
        list
    ):

        errors.append(
            "approval_rules must be an array."
        )

    else:

        for index, rule in enumerate(
            approval_rules
        ):

            if not isinstance(rule, dict):

                errors.append(
                    f"approval_rules[{index}] "
                    f"must be an object."
                )
                continue

            required_fields = [
                "id",
                "name",
                "condition",
                "action",
            ]

            for field in required_fields:

                if field not in rule:

                    errors.append(
                        f"approval_rules[{index}] "
                        f"missing required field: {field}"
                    )

            # Validate action
            if (
                "action" in rule
                and rule["action"]
                not in {"REQUIRE_APPROVAL"}
            ):

                errors.append(
                    f"approval_rules[{index}].action "
                    f"must be REQUIRE_APPROVAL."
                )

            # Validate condition
            condition = rule.get(
                "condition"
            )

            if condition is not None:

                if not isinstance(
                    condition,
                    dict
                ):

                    errors.append(
                        f"approval_rules[{index}].condition "
                        f"must be an object."
                    )

    # --------------------------------------------------------
    # Data patterns validation
    # --------------------------------------------------------

    data_patterns = configuration.get(
        "data_patterns",
        []
    )

    if not isinstance(
        data_patterns,
        list
    ):

        errors.append(
            "data_patterns must be an array."
        )

    else:

        for index, pattern in enumerate(
            data_patterns
        ):

            if not isinstance(
                pattern,
                dict
            ):

                errors.append(
                    f"data_patterns[{index}] "
                    f"must be an object."
                )
                continue

            required_fields = [
                "name",
                "type",
            ]

            for field in required_fields:

                if field not in pattern:

                    errors.append(
                        f"data_patterns[{index}] "
                        f"missing required field: {field}"
                    )

            if (
                "severity" in pattern
                and pattern["severity"]
                not in VALID_RISK_LEVELS
            ):

                errors.append(
                    f"data_patterns[{index}].severity "
                    f"must be low, medium, or high."
                )

            if (
                "action" in pattern
                and pattern["action"]
                not in VALID_ACTIONS
            ):

                errors.append(
                    f"data_patterns[{index}].action "
                    f"has an invalid action."
                )

    # --------------------------------------------------------
    # Guidelines validation
    # --------------------------------------------------------

    guidelines = configuration.get(
        "guidelines",
        {}
    )

    if not isinstance(
        guidelines,
        dict
    ):

        errors.append(
            "guidelines must be an object."
        )

    else:

        guideline_categories = [
            "security",
            "data_handling",
            "tool_usage",
            "audit",
        ]

        for category in guideline_categories:

            if category not in guidelines:

                errors.append(
                    f"Missing guideline category: "
                    f"{category}"
                )

            elif not isinstance(
                guidelines[category],
                list
            ):

                errors.append(
                    f"guidelines.{category} "
                    f"must be an array."
                )

            else:

                for index, guideline in enumerate(
                    guidelines[category]
                ):

                    if not isinstance(
                        guideline,
                        str
                    ):

                        errors.append(
                            f"guidelines.{category}[{index}] "
                            f"must be a string."
                        )

    # --------------------------------------------------------
    # Agents validation
    # --------------------------------------------------------

    agents = configuration.get(
        "agents",
        {}
    )

    if not isinstance(
        agents,
        dict
    ):

        errors.append(
            "agents must be an object."
        )

    else:

        if (
            "default_permissions" in agents
            and not isinstance(
                agents["default_permissions"],
                list
            )
        ):

            errors.append(
                "agents.default_permissions "
                "must be an array."
            )

        if (
            "default_risk_level" in agents
            and agents["default_risk_level"]
            not in VALID_RISK_LEVELS
        ):

            errors.append(
                "agents.default_risk_level "
                "must be low, medium, or high."
            )

        boolean_agent_settings = [
            "require_tool_authorization",
            "require_audit_logging",
        ]

        for setting in boolean_agent_settings:

            if (
                setting in agents
                and not isinstance(
                    agents[setting],
                    bool
                )
            ):

                errors.append(
                    f"agents.{setting} "
                    f"must be a boolean."
                )

    # --------------------------------------------------------
    # Final result
    # --------------------------------------------------------

    return len(errors) == 0, errors
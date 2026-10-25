from copy import deepcopy
from typing import Any

from app.configuration.global_config import (
    GLOBAL_CONFIG,
    NON_OVERRIDABLE_SECURITY,
    NON_OVERRIDABLE_POLICIES,
    NON_OVERRIDABLE_GUIDELINES,
)


def merge_configuration(
    company_config: dict[str, Any]
) -> dict[str, Any]:

    # ============================================================
    # START WITH GLOBAL DEFAULTS
    # ============================================================

    effective_config = deepcopy(GLOBAL_CONFIG)

    # ============================================================
    # SECURITY SETTINGS
    # ============================================================

    company_security = company_config.get(
        "security",
        {}
    )

    if isinstance(company_security, dict):

        for key, value in company_security.items():

            # Mandatory security controls cannot be disabled.
            if key in NON_OVERRIDABLE_SECURITY:

                if value is False:
                    continue

            effective_config["security"][key] = value

    # ============================================================
    # RISK SETTINGS
    # ============================================================

    company_risk = company_config.get(
        "risk",
        {}
    )

    if isinstance(company_risk, dict):

        effective_config["risk"].update(
            company_risk
        )

    # ============================================================
    # POLICIES
    # ============================================================

    global_policies = deepcopy(
        effective_config.get(
            "policies",
            []
        )
    )

    company_policies = company_config.get(
        "policies",
        []
    )

    if isinstance(company_policies, list):

        # Global policies always remain.
        effective_config["policies"] = (
            global_policies +
            deepcopy(company_policies)
        )

    # ============================================================
    # APPROVAL RULES
    # ============================================================

    global_approval_rules = deepcopy(
        effective_config.get(
            "approval_rules",
            []
        )
    )

    company_approval_rules = company_config.get(
        "approval_rules",
        []
    )

    if isinstance(company_approval_rules, list):

        effective_config["approval_rules"] = (
            global_approval_rules +
            deepcopy(company_approval_rules)
        )

    # ============================================================
    # DATA PATTERNS
    # ============================================================

    global_patterns = deepcopy(
        effective_config.get(
            "data_patterns",
            []
        )
    )

    company_patterns = company_config.get(
        "data_patterns",
        []
    )

    if isinstance(company_patterns, list):

        effective_config["data_patterns"] = (
            global_patterns +
            deepcopy(company_patterns)
        )

    # ============================================================
    # GUIDELINES
    # ============================================================

    global_guidelines = effective_config.get(
        "guidelines",
        {}
    )

    company_guidelines = company_config.get(
        "guidelines",
        {}
    )

    if isinstance(company_guidelines, dict):

        for category, guidelines in company_guidelines.items():

            if not isinstance(guidelines, list):
                continue

            # Create category if company introduces
            # a new guideline category.
            if category not in global_guidelines:

                global_guidelines[category] = []

            # Company guidelines are added to global guidelines.
            global_guidelines[category].extend(
                deepcopy(guidelines)
            )

    effective_config["guidelines"] = global_guidelines

    # ============================================================
    # AGENTS
    # ============================================================

    global_agents = effective_config.get(
        "agents",
        {}
    )

    company_agents = company_config.get(
        "agents",
        {}
    )

    if isinstance(global_agents, dict):

        if isinstance(company_agents, dict):

            # Company can customize agent defaults,
            # but global defaults remain available.
            global_agents.update(
                deepcopy(company_agents)
            )

        effective_config["agents"] = global_agents

    # ============================================================
    # VERSION
    # ============================================================

    effective_config["version"] = GLOBAL_CONFIG[
        "version"
    ]

    return effective_config
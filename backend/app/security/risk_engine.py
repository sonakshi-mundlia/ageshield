from typing import Any


# ============================================================
# BASE RISK WEIGHTS
# ============================================================

RISK_WEIGHTS = {
    "low": 15,
    "medium": 40,
    "high": 70,
    "critical": 90,
}


class RiskEngine:

    def evaluate(
        self,
        request: dict[str, Any],
        configuration: dict[str, Any],
    ) -> dict[str, Any]:

        # ----------------------------------------------------
        # Extract request information
        # ----------------------------------------------------

        arguments = request.get(
            "arguments",
            {}
        )

        if not isinstance(arguments, dict):
            arguments = {}

        # ----------------------------------------------------
        # Get tool risk level
        # ----------------------------------------------------

        risk_level = self._get_risk_level(
            request,
            configuration
        )

        # ----------------------------------------------------
        # Prompt injection
        # ----------------------------------------------------

        injection = bool(
            request.get(
                "injection",
                False
            )
        )

        # ----------------------------------------------------
        # Sensitive data
        # ----------------------------------------------------

        sensitive = request.get(
            "sensitive",
            []
        )

        if not isinstance(sensitive, list):
            sensitive = []

        # ----------------------------------------------------
        # Calculate score
        # ----------------------------------------------------

        score = self.calculate_risk(
            risk_level=risk_level,
            arguments=arguments,
            injection=injection,
            sensitive=sensitive,
        )

        # ----------------------------------------------------
        # Determine risk level
        # ----------------------------------------------------

        evaluated_level = (
            self._get_score_level(
                score,
                configuration
            )
        )

        # ----------------------------------------------------
        # Determine decision
        # ----------------------------------------------------

        decision = self._get_decision(
            score,
            evaluated_level,
            configuration
        )

        return {
            "score": score,
            "level": evaluated_level,
            "decision": decision,
        }

    # ========================================================
    # CALCULATE RISK SCORE
    # ========================================================

    def calculate_risk(
        self,
        risk_level: str,
        arguments: dict[str, Any],
        injection: bool = False,
        sensitive: list | None = None,
    ) -> int:

        # ----------------------------------------------------
        # 1. Base risk
        # ----------------------------------------------------

        score = RISK_WEIGHTS.get(
            str(risk_level).lower(),
            40,
        )

        # Normalize argument keys
        keys = {
            str(key).lower()
            for key in arguments.keys()
        }

        # ----------------------------------------------------
        # 2. Prompt injection
        # ----------------------------------------------------

        if injection:
            score += 25

        # ----------------------------------------------------
        # 3. Sensitive data
        # ----------------------------------------------------

        if sensitive:
            score += 15

        # ----------------------------------------------------
        # 4. Authentication / credentials
        # ----------------------------------------------------

        authentication_risks = {
            "password",
            "passwd",
            "passcode",
            "pin",
            "token",
            "access_token",
            "refresh_token",
            "auth_token",
            "api_key",
            "apikey",
            "api_secret",
            "secret",
            "client_secret",
            "credential",
            "credentials",
            "private_key",
            "access_key",
            "session_token",
            "session_id",
        }

        if any(
            any(
                pattern in key
                for pattern in authentication_risks
            )
            for key in keys
        ):
            score += 15

        # ----------------------------------------------------
        # 5. Financial operations
        # ----------------------------------------------------

        financial_risks = {
            "amount",
            "price",
            "payment",
            "transfer",
            "transaction",
            "withdraw",
            "deposit",
            "refund",
            "purchase",
            "payment_method",
            "bank_account",
            "account_number",
            "credit_card",
            "card_number",
            "cvv",
            "cvc",
            "iban",
            "routing_number",
            "upi",
            "upi_id",
        }

        if any(
            any(
                pattern in key
                for pattern in financial_risks
            )
            for key in keys
        ):
            score += 15

        # ----------------------------------------------------
        # 6. Large financial amount
        # ----------------------------------------------------

        amount = arguments.get(
            "amount"
        )

        if (
            isinstance(amount, (int, float))
            and not isinstance(amount, bool)
        ):

            if amount >= 100000:
                score += 30

            elif amount >= 50000:
                score += 25

            elif amount >= 10000:
                score += 20

            elif amount >= 5000:
                score += 15

            elif amount >= 1000:
                score += 10

            elif amount >= 500:
                score += 5

        # ----------------------------------------------------
        # 7. Privilege / permission changes
        # ----------------------------------------------------

        privilege_risks = {
            "admin",
            "administrator",
            "role",
            "permission",
            "permissions",
            "privilege",
            "privileges",
            "access_level",
            "is_admin",
            "superuser",
            "sudo",
        }

        if any(
            any(
                pattern in key
                for pattern in privilege_risks
            )
            for key in keys
        ):
            score += 20

        # ----------------------------------------------------
        # 8. Destructive operations
        # ----------------------------------------------------

        destructive_risks = {
            "delete",
            "remove",
            "destroy",
            "drop",
            "truncate",
            "terminate",
            "revoke",
            "disable",
            "shutdown",
            "wipe",
            "purge",
            "erase",
            "reset",
        }

        if any(
            any(
                pattern in key
                for pattern in destructive_risks
            )
            for key in keys
        ):
            score += 25

        # ----------------------------------------------------
        # 9. Command / code execution
        # ----------------------------------------------------

        execution_risks = {
            "command",
            "cmd",
            "shell",
            "script",
            "execute",
            "exec",
            "code",
            "eval",
            "expression",
            "program",
            "query",
        }

        if any(
            any(
                pattern in key
                for pattern in execution_risks
            )
            for key in keys
        ):
            score += 25

        # ----------------------------------------------------
        # 10. File / filesystem access
        # ----------------------------------------------------

        file_risks = {
            "file",
            "filename",
            "filepath",
            "path",
            "directory",
            "folder",
            "filesystem",
            "upload",
            "download",
            "attachment",
        }

        if any(
            any(
                pattern in key
                for pattern in file_risks
            )
            for key in keys
        ):
            score += 15

        # ----------------------------------------------------
        # 11. Network / external access
        # ----------------------------------------------------

        network_risks = {
            "url",
            "uri",
            "endpoint",
            "host",
            "hostname",
            "ip",
            "ip_address",
            "port",
            "webhook",
            "callback",
            "redirect",
            "redirect_url",
            "external_url",
            "proxy",
        }

        if any(
            any(
                pattern in key
                for pattern in network_risks
            )
            for key in keys
        ):
            score += 15

        # ----------------------------------------------------
        # 12. Database operations
        # ----------------------------------------------------

        database_risks = {
            "database",
            "db",
            "database_url",
            "connection_string",
            "connection_url",
            "sql",
            "query",
            "table",
            "schema",
            "migration",
        }

        if any(
            any(
                pattern in key
                for pattern in database_risks
            )
            for key in keys
        ):
            score += 15

        # ----------------------------------------------------
        # 13. Personal / identity information
        # ----------------------------------------------------

        privacy_risks = {
            "name",
            "email",
            "phone",
            "phone_number",
            "address",
            "home_address",
            "date_of_birth",
            "dob",
            "ssn",
            "social_security_number",
            "aadhaar",
            "aadhaar_number",
            "pan",
            "pan_number",
            "passport",
            "passport_number",
            "driving_license",
            "national_id",
            "tax_id",
        }

        if any(
            any(
                pattern in key
                for pattern in privacy_risks
            )
            for key in keys
        ):
            score += 10

        # ----------------------------------------------------
        # 14. Security configuration changes
        # ----------------------------------------------------

        security_risks = {
            "security",
            "security_setting",
            "safety",
            "firewall",
            "authentication",
            "authorization",
            "mfa",
            "2fa",
            "encryption",
            "certificate",
            "ssl",
            "tls",
            "security_policy",
        }

        if any(
            any(
                pattern in key
                for pattern in security_risks
            )
            for key in keys
        ):
            score += 20

        # ----------------------------------------------------
        # 15. Logging / monitoring changes
        # ----------------------------------------------------

        monitoring_risks = {
            "log",
            "logs",
            "logging",
            "audit",
            "audit_log",
            "monitoring",
            "alert",
            "alerts",
            "trace",
        }

        if any(
            any(
                pattern in key
                for pattern in monitoring_risks
            )
            for key in keys
        ):
            score += 10

        # ----------------------------------------------------
        # 16. Bulk / mass operations
        # ----------------------------------------------------

        bulk_risks = {
            "bulk",
            "batch",
            "mass",
            "all_users",
            "all_records",
            "multiple",
            "count",
            "limit",
        }

        if any(
            any(
                pattern in key
                for pattern in bulk_risks
            )
            for key in keys
        ):
            score += 15

        # ----------------------------------------------------
        # 17. External side effects
        # ----------------------------------------------------

        side_effect_risks = {
            "send",
            "send_email",
            "send_message",
            "publish",
            "post",
            "deploy",
            "deployment",
            "restart",
            "start",
            "stop",
            "update",
            "modify",
            "change",
        }

        if any(
            any(
                pattern in key
                for pattern in side_effect_risks
            )
            for key in keys
        ):
            score += 10

        # ----------------------------------------------------
        # 18. Keep score between 0 and 100
        # ----------------------------------------------------

        return max(
            0,
            min(score, 100)
        )

    # ========================================================
    # GET TOOL RISK LEVEL
    # ========================================================

    def _get_risk_level(
        self,
        request: dict[str, Any],
        configuration: dict[str, Any],
    ) -> str:

        # First try the request itself.
        if request.get("risk_level"):
            return str(
                request["risk_level"]
            )

        # Then check configured tools.
        tools = configuration.get(
            "tools",
            []
        )

        if isinstance(tools, list):

            tool_name = request.get(
                "tool_name"
            )

            for tool in tools:

                if (
                    isinstance(tool, dict)
                    and tool.get("name")
                    == tool_name
                ):

                    return str(
                        tool.get(
                            "risk_level",
                            "medium"
                        )
                    )

        return "medium"

    # ========================================================
    # CONVERT SCORE TO RISK LEVEL
    # ========================================================

    def _get_score_level(
        self,
        score: int,
        configuration: dict[str, Any],
    ) -> str:

        risk = configuration.get(
            "risk",
            {}
        )

        if not isinstance(risk, dict):
            risk = {}

        low_threshold = int(
            risk.get(
                "low_threshold",
                30
            )
        )

        medium_threshold = int(
            risk.get(
                "medium_threshold",
                60
            )
        )

        high_threshold = int(
            risk.get(
                "high_threshold",
                80
            )
        )

        if score < low_threshold:
            return "low"

        if score < medium_threshold:
            return "medium"

        if score < high_threshold:
            return "high"

        return "critical"

    # ========================================================
    # FINAL RISK DECISION
    # ========================================================

    def _get_decision(
        self,
        score: int,
        level: str,
        configuration: dict[str, Any],
    ) -> str:

        risk = configuration.get(
            "risk",
            {}
        )

        if not isinstance(risk, dict):
            risk = {}

        actions = risk.get(
            "actions",
            {}
        )

        if isinstance(actions, dict):

            configured_action = actions.get(
                level
            )

            if configured_action:
                action = str(configured_action).strip().upper()
                
                if action in {"BLOCK", "DENY", "REJECT"}:
                    return "BLOCK"
                    
                if action in {
                    "REVIEW",
                    "APPROVAL",
                    "REQUIRE_APPROVAL",
                    "APPROVAL_REQUIRED",
                }:
                    return "APPROVAL_REQUIRED"

                if action == "ALLOW":
                    return "ALLOW"
                
                return "BLOCK"

        # Default behavior
        if level == "critical":
            return "BLOCK"

        if level == "high":
            return "REQUIRE_APPROVAL"

        return "ALLOW"
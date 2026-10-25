from typing import Any

from pydantic import BaseModel


# ============================================================
# CONFIGURATION SAVE RESPONSE
# ============================================================

class ConfigurationResponse(BaseModel):

    success: bool

    message: str

    configuration_id: int

    company_id: int

    version: str

    summary: dict[str, Any]


# ============================================================
# EFFECTIVE CONFIGURATION RESPONSE
# ============================================================

class EffectiveConfigurationResponse(BaseModel):

    company_id: int

    configuration: dict[str, Any]
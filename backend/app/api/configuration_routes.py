import json

from fastapi import (
    APIRouter,
    UploadFile,
    File,
    HTTPException,
    Depends
)

from app.configuration.configuration_validator import (
    validate_configuration
)

from app.configuration.configuration_service import (
    ConfigurationService
)

from app.configuration.configuration_merger import (
    merge_configuration
)

from app.schemas.configuration_schema import (
    ConfigurationResponse,
    EffectiveConfigurationResponse
)

from app.dependencies import current_user
from app.models.user_model import User


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/company",
    tags=["Company Configuration"]
)


configuration_service = ConfigurationService()


# ============================================================
# UPLOAD COMPANY CONFIGURATION
# ============================================================

@router.post(
    "/configuration",
    response_model=ConfigurationResponse
)
async def upload_configuration(
    file: UploadFile = File(...),
    user: User = Depends(current_user)
):

    # --------------------------------------------------------
    # File validation
    # --------------------------------------------------------

    if not file.filename:

        raise HTTPException(
            status_code=400,
            detail="No file selected."
        )

    if not file.filename.lower().endswith(
        ".json"
    ):

        raise HTTPException(
            status_code=400,
            detail="Only JSON files are allowed."
        )

    # --------------------------------------------------------
    # Read file
    # --------------------------------------------------------

    content = await file.read()

    if len(content) > 5 * 1024 * 1024:

        raise HTTPException(
            status_code=400,
            detail="Configuration file cannot exceed 5 MB."
        )

    # --------------------------------------------------------
    # Parse JSON
    # --------------------------------------------------------

    try:

        configuration = json.loads(
            content.decode("utf-8")
        )

    except UnicodeDecodeError:

        raise HTTPException(
            status_code=400,
            detail="Configuration file must use UTF-8 encoding."
        )

    except json.JSONDecodeError:

        raise HTTPException(
            status_code=400,
            detail="Invalid JSON configuration."
        )

    # --------------------------------------------------------
    # Validate configuration
    # --------------------------------------------------------

    valid, errors = validate_configuration(
        configuration
    )

    if not valid:

        raise HTTPException(
            status_code=400,
            detail={
                "message": "Invalid configuration.",
                "errors": errors
            }
        )

    # --------------------------------------------------------
    # Save configuration
    # --------------------------------------------------------

    saved = await configuration_service.save_configuration(
        company_id=user.company_id,
        configuration=configuration
    )

    # --------------------------------------------------------
    # Prepare summary
    # --------------------------------------------------------

    policies = configuration.get(
        "policies",
        []
    )

    approval_rules = configuration.get(
        "approval_rules",
        []
    )

    data_patterns = configuration.get(
        "data_patterns",
        []
    )

    guidelines = configuration.get(
        "guidelines",
        {}
    )

    agents = configuration.get(
        "agents",
        {}
    )

    # --------------------------------------------------------
    # Return response
    # --------------------------------------------------------

    return {
        "success": True,

        "message": (
            "Configuration uploaded successfully."
        ),

        "configuration_id": saved.id,

        "company_id": user.company_id,

        "version": configuration.get(
            "version",
            "1.0"
        ),

        "summary": {

            "policies": len(
                policies
            ),

            "approval_rules": len(
                approval_rules
            ),

            "data_patterns": len(
                data_patterns
            ),

            "guidelines": sum(
                len(items)
                for items in guidelines.values()
                if isinstance(items, list)
            ),

            "agents": (
                1
                if isinstance(agents, dict)
                and agents
                else 0
            )
        }
    }


# ============================================================
# GET EFFECTIVE CONFIGURATION
# ============================================================

@router.get(
    "/configuration/effective",
    response_model=EffectiveConfigurationResponse
)
async def get_effective_configuration(
    user=Depends(current_user)
):

    # --------------------------------------------------------
    # Get latest company configuration
    # --------------------------------------------------------

    company_record = (
        await configuration_service.get_configuration(
            user.company_id
        )
    )

    # --------------------------------------------------------
    # No company configuration
    # --------------------------------------------------------

    if company_record is None:

        # Use only global configuration.
        effective_config = merge_configuration(
            {}
        )

    # --------------------------------------------------------
    # Company configuration exists
    # --------------------------------------------------------

    else:

        effective_config = merge_configuration(
            company_record.configuration
        )

    # --------------------------------------------------------
    # Return effective configuration
    # --------------------------------------------------------

    return {
        "company_id": user.company_id,
        "configuration": effective_config
    }
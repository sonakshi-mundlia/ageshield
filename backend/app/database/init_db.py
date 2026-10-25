
from app.database.db import Base, engine

# Import all models so SQLAlchemy registers every table.
from app.models.company_model import Company
from app.models.user_model import User
from app.models.agent_model import Agent
from app.models.tool_model import Tool
from app.models.policy_model import Policy
from app.models.tool_call_model import ToolCall
from app.models.approval_model import Approval
from app.models.security_event_model import SecurityEvent
from app.models.tool_grant_model import ToolGrant


async def init_db():
    async with engine.begin() as connection:
        await connection.run_sync(
            Base.metadata.create_all
        )

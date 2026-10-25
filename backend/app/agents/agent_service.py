
import hashlib
import secrets

from cryptography.fernet import Fernet
from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.agent_registry import AgentRegistry
from app.models.agent_model import Agent
from app.config import settings


class AgentService:

    def __init__(self):
        self.registry = AgentRegistry()

    @staticmethod
    def _encrypt_api_key(api_key: str) -> str:
        encryption_key = settings.AGESHIELD_ENCRYPTION_KEY

        if not encryption_key:
            raise RuntimeError(
                "AGESHIELD_ENCRYPTION_KEY is missing from .env"
            )

        try:
            cipher = Fernet(encryption_key.encode("utf-8"))
            return cipher.encrypt(
                api_key.encode("utf-8")
            ).decode("utf-8")
        except Exception as exc:
            raise RuntimeError(
                "Invalid AGESHIELD_ENCRYPTION_KEY"
            ) from exc

    @staticmethod
    def decrypt_api_key(encrypted_api_key: str) -> str:
        encryption_key = settings.AGESHIELD_ENCRYPTION_KEY

        if not encryption_key:
            raise RuntimeError(
                "AGESHIELD_ENCRYPTION_KEY is missing from .env"
            )

        try:
            cipher = Fernet(encryption_key.encode("utf-8"))
            return cipher.decrypt(
                encrypted_api_key.encode("utf-8")
            ).decode("utf-8")
        except Exception as exc:
            raise RuntimeError(
                "Unable to decrypt API key"
            ) from exc

    async def create_agent(
        self,
        db: AsyncSession,
        company_id: int,
        name: str,
        description: str = "",
    ) -> tuple[Agent, str]:

        if not name.strip():
            raise ValueError("Agent name cannot be empty")

        # Generate the API key
        api_key = "ags_" + secrets.token_urlsafe(32)

        # Store a hash for authentication
        api_key_hash = hashlib.sha256(
            api_key.encode("utf-8")
        ).hexdigest()

        # Store an encrypted copy for authorized retrieval
        api_key_encrypted = self._encrypt_api_key(api_key)

        # Register the agent
        agent = await self.registry.register(
            db=db,
            company_id=company_id,
            name=name.strip(),
            description=description.strip(),
            api_key_hash=api_key_hash,
            api_key_encrypted=api_key_encrypted,
        )

        # Return the raw key for the registration response
        return agent, api_key

    async def get_agent(
        self,
        db: AsyncSession,
        company_id: int,
        agent_id: int,
    ):
        return await self.registry.get(db, company_id, agent_id)

    async def list_agents(
        self,
        db: AsyncSession,
        company_id: int,
    ):
        return await self.registry.list(db, company_id)

    async def deactivate_agent(
        self,
        db: AsyncSession,
        company_id: int,
        agent_id: int,
    ):
        return await self.registry.deactivate(
            db, company_id, agent_id
        )

    async def delete_agent(
        self,
        db: AsyncSession,
        company_id: int,
        agent_id: int,
    ):
        return await self.registry.delete(
            db, company_id, agent_id
        )


agent_service = AgentService()

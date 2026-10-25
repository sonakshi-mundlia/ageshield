
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import models before init_db so SQLAlchemy registers their tables.
from app.models.tool_grant_model import ToolGrant  # noqa: F401

from app.database.init_db import init_db

from app.api.auth_routes import router as auth_router
from app.api.agent_routes import router as agent_router
from app.api.tool_routes import router as tool_router
from app.api.policy_routes import router as policy_router
from app.api.approval_routes import router as approval_router
from app.api.security_routes import router as security_router
from app.api.audit_routes import router as audit_router
from app.api.configuration_routes import router as configuration_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title="AgeShield",
    description="AI Agent Security and Governance Platform",
    version="1.0.0",
    lifespan=lifespan,
)


# ---------------------------------------------------------
# CORS
# ---------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------
# API ROUTES
# ---------------------------------------------------------

app.include_router(auth_router, prefix="/api")
app.include_router(agent_router, prefix="/api")
app.include_router(tool_router, prefix="/api")
app.include_router(policy_router, prefix="/api")
app.include_router(approval_router, prefix="/api")
app.include_router(security_router, prefix="/api")
app.include_router(audit_router, prefix="/api")
app.include_router(configuration_router, prefix="/api")


# ---------------------------------------------------------
# BASIC ROUTES
# ---------------------------------------------------------

@app.get("/")
async def root():
    return {
        "name": "AgeShield",
        "message": "AgeShield API is running",
        "version": "1.0.0",
    }


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "AgeShield",
    }

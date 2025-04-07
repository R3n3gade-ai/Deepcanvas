from fastapi import APIRouter

# Import routers from submodules
from .workflows import router as workflows_router
from .api_connections import router as connections_router

# Create main API router
api_router = APIRouter(prefix="/api")

# Include sub-routers
api_router.include_router(workflows_router)
api_router.include_router(connections_router)

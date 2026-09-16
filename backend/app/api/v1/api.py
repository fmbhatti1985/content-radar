from fastapi import APIRouter
from app.api.v1.endpoints import scans, dashboard, content, creators, opportunities, saved, history, integrations

api_router = APIRouter()
api_router.include_router(scans.router, prefix="/scans", tags=["scans"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(content.router, prefix="/content", tags=["content"])
api_router.include_router(creators.router, prefix="/creators", tags=["creators"])
api_router.include_router(opportunities.router, prefix="/opportunities", tags=["opportunities"])
api_router.include_router(saved.router, prefix="/saved", tags=["saved"])
api_router.include_router(history.router, prefix="/history", tags=["history"])
api_router.include_router(integrations.router, prefix="/integrations", tags=["integrations"])





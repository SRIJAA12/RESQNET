from fastapi import APIRouter
from app.api.v1.endpoints import (
    events,
    incidents,
    resources,
    shelters,
    assignments,
    dashboard,
    inventory,
    audit
)

api_router = APIRouter()

api_router.include_router(events.router)
api_router.include_router(incidents.router)
api_router.include_router(resources.router)
api_router.include_router(shelters.router)
api_router.include_router(assignments.router)
api_router.include_router(dashboard.router)
api_router.include_router(inventory.router)
api_router.include_router(audit.router)

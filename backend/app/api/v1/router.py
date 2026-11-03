from fastapi import APIRouter
from app.api.v1.endpoints import (
    events,
    incidents,
    public_incidents,
    resources,
    shelters,
    assignments,
    dashboard,
    inventory,
    audit,
)

api_router = APIRouter()

# Public (no-auth) citizen SOS endpoints — must be registered before /incidents
# to avoid route conflicts on /incidents vs /public/incidents
api_router.include_router(public_incidents.router)
api_router.include_router(incidents.router)
api_router.include_router(events.router)
api_router.include_router(resources.router)
api_router.include_router(shelters.router)
api_router.include_router(assignments.router)
api_router.include_router(dashboard.router)
api_router.include_router(inventory.router)
api_router.include_router(audit.router)

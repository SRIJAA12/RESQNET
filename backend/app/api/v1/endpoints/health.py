from datetime import datetime, timezone
from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db.session import get_db
from app.core.config import settings

router = APIRouter()


@router.get("/health", tags=["Health"])
def get_health(db: Session = Depends(get_db)):
    """
    Health check endpoint reporting application status and database connectivity separately.
    Does not expose sensitive credentials, connection strings or internal topology.
    """
    db_healthy = False
    db_message = "connected"

    try:
        # Simple ping query
        db.execute(text("SELECT 1"))
        db_healthy = True
    except Exception as e:
        db_healthy = False
        db_message = "database_unreachable"

    overall_healthy = db_healthy
    response_data = {
        "status": "healthy" if overall_healthy else "degraded",
        "app_name": settings.APP_NAME,
        "version": settings.PROJECT_VERSION,
        "environment": settings.ENVIRONMENT,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "components": {
            "application": "healthy",
            "database": "healthy" if db_healthy else db_message,
        }
    }

    status_code = status.HTTP_200_OK if overall_healthy else status.HTTP_503_SERVICE_UNAVAILABLE
    return JSONResponse(content=response_data, status_code=status_code)

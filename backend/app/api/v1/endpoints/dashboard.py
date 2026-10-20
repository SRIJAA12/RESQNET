from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.dashboard import DashboardSummary
from app.schemas.common import APIResponse
from app.services.dashboard_service import DashboardService

router = APIRouter(prefix="/dashboard", tags=["Control Room Dashboard"])


@router.get("/summary", response_model=APIResponse[DashboardSummary])
def get_dashboard_summary(db: Session = Depends(get_db)):
    """
    Get aggregated operational summary for control room dispatchers.
    Includes active incidents, fleet status, shelter capacity, and unserved bottlenecks.
    """
    service = DashboardService(db)
    summary = service.get_summary()
    return APIResponse(
        success=True,
        data=summary
    )

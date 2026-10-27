from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field


class AuditEventCreate(BaseModel):
    entity_type: str = Field(..., max_length=100)
    entity_id: str = Field(..., max_length=36)
    action: str = Field(..., max_length=100)
    performed_by: Optional[str] = None
    changes_json: Optional[str] = None
    ip_address: Optional[str] = None


class AuditEventResponse(BaseModel):
    id: str
    entity_type: str
    entity_id: str
    action: str
    performed_by: str
    changes_json: Optional[str] = None
    ip_address: Optional[str] = None
    timestamp: datetime

    class Config:
        from_attributes = True

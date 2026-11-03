"""
Pydantic schemas for the public citizen SOS endpoints (no auth required).
These are deliberately sanitized — PII fields are excluded from tracking responses.
"""
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict, field_validator
from typing import Any


class PublicIncidentCreate(BaseModel):
    """
    Validated incoming payload for a citizen emergency SOS submission.
    Mirrors the frontend CitizenSosPage form schema exactly.
    """
    reporter_name: str = Field(..., min_length=2, max_length=255)
    reporter_contact: str = Field(..., min_length=5, max_length=100)
    reporter_is_victim: bool = Field(default=True)

    disaster_type: str = Field(default="flood", min_length=2, max_length=50)
    people_count: int = Field(default=1, ge=1, le=500)
    trapped_count: int = Field(default=0, ge=0, le=500)
    medical_assistance_needed: bool = Field(default=False)
    special_needs_description: Optional[str] = Field(default=None, max_length=1000)
    description: str = Field(..., min_length=10, max_length=3000)

    address_text: str = Field(..., min_length=5, max_length=500)
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    event_id: Optional[str] = Field(default=None, max_length=50)

    model_config = ConfigDict(extra="forbid")

    @field_validator("reporter_name", "reporter_contact", "address_text", "description", "disaster_type", mode="before")
    @classmethod
    def strip_strings(cls, v: Any) -> Any:
        if isinstance(v, str):
            return v.strip()
        return v


class PublicIncidentCreationResponse(BaseModel):
    """
    Minimal confirmation returned to the citizen on successful SOS submission.
    Matches the SosSubmissionResponse interface in frontend/src/services/sosApi.ts.
    """
    reference_code: str
    incident_id: str
    status: str
    priority: str
    created_at: str
    tracking_url: str
    message: str = "Emergency request submitted successfully. Responders will verify details."


class SanitizedIncidentMilestone(BaseModel):
    """
    Public-safe status lifecycle milestone. No internal dispatcher notes or IDs.
    """
    status: str
    timestamp: str
    notes: Optional[str] = None


class SanitizedIncidentTrackingResponse(BaseModel):
    """
    Sanitized public tracking payload.
    Deliberately excludes: reporter_name, reporter_contact, latitude, longitude,
    ai_triage_score, ai_recommendation_notes, dispatcher IDs.
    Matches the SosTrackingResponse interface in frontend/src/services/sosApi.ts.
    """
    reference_code: str
    status: str
    priority: str
    created_at: str
    updated_at: str
    disaster_type: str
    people_count: int
    trapped_count: int
    medical_assistance_needed: bool
    special_needs_description: Optional[str] = None
    description: str
    address_text: str
    status_history: List[SanitizedIncidentMilestone] = []

    model_config = ConfigDict(from_attributes=True)


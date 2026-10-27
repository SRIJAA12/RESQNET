"""
Pydantic schemas for public citizen incident ingestion and tracking.
"""
from typing import Optional, List, Any
from pydantic import BaseModel, Field, ConfigDict, field_validator


class PublicIncidentCreate(BaseModel):
    """
    Validated incoming payload for citizen emergency SOS request.
    Strictly aligns with the frontend RequestAssistancePage and CitizenSosPage.
    """
    reporter_name: str = Field(..., min_length=2, max_length=255, description="Full name of reporter")
    reporter_contact: str = Field(..., min_length=5, max_length=100, description="Phone number or contact method")
    reporter_is_victim: bool = Field(default=True, description="Whether the reporter is directly affected")

    disaster_type: str = Field(default="flood", min_length=2, max_length=50, description="Disaster category")
    people_count: int = Field(default=1, ge=1, le=500, description="Positive count of people needing assistance")
    trapped_count: int = Field(default=0, ge=0, le=500, description="Number of individuals trapped")
    medical_assistance_needed: bool = Field(default=False, description="Whether acute medical assistance is needed")
    special_needs_description: Optional[str] = Field(default=None, max_length=1000, description="Special requirements")
    description: str = Field(..., min_length=10, max_length=3000, description="Description of hazard and situation")

    address_text: str = Field(..., min_length=5, max_length=500, description="Physical location or landmark")
    latitude: float = Field(..., ge=-90.0, le=90.0, description="WGS84 Latitude")
    longitude: float = Field(..., ge=-180.0, le=180.0, description="WGS84 Longitude")
    event_id: Optional[str] = Field(default=None, max_length=50, description="Optional disaster event identifier")

    model_config = ConfigDict(extra="forbid")

    @field_validator("reporter_name", "reporter_contact", "address_text", "description", "disaster_type", mode="before")
    @classmethod
    def strip_and_validate_strings(cls, v: Any, info) -> Any:
        if isinstance(v, str):
            v_stripped = v.strip()
            min_lengths = {
                "reporter_name": 2,
                "reporter_contact": 5,
                "address_text": 5,
                "description": 10,
                "disaster_type": 2,
            }
            required_min = min_lengths.get(info.field_name, 1)
            if len(v_stripped) < required_min:
                raise ValueError(
                    f"'{info.field_name}' must contain at least {required_min} non-whitespace characters"
                )
            return v_stripped
        return v


class PublicIncidentCreationResponse(BaseModel):
    """
    Minimal confirmation returned immediately to the citizen upon successful submission.
    """
    reference_code: str = Field(..., description="Public tracking reference code (e.g. SOS-2026-FLOOD-8492)")
    incident_id: str = Field(..., description="Collision-resistant internal incident ID")
    status: str = Field(..., description="Initial unverified/pending-review status")
    priority: str = Field(..., description="Initial triage priority")
    created_at: str = Field(..., description="ISO 8601 UTC creation timestamp")
    tracking_url: str = Field(..., description="Public endpoint to track status")
    message: str = Field(default="Emergency request submitted successfully. Responders will verify details.")


class SanitizedIncidentMilestone(BaseModel):
    """
    Safe lifecycle milestone visible to public tracking.
    """
    status: str
    timestamp: str
    notes: Optional[str] = None


class SanitizedIncidentTrackingResponse(BaseModel):
    """
    Deliberately sanitized public tracking response.
    Explicitly omits reporter contact details, internal notes, dispatcher IDs, and raw DynamoDB keys.
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

    model_config = ConfigDict(extra="ignore")

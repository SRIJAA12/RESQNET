from typing import Generic, TypeVar, List, Optional, Any
from pydantic import BaseModel, Field

T = TypeVar("T")


class GeoCoordinates(BaseModel):
    latitude: float = Field(..., ge=-90.0, le=90.0, description="Latitude in decimal degrees")
    longitude: float = Field(..., ge=-180.0, le=180.0, description="Longitude in decimal degrees")


class PaginationMeta(BaseModel):
    total_count: int
    page: int
    page_size: int
    total_pages: int


class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    pagination: PaginationMeta


class APIResponse(BaseModel, Generic[T]):
    success: bool = True
    message: Optional[str] = None
    data: T


class ErrorDetail(BaseModel):
    code: str
    message: str
    field: Optional[str] = None


class ErrorResponse(BaseModel):
    success: bool = False
    error: ErrorDetail
    request_id: Optional[str] = None

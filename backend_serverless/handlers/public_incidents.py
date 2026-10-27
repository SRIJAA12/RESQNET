"""
Lambda handler for public citizen incident ingestion and status tracking.
Processes API Gateway HTTP API (v2) events with least privilege and robust sanitization.
"""
import base64
import json
import logging
import re
from typing import Any, Dict, Optional
from pydantic import ValidationError

from schemas.incident import PublicIncidentCreate
from services.incident_service import (
    create_citizen_incident,
    get_sanitized_incident_tracking,
)
from repository.dynamo_repo import (
    DuplicateIncidentError,
    StorageError,
    get_incident_repository,
    IncidentRepository,
)
from utils.response import build_response, build_error

# Configure logger: DO NOT log request bodies, contact numbers, or citizen names
logger = logging.getLogger()
logger.setLevel(logging.INFO)

ALLOWED_ORIGINS = {
    "http://localhost:5173",
    "http://localhost:5174",
}


def _resolve_cors_origin(headers: Dict[str, Any]) -> str:
    """Returns the matching CORS origin if allowed, otherwise standard fallback."""
    # Headers in HTTP API v2 are typically lowercased
    origin = headers.get("origin") or headers.get("Origin") or ""
    if origin in ALLOWED_ORIGINS:
        return origin
    return "http://localhost:5173"


def _parse_body(event: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Safely extracts and parses JSON body from the HTTP API v2 event."""
    body_raw = event.get("body")
    if body_raw is None:
        return None

    if event.get("isBase64Encoded", False):
        try:
            body_raw = base64.b64decode(body_raw).decode("utf-8")
        except Exception:
            raise ValueError("Invalid base64 encoding in request body")

    if isinstance(body_raw, dict):
        return body_raw

    if not isinstance(body_raw, str) or not body_raw.strip():
        return None

    try:
        return json.loads(body_raw)
    except json.JSONDecodeError as e:
        raise ValueError(f"Malformed JSON: {e.msg}") from e


def _extract_reference_code(event: Dict[str, Any]) -> Optional[str]:
    """Extracts referenceCode from pathParameters or from rawPath regex."""
    path_params = event.get("pathParameters") or {}
    if "referenceCode" in path_params:
        return path_params["referenceCode"]

    # Fallback parsing from rawPath / path
    raw_path = event.get("rawPath") or event.get("path") or ""
    match = re.search(r"/public/incidents/ref/([^/?#]+)", raw_path)
    if match:
        return match.group(1)

    return None


def handle_create_incident(
    event: Dict[str, Any],
    repo: IncidentRepository,
    allow_origin: str,
) -> Dict[str, Any]:
    """Handles POST /v1/public/incidents."""
    try:
        body_dict = _parse_body(event)
    except ValueError as e:
        logger.warning("Rejecting invalid request body format")
        return build_error(
            status_code=400,
            error_code="MALFORMED_JSON",
            message=str(e),
            allow_origin=allow_origin,
        )

    if not body_dict:
        return build_error(
            status_code=400,
            error_code="EMPTY_PAYLOAD",
            message="Request body cannot be empty",
            allow_origin=allow_origin,
        )

    try:
        validated_payload = PublicIncidentCreate.model_validate(body_dict)
    except ValidationError as err:
        logger.info("Validation failure on public incident submission: %d error(s)", len(err.errors()))
        error_details = []
        for e in err.errors():
            loc = ".".join(str(p) for p in e.get("loc", []))
            error_details.append({"field": loc, "issue": e.get("msg")})
        return build_error(
            status_code=400,
            error_code="VALIDATION_FAILED",
            message="Provided incident data does not meet schema requirements",
            details=error_details,
            allow_origin=allow_origin,
        )

    try:
        response_model = create_citizen_incident(validated_payload, repo)
        logger.info("Created public incident with ref: %s", response_model.reference_code)
        return build_response(
            status_code=201,
            body=response_model.model_dump(),
            allow_origin=allow_origin,
        )
    except DuplicateIncidentError as e:
        logger.warning("Collision detected during incident creation: %s", str(e))
        return build_error(
            status_code=409,
            error_code="DUPLICATE_INCIDENT",
            message="An incident with this reference or key already exists",
            allow_origin=allow_origin,
        )
    except StorageError as e:
        logger.error("Storage persistence error: %s", str(e))
        return build_error(
            status_code=500,
            error_code="PERSISTENCE_FAILED",
            message="Unable to securely save emergency report. Please retry or contact dispatch.",
            allow_origin=allow_origin,
        )
    except Exception as e:
        logger.error("Unexpected error during incident creation: %s", str(e))
        return build_error(
            status_code=500,
            error_code="INTERNAL_SERVER_ERROR",
            message="An unexpected error occurred while processing the request",
            allow_origin=allow_origin,
        )


def handle_get_incident_by_ref(
    event: Dict[str, Any],
    repo: IncidentRepository,
    allow_origin: str,
) -> Dict[str, Any]:
    """Handles GET /v1/public/incidents/ref/{referenceCode}."""
    ref_code = _extract_reference_code(event)
    if not ref_code or not ref_code.strip():
        return build_error(
            status_code=400,
            error_code="MISSING_REFERENCE_CODE",
            message="Reference code must be provided in URL path",
            allow_origin=allow_origin,
        )

    clean_ref = ref_code.strip()
    try:
        sanitized = get_sanitized_incident_tracking(clean_ref, repo)
        if not sanitized:
            return build_error(
                status_code=404,
                error_code="INCIDENT_NOT_FOUND",
                message=f"Incident with reference '{clean_ref}' not found. "
                        "If you recently submitted this request, index updates may take a few moments to propagate.",
                details={
                    "reference_code": clean_ref,
                    "propagation_hint": "GSI updates are asynchronous. Please verify reference or retry after a moment.",
                },
                allow_origin=allow_origin,
            )

        return build_response(
            status_code=200,
            body=sanitized.model_dump(),
            allow_origin=allow_origin,
        )
    except StorageError as e:
        logger.error("Storage lookup error for reference '%s': %s", clean_ref, str(e))
        return build_error(
            status_code=500,
            error_code="STORAGE_QUERY_FAILED",
            message="Unable to retrieve incident status due to a temporary storage error",
            allow_origin=allow_origin,
        )
    except Exception as e:
        logger.error("Unexpected error retrieving reference '%s': %s", clean_ref, str(e))
        return build_error(
            status_code=500,
            error_code="INTERNAL_SERVER_ERROR",
            message="An unexpected error occurred while retrieving incident",
            allow_origin=allow_origin,
        )


def lambda_handler(
    event: Dict[str, Any],
    context: Any = None,
    repo: Optional[IncidentRepository] = None,
) -> Dict[str, Any]:
    """
    Main Lambda entry point for API Gateway HTTP API v2 requests.
    Supports dependency injection for testing.
    """
    headers = event.get("headers") or {}
    allow_origin = _resolve_cors_origin(headers)

    # Determine HTTP Method
    request_context = event.get("requestContext") or {}
    http_ctx = request_context.get("http") or {}
    http_method = (http_ctx.get("method") or event.get("httpMethod") or "").upper()

    # Route Key or Clean Path
    raw_path = event.get("rawPath") or event.get("path") or ""
    clean_path = raw_path.rstrip("/")
    route_key = event.get("routeKey") or ""

    # Handle CORS Preflight
    if http_method == "OPTIONS":
        return build_response(status_code=200, body={"status": "ok"}, allow_origin=allow_origin)

    active_repo = repo or get_incident_repository()

    # Route matching for POST incident
    is_post_incident = (
        (http_method == "POST" and clean_path in ("/v1/public/incidents", "/public/incidents")) or
        route_key in ("POST /v1/public/incidents", "POST /public/incidents")
    )
    if is_post_incident:
        return handle_create_incident(event, active_repo, allow_origin)

    # Check for empty reference path: GET /v1/public/incidents/ref or /ref/
    if clean_path in ("/v1/public/incidents/ref", "/public/incidents/ref"):
        return build_error(
            status_code=400,
            error_code="MISSING_REFERENCE_CODE",
            message="Reference code must be provided in URL path",
            allow_origin=allow_origin,
        )

    # Route matching for GET incident by reference
    ref_match = re.match(r"^(?:/v1)?/public/incidents/ref/([^/?#]+)$", clean_path)
    is_get_by_ref = (
        (http_method == "GET" and (ref_match is not None or "referenceCode" in (event.get("pathParameters") or {}))) or
        route_key.startswith("GET /v1/public/incidents/ref/") or
        route_key.startswith("GET /public/incidents/ref/")
    )
    if is_get_by_ref:
        return handle_get_incident_by_ref(event, active_repo, allow_origin)

    return build_error(
        status_code=404,
        error_code="ROUTE_NOT_FOUND",
        message=f"No matching route for {http_method} {raw_path}",
        allow_origin=allow_origin,
    )

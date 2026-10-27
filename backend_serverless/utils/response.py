"""
HTTP API Gateway (v2) response helpers and JSON serialization utilities.
"""
import json
from decimal import Decimal
from datetime import datetime, date
from typing import Any, Dict, Optional


def decimal_serializer(obj: Any) -> Any:
    """JSON serializer for objects not serializable by default json code."""
    if isinstance(obj, Decimal):
        # Convert Decimals to int if integral, else float
        if obj % 1 == 0:
            return int(obj)
        return float(obj)
    if isinstance(obj, (datetime, date)):
        return obj.isoformat()
    raise TypeError(f"Type {type(obj)} not serializable")


def build_response(
    status_code: int,
    body: Any,
    headers: Optional[Dict[str, str]] = None,
    allow_origin: str = "*"
) -> Dict[str, Any]:
    """
    Constructs an API Gateway HTTP API v2 compatible response dict.
    Includes standard CORS and security headers.
    """
    default_headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": allow_origin,
        "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Request-ID",
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
        "X-Content-Type-Options": "nosniff",
    }
    if headers:
        default_headers.update(headers)

    body_str = json.dumps(body, default=decimal_serializer) if not isinstance(body, str) else body

    return {
        "statusCode": status_code,
        "headers": default_headers,
        "body": body_str,
    }


def build_error(
    status_code: int,
    error_code: str,
    message: str,
    details: Optional[Any] = None,
    allow_origin: str = "*"
) -> Dict[str, Any]:
    """
    Constructs a structured, safe error response avoiding sensitive trace leakages.
    """
    payload: Dict[str, Any] = {
        "error": {
            "code": error_code,
            "message": message,
        }
    }
    if details is not None:
        payload["error"]["details"] = details

    return build_response(status_code=status_code, body=payload, allow_origin=allow_origin)

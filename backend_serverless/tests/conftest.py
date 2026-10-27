"""
Pytest configuration and fixtures for backend_serverless tests.
Guarantees zero network calls and no AWS credential requirements.
"""
import os
import sys
import json
from typing import Dict, Any, Optional
import pytest

# Ensure repository root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

# Dummy AWS credentials for offline testing
os.environ["AWS_ACCESS_KEY_ID"] = "testing"
os.environ["AWS_SECRET_ACCESS_KEY"] = "testing"
os.environ["AWS_SECURITY_TOKEN"] = "testing"
os.environ["AWS_SESSION_TOKEN"] = "testing"
os.environ["AWS_DEFAULT_REGION"] = "us-east-1"
os.environ["TABLE_NAME"] = "resqnet-core-table"
os.environ["ENVIRONMENT"] = "test"

from backend_serverless.repository.dynamo_repo import InMemoryIncidentRepository, set_incident_repository


@pytest.fixture
def in_memory_repo():
    """Provides a fresh, isolated in-memory repository for each test."""
    repo = InMemoryIncidentRepository()
    set_incident_repository(repo)
    return repo


@pytest.fixture
def make_api_v2_event():
    """Factory helper to generate API Gateway HTTP API v2 event payloads."""
    def _create_event(
        method: str,
        path: str,
        body: Optional[Any] = None,
        path_parameters: Optional[Dict[str, str]] = None,
        headers: Optional[Dict[str, str]] = None,
        is_base64_encoded: bool = False,
    ) -> Dict[str, Any]:
        default_headers = {
            "content-type": "application/json",
            "origin": "http://localhost:5173",
        }
        if headers:
            default_headers.update(headers)

        body_str = None
        if body is not None:
            if isinstance(body, str):
                body_str = body
            else:
                body_str = json.dumps(body)

        return {
            "version": "2.0",
            "routeKey": f"{method.upper()} {path}",
            "rawPath": path,
            "rawQueryString": "",
            "headers": default_headers,
            "requestContext": {
                "http": {
                    "method": method.upper(),
                    "path": path,
                    "protocol": "HTTP/1.1",
                    "sourceIp": "127.0.0.1",
                    "userAgent": "pytest-client/1.0",
                },
                "stage": "v1",
            },
            "pathParameters": path_parameters or {},
            "body": body_str,
            "isBase64Encoded": is_base64_encoded,
        }
    return _create_event

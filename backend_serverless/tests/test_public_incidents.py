"""
Comprehensive automated tests for RESQNET Serverless Citizen SOS Pipeline.
Covers all 10 minimum specification requirements, data sanitization,
CORS security, error conditions, and conditional write uniqueness.
"""
import json
import socket
from typing import Optional
import pytest
from backend_serverless.handlers.public_incidents import lambda_handler
from backend_serverless.repository.dynamo_repo import (
    InMemoryIncidentRepository,
    DynamoDBIncidentRepository,
)
from backend_serverless.services.incident_service import create_citizen_incident
from backend_serverless.schemas.incident import PublicIncidentCreate


def get_sample_valid_payload():
    return {
        "reporter_name": "Sunita Sharma",
        "reporter_contact": "+91-98765-43210",
        "reporter_is_victim": True,
        "disaster_type": "flood",
        "people_count": 3,
        "trapped_count": 1,
        "medical_assistance_needed": True,
        "special_needs_description": "Elderly patient needing oxygen cylinder",
        "description": "Flood water is 1.5m deep and rising rapidly into residential ground floor",
        "address_text": "Plot 42, River Creek Colony, Sector B",
        "latitude": 28.5710,
        "longitude": 77.2390,
        "event_id": "event-delhi-flood-2026",
    }


# ── Requirement 1: Valid submission persists incident and returns reference code ──
def test_valid_incident_submission_persists_and_returns_reference(in_memory_repo, make_api_v2_event):
    payload = get_sample_valid_payload()
    event = make_api_v2_event("POST", "/v1/public/incidents", body=payload)

    response = lambda_handler(event, None, repo=in_memory_repo)

    assert response["statusCode"] == 201
    body = json.loads(response["body"])

    assert "reference_code" in body
    assert body["reference_code"].startswith("SOS-")
    assert "FLOOD" in body["reference_code"]
    assert body["status"] == "submitted"
    assert body["priority"] == "critical"  # Medical assistance + trapped count
    assert "incident_id" in body
    assert "created_at" in body
    assert body["tracking_url"] == f"/v1/public/incidents/ref/{body['reference_code']}"

    # Verify persistence in repository
    persisted = in_memory_repo.get_by_reference(body["reference_code"])
    assert persisted is not None
    assert persisted["PK"] == f"INC#{body['incident_id']}"
    assert persisted["SK"] == "METADATA"
    assert persisted["GSI1_PK"] == "STATUS#submitted"
    assert persisted["GSI2_PK"] == f"REF#{body['reference_code']}"
    assert persisted["GSI2_SK"] == "METADATA"
    assert persisted["people_count"] == 3


# ── Requirement 2: Missing or invalid headcount is rejected ─────────────────
@pytest.mark.parametrize("invalid_people_count", [0, -1, -50, 501, 1000, "three"])
def test_missing_or_invalid_headcount_rejected(in_memory_repo, make_api_v2_event, invalid_people_count):
    payload = get_sample_valid_payload()
    payload["people_count"] = invalid_people_count
    event = make_api_v2_event("POST", "/v1/public/incidents", body=payload)

    response = lambda_handler(event, None, repo=in_memory_repo)

    assert response["statusCode"] == 400
    body = json.loads(response["body"])
    assert body["error"]["code"] == "VALIDATION_FAILED"
    # Ensure no incident was stored
    assert len(in_memory_repo._items) == 0


# ── Requirement 3: Invalid coordinates are rejected ──────────────────────────
@pytest.mark.parametrize(
    "lat,lon",
    [
        (91.0, 77.23),       # Lat > 90
        (-90.1, 77.23),      # Lat < -90
        (28.57, 180.1),      # Lon > 180
        (28.57, -181.0),     # Lon < -180
        ("invalid", 77.23),  # Non-float
    ],
)
def test_invalid_coordinates_rejected(in_memory_repo, make_api_v2_event, lat, lon):
    payload = get_sample_valid_payload()
    payload["latitude"] = lat
    payload["longitude"] = lon
    event = make_api_v2_event("POST", "/v1/public/incidents", body=payload)

    response = lambda_handler(event, None, repo=in_memory_repo)

    assert response["statusCode"] == 400
    body = json.loads(response["body"])
    assert body["error"]["code"] == "VALIDATION_FAILED"
    assert len(in_memory_repo._items) == 0


# ── Requirement 4: Missing required assistance or location data is rejected ──
@pytest.mark.parametrize(
    "field,invalid_val",
    [
        ("address_text", ""),          # Missing/empty
        ("address_text", "Apt"),       # Too short (< 5 chars)
        ("description", ""),           # Missing/empty
        ("description", "Help!"),      # Too short (< 10 chars)
        ("reporter_name", "A"),        # Too short (< 2 chars)
        ("reporter_contact", "12"),    # Too short (< 5 chars)
    ],
)
def test_missing_required_fields_rejected(in_memory_repo, make_api_v2_event, field, invalid_val):
    payload = get_sample_valid_payload()
    payload[field] = invalid_val
    event = make_api_v2_event("POST", "/v1/public/incidents", body=payload)

    response = lambda_handler(event, None, repo=in_memory_repo)

    assert response["statusCode"] == 400
    body = json.loads(response["body"])
    assert body["error"]["code"] == "VALIDATION_FAILED"
    assert len(in_memory_repo._items) == 0


# ── Requirement 5: Duplicate identifier/reference cannot overwrite existing item ──
def test_duplicate_identifier_cannot_overwrite_existing_item(in_memory_repo, make_api_v2_event):
    payload_1 = get_sample_valid_payload()
    schema_payload = PublicIncidentCreate.model_validate(payload_1)

    # Force identical incident_id and reference_code
    fixed_inc_id = "inc-duplicate-test-001"
    fixed_ref_code = "SOS-2026-FLOOD-COLLISION"

    # First write succeeds
    create_citizen_incident(
        schema_payload,
        in_memory_repo,
        incident_id=fixed_inc_id,
        reference_code=fixed_ref_code,
    )
    assert in_memory_repo.get_by_reference(fixed_ref_code)["people_count"] == 3

    # Attempt second write with modified data but colliding ID/reference
    payload_2 = get_sample_valid_payload()
    payload_2["people_count"] = 99  # attacker attempt to overwrite

    # Test through service/handler with colliding ID
    from backend_serverless.repository.dynamo_repo import DuplicateIncidentError
    with pytest.raises(DuplicateIncidentError):
        create_citizen_incident(
            PublicIncidentCreate.model_validate(payload_2),
            in_memory_repo,
            incident_id=fixed_inc_id,
            reference_code=fixed_ref_code,
        )

    # Verify original record remained untampered
    unmodified = in_memory_repo.get_by_reference(fixed_ref_code)
    assert unmodified["people_count"] == 3


# ── Requirement 6: Tracking known reference returns sanitized response ───────
def test_tracking_known_reference_returns_sanitized_response(in_memory_repo, make_api_v2_event):
    # Create incident first
    post_event = make_api_v2_event("POST", "/v1/public/incidents", body=get_sample_valid_payload())
    post_res = lambda_handler(post_event, None, repo=in_memory_repo)
    ref_code = json.loads(post_res["body"])["reference_code"]

    # Query status
    get_event = make_api_v2_event(
        "GET",
        f"/v1/public/incidents/ref/{ref_code}",
        path_parameters={"referenceCode": ref_code},
    )
    get_res = lambda_handler(get_event, None, repo=in_memory_repo)

    assert get_res["statusCode"] == 200
    body = json.loads(get_res["body"])

    assert body["reference_code"] == ref_code
    assert body["status"] == "submitted"
    assert body["priority"] == "critical"
    assert body["people_count"] == 3
    assert body["trapped_count"] == 1
    assert body["medical_assistance_needed"] is True
    assert body["address_text"] == "Plot 42, River Creek Colony, Sector B"
    assert len(body["status_history"]) >= 1
    assert body["status_history"][0]["status"] == "submitted"


# ── Requirement 7: Tracking unknown reference returns not-found response ────
def test_tracking_unknown_reference_returns_not_found(in_memory_repo, make_api_v2_event):
    unknown_ref = "SOS-2026-FLOOD-9999"
    get_event = make_api_v2_event(
        "GET",
        f"/v1/public/incidents/ref/{unknown_ref}",
        path_parameters={"referenceCode": unknown_ref},
    )
    get_res = lambda_handler(get_event, None, repo=in_memory_repo)

    assert get_res["statusCode"] == 404
    body = json.loads(get_res["body"])
    assert body["error"]["code"] == "INCIDENT_NOT_FOUND"
    assert unknown_ref in body["error"]["message"]


# ── Requirement 8: Private contact data is NEVER returned by public tracking ──
def test_private_contact_data_never_returned_by_public_tracking(in_memory_repo, make_api_v2_event):
    private_phone = "+1-555-TOP-SECRET"
    private_name = "Jane Private Citizen"

    payload = get_sample_valid_payload()
    payload["reporter_contact"] = private_phone
    payload["reporter_name"] = private_name

    post_event = make_api_v2_event("POST", "/v1/public/incidents", body=payload)
    post_res = lambda_handler(post_event, None, repo=in_memory_repo)
    ref_code = json.loads(post_res["body"])["reference_code"]

    get_event = make_api_v2_event(
        "GET",
        f"/v1/public/incidents/ref/{ref_code}",
        path_parameters={"referenceCode": ref_code},
    )
    get_res = lambda_handler(get_event, None, repo=in_memory_repo)

    assert get_res["statusCode"] == 200
    raw_body_str = get_res["body"]
    body = json.loads(raw_body_str)

    # 1. Contact number must NEVER appear in serialized response
    assert private_phone not in raw_body_str
    # 2. Reporter name must NEVER appear
    assert private_name not in raw_body_str
    # 3. Keys must not exist in schema
    assert "reporter_contact" not in body
    assert "reporter_name" not in body
    assert "reporter_is_victim" not in body
    # 4. Raw DynamoDB single-table keys must NOT leak
    assert "PK" not in body
    assert "SK" not in body
    assert "GSI1_PK" not in body
    assert "GSI1_SK" not in body
    assert "GSI2_PK" not in body
    assert "GSI2_SK" not in body


# ── Requirement 9: Storage failures return appropriate error without false success ──
def test_storage_failure_returns_500_without_false_success(make_api_v2_event):
    # Repository configured with simulated failure
    failing_repo = InMemoryIncidentRepository(simulate_storage_failure=True)

    event = make_api_v2_event("POST", "/v1/public/incidents", body=get_sample_valid_payload())
    response = lambda_handler(event, None, repo=failing_repo)

    assert response["statusCode"] == 500
    body = json.loads(response["body"])
    assert body["error"]["code"] == "PERSISTENCE_FAILED"
    # Ensure no success claimed
    assert "reference_code" not in body
    assert len(failing_repo._items) == 0


# ── Requirement 10: Malformed API Gateway event bodies handled safely ────────
@pytest.mark.parametrize(
    "malformed_body",
    [
        "this is not json { [",
        "{ unfinished json",
        "",
        "   ",
    ],
)
def test_malformed_event_bodies_handled_safely(in_memory_repo, make_api_v2_event, malformed_body):
    event = make_api_v2_event("POST", "/v1/public/incidents", body=malformed_body)
    response = lambda_handler(event, None, repo=in_memory_repo)

    assert response["statusCode"] == 400
    body = json.loads(response["body"])
    assert body["error"]["code"] in ["MALFORMED_JSON", "EMPTY_PAYLOAD"]


def test_null_event_body_handled_safely(in_memory_repo, make_api_v2_event):
    event = make_api_v2_event("POST", "/v1/public/incidents", body=None)
    response = lambda_handler(event, None, repo=in_memory_repo)

    assert response["statusCode"] == 400
    body = json.loads(response["body"])
    assert body["error"]["code"] == "EMPTY_PAYLOAD"


# ── Bonus: CORS Preflight and Header Verification ────────────────────────────
def test_cors_preflight_and_origin(in_memory_repo, make_api_v2_event):
    event = make_api_v2_event(
        "OPTIONS",
        "/v1/public/incidents",
        headers={"origin": "http://localhost:5174"},
    )
    response = lambda_handler(event, None, repo=in_memory_repo)

    assert response["statusCode"] == 200
    assert response["headers"]["Access-Control-Allow-Origin"] == "http://localhost:5174"
    assert "POST" in response["headers"]["Access-Control-Allow-Methods"]


# ── Requirement 11: Whitespace-only string fields rejected ────────────────────
@pytest.mark.parametrize(
    "field",
    ["reporter_name", "reporter_contact", "address_text", "description", "disaster_type"],
)
def test_whitespace_only_fields_rejected(in_memory_repo, make_api_v2_event, field):
    payload = get_sample_valid_payload()
    payload[field] = "     "  # 5 spaces
    event = make_api_v2_event("POST", "/v1/public/incidents", body=payload)
    response = lambda_handler(event, None, repo=in_memory_repo)

    assert response["statusCode"] == 400
    body = json.loads(response["body"])
    assert body["error"]["code"] == "VALIDATION_FAILED"


# ── Requirement 12: Boundary headcount validation (1, 500 valid; 0, 501 invalid) ──
@pytest.mark.parametrize("valid_count", [1, 500])
def test_boundary_headcount_valid(in_memory_repo, make_api_v2_event, valid_count):
    payload = get_sample_valid_payload()
    payload["people_count"] = valid_count
    event = make_api_v2_event("POST", "/v1/public/incidents", body=payload)
    response = lambda_handler(event, None, repo=in_memory_repo)

    assert response["statusCode"] == 201
    body = json.loads(response["body"])
    assert body["status"] == "submitted"


@pytest.mark.parametrize("invalid_count", [0, 501])
def test_boundary_headcount_invalid(in_memory_repo, make_api_v2_event, invalid_count):
    payload = get_sample_valid_payload()
    payload["people_count"] = invalid_count
    event = make_api_v2_event("POST", "/v1/public/incidents", body=payload)
    response = lambda_handler(event, None, repo=in_memory_repo)

    assert response["statusCode"] == 400
    body = json.loads(response["body"])
    assert body["error"]["code"] == "VALIDATION_FAILED"


# ── Requirement 13: Boundary coordinate validation (-90, 90, -180, 180) ──────
@pytest.mark.parametrize("lat,lon", [(-90.0, -180.0), (90.0, 180.0), (0.0, 0.0)])
def test_boundary_coordinates_valid(in_memory_repo, make_api_v2_event, lat, lon):
    payload = get_sample_valid_payload()
    payload["latitude"] = lat
    payload["longitude"] = lon
    event = make_api_v2_event("POST", "/v1/public/incidents", body=payload)
    response = lambda_handler(event, None, repo=in_memory_repo)

    assert response["statusCode"] == 201


@pytest.mark.parametrize(
    "lat,lon",
    [(-90.0001, 0.0), (90.0001, 0.0), (0.0, -180.0001), (0.0, 180.0001)],
)
def test_boundary_coordinates_invalid(in_memory_repo, make_api_v2_event, lat, lon):
    payload = get_sample_valid_payload()
    payload["latitude"] = lat
    payload["longitude"] = lon
    event = make_api_v2_event("POST", "/v1/public/incidents", body=payload)
    response = lambda_handler(event, None, repo=in_memory_repo)

    assert response["statusCode"] == 400
    body = json.loads(response["body"])
    assert body["error"]["code"] == "VALIDATION_FAILED"


# ── Requirement 14: Unexpected extra fields are rejected (extra="forbid") ─────
def test_unexpected_extra_fields_rejected(in_memory_repo, make_api_v2_event):
    payload = get_sample_valid_payload()
    payload["injected_field"] = "malicious_or_unknown"
    event = make_api_v2_event("POST", "/v1/public/incidents", body=payload)
    response = lambda_handler(event, None, repo=in_memory_repo)

    assert response["statusCode"] == 400
    body = json.loads(response["body"])
    assert body["error"]["code"] == "VALIDATION_FAILED"


# ── Requirement 15: Unsupported HTTP methods and unknown paths ───────────────
def test_unsupported_methods_and_unknown_paths(in_memory_repo, make_api_v2_event):
    # Method not supported on collection
    del_event = make_api_v2_event("DELETE", "/v1/public/incidents")
    del_res = lambda_handler(del_event, None, repo=in_memory_repo)
    assert del_res["statusCode"] == 404
    assert json.loads(del_res["body"])["error"]["code"] == "ROUTE_NOT_FOUND"

    # Unknown path
    unknown_event = make_api_v2_event("POST", "/v1/public/unknown")
    unknown_res = lambda_handler(unknown_event, None, repo=in_memory_repo)
    assert unknown_res["statusCode"] == 404

    # Missing reference code parameter in path: /v1/public/incidents/ref or /ref/
    missing_ref_event = make_api_v2_event("GET", "/v1/public/incidents/ref")
    missing_ref_res = lambda_handler(missing_ref_event, None, repo=in_memory_repo)
    assert missing_ref_res["statusCode"] == 400
    assert json.loads(missing_ref_res["body"])["error"]["code"] == "MISSING_REFERENCE_CODE"


# ── Requirement 16: GSI Eventual Consistency & Retry Handling ────────────────
def test_gsi_eventual_consistency_initial_miss_then_success(in_memory_repo, make_api_v2_event):
    # 1. Create incident
    post_event = make_api_v2_event("POST", "/v1/public/incidents", body=get_sample_valid_payload())
    post_res = lambda_handler(post_event, None, repo=in_memory_repo)
    ref_code = json.loads(post_res["body"])["reference_code"]

    # 2. Simulate 1 query GSI propagation lag
    in_memory_repo.simulate_gsi_lag(ref_code, lag_queries=1)

    # 3. GET request - bounded retry in service catches it on second attempt!
    get_event = make_api_v2_event(
        "GET",
        f"/v1/public/incidents/ref/{ref_code}",
        path_parameters={"referenceCode": ref_code},
    )
    get_res = lambda_handler(get_event, None, repo=in_memory_repo)

    assert get_res["statusCode"] == 200
    body = json.loads(get_res["body"])
    assert body["reference_code"] == ref_code


def test_gsi_eventual_consistency_retry_exhaustion(in_memory_repo, make_api_v2_event):
    # 1. Create incident
    post_event = make_api_v2_event("POST", "/v1/public/incidents", body=get_sample_valid_payload())
    post_res = lambda_handler(post_event, None, repo=in_memory_repo)
    ref_code = json.loads(post_res["body"])["reference_code"]

    # 2. Simulate lag greater than max retries (e.g. 5 misses)
    in_memory_repo.simulate_gsi_lag(ref_code, lag_queries=5)

    # 3. GET request exhausts bounded retries and returns clean 404 with propagation note
    get_event = make_api_v2_event(
        "GET",
        f"/v1/public/incidents/ref/{ref_code}",
        path_parameters={"referenceCode": ref_code},
    )
    get_res = lambda_handler(get_event, None, repo=in_memory_repo)

    assert get_res["statusCode"] == 404
    body = json.loads(get_res["body"])
    assert body["error"]["code"] == "INCIDENT_NOT_FOUND"
    assert "propagation_hint" in body["error"]["details"]


# ── Requirement 17: Real DynamoDB Local Integration Suite ───────────────────
def get_dynamodb_local_endpoint() -> Optional[str]:
    """Finds an active DynamoDB Local endpoint if available."""
    import os
    import boto3

    candidate_endpoints = [
        os.environ.get("DYNAMODB_ENDPOINT_URL"),
        "http://127.0.0.1:8002",
        "http://localhost:8002",
        "http://127.0.0.1:8000",
        "http://localhost:8000",
    ]
    for ep in candidate_endpoints:
        if not ep:
            continue
        try:
            client = boto3.client(
                "dynamodb",
                endpoint_url=ep,
                region_name="us-east-1",
                aws_access_key_id="dummy",
                aws_secret_access_key="dummy",
            )
            tables = client.list_tables().get("TableNames", [])
            if "resqnet-core-table" in tables:
                return ep
        except Exception:
            continue
    return None


def test_dynamodb_local_persistence_and_lifecycle(make_api_v2_event):
    """
    End-to-end integration test against a real running DynamoDB Local instance.
    Exercises real table writes, conditional expressions, GSI queries, and persistence.
    """
    endpoint = get_dynamodb_local_endpoint()
    if not endpoint:
        pytest.skip("DynamoDB Local is not active or resqnet-core-table is absent. Skipping real integration test.")

    real_repo = DynamoDBIncidentRepository(table_name="resqnet-core-table", endpoint_url=endpoint)

    # 1. Test Incident Creation
    payload = get_sample_valid_payload()
    post_event = make_api_v2_event("POST", "/v1/public/incidents", body=payload)
    post_res = lambda_handler(post_event, None, repo=real_repo)

    assert post_res["statusCode"] == 201
    post_body = json.loads(post_res["body"])
    ref_code = post_body["reference_code"]
    inc_id = post_body["incident_id"]

    # Verify directly in real DynamoDB Local via GetItem
    direct_item = real_repo.get_by_id(inc_id)
    assert direct_item is not None
    assert direct_item["PK"] == f"INC#{inc_id}"
    assert direct_item["SK"] == "METADATA"
    assert direct_item["GSI1_PK"] == "STATUS#submitted"
    assert direct_item["GSI2_PK"] == f"REF#{ref_code}"
    assert int(direct_item["people_count"]) == 3

    # 2. Test Incident Tracking Retrieval via GSI2 Query
    get_event = make_api_v2_event(
        "GET",
        f"/v1/public/incidents/ref/{ref_code}",
        path_parameters={"referenceCode": ref_code},
    )
    get_res = lambda_handler(get_event, None, repo=real_repo)

    assert get_res["statusCode"] == 200
    get_body = json.loads(get_res["body"])
    assert get_body["reference_code"] == ref_code
    assert get_body["status"] == "submitted"
    assert "reporter_contact" not in get_body
    assert "reporter_name" not in get_body
    assert "PK" not in get_body

    # 3. Test Duplicate Conditional Overwrite Prevention
    from backend_serverless.repository.dynamo_repo import DuplicateIncidentError
    from backend_serverless.services.incident_service import create_citizen_incident
    from backend_serverless.schemas.incident import PublicIncidentCreate

    with pytest.raises(DuplicateIncidentError):
        create_citizen_incident(
            PublicIncidentCreate.model_validate(payload),
            real_repo,
            incident_id=inc_id,
            reference_code=ref_code,
        )

    # 4. Test Unknown Reference Query on Real GSI2
    unknown_event = make_api_v2_event(
        "GET",
        "/v1/public/incidents/ref/SOS-2026-FLOOD-REALUNKNOWN",
        path_parameters={"referenceCode": "SOS-2026-FLOOD-REALUNKNOWN"},
    )
    unknown_res = lambda_handler(unknown_event, None, repo=real_repo)
    assert unknown_res["statusCode"] == 404

    # 5. Test Persistence Across Fresh Repository Instance (Process Restart Simulation)
    fresh_repo = DynamoDBIncidentRepository(table_name="resqnet-core-table", endpoint_url=endpoint)
    reloaded_item = fresh_repo.get_by_reference(ref_code)
    assert reloaded_item is not None
    assert reloaded_item["incident_id"] == inc_id

    # 6. Test Error Handling on Storage Failure
    bad_table_repo = DynamoDBIncidentRepository(table_name="non-existent-table-xyz", endpoint_url=endpoint)
    fail_event = make_api_v2_event("POST", "/v1/public/incidents", body=payload)
    fail_res = lambda_handler(fail_event, None, repo=bad_table_repo)
    assert fail_res["statusCode"] == 500
    assert json.loads(fail_res["body"])["error"]["code"] == "PERSISTENCE_FAILED"



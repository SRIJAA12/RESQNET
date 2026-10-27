# RESQNET — Local-First AWS Serverless Citizen SOS Pipeline (Phase 1)

This module implements the production-oriented serverless workflow for RESQNET citizen emergency incident ingestion and sanitized public tracking. It operates side-by-side with the existing FastAPI backend without disrupting existing database models, migrations, or frontend builds.

---

## 1. Verified Prerequisites & System Runtimes

The implementation has been verified with:
- **Python Runtime:** Python `3.11.9`
- **Pydantic:** `2.10.3`
- **Boto3:** `1.43.101`
- **Pytest:** `9.1.1`
- **AWS CLI:** `2.37.1`
- **Docker:** `29.6.1` (Docker Desktop / containerd)
- **AWS SAM CLI:** Optional for local HTTP API emulation (`sam validate`, `sam local start-api`).

> [!NOTE]
> **No AWS Deployment:** This phase is completely local-first. No AWS cloud deployment, `sam deploy`, or cloud infrastructure provisioning is performed or required.

---

## 2. Environment Setup

### 2.1 Virtual Environment
To create and activate an isolated Python 3.11 environment:

```powershell
# Windows (PowerShell)
python -m venv venv
.\venv\Scripts\Activate.ps1
```

```bash
# Linux / macOS (bash/zsh)
python3.11 -m venv venv
source venv/bin/activate
```

### 2.2 Installing Dependencies
Install the serverless pipeline dependencies:

```bash
pip install -r backend_serverless/requirements.txt
```

---

## 3. Running Automated Tests

### 3.1 Serverless Pipeline Test Suite (50 Automated Tests)
The test suite includes both pure offline in-memory tests (guaranteeing zero external dependencies) and automated integration tests that dynamically discover DynamoDB Local when running.

```bash
# Run serverless pipeline tests
python -m pytest backend_serverless/tests -v
```

### 3.2 Full Regression Suite (Serverless + FastAPI Backend)
Verifies that all 50 serverless tests and all 8 existing FastAPI integration tests pass together with zero regressions:

```bash
python -m pytest backend_serverless/tests backend/tests -v
```

---

## 4. DynamoDB Single-Table Design

The architecture uses a single-table design (`resqnet-core-table`) defined in `template.yaml`.

| Key / Index Attribute | Pattern / Value | Access Pattern / Purpose |
| :--- | :--- | :--- |
| **PK** | `INC#<incident_id>` | Uniquely identifies incident (e.g. `INC#inc-a8f102c91b8d`). |
| **SK** | `METADATA` | Fixed partition discriminator for incident metadata. |
| **GSI1_PK** | `STATUS#<status>` | Triage and queue queries (e.g. `STATUS#submitted`). |
| **GSI1_SK** | `<created_at_utc_iso>` | Chronological ordering for dispatch queues. |
| **GSI2_PK** | `REF#<reference_code>` | Targeted lookup by public tracking code (e.g. `REF#SOS-2026-FLOOD-8492`). |
| **GSI2_SK** | `METADATA` | Stable sort key for reference query. |

### 4.1 Conditional Writes & Idempotency
- When saving an incident item, `attribute_not_exists(PK)` is strictly enforced via DynamoDB conditional writes.
- A duplicate incident ID or reference collision raises a `DuplicateIncidentError` and returns `409 Conflict`, guaranteeing that existing records cannot be overwritten.

### 4.2 Public Tracking Data Sanitization
Queries to `GET /v1/public/incidents/ref/{referenceCode}` return a safe public representation:
- **Exposed:** `reference_code`, `status`, `priority`, `created_at`, `disaster_type`, `people_count`, `trapped_count`, `medical_assistance_needed`, `description`, `address_text`, `status_history`.
- **Deliberately Redacted:** `reporter_name`, `reporter_contact`, `reporter_is_victim`, internal dispatcher notes, `PK`, `SK`, `GSI1_PK`, and `GSI2_PK`. Possession of a reference code does not authorize access to private personal data.

### 4.3 Global Secondary Index Eventual Consistency Handling
- DynamoDB Global Secondary Index queries are eventually consistent.
- The service incorporates a **bounded, low-latency retry mechanism** (up to 2 retries with a 50ms pause) on GSI2 lookups to transparently bridge propagation delays for immediate lookups following an SOS submission.
- If retries exhaust or the reference genuinely does not exist, the API returns a structured `404 Not Found` with a helpful `propagation_hint` explaining that recently submitted references may need a moment to replicate.

---

## 5. Local Emulation with DynamoDB Local & AWS SAM

### 5.1 Starting DynamoDB Local
To avoid port conflicts with applications already running on port 8000, run DynamoDB Local on port `8002`:

```powershell
# Start local DynamoDB container
docker run -d --name resqnet_dynamodb_test -p 8002:8000 amazon/dynamodb-local:latest -jar DynamoDBLocal.jar -inMemory -sharedDb
```

### 5.2 Creating the Core Table and GSIs
Create the table matching `template.yaml` using the AWS CLI:

```powershell
aws dynamodb create-table `
  --table-name resqnet-core-table `
  --attribute-definitions `
    AttributeName=PK,AttributeType=S `
    AttributeName=SK,AttributeType=S `
    AttributeName=GSI1_PK,AttributeType=S `
    AttributeName=GSI1_SK,AttributeType=S `
    AttributeName=GSI2_PK,AttributeType=S `
    AttributeName=GSI2_SK,AttributeType=S `
  --key-schema `
    AttributeName=PK,KeyType=HASH `
    AttributeName=SK,KeyType=RANGE `
  --global-secondary-indexes `
    "IndexName=GSI1,KeySchema=[{AttributeName=GSI1_PK,KeyType=HASH},{AttributeName=GSI1_SK,KeyType=RANGE}],Projection={ProjectionType=ALL}" `
    "IndexName=GSI2,KeySchema=[{AttributeName=GSI2_PK,KeyType=HASH},{AttributeName=GSI2_SK,KeyType=RANGE}],Projection={ProjectionType=ALL}" `
  --billing-mode PAY_PER_REQUEST `
  --endpoint-url http://127.0.0.1:8002 `
  --region us-east-1
```

### 5.3 Configuring Local Environment Variables
```powershell
# Windows PowerShell
$env:DYNAMODB_ENDPOINT_URL = "http://127.0.0.1:8002"
$env:TABLE_NAME = "resqnet-core-table"
```

```bash
# Linux / macOS
export DYNAMODB_ENDPOINT_URL="http://127.0.0.1:8002"
export TABLE_NAME="resqnet-core-table"
```

### 5.4 Starting SAM Local HTTP API (If SAM CLI is installed)
```bash
sam local start-api --port 3000 --parameter-overrides DynamoDBEndpoint=http://127.0.0.1:8002
```

### 5.5 Cleaning Up Local Test Resources
```powershell
# Stop and remove DynamoDB Local container
docker stop resqnet_dynamodb_test
docker rm resqnet_dynamodb_test
```

---

## 6. Sample API Requests & Responses

### 6.1 POST /v1/public/incidents

#### Request:
```bash
curl -X POST http://localhost:3000/v1/public/incidents \
  -H "Content-Type: application/json" \
  -d '{
    "reporter_name": "Sunita Sharma",
    "reporter_contact": "+91-98765-43210",
    "reporter_is_victim": true,
    "disaster_type": "flood",
    "people_count": 3,
    "trapped_count": 1,
    "medical_assistance_needed": true,
    "special_needs_description": "Elderly patient needing oxygen cylinder",
    "description": "Flood water is 1.5m deep and rising rapidly into ground floor",
    "address_text": "Plot 42, River Creek Colony, Sector B",
    "latitude": 28.5710,
    "longitude": 77.2390
  }'
```

#### Success Response (`201 Created`):
```json
{
  "reference_code": "SOS-2026-FLOOD-8492",
  "incident_id": "inc-b73f8a192c4e",
  "status": "submitted",
  "priority": "critical",
  "created_at": "2026-10-21T03:55:00.123456Z",
  "tracking_url": "/v1/public/incidents/ref/SOS-2026-FLOOD-8492",
  "message": "Emergency request submitted successfully. Responders will verify details."
}
```

#### Failure Response (`400 Bad Request` — Validation Failure):
```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Provided incident data does not meet schema requirements",
    "details": [
      {
        "field": "people_count",
        "issue": "Input should be greater than or equal to 1"
      }
    ]
  }
}
```

---

### 6.2 GET /v1/public/incidents/ref/{referenceCode}

#### Request:
```bash
curl -X GET http://localhost:3000/v1/public/incidents/ref/SOS-2026-FLOOD-8492
```

#### Success Response (`200 OK` — Sanitized):
```json
{
  "reference_code": "SOS-2026-FLOOD-8492",
  "status": "submitted",
  "priority": "critical",
  "created_at": "2026-10-21T03:55:00.123456Z",
  "updated_at": "2026-10-21T03:55:00.123456Z",
  "disaster_type": "flood",
  "people_count": 3,
  "trapped_count": 1,
  "medical_assistance_needed": true,
  "special_needs_description": "Elderly patient needing oxygen cylinder",
  "description": "Flood water is 1.5m deep and rising rapidly into ground floor",
  "address_text": "Plot 42, River Creek Colony, Sector B",
  "status_history": [
    {
      "status": "submitted",
      "timestamp": "2026-10-21T03:55:00.123456Z",
      "notes": "Emergency SOS registered via public citizen pipeline"
    }
  ]
}
```

#### Failure Response (`404 Not Found` — Unknown or In-Flight Reference):
```json
{
  "error": {
    "code": "INCIDENT_NOT_FOUND",
    "message": "Incident with reference 'SOS-2026-FLOOD-0000' not found. If you recently submitted this request, index updates may take a few moments to propagate.",
    "details": {
      "reference_code": "SOS-2026-FLOOD-0000",
      "propagation_hint": "GSI updates are asynchronous. Please verify reference or retry after a moment."
    }
  }
}
```

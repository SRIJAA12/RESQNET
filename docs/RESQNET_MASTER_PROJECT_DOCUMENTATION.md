# RESQNET — Master Project Documentation & Deployment Guide

**Intelligent Disaster Relief Coordination and Resource Management Ecosystem**

---

## 1. Executive Summary & Problem Statement

### 1.1 The Challenge
During natural catastrophes—such as severe flash floods, cyclones, and earthquakes—existing emergency response mechanisms frequently break down due to two distinct failure modes:
1. **Public Intake Bottlenecks:** Emergency lines (e.g., 911, control numbers) and traditional relational backend APIs get overwhelmed by tens of thousands of concurrent distress calls and web submissions within minutes. Traditional architectures crash or lock up under extreme write surges.
2. **Operational Coordination Chaos:** Once emergency reports are ingested, command-center dispatchers, field rescue teams, medical shelters, and NGOs operate in disconnected silos. Duplicate rescues are dispatched to the same location while critical areas remain unaddressed; rescue craft are double-booked; and affected citizens are left in the dark without visibility into their rescue status.

### 1.2 The RESQNET Solution
**RESQNET** is an intelligent, high-reliability disaster relief platform designed to bridge citizens in distress with authorized emergency dispatchers, field rescue personnel, and relief infrastructure.

RESQNET employs a **Dual-Engine Architecture**:
* **Serverless Elastic Intake Engine (AWS SAM / Lambda / DynamoDB):** Provides massive horizontal elasticity to ingest thousands of citizen SOS reports per second with near-zero latency, automated triage severity calculation, and zero server management.
* **Transactional Operations Command Engine (FastAPI / PostgreSQL + PostGIS):** Provides ACID-compliant, row-level locking for conflict-free resource assignment, complex geospatial radius queries, shelter/hospital capacity management, and complete audit logging.
* **Bi-directional Synchronization Bridge:** Seamlessly synchronizes newly ingested serverless SOS reports into the dispatcher queue and propagates operational milestone updates back to citizens in real time.

### 1.3 Core Engineering Tenets
* **Human-in-the-Loop Governance:** Assistive algorithms and heuristic triage calculate priority scores, but **AI never autonomously dispatches resources or closes incidents**. Every operational decision requires explicit authorized human dispatcher approval.
* **Strict PII Protection & Data Sanitization:** Public tracking endpoints expose only opaque reference codes and coarse hazard levels. Citizen names, phone numbers, and exact rescue team GPS coordinates are redacted from public view.
* **Transaction-Safe Dispatch:** Multi-threaded or concurrent assignments of rescue boats, ambulances, and teams are protected by database row-level locking (`SELECT ... FOR UPDATE`), preventing double-booking during chaotic emergencies.
* **Zero Silent Fallback:** The system surfaces errors explicitly rather than masking backend failures with misleading mock data.

---

## 2. Technology Stack & Frameworks

RESQNET is built using a modern, multi-tier stack combining serverless cloud-native components with high-performance relational and geospatial backends.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       RESQNET APPLICATION ECOSYSTEM                         │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
          ┌───────────────────────────┴───────────────────────────┐
          ▼                                                       ▼
┌───────────────────────────────────┐   ┌───────────────────────────────────┐
│     CITIZEN & PUBLIC SURFACE      │   │    OPERATIONS & COMMAND CENTER    │
│  React 18 + Vite + Tailwind CSS   │   │  React 18 + Leaflet GIS + Vite    │
└───────────────────────────────────┘   └───────────────────────────────────┘
                  │                                       │
                  │ HTTPS (REST)                          │ HTTPS (REST + JWT)
                  ▼                                       ▼
┌───────────────────────────────────┐   ┌───────────────────────────────────┐
│     SERVERLESS INTAKE ENGINE      │   │    OPERATIONS BACKEND (FastAPI)   │
│  API Gateway HTTP API v2          │   │  FastAPI (ASGI) + Python 3.11     │
│  AWS Lambda (Python 3.11)         │   │  SQLAlchemy 2.0 + Alembic         │
│  Amazon DynamoDB Single-Table     │   │  PostgreSQL 16 + PostGIS 3.4      │
└───────────────────────────────────┘   └───────────────────────────────────┘
                  │                                       ▲
                  │           SYNCHRONIZATION BRIDGE      │
                  └───────────────────────────────────────┘
                     • Idempotent SOS Queue Sync
                     • Status Milestone Propagation
```

### 2.1 Technology Breakdown

| Tier | Component / Technology | Version | Purpose & Rationale |
| :--- | :--- | :--- | :--- |
| **Frontend** | React | 18.3.1 | Core UI library for reactive, component-based user interfaces. |
| | TypeScript | 5.x | Strict type safety across all domain models, API schemas, and state. |
| | Vite | 5.x | High-speed frontend build tool and hot-module replacement (HMR). |
| | Tailwind CSS | 3.4.x | Utility-first styling for responsive, accessible, emergency-ready UI. |
| | React Router DOM | 6.23.x | Client-side routing for citizen and dispatcher views. |
| | Leaflet & React-Leaflet | 1.9.x | Geospatial disaster mapping, hazard heatmaps, and rescue markers. |
| | Lucide React | 0.378.x | Lightweight, accessible iconography for high-stress usability. |
| | React Hook Form & Zod | Latest | High-performance form state management and runtime schema validation. |
| **Serverless Engine** | AWS SAM | 2016-10-31 | Infrastructure as Code specification for serverless application deployment. |
| | AWS Lambda | Python 3.11 | Ephemeral compute for sub-second public SOS ingestion and status tracking. |
| | Amazon API Gateway | HTTP API v2 | Low-latency, cost-effective API entry point with native CORS and routing. |
| | Amazon DynamoDB | On-Demand | Fully managed NoSQL single-table database with single-digit millisecond latency. |
| | Pydantic | 2.x | Request/response schema validation and data sanitization. |
| **Operations Backend**| FastAPI | 0.111.0 | Asynchronous Python REST framework with auto-generated OpenAPI documentation. |
| | Python | 3.11.9 | Core runtime for backend business logic, triage heuristics, and sync services. |
| | SQLAlchemy | 2.0.x | Modern ORM supporting declarative mappings and row-level locking. |
| | Alembic | 1.13.x | Database schema migration management. |
| | PostgreSQL | 16 | Relational database ensuring ACID compliance for operational state. |
| | PostGIS | 3.4 | Geospatial extension for coordinate geometry, radius searches, and hazard zones. |
| **Cloud & DevOps** | Docker & Compose | Compose v2 | Local multi-container orchestration for PostgreSQL, FastAPI, and Vite. |
| | Terraform | >= 1.5.0 | IaC for production AWS infrastructure (ECS Fargate, RDS, CloudFront). |
| | Amazon ECS / Fargate | Serverless | Container execution for FastAPI backend without managing EC2 instances. |
| | Amazon RDS | Multi-AZ | Managed PostgreSQL + PostGIS database with automated failover. |
| | Amazon S3 + CloudFront| Global CDN | High-performance static web hosting and asset distribution. |
| | Amazon Cognito | User Pools | Secure identity management, MFA, and JWT verification for dispatchers. |

---

## 3. What the Project Does — Capabilities & Workflows

### 3.1 Citizen Distress Ingestion (SOS Pipeline)
* **Guided 4-Step Emergency Wizard:** Allows citizens in flood-affected or crisis zones to request immediate assistance across categories (`flood_rescue`, `medical_emergency`, `evacuation_assistance`, `food_water`, `shelter_request`).
* **Automated Severity Scoring:** Evaluates multiple factors (flood water level, trapped individuals, infants, elderly, pregnant women, urgent medical requirements) to assign an initial heuristic priority:
  * `critical` (Immediate life threat: roof trapped, chest-deep water, cardiac/respiratory distress)
  * `high` (Vulnerable persons trapped, waist-deep rising water)
  * `medium` (Knee-deep water, food/drinking water depletion)
  * `low` (Precautionary evacuation, general inquiry)
* **Deterministic Tracking Code:** Generates an opaque, human-friendly identifier formatted as `SOS-YYYY-<DISASTER>-<RANDOM>` (e.g., `SOS-2026-FLOOD-8492`).
* **Sanitized Tracking Portal:** Citizens can track their rescue progress without logging in. The system renders a visual milestone timeline (`submitted` → `verified` → `assigned` → `in_progress` → `resolved`) while redacting all sensitive responder data and PII.

### 3.2 Dispatcher Triage & Command Center
* **Unified Live Incident Queue:** Dispatchers view all pending and active incidents with real-time severity badges, headcount indicators, medical flags, and timestamps.
* **Serverless Ingestion Synchronization:** Dispatchers can pull newly submitted SOS reports directly from DynamoDB into PostgreSQL with guaranteed idempotency via `POST /api/v1/incidents/sync`.
* **Human Verification Mandate:** Dispatchers review raw citizen submissions, check for duplicates, confirm urgency, and approve them for dispatch (`verified`) or reject false alarms (`rejected`).
* **Mandatory Rejection Auditing:** Rejections cannot be made arbitrarily; dispatchers must submit an operational rejection reason (e.g., "Duplicate report", "Hoax/unverified report", "Out of jurisdiction"), which is recorded in the permanent audit trail.

### 3.3 Conflict-Free Resource & Responder Dispatch
* **Resource Fleet Registry:** Tracks boats, high-water rescue vehicles, ambulances, medical teams, and drones with statuses (`available`, `assigned`, `maintenance`, `offline`).
* **Transaction-Safe Assignment Engine:** When a dispatcher assigns a resource to an incident, the backend executes a row-level lock (`SELECT ... FOR UPDATE`) on the resource record. If two dispatchers attempt to assign the same boat simultaneously, the second transaction is safely rejected with a conflict error (`409 Conflict`).
* **Milestone State Machine:** Enforces strict forward state transitions:
  $$\text{submitted} \longrightarrow \text{verified} \longrightarrow \text{assigned} \longrightarrow \text{in\_progress} \longrightarrow \text{resolved}$$
  Any status update in PostgreSQL automatically updates DynamoDB milestones to notify the citizen.

### 3.4 Geospatial Operations & Disaster Heatmaps
* **Interactive PostGIS Disaster Map:** Visualizes flood floodplains, high-risk inundation zones, shelter locations, active incidents, and responder locations using Leaflet.
* **Spatial Distance Filtering:** Calculates proximity between available rescue units and stranded citizens to prioritize shortest response times.

### 3.5 Shelter & NGO Logistics Management
* **Shelter Capacity Monitoring:** Real-time visibility into emergency evacuation shelters, tracking current occupancy, remaining bed capacity, medical facilities, and pet accommodations.
* **NGO Relief Inventory:** Tracks critical emergency supplies (rations, clean water bottles, hygiene kits, blankets) across distribution depots.

---

## 4. User Roles & Access Control Matrix

RESQNET enforces strict server-side Role-Based Access Control (RBAC) via Amazon Cognito JWT tokens (in production) or secure bearer tokens (in local development). Frontend claims are never trusted blindly.

```
                              ┌─────────────────────────┐
                              │     USER ROLES IN       │
                              │        RESQNET          │
                              └───────────┬─────────────┘
          ┌───────────────┬───────────────┼───────────────┬───────────────┐
          ▼               ▼               ▼               ▼               ▼
     [ Citizen ]    [ Dispatcher ]   [ Responder ]  [ Coordinator ]   [ Admin ]
     (Anonymous)    (Control Room)   (Field Team)   (Shelter/Med)    (SysAdmin)
```

### 4.1 Detailed Role Specifications

#### 1. Citizen / Public Reporter (`citizen` or Unauthenticated)
* **Primary Responsibilities:** Request emergency assistance for themselves or others; track the status of an existing request; locate open public evacuation shelters.
* **Authentication Required:** **None** (Anonymous public access). In life-or-death crises, requiring account registration or login introduces fatal delays.
* **Permissions:**
  * `POST /v1/public/incidents` — Submit emergency SOS.
  * `GET /v1/public/incidents/ref/{ref}` — View sanitized status timeline.
  * `GET /api/v1/shelters` (Public view) — View open shelter locations and availability.
* **Security Constraints:** Strictly blocked from administrative endpoints, internal dispatcher notes, raw phone numbers, and responder GPS tracks.

#### 2. Emergency Control-Room Dispatcher (`dispatcher`)
* **Primary Responsibilities:** Review citizen SOS submissions; triage urgency; verify authenticity; assign rescue boats and personnel; coordinate multi-agency operations.
* **Authentication Required:** Bearer Token / Cognito JWT with group `dispatcher`.
* **Permissions:**
  * `POST /api/v1/incidents/sync` — Trigger idempotent sync from DynamoDB.
  * `GET /api/v1/incidents` — View operational queue with filters.
  * `PATCH /api/v1/incidents/{id}/status` — Transition incident states (`verified`, `rejected`).
  * `POST /api/v1/assignments` — Assign field resources to incidents.
  * `GET /api/v1/dashboard/summary` — View operational metrics and heatmaps.
* **Mandates:** Must provide an explicit reason when rejecting an incident.

#### 3. Field Responder / Rescue Crew (`responder`)
* **Primary Responsibilities:** Execute assigned rescue missions on the ground/water; update mission milestones; report on-scene conditions.
* **Authentication Required:** Bearer Token / Cognito JWT with group `responder`.
* **Permissions:**
  * `GET /api/v1/assignments/my` — View missions assigned to their unit.
  * `PATCH /api/v1/assignments/{id}/status` — Update mission status (`en_route`, `on_scene`, `transporting`, `completed`).
  * `PATCH /api/v1/resources/{id}/status` — Update operational readiness (`available`, `maintenance`).

#### 4. Shelter & Hospital Coordinator (`coordinator`)
* **Primary Responsibilities:** Manage shelter facilities; update available bed counts; register arriving evacuees; request logistics replenishment.
* **Authentication Required:** Bearer Token / Cognito JWT with group `coordinator`.
* **Permissions:**
  * `POST /api/v1/shelters` & `PUT /api/v1/shelters/{id}` — Register and update shelter capacity.
  * `PATCH /api/v1/shelters/{id}/occupancy` — Update live headcounts.

#### 5. NGO & Supply Chain Manager (`ngo_admin`)
* **Primary Responsibilities:** Track relief supplies (potable water, MREs, blankets, medical kits); manage depot inventories; dispatch supply convoys.
* **Authentication Required:** Bearer Token / Cognito JWT with group `ngo_admin`.
* **Permissions:**
  * `GET /api/v1/inventory` & `POST /api/v1/inventory` — Manage relief stock levels.
  * `POST /api/v1/inventory/dispatch` — Log supplies dispatched to shelters.

#### 6. System Administrator (`admin`)
* **Primary Responsibilities:** Configure disaster event boundaries; audit system operations; manage user credentials and access permissions.
* **Authentication Required:** Cognito JWT with group `admin`.
* **Permissions:** Unrestricted access across all endpoints, including disaster event creation (`POST /api/v1/events`), user provisioning, and audit logs.

### 4.2 RBAC Permission Matrix

| Action / Endpoint | Citizen | Dispatcher | Responder | Coordinator | Admin |
| :--- | :---: | :---: | :---: | :---: | :---: |
| Submit Public SOS (`POST /public/incidents`) |  Yes |  Yes |  Yes |  Yes |  Yes |
| Track Public SOS (`GET /public/incidents/ref/:ref`) |  Yes (Sanitized) |  Yes |  Yes |  Yes |  Yes |
| Sync DynamoDB Queue (`POST /incidents/sync`) |  No |  Yes |  No |  No |  Yes |
| View Operational Queue (`GET /incidents`) |  No |  Yes |  Yes |  No |  Yes |
| Verify/Reject Incident (`PATCH /incidents/:id/status`) |  No |  Yes |  No |  No |  Yes |
| Assign Rescue Resource (`POST /assignments`) |  No |  Yes |  No |  No |  Yes |
| Update Mission Milestone (`PATCH /assignments/:id/status`) |  No |  Yes |  Yes |  No |  Yes |
| Update Shelter Capacity (`PUT /shelters/:id`) |  No |  No |  No |  Yes |  Yes |
| Create Disaster Event (`POST /events`) |  No |  No |  No |  No |  Yes |

---

## 5. Implementation Architecture & Data Engineering

### 5.1 Serverless Single-Table DynamoDB Schema (`resqnet-core-table`)

The serverless intake table uses an optimized single-table design supporting fast primary lookups and secondary indexed queries:

* **Partition Key (`PK`):** `INCIDENT#<incident_id>`
* **Sort Key (`SK`):** `METADATA`
* **GSI1 (Status & Dispatcher Sync Queue):**
  * `GSI1_PK`: `STATUS#<status>` (e.g., `STATUS#submitted`)
  * `GSI1_SK`: `<created_at>` (ISO-8601 timestamp for chronological FIFO queue processing)
* **GSI2 (Public Reference Code Tracking):**
  * `GSI2_PK`: `REF#<reference_code>` (e.g., `REF#SOS-2026-FLOOD-8492`)
  * `GSI2_SK`: `METADATA`

```
┌───────────────────────────────────────────────────────────────────────────────┐
│ DynamoDB: resqnet-core-table                                                  │
├────────────────────┬──────────┬──────────────────┬──────────────┬─────────────┤
│ PK                 │ SK       │ GSI1_PK          │ GSI1_SK      │ GSI2_PK     │
├────────────────────┼──────────┼──────────────────┼──────────────┼─────────────┤
│ INCIDENT#uuid-1234 │ METADATA │ STATUS#submitted │ 2026-10-24T… │ REF#SOS-…   │
└────────────────────┴──────────┴──────────────────┴──────────────┴─────────────┘
```

### 5.2 PostgreSQL / PostGIS Relational Schema

For operational workflows, the relational schema in PostgreSQL ensures referential integrity, spatial indexing, and concurrency safety:

* `disaster_events`: Major disaster incidents (e.g., "Monsoon Flood 2026", epicenter coordinate, radius, severity).
* `incidents`: Synced and verified operational emergency incidents. Includes spatial geometry `location` (`Geometry(Point, 4326)`), `reference_code`, `status`, `priority`, `trapped_count`, `medical_critical`, `rejection_reason`.
* `incident_status_history`: Immutable audit trail recording state transitions, timestamp, and changing user ID.
* `resources`: Rescue vehicles, boats, and teams. Includes `passenger_capacity`, `status`, `assigned_incident_id`.
* `assignments`: Mission dispatch link between an incident and a resource with status (`assigned`, `en_route`, `on_scene`, `transporting`, `completed`).
* `shelters`: Shelter facilities with spatial location, maximum capacity, current occupancy, and medical readiness.

### 5.3 Bi-directional Synchronization Mechanics (`incident_sync_service.py`)

1. **Idempotent Ingestion (`sync_incident_from_dynamo`)**:
   * Reads submitted incidents from DynamoDB via `GSI1` (`STATUS#submitted`).
   * Queries PostgreSQL by unique `reference_code`.
   * If already present, skips insert to prevent duplicates during network retries.
   * If absent, inserts into `incidents` and logs an initial entry in `incident_status_history`.
2. **Status Propagation (`push_status_milestone_to_dynamo`)**:
   * When a dispatcher transitions an incident in PostgreSQL (e.g., `verified`, `assigned`, `in_progress`, `resolved`), the backend calls `dynamo_repo.update_status_by_reference(...)`.
   * Updates `status`, `milestones`, and `GSI1_PK` in DynamoDB.
   * When the citizen polls `GET /v1/public/incidents/ref/{ref}`, the updated status is immediately visible.

### 5.4 Concurrency & Race Condition Protection

```python
# From backend/app/services/assignment_service.py:
# Row-level database locking ensures conflict-free dispatch
resource = (
    db.query(Resource)
    .filter(Resource.id == resource_id)
    .with_for_update()  # SELECT ... FOR UPDATE
    .first()
)
if resource.status != ResourceStatusEnum.AVAILABLE:
    raise ConflictError("Resource is already assigned or in maintenance.")
```

---

## 6. How Everything Was Deployed & Operational Setup

RESQNET supports three operational deployment models depending on the environment:
1. **Local Development with Docker Compose (Full Stack)**
2. **Hybrid Local Development (AWS SAM Local + FastAPI + Vite)**
3. **Enterprise AWS Cloud Deployment (Terraform + SAM)**

---

### 6.1 Deployment Model A: Local Development with Docker Compose

This is the fastest method to run the entire application (PostgreSQL + PostGIS, FastAPI backend, and React frontend) on a single workstation.

#### Prerequisites
* Docker Desktop installed and running.
* Git.

#### Step 1: Clone and Configure Environment
```bash
git clone https://github.com/organization/resqnet.git
cd resqnet

# Copy the environment file template
cp .env.example .env
```

#### Step 2: Launch Containers
Run Docker Compose to build and start all three services:
```bash
docker compose up --build -d
```

This launches:
* `resqnet_postgres` (PostGIS 16-3.4 on port `5433:5432`)
* `resqnet_backend` (FastAPI backend on port `8001:8000`)
* `resqnet_frontend` (Vite React app on port `5174:5173`)

#### Step 3: Run Database Migrations and Seed Demo Data
In your terminal, execute Alembic migrations and the flood scenario seeder inside the backend container:
```bash
# Run database migrations
docker compose exec backend alembic upgrade head

# Seed synthetic flood disaster scenario data
docker compose exec backend python -m app.db.seed
```

#### Step 4: Verify Running Services
* **Citizen & Ops Web App:** `http://localhost:5174`
* **Backend Health Check:** `http://localhost:8001/api/health`
* **FastAPI Swagger API Documentation:** `http://localhost:8001/api/docs`

---

### 6.2 Deployment Model B: Hybrid Local Serverless + Core Backend

To test the serverless Citizen SOS submission pipeline alongside the core backend without deploying to AWS:

#### Prerequisites
* Python 3.11 installed.
* Node.js 18+ and npm installed.
* AWS SAM CLI installed.
* DynamoDB Local (or the built-in offline In-Memory repository double).

#### Step 1: Start Serverless API Gateway via SAM Local
In a dedicated terminal:
```bash
# Build the SAM template
sam build

# Start local HTTP API Gateway on port 3000
sam local start-api --port 3000
```
This serves `http://localhost:3000/v1/public/incidents`.

#### Step 2: Start Core FastAPI Backend
In a second terminal:
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

pip install -r requirements.txt
alembic upgrade head
python -m app.db.seed

uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### Step 3: Start Vite Frontend
In a third terminal:
```bash
cd frontend
npm install

# Start Vite development server
npm run dev
```
Open `http://localhost:5173` in your browser.

---

### 6.3 Deployment Model C: Enterprise AWS Cloud Deployment

For production cloud hosting, RESQNET utilizes Terraform for foundational cloud infrastructure and AWS SAM for serverless ingestion.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           AWS PRODUCTION ARCHITECTURE                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  [ Route 53 DNS ]                                                           │
│         │                                                                   │
│         ├──────────────────────────────┐                                    │
│         ▼                              ▼                                    │
│  [ CloudFront CDN ]           [ API Gateway v2 ]                            │
│         │                              │                                    │
│         ▼                              ▼                                    │
│    [ S3 Bucket ]            [ Lambda: Public SOS ]                          │
│   (Vite SPA Assets)                    │                                    │
│                                        ▼                                    │
│                             [ DynamoDB Core Table ]                         │
│                                        │                                    │
│  [ Application Load Balancer ]         │ (Sync Endpoint)                    │
│         │                              ▼                                    │
│         ▼                   [ ECS Fargate: FastAPI ]                        │
│  [ VPC Private Subnets ] ──────────────┤                                    │
│                                        ▼                                    │
│                            [ RDS PostgreSQL PostGIS ]                       │
│                               (Multi-AZ Database)                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Step 1: Deploy Serverless Pipeline via AWS SAM
```bash
# Validate template syntax and IAM policies
sam validate --lint -t template.yaml

# Build SAM deployment artifacts
sam build

# Deploy to AWS (prompts for environment stage, table name, region)
sam deploy --guided
```
Outputs from SAM:
* `HttpApiUrl`: The public API Gateway endpoint for citizen submissions.
* `DynamoDBTableName`: Name of the deployed DynamoDB table.

#### Step 2: Deploy Cloud Infrastructure via Terraform
The `infrastructure/terraform/` directory contains modular Terraform code:
```bash
cd infrastructure/terraform/environments/prod

# Initialize Terraform providers
terraform init

# Review execution plan
terraform plan

# Apply infrastructure changes
terraform apply
```

The Terraform plan deploys:
1. **VPC Module:** Multi-AZ VPC with 2 public subnets, 2 private application subnets, 2 private database subnets, and NAT Gateways.
2. **RDS PostGIS Module:** Amazon RDS PostgreSQL 16 Multi-AZ instance with PostGIS enabled in isolated database subnets.
3. **ECS Fargate Module:** AWS ECS cluster running FastAPI Docker containers behind an Application Load Balancer with auto-scaling.
4. **S3 & CloudFront Module:** Secure S3 bucket hosting Vite React static assets distributed globally via Amazon CloudFront with SSL/TLS.
5. **Cognito Module:** User pool configured with role groups (`dispatcher`, `responder`, `coordinator`, `admin`) and JWT token emission.
6. **SNS Module:** Notification topics for critical incident SMS alerts.
7. **CloudWatch Module:** Centralized logging, metric dashboards, and high-watermark alert alarms.

---

## 7. Quality Assurance & Verification Results

All automated test suites across both backends and the frontend compile and pass 100%:

```
===============================================================================
RESQNET VERIFICATION SUMMARY
===============================================================================
1. Serverless Unit & Integration Tests:   49 passed, 1 skipped (100% pass)
2. FastAPI Operations & Sync Tests:       18 passed, 0 failed  (100% pass)
3. Frontend TypeScript Compilation:       0 errors, 1,594 modules built cleanly
4. AWS SAM Template Validation:           Valid SAM Template (sam validate --lint)
5. End-to-End Simulation:                 30/30 checks passed
===============================================================================
```

### 7.1 Running the Test Suites

To execute the test suites on your machine:

```bash
# 1. Run Serverless tests (DynamoDB repository, sanitization, triage heuristics)
pytest backend_serverless/tests -v

# 2. Run Operations Backend tests (Sync engine, row locks, RBAC, PostGIS models)
pytest backend/tests -v

# 3. Verify Frontend TypeScript compilation and production bundle
cd frontend
npm run build
```

---

## 8. Directory & File Reference

```text
D:\RESQNET
├── .env.example                               # Environment template for local and Docker setups
├── compose.yaml                               # Docker Compose definition (PostGIS, FastAPI, Vite)
├── template.yaml                              # AWS SAM Infrastructure template for Serverless SOS
├── README.md                                  # Project overview and quickstart guide
├── backend_serverless/                        # Serverless Ingestion Engine (AWS Lambda)
│   ├── handlers/public_incidents.py           # Lambda handler for SOS submission & tracking
│   ├── repository/dynamo_repo.py              # DynamoDB single-table & in-memory test double
│   ├── schemas/incident.py                    # Pydantic schemas with PII sanitization
│   ├── services/incident_service.py           # Automatic triage & severity scoring logic
│   └── tests/                                 # 49 unit and integration tests
├── backend/                                   # Operations Command Engine (FastAPI)
│   ├── app/
│   │   ├── api/v1/endpoints/incidents.py      # Incident endpoints & POST /incidents/sync
│   │   ├── core/security.py                   # Role-Based Access Control (require_role)
│   │   ├── models/                            # SQLAlchemy models (incidents, resources, shelters)
│   │   ├── services/incident_sync_service.py  # Idempotent DynamoDB <-> PostgreSQL sync bridge
│   │   ├── services/assignment_service.py     # Row-locked transaction-safe resource dispatch
│   │   └── db/seed.py                         # Synthetic flood response scenario seeder
│   ├── alembic/                               # Database migration versions
│   └── tests/                                 # 18 pytest tests (test_incident_sync.py, etc.)
├── frontend/                                  # Citizen & Dispatcher Web Interface (React)
│   ├── src/
│   │   ├── pages/RequestAssistancePage.tsx    # 4-step Citizen SOS submission wizard
│   │   ├── pages/TrackRequestPage.tsx         # Real-time sanitized request tracker
│   │   ├── pages/IncidentQueuePage.tsx        # Dispatcher triage queue with live Sync button
│   │   ├── pages/DisasterMapPage.tsx          # Leaflet GIS disaster map & hazard zones
│   │   ├── services/sosApi.ts                 # Dedicated serverless HTTP client
│   │   └── services/api.ts                    # Operations backend HTTP client
│   └── package.json                           # Dependencies and scripts
└── infrastructure/terraform/                  # Production AWS Cloud IaC modules
    └── modules/                               # Networking, RDS, ECS Fargate, CloudFront, Cognito
```

# RESQNET &mdash; Intelligent Disaster Relief Coordination Ecosystem

[![FastAPI](https://img.shields.io/badge/FastAPI-0.111.0-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-PostGIS-336791?logo=postgresql)](https://postgis.net)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)](https://www.docker.com)
[![Jenkins](https://img.shields.io/badge/CI%2FCD-Jenkins%20%7C%20Ansible-D24939?logo=jenkins)](https://www.jenkins.io)

> [!CAUTION]
> **SIMULATION & TRAINING NOTICE:** RESQNET is designed for simulated emergency management and exercise demonstrations. All demonstration data (coordinates, contact numbers, incident reports) are **100% fictional**. This system is **not connected to official 911 or emergency services**. In an actual life-threatening emergency, contact local emergency services immediately.

---

## 1. Product Overview

**RESQNET** provides a unified disaster-response platform connecting citizens, emergency control-room dispatchers, rescue teams, NGOs, and shelters.

### Core Workflow:
```
Citizen SOS → AI Assistive Triage → Incident Review & Verification → Resource Matching → Authorized Human Dispatcher Approval → Deployment → Response Tracking → Verified Resolution
```

### Safety & Governance Mandates:
* **Human-in-the-Loop:** AI must **never** autonomously execute rescue, medical, or evacuation decisions. All assistive AI triage scores and match suggestions require review and explicit approval by authorized human dispatchers.
* **Transaction-Safe Dispatch:** Prevents conflicting concurrent assignment of rescue craft through database row-level locking (`SELECT ... FOR UPDATE`).
* **Audit Trail:** Complete historical state tracking for all incidents and assignments.
* **Privacy & Sanitization:** Public citizen tracking endpoints deliberately sanitize PII (suppressing phone numbers, personal names, exact coordinates, and internal dispatcher notes).

---

## 2. Technology Stack

* **Frontend:** React 18, TypeScript, Vite 6, Tailwind CSS, React Router v6, Leaflet & React Leaflet, React Hook Form, Zod.
* **Backend:** Python 3.11, FastAPI, Pydantic v2, SQLAlchemy 2.0, PostgreSQL 16 with PostGIS 3.4, Pytest.
* **DevOps & CI/CD:** Docker Compose, Jenkins (declarative pipeline), Ansible (automated idempotent deployment).

---

## 3. Monorepo Structure

```
RESQNET/
├── frontend/                     # React 18 + TypeScript + Vite SPA
│   ├── src/
│   │   ├── components/           # Reusable UI components (Navbar, LeafletMap, IncidentCard, StatusBadge, etc.)
│   │   ├── layouts/              # PublicLayout, OpsLayout, ResponderLayout, PartnerLayout
│   │   ├── pages/                # Citizen, Dispatcher, Responder, Partner & Admin Screens
│   │   ├── services/             # Unified API client layer (api.ts, sosApi.ts)
│   │   ├── types/                # Domain TypeScript models
│   │   └── App.tsx               # Route configurations
│   ├── public/                   # Static assets & icons
│   ├── Dockerfile                # Production multi-stage Nginx container
│   ├── package.json
│   └── vite.config.ts
├── backend/                      # Python FastAPI application
│   ├── app/
│   │   ├── api/v1/endpoints/     # REST routes (health, public_incidents, incidents, resources, shelters, assignments, dashboard, etc.)
│   │   ├── core/                 # App configuration & structured logging
│   │   ├── db/                   # Session, Base, and synthetic flood data seeder
│   │   ├── models/               # SQLAlchemy 2.x models with PostGIS spatial fields
│   │   ├── repositories/         # Database access layer
│   │   ├── schemas/              # Pydantic v2 validation schemas
│   │   ├── services/             # Business logic, conflict-free assignments & AI triage heuristics
│   │   └── main.py               # FastAPI entry point & CORS
│   ├── tests/                    # Integration and unit test suite
│   ├── Dockerfile                # Backend container definition
│   └── requirements.txt
├── compose.yaml                  # Local development Docker Compose (PostGIS + Backend + Frontend)
├── Jenkinsfile                   # Automated CI/CD pipeline definition
├── .env.example                  # Environment configuration template
├── .gitignore
└── README.md
```

---

## 4. Quickstart: Running with Docker Compose (Recommended)

Requires Docker Desktop installed and running:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/SRIJAA12/RESQNET.git
   cd RESQNET
   ```

2. **Start the complete stack (PostGIS + FastAPI + Frontend):**
   ```bash
   docker compose up -d --build
   ```

3. **Seed synthetic flood response demonstration data:**
   In your terminal:
   ```bash
   docker compose exec backend python -m app.db.seed
   ```

4. **Access the application:**
   * **Frontend Web App:** [http://localhost:5174](http://localhost:5174)
   * **Backend Health Check:** [http://localhost:8001/api/health](http://localhost:8001/api/health)
   * **Interactive API Documentation (Swagger):** [http://localhost:8001/api/docs](http://localhost:8001/api/docs)
   * **PostgreSQL / PostGIS Database:** `localhost:5433` (`resqnet_db`)

---

## 5. Running Locally Outside Docker

### 1. Backend Setup:
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install requirements
pip install -r requirements.txt

# Start FastAPI development server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Frontend Setup:
```bash
cd frontend
npm install

# Start Vite dev server
npm run dev
```

---

## 6. Running Automated Tests & Quality Checks

### Backend Unit & Integration Tests:
Run the complete Pytest suite (tests incident validation, public SOS submission, tracking by ref, AI triage scoring, transaction safety, and conflict prevention):
```bash
python -m pytest backend/tests -v
```

### Frontend Type-Checking & Production Build:
```bash
cd frontend
npm run lint    # TypeScript type-checking (tsc --noEmit)
npm run build   # Production bundle verification
```

---

## 7. CI/CD & Deployment Pipeline

RESQNET uses a modern, local-first CI/CD pipeline coordinated by **Jenkins**, executed in **Docker**, and deployed via **Ansible**:

```
Git Push -> Jenkins Pipeline
             ├── 1. Checkout & workspace verification
             ├── 2. Spin up ephemeral PostGIS test container & run Pytest
             ├── 3. Build production Docker images
             ├── 4. Ansible Playbook (deploy.yml) idempotent deployment
             └── 5. Automated health check verification (http://localhost:8001/api/health)
```

1. **Jenkins (`Jenkinsfile`)**: Manages the automated build lifecycle, runs integration tests in isolated containers, and delegates deployment to Ansible.
2. **Docker Compose (`compose.yaml`)**: Runs PostGIS 16, the FastAPI backend, and Nginx-based frontend with health checks and volume persistence.
3. **Ansible (`deploy.yml`)**: Automates deployment execution, validates Compose syntax, and performs safe rolling container updates with automatic health verification.

---

## 8. Feature Portals Overview

1. **Citizen Portal (`/request-assistance`, `/status`, `/safety`):** Public emergency SOS submission with headcount, medical, and trapped status; real-time public milestone tracking by reference code; offline flood guidance.
2. **Control Room Dashboard (`/ops/command-center`):** Real-time telemetry, urgency distribution meters, and rapid-response action queues.
3. **Interactive GIS Map (`/ops/map`):** Live full-screen map with color-coded incident beacons, deployed fleet positions, and shelter occupancy indicators.
4. **Incident Queue & Triage (`/ops/incidents`):** Triage queue powered by assistive AI vulnerability scoring ($0.0 - 100.0$) with mandatory written rejection auditing.
5. **Fleet & Responders Registry (`/ops/resources`):** Real-time resource status management for rescue boats, high-water trucks, paramedic ambulances, and drones.
6. **Shelters & Inventory Management (`/ops/shelters`, `/ops/inventory`, `/ops/distributions`):** Bed capacity tracking, emergency supply catalogs (water, rations, kits), and distribution manifest tracking.
7. **Responder Portal (`/responder/tasks`):** Mobile mission cards with navigation coordinates, tactical radio channels, and one-tap status updates.
8. **Relief Partner Portal (`/partner/inventory`):** Scoped access for partner NGOs (Red Cross, SDRF) to manage warehouse supplies without accessing government fleet dispatches.
9. **Intelligence & Audit (`/ops/forecasts`, `/ops/audit`):** Sector inundation forecasts and immutable audit ledger tracking all state transitions.

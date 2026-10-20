# RESQNET &mdash; Intelligent Disaster Relief Coordination Ecosystem

[![RESQNET CI](https://github.com/organization/resqnet/actions/workflows/ci.yml/badge.svg)](https://github.com/organization/resqnet/actions/workflows/ci.yml)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111.0-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-PostGIS-336791?logo=postgresql)](https://postgis.net)
[![AWS](https://img.shields.io/badge/AWS-Fargate%20%7C%20RDS%20%7C%20CloudFront-232F3E?logo=amazon-aws)](https://aws.amazon.com)

> [!CAUTION]
> **SIMULATION & TRAINING NOTICE:** RESQNET is designed for simulated emergency management and exercise demonstrations. All demonstration data (coordinates, contact numbers, incident reports) are **100% fictional**. This system is **not connected to official 911 or emergency services**. In an actual life-threatening emergency, contact local emergency services immediately.

---

## 1. Product Overview

**RESQNET** provides a unified disaster-response platform connecting citizens, emergency control-room dispatchers, rescue teams, NGOs, and shelters.

### Core Workflow:
```
Citizen SOS → Incident Review & Triage → Resource Matching → Authorized Human Dispatcher Approval → Assignment → Response Updates → Verified Resolution
```

### Safety & Governance Mandates:
* **Human-in-the-Loop:** AI must **never** autonomously execute rescue, medical, or evacuation decisions. All assistive AI triage scores and match suggestions require review and explicit approval by authorized human dispatchers.
* **Transaction-Safe Dispatch:** Prevents conflicting concurrent assignment of rescue craft through database row-level locking.
* **Audit Trail:** Complete historical state tracking for all incidents and assignments.

---

## 2. Technology Stack

* **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, React Router v6, Leaflet & React Leaflet, React Hook Form, Zod.
* **Backend:** Python 3.11, FastAPI, Pydantic v2, SQLAlchemy 2.0, Alembic, PostgreSQL with PostGIS, Pytest.
* **DevOps:** Docker Compose, GitHub Actions (CI/CD with GitHub OIDC federation), Terraform (IaC).
* **AWS Target:** ECS with AWS Fargate, Amazon ECR, Amazon RDS PostgreSQL (PostGIS), Amazon S3, Amazon CloudFront, Amazon Cognito, Amazon SNS, Amazon CloudWatch, AWS Secrets Manager.

---

## 3. Repository Monorepo Structure

```
RESQNET/
├── frontend/                     # React 18 + TypeScript + Vite SPA
│   ├── src/
│   │   ├── components/           # Reusable components (Navbar, LeafletMap, IncidentCard, StatusBadge, etc.)
│   │   ├── layouts/              # MainLayout shell with Disclaimer Banner
│   │   ├── pages/                # 10 Dedicated Pages (SOS, Queue, Map, Fleet, Shelters, Dispatch, etc.)
│   │   ├── services/             # API client layer with simulation fallbacks
│   │   ├── types/                # Domain TypeScript models
│   │   └── App.tsx               # Route configurations
│   ├── public/                   # PWA manifest & static assets
│   ├── Dockerfile                # Production multi-stage Nginx container
│   ├── package.json
│   └── vite.config.ts
├── backend/                      # Python FastAPI application
│   ├── app/
│   │   ├── api/v1/endpoints/     # REST routes (health, events, incidents, resources, shelters, assignments, dashboard)
│   │   ├── core/                 # Config, AWS boundaries (Cognito, S3, SNS, Secrets Manager), structured logging
│   │   ├── db/                   # Session, Base, and synthetic flood data seeder
│   │   ├── models/               # SQLAlchemy 2.x models with PostGIS spatial fields
│   │   ├── repositories/         # Database access layer
│   │   ├── schemas/              # Pydantic v2 validation schemas
│   │   ├── services/             # Transaction-safe business logic & AI triage heuristics
│   │   └── main.py               # FastAPI entry point & CORS
│   ├── alembic/                  # Database migration scripts (0001_initial_schema.py)
│   ├── tests/                    # Pytest test suite (100% passing)
│   ├── Dockerfile
│   └── requirements.txt
├── infrastructure/               # Terraform Infrastructure as Code
│   └── terraform/
│       ├── modules/              # Networking, RDS PostGIS, ECS Fargate, S3 CloudFront, Cognito, SNS, IAM OIDC, CloudWatch
│       └── environments/         # dev/ and prod/ environments
├── .github/
│   └── workflows/                # ci.yml, cd.yml (OIDC), security.yml
├── docs/                         # Architecture, API spec, AWS setup guide, Roadmap
├── compose.yaml                  # Local development Docker Compose
├── .env.example                  # Environment configuration template
├── .gitignore
└── README.md
```

---

## 4. Quickstart: Local Development

### Option A: Running via Docker Compose (Recommended)

Requires Docker Desktop installed and running:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/organization/resqnet.git
   cd resqnet
   ```

2. **Copy the environment configuration:**
   ```bash
   cp .env.example .env
   ```

3. **Start the complete stack (PostGIS + FastAPI + Vite Frontend):**
   ```bash
   docker compose up --build
   ```

4. **Seed synthetic flood response demonstration data:**
   In another terminal:
   ```bash
   docker compose exec backend python -m app.db.seed
   ```

5. **Access the application:**
   * **Frontend Web App:** [http://localhost:5173](http://localhost:5173)
   * **Backend Health Check:** [http://localhost:8000/api/health](http://localhost:8000/api/health)
   * **Interactive API Documentation:** [http://localhost:8000/api/docs](http://localhost:8000/api/docs)

---

### Option B: Running Locally Outside Docker

#### 1. Backend Setup:
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install requirements
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Seed synthetic flood response data
python -m app.db.seed

# Start FastAPI development server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### 2. Frontend Setup:
```bash
cd frontend
npm install

# Start Vite dev server
npm run dev
```

---

## 5. Running Automated Tests & Quality Checks

### Backend Unit & Integration Tests:
Run the complete Pytest suite (tests incident validation, AI triage scoring, transaction safety, and conflict prevention):
```bash
# From workspace root
python -m pytest backend/tests -v
```

### Frontend Type-Checking & Production Build:
```bash
cd frontend
npm run lint    # TypeScript type-checking (tsc --noEmit)
npm run build   # Production bundle verification
```

---

## 6. Frontend Pages Guide

The web application contains 10 purpose-built screens:

1. **Public Landing Page (`/`):** Simulated disaster scenario overview, live KPI pulse, and emergency reporting entry points.
2. **Citizen SOS Form (`/sos`):** Emergency reporting wizard with trapped counts, medical flags, and GPS presets.
3. **Citizen Status Tracker (`/status`):** Real-time incident timeline and responder updates tracked by reference code.
4. **Control Room Dashboard (`/dashboard`):** Real-time telemetry, urgency distribution charts, and immediate action center.
5. **Interactive Incident Map (`/map`):** Full-screen Leaflet map displaying active flood inundation polygons, SOS beacons, shelters, and fleet.
6. **Incident Queue (`/queue`):** Triage queue with status/priority filters, search, and dispatcher status verification.
7. **Fleet & Responders Registry (`/resources`):** Fleet management for rescue boats, high-water trucks, paramedic ambulances, and drones.
8. **Shelter & Supplies Overview (`/shelters`):** Bed capacity meters, backup power, water purifiers, and relief inventory.
9. **Dispatch Review Screen (`/dispatch`):** Human-in-the-loop authorization matching nearest units with transaction-safe locking.
10. **Unserved Needs Dashboard (`/unserved`):** Bottleneck analysis identifying delayed requests, overloaded shelters, and resource shortages.

---

## 7. Cloud Deployment (AWS)

* See [docs/aws_setup_guide.md](docs/aws_setup_guide.md) for the manual preparation sequence and Terraform provisioning commands.
* See [docs/architecture.md](docs/architecture.md) for architectural sequence and topology diagrams.
* See [docs/roadmap_and_next_steps.md](docs/roadmap_and_next_steps.md) for the AWS cost model and upcoming feature roadmap.

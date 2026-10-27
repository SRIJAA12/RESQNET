# 🤝 RESQNET — Complete Collaborator & Getting Started Guide

Welcome to **RESQNET** (Intelligent Disaster Relief Coordination Ecosystem)! This document is a complete, beginner-friendly walkthrough designed for friends, teammates, and evaluators who clone this repository.

By following this guide, you will have the entire full-stack system running locally in under **5 minutes**, with access to both local microservices and live AWS serverless cloud integrations.

---

## 📑 Table of Contents
1. [Project Overview & Architecture](#1-project-overview--architecture)
2. [Prerequisites](#2-prerequisites)
3. [5-Minute Quickstart (Docker Compose)](#3-5-minute-quickstart-docker-compose)
4. [Tour of the Web Application (How to Use Every Screen)](#4-tour-of-the-web-application-how-to-use-every-screen)
5. [AWS Cloud Services Integration](#5-aws-cloud-services-integration)
   - [Option A: Use Live Cloud Sandbox (Default)](#option-a-use-the-live-cloud-sandbox-default)
   - [Option B: Deploy Your Own AWS Stack](#option-b-deploy-to-your-own-aws-account-optional)
6. [Alternative: Running Locally Outside Docker](#6-alternative-running-locally-outside-docker)
7. [Running Automated Tests](#7-running-automated-tests)
8. [Troubleshooting & FAQs](#8-troubleshooting--faqs)

---

## 1. Project Overview & Architecture

RESQNET coordinates emergency disaster response during severe weather and flooding events. It bridges two worlds:
1. **Public Citizens:** Fast, lightweight, mobile-responsive emergency SOS reporting that works reliably even during extreme network stress.
2. **Emergency Control Room Responders:** Dispatchers, rescue boat operators, shelter managers, and logistics coordinators.

### High-Level Architecture Diagram
```
┌────────────────────────────────────────────────────────────────────────┐
│                          RESQNET FRONTEND                              │
│                    (React 18 + Vite + TailwindCSS)                     │
│                        http://localhost:5174                           │
└──────────────────┬─────────────────────────────────┬───────────────────┘
                   │                                 │
         Local REST & PostGIS              Public Citizen SOS
         (Dispatcher Operations)             (Cloud Pipeline)
                   │                                 │
                   ▼                                 ▼
┌──────────────────────────────────────┐  ┌──────────────────────────────┐
│            FASTAPI BACKEND           │  │   AWS API GATEWAY (HTTP)     │
│         http://localhost:8001        │  │       (eu-west-1)            │
└──────────────────┬───────────────────┘  └──────────────┬───────────────┘
                   │                                     │
                   ▼                                     ▼
┌──────────────────────────────────────┐  ┌──────────────────────────────┐
│         POSTGRESQL + POSTGIS         │  │     AWS LAMBDA (Python)      │
│         Spatial Geospatial DB        │  │   PublicIncidentsFunction    │
│            localhost:5433            │  └──────────────┬───────────────┘
└──────────────────────────────────────┘                 │
                                                         ▼
                                          ┌──────────────────────────────┐
                                          │      AMAZON DYNAMODB         │
                                          │     resqnet-core-table       │
                                          └──────────────────────────────┘
```

---

## 2. Prerequisites

You only need **two tools** installed on your computer to run the entire system:
* **[Docker Desktop](https://www.docker.com/products/docker-desktop/)** (Windows, macOS, or Linux) — ensure Docker Desktop is open and running.
* **[Git](https://git-scm.com/)** — to clone the codebase.

*(Optional)* If you plan to modify code locally outside Docker:
* Python 3.11+
* Node.js 18+ & npm
* [AWS CLI](https://aws.amazon.com/cli/) & [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html) (only needed if deploying to your personal AWS account)

---

## 3. 5-Minute Quickstart (Docker Compose)

The repository is pre-configured with zero-configuration defaults. You don't even need to create a `.env` file to begin!

### Step 1: Clone the Repo
Open your terminal (PowerShell, Command Prompt, or Bash) and run:
```bash
git clone https://github.com/SRIJAA12/RESQNET.git
cd RESQNET
```

### Step 2: Build & Start All Containers
```bash
docker compose up --build
```
> [!NOTE]
> Docker will automatically download base images, install all dependencies, configure the PostGIS spatial database, and launch both frontend and backend.
> When you see logs indicating `GET /api/health -> 200 OK`, all containers are healthy!

### Step 3: Populate Demo Flood Simulation Data
Keep the first terminal running. Open a **second terminal window** in the same `RESQNET` directory and run:
```bash
docker compose exec backend python -m app.db.seed
```
This script injects realistic synthetic flood telemetry:
* 10+ trapped citizen SOS reports with GPS coordinates around the Riverbend flood basin
* 5 rescue fleets (Zodiac inflatable boats, 4x4 high-water trucks, paramedic ambulances)
* 3 relief shelters with live bed occupancy meters and supply inventories

### Step 4: Open in Your Browser!
* 🚀 **Web App (React Dashboard):** [http://localhost:5174](http://localhost:5174)
* 📖 **Backend API Documentation (Swagger):** [http://localhost:8001/api/docs](http://localhost:8001/api/docs)
* 🩺 **Backend Health Endpoint:** [http://localhost:8001/api/health](http://localhost:8001/api/health)

---

## 4. Tour of the Web Application (How to Use Every Screen)

Open **[http://localhost:5174](http://localhost:5174)** to test these 10 purpose-built screens:

### 1. 🆘 Citizen Emergency SOS (`/sos`)
* **What it does:** Allows affected citizens to rapidly request immediate rescue, food/water, medical evacuation, or shelter.
* **How to test:** 
  1. Click **Report Emergency (SOS)** in the navbar.
  2. Fill out victim count, medical triage flags, and description (or click the quick presets).
  3. Click **Transmit SOS Request**.
  4. This sends a real request directly to the **AWS API Gateway & DynamoDB**!
  5. You will receive an incident ID (e.g. `inc-b695...`) and an official tracking code (e.g. `SOS-2026-FLOOD-G5C6`). Copy this code!

### 2. 🔍 Citizen Incident Tracker (`/status`)
* **What it does:** Allows citizens to check their rescue status in real-time without calling dispatch.
* **How to test:** 
  1. Click **Track Status** in the navigation bar.
  2. Paste the reference code you copied above (e.g., `SOS-2026-FLOOD-G5C6`).
  3. Click **Search Incident**. The frontend queries AWS DynamoDB and renders the timestamped audit history and priority score.

### 3. 🗺️ Situational Operations Map (`/map`)
* **What it does:** Visualizes real-time disaster spatial data: flood inundation polygons, SOS beacons, shelters, and mobile rescue teams.
* **Interactive Features:**
  * **Layer Switcher (Top Right):** Switch between **Tactical Dark** (clean OSM dark theme), **Satellite** (high-res ESRI satellite imagery), and **Streets** (full color).
  * **Filter Toggles:** Filter by Critical Only, Active Shelters, Rescue Fleet, or Flood Mesh.
  * **Interactive Markers:** Click any marker to open its telemetry card.

### 4. 📊 Control Room Dashboard (`/dashboard`)
* **What it does:** Mission control summary displaying active incidents, available fleets, shelter occupancy percentage, and pending dispatch actions.

### 5. 📋 Incident Triage Queue (`/queue`)
* **What it does:** Lists all active incidents sorted by priority. Includes automated AI triage scoring (calculating risk based on water depth, vulnerable individuals, and medical distress).
* **How to test:** Filter by status (`Submitted`, `Verified`, `Dispatched`, `Resolved`) or search by victim name.

### 6. 🚤 Fleet & Responders Registry (`/resources`)
* **What it does:** Tracks all rescue vehicles and personnel (Zodiac boats, drones, high-water trucks, paramedic teams). Shows status (`Available`, `Dispatched`, `Maintenance`).

### 7. 🏠 Shelter Capacity & Relief Supplies (`/shelters`)
* **What it does:** Real-time capacity tracker for community shelters. Displays total vs occupied beds, medical staff, backup power generators, and potable water reserves.

### 8. ⚡ Dispatch Review Center (`/dispatch`)
* **What it does:** Human-in-the-loop authorization center. Dispatchers select an incident and match it with the closest available vehicle using database row-level locking to prevent double-booking.

### 9. ⚠️ Unserved Needs & Bottleneck Analysis (`/unserved`)
* **What it does:** Identifies delayed requests, overloaded shelters, and unfulfilled medical supplies to prevent logistical blind spots.

---

## 5. AWS Cloud Services Integration

RESQNET uses a hybrid architecture: operational management runs on FastAPI/PostGIS, while the citizen SOS ingest pipeline is serverless on AWS (AWS SAM, API Gateway, Lambda, DynamoDB).

### Option A: Use the Live Cloud Sandbox (Default)
**You don't need an AWS account!** 
`compose.yaml` is pre-configured with the project's live AWS deployment:
* **Endpoint:** `https://ncwcst8z63.execute-api.eu-west-1.amazonaws.com/v1`
* **Region:** `eu-west-1`
* **Table:** `resqnet-core-table`

Whenever you submit or track an SOS on `/sos` or `/status`, it communicates with this live AWS serverless infrastructure automatically.

---

### Option B: Deploy to Your Own AWS Account (Optional)
If you wish to spin up your own isolated AWS serverless backend:

1. **Prerequisites:**
   * Configure AWS CLI credentials: `aws configure`
   * Verify SAM CLI is installed: `sam --version`
2. **Build and Deploy:**
   ```bash
   sam build
   sam deploy
   ```
   *(All IAM permissions, CloudFormation stack configs, and table settings are pre-saved in `samconfig.toml`).*
3. **Connect Frontend to Your Deployed Stack:**
   Create or edit `frontend/.env` (use `frontend/.env.example` as a template):
   ```env
   VITE_API_BASE_URL=http://localhost:8001/api
   VITE_SERVERLESS_API_URL=https://<your-api-id>.execute-api.<region>.amazonaws.com/v1
   ```
4. Restart your frontend container:
   ```bash
   docker compose restart frontend
   ```

---

## 6. Alternative: Running Locally Outside Docker

If you prefer to run services bare-metal without Docker:

### 1. Run PostgreSQL with PostGIS
Ensure a local PostGIS database is running on port `5433` (or `5432`) with database name `resqnet_db`.

### 2. Start FastAPI Backend
```bash
cd backend

# Create virtual environment
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
alembic upgrade head

# Seed synthetic flood demo data
python -m app.db.seed

# Start development server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 3. Start React Frontend
In another terminal:
```bash
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## 7. Running Automated Tests

To run the full suite of automated unit, integration, and type-checking tests:

```bash
# 1. Backend Core & Service Tests
python -m pytest backend/tests -v

# 2. Serverless Lambda & DynamoDB Tests
python -m pytest backend_serverless/tests -v

# 3. Frontend TypeScript Validation
cd frontend
npm run lint

# 4. Frontend Production Build Check
npm run build
```

---

## 8. Troubleshooting & FAQs

### Q: Port 8001, 5174, or 5433 is already in use on my machine.
**A:** You can customize the exposed ports without touching code by creating a `.env` file in the root directory:
```env
BACKEND_PORT=8005
FRONTEND_PORT=5180
POSTGRES_PORT=5435
```
Then rerun: `docker compose up --build`.

### Q: Why is my map completely black or showing an error?
**A:** Check your internet connection. Map tiles are fetched from OpenStreetMap and ESRI World Imagery. In [`LeafletMap.tsx`](file:///d:/RESQNET/frontend/src/components/LeafletMap.tsx), use the layer switcher in the top right to switch between **Tactical Dark**, **Satellite**, and **Streets**.

### Q: How do I completely wipe and reset the local database?
**A:** Stop the containers and remove the database volume:
```bash
docker compose down -v
docker compose up --build
docker compose exec backend python -m app.db.seed
```

### Q: Is this connected to official emergency services?
**A:** **No.** RESQNET is designed as an educational, simulated disaster training platform. All telephone numbers, victim names, and flood scenarios are 100% fictional.

---

**Need help?** Check the master architectural documentation in [`docs/RESQNET_MASTER_PROJECT_DOCUMENTATION.md`](RESQNET_MASTER_PROJECT_DOCUMENTATION.md) or open an issue on GitHub!

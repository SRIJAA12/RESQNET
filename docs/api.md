# RESQNET — REST API Documentation

Base URL (Local): `http://localhost:8000/api`  
Interactive OpenAPI UI: `http://localhost:8000/api/docs`  
ReDoc UI: `http://localhost:8000/api/redoc`  
OpenAPI JSON Schema: `http://localhost:8000/api/openapi.json`

---

## 1. Health & Readiness

### `GET /api/health`
Inspects application health and verifies PostgreSQL database connectivity without leaking credentials or infrastructure topology.

**Response `200 OK`:**
```json
{
  "status": "healthy",
  "app_name": "RESQNET — Intelligent Disaster Relief Ecosystem",
  "version": "0.1.0",
  "environment": "development",
  "timestamp": "2026-10-14T21:48:00.123456Z",
  "components": {
    "application": "healthy",
    "database": "healthy"
  }
}
```

---

## 2. Disaster Events

### `GET /api/v1/events`
Lists all declared disaster operations.
* **Query Parameters:** `active_only` (boolean, optional)

### `POST /api/v1/events`
Initializes a new disaster operation (requires `dispatcher` role).

**Request Body:**
```json
{
  "name": "Riverbend Metro Flash Flood (Simulated)",
  "disaster_type": "flood",
  "status": "active",
  "severity": "severe",
  "affected_region_name": "Riverbend Valley Sectors A & B",
  "description": "Simulation exercise scenario testing flood defense coordination."
}
```

---

## 3. Citizen SOS & Incidents

### `POST /api/v1/incidents`
Public Citizen SOS submission endpoint. Generates a unique tracking reference code and calculates an advisory AI triage score.

**Request Body:**
```json
{
  "reporter_name": "Sunita Sharma (Simulated)",
  "reporter_contact": "555-017-9141",
  "reporter_is_victim": true,
  "disaster_type": "flood",
  "people_count": 3,
  "trapped_count": 3,
  "medical_assistance_needed": true,
  "special_needs_description": "Elderly diabetic grandmother, water entered 1st floor",
  "description": "Water is 1.8m deep and rising rapidly. Trapped on rooftop with no clean water.",
  "address_text": "Plot 42, River Creek Colony, Sector B",
  "latitude": 28.5710,
  "longitude": 77.2390
}
```

**Response `201 Created`:**
```json
{
  "success": true,
  "message": "Emergency SOS received. Dispatchers have been alerted.",
  "data": {
    "id": "e93a7d42-0f04-43cb-93b5-4b071239c012",
    "reference_code": "SOS-2026-FLOOD-8492",
    "status": "submitted",
    "priority": "critical",
    "ai_triage_score": 85.0,
    "ai_suggested_priority": "critical",
    "ai_recommendation_notes": "AI Triage Score: 85.0/100 -> CRITICAL. Trapped above rising water; medical urgent. [Advisory: Requires human dispatcher verification]",
    "created_at": "2026-10-14T21:45:00.000Z"
  }
}
```

### `GET /api/v1/incidents/ref/{reference_code}`
Fetches incident telemetry and historical activity logs by citizen tracking reference code.

### `GET /api/v1/incidents`
Paginated search and filter endpoint for control rooms.
* **Query Parameters:** `status`, `priority`, `search`, `page`, `page_size`

### `PATCH /api/v1/incidents/{incident_id}/status`
Transitions an incident through its lifecycle (requires `dispatcher` role).
Allowed transitions: `submitted` &rarr; `under_review` &rarr; `verified` &rarr; `assigned` &rarr; `in_progress` &rarr; `resolved` | `rejected`.

**Request Body:**
```json
{
  "status": "verified",
  "notes": "Situation confirmed via drone telemetry."
}
```

---

## 4. Rescue Fleet & Resources

### `GET /api/v1/resources`
Lists rescue units. Filter by `status` (`available`, `deployed`, `maintenance`) and `resource_type` (`boat`, `evacuation_truck`, `ambulance`, `drone`).

### `POST /api/v1/resources`
Registers a new response craft or team (requires `dispatcher` role).

---

## 5. Shelter Registry & Capacity

### `GET /api/v1/shelters`
Returns registered emergency shelters, total capacity, current occupancy, and computed `available_beds`.

### `PATCH /api/v1/shelters/{shelter_id}`
Updates live occupancy count and records a historical capacity snapshot.

---

## 6. Resource Assignments (Transaction-Safe)

### `POST /api/v1/assignments`
Authorizes and locks a rescue unit to an incident.
* **Constraint:** Uses database row-locking (`SELECT ... FOR UPDATE`) to guarantee that a unit cannot be concurrently assigned to multiple active incidents.
* **Conflict Prevention:** Returns `409 Conflict` if the resource is already in an active assignment (`proposed`, `approved`, or `dispatched`).

**Request Body:**
```json
{
  "incident_id": "e93a7d42-0f04-43cb-93b5-4b071239c012",
  "resource_id": "c109dfb3-764f-4d64-8fe4-99890bc41d99",
  "dispatcher_notes": "Immediate boat dispatch. Prioritize oxygen patient.",
  "auto_dispatch": true
}
```

---

## 7. Control Room Dashboard

### `GET /api/v1/dashboard/summary`
Returns aggregated real-time metrics, active emergencies count, fleet availability, shelter occupancy percentage, unassigned verified incidents, and a list of unresolved critical bottlenecks.

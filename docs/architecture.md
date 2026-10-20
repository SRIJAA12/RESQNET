# RESQNET — Architecture & System Design

RESQNET is an intelligent disaster relief coordination and resource management ecosystem designed to unite citizens, multi-agency rescue teams, NGOs, shelters, and authorized control-room dispatchers during major catastrophe events.

The initial operational scenario is a **simulated flood response** in an urban river basin, engineered to generalize across future disaster types such as cyclones, landslides, heatwaves, and structural emergencies.

---

## 1. Core Architectural Workflow

```mermaid
sequenceDiagram
    autonumber
    actor Citizen as Citizen / Community Reporter
    participant Web as RESQNET Web Portal (React + Vite)
    participant API as FastAPI Backend (ECS Fargate)
    participant AI as Assistive AI Triage Engine
    participant DB as PostgreSQL + PostGIS (RDS)
    actor Dispatcher as Authorized Human Dispatcher
    participant SNS as AWS SNS (Emergency Topic)
    actor Responder as Rescue Unit / Boat Crew
    participant Shelter as Shelter Facility

    Citizen->>Web: Submit SOS (Headcount, Trapped, Medical, GPS)
    Web->>API: POST /api/v1/incidents
    API->>AI: Evaluate Vulnerability Heuristic
    AI-->>API: Triage Score (0-100) & Advisory Priority
    API->>DB: Persist Incident & Initial Status History
    API-->>Citizen: Issue Unique Reference Code (SOS-2026-FLOOD-XXXX)

    Dispatcher->>Web: Open Control Room & Dispatch Review
    Web->>API: GET /api/v1/dashboard/summary & /api/v1/incidents
    API->>DB: Query Active Incidents & Candidate Fleet
    DB-->>API: Return Spatial Telemetry
    API-->>Web: Render Incident Map & Match Recommendations

    Note over Dispatcher: Mandatory Human Authorization Boundary.<br/>AI never dispatches units autonomously.

    Dispatcher->>Web: Confirm Assignment & Input Dispatch Notes
    Web->>API: POST /api/v1/assignments
    critical Transaction-Safe Lock
        API->>DB: SELECT * FROM resources WHERE id = :id FOR UPDATE
        API->>DB: Verify No Conflicting Active Assignments (PROPOSED/APPROVED/DISPATCHED)
        API->>DB: Create Assignment & Set Resource -> DEPLOYED
        API->>DB: Set Incident -> ASSIGNED / IN_PROGRESS
        API->>DB: Record Incident Status History & Audit Event
    end
    API->>SNS: Publish Dispatch Notification
    SNS-->>Responder: SMS / Push Alert with GPS & Hazard Notes
    API-->>Web: 201 Created & Lock Released

    Responder->>Web: Update Status & Evacuation Headcount
    Responder->>Shelter: Transport Evacuees to Receiving Center
    Shelter->>Web: PATCH /api/v1/shelters/{id} (Update Occupancy)
    Dispatcher->>Web: Verify Evacuation -> Mark Incident RESOLVED
```

---

## 2. Safety & Governance Principles

1. **Human-in-the-Loop Dispatch**:
   AI algorithms evaluate water level depths, trapped status, infant/elderly vulnerabilities, and proximity. However, **AI is strictly advisory**. The platform requires an authorized human dispatcher with role-level credentials to approve every vehicle dispatch, evacuation route, or medical assignment.
2. **Transaction-Safe Fleet Locking**:
   To prevent race conditions where two operators dispatch the same boat or medical truck simultaneously, backend assignment operations execute inside a database transaction with row-level locks (`SELECT ... FOR UPDATE`). Conflicting active assignments are rejected with HTTP 409 Conflict.
3. **Auditability**:
   Every state transition across incidents, assignments, and capacity updates produces immutable records in `incident_status_history` and `audit_events`, capturing timestamps, previous/new states, notes, and the actor's user identifier.
4. **Synthetic Data Integrity**:
   Demonstration datasets use fictional coordinates, simulated phone numbers (555-xxx), and fictional basin names to ensure no confusion with real-world 911/emergency facilities.

---

## 3. Technology Stack & AWS Topology

```mermaid
graph TB
    subgraph Users
        Citizen[Citizen / Community]
        Dispatcher[Control Room Operator]
        Team[Rescue Teams / Shelters]
    end

    subgraph AWS Cloud Delivery
        CF[Amazon CloudFront CDN]
        S3Front[Amazon S3 Static SPA Bucket]
        ALB[Application Load Balancer]
        OIDC[GitHub Actions OIDC Provider]
    end

    subgraph VPC [Amazon VPC - Private Networking]
        subgraph PublicSubnets [Public Subnets across 2 AZs]
            NAT[NAT Gateway]
            ALB
        end

        subgraph PrivateSubnets [Private Subnets across 2 AZs]
            subgraph ECSCluster [Amazon ECS / AWS Fargate]
                BackendTask1[FastAPI Container 1]
                BackendTask2[FastAPI Container 2]
            end

            subgraph DatabaseTier [Private Database Subnet Group]
                RDS[(Amazon RDS PostgreSQL + PostGIS<br/>Multi-AZ)]
            end
        end
    end

    subgraph Supporting AWS Services
        Cognito[Amazon Cognito User Pool]
        S3Attach[Amazon S3 Incident Attachments]
        SNS[Amazon SNS Alert Topics]
        CW[Amazon CloudWatch Logs & Alarms]
        Secrets[AWS Secrets Manager]
    end

    Citizen --> CF
    Dispatcher --> CF
    Team --> CF
    CF --> S3Front
    CF --> ALB
    ALB --> BackendTask1
    ALB --> BackendTask2
    BackendTask1 --> RDS
    BackendTask2 --> RDS
    BackendTask1 --> Secrets
    BackendTask1 --> S3Attach
    BackendTask1 --> SNS
    BackendTask1 --> CW
    BackendTask1 -.-> NAT
    OIDC -. Deploy .-> ECSCluster
    OIDC -. Sync .-> S3Front
```

---

## 4. Key Database Schema Entities

* **`DisasterEvent`**: Declaration date, disaster type (flood, cyclone, landslide, etc.), status, severity, boundary polygon.
* **`Incident`**: Citizen SOS ticket, reference code, headcount, trapped count, medical assistance urgent toggle, PostGIS geometry point, AI advisory score, status history relationship.
* **`Resource`**: Boats, trucks, ambulances, drones; operational capacity, battery/fuel status, crew lead, current PostGIS coordinates.
* **`ResourceAssignment`**: Transaction-safe linkage between incident and resource, status lifecycle (`proposed`, `approved`, `dispatched`, `completed`, `cancelled`), dispatcher notes, timestamps.
* **`Shelter`**: Facility capacity, live occupancy, available beds, backup generator status, water purification capacity, medical post indicator.
* **`AuditEvent`**: Detailed event log of every critical system modification.

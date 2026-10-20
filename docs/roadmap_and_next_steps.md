# RESQNET — Production Roadmap, Mocked Features & Cloud Cost Model

This document outlines the current baseline state, features operating in mock/development mode, anticipated AWS cloud operational costs, and the prioritized roadmap for the next development milestones.

---

## 1. Mocked & Local Development Features

| Feature / Integration | Local / Baseline Mode | Production Target Implementation |
|---|---|---|
| **Authentication & RBAC** | Local mock bearer tokens (`citizen-token`, `dispatcher-token`, `responder-token`) with dev fallback dispatcher | Amazon Cognito JWT signature validation via JWKS, server-side group authorization (`cognito:groups`) |
| **Incident Attachments (S3)** | Local HTTP endpoint (`/api/mock-storage/{bucket}/{key}`) simulating binary upload | Short-lived presigned PUT URLs via AWS S3 SDK with strict MIME/size validation |
| **Emergency Alerts (SNS)** | Local logger output (`[MOCK SNS] Published dispatch notification...`) | Amazon SNS Topic publishing SMS / push / email to subscribed responder units |
| **Secrets Resolution** | Local `.env` / environment variable lookup | AWS Secrets Manager runtime client with local caching and automated rotation |
| **Geospatial Processing** | PostGIS `Geometry('POINT', 4326)` on PostgreSQL; fallback to float `latitude`/`longitude` on SQLite | Native PostGIS spatial queries (`ST_DWithin`, `ST_Contains`) on Amazon RDS PostGIS |
| **Live Dispatch Routing** | Euclidean coordinate distance calculation with road condition heuristics | AWS Location Service / OpenStreetMap OSRM routing engine with flood hazard avoidance |

---

## 2. Estimated AWS Cloud Operational Costs

| Component | AWS Resource | Dev / Staging Cost (Monthly) | Production Cost (Monthly) | Cost Optimization Strategy |
|---|---|---|---|---|
| **Backend Compute** | ECS on AWS Fargate | ~$25 (2 tasks x 0.5 vCPU, 1 GB) | ~$90 (4 tasks x 1.0 vCPU, 2 GB) | Use Fargate Spot for non-critical worker tasks |
| **Load Balancing** | Application Load Balancer (ALB) | ~$18 (1 ALB + LCU usage) | ~$25 (Multi-AZ traffic) | Consolidate microservices behind single ALB |
| **Database** | Amazon RDS PostgreSQL | ~$30 (`db.t4g.medium`, Single-AZ) | ~$160 (`db.r6g.large`, Multi-AZ) | Scale down dev RDS off-hours using AWS Instance Scheduler |
| **Static Frontend & CDN** | CloudFront + S3 | <$3 (Low egress, free tier) | ~$15 (Traffic dependent) | Cache immutable assets with 1-year TTL |
| **NAT Gateway** | VPC NAT Gateway | ~$32 (1 NAT Gateway in 1 AZ) | ~$65 (Multi-AZ NAT Gateways) | Use VPC Endpoints for S3, ECR and CloudWatch to bypass NAT egress |
| **Secrets & Telemetry** | Secrets Manager + CloudWatch | ~$5 (Logs & 2 secrets) | ~$15 (Detailed log volume) | Set 14-day log retention for dev; 90-day for prod |
| **Total Estimated Cost** | &mdash; | **~$113 / month** | **~$370 / month** | &mdash; |

---

## 3. Recommended Implementation Milestones

### Milestone 1: Production AWS Deployment & Cognito Handshake (Next Step)
* Connect production frontend to Amazon Cognito Hosted UI / PKCE flow.
* Configure live Amazon S3 bucket for incident photo attachments with virus scanning (ClamAV in Lambda).
* Deploy Terraform development environment and run smoke tests against live ALB.

### Milestone 2: Live GPS Telemetry & Responder Mobile PWA
* Implement WebSocket / Server-Sent Events (SSE) for real-time dispatch queue updates without manual polling.
* Add responder GPS telemetry tracking endpoint (`POST /api/v1/resources/{id}/location`).
* Offline map tile caching for responders operating in intermittent connectivity zones.

### Milestone 3: Multi-Hazard Expansion
* Generalize hazard models to support:
  * **Cyclones**: Wind speed zones, storm surge tracking.
  * **Landslides**: Slope stability risk polygons, blocked road clearing.
  * **Heatwaves**: High-vulnerability cooling center routing, dehydration triage.
* Integration with national meteorological and hydrologic sensor feeds (e.g. USGS, Copernicus, regional flood gauges).

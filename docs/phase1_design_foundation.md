# RESQNET — Phase 1: Design Foundation & Information Architecture Specification

**Project:** RESQNET — Intelligent Disaster Relief Coordination and Resource Management Ecosystem  
**Phase:** 1 of 7 — Design Foundation and Information Architecture  
**Design System:** Storm Command  
**Status:** Approved & Implemented in Foundation Layer  

---

## 1. Stitch MCP Project & Asset Audit Summary

### 1.1 Project Metadata
* **Google Stitch Project ID:** `projects/8629955777739521073`
* **Title:** `"RESQNET Design System & Shell"`
* **Project Type:** `TEXT_TO_UI_PRO`
* **Active Design Theme:** `Storm Command` (Dark Mode, Roundness: Level 1/Soft, Primary Color: `#36D6C4`)
* **Typography Pairing:** `Manrope` (Display/Headlines), `Inter` (Body/Narrative), `IBM Plex Mono` (Labels/Telemetry)

### 1.2 Available Stitch Screens & MCP Editability

| Screen Title | Screen ID | Form Factor | Dimensions | Editable via MCP (`edit_screens`) |
| :--- | :--- | :--- | :--- | :--- |
| **Screen 1 — Operations Application Shell** | `b39bb4fbe11b47e29097605f48061eec` | Desktop | 2560 × 2562 | **Yes** (`edit_screens`) |
| **Screen 2 — Disaster Command Center** | `d47e8ebbb59f4711bf64e10193d1f54f` | Desktop | 2560 × 2396 | **Yes** (`edit_screens`) |
| **Screen 3 — Live Disaster Map** | `b9cc09da28ef487b98cb131ee8c373cc` | Desktop | 2560 × 2048 | **Yes** (`edit_screens`) |
| **Screen 4 — Incident Management** | `4c097e5ccba84e6ca396bf72438bc401` | Desktop | 2560 × 2800 | **Yes** (`edit_screens`) |
| **Screen 5 — Citizen Assistance** | `8525ad9c23d745bb8ace362c797834c0` | Desktop | 2560 × 5252 | **Yes** (`edit_screens`) |
| **Storm Command Design System Specimen** | `c7e0500ecb0c4ea59746bf60224f0472` | Desktop | 2560 × 3032 | **Yes** (`edit_screens`) |
| **RESQNET Information Architecture & Sitemap** | `1edd09a72c184fedbde0b8502fbaa4fc` | Desktop | 2560 × 2774 | **Yes** (`edit_screens`) |
| **RESQNET Application Shell** | `48f90b73c48342d680bfaca79c05233d` | Desktop | 2560 × 2208 | **Yes** (`edit_screens`) |
| **RESQNET Citizen Assistance (Public Mode)** | `a1cd1f5d6c664316ad2b454cea75c38c` | Desktop | 2560 × 4164 | **Yes** (`edit_screens`) |
| **RESQNET Live Command Shell** | `7067329994e148d2bd6cf6342d03ce2b` | Mobile | 780 × 3046 | **Yes** (`edit_screens`) |
| **RESQNET Information Architecture & Sitemap** | `c1ec5d91d70643fcbfaa716c5bb89180` | Mobile | 780 × 5350 | **Yes** (`edit_screens`) |
| **Storm Command Design System Specimen** | `269358e9db0044d4994b2a8f157f121e` | Mobile | 780 × 7090 | **Yes** (`edit_screens`) |
| **RESQNET Citizen Assistance (Public Mode)** | `cfc3467e91774d48b6014f22f23a328f` | Mobile | 780 × 5236 | **Yes** (`edit_screens`) |

---

## 2. Storm Command Design Tokens Specification

The Storm Command design system synthesizes mission-critical telemetry density with tactical scannability under emergency pressure.

### 2.1 Color Tokens

#### Operational Dark Theme (Default)
* **Surface Base (Canvas Bedrock):** `#0B1220` (Midnight Navy) — Viewport floor, spatial radar backgrounds.
* **Surface Container (Panels & Tables):** `#111C2B` — Primary container surface for lists, telemetry feeds, and data grids.
* **Surface Raised (Cards & Sidebar):** `#172638` (Deep Slate) — Raised cards, 248px/72px sidebar, header bars.
* **Surface Highlight (Hover/Active):** `#1F344D` — Hover states for actionable cards and active navigation containers.
* **Border Subtle (Structural Outlines):** `#26394D` — Strict 1px structural container boundary.
* **Border Active:** `#36D6C4` — 2px highlight for active triage state and selected panels.

#### Semantic Status & Telemetry Indicators
* **Signal Cyan (Primary Operational):** `#36D6C4` — Brand primary, interactive buttons, active map overlays.
* **Critical Coral (Emergency / Life Threat):** `#FF6268` — SOS submissions, trapped casualties, breach zones.
* **Alert Amber (Deficit / Warning):** `#FFB547` — Near-capacity shelters (>90%), bottleneck shortages, storm warnings.
* **Success Emerald (Secured / Ready):** `#65D6A6` — Evacuated civilians, ready fleet units, verified requests.
* **Info Azure (Comms & Sensors):** `#79B8FF` — Hydrological sensor feeds, communication channels, neutral beacons.

#### Typography Contrast Tokens
* **Cloud White (`textPrimary`):** `#F4F5F2` — High-contrast display headings and primary figures.
* **Text Secondary (`textSecondary`):** `#B8C6D4` — Interface narrative, body text, and descriptions.
* **Text Muted (`textMuted`):** `#8798AA` — Monospace tags, labels, and metadata captions.

#### Public Light Theme (Civilian Distress Mode)
* **Surface Base:** `#F8FAFC`
* **Surface Container:** `#FFFFFF`
* **Surface Raised:** `#F1F5F9`
* **Border Subtle:** `#CBD5E1`
* **Text Primary:** `#0F172A`
* **Text Secondary:** `#334155`
* **Signal Cyan:** `#0D9488` (High-contrast outdoor teal for sunlight legibility)

### 2.2 Typography Scale & Fonts

* **Display & Major Headings:** `Manrope` (600, 700, 800)
  * `headline-xl`: 40px (2.5rem) / Line-height: 1.15 / Letter-spacing: -0.03em
  * `headline-lg`: 30px (1.875rem) / Line-height: 1.2 / Letter-spacing: -0.025em
  * `headline-md`: 22px (1.375rem) / Line-height: 1.3 / Letter-spacing: -0.015em
  * `headline-sm`: 18px (1.125rem) / Line-height: 1.35 / Letter-spacing: -0.01em
* **Interface & Body Narrative:** `Inter` (400, 500, 600)
  * `body-lg`: 17px (1.0625rem) / Line-height: 1.6
  * `body-md`: 15px (0.9375rem) / Line-height: 1.5
  * `body-sm`: 13px (0.8125rem) / Line-height: 1.45
* **Telemetry, Coordinates, Metadata, Status Tags:** `IBM Plex Mono` (400, 500, 600)
  * `label-lg`: 14px (0.875rem) / Line-height: 1.25 / Letter-spacing: 0.04em
  * `label-md`: 12px (0.75rem) / Line-height: 1.3 / Letter-spacing: 0.06em
  * `label-sm`: 11px (0.6875rem) / Line-height: 1.2 / Letter-spacing: 0.08em

### 2.3 Spacing, Radius, Borders, Focus & Motion

* **Spacing Grid:**
  * `space-xs`: 4px (`0.25rem`) — Micro icon-to-label gaps
  * `space-sm`: 8px (`0.5rem`) — Compact list padding, chip gaps
  * `space-md`: 16px (`1rem`) — Card internal padding, form rhythm
  * `space-lg`: 24px (`1.5rem`) — Section stacking, grid gutters
  * `space-xl`: 40px (`2.5rem`) — Page-level module separation
* **Border Radii:**
  * `sm`: 2px — Small badges and status chips
  * `default`: 4px — Standard buttons, form fields, and table cells
  * `md`: 6px — Dropdown panels, alerts, and toolbars
  * `lg`: 8px — Primary operational cards and modal containers
  * `full`: 9999px — Reserved strictly for pulsing status pills
* **Focus & Ambient Lighting:**
  * Focus Ring: `0 0 0 2px #36D6C4` with `offset-1 #0B1220`
  * Active Beacon Glow: `0 0 20px rgba(54, 214, 196, 0.25)`
  * Critical Beacon Glow: `0 0 20px rgba(255, 98, 104, 0.25)`
* **Motion & Transitions:**
  * Fast: `150ms cubic-bezier(0.4, 0, 0.2, 1)` (hover states, buttons)
  * Normal: `250ms cubic-bezier(0.4, 0, 0.2, 1)` (drawer slides, dropdowns)
  * Slow: `400ms cubic-bezier(0.4, 0, 0.2, 1)` (sidebar expansion/collapse)

---

## 3. Component Inventory

The following 14 core components have been established in the codebase (`frontend/src/components/ui/` and `components/`):

1. **Sidebar (`Sidebar.tsx`):**
   * Desktop Expanded: `248px` | Desktop Collapsed: `72px`.
   * Surface: Deep Slate (`#172638`) with 1px border (`#26394D`).
   * Grouped navigation categories with active cyan-tinted highlight (`bg-cyan/15`) and 2px left border.
   * Icon size standardized at 18–20 px.
   * Collapsed mode includes accessible floating tooltips and discoverable toggle button.
   * Integrated Role Switcher and Citizen SOS escape trigger.
2. **Operations Header (`OpsLayout.tsx`):**
   * Sticky 60px header in Deep Slate with backdrop blur.
   * Scenario selector, `[DEMO / SIMULATION]` indicator tag, global search trigger (`⌘K`), notifications bell dropdown, and user menu.
3. **Navigation Item (`NavLink` in `Sidebar.tsx`):**
   * Accessible link with active route matching, icon slot, label slot, and live badge counter.
4. **Breadcrumb (`Breadcrumb.tsx`):**
   * Monospaced hierarchical path trail with home icon and cyan active step indicator.
5. **Button (`Button.tsx`):**
   * Variants: `primary` (Signal Cyan), `secondary` (Deep Slate), `danger` (Critical Coral), `outline`, `ghost`.
   * States: Default, Hover (with ambient glow), Active, Disabled, Loading (with spinner).
6. **Input (`Input.tsx`):**
   * Tactical input field on `#0B1220` surface with IBM Plex Mono uppercase label and cyan focus ring.
7. **Badge / Chip (`Badge.tsx`):**
   * Monospace uppercase status chips with optional pulsing radar indicator (Cyan, Coral, Amber, Emerald, Azure).
8. **Card (`Card.tsx`):**
   * Structured container in `#111C2B` or `#172638` with 1px border `#26394D` and header action slot.
9. **Table (`Table.tsx`):**
   * Dense data table with sticky Deep Slate header, tabular monospace numbers, and hover row highlighting.
10. **Drawer (`Drawer.tsx`):**
    * Slide-over telemetry sheet from right edge with backdrop blur and escape key listener.
11. **Dialog / Modal (`Dialog.tsx`):**
    * Accessible modal dialog (`aria-modal="true"`) with backdrop blur and keyboard escape listener.
12. **Toast (`Toast.tsx`):**
    * Floating operational notification pill with severity icons and dismiss action.
13. **Skeleton (`Skeleton.tsx`):**
    * Shimmer pulse loading placeholder for cards, tables, and telemetry feeds.
14. **Empty State (`EmptyState.tsx`):**
    * Fallback component with icon, uppercase title, description, and action CTA.

---

## 4. Route and Role Matrix

### 4.1 Layout Shell Partitioning

```
                             RESQNET Platform
                                    │
          ┌─────────────────────────┴─────────────────────────┐
          ▼                                                   ▼
   Public Citizen Mode                               Storm Command Mode
 (MainLayout: Top Bar, Sunlight)                  (OpsLayout: 248px/72px Sidebar)
   - / (Home Overview)                              - /ops/command-center, /dashboard
   - /sos, /request-assistance                      - /ops/map, /map
   - /status, /track                                - /ops/incidents, /queue
   - /* (404 Fallback)                              - /ops/dispatch, /dispatch
                                                    - /ops/resources, /resources
                                                    - /ops/shelters, /shelters
                                                    - /ops/unserved, /unserved
```

### 4.2 Route Specification

| Route Path | View Component | Layout | Target Role | Primary Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `/` | `HomePage` | `MainLayout` | All Personas | Public portal overview & emergency entrance |
| `/sos`, `/request-assistance` | `CitizenSosPage` | `MainLayout` | Citizen / Bystander | Submit distress request & receive reference code |
| `/status`, `/track` | `CitizenStatusPage` | `MainLayout` | Citizen / Family | Follow real-time triage, dispatch & shelter updates |
| `/ops/command-center`, `/dashboard` | `CommandCenterPage` | `OpsLayout` | Commander / Dispatcher | 1440×900 cockpit, KPIs, map preview & triage stream |
| `/ops/map`, `/map` | `LiveMapPage` | `OpsLayout` | Dispatcher / GIS Lead | Fullscreen Leaflet map, layer pills & telemetry drawer |
| `/ops/incidents`, `/queue` | `IncidentQueuePage` | `OpsLayout` | Triage Officer | Prioritize incoming SOS requests & record notes |
| `/ops/dispatch`, `/dispatch` | `AssignmentReviewPage` | `OpsLayout` | Authorized Dispatcher | Match rescue units with transaction safety lock |
| `/ops/resources`, `/resources` | `ResourceRegistryPage`| `OpsLayout` | Logistics Coordinator | Monitor boat fleet, high-water trucks & ambulances |
| `/ops/shelters`, `/shelters` | `ShelterOverviewPage` | `OpsLayout` | Shelter Officer | Track bed occupancy, generators & potable water |
| `/ops/unserved`, `/unserved` | `UnservedNeedsPage` | `OpsLayout` | Incident Commander | Detect unserved victims & bottleneck deficits |
| `/*` | `NotFoundPage` | `MainLayout` | All Personas | 404 recovery with return shortcuts |

---

## 5. Responsive Behavior Rules

* **Desktop (≥ 1200px):**
  * Persistent sidebar (expanded 248px or collapsed 72px).
  * Fluid multi-column operational grid (65% map preview + 35% triage stream).
  * Data density maximized with tabular monospace typography.
* **Tablet (768px – 1199px):**
  * Sidebar automatically collapses to 72px icon rail to preserve dashboard width.
  * Panels transition from 4-column to 2-column stacked layout.
  * Map height set to 520px with stacked telemetry side drawer.
* **Mobile (< 768px):**
  * Sidebar transitions into an off-canvas drawer opened via the hamburger toggle.
  * Header shows condensed simulation tag and direct `SOS` shortcut.
  * Map detail drawer converts to a slide-up bottom sheet with full touch target compliance (min 44px).

---

## 6. Initial Shell Reference Architecture

The foundation implementation separates concerns into:
1. **Design Tokens:** `frontend/src/tokens/designTokens.ts`
2. **Tailwind Extended Theme:** `frontend/tailwind.config.js`
3. **Core Base Components:** `frontend/src/components/ui/`
4. **Shell Sidebar:** `frontend/src/components/Sidebar.tsx`
5. **Operations Shell Layout:** `frontend/src/layouts/OpsLayout.tsx`
6. **Public Layout:** `frontend/src/layouts/MainLayout.tsx`

---

## 7. Missing Screens & Dependencies for Future Phases

* **Phase 2 (Command Center & Live Map):** Implements dedicated `/ops/command-center` and `/ops/map` views.
* **Phase 3 (Citizen SOS Experience):** Offline-first local queue and multi-language support.
* **Phase 4 (Incident Triage & Verification Workflow):** Drone recon media attachment gallery and incident merge modal.
* **Phase 5 (Resource Management & Dispatch Engine):** Automated travel-time isochrones and conflict prevention toasts.
* **Phase 6 (Shelters, Hospitals & Logistics Hubs):** Supply resupply request wizard.
* **Phase 7 (Full Application Integration & QA):** Cross-browser verification and final polish.

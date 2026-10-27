import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from './layouts/PublicLayout';
import { OpsLayout } from './layouts/OpsLayout';

// Public / Citizen Screens (Light Public Theme)
import { CitizenLandingPage } from './pages/CitizenLandingPage';
import { RequestAssistancePage } from './pages/RequestAssistancePage';
import { TrackRequestPage } from './pages/TrackRequestPage';
import { FloodSafetyPage } from './pages/FloodSafetyPage';

// Operations / Dispatch Screens (Dark Storm Command Shell)
import { CommandCenterPage } from './pages/CommandCenterPage';
import { LiveMapPage } from './pages/LiveMapPage';
import { IncidentManagementPage } from './pages/IncidentManagementPage';
import { IncidentDetailPage } from './pages/IncidentDetailPage';
import { AssignmentReviewPage } from './pages/AssignmentReviewPage';
import { ResourceRegistryPage } from './pages/ResourceRegistryPage';
import { ResourceDetailPage } from './pages/ResourceDetailPage';
import { FacilitiesListPage } from './pages/FacilitiesListPage';
import { FacilityDetailPage } from './pages/FacilityDetailPage';
import { InventoryManagementPage } from './pages/InventoryManagementPage';
import { DistributionWorkflowPage } from './pages/DistributionWorkflowPage';
import { UnservedNeedsPage } from './pages/UnservedNeedsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { RoleProvider } from './context/RoleContext';
import { ThemeProvider } from './context/ThemeContext';
import { ResponderLayout } from './layouts/ResponderLayout';
import { PartnerLayout } from './layouts/PartnerLayout';

// Phase 5: Responder Screens (Mobile-First Tactical)
import { ResponderTaskListPage } from './pages/responder/ResponderTaskListPage';
import { ResponderTaskDetailPage } from './pages/responder/ResponderTaskDetailPage';
import { ResponderProfilePage } from './pages/responder/ResponderProfilePage';

// Phase 5: Relief Partner Screens (Scoped NGO View)
import { PartnerInventoryPage } from './pages/partner/PartnerInventoryPage';
import { PartnerDistributionPage } from './pages/partner/PartnerDistributionPage';
import { PartnerFacilitiesPage } from './pages/partner/PartnerFacilitiesPage';

// Phase 6: Intelligence, Reporting & Administration Screens
import { ForecastsPage } from './pages/ForecastsPage';
import { ReportsPage } from './pages/ReportsPage';
import { AuditTrailPage } from './pages/AuditTrailPage';
import { DisasterEventsPage } from './pages/DisasterEventsPage';
import { RespondersAdminPage } from './pages/RespondersAdminPage';
import { UsersAdminPage } from './pages/UsersAdminPage';
import { SettingsAdminPage } from './pages/SettingsAdminPage';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <RoleProvider>
      <BrowserRouter>
        <Routes>
          {/* ── 1. Public Citizen Routes (Light Public Theme Layout) ── */}
          <Route element={<PublicLayout />}>
            {/* Public Landing */}
            <Route index element={<CitizenLandingPage />} />

            {/* Staged Assistance Form */}
            <Route path="request-assistance" element={<RequestAssistancePage />} />
            <Route path="sos" element={<RequestAssistancePage />} />

            {/* Tracking Lookup & Timeline */}
            <Route path="track-request" element={<TrackRequestPage />} />
            <Route path="track-request/:requestId" element={<TrackRequestPage />} />
            <Route path="track" element={<TrackRequestPage />} />
            <Route path="status" element={<TrackRequestPage />} />

            {/* Flood Safety & Emergency Guidance */}
            <Route path="safety" element={<FloodSafetyPage />} />
          </Route>

          {/* ── 2. Operations Command Center (Dark Storm Command Shell) ── */}
          <Route element={<OpsLayout />}>
            {/* Command Center */}
            <Route path="ops/command-center" element={<CommandCenterPage />} />
            <Route path="ops/dashboard" element={<CommandCenterPage />} />
            <Route path="dashboard" element={<CommandCenterPage />} />

            {/* Live Tactical Disaster Map */}
            <Route path="ops/map" element={<LiveMapPage />} />
            <Route path="map" element={<LiveMapPage />} />

            {/* Incident Management & Triage Queue */}
            <Route path="ops/incidents" element={<IncidentManagementPage />} />
            <Route path="ops/incidents/:incidentId" element={<IncidentDetailPage />} />
            <Route path="queue" element={<IncidentManagementPage />} />

            {/* Dispatch Authorization Console */}
            <Route path="ops/dispatch" element={<AssignmentReviewPage />} />
            <Route path="dispatch" element={<AssignmentReviewPage />} />

            {/* Fleet & Resource Registry */}
            <Route path="ops/resources" element={<ResourceRegistryPage />} />
            <Route path="ops/resources/:resourceId" element={<ResourceDetailPage />} />
            <Route path="resources" element={<ResourceRegistryPage />} />
            <Route path="resources/:resourceId" element={<ResourceDetailPage />} />

            {/* Facilities & Shelters Registry */}
            <Route path="ops/facilities" element={<FacilitiesListPage />} />
            <Route path="ops/facilities/:facilityId" element={<FacilityDetailPage />} />
            <Route path="ops/shelters" element={<FacilitiesListPage />} />
            <Route path="ops/shelters/:facilityId" element={<FacilityDetailPage />} />
            <Route path="facilities" element={<FacilitiesListPage />} />
            <Route path="facilities/:facilityId" element={<FacilityDetailPage />} />
            <Route path="shelters" element={<FacilitiesListPage />} />

            {/* Inventory & Supplies */}
            <Route path="ops/inventory" element={<InventoryManagementPage />} />
            <Route path="inventory" element={<InventoryManagementPage />} />

            {/* Distribution Workflow */}
            <Route path="ops/distribution" element={<DistributionWorkflowPage />} />
            <Route path="distribution" element={<DistributionWorkflowPage />} />

            {/* Intelligence & Telemetry */}
            <Route path="ops/unserved-needs" element={<UnservedNeedsPage />} />
            <Route path="ops/unserved" element={<UnservedNeedsPage />} />
            <Route path="unserved-needs" element={<UnservedNeedsPage />} />
            <Route path="unserved" element={<UnservedNeedsPage />} />
            <Route path="ops/forecasts" element={<ForecastsPage />} />
            <Route path="forecasts" element={<ForecastsPage />} />
            <Route path="ops/reports" element={<ReportsPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="ops/audit" element={<AuditTrailPage />} />
            <Route path="audit" element={<AuditTrailPage />} />

            {/* Administration & Security */}
            <Route path="ops/events" element={<DisasterEventsPage />} />
            <Route path="events" element={<DisasterEventsPage />} />
            <Route path="ops/responders" element={<RespondersAdminPage />} />
            <Route path="responders" element={<RespondersAdminPage />} />
            <Route path="ops/users" element={<UsersAdminPage />} />
            <Route path="users" element={<UsersAdminPage />} />
            <Route path="ops/settings" element={<SettingsAdminPage />} />
            <Route path="settings" element={<SettingsAdminPage />} />
          </Route>

          {/* ── 3. Responder Portal (Mobile-First Tactical Workspace) ── */}
          <Route element={<ResponderLayout />}>
            <Route path="responder" element={<Navigate to="/responder/tasks" replace />} />
            <Route path="responder/tasks" element={<ResponderTaskListPage />} />
            <Route path="responder/tasks/:taskId" element={<ResponderTaskDetailPage />} />
            <Route path="responder/profile" element={<ResponderProfilePage />} />
          </Route>

          {/* ── 4. Relief Partner Portal (Scoped NGO Organization View) ── */}
          <Route element={<PartnerLayout />}>
            <Route path="partner" element={<Navigate to="/partner/inventory" replace />} />
            <Route path="partner/inventory" element={<PartnerInventoryPage />} />
            <Route path="partner/distribution" element={<PartnerDistributionPage />} />
            <Route path="partner/facilities" element={<PartnerFacilitiesPage />} />
          </Route>

          {/* ── 5. Fallback 404 Route ── */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </RoleProvider>
    </ThemeProvider>
  );
};

export default App;

export type IncidentStatus = 
  | 'submitted' 
  | 'under_review' 
  | 'verified' 
  | 'assigned' 
  | 'in_progress' 
  | 'resolved' 
  | 'rejected';

export type IncidentPriority = 'critical' | 'high' | 'medium' | 'low';

export type ResourceType = 
  | 'boat' 
  | 'ambulance' 
  | 'drone' 
  | 'evacuation_truck' 
  | 'medical_team' 
  | 'food_water_pack';

export type ResourceStatus = 'available' | 'deployed' | 'maintenance' | 'decommissioned';

export type AssignmentStatus = 'proposed' | 'approved' | 'dispatched' | 'completed' | 'cancelled';

export type ShelterStatus = 'active' | 'full' | 'closed';

export interface IncidentStatusHistoryItem {
  id: string;
  previous_status: string | null;
  new_status: string;
  changed_by_user_id?: string | null;
  notes?: string | null;
  created_at: string;
}

export interface Incident {
  id: string;
  reference_code: string;
  event_id?: string | null;
  reporter_name: string;
  reporter_contact: string;
  reporter_is_victim: boolean;
  disaster_type: string;
  status: IncidentStatus;
  priority: IncidentPriority;
  people_count: number;
  trapped_count: number;
  medical_assistance_needed: boolean;
  special_needs_description?: string | null;
  description: string;
  address_text: string;
  latitude: number;
  longitude: number;
  ai_triage_score?: number | null;
  ai_suggested_priority?: string | null;
  ai_recommendation_notes?: string | null;
  created_at: string;
  updated_at: string;
  status_history?: IncidentStatusHistoryItem[];
}

export interface ResourceAssignmentHistoryItem {
  id: string;
  incident_id: string;
  incident_ref: string;
  assigned_at: string;
  completed_at?: string | null;
  status: string;
  notes?: string | null;
}

export interface Resource {
  id: string;
  name: string;
  resource_type: ResourceType;
  status: ResourceStatus;
  organization_id?: string | null;
  organization_name?: string | null;
  passenger_capacity: number;
  crew_count: number;
  battery_or_fuel_pct: number;
  operational_notes?: string | null;
  contact_phone?: string | null;
  responder_lead_name?: string | null;
  latitude: number;
  longitude: number;
  created_at: string;
  updated_at: string;
  assignment_history?: ResourceAssignmentHistoryItem[];
}

export interface ResourceAssignment {
  id: string;
  incident_id: string;
  resource_id: string;
  status: AssignmentStatus;
  assigned_by_user_id?: string | null;
  dispatcher_notes?: string | null;
  dispatched_at?: string | null;
  completed_at?: string | null;
  cancelled_at?: string | null;
  cancellation_reason?: string | null;
  created_at: string;
  resource?: Resource | null;
}

export type FacilityType = 'shelter' | 'hospital' | 'clinic' | 'evacuation_center';

export interface FacilityCapacityRecord {
  id: string;
  recorded_at: string;
  occupancy_count: number;
  available_beds: number;
  notes?: string | null;
}

export interface Facility {
  id: string;
  name: string;
  facility_type: FacilityType;
  status: ShelterStatus;
  organization_id?: string | null;
  organization_name?: string | null;
  address: string;
  contact_phone?: string | null;
  manager_name?: string | null;
  capacity_total: number | null; // null represents unknown capacity (distinguished from 0)
  current_occupancy: number;
  available_beds: number | null;
  medical_facilities_available: boolean;
  generator_backup: boolean;
  pet_friendly: boolean;
  water_purification_capacity_liters: number;
  latitude: number;
  longitude: number;
  last_census_updated_at?: string;
  incoming_allocations_count?: number;
  outgoing_transfers_count?: number;
  capacity_history?: FacilityCapacityRecord[];
  created_at: string;
  updated_at: string;
}

export type Shelter = Facility;

export type InventoryCategory =
  | 'water'
  | 'dry_ration'
  | 'medical_kit'
  | 'blankets'
  | 'life_vests'
  | 'hygiene_pack'
  | 'generator_fuel';

export interface InventoryItem {
  id: string;
  item_name: string;
  category: InventoryCategory;
  quantity: number;
  unit: string;
  reorder_threshold: number;
  organization_name: string;
  storage_location: string;
  facility_id?: string | null;
  expiry_date?: string | null;
  created_at: string;
  updated_at: string;
}

export type DistributionStatus = 'allocated' | 'dispatched' | 'delivered' | 'cancelled';

export interface DistributionRecord {
  id: string;
  idempotency_key?: string;
  incident_id?: string | null;
  incident_ref?: string | null;
  facility_id?: string | null;
  facility_name?: string | null;
  inventory_item_id: string;
  item_name: string;
  quantity: number;
  unit: string;
  status: DistributionStatus;
  dispatched_at?: string | null;
  delivered_at?: string | null;
  recipient_name?: string | null;
  recipient_contact?: string | null;
  carrier_resource_id?: string | null;
  carrier_resource_name?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DashboardSummary {
  total_incidents: number;
  active_incidents: number;
  critical_incidents: number;
  resolved_incidents: number;
  total_resources: number;
  available_resources: number;
  deployed_resources: number;
  shelter_total_capacity: number;
  shelter_current_occupancy: number;
  shelter_available_beds: number;
  shelter_occupancy_pct: number;
  unserved_critical_needs_count: number;
  unassigned_verified_incidents: number;
  overcapacity_shelters_count: number;
  incidents_by_priority: Record<string, number>;
  incidents_by_status: Record<string, number>;
  resources_by_type: Record<string, number>;
  critical_unserved_incidents: Incident[];
}

export interface DisasterEvent {
  id: string;
  name: string;
  disaster_type: string;
  status: string;
  severity: string;
  description?: string | null;
  declaration_date?: string | null;
  affected_region_name: string;
  created_at: string;
}

// Phase 5: Responder, Partner & Role Types
export type ResponderTaskStatus = 
  | 'assigned'
  | 'acknowledged'
  | 'en_route'
  | 'on_site'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export interface TaskTimelineEvent {
  id: string;
  status: ResponderTaskStatus;
  timestamp: string;
  notes?: string;
  location?: string;
  recorded_by?: string;
}

export interface TaskOutcome {
  completed_at: string;
  people_rescued: number;
  casualties_treated: number;
  transported_to_facility_id?: string;
  transported_to_facility_name?: string;
  outcome_notes: string;
  verification_code: string;
  responder_signoff: string;
}

export interface ResponderTask {
  id: string;
  assignment_id: string;
  incident_id: string;
  resource_id: string;
  resource_name: string;
  incident_reference: string;
  disaster_type: string;
  priority: IncidentPriority;
  status: ResponderTaskStatus;
  assigned_at: string;
  acknowledged_at?: string | null;
  en_route_at?: string | null;
  on_site_at?: string | null;
  completed_at?: string | null;
  title: string;
  description: string;
  special_needs?: string | null;
  people_count: number;
  trapped_count: number;
  medical_needed: boolean;
  address_text: string;
  latitude: number;
  longitude: number;
  reporter_name?: string;
  reporter_contact?: string;
  coordination_channel: string;
  instructions: string;
  timeline: TaskTimelineEvent[];
  outcome?: TaskOutcome | null;
}

export type DemoUserRole = 'dispatcher' | 'responder' | 'partner' | 'citizen';

export interface PartnerOrganization {
  id: string;
  name: string;
  type: string;
  contact_email: string;
  contact_phone: string;
  assigned_warehouse: string;
  active_inventory_count: number;
  active_manifests_count: number;
}

// Phase 6: Intelligence, Reporting, and Administration
export interface ForecastRecord {
  id: string;
  resource_category: string;
  sector_area: string;
  forecast_horizon: string;
  estimated_demand: number;
  available_supply: number;
  shortage_gap: number;
  risk_level: 'critical' | 'high' | 'moderate' | 'stable';
  unit: string;
  assumptions: string;
  model_version: string;
  model_run_at: string;
}

export interface AuditLogEntry {
  id: string;
  actor_id: string;
  actor_name: string;
  actor_role: string;
  action: string;
  record_type: 'incident' | 'resource' | 'facility' | 'inventory' | 'distribution' | 'user' | 'event';
  record_id: string;
  record_ref?: string;
  timestamp: string;
  previous_state?: string | null;
  new_state?: string | null;
  reason?: string | null;
  ip_address?: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'dispatcher' | 'responder' | 'partner' | 'admin';
  organization: string;
  status: 'active' | 'suspended';
  last_login_at: string;
  created_at: string;
}

export interface ResponderRecord {
  id: string;
  callsign: string;
  lead_name: string;
  unit_type: string;
  organization: string;
  contact_phone: string;
  radio_frequency: string;
  current_status: 'available' | 'on_mission' | 'maintenance' | 'off_duty';
  active_incident_ref?: string | null;
  total_missions: number;
  last_active_at: string;
}

export interface OpsSettings {
  auto_triage_critical_threshold: number;
  stale_data_warning_hours: number;
  low_stock_warning_percentage: number;
  default_radio_channel: string;
  disaster_declaration_authority: string;
  telemetry_refresh_interval_sec: number;
  enable_ai_advisory: boolean;
}


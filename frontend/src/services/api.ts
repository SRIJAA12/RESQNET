import {
  Incident,
  Resource,
  Shelter,
  ResourceAssignment,
  DashboardSummary,
  DisasterEvent,
  IncidentStatus,
  ResourceStatus,
  Facility,
  InventoryItem,
  DistributionRecord,
  DistributionStatus,
  ResponderTask,
  ResponderTaskStatus,
  TaskOutcome,
  PartnerOrganization,
  ForecastRecord,
  AuditLogEntry,
  AdminUser,
  ResponderRecord,
  OpsSettings,
} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Realistic Fallback Data for offline / simulated local preview
const FALLBACK_INCIDENTS: Incident[] = [
  {
    id: 'inc-001',
    reference_code: 'SOS-2026-FLOOD-8492',
    reporter_name: 'Sunita Sharma (Simulated)',
    reporter_contact: '555-017-9141',
    reporter_is_victim: true,
    disaster_type: 'flood',
    status: 'under_review',
    priority: 'critical',
    people_count: 3,
    trapped_count: 3,
    medical_assistance_needed: true,
    special_needs_description: 'Elderly diabetic grandmother with high fever. Water entered 1st floor.',
    description: 'Water is 1.8m deep and rising rapidly. Trapped on rooftop with no clean water or insulin.',
    address_text: 'Plot 42, River Creek Colony, Sector B',
    latitude: 28.5710,
    longitude: 77.2390,
    ai_triage_score: 85.0,
    ai_suggested_priority: 'critical',
    ai_recommendation_notes: 'AI Triage Score: 85.0/100 -> CRITICAL. Trapped above water, medical assistance urgent. [Advisory: Requires human dispatcher verification]',
    created_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    status_history: [
      {
        id: 'h-1',
        previous_status: null,
        new_status: 'submitted',
        notes: 'Citizen reported via mobile SOS web app',
        created_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
      },
      {
        id: 'h-2',
        previous_status: 'submitted',
        new_status: 'under_review',
        notes: 'Dispatcher Triage: Flagged as critical due to medical urgency & trapped status',
        created_at: new Date(Date.now() - 2.5 * 3600 * 1000).toISOString(),
      }
    ]
  },
  {
    id: 'inc-002',
    reference_code: 'SOS-2026-FLOOD-8493',
    reporter_name: 'Marcus Vance (Simulated)',
    reporter_contact: '555-017-4322',
    reporter_is_victim: true,
    disaster_type: 'flood',
    status: 'verified',
    priority: 'critical',
    people_count: 5,
    trapped_count: 5,
    medical_assistance_needed: false,
    special_needs_description: 'Two infants (8 months and 2 years old) stranded.',
    description: 'Ground floor submerged. Stranded on 2nd-floor balcony with 2 babies. Need boat rescue.',
    address_text: 'Flat 204, Green Oasis Apartments, Delta Sector',
    latitude: 28.5630,
    longitude: 77.2480,
    ai_triage_score: 75.0,
    ai_suggested_priority: 'critical',
    ai_recommendation_notes: 'AI Triage Score: 75.0/100 -> CRITICAL. Infants present, boat evacuation required.',
    created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    id: 'inc-003',
    reference_code: 'SOS-2026-FLOOD-8494',
    reporter_name: 'Dr. Ananya Roy (Simulated)',
    reporter_contact: '555-017-1002',
    reporter_is_victim: false,
    disaster_type: 'flood',
    status: 'in_progress',
    priority: 'high',
    people_count: 14,
    trapped_count: 0,
    medical_assistance_needed: true,
    special_needs_description: 'Dialysis patients awaiting emergency transit.',
    description: 'Clinic emergency power generators threatened by rising water. 14 patients require transfer to higher ground.',
    address_text: 'Lifeline Health Clinic, Low-Lying Industrial Area',
    latitude: 28.5910,
    longitude: 77.2110,
    ai_triage_score: 68.0,
    ai_suggested_priority: 'high',
    ai_recommendation_notes: 'AI Triage Score: 68.0/100 -> HIGH. Medical vulnerability transfer.',
    created_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
  },
  {
    id: 'inc-004',
    reference_code: 'SOS-2026-FLOOD-8495',
    reporter_name: 'Pooja Verma (Simulated)',
    reporter_contact: '555-017-7788',
    reporter_is_victim: true,
    disaster_type: 'flood',
    status: 'submitted',
    priority: 'medium',
    people_count: 4,
    trapped_count: 0,
    medical_assistance_needed: false,
    description: 'Road surrounded by water. Supplies running low, elderly father safely upstairs but need evacuation plan.',
    address_text: 'House 19, Lane 3, South Ridge Colony',
    latitude: 28.5420,
    longitude: 77.2610,
    ai_triage_score: 35.0,
    ai_suggested_priority: 'medium',
    ai_recommendation_notes: 'AI Triage Score: 35.0/100 -> MEDIUM.',
    created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
  {
    id: 'inc-005',
    reference_code: 'SOS-2026-FLOOD-8490',
    reporter_name: 'Officer J. Blake (Simulated)',
    reporter_contact: '555-017-2299',
    reporter_is_victim: false,
    disaster_type: 'flood',
    status: 'resolved',
    priority: 'medium',
    people_count: 18,
    trapped_count: 0,
    medical_assistance_needed: false,
    description: 'Successful rescue of 18 children and staff from inundated primary school hall. All arrived safely at Sector 4 Civic Hall.',
    address_text: 'Primary School Compound, River Valley Road',
    latitude: 28.6010,
    longitude: 77.2310,
    ai_triage_score: 40.0,
    ai_suggested_priority: 'medium',
    created_at: new Date(Date.now() - 9 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  }
];

const FALLBACK_RESOURCES: Resource[] = [
  {
    id: 'res-001',
    name: 'Rescue Boat Swift-Alpha 01',
    resource_type: 'boat',
    status: 'available',
    organization_name: 'Metro Water Rescue Service',
    passenger_capacity: 8,
    crew_count: 3,
    battery_or_fuel_pct: 92,
    operational_notes: 'Rigid inflatable rescue craft with night searchlights and 40hp outboard.',
    contact_phone: '555-011-8801',
    responder_lead_name: 'Commander R. Evans (Simulated)',
    latitude: 28.5820,
    longitude: 77.2180,
    created_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    assignment_history: [
      {
        id: 'asg-h-1',
        incident_id: 'inc-005',
        incident_ref: 'SOS-2026-FLOOD-8490',
        assigned_at: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
        completed_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        status: 'completed',
        notes: 'Successfully evacuated 18 primary school students from inundated hall.'
      }
    ]
  },
  {
    id: 'res-002',
    name: 'Rescue Boat Swift-Delta 02',
    resource_type: 'boat',
    status: 'deployed',
    organization_name: 'Coast Guard Auxiliary',
    passenger_capacity: 10,
    crew_count: 4,
    battery_or_fuel_pct: 76,
    operational_notes: 'Heavy shallow-draft aluminum flood boat equipped with thermal imager.',
    contact_phone: '555-011-8802',
    responder_lead_name: 'Capt. M. Chen (Simulated)',
    latitude: 28.5670,
    longitude: 77.2450,
    created_at: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    assignment_history: [
      {
        id: 'asg-h-2',
        incident_id: 'inc-003',
        incident_ref: 'SOS-2026-FLOOD-8494',
        assigned_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
        status: 'dispatched',
        notes: 'Navigating flood waters toward Lifeline Clinic.'
      }
    ]
  },
  {
    id: 'res-003',
    name: 'High-Water Evacuation Truck Heavy-04',
    resource_type: 'evacuation_truck',
    status: 'deployed',
    organization_name: 'National Guard Engineering Bn',
    passenger_capacity: 24,
    crew_count: 2,
    battery_or_fuel_pct: 81,
    operational_notes: '6x6 military transport vehicle with 1.4m fording depth capability.',
    contact_phone: '555-011-8804',
    responder_lead_name: 'Sergeant K. Patel (Simulated)',
    latitude: 28.5990,
    longitude: 77.2020,
    created_at: new Date(Date.now() - 96 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    assignment_history: []
  },
  {
    id: 'res-004',
    name: 'Rapid Paramedic Ambulance Medic-12',
    resource_type: 'ambulance',
    status: 'available',
    organization_name: 'Riverbend Emergency Medical Services',
    passenger_capacity: 3,
    crew_count: 2,
    battery_or_fuel_pct: 96,
    operational_notes: 'Equipped with advanced life support, ventilators, and hypothermia warming kits.',
    contact_phone: '555-011-9912',
    responder_lead_name: 'Dr. S. Nair (Simulated)',
    latitude: 28.5510,
    longitude: 77.2290,
    created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    assignment_history: []
  },
  {
    id: 'res-005',
    name: 'Aerial Reconnaissance Drone Hawk-Eye 03',
    resource_type: 'drone',
    status: 'available',
    organization_name: 'Civic Protection Geospatial Unit',
    passenger_capacity: 0,
    crew_count: 1,
    battery_or_fuel_pct: 88,
    operational_notes: 'Thermal IR quadcopter with real-time video telemetry.',
    contact_phone: '555-011-5503',
    responder_lead_name: 'Pilot T. Weber (Simulated)',
    latitude: 28.5740,
    longitude: 77.2340,
    created_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    assignment_history: []
  },
  {
    id: 'res-006',
    name: 'Disaster Medical Team Alpha',
    resource_type: 'medical_team',
    status: 'maintenance',
    organization_name: 'Red Cross Disaster Team',
    passenger_capacity: 6,
    crew_count: 5,
    battery_or_fuel_pct: 45,
    operational_notes: 'Field triage staff currently restocking trauma supplies at Sector 4 depot.',
    contact_phone: '555-011-4406',
    responder_lead_name: 'Dr. Elena Rostova (Simulated)',
    latitude: 28.5530,
    longitude: 77.2410,
    created_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    assignment_history: []
  }
];

const FALLBACK_FACILITIES: Facility[] = [
  {
    id: 'fac-001',
    name: 'St. Jude Community Relief Center',
    facility_type: 'shelter',
    status: 'active',
    organization_name: 'Municipal Relief Board',
    address: '14 Hope Crescent, Riverbend Heights',
    contact_phone: '555-014-9901',
    manager_name: 'Grace Hopper (Simulated)',
    capacity_total: 250,
    current_occupancy: 195,
    available_beds: 55,
    medical_facilities_available: true,
    generator_backup: true,
    pet_friendly: true,
    water_purification_capacity_liters: 4000,
    latitude: 28.6050,
    longitude: 77.2080,
    last_census_updated_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    incoming_allocations_count: 2,
    outgoing_transfers_count: 0,
    capacity_history: [
      { id: 'ch-1', recorded_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString(), occupancy_count: 80, available_beds: 170, notes: 'Shelter opened for Sector A evacuations' },
      { id: 'ch-2', recorded_at: new Date(Date.now() - 6 * 3600 * 1000).toISOString(), occupancy_count: 140, available_beds: 110, notes: 'Bus intake from low-lying areas' },
      { id: 'ch-3', recorded_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(), occupancy_count: 195, available_beds: 55, notes: 'Evening census verification complete' }
    ],
    created_at: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: 'fac-002',
    name: 'Riverside Polytechnic Gymnasium',
    facility_type: 'shelter',
    status: 'full',
    organization_name: 'State Disaster Emergency Service',
    address: '102 Campus Drive, North Riverbend',
    contact_phone: '555-014-9902',
    manager_name: 'David Miller (Simulated)',
    capacity_total: 400,
    current_occupancy: 400,
    available_beds: 0,
    medical_facilities_available: true,
    generator_backup: true,
    pet_friendly: false,
    water_purification_capacity_liters: 8000,
    latitude: 28.6180,
    longitude: 77.2210,
    last_census_updated_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    incoming_allocations_count: 1,
    outgoing_transfers_count: 1,
    capacity_history: [
      { id: 'ch-4', recorded_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(), occupancy_count: 220, available_beds: 180, notes: 'Intake operational' },
      { id: 'ch-5', recorded_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), occupancy_count: 400, available_beds: 0, notes: 'Capacity ceiling reached; intake diverted to Sector 4' }
    ],
    created_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: 'fac-003',
    name: 'Riverbend Metro Base Hospital & Trauma Center',
    facility_type: 'hospital',
    status: 'active',
    organization_name: 'Metro Health Authority',
    address: '500 Medical Center Boulevard, Central District',
    contact_phone: '555-014-9910',
    manager_name: 'Dr. Aris Thorne (Simulated)',
    capacity_total: 180,
    current_occupancy: 162,
    available_beds: 18,
    medical_facilities_available: true,
    generator_backup: true,
    pet_friendly: false,
    water_purification_capacity_liters: 15000,
    latitude: 28.5890,
    longitude: 77.2150,
    last_census_updated_at: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    incoming_allocations_count: 3,
    outgoing_transfers_count: 0,
    capacity_history: [
      { id: 'ch-6', recorded_at: new Date(Date.now() - 20 * 60 * 1000).toISOString(), occupancy_count: 162, available_beds: 18, notes: '18 ICU and emergency surgery beds ready' }
    ],
    created_at: new Date(Date.now() - 120 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
  },
  {
    id: 'fac-004',
    name: 'Sector 4 Civic Convention Hall',
    facility_type: 'evacuation_center',
    status: 'active',
    organization_name: 'Red Cross Relief Network',
    address: '88 Exhibition Way, East Riverbend',
    contact_phone: '555-014-9903',
    manager_name: 'Alicia Gomez (Simulated)',
    capacity_total: 500,
    current_occupancy: 210,
    available_beds: 290,
    medical_facilities_available: false,
    generator_backup: true,
    pet_friendly: true,
    water_purification_capacity_liters: 10000,
    latitude: 28.5480,
    longitude: 77.2510,
    last_census_updated_at: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    incoming_allocations_count: 1,
    outgoing_transfers_count: 0,
    capacity_history: [
      { id: 'ch-7', recorded_at: new Date(Date.now() - 40 * 60 * 1000).toISOString(), occupancy_count: 210, available_beds: 290, notes: 'Accepting overflow evacuations' }
    ],
    created_at: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
  },
  {
    id: 'fac-005',
    name: 'North Levee Mobile Field Clinic',
    facility_type: 'clinic',
    status: 'active',
    organization_name: 'Doctors Without Borders Partner',
    address: 'Checkpoint Delta, Levee Access Road',
    contact_phone: '555-014-9955',
    manager_name: 'Dr. Tariq Mansoor (Simulated)',
    capacity_total: null, // Unknown capacity distinguished from 0
    current_occupancy: 14,
    available_beds: null,
    medical_facilities_available: true,
    generator_backup: false,
    pet_friendly: false,
    water_purification_capacity_liters: 500,
    latitude: 28.6210,
    longitude: 77.2380,
    last_census_updated_at: new Date(Date.now() - 6 * 3600 * 1000).toISOString(), // STALE DATA (> 4 hours ago!)
    incoming_allocations_count: 0,
    outgoing_transfers_count: 0,
    capacity_history: [],
    created_at: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
  },
  {
    id: 'fac-006',
    name: 'Old Wharf Decommissioned Warehouse',
    facility_type: 'shelter',
    status: 'closed',
    organization_name: 'Port Authority',
    address: 'Pier 9, Industrial Estuary',
    contact_phone: '555-014-9999',
    manager_name: 'Unassigned',
    capacity_total: 0, // Zero capacity distinguished from unknown
    current_occupancy: 0,
    available_beds: 0,
    medical_facilities_available: false,
    generator_backup: false,
    pet_friendly: false,
    water_purification_capacity_liters: 0,
    latitude: 28.5300,
    longitude: 77.2650,
    last_census_updated_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    incoming_allocations_count: 0,
    outgoing_transfers_count: 0,
    capacity_history: [],
    created_at: new Date(Date.now() - 100 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
  }
];

const FALLBACK_INVENTORY: InventoryItem[] = [
  {
    id: 'inv-001',
    item_name: 'Potable Water Jerrycans (20L)',
    category: 'water',
    quantity: 2400,
    unit: 'liters',
    reorder_threshold: 500,
    organization_name: 'Municipal Relief Water Board',
    storage_location: 'St. Jude Community Relief Center',
    facility_id: 'fac-001',
    expiry_date: '2027-12-31',
    created_at: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
  },
  {
    id: 'inv-002',
    item_name: 'High-Calorie Ready-to-Eat Rations',
    category: 'dry_ration',
    quantity: 850,
    unit: 'packs',
    reorder_threshold: 200,
    organization_name: 'World Central Kitchen Partner',
    storage_location: 'Riverside Polytechnic Gymnasium',
    facility_id: 'fac-002',
    expiry_date: '2026-11-20',
    created_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    id: 'inv-003',
    item_name: 'Advanced Trauma & Surgical Field Kits',
    category: 'medical_kit',
    quantity: 45,
    unit: 'kits',
    reorder_threshold: 15,
    organization_name: 'Metro Health Authority',
    storage_location: 'Riverbend Metro Base Hospital',
    facility_id: 'fac-003',
    expiry_date: '2028-06-30',
    created_at: new Date(Date.now() - 96 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: 'inv-004',
    item_name: 'High-Insulation Thermal Wool Blankets',
    category: 'blankets',
    quantity: 620,
    unit: 'units',
    reorder_threshold: 100,
    organization_name: 'Red Cross Relief Network',
    storage_location: 'Sector 4 Civic Convention Hall',
    facility_id: 'fac-004',
    expiry_date: null,
    created_at: new Date(Date.now() - 50 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
  },
  {
    id: 'inv-005',
    item_name: 'USCG Type-III Inflatable Life Vests',
    category: 'life_vests',
    quantity: 180,
    unit: 'units',
    reorder_threshold: 50,
    organization_name: 'Coast Guard Auxiliary',
    storage_location: 'Riverbend North Boat Staging Dock',
    facility_id: 'fac-002',
    expiry_date: null,
    created_at: new Date(Date.now() - 40 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
  },
  {
    id: 'inv-006',
    item_name: 'Infant Formula & Sterile Feeding Kits',
    category: 'dry_ration',
    quantity: 95,
    unit: 'kits',
    reorder_threshold: 30,
    organization_name: 'UNICEF Emergency Support',
    storage_location: 'St. Jude Community Relief Center',
    facility_id: 'fac-001',
    expiry_date: '2027-05-15',
    created_at: new Date(Date.now() - 30 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
  },
  {
    id: 'inv-007',
    item_name: 'Ultra-Low Sulfur Diesel Generator Fuel',
    category: 'generator_fuel',
    quantity: 350,
    unit: 'liters',
    reorder_threshold: 100,
    organization_name: 'Emergency Power Taskforce',
    storage_location: 'East River Logistics Depot',
    facility_id: 'fac-004',
    expiry_date: null,
    created_at: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
  }
];

const FALLBACK_DISTRIBUTIONS: DistributionRecord[] = [
  {
    id: 'dist-001',
    idempotency_key: 'idem-dist-001',
    incident_id: 'inc-001',
    incident_ref: 'SOS-2026-FLOOD-8492',
    inventory_item_id: 'inv-001',
    item_name: 'Potable Water Jerrycans (20L)',
    quantity: 60,
    unit: 'liters',
    status: 'delivered',
    dispatched_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    delivered_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    recipient_name: 'Sunita Sharma',
    carrier_resource_id: 'res-001',
    carrier_resource_name: 'Rescue Boat Swift-Alpha 01',
    notes: 'Delivered 3 jerrycans to rooftop via rescue hoist.',
    created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
  {
    id: 'dist-002',
    idempotency_key: 'idem-dist-002',
    facility_id: 'fac-002',
    facility_name: 'Riverside Polytechnic Gymnasium',
    inventory_item_id: 'inv-004',
    item_name: 'High-Insulation Thermal Wool Blankets',
    quantity: 50,
    unit: 'units',
    status: 'dispatched',
    dispatched_at: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    carrier_resource_id: 'res-003',
    carrier_resource_name: 'High-Water Evacuation Truck Heavy-04',
    notes: 'Emergency resupply for incoming hypothermic evacuees.',
    created_at: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
  }
];

const FALLBACK_PARTNER_ORGS: PartnerOrganization[] = [
  {
    id: 'org-redcross',
    name: 'Red Cross Disaster Fleet & Supplies',
    type: 'International NGO',
    contact_email: 'ops@redcross-relief.org',
    contact_phone: '555-019-2200',
    assigned_warehouse: 'Central Relief Depot Alpha',
    active_inventory_count: 3,
    active_manifests_count: 2,
  },
  {
    id: 'org-hope',
    name: 'Hope Relief Foundation',
    type: 'Community NGO',
    contact_email: 'relief@hopefoundation.org',
    contact_phone: '555-019-3311',
    assigned_warehouse: 'North Valley Humanitarian Hub',
    active_inventory_count: 2,
    active_manifests_count: 1,
  },
  {
    id: 'org-sdrf',
    name: 'State Disaster Response Force',
    type: 'Government Emergency Service',
    contact_email: 'dispatch@sdrf.gov.in',
    contact_phone: '555-019-4422',
    assigned_warehouse: 'Sector 2 Staging Depot',
    active_inventory_count: 2,
    active_manifests_count: 1,
  },
];

const FALLBACK_RESPONDER_TASKS: ResponderTask[] = [
  {
    id: 'tsk-001',
    assignment_id: 'asg-001',
    incident_id: 'inc-001',
    resource_id: 'res-001',
    resource_name: 'Rescue Boat Swift-Alpha 01',
    incident_reference: 'SOS-2026-FLOOD-8492',
    disaster_type: 'flood',
    priority: 'critical',
    status: 'en_route',
    assigned_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    acknowledged_at: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    en_route_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    on_site_at: null,
    completed_at: null,
    title: 'Priority Evacuation: 3 Trapped on Rooftop with Diabetic Patient',
    description: 'Water is 1.8m deep and rising rapidly. Trapped on rooftop with no clean water or insulin.',
    special_needs: 'Elderly diabetic grandmother with high fever. Water entered 1st floor.',
    people_count: 3,
    trapped_count: 3,
    medical_needed: true,
    address_text: 'Plot 42, River Creek Colony, Sector B',
    latitude: 28.5710,
    longitude: 77.2390,
    reporter_name: 'Sunita Sharma (Simulated)',
    reporter_contact: '555-017-9141',
    coordination_channel: 'VHF 156.800 MHz (Tactical 2)',
    instructions: 'Approach from southern levee channel. Strong eddy current near culvert. Lifejackets required before boarding. Transport elderly patient to St. Jude Relief Center medical triage.',
    timeline: [
      {
        id: 'tl-1',
        status: 'assigned',
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        notes: 'Task assigned by Command Center Dispatcher Capt. R. Vance',
        recorded_by: 'Cmd Dispatcher'
      },
      {
        id: 'tl-2',
        status: 'acknowledged',
        timestamp: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
        notes: 'Unit acknowledged mission order via tactical data link',
        recorded_by: 'Rescue Boat Swift-Alpha 01'
      },
      {
        id: 'tl-3',
        status: 'en_route',
        timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
        notes: 'Navigating downstream corridor. Estimated time to target: 8 minutes',
        recorded_by: 'Rescue Boat Swift-Alpha 01'
      }
    ],
    outcome: null,
  },
  {
    id: 'tsk-002',
    assignment_id: 'asg-002',
    incident_id: 'inc-002',
    resource_id: 'res-003',
    resource_name: 'High-Water Evacuation Truck Heavy-04',
    incident_reference: 'SOS-2026-FLOOD-3910',
    disaster_type: 'flood',
    priority: 'high',
    status: 'acknowledged',
    assigned_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    acknowledged_at: new Date(Date.now() - 28 * 60 * 1000).toISOString(),
    en_route_at: null,
    on_site_at: null,
    completed_at: null,
    title: 'Community Inundation Shuttle: 12 Evacuees',
    description: 'Ground floor submerged 1.2m. 12 residents stranded on stairwells including 4 children.',
    special_needs: '4 infants and children. Need dry blankets and emergency rations.',
    people_count: 12,
    trapped_count: 12,
    medical_needed: false,
    address_text: 'Building 7, Greenview Apartments, Lowland Road',
    latitude: 28.5820,
    longitude: 77.2180,
    reporter_name: 'Rohan Verma (Simulated)',
    reporter_contact: '555-018-4421',
    coordination_channel: 'VHF 156.800 MHz (Tactical 3)',
    instructions: 'High-clearance vehicle required. Fording depth up to 1.1m. Stage at Greenview north gate.',
    timeline: [
      {
        id: 'tl-201',
        status: 'assigned',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        notes: 'Task assigned by Sector Logistics Desk',
        recorded_by: 'Cmd Dispatcher'
      },
      {
        id: 'tl-202',
        status: 'acknowledged',
        timestamp: new Date(Date.now() - 28 * 60 * 1000).toISOString(),
        notes: 'Crew assembled and pre-trip vehicle check passed',
        recorded_by: 'High-Water Evacuation Truck Heavy-04'
      }
    ],
    outcome: null,
  },
  {
    id: 'tsk-003',
    assignment_id: 'asg-003',
    incident_id: 'inc-003',
    resource_id: 'res-001',
    resource_name: 'Rescue Boat Swift-Alpha 01',
    incident_reference: 'SOS-2026-FLOOD-1102',
    disaster_type: 'flood',
    priority: 'medium',
    status: 'completed',
    assigned_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    acknowledged_at: new Date(Date.now() - 2 * 3600 * 1000 - 50 * 60 * 1000).toISOString(),
    en_route_at: new Date(Date.now() - 2 * 3600 * 1000 - 40 * 60 * 1000).toISOString(),
    on_site_at: new Date(Date.now() - 2 * 3600 * 1000 - 15 * 60 * 1000).toISOString(),
    completed_at: new Date(Date.now() - 1 * 3600 * 1000 - 30 * 60 * 1000).toISOString(),
    title: 'Commercial Strip Evacuation: 2 Shop Owners',
    description: 'Water breached sandbags along Market Lane. 2 adults safely retrieved.',
    special_needs: null,
    people_count: 2,
    trapped_count: 2,
    medical_needed: false,
    address_text: 'Shop 14, Main Market Canal Road',
    latitude: 28.5630,
    longitude: 77.2420,
    reporter_name: 'Amitabh Sen',
    reporter_contact: '555-012-3341',
    coordination_channel: 'VHF 156.800 MHz (Tactical 2)',
    instructions: 'Retrieve owners and assist in securing power mains before cutoff.',
    timeline: [
      { id: 'tl-301', status: 'assigned', timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(), notes: 'Assigned' },
      { id: 'tl-302', status: 'acknowledged', timestamp: new Date(Date.now() - 2 * 3600 * 1000 - 50 * 60 * 1000).toISOString(), notes: 'Acknowledged' },
      { id: 'tl-303', status: 'en_route', timestamp: new Date(Date.now() - 2 * 3600 * 1000 - 40 * 60 * 1000).toISOString(), notes: 'Underway' },
      { id: 'tl-304', status: 'on_site', timestamp: new Date(Date.now() - 2 * 3600 * 1000 - 15 * 60 * 1000).toISOString(), notes: 'Arrived on scene' },
      { id: 'tl-305', status: 'completed', timestamp: new Date(Date.now() - 1 * 3600 * 1000 - 30 * 60 * 1000).toISOString(), notes: '2 evacuees transferred to safety' }
    ],
    outcome: {
      completed_at: new Date(Date.now() - 1 * 3600 * 1000 - 30 * 60 * 1000).toISOString(),
      people_rescued: 2,
      casualties_treated: 0,
      transported_to_facility_id: 'fac-001',
      transported_to_facility_name: 'St. Jude Community Relief Center',
      outcome_notes: 'Both individuals safely brought ashore. Mains power isolated.',
      verification_code: 'VERIF-7749-ALPHA',
      responder_signoff: 'Capt. M. Alvarez'
    }
  }
];

const FALLBACK_EVENTS: DisasterEvent[] = [
  {
    id: 'evt-001',
    name: 'SIM-FLOOD-2026 // Riverbend Basin',
    disaster_type: 'flood',
    status: 'active',
    severity: 'critical',
    description: 'Catastrophic river tributary flooding across Sector 4B, River Creek, and low-lying coastal wards.',
    declaration_date: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
    affected_region_name: 'Riverbend Basin & Lowland Corridor',
    created_at: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
  },
  {
    id: 'evt-002',
    name: 'SIM-CYCLONE-DELTA // Coastal Corridor',
    disaster_type: 'cyclone',
    status: 'monitoring',
    severity: 'high',
    description: 'Category 3 cyclone system tracking 120km offshore with storm surge potential.',
    declaration_date: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    affected_region_name: 'Eastern Estuary & Barrier Islands',
    created_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
  },
  {
    id: 'evt-003',
    name: 'SIM-LANDSLIDE // High Range Basin',
    disaster_type: 'landslide',
    status: 'contained',
    severity: 'medium',
    description: 'Highway blockage and minor slope collapse along North Pass corridor.',
    declaration_date: new Date(Date.now() - 96 * 3600 * 1000).toISOString(),
    affected_region_name: 'Upper Ridge Mountain Route',
    created_at: new Date(Date.now() - 96 * 3600 * 1000).toISOString(),
  }
];

const FALLBACK_FORECASTS: ForecastRecord[] = [
  {
    id: 'fc-001',
    resource_category: 'Shallow-Draft Rescue Boats',
    sector_area: 'Sector 4B Riverbend Basin',
    forecast_horizon: 'Next 12 Hours',
    estimated_demand: 8,
    available_supply: 3,
    shortage_gap: 5,
    risk_level: 'critical',
    unit: 'vessels',
    assumptions: 'River gauge cresting at 44.2ft (+2.4ft surge). 14 unverified rooftop distress beacons reported in Lowland Ward.',
    model_version: 'HydroSim Predictive Risk v3.4 (Simulated)',
    model_run_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: 'fc-002',
    resource_category: 'High-Capacity Potable Water (20L)',
    sector_area: 'Sector 2 Lowland Colony',
    forecast_horizon: 'Next 24 Hours',
    estimated_demand: 2200,
    available_supply: 1400,
    shortage_gap: 800,
    risk_level: 'high',
    unit: 'liters',
    assumptions: 'Municipal water main contamination confirmed at pumping station 3. Inundation prevents tanker truck access.',
    model_version: 'Relief Demand Forecaster v2.1 (Simulated)',
    model_run_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
  },
  {
    id: 'fc-003',
    resource_category: 'Emergency Generator Diesel Fuel',
    sector_area: 'East Pier Relief Shelters',
    forecast_horizon: 'Next 48 Hours',
    estimated_demand: 600,
    available_supply: 350,
    shortage_gap: 250,
    risk_level: 'moderate',
    unit: 'liters',
    assumptions: 'Grid blackout anticipated to persist for 36 hours. St. Jude Center running backup generator 18hr/day.',
    model_version: 'Infrastructure Logistics Engine v1.8 (Simulated)',
    model_run_at: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
  },
  {
    id: 'fc-004',
    resource_category: 'Pediatric Electrolyte & ORS Kits',
    sector_area: 'North Levee Evacuation Camps',
    forecast_horizon: 'Next 6 Hours',
    estimated_demand: 300,
    available_supply: 400,
    shortage_gap: 0,
    risk_level: 'stable',
    unit: 'kits',
    assumptions: 'WHO standard waterborne disease prophylactic ratio per 100 displaced infants.',
    model_version: 'Epidemiological Demand Model v4.0 (Simulated)',
    model_run_at: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
  },
  {
    id: 'fc-005',
    resource_category: 'High-Water Military 6x6 Transport',
    sector_area: 'North Gate Highway Cutoff',
    forecast_horizon: 'Next 12 Hours',
    estimated_demand: 4,
    available_supply: 1,
    shortage_gap: 3,
    risk_level: 'critical',
    unit: 'vehicles',
    assumptions: 'Water fording depth rising above 1.2m on arterial access roads; civilian transit impassable.',
    model_version: 'Fleet Routing Optimization v2.0 (Simulated)',
    model_run_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  }
];

const FALLBACK_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'aud-001',
    actor_id: 'usr-001',
    actor_name: 'Capt. R. Vance',
    actor_role: 'Incident Commander',
    action: 'DISPATCH_ASSIGNMENT_CONFIRMED',
    record_type: 'resource',
    record_id: 'res-001',
    record_ref: 'SOS-2026-FLOOD-8492',
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    previous_state: 'status: available',
    new_state: 'status: deployed',
    reason: 'Critical rooftop evacuation order authorized for trapped diabetic patient.',
    ip_address: '10.0.4.12'
  },
  {
    id: 'aud-002',
    actor_id: 'usr-002',
    actor_name: 'Capt. M. Alvarez',
    actor_role: 'Tactical SAR Lead',
    action: 'MISSION_OUTCOME_VERIFIED',
    record_type: 'incident',
    record_id: 'inc-003',
    record_ref: 'SOS-2026-FLOOD-1102',
    timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    previous_state: 'status: in_progress',
    new_state: 'status: resolved',
    reason: 'Evacuees brought ashore; verification token VERIF-7749-ALPHA recorded.',
    ip_address: '10.0.12.88'
  },
  {
    id: 'aud-003',
    actor_id: 'usr-003',
    actor_name: 'Sarah Jenkins',
    actor_role: 'Relief Partner Coordinator',
    action: 'INVENTORY_STOCK_COMMITTED',
    record_type: 'inventory',
    record_id: 'inv-001',
    record_ref: 'POTABLE-WATER-BAY4',
    timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    previous_state: 'quantity: 100',
    new_state: 'quantity: 120',
    reason: 'Received regional emergency donation shipment of 20 jerrycans.',
    ip_address: '10.0.18.4'
  },
  {
    id: 'aud-004',
    actor_id: 'usr-004',
    actor_name: 'Officer Sunita Rao',
    actor_role: 'Shelter Warden',
    action: 'SHELTER_CENSUS_AUDITED',
    record_type: 'facility',
    record_id: 'fac-001',
    record_ref: 'ST-JUDE-SHELTER',
    timestamp: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
    previous_state: 'occupancy: 184',
    new_state: 'occupancy: 200',
    reason: 'Intake batch of 16 evacuees processed from Sector B convoy.',
    ip_address: '10.0.8.21'
  },
  {
    id: 'aud-005',
    actor_id: 'usr-005',
    actor_name: 'Adm. T. Thorne',
    actor_role: 'System Administrator',
    action: 'USER_ROLE_PROMOTED',
    record_type: 'user',
    record_id: 'usr-002',
    record_ref: 'USR-SAR-ALVAREZ',
    timestamp: new Date(Date.now() - 240 * 60 * 1000).toISOString(),
    previous_state: 'role: responder',
    new_state: 'role: responder (Tactical SAR Lead)',
    reason: 'Field operational promotion to Tactical Lead for Maritime Wing.',
    ip_address: '10.0.1.2'
  }
];

const FALLBACK_ADMIN_USERS: AdminUser[] = [
  {
    id: 'usr-001',
    name: 'Capt. R. Vance',
    email: 'vance.commander@resqnet.gov',
    role: 'dispatcher',
    organization: 'Riverbend Emergency Operations Center',
    status: 'active',
    last_login_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 90 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'usr-002',
    name: 'Capt. Marcos Alvarez',
    email: 'm.alvarez@sdrf.gov.in',
    role: 'responder',
    organization: 'State Disaster Response Force (Maritime Wing)',
    status: 'active',
    last_login_at: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 60 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'usr-003',
    name: 'Sarah Jenkins',
    email: 's.jenkins@redcross-relief.org',
    role: 'partner',
    organization: 'Red Cross Disaster Fleet & Supplies',
    status: 'active',
    last_login_at: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 45 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'usr-004',
    name: 'Adm. Thomas Thorne',
    email: 't.thorne.admin@resqnet.gov',
    role: 'admin',
    organization: 'Central Disaster Management Agency',
    status: 'active',
    last_login_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 120 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'usr-005',
    name: 'Priya Sen (Suspended)',
    email: 'priya.sen@unverified.org',
    role: 'partner',
    organization: 'Hope Relief Foundation',
    status: 'suspended',
    last_login_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    created_at: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
  }
];

const FALLBACK_RESPONDER_RECORDS: ResponderRecord[] = [
  {
    id: 'resp-001',
    callsign: 'SWIFT-ALPHA-01',
    lead_name: 'Capt. Marcos Alvarez',
    unit_type: 'Shallow-Draft Zodiac SAR Boat',
    organization: 'State Disaster Response Force',
    contact_phone: '555-019-1144',
    radio_frequency: 'VHF 156.800 MHz (Tactical 2)',
    current_status: 'available',
    active_incident_ref: null,
    total_missions: 14,
    last_active_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
  {
    id: 'resp-002',
    callsign: 'HEAVY-TRUCK-04',
    lead_name: 'Sgt. K. Patel',
    unit_type: '6x6 High-Water Military Fording Truck',
    organization: 'National Guard Engineering Bn',
    contact_phone: '555-019-8804',
    radio_frequency: 'VHF 156.800 MHz (Tactical 3)',
    current_status: 'on_mission',
    active_incident_ref: 'SOS-2026-FLOOD-3910',
    total_missions: 9,
    last_active_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: 'resp-003',
    callsign: 'MEDIC-AMBULANCE-12',
    lead_name: 'Dr. S. Nair',
    unit_type: 'ALS Paramedic Field Ambulance',
    organization: 'Riverbend Emergency Medical Services',
    contact_phone: '555-019-9912',
    radio_frequency: 'VHF 155.340 MHz (EMS Med-Net)',
    current_status: 'available',
    active_incident_ref: null,
    total_missions: 22,
    last_active_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: 'resp-004',
    callsign: 'HAWK-EYE-DRONE-03',
    lead_name: 'Pilot T. Weber',
    unit_type: 'Thermal IR Aerial Reconnaissance Drone',
    organization: 'Civic Protection Geospatial Unit',
    contact_phone: '555-019-5503',
    radio_frequency: 'UHF 462.562 MHz (Drone Data Link)',
    current_status: 'available',
    active_incident_ref: null,
    total_missions: 31,
    last_active_at: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
  }
];

const FALLBACK_OPS_SETTINGS: OpsSettings = {
  auto_triage_critical_threshold: 80,
  stale_data_warning_hours: 4,
  low_stock_warning_percentage: 20,
  default_radio_channel: 'VHF 156.800 MHz (Tactical 2)',
  disaster_declaration_authority: 'State Emergency Operations Center',
  telemetry_refresh_interval_sec: 15,
  enable_ai_advisory: true,
};

class ApiClient {
  private inMemoryIncidents: Incident[] = [...FALLBACK_INCIDENTS];
  private inMemoryResources: Resource[] = [...FALLBACK_RESOURCES];
  private inMemoryFacilities: Facility[] = [...FALLBACK_FACILITIES];
  private inMemoryInventory: InventoryItem[] = [...FALLBACK_INVENTORY];
  private inMemoryDistributions: DistributionRecord[] = [...FALLBACK_DISTRIBUTIONS];
  private inMemoryResponderTasks: ResponderTask[] = [...FALLBACK_RESPONDER_TASKS];
  private inMemoryPartnerOrgs: PartnerOrganization[] = [...FALLBACK_PARTNER_ORGS];
  private inMemoryEvents: DisasterEvent[] = [...FALLBACK_EVENTS];
  private inMemoryForecasts: ForecastRecord[] = [...FALLBACK_FORECASTS];
  private inMemoryAuditLogs: AuditLogEntry[] = [...FALLBACK_AUDIT_LOGS];
  private inMemoryAdminUsers: AdminUser[] = [...FALLBACK_ADMIN_USERS];
  private inMemoryResponders: ResponderRecord[] = [...FALLBACK_RESPONDER_RECORDS];
  private inMemorySettings: OpsSettings = { ...FALLBACK_OPS_SETTINGS };

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData?.error?.message || `API Error: ${res.statusText}`);
      }
      return await res.json();
    } catch (err) {
      console.warn(`[RESQNET API] Failed fetching ${endpoint}, using simulation fallback:`, err);
      throw err;
    }
  }

  async getHealth() {
    try {
      return await this.request<any>('/health');
    } catch {
      return {
        status: 'healthy',
        components: { application: 'healthy', database: 'local_simulation_mode' }
      };
    }
  }

  async getEvents(): Promise<DisasterEvent[]> {
    try {
      const res = await this.request<{ data: DisasterEvent[] }>('/v1/events');
      return res.data;
    } catch {
      return [...this.inMemoryEvents];
    }
  }

  async getIncidents(params?: { status?: string; priority?: string; search?: string }): Promise<Incident[]> {
    try {
      const query = new URLSearchParams();
      if (params?.status) query.set('status', params.status);
      if (params?.priority) query.set('priority', params.priority);
      if (params?.search) query.set('search', params.search);
      const res = await this.request<{ items: Incident[] }>(`/v1/incidents?${query.toString()}`);
      return res.items;
    } catch {
      let list = [...this.inMemoryIncidents];
      if (params?.status) list = list.filter(i => i.status === params.status);
      if (params?.priority) list = list.filter(i => i.priority === params.priority);
      if (params?.search) {
        const s = params.search.toLowerCase();
        list = list.filter(i => 
          i.reference_code.toLowerCase().includes(s) ||
          i.address_text.toLowerCase().includes(s) ||
          i.description.toLowerCase().includes(s)
        );
      }
      return list;
    }
  }

  async getIncident(id: string): Promise<Incident> {
    try {
      const res = await this.request<{ data: Incident }>(`/v1/incidents/${id}`);
      return res.data;
    } catch {
      const found = this.inMemoryIncidents.find(
        (i) => i.id === id || i.reference_code.toUpperCase() === id.trim().toUpperCase()
      );
      if (!found) throw new Error(`Incident '${id}' was not found.`);
      return found;
    }
  }

  async getIncidentByRef(referenceCode: string): Promise<Incident> {
    try {
      const res = await this.request<{ data: Incident }>(`/v1/incidents/ref/${encodeURIComponent(referenceCode)}`);
      return res.data;
    } catch {
      const found = this.inMemoryIncidents.find(i => i.reference_code.toUpperCase() === referenceCode.trim().toUpperCase() || i.id === referenceCode.trim());
      if (!found) throw new Error(`Incident with reference ${referenceCode} was not found.`);
      return found;
    }
  }

  async createIncident(data: any): Promise<Incident> {
    try {
      const res = await this.request<{ data: Incident }>('/v1/incidents', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return res.data;
    } catch {
      const suffix = Math.floor(1000 + Math.random() * 9000);
      const newInc: Incident = {
        id: `mock-${Date.now()}`,
        reference_code: `SOS-2026-FLOOD-${suffix}`,
        ...data,
        status: 'submitted',
        priority: data.medical_assistance_needed || data.trapped_count > 0 ? 'critical' : 'medium',
        ai_triage_score: data.medical_assistance_needed ? 80.0 : 40.0,
        ai_suggested_priority: data.medical_assistance_needed ? 'critical' : 'medium',
        ai_recommendation_notes: 'Calculated by local simulation heuristic engine.',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status_history: [
          {
            id: `h-${Date.now()}`,
            previous_status: null,
            new_status: 'submitted',
            notes: 'Citizen SOS submitted via web portal',
            created_at: new Date().toISOString()
          }
        ]
      };
      this.inMemoryIncidents.unshift(newInc);
      return newInc;
    }
  }

  async updateIncidentStatus(id: string, status: IncidentStatus, notes?: string): Promise<Incident> {
    try {
      const res = await this.request<{ data: Incident }>(`/v1/incidents/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, notes }),
      });
      return res.data;
    } catch {
      const inc = this.inMemoryIncidents.find(i => i.id === id || i.reference_code.toUpperCase() === id.trim().toUpperCase());
      if (!inc) throw new Error('Incident not found');
      const prevStatus = inc.status;
      inc.status = status;
      inc.updated_at = new Date().toISOString();
      if (!inc.status_history) inc.status_history = [];
      inc.status_history.push({
        id: `h-${Date.now()}`,
        previous_status: prevStatus,
        new_status: status,
        notes: notes || `Status changed from ${prevStatus} to ${status} by dispatcher`,
        created_at: new Date().toISOString()
      });
      return inc;
    }
  }

  // ── Resources ─────────────────────────────────────────────────────────────
  async getResources(params?: { status?: string; resource_type?: string; search?: string }): Promise<Resource[]> {
    try {
      const query = new URLSearchParams();
      if (params?.status) query.set('status', params.status);
      if (params?.resource_type) query.set('resource_type', params.resource_type);
      const res = await this.request<{ items: Resource[] }>(`/v1/resources?${query.toString()}`);
      return res.items;
    } catch {
      let list = [...this.inMemoryResources];
      if (params?.status && params.status !== 'all') {
        list = list.filter(r => r.status === params.status);
      }
      if (params?.resource_type && params.resource_type !== 'all') {
        list = list.filter(r => r.resource_type === params.resource_type);
      }
      if (params?.search) {
        const s = params.search.toLowerCase();
        list = list.filter(r => 
          r.name.toLowerCase().includes(s) ||
          (r.organization_name && r.organization_name.toLowerCase().includes(s)) ||
          (r.responder_lead_name && r.responder_lead_name.toLowerCase().includes(s))
        );
      }
      return list;
    }
  }

  async getResource(id: string): Promise<Resource> {
    try {
      const res = await this.request<{ data: Resource }>(`/v1/resources/${id}`);
      return res.data;
    } catch {
      const found = this.inMemoryResources.find(r => r.id === id);
      if (!found) throw new Error(`Resource '${id}' not found.`);
      return found;
    }
  }

  async createResource(data: any): Promise<Resource> {
    try {
      const res = await this.request<{ data: Resource }>('/v1/resources', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return res.data;
    } catch {
      const newRes: Resource = {
        id: `res-${Date.now()}`,
        name: data.name,
        resource_type: data.resource_type,
        status: data.status || 'available',
        organization_name: data.organization_name || 'Riverbend Emergency Fleet',
        passenger_capacity: Number(data.passenger_capacity) || 0,
        crew_count: Number(data.crew_count) || 1,
        battery_or_fuel_pct: Number(data.battery_or_fuel_pct) || 100,
        operational_notes: data.operational_notes || '',
        contact_phone: data.contact_phone || '',
        responder_lead_name: data.responder_lead_name || '',
        latitude: Number(data.latitude) || 28.5800,
        longitude: Number(data.longitude) || 77.2200,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        assignment_history: []
      };
      this.inMemoryResources.unshift(newRes);
      return newRes;
    }
  }

  async updateResource(id: string, data: Partial<Resource>): Promise<Resource> {
    const res = this.inMemoryResources.find(r => r.id === id);
    if (!res) throw new Error(`Resource '${id}' not found.`);
    Object.assign(res, data, { updated_at: new Date().toISOString() });
    return res;
  }

  async updateResourceStatus(id: string, status: ResourceStatus, notes?: string): Promise<Resource> {
    const res = this.inMemoryResources.find(r => r.id === id);
    if (!res) throw new Error(`Resource '${id}' not found.`);
    res.status = status;
    res.updated_at = new Date().toISOString();
    if (notes) {
      res.operational_notes = `${res.operational_notes ? res.operational_notes + ' | ' : ''}${notes}`;
    }
    return res;
  }

  // ── Facilities & Shelters ──────────────────────────────────────────────────
  async getFacilities(params?: { status?: string; facility_type?: string; search?: string; organization_name?: string }): Promise<Facility[]> {
    try {
      const res = await this.request<{ items: Facility[] }>('/v1/shelters');
      return res.items;
    } catch {
      let list = [...this.inMemoryFacilities];
      if (params?.organization_name) {
        list = list.filter(f => f.organization_name?.toLowerCase().includes(params.organization_name!.toLowerCase()));
      }
      if (params?.status && params.status !== 'all') {
        list = list.filter(f => f.status === params.status);
      }
      if (params?.facility_type && params.facility_type !== 'all') {
        list = list.filter(f => f.facility_type === params.facility_type);
      }
      if (params?.search) {
        const s = params.search.toLowerCase();
        list = list.filter(f => 
          f.name.toLowerCase().includes(s) ||
          f.address.toLowerCase().includes(s) ||
          (f.organization_name && f.organization_name.toLowerCase().includes(s))
        );
      }
      return list;
    }
  }

  async getFacility(id: string): Promise<Facility> {
    const found = this.inMemoryFacilities.find(f => f.id === id);
    if (!found) throw new Error(`Facility '${id}' not found.`);
    return found;
  }

  async createFacility(data: any): Promise<Facility> {
    // Validate non-negative capacity
    if (data.capacity_total !== null && data.capacity_total !== undefined && Number(data.capacity_total) < 0) {
      throw new Error('Total capacity cannot be negative.');
    }
    if (Number(data.current_occupancy) < 0) {
      throw new Error('Current occupancy cannot be negative.');
    }

    const capTotal = data.capacity_total === null || data.capacity_total === '' ? null : Number(data.capacity_total);
    const occ = Number(data.current_occupancy) || 0;
    const avail = capTotal !== null ? Math.max(0, capTotal - occ) : null;

    const newFac: Facility = {
      id: `fac-${Date.now()}`,
      name: data.name,
      facility_type: data.facility_type || 'shelter',
      status: data.status || 'active',
      organization_name: data.organization_name || 'Riverbend Disaster Network',
      address: data.address,
      contact_phone: data.contact_phone || '',
      manager_name: data.manager_name || '',
      capacity_total: capTotal,
      current_occupancy: occ,
      available_beds: avail,
      medical_facilities_available: Boolean(data.medical_facilities_available),
      generator_backup: Boolean(data.generator_backup),
      pet_friendly: Boolean(data.pet_friendly),
      water_purification_capacity_liters: Number(data.water_purification_capacity_liters) || 0,
      latitude: Number(data.latitude) || 28.5800,
      longitude: Number(data.longitude) || 77.2200,
      last_census_updated_at: new Date().toISOString(),
      incoming_allocations_count: 0,
      outgoing_transfers_count: 0,
      capacity_history: [
        {
          id: `ch-${Date.now()}`,
          recorded_at: new Date().toISOString(),
          occupancy_count: occ,
          available_beds: avail ?? 0,
          notes: 'Facility initial registration'
        }
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.inMemoryFacilities.unshift(newFac);
    return newFac;
  }

  async updateFacility(id: string, data: Partial<Facility>): Promise<Facility> {
    const fac = this.inMemoryFacilities.find(f => f.id === id);
    if (!fac) throw new Error(`Facility '${id}' not found.`);

    if (data.capacity_total !== undefined && data.capacity_total !== null && data.capacity_total < 0) {
      throw new Error('Total capacity cannot be negative.');
    }
    if (data.current_occupancy !== undefined && data.current_occupancy < 0) {
      throw new Error('Current occupancy cannot be negative.');
    }

    Object.assign(fac, data, { updated_at: new Date().toISOString(), last_census_updated_at: new Date().toISOString() });
    if (fac.capacity_total !== null && fac.capacity_total !== undefined) {
      fac.available_beds = Math.max(0, fac.capacity_total - fac.current_occupancy);
      if (fac.current_occupancy >= fac.capacity_total) {
        fac.status = 'full';
      }
    }
    return fac;
  }

  async updateFacilityOccupancy(id: string, newOccupancy: number, notes?: string): Promise<Facility> {
    const fac = this.inMemoryFacilities.find(f => f.id === id);
    if (!fac) throw new Error(`Facility '${id}' not found.`);

    if (newOccupancy < 0) {
      throw new Error('Occupancy count cannot be negative.');
    }

    fac.current_occupancy = newOccupancy;
    if (fac.capacity_total !== null && fac.capacity_total !== undefined) {
      fac.available_beds = Math.max(0, fac.capacity_total - newOccupancy);
      if (fac.current_occupancy >= fac.capacity_total && fac.status === 'active') {
        fac.status = 'full';
      } else if (fac.current_occupancy < fac.capacity_total && fac.status === 'full') {
        fac.status = 'active';
      }
    }

    fac.last_census_updated_at = new Date().toISOString();
    fac.updated_at = new Date().toISOString();

    if (!fac.capacity_history) fac.capacity_history = [];
    fac.capacity_history.unshift({
      id: `ch-${Date.now()}`,
      recorded_at: new Date().toISOString(),
      occupancy_count: newOccupancy,
      available_beds: fac.available_beds ?? 0,
      notes: notes || 'Census head-count update logged by facility manager'
    });

    return fac;
  }

  // Backwards compatibility aliases for shelters
  async getShelters(): Promise<Shelter[]> {
    return this.getFacilities();
  }

  async getShelter(id: string): Promise<Shelter> {
    return this.getFacility(id);
  }

  // ── Inventory ──────────────────────────────────────────────────────────────
  async getInventoryItems(params?: { category?: string; search?: string; organization_name?: string }): Promise<InventoryItem[]> {
    let list = [...this.inMemoryInventory];
    if (params?.organization_name) {
      list = list.filter(i => i.organization_name.toLowerCase().includes(params.organization_name!.toLowerCase()));
    }
    if (params?.category && params.category !== 'all') {
      list = list.filter(i => i.category === params.category);
    }
    if (params?.search) {
      const s = params.search.toLowerCase();
      list = list.filter(i => 
        i.item_name.toLowerCase().includes(s) ||
        i.storage_location.toLowerCase().includes(s) ||
        i.organization_name.toLowerCase().includes(s)
      );
    }
    return list;
  }

  async getInventoryItem(id: string): Promise<InventoryItem> {
    const found = this.inMemoryInventory.find(i => i.id === id);
    if (!found) throw new Error(`Inventory item '${id}' not found.`);
    return found;
  }

  async createInventoryItem(data: any): Promise<InventoryItem> {
    if (Number(data.quantity) < 0) {
      throw new Error('Initial quantity cannot be negative.');
    }
    const newItem: InventoryItem = {
      id: `inv-${Date.now()}`,
      item_name: data.item_name,
      category: data.category || 'water',
      quantity: Number(data.quantity) || 0,
      unit: data.unit || 'units',
      reorder_threshold: Number(data.reorder_threshold) || 10,
      organization_name: data.organization_name || 'Riverbend Relief Logistics',
      storage_location: data.storage_location,
      facility_id: data.facility_id || null,
      expiry_date: data.expiry_date || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.inMemoryInventory.unshift(newItem);
    return newItem;
  }

  async updateInventoryQuantity(id: string, delta: number, reason: string): Promise<InventoryItem> {
    const item = this.inMemoryInventory.find(i => i.id === id);
    if (!item) throw new Error(`Inventory item '${id}' not found.`);

    const nextQty = item.quantity + delta;
    if (nextQty < 0) {
      throw new Error(`Insufficient stock: Cannot reduce by ${Math.abs(delta)}. Current quantity is ${item.quantity} ${item.unit}.`);
    }

    item.quantity = nextQty;
    item.updated_at = new Date().toISOString();
    return item;
  }

  // ── Distribution Workflow ──────────────────────────────────────────────────
  async getDistributions(params?: { status?: string; search?: string; organization_name?: string }): Promise<DistributionRecord[]> {
    let list = [...this.inMemoryDistributions];
    if (params?.status && params.status !== 'all') {
      list = list.filter(d => d.status === params.status);
    }
    if (params?.organization_name) {
      const orgLower = params.organization_name.toLowerCase();
      const orgItems = new Set(this.inMemoryInventory.filter(i => i.organization_name.toLowerCase().includes(orgLower)).map(i => i.id));
      const orgFacilities = new Set(this.inMemoryFacilities.filter(f => f.organization_name?.toLowerCase().includes(orgLower)).map(f => f.id));
      list = list.filter(d => orgItems.has(d.inventory_item_id) || (d.facility_id && orgFacilities.has(d.facility_id)));
    }
    if (params?.search) {
      const s = params.search.toLowerCase();
      list = list.filter(d =>
        d.item_name.toLowerCase().includes(s) ||
        (d.recipient_name && d.recipient_name.toLowerCase().includes(s)) ||
        (d.carrier_resource_name && d.carrier_resource_name.toLowerCase().includes(s)) ||
        (d.facility_name && d.facility_name.toLowerCase().includes(s)) ||
        (d.incident_ref && d.incident_ref.toLowerCase().includes(s))
      );
    }
    return list;
  }

  async createDistribution(data: {
    idempotency_key?: string;
    incident_id?: string | null;
    incident_ref?: string | null;
    facility_id?: string | null;
    facility_name?: string | null;
    inventory_item_id: string;
    quantity: number;
    carrier_resource_id?: string | null;
    notes?: string | null;
  }): Promise<DistributionRecord> {
    // 1. Idempotency Check: Prevent duplicate reductions on retried actions
    if (data.idempotency_key) {
      const existing = this.inMemoryDistributions.find(d => d.idempotency_key === data.idempotency_key);
      if (existing) {
        console.warn(`[IDEMPOTENCY] Returning existing allocation for key '${data.idempotency_key}'`);
        return existing;
      }
    }

    // 2. Validate quantity
    const qty = Number(data.quantity);
    if (!qty || qty <= 0) {
      throw new Error('Allocation quantity must be greater than zero.');
    }

    // 3. Find and validate inventory stock
    const item = this.inMemoryInventory.find(i => i.id === data.inventory_item_id);
    if (!item) throw new Error(`Inventory item '${data.inventory_item_id}' not found.`);

    if (item.quantity < qty) {
      throw new Error(`Allocation Exceeds Available Stock: Requested ${qty} ${item.unit}, but only ${item.quantity} ${item.unit} are available in storage.`);
    }

    // 4. Find carrier resource name if assigned
    const carrier = data.carrier_resource_id ? this.inMemoryResources.find(r => r.id === data.carrier_resource_id) : null;

    // 5. Decrement inventory safely
    item.quantity -= qty;
    item.updated_at = new Date().toISOString();

    // 6. Record distribution linked to inventory & underlying need
    const newRecord: DistributionRecord = {
      id: `dist-${Date.now()}`,
      idempotency_key: data.idempotency_key || `idem-${Date.now()}-${Math.random()}`,
      incident_id: data.incident_id || null,
      incident_ref: data.incident_ref || null,
      facility_id: data.facility_id || null,
      facility_name: data.facility_name || null,
      inventory_item_id: item.id,
      item_name: item.item_name,
      quantity: qty,
      unit: item.unit,
      status: 'allocated',
      carrier_resource_id: carrier ? carrier.id : null,
      carrier_resource_name: carrier ? carrier.name : null,
      notes: data.notes || 'Allocated for emergency relief distribution.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.inMemoryDistributions.unshift(newRecord);

    // If linked to an incident, append a note to incident timeline
    if (data.incident_id) {
      const inc = this.inMemoryIncidents.find(i => i.id === data.incident_id || i.reference_code === data.incident_ref);
      if (inc && inc.status_history) {
        inc.status_history.push({
          id: `h-dist-${Date.now()}`,
          previous_status: inc.status,
          new_status: inc.status,
          notes: `Relief Supplies Allocated: ${qty} ${item.unit} of ${item.item_name}. Carrier: ${carrier ? carrier.name : 'Staged for dispatch'}.`,
          created_at: new Date().toISOString()
        });
      }
    }

    // If linked to a facility, increment incoming allocations
    if (data.facility_id) {
      const fac = this.inMemoryFacilities.find(f => f.id === data.facility_id);
      if (fac) {
        fac.incoming_allocations_count = (fac.incoming_allocations_count || 0) + 1;
      }
    }

    return newRecord;
  }

  async updateDistributionStatus(id: string, status: DistributionStatus, notes?: string): Promise<DistributionRecord> {
    const dist = this.inMemoryDistributions.find(d => d.id === id);
    if (!dist) throw new Error(`Distribution record '${id}' not found.`);

    dist.status = status;
    dist.updated_at = new Date().toISOString();
    if (status === 'dispatched' && !dist.dispatched_at) {
      dist.dispatched_at = new Date().toISOString();
    } else if (status === 'delivered' && !dist.delivered_at) {
      dist.delivered_at = new Date().toISOString();
    }
    if (notes) {
      dist.notes = `${dist.notes ? dist.notes + ' | ' : ''}${notes}`;
    }
    return dist;
  }

  async createAssignment(data: { incident_id: string; resource_id: string; dispatcher_notes?: string; auto_dispatch?: boolean }): Promise<ResourceAssignment> {
    try {
      const res = await this.request<{ data: ResourceAssignment }>('/v1/assignments', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return res.data;
    } catch {
      const resource = this.inMemoryResources.find(r => r.id === data.resource_id);
      if (resource) {
        resource.status = 'deployed';
        if (!resource.assignment_history) resource.assignment_history = [];
        const inc = this.inMemoryIncidents.find(i => i.id === data.incident_id || i.reference_code.toUpperCase() === data.incident_id.trim().toUpperCase());
        resource.assignment_history.unshift({
          id: `asg-h-${Date.now()}`,
          incident_id: data.incident_id,
          incident_ref: inc ? inc.reference_code : data.incident_id,
          assigned_at: new Date().toISOString(),
          status: data.auto_dispatch ? 'dispatched' : 'approved',
          notes: data.dispatcher_notes || 'Assigned via dispatch console'
        });
      }
      const inc = this.inMemoryIncidents.find(i => i.id === data.incident_id || i.reference_code.toUpperCase() === data.incident_id.trim().toUpperCase());
      const nextStatus = data.auto_dispatch ? 'in_progress' : 'assigned';
      if (inc) {
        const prevStatus = inc.status;
        inc.status = nextStatus;
        inc.updated_at = new Date().toISOString();
        if (!inc.status_history) inc.status_history = [];
        inc.status_history.push({
          id: `h-asgn-${Date.now()}`,
          previous_status: prevStatus,
          new_status: nextStatus,
          notes: `Assigned unit: ${resource ? resource.name : data.resource_id}. Notes: ${data.dispatcher_notes || 'Operational dispatch confirmed.'}`,
          created_at: new Date().toISOString()
        });
      }
      return {
        id: `asgn-${Date.now()}`,
        incident_id: data.incident_id,
        resource_id: data.resource_id,
        status: data.auto_dispatch ? 'dispatched' : 'approved',
        dispatcher_notes: data.dispatcher_notes || 'Assigned in simulation mode',
        dispatched_at: data.auto_dispatch ? new Date().toISOString() : null,
        created_at: new Date().toISOString(),
        resource: resource || null,
      };
    }
  }

  async getDashboardSummary(): Promise<DashboardSummary> {
    try {
      const res = await this.request<{ data: DashboardSummary }>('/v1/dashboard/summary');
      return res.data;
    } catch {
      const active = this.inMemoryIncidents.filter(i => i.status !== 'resolved' && i.status !== 'rejected');
      const critical = active.filter(i => i.priority === 'critical');
      const unservedCritical = active.filter(i => i.priority === 'critical' && (i.status === 'submitted' || i.status === 'under_review' || i.status === 'verified'));
      
      const totalCapacity = this.inMemoryFacilities.reduce((acc, s) => acc + (s.capacity_total || 0), 0);
      const currentOccupancy = this.inMemoryFacilities.reduce((acc, s) => acc + s.current_occupancy, 0);

      return {
        total_incidents: this.inMemoryIncidents.length,
        active_incidents: active.length,
        critical_incidents: critical.length,
        resolved_incidents: this.inMemoryIncidents.filter(i => i.status === 'resolved').length,
        total_resources: this.inMemoryResources.length,
        available_resources: this.inMemoryResources.filter(r => r.status === 'available').length,
        deployed_resources: this.inMemoryResources.filter(r => r.status === 'deployed').length,
        shelter_total_capacity: totalCapacity,
        shelter_current_occupancy: currentOccupancy,
        shelter_available_beds: totalCapacity - currentOccupancy,
        shelter_occupancy_pct: totalCapacity > 0 ? Math.round((currentOccupancy / totalCapacity) * 100) : 0,
        unserved_critical_needs_count: unservedCritical.length,
        unassigned_verified_incidents: active.filter(i => i.status === 'verified').length,
        overcapacity_shelters_count: this.inMemoryFacilities.filter(s => s.capacity_total !== null && s.current_occupancy >= s.capacity_total).length,
        incidents_by_priority: {
          critical: critical.length,
          high: active.filter(i => i.priority === 'high').length,
          medium: active.filter(i => i.priority === 'medium').length,
          low: active.filter(i => i.priority === 'low').length,
        },
        incidents_by_status: {
          submitted: this.inMemoryIncidents.filter(i => i.status === 'submitted').length,
          under_review: this.inMemoryIncidents.filter(i => i.status === 'under_review').length,
          verified: this.inMemoryIncidents.filter(i => i.status === 'verified').length,
          assigned: this.inMemoryIncidents.filter(i => i.status === 'assigned').length,
          in_progress: this.inMemoryIncidents.filter(i => i.status === 'in_progress').length,
          resolved: this.inMemoryIncidents.filter(i => i.status === 'resolved').length,
        },
        resources_by_type: {
          boat: this.inMemoryResources.filter(r => r.resource_type === 'boat').length,
          truck: this.inMemoryResources.filter(r => r.resource_type === 'evacuation_truck').length,
          ambulance: this.inMemoryResources.filter(r => r.resource_type === 'ambulance').length,
          drone: this.inMemoryResources.filter(r => r.resource_type === 'drone').length,
        },
        critical_unserved_incidents: unservedCritical,
      };
    }
  }

  // ── Phase 5: Partner Portal ────────────────────────────────────────────────
  async getPartnerOrganizations(): Promise<PartnerOrganization[]> {
    return [...this.inMemoryPartnerOrgs];
  }

  // ── Phase 5: Responder Portal ──────────────────────────────────────────────
  async getResponderTasks(params?: { resourceId?: string; status?: string }): Promise<ResponderTask[]> {
    let list = [...this.inMemoryResponderTasks];
    if (params?.resourceId && params.resourceId !== 'all') {
      list = list.filter(t => t.resource_id === params.resourceId);
    }
    if (params?.status && params.status !== 'all') {
      list = list.filter(t => t.status === params.status);
    }
    return list;
  }

  async getResponderTask(taskId: string): Promise<ResponderTask> {
    const task = this.inMemoryResponderTasks.find(t => t.id === taskId);
    if (!task) throw new Error(`Responder task '${taskId}' not found.`);
    return task;
  }

  async updateResponderTaskStatus(
    taskId: string, 
    newStatus: ResponderTaskStatus, 
    notes?: string
  ): Promise<ResponderTask> {
    const task = this.inMemoryResponderTasks.find(t => t.id === taskId);
    if (!task) throw new Error(`Responder task '${taskId}' not found.`);

    task.status = newStatus;
    const now = new Date().toISOString();
    if (newStatus === 'acknowledged' && !task.acknowledged_at) task.acknowledged_at = now;
    if (newStatus === 'en_route' && !task.en_route_at) task.en_route_at = now;
    if (newStatus === 'on_site' && !task.on_site_at) task.on_site_at = now;

    task.timeline.push({
      id: `tl-${Date.now()}`,
      status: newStatus,
      timestamp: now,
      notes: notes || `Unit transitioned task status to ${newStatus.replace('_', ' ').toUpperCase()}`,
      recorded_by: task.resource_name
    });

    // Synchronize Incident status when responder begins movement
    if (newStatus === 'en_route' || newStatus === 'on_site' || newStatus === 'in_progress') {
      const inc = this.inMemoryIncidents.find(i => 
        i.id === task.incident_id || 
        i.reference_code.toUpperCase() === task.incident_reference.toUpperCase()
      );
      if (inc && inc.status !== 'in_progress' && inc.status !== 'resolved') {
        const prev = inc.status;
        inc.status = 'in_progress';
        inc.updated_at = now;
        if (!inc.status_history) inc.status_history = [];
        inc.status_history.push({
          id: `h-prog-${Date.now()}`,
          previous_status: prev,
          new_status: 'in_progress',
          notes: `Tactical unit ${task.resource_name} is ${newStatus.replace('_', ' ').toUpperCase()} on-scene`,
          created_at: now
        });
      }
    }

    return task;
  }

  async completeResponderTask(taskId: string, outcome: TaskOutcome): Promise<ResponderTask> {
    const task = this.inMemoryResponderTasks.find(t => t.id === taskId);
    if (!task) throw new Error(`Responder task '${taskId}' not found.`);

    // Validation
    if (Number(outcome.people_rescued) < 0 || Number(outcome.casualties_treated) < 0) {
      throw new Error('People rescued or casualties count cannot be negative.');
    }
    if (!outcome.responder_signoff || outcome.responder_signoff.trim().length === 0) {
      throw new Error('Authorized responder sign-off is required to verify task completion.');
    }
    if (!outcome.outcome_notes || outcome.outcome_notes.trim().length < 5) {
      throw new Error('Detailed mission outcome notes are required (at least 5 characters).');
    }

    const now = new Date().toISOString();
    task.status = 'completed';
    task.completed_at = now;
    task.outcome = {
      ...outcome,
      completed_at: now,
      verification_code: outcome.verification_code || `VERIF-${Math.floor(1000 + Math.random() * 9000)}-${task.id.toUpperCase()}`
    };

    task.timeline.push({
      id: `tl-complete-${Date.now()}`,
      status: 'completed',
      timestamp: now,
      notes: `Mission completed by ${outcome.responder_signoff}. Rescued: ${outcome.people_rescued}. Notes: ${outcome.outcome_notes}`,
      recorded_by: outcome.responder_signoff
    });

    // Consistently update corresponding Incident
    const inc = this.inMemoryIncidents.find(i => 
      i.id === task.incident_id || 
      i.reference_code.toUpperCase() === task.incident_reference.toUpperCase()
    );
    if (inc) {
      const prevStatus = inc.status;
      inc.status = 'resolved';
      inc.updated_at = now;
      if (!inc.status_history) inc.status_history = [];
      inc.status_history.push({
        id: `h-res-${Date.now()}`,
        previous_status: prevStatus,
        new_status: 'resolved',
        notes: `Mission completed by ${task.resource_name}. Rescued: ${outcome.people_rescued} evacuees. Transferred to ${outcome.transported_to_facility_name || 'safe zone'}. Verification Code: ${task.outcome.verification_code}`,
        created_at: now
      });
    }

    // Consistently update assigned Resource back to 'available'
    const res = this.inMemoryResources.find(r => r.id === task.resource_id);
    if (res) {
      res.status = 'available';
      res.updated_at = now;
      if (res.assignment_history && res.assignment_history.length > 0) {
        const activeAsg = res.assignment_history.find(a => 
          a.incident_id === task.incident_id || 
          a.incident_ref === task.incident_reference
        );
        if (activeAsg) {
          activeAsg.status = 'completed';
          activeAsg.completed_at = now;
          activeAsg.notes = `Mission completed: ${outcome.outcome_notes}`;
        }
      }
    }

    return task;
  }

  // ── Phase 6: Forecasts & Intelligence ──────────────────────────────────────
  async getForecasts(params?: { sector?: string; risk?: string }): Promise<ForecastRecord[]> {
    let list = [...this.inMemoryForecasts];
    if (params?.sector && params.sector !== 'all') {
      list = list.filter(f => f.sector_area === params.sector);
    }
    if (params?.risk && params.risk !== 'all') {
      list = list.filter(f => f.risk_level === params.risk);
    }
    return list;
  }

  // ── Phase 6: Audit Trail ───────────────────────────────────────────────────
  async getAuditLogs(params?: { record_type?: string; actor_role?: string; search?: string }): Promise<AuditLogEntry[]> {
    let list = [...this.inMemoryAuditLogs];
    if (params?.record_type && params.record_type !== 'all') {
      list = list.filter(l => l.record_type === params.record_type);
    }
    if (params?.actor_role && params.actor_role !== 'all') {
      list = list.filter(l => l.actor_role.toLowerCase().includes(params.actor_role!.toLowerCase()));
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(l =>
        l.action.toLowerCase().includes(q) ||
        l.actor_name.toLowerCase().includes(q) ||
        (l.record_ref && l.record_ref.toLowerCase().includes(q)) ||
        (l.reason && l.reason.toLowerCase().includes(q))
      );
    }
    return list;
  }

  async recordAuditLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<AuditLogEntry> {
    const newLog: AuditLogEntry = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      ip_address: '10.0.4.1',
      ...entry,
    };
    this.inMemoryAuditLogs.unshift(newLog);
    return newLog;
  }

  // ── Phase 6: Disaster Events ───────────────────────────────────────────────
  async createEvent(data: Partial<DisasterEvent>): Promise<DisasterEvent> {
    if (!data.name?.trim()) throw new Error('Disaster Event name is required.');
    const newEvent: DisasterEvent = {
      id: `evt-${Date.now()}`,
      name: data.name,
      disaster_type: data.disaster_type || 'flood',
      status: data.status || 'active',
      severity: data.severity || 'high',
      description: data.description || '',
      declaration_date: new Date().toISOString(),
      affected_region_name: data.affected_region_name || 'Central River Basin',
      created_at: new Date().toISOString(),
    };
    this.inMemoryEvents.unshift(newEvent);
    this.recordAuditLog({
      actor_id: 'usr-001',
      actor_name: 'Capt. R. Vance',
      actor_role: 'Incident Commander',
      action: 'DISASTER_EVENT_DECLARED',
      record_type: 'event',
      record_id: newEvent.id,
      record_ref: newEvent.name,
      new_state: `severity: ${newEvent.severity}, status: ${newEvent.status}`,
      reason: 'State Emergency Operations Center declared active disaster scenario.'
    });
    return newEvent;
  }

  async updateEvent(id: string, data: Partial<DisasterEvent>): Promise<DisasterEvent> {
    const evt = this.inMemoryEvents.find(e => e.id === id);
    if (!evt) throw new Error(`Disaster event '${id}' not found.`);
    const prevState = `severity: ${evt.severity}, status: ${evt.status}`;
    Object.assign(evt, data);
    this.recordAuditLog({
      actor_id: 'usr-001',
      actor_name: 'Capt. R. Vance',
      actor_role: 'Incident Commander',
      action: 'DISASTER_EVENT_UPDATED',
      record_type: 'event',
      record_id: evt.id,
      record_ref: evt.name,
      previous_state: prevState,
      new_state: `severity: ${evt.severity}, status: ${evt.status}`,
      reason: 'Scenario parameters adjusted by Incident Command.'
    });
    return evt;
  }

  // ── Phase 6: Responders & Field Teams ──────────────────────────────────────
  async getResponders(): Promise<ResponderRecord[]> {
    return [...this.inMemoryResponders];
  }

  async createResponder(data: Partial<ResponderRecord>): Promise<ResponderRecord> {
    if (!data.callsign?.trim()) throw new Error('Unit callsign is required.');
    const newResp: ResponderRecord = {
      id: `resp-${Date.now()}`,
      callsign: data.callsign.toUpperCase(),
      lead_name: data.lead_name || 'Unassigned',
      unit_type: data.unit_type || 'Zodiac Rescue Boat',
      organization: data.organization || 'State Disaster Response Force',
      contact_phone: data.contact_phone || '555-019-0000',
      radio_frequency: data.radio_frequency || 'VHF 156.800 MHz (Tactical 2)',
      current_status: data.current_status || 'available',
      active_incident_ref: null,
      total_missions: 0,
      last_active_at: new Date().toISOString(),
    };
    this.inMemoryResponders.unshift(newResp);
    this.recordAuditLog({
      actor_id: 'usr-001',
      actor_name: 'Capt. R. Vance',
      actor_role: 'Incident Commander',
      action: 'RESPONDER_UNIT_COMMISSIONED',
      record_type: 'resource',
      record_id: newResp.id,
      record_ref: newResp.callsign,
      new_state: `status: ${newResp.current_status}, lead: ${newResp.lead_name}`,
      reason: 'New field unit integrated into active emergency radio roster.'
    });
    return newResp;
  }

  async updateResponderStatus(id: string, status: ResponderRecord['current_status']): Promise<ResponderRecord> {
    const r = this.inMemoryResponders.find(item => item.id === id);
    if (!r) throw new Error(`Responder '${id}' not found.`);
    const prev = r.current_status;
    r.current_status = status;
    r.last_active_at = new Date().toISOString();
    this.recordAuditLog({
      actor_id: 'usr-001',
      actor_name: 'Capt. R. Vance',
      actor_role: 'Incident Commander',
      action: 'RESPONDER_STATUS_CHANGED',
      record_type: 'resource',
      record_id: r.id,
      record_ref: r.callsign,
      previous_state: `status: ${prev}`,
      new_state: `status: ${status}`,
      reason: 'Tactical status updated in command roster.'
    });
    return r;
  }

  // ── Phase 6: User & Role Administration ────────────────────────────────────
  async getUsers(): Promise<AdminUser[]> {
    return [...this.inMemoryAdminUsers];
  }

  async createUser(data: Partial<AdminUser>): Promise<AdminUser> {
    if (!data.email?.trim() || !data.name?.trim()) {
      throw new Error('Name and email are required to create a system user.');
    }
    const newUser: AdminUser = {
      id: `usr-${Date.now()}`,
      name: data.name,
      email: data.email,
      role: data.role || 'responder',
      organization: data.organization || 'Disaster Relief Partner Network',
      status: data.status || 'active',
      last_login_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };
    this.inMemoryAdminUsers.push(newUser);
    this.recordAuditLog({
      actor_id: 'usr-004',
      actor_name: 'Adm. Thomas Thorne',
      actor_role: 'System Administrator',
      action: 'USER_CREATED',
      record_type: 'user',
      record_id: newUser.id,
      record_ref: newUser.email,
      new_state: `role: ${newUser.role}, status: ${newUser.status}`,
      reason: 'New administrative credential provisioned.'
    });
    return newUser;
  }

  async updateUserRole(id: string, role: AdminUser['role'], status?: AdminUser['status']): Promise<AdminUser> {
    const u = this.inMemoryAdminUsers.find(item => item.id === id);
    if (!u) throw new Error(`User '${id}' not found.`);
    const prevRole = u.role;
    const prevStatus = u.status;
    u.role = role;
    if (status) u.status = status;
    this.recordAuditLog({
      actor_id: 'usr-004',
      actor_name: 'Adm. Thomas Thorne',
      actor_role: 'System Administrator',
      action: 'USER_ROLE_OR_STATUS_MODIFIED',
      record_type: 'user',
      record_id: u.id,
      record_ref: u.email,
      previous_state: `role: ${prevRole}, status: ${prevStatus}`,
      new_state: `role: ${role}, status: ${u.status}`,
      reason: 'Access control permissions modified by administrator.'
    });
    return u;
  }

  // ── Phase 6: Operations Settings ───────────────────────────────────────────
  async getSettings(): Promise<OpsSettings> {
    return { ...this.inMemorySettings };
  }

  async updateSettings(data: Partial<OpsSettings>): Promise<OpsSettings> {
    const prev = JSON.stringify(this.inMemorySettings);
    this.inMemorySettings = { ...this.inMemorySettings, ...data };
    this.recordAuditLog({
      actor_id: 'usr-001',
      actor_name: 'Capt. R. Vance',
      actor_role: 'Incident Commander',
      action: 'OPS_SETTINGS_MODIFIED',
      record_type: 'facility',
      record_id: 'system-config',
      record_ref: 'COMMAND-SETTINGS',
      previous_state: prev,
      new_state: JSON.stringify(this.inMemorySettings),
      reason: 'Operational command center thresholds and default frequencies reconfigured.'
    });
    return { ...this.inMemorySettings };
  }

  async resetDemoData(): Promise<void> {
    this.inMemoryIncidents = [...FALLBACK_INCIDENTS];
    this.inMemoryResources = [...FALLBACK_RESOURCES];
    this.inMemoryFacilities = [...FALLBACK_FACILITIES];
    this.inMemoryInventory = [...FALLBACK_INVENTORY];
    this.inMemoryDistributions = [...FALLBACK_DISTRIBUTIONS];
    this.inMemoryResponderTasks = [...FALLBACK_RESPONDER_TASKS];
    this.inMemoryPartnerOrgs = [...FALLBACK_PARTNER_ORGS];
    this.inMemoryEvents = [...FALLBACK_EVENTS];
    this.inMemoryForecasts = [...FALLBACK_FORECASTS];
    this.inMemoryAuditLogs = [...FALLBACK_AUDIT_LOGS];
    this.inMemoryAdminUsers = [...FALLBACK_ADMIN_USERS];
    this.inMemoryResponders = [...FALLBACK_RESPONDER_RECORDS];
    this.inMemorySettings = { ...FALLBACK_OPS_SETTINGS };
  }
}

export const api = new ApiClient();


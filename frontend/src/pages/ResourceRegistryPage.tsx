import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Resource, ResourceType, ResourceStatus } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import {
  Truck,
  BatteryMedium,
  Users,
  Phone,
  MapPin,
  Plus,
  X,
  RefreshCw,
  LifeBuoy,
  Search,
  Filter,
  Shield,
  Clock,
  ArrowRight,
  ChevronRight,
  AlertTriangle,
  Building2,
  CheckCircle2
} from 'lucide-react';

export const ResourceRegistryPage: React.FC = () => {
  const navigate = useNavigate();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Registration Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<ResourceType>('boat');
  const [organization, setOrganization] = useState('Metro Water Rescue Service');
  const [passengerCapacity, setPassengerCapacity] = useState(8);
  const [crewCount, setCrewCount] = useState(2);
  const [batteryFuelPct, setBatteryFuelPct] = useState(100);
  const [leadName, setLeadName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadResources = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getResources({
        status: statusFilter === 'all' ? undefined : statusFilter,
        resource_type: typeFilter === 'all' ? undefined : typeFilter,
        search: searchQuery ? searchQuery : undefined,
      });
      setResources(data);
    } catch (err: any) {
      console.error('Failed to load fleet resources:', err);
      setError(err.message || 'Failed to load resources from fleet service.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, [statusFilter, typeFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadResources();
  };

  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Form Validations
    if (!name.trim()) {
      setFormError('Resource name / callsign is required.');
      return;
    }
    if (Number(passengerCapacity) < 0) {
      setFormError('Passenger capacity cannot be negative.');
      return;
    }
    if (Number(crewCount) < 0) {
      setFormError('Crew count cannot be negative.');
      return;
    }
    if (Number(batteryFuelPct) < 0 || Number(batteryFuelPct) > 100) {
      setFormError('Fuel or battery percentage must be between 0 and 100.');
      return;
    }

    setSaving(true);
    try {
      await api.createResource({
        name: name.trim(),
        resource_type: type,
        status: 'available',
        organization_name: organization.trim(),
        passenger_capacity: Number(passengerCapacity),
        crew_count: Number(crewCount),
        battery_or_fuel_pct: Number(batteryFuelPct),
        responder_lead_name: leadName.trim(),
        contact_phone: contactPhone.trim(),
        operational_notes: notes.trim(),
        latitude: 28.5800 + (Math.random() - 0.5) * 0.04,
        longitude: 77.2300 + (Math.random() - 0.5) * 0.04,
      });
      setModalOpen(false);
      setName('');
      setNotes('');
      setLeadName('');
      setContactPhone('');
      await loadResources();
    } catch (err: any) {
      setFormError(err.message || 'Failed to register resource');
    } finally {
      setSaving(false);
    }
  };

  // Quick availability status toggle from registry table
  const handleQuickStatusChange = async (e: React.MouseEvent, resId: string, currentStatus: ResourceStatus) => {
    e.stopPropagation();
    const nextStatus: ResourceStatus =
      currentStatus === 'available'
        ? 'maintenance'
        : currentStatus === 'maintenance'
        ? 'available'
        : currentStatus;

    if (currentStatus === 'deployed') {
      alert('This unit is currently deployed on an active mission. To change status, complete or reassign the active mission in the Dispatch Console.');
      return;
    }

    try {
      await api.updateResourceStatus(resId, nextStatus, `Operator toggled status to ${nextStatus}`);
      await loadResources();
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  };

  // Metrics
  const totalFleet = resources.length;
  const availableFleet = resources.filter((r) => r.status === 'available').length;
  const deployedFleet = resources.filter((r) => r.status === 'deployed').length;
  const maintenanceFleet = resources.filter((r) => r.status === 'maintenance').length;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-signalCyan uppercase tracking-widest mb-1">
            <span>OPERATIONS CONTROL</span>
            <span>/</span>
            <span className="text-slate-400">RESOURCE REGISTRY</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Truck className="w-7 h-7 text-signalCyan" />
            Rescue Fleet & Responder Registry
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Operational registry tracking swift-water rescue craft, high-clearance 6x6 trucks, paramedic ambulances, and reconnaissance drones.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadResources}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surfaceContainer hover:bg-surfaceRaised border border-slate-700/80 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Sync
          </button>

          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-signalCyan hover:bg-signalCyan/90 text-midnight font-bold text-xs transition-all shadow-lg shadow-signalCyan/15 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Register Asset
          </button>
        </div>
      </div>

      {/* KPI Metric Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-surfaceContainer border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium block">Total Registered Fleet</span>
            <span className="text-2xl font-black text-white">{totalFleet}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 font-bold">
            <Truck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surfaceContainer border border-emerald-500/30 flex items-center justify-between">
          <div>
            <span className="text-xs text-emerald-300 font-medium block">Available for Dispatch</span>
            <span className="text-2xl font-black text-emerald-400">{availableFleet}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surfaceContainer border border-blue-500/30 flex items-center justify-between">
          <div>
            <span className="text-xs text-blue-300 font-medium block">Actively Deployed</span>
            <span className="text-2xl font-black text-blue-400">{deployedFleet}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-950/80 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold">
            <LifeBuoy className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surfaceContainer border border-amber-500/30 flex items-center justify-between">
          <div>
            <span className="text-xs text-amber-300 font-medium block">Maintenance & Restock</span>
            <span className="text-2xl font-black text-amber-400">{maintenanceFleet}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-surfaceContainer border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[260px]">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search resource by callsign, organization, or lead..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-midnight border border-slate-700/80 focus:border-signalCyan text-xs text-white placeholder-slate-500 outline-none transition-all font-mono"
            />
          </div>
        </form>

        {/* Type Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Category:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            aria-label="Filter resources by vehicle type"
            className="px-3 py-2 rounded-xl bg-midnight border border-slate-700/80 text-xs text-white outline-none focus:border-signalCyan capitalize"
          >
            <option value="all">All Vehicle Types</option>
            <option value="boat">Rescue Boat</option>
            <option value="evacuation_truck">Evacuation Truck (6x6)</option>
            <option value="ambulance">Paramedic Ambulance</option>
            <option value="drone">Reconnaissance Drone</option>
            <option value="medical_team">Medical Team</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Availability:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter resources by availability status"
            className="px-3 py-2 rounded-xl bg-midnight border border-slate-700/80 text-xs text-white outline-none focus:border-signalCyan capitalize"
          >
            <option value="all">All Statuses</option>
            <option value="available">Available</option>
            <option value="deployed">Deployed</option>
            <option value="maintenance">Maintenance</option>
            <option value="decommissioned">Decommissioned</option>
          </select>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-950/60 border border-red-500/50 text-red-300 text-xs flex items-center justify-between">
          <span>{error}</span>
          <button onClick={loadResources} className="underline hover:text-white">
            Retry
          </button>
        </div>
      )}

      {/* Resources Table */}
      <div className="rounded-2xl bg-surfaceContainer border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-midnight/70 text-slate-400 uppercase font-mono tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Asset ID & Callsign</th>
                <th className="py-3.5 px-4">Vehicle Type</th>
                <th className="py-3.5 px-4">Responsible Organization</th>
                <th className="py-3.5 px-4">Capacity & Crew</th>
                <th className="py-3.5 px-4">Fuel / Power</th>
                <th className="py-3.5 px-4">Availability</th>
                <th className="py-3.5 px-4">Last Updated</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {resources.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <Truck className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="font-semibold text-slate-400">No fleet assets match active filters.</p>
                    <p className="text-[11px] mt-1">Try resetting the search query or status filter.</p>
                  </td>
                </tr>
              ) : (
                resources.map((res) => (
                  <tr
                    key={res.id}
                    onClick={() => navigate(`/ops/resources/${res.id}`)}
                    className="hover:bg-surfaceRaised/50 transition-colors group cursor-pointer"
                  >
                    {/* Name & ID */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-white group-hover:text-signalCyan transition-colors">
                          {res.name}
                        </span>
                        <span className="font-mono text-[10px] text-slate-500">
                          ID: {res.id}
                        </span>
                      </div>
                    </td>

                    {/* Type */}
                    <td className="py-3.5 px-4 capitalize text-slate-300">
                      {res.resource_type.replace('_', ' ')}
                    </td>

                    {/* Organization */}
                    <td className="py-3.5 px-4 text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                        <span className="truncate max-w-[160px]">
                          {res.organization_name || 'Emergency Relief Agency'}
                        </span>
                      </div>
                    </td>

                    {/* Capacity & Crew */}
                    <td className="py-3.5 px-4 text-slate-300">
                      <div className="flex items-center gap-1 text-slate-200 font-medium">
                        <Users className="w-3.5 h-3.5 text-slate-500" />
                        <span>{res.passenger_capacity} seats</span>
                      </div>
                      <span className="text-[10px] text-slate-500">Crew of {res.crew_count}</span>
                    </td>

                    {/* Fuel / Power */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <div className="w-12 h-2 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full ${
                              res.battery_or_fuel_pct > 50
                                ? 'bg-emerald-500'
                                : res.battery_or_fuel_pct > 20
                                ? 'bg-amber-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${res.battery_or_fuel_pct}%` }}
                          />
                        </div>
                        <span className="font-mono text-[11px] text-slate-400">
                          {res.battery_or_fuel_pct}%
                        </span>
                      </div>
                    </td>

                    {/* Availability */}
                    <td className="py-3.5 px-4">
                      <StatusBadge type="resource" value={res.status} />
                    </td>

                    {/* Last Updated */}
                    <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px] whitespace-nowrap">
                      {new Date(res.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>

                    {/* Actions */}
                    <td
                      className="py-3.5 px-4 text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-2">
                        {res.status !== 'deployed' && (
                          <button
                            type="button"
                            onClick={(e) => handleQuickStatusChange(e, res.id, res.status)}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition-colors border border-slate-700"
                            title="Toggle Availability"
                          >
                            {res.status === 'available' ? 'Mark Maint' : 'Mark Avail'}
                          </button>
                        )}

                        <Link
                          to={`/ops/resources/${res.id}`}
                          className="px-2.5 py-1 rounded-lg bg-signalCyan/15 hover:bg-signalCyan/30 text-signalCyan font-bold text-[11px] transition-colors border border-signalCyan/30 flex items-center gap-1"
                        >
                          Dossier <ChevronRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-midnight/50 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Showing {resources.length} active fleet assets</span>
          <span className="font-mono">Storm Command Logistics Engine</span>
        </div>
      </div>

      {/* Register Asset Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-surfaceContainer border border-slate-700 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Truck className="w-5 h-5 text-signalCyan" />
                Register New Fleet Resource
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateResource} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Asset Name / Callsign *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Amphibious Transport Alpha-07"
                    className="w-full px-3 py-2 rounded-xl bg-midnight border border-slate-700 text-xs text-white outline-none focus:border-signalCyan"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Vehicle Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as ResourceType)}
                    className="w-full px-3 py-2 rounded-xl bg-midnight border border-slate-700 text-xs text-white outline-none focus:border-signalCyan capitalize"
                  >
                    <option value="boat">Rescue Boat</option>
                    <option value="evacuation_truck">Evacuation Truck</option>
                    <option value="ambulance">Paramedic Ambulance</option>
                    <option value="drone">Recon Drone</option>
                    <option value="medical_team">Medical Team</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Responsible Organization
                  </label>
                  <input
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="e.g. Coast Guard Auxiliary"
                    className="w-full px-3 py-2 rounded-xl bg-midnight border border-slate-700 text-xs text-white outline-none focus:border-signalCyan"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Passenger Capacity
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={passengerCapacity}
                    onChange={(e) => setPassengerCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-midnight border border-slate-700 text-xs text-white outline-none focus:border-signalCyan"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Crew Size
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={crewCount}
                    onChange={(e) => setCrewCount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-midnight border border-slate-700 text-xs text-white outline-none focus:border-signalCyan"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Responder Lead Name
                  </label>
                  <input
                    type="text"
                    value={leadName}
                    onChange={(e) => setLeadName(e.target.value)}
                    placeholder="e.g. Captain J. Miller"
                    className="w-full px-3 py-2 rounded-xl bg-midnight border border-slate-700 text-xs text-white outline-none focus:border-signalCyan"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Direct Contact Phone
                  </label>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="e.g. 555-019-8822"
                    className="w-full px-3 py-2 rounded-xl bg-midnight border border-slate-700 text-xs text-white outline-none focus:border-signalCyan"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Operational Remarks & Capabilities
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Shallow water draft with reinforced hull and thermal FLIR camera."
                    className="w-full px-3 py-2 rounded-xl bg-midnight border border-slate-700 text-xs text-white outline-none focus:border-signalCyan"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-signalCyan hover:bg-signalCyan/90 disabled:opacity-50 text-midnight text-xs font-bold transition-all shadow-md"
                >
                  {saving ? 'Registering...' : 'Register Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceRegistryPage;

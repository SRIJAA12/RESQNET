import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Facility, FacilityType, ShelterStatus } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import {
  Building2,
  Users,
  Bed,
  Plus,
  RefreshCw,
  Search,
  Filter,
  MapPin,
  HeartPulse,
  Zap,
  Dog,
  Droplet,
  ChevronRight,
  AlertTriangle,
  Clock,
  ShieldCheck,
  CheckCircle2,
  X
} from 'lucide-react';

export const FacilitiesListPage: React.FC = () => {
  const navigate = useNavigate();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Registration Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<FacilityType>('shelter');
  const [organization, setOrganization] = useState('Municipal Relief Board');
  const [address, setAddress] = useState('');
  const [managerName, setManagerName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [capacityInput, setCapacityInput] = useState<string>('200');
  const [occupancyInput, setOccupancyInput] = useState<string>('0');
  const [medicalAvailable, setMedicalAvailable] = useState(true);
  const [generatorBackup, setGeneratorBackup] = useState(true);
  const [petFriendly, setPetFriendly] = useState(false);
  const [waterPurificationLiters, setWaterPurificationLiters] = useState(2000);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadFacilities = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getFacilities({
        status: statusFilter === 'all' ? undefined : statusFilter,
        facility_type: typeFilter === 'all' ? undefined : typeFilter,
        search: searchQuery ? searchQuery : undefined,
      });
      setFacilities(data);
    } catch (err: any) {
      console.error('Failed to load facilities:', err);
      setError(err.message || 'Failed to load shelter and hospital facilities.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFacilities();
  }, [statusFilter, typeFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadFacilities();
  };

  const handleCreateFacility = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validation
    if (!name.trim()) {
      setFormError('Facility name is required.');
      return;
    }
    if (!address.trim()) {
      setFormError('Physical facility address is required.');
      return;
    }

    const cap = capacityInput.trim() === '' ? null : Number(capacityInput);
    if (cap !== null && cap < 0) {
      setFormError('Capacity cannot be negative.');
      return;
    }

    const occ = Number(occupancyInput);
    if (occ < 0) {
      setFormError('Current occupancy cannot be negative.');
      return;
    }

    setSaving(true);
    try {
      await api.createFacility({
        name: name.trim(),
        facility_type: type,
        status: cap !== null && occ >= cap ? 'full' : 'active',
        organization_name: organization.trim(),
        address: address.trim(),
        manager_name: managerName.trim(),
        contact_phone: contactPhone.trim(),
        capacity_total: cap,
        current_occupancy: occ,
        medical_facilities_available: medicalAvailable,
        generator_backup: generatorBackup,
        pet_friendly: petFriendly,
        water_purification_capacity_liters: Number(waterPurificationLiters) || 0,
        latitude: 28.5800 + (Math.random() - 0.5) * 0.04,
        longitude: 77.2300 + (Math.random() - 0.5) * 0.04,
      });
      setModalOpen(false);
      setName('');
      setAddress('');
      await loadFacilities();
    } catch (err: any) {
      setFormError(err.message || 'Failed to register facility');
    } finally {
      setSaving(false);
    }
  };

  // Helper: check data freshness (> 4 hours is considered STALE)
  const isDataStale = (censusTimestamp?: string) => {
    if (!censusTimestamp) return true;
    const diffHours = (Date.now() - new Date(censusTimestamp).getTime()) / (1000 * 3600);
    return diffHours >= 4;
  };

  const formatFreshness = (censusTimestamp?: string) => {
    if (!censusTimestamp) return 'No census logged';
    const diffMinutes = Math.floor((Date.now() - new Date(censusTimestamp).getTime()) / (1000 * 60));
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    return `${diffHours}h ago`;
  };

  // Metrics
  const totalKnownCapacity = facilities.reduce((sum, f) => sum + (f.capacity_total || 0), 0);
  const totalOccupancy = facilities.reduce((sum, f) => sum + f.current_occupancy, 0);
  const staleCount = facilities.filter((f) => isDataStale(f.last_census_updated_at)).length;

  return (
    <div className="space-y-6 animate-fadeIn max-w-[1440px] mx-auto pb-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-cloud-white tracking-tight">
            Shelters & hospitals
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Capacity tracking, occupancy rates, and medical readiness across disaster sectors.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadFacilities}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-control bg-surface hover:bg-deep-slate border border-border text-xs text-text-secondary hover:text-cloud-white transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-control bg-cyan hover:bg-cloud-white text-midnight font-heading font-bold text-xs transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Register facility
          </button>
        </div>
      </div>

      {/* 4 Compact Summary Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-card bg-surface border border-border/80 flex items-center justify-between">
          <div>
            <span className="text-xs text-text-muted font-medium block">Total facilities</span>
            <span className="font-heading font-extrabold text-2xl text-cloud-white mt-0.5 block">{facilities.length}</span>
          </div>
          <div className="w-9 h-9 rounded-control bg-deep-slate text-text-secondary flex items-center justify-center">
            <Building2 className="w-4 h-4" />
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-card bg-surface border border-border/80 flex items-center justify-between">
          <div>
            <span className="text-xs text-text-muted font-medium block">Known bed capacity</span>
            <span className="font-heading font-extrabold text-2xl text-cyan mt-0.5 block">{totalKnownCapacity}</span>
          </div>
          <div className="w-9 h-9 rounded-control bg-cyan/15 text-cyan flex items-center justify-center">
            <Bed className="w-4 h-4" />
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-card bg-surface border border-border/80 flex items-center justify-between">
          <div>
            <span className="text-xs text-text-muted font-medium block">Active occupancy</span>
            <span className="font-heading font-extrabold text-2xl text-cloud-white mt-0.5 block">{totalOccupancy}</span>
          </div>
          <div className="w-9 h-9 rounded-control bg-deep-slate text-text-secondary flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-card bg-surface border border-border/80 flex items-center justify-between">
          <div>
            <span className="text-xs text-text-muted font-medium block">Stale census</span>
            <span className="font-heading font-extrabold text-2xl text-amber mt-0.5 block">{staleCount}</span>
          </div>
          <div className="w-9 h-9 rounded-control bg-amber/15 text-amber flex items-center justify-center">
            <AlertTriangle className="w-4 h-4" />
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
              placeholder="Search facility by name, address, or organization..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-midnight border border-slate-700/80 focus:border-signalCyan text-xs text-white placeholder-slate-500 outline-none transition-all font-mono"
            />
          </div>
        </form>

        {/* Facility Type Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Type:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            aria-label="Filter by facility type"
            className="px-3 py-2 rounded-xl bg-midnight border border-slate-700/80 text-xs text-white outline-none focus:border-signalCyan capitalize"
          >
            <option value="all">All Facility Types</option>
            <option value="shelter">Emergency Shelter</option>
            <option value="hospital">Hospital & Trauma Base</option>
            <option value="clinic">Field Clinic</option>
            <option value="evacuation_center">Evacuation Center</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by facility status"
            className="px-3 py-2 rounded-xl bg-midnight border border-slate-700/80 text-xs text-white outline-none focus:border-signalCyan capitalize"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active (Accepting)</option>
            <option value="full">Full (At Capacity)</option>
            <option value="closed">Closed / Standby</option>
          </select>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-950/60 border border-red-500/50 text-red-300 text-xs flex items-center justify-between">
          <span>{error}</span>
          <button onClick={loadFacilities} className="underline hover:text-white">
            Retry
          </button>
        </div>
      )}

      {/* Facilities Table */}
      <div className="rounded-2xl bg-surfaceContainer border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-midnight/70 text-slate-400 uppercase font-mono tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Facility Name & Type</th>
                <th className="py-3.5 px-4">Location & Organization</th>
                <th className="py-3.5 px-4">Capacity & Occupancy</th>
                <th className="py-3.5 px-4">Available Capacity</th>
                <th className="py-3.5 px-4">Operating Status</th>
                <th className="py-3.5 px-4">Census Freshness</th>
                <th className="py-3.5 px-4">Key Amenities</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {facilities.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <Building2 className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="font-semibold text-slate-400">No facilities match the active filter criteria.</p>
                  </td>
                </tr>
              ) : (
                facilities.map((fac) => {
                  const stale = isDataStale(fac.last_census_updated_at);
                  const isUnknownCapacity = fac.capacity_total === null || fac.capacity_total === undefined;
                  const isZeroCapacity = fac.capacity_total === 0;

                  return (
                    <tr
                      key={fac.id}
                      onClick={() => navigate(`/ops/facilities/${fac.id}`)}
                      className="hover:bg-surfaceRaised/50 transition-colors group cursor-pointer"
                    >
                      {/* Name & Type */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-white group-hover:text-signalCyan transition-colors">
                            {fac.name}
                          </span>
                          <span className="inline-block mt-0.5 capitalize text-[10px] font-mono text-slate-400">
                            {fac.facility_type.replace('_', ' ')}
                          </span>
                        </div>
                      </td>

                      {/* Location & Org */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="text-slate-300 truncate">{fac.address}</div>
                        <div className="text-[10px] text-slate-500 truncate">
                          {fac.organization_name || 'Municipal Relief'}
                        </div>
                      </td>

                      {/* Capacity & Occupancy */}
                      <td className="py-3.5 px-4">
                        {isUnknownCapacity ? (
                          <div>
                            <span className="text-amber-400 font-semibold text-[11px]">
                              Unknown Capacity
                            </span>
                            <span className="block text-[10px] text-slate-400">
                              {fac.current_occupancy} present
                            </span>
                          </div>
                        ) : isZeroCapacity ? (
                          <span className="text-slate-500 font-mono text-[11px]">
                            0 (Standby / Closed)
                          </span>
                        ) : (
                          <div>
                            <div className="flex items-center gap-1.5 font-mono text-slate-200">
                              <span className="font-bold text-white">{fac.current_occupancy}</span>
                              <span className="text-slate-500">/</span>
                              <span>{fac.capacity_total} beds</span>
                            </div>
                            <div className="w-20 h-1.5 rounded-full bg-slate-800 overflow-hidden mt-1">
                              <div
                                className={`h-full ${
                                  fac.current_occupancy >= (fac.capacity_total || 1)
                                    ? 'bg-rose-500'
                                    : fac.current_occupancy / (fac.capacity_total || 1) > 0.8
                                    ? 'bg-amber-500'
                                    : 'bg-emerald-500'
                                }`}
                                style={{
                                  width: `${Math.min(
                                    100,
                                    Math.round((fac.current_occupancy / (fac.capacity_total || 1)) * 100)
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Available Capacity */}
                      <td className="py-3.5 px-4 font-mono">
                        {isUnknownCapacity ? (
                          <span className="text-slate-500 text-[11px]">&mdash;</span>
                        ) : isZeroCapacity ? (
                          <span className="text-slate-500 text-[11px]">0</span>
                        ) : fac.available_beds !== null && fac.available_beds > 0 ? (
                          <span className="font-bold text-emerald-400">
                            {fac.available_beds} beds free
                          </span>
                        ) : (
                          <span className="font-bold text-rose-400">0 free (Full)</span>
                        )}
                      </td>

                      {/* Operating Status */}
                      <td className="py-3.5 px-4">
                        <StatusBadge type="shelter" value={fac.status} />
                      </td>

                      {/* Freshness */}
                      <td className="py-3.5 px-4 font-mono whitespace-nowrap">
                        {stale ? (
                          <span className="inline-flex items-center gap-1 text-amber-400 text-[11px] font-bold bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-600/40">
                            <AlertTriangle className="w-3 h-3" />
                            {formatFreshness(fac.last_census_updated_at)} (Stale)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-slate-300 text-[11px]">
                            <Clock className="w-3 h-3 text-emerald-400" />
                            {formatFreshness(fac.last_census_updated_at)}
                          </span>
                        )}
                      </td>

                      {/* Amenities */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-slate-400">
                          {fac.medical_facilities_available && (
                            <span title="Medical Facility Ready">
                              <HeartPulse className="w-3.5 h-3.5 text-red-400" />
                            </span>
                          )}
                          {fac.generator_backup && (
                            <span title="Generator Backup">
                              <Zap className="w-3.5 h-3.5 text-amber-400" />
                            </span>
                          )}
                          {fac.pet_friendly && (
                            <span title="Pet Friendly">
                              <Dog className="w-3.5 h-3.5 text-emerald-400" />
                            </span>
                          )}
                          {fac.water_purification_capacity_liters > 0 && (
                            <span title="Water Purification Onsite">
                              <Droplet className="w-3.5 h-3.5 text-cyan-400" />
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td
                        className="py-3.5 px-4 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Link
                          to={`/ops/facilities/${fac.id}`}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium transition-colors border border-slate-700 inline-flex items-center gap-1"
                        >
                          Details <ChevronRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-midnight/50 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Showing {facilities.length} relief facilities</span>
          <span className="font-mono">Storm Command Logistics Engine</span>
        </div>
      </div>

      {/* Registration Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-surfaceContainer border border-slate-700 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Building2 className="w-5 h-5 text-signalCyan" />
                Register New Relief Facility
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

            <form onSubmit={handleCreateFacility} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-slate-300 mb-1 font-medium">Facility Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. East River High School Gymnasium"
                    className="w-full px-3 py-2 rounded-xl bg-midnight border border-slate-700 text-white outline-none focus:border-signalCyan"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Facility Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as FacilityType)}
                    className="w-full px-3 py-2 rounded-xl bg-midnight border border-slate-700 text-white outline-none focus:border-signalCyan capitalize"
                  >
                    <option value="shelter">Emergency Shelter</option>
                    <option value="hospital">Hospital Base</option>
                    <option value="clinic">Field Clinic</option>
                    <option value="evacuation_center">Evacuation Center</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Operating Org</label>
                  <input
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-midnight border border-slate-700 text-white outline-none focus:border-signalCyan"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-300 mb-1 font-medium">Physical Address *</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. 450 Academic Way, Sector B"
                    className="w-full px-3 py-2 rounded-xl bg-midnight border border-slate-700 text-white outline-none focus:border-signalCyan"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">
                    Total Bed Capacity (leave blank if unknown)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={capacityInput}
                    onChange={(e) => setCapacityInput(e.target.value)}
                    placeholder="Leave blank for unknown"
                    className="w-full px-3 py-2 rounded-xl bg-midnight border border-slate-700 text-white outline-none focus:border-signalCyan"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Initial Occupancy</label>
                  <input
                    type="number"
                    min="0"
                    value={occupancyInput}
                    onChange={(e) => setOccupancyInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-midnight border border-slate-700 text-white outline-none focus:border-signalCyan"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Manager Name</label>
                  <input
                    type="text"
                    value={managerName}
                    onChange={(e) => setManagerName(e.target.value)}
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full px-3 py-2 rounded-xl bg-midnight border border-slate-700 text-white outline-none focus:border-signalCyan"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Contact Phone</label>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="e.g. 555-014-9988"
                    className="w-full px-3 py-2 rounded-xl bg-midnight border border-slate-700 text-white outline-none focus:border-signalCyan"
                  />
                </div>
              </div>

              {/* Switches */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={medicalAvailable}
                    onChange={(e) => setMedicalAvailable(e.target.checked)}
                    className="w-4 h-4 rounded text-signalCyan bg-midnight border-slate-700"
                  />
                  <span>Medical Clinic On-site</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={generatorBackup}
                    onChange={(e) => setGeneratorBackup(e.target.checked)}
                    className="w-4 h-4 rounded text-signalCyan bg-midnight border-slate-700"
                  />
                  <span>Emergency Generator</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={petFriendly}
                    onChange={(e) => setPetFriendly(e.target.checked)}
                    className="w-4 h-4 rounded text-signalCyan bg-midnight border-slate-700"
                  />
                  <span>Pet Friendly Shelter</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-signalCyan hover:bg-signalCyan/90 disabled:opacity-50 text-midnight font-bold"
                >
                  {saving ? 'Registering...' : 'Register Facility'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacilitiesListPage;

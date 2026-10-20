import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Facility, ShelterStatus } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import {
  ArrowLeft,
  Building2,
  Users,
  Bed,
  MapPin,
  Clock,
  HeartPulse,
  Zap,
  Dog,
  Droplet,
  AlertTriangle,
  RefreshCw,
  Plus,
  Compass,
  CheckCircle2,
  Truck,
  Package,
  History,
  Phone,
  User,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

export const FacilityDetailPage: React.FC = () => {
  const { facilityId } = useParams<{ facilityId: string }>();
  const navigate = useNavigate();

  const [facility, setFacility] = useState<Facility | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  // Census Update Adjuster State
  const [newOccupancy, setNewOccupancy] = useState<number>(0);
  const [censusNotes, setCensusNotes] = useState('');
  const [censusError, setCensusError] = useState<string | null>(null);
  const [censusSuccess, setCensusSuccess] = useState(false);

  const loadFacility = async () => {
    if (!facilityId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.getFacility(facilityId);
      setFacility(data);
      setNewOccupancy(data.current_occupancy);
    } catch (err: any) {
      console.error('Failed to load facility dossier:', err);
      setError(err.message || `Facility '${facilityId}' not found.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFacility();
  }, [facilityId]);

  // Check data freshness (> 4 hours is considered STALE)
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

  // Handle Census Headcount Update
  const handleUpdateCensus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!facility) return;
    setCensusError(null);

    // Validation: prevent negative occupancy
    if (newOccupancy < 0) {
      setCensusError('Occupancy count cannot be negative.');
      return;
    }

    setUpdating(true);
    try {
      const updated = await api.updateFacilityOccupancy(
        facility.id,
        Number(newOccupancy),
        censusNotes || 'Routine evacuee census count logged by control operator'
      );
      setFacility(updated);
      setCensusSuccess(true);
      setCensusNotes('');
      setTimeout(() => setCensusSuccess(false), 3000);
    } catch (err: any) {
      setCensusError(err.message || 'Failed to update occupancy.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center space-y-4">
        <RefreshCw className="w-8 h-8 text-signalCyan animate-spin mx-auto" />
        <p className="text-sm text-slate-400">Loading facility capacity dossier...</p>
      </div>
    );
  }

  if (error || !facility) {
    return (
      <div className="max-w-2xl mx-auto py-12 space-y-4 text-center">
        <div className="p-6 rounded-2xl bg-surfaceContainer border border-red-500/40 text-red-300">
          <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-2" />
          <h2 className="text-lg font-bold text-white">Facility Record Not Found</h2>
          <p className="text-xs text-slate-400 mt-1">{error || 'Facility not found in database.'}</p>
          <div className="mt-4">
            <button
              onClick={() => navigate('/ops/facilities')}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors"
            >
              Back to Facility Registry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isStale = isDataStale(facility.last_census_updated_at);
  const isUnknownCapacity = facility.capacity_total === null || facility.capacity_total === undefined;
  const isZeroCapacity = facility.capacity_total === 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fadeIn">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Link
              to="/ops/facilities"
              className="text-signalCyan hover:underline flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Facilities & Shelters
            </Link>
            <span>/</span>
            <span className="text-white font-bold">{facility.name}</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {facility.name}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700 capitalize">
              {facility.facility_type.replace('_', ' ')}
            </span>
            <StatusBadge type="shelter" value={facility.status} size="md" />
            {isStale && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-950/80 text-amber-300 border border-amber-500/50 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> STALE CENSUS DATA (&gt;4h)
              </span>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={loadFacility}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surfaceContainer hover:bg-surfaceRaised border border-slate-700 text-xs font-semibold text-slate-200 hover:text-white transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh State
          </button>

          <Link
            to={`/ops/distribution?facility_id=${facility.id}`}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-signalCyan hover:bg-signalCyan/90 text-midnight text-xs font-bold transition-all shadow-lg shadow-signalCyan/15"
          >
            <Package className="w-3.5 h-3.5" />
            Allocate Relief Supplies
          </Link>
        </div>
      </div>

      {/* Grid: Left Dossier / Right Capacity Adjuster & Audit History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Capacity & Facility Services */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Capacity & Occupancy Dashboard */}
          <div className="bg-surfaceContainer rounded-2xl p-6 border border-slate-800 space-y-5 shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
                <Bed className="w-4 h-4 text-signalCyan" />
                Live Bed Capacity & Census Telemetry
              </h2>
              <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                Last Census: {formatFreshness(facility.last_census_updated_at)}
              </span>
            </div>

            {/* Capacity Counter Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-midnight border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Total Registered Capacity</span>
                <span className="text-xl font-bold text-white flex items-center gap-1.5 mt-0.5">
                  <Bed className="w-4 h-4 text-slate-400" />
                  {isUnknownCapacity ? (
                    <span className="text-amber-400 font-semibold text-sm">Unknown Capacity</span>
                  ) : isZeroCapacity ? (
                    <span className="text-slate-400">0 (Standby)</span>
                  ) : (
                    `${facility.capacity_total} Beds`
                  )}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-midnight border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Current Occupancy Census</span>
                <span className="text-xl font-bold text-white flex items-center gap-1.5 mt-0.5">
                  <Users className="w-4 h-4 text-slate-400" />
                  {facility.current_occupancy} Evacuees
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-midnight border border-slate-800 col-span-2 sm:col-span-1">
                <span className="text-[11px] text-slate-400 block">Net Available Beds</span>
                <span className="text-xl font-bold mt-0.5 flex items-center gap-1.5">
                  {isUnknownCapacity ? (
                    <span className="text-slate-500 text-sm">Not calculated</span>
                  ) : isZeroCapacity ? (
                    <span className="text-slate-500 text-sm">0 Beds</span>
                  ) : facility.available_beds !== null && facility.available_beds > 0 ? (
                    <span className="text-emerald-400">{facility.available_beds} Free</span>
                  ) : (
                    <span className="text-rose-400">0 Free (Full)</span>
                  )}
                </span>
              </div>
            </div>

            {/* Visual Occupancy Bar (if capacity is known) */}
            {!isUnknownCapacity && !isZeroCapacity && facility.capacity_total && (
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-xs text-slate-400 font-mono">
                  <span>Intake Saturation</span>
                  <span>
                    {Math.round((facility.current_occupancy / facility.capacity_total) * 100)}% capacity
                  </span>
                </div>
                <div className="w-full h-3 rounded-full bg-midnight border border-slate-800 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      facility.current_occupancy >= facility.capacity_total
                        ? 'bg-rose-500'
                        : facility.current_occupancy / facility.capacity_total > 0.8
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{
                      width: `${Math.min(
                        100,
                        Math.round((facility.current_occupancy / facility.capacity_total) * 100)
                      )}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Address & Management Specs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-midnight border border-slate-800 space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-signalCyan" /> Physical Location & Access
                </span>
                <p className="text-sm font-semibold text-white">{facility.address}</p>
                <p className="text-[11px] font-mono text-slate-400">
                  LAT: {facility.latitude.toFixed(4)}° N &bull; LON: {facility.longitude.toFixed(4)}° E
                </p>
              </div>

              <div className="p-4 rounded-xl bg-midnight border border-slate-800 space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-500" /> Facility On-Site Director
                </span>
                <p className="text-sm font-semibold text-white">{facility.manager_name || 'Director Not Assigned'}</p>
                <p className="text-[11px] font-mono text-slate-300 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-500" /> {facility.contact_phone || 'Radio Command Only'}
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Services & Preparedness Amenities */}
          <div className="bg-surfaceContainer rounded-2xl p-6 border border-slate-800 space-y-4 shadow-lg">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-signalCyan" />
              On-Site Services & Life-Support Equipment
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className={`p-3.5 rounded-xl border ${facility.medical_facilities_available ? 'bg-midnight border-red-500/40 text-red-300' : 'bg-midnight/50 border-slate-800 text-slate-500'}`}>
                <HeartPulse className="w-5 h-5 mb-1.5" />
                <span className="font-bold block">Medical Bay</span>
                <span className="text-[10px]">{facility.medical_facilities_available ? 'Physician & Trauma Ready' : 'No Medical Bay'}</span>
              </div>

              <div className={`p-3.5 rounded-xl border ${facility.generator_backup ? 'bg-midnight border-amber-500/40 text-amber-300' : 'bg-midnight/50 border-slate-800 text-slate-500'}`}>
                <Zap className="w-5 h-5 mb-1.5" />
                <span className="font-bold block">Generator Power</span>
                <span className="text-[10px]">{facility.generator_backup ? 'Diesel Backup Active' : 'Grid Dependent'}</span>
              </div>

              <div className={`p-3.5 rounded-xl border ${facility.pet_friendly ? 'bg-midnight border-emerald-500/40 text-emerald-300' : 'bg-midnight/50 border-slate-800 text-slate-500'}`}>
                <Dog className="w-5 h-5 mb-1.5" />
                <span className="font-bold block">Pet Friendly</span>
                <span className="text-[10px]">{facility.pet_friendly ? 'Companion Animals Allowed' : 'No Pet Accommodations'}</span>
              </div>

              <div className={`p-3.5 rounded-xl border ${facility.water_purification_capacity_liters > 0 ? 'bg-midnight border-cyan-500/40 text-cyan-300' : 'bg-midnight/50 border-slate-800 text-slate-500'}`}>
                <Droplet className="w-5 h-5 mb-1.5" />
                <span className="font-bold block">Clean Water</span>
                <span className="text-[10px]">{facility.water_purification_capacity_liters} L/day capacity</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Census Adjuster & Capacity Audit History */}
        <div className="space-y-6">
          {/* Census Headcount Adjuster Form */}
          <div className="bg-surfaceContainer rounded-2xl p-5 border border-slate-800 space-y-4 shadow-lg">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
              <Users className="w-4 h-4 text-signalCyan" />
              Adjust Evacuee Headcount
            </h3>

            <p className="text-xs text-slate-400">
              Update the active occupancy census. Validated to prevent negative numbers and maintain capacity integrity.
            </p>

            {censusError && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{censusError}</span>
              </div>
            )}

            {censusSuccess && (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Census headcount updated successfully!</span>
              </div>
            )}

            <form onSubmit={handleUpdateCensus} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">
                  New Current Occupancy (Headcount) *
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    value={newOccupancy}
                    onChange={(e) => setNewOccupancy(Number(e.target.value))}
                    className="flex-1 px-3 py-2 rounded-xl bg-midnight border border-slate-700 text-white font-mono font-bold text-sm outline-none focus:border-signalCyan"
                    required
                  />
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setNewOccupancy((prev) => Math.max(0, prev - 5))}
                      className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                    >
                      -5
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewOccupancy((prev) => prev + 5)}
                      className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                    >
                      +5
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">
                  Census Remark / Reason for Adjustment
                </label>
                <input
                  type="text"
                  value={censusNotes}
                  onChange={(e) => setCensusNotes(e.target.value)}
                  placeholder="e.g. 14 evacuees arrived via Boat Swift-Delta 02"
                  className="w-full px-3 py-2 rounded-xl bg-midnight border border-slate-700 text-white outline-none focus:border-signalCyan"
                />
              </div>

              <button
                type="submit"
                disabled={updating}
                className="w-full py-2.5 rounded-xl bg-signalCyan hover:bg-signalCyan/90 disabled:opacity-50 text-midnight font-bold transition-all shadow-md"
              >
                {updating ? 'Recording Census...' : 'Save Census Adjustment'}
              </button>
            </form>
          </div>

          {/* Allocation Link Strip */}
          <div className="bg-surfaceContainer rounded-2xl p-5 border border-slate-800 space-y-2.5 shadow-lg">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-signalCyan" /> Relief Supply Linkages
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {facility.incoming_allocations_count || 0} active
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Manage incoming water, rations, blankets, and trauma kits allocated to this facility.
            </p>
            <Link
              to={`/ops/distribution?facility_id=${facility.id}`}
              className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-signalCyan text-xs font-bold transition-colors border border-slate-700 flex items-center justify-center gap-1.5"
            >
              Open Distribution Dispatch Console <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Census & Capacity Audit Records Timeline */}
          <div className="bg-surfaceContainer rounded-2xl p-5 border border-slate-800 space-y-4 shadow-lg">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
                <History className="w-4 h-4 text-signalCyan" />
                Capacity Audit History
              </h3>
              <span className="text-[10px] text-slate-500 font-mono">
                {facility.capacity_history?.length || 0} records
              </span>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {facility.capacity_history && facility.capacity_history.length > 0 ? (
                facility.capacity_history.map((record) => (
                  <div
                    key={record.id}
                    className="p-3 rounded-xl bg-midnight border border-slate-800 space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white font-mono">
                        {record.occupancy_count} evacuees
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(record.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {record.notes && <p className="text-slate-300 text-[11px]">{record.notes}</p>}
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-slate-500 text-xs">
                  No previous census records logged for this facility.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacilityDetailPage;

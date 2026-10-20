import React, { useEffect, useState } from 'react';
import { useRole } from '../../context/RoleContext';
import { api } from '../../services/api';
import { Facility } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { 
  Warehouse, 
  Users, 
  MapPin, 
  Phone, 
  Clock, 
  AlertTriangle, 
  Plus, 
  RefreshCw, 
  CheckCircle2,
  ShieldCheck,
  Building2
} from 'lucide-react';

export const PartnerFacilitiesPage: React.FC = () => {
  const { partnerOrg } = useRole();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);

  // Census Update Modal
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [newOccupancy, setNewOccupancy] = useState(0);
  const [censusNotes, setCensusNotes] = useState('');
  const [updating, setUpdating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      // Fetch scoped facilities for this partner organization
      let data = await api.getFacilities({ organization_name: partnerOrg });
      // If none explicitly matched, show shelters partner is actively supplying/supporting
      if (data.length === 0) {
        data = await api.getFacilities();
      }
      setFacilities(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [partnerOrg]);

  const handleCensusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFacility) return;
    setErrorMsg(null);

    if (newOccupancy < 0) {
      setErrorMsg('Headcount cannot be negative.');
      return;
    }

    try {
      setUpdating(true);
      await api.updateFacilityOccupancy(
        selectedFacility.id, 
        newOccupancy, 
        `Partner Census Audit by ${partnerOrg}: ${censusNotes || 'Routine headcount audit'}`
      );
      await loadData();
      setSelectedFacility(null);
      setCensusNotes('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update census.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight">
            Partner Relief Shelters & Depots
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Managing facilities partnered with <strong className="text-amber-400">{partnerOrg}</strong>
          </p>
        </div>

        <button
          onClick={loadData}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-amber-400 self-start sm:self-auto transition-colors"
          title="Refresh facilities"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
        </button>
      </div>

      {/* Facilities Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
        {loading ? (
          <div className="col-span-2 p-12 text-center text-slate-500">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-400" />
            Synchronizing partner facility telemetry...
          </div>
        ) : facilities.length === 0 ? (
          <div className="col-span-2 p-12 rounded-2xl bg-slate-900 border border-slate-800 text-center text-slate-500">
            <Building2 className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            No facilities currently linked to {partnerOrg}.
          </div>
        ) : (
          facilities.map((fac) => {
            const hasCap = fac.capacity_total !== null && fac.capacity_total > 0;
            const pct = hasCap ? Math.round((fac.current_occupancy / fac.capacity_total!) * 100) : 0;
            const isFull = hasCap && fac.current_occupancy >= fac.capacity_total!;

            return (
              <div
                key={fac.id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-4 shadow-xl"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-0.5">
                      {fac.facility_type.toUpperCase()}
                    </span>
                    <h3 className="text-base font-bold text-white font-sans">{fac.name}</h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-1 font-sans">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      {fac.address}
                    </p>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                      fac.status === 'active'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-red-500/20 text-red-300 border-red-500/40'
                    }`}
                  >
                    {fac.status}
                  </span>
                </div>

                {/* Capacity Progress Bar */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Occupancy Census</span>
                    <span className="text-white font-bold">
                      {fac.current_occupancy} / {fac.capacity_total ?? 'Unknown'} Beds ({pct}%)
                    </span>
                  </div>

                  {hasCap && (
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, pct)}%` }}
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                    <span>Available Free Beds: <strong className="text-emerald-400">{fac.available_beds ?? 'N/A'}</strong></span>
                    <span>Manager: {fac.manager_name || 'Assigned Warden'}</span>
                  </div>
                </div>

                {/* Card Action Bar */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <div className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Last audited: {new Date(fac.last_census_updated_at || fac.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedFacility(fac);
                      setNewOccupancy(fac.current_occupancy);
                      setCensusNotes('');
                      setErrorMsg(null);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 text-xs font-bold transition-all"
                  >
                    Update Census
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Census Headcount Update Modal */}
      {selectedFacility && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm font-mono text-xs">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-amber-500/40 p-6 space-y-4 shadow-modal">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Update Shelter Headcount</h3>
                <p className="text-amber-400">{selectedFacility.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFacility(null)}
                className="text-slate-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-950 border border-red-800 text-red-200">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCensusSubmit} className="space-y-3">
              <div>
                <label className="text-slate-400 uppercase text-[10px] font-bold block mb-1">
                  Current Verified Occupancy (People) *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={newOccupancy}
                  onChange={(e) => setNewOccupancy(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold text-sm outline-none focus:border-amber-500"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Capacity limit: {selectedFacility.capacity_total ?? 'Unknown (No cap)'} beds
                </span>
              </div>

              <div>
                <label className="text-slate-400 uppercase text-[10px] font-bold block mb-1">
                  Audit Notes / Reason for Shift *
                </label>
                <input
                  type="text"
                  required
                  value={censusNotes}
                  onChange={(e) => setCensusNotes(e.target.value)}
                  placeholder="e.g. Registered 15 new flood evacuees from Sector B convoy"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500 font-sans"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedFacility(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  {updating ? 'Updating...' : 'Commit Census Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

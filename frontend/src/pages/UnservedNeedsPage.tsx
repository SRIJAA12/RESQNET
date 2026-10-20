import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { DashboardSummary, Incident, Facility, Resource } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { 
  AlertOctagon, 
  Clock, 
  MapPin, 
  Users, 
  HeartPulse, 
  Building2, 
  Truck, 
  AlertTriangle, 
  ArrowRight,
  ShieldAlert,
  ChevronRight,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  HelpCircle,
  TrendingDown
} from 'lucide-react';
import { ScrollReveal } from '../components/ui/ScrollReveal';

export const UnservedNeedsPage: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [search, setSearch] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [sum, incList, facList, resList] = await Promise.all([
        api.getDashboardSummary(),
        api.getIncidents(),
        api.getFacilities(),
        api.getResources()
      ]);
      setSummary(sum);
      setIncidents(incList);
      setFacilities(facList);
      setResources(resList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter unresolved incidents
  const unresolvedIncidents = incidents.filter(i => 
    i.status !== 'resolved' && i.status !== 'rejected'
  );

  const filteredIncidents = unresolvedIncidents.filter(i => {
    if (priorityFilter !== 'all' && i.priority !== priorityFilter) return false;
    if (categoryFilter === 'medical' && !i.medical_assistance_needed) return false;
    if (categoryFilter === 'trapped' && i.trapped_count === 0) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        i.reference_code.toLowerCase().includes(q) ||
        i.address_text.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Group by sector area
  const sectorGroups: Record<string, Incident[]> = {
    'Sector 4B // Riverbend Basin': [],
    'Sector 2 // Lowland Residential Colony': [],
    'Sector 1 // Coastal Industrial Corridor': [],
    'Other / Unmapped Flood Perimeters': []
  };

  filteredIncidents.forEach(inc => {
    const addr = inc.address_text.toLowerCase();
    if (addr.includes('river') || addr.includes('plot 42') || addr.includes('creek')) {
      sectorGroups['Sector 4B // Riverbend Basin'].push(inc);
    } else if (addr.includes('lowland') || addr.includes('greenview') || addr.includes('sector 2')) {
      sectorGroups['Sector 2 // Lowland Residential Colony'].push(inc);
    } else if (addr.includes('pier') || addr.includes('port') || addr.includes('industrial')) {
      sectorGroups['Sector 1 // Coastal Industrial Corridor'].push(inc);
    } else {
      sectorGroups['Other / Unmapped Flood Perimeters'].push(inc);
    }
  });

  // Calculate confirmed vs estimated people awaiting rescue
  const confirmedVictims = unresolvedIncidents.reduce((acc, i) => acc + (i.trapped_count > 0 ? i.trapped_count : i.people_count), 0);
  const estimatedUnreported = Math.round(confirmedVictims * 1.6); // Model expansion estimate

  // Overcapacity facilities
  const saturatedFacilities = facilities.filter(f => 
    f.capacity_total !== null && f.capacity_total > 0 && f.current_occupancy >= f.capacity_total * 0.85
  );

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-cloud-white tracking-tight">
            Unserved needs
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Citizen requests awaiting assistance, cluster deficits, and resource shortages.
          </p>
        </div>

        <button
          onClick={loadData}
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan transition-colors self-start sm:self-auto"
          title="Refresh intelligence buffer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan' : ''}`} />
        </button>
      </div>

      {/* Critical Reporting Bias Warning */}
      <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-800/50 text-amber-200 text-xs font-mono space-y-1.5 shadow-lg">
        <div className="flex items-center gap-2 font-bold text-amber-300 uppercase tracking-wider">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Operational Advisory: Reporting Volume Bias Notice</span>
        </div>
        <p className="font-sans leading-relaxed text-amber-200/90">
          <strong>Do not interpret low reporting volume as safety.</strong> In deep flood zones where power grids, cellular towers, and landlines are inundated, citizen report frequency drops to near zero despite extreme peril. Dispatches must prioritize satellite, drone, and water-level sensor telemetry alongside citizen SOS calls.
        </p>
      </div>

      {/* High-Level Deficit Telemetry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono text-xs">
        <ScrollReveal animation="fade-up" delayMs={0}>
          <div className="p-4 rounded-2xl bg-red-950/30 border border-red-800/60 space-y-1 h-full">
            <span className="text-[10px] uppercase text-red-400 font-bold tracking-wider block">
              People Awaiting Help
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">{confirmedVictims}</span>
              <span className="text-[11px] text-red-300 font-bold">Confirmed</span>
            </div>
            <div className="text-[10px] text-slate-400 pt-1 border-t border-red-900/40">
              Est. in Dark Zones: <strong className="text-amber-400">~{estimatedUnreported}</strong> (Statistical model)
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal animation="fade-up" delayMs={60}>
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1 h-full">
            <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider block">
              Oldest Waiting Request
            </span>
            <div className="text-2xl font-black text-amber-400">3h 45m</div>
            <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-800">
              Ref: <Link to="/ops/incidents/inc-001" className="text-cyan underline">SOS-8492 (Trapped Diabetic)</Link>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal animation="fade-up" delayMs={120}>
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1 h-full">
            <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider block">
              Critical Unassigned SOS
            </span>
            <div className="text-2xl font-black text-white">
              {unresolvedIncidents.filter(i => i.priority === 'critical' && i.status !== 'in_progress' && i.status !== 'assigned').length}
            </div>
            <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-800">
              Awaiting commander dispatch approval
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal animation="fade-up" delayMs={180}>
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1 h-full">
            <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider block">
              Saturated Shelters
            </span>
            <div className="text-2xl font-black text-red-400">
              {saturatedFacilities.length} / {facilities.length}
            </div>
            <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-800">
              &gt;85% of rated emergency bed capacity
            </div>
          </div>
        </ScrollReveal>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter unresolved needs by reference, location, or condition..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-white placeholder-slate-500 outline-none focus:border-cyan"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto font-mono text-xs">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan cursor-pointer"
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical Only</option>
            <option value="high">High Only</option>
            <option value="medium">Medium Only</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan cursor-pointer"
          >
            <option value="all">All Categories</option>
            <option value="medical">Medical Urgent</option>
            <option value="trapped">Trapped Evacuees</option>
          </select>
        </div>
      </div>

      {/* Unresolved Requests Grouped by Geographic Sector */}
      <div className="space-y-6">
        <h2 className="text-base font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
          <span>Unresolved Distress Requests Grouped by Sector</span>
          <span className="text-xs text-slate-500">({filteredIncidents.length} total)</span>
        </h2>

        {Object.entries(sectorGroups).map(([sectorName, items]) => {
          if (items.length === 0) return null;
          const sectorConfirmed = items.reduce((acc, i) => acc + (i.trapped_count > 0 ? i.trapped_count : i.people_count), 0);

          return (
            <div key={sectorName} className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
              {/* Sector Header */}
              <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-cyan" />
                  <span className="font-bold text-sm text-white font-mono">{sectorName}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                    {items.length} Incidents
                  </span>
                </div>

                <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
                  <span>Victims: <strong className="text-white">{sectorConfirmed} confirmed</strong></span>
                  <span className="text-slate-600">|</span>
                  <span className="text-amber-400">~{Math.round(sectorConfirmed * 1.5)} estimated</span>
                </div>
              </div>

              {/* Items List */}
              <div className="divide-y divide-slate-800/60">
                {items.map((inc) => {
                  const elapsedHrs = ((Date.now() - new Date(inc.created_at).getTime()) / (3600 * 1000)).toFixed(1);
                  return (
                    <div key={inc.id} className="p-4 hover:bg-slate-800/40 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link
                            to={`/ops/incidents/${inc.id}`}
                            className="font-mono text-xs font-bold text-cyan hover:underline"
                          >
                            {inc.reference_code}
                          </Link>
                          <StatusBadge type="priority" value={inc.priority} size="sm" />
                          <StatusBadge type="status" value={inc.status} size="sm" />
                          {inc.medical_assistance_needed && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-red-500/20 text-red-300 border border-red-500/30 flex items-center gap-1">
                              <HeartPulse className="w-2.5 h-2.5" /> Medical Urgent
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-300 line-clamp-1 font-sans">
                          {inc.description}
                        </p>

                        <div className="flex items-center gap-3 text-[11px] font-mono text-slate-500">
                          <span>{inc.address_text}</span>
                          <span>•</span>
                          <span>{inc.people_count} People ({inc.trapped_count} Trapped)</span>
                          <span>•</span>
                          <span className="text-amber-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Waiting {elapsedHrs} hrs
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end md:self-auto font-mono text-xs">
                        <Link
                          to={`/ops/dispatch?incident_id=${inc.id}`}
                          className="px-3 py-1.5 rounded-lg bg-cyan hover:bg-cyan/90 text-slate-950 font-bold transition-all shadow-sm"
                        >
                          Dispatch Resource ↗
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Resource Deficits & Shelter Bottlenecks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 font-mono text-xs">
        {/* Resource Shortages */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
              <Truck className="w-4 h-4 text-cyan" />
              <span>Critical Equipment Deficits</span>
            </h3>
            <span className="text-[10px] text-red-400 font-bold uppercase">Immediate Gaps</span>
          </div>

          <div className="space-y-2.5">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <strong className="text-white block">Shallow-Draft Zodiac Boats</strong>
                <span className="text-[11px] text-slate-400">Sector 4B Riverbend Basin</span>
              </div>
              <div className="text-right">
                <span className="text-red-400 font-black text-sm block">-3 Boats Deficit</span>
                <span className="text-[10px] text-slate-500">3 Available / 6 Needed</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <strong className="text-white block">High-Capacity Potable Water</strong>
                <span className="text-[11px] text-slate-400">Sector 2 Lowland Evacuation Camps</span>
              </div>
              <div className="text-right">
                <span className="text-amber-400 font-black text-sm block">-800 Liters</span>
                <span className="text-[10px] text-slate-500">Pumping Station Contaminated</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <strong className="text-white block">Emergency Generator Fuel</strong>
                <span className="text-[11px] text-slate-400">East Pier Relief Depots</span>
              </div>
              <div className="text-right">
                <span className="text-amber-400 font-black text-sm block">-250 Liters</span>
                <span className="text-[10px] text-slate-500">36h Grid Cutoff Anticipated</span>
              </div>
            </div>
          </div>
        </div>

        {/* Shelter Saturation */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-400" />
              <span>Facility Capacity Bottlenecks</span>
            </h3>
            <Link to="/ops/facilities" className="text-cyan hover:underline text-[11px]">
              View All Facilities ↗
            </Link>
          </div>

          <div className="space-y-2.5">
            {saturatedFacilities.map((fac) => {
              const cap = fac.capacity_total ?? 1;
              const pct = Math.round((fac.current_occupancy / cap) * 100);
              return (
                <div key={fac.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <strong className="text-white">{fac.name}</strong>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/30">
                      {pct}% Full ({fac.current_occupancy}/{fac.capacity_total})
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-red-500" style={{ width: `${Math.min(100, pct)}%` }} />
                  </div>
                  <div className="text-[10px] text-slate-500 flex items-center justify-between pt-0.5">
                    <span>Only {fac.available_beds ?? 0} beds free</span>
                    <span className="text-amber-400">Recommended Diversion: Sector 4 Civic Hall</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

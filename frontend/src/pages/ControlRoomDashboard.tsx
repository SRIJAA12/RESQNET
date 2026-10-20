import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Radio, 
  AlertTriangle, 
  Truck, 
  Building2, 
  AlertOctagon, 
  MapPin, 
  Layers, 
  FileCheck2, 
  ArrowRight,
  RefreshCw,
  Sparkles,
  Users,
  HeartPulse
} from 'lucide-react';
import { api } from '../services/api';
import { DashboardSummary, Incident } from '../types';
import { SummaryMetricCard } from '../components/SummaryMetricCard';
import { StatusBadge } from '../components/StatusBadge';

export const ControlRoomDashboard: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.getDashboardSummary();
      setSummary(data);
    } catch (err) {
      console.error('Failed to load dashboard summary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000); // 15s refresh
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8 pb-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Live Control Room Telemetry
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Disaster Coordination Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Feed
          </button>

          <Link
            to="/dispatch"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-relief-600 hover:bg-relief-500 text-white text-xs font-bold shadow-md shadow-relief-900/30 transition-all"
          >
            <FileCheck2 className="w-4 h-4" />
            Dispatch Review Screen
          </Link>
        </div>
      </div>

      {/* KPI Metric Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryMetricCard
          title="Active Incidents"
          value={summary ? summary.active_incidents : 5}
          subtitle={`${summary ? summary.critical_incidents : 2} critical priority`}
          icon={Radio}
          variant="danger"
        />

        <SummaryMetricCard
          title="Rescue Fleet Deployed"
          value={summary ? summary.deployed_resources : 2}
          subtitle={`${summary ? summary.available_resources : 3} available in sector`}
          icon={Truck}
          variant="info"
        />

        <SummaryMetricCard
          title="Shelter Capacity"
          value={summary ? `${summary.shelter_occupancy_pct}%` : '68%'}
          subtitle={`${summary ? summary.shelter_available_beds : 350} free beds remaining`}
          icon={Building2}
          variant={summary && summary.shelter_occupancy_pct > 85 ? 'warning' : 'success'}
        />

        <SummaryMetricCard
          title="Unserved Critical Needs"
          value={summary ? summary.unserved_critical_needs_count : 1}
          subtitle="Pending dispatcher assignment"
          icon={AlertOctagon}
          variant="danger"
        />
      </div>

      {/* Triage Urgency & Fleet Status Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Urgency Distribution */}
        <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Urgency Triage Breakdown
            </h2>
            <Link to="/queue" className="text-xs text-relief-400 hover:underline">
              View queue
            </Link>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-emergency-400">Critical (Immediate Hazard)</span>
                <span className="font-bold text-slate-200">{summary?.incidents_by_priority?.critical || 2}</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2">
                <div className="bg-emergency-500 h-2 rounded-full" style={{ width: '40%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-amber-400">High (Rising Flood Level)</span>
                <span className="font-bold text-slate-200">{summary?.incidents_by_priority?.high || 1}</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: '25%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-sky-400">Medium / Standard</span>
                <span className="font-bold text-slate-200">{summary?.incidents_by_priority?.medium || 2}</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2">
                <div className="bg-sky-500 h-2 rounded-full" style={{ width: '35%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Fleet Readiness Breakdown */}
        <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Fleet & Resource Teams
            </h2>
            <Link to="/resources" className="text-xs text-relief-400 hover:underline">
              Registry
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
              <span className="text-slate-400 block mb-1">Shallow Boats</span>
              <span className="text-lg font-bold text-slate-100">2 Units</span>
              <span className="text-[11px] text-emerald-400 block mt-0.5">1 Available, 1 Deployed</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
              <span className="text-slate-400 block mb-1">High-Water Trucks</span>
              <span className="text-lg font-bold text-slate-100">1 Unit</span>
              <span className="text-[11px] text-blue-400 block mt-0.5">Deployed</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
              <span className="text-slate-400 block mb-1">ALS Ambulances</span>
              <span className="text-lg font-bold text-slate-100">1 Unit</span>
              <span className="text-[11px] text-emerald-400 block mt-0.5">Available</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
              <span className="text-slate-400 block mb-1">Recon Drones</span>
              <span className="text-lg font-bold text-slate-100">1 Unit</span>
              <span className="text-[11px] text-emerald-400 block mt-0.5">Ready for Patrol</span>
            </div>
          </div>
        </div>

        {/* Quick Dispatch Actions */}
        <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-relief-950/40 border border-slate-800 flex flex-col justify-between space-y-4">
          <div>
            <span className="text-xs font-bold text-relief-400 uppercase tracking-wider">Action Center</span>
            <h2 className="text-base font-bold text-white mt-1">Situational Map & Dispatch</h2>
            <p className="text-xs text-slate-400 mt-1">
              Verify spatial distribution of stranded flood victims, water currents, and coordinate emergency teams.
            </p>
          </div>

          <div className="space-y-2">
            <Link
              to="/map"
              className="w-full py-2.5 px-4 rounded-xl bg-relief-600 hover:bg-relief-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <MapPin className="w-4 h-4" /> Open Fullscreen Map
            </Link>
            <Link
              to="/unserved"
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <AlertOctagon className="w-4 h-4 text-amber-400" /> Review Bottlenecks & Deficits
            </Link>
          </div>
        </div>
      </div>

      {/* Critical Incidents Requiring Dispatcher Action */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emergency-500 animate-ping" />
              Critical Requests Pending Dispatch Review
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Trapped victims or urgent medical needs requiring authorized human dispatcher action.
            </p>
          </div>
          <Link to="/queue" className="text-xs font-semibold text-relief-400 hover:underline">
            All Incidents &rarr;
          </Link>
        </div>

        <div className="space-y-3">
          {summary?.critical_unserved_incidents && summary.critical_unserved_incidents.length > 0 ? (
            summary.critical_unserved_incidents.map((incident) => (
              <div
                key={incident.id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-700 transition-colors"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-relief-400">{incident.reference_code}</span>
                    <StatusBadge type="priority" value={incident.priority} size="sm" />
                    <StatusBadge type="status" value={incident.status} size="sm" />
                    {incident.ai_triage_score && (
                      <span className="text-[11px] font-semibold text-purple-400 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> {incident.ai_triage_score.toFixed(0)}/100
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 font-medium">{incident.description}</p>
                  <div className="flex items-center gap-4 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" /> {incident.address_text}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-500" /> {incident.people_count} people ({incident.trapped_count} trapped)
                    </span>
                  </div>
                </div>

                <div className="shrink-0">
                  <Link
                    to={`/dispatch?incident_id=${incident.id}`}
                    className="px-4 py-2 rounded-xl bg-relief-600 hover:bg-relief-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-relief-900/30 transition-colors"
                  >
                    Match & Assign Unit <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-xs text-slate-500 rounded-xl bg-slate-950">
              No unassigned critical incidents in the current operational queue.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

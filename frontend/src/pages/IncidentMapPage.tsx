import React, { useEffect, useState } from 'react';
import { LeafletMap } from '../components/LeafletMap';
import { api } from '../services/api';
import { Incident, Resource, Shelter } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { Link } from 'react-router-dom';
import { 
  Filter, 
  MapPin, 
  Users, 
  HeartPulse, 
  Sparkles, 
  ChevronRight, 
  RefreshCw,
  Layers
} from 'lucide-react';

export const IncidentMapPage: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  // Filters
  const [criticalOnly, setCriticalOnly] = useState(false);
  const [showShelters, setShowShelters] = useState(true);
  const [showResources, setShowResources] = useState(true);
  const [showFlood, setShowFlood] = useState(true);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [inc, res, sh] = await Promise.all([
        api.getIncidents(),
        api.getResources(),
        api.getShelters(),
      ]);
      setIncidents(inc);
      setResources(res);
      setShelters(sh);
      if (inc.length > 0 && !selectedIncident) {
        setSelectedIncident(inc[0]);
      }
    } catch (err) {
      console.error('Failed to load map data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredIncidents = criticalOnly
    ? incidents.filter((i) => i.priority === 'critical')
    : incidents;

  return (
    <div className="space-y-4">
      {/* Top Header & Layer Toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white">
            Situational Operations Map
          </h1>
          <p className="text-xs text-slate-400">
            Real-time geospatial visualization of flood inundation zones, trapped victims, and rescue fleets.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setCriticalOnly(!criticalOnly)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              criticalOnly
                ? 'bg-emergency-900/80 text-emergency-200 border-emergency-600'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            Critical Only
          </button>

          <button
            onClick={() => setShowShelters(!showShelters)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              showShelters
                ? 'bg-indigo-900/60 text-indigo-200 border-indigo-600'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            Shelters ({shelters.length})
          </button>

          <button
            onClick={() => setShowResources(!showResources)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              showResources
                ? 'bg-emerald-900/60 text-emerald-200 border-emerald-600'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            Fleet ({resources.length})
          </button>

          <button
            onClick={() => setShowFlood(!showFlood)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              showFlood
                ? 'bg-sky-900/60 text-sky-200 border-sky-600'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            Flood Area
          </button>

          <button
            onClick={loadData}
            className="p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Map & Selected Incident Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3">
          <LeafletMap
            incidents={filteredIncidents}
            shelters={showShelters ? shelters : []}
            resources={showResources ? resources : []}
            selectedIncident={selectedIncident}
            onSelectIncident={setSelectedIncident}
            showFloodOverlay={showFlood}
            heightClass="h-[620px]"
          />
        </div>

        {/* Selected Incident Telemetry Side Panel */}
        <div className="lg:col-span-1 p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-4">
          {selectedIncident ? (
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                  Target Telemetry
                </span>
                <div className="flex items-center justify-between mt-1">
                  <span className="font-mono text-sm font-bold text-relief-400">
                    {selectedIncident.reference_code}
                  </span>
                  <StatusBadge type="priority" value={selectedIncident.priority} size="sm" />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1.5 text-xs">
                <div className="text-slate-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="text-slate-200 font-medium truncate">{selectedIncident.address_text}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-400 pt-1">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" /> {selectedIncident.people_count}
                  </span>
                  {selectedIncident.trapped_count > 0 && (
                    <span className="text-emergency-400 font-semibold">{selectedIncident.trapped_count} trapped</span>
                  )}
                  {selectedIncident.medical_assistance_needed && (
                    <span className="text-emergency-400 font-semibold flex items-center gap-1">
                      <HeartPulse className="w-3.5 h-3.5" /> Medical
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-slate-400">Situation Report:</span>
                <p className="text-xs text-slate-300 line-clamp-4 leading-relaxed">
                  {selectedIncident.description}
                </p>
              </div>

              {selectedIncident.ai_triage_score && (
                <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-800/40 text-xs text-purple-200 space-y-1">
                  <div className="flex items-center justify-between font-bold text-purple-300">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> AI Triage Score
                    </span>
                    <span>{selectedIncident.ai_triage_score.toFixed(0)}/100</span>
                  </div>
                  <p className="text-[11px] text-purple-300/80 leading-normal">
                    {selectedIncident.ai_recommendation_notes}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs text-slate-500 text-center py-12">
              Click any map marker to view detailed casualty telemetry and assign matching units.
            </div>
          )}

          {selectedIncident && (
            <div className="pt-2 border-t border-slate-800">
              <Link
                to={`/dispatch?incident_id=${selectedIncident.id}`}
                className="w-full py-2.5 px-4 rounded-xl bg-relief-600 hover:bg-relief-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-relief-900/40"
              >
                Open Dispatch Matcher <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

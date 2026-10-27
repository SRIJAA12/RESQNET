import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Incident, Resource, Shelter } from '../types';
import { LeafletMap } from '../components/LeafletMap';
import { StatusBadge } from '../components/StatusBadge';
import { 
  Search, 
  MapPin, 
  Users, 
  HeartPulse, 
  Clock, 
  X, 
  ChevronRight, 
  ExternalLink,
  Truck,
  Building2,
  AlertCircle,
  Route,
  Sparkles,
  Layers,
  Eye
} from 'lucide-react';

export const LiveMapPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialSearch = searchParams.get('search') || '';

  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Filters
  const [activeLayer, setActiveLayer] = useState<'all' | 'critical' | 'resources' | 'shelters'>('all');
  const [showFlood, setShowFlood] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
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

      // Auto-select initial match if search query present
      if (initialSearch && inc.length > 0) {
        const matched = inc.find(
          (i) =>
            i.reference_code.toLowerCase().includes(initialSearch.toLowerCase()) ||
            i.address_text.toLowerCase().includes(initialSearch.toLowerCase()) ||
            i.description.toLowerCase().includes(initialSearch.toLowerCase())
        );
        if (matched) {
          setSelectedIncident(matched);
          setDrawerOpen(true);
        }
      } else if (inc.length > 0 && !selectedIncident) {
        // Default to first critical incident
        const crit = inc.find((i) => i.priority === 'critical') || inc[0];
        setSelectedIncident(crit);
        setDrawerOpen(true);
      }
    } catch (err) {
      console.error('Failed to load live map data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered incidents
  const filteredIncidents = useMemo(() => {
    if (activeLayer === 'resources' || activeLayer === 'shelters') return [];
    let list = incidents;
    if (activeLayer === 'critical') {
      list = list.filter((i) => i.priority === 'critical');
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (i) =>
          i.reference_code.toLowerCase().includes(q) ||
          i.address_text.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q)
      );
    }
    return list;
  }, [incidents, activeLayer, searchQuery]);

  const filteredResources = useMemo(() => {
    if (activeLayer === 'critical' || activeLayer === 'shelters') return [];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return resources.filter(
        (r) => r.name.toLowerCase().includes(q) || r.resource_type.toLowerCase().includes(q)
      );
    }
    return resources;
  }, [resources, activeLayer, searchQuery]);

  const filteredShelters = useMemo(() => {
    if (activeLayer === 'critical' || activeLayer === 'resources') return [];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return shelters.filter(
        (s) => s.name.toLowerCase().includes(q) || s.address.toLowerCase().includes(q)
      );
    }
    return shelters;
  }, [shelters, activeLayer, searchQuery]);

  const handleSelectIncident = (inc: Incident) => {
    setSelectedIncident(inc);
    setDrawerOpen(true);
  };

  const formatWaitTime = (createdAt?: string) => {
    if (!createdAt) return 'Waiting';
    const ms = Date.now() - new Date(createdAt).getTime();
    const minutes = Math.floor(ms / (1000 * 60));
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m waiting`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m waiting`;
  };

  return (
    <div className="space-y-3.5 pb-6 animate-fadeIn">
      {/* ── 1. Slim, Elegant Toolbar ───────────────────────────────────────────── */}
      <div className="p-3 rounded-card border border-slate-200 dark:border-border/80 bg-white/95 dark:bg-surface/90 backdrop-blur-md flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-sm dark:shadow-subtle">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 dark:text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search incident ID, sector, or street address..."
            className="w-full pl-9 pr-8 py-1.5 rounded-control bg-slate-50 dark:bg-midnight border border-slate-200 dark:border-border/80 focus:border-teal-600 dark:focus:border-cyan text-xs text-slate-900 dark:text-cloud-white placeholder-slate-400 dark:placeholder-text-muted outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:text-text-muted dark:hover:text-cloud-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveLayer('all')}
            className={`px-3 py-1 rounded-control text-xs font-medium transition-colors ${
              activeLayer === 'all'
                ? 'bg-teal-600 dark:bg-cyan text-white dark:text-midnight font-bold shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-deep-slate text-slate-700 dark:text-text-secondary hover:text-slate-900 dark:hover:text-cloud-white border border-slate-200 dark:border-border/70'
            }`}
          >
            All layers ({incidents.length + resources.length + shelters.length})
          </button>

          <button
            onClick={() => setActiveLayer('critical')}
            className={`px-3 py-1 rounded-control text-xs font-medium transition-colors flex items-center gap-1.5 ${
              activeLayer === 'critical'
                ? 'bg-rose-600 dark:bg-coral text-white font-bold shadow-sm'
                : 'bg-rose-50 hover:bg-rose-100 dark:bg-deep-slate text-rose-700 dark:text-coral hover:text-rose-900 dark:hover:text-cloud-white border border-rose-200 dark:border-border/70'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 dark:bg-coral animate-pulse" />
            Critical SOS ({incidents.filter((i) => i.priority === 'critical').length})
          </button>

          <button
            onClick={() => setActiveLayer('resources')}
            className={`px-3 py-1 rounded-control text-xs font-medium transition-colors flex items-center gap-1.5 ${
              activeLayer === 'resources'
                ? 'bg-teal-600 dark:bg-cyan text-white dark:text-midnight font-bold shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-deep-slate text-teal-800 dark:text-cyan hover:text-teal-950 dark:hover:text-cloud-white border border-slate-200 dark:border-border/70'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            Responders ({resources.length})
          </button>

          <button
            onClick={() => setActiveLayer('shelters')}
            className={`px-3 py-1 rounded-control text-xs font-medium transition-colors flex items-center gap-1.5 ${
              activeLayer === 'shelters'
                ? 'bg-emerald-600 dark:bg-success-green text-white dark:text-midnight font-bold shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-deep-slate text-emerald-800 dark:text-success-green hover:text-emerald-950 dark:hover:text-cloud-white border border-slate-200 dark:border-border/70'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            Shelters ({shelters.length})
          </button>

          <button
            onClick={() => setShowFlood(!showFlood)}
            className={`px-2.5 py-1 rounded-control text-xs font-medium transition-colors ${
              showFlood
                ? 'bg-teal-50 dark:bg-cyan/15 text-teal-800 dark:text-cyan border border-teal-300 dark:border-cyan/40 font-semibold'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-deep-slate text-slate-600 dark:text-text-muted hover:text-slate-900 dark:hover:text-cloud-white border border-slate-200 dark:border-border/70'
            }`}
          >
            {showFlood ? 'Flood zone on' : 'Flood zone off'}
          </button>
        </div>
      </div>

      {/* ── 2. Spacious Map Workspace + Contextual Drawer ───────────────────────── */}
      <div className="relative w-full h-[620px] sm:h-[680px] lg:h-[720px] rounded-panel overflow-hidden border border-slate-200 dark:border-border/80 shadow-card">
        <LeafletMap
          incidents={filteredIncidents}
          resources={filteredResources}
          shelters={filteredShelters}
          selectedIncident={selectedIncident}
          onSelectIncident={handleSelectIncident}
          heightClass="h-full"
          showFloodOverlay={showFlood}
        />

        {/* Slide-out Contextual Detail Drawer */}
        {drawerOpen && selectedIncident && (
          <div className="absolute top-3 right-3 bottom-3 w-full sm:w-[380px] rounded-card bg-white/95 dark:bg-surface/95 backdrop-blur-md border border-slate-200 dark:border-border shadow-2xl z-20 flex flex-col justify-between p-5 overflow-y-auto animate-slideLeft text-slate-800 dark:text-cloud-white">
            <div className="space-y-4">
              {/* Drawer Header */}
              <div className="flex items-start justify-between gap-3 border-b border-slate-200 dark:border-border/60 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-bold text-base text-slate-900 dark:text-cloud-white">
                      {selectedIncident.reference_code}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      selectedIncident.priority === 'critical' ? 'bg-rose-100 text-rose-700 dark:bg-coral/20 dark:text-coral' : 'bg-amber-100 text-amber-800 dark:bg-amber/20 dark:text-amber'
                    }`}>
                      {selectedIncident.priority.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-text-muted mt-0.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber" />
                    <span>{formatWaitTime(selectedIncident.created_at)}</span>
                  </div>
                </div>

                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-1 rounded-control text-slate-400 hover:text-slate-800 hover:bg-slate-100 dark:text-text-muted dark:hover:text-cloud-white dark:hover:bg-deep-slate transition-colors"
                  aria-label="Close drawer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Location & Coordinates */}
              <div className="p-3 rounded-card bg-slate-50 dark:bg-midnight/70 border border-slate-200 dark:border-border/60 space-y-1.5 text-xs">
                <div className="flex items-center gap-2 text-slate-900 dark:text-cloud-white font-medium">
                  <MapPin className="w-3.5 h-3.5 text-teal-600 dark:text-cyan shrink-0" />
                  <span className="truncate">{selectedIncident.address_text}</span>
                </div>
                <div className="text-[11px] font-mono text-slate-500 dark:text-text-muted pl-5">
                  {selectedIncident.latitude.toFixed(4)}°N, {selectedIncident.longitude.toFixed(4)}°E
                </div>
              </div>

              {/* People & Urgency */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-card bg-slate-50 dark:bg-midnight/70 border border-slate-200 dark:border-border/60">
                  <span className="text-[11px] text-slate-500 dark:text-text-muted block">People affected</span>
                  <span className="font-heading font-extrabold text-lg text-slate-900 dark:text-cloud-white">
                    {selectedIncident.people_count}
                  </span>
                  {selectedIncident.trapped_count > 0 && (
                    <span className="text-[11px] text-rose-600 dark:text-coral font-medium block">
                      {selectedIncident.trapped_count} trapped
                    </span>
                  )}
                </div>

                <div className="p-3 rounded-card bg-slate-50 dark:bg-midnight/70 border border-slate-200 dark:border-border/60">
                  <span className="text-[11px] text-slate-500 dark:text-text-muted block">Medical need</span>
                  {selectedIncident.medical_assistance_needed ? (
                    <span className="text-rose-600 dark:text-coral font-semibold text-xs flex items-center gap-1 mt-1">
                      <HeartPulse className="w-3.5 h-3.5" /> Urgent EMS
                    </span>
                  ) : (
                    <span className="text-slate-600 dark:text-text-secondary text-xs mt-1 block">
                      Standard evacuation
                    </span>
                  )}
                </div>
              </div>

              {/* Situation Description */}
              <div className="space-y-1">
                <span className="text-[11px] font-medium text-slate-500 dark:text-text-muted uppercase tracking-wider block">
                  Reported situation
                </span>
                <p className="text-xs text-slate-700 dark:text-text-secondary leading-relaxed p-3 rounded-card bg-slate-50 dark:bg-midnight/50 border border-slate-200 dark:border-border/50">
                  {selectedIncident.description}
                </p>
              </div>

              {/* AI Triage Recommendation */}
              {selectedIncident.ai_triage_score && (
                <div className="p-3 rounded-card bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/30 text-xs space-y-1">
                  <div className="flex items-center justify-between text-purple-900 dark:text-purple-300 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" /> AI Priority Assessment
                    </span>
                    <span className="font-mono">{selectedIncident.ai_triage_score.toFixed(0)}/100</span>
                  </div>
                  <p className="text-[11px] text-purple-800/80 dark:text-purple-200/80 leading-relaxed">
                    {selectedIncident.ai_recommendation_notes}
                  </p>
                </div>
              )}

              {/* Caller Details */}
              <div className="text-[11px] text-slate-500 dark:text-text-muted flex items-center justify-between pt-1">
                <span>Reporter: <strong className="text-slate-900 dark:text-cloud-white">{selectedIncident.reporter_name}</strong></span>
                <span>Contact: {selectedIncident.reporter_contact}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-200 dark:border-border/60 space-y-2">
              <Link
                to={`/ops/incidents/${selectedIncident.id}`}
                className="w-full py-2.5 px-4 rounded-control bg-teal-600 hover:bg-teal-700 text-white dark:bg-cyan dark:hover:bg-cloud-white dark:text-midnight font-heading font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                View incident details <ChevronRight className="w-4 h-4" />
              </Link>
              <Link
                to={`/ops/dispatch?incident_id=${selectedIncident.id}`}
                className="w-full py-2 px-3 rounded-control bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 dark:bg-deep-slate dark:hover:bg-midnight dark:border-border dark:text-text-secondary dark:hover:text-cloud-white text-xs font-medium text-center block transition-colors"
              >
                Dispatch responder unit
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* ── 3. Quick Incident Selector Bar ─────────────────────────────────────── */}
      <div className="p-2.5 rounded-card bg-white dark:bg-surface border border-slate-200 dark:border-border/80 flex items-center gap-2 overflow-x-auto text-xs shadow-sm">
        <span className="text-[11px] font-medium text-slate-500 dark:text-text-muted px-1 shrink-0">
          Quick jump:
        </span>
        {incidents.slice(0, 6).map((inc) => (
          <button
            key={inc.id}
            onClick={() => handleSelectIncident(inc)}
            className={`px-3 py-1 rounded-control text-xs whitespace-nowrap transition-colors border ${
              selectedIncident?.id === inc.id
                ? 'bg-teal-50 dark:bg-cyan/15 text-teal-800 dark:text-cyan border-teal-300 dark:border-cyan/50 font-semibold'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-midnight text-slate-700 dark:text-text-secondary hover:text-slate-900 dark:hover:text-cloud-white border-slate-200 dark:border-border/60'
            }`}
          >
            {inc.reference_code} ({inc.priority})
          </button>
        ))}
      </div>
    </div>
  );
};

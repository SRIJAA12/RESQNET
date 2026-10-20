import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { DashboardSummary, Incident, Resource, Shelter, DisasterEvent } from '../types';
import { LeafletMap } from '../components/LeafletMap';
import { StatusBadge } from '../components/StatusBadge';
import { 
  Compass, 
  MapPin, 
  Users, 
  Truck, 
  Building2, 
  AlertCircle, 
  Clock, 
  ArrowRight, 
  ChevronRight, 
  ExternalLink,
  ShieldAlert,
  HeartPulse,
  Map,
  Activity
} from 'lucide-react';
import { ScrollReveal } from '../components/ui/ScrollReveal';

export const CommandCenterPage: React.FC = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [event, setEvent] = useState<DisasterEvent | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAllAttention, setShowAllAttention] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sum, evtList, incList, resList, shList] = await Promise.all([
        api.getDashboardSummary(),
        api.getEvents(),
        api.getIncidents(),
        api.getResources(),
        api.getShelters(),
      ]);
      setSummary(sum);
      if (evtList.length > 0) setEvent(evtList[0]);
      setIncidents(incList);
      setResources(resList);
      setShelters(shList);
      if (incList.length > 0 && !selectedIncident) {
        setSelectedIncident(incList[0]);
      }
    } catch (err) {
      console.error('Failed to load command center data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 20000);
    return () => clearInterval(interval);
  }, []);

  // Calculate wait time
  const formatWaitTime = (createdAt?: string) => {
    if (!createdAt) return 'Waiting';
    const ms = Date.now() - new Date(createdAt).getTime();
    const minutes = Math.floor(ms / (1000 * 60));
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m waiting`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m waiting`;
  };

  // Prioritize urgent waiting items: unresolved critical & high requests sorted by wait time
  const attentionItems = incidents
    .filter((i) => i.status !== 'resolved' && (i.priority === 'critical' || i.priority === 'high'))
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  const displayedAttention = showAllAttention ? attentionItems : attentionItems.slice(0, 3);

  // Derived metrics
  const openIncidentsCount = incidents.filter((i) => i.status !== 'resolved').length;
  const criticalCount = incidents.filter((i) => i.priority === 'critical' && i.status !== 'resolved').length;
  const peopleAwaitingCount = incidents
    .filter((i) => i.status !== 'resolved')
    .reduce((sum, inc) => sum + (inc.people_count || 1), 0);
  const availableRespondersCount = resources.filter((r) => r.status === 'available').length;
  const deployedRespondersCount = resources.filter((r) => r.status === 'deployed').length;

  const totalShelterCapacity = shelters.reduce((sum, s) => sum + (s.capacity_total || 0), 0);
  const totalOccupiedBeds = shelters.reduce((sum, s) => sum + s.current_occupancy, 0);
  const shelterOccupancyRate = totalShelterCapacity > 0
    ? Math.round((totalOccupiedBeds / totalShelterCapacity) * 100)
    : 0;
  const remainingBeds = Math.max(0, totalShelterCapacity - totalOccupiedBeds);

  return (
    <div className="space-y-6 pb-8 max-w-[1440px] mx-auto animate-fadeIn">
      {/* ── 1. Page Header (Editorial & Human-Centered) ────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-success-green" />
            <span className="text-xs font-medium text-text-muted">
              {event?.name || 'Riverbend Flash Flood'} · Active Response
            </span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-cloud-white tracking-tight">
            Disaster overview
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1 max-w-2xl leading-relaxed">
            Severe inundation across Riverbend Basin. Priority focus on water rescue operations, elderly evacuations, and emergency shelter bed allocation.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/ops/map"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-control bg-cyan hover:bg-cloud-white text-midnight font-heading font-bold text-xs transition-colors shadow-sm"
          >
            <Map className="w-4 h-4" />
            Open live map
          </Link>
        </div>
      </div>

      {/* ── 2. Four Compact Summary Metrics ───────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Metric 1: Open Incidents */}
        <ScrollReveal animation="fade-up" delayMs={0}>
          <Link
            to="/ops/incidents"
            className="group p-4 sm:p-5 rounded-card bg-surface hover:bg-deep-slate border border-border/80 transition-all flex flex-col justify-between space-y-3 h-full"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-text-muted">Open incidents</span>
              <AlertCircle className="w-4 h-4 text-coral opacity-80 group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <div className="font-heading font-extrabold text-2xl sm:text-3xl text-cloud-white tracking-tight">
                {loading ? '—' : openIncidentsCount}
              </div>
              <div className="text-[12px] text-coral mt-0.5 font-medium">
                {criticalCount} critical priority
              </div>
            </div>
          </Link>
        </ScrollReveal>

        {/* Metric 2: People Awaiting Help */}
        <ScrollReveal animation="fade-up" delayMs={60}>
          <Link
            to="/ops/unserved-needs"
            className="group p-4 sm:p-5 rounded-card bg-surface hover:bg-deep-slate border border-border/80 transition-all flex flex-col justify-between space-y-3 h-full"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-text-muted">People awaiting help</span>
              <Users className="w-4 h-4 text-amber opacity-80 group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <div className="font-heading font-extrabold text-2xl sm:text-3xl text-cloud-white tracking-tight">
                {loading ? '—' : peopleAwaitingCount}
              </div>
              <div className="text-[12px] text-text-secondary mt-0.5 font-medium">
                Across 3 active sectors
              </div>
            </div>
          </Link>
        </ScrollReveal>

        {/* Metric 3: Available Responders */}
        <ScrollReveal animation="fade-up" delayMs={120}>
          <Link
            to="/ops/resources"
            className="group p-4 sm:p-5 rounded-card bg-surface hover:bg-deep-slate border border-border/80 transition-all flex flex-col justify-between space-y-3 h-full"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-text-muted">Available responders</span>
              <Truck className="w-4 h-4 text-cyan opacity-80 group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <div className="font-heading font-extrabold text-2xl sm:text-3xl text-cloud-white tracking-tight">
                {loading ? '—' : availableRespondersCount}
              </div>
              <div className="text-[12px] text-text-secondary mt-0.5 font-medium">
                {deployedRespondersCount} teams currently deployed
              </div>
            </div>
          </Link>
        </ScrollReveal>

        {/* Metric 4: Shelter Capacity */}
        <ScrollReveal animation="fade-up" delayMs={180}>
          <Link
            to="/ops/facilities"
            className="group p-4 sm:p-5 rounded-card bg-surface hover:bg-deep-slate border border-border/80 transition-all flex flex-col justify-between space-y-3 h-full"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-text-muted">Shelter capacity</span>
              <Building2 className="w-4 h-4 text-success-green opacity-80 group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <div className="font-heading font-extrabold text-2xl sm:text-3xl text-cloud-white tracking-tight">
                {loading ? '—' : `${shelterOccupancyRate}%`}
              </div>
              <div className="text-[12px] text-success-green mt-0.5 font-medium">
                {remainingBeds} beds available
              </div>
            </div>
          </Link>
        </ScrollReveal>
      </div>

      {/* ── 3. Main Workspace: Map Preview (65%) + Needs Attention (35%) ──────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left: Map Preview (~65%) */}
        <div className="lg:col-span-8 space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-heading font-semibold text-cloud-white">
                Situational map preview
              </span>
              <span className="text-[11px] text-text-muted">
                ({incidents.length} incidents · {resources.length} units active)
              </span>
            </div>
            <Link
              to="/ops/map"
              className="text-xs text-cyan hover:text-cloud-white font-medium flex items-center gap-1 transition-colors"
            >
              Expand view <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <LeafletMap
            incidents={incidents}
            resources={resources}
            shelters={shelters}
            selectedIncident={selectedIncident}
            onSelectIncident={(inc) => setSelectedIncident(inc)}
            heightClass="h-[440px] sm:h-[480px]"
            showFloodOverlay={true}
          />
        </div>

        {/* Right: Needs Attention Panel (~35%) */}
        <div className="lg:col-span-4 rounded-panel bg-surface border border-border p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div>
              <h2 className="font-heading font-bold text-sm text-cloud-white">
                Needs attention
              </h2>
              <p className="text-[11px] text-text-muted mt-0.5">
                Longest waiting urgent requests
              </p>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-coral/15 text-coral text-[11px] font-medium">
              {attentionItems.length} pending
            </span>
          </div>

          {/* Attention Items List */}
          <div className="space-y-3">
            {displayedAttention.length > 0 ? (
              displayedAttention.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-card bg-midnight/60 hover:bg-deep-slate border border-border/70 transition-colors space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${
                          item.priority === 'critical' ? 'bg-coral animate-pulse' : 'bg-amber'
                        }`} />
                        <span className="font-medium text-xs text-cloud-white truncate">
                          {item.address_text || 'Riverbend Sector'}
                        </span>
                      </div>
                      <div className="text-[11px] text-text-muted flex items-center gap-2 pl-4">
                        <span>{item.people_count} people</span>
                        <span>·</span>
                        <span className="text-amber font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatWaitTime(item.created_at)}
                        </span>
                      </div>
                    </div>

                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${
                      item.priority === 'critical' ? 'bg-coral/20 text-coral' : 'bg-amber/20 text-amber'
                    }`}>
                      {item.priority.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-xs text-text-secondary line-clamp-2 pl-4">
                    {item.description}
                  </p>

                  <div className="pl-4 pt-1 flex items-center justify-between">
                    <span className="font-mono text-[10px] text-text-muted">
                      {item.reference_code}
                    </span>
                    <Link
                      to={`/ops/incidents/${item.id}`}
                      className="inline-flex items-center gap-1 text-xs font-medium text-cyan hover:text-cloud-white transition-colors"
                    >
                      Review request <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-xs text-text-muted">
                No high-priority requests awaiting triage.
              </div>
            )}
          </div>

          {/* Reveal more button */}
          {attentionItems.length > 3 && (
            <button
              onClick={() => setShowAllAttention(!showAllAttention)}
              className="w-full py-2 rounded-control bg-deep-slate/80 hover:bg-border text-xs text-text-secondary hover:text-cloud-white font-medium transition-colors"
            >
              {showAllAttention
                ? 'Show fewer items'
                : `View ${attentionItems.length - 3} more urgent items`}
            </button>
          )}
        </div>
      </div>

      {/* ── 4. Compact Activity Timeline ───────────────────────────────────────── */}
      <ScrollReveal animation="fade-up" delayMs={50}>
        <div className="rounded-panel bg-surface border border-border p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan" />
              <h2 className="font-heading font-bold text-sm text-cloud-white">
                Recent operational activity
              </h2>
            </div>
            <span className="text-xs text-text-muted">Live event feed</span>
          </div>

          <div className="divide-y divide-border/40 text-xs">
            <div className="py-2.5 flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan mt-1.5 shrink-0" />
                <div>
                  <span className="font-medium text-cloud-white">Rescue Boat Alpha-01</span>
                  <span className="text-text-secondary"> deployed to Sector B for rooftop evacuation.</span>
                </div>
              </div>
              <span className="text-[11px] text-text-muted shrink-0">8m ago</span>
            </div>

            <div className="py-2.5 flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-success-green mt-1.5 shrink-0" />
                <div>
                  <span className="font-medium text-cloud-white">North Community High School</span>
                  <span className="text-text-secondary"> shelter opened with 250 bed capacity.</span>
                </div>
              </div>
              <span className="text-[11px] text-text-muted shrink-0">22m ago</span>
            </div>

            <div className="py-2.5 flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber mt-1.5 shrink-0" />
                <div>
                  <span className="font-medium text-cloud-white">Incident RESQ-2026-FLOOD-001</span>
                  <span className="text-text-secondary"> triage score verified by Commander Vance.</span>
                </div>
              </div>
              <span className="text-[11px] text-text-muted shrink-0">35m ago</span>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
};

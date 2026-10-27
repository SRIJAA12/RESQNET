import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Incident, Resource, ResourceAssignment } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import {
  FileCheck2,
  ShieldAlert,
  MapPin,
  Users,
  HeartPulse,
  Truck,
  Lock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  BatteryMedium,
  Check,
  LifeBuoy,
  Phone,
  User,
  ShieldCheck,
  ExternalLink,
  RefreshCw
} from 'lucide-react';

export const AssignmentReviewPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const targetIncidentId = searchParams.get('incident_id');

  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [selectedResourceId, setSelectedResourceId] = useState<string>('');
  const [dispatcherNotes, setDispatcherNotes] = useState('Authorized dispatch by human control room operator');
  const [autoDispatch, setAutoDispatch] = useState(true);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successAssignment, setSuccessAssignment] = useState<ResourceAssignment | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [incList, resList] = await Promise.all([api.getIncidents(), api.getResources()]);
      setIncidents(incList);
      setResources(resList);

      if (targetIncidentId) {
        const matched = incList.find(
          (i) => i.id === targetIncidentId || i.reference_code.toUpperCase() === targetIncidentId.trim().toUpperCase()
        );
        if (matched) {
          setSelectedIncident(matched);
        } else if (incList.length > 0) {
          setSelectedIncident(incList[0]);
        }
      } else if (incList.length > 0) {
        // prioritize verified incidents that need dispatch
        const verifiedWaiting = incList.find((i) => i.status === 'verified');
        const unassigned = incList.find((i) => i.status !== 'resolved' && i.status !== 'assigned' && i.status !== 'in_progress');
        setSelectedIncident(verifiedWaiting || unassigned || incList[0]);
      }

      // Pre-select first available resource if none selected
      const available = resList.find((r) => (r.status || '').toLowerCase() === 'available');
      if (available && !selectedResourceId) {
        setSelectedResourceId(available.id);
      }
    } catch (err: any) {
      console.error('Failed to load dispatch data:', err);
      setErrorMsg(err.message || 'Unable to load dispatch queues.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [targetIncidentId]);

  // Spatial distance calculation (km in coordinate grid)
  const calculateDistanceKm = (rLat: number, rLon: number, iLat: number, iLon: number) => {
    const dLat = (rLat - iLat) * 111;
    const dLon = (rLon - iLon) * 96;
    const dist = Math.sqrt(dLat * dLat + dLon * dLon);
    return Math.max(0.1, Math.round(dist * 10) / 10);
  };

  const selectedResource = resources.find((r) => r.id === selectedResourceId);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIncident || !selectedResourceId) return;

    // Conflict prevention check in demo state layer
    if (selectedResource && (selectedResource.status || '').toLowerCase() !== 'available') {
      setErrorMsg(`Conflict Prevented: Resource "${selectedResource.name}" is currently marked ${selectedResource.status.toUpperCase()} and cannot be assigned.`);
      return;
    }

    if (selectedIncident.status === 'assigned' || selectedIncident.status === 'in_progress') {
      const confirmReassign = window.confirm(
        `Incident ${selectedIncident.reference_code} already has an assigned unit. Proceed with updating the assignment?`
      );
      if (!confirmReassign) return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const assignment = await api.createAssignment({
        incident_id: selectedIncident.id,
        resource_id: selectedResourceId,
        dispatcher_notes: dispatcherNotes || 'Authorized dispatch by human control room operator',
        auto_dispatch: autoDispatch,
      });
      setSuccessAssignment(assignment);
      // Reload resources and incidents to update local state
      await loadData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to authorize assignment. A conflicting assignment exists.');
    } finally {
      setSubmitting(false);
    }
  };

  // Success view
  if (successAssignment) {
    return (
      <div className="max-w-xl mx-auto py-10 text-center space-y-6 animate-fadeIn">
        <div className="p-8 rounded-3xl bg-surfaceContainer border border-emerald-500/50 shadow-2xl space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-emerald-950/80 border border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-black text-white tracking-tight">
              Dispatch Order Authorized & Locked
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Response unit <strong className="text-signalCyan">{selectedResource?.name || successAssignment.resource_id}</strong> is committed. Incident status transitioned to <strong className="text-emerald-400 font-mono uppercase">{autoDispatch ? 'IN_PROGRESS' : 'ASSIGNED'}</strong>.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-midnight border border-slate-800 text-xs text-left space-y-2.5">
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-500">Incident Reference:</span>
              <span className="font-mono font-bold text-signalCyan">{selectedIncident?.reference_code}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-500">Committed Resource:</span>
              <span className="font-medium text-white">{selectedResource?.name}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-500">Responder Team Lead:</span>
              <span className="text-slate-300">{selectedResource?.responder_lead_name || 'Assigned Lead'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-500">Assignment ID:</span>
              <span className="font-mono text-slate-400">{successAssignment.id}</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-slate-500">Authorization Mode:</span>
              <span className="font-bold text-emerald-400 uppercase">Human Dispatcher Confirmed</span>
            </div>
          </div>

          {/* Verification Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to={`/track-request/${selectedIncident?.reference_code}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-signalCyan hover:bg-signalCyan/90 text-midnight font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-signalCyan/10"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Verify on Citizen Tracking
            </Link>

            <Link
              to={`/ops/incidents/${selectedIncident?.id}`}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-surfaceRaised hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 flex items-center justify-center gap-1.5"
            >
              View Incident Dossier
            </Link>

            <button
              onClick={() => {
                setSuccessAssignment(null);
                navigate('/ops/incidents');
              }}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-midnight text-slate-400 hover:text-white text-xs border border-slate-800"
            >
              Back to Queue
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fadeIn pb-8">
      {/* Title & Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-3 border-b border-border/60">
        <div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-cloud-white tracking-tight flex items-center gap-2.5">
            <Truck className="w-6 h-6 text-cyan" />
            Dispatch review
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Evaluate candidate fleet assets, verify distance and capabilities, and authorize mission dispatch.
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-control bg-surface border border-border text-xs text-text-muted">
          <Lock className="w-3.5 h-3.5 text-success-green" />
          <span>Double-assignment lock active</span>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-200 text-xs sm:text-sm flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Target Incident Selector */}
      <div className="p-4 rounded-2xl bg-white dark:bg-surfaceContainer border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 font-mono">
          Select Incident for Dispatch Review:
        </label>
        <select
          value={selectedIncident?.id || ''}
          onChange={(e) => {
            const found = incidents.find((i) => i.id === e.target.value);
            if (found) setSelectedIncident(found);
          }}
          aria-label="Select incident for dispatch review"
          className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-midnight border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-teal-600 dark:focus:border-signalCyan font-mono max-w-xl truncate"
        >
          {incidents.map((inc) => (
            <option key={inc.id} value={inc.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
              {inc.reference_code} &mdash; [{inc.priority.toUpperCase()}] &mdash; {inc.status.toUpperCase()} &mdash; {inc.address_text}
            </option>
          ))}
        </select>
      </div>

      {selectedIncident && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Target Incident Details & Needs Profile */}
          <div className="p-6 rounded-3xl bg-white dark:bg-surfaceContainer border border-slate-200 dark:border-slate-800 space-y-5 shadow-sm text-slate-800 dark:text-cloud-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-slate-400">Target Emergency Incident</span>
                <div className="font-mono text-xl font-black text-teal-600 dark:text-signalCyan">
                  {selectedIncident.reference_code}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge type="priority" value={selectedIncident.priority} size="md" />
                <StatusBadge type="status" value={selectedIncident.status} size="md" />
              </div>
            </div>

            {/* Incident Status Alert */}
            {selectedIncident.status === 'assigned' || selectedIncident.status === 'in_progress' ? (
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-600/40 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Already Dispatched:</strong> This incident already has an active unit assigned. Proceeding will override the existing assignment.
                </div>
              </div>
            ) : selectedIncident.status === 'submitted' || selectedIncident.status === 'under_review' ? (
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-600/40 text-blue-900 dark:text-blue-200 text-xs flex items-center justify-between">
                <span>Incident is not yet verified.</span>
                <Link
                  to={`/ops/incidents/${selectedIncident.id}`}
                  className="font-bold underline text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-white"
                >
                  Verify Incident First →
                </Link>
              </div>
            ) : null}

            {/* People & Trapped Summary */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-midnight border border-slate-200 dark:border-slate-800 space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-2 text-slate-900 dark:text-slate-200">
                <MapPin className="w-4 h-4 text-teal-600 dark:text-signalCyan shrink-0" />
                <span className="font-medium text-slate-900 dark:text-white">{selectedIncident.address_text}</span>
              </div>
              <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                Coords: {selectedIncident.latitude.toFixed(4)}° N, {selectedIncident.longitude.toFixed(4)}° E
              </div>

              <div className="flex items-center gap-4 text-slate-600 dark:text-slate-300 pt-1 border-t border-slate-200 dark:border-slate-800/80">
                <span className="flex items-center gap-1 font-medium">
                  <Users className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" /> {selectedIncident.people_count} individuals
                </span>
                {selectedIncident.trapped_count > 0 && (
                  <span className="text-rose-600 dark:text-red-400 font-bold">{selectedIncident.trapped_count} trapped</span>
                )}
                {selectedIncident.medical_assistance_needed && (
                  <span className="text-rose-600 dark:text-red-400 font-bold flex items-center gap-1">
                    <HeartPulse className="w-3.5 h-3.5" /> Medical Urgent
                  </span>
                )}
              </div>
            </div>

            {/* Citizen Description */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider font-mono">
                Field Narrative:
              </span>
              <p className="text-xs text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-midnight/60 p-4 rounded-xl border-l-4 border-l-teal-600 border border-slate-200 dark:border-slate-800 leading-relaxed font-sans shadow-2xs">
                "{selectedIncident.description}"
              </p>
            </div>

            {/* Assistive AI Triage Guidance */}
            <div className="p-4 rounded-2xl bg-purple-50/90 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-500/30 text-xs text-purple-950 dark:text-purple-200 space-y-2.5 shadow-2xs">
              <div className="flex items-center justify-between font-bold text-purple-900 dark:text-purple-300">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  AI Triage Guidance
                </span>
                <span className="font-mono px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 text-xs font-bold border border-purple-200 dark:border-purple-700/50">
                  {selectedIncident.ai_triage_score ? `${selectedIncident.ai_triage_score.toFixed(0)} / 100` : 'Assisted'}
                </span>
              </div>
              <p className="text-[11px] text-purple-900/90 dark:text-purple-300/90 leading-relaxed font-medium">
                {selectedIncident.ai_recommendation_notes ||
                  'Shallow-water rescue craft recommended due to rising flood conditions.'}
              </p>
              <div className="text-[10px] text-purple-700/80 dark:text-slate-400 italic">
                * Autonomous dispatch disabled. Dispatcher confirmation required for fleet deployment.
              </div>
            </div>
          </div>

          {/* Right Column: Fleet Selection & Confirmation Form */}
          <div className="p-6 rounded-3xl bg-white dark:bg-surfaceContainer border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-5 shadow-sm text-slate-800 dark:text-cloud-white">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-xs font-bold uppercase text-slate-700 dark:text-slate-300 tracking-wider font-mono">
                  Candidate Fleet Resources ({resources.length})
                </h2>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Sorted by grid distance</span>
              </div>

              {/* Resource Candidates List */}
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {resources.map((resource) => {
                  const dist = calculateDistanceKm(
                    resource.latitude,
                    resource.longitude,
                    selectedIncident.latitude,
                    selectedIncident.longitude
                  );
                  const isAvailable = (resource.status || '').toLowerCase() === 'available';
                  const isSelected = selectedResourceId === resource.id;

                  return (
                    <div
                      key={resource.id}
                      onClick={() => {
                        if (isAvailable) {
                          setSelectedResourceId(resource.id);
                        }
                      }}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        isSelected
                          ? 'bg-teal-50 dark:bg-cyan/15 border-teal-500 dark:border-cyan shadow-md shadow-teal-500/10 ring-1 ring-teal-500 dark:ring-cyan cursor-pointer'
                          : isAvailable
                          ? 'bg-white dark:bg-midnight border-slate-200 dark:border-slate-800 hover:border-teal-400 hover:bg-slate-50 dark:hover:bg-slate-900/60 cursor-pointer shadow-sm'
                          : 'bg-slate-50 dark:bg-midnight/40 border-slate-100 dark:border-slate-900 opacity-60 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 transition-all flex-shrink-0 ${
                              isSelected
                                ? 'border-teal-600 bg-teal-600 dark:border-cyan dark:bg-cyan text-white dark:text-midnight font-bold shadow-sm'
                                : isAvailable
                                ? 'border-slate-400 dark:border-slate-500 bg-white dark:bg-midnight hover:border-teal-500'
                                : 'border-slate-300 dark:border-slate-800 bg-slate-100 dark:bg-slate-900'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3] text-white dark:text-midnight" />}
                          </div>
                          <div>
                            <span className={`font-bold text-xs block ${isSelected ? 'text-teal-800 dark:text-cyan' : 'text-slate-900 dark:text-white'}`}>
                              {resource.name}
                            </span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 capitalize">
                              {resource.resource_type.replace('_', ' ')} &bull; Capacity: {resource.passenger_capacity} seats &bull; Crew: {resource.crew_count}
                            </span>
                            {resource.responder_lead_name && (
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">
                                Lead: {resource.responder_lead_name}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <StatusBadge type="resource" value={resource.status} size="sm" />
                          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 block mt-1">
                            ~{dist} km away
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Dispatcher Notes Form */}
              <form onSubmit={handleAssign} className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 font-mono">
                    Dispatcher Mission Instructions / Notes:
                  </label>
                  <textarea
                    rows={2}
                    value={dispatcherNotes}
                    onChange={(e) => setDispatcherNotes(e.target.value)}
                    placeholder="Enter instructions for rescue craft team lead..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-midnight border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-teal-600 dark:focus:border-cyan resize-none"
                  />
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    id="autoDispatch"
                    checked={autoDispatch}
                    onChange={(e) => setAutoDispatch(e.target.checked)}
                    className="w-4 h-4 rounded text-teal-600 bg-white dark:bg-midnight border-slate-300 dark:border-slate-700"
                  />
                  <label htmlFor="autoDispatch" className="cursor-pointer select-none">
                    Issue immediate mission orders (transition incident to <strong>IN_PROGRESS</strong>)
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={submitting || !selectedResourceId || (selectedResource?.status || '').toLowerCase() !== 'available'}
                  className="w-full py-3.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white dark:bg-cyan dark:hover:bg-cyan/90 dark:text-midnight disabled:opacity-40 disabled:cursor-not-allowed font-black text-sm shadow-xl shadow-teal-600/20 dark:shadow-cyan/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <FileCheck2 className="w-4 h-4" />
                  {submitting
                    ? 'Locking & Authorizing Dispatch...'
                    : `Confirm & Dispatch ${selectedResource ? selectedResource.name : 'Selected Resource'}`}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentReviewPage;

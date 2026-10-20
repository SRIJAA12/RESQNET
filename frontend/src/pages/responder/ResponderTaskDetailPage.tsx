import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { ResponderTask, ResponderTaskStatus, TaskOutcome, Facility } from '../../types';
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Radio, 
  Clock, 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck, 
  Compass, 
  LifeBuoy, 
  Send, 
  FileText, 
  Check, 
  AlertOctagon,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

export const ResponderTaskDetailPage: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();

  const [task, setTask] = useState<ResponderTask | null>(null);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Status transition state
  const [transitioning, setTransitioning] = useState(false);

  // Outcome Completion Modal
  const [showOutcomeModal, setShowOutcomeModal] = useState(false);
  const [outcomeForm, setOutcomeForm] = useState({
    people_rescued: 0,
    casualties_treated: 0,
    transported_to_facility_id: '',
    outcome_notes: '',
    responder_signoff: 'Capt. M. Alvarez',
  });
  const [submittingOutcome, setSubmittingOutcome] = useState(false);
  const [outcomeError, setOutcomeError] = useState<string | null>(null);

  const loadData = async () => {
    if (!taskId) return;
    try {
      setLoading(true);
      setError(null);
      const [tData, fData] = await Promise.all([
        api.getResponderTask(taskId),
        api.getFacilities()
      ]);
      setTask(tData);
      setFacilities(fData);
      setOutcomeForm(prev => ({
        ...prev,
        people_rescued: tData.people_count || 1,
        transported_to_facility_id: fData.length > 0 ? fData[0].id : ''
      }));
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load task details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [taskId]);

  const handleStatusUpdate = async (nextStatus: ResponderTaskStatus, notes?: string) => {
    if (!task) return;
    try {
      setTransitioning(true);
      const updated = await api.updateResponderTaskStatus(task.id, nextStatus, notes);
      setTask(updated);
    } catch (err: any) {
      alert(`Status transition failed: ${err.message}`);
    } finally {
      setTransitioning(false);
    }
  };

  const handleOutcomeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task) return;

    setOutcomeError(null);

    // Validation
    if (outcomeForm.people_rescued < 0) {
      setOutcomeError('People rescued count cannot be negative.');
      return;
    }
    if (outcomeForm.casualties_treated < 0) {
      setOutcomeError('Casualties count cannot be negative.');
      return;
    }
    if (!outcomeForm.responder_signoff.trim()) {
      setOutcomeError('Authorized responder sign-off is required.');
      return;
    }
    if (outcomeForm.outcome_notes.trim().length < 5) {
      setOutcomeError('Please provide detailed outcome verification notes (minimum 5 characters).');
      return;
    }

    try {
      setSubmittingOutcome(true);
      const selectedFacility = facilities.find(f => f.id === outcomeForm.transported_to_facility_id);

      const payload: TaskOutcome = {
        completed_at: new Date().toISOString(),
        people_rescued: Number(outcomeForm.people_rescued),
        casualties_treated: Number(outcomeForm.casualties_treated),
        transported_to_facility_id: outcomeForm.transported_to_facility_id || undefined,
        transported_to_facility_name: selectedFacility ? selectedFacility.name : undefined,
        outcome_notes: outcomeForm.outcome_notes,
        verification_code: `VERIF-${Math.floor(1000 + Math.random() * 9000)}-${task.id.toUpperCase()}`,
        responder_signoff: outcomeForm.responder_signoff,
      };

      const updated = await api.completeResponderTask(task.id, payload);
      setTask(updated);
      setShowOutcomeModal(false);
    } catch (err: any) {
      setOutcomeError(err.message || 'Failed to record outcome. Submission rejected.');
    } finally {
      setSubmittingOutcome(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center font-mono text-xs text-slate-400">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-400" />
        Decentralized mission data fetching...
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="p-6 rounded-2xl bg-slate-900 border border-red-800/40 text-center space-y-3 font-mono">
        <AlertOctagon className="w-8 h-8 text-red-400 mx-auto" />
        <p className="text-sm font-bold text-white">Mission Not Found</p>
        <p className="text-xs text-slate-400">{error || 'Task ID does not match active manifest.'}</p>
        <Link
          to="/responder/tasks"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-white font-bold"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Mission Roster
        </Link>
      </div>
    );
  }

  const isCompleted = task.status === 'completed';

  const statusSteps: { id: ResponderTaskStatus; label: string }[] = [
    { id: 'assigned', label: 'Assigned' },
    { id: 'acknowledged', label: 'Acknowledged' },
    { id: 'en_route', label: 'En Route' },
    { id: 'on_site', label: 'On Scene' },
    { id: 'completed', label: 'Completed' },
  ];

  const currentStepIdx = statusSteps.findIndex(s => s.id === task.status);

  return (
    <div className="space-y-4 font-sans">
      {/* Top Back Nav & Quick Header */}
      <div className="flex items-center justify-between gap-2">
        <Link
          to="/responder/tasks"
          className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-slate-400 hover:text-white transition-colors p-1"
        >
          <ArrowLeft className="w-4 h-4" /> Missions Roster
        </Link>

        <span className="font-mono text-xs text-slate-400">
          Ref: <strong className="text-emerald-400">{task.incident_reference}</strong>
        </span>
      </div>

      {/* Main Mission Card */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        {/* Priority & Status Badges */}
        <div className="flex items-center justify-between gap-2">
          <span
            className={`px-2.5 py-1 rounded text-xs font-mono font-bold uppercase tracking-wider ${
              task.priority === 'critical'
                ? 'bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
            }`}
          >
            {task.priority} Priority
          </span>

          <span
            className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase border ${
              isCompleted
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
            }`}
          >
            {task.status.replace('_', ' ')}
          </span>
        </div>

        {/* Title & Description */}
        <div>
          <h1 className="text-lg font-black text-white leading-tight">
            {task.title}
          </h1>
          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
            {task.description}
          </p>
        </div>

        {/* Special Needs & Instructions */}
        {task.special_needs && (
          <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/40 text-xs text-amber-300 space-y-1">
            <div className="flex items-center gap-1.5 font-bold uppercase text-[11px] font-mono text-amber-400">
              <AlertTriangle className="w-4 h-4" />
              Special Victim Instructions
            </div>
            <p className="leading-relaxed">{task.special_needs}</p>
          </div>
        )}

        {/* Operational Directives */}
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5">
          <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            Tactical Orders from Dispatch
          </div>
          <p className="text-slate-300 leading-relaxed font-mono">
            {task.instructions}
          </p>
        </div>

        {/* Victim & Coordination Telemetry */}
        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <span className="text-[10px] text-slate-500 uppercase block">People on Scene</span>
            <span className="text-base font-black text-white flex items-center gap-1.5">
              <Users className="w-4 h-4 text-cyan-400" />
              {task.people_count} ({task.trapped_count} Trapped)
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <span className="text-[10px] text-slate-500 uppercase block">Tactical Radio Net</span>
            <span className="text-xs font-bold text-emerald-300 flex items-center gap-1 truncate">
              <Radio className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              {task.coordination_channel}
            </span>
          </div>
        </div>

        {/* Location & Contact Direct Actions */}
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[10px] font-mono text-slate-500 uppercase block">Incident Coordinates</span>
              <div className="text-xs font-bold text-white flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{task.address_text}</span>
              </div>
              <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                GPS: {task.latitude.toFixed(4)}°N, {task.longitude.toFixed(4)}°E
              </div>
            </div>

            <a
              href={`https://www.google.com/maps/search/?api=1&query=${task.latitude},${task.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold flex items-center gap-1 transition-colors"
            >
              <Compass className="w-4 h-4" />
              <span className="hidden sm:inline">Navigate</span>
            </a>
          </div>

          {task.reporter_contact && (
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase block">On-Scene Contact</span>
                <span className="text-xs font-mono text-slate-200">
                  {task.reporter_name || 'Citizen'} ({task.reporter_contact})
                </span>
              </div>

              <a
                href={`tel:${task.reporter_contact}`}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Victim</span>
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Status Progression Stepper Controls */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 font-mono">
        <span className="text-xs font-bold uppercase text-slate-400 tracking-wider block">
          Mission Lifecycle Status
        </span>

        {/* Status Pills */}
        <div className="grid grid-cols-5 gap-1 text-center">
          {statusSteps.map((step, idx) => {
            const isPassed = currentStepIdx >= idx || isCompleted;
            const isCurrent = task.status === step.id;
            return (
              <div
                key={step.id}
                className={`py-1.5 px-1 rounded-lg border text-[10px] font-bold uppercase transition-all ${
                  isCurrent
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm'
                    : isPassed
                    ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60'
                    : 'bg-slate-950 text-slate-600 border-slate-800'
                }`}
              >
                {step.label}
              </div>
            );
          })}
        </div>

        {/* Consequential Action Button */}
        {!isCompleted ? (
          <div className="pt-2">
            {task.status === 'assigned' && (
              <button
                type="button"
                onClick={() => handleStatusUpdate('acknowledged', 'Unit acknowledged mission directive.')}
                disabled={transitioning}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-50"
              >
                <Check className="w-4 h-4" /> Acknowledge Mission Order
              </button>
            )}

            {task.status === 'acknowledged' && (
              <button
                type="button"
                onClick={() => handleStatusUpdate('en_route', 'Vessel underway toward target area.')}
                disabled={transitioning}
                className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-50"
              >
                <Send className="w-4 h-4" /> Depart Base (Mark En Route)
              </button>
            )}

            {task.status === 'en_route' && (
              <button
                type="button"
                onClick={() => handleStatusUpdate('on_site', 'Arrived on scene; initiating contact.')}
                disabled={transitioning}
                className="w-full py-3 rounded-xl bg-purple-500 hover:bg-purple-400 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-50"
              >
                <MapPin className="w-4 h-4" /> Confirm On-Site Arrival
              </button>
            )}

            {(task.status === 'on_site' || task.status === 'in_progress') && (
              <button
                type="button"
                onClick={() => setShowOutcomeModal(true)}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <ShieldCheck className="w-4 h-4" /> Record Mission Outcome & Complete Task
              </button>
            )}
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold uppercase text-[11px]">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Mission Formally Completed & Verified
            </div>
            {task.outcome && (
              <div className="text-[11px] space-y-1 text-slate-300 pt-1">
                <div>Evacuees Rescued: <strong>{task.outcome.people_rescued}</strong></div>
                <div>Destination: <strong>{task.outcome.transported_to_facility_name || 'Field Safe Zone'}</strong></div>
                <div>Sign-off: <strong>{task.outcome.responder_signoff}</strong></div>
                <div className="text-emerald-400 font-mono">Code: <strong>{task.outcome.verification_code}</strong></div>
                <div className="text-slate-400 italic">"{task.outcome.outcome_notes}"</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Task Lifecycle Timeline */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 font-mono">
        <span className="text-xs font-bold uppercase text-slate-400 tracking-wider block">
          Chronological Event Ledger
        </span>

        <div className="space-y-3 border-l-2 border-slate-800 ml-2 pl-3">
          {task.timeline.map((event) => (
            <div key={event.id} className="relative space-y-0.5">
              <span className="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-slate-900" />
              <div className="flex items-center justify-between text-[11px]">
                <strong className="text-white uppercase">{event.status.replace('_', ' ')}</strong>
                <span className="text-slate-500">
                  {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans">{event.notes}</p>
              {event.recorded_by && (
                <span className="text-[10px] text-slate-500 block">Operator: {event.recorded_by}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Outcome Recording Modal */}
      {showOutcomeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto font-sans">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-emerald-500/40 shadow-modal p-6 space-y-4 my-8">
            <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-black text-white">Record Mission Outcome</h3>
                <p className="text-xs font-mono text-emerald-400">
                  Ref: {task.incident_reference} // Tactical Unit: SWIFT-ALPHA-01
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowOutcomeModal(false)}
                className="text-slate-500 hover:text-white text-xs font-mono p-1"
              >
                ✕
              </button>
            </div>

            {outcomeError && (
              <div className="p-3 rounded-xl bg-red-950/80 border border-red-800/80 text-xs text-red-200 font-mono">
                {outcomeError}
              </div>
            )}

            <form onSubmit={handleOutcomeSubmit} className="space-y-3 font-mono text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 uppercase text-[10px] font-bold block mb-1">
                    People Rescued / Assisted *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={outcomeForm.people_rescued}
                    onChange={(e) => setOutcomeForm({ ...outcomeForm, people_rescued: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold text-sm outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 uppercase text-[10px] font-bold block mb-1">
                    Medical Triage Treated *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={outcomeForm.casualties_treated}
                    onChange={(e) => setOutcomeForm({ ...outcomeForm, casualties_treated: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold text-sm outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 uppercase text-[10px] font-bold block mb-1">
                  Destination Relief Shelter / Clinic
                </label>
                <select
                  value={outcomeForm.transported_to_facility_id}
                  onChange={(e) => setOutcomeForm({ ...outcomeForm, transported_to_facility_id: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="">Field Safe Zone / On-Scene Discharge</option>
                  {facilities.map((fac) => (
                    <option key={fac.id} value={fac.id} className="bg-slate-900">
                      {fac.name} ({fac.facility_type.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 uppercase text-[10px] font-bold block mb-1">
                  Lead Responder Sign-off Name *
                </label>
                <input
                  type="text"
                  required
                  value={outcomeForm.responder_signoff}
                  onChange={(e) => setOutcomeForm({ ...outcomeForm, responder_signoff: e.target.value })}
                  placeholder="e.g. Capt. M. Alvarez"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-slate-400 uppercase text-[10px] font-bold block mb-1">
                  Verification Notes & Conditions *
                </label>
                <textarea
                  required
                  rows={3}
                  value={outcomeForm.outcome_notes}
                  onChange={(e) => setOutcomeForm({ ...outcomeForm, outcome_notes: e.target.value })}
                  placeholder="Describe victim condition, evacuation transport, and on-scene hazards handled..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none focus:border-emerald-500 font-sans text-xs"
                />
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[10px] text-slate-400 leading-tight">
                <strong>System Synchrony Notice:</strong> Submitting will mark incident <code>{task.incident_reference}</code> as <strong>RESOLVED</strong>, generate a cryptographic verification token, and return tactical vessel <code>{task.resource_name}</code> to <strong>AVAILABLE</strong> status.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowOutcomeModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingOutcome}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg transition-all disabled:opacity-50"
                >
                  {submittingOutcome ? 'Synchronizing Records...' : 'Authorize Completion & Release Unit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

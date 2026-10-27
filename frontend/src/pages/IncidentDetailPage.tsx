import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Incident } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  MapPin,
  Users,
  HeartPulse,
  Truck,
  ShieldCheck,
  ShieldAlert,
  FileText,
  RefreshCw,
  ExternalLink,
  Sparkles,
  Phone,
  User,
  MessageSquare,
  AlertCircle,
  ChevronRight,
  ChevronDown
} from 'lucide-react';

export const IncidentDetailPage: React.FC = () => {
  const { incidentId } = useParams<{ incidentId: string }>();
  const navigate = useNavigate();

  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Rejection modal
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionError, setRejectionError] = useState<string | null>(null);

  // Add operational note
  const [noteInput, setNoteInput] = useState('');
  const [noteSuccess, setNoteSuccess] = useState(false);

  // Secondary info collapse
  const [notesExpanded, setNotesExpanded] = useState(true);

  const loadIncident = async () => {
    if (!incidentId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.getIncident(incidentId);
      setIncident(data);
    } catch (err: any) {
      console.error('Failed to load incident:', err);
      setError(err.message || `Incident '${incidentId}' could not be located.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncident();
  }, [incidentId]);

  // Handle Verify Incident
  const handleVerify = async () => {
    if (!incident) return;
    setActionLoading(true);
    try {
      const updated = await api.updateIncidentStatus(
        incident.id,
        'verified',
        'Verified by human operator: Coordinates confirmed and life-safety priority validated.'
      );
      setIncident(updated);
    } catch (err: any) {
      alert(err.message || 'Failed to verify incident.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Reject Incident
  const handleRejectConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incident) return;
    if (!rejectionReason.trim()) {
      setRejectionError('A specific operational reason is required to reject an emergency SOS.');
      return;
    }
    setActionLoading(true);
    try {
      const updated = await api.updateIncidentStatus(
        incident.id,
        'rejected',
        `REJECTED BY OPERATOR: ${rejectionReason.trim()}`
      );
      setIncident(updated);
      setShowRejectModal(false);
      setRejectionReason('');
      setRejectionError(null);
    } catch (err: any) {
      setRejectionError(err.message || 'Failed to update incident status.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Resolve Incident
  const handleResolve = async () => {
    if (!incident) return;
    const confirmResolve = window.confirm(
      `Confirm resolution of incident ${incident.reference_code}? This marks all civilians as safe or transferred to shelter.`
    );
    if (!confirmResolve) return;

    setActionLoading(true);
    try {
      const updated = await api.updateIncidentStatus(
        incident.id,
        'resolved',
        'Rescue operation completed. Citizens evacuated safely.'
      );
      setIncident(updated);
    } catch (err: any) {
      alert(err.message || 'Failed to resolve incident.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Adding Internal Note
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incident || !noteInput.trim()) return;
    setActionLoading(true);
    try {
      const updated = await api.updateIncidentStatus(
        incident.id,
        incident.status,
        `DISPATCH NOTE: ${noteInput.trim()}`
      );
      setIncident(updated);
      setNoteInput('');
      setNoteSuccess(true);
      setTimeout(() => setNoteSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to save note.');
    } finally {
      setActionLoading(false);
    }
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

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <RefreshCw className="w-6 h-6 text-cyan animate-spin mx-auto" />
        <p className="text-xs text-text-muted">Loading incident record...</p>
      </div>
    );
  }

  if (error || !incident) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <div className="p-6 rounded-card bg-surface border border-coral/40 text-coral">
          <AlertCircle className="w-8 h-8 text-coral mx-auto mb-2" />
          <h2 className="font-heading font-bold text-base text-cloud-white">Incident Not Found</h2>
          <p className="text-xs text-text-muted mt-1">{error || 'Incident record could not be loaded.'}</p>
          <div className="mt-4 flex justify-center gap-3">
            <button
              onClick={() => navigate('/ops/incidents')}
              className="px-4 py-2 rounded-control bg-deep-slate hover:bg-border text-xs text-cloud-white font-medium transition-colors"
            >
              Back to incidents
            </button>
            <button
              onClick={loadIncident}
              className="px-4 py-2 rounded-control bg-cyan text-midnight text-xs font-bold transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 animate-fadeIn">
      {/* ── 1. Incident Identity, Severity & Status ───────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div className="space-y-1">
          <Link
            to="/ops/incidents"
            className="text-xs text-text-muted hover:text-cyan flex items-center gap-1 transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Incidents
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-cloud-white tracking-tight">
              {incident.reference_code}
            </h1>
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              incident.priority === 'critical'
                ? 'bg-coral/20 text-coral'
                : incident.priority === 'high'
                ? 'bg-amber/20 text-amber'
                : 'bg-cyan/20 text-cyan'
            }`}>
              {incident.priority.toUpperCase()}
            </span>
            <StatusBadge type="status" value={incident.status} size="sm" />
          </div>
          <div className="text-xs text-text-muted flex items-center gap-2 pt-0.5">
            <Clock className="w-3.5 h-3.5 text-amber" />
            <span>{formatWaitTime(incident.created_at)}</span>
            <span>·</span>
            <span>Reported {new Date(incident.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to={`/track-request/${incident.reference_code}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-control bg-surface hover:bg-deep-slate border border-border text-xs text-text-secondary hover:text-cloud-white transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-cyan" />
            Citizen view
          </Link>

          {/* Verification Actions */}
          {(incident.status === 'submitted' || incident.status === 'under_review') && (
            <>
              <button
                onClick={handleVerify}
                disabled={actionLoading}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-control bg-cyan hover:bg-cloud-white text-midnight font-heading font-bold text-xs transition-colors shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                Verify incident
              </button>
              <button
                onClick={() => setShowRejectModal(true)}
                disabled={actionLoading}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-control bg-deep-slate hover:bg-border text-coral text-xs font-medium transition-colors"
              >
                <XCircle className="w-4 h-4" />
                Reject
              </button>
            </>
          )}

          {/* Dispatch Action */}
          {incident.status === 'verified' && (
            <Link
              to={`/ops/dispatch?incident_id=${incident.id}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-control bg-cyan hover:bg-cloud-white text-midnight font-heading font-bold text-xs transition-colors shadow-sm"
            >
              <Truck className="w-4 h-4" />
              Dispatch responder
            </Link>
          )}

          {/* Resolution Action */}
          {(incident.status === 'assigned' || incident.status === 'in_progress') && (
            <button
              onClick={handleResolve}
              disabled={actionLoading}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-control bg-success-green hover:bg-cloud-white text-midnight font-heading font-bold text-xs transition-colors shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              Mark resolved
            </button>
          )}
        </div>
      </div>

      {/* ── 2. Location & People Affected ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Location Card */}
        <div className="p-4 rounded-card bg-surface border border-border/80 space-y-2">
          <span className="text-[11px] font-medium text-text-muted uppercase tracking-wider block">
            Location
          </span>
          <div className="flex items-start gap-2 text-cloud-white font-medium text-sm">
            <MapPin className="w-4 h-4 text-cyan mt-0.5 shrink-0" />
            <span>{incident.address_text}</span>
          </div>
          <div className="text-[11px] font-mono text-text-muted pl-6">
            GPS: {incident.latitude.toFixed(4)}°N, {incident.longitude.toFixed(4)}°E
          </div>
        </div>

        {/* People Affected Card */}
        <div className="p-4 rounded-card bg-surface border border-border/80 space-y-2">
          <span className="text-[11px] font-medium text-text-muted uppercase tracking-wider block">
            People Affected
          </span>
          <div className="flex items-center gap-6">
            <div>
              <span className="text-text-muted text-xs block">Total people</span>
              <span className="font-heading font-extrabold text-xl text-cloud-white">
                {incident.people_count}
              </span>
            </div>
            {incident.trapped_count > 0 && (
              <div>
                <span className="text-coral text-xs block">Trapped</span>
                <span className="font-heading font-extrabold text-xl text-coral">
                  {incident.trapped_count}
                </span>
              </div>
            )}
            <div>
              <span className="text-text-muted text-xs block">Medical status</span>
              {incident.medical_assistance_needed ? (
                <span className="text-coral font-semibold text-xs flex items-center gap-1 mt-1">
                  <HeartPulse className="w-3.5 h-3.5" /> Urgent EMS
                </span>
              ) : (
                <span className="text-text-secondary text-xs mt-1 block">
                  Non-critical
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Reported Situation & Contact Details ───────────────────────────── */}
      <div className="p-5 rounded-card bg-surface border border-border/80 space-y-3">
        <span className="text-[11px] font-medium text-text-muted uppercase tracking-wider block">
          Citizen Reported Description
        </span>
        <p className="text-xs sm:text-sm text-text-secondary leading-relaxed p-4 rounded-card bg-midnight/60 border border-border/60">
          "{incident.description}"
        </p>
        <div className="flex flex-wrap items-center justify-between text-xs text-text-muted pt-1">
          <span className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" />
            Reporter: <strong className="text-cloud-white">{incident.reporter_name}</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5" />
            Contact: <span className="font-mono text-cloud-white">{incident.reporter_contact}</span>
          </span>
        </div>
      </div>

      {/* ── 4. Verification & Triage Evaluation ─────────────────────────────────── */}
      <div className="p-5 rounded-card bg-surface border border-border/80 space-y-3">
        <div className="flex items-center justify-between border-b border-border/60 pb-2">
          <span className="text-[11px] font-medium text-text-muted uppercase tracking-wider">
            Triage & Operational Evaluation
          </span>
          {incident.ai_triage_score && (
            <span className="inline-flex items-center gap-1 text-xs text-purple-300 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" /> AI Priority: {incident.ai_triage_score.toFixed(0)}/100
            </span>
          )}
        </div>

        {incident.ai_recommendation_notes && (
          <p className="text-xs text-purple-200/90 leading-relaxed bg-purple-950/20 border border-purple-800/30 p-3 rounded-control">
            {incident.ai_recommendation_notes}
          </p>
        )}

        {incident.status_history && incident.status_history.length > 0 ? (
          <div className="text-xs text-text-secondary bg-midnight/50 p-3 rounded-control border border-border/60 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan shrink-0 mt-0.5" />
            <div>
              <span className="font-medium text-cloud-white block">Audit & Verification Record:</span>
              <span>{incident.status_history[incident.status_history.length - 1].notes || 'Status verified by operator.'}</span>
            </div>
          </div>
        ) : (
          <div className="text-xs text-text-muted">
            Pending operator verification. Review location coordinates and urgency before authorizing dispatch.
          </div>
        )}
      </div>

      {/* ── 5. Assignment & Response Progress ──────────────────────────────────── */}
      <div className="p-5 rounded-card bg-surface border border-border/80 space-y-3">
        <div className="flex items-center justify-between border-b border-border/60 pb-2">
          <span className="text-[11px] font-medium text-text-muted uppercase tracking-wider">
            Assignment & Field Unit Status
          </span>
          <Truck className="w-4 h-4 text-cyan" />
        </div>

        {incident.status === 'assigned' || incident.status === 'in_progress' ? (
          <div className="p-3.5 rounded-card bg-midnight/60 border border-border/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-heading font-semibold text-cloud-white text-sm block">
                Resource Assigned & Deployed
              </span>
              <span className="text-cyan text-xs">
                Status: {incident.status === 'in_progress' ? 'Unit On Site' : 'Unit En Route'}
              </span>
            </div>
            <Link
              to="/ops/resources"
              className="text-xs text-cyan hover:underline flex items-center gap-1 font-medium"
            >
              View fleet resources <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-text-muted py-2">
            <span>No responder unit currently assigned to this incident.</span>
            {incident.status === 'verified' && (
              <Link
                to={`/ops/dispatch?incident_id=${incident.id}`}
                className="px-3 py-1.5 rounded-control bg-cyan text-midnight font-heading font-bold text-xs"
              >
                Match available unit
              </Link>
            )}
          </div>
        )}
      </div>

      {/* ── 6. Operational Notes & Consequential Log ───────────────────────────── */}
      <div className="p-5 rounded-card bg-surface border border-border/80 space-y-4">
        <div className="flex items-center justify-between border-b border-border/60 pb-2">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-text-muted" />
            <span className="font-heading font-bold text-sm text-cloud-white">
              Dispatcher notes
            </span>
          </div>
          <button
            onClick={() => setNotesExpanded(!notesExpanded)}
            className="text-xs text-text-muted hover:text-cloud-white flex items-center gap-1"
          >
            {notesExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        {notesExpanded && (
          <div className="space-y-4 animate-fadeIn">
            {/* Note Input Form */}
            <form onSubmit={handleAddNote} className="space-y-2">
              <textarea
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                placeholder="Add timestamped operational update or field SITREP..."
                rows={2}
                className="w-full p-3 rounded-control bg-midnight border border-border/80 focus:border-cyan text-xs text-cloud-white placeholder-text-muted outline-none transition-all resize-none"
              />
              <div className="flex items-center justify-between">
                {noteSuccess && (
                  <span className="text-xs text-success-green flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Note saved to ledger
                  </span>
                )}
                <button
                  type="submit"
                  disabled={!noteInput.trim() || actionLoading}
                  className="ml-auto px-4 py-1.5 rounded-control bg-deep-slate hover:bg-border text-xs text-cloud-white font-medium disabled:opacity-50 transition-colors"
                >
                  Save note
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-panel bg-deep-slate border border-border p-6 space-y-4 shadow-modal">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-base text-cloud-white">
                Reject Emergency Request
              </h3>
              <button
                onClick={() => setShowRejectModal(false)}
                className="text-text-muted hover:text-cloud-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-text-secondary leading-relaxed">
              Rejecting a citizen distress call removes it from active dispatch. A formal operational justification is required for the audit record.
            </p>

            <form onSubmit={handleRejectConfirm} className="space-y-3">
              <textarea
                autoFocus
                required
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Duplicate report, test submission, or out of flood zone..."
                rows={3}
                className="w-full p-3 rounded-control bg-midnight border border-border/80 text-xs text-cloud-white placeholder-text-muted outline-none resize-none"
              />

              {rejectionError && (
                <p className="text-xs text-coral">{rejectionError}</p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="px-3 py-1.5 rounded-control text-xs text-text-muted hover:text-cloud-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-1.5 rounded-control bg-coral hover:bg-coral/90 text-cloud-white text-xs font-bold transition-colors"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

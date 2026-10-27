import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  Clock,
  MapPin,
  Users,
  HeartPulse,
  Truck,
  CheckCircle2,
  ShieldAlert,
  AlertCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import {
  trackByRef,
  getPersistedRefCode,
  type SosTrackingResponse,
} from '../services/sosApi';
import { StatusBadge } from '../components/StatusBadge';

export const CitizenStatusPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialRef = searchParams.get('ref') || '';

  const [refInput, setRefInput] = useState(initialRef || getPersistedRefCode() || '');
  const [loading, setLoading] = useState(false);
  const [incident, setIncident] = useState<SosTrackingResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchStatus = async (code: string) => {
    if (!code.trim()) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await trackByRef(code.trim());
      setIncident(data);
      setSearchParams({ ref: code.trim() });
    } catch (err: any) {
      setErrorMsg(err.message || 'Incident reference not found. Please verify the code.');
      setIncident(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialRef) {
      fetchStatus(initialRef);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only auto-fetch once on mount if a ?ref= param is present

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStatus(refInput);
  };

  const steps = [
    { key: 'submitted', label: 'SOS Received', desc: 'Logged into system' },
    { key: 'under_review', label: 'Under Review', desc: 'Dispatcher reviewing triage' },
    { key: 'verified', label: 'Verified', desc: 'Situation confirmed' },
    { key: 'assigned', label: 'Unit Assigned', desc: 'Rescue craft assigned' },
    { key: 'in_progress', label: 'Unit En Route', desc: 'Responders en route' },
    { key: 'resolved', label: 'Resolved', desc: 'Safe evacuation complete' },
  ];

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'submitted': return 0;
      case 'under_review': return 1;
      case 'verified': return 2;
      case 'assigned': return 3;
      case 'in_progress': return 4;
      case 'resolved': return 5;
      default: return 0;
    }
  };

  const currentStep = incident ? getStepIndex(incident.status) : 0;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Search Header */}
      <div className="space-y-2 text-center max-w-xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Track Emergency SOS Status
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Enter your unique reference code to follow real-time incident verification, responder dispatch, and shelter transport.
        </p>
      </div>

      {/* Reference Input Form */}
      <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto">
        <div className="relative flex-1">
          <input
            type="text"
            value={refInput}
            onChange={(e) => setRefInput(e.target.value)}
            placeholder="e.g. SOS-2026-FLOOD-8492"
            className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 focus:border-relief-500 text-sm font-mono text-white placeholder-slate-600 outline-none uppercase"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 rounded-xl bg-relief-600 hover:bg-relief-500 text-white font-bold text-sm flex items-center gap-2 transition-colors cursor-pointer"
        >
          <Search className="w-4 h-4" />
          {loading ? 'Searching...' : 'Track'}
        </button>
      </form>

      {/* Tip for finding codes */}
      <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
        <span>Submit an SOS on the{' '}</span>
        <Link to="/request-assistance" className="underline hover:text-relief-400 font-semibold">
          Request Assistance
        </Link>
        <span>page to get your reference code.</span>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Incident Status View */}
      {incident && (
        <div className="space-y-6">
          {/* Main Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <span className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">Reference Code</span>
                <div className="font-mono text-2xl font-black text-relief-400">{incident.reference_code}</div>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge type="priority" value={incident.priority} size="md" />
                <StatusBadge type="status" value={incident.status} size="md" />
              </div>
            </div>

            {/* Visual Multi-step Timeline */}
            <div className="space-y-3 py-2">
              <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                Rescue Pipeline Progress
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {steps.map((st, idx) => {
                  const isDone = idx <= currentStep;
                  const isCurrent = idx === currentStep;

                  return (
                    <div
                      key={st.key}
                      className={`p-3 rounded-xl border transition-all ${
                        isCurrent
                          ? 'bg-relief-950/80 border-relief-500/80 text-relief-100 shadow-lg shadow-relief-950/50'
                          : isDone
                          ? 'bg-slate-950/90 border-slate-800 text-slate-300'
                          : 'bg-slate-950/40 border-slate-900 text-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold font-mono">0{idx + 1}</span>
                        {isDone ? (
                          <CheckCircle2 className={`w-3.5 h-3.5 ${isCurrent ? 'text-relief-400 animate-pulse' : 'text-emerald-400'}`} />
                        ) : (
                          <Clock className="w-3.5 h-3.5 text-slate-600" />
                        )}
                      </div>
                      <div className="font-bold text-xs">{st.label}</div>
                      <div className="text-[10px] text-slate-500 leading-tight mt-0.5">{st.desc}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Incident Details Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800/80 text-xs text-slate-300">
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <MapPin className="w-4 h-4 text-slate-500" />
                  <span className="text-slate-200 font-medium">{incident.address_text}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-500" />
                  <span>{incident.people_count} individuals ({incident.trapped_count} trapped)</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <HeartPulse className="w-4 h-4 text-slate-500" />
                  <span>
                    Medical urgency: {incident.medical_assistance_needed ? (
                      <strong className="text-emergency-400">YES &mdash; Priority medical support</strong>
                    ) : 'No acute trauma reported'}
                  </span>
                </div>
                {incident.special_needs_description && (
                  <p className="text-slate-400">
                    Special notes: <span className="text-slate-300 italic">{incident.special_needs_description}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase text-slate-500">Situation Logged</span>
              <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-900 leading-relaxed">
                {incident.description}
              </p>
            </div>

            {/* Status History Timeline Entries */}
            {incident.status_history && incident.status_history.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                  Operational Activity Log
                </span>
                <div className="space-y-2">
                  {incident.status_history.map((hist, i) => (
                    <div key={`${hist.status}-${i}`} className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/60 text-xs">
                      <Clock className="w-3.5 h-3.5 text-slate-500 mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-200 capitalize">
                            Status changed to {hist.status.replace(/_/g, ' ')}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {new Date(hist.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        {hist.notes && <p className="text-slate-400 text-[11px] mt-0.5">{hist.notes}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

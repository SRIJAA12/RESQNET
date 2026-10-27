import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  Users,
  Shield,
  ShieldAlert,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  LifeBuoy,
  PhoneCall,
  Lock,
  HeartPulse,
  Navigation,
  FileText,
  Home
} from 'lucide-react';
import {
  trackByRef,
  getPersistedRefCode,
  type SosTrackingResponse,
} from '../services/sosApi';

export const TrackRequestPage: React.FC = () => {
  const { requestId } = useParams<{ requestId?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryRef = searchParams.get('ref') || '';

  const initialCode = (requestId || queryRef || '').trim();
  const [codeInput, setCodeInput] = useState(initialCode);
  const [incident, setIncident] = useState<SosTrackingResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Pre-fill with the reference code from the most recent submission in this session
  useEffect(() => {
    if (!initialCode) {
      const persisted = getPersistedRefCode();
      if (persisted) {
        setCodeInput(persisted);
      }
    }
  }, []);

  const fetchRequest = async (ref: string) => {
    if (!ref.trim()) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await trackByRef(ref.trim());
      setIncident(data);
      // Update query param if not in direct :requestId route
      if (!requestId) {
        setSearchParams({ ref: ref.trim() });
      }
    } catch (err: any) {
      setIncident(null);
      setErrorMsg(
        err.message ||
          `We couldn't locate reference '${ref}'. Please verify the tracking code from your submission receipt.`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialCode) {
      fetchRequest(initialCode);
    }
  }, [requestId, queryRef]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (codeInput.trim()) {
      fetchRequest(codeInput.trim());
    }
  };


  const getStatusStepIndex = (status: string) => {
    switch (status) {
      case 'submitted':
        return 0;
      case 'under_review':
        return 1;
      case 'verified':
        return 2;
      case 'assigned':
        return 3;
      case 'in_progress':
        return 4;
      case 'resolved':
        return 5;
      case 'rejected':
        return -1;
      default:
        return 0;
    }
  };

  const steps = [
    { title: 'Submitted', desc: 'Request securely logged' },
    { title: 'Triage Review', desc: 'Dispatcher prioritizing' },
    { title: 'Verified', desc: 'Situation confirmed' },
    { title: 'Unit Assigned', desc: 'Rescue craft assigned' },
    { title: 'En Route', desc: 'Responders in transit' },
    { title: 'Resolved', desc: 'Extraction completed' },
  ];

  const currentStep = incident ? getStatusStepIndex(incident.status) : 0;
  const isRejected = incident?.status === 'rejected';

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Simulation Advisory Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-amber-900 shadow-sm">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm">
          <p className="font-bold">TRAINING & DISASTER SIMULATION PREVIEW</p>
          <p className="mt-0.5 text-amber-800">
            This tracking view is connected to the RESQNET operational coordination simulation.
            In a real life-threatening emergency, always contact emergency services (911) or your national disaster hotline directly.
          </p>
        </div>
      </div>

      {/* Page Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Track Assistance Request
        </h1>
        <p className="text-slate-600 text-sm max-w-xl mx-auto">
          Monitor verification, responder unit assignment, and evacuation telemetry using your unique incident reference code.
        </p>
      </div>

      {/* Search Bar / Input Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-sm">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              placeholder="e.g. SOS-2026-FLOOD-8492"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 text-slate-900 font-mono text-sm tracking-wider uppercase transition-all outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !codeInput.trim()}
            className="px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Looking up...
              </>
            ) : (
              <>
                Track Status
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Session hint — if a code was persisted from this session */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span className="font-medium text-slate-700">Tip:</span>
          <span>
            After submitting an SOS on the{' '}
            <Link to="/request-assistance" className="underline text-teal-700 hover:text-teal-800 font-semibold">
              Request Assistance
            </Link>
            {' '}page, your unique reference code (e.g. <span className="font-mono">SOS-2026-FLOOD-XXXX</span>) will appear here automatically.
          </span>
        </div>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3 text-red-900 animate-fadeIn">
          <ShieldAlert className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-red-800">Request Not Located</p>
            <p className="mt-1 text-red-700">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Incident Result Display */}
      {incident && (
        <div className="space-y-6 animate-fadeIn">
          {/* Main Status Header Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-wider font-semibold text-slate-500">
                    Incident Tracking Code
                  </span>
                  <span className="flex items-center gap-1 text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                    <Lock className="w-3 h-3 text-slate-400" /> Masked & Protected
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xl sm:text-2xl font-black font-mono text-slate-900 tracking-wide">
                    {incident.reference_code}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      incident.priority === 'critical'
                        ? 'bg-red-100 text-red-700 border border-red-200'
                        : incident.priority === 'high'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-blue-100 text-blue-800 border border-blue-200'
                    }`}
                  >
                    {incident.priority} Priority
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => fetchRequest(incident.reference_code)}
                className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                Refresh State
              </button>
            </div>

            {/* Workflow Progress Steps */}
            {!isRejected ? (
              <div className="py-2">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
                  Incident Response Lifecycle
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                  {steps.map((st, idx) => {
                    const isDone = currentStep >= idx;
                    const isCurrent = currentStep === idx;
                    return (
                      <div
                        key={st.title}
                        className={`p-3 rounded-2xl border transition-all ${
                          isCurrent
                            ? 'bg-teal-50 border-teal-500 shadow-sm'
                            : isDone
                            ? 'bg-emerald-50/60 border-emerald-200'
                            : 'bg-slate-50 border-slate-200 opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              isCurrent
                                ? 'bg-teal-600 text-white'
                                : isDone
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-300 text-slate-600'
                            }`}
                          >
                            {isDone ? '✓' : idx + 1}
                          </div>
                          <span
                            className={`text-xs font-bold leading-tight ${
                              isCurrent
                                ? 'text-teal-900'
                                : isDone
                                ? 'text-emerald-900'
                                : 'text-slate-600'
                            }`}
                          >
                            {st.title}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-tight pl-7">
                          {st.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <ShieldAlert className="w-5 h-5 text-rose-600" />
                  Request Status: Marked Closed / Rejected by Operations
                </div>
                <p className="text-xs text-rose-700 mt-1">
                  This report has been reviewed by the dispatch team and marked as duplicate, outside zone, or resolved. Check status history below for logged dispatcher remarks.
                </p>
              </div>
            )}

            {/* Privacy Protection Note */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-600 flex items-start gap-3">
              <Shield className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-900">Victim Privacy Protection: </span>
                To protect citizen identity and location security during emergencies, public tracking views mask personal contact phone numbers and exact door numbers. Emergency dispatchers access unmasked operational records internally.
              </div>
            </div>

            {/* Key Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-slate-400" />
                  Reported Situation
                </div>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">People In Danger:</span>
                    <span className="font-semibold text-slate-900">{incident.people_count} individuals</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Trapped / Waterbound:</span>
                    <span className="font-semibold text-slate-900">
                      {incident.trapped_count > 0 ? (
                        <span className="text-red-600 font-bold">{incident.trapped_count} trapped</span>
                      ) : (
                        'None reported'
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Medical Urgency:</span>
                    <span className="font-semibold">
                      {incident.medical_assistance_needed ? (
                        <span className="text-red-600 font-bold flex items-center gap-1">
                          <HeartPulse className="w-3.5 h-3.5" /> Urgent Medical Needed
                        </span>
                      ) : (
                        <span className="text-slate-600">Standard Extraction</span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Reporter:</span>
                    <span className="font-mono text-slate-700 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-slate-400" />
                      Protected (masked)
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  Location Details
                </div>
                <div className="space-y-2 text-sm">
                  <div className="text-slate-800 font-medium">
                    {incident.address_text}
                  </div>
                  <div className="text-xs text-slate-500 font-mono flex items-center gap-1">
                    <Lock className="w-3 h-3 text-slate-400" />
                    Coordinates protected for operational security
                  </div>
                  <div className="pt-2 text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="font-semibold text-slate-900">Description: </span>
                    {incident.description}
                  </div>
                  {incident.special_needs_description && (
                    <div className="text-xs text-amber-900 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                      <span className="font-semibold">Special needs: </span>
                      {incident.special_needs_description}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Assigned Unit Card (if assigned or in progress) */}
            {(incident.status === 'assigned' || incident.status === 'in_progress') && (
              <div className="p-5 rounded-2xl bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 space-y-3">
                <div className="flex items-center gap-2 text-teal-900 font-bold text-sm">
                  <LifeBuoy className="w-5 h-5 text-teal-600" />
                  Assigned Emergency Response Craft
                </div>
                <p className="text-xs text-teal-800">
                  A rapid-water evacuation asset has been committed to your location. Maintain high ground and keep signalling devices ready.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                  <div className="bg-white/80 p-2.5 rounded-xl border border-teal-200">
                    <span className="text-slate-500 block">Dispatch Status</span>
                    <span className="font-bold text-teal-700 capitalize">
                      {incident.status === 'in_progress' ? 'En Route / Navigating' : 'Unit Staged / Mobilizing'}
                    </span>
                  </div>
                  <div className="bg-white/80 p-2.5 rounded-xl border border-teal-200">
                    <span className="text-slate-500 block">Protocol</span>
                    <span className="font-bold text-slate-900">VHF Marine Ch. 16 / Ops 04</span>
                  </div>
                  <div className="bg-white/80 p-2.5 rounded-xl border border-teal-200">
                    <span className="text-slate-500 block">Safety Instruction</span>
                    <span className="font-bold text-slate-900">Flash light or wave bright cloth</span>
                  </div>
                </div>
              </div>
            )}

            {/* Status History Timeline */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-500" />
                  Incident Telemetry Timeline
                </h3>
                <span className="text-xs text-slate-500">
                  {incident.status_history?.length || 1} logged events
                </span>
              </div>

              <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {incident.status_history && incident.status_history.length > 0 ? (
                  incident.status_history.map((h, i) => (
                    <div key={`${h.status}-${i}`} className="relative text-xs">
                      <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-teal-600 border-2 border-white ring-1 ring-slate-200" />
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 uppercase tracking-wider">
                            {h.status.replace(/_/g, ' ')}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {new Date(h.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        {h.notes && <p className="text-slate-600">{h.notes}</p>}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="relative text-xs">
                    <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-teal-600 border-2 border-white" />
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <span className="font-bold text-slate-900">Incident Reported</span>
                      <p className="text-slate-500 mt-1">Logged into dispatch queue.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Links */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link
              to="/safety"
              className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700 hover:text-teal-800 transition-colors"
            >
              <LifeBuoy className="w-4 h-4" />
              Review Flood Safety Guidance & Rooftop Signaling
            </Link>

            <Link
              to="/request-assistance"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors"
            >
              Submit Another SOS Report
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackRequestPage;

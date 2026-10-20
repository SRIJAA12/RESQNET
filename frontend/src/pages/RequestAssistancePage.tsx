import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Incident } from '../types';
import { 
  ShieldAlert, 
  MapPin, 
  Users, 
  HeartPulse, 
  Send, 
  CheckCircle2, 
  Copy, 
  Check, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft,
  LifeBuoy,
  PhoneCall,
  Info,
  Clock
} from 'lucide-react';

export const RequestAssistancePage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submittedIncident, setSubmittedIncident] = useState<Incident | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [assistanceType, setAssistanceType] = useState<'evacuation' | 'medical' | 'supplies' | 'vulnerable'>('evacuation');
  const [peopleCount, setPeopleCount] = useState(2);
  const [trappedCount, setTrappedCount] = useState(2);
  const [medicalUrgent, setMedicalUrgent] = useState(false);
  const [specialNeeds, setSpecialNeeds] = useState('');
  
  const [addressText, setAddressText] = useState('');
  const [latitude, setLatitude] = useState(28.5710);
  const [longitude, setLongitude] = useState(77.2390);

  const [reporterName, setReporterName] = useState('');
  const [reporterContact, setReporterContact] = useState('');
  const [isVictim, setIsVictim] = useState(true);
  const [description, setDescription] = useState('');

  // Location presets
  const presets = [
    { label: 'River Creek Colony (Sector B)', lat: 28.5710, lon: 77.2390, addr: 'Plot 42, River Creek Colony, Sector B' },
    { label: 'West Dike Flood Sector', lat: 28.5840, lon: 77.2210, addr: 'Near Dike Gate 3, West Riverbank' },
    { label: 'North Delta Basin High Terrace', lat: 28.5990, lon: 77.2450, addr: 'Avenue 4, North Delta Commercial Strip' },
  ];

  const handleNext = () => {
    setErrorMsg(null);
    if (currentStep === 1) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (peopleCount < 1) {
        setErrorMsg('Please specify at least 1 person affected.');
        return;
      }
      if (!description.trim() || description.length < 10) {
        setErrorMsg('Please provide a brief description of the situation (min 10 characters).');
        return;
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (!addressText.trim() || addressText.length < 5) {
        setErrorMsg('Please enter a specific landmark, building, or street address.');
        return;
      }
      setCurrentStep(4);
    }
  };

  const handlePrev = () => {
    setErrorMsg(null);
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reporterName.trim() || reporterName.length < 2) {
      setErrorMsg('Please enter your name or caller identifier.');
      return;
    }
    if (!reporterContact.trim() || reporterContact.length < 5) {
      setErrorMsg('Please provide a working contact phone or radio channel.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const created = await api.createIncident({
        reporter_name: reporterName.trim(),
        reporter_contact: reporterContact.trim(),
        reporter_is_victim: isVictim,
        people_count: Number(peopleCount),
        trapped_count: Number(trappedCount),
        medical_assistance_needed: medicalUrgent || assistanceType === 'medical',
        special_needs_description: specialNeeds.trim() || null,
        description: `[${assistanceType.toUpperCase()}] ${description.trim()}`,
        address_text: addressText.trim(),
        latitude: Number(latitude),
        longitude: Number(longitude),
        disaster_type: 'flood',
      });
      setSubmittedIncident(created);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit distress request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyCode = () => {
    if (submittedIncident) {
      navigator.clipboard.writeText(submittedIncident.reference_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // ── Success Confirmation Screen ─────────────────────────────────────────────
  if (submittedIncident) {
    return (
      <div className="max-w-xl mx-auto py-8">
        <div className="p-6 sm:p-10 rounded-2xl bg-white border border-slate-200 shadow-lg space-y-6 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Request Successfully Queued
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
              Distress Ticket Generated
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
              Your assistance request has been prioritized in the Riverbend control-room dispatch queue for human operator review.
            </p>
          </div>

          {/* Reference Code Card */}
          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider block">
              Unique Tracking Reference Code
            </span>
            <div className="flex items-center justify-center gap-3">
              <span className="font-mono text-2xl sm:text-3xl font-black text-teal-800 tracking-wider">
                {submittedIncident.reference_code}
              </span>
              <button
                onClick={handleCopyCode}
                className="p-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 transition-colors shadow-xs"
                title="Copy Code"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Save this reference code to monitor real-time responder dispatch and shelter intake.
            </p>
          </div>

          {/* Clear Simulation Notice */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-left text-xs text-amber-900 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-amber-950">
              <AlertCircle className="w-4 h-4 text-amber-700" />
              <span>Demonstration Simulation Notice:</span>
            </div>
            <p className="leading-relaxed">
              This request was saved into the <strong>RESQNET local simulation database</strong>. It has <strong>NOT</strong> contacted 911, local police, or municipal fire departments. In an actual real-life emergency, please call official emergency numbers.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to={`/track-request/${submittedIncident.reference_code}`}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              Track Request Status <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/"
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition-colors"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Multi-Stage Wizard Form ─────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Step Header */}
      <div className="space-y-1 text-center">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">
          Emergency Assistance Entry
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
          Request Flood Assistance
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Step {currentStep} of 4 &bull; Accurate headcount and landmark details enable dispatchers to assign appropriate watercraft.
        </p>
      </div>

      {/* Progress Track */}
      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
        <div
          className="bg-teal-600 h-full transition-all duration-300 rounded-full"
          style={{ width: `${(currentStep / 4) * 100}%` }}
        />
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Form Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-md space-y-6">
        
        {/* ── STEP 1: Assistance Type & Special Needs ───────────────────────── */}
        {currentStep === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-base font-bold text-slate-900 font-display">
                What type of assistance is required?
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Select the primary operational requirement for your situation.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAssistanceType('evacuation')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  assistanceType === 'evacuation'
                    ? 'border-teal-600 bg-teal-50/70 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <LifeBuoy className="w-4 h-4 text-teal-700" />
                  Water Evacuation
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Surrounded by rising floodwaters; stranded on roof or upper floor.
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAssistanceType('medical');
                  setMedicalUrgent(true);
                }}
                className={`p-4 rounded-xl border text-left transition-all ${
                  assistanceType === 'medical'
                    ? 'border-red-600 bg-red-50/70 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <HeartPulse className="w-4 h-4 text-red-600" />
                  Urgent Medical Care
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Immediate trauma, critical medication shortage, or severe hypothermia.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setAssistanceType('vulnerable')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  assistanceType === 'vulnerable'
                    ? 'border-amber-600 bg-amber-50/70 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-700" />
                  Elderly / Infant Needs
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Non-ambulatory individuals, infants requiring formula, or disabled residents.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setAssistanceType('supplies')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  assistanceType === 'supplies'
                    ? 'border-teal-600 bg-teal-50/70 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-teal-700" />
                  Clean Water / Rations
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Secure on upper floor but potable water and dry food exhausted.
                </p>
              </button>
            </div>

            {/* Special Needs Field */}
            <div className="space-y-1.5 pt-2">
              <label className="block text-xs font-semibold text-slate-700">
                Special Medical / Physical Requirements (Optional)
              </label>
              <input
                type="text"
                value={specialNeeds}
                onChange={(e) => setSpecialNeeds(e.target.value)}
                placeholder="e.g. Oxygen concentrator required, 2 infants under 1 year, 1 pet dog"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-teal-600 text-xs text-slate-900 outline-none"
              />
            </div>
          </div>
        )}

        {/* ── STEP 2: Headcount & Situation Narrative ────────────────────────── */}
        {currentStep === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-base font-bold text-slate-900 font-display">
                Headcount & Current Hazard Conditions
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Help rescue boat pilots prepare sufficient life jackets and capacity.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Total People Affected
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={peopleCount}
                  onChange={(e) => setPeopleCount(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-teal-600 text-sm font-bold text-slate-900 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Trapped / Cannot Move
                </label>
                <input
                  type="number"
                  min="0"
                  max={peopleCount}
                  value={trappedCount}
                  onChange={(e) => setTrappedCount(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-teal-600 text-sm font-bold text-red-600 outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Describe Immediate Hazard & Water Level *
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Water is 1.8 meters high on the ground floor. 3 people are stranded on the terrace. Power is completely out and water continues to rise."
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-teal-600 text-xs text-slate-900 outline-none resize-none leading-relaxed"
              />
            </div>
          </div>
        )}

        {/* ── STEP 3: Location Confirmation ─────────────────────────────────── */}
        {currentStep === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-base font-bold text-slate-900 font-display">
                Confirm Exact Distress Location
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Boats navigate by landmarks and coordinates. Provide visual building cues.
              </p>
            </div>

            {/* Quick Pick Presets */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Quick-Pick Simulated Sector Landmarks:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {presets.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => {
                      setAddressText(p.addr);
                      setLatitude(p.lat);
                      setLongitude(p.lon);
                    }}
                    className="p-2.5 rounded-lg border border-slate-200 hover:border-teal-600 bg-slate-50 hover:bg-teal-50 text-left text-xs transition-colors"
                  >
                    <span className="font-semibold text-slate-900 block truncate">{p.label}</span>
                    <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">{p.lat}, {p.lon}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Detailed Street Address / Landmark *
              </label>
              <input
                type="text"
                value={addressText}
                onChange={(e) => setAddressText(e.target.value)}
                placeholder="e.g. Blue 2-story house next to River Creek Primary School"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-teal-600 text-xs text-slate-900 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-600">Latitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={latitude}
                  onChange={(e) => setLatitude(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono text-slate-900 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-600">Longitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={longitude}
                  onChange={(e) => setLongitude(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono text-slate-900 outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 4: Caller Contact & Review ───────────────────────────────── */}
        {currentStep === 4 && (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <h2 className="text-base font-bold text-slate-900 font-display">
                Caller Contact & Final Review
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                We need contact details so the boat commander can hail you upon arrival.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  placeholder="e.g. Sunita Sharma"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-teal-600 text-xs text-slate-900 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Phone / Radio Number *
                </label>
                <input
                  type="text"
                  value={reporterContact}
                  onChange={(e) => setReporterContact(e.target.value)}
                  placeholder="e.g. 555-017-9141"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-teal-600 text-xs text-slate-900 outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isVictim"
                checked={isVictim}
                onChange={(e) => setIsVictim(e.target.checked)}
                className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
              />
              <label htmlFor="isVictim" className="text-xs text-slate-700 font-medium">
                I am personally at this location and need rescue
              </label>
            </div>

            {/* Summary Review Strip */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <div className="font-bold text-slate-900 uppercase text-[11px] border-b border-slate-200 pb-1">
                Submission Summary
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Assistance Category:</span>
                <span className="font-semibold text-slate-800 uppercase">{assistanceType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">People Affected:</span>
                <span className="font-semibold text-slate-800">{peopleCount} ({trappedCount} trapped)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Location:</span>
                <span className="font-semibold text-slate-800 truncate max-w-[240px]">{addressText}</span>
              </div>
            </div>

            {/* Navigation & Submit Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={handlePrev}
                className="px-4 py-2.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span>Transmitting SOS...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" /> Confirm & Send Emergency Request
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Wizard Forward Navigation (Steps 1, 2, 3) */}
        {currentStep < 4 && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-200">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handlePrev}
                className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
            ) : (
              <div />
            )}

            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              Continue to Step {currentStep + 1} <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

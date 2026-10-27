import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldAlert,
  MapPin,
  HeartPulse,
  Users,
  Send,
  CheckCircle2,
  Copy,
  Check,
  AlertCircle,
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import {
  submitSos,
  persistRefCode,
  clearPersistedRefCode,
  type SosSubmissionResponse,
} from '../services/sosApi';

const sosSchema = z.object({
  reporter_name: z.string().min(2, 'Name must be at least 2 characters'),
  reporter_contact: z.string().min(5, 'Valid phone number or contact required'),
  reporter_is_victim: z.boolean(),
  people_count: z.number().min(1, 'At least 1 person must be reported').max(500),
  trapped_count: z.number().min(0).max(500),
  medical_assistance_needed: z.boolean(),
  special_needs_description: z.string().optional(),
  address_text: z.string().min(5, 'Detailed location / landmark required'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  description: z.string().min(10, 'Please describe situation and immediate hazards (min 10 chars)'),
});

type SosFormValues = z.infer<typeof sosSchema>;

export const CitizenSosPage: React.FC = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [submittedIncident, setSubmittedIncident] = useState<SosSubmissionResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SosFormValues>({
    resolver: zodResolver(sosSchema),
    defaultValues: {
      reporter_name: '',
      reporter_contact: '',
      reporter_is_victim: true,
      people_count: 1,
      trapped_count: 0,
      medical_assistance_needed: false,
      special_needs_description: '',
      address_text: '',
      latitude: 28.5720,
      longitude: 77.2350,
      description: '',
    },
  });

  const isMedical = watch('medical_assistance_needed');

  const onSubmit = async (values: SosFormValues) => {
    setSubmitting(true);
    setErrorMsg(null);
    try {
      clearPersistedRefCode();
      const result = await submitSos({
        ...values,
        disaster_type: 'flood',
      });
      // Store only the opaque reference code — no PII
      persistRefCode(result.reference_code);
      setSubmittedIncident(result);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit emergency request. Please try again.');
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

  const setLocationPreset = (name: string, lat: number, lon: number, address: string) => {
    setValue('latitude', lat);
    setValue('longitude', lon);
    setValue('address_text', address);
  };

  if (submittedIncident) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <div className="p-6 sm:p-10 rounded-3xl bg-slate-900 border border-emerald-500/50 shadow-2xl space-y-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-400 flex items-center justify-center mx-auto animate-bounce">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Emergency SOS Dispatched
            </h1>
            <p className="text-sm text-slate-300">
              Your request has been prioritized and logged into the active control-room dispatch queue.
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
              Emergency Reference Code
            </span>
            <div className="flex items-center justify-center gap-3">
              <span className="font-mono text-2xl sm:text-3xl font-black text-relief-400 tracking-wider">
                {submittedIncident.reference_code}
              </span>
              <button
                onClick={handleCopyCode}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Copy reference code"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Save this code to track real-time responder dispatch and rescue updates.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/40 text-left text-xs text-amber-200 space-y-1">
            <span className="font-bold flex items-center gap-1.5 text-amber-300">
              <ShieldAlert className="w-4 h-4" /> Immediate Flood Safety Guidance:
            </span>
            <ul className="list-disc list-inside space-y-0.5 text-slate-300">
              <li>Stay on the highest available floor or rooftop with clear aerial visibility.</li>
              <li>Do not attempt to walk or drive through flowing water.</li>
              <li>Keep phone on low-power mode to preserve battery for responders.</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to={`/status?ref=${submittedIncident.reference_code}`}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-relief-600 hover:bg-relief-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors"
            >
              Track Live Incident Status <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={() => {
                setSubmittedIncident(null);
              }}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition-colors"
            >
              Submit Another SOS
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Title */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emergency-500 animate-ping" />
          <span className="text-xs font-bold uppercase tracking-wider text-emergency-400">
            Citizen Emergency Dispatch Entry
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Submit Citizen SOS Request
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Provide accurate headcount, trapped status, and location so control-room dispatchers can match the appropriate rescue boats, high-water trucks, or paramedics.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* SOS Form Card */}
      <form onSubmit={handleSubmit(onSubmit)} className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-6">
        
        {/* Section 1: Contact & Victim Details */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase text-slate-400 tracking-wider pb-1 border-b border-slate-800">
            1. Reporter & Contact Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                {...register('reporter_name')}
                placeholder="e.g. Sunita Sharma"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-relief-500 focus:ring-1 focus:ring-relief-500 text-sm text-white placeholder-slate-600 outline-none transition-colors"
              />
              {errors.reporter_name && (
                <p className="text-xs text-emergency-400 mt-1">{errors.reporter_name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Emergency Phone / Contact *
              </label>
              <input
                type="text"
                {...register('reporter_contact')}
                placeholder="e.g. 555-017-9141"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-relief-500 focus:ring-1 focus:ring-relief-500 text-sm text-white placeholder-slate-600 outline-none transition-colors"
              />
              {errors.reporter_contact && (
                <p className="text-xs text-emergency-400 mt-1">{errors.reporter_contact.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <input
              type="checkbox"
              id="reporter_is_victim"
              {...register('reporter_is_victim')}
              className="w-4 h-4 rounded text-relief-600 bg-slate-950 border-slate-700 focus:ring-relief-500"
            />
            <label htmlFor="reporter_is_victim" className="text-xs text-slate-300 font-medium cursor-pointer">
              I am currently trapped / at the scene directly affected by the emergency
            </label>
          </div>
        </div>

        {/* Section 2: Location Details */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-1 border-b border-slate-800">
            <h2 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
              2. Emergency Location & GPS
            </h2>
            <div className="text-[11px] text-slate-500">Synthetic Scenario Coordinates</div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Street Address / Landmark / Floor *
            </label>
            <input
              type="text"
              {...register('address_text')}
              placeholder="e.g. Plot 42, River Creek Colony, Sector B (Rooftop)"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-relief-500 focus:ring-1 focus:ring-relief-500 text-sm text-white placeholder-slate-600 outline-none transition-colors"
            />
            {errors.address_text && (
              <p className="text-xs text-emergency-400 mt-1">{errors.address_text.message}</p>
            )}
          </div>

          {/* Quick preset buttons for demo testing */}
          <div className="space-y-1">
            <span className="text-[11px] text-slate-400">Quick simulation flood coordinates:</span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setLocationPreset('Sector B (Deep Water)', 28.5710, 77.2390, 'Plot 42, River Creek Colony, Sector B')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium border border-slate-700 transition-colors"
              >
                Sector B (28.5710, 77.2390)
              </button>
              <button
                type="button"
                onClick={() => setLocationPreset('Delta Sector (Riverbed)', 28.5630, 77.2480, 'Green Oasis Apartments, Delta Sector')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium border border-slate-700 transition-colors"
              >
                Delta Sector (28.5630, 77.2480)
              </button>
              <button
                type="button"
                onClick={() => setLocationPreset('North Industrial Basin', 28.5910, 77.2110, 'Industrial Sector 9, Low-Lying Basin')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium border border-slate-700 transition-colors"
              >
                North Basin (28.5910, 77.2110)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Latitude
              </label>
              <input
                type="number"
                step="any"
                {...register('latitude', { valueAsNumber: true })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Longitude
              </label>
              <input
                type="number"
                step="any"
                {...register('longitude', { valueAsNumber: true })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Urgency & Vulnerability Assessment */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase text-slate-400 tracking-wider pb-1 border-b border-slate-800">
            3. Headcount & Urgency Flags
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Total People Requiring Assistance *
              </label>
              <input
                type="number"
                min="1"
                {...register('people_count', { valueAsNumber: true })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-relief-500 text-sm text-white outline-none"
              />
              {errors.people_count && (
                <p className="text-xs text-emergency-400 mt-1">{errors.people_count.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Number of People Imminently Trapped *
              </label>
              <input
                type="number"
                min="0"
                {...register('trapped_count', { valueAsNumber: true })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-relief-500 text-sm text-white outline-none"
              />
              <span className="text-[11px] text-slate-500">e.g. on roof, upper terrace, surrounded by water</span>
            </div>
          </div>

          {/* Urgent Medical Toggle */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-start gap-3">
            <input
              type="checkbox"
              id="medical_assistance_needed"
              {...register('medical_assistance_needed')}
              className="w-5 h-5 mt-0.5 rounded text-emergency-600 bg-slate-900 border-slate-700 focus:ring-emergency-500"
            />
            <div className="space-y-1">
              <label htmlFor="medical_assistance_needed" className="text-sm font-bold text-white flex items-center gap-2 cursor-pointer">
                <HeartPulse className="w-4 h-4 text-emergency-500" />
                Immediate Medical Assistance Needed
              </label>
              <p className="text-xs text-slate-400">
                Check this if anyone has severe trauma, hypothermia, oxygen or dialysis dependence, or critical medical emergencies.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Special Needs or Vulnerabilities (Optional)
            </label>
            <input
              type="text"
              {...register('special_needs_description')}
              placeholder="e.g. 2 infants, non-ambulatory elderly person, diabetic requiring insulin"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-600 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Detailed Situation & Water Level Description *
            </label>
            <textarea
              rows={3}
              {...register('description')}
              placeholder="Describe the current water depth, whether water is rising, accessible entry points, landmarks..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-relief-500 focus:ring-1 focus:ring-relief-500 text-sm text-white placeholder-slate-600 outline-none transition-colors resize-none"
            />
            {errors.description && (
              <p className="text-xs text-emergency-400 mt-1">{errors.description.message}</p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emergency-600 to-emergency-500 hover:from-emergency-500 hover:to-emergency-400 text-white font-extrabold text-base shadow-xl shadow-emergency-900/50 flex items-center justify-center gap-2 disabled:opacity-50 transition-all cursor-pointer"
          >
            {submitting ? (
              <span>Transmitting SOS to Control Room...</span>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Transmitting Citizen SOS to Emergency Dispatch
              </>
            )}
          </button>
          <p className="text-[11px] text-center text-slate-500 mt-2">
            AI triage will evaluate vulnerability factors for immediate review by human dispatchers.
          </p>
        </div>

      </form>
    </div>
  );
};

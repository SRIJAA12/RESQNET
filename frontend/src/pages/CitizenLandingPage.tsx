import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { DashboardSummary, DisasterEvent } from '../types';
import { 
  ShieldAlert, 
  Search, 
  LifeBuoy, 
  ArrowRight, 
  CheckCircle2, 
  FileCheck2, 
  PhoneCall, 
  Activity,
  Anchor,
  Clock,
  Compass,
  Building2,
  AlertCircle
} from 'lucide-react';
import { ScrollReveal } from '../components/ui/ScrollReveal';

export const CitizenLandingPage: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [event, setEvent] = useState<DisasterEvent | null>(null);

  useEffect(() => {
    api.getDashboardSummary().then(setSummary).catch(console.error);
    api.getEvents().then((evts) => {
      if (evts.length > 0) setEvent(evts[0]);
    }).catch(console.error);
  }, []);

  return (
    <div className="space-y-16 pb-16 font-sans">
      {/* ── 1. Editorial Hero Section ────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-8 sm:p-12 lg:p-16 shadow-2xl border border-slate-800">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-96 h-96 bg-cyan/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-96 h-96 bg-coral/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-800/90 border border-slate-700 text-cyan text-xs font-semibold tracking-wide backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-cyan animate-pulse" />
            <span>Active Exercise &mdash; {event ? event.name : 'Riverbend Basin Flood Operation'}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12] font-display">
            Emergency Flood Assistance &amp; Citizen Relief
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal max-w-2xl">
            If you or people near you are cut off by flood waters or require urgent medical evacuation, submit an emergency assistance request immediately. Every request is reviewed by verified dispatchers.
          </p>

          <div className="flex flex-wrap items-center gap-3.5 pt-2">
            <Link
              to="/request-assistance"
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-coral hover:bg-red-500 text-white font-bold text-sm shadow-lg shadow-coral/25 hover:shadow-coral/40 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <ShieldAlert className="w-4 h-4" />
              Request Emergency Assistance
            </Link>

            <Link
              to="/track-request"
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-100 font-semibold text-sm border border-slate-700 transition-all transform hover:-translate-y-0.5"
            >
              <Search className="w-4 h-4 text-cyan" />
              Track My Request
            </Link>

            <Link
              to="/safety"
              className="inline-flex items-center gap-2 px-4 py-3.5 rounded-xl text-slate-300 hover:text-white font-medium text-sm transition-colors"
            >
              <LifeBuoy className="w-4 h-4 text-cyan" />
              Safety Checklist
            </Link>
          </div>
        </div>
      </section>

      {/* ── 2. Live Citizen Pulse Summary Cards (Staggered Reveals) ───────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 font-display">
            Active Relief Pulse
          </h2>
          <span className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
            <Activity className="w-3.5 h-3.5 text-cyan" /> Live exercise metrics
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ScrollReveal animation="fade-up" delayMs={0}>
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 transition-colors">
              <span className="text-xs font-semibold text-slate-500 tracking-wider block">
                Verified Rescues
              </span>
              <div className="text-3xl font-extrabold text-slate-900 mt-2 font-display">
                {summary ? summary.resolved_incidents ?? 18 : 18}
              </div>
              <span className="text-xs text-emerald-700 font-medium mt-1.5 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Evacuated to safety
              </span>
            </div>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delayMs={60}>
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 transition-colors">
              <span className="text-xs font-semibold text-slate-500 tracking-wider block">
                Active Rescue Boats
              </span>
              <div className="text-3xl font-extrabold text-slate-900 mt-2 font-display">
                {summary ? summary.deployed_resources : 2}
              </div>
              <span className="text-xs text-teal-700 font-medium mt-1.5 flex items-center gap-1">
                <Anchor className="w-3.5 h-3.5" /> Operating in Sector B
              </span>
            </div>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delayMs={120}>
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 transition-colors">
              <span className="text-xs font-semibold text-slate-500 tracking-wider block">
                Shelter Bed Availability
              </span>
              <div className="text-3xl font-extrabold text-slate-900 mt-2 font-display">
                {summary ? summary.shelter_available_beds : 350}
              </div>
              <span className="text-xs text-slate-600 font-medium mt-1.5 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" /> Across 3 relief shelters
              </span>
            </div>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delayMs={180}>
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 transition-colors">
              <span className="text-xs font-semibold text-slate-500 tracking-wider block">
                Dispatch Desk
              </span>
              <div className="text-3xl font-extrabold text-cyan-800 mt-2 font-display">
                Active
              </div>
              <span className="text-xs text-slate-600 font-medium mt-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Continuous operations
              </span>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── 3. How the Assistance Flow Works ──────────────────────────────────── */}
      <ScrollReveal animation="fade-up">
        <section className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-8">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-slate-900 font-display">
              How Your Assistance Request Is Handled
            </h2>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Every request is tracked with complete transparency. Human dispatchers verify water levels, location accessibility, and prioritize medical vulnerabilities before dispatching craft.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-red-100 text-coral font-bold flex items-center justify-center text-sm border border-red-200">
                1
              </div>
              <h3 className="font-semibold text-base text-slate-900 font-display">Submit Request</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Report trapped count, approximate water depth, and your exact rooftop or landmark reference.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-sm border border-teal-200">
                2
              </div>
              <h3 className="font-semibold text-base text-slate-900 font-display">Receive Stable ID</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Instantly receive an identifier (e.g., <code className="font-mono text-slate-800 bg-white px-1 py-0.5 rounded border border-slate-200">SOS-2026-FLOOD-8492</code>) to track your status.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-sm border border-amber-200">
                3
              </div>
              <h3 className="font-semibold text-base text-slate-900 font-display">Dispatcher Triage</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Control room personnel verify coordinates and assign appropriate shallow rescue boats or high-water trucks.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm border border-emerald-200">
                4
              </div>
              <h3 className="font-semibold text-base text-slate-900 font-display">Rescue &amp; Intake</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Responders transport evacuees to designated shelters with verified bed capacity and medical provisions.
              </p>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* ── 4. Purposeful Quick Action Panels ─────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ScrollReveal animation="fade-up" delayMs={50}>
          <div className="p-7 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4 h-full flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200/80 flex items-center justify-center text-teal-700">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-display">
                Already Have a Tracking Reference?
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Enter your reference code to check if a rescue unit has been dispatched, see responder progress, and confirm assigned intake shelter information.
              </p>
            </div>
            <div className="pt-2">
              <Link
                to="/track-request"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
              >
                Lookup Request Status <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal animation="fade-up" delayMs={100}>
          <div className="p-7 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4 h-full flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-700">
                <LifeBuoy className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-display">
                Flood Safety &amp; Evacuation Protocol
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Review essential steps while waiting for extraction: rooftop signaling techniques, electrical cutoff rules, and clean water ration guidelines.
              </p>
            </div>
            <div className="pt-2">
              <Link
                to="/safety"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold transition-colors"
              >
                View Safety Checklist <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </div>

      {/* ── 5. Emergency Protocol Reassurance ─────────────────────────────────── */}
      <ScrollReveal animation="fade-up">
        <div className="p-6 rounded-2xl bg-slate-100 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-800 shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900">Immediate Life Safety Notice</h4>
              <p className="text-xs text-slate-600">
                If flood waters are rising rapidly and communication fails, move to the highest accessible level and signal with bright cloth or lights.
              </p>
            </div>
          </div>
          <div className="shrink-0 flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700 bg-white px-3 py-1.5 rounded-lg border border-slate-200 font-mono">
              Emergency: 911 / 112
            </span>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
};

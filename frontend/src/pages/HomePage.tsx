import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldAlert, 
  Radio, 
  MapPin, 
  Users, 
  Layers, 
  HeartHandshake, 
  ArrowRight, 
  Activity, 
  Building2, 
  Truck,
  CheckCircle2,
  LifeBuoy
} from 'lucide-react';
import { api } from '../services/api';
import { DashboardSummary, DisasterEvent } from '../types';

export const HomePage: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [event, setEvent] = useState<DisasterEvent | null>(null);

  useEffect(() => {
    api.getDashboardSummary().then(setSummary).catch(console.error);
    api.getEvents().then(events => {
      if (events.length > 0) setEvent(events[0]);
    }).catch(console.error);
  }, []);

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 p-6 sm:p-10 lg:p-14 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-relief-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 bg-emergency-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emergency-950/80 border border-emergency-800/80 text-emergency-300 text-xs font-bold tracking-wide">
            <span className="w-2 h-2 rounded-full bg-emergency-400 animate-ping" />
            SIMULATED INCIDENT: {event ? event.name : 'Riverbend Basin Flood Operation'}
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Intelligent Disaster Relief & Resource Coordination
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            Connecting citizens, rescue teams, NGOs, shelters and control room dispatchers in a unified, 
            transaction-safe emergency operations platform. Built for resilient multi-hazard relief.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              to="/sos"
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-emergency-600 to-emergency-500 hover:from-emergency-500 hover:to-emergency-400 text-white font-bold text-sm shadow-xl shadow-emergency-900/40 hover:scale-[1.02] transition-all"
            >
              <ShieldAlert className="w-5 h-5 animate-pulse" />
              Citizen Emergency SOS
            </Link>

            <Link
              to="/dashboard"
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-white font-semibold text-sm border border-slate-700 transition-all hover:scale-[1.02]"
            >
              <Radio className="w-4 h-4 text-relief-400" />
              Open Control Room
            </Link>

            <Link
              to="/map"
              className="flex items-center gap-2 px-5 py-3.5 rounded-xl text-slate-300 hover:text-white font-medium text-sm transition-colors"
            >
              <MapPin className="w-4 h-4 text-slate-400" />
              View Situational Map
            </Link>
          </div>
        </div>
      </section>

      {/* Live Operational Pulse KPIs */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Activity className="w-4 h-4 text-relief-400" />
            Current Operations Pulse (Synthetic Data)
          </h2>
          <span className="text-xs text-slate-500">Auto-updating simulation feed</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <span className="text-xs text-slate-400 font-medium">Active SOS Incidents</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              {summary ? summary.active_incidents : 5}
            </div>
            <span className="text-[11px] text-emergency-400 font-medium mt-1 block">
              {summary ? summary.critical_incidents : 2} critical priority
            </span>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <span className="text-xs text-slate-400 font-medium">Rescue Units Deployed</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              {summary ? summary.deployed_resources : 2}
            </div>
            <span className="text-[11px] text-emerald-400 font-medium mt-1 block">
              {summary ? summary.available_resources : 3} units standby
            </span>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <span className="text-xs text-slate-400 font-medium">Shelter Capacity</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              {summary ? `${summary.shelter_occupancy_pct}%` : '68%'}
            </div>
            <span className="text-[11px] text-slate-400 font-medium mt-1 block">
              {summary ? summary.shelter_available_beds : 350} beds remaining
            </span>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <span className="text-xs text-slate-400 font-medium">Bottlenecks & Deficits</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-300 mt-1">
              {summary ? summary.unserved_critical_needs_count : 1}
            </div>
            <span className="text-[11px] text-amber-400 font-medium mt-1 block">
              Requiring immediate dispatch
            </span>
          </div>
        </div>
      </section>

      {/* Operational Workflow Steps */}
      <section className="p-6 sm:p-8 rounded-3xl bg-slate-900/40 border border-slate-800 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-white">Unified Response Workflow</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Human-in-the-loop architecture ensuring AI never autonomously executes life-critical assignments.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emergency-900/60 text-emergency-300 font-bold flex items-center justify-center text-sm border border-emergency-800">
              1
            </div>
            <h3 className="font-semibold text-sm text-slate-100">Citizen SOS Request</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Citizens submit emergency requests with trapped count, medical urgency, and GPS coordinates.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-purple-900/60 text-purple-300 font-bold flex items-center justify-center text-sm border border-purple-800">
              2
            </div>
            <h3 className="font-semibold text-sm text-slate-100">Assistive AI Triage</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Advisory vulnerability scoring based on water levels and medical urgency, reviewable by human operators.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-relief-900/60 text-relief-300 font-bold flex items-center justify-center text-sm border border-relief-800">
              3
            </div>
            <h3 className="font-semibold text-sm text-slate-100">Dispatcher Authorization</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Authorized human dispatcher reviews distance, compatible fleet, and approves dispatch with a transaction lock.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-900/60 text-emerald-300 font-bold flex items-center justify-center text-sm border border-emerald-800">
              4
            </div>
            <h3 className="font-semibold text-sm text-slate-100">Verified Resolution</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Responders confirm evacuation to designated shelters with live occupancy record updates.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Navigation Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/queue"
          className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-relief-600 transition-all group"
        >
          <div className="p-3 w-fit rounded-xl bg-relief-950 text-relief-400 border border-relief-800/60 mb-4 group-hover:scale-110 transition-transform">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white flex items-center justify-between">
            Incident Queue <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-relief-400 group-hover:translate-x-1 transition-all" />
          </h3>
          <p className="text-xs text-slate-400 mt-2">
            Manage incoming SOS requests, filter by priority, verify reports and track incident status history.
          </p>
        </Link>

        <Link
          to="/resources"
          className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-emerald-600 transition-all group"
        >
          <div className="p-3 w-fit rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800/60 mb-4 group-hover:scale-110 transition-transform">
            <Truck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white flex items-center justify-between">
            Fleet & Responders <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
          </h3>
          <p className="text-xs text-slate-400 mt-2">
            Monitor rescue boats, high-water trucks, ALS ambulances and reconnaissance drones in real time.
          </p>
        </Link>

        <Link
          to="/shelters"
          className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-indigo-600 transition-all group"
        >
          <div className="p-3 w-fit rounded-xl bg-indigo-950 text-indigo-400 border border-indigo-800/60 mb-4 group-hover:scale-110 transition-transform">
            <Building2 className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white flex items-center justify-between">
            Shelter & Supplies <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
          </h3>
          <p className="text-xs text-slate-400 mt-2">
            Track shelter bed occupancy, generator backups, potable water supplies, and relief inventory.
          </p>
        </Link>
      </section>
    </div>
  );
};

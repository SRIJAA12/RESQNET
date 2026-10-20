import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Resource, ResponderTask } from '../../types';
import { 
  User, 
  ShieldCheck, 
  LifeBuoy, 
  Radio, 
  BatteryCharging, 
  Compass, 
  Phone, 
  Award, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  RefreshCw,
  Sliders
} from 'lucide-react';

export const ResponderProfilePage: React.FC = () => {
  const [resource, setResource] = useState<Resource | null>(null);
  const [tasks, setTasks] = useState<ResponderTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getResource('res-001').catch(() => null),
      api.getResponderTasks().catch(() => [])
    ]).then(([resData, tasksData]) => {
      setResource(resData);
      setTasks(tasksData);
      setLoading(false);
    });
  }, []);

  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const activeCount = tasks.filter(t => t.status !== 'completed' && t.status !== 'cancelled').length;

  return (
    <div className="space-y-4 font-sans">
      {/* Header Profile Summary */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border-2 border-emerald-500/40 text-emerald-400 flex items-center justify-center font-mono font-black text-xl">
              A-01
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-white">Capt. Marcos Alvarez</h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Lead SAR
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Unit Call: <strong className="text-white">SWIFT-ALPHA-01</strong> // SDRF Maritime Wing
              </p>
              <div className="text-[11px] font-mono text-emerald-400 mt-0.5 flex items-center gap-1">
                <Radio className="w-3 h-3" /> VHF 156.800 MHz (Tactical Channel 2)
              </div>
            </div>
          </div>
        </div>

        {/* Tactical Readiness Stats Grid */}
        <div className="grid grid-cols-3 gap-2 text-center font-mono">
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
            <span className="text-[10px] text-slate-500 uppercase block">Active Shift</span>
            <span className="text-sm font-black text-white">4h 15m</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
            <span className="text-[10px] text-slate-500 uppercase block">Rescued Today</span>
            <span className="text-sm font-black text-emerald-400">14 Evacuees</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
            <span className="text-[10px] text-slate-500 uppercase block">Battery / Fuel</span>
            <span className="text-sm font-black text-cyan-400">
              {resource ? `${resource.battery_or_fuel_pct}%` : '88%'}
            </span>
          </div>
        </div>
      </div>

      {/* Crew Manifest & Vessel Specifications */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 font-mono text-xs">
        <span className="text-xs font-bold uppercase text-slate-400 tracking-wider block">
          Crew Roster & Vessel Specifications
        </span>

        <div className="space-y-2">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
            <div>
              <strong className="text-white block">Capt. Marcos Alvarez</strong>
              <span className="text-[11px] text-slate-400">Mission Commander & Pilot</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
              ID: SDRF-941
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
            <div>
              <strong className="text-white block">Paramedic Elena Roy</strong>
              <span className="text-[11px] text-slate-400">Triage Medic (ALS Certified)</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
              ID: MED-402
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
            <div>
              <strong className="text-white block">Navigator Ravi Chandran</strong>
              <span className="text-[11px] text-slate-400">Sonar & Night Navigation</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
              ID: NAV-119
            </span>
          </div>
        </div>

        <div className="mt-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2 text-[11px]">
          <span className="text-slate-400 uppercase font-bold block">Equipment Readiness Check</span>
          <div className="grid grid-cols-2 gap-2 text-slate-300">
            <div>• Inflatable Zodiak Hull: <strong>Inspected OK</strong></div>
            <div>• 40HP Evinrude Outboard: <strong>Operational</strong></div>
            <div>• Adult Life Vests: <strong>12 Stowed</strong></div>
            <div>• Child Hypothermia Kits: <strong>4 Ready</strong></div>
            <div>• Trauma Triage Bag: <strong>Sealed Tier-2</strong></div>
            <div>• Satellite Messenger: <strong>GPS Locked</strong></div>
          </div>
        </div>
      </div>

      {/* Mission History Ledger */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">
            Completed Shift Log ({completedCount} Missions)
          </span>
          <Award className="w-4 h-4 text-emerald-400" />
        </div>

        <div className="space-y-2">
          {tasks.filter(t => t.status === 'completed').map((t) => (
            <div key={t.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs">{t.title}</span>
                <span className="text-[10px] text-emerald-400 font-bold uppercase">Verified</span>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center justify-between">
                <span>Ref: {t.incident_reference}</span>
                <span>Rescued: {t.outcome?.people_rescued ?? t.people_count} evacuees</span>
              </div>
              {t.outcome && (
                <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-800/60 flex items-center justify-between">
                  <span>Sign-off: {t.outcome.responder_signoff}</span>
                  <span className="font-mono text-emerald-400">{t.outcome.verification_code}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { DemoRoleSwitcher } from '../components/DemoRoleSwitcher';
import { 
  ShieldAlert, 
  ClipboardList, 
  User, 
  Radio, 
  BatteryMedium, 
  MapPin, 
  Wifi, 
  AlertOctagon,
  LifeBuoy
} from 'lucide-react';

export const ResponderLayout: React.FC = () => {
  const [beaconActive, setBeaconActive] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-emerald-500 selection:text-slate-950">
      {/* Tactical Top Bar */}
      <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-emerald-900/30 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-2">
          {/* Unit Callsign & Telemetry */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
              <LifeBuoy className="w-5 h-5 animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-black tracking-wider text-emerald-400 uppercase truncate">
                  SWIFT-ALPHA-01
                </span>
                <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  ONLINE
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 truncate">
                <span className="flex items-center gap-0.5 text-slate-300">
                  <MapPin className="w-2.5 h-2.5 text-emerald-400" /> 28.571°N 77.239°E
                </span>
                <span>•</span>
                <span className="flex items-center gap-0.5 text-emerald-400">
                  <Radio className="w-2.5 h-2.5" /> TAC-2 156.8M
                </span>
              </div>
            </div>
          </div>

          {/* Right: Role Switcher & SOS Beacon */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setBeaconActive(!beaconActive)}
              className={`p-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1 border ${
                beaconActive
                  ? 'bg-red-600 text-white border-red-500 animate-bounce'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-red-400 hover:border-red-900/40'
              }`}
              title="Toggle Tactical Emergency Distress Beacon"
            >
              <AlertOctagon className="w-4 h-4" />
              <span className="hidden sm:inline text-[10px]">{beaconActive ? 'BEACON ACTIVE' : 'BEACON'}</span>
            </button>

            <DemoRoleSwitcher compact />
          </div>
        </div>
      </header>

      {/* Main Viewport Container (Mobile-First Focus) */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-4 pb-24">
        {beaconActive && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/80 border border-red-500/60 text-red-200 text-xs font-mono flex items-center justify-between gap-2 animate-pulse">
            <div className="flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-red-400 shrink-0" />
              <span>EMERGENCY DISTRESS BEACON BROADCASTING GPS TELEMETRY TO DISPATCH.</span>
            </div>
            <button
              onClick={() => setBeaconActive(false)}
              className="text-[10px] underline font-bold hover:text-white"
            >
              CANCEL
            </button>
          </div>
        )}

        <Outlet />
      </main>

      {/* Bottom Tactical Touch Navigation Bar */}
      <nav className="fixed bottom-0 inset-x-0 z-30 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 safe-area-bottom">
        <div className="max-w-md mx-auto grid grid-cols-2 gap-1 p-2">
          <NavLink
            to="/responder/tasks"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-2 px-3 rounded-xl font-mono text-xs font-bold transition-all ${
                isActive
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`
            }
          >
            <ClipboardList className="w-5 h-5 mb-1" />
            <span>Assigned Tasks</span>
          </NavLink>

          <NavLink
            to="/responder/profile"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-2 px-3 rounded-xl font-mono text-xs font-bold transition-all ${
                isActive
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`
            }
          >
            <User className="w-5 h-5 mb-1" />
            <span>Unit Profile</span>
          </NavLink>
        </div>
      </nav>
    </div>
  );
};

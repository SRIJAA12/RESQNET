import React from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { useRole } from '../context/RoleContext';
import { DemoRoleSwitcher } from '../components/DemoRoleSwitcher';
import { 
  Building2, 
  Package, 
  Truck, 
  Warehouse, 
  ShieldCheck, 
  ChevronDown, 
  ExternalLink,
  LifeBuoy
} from 'lucide-react';

export const PartnerLayout: React.FC = () => {
  const { partnerOrg, setPartnerOrg, partnerOrgs } = useRole();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-amber-500 selection:text-slate-950">
      {/* Partner Portal Header */}
      <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-amber-900/30 px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Organization Brand & Scoped Switcher */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-amber-400">
                  Relief Partner Portal
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Scoped View
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <select
                  value={partnerOrg}
                  onChange={(e) => setPartnerOrg(e.target.value)}
                  className="bg-slate-950 text-xs font-mono font-bold text-white border border-slate-800 rounded-lg px-2 py-1 outline-none focus:border-amber-500 cursor-pointer max-w-[260px] truncate"
                  title="Switch Partner Organization"
                >
                  {partnerOrgs.map((org) => (
                    <option key={org.id} value={org.name} className="bg-slate-900">
                      {org.name}
                    </option>
                  ))}
                  <option value="Red Cross Disaster Fleet & Supplies" className="bg-slate-900">
                    Red Cross Disaster Fleet & Supplies
                  </option>
                  <option value="Hope Relief Foundation" className="bg-slate-900">
                    Hope Relief Foundation
                  </option>
                  <option value="State Disaster Response Force" className="bg-slate-900">
                    State Disaster Response Force
                  </option>
                </select>
              </div>
            </div>
          </div>

          {/* Right: Navigation Tabs & Role Switcher */}
          <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
            <nav className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 font-mono text-xs">
              <NavLink
                to="/partner/inventory"
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`
                }
              >
                <Package className="w-3.5 h-3.5" />
                <span>Inventory</span>
              </NavLink>

              <NavLink
                to="/partner/distribution"
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`
                }
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Distribution</span>
              </NavLink>

              <NavLink
                to="/partner/facilities"
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`
                }
              >
                <Warehouse className="w-3.5 h-3.5" />
                <span>Facilities</span>
              </NavLink>
            </nav>

            <DemoRoleSwitcher compact />
          </div>
        </div>
      </header>

      {/* Scoped Record Banner Notice */}
      <div className="bg-amber-950/30 border-b border-amber-900/40 px-4 py-2 font-mono text-xs text-amber-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 truncate">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="truncate">
              <strong>Authorized Partner Scope:</strong> Displaying and updating only records assigned to{' '}
              <strong className="text-white underline">{partnerOrg}</strong>.
            </span>
          </div>
          <span className="text-[10px] text-amber-400/80 uppercase font-bold shrink-0 hidden md:inline">
            Role: Partner Coordinator
          </span>
        </div>
      </div>

      {/* Main Viewport Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        <Outlet />
      </main>

      {/* Partner Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/60 py-4 px-6 text-slate-500 font-mono text-xs text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>RESQNET Disaster Relief Partner Consortium • Humanitarian Data Protocol</span>
        <span>Connected to Central Relief Exchange</span>
      </footer>
    </div>
  );
};

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useRole } from '../context/RoleContext';
import { DemoUserRole } from '../types';
import { 
  ShieldAlert, 
  Radio, 
  Building2, 
  Users, 
  ChevronDown, 
  Info, 
  Check, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const DemoRoleSwitcher: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { role, setRole, partnerOrg, setPartnerOrg, partnerOrgs } = useRole();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

  const handleRoleSelect = (newRole: DemoUserRole, defaultPath: string) => {
    setRole(newRole);
    setDropdownOpen(false);
    navigate(defaultPath);
  };

  const rolesConfig: { id: DemoUserRole; label: string; badge: string; icon: React.ReactNode; path: string; desc: string }[] = [
    {
      id: 'dispatcher',
      label: 'Incident Commander',
      badge: 'DISPATCHER (OPS)',
      icon: <Radio className="w-3.5 h-3.5 text-cyan" />,
      path: '/ops/command-center',
      desc: 'Full operational telemetry, disaster triage map, fleet dispatch, and city-wide resource registry.'
    },
    {
      id: 'responder',
      label: 'Field SAR Unit',
      badge: 'TACTICAL RESPONDER',
      icon: <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />,
      path: '/responder/tasks',
      desc: 'Mobile-first workspace for on-scene rescue teams. Task acknowledgment, en route status, and verified rescue completion.'
    },
    {
      id: 'partner',
      label: 'Relief Partner NGO',
      badge: 'RELIEF PARTNER',
      icon: <Building2 className="w-3.5 h-3.5 text-amber-400" />,
      path: '/partner/inventory',
      desc: 'Scoped organization view. Manage only supplies, distributions, and facility capacity assigned to your NGO.'
    },
    {
      id: 'citizen',
      label: 'Affected Citizen',
      badge: 'PUBLIC CITIZEN',
      icon: <Users className="w-3.5 h-3.5 text-coral" />,
      path: '/request-assistance',
      desc: 'Light public emergency portal. Request urgent assistance, track rescue status, and view safety protocols.'
    }
  ];

  const currentConfig = rolesConfig.find(r => r.id === role) || rolesConfig[0];

  return (
    <>
      {/* Role Switcher Widget */}
      <div className="relative inline-block text-left font-mono">
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-midnight/90 border border-border shadow-lg">
          <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded bg-amber/10 border border-amber/30 text-[10px] text-amber uppercase font-bold tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-amber animate-pulse" />
            <span>DEMO ROLE:</span>
          </div>

          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-2.5 py-1 rounded bg-deep-slate hover:bg-slate-800 text-xs text-cloud-white font-medium border border-border/80 transition-colors"
            title="Switch demo user role"
          >
            {currentConfig.icon}
            <span className="font-semibold text-[11px]">{currentConfig.badge}</span>
            <ChevronDown className="w-3 h-3 text-text-muted" />
          </button>

          <button
            type="button"
            onClick={() => setShowInfoModal(true)}
            className="p-1 rounded text-text-muted hover:text-cloud-white hover:bg-slate-800 transition-colors"
            title="Prototype role security notice"
          >
            <Info className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Dropdown Menu */}
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-xl bg-deep-slate border border-border shadow-2xl z-50 overflow-hidden divide-y divide-border/60">
            {/* Header / Disclaimer Banner */}
            <div className="p-3 bg-midnight/80">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase text-amber tracking-wider">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Prototype Role Switcher
                </span>
                <span className="px-1.5 py-0.2 rounded bg-amber/20 border border-amber/40">Not Prod RBAC</span>
              </div>
              <p className="text-[11px] text-text-muted mt-1 leading-relaxed">
                Select an operational role to test persona-specific interfaces and record visibility.
              </p>
            </div>

            {/* Role Options */}
            <div className="p-2 space-y-1">
              {rolesConfig.map((r) => {
                const isActive = r.id === role;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => handleRoleSelect(r.id, r.path)}
                    className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-start gap-2.5 ${
                      isActive
                        ? 'bg-cyan/15 border-cyan/50 text-cloud-white'
                        : 'bg-midnight/40 border-transparent hover:bg-midnight hover:border-border text-text-secondary hover:text-cloud-white'
                    }`}
                  >
                    <div className="mt-0.5 p-1 rounded bg-deep-slate border border-border/60">
                      {r.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{r.label}</span>
                        {isActive && <Check className="w-3.5 h-3.5 text-cyan shrink-0" />}
                      </div>
                      <p className="text-[10px] text-text-muted leading-tight mt-0.5 line-clamp-2">
                        {r.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* If role is partner, allow switching organization */}
            {role === 'partner' && (
              <div className="p-3 bg-midnight/90 space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                  Active Partner Organization:
                </div>
                <select
                  value={partnerOrg}
                  onChange={(e) => setPartnerOrg(e.target.value)}
                  className="w-full text-xs p-2 rounded bg-deep-slate border border-border text-cloud-white outline-none cursor-pointer"
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
                <p className="text-[10px] text-text-muted">
                  Record views in <code>/partner/*</code> will filter to match this organization only.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Prototype Role Disclaimer Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-deep-slate border border-amber/40 shadow-modal p-6 space-y-4 font-mono">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber/20 border border-amber/40 text-amber">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">Prototype Role Simulation</h3>
                <span className="text-[10px] text-amber uppercase font-semibold">Development-Only Demo Feature</span>
              </div>
            </div>

            <p className="text-xs text-text-secondary leading-relaxed">
              This client-side role switcher simulates role-based routing and interface scoping during early development and verification.
            </p>

            <div className="p-3 rounded-xl bg-midnight border border-border text-xs text-text-muted space-y-2">
              <strong className="text-cloud-white block text-[11px] uppercase tracking-wider">
                Production RBAC Architectural Notice:
              </strong>
              <p>
                Frontend-only role switching and view filtering does <strong>NOT</strong> constitute production security. In a live deployment, all data endpoints must be protected by cryptographic JWT tokens and server-side row-level access control (RLAC).
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowInfoModal(false)}
                className="px-4 py-2 rounded-lg bg-cyan text-midnight font-bold text-xs hover:bg-cyan/90 transition-colors"
              >
                Understood & Acknowledged
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  ShieldAlert, 
  Search, 
  LifeBuoy, 
  Radio, 
  Menu, 
  X, 
  CloudRain, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  PhoneCall
} from 'lucide-react';

export const PublicLayout: React.FC = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { to: '/', label: 'Overview' },
    { to: '/request-assistance', label: 'Request Assistance' },
    { to: '/track-request', label: 'Track Request' },
    { to: '/safety', label: 'Flood Safety Guide' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans selection:bg-teal-600 selection:text-white">
      {/* ── 1. Top Simulation Disclaimer Banner ────────────────────────────────── */}
      <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2 text-xs font-medium flex items-center justify-between">
        <div className="max-w-7xl mx-auto flex items-center gap-2 flex-1">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong className="font-bold uppercase tracking-wider text-amber-950">
              SIMULATED DISASTER DRILL ONLY:
            </strong>{' '}
            RESQNET is an experimental coordination exercise platform. <strong>Do not use for real life-threatening emergencies.</strong> In a genuine emergency, call local emergency services immediately (911 / 112).
          </span>
        </div>
      </div>

      {/* ── 2. Public Top Navigation Bar ───────────────────────────────────────── */}
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold shadow-sm group-hover:bg-teal-700 transition-colors">
                <LifeBuoy className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-extrabold tracking-tight text-slate-900 font-display">
                  RESQNET
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-teal-700 -mt-0.5">
                  Citizen Relief Portal
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1.5" aria-label="Citizen Navigation">
              {navLinks.map((link) => {
                const active = isActive(link.to);
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      active
                        ? 'bg-teal-50 text-teal-800 font-bold border border-teal-200'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right Action & Control Room Link */}
            <div className="hidden sm:flex items-center gap-3">
              <Link
                to="/request-assistance"
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                Emergency SOS
              </Link>

              <Link
                to="/ops/command-center"
                className="px-3.5 py-1.5 rounded-lg border border-slate-300 hover:border-slate-400 bg-white text-slate-700 hover:text-slate-900 text-xs font-mono font-semibold transition-colors flex items-center gap-1.5"
                title="Open Storm Command Center"
              >
                <Radio className="w-3.5 h-3.5 text-teal-600" />
                Operations Shell ↗
              </Link>
            </div>

            {/* Mobile Hamburger Button */}
            <div className="md:hidden flex items-center gap-2">
              <Link
                to="/request-assistance"
                className="px-2.5 py-1 bg-red-600 text-white text-xs font-bold rounded"
              >
                SOS
              </Link>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1.5 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                aria-label="Toggle navigation"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1 shadow-md">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-sm font-medium ${
                  isActive(link.to)
                    ? 'bg-teal-50 text-teal-800 font-bold'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <Link
                to="/ops/command-center"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2 rounded-md bg-slate-100 text-slate-800 text-xs font-mono font-semibold"
              >
                <span>Control Room Operations</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ── 3. Main Public Content Area ───────────────────────────────────────── */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Outlet />
      </main>

      {/* ── 4. Public Footer ─────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-200 bg-white py-8 text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-700">
            <CloudRain className="w-4 h-4 text-teal-600" />
            <span>
              <strong>RESQNET</strong> &mdash; Flood Response Simulation & Assistance Portal
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <span className="flex items-center gap-1 text-emerald-700 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" /> Human-Verified Dispatches
            </span>
            <span>&bull;</span>
            <Link to="/safety" className="hover:text-teal-700 hover:underline">
              Flood Safety Tips
            </Link>
            <span>&bull;</span>
            <Link to="/track-request" className="hover:text-teal-700 hover:underline">
              Check Status
            </Link>
          </div>

          <div className="text-[11px] text-slate-400">
            Fictional Demonstration &copy; {new Date().getFullYear()} RESQNET Humanitarian Architecture
          </div>
        </div>
      </footer>
    </div>
  );
};

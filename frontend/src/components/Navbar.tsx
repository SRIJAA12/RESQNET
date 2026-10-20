import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  ShieldAlert, 
  MapPin, 
  Radio, 
  Layers, 
  Home, 
  Truck, 
  Building2, 
  Search, 
  AlertOctagon, 
  Menu, 
  X,
  FileCheck2,
  UserCheck
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'dispatcher' | 'commander' | 'citizen'>('dispatcher');

  const navLinks = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/dashboard', label: 'Control Room', icon: Radio },
    { to: '/map', label: 'Live Map', icon: MapPin },
    { to: '/queue', label: 'Incident Queue', icon: Layers },
    { to: '/dispatch', label: 'Dispatch Review', icon: FileCheck2 },
    { to: '/resources', label: 'Fleet & Teams', icon: Truck },
    { to: '/shelters', label: 'Shelters', icon: Building2 },
    { to: '/unserved', label: 'Unserved Needs', icon: AlertOctagon },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return (
      location.pathname === path ||
      location.pathname.startsWith(`${path}/`) ||
      (path === '/dashboard' && location.pathname === '/ops/dashboard') ||
      (path === '/map' && location.pathname === '/ops/map') ||
      (path === '/queue' && location.pathname === '/ops/incidents') ||
      (path === '/dispatch' && location.pathname === '/ops/dispatch') ||
      (path === '/resources' && location.pathname === '/ops/resources') ||
      (path === '/shelters' && location.pathname === '/ops/shelters') ||
      (path === '/unserved' && location.pathname === '/ops/unserved')
    );
  };

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-relief-600 to-emergency-600 flex items-center justify-center shadow-lg shadow-relief-900/30 group-hover:scale-105 transition-transform">
                <Radio className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-relief-400 bg-clip-text text-transparent">
                  RESQNET
                </span>
                <span className="block text-[10px] uppercase font-bold tracking-widest text-relief-400 -mt-1">
                  Disaster Ecosystem
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1" aria-label="Main Navigation">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    active
                      ? 'bg-relief-600/20 text-relief-300 border border-relief-500/30 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action & Role Switcher */}
          <div className="hidden sm:flex items-center gap-2.5">
            {/* Role indicator dropdown */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
              <UserCheck className="w-3.5 h-3.5 text-relief-400" />
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as any)}
                className="bg-transparent text-slate-200 font-semibold outline-none cursor-pointer text-xs"
                title="Simulated User Role"
              >
                <option value="dispatcher" className="bg-slate-900 text-slate-200">Role: Dispatcher</option>
                <option value="commander" className="bg-slate-900 text-slate-200">Role: Incident Commander</option>
                <option value="citizen" className="bg-slate-900 text-slate-200">Role: Citizen / Reporter</option>
              </select>
            </div>

            <Link
              to="/status"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/60 transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
              Track SOS
            </Link>

            <Link
              to="/sos"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-emergency-600 to-emergency-500 text-white shadow-md shadow-emergency-900/40 hover:from-emergency-500 hover:to-emergency-400 hover:scale-105 transition-all"
            >
              <ShieldAlert className="w-3.5 h-3.5 animate-pulse" />
              Citizen SOS
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="xl:hidden flex items-center gap-2">
            <Link
              to="/sos"
              className="px-2.5 py-1 text-xs font-bold bg-emergency-600 text-white rounded-md"
            >
              SOS
            </Link>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
              aria-label="Toggle navigation"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="xl:hidden border-t border-slate-800 bg-slate-900/95 px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium ${
                  active ? 'bg-relief-600/20 text-relief-300' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-slate-800/80 flex flex-col gap-2">
            <Link
              to="/status"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800"
            >
              <Search className="w-4 h-4" />
              Track SOS Reference
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

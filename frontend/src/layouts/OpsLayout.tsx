import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useLocation, Link, useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { DemoRoleSwitcher } from '../components/DemoRoleSwitcher';
import { 
  Menu, 
  Search, 
  Bell, 
  X,
  ChevronDown,
  ExternalLink,
  ShieldAlert,
  Sparkles
} from 'lucide-react';

export const OpsLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem('resqnet_sidebar_collapsed') === 'true';
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  // Global search modal state
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Notifications dropdown state
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 'n1',
      title: 'Water Level Advisory',
      time: '4m ago',
      level: 'critical',
      message: 'River tributary surge in Sector 4B reached 43.2 ft. Priority boat evacuation en route.',
    },
    {
      id: 'n2',
      title: 'Unit Mobilized',
      time: '12m ago',
      level: 'info',
      message: 'Rescue Boat Alpha-01 en route to River Creek Colony for rooftop rescue.',
    },
    {
      id: 'n3',
      title: 'Shelter Capacity Alert',
      time: '28m ago',
      level: 'warning',
      message: 'St. Jude Center at 92% occupancy (184/200 beds). Inbound evacuees diverted to North High School.',
    },
  ]);

  // User menu state
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState('Riverbend Flash Flood (Simulated)');

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close popups on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut for Cmd/Ctrl + K search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setNotifOpen(false);
        setUserMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleCollapse = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('resqnet_sidebar_collapsed', String(next));
      return next;
    });
  };

  const getBreadcrumbs = () => {
    const path = location.pathname;
    const crumbs: { label: string; to?: string }[] = [];

    if (path.includes('command-center') || path === '/dashboard' || path === '/ops/dashboard') {
      crumbs.push({ label: 'Command Center' });
    } else if (path.includes('map')) {
      crumbs.push({ label: 'Live Map' });
    } else if (path.includes('incidents')) {
      crumbs.push({ label: 'Incidents' });
    } else if (path.includes('dispatch')) {
      crumbs.push({ label: 'Incidents', to: '/ops/incidents' });
      crumbs.push({ label: 'Dispatch Review' });
    } else if (path.includes('resources')) {
      crumbs.push({ label: 'Resources' });
    } else if (path.includes('facilities') || path.includes('shelters')) {
      crumbs.push({ label: 'Shelters & Hospitals' });
    } else if (path.includes('unserved')) {
      crumbs.push({ label: 'Unserved Needs' });
    } else if (path.includes('forecasts')) {
      crumbs.push({ label: 'Shortage Forecasts' });
    } else if (path.includes('reports')) {
      crumbs.push({ label: 'Reports & Analytics' });
    } else if (path.includes('audit')) {
      crumbs.push({ label: 'Audit Trail' });
    } else if (path.includes('events')) {
      crumbs.push({ label: 'Disaster Events' });
    } else if (path.includes('responders')) {
      crumbs.push({ label: 'Responders' });
    } else if (path.includes('users')) {
      crumbs.push({ label: 'User Directory' });
    } else if (path.includes('settings')) {
      crumbs.push({ label: 'Settings' });
    } else {
      crumbs.push({ label: 'Operations' });
    }

    return crumbs;
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchOpen(false);
    navigate(`/ops/map?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <div className="min-h-screen bg-midnight text-cloud-white font-sans antialiased flex flex-col selection:bg-cyan selection:text-midnight">
      {/* Refined, Compact Simulation Notice */}
      <DisclaimerBanner />

      <div className="flex-1 flex overflow-hidden">
        {/* Refined Sidebar */}
        <Sidebar
          collapsed={collapsed}
          onToggleCollapse={toggleCollapse}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />

        {/* Main Workspace Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Refined Top Header */}
          <header className="h-[60px] border-b border-border/80 bg-surface/90 backdrop-blur-md sticky top-0 z-20 px-4 sm:px-6 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileOpen(true)}
                className="md:hidden p-1.5 rounded-control text-text-muted hover:text-cloud-white hover:bg-deep-slate transition-colors"
                aria-label="Open navigation menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Desktop Sidebar Toggle Button */}
              <button
                onClick={toggleCollapse}
                className="hidden md:flex p-1.5 rounded-control text-text-muted hover:text-cloud-white hover:bg-deep-slate transition-colors"
                title={collapsed ? 'Expand sidebar' : 'Compact sidebar'}
                aria-label={collapsed ? 'Expand sidebar' : 'Compact sidebar'}
              >
                <Menu className="w-4 h-4" />
              </button>

              <Breadcrumb items={getBreadcrumbs()} />

              {/* Scenario Selector Dropdown */}
              <div className="hidden lg:flex items-center gap-1.5 bg-midnight/70 px-2.5 py-1 rounded-control border border-border/70 text-xs">
                <span className="text-[11px] text-text-muted">Scenario:</span>
                <select
                  value={selectedScenario}
                  onChange={(e) => setSelectedScenario(e.target.value)}
                  className="bg-transparent text-cloud-white text-[12px] font-medium outline-none cursor-pointer"
                >
                  <option value="Riverbend Flash Flood (Simulated)" className="bg-deep-slate">
                    Riverbend Flash Flood (Simulated)
                  </option>
                  <option value="Coastal Cyclone Delta (Simulated)" className="bg-deep-slate">
                    Coastal Cyclone Delta (Simulated)
                  </option>
                  <option value="High Range Landslide (Simulated)" className="bg-deep-slate">
                    High Range Landslide (Simulated)
                  </option>
                </select>
              </div>

              {/* Compact Simulated Badge */}
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber/10 border border-amber/30 text-amber text-[10px] font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-amber animate-pulse" />
                Demo
              </span>
            </div>

            {/* Right: Search, Notifications & User Menu */}
            <div className="flex items-center gap-2.5 shrink-0">
              {/* Quick Search Button */}
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-control bg-midnight/70 hover:bg-midnight border border-border/70 text-text-muted hover:text-cloud-white text-xs transition-colors"
                title="Search records or coordinates (⌘K)"
              >
                <Search className="w-3.5 h-3.5" />
                <span className="hidden md:inline text-[12px]">Search...</span>
                <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] rounded bg-deep-slate border border-border text-text-muted">
                  ⌘K
                </kbd>
              </button>

              {/* Notifications Dropdown */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="relative p-2 rounded-control text-text-secondary hover:text-cloud-white hover:bg-midnight/60 transition-colors"
                  aria-label="View notifications"
                >
                  <Bell className="w-4 h-4" />
                  {notifications.length > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-coral animate-pulse" />
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-88 rounded-card bg-deep-slate border border-border shadow-modal z-50 overflow-hidden animate-fadeIn">
                    <div className="p-3 border-b border-border flex items-center justify-between bg-surface/70">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-heading font-semibold text-cloud-white">
                          Notifications
                        </span>
                        <span className="px-1.5 py-0.5 rounded-full bg-coral/20 text-coral text-[10px] font-medium">
                          {notifications.length}
                        </span>
                      </div>
                      <button
                        onClick={() => setNotifications([])}
                        className="text-[11px] text-text-muted hover:text-cloud-white transition-colors"
                      >
                        Clear all
                      </button>
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-border/60">
                      {notifications.length > 0 ? (
                        notifications.map((n) => (
                          <div key={n.id} className="p-3 hover:bg-midnight/40 transition-colors space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span
                                className={`font-medium ${
                                  n.level === 'critical'
                                    ? 'text-coral'
                                    : n.level === 'warning'
                                    ? 'text-amber'
                                    : 'text-cyan'
                                }`}
                              >
                                {n.title}
                              </span>
                              <span className="text-[10px] text-text-muted">{n.time}</span>
                            </div>
                            <p className="text-xs text-text-secondary leading-relaxed">
                              {n.message}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="p-6 text-center text-xs text-text-muted">
                          No new notifications
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Prototype Role Switcher */}
              <div className="hidden sm:block">
                <DemoRoleSwitcher compact />
              </div>

              {/* User Menu */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-control hover:bg-midnight/60 transition-colors"
                  aria-label="User account menu"
                >
                  <div className="w-7 h-7 rounded-full bg-cyan/15 text-cyan border border-cyan/30 flex items-center justify-center font-heading font-semibold text-xs">
                    RV
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-text-muted hidden sm:block" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-card bg-deep-slate border border-border shadow-modal z-50 p-2 space-y-1 text-xs animate-fadeIn">
                    <div className="px-3 py-2 border-b border-border/80">
                      <div className="font-medium text-cloud-white">Capt. R. Vance</div>
                      <div className="text-[11px] text-cyan">Incident Commander</div>
                    </div>
                    <Link
                      to="/ops/command-center"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-3 py-1.5 rounded-control hover:bg-midnight/60 text-text-secondary hover:text-cloud-white transition-colors"
                    >
                      Command Center
                    </Link>
                    <Link
                      to="/ops/map"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-3 py-1.5 rounded-control hover:bg-midnight/60 text-text-secondary hover:text-cloud-white transition-colors"
                    >
                      Live Map
                    </Link>
                    <Link
                      to="/sos"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-3 py-1.5 rounded-control hover:bg-midnight/60 text-coral font-medium transition-colors"
                    >
                      Public Assistance Portal ↗
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Main Content Body */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
            <Outlet />
          </main>

          {/* Clean, Refined Footer */}
          <footer className="border-t border-border/60 py-3 px-6 text-text-muted flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-success-green" />
              <span>Operational Simulation Active</span>
              <span className="text-border">·</span>
              <span>Riverbend Sector Grid</span>
            </div>
            <div>
              <span>Human-in-the-Loop Dispatch Verified · Synthetic Demonstration Data</span>
            </div>
          </footer>
        </div>
      </div>

      {/* Global Quick Search Modal (Cmd/Ctrl + K) */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-midnight/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg rounded-panel bg-deep-slate border border-border shadow-modal overflow-hidden">
            <form onSubmit={handleSearchSubmit} className="p-3 border-b border-border flex items-center gap-2">
              <Search className="w-4 h-4 text-cyan shrink-0" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search incidents, facilities, or callsigns..."
                className="w-full bg-transparent text-sm text-cloud-white placeholder-text-muted outline-none font-sans"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="text-text-muted hover:text-cloud-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </form>

            <div className="p-3 text-xs space-y-2">
              <span className="text-[11px] font-medium text-text-muted block">
                Quick Navigation:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSearchOpen(false);
                    navigate('/ops/command-center');
                  }}
                  className="p-2.5 rounded-control bg-midnight/60 hover:bg-cyan/10 text-left text-text-secondary hover:text-cyan border border-border/70 transition-colors"
                >
                  Command Center
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSearchOpen(false);
                    navigate('/ops/map');
                  }}
                  className="p-2.5 rounded-control bg-midnight/60 hover:bg-cyan/10 text-left text-text-secondary hover:text-cyan border border-border/70 transition-colors"
                >
                  Live Map
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSearchOpen(false);
                    navigate('/ops/incidents');
                  }}
                  className="p-2.5 rounded-control bg-midnight/60 hover:bg-cyan/10 text-left text-text-secondary hover:text-cyan border border-border/70 transition-colors"
                >
                  Incidents Queue
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSearchOpen(false);
                    navigate('/ops/facilities');
                  }}
                  className="p-2.5 rounded-control bg-midnight/60 hover:bg-cyan/10 text-left text-text-secondary hover:text-cyan border border-border/70 transition-colors"
                >
                  Shelters & Hospitals
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

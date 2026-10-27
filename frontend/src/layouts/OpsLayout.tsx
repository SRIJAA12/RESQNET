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
  Sparkles,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const OpsLayout: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
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
    <div className="min-h-screen bg-slate-50 dark:bg-midnight text-slate-900 dark:text-cloud-white font-sans antialiased flex flex-col selection:bg-cyan selection:text-midnight">
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
          <header className="h-[60px] border-b border-slate-200 dark:border-border/80 bg-white/95 dark:bg-surface/90 backdrop-blur-md sticky top-0 z-20 px-3 sm:px-5 flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileOpen(true)}
                className="md:hidden p-1.5 rounded-control text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-text-muted dark:hover:text-cloud-white dark:hover:bg-deep-slate transition-colors"
                aria-label="Open navigation menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Desktop Sidebar Toggle Button */}
              <button
                onClick={toggleCollapse}
                className="hidden md:flex p-1.5 rounded-control text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-text-muted dark:hover:text-cloud-white dark:hover:bg-deep-slate transition-colors"
                title={collapsed ? 'Expand sidebar' : 'Compact sidebar'}
                aria-label={collapsed ? 'Expand sidebar' : 'Compact sidebar'}
              >
                <Menu className="w-4 h-4" />
              </button>

              <div className="min-w-0 truncate">
                <Breadcrumb items={getBreadcrumbs()} />
              </div>

              {/* Scenario Selector Dropdown (visible on xl+ to prevent overlap on laptops) */}
              <div className="hidden xl:flex items-center gap-1.5 bg-slate-100 dark:bg-midnight/70 px-2.5 py-1 rounded-control border border-slate-200 dark:border-border/70 text-xs shrink-0 max-w-[240px]">
                <span className="text-[11px] text-slate-500 dark:text-text-muted shrink-0">Scenario:</span>
                <select
                  value={selectedScenario}
                  onChange={(e) => setSelectedScenario(e.target.value)}
                  className="bg-transparent text-slate-800 dark:text-cloud-white text-[12px] font-medium outline-none cursor-pointer truncate max-w-[160px]"
                >
                  <option value="Riverbend Flash Flood (Simulated)" className="bg-white dark:bg-deep-slate text-slate-900 dark:text-cloud-white">
                    Riverbend Flash Flood (Simulated)
                  </option>
                  <option value="Coastal Cyclone Delta (Simulated)" className="bg-white dark:bg-deep-slate text-slate-900 dark:text-cloud-white">
                    Coastal Cyclone Delta (Simulated)
                  </option>
                  <option value="High Range Landslide (Simulated)" className="bg-white dark:bg-deep-slate text-slate-900 dark:text-cloud-white">
                    High Range Landslide (Simulated)
                  </option>
                </select>
              </div>
            </div>

            {/* Right: Search, Notifications, Theme Toggle & User Menu */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Quick Search Button */}
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-control bg-slate-100 hover:bg-slate-200 dark:bg-midnight/70 dark:hover:bg-midnight border border-slate-200 dark:border-border/70 text-slate-600 hover:text-slate-900 dark:text-text-muted dark:hover:text-cloud-white text-xs transition-colors"
                title="Search records or coordinates (⌘K)"
              >
                <Search className="w-3.5 h-3.5" />
                <span className="hidden md:inline text-[12px]">Search...</span>
                <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] rounded bg-white dark:bg-deep-slate border border-slate-200 dark:border-border text-slate-500 dark:text-text-muted">
                  ⌘K
                </kbd>
              </button>

              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-control bg-slate-100 hover:bg-slate-200 dark:bg-midnight/70 dark:hover:bg-midnight border border-slate-200 dark:border-border/70 text-slate-700 hover:text-slate-900 dark:text-text-secondary dark:hover:text-cloud-white text-xs transition-all shadow-sm"
                title={theme === 'dark' ? 'Switch to Light (White) Theme' : 'Switch to Dark Mode'}
                aria-label="Toggle visual theme"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber" />
                    <span className="hidden sm:inline text-[11px] font-medium">Light</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-slate-700" />
                    <span className="hidden sm:inline text-[11px] font-medium">Dark</span>
                  </>
                )}
              </button>

              {/* Notifications Dropdown */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="relative p-2 rounded-control text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-text-secondary dark:hover:text-cloud-white dark:hover:bg-midnight/60 transition-colors"
                  aria-label="View notifications"
                >
                  <Bell className="w-4 h-4" />
                  {notifications.length > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-coral animate-pulse" />
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-88 rounded-card bg-white dark:bg-deep-slate border border-slate-200 dark:border-border shadow-2xl z-50 overflow-hidden animate-fadeIn text-slate-800 dark:text-cloud-white">
                    <div className="p-3 border-b border-slate-200 dark:border-border flex items-center justify-between bg-slate-50 dark:bg-surface/70">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-heading font-semibold text-slate-900 dark:text-cloud-white">
                          Notifications
                        </span>
                        <span className="px-1.5 py-0.5 rounded-full bg-coral/20 text-coral text-[10px] font-medium">
                          {notifications.length}
                        </span>
                      </div>
                      <button
                        onClick={() => setNotifications([])}
                        className="text-[11px] text-slate-500 hover:text-slate-900 dark:text-text-muted dark:hover:text-cloud-white transition-colors"
                      >
                        Clear all
                      </button>
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-border/60">
                      {notifications.length > 0 ? (
                        notifications.map((n) => (
                          <div key={n.id} className="p-3 hover:bg-slate-50 dark:hover:bg-midnight/40 transition-colors space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span
                                className={`font-medium ${
                                  n.level === 'critical'
                                    ? 'text-coral'
                                    : n.level === 'warning'
                                    ? 'text-amber'
                                    : 'text-teal-600 dark:text-cyan'
                                }`}
                              >
                                {n.title}
                              </span>
                              <span className="text-[10px] text-slate-400 dark:text-text-muted">{n.time}</span>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-text-secondary leading-relaxed">
                              {n.message}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="p-6 text-center text-xs text-slate-400 dark:text-text-muted">
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
                  className="flex items-center gap-1.5 p-1 rounded-control hover:bg-slate-100 dark:hover:bg-midnight/60 transition-colors"
                  aria-label="User account menu"
                >
                  <div className="w-7 h-7 rounded-full bg-teal-50 dark:bg-cyan/15 text-teal-700 dark:text-cyan border border-teal-200 dark:border-cyan/30 flex items-center justify-center font-heading font-semibold text-xs shadow-sm">
                    RV
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-text-muted hidden sm:block" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-card bg-white dark:bg-deep-slate border border-slate-200 dark:border-border shadow-2xl z-50 p-2 space-y-1 text-xs animate-fadeIn text-slate-800 dark:text-cloud-white">
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-border/80">
                      <div className="font-medium text-slate-900 dark:text-cloud-white">Capt. R. Vance</div>
                      <div className="text-[11px] text-teal-600 dark:text-cyan font-semibold">Incident Commander</div>
                    </div>
                    <Link
                      to="/ops/command-center"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-3 py-1.5 rounded-control hover:bg-slate-100 dark:hover:bg-midnight/60 text-slate-700 hover:text-slate-900 dark:text-text-secondary dark:hover:text-cloud-white transition-colors"
                    >
                      Command Center
                    </Link>
                    <Link
                      to="/ops/map"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-3 py-1.5 rounded-control hover:bg-slate-100 dark:hover:bg-midnight/60 text-slate-700 hover:text-slate-900 dark:text-text-secondary dark:hover:text-cloud-white transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-900/60 dark:bg-midnight/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg rounded-panel bg-white dark:bg-deep-slate border border-slate-200 dark:border-border shadow-2xl overflow-hidden text-slate-800 dark:text-cloud-white">
            <form onSubmit={handleSearchSubmit} className="p-3.5 border-b border-slate-200 dark:border-border flex items-center gap-2.5">
              <Search className="w-4 h-4 text-teal-600 dark:text-cyan shrink-0" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search incidents, facilities, or callsigns..."
                className="w-full bg-transparent text-sm text-slate-900 dark:text-cloud-white placeholder-slate-400 dark:placeholder-text-muted outline-none font-sans"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:text-text-muted dark:hover:text-cloud-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </form>

            <div className="p-3.5 text-xs space-y-2">
              <span className="text-[11px] font-medium text-slate-500 dark:text-text-muted block">
                Quick Navigation:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSearchOpen(false);
                    navigate('/ops/command-center');
                  }}
                  className="p-2.5 rounded-control bg-slate-50 hover:bg-teal-50 dark:bg-midnight/60 dark:hover:bg-cyan/10 text-left text-slate-700 hover:text-teal-800 dark:text-text-secondary dark:hover:text-cyan border border-slate-200 dark:border-border/70 transition-colors font-medium"
                >
                  Command Center
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSearchOpen(false);
                    navigate('/ops/map');
                  }}
                  className="p-2.5 rounded-control bg-slate-50 hover:bg-teal-50 dark:bg-midnight/60 dark:hover:bg-cyan/10 text-left text-slate-700 hover:text-teal-800 dark:text-text-secondary dark:hover:text-cyan border border-slate-200 dark:border-border/70 transition-colors font-medium"
                >
                  Live Map
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSearchOpen(false);
                    navigate('/ops/incidents');
                  }}
                  className="p-2.5 rounded-control bg-slate-50 hover:bg-teal-50 dark:bg-midnight/60 dark:hover:bg-cyan/10 text-left text-slate-700 hover:text-teal-800 dark:text-text-secondary dark:hover:text-cyan border border-slate-200 dark:border-border/70 transition-colors font-medium"
                >
                  Incidents Queue
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSearchOpen(false);
                    navigate('/ops/facilities');
                  }}
                  className="p-2.5 rounded-control bg-slate-50 hover:bg-teal-50 dark:bg-midnight/60 dark:hover:bg-cyan/10 text-left text-slate-700 hover:text-teal-800 dark:text-text-secondary dark:hover:text-cyan border border-slate-200 dark:border-border/70 transition-colors font-medium"
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

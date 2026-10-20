import React, { useState } from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import {
  Compass,
  Map,
  AlertCircle,
  Route,
  Truck,
  Building2,
  TrendingDown,
  Boxes,
  Users,
  LineChart,
  FileBarChart,
  History,
  Calendar,
  Settings,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  X,
} from 'lucide-react';

export interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

interface NavItem {
  to: string;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  aliases?: string[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed = false,
  onToggleCollapse,
  className = '',
  mobileOpen = false,
  onMobileClose,
}) => {
  const location = useLocation();
  const [moreExpanded, setMoreExpanded] = useState(() => {
    // Auto-expand if the current route is in the secondary section
    const secRoutes = [
      '/ops/inventory',
      '/ops/distribution',
      '/ops/responders',
      '/ops/forecasts',
      '/ops/reports',
      '/ops/audit',
      '/ops/events',
      '/ops/settings',
    ];
    return secRoutes.some((r) => location.pathname.startsWith(r));
  });

  // Primary Navigation
  const primaryNav: NavItem[] = [
    {
      to: '/ops/command-center',
      label: 'Command Center',
      shortLabel: 'Overview',
      icon: Compass,
      aliases: ['/ops/dashboard', '/dashboard'],
    },
    {
      to: '/ops/map',
      label: 'Live Map',
      shortLabel: 'Live Map',
      icon: Map,
      aliases: ['/map'],
    },
    {
      to: '/ops/incidents',
      label: 'Incidents',
      shortLabel: 'Incidents',
      icon: AlertCircle,
      aliases: ['/queue'],
    },
    {
      to: '/ops/dispatch',
      label: 'Dispatch',
      shortLabel: 'Dispatch',
      icon: Route,
      aliases: ['/dispatch'],
    },
    {
      to: '/ops/resources',
      label: 'Resources',
      shortLabel: 'Resources',
      icon: Truck,
      aliases: ['/resources'],
    },
    {
      to: '/ops/facilities',
      label: 'Shelters & Hospitals',
      shortLabel: 'Facilities',
      icon: Building2,
      aliases: ['/ops/shelters', '/facilities', '/shelters'],
    },
    {
      to: '/ops/unserved-needs',
      label: 'Unserved Needs',
      shortLabel: 'Unserved',
      icon: TrendingDown,
      aliases: ['/ops/unserved', '/unserved-needs', '/unserved'],
    },
  ];

  // Secondary Navigation (Under "Manage")
  const secondaryNav: NavItem[] = [
    {
      to: '/ops/inventory',
      label: 'Inventory & Supplies',
      shortLabel: 'Inventory',
      icon: Boxes,
      aliases: ['/ops/distribution', '/inventory', '/distribution'],
    },
    {
      to: '/ops/responders',
      label: 'Responders',
      shortLabel: 'Responders',
      icon: Users,
      aliases: ['/responders'],
    },
    {
      to: '/ops/forecasts',
      label: 'Forecasts',
      shortLabel: 'Forecasts',
      icon: LineChart,
      aliases: ['/forecasts'],
    },
    {
      to: '/ops/reports',
      label: 'Reports & Analytics',
      shortLabel: 'Reports',
      icon: FileBarChart,
      aliases: ['/reports'],
    },
    {
      to: '/ops/audit',
      label: 'Audit Trail',
      shortLabel: 'Audit',
      icon: History,
      aliases: ['/audit'],
    },
    {
      to: '/ops/events',
      label: 'Disaster Events',
      shortLabel: 'Events',
      icon: Calendar,
      aliases: ['/events'],
    },
    {
      to: '/ops/settings',
      label: 'Settings',
      shortLabel: 'Settings',
      icon: Settings,
      aliases: ['/settings'],
    },
  ];

  const isItemActive = (item: NavItem) => {
    if (location.pathname === item.to) return true;
    if (
      item.aliases?.some(
        (a) => location.pathname === a || location.pathname.startsWith(a + '/')
      )
    ) {
      return true;
    }
    return false;
  };

  const renderNavItem = (item: NavItem) => {
    const active = isItemActive(item);
    const Icon = item.icon;

    if (collapsed) {
      return (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={onMobileClose}
          title={item.label}
          className={`group relative flex flex-col items-center justify-center py-2 px-1 rounded-control text-center transition-all ${
            active
              ? 'bg-cyan/15 text-cyan font-semibold border-l-2 border-cyan shadow-sm'
              : 'text-text-secondary hover:text-cloud-white hover:bg-deep-slate/70'
          }`}
        >
          <Icon
            className={`w-4 h-4 shrink-0 transition-colors ${
              active ? 'text-cyan' : 'text-text-muted group-hover:text-cloud-white'
            }`}
          />
          {/* Always display the icon name right under the icon in collapsed mode */}
          <span
            className={`text-[10px] font-sans font-medium leading-tight mt-1 truncate max-w-full px-0.5 transition-colors ${
              active ? 'text-cyan font-bold' : 'text-text-muted group-hover:text-cloud-white'
            }`}
          >
            {item.shortLabel}
          </span>

          {/* Floating Tooltip with full label on hover */}
          <div className="absolute left-full ml-2 px-2.5 py-1 bg-deep-slate border border-border text-cloud-white text-xs font-medium rounded-control shadow-modal whitespace-nowrap z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
            {item.label}
          </div>
        </NavLink>
      );
    }

    return (
      <NavLink
        key={item.to}
        to={item.to}
        onClick={onMobileClose}
        className={`group flex items-center gap-3 px-3 py-2.5 rounded-control text-[13px] font-sans transition-all ${
          active
            ? 'bg-cyan/15 text-cyan font-semibold border-l-2 border-cyan shadow-sm'
            : 'text-text-secondary hover:text-cloud-white hover:bg-deep-slate/60'
        }`}
      >
        <Icon
          className={`w-4 h-4 shrink-0 transition-colors ${
            active ? 'text-cyan' : 'text-text-muted group-hover:text-cloud-white'
          }`}
        />
        {/* Full visible icon name */}
        <span className="truncate flex-1 font-medium">{item.label}</span>
        {item.badge && (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-coral/20 text-coral">
            {item.badge}
          </span>
        )}
      </NavLink>
    );
  };

  const navContent = (
    <div className="flex flex-col h-full bg-surface text-cloud-white select-none">
      {/* Brand Header */}
      <div className="h-[60px] px-3.5 flex items-center justify-between border-b border-border/80 shrink-0">
        <Link
          to="/ops/command-center"
          onClick={onMobileClose}
          className="flex items-center gap-2.5 min-w-0 group w-full"
        >
          <div className="w-8 h-8 rounded-control bg-cyan/15 text-cyan flex items-center justify-center font-heading font-black text-sm transition-transform group-hover:scale-105 shrink-0">
            R
          </div>
          {!collapsed ? (
            <div className="truncate">
              <div className="font-heading font-bold text-sm tracking-tight text-cloud-white group-hover:text-cyan transition-colors">
                RESQNET
              </div>
              <div className="text-[11px] text-text-muted font-sans font-normal leading-tight">
                Relief coordination
              </div>
            </div>
          ) : (
            <span className="text-[11px] font-heading font-bold text-cloud-white group-hover:text-cyan transition-colors">
              RESQ
            </span>
          )}
        </Link>

        {mobileOpen && (
          <button
            onClick={onMobileClose}
            className="md:hidden p-1.5 rounded-control text-text-muted hover:text-cloud-white hover:bg-deep-slate transition-colors"
            aria-label="Close navigation drawer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation Links Area */}
      <div className="flex-1 overflow-y-auto px-2 py-3.5 space-y-4">
        {/* Primary Navigation */}
        <div className="space-y-1">
          {!collapsed ? (
            <div className="px-2 pb-1 text-[11px] font-sans font-medium text-text-muted uppercase tracking-wider">
              Operations
            </div>
          ) : (
            <div className="text-[9px] font-sans font-semibold text-text-muted text-center uppercase tracking-wider pb-1">
              Ops
            </div>
          )}
          {primaryNav.map(renderNavItem)}
        </div>

        {/* Secondary Navigation ("Manage & Admin") */}
        <div className="space-y-1 pt-2 border-t border-border/50">
          {!collapsed ? (
            <button
              onClick={() => setMoreExpanded(!moreExpanded)}
              className="w-full px-2 py-1 flex items-center justify-between text-[11px] font-sans font-medium text-text-muted hover:text-cloud-white transition-colors uppercase tracking-wider"
            >
              <span>Manage &amp; Admin</span>
              {moreExpanded ? (
                <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-text-muted" />
              )}
            </button>
          ) : (
            <div className="text-[9px] font-sans font-semibold text-text-muted text-center uppercase tracking-wider py-1">
              Admin
            </div>
          )}

          {(moreExpanded || collapsed) && (
            <div className="space-y-1 animate-fadeIn">
              {secondaryNav.map(renderNavItem)}
            </div>
          )}
        </div>
      </div>

      {/* Footer Profile & Collapse Toggle */}
      <div className="p-2.5 border-t border-border/80 bg-surface/80 flex items-center justify-between gap-2 shrink-0">
        {!collapsed ? (
          <>
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-full bg-deep-slate border border-border text-cloud-white flex items-center justify-center font-heading font-semibold text-xs shrink-0">
                RV
              </div>
              <div className="truncate">
                <div className="text-xs font-medium text-cloud-white truncate leading-tight">
                  Capt. R. Vance
                </div>
                <div className="text-[10px] text-cyan truncate leading-tight">
                  Incident Commander
                </div>
              </div>
            </div>

            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="hidden md:flex p-1.5 rounded-control text-text-muted hover:text-cloud-white hover:bg-deep-slate transition-colors"
                title="Collapse sidebar"
                aria-label="Collapse sidebar"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center gap-1.5 w-full py-1">
            <div className="w-7 h-7 rounded-full bg-deep-slate border border-border text-cloud-white flex items-center justify-center font-heading font-semibold text-xs shrink-0">
              RV
            </div>
            <span className="text-[9px] text-text-muted font-medium">Vance</span>
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="hidden md:flex p-1 rounded-control text-text-muted hover:text-cloud-white hover:bg-deep-slate transition-colors mt-0.5"
                title="Expand sidebar"
                aria-label="Expand sidebar"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden md:flex flex-col shrink-0 border-r border-border transition-[width] duration-200 ease-out z-30 ${
          collapsed ? 'w-[76px]' : 'w-[240px]'
        } ${className}`}
      >
        {navContent}
      </aside>

      {/* Mobile Drawer (390px viewports) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-midnight/80 backdrop-blur-sm transition-opacity"
            onClick={onMobileClose}
          />
          <div className="relative w-[260px] max-w-[80vw] h-full shadow-modal animate-slideLeft z-10">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
};

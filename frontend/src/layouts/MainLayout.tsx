import React from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { Navbar } from '../components/Navbar';
import { ShieldCheck, HeartHandshake, CloudRain, ChevronRight, Home } from 'lucide-react';

export const MainLayout: React.FC = () => {
  const location = useLocation();

  const getBreadcrumbs = () => {
    const path = location.pathname;
    if (path === '/') return null;

    const crumbs: { label: string; to: string }[] = [{ label: 'Home', to: '/' }];

    if (path.includes('dashboard')) {
      crumbs.push({ label: 'Control Room', to: '/dashboard' });
    } else if (path.includes('map')) {
      crumbs.push({ label: 'Situational Map', to: '/map' });
    } else if (path.includes('queue') || path.includes('incidents')) {
      crumbs.push({ label: 'Incident Queue', to: '/queue' });
    } else if (path.includes('dispatch')) {
      crumbs.push({ label: 'Incident Queue', to: '/queue' });
      crumbs.push({ label: 'Dispatch Review', to: '/dispatch' });
    } else if (path.includes('resources')) {
      crumbs.push({ label: 'Fleet & Teams', to: '/resources' });
    } else if (path.includes('shelters')) {
      crumbs.push({ label: 'Shelters', to: '/shelters' });
    } else if (path.includes('unserved')) {
      crumbs.push({ label: 'Unserved Needs', to: '/unserved' });
    } else if (path.includes('sos') || path.includes('request-assistance')) {
      crumbs.push({ label: 'Citizen SOS', to: '/sos' });
    } else if (path.includes('status') || path.includes('track')) {
      crumbs.push({ label: 'Track SOS', to: '/status' });
    } else {
      crumbs.push({ label: 'System', to: path });
    }

    return crumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased transition-colors duration-200">
      {/* Top Disclaimer for Synthetic/Demonstration mode */}
      <DisclaimerBanner />

      {/* Main App Navbar */}
      <Navbar />

      {/* Main Content Area with dynamic breadcrumbs */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {breadcrumbs && (
          <nav aria-label="Breadcrumbs" className="flex items-center gap-1.5 text-xs text-slate-400 mb-4 pb-2 border-b border-slate-900/60">
            {breadcrumbs.map((crumb, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              return (
                <React.Fragment key={crumb.to + idx}>
                  {idx > 0 && <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />}
                  {isLast ? (
                    <span className="font-semibold text-relief-400" aria-current="page">
                      {crumb.label}
                    </span>
                  ) : (
                    <Link
                      to={crumb.to}
                      className="hover:text-slate-200 transition-colors flex items-center gap-1"
                    >
                      {idx === 0 && <Home className="w-3 h-3" />}
                      {crumb.label}
                    </Link>
                  )}
                </React.Fragment>
              );
            })}
          </nav>
        )}

        <Outlet />
      </main>

      {/* App Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 mt-auto py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <CloudRain className="w-4 h-4 text-relief-400" />
            <span>
              <strong>RESQNET</strong> &mdash; Flood Response Simulation Architecture
            </span>
          </div>

          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Human-in-the-Loop Dispatch Enforced
            </span>
            <span className="flex items-center gap-1.5">
              <HeartHandshake className="w-3.5 h-3.5 text-relief-400" /> Multi-Agency Coordination
            </span>
          </div>

          <div className="text-[11px] text-slate-600">
            Synthetic Exercise &copy; {new Date().getFullYear()} RESQNET Ecosystem
          </div>
        </div>
      </footer>
    </div>
  );
};

import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Radio, Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6 p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-amber-950/60 border border-amber-500/50 text-amber-400 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="font-mono text-xs font-bold text-amber-400 uppercase tracking-widest bg-amber-950/80 px-2.5 py-1 rounded-full border border-amber-800/60">
            404 &bull; Route Not Found
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Sector Unknown
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            The requested operations coordinate or URL does not exist within the active emergency grid.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to="/dashboard"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-relief-600 hover:bg-relief-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-relief-900/40"
          >
            <Radio className="w-4 h-4" />
            Control Room
          </Link>
          <Link
            to="/"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors border border-slate-700/60"
          >
            <Home className="w-4 h-4" />
            Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;

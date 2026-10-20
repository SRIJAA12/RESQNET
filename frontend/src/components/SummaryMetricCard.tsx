import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'default' | 'danger' | 'warning' | 'success' | 'info';
  badge?: string;
}

export const SummaryMetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'default',
  badge
}) => {
  const variantStyles = {
    default: 'border-slate-800 bg-slate-900/60 text-slate-100 hover:border-slate-700',
    danger: 'border-emergency-800/60 bg-emergency-950/30 text-emergency-100 hover:border-emergency-700/80',
    warning: 'border-amber-800/60 bg-amber-950/30 text-amber-100 hover:border-amber-700/80',
    success: 'border-emerald-800/60 bg-emerald-950/30 text-emerald-100 hover:border-emerald-700/80',
    info: 'border-relief-800/60 bg-relief-950/30 text-relief-100 hover:border-relief-700/80',
  };

  const iconColors = {
    default: 'text-slate-400 bg-slate-800/80',
    danger: 'text-emergency-400 bg-emergency-900/50',
    warning: 'text-amber-400 bg-amber-900/50',
    success: 'text-emerald-400 bg-emerald-900/50',
    info: 'text-relief-400 bg-relief-900/50',
  };

  return (
    <div className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 shadow-sm ${variantStyles[variant]}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</span>
        <div className={`p-2.5 rounded-xl ${iconColors[variant]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl sm:text-3xl font-extrabold tracking-tight">{value}</span>
        {badge && (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
            {badge}
          </span>
        )}
      </div>
      {subtitle && <p className="text-xs text-slate-400 mt-1.5 font-medium">{subtitle}</p>}
    </div>
  );
};

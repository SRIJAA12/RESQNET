import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'cyan' | 'coral' | 'amber' | 'emerald' | 'azure' | 'neutral';
  pulse?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'cyan',
  pulse = false,
  size = 'md',
  className = '',
}) => {
  const variantStyles = {
    cyan: 'bg-cyan/15 text-cyan border-cyan/40',
    coral: 'bg-coral/15 text-coral border-coral/40',
    amber: 'bg-amber/15 text-amber border-amber/40',
    emerald: 'bg-success-green/15 text-success-green border-success-green/40',
    azure: 'bg-info-blue/15 text-info-blue border-info-blue/40',
    neutral: 'bg-deep-slate text-text-secondary border-border',
  };

  const dotColors = {
    cyan: 'bg-cyan',
    coral: 'bg-coral',
    amber: 'bg-amber',
    emerald: 'bg-success-green',
    azure: 'bg-info-blue',
    neutral: 'bg-text-muted',
  };

  const sizeStyles = {
    sm: 'text-[10px] px-1.5 py-0.5 gap-1',
    md: 'text-[11px] px-2 py-0.5 gap-1.5',
  };

  return (
    <span
      className={`inline-flex items-center font-mono font-semibold uppercase tracking-wider rounded-sm border ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {pulse && (
        <span className="relative flex h-1.5 w-1.5">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotColors[variant]}`}
          />
          <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${dotColors[variant]}`} />
        </span>
      )}
      {children}
    </span>
  );
};

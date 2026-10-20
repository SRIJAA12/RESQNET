import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  variant?: 'surface' | 'raised' | 'critical';
  className?: string;
  headerClassName?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  action,
  variant = 'surface',
  className = '',
  headerClassName = '',
}) => {
  const variantStyles = {
    surface: 'bg-surface border-border',
    raised: 'bg-deep-slate border-border shadow-panel',
    critical: 'bg-midnight border-coral/60 shadow-[0_0_20px_rgba(255,98,104,0.15)]',
  };

  return (
    <div className={`rounded border ${variantStyles[variant]} ${className}`}>
      {(title || action) && (
        <div
          className={`px-4 py-3 border-b border-border flex items-center justify-between gap-3 ${headerClassName}`}
        >
          <div>
            {typeof title === 'string' ? (
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-cloud-white">
                {title}
              </h3>
            ) : (
              title
            )}
            {subtitle && (
              <p className="text-[11px] text-text-muted mt-0.5 font-sans">{subtitle}</p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
};

import React from 'react';
import { Layers } from 'lucide-react';

export interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Layers,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div
      className={`p-8 sm:p-12 text-center rounded border border-border bg-surface/60 flex flex-col items-center justify-center space-y-3 ${className}`}
    >
      <div className="w-12 h-12 rounded bg-deep-slate border border-border flex items-center justify-center text-text-muted">
        <Icon className="w-6 h-6" />
      </div>
      <div className="max-w-sm space-y-1">
        <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-cloud-white">
          {title}
        </h4>
        {description && (
          <p className="text-xs text-text-muted leading-relaxed font-sans">{description}</p>
        )}
      </div>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
};

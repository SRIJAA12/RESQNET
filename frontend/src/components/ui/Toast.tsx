import React from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export interface ToastProps {
  id?: string;
  type?: 'success' | 'danger' | 'warning' | 'info';
  title: string;
  message?: string;
  onClose?: () => void;
  className?: string;
}

export const Toast: React.FC<ToastProps> = ({
  type = 'info',
  title,
  message,
  onClose,
  className = '',
}) => {
  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-success-green shrink-0" />,
    danger: <AlertCircle className="w-4 h-4 text-coral shrink-0" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber shrink-0" />,
    info: <Info className="w-4 h-4 text-info-blue shrink-0" />,
  };

  const borders = {
    success: 'border-success-green/40 bg-surface',
    danger: 'border-coral/50 bg-midnight shadow-[0_0_15px_rgba(255,98,104,0.2)]',
    warning: 'border-amber/40 bg-surface',
    info: 'border-info-blue/40 bg-surface',
  };

  return (
    <div
      role="status"
      className={`flex items-start gap-3 p-3.5 rounded border ${borders[type]} shadow-panel max-w-sm ${className}`}
    >
      <div className="mt-0.5">{icons[type]}</div>
      <div className="flex-1 min-w-0">
        <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-cloud-white">
          {title}
        </h4>
        {message && (
          <p className="text-xs text-text-secondary mt-0.5 leading-relaxed font-sans">{message}</p>
        )}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-text-muted hover:text-cloud-white transition-colors p-0.5 -mr-1 -mt-1"
          aria-label="Dismiss toast"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

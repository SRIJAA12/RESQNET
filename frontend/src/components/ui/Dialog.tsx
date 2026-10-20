import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: string;
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'max-w-lg',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-midnight/85 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        className={`relative w-full ${maxWidth} rounded bg-surface border border-border shadow-modal z-10 overflow-hidden flex flex-col`}
      >
        {/* Header */}
        <div className="p-4 border-b border-border flex items-start justify-between gap-4 bg-deep-slate/50">
          <div>
            <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-cloud-white">
              {title}
            </h2>
            {description && (
              <p className="text-xs text-text-muted mt-1 leading-relaxed font-sans">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-text-muted hover:text-cloud-white hover:bg-midnight/60 transition-colors shrink-0"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[80vh]">{children}</div>
      </div>
    </div>
  );
};

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  width?: string;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  children,
  width = 'max-w-md',
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
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-midnight/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
        <div
          className={`w-screen ${width} bg-deep-slate border-l border-border shadow-modal flex flex-col`}
        >
          {/* Header */}
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div>
              {typeof title === 'string' ? (
                <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-cloud-white">
                  {title}
                </h2>
              ) : (
                title
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded text-text-muted hover:text-cloud-white hover:bg-midnight/60 transition-colors"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4">{children}</div>
        </div>
      </div>
    </div>
  );
};

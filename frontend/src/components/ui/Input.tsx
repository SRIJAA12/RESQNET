import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  prefixIcon?: React.ComponentType<{ className?: string }>;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, prefixIcon: PrefixIcon, className = '', ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="block font-mono text-[11px] font-semibold tracking-wider uppercase text-text-muted">
            {label}
          </label>
        )}
        <div className="relative">
          {PrefixIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
              <PrefixIcon className="w-4 h-4" />
            </div>
          )}
          <input
            ref={ref}
            className={`w-full bg-midnight border ${
              error ? 'border-coral focus:ring-coral/40' : 'border-border focus:border-cyan focus:ring-cyan/30'
            } rounded text-sm text-cloud-white placeholder-text-muted/60 px-3 py-2 outline-none transition-all duration-150 font-sans focus:ring-2 focus:ring-offset-1 focus:ring-offset-surface ${
              PrefixIcon ? 'pl-9' : ''
            } disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
            {...props}
          />
        </div>
        {error ? (
          <p className="font-mono text-[11px] text-coral mt-1">{error}</p>
        ) : hint ? (
          <p className="font-mono text-[11px] text-text-muted mt-1">{hint}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';

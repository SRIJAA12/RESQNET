import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon: Icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-mono font-semibold tracking-wide uppercase transition-all duration-200 select-none disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-midnight';

  const sizeStyles = {
    sm: 'text-[11px] px-2.5 py-1.5 rounded gap-1.5 h-8',
    md: 'text-xs px-4 py-2 rounded gap-2 h-9',
    lg: 'text-sm px-5 py-2.5 rounded gap-2.5 h-11',
    icon: 'p-2 rounded h-9 w-9 flex items-center justify-center',
  };

  const variantStyles = {
    primary:
      'bg-cyan text-midnight hover:bg-cloud-white hover:shadow-[0_0_15px_rgba(54,214,196,0.4)] active:scale-[0.98]',
    secondary:
      'bg-deep-slate text-text-secondary border border-border hover:border-cyan hover:text-cloud-white active:scale-[0.98]',
    danger:
      'bg-coral text-midnight font-bold hover:bg-red-400 hover:shadow-[0_0_15px_rgba(255,98,104,0.4)] active:scale-[0.98]',
    outline:
      'bg-transparent text-text-secondary border border-border hover:border-text-secondary hover:text-cloud-white',
    ghost:
      'bg-transparent text-text-secondary hover:bg-deep-slate/80 hover:text-cloud-white',
  };

  return (
    <button
      disabled={disabled || loading}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin text-current" />
      ) : Icon ? (
        <Icon className="w-3.5 h-3.5 shrink-0" />
      ) : null}
      {children}
    </button>
  );
};

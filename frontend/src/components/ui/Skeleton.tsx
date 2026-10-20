import React from 'react';

export interface SkeletonProps {
  className?: string;
  variant?: 'rectangular' | 'circular' | 'text';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rectangular',
  width,
  height,
}) => {
  const variantStyles = {
    rectangular: 'rounded',
    circular: 'rounded-full',
    text: 'rounded h-4 w-full',
  };

  const style: React.CSSProperties = {
    ...(width ? { width } : {}),
    ...(height ? { height } : {}),
  };

  return (
    <div
      style={style}
      className={`animate-pulse bg-deep-slate/80 border border-border/50 ${variantStyles[variant]} ${className}`}
    />
  );
};

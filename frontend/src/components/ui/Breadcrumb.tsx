import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = '' }) => {
  return (
    <nav aria-label="Breadcrumb" className={`flex items-center gap-1.5 text-xs font-sans ${className}`}>
      <Link
        to="/ops/command-center"
        className="text-text-muted hover:text-cyan transition-colors flex items-center gap-1"
        title="Command Operations"
      >
        <Home className="w-3.5 h-3.5" />
      </Link>
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <React.Fragment key={item.label + idx}>
            <ChevronRight className="w-3 h-3 text-border shrink-0" />
            {isLast || !item.to ? (
              <span className="font-medium text-cloud-white truncate" aria-current="page">
                {item.label}
              </span>
            ) : (
              <Link
                to={item.to}
                className="text-text-muted hover:text-cloud-white transition-colors truncate"
              >
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

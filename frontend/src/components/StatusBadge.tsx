import React from 'react';
import { 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  Truck, 
  Check, 
  XCircle, 
  AlertTriangle 
} from 'lucide-react';
import { IncidentPriority, IncidentStatus, ResourceStatus, ShelterStatus } from '../types';

interface BadgeProps {
  type: 'status' | 'priority' | 'resource' | 'shelter';
  value: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<BadgeProps> = ({ type, value, size = 'sm' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  if (type === 'priority') {
    switch (value.toLowerCase() as IncidentPriority) {
      case 'critical':
        return (
          <span className={`inline-flex items-center gap-1 font-semibold rounded-full bg-coral/15 text-coral ${sizeClasses}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-coral animate-pulse" />
            Critical
          </span>
        );
      case 'high':
        return (
          <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-amber/15 text-amber ${sizeClasses}`}>
            High
          </span>
        );
      case 'medium':
        return (
          <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-info-blue/15 text-info-blue ${sizeClasses}`}>
            Medium
          </span>
        );
      case 'low':
      default:
        return (
          <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-deep-slate text-text-muted ${sizeClasses}`}>
            Low
          </span>
        );
    }
  }

  if (type === 'status') {
    switch (value.toLowerCase() as IncidentStatus) {
      case 'submitted':
        return (
          <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-amber/15 text-amber ${sizeClasses}`}>
            <Clock className="w-3 h-3 text-amber" />
            Submitted
          </span>
        );
      case 'under_review':
        return (
          <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-amber/15 text-amber ${sizeClasses}`}>
            <Clock className="w-3 h-3 text-amber" />
            Needs review
          </span>
        );
      case 'verified':
        return (
          <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-info-blue/15 text-info-blue ${sizeClasses}`}>
            <CheckCircle2 className="w-3 h-3 text-info-blue" />
            Verified
          </span>
        );
      case 'assigned':
        return (
          <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-cyan/15 text-cyan ${sizeClasses}`}>
            <Truck className="w-3 h-3 text-cyan" />
            Assigned
          </span>
        );
      case 'in_progress':
        return (
          <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-cyan/15 text-cyan ${sizeClasses}`}>
            <Truck className="w-3 h-3 text-cyan animate-pulse" />
            In progress
          </span>
        );
      case 'resolved':
        return (
          <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-success-green/15 text-success-green ${sizeClasses}`}>
            <Check className="w-3 h-3 text-success-green" />
            Resolved
          </span>
        );
      case 'rejected':
        return (
          <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-coral/15 text-coral ${sizeClasses}`}>
            <XCircle className="w-3 h-3 text-coral" />
            Rejected
          </span>
        );
      default:
        return (
          <span className={`inline-flex items-center gap-1 rounded-full bg-deep-slate text-text-secondary ${sizeClasses}`}>
            {value}
          </span>
        );
    }
  }

  if (type === 'resource') {
    switch (value.toLowerCase() as ResourceStatus) {
      case 'available':
        return (
          <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-success-green/15 text-success-green ${sizeClasses}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-success-green" />
            Available
          </span>
        );
      case 'deployed':
        return (
          <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-cyan/15 text-cyan ${sizeClasses}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse" />
            Deployed
          </span>
        );
      case 'maintenance':
        return (
          <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-deep-slate text-text-muted ${sizeClasses}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-text-muted" />
            Maintenance
          </span>
        );
      case 'decommissioned':
      default:
        return (
          <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-deep-slate text-text-muted ${sizeClasses}`}>
            Decommissioned
          </span>
        );
    }
  }

  if (type === 'shelter') {
    switch (value.toLowerCase() as ShelterStatus) {
      case 'active':
        return (
          <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-success-green/15 text-success-green ${sizeClasses}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-success-green" />
            Open
          </span>
        );
      case 'full':
        return (
          <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-coral/15 text-coral ${sizeClasses}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-coral" />
            At capacity
          </span>
        );
      case 'closed':
      default:
        return (
          <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-deep-slate text-text-muted ${sizeClasses}`}>
            Closed
          </span>
        );
    }
  }

  return (
    <span className={`inline-flex items-center gap-1 rounded-full bg-deep-slate text-text-secondary ${sizeClasses}`}>
      {value}
    </span>
  );
};

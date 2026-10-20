import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Users, HeartPulse, Clock, Sparkles, ChevronRight } from 'lucide-react';
import { Incident } from '../types';
import { StatusBadge } from './StatusBadge';

interface IncidentCardProps {
  incident: Incident;
  onSelect?: (incident: Incident) => void;
  compact?: boolean;
}

export const IncidentCard: React.FC<IncidentCardProps> = ({ incident, onSelect, compact = false }) => {
  const isCritical = incident.priority === 'critical';

  return (
    <div
      onClick={() => onSelect && onSelect(incident)}
      className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 cursor-pointer ${
        isCritical
          ? 'bg-emergency-950/20 border-emergency-800/40 hover:border-emergency-600 shadow-md shadow-emergency-950/30'
          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
      }`}
    >
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-relief-400 bg-relief-950/80 px-2 py-0.5 rounded border border-relief-800/60">
            {incident.reference_code}
          </span>
          <StatusBadge type="priority" value={incident.priority} size="sm" />
          <StatusBadge type="status" value={incident.status} size="sm" />
        </div>
        
        {incident.ai_triage_score && (
          <div className="flex items-center gap-1 text-[11px] font-semibold text-purple-300 bg-purple-950/60 border border-purple-800/50 px-2 py-0.5 rounded-full">
            <Sparkles className="w-3 h-3 text-purple-400" />
            AI Triage: {incident.ai_triage_score.toFixed(0)}/100
          </div>
        )}
      </div>

      {/* Description */}
      <p className="text-sm font-medium text-slate-200 mb-3 line-clamp-2 leading-relaxed">
        {incident.description}
      </p>

      {/* Attributes & Location */}
      <div className="space-y-1.5 text-xs text-slate-400">
        <div className="flex items-center gap-1.5 text-slate-300">
          <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="truncate">{incident.address_text}</span>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <div className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span>{incident.people_count} {incident.people_count === 1 ? 'person' : 'people'}</span>
          </div>

          {incident.trapped_count > 0 && (
            <div className="flex items-center gap-1 text-emergency-300 font-semibold bg-emergency-950/60 px-1.5 py-0.5 rounded border border-emergency-800/50">
              <span>{incident.trapped_count} trapped</span>
            </div>
          )}

          {incident.medical_assistance_needed && (
            <div className="flex items-center gap-1 text-emergency-400 font-semibold bg-emergency-950/60 px-1.5 py-0.5 rounded border border-emergency-800/50">
              <HeartPulse className="w-3 h-3 text-emergency-400" />
              <span>Medical urgent</span>
            </div>
          )}

          <div className="flex items-center gap-1 ml-auto text-slate-500 text-[11px]">
            <Clock className="w-3 h-3" />
            <span>{new Date(incident.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      </div>

      {/* Action Footer if not compact */}
      {!compact && (
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Reporter: <strong className="text-slate-400 font-medium">{incident.reporter_name}</strong>
          </span>
          <Link
            to={`/dispatch?incident_id=${incident.id}`}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-xs font-semibold text-relief-400 hover:text-relief-300 transition-colors"
          >
            Dispatch Review <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
};

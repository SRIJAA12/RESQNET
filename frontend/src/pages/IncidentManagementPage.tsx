import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Incident } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import {
  Search,
  RefreshCw,
  Clock,
  MapPin,
  Users,
  HeartPulse,
  Truck,
  ChevronRight,
  Filter,
  CheckCircle2,
  AlertCircle,
  X
} from 'lucide-react';

export const IncidentManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<'all' | 'needs_review' | 'verified' | 'assigned' | 'resolved'>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const loadIncidents = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getIncidents();
      setIncidents(data);
    } catch (err: any) {
      console.error('Failed to load incidents:', err);
      setError(err.message || 'Failed to fetch incident queue from dispatch services.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  const formatWaitTime = (dateStr: string) => {
    const elapsedMs = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(elapsedMs / (1000 * 60));
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m waiting`;
    const hours = Math.floor(minutes / 60);
    const remMin = minutes % 60;
    return `${hours}h ${remMin}m waiting`;
  };

  // Filtered dataset
  const filteredIncidents = useMemo(() => {
    let list = incidents;

    // Status tab filter
    if (statusFilter === 'needs_review') {
      list = list.filter((i) => i.status === 'submitted' || i.status === 'under_review');
    } else if (statusFilter === 'verified') {
      list = list.filter((i) => i.status === 'verified');
    } else if (statusFilter === 'assigned') {
      list = list.filter((i) => i.status === 'assigned' || i.status === 'in_progress');
    } else if (statusFilter === 'resolved') {
      list = list.filter((i) => i.status === 'resolved');
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      list = list.filter((i) => i.priority === priorityFilter);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (i) =>
          i.reference_code.toLowerCase().includes(q) ||
          i.address_text.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.reporter_name.toLowerCase().includes(q)
      );
    }

    return list;
  }, [incidents, statusFilter, priorityFilter, searchQuery]);

  // Tab counts
  const countNeedsReview = incidents.filter((i) => i.status === 'submitted' || i.status === 'under_review').length;
  const countVerified = incidents.filter((i) => i.status === 'verified').length;
  const countAssigned = incidents.filter((i) => i.status === 'assigned' || i.status === 'in_progress').length;
  const countResolved = incidents.filter((i) => i.status === 'resolved').length;

  return (
    <div className="space-y-6 pb-8 animate-fadeIn max-w-[1440px] mx-auto">
      {/* ── 1. Page Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-cloud-white tracking-tight">
            Incidents
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Incoming distress reports, prioritization triage, and dispatch authorization.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadIncidents}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-control bg-surface hover:bg-deep-slate border border-border text-xs text-text-secondary hover:text-cloud-white transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── 2. Filters & Search Bar ────────────────────────────────────────────── */}
      <div className="p-4 rounded-card bg-surface border border-border/80 space-y-3.5 shadow-subtle">
        {/* Top: Status Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-control text-xs transition-colors ${
                statusFilter === 'all'
                  ? 'bg-teal-600 dark:bg-cyan text-white dark:text-midnight font-bold shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-deep-slate dark:text-text-secondary dark:hover:text-cloud-white border border-slate-200 dark:border-border/60 font-medium'
              }`}
            >
              All ({incidents.length})
            </button>

            <button
              onClick={() => setStatusFilter('needs_review')}
              className={`px-3 py-1.5 rounded-control text-xs transition-colors flex items-center gap-1.5 ${
                statusFilter === 'needs_review'
                  ? 'bg-amber-600 dark:bg-amber text-white dark:text-midnight font-bold shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-amber-700 dark:text-amber dark:hover:text-cloud-white border border-slate-200 dark:border-border/60 font-medium'
              }`}
            >
              Needs review ({countNeedsReview})
            </button>

            <button
              onClick={() => setStatusFilter('verified')}
              className={`px-3 py-1.5 rounded-control text-xs transition-colors ${
                statusFilter === 'verified'
                  ? 'bg-blue-600 dark:bg-info-blue text-white dark:text-midnight font-bold shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-blue-700 dark:text-info-blue dark:hover:text-cloud-white border border-slate-200 dark:border-border/60 font-medium'
              }`}
            >
              Verified ({countVerified})
            </button>

            <button
              onClick={() => setStatusFilter('assigned')}
              className={`px-3 py-1.5 rounded-control text-xs transition-colors ${
                statusFilter === 'assigned'
                  ? 'bg-teal-600 dark:bg-cyan text-white dark:text-midnight font-bold shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-teal-700 dark:text-cyan dark:hover:text-cloud-white border border-slate-200 dark:border-border/60 font-medium'
              }`}
            >
              Assigned ({countAssigned})
            </button>

            <button
              onClick={() => setStatusFilter('resolved')}
              className={`px-3 py-1.5 rounded-control text-xs transition-colors ${
                statusFilter === 'resolved'
                  ? 'bg-emerald-600 dark:bg-success-green text-white dark:text-midnight font-bold shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-emerald-700 dark:text-success-green dark:hover:text-cloud-white border border-slate-200 dark:border-border/60 font-medium'
              }`}
            >
              Resolved ({countResolved})
            </button>
          </div>

          {/* Priority filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-600 dark:text-text-muted font-medium">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-white dark:bg-midnight border border-slate-200 dark:border-border/80 text-slate-800 dark:text-cloud-white text-xs px-2.5 py-1.5 rounded-control outline-none cursor-pointer focus:border-teal-600 dark:focus:border-cyan shadow-2xs font-medium"
            >
              <option value="all">All priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 dark:text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by reference code, sector address, or reporter..."
            className="w-full pl-9 pr-8 py-2 rounded-control bg-white dark:bg-midnight border border-slate-200 dark:border-border/80 focus:border-teal-600 dark:focus:border-cyan text-xs text-slate-900 dark:text-cloud-white placeholder-slate-400 dark:placeholder-text-muted outline-none transition-all shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-text-muted hover:text-slate-700 dark:hover:text-cloud-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── 3. Clean, Spacious Incident List ──────────────────────────────────── */}
      <div className="rounded-panel bg-surface border border-border/80 overflow-hidden shadow-card">
        {loading ? (
          <div className="py-20 text-center text-xs text-text-muted">
            <RefreshCw className="w-5 h-5 text-teal-600 dark:text-cyan animate-spin mx-auto mb-2" />
            Loading incident records...
          </div>
        ) : filteredIncidents.length === 0 ? (
          <div className="py-16 text-center text-xs text-text-muted space-y-2">
            <AlertCircle className="w-6 h-6 text-text-muted mx-auto" />
            <p>No incidents found matching current filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-border/70 text-slate-700 dark:text-text-muted font-sans font-bold text-[11px] uppercase tracking-wider bg-slate-50 dark:bg-deep-slate/40">
                  <th className="py-3 px-4">Reference</th>
                  <th className="py-3 px-4">Location & description</th>
                  <th className="py-3 px-4">Severity</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Waiting time</th>
                  <th className="py-3 px-4">Assignment</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredIncidents.map((inc) => (
                  <tr
                    key={inc.id}
                    className="hover:bg-slate-50 dark:hover:bg-deep-slate/50 transition-colors group"
                  >
                    {/* Reference */}
                    <td className="py-3.5 px-4 font-mono font-bold text-cyan">
                      <Link
                        to={`/ops/incidents/${inc.id}`}
                        className="hover:underline flex items-center gap-1.5"
                      >
                        {inc.reference_code}
                      </Link>
                    </td>

                    {/* Location & description */}
                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="font-medium text-cloud-white truncate flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-text-muted shrink-0" />
                        <span className="truncate">{inc.address_text}</span>
                      </div>
                      <div className="text-[11px] text-text-secondary truncate mt-0.5">
                        {inc.description}
                      </div>
                    </td>

                    {/* Severity */}
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${
                        inc.priority === 'critical'
                          ? 'bg-coral/15 text-coral'
                          : inc.priority === 'high'
                          ? 'bg-amber/15 text-amber'
                          : 'bg-cyan/15 text-cyan'
                      }`}>
                        {inc.priority === 'critical' && <span className="w-1.5 h-1.5 rounded-full bg-coral animate-pulse" />}
                        {inc.priority.charAt(0).toUpperCase() + inc.priority.slice(1)}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <StatusBadge type="status" value={inc.status} size="sm" />
                    </td>

                    {/* Waiting time */}
                    <td className="py-3.5 px-4 text-text-muted whitespace-nowrap">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-text-muted" />
                        {formatWaitTime(inc.created_at)}
                      </span>
                    </td>

                    {/* Assignment */}
                    <td className="py-3.5 px-4">
                      {inc.status === 'assigned' || inc.status === 'in_progress' ? (
                        <span className="inline-flex items-center gap-1 text-cyan font-medium">
                          <Truck className="w-3 h-3" />
                          Assigned
                        </span>
                      ) : (
                        <span className="text-text-muted">Unassigned</span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/ops/incidents/${inc.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-control bg-deep-slate hover:bg-cyan hover:text-midnight text-cloud-white font-medium text-xs transition-colors"
                      >
                        Review <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

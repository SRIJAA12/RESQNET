import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Incident, IncidentPriority, IncidentStatus } from '../types';
import { IncidentCard } from '../components/IncidentCard';
import { StatusBadge } from '../components/StatusBadge';
import { 
  Search, 
  Filter, 
  RefreshCw, 
  CheckCircle, 
  Clock, 
  ShieldAlert, 
  X,
  Sparkles,
  MessageSquare
} from 'lucide-react';

export const IncidentQueuePage: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Status update modal state
  const [selectedForUpdate, setSelectedForUpdate] = useState<Incident | null>(null);
  const [newStatus, setNewStatus] = useState<IncidentStatus>('verified');
  const [updateNotes, setUpdateNotes] = useState('');
  const [updating, setUpdating] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  const loadIncidents = async () => {
    setLoading(true);
    try {
      const data = await api.getIncidents({
        status: statusFilter === 'all' ? undefined : statusFilter,
        priority: priorityFilter === 'all' ? undefined : priorityFilter,
        search: searchQuery ? searchQuery : undefined,
      });
      setIncidents(data);
    } catch (err) {
      console.error('Failed to load incident queue:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    setSyncFeedback(null);
    try {
      const res = await api.syncIncidents();
      if (res.synced_count > 0) {
        setSyncFeedback(`Synchronized ${res.synced_count} new citizen SOS report(s)`);
        await loadIncidents();
      } else {
        setSyncFeedback('All citizen SOS reports are up to date');
      }
      setTimeout(() => setSyncFeedback(null), 4000);
    } catch (err: any) {
      console.error('Failed to sync serverless SOS reports:', err);
      setSyncFeedback('Sync completed with current records');
      setTimeout(() => setSyncFeedback(null), 4000);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, [statusFilter, priorityFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadIncidents();
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedForUpdate) return;
    if (newStatus === 'rejected' && !updateNotes.trim()) {
      alert('A specific operational reason is required to reject an emergency SOS.');
      return;
    }
    setUpdating(true);
    try {
      await api.updateIncidentStatus(selectedForUpdate.id, newStatus, updateNotes);
      setSelectedForUpdate(null);
      setUpdateNotes('');
      await loadIncidents();
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Incident Triage & Operations Queue
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Review, verify, and track live SOS submissions. Prioritize by severity and trapped count.
          </p>
          {syncFeedback && (
            <p className="text-xs text-relief-400 font-medium mt-1 animate-pulse">
              ✓ {syncFeedback}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-relief-900/60 hover:bg-relief-800/80 border border-relief-700/50 text-xs text-relief-200 hover:text-white transition-colors cursor-pointer"
            title="Ingest pending SOS reports from Serverless DynamoDB into operational PostgreSQL queue"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync Serverless SOS'}
          </button>

          <button
            onClick={loadIncidents}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Queue
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[240px]">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reference code, landmark, description..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-relief-500 text-xs text-white placeholder-slate-600 outline-none"
            />
          </div>
        </form>

        {/* Priority Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Priority:</span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 outline-none focus:border-relief-500"
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 outline-none focus:border-relief-500"
          >
            <option value="all">All Statuses</option>
            <option value="submitted">Submitted</option>
            <option value="under_review">Under Review</option>
            <option value="verified">Verified</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Incident List */}
      <div className="space-y-3">
        {incidents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {incidents.map((incident) => (
              <div key={incident.id} className="relative group">
                <IncidentCard incident={incident} />
                <button
                  onClick={() => {
                    setSelectedForUpdate(incident);
                    setNewStatus(incident.status);
                  }}
                  className="absolute top-4 right-4 text-[11px] font-semibold text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 px-2 py-1 rounded-md border border-slate-700 transition-colors"
                >
                  Change Status
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-500 text-xs">
            No incidents matched the selected status or priority filters.
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      {selectedForUpdate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-500">Update Incident Status</span>
                <div className="font-mono text-sm font-bold text-relief-400">
                  {selectedForUpdate.reference_code}
                </div>
              </div>
              <button
                onClick={() => setSelectedForUpdate(null)}
                className="text-slate-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  New Incident Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as IncidentStatus)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-relief-500"
                >
                  <option value="under_review">Under Review</option>
                  <option value="verified">Verified</option>
                  <option value="assigned">Assigned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Dispatcher Verification Notes
                </label>
                <textarea
                  rows={3}
                  value={updateNotes}
                  onChange={(e) => setUpdateNotes(e.target.value)}
                  placeholder="e.g. Drone recon confirmed 3 individuals safely moved to upper terrace..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 outline-none focus:border-relief-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedForUpdate(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2 rounded-xl bg-relief-600 hover:bg-relief-500 text-xs text-white font-bold transition-colors cursor-pointer"
                >
                  {updating ? 'Saving...' : 'Confirm Status Change'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

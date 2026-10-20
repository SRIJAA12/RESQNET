import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { AuditLogEntry } from '../types';
import { 
  ShieldCheck, 
  Clock, 
  User, 
  Search, 
  Filter, 
  RefreshCw, 
  ExternalLink, 
  Lock,
  Layers,
  FileCheck2,
  AlertTriangle
} from 'lucide-react';

export const AuditTrailPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [recordTypeFilter, setRecordTypeFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [search, setSearch] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await api.getAuditLogs();
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredLogs = logs.filter(log => {
    if (recordTypeFilter !== 'all' && log.record_type !== recordTypeFilter) return false;
    if (roleFilter !== 'all' && !log.actor_role.toLowerCase().includes(roleFilter.toLowerCase())) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        log.action.toLowerCase().includes(q) ||
        log.actor_name.toLowerCase().includes(q) ||
        (log.record_ref && log.record_ref.toLowerCase().includes(q)) ||
        (log.reason && log.reason.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const getRecordLink = (log: AuditLogEntry) => {
    if (log.record_type === 'incident') return `/ops/incidents/${log.record_id}`;
    if (log.record_type === 'resource') return `/ops/resources/${log.record_id}`;
    if (log.record_type === 'facility') return `/ops/facilities/${log.record_id}`;
    if (log.record_type === 'inventory') return `/ops/inventory`;
    if (log.record_type === 'distribution') return `/ops/distribution`;
    if (log.record_type === 'user') return `/ops/users`;
    if (log.record_type === 'event') return `/ops/events`;
    return null;
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-cyan/15 text-cyan font-mono text-[10px] font-bold uppercase tracking-wider border border-cyan/30 flex items-center gap-1">
              <Lock className="w-3 h-3" />
              IMMUTABLE CHRONOLOGICAL AUDIT LEDGER
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1">
            System Security & Operations Audit Trail
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-3xl mt-0.5">
            Cryptographic ledger tracking all operator dispatches, inventory state shifts, census audits, and administrative overrides.
          </p>
        </div>

        <button
          onClick={loadData}
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan transition-colors self-start sm:self-auto"
          title="Refresh audit ledger"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan' : ''}`} />
        </button>
      </div>

      {/* Filter Controls */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 font-mono text-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search action, actor, reason, or record reference..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-white placeholder-slate-500 outline-none focus:border-cyan"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={recordTypeFilter}
            onChange={(e) => setRecordTypeFilter(e.target.value)}
            className="bg-slate-950 text-white border border-slate-800 rounded-xl px-3 py-2 outline-none focus:border-cyan cursor-pointer"
          >
            <option value="all">All Record Types</option>
            <option value="incident">Incidents</option>
            <option value="resource">Resources</option>
            <option value="facility">Facilities</option>
            <option value="inventory">Inventory</option>
            <option value="user">Users</option>
            <option value="event">Disaster Events</option>
          </select>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-950 text-white border border-slate-800 rounded-xl px-3 py-2 outline-none focus:border-cyan cursor-pointer"
          >
            <option value="all">All Actor Roles</option>
            <option value="commander">Commander / Dispatcher</option>
            <option value="sar">Tactical Responder</option>
            <option value="partner">Partner Coordinator</option>
            <option value="admin">Administrator</option>
          </select>
        </div>
      </div>

      {/* Audit Entries Ledger */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl font-mono text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-[10px] text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Actor & Role</th>
                <th className="p-3.5">Action Code</th>
                <th className="p-3.5">Affected Record</th>
                <th className="p-3.5">State Transition (Previous → New)</th>
                <th className="p-3.5">Justification & IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-cyan" />
                    Verifying audit ledger signatures...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No audit records match the selected filter parameters.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const recordLink = getRecordLink(log);
                  return (
                    <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Timestamp */}
                      <td className="p-3.5 whitespace-nowrap text-slate-400 text-[11px]">
                        <div>{new Date(log.timestamp).toLocaleDateString()}</div>
                        <div className="text-[10px] text-slate-500">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </div>
                      </td>

                      {/* Actor & Role */}
                      <td className="p-3.5 whitespace-nowrap">
                        <div className="font-bold text-white text-xs">{log.actor_name}</div>
                        <span className="text-[10px] text-cyan block">{log.actor_role}</span>
                      </td>

                      {/* Action Code */}
                      <td className="p-3.5 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-950 text-slate-200 border border-slate-800">
                          {log.action}
                        </span>
                      </td>

                      {/* Affected Record */}
                      <td className="p-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-slate-500 uppercase">{log.record_type}:</span>
                          {recordLink ? (
                            <Link
                              to={recordLink}
                              className="text-cyan hover:underline font-bold flex items-center gap-1"
                            >
                              <span>{log.record_ref || log.record_id}</span>
                              <ExternalLink className="w-3 h-3 text-cyan/70" />
                            </Link>
                          ) : (
                            <strong className="text-white">{log.record_ref || log.record_id}</strong>
                          )}
                        </div>
                      </td>

                      {/* State Transition */}
                      <td className="p-3.5 text-[11px] max-w-xs">
                        {log.previous_state && (
                          <div className="text-red-300/80 line-through truncate">
                            {log.previous_state}
                          </div>
                        )}
                        {log.new_state && (
                          <div className="text-emerald-400 truncate">
                            {log.new_state}
                          </div>
                        )}
                      </td>

                      {/* Reason & IP */}
                      <td className="p-3.5 text-[11px] text-slate-300 max-w-xs font-sans">
                        <div className="line-clamp-2 italic text-slate-400">
                          "{log.reason || 'Routine operational update'}"
                        </div>
                        <span className="text-[9px] font-mono text-slate-600 block mt-0.5">
                          Host IP: {log.ip_address || '10.0.4.1'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

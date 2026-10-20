import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { ResponderTask, ResponderTaskStatus } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { 
  ClipboardList, 
  MapPin, 
  AlertTriangle, 
  Users, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  Radio, 
  Navigation,
  RefreshCw,
  Search,
  Check
} from 'lucide-react';

export const ResponderTaskListPage: React.FC = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<ResponderTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'active' | 'completed' | 'all'>('active');
  const [search, setSearch] = useState('');
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await api.getResponderTasks();
      setTasks(data);
    } catch (err) {
      console.error('Failed to load responder tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleQuickStatusChange = async (taskId: string, nextStatus: ResponderTaskStatus, label: string) => {
    try {
      setUpdatingTaskId(taskId);
      await api.updateResponderTaskStatus(taskId, nextStatus, `Quick action: ${label}`);
      await loadTasks();
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const filteredTasks = tasks.filter(t => {
    if (filter === 'active') {
      if (t.status === 'completed' || t.status === 'cancelled') return false;
    } else if (filter === 'completed') {
      if (t.status !== 'completed') return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.address_text.toLowerCase().includes(q) ||
        t.incident_reference.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const activeCount = tasks.filter(t => t.status !== 'completed' && t.status !== 'cancelled').length;

  return (
    <div className="space-y-4 font-sans">
      {/* Page Header */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-white tracking-tight">Assigned Missions</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {activeCount} Active
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Unit: SWIFT-ALPHA-01 // Riverbend Sector B
          </p>
        </div>

        <button
          onClick={loadTasks}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/40 transition-colors"
          title="Refresh task buffer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="space-y-2">
        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl font-mono text-xs">
          <button
            onClick={() => setFilter('active')}
            className={`py-2 rounded-lg font-bold transition-all ${
              filter === 'active'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`py-2 rounded-lg font-bold transition-all ${
              filter === 'completed'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Completed ({tasks.filter(t => t.status === 'completed').length})
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`py-2 rounded-lg font-bold transition-all ${
              filter === 'all'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({tasks.length})
          </button>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search address or reference code..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-white placeholder-slate-500 outline-none focus:border-emerald-500 transition-colors"
          />
        </div>
      </div>

      {/* Task Cards List */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 font-mono text-xs">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-400" />
          Synchronizing tactical assignments...
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
          <ClipboardList className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="text-sm font-bold text-slate-300">No missions found</p>
          <p className="text-xs text-slate-500 font-mono">
            All tactical assignments in this category are clear or buffer is empty.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => {
            const isCritical = task.priority === 'critical';
            return (
              <div
                key={task.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isCritical && task.status !== 'completed'
                    ? 'bg-red-950/20 border-red-900/60 shadow-lg shadow-red-950/30'
                    : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Top Card Info */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                        task.priority === 'critical'
                          ? 'bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse'
                          : task.priority === 'high'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {task.priority} Priority
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {task.incident_reference}
                    </span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                      task.status === 'completed'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : task.status === 'en_route'
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                        : task.status === 'on_site' || task.status === 'in_progress'
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    }`}
                  >
                    {task.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Title & Description */}
                <Link to={`/responder/tasks/${task.id}`} className="block group">
                  <h2 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors leading-snug">
                    {task.title}
                  </h2>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                    {task.description}
                  </p>
                </Link>

                {/* Special Needs Alert Banner */}
                {task.special_needs && (
                  <div className="mt-2.5 p-2 rounded-xl bg-amber-950/40 border border-amber-800/40 text-[11px] text-amber-300 flex items-start gap-1.5 font-sans">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span><strong>Urgent Attention:</strong> {task.special_needs}</span>
                  </div>
                )}

                {/* Metadata Row */}
                <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-400">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate max-w-[180px]">{task.address_text}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{task.people_count} Victims ({task.trapped_count} Trapped)</span>
                    </span>
                  </div>

                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(task.assigned_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Quick Action Stepper Buttons */}
                <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {task.status === 'assigned' && (
                      <button
                        onClick={() => handleQuickStatusChange(task.id, 'acknowledged', 'Unit Acknowledged')}
                        disabled={updatingTaskId === task.id}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-bold transition-all disabled:opacity-50"
                      >
                        Acknowledge
                      </button>
                    )}

                    {task.status === 'acknowledged' && (
                      <button
                        onClick={() => handleQuickStatusChange(task.id, 'en_route', 'En Route to Target')}
                        disabled={updatingTaskId === task.id}
                        className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold transition-all disabled:opacity-50"
                      >
                        Mark En Route
                      </button>
                    )}

                    {task.status === 'en_route' && (
                      <button
                        onClick={() => handleQuickStatusChange(task.id, 'on_site', 'Arrived On Scene')}
                        disabled={updatingTaskId === task.id}
                        className="px-3 py-1.5 rounded-lg bg-purple-500 hover:bg-purple-400 text-white font-mono text-xs font-bold transition-all disabled:opacity-50"
                      >
                        Arrived On Site
                      </button>
                    )}

                    {(task.status === 'on_site' || task.status === 'in_progress') && (
                      <button
                        onClick={() => navigate(`/responder/tasks/${task.id}`)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-bold transition-all"
                      >
                        Complete Rescue Brief ↗
                      </button>
                    )}
                  </div>

                  <Link
                    to={`/responder/tasks/${task.id}`}
                    className="inline-flex items-center gap-1 text-xs font-mono font-bold text-slate-400 hover:text-emerald-400 transition-colors p-1"
                  >
                    <span>Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { DisasterEvent } from '../types';
import { 
  AlertTriangle, 
  Plus, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  RefreshCw, 
  Edit3, 
  Radio, 
  Clock, 
  Layers,
  ShieldAlert
} from 'lucide-react';

export const DisasterEventsPage: React.FC = () => {
  const [events, setEvents] = useState<DisasterEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<DisasterEvent | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    disaster_type: 'flood',
    severity: 'critical',
    status: 'active',
    affected_region_name: '',
    description: '',
  });
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await api.getEvents();
      setEvents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setEditingEvent(null);
    setFormData({
      name: '',
      disaster_type: 'flood',
      severity: 'critical',
      status: 'active',
      affected_region_name: '',
      description: '',
    });
    setErrorMsg(null);
    setShowModal(true);
  };

  const handleOpenEdit = (evt: DisasterEvent) => {
    setEditingEvent(evt);
    setFormData({
      name: evt.name,
      disaster_type: evt.disaster_type,
      severity: evt.severity,
      status: evt.status,
      affected_region_name: evt.affected_region_name,
      description: evt.description || '',
    });
    setErrorMsg(null);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!formData.name.trim()) {
      setErrorMsg('Disaster declaration name is required.');
      return;
    }
    if (!formData.affected_region_name.trim()) {
      setErrorMsg('Designated affected region name is required.');
      return;
    }

    try {
      setSaving(true);
      if (editingEvent) {
        await api.updateEvent(editingEvent.id, formData);
      } else {
        await api.createEvent(formData);
      }
      await loadData();
      setShowModal(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save disaster event.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Disaster Event Declarations & Scenarios
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-3xl mt-0.5">
            Administrative management of active emergency incidents, designated disaster perimeters, and severity classifications.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 rounded-xl bg-cyan hover:bg-cyan/90 text-slate-950 font-mono text-xs font-bold flex items-center gap-2 shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Declare Emergency Event</span>
          </button>

          <button
            onClick={loadData}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan transition-colors"
            title="Refresh events"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan' : ''}`} />
          </button>
        </div>
      </div>

      {/* Events List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-xs">
        {loading ? (
          <div className="col-span-3 p-12 text-center text-slate-500">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-cyan" />
            Loading declared emergency scenarios...
          </div>
        ) : (
          events.map((evt) => {
            const isCritical = evt.severity === 'critical';
            const isActive = evt.status === 'active';
            return (
              <div
                key={evt.id}
                className={`p-5 rounded-2xl border transition-all space-y-4 shadow-xl flex flex-col justify-between ${
                  isActive
                    ? 'bg-slate-900 border-cyan/40 shadow-cyan/5'
                    : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                        isCritical
                          ? 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      }`}
                    >
                      {evt.severity} Severity
                    </span>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                        isActive
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {evt.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white font-sans">{evt.name}</h3>
                    <div className="flex items-center gap-1.5 text-slate-400 text-xs mt-1">
                      <MapPin className="w-3.5 h-3.5 text-cyan shrink-0" />
                      <span>{evt.affected_region_name}</span>
                    </div>
                  </div>

                  {evt.description && (
                    <p className="text-xs text-slate-300 font-sans line-clamp-3 leading-relaxed">
                      {evt.description}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {evt.declaration_date ? new Date(evt.declaration_date).toLocaleDateString() : 'N/A'}
                  </span>

                  <button
                    onClick={() => handleOpenEdit(evt)}
                    className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan text-xs font-bold transition-all flex items-center gap-1"
                  >
                    <Edit3 className="w-3 h-3" /> Edit
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm font-mono text-xs">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-cyan/40 p-6 space-y-4 shadow-modal">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">
                  {editingEvent ? 'Modify Disaster Scenario' : 'Declare New Disaster Scenario'}
                </h3>
                <p className="text-cyan text-xs">State Emergency Operations Center</p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-950 border border-red-800 text-red-200">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-slate-400 uppercase text-[10px] font-bold block mb-1">
                  Declaration Code & Scenario Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. SIM-FLOOD-2026 // Riverbend Basin"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-slate-400 uppercase text-[10px] font-bold block mb-1">
                    Disaster Type
                  </label>
                  <select
                    value={formData.disaster_type}
                    onChange={(e) => setFormData({ ...formData, disaster_type: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 text-white outline-none focus:border-cyan cursor-pointer"
                  >
                    <option value="flood">Flood</option>
                    <option value="cyclone">Cyclone</option>
                    <option value="landslide">Landslide</option>
                    <option value="earthquake">Earthquake</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 uppercase text-[10px] font-bold block mb-1">
                    Severity
                  </label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 text-white outline-none focus:border-cyan cursor-pointer"
                  >
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 uppercase text-[10px] font-bold block mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 text-white outline-none focus:border-cyan cursor-pointer"
                  >
                    <option value="active">Active</option>
                    <option value="monitoring">Monitoring</option>
                    <option value="contained">Contained</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 uppercase text-[10px] font-bold block mb-1">
                  Designated Affected Region *
                </label>
                <input
                  type="text"
                  required
                  value={formData.affected_region_name}
                  onChange={(e) => setFormData({ ...formData, affected_region_name: e.target.value })}
                  placeholder="e.g. Riverbend Basin & Lowland Corridor"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan"
                />
              </div>

              <div>
                <label className="text-slate-400 uppercase text-[10px] font-bold block mb-1">
                  Operational Directive Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Outline inundation extent, levee breach status, and critical coordination boundaries..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none focus:border-cyan font-sans"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-cyan hover:bg-cyan/90 text-slate-950 font-bold shadow-md"
                >
                  {saving ? 'Saving...' : editingEvent ? 'Update Declaration' : 'Declare Scenario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

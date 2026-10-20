import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { ResponderRecord } from '../types';
import { 
  ShieldAlert, 
  Plus, 
  Radio, 
  Phone, 
  Clock, 
  LifeBuoy, 
  Building2, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle,
  Search,
  ExternalLink
} from 'lucide-react';

export const RespondersAdminPage: React.FC = () => {
  const [responders, setResponders] = useState<ResponderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    callsign: '',
    lead_name: '',
    unit_type: 'Shallow-Draft Zodiac SAR Boat',
    organization: 'State Disaster Response Force',
    contact_phone: '',
    radio_frequency: 'VHF 156.800 MHz (Tactical 2)',
    current_status: 'available' as ResponderRecord['current_status'],
  });
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await api.getResponders();
      setResponders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!formData.callsign.trim()) {
      setErrorMsg('Tactical callsign is required.');
      return;
    }

    try {
      setSaving(true);
      await api.createResponder(formData);
      await loadData();
      setShowModal(false);
      setFormData({
        callsign: '',
        lead_name: '',
        unit_type: 'Shallow-Draft Zodiac SAR Boat',
        organization: 'State Disaster Response Force',
        contact_phone: '',
        radio_frequency: 'VHF 156.800 MHz (Tactical 2)',
        current_status: 'available',
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to commission responder unit.');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: ResponderRecord['current_status']) => {
    try {
      await api.updateResponderStatus(id, newStatus);
      await loadData();
    } catch (err: any) {
      alert(`Status update failed: ${err.message}`);
    }
  };

  const filtered = responders.filter(r => {
    if (statusFilter !== 'all' && r.current_status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        r.callsign.toLowerCase().includes(q) ||
        r.lead_name.toLowerCase().includes(q) ||
        r.organization.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Field Responders & Tactical Units Roster
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-3xl mt-0.5">
            Credentialed search and rescue units, military evacuation contingents, and partner field teams.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 rounded-xl bg-cyan hover:bg-cyan/90 text-slate-950 font-mono text-xs font-bold flex items-center gap-2 shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Commission Unit</span>
          </button>

          <button
            onClick={loadData}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan transition-colors"
            title="Refresh roster"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 font-mono text-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by callsign, lead officer, or organization..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-white placeholder-slate-500 outline-none focus:border-cyan"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 text-white border border-slate-800 rounded-xl px-3 py-2 outline-none focus:border-cyan cursor-pointer"
          >
            <option value="all">All Operational Statuses</option>
            <option value="available">Available (Ready)</option>
            <option value="on_mission">On Mission</option>
            <option value="maintenance">Maintenance</option>
            <option value="off_duty">Off Duty</option>
          </select>
        </div>
      </div>

      {/* Responder Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
        {loading ? (
          <div className="col-span-2 p-12 text-center text-slate-500">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-cyan" />
            Loading tactical roster...
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-2 p-12 rounded-2xl bg-slate-900 border border-slate-800 text-center text-slate-500">
            No responder units match the specified query.
          </div>
        ) : (
          filtered.map((r) => {
            const isAvail = r.current_status === 'available';
            const isOnMission = r.current_status === 'on_mission';
            return (
              <div
                key={r.id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan/15 border border-cyan/40 text-cyan flex items-center justify-center font-bold text-sm">
                      <LifeBuoy className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white">{r.callsign}</h3>
                      <div className="text-[11px] text-slate-400 font-sans">
                        Lead: <strong className="text-white">{r.lead_name}</strong>
                      </div>
                    </div>
                  </div>

                  <select
                    value={r.current_status}
                    onChange={(e) => handleStatusChange(r.id, e.target.value as any)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border outline-none cursor-pointer ${
                      isAvail
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : isOnMission
                        ? 'bg-cyan/20 text-cyan border-cyan/40'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    <option value="available" className="bg-slate-900 text-white">Available</option>
                    <option value="on_mission" className="bg-slate-900 text-white">On Mission</option>
                    <option value="maintenance" className="bg-slate-900 text-white">Maintenance</option>
                    <option value="off_duty" className="bg-slate-900 text-white">Off Duty</option>
                  </select>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Equipment:</span>
                    <strong className="text-white">{r.unit_type}</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Organization:</span>
                    <span className="text-slate-400 truncate max-w-[200px]">{r.organization}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Radio Net:</span>
                    <strong className="text-cyan">{r.radio_frequency}</strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                  <span>Missions Logged: <strong className="text-white">{r.total_missions}</strong></span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {r.contact_phone}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Commission Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm font-mono text-xs">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-cyan/40 p-6 space-y-4 shadow-modal">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Commission Tactical Responder Unit</h3>
                <p className="text-cyan text-xs">SAR Communications Roster</p>
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
                  Tactical Callsign *
                </label>
                <input
                  type="text"
                  required
                  value={formData.callsign}
                  onChange={(e) => setFormData({ ...formData, callsign: e.target.value })}
                  placeholder="e.g. SWIFT-BRAVO-02"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan uppercase font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 uppercase text-[10px] font-bold block mb-1">
                    Lead Officer Name
                  </label>
                  <input
                    type="text"
                    value={formData.lead_name}
                    onChange={(e) => setFormData({ ...formData, lead_name: e.target.value })}
                    placeholder="e.g. Lt. Jennifer Hayes"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan"
                  />
                </div>

                <div>
                  <label className="text-slate-400 uppercase text-[10px] font-bold block mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={formData.contact_phone}
                    onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                    placeholder="555-019-XXXX"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 uppercase text-[10px] font-bold block mb-1">
                  Unit Equipment Type
                </label>
                <input
                  type="text"
                  value={formData.unit_type}
                  onChange={(e) => setFormData({ ...formData, unit_type: e.target.value })}
                  placeholder="e.g. 6x6 Military Fording Truck"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan"
                />
              </div>

              <div>
                <label className="text-slate-400 uppercase text-[10px] font-bold block mb-1">
                  Parent Organization
                </label>
                <input
                  type="text"
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  placeholder="e.g. State Disaster Response Force"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan"
                />
              </div>

              <div>
                <label className="text-slate-400 uppercase text-[10px] font-bold block mb-1">
                  Assigned Tactical Radio Channel
                </label>
                <input
                  type="text"
                  value={formData.radio_frequency}
                  onChange={(e) => setFormData({ ...formData, radio_frequency: e.target.value })}
                  placeholder="e.g. VHF 156.800 MHz (Tactical 2)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan"
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
                  {saving ? 'Commissioning...' : 'Commission Unit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { useRole } from '../../context/RoleContext';
import { api } from '../../services/api';
import { DistributionRecord, InventoryItem, Facility } from '../../types';
import { 
  Truck, 
  Package, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Plus, 
  Send, 
  ShieldCheck, 
  RefreshCw,
  Search,
  AlertTriangle
} from 'lucide-react';

export const PartnerDistributionPage: React.FC = () => {
  const { partnerOrg } = useRole();
  const [distributions, setDistributions] = useState<DistributionRecord[]>([]);
  const [partnerInventory, setPartnerInventory] = useState<InventoryItem[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  // New Distribution Modal
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    inventory_item_id: '',
    quantity: 10,
    facility_id: '',
    notes: '',
  });
  const [allocating, setAllocating] = useState(false);
  const [allocError, setAllocError] = useState<string | null>(null);

  // Delivery confirmation modal
  const [activeDeliveryRecord, setActiveDeliveryRecord] = useState<DistributionRecord | null>(null);
  const [recipientName, setRecipientName] = useState('');
  const [verifying, setVerifying] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [distData, invData, facData] = await Promise.all([
        api.getDistributions({ organization_name: partnerOrg }),
        api.getInventoryItems({ organization_name: partnerOrg }),
        api.getFacilities()
      ]);
      setDistributions(distData);
      setPartnerInventory(invData);
      setFacilities(facData);
      if (invData.length > 0) {
        setFormData(prev => ({ ...prev, inventory_item_id: invData[0].id }));
      }
      if (facData.length > 0) {
        setFormData(prev => ({ ...prev, facility_id: facData[0].id }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [partnerOrg]);

  const handleCreateAllocation = async (e: React.FormEvent) => {
    e.preventDefault();
    setAllocError(null);

    const item = partnerInventory.find(i => i.id === formData.inventory_item_id);
    if (!item) {
      setAllocError('Please select a valid inventory supply.');
      return;
    }
    if (formData.quantity <= 0) {
      setAllocError('Quantity must be greater than zero.');
      return;
    }
    if (formData.quantity > item.quantity) {
      setAllocError(`Quantity (${formData.quantity}) exceeds available stock (${item.quantity} ${item.unit}).`);
      return;
    }

    try {
      setAllocating(true);
      const fac = facilities.find(f => f.id === formData.facility_id);

      await api.createDistribution({
        idempotency_key: `idem-partner-${Date.now()}`,
        facility_id: formData.facility_id,
        facility_name: fac?.name,
        inventory_item_id: item.id,
        quantity: Number(formData.quantity),
        notes: `Partner allocated by ${partnerOrg}. ${formData.notes}`,
      });

      await loadData();
      setShowModal(false);
    } catch (err: any) {
      setAllocError(err.message || 'Allocation failed.');
    } finally {
      setAllocating(false);
    }
  };

  const handleUpdateStatus = async (distId: string, nextStatus: 'dispatched' | 'delivered', recipient?: string) => {
    try {
      await api.updateDistributionStatus(distId, nextStatus, recipient);
      await loadData();
      setActiveDeliveryRecord(null);
      setRecipientName('');
    } catch (err: any) {
      alert(`Update failed: ${err.message}`);
    }
  };

  const filteredDistributions = distributions.filter(d => {
    if (statusFilter !== 'all' && d.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight">
            Partner Distribution Console
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Dispatch relief supplies from <strong className="text-amber-400">{partnerOrg}</strong> inventory
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-xs font-bold flex items-center gap-2 shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Dispatch Manifest</span>
          </button>

          <button
            onClick={loadData}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-amber-400 transition-colors"
            title="Refresh distributions"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 font-mono text-xs">
        {['all', 'allocated', 'dispatched', 'delivered'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-xl border capitalize transition-all ${
              statusFilter === st
                ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            {st} ({distributions.filter(d => st === 'all' || d.status === st).length})
          </button>
        ))}
      </div>

      {/* Manifests Ledger */}
      <div className="space-y-3 font-mono text-xs">
        {loading ? (
          <div className="p-8 text-center text-slate-500">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-amber-400" />
            Loading partner manifests...
          </div>
        ) : filteredDistributions.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center text-slate-500 space-y-2">
            <Truck className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-sm font-bold text-slate-300">No manifests in this view</p>
            <p className="text-xs text-slate-500">
              Create a new dispatch manifest using {partnerOrg} inventory supplies.
            </p>
          </div>
        ) : (
          filteredDistributions.map((dist) => (
            <div
              key={dist.id}
              className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white font-sans">{dist.item_name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {dist.quantity} {dist.unit}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Manifest ID: <strong>{dist.id}</strong> • Stock Item: {dist.inventory_item_id}
                  </div>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${
                    dist.status === 'delivered'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : dist.status === 'dispatched'
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  }`}
                >
                  {dist.status}
                </span>
              </div>

              {/* Destination & Routing */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 space-y-1">
                <div className="flex items-center gap-1.5 text-xs">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    Destination: <strong>{dist.facility_name || dist.incident_ref || 'Field Delivery Point'}</strong>
                  </span>
                </div>
                {dist.notes && (
                  <p className="text-[11px] text-slate-400 font-sans italic">"{dist.notes}"</p>
                )}
              </div>

              {/* Status History & Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                <div className="flex items-center gap-3">
                  {dist.dispatched_at && (
                    <span>Dispatched: {new Date(dist.dispatched_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  )}
                  {dist.delivered_at && (
                    <span className="text-emerald-400">
                      Delivered: {new Date(dist.delivered_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                  {dist.recipient_name && (
                    <span>Signed: <strong className="text-white">{dist.recipient_name}</strong></span>
                  )}
                </div>

                {/* Transition Action Buttons */}
                <div className="flex items-center gap-2">
                  {dist.status === 'allocated' && (
                    <button
                      onClick={() => handleUpdateStatus(dist.id, 'dispatched')}
                      className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all"
                    >
                      Record Dispatch
                    </button>
                  )}

                  {dist.status === 'dispatched' && (
                    <button
                      onClick={() => {
                        setActiveDeliveryRecord(dist);
                        setRecipientName('');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all flex items-center gap-1"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Verify Delivery Receipt</span>
                    </button>
                  )}

                  {dist.status === 'delivered' && (
                    <span className="text-emerald-400 flex items-center gap-1 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Verify Delivery Receipt Modal */}
      {activeDeliveryRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm font-mono text-xs">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-emerald-500/40 p-6 space-y-4 shadow-modal">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Confirm Delivery Receipt</h3>
                <p className="text-emerald-400">{activeDeliveryRecord.item_name}</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveDeliveryRecord(null)}
                className="text-slate-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <div>Quantity: <strong>{activeDeliveryRecord.quantity} {activeDeliveryRecord.unit}</strong></div>
              <div>Destination: <strong>{activeDeliveryRecord.facility_name || 'Field Safe Zone'}</strong></div>
            </div>

            <div>
              <label className="text-slate-400 uppercase text-[10px] font-bold block mb-1">
                Receiving Officer / Shelter Warden Name *
              </label>
              <input
                type="text"
                required
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="e.g. Officer Sunita Rao (Warden)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveDeliveryRecord(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!recipientName.trim()}
                onClick={() => handleUpdateStatus(activeDeliveryRecord.id, 'delivered', recipientName)}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold disabled:opacity-50"
              >
                Confirm Receipt & Close Manifest
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Allocation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm font-mono text-xs">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-amber-500/40 p-6 space-y-4 shadow-modal">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Create Dispatch Manifest</h3>
                <p className="text-amber-400">Org: {partnerOrg}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            {allocError && (
              <div className="p-3 rounded-xl bg-red-950 border border-red-800 text-red-200">
                {allocError}
              </div>
            )}

            <form onSubmit={handleCreateAllocation} className="space-y-3">
              <div>
                <label className="text-slate-400 uppercase text-[10px] font-bold block mb-1">
                  Source Inventory Item *
                </label>
                <select
                  value={formData.inventory_item_id}
                  onChange={(e) => setFormData({ ...formData, inventory_item_id: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500 cursor-pointer"
                >
                  {partnerInventory.map((item) => (
                    <option key={item.id} value={item.id} className="bg-slate-900">
                      {item.item_name} (Avail: {item.quantity} {item.unit} @ {item.storage_location})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 uppercase text-[10px] font-bold block mb-1">
                    Allocation Quantity *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 uppercase text-[10px] font-bold block mb-1">
                    Destination Facility *
                  </label>
                  <select
                    value={formData.facility_id}
                    onChange={(e) => setFormData({ ...formData, facility_id: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500 cursor-pointer"
                  >
                    {facilities.map((fac) => (
                      <option key={fac.id} value={fac.id} className="bg-slate-900">
                        {fac.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 uppercase text-[10px] font-bold block mb-1">
                  Dispatch Directive Notes
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Priority relief shipment for shelter evacuee intake"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none focus:border-amber-500 font-sans"
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
                  disabled={allocating}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  {allocating ? 'Allocating...' : 'Authorize Dispatch Manifest'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

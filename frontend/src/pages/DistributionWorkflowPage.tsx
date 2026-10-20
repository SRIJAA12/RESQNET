import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import {
  Incident,
  Facility,
  InventoryItem,
  Resource,
  DistributionRecord,
  DistributionStatus
} from '../types';
import {
  Truck,
  Package,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Search,
  Building2,
  Users,
  Clock,
  Send,
  ShieldCheck,
  Check,
  Lock,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

export const DistributionWorkflowPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const preselectedIncidentId = searchParams.get('incident_id');
  const preselectedFacilityId = searchParams.get('facility_id');
  const preselectedItemId = searchParams.get('item_id');

  // Datasets
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [distributions, setDistributions] = useState<DistributionRecord[]>([]);

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Workflow Form State
  const [targetType, setTargetType] = useState<'incident' | 'facility'>('incident');
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>('');
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>('');
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(50);
  const [selectedCarrierId, setSelectedCarrierId] = useState<string>('');
  const [distributionNotes, setDistributionNotes] = useState('Emergency relief supply dispatch authorized by logistics desk.');

  // Idempotency token generated per form session
  const [idempotencyKey, setIdempotencyKey] = useState<string>(`idem-${Date.now()}`);

  const [submitting, setSubmitting] = useState(false);
  const [successReceipt, setSuccessReceipt] = useState<DistributionRecord | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [incList, facList, invList, resList, distList] = await Promise.all([
        api.getIncidents(),
        api.getFacilities(),
        api.getInventoryItems(),
        api.getResources(),
        api.getDistributions(),
      ]);

      setIncidents(incList);
      setFacilities(facList);
      setInventoryItems(invList);
      setResources(resList);
      setDistributions(distList);

      // Pre-selection logic
      if (preselectedIncidentId) {
        setTargetType('incident');
        const found = incList.find((i) => i.id === preselectedIncidentId || i.reference_code === preselectedIncidentId);
        if (found) setSelectedIncidentId(found.id);
      } else if (preselectedFacilityId) {
        setTargetType('facility');
        const found = facList.find((f) => f.id === preselectedFacilityId);
        if (found) setSelectedFacilityId(found.id);
      } else if (incList.length > 0) {
        // default to first active or critical incident
        const crit = incList.find((i) => i.priority === 'critical' && i.status !== 'resolved');
        setSelectedIncidentId(crit ? crit.id : incList[0].id);
      }

      if (preselectedItemId) {
        const foundItem = invList.find((i) => i.id === preselectedItemId);
        if (foundItem) setSelectedItemId(foundItem.id);
      } else if (invList.length > 0) {
        setSelectedItemId(invList[0].id);
      }

      // Default carrier to first available truck or boat
      const availableCarrier = resList.find((r) => r.status === 'available');
      if (availableCarrier) {
        setSelectedCarrierId(availableCarrier.id);
      }
    } catch (err: any) {
      console.error('Failed to load distribution data:', err);
      setErrorMsg(err.message || 'Failed to load distribution queues.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [preselectedIncidentId, preselectedFacilityId, preselectedItemId]);

  const selectedItem = inventoryItems.find((i) => i.id === selectedItemId);
  const selectedIncident = incidents.find((i) => i.id === selectedIncidentId);
  const selectedFacility = facilities.find((f) => f.id === selectedFacilityId);
  const selectedCarrier = resources.find((r) => r.id === selectedCarrierId);

  // Real-time stock validation
  const isQuantityValid = quantity > 0 && selectedItem && quantity <= selectedItem.quantity;
  const isExceedingStock = selectedItem && quantity > selectedItem.quantity;

  const handleCreateAllocation = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!selectedItem) {
      setErrorMsg('Please select an eligible inventory item.');
      return;
    }

    if (quantity <= 0) {
      setErrorMsg('Allocation quantity must be greater than zero.');
      return;
    }

    if (quantity > selectedItem.quantity) {
      setErrorMsg(
        `Allocation Exceeds Available Stock: Requested ${quantity} ${selectedItem.unit}, but only ${selectedItem.quantity} ${selectedItem.unit} are currently stored.`
      );
      return;
    }

    setSubmitting(true);
    try {
      const record = await api.createDistribution({
        idempotency_key: idempotencyKey,
        incident_id: targetType === 'incident' ? selectedIncident?.id : null,
        incident_ref: targetType === 'incident' ? selectedIncident?.reference_code : null,
        facility_id: targetType === 'facility' ? selectedFacility?.id : null,
        facility_name: targetType === 'facility' ? selectedFacility?.name : null,
        inventory_item_id: selectedItem.id,
        quantity: Number(quantity),
        carrier_resource_id: selectedCarrier?.id || null,
        notes: distributionNotes.trim(),
      });

      setSuccessReceipt(record);
      // Generate new idempotency token for future submissions
      setIdempotencyKey(`idem-${Date.now()}`);
      await loadData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create distribution allocation.');
    } finally {
      setSubmitting(false);
    }
  };

  // Status transitions: record dispatch and record delivery receipt
  const handleTransitionStatus = async (distId: string, nextStatus: DistributionStatus) => {
    try {
      await api.updateDistributionStatus(
        distId,
        nextStatus,
        nextStatus === 'dispatched'
          ? 'Cargo manifested and dispatched with transport carrier'
          : 'Receipt confirmed by on-site relief team'
      );
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update distribution status.');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-signalCyan uppercase tracking-widest mb-1">
            <span>OPERATIONS CONTROL</span>
            <span>/</span>
            <span className="text-slate-400">RELIEF DISTRIBUTION WORKFLOW</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Truck className="w-7 h-7 text-signalCyan" />
            Supply Allocation & Delivery Verification
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            End-to-end supply routing: select unmet need, validate storage inventory, prevent double-reduction, and log delivery receipts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surfaceContainer border border-slate-700 text-xs text-slate-300">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Idempotency-Safe Deduction</span>
          </div>

          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surfaceContainer hover:bg-surfaceRaised border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Sync
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-200 text-xs sm:text-sm flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Success Confirmation Modal / Banner */}
      {successReceipt && (
        <div className="p-6 rounded-3xl bg-surfaceContainer border border-emerald-500/60 space-y-4 shadow-2xl animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-950 border border-emerald-500 text-emerald-400 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-white text-lg">
                  Supply Allocation Confirmed & Deducted
                </h3>
                <p className="text-xs text-slate-400">
                  Inventory securely decremented without double-reduction risk.
                </p>
              </div>
            </div>
            <button
              onClick={() => setSuccessReceipt(null)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300"
            >
              Dismiss Receipt
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-midnight p-4 rounded-2xl border border-slate-800">
            <div>
              <span className="text-slate-500 block">Voucher ID:</span>
              <span className="font-mono font-bold text-signalCyan">{successReceipt.id}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Allocated Item:</span>
              <span className="font-bold text-white">
                {successReceipt.quantity} {successReceipt.unit} of {successReceipt.item_name}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Destination:</span>
              <span className="font-semibold text-slate-200">
                {successReceipt.incident_ref || successReceipt.facility_name || 'Emergency Site'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Initial Status:</span>
              <span className="font-bold text-emerald-400 uppercase">{successReceipt.status}</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Form: Left Wizard / Right Summary & Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: 4-Step Allocation Form */}
        <div className="bg-surfaceContainer rounded-3xl p-6 border border-slate-800 space-y-5 shadow-lg">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
              <Package className="w-4 h-4 text-signalCyan" />
              Stage New Relief Allocation
            </h2>
            <span className="text-[10px] text-slate-500 font-mono">
              Idempotency Key: {idempotencyKey.slice(0, 14)}...
            </span>
          </div>

          <form onSubmit={handleCreateAllocation} className="space-y-5 text-xs">
            {/* Step 1: Destination Selection */}
            <div className="space-y-2.5">
              <label className="block text-slate-300 font-bold uppercase tracking-wider text-[11px] font-mono">
                1. Select Unmet Relief Need Destination:
              </label>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTargetType('incident')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    targetType === 'incident'
                      ? 'bg-signalCyan/15 border-signalCyan text-white shadow-sm'
                      : 'bg-midnight border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="font-bold block text-xs">Emergency Field Incident</span>
                  <span className="text-[10px] text-slate-400">Direct citizen distress site</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTargetType('facility')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    targetType === 'facility'
                      ? 'bg-signalCyan/15 border-signalCyan text-white shadow-sm'
                      : 'bg-midnight border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="font-bold block text-xs">Shelter / Hospital Hub</span>
                  <span className="text-[10px] text-slate-400">Facility restock & amenities</span>
                </button>
              </div>

              {targetType === 'incident' ? (
                <div>
                  <label className="block text-slate-400 mb-1">Target Incident (Unserved SOS)</label>
                  <select
                    value={selectedIncidentId}
                    onChange={(e) => setSelectedIncidentId(e.target.value)}
                    aria-label="Select target incident"
                    className="w-full px-3 py-2 rounded-xl bg-midnight border border-slate-700 text-white font-mono text-xs outline-none focus:border-signalCyan"
                  >
                    {incidents.map((inc) => (
                      <option key={inc.id} value={inc.id}>
                        {inc.reference_code} &mdash; [{inc.priority.toUpperCase()}] &mdash; {inc.address_text} ({inc.people_count} people)
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-slate-400 mb-1">Target Shelter or Hospital</label>
                  <select
                    value={selectedFacilityId}
                    onChange={(e) => setSelectedFacilityId(e.target.value)}
                    aria-label="Select target facility"
                    className="w-full px-3 py-2 rounded-xl bg-midnight border border-slate-700 text-white font-mono text-xs outline-none focus:border-signalCyan"
                  >
                    {facilities.map((fac) => (
                      <option key={fac.id} value={fac.id}>
                        {fac.name} &mdash; [{fac.facility_type.toUpperCase()}] &mdash; {fac.current_occupancy}/{fac.capacity_total || 'N/A'} beds
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Step 2: Choose Inventory & Quantity */}
            <div className="space-y-2.5 pt-2 border-t border-slate-800">
              <label className="block text-slate-300 font-bold uppercase tracking-wider text-[11px] font-mono">
                2. Select Inventory Item & Quantity:
              </label>

              <div>
                <label className="block text-slate-400 mb-1">Source Inventory Item</label>
                <select
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                  aria-label="Select source inventory item"
                  className="w-full px-3 py-2 rounded-xl bg-midnight border border-slate-700 text-white font-mono text-xs outline-none focus:border-signalCyan"
                >
                  {inventoryItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.item_name} &mdash; Available: {item.quantity} {item.unit} ({item.storage_location})
                    </option>
                  ))}
                </select>
              </div>

              {selectedItem && (
                <div className="p-3 rounded-xl bg-midnight border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Storage Hub:</span>
                    <span className="font-semibold text-white">{selectedItem.storage_location}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block text-[11px]">Available Stock:</span>
                    <span className="font-black text-emerald-400 font-mono text-sm">
                      {selectedItem.quantity} {selectedItem.unit}
                    </span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">
                  Enter Dispatch Quantity ({selectedItem?.unit || 'units'}) *
                </label>
                <input
                  type="number"
                  min="1"
                  max={selectedItem?.quantity || 9999}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className={`w-full px-3 py-2 rounded-xl bg-midnight border text-white font-mono font-bold text-sm outline-none ${
                    isExceedingStock
                      ? 'border-rose-500 focus:border-rose-400 text-rose-300'
                      : 'border-slate-700 focus:border-signalCyan'
                  }`}
                  required
                />
              </div>

              {isExceedingStock && (
                <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-300 text-[11px] flex items-center gap-1.5 font-bold">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                  Allocation Exceeds Available Stock: Requested {quantity} {selectedItem.unit}, but only {selectedItem.quantity} are in storage.
                </div>
              )}
            </div>

            {/* Step 3: Carrier & Instructions */}
            <div className="space-y-2.5 pt-2 border-t border-slate-800">
              <label className="block text-slate-300 font-bold uppercase tracking-wider text-[11px] font-mono">
                3. Logistics Carrier & Instructions:
              </label>

              <div>
                <label className="block text-slate-400 mb-1">Assigned Transport Vehicle (Optional)</label>
                <select
                  value={selectedCarrierId}
                  onChange={(e) => setSelectedCarrierId(e.target.value)}
                  aria-label="Select transport vehicle"
                  className="w-full px-3 py-2 rounded-xl bg-midnight border border-slate-700 text-white font-mono text-xs outline-none focus:border-signalCyan"
                >
                  <option value="">No vehicle assigned (Staged at depot)</option>
                  {resources.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} &mdash; [{r.status.toUpperCase()}] &mdash; {r.resource_type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Operational Voucher Remarks</label>
                <textarea
                  rows={2}
                  value={distributionNotes}
                  onChange={(e) => setDistributionNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-midnight border border-slate-700 text-white text-xs outline-none focus:border-signalCyan"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || !isQuantityValid}
              className="w-full py-3.5 px-4 rounded-xl bg-signalCyan hover:bg-signalCyan/90 disabled:opacity-50 text-midnight font-black text-sm shadow-xl shadow-signalCyan/15 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              {submitting ? 'Verifying Stock & Locking...' : 'Authorize Supply Allocation'}
            </button>
          </form>
        </div>

        {/* Right Column: Active Distributions & Delivery Verification Ledger */}
        <div className="bg-surfaceContainer rounded-3xl p-6 border border-slate-800 space-y-4 shadow-lg flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
                <Truck className="w-4 h-4 text-signalCyan" />
                Active Distribution Ledger & Delivery Receipts
              </h2>
              <span className="text-[10px] text-slate-500 font-mono">
                {distributions.length} active manifests
              </span>
            </div>

            <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
              {distributions.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  No active distribution records found.
                </div>
              ) : (
                distributions.map((dist) => (
                  <div
                    key={dist.id}
                    className="p-4 rounded-2xl bg-midnight border border-slate-800 space-y-2 text-xs transition-all hover:border-slate-700"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-signalCyan">
                        {dist.id}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          dist.status === 'delivered'
                            ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                            : dist.status === 'dispatched'
                            ? 'bg-blue-950/80 text-blue-300 border border-blue-500/40'
                            : 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                        }`}
                      >
                        {dist.status}
                      </span>
                    </div>

                    <div className="text-sm font-bold text-white">
                      {dist.quantity} {dist.unit} &bull; {dist.item_name}
                    </div>

                    <div className="text-[11px] text-slate-300 flex items-center gap-1.5">
                      <span className="text-slate-500">Target:</span>
                      {dist.incident_ref ? (
                        <span className="font-mono text-signalCyan font-bold">
                          {dist.incident_ref} (Field Incident)
                        </span>
                      ) : (
                        <span className="text-white font-medium">
                          {dist.facility_name || 'Relief Facility'}
                        </span>
                      )}
                    </div>

                    {dist.carrier_resource_name && (
                      <div className="text-[10px] text-slate-400">
                        Carrier: <span className="text-slate-200 font-medium">{dist.carrier_resource_name}</span>
                      </div>
                    )}

                    {dist.notes && (
                      <p className="text-[11px] text-slate-400 bg-surfaceContainer p-2 rounded-xl border border-slate-800/80">
                        {dist.notes}
                      </p>
                    )}

                    {/* Workflow status transitions */}
                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(dist.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>

                      <div className="flex items-center gap-2">
                        {dist.status === 'allocated' && (
                          <button
                            type="button"
                            onClick={() => handleTransitionStatus(dist.id, 'dispatched')}
                            className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold transition-all"
                          >
                            Record Dispatch →
                          </button>
                        )}

                        {dist.status === 'dispatched' && (
                          <button
                            type="button"
                            onClick={() => handleTransitionStatus(dist.id, 'delivered')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition-all"
                          >
                            Verify Delivery Receipt ✓
                          </button>
                        )}

                        {dist.status === 'delivered' && (
                          <span className="text-emerald-400 font-mono text-[11px] font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Delivered & Verified
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DistributionWorkflowPage;

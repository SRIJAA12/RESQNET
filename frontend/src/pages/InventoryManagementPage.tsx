import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { InventoryItem, InventoryCategory } from '../types';
import {
  Package,
  Plus,
  RefreshCw,
  Search,
  Filter,
  AlertTriangle,
  Building2,
  Calendar,
  Clock,
  ArrowRight,
  TrendingDown,
  Layers,
  CheckCircle2,
  X,
  Droplet,
  HeartPulse,
  Truck
} from 'lucide-react';

export const InventoryManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState<InventoryCategory>('water');
  const [quantity, setQuantity] = useState<number>(500);
  const [unit, setUnit] = useState('liters');
  const [reorderThreshold, setReorderThreshold] = useState<number>(100);
  const [organization, setOrganization] = useState('Red Cross Relief Network');
  const [storageLocation, setStorageLocation] = useState('Sector 4 Civic Convention Hall');
  const [expiryDate, setExpiryDate] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Stock Adjustment State
  const [adjustItem, setAdjustItem] = useState<InventoryItem | null>(null);
  const [adjustDelta, setAdjustDelta] = useState<number>(50);
  const [adjustReason, setAdjustReason] = useState('Warehouse replenishment shipment arrived');
  const [adjustError, setAdjustError] = useState<string | null>(null);

  const loadInventory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getInventoryItems({
        category: categoryFilter === 'all' ? undefined : categoryFilter,
        search: searchQuery ? searchQuery : undefined,
      });
      setItems(data);
    } catch (err: any) {
      console.error('Failed to load inventory items:', err);
      setError(err.message || 'Failed to load inventory from relief supply service.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, [categoryFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadInventory();
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!itemName.trim()) {
      setFormError('Item name is required.');
      return;
    }
    if (quantity < 0) {
      setFormError('Initial quantity cannot be negative.');
      return;
    }
    if (reorderThreshold < 0) {
      setFormError('Reorder threshold cannot be negative.');
      return;
    }

    setSaving(true);
    try {
      await api.createInventoryItem({
        item_name: itemName.trim(),
        category,
        quantity: Number(quantity),
        unit: unit.trim() || 'units',
        reorder_threshold: Number(reorderThreshold),
        organization_name: organization.trim(),
        storage_location: storageLocation.trim(),
        expiry_date: expiryDate.trim() || null,
      });
      setModalOpen(false);
      setItemName('');
      await loadInventory();
    } catch (err: any) {
      setFormError(err.message || 'Failed to create inventory item');
    } finally {
      setSaving(false);
    }
  };

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustItem) return;
    setAdjustError(null);

    setSaving(true);
    try {
      await api.updateInventoryQuantity(adjustItem.id, Number(adjustDelta), adjustReason);
      setAdjustItem(null);
      await loadInventory();
    } catch (err: any) {
      setAdjustError(err.message || 'Failed to adjust stock quantity');
    } finally {
      setSaving(false);
    }
  };

  // Helper: check expiry status
  const getExpiryStatus = (exp?: string | null) => {
    if (!exp) return { label: 'Non-Perishable', color: 'text-slate-500' };
    const expDate = new Date(exp).getTime();
    const now = Date.now();
    const daysUntilExp = Math.round((expDate - now) / (1000 * 3600 * 24));
    if (daysUntilExp < 0) return { label: `EXPIRED (${exp})`, color: 'text-rose-400 font-bold' };
    if (daysUntilExp < 60) return { label: `Expires soon: ${exp}`, color: 'text-amber-400 font-bold' };
    return { label: exp, color: 'text-slate-300' };
  };

  // Summary Metrics
  const totalStockUnits = items.reduce((sum, i) => sum + i.quantity, 0);
  const lowStockCount = items.filter((i) => i.quantity <= i.reorder_threshold).length;
  const categoriesCount = new Set(items.map((i) => i.category)).size;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-signalCyan uppercase tracking-widest mb-1">
            <span>OPERATIONS CONTROL</span>
            <span>/</span>
            <span className="text-slate-400">RELIEF INVENTORY</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Package className="w-7 h-7 text-signalCyan" />
            Relief Supply & Emergency Inventory
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Real-time stock quantities, storage hubs, reorder thresholds, and expiration controls for water, food, and trauma kits.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadInventory}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surfaceContainer hover:bg-surfaceRaised border border-slate-700/80 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Sync Stock
          </button>

          <Link
            to="/ops/distribution"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surfaceContainer hover:bg-surfaceRaised border border-slate-700 text-xs font-semibold text-signalCyan transition-colors"
          >
            <Truck className="w-4 h-4" />
            Distribution Console
          </Link>

          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-signalCyan hover:bg-signalCyan/90 text-midnight font-bold text-xs transition-all shadow-lg shadow-signalCyan/15 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Add Stock Batch
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-surfaceContainer border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium block">Cataloged SKUs</span>
            <span className="text-2xl font-black text-white">{items.length}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 font-bold">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surfaceContainer border border-blue-500/30 flex items-center justify-between">
          <div>
            <span className="text-xs text-blue-300 font-medium block">Active Categories</span>
            <span className="text-2xl font-black text-blue-400">{categoriesCount} types</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-950/80 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surfaceContainer border border-emerald-500/30 flex items-center justify-between">
          <div>
            <span className="text-xs text-emerald-300 font-medium block">Total Stock Volume</span>
            <span className="text-2xl font-black text-emerald-400">{totalStockUnits.toLocaleString()}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surfaceContainer border border-amber-500/30 flex items-center justify-between">
          <div>
            <span className="text-xs text-amber-300 font-medium block">Low Stock Alerts</span>
            <span className="text-2xl font-black text-amber-400">{lowStockCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-surfaceContainer border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[260px]">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search items by name, storage facility, or agency..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-midnight border border-slate-700/80 focus:border-signalCyan text-xs text-white placeholder-slate-500 outline-none transition-all font-mono"
            />
          </div>
        </form>

        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            aria-label="Filter inventory by supply category"
            className="px-3 py-2 rounded-xl bg-midnight border border-slate-700/80 text-xs text-white outline-none focus:border-signalCyan capitalize"
          >
            <option value="all">All Supply Categories</option>
            <option value="water">Potable Water</option>
            <option value="dry_ration">Dry Rations & Food</option>
            <option value="medical_kit">Medical & Trauma Kits</option>
            <option value="blankets">Thermal Blankets</option>
            <option value="life_vests">Life Vests</option>
            <option value="hygiene_pack">Hygiene Packs</option>
            <option value="generator_fuel">Generator Fuel</option>
          </select>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-950/60 border border-red-500/50 text-red-300 text-xs flex items-center justify-between">
          <span>{error}</span>
          <button onClick={loadInventory} className="underline hover:text-white">
            Retry
          </button>
        </div>
      )}

      {/* Inventory Table */}
      <div className="rounded-2xl bg-surfaceContainer border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-midnight/70 text-slate-400 uppercase font-mono tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Item & Category</th>
                <th className="py-3.5 px-4">Available Quantity</th>
                <th className="py-3.5 px-4">Stock Status & Health</th>
                <th className="py-3.5 px-4">Storage Location Hub</th>
                <th className="py-3.5 px-4">Responsible Organization</th>
                <th className="py-3.5 px-4">Expiry Date</th>
                <th className="py-3.5 px-4">Last Updated</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <Package className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="font-semibold text-slate-400">No inventory supplies match active filters.</p>
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const isLow = item.quantity <= item.reorder_threshold;
                  const expStatus = getExpiryStatus(item.expiry_date);

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-surfaceRaised/50 transition-colors group"
                    >
                      {/* Name & Category */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-white group-hover:text-signalCyan transition-colors">
                            {item.item_name}
                          </span>
                          <span className="capitalize text-[10px] font-mono text-slate-400 mt-0.5">
                            {item.category.replace('_', ' ')}
                          </span>
                        </div>
                      </td>

                      {/* Quantity & Unit */}
                      <td className="py-3.5 px-4 font-mono">
                        <div className="flex items-baseline gap-1">
                          <span className="text-base font-black text-white">
                            {item.quantity.toLocaleString()}
                          </span>
                          <span className="text-slate-400 text-[11px]">{item.unit}</span>
                        </div>
                      </td>

                      {/* Stock Health */}
                      <td className="py-3.5 px-4">
                        {isLow ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-600/40 text-[10px] font-bold">
                            <AlertTriangle className="w-3 h-3" />
                            Low (Threshold: {item.reorder_threshold})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 text-[10px] font-semibold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            Adequate Stock
                          </span>
                        )}
                      </td>

                      {/* Storage Hub */}
                      <td className="py-3.5 px-4 text-slate-300 max-w-xs">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                          <span className="truncate">{item.storage_location}</span>
                        </div>
                      </td>

                      {/* Organization */}
                      <td className="py-3.5 px-4 text-slate-300 max-w-xs truncate">
                        {item.organization_name}
                      </td>

                      {/* Expiry */}
                      <td className="py-3.5 px-4 font-mono text-[11px] whitespace-nowrap">
                        <span className={expStatus.color}>{expStatus.label}</span>
                      </td>

                      {/* Last Updated */}
                      <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px] whitespace-nowrap">
                        {new Date(item.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setAdjustItem(item);
                              setAdjustDelta(50);
                              setAdjustError(null);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition-colors border border-slate-700"
                          >
                            Adjust
                          </button>

                          <Link
                            to={`/ops/distribution?item_id=${item.id}`}
                            className="px-2.5 py-1 rounded-lg bg-signalCyan/15 hover:bg-signalCyan/30 text-signalCyan font-bold text-[11px] transition-colors border border-signalCyan/30"
                          >
                            Allocate
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-midnight/50 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Showing {items.length} relief inventory items</span>
          <span className="font-mono">Storm Command Logistics Engine</span>
        </div>
      </div>

      {/* Adjust Stock Modal */}
      {adjustItem && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-surfaceContainer border border-slate-700 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-bold text-white text-base">Adjust Stock: {adjustItem.item_name}</h3>
              <button
                onClick={() => setAdjustItem(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-midnight border border-slate-800 text-xs flex justify-between">
              <span className="text-slate-400">Current Stock:</span>
              <span className="font-bold text-white font-mono">{adjustItem.quantity} {adjustItem.unit}</span>
            </div>

            {adjustError && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{adjustError}</span>
              </div>
            )}

            <form onSubmit={handleAdjustStock} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">
                  Adjustment Delta (Positive to add, Negative to deduct) *
                </label>
                <input
                  type="number"
                  value={adjustDelta}
                  onChange={(e) => setAdjustDelta(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-midnight border border-slate-700 text-white font-mono font-bold outline-none focus:border-signalCyan"
                  required
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  New resulting quantity: {adjustItem.quantity + Number(adjustDelta)} {adjustItem.unit}
                </span>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">
                  Adjustment Reason / Operational Voucher *
                </label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Received emergency air-drop cargo"
                  className="w-full px-3 py-2 rounded-xl bg-midnight border border-slate-700 text-white outline-none focus:border-signalCyan"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setAdjustItem(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-signalCyan hover:bg-signalCyan/90 disabled:opacity-50 text-midnight font-bold"
                >
                  {saving ? 'Updating Stock...' : 'Save Stock Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Stock Batch Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-surfaceContainer border border-slate-700 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Package className="w-5 h-5 text-signalCyan" />
                Add New Inventory Batch
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateItem} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-slate-300 mb-1 font-semibold">Item Name *</label>
                  <input
                    type="text"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    placeholder="e.g. Oral Rehydration Solution Packets"
                    className="w-full px-3 py-2 rounded-xl bg-midnight border border-slate-700 text-white outline-none focus:border-signalCyan"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as InventoryCategory)}
                    className="w-full px-3 py-2 rounded-xl bg-midnight border border-slate-700 text-white outline-none focus:border-signalCyan capitalize"
                  >
                    <option value="water">Potable Water</option>
                    <option value="dry_ration">Dry Rations</option>
                    <option value="medical_kit">Medical Kits</option>
                    <option value="blankets">Thermal Blankets</option>
                    <option value="life_vests">Life Vests</option>
                    <option value="hygiene_pack">Hygiene Packs</option>
                    <option value="generator_fuel">Generator Fuel</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Unit of Measure</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="e.g. liters, boxes, packs"
                    className="w-full px-3 py-2 rounded-xl bg-midnight border border-slate-700 text-white outline-none focus:border-signalCyan"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Initial Quantity *</label>
                  <input
                    type="number"
                    min="0"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-midnight border border-slate-700 text-white outline-none focus:border-signalCyan"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Reorder Threshold *</label>
                  <input
                    type="number"
                    min="0"
                    value={reorderThreshold}
                    onChange={(e) => setReorderThreshold(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-midnight border border-slate-700 text-white outline-none focus:border-signalCyan"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Responsible Agency</label>
                  <input
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-midnight border border-slate-700 text-white outline-none focus:border-signalCyan"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Storage Location Hub</label>
                  <input
                    type="text"
                    value={storageLocation}
                    onChange={(e) => setStorageLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-midnight border border-slate-700 text-white outline-none focus:border-signalCyan"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-300 mb-1 font-semibold">Expiry Date (if perishable)</label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-midnight border border-slate-700 text-white outline-none focus:border-signalCyan"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-signalCyan hover:bg-signalCyan/90 disabled:opacity-50 text-midnight font-bold"
                >
                  {saving ? 'Adding Batch...' : 'Add Stock Batch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManagementPage;

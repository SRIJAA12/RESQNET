import React, { useEffect, useState } from 'react';
import { useRole } from '../../context/RoleContext';
import { api } from '../../services/api';
import { InventoryItem } from '../../types';
import { 
  Package, 
  Plus, 
  AlertTriangle, 
  Warehouse, 
  RefreshCw, 
  Clock, 
  SlidersHorizontal,
  CheckCircle2,
  Calendar,
  Search,
  Filter
} from 'lucide-react';

export const PartnerInventoryPage: React.FC = () => {
  const { partnerOrg } = useRole();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  // Adjust stock modal
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [adjustDelta, setAdjustDelta] = useState(0);
  const [adjustReason, setAdjustReason] = useState('');
  const [adjustError, setAdjustError] = useState<string | null>(null);
  const [adjusting, setAdjusting] = useState(false);

  // Register new item modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    item_name: '',
    category: 'water',
    quantity: 100,
    unit: 'boxes',
    reorder_threshold: 20,
    storage_location: '',
    expiry_date: '',
  });
  const [addingItem, setAddingItem] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      // Fetch scoped items for partnerOrg
      const data = await api.getInventoryItems({ organization_name: partnerOrg });
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [partnerOrg]);

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    setAdjustError(null);

    if (adjustDelta === 0) {
      setAdjustError('Please specify a non-zero adjustment delta.');
      return;
    }
    if (!adjustReason.trim()) {
      setAdjustError('Reason for stock adjustment is required.');
      return;
    }

    try {
      setAdjusting(true);
      await api.updateInventoryQuantity(selectedItem.id, adjustDelta, adjustReason);
      await loadData();
      setSelectedItem(null);
      setAdjustDelta(0);
      setAdjustReason('');
    } catch (err: any) {
      setAdjustError(err.message || 'Failed to adjust stock.');
    } finally {
      setAdjusting(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.item_name.trim()) return;

    try {
      setAddingItem(true);
      await api.createInventoryItem({
        ...addForm,
        organization_name: partnerOrg,
        storage_location: addForm.storage_location || `${partnerOrg} Primary Warehouse`,
      });
      await loadData();
      setShowAddModal(false);
      setAddForm({
        item_name: '',
        category: 'water',
        quantity: 100,
        unit: 'boxes',
        reorder_threshold: 20,
        storage_location: '',
        expiry_date: '',
      });
    } catch (err: any) {
      alert(`Failed to add item: ${err.message}`);
    } finally {
      setAddingItem(false);
    }
  };

  const filteredItems = items.filter(i => {
    if (category !== 'all' && i.category !== category) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        i.item_name.toLowerCase().includes(q) ||
        i.storage_location.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const lowStockCount = items.filter(i => i.quantity <= i.reorder_threshold).length;
  const totalUnits = items.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight">
            Partner Relief Inventory
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Managing warehouse buffer for <strong className="text-amber-400">{partnerOrg}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-xs font-bold flex items-center gap-2 shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Register Supply Batch</span>
          </button>

          <button
            onClick={loadData}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-amber-400 transition-colors"
            title="Refresh inventory"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] uppercase text-slate-400 block mb-1">
            Active Catalog Items
          </span>
          <span className="text-2xl font-black text-white">{items.length} SKUs</span>
          <span className="text-[10px] text-slate-500 block mt-1">Dedicated to this NGO</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] uppercase text-slate-400 block mb-1">
            Total Warehouse Units
          </span>
          <span className="text-2xl font-black text-amber-400">{totalUnits.toLocaleString()}</span>
          <span className="text-[10px] text-slate-500 block mt-1">Combined physical stock</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] uppercase text-slate-400 block mb-1">
            Low Stock Alerts
          </span>
          <span className={`text-2xl font-black ${lowStockCount > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
            {lowStockCount} Items
          </span>
          <span className="text-[10px] text-slate-500 block mt-1">Below critical threshold</span>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items or warehouse depot..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-white placeholder-slate-500 outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 font-mono text-xs">
          {['all', 'water', 'medical', 'shelter', 'food', 'generator_fuel'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-xl border capitalize whitespace-nowrap transition-all ${
                category === cat
                  ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              {cat.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-[10px] text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="p-3.5">Item Name & SKU</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Warehouse Depot</th>
                <th className="p-3.5">Available Stock</th>
                <th className="p-3.5">Batch Expiry</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-amber-400" />
                    Fetching partner inventory...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    <Package className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    No relief items found for {partnerOrg} in this view.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isLow = item.quantity <= item.reorder_threshold;
                  return (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5 font-sans">
                        <div className="font-bold text-white text-sm">{item.item_name}</div>
                        <div className="text-[10px] font-mono text-slate-400 mt-0.5">{item.id}</div>
                      </td>

                      <td className="p-3.5 capitalize text-slate-300">
                        {item.category.replace('_', ' ')}
                      </td>

                      <td className="p-3.5 text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <Warehouse className="w-3.5 h-3.5 text-slate-500" />
                          <span>{item.storage_location}</span>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-white text-sm">
                            {item.quantity.toLocaleString()} {item.unit}
                          </span>
                          {isLow && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-red-500/20 text-red-300 border border-red-500/30 flex items-center gap-1">
                              <AlertTriangle className="w-2.5 h-2.5" /> Low
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 block">
                          Threshold: {item.reorder_threshold} {item.unit}
                        </span>
                      </td>

                      <td className="p-3.5 text-slate-400">
                        {item.expiry_date ? (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-500" />
                            <span>{new Date(item.expiry_date).toLocaleDateString()}</span>
                          </div>
                        ) : (
                          <span className="text-slate-600">Non-perishable</span>
                        )}
                      </td>

                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => {
                            setSelectedItem(item);
                            setAdjustDelta(0);
                            setAdjustReason('');
                            setAdjustError(null);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 text-xs font-bold transition-all"
                        >
                          Adjust Stock
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Stock Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-amber-500/40 p-6 space-y-4 shadow-modal font-mono">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Adjust Warehouse Stock</h3>
                <p className="text-xs text-amber-400">{selectedItem.item_name}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="text-slate-500 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            {adjustError && (
              <div className="p-3 rounded-xl bg-red-950 border border-red-800 text-xs text-red-200">
                {adjustError}
              </div>
            )}

            <form onSubmit={handleAdjustSubmit} className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
                Current Stock: <strong>{selectedItem.quantity} {selectedItem.unit}</strong>
              </div>

              <div>
                <label className="text-slate-400 uppercase text-[10px] font-bold block mb-1">
                  Stock Change Delta (+ to replenish, - to write off) *
                </label>
                <input
                  type="number"
                  required
                  value={adjustDelta}
                  onChange={(e) => setAdjustDelta(parseInt(e.target.value) || 0)}
                  placeholder="e.g. +50 or -10"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold text-sm outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-slate-400 uppercase text-[10px] font-bold block mb-1">
                  Audit Reason / Manifest Reference *
                </label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Received new shipment from regional donation hub"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500 font-sans"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adjusting}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  {adjusting ? 'Updating...' : 'Commit Stock Change'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-amber-500/40 p-6 space-y-4 shadow-modal font-mono">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Register Partner Relief Batch</h3>
                <p className="text-xs text-amber-400">Org: {partnerOrg}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-500 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 uppercase text-[10px] font-bold block mb-1">
                  Item Description *
                </label>
                <input
                  type="text"
                  required
                  value={addForm.item_name}
                  onChange={(e) => setAddForm({ ...addForm, item_name: e.target.value })}
                  placeholder="e.g. Pediatric Rehydration Electrolyte Packs"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500 font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 uppercase text-[10px] font-bold block mb-1">
                    Category *
                  </label>
                  <select
                    value={addForm.category}
                    onChange={(e) => setAddForm({ ...addForm, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="water">Water & Purification</option>
                    <option value="medical">Medical & Triage</option>
                    <option value="food">Rations & Food</option>
                    <option value="shelter">Blankets & Shelter</option>
                    <option value="generator_fuel">Generator Fuel</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 uppercase text-[10px] font-bold block mb-1">
                    Initial Stock Count *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={addForm.quantity}
                    onChange={(e) => setAddForm({ ...addForm, quantity: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 uppercase text-[10px] font-bold block mb-1">
                    Unit of Measure *
                  </label>
                  <input
                    type="text"
                    required
                    value={addForm.unit}
                    onChange={(e) => setAddForm({ ...addForm, unit: e.target.value })}
                    placeholder="e.g. boxes, liters, kits"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 uppercase text-[10px] font-bold block mb-1">
                    Reorder Alert Threshold
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={addForm.reorder_threshold}
                    onChange={(e) => setAddForm({ ...addForm, reorder_threshold: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 uppercase text-[10px] font-bold block mb-1">
                  Warehouse Storage Location
                </label>
                <input
                  type="text"
                  value={addForm.storage_location}
                  onChange={(e) => setAddForm({ ...addForm, storage_location: e.target.value })}
                  placeholder={`e.g. ${partnerOrg} Central Depot Bay 4`}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500 font-sans"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingItem}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  {addingItem ? 'Registering...' : 'Register Batch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

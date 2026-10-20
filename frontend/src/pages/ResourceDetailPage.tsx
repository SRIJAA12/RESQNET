import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Resource, ResourceStatus } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import {
  ArrowLeft,
  Truck,
  BatteryMedium,
  Users,
  Phone,
  MapPin,
  Clock,
  Shield,
  LifeBuoy,
  RefreshCw,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  Compass,
  Building2,
  FileText,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export const ResourceDetailPage: React.FC = () => {
  const { resourceId } = useParams<{ resourceId: string }>();
  const navigate = useNavigate();

  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  // Edit State
  const [editOpen, setEditOpen] = useState(false);
  const [editNotes, setEditNotes] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editLead, setEditLead] = useState('');
  const [editStatus, setEditStatus] = useState<ResourceStatus>('available');

  const loadResource = async () => {
    if (!resourceId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.getResource(resourceId);
      setResource(data);
      setEditNotes(data.operational_notes || '');
      setEditPhone(data.contact_phone || '');
      setEditLead(data.responder_lead_name || '');
      setEditStatus(data.status);
    } catch (err: any) {
      console.error('Failed to load resource dossier:', err);
      setError(err.message || `Resource '${resourceId}' could not be found.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResource();
  }, [resourceId]);

  const handleStatusChange = async (newStatus: ResourceStatus) => {
    if (!resource) return;
    setUpdating(true);
    try {
      const updated = await api.updateResourceStatus(
        resource.id,
        newStatus,
        `Availability changed to ${newStatus} by dispatcher`
      );
      setResource(updated);
      setEditStatus(newStatus);
    } catch (err: any) {
      alert(err.message || 'Failed to update availability status.');
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resource) return;
    setUpdating(true);
    try {
      const updated = await api.updateResource(resource.id, {
        status: editStatus,
        operational_notes: editNotes.trim(),
        contact_phone: editPhone.trim(),
        responder_lead_name: editLead.trim(),
      });
      setResource(updated);
      setEditOpen(false);
    } catch (err: any) {
      alert(err.message || 'Failed to update resource specifications.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center space-y-4">
        <RefreshCw className="w-8 h-8 text-signalCyan animate-spin mx-auto" />
        <p className="text-sm text-slate-400">Loading asset telemetry dossier...</p>
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="max-w-2xl mx-auto py-12 space-y-4 text-center">
        <div className="p-6 rounded-2xl bg-surfaceContainer border border-red-500/40 text-red-300">
          <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-2" />
          <h2 className="text-lg font-bold text-white">Asset Record Not Found</h2>
          <p className="text-xs text-slate-400 mt-1">{error || 'Resource not registered in fleet database.'}</p>
          <div className="mt-4">
            <button
              onClick={() => navigate('/ops/resources')}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors"
            >
              Back to Fleet Registry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fadeIn">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Link
              to="/ops/resources"
              className="text-signalCyan hover:underline flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Fleet Registry
            </Link>
            <span>/</span>
            <span className="text-white font-bold">{resource.name}</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {resource.name}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700 capitalize">
              {resource.resource_type.replace('_', ' ')}
            </span>
            <StatusBadge type="resource" value={resource.status} size="md" />
          </div>
        </div>

        {/* Global Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setEditOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surfaceContainer hover:bg-surfaceRaised border border-slate-700 text-xs font-semibold text-slate-200 hover:text-white transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Edit Specs
          </button>

          <Link
            to="/ops/dispatch"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-signalCyan hover:bg-signalCyan/90 text-midnight text-xs font-bold transition-all shadow-lg shadow-signalCyan/15"
          >
            <LifeBuoy className="w-3.5 h-3.5" />
            Assign to Incident
          </Link>
        </div>
      </div>

      {/* Grid: Left Specs & Quick Status / Right Assignment History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Asset Specifications */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Specifications Card */}
          <div className="bg-surfaceContainer rounded-2xl p-6 border border-slate-800 space-y-5 shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
                <Truck className="w-4 h-4 text-signalCyan" />
                Operational Specifications & Capabilities
              </h2>
              <span className="text-xs font-mono text-slate-500">
                Asset ID: {resource.id}
              </span>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-midnight border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Passenger Evac Capacity</span>
                <span className="text-xl font-bold text-white flex items-center gap-1.5 mt-0.5">
                  <Users className="w-4 h-4 text-slate-400" />
                  {resource.passenger_capacity} Persons
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-midnight border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Operating Crew Size</span>
                <span className="text-xl font-bold text-white flex items-center gap-1.5 mt-0.5">
                  <Shield className="w-4 h-4 text-slate-400" />
                  {resource.crew_count} Responders
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-midnight border border-slate-800 col-span-2 sm:col-span-1">
                <span className="text-[11px] text-slate-400 block">Fuel / Battery Status</span>
                <span className="text-xl font-bold text-white flex items-center gap-1.5 mt-0.5">
                  <BatteryMedium className="w-4 h-4 text-emerald-400" />
                  {resource.battery_or_fuel_pct}% Ready
                </span>
              </div>
            </div>

            {/* Organization & Team Lead Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="p-4 rounded-xl bg-midnight border border-slate-800 space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-500" />
                  Responsible Organization
                </span>
                <p className="text-sm font-semibold text-white">
                  {resource.organization_name || 'Riverbend Emergency Fleet Agency'}
                </p>
                <p className="text-[11px] text-slate-400">
                  Authorized relief partner operating under unified command protocol.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-midnight border border-slate-800 space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  Lead Contact & VHF Channel
                </span>
                <p className="text-sm font-semibold text-white">
                  {resource.responder_lead_name || 'Lead Officer Not Assigned'}
                </p>
                <p className="text-[11px] font-mono text-slate-300">
                  {resource.contact_phone || 'Radio Ch. 16 Marine'}
                </p>
              </div>
            </div>

            {/* Location & Coordinates */}
            <div className="p-4 rounded-xl bg-midnight border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-signalCyan" />
                  Staged Geolocation Coordinates
                </span>
                <Link
                  to="/ops/map"
                  className="text-[11px] text-signalCyan hover:underline flex items-center gap-1"
                >
                  <Compass className="w-3 h-3" /> View in Tactical Map
                </Link>
              </div>
              <div className="text-xs font-mono text-slate-300">
                LAT: {resource.latitude.toFixed(6)}° N &bull; LON: {resource.longitude.toFixed(6)}° E &bull; Coordinate Reference EPSG:4326
              </div>
            </div>

            {/* Operational Notes */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                Operational Notes & Equipment Specs:
              </span>
              <div className="p-4 rounded-xl bg-midnight border border-slate-800 text-xs text-slate-200 leading-relaxed">
                {resource.operational_notes || 'Standard municipal relief configuration. No operational limitations flagged.'}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Availability Controls & Assignment History */}
        <div className="space-y-6">
          {/* Availability State Changer */}
          <div className="bg-surfaceContainer rounded-2xl p-5 border border-slate-800 space-y-4 shadow-lg">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
              <Clock className="w-4 h-4 text-signalCyan" />
              Availability Management
            </h3>

            <p className="text-xs text-slate-400">
              Update unit availability to control whether dispatchers can commit this asset to incoming emergency incidents.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleStatusChange('available')}
                disabled={updating || resource.status === 'available'}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  resource.status === 'available'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-midnight hover:bg-surfaceRaised border border-slate-700 text-slate-300'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Available
              </button>

              <button
                type="button"
                onClick={() => handleStatusChange('maintenance')}
                disabled={updating || resource.status === 'maintenance'}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  resource.status === 'maintenance'
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'bg-midnight hover:bg-surfaceRaised border border-slate-700 text-slate-300'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                Maintenance
              </button>

              <button
                type="button"
                onClick={() => handleStatusChange('deployed')}
                disabled={updating || resource.status === 'deployed'}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  resource.status === 'deployed'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-midnight hover:bg-surfaceRaised border border-slate-700 text-slate-300'
                }`}
              >
                <LifeBuoy className="w-3.5 h-3.5" />
                Deployed
              </button>

              <button
                type="button"
                onClick={() => handleStatusChange('decommissioned')}
                disabled={updating || resource.status === 'decommissioned'}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  resource.status === 'decommissioned'
                    ? 'bg-rose-900 text-white shadow-md'
                    : 'bg-midnight hover:bg-surfaceRaised border border-slate-700 text-slate-300'
                }`}
              >
                Stand Down
              </button>
            </div>
          </div>

          {/* Assignment History */}
          <div className="bg-surfaceContainer rounded-2xl p-5 border border-slate-800 space-y-4 shadow-lg">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
                <FileText className="w-4 h-4 text-signalCyan" />
                Mission Assignment History
              </h3>
              <span className="text-[10px] text-slate-500 font-mono">
                {resource.assignment_history?.length || 0} missions
              </span>
            </div>

            <div className="space-y-3">
              {resource.assignment_history && resource.assignment_history.length > 0 ? (
                resource.assignment_history.map((asg) => (
                  <div
                    key={asg.id}
                    className="p-3 rounded-xl bg-midnight border border-slate-800 space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <Link
                        to={`/ops/incidents/${asg.incident_id}`}
                        className="font-mono font-bold text-signalCyan hover:underline flex items-center gap-1"
                      >
                        {asg.incident_ref} <ChevronRight className="w-3 h-3" />
                      </Link>
                      <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold bg-slate-800 text-slate-300">
                        {asg.status}
                      </span>
                    </div>

                    <div className="text-[10px] text-slate-500">
                      Assigned: {new Date(asg.assigned_at).toLocaleString()}
                    </div>

                    {asg.notes && (
                      <p className="text-slate-300 text-[11px] bg-surfaceContainer p-2 rounded-lg border border-slate-800/80">
                        {asg.notes}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-slate-500 text-xs">
                  No mission assignments logged for this asset yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Specifications Modal */}
      {editOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-surfaceContainer border border-slate-700 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-white text-base">Edit Resource Details</h3>
            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Team Lead</label>
                <input
                  type="text"
                  value={editLead}
                  onChange={(e) => setEditLead(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-midnight border border-slate-700 text-white outline-none focus:border-signalCyan"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Contact Phone</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-midnight border border-slate-700 text-white outline-none focus:border-signalCyan"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Availability Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as ResourceStatus)}
                  className="w-full px-3 py-2 rounded-xl bg-midnight border border-slate-700 text-white outline-none focus:border-signalCyan capitalize"
                >
                  <option value="available">Available</option>
                  <option value="deployed">Deployed</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="decommissioned">Decommissioned</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Operational Notes</label>
                <textarea
                  rows={3}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-midnight border border-slate-700 text-white outline-none focus:border-signalCyan"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-4 py-2 rounded-xl bg-signalCyan text-midnight font-bold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceDetailPage;

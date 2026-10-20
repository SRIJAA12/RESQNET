import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Shelter } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { 
  Building2, 
  Users, 
  Zap, 
  HeartPulse, 
  Droplet, 
  Dog, 
  MapPin, 
  Phone,
  RefreshCw,
  Plus,
  Minus
} from 'lucide-react';

export const ShelterOverviewPage: React.FC = () => {
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [loading, setLoading] = useState(true);

  const loadShelters = async () => {
    setLoading(true);
    try {
      const data = await api.getShelters();
      setShelters(data);
    } catch (err) {
      console.error('Failed to load shelters:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShelters();
  }, []);

  const totalCapacity = shelters.reduce((acc, s) => acc + (s.capacity_total || 0), 0);
  const totalOccupied = shelters.reduce((acc, s) => acc + s.current_occupancy, 0);
  const availableBeds = Math.max(0, totalCapacity - totalOccupied);
  const overallOccupancyPct = totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Shelter Registry & Capacity Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Monitor real-time bed capacity, medical facilities, water supplies, and backup power across relief centers.
          </p>
        </div>

        <button
          onClick={loadShelters}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white self-start sm:self-auto"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Capacity Overview Bar */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center sm:text-left">
          <div>
            <span className="text-[11px] font-bold uppercase text-slate-400">Total Shelter Capacity</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-white mt-0.5">{totalCapacity}</div>
            <span className="text-xs text-slate-500">Designated beds</span>
          </div>

          <div>
            <span className="text-[11px] font-bold uppercase text-slate-400">Current Occupants</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-relief-400 mt-0.5">{totalOccupied}</div>
            <span className="text-xs text-slate-500">Sheltered evacuees</span>
          </div>

          <div>
            <span className="text-[11px] font-bold uppercase text-slate-400">Available Beds</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 mt-0.5">{availableBeds}</div>
            <span className="text-xs text-slate-500">Immediate intake capacity</span>
          </div>

          <div>
            <span className="text-[11px] font-bold uppercase text-slate-400">System Occupancy</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-white mt-0.5">{overallOccupancyPct}%</div>
            <span className="text-xs text-slate-500">Average across shelters</span>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="space-y-1 pt-2">
          <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800">
            <div
              className={`h-full transition-all duration-500 ${
                overallOccupancyPct > 90 ? 'bg-emergency-500' : overallOccupancyPct > 75 ? 'bg-amber-500' : 'bg-relief-500'
              }`}
              style={{ width: `${Math.min(100, overallOccupancyPct)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Individual Shelters Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {shelters.map((shelter) => {
          const cap = shelter.capacity_total ?? 0;
          const occupancyPct = cap > 0 ? Math.round((shelter.current_occupancy / cap) * 100) : 0;
          const isFull = cap > 0 && shelter.current_occupancy >= cap;

          return (
            <div
              key={shelter.id}
              className={`p-6 rounded-2xl border transition-all flex flex-col justify-between space-y-5 ${
                isFull
                  ? 'bg-emergency-950/20 border-emergency-800/40'
                  : 'bg-slate-900 border-slate-800'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-base text-white">{shelter.name}</h3>
                  <StatusBadge type="shelter" value={shelter.status} size="sm" />
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">{shelter.address}</span>
                </div>

                {/* Occupancy Meter */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Occupancy</span>
                    <span className="font-bold text-slate-200">
                      {shelter.current_occupancy} / {shelter.capacity_total} ({shelter.available_beds} beds free)
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800/80">
                    <div
                      className={`h-full ${
                        isFull ? 'bg-emergency-500' : occupancyPct > 80 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, occupancyPct)}%` }}
                    />
                  </div>
                </div>

                {/* Amenities Badges */}
                <div className="pt-2 flex flex-wrap gap-2 text-[11px]">
                  {shelter.medical_facilities_available && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-950/70 border border-emerald-800/60 text-emerald-300 font-medium">
                      <HeartPulse className="w-3 h-3 text-emerald-400" /> Medical Clinic
                    </span>
                  )}
                  {shelter.generator_backup && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-950/70 border border-amber-800/60 text-amber-300 font-medium">
                      <Zap className="w-3 h-3 text-amber-400" /> Generator Backup
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-950/70 border border-sky-800/60 text-sky-300 font-medium">
                    <Droplet className="w-3 h-3 text-sky-400" /> {shelter.water_purification_capacity_liters}L Water
                  </span>
                  {shelter.pet_friendly && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-950/70 border border-purple-800/60 text-purple-300 font-medium">
                      <Dog className="w-3 h-3 text-purple-400" /> Pets Allowed
                    </span>
                  )}
                </div>
              </div>

              {/* Shelter Footer Details */}
              <div className="pt-3 border-t border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
                <span>Manager: <strong className="text-slate-300">{shelter.manager_name}</strong></span>
                {shelter.contact_phone && (
                  <span className="font-mono text-slate-400 flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {shelter.contact_phone}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

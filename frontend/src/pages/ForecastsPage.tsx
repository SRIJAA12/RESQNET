import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { ForecastRecord } from '../types';
import { 
  TrendingDown, 
  AlertTriangle, 
  Sparkles, 
  Clock, 
  MapPin, 
  RefreshCw, 
  Info, 
  Sliders, 
  ShieldAlert,
  ArrowUpRight,
  Package,
  Layers
} from 'lucide-react';

export const ForecastsPage: React.FC = () => {
  const [forecasts, setForecasts] = useState<ForecastRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedScenario, setSelectedScenario] = useState('Rapid Levee Crest (+2.4ft @ 18:00)');
  const [sectorFilter, setSectorFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await api.getForecasts();
      setForecasts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredForecasts = forecasts.filter(f => {
    if (sectorFilter !== 'all' && !f.sector_area.toLowerCase().includes(sectorFilter.toLowerCase())) return false;
    if (riskFilter !== 'all' && f.risk_level !== riskFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header & Simulated Advisory Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-amber-500/15 border border-amber-500/40 text-amber-300">
              <Sparkles className="w-3 h-3 text-amber-400" />
              SIMULATED ADVISORY MODEL • DEMO TELEMETRY
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Model: HydroSim-Predictive v3.4
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1">
            Shortage Risk Forecasts & Deficit Projections
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-3xl mt-0.5">
            Predictive machine-learning advisory models estimating impending humanitarian supply deficits across flood sectors.
          </p>
        </div>

        <button
          onClick={loadData}
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan transition-colors self-start sm:self-auto"
          title="Re-run forecast simulations"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan' : ''}`} />
        </button>
      </div>

      {/* Critical Advisory Notice: Never Present AI Predictions as Authoritative Decisions */}
      <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-800/60 text-amber-200 text-xs font-mono space-y-1.5 shadow-lg">
        <div className="flex items-center gap-2 font-bold text-amber-300 uppercase tracking-wider">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Non-Authoritative Advisory Disclaimer</span>
        </div>
        <p className="font-sans leading-relaxed text-amber-200/90">
          <strong>Notice:</strong> Demonstration predictions displayed on this console are <em>simulated analytical projections</em> generated for contingency planning. Model outputs must <strong>never</strong> be presented as authoritative operational decisions or used to deny assistance. All actual relief dispatches and evacuations require direct human Incident Commander verification.
        </p>
      </div>

      {/* Scenario Parameters Controls */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 font-mono text-xs">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan" />
          <span className="text-slate-400 uppercase font-bold text-[10px]">Simulated Hydro Scenario:</span>
          <select
            value={selectedScenario}
            onChange={(e) => setSelectedScenario(e.target.value)}
            className="bg-slate-950 text-white font-bold text-xs border border-slate-800 rounded-xl px-3 py-1.5 outline-none focus:border-cyan cursor-pointer"
          >
            <option value="Rapid Levee Crest (+2.4ft @ 18:00)">
              Scenario Alpha: Rapid Levee Crest (+2.4ft @ 18:00)
            </option>
            <option value="Baseline River Surge (+1.1ft @ 22:00)">
              Scenario Beta: Baseline River Surge (+1.1ft @ 22:00)
            </option>
            <option value="Catastrophic Culvert Breach (+3.8ft Inundation)">
              Scenario Gamma: Catastrophic Culvert Breach (+3.8ft Inundation)
            </option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="bg-slate-950 text-slate-300 text-xs border border-slate-800 rounded-xl px-3 py-1.5 outline-none focus:border-cyan cursor-pointer"
          >
            <option value="all">All Risk Levels</option>
            <option value="critical">Critical Shortages</option>
            <option value="high">High Risk</option>
            <option value="moderate">Moderate Risk</option>
            <option value="stable">Stable Supply</option>
          </select>

          <select
            value={sectorFilter}
            onChange={(e) => setSectorFilter(e.target.value)}
            className="bg-slate-950 text-slate-300 text-xs border border-slate-800 rounded-xl px-3 py-1.5 outline-none focus:border-cyan cursor-pointer"
          >
            <option value="all">All Sectors</option>
            <option value="Sector 4B">Sector 4B (Riverbend)</option>
            <option value="Sector 2">Sector 2 (Lowland)</option>
            <option value="East Pier">East Pier Shelters</option>
            <option value="North Levee">North Levee Camps</option>
          </select>
        </div>
      </div>

      {/* Forecast Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
        {loading ? (
          <div className="col-span-2 p-12 text-center text-slate-500">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-cyan" />
            Executing predictive shortage inference...
          </div>
        ) : filteredForecasts.length === 0 ? (
          <div className="col-span-2 p-12 rounded-2xl bg-slate-900 border border-slate-800 text-center text-slate-500">
            No projected shortages match the selected filter criteria.
          </div>
        ) : (
          filteredForecasts.map((fc) => {
            const isCritical = fc.risk_level === 'critical';
            const isHigh = fc.risk_level === 'high';
            return (
              <div
                key={fc.id}
                className={`p-5 rounded-2xl border transition-all space-y-4 shadow-xl ${
                  isCritical
                    ? 'bg-red-950/20 border-red-800/60'
                    : isHigh
                    ? 'bg-amber-950/20 border-amber-800/60'
                    : 'bg-slate-900 border-slate-800'
                }`}
              >
                {/* Header Row */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white font-sans">{fc.resource_category}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                          isCritical
                            ? 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse'
                            : isHigh
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        }`}
                      >
                        {fc.risk_level} Risk
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-cyan shrink-0" />
                      <span>{fc.sector_area}</span>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-bold text-[11px]">
                    {fc.forecast_horizon}
                  </span>
                </div>

                {/* Supply vs Demand Comparison Gauge */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2.5">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Estimated Demand</span>
                      <strong className="text-sm text-white">{fc.estimated_demand} {fc.unit}</strong>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Available Supply</span>
                      <strong className="text-sm text-cyan">{fc.available_supply} {fc.unit}</strong>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Potential Shortage</span>
                      <strong className={`text-sm ${fc.shortage_gap > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {fc.shortage_gap > 0 ? `-${fc.shortage_gap} ${fc.unit}` : 'Deficit Free'}
                      </strong>
                    </div>
                  </div>

                  {/* Visual deficit bar */}
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden flex">
                    <div
                      className="h-full bg-cyan"
                      style={{
                        width: `${Math.min(100, (fc.available_supply / (fc.estimated_demand || 1)) * 100)}%`
                      }}
                      title="Available Supply"
                    />
                    {fc.shortage_gap > 0 && (
                      <div
                        className="h-full bg-red-500 animate-pulse"
                        style={{
                          width: `${Math.min(100, (fc.shortage_gap / (fc.estimated_demand || 1)) * 100)}%`
                        }}
                        title="Unmet Demand Shortage"
                      />
                    )}
                  </div>
                </div>

                {/* Model Assumptions & Notes */}
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 text-[11px] space-y-1">
                  <span className="text-slate-400 uppercase font-bold text-[10px] block">
                    Underlying Hydrological & Telemetry Assumptions:
                  </span>
                  <p className="text-slate-300 font-sans leading-relaxed">
                    {fc.assumptions}
                  </p>
                </div>

                {/* Footer Metadata */}
                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/80">
                  <span>Engine: {fc.model_version}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Ran: {new Date(fc.model_run_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

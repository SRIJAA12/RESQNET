import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { OpsSettings } from '../types';
import { 
  Sliders, 
  Save, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle2, 
  Radio, 
  Clock, 
  ShieldAlert, 
  Layers,
  Database,
  Lock
} from 'lucide-react';

export const SettingsAdminPage: React.FC = () => {
  const [settings, setSettings] = useState<OpsSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Reset Modal
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState('');
  const [resetting, setResetting] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await api.getSettings();
      setSettings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    try {
      setSaving(true);
      await api.updateSettings(settings);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert(`Failed to save settings: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleResetData = async () => {
    if (resetConfirmText !== 'RESET') return;
    try {
      setResetting(true);
      await api.resetDemoData();
      await loadData();
      setShowResetModal(false);
      setResetConfirmText('');
      setResetDone(true);
      setTimeout(() => setResetDone(false), 5000);
    } catch (err: any) {
      alert(`Reset failed: ${err.message}`);
    } finally {
      setResetting(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="py-20 text-center text-slate-500 font-mono text-xs">
        Loading operational configuration...
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">
          Operations Center Configuration & Thresholds
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Tune algorithmic triage rules, staleness telemetry parameters, and demo state controls.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Operational thresholds updated and audit log entry created.</span>
        </div>
      )}

      {resetDone && (
        <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-300 text-xs font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-amber-400" />
          <span>All simulation incidents, facilities, resources, and inventory have been reset to initial demo seeds.</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 font-mono text-xs shadow-xl">
        {/* Section 1: Algorithmic Triage Rules */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-cyan font-bold uppercase text-[11px] border-b border-slate-800 pb-2">
            <Sliders className="w-4 h-4" />
            <span>Algorithmic Triage & Priority Scoring Rules</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-400 uppercase text-[10px] font-bold block mb-1">
                Critical Priority Score Threshold (0 - 100)
              </label>
              <input
                type="number"
                min="50"
                max="95"
                required
                value={settings.auto_triage_critical_threshold}
                onChange={(e) => setSettings({ ...settings, auto_triage_critical_threshold: parseInt(e.target.value) || 80 })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold text-sm outline-none focus:border-cyan"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Incidents scoring above this threshold trigger automatic Critical dispatch alert.
              </span>
            </div>

            <div>
              <label className="text-slate-400 uppercase text-[10px] font-bold block mb-1">
                Stale Facility Census Warning Window (Hours)
              </label>
              <input
                type="number"
                min="1"
                max="24"
                required
                value={settings.stale_data_warning_hours}
                onChange={(e) => setSettings({ ...settings, stale_data_warning_hours: parseInt(e.target.value) || 4 })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold text-sm outline-none focus:border-cyan"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Shelters without verified headcounts for longer than this will show amber stale flags.
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Communications & Radio Nets */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-cyan font-bold uppercase text-[11px] border-b border-slate-800 pb-2">
            <Radio className="w-4 h-4" />
            <span>Tactical Communications & Emergency Channels</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-400 uppercase text-[10px] font-bold block mb-1">
                Default Incident Dispatch Net Frequency
              </label>
              <input
                type="text"
                required
                value={settings.default_radio_channel}
                onChange={(e) => setSettings({ ...settings, default_radio_channel: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan"
              />
            </div>

            <div>
              <label className="text-slate-400 uppercase text-[10px] font-bold block mb-1">
                Disaster Declaration Authority
              </label>
              <input
                type="text"
                required
                value={settings.disaster_declaration_authority}
                onChange={(e) => setSettings({ ...settings, disaster_declaration_authority: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan"
              />
            </div>
          </div>
        </div>

        {/* Section 3: AI Advisory Engine */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-cyan font-bold uppercase text-[11px] border-b border-slate-800 pb-2">
            <ShieldAlert className="w-4 h-4" />
            <span>Advisory AI & Predictive Shortage Inference</span>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <div>
              <strong className="text-white text-xs block font-sans">
                Enable Machine-Learning Advisory Suggestions
              </strong>
              <span className="text-[11px] text-slate-400 font-sans">
                Generates non-authoritative recommendations for dispatchers on triage cards.
              </span>
            </div>

            <button
              type="button"
              onClick={() => setSettings({ ...settings, enable_ai_advisory: !settings.enable_ai_advisory })}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                settings.enable_ai_advisory ? 'bg-cyan' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-slate-950 transition-transform ${
                  settings.enable_ai_advisory ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Save Actions Bar */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-cyan hover:bg-cyan/90 text-slate-950 font-bold flex items-center gap-2 shadow-lg transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Updating Parameters...' : 'Save Configuration'}</span>
          </button>
        </div>
      </form>

      {/* Danger Zone: Reset Demo Data */}
      <div className="p-6 rounded-2xl bg-red-950/20 border border-red-800/40 space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-red-400 font-bold uppercase">
            <AlertTriangle className="w-4 h-4" />
            <span>Simulation Reset & Disaster Scenario Re-seed</span>
          </div>
          <span className="text-[10px] text-red-400/80 font-bold uppercase">Consequential Action</span>
        </div>

        <p className="text-slate-400 text-xs font-sans leading-relaxed">
          Restore the initial demo simulation state. This action purges all simulated test dispatches, new items, and census audits, returning the system back to the default flood response scenario.
        </p>

        <button
          type="button"
          onClick={() => setShowResetModal(true)}
          className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold flex items-center gap-1.5 transition-all shadow-md"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset Simulation Buffer</span>
        </button>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm font-mono text-xs">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-red-500/50 p-6 space-y-4 shadow-modal">
            <div className="flex items-center gap-2 text-red-400 font-bold text-sm uppercase">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>Confirm Complete Data Re-Seed</span>
            </div>

            <p className="text-slate-300 font-sans leading-relaxed">
              This will overwrite all active incidents, resources, allocations, and user profiles with clean factory simulation seed data.
            </p>

            <div className="space-y-1">
              <label className="text-slate-400 uppercase text-[10px] font-bold block">
                Type <strong>RESET</strong> to confirm:
              </label>
              <input
                type="text"
                value={resetConfirmText}
                onChange={(e) => setResetConfirmText(e.target.value)}
                placeholder="RESET"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold outline-none focus:border-red-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowResetModal(false);
                  setResetConfirmText('');
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={resetConfirmText !== 'RESET' || resetting}
                onClick={handleResetData}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold disabled:opacity-40 transition-all shadow-lg"
              >
                {resetting ? 'Resetting...' : 'Confirm Factory Re-Seed'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

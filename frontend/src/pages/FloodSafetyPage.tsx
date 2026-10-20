import React from 'react';
import { Link } from 'react-router-dom';
import {
  LifeBuoy,
  AlertTriangle,
  ZapOff,
  Flame,
  Droplet,
  Radio,
  Sun,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  PhoneCall,
  MapPin,
  ExternalLink
} from 'lucide-react';

export const FloodSafetyPage: React.FC = () => {
  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-10 animate-fadeIn">
      {/* Simulation Advisory Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-amber-900 shadow-sm">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm">
          <p className="font-bold">TRAINING & FLOOD PREPAREDNESS RESOURCE</p>
          <p className="mt-0.5 text-amber-800">
            These guidelines are curated according to national disaster management standards. In an immediate life-threatening emergency, call 911 or emergency services immediately.
          </p>
        </div>
      </div>

      {/* Header Hero */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold uppercase tracking-wider">
          <LifeBuoy className="w-3.5 h-3.5" /> Emergency Survival Protocol
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Flood Safety & Survival Guide
        </h1>
        <p className="text-slate-600 text-sm sm:text-base">
          Crucial life-saving actions if you are experiencing rising waters, power outages, or stranded conditions in Riverbend Metro.
        </p>
      </div>

      {/* Quick Action Emergency Callouts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-red-50 border border-red-200 rounded-3xl p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-red-600">Urgent Danger</span>
            <h2 className="text-xl font-extrabold text-red-950">Trapped or Rising Water?</h2>
            <p className="text-xs sm:text-sm text-red-800">
              Submit your exact coordinates and status to the RESQNET dispatch queue for boat extraction.
            </p>
          </div>
          <Link
            to="/request-assistance"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-md transition-colors"
          >
            Request Emergency Assistance
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="bg-teal-50 border border-teal-200 rounded-3xl p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700">Existing Report</span>
            <h2 className="text-xl font-extrabold text-teal-950">Track Ongoing Extraction</h2>
            <p className="text-xs sm:text-sm text-teal-800">
              Check if an amphibious craft or medical team has been dispatched to your reference code.
            </p>
          </div>
          <Link
            to="/track-request"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm shadow-md transition-colors"
          >
            Track Assistance Request
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* 4 Core Pillars of Flood Safety */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900">Immediate Survival Priorities</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 1. Rooftop & Vertical Evacuation */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-bold">
              1
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Rooftop Signaling & Vertical Evacuation
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span><strong>Never stay trapped in an enclosed attic.</strong> If water rises into the top floor, move onto the roof through a hatch or dormer window. Take a glass-breaker or hammer.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span><strong>Signaling Aircraft & Boats:</strong> Lay out a brightly colored sheet or tarp (orange, red, yellow). At night, flash a torch or smartphone light continuously in groups of 3 (SOS signal).</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span><strong>Wear bright clothing</strong> and stay in high-contrast positions where aerial drones and helicopter thermal cameras can identify human silhouettes.</span>
              </li>
            </ul>
          </div>

          {/* 2. Electrical & Utility Safety */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center font-bold">
              2
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Electrical Breakers & Gas Isolation
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <ZapOff className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span><strong>Do not touch electrical equipment</strong> or breaker panels if you are standing in water or wet surroundings. Electrocution is a primary flood hazard.</span>
              </li>
              <li className="flex items-start gap-2">
                <Flame className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span><strong>Turn off gas lines</strong> if safe to do so before water reaches main valves. If you smell gas, leave the structure immediately without operating switches.</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span><strong>Avoid downed power cables.</strong> Floodwater conducts electricity over significant distances. Keep at least 30 feet away from any fallen wires.</span>
              </li>
            </ul>
          </div>

          {/* 3. Water & Food Contamination */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold">
              3
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Clean Water & Disease Prevention
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <Droplet className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span><strong>Never drink tap water</strong> in an active flood zone until local authorities clear it. Floodwaters contaminate municipal lines and shallow wells with sewage and petrochemicals.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span><strong>Purify emergency water:</strong> Boil vigorously for at least 1 full minute, or use chlorine purification tablets (follow manufacturer dosage).</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span><strong>Discard all food</strong> that has come into contact with floodwaters, including canned goods with damaged seals or bulging tops.</span>
              </li>
            </ul>
          </div>

          {/* 4. Movement & Navigation Warnings */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center font-bold">
              4
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              "Turn Around, Don't Drown"
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <span><strong>6 inches of fast-moving water</strong> can sweep an adult off their feet. 12 inches will float and carry away most passenger sedans and SUVs.</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <span><strong>Submerged roadways often hide collapsed bridges</strong>, missing manhole covers, and severe underwater currents. Never drive past barricades.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span><strong>If your vehicle is surrounded:</strong> Abandon it immediately and scramble to higher ground before electrical door locks short-circuit.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Grab-and-Go Emergency Kit Checklist */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 space-y-6">
        <div>
          <span className="text-xs font-mono font-bold tracking-wider text-teal-400 uppercase">
            Emergency Preparedness
          </span>
          <h2 className="text-2xl font-extrabold mt-1">
            Rapid Evacuation "Go-Bag" Checklist
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            If responders arrive or you must abandon your dwelling for an emergency shelter, take these essentials:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-2">
            <span className="font-bold text-teal-300 block">Medical & Hygiene</span>
            <ul className="text-slate-300 space-y-1">
              <li>• 7-day supply of prescription medications</li>
              <li>• First aid kit, antiseptic wipes</li>
              <li>• Insulin cooling pack if applicable</li>
              <li>• Inhalers & EpiPens</li>
            </ul>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-2">
            <span className="font-bold text-teal-300 block">Critical Documents</span>
            <ul className="text-slate-300 space-y-1">
              <li>• Passports, IDs & birth certificates</li>
              <li>• Property insurance & deeds in ziplock</li>
              <li>• Emergency contact phone numbers on paper</li>
              <li>• Cash in small denominations</li>
            </ul>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-2">
            <span className="font-bold text-teal-300 block">Tech & Comms</span>
            <ul className="text-slate-300 space-y-1">
              <li>• Mobile phone & waterproof pouch</li>
              <li>• Fully charged high-capacity power bank</li>
              <li>• High-decibel emergency whistle</li>
              <li>• LED torch with spare batteries</li>
            </ul>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-2">
            <span className="font-bold text-teal-300 block">Food & Hydration</span>
            <ul className="text-slate-300 space-y-1">
              <li>• Sealed bottled water (2L per person)</li>
              <li>• High-protein snack bars / dry rations</li>
              <li>• Infant formula and baby bottles</li>
              <li>• Pet food and sturdy leash</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloodSafetyPage;

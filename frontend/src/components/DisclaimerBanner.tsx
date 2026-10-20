import React, { useState } from 'react';
import { AlertCircle, X, ChevronRight, Info } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <>
      <div className="bg-surface/95 border-b border-border/80 text-text-secondary px-4 py-1.5 text-xs font-sans flex items-center justify-between sticky top-0 z-50 backdrop-blur-md transition-all">
        <div className="flex items-center gap-2 max-w-7xl mx-auto flex-1 min-w-0">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber/15 text-amber text-[11px] font-medium shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-amber animate-pulse" />
            Simulation mode
          </span>
          <span className="text-text-secondary truncate text-[12px]">
            Synthetic demonstration data only. Not connected to live emergency services.
          </span>
          <button
            onClick={() => setDetailsOpen(true)}
            className="text-cyan hover:text-cloud-white font-medium text-[11px] underline underline-offset-2 shrink-0 ml-1 transition-colors"
          >
            Learn more
          </button>
        </div>

        <button
          onClick={() => setDismissed(true)}
          className="text-text-muted hover:text-cloud-white p-1 rounded transition-colors ml-2"
          aria-label="Dismiss banner"
          title="Dismiss notification"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Expandable Safety Disclaimer Modal */}
      {detailsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-panel bg-deep-slate border border-border shadow-modal p-6 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-control bg-amber/20 text-amber flex items-center justify-center">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base text-cloud-white">
                    Emergency Service Notice
                  </h3>
                  <p className="text-xs text-text-muted">Demonstration Prototype</p>
                </div>
              </div>
              <button
                onClick={() => setDetailsOpen(false)}
                className="text-text-muted hover:text-cloud-white p-1 rounded transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-text-secondary leading-relaxed border-t border-border/60 pt-3">
              <p>
                <strong className="text-cloud-white">RESQNET</strong> is an experimental disaster-relief coordination prototype built to demonstrate AI-assisted triage, GIS situational telemetry, and human-in-the-loop dispatch workflows.
              </p>
              <div className="p-3 rounded-control bg-midnight/70 border border-border/80 text-[12px] space-y-1">
                <span className="font-semibold text-coral block">
                  In a real life-threatening emergency:
                </span>
                <span className="text-cloud-white block">
                  Please call your local emergency phone number immediately (e.g. 911 / 112 / 999). This software does not dispatch real first responders.
                </span>
              </div>
              <p className="text-[11px] text-text-muted">
                All citizen calls, responder locations, flood zones, and facilities displayed are simulated scenarios.
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setDetailsOpen(false)}
                className="w-full py-2 px-4 rounded-control bg-surface hover:bg-border border border-border text-xs font-medium text-cloud-white transition-colors"
              >
                Understood & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

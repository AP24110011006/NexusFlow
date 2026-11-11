import React from 'react';
import { Activity, ShieldCheck, Zap, Radio } from 'lucide-react';

/**
 * QuickStatsWidget - Compact real-time telemetry KPI aggregation strip
 * Authored by: Harshitha (Frontend Role — Analytics, Widgets & QA)
 * Week 1 Deliverable — Visual Telemetry Analytics
 */
export default function QuickStatsWidget({
  streamCount = 0,
  rulesActive = 4,
  anomalyRate = '0.0%',
  connectionStatus = 'Healthy',
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
      <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-800/40">
        <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
          <Activity className="w-4 h-4" />
        </div>
        <div>
          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">
            Ingested Packets
          </span>
          <span className="text-sm font-bold text-white font-mono">{streamCount}</span>
        </div>
      </div>

      <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-800/40">
        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
          <Zap className="w-4 h-4" />
        </div>
        <div>
          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">
            Active Rules
          </span>
          <span className="text-sm font-bold text-white font-mono">{rulesActive}</span>
        </div>
      </div>

      <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-800/40">
        <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
          <Radio className="w-4 h-4" />
        </div>
        <div>
          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">
            Anomaly Rate
          </span>
          <span className="text-sm font-bold text-amber-300 font-mono">{anomalyRate}</span>
        </div>
      </div>

      <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-800/40">
        <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div>
          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">
            Link Integrity
          </span>
          <span className="text-sm font-bold text-emerald-400 font-mono">{connectionStatus}</span>
        </div>
      </div>
    </div>
  );
}

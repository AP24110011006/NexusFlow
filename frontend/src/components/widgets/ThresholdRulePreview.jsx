import React from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

/**
 * Interactive Visual Threshold & Rule Breach Preview Widget
 * Authored by: Harshitha (Frontend Analytics & Visualizations Role)
 * Milestone: Week 1 Deliverable — Visual IoT Telemetry Monitoring
 * Organization: Infotact Solutions
 */
export default function ThresholdRulePreview({
  currentValue = 42.5,
  threshold = 40.0,
  min = 0,
  max = 100,
  metric = 'Temperature',
  unit = '°C',
  operator = '>',
  className = '',
}) {
  const clampedVal = Math.min(Math.max(currentValue, min), max);
  const currentPct = ((clampedVal - min) / (max - min)) * 100;
  const thresholdPct = Math.min(Math.max(((threshold - min) / (max - min)) * 100, 0), 100);

  const isBreached =
    operator === '>'
      ? currentValue > threshold
      : operator === '<'
      ? currentValue < threshold
      : currentValue >= threshold;

  return (
    <div
      className={`p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-100 backdrop-blur-md space-y-3 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {metric} Threshold Gauge
        </span>
        <div className="flex items-center gap-1.5 text-xs font-bold">
          {isBreached ? (
            <span className="inline-flex items-center gap-1 text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
              <AlertTriangle className="w-3.5 h-3.5" />
              BREACHED ({operator} {threshold}{unit})
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <CheckCircle2 className="w-3.5 h-3.5" />
              NORMAL
            </span>
          )}
        </div>
      </div>

      {/* Horizontal Threshold Bar */}
      <div className="relative pt-3 pb-2">
        <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
          {/* Safe Zone */}
          <div
            style={{ width: `${thresholdPct}%` }}
            className={`transition-all duration-300 ${
              operator === '<' ? 'bg-rose-500/60' : 'bg-emerald-500/60'
            }`}
          />
          {/* Critical Breach Zone */}
          <div
            style={{ width: `${100 - thresholdPct}%` }}
            className={`transition-all duration-300 ${
              operator === '<' ? 'bg-emerald-500/60' : 'bg-rose-500/60'
            }`}
          />
        </div>

        {/* Threshold Cutoff Marker */}
        <div
          className="absolute top-1 bottom-0 w-0.5 bg-amber-400 z-10 -translate-x-1/2"
          style={{ left: `${thresholdPct}%` }}
        >
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] font-mono text-amber-400 font-bold whitespace-nowrap">
            Limit: {threshold}
          </div>
        </div>

        {/* Current Sensor Value Needle */}
        <div
          className="absolute top-2.5 z-20 -translate-x-1/2 transition-all duration-300"
          style={{ left: `${currentPct}%` }}
        >
          <div
            className={`w-3.5 h-3.5 rounded-full border-2 border-white shadow-lg ${
              isBreached ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'
            }`}
          />
        </div>
      </div>

      {/* Footer Readings */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
        <span>Min: {min}{unit}</span>
        <span className="font-bold text-white text-xs">
          Live: {currentValue.toFixed(1)}{unit}
        </span>
        <span>Max: {max}{unit}</span>
      </div>
    </div>
  );
}

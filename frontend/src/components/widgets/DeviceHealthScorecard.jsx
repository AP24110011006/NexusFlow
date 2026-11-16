import React from 'react';
import { ShieldCheck, BatteryCharging, Wifi, AlertTriangle } from 'lucide-react';
import { calculateDeviceHealth } from '../../utils/deviceHealthMath';

/**
 * Composite Device Health Scorecard Widget
 * Authored by: Harshitha (Frontend Analytics & Visualizations Role)
 * Milestone: Week 2 Deliverable — Device Health Analytics
 * Organization: Infotact Solutions
 */
export default function DeviceHealthScorecard({
  deviceId = 'DEV-1001',
  battery = 92,
  rssi = -64,
  activeAlerts = 0,
  className = '',
}) {
  const health = calculateDeviceHealth({ battery, rssi, activeAlerts });

  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (health.score / 100) * circumference;

  const strokeColors = {
    emerald: '#10b981',
    amber: '#f59e0b',
    rose: '#f43f5e',
  };

  const badgeStyles = {
    OPTIMAL: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    DEGRADED: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    CRITICAL: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  };

  return (
    <div
      className={`p-5 rounded-2xl bg-slate-900/80 border border-slate-800 text-slate-100 backdrop-blur-md space-y-4 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Node Reliability Index ({deviceId})
          </h3>
        </div>
        <span
          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border tracking-wider uppercase ${
            badgeStyles[health.rating]
          }`}
        >
          {health.rating}
        </span>
      </div>

      {/* Main Dial & Breakdown Grid */}
      <div className="flex items-center gap-6">
        {/* SVG Circular Gauge */}
        <div className="relative flex items-center justify-center shrink-0">
          <svg className="w-24 h-24 transform -rotate-90">
            {/* Background Circle */}
            <circle
              cx="48"
              cy="48"
              r={radius}
              stroke="currentColor"
              strokeWidth="6"
              fill="transparent"
              className="text-slate-800"
            />
            {/* Animated Score Progress */}
            <circle
              cx="48"
              cy="48"
              r={radius}
              stroke={strokeColors[health.color] || '#10b981'}
              strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-2xl font-black text-white leading-none">
              {health.score}%
            </span>
            <span className="text-[9px] uppercase tracking-wider text-slate-500 mt-0.5">
              Health
            </span>
          </div>
        </div>

        {/* Sub-Metric Factor Breakdown */}
        <div className="flex-1 space-y-2.5">
          {/* Battery */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="flex items-center gap-1.5 text-slate-400">
                <BatteryCharging className="w-3.5 h-3.5 text-cyan-400" />
                Battery Level
              </span>
              <span className="font-mono font-semibold text-slate-200">
                {battery}%
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                style={{ width: `${health.breakdown.battery}%` }}
                className="h-full bg-cyan-500 rounded-full transition-all duration-500"
              />
            </div>
          </div>

          {/* RSSI Signal */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="flex items-center gap-1.5 text-slate-400">
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                RF Link Quality
              </span>
              <span className="font-mono font-semibold text-slate-200">
                {rssi} dBm
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                style={{ width: `${health.breakdown.rssi}%` }}
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              />
            </div>
          </div>

          {/* Active Alerts */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="flex items-center gap-1.5 text-slate-400">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                Anomaly Breaches
              </span>
              <span className="font-mono font-semibold text-slate-200">
                {activeAlerts === 0 ? 'None' : `${activeAlerts} Active`}
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                style={{ width: `${health.breakdown.anomaly}%` }}
                className={`h-full rounded-full transition-all duration-500 ${
                  activeAlerts > 0 ? 'bg-rose-500' : 'bg-emerald-500'
                }`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

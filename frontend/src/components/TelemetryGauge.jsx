import React from 'react';

/**
 * TelemetryGauge - Radial/circular IoT telemetry dial component
 * Authored by Harshitha (Frontend Role) - Week 1 Deliverable
 */
export default function TelemetryGauge({
  label,
  value,
  min = 0,
  max = 100,
  unit = '°C',
  type = 'temperature', // 'temperature' | 'humidity' | 'pressure'
}) {
  const numValue = value !== undefined && value !== null ? Number(value) : 0;
  const percentage = Math.min(100, Math.max(0, ((numValue - min) / (max - min)) * 100));

  // Determine stroke color based on thresholds
  let strokeColor = '#06b6d4'; // cyan default
  if (type === 'temperature') {
    strokeColor = numValue > 40 ? '#f43f5e' : numValue > 35 ? '#fbbf24' : '#06b6d4';
  } else if (type === 'humidity') {
    strokeColor = numValue < 30 ? '#fbbf24' : '#10b981';
  } else if (type === 'pressure') {
    strokeColor = numValue > 1025 ? '#a855f7' : '#38bdf8';
  }

  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
      <div className="relative w-24 h-24 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          {/* Background Track */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            className="text-slate-800"
            strokeWidth="8"
            stroke="currentColor"
            fill="transparent"
          />
          {/* Active Meter Fill */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke={strokeColor}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-500 ease-out"
          />
        </svg>

        {/* Center Value */}
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-base font-bold text-white font-mono leading-none">
            {value !== undefined ? value : '--'}
          </span>
          <span className="text-[10px] text-slate-400 font-semibold">{unit}</span>
        </div>
      </div>

      <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider mt-1">
        {label}
      </span>
    </div>
  );
}

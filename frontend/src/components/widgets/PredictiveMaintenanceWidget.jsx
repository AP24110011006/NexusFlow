/**
 * NexusFlow — PredictiveMaintenanceWidget UI Component
 * Author: Harshitha (Frontend Analytics & Visualizations Lead)
 * Organization: Infotact Solutions
 * Internship Reference: ITS/WEB/1849
 * Milestone: Week 3 - Prognostics, Remaining Useful Life (RUL) & Weibull Risk
 */

import React, { useState, useMemo } from 'react';
import {
  calculateLinearRUL,
  calculateWeibullFailureProbability,
  calculateHealthIndex
} from '../../utils/predictiveRulMath';

const SAMPLE_EQUIPMENT = [
  {
    id: 'EQ-BLW-04',
    name: 'Primary Induction Blower #4',
    type: 'Centrifugal Fan',
    metric: 'Bearing Vibration RMS (mm/s)',
    current: 4.65,
    baseline: 1.20,
    threshold: 7.10,
    degradationRate: 0.0038, // mm/s per operating hour
    operatingHours: 8420,
    eta: 12000,
    beta: 2.8
  },
  {
    id: 'EQ-PMP-201',
    name: 'Feedwater Hydraulic Pump H-201',
    type: 'Positive Displacement',
    metric: 'Casing Temperature (°C)',
    current: 78.4,
    baseline: 45.0,
    threshold: 95.0,
    degradationRate: 0.021, // °C per operating hour
    operatingHours: 6150,
    eta: 9500,
    beta: 2.3
  },
  {
    id: 'EQ-CMP-01',
    name: 'High-Pressure Compressor C-1',
    type: 'Rotary Screw',
    metric: 'Differential Pressure (bar)',
    current: 5.80,
    baseline: 2.00,
    threshold: 8.50,
    degradationRate: 0.0055,
    operatingHours: 11200,
    eta: 14000,
    beta: 3.1
  }
];

export const PredictiveMaintenanceWidget = ({ className = '' }) => {
  const [selectedEqId, setSelectedEqId] = useState('EQ-BLW-04');

  const activeEq = useMemo(() => {
    return SAMPLE_EQUIPMENT.find((e) => e.id === selectedEqId) || SAMPLE_EQUIPMENT[0];
  }, [selectedEqId]);

  const rul = useMemo(() => {
    return calculateLinearRUL(activeEq.current, activeEq.threshold, activeEq.degradationRate);
  }, [activeEq]);

  const weibullRisk = useMemo(() => {
    return calculateWeibullFailureProbability(activeEq.operatingHours, activeEq.eta, activeEq.beta);
  }, [activeEq]);

  const healthIndex = useMemo(() => {
    return calculateHealthIndex(activeEq.current, activeEq.baseline, activeEq.threshold);
  }, [activeEq]);

  const riskBadge = useMemo(() => {
    if (weibullRisk > 0.65) return { label: 'CRITICAL RISK', color: 'bg-rose-500/20 text-rose-400 border-rose-500/30' };
    if (weibullRisk > 0.35) return { label: 'ELEVATED RISK', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
    return { label: 'NOMINAL RISK', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
  }, [weibullRisk]);

  return (
    <div className={`p-5 rounded-2xl border border-slate-700 bg-slate-900/90 text-slate-100 shadow-xl backdrop-blur-md ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <h3 className="font-semibold text-base text-slate-100">Predictive Maintenance & RUL Prognostics</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            ISO 13374 Degradation Kinetics & Weibull Hazard Probability
          </p>
        </div>

        {/* Equipment Selector */}
        <select
          value={selectedEqId}
          onChange={(e) => setSelectedEqId(e.target.value)}
          aria-label="Select Machine Target"
          className="bg-slate-800 text-xs text-slate-200 border border-slate-700 rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-500"
        >
          {SAMPLE_EQUIPMENT.map((eq) => (
            <option key={eq.id} value={eq.id}>
              {eq.name} ({eq.id})
            </option>
          ))}
        </select>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-4">
        {/* RUL Days */}
        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Remaining Useful Life</div>
          <div className="mt-1 flex items-baseline space-x-1.5">
            <span className="text-2xl font-bold font-mono text-cyan-400">{rul.rulDays}</span>
            <span className="text-xs text-slate-400">days ({rul.rulHours} h)</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Confidence: {rul.confidence}%</div>
        </div>

        {/* Health Index */}
        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Asset Health Index</div>
          <div className="mt-1 flex items-baseline space-x-1.5">
            <span
              className={`text-2xl font-bold font-mono ${
                healthIndex < 40 ? 'text-rose-400' : healthIndex < 70 ? 'text-amber-400' : 'text-emerald-400'
              }`}
            >
              {healthIndex}%
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                healthIndex < 40 ? 'bg-rose-500' : healthIndex < 70 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${healthIndex}%` }}
            />
          </div>
        </div>

        {/* Weibull Hazard */}
        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Weibull Failure Risk</div>
          <div className="mt-1 flex items-baseline space-x-1.5">
            <span className="text-2xl font-bold font-mono text-slate-200">
              {(weibullRisk * 100).toFixed(1)}%
            </span>
          </div>
          <div className="mt-1">
            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border ${riskBadge.color}`}>
              {riskBadge.label}
            </span>
          </div>
        </div>

        {/* Operating Hours */}
        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Service Hours</div>
          <div className="mt-1 text-2xl font-bold font-mono text-slate-200">
            {activeEq.operatingHours.toLocaleString()}
            <span className="text-xs font-normal text-slate-500 ml-1">hrs</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Design MTBF: {activeEq.eta.toLocaleString()} hrs</div>
        </div>
      </div>

      {/* Degradation Trajectory Breakdown */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/40">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span>{activeEq.metric}</span>
          <span>
            Current: <strong className="text-slate-200 font-mono">{activeEq.current}</strong> / Trip Threshold:{' '}
            <strong className="text-rose-400 font-mono">{activeEq.threshold}</strong>
          </span>
        </div>

        {/* Trajectory Bar */}
        <div className="relative w-full h-3 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 rounded-full"
            style={{ width: `${Math.min(100, (activeEq.current / activeEq.threshold) * 100)}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1.5 font-mono">
          <span>Baseline: {activeEq.baseline}</span>
          <span>Degradation: +{activeEq.degradationRate} / hr</span>
          <span className="text-rose-400">Shutdown: {activeEq.threshold}</span>
        </div>
      </div>

      {/* Maintenance Recommendation Banner */}
      <div className="mt-4 p-3 rounded-lg border border-cyan-500/20 bg-cyan-950/30 flex items-start space-x-2.5 text-xs">
        <svg className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div className="text-cyan-200">
          <strong className="font-semibold text-cyan-300">Prescriptive Action:</strong> Inspection recommended in{' '}
          <span className="font-mono font-bold text-white">{Math.round(rul.rulDays * 0.7)} days</span>. Target component:{' '}
          <span className="text-cyan-300">{activeEq.type}</span> sleeve bearings.
        </div>
      </div>
    </div>
  );
};

export default PredictiveMaintenanceWidget;

/**
 * NexusFlow — SensorFusionWidget UI Component
 * Author: Harshitha (Frontend Analytics & Visualizations Lead)
 * Organization: Infotact Solutions
 * Internship Reference: ITS/WEB/1849
 * Milestone: Week 3 - Multi-Sensor Fusion & PCA Dimensionality Reduction
 */

import React, { useMemo, useState } from 'react';
import {
  calculateSensorFusionHealth,
  calculateFirstPrincipalComponent,
  calculateCovarianceMatrix
} from '../../utils/sensorFusionMath';

const CHANNELS = [
  { name: 'Motor Temp (°C)', key: 'temp', baseline: 52.0, tol: 25.0, unit: '°C' },
  { name: 'Vibration RMS (mm/s)', key: 'vib', baseline: 1.8, tol: 3.5, unit: 'mm/s' },
  { name: 'Line Pressure (bar)', key: 'press', baseline: 4.5, tol: 2.0, unit: 'bar' },
  { name: 'Current Draw (A)', key: 'curr', baseline: 18.2, tol: 8.0, unit: 'A' }
];

export const SensorFusionWidget = ({ className = '' }) => {
  const [readings, setReadings] = useState({
    temp: 64.2,
    vib: 2.9,
    press: 4.9,
    curr: 21.4
  });

  const sensorArray = useMemo(() => [readings.temp, readings.vib, readings.press, readings.curr], [readings]);
  const baselineArray = useMemo(() => CHANNELS.map((c) => c.baseline), []);
  const tolArray = useMemo(() => CHANNELS.map((c) => c.tol), []);

  const fusionResult = useMemo(() => {
    return calculateSensorFusionHealth(sensorArray, baselineArray, tolArray);
  }, [sensorArray, baselineArray, tolArray]);

  // Simulated recent covariance
  const pcaWeights = useMemo(() => {
    // Representative synthetic sample batch
    const sampleBatch = [
      [52.0, 1.8, 4.5, 18.0],
      [55.1, 2.1, 4.6, 18.8],
      [58.4, 2.4, 4.7, 19.5],
      [62.0, 2.7, 4.8, 20.6],
      [readings.temp, readings.vib, readings.press, readings.curr]
    ];
    const cov = calculateCovarianceMatrix(sampleBatch);
    const { eigenvector } = calculateFirstPrincipalComponent(cov);
    return eigenvector.length === 4 ? eigenvector : [0.45, 0.55, 0.35, 0.60];
  }, [readings]);

  return (
    <div className={`p-5 rounded-2xl border border-slate-700 bg-slate-900/90 text-slate-100 shadow-xl backdrop-blur-md ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse" />
            <h3 className="font-semibold text-base text-slate-100">Multi-Sensor Fusion & PCA Health Matrix</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time multi-channel sensor correlation & composite anomaly detection
          </p>
        </div>

        {/* Status Badge */}
        <div>
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
              fusionResult.isAnomaly
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
            }`}
          >
            {fusionResult.isAnomaly ? 'MULTIVARIATE DIVERGENCE' : 'SYSTEM NOMINAL'}
          </span>
        </div>
      </div>

      {/* Main KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-4">
        {/* Composite Score Card */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 flex flex-col justify-between">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            Composite Health Index
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span
              className={`text-4xl font-bold font-mono ${
                fusionResult.healthScore < 50
                  ? 'text-rose-400'
                  : fusionResult.healthScore < 75
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}
            >
              {fusionResult.healthScore}%
            </span>
            <span className="text-xs text-slate-500">fused stability</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 mt-3 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                fusionResult.healthScore < 50
                  ? 'bg-rose-500'
                  : fusionResult.healthScore < 75
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${fusionResult.healthScore}%` }}
            />
          </div>
        </div>

        {/* Primary Principal Component (PC1) */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            PCA Eigenvector (PC1)
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Leading variance contribution axis</p>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {CHANNELS.map((ch, idx) => (
              <div key={ch.key} className="bg-slate-900 p-1.5 rounded border border-slate-800/80 text-[11px]">
                <div className="text-slate-400 truncate">{ch.name.split(' ')[0]}</div>
                <div className="font-mono text-indigo-300 font-semibold">
                  λ₁: {Math.abs(pcaWeights[idx] || 0.5).toFixed(3)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fusion Status Summary */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 flex flex-col justify-between">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            Dimensionality Metric
          </div>
          <div className="space-y-1.5 mt-2 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>Channel Count:</span>
              <span className="font-mono text-white font-bold">4 Inputs</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>PC1 Variance:</span>
              <span className="font-mono text-indigo-300 font-bold">78.4%</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Sensor Fusion:</span>
              <span className="text-emerald-400 font-semibold">Active (100 Hz)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sensor Channels Real-Time Sliders / Divergence */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/40 space-y-3">
        <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Telemetry Channels & Tolerance Normalized Deviations
        </div>

        {CHANNELS.map((ch, idx) => {
          const divScore = fusionResult.channelDivergence[idx] || 0;
          const isBreached = divScore >= 1.0;

          return (
            <div key={ch.key} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">{ch.name}</span>
                <span className="font-mono text-slate-200">
                  {readings[ch.key]} {ch.unit}{' '}
                  <span className={`text-[11px] ml-1.5 ${isBreached ? 'text-rose-400 font-bold' : 'text-slate-500'}`}>
                    ({(divScore * 100).toFixed(0)}% tol)
                  </span>
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    isBreached ? 'bg-rose-500' : divScore > 0.6 ? 'bg-amber-400' : 'bg-sky-400'
                  }`}
                  style={{ width: `${Math.min(100, divScore * 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SensorFusionWidget;

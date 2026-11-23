import React, { useState, useMemo } from 'react';
import { Radio, AlertOctagon, Activity, Sparkles, HelpCircle } from 'lucide-react';
import { computeDFT, evaluateVibrationSeverity } from '../../utils/spectralMath';

/**
 * NexusFlow — Vibration Spectrogram & ISO 10816 Severity Widget
 * Author: Harshitha (Frontend Analytics & Visualizations Lead)
 * Organization: Infotact Solutions
 * Milestone: Week 3 - Harmonic Spectrum Visualization & Bearing Diagnostics
 *
 * @param {Object} props
 * @param {number[]} [props.samples] - Time-domain vibration samples
 * @param {number} [props.rmsVelocity=2.4] - Current measured RMS vibration velocity in mm/s
 * @param {string} [props.deviceName='Turbine Compressor DEV-001']
 * @param {string} [props.className]
 */
export default function VibrationSpectrogramWidget({
  samples = [],
  rmsVelocity = 2.4,
  deviceName = 'Turbine Compressor DEV-001',
  className = '',
}) {
  const [machineClass, setMachineClass] = useState('class_2');

  // Synthetic vibration signal if no samples provided
  const activeSamples = useMemo(() => {
    if (samples && samples.length >= 16) return samples;
    // Harmonic model: 50 Hz fundamental + 100 Hz harmonic + noise
    return Array.from({ length: 64 }, (_, i) => {
      const t = i / 64;
      return (
        Math.sin(2 * Math.PI * 3 * t) * 1.8 +
        Math.sin(2 * Math.PI * 6 * t) * 0.9 +
        (Math.random() - 0.5) * 0.4
      );
    });
  }, [samples]);

  const spectralData = useMemo(() => {
    return computeDFT(activeSamples, 500);
  }, [activeSamples]);

  const severity = useMemo(() => {
    return evaluateVibrationSeverity(rmsVelocity, machineClass);
  }, [rmsVelocity, machineClass]);

  const maxMag = Math.max(...spectralData.magnitudes, 0.1);

  return (
    <div className={`p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 rounded-lg">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
              Vibration Spectral Harmonics
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              ISO 10816 Severity & DFT Spectrogram for {deviceName}
            </p>
          </div>
        </div>

        {/* Severity Badge */}
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
            severity.zone === 'A'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
              : severity.zone === 'B'
              ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800'
              : severity.zone === 'C'
              ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800'
              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800'
          }`}>
            Zone {severity.zone}: {severity.status}
          </span>
        </div>
      </div>

      {/* Class Selector Bar & RMS Velocity */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2">
          <span className="text-gray-500">Machine Class:</span>
          <select
            value={machineClass}
            onChange={(e) => setMachineClass(e.target.value)}
            className="px-2 py-1 rounded-md bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 font-medium"
          >
            <option value="class_1">Class I (&lt; 15 kW)</option>
            <option value="class_2">Class II (15 - 75 kW Medium)</option>
            <option value="class_3">Class III (Large Rigid Foundation)</option>
            <option value="class_4">Class IV (Large Turbo Heavy)</option>
          </select>
        </div>

        <div className="flex items-baseline space-x-1.5">
          <span className="text-gray-500">RMS Velocity:</span>
          <span className="font-bold text-gray-900 dark:text-gray-100">{rmsVelocity} mm/s</span>
        </div>
      </div>

      {/* Frequency Spectrogram Bars */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>0 Hz</span>
          <span>Peak: {spectralData.peakFrequency} Hz ({spectralData.peakMagnitude} g)</span>
          <span>250 Hz</span>
        </div>

        <div className="h-28 flex items-end gap-1 p-2 bg-gray-50 dark:bg-gray-950/60 rounded-lg border border-gray-100 dark:border-gray-800">
          {spectralData.magnitudes.map((mag, i) => {
            const heightPct = Math.max(6, Math.min(100, Math.round((mag / maxMag) * 100)));
            const isPeak = spectralData.frequencies[i] === spectralData.peakFrequency;
            return (
              <div
                key={i}
                className="flex-1 flex flex-col items-center group relative h-full justify-end"
              >
                {/* Tooltip on hover */}
                <span className="absolute -top-7 hidden group-hover:block px-1.5 py-0.5 rounded text-[10px] bg-gray-900 text-white z-20 whitespace-nowrap shadow-xs">
                  {spectralData.frequencies[i]} Hz: {mag}
                </span>

                <div
                  style={{ height: `${heightPct}%` }}
                  className={`w-full rounded-t-xs transition-all duration-300 ${
                    isPeak
                      ? 'bg-purple-600 dark:bg-purple-500 ring-2 ring-purple-300'
                      : 'bg-indigo-400 dark:bg-indigo-600/70 hover:bg-indigo-500'
                  }`}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Advisory */}
      <div className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed pt-2 border-t border-gray-100 dark:border-gray-800 flex items-start space-x-2">
        <Activity className="w-3.5 h-3.5 mt-0.5 text-gray-400 flex-shrink-0" />
        <span>{severity.description}</span>
      </div>
    </div>
  );
}

import React, { useState, useMemo } from 'react';
import { Activity, Sliders, TrendingUp, Sparkles, AlertCircle } from 'lucide-react';
import { calculateSMA, calculateEMA, calculateBollingerBands, calculateNoiseReduction } from '../../utils/smoothingMath';

/**
 * NexusFlow — Real-Time Telemetry Smoothing & Volatility Band Widget
 * Author: Harshitha (Frontend Analytics & Visualizations Lead)
 * Organization: Infotact Solutions
 * Milestone: Week 2 - Interactive Sensor Noise Filter & Bollinger Envelopes
 *
 * @param {Object} props
 * @param {Array<{ timestamp: string, value: number }>} [props.data]
 * @param {string} [props.metricName='Temperature']
 * @param {string} [props.unit='°C']
 * @param {string} [props.className]
 */
export default function TelemetrySmoothingWidget({
  data = [],
  metricName = 'Temperature',
  unit = '°C',
  className = '',
}) {
  const [algorithm, setAlgorithm] = useState('ema'); // 'ema' | 'sma' | 'bollinger'
  const [period, setPeriod] = useState(5);

  // Fallback demo dataset if data is empty or short
  const activeSeries = useMemo(() => {
    if (data && data.length >= 5) {
      return data.map((d, i) => ({
        index: i,
        time: d.timestamp ? new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : `T-${i}`,
        value: Number(d.value) || 0
      }));
    }
    // Synthetic industrial vibration/temperature series with realistic sensor noise
    const base = metricName.toLowerCase().includes('humidity') ? 60 : metricName.toLowerCase().includes('pressure') ? 1013 : 32.5;
    return Array.from({ length: 16 }, (_, i) => {
      const jitter = (Math.sin(i * 0.9) * 2.8) + ((i % 3 === 0 ? 1 : -1) * 1.4);
      return {
        index: i,
        time: `12:${String(10 + i).padStart(2, '0')}:00`,
        value: Number((base + jitter).toFixed(2))
      };
    });
  }, [data, metricName]);

  const rawValues = useMemo(() => activeSeries.map(d => d.value), [activeSeries]);

  const smoothedData = useMemo(() => {
    const sma = calculateSMA(rawValues, period);
    const ema = calculateEMA(rawValues, period);
    const bb = calculateBollingerBands(rawValues, period, 2);

    const targetSmoothed = algorithm === 'ema' ? ema : sma;
    const noiseReduction = calculateNoiseReduction(rawValues, targetSmoothed);

    return {
      sma,
      ema,
      bb,
      targetSmoothed,
      noiseReduction
    };
  }, [rawValues, period, algorithm]);

  // Scaler helper for SVG mini line chart
  const minVal = Math.min(...rawValues, ...(smoothedData.bb.lower || []));
  const maxVal = Math.max(...rawValues, ...(smoothedData.bb.upper || []));
  const range = (maxVal - minVal) || 1;
  const svgWidth = 460;
  const svgHeight = 140;
  const padding = 16;

  const getY = (val) => svgHeight - padding - ((val - minVal) / range) * (svgHeight - padding * 2);
  const getX = (idx) => padding + (idx / (rawValues.length - 1)) * (svgWidth - padding * 2);

  const rawPath = rawValues.map((v, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(v)}`).join(' ');
  const smoothPath = smoothedData.targetSmoothed.map((v, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(v)}`).join(' ');
  const upperPath = smoothedData.bb.upper.map((v, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(v)}`).join(' ');
  const lowerPath = smoothedData.bb.lower.map((v, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(v)}`).join(' ');

  return (
    <div className={`p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-base">
              Signal Smoothing & Volatility
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Noise suppression & Bollinger envelope for {metricName}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            <Sparkles className="w-3 h-3 mr-1" />
            {smoothedData.noiseReduction}% Noise Reduced
          </span>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-1.5 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setAlgorithm('ema')}
            className={`px-3 py-1 rounded-md font-medium transition-all ${
              algorithm === 'ema'
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
            EMA (Exponential)
          </button>
          <button
            type="button"
            onClick={() => setAlgorithm('sma')}
            className={`px-3 py-1 rounded-md font-medium transition-all ${
              algorithm === 'sma'
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
            SMA (Simple)
          </button>
          <button
            type="button"
            onClick={() => setAlgorithm('bollinger')}
            className={`px-3 py-1 rounded-md font-medium transition-all ${
              algorithm === 'bollinger'
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
            Bollinger Bands (2σ)
          </button>
        </div>

        {/* Period Selector */}
        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
          <Sliders className="w-3.5 h-3.5 text-gray-400" />
          <span>Window (N):</span>
          <div className="flex items-center space-x-1">
            {[3, 5, 8, 12].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className={`w-6 h-6 rounded flex items-center justify-center font-semibold text-xs transition-colors ${
                  period === p
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SVG Multi-Layer Chart */}
      <div className="relative w-full h-[150px] bg-gray-50 dark:bg-gray-950/60 rounded-lg p-2 border border-gray-100 dark:border-gray-800 flex items-center justify-center overflow-hidden">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full preserve-3d" preserveAspectRatio="none">
          {/* Bollinger Band Shading */}
          {algorithm === 'bollinger' && (
            <>
              <path d={upperPath} fill="none" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 3" opacity="0.7" />
              <path d={lowerPath} fill="none" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 3" opacity="0.7" />
            </>
          )}

          {/* Raw Jittery Signal */}
          <path d={rawPath} fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeOpacity="0.6" />

          {/* Smoothed Target Signal */}
          <path d={smoothPath} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" />

          {/* Data Points on Smoothed Line */}
          {smoothedData.targetSmoothed.map((v, i) => (
            <circle key={i} cx={getX(i)} cy={getY(v)} r="2.5" className="fill-blue-600 dark:fill-blue-400" />
          ))}
        </svg>
      </div>

      {/* Legend & Stats Footer */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-gray-100 dark:border-gray-800 text-xs">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-0.5 bg-slate-400" />
          <span className="text-gray-500 dark:text-gray-400">Raw Sensor ({rawValues[rawValues.length - 1]} {unit})</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-1 bg-blue-600 rounded-full" />
          <span className="text-blue-600 dark:text-blue-400 font-medium">Smoothed ({smoothedData.targetSmoothed[smoothedData.targetSmoothed.length - 1]} {unit})</span>
        </div>
        {algorithm === 'bollinger' && (
          <div className="flex items-center space-x-2 col-span-2 sm:col-span-1">
            <div className="w-3 h-0.5 border-t border-dashed border-amber-500" />
            <span className="text-amber-500">Envelope Band ($\pm 2\sigma$)</span>
          </div>
        )}
      </div>
    </div>
  );
}

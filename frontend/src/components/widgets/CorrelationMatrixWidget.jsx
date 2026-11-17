import React, { useState } from 'react';
import { GitCompare, Info } from 'lucide-react';
import { buildCorrelationMatrix } from '../../utils/correlationMath';

/**
 * Sensor Cross-Metric Correlation Matrix Heatmap Widget
 * Authored by: Harshitha (Frontend Analytics & Visualizations Role)
 * Milestone: Week 2 Deliverable — Multi-Variable Sensor Analytics
 * Organization: Infotact Solutions
 */
export default function CorrelationMatrixWidget({
  telemetryData = [],
  className = '',
}) {
  const metrics = ['temperature', 'humidity', 'pressure'];
  const labels = {
    temperature: 'Temp',
    humidity: 'Humidity',
    pressure: 'Pressure',
  };

  const matrix = buildCorrelationMatrix(telemetryData, metrics);
  const [hoveredCell, setHoveredCell] = useState(null);

  function getCellColor(r) {
    if (r === 1.0) return 'bg-cyan-500/30 text-cyan-200 border-cyan-500/40';
    if (r >= 0.5) return 'bg-emerald-500/25 text-emerald-200 border-emerald-500/30';
    if (r >= 0.2) return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20';
    if (r > -0.2) return 'bg-slate-800/60 text-slate-300 border-slate-700/60';
    if (r > -0.5) return 'bg-purple-500/15 text-purple-300 border-purple-500/20';
    return 'bg-rose-500/25 text-rose-200 border-rose-500/30';
  }

  return (
    <div
      className={`p-5 rounded-2xl bg-slate-900/80 border border-slate-800 text-slate-100 backdrop-blur-md space-y-4 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitCompare className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Cross-Metric Correlation Matrix (Pearson r)
          </h3>
        </div>
        <span className="text-[10px] text-slate-500 font-mono">
          N = {telemetryData.length} samples
        </span>
      </div>

      {/* 3x3 Heatmap Grid */}
      <div className="overflow-x-auto">
        <table className="w-full text-center border-collapse">
          <thead>
            <tr>
              <th className="p-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-left">
                Metric
              </th>
              {metrics.map((m) => (
                <th
                  key={m}
                  className="p-2 text-[10px] font-bold text-slate-300 uppercase tracking-wider"
                >
                  {labels[m]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {metrics.map((rowMetric) => (
              <tr key={rowMetric}>
                <td className="p-2 text-[11px] font-semibold text-slate-300 text-left whitespace-nowrap">
                  {labels[rowMetric]}
                </td>
                {metrics.map((colMetric) => {
                  const entry = matrix.find(
                    (e) => e.m1 === rowMetric && e.m2 === colMetric
                  ) || { r: rowMetric === colMetric ? 1.0 : 0 };
                  const rVal = entry.r;

                  return (
                    <td key={colMetric} className="p-1">
                      <div
                        onMouseEnter={() => setHoveredCell(entry)}
                        onMouseLeave={() => setHoveredCell(null)}
                        className={`py-2 px-2.5 rounded-xl border font-mono text-xs font-bold transition-all cursor-pointer hover:scale-105 ${getCellColor(
                          rVal
                        )}`}
                      >
                        {rVal > 0 && rVal !== 1 ? `+${rVal.toFixed(2)}` : rVal.toFixed(2)}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tooltip / Explanation Callout */}
      <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
        <Info className="w-4 h-4 text-cyan-400 shrink-0" />
        <span className="truncate">
          {hoveredCell
            ? `${labels[hoveredCell.m1]} vs ${labels[hoveredCell.m2]}: ${
                hoveredCell.interpretation
              }`
            : 'Hover over any correlation cell to view operational diagnosis.'}
        </span>
      </div>
    </div>
  );
}

import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

/**
 * NexusFlow — High-Density SVG Sensor Volatility Sparkline Widget
 * Author: Harshitha (Frontend Analytics & Visualizations Lead)
 * Organization: Infotact Solutions
 * Milestone: Week 2 - Micro-Visualizations & Inline Telemetry Sparklines
 *
 * @param {Object} props
 * @param {number[]} props.data - Array of numeric sensor readings
 * @param {number} [props.threshold] - Optional threshold alert line
 * @param {number} [props.width=140]
 * @param {number} [props.height=36]
 * @param {string} [props.color='#3b82f6'] - Stroke line color
 * @param {boolean} [props.showTrend=true] - Display trend direction icon
 * @param {string} [props.className]
 */
export default function SensorVolatilitySparkline({
  data = [],
  threshold,
  width = 140,
  height = 36,
  color = '#3b82f6',
  showTrend = true,
  className = '',
}) {
  const points = useMemo(() => {
    if (!Array.isArray(data) || data.length < 2) return [];
    return data.map((v) => Number(v) || 0);
  }, [data]);

  const { pathString, min, max, trend, thresholdY } = useMemo(() => {
    if (points.length < 2) {
      return { pathString: '', min: 0, max: 0, trend: 'flat', thresholdY: null };
    }

    const minVal = Math.min(...points);
    const maxVal = Math.max(...points);
    const range = maxVal - minVal || 1;
    const padding = 4;
    const drawHeight = height - padding * 2;
    const drawWidth = width - padding * 2;

    const coords = points.map((val, idx) => {
      const x = padding + (idx / (points.length - 1)) * drawWidth;
      const y = height - padding - ((val - minVal) / range) * drawHeight;
      return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    });

    const first = points[0];
    const last = points[points.length - 1];
    const diff = last - first;
    const trendDir = Math.abs(diff) < 0.1 ? 'flat' : diff > 0 ? 'up' : 'down';

    let tY = null;
    if (threshold !== undefined && threshold !== null) {
      tY = height - padding - ((threshold - minVal) / range) * drawHeight;
      tY = Math.max(padding, Math.min(height - padding, tY));
    }

    return {
      pathString: coords.join(' '),
      min: minVal.toFixed(1),
      max: maxVal.toFixed(1),
      trend: trendDir,
      thresholdY: tY,
    };
  }, [points, width, height, threshold]);

  if (points.length < 2) {
    return (
      <div className={`flex items-center text-xs text-gray-400 dark:text-gray-600 ${className}`}>
        <Minus className="w-3.5 h-3.5 mr-1" />
        <span>Insufficient data</span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center space-x-2 ${className}`}>
      <div className="relative" style={{ width, height }}>
        <svg width={width} height={height} className="overflow-visible">
          {/* Threshold alert dashed line */}
          {thresholdY !== null && (
            <line
              x1="4"
              y1={thresholdY}
              x2={width - 4}
              y2={thresholdY}
              stroke="#ef4444"
              strokeWidth="1"
              strokeDasharray="2 2"
              opacity="0.8"
            />
          )}

          {/* Sparkline gradient fill under line */}
          <path
            d={`${pathString} L ${width - 4} ${height - 4} L 4 ${height - 4} Z`}
            fill={color}
            fillOpacity="0.1"
          />

          {/* Primary Sparkline Path */}
          <path
            d={pathString}
            fill="none"
            stroke={color}
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Terminal Latest Data Point Dot */}
          {points.length > 0 && (
            <circle
              cx={width - 4}
              cy={height - 4 - ((points[points.length - 1] - min) / (max - min || 1)) * (height - 8)}
              r="2.5"
              fill={color}
            />
          )}
        </svg>
      </div>

      {showTrend && (
        <div className="flex items-center text-xs">
          {trend === 'up' && <TrendingUp className="w-3.5 h-3.5 text-rose-500" title="Trending Upwards" />}
          {trend === 'down' && <TrendingDown className="w-3.5 h-3.5 text-blue-500" title="Trending Downwards" />}
          {trend === 'flat' && <Minus className="w-3.5 h-3.5 text-gray-400" title="Steady" />}
        </div>
      )}
    </div>
  );
}

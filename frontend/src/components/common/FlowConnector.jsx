import React from 'react';

/**
 * NexusFlow — Cubic Bezier Flow Connector Cable Component
 * Author: Likhitha (Frontend Core / UI Lead)
 * Organization: Infotact Solutions
 * Milestone: Week 3 - Visual Rule Canvas Connectors & Animated Flow Paths
 *
 * @param {Object} props
 * @param {number} props.startX - Source node output port X coordinate
 * @param {number} props.startY - Source node output port Y coordinate
 * @param {number} props.endX - Target node input port X coordinate
 * @param {number} props.endY - Target node input port Y coordinate
 * @param {'active' | 'warning' | 'default'} [props.status='default']
 * @param {boolean} [props.animated=false] - Animated dashed flow line
 * @param {string} [props.className]
 */
export default function FlowConnector({
  startX = 0,
  startY = 0,
  endX = 100,
  endY = 100,
  status = 'default',
  animated = false,
  className = '',
}) {
  // Cubic Bezier control points calculation
  const dx = Math.max(Math.abs(endX - startX) * 0.5, 40);
  const cp1X = startX + dx;
  const cp1Y = startY;
  const cp2X = endX - dx;
  const cp2Y = endY;

  const pathD = `M ${startX} ${startY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endX} ${endY}`;

  const statusColors = {
    active: {
      stroke: '#3b82f6', // blue-500
      glow: 'rgba(59, 130, 246, 0.4)',
    },
    warning: {
      stroke: '#f59e0b', // amber-500
      glow: 'rgba(245, 158, 11, 0.4)',
    },
    default: {
      stroke: '#94a3b8', // slate-400
      glow: 'none',
    },
  };

  const current = statusColors[status] || statusColors.default;

  return (
    <g className={`flow-connector-group ${className}`}>
      {/* Background Glow Path */}
      {status !== 'default' && (
        <path
          d={pathD}
          fill="none"
          stroke={current.glow}
          strokeWidth="6"
          strokeLinecap="round"
        />
      )}

      {/* Main Connection Path */}
      <path
        d={pathD}
        fill="none"
        stroke={current.stroke}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray={animated ? '6 4' : undefined}
        className={animated ? 'animate-[dash_1s_linear_infinite]' : ''}
      />

      {/* Endpoint Connectors */}
      <circle cx={startX} cy={startY} r="3" fill={current.stroke} />
      <circle cx={endX} cy={endY} r="3" fill={current.stroke} />
    </g>
  );
}

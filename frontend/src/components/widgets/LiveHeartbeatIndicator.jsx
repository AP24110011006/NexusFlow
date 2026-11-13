import React, { useState, useEffect } from 'react';
import { Activity, Wifi, WifiOff } from 'lucide-react';

/**
 * Live IoT Heartbeat & Latency Indicator Widget
 * Authored by: Harshitha (Frontend Analytics & Visualizations Role)
 * Milestone: Week 1 Deliverable — Visual IoT Telemetry Monitoring
 * Organization: Infotact Solutions
 */
export default function LiveHeartbeatIndicator({
  isConnected = true,
  latencyMs = 18,
  packetsReceived = 0,
  lastPacketTime,
  className = '',
}) {
  const [secondsAgo, setSecondsAgo] = useState(0);

  useEffect(() => {
    if (!lastPacketTime) return;
    const interval = setInterval(() => {
      const diff = Math.max(
        0,
        Math.floor((Date.now() - new Date(lastPacketTime).getTime()) / 1000)
      );
      setSecondsAgo(diff);
    }, 1000);
    return () => clearInterval(interval);
  }, [lastPacketTime]);

  const latencyColor =
    latencyMs < 50
      ? 'text-emerald-400'
      : latencyMs < 150
      ? 'text-amber-400'
      : 'text-rose-400';

  return (
    <div
      className={`flex items-center gap-4 px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-200 text-xs backdrop-blur-md ${className}`}
    >
      {/* Connection State */}
      <div className="flex items-center gap-2">
        {isConnected ? (
          <div className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </div>
        ) : (
          <span className="inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
        )}
        <span className="font-semibold tracking-wide uppercase text-[11px] text-slate-300">
          {isConnected ? 'Stream Active' : 'Disconnected'}
        </span>
      </div>

      <div className="h-4 w-px bg-slate-800" />

      {/* Latency */}
      <div className="flex items-center gap-1.5">
        <Activity className="w-3.5 h-3.5 text-cyan-400" />
        <span className="text-slate-400">Ping:</span>
        <span className={`font-mono font-bold ${latencyColor}`}>{latencyMs}ms</span>
      </div>

      <div className="h-4 w-px bg-slate-800" />

      {/* Packet Count */}
      <div className="flex items-center gap-1.5">
        <Wifi className="w-3.5 h-3.5 text-cyan-400" />
        <span className="text-slate-400">Packets:</span>
        <span className="font-mono font-bold text-white">{packetsReceived}</span>
      </div>

      {lastPacketTime && (
        <>
          <div className="h-4 w-px bg-slate-800" />
          <div className="text-slate-400 text-[11px]">
            Tick: <span className="text-slate-300 font-mono">{secondsAgo}s ago</span>
          </div>
        </>
      )}
    </div>
  );
}

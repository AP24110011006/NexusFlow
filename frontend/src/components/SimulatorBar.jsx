import React, { useState } from 'react';
import { Play, Pause, Flame, Droplets, Gauge, Zap, CheckCircle2 } from 'lucide-react';
import { useSocket } from '../context/SocketContext';

export default function SimulatorBar() {
  const { simulatorStatus, startSimulator, stopSimulator, injectAnomaly } = useSocket();
  const [injecting, setInjecting] = useState(false);
  const [bannerMsg, setBannerMsg] = useState(null);

  const handleToggle = () => {
    if (simulatorStatus.isRunning) {
      stopSimulator();
    } else {
      startSimulator(simulatorStatus.intervalMs || 3000);
    }
  };

  const handleIntervalChange = (e) => {
    const val = parseInt(e.target.value, 10);
    startSimulator(val);
  };

  const triggerSpike = async (type) => {
    try {
      setInjecting(true);
      let payload = {};
      if (type === 'temp') {
        payload = { deviceId: 'SENSOR_001', metric: 'temperature', value: 46.8 };
      } else if (type === 'humidity') {
        payload = { deviceId: 'SENSOR_002', metric: 'humidity', value: 21.5 };
      } else if (type === 'pressure') {
        payload = { deviceId: 'SENSOR_003', metric: 'pressure', value: 1034.2 };
      }

      await injectAnomaly(payload);
      setBannerMsg(`Injected ${payload.metric} anomaly (${payload.value}) on ${payload.deviceId}! Watch Rule Engine trigger.`);
      setTimeout(() => setBannerMsg(null), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setInjecting(false);
    }
  };

  return (
    <div className="bg-slate-900/90 border-b border-slate-800/80 px-4 py-2.5 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-sm">
        {/* Left: Status & Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                simulatorStatus.isRunning
                  ? 'bg-emerald-400 animate-pulse glow-emerald'
                  : 'bg-amber-400'
              }`}
            />
            <span className="font-semibold text-xs tracking-wider uppercase text-slate-300">
              IoT Telemetry Stream:
            </span>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded ${
                simulatorStatus.isRunning
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {simulatorStatus.isRunning ? 'LIVE STREAMING' : 'PAUSED'}
            </span>
          </div>

          <button
            onClick={handleToggle}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              simulatorStatus.isRunning
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20'
            }`}
          >
            {simulatorStatus.isRunning ? (
              <>
                <Pause className="w-3.5 h-3.5 text-amber-400" />
                Pause Stream
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-emerald-300" />
                Resume Stream
              </>
            )}
          </button>

          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Interval:</span>
            <select
              value={simulatorStatus.intervalMs || 3000}
              onChange={handleIntervalChange}
              className="bg-slate-800 border border-slate-700 rounded px-2 py-0.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value={1000}>1.0s (Fast)</option>
              <option value={2000}>2.0s</option>
              <option value={3000}>3.0s (Default)</option>
              <option value={5000}>5.0s (Eco)</option>
            </select>
          </div>
        </div>

        {/* Right: Quick Anomaly Testing Triggers */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Rule Engine Test Anomaly:
          </span>

          <button
            disabled={injecting}
            onClick={() => triggerSpike('temp')}
            title="Inject 46.8°C reading on SENSOR_001 to trigger High Temp Rule"
            className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 transition-all hover:scale-105 active:scale-95"
          >
            <Flame className="w-3 h-3 text-rose-400" />
            Temp Spike (46.8°C)
          </button>

          <button
            disabled={injecting}
            onClick={() => triggerSpike('humidity')}
            title="Inject 21.5% reading on SENSOR_002 to trigger Low Humidity Rule"
            className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition-all hover:scale-105 active:scale-95"
          >
            <Droplets className="w-3 h-3 text-amber-400" />
            Low Humidity (21.5%)
          </button>

          <button
            disabled={injecting}
            onClick={() => triggerSpike('pressure')}
            title="Inject 1034.2 hPa on SENSOR_003 to trigger Overpressure Rule"
            className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 transition-all hover:scale-105 active:scale-95"
          >
            <Gauge className="w-3 h-3 text-purple-400" />
            Overpressure (1034 hPa)
          </button>
        </div>
      </div>

      {bannerMsg && (
        <div className="max-w-7xl mx-auto mt-2 px-3 py-1.5 rounded-md bg-cyan-950/70 border border-cyan-500/40 text-cyan-200 text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            <span>{bannerMsg}</span>
          </div>
          <button
            onClick={() => setBannerMsg(null)}
            className="text-cyan-400 hover:text-white font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

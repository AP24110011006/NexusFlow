import React, { useState, useEffect } from 'react';
import {
  Activity,
  Send,
  Download,
  Filter,
  RefreshCw,
  Flame,
  Droplets,
  Gauge,
  Battery,
  Wifi,
  Clock,
  CheckCircle2,
  Cpu,
} from 'lucide-react';
import { telemetryAPI, deviceAPI } from '../api/client';
import { useSocket } from '../context/SocketContext';

export default function Telemetry() {
  const { liveStream, latestTelemetry } = useSocket();
  const [telemetryList, setTelemetryList] = useState([]);
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showManualForm, setShowManualForm] = useState(false);

  // Manual ingest form state
  const [manualForm, setManualForm] = useState({
    deviceId: 'SENSOR_001',
    temperature: 32.5,
    humidity: 45.0,
    pressure: 1013.2,
    battery: 90,
  });
  const [ingesting, setIngesting] = useState(false);
  const [ingestSuccess, setIngestSuccess] = useState(null);

  const fetchTelemetry = async () => {
    try {
      setLoading(true);
      const [telRes, devRes] = await Promise.all([
        telemetryAPI.getAll({ deviceId: selectedDevice, limit: 100 }),
        deviceAPI.getAll(),
      ]);
      setTelemetryList(telRes.data.telemetry || []);
      setDevices(devRes.data.devices || []);
    } catch (err) {
      console.error('Error fetching telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
  }, [selectedDevice]);

  // Prepend live stream reading if matches filter
  useEffect(() => {
    if (liveStream.length > 0) {
      const latest = liveStream[0];
      if (selectedDevice === 'all' || selectedDevice === latest.deviceId) {
        setTelemetryList((prev) => {
          const exists = prev.some((p) => p.id === latest.id);
          if (exists) return prev;
          return [latest, ...prev.slice(0, 99)];
        });
      }
    }
  }, [liveStream, selectedDevice]);

  const handleManualIngest = async (e) => {
    e.preventDefault();
    try {
      setIngesting(true);
      setIngestSuccess(null);
      const res = await telemetryAPI.ingest({
        ...manualForm,
        temperature: Number(manualForm.temperature),
        humidity: Number(manualForm.humidity),
        pressure: Number(manualForm.pressure),
        battery: Number(manualForm.battery),
      });

      setIngestSuccess(`Telemetry ingested successfully! Evaluated rules: ${res.data.rulesEvaluated}`);
      setTimeout(() => setIngestSuccess(null), 4000);
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    } finally {
      setIngesting(false);
    }
  };

  const exportCSV = () => {
    if (!telemetryList.length) return;
    const headers = ['ID', 'DeviceID', 'Temperature(C)', 'Humidity(%)', 'Pressure(hPa)', 'Battery(%)', 'RSSI(dBm)', 'Timestamp'];
    const rows = telemetryList.map((t) => [
      t.id,
      t.deviceId,
      t.temperature ?? '',
      t.humidity ?? '',
      t.pressure ?? '',
      t.battery ?? '',
      t.rssi ?? '',
      t.timestamp,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `nexusflow_telemetry_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-cyan-400" />
            Telemetry Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time sensor telemetry stream, ingestion API testing, and historical data logs.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setShowManualForm(!showManualForm)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Send className="w-3.5 h-3.5 text-cyan-400" />
            {showManualForm ? 'Hide Manual Ingest' : 'Manual API Ingest'}
          </button>

          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 text-xs font-semibold border border-cyan-500/30 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Manual Ingest Drawer */}
      {showManualForm && (
        <div className="glass-panel rounded-2xl p-5 border border-cyan-500/30 shadow-lg shadow-cyan-950/40 animate-fadeIn">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Send className="w-4 h-4 text-cyan-400" />
              Manual REST API Telemetry Ingestion (POST /api/telemetry)
            </h3>
            <span className="text-[11px] text-slate-400">
              Useful for testing hardware emulation or custom sensors
            </span>
          </div>

          <form onSubmit={handleManualIngest} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Target Device</label>
              <select
                value={manualForm.deviceId}
                onChange={(e) => setManualForm({ ...manualForm, deviceId: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                {devices.map((d) => (
                  <option key={d.deviceId} value={d.deviceId}>
                    {d.deviceId} - {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Temperature (°C)</label>
              <input
                type="number"
                step="0.1"
                value={manualForm.temperature}
                onChange={(e) => setManualForm({ ...manualForm, temperature: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Humidity (%)</label>
              <input
                type="number"
                step="0.1"
                value={manualForm.humidity}
                onChange={(e) => setManualForm({ ...manualForm, humidity: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Pressure (hPa)</label>
              <input
                type="number"
                step="0.1"
                value={manualForm.pressure}
                onChange={(e) => setManualForm({ ...manualForm, pressure: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={ingesting}
                className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white font-semibold text-xs transition-all shadow-md shadow-cyan-600/30"
              >
                {ingesting ? 'Sending...' : 'Send Telemetry'}
              </button>
            </div>
          </form>

          {ingestSuccess && (
            <div className="mt-3 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{ingestSuccess}</span>
            </div>
          )}
        </div>
      )}

      {/* Filter Ribbon */}
      <div className="glass-panel rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 border border-slate-800">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-400 font-medium">Filter by Node:</span>
          <select
            value={selectedDevice}
            onChange={(e) => setSelectedDevice(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="all">⚡ All Devices ({devices.length})</option>
            {devices.map((d) => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.deviceId} ({d.name})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Streaming buffer: {telemetryList.length} readings
          </span>
          <button
            onClick={fetchTelemetry}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Telemetry Stream Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-850 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Device ID</th>
                <th className="py-3 px-4">Temperature</th>
                <th className="py-3 px-4">Humidity</th>
                <th className="py-3 px-4">Pressure</th>
                <th className="py-3 px-4">Battery</th>
                <th className="py-3 px-4">RSSI</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Evaluation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300 font-mono">
              {telemetryList.map((row, idx) => {
                const tempAlert = (row.temperature || 0) > 40;
                const humAlert = (row.humidity || 0) < 30;

                return (
                  <tr
                    key={row.id || idx}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      idx === 0 ? 'bg-cyan-950/20' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-bold text-cyan-400">
                      {row.deviceId}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`font-bold ${
                          tempAlert ? 'text-rose-400 px-1.5 py-0.5 rounded bg-rose-500/20' : 'text-slate-100'
                        }`}
                      >
                        {row.temperature !== null ? `${row.temperature}°C` : '--'}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`font-bold ${
                          humAlert ? 'text-amber-400 px-1.5 py-0.5 rounded bg-amber-500/20' : 'text-slate-100'
                        }`}
                      >
                        {row.humidity !== null ? `${row.humidity}%` : '--'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-200">
                      {row.pressure !== null ? `${row.pressure} hPa` : '--'}
                    </td>

                    <td className="py-3 px-4 text-emerald-400">
                      {row.battery !== undefined ? `${row.battery}%` : '100%'}
                    </td>

                    <td className="py-3 px-4 text-slate-400">
                      {row.rssi ? `${row.rssi} dBm` : '-60 dBm'}
                    </td>

                    <td className="py-3 px-4 text-slate-400 text-[11px] font-sans">
                      {new Date(row.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>

                    <td className="py-3 px-4 font-sans">
                      {tempAlert || humAlert ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300">
                          BREACH
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                          NORMAL
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Activity,
  AlertTriangle,
  TrendingUp,
  Radio,
  Flame,
  Droplets,
  Gauge,
  BatteryCharging,
  RefreshCw,
  Clock,
  ArrowUpRight,
  ShieldAlert,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import MetricCard from '../components/MetricCard';
import StatusBadge from '../components/StatusBadge';
import { deviceAPI, alertAPI, telemetryAPI } from '../api/client';
import { useSocket } from '../context/SocketContext';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { latestTelemetry, liveStream, alertsCount } = useSocket();
  const [devices, setDevices] = useState([]);
  const [deviceCounts, setDeviceCounts] = useState({ total: 5, online: 4, warning: 1, offline: 0 });
  const [telemetryStats, setTelemetryStats] = useState({
    totalDataPoints: 0,
    averageTemperature: 28.5,
    averageHumidity: 46.2,
    averagePressure: 1013.8,
  });
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load initial data
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [devRes, alertRes, telStatsRes, telemetryHistory] = await Promise.all([
        deviceAPI.getAll(),
        alertAPI.getAll({ limit: 5 }),
        telemetryAPI.getStats(),
        telemetryAPI.getAll({ limit: 30 }),
      ]);

      setDevices(devRes.data.devices || []);
      setDeviceCounts(devRes.data.counts || {});
      setRecentAlerts(alertRes.data.alerts?.slice(0, 5) || []);
      setTelemetryStats(telStatsRes.data || {});

      // Format historical points for charts
      const formatted = (telemetryHistory.data.telemetry || [])
        .slice()
        .reverse()
        .map((t) => ({
          time: new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          temperature: t.temperature,
          humidity: t.humidity,
          pressure: t.pressure,
          deviceId: t.deviceId,
        }));
      setChartData(formatted);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Append incoming live stream data points dynamically into chart
  useEffect(() => {
    if (liveStream.length > 0) {
      const latest = liveStream[0];
      const point = {
        time: new Date(latest.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        temperature: latest.temperature,
        humidity: latest.humidity,
        pressure: latest.pressure,
        deviceId: latest.deviceId,
      };

      setChartData((prev) => {
        const next = [...prev, point];
        return next.slice(-40); // keep last 40 points
      });

      // Update telemetry count in stats
      setTelemetryStats((prev) => ({
        ...prev,
        totalDataPoints: (prev.totalDataPoints || 0) + 1,
      }));
    }
  }, [liveStream]);

  const handleAcknowledgeAlert = async (id) => {
    try {
      await alertAPI.acknowledge(id);
      setRecentAlerts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: 'acknowledged' } : a))
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            <span>IoT Telemetry & Rule Engine Dashboard</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time multi-sensor telemetry acquisition, automated threshold evaluation & anomaly detection.
          </p>
        </div>

        <button
          onClick={loadDashboardData}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700/60 transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          Refresh Metrics
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total IoT Devices"
          value={deviceCounts.total || devices.length}
          unit="nodes"
          icon={Cpu}
          variant="cyan"
          subtext={`${deviceCounts.online || 0} active, ${deviceCounts.offline || 0} offline`}
          trend={`${deviceCounts.warning || 0} warning`}
          trendPositive={false}
        />

        <MetricCard
          title="Active Alerts"
          value={alertsCount.active ?? recentAlerts.filter((a) => a.status === 'active').length}
          unit="triggered"
          icon={AlertTriangle}
          variant={alertsCount.active > 0 ? 'rose' : 'emerald'}
          subtext={`${alertsCount.critical || 0} critical priority`}
          trend={alertsCount.active > 0 ? 'Action Required' : 'All Clear'}
          trendPositive={alertsCount.active === 0}
        />

        <MetricCard
          title="Avg Temperature"
          value={telemetryStats.averageTemperature || 28.5}
          unit="°C"
          icon={Flame}
          variant="amber"
          subtext="Target safe limit: < 40°C"
          trend="Ambient Baseline"
          trendPositive={true}
        />

        <MetricCard
          title="Telemetry Data Points"
          value={telemetryStats.totalDataPoints || 500}
          unit="readings"
          icon={Activity}
          variant="purple"
          subtext="Ingestion interval: 3s"
          trend="Live WebSocket"
          trendPositive={true}
        />
      </div>

      {/* Live Sensor Readings Grid (All active devices) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            <h2 className="text-base font-bold text-white tracking-wide">
              Live Sensor Readings & Device Telemetry
            </h2>
          </div>
          <Link
            to="/devices"
            className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
          >
            Manage All Devices ({devices.length}) <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {devices.map((device) => {
            const live = latestTelemetry[device.deviceId] || device.lastReading || {};
            const isCritical = live.temperature > 40;

            return (
              <div
                key={device.id}
                className={`rounded-2xl p-4 transition-all duration-300 ${
                  isCritical ? 'glass-panel-danger' : 'glass-panel'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                        {device.deviceId}
                      </span>
                      <StatusBadge status={device.status} />
                    </div>
                    <h3 className="font-bold text-white text-sm mt-1.5 line-clamp-1">
                      {device.name}
                    </h3>
                    <p className="text-[11px] text-slate-400">{device.location}</p>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-slate-400 bg-slate-800/80 px-2 py-1 rounded-md">
                    <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{live.battery ?? device.battery ?? 100}%</span>
                  </div>
                </div>

                {/* Sensor reading pills */}
                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800/80 text-center">
                  <div className="p-2 rounded-xl bg-slate-800/50">
                    <span className="text-[10px] text-slate-400 block font-medium">Temp</span>
                    <span
                      className={`text-base font-bold font-mono ${
                        (live.temperature || 0) > 40 ? 'text-rose-400 animate-pulse' : 'text-slate-100'
                      }`}
                    >
                      {live.temperature !== undefined ? `${live.temperature}°C` : '--'}
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-800/50">
                    <span className="text-[10px] text-slate-400 block font-medium">Humidity</span>
                    <span
                      className={`text-base font-bold font-mono ${
                        (live.humidity || 0) < 30 ? 'text-amber-400' : 'text-slate-100'
                      }`}
                    >
                      {live.humidity !== undefined ? `${live.humidity}%` : '--'}
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-800/50">
                    <span className="text-[10px] text-slate-400 block font-medium">Pressure</span>
                    <span className="text-base font-bold font-mono text-slate-100">
                      {live.pressure !== undefined ? `${live.pressure}` : '--'}
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-[10px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {live.timestamp ? new Date(live.timestamp).toLocaleTimeString() : 'Awaiting sync'}
                  </span>
                  <span>{device.type}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Real-time Chart Section */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              Live Telemetry Stream Chart
            </h2>
            <p className="text-xs text-slate-400">
              Continuous multi-sensor telemetry stream (Temperature & Humidity vs Time)
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-cyan-400 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
              Temperature (°C)
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              Humidity (%)
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="humGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="temperature"
                name="Temperature (°C)"
                stroke="#06b6d4"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#tempGradient)"
                isAnimationActive={false}
              />
              <Area
                type="monotone"
                dataKey="humidity"
                name="Humidity (%)"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#humGradient)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Alerts Feed Table */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <h2 className="text-base font-bold text-white">Recent Rule Engine Alerts</h2>
          </div>
          <Link
            to="/alerts"
            className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
          >
            View All Alerts ({alertsCount.total || recentAlerts.length}) <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentAlerts.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            No active alerts detected. All environmental thresholds within normal operating range.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-850 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Severity</th>
                  <th className="py-2.5 px-3">Device</th>
                  <th className="py-2.5 px-3">Rule Name</th>
                  <th className="py-2.5 px-3">Trigger Message</th>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {recentAlerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3">
                      <StatusBadge status={alert.severity} type="alert" />
                    </td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-white">
                      {alert.deviceId}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-200">
                      {alert.ruleName}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 max-w-xs truncate" title={alert.message}>
                      {alert.message}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 font-mono">
                      {new Date(alert.createdAt).toLocaleTimeString()}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          alert.status === 'active'
                            ? 'bg-rose-500/20 text-rose-300'
                            : alert.status === 'acknowledged'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}
                      >
                        {alert.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {alert.status === 'active' ? (
                        <button
                          onClick={() => handleAcknowledgeAlert(alert.id)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold border border-slate-700 transition-colors"
                        >
                          Acknowledge
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-500">Acknowledged</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

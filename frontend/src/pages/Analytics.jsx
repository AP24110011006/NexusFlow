import React, { useState, useEffect } from 'react';
import {
  LineChart as LineChartIcon,
  BarChart3,
  Calendar,
  Filter,
  Download,
  Flame,
  Droplets,
  Gauge,
  TrendingUp,
  Cpu,
  RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { analyticsAPI, deviceAPI } from '../api/client';

export default function Analytics() {
  const [range, setRange] = useState('24h');
  const [selectedDevice, setSelectedDevice] = useState('all');
  const [metricTab, setMetricTab] = useState('temperature');
  const [trendData, setTrendData] = useState([]);
  const [comparisonData, setComparisonData] = useState([]);
  const [sensorStats, setSensorStats] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [trendRes, compRes, statsRes, devRes] = await Promise.all([
        analyticsAPI.getTrends({ range, deviceId: selectedDevice, metric: metricTab }),
        analyticsAPI.getComparison(),
        analyticsAPI.getSensorStats(),
        deviceAPI.getAll(),
      ]);

      setTrendData(trendRes.data.data || []);
      setComparisonData(compRes.data.comparison || []);
      setSensorStats(statsRes.data.sensorStatistics || []);
      setDevices(devRes.data.devices || []);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [range, selectedDevice, metricTab]);

  // Format device comparison data for Recharts Bar Chart
  const barChartData = comparisonData.map((d) => ({
    name: d.deviceId,
    avgTemp: d.temperature.avg,
    maxTemp: d.temperature.max,
    avgHum: d.humidity.avg,
    avgPres: d.pressure.avg,
  }));

  const exportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({
      range,
      deviceId: selectedDevice,
      trends: trendData,
      comparison: comparisonData,
      statistics: sensorStats,
      exportedAt: new Date().toISOString(),
    }, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `nexusflow_analytics_${range}_${Date.now()}.json`);
    dlAnchor.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <LineChartIcon className="w-6 h-6 text-cyan-400" />
            Visual Analytics & Telemetry Insights
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Historical trends, comparative device baselines, variance statistics, and sensor health metrics.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={exportJSON}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 text-xs font-semibold border border-cyan-500/30 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export Report (JSON)
          </button>
        </div>
      </div>

      {/* Control bar: Time horizon & Device filters */}
      <div className="glass-panel rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 border border-slate-800">
        <div className="flex flex-wrap items-center gap-3">
          {/* Time range selector */}
          <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/80 text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400 ml-2 mr-1" />
            {[
              { id: '1h', label: 'Past 1h' },
              { id: '6h', label: 'Past 6h' },
              { id: '24h', label: 'Past 24h' },
              { id: '7d', label: 'Past 7d' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setRange(t.id)}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  range === t.id
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Device filter */}
          <select
            value={selectedDevice}
            onChange={(e) => setSelectedDevice(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="all">⚡ All Devices Aggregated</option>
            {devices.map((d) => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.deviceId} ({d.name})
              </option>
            ))}
          </select>
        </div>

        {/* Metric tab pills */}
        <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-xl border border-slate-700/80 text-xs">
          <button
            onClick={() => setMetricTab('temperature')}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg font-medium ${
              metricTab === 'temperature'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            Temperature
          </button>

          <button
            onClick={() => setMetricTab('humidity')}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg font-medium ${
              metricTab === 'humidity'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Droplets className="w-3.5 h-3.5" />
            Humidity
          </button>

          <button
            onClick={() => setMetricTab('pressure')}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg font-medium ${
              metricTab === 'pressure'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Gauge className="w-3.5 h-3.5" />
            Pressure
          </button>
        </div>
      </div>

      {/* Main Historical Trend Line Chart */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              Historical Time-Series Trend ({metricTab.toUpperCase()})
            </h2>
            <p className="text-xs text-slate-400">
              Interpolated sensor readings plotted over the selected time window ({range})
            </p>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  fontSize: '12px',
                }}
              />
              <Legend />
              {metricTab === 'temperature' && (
                <Line
                  type="monotone"
                  dataKey="temperature"
                  name="Temperature (°C)"
                  stroke="#06b6d4"
                  strokeWidth={2.5}
                  dot={{ r: 2, fill: '#06b6d4' }}
                  activeDot={{ r: 6 }}
                />
              )}
              {metricTab === 'humidity' && (
                <Line
                  type="monotone"
                  dataKey="humidity"
                  name="Humidity (%)"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 2, fill: '#10b981' }}
                  activeDot={{ r: 6 }}
                />
              )}
              {metricTab === 'pressure' && (
                <Line
                  type="monotone"
                  dataKey="pressure"
                  name="Pressure (hPa)"
                  stroke="#a855f7"
                  strokeWidth={2.5}
                  dot={{ r: 2, fill: '#a855f7' }}
                  activeDot={{ r: 6 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Comparative Bar Chart: Multi-device comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <h2 className="text-base font-bold text-white flex items-center gap-2 mb-1">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            Device-wise Temperature Comparison
          </h2>
          <p className="text-xs text-slate-400 mb-4">
            Average vs Maximum recorded temperature per node (°C)
          </p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                  }}
                />
                <Legend />
                <Bar dataKey="avgTemp" name="Avg Temp (°C)" fill="#06b6d4" radius={[6, 6, 0, 0]} />
                <Bar dataKey="maxTemp" name="Max Temp (°C)" fill="#f43f5e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <h2 className="text-base font-bold text-white flex items-center gap-2 mb-1">
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            Device-wise Humidity Distribution
          </h2>
          <p className="text-xs text-slate-400 mb-4">
            Average relative humidity per monitored location (%)
          </p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                  }}
                />
                <Legend />
                <Bar dataKey="avgHum" name="Avg Humidity (%)" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Sensor Performance & Statistical Health Table */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800">
        <h2 className="text-base font-bold text-white mb-1">Sensor Performance Statistics & Stability</h2>
        <p className="text-xs text-slate-400 mb-4">
          Detailed telemetry aggregations, standard deviation (σ), threshold breach count, and calculated reliability score.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-850 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Device Node</th>
                <th className="py-2.5 px-3">Location</th>
                <th className="py-2.5 px-3">Total Samples</th>
                <th className="py-2.5 px-3">Min Temp</th>
                <th className="py-2.5 px-3">Max Temp</th>
                <th className="py-2.5 px-3">Mean (Avg)</th>
                <th className="py-2.5 px-3">Std Dev (σ)</th>
                <th className="py-2.5 px-3">Breaches</th>
                <th className="py-2.5 px-3 text-right">Health Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300 font-mono">
              {sensorStats.map((stat) => (
                <tr key={stat.deviceId} className="hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-bold text-white">{stat.deviceId}</td>
                  <td className="py-2.5 px-3 font-sans text-slate-400">{stat.location}</td>
                  <td className="py-2.5 px-3 text-slate-300">{stat.totalReadings}</td>
                  <td className="py-2.5 px-3 text-cyan-400">{stat.tempMin}°C</td>
                  <td className="py-2.5 px-3 text-rose-400 font-bold">{stat.tempMax}°C</td>
                  <td className="py-2.5 px-3 text-slate-200">{stat.tempAvg}°C</td>
                  <td className="py-2.5 px-3 text-slate-400">±{stat.tempStdDev}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        stat.alertsCount > 0 ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                      }`}
                    >
                      {stat.alertsCount}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-sans">
                    <span
                      className={`font-bold ${
                        stat.healthScore > 85 ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {stat.healthScore}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

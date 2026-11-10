import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Filter,
  Check,
  Trash2,
  RefreshCw,
  ShieldAlert,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { alertAPI, deviceAPI } from '../api/client';
import StatusBadge from '../components/StatusBadge';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

export default function Alerts() {
  const { alertsCount, audioEnabled, setAudioEnabled } = useSocket();
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [devices, setDevices] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [deviceFilter, setDeviceFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const [alertRes, devRes] = await Promise.all([
        alertAPI.getAll({
          status: statusFilter,
          severity: severityFilter,
          deviceId: deviceFilter,
        }),
        deviceAPI.getAll(),
      ]);
      setAlerts(alertRes.data.alerts || []);
      setDevices(devRes.data.devices || []);
    } catch (err) {
      console.error('Error fetching alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [statusFilter, severityFilter, deviceFilter]);

  const handleAcknowledge = async (id) => {
    try {
      await alertAPI.acknowledge(id, user?.name || 'Operator');
      fetchAlerts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolve = async (id) => {
    const note = window.prompt('Resolution notes (e.g. Temperature stabilized via ventilation):', 'Condition normalized');
    if (note !== null) {
      try {
        await alertAPI.resolve(id, user?.name || 'Operator', note);
        fetchAlerts();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleClearResolved = async () => {
    if (window.confirm('Clear all resolved alerts from the system history?')) {
      try {
        await alertAPI.clearResolved();
        fetchAlerts();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-rose-400" />
            Alert Management & Incident Response
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time feed of rule engine detections, incident lifecycle tracking, and resolution auditing.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            {audioEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                Audio Alert: ON
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                Audio Alert: OFF
              </>
            )}
          </button>

          <button
            onClick={handleClearResolved}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear Resolved
          </button>
        </div>
      </div>

      {/* KPI Severity Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-panel rounded-xl p-4 border border-rose-500/20">
          <span className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider">
            Critical Alerts
          </span>
          <p className="text-2xl font-extrabold text-white font-mono mt-1">
            {alertsCount.critical || 0}
          </p>
          <span className="text-[10px] text-slate-400">Immediate action needed</span>
        </div>

        <div className="glass-panel rounded-xl p-4 border border-amber-500/20">
          <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">
            Warning Alerts
          </span>
          <p className="text-2xl font-extrabold text-white font-mono mt-1">
            {alertsCount.warning || 0}
          </p>
          <span className="text-[10px] text-slate-400">Threshold deviation</span>
        </div>

        <div className="glass-panel rounded-xl p-4 border border-cyan-500/20">
          <span className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider">
            Acknowledged
          </span>
          <p className="text-2xl font-extrabold text-white font-mono mt-1">
            {alertsCount.acknowledged || 0}
          </p>
          <span className="text-[10px] text-slate-400">Under investigation</span>
        </div>

        <div className="glass-panel rounded-xl p-4 border border-emerald-500/20">
          <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
            Resolved
          </span>
          <p className="text-2xl font-extrabold text-white font-mono mt-1">
            {alertsCount.resolved || 0}
          </p>
          <span className="text-[10px] text-slate-400">Operating normal</span>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="glass-panel rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 border border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          {/* Status filter */}
          <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/80 text-xs">
            {['all', 'active', 'acknowledged', 'resolved'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg capitalize font-medium transition-colors ${
                  statusFilter === st
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Severity filter */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Severities</option>
            <option value="critical">🚨 Critical</option>
            <option value="warning">⚠️ Warning</option>
            <option value="info">ℹ️ Info</option>
          </select>

          {/* Device filter */}
          <select
            value={deviceFilter}
            onChange={(e) => setDeviceFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Devices</option>
            {devices.map((d) => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.deviceId}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={fetchAlerts}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-3">
        {alerts.map((alert) => {
          const isCritical = alert.severity === 'critical';
          const isResolved = alert.status === 'resolved';

          return (
            <div
              key={alert.id}
              className={`rounded-2xl p-5 border transition-all duration-200 ${
                isResolved
                  ? 'bg-slate-900/40 border-slate-800/60 opacity-70'
                  : isCritical
                  ? 'glass-panel-danger'
                  : 'glass-panel hover:border-slate-700'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                      isCritical
                        ? 'bg-rose-500/10 text-rose-400'
                        : alert.severity === 'warning'
                        ? 'bg-amber-500/10 text-amber-400'
                        : 'bg-cyan-500/10 text-cyan-400'
                    }`}
                  >
                    <ShieldAlert className="w-5 h-5" />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-white">
                        {alert.deviceId}
                      </span>
                      <StatusBadge status={alert.severity} type="alert" />
                      <span className="text-xs font-semibold text-slate-300 font-mono">
                        {alert.ruleName}
                      </span>
                    </div>

                    <p className="text-sm font-semibold text-white mt-1.5">{alert.message}</p>

                    <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        {new Date(alert.createdAt).toLocaleString()}
                      </span>

                      {alert.acknowledgedAt && (
                        <span className="text-amber-400">
                          Acknowledged by {alert.acknowledgedBy || 'Operator'}
                        </span>
                      )}

                      {alert.resolvedAt && (
                        <span className="text-emerald-400">
                          Resolved: {alert.resolutionNote || 'Condition normalized'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  {alert.status === 'active' && (
                    <button
                      onClick={() => handleAcknowledge(alert.id)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                    >
                      Acknowledge
                    </button>
                  )}

                  {alert.status !== 'resolved' && (
                    <button
                      onClick={() => handleResolve(alert.id)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-semibold border border-emerald-500/30 transition-colors"
                    >
                      Resolve Incident
                    </button>
                  )}

                  {alert.status === 'resolved' && (
                    <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400 px-3 py-1 rounded-lg bg-emerald-500/10">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Resolved
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {alerts.length === 0 && !loading && (
          <div className="glass-panel rounded-2xl p-12 text-center border border-slate-800">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-200">No Alerts Matching Filter</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              All sensors and monitored environmental metrics are operating within their defined thresholds.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

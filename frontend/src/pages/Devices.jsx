import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit2,
  RefreshCw,
  Power,
  Activity,
  Wifi,
  MapPin,
  Clock,
  Battery,
  AlertCircle,
  Eye,
  X,
} from 'lucide-react';
import { deviceAPI } from '../api/client';
import StatusBadge from '../components/StatusBadge';
import AddDeviceModal from '../components/AddDeviceModal';
import { useSocket } from '../context/SocketContext';

export default function Devices() {
  const { latestTelemetry } = useSocket();
  const [devices, setDevices] = useState([]);
  const [counts, setCounts] = useState({ total: 0, online: 0, warning: 0, offline: 0 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [deviceDetails, setDeviceDetails] = useState(null);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const res = await deviceAPI.getAll({
        search,
        status: statusFilter,
        type: typeFilter,
      });
      setDevices(res.data.devices || []);
      setCounts(res.data.counts || {});
    } catch (err) {
      console.error('Error fetching devices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, [statusFilter, typeFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDevices();
  };

  const handleDelete = async (id, deviceId) => {
    if (window.confirm(`Are you sure you want to unregister device ${deviceId}?`)) {
      try {
        await deviceAPI.delete(id);
        fetchDevices();
        if (selectedDevice?.id === id) {
          setSelectedDevice(null);
        }
      } catch (err) {
        alert(err.response?.data?.error || err.message);
      }
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await deviceAPI.toggleStatus(id);
      fetchDevices();
      if (selectedDevice?.id === id) {
        viewDeviceDetails(selectedDevice);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const viewDeviceDetails = async (dev) => {
    setSelectedDevice(dev);
    try {
      setDetailsLoading(true);
      const res = await deviceAPI.getById(dev.id);
      setDeviceDetails(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <Cpu className="w-6 h-6 text-cyan-400" />
            Device Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Register, provision, and monitor hardware sensor nodes and gateway telemetry links.
          </p>
        </div>

        <button
          onClick={() => setAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white font-semibold text-xs shadow-lg shadow-cyan-600/25 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Register New Device
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-3 border border-slate-800">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by ID, name or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Status quick tabs */}
          <div className="flex items-center bg-slate-800/60 p-1 rounded-xl border border-slate-700/60 text-xs">
            {['all', 'online', 'warning', 'offline'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg capitalize font-medium transition-colors ${
                  statusFilter === st
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {st} {counts[st] !== undefined ? `(${counts[st]})` : ''}
              </button>
            ))}
          </div>

          <button
            onClick={fetchDevices}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60"
            title="Refresh device list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Devices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {devices.map((device) => {
          const live = latestTelemetry[device.deviceId] || device.lastReading || {};

          return (
            <div
              key={device.id}
              className="glass-panel rounded-2xl p-5 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                      {device.deviceId}
                    </span>
                    <h3 className="text-base font-bold text-white mt-1.5">{device.name}</h3>
                  </div>
                  <StatusBadge status={device.status} />
                </div>

                <div className="mt-3 space-y-1.5 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{device.location || 'Unassigned location'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Wifi className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="font-mono text-slate-300">{device.ipAddress}</span>
                    <span className="text-slate-600">•</span>
                    <span>{device.type}</span>
                  </div>
                </div>

                {/* Telemetry Snapshot Cards */}
                <div className="grid grid-cols-3 gap-2 mt-4 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                  <div>
                    <span className="text-[10px] text-slate-400">Temp</span>
                    <p className="text-sm font-bold font-mono text-cyan-300">
                      {live.temperature !== undefined ? `${live.temperature}°C` : '--'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">Humidity</span>
                    <p className="text-sm font-bold font-mono text-emerald-300">
                      {live.humidity !== undefined ? `${live.humidity}%` : '--'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">Pressure</span>
                    <p className="text-sm font-bold font-mono text-slate-200">
                      {live.pressure !== undefined ? `${live.pressure}` : '--'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions footer */}
              <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <button
                  onClick={() => viewDeviceDetails(device)}
                  className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-semibold"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View Details
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleToggleStatus(device.id)}
                    title={`Toggle status (currently ${device.status})`}
                    className={`p-1.5 rounded-lg border transition-colors ${
                      device.status === 'offline'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDelete(device.id, device.deviceId)}
                    title="Remove Device"
                    className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {devices.length === 0 && !loading && (
        <div className="glass-panel rounded-2xl p-12 text-center border border-slate-800">
          <Cpu className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-300">No IoT Devices Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            No devices matched your query or filter criteria. Register a new device to start streaming.
          </p>
          <button
            onClick={() => setAddModalOpen(true)}
            className="mt-4 px-4 py-2 rounded-xl bg-cyan-600 text-white text-xs font-semibold"
          >
            Register Device
          </button>
        </div>
      )}

      {/* Device Detail Drawer / Modal */}
      {selectedDevice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-850">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-cyan-400" />
                <div>
                  <h3 className="font-bold text-white text-base">{selectedDevice.name}</h3>
                  <p className="text-xs font-mono text-cyan-400">{selectedDevice.deviceId}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDevice(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-500">Status</span>
                  <div className="mt-1">
                    <StatusBadge status={selectedDevice.status} />
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">Hardware MAC</span>
                  <p className="font-mono text-slate-200 mt-1">{selectedDevice.macAddress || '00:1A:2B:3C:4D:01'}</p>
                </div>
                <div>
                  <span className="text-slate-500">IP Address</span>
                  <p className="font-mono text-slate-200 mt-1">{selectedDevice.ipAddress || '192.168.1.101'}</p>
                </div>
                <div>
                  <span className="text-slate-500">Firmware</span>
                  <p className="font-mono text-slate-200 mt-1">{selectedDevice.firmware || 'v2.4.0'}</p>
                </div>
                <div>
                  <span className="text-slate-500">Reporting Interval</span>
                  <p className="font-mono text-slate-200 mt-1">{selectedDevice.reportingInterval || 3} seconds</p>
                </div>
                <div>
                  <span className="text-slate-500">Total Telemetry Sent</span>
                  <p className="font-mono text-cyan-400 mt-1">{selectedDevice.telemetryCount || 120} packets</p>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Active Alerts on this Device ({deviceDetails?.activeAlerts?.length || 0})
                </h4>
                {deviceDetails?.activeAlerts?.length > 0 ? (
                  <div className="space-y-2">
                    {deviceDetails.activeAlerts.map((a) => (
                      <div
                        key={a.id}
                        className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300"
                      >
                        <span className="font-bold">{a.ruleName}:</span> {a.message}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">No active alerts for this device.</p>
                )}
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-850 border-t border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => setSelectedDevice(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Device Modal */}
      <AddDeviceModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onDeviceAdded={fetchDevices}
      />
    </div>
  );
}

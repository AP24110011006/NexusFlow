import React, { useState } from 'react';
import { X, Cpu, MapPin, Tag, Clock } from 'lucide-react';
import { deviceAPI } from '../api/client';

export default function AddDeviceModal({ isOpen, onClose, onDeviceAdded }) {
  const [formData, setFormData] = useState({
    deviceId: '',
    name: '',
    type: 'Environmental Sensor',
    location: '',
    reportingInterval: 3,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.deviceId.trim() || !formData.name.trim()) {
      setError('Device ID and Device Name are required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await deviceAPI.create(formData);
      onDeviceAdded();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-850">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Register New IoT Device</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Device Identifier (ID) *
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. SENSOR_006"
                value={formData.deviceId}
                onChange={(e) => setFormData({ ...formData, deviceId: e.target.value.toUpperCase() })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white font-mono placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                required
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Unique alphanumeric hardware tag</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Device Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Chemical Storage Probe"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Device Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="Environmental Sensor">Environmental Sensor (Temp/Humidity)</option>
              <option value="HVAC Monitor">HVAC Monitor & Climate Controller</option>
              <option value="Industrial Pressure & Temp">Industrial Pressure & Temp</option>
              <option value="Precision Microclimate">Precision Microclimate (Cleanroom)</option>
              <option value="Cryo Logistics Probe">Cryo Logistics Probe (Cold Storage)</option>
              <option value="Smart Agriculture Node">Smart Agriculture Node</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Physical Location
            </label>
            <input
              type="text"
              placeholder="e.g. Building 2 - Bay 4"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Telemetry Ingestion Interval (seconds)
            </label>
            <input
              type="number"
              min="1"
              max="60"
              value={formData.reportingInterval}
              onChange={(e) => setFormData({ ...formData, reportingInterval: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white font-semibold text-sm shadow-lg shadow-cyan-600/30 transition-all disabled:opacity-50"
            >
              {loading ? 'Registering...' : 'Register Device'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

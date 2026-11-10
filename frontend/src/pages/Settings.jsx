import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  User,
  Sliders,
  Radio,
  Server,
  RotateCcw,
  CheckCircle2,
  HardDrive,
  Cpu,
  Layers,
  Save,
} from 'lucide-react';
import { settingsAPI, authAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

export default function Settings() {
  const { user, switchUser } = useAuth();
  const { simulatorStatus, startSimulator, stopSimulator, audioEnabled, setAudioEnabled } = useSocket();

  const [settings, setSettings] = useState({
    appName: 'NexusFlow',
    appVersion: '1.0.0',
    internshipRef: 'ITS/WEB/1849',
    internName: 'Koneti Manikanth',
    company: 'Infotact Solutions',
    simulatorInterval: 3000,
    audioAlerts: true,
    mqtt: {
      enabled: false,
      broker: 'mqtt://broker.emqx.io:1883',
      topicPrefix: 'nexusflow/telemetry/+',
      clientId: 'nexusflow_server_01',
    },
  });

  const [diagnostics, setDiagnostics] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const [settRes, diagRes] = await Promise.all([
          settingsAPI.get(),
          settingsAPI.getDiagnostics(),
        ]);
        if (settRes.data) setSettings(settRes.data);
        if (diagRes.data) setDiagnostics(diagRes.data);
      } catch (err) {
        console.error('Error fetching settings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      await settingsAPI.update(settings);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
  };

  const handleResetDemo = async () => {
    if (window.confirm('Reset all demo data to initial factory state?')) {
      try {
        await settingsAPI.resetDemo();
        setResetSuccess(true);
        setTimeout(() => {
          setResetSuccess(false);
          window.location.reload();
        }, 1500);
      } catch (err) {
        alert(err.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-cyan-400" />
            Settings & System Configuration
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Application preferences, internship metadata, MQTT connectivity, and system diagnostics.
          </p>
        </div>

        <button
          onClick={handleResetDemo}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 text-xs font-semibold border border-slate-700 transition-colors self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Demo Data
        </button>
      </div>

      {resetSuccess && (
        <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          Demo data reset successfully! Reloading platform...
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: User Profile Card & Internship credentials */}
        <div className="space-y-6">
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 text-center">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'}
              alt={user?.name}
              className="w-20 h-20 rounded-2xl mx-auto object-cover ring-2 ring-cyan-500/50 shadow-xl shadow-cyan-500/20"
            />
            <h2 className="text-lg font-bold text-white mt-3">{user?.name}</h2>
            <p className="text-xs text-cyan-400 font-semibold">{user?.role}</p>
            <p className="text-xs text-slate-400 mt-0.5">{user?.organization || 'Infotact Solutions'}</p>

            <div className="mt-5 pt-5 border-t border-slate-800 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Assignment Ref:</span>
                <span className="font-mono text-cyan-300 font-bold">{user?.refNo || 'ITS/WEB/1849'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Domain:</span>
                <span className="text-slate-300">Web Development</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Duration:</span>
                <span className="text-slate-300">10/11/2026 - 10/12/2026</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Email:</span>
                <span className="text-slate-300 font-mono text-[11px]">{user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Contact:</span>
                <span className="text-slate-300 font-mono">{user?.phone || '+91 7989612028'}</span>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-800 flex gap-2">
              <button
                onClick={() => switchUser('intern')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold ${
                  user?.id === 'usr_manikanth'
                    ? 'bg-cyan-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Intern View
              </button>
              <button
                onClick={() => switchUser('admin')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold ${
                  user?.id === 'usr_admin'
                    ? 'bg-cyan-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Admin View
              </button>
            </div>
          </div>

          {/* System Diagnostics */}
          {diagnostics && (
            <div className="glass-panel rounded-2xl p-5 border border-slate-800 text-xs">
              <h3 className="font-bold text-white flex items-center gap-2 mb-3">
                <HardDrive className="w-4 h-4 text-cyan-400" />
                Backend Diagnostics
              </h3>
              <div className="space-y-2 text-slate-400 font-mono">
                <div className="flex justify-between">
                  <span>Node.js Version:</span>
                  <span className="text-slate-200">{diagnostics.nodeVersion}</span>
                </div>
                <div className="flex justify-between">
                  <span>Platform:</span>
                  <span className="text-slate-200">{diagnostics.platform} ({diagnostics.arch})</span>
                </div>
                <div className="flex justify-between">
                  <span>Process Uptime:</span>
                  <span className="text-slate-200">{diagnostics.uptimeSeconds}s</span>
                </div>
                <div className="flex justify-between">
                  <span>Memory (RSS):</span>
                  <span className="text-cyan-400">{diagnostics.memory?.rssMb} MB</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Records:</span>
                  <span className="text-emerald-400">
                    {diagnostics.counts?.telemetry || 0} telemetry points
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Columns: Configuration Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSaveSettings} className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-5">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-cyan-400" />
              Application Preferences & Simulation Parameters
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Platform Title
                </label>
                <input
                  type="text"
                  value={settings.appName}
                  onChange={(e) => setSettings({ ...settings, appName: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Internship Organization
                </label>
                <input
                  type="text"
                  value={settings.company}
                  onChange={(e) => setSettings({ ...settings, company: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Telemetry Stream Frequency
                </label>
                <select
                  value={settings.simulatorInterval}
                  onChange={(e) => setSettings({ ...settings, simulatorInterval: parseInt(e.target.value, 10) })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                >
                  <option value={1000}>1000 ms (Fast - High Throughput)</option>
                  <option value={2000}>2000 ms (Standard)</option>
                  <option value={3000}>3000 ms (Recommended Demo)</option>
                  <option value={5000}>5000 ms (Low Bandwidth)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Audio Alert Notifications
                </label>
                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="audioCheck"
                    checked={audioEnabled}
                    onChange={(e) => setAudioEnabled(e.target.checked)}
                    className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500 bg-slate-800 border-slate-700"
                  />
                  <label htmlFor="audioCheck" className="text-xs text-slate-300">
                    Play audio chime on Critical Rule Engine triggers
                  </label>
                </div>
              </div>
            </div>

            {/* MQTT Broker Configuration Section */}
            <div className="pt-4 border-t border-slate-800">
              <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-2">
                <Radio className="w-4 h-4 text-cyan-400" />
                LoRaWAN & MQTT Broker Integration Settings
              </h4>
              <p className="text-xs text-slate-400 mb-4">
                Configure external MQTT broker for real physical hardware sensors (e.g. ESP32, Raspberry Pi, Arduino).
              </p>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">MQTT Broker URL</label>
                  <input
                    type="text"
                    value={settings.mqtt?.broker || 'mqtt://broker.emqx.io:1883'}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        mqtt: { ...settings.mqtt, broker: e.target.value },
                      })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Topic Ingestion Pattern</label>
                    <input
                      type="text"
                      value={settings.mqtt?.topicPrefix || 'nexusflow/telemetry/+'}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          mqtt: { ...settings.mqtt, topicPrefix: e.target.value },
                        })
                      }
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Client ID</label>
                    <input
                      type="text"
                      value={settings.mqtt?.clientId || 'nexusflow_server_01'}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          mqtt: { ...settings.mqtt, clientId: e.target.value },
                        })
                      }
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              {saveSuccess && (
                <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  Configurations saved successfully!
                </span>
              )}
              <div className="ml-auto">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white font-semibold text-xs shadow-lg shadow-cyan-600/30 transition-all"
                >
                  <Save className="w-4 h-4" />
                  Save Configurations
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { X, GitBranch, Zap, Play, CheckCircle2, AlertTriangle } from 'lucide-react';
import { ruleAPI } from '../api/client';

export default function CreateRuleModal({ isOpen, onClose, onRuleCreated, devices = [] }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    deviceId: 'all',
    metric: 'temperature',
    operator: '>',
    threshold: 40,
    severity: 'critical',
    actionType: 'alert',
    cooldownSeconds: 30,
    messageTemplate: 'High temperature alert: {{value}}°C exceeds configured threshold {{threshold}}°C on {{device}}',
  });

  const [testValue, setTestValue] = useState(45);
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  // Handle metric change to update sensible default message template
  const handleMetricChange = (metric) => {
    let unit = '°C';
    let defaultMsg = `Alert: {{metric}} ({{value}}${unit}) ${formData.operator} {{threshold}}${unit} on {{device}}`;

    if (metric === 'humidity') {
      unit = '%';
      defaultMsg = `Humidity condition: {{value}}% ${formData.operator} {{threshold}}% on {{device}}`;
    } else if (metric === 'pressure') {
      unit = ' hPa';
      defaultMsg = `Pressure breach: {{value}} hPa on {{device}}!`;
    } else if (metric === 'battery') {
      unit = '%';
      defaultMsg = `Battery warning: {{value}}% remaining on {{device}}`;
    }

    setFormData({
      ...formData,
      metric,
      messageTemplate: defaultMsg,
    });
  };

  const handleTestSandbox = async () => {
    try {
      const payload = {
        rule: formData,
        sampleTelemetry: {
          [formData.metric]: Number(testValue),
        },
      };
      const res = await ruleAPI.test(payload);
      setTestResult(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Rule Name is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await ruleAPI.create({
        ...formData,
        threshold: Number(formData.threshold),
        cooldownSeconds: Number(formData.cooldownSeconds),
      });
      onRuleCreated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-850">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <GitBranch className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Visual Rule Engine Builder</h3>
              <p className="text-xs text-slate-400">Configure automated condition evaluation & alert triggers</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 text-xs rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Rule Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Critical High Temperature Breach"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Target Device Scope
              </label>
              <select
                value={formData.deviceId}
                onChange={(e) => setFormData({ ...formData, deviceId: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="all">⚡ All Connected Devices</option>
                {devices.map((d) => (
                  <option key={d.deviceId} value={d.deviceId}>
                    {d.name} ({d.deviceId})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Rule Description
            </label>
            <input
              type="text"
              placeholder="e.g. Evaluates temperature readings and flags values exceeding 40°C"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Condition Builder Expression */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-cyan-400" />
              Condition Statement: IF (Metric [Operator] Threshold)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Target Metric</label>
                <select
                  value={formData.metric}
                  onChange={(e) => handleMetricChange(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="temperature">Temperature (°C)</option>
                  <option value="humidity">Humidity (%)</option>
                  <option value="pressure">Pressure (hPa)</option>
                  <option value="battery">Battery Level (%)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Operator</label>
                <select
                  value={formData.operator}
                  onChange={(e) => setFormData({ ...formData, operator: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono font-bold focus:outline-none focus:border-cyan-500"
                >
                  <option value=">">&gt; (Greater Than)</option>
                  <option value="<">&lt; (Less Than)</option>
                  <option value=">=">&gt;= (Greater or Equal)</option>
                  <option value="<=">&lt;= (Less or Equal)</option>
                  <option value="==">== (Exactly Equals)</option>
                  <option value="!=">!= (Not Equal)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Threshold Value</label>
                <input
                  type="number"
                  step="any"
                  value={formData.threshold}
                  onChange={(e) => setFormData({ ...formData, threshold: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>
            </div>

            <div className="pt-2 text-xs text-slate-400 flex items-center gap-2">
              <span>Preview condition:</span>
              <span className="font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30 font-semibold">
                reading.{formData.metric} {formData.operator} {formData.threshold}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Alert Severity Level
              </label>
              <select
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="critical">🚨 Critical (Urgent response required)</option>
                <option value="warning">⚠️ Warning (Abnormal operation)</option>
                <option value="info">ℹ️ Info (Informational threshold)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Cooldown Window (seconds)
              </label>
              <input
                type="number"
                min="0"
                max="3600"
                value={formData.cooldownSeconds}
                onChange={(e) => setFormData({ ...formData, cooldownSeconds: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-cyan-500"
              />
              <p className="text-[11px] text-slate-500 mt-1">Suppresses duplicate alert floods</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Alert Message Template
            </label>
            <input
              type="text"
              value={formData.messageTemplate}
              onChange={(e) => setFormData({ ...formData, messageTemplate: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono text-xs"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Supports tokens: <code className="text-cyan-400">{'{{value}}'}</code>, <code className="text-cyan-400">{'{{threshold}}'}</code>, <code className="text-cyan-400">{'{{device}}'}</code>, <code className="text-cyan-400">{'{{metric}}'}</code>
            </p>
          </div>

          {/* Interactive Rule Sandbox Tester */}
          <div className="p-3 rounded-xl bg-slate-850 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Play className="w-3.5 h-3.5 text-cyan-400" />
                Live Rule Sandbox Tester
              </span>
              <button
                type="button"
                onClick={handleTestSandbox}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 border border-cyan-500/40"
              >
                Evaluate Now
              </button>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400">Hypothetical {formData.metric}:</span>
              <input
                type="number"
                value={testValue}
                onChange={(e) => setTestValue(e.target.value)}
                className="w-24 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
              />
              {testResult && (
                <div
                  className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md ${
                    testResult.matched
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {testResult.matched ? (
                    <>
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                      <span>{testResult.reason}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{testResult.reason}</span>
                    </>
                  )}
                </div>
              )}
            </div>
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
              {loading ? 'Creating...' : 'Save Rule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

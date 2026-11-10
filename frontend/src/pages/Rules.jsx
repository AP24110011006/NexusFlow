import React, { useState, useEffect } from 'react';
import {
  GitBranch,
  Plus,
  Play,
  Trash2,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  Zap,
  Flame,
  Droplets,
  Gauge,
  Battery,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { ruleAPI, deviceAPI } from '../api/client';
import CreateRuleModal from '../components/CreateRuleModal';
import StatusBadge from '../components/StatusBadge';

export default function Rules() {
  const [rules, setRules] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Quick Rule Sandbox test
  const [testRuleId, setTestRuleId] = useState('');
  const [testValue, setTestValue] = useState(42.5);
  const [testFeedback, setTestFeedback] = useState(null);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const [rulesRes, devRes] = await Promise.all([
        ruleAPI.getAll(),
        deviceAPI.getAll(),
      ]);
      setRules(rulesRes.data.rules || []);
      setDevices(devRes.data.devices || []);
      if (rulesRes.data.rules?.length > 0 && !testRuleId) {
        setTestRuleId(rulesRes.data.rules[0].id);
      }
    } catch (err) {
      console.error('Error fetching rules:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleToggle = async (id) => {
    try {
      await ruleAPI.toggle(id);
      setRules((prev) =>
        prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Delete rule "${name}"?`)) {
      try {
        await ruleAPI.delete(id);
        setRules((prev) => prev.filter((r) => r.id !== id));
      } catch (err) {
        alert(err.response?.data?.error || err.message);
      }
    }
  };

  const handleSandboxEvaluate = async () => {
    const selected = rules.find((r) => r.id === testRuleId);
    if (!selected) return;

    try {
      const res = await ruleAPI.test({
        rule: selected,
        sampleTelemetry: {
          [selected.metric]: Number(testValue),
        },
      });
      setTestFeedback(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const getMetricIcon = (metric) => {
    switch (metric?.toLowerCase()) {
      case 'temperature':
        return <Flame className="w-4 h-4 text-cyan-400" />;
      case 'humidity':
        return <Droplets className="w-4 h-4 text-emerald-400" />;
      case 'pressure':
        return <Gauge className="w-4 h-4 text-purple-400" />;
      case 'battery':
        return <Battery className="w-4 h-4 text-amber-400" />;
      default:
        return <Zap className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <GitBranch className="w-6 h-6 text-cyan-400" />
            Rule Engine & Automated Condition Evaluator
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Core event detection logic: evaluate live telemetry stream against condition expressions and trigger alerts.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white font-semibold text-xs shadow-lg shadow-cyan-600/25 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create New Rule
        </button>
      </div>

      {/* Interactive Sandbox Test Banner */}
      <div className="glass-panel-glow rounded-2xl p-5 border border-cyan-500/30">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Live Rule Engine Sandbox Simulator
            </span>
            <p className="text-xs text-slate-400 mt-0.5">
              Test how any configured rule evaluates hypothetical sensor values before deploying.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <select
              value={testRuleId}
              onChange={(e) => {
                setTestRuleId(e.target.value);
                setTestFeedback(null);
              }}
              className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              {rules.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.metric} {r.operator} {r.threshold})
                </option>
              ))}
            </select>

            <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-xl px-2 py-1">
              <span className="text-[11px] text-slate-400">Value:</span>
              <input
                type="number"
                value={testValue}
                onChange={(e) => setTestValue(e.target.value)}
                className="w-20 bg-transparent text-xs font-mono text-white focus:outline-none"
              />
            </div>

            <button
              onClick={handleSandboxEvaluate}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md shadow-cyan-600/30 transition-all"
            >
              <Play className="w-3.5 h-3.5" />
              Test Condition
            </button>
          </div>
        </div>

        {testFeedback && (
          <div
            className={`mt-4 p-3 rounded-xl border text-xs flex items-center justify-between animate-fadeIn ${
              testFeedback.matched
                ? 'bg-rose-500/15 border-rose-500/40 text-rose-200'
                : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {testFeedback.matched ? (
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              )}
              <span className="font-semibold">{testFeedback.reason}</span>
            </div>
            <span className="font-mono text-[10px] text-slate-400">
              Evaluated at {new Date(testFeedback.timestamp).toLocaleTimeString()}
            </span>
          </div>
        )}
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {rules.map((rule) => {
          return (
            <div
              key={rule.id}
              className={`rounded-2xl p-5 border transition-all duration-300 flex flex-col justify-between ${
                rule.enabled
                  ? 'glass-panel hover:border-slate-700'
                  : 'bg-slate-900/40 border-slate-800/60 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700/80">
                      {getMetricIcon(rule.metric)}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base leading-snug">{rule.name}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{rule.description}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggle(rule.id)}
                    title={rule.enabled ? 'Click to Disable' : 'Click to Enable'}
                    className="text-cyan-400 hover:text-cyan-300"
                  >
                    {rule.enabled ? (
                      <ToggleRight className="w-7 h-7 text-cyan-400" />
                    ) : (
                      <ToggleLeft className="w-7 h-7 text-slate-500" />
                    )}
                  </button>
                </div>

                {/* Condition Card Expression */}
                <div className="mt-4 p-3 rounded-xl bg-slate-950/70 border border-slate-800/90 font-mono text-xs flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <span className="text-slate-500">IF:</span>
                    <span className="text-cyan-400 font-bold capitalize">{rule.metric}</span>
                    <span className="text-amber-400 font-bold px-1.5 py-0.5 rounded bg-amber-500/10">
                      {rule.operator}
                    </span>
                    <span className="text-white font-bold">{rule.threshold}</span>
                  </div>

                  <div className="flex items-center gap-2 font-sans">
                    <span className="text-[11px] text-slate-500">Target:</span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                      {rule.deviceId === 'all' ? 'All Devices' : rule.deviceId}
                    </span>
                  </div>
                </div>

                {/* Action Specification */}
                <div className="mt-3 text-xs text-slate-400 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span>Severity Action:</span>
                    <StatusBadge status={rule.severity} type="alert" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Cooldown Period:</span>
                    <span className="font-mono text-slate-300">{rule.cooldownSeconds || 30} seconds</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Total Triggers:</span>
                    <span className="font-mono font-bold text-cyan-400">{rule.triggerCount || 0} times</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1 font-mono text-[11px]">
                  <Clock className="w-3 h-3" />
                  {rule.lastTriggered
                    ? `Last fired: ${new Date(rule.lastTriggered).toLocaleTimeString()}`
                    : 'Not triggered yet'}
                </span>

                <button
                  onClick={() => handleDelete(rule.id, rule.name)}
                  className="p-1 rounded text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                  title="Delete rule"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <CreateRuleModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onRuleCreated={fetchRules}
        devices={devices}
      />
    </div>
  );
}

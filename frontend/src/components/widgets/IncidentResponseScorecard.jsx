import React, { useMemo } from 'react';
import { ShieldAlert, Clock, CheckCircle2, AlertTriangle, Flame } from 'lucide-react';
import { calculateMTTA, calculateMTTR, calculateSLACompliance, calculateEscalationDistribution } from '../../utils/incidentMetricsMath';

/**
 * NexusFlow — Incident Response Kinetics & SLA Performance Scorecard
 * Author: Harshitha (Frontend Analytics & Visualizations Lead)
 * Organization: Infotact Solutions
 * Milestone: Week 3 - Operational Incident Analytics & MTTA/MTTR Tracking
 *
 * @param {Object} props
 * @param {Array<{ id: string, createdAt: string, acknowledgedAt?: string, resolvedAt?: string, currentLevel?: number }>} [props.incidents]
 * @param {number} [props.targetMtta=15] - Target MTTA in minutes
 * @param {number} [props.targetMttr=60] - Target MTTR in minutes
 * @param {string} [props.className]
 */
export default function IncidentResponseScorecard({
  incidents = [],
  targetMtta = 15,
  targetMttr = 60,
  className = '',
}) {
  // Synthetic sample incidents if array is empty
  const activeIncidents = useMemo(() => {
    if (incidents && incidents.length > 0) return incidents;
    const now = Date.now();
    return [
      { id: '1', createdAt: new Date(now - 120 * 60000).toISOString(), acknowledgedAt: new Date(now - 112 * 60000).toISOString(), resolvedAt: new Date(now - 80 * 60000).toISOString(), currentLevel: 1 },
      { id: '2', createdAt: new Date(now - 90 * 60000).toISOString(), acknowledgedAt: new Date(now - 85 * 60000).toISOString(), resolvedAt: new Date(now - 50 * 60000).toISOString(), currentLevel: 1 },
      { id: '3', createdAt: new Date(now - 60 * 60000).toISOString(), acknowledgedAt: new Date(now - 45 * 60000).toISOString(), resolvedAt: new Date(now - 15 * 60000).toISOString(), currentLevel: 2 },
      { id: '4', createdAt: new Date(now - 30 * 60000).toISOString(), acknowledgedAt: new Date(now - 22 * 60000).toISOString(), resolvedAt: null, currentLevel: 2 },
      { id: '5', createdAt: new Date(now - 15 * 60000).toISOString(), acknowledgedAt: null, resolvedAt: null, currentLevel: 3 },
    ];
  }, [incidents]);

  const metrics = useMemo(() => {
    const { mttaMinutes } = calculateMTTA(activeIncidents);
    const { mttrMinutes } = calculateMTTR(activeIncidents);
    const { complianceRate } = calculateSLACompliance(activeIncidents, targetMttr);
    const dist = calculateEscalationDistribution(activeIncidents);
    const total = activeIncidents.length || 1;

    return {
      mtta: mttaMinutes,
      mttr: mttrMinutes,
      compliance: complianceRate,
      dist,
      totalCount: activeIncidents.length,
      l1Pct: Math.round((dist.level1 / total) * 100),
      l2Pct: Math.round((dist.level2 / total) * 100),
      l3Pct: Math.round((dist.level3 / total) * 100),
    };
  }, [activeIncidents, targetMttr]);

  return (
    <div className={`p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-lg">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
              Incident Response & SLA Kinetics
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Operational MTTA, MTTR & Escalation Funnel
            </p>
          </div>
        </div>

        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
          metrics.compliance >= 90
            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
            : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
        }`}>
          {metrics.compliance}% SLA Compliant
        </span>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* MTTA Card */}
        <div className="p-3.5 rounded-lg bg-gray-50 dark:bg-gray-950/60 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span className="flex items-center">
              <Clock className="w-3.5 h-3.5 mr-1 text-blue-500" />
              MTTA (Ack)
            </span>
            <span>Target: &lt;{targetMtta}m</span>
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {metrics.mtta}
            </span>
            <span className="text-xs text-gray-500">mins</span>
          </div>
          <span className={`text-[10px] font-medium ${
            metrics.mtta <= targetMtta ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'
          }`}>
            {metrics.mtta <= targetMtta ? 'Within Target' : 'Exceeding Target'}
          </span>
        </div>

        {/* MTTR Card */}
        <div className="p-3.5 rounded-lg bg-gray-50 dark:bg-gray-950/60 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span className="flex items-center">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-500" />
              MTTR (Resolve)
            </span>
            <span>Target: &lt;{targetMttr}m</span>
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {metrics.mttr}
            </span>
            <span className="text-xs text-gray-500">mins</span>
          </div>
          <span className={`text-[10px] font-medium ${
            metrics.mttr <= targetMttr ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'
          }`}>
            {metrics.mttr <= targetMttr ? 'Within Target' : 'Exceeding Target'}
          </span>
        </div>
      </div>

      {/* Escalation Level Breakdown Funnel */}
      <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300 font-medium">
          <span>Escalation Level Distribution</span>
          <span className="text-gray-400">{metrics.totalCount} Incidents</span>
        </div>

        <div className="w-full h-2 rounded-full overflow-hidden flex bg-gray-100 dark:bg-gray-800">
          <div style={{ width: `${metrics.l1Pct}%` }} className="bg-emerald-500 transition-all duration-300" title={`L1 Operator (${metrics.dist.level1})`} />
          <div style={{ width: `${metrics.l2Pct}%` }} className="bg-amber-500 transition-all duration-300" title={`L2 Supervisor (${metrics.dist.level2})`} />
          <div style={{ width: `${metrics.l3Pct}%` }} className="bg-rose-500 transition-all duration-300" title={`L3 Failsafe (${metrics.dist.level3})`} />
        </div>

        <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 pt-1">
          <span className="flex items-center">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5" />
            L1 Operator ({metrics.dist.level1})
          </span>
          <span className="flex items-center">
            <span className="w-2 h-2 rounded-full bg-amber-500 mr-1.5" />
            L2 Supervisor ({metrics.dist.level2})
          </span>
          <span className="flex items-center">
            <span className="w-2 h-2 rounded-full bg-rose-500 mr-1.5" />
            L3 Failsafe ({metrics.dist.level3})
          </span>
        </div>
      </div>
    </div>
  );
}

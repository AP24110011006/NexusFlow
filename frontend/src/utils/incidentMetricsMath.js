/**
 * NexusFlow — Incident Response & SLA Mathematical Analytics Library
 * Author: Harshitha (Frontend Analytics & Visualizations Lead)
 * Organization: Infotact Solutions
 * Milestone: Week 3 - Incident Response Kinetics, MTTA & MTTR Formulations
 */

/**
 * Calculate Mean Time to Acknowledge (MTTA)
 * MTTA = (1 / n) * SUM(acknowledgedAt - createdAt)
 * @param {Array<{ createdAt: string|number, acknowledgedAt?: string|number }>} incidents 
 * @returns {{ mttaMinutes: number, sampleCount: number }}
 */
export function calculateMTTA(incidents = []) {
  if (!Array.isArray(incidents) || incidents.length === 0) {
    return { mttaMinutes: 0, sampleCount: 0 };
  }

  const validAck = incidents.filter(
    (inc) => inc.acknowledgedAt && new Date(inc.acknowledgedAt) >= new Date(inc.createdAt)
  );

  if (validAck.length === 0) return { mttaMinutes: 0, sampleCount: 0 };

  const totalDiffMs = validAck.reduce((acc, inc) => {
    const diff = new Date(inc.acknowledgedAt).getTime() - new Date(inc.createdAt).getTime();
    return acc + diff;
  }, 0);

  const avgMinutes = totalDiffMs / validAck.length / (1000 * 60);
  return {
    mttaMinutes: Number(avgMinutes.toFixed(1)),
    sampleCount: validAck.length,
  };
}

/**
 * Calculate Mean Time to Resolve (MTTR)
 * MTTR = (1 / n) * SUM(resolvedAt - createdAt)
 * @param {Array<{ createdAt: string|number, resolvedAt?: string|number }>} incidents 
 * @returns {{ mttrMinutes: number, sampleCount: number }}
 */
export function calculateMTTR(incidents = []) {
  if (!Array.isArray(incidents) || incidents.length === 0) {
    return { mttrMinutes: 0, sampleCount: 0 };
  }

  const validRes = incidents.filter(
    (inc) => inc.resolvedAt && new Date(inc.resolvedAt) >= new Date(inc.createdAt)
  );

  if (validRes.length === 0) return { mttrMinutes: 0, sampleCount: 0 };

  const totalDiffMs = validRes.reduce((acc, inc) => {
    const diff = new Date(inc.resolvedAt).getTime() - new Date(inc.createdAt).getTime();
    return acc + diff;
  }, 0);

  const avgMinutes = totalDiffMs / validRes.length / (1000 * 60);
  return {
    mttrMinutes: Number(avgMinutes.toFixed(1)),
    sampleCount: validRes.length,
  };
}

/**
 * Calculate SLA Compliance Percentage
 * Percentage of resolved incidents where resolution duration <= targetThresholdMs
 * @param {Array<{ createdAt: string|number, resolvedAt?: string|number }>} incidents 
 * @param {number} [targetThresholdMinutes=30] 
 * @returns {{ complianceRate: number, totalResolved: number, compliantCount: number }}
 */
export function calculateSLACompliance(incidents = [], targetThresholdMinutes = 30) {
  if (!Array.isArray(incidents) || incidents.length === 0) {
    return { complianceRate: 100, totalResolved: 0, compliantCount: 0 };
  }

  const thresholdMs = targetThresholdMinutes * 60 * 1000;
  const resolved = incidents.filter((inc) => inc.resolvedAt);

  if (resolved.length === 0) {
    return { complianceRate: 100, totalResolved: 0, compliantCount: 0 };
  }

  const compliant = resolved.filter((inc) => {
    const duration = new Date(inc.resolvedAt).getTime() - new Date(inc.createdAt).getTime();
    return duration <= thresholdMs;
  });

  const rate = (compliant.length / resolved.length) * 100;
  return {
    complianceRate: Number(rate.toFixed(1)),
    totalResolved: resolved.length,
    compliantCount: compliant.length,
  };
}

/**
 * Calculate distribution of highest escalation levels reached
 * @param {Array<{ currentLevel?: number, maxLevelReached?: number }>} incidents 
 * @returns {{ level1: number, level2: number, level3: number }}
 */
export function calculateEscalationDistribution(incidents = []) {
  const dist = { level1: 0, level2: 0, level3: 0 };
  if (!Array.isArray(incidents)) return dist;

  incidents.forEach((inc) => {
    const lvl = inc.maxLevelReached || inc.currentLevel || 1;
    if (lvl >= 3) dist.level3++;
    else if (lvl === 2) dist.level2++;
    else dist.level1++;
  });

  return dist;
}

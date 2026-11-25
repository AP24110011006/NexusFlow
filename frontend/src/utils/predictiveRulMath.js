/**
 * NexusFlow — Predictive Maintenance & Remaining Useful Life (RUL) Mathematical Library
 * Author: Harshitha (Frontend Analytics & Visualizations Lead)
 * Organization: Infotact Solutions
 * Internship Reference: ITS/WEB/1849
 * Milestone: Week 3 - Prognostics and Health Management (PHM) Analytics
 */

/**
 * Fit a linear degradation trajectory y = mx + c via Ordinary Least Squares (OLS)
 * @param {Array<{time: number, degradation: number}>} observations
 * @returns {{slope: number, intercept: number, rSquared: number}}
 */
export function calculateLinearDegradationSlope(observations) {
  if (!observations || observations.length < 2) {
    return { slope: 0, intercept: 0, rSquared: 0 };
  }

  const n = observations.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;
  let sumY2 = 0;

  for (let i = 0; i < n; i++) {
    const x = observations[i].time;
    const y = observations[i].degradation;
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
    sumY2 += y * y;
  }

  const denominator = n * sumX2 - sumX * sumX;
  if (Math.abs(denominator) < 1e-9) {
    return { slope: 0, intercept: sumY / n, rSquared: 0 };
  }

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;

  // Pearson r^2
  const rNum = n * sumXY - sumX * sumY;
  const rDen = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  const rSquared = rDen !== 0 ? Math.pow(rNum / rDen, 2) : 0;

  return {
    slope: parseFloat(slope.toFixed(6)),
    intercept: parseFloat(intercept.toFixed(4)),
    rSquared: parseFloat(rSquared.toFixed(4))
  };
}

/**
 * Calculate Remaining Useful Life (RUL) under linear degradation assumption
 * RUL = (threshold - currentDegradation) / slope
 * @param {number} currentDegradation Current health metric or vibration/wear level
 * @param {number} failureThreshold Limit beyond which functional failure occurs
 * @param {number} degradationRatePerUnitTime Slope of degradation (per hour)
 * @returns {{rulHours: number, rulDays: number, confidence: number}}
 */
export function calculateLinearRUL(currentDegradation, failureThreshold, degradationRatePerUnitTime) {
  if (degradationRatePerUnitTime <= 0 || currentDegradation >= failureThreshold) {
    return { rulHours: 0, rulDays: 0, confidence: 0 };
  }

  const delta = failureThreshold - currentDegradation;
  const rulHours = delta / degradationRatePerUnitTime;
  const rulDays = rulHours / 24;

  // Higher confidence when degradation rate is well defined
  const confidence = Math.min(98, Math.max(60, 95 - (rulDays > 30 ? 20 : 5)));

  return {
    rulHours: Math.max(0, Math.round(rulHours * 10) / 10),
    rulDays: Math.max(0, Math.round(rulDays * 10) / 10),
    confidence: Math.round(confidence)
  };
}

/**
 * Weibull 2-Parameter Cumulative Failure Probability:
 * F(t) = 1 - exp(-(t / eta)^beta)
 * @param {number} operatingHours Current cumulative run hours
 * @param {number} eta Scale parameter (Characteristic life, time at which 63.2% fail)
 * @param {number} beta Shape parameter (beta < 1 infant mortality, beta = 1 random, beta > 1 wearout)
 * @returns {number} Probability of failure (0 to 1, rounded to 4 decimals)
 */
export function calculateWeibullFailureProbability(operatingHours, eta = 10000, beta = 2.5) {
  if (operatingHours <= 0 || eta <= 0) return 0;
  const exponent = Math.pow(operatingHours / eta, beta);
  const prob = 1 - Math.exp(-exponent);
  return Math.min(1.0, Math.max(0, parseFloat(prob.toFixed(4))));
}

/**
 * Health Degradation Index (0% Critical to 100% Brand New)
 * @param {number} currentLevel
 * @param {number} baselineLevel Nominal operating value
 * @param {number} criticalThreshold Critical trip point
 */
export function calculateHealthIndex(currentLevel, baselineLevel, criticalThreshold) {
  if (criticalThreshold === baselineLevel) return 100;
  const ratio = (currentLevel - baselineLevel) / (criticalThreshold - baselineLevel);
  const health = Math.max(0, Math.min(100, (1 - ratio) * 100));
  return Math.round(health * 10) / 10;
}

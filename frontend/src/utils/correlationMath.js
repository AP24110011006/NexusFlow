/**
 * IoT Sensor Cross-Metric Pearson Correlation & Covariance Calculator
 * Authored by: Harshitha (Frontend Analytics & Visualizations Role)
 * Milestone: Week 2 Deliverable — Multi-Variable Sensor Analytics
 * Organization: Infotact Solutions
 */

/**
 * Computes Pearson Correlation Coefficient r in [-1, 1] between two numerical series
 * @param {number[]} x
 * @param {number[]} y
 * @returns {number} Pearson r clamped to [-1.0, 1.0]
 */
export function calculatePearsonCorrelation(x, y) {
  if (!x || !y || x.length < 2 || y.length < 2) return 0;
  const n = Math.min(x.length, y.length);

  // Calculate means
  let sumX = 0;
  let sumY = 0;
  for (let i = 0; i < n; i++) {
    sumX += x[i];
    sumY += y[i];
  }
  const meanX = sumX / n;
  const meanY = sumY / n;

  // Calculate numerator and variance sums
  let numerator = 0;
  let varX = 0;
  let varY = 0;

  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;
    numerator += dx * dy;
    varX += dx * dx;
    varY += dy * dy;
  }

  const denominator = Math.sqrt(varX * varY);
  if (denominator === 0) return 0;

  const r = numerator / denominator;
  return parseFloat(Math.max(-1, Math.min(1, r)).toFixed(2));
}

/**
 * Computes full pairwise correlation matrix across specified metrics
 * @param {Array<Object>} telemetryData
 * @param {string[]} metrics
 * @returns {Array<{ m1: string, m2: string, r: number, interpretation: string }>}
 */
export function buildCorrelationMatrix(
  telemetryData = [],
  metrics = ['temperature', 'humidity', 'pressure']
) {
  if (!telemetryData || telemetryData.length < 2) return [];

  const extracted = {};
  for (const m of metrics) {
    extracted[m] = telemetryData
      .map((item) => item[m])
      .filter((v) => typeof v === 'number' && !isNaN(v));
  }

  const results = [];
  for (let i = 0; i < metrics.length; i++) {
    for (let j = 0; j < metrics.length; j++) {
      const m1 = metrics[i];
      const m2 = metrics[j];
      const r = i === j ? 1.0 : calculatePearsonCorrelation(extracted[m1], extracted[m2]);
      results.push({
        m1,
        m2,
        r,
        interpretation: interpretCorrelation(r),
      });
    }
  }

  return results;
}

/**
 * Converts Pearson r into industrial operational diagnosis
 * @param {number} r
 * @returns {string}
 */
export function interpretCorrelation(r) {
  if (r >= 0.8) return 'Very Strong Positive (Direct Coupling)';
  if (r >= 0.5) return 'Moderate Positive Coupling';
  if (r >= 0.2) return 'Weak Positive Tendency';
  if (r > -0.2) return 'Independent / Negligible Correlation';
  if (r > -0.5) return 'Weak Negative Tendency';
  if (r > -0.8) return 'Moderate Negative Coupling';
  return 'Very Strong Inverse (Inverse Coupling)';
}

/**
 * NexusFlow — Multivariate Sensor Fusion & PCA Mathematical Library
 * Author: Harshitha (Frontend Analytics & Visualizations Lead)
 * Organization: Infotact Solutions
 * Internship Reference: ITS/WEB/1849
 * Milestone: Week 3 - Multi-Sensor Fusion & Dimensionality Reduction
 */

/**
 * Calculate the sample mean vector across multiple sensor channels
 * @param {Array<Array<number>>} data Matrix of shape [N samples, D dimensions]
 * @returns {Array<number>} Mean vector of length D
 */
export function calculateMeanVector(data) {
  if (!data || data.length === 0) return [];
  const n = data.length;
  const d = data[0].length;
  const means = new Array(d).fill(0);

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < d; j++) {
      means[j] += data[i][j];
    }
  }

  return means.map((m) => m / n);
}

/**
 * Calculate the D x D Covariance Matrix
 * @param {Array<Array<number>>} data Matrix of shape [N samples, D dimensions]
 * @param {Array<number>} [means] Precomputed mean vector
 * @returns {Array<Array<number>>} Covariance matrix of size D x D
 */
export function calculateCovarianceMatrix(data, means) {
  if (!data || data.length < 2) return [];
  const n = data.length;
  const d = data[0].length;
  const mu = means || calculateMeanVector(data);

  // Initialize D x D matrix
  const cov = Array.from({ length: d }, () => new Array(d).fill(0));

  for (let row = 0; row < n; row++) {
    const diff = data[row].map((val, col) => val - mu[col]);
    for (let i = 0; i < d; i++) {
      for (let j = 0; j < d; j++) {
        cov[i][j] += diff[i] * diff[j];
      }
    }
  }

  for (let i = 0; i < d; i++) {
    for (let j = 0; j < d; j++) {
      cov[i][j] /= (n - 1);
    }
  }

  return cov;
}

/**
 * Extract First Principal Component (PC1) using the Power Iteration algorithm
 * @param {Array<Array<number>>} cov D x D covariance matrix
 * @param {number} [maxIterations] Maximum power iterations
 * @returns {{ eigenvector: Array<number>, eigenvalue: number }}
 */
export function calculateFirstPrincipalComponent(cov, maxIterations = 50) {
  if (!cov || cov.length === 0) {
    return { eigenvector: [], eigenvalue: 0 };
  }

  const d = cov.length;
  // Initialize random unit vector
  let v = new Array(d).fill(1 / Math.sqrt(d));

  for (let iter = 0; iter < maxIterations; iter++) {
    const nextV = new Array(d).fill(0);
    for (let i = 0; i < d; i++) {
      for (let j = 0; j < d; j++) {
        nextV[i] += cov[i][j] * v[j];
      }
    }

    // Compute norm
    const norm = Math.sqrt(nextV.reduce((acc, val) => acc + val * val, 0));
    if (norm < 1e-9) break;

    v = nextV.map((val) => val / norm);
  }

  // Rayleigh quotient for eigenvalue
  let eigenvalue = 0;
  for (let i = 0; i < d; i++) {
    for (let j = 0; j < d; j++) {
      eigenvalue += v[i] * cov[i][j] * v[j];
    }
  }

  return {
    eigenvector: v.map((val) => parseFloat(val.toFixed(4))),
    eigenvalue: parseFloat(eigenvalue.toFixed(4))
  };
}

/**
 * Compute Composite Health Index (0% - 100%) from multivariate sensor readings
 * using normalized Euclidean distance from nominal operating centroid
 * @param {Array<number>} currentReading Vector of current sensor readings
 * @param {Array<number>} nominalBaseline Vector of nominal baseline values
 * @param {Array<number>} toleranceLimits Maximum acceptable deviation per sensor
 * @returns {{ healthScore: number, channelDivergence: Array<number>, isAnomaly: boolean }}
 */
export function calculateSensorFusionHealth(currentReading, nominalBaseline, toleranceLimits) {
  if (!currentReading || !nominalBaseline || !toleranceLimits) {
    return { healthScore: 100, channelDivergence: [], isAnomaly: false };
  }

  const d = currentReading.length;
  let totalDivergenceSq = 0;
  const channelDivergence = [];

  for (let i = 0; i < d; i++) {
    const tol = toleranceLimits[i] || 1;
    const diff = Math.abs(currentReading[i] - nominalBaseline[i]);
    const normDiff = Math.min(2.0, diff / tol); // 1.0 = at threshold, 2.0 = double threshold
    channelDivergence.push(parseFloat(normDiff.toFixed(3)));
    totalDivergenceSq += normDiff * normDiff;
  }

  const rmsDivergence = Math.sqrt(totalDivergenceSq / d);
  const healthScore = Math.max(0, Math.min(100, Math.round((1 - Math.min(1, rmsDivergence)) * 100)));
  const isAnomaly = rmsDivergence >= 1.0;

  return {
    healthScore,
    channelDivergence,
    isAnomaly
  };
}

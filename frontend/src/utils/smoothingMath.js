/**
 * NexusFlow — Time-Series Telemetry Smoothing & Volatility Band Algorithms
 * Author: Harshitha (Frontend Analytics & Visualizations Lead)
 * Organization: Infotact Solutions
 * Milestone: Week 2 - Industrial Sensor Signal Processing & Noise Suppression
 */

/**
 * Calculate Simple Moving Average (SMA) over a sliding window
 * @param {number[]} values 
 * @param {number} [windowSize=5] 
 * @returns {number[]} Array of same length, padded with initial values
 */
export function calculateSMA(values, windowSize = 5) {
  if (!Array.isArray(values) || values.length === 0) return [];
  const k = Math.max(1, Math.min(windowSize, values.length));
  const result = [];

  for (let i = 0; i < values.length; i++) {
    const start = Math.max(0, i - k + 1);
    const windowSlice = values.slice(start, i + 1);
    const sum = windowSlice.reduce((acc, v) => acc + (Number(v) || 0), 0);
    const avg = sum / windowSlice.length;
    result.push(Number(avg.toFixed(2)));
  }

  return result;
}

/**
 * Calculate Exponential Moving Average (EMA)
 * S_t = alpha * Y_t + (1 - alpha) * S_{t-1}
 * where alpha = 2 / (period + 1)
 * @param {number[]} values 
 * @param {number} [period=5] 
 * @returns {number[]}
 */
export function calculateEMA(values, period = 5) {
  if (!Array.isArray(values) || values.length === 0) return [];
  const alpha = 2 / (period + 1);
  const result = [];

  let prevEma = Number(values[0]) || 0;
  result.push(Number(prevEma.toFixed(2)));

  for (let i = 1; i < values.length; i++) {
    const val = Number(values[i]) || 0;
    const currentEma = alpha * val + (1 - alpha) * prevEma;
    result.push(Number(currentEma.toFixed(2)));
    prevEma = currentEma;
  }

  return result;
}

/**
 * Calculate Bollinger Bands for dynamic volatility envelopes
 * Upper Band = MA + (k * stdDev)
 * Lower Band = MA - (k * stdDev)
 * @param {number[]} values 
 * @param {number} [period=5] 
 * @param {number} [numStdDev=2] 
 * @returns {{ sma: number[], upper: number[], lower: number[], bandwidth: number[] }}
 */
export function calculateBollingerBands(values, period = 5, numStdDev = 2) {
  if (!Array.isArray(values) || values.length === 0) {
    return { sma: [], upper: [], lower: [], bandwidth: [] };
  }

  const sma = calculateSMA(values, period);
  const upper = [];
  const lower = [];
  const bandwidth = [];

  for (let i = 0; i < values.length; i++) {
    const start = Math.max(0, i - period + 1);
    const windowSlice = values.slice(start, i + 1);
    const mean = sma[i];

    // Variance
    const sumSquares = windowSlice.reduce((acc, v) => {
      const diff = (Number(v) || 0) - mean;
      return acc + diff * diff;
    }, 0);
    const stdDev = Math.sqrt(sumSquares / windowSlice.length);

    const up = Number((mean + numStdDev * stdDev).toFixed(2));
    const low = Number((mean - numStdDev * stdDev).toFixed(2));
    const bw = mean !== 0 ? Number((((up - low) / mean) * 100).toFixed(2)) : 0;

    upper.push(up);
    lower.push(low);
    bandwidth.push(bw);
  }

  return { sma, upper, lower, bandwidth };
}

/**
 * Calculate percentage noise suppression ratio
 * @param {number[]} rawValues 
 * @param {number[]} smoothedValues 
 * @returns {number} Noise reduction percentage (0 - 100%)
 */
export function calculateNoiseReduction(rawValues, smoothedValues) {
  if (!rawValues || rawValues.length < 2 || !smoothedValues || smoothedValues.length < 2) {
    return 0;
  }

  // Calculate raw point-to-point total variation
  let rawVar = 0;
  for (let i = 1; i < rawValues.length; i++) {
    rawVar += Math.abs(rawValues[i] - rawValues[i - 1]);
  }

  // Calculate smoothed point-to-point total variation
  let smoothVar = 0;
  for (let i = 1; i < smoothedValues.length; i++) {
    smoothVar += Math.abs(smoothedValues[i] - smoothedValues[i - 1]);
  }

  if (rawVar === 0) return 0;
  const reduction = Math.max(0, ((rawVar - smoothVar) / rawVar) * 100);
  return Number(reduction.toFixed(1));
}

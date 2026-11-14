/**
 * IoT Statistical Anomaly Detection & Signal Filtering Algorithms
 * Authored by: Harshitha (Frontend Analytics & Visualizations Role)
 * Milestone: Week 1 Deliverable — Anomaly Analytics Engine
 * Organization: Infotact Solutions
 */

/**
 * Computes Exponential Moving Average (EMA) over a time-series series
 * @param {number[]} values
 * @param {number} alpha Smoothing factor between 0.0 and 1.0 (default: 0.2)
 * @returns {number[]} Smoothed series
 */
export function calculateEMA(values, alpha = 0.2) {
  if (!values || values.length === 0) return [];
  const ema = [values[0]];
  for (let i = 1; i < values.length; i++) {
    ema.push(parseFloat((alpha * values[i] + (1 - alpha) * ema[i - 1]).toFixed(2)));
  }
  return ema;
}

/**
 * Detects whether a sensor value experienced an abnormally rapid rate-of-change spike
 * (indicating sudden fire hazard, pipe burst, or hardware short circuit)
 * @param {number} prevValue Previous reading
 * @param {number} currValue Current reading
 * @param {number} timeDeltaSec Elapsed time in seconds
 * @param {number} maxDeltaPerSec Maximum allowed physical rate of change
 * @returns {{ isSpike: boolean, rateOfChange: number }}
 */
export function detectRateOfChangeSpike(
  prevValue,
  currValue,
  timeDeltaSec = 3,
  maxDeltaPerSec = 5.0
) {
  if (prevValue === undefined || currValue === undefined || timeDeltaSec <= 0) {
    return { isSpike: false, rateOfChange: 0 };
  }
  const delta = Math.abs(currValue - prevValue);
  const rateOfChange = parseFloat((delta / timeDeltaSec).toFixed(2));
  return {
    isSpike: rateOfChange > maxDeltaPerSec,
    rateOfChange,
  };
}

/**
 * Computes dynamic Bollinger-style statistical upper and lower threshold envelopes
 * @param {number[]} values
 * @param {number} windowSize Window for moving average (default: 10)
 * @param {number} k Number of standard deviations (default: 2.0)
 * @returns {Array<{ upper: number, lower: number, mid: number }>}
 */
export function calculateDynamicBands(values, windowSize = 10, k = 2.0) {
  if (!values || values.length === 0) return [];
  const bands = [];

  for (let i = 0; i < values.length; i++) {
    const start = Math.max(0, i - windowSize + 1);
    const window = values.slice(start, i + 1);
    const mean = window.reduce((a, b) => a + b, 0) / window.length;
    const variance =
      window.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / window.length;
    const stdev = Math.sqrt(variance);

    bands.push({
      upper: parseFloat((mean + k * stdev).toFixed(2)),
      lower: parseFloat((mean - k * stdev).toFixed(2)),
      mid: parseFloat(mean.toFixed(2)),
    });
  }

  return bands;
}

/**
 * 3-point Median filter for suppressing single-point transient ADC jitter spikes
 * @param {number[]} values
 * @returns {number[]} Filtered array
 */
export function applyMedianFilter(values) {
  if (!values || values.length < 3) return values || [];
  const filtered = [values[0]];

  for (let i = 1; i < values.length - 1; i++) {
    const triplet = [values[i - 1], values[i], values[i + 1]].sort((a, b) => a - b);
    filtered.push(triplet[1]); // median
  }

  filtered.push(values[values.length - 1]);
  return filtered;
}

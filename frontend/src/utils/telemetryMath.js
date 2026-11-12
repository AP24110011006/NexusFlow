/**
 * Telemetry Mathematical & Statistical Computation Utilities
 * Authored by: Harshitha (Frontend Analytics & Visualizations Role)
 * Milestone: Week 1 Deliverable — Analytical Algorithms & Downsampling
 * Organization: Infotact Solutions
 */

/**
 * Calculates arithmetic mean of a numeric array
 * @param {number[]} values
 * @returns {number}
 */
export function calculateMean(values) {
  if (!values || values.length === 0) return 0;
  const valid = values.filter((v) => typeof v === 'number' && !isNaN(v));
  if (valid.length === 0) return 0;
  const sum = valid.reduce((acc, v) => acc + v, 0);
  return parseFloat((sum / valid.length).toFixed(2));
}

/**
 * Calculates sample standard deviation (Bessel-corrected)
 * @param {number[]} values
 * @returns {number}
 */
export function calculateStandardDeviation(values) {
  if (!values || values.length < 2) return 0;
  const valid = values.filter((v) => typeof v === 'number' && !isNaN(v));
  if (valid.length < 2) return 0;
  const mean = calculateMean(valid);
  const variance =
    valid.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / (valid.length - 1);
  return parseFloat(Math.sqrt(variance).toFixed(2));
}

/**
 * Calculates minimum and maximum values with indices
 * @param {number[]} values
 * @returns {{ min: number, max: number }}
 */
export function calculateMinMax(values) {
  if (!values || values.length === 0) return { min: 0, max: 0 };
  const valid = values.filter((v) => typeof v === 'number' && !isNaN(v));
  if (valid.length === 0) return { min: 0, max: 0 };
  return {
    min: Math.min(...valid),
    max: Math.max(...valid),
  };
}

/**
 * Evaluates the percentage of telemetry readings breaching a threshold condition
 * @param {Array<Object>} readings
 * @param {string} metric
 * @param {number} threshold
 * @param {string} operator ('>' | '<' | '>=' | '<=' | '==' | '!=')
 * @returns {number} Percentage between 0.0 and 100.0
 */
export function calculateAnomalyRate(readings, metric, threshold, operator = '>') {
  if (!readings || readings.length === 0) return 0;
  let breaches = 0;

  for (const item of readings) {
    const val = item[metric];
    if (val === undefined || val === null || isNaN(val)) continue;

    let breached = false;
    switch (operator) {
      case '>':
        breached = val > threshold;
        break;
      case '<':
        breached = val < threshold;
        break;
      case '>=':
        breached = val >= threshold;
        break;
      case '<=':
        breached = val <= threshold;
        break;
      case '==':
        breached = Math.abs(val - threshold) < 0.001;
        break;
      case '!=':
        breached = Math.abs(val - threshold) >= 0.001;
        break;
      default:
        breached = false;
    }
    if (breached) breaches++;
  }

  return parseFloat(((breaches / readings.length) * 100).toFixed(1));
}

/**
 * Downsamples time-series data using uniform striding to prevent DOM bloat in SVG charts
 * @param {Array<Object>} data
 * @param {number} maxPoints
 * @returns {Array<Object>}
 */
export function downsampleTimeSeries(data, maxPoints = 50) {
  if (!data || data.length <= maxPoints) return data || [];
  const step = Math.ceil(data.length / maxPoints);
  const result = [];

  for (let i = 0; i < data.length; i += step) {
    result.push(data[i]);
  }

  // Always retain latest datapoint
  if (result[result.length - 1] !== data[data.length - 1]) {
    result.push(data[data.length - 1]);
  }

  return result;
}

/**
 * Computes standard Z-Scores to highlight anomaly outliers (> 2.5 stdev)
 * @param {number[]} values
 * @returns {number[]}
 */
export function calculateZScores(values) {
  const mean = calculateMean(values);
  const stdev = calculateStandardDeviation(values);
  if (stdev === 0) return values.map(() => 0);
  return values.map((v) => parseFloat(((v - mean) / stdev).toFixed(2)));
}

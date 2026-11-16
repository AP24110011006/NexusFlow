/**
 * IoT Device Health Score & Reliability Index Formulation
 * Authored by: Harshitha (Frontend Analytics & Visualizations Role)
 * Milestone: Week 2 Deliverable — Device Health Analytics
 * Organization: Infotact Solutions
 */

/**
 * Normalizes battery level (0 - 100%)
 * @param {number} battery
 * @returns {number} Score 0 - 100
 */
export function normalizeBatteryScore(battery = 100) {
  if (battery === null || battery === undefined || isNaN(battery)) return 50;
  return Math.min(Math.max(Math.round(battery), 0), 100);
}

/**
 * Normalizes RF Signal Strength (RSSI: -120 dBm [dead] to -40 dBm [excellent])
 * @param {number} rssi
 * @returns {number} Score 0 - 100
 */
export function normalizeRssiScore(rssi = -65) {
  if (rssi === null || rssi === undefined || isNaN(rssi)) return 50;
  // -40 dBm -> 100%, -100 dBm -> 0%
  const clamped = Math.min(Math.max(rssi, -100), -40);
  const score = Math.round(((clamped - -100) / (-40 - -100)) * 100);
  return score;
}

/**
 * Normalizes incident / anomaly penalty
 * @param {number} activeAlertCount
 * @returns {number} Score 0 - 100
 */
export function normalizeAnomalyScore(activeAlertCount = 0) {
  // Deduct 25 points per active alert
  return Math.max(0, 100 - activeAlertCount * 25);
}

/**
 * Computes composite Device Health Index H in [0, 100]:
 * H = 0.40 * S_battery + 0.35 * S_anomaly + 0.25 * S_rssi
 * @param {Object} params
 * @param {number} params.battery
 * @param {number} params.rssi
 * @param {number} params.activeAlerts
 * @returns {{ score: number, rating: 'OPTIMAL' | 'DEGRADED' | 'CRITICAL', breakdown: Object }}
 */
export function calculateDeviceHealth({
  battery = 100,
  rssi = -65,
  activeAlerts = 0,
}) {
  const sBattery = normalizeBatteryScore(battery);
  const sRssi = normalizeRssiScore(rssi);
  const sAnomaly = normalizeAnomalyScore(activeAlerts);

  const composite = Math.round(0.40 * sBattery + 0.35 * sAnomaly + 0.25 * sRssi);

  let rating = 'OPTIMAL';
  let color = 'emerald';
  if (composite < 50) {
    rating = 'CRITICAL';
    color = 'rose';
  } else if (composite < 80) {
    rating = 'DEGRADED';
    color = 'amber';
  }

  return {
    score: composite,
    rating,
    color,
    breakdown: {
      battery: sBattery,
      rssi: sRssi,
      anomaly: sAnomaly,
    },
  };
}

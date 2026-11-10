/**
 * Telemetry formatting utilities
 * Authored by Harshitha (Frontend Role) - Week 1 Deliverable
 */

export function formatTemperature(celsius, unit = 'C') {
  if (celsius === null || celsius === undefined || isNaN(celsius)) return '--';
  const val = Number(celsius);
  if (unit === 'F') {
    return `${((val * 9) / 5 + 32).toFixed(1)}°F`;
  }
  return `${val.toFixed(1)}°C`;
}

export function formatHumidity(hum) {
  if (hum === null || hum === undefined || isNaN(hum)) return '--';
  return `${Number(hum).toFixed(1)}%`;
}

export function formatPressure(pres) {
  if (pres === null || pres === undefined || isNaN(pres)) return '--';
  return `${Number(pres).toFixed(1)} hPa`;
}

export function formatTimestamp(isoString) {
  if (!isoString) return '--';
  const d = new Date(isoString);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function formatFullDateTime(isoString) {
  if (!isoString) return '--';
  const d = new Date(isoString);
  return d.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

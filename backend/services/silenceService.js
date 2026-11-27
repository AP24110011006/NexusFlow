/**
 * NexusFlow — Alert Silencing & Maintenance Window Engine
 * Author: Koneti Manikanth (Backend Lead & Architect)
 * Organization: Infotact Solutions
 * Internship Reference: ITS/WEB/1849
 * Milestone: Week 3 - Alert Fatigue Suppression & Maintenance Windows
 */

const crypto = require('crypto');

class AlertSilenceService {
  constructor() {
    this.silences = new Map();
    this.metrics = {
      totalCreated: 0,
      totalSuppressed: 0,
      totalCancelled: 0,
      totalExpired: 0
    };
  }

  /**
   * Create an alert silence window
   * @param {Object} params
   * @param {Object} params.matchers Key-value pairs to match against alert (e.g. { deviceId: 'SEN-01', metric: 'temperature' })
   * @param {Date|string|number} [params.startTime] Start timestamp (default: now)
   * @param {Date|string|number} [params.endTime] End timestamp
   * @param {number} [params.durationMs] Alternative duration if endTime is omitted
   * @param {string} params.reason Mandatory explanation for the silence
   * @param {string} [params.createdBy] Operator identifier
   */
  createSilence({ matchers = {}, startTime, endTime, durationMs, reason, createdBy = 'system' }) {
    if (!reason || typeof reason !== 'string') {
      throw new Error('A descriptive reason is required to create a silence window');
    }

    const start = startTime ? new Date(startTime).getTime() : Date.now();
    let end;
    if (endTime) {
      end = new Date(endTime).getTime();
    } else if (durationMs && Number.isFinite(durationMs)) {
      end = start + durationMs;
    } else {
      end = start + 3600000; // Default 1 hour
    }

    if (end <= start) {
      throw new Error('Silence end time must occur strictly after start time');
    }

    const id = `sil_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const silence = {
      id,
      matchers: { ...matchers },
      startTime: new Date(start).toISOString(),
      endTime: new Date(end).toISOString(),
      startTimestamp: start,
      endTimestamp: end,
      reason,
      createdBy,
      status: 'active',
      createdAt: new Date().toISOString(),
      suppressedCount: 0
    };

    this.silences.set(id, silence);
    this.metrics.totalCreated++;
    return { ...silence };
  }

  /**
   * Determine whether an alert payload matches any active silence window
   * @param {Object} alert Alert payload with deviceId, metric, severity, etc.
   * @param {number} [now] Evaluation epoch timestamp
   * @returns {{ silenced: boolean, silenceId?: string, reason?: string }}
   */
  shouldSilence(alert, now = Date.now()) {
    if (!alert || typeof alert !== 'object') {
      return { silenced: false };
    }

    for (const silence of this.silences.values()) {
      // Check if cancelled
      if (silence.status === 'cancelled') continue;

      // Check time window
      if (now < silence.startTimestamp) continue; // Future window
      if (now > silence.endTimestamp) {
        if (silence.status === 'active') {
          silence.status = 'expired';
          this.metrics.totalExpired++;
        }
        continue;
      }

      // Check matchers
      const matches = this.evaluateMatchers(silence.matchers, alert);
      if (matches) {
        silence.suppressedCount++;
        this.metrics.totalSuppressed++;
        return {
          silenced: true,
          silenceId: silence.id,
          reason: silence.reason,
          createdBy: silence.createdBy,
          expiresAt: silence.endTime
        };
      }
    }

    return { silenced: false };
  }

  /**
   * Evaluate matchers against alert fields supporting wildcards and regex
   */
  evaluateMatchers(matchers, alert) {
    const keys = Object.keys(matchers);
    if (keys.length === 0) return false;

    for (const key of keys) {
      const pattern = matchers[key];
      const alertVal = alert[key];

      if (pattern === '*') continue; // Wildcard match

      if (typeof pattern === 'string' && pattern.startsWith('/') && pattern.endsWith('/')) {
        // Regex pattern
        try {
          const regex = new RegExp(pattern.slice(1, -1));
          if (!regex.test(String(alertVal || ''))) return false;
        } catch {
          if (pattern !== alertVal) return false;
        }
      } else if (String(pattern) !== String(alertVal)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Cancel an active silence window
   */
  cancelSilence(id) {
    const silence = this.silences.get(id);
    if (!silence) {
      throw new Error(`Silence with ID ${id} not found`);
    }

    if (silence.status === 'active') {
      silence.status = 'cancelled';
      silence.cancelledAt = new Date().toISOString();
      this.metrics.totalCancelled++;
      return { success: true, id, status: 'cancelled' };
    }

    return { success: false, id, status: silence.status };
  }

  /**
   * List silences with optional status filter
   */
  listSilences(filter = {}) {
    const results = [];
    const now = Date.now();

    for (const silence of this.silences.values()) {
      // Update lazy expiration
      if (silence.status === 'active' && now > silence.endTimestamp) {
        silence.status = 'expired';
        this.metrics.totalExpired++;
      }

      if (filter.status && silence.status !== filter.status) {
        continue;
      }
      if (filter.deviceId && silence.matchers.deviceId !== filter.deviceId && silence.matchers.deviceId !== '*') {
        continue;
      }

      results.push({ ...silence });
    }

    return results;
  }

  /**
   * Return real-time metrics
   */
  getMetrics(now = Date.now()) {
    let activeCount = 0;
    let expiredCount = 0;
    let cancelledCount = 0;

    for (const silence of this.silences.values()) {
      if (silence.status === 'active') {
        if (now > silence.endTimestamp) {
          expiredCount++;
        } else {
          activeCount++;
        }
      } else if (silence.status === 'expired') {
        expiredCount++;
      } else if (silence.status === 'cancelled') {
        cancelledCount++;
      }
    }

    return {
      activeSilences: activeCount,
      expiredSilences: expiredCount,
      cancelledSilences: cancelledCount,
      totalTracked: this.silences.size,
      ...this.metrics
    };
  }

  /**
   * Purge records older than retention threshold
   */
  purge(retentionMs = 86400000) {
    const cutoff = Date.now() - retentionMs;
    let removed = 0;

    for (const [id, silence] of this.silences.entries()) {
      if (silence.status !== 'active' && silence.endTimestamp < cutoff) {
        this.silences.delete(id);
        removed++;
      }
    }

    return removed;
  }

  /**
   * Reset service state
   */
  clear() {
    this.silences.clear();
    this.metrics = {
      totalCreated: 0,
      totalSuppressed: 0,
      totalCancelled: 0,
      totalExpired: 0
    };
  }
}

const silenceService = new AlertSilenceService();

module.exports = {
  AlertSilenceService,
  silenceService
};

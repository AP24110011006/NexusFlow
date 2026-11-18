/**
 * NexusFlow — High-Throughput IoT Sliding-Window Rate Limiter & Throttle Service
 * Author: Koneti Manikanth (Backend Role, Ref. No.: ITS/WEB/1849)
 * Organization: Infotact Solutions
 * Milestone: Week 2 - IoT Gateway Traffic Throttling & DDoS Defense
 */

class ThrottleService {
  constructor(defaultOptions = {}) {
    this.defaultWindowMs = defaultOptions.windowMs || 60000; // default 1 minute
    this.defaultMaxRequests = defaultOptions.maxRequests || 120; // default 120 req/min
    this.buckets = new Map(); // key -> { timestamps: number[], customMax?: number, customWindowMs?: number }
    this.deviceOverrides = new Map(); // deviceId -> { maxRequests, windowMs }
  }

  /**
   * Set custom rate limit overrides for specific devices or device categories
   * @param {string} deviceId 
   * @param {number} maxRequests 
   * @param {number} windowMs 
   */
  setDeviceOverride(deviceId, maxRequests, windowMs = this.defaultWindowMs) {
    this.deviceOverrides.set(deviceId, { maxRequests, windowMs });
  }

  /**
   * Remove custom device override
   * @param {string} deviceId 
   */
  removeDeviceOverride(deviceId) {
    this.deviceOverrides.delete(deviceId);
  }

  /**
   * Evaluate whether a request from the given key is allowed under the rate limit
   * @param {string} key - e.g. deviceId or IP address
   * @param {Object} options - optional custom override { maxRequests, windowMs }
   * @returns {{ allowed: boolean, limit: number, remaining: number, resetAt: number, retryAfterMs: number }}
   */
  consume(key, options = {}) {
    const now = Date.now();
    const override = this.deviceOverrides.get(key) || {};
    const windowMs = options.windowMs || override.windowMs || this.defaultWindowMs;
    const maxRequests = options.maxRequests || override.maxRequests || this.defaultMaxRequests;

    if (!this.buckets.has(key)) {
      this.buckets.set(key, []);
    }

    const bucket = this.buckets.get(key);
    const windowStart = now - windowMs;

    // Remove timestamps outside of the current rolling window
    while (bucket.length > 0 && bucket[0] <= windowStart) {
      bucket.shift();
    }

    if (bucket.length < maxRequests) {
      bucket.push(now);
      const remaining = maxRequests - bucket.length;
      const oldestTimestamp = bucket[0];
      const resetAt = oldestTimestamp + windowMs;

      return {
        allowed: true,
        limit: maxRequests,
        remaining,
        resetAt,
        retryAfterMs: 0
      };
    } else {
      // Limit exceeded
      const oldestTimestamp = bucket[0];
      const resetAt = oldestTimestamp + windowMs;
      const retryAfterMs = Math.max(0, resetAt - now);

      return {
        allowed: false,
        limit: maxRequests,
        remaining: 0,
        resetAt,
        retryAfterMs
      };
    }
  }

  /**
   * Check current usage without consuming a request slot
   * @param {string} key 
   * @returns {{ count: number, limit: number, remaining: number, resetAt: number }}
   */
  getUsage(key) {
    const now = Date.now();
    const override = this.deviceOverrides.get(key) || {};
    const windowMs = override.windowMs || this.defaultWindowMs;
    const maxRequests = override.maxRequests || this.defaultMaxRequests;

    if (!this.buckets.has(key)) {
      return {
        count: 0,
        limit: maxRequests,
        remaining: maxRequests,
        resetAt: now + windowMs
      };
    }

    const bucket = this.buckets.get(key);
    const windowStart = now - windowMs;
    const validTimestamps = bucket.filter(ts => ts > windowStart);
    const oldest = validTimestamps[0] || now;

    return {
      count: validTimestamps.length,
      limit: maxRequests,
      remaining: Math.max(0, maxRequests - validTimestamps.length),
      resetAt: oldest + windowMs
    };
  }

  /**
   * Reset the rate limit bucket for a specific key
   * @param {string} key 
   */
  reset(key) {
    this.buckets.delete(key);
  }

  /**
   * Clear all active rate limit buckets and overrides
   */
  clearAll() {
    this.buckets.clear();
    this.deviceOverrides.clear();
  }

  /**
   * Express/Connect middleware generator for HTTP route protection
   * @param {Object} options 
   */
  middleware(options = {}) {
    return (req, res, next) => {
      const key = req.headers['x-device-id'] || req.ip || req.connection.remoteAddress || 'anonymous';
      const result = this.consume(key, options);

      res.setHeader('X-RateLimit-Limit', result.limit);
      res.setHeader('X-RateLimit-Remaining', result.remaining);
      res.setHeader('X-RateLimit-Reset', Math.ceil(result.resetAt / 1000));

      if (!result.allowed) {
        res.setHeader('Retry-After', Math.ceil(result.retryAfterMs / 1000));
        return res.status(429).json({
          error: 'Too Many Requests',
          message: `Rate limit of ${result.limit} requests per ${Math.round((options.windowMs || this.defaultWindowMs) / 1000)}s exceeded for ${key}.`,
          retryAfterMs: result.retryAfterMs
        });
      }

      next();
    };
  }
}

const defaultThrottleService = new ThrottleService();

module.exports = {
  ThrottleService,
  defaultThrottleService,
  throttleService: defaultThrottleService
};

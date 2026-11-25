/**
 * NexusFlow — Dead Letter Queue (DLQ) & Failure Recovery Service
 * Author: Koneti Manikanth (Backend Lead & Architect)
 * Organization: Infotact Solutions
 * Internship Reference: ITS/WEB/1849
 * Milestone: Week 3 - Fault Tolerance & Resilient IoT Ingestion
 */

const crypto = require('crypto');

class DeadLetterQueueService {
  constructor(options = {}) {
    this.maxCapacity = options.maxCapacity || 500;
    this.maxRetries = options.maxRetries || 3;
    this.baseBackoffMs = options.baseBackoffMs || 1000;
    this.maxBackoffMs = options.maxBackoffMs || 60000;
    this.queue = new Map();
    this.metrics = {
      totalEnqueued: 0,
      totalReplayed: 0,
      totalPoisoned: 0,
      totalDropped: 0
    };
  }

  /**
   * Calculate exponential backoff duration with decorrelated jitter
   * Formula: min(maxBackoff, baseBackoff * 2^attempt) + random jitter
   */
  calculateBackoff(attempt) {
    const exponential = Math.min(this.maxBackoffMs, this.baseBackoffMs * Math.pow(2, attempt));
    const jitter = Math.floor(Math.random() * (exponential * 0.25));
    return exponential + jitter;
  }

  /**
   * Enqueue a failed message into the Dead Letter Queue
   */
  enqueue(payload, error, metadata = {}) {
    if (this.queue.size >= this.maxCapacity) {
      // Evict oldest entry (FIFO)
      const oldestKey = this.queue.keys().next().value;
      if (oldestKey) {
        this.queue.delete(oldestKey);
        this.metrics.totalDropped++;
      }
    }

    const id = metadata.id || `dlq_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const attempts = metadata.attempts || 0;
    const isPoisoned = attempts >= this.maxRetries;

    const entry = {
      id,
      payload,
      destination: metadata.destination || 'webhook_dispatcher',
      error: {
        message: error ? error.message || String(error) : 'Unknown dispatch failure',
        code: error && error.code ? error.code : 'DISPATCH_ERROR',
        failedAt: new Date().toISOString()
      },
      attempts,
      maxRetries: metadata.maxRetries || this.maxRetries,
      status: isPoisoned ? 'poisoned' : 'pending_retry',
      enqueuedAt: new Date().toISOString(),
      nextRetryAt: isPoisoned ? null : new Date(Date.now() + this.calculateBackoff(attempts)).toISOString(),
      resolvedAt: null
    };

    this.queue.set(id, entry);
    this.metrics.totalEnqueued++;
    if (isPoisoned) {
      this.metrics.totalPoisoned++;
    }

    return entry;
  }

  /**
   * Replay a message by ID using an async handler function
   */
  async replayMessage(id, handler) {
    const entry = this.queue.get(id);
    if (!entry) {
      throw new Error(`DLQ message ${id} not found`);
    }

    if (typeof handler !== 'function') {
      throw new TypeError('Replay handler must be an asynchronous or synchronous function');
    }

    entry.attempts++;

    try {
      const result = await handler(entry.payload, entry);
      entry.status = 'resolved';
      entry.resolvedAt = new Date().toISOString();
      entry.nextRetryAt = null;
      this.metrics.totalReplayed++;
      return { success: true, messageId: id, result };
    } catch (err) {
      entry.error = {
        message: err.message || String(err),
        code: err.code || 'REPLAY_FAILURE',
        failedAt: new Date().toISOString()
      };

      if (entry.attempts >= entry.maxRetries) {
        entry.status = 'poisoned';
        entry.nextRetryAt = null;
        this.metrics.totalPoisoned++;
      } else {
        entry.status = 'pending_retry';
        entry.nextRetryAt = new Date(Date.now() + this.calculateBackoff(entry.attempts)).toISOString();
      }

      return { success: false, messageId: id, error: entry.error, status: entry.status };
    }
  }

  /**
   * Get an entry by ID
   */
  getMessage(id) {
    return this.queue.get(id) || null;
  }

  /**
   * Query DLQ entries with optional status filter
   */
  query(filter = {}) {
    const results = [];
    for (const entry of this.queue.values()) {
      if (filter.status && entry.status !== filter.status) {
        continue;
      }
      if (filter.destination && entry.destination !== filter.destination) {
        continue;
      }
      results.push({ ...entry });
    }
    return results;
  }

  /**
   * Get aggregate metrics
   */
  getMetrics() {
    let pendingCount = 0;
    let poisonedCount = 0;
    let resolvedCount = 0;

    for (const entry of this.queue.values()) {
      if (entry.status === 'pending_retry') pendingCount++;
      else if (entry.status === 'poisoned') poisonedCount++;
      else if (entry.status === 'resolved') resolvedCount++;
    }

    return {
      activeQueueSize: this.queue.size,
      maxCapacity: this.maxCapacity,
      pendingCount,
      poisonedCount,
      resolvedCount,
      ...this.metrics
    };
  }

  /**
   * Purge resolved or poisoned items
   */
  purge(status = 'resolved') {
    let removedCount = 0;
    for (const [id, entry] of this.queue.entries()) {
      if (entry.status === status) {
        this.queue.delete(id);
        removedCount++;
      }
    }
    return removedCount;
  }

  /**
   * Reset service
   */
  clear() {
    this.queue.clear();
    this.metrics = {
      totalEnqueued: 0,
      totalReplayed: 0,
      totalPoisoned: 0,
      totalDropped: 0
    };
  }
}

// Singleton export
const dlqService = new DeadLetterQueueService();

module.exports = {
  DeadLetterQueueService,
  dlqService
};

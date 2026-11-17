/**
 * NexusFlow — High-Performance Circular Ring Buffer Service
 * Author: Koneti Manikanth (Backend Lead / Associate L1. Intern)
 * Milestone: Week 2 Deliverable — In-Memory Telemetry Buffering
 * Organization: Infotact Solutions
 */

class RingBuffer {
  constructor(capacity = 1000) {
    this.capacity = capacity;
    this.buffer = new Array(capacity);
    this.head = 0; // points to next write index
    this.isFull = false;
  }

  push(item) {
    this.buffer[this.head] = item;
    this.head = (this.head + 1) % this.capacity;
    if (this.head === 0) {
      this.isFull = true;
    }
  }

  size() {
    return this.isFull ? this.capacity : this.head;
  }

  toArray() {
    if (!this.isFull) {
      return this.buffer.slice(0, this.head);
    }
    // Return chronological order: oldest to newest
    return [
      ...this.buffer.slice(this.head),
      ...this.buffer.slice(0, this.head),
    ];
  }

  getLatest(count = 50) {
    const all = this.toArray();
    if (count >= all.length) return all;
    return all.slice(all.length - count);
  }

  clear() {
    this.buffer = new Array(this.capacity);
    this.head = 0;
    this.isFull = false;
  }
}

class BufferService {
  constructor(defaultCapacity = 1000) {
    this.defaultCapacity = defaultCapacity;
    this.deviceBuffers = new Map();
  }

  getOrCreateBuffer(deviceId) {
    if (!this.deviceBuffers.has(deviceId)) {
      this.deviceBuffers.set(deviceId, new RingBuffer(this.defaultCapacity));
    }
    return this.deviceBuffers.get(deviceId);
  }

  push(deviceId, record) {
    if (!deviceId) throw new Error('Device ID is required for buffer ingestion');
    const ring = this.getOrCreateBuffer(deviceId);
    ring.push(record);
    return ring.size();
  }

  pushBatch(deviceId, records) {
    if (!Array.isArray(records)) throw new Error('Records must be an array');
    const ring = this.getOrCreateBuffer(deviceId);
    for (const record of records) {
      ring.push(record);
    }
    return ring.size();
  }

  getLatest(deviceId, count = 50) {
    if (!this.deviceBuffers.has(deviceId)) return [];
    return this.deviceBuffers.get(deviceId).getLatest(count);
  }

  getAll(deviceId) {
    if (!this.deviceBuffers.has(deviceId)) return [];
    return this.deviceBuffers.get(deviceId).toArray();
  }

  size(deviceId) {
    if (!this.deviceBuffers.has(deviceId)) return 0;
    return this.deviceBuffers.get(deviceId).size();
  }

  clear(deviceId) {
    if (deviceId) {
      if (this.deviceBuffers.has(deviceId)) {
        this.deviceBuffers.get(deviceId).clear();
      }
    } else {
      this.deviceBuffers.clear();
    }
  }

  getStats() {
    let totalItems = 0;
    const deviceStats = {};
    for (const [id, ring] of this.deviceBuffers.entries()) {
      const sz = ring.size();
      totalItems += sz;
      deviceStats[id] = {
        count: sz,
        capacity: ring.capacity,
        isFull: ring.isFull,
      };
    }
    return {
      activeBuffers: this.deviceBuffers.size,
      totalBufferedItems: totalItems,
      defaultCapacityPerDevice: this.defaultCapacity,
      devices: deviceStats,
    };
  }
}

module.exports = new BufferService();
module.exports.RingBuffer = RingBuffer;

/**
 * NexusFlow — Cryptographically Linked Audit Logging & Compliance Ledger
 * Author: Koneti Manikanth (Backend Lead / Associate L1. Intern)
 * Milestone: Week 3 Deliverable — Tamper-Evident Audit Trails & Governance
 * Organization: Infotact Solutions
 */

const crypto = require('crypto');

class AuditService {
  constructor() {
    this.ledger = [];
    this.initGenesisBlock();
  }

  initGenesisBlock() {
    if (this.ledger.length === 0) {
      const genesis = {
        index: 0,
        timestamp: '2026-11-10T00:00:00.000Z',
        userId: 'system_root',
        userRole: 'system',
        action: 'GENESIS_INITIALIZATION',
        resourceType: 'system',
        resourceId: 'nexusflow_core',
        details: { message: 'NexusFlow Governance Ledger Initialized' },
        clientIp: '127.0.0.1',
        prevHash: '0000000000000000000000000000000000000000000000000000000000000000',
      };
      genesis.hash = this.calculateBlockHash(genesis);
      this.ledger.push(genesis);
    }
  }

  calculateBlockHash(block) {
    const dataString = `${block.index}|${block.timestamp}|${block.userId}|${block.userRole}|${block.action}|${block.resourceType}|${block.resourceId}|${JSON.stringify(block.details || {})}|${block.clientIp}|${block.prevHash}`;
    return crypto.createHash('sha256').update(dataString).digest('hex');
  }

  logAction({
    userId = 'anonymous',
    userRole = 'viewer',
    action,
    resourceType = 'general',
    resourceId = 'none',
    details = {},
    clientIp = '127.0.0.1',
  }) {
    if (!action) throw new Error('Audit action identifier is required');

    const prevBlock = this.ledger[this.ledger.length - 1];
    const newBlock = {
      index: this.ledger.length,
      timestamp: new Date().toISOString(),
      userId,
      userRole,
      action,
      resourceType,
      resourceId,
      details,
      clientIp,
      prevHash: prevBlock.hash,
    };

    newBlock.hash = this.calculateBlockHash(newBlock);
    this.ledger.push(newBlock);
    return newBlock;
  }

  getAuditTrail(filter = {}) {
    let records = this.ledger.slice(1); // Exclude genesis block by default for UI queries

    if (filter.userId) {
      records = records.filter((r) => r.userId === filter.userId);
    }
    if (filter.action) {
      records = records.filter((r) => r.action === filter.action);
    }
    if (filter.resourceType) {
      records = records.filter((r) => r.resourceType === filter.resourceType);
    }
    if (filter.limit) {
      const limit = parseInt(filter.limit, 10);
      records = records.slice(-limit);
    }

    return records;
  }

  verifyLedgerIntegrity() {
    if (this.ledger.length === 0) {
      return { valid: false, reason: 'Empty ledger' };
    }

    // Verify Genesis
    const genesis = this.ledger[0];
    if (genesis.index !== 0 || genesis.hash !== this.calculateBlockHash(genesis)) {
      return { valid: false, compromisedIndex: 0, reason: 'Genesis block corrupted' };
    }

    // Verify Chain
    for (let i = 1; i < this.ledger.length; i++) {
      const current = this.ledger[i];
      const previous = this.ledger[i - 1];

      // Check link
      if (current.prevHash !== previous.hash) {
        return {
          valid: false,
          compromisedIndex: i,
          reason: `Broken chain link at block ${i}: prevHash does not match previous block hash.`,
        };
      }

      // Check current hash recalculation
      if (current.hash !== this.calculateBlockHash(current)) {
        return {
          valid: false,
          compromisedIndex: i,
          reason: `Tampered content at block ${i}: recalculated hash mismatch.`,
        };
      }
    }

    return {
      valid: true,
      totalBlocks: this.ledger.length,
      latestHash: this.ledger[this.ledger.length - 1].hash,
    };
  }

  getLedgerStats() {
    const actionsCount = {};
    const usersCount = {};

    for (let i = 1; i < this.ledger.length; i++) {
      const r = this.ledger[i];
      actionsCount[r.action] = (actionsCount[r.action] || 0) + 1;
      usersCount[r.userId] = (usersCount[r.userId] || 0) + 1;
    }

    return {
      totalBlocks: this.ledger.length,
      userActionsLogged: this.ledger.length - 1,
      uniqueUsers: Object.keys(usersCount).length,
      actionDistribution: actionsCount,
      integrity: this.verifyLedgerIntegrity(),
    };
  }

  clear() {
    this.ledger = [];
    this.initGenesisBlock();
  }
}

const auditService = new AuditService();

module.exports = auditService;
module.exports.AuditService = AuditService;

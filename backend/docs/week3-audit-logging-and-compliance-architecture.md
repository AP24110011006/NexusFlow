# NexusFlow — Week 3: Cryptographic Audit Logging & Compliance Ledger
**Author:** Koneti Manikanth (Backend Engineering Lead)  
**Organization:** Infotact Solutions (Electronic City, Bengaluru, Karnataka, PIN 560100)  
**Internship Ref. No.:** ITS/WEB/1849  
**Domain:** Web Development / Full-Stack IoT Platform  
**Milestone:** Week 3 Deliverable — Security Governance & Tamper-Evident Ledgers

---

## 1. Executive Summary

In critical infrastructure and manufacturing installations governed by compliance frameworks (ISO 27001, SOC 2 Type II, IEC 62443), standard database log tables are vulnerable to insider manipulation: a rogue user with database access can rewrite or delete entries to obscure tampering or safety violations.

Week 3 introduces the **NexusFlow Cryptographic Audit Ledger** (`backend/services/auditService.js`), an append-only, blockchain-inspired hash-linked ledger that guarantees non-repudiation and instantaneous detection of post-facto alterations.

---

## 2. Hash-Linked Blockchain Architecture

```
+---------------------------------------------------------------------------------------------------+
|                            NexusFlow Cryptographic Audit Ledger                                   |
+---------------------------------------------------------------------------------------------------+
|                                                                                                   |
|  [ Block 0: Genesis ]         [ Block 1: Rule Created ]        [ Block 2: Alert Resolved ]        |
|  +-----------------------+    +-----------------------+        +-----------------------+          |
|  | Index: 0              |    | Index: 1              |        | Index: 2              |          |
|  | User: system_root     |    | User: usr_manikanth   |        | User: usr_alice       |          |
|  | Action: GENESIS_INIT  |    | Action: RULE_CREATED  |        | Action: ALERT_RESOLVE |          |
|  | PrevHash: 000000...   |    | PrevHash: [Hash_0]    | =====> | PrevHash: [Hash_1]    |          |
|  | Hash: [Hash_0]        |    | Hash: [Hash_1]        |        | Hash: [Hash_2]        |          |
|  +-----------------------+    +-----------------------+        +-----------------------+          |
|                                                                                                   |
+---------------------------------------------------------------------------------------------------+
```

### Cryptographic Hash Function:
Each audit block computes a strict SHA-256 digest across all constituent fields:

$$\text{Hash}_k = \text{SHA256}\Big(k \parallel T_k \parallel \text{User}_k \parallel \text{Role}_k \parallel \text{Action}_k \parallel \text{ResType}_k \parallel \text{ResId}_k \parallel \text{Details}_k \parallel \text{IP}_k \parallel \text{Hash}_{k-1}\Big)$$

---

## 3. Tamper Detection & Integrity Verification

The `verifyLedgerIntegrity()` method executes an automated traversal across all recorded blocks:
1. Recalculates the expected SHA-256 hash from the block data. If $\text{RecalculatedHash} \ne \text{Block.hash}$, the content has been tampered with.
2. Compares $\text{Block}_k.\text{prevHash}$ with $\text{Block}_{k-1}.\text{hash}$. If they do not match, records have been inserted, reordered, or deleted.
3. Returns the exact `compromisedIndex` and human-readable diagnostic error.

---

## 4. Automated Unit Verification

Validated by test suite [`backend/tests/auditService.test.js`](file:///c:/NexusFlow/backend/tests/auditService.test.js):
- ✅ Genesis block bootstrap with validated SHA-256 root
- ✅ Deterministic block link chaining
- ✅ Zero false-positives on untampered audit sequences
- ✅ Microsecond detection of single-character payload alterations
- ✅ Identification of broken prevHash links
- ✅ Multi-dimensional query filtering (Action, User, Resource)

*Approved by:* Koneti Manikanth  
*Date:* November 2026

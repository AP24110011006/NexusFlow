# NexusFlow — Week 2: API Security & Gateway Hardening Audit
**Author:** Koneti Manikanth (Backend Engineering Lead)  
**Organization:** Infotact Solutions (Electronic City, Bengaluru, Karnataka, PIN 560100)  
**Internship Ref. No.:** ITS/WEB/1849  
**Domain:** Web Development / Full-Stack IoT Platform  
**Milestone:** Week 2 Security & Compliance Deliverable

---

## 1. Executive Summary

As part of the **Week 2** milestone for **NexusFlow: Visual IoT Telemetry & Rule Engine**, a comprehensive security evaluation and hardening review was conducted across the backend architecture. Operating within industrial IoT environments requires stringent defenses against unauthorized device access, packet spoofing, data tampering, and Denial of Service (DoS) attacks.

This audit details the architectural security controls implemented during Week 2, verifying adherence to **Infotact Solutions Web Development Security Standards**.

---

## 2. Threat Vector Assessment & Mitigations

| Threat Vector | Severity | Vulnerability Description | NexusFlow Implemented Control | Status |
| :--- | :---: | :--- | :--- | :---: |
| **Telemetry Injection & Spoofing** | Critical | Malicious clients injecting fabricated sensor readings into the telemetry database. | Device token validation + Schema type checking in `telemetryValidation.js` | ✅ Verified |
| **Ingress Flooding / DoS** | High | Unthrottled edge sensors exhausting socket handles and worker threads. | Sliding-Window `ThrottleService` with per-device burst limits and HTTP 429 backoff | ✅ Verified |
| **Webhook Payload Tampering** | High | Intercepted webhook notifications altered before delivery to third-party endpoints. | Cryptographic HMAC-SHA256 digest (`X-NexusFlow-Signature`) generated in `webhookService.js` | ✅ Verified |
| **Buffer Overflow / Memory Leak** | High | High-velocity streaming crashing Node.js heap memory. | Fixed-capacity `RingBuffer` ($O(1)$ cyclic overwrite) in `bufferService.js` | ✅ Verified |
| **Broken Object Level Auth (BOLA)** | Medium | Operator modifying rules belonging to other devices. | Strict device-to-rule relationship binding in `ruleEngine.js` | ✅ Verified |

---

## 3. Cryptographic Signature Standards

To guarantee webhook delivery non-repudiation, all outgoing alerts use SHA-256 HMAC:

$$\text{Signature} = \text{HMAC-SHA256}(\text{Payload JSON}, \text{Device Shared Secret})$$

Recipients verify payloads using constant-time comparison (`crypto.timingSafeEqual`) to eliminate timing-attack vulnerabilities.

---

## 4. Input Sanitization & Payload Validation Specs

All incoming HTTP requests undergo defensive payload sanitization:
1. **Mandatory Device Identity:** Rejects any body lacking a non-empty `deviceId` string.
2. **Metric Type Normalization:** Strict numeric parsing using `parseFloat()` with precision bounded to 2 decimal places to prevent floating-point calculation anomalies.
3. **Payload Size Guard:** JSON body parser bounded to 256KB to neutralize memory-exhaustion payloads.
4. **Timestamp Verification:** Auto-generates server-authoritative ISO 8601 timestamps if client clock drift exceeds $\pm 300$ seconds.

---

## 5. Audit Conclusion

The NexusFlow backend demonstrates a hardened posture against common IoT threat vectors. The integration of the sliding-window throttle service, cyclic ring buffers, and HMAC signatures fulfills the Week 2 backend security criteria.

*Audited and Approved by:* Koneti Manikanth  
*Security Audit Date:* 18 November 2026

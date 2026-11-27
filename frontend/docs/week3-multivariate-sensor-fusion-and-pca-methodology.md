# NexusFlow — Multivariate Sensor Fusion & PCA Analytics Methodology
**Document Reference:** NF-DOC-W3-FUS-001  
**Author:** Harshitha (Frontend Analytics & Visualizations Lead)  
**Organization:** Infotact Solutions (Electronic City, Bengaluru, Karnataka, PIN 560100)  
**Project:** NexusFlow: Visual IoT Telemetry & Rule Engine  
**Internship ID:** ITS/WEB/1849 (Koneti Manikanth)  
**Review Date:** 27 November 2026  
**Status:** Approved & Merged into `main`  

---

## 1. Executive Summary & Purpose

Single-sensor threshold triggers frequently generate false positives during operational mode changes or fail to detect complex, multi-variate machine failures where multiple metrics degrade sub-critically in tandem.

NexusFlow's **Sensor Fusion & PCA Dimensionality Reduction Module** unifies 4 synchronous telemetry vectors (temperature, vibration, pressure, current) into a singular, high-fidelity **Composite Health Index** conforming to:
1. **IEEE Transactions on Industrial Informatics:** Multivariate Fault Prognostics & Machine Learning in Smart Manufacturing.
2. **ISO 13374-2:** Data Processing and Diagnostic Health Assessment for Condition Monitoring.

---

## 2. Mathematical Formulations

### 2.1 Covariance Matrix
For an $N \times D$ observation matrix $\mathbf{X}$ with mean vector $\boldsymbol{\mu}$:
$$\mathbf{\Sigma}_{j,k} = \frac{1}{N - 1} \sum_{i=1}^N (X_{i,j} - \mu_j)(X_{i,k} - \mu_k)$$

### 2.2 First Principal Component (PC1) via Power Iteration
$$\mathbf{v}^{(k+1)} = \frac{\mathbf{\Sigma} \mathbf{v}^{(k)}}{\|\mathbf{\Sigma} \mathbf{v}^{(k)}\|}$$
The dominant eigenvalue representing maximum variance captured:
$$\lambda_1 = \mathbf{v}^T \mathbf{\Sigma} \mathbf{v}$$

### 2.3 Normalized Multivariate Distance & Composite Health
Given baseline vector $\mathbf{b}$ and channel tolerance limits $\mathbf{t}$:
$$d_i = \frac{|x_i - b_i|}{t_i}$$
$$\text{RMS Divergence } \delta = \sqrt{\frac{1}{D} \sum_{i=1}^D d_i^2}$$
$$\text{Composite Health Index } (\%) = \max\left(0, \min(100, (1 - \min(1, \delta)) \times 100)\right)$$

---

## 3. UI Widget Integration: `SensorFusionWidget.jsx`

- **Composite Health Meter:** Visual 0-100% dial with dynamic color degradation.
- **Eigenvector Weights ($\lambda_1$):** Instant display of leading variance contribution coefficients.
- **Multivariate Divergence Monitor:** Real-time normalized bars pinpointing which channel drives the anomaly.

Signed: Harshitha, Frontend Analytics Lead, Infotact Solutions

# CGAI - Enterprise AI Governance & Operational Resilience

> **Bridging the Strategic and Technical Divide in the Australian Regulatory Landscape**

[![Cloud Run](https://img.shields.io/badge/Google_Cloud_Run-asia--southeast1-4285F4?style=flat-square&logo=googlecloud&logoColor=white)](https://complianceai-platform-1092989779668.asia-southeast1.run.app/)
[![Built With](https://img.shields.io/badge/Built_With-Gemini_3.5_Flash-orange?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev/)
[![Tailwind CSS](https://img.shields.io/badge/UI-Tailwind_CSS-38BDF8?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Proprietary-0F172A?style=flat-square)]()
[![Author](https://img.shields.io/badge/Author-Kriti_Yadav-2563EB?style=flat-square&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/kriti-yadav)
[![Regulation](https://img.shields.io/badge/Compliance-APRA_%7C_ACMA_%7C_DISR_%7C_ASD-0D9488?style=flat-square)]()

---

**Designed and Authored by Kriti Yadav**

CGAI is a unified governance and compliance orchestration platform engineered for
modern Australian enterprises. It transitions corporate AI adoption from passive,
document-heavy compliance to active, real-time, codebase-enforced governance -
giving Board members, CROs, CISOs, and technical teams a single source of truth.

---

## Table of Contents

- [Live Application](#live-application)
- [Project Overview](#project-overview)
- [Target Audience](#target-audience)
- [Regulatory Compliance Matrix](#regulatory-compliance-matrix)
- [Technical Architecture](#technical-architecture)
  - [Multi-Tenant Isolation](#1-cryptographically-secure-multi-tenant-isolation)
  - [AI Defense Layers](#2-multi-layered-ai-defense-ai-security-mode)
  - [Operational Resilience Pipeline](#3-continuous-operational-resilience-4-stage-pipeline)
- [Financial Engineering and ROI](#financial-engineering-and-strategic-roi)
- [Presentation Deck](#presentation-deck)
- [Visual Design System](#visual-design-system)
- [Operational Deployment](#operational-deployment)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Contributing](#contributing)
- [License and Credits](#license-and-credits)

---

## Live Application

| Resource | Link |
|---|---|
| Active Application Prototype | [complianceai-platform-1092989779668.asia-southeast1.run.app](https://complianceai-platform-1092989779668.asia-southeast1.run.app/) |
| Interactive Presentation Deck | `presentation.html` (see below) |
| Architecture Diagram | [`/docs/architecture.md`](./docs/architecture.md) |

---

## Project Overview

CGAI is built to solve the core gap in enterprise AI adoption: the disconnect
between strategic compliance policy and runtime enforcement. Most organisations
operate with:

- PDF-based compliance checklists that have no runtime enforcement
- Siloed tools for risk, security, and audit that do not communicate
- No mechanism to translate regulatory language into algorithmic guardrails

CGAI replaces this with a continuous, code-enforced governance loop - where every
regulatory obligation becomes a live, testable, auditable rule.

---

## Target Audience

| Stakeholder | What CGAI Delivers |
|---|---|
| Board Members and CROs | System health visualisation, macro AI adoption trends, liability mandate compliance dashboards |
| CISOs | Technical mitigation vectors against prompt injections, data leaks, and model poisoning |
| Lead Systems Engineers and Architects | Multi-tenant database rules, API gateway configs, and policy-as-code compilation pipeline |
| Regulatory Compliance Officers | Automated mapping of APRA/ACMA/DISR/ASD obligations to enforceable runtime controls |

---

## Regulatory Compliance Matrix

CGAI acts as an automated orchestration engine that translates disparate regulatory
standards into enforceable, algorithmic guardrails.

| Regulator / Standard | Operational Scope | CGAI Platform Technical Control |
|---|---|---|
| APRA CPS 230 | Operational Risk and Third-Party Vendors | Real-time SLA monitoring, impact tolerance alerts, and multi-tenant isolation verification |
| APRA CPS 234 | Information Asset Security and Threat Response | Double-sided SafeGPT firewalls, continuous endpoint scanning, and automated 72-hour breach logging |
| DISR AI6 | Public Sector and General Ethical AI Principles | Algorithmic bias analysis dashboards, PII redaction (NER) filters, and transparency logs |
| ACMA Code 2026 | Media and Telecom Synthetic Disclosures | Rule Engine templates enforcing automated "Powered by AI" labelling and school-hour content windows |

> Built in alignment with the Australian Signals Directorate (ASD), APRA, ASIC,
> and the Digital Transformation Agency (DTA) standards.

---

## Technical Architecture

### 1. Cryptographically Secure Multi-Tenant Isolation

Flat, shared-database models expose enterprises to catastrophic cross-tenant leaks.
CGAI uses a cryptographically signed custom token workflow to lock user sessions:

- **Custom JWT Claims** - Inject `tenantId` and Role-Based Access Control (RBAC)
  definitions at the token level
- **Declarative Firestore Rules** - Server-side rules validate transactions at the
  database layer, eliminating intermediate API bottlenecks

```javascript
// firestore.rules - Tenant-scoped read/write isolation
match /tenants/{tenantId}/audits/{auditId} {
  allow read, write: if request.auth != null
    && request.auth.token.tenantId == tenantId;
}
```

---

### 2. Multi-Layered AI Defense (AI Security Mode)

```
+---------------------+-------------------------------------------+
|  INPUT LAYER        |  SafeGPT NER Scanner                      |
|                     |  -> Redacts PII, credentials, API secrets  |
|                     |  -> Blocks prompt injection attempts        |
+---------------------+-------------------------------------------+
|  GATEWAY LAYER      |  Model Context Protocol (MCP) Gateways    |
|                     |  -> Restricts autonomous DB/filesystem      |
|                     |     access to declared scopes only          |
+---------------------+-------------------------------------------+
|  SESSION LAYER      |  Burn-After-Use (BAU) Policy              |
|                     |  -> Purges session memory post-inference    |
|                     |  -> Prevents cross-session context poison   |
+---------------------+-------------------------------------------+
```

| Defense Component | Threat Mitigated | Mechanism |
|---|---|---|
| SafeGPT Input Sanitization | Data exfiltration, PII leakage | Real-time NER scanning pre-inference |
| MCP Gateways | Autonomous system over-reach | Scope-restricted tool access declarations |
| Burn-After-Use (BAU) Policy | Context poisoning, session replay | Immediate cache and memory purge post-inference |
| 72-Hour Breach Logging | APRA CPS 234 non-compliance | Immutable BigQuery audit trail |

---

### 3. Continuous Operational Resilience (4-Stage Pipeline)

The platform structures the entire safety lifecycle into a continuous enforcement
loop:

$$\text{Audit (SafeGPT Scan)} \longrightarrow \text{Propose (Control Checklist)} \longrightarrow \text{Implement (JSON Schemas)} \longrightarrow \text{Monitor (Alerts \& Feedback)}$$

```
       +--------------+
  +--->|  1. AUDIT    | SafeGPT scans input data and deployed models
  |    |  (SafeGPT)   | for PII, bias, drift, and policy violations
  |    +------+-------+
  |           |
  |           v
  |    +--------------+
  |    |  2. PROPOSE  | Auto-generates control checklists mapped
  |    |  (Checklist) | to APRA/ACMA/DISR obligations
  |    +------+-------+
  |           |
  |           v
  |    +--------------+
  |    | 3. IMPLEMENT | Compiles JSON policy schemas and Firestore
  |    | (JSON Schema)| rules, deploys to runtime enforcement
  |    +------+-------+
  |           |
  |           v
  |    +--------------+
  +----+  4. MONITOR  | Real-time alerts, SLA dashboards, feedback
       |  (Alerts)    | loops back to Audit stage continuously
       +--------------+
```

---

## Financial Engineering and Strategic ROI

To prove that automated governance acts as a business accelerator rather than a
bottleneck, CGAI models operational latency reduction using the following
productivity friction formula:

$$L_d = U \times (T_m - T_a) \times F_d$$

| Parameter | Definition | Value |
|---|---|---|
| $L_d$ | Daily productivity loss in seconds | calculated |
| $U$ | Active compliance auditors and engineers | 25 |
| $T_m$ | Duration of manual system checks | ~120s |
| $T_a$ | Automated execution time on CGAI | ~2s |
| $F_d$ | Daily frequency of reviews and model safety audits | 40 |

**Enterprise Scale Impact (25 Staff, 40 Audits/Day):**

$$L_d = 25 \times (120 - 2) \times 40 = 118{,}000 \text{ seconds/day} \approx \textbf{32.7 hours reclaimed per day}$$

By consolidating workflows, CGAI reclaims over **32.7 hours of specialised
engineering and compliance capacity** every single day - equivalent to **4
full-time engineers** freed from manual audit overhead.

---

## Presentation Deck

The `presentation.html` file is a fully self-contained, interactive boardroom-ready
presentation engineered with Tailwind CSS, designed to render on both mobile
devices and high-definition boardroom projectors.

### Navigation Controls

| Action | Keyboard Shortcut | Button |
|---|---|---|
| Next Slide | Right Arrow or Spacebar | Next (lower controller) |
| Previous Slide | Left Arrow | Previous (lower controller) |
| Jump to Slide | Click slide indicator in persistent menu | Slide indicator bar |
| Presenter Notes | Toggle "Presenter Notes" panel inside each slide | Notes toggle button |

### Presentation Structure (10 Slides)

```
Slide 01 - Platform Overview and Mission
Slide 02 - The Australian Regulatory Landscape
Slide 03 - Regulatory Compliance Matrix (APRA/ACMA/DISR/ASD)
Slide 04 - Technical Architecture Deep Dive
Slide 05 - Multi-Tenant Security and JWT Isolation
Slide 06 - AI Defense Stack (SafeGPT / MCP / BAU)
Slide 07 - 4-Stage Operational Resilience Pipeline
Slide 08 - Financial ROI and Productivity Formula
Slide 09 - Deployment Roadmap and Integration Timeline
Slide 10 - Strategic Summary and Call to Action
```

---

## Visual Design System

| Token | Role | Value |
|---|---|---|
| Primary Background | Main canvas | #FFFFFF Pure White |
| Secondary Background | Warm off-white | #F8FAFC Canvas |
| Primary Typography | Body and headings | #0F172A Slate Dark |
| Brand Accent - Primary | CTAs, highlights | #2563EB Cobalt Blue |
| Brand Accent - Secondary | Status, success | #0D9488 Emerald Teal |
| Layout | Responsive scaling | Tailwind CSS viewport units |

---

## Operational Deployment

The platform is deployed on Google Cloud Run with a structured integration roadmap.

```bash
# Region: asia-southeast1 (Singapore - optimised for Australian latency)
# Service: complianceai-platform
# Runtime: Containerised, serverless, auto-scaling

gcloud run services describe complianceai-platform \
  --region=asia-southeast1
```

### Deployment Roadmap

| Phase | Milestone | Timeline |
|---|---|---|
| Phase 1 | Core guardrail engine and multi-tenant auth | Week 1–2 |
| Phase 2 | SafeGPT NER pipeline and regulatory matrix | Week 3–4 |
| Phase 3 | Audit evidence package generator | Week 5–6 |
| Phase 4 | Board-level dashboards and alert system | Week 7–8 |
| Phase 5 | Production hardening and APRA CPS 234 logging | Week 9–10 |

---

## Getting Started

### Prerequisites

```bash
python >= 3.11
google-cloud-sdk >= 450.0.0
docker >= 24.0
node >= 20.0
```

### Local Development

```bash
# Clone the repository
git clone https://github.com/kriti-yadav/cgai.git
cd cgai

# Set up Python environment
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Configure Google Cloud credentials
gcloud auth application-default login
gcloud config set project YOUR_PROJECT_ID

# Copy and configure environment variables
cp .env.example .env

# Run locally
python app/main.py
```

### Deploy to Cloud Run

```bash
# Build and push container
docker build -t gcr.io/YOUR_PROJECT_ID/cgai .
docker push gcr.io/YOUR_PROJECT_ID/cgai

# Deploy
gcloud run deploy cgai \
  --image gcr.io/YOUR_PROJECT_ID/cgai \
  --region asia-southeast1 \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2
```

### Environment Variables

```env
GEMINI_API_KEY=your_gemini_api_key
FIREBASE_PROJECT_ID=your_firebase_project_id
GOOGLE_CLOUD_PROJECT=your_gcp_project_id
TENANT_JWT_SECRET=your_jwt_secret_key
BIGQUERY_DATASET=cgai_audit_logs
VERTEX_AI_REGION=asia-southeast1
```

---

## Contributing

Contributions are welcome for the following areas:

- Additional Australian regulatory mappings (TGA, ATO, NHVR)
- Extended NER models for Australian-specific PII (TFN, Medicare, ABN)
- Multilingual fairness testing suite (CALD community equity benchmarks)
- ISO 42001 alignment module
- NIST AI RMF crosswalk documentation

Please open an issue before submitting a pull request. All contributions must
align with the APRA CPS 234 security posture of the platform.

---

## License and Credits

| Field | Detail |
|---|---|
| Platform Conception and Architectural Design | Kriti Yadav |
| Branding Tag | CGAI |
| Regulatory Alignment | ASD, APRA, ASIC, DTA |
| Deployment Infrastructure | Google Cloud Run - asia-southeast1 |
| AI Stack | Google Gemini 2.0 Flash, ShieldGemma, Checks Guardrails API |
| License | Proprietary - All rights reserved 2026 Kriti Yadav |

---

<div align="center">

**CGAI** - From Policy to Proof. From Principles to Runtime.

Built for Australia. Engineered for Accountability.

[![LinkedIn](https://img.shields.io/badge/Connect-Kriti_Yadav-0A66C2?style=for-the-badge&logo=linkedin)](https://www.linkedin.com/in/kriti-yadav)
[![Live App](https://img.shields.io/badge/Live_App-Cloud_Run-4285F4?style=for-the-badge&logo=googlecloud)](https://complianceai-platform-1092989779668.asia-southeast1.run.app/)

</div>

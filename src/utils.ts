/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Tenant, GuardrailRule, AuditRecord, GuardrailIncident, LedgerEntry, SecurityModeConfig } from './types';

// Simple mock cryptographic hash generator to generate regulatory defensible tokens
export function generateSHA256Mock(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `0x${hex}${Math.floor(Math.random() * 10000000000).toString(16).padEnd(24, 'f')}f3a1`;
}

// Initial default configuration for AI Security Mode
export const INITIAL_SECURITY_CONFIG: SecurityModeConfig = {
  safeGPTInputNER: true,
  safeGPTPIIPatternSensitivity: 'High',
  safeGPTRedactToken: 'REDACT',
  outputToxicityFilters: true,
  outputPolicyClassifier: true,
  burnAfterUseEphemeral: false,
  adversarialHiddenCharDetector: true,
  adversarialRedirectChainAnalyses: true,
  adversarialEgressAllowlistGroup: 'Strict',
};

// Seed Tenants out of the box
export const SEED_TENANTS: Tenant[] = [
  {
    id: 't-meddevice-01',
    name: 'Acura MedTech Solutions',
    primaryContact: 'Sarah Jenkins (VP Regulatory Affairs)',
    vertical: 'Medical Device',
    departments: ['IT & Security', 'Finance & Audit', 'Human Resources', 'Operations', 'Public Relations'],
    createdAt: '2026-01-15T09:00:00Z',
  },
  {
    id: 't-telecom-02',
    name: 'TelcoPacific Australia',
    primaryContact: 'Michael Chang (Director of Trust)',
    vertical: 'Telecommunications',
    departments: ['Operations', 'IT & Security', 'Public Relations'],
    createdAt: '2026-03-22T08:30:00Z',
  }
];

// Seed Rules mapped directly to the document specifications
export const SEED_RULES: GuardrailRule[] = [
  // Medical Device Rules (TGA Principles / IEC 62304 / ISO 13485)
  {
    id: 'rule-tga-13b-ver',
    tenantId: 't-meddevice-01',
    title: 'EP 13B Software Versioning Control',
    vertical: 'Medical Device',
    department: 'IT & Security',
    standardMatched: 'TGA Essential Principle 13B (ISO 13485 / IEC 62304)',
    description: 'Enforces software version control and build history immutability. Code repository metadata must map to Essential Principle 13B.',
    enforcementGate: 'Blocking',
    isActive: true,
    regoCode: `package playbox.rules.tga_13b_ver\ndefault allow = false\nallow {\n  input.software_version != ""\n  input.git_tag_match == true\n  input.immutable_build_registry == true\n}`,
    jsonSchema: '{"type":"object","properties":{"software_version":{"type":"string","minLength":2},"git_tag":"string"}}',
    updatedAt: '2026-06-01T12:00:00Z',
  },
  {
    id: 'rule-tga-reviewer',
    tenantId: 't-meddevice-01',
    title: 'Independent Code/Technical Review Check',
    vertical: 'Medical Device',
    department: 'Finance & Audit',
    standardMatched: 'TGA Software Design Controls (IEC 62304)',
    description: 'Verifies that all technical files and software commits include documented independent peer-review signatures before clinical trials.',
    enforcementGate: 'Blocking',
    isActive: true,
    regoCode: `package playbox.rules.tga_reviewer\ndefault allow = false\nallow {\n  input.peer_review_signatures.size() >= 1\n  input.review_has_contradiction == false\n}`,
    updatedAt: '2026-05-18T14:22:00Z',
  },
  {
    id: 'rule-tga-synthetic',
    tenantId: 't-meddevice-01',
    title: 'Mandatory Synthetic Training Rationale',
    vertical: 'Medical Device',
    department: 'Operations',
    standardMatched: 'TGA Safety & Performance Standard',
    description: 'Detects if synthetic datasets were used during neural model training. Strict validation flags use of synthetic data without a written evidence rationale.',
    enforcementGate: 'Warn Only',
    isActive: true,
    regoCode: `package playbox.rules.tga_synthetic\ndefault allow = false\nallow {\n  input.synthetic_ratio == 0\n}\nallow {\n  input.synthetic_ratio > 0\n  input.has_written_rationale == true\n}`,
    updatedAt: '2026-06-03T11:05:00Z',
  },
  {
    id: 'rule-tga-cyber',
    tenantId: 't-meddevice-01',
    title: 'Cybersecurity Guidance & Data Isolation',
    vertical: 'Medical Device',
    department: 'IT & Security',
    standardMatched: 'TGA Cybersecurity Guidance',
    description: 'Scans for network leak vectors, default credentials, and hardcoded API keys in medical software design artifacts.',
    enforcementGate: 'Blocking',
    isActive: true,
    regoCode: `package playbox.rules.cybersecurity_guidance\ndefault allow = false\nallow {\n  input.has_unencrypted_database_urls == false\n  input.exposed_secrets_detected == 0\n}`,
    updatedAt: '2026-06-04T09:12:00Z',
  },

  // APRA CPS 230 / 234 Rules (Finance & Audit)
  {
    id: 'rule-apra-230-sla',
    tenantId: 't-meddevice-01',
    title: 'APRA CPS 230 Third-Party Model SLAs',
    vertical: 'Financial Services',
    department: 'Finance & Audit',
    standardMatched: 'APRA CPS 230 (Operational Resilience)',
    description: 'Demands rigorous risk assessments, continuous SLA performance tracking, and documented outage thresholds for critical third-party model providers.',
    enforcementGate: 'Warn Only',
    isActive: true,
    updatedAt: '2026-05-20T10:00:00Z',
  },
  {
    id: 'rule-apra-234-data',
    tenantId: 't-meddevice-01',
    title: 'APRA CPS 234 Information Asset Isolation',
    vertical: 'Financial Services',
    department: 'IT & Security',
    standardMatched: 'APRA CPS 234 (Information Security)',
    description: 'Requires strict encryption parameters, and formal metadata tags to ensure user data cannot leak laterally into public LLM training partitions.',
    enforcementGate: 'Blocking',
    isActive: true,
    updatedAt: '2026-05-22T11:00:00Z',
  },

  // DISR AI6 Rules (Human Resources & PR)
  {
    id: 'rule-disr-ai6-bias',
    tenantId: 't-meddevice-01',
    title: 'Algorithmic Recruiter Bias Protection',
    vertical: 'Medical Device',
    department: 'Human Resources',
    standardMatched: 'DISR AI6 (Practice 2: Measure & Manage Risks)',
    description: 'Scans candidate evaluation models for demographic parity, PII leaks, and racial/gender bias, flags profiles lacking clear transparent logs.',
    enforcementGate: 'Warn Only',
    isActive: true,
    updatedAt: '2026-05-25T16:00:00Z',
  },
  {
    id: 'rule-disr-ai6-human',
    tenantId: 't-meddevice-01',
    title: 'Human-in-the-Loop Content Gatekeeper',
    vertical: 'Medical Device',
    department: 'Public Relations',
    standardMatched: 'DISR AI6 (Practice 6: Maintain Human Control)',
    description: 'Validates that synthetic public statements or dynamic support-agent copy has undergone mandatory human review, and contains "Powered by AI" disclosures.',
    enforcementGate: 'Warn Only',
    isActive: true,
    updatedAt: '2026-06-02T13:40:00Z',
  },

  // DTA Policy v2.0 Rules (Government)
  {
    id: 'rule-dta-impact',
    tenantId: 't-meddevice-01',
    title: 'DTA v2.0 Mandatory Impact Assessment',
    vertical: 'Government',
    department: 'Operations',
    standardMatched: 'DTA Policy v2.0 (Commonwealth Agencies)',
    description: 'Automated checklist routing the model if it influences administrative sovereign decisions or compiles PII for public-facing citizen portals.',
    enforcementGate: 'Blocking',
    isActive: true,
    updatedAt: '2026-05-28T09:30:00Z',
  }
];

// Seed Audits containing the complex evaluation results
export const SEED_AUDITS: AuditRecord[] = [
  {
    id: 'aud-tga-001',
    tenantId: 't-meddevice-01',
    title: 'Pacemaker Firmware v4.9.2 Design History File',
    filename: 'dhf_pacemaker_firm_v4.9.2.json',
    content: `[COMPLIANCE RECORD: DESIGN HISTORY FILE]
Software Module: Cardiac Pacing Pulse Generator
Model Serial: ACC-PACE-992
Software Version: 4.9.2-ALPHA
Peer Review Commit Log:
- 2026-05-12 [Developer A] Initial pacing cycle state code.
- 2026-05-13 [Developer B] Refined threshold detection filters.
- CODE COMMENT GAP: Technical specification code was pushed directly to master branch on June 3.
- WARNING: No designated independent medical reviewer signature was found for ACC-PACE-992 review logs.

Training Dataset Logistics:
- Neural training relies on synthesized heart pacing frequency algorithms.
- Synthetic-to-Clinical Ratio: 12.5% synthetic cardiac noise generation files.
- RATIONALE STATEMENT: Synthetic datasets used to represent high-amplitude arrhythmic anomalies that cannot be safely captured from physical standard clinical cohorts.

Core Infrastructure Configuration:
- DATABASE_URI=sqlite://internal_memory_store_acc1.db
- SEC_KEY_CONN=0x23f99aa1188bc8aefa88b12... [REDACTED BY IMPORTER]
- Encryption Parameter: 128-bit local payload lock.
- Git tag matches with Essential Principle 13B version records.`,
    department: 'Operations',
    vertical: 'Medical Device',
    status: 'Fail',
    riskLevel: 'High',
    score: 42,
    createdAt: '2026-06-04T10:15:00Z',
    auditedBy: 'devstar5943@gcplab.me',
    violations: ['Independent Code/Technical Review Check'],
    explainedCitations: [
      {
        ruleId: 'rule-tga-reviewer',
        description: 'No independent peer-review signatures found on finalized codebase.',
        confidence: 0.98,
        citation: 'IEC 62304 Section 5.1.4 - Software Design and Peer Review Controls',
        evidenceText: 'WARNING: No designated independent medical reviewer signature was found for ACC-PACE-992 review logs.'
      },
      {
        ruleId: 'rule-tga-synthetic',
        description: 'Using synthetic dataset for pacing model training.',
        confidence: 0.85,
        citation: 'TGA Safety & Performance Standard Section 13B.3 - Quality of Model Data',
        evidenceText: 'Synthetic-to-Clinical Ratio: 12.5% synthetic cardiac noise generation files.'
      }
    ],
    medicalDeviceDetails: {
      rtm: [
        { id: 'rtm-01', designInput: 'EP-DI-PAC-11: Detect cardiac pulse under 40bpm', designOutput: 'Pacing trigger signal active within 80ms', riskEvaluation: 'Risk level moderate: arrhythmia detection delay', verificationTest: 'Test PAC-VT-11 (Failed)', status: 'Non-Compliant' },
        { id: 'rtm-02', designInput: 'EP-DI-PAC-12: Keep active voltage under 3.3V', designOutput: 'PWM state controller hardware limiter', riskEvaluation: 'Critical risk: tissue thermal injury', verificationTest: 'Test PAC-VT-12 (Passed)', status: 'Compliant' },
        { id: 'rtm-03', designInput: 'EP-DI-PAC-13: Log firmware version securely', designOutput: 'ISO 13485 mapped Git meta-tag', riskEvaluation: 'Low risk: version discrepancy', verificationTest: 'Test PAC-VT-13 (Passed)', status: 'Compliant' }
      ],
      hasIndependentReviewSignatures: false,
      usesSyntheticData: true,
      syntheticDataRationale: 'Synthetic datasets used to represent high-amplitude arrhythmic anomalies that cannot be safely captured.',
      essentialPrinciplesMapped: {
        EP13B_versionControl: true,
        EP13B_clinicalVisibility: false,
        EP13B_buildHistoryImmutable: true,
        CybersecurityGuidance: true
      }
    }
  },
  {
    id: 'aud-tga-002',
    tenantId: 't-meddevice-01',
    title: 'PulseOximeter Smart Watch Wearable SDK 1.2',
    filename: 'oximeter_sdk_manifest_v12.md',
    content: `[SECURE MEDICAL DEVICE ASSESSMENT]
Applet Name: PulseOximeter Companion
Target OS: WearOS Custom
Software Version: 1.2.0-RELEASE

Independent Review Signatures:
- Checked by Lead Architect: Dr. Thomas Wu (Review ID: #SIG-99221-WU)
- Approved by Quality Assurance: Elena Rostova (Review ID: #QA-8812)

Data Integrity Metrics:
- Zero synthetic data used. Entirely validated against 1,200 clinical patient trials under NHMRC grant.
- Full Git history version tagged in registry under Essential Principle 13B and IEC 62304 standards.

Threat Risk Matrix:
- Exposed Secrets: None. Verified via automated scans.
- Database Connection: Encrypted local secure storage.
- External APIs restricted to approved clinic endpoint gateway.`,
    department: 'IT & Security',
    vertical: 'Medical Device',
    status: 'Pass',
    riskLevel: 'Low',
    score: 96,
    createdAt: '2026-06-05T08:20:00Z',
    auditedBy: 'devstar5943@gcplab.me',
    violations: [],
    explainedCitations: [],
    medicalDeviceDetails: {
      rtm: [
        { id: 'rtm-ox1', designInput: 'EP-DI-OX-01: Heart-rate monitoring within 1bpm accuracy', designOutput: 'Direct sensor light feedback buffer', riskEvaluation: 'Low risk: minor noise readout', verificationTest: 'Test OX-VT-01 (Passed)', status: 'Compliant' }
      ],
      hasIndependentReviewSignatures: true,
      usesSyntheticData: false,
      syntheticDataRationale: '',
      essentialPrinciplesMapped: {
        EP13B_versionControl: true,
        EP13B_clinicalVisibility: true,
        EP13B_buildHistoryImmutable: true,
        CybersecurityGuidance: true
      }
    }
  },
  {
    id: 'aud-apra-003',
    tenantId: 't-meddevice-01',
    title: 'Credit Risk AI Underwriting Kernel audit',
    filename: 'credit_risk_underwriting.md',
    content: `[BANKING COMPLIANCE ASSESSMENTS]
AI System Code: DE-CREDIT-AI
Operational Standard: APRA CPS 230 / CPS 234 Alignment

Risk Evaluation:
- Generative LLM scoring relies on third-party provider OpenAI GPT-4 API routes.
- GAP DETECTED: No backup outage SLA agreement or contingency service mapped for external OpenAI API.
- Critical operations are exposed to lateral model data leakage since opt-out fields are left to default 'true'.
- Risk of exfiltration: Redact tokens NER masks are turned 'off'. PII can leak into training queues.`,
    department: 'Finance & Audit',
    vertical: 'Financial Services',
    status: 'Fail',
    riskLevel: 'High',
    score: 31,
    createdAt: '2026-06-02T11:45:00Z',
    auditedBy: 'devstar5943@gcplab.me',
    violations: ['APRA CPS 230 Third-Party Model SLAs', 'APRA CPS 234 Information Asset Isolation'],
    explainedCitations: [
      {
        ruleId: 'rule-apra-230-sla',
        description: 'Critical business operations rely on external API with no backup SLA performance agreements.',
        confidence: 0.94,
        citation: 'APRA CPS 230 Section 18 - Outage Tolerance Thresholds',
        evidenceText: 'GAP DETECTED: No backup outage SLA agreement or contingency service mapped for external OpenAI API.'
      }
    ]
  }
];

// Seed Incidents (Failed guardrail statistics)
export const SEED_INCIDENTS: GuardrailIncident[] = [
  {
    id: 'inc-01',
    tenantId: 't-meddevice-01',
    ruleId: 'rule-tga-reviewer',
    ruleTitle: 'Independent Code/Technical Review Check',
    standardMatched: 'TGA Software Design Controls (IEC 62304)',
    documentTitle: 'Pacemaker Firmware v4.9.2 Design History File',
    department: 'Operations',
    failedValue: 'No signature found',
    timestamp: '2026-06-04T10:15:00Z',
    status: 'Active',
  },
  {
    id: 'inc-02',
    tenantId: 't-meddevice-01',
    ruleId: 'rule-tga-synthetic',
    ruleTitle: 'Mandatory Synthetic Training Rationale',
    standardMatched: 'TGA Safety & Performance Standard',
    documentTitle: 'Pacemaker Firmware v4.9.2 Design History File',
    department: 'Operations',
    failedValue: 'Synthetic Ratio: 12.5% [No explicit signature rationale]',
    timestamp: '2026-06-04T10:15:00Z',
    status: 'Active',
  },
  {
    id: 'inc-03',
    tenantId: 't-meddevice-01',
    ruleId: 'rule-apra-230-sla',
    ruleTitle: 'APRA CPS 230 Third-Party Model SLAs',
    standardMatched: 'APRA CPS 230 (Operational Resilience)',
    documentTitle: 'Credit Risk AI Underwriting Kernel audit',
    department: 'Finance & Audit',
    failedValue: 'Missing backup SLA mappings',
    timestamp: '2026-06-02T11:45:00Z',
    status: 'Active',
  }
];

// Seed Ledger entries representing history of unalterable actions
export const SEED_LEDGER: LedgerEntry[] = [
  {
    id: 'led-001',
    tenantId: 't-meddevice-01',
    type: 'RULE_CREATE',
    timestamp: '2026-05-18T14:22:00Z',
    userEmail: 'devstar5943@gcplab.me',
    description: 'Committed Policy-as-Code: Independent Code/Technical Review Check',
    payloadHash: generateSHA256Mock('rule-tga-reviewer_create'),
    metadata: { ruleId: 'rule-tga-reviewer', enforcementGate: 'Blocking' }
  },
  {
    id: 'led-002',
    tenantId: 't-meddevice-01',
    type: 'AUDIT_RUN',
    timestamp: '2026-06-04T10:15:00Z',
    userEmail: 'devstar5943@gcplab.me',
    description: 'Executed Automated Compliance Audit: Pacemaker Firmware v4.9.2 Design History File',
    payloadHash: generateSHA256Mock('pacemaker_firmware_audit_run_fail'),
    metadata: { auditId: 'aud-tga-001', score: 42, activeVertical: 'Medical Device' }
  }
];

/**
 * Enterprise validation score calculation (Sv = wcCs + Sum(wiRi))
 * Where:
 * Cs = Core standard alignment score (calculated as ratio of active compliant rules vs active rules)
 * Ri = Average score of historical audit records for active tenant vertical
 * wc = core weight coefficient = 0.4
 * wi = dynamic weights divided by number of audits = 0.6 / Ri.length
 */
export function calculateSystemHealthIndex(
  rules: GuardrailRule[],
  audits: AuditRecord[],
  vertical: string
): {
  score: number;
  coreScore: number;
  auditAvg: number;
} {
  const filteredRules = rules.filter(r => r.vertical === vertical && r.isActive);
  const filteredAudits = audits.filter(a => a.vertical === vertical);

  // Active compliant rules ratio
  const activeCount = filteredRules.length;
  // Let's mock a core score based on rules in the system
  let coreScore = 82; // Base core standard alignment score
  if (activeCount > 0) {
    const blockingCount = filteredRules.filter(r => r.enforcementGate === 'Blocking').length;
    // more blocking checks = higher compliance posture
    coreScore = Math.min(100, 60 + (blockingCount / activeCount) * 40);
  }

  // Ri: Audit average
  let auditAvg = 85; // default fallback if no audits
  if (filteredAudits.length > 0) {
    const sum = filteredAudits.reduce((acc, curr) => acc + curr.score, 0);
    auditAvg = sum / filteredAudits.length;
  }

  // Sv = wc * Cs + wi * Ri
  // Let wc = 0.4, wi = 0.6
  const wc = 0.4;
  const wi = 0.6;
  const score = Math.round((wc * coreScore) + (wi * auditAvg));

  return {
    score,
    coreScore: Math.round(coreScore),
    auditAvg: Math.round(auditAvg)
  };
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'Admin' | 'Legal Risk Officer' | 'Financial Operator' | 'System Auditor';

export type RegulatoryVertical = 'Medical Device' | 'Telecommunications' | 'Government' | 'Financial Services';

export interface Tenant {
  id: string;
  name: string;
  primaryContact: string;
  vertical: RegulatoryVertical;
  departments: string[];
  createdAt: string;
}

export type SafetyClassification = 'Class A' | 'Class B' | 'Class C';

// TGA Medical Device software structures
export interface RTMNode {
  id: string;
  designInput: string;
  designOutput: string;
  riskEvaluation: string;
  verificationTest: string;
  status: 'Compliant' | 'Non-Compliant' | 'Pending';
}

export interface MedicalDeviceMetadata {
  rtm: RTMNode[];
  hasIndependentReviewSignatures: boolean;
  usesSyntheticData: boolean;
  syntheticDataRationale?: string;
  essentialPrinciplesMapped: {
    EP13B_versionControl: boolean;
    EP13B_clinicalVisibility: boolean;
    EP13B_buildHistoryImmutable: boolean;
    CybersecurityGuidance: boolean;
  };
}

export interface AuditRecord {
  id: string;
  tenantId: string;
  title: string;
  filename: string;
  content: string; // Document source code or assessment text
  department: 'Human Resources' | 'Finance & Audit' | 'IT & Security' | 'Operations' | 'Public Relations';
  vertical: RegulatoryVertical;
  status: 'Pass' | 'Fail' | 'Ongoing';
  riskLevel: 'Low' | 'Medium' | 'High';
  score: number; // 0-100 individual audit score
  createdAt: string;
  auditedBy: string; // Email of auditor
  violations: string[]; // List of triggered failed rules
  explainedCitations: {
    ruleId: string;
    description: string;
    confidence: number; // 0-1 confidence model score
    citation: string; // Exact legal source
    evidenceText: string; // Text fragment highlighted/matched
  }[];
  bypassJustification?: string;
  bypassedAt?: string;
  bypassedBy?: string;
  
  // Vertical-specific rich properties
  medicalDeviceDetails?: MedicalDeviceMetadata;
}

export type RuleEnforcementGate = 'Blocking' | 'Warn Only';

export interface GuardrailRule {
  id: string;
  tenantId: string;
  title: string;
  vertical: RegulatoryVertical;
  department: string;
  standardMatched: string; // e.g. "TGA EP 13B", "APRA CPS 230", "DISR AI6", "DTA Policy v2.0"
  description: string;
  enforcementGate: RuleEnforcementGate;
  regoCode?: string; // Policy-as-Code expression
  jsonSchema?: string; // Policy JSON schema
  isActive: boolean;
  updatedAt: string;
}

export interface GuardrailIncident {
  id: string;
  tenantId: string;
  ruleId: string;
  ruleTitle: string;
  standardMatched: string;
  documentTitle: string;
  department: string;
  failedValue: string;
  timestamp: string;
  status: 'Resolved' | 'Bypassed' | 'Active';
}

export interface LedgerEntry {
  id: string;
  tenantId: string;
  type: 'AUDIT_RUN' | 'RULE_CREATE' | 'RULE_OPTIMIZE' | 'EMERGENCY_BYPASS';
  timestamp: string;
  userEmail: string;
  description: string;
  payloadHash: string; // Mock ledger SHA-256 fingerprint
  metadata: Record<string, any>;
}

export interface SecurityModeConfig {
  safeGPTInputNER: boolean;
  safeGPTPIIPatternSensitivity: 'Low' | 'Medium' | 'High';
  safeGPTRedactToken: 'BLOCK' | 'REDACT' | 'OFF';
  outputToxicityFilters: boolean;
  outputPolicyClassifier: boolean;
  burnAfterUseEphemeral: boolean;
  adversarialHiddenCharDetector: boolean;
  adversarialRedirectChainAnalyses: boolean;
  adversarialEgressAllowlistGroup: 'Strict' | 'Standard' | 'Off';
}

export interface SystemMetrics {
  totalAuditsCount: number;
  monthAuditsCount: number;
  unresolvedIncidents: number;
  failedAuditsCount: number;
}

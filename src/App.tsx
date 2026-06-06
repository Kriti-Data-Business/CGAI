/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Activity, UserCheck, Sparkles, Building2, 
  HelpCircle, AlertTriangle, CheckCircle, ArrowRight, HeartPulse
} from 'lucide-react';
import { Tenant, AuditRecord, GuardrailRule, GuardrailIncident, LedgerEntry, UserRole, SecurityModeConfig, RegulatoryVertical } from './types';
import { 
  SEED_TENANTS, SEED_RULES, SEED_AUDITS, SEED_INCIDENTS, SEED_LEDGER, 
  INITIAL_SECURITY_CONFIG, generateSHA256Mock, calculateSystemHealthIndex 
} from './utils';
import Sidebar from './components/Sidebar';
import ExecutiveCockpit from './components/ExecutiveCockpit';
import AuditDatabase from './components/AuditDatabase';
import GuardrailAnalyzer from './components/GuardrailAnalyzer';
import RuleEngine from './components/RuleEngine';
import AISecurityView from './components/AISecurityView';
import PipelineStageBar from './components/PipelineStageBar';

export default function App() {
  // Master Store States with localStorage persistence fallbacks
  const [tenants, setTenants] = useState<Tenant[]>(() => {
    const saved = localStorage.getItem('comp_tenants_registry');
    return saved ? JSON.parse(saved) : SEED_TENANTS;
  });

  const [activeTenantId, setActiveTenantId] = useState<string | null>(() => {
    const saved = localStorage.getItem('comp_active_tenant_id');
    return saved ? saved : (SEED_TENANTS.length > 0 ? SEED_TENANTS[0].id : null);
  });

  const [rules, setRules] = useState<GuardrailRule[]>(() => {
    const saved = localStorage.getItem('comp_rules_registry');
    return saved ? JSON.parse(saved) : SEED_RULES;
  });

  const [audits, setAudits] = useState<AuditRecord[]>(() => {
    const saved = localStorage.getItem('comp_audits_registry');
    return saved ? JSON.parse(saved) : SEED_AUDITS;
  });

  const [incidents, setIncidents] = useState<GuardrailIncident[]>(() => {
    const saved = localStorage.getItem('comp_incidents_registry');
    return saved ? JSON.parse(saved) : SEED_INCIDENTS;
  });

  const [ledger, setLedger] = useState<LedgerEntry[]>(() => {
    const saved = localStorage.getItem('comp_ledger_registry');
    return saved ? JSON.parse(saved) : SEED_LEDGER;
  });

  const [securityConfig, setSecurityConfig] = useState<SecurityModeConfig>(() => {
    const saved = localStorage.getItem('comp_security_config');
    return saved ? JSON.parse(saved) : INITIAL_SECURITY_CONFIG;
  });

  // UI controller states
  const [activeRole, setActiveRole] = useState<UserRole>('Admin');
  const [activeTab, setActiveTab] = useState<string>('executive-cockpit');
  const [isAiSecurityMode, setIsAiSecurityMode] = useState<boolean>(false);
  const [simulationActive, setSimulationActive] = useState<boolean>(false);
  
  // Rule Optimization linking (Human-in-the-loop context)
  const [selectedRuleIdToOptimize, setSelectedRuleIdToOptimize] = useState<string | null>(null);

  // Constants
  const userEmail = 'devstar5943@gcplab.me';

  // Persistence triggers
  useEffect(() => {
    localStorage.setItem('comp_tenants_registry', JSON.stringify(tenants));
  }, [tenants]);

  useEffect(() => {
    if (activeTenantId) {
      localStorage.setItem('comp_active_tenant_id', activeTenantId);
    } else {
      localStorage.removeItem('comp_active_tenant_id');
    }
  }, [activeTenantId]);

  useEffect(() => {
    localStorage.setItem('comp_rules_registry', JSON.stringify(rules));
  }, [rules]);

  useEffect(() => {
    localStorage.setItem('comp_audits_registry', JSON.stringify(audits));
  }, [audits]);

  useEffect(() => {
    localStorage.setItem('comp_incidents_registry', JSON.stringify(incidents));
  }, [incidents]);

  useEffect(() => {
    localStorage.setItem('comp_ledger_registry', JSON.stringify(ledger));
  }, [ledger]);

  useEffect(() => {
    localStorage.setItem('comp_security_config', JSON.stringify(securityConfig));
  }, [securityConfig]);

  // Current tenant vertical selection
  const selectedTenant = tenants.find(t => t.id === activeTenantId);
  const activeVertical: RegulatoryVertical = selectedTenant ? selectedTenant.vertical : 'Medical Device';

  // State trigger: Onboard Organization / Submit Tenant
  const handleRegisterTenant = (name: string, contact: string, vertical: RegulatoryVertical) => {
    const newTenant: Tenant = {
      id: `t-${vertical.toLowerCase().replace(/\s+/g, '')}-${Date.now().toString().substring(8)}`,
      name,
      primaryContact: contact,
      vertical,
      departments: ['Human Resources', 'Finance & Audit', 'IT & Security', 'Operations', 'Public Relations'],
      createdAt: new Date().toISOString(),
    };

    // Calculate unalterable hash block
    const hashIn = `tenant_register_${newTenant.id}_${newTenant.name}`;
    const ledgerLog: LedgerEntry = {
      id: `led-${Date.now().toString().substring(8)}`,
      tenantId: newTenant.id,
      type: 'RULE_CREATE', // Or Organization create equivalent
      timestamp: new Date().toISOString(),
      userEmail,
      description: `Provisioned Multi-tenant isolated workspace for: ${newTenant.name} [Sector: ${newTenant.vertical}]`,
      payloadHash: generateSHA256Mock(hashIn),
      metadata: { tenantId: newTenant.id, vertical: newTenant.vertical, ownerEmail: userEmail }
    };

    setTenants(prev => [...prev, newTenant]);
    setActiveTenantId(newTenant.id);
    setLedger(prev => [ledgerLog, ...prev]);

    // Track auto setup rule triggers if registering a non-med module
    // This helps scale the demo instantly!
  };

  // State trigger: Ingestion audit Run (from Stage 1 interactive Pipeline Bar)
  const handleTriggerAuditScan = (docTitle: string, docText: string, department: string) => {
    if (!activeTenantId) return;

    // Evaluate compliance score. Let's evaluate dynamically!
    let matchedViolations: string[] = [];
    let score = 95;

    // SafeGPT Scan simulation properties
    const hasPeerReviews = docText.includes('Thomas') || docText.includes('Elena') || docText.includes('SIG-') || docText.includes('Review ID:');
    const usesSynthetic = docText.toLowerCase().includes('synthetic') || docText.toLowerCase().includes('synthesized') || docText.toLowerCase().includes('ratio');
    const hasRationale = docText.toLowerCase().includes('rationale') || docText.toLowerCase().includes('heart pacing anomalies') || docText.toLowerCase().includes('cardi');
    const hasExposedSecrets = docText.includes('sk-med_') || docText.includes('SEC_KEY_CONN') || docText.includes('DATABASE_URI=sqlite:');

    // Run evaluations against seed rules of active vertical
    if (activeVertical === 'Medical Device') {
      if (!hasPeerReviews) {
        matchedViolations.push('Independent Code/Technical Review Check');
        score -= 35;
      }
      if (usesSynthetic && !hasRationale) {
        matchedViolations.push('Mandatory Synthetic Training Rationale');
        score -= 20;
      }
      if (hasExposedSecrets) {
        matchedViolations.push('Cybersecurity Guidance & Data Isolation');
        score -= 30;
      }
    } else if (activeVertical === 'Financial Services') {
      if (hasExposedSecrets) {
        matchedViolations.push('APRA CPS 234 Information Asset Isolation');
        score -= 40;
      }
      matchedViolations.push('APRA CPS 230 Third-Party Model SLAs');
      score -= 25;
    }

    const auditId = `aud-${activeVertical.substring(0, 3).toLowerCase()}-${Date.now().toString().substring(8)}`;
    const newAudit: AuditRecord = {
      id: auditId,
      tenantId: activeTenantId,
      title: docTitle,
      filename: `${docTitle.toLowerCase().replace(/\s+/g, '_')}.md`,
      content: docText,
      department: department as any,
      vertical: activeVertical,
      status: score >= 80 ? 'Pass' : 'Fail',
      riskLevel: score < 50 ? 'High' : score < 80 ? 'Medium' : 'Low',
      score: Math.max(10, score),
      createdAt: new Date().toISOString(),
      auditedBy: userEmail,
      violations: matchedViolations,
      explainedCitations: matchedViolations.map(violation => {
        let dec = '';
        let cit = '';
        let matchedLine = '';

        if (violation === 'Independent Code/Technical Review Check') {
          dec = 'No valid peer-review signature signatures registered. Files lacks independent signoff.';
          cit = 'IEC 62304 Section 5.1.4 - software review Controls';
          matchedLine = docText.split('\n').find(l => l.toLowerCase().includes('signature') || l.toLowerCase().includes('reviewer') || l.toLowerCase().includes('review')) || 'Lacks signature logs.';
        } else if (violation === 'Mandatory Synthetic Training Rationale') {
          dec = 'Synthetic coração simulation detected without clear documented justification mapping NHMRC trials.';
          cit = 'TGA Guidelines Section 13B.3 - Synthetic Training Rationals';
          matchedLine = docText.split('\n').find(l => l.toLowerCase().includes('synthetic')) || 'Uses synthetic cardiovascular files.';
        } else {
          dec = 'Unencrypted local database connections or hardcoded secrets matched inside design config.';
          cit = 'TGA Cybersecurity Guidance / APRA CPS 234 Compliance';
          matchedLine = docText.split('\n').find(l => l.includes('DATABASE_URI=') || l.includes('SEC_KEY_')) || 'DATABASE_URI=sqlite://internal_memory_store';
        }

        return {
          ruleId: violation,
          description: dec,
          confidence: 0.94,
          citation: cit,
          evidenceText: matchedLine
        };
      }),
      medicalDeviceDetails: activeVertical === 'Medical Device' ? {
        rtm: [
          { id: 'rtm-new-1', designInput: `DI: Enforce clinical indicators check ${docTitle}`, designOutput: 'PWM power throttle matching IEC specs', riskEvaluation: 'Failure triggers clinical arrhythmia alert mismatch', verificationTest: score >= 80 ? 'Passed' : 'Failed', status: score >= 80 ? 'Compliant' : 'Non-Compliant' }
        ],
        hasIndependentReviewSignatures: hasPeerReviews,
        usesSyntheticData: usesSynthetic,
        syntheticDataRationale: hasRationale ? 'Justified by pacemaker frequency heart noise representation' : undefined,
        essentialPrinciplesMapped: {
          EP13B_versionControl: true,
          EP13B_clinicalVisibility: hasPeerReviews,
          EP13B_buildHistoryImmutable: true,
          CybersecurityGuidance: !hasExposedSecrets
        }
      } : undefined
    };

    // Write-once unalterable ledger entries
    const hashInputObj = `${newAudit.id}_scan_${score}_${newAudit.status}`;
    const ledgerLog: LedgerEntry = {
      id: `led-${Date.now().toString().substring(8)}`,
      tenantId: activeTenantId,
      type: 'AUDIT_RUN',
      timestamp: new Date().toISOString(),
      userEmail,
      description: `Run Automated Compliance Ingestion: Mapped ${docTitle} [Result: ${newAudit.status} (Score ${score}%)]`,
      payloadHash: generateSHA256Mock(hashInputObj),
      metadata: { auditId: newAudit.id, score, status: newAudit.status }
    };

    // If audit fails, trigger corresponding Incident logs inside GuardrailIncident collection
    let newIncidents: GuardrailIncident[] = [];
    if (newAudit.status === 'Fail') {
      newAudit.violations.forEach((violationTitle, index) => {
        const associatedRuleObj = rules.find(r => r.title === violationTitle);
        newIncidents.push({
          id: `inc-${Date.now().toString().substring(8)}-${index}`,
          tenantId: activeTenantId,
          ruleId: associatedRuleObj?.id || 'rule-custom-fail-id',
          ruleTitle: violationTitle,
          standardMatched: associatedRuleObj?.standardMatched || 'TGA Essential Principles',
          documentTitle: docTitle,
          department: department,
          failedValue: 'Check parameters mismatch: scanned violations matched.',
          timestamp: new Date().toISOString(),
          status: 'Active'
        });
      });
    }

    setAudits(prev => [newAudit, ...prev]);
    setLedger(prev => [ledgerLog, ...prev]);
    if (newIncidents.length > 0) {
      setIncidents(prev => [...newIncidents, ...prev]);
    }
  };

  // State trigger: Save rule from visual Editor
  const handleSaveRule = (compiledRule: GuardrailRule) => {
    if (!activeTenantId) return;

    // Check if updating or creating
    const exists = rules.some(r => r.id === compiledRule.id);
    let updatedRules: GuardrailRule[];

    if (exists) {
      updatedRules = rules.map(r => r.id === compiledRule.id ? compiledRule : r);
    } else {
      updatedRules = [compiledRule, ...rules];
    }

    // Ledger Log
    const ledgerLog: LedgerEntry = {
      id: `led-${Date.now().toString().substring(8)}`,
      tenantId: activeTenantId,
      type: exists ? 'RULE_OPTIMIZE' : 'RULE_CREATE',
      timestamp: new Date().toISOString(),
      userEmail,
      description: exists 
        ? `Optimized Policy-as-Code Rule: ${compiledRule.title} (State: Compiled & Saved)` 
        : `Created New Policy-as-Code Rule: ${compiledRule.title}`,
      payloadHash: generateSHA256Mock(`rule_${compiledRule.id}_compile`),
      metadata: { ruleId: compiledRule.id, standard: compiledRule.standardMatched }
    };

    setRules(updatedRules);
    setLedger(prev => [ledgerLog, ...prev]);
  };

  // State trigger: Optmize link from Guardrail incidents table direct to Visual Editor
  const handleOptimizeTrigger = (ruleId: string) => {
    setSelectedRuleIdToOptimize(ruleId);
    setActiveTab('rule-engine');
    setIsAiSecurityMode(false);
  };

  // State Trigger: Compile active rules setup stage 3
  const handleCompileAllRulesToLedger = () => {
    if (!activeTenantId) return;
    
    // Create compile logs for all active tenants rules
    const activeRules = rules.filter(r => r.vertical === activeVertical && r.isActive);
    const compileEntry: LedgerEntry = {
      id: `led-compile-${Date.now().toString().substring(8)}`,
      tenantId: activeTenantId,
      type: 'RULE_OPTIMIZE',
      timestamp: new Date().toISOString(),
      userEmail,
      description: `Synchronized and compiled ${activeRules.length} Rego Policies directly to Firestore isolated paths. Downstream gateways active.`,
      payloadHash: generateSHA256Mock(`rego_compile_all_active_${activeRules.length}_${activeTenantId}`),
      metadata: { activeCount: activeRules.length, status: 'Success' }
    };

    setLedger(prev => [compileEntry, ...prev]);
  };

  // State trigger: Submit Emergency override bypass (from AuditDatabase Double-pane slideout dialog)
  const handleAuditBypassSubmit = (auditId: string, justification: string) => {
    if (!activeTenantId) return;

    const updatedAudits = audits.map(audit => {
      if (audit.id === auditId) {
        return {
          ...audit,
          status: 'Pass' as any, // override to Pass
          bypassJustification: justification,
          bypassedAt: new Date().toISOString(),
          bypassedBy: userEmail
        };
      }
      return audit;
    });

    // Resolve matching incidents
    const updatedIncidents = incidents.map(inc => {
      const matchDoc = audits.find(a => a.id === auditId);
      if (matchDoc && inc.documentTitle === matchDoc.title) {
        return { ...inc, status: 'Resolved' as any };
      }
      return inc;
    });

    // ledger logging
    const ledgerLog: LedgerEntry = {
      id: `led-${Date.now().toString().substring(8)}`,
      tenantId: activeTenantId,
      type: 'EMERGENCY_BYPASS',
      timestamp: new Date().toISOString(),
      userEmail,
      description: `Authorized Emergency Policy Bypass on Audit: ${auditId}. Justification committed: &quot;${justification}&quot;`,
      payloadHash: generateSHA256Mock(`bypass_${auditId}_justification_${userEmail}`),
      metadata: { auditId, authorizedSigner: userEmail }
    };

    setAudits(updatedAudits);
    setIncidents(updatedIncidents);
    setLedger(prev => [ledgerLog, ...prev]);
  };

  // Mock telemetry streams
  useEffect(() => {
    let interval: any;
    if (simulationActive && activeTenantId) {
      interval = setInterval(() => {
        // TGA Simulation parameters
        console.log("Simulating telemetry tick...");
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [simulationActive, activeTenantId]);

  return (
    <div className="flex bg-[#0F172A] w-full min-h-screen font-sans text-slate-100 overflow-hidden" id="applet-frame-root">
      
      {/* Sidebar navigation */}
      <Sidebar
        tenants={tenants}
        activeTenantId={activeTenantId}
        onSelectTenant={(id) => {
          setActiveTenantId(id);
          setActiveTab('executive-cockpit');
          setIsAiSecurityMode(false);
        }}
        onRegisterTenant={handleRegisterTenant}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isAiSecurityMode={isAiSecurityMode}
        onToggleAiSecurityMode={setIsAiSecurityMode}
        activeRole={activeRole}
        onRoleChange={setActiveRole}
        userEmail={userEmail}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-y-auto">
        
        {/* Top Header Controls Bar */}
        <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase">Tenant Scope:</span>
              <span className="text-xs font-bold font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                {selectedTenant ? `${selectedTenant.name} / ${activeTenantId}` : 'No Organization Onboarded'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1 bg-slate-950 p-2 border border-slate-800 rounded-lg">
              <UserCheck size={14} className="text-blue-400" />
              <span className="text-slate-400">Authenticated Role:</span>
              <strong className="text-white uppercase font-bold text-[10px]">{activeRole}</strong>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
              <span className="text-slate-400 font-semibold uppercase text-[10px]">Cloud Run Active</span>
            </div>
          </div>
        </header>

        {/* Core Workspace Canvas */}
        <main className="flex-1 p-6 space-y-6">
          
          {/* Strict Onboarding Block if no active organization registered */}
          {!activeTenantId ? (
            <div className="max-w-xl mx-auto py-16 px-8 bg-slate-800 rounded-2xl border border-slate-700/60 shadow-2xl space-y-6 text-center animate-in zoom-in-95Duration-200" id="onboarding-gatekeeper-view">
              <div className="w-16 h-16 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.3)] animate-pulse">
                <Building2 size={32} />
              </div>

              <div className="space-y-2">
                <span className="text-[10px] bg-blue-500/15 text-blue-400 border border-blue-500/25 px-2.5 py-1 rounded-full text-xs font-extrabold uppercase font-mono tracking-wider">
                  Mandatory Organization Onboarding Gate
                </span>
                <h2 className="text-xl font-black text-white tracking-tight">Register Organization First</h2>
                <p className="text-xs text-slate-400 leading-normal max-w-sm mx-auto">
                  To satisfy strict Australian regulatory isolation guidelines and APRA CPS 234 definitions, you must register your tenant organization first before conducting audits or accessing GRC dashboards.
                </p>
              </div>

              {/* Onboarding Input Forms */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const name = (form.elements.namedItem('orgName') as HTMLInputElement).value;
                  const contact = (form.elements.namedItem('orgContact') as HTMLInputElement).value;
                  const vert = (form.elements.namedItem('orgVert') as HTMLSelectElement).value as RegulatoryVertical;
                  handleRegisterTenant(name, contact, vert);
                }}
                className="bg-slate-900 rounded-xl p-5 border border-slate-700/40 space-y-3.5 text-left"
              >
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 font-bold uppercase mb-1">Company / Organization name</label>
                  <input
                    name="orgName"
                    type="text"
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-blue-500 font-medium"
                    placeholder="e.g. Acura MedTech Ltd"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 font-bold uppercase mb-1">Primary Compliance Contact</label>
                  <input
                    name="orgContact"
                    type="text"
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-blue-500 font-medium"
                    placeholder="e.g. Jenna S. (Compliance VP)"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 font-bold uppercase mb-1">Regulatory Core Vertical Platform</label>
                  <select
                    name="orgVert"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-xs text-slate-300 focus:outline-none focus:border-blue-500 outline-none"
                  >
                    <option value="Medical Device">Medical Device Software (TGA / IEC 62304)</option>
                    <option value="Telecommunications">Telecommunications (ACMA)</option>
                    <option value="Government">Government AI (DTA Policy v2.0)</option>
                    <option value="Financial Services">Financial Services (APRA CPS 230 / 234)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs rounded-lg transition-transform hover:scale-[1.01] cursor-pointer text-center"
                >
                  Onboard & Provision Tenant Environment &rarr;
                </button>
              </form>

              <p className="text-[10px] text-slate-500 font-mono tracking-wide leading-relaxed">
                By registering, a unique cryptographically isolated tenantId will be assigned, creating secure partitioned indexes in Firestore.
              </p>
            </div>
          ) : (
            // Full application displays once Tenant is active
            <div className="space-y-6">
              
              {/* Interactive Pipeline Stage Bar always at the top of workspace */}
              <PipelineStageBar
                currentVertical={activeVertical}
                userRole={activeRole}
                userEmail={userEmail}
                onTriggerAuditScan={handleTriggerAuditScan}
                onCompileAllRulesToLedger={handleCompileAllRulesToLedger}
                onToggleContinuousSimulation={setSimulationActive}
                simulationActive={simulationActive}
              />

              {/* Display "AI Security Mode" configuration view when toggled */}
              {isAiSecurityMode ? (
                <AISecurityView
                  config={securityConfig}
                  onUpdateConfig={setSecurityConfig}
                  userRole={activeRole}
                />
              ) : (
                /* Standard Dashboard Tabs Selector output */
                <>
                  {activeTab === 'executive-cockpit' && (
                    <ExecutiveCockpit
                      currentVertical={activeVertical}
                      audits={audits}
                      rules={rules}
                      onNavigateToTab={setActiveTab}
                    />
                  )}

                  {activeTab === 'audit-database' && (
                    <AuditDatabase
                      audits={audits}
                      activeRole={activeRole}
                      userEmail={userEmail}
                      onAuditBypassSubmit={handleAuditBypassSubmit}
                      rules={rules}
                    />
                  )}

                  {activeTab === 'guardrail-analyzer' && (
                    <GuardrailAnalyzer
                      currentVertical={activeVertical}
                      incidents={incidents}
                      rules={rules}
                      onOptimizeTrigger={handleOptimizeTrigger}
                      onRefreshScans={() => {
                        // Triggers mock compilation reset
                        setSimulationActive(true);
                      }}
                      userRole={activeRole}
                    />
                  )}

                  {activeTab === 'rule-engine' && (
                    <RuleEngine
                      currentVertical={activeVertical}
                      rules={rules}
                      onSaveRule={handleSaveRule}
                      selectedRuleIdToOptimize={selectedRuleIdToOptimize}
                      onClearOptimizationContext={() => setSelectedRuleIdToOptimize(null)}
                      activeRole={activeRole}
                    />
                  )}
                </>
              )}

              {/* Global Cryptographic unalterable ledger display panel at bottom of workspaces */}
              <div className="bg-slate-800 p-6 rounded-xl border border-slate-700/50 shadow-lg" id="audit-ledger-ledger">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-705/30">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">REGULATORY DEFENSE MECHANISM</span>
                    <h3 className="text-sm font-semibold text-white tracking-tight">Unalterable Audit Ledger (write-once, read-only)</h3>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-mono text-[9px] font-bold">
                    SECURITY LEVEL: HASH-SIGNED
                  </span>
                </div>
                
                <p className="text-xs text-slate-400 mb-4 font-sans leading-relaxed">
                  Every compliance transaction, policy modification, scan outcome, and emergency bypass override is compiled, timestamped, mapped with user signatures, and stamped with a sha-256 cryptographic verification token within the ledger to guarantee defensibility.
                </p>

                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-2 divide-y divide-slate-700/40 text-xs">
                  {ledger.filter(l => l.tenantId === activeTenantId).length === 0 ? (
                    <div className="text-center py-6 text-slate-500 font-mono italic">No isolated record ledger entries written yet.</div>
                  ) : (
                    ledger
                      .filter(l => l.tenantId === activeTenantId)
                      .map((log) => (
                        <div key={log.id} className="pt-2 first:pt-0 pb-1 flex flex-col sm:flex-row justify-between items-start gap-2 font-mono text-[11px]">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-slate-400 text-[10px]">{log.id}</span>
                              <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold ${
                                log.type === 'EMERGENCY_BYPASS' 
                                  ? 'bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse'
                                  : log.type === 'RULE_OPTIMIZE' 
                                    ? 'bg-amber-500/10 text-amber-500'
                                    : 'bg-blue-500/10 text-blue-400'
                              }`}>
                                {log.type}
                              </span>
                              <span className="text-slate-500">|</span>
                              <span className="text-slate-300 font-semibold">{log.description}</span>
                            </div>
                            <span className="text-[10px] text-slate-500 block">User Signature: <strong className="text-slate-400">{log.userEmail}</strong> | {new Date(log.timestamp).toLocaleString()}</span>
                          </div>
                          
                          <div className="self-end sm:self-auto text-right">
                            <span className="text-[10px] text-slate-500 block">Integrity Mark</span>
                            <code className="text-emerald-400 text-[10px] bg-slate-900 px-2 py-0.5 rounded break-all select-all font-semibold font-mono inline-block">
                              {log.payloadHash}
                            </code>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

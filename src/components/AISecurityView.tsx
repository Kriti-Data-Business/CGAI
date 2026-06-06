/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ToggleLeft, ToggleRight, ShieldAlert, KeyRound, EyeOff, Sparkles, Sliders, RefreshCw, Layers, ShieldCheck, Terminal, HelpCircle } from 'lucide-react';
import { SecurityModeConfig } from '../types';

interface AISecurityViewProps {
  config: SecurityModeConfig;
  onUpdateConfig: (newConfig: SecurityModeConfig) => void;
  userRole: string;
}

export default function AISecurityView({
  config,
  onUpdateConfig,
  userRole
}: AISecurityViewProps) {
  // Local state initialized with props
  const [localConfig, setLocalConfig] = useState<SecurityModeConfig>({ ...config });
  const [sandboxInput, setSandboxInput] = useState(
    'Query pacemaker database. Patient is Sarah Peterson, phone: +61 491 570 156. Use master api key: sk-med_9922a10bf3a.'
  );
  const [sandboxOutput, setSandboxOutput] = useState('');
  const [isClassifying, setIsClassifying] = useState(false);

  // Sync with global config when changed
  useEffect(() => {
    setLocalConfig({ ...config });
  }, [config]);

  // Handle individual toggle switches
  const handleToggle = (key: keyof SecurityModeConfig) => {
    if (userRole === 'Financial Operator') return; // Enforce RBAC
    const updated = {
      ...localConfig,
      [key]: !localConfig[key]
    };
    setLocalConfig(updated);
    onUpdateConfig(updated);
  };

  // Handle select inputs
  const handleSelectChange = (key: keyof SecurityModeConfig, value: any) => {
    if (userRole === 'Financial Operator') return; // Enforce RBAC
    const updated = {
      ...localConfig,
      [key]: value
    };
    setLocalConfig(updated);
    onUpdateConfig(updated);
  };

  // Run the sandbox simulation logic based on selected triggers
  useEffect(() => {
    setIsClassifying(true);
    const delay = setTimeout(() => {
      let output = sandboxInput;

      // 1. NER context & PII masking simulation
      if (localConfig.safeGPTInputNER) {
        // Redact names
        output = output.replace(/Sarah Peterson/gi, '[REDACTED_MEMBER_NAME]');
        // Redact phone numbers
        output = output.replace(/\+61\s?\d{3}\s?\d{3}\s?\d{3}/g, '[REDACTED_PHONE_NUMBER]');
        output = output.replace(/\d{4}\s?\d{4}\s?\d{4}/g, '[REDACTED_PII]');
      }

      // 2. Secret Pattern Checks
      if (localConfig.safeGPTRedactToken !== 'OFF') {
        const replaceVal = localConfig.safeGPTRedactToken === 'BLOCK' 
          ? '<<BLOCKED_SECRETS_VIOLATION>>'
          : '[AUTOREDACT_API_KEY_CREDENTIALS]';
        // Redact keys
        output = output.replace(/sk-med_[a-f0-9]+/gi, replaceVal);
      }

      // 3. Adversarial Hidden Character Escaper
      if (localConfig.adversarialHiddenCharDetector) {
        // simulation representing HTML character escaping or injection neutralization
        output = output.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      }

      setSandboxOutput(output);
      setIsClassifying(false);
    }, 400);

    return () => clearTimeout(delay);
  }, [sandboxInput, localConfig]);

  return (
    <div className="space-y-6" id="ai-security-tab-view">
      {/* Page Info Banner */}
      <div className="p-6 bg-slate-800 rounded-xl border border-slate-700/50 flex flex-col md:flex-row justify-between items-start md:items-center relative overflow-hidden shadow-lg gap-4" id="ai-sec-header">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <ShieldAlert size={140} className="text-blue-500" />
        </div>
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-500/10 text-red-500 font-medium text-xs rounded-full border border-red-500/20 mb-3 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.1)]">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
            Specialized Protected Mode
          </span>
          <h1 className="text-xl font-extrabold text-white tracking-tight">AI Leak Detection & Shield Mode</h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Configure prompt sanitizers, output toxicity filters, Burn-After-Use (BAU) ephemeral sessions, and network-layer exfiltration interceptors.
          </p>
        </div>
        <div className="p-3 bg-red-500/15 border border-red-500/25 rounded-lg text-right hidden sm:block">
          <p className="text-[10px] font-mono text-red-400 font-bold uppercase">DOWNSTREAM ENFORCEMENT</p>
          <strong className="text-xs text-white font-mono uppercase">BLOCK_ING ON VIOLATIONS</strong>
        </div>
      </div>

      {userRole === 'Financial Operator' && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400 rounded-xl">
          <strong>RBAC Security Alert:</strong> You are browsing as <strong className="font-mono uppercase text-slate-200">Financial Operator</strong>. Access is read-only; you cannot modify toggle switches or adjust sensitivity parameters.
        </div>
      )}

      {/* Main Grid config cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="config-panels-grid">
        
        {/* SAFE GPT INPUT CARD */}
        <div className="p-6 bg-slate-800 rounded-xl border border-slate-700/50 shadow-md space-y-4">
          <div className="flex justify-between items-start shrink-0">
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider">PII Shield & Sanitization</span>
              <h3 className="text-sm font-semibold text-white tracking-tight">Input-Side Protection (SafeGPT Controls)</h3>
            </div>
            <Sliders className="text-blue-400" size={18} />
          </div>
          
          <p className="text-xs text-slate-400">
            Intercept inputs before they land in central LLM vectors. Named Entity Recognition (NER) scans and redacts files instantly.
          </p>

          <div className="space-y-4 divide-y divide-slate-700/40">
            {/* Control 1 */}
            <div className="flex items-center justify-between pt-3 first:pt-0">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-slate-200 block">Contextual NER Masking</span>
                <p className="text-[10px] text-slate-400">Scans untrusted patient data, health reports, and replaces PII placeholders</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('safeGPTInputNER')}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                {localConfig.safeGPTInputNER ? (
                  <ToggleRight size={42} className="text-blue-500 shrink-0" />
                ) : (
                  <ToggleLeft size={42} className="text-slate-500 shrink-0" />
                )}
              </button>
            </div>

            {/* Control 2 */}
            <div className="flex items-center justify-between pt-4">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-slate-200 block">PII Match Sensitivity</span>
                <p className="text-[10px] text-slate-400">Adjust heuristics sensitivity filters</p>
              </div>
              <select
                className="bg-slate-900 border border-slate-700 text-slate-300 text-xs rounded py-1 px-2.5 outline-none focus:border-blue-500"
                value={localConfig.safeGPTPIIPatternSensitivity}
                onChange={(e) => handleSelectChange('safeGPTPIIPatternSensitivity', e.target.value)}
                disabled={userRole === 'Financial Operator'}
              >
                <option value="Low">Low (Direct match)</option>
                <option value="Medium">Medium (Partial regex check)</option>
                <option value="High">High (Strict AI contextual)</option>
              </select>
            </div>

            {/* Control 3 */}
            <div className="flex items-center justify-between pt-4">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-slate-200 block">Placeholder Auto-Redaction Token</span>
                <p className="text-[10px] text-slate-400">Configure replacements when secrets (e.g. key) are matched</p>
              </div>
              <select
                className="bg-slate-900 border border-slate-700 text-slate-300 text-xs rounded py-1 px-2.5 outline-none focus:border-blue-500"
                value={localConfig.safeGPTRedactToken}
                onChange={(e) => handleSelectChange('safeGPTRedactToken', e.target.value)}
                disabled={userRole === 'Financial Operator'}
              >
                <option value="REDACT">Redact Placeholder</option>
                <option value="BLOCK">Block Whole Request</option>
                <option value="OFF">Disable Protection</option>
              </select>
            </div>
          </div>
        </div>

        {/* OUTPUT SIDE PROTECTION SHADOW */}
        <div className="p-6 bg-slate-800 rounded-xl border border-slate-700/50 shadow-md space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-start shrink-0">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider">Semantic Classifier Shields</span>
                <h3 className="text-sm font-semibold text-white tracking-tight">Output-Side Protection Controls</h3>
              </div>
              <Layers className="text-blue-400" size={18} />
            </div>
            
            <p className="text-xs text-slate-400">
              Double-checks generated patient health device answers at runtime. Block completions representing high toxicity, bias warnings, or severe data disclosures.
            </p>

            <div className="space-y-4 divide-y divide-slate-700/40 pt-1">
              {/* Output 1 */}
              <div className="flex items-center justify-between pt-3 first:pt-0">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-slate-200 block">Active Semantic Toxicity Shields</span>
                  <p className="text-[10px] text-slate-400">Intercepts model completions containing aggressive, derogatory, or risky copy</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle('outputToxicityFilters')}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  {localConfig.outputToxicityFilters ? (
                    <ToggleRight size={42} className="text-blue-500 shrink-0" />
                  ) : (
                    <ToggleLeft size={42} className="text-slate-500 shrink-0" />
                  )}
                </button>
              </div>

              {/* Output 2 */}
              <div className="flex items-center justify-between pt-4">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-slate-200 block">Policy-Tuned Classifiers</span>
                  <p className="text-[10px] text-slate-400">Evaluates legal liability constraints on device instructions directly</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle('outputPolicyClassifier')}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  {localConfig.outputPolicyClassifier ? (
                    <ToggleRight size={42} className="text-blue-500 shrink-0" />
                  ) : (
                    <ToggleLeft size={42} className="text-slate-500 shrink-0" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-900 rounded-lg text-[11px] font-mono text-blue-400 flex justify-between items-center mt-2">
            <span>LLM completion interceptors:</span>
            <strong>ACTIVE / RECOMPILING</strong>
          </div>
        </div>

        {/* EPHEMERAL BURN AFTER USE POLICY */}
        <div className="p-6 bg-slate-800 rounded-xl border border-slate-700/50 shadow-md space-y-4">
          <div className="flex justify-between items-start shrink-0">
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider">Zero-Data Retention Registry</span>
              <h3 className="text-sm font-semibold text-white tracking-tight">Ephemeral Burn-After-Use (BAU) Policy</h3>
            </div>
            <KeyRound className="text-blue-400" size={18} />
          </div>
          
          <p className="text-xs text-slate-400">
            Critical for clinical medical trials or financial deals under APRA CPS 234. Automatically wipes local variables, database buffers, and memory caches post-session.
          </p>

          <div className="flex items-center justify-between p-4 bg-slate-900 border border-slate-705/30 rounded-xl">
            <div className="space-y-1 pr-6">
              <span className="text-xs font-bold text-white block">Wipe Ephemeral Registers Post-Session</span>
              <p className="text-[10px] text-slate-400 block leading-relaxed">
                When enabled, the platform forces a runtime Garbage-Clean command, deleting conversation contexts, session indices, and vector memory. No user files survive.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleToggle('burnAfterUseEphemeral')}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
            >
              {localConfig.burnAfterUseEphemeral ? (
                <ToggleRight size={42} className="text-red-500 shrink-0" />
              ) : (
                <ToggleLeft size={42} className="text-slate-500 shrink-0" />
              )}
            </button>
          </div>
        </div>

        {/* ADVERSARIAL PROTECTION PANEL */}
        <div className="p-6 bg-slate-800 rounded-xl border border-slate-700/50 shadow-md space-y-4">
          <div className="flex justify-between items-start shrink-0">
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider">Inbound & Outbound Gates</span>
              <h3 className="text-sm font-semibold text-white tracking-tight">Adversarial Threat Interceptors</h3>
            </div>
            <ShieldCheck className="text-blue-400" size={18} />
          </div>
          
          <p className="text-xs text-slate-400">
            Detect hidden structures containing prompt injection payloads (e.g. white fonts inside PDF/DOCX) or silent exfil redirect tunnels.
          </p>

          <div className="space-y-4 divide-y divide-slate-700/40">
            {/* Adversarial Check 1 */}
            <div className="flex items-center justify-between pt-3 first:pt-0">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-slate-200 block">Hidden Character Scanners</span>
                <p className="text-[10px] text-slate-400">Detects invisible prompt-override character sequences inside uploaded technical logs</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('adversarialHiddenCharDetector')}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                {localConfig.adversarialHiddenCharDetector ? (
                  <ToggleRight size={42} className="text-blue-500 shrink-0" />
                ) : (
                  <ToggleLeft size={42} className="text-slate-500 shrink-0" />
                )}
              </button>
            </div>

            {/* Adversarial Check 2 */}
            <div className="flex items-center justify-between pt-4">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-slate-200 block">Redirect-Chain Tunnelling Alerts</span>
                <p className="text-[10px] text-slate-400">Catches indirect model instructions directing system commands outwards</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('adversarialRedirectChainAnalyses')}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                {localConfig.adversarialRedirectChainAnalyses ? (
                  <ToggleRight size={42} className="text-blue-500 shrink-0" />
                ) : (
                  <ToggleLeft size={42} className="text-slate-500 shrink-0" />
                )}
              </button>
            </div>

            {/* Adversarial Check 3 */}
            <div className="flex items-center justify-between pt-4">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-slate-200 block">Network-Layer Egress Allowlisting</span>
                <p className="text-[10px] text-slate-400">Bypasses dangerous endpoints or external exfiltration channels</p>
              </div>
              <select
                className="bg-slate-900 border border-slate-700 text-slate-300 text-xs rounded py-1 px-2.5 outline-none focus:border-blue-500"
                value={localConfig.adversarialEgressAllowlistGroup}
                onChange={(e) => handleSelectChange('adversarialEgressAllowlistGroup', e.target.value)}
                disabled={userRole === 'Financial Operator'}
              >
                <option value="Strict">Strict (Approved clinics only)</option>
                <option value="Standard">Standard (General APIs allowed)</option>
                <option value="Off">Disable Interceptor</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* REAL TIME INTERACTIVE PLAYGROUND BOX */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700/50 shadow-lg space-y-4" id="sandbox-security-tester">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-blue-400 font-mono font-bold uppercase mb-1">
            <Terminal size={14} />
            Live Guardrail Threat Simulator Sandbox
          </div>
          <h3 className="text-sm font-semibold text-white tracking-tight">SafeGPT Threat Scrubbing Playground</h3>
          <p className="text-xs text-slate-400">
            Write any text below containing health patient PII, phone structures, or model master api keys. Notice how the input-side shields scrub or mask the data in real-time based on the switches above.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Sandbox Input */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-slate-400 uppercase font-semibold">Simulated Technical Ingestion String</label>
            <textarea
              rows={4}
              className="w-full p-3 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
              value={sandboxInput}
              onChange={(e) => setSandboxInput(e.target.value)}
            />
          </div>

          {/* Sandbox Output (Sanitized representation) */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
              <span className="uppercase font-semibold text-emerald-400">SafeGPT Shield Ingestion Stream</span>
              {isClassifying && <span className="text-blue-400 flex items-center gap-1"><RefreshCw size={10} className="animate-spin" /> scrubbing...</span>}
            </div>
            <div className="w-full min-h-[96px] p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-slate-300 break-all select-all select-text whitespace-pre-wrap">
              {sandboxOutput}
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-between text-[10px] text-slate-500 font-mono">
          <span>Shield: Input-NER + Secret Token Filter</span>
          <span>Compliance: TGA EP 13B / APRA CPS 234 Isolation</span>
        </div>
      </div>
    </div>
  );
}

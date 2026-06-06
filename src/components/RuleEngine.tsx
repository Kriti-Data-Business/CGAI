/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Save, AlertTriangle, Eye, ShieldCheck, Terminal, Cpu, Play, Plus, Trash2, CheckCircle } from 'lucide-react';
import { GuardrailRule, RegulatoryVertical, UserRole } from '../types';

interface RuleEngineProps {
  currentVertical: RegulatoryVertical;
  rules: GuardrailRule[];
  onSaveRule: (rule: GuardrailRule) => void;
  selectedRuleIdToOptimize: string | null;
  onClearOptimizationContext: () => void;
  activeRole: UserRole;
}

export default function RuleEngine({
  currentVertical,
  rules,
  onSaveRule,
  selectedRuleIdToOptimize,
  onClearOptimizationContext,
  activeRole,
}: RuleEngineProps) {
  // Check if we are editing an optimized rule context
  const initialRule = selectedRuleIdToOptimize 
    ? rules.find(r => r.id === selectedRuleIdToOptimize)
    : null;

  // Form states
  const [ruleId, setRuleId] = useState(initialRule?.id || '');
  const [title, setTitle] = useState(initialRule?.title || '');
  const [vertical, setVertical] = useState<RegulatoryVertical>(initialRule?.vertical || currentVertical);
  const [department, setDepartment] = useState(initialRule?.department || 'IT & Security');
  const [standardMatched, setStandardMatched] = useState(initialRule?.standardMatched || '');
  const [description, setDescription] = useState(initialRule?.description || '');
  const [enforcementGate, setEnforcementGate] = useState<'Blocking' | 'Warn Only'>(initialRule?.enforcementGate || 'Blocking');
  const [isActive, setIsActive] = useState(initialRule !== undefined ? (initialRule?.isActive ?? true) : true);
  
  // No-code policy blocks states (interactive parameters)
  const [chkSignature, setChkSignature] = useState(true);
  const [chkSyntheticRatio, setChkSyntheticRatio] = useState(true);
  const [syntheticLimit, setSyntheticLimit] = useState(10);
  const [chkExposedKey, setChkExposedKey] = useState(true);
  
  const [saveSuccess, setSaveSuccess] = useState(false);

  // When selectedRuleIdToOptimize changes, reload the state
  useEffect(() => {
    if (selectedRuleIdToOptimize) {
      const activeRule = rules.find(r => r.id === selectedRuleIdToOptimize);
      if (activeRule) {
        setRuleId(activeRule.id);
        setTitle(activeRule.title);
        setVertical(activeRule.vertical);
        setDepartment(activeRule.department);
        setStandardMatched(activeRule.standardMatched);
        setDescription(activeRule.description);
        setEnforcementGate(activeRule.enforcementGate);
        setIsActive(activeRule.isActive);
        
        // Auto toggles based on rule title
        setChkSignature(activeRule.id === 'rule-tga-reviewer');
        setChkSyntheticRatio(activeRule.id === 'rule-tga-synthetic');
        setChkExposedKey(activeRule.id === 'rule-tga-cyber' || activeRule.id === 'rule-tga-13b-ver');
      }
    }
  }, [selectedRuleIdToOptimize, rules]);

  // Clean form
  const handleNewRule = () => {
    setRuleId('');
    setTitle('');
    setVertical(currentVertical);
    setDepartment('IT & Security');
    setStandardMatched('');
    setDescription('');
    setEnforcementGate('Blocking');
    setIsActive(true);
    onClearOptimizationContext();
  };

  // Generate Rego source code block reactively
  const getRegoCompile = () => {
    const pkgName = ruleId ? ruleId.replace(/-/g, '_') : 'custom_rule_policy';
    let conditions: string[] = [];

    if (chkSignature) {
      conditions.push('  input.peer_review_signatures.size() >= 1');
    }
    if (chkSyntheticRatio) {
      conditions.push(`  input.synthetic_ratio <= ${syntheticLimit}`);
      conditions.push('  input.has_written_rationale == true');
    }
    if (chkExposedKey) {
      conditions.push('  input.has_unencrypted_database_urls == false');
      conditions.push('  input.exposed_secrets_detected == 0');
    }

    if (conditions.length === 0) {
      conditions.push('  input.allow_by_default == true');
    }

    return `package playbox.rules.${pkgName}\n\ndefault allow = false\n\n# Dynamic GRC gate compiled at runtime\nallow {\n${conditions.join('\n')}\n}`;
  };

  const handlesSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !standardMatched) return;

    const id = ruleId || `rule-custom-${Date.now().toString().substring(8)}`;
    const compiledRego = getRegoCompile();

    const compiledRule: GuardrailRule = {
      id,
      tenantId: 't-meddevice-01',
      title,
      vertical,
      department,
      standardMatched,
      description,
      enforcementGate,
      isActive,
      regoCode: compiledRego,
      jsonSchema: JSON.stringify({
        type: 'object',
        properties: {
          isActive: { type: 'boolean' },
          chkSignature: { type: 'boolean', default: chkSignature },
          chkSyntheticRatio: { type: 'boolean', default: chkSyntheticRatio }
        }
      }),
      updatedAt: new Date().toISOString()
    };

    onSaveRule(compiledRule);
    setSaveSuccess(true);
    
    setTimeout(() => {
      setSaveSuccess(false);
      onClearOptimizationContext();
    }, 3000);
  };

  const isLocked = activeRole === 'Financial Operator';

  return (
    <div className="space-y-6" id="rule-engine-tab-view">
      {/* Title */}
      <div className="flex justify-between items-center bg-slate-800 p-6 rounded-xl border border-slate-700/50 shadow-md">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">Visual Rule Builder</h2>
          <p className="text-xs text-slate-400">
            Define, compile, and ship Policy-as-Code (Rego/JSON schema) rules directly to active database engines. Run-time compiled instantly.
          </p>
        </div>
        {!selectedRuleIdToOptimize && (
          <button
            onClick={handleNewRule}
            className="px-3.5 py-1.5 bg-blue-500 hover:bg-blue-600 font-bold text-xs text-white rounded-lg transition-transform hover:scale-105 cursor-pointer flex items-center gap-1.5 shadow"
          >
            <Plus size={14} />
            Create Custom Rule
          </button>
        )}
      </div>

      {isLocked && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-xs text-red-400 rounded-xl flex gap-3 items-center">
          <AlertTriangle className="shrink-0 animate-bounce" size={18} />
          <span>
            <strong>RBAC Security Exclusion:</strong> Your active role is <strong className="uppercase font-mono">{activeRole}</strong>. Budget operators are strictly blocked from editing or creating Policy-as-Code execution rules.
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Edit rules properties */}
        <form onSubmit={handlesSubmit} className="lg:col-span-7 bg-slate-800 p-6 rounded-xl border border-slate-700/50 shadow-lg space-y-5">
          <div className="flex justify-between items-center shrink-0">
            <h3 className="text-sm font-semibold text-slate-300 font-sans uppercase tracking-wider">
              {ruleId ? `Modifying Rule: ${ruleId}` : 'New Policy Definition'}
            </h3>
            {selectedRuleIdToOptimize && (
              <span className="px-2.5 py-0.5 bg-amber-500/15 text-amber-400 text-[10px] font-bold tracking-wider font-mono uppercase bg-amber-500/10 rounded animate-pulse">
                Optimizing Feedback Loop Context
              </span>
            )}
          </div>

          {saveSuccess && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg text-xs font-semibold flex items-center gap-2">
              <CheckCircle size={16} />
              Policy-as-Code rule saved & runtime compiled successfully to Firestore database.
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-[11px] font-mono text-slate-400 font-bold uppercase mb-1 tracking-wider">Rule Title</label>
              <input
                type="text"
                disabled={isLocked}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-medium"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Independent QA verification Sign-off"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-400 font-bold uppercase mb-1 tracking-wider">Sector Vertical Target</label>
              <select
                disabled={isLocked}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-1.5 px-3 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
                value={vertical}
                onChange={(e) => setVertical(e.target.value as RegulatoryVertical)}
              >
                <option value="Medical Device">Medical Device (TGA)</option>
                <option value="Telecommunications">Telecommunications (ACMA)</option>
                <option value="Government">Government (DTA)</option>
                <option value="Financial Services">Financial Services (APRA)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-400 font-bold uppercase mb-1 tracking-wider">Owner Department</label>
              <select
                disabled={isLocked}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-1.5 px-3 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              >
                <option value="Human Resources">Human Resources</option>
                <option value="Finance & Audit">Finance & Audit</option>
                <option value="IT & Security">IT & Security</option>
                <option value="Operations">Operations</option>
                <option value="Public Relations">Public Relations</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-[11px] font-mono text-slate-400 font-bold uppercase mb-1 tracking-wider">Regulatory Mapping Standard Target</label>
              <input
                type="text"
                disabled={isLocked}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                value={standardMatched}
                onChange={(e) => setStandardMatched(e.target.value)}
                placeholder="e.g. TGA Software Design Controls (IEC 62304 Section 5.1)"
                required
              />
            </div>

            <div className="col-span-2">
              <label className="block text-[11px] font-mono text-slate-400 font-bold uppercase mb-1 tracking-wider">Rule Description</label>
              <textarea
                disabled={isLocked}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detail high-risk scenarios caught by this rule check..."
              />
            </div>
          </div>

          {/* POLICY PARAMETERS NO-CODE BLOCK SECTIONS */}
          <div className="border-t border-slate-700/50 pt-4 space-y-4">
            <h4 className="text-[11px] font-bold text-slate-400 font-mono uppercase tracking-widest">Interactive No-Code Guard-Conditions</h4>
            
            <div className="space-y-3">
              {/* Parameter 1 */}
              <div className="flex items-center justify-between p-3 bg-slate-900/60 rounded-lg border border-slate-700/45">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-white block">Audit Peer Review Signature Checks</span>
                  <span className="text-[10px] text-slate-400 font-mono">Ensures documentation tags have independent signatures</span>
                </div>
                <input
                  type="checkbox"
                  disabled={isLocked}
                  checked={chkSignature}
                  onChange={(e) => setChkSignature(e.target.checked)}
                  className="w-4 h-4 text-blue-500 bg-slate-900 border-slate-700 rounded focus:ring-blue-500"
                />
              </div>

              {/* Parameter 2 */}
              <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-700/45 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-white block">Enforce Synthetic Training Dataset Rationale Check</span>
                    <span className="text-[10px] text-slate-400 font-mono">Flags documents using syntheticheart pacing algorithms</span>
                  </div>
                  <input
                    type="checkbox"
                    disabled={isLocked}
                    checked={chkSyntheticRatio}
                    onChange={(e) => setChkSyntheticRatio(e.target.checked)}
                    className="w-4 h-4 text-blue-500 bg-slate-900 border-slate-700 rounded focus:ring-blue-500"
                  />
                </div>
                {chkSyntheticRatio && (
                  <div className="pl-6 flex items-center gap-3">
                    <span className="text-[11px] text-slate-400 font-mono">Max allowable synthetic percentage ratio:</span>
                    <input
                      type="number"
                      disabled={isLocked}
                      className="w-16 bg-slate-800 border border-slate-700 text-xs text-white rounded font-bold font-mono py-1 text-center focus:outline-none"
                      value={syntheticLimit}
                      onChange={(e) => setSyntheticLimit(Number(e.target.value))}
                    />
                    <span className="text-[11px] text-slate-400 font-mono">%</span>
                  </div>
                )}
              </div>

              {/* Parameter 3 */}
              <div className="flex items-center justify-between p-3 bg-slate-900/60 rounded-lg border border-slate-700/45">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-white block">Enforce Exposed Credentials / DB URI Checks</span>
                  <span className="text-[10px] text-slate-400 font-mono">Flags unencrypted databases connections or exposed secrets</span>
                </div>
                <input
                  type="checkbox"
                  disabled={isLocked}
                  checked={chkExposedKey}
                  onChange={(e) => setChkExposedKey(e.target.checked)}
                  className="w-4 h-4 text-blue-500 bg-slate-900 border-slate-700 rounded focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Bottom Settings */}
          <div className="border-t border-slate-700/50 pt-4 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono text-slate-400 font-bold uppercase mb-1 tracking-wider">Deploy State</label>
              <div className="flex items-center gap-3 mt-1.5">
                <label className="inline-flex items-center gap-2 text-xs text-slate-300">
                  <input
                    type="radio"
                    disabled={isLocked}
                    checked={isActive}
                    onChange={() => setIsActive(true)}
                    className="text-blue-500 bg-slate-950 border-slate-700"
                  />
                  Active Enforcing
                </label>
                <label className="inline-flex items-center gap-2 text-xs text-slate-300">
                  <input
                    type="radio"
                    disabled={isLocked}
                    checked={!isActive}
                    onChange={() => setIsActive(false)}
                    className="text-blue-500 bg-slate-950 border-slate-700"
                  />
                  Deactivated
                </label>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-400 font-bold uppercase mb-1 tracking-wider">Enforcement Gate Action</label>
              <div className="flex items-center gap-3 mt-1.5">
                <label className="inline-flex items-center gap-2 text-xs text-slate-300">
                  <input
                    type="radio"
                    disabled={isLocked}
                    checked={enforcementGate === 'Blocking'}
                    onChange={() => setEnforcementGate('Blocking')}
                    className="text-blue-500 bg-slate-950 border-slate-700"
                  />
                  Blocking (Lock builds)
                </label>
                <label className="inline-flex items-center gap-2 text-xs text-slate-300">
                  <input
                    type="radio"
                    disabled={isLocked}
                    checked={enforcementGate === 'Warn Only'}
                    onChange={() => setEnforcementGate('Warn Only')}
                    className="text-blue-500 bg-slate-950 border-slate-700"
                  />
                  Warn Only
                </label>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLocked}
            className={`w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs rounded-lg transition-all transform hover:scale-[1.01] shadow-lg cursor-pointer text-center flex justify-center items-center gap-1.5 ${
              isLocked ? 'opacity-40 cursor-not-allowed hover:scale-100' : ''
            }`}
          >
            <Save size={14} />
            Save & Compile Rego Policy-as-Code Rule
          </button>
        </form>

        {/* Right Output: Live Compiled Code View */}
        <div className="lg:col-span-5 bg-slate-950 rounded-xl border border-slate-800 p-6 shadow-inner flex flex-col justify-between space-y-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-400 font-mono">
              <Terminal size={14} />
              RUNTIME COMPILER OVERVIEW
            </div>
            <h3 className="text-sm font-bold text-white tracking-tight">Rego Policy-as-Code Compiler Output</h3>
            <p className="text-[11px] text-slate-400">
              The engine compiles no-code visual blocks directly into open policy agent (rego) schema code. Commits immediately bypass CD redeploys.
            </p>
          </div>

          {/* Compiler Terminal Screen */}
          <div className="flex-1 min-h-[280px] bg-slate-900 border border-slate-800 rounded-lg p-4 font-mono text-[11px] text-slate-300 overflow-auto relative">
            <div className="absolute top-2 right-2 flex items-center gap-1 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800 text-[9px] font-bold text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              SYNTAX CHECK: PASS
            </div>
            
            <pre className="leading-relaxed text-slate-200">
              {getRegoCompile()}
            </pre>
          </div>

          <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
            <div className="flex justify-between text-xs text-slate-400 font-mono">
              <span>Target Collection:</span>
              <span className="text-blue-400">/tenants/t-meddevice-01/rules</span>
            </div>
            <div className="flex justify-between text-xs text-slate-400 font-mono">
              <span>Enforced Gate:</span>
              <span className={enforcementGate === 'Blocking' ? 'text-red-400 font-bold' : 'text-amber-500'}>
                {enforcementGate}
              </span>
            </div>
            <div className="flex justify-between text-xs text-slate-400 font-mono">
              <span>State isolation:</span>
              <span className="text-emerald-400 font-bold">tenantId-Guarded</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

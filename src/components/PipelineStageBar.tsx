/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ArrowLeft, Play, ShieldAlert, Cpu, CheckCircle2, ChevronRight, FileText, Globe, Key, Activity, Sparkles, Loader } from 'lucide-react';
import { RegulatoryVertical, UserRole } from '../types';

interface PipelineStageBarProps {
  currentVertical: RegulatoryVertical;
  userRole: UserRole;
  userEmail: string;
  onTriggerAuditScan: (docTitle: string, docText: string, department: string) => void;
  onCompileAllRulesToLedger: () => void;
  onToggleContinuousSimulation: (isActive: boolean) => void;
  simulationActive: boolean;
}

export default function PipelineStageBar({
  currentVertical,
  userRole,
  userEmail,
  onTriggerAuditScan,
  onCompileAllRulesToLedger,
  onToggleContinuousSimulation,
  simulationActive
}: PipelineStageBarProps) {
  const [activeStage, setActiveStage] = useState<number>(1);
  
  // Stage 1 (Audit Run) states
  const [uploadedTitle, setUploadedTitle] = useState('');
  const [uploadedText, setUploadedText] = useState('');
  const [targetDept, setTargetDept] = useState<'Human Resources' | 'Finance & Audit' | 'IT & Security' | 'Operations' | 'Public Relations'>('Operations');
  const [auditRunning, setAuditRunning] = useState(false);
  const [auditSuccess, setAuditSuccess] = useState(false);

  // Stage 2 (Proposal Generator) states
  const [draftingProposal, setDraftingProposal] = useState(false);
  const [proposalMarkdown, setProposalMarkdown] = useState<string | null>(null);

  // Stage 3 (Compile) states
  const [compiling, setCompiling] = useState(false);
  const [compiledSuccess, setCompiledSuccess] = useState(false);

  const runStage1Audit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadedTitle || !uploadedText) return;
    
    setAuditRunning(true);
    setAuditSuccess(false);

    setTimeout(() => {
      onTriggerAuditScan(uploadedTitle, uploadedText, targetDept);
      setAuditRunning(false);
      setAuditSuccess(true);
      setUploadedTitle('');
      setUploadedText('');
      
      // Auto advance to next stage to feel rewarding!
      setTimeout(() => {
        setAuditSuccess(false);
        setActiveStage(2);
      }, 2000);
    }, 1500);
  };

  const draftProposal = () => {
    setDraftingProposal(true);
    setTimeout(() => {
      let doc = '';
      if (currentVertical === 'Medical Device') {
        doc = `## Australia TGA / ISO 13485 / IEC 62304 Compliance Proposal
1. EP 13B (Software versioning logs must reside in immutable git registry hashes).
2. Cyber-defense controls enforcing non-anonymous clinical peer signatories.
3. RTM traceability matrices mapped: inputs -> outputs -> risk items -> verification.`;
      } else if (currentVertical === 'Financial Services') {
        doc = `## APRA CPS 230 / CPS 234 Operational Resilience Framework
1. Establish third-party external LLM SLA tolerance thresholds.
2. Segment public user caches from private RAG vector memories.
3. Establish continuous 72-hour suspicious telemetry threat notification.`;
      } else if (currentVertical === 'Government') {
        doc = `## DTA Policy v2.0 - Commonwealth AI Sovereign Framework
1. Register and document accountable officers and model parameters.
2. Publish transparency statement declarations for citizen-facing queries.
3. Conduct pre-market impact assessment checklists.`;
      } else {
        doc = `## ACMA Commercial Radio Code of Practice 2026
1. Detect and tag synthetic voice scheduling blocks in time-windows (8-9am, 3-4pm).
2. Establish transparent "AI scheduling disclaimer" announcement templates.
3. Implement automated scam alpha-numeric message filters.`;
      }
      setProposalMarkdown(doc);
      setDraftingProposal(false);
    }, 1000);
  };

  const runStage3Compile = () => {
    setCompiling(true);
    setTimeout(() => {
      onCompileAllRulesToLedger();
      setCompiling(false);
      setCompiledSuccess(true);
      setTimeout(() => {
        setCompiledSuccess(false);
        setActiveStage(4);
      }, 2000);
    }, 1200);
  };

  const getStageStyle = (stageNum: number) => {
    if (activeStage === stageNum) {
      return 'bg-blue-500 text-white font-black border-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.5)]';
    }
    if (activeStage > stageNum) {
      return 'bg-emerald-500 text-slate-900 font-bold border-emerald-400';
    }
    return 'bg-slate-900 text-slate-500 border-slate-800';
  };

  const stagesList = [
    { num: 1, title: 'Run Security Audit', label: 'Leak Checks & SafeGPT Scanning' },
    { num: 2, title: 'Generate Proposal', label: 'Local Framework Adaptations' },
    { num: 3, title: 'Export & Compile', label: 'Sync Rego Rules to Firestore' },
    { num: 4, title: 'Enable Live Monitoring', label: 'Active Telemetry Simulation' }
  ];

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700/50 overflow-hidden shadow-xl" id="pipeline-orchestrator-stage">
      {/* 4-Stage Tracker header */}
      <div className="bg-slate-900/60 p-4 border-b border-slate-700/40 grid grid-cols-1 md:grid-cols-4 gap-4 md:divide-x md:divide-slate-800">
        {stagesList.map((st) => (
          <div
            key={st.num}
            onClick={() => setActiveStage(st.num)}
            className={`flex items-center gap-3 px-2 py-1 cursor-pointer transition-colors group ${
              activeStage === st.num ? 'text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 text-xs font-mono transition-all ${getStageStyle(st.num)}`}>
              {st.num}
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold font-sans tracking-wide truncate">{st.title}</h4>
              <p className="text-[10px] text-slate-500 truncate mt-0.5">{st.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Body: associated task controls driven by active stage */}
      <div className="p-6 bg-slate-800/40" id="stage-associated-workspace">
        {activeStage === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-in fade-in zoom-in-95Duration-150">
            <div className="md:col-span-5 space-y-3">
              <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 font-bold font-mono rounded uppercase">Action Stage 1</span>
              <h3 className="text-sm font-extrabold text-white tracking-wide">Run Automated Compliance Security Scans</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Ingest technical files, code repositories, design specifications or patient training registries directly into our evaluators to trigger SafeGPT leak detection, regulatory audits, and requirements parsing.
              </p>
              
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-700/30 text-[11px] text-slate-400 font-mono space-y-1">
                <span className="text-blue-400 font-bold block">SafeGPT Protections Layer:</span>
                <span>• NER Contextual Scrub active</span><br />
                <span>• Exposed API key filters active</span><br />
                <span>• Hidden character bypass protection checked</span>
              </div>
            </div>

            <form onSubmit={runStage1Audit} className="md:col-span-7 bg-slate-900 border border-slate-700/50 rounded-xl p-5 space-y-4">
              <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wide">Upload Custom File/Log to Audit</h4>
              
              {auditSuccess && (
                <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold rounded block shadow animate-pulse">
                  ✓ Scan Complete! New Compliance Log published to database under {currentVertical}. Advancing ...
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-[10px] text-slate-400 font-bold font-mono uppercase mb-1">Document Title</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded py-1.5 px-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    placeholder="e.g. Pacemaker Firmware Design Spec v2.1"
                    value={uploadedTitle}
                    onChange={(e) => setUploadedTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-bold font-mono uppercase mb-1">Department</label>
                  <select
                    className="w-full bg-slate-800 border border-slate-700 rounded py-1.5 px-2 text-xs text-slate-300 outline-none"
                    value={targetDept}
                    onChange={(e) => setTargetDept(e.target.value as any)}
                  >
                    <option value="Operations">Operations</option>
                    <option value="IT & Security">IT & Security</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Finance & Audit">Finance & Audit</option>
                    <option value="Public Relations">Public Relations</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-bold font-mono uppercase mb-1">Source File Name</label>
                  <input
                    type="text"
                    className="w-full bg-slate-800 border border-slate-700 rounded py-1.5 px-2.5 text-xs text-slate-300 font-mono text-center"
                    value={uploadedTitle ? `${uploadedTitle.toLowerCase().replace(/\s+/g, '_')}.md` : 'autogenerated_name.md'}
                    disabled
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-[10px] text-slate-400 font-bold font-mono uppercase mb-1">Copy raw text content to scan (DHF, SDP, Code logs...)</label>
                  <textarea
                    rows={3}
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                    placeholder="Please input text containing reviews signatures of developers Elena and Thomas. Add clinical pacing statistics, etc..."
                    value={uploadedText}
                    onChange={(e) => setUploadedText(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={auditRunning}
                className="w-full py-2 bg-blue-500 hover:bg-blue-600 font-bold text-xs text-white rounded-lg cursor-pointer transform hover:scale-[1.01] transition-all flex items-center justify-center gap-1.5"
              >
                {auditRunning ? (
                  <>
                    <Loader className="animate-spin text-white" size={14} />
                    Scrubbing & Evaluating Document For Leaks...
                  </>
                ) : (
                  <>
                    <Play size={14} />
                    Execute SafeGPT Scan & Parse Compliance
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {activeStage === 2 && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-in fade-in zoom-in-95Duration-150">
            <div className="md:col-span-5 space-y-3">
              <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 font-bold font-mono rounded uppercase">Action Stage 2</span>
              <h3 className="text-sm font-extrabold text-white tracking-wide">Generate Regulatory Framework Proposal</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Compile legal and operational frameworks based on details captured from active scans. Creates an alignment strategy matching TGA Essential Principles, APRA operational policies, or ACMACommercial radio schedules.
              </p>
              
              <button
                onClick={draftProposal}
                disabled={draftingProposal}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
              >
                {draftingProposal ? (
                  <>
                    <Loader className="animate-spin" size={14} />
                    Assembling Localized Framework Regulations...
                  </>
                ) : (
                  <>
                    <Globe size={14} />
                    Trigger Regulatory Proposal Draft
                  </>
                )}
              </button>
            </div>

            <div className="md:col-span-7 bg-slate-900 border border-slate-700/50 rounded-xl p-5 min-h-[160px] flex flex-col justify-between">
              {proposalMarkdown ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-slate-950 p-2 rounded">
                    <span className="text-[10px] font-mono font-bold text-emerald-400">STATE: PROPOSED CHECKLIST OVERVIEW</span>
                    <button
                      onClick={() => setActiveStage(3)}
                      className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-0.5 font-mono cursor-pointer"
                    >
                      Process implementation &rarr;
                    </button>
                  </div>
                  <pre className="text-xs text-slate-300 font-mono leading-relaxed bg-slate-950 p-4 border border-slate-800 rounded-lg overflow-x-auto whitespace-pre-wrap">
                    {proposalMarkdown}
                  </pre>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500 font-mono text-xs">
                  <FileText className="mx-auto mb-2 text-slate-600" size={32} />
                  NO FRAMEWORK PROPOSED YET. TRIGGER GENERATION DRAFT ABOVE.
                </div>
              )}
            </div>
          </div>
        )}

        {activeStage === 3 && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-in fade-in zoom-in-95Duration-150">
            <div className="md:col-span-5 space-y-3">
              <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 font-bold font-mono rounded uppercase">Action Stage 3</span>
              <h3 className="text-sm font-extrabold text-white tracking-wide">Export & Compile Rego Rules to Firestore</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Publish live policy-as-code declarations directly into production database paths on Firestore. Once compiled, rule changes instantly guard pipeline actions without software redeploys.
              </p>
              
              <button
                onClick={runStage3Compile}
                disabled={compiling}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shadow-[0_4px_12px_rgba(59,130,246,0.3)] hover:scale-105"
              >
                {compiling ? (
                  <>
                    <Loader className="animate-spin text-white" size={14} />
                    Compiling Policies Into Firestore Rules Partition...
                  </>
                ) : (
                  <>
                    <Key size={14} />
                    Compile Active Rules Setup
                  </>
                )}
              </button>
            </div>

            <div className="md:col-span-7 bg-slate-900 border border-slate-700/50 rounded-xl p-5 flex flex-col justify-center items-center text-center">
              {compiledSuccess ? (
                <div className="space-y-2 py-4 animate-bounce">
                  <CheckCircle2 className="text-emerald-400 mx-auto" size={40} />
                  <h4 className="text-sm font-bold text-white">POLICIES COMPILED & COMMITTED!</h4>
                  <p className="text-xs text-slate-400">All downstream deployment gates refreshed instantly of active rules. Advancing to Stage 4 ...</p>
                </div>
              ) : (
                <div className="space-y-2 text-xs py-4 text-slate-400">
                  <Cpu className="text-slate-600 mx-auto" size={36} />
                  <p className="font-semibold text-slate-300 font-mono">Compile Buffer Status: WAITING FOR COMPILATION TRIGGER</p>
                  <p className="max-w-xs leading-normal">
                    This triggers a live export of visual rules into unified JSON/Rego metadata segments saved on Firestore.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeStage === 4 && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-in fade-in zoom-in-95Duration-150">
            <div className="md:col-span-5 space-y-3">
              <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 font-bold font-mono rounded uppercase">Action Stage 4</span>
              <h3 className="text-sm font-extrabold text-white tracking-wide">Enable Continuous Simulation Scanning</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Activate real-time simulated telemetry logs inside our workspace. Model query counts, validation scores, and security alerts will stream directly to corresponding diagnostic boards.
              </p>
              
              <button
                onClick={() => onToggleContinuousSimulation(!simulationActive)}
                className={`px-4 py-2 rounded-lg font-bold text-xs cursor-pointer transition-all flex items-center gap-1.5 shadow ${
                  simulationActive 
                    ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-extrabold'
                }`}
              >
                <Activity size={14} className={simulationActive ? 'animate-spin' : ''} />
                {simulationActive ? 'Deactivate Live Scanners' : 'Initiate Continuous Telemetry Streams'}
              </button>
            </div>

            <div className="md:col-span-7 bg-slate-950 border border-slate-800 rounded-xl p-5 font-mono text-[11px] text-slate-300 min-h-[140px] flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold mb-2 pb-1 border-b border-slate-800">
                  <span>TELEMETRY STACKS</span>
                  <span className={simulationActive ? 'text-emerald-400' : 'text-slate-500'}>
                    ● {simulationActive ? 'STREAMING ACTIVE' : 'SIMULATION SLEEPING'}
                  </span>
                </div>
                {simulationActive ? (
                  <div className="space-y-1 text-slate-300">
                    <span className="text-emerald-400 font-semibold">[09:55:12] Scan check on PaceDHF.json: COMPLIANCE OK.</span><br />
                    <span className="text-red-400 font-semibold">[09:56:45] Alert: missing Independent Peer Signature onACC-PACE-992.</span><br />
                    <span className="text-blue-400">[09:57:02] Model query telemetry logged to audit_ledger partition.</span>
                  </div>
                ) : (
                  <div className="text-slate-500 italic py-4 text-center">
                    Activate simulation above to start evaluating model logs and routing live telemetry inputs.
                  </div>
                )}
              </div>
              <div className="text-[9px] text-slate-600 pt-1 text-right border-t border-slate-900 font-semibold">
                SYSTEM: ENFORCE BYPASS OVERWATCH
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

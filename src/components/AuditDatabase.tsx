/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, Filter, AlertOctagon, CornerDownRight, X, ArrowLeft, ArrowRight, ShieldCheck, HelpCircle, ShieldAlert, Cpu, AlertTriangle } from 'lucide-react';
import { AuditRecord, UserRole, LedgerEntry, GuardrailRule } from '../types';
import { generateSHA256Mock } from '../utils';

interface AuditDatabaseProps {
  audits: AuditRecord[];
  activeRole: UserRole;
  userEmail: string;
  onAuditBypassSubmit: (auditId: string, justification: string) => void;
  rules: GuardrailRule[];
}

export default function AuditDatabase({
  audits,
  activeRole,
  userEmail,
  onAuditBypassSubmit,
}: AuditDatabaseProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedAuditId, setSelectedAuditId] = useState<string | null>(null);
  const [bypassText, setBypassText] = useState('');
  const [bypassSuccess, setBypassSuccess] = useState<string | null>(null);

  const selectedAudit = audits.find(a => a.id === selectedAuditId);

  // Filter lists
  const departments = ['All', 'Human Resources', 'Finance & Audit', 'IT & Security', 'Operations', 'Public Relations'];
  const risks = ['All', 'Low', 'Medium', 'High'];
  const statuses = ['All', 'Pass', 'Fail', 'Ongoing'];

  // Filtering logic
  const filteredAudits = audits.filter(audit => {
    const matchesSearch = audit.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          audit.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          audit.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = deptFilter === 'All' || audit.department === deptFilter;
    const matchesRisk = riskFilter === 'All' || audit.riskLevel === riskFilter;
    const matchesStatus = statusFilter === 'All' || audit.status === statusFilter;
    
    return matchesSearch && matchesDept && matchesRisk && matchesStatus;
  });

  const handleBypassSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bypassText.trim() || !selectedAuditId) return;

    onAuditBypassSubmit(selectedAuditId, bypassText.trim());
    setBypassSuccess('Regulatory emergency bypass compiled and hard-printed to unalterable ledger.');
    setBypassText('');
    
    setTimeout(() => {
      setBypassSuccess(null);
    }, 4000);
  };

  const getStatusBadge = (status: 'Pass' | 'Fail' | 'Ongoing') => {
    switch (status) {
      case 'Pass':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 text-xs font-semibold rounded-full border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Pass
          </span>
        );
      case 'Fail':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-red-500/10 text-red-400 text-xs font-semibold rounded-full border border-red-500/20 shadow-[0_0_8px_rgba(239,68,68,0.2)] animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
            Fail
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-500/10 text-amber-500 text-xs font-semibold rounded-full border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Ongoing
          </span>
        );
    }
  };

  const getRiskBadge = (risk: 'Low' | 'Medium' | 'High') => {
    switch (risk) {
      case 'High':
        return <span className="text-red-400 font-bold font-mono text-xs">High</span>;
      case 'Medium':
        return <span className="text-amber-500 font-medium font-mono text-xs">Medium</span>;
      default:
        return <span className="text-slate-400 font-mono text-xs">Low</span>;
    }
  };

  // Helper to highlight violations inside the document text pane
  const renderHighlightedDocument = (text: string, violationsText: string[]) => {
    if (!violationsText.length) return <pre className="text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">{text}</pre>;

    let result: React.ReactNode[] = [];
    let remainingText = text;
    let index = 0;

    // Sort fragments to process in sequence
    const fragments = [...violationsText].sort((a, b) => b.length - a.length);

    // Simplistic highlighter: search for specific phrases and wrap them
    while (remainingText.length > 0) {
      let matchedFragment: string | null = null;
      let earliestPos = -1;

      for (const frag of fragments) {
        const p = remainingText.indexOf(frag);
        if (p !== -1 && (earliestPos === -1 || p < earliestPos)) {
          earliestPos = p;
          matchedFragment = frag;
        }
      }

      if (matchedFragment && earliestPos !== -1) {
        // Add non-matched preceding text
        if (earliestPos > 0) {
          result.push(<span key={`txt-${index++}`}>{remainingText.substring(0, earliestPos)}</span>);
        }
        
        // Add matched highlighted text
        result.push(
          <mark 
            key={`mark-${index++}`} 
            className="bg-red-500/25 text-red-200 border border-red-500/50 px-1.5 py-0.5 rounded leading-relaxed inline-block font-mono font-semibold animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.15)]"
            title={`Triggered Rule Violation Highlight`}
          >
            {matchedFragment}
          </mark>
        );

        remainingText = remainingText.substring(earliestPos + matchedFragment.length);
      } else {
        result.push(<span key={`txt-${index++}`}>{remainingText}</span>);
        break;
      }
    }

    return (
      <div className="text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap select-text">
        {result}
      </div>
    );
  };

  return (
    <div className="space-y-6" id="audit-database-tab-view">
      {/* Outer Search and Controls Grid */}
      <div className="bg-slate-800 p-4 rounded-xl border border-slate-700/50 space-y-4" id="filters-container">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div className="relative w-full md:max-w-md">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
              <Search size={18} />
            </span>
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              placeholder="Search audit records, content, citations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <Filter size={14} />
            <span>Found {filteredAudits.length} Records</span>
          </div>
        </div>

        {/* Dropdown Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1 border-t border-slate-700/30">
          <div>
            <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1 tracking-wider">Department</label>
            <select
              className="w-full bg-slate-900 border border-slate-700 text-slate-300 rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:border-blue-500"
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
            >
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1 tracking-wider">Critical Risk</label>
            <select
              className="w-full bg-slate-900 border border-slate-700 text-slate-300 rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:border-blue-500"
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
            >
              {risks.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1 tracking-wider">Status Gate</label>
            <select
              className="w-full bg-slate-900 border border-slate-700 text-slate-300 rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:border-blue-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {statuses.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Datagrid */}
      <div className="bg-slate-800 rounded-xl border border-slate-700/50 overflow-hidden shadow-xl" id="database-table">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/60 border-b border-slate-700 text-slate-400 font-mono text-[11px] font-bold tracking-wider uppercase">
                <th className="py-3 px-4">Audit Ledger ID</th>
                <th className="py-3 px-4">Document Title</th>
                <th className="py-3 px-4">Source Filename</th>
                <th className="py-3 px-4 hidden sm:table-cell">Department</th>
                <th className="py-3 px-4 hidden md:table-cell">Compliance Score</th>
                <th className="py-3 px-4">Risk Level</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Audit Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/40 text-slate-300 text-xs">
              {filteredAudits.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-slate-500 font-mono">
                    <AlertOctagon className="mx-auto mb-2 text-slate-600" size={32} />
                    NO AUDIT RECORDS FOUND MATCHING SEARCH FILTERS.
                  </td>
                </tr>
              ) : (
                filteredAudits.map((audit) => (
                  <tr
                    key={audit.id}
                    className={`hover:bg-slate-700/35 cursor-pointer transition-colors border-l-2 ${
                      selectedAuditId === audit.id ? 'bg-slate-700/25 border-l-blue-500' : 'border-l-transparent'
                    }`}
                    onClick={() => setSelectedAuditId(audit.id)}
                  >
                    <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">{audit.id}</td>
                    <td className="py-3 px-4 font-semibold text-white">{audit.title}</td>
                    <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">{audit.filename}</td>
                    <td className="py-3 px-4 hidden sm:table-cell text-slate-300 font-medium">{audit.department}</td>
                    <td className="py-3 px-4 hidden md:table-cell font-mono">
                      <div className="flex items-center gap-1.5">
                        <div className="w-12 bg-slate-900 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className={`h-full ${audit.score >= 80 ? 'bg-emerald-500' : audit.score >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                            style={{ width: `${audit.score}%` }}
                          ></div>
                        </div>
                        <span className={`font-bold ${audit.score >= 80 ? 'text-emerald-400' : audit.score >= 50 ? 'text-amber-500' : 'text-red-400'}`}>
                          {audit.score}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold">{getRiskBadge(audit.riskLevel)}</td>
                    <td className="py-3 px-4 text-center">{getStatusBadge(audit.status)}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-500 text-[10px]">
                      {new Date(audit.createdAt).toLocaleDateString()} {new Date(audit.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-out Double-Pane Detail Overlay */}
      {selectedAudit && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex justify-end animate-in fade-in duration-200" id="document-slideout-pane">
          <div className="w-full lg:w-[92%] h-full bg-slate-900 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
            {/* Slideout Header */}
            <div className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedAuditId(null)}
                  className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                >
                  <ArrowLeft size={18} />
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold bg-slate-900 px-2 py-0.5 rounded text-slate-400">{selectedAudit.id}</span>
                    <span className="text-xs uppercase font-mono tracking-wider text-blue-400">{selectedAudit.vertical} platform check</span>
                  </div>
                  <h2 className="text-base font-bold text-white mt-0.5">{selectedAudit.title}</h2>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex gap-2 items-center">
                  <span className="text-xs text-slate-400">Compliance score:</span>
                  <span className={`text-sm font-mono font-bold px-2 py-0.5 rounded ${
                    selectedAudit.score >= 80 ? 'text-emerald-400 bg-emerald-500/10' : selectedAudit.score >= 50 ? 'text-amber-500 bg-amber-500/10' : 'text-red-400 bg-red-500/10'
                  }`}>
                    {selectedAudit.score}%
                  </span>
                </div>
                {getStatusBadge(selectedAudit.status)}
                
                <button
                  onClick={() => setSelectedAuditId(null)}
                  className="p-1.5 bg-slate-900/60 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Split Pane Workspace */}
            <div className="flex-1 min-h-0 flex flex-col md:flex-row">
              {/* Left Pane: Audited Document Source View */}
              <div className="w-full md:w-1/2 h-full flex flex-col border-r border-slate-800 bg-slate-950 overflow-hidden">
                <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex justify-between items-center shrink-0">
                  <span className="text-xs font-mono text-slate-400 font-semibold uppercase">{selectedAudit.filename}</span>
                  <span className="text-[11px] text-slate-500 font-mono">ENCODING: UTF-8</span>
                </div>
                
                {/* Scrolling text area with code line numbers */}
                <div className="flex-1 overflow-auto p-4 flex">
                  {/* Line numbers column */}
                  <div className="w-10 pr-4 text-right border-r border-slate-800 text-slate-600 font-mono text-xs select-none">
                    {selectedAudit.content.split('\n').map((_, index) => (
                      <div key={index} className="leading-relaxed">{index + 1}</div>
                    ))}
                  </div>
                  {/* Highlighted text canvas */}
                  <div className="flex-1 pl-4">
                    {renderHighlightedDocument(
                      selectedAudit.content, 
                      selectedAudit.explainedCitations.map(c => c.evidenceText)
                    )}
                  </div>
                </div>
              </div>

              {/* Right Pane: Renders streamed AI compliance evaluation dashboard */}
              <div className="w-full md:w-1/2 h-full bg-slate-900 flex flex-col overflow-auto p-6 space-y-6">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-blue-400 uppercase tracking-widest mb-1">
                    <Cpu size={14} />
                    Explainable AI (XAI) Overlay
                  </div>
                  <h3 className="text-lg font-bold text-white tracking-tight">Active Policy Guardrail Audit Results</h3>
                  <p className="text-xs text-slate-400">
                    Neural engine model confidence, rule-matching telemetry details, and bypass override registers.
                  </p>
                </div>

                {/* Model Metadata parameters */}
                <div className="p-4 bg-slate-800 border border-slate-700/50 rounded-xl space-y-3 shadow-inner">
                  <h4 className="text-[11px] font-bold text-slate-400 tracking-wide uppercase font-mono">Continuous Scan Properties</h4>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1">
                      <span className="text-slate-500 block">Lead Evaluator Model:</span>
                      <strong className="text-slate-300 font-mono">gemini-3.5-flash</strong>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-500 block">Evaluated On:</span>
                      <strong className="text-slate-300 font-mono">{selectedAudit.createdAt.substring(0, 10)}</strong>
                    </div>
                    <div className="space-y-1 col-span-2">
                      <span className="text-slate-500 block">Ledger Cryptographic Fingerprint:</span>
                      <code className="text-[10px] text-blue-400 bg-slate-950 px-2 py-0.5 rounded block font-mono overflow-x-auto">
                        {generateSHA256Mock(selectedAudit.id)}
                      </code>
                    </div>
                  </div>
                </div>

                {/* Requirements Traceability Matrix (RTM) for Medical Device ONLY */}
                {selectedAudit.vertical === 'Medical Device' && selectedAudit.medicalDeviceDetails && (
                  <div className="p-4 bg-slate-800 border border-slate-700/50 rounded-xl space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-[11px] font-bold text-slate-400 tracking-wide uppercase font-mono">Requirements Traceability Matrix (RTM)</h4>
                      <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full px-2 py-0.5 font-semibold font-mono">IEC 62304 Compliance</span>
                    </div>

                    <div className="space-y-3 divide-y divide-slate-700/40">
                      {selectedAudit.medicalDeviceDetails.rtm.map((node) => (
                        <div key={node.id} className="pt-2 first:pt-0 space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="font-mono text-[10px] text-blue-300 font-bold">{node.id}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold font-mono ${
                              node.status === 'Compliant' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20 animate-pulse'
                            }`}>
                              {node.status}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400">
                            <div>
                              <span className="text-slate-500 block">Design Input:</span>
                              <span className="text-slate-300 truncate block">{node.designInput}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 block">Design Output:</span>
                              <span className="text-slate-300 truncate block">{node.designOutput}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 block">Risk Evaluation:</span>
                              <span className="text-slate-300 truncate block">{node.riskEvaluation}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 block">Verification Test:</span>
                              <span className="text-slate-300 truncate block">{node.verificationTest}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-slate-705/30 grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1.5 text-[10px]">
                        <span className={`w-2 h-2 rounded-full ${selectedAudit.medicalDeviceDetails.hasIndependentReviewSignatures ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`}></span>
                        <span className="text-slate-400">Independent Review Signature</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px]">
                        <span className={`w-2 h-2 rounded-full ${!selectedAudit.medicalDeviceDetails.usesSyntheticData ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                        <span className="text-slate-400">Synthetic Training Dataset</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Explainable AI Cards */}
                <div className="space-y-4">
                  <h4 className="text-[11px] font-bold text-slate-400 tracking-wide uppercase font-mono">Evaluated Policy Citations ({selectedAudit.explainedCitations.length})</h4>
                  
                  {selectedAudit.explainedCitations.length === 0 ? (
                    <div className="p-6 text-center rounded-xl bg-slate-900 border border-slate-800 text-slate-500 text-xs">
                      <span className="text-emerald-500 block text-sm font-semibold mb-1">✓ Secure Alignment Certified</span>
                      No policy warnings mapped. Document fully compliant with state regulation parameters.
                    </div>
                  ) : (
                    selectedAudit.explainedCitations.map((cit, idx) => (
                      <div key={idx} className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 space-y-3 shadow-md relative">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="px-2 py-0.5 bg-red-500/15 text-red-400 text-[10px] font-bold rounded border border-red-500/10 inline-block font-mono mb-1">
                              VIOLATION DETECTED
                            </span>
                            <h5 className="text-xs font-bold text-white font-mono">{cit.ruleId}</h5>
                          </div>
                          
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block font-mono">Confidence</span>
                            <span className="text-xs font-bold text-blue-400 font-mono">{Math.round(cit.confidence * 100)}%</span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded border border-slate-800 font-mono">
                          {cit.description}
                        </p>

                        <div className="space-y-1 text-[11px]">
                          <span className="text-slate-500 block font-mono font-bold tracking-wide">LEGAL REFERENCE:</span>
                          <span className="text-slate-300 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                            {cit.citation}
                          </span>
                        </div>

                        <div className="space-y-1 text-[11px]">
                          <span className="text-slate-500 block font-mono font-bold tracking-wide">MATCHED SOURCE TEXT EVIDENCE:</span>
                          <span className="text-red-300 font-mono bg-red-950/40 p-2 rounded border border-red-900/30 block break-all">
                            &quot;{cit.evidenceText}&quot;
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Dynamic Bypass Form */}
                <div className="p-4 bg-slate-800 border ${selectedAudit.bypassJustification ? 'border-emerald-500/30 bg-emerald-950/10' : 'border-slate-700'} rounded-xl space-y-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className={selectedAudit.bypassJustification ? "text-emerald-400" : "text-slate-400"} size={18} />
                    <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">Regulatory Override & Emergency Bypass</h4>
                  </div>

                  {selectedAudit.bypassJustification ? (
                    <div className="space-y-2 text-xs">
                      <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-lg">
                        <p className="font-semibold text-white">Emergency override active:</p>
                        <p className="italic mt-1 text-slate-300 font-mono">&quot;{selectedAudit.bypassJustification}&quot;</p>
                      </div>
                      <div className="grid grid-cols-2 text-[10px] text-slate-500 font-mono pt-1">
                        <div>Bypassed By: {selectedAudit.bypassedBy}</div>
                        <div className="text-right">Time: {selectedAudit.bypassedAt ? new Date(selectedAudit.bypassedAt).toLocaleDateString() : ''}</div>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleBypassSubmit} className="space-y-3">
                      <p className="text-xs text-slate-400">
                        Auditing rules require a formal legal justification to override blocking gates. This prints an immutable cryptographic hash stamp to the digital audit ledger.
                      </p>

                      {bypassSuccess && (
                        <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded text-emerald-400 text-xs font-semibold animate-bounce">
                          {bypassSuccess}
                        </div>
                      )}

                      <div className="space-y-2">
                        <textarea
                          rows={2}
                          className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono"
                          placeholder="Type bypass explanation (e.g. Clinical justification for synthetic сердце-pulse thresholds ISO 13485 section 4)"
                          value={bypassText}
                          onChange={(e) => setBypassText(e.target.value)}
                          required
                        />

                        <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                          <span>Required Scope: Sys Auditor / Legal Officer</span>
                          <span>Role: <strong className="text-blue-400">{activeRole}</strong></span>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={activeRole === 'Financial Operator'}
                        className={`w-full py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold text-xs rounded-lg transition-all transform hover:scale-[1.02] shadow-[0_4px_12px_rgba(59,130,246,0.3)] cursor-pointer text-center flex justify-center items-center gap-1.5 ${
                          activeRole === 'Financial Operator' ? 'opacity-40 cursor-not-allowed hover:scale-100' : ''
                        }`}
                      >
                        <ShieldAlert size={14} />
                        Authorize & Compiling Emergency Bypass
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

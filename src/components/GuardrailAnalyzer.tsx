/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AlertCircle, Wrench, Settings, Clock, Activity, CheckCircle, RefreshCcw, HelpCircle, Flame } from 'lucide-react';
import { GuardrailIncident, GuardrailRule, RegulatoryVertical } from '../types';

interface GuardrailAnalyzerProps {
  currentVertical: RegulatoryVertical;
  incidents: GuardrailIncident[];
  rules: GuardrailRule[];
  onOptimizeTrigger: (ruleId: string) => void;
  onRefreshScans: () => void;
  userRole: string;
}

export default function GuardrailAnalyzer({
  currentVertical,
  incidents,
  rules,
  onOptimizeTrigger,
  onRefreshScans,
  userRole
}: GuardrailAnalyzerProps) {
  // Filter incidents for active vertical
  const activeIncidents = incidents.filter(inc => {
    // Math vertical of rule
    const rule = rules.find(r => r.id === inc.ruleId);
    return rule ? rule.vertical === currentVertical : false;
  });

  // Count incidents per rule to find top failed
  const ruleIncidentCounts = activeIncidents.reduce((acc, curr) => {
    acc[curr.ruleId] = (acc[curr.ruleId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedFailedRules = Object.entries(ruleIncidentCounts)
    .map(([ruleId, count]) => {
      const rule = rules.find(r => r.id === ruleId);
      return {
        ruleId,
        count,
        title: rule ? rule.title : ruleId,
        standard: rule ? rule.standardMatched : 'Regulatory Standard',
        gate: rule ? rule.enforcementGate : 'Blocking',
        isActive: rule ? rule.isActive : false,
        department: rule ? rule.department : 'Operations'
      };
    })
    .sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-6" id="guardrail-analyzer-tab-view">
      {/* Overview Block */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-slate-800 rounded-xl border border-slate-700/50 shadow-md gap-4" id="analyzer-header">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-500 uppercase font-mono tracking-wider">
            <Flame size={14} className="animate-bounce text-amber-500" />
            Closed-Loop Human-in-the-Loop Feedback Engine
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">Guardrail Incident Analyzer</h2>
          <p className="text-xs text-slate-400 max-w-2xl">
            Audit-triggered policy incidents, failed enforcement counts, and live optimization channels for {currentVertical}. Modifying rules commits machine-readable JSON policies instantly.
          </p>
        </div>
        <button
          onClick={onRefreshScans}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap hover:text-white"
        >
          <RefreshCcw size={13} className="animate-spin duration-1000" />
          Rerun Policy Simulation
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="analyzer-statistics-grid">
        {/* Left Column: Aggregated High-Priority Fails */}
        <div className="lg:col-span-1 p-6 bg-slate-800 rounded-xl border border-slate-700/50 shadow-lg flex flex-col justify-between space-y-4">
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Enforced Leak Stat Checks</h3>
            <span className="text-sm text-slate-300 block">Critical Policy Violations</span>
          </div>

          <div className="py-2 flex items-baseline gap-3">
            <span className="text-5xl font-mono font-black text-red-500 animate-pulse tracking-tighter">
              {activeIncidents.filter(i => i.status === 'Active').length}
            </span>
            <div className="text-xs text-slate-400">
              <span className="text-red-400 font-bold block">Active Threats</span>
              <span>Across isolated workspaces</span>
            </div>
          </div>

          {/* Alert panel */}
          <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-xs text-red-300 rounded-lg space-y-1 shadow-[0_0_12px_rgba(239,68,68,0.1)]">
            <div className="flex gap-1.5 items-center font-bold text-red-400 font-mono">
              <AlertCircle size={14} className="shrink-0" />
              BLOCKING ENFORCEMENT HIT!
            </div>
            <p className="text-[11px] leading-relaxed">
              Software compliance pipelines will remain locked under IEC 62304 until design-reviewer signatures are authorized or policies are optimized.
            </p>
          </div>

          <div className="pt-2 border-t border-slate-700/40 text-[10px] text-slate-500 font-mono flex justify-between">
            <span>SEVERITY: RED 500</span>
            <span>POSTURE: OVERWATCH</span>
          </div>
        </div>

        {/* Dynamic List of top failed rules */}
        <div className="lg:col-span-2 p-6 bg-slate-800 rounded-xl border border-slate-700/50 shadow-lg">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono mb-4 text-left">Top Triggered Failed Guardrail Rules</h3>
          
          {sortedFailedRules.length === 0 ? (
            <div className="p-12 text-center rounded-xl bg-slate-900 border border-slate-800">
              <CheckCircle size={32} className="mx-auto text-emerald-400 mb-2" />
              <p className="text-xs font-mono text-slate-500">Zero policy triggers recorded. High-integrity state!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedFailedRules.map((ruleItem, index) => (
                <div key={ruleItem.ruleId} className="p-4 bg-slate-900/60 rounded-xl border border-slate-700/40 hover:border-slate-600 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1 max-w-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-extrabold px-1.5 py-0.5 bg-red-500/20 text-red-400 border border-red-500/20 rounded">
                        #{index + 1} Failed
                      </span>
                      <span className="font-semibold text-white text-xs">{ruleItem.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      Standard: <strong className="text-slate-300 font-mono text-[10px]">{ruleItem.standard}</strong> | Dept: <span className="text-slate-300">{ruleItem.department}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                    <div className="text-right">
                      <span className="text-xs font-bold font-mono text-red-400 bg-red-500/10 px-2 py-0.5 border border-red-500/20 rounded">
                        {ruleItem.count} Incident{ruleItem.count > 1 ? 's' : ''}
                      </span>
                      <span className="block text-[9px] text-slate-500 font-mono mt-1">Gate: {ruleItem.gate}</span>
                    </div>
                    
                    <button
                      onClick={() => onOptimizeTrigger(ruleItem.ruleId)}
                      disabled={userRole === 'Financial Operator'}
                      title={userRole === 'Financial Operator' ? 'Only accessible by Admins and Legal Officers' : 'Modify Policy-as-Code rules'}
                      className={`px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white font-semibold text-[11px] rounded transition-all transform hover:scale-[1.02] flex items-center gap-1.5 cursor-pointer shadow-md ${
                        userRole === 'Financial Operator' ? 'opacity-40 cursor-not-allowed hover:scale-100' : ''
                      }`}
                    >
                      <Wrench size={12} />
                      Optimize Rule
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Grid: Incident Register list */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700/50 shadow-lg" id="incident-register-log">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-300 font-sans tracking-wide">Live Guardrail Incident Telemetry</h3>
            <p className="text-xs text-slate-400">Chronological list of all policy failures intercepted across the active tenant partition.</p>
          </div>
          <div className="px-3 py-1 bg-slate-900 rounded border border-slate-700 text-[10px] text-slate-500 font-mono">
            GATEWAY: ISOLATED RUNTIME
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-[11px]">
            <thead>
              <tr className="bg-slate-900 text-slate-500 py-2 border-b border-slate-700">
                <th className="py-2.5 px-3">INCIDENT ID</th>
                <th className="py-2.5 px-3">RULE REFERENCE</th>
                <th className="py-2.5 px-3">STANDARD</th>
                <th className="py-2.5 px-3">TRIGGER SOURCE DOCUMENT</th>
                <th className="py-2.5 px-3">INTERCEPTED VAL</th>
                <th className="py-2.5 px-3">TIME SECS</th>
                <th className="py-2.5 px-3 text-right">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30 text-slate-300">
              {activeIncidents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-600">No active incidents mapped.</td>
                </tr>
              ) : (
                activeIncidents.map(inc => (
                  <tr key={inc.id} className="hover:bg-slate-900/40">
                    <td className="py-2 px-3 text-slate-400">{inc.id}</td>
                    <td className="py-2 px-3 font-semibold text-white">{inc.ruleTitle}</td>
                    <td className="py-2 px-3 text-slate-400 text-[10px]">{inc.standardMatched}</td>
                    <td className="py-2 px-3 text-slate-300">{inc.documentTitle}</td>
                    <td className="py-2 px-3 text-red-400 text-[10px] max-w-[150px] truncate" title={inc.failedValue}>
                      {inc.failedValue}
                    </td>
                    <td className="py-2 px-3 text-slate-500 text-[10px]">
                      {new Date(inc.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-2 px-3 text-right">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        inc.status === 'Active' ? 'bg-red-500/10 text-red-500 animate-pulse border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400'
                      }`}>
                        {inc.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

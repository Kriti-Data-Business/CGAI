/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle2, TrendingUp, BarChart3, Activity, Info, Sparkles } from 'lucide-react';
import { AuditRecord, GuardrailRule, RegulatoryVertical } from '../types';
import { calculateSystemHealthIndex } from '../utils';

interface ExecutiveCockpitProps {
  currentVertical: RegulatoryVertical;
  audits: AuditRecord[];
  rules: GuardrailRule[];
  onNavigateToTab: (tab: string) => void;
}

export default function ExecutiveCockpit({
  currentVertical,
  audits,
  rules,
  onNavigateToTab,
}: ExecutiveCockpitProps) {
  const [hoveredGauge, setHoveredGauge] = useState(false);

  // Active items
  const activeAudits = audits.filter(a => a.vertical === currentVertical);
  const activeRules = rules.filter(r => r.vertical === currentVertical && r.isActive);
  
  // Calculate dynamic compliance indexes
  const { score, coreScore, auditAvg } = calculateSystemHealthIndex(rules, audits, currentVertical);

  // Stats
  const passedAudits = activeAudits.filter(a => a.status === 'Pass');
  const failedAudits = activeAudits.filter(a => a.status === 'Fail');
  const passRate = activeAudits.length > 0 ? Math.round((passedAudits.length / activeAudits.length) * 100) : 100;

  // Breakdown of failures by department (Human Resources, Finance & Audit, IT & Security, Operations, Public Relations)
  const departmentsList: Array<'Human Resources' | 'Finance & Audit' | 'IT & Security' | 'Operations' | 'Public Relations'> = [
    'Human Resources', 'Finance & Audit', 'IT & Security', 'Operations', 'Public Relations'
  ];

  const failedByDept = departmentsList.map(dept => {
    const totalDeptAudits = activeAudits.filter(a => a.department === dept).length;
    const failedDeptAudits = activeAudits.filter(a => a.department === dept && a.status === 'Fail').length;
    return {
      name: dept,
      total: totalDeptAudits,
      failed: failedDeptAudits,
      percentage: totalDeptAudits > 0 ? Math.round((failedDeptAudits / totalDeptAudits) * 100) : 0,
    };
  });

  // Calculate top triggered guardrails
  const triggerStats = rules
    .filter(r => r.vertical === currentVertical)
    .map(rule => {
      // count how many times this guardrail has been triggered in audits
      const scoreTriggered = activeAudits.filter(a => a.violations.includes(rule.title)).length;
      return {
        title: rule.title,
        standard: rule.standardMatched,
        triggers: scoreTriggered,
        gate: rule.enforcementGate,
      };
    })
    .filter(t => t.triggers > 0)
    .sort((a, b) => b.triggers - a.triggers);

  // Volume metrics
  const monthVolume = activeAudits.length;
  const yearVolume = activeAudits.length * 4 + 3; // simulated historical scale

  return (
    <div className="space-y-6" id="executive-cockpit-tab-view">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-slate-800 rounded-xl border border-slate-700/50 relative overflow-hidden shadow-lg gap-4" id="executive-banner">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Activity size={180} className="text-blue-500" />
        </div>
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 text-blue-400 font-medium text-xs rounded-full border border-blue-500/20 mb-3">
            <Sparkles size={12} />
            Live GRC Orchestrator
          </span>
          <h1 className="text-2xl font-bold text-white tracking-tight">Executive Control Cockpit</h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Real-time validation indexes, compliance tracking dashboards, and deployment-gate policy metrics for <strong className="text-slate-200">{currentVertical}</strong>.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-900/60 p-3 rounded-lg border border-slate-700/30">
          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></div>
          <span className="text-xs text-emerald-400 font-mono font-medium">TELEMETRY SCANNER: ACTIVE | 100% HEALTHY</span>
        </div>
      </div>

      {/* Main Validation Panel & Circular Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard-gauge-grid">
        <div className="lg:col-span-1 p-6 bg-slate-800 rounded-xl border border-slate-700/50 flex flex-col items-center justify-between shadow-lg relative min-h-[380px]">
          <div className="w-full flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold text-slate-300 font-sans tracking-wide">Validation Posture (S_v)</h3>
            <button 
              onMouseEnter={() => setHoveredGauge(true)}
              onMouseLeave={() => setHoveredGauge(false)}
              className="p-1.5 hover:bg-slate-700/50 text-slate-400 hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
              title="System Health Index Formula Explanation"
            >
              <Info size={16} />
            </button>
          </div>

          {/* Micro hover modal for the core formula */}
          {hoveredGauge && (
            <div className="absolute top-12 left-6 right-6 p-4 bg-slate-900 rounded-lg border border-slate-700 text-xs text-slate-300 shadow-2xl z-20 space-y-2 animate-in fade-in zoom-in-95Duration-150">
              <p className="font-semibold text-blue-400 font-mono">System Health score formula:</p>
              <div className="p-1 pb-2 bg-slate-950 rounded text-center border border-slate-800 font-mono text-[11px] text-emerald-400">
                Sv = (wc * Cs) + Sum(wi * Ri)
              </div>
              <p>Where:</p>
              <ul className="list-disc pl-3 text-[10px] space-y-1">
                <li><strong className="text-white">Cs</strong> (Core Standard alignment score): <span className="text-blue-300">({coreScore}%)</span> calculated matching rules and severe blocking gates.</li>
                <li><strong className="text-white">Ri</strong> (Sub-system records score): <span className="text-blue-300">({auditAvg}%)</span> representing real-time audited files.</li>
                <li><strong className="text-slate-400">wc, wi</strong> are weight coefficients representing risk parameters.</li>
              </ul>
            </div>
          )}

          {/* Interactive SVG Circle Gauge */}
          <div className="relative flex items-center justify-center my-6">
            <svg className="w-48 h-48 transform -rotate-90">
              {/* Target Background Ring */}
              <circle
                cx="96"
                cy="96"
                r="80"
                stroke="#1E293B"
                strokeWidth="12"
                fill="transparent"
                className="stroke-slate-900"
              />
              {/* Dynamic Gradient Ring */}
              <circle
                cx="96"
                cy="96"
                r="80"
                stroke={score >= 80 ? '#10B981' : score >= 50 ? '#F59E0B' : '#EF4444'}
                strokeWidth="12"
                strokeDasharray={2 * Math.PI * 80}
                strokeDashoffset={2 * Math.PI * 80 * (1 - score / 100)}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className={`text-[46px] font-bold font-mono tracking-tighter ${
                score >= 80 ? 'text-emerald-400' : score >= 50 ? 'text-amber-500' : 'text-red-500 animate-pulse'
              }`}>
                {score}%
              </span>
              <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 font-semibold mt-1">
                {score >= 80 ? 'Highly Compliant' : score >= 50 ? 'Amber-Alert State' : 'Severe Threat Gate'}
              </span>
            </div>
          </div>

          <div className="w-full space-y-3 bg-slate-900/40 p-4 rounded-lg border border-slate-700/30">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Core Standard Score (Cs):</span>
              <span className="font-mono text-slate-200 font-semibold">{coreScore}%</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Sub-system Audits (Ri):</span>
              <span className="font-mono text-slate-200 font-semibold">{auditAvg}%</span>
            </div>
            <div className="pt-2 border-t border-slate-700/50 flex justify-between items-center text-[10px] font-mono text-blue-400">
              <span>WEIGHT FRACTION: 40/60</span>
              <span>STATE: ISOLATED</span>
            </div>
          </div>
        </div>

        {/* Dynamic Interactive Stats Bar Charts */}
        <div className="lg:col-span-2 p-6 bg-slate-800 rounded-xl border border-slate-700/50 flex flex-col justify-between shadow-lg min-h-[380px]">
          <div>
            <h3 className="text-sm font-semibold text-slate-300 font-sans tracking-wide mb-4">Critical GRC Failure Metrics</h3>
            <p className="text-xs text-slate-400 mb-6">
              Ratio of failed audits generated across active business operational channels. Continuous pipeline scanners inspect records daily.
            </p>
          </div>

          {/* SVG/CSS Custom Animated Bar Chart */}
          <div className="space-y-4">
            {failedByDept.map((dept, index) => (
              <div key={dept.name} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-300">{dept.name}</span>
                  <div className="font-mono text-slate-400">
                    <span className="text-red-400 font-bold">{dept.failed} Fails</span>
                    <span className="text-slate-500 text-[10px]"> / {dept.total} Audits</span>
                  </div>
                </div>
                <div className="relative w-full h-8 bg-slate-900 rounded-lg overflow-hidden border border-slate-700/40 flex items-center px-3 group">
                  {/* Outer Bar */}
                  <div 
                    className="absolute top-0 left-0 bottom-0 bg-red-500/20 transition-all duration-1000 ease-out border-r-2 border-red-500"
                    style={{ width: `${dept.percentage}%` }}
                  ></div>
                  
                  {/* Complete Check Bar for Passed Portion */}
                  {dept.percentage < 100 && dept.total > 0 && (
                    <div 
                      className="absolute top-0 bottom-0 bg-emerald-500/10 border-r border-emerald-500/30 font-semibold text-[10px]"
                      style={{ left: `${dept.percentage}%`, width: `${100 - dept.percentage}%` }}
                    ></div>
                  )}

                  {/* Indicators overlay */}
                  <div className="relative z-10 w-full flex justify-between items-center">
                    <span className="text-[10px] font-mono text-slate-500 font-semibold group-hover:text-slate-300 transition-colors">
                      {dept.total === 0 ? 'No Current Operations Checked' : `${dept.total - dept.failed} Passed / ${dept.failed} Rejected`}
                    </span>
                    <span className={`text-xs font-semibold font-mono ${dept.percentage > 40 ? 'text-red-400' : 'text-slate-400'}`}>
                      {dept.percentage}% Failure Rate
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-700/50 flex justify-between text-[11px] text-slate-400">
            <span>Scan Cycle: Continuous Simulation</span>
            <span>All active departments isolation verified</span>
          </div>
        </div>
      </div>

      {/* Grid: Secondary Metrics & Interactive Feedbacks */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" id="kpi-widgets-grid">
        {/* KPI 1 */}
        <div className="p-4 bg-slate-800 rounded-lg border border-slate-700/50 relative shadow-sm">
          <p className="text-xs text-slate-400 font-sans uppercase tracking-wider font-semibold">Active Scans (This Month)</p>
          <div className="flex justify-between items-baseline mt-2">
            <h4 className="text-3xl font-bold text-white font-mono">{monthVolume}</h4>
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1 font-mono">
              <TrendingUp size={12} />
              +14.2%
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mt-2">Continuous regulatory evaluation pipeline</p>
        </div>

        {/* KPI 2 */}
        <div className="p-4 bg-slate-800 rounded-lg border border-slate-700/50 relative shadow-sm">
          <p className="text-xs text-slate-400 font-sans uppercase tracking-wider font-semibold">Cumulative Scans (Year-to-date)</p>
          <div className="flex justify-between items-baseline mt-2">
            <h4 className="text-3xl font-bold text-white font-mono">{yearVolume}</h4>
            <span className="text-xs font-semibold text-slate-400 font-mono">Simulated Scale</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-2">Multi-tenant historical compilation logs</p>
        </div>

        {/* KPI 3 */}
        <div className="p-4 bg-slate-800 rounded-lg border border-slate-700/50 relative shadow-sm">
          <p className="text-xs text-slate-400 font-sans uppercase tracking-wider font-semibold">Overall Pass Rate</p>
          <div className="flex justify-between items-baseline mt-2">
            <h4 className="text-3xl font-bold text-white font-mono">{passRate}%</h4>
            <span className={`text-xs font-semibold font-mono ${passRate >= 80 ? 'text-emerald-400' : 'text-amber-500'}`}>
              {passRate >= 80 ? 'Excellent' : 'Advisory Action'}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mt-2">Passing vs. Failed document checks</p>
        </div>

        {/* KPI 4 */}
        <div className="p-4 bg-slate-800 rounded-lg border border-slate-700/50 relative shadow-sm">
          <p className="text-xs text-slate-400 font-sans uppercase tracking-wider font-semibold">Rule Compliance Density</p>
          <div className="flex justify-between items-baseline mt-2">
            <h4 className="text-3xl font-bold text-white font-mono">{activeRules.length}</h4>
            <span className="text-xs font-semibold text-blue-400 font-mono">Active Rules</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-2">Enforced Policy-as-Code definitions</p>
        </div>
      </div>

      {/* Triggered Guardrails Register & Strategic Guidelines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="executive-bottom-grid">
        {/* Most Triggered Guardrails */}
        <div className="p-6 bg-slate-800 rounded-xl border border-slate-700/50 shadow-lg">
          <h3 className="text-sm font-semibold text-slate-300 font-sans tracking-wide mb-4">Top Triggered Guardrail Failure Logs</h3>
          
          {triggerStats.length === 0 ? (
            <div className="p-12 text-center rounded-lg border border-dashed border-slate-700 bg-slate-900/30">
              <CheckCircle2 className="mx-auto text-emerald-400 mb-2" size={32} />
              <p className="text-xs text-slate-400">All system checks green! No active guardrail violations found.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {triggerStats.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-slate-900/60 rounded-lg border border-slate-700/40 hover:bg-slate-900 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${item.gate === 'Blocking' ? 'bg-red-500 animate-pulse' : 'bg-amber-500'}`}></span>
                      <p className="text-xs font-semibold text-slate-200">{item.title}</p>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono block">{item.standard}</span>
                  </div>
                  <div className="text-right">
                    <span className={`px-2.5 py-1 text-xs font-bold font-mono rounded ${
                      item.gate === 'Blocking' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {item.triggers} Hit{item.triggers > 1 ? 's' : ''}
                    </span>
                    <span className="block text-[9px] text-slate-500 font-mono mt-1">{item.gate}</span>
                  </div>
                </div>
              ))}
              <div className="pt-2 text-right">
                <button
                  onClick={() => onNavigateToTab('guardrail-analyzer')}
                  className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 ml-auto cursor-pointer"
                >
                  Go to Guardrail incident Analyzer &rarr;
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Enterprise Strategic Advisory Recommendations */}
        <div className="p-6 bg-slate-800 rounded-xl border border-slate-700/50 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Shield className="text-blue-400" size={18} />
              <h3 className="text-sm font-semibold text-slate-300 font-sans tracking-wide">Enterprise Strategic Guidelines (TGA & APRA Alignments)</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Our structural evaluation protocol aligns seamlessly with APRA CPS 230, APRA CPS 234, and DISR AI6. Follow these key directives to enforce system-wide compliance:
            </p>

            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0"></span>
                <p className="text-xs text-slate-300">
                  <strong className="text-slate-200">Commit to Policy-as-Code:</strong> Machine-readable JSON / Rego policies compile instantly to active execution gates, cutting critical manual oversight delays.
                </p>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0"></span>
                <p className="text-xs text-slate-300">
                  <strong className="text-slate-200">Enforce Strict Data-Layer Isolation:</strong> Use cryptographically signed tenantId keys to enforce document isolation at the database layer (APRA CPS 234).
                </p>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0"></span>
                <p className="text-xs text-slate-300">
                  <strong className="text-slate-200">Transition to Continuous Validation:</strong> Annual static audits are obsolete. Real-time logging of pipeline telemetry proactively detects model drift.
                </p>
              </li>
            </ul>
          </div>

          <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-[11px] text-blue-300">
            <strong>Decision Maker Protocol:</strong> These continuous checks ensure and certify TGA medical device standards while prepping for downstream audits.
          </div>
        </div>
      </div>
    </div>
  );
}

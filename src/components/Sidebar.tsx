/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Building2, ChevronLeft, ChevronRight, LayoutDashboard, 
  Database, AlertOctagon, Code, Shield, Users, LogOut, Check, Plus
} from 'lucide-react';
import { Tenant, RegulatoryVertical, UserRole } from '../types';

interface SidebarProps {
  tenants: Tenant[];
  activeTenantId: string | null;
  onSelectTenant: (tenantId: string) => void;
  onRegisterTenant: (name: string, contact: string, vertical: RegulatoryVertical) => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  isAiSecurityMode: boolean;
  onToggleAiSecurityMode: (isActive: boolean) => void;
  activeRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  userEmail: string;
}

export default function Sidebar({
  tenants,
  activeTenantId,
  onSelectTenant,
  onRegisterTenant,
  activeTab,
  onSelectTab,
  isAiSecurityMode,
  onToggleAiSecurityMode,
  activeRole,
  onRoleChange,
  userEmail,
}: SidebarProps) {
  const [isRetracted, setIsRetracted] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  
  // Register form state
  const [companyName, setCompanyName] = useState('');
  const [primaryContact, setPrimaryContact] = useState('');
  const [verticalSelection, setVerticalSelection] = useState<RegulatoryVertical>('Medical Device');

  const selectedTenant = tenants.find(t => t.id === activeTenantId);

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !primaryContact.trim()) return;

    onRegisterTenant(companyName.trim(), primaryContact.trim(), verticalSelection);
    setCompanyName('');
    setPrimaryContact('');
    setShowRegisterForm(false);
  };

  const navItems = [
    { id: 'executive-cockpit', label: 'Executive Cockpit', icon: LayoutDashboard },
    { id: 'audit-database', label: 'Central Audit Database', icon: Database },
    { id: 'guardrail-analyzer', label: 'Guardrail Incident Analyzer', icon: AlertOctagon },
    { id: 'rule-engine', label: 'Rule Engine Library', icon: Code },
  ];

  const roles: UserRole[] = ['Admin', 'Legal Risk Officer', 'Financial Operator', 'System Auditor'];

  return (
    <div 
      className="bg-[#0F172A] border-r border-slate-800 text-slate-300 flex flex-col justify-between transition-all duration-300 relative select-none h-screen"
      style={{ width: isRetracted ? '64px' : '240px' }}
      id="compliance-sidebar-container"
    >
      {/* Retractable Toggle Button */}
      <button
        onClick={() => setIsRetracted(!isRetracted)}
        className="absolute bottom-24 -right-3 w-6 h-6 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center text-white border border-slate-800 shadow z-50 cursor-pointer"
        title={isRetracted ? 'Expand Sidebar' : 'Retract Sidebar'}
      >
        {isRetracted ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Top Section: App info and Tenant Onboarding / Switcher */}
      <div className="flex-1 overflow-y-auto space-y-6">
        {/* App Title */}
        <div className="px-4 py-5 flex items-center gap-3 border-b border-slate-800 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white shrink-0 shadow-lg">
            <Shield size={18} className="animate-pulse" />
          </div>
          {!isRetracted && (
            <div>
              <h1 className="font-extrabold text-[#F8FAFC] tracking-tight text-sm uppercase">ComplianceAI</h1>
              <span className="text-[10px] text-slate-500 font-mono tracking-widest font-semibold uppercase block">OS GRC Portal</span>
            </div>
          )}
        </div>

        {/* Tenant Controller Area */}
        <div className="px-3">
          {/* If NO tenants are available or we want to trigger form */}
          {showRegisterForm && !isRetracted ? (
            <form onSubmit={handleRegisterSubmit} className="bg-slate-800/80 p-3.5 rounded-lg border border-slate-700/60 space-y-3 animate-in slide-in-from-top duration-200">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono text-blue-400 font-bold uppercase">Onboard Tenant</span>
                <button 
                  type="button" 
                  onClick={() => setShowRegisterForm(false)}
                  className="text-slate-400 hover:text-white text-xs"
                >
                  Cancel
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <label className="block text-[9px] text-slate-400 font-bold uppercase mb-0.5 font-mono">Company Name</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-900 border border-slate-700 rounded py-1 px-2 text-xs text-white focus:outline-none"
                    placeholder="Acura MedTech Ltd"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[9px] text-slate-400 font-bold uppercase mb-0.5 font-mono">Primary Contact</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-900 border border-slate-700 rounded py-1 px-2 text-xs text-white focus:outline-none"
                    placeholder="Jenna S."
                    value={primaryContact}
                    onChange={(e) => setPrimaryContact(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[9px] text-slate-400 font-bold uppercase mb-0.5 font-mono">Regulatory Vertical</label>
                  <select
                    className="w-full bg-slate-900 border border-slate-700 rounded py-1 px-1.5 text-xs text-slate-300 focus:outline-none"
                    value={verticalSelection}
                    onChange={(e) => setVerticalSelection(e.target.value as RegulatoryVertical)}
                  >
                    <option value="Medical Device">Medical Device (TGA)</option>
                    <option value="Telecommunications">Telecommunications (ACMA)</option>
                    <option value="Government">Government (DTA)</option>
                    <option value="Financial Services">Financial Services (APRA)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold rounded cursor-pointer"
              >
                Register & Provision
              </button>
            </form>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-slate-500 text-[10px] font-mono tracking-wider font-bold">
                {!isRetracted && <span>ACTIVE TENANT PARTITION</span>}
                {!isRetracted && (
                  <button 
                    onClick={() => setShowRegisterForm(true)}
                    className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-0.5 cursor-pointer"
                    title="Register New Tenant Organization"
                  >
                    <Plus size={12} />
                    ADD
                  </button>
                )}
              </div>

              {tenants.length === 0 ? (
                <div className="px-2 py-3 bg-red-950/20 rounded border border-red-900/30 text-center text-xs text-red-400 font-sans">
                  {!isRetracted ? 'Onboard Organization First' : '🛑'}
                  {!isRetracted && (
                    <button
                      onClick={() => setShowRegisterForm(true)}
                      className="mt-2 w-full py-1.5 bg-red-500 hover:bg-red-600 text-white font-bold text-[10px] rounded"
                    >
                      REGISTER ORG
                    </button>
                  )}
                </div>
              ) : (
                <div className="relative">
                  {isRetracted ? (
                    <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-white border border-slate-700/50 cursor-pointer" title={selectedTenant?.name}>
                      <Building2 size={18} />
                    </div>
                  ) : (
                    <div className="space-y-1 bg-slate-800/40 p-2.5 rounded-lg border border-slate-700/30">
                      <select
                        className="w-full bg-slate-900 border border-slate-700 rounded py-1 px-2 text-xs text-white outline-none cursor-pointer"
                        value={activeTenantId || ''}
                        onChange={(e) => onSelectTenant(e.target.value)}
                      >
                        {tenants.map(t => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                      
                      {selectedTenant && (
                        <div className="pt-1.5 text-[9px] font-mono text-slate-500 leading-relaxed">
                          <div>Contact: <span className="text-slate-400">{selectedTenant.primaryContact}</span></div>
                          <div>Vertical: <span className="text-blue-400 font-bold uppercase">{selectedTenant.vertical}</span></div>
                          <div>Isolation: <span className="text-emerald-400">Strict-Guarded</span></div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* PERSISTENT NAVIGATION TABS */}
        <div className="px-2 pt-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isTabActive = activeTab === item.id && !isAiSecurityMode;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onToggleAiSecurityMode(false);
                }}
                disabled={!activeTenantId}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold transition-all text-left group cursor-pointer ${
                  !activeTenantId 
                    ? 'opacity-40 cursor-not-allowed text-slate-600'
                    : isTabActive
                      ? 'bg-slate-800 text-blue-500 border-l-4 border-blue-500 rounded-r-lg rounded-l-none pl-2'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border-l-4 border-transparent pl-2'
                }`}
                title={item.label}
              >
                <Icon size={16} className={`shrink-0 transition-colors group-hover:text-white ${isTabActive ? 'text-blue-500' : 'text-slate-500'}`} />
                {!isRetracted && <span>{item.label}</span>}
              </button>
            );
          })}
        </div>

        {/* SPECIALIZED AI SECURITY TOGGLE BUTTON */}
        <div className="px-2 pt-2 border-t border-slate-800/50">
          <button
            onClick={() => {
              onToggleAiSecurityMode(!isAiSecurityMode);
            }}
            disabled={!activeTenantId}
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold transition-all text-left cursor-pointer ${
              !activeTenantId
                ? 'opacity-40 cursor-not-allowed text-slate-600'
                : isAiSecurityMode
                  ? 'bg-slate-800 text-red-500 border-l-4 border-red-500 rounded-r-lg rounded-l-none pl-2'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border-l-4 border-transparent pl-2'
            }`}
            title="AI Security Mode"
          >
            <Shield size={16} className={`shrink-0 ${isAiSecurityMode ? 'text-red-500 animate-pulse' : 'text-slate-500'}`} />
            {!isRetracted && <span>AI Security Mode</span>}
          </button>
        </div>
      </div>

      {/* Footer Area: User metadata, RBAC Role switch */}
      <div className="bg-slate-950 p-3 border-t border-slate-800 shrink-0 space-y-3" id="sidebar-footer">
        {/* Active user info */}
        {!isRetracted && (
          <div className="space-y-0.5">
            <span className="text-[9px] text-slate-500 font-mono tracking-wider block font-bold">LOGGED AUTHORIZED SIGNER</span>
            <span className="text-xs text-white truncate block font-semibold">{userEmail}</span>
          </div>
        )}

        {/* RBAC authentication dropdown selector */}
        <div>
          <div className="text-[9px] text-slate-500 font-mono tracking-wider font-bold mb-1">
            {!isRetracted ? 'AUTHENTICATED ROLE' : 'ROLE'}
          </div>
          <select
            className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 font-mono font-bold text-[10px] rounded py-1 px-1.5 focus:outline-none cursor-pointer outline-none uppercase text-center"
            value={activeRole}
            onChange={(e) => onRoleChange(e.target.value as UserRole)}
          >
            {roles.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {/* Secure session state */}
        {!isRetracted && (
          <div className="pt-1.5 flex justify-between items-center text-[8px] font-mono text-slate-600">
            <span>SESSION: SIGNED</span>
            <span>AES-256</span>
          </div>
        )}
      </div>
    </div>
  );
}

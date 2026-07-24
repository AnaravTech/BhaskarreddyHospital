import React from 'react';
import { useHospital, DEMO_PERSONAS } from '../../context/HospitalContext';
import type { ModuleType } from '../../types';
import {
  LayoutDashboard,
  UserPlus,
  Users,
  CalendarCheck,
  Stethoscope,
  Building2,
  BedDouble,
  GitCommit,
  UserCheck,
  Briefcase,
  Receipt,
  ShieldAlert,
  Siren,
  FileCheck2,
  Sparkles,
  BarChart3,
  Settings,
  ChevronDown,
  Building,
  Activity,
  LogOut,
  UserCheck2,
  Pill,
  FlaskConical,
  Scissors,
  FileCheck,
  UserCog,
} from 'lucide-react';

interface NavItem {
  id: ModuleType;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
  isHot?: boolean;
  allowedRoles?: string[]; // Allowed roles filter
}

export const Sidebar: React.FC = () => {
  const {
    activeModule,
    setActiveModule,
    activeTenant,
    activeBranch,
    setActiveBranch,
    emergencyCases,
    insuranceClaims,
    beds,
    currentUser,
    login,
    logout,
  } = useHospital();

  const occupiedBeds = beds.filter((b) => b.status === 'Occupied').length;
  const pendingClaims = insuranceClaims.filter((c) => c.status === 'Pre-Auth Submitted').length;
  const criticalEmergency = emergencyCases.filter((e) => e.status !== 'Discharged').length;

  const allNavItems: NavItem[] = [
    { id: 'dashboard', label: 'CEO Dashboard', icon: LayoutDashboard, allowedRoles: ['ceo', 'admin'] },
    { id: 'reception', label: 'Reception & Queue', icon: UserPlus, badge: 'Token', allowedRoles: ['receptionist', 'ceo', 'admin'] },
    { id: 'patients', label: 'Patient Directory', icon: Users },
    { id: 'appointments', label: 'Appointments', icon: CalendarCheck, badge: '4 Today', allowedRoles: ['receptionist', 'doctor', 'ceo', 'admin'] },
    { id: 'opd', label: 'OPD & Follow-up', icon: Stethoscope, allowedRoles: ['doctor', 'receptionist', 'ceo', 'admin'] },
    { id: 'ipd', label: 'IPD Admissions', icon: Building2, allowedRoles: ['doctor', 'billing', 'ceo', 'admin'] },
    { id: 'bed-management', label: 'Ward & Beds', icon: BedDouble, badge: `${occupiedBeds}/${beds.length}` },
    { id: 'patient-movement', label: 'Patient Movement', icon: GitCommit },
    { id: 'pharmacy', label: 'Pharmacy & e-Rx', icon: Pill, badge: 'Active', allowedRoles: ['doctor', 'billing', 'ceo', 'admin'] },
    { id: 'diagnostics', label: 'Laboratory & LIS', icon: FlaskConical, allowedRoles: ['doctor', 'emergency', 'ceo', 'admin'] },
    { id: 'operation-theatre', label: 'Operation Theatre', icon: Scissors, badge: '3 OT', allowedRoles: ['doctor', 'emergency', 'ceo', 'admin'] },
    { id: 'discharge-summary', label: 'Discharge Summary', icon: FileCheck, allowedRoles: ['doctor', 'ceo', 'admin'] },
    { id: 'doctors', label: 'Doctors & Schedule', icon: UserCheck, allowedRoles: ['receptionist', 'ceo', 'admin'] },
    { id: 'departments', label: 'Departments', icon: Briefcase },
    { id: 'billing', label: 'Billing & Cash', icon: Receipt, allowedRoles: ['billing', 'insurance', 'ceo', 'admin'] },
    { id: 'insurance', label: 'Insurance / TPA', icon: ShieldAlert, badge: pendingClaims > 0 ? pendingClaims : undefined, allowedRoles: ['insurance', 'billing', 'ceo', 'admin'] },
    { id: 'emergency', label: 'Emergency Bay', icon: Siren, badge: criticalEmergency > 0 ? criticalEmergency : undefined, isHot: true, allowedRoles: ['emergency', 'doctor', 'ceo', 'admin'] },
    { id: 'consent-forms', label: 'Consent Forms', icon: FileCheck2 },
    { id: 'housekeeping', label: 'Housekeeping', icon: Sparkles },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3, allowedRoles: ['ceo', 'billing', 'admin'] },
    { id: 'settings', label: 'Administration', icon: Settings },
  ];

  // Role-based filtering: Admin and CEO see all, specific roles see relevant modules
  const currentRole = currentUser?.role || 'ceo';
  const filteredNavItems = allNavItems.filter((item) => {
    if (currentUser?.id === 'user-admin' || currentRole === 'ceo') return true;
    if (!item.allowedRoles) return true;
    return item.allowedRoles.includes(currentRole);
  });

  return (
    <aside className="w-64 bg-slate-900/90 border-r border-slate-800/80 flex flex-col h-screen select-none z-30 shrink-0">
      {/* SaaS Branding Header */}
      <div className="p-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 p-0.5 shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Activity className="w-6 h-6 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-white text-base tracking-tight leading-tight">
                Anarav <span className="text-cyan-400">OS</span>
              </h1>
              <span className="px-1.5 py-0.5 text-[9px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-md uppercase tracking-wider">
                Enterprise
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Digital Hospital Platform</p>
          </div>
        </div>

        {/* Tenant & Branch Switcher Dropdown */}
        <div className="mt-3.5 relative">
          <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50 hover:border-slate-600 transition cursor-pointer group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 truncate">
                <Building className="w-4 h-4 text-cyan-400 shrink-0" />
                <div className="truncate">
                  <div className="text-xs font-semibold text-slate-200 truncate">{activeTenant.name}</div>
                  <div className="text-[10px] text-slate-400 truncate">{activeBranch.name}</div>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200 transition shrink-0" />
            </div>
          </div>
          <select
            value={activeBranch.id}
            onChange={(e) => {
              const selected = activeTenant.branches.find((b) => b.id === e.target.value);
              if (selected) setActiveBranch(selected);
            }}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            aria-label="Select Branch"
          >
            {activeTenant.branches.map((b) => (
              <option key={b.id} value={b.id} className="bg-slate-900 text-slate-100">
                {b.name} ({b.city})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Quick Role Persona Switcher for Presentation */}
      <div className="px-3 pt-3">
        <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
          <div className="text-[9px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1">
            <UserCog className="w-3 h-3 text-cyan-400" /> Switch Demo Role
          </div>
          <select
            value={currentUser?.id || 'user-admin'}
            onChange={(e) => {
              const found = DEMO_PERSONAS.find((p) => p.id === e.target.value);
              if (found) login(found);
            }}
            className="w-full bg-slate-900 text-slate-200 border border-slate-800 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-cyan-500 font-semibold"
          >
            {DEMO_PERSONAS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.roleTitle})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Scrollable Navigation Items */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 flex justify-between items-center">
          <span>Operating Modules</span>
          <span className="text-[9px] text-cyan-400">{filteredNavItems.length} Available</span>
        </div>

        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-600/20 to-blue-600/20 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-900/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive
                      ? 'text-cyan-400'
                      : item.isHot
                      ? 'text-rose-400 group-hover:text-rose-300'
                      : 'text-slate-400 group-hover:text-slate-300'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <span
                  className={`px-1.5 py-0.5 text-[10px] rounded-full font-semibold ${
                    item.isHot
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse'
                      : isActive
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Logged-in User Profile & Switch Role */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 space-y-2">
        {currentUser && (
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-2.5 truncate">
              <div className="relative shrink-0">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-cyan-500/40"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-slate-900" />
              </div>
              <div className="truncate">
                <div className="text-xs font-semibold text-slate-200 truncate">{currentUser.name}</div>
                <div className="text-[10px] text-cyan-400 flex items-center gap-1 truncate font-medium">
                  <UserCheck2 className="w-3 h-3 text-cyan-400 shrink-0" />
                  {currentUser.roleTitle}
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              title="Log Out & Switch Persona"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition shrink-0"
              aria-label="Log Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

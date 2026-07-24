import React from 'react';
import { useHospital } from '../../context/HospitalContext';
import type { ModuleType, UserRole } from '../../types';
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
  Building,
  Activity,
  LogOut,
  UserCheck2,
  Pill,
  FlaskConical,
  Scissors,
  FileCheck,
} from 'lucide-react';

interface NavItem {
  id: ModuleType;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
  isHot?: boolean;
  allowedRoles: UserRole[]; // Strict designation boundary
}

export const Sidebar: React.FC = () => {
  const {
    activeModule,
    setActiveModule,
    activeTenant,
    activeBranch,
    emergencyCases,
    insuranceClaims,
    beds,
    currentUser,
    logout,
  } = useHospital();

  const occupiedBeds = beds.filter((b) => b.status === 'Occupied').length;
  const pendingClaims = insuranceClaims.filter((c) => c.status === 'Pre-Auth Submitted').length;
  const criticalEmergency = emergencyCases.filter((e) => e.status !== 'Discharged').length;

  const allNavItems: NavItem[] = [
    { id: 'settings', label: 'Administration Console', icon: Settings, allowedRoles: ['admin'] },
    { id: 'dashboard', label: 'CEO Executive Dashboard', icon: LayoutDashboard, allowedRoles: ['ceo'] },
    { id: 'reception', label: 'Reception Desk & Tokens', icon: UserPlus, badge: 'Token', allowedRoles: ['receptionist'] },
    { id: 'appointments', label: 'Appointments Booking', icon: CalendarCheck, badge: '4 Today', allowedRoles: ['receptionist'] },
    { id: 'opd', label: 'OPD Consultation Desk', icon: Stethoscope, allowedRoles: ['doctor'] },
    { id: 'ipd', label: 'IPD Admissions', icon: Building2, allowedRoles: ['doctor', 'billing'] },
    { id: 'operation-theatre', label: 'Operation Theatre', icon: Scissors, badge: '3 OT', allowedRoles: ['doctor', 'emergency'] },
    { id: 'diagnostics', label: 'Laboratory & LIS Desk', icon: FlaskConical, allowedRoles: ['doctor', 'emergency'] },
    { id: 'pharmacy', label: 'Pharmacy & e-Rx', icon: Pill, badge: 'Active', allowedRoles: ['doctor', 'billing', 'admin'] },
    { id: 'discharge-summary', label: 'Discharge Summary', icon: FileCheck, allowedRoles: ['doctor'] },
    { id: 'consent-forms', label: 'Digital Consent Forms', icon: FileCheck2, allowedRoles: ['doctor', 'insurance', 'emergency'] },
    { id: 'bed-management', label: 'Ward & Bed Grid', icon: BedDouble, badge: `${occupiedBeds}/${beds.length}`, allowedRoles: ['admin', 'ceo', 'doctor', 'emergency'] },
    { id: 'patient-movement', label: 'Patient Movement', icon: GitCommit, allowedRoles: ['receptionist', 'emergency'] },
    { id: 'doctors', label: 'Doctors & Schedule', icon: UserCheck, allowedRoles: ['admin', 'ceo', 'receptionist'] },
    { id: 'departments', label: 'Clinical Departments', icon: Briefcase, allowedRoles: ['admin', 'ceo'] },
    { id: 'billing', label: 'Billing & Cashier', icon: Receipt, allowedRoles: ['billing'] },
    { id: 'insurance', label: 'Insurance / TPA Desk', icon: ShieldAlert, badge: pendingClaims > 0 ? pendingClaims : undefined, allowedRoles: ['insurance'] },
    { id: 'emergency', label: 'Emergency & Resuscitation', icon: Siren, badge: criticalEmergency > 0 ? criticalEmergency : undefined, isHot: true, allowedRoles: ['emergency'] },
    { id: 'housekeeping', label: 'Housekeeping & Cleanliness', icon: Sparkles, allowedRoles: ['admin', 'receptionist'] },
    { id: 'patients', label: 'Patient Directory', icon: Users, allowedRoles: ['admin', 'ceo', 'doctor', 'receptionist', 'billing', 'insurance', 'emergency'] },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3, allowedRoles: ['admin', 'ceo', 'billing'] },
  ];

  // Strict Designation-Based Filtering (No Overlap)
  const currentRole = currentUser?.role || 'doctor';
  const filteredNavItems = allNavItems.filter((item) => item.allowedRoles.includes(currentRole));

  return (
    <aside className="w-64 bg-slate-900/90 border-r border-slate-800/80 flex flex-col h-screen select-none z-30 shrink-0 font-sans">
      {/* Hospital Branding Header */}
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
                Bhaskar Reddy <span className="text-cyan-400">OS</span>
              </h1>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Pogathota Nellore Campus</p>
          </div>
        </div>

        {/* Branch / Campus Display */}
        <div className="mt-3.5 relative">
          <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50 flex items-center justify-between">
            <div className="flex items-center gap-2 truncate">
              <Building className="w-4 h-4 text-cyan-400 shrink-0" />
              <div className="truncate">
                <div className="text-xs font-semibold text-slate-200 truncate">{activeTenant.name}</div>
                <div className="text-[10px] text-slate-400 truncate">{activeBranch.name}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Designation-Scoped Scrollable Navigation Items */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 flex justify-between items-center">
          <span>{currentUser?.roleTitle} Workspace</span>
          <span className="text-[9px] text-cyan-400 font-mono">{filteredNavItems.length} Modules</span>
        </div>

        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-600/20 to-blue-600/20 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-900/30 font-bold'
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

      {/* Footer Logged-in User Profile & Sign Out */}
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
              title="Sign Out & Return to Login Screen"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition shrink-0"
              aria-label="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

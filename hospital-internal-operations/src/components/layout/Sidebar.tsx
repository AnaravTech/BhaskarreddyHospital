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
  Wrench,
  HeartPulse,
} from 'lucide-react';

interface NavItem {
  id: ModuleType;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
  isHot?: boolean;
  allowedRoles: UserRole[]; // Strict 12-designation boundary
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
    // ── Universal Home Dashboard (all 12 roles) ──────────────────────────────
    { id: 'home', label: 'My Dashboard', icon: LayoutDashboard, allowedRoles: ['admin','ceo','doctor','dmo','receptionist','billing','insurance','nurse','emergency','bed-manager','housekeeping-sup','maintenance'] },

    // ── System Super Admin ───────────────────────────────────────────────────
    { id: 'settings', label: 'Administration Console', icon: Settings, allowedRoles: ['admin'] },
    { id: 'doctors', label: 'Doctors & Schedule', icon: UserCheck, allowedRoles: ['admin', 'ceo', 'receptionist'] },
    { id: 'departments', label: 'Clinical Departments', icon: Briefcase, allowedRoles: ['admin', 'ceo'] },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3, allowedRoles: ['admin', 'ceo', 'billing'] },

    // ── CEO Executive ────────────────────────────────────────────────────────
    { id: 'dashboard', label: 'Executive Command Center', icon: LayoutDashboard, allowedRoles: ['ceo'] },
    { id: 'bed-management', label: 'Bed & Admission Control', icon: BedDouble, badge: `${occupiedBeds}/${beds.length}`, allowedRoles: ['bed-manager', 'admin'] },

    // ── Doctor (Consultant) ──────────────────────────────────────────────────
    { id: 'opd', label: 'Clinical OPD Workspace', icon: Stethoscope, allowedRoles: ['doctor'] },
    { id: 'ipd', label: 'Inpatient Ward Rounds', icon: Building2, allowedRoles: ['doctor', 'dmo'] },
    { id: 'operation-theatre', label: 'Operation Theatre', icon: Scissors, badge: '3 OT', allowedRoles: ['doctor', 'emergency'] },
    { id: 'diagnostics', label: 'Laboratory & LIS Desk', icon: FlaskConical, allowedRoles: ['doctor', 'dmo', 'emergency'] },
    { id: 'discharge-summary', label: 'Discharge Summary', icon: FileCheck, allowedRoles: ['doctor'] },

    // ── DMO ──────────────────────────────────────────────────────────────────
    { id: 'dmo-desk', label: 'Emergency & IP Clinical Desk', icon: HeartPulse, allowedRoles: ['dmo'] },

    // ── Reception / Front Office ─────────────────────────────────────────────
    { id: 'reception', label: 'Patient Registration & Desk', icon: UserPlus, badge: 'Token', allowedRoles: ['receptionist'] },
    { id: 'appointments', label: 'Appointment Booking', icon: CalendarCheck, badge: '4 Today', allowedRoles: ['receptionist'] },
    { id: 'patient-movement', label: 'Patient Movement', icon: GitCommit, allowedRoles: ['receptionist', 'emergency', 'bed-manager'] },

    // ── Billing & Cashier ────────────────────────────────────────────────────
    { id: 'billing', label: 'Billing & Financial Desk', icon: Receipt, allowedRoles: ['billing'] },
    { id: 'pharmacy', label: 'Pharmacy & e-Rx', icon: Pill, badge: 'Active', allowedRoles: ['doctor', 'billing'] },

    // ── Insurance / TPA ──────────────────────────────────────────────────────
    { id: 'insurance', label: 'Insurance Operations Center', icon: ShieldAlert, badge: pendingClaims > 0 ? pendingClaims : undefined, allowedRoles: ['insurance'] },

    // ── Nursing Station ───────────────────────────────────────────────────────
    { id: 'nursing-station', label: 'Nursing Station (MAR)', icon: Activity, allowedRoles: ['nurse'] },
    { id: 'consent-forms', label: 'Digital Consent Forms', icon: FileCheck2, allowedRoles: ['doctor', 'insurance', 'emergency', 'nurse'] },

    // ── Emergency ─────────────────────────────────────────────────────────────
    { id: 'emergency', label: 'Emergency Command Center', icon: Siren, badge: criticalEmergency > 0 ? criticalEmergency : undefined, isHot: true, allowedRoles: ['emergency'] },

    // ── Bed Manager ───────────────────────────────────────────────────────────
    // (bed-management listed above under CEO section — shared with admin & ceo)

    // ── Housekeeping ──────────────────────────────────────────────────────────
    { id: 'housekeeping', label: 'Facility Operations', icon: Sparkles, allowedRoles: ['housekeeping-sup'] },

    // ── Maintenance ───────────────────────────────────────────────────────────
    { id: 'maintenance', label: 'Asset & Equipment Desk', icon: Wrench, allowedRoles: ['maintenance'] },

    // ── Shared Cross-Role Modules ─────────────────────────────────────────────
    { id: 'patients', label: 'Patient 360° Directory', icon: Users, allowedRoles: ['admin', 'ceo', 'doctor', 'dmo', 'receptionist', 'billing', 'insurance', 'nurse', 'emergency', 'bed-manager'] },
    { id: 'workflow', label: 'Workflow Approvals', icon: FileCheck2, allowedRoles: ['admin', 'ceo', 'billing', 'bed-manager', 'insurance', 'doctor'] },
    { id: 'document-center', label: 'Document Center', icon: FileCheck, allowedRoles: ['admin', 'doctor', 'nurse', 'insurance', 'billing'] },
    { id: 'patient-experience', label: 'Patient Feedback & CX', icon: UserCheck2, allowedRoles: ['admin', 'ceo', 'receptionist'] },
  ];

  // Strict Designation-Based Filtering
  const currentRole = currentUser?.role || 'admin';
  const filteredNavItems = allNavItems.filter((item) => item.allowedRoles.includes(currentRole));

  return (
    <aside
      className="w-64 border-r flex flex-col h-screen select-none z-30 shrink-0 font-sans"
      style={{ backgroundColor: 'var(--t-surface)', borderColor: 'var(--t-border)', color: 'var(--t-text)' }}
    >
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
              <h1 className="font-bold text-white text-sm tracking-tight leading-tight">
                Bhaskar Reddy <span className="text-cyan-400">Operations</span>
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
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
        <div
          className="px-3 pb-2.5 text-[10px] font-extrabold uppercase tracking-widest flex justify-between items-center"
          style={{ color: 'var(--t-text-muted)' }}
        >
          <span className="truncate">{currentUser?.roleTitle} Workspace</span>
          <span className="text-[9px] font-mono shrink-0 ml-1" style={{ color: 'var(--t-primary)' }}>
            {filteredNavItems.length} Modules
          </span>
        </div>

        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all duration-200 group relative overflow-hidden"
              style={{
                backgroundColor: isActive ? 'var(--t-surface2)' : 'transparent',
                color: isActive ? 'var(--t-primary)' : 'var(--t-text-muted)',
                fontWeight: isActive ? 700 : 600,
                boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--t-surface2)';
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--t-text)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--t-text-muted)';
                }
              }}
            >
              {/* Active left accent bar */}
              {isActive && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full"
                  style={{ backgroundColor: 'var(--t-primary)' }}
                />
              )}

              <div className="flex items-center gap-3 truncate">
                <Icon
                  className="w-4.5 h-4.5 shrink-0 transition-all"
                  style={{
                    color: isActive
                      ? 'var(--t-primary)'
                      : item.isHot
                      ? '#fb7185'
                      : 'var(--t-text-dim)',
                    width: '1.1rem',
                    height: '1.1rem',
                  }}
                />
                <span className="truncate text-[12px]">{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <span
                  className="px-1.5 py-0.5 text-[10px] rounded-full font-bold shrink-0"
                  style={{
                    backgroundColor: item.isHot
                      ? 'rgba(244,63,94,0.15)'
                      : isActive
                      ? 'rgba(var(--t-primary-rgb,0,210,255),0.12)'
                      : 'var(--t-surface2)',
                    color: item.isHot ? '#fb7185' : 'var(--t-primary)',
                    border: `1px solid ${item.isHot ? 'rgba(244,63,94,0.3)' : 'var(--t-border)'}`,
                  }}
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

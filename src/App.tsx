import React, { useEffect } from 'react';
import { HospitalProvider, useHospital } from './context/HospitalContext';
import { PublicLandingPage } from './components/public/PublicLandingPage';
import { Login } from './components/auth/Login';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { CommandPalette } from './components/layout/CommandPalette';
import { AIAssistantDrawer } from './components/layout/AIAssistantDrawer';
import { NotificationCenter } from './components/layout/NotificationCenter';

// Hospital OS Module Components
import { CEODashboard } from './components/modules/CEODashboard';
import { ReceptionModule } from './components/modules/ReceptionModule';
import { PatientManagementModule } from './components/modules/PatientManagementModule';
import { AppointmentModule } from './components/modules/AppointmentModule';
import { OPDModule } from './components/modules/OPDModule';
import { IPDModule } from './components/modules/IPDModule';
import { BedManagementModule } from './components/modules/BedManagementModule';
import { PatientMovementModule } from './components/modules/PatientMovementModule';
import { DoctorsModule } from './components/modules/DoctorsModule';
import { DepartmentsModule } from './components/modules/DepartmentsModule';
import { BillingModule } from './components/modules/BillingModule';
import { InsuranceModule } from './components/modules/InsuranceModule';
import { EmergencyModule } from './components/modules/EmergencyModule';
import { ConsentFormsModule } from './components/modules/ConsentFormsModule';
import { HousekeepingModule } from './components/modules/HousekeepingModule';
import { PharmacyModule } from './components/modules/PharmacyModule';
import { ReportsModule } from './components/modules/ReportsModule';
import { SettingsModule } from './components/modules/SettingsModule';
import { X, CheckCircle2, Info, Siren, Lock, Eye, AlertCircle } from 'lucide-react';

// ─── Theme definitions (CSS variable values per theme) ──────────────────────
const THEME_CSS_VARS: Record<string, Record<string, string>> = {
  'light-classic': {
    '--app-bg': '#f8fafc',
    '--sidebar-bg': '#ffffff',
    '--sidebar-border': '#e2e8f0',
    '--header-bg': 'rgba(255,255,255,0.95)',
    '--header-border': '#e2e8f0',
    '--card-bg': '#ffffff',
    '--card-border': '#e2e8f0',
    '--input-bg': '#f1f5f9',
    '--text-primary': '#0f172a',
    '--text-secondary': '#475569',
    '--text-muted': '#94a3b8',
    '--accent': '#6366f1',
    '--accent-light': '#eef2ff',
    '--accent-text': '#4f46e5',
    '--nav-active-bg': '#eef2ff',
    '--nav-active-text': '#4338ca',
    '--nav-active-border': '#c7d2fe',
    '--nav-hover-bg': '#f1f5f9',
    '--badge-bg': '#f1f5f9',
    '--badge-border': '#e2e8f0',
    '--badge-text': '#64748b',
    '--scrollbar-track': '#f1f5f9',
    '--scrollbar-thumb': '#cbd5e1',
    '--shadow': '0 1px 3px rgba(0,0,0,0.10)',
  },
  'light-sky': {
    '--app-bg': '#f0f9ff',
    '--sidebar-bg': '#ffffff',
    '--sidebar-border': '#bae6fd',
    '--header-bg': 'rgba(255,255,255,0.95)',
    '--header-border': '#bae6fd',
    '--card-bg': '#ffffff',
    '--card-border': '#bae6fd',
    '--input-bg': '#f0f9ff',
    '--text-primary': '#0c4a6e',
    '--text-secondary': '#075985',
    '--text-muted': '#38bdf8',
    '--accent': '#0284c7',
    '--accent-light': '#e0f2fe',
    '--accent-text': '#0369a1',
    '--nav-active-bg': '#e0f2fe',
    '--nav-active-text': '#0369a1',
    '--nav-active-border': '#7dd3fc',
    '--nav-hover-bg': '#f0f9ff',
    '--badge-bg': '#e0f2fe',
    '--badge-border': '#7dd3fc',
    '--badge-text': '#0369a1',
    '--scrollbar-track': '#e0f2fe',
    '--scrollbar-thumb': '#7dd3fc',
    '--shadow': '0 1px 3px rgba(2,132,199,0.12)',
  },
  'light-emerald': {
    '--app-bg': '#f0fdf4',
    '--sidebar-bg': '#ffffff',
    '--sidebar-border': '#bbf7d0',
    '--header-bg': 'rgba(255,255,255,0.95)',
    '--header-border': '#bbf7d0',
    '--card-bg': '#ffffff',
    '--card-border': '#bbf7d0',
    '--input-bg': '#f0fdf4',
    '--text-primary': '#052e16',
    '--text-secondary': '#166534',
    '--text-muted': '#4ade80',
    '--accent': '#16a34a',
    '--accent-light': '#dcfce7',
    '--accent-text': '#15803d',
    '--nav-active-bg': '#dcfce7',
    '--nav-active-text': '#15803d',
    '--nav-active-border': '#86efac',
    '--nav-hover-bg': '#f0fdf4',
    '--badge-bg': '#dcfce7',
    '--badge-border': '#86efac',
    '--badge-text': '#15803d',
    '--scrollbar-track': '#dcfce7',
    '--scrollbar-thumb': '#86efac',
    '--shadow': '0 1px 3px rgba(22,163,74,0.12)',
  },
  'light-rose': {
    '--app-bg': '#fff1f2',
    '--sidebar-bg': '#ffffff',
    '--sidebar-border': '#fecdd3',
    '--header-bg': 'rgba(255,255,255,0.95)',
    '--header-border': '#fecdd3',
    '--card-bg': '#ffffff',
    '--card-border': '#fecdd3',
    '--input-bg': '#fff1f2',
    '--text-primary': '#4c0519',
    '--text-secondary': '#9f1239',
    '--text-muted': '#fb7185',
    '--accent': '#e11d48',
    '--accent-light': '#ffe4e6',
    '--accent-text': '#be123c',
    '--nav-active-bg': '#ffe4e6',
    '--nav-active-text': '#be123c',
    '--nav-active-border': '#fda4af',
    '--nav-hover-bg': '#fff1f2',
    '--badge-bg': '#ffe4e6',
    '--badge-border': '#fda4af',
    '--badge-text': '#be123c',
    '--scrollbar-track': '#ffe4e6',
    '--scrollbar-thumb': '#fda4af',
    '--shadow': '0 1px 3px rgba(225,29,72,0.12)',
  },
  'light-violet': {
    '--app-bg': '#faf5ff',
    '--sidebar-bg': '#ffffff',
    '--sidebar-border': '#e9d5ff',
    '--header-bg': 'rgba(255,255,255,0.95)',
    '--header-border': '#e9d5ff',
    '--card-bg': '#ffffff',
    '--card-border': '#e9d5ff',
    '--input-bg': '#faf5ff',
    '--text-primary': '#2e1065',
    '--text-secondary': '#6d28d9',
    '--text-muted': '#a78bfa',
    '--accent': '#7c3aed',
    '--accent-light': '#ede9fe',
    '--accent-text': '#6d28d9',
    '--nav-active-bg': '#ede9fe',
    '--nav-active-text': '#5b21b6',
    '--nav-active-border': '#c4b5fd',
    '--nav-hover-bg': '#faf5ff',
    '--badge-bg': '#ede9fe',
    '--badge-border': '#c4b5fd',
    '--badge-text': '#5b21b6',
    '--scrollbar-track': '#ede9fe',
    '--scrollbar-thumb': '#c4b5fd',
    '--shadow': '0 1px 3px rgba(124,58,237,0.12)',
  },
  'light-amber': {
    '--app-bg': '#fffbeb',
    '--sidebar-bg': '#ffffff',
    '--sidebar-border': '#fde68a',
    '--header-bg': 'rgba(255,255,255,0.95)',
    '--header-border': '#fde68a',
    '--card-bg': '#ffffff',
    '--card-border': '#fde68a',
    '--input-bg': '#fffbeb',
    '--text-primary': '#451a03',
    '--text-secondary': '#92400e',
    '--text-muted': '#fbbf24',
    '--accent': '#d97706',
    '--accent-light': '#fef3c7',
    '--accent-text': '#b45309',
    '--nav-active-bg': '#fef3c7',
    '--nav-active-text': '#92400e',
    '--nav-active-border': '#fcd34d',
    '--nav-hover-bg': '#fffbeb',
    '--badge-bg': '#fef3c7',
    '--badge-border': '#fcd34d',
    '--badge-text': '#92400e',
    '--scrollbar-track': '#fef3c7',
    '--scrollbar-thumb': '#fcd34d',
    '--shadow': '0 1px 3px rgba(217,119,6,0.12)',
  },
  'light-slate': {
    '--app-bg': '#f8fafc',
    '--sidebar-bg': '#f1f5f9',
    '--sidebar-border': '#cbd5e1',
    '--header-bg': 'rgba(248,250,252,0.95)',
    '--header-border': '#cbd5e1',
    '--card-bg': '#ffffff',
    '--card-border': '#e2e8f0',
    '--input-bg': '#f8fafc',
    '--text-primary': '#0f172a',
    '--text-secondary': '#334155',
    '--text-muted': '#94a3b8',
    '--accent': '#0f172a',
    '--accent-light': '#e2e8f0',
    '--accent-text': '#1e293b',
    '--nav-active-bg': '#e2e8f0',
    '--nav-active-text': '#0f172a',
    '--nav-active-border': '#94a3b8',
    '--nav-hover-bg': '#e2e8f0',
    '--badge-bg': '#e2e8f0',
    '--badge-border': '#cbd5e1',
    '--badge-text': '#475569',
    '--scrollbar-track': '#e2e8f0',
    '--scrollbar-thumb': '#94a3b8',
    '--shadow': '0 1px 3px rgba(15,23,42,0.08)',
  },
};

const MainContent: React.FC = () => {
  const hospitalCtx = useHospital();
  const {
    currentUser,
    activeModule,
    setActiveModule,
    toasts,
    removeToast,
    themeId,
    getPermission,
    getPermissionDetails,
    accessibleModules,
    appMode,
  } = hospitalCtx;

  // Apply CSS variables to :root whenever theme changes
  useEffect(() => {
    const vars = THEME_CSS_VARS[themeId] ?? THEME_CSS_VARS['light-classic'];
    const root = document.documentElement;
    Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
    // Mark document with theme id for CSS selectors
    root.setAttribute('data-theme', themeId);
  }, [themeId]);

  if (appMode === 'public-website') {
    return <PublicLandingPage />;
  }

  if (!currentUser) {
    return <Login />;
  }

  const permission = getPermission(activeModule);

  const renderActiveModule = () => {
    if (permission === 'HIDDEN') {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8 bg-slate-900/60 rounded-2xl border border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mb-4 shadow-lg shadow-rose-500/10">
            <Lock className="w-8 h-8 text-rose-400" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-100 mb-2">Module Access Restricted</h2>
          <p className="text-xs text-slate-400 max-w-md mb-6 leading-relaxed">
            Your current role (<span className="text-cyan-400 font-semibold">{currentUser.roleTitle}</span>) does not have authorization to view the <span className="text-slate-200 font-mono font-semibold uppercase">{activeModule}</span> module under the active security policy.
          </p>
          <button
            onClick={() => {
              const fallback = accessibleModules[0] ?? currentUser.defaultModule ?? 'patients';
              setActiveModule(fallback);
            }}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/20 transition active:scale-95"
          >
            Go to Accessible Module
          </button>
        </div>
      );
    }

    switch (activeModule) {
      case 'dashboard':
        return <CEODashboard />;
      case 'reception':
        return <ReceptionModule />;
      case 'patients':
        return <PatientManagementModule />;
      case 'appointments':
        return <AppointmentModule />;
      case 'opd':
        return <OPDModule />;
      case 'ipd':
        return <IPDModule />;
      case 'bed-management':
        return <BedManagementModule />;
      case 'patient-movement':
        return <PatientMovementModule />;
      case 'doctors':
        return <DoctorsModule />;
      case 'departments':
        return <DepartmentsModule />;
      case 'billing':
        return <BillingModule />;
      case 'insurance':
        return <InsuranceModule />;
      case 'emergency':
        return <EmergencyModule />;
      case 'consent-forms':
        return <ConsentFormsModule />;
      case 'housekeeping':
        return <HousekeepingModule />;
      case 'pharmacy':
        return <PharmacyModule />;
      case 'reports':
        return <ReportsModule />;
      case 'settings':
        return <SettingsModule />;
      default:
        return <CEODashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Operating Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-gradient-to-b from-slate-950 via-slate-900/60 to-slate-950 space-y-4">
          {permission === 'VIEW' && (
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-950/60 via-slate-900/80 to-blue-950/60 border border-blue-500/30 flex items-center justify-between gap-3 text-xs text-blue-200 shadow-sm animate-in fade-in duration-200">
              <div className="flex items-center gap-2.5">
                <Eye className="w-4 h-4 text-blue-400 shrink-0" />
                <span>
                  <strong className="text-blue-300">View-Only Mode:</strong> Logged in as <span className="font-semibold text-white">{currentUser.name} ({currentUser.roleTitle})</span>. You can inspect records, but creation, editing, and destructive actions are restricted.
                </span>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-blue-500/20 text-blue-300 border border-blue-500/40 uppercase tracking-wider shrink-0">
                READ ONLY
              </span>
            </div>
          )}

          {permission === 'LIMITED' && (
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-950/60 via-slate-900/80 to-amber-950/60 border border-amber-500/30 flex items-center justify-between gap-3 text-xs text-amber-200 shadow-sm animate-in fade-in duration-200">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  <strong className="text-amber-300">Limited Access Mode:</strong> {getPermissionDetails(activeModule) || `Scoped operational access for ${currentUser.roleTitle}.`}
                </span>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-wider shrink-0">
                LIMITED
              </span>
            </div>
          )}

          {renderActiveModule()}
        </main>
      </div>

      {/* Global Modals & Overlay Panels */}
      <CommandPalette />
      <AIAssistantDrawer />
      <NotificationCenter />

      {/* Floating Toast Notification Stack */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none">
        {toasts.slice(0, 3).map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto p-3.5 rounded-2xl bg-slate-900/95 border border-slate-700/80 shadow-2xl backdrop-blur-md flex items-start gap-3 animate-in slide-in-from-bottom duration-200"
          >
            {toast.type === 'warning' ? (
              <Siren className="w-5 h-5 text-rose-400 shrink-0" />
            ) : toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <Info className="w-5 h-5 text-cyan-400 shrink-0" />
            )}

            <div className="flex-1 pr-2">
              <div className="text-xs font-bold text-slate-100">{toast.title}</div>
              <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">{toast.message}</div>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-500 hover:text-slate-300 transition"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <HospitalProvider>
      <MainContent />
    </HospitalProvider>
  );
}

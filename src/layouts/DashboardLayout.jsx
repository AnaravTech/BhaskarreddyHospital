import React from 'react';
import { useHospital } from '../context/HospitalContext';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { CommandPalette } from '../components/CommandPalette';
import { AIAssistantDrawer } from '../components/AIAssistantDrawer';
import { NotificationCenter } from '../components/NotificationCenter';
import { X, CheckCircle2, Info, Siren } from 'lucide-react';

export const DashboardLayout = ({ children }) => {
  const { toasts = [], removeToast } = useHospital();

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Primary Sidebar Navigation */}
      <Sidebar />

      {/* Main Operating Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-gradient-to-b from-slate-950 via-slate-900/60 to-slate-950">
          {children}
        </main>
      </div>

      {/* Global Modals & Overlays */}
      <CommandPalette />
      <AIAssistantDrawer />
      <NotificationCenter />

      {/* Floating Toast Stack */}
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
              onClick={() => removeToast && removeToast(toast.id)}
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

export default DashboardLayout;

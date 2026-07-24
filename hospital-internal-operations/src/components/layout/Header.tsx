import React from 'react';
import { useHospital } from '../../context/HospitalContext';
import {
  Search,
  Sparkles,
  Bell,
  Siren,
  Plus,
  Command,
  BedDouble,
  UserCheck2,
  FileSpreadsheet,
  Stethoscope,
  Receipt,
  ShieldAlert,
  Activity,
  Wrench,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentUser,
    setIsCommandPaletteOpen,
    setIsAiDrawerOpen,
    isNotificationOpen,
    setIsNotificationOpen,
    setActiveModule,
    beds,
    emergencyCases,
    toasts,
    addToast,
  } = useHospital();

  const occupiedBeds = beds.filter((b) => b.status === 'Occupied').length;
  const occupancyPercentage = Math.round((occupiedBeds / beds.length) * 100);
  const criticalEmergencyCount = emergencyCases.filter((e) => e.triagePriority.startsWith('Red')).length;

  const currentRole = currentUser?.role || 'admin';

  // Dynamic Persona-tailored Header Actions
  const renderPersonaPrimaryAction = () => {
    switch (currentRole) {
      case 'admin':
        return (
          <button
            onClick={() => setActiveModule('settings')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold shadow-md transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add / Modify Staff & Tariffs</span>
          </button>
        );
      case 'ceo':
        return (
          <button
            onClick={() => addToast('P&L Financial Report', 'Generating CEO daily executive revenue statement...', 'info')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-md transition active:scale-95"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span className="hidden sm:inline">Executive P&L Statement</span>
          </button>
        );
      case 'doctor':
        return (
          <button
            onClick={() => setActiveModule('opd')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-md transition active:scale-95"
          >
            <Stethoscope className="w-4 h-4" />
            <span className="hidden sm:inline">New OPD Consultation</span>
          </button>
        );
      case 'receptionist':
        return (
          <button
            onClick={() => setActiveModule('reception')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-md transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Register Patient / Token</span>
          </button>
        );
      case 'billing':
        return (
          <button
            onClick={() => setActiveModule('billing')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md transition active:scale-95"
          >
            <Receipt className="w-4 h-4" />
            <span className="hidden sm:inline">Create Invoice / Payment</span>
          </button>
        );
      case 'insurance':
        return (
          <button
            onClick={() => setActiveModule('insurance')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md transition active:scale-95"
          >
            <ShieldAlert className="w-4 h-4" />
            <span className="hidden sm:inline">Submit Pre-Auth Claim</span>
          </button>
        );
      case 'nurse':
        return (
          <button
            onClick={() => setActiveModule('nursing-station')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-md transition active:scale-95"
          >
            <Activity className="w-4 h-4" />
            <span className="hidden sm:inline">Record MAR Medication</span>
          </button>
        );
      case 'emergency':
        return (
          <button
            onClick={() => setActiveModule('emergency')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-bold shadow-md transition active:scale-95"
          >
            <Siren className="w-4 h-4 animate-pulse" />
            <span className="hidden sm:inline">Emergency Resuscitation Triage</span>
          </button>
        );
      case 'maintenance':
        return (
          <button
            onClick={() => setActiveModule('maintenance')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold shadow-md transition active:scale-95"
          >
            <Wrench className="w-4 h-4" />
            <span className="hidden sm:inline">Biomedical Breakdown Ticket</span>
          </button>
        );
      default:
        return (
          <button
            onClick={() => setActiveModule('reception')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition"
          >
            <Plus className="w-4 h-4" />
            <span>New Action</span>
          </button>
        );
    }
  };

  return (
    <header className="h-16 bg-slate-900/80 border-b border-slate-800/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20 shrink-0 font-sans">
      {/* Persona Title Badge & Command Palette Search */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-bold">
          <UserCheck2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="text-slate-300 truncate max-w-[140px]">{currentUser?.roleTitle}</span>
        </div>

        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 transition shadow-inner group"
        >
          <div className="flex items-center gap-2.5">
            <Search className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-medium">Search Patients, Doctors, UHID, Beds...</span>
          </div>
          <div className="flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-[10px] font-mono text-slate-400">
            <Command className="w-3 h-3" />
            <span>K</span>
          </div>
        </button>
      </div>

      {/* Right Toolbar Status & Persona Primary Action */}
      <div className="flex items-center gap-3">
        {/* Bed Occupancy Telemetry Pill */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
          <BedDouble className="w-4 h-4 text-cyan-400" />
          <span className="text-slate-400">Occupancy:</span>
          <span className="font-semibold text-slate-200">{occupancyPercentage}%</span>
          <div className="w-14 h-2 bg-slate-800 rounded-full overflow-hidden ml-1">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                occupancyPercentage > 85 ? 'bg-rose-500' : occupancyPercentage > 60 ? 'bg-amber-500' : 'bg-cyan-500'
              }`}
              style={{ width: `${occupancyPercentage}%` }}
            />
          </div>
        </div>

        {/* Critical Red Emergency Alert */}
        {criticalEmergencyCount > 0 && (
          <button
            onClick={() => setActiveModule('emergency')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 text-xs font-semibold animate-pulse"
          >
            <Siren className="w-4 h-4" />
            <span>{criticalEmergencyCount} Red Triage</span>
          </button>
        )}

        {/* Dynamic Persona Action Button */}
        {renderPersonaPrimaryAction()}

        {/* AI Assistant Drawer Trigger */}
        <button
          onClick={() => setIsAiDrawerOpen(true)}
          className="relative flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-900/60 to-purple-900/60 border border-indigo-500/40 text-indigo-200 hover:text-white hover:border-indigo-400 text-xs font-semibold shadow-sm transition group"
        >
          <Sparkles className="w-4 h-4 text-purple-400 group-hover:rotate-12 transition-transform animate-pulse" />
          <span className="hidden sm:inline">Anarav AI</span>
        </button>

        {/* Notification Center */}
        <button
          onClick={() => setIsNotificationOpen(!isNotificationOpen)}
          className="relative p-2 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 transition"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          {toasts.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-500 text-[10px] font-bold text-slate-950 flex items-center justify-center">
              {toasts.length}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};

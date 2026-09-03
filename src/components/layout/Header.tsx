import React from 'react';
import { useHospital } from '../../context/HospitalContext';
import {
  Search,
  Sparkles,
  Bell,
  Siren,
  BedDouble,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    setIsCommandPaletteOpen,
    setIsAiDrawerOpen,
    isNotificationOpen,
    setIsNotificationOpen,
    setActiveModule,
    beds,
    emergencyCases,
    toasts,
    getPermission,
  } = useHospital();

  const occupiedBeds = beds.filter((b) => b.status === 'Occupied').length;
  const occupancyPercentage = Math.round((occupiedBeds / beds.length) * 100);
  const criticalEmergencyCount = emergencyCases.filter((e) => e.triagePriority.startsWith('Red')).length;

  return (
    <header className="h-16 bg-slate-900/80 border-b border-slate-800/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20 shrink-0">
      {/* Compact Clean Search Bar */}
      <div className="relative w-56 sm:w-60">
        <button
          type="button"
          onClick={() => setIsCommandPaletteOpen(true)}
          className="w-full flex items-center justify-between px-2.5 py-1 bg-slate-950/60 hover:bg-slate-950/90 border border-slate-800 hover:border-slate-700 rounded-lg transition text-slate-400 hover:text-slate-200 text-left"
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-[11px] text-slate-400 truncate">
              Search patients, doctors...
            </span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1 py-0.2 text-[9px] font-mono text-slate-500 bg-slate-900 border border-slate-800 rounded">
            <span>⌘K</span>
          </kbd>
        </button>
      </div>

      {/* Right Header Status Bar & Action Shortcuts */}
      <div className="flex items-center gap-3">
        {/* Bed Occupancy Live Pill */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs">
          <BedDouble className="w-4 h-4 text-cyan-400" />
          <span className="text-slate-400">Occupancy:</span>
          <span className="font-semibold text-slate-200">{occupancyPercentage}%</span>
          <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden ml-1">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                occupancyPercentage > 85 ? 'bg-rose-500' : occupancyPercentage > 60 ? 'bg-amber-500' : 'bg-cyan-500'
              }`}
              style={{ width: `${occupancyPercentage}%` }}
            />
          </div>
        </div>

        {/* Critical Emergency Triage Pill - only for authorized roles */}
        {criticalEmergencyCount > 0 && getPermission('emergency') !== 'HIDDEN' && (
          <button
            onClick={() => setActiveModule('emergency')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 text-xs font-semibold animate-pulse"
          >
            <Siren className="w-4 h-4" />
            <span>{criticalEmergencyCount} Red Triage</span>
          </button>
        )}

        {/* AI Copilot Entry Point */}
        <button
          onClick={() => setIsAiDrawerOpen(true)}
          className="relative flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-900/60 to-purple-900/60 border border-indigo-500/40 text-indigo-200 hover:text-white hover:border-indigo-400 text-xs font-semibold shadow-sm transition group"
        >
          <Sparkles className="w-4 h-4 text-purple-400 group-hover:rotate-12 transition-transform animate-pulse" />
          <span className="hidden sm:inline">Anarav AI</span>
          <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
        </button>

        {/* Notifications Center Toggle */}
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

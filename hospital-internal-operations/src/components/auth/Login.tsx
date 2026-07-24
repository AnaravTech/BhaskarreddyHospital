import React, { useState } from 'react';
import { useHospital, DEMO_PERSONAS } from '../../context/HospitalContext';
import type { UserSession } from '../../types';
import {
  Activity,
  ShieldCheck,
  Building,
  KeyRound,
  ArrowRight,
  Sparkles,
  Users,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export const Login: React.FC = () => {
  const { login, activeTenant } = useHospital();
  
  const [selectedPersona, setSelectedPersona] = useState<UserSession>(DEMO_PERSONAS[0]);
  const [selectedBranchId, setSelectedBranchId] = useState(activeTenant.branches[0].id);
  const [password, setPassword] = useState('••••••••••••');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);

    setTimeout(() => {
      login(selectedPersona);
      setIsAuthenticating(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans selection:bg-cyan-500 selection:text-white">
      {/* Dynamic Background Ambient Gradients */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Header Branding */}
      <header className="p-6 md:px-12 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 p-0.5 shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Activity className="w-6 h-6 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-white text-lg tracking-tight">
                Anarav <span className="text-cyan-400">Hospital OS</span>
              </h1>
              <span className="px-2 py-0.5 text-[9px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded uppercase tracking-wider">
                Enterprise v4.2
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Next-Generation Digital Health Platform</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>HIPAA & ABDM Compliant Portal</span>
        </div>
      </header>

      {/* Main Login Body */}
      <main className="flex-1 flex items-center justify-center p-6 z-10">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Value Proposition & Live Telemetry Features */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500/10 to-indigo-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Production-Grade Executive Platform</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
              Integrated Digital Operating System for Modern Healthcare Groups
            </h2>

            <p className="text-sm text-slate-400 leading-relaxed">
              Experience seamless user navigation across OPD consultations, 15-day OP validity calculations, 
              interactive bed occupancy grids, multi-payment split ledgers, and real-time AI copilot intelligence.
            </p>

            {/* Platform Feature Checklist */}
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center gap-2.5 text-xs text-slate-300 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Multi-Tenant & Multi-Branch SaaS Isolation</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-300 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>15-Day Free Consultation Return Validity Calculator</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-300 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Multi-Split Payments (Cash + UPI + Credit Card + TPA Cashless)</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-300 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Interactive Floor-wise Bed Telemetry & Immediate Patient Transfer</span>
              </div>
            </div>
          </div>

          {/* Right Login & Role Persona Selector Box */}
          <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-cyan-400" />
                Enterprise User Login
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Select a persona to test role-based navigation & permissions.
              </p>
            </div>

            {/* Persona Quick Switcher Grid */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-cyan-400" />
                1-Click Demo Persona Switcher
              </label>

              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {DEMO_PERSONAS.map((persona) => {
                  const isSelected = selectedPersona.id === persona.id;
                  return (
                    <button
                      key={persona.id}
                      type="button"
                      onClick={() => setSelectedPersona(persona)}
                      className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2.5 ${
                        isSelected
                          ? 'bg-slate-800 border-cyan-500/80 ring-1 ring-cyan-500/50 shadow-md'
                          : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/50'
                      }`}
                    >
                      <img
                        src={persona.avatar}
                        alt={persona.name}
                        className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-cyan-400/40"
                      />
                      <div className="truncate">
                        <div className="text-xs font-bold text-slate-100 truncate">{persona.name}</div>
                        <div className="text-[9px] text-cyan-400 font-semibold truncate">{persona.roleTitle}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Login Form Inputs */}
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              {/* Branch Selector */}
              <div>
                <label className="block text-slate-400 mb-1 font-medium flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-cyan-400" /> Select Hospital Campus / Branch
                </label>
                <select
                  value={selectedBranchId}
                  onChange={(e) => setSelectedBranchId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  {activeTenant.branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.city})
                    </option>
                  ))}
                </select>
              </div>

              {/* Email & Password (Pre-filled for Demo) */}
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Username / Official Email</label>
                <input
                  type="email"
                  value={selectedPersona.email}
                  readOnly
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Password / Biometric Passkey</label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                  />
                  <KeyRound className="w-4 h-4 text-slate-500 absolute right-3 top-2.5" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isAuthenticating}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-cyan-600/30 flex items-center justify-center gap-2 transition active:scale-95"
              >
                {isAuthenticating ? (
                  <span>Authenticating Role Session...</span>
                ) : (
                  <>
                    <span>Enter As {selectedPersona.name} ({selectedPersona.roleTitle})</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-[11px] text-slate-500 border-t border-slate-900 bg-slate-950/80">
        © 2026 Anarav Hospital Operating System • Enterprise Digital Healthcare Platform • Demo Ready Mode
      </footer>
    </div>
  );
};

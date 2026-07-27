import React, { useState } from 'react';
import { useHospital, DEMO_PERSONAS } from '../../context/HospitalContext';
import type { UserSession } from '../../types';
import {
  Activity,
  ShieldCheck,
  Building,
  KeyRound,
  ArrowRight,
  Users,
  CheckCircle2,
  Lock,
  Palette,
} from 'lucide-react';

const THEMES = [
  {
    id: 'modern' as const,
    name: 'Modern Premium',
    desc: 'Clean • Clinical • Light',
    dot: 'bg-blue-500',
    ring: 'ring-blue-500',
    border: 'border-blue-500/60',
    activeBg: 'bg-blue-500/8',
  },
  {
    id: 'heritage' as const,
    name: 'Authentic Healing',
    desc: 'Warm • Indian • Ivory',
    dot: 'bg-[#800020]',
    ring: 'ring-[#800020]',
    border: 'border-[#800020]/50',
    activeBg: 'bg-[#800020]/8',
  },
  {
    id: 'digital' as const,
    name: 'Future Digital',
    desc: 'Cyber • Neon • Dark',
    dot: 'bg-cyan-400 shadow-[0_0_8px_rgba(0,210,255,0.7)]',
    ring: 'ring-cyan-400',
    border: 'border-cyan-400/60',
    activeBg: 'bg-cyan-400/8',
  },
];

export const Login: React.FC = () => {
  const { login, activeTenant, activeTheme, setActiveTheme } = useHospital();

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
    <div
      className="min-h-screen flex flex-col justify-between relative overflow-hidden font-sans"
      style={{ backgroundColor: 'var(--t-bg)', color: 'var(--t-text)' }}
    >
      {/* Ambient glow blobs */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-cyan-500/8 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-600/8 rounded-full blur-[140px] pointer-events-none" />

      {/* ── TOP HEADER ── */}
      <header
        className="px-6 md:px-12 py-4 flex items-center justify-between z-10 border-b"
        style={{ backgroundColor: 'var(--t-surface)', borderColor: 'var(--t-border)' }}
      >
        {/* Logo + Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 p-0.5 shadow-lg shadow-cyan-500/20">
            <div
              className="w-full h-full rounded-[10px] flex items-center justify-center"
              style={{ backgroundColor: 'var(--t-bg)' }}
            >
              <Activity className="w-6 h-6 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <div>
            <h1 className="font-extrabold text-lg tracking-tight leading-tight" style={{ color: 'var(--t-text)' }}>
              Bhaskar Reddy <span className="text-cyan-400">Hospital</span>
            </h1>
            <p className="text-[11px] font-medium" style={{ color: 'var(--t-text-muted)' }}>
              Internal Operations Platform • Pogathota, Nellore
            </p>
          </div>
        </div>

        {/* Security badge */}
        <div
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs"
          style={{ backgroundColor: 'var(--t-surface2)', borderColor: 'var(--t-border)', color: 'var(--t-text-muted)' }}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>HIPAA &amp; ABDM Compliant</span>
        </div>
      </header>

      {/* ── MAIN LOGIN BODY ── */}
      <main className="flex-1 flex items-center justify-center p-6 z-10">
        <div className="w-full max-w-5xl space-y-6">

          {/* ── THEME SELECTOR (prominent, at the top) ── */}
          <div
            className="rounded-2xl border p-4"
            style={{ backgroundColor: 'var(--t-surface)', borderColor: 'var(--t-border)' }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Palette className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--t-text-muted)' }}>
                Select Visual Theme
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {THEMES.map((t) => {
                const isActive = activeTheme === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveTheme(t.id)}
                    className={`p-3 rounded-xl border text-left transition-all duration-300 ${
                      isActive
                        ? `${t.border} ring-1 ${t.ring} ${t.activeBg}`
                        : 'hover:opacity-80'
                    }`}
                    style={
                      isActive
                        ? {}
                        : { borderColor: 'var(--t-border)', backgroundColor: 'var(--t-surface2)' }
                    }
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${t.dot}`} />
                      <span className="text-xs font-bold" style={{ color: 'var(--t-text)' }}>
                        {t.name}
                      </span>
                    </div>
                    <p className="text-[10px]" style={{ color: 'var(--t-text-muted)' }}>
                      {t.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── LOGIN CARD + FEATURE INFO ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

            {/* Left — Feature summary */}
            <div className="lg:col-span-6 space-y-5">
              <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight" style={{ color: 'var(--t-text)' }}>
                Bhaskar Reddy Hospital<br />
                <span className="text-cyan-400">Internal Operations</span>
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--t-text-muted)' }}>
                NABH Accredited Multi-Specialty &amp; Women Healthcare. Authenticate with your official credentials to access OPD consultations, IPD telemetry, billing, emergency triage and all clinical workflows.
              </p>
              <div className="space-y-2.5 pt-1">
                {[
                  'Multi-Role Clinical Workspaces (Doctor, Nurse, Billing, Admin…)',
                  '15-Day OP Return Validity Auto-Calculator',
                  'Multi-Split Payments (Cash + UPI + Card + TPA Cashless)',
                  'Real-Time Floor-wise Bed Telemetry & Patient Transfer',
                  'Digital Consent Forms & Discharge Summary Generator',
                ].map((f) => (
                  <div key={f} className="flex items-start gap-2.5 text-xs font-medium" style={{ color: 'var(--t-text-muted)' }}>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Login box */}
            <div
              className="lg:col-span-6 rounded-3xl border p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-5"
              style={{ backgroundColor: 'var(--t-surface)', borderColor: 'var(--t-border)' }}
            >
              <div className="border-b pb-4" style={{ borderColor: 'var(--t-border)' }}>
                <h3 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--t-text)' }}>
                  <Lock className="w-5 h-5 text-cyan-400" />
                  Staff SSO Login
                </h3>
                <p className="text-xs mt-1" style={{ color: 'var(--t-text-muted)' }}>
                  Select your staff identity to load your workspace
                </p>
              </div>

              {/* Staff account selector */}
              <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--t-text-muted)' }}>
                  <Users className="w-3.5 h-3.5 text-cyan-400" />
                  Select Staff Account
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
                  {DEMO_PERSONAS.map((persona) => {
                    const isSelected = selectedPersona.id === persona.id;
                    return (
                      <button
                        key={persona.id}
                        type="button"
                        onClick={() => setSelectedPersona(persona)}
                        className="p-2.5 rounded-xl border text-left transition-all flex items-center gap-2.5"
                        style={{
                          backgroundColor: isSelected ? 'var(--t-surface2)' : 'var(--t-bg)',
                          borderColor: isSelected ? 'var(--t-primary)' : 'var(--t-border)',
                          boxShadow: isSelected ? `0 0 0 1px var(--t-primary)` : 'none',
                        }}
                      >
                        <img
                          src={persona.avatar}
                          alt={persona.name}
                          className="w-8 h-8 rounded-full object-cover shrink-0"
                          style={{ outline: isSelected ? '2px solid var(--t-primary)' : 'none' }}
                        />
                        <div className="truncate">
                          <div className="text-xs font-bold truncate" style={{ color: 'var(--t-text)' }}>
                            {persona.name}
                          </div>
                          <div className="text-[9px] font-semibold truncate" style={{ color: 'var(--t-primary)' }}>
                            {persona.roleTitle}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Login form */}
              <form onSubmit={handleLoginSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block mb-1 font-medium" style={{ color: 'var(--t-text-muted)' }}>
                    <Building className="w-3.5 h-3.5 inline mr-1 text-cyan-400" />
                    Hospital Campus / Branch
                  </label>
                  <select
                    value={selectedBranchId}
                    onChange={(e) => setSelectedBranchId(e.target.value)}
                    className="w-full rounded-xl px-3 py-2 text-xs focus:outline-none border"
                    style={{
                      backgroundColor: 'var(--t-bg)',
                      color: 'var(--t-text)',
                      borderColor: 'var(--t-border)',
                    }}
                  >
                    {activeTenant.branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.city})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1 font-medium" style={{ color: 'var(--t-text-muted)' }}>
                    Username / Official Email
                  </label>
                  <input
                    type="email"
                    value={selectedPersona.email}
                    readOnly
                    className="w-full rounded-xl px-3 py-2 text-xs font-mono border focus:outline-none"
                    style={{
                      backgroundColor: 'var(--t-bg)',
                      color: 'var(--t-text)',
                      borderColor: 'var(--t-border)',
                    }}
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium" style={{ color: 'var(--t-text-muted)' }}>
                    Password / Biometric Passkey
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-xl px-3 py-2 pr-9 text-xs font-mono border focus:outline-none"
                      style={{
                        backgroundColor: 'var(--t-bg)',
                        color: 'var(--t-text)',
                        borderColor: 'var(--t-border)',
                      }}
                    />
                    <KeyRound className="w-4 h-4 absolute right-3 top-2.5" style={{ color: 'var(--t-text-dim)' }} />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isAuthenticating}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-cyan-600/20 flex items-center justify-center gap-2 transition active:scale-95"
                >
                  {isAuthenticating ? (
                    <span>Authenticating Session...</span>
                  ) : (
                    <>
                      <span>Sign In — {selectedPersona.name}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer
        className="p-4 text-center text-[11px] border-t"
        style={{
          backgroundColor: 'var(--t-surface)',
          borderColor: 'var(--t-border)',
          color: 'var(--t-text-muted)',
        }}
      >
        © 2026 Bhaskar Reddy Hospital Internal Operations • Pogathota, Nellore • NABH Accredited
      </footer>
    </div>
  );
};

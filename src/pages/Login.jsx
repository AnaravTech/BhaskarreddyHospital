import React, { useState } from 'react';
import { useHospital, DEMO_PERSONAS } from '../context/HospitalContext';
import { Activity, ShieldCheck, Building, KeyRound, ArrowRight, Sparkles, Users, CheckCircle2, Lock, Palette, } from 'lucide-react';
// ─── Light theme visual map ───────────────────────────────────────────────────
const THEME_MAP = {
    'light-classic': {
        label: '☀️ Classic White', emoji: '☀️',
        pageBg: '#f8fafc', sidePanelBg: '#ffffff', cardBg: '#ffffff',
        border: '#e2e8f0', inputBg: '#f1f5f9',
        accentA: '#6366f1', accentB: '#4f46e5', accentC: '#818cf8', accentText: '#4f46e5',
        txt1: '#0f172a', txt2: '#475569', txt3: '#94a3b8', txtFeature: '#334155',
        glow1: 'rgba(99,102,241,0.08)', glow2: 'rgba(79,70,229,0.06)', shadow: 'rgba(99,102,241,0.18)',
        badgeBg: 'rgba(99,102,241,0.08)', badgeBorder: 'rgba(99,102,241,0.25)', badgeText: '#4f46e5',
        check: '#10b981',
    },
    'light-sky': {
        label: '🩵 Sky Blue', emoji: '🩵',
        pageBg: '#f0f9ff', sidePanelBg: '#ffffff', cardBg: '#ffffff',
        border: '#bae6fd', inputBg: '#e0f2fe',
        accentA: '#0284c7', accentB: '#0369a1', accentC: '#38bdf8', accentText: '#0369a1',
        txt1: '#0c4a6e', txt2: '#075985', txt3: '#38bdf8', txtFeature: '#0c4a6e',
        glow1: 'rgba(2,132,199,0.10)', glow2: 'rgba(56,189,248,0.08)', shadow: 'rgba(2,132,199,0.20)',
        badgeBg: 'rgba(2,132,199,0.08)', badgeBorder: 'rgba(125,211,252,0.60)', badgeText: '#0369a1',
        check: '#10b981',
    },
    'light-emerald': {
        label: '🌿 Emerald Green', emoji: '🌿',
        pageBg: '#f0fdf4', sidePanelBg: '#ffffff', cardBg: '#ffffff',
        border: '#bbf7d0', inputBg: '#dcfce7',
        accentA: '#16a34a', accentB: '#15803d', accentC: '#4ade80', accentText: '#15803d',
        txt1: '#052e16', txt2: '#166534', txt3: '#4ade80', txtFeature: '#052e16',
        glow1: 'rgba(22,163,74,0.10)', glow2: 'rgba(74,222,128,0.08)', shadow: 'rgba(22,163,74,0.20)',
        badgeBg: 'rgba(22,163,74,0.08)', badgeBorder: 'rgba(134,239,172,0.60)', badgeText: '#15803d',
        check: '#16a34a',
    },
    'light-rose': {
        label: '🌸 Rose Blush', emoji: '🌸',
        pageBg: '#fff1f2', sidePanelBg: '#ffffff', cardBg: '#ffffff',
        border: '#fecdd3', inputBg: '#ffe4e6',
        accentA: '#e11d48', accentB: '#be123c', accentC: '#fb7185', accentText: '#be123c',
        txt1: '#4c0519', txt2: '#9f1239', txt3: '#fb7185', txtFeature: '#4c0519',
        glow1: 'rgba(225,29,72,0.10)', glow2: 'rgba(251,113,133,0.08)', shadow: 'rgba(225,29,72,0.20)',
        badgeBg: 'rgba(225,29,72,0.08)', badgeBorder: 'rgba(253,164,175,0.60)', badgeText: '#be123c',
        check: '#16a34a',
    },
    'light-violet': {
        label: '💜 Violet', emoji: '💜',
        pageBg: '#faf5ff', sidePanelBg: '#ffffff', cardBg: '#ffffff',
        border: '#e9d5ff', inputBg: '#ede9fe',
        accentA: '#7c3aed', accentB: '#6d28d9', accentC: '#a78bfa', accentText: '#6d28d9',
        txt1: '#2e1065', txt2: '#4c1d95', txt3: '#a78bfa', txtFeature: '#2e1065',
        glow1: 'rgba(124,58,237,0.10)', glow2: 'rgba(167,139,250,0.08)', shadow: 'rgba(124,58,237,0.20)',
        badgeBg: 'rgba(124,58,237,0.08)', badgeBorder: 'rgba(196,181,253,0.60)', badgeText: '#5b21b6',
        check: '#16a34a',
    },
    'light-amber': {
        label: '🍯 Warm Amber', emoji: '🍯',
        pageBg: '#fffbeb', sidePanelBg: '#ffffff', cardBg: '#ffffff',
        border: '#fde68a', inputBg: '#fef3c7',
        accentA: '#d97706', accentB: '#b45309', accentC: '#fbbf24', accentText: '#b45309',
        txt1: '#451a03', txt2: '#92400e', txt3: '#fbbf24', txtFeature: '#451a03',
        glow1: 'rgba(217,119,6,0.10)', glow2: 'rgba(251,191,36,0.08)', shadow: 'rgba(217,119,6,0.20)',
        badgeBg: 'rgba(217,119,6,0.08)', badgeBorder: 'rgba(252,211,77,0.60)', badgeText: '#92400e',
        check: '#16a34a',
    },
    'light-slate': {
        label: '🩶 Steel Slate', emoji: '🩶',
        pageBg: '#f8fafc', sidePanelBg: '#f1f5f9', cardBg: '#ffffff',
        border: '#cbd5e1', inputBg: '#f1f5f9',
        accentA: '#334155', accentB: '#1e293b', accentC: '#64748b', accentText: '#1e293b',
        txt1: '#0f172a', txt2: '#334155', txt3: '#94a3b8', txtFeature: '#1e293b',
        glow1: 'rgba(51,65,85,0.06)', glow2: 'rgba(100,116,139,0.05)', shadow: 'rgba(15,23,42,0.12)',
        badgeBg: 'rgba(51,65,85,0.06)', badgeBorder: 'rgba(148,163,184,0.40)', badgeText: '#475569',
        check: '#10b981',
    },
};
const THEME_OPTIONS = [
    { id: 'light-classic', label: '☀️ Classic White' },
    { id: 'light-sky', label: '🩵 Sky Blue' },
    { id: 'light-emerald', label: '🌿 Emerald Green' },
    { id: 'light-rose', label: '🌸 Rose Blush' },
    { id: 'light-violet', label: '💜 Violet' },
    { id: 'light-amber', label: '🍯 Warm Amber' },
    { id: 'light-slate', label: '🩶 Steel Slate' },
];
export const Login = () => {
    const { login, activeTenant, themeId, setThemeId } = useHospital();
    const t = THEME_MAP[themeId] ?? THEME_MAP['light-classic'];
    const grad = `linear-gradient(135deg, ${t.accentA}, ${t.accentB}, ${t.accentC})`;
    const [persona, setPersona] = useState(DEMO_PERSONAS[0]);
    const [branchId, setBranchId] = useState(activeTenant.branches[0].id);
    const [password, setPassword] = useState('••••••••••••');
    const [loading, setLoading] = useState(false);
    const handleThemeChange = (e) => {
        const newId = e.target.value;
        try {
            localStorage.setItem('brhospital-theme', newId);
        }
        catch { /**/ }
        setThemeId(newId);
    };
    const submit = (e) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => { login(persona); setLoading(false); }, 600);
    };
    const features = [
        'Multi-Tenant & Multi-Branch SaaS Isolation',
        '15-Day Free Consultation Return Validity Calculator',
        'Multi-Split Payments — Cash, UPI, Card, TPA Cashless',
        'Interactive Floor-wise Bed Telemetry & Patient Transfer',
    ];
    return (<div style={{ minHeight: '100vh', background: t.pageBg, color: t.txt1, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif", transition: 'background 0.35s ease, color 0.35s ease' }}>

      {/* Glow blobs */}
      <div style={{ position: 'absolute', top: '-5%', left: '20%', width: 640, height: 640, borderRadius: '50%', background: t.glow1, filter: 'blur(130px)', pointerEvents: 'none', transition: 'background 0.35s' }}/>
      <div style={{ position: 'absolute', bottom: '-5%', right: '15%', width: 520, height: 520, borderRadius: '50%', background: t.glow2, filter: 'blur(130px)', pointerEvents: 'none', transition: 'background 0.35s' }}/>

      {/* Header */}
      <header style={{ padding: '18px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 10, gap: 16, flexWrap: 'wrap', borderBottom: `1px solid ${t.border}`, background: t.cardBg, boxShadow: t.shadow }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: grad, padding: 2, boxShadow: `0 0 22px ${t.shadow}`, flexShrink: 0 }}>
            <div style={{ width: '100%', height: '100%', borderRadius: 10, background: t.cardBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity style={{ width: 22, height: 22, color: t.accentText }}/>
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h1 style={{ margin: 0, fontSize: 19, fontWeight: 900, letterSpacing: '-0.02em', color: t.txt1 }}>Anarav <span style={{ color: t.accentText }}>Hospital OS</span></h1>
              <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 6, border: `1px solid ${t.accentText}`, color: t.accentText, background: t.badgeBg, textTransform: 'uppercase', letterSpacing: '0.08em' }}>v4.2</span>
            </div>
            <p style={{ margin: 0, fontSize: 11, color: t.txt3, fontWeight: 500 }}>Next-Generation Digital Health Platform</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 13px', borderRadius: 12, border: `1px solid ${t.border}`, background: t.inputBg, fontSize: 11, color: t.txt2 }}>
            <ShieldCheck style={{ width: 14, height: 14, color: t.check, flexShrink: 0 }}/>
            <span>HIPAA &amp; ABDM Compliant</span>
          </div>

          {/* Theme selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 13px', borderRadius: 12, border: `1px solid ${t.accentText}`, background: t.inputBg, boxShadow: `0 0 12px ${t.shadow}` }}>
            <Palette style={{ width: 13, height: 13, color: t.accentText, flexShrink: 0 }}/>
            <select id="theme-selector" value={themeId} onChange={handleThemeChange} style={{ background: 'transparent', border: 'none', outline: 'none', color: t.accentText, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', appearance: 'none', WebkitAppearance: 'none', paddingRight: 4 }}>
              {THEME_OPTIONS.map(opt => (<option key={opt.id} value={opt.id} style={{ background: '#ffffff', color: '#0f172a', fontWeight: 600 }}>{opt.label}</option>))}
            </select>
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{ flexShrink: 0, opacity: 0.6 }}>
              <path d="M1 1l4 4 4-4" stroke={t.accentText} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </header>

      {/* Main body */}
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 40px', position: 'relative', zIndex: 10 }}>
        <div style={{ width: '100%', maxWidth: 980, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'center' }}>

          {/* Left panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 999, background: t.badgeBg, border: `1px solid ${t.badgeBorder}`, color: t.badgeText, fontSize: 11, fontWeight: 700, width: 'fit-content' }}>
              <Sparkles style={{ width: 12, height: 12 }}/>
              Production-Grade Executive Platform
            </span>
            <h2 style={{ margin: 0, fontSize: 34, fontWeight: 900, lineHeight: 1.15, color: t.txt1 }}>Integrated Digital OS for Modern Healthcare Groups</h2>
            <p style={{ margin: 0, fontSize: 13, color: t.txt2, lineHeight: 1.75 }}>Seamless OPD consultations, bed occupancy grids, multi-split payment ledgers, and real-time AI copilot — all in one platform.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {features.map(f => (<div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <CheckCircle2 style={{ width: 16, height: 16, color: t.check, flexShrink: 0, marginTop: 1 }}/>
                  <span style={{ fontSize: 13, color: t.txtFeature, fontWeight: 500 }}>{f}</span>
                </div>))}
            </div>
          </div>

          {/* Right login card */}
          <div style={{ background: t.cardBg, border: `1px solid ${t.border}`, borderRadius: 28, padding: 36, boxShadow: `0 20px 60px rgba(0,0,0,0.08), 0 4px 20px ${t.shadow}`, display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ borderBottom: `1px solid ${t.border}`, paddingBottom: 18 }}>
              <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: t.txt1, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Lock style={{ width: 18, height: 18, color: t.accentText }}/> Enterprise User Login
              </h3>
              <p style={{ margin: '5px 0 0', fontSize: 11, color: t.txt3 }}>Select a persona to test role-based navigation &amp; permissions.</p>
            </div>

            {/* Persona grid */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, fontWeight: 800, color: t.txt2, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                <Users style={{ width: 12, height: 12, color: t.accentText }}/> 1-Click Demo Persona Switcher
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, maxHeight: 280, overflowY: 'auto', paddingRight: 2 }}>
                {DEMO_PERSONAS.map(p => {
            const sel = persona.id === p.id;
            return (<button key={p.id} type="button" onClick={() => setPersona(p)} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '9px 10px', borderRadius: 12, border: `1.5px solid ${sel ? t.accentText : t.border}`, background: sel ? t.badgeBg : 'transparent', cursor: 'pointer', transition: 'all 0.15s' }}>
                      <img src={p.avatar} alt={p.name} style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, outline: `2px solid ${t.accentText}`, outlineOffset: 1 }}/>
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: t.txt1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                        <div style={{ fontSize: 9, fontWeight: 600, color: t.accentText, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.roleTitle}</div>
                      </div>
                    </button>);
        })}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: t.txt2, marginBottom: 5 }}><Building style={{ width: 12, height: 12, color: t.accentText }}/> Campus / Branch</label>
                <select value={branchId} onChange={e => setBranchId(e.target.value)} style={{ width: '100%', padding: '9px 12px', borderRadius: 11, border: `1.5px solid ${t.border}`, background: t.inputBg, color: t.txt1, fontSize: 11, outline: 'none', cursor: 'pointer', boxSizing: 'border-box' }}>
                  {activeTenant.branches.map(b => <option key={b.id} value={b.id}>{b.name} ({b.city})</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: t.txt2, marginBottom: 5 }}>Username / Official Email</label>
                <input type="email" value={persona.email} readOnly style={{ width: '100%', padding: '9px 12px', borderRadius: 11, border: `1.5px solid ${t.border}`, background: t.inputBg, color: t.txt2, fontSize: 11, fontFamily: 'monospace', outline: 'none', boxSizing: 'border-box' }}/>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: t.txt2, marginBottom: 5 }}>Password / Biometric Passkey</label>
                <div style={{ position: 'relative' }}>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: '9px 36px 9px 12px', borderRadius: 11, border: `1.5px solid ${t.border}`, background: t.inputBg, color: t.txt1, fontSize: 11, fontFamily: 'monospace', outline: 'none', boxSizing: 'border-box' }}/>
                  <KeyRound style={{ width: 14, height: 14, color: t.txt3, position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}/>
                </div>
              </div>
              <button type="submit" disabled={loading} style={{ width: '100%', padding: '13px 16px', borderRadius: 12, border: 'none', background: grad, color: '#fff', fontWeight: 800, fontSize: 12, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: `0 6px 24px ${t.shadow}`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: loading ? 0.8 : 1, transition: 'opacity 0.2s' }}>
                {loading ? <span>Authenticating...</span> : <><span>Enter As {persona.name} ({persona.roleTitle})</span><ArrowRight style={{ width: 15, height: 15 }}/></>}
              </button>
            </form>
          </div>
        </div>
      </main>

      <footer style={{ padding: '13px 24px', textAlign: 'center', fontSize: 11, color: t.txt3, borderTop: `1px solid ${t.border}`, background: t.cardBg }}>
        © 2026 Anarav Hospital Operating System • Enterprise Digital Healthcare Platform
      </footer>
    </div>);
};

export default Login;

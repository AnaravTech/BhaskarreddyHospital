import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import type { UserSession } from '../../types';
import {
  Activity, ShieldCheck, Building, KeyRound,
  ArrowRight, Sparkles, CheckCircle2, Lock, Palette,
  Globe2, MapPin,
} from 'lucide-react';

// ─── Light theme visual map ───────────────────────────────────────────────────
const THEME_MAP: Record<string, {
  label: string; emoji: string;
  pageBg: string; sidePanelBg: string; cardBg: string;
  border: string; inputBg: string;
  accentA: string; accentB: string; accentC: string; accentText: string;
  txt1: string; txt2: string; txt3: string; txtFeature: string;
  glow1: string; glow2: string; shadow: string;
  badgeBg: string; badgeBorder: string; badgeText: string;
  check: string;
}> = {
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
  { id: 'light-sky',     label: '🩵 Sky Blue' },
  { id: 'light-emerald', label: '🌿 Emerald Green' },
  { id: 'light-rose',    label: '🌸 Rose Blush' },
  { id: 'light-violet',  label: '💜 Violet' },
  { id: 'light-amber',   label: '🍯 Warm Amber' },
  { id: 'light-slate',   label: '🩶 Steel Slate' },
];

// ─── Constant Global Profiles (CEO & Administration) ──────────────────────────
const GLOBAL_PROFILES: UserSession[] = [
  {
    id: 'user-ceo',
    name: 'Dr. Bhaskar Reddy',
    email: 'ceo@anaravhealth.com',
    role: 'ceo',
    roleTitle: 'Chief Executive Officer',
    department: 'Hospital Leadership & Governance',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
    defaultModule: 'dashboard',
  },
  {
    id: 'user-admin',
    name: 'K. Somasekhar',
    email: 'admin@anaravhealth.com',
    role: 'admin',
    roleTitle: 'Hospital Administrator',
    department: 'Administration & Operations',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    defaultModule: 'settings',
  },
];

// ─── Branch-Specific Staff Profiles ───────────────────────────────────────────
const BRANCH_STAFF_PROFILES: Record<string, UserSession[]> = {
  // Branch 1: Nellore Main Campus Staff
  'b-1': [
    {
      id: 'user-rec-b1',
      name: 'Priyanka M',
      email: 'reception.nellore@anaravhealth.com',
      role: 'receptionist',
      roleTitle: 'Receptionist & Registrar',
      department: 'Front Desk & Patient Queue',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      branchId: 'b-1',
      branchName: 'Main Multi-Specialty Hospital (Nellore Main Campus)',
      defaultModule: 'reception',
    },
    {
      id: 'user-nurse-b1',
      name: 'Sr. Lakshmi Devi',
      email: 'nurse.nellore@anaravhealth.com',
      role: 'nurse',
      roleTitle: 'Head Nurse (ICU & Wards)',
      department: 'Inpatient Care & Nursing',
      avatar: 'https://images.unsplash.com/photo-1638202993928-7267aad84c31?w=150&auto=format&fit=crop&q=80',
      branchId: 'b-1',
      branchName: 'Main Multi-Specialty Hospital (Nellore Main Campus)',
      defaultModule: 'bed-management',
    },
    {
      id: 'user-bill-b1',
      name: 'Anil Kumar',
      email: 'billing.nellore@anaravhealth.com',
      role: 'billing',
      roleTitle: 'Chief Cashier & Billing Desk',
      department: 'Billing & Cash Counter',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
      branchId: 'b-1',
      branchName: 'Main Multi-Specialty Hospital (Nellore Main Campus)',
      defaultModule: 'billing',
    },
    {
      id: 'user-ins-b1',
      name: 'Srinivas Rao',
      email: 'tpa.nellore@anaravhealth.com',
      role: 'insurance',
      roleTitle: 'TPA & Insurance Claims Officer',
      department: 'Insurance / TPA Desk',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
      branchId: 'b-1',
      branchName: 'Main Multi-Specialty Hospital (Nellore Main Campus)',
      defaultModule: 'insurance',
    },
  ],

  // Branch 2: Tirupati Branch Staff
  'b-2': [
    {
      id: 'user-rec-b2',
      name: 'Anjali Kumar',
      email: 'reception.tirupati@anaravhealth.com',
      role: 'receptionist',
      roleTitle: 'Receptionist & Token Desk',
      department: 'Front Desk & Patient Queue',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      branchId: 'b-2',
      branchName: 'Super-Specialty & Heart Institute (Tirupati Branch)',
      defaultModule: 'reception',
    },
    {
      id: 'user-nurse-b2',
      name: 'Sr. Sneha Reddy',
      email: 'nurse.tirupati@anaravhealth.com',
      role: 'nurse',
      roleTitle: 'Senior Ward & ICU Nurse',
      department: 'Inpatient Care & Nursing',
      avatar: 'https://images.unsplash.com/photo-1594824813566-88855ce78961?w=150&auto=format&fit=crop&q=80',
      branchId: 'b-2',
      branchName: 'Super-Specialty & Heart Institute (Tirupati Branch)',
      defaultModule: 'bed-management',
    },
    {
      id: 'user-bill-b2',
      name: 'Ravi Kumar',
      email: 'billing.tirupati@anaravhealth.com',
      role: 'billing',
      roleTitle: 'Billing Executive',
      department: 'Billing & Cash Counter',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      branchId: 'b-2',
      branchName: 'Super-Specialty & Heart Institute (Tirupati Branch)',
      defaultModule: 'billing',
    },
    {
      id: 'user-ins-b2',
      name: 'P. Venkat',
      email: 'tpa.tirupati@anaravhealth.com',
      role: 'insurance',
      roleTitle: 'TPA & Aarogyasri Desk',
      department: 'Insurance / TPA Desk',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      branchId: 'b-2',
      branchName: 'Super-Specialty & Heart Institute (Tirupati Branch)',
      defaultModule: 'insurance',
    },
  ],

  // Branch 3: Vijayawada Center Staff
  'b-3': [
    {
      id: 'user-rec-b3',
      name: 'Swapna Rao',
      email: 'reception.vijayawada@anaravhealth.com',
      role: 'receptionist',
      roleTitle: 'Registration & Token In-Charge',
      department: 'Front Desk & Patient Queue',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      branchId: 'b-3',
      branchName: 'Medicare & Day-Care Center (Vijayawada Center)',
      defaultModule: 'reception',
    },
    {
      id: 'user-nurse-b3',
      name: 'Sr. Mary Grace',
      email: 'nurse.vijayawada@anaravhealth.com',
      role: 'nurse',
      roleTitle: 'Day-Care Nursing Supervisor',
      department: 'Inpatient Care & Nursing',
      avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80',
      branchId: 'b-3',
      branchName: 'Medicare & Day-Care Center (Vijayawada Center)',
      defaultModule: 'bed-management',
    },
    {
      id: 'user-bill-b3',
      name: 'K. Ramesh',
      email: 'billing.vijayawada@anaravhealth.com',
      role: 'billing',
      roleTitle: 'Day-Care Billing Specialist',
      department: 'Billing & Cash Counter',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
      branchId: 'b-3',
      branchName: 'Medicare & Day-Care Center (Vijayawada Center)',
      defaultModule: 'billing',
    },
    {
      id: 'user-ins-b3',
      name: 'M. Naresh',
      email: 'tpa.vijayawada@anaravhealth.com',
      role: 'insurance',
      roleTitle: 'Insurance Desk Executive',
      department: 'Insurance / TPA Desk',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
      branchId: 'b-3',
      branchName: 'Medicare & Day-Care Center (Vijayawada Center)',
      defaultModule: 'insurance',
    },
  ],
};

export const Login: React.FC = () => {
  const { login, activeTenant, themeId, setThemeId, doctors, setActiveBranch, setAppMode } = useHospital();

  const t = THEME_MAP[themeId] ?? THEME_MAP['light-classic'];
  const grad = `linear-gradient(135deg, ${t.accentA}, ${t.accentB}, ${t.accentC})`;

  const [branchId, setBranchId] = useState(activeTenant.branches[0].id);

  // Dynamically map all active doctors from hospital registry (Only active doctor accounts appear)
  const activeDoctorsList = (doctors || []).filter((doc) => doc.status !== 'On Leave');

  const allDoctorPersonas: UserSession[] = activeDoctorsList.map((doc) => {
    const emailPrefix = doc.name.toLowerCase().replace(/^dr\.\s*/, '').replace(/[^a-z0-9]/g, '.');
    const docBranchId = doc.branchId || 'b-1';
    const branchObj = activeTenant.branches.find((b) => b.id === docBranchId);

    return {
      id: `user-doc-${doc.id}`,
      name: doc.name,
      email: doc.email || `${emailPrefix}@anaravhealth.com`,
      role: 'doctor',
      roleTitle: doc.designation || doc.specialization || 'Consultant Specialist',
      department: doc.departmentName || 'Clinical Specialties',
      branchId: docBranchId,
      branchName: doc.branchName || branchObj?.name || 'Main Multi-Specialty Hospital',
      avatar:
        doc.avatar ||
        doc.image ||
        'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
      defaultModule: 'opd',
    };
  });

  // Filter active doctors belonging strictly to the selected branch
  const branchDoctors: UserSession[] = allDoctorPersonas.filter(
    (doc) => doc.branchId === branchId || (branchId === 'b-1' && !doc.branchId)
  );

  // Staff belonging strictly to the selected branch
  const branchStaff: UserSession[] = BRANCH_STAFF_PROFILES[branchId] || BRANCH_STAFF_PROFILES['b-1'];

  // Total branch-specific profiles for the selected branch
  const branchSpecificProfiles: UserSession[] = [...branchDoctors, ...branchStaff];

  // Selected persona state (default to first doctor or CEO)
  const [persona, setPersona] = useState<UserSession>(GLOBAL_PROFILES[0]);
  const [password, setPassword] = useState('••••••••••••');
  const [loading, setLoading] = useState(false);

  // Handle branch switch
  const handleBranchChange = (newBranchId: string) => {
    setBranchId(newBranchId);
    const targetBranch = activeTenant.branches.find((b) => b.id === newBranchId);
    if (targetBranch) setActiveBranch(targetBranch);

    // If currently selected persona was a branch doctor/staff from previous branch, switch to the new branch's first doctor
    const docsInNewBranch = allDoctorPersonas.filter((d) => d.branchId === newBranchId);
    if (docsInNewBranch.length > 0) {
      setPersona(docsInNewBranch[0]);
    } else {
      setPersona(GLOBAL_PROFILES[0]);
    }
  };

  const handleSelectPersona = (p: UserSession) => {
    setPersona(p);
    if (p.branchId && p.branchId !== branchId) {
      setBranchId(p.branchId);
      const targetBranch = activeTenant.branches.find((b) => b.id === p.branchId);
      if (targetBranch) setActiveBranch(targetBranch);
    }
  };

  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = e.target.value;
    try { localStorage.setItem('brhospital-theme', newId); } catch { /**/ }
    setThemeId(newId);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const targetBranch = activeTenant.branches.find((b) => b.id === branchId) || activeTenant.branches[0];
    setActiveBranch(targetBranch);
    setTimeout(() => {
      login({ ...persona, branchId: targetBranch.id, branchName: targetBranch.name });
      setLoading(false);
    }, 600);
  };

  const selectedBranchObj = activeTenant.branches.find((b) => b.id === branchId) || activeTenant.branches[0];

  const features = [
    'Branch-Isolated OPD Schedules & Inpatient Census',
    'Real-time Touch Consent Forms & Bilingual Telemetry',
    'Unused Medicine Returns with Auto-Credit Discharge Slips',
    'Aarogyasri, Ayushman Bharat & TPA Claim Workflow',
  ];

  return (
    <div style={{ minHeight: '100vh', background: t.pageBg, color: t.txt1, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif", transition: 'background 0.35s ease, color 0.35s ease' }}>

      {/* Glow background blobs */}
      <div style={{ position: 'absolute', top: '-5%', left: '20%', width: 640, height: 640, borderRadius: '50%', background: t.glow1, filter: 'blur(130px)', pointerEvents: 'none', transition: 'background 0.35s' }} />
      <div style={{ position: 'absolute', bottom: '-5%', right: '15%', width: 520, height: 520, borderRadius: '50%', background: t.glow2, filter: 'blur(130px)', pointerEvents: 'none', transition: 'background 0.35s' }} />

      {/* Top Header */}
      <header style={{ padding: '16px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 10, gap: 16, flexWrap: 'wrap', borderBottom: `1px solid ${t.border}`, background: t.cardBg, boxShadow: t.shadow }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: grad, padding: 2, boxShadow: `0 0 22px ${t.shadow}`, flexShrink: 0 }}>
            <div style={{ width: '100%', height: '100%', borderRadius: 10, background: t.cardBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity style={{ width: 22, height: 22, color: t.accentText }} />
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h1 style={{ margin: 0, fontSize: 19, fontWeight: 900, letterSpacing: '-0.02em', color: t.txt1 }}>
                Bhaskar Reddy <span style={{ color: t.accentText }}>Hospital OS</span>
              </h1>
              <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 6, border: `1px solid ${t.accentText}`, color: t.accentText, background: t.badgeBg, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                v4.2 Enterprise
              </span>
            </div>
            <p style={{ margin: 0, fontSize: 11, color: t.txt3, fontWeight: 500 }}>Multi-Branch Digital Health Network</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 13px', borderRadius: 12, border: `1px solid ${t.border}`, background: t.inputBg, fontSize: 11, color: t.txt2 }}>
            <ShieldCheck style={{ width: 14, height: 14, color: t.check, flexShrink: 0 }} />
            <span>NABH &amp; ABDM Certified Network</span>
          </div>

          {/* Theme selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 13px', borderRadius: 12, border: `1px solid ${t.accentText}`, background: t.inputBg, boxShadow: `0 0 12px ${t.shadow}` }}>
            <Palette style={{ width: 13, height: 13, color: t.accentText, flexShrink: 0 }} />
            <select
              id="theme-selector"
              value={themeId}
              onChange={handleThemeChange}
              style={{ background: 'transparent', border: 'none', outline: 'none', color: t.accentText, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', appearance: 'none', WebkitAppearance: 'none', paddingRight: 4 }}
            >
              {THEME_OPTIONS.map(opt => (
                <option key={opt.id} value={opt.id} style={{ background: '#ffffff', color: '#0f172a', fontWeight: 600 }}>{opt.label}</option>
              ))}
            </select>
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{ flexShrink: 0, opacity: 0.6 }}>
              <path d="M1 1l4 4 4-4" stroke={t.accentText} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          {/* Return to Public Website */}
          <button
            type="button"
            onClick={() => setAppMode('public-website')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 14px',
              borderRadius: 12,
              background: t.badgeBg,
              border: `1px solid ${t.border}`,
              color: t.accentText,
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            ← Public Website
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '28px 36px', position: 'relative', zIndex: 10 }}>
        <div style={{ width: '100%', maxWidth: 1040, display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 40, alignItems: 'center' }}>

          {/* Left Hero Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 999, background: t.badgeBg, border: `1px solid ${t.badgeBorder}`, color: t.badgeText, fontSize: 11, fontWeight: 700, width: 'fit-content' }}>
              <Sparkles style={{ width: 12, height: 12 }} />
              Multi-Branch Hospital Management Suite
            </span>
            <h2 style={{ margin: 0, fontSize: 32, fontWeight: 900, lineHeight: 1.18, color: t.txt1 }}>
              Unified Clinical, Inpatient &amp; Surgical Operating System
            </h2>
            <p style={{ margin: 0, fontSize: 13, color: t.txt2, lineHeight: 1.7 }}>
              Select your hospital branch to immediately preview branch-specific consultants, nursing duty rosters, pharmacy return desks, and department billing.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              {features.map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <CheckCircle2 style={{ width: 16, height: 16, color: t.check, flexShrink: 0, marginTop: 1 }} />
                  <span style={{ fontSize: 12.5, color: t.txtFeature, fontWeight: 500 }}>{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right 1-Click Demo Login Card */}
          <div style={{ background: t.cardBg, border: `1px solid ${t.border}`, borderRadius: 24, padding: 28, boxShadow: `0 20px 60px rgba(0,0,0,0.08), 0 4px 20px ${t.shadow}`, display: 'flex', flexDirection: 'column', gap: 18 }}>
            
            {/* Header with Title & Branch Selector */}
            <div style={{ borderBottom: `1px solid ${t.border}`, paddingBottom: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: t.txt1, display: 'flex', alignItems: 'center', gap: 7 }}>
                  <Lock style={{ width: 17, height: 17, color: t.accentText }} /> 1-Click Demo Login
                </h3>
                <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: t.badgeBg, color: t.accentText, border: `1px solid ${t.badgeBorder}` }}>
                  Role-Based Access
                </span>
              </div>

              {/* Branch Selector Dropdown */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: t.txt2, marginBottom: 5 }}>
                  <Building style={{ width: 13, height: 13, color: t.accentText }} /> Selected Hospital Branch / Campus:
                </label>
                <select
                  value={branchId}
                  onChange={(e) => handleBranchChange(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 10, border: `1.5px solid ${t.border}`, background: t.inputBg, color: t.txt1, fontSize: 12, fontWeight: 700, outline: 'none', cursor: 'pointer', boxSizing: 'border-box' }}
                >
                  {activeTenant.branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      📍 {b.name} ({b.city}) {b.isMainBranch ? '— Main Campus' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Profile Grid Container (Scrollable) */}
            <div style={{ maxHeight: 310, overflowY: 'auto', paddingRight: 4, display: 'flex', flexDirection: 'column', gap: 14 }}>
              
              {/* SECTION 1: GLOBAL PROFILES (CEO & Administration - Constant Across All Branches) */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 7 }}>
                  <Globe2 style={{ width: 12, height: 12, color: t.accentText }} />
                  <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: t.txt2 }}>
                    GLOBAL PROFILES (All Branches &amp; Portals)
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {GLOBAL_PROFILES.map((p) => {
                    const sel = persona.id === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleSelectPersona(p)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 9,
                          padding: '8px 10px',
                          borderRadius: 12,
                          border: `1.5px solid ${sel ? t.accentText : t.border}`,
                          background: sel ? t.badgeBg : t.inputBg,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          textAlign: 'left',
                          position: 'relative',
                        }}
                      >
                        <img
                          src={p.avatar}
                          alt={p.name}
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: '50%',
                            objectFit: 'cover',
                            flexShrink: 0,
                            border: `2px solid ${sel ? t.accentText : '#cbd5e1'}`,
                          }}
                        />
                        <div style={{ overflow: 'hidden', flex: 1 }}>
                          <div style={{ fontSize: 11.5, fontWeight: 800, color: t.txt1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {p.name}
                          </div>
                          <div style={{ fontSize: 10, fontWeight: 700, color: t.accentText, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {p.roleTitle}
                          </div>
                          <div style={{ fontSize: 9, color: t.txt3, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {p.department}
                          </div>
                        </div>
                        {sel && (
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: t.check, position: 'absolute', top: 8, right: 8 }} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 2: SELECTED BRANCH PROFILES (Doctors & Staff belonging to chosen branch) */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <MapPin style={{ width: 12, height: 12, color: t.accentText }} />
                    <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: t.txt2 }}>
                      SELECTED BRANCH PROFILES ({selectedBranchObj.city})
                    </span>
                  </div>
                  <span style={{ fontSize: 9.5, fontWeight: 700, color: t.txt3 }}>
                    {branchSpecificProfiles.length} Profiles
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {branchSpecificProfiles.map((p) => {
                    const sel = persona.id === p.id;
                    const isDoc = p.role === 'doctor';
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleSelectPersona(p)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 9,
                          padding: '8px 10px',
                          borderRadius: 12,
                          border: `1.5px solid ${sel ? t.accentText : t.border}`,
                          background: sel ? t.badgeBg : 'transparent',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          textAlign: 'left',
                          position: 'relative',
                        }}
                      >
                        <img
                          src={p.avatar}
                          alt={p.name}
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            objectFit: 'cover',
                            flexShrink: 0,
                            border: `2px solid ${sel ? t.accentText : '#cbd5e1'}`,
                          }}
                        />
                        <div style={{ overflow: 'hidden', flex: 1 }}>
                          <div style={{ fontSize: 11, fontWeight: 800, color: t.txt1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {p.name}
                          </div>
                          <div style={{ fontSize: 9.5, fontWeight: 700, color: isDoc ? t.accentText : t.txt2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {p.roleTitle}
                          </div>
                          {p.department && (
                            <div style={{ fontSize: 8.5, color: t.txt3, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {p.department}
                            </div>
                          )}
                        </div>
                        {sel && (
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: t.check, position: 'absolute', top: 8, right: 8 }} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Authentication Action Form */}
            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 11, borderTop: `1px solid ${t.border}`, paddingTop: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: t.txt2, marginBottom: 4 }}>Official User ID</label>
                  <input
                    type="email"
                    value={persona.email}
                    readOnly
                    style={{ width: '100%', padding: '7px 10px', borderRadius: 9, border: `1.5px solid ${t.border}`, background: t.inputBg, color: t.txt2, fontSize: 10.5, fontFamily: 'monospace', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: t.txt2, marginBottom: 4 }}>Biometric / Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{ width: '100%', padding: '7px 28px 7px 10px', borderRadius: 9, border: `1.5px solid ${t.border}`, background: t.inputBg, color: t.txt1, fontSize: 10.5, fontFamily: 'monospace', outline: 'none', boxSizing: 'border-box' }}
                    />
                    <KeyRound style={{ width: 12, height: 12, color: t.txt3, position: 'absolute', right: 9, top: '50%', transform: 'translateY(-50%)' }} />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 12,
                  border: 'none',
                  background: grad,
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: 12,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: `0 6px 20px ${t.shadow}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  opacity: loading ? 0.8 : 1,
                  transition: 'opacity 0.2s',
                }}
              >
                {loading ? (
                  <span>Authenticating Session...</span>
                ) : (
                  <>
                    <span>Enter As {persona.name} ({persona.roleTitle})</span>
                    <ArrowRight style={{ width: 14, height: 14 }} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </main>

      <footer style={{ padding: '12px 24px', textAlign: 'center', fontSize: 11, color: t.txt3, borderTop: `1px solid ${t.border}`, background: t.cardBg }}>
        © 2026 Bhaskar Reddy Healthcare Group • Next-Gen Digital Health Network
      </footer>
    </div>
  );
};

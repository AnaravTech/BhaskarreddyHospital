import React, { createContext, useContext, useState, useEffect } from 'react';
import { getStoredSession, setStoredSession, removeStoredSession, getStoredTheme, setStoredTheme } from '../services/storage';

export const DEMO_PERSONAS = [
  {
    id: 'user-ceo',
    name: 'Dr. Bhaskar Reddy',
    email: 'ceo@anaravhealth.com',
    role: 'ceo',
    roleTitle: 'Chief Executive Officer',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
    defaultModule: 'dashboard',
  },
  {
    id: 'user-admin',
    name: 'Venkat Suresh',
    email: 'admin@anaravhealth.com',
    role: 'admin',
    roleTitle: 'Hospital Operations Administrator',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    defaultModule: 'settings',
  },
  {
    id: 'user-doc',
    name: 'Dr. Vikram Reddy',
    email: 'vikram.reddy@anaravhealth.com',
    role: 'doctor',
    roleTitle: 'Chief Interventional Cardiologist',
    department: 'Cardiology & Cardiac Surgery',
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80',
    defaultModule: 'opd',
  },
  {
    id: 'user-dmo',
    name: 'Dr. Praveen Kumar',
    email: 'dmo@anaravhealth.com',
    role: 'dmo',
    roleTitle: 'Duty Medical Officer (DMO)',
    department: 'General Internal Medicine',
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&auto=format&fit=crop&q=80',
    defaultModule: 'opd',
  },
  {
    id: 'user-rec',
    name: 'Priyanka M',
    email: 'reception@anaravhealth.com',
    role: 'receptionist',
    roleTitle: 'Front Desk & Patient Registrar',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    defaultModule: 'reception',
  },
  {
    id: 'user-bill',
    name: 'Anil Kumar',
    email: 'billing@anaravhealth.com',
    role: 'billing',
    roleTitle: 'Chief Cashier & Ledger Manager',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    defaultModule: 'billing',
  },
  {
    id: 'user-ins',
    name: 'Srinivas Rao',
    email: 'tpa@anaravhealth.com',
    role: 'insurance',
    roleTitle: 'TPA Cashless & Claims Officer',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    defaultModule: 'insurance',
  },
  {
    id: 'user-emg',
    name: 'Dr. Sameer Khan',
    email: 'emergency@anaravhealth.com',
    role: 'emergency',
    roleTitle: 'Trauma & Emergency Resuscitation Lead',
    department: 'Emergency & Critical Care',
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&auto=format&fit=crop&q=80',
    defaultModule: 'emergency',
  },
  {
    id: 'user-nurse',
    name: 'Sr. Lakshmi Devi',
    email: 'headnurse@anaravhealth.com',
    role: 'nurse',
    roleTitle: 'Head of Nursing Services',
    department: 'Nursing Administration',
    avatar: 'https://images.unsplash.com/photo-1638202993928-7267aad84c31?w=150&auto=format&fit=crop&q=80',
    defaultModule: 'bed-management',
  },
  {
    id: 'user-bedmgr',
    name: 'Gopal Reddy',
    email: 'bedmanager@anaravhealth.com',
    role: 'bed_manager',
    roleTitle: 'Bed & Ward Operations Manager',
    department: 'Ward & Bed Operations',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    defaultModule: 'bed-management',
  },
  {
    id: 'user-pharma',
    name: 'Rajesh Gupta',
    email: 'pharmacy@anaravhealth.com',
    role: 'pharmacist',
    roleTitle: 'Chief Pharmacist & Drug Controller',
    department: 'Pharmacy & Dispensary',
    avatar: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=150&auto=format&fit=crop&q=80',
    defaultModule: 'pharmacy',
  },
  {
    id: 'user-lab',
    name: 'Dr. Meena Sharma',
    email: 'lab@anaravhealth.com',
    role: 'lab',
    roleTitle: 'Chief Pathologist & Lab Director',
    department: 'Clinical Laboratory & Diagnostics',
    avatar: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=150&auto=format&fit=crop&q=80',
    defaultModule: 'laboratory',
  },
  {
    id: 'user-housekeeping',
    name: 'Kishan Varma',
    email: 'housekeeping@anaravhealth.com',
    role: 'housekeeping',
    roleTitle: 'Housekeeping & Sanitation In-charge',
    department: 'Hospital Sanitation',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    defaultModule: 'housekeeping',
  },
];

export const ROLE_PERMISSIONS = {
  admin: {
    full: ['dashboard', 'reception', 'patients', 'appointments', 'opd', 'ipd', 'bed-management', 'patient-movement', 'doctors', 'departments', 'billing', 'insurance', 'pharmacy', 'laboratory', 'emergency', 'consent-forms', 'housekeeping', 'reports', 'settings', 'administration'],
    view: [],
    limited: [],
    hidden: [],
  },
  ceo: {
    full: ['dashboard', 'reports'],
    view: ['reception', 'patients', 'appointments', 'opd', 'ipd', 'bed-management', 'patient-movement', 'doctors', 'departments', 'billing', 'insurance', 'pharmacy', 'laboratory', 'emergency', 'consent-forms', 'housekeeping'],
    limited: ['settings', 'administration'],
    hidden: [],
  },
  doctor: {
    full: ['opd', 'ipd', 'appointments', 'patients', 'consent-forms', 'doctors', 'patient-movement'],
    view: ['bed-management', 'laboratory', 'pharmacy'],
    limited: ['reports', 'insurance', 'departments'],
    hidden: ['dashboard', 'billing', 'housekeeping', 'settings', 'administration', 'emergency'],
  },
  dmo: {
    full: ['emergency', 'opd', 'ipd', 'patients'],
    view: ['bed-management', 'laboratory', 'pharmacy', 'consent-forms'],
    limited: ['appointments'],
    hidden: ['dashboard', 'billing', 'insurance', 'housekeeping', 'settings', 'administration', 'reports'],
  },
  receptionist: {
    full: ['reception', 'patients', 'appointments', 'billing'],
    view: ['doctors', 'bed-management', 'departments'],
    limited: ['insurance'],
    hidden: ['dashboard', 'opd', 'ipd', 'emergency', 'consent-forms', 'housekeeping', 'reports', 'settings', 'administration', 'patient-movement', 'pharmacy', 'laboratory'],
  },
  billing: {
    full: ['billing', 'insurance'],
    view: ['patients', 'ipd', 'opd', 'reception', 'pharmacy', 'laboratory'],
    limited: ['reports'],
    hidden: ['dashboard', 'appointments', 'bed-management', 'patient-movement', 'doctors', 'departments', 'emergency', 'consent-forms', 'housekeeping', 'settings', 'administration'],
  },
  insurance: {
    full: ['insurance'],
    view: ['patients', 'ipd', 'billing', 'consent-forms'],
    limited: ['reports'],
    hidden: ['dashboard', 'reception', 'appointments', 'opd', 'bed-management', 'patient-movement', 'doctors', 'departments', 'emergency', 'housekeeping', 'settings', 'administration', 'pharmacy', 'laboratory'],
  },
  emergency: {
    full: ['emergency', 'patients'],
    view: ['bed-management', 'doctors', 'opd', 'ipd'],
    limited: ['billing'],
    hidden: ['dashboard', 'reception', 'appointments', 'departments', 'insurance', 'consent-forms', 'housekeeping', 'reports', 'settings', 'administration', 'patient-movement', 'pharmacy', 'laboratory'],
  },
  nurse: {
    full: ['bed-management', 'patient-movement', 'housekeeping'],
    view: ['patients', 'ipd', 'opd', 'doctors', 'pharmacy', 'laboratory'],
    limited: ['consent-forms', 'emergency'],
    hidden: ['dashboard', 'reception', 'appointments', 'departments', 'billing', 'insurance', 'reports', 'settings', 'administration'],
  },
  bed_manager: {
    full: ['bed-management', 'patient-movement', 'housekeeping'],
    view: ['patients', 'ipd', 'emergency'],
    limited: ['reception'],
    hidden: ['dashboard', 'appointments', 'opd', 'doctors', 'departments', 'billing', 'insurance', 'consent-forms', 'reports', 'settings', 'administration', 'pharmacy', 'laboratory'],
  },
  pharmacist: {
    full: ['pharmacy', 'patients'],
    view: ['billing', 'doctors', 'opd', 'ipd'],
    limited: ['reports'],
    hidden: ['dashboard', 'reception', 'appointments', 'bed-management', 'patient-movement', 'emergency', 'consent-forms', 'housekeeping', 'settings', 'administration'],
  },
  lab: {
    full: ['laboratory', 'reports'],
    view: ['patients', 'doctors', 'opd', 'ipd'],
    limited: ['billing'],
    hidden: ['dashboard', 'reception', 'appointments', 'bed-management', 'patient-movement', 'emergency', 'consent-forms', 'housekeeping', 'settings', 'administration', 'pharmacy'],
  },
  housekeeping: {
    full: ['housekeeping'],
    view: ['bed-management'],
    limited: [],
    hidden: ['dashboard', 'reception', 'patients', 'appointments', 'opd', 'ipd', 'patient-movement', 'doctors', 'departments', 'billing', 'insurance', 'emergency', 'consent-forms', 'reports', 'settings', 'administration', 'pharmacy', 'laboratory'],
  },
};

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = getStoredSession();
    return saved || DEMO_PERSONAS[0];
  });

  const [themeId, setThemeId] = useState(() => getStoredTheme('light-classic'));

  useEffect(() => {
    if (currentUser) {
      setStoredSession(currentUser);
    } else {
      removeStoredSession();
    }
  }, [currentUser]);

  useEffect(() => {
    setStoredTheme(themeId);
  }, [themeId]);

  const login = (personaOrId) => {
    let persona = null;
    if (typeof personaOrId === 'string') {
      persona = DEMO_PERSONAS.find((p) => p.id === personaOrId || p.role === personaOrId) || DEMO_PERSONAS[0];
    } else {
      persona = personaOrId;
    }
    setCurrentUser(persona);
    return persona;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const canAccessModule = (moduleName) => {
    if (!currentUser) return false;
    const permissions = ROLE_PERMISSIONS[currentUser.role] || ROLE_PERMISSIONS.admin;
    if (permissions.hidden && permissions.hidden.includes(moduleName)) {
      return false;
    }
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        login,
        logout,
        themeId,
        setThemeId,
        canAccessModule,
        demoPersonas: DEMO_PERSONAS,
        rolePermissions: ROLE_PERMISSIONS,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};

export default AuthContext;

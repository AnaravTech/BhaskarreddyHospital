import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
  ModuleType,
  AppMode,
  HospitalTenant,
  Branch,
  Patient,
  Doctor,
  Department,
  Appointment,
  AppointmentModel,
  Bed,
  IPDAdmission,
  BillingInvoice,
  InsuranceClaim,
  EmergencyCase,
  DigitalConsentForm,
  HousekeepingTask,
  PaymentSplit,
  UserSession,
  HealthPackage,
  BlogPost,
  GalleryItem,
  Testimonial,
  ContactInquiry,
  UnverifiedUTRReport,
  PatientMovementLog,
  MovementType,
  MovementStatus,
} from '../types';
import {
  mockTenants,
  mockPatients,
  mockDoctors,
  mockDepartments,
  mockAppointments,
  mockBeds,
  mockIPDAdmissions,
  mockPatientMovementLogs,
  mockInvoices,
  mockInsuranceClaims,
  mockEmergencyCases,
  mockConsentForms,
  mockHousekeepingTasks,
  mockHealthPackages,
  mockBlogPosts,
  mockGalleryItems,
  mockTestimonials,
  mockContactInquiries,
} from '../data/mockData';

import {
  type PermissionLevel,
  getRoleModulePermission,
  getPermissionNotes,
  isModuleHidden,
  isModuleReadOnly,
  isModuleLimited,
  getAccessibleModules,
} from '../utils/rbac';

interface ToastNotification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  timestamp: string;
}

export const DEMO_PERSONAS: UserSession[] = [
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
    name: 'Dr. Ramesh Kumar',
    email: 'dmo@anaravhealth.com',
    role: 'dmo',
    roleTitle: 'Duty Medical Officer (DMO)',
    department: 'Clinical Operations & Emergency Bay',
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&auto=format&fit=crop&q=80',
    defaultModule: 'patients',
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
    id: 'user-ortho',
    name: 'Dr. Rajan Pillai',
    email: 'ortho@anaravhealth.com',
    role: 'doctor',
    roleTitle: 'Senior Orthopaedic Surgeon',
    department: 'Orthopaedics & Joint Replacement',
    avatar: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&auto=format&fit=crop&q=80',
    defaultModule: 'ipd',
  },
  {
    id: 'user-gynaec',
    name: 'Dr. Asha Nair',
    email: 'gynaec@anaravhealth.com',
    role: 'doctor',
    roleTitle: 'Consultant Gynaecologist & Obstetrician',
    department: 'Gynaecology & Maternity',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
    defaultModule: 'opd',
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
    id: 'user-pharma',
    name: 'Rajesh Gupta',
    email: 'pharmacy@anaravhealth.com',
    role: 'pharmacist',
    roleTitle: 'Chief Pharmacist & Drug Controller',
    department: 'Pharmacy & Dispensary',
    avatar: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=150&auto=format&fit=crop&q=80',
    defaultModule: 'patients',
  },
  {
    id: 'user-lab',
    name: 'Dr. Meena Sharma',
    email: 'lab@anaravhealth.com',
    role: 'lab',
    roleTitle: 'Chief Pathologist & Lab Director',
    department: 'Clinical Laboratory & Diagnostics',
    avatar: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=150&auto=format&fit=crop&q=80',
    defaultModule: 'reports',
  },
  {
    id: 'user-wardmgr',
    name: 'Anand Rao',
    email: 'bedmanager@anaravhealth.com',
    role: 'ward_manager',
    roleTitle: 'Bed Allocation & Ward Incharge',
    department: 'Central Bed Bureau & IPD Logistics',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    defaultModule: 'bed-management',
  },
  {
    id: 'user-hsk',
    name: 'Ramesh Babu',
    email: 'housekeeping@anaravhealth.com',
    role: 'housekeeping',
    roleTitle: 'Sanitation & Housekeeping Supervisor',
    department: 'Housekeeping & Environmental Services',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    defaultModule: 'housekeeping',
  },
  {
    id: 'user-maint',
    name: 'Suresh Varma',
    email: 'maintenance@anaravhealth.com',
    role: 'maintenance',
    roleTitle: 'Facility & Biomedical Maintenance Lead',
    department: 'Biomedical & Plant Engineering',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    defaultModule: 'housekeeping',
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
];

interface HospitalContextType {
  appMode: AppMode;
  setAppMode: (mode: AppMode) => void;

  currentUser: UserSession | null;
  login: (user: UserSession) => void;
  logout: () => void;

  currentPatient: Patient | null;
  patientLogin: (patient: Patient) => void;
  patientLogout: () => void;
  generateUniqueUHID: (targetDateStr?: string) => string;

  activeModule: ModuleType;
  setActiveModule: (module: ModuleType) => void;
  activeTenant: HospitalTenant;
  activeBranch: Branch;
  setActiveBranch: (branch: Branch) => void;
  
  // Search & Modals
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
  isAiDrawerOpen: boolean;
  setIsAiDrawerOpen: (open: boolean) => void;
  isNotificationOpen: boolean;
  setIsNotificationOpen: (open: boolean) => void;

  // Data Collections
  patients: Patient[];
  doctors: Doctor[];
  departments: Department[];
  appointments: Appointment[];
  beds: Bed[];
  admissions: IPDAdmission[];
  patientMovementLogs: PatientMovementLog[];
  invoices: BillingInvoice[];
  insuranceClaims: InsuranceClaim[];
  emergencyCases: EmergencyCase[];
  consentForms: DigitalConsentForm[];
  housekeepingTasks: HousekeepingTask[];

  // Website Collections
  healthPackages: HealthPackage[];
  blogPosts: BlogPost[];
  galleryItems: GalleryItem[];
  testimonials: Testimonial[];
  contactInquiries: ContactInquiry[];

  toasts: ToastNotification[];

  // Data Handlers
  addBranch: (branch: Omit<Branch, 'id'>) => void;
  addDoctor: (doctor: Omit<Doctor, 'id'> & { id?: string }) => void;
  updateDoctorStatus: (doctorId: string, status: Doctor['status']) => void;
  addPatient: (patient: Omit<Patient, 'id' | 'uhid' | 'registeredDate' | 'totalVisits' | 'status'> & { uhid?: string }) => void;
  updatePatientEHR: (patientId: string, updates: Partial<Patient>) => void;
  transferPatientBranch: (patientId: string, targetBranchId: string, notes?: string, targetDoctorName?: string) => void;
  findPatientByGlobalUHID: (query: string) => {
    found: boolean;
    patient: Patient | null;
    isCurrentBranch: boolean;
    homeBranchName: string;
    branchId: string;
  };
  addAppointment: (apt: Omit<Appointment, 'id' | 'tokenNumber'>) => void;
  reassignAppointmentDoctor: (
    appointmentId: string,
    newDoctor: Doctor,
    newModel: AppointmentModel,
    feeAdjustment: {
      newFee: number;
      differential: number;
      paymentMode?: string;
      utrNumber?: string;
    }
  ) => Appointment | null | void;
  verifyAppointmentPayment: (appointmentId: string, paymentMethod?: string, verifiedUtr?: string) => void;
  cancelAppointment: (
    appointmentId: string,
    reason: string,
    refundMode: 'Cash' | 'Online UPI Reversal' | 'Credit Voucher',
    refundAmount: number
  ) => void;
  updateBedStatus: (bedId: string, status: Bed['status'], patientId?: string, patientName?: string, patientUhid?: string, attendingDoctor?: string) => void;
  addPatientMovement: (log: Omit<PatientMovementLog, 'id' | 'timestamp'> & { timestamp?: string; id?: string }) => void;
  updatePatientMovement: (id: string, updates: Partial<PatientMovementLog>) => void;
  cancelPatientMovement: (id: string, cancelReason: string) => void;
  addInvoice: (invoice: Omit<BillingInvoice, 'id'> & { id?: string }) => void;
  processPayment: (invoiceId: string, payments: PaymentSplit[], discountAmount?: number) => void;
  addAdmission: (admission: IPDAdmission) => void;
  addEmergencyCase: (emergency: Omit<EmergencyCase, 'id' | 'caseNo'>) => void;
  updateEmergencyCase: (id: string, updates: Partial<EmergencyCase>) => void;
  addConsentForm: (formData: Omit<DigitalConsentForm, 'id' | 'signedTimestamp'>) => void;
  toggleConsentSignStatus: (formId: string, signedBy: string, witnessName?: string, signatureData?: string) => void;
  updateHousekeepingStatus: (taskId: string, status: HousekeepingTask['status']) => void;
  addContactInquiry: (inquiry: Omit<ContactInquiry, 'id' | 'date' | 'status'>) => void;
  addBlogPost: (post: Omit<BlogPost, 'id'>) => void;
  addInsuranceClaim: (claim: Omit<InsuranceClaim, 'id' | 'claimNo' | 'submittedDate'>) => void;
  updateInsuranceClaim: (id: string, updates: Partial<InsuranceClaim>) => void;

  // UTR & Accounts Reconciliation Reporting Handlers
  unverifiedUTRs: UnverifiedUTRReport[];
  addUnverifiedUTR: (record: Omit<UnverifiedUTRReport, 'id' | 'timestamp' | 'status'> & { date?: string; time?: string; timestamp?: string; status?: UnverifiedUTRReport['status'] }) => void;
  resolveUTR: (id: string, resolutionStatus?: 'Bank Reconciled' | 'Disputed' | 'Unverified / Flagged') => void;
  resetUTRs: () => void;

  addToast: (title: string, message: string, type?: ToastNotification['type']) => void;
  removeToast: (id: string) => void;
  
  // RBAC Permission Engine Helpers
  getPermission: (module?: ModuleType) => PermissionLevel;
  getPermissionDetails: (module?: ModuleType) => string;
  isReadOnly: (module?: ModuleType) => boolean;
  isLimited: (module?: ModuleType) => boolean;
  isHidden: (module?: ModuleType) => boolean;
  accessibleModules: ModuleType[];

  // Doctor-Specific Validity Engine Helper
  checkOPValidity: (
    patientIdOrDate?: string,
    doctorIdOrVisits?: string | number,
    explicitDoctorId?: string
  ) => {
    isValid: boolean;
    isNewPatient: boolean;
    daysRemaining: number;
    endDateStr: string;
    doctorName?: string;
    lastVisitDate?: string;
  };
  themeId: string;
  setThemeId: (id: string) => void;
}

const HospitalContext = createContext<HospitalContextType | undefined>(undefined);

const VALID_MODULES: ModuleType[] = [
  'dashboard',
  'reception',
  'patients',
  'appointments',
  'opd',
  'ipd',
  'bed-management',
  'patient-movement',
  'doctors',
  'departments',
  'billing',
  'insurance',
  'emergency',
  'consent-forms',
  'housekeeping',
  'reports',
  'settings',
];

const getInitialModule = (): ModuleType => {
  try {
    const hash = window.location.hash.replace(/^#\/?/, '') as ModuleType;
    if (VALID_MODULES.includes(hash)) {
      return hash;
    }
    const saved = localStorage.getItem('brhospital-active-module') as ModuleType | null;
    if (saved && VALID_MODULES.includes(saved)) {
      return saved;
    }
  } catch {}
  return 'dashboard';
};

export const HospitalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeId, setThemeId] = useState<string>(() => {
    try { return localStorage.getItem('brhospital-theme') ?? 'light-classic'; } catch { return 'light-classic'; }
  });
  // App Mode State: 'hospital-os' | 'public-website' | 'website-cms'
  const [appMode, setAppMode] = useState<AppMode>('public-website');

  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => {
    try {
      const saved = localStorage.getItem('brhospital-user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Logged-in Patient Session (Public Website Portal)
  const [currentPatient, setCurrentPatient] = useState<Patient | null>(() => {
    try {
      const saved = localStorage.getItem('brhospital_active_patient');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [activeModule, setActiveModuleState] = useState<ModuleType>(getInitialModule);
  const [activeTenant, setActiveTenant] = useState<HospitalTenant>(() => {
    try {
      const saved = localStorage.getItem('brhospital-tenant');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.branches) && parsed.branches.length > 0) return parsed;
      }
    } catch {}
    return mockTenants[0];
  });

  useEffect(() => {
    try {
      localStorage.setItem('brhospital-tenant', JSON.stringify(activeTenant));
    } catch {}
  }, [activeTenant]);

  const [activeBranch, setActiveBranchState] = useState<Branch>(() => {
    try {
      const savedId = localStorage.getItem('brhospital-branch-id');
      if (savedId) {
        const found = activeTenant.branches.find((b) => b.id === savedId);
        if (found) return found;
      }
    } catch {}
    return activeTenant.branches[0] || mockTenants[0].branches[0];
  });

  const addBranch = (branchData: Omit<Branch, 'id'>) => {
    const id = `b-${Date.now().toString().slice(-4)}`;
    const newBranch: Branch = {
      ...branchData,
      id,
    };
    setActiveTenant((prev) => ({
      ...prev,
      branches: [...prev.branches, newBranch],
    }));
    addToast('Hospital Branch Added', `${newBranch.name} (${newBranch.city}) registered into hospital network.`, 'success');
  };

  const setActiveBranch = (branch: Branch) => {
    setActiveBranchState(branch);
    try {
      localStorage.setItem('brhospital-branch-id', branch.id);
    } catch {}
  };

  const setActiveModule = (module: ModuleType) => {
    setActiveModuleState(module);
    try {
      localStorage.setItem('brhospital-active-module', module);
      if (window.location.hash.replace(/^#\/?/, '') !== module) {
        window.location.hash = `#${module}`;
      }
    } catch {}
  };

  useEffect(() => {
    if (window.location.hash.replace(/^#\/?/, '') !== activeModule) {
      window.location.hash = `#${activeModule}`;
    }

    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, '') as ModuleType;
      if (VALID_MODULES.includes(hash)) {
        setActiveModuleState(hash);
        try {
          localStorage.setItem('brhospital-active-module', hash);
        } catch {}
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [activeModule]);
  
  const getPermission = (mod?: ModuleType): PermissionLevel => {
    const target = mod ?? activeModule;
    return getRoleModulePermission(currentUser?.role, target);
  };

  const getPermissionDetails = (mod?: ModuleType): string => {
    const target = mod ?? activeModule;
    return getPermissionNotes(currentUser?.role, target);
  };

  const isReadOnly = (mod?: ModuleType): boolean => {
    const target = mod ?? activeModule;
    return isModuleReadOnly(currentUser?.role, target);
  };

  const isLimited = (mod?: ModuleType): boolean => {
    const target = mod ?? activeModule;
    return isModuleLimited(currentUser?.role, target);
  };

  const isHidden = (mod?: ModuleType): boolean => {
    const target = mod ?? activeModule;
    return isModuleHidden(currentUser?.role, target);
  };

  const accessibleModules = getAccessibleModules(currentUser?.role);

  // Auto-redirect if currentUser role cannot access activeModule
  useEffect(() => {
    if (currentUser) {
      const perm = getRoleModulePermission(currentUser.role, activeModule);
      if (perm === 'HIDDEN') {
        const allowed = getAccessibleModules(currentUser.role);
        const fallback = allowed.includes(currentUser.defaultModule)
          ? currentUser.defaultModule
          : allowed[0] ?? 'dashboard';
        setActiveModule(fallback);
      }
    }
  }, [currentUser, activeModule]);

  const [searchQuery, setSearchQuery] = useState('');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const [patients, setPatients] = useState<Patient[]>(() => {
    try {
      const saved = localStorage.getItem('brhospital-patients');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return mockPatients;
  });

  const [doctors, setDoctors] = useState<Doctor[]>(() => {
    try {
      const saved = localStorage.getItem('brhospital-doctors');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return mockDoctors;
  });

  const [departments] = useState<Department[]>(mockDepartments);

  useEffect(() => {
    try {
      localStorage.setItem('brhospital-doctors', JSON.stringify(doctors));
    } catch {}
  }, [doctors]);

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    try {
      const saved = localStorage.getItem('brhospital-appointments');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return mockAppointments;
  });

  useEffect(() => {
    try {
      localStorage.setItem('brhospital-patients', JSON.stringify(patients));
    } catch {}
  }, [patients]);

  useEffect(() => {
    try {
      localStorage.setItem('brhospital-appointments', JSON.stringify(appointments));
    } catch {}
  }, [appointments]);
  const [beds, setBeds] = useState<Bed[]>(mockBeds);
  const [admissions, setAdmissions] = useState<IPDAdmission[]>(() => {
    try {
      const saved = localStorage.getItem('brhospital-admissions');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return mockIPDAdmissions;
  });

  useEffect(() => {
    try {
      localStorage.setItem('brhospital-admissions', JSON.stringify(admissions));
    } catch {}
  }, [admissions]);

  const [patientMovementLogs, setPatientMovementLogs] = useState<PatientMovementLog[]>(() => {
    try {
      const saved = localStorage.getItem('brhospital-movement-logs');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return mockPatientMovementLogs.map((m, idx) => ({
      ...m,
      movementType: (idx === 0 ? 'Emergency-to-ICU' : 'Ward-to-Ward') as MovementType,
      status: (idx === 0 ? 'In Transit' : 'Received & Bed Handover Complete') as MovementStatus,
      transportMode: 'Stretcher' as const,
      lifeSupport: idx === 0 ? ['Portable O2 Cylinder (4L/min)', 'Cardiac Monitor'] : ['Wheelchair Assist'],
      escortNurse: idx === 0 ? 'Sr. Lakshmi Devi (Staff Nurse)' : 'Sr. Mary Grace',
      porterGDA: 'GDA Ramesh',
      handoverNotes: idx === 0 ? 'SBAR: Patient post-thrombolysis transfer to CCU for continuous hemodynamic monitoring.' : 'SBAR: Shifted for glycemic control protocol.',
      receivingNurseSign: idx === 0 ? undefined : 'Sr. Anitha (ICU Incharge)',
    }));
  });

  useEffect(() => {
    try {
      localStorage.setItem('brhospital-movement-logs', JSON.stringify(patientMovementLogs));
    } catch {}
  }, [patientMovementLogs]);

  const [invoices, setInvoices] = useState<BillingInvoice[]>(mockInvoices);
  const [insuranceClaims, setInsuranceClaims] = useState<InsuranceClaim[]>(mockInsuranceClaims);
  const [emergencyCases, setEmergencyCases] = useState<EmergencyCase[]>(() => {
    try {
      const saved = localStorage.getItem('brhospital-emergency-cases');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return mockEmergencyCases;
  });

  useEffect(() => {
    try {
      localStorage.setItem('brhospital-emergency-cases', JSON.stringify(emergencyCases));
    } catch {}
  }, [emergencyCases]);
  const [consentForms, setConsentForms] = useState<DigitalConsentForm[]>(mockConsentForms);
  const [housekeepingTasks, setHousekeepingTasks] = useState<HousekeepingTask[]>(mockHousekeepingTasks);
  
  const [healthPackages] = useState<HealthPackage[]>(mockHealthPackages);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(mockBlogPosts);
  const [galleryItems] = useState<GalleryItem[]>(mockGalleryItems);
  const [testimonials] = useState<Testimonial[]>(mockTestimonials);
  const [contactInquiries, setContactInquiries] = useState<ContactInquiry[]>(mockContactInquiries);

  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const login = (user: UserSession) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('brhospital-user', JSON.stringify(user));
    } catch {}
    const currentSaved = localStorage.getItem('brhospital-active-module') as ModuleType | null;
    const targetModule = currentSaved && VALID_MODULES.includes(currentSaved) ? currentSaved : user.defaultModule;
    setActiveModule(targetModule);
    addToast('Authenticated Successfully', `Welcome back, ${user.name} (${user.roleTitle})`, 'success');
  };

  const logout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('brhospital-user');
      localStorage.removeItem('brhospital-active-module');
      window.location.hash = '';
    } catch {}
    addToast('Logged Out', 'User session ended safely.', 'info');
  };

  const patientLogin = (patient: Patient) => {
    setCurrentPatient(patient);
    try {
      localStorage.setItem('brhospital_active_patient', JSON.stringify(patient));
    } catch {}
    addToast('Patient Authenticated', `Welcome back, ${patient.name} (UHID: ${patient.uhid})`, 'success');
  };

  const patientLogout = () => {
    setCurrentPatient(null);
    try {
      localStorage.removeItem('brhospital_active_patient');
    } catch {}
    addToast('Patient Logged Out', 'Your patient health portal session has been safely closed.', 'info');
  };

  const addToast = (title: string, message: string, type: ToastNotification['type'] = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newToast: ToastNotification = {
      id,
      title,
      message,
      type,
      timestamp: 'Just now',
    };
    setToasts((prev) => [newToast, ...prev]);

    // Automatically close notification pop-up after 5 seconds (5000ms)
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Doctor-Specific 15-Day OP Consultation Validity Calculator Engine
  // Rule: Patient ID + Doctor ID -> Valid Until
  // Returning to the same doctor within 15 days = Free Follow-up (Fee: ₹0)
  // Consulting a different doctor (even within previous doctor's 15 days) = New Consultation (Fee Applies)
  const checkOPValidity = (
    patientIdOrDate?: string,
    doctorIdOrVisits?: string | number,
    explicitDoctorId?: string
  ) => {
    if (!patientIdOrDate) {
      return {
        isValid: false,
        isNewPatient: true,
        daysRemaining: 0,
        endDateStr: 'Initial Consultation',
      };
    }

    // Try resolving as patient from database
    const patient = patients.find(
      (p) => p.id === patientIdOrDate || p.uhid === patientIdOrDate
    );

    // Resolve target doctor
    const targetDocKey = explicitDoctorId || (typeof doctorIdOrVisits === 'string' ? doctorIdOrVisits : undefined);
    const doctor = targetDocKey
      ? doctors.find((d) => d.id === targetDocKey || d.name === targetDocKey)
      : undefined;

    const resolvedDocId = doctor?.id || targetDocKey;

    if (patient) {
      // 1. Check patient's doctorValidities record for this specific doctor
      let docValidityRec = resolvedDocId && patient.doctorValidities
        ? patient.doctorValidities[resolvedDocId] || (doctor ? patient.doctorValidities[doctor.name] : undefined)
        : undefined;

      // 2. If not found in doctorValidities record, check historical completed/checked-in appointments for this patient & doctor
      if (!docValidityRec && resolvedDocId) {
        const matchingApts = appointments.filter(
          (a) =>
            (a.patientId === patient.id || a.opNumber === patient.opNumber) &&
            (a.doctorId === resolvedDocId || (doctor && a.doctorName === doctor.name))
        );

        if (matchingApts.length > 0) {
          // Sort by appointment date descending
          const sorted = [...matchingApts].sort(
            (a, b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime()
          );
          const latestApt = sorted[0];
          const validUntil = new Date(latestApt.appointmentDate);
          validUntil.setDate(validUntil.getDate() + 15);
          docValidityRec = {
            doctorId: resolvedDocId,
            doctorName: doctor?.name || latestApt.doctorName,
            lastVisitDate: latestApt.appointmentDate,
            validUntil: validUntil.toISOString().split('T')[0],
            visitsCount: matchingApts.length,
          };
        }
      }

      if (docValidityRec) {
        const validUntil = new Date(docValidityRec.validUntil);
        const today = new Date('2026-07-24');
        const diffTime = validUntil.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return {
          isValid: diffDays >= 0,
          isNewPatient: false,
          daysRemaining: Math.max(0, diffDays),
          endDateStr: docValidityRec.validUntil,
          doctorName: docValidityRec.doctorName || doctor?.name,
          lastVisitDate: docValidityRec.lastVisitDate,
        };
      }

      // If doctor specified but no previous consultation exists for this specific doctor
      if (resolvedDocId) {
        return {
          isValid: false,
          isNewPatient: true,
          daysRemaining: 0,
          endDateStr: 'New Doctor Consultation',
          doctorName: doctor?.name,
        };
      }

      // General fallback if no doctor specified
      if (!patient.lastVisitDate || patient.totalVisits === 0) {
        return {
          isValid: false,
          isNewPatient: true,
          daysRemaining: 0,
          endDateStr: 'Initial Consultation',
        };
      }

      const lastVisit = new Date(patient.lastVisitDate);
      const validUntil = new Date(lastVisit);
      validUntil.setDate(validUntil.getDate() + 15);
      const today = new Date('2026-07-24');
      const diffTime = validUntil.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return {
        isValid: diffDays >= 0,
        isNewPatient: false,
        daysRemaining: Math.max(0, diffDays),
        endDateStr: validUntil.toISOString().split('T')[0],
        lastVisitDate: patient.lastVisitDate,
      };
    }

    // Direct Date string fallback
    const totalVisits = typeof doctorIdOrVisits === 'number' ? doctorIdOrVisits : 1;
    if (totalVisits === 0) {
      return {
        isValid: false,
        isNewPatient: true,
        daysRemaining: 0,
        endDateStr: 'Initial Consultation',
      };
    }

    const lastVisit = new Date(patientIdOrDate);
    if (isNaN(lastVisit.getTime())) {
      return {
        isValid: false,
        isNewPatient: true,
        daysRemaining: 0,
        endDateStr: 'Initial Consultation',
      };
    }

    const validUntil = new Date(lastVisit);
    validUntil.setDate(validUntil.getDate() + 15);
    const today = new Date('2026-07-24');
    const diffTime = validUntil.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
      isValid: diffDays >= 0,
      isNewPatient: false,
      daysRemaining: Math.max(0, diffDays),
      endDateStr: validUntil.toISOString().split('T')[0],
      lastVisitDate: patientIdOrDate,
    };
  };

  // Unique OP / Token Number Generator Engine: Hospital Code (BRH) + YY + MM + XXXX (resets every year & month)
  const generateUniqueOPNumber = (targetDateStr = '2026-07-24'): string => {
    const d = new Date(targetDateStr);
    const year2 = String(d.getFullYear()).slice(-2); // "26"
    const month2 = String(d.getMonth() + 1).padStart(2, '0'); // "07", "08"
    const prefix = `BRH${year2}${month2}`; // e.g. "BRH2608" or "BRH2607"

    let maxSeq = 0;
    patients.forEach((p) => {
      if (p.opNumber && p.opNumber.startsWith(prefix)) {
        const seqStr = p.opNumber.slice(prefix.length);
        const num = parseInt(seqStr, 10);
        if (!isNaN(num) && num > maxSeq) {
          maxSeq = num;
        }
      }
    });

    const nextSeq = maxSeq + 1;
    const seqPadded = String(nextSeq).padStart(4, '0');
    return `${prefix}${seqPadded}`;
  };

  // Guaranteed Unique UHID Generator Engine: BRH + sequential number (e.g. BRH14566, BRH14567...)
  const generateUniqueUHID = (_targetDateStr = '2026-07-24'): string => {
    const prefix = 'BRH';

    let maxSeq = 14560;
    patients.forEach((p) => {
      if (p.uhid && p.uhid.startsWith(prefix)) {
        const seqStr = p.uhid.slice(prefix.length).replace(/[^0-9]/g, '');
        const num = parseInt(seqStr, 10);
        if (!isNaN(num) && num > maxSeq) {
          maxSeq = num;
        }
      }
    });

    let nextSeq = maxSeq + 1;
    let candidate = `${prefix}${nextSeq}`;

    // Absolute uniqueness check against entire patient database
    while (patients.some((p) => p.uhid === candidate)) {
      nextSeq++;
      candidate = `${prefix}${nextSeq}`;
    }

    return candidate;
  };

  const addDoctor = (doctorData: Omit<Doctor, 'id'> & { id?: string }) => {
    const id = doctorData.id || `doc-${Date.now().toString().slice(-4)}`;
    const newDoc: Doctor = {
      ...doctorData,
      id,
      status: doctorData.status || 'On Duty',
      rating: doctorData.rating || 4.9,
      experienceYears: doctorData.experienceYears || 10,
      image: doctorData.image || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80',
    };

    setDoctors((prev) => [newDoc, ...prev]);
    addToast(
      'Doctor Onboarded Successfully',
      `${newDoc.name} (${newDoc.specialization}) added to ${newDoc.branchName || activeBranch.name} roster.`,
      'success'
    );
  };

  const updateDoctorStatus = (doctorId: string, status: Doctor['status']) => {
    setDoctors((prev) =>
      prev.map((d) => (d.id === doctorId ? { ...d, status } : d))
    );
    const doc = doctors.find((d) => d.id === doctorId);
    addToast('Duty Status Updated', `${doc?.name || 'Doctor'} marked as "${status}"`, 'info');
  };

  const addPatient = (newPatData: Omit<Patient, 'id' | 'uhid' | 'registeredDate' | 'totalVisits' | 'status'> & { uhid?: string }) => {
    // Duplicate Aadhar Validation Check
    if (newPatData.aadharNumber && newPatData.aadharNumber.trim().length > 0) {
      const cleanAadhar = newPatData.aadharNumber.replace(/[\s-]/g, '');
      const existing = patients.find(
        (p) => p.aadharNumber && p.aadharNumber.replace(/[\s-]/g, '') === cleanAadhar
      );
      if (existing) {
        addToast(
          'Duplicate Aadhar Detected',
          `Patient "${existing.name}" (UHID: ${existing.uhid}, OP: ${existing.opNumber || 'N/A'}) already exists with Aadhar ${newPatData.aadharNumber}. Duplicate record prevented.`,
          'warning'
        );
        return;
      }
    }

    // Duplicate UHID Protection
    if (newPatData.uhid && patients.some((p) => p.uhid === newPatData.uhid)) {
      addToast('Duplicate UHID Blocked', `UHID ${newPatData.uhid} already exists in the system.`, 'error');
      return;
    }

    const todayStr = '2026-07-24';
    const id = `pat-${Date.now().toString().slice(-4)}`;
    const uhid = newPatData.uhid || generateUniqueUHID(todayStr);
    const opNumber = newPatData.opNumber || generateUniqueOPNumber(todayStr);

    const created: Patient = {
      ...newPatData,
      id,
      uhid,
      opNumber,
      registeredDate: todayStr,
      primaryBranchId: newPatData.primaryBranchId || activeBranch.id,
      registeredBranchName: newPatData.registeredBranchName || activeBranch.name,
      interBranchHistory: [
        {
          branchId: activeBranch.id,
          branchName: activeBranch.name,
          visitDate: todayStr,
          doctorName: 'Initial Registration',
          type: 'Consultation',
          notes: `Registered at ${activeBranch.name}`,
        },
      ],
      lastVisitDate: undefined,
      opValidityEndDate: undefined,
      totalVisits: 0,
      status: 'Active',
    };

    setPatients([created, ...patients]);
    addToast('Patient Registered', `UHID: ${uhid} • OP No: ${opNumber} issued for ${created.name} at ${activeBranch.name}`, 'success');
  };

  // Live EHR & Longitudinal Vitals Update Engine
  const updatePatientEHR = (patientId: string, updates: Partial<Patient>) => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === patientId || p.uhid === patientId) {
          const updatedVitals = updates.vitals ? { ...p.vitals, ...updates.vitals } : p.vitals;
          const updatedSummary = updates.currentSummary ? { ...p.currentSummary, ...updates.currentSummary } : p.currentSummary;
          const updatedTreatment = updates.treatmentPlan ? { ...p.treatmentPlan, ...updates.treatmentPlan } : p.treatmentPlan;
          const updatedMedications = updates.medications ? updates.medications : p.medications;
          const updatedLabResults = updates.labResults ? updates.labResults : p.labResults;
          const updatedHistory = updates.medicalHistory ? updates.medicalHistory : p.medicalHistory;

          return {
            ...p,
            ...updates,
            vitals: updatedVitals,
            currentSummary: updatedSummary,
            treatmentPlan: updatedTreatment,
            medications: updatedMedications,
            labResults: updatedLabResults,
            medicalHistory: updatedHistory,
            lastVisitDate: updates.lastVisitDate || p.lastVisitDate,
          };
        }
        return p;
      })
    );
  };

  // Global UHID & Cross-Branch Inter-Hospital Patient Lookup Engine
  const findPatientByGlobalUHID = (query: string) => {
    if (!query || !query.trim()) {
      return {
        found: false,
        patient: null,
        isCurrentBranch: false,
        homeBranchName: '',
        branchId: '',
      };
    }
    const clean = query.trim().toLowerCase();
    const cleanDigits = clean.replace(/[\s-]/g, '');

    const match = patients.find((p) => {
      if (p.uhid.toLowerCase() === clean) return true;
      if (p.phone === clean || p.phone.replace(/[\s-]/g, '') === cleanDigits) return true;
      if (p.aadharNumber && p.aadharNumber.replace(/[\s-]/g, '') === cleanDigits) return true;
      if (p.name.toLowerCase() === clean) return true;
      return false;
    });

    if (!match) {
      return {
        found: false,
        patient: null,
        isCurrentBranch: false,
        homeBranchName: '',
        branchId: '',
      };
    }

    const patientBranchId = match.primaryBranchId || 'b-1';
    const isCurrentBranch = patientBranchId === activeBranch.id;
    const branchObj = activeTenant.branches.find((b) => b.id === patientBranchId);
    const homeBranchName = match.registeredBranchName || branchObj?.name || 'Main Hospital';

    return {
      found: true,
      patient: match,
      isCurrentBranch,
      homeBranchName,
      branchId: patientBranchId,
    };
  };

  // Inter-Hospital Cross-Branch Patient Transfer / Referral Engine
  const transferPatientBranch = (
    patientId: string,
    targetBranchId: string,
    notes = '',
    targetDoctorName = ''
  ) => {
    const targetBranch = activeTenant.branches.find((b) => b.id === targetBranchId);
    if (!targetBranch) {
      addToast('Transfer Failed', 'Target branch not recognized.', 'error');
      return;
    }

    const todayStr = '2026-07-24';
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === patientId) {
          const updatedHistory = [
            ...(p.interBranchHistory || []),
            {
              branchId: targetBranch.id,
              branchName: targetBranch.name,
              visitDate: todayStr,
              doctorName: targetDoctorName || 'Receiving Medical Officer',
              type: 'Transfer' as const,
              notes: notes || `Patient transferred from ${p.registeredBranchName || activeBranch.name} to ${targetBranch.name}.`,
            },
          ];
          return {
            ...p,
            primaryBranchId: targetBranch.id,
            interBranchHistory: updatedHistory,
          };
        }
        return p;
      })
    );

    addToast(
      'Inter-Hospital Transfer Completed',
      `Patient transferred to ${targetBranch.name}. Universal UHID and complete EHR dossier preserved.`,
      'success'
    );
  };

  // Department Code Resolver
  const getDepartmentPrefix = (deptName = ''): string => {
    const clean = deptName.toLowerCase();
    if (clean.includes('cardio')) return 'CARD';
    if (clean.includes('ortho')) return 'ORTHO';
    if (clean.includes('neuro')) return 'NEUR';
    if (clean.includes('gyn') || clean.includes('obste') || clean.includes('women')) return 'OBGY';
    if (clean.includes('emerg') || clean.includes('trauma')) return 'EMRG';
    if (clean.includes('pedia') || clean.includes('child')) return 'PEDIA';
    if (clean.includes('derma')) return 'DERMA';
    if (clean.includes('ent')) return 'ENT';
    if (clean.includes('eye') || clean.includes('ophth')) return 'OPHTH';
    if (clean.includes('gen') || clean.includes('intern')) return 'GENMED';
    return deptName.replace(/[^A-Za-z]/g, '').slice(0, 4).toUpperCase() || 'OPD';
  };

  // Daily Continuous Queue Token Number Generator Engine
  const generateDailyDepartmentToken = (deptName: string, targetDateStr = '2026-07-24'): string => {
    const deptPrefix = getDepartmentPrefix(deptName);

    let maxSeq = 0;
    appointments.forEach((a) => {
      if (a.appointmentDate === targetDateStr && a.tokenNumber) {
        const match = a.tokenNumber.match(/(\d+)$/);
        if (match) {
          const num = parseInt(match[1], 10);
          if (!isNaN(num) && num > maxSeq) {
            maxSeq = num;
          }
        }
      }
    });

    if (maxSeq === 0) {
      maxSeq = appointments.length;
    }

    let nextSeq = maxSeq + 1;
    let candidate = `${deptPrefix}-${String(nextSeq).padStart(2, '0')}`;

    while (appointments.some((a) => a.appointmentDate === targetDateStr && a.tokenNumber === candidate)) {
      nextSeq++;
      candidate = `${deptPrefix}-${String(nextSeq).padStart(2, '0')}`;
    }

    return candidate;
  };

  const addAppointment = (aptData: Omit<Appointment, 'id' | 'tokenNumber'> & { tokenNumber?: string }) => {
    const appointmentDate = aptData.appointmentDate || '2026-07-24';

    // Prevent Duplicate Appointments (Same patient + doctor + date + time slot where status !== 'Cancelled')
    const isDuplicate = appointments.some((a) =>
      a.status !== 'Cancelled' &&
      (a.patientId === aptData.patientId || a.patientName.toLowerCase() === aptData.patientName.toLowerCase()) &&
      a.doctorId === aptData.doctorId &&
      a.appointmentDate === appointmentDate &&
      a.appointmentTime === aptData.appointmentTime
    );

    if (isDuplicate) {
      addToast(
        'Duplicate Booking Prevented',
        `An active appointment already exists for ${aptData.patientName} with ${aptData.doctorName} on ${appointmentDate} at ${aptData.appointmentTime}. Duplicate booking blocked.`,
        'warning'
      );
      return;
    }

    const id = `apt-${Date.now().toString().slice(-4)}`;
    const isPending = aptData.paymentStatus === 'Pending Verification' || aptData.paymentStatus === 'Pending';
    const tokenNumber = isPending ? undefined : (aptData.tokenNumber || generateDailyDepartmentToken(aptData.departmentName, appointmentDate));
    const linkedPatient = patients.find((p) => p.id === aptData.patientId);

    const initialStatus = isPending
      ? (aptData.paymentStatus === 'Pending Verification' ? 'Payment Verification Pending' : 'Payment Pending')
      : 'Token Generated';

    const branchObj = activeTenant.branches.find((b) => b.id === aptData.branchId) || activeBranch;

    const created: Appointment = {
      ...aptData,
      id,
      tokenNumber,
      status: initialStatus,
      opNumber: aptData.opNumber || linkedPatient?.opNumber,
      branchId: aptData.branchId || branchObj.id,
      branchName: aptData.branchName || branchObj.name,
      auditHistory: [
        {
          status: 'Booked',
          timestamp: new Date().toISOString(),
          note: `Appointment scheduled with ${aptData.doctorName} at ${aptData.branchName || branchObj.name} for ${appointmentDate} ${aptData.appointmentTime}`,
          actor: aptData.createdByName || 'Patient Portal',
        },
        ...(isPending
          ? [
              {
                status: initialStatus,
                timestamp: new Date().toISOString(),
                note:
                  aptData.paymentStatus === 'Pending Verification'
                    ? `Online payment submitted with UTR: ${aptData.utrNumber || 'Reference Pending'}. Awaiting hospital desk verification.`
                    : 'Cash pre-booking chosen. Payment pending upon hospital counter arrival.',
                utrNumber: aptData.utrNumber,
                paymentMethod: aptData.paymentMethod,
              },
            ]
          : [
              {
                status: 'Payment Verified',
                timestamp: new Date().toISOString(),
                note: `Consultation fee ₹${aptData.fee} settled via ${aptData.paymentMethod || 'Paid'}.`,
                paymentMethod: aptData.paymentMethod,
              },
              {
                status: 'Token Generated',
                timestamp: new Date().toISOString(),
                note: `OPD Token #${tokenNumber} generated and queued for consultation.`,
                tokenNumber,
              },
            ]),
      ],
    };

    // Activate 15-Day Free OP consultation validity for this specific doctor if paid/waived
    const validUntilDate = new Date(appointmentDate);
    validUntilDate.setDate(validUntilDate.getDate() + 15);
    const validUntilStr = validUntilDate.toISOString().split('T')[0];

    if (!isPending) {
      setPatients((prev) =>
        prev.map((p) => {
          if (p.id === aptData.patientId) {
            const docKey = aptData.doctorId || aptData.doctorName || 'default-doc';
            const existingDocRec = p.doctorValidities?.[docKey];
            const updatedDoctorValidities = {
              ...(p.doctorValidities || {}),
              [docKey]: {
                doctorId: aptData.doctorId || docKey,
                doctorName: aptData.doctorName,
                lastVisitDate: appointmentDate,
                validUntil: validUntilStr,
                visitsCount: (existingDocRec?.visitsCount || 0) + 1,
              },
            };

            return {
              ...p,
              totalVisits: (p.totalVisits || 0) + 1,
              lastVisitDate: appointmentDate,
              opValidityEndDate: validUntilStr,
              doctorValidities: updatedDoctorValidities,
            };
          }
          return p;
        })
      );
    }

    setAppointments([created, ...appointments]);

    if (isPending) {
      if (aptData.paymentStatus === 'Pending Verification') {
        addToast(
          'Appointment Pre-Booked (UTR Pending)',
          `Appointment pre-booked for ${aptData.patientName}. Staff will verify UTR ${aptData.utrNumber || ''} at hospital desk to issue OPD Token.`,
          'info'
        );
      } else {
        addToast(
          'Appointment Pre-Booked (Cash Pending)',
          `Cash pre-booking registered for ${aptData.patientName}. OPD Token will be issued upon cash payment at desk.`,
          'info'
        );
      }
    } else {
      addToast(
        'Appointment Confirmed',
        `Token #${tokenNumber} issued for ${aptData.patientName} • 15-Day Free OP validity with ${aptData.doctorName} active until ${validUntilStr}`,
        'success'
      );
    }
  };

  const verifyAppointmentPayment = (appointmentId: string, paymentMethod?: string, verifiedUtr?: string) => {
    setAppointments((prev) =>
      prev.map((apt) => {
        if (apt.id === appointmentId) {
          const appointmentDate = apt.appointmentDate || '2026-07-24';
          const tokenNumber = apt.tokenNumber || generateDailyDepartmentToken(apt.departmentName, appointmentDate);

          // Activate 15-day validity
          const validUntilDate = new Date(appointmentDate);
          validUntilDate.setDate(validUntilDate.getDate() + 15);
          const validUntilStr = validUntilDate.toISOString().split('T')[0];

          setPatients((patList) =>
            patList.map((p) => {
              if (p.id === apt.patientId) {
                const docKey = apt.doctorId || apt.doctorName || 'default-doc';
                const existingDocRec = p.doctorValidities?.[docKey];
                const updatedDoctorValidities = {
                  ...(p.doctorValidities || {}),
                  [docKey]: {
                    doctorId: apt.doctorId || docKey,
                    doctorName: apt.doctorName,
                    lastVisitDate: appointmentDate,
                    validUntil: validUntilStr,
                    visitsCount: (existingDocRec?.visitsCount || 0) + 1,
                  },
                };

                return {
                  ...p,
                  totalVisits: (p.totalVisits || 0) + 1,
                  lastVisitDate: appointmentDate,
                  opValidityEndDate: validUntilStr,
                  doctorValidities: updatedDoctorValidities,
                };
              }
              return p;
            })
          );

          const updatedAudit = [
            ...(apt.auditHistory || []),
            {
              status: 'Payment Verified',
              timestamp: new Date().toISOString(),
              note: `UTR ${verifiedUtr || apt.utrNumber || 'N/A'} verified against bank statement. Payment confirmed.`,
              actor: currentUser?.name || 'Front Desk Staff',
              paymentMethod: paymentMethod || apt.paymentMethod || 'Online Paid',
              utrNumber: verifiedUtr || apt.utrNumber,
            },
            {
              status: 'Token Generated',
              timestamp: new Date().toISOString(),
              note: `OPD Token #${tokenNumber} assigned. Queue position ready for doctor consultation.`,
              tokenNumber,
            },
          ];

          addToast(
            'Payment Verified & Token Issued',
            `OPD Token #${tokenNumber} generated for ${apt.patientName} (${paymentMethod || apt.paymentMethod || 'Online Paid'})`,
            'success'
          );

          return {
            ...apt,
            paymentStatus: 'Paid',
            tokenNumber,
            paymentMethod: paymentMethod || apt.paymentMethod || 'Online Paid',
            utrNumber: verifiedUtr || apt.utrNumber,
            verifiedAt: new Date().toISOString(),
            status: 'Token Generated',
            auditHistory: updatedAudit,
          };
        }
        return apt;
      })
    );
  };

  const reassignAppointmentDoctor = (
    appointmentId: string,
    newDoctor: Doctor,
    newModel: AppointmentModel,
    feeAdjustment: {
      newFee: number;
      differential: number;
      paymentMode?: string;
      utrNumber?: string;
    }
  ): Appointment | null => {
    const target = appointments.find((a) => a.id === appointmentId);
    if (!target) return null;

    const nowStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const origDoc = target.doctorName || 'Original Doctor';
    const patientName = target.patientName || 'Transferred Patient';
    const patientUhid = target.patientUhid || 'BRH14561';
    const targetDateStr = target.appointmentDate || '2026-07-24';

    // Continue the queue line sequence for the new doctor/department
    const newToken = generateDailyDepartmentToken(newDoctor.departmentName, targetDateStr);

    // Calculate 15-day validity for the new doctor
    const validDate = new Date('2026-07-24');
    validDate.setDate(validDate.getDate() + 15);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dynamicValidUntil = `${String(validDate.getDate()).padStart(2, '0')}-${months[validDate.getMonth()]}-${validDate.getFullYear()}`;

    const updated: Appointment = {
      ...target,
      doctorId: newDoctor.id,
      doctorName: newDoctor.name,
      departmentName: newDoctor.departmentName,
      model: newModel,
      fee: feeAdjustment.newFee,
      tokenNumber: newToken,
      validUntil: dynamicValidUntil,
      reassignedFromDoctor: origDoc,
      reassignedAt: `2026-07-24 ${nowStr}`,
      differentialFeePaid: feeAdjustment.differential,
      utrNumber: feeAdjustment.utrNumber || target.utrNumber,
      status: 'Checked-In',
      paymentStatus: feeAdjustment.newFee === 0 ? 'Waived' : 'Paid',
    };

    setAppointments((prev) =>
      prev.map((apt) => (apt.id === appointmentId ? updated : apt))
    );

    // If differential paid via UPI, log in UTR
    if (feeAdjustment.differential > 0 && feeAdjustment.paymentMode === 'Online UPI' && feeAdjustment.utrNumber) {
      addUnverifiedUTR({
        utrNumber: feeAdjustment.utrNumber,
        patientName,
        patientUhid,
        doctorName: newDoctor.name,
        amount: feeAdjustment.differential,
        paymentMode: 'Online UPI',
        date: '2026-07-24',
        time: nowStr,
        notes: `Doctor transfer fee adjustment to ${newDoctor.name} (Replaced ${origDoc})`,
      });
    }

    addToast(
      'Doctor Consultation Reassigned',
      `Transferred to ${newDoctor.name} (${newDoctor.departmentName}) • New Token: ${newToken}`,
      'success'
    );

    return updated;
  };

  const cancelAppointment = (
    appointmentId: string,
    reason: string,
    refundMode: 'Cash' | 'Online UPI Reversal' | 'Credit Voucher',
    refundAmount: number
  ) => {
    setAppointments((prev) =>
      prev.map((apt) => {
        if (apt.id === appointmentId) {
          return {
            ...apt,
            status: 'Cancelled' as const,
            paymentStatus: 'Refunded' as const,
            cancellationReason: reason,
            cancelledAt: `2026-07-24 ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`,
            refundAmount,
            refundMode,
            refundReference: `REF-${Date.now().toString().slice(-6)}`,
          };
        }
        return apt;
      })
    );

    addToast(
      'Consultation Cancelled & Refunded',
      `Token cancelled. Processed ₹${refundAmount} refund via ${refundMode}.`,
      'info'
    );
  };

  const updateBedStatus = (
    bedId: string,
    status: Bed['status'],
    patientId?: string,
    patientName?: string,
    patientUhid?: string,
    attendingDoctor?: string
  ) => {
    setBeds((prev) =>
      prev.map((bed) => {
        if (bed.id === bedId) {
          return {
            ...bed,
            status,
            patientId: status === 'Occupied' ? patientId : undefined,
            patientName: status === 'Occupied' ? patientName : undefined,
            patientUhid: status === 'Occupied' ? patientUhid : undefined,
            attendingDoctor: status === 'Occupied' ? (attendingDoctor || bed.attendingDoctor || 'Dr. Vikram Reddy') : undefined,
            admittedDate: status === 'Occupied' ? new Date().toISOString().replace('T', ' ').slice(0, 16) : undefined,
          };
        }
        return bed;
      })
    );
    addToast('Bed Status Updated', `Bed status updated to ${status}`, 'info');
  };

  // Patient Internal Movement & Transfer Telemetry Engine
  const addPatientMovement = (log: Omit<PatientMovementLog, 'id' | 'timestamp'> & { timestamp?: string; id?: string }) => {
    const now = new Date();
    const dStr = now.toISOString().split('T')[0];
    const tStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const tsStr = log.timestamp || `${dStr} ${tStr}`;
    const id = log.id || `mov-${Date.now().toString().slice(-4)}`;

    const newLog: PatientMovementLog = {
      ...log,
      id,
      timestamp: tsStr,
      status: log.status || 'Scheduled / Initiated',
      movementType: log.movementType || 'Ward-to-Ward',
    };

    setPatientMovementLogs([newLog, ...patientMovementLogs]);
    addToast('Patient Movement Initiated', `Transfer for ${log.patientName} (${log.fromLocation} ➡️ ${log.toLocation}) recorded.`, 'info');
  };

  const updatePatientMovement = (id: string, updates: Partial<PatientMovementLog>) => {
    setPatientMovementLogs((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
    addToast('Transfer Status Updated', `Movement record ${id} successfully updated.`, 'success');
  };

  const cancelPatientMovement = (id: string, cancelReason: string) => {
    setPatientMovementLogs((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: 'Cancelled',
              handoverNotes: `${item.handoverNotes ? item.handoverNotes + ' | ' : ''}Cancelled: ${cancelReason}`,
            }
          : item
      )
    );
    addToast('Transfer Cancelled', `Movement record ${id} cancelled.`, 'warning');
  };

  const addInvoice = (invData: Omit<BillingInvoice, 'id'> & { id?: string }) => {
    const id = invData.id || `inv-${Date.now().toString().slice(-4)}`;
    const newInvoice: BillingInvoice = {
      ...invData,
      id,
    };
    setInvoices([newInvoice, ...invoices]);
    addToast('Invoice Created', `Invoice #${newInvoice.invoiceNo} generated for ${newInvoice.patientName}.`, 'success');
  };

  const processPayment = (invoiceId: string, newPayments: PaymentSplit[], discountAmount: number = 0) => {
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === invoiceId) {
          const updatedPayments = [...inv.payments, ...newPayments];
          const totalPaid = updatedPayments.reduce((acc, p) => acc + p.amount, 0);
          const netTotal = Math.max(0, inv.subtotal - (inv.discountAmount + discountAmount));
          const due = Math.max(0, netTotal - totalPaid);
          const status = due === 0 ? 'Paid' : totalPaid > 0 ? 'Partial' : 'Unpaid';

          return {
            ...inv,
            discountAmount: inv.discountAmount + discountAmount,
            netTotal,
            payments: updatedPayments,
            paidAmount: totalPaid,
            dueAmount: due,
            paymentStatus: status,
          };
        }
        return inv;
      })
    );
    addToast('Payment Processed', `Payment received & invoice updated`, 'success');
  };

  const addAdmission = (admData: IPDAdmission) => {
    setAdmissions((prev) => [admData, ...prev]);
    addToast('IPD Admission Confirmed', `${admData.patientName} admitted to ${admData.wardName} (${admData.bedNumber})`, 'success');
  };

  const addEmergencyCase = (emgData: Omit<EmergencyCase, 'id' | 'caseNo'>) => {
    const id = `emg-${Date.now().toString().slice(-4)}`;
    const caseNo = `EMG-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const created: EmergencyCase = {
      ...emgData,
      id,
      caseNo,
    };

    setEmergencyCases([created, ...emergencyCases]);
    addToast('Emergency Registered', `Case #${caseNo} triage assigned (${emgData.triagePriority})`, 'warning');
  };

  const updateEmergencyCase = (id: string, updates: Partial<EmergencyCase>) => {
    setEmergencyCases((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const addConsentForm = (formData: Omit<DigitalConsentForm, 'id' | 'signedTimestamp'>) => {
    const id = `form-${Date.now().toString().slice(-4)}`;
    const newForm: DigitalConsentForm = {
      ...formData,
      id,
      signedTimestamp: '2026-07-24 10:45',
      status: formData.status || 'Pending Signature',
    };
    setConsentForms([newForm, ...consentForms]);
    addToast('Consent Form Initiated', `Digital ${formData.formType} created for ${formData.patientName}`, 'info');
  };

  const toggleConsentSignStatus = (formId: string, signedBy: string, witnessName?: string, signatureData?: string) => {
    setConsentForms((prev) =>
      prev.map((form) => {
        if (form.id === formId) {
          return {
            ...form,
            status: 'Signed',
            signedBy,
            witnessName: witnessName || form.witnessName || 'Staff Nurse / OT Supervisor',
            signatureUrl: signatureData || form.signatureUrl,
            signedTimestamp: '2026-07-24 10:45',
          };
        }
        return form;
      })
    );
    addToast('Consent Digitally Executed', `Informed consent captured with timestamp SHA-256`, 'success');
  };

  const updateHousekeepingStatus = (taskId: string, status: HousekeepingTask['status']) => {
    setHousekeepingTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status } : t))
    );
    addToast('Housekeeping Task Updated', `Status changed to ${status}`, 'info');
  };

  const addContactInquiry = (inquiryData: Omit<ContactInquiry, 'id' | 'date' | 'status'>) => {
    const created: ContactInquiry = {
      ...inquiryData,
      id: `inq-${Date.now()}`,
      date: '2026-07-24 10:00',
      status: 'New Inquiry',
    };
    setContactInquiries([created, ...contactInquiries]);
    addToast('Inquiry Submitted', 'Our medical counselor will reach back shortly.', 'success');
  };

  const addBlogPost = (postData: Omit<BlogPost, 'id'>) => {
    const created: BlogPost = {
      ...postData,
      id: `blog-${Date.now()}`,
    };
    setBlogPosts([created, ...blogPosts]);
    addToast('Blog Article Published', `Published "${postData.title}" on hospital website.`, 'success');
  };

  const addInsuranceClaim = (claimData: Omit<InsuranceClaim, 'id' | 'claimNo' | 'submittedDate'>) => {
    const id = `claim-${Date.now().toString().slice(-4)}`;
    const prefix = (claimData.providerName || 'TPA').split(' ')[0].toUpperCase().slice(0, 5);
    const claimNo = `CLM-${prefix}-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newClaim: InsuranceClaim = {
      ...claimData,
      id,
      claimNo,
      submittedDate: '2026-07-24 10:45',
      status: claimData.status || 'Pre-Auth Submitted',
    };
    setInsuranceClaims([newClaim, ...insuranceClaims]);
    addToast('Cashless Pre-Auth Logged', `Claim #${claimNo} recorded for ${claimData.patientName}.`, 'success');
  };

  const updateInsuranceClaim = (claimId: string, updates: Partial<InsuranceClaim>) => {
    setInsuranceClaims((prev) =>
      prev.map((c) => (c.id === claimId ? { ...c, ...updates } : c))
    );
    addToast('Claim Updated', `Insurance claim record updated.`, 'info');
  };

  const INITIAL_MOCK_UTRS: UnverifiedUTRReport[] = [
    {
      id: 'utr-rep-01',
      utrNumber: '620194827101',
      patientName: 'Kavitha Venkatram',
      patientUhid: 'BRH14561',
      doctorName: 'Dr. Vikram Reddy',
      amount: 500,
      paymentMode: 'Online UPI',
      date: '2026-07-24',
      time: '09:30 AM',
      timestamp: '2026-07-24 09:30 AM',
      status: 'Bank Reconciled',
      notes: 'Verified via ICICI UPI live web-hook gateway',
    },
    {
      id: 'utr-rep-02',
      utrNumber: '612984719280',
      patientName: 'Ramesh Naidu',
      patientUhid: 'BRH14565',
      doctorName: 'Dr. Rajeshwar Rao',
      amount: 330,
      paymentMode: 'Online UPI',
      date: '2026-07-24',
      time: '10:15 AM',
      timestamp: '2026-07-24 10:15 AM',
      status: 'Unverified / Flagged',
      notes: 'UTR pending bank corporate settlement batch sync',
    },
    {
      id: 'utr-rep-03',
      utrNumber: 'UPI/9982183912/Paytm',
      patientName: 'Kiran Kumar',
      patientUhid: 'BRH14566',
      doctorName: 'Dr. Vikram Reddy',
      amount: 500,
      paymentMode: 'Online UPI',
      date: '2026-07-24',
      time: '10:45 AM',
      timestamp: '2026-07-24 10:45 AM',
      status: 'Unverified / Flagged',
      notes: 'Payment gateway bank timeout during morning token generation',
    },
    {
      id: 'utr-rep-04',
      utrNumber: '620199482910',
      patientName: 'Mohammed Arshad',
      patientUhid: 'BRH14563',
      doctorName: 'Dr. Ananya Swaminathan',
      amount: 600,
      paymentMode: 'Online UPI',
      date: '2026-07-24',
      time: '11:20 AM',
      timestamp: '2026-07-24 11:20 AM',
      status: 'Bank Reconciled',
      notes: 'Verified via PhonePe Business QR counter terminal',
    },
    {
      id: 'utr-rep-05',
      utrNumber: 'CARD-AUTH-882190',
      patientName: 'Srinivas Goud',
      patientUhid: 'BRH14562',
      doctorName: 'Dr. Vikram Reddy',
      amount: 500,
      paymentMode: 'Card / POS',
      cardType: 'Visa Credit Card',
      cardLast4: '4589',
      posTerminalId: 'ICICI POS Terminal #01',
      authCode: 'AUTH-882190',
      date: '2026-07-24',
      time: '11:45 AM',
      timestamp: '2026-07-24 11:45 AM',
      status: 'Bank Reconciled',
      notes: 'POS Machine Swiped & Settled via EDC Batch #0412',
    },
    {
      id: 'utr-rep-06',
      utrNumber: '991204481234',
      patientName: 'Lakshmi Prasanna',
      patientUhid: 'BRH14564',
      doctorName: 'Dr. Rajeshwar Rao',
      amount: 400,
      paymentMode: 'Online UPI',
      date: '2026-07-24',
      time: '12:10 PM',
      timestamp: '2026-07-24 12:10 PM',
      status: 'Bank Reconciled',
      notes: 'GooglePay UPI direct settlement received',
    },
  ];

  const [unverifiedUTRs, setUnverifiedUTRs] = useState<UnverifiedUTRReport[]>(() => {
    try {
      const saved = localStorage.getItem('anarav_live_utrs');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return INITIAL_MOCK_UTRS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('anarav_live_utrs', JSON.stringify(unverifiedUTRs));
    } catch {
      // ignore
    }
  }, [unverifiedUTRs]);

  const addUnverifiedUTR = (record: Omit<UnverifiedUTRReport, 'id' | 'timestamp' | 'status'> & { date?: string; time?: string; timestamp?: string; status?: UnverifiedUTRReport['status'] }) => {
    const dStr = record.date || '2026-07-24';
    const tStr = record.time || '10:00 AM';
    const tsStr = record.timestamp || `${dStr} ${tStr}`;

    const newRecord: UnverifiedUTRReport = {
      id: `utr-rep-${Date.now()}`,
      utrNumber: record.utrNumber,
      patientName: record.patientName || 'Walk-in Patient',
      patientUhid: record.patientUhid || 'BRH14561',
      doctorName: record.doctorName || 'OPD Specialist',
      amount: record.amount || 0,
      paymentMode: record.paymentMode || 'Online UPI',
      cardType: record.cardType,
      cardLast4: record.cardLast4,
      posTerminalId: record.posTerminalId,
      authCode: record.authCode,
      date: dStr,
      time: tStr,
      timestamp: tsStr,
      status: record.status || 'Unverified / Flagged',
      notes: record.notes || 'Logged via reception front desk',
      enteredBy: record.enteredBy || 'Reception Front Desk',
      sourceModule: record.sourceModule || 'Reception OPD',
      bankReference: record.bankReference || 'ICICI Bank Live Feed',
      patientPhone: record.patientPhone,
    };
    setUnverifiedUTRs((prev) => [newRecord, ...prev]);
    addToast('UTR Logged in Reports', `Unverified UTR ${record.utrNumber} added to Accounts Reconciliation Report`, 'warning');
  };

  const resolveUTR = (id: string, resolutionStatus: 'Bank Reconciled' | 'Disputed' | 'Unverified / Flagged' = 'Bank Reconciled') => {
    setUnverifiedUTRs((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: resolutionStatus } : r))
    );
    addToast('UTR Status Updated', `Payment reconciliation marked as ${resolutionStatus}`, 'success');
  };

  const resetUTRs = () => {
    setUnverifiedUTRs(INITIAL_MOCK_UTRS);
    try {
      localStorage.setItem('anarav_live_utrs', JSON.stringify(INITIAL_MOCK_UTRS));
    } catch {}
    addToast('UPI & UTR Ledger Refreshed', 'Default audit records re-populated.', 'success');
  };

  return (
    <HospitalContext.Provider
      value={{
        themeId,
        setThemeId,
        appMode,
        setAppMode,
        currentUser,
        login,
        logout,
        currentPatient,
        patientLogin,
        patientLogout,
        generateUniqueUHID,
        activeModule,
        setActiveModule,
        activeTenant,
        activeBranch,
        setActiveBranch,
        searchQuery,
        setSearchQuery,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        isAiDrawerOpen,
        setIsAiDrawerOpen,
        isNotificationOpen,
        setIsNotificationOpen,
        patients,
        doctors,
        departments,
        appointments,
        beds,
        admissions,
        patientMovementLogs,
        invoices,
        insuranceClaims,
        emergencyCases,
        consentForms,
        housekeepingTasks,
        healthPackages,
        blogPosts,
        galleryItems,
        testimonials,
        contactInquiries,
        toasts,
        unverifiedUTRs,
        addUnverifiedUTR,
        resolveUTR,
        resetUTRs,
        addBranch,
        addDoctor,
        updateDoctorStatus,
        addPatient,
        updatePatientEHR,
        transferPatientBranch,
        findPatientByGlobalUHID,
        addAppointment,
        verifyAppointmentPayment,
        reassignAppointmentDoctor,
        cancelAppointment,
        updateBedStatus,
        addPatientMovement,
        updatePatientMovement,
        cancelPatientMovement,
        addInvoice,
        processPayment,
        addAdmission,
        addEmergencyCase,
        updateEmergencyCase,
        addInsuranceClaim,
        updateInsuranceClaim,
        addConsentForm,
        toggleConsentSignStatus,
        updateHousekeepingStatus,
        addContactInquiry,
        addBlogPost,
        addToast,
        removeToast,
        checkOPValidity,
        getPermission,
        getPermissionDetails,
        isReadOnly,
        isLimited,
        isHidden,
        accessibleModules,
      }}
    >
      {children}
    </HospitalContext.Provider>
  );
};

export const useHospital = () => {
  const context = useContext(HospitalContext);
  if (!context) {
    throw new Error('useHospital must be used within a HospitalProvider');
  }
  return context;
};

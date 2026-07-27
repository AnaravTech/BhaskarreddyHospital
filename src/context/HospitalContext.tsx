import React, { createContext, useContext, useState } from 'react';
import type {
  ModuleType,
  AppMode,
  HospitalTenant,
  Branch,
  Patient,
  Doctor,
  Department,
  Appointment,
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
} from '../types';
import {
  mockTenants,
  mockPatients,
  mockDoctors,
  mockDepartments,
  mockAppointments,
  mockBeds,
  mockIPDAdmissions,
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
  addPatient: (patient: Omit<Patient, 'id' | 'uhid' | 'registeredDate' | 'totalVisits' | 'status'>) => void;
  addAppointment: (apt: Omit<Appointment, 'id' | 'tokenNumber'>) => void;
  updateBedStatus: (bedId: string, status: Bed['status'], patientId?: string, patientName?: string, patientUhid?: string) => void;
  processPayment: (invoiceId: string, payments: PaymentSplit[], discountAmount?: number) => void;
  addEmergencyCase: (emergency: Omit<EmergencyCase, 'id' | 'caseNo'>) => void;
  toggleConsentSignStatus: (formId: string, signedBy: string) => void;
  updateHousekeepingStatus: (taskId: string, status: HousekeepingTask['status']) => void;
  addContactInquiry: (inquiry: Omit<ContactInquiry, 'id' | 'date' | 'status'>) => void;
  addBlogPost: (post: Omit<BlogPost, 'id'>) => void;

  addToast: (title: string, message: string, type?: ToastNotification['type']) => void;
  removeToast: (id: string) => void;
  
  // Validity Engine Helper
  checkOPValidity: (lastVisitDateStr: string) => { isValid: boolean; daysRemaining: number; endDateStr: string };
  themeId: string;
  setThemeId: (id: string) => void;
}

const HospitalContext = createContext<HospitalContextType | undefined>(undefined);

export const HospitalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeId, setThemeId] = useState<string>(() => {
    try { return localStorage.getItem('brhospital-theme') ?? 'light-classic'; } catch { return 'light-classic'; }
  });
  // App Mode State: 'hospital-os' | 'public-website' | 'website-cms'
  const [appMode, setAppMode] = useState<AppMode>('public-website');

  const [currentUser, setCurrentUser] = useState<UserSession | null>(DEMO_PERSONAS[0]);
  const [activeModule, setActiveModule] = useState<ModuleType>('dashboard');
  const [activeTenant] = useState<HospitalTenant>(mockTenants[0]);
  const [activeBranch, setActiveBranch] = useState<Branch>(mockTenants[0].branches[0]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const [patients, setPatients] = useState<Patient[]>(mockPatients);
  const [doctors] = useState<Doctor[]>(mockDoctors);
  const [departments] = useState<Department[]>(mockDepartments);
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  const [beds, setBeds] = useState<Bed[]>(mockBeds);
  const [admissions] = useState<IPDAdmission[]>(mockIPDAdmissions);
  const [invoices, setInvoices] = useState<BillingInvoice[]>(mockInvoices);
  const [insuranceClaims] = useState<InsuranceClaim[]>(mockInsuranceClaims);
  const [emergencyCases, setEmergencyCases] = useState<EmergencyCase[]>(mockEmergencyCases);
  const [consentForms, setConsentForms] = useState<DigitalConsentForm[]>(mockConsentForms);
  const [housekeepingTasks, setHousekeepingTasks] = useState<HousekeepingTask[]>(mockHousekeepingTasks);
  
  const [healthPackages] = useState<HealthPackage[]>(mockHealthPackages);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(mockBlogPosts);
  const [galleryItems] = useState<GalleryItem[]>(mockGalleryItems);
  const [testimonials] = useState<Testimonial[]>(mockTestimonials);
  const [contactInquiries, setContactInquiries] = useState<ContactInquiry[]>(mockContactInquiries);

  const [toasts, setToasts] = useState<ToastNotification[]>([
    {
      id: 't-1',
      title: 'Welcome to Bhaskar Reddy Healthcare Portal',
      message: 'Toggle between Public Patient Website, CMS Admin, and Hospital OS.',
      type: 'info',
      timestamp: 'Just now',
    },
  ]);

  const login = (user: UserSession) => {
    setCurrentUser(user);
    setActiveModule(user.defaultModule);
    addToast('Authenticated Successfully', `Welcome back, ${user.name} (${user.roleTitle})`, 'success');
  };

  const logout = () => {
    setCurrentUser(null);
    addToast('Logged Out', 'User session ended safely.', 'info');
  };

  const addToast = (title: string, message: string, type: ToastNotification['type'] = 'info') => {
    const newToast: ToastNotification = {
      id: `toast-${Date.now()}`,
      title,
      message,
      type,
      timestamp: 'Just now',
    };
    setToasts((prev) => [newToast, ...prev]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // 15-day OP Consultation Validity Calculator Engine
  const checkOPValidity = (lastVisitDateStr: string) => {
    const lastVisit = new Date(lastVisitDateStr);
    const validUntil = new Date(lastVisit);
    validUntil.setDate(validUntil.getDate() + 15);
    
    const today = new Date('2026-07-24');
    const diffTime = validUntil.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return {
      isValid: diffDays >= 0,
      daysRemaining: Math.max(0, diffDays),
      endDateStr: validUntil.toISOString().split('T')[0],
    };
  };

  const addPatient = (newPatData: Omit<Patient, 'id' | 'uhid' | 'registeredDate' | 'totalVisits' | 'status'>) => {
    const id = `pat-${Date.now().toString().slice(-4)}`;
    const uhid = `BRH-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const todayStr = '2026-07-24';
    const endDate = new Date('2026-07-24');
    endDate.setDate(endDate.getDate() + 15);

    const created: Patient = {
      ...newPatData,
      id,
      uhid,
      registeredDate: todayStr,
      lastVisitDate: todayStr,
      opValidityEndDate: endDate.toISOString().split('T')[0],
      totalVisits: 1,
      status: 'Active',
    };

    setPatients([created, ...patients]);
    addToast('Patient Registered', `UHID ${uhid} created for ${created.name}`, 'success');
  };

  const addAppointment = (aptData: Omit<Appointment, 'id' | 'tokenNumber'>) => {
    const id = `apt-${Date.now().toString().slice(-4)}`;
    const deptPrefix = aptData.departmentName.slice(0, 4).toUpperCase();
    const tokenNumber = `${deptPrefix}-0${appointments.length + 1}`;

    const created: Appointment = {
      ...aptData,
      id,
      tokenNumber,
    };

    setAppointments([created, ...appointments]);
    addToast('Appointment Confirmed', `Token #${tokenNumber} issued for ${aptData.patientName}`, 'success');
  };

  const updateBedStatus = (
    bedId: string,
    status: Bed['status'],
    patientId?: string,
    patientName?: string,
    patientUhid?: string
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
            admittedDate: status === 'Occupied' ? '2026-07-24 10:00' : undefined,
          };
        }
        return bed;
      })
    );
    addToast('Bed Status Updated', `Bed status updated to ${status}`, 'info');
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

  const toggleConsentSignStatus = (formId: string, signedBy: string) => {
    setConsentForms((prev) =>
      prev.map((form) => {
        if (form.id === formId) {
          return {
            ...form,
            status: 'Signed',
            signedBy,
            signedTimestamp: '2026-07-24 10:30',
          };
        }
        return form;
      })
    );
    addToast('Consent Form Signed', `Digital signature captured & timestamped`, 'success');
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
        addPatient,
        addAppointment,
        updateBedStatus,
        processPayment,
        addEmergencyCase,
        toggleConsentSignStatus,
        updateHousekeepingStatus,
        addContactInquiry,
        addBlogPost,
        addToast,
        removeToast,
        checkOPValidity,
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

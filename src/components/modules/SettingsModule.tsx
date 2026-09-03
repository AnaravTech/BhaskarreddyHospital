import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import {
  Building,
  MessageSquare,
  Database,
  ShieldCheck,
  Check,
  X as XIcon,
  Briefcase,
  UserCheck,
  UserPlus,
  UploadCloud,
  FileSpreadsheet,
  Download,
  FileText,
  CheckCircle2,
} from 'lucide-react';
import { RBAC_MATRIX, getPermissionNotes } from '../../utils/rbac';
import type { ModuleType, UserRole, PermissionLevel } from '../../types';

interface RolePermission {
  roleName: string;
  roleCode: string;
  userCount: number;
  description: string;
  permissions: {
    patientReg: boolean;
    writePrescription: boolean;
    bedTransfer: boolean;
    processPayment: boolean;
    applyDiscount: boolean;
    tpaPreAuth: boolean;
    viewFinancials: boolean;
    modifyTariffs: boolean;
  };
}

interface StaffItem {
  id: string;
  name: string;
  title: string;
  roleCode: UserRole;
  email: string;
  status: string;
}

const INITIAL_ANARAV_STAFF: StaffItem[] = [
  { id: 'stf-1', name: 'Venkat Suresh', title: 'Hospital Operations Administrator', roleCode: 'admin', email: 'admin@anaravhealth.com', status: 'Active' },
  { id: 'stf-2', name: 'Dr. Bhaskar Reddy', title: 'Chief Executive Officer / Chairman', roleCode: 'ceo', email: 'ceo@anaravhealth.com', status: 'Active' },
  { id: 'stf-3', name: 'Dr. Vikram Reddy', title: 'Chief Interventional Cardiologist', roleCode: 'doctor', email: 'vikram.reddy@anaravhealth.com', status: 'Active' },
  { id: 'stf-4', name: 'Dr. Ramesh Kumar', title: 'Duty Medical Officer (DMO)', roleCode: 'dmo', email: 'dmo@anaravhealth.com', status: 'Active' },
  { id: 'stf-5', name: 'Dr. Rajan Pillai', title: 'Senior Orthopaedic Surgeon', roleCode: 'doctor', email: 'ortho@anaravhealth.com', status: 'Active' },
  { id: 'stf-6', name: 'Dr. Asha Nair', title: 'Consultant Gynaecologist & Obstetrician', roleCode: 'doctor', email: 'gynaec@anaravhealth.com', status: 'Active' },
  { id: 'stf-7', name: 'Dr. Sameer Khan', title: 'Trauma & Emergency Resuscitation Lead', roleCode: 'emergency', email: 'emergency@anaravhealth.com', status: 'Active' },
  { id: 'stf-8', name: 'Dr. Meena Sharma', title: 'Chief Pathologist & Lab Director', roleCode: 'lab', email: 'lab@anaravhealth.com', status: 'Active' },
  { id: 'stf-9', name: 'Priyanka M', title: 'Front Desk & Patient Registrar', roleCode: 'receptionist', email: 'reception@anaravhealth.com', status: 'Active' },
  { id: 'stf-10', name: 'Anil Kumar', title: 'Chief Cashier & Ledger Manager', roleCode: 'billing', email: 'billing@anaravhealth.com', status: 'Active' },
  { id: 'stf-11', name: 'Srinivas Rao', title: 'TPA Cashless & Claims Officer', roleCode: 'insurance', email: 'tpa@anaravhealth.com', status: 'Active' },
  { id: 'stf-12', name: 'Sr. Lakshmi Devi', title: 'Head of Nursing Services', roleCode: 'nurse', email: 'headnurse@anaravhealth.com', status: 'Active' },
  { id: 'stf-13', name: 'Anand Rao', title: 'Bed Allocation & Ward Incharge', roleCode: 'ward_manager', email: 'bedmanager@anaravhealth.com', status: 'Active' },
  { id: 'stf-14', name: 'Ramesh Babu', title: 'Sanitation & Housekeeping Supervisor', roleCode: 'housekeeping', email: 'housekeeping@anaravhealth.com', status: 'Active' },
  { id: 'stf-15', name: 'Suresh Varma', title: 'Facility & Biomedical Maintenance Lead', roleCode: 'maintenance', email: 'maintenance@anaravhealth.com', status: 'Active' },
  { id: 'stf-16', name: 'Rajesh Gupta', title: 'Chief Pharmacist & Drug Controller', roleCode: 'pharmacist', email: 'pharmacy@anaravhealth.com', status: 'Active' },
];

export const SettingsModule: React.FC = () => {
  const { activeTenant, addToast, addBranch } = useHospital();

  // Branch Onboarding Modal State
  const [isAddBranchModalOpen, setIsAddBranchModalOpen] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');
  const [newBranchCity, setNewBranchCity] = useState('');
  const [newBranchIsMain, setNewBranchIsMain] = useState(false);

  const handleAddBranchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranchName.trim() || !newBranchCity.trim()) {
      addToast('Error', 'Please provide branch name and city', 'warning');
      return;
    }

    addBranch({
      name: newBranchName.trim(),
      city: newBranchCity.trim(),
      isMainBranch: newBranchIsMain,
    });

    setIsAddBranchModalOpen(false);
    setNewBranchName('');
    setNewBranchCity('');
    setNewBranchIsMain(false);
    addToast('Branch Added', `Hospital Branch "${newBranchName}" in ${newBranchCity} registered successfully!`, 'success');
  };

  const [activeTab, setActiveTabState] = useState<'rbac' | 'departments' | 'tariffs' | 'users' | 'import' | 'saas' | 'templates'>(() => {
    try {
      const saved = localStorage.getItem('brhospital-tab-settings');
      if (['rbac', 'departments', 'tariffs', 'users', 'import', 'saas', 'templates'].includes(saved as string)) {
        return saved as any;
      }
    } catch {}
    return 'rbac';
  });

  const setActiveTab = (tab: 'rbac' | 'departments' | 'tariffs' | 'users' | 'import' | 'saas' | 'templates') => {
    setActiveTabState(tab);
    try {
      localStorage.setItem('brhospital-tab-settings', tab);
    } catch {}
  };

  // Staff Users Roster State with localStorage persistence
  const [staffList, setStaffListState] = useState<StaffItem[]>(() => {
    try {
      const saved = localStorage.getItem('brhospital-anarav-staff-list');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_ANARAV_STAFF;
  });

  const setStaffList = (updater: StaffItem[] | ((prev: StaffItem[]) => StaffItem[])) => {
    setStaffListState((prev: StaffItem[]) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      try {
        localStorage.setItem('brhospital-anarav-staff-list', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Bulk Import State
  const [importType, setImportType] = useState<'patients' | 'doctors' | 'accounts' | 'tariffs'>('patients');
  const [rawCsvText, setRawCsvText] = useState('');
  const [parsedPreview, setParsedPreview] = useState<any[]>([]);
  const [importFileName, setImportFileName] = useState('');
  const [importedCounts, setImportedCounts] = useState<{ patients: number; doctors: number; accounts: number; tariffs: number }>(() => {
    try {
      const p = JSON.parse(localStorage.getItem('brhospital-imported-patients') || '[]');
      const d = JSON.parse(localStorage.getItem('brhospital-imported-doctors') || '[]');
      const a = JSON.parse(localStorage.getItem('brhospital-anarav-staff-list') || '[]');
      const t = JSON.parse(localStorage.getItem('brhospital-imported-tariffs') || '[]');
      return {
        patients: Array.isArray(p) ? p.length : 0,
        doctors: Array.isArray(d) ? d.length : 0,
        accounts: Array.isArray(a) ? a.length : 0,
        tariffs: Array.isArray(t) ? t.length : 0,
      };
    } catch {
      return { patients: 0, doctors: 0, accounts: 0, tariffs: 0 };
    }
  });

  // Sample CSV Templates Generator
  const getSampleCsv = (type: 'patients' | 'doctors' | 'accounts' | 'tariffs') => {
    switch (type) {
      case 'patients':
        return `Name,Phone,Age,Gender,BloodGroup,City,Address
Ramesh Chandra,9876543210,48,Male,O+,Hyderabad,Plot 45 Jubilee Hills
Sunita Sharma,9876543211,35,Female,B+,Bangalore,Flat 204 Indiranagar
Kiran Varma,9876543212,62,Male,A+,Chennai,88 Anna Salai`;
      case 'doctors':
        return `Name,Specialization,Department,Qualification,Experience,ConsultationFee,OpdRoom
Dr. Vikram Reddy,Interventional Cardiology,Cardiology & Cardiac Surgery,MD DM (Cardio) FACC,18 Years,800,OPD-101
Dr. Asha Nair,Obstetrics & Gynaecology,Obstetrics & Gynaecology (Maternity),MS (OBG) DNB,14 Years,700,OPD-102
Dr. Rajan Pillai,Joint Replacement & Orthopaedics,Orthopaedics & Joint Replacement,MS (Ortho) MCh,16 Years,750,OPD-202`;
      case 'accounts':
        return `Name,Designation,Department,RoleCode,Email,Status
Dr. Sameer Khan,Trauma & Emergency Resuscitation Lead,Emergency & Critical Care,emergency,emergency@anaravhealth.com,Active
Dr. Meena Sharma,Chief Pathologist & Lab Director,Clinical Pathology & Diagnostics,lab,lab@anaravhealth.com,Active
Rajesh Gupta,Chief Pharmacist & Drug Controller,Central Pharmacy & Dispensary,pharmacist,pharmacy@anaravhealth.com,Active`;
      case 'tariffs':
        return `ServiceCategory,ServiceName,ServiceCode,StandardRate,EmergencyRate,TaxPercent
Cardiology,2D Echocardiography with Color Doppler,CARD-ECHO-01,2500,3200,0
Orthopaedics,Digital X-Ray Knee AP and Lateral,RAD-XRAY-04,900,1200,0
Inpatient,ICU Bed with Multipara Monitor & Ventilator,IPD-ICU-01,7500,9000,5
Pathology,Complete Blood Count (CBC) with ESR,LAB-CBC-01,450,600,0`;
    }
  };

  const handleDownloadSampleCsv = (type: 'patients' | 'doctors' | 'accounts' | 'tariffs') => {
    const csvContent = getSampleCsv(type);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${type}_template.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Template Downloaded', `Downloaded sample ${type}.csv template`, 'info');
  };

  const parseCsvText = (text: string) => {
    const lines = text.trim().split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
    const rows = lines.slice(1).map((line, idx) => {
      const values = line.split(',').map((v) => v.trim().replace(/^"|"$/g, ''));
      const obj: Record<string, any> = { _rowIndex: idx + 1, _isValid: true };
      headers.forEach((header, hIdx) => {
        obj[header] = values[hIdx] || '';
      });
      return obj;
    });

    return rows;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setRawCsvText(text);
      const parsed = parseCsvText(text);
      setParsedPreview(parsed);
      addToast('CSV Loaded', `Parsed ${parsed.length} records from ${file.name}`, 'info');
    };
    reader.readAsText(file);
  };

  const handleCommitImport = () => {
    if (parsedPreview.length === 0) {
      addToast('No Data', 'Please select a CSV file or paste valid CSV text first', 'warning');
      return;
    }

    if (importType === 'accounts') {
      const newStaffList: StaffItem[] = parsedPreview.map((row, idx) => ({
        id: `stf-imp-${Date.now()}-${idx}`,
        name: row.Name || row.name || 'Imported User',
        title: row.Designation || row.title || 'Staff Specialist',
        roleCode: (row.RoleCode || row.roleCode || 'doctor') as UserRole,
        email: row.Email || row.email || `imported${idx}@anaravhealth.com`,
        status: row.Status || row.status || 'Active',
      }));

      setStaffList((prev) => [...prev, ...newStaffList]);
      addToast('Staff Accounts Imported', `Persistently imported ${newStaffList.length} staff user accounts`, 'success');
    } else if (importType === 'patients') {
      try {
        const existing = JSON.parse(localStorage.getItem('brhospital-imported-patients') || '[]');
        const updated = [...existing, ...parsedPreview];
        localStorage.setItem('brhospital-imported-patients', JSON.stringify(updated));
        setImportedCounts((prev) => ({ ...prev, patients: updated.length }));
        addToast('Patients Imported', `Persistently imported ${parsedPreview.length} patient records to database`, 'success');
      } catch {}
    } else if (importType === 'doctors') {
      try {
        const existing = JSON.parse(localStorage.getItem('brhospital-imported-doctors') || '[]');
        const updated = [...existing, ...parsedPreview];
        localStorage.setItem('brhospital-imported-doctors', JSON.stringify(updated));
        setImportedCounts((prev) => ({ ...prev, doctors: updated.length }));
        addToast('Doctors Imported', `Persistently imported ${parsedPreview.length} doctor profiles to database`, 'success');
      } catch {}
    } else if (importType === 'tariffs') {
      try {
        const existing = JSON.parse(localStorage.getItem('brhospital-imported-tariffs') || '[]');
        const updated = [...existing, ...parsedPreview];
        localStorage.setItem('brhospital-imported-tariffs', JSON.stringify(updated));
        setImportedCounts((prev) => ({ ...prev, tariffs: updated.length }));
        addToast('Tariffs Imported', `Persistently imported ${parsedPreview.length} tariff line items`, 'success');
      } catch {}
    }

    setParsedPreview([]);
    setRawCsvText('');
    setImportFileName('');
  };

  // Role Permissions State Matrix
  const [roles, setRoles] = useState<RolePermission[]>([
    {
      roleName: 'System Super Administrator',
      roleCode: 'ROLE_SUPERADMIN',
      userCount: 2,
      description: 'Unrestricted system access, multi-tenant branch provisioning, and audit log controls.',
      permissions: {
        patientReg: true,
        writePrescription: true,
        bedTransfer: true,
        processPayment: true,
        applyDiscount: true,
        tpaPreAuth: true,
        viewFinancials: true,
        modifyTariffs: true,
      },
    },
    {
      roleName: 'CEO / Managing Director',
      roleCode: 'ROLE_CEO',
      userCount: 3,
      description: 'Executive telemetry command center, financial analytics, and hospital performance dashboards.',
      permissions: {
        patientReg: true,
        writePrescription: false,
        bedTransfer: true,
        processPayment: true,
        applyDiscount: true,
        tpaPreAuth: true,
        viewFinancials: true,
        modifyTariffs: true,
      },
    },
    {
      roleName: 'Doctor / Medical Consultant',
      roleCode: 'ROLE_DOCTOR',
      userCount: 24,
      description: 'OPD queue management, EHR digital prescription writing, vitals telemetry, and discharge summaries.',
      permissions: {
        patientReg: true,
        writePrescription: true,
        bedTransfer: true,
        processPayment: false,
        applyDiscount: false,
        tpaPreAuth: false,
        viewFinancials: false,
        modifyTariffs: false,
      },
    },
    {
      roleName: 'Front Desk & Reception Registrar',
      roleCode: 'ROLE_RECEPTION',
      userCount: 12,
      description: 'Walk-in patient registration, UHID issuance, token generation, and appointment booking.',
      permissions: {
        patientReg: true,
        writePrescription: false,
        bedTransfer: false,
        processPayment: true,
        applyDiscount: false,
        tpaPreAuth: false,
        viewFinancials: false,
        modifyTariffs: false,
      },
    },
    {
      roleName: 'Billing & Cashier Manager',
      roleCode: 'ROLE_CASHIER',
      userCount: 8,
      description: 'Multi-payment split processing (Cash/UPI/Cards), itemized invoice printing, and cashier ledger entries.',
      permissions: {
        patientReg: false,
        writePrescription: false,
        bedTransfer: false,
        processPayment: true,
        applyDiscount: true,
        tpaPreAuth: false,
        viewFinancials: true,
        modifyTariffs: false,
      },
    },
    {
      roleName: 'TPA & Insurance Claims Officer',
      roleCode: 'ROLE_INSURANCE',
      userCount: 5,
      description: 'Pre-Authorization request submissions, claim document upload, and TPA settlement tracking.',
      permissions: {
        patientReg: false,
        writePrescription: false,
        bedTransfer: false,
        processPayment: true,
        applyDiscount: false,
        tpaPreAuth: true,
        viewFinancials: true,
        modifyTariffs: false,
      },
    },
  ]);

  const [whatsappTemplate, setWhatsappTemplate] = useState(
    '🏥 *{HOSPITAL_NAME} Alert*: Hello {PATIENT_NAME}, your appointment is scheduled today. Follow-up validity active until {OP_VALID_DATE}.'
  );

  const togglePermission = (roleCode: string, key: keyof RolePermission['permissions']) => {
    setRoles((prev) =>
      prev.map((r) => {
        if (r.roleCode === roleCode) {
          return {
            ...r,
            permissions: {
              ...r.permissions,
              [key]: !r.permissions[key],
            },
          };
        }
        return r;
      })
    );
    addToast('RBAC Permission Updated', `Security policy updated for ${roleCode}`, 'info');
  };

  const handleSaveTemplates = (e: React.FormEvent) => {
    e.preventDefault();
    addToast('Templates Saved', 'WhatsApp notification gateway templates updated successfully.', 'success');
  };

  const [rbacSubView, setRbacSubView] = useState<'modules' | 'actions'>('modules');

  const ROLE_LIST: { code: UserRole; title: string; description: string; count: number }[] = [
    { code: 'admin', title: 'System Super Administrator', description: 'Full access to all modules, billing, clinical, and administrative configurations.', count: 2 },
    { code: 'ceo', title: 'CEO / Managing Director', description: 'Executive command center, financial analytics, and hospital-wide telemetry.', count: 1 },
    { code: 'doctor', title: 'Doctor / Medical Consultant', description: 'OPD, IPD, appointments, patient directory, clinical notes, and consent management.', count: 24 },
    { code: 'dmo', title: 'Duty Medical Officer (DMO)', description: 'Ward telemetry, emergency triage, IPD/OPD round management, and patient movement.', count: 6 },
    { code: 'nurse', title: 'Nurse / Nursing Supervisor', description: 'Inpatient care, OPD vitals, IPD rounds, bed management telemetry, and patient transfer.', count: 38 },
    { code: 'emergency', title: 'Emergency Bay Lead / Trauma', description: 'Acute trauma bay, emergency triage, resuscitation, and rapid IPD admissions.', count: 12 },
    { code: 'ward_manager', title: 'Bed-Manager / Central Bureau', description: 'IPD bed allocations, ward transfers, housekeeping coordination, and census metrics.', count: 5 },
    { code: 'billing', title: 'Billing & Cashier Manager', description: 'Multi-split billing, cash registers, invoice generation, and payment ledgers.', count: 4 },
    { code: 'insurance', title: 'Insurance / TPA Claims Officer', description: 'Pre-auth verification, cashless claim submissions, and denial management.', count: 3 },
    { code: 'housekeeping', title: 'Housekeeping Supervisor', description: 'Sanitation protocols, room readiness, bio-cleaning, and disinfection inspection.', count: 20 },
    { code: 'maintenance', title: 'Facility Maintenance Engineer', description: 'Biomedical assets, oxygen pipelines, HVAC, equipment uptime, and facility repairs.', count: 8 },
    { code: 'receptionist', title: 'Reception & Front Desk', description: 'Walk-in patient registration, OPD tokens, and appointment bookings.', count: 8 },
  ];

  const MODULE_COLUMNS: { id: ModuleType; label: string }[] = [
    { id: 'dashboard', label: 'CEO Dashboard' },
    { id: 'reception', label: 'Reception' },
    { id: 'patients', label: 'Patient Directory' },
    { id: 'appointments', label: 'Appointments' },
    { id: 'opd', label: 'OPD' },
    { id: 'ipd', label: 'IPD' },
    { id: 'bed-management', label: 'Ward & Beds' },
    { id: 'patient-movement', label: 'Movement' },
    { id: 'doctors', label: 'Doctors' },
    { id: 'departments', label: 'Departments' },
    { id: 'billing', label: 'Billing' },
    { id: 'insurance', label: 'Insurance' },
    { id: 'emergency', label: 'Emergency' },
    { id: 'consent-forms', label: 'Consent Forms' },
    { id: 'housekeeping', label: 'Housekeeping' },
    { id: 'pharmacy', label: 'Pharmacy' },
    { id: 'reports', label: 'Reports' },
    { id: 'settings', label: 'Administration' },
  ];

  const renderBadge = (level: PermissionLevel, note?: string) => {
    switch (level) {
      case 'FULL':
        return (
          <span
            title={note || 'Full Access: View, create, edit, delete'}
            className="px-2 py-0.5 text-[9px] font-bold rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 whitespace-nowrap"
          >
            FULL
          </span>
        );
      case 'VIEW':
        return (
          <span
            title={note || 'View Only: Read-only access, actions restricted'}
            className="px-2 py-0.5 text-[9px] font-bold rounded-md bg-blue-500/15 text-blue-400 border border-blue-500/30 whitespace-nowrap"
          >
            VIEW
          </span>
        );
      case 'LIMITED':
        return (
          <span
            title={note || 'Limited Scope: Scoped to specific fields or own department'}
            className="px-2 py-0.5 text-[9px] font-bold rounded-md bg-amber-500/15 text-amber-400 border border-amber-500/30 whitespace-nowrap"
          >
            LIMITED
          </span>
        );
      case 'HIDDEN':
        return (
          <span
            title={note || 'Hidden: No access to this module'}
            className="px-2 py-0.5 text-[9px] font-bold rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20 whitespace-nowrap opacity-70"
          >
            HIDDEN
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              System Governance & Admin Console
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-white mt-1">Administration, User Roles & Master Data</h2>
          <p className="text-xs text-slate-400">
            Role-Based Access Control (RBAC), multi-tenant branch settings, and master tariff matrices.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center p-1 bg-slate-950 rounded-xl border border-slate-800 overflow-x-auto">
          <button
            onClick={() => setActiveTab('rbac')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'rbac' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            User Roles & RBAC
          </button>
          <button
            onClick={() => setActiveTab('departments')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'departments' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Departments Master
          </button>
          <button
            onClick={() => setActiveTab('tariffs')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'tariffs' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Master Tariffs
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'users' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Staff User Accounts ({staffList.length})
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'import' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Bulk Import CSV</span>
          </button>
          <button
            onClick={() => setActiveTab('saas')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'saas' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Multi-Tenant SaaS
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'templates' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            WhatsApp Gateway Alerts
          </button>
        </div>
      </div>

      {/* Tab 1: RBAC Permission Matrix */}
      {activeTab === 'rbac' && (
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-6 h-6 text-cyan-400" />
              <div>
                <h3 className="text-sm font-bold text-slate-100">Role-Based Access Control (RBAC) Security Policy</h3>
                <p className="text-xs text-slate-400">Enforce granular module-level and functional permissions per user role</p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800 self-start">
              <button
                type="button"
                onClick={() => setRbacSubView('modules')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  rbacSubView === 'modules' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Module Access Grid (Anarav OS)
              </button>
              <button
                type="button"
                onClick={() => setRbacSubView('actions')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  rbacSubView === 'actions' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Functional Actions Matrix
              </button>
            </div>
          </div>

          {/* Subview 1: Module Access Matrix */}
          {rbacSubView === 'modules' && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 flex-wrap text-[11px] p-3 rounded-xl bg-slate-950/60 border border-slate-800/60">
                <span className="text-slate-400 font-semibold">Legend:</span>
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 text-[9px] font-bold rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">FULL</span>
                  <span className="text-slate-300">View, create, edit, full operations</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 text-[9px] font-bold rounded-md bg-blue-500/15 text-blue-400 border border-blue-500/30">VIEW</span>
                  <span className="text-slate-300">Read-only view</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 text-[9px] font-bold rounded-md bg-amber-500/15 text-amber-400 border border-amber-500/30">LIMITED</span>
                  <span className="text-slate-300">Scoped / filtered fields</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 text-[9px] font-bold rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20">HIDDEN</span>
                  <span className="text-slate-300">No access</span>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase text-[9px] tracking-wider bg-slate-900/90">
                      <th className="py-3 px-4 sticky left-0 bg-slate-900 z-10 min-w-[200px]">Role / Designation</th>
                      {MODULE_COLUMNS.map((col) => (
                        <th key={col.id} className="py-3 px-2 text-center min-w-[95px] whitespace-nowrap">
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-200">
                    {ROLE_LIST.map((role) => {
                      const roleMatrix = RBAC_MATRIX[role.code] || {};
                      return (
                        <tr key={role.code} className="hover:bg-slate-900/60 transition">
                          <td className="py-3.5 px-4 sticky left-0 bg-slate-950/95 z-10 border-r border-slate-800/50">
                            <div className="font-bold text-slate-100 flex items-center gap-2">
                              <span>{role.title}</span>
                            </div>
                            <div className="font-mono text-[10px] text-cyan-400 uppercase">{role.code} • {role.count} Users</div>
                            <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">{role.description}</div>
                          </td>

                          {MODULE_COLUMNS.map((col) => {
                            const level: PermissionLevel = (roleMatrix as any)[col.id] ?? 'FULL';
                            const note = getPermissionNotes(role.code, col.id);
                            return (
                              <td key={col.id} className="py-3.5 px-2 text-center">
                                {renderBadge(level, note)}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Subview 2: Functional Actions Matrix */}
          {rbacSubView === 'actions' && (
            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[9px] tracking-wider bg-slate-900/90">
                    <th className="py-3 px-4">Role Title & Code</th>
                    <th className="py-3 px-3 text-center">Patient Reg</th>
                    <th className="py-3 px-3 text-center">Write Rx</th>
                    <th className="py-3 px-3 text-center">Bed Transfer</th>
                    <th className="py-3 px-3 text-center">Process Pay</th>
                    <th className="py-3 px-3 text-center">Apply Discount</th>
                    <th className="py-3 px-3 text-center">TPA Pre-Auth</th>
                    <th className="py-3 px-3 text-center">Financials</th>
                    <th className="py-3 px-3 text-center">Tariffs</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {roles.map((role) => (
                    <tr key={role.roleCode} className="hover:bg-slate-900/60 transition">
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-bold text-slate-100">{role.roleName}</div>
                        <div className="font-mono text-[10px] text-cyan-400">{role.roleCode} • {role.userCount} Users</div>
                        <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">{role.description}</div>
                      </td>

                      {(Object.keys(role.permissions) as (keyof RolePermission['permissions'])[]).map((permKey) => {
                        const hasPerm = role.permissions[permKey];
                        return (
                          <td key={permKey} className="py-3.5 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => togglePermission(role.roleCode, permKey)}
                              className={`p-1.5 rounded-lg border transition ${
                                hasPerm
                                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/30'
                                  : 'bg-slate-900 text-slate-600 border-slate-800 hover:text-slate-400'
                              }`}
                            >
                              {hasPerm ? <Check className="w-3.5 h-3.5" /> : <XIcon className="w-3.5 h-3.5" />}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Departments Master */}
      {activeTab === 'departments' && (
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-cyan-400" />
              <h3 className="text-sm font-bold text-slate-100">Hospital Departments Master Register</h3>
            </div>
            <button
              onClick={() => addToast('Department Added', 'New specialty division registered.', 'success')}
              className="px-3 py-1.5 rounded-xl bg-cyan-600 text-white text-xs font-bold"
            >
              + Add Department
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex justify-between font-bold text-slate-100">
                <span>Cardiology & Cardiac Surgery (CARD)</span>
                <span className="text-cyan-400 font-mono">OPD Room: 101</span>
              </div>
              <div className="text-slate-400">Head: Dr. Vikram Reddy • Beds: 45</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex justify-between font-bold text-slate-100">
                <span>Neurology & Neurosurgery (NEUR)</span>
                <span className="text-cyan-400 font-mono">OPD Room: 104</span>
              </div>
              <div className="text-slate-400">Head: Dr. Ananya Swaminathan • Beds: 30</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex justify-between font-bold text-slate-100">
                <span>Orthopedics & Joint Replacement (ORTH)</span>
                <span className="text-cyan-400 font-mono">OPD Room: 202</span>
              </div>
              <div className="text-slate-400">Head: Dr. Rajeshwar Rao • Beds: 50</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex justify-between font-bold text-slate-100">
                <span>Emergency & Trauma Critical Care (EMER)</span>
                <span className="text-rose-400 font-mono">Bay 1-6</span>
              </div>
              <div className="text-slate-400">Head: Dr. Sameer Khan • Resuscitation Beds: 25</div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Tariffs & Rules */}
      {activeTab === 'tariffs' && (
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-4 max-w-3xl">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-slate-100">Configurable Tariff Master Data & Rule Engine</h3>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
              <div>
                <div className="font-bold text-slate-200">Standard OPD Consultation Fee</div>
                <div className="text-[10px] text-slate-400">Normal Walk-in Queue Model</div>
              </div>
              <span className="font-bold text-cyan-400 font-mono text-sm">₹300 - ₹500</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
              <div>
                <div className="font-bold text-slate-200">Premium Time Slot Consultation Fee</div>
                <div className="text-[10px] text-slate-400">Fixed 10-Min Reservation Model</div>
              </div>
              <span className="font-bold text-purple-400 font-mono text-sm">₹400 - ₹850</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
              <div>
                <div className="font-bold text-slate-200">15-Day OP Consultation Return Validity</div>
                <div className="text-[10px] text-slate-400">Automatic Fee Waiver Threshold Engine</div>
              </div>
              <span className="font-bold text-emerald-400 font-mono text-sm">15 Days Active</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
              <div>
                <div className="font-bold text-slate-200">ICU Suite Daily Tariff</div>
                <div className="text-[10px] text-slate-400">Includes Cardiac & Neuro Monitoring Line</div>
              </div>
              <span className="font-bold text-slate-100 font-mono text-sm">₹7,500 / day</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Staff User Accounts (Full Personnel & Doctor Roster) */}
      {activeTab === 'users' && (
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-cyan-400" />
              <div>
                <h3 className="text-sm font-bold text-slate-100">Staff Accounts & User Provisioning ({staffList.length})</h3>
                <p className="text-xs text-slate-400">All Doctor profiles, Medical Officers, Clinical Staff, and Administrative Users</p>
              </div>
            </div>
            <button
              onClick={() => addToast('User Account Provisioning', 'New staff member registered to system identity store.', 'success')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md self-start"
            >
              <UserPlus className="w-4 h-4" /> Register Staff User
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[9px] tracking-wider bg-slate-900/90">
                  <th className="py-3 px-4">Staff Name & Title</th>
                  <th className="py-3 px-3">Role Code</th>
                  <th className="py-3 px-3">Official Email</th>
                  <th className="py-3 px-3">Account Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {staffList.map((stf) => (
                  <tr key={stf.id} className="hover:bg-slate-900/60 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white">{stf.name}</div>
                      <div className="text-[10px] text-slate-400">{stf.title}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-mono uppercase">
                        {stf.roleCode}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-300">{stf.email}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {stf.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => addToast('Profile Modified', `Updated account credentials for ${stf.name}`, 'info')}
                          className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-[11px] font-semibold border border-slate-800 transition"
                        >
                          Modify
                        </button>
                        <button
                          onClick={() => {
                            setStaffList((prev) => prev.filter((s) => s.id !== stf.id));
                            addToast('Account Revoked', `De-provisioned ${stf.name} from hospital directory`, 'warning');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-[11px] font-semibold border border-rose-500/30 transition"
                        >
                          Revoke
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Bulk Import Legacy Hospital Data */}
      {activeTab === 'import' && (
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">Bulk Data Importer & Legacy Migration Engine</h3>
                <p className="text-xs text-slate-400">
                  Upload CSV files or paste legacy records for persistent hospital-wide database synchronization.
                </p>
              </div>
            </div>

            {/* Persistent Database Counts Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300">
                Patients: <strong className="text-cyan-400">{importedCounts.patients + 24}</strong>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300">
                Doctors: <strong className="text-cyan-400">{importedCounts.doctors + 12}</strong>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300">
                Accounts: <strong className="text-cyan-400">{staffList.length}</strong>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300">
                Tariffs: <strong className="text-cyan-400">{importedCounts.tariffs + 35}</strong>
              </span>
            </div>
          </div>

          {/* Import Channel Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { id: 'patients', label: 'Patients Master', desc: 'Demographics, UHIDs, phone & blood groups', count: importedCounts.patients },
              { id: 'doctors', label: 'Doctors & Schedules', desc: 'Specialties, OPD rooms & tariffs', count: importedCounts.doctors },
              { id: 'accounts', label: 'Staff & User Accounts', desc: 'Roles, logins, units & designations', count: staffList.length },
              { id: 'tariffs', label: 'Master Charge Tariffs', desc: 'Procedures, bed tariffs & lab rates', count: importedCounts.tariffs },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setImportType(cat.id as any);
                  setParsedPreview([]);
                  setRawCsvText('');
                  setImportFileName('');
                }}
                className={`p-4 rounded-xl text-left border transition flex flex-col justify-between space-y-2 ${
                  importType === cat.id
                    ? 'bg-cyan-500/10 border-cyan-500/50 shadow-md shadow-cyan-500/10'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white flex items-center gap-1.5">
                    <FileSpreadsheet className={`w-4 h-4 ${importType === cat.id ? 'text-cyan-400' : 'text-slate-400'}`} />
                    {cat.label}
                  </span>
                  {importType === cat.id && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                </div>
                <p className="text-[11px] text-slate-400">{cat.desc}</p>
              </button>
            ))}
          </div>

          {/* Upload & CSV Action Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-slate-950 p-5 rounded-2xl border border-slate-800">
            {/* Left: File Uploader */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <UploadCloud className="w-4 h-4 text-cyan-400" />
                  1. Choose / Drop CSV File
                </label>
                <button
                  type="button"
                  onClick={() => handleDownloadSampleCsv(importType)}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 text-[11px] font-semibold border border-slate-800 flex items-center gap-1 transition"
                >
                  <Download className="w-3 h-3" />
                  <span>Download Sample {importType}.csv</span>
                </button>
              </div>

              <div className="border-2 border-dashed border-slate-800 hover:border-cyan-500/50 rounded-xl p-6 text-center transition bg-slate-900/40">
                <input
                  type="file"
                  id="csv-file-input"
                  accept=".csv, .txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label htmlFor="csv-file-input" className="cursor-pointer block space-y-2">
                  <FileText className="w-8 h-8 text-cyan-400 mx-auto" />
                  <div className="text-xs font-semibold text-slate-300">
                    {importFileName ? (
                      <span className="text-cyan-300 font-bold">Selected: {importFileName}</span>
                    ) : (
                      <span>Click to browse or drag & drop {importType}.csv here</span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500">Supports standard comma-delimited UTF-8 CSV files</p>
                </label>
              </div>
            </div>

            {/* Right: Direct Raw Textarea / Preview */}
            <div className="space-y-4">
              <label className="text-xs font-bold text-slate-200 uppercase tracking-wider block">
                2. Or Paste Raw Comma-Separated Data
              </label>

              <textarea
                rows={4}
                value={rawCsvText}
                placeholder={getSampleCsv(importType)}
                onChange={(e) => {
                  setRawCsvText(e.target.value);
                  const parsed = parseCsvText(e.target.value);
                  setParsedPreview(parsed);
                }}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-[11px] text-slate-200 focus:outline-none focus:border-cyan-500 font-mono leading-relaxed"
              />

              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-400">
                  Parsed Records: <strong className="text-cyan-400">{parsedPreview.length}</strong>
                </div>
                <button
                  type="button"
                  onClick={handleCommitImport}
                  disabled={parsedPreview.length === 0}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-cyan-600/30 disabled:opacity-40 transition active:scale-95 flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Commit & Persist {parsedPreview.length} Records</span>
                </button>
              </div>
            </div>
          </div>

          {/* Parsed Data Preview Table */}
          {parsedPreview.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Validation Preview ({parsedPreview.length} Records Ready for Commit)
                </h4>
              </div>

              <div className="rounded-xl border border-slate-800 overflow-x-auto bg-slate-950">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 text-[10px] uppercase tracking-wider">
                    <tr>
                      <th className="p-3">#</th>
                      {Object.keys(parsedPreview[0])
                        .filter((k) => !k.startsWith('_'))
                        .map((key) => (
                          <th key={key} className="p-3">
                            {key}
                          </th>
                        ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                    {parsedPreview.slice(0, 8).map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-900/40">
                        <td className="p-3 text-slate-500">{rIdx + 1}</td>
                        {Object.keys(row)
                          .filter((k) => !k.startsWith('_'))
                          .map((key) => (
                            <td key={key} className="p-3 text-slate-200 font-sans">
                              {row[key]}
                            </td>
                          ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Multi-Tenant SaaS */}
      {activeTab === 'saas' && (
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-6 max-w-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building className="w-6 h-6 text-cyan-400" />
              <div>
                <h3 className="text-sm font-bold text-slate-100">{activeTenant.name}</h3>
                <p className="text-xs text-slate-400">Tenant Code: {activeTenant.code} • Multi-Tenant SaaS Isolation</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsAddBranchModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 text-white font-extrabold text-xs shadow-md shadow-cyan-950/50 transition flex items-center gap-1.5"
            >
              <span>+ Register New Branch / Campus</span>
            </button>
          </div>

          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Registered Hospital Branches</h4>
            <div className="space-y-2">
              {activeTenant.branches.map((b) => (
                <div
                  key={b.id}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-100">{b.name}</div>
                    <div className="text-[10px] text-slate-400">City: {b.city}</div>
                  </div>
                  {b.isMainBranch && (
                    <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold text-[10px]">
                      Headquarters / Main Campus
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Add Branch Modal */}
          {isAddBranchModalOpen && (
            <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
              <div className="w-full max-w-md bg-slate-900 border border-cyan-500/40 rounded-2xl p-6 shadow-2xl space-y-4 font-sans text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2 text-cyan-300 font-bold">
                    <Building className="w-5 h-5 text-cyan-400" />
                    <span>Register New Hospital Branch / Campus</span>
                  </div>
                  <button onClick={() => setIsAddBranchModalOpen(false)} className="text-slate-400 hover:text-white">
                    ✕
                  </button>
                </div>

                <form onSubmit={handleAddBranchSubmit} className="space-y-4">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Branch / Campus Name *</label>
                    <input
                      type="text"
                      value={newBranchName}
                      onChange={(e) => setNewBranchName(e.target.value)}
                      placeholder="e.g. Bhaskar Reddy Cancer Institute (Guntur Branch)"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-bold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">City / Location *</label>
                    <input
                      type="text"
                      value={newBranchCity}
                      onChange={(e) => setNewBranchCity(e.target.value)}
                      placeholder="e.g. Guntur"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                      required
                    />
                  </div>

                  <div className="flex items-center gap-2 p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <input
                      type="checkbox"
                      id="isMainBranchCheck"
                      checked={newBranchIsMain}
                      onChange={(e) => setNewBranchIsMain(e.target.checked)}
                      className="w-4 h-4 rounded text-cyan-500"
                    />
                    <label htmlFor="isMainBranchCheck" className="text-slate-300 text-xs font-semibold cursor-pointer">
                      Mark as Main Headquarters Campus
                    </label>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setIsAddBranchModalOpen(false)}
                      className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 text-white font-extrabold shadow-lg shadow-cyan-950/50"
                    >
                      Save Branch
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Templates */}
      {activeTab === 'templates' && (
        <form onSubmit={handleSaveTemplates} className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-4 max-w-3xl">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-100">WhatsApp Gateway Notification Templates</h3>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              WhatsApp API Gateway Template
            </label>
            <textarea
              rows={4}
              value={whatsappTemplate}
              onChange={(e) => setWhatsappTemplate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-md"
          >
            Save WhatsApp Template
          </button>
        </form>
      )}
    </div>
  );
};

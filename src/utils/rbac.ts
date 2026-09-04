import type { ModuleType, UserRole, PermissionLevel } from '../types';
export type { PermissionLevel };

export interface PermissionDetails {
  level: PermissionLevel;
  description: string;
  notes?: string;
}

/**
 * Enterprise RBAC Policy Matrix
 * FULL    – Full access (view, create, edit, all operations)
 * VIEW    – View only (read-only views, create/edit buttons disabled or hidden)
 * LIMITED – Filtered scope / restricted sub-actions (e.g. own department, own patients)
 * HIDDEN  – Completely hidden and inaccessible
 */
export const RBAC_MATRIX: Record<UserRole, Record<ModuleType, PermissionLevel>> = {
  // 1. Admin: FULL access to everything
  admin: {
    dashboard: 'FULL',
    reception: 'FULL',
    patients: 'FULL',
    appointments: 'FULL',
    opd: 'FULL',
    ipd: 'FULL',
    'bed-management': 'FULL',
    'patient-movement': 'FULL',
    doctors: 'FULL',
    departments: 'FULL',
    billing: 'FULL',
    insurance: 'FULL',
    emergency: 'FULL',
    'consent-forms': 'FULL',
    housekeeping: 'FULL',
    pharmacy: 'FULL',
    reports: 'FULL',
    settings: 'FULL',
  },

  // 2. CEO: Dashboard (Full), Reports (Full), Administration (Limited), Remaining (View)
  ceo: {
    dashboard: 'FULL',
    reports: 'FULL',
    settings: 'LIMITED',
    reception: 'HIDDEN',
    patients: 'VIEW',
    appointments: 'VIEW',
    opd: 'VIEW',
    ipd: 'VIEW',
    'bed-management': 'VIEW',
    'patient-movement': 'VIEW',
    doctors: 'VIEW',
    departments: 'VIEW',
    billing: 'VIEW',
    insurance: 'VIEW',
    emergency: 'VIEW',
    'consent-forms': 'VIEW',
    housekeeping: 'VIEW',
    pharmacy: 'VIEW',
  },

  // 3. Doctors:
  // Hidden: CEO Dashboard, Billing, Housekeeping, Administration, Reception & Queue, Insurance / TPA
  // Full: Consent Forms, Doctors & Schedules, Patient Movement, IPD, OPD, Appointments, Patient Directory
  // View: Wards & Beds, Emergency, Pharmacy
  // Limited: Reports (Own patient/department), Departments (Own department)
  doctor: {
    dashboard: 'HIDDEN',
    billing: 'HIDDEN',
    housekeeping: 'HIDDEN',
    settings: 'HIDDEN',
    reception: 'HIDDEN',
    insurance: 'HIDDEN',
    'consent-forms': 'FULL',
    doctors: 'FULL',
    'patient-movement': 'FULL',
    ipd: 'FULL',
    opd: 'FULL',
    appointments: 'FULL',
    patients: 'FULL',
    'bed-management': 'VIEW',
    emergency: 'FULL',
    pharmacy: 'VIEW',
    reports: 'LIMITED',
    departments: 'LIMITED',
  },

  // 4. DMO (Duty Medical Officer):
  // Full: Patient Directory, OPD & Follow-up, IPD Admissions, Patient Movement, Consent Forms
  // View: Doctors & Schedules, Departments, Emergency, Pharmacy
  // Limited: Appointments, Ward & Beds, Reports & Analysis
  // Hidden: CEO Dashboard, Billing & Cash, Housekeeping, Administration, Reception & Queue, Insurance / TPA
  dmo: {
    patients: 'FULL',
    opd: 'FULL',
    ipd: 'FULL',
    'patient-movement': 'FULL',
    'consent-forms': 'FULL',
    emergency: 'FULL',
    reception: 'HIDDEN',
    insurance: 'HIDDEN',
    doctors: 'VIEW',
    departments: 'VIEW',
    pharmacy: 'VIEW',
    appointments: 'LIMITED',
    'bed-management': 'LIMITED',
    reports: 'LIMITED',
    dashboard: 'HIDDEN',
    billing: 'HIDDEN',
    housekeeping: 'HIDDEN',
    settings: 'HIDDEN',
  },

  // 5. Billing Role:
  // Full: Billing & Cash, Insurance / TPA, Reports & Analysis
  // View: Departments
  // Limited: Patient Directory, IPD Admissions, Pharmacy & Medicines
  // Hidden: CEO Dashboard, Reception & Queue, Appointments, OPD & Follow-up, Ward & Beds, Patient Movement, Doctors & Schedules, Consent Forms, Housekeeping, Administration, Emergency Bay
  billing: {
    billing: 'FULL',
    insurance: 'FULL',
    reception: 'HIDDEN',
    departments: 'VIEW',
    emergency: 'HIDDEN',
    patients: 'LIMITED',
    ipd: 'LIMITED',
    pharmacy: 'LIMITED',
    reports: 'FULL',
    dashboard: 'HIDDEN',
    appointments: 'HIDDEN',
    opd: 'HIDDEN',
    'bed-management': 'HIDDEN',
    'patient-movement': 'HIDDEN',
    doctors: 'HIDDEN',
    'consent-forms': 'HIDDEN',
    housekeeping: 'HIDDEN',
    settings: 'HIDDEN',
  },

  // 6. Insurance Role:
  // Full: IPD Admissions, Insurance / TPA
  // View: Ward & Beds, Departments
  // Limited: Patient Directory, OPD & Follow-up, Patient Movement, Billing & Cash, Reports & Analysis
  // Hidden: CEO Dashboard, Reception & Queue, Appointments, Doctors & Schedules, Housekeeping, Administration, Pharmacy, Emergency Bay, Consent Forms
  insurance: {
    ipd: 'FULL',
    insurance: 'FULL',
    'bed-management': 'VIEW',
    departments: 'VIEW',
    emergency: 'HIDDEN',
    patients: 'LIMITED',
    opd: 'LIMITED',
    'patient-movement': 'LIMITED',
    billing: 'LIMITED',
    'consent-forms': 'HIDDEN',
    reports: 'LIMITED',
    dashboard: 'HIDDEN',
    reception: 'HIDDEN',
    appointments: 'HIDDEN',
    doctors: 'HIDDEN',
    housekeeping: 'HIDDEN',
    settings: 'HIDDEN',
    pharmacy: 'HIDDEN',
  },

  // Supporting Roles: Receptionist (Front-Desk, Patient Registration, Emergency Intake & OPD View)
  receptionist: {
    dashboard: 'HIDDEN',
    patients: 'FULL',
    appointments: 'FULL',
    reception: 'FULL',
    emergency: 'FULL',
    opd: 'VIEW',
    ipd: 'LIMITED',
    'bed-management': 'VIEW',
    billing: 'LIMITED',
    insurance: 'HIDDEN',
    'consent-forms': 'VIEW',
    reports: 'LIMITED',
    doctors: 'VIEW',
    departments: 'VIEW',
    'patient-movement': 'HIDDEN',
    pharmacy: 'HIDDEN',
    housekeeping: 'HIDDEN',
    settings: 'HIDDEN',
  },

  // 7. Nurse Role:
  // Full: Patient Directory, OPD & Follow-up, IPD Admissions, Ward & Beds, Patient Movement, Emergency Bay, Consent Forms
  // View: Appointments, Doctors & Schedules, Departments, Pharmacy
  // Limited: Housekeeping, Reports & Analysis
  // Hidden: CEO Dashboard, Billing & Cash, Insurance / TPA, Administration, Reception & Queue
  nurse: {
    patients: 'FULL',
    opd: 'FULL',
    ipd: 'FULL',
    'bed-management': 'FULL',
    'patient-movement': 'FULL',
    emergency: 'FULL',
    'consent-forms': 'FULL',
    reception: 'HIDDEN',
    appointments: 'VIEW',
    doctors: 'VIEW',
    departments: 'VIEW',
    pharmacy: 'VIEW',
    housekeeping: 'LIMITED',
    reports: 'LIMITED',
    dashboard: 'HIDDEN',
    billing: 'HIDDEN',
    insurance: 'HIDDEN',
    settings: 'HIDDEN',
  },

  // 8. Emergency Role:
  // Full: Reception & Queue, Patient Directory, IPD Admissions, Ward & Beds, Patient Movement, Doctors & Schedules, Consent Forms, Emergency
  // View: Departments, Pharmacy
  // Limited: Appointments, OPD & Follow-up, Housekeeping, Reports & Analysis
  // Hidden: CEO Dashboard, Billing & Cash, Administration, Insurance / TPA
  emergency: {
    reception: 'FULL',
    patients: 'FULL',
    ipd: 'FULL',
    'bed-management': 'FULL',
    'patient-movement': 'FULL',
    doctors: 'FULL',
    'consent-forms': 'FULL',
    emergency: 'FULL',
    departments: 'VIEW',
    pharmacy: 'VIEW',
    appointments: 'LIMITED',
    opd: 'LIMITED',
    insurance: 'HIDDEN',
    housekeeping: 'LIMITED',
    reports: 'LIMITED',
    dashboard: 'HIDDEN',
    billing: 'HIDDEN',
    settings: 'HIDDEN',
  },

  // 9. Bed-Manager / Ward Manager Role:
  // Full: IPD Admissions, Ward & Beds, Patient Movement, Departments, Housekeeping, Reports & Analysis
  // View: CEO Dashboard, Doctors & Schedules, Emergency, Consent Forms
  // Limited: Patient Directory, Administration
  // Hidden: Appointments, OPD & Follow-up, Billing & Cash, Insurance / TPA, Pharmacy, Reception & Queue
  ward_manager: {
    ipd: 'FULL',
    'bed-management': 'FULL',
    'patient-movement': 'FULL',
    departments: 'FULL',
    housekeeping: 'FULL',
    reports: 'FULL',
    dashboard: 'VIEW',
    reception: 'HIDDEN',
    doctors: 'VIEW',
    emergency: 'VIEW',
    'consent-forms': 'VIEW',
    patients: 'LIMITED',
    settings: 'LIMITED',
    appointments: 'HIDDEN',
    opd: 'HIDDEN',
    billing: 'HIDDEN',
    insurance: 'HIDDEN',
    pharmacy: 'HIDDEN',
  },

  // 10. Housekeeping Role:
  // Full: Housekeeping
  // View: Departments
  // Limited: Ward & Beds, Patient Movement, Reports & Analysis
  // Hidden: CEO Dashboard, Reception & Queue, Patient Directory, Appointments, OPD & Follow-up, IPD Admissions, Doctors & Schedules, Billing & Cash, Insurance / TPA, Emergency, Consent Forms, Administration, Pharmacy
  housekeeping: {
    housekeeping: 'FULL',
    departments: 'VIEW',
    'bed-management': 'LIMITED',
    'patient-movement': 'LIMITED',
    reports: 'LIMITED',
    dashboard: 'HIDDEN',
    reception: 'HIDDEN',
    patients: 'HIDDEN',
    appointments: 'HIDDEN',
    opd: 'HIDDEN',
    ipd: 'HIDDEN',
    doctors: 'HIDDEN',
    billing: 'HIDDEN',
    insurance: 'HIDDEN',
    emergency: 'HIDDEN',
    'consent-forms': 'HIDDEN',
    settings: 'HIDDEN',
    pharmacy: 'HIDDEN',
  },

  // 11. Maintenance Role:
  // Full: Housekeeping (Facility Maintenance & Equipment Readiness)
  // View: CEO Dashboard, Departments
  // Limited: Ward & Beds, Housekeeping, Reports & Analysis, Administration
  // Hidden: Reception & Queue, Patient Directory, Appointments, OPD & Follow-up, IPD Admissions, Patient Movement, Doctors & Schedules, Billing & Cash, Insurance / TPA, Emergency, Consent Forms, Pharmacy
  maintenance: {
    housekeeping: 'FULL',
    dashboard: 'VIEW',
    departments: 'VIEW',
    'bed-management': 'LIMITED',
    reports: 'LIMITED',
    settings: 'LIMITED',
    reception: 'HIDDEN',
    patients: 'HIDDEN',
    appointments: 'HIDDEN',
    opd: 'HIDDEN',
    ipd: 'HIDDEN',
    'patient-movement': 'HIDDEN',
    doctors: 'HIDDEN',
    billing: 'HIDDEN',
    insurance: 'HIDDEN',
    emergency: 'HIDDEN',
    'consent-forms': 'HIDDEN',
    pharmacy: 'HIDDEN',
  },

  // 12. Pharmacist / Pharmacy Role:
  // Full: Pharmacy & Drug Dispensing
  // View: Doctors & Schedules, Departments
  // Limited: Patient Directory, OPD & Follow-up, IPD Admissions, Billing & Cash, Reports & Analysis
  // Hidden: CEO Dashboard, Reception & Queue, Appointments, Ward & Beds, Patient Movement, Insurance / TPA, Consent Forms, Housekeeping, Administration
  pharmacist: {
    pharmacy: 'FULL',
    doctors: 'VIEW',
    departments: 'VIEW',
    patients: 'LIMITED',
    opd: 'LIMITED',
    ipd: 'LIMITED',
    billing: 'LIMITED',
    reports: 'LIMITED',
    dashboard: 'HIDDEN',
    reception: 'HIDDEN',
    appointments: 'HIDDEN',
    'bed-management': 'HIDDEN',
    'patient-movement': 'HIDDEN',
    insurance: 'HIDDEN',
    'consent-forms': 'HIDDEN',
    housekeeping: 'HIDDEN',
    settings: 'HIDDEN',
    emergency: 'HIDDEN',
  },

  // 13. Lab Lead / Pathologist Role:
  // Full: Laboratory / Diagnostics, Reports & Analysis
  // View: Appointments, Doctors & Schedules, Departments
  // Limited: Patient Directory, OPD & Follow-up, IPD Admissions, Consent Forms
  // Hidden: CEO Dashboard, Administration, Ward & Beds, Patient Movement, Billing & Cash, Insurance / TPA, Housekeeping, Emergency, Pharmacy, Reception & Queue
  lab: {
    reports: 'FULL',
    reception: 'HIDDEN',
    appointments: 'VIEW',
    doctors: 'VIEW',
    departments: 'VIEW',
    patients: 'LIMITED',
    opd: 'LIMITED',
    ipd: 'LIMITED',
    'consent-forms': 'LIMITED',
    dashboard: 'HIDDEN',
    settings: 'HIDDEN',
    'bed-management': 'HIDDEN',
    'patient-movement': 'HIDDEN',
    billing: 'HIDDEN',
    insurance: 'HIDDEN',
    housekeeping: 'HIDDEN',
    emergency: 'HIDDEN',
    pharmacy: 'HIDDEN',
  },

  hr: {
    doctors: 'FULL',
    departments: 'FULL',
    reports: 'LIMITED',
    settings: 'LIMITED',
    dashboard: 'HIDDEN',
    reception: 'HIDDEN',
    patients: 'HIDDEN',
    appointments: 'HIDDEN',
    opd: 'HIDDEN',
    ipd: 'HIDDEN',
    'bed-management': 'HIDDEN',
    'patient-movement': 'HIDDEN',
    billing: 'HIDDEN',
    insurance: 'HIDDEN',
    emergency: 'HIDDEN',
    'consent-forms': 'HIDDEN',
    housekeeping: 'HIDDEN',
    pharmacy: 'HIDDEN',
  },
};

/**
 * Gets the permission level for a specific role and module
 */
export const getRoleModulePermission = (role?: UserRole | null, module?: ModuleType): PermissionLevel => {
  if (!role || !module) return 'FULL';
  const roleRules = RBAC_MATRIX[role];
  if (!roleRules) return 'FULL';
  return roleRules[module] ?? 'FULL';
};

/**
 * Checks if a module is hidden for a role
 */
export const isModuleHidden = (role?: UserRole | null, module?: ModuleType): boolean => {
  return getRoleModulePermission(role, module) === 'HIDDEN';
};

/**
 * Checks if a module is read-only for a role
 */
export const isModuleReadOnly = (role?: UserRole | null, module?: ModuleType): boolean => {
  return getRoleModulePermission(role, module) === 'VIEW';
};

/**
 * Checks if a module has limited/filtered scope for a role
 */
export const isModuleLimited = (role?: UserRole | null, module?: ModuleType): boolean => {
  return getRoleModulePermission(role, module) === 'LIMITED';
};

/**
 * Gets all modules accessible (not HIDDEN) to a specific role
 */
export const getAccessibleModules = (role?: UserRole | null): ModuleType[] => {
  if (!role) return [];
  const roleRules = RBAC_MATRIX[role];
  if (!roleRules) return [];
  return (Object.keys(roleRules) as ModuleType[]).filter(
    (mod) => roleRules[mod] !== 'HIDDEN'
  );
};

/**
 * Human-readable restriction explanation
 */
export const getPermissionNotes = (role?: UserRole | null, module?: ModuleType): string => {
  if (!role || !module) return '';
  const level = getRoleModulePermission(role, module);
  
  if (level === 'HIDDEN') return 'Access restricted by system security policy.';
  if (level === 'VIEW') return 'Read-only view mode. Record creation, editing, and destructive actions are restricted.';
  
  if (level === 'LIMITED') {
    if (role === 'doctor') {
      if (module === 'reports') return 'Filtered to own assigned patients and department cases.';
      if (module === 'departments') return 'Filtered to own assigned clinical department.';
      if (module === 'insurance') return 'Pre-authorization and clinical notes only.';
    }
    if (role === 'dmo') {
      if (module === 'appointments') return 'Emergency token allocation & queue oversight only.';
      if (module === 'bed-management') return 'Bed status inspection & transfer authorization.';
      if (module === 'insurance') return 'Medical necessity certificates only.';
      if (module === 'reports') return 'Clinical duty summaries & shift handover logs.';
    }
    if (role === 'billing') {
      if (module === 'patients') return 'Patient demographic & payer billing info only.';
      if (module === 'ipd') return 'Discharge clearance & provisional tariff view only.';
      if (module === 'reports') return 'Revenue collections & payment reconciliations.';
    }
    if (role === 'insurance') {
      if (module === 'patients') return 'Policy coverage & policyholder ID verification.';
      if (module === 'opd') return 'OPD claim vouchers only.';
      if (module === 'patient-movement') return 'Admission timestamp validation.';
      if (module === 'billing') return 'Claim bill items & co-pay summaries.';
      if (module === 'consent-forms') return 'TPA cashless consent declarations.';
      if (module === 'reports') return 'Claims TAT & denial trend analysis.';
    }
    if (role === 'receptionist') {
      if (module === 'patients') return 'Patient demographic registration, contact details & MRN only. Sensitive clinical diagnoses & prescriptions are restricted.';
      if (module === 'ipd') return 'Admission request initiation & patient coordination only. Clinical ward management is restricted.';
      if (module === 'billing') return 'OP consultation billing, registration charges, advance receipt collection & invoice printing only.';
      if (module === 'insurance') return 'Patient insurance card verification and pre-auth intake initiation only.';
      if (module === 'reports') return 'Daily patient footfall, token analytics & counter collection reports only.';
    }
    if (role === 'nurse') {
      if (module === 'consent-forms') return 'Nursing care procedure consent witnessing only.';
      if (module === 'housekeeping') return 'Ward cleanliness & bed turnover requests.';
      if (module === 'reports') return 'Shift nursing vitals & medication administration logs.';
    }
    if (role === 'emergency') {
      if (module === 'appointments') return 'Emergency direct triage tokens only.';
      if (module === 'opd') return 'Trauma follow-up referrals only.';
      if (module === 'insurance') return 'Emergency cashless intimation notes.';
      if (module === 'housekeeping') return 'Trauma bay sanitation alerts.';
      if (module === 'reports') return 'Triage time-to-treatment & resuscitation metrics.';
    }
    if (role === 'ward_manager') {
      if (module === 'patients') return 'IPD inpatient demographic & bed occupancy info.';
      if (module === 'settings') return 'Ward configuration & bed tariff inspection.';
    }
    if (role === 'housekeeping') {
      if (module === 'bed-management') return 'Room turnover & disinfection status updates only.';
      if (module === 'patient-movement') return 'Discharged patient room clearance alerts.';
      if (module === 'reports') return 'Sanitization turnaround times & hygiene audits.';
    }
    if (role === 'maintenance') {
      if (module === 'bed-management') return 'Biomedical bed & oxygen port maintenance.';
      if (module === 'housekeeping') return 'Facility & engineering maintenance tickets.';
      if (module === 'reports') return 'Equipment uptime & breakdown resolution logs.';
      if (module === 'settings') return 'Facility maintenance schedules & asset registers.';
    }
    if (role === 'pharmacist') {
      if (module === 'patients') return 'Patient medication history & prescription dispensing lookup only.';
      if (module === 'opd') return 'OPD prescription items & dosage regimens only.';
      if (module === 'ipd') return 'Inpatient drug charts & floor pharmacy indents only.';
      if (module === 'billing') return 'Pharmacy sales invoices & OTC drug billing.';
      if (module === 'reports') return 'Drug consumption, stock inventory & expiry reports.';
    }
    if (role === 'lab') {
      if (module === 'patients') return 'Patient specimen identity & diagnostic test order lookup.';
      if (module === 'opd') return 'OPD diagnostic investigation orders only.';
      if (module === 'ipd') return 'Inpatient lab orders & critical value flags.';
      if (module === 'consent-forms') return 'High-risk diagnostic & biopsy consent forms.';
      if (module === 'settings') return 'Diagnostic test master catalogue & reference range inspection.';
    }
    if (role === 'ceo' && module === 'settings') {
      return 'High-level audit logs & organizational configuration view.';
    }
    return 'Scoped access with specific operational limitations.';
  }
  
  return 'Full administrative access.';
};

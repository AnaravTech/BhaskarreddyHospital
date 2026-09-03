import { Dashboard } from '../pages/Dashboard';
import { Reception } from '../pages/Reception';
import { Patients } from '../pages/Patients';
import { Appointments } from '../pages/Appointments';
import { OPD } from '../pages/OPD';
import { IPD } from '../pages/IPD';
import { WardsBeds } from '../pages/WardsBeds';
import { Doctors } from '../pages/Doctors';
import { Billing } from '../pages/Billing';
import { Insurance } from '../pages/Insurance';
import { Pharmacy } from '../pages/Pharmacy';
import { Laboratory } from '../pages/Laboratory';
import { Emergency } from '../pages/Emergency';
import { Housekeeping } from '../pages/Housekeeping';
import { Administration } from '../pages/Administration';
import { Departments } from '../pages/Departments';
import { Reports } from '../pages/Reports';
import { ConsentForms } from '../pages/ConsentForms';
import { PatientMovement } from '../pages/PatientMovement';

/**
 * Centralized Route Registry for Bhaskar Reddy Hospital OS
 */
export const ROUTES = [
  {
    id: 'dashboard',
    path: '/dashboard',
    label: 'CEO Dashboard',
    component: Dashboard,
    category: 'executive',
  },
  {
    id: 'reception',
    path: '/reception',
    label: 'Reception & Queue',
    component: Reception,
    category: 'front-desk',
  },
  {
    id: 'patients',
    path: '/patients',
    label: 'Patient Directory',
    component: Patients,
    category: 'clinical',
  },
  {
    id: 'appointments',
    path: '/appointments',
    label: 'Appointments',
    component: Appointments,
    category: 'scheduling',
  },
  {
    id: 'opd',
    path: '/opd',
    label: 'OPD & Follow-up',
    component: OPD,
    category: 'clinical',
  },
  {
    id: 'ipd',
    path: '/ipd',
    label: 'IPD Admissions',
    component: IPD,
    category: 'clinical',
  },
  {
    id: 'wards-beds',
    aliasIds: ['bed-management'],
    path: '/wards-beds',
    label: 'Ward & Beds',
    component: WardsBeds,
    category: 'inpatient',
  },
  {
    id: 'doctors',
    path: '/doctors',
    label: 'Doctors & Schedule',
    component: Doctors,
    category: 'staff',
  },
  {
    id: 'billing',
    path: '/billing',
    label: 'Billing & Cash',
    component: Billing,
    category: 'finance',
  },
  {
    id: 'insurance',
    path: '/insurance',
    label: 'Insurance / TPA',
    component: Insurance,
    category: 'finance',
  },
  {
    id: 'pharmacy',
    path: '/pharmacy',
    label: 'Pharmacy & Meds',
    component: Pharmacy,
    category: 'dispensary',
  },
  {
    id: 'laboratory',
    path: '/laboratory',
    label: 'Lab & Diagnostics',
    component: Laboratory,
    category: 'diagnostics',
  },
  {
    id: 'emergency',
    path: '/emergency',
    label: 'Emergency Bay',
    component: Emergency,
    category: 'critical-care',
    isHot: true,
  },
  {
    id: 'housekeeping',
    path: '/housekeeping',
    label: 'Housekeeping & Sanitation',
    component: Housekeeping,
    category: 'operations',
  },
  {
    id: 'administration',
    aliasIds: ['settings'],
    path: '/administration',
    label: 'Administration & Settings',
    component: Administration,
    category: 'system',
  },
  {
    id: 'departments',
    path: '/departments',
    label: 'Departments',
    component: Departments,
    category: 'administrative',
  },
  {
    id: 'reports',
    path: '/reports',
    label: 'Reports & Analytics',
    component: Reports,
    category: 'analytics',
  },
  {
    id: 'consent-forms',
    path: '/consent-forms',
    label: 'Consent Forms',
    component: ConsentForms,
    category: 'legal',
  },
  {
    id: 'patient-movement',
    path: '/patient-movement',
    label: 'Patient Movement',
    component: PatientMovement,
    category: 'operations',
  },
];

export const getRouteByModuleId = (moduleId) => {
  return (
    ROUTES.find((r) => r.id === moduleId || (r.aliasIds && r.aliasIds.includes(moduleId))) ||
    ROUTES[0]
  );
};

export default ROUTES;

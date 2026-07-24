export type ModuleType =
  | 'dashboard'
  | 'reception'
  | 'patients'
  | 'appointments'
  | 'opd'
  | 'ipd'
  | 'dmo-desk'
  | 'nursing-station'
  | 'bed-management'
  | 'patient-movement'
  | 'pharmacy'
  | 'diagnostics'
  | 'operation-theatre'
  | 'discharge-summary'
  | 'doctors'
  | 'departments'
  | 'billing'
  | 'insurance'
  | 'emergency'
  | 'consent-forms'
  | 'housekeeping'
  | 'maintenance'
  | 'reports'
  | 'settings';

export type AppMode = 'hospital-os' | 'public-website' | 'website-cms';

export type UserRole =
  | 'admin'
  | 'ceo'
  | 'doctor'
  | 'dmo'
  | 'receptionist'
  | 'billing'
  | 'insurance'
  | 'nurse'
  | 'emergency'
  | 'bed-manager'
  | 'housekeeping-sup'
  | 'maintenance';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleTitle: string;
  avatar: string;
  department?: string;
  defaultModule: ModuleType;
}

export interface HospitalTenant {
  id: string;
  name: string;
  code: string;
  logo: string;
  branches: Branch[];
}

export interface Branch {
  id: string;
  name: string;
  city: string;
  isMainBranch: boolean;
}

export interface Patient {
  id: string;
  uhid: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  email: string;
  bloodGroup: string;
  address: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  allergies: string[];
  medicalHistory: string[];
  registeredDate: string;
  lastVisitDate: string;
  opValidityEndDate: string; // 15-day OP rule calculation
  insuranceProvider?: string;
  policyNumber?: string;
  totalVisits: number;
  status: 'Active' | 'Admitted' | 'Discharged';
}

export interface Doctor {
  id: string;
  name: string;
  qualification: string;
  departmentId: string;
  departmentName: string;
  specialization: string;
  consultationFee: number;
  premiumFee: number;
  availabilityDays: string[];
  workingHours: string;
  maxPatientsPerDay: number;
  image: string;
  rating: number;
  experienceYears: number;
  status: 'On Duty' | 'In Surgery' | 'On Leave' | 'Off Duty';
}

export interface Department {
  id: string;
  name: string;
  code: string;
  headDoctor: string;
  opdRoom: string;
  totalBeds: number;
  activeDoctorsCount: number;
  description?: string;
  services?: string[];
}

export type AppointmentModel = 'Premium Slot' | 'Normal Queue';

export interface Appointment {
  id: string;
  tokenNumber: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  patientAge: number;
  patientGender: string;
  doctorId: string;
  doctorName: string;
  departmentName: string;
  appointmentDate: string;
  appointmentTime: string; // e.g. "10:20 AM"
  model: AppointmentModel;
  fee: number;
  isFollowUp: boolean; // Computed based on 15-day validity
  status: 'Scheduled' | 'Checked-In' | 'In Consultation' | 'Completed' | 'Cancelled';
  paymentStatus: 'Paid' | 'Pending' | 'Waived';
  whatsappSent: boolean;
  smsSent: boolean;
}

export interface OPDConsultation {
  id: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  visitDate: string;
  symptoms: string[];
  diagnosis: string;
  vitals: {
    bp: string;
    pulse: string;
    temp: string;
    spO2: string;
    weight: string;
  };
  clinicalNotes: string;
  prescriptions: PrescriptionItem[];
  recommendedTests: string[];
  followUpDate?: string;
  validityEligibleUntil: string;
}

export interface PrescriptionItem {
  medicineName: string;
  dosage: string; // e.g. "1-0-1"
  timing: 'Before Food' | 'After Food';
  durationDays: number;
  instructions?: string;
}

export interface Bed {
  id: string;
  bedNumber: string;
  wardId: string;
  wardName: string;
  floor: string;
  bedType: 'ICU' | 'Private' | 'Semi-Private' | 'General' | 'Isolation' | 'Emergency';
  status: 'Available' | 'Occupied' | 'Cleaning' | 'Reserved' | 'Maintenance';
  patientId?: string;
  patientName?: string;
  patientUhid?: string;
  admittedDate?: string;
  attendingDoctor?: string;
  dailyRate: number;
}

export interface IPDAdmission {
  id: string;
  admissionId: string;
  patientId: string;
  patientName: string;
  patientUhid: string;
  age: number;
  gender: string;
  admittedDate: string;
  dischargeDate?: string;
  bedId: string;
  bedNumber: string;
  wardName: string;
  floor: string;
  attendingDoctor: string;
  departmentName: string;
  diagnosis: string;
  depositAmount: number;
  totalEstimatedBill: number;
  status: 'Admitted' | 'Transferred' | 'Discharged';
}

export interface PatientMovementLog {
  id: string;
  patientId: string;
  patientName: string;
  patientUhid: string;
  timestamp: string;
  fromLocation: string;
  toLocation: string;
  reason: string;
  authorizedBy: string;
}

export interface BillItem {
  id: string;
  description: string;
  category: 'Consultation' | 'Bed Charge' | 'Procedure' | 'Pharmacy' | 'Lab Test' | 'Equipment';
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface PaymentSplit {
  mode: 'Cash' | 'UPI' | 'Credit Card' | 'Debit Card' | 'Net Banking' | 'Insurance';
  amount: number;
  referenceNo?: string;
}

export interface BillingInvoice {
  id: string;
  invoiceNo: string;
  patientId: string;
  patientName: string;
  patientUhid: string;
  date: string;
  items: BillItem[];
  subtotal: number;
  discountAmount: number;
  discountReason?: string;
  taxAmount: number;
  netTotal: number;
  payments: PaymentSplit[];
  paidAmount: number;
  dueAmount: number;
  paymentStatus: 'Paid' | 'Partial' | 'Unpaid';
  generatedBy: string;
}

export interface InsuranceClaim {
  id: string;
  claimNo: string;
  patientId: string;
  patientName: string;
  patientUhid: string;
  providerName: string;
  tpaName: string;
  policyNo: string;
  sumInsured: number;
  preAuthAmount: number;
  approvedAmount: number;
  status: 'Pre-Auth Submitted' | 'Pre-Auth Approved' | 'Documents Pending' | 'Claim Settled' | 'Rejected';
  submittedDate: string;
  rejectionReason?: string;
}

export interface EmergencyCase {
  id: string;
  caseNo: string;
  patientName: string;
  age: number;
  gender: string;
  triagePriority: 'Red - Critical' | 'Yellow - Urgent' | 'Green - Non-Urgent';
  chiefComplaint: string;
  arrivalTime: string;
  assignedDoctor: string;
  assignedBed: string;
  medicoLegalCase: boolean;
  status: 'In Triage' | 'Under Resuscitation' | 'Shifted to ICU' | 'Discharged';
}

export interface DigitalConsentForm {
  id: string;
  formType: 'Emergency Treatment' | 'High-Risk Surgical' | 'Anesthesia' | 'Blood Transfusion' | 'General Admission';
  patientId: string;
  patientName: string;
  patientUhid: string;
  doctorName: string;
  procedureName: string;
  signedBy: string; // Patient / Relative
  relationship?: string;
  signedTimestamp: string;
  signatureUrl?: string; // Data URL or marker
  status: 'Signed' | 'Pending Signature';
}

export interface HousekeepingTask {
  id: string;
  roomOrBed: string;
  floor: string;
  ward: string;
  taskType: 'Deep Clean' | 'Disinfection' | 'Linen Change' | 'Waste Disposal';
  assignedStaff: string;
  priority: 'High' | 'Normal' | 'Urgent';
  status: 'Pending' | 'In Progress' | 'Completed' | 'Inspected';
  requestedTime: string;
  completedTime?: string;
}

export interface HealthPackage {
  id: string;
  title: string;
  price: number;
  originalPrice: number;
  testsCount: number;
  recommendedFor: string;
  features: string[];
  isPopular?: boolean;
}

export interface BlogPost {
  id: string;
  title: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  excerpt: string;
  content: string;
  image: string;
  seoTitle: string;
  seoDescription: string;
  status: 'Published' | 'Draft';
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'Operation Theatre' | 'ICU & Rooms' | 'Diagnostics' | 'Reception & Lobby';
  image: string;
  description: string;
}

export interface Testimonial {
  id: string;
  patientName: string;
  age: number;
  treatment: string;
  doctorName: string;
  rating: number;
  reviewText: string;
  photo: string;
}

export interface ContactInquiry {
  id: string;
  name: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
  date: string;
  status: 'New Inquiry' | 'Callback Scheduled' | 'Resolved';
}

export interface MetricCardData {
  title: string;
  value: string | number;
  change: string;
  isPositive: boolean;
  subtitle?: string;
  iconName: string;
}

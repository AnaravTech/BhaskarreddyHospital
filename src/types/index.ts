export type ModuleType =
  | 'dashboard'
  | 'reception'
  | 'patients'
  | 'appointments'
  | 'opd'
  | 'ipd'
  | 'bed-management'
  | 'patient-movement'
  | 'doctors'
  | 'departments'
  | 'billing'
  | 'insurance'
  | 'emergency'
  | 'consent-forms'
  | 'housekeeping'
  | 'pharmacy'
  | 'reports'
  | 'settings';

export type AppMode = 'hospital-os' | 'public-website' | 'website-cms';

export type PermissionLevel = 'FULL' | 'VIEW' | 'LIMITED' | 'HIDDEN';

export type UserRole =
  | 'ceo'
  | 'doctor'
  | 'dmo'
  | 'receptionist'
  | 'billing'
  | 'insurance'
  | 'emergency'
  | 'nurse'
  | 'pharmacist'
  | 'lab'
  | 'admin'
  | 'ward_manager'
  | 'housekeeping'
  | 'maintenance'
  | 'hr';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleTitle: string;
  avatar: string;
  department?: string;
  defaultModule: ModuleType;
  branchId?: string;
  branchName?: string;
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

export interface DoctorValidityRecord {
  doctorId: string;
  doctorName?: string;
  lastVisitDate: string;
  validUntil: string;
  visitsCount: number;
}

export interface Patient {
  id: string;
  uhid: string;
  opNumber?: string; // Formatted as OPYYMXXXX (e.g. OP2680001)
  name: string;
  aadharNumber?: string;
  dob?: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  email?: string;
  bloodGroup?: string;
  address: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  allergies: string[];
  medicalHistory: string[];
  registeredDate: string;
  lastVisitDate?: string;
  opValidityEndDate?: string; // General last visit validity
  doctorValidities?: Record<string, DoctorValidityRecord>; // Doctor-Specific 15-day consultation validity (Key: doctorId or doctorName)
  insuranceProvider?: string;
  policyNumber?: string;
  totalVisits: number;
  status: 'Active' | 'Admitted' | 'Discharged';

  // Multi-Branch & Cross-Hospital Network Fields
  primaryBranchId?: string; // Current active branch ID (e.g. 'b-1', 'b-2', 'b-3')
  registeredBranchName?: string; // Home branch where first registered
  interBranchHistory?: Array<{
    branchId: string;
    branchName: string;
    visitDate: string;
    doctorName: string;
    type: 'Consultation' | 'Transfer' | 'Admission';
    notes?: string;
  }>;
  
  // Comprehensive EHR Clinical Fields
  currentSummary?: {
    diagnosis: string;
    doctor: string;
    condition: string;
    treatment: string;
  };
  vitals?: {
    bp: string;
    pulse: string;
    spo2: string;
    temp: string;
    respRate: string;
    bmi?: string;
    weight?: string;
    height?: string;
  };
  medications?: Array<{
    drugName: string;
    dosage: string;
    frequency: string;
    duration: string;
    route: string;
    doctor: string;
  }>;
  labResults?: Array<{
    testName: string;
    value: string;
    unit: string;
    normalRange: string;
    flag: 'Normal' | 'High' | 'Low' | 'Critical';
    date: string;
  }>;
  radiologyReports?: Array<{
    modality: string;
    bodyPart: string;
    impression: string;
    findings: string;
    date: string;
    radiologist: string;
  }>;
  procedures?: Array<{
    procedureName: string;
    date: string;
    surgeon: string;
    anesthesia: string;
    outcome: string;
  }>;
  treatmentPlan?: {
    followUpDate: string;
    doctor: string;
    dietInstructions: string;
    restrictions: string;
    warningSigns: string;
  };
  attachedDocuments?: Array<{
    docName: string;
    docType: string;
    uploadedDate: string;
    fileRef: string;
  }>;
}

export interface Doctor {
  id: string;
  doctorId?: string; // Formatted as DOC-2026-XXXX
  name: string;
  designation?: string; // e.g. Senior Consultant / Medical Oncologist
  qualification: string;
  departmentId: string;
  departmentName: string;
  specialization: string;
  email?: string;
  opdRoom?: string;
  consultationFee: number;
  premiumFee: number;
  availabilityDays: string[];
  workingHours: string;
  maxPatientsPerDay: number;
  image: string;
  avatar?: string;
  rating: number;
  experienceYears: number;
  status: 'On Duty' | 'In Surgery' | 'On Leave' | 'Off Duty';
  branchId?: string; // Branch ID doctor is stationed at (e.g. 'b-1', 'b-2', 'b-3')
  branchName?: string;
  coveringDoctorId?: string; // Replaced Duty Doctor for when on leave
  coveringDoctorName?: string;
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
  tokenNumber?: string;
  opNumber?: string; // Formatted OP Number
  consBillNo?: string; // Formatted Consultation Bill Number (e.g. BRH/OPB/2026/0142)
  patientUhid?: string;
  patientAddress?: string;
  billNo?: string;
  validUntil?: string;
  paymentMethod?: string;
  utrNumber?: string;
  branchId?: string;
  branchName?: string;
  createdByName?: string;
  createdByRole?: string;
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
  hasHospitalFile?: boolean; // REG01 Hospital case sheet / folder
  registrationCharges?: number; // ₹30 registration charges for hospital file
  status:
    | 'Booked'
    | 'Payment Pending'
    | 'Payment Verification Pending'
    | 'Payment Verified'
    | 'Token Generated'
    | 'Checked-In'
    | 'In Consultation'
    | 'Completed'
    | 'Cancelled'
    | 'Scheduled';
  paymentStatus: 'Paid' | 'Pending' | 'Pending Verification' | 'Waived' | 'Refunded';
  slotType?: 'Normal' | 'Premium / Priority';
  auditHistory?: Array<{
    status: string;
    timestamp: string;
    note: string;
    actor?: string;
    utrNumber?: string;
    tokenNumber?: string;
    paymentMethod?: string;
  }>;
  whatsappSent: boolean;
  smsSent: boolean;
  verifiedAt?: string;
  verifiedBy?: string;
  reassignedFromDoctor?: string;
  reassignedAt?: string;
  differentialFeePaid?: number;
  cancellationReason?: string;
  cancelledAt?: string;
  refundAmount?: number;
  refundMode?: 'Cash' | 'Online UPI Reversal' | 'Credit Voucher';
  refundReference?: string;
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

export type MovementType =
  | 'Ward-to-Ward'
  | 'Emergency-to-ICU'
  | 'Pre-Op to OT'
  | 'OT to Recovery / PACU'
  | 'Diagnostic & Imaging Escort'
  | 'Dialysis Transit'
  | 'Inter-Branch Referral'
  | 'Discharge Transit';

export type MovementStatus =
  | 'Scheduled / Initiated'
  | 'In Transit'
  | 'Received & Bed Handover Complete'
  | 'Cancelled';

export interface PatientMovementLog {
  id: string;
  patientId: string;
  patientName: string;
  patientUhid: string;
  timestamp: string;
  movementType?: MovementType;
  fromLocation: string;
  toLocation: string;
  reason: string;
  authorizedBy: string;
  authorizedRole?: string;
  escortNurse?: string;
  porterGDA?: string;
  transportMode?: 'Stretcher' | 'Wheelchair' | 'Bed-Transfer' | 'Ambulance' | 'Walking Assist';
  lifeSupport?: string[];
  status: MovementStatus;
  handoverNotes?: string;
  receivingNurseSign?: string;
  completedAt?: string;
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
  memberId?: string;
  sumInsured: number;
  preAuthAmount: number;
  approvedAmount: number;
  deductionAmount?: number;
  coPayAmount?: number;
  status: 'Pre-Auth Submitted' | 'Pre-Auth Approved' | 'Documents Pending' | 'Query Raised' | 'Claim Settled' | 'Rejected';
  submittedDate: string;
  approvalDate?: string;
  gopNumber?: string;
  admissionId?: string;
  diagnosis?: string;
  treatingDoctor?: string;
  queryDetails?: string;
  rejectionReason?: string;
  settlementUtr?: string;
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
  formType:
    | 'Emergency Treatment'
    | 'High-Risk Surgical'
    | 'High-Risk Surgical & Anesthesia'
    | 'Chemotherapy & Targeted Therapy'
    | 'Radiation Therapy Protocol'
    | 'Blood & Blood Products Transfusion'
    | 'General Inpatient Admission'
    | 'High-Risk LAMA Discharge'
    | 'Anesthesia'
    | 'Blood Transfusion'
    | 'General Admission';
  patientId: string;
  patientName: string;
  patientUhid: string;
  doctorName: string;
  procedureName: string;
  signedBy: string; // Patient / Relative
  relationship?: string;
  signedTimestamp: string;
  signatureUrl?: string; // Data URL or marker
  witnessName?: string;
  witnessRole?: string;
  language?: 'English' | 'Telugu' | 'Bilingual (EN + TE)';
  risksAcknowledged?: string[];
  notes?: string;
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

// Public Website & CMS Data Types
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

export interface UnverifiedUTRReport {
  id: string;
  utrNumber: string;
  patientName: string;
  patientUhid: string;
  doctorName: string;
  amount: number;
  paymentMode: 'Online UPI' | 'Net Banking' | 'Card / POS' | 'Cash';
  cardType?: string; // e.g. "Visa Credit Card", "RuPay Debit Card"
  cardLast4?: string; // e.g. "4589"
  posTerminalId?: string; // e.g. "ICICI POS Terminal #01"
  authCode?: string; // e.g. "AUTH-892014"
  timestamp: string;
  date?: string;
  time?: string;
  status: 'Unverified / Flagged' | 'Bank Reconciled' | 'Disputed';
  notes?: string;
  enteredBy?: string;
  sourceModule?: string;
  bankReference?: string;
  patientPhone?: string;
}

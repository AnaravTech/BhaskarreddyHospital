import React, { useState, useMemo } from 'react';
import { useHospital } from '../../context/HospitalContext';
import type { InsuranceClaim } from '../../types';
import {
  ShieldCheck,
  Search,
  Plus,
  CheckCircle2,
  Clock,
  Printer,
  Building2,
  UploadCloud,
  UserCheck,
  ExternalLink,
  PhoneCall,
  DollarSign,
  ArrowUpRight,
  HelpCircle,
  Award,
  CheckSquare,
  BadgeCheck,
} from 'lucide-react';

interface TpaPartner {
  id: string;
  name: string;
  category: 'Govt Scheme (Arogyasri / PMJAY)' | 'Standalone Health TPA' | 'Private Insurance TPA';
  cashlessDeskPhone: string;
  email: string;
  portalUrl: string;
  avgTatHours: number;
  status: 'Active Empaneled' | 'MoU Under Renewal';
  supportedInsurers: string[];
}

interface GovtPackageCode {
  code: string;
  specialty: 'Surgical Oncology' | 'Medical Oncology' | 'Cardiology' | 'General Surgery' | 'Orthopedics' | 'Emergency / Trauma';
  description: string;
  govtTariff: number;
  requiredPreAuthDocs: string[];
  mandatoryFreeMedicineDays: number;
}

export const InsuranceModule: React.FC = () => {
  const {
    insuranceClaims,
    addInsuranceClaim,
    updateInsuranceClaim,
    patients,
    admissions,
    getPermission,
    currentUser,
    addToast,
  } = useHospital();

  const canEdit = getPermission('insurance') === 'FULL';

  // Active Navigation Tabs: 'claims' | 'govt-schemes' | 'insured-patients' | 'tpa-directory' | 'settlements'
  const [activeTab, setActiveTab] = useState<'claims' | 'govt-schemes' | 'insured-patients' | 'tpa-directory' | 'settlements'>('claims');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isPreAuthModalOpen, setIsPreAuthModalOpen] = useState(false);
  const [isGovtSchemeModal, setIsGovtSchemeModal] = useState(false);
  const [selectedClaimForGOP, setSelectedClaimForGOP] = useState<InsuranceClaim | null>(null);
  const [selectedClaimForEnhancement, setSelectedClaimForEnhancement] = useState<InsuranceClaim | null>(null);
  const [selectedClaimForQuery, setSelectedClaimForQuery] = useState<InsuranceClaim | null>(null);
  const [selectedClaimForSettlement, setSelectedClaimForSettlement] = useState<InsuranceClaim | null>(null);
  const [selectedGovtChecklistClaim, setSelectedGovtChecklistClaim] = useState<InsuranceClaim | null>(null);

  // Government Standard Pre-Auth Packages Directory (Aarogyasri / PM-JAY / EHS)
  const GOVT_SCHEME_PACKAGES: GovtPackageCode[] = [
    {
      code: 'S9.1.1',
      specialty: 'Surgical Oncology',
      description: 'Modified Radical Mastectomy with Axillary Node Clearance',
      govtTariff: 45000,
      requiredPreAuthDocs: ['Biopsy / Histopathology Report', 'Mammography / USG Breast Scan', 'Chest X-Ray & Blood Profile', 'Treating Surgeon Clinical Note'],
      mandatoryFreeMedicineDays: 30,
    },
    {
      code: 'M4.1.2',
      specialty: 'Medical Oncology',
      description: 'High-Risk Multi-Agent Chemotherapy Cycle (Standard Protocol)',
      govtTariff: 32000,
      requiredPreAuthDocs: ['IHC Oncology Markers', '2D Echo LVEF Assessment', 'CBC & Renal Function Test', 'Daycare Chemotherapy Protocol Sheet'],
      mandatoryFreeMedicineDays: 15,
    },
    {
      code: 'C10.2.1',
      specialty: 'Cardiology',
      description: 'Primary Percutaneous Coronary Intervention (PCI) with Drug-Eluting Stent',
      govtTariff: 65000,
      requiredPreAuthDocs: ['Coronary Angiogram (CAG) CD / Film', 'ECG with STEMI Proof', 'Troponin-I Serial Markers', 'Cath Lab Post-Procedure Report'],
      mandatoryFreeMedicineDays: 30,
    },
    {
      code: 'O7.3.2',
      specialty: 'Medical Oncology',
      description: 'Radiation Therapy (IMRT / RapidArc Full Course Protocol)',
      govtTariff: 85000,
      requiredPreAuthDocs: ['Contrast CT Simulation Scan', 'Target Volume Contouring Protocol', 'Radiation Oncologist Prescription'],
      mandatoryFreeMedicineDays: 30,
    },
    {
      code: 'G8.1.1',
      specialty: 'General Surgery',
      description: 'Laparoscopic Cholecystectomy & Common Bile Duct Exploration',
      govtTariff: 38000,
      requiredPreAuthDocs: ['Ultrasound Abdomen & Pelvis', 'Liver Function Test (LFT)', 'Surgical Fitness Assessment'],
      mandatoryFreeMedicineDays: 15,
    },
    {
      code: 'N3.2.1',
      specialty: 'Orthopedics',
      description: 'Total Knee Arthroplasty (Unilateral with High-Flexion Implant)',
      govtTariff: 75000,
      requiredPreAuthDocs: ['Bilateral Knee Weight-Bearing X-Rays', 'Pre-Op Joint Space Assessment', 'Implant Barcode Invoice'],
      mandatoryFreeMedicineDays: 30,
    },
    {
      code: 'E2.1.0',
      specialty: 'Emergency / Trauma',
      description: 'Emergency Trauma Resuscitation, Polytrauma ICU Stabilization & Wound Debridement',
      govtTariff: 50000,
      requiredPreAuthDocs: ['FAST Ultrasound Trauma Scan', 'Whole Body Non-Contrast CT', 'Medico-Legal Case (MLC) Intimation Copy'],
      mandatoryFreeMedicineDays: 15,
    },
  ];

  // Pre-Auth Submission Form
  const [preAuthForm, setPreAuthForm] = useState({
    schemeType: 'Dr. YSR Aarogyasri Health Care Trust' as string,
    patientId: '',
    providerName: 'Dr. YSR Aarogyasri Health Care Trust',
    tpaName: 'Aarogya Mitra Govt Desk',
    policyNo: 'WAP08129910291',
    memberId: 'RATION-BPL-548102',
    sumInsured: 500000,
    preAuthAmount: 65000,
    selectedPackageCode: 'C10.2.1',
    diagnosis: 'C10.2.1 - Primary PCI Stenting (Single Drug-Eluting Stent)',
    treatingDoctor: 'Dr. Vikram Reddy (Chief Cardiologist)',
    admissionId: 'ADM-2026-0491',
    hospitalWard: 'Cardiac ICU Suite (ICU-101)',
    clinicalNotes: 'Beneficiary white ration card verified by Aarogya Mitra counter. Emergency coronary stenting planned.',
    // Formalities Checklist
    cardVerified: true,
    aadhaarOtpVerified: true,
    diagnosticDocsAttached: true,
    doctorRecommendationSigned: true,
    freeMedicineAcknowledged: true,
    transportAllowanceProvided: true,
  });

  // Enhancement Form
  const [enhancementAmount, setEnhancementAmount] = useState<number>(25000);
  const [enhancementReason, setEnhancementReason] = useState<string>('Extended ICU ventilation & step-down monitoring required.');

  // Query Response Form
  const [queryResponse, setQueryResponse] = useState<string>('Attached 2D Echo report, Trop-I serial values, and Cath lab procedure records.');

  // Settlement Form
  const [settlementData, setSettlementData] = useState({
    finalApprovedAmount: 65000,
    deductions: 0,
    patientCoPay: 0,
    settlementUtr: 'UTR-TREASURY-AP-8829101',
  });

  // Empaneled TPAs Directory
  const empaneledTPAs: TpaPartner[] = [
    {
      id: 'tpa-aarogya',
      name: 'Dr. YSR Aarogyasri Health Care Trust (AP Govt)',
      category: 'Govt Scheme (Arogyasri / PMJAY)',
      cashlessDeskPhone: '104 / 1800 425 1818',
      email: 'aarogyasri@ap.gov.in',
      portalUrl: 'https://aarogyasri.ap.gov.in',
      avgTatHours: 1.5,
      status: 'Active Empaneled',
      supportedInsurers: ['Government of Andhra Pradesh Free Tertiary Care', 'Employees Health Scheme (EHS)', 'WJHS'],
    },
    {
      id: 'tpa-pmjay',
      name: 'Ayushman Bharat - PM-JAY (National Health Authority)',
      category: 'Govt Scheme (Arogyasri / PMJAY)',
      cashlessDeskPhone: '14555 / 1800 111 565',
      email: 'pmjay@nha.gov.in',
      portalUrl: 'https://mera.pmjay.gov.in',
      avgTatHours: 2.0,
      status: 'Active Empaneled',
      supportedInsurers: ['Central Govt PM-JAY Jan Arogya Yojana', 'AB-PMJAY Golden Card Holders'],
    },
    {
      id: 'tpa-1',
      name: 'Medi Assist Insurance TPA Pvt Ltd',
      category: 'Standalone Health TPA',
      cashlessDeskPhone: '1800 425 9449 / 080 2206 7000',
      email: 'cashless@mediassist.in',
      portalUrl: 'https://medibuddy.in/hospital-portal',
      avgTatHours: 2.5,
      status: 'Active Empaneled',
      supportedInsurers: ['Star Health', 'ICICI Lombard', 'National Insurance', 'New India Assurance'],
    },
    {
      id: 'tpa-2',
      name: 'Star Health In-House TPA Desk',
      category: 'Private Insurance TPA',
      cashlessDeskPhone: '1800 425 2255 / 1800 102 4477',
      email: 'claims@starhealth.in',
      portalUrl: 'https://hospital.starhealth.in',
      avgTatHours: 2.0,
      status: 'Active Empaneled',
      supportedInsurers: ['Star Health & Allied Insurance'],
    },
    {
      id: 'tpa-3',
      name: 'Paramount Health Services & Insurance TPA',
      category: 'Standalone Health TPA',
      cashlessDeskPhone: '1800 22 66 55 / 022 6662 0808',
      email: 'preauth@paramounttpa.com',
      portalUrl: 'https://portal.paramounttpa.com',
      avgTatHours: 3.5,
      status: 'Active Empaneled',
      supportedInsurers: ['Oriental Insurance', 'United India Insurance', 'Tata AIG'],
    },
    {
      id: 'tpa-4',
      name: 'Family Health Plan Insurance TPA (FHPL)',
      category: 'Standalone Health TPA',
      cashlessDeskPhone: '1800 425 4033 / 040 2355 7771',
      email: 'cashless@fhpl.net',
      portalUrl: 'https://hospital.fhpl.net',
      avgTatHours: 3.0,
      status: 'Active Empaneled',
      supportedInsurers: ['Care Health', 'Niva Bupa', 'SBI General Insurance'],
    },
  ];

  // Insured Patients from Patients Directory & Admissions
  const insuredPatients = useMemo(() => {
    return patients
      .filter((p) => p.insuranceProvider && p.insuranceProvider !== 'None' && p.insuranceProvider !== '')
      .map((p) => {
        const admission = admissions.find((a) => a.patientId === p.id && a.status === 'Admitted');
        const existingClaim = insuranceClaims.find((c) => c.patientId === p.id);
        const isGovtScheme =
          p.insuranceProvider?.toLowerCase().includes('aarogya') ||
          p.insuranceProvider?.toLowerCase().includes('pmjay') ||
          p.insuranceProvider?.toLowerCase().includes('ayushman') ||
          p.insuranceProvider?.toLowerCase().includes('ehs') ||
          p.insuranceProvider?.toLowerCase().includes('cghs');

        return {
          patient: p,
          admission,
          existingClaim,
          isGovtScheme,
        };
      });
  }, [patients, admissions, insuranceClaims]);

  // Government Scheme Specific Claims
  const govtSchemeClaims = useMemo(() => {
    return insuranceClaims.filter(
      (c) =>
        c.providerName.toLowerCase().includes('aarogya') ||
        c.providerName.toLowerCase().includes('ayushman') ||
        c.providerName.toLowerCase().includes('pm-jay') ||
        c.providerName.toLowerCase().includes('pmjay') ||
        c.providerName.toLowerCase().includes('ehs') ||
        c.tpaName.toLowerCase().includes('aarogya') ||
        c.tpaName.toLowerCase().includes('national health authority')
    );
  }, [insuranceClaims]);

  // Filtered Claims
  const filteredClaims = insuranceClaims.filter((claim) => {
    const matchStatus = selectedStatus === 'All' || claim.status === selectedStatus;
    const matchSearch =
      claim.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.claimNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.providerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.tpaName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  const getStatusStyle = (status: InsuranceClaim['status']) => {
    switch (status) {
      case 'Pre-Auth Approved':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'Claim Settled':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      case 'Pre-Auth Submitted':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Query Raised':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40 animate-pulse';
      case 'Documents Pending':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';
      case 'Rejected':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  // Pre-Auth Submit Handler
  const handlePreAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!preAuthForm.patientId) {
      addToast('Patient Required', 'Please select a patient for pre-authorization.', 'error');
      return;
    }

    const patient = patients.find((p) => p.id === preAuthForm.patientId);
    if (!patient) return;

    addInsuranceClaim({
      patientId: patient.id,
      patientName: patient.name,
      patientUhid: patient.uhid,
      providerName: preAuthForm.providerName,
      tpaName: preAuthForm.tpaName,
      policyNo: preAuthForm.policyNo || patient.policyNumber || 'POL-77281-00',
      memberId: preAuthForm.memberId || `MEM-${patient.uhid}`,
      sumInsured: Number(preAuthForm.sumInsured),
      preAuthAmount: Number(preAuthForm.preAuthAmount),
      approvedAmount: preAuthForm.providerName.includes('Aarogya') || preAuthForm.providerName.includes('PM-JAY') ? Number(preAuthForm.preAuthAmount) : 0,
      status: preAuthForm.providerName.includes('Aarogya') || preAuthForm.providerName.includes('PM-JAY') ? 'Pre-Auth Approved' : 'Pre-Auth Submitted',
      admissionId: preAuthForm.admissionId,
      diagnosis: preAuthForm.diagnosis,
      treatingDoctor: preAuthForm.treatingDoctor,
      gopNumber: `GOP-${Date.now().toString().slice(-4)}`,
    });

    setIsPreAuthModalOpen(false);
    setIsGovtSchemeModal(false);
  };

  // Instant Pre-Auth for an Insured Patient
  const handleInitiateFastTrackPreAuth = (patient: any, admission?: any, isGovt = false) => {
    const isAarogya = (patient.insuranceProvider || '').toLowerCase().includes('aarogya') || isGovt;
    const defaultPkg = GOVT_SCHEME_PACKAGES[2]; // Cardiology PCI

    setPreAuthForm({
      schemeType: isAarogya ? 'Dr. YSR Aarogyasri Health Care Trust' : 'Star Health & Allied Insurance',
      patientId: patient.id,
      providerName: isAarogya ? 'Dr. YSR Aarogyasri Health Care Trust' : patient.insuranceProvider || 'Star Health & Allied Insurance',
      tpaName: isAarogya ? 'Aarogya Mitra Govt Desk' : 'Medi Assist TPA',
      policyNo: patient.policyNumber || (isAarogya ? 'WAP08129910291' : 'POL-88271-99'),
      memberId: `MEM-${patient.uhid}`,
      sumInsured: 500000,
      preAuthAmount: isAarogya ? defaultPkg.govtTariff : (admission ? admission.totalEstimatedBill || 75000 : 50000),
      selectedPackageCode: defaultPkg.code,
      diagnosis: isAarogya ? `${defaultPkg.code} - ${defaultPkg.description}` : (admission ? admission.diagnosis : 'Inpatient Medical Care & Treatment'),
      treatingDoctor: admission ? admission.attendingDoctor : 'Dr. Vikram Reddy',
      admissionId: admission ? admission.admissionId : `ADM-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      hospitalWard: admission ? `${admission.wardName} (${admission.bedNumber})` : 'General Ward (Govt Scheme Bed)',
      clinicalNotes: isAarogya
        ? 'Aarogya Mitra verified beneficiary card. Mandatory free post-discharge medication kit allocated.'
        : 'Cashless pre-auth initiated for tertiary oncology / cardio care.',
      cardVerified: true,
      aadhaarOtpVerified: true,
      diagnosticDocsAttached: true,
      doctorRecommendationSigned: true,
      freeMedicineAcknowledged: true,
      transportAllowanceProvided: true,
    });

    if (isGovt) {
      setIsGovtSchemeModal(true);
    } else {
      setIsPreAuthModalOpen(true);
    }
  };

  // Approval Enhancement
  const handleConfirmEnhancement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClaimForEnhancement) return;

    const newPreAuth = selectedClaimForEnhancement.preAuthAmount + Number(enhancementAmount);
    const newApproved = selectedClaimForEnhancement.approvedAmount + Number(enhancementAmount);

    updateInsuranceClaim(selectedClaimForEnhancement.id, {
      preAuthAmount: newPreAuth,
      approvedAmount: newApproved,
      status: 'Pre-Auth Approved',
    });

    addToast(
      'Enhancement Approved',
      `Cashless limit enhanced by ₹${enhancementAmount.toLocaleString()} (New Limit: ₹${newApproved.toLocaleString()})`,
      'success'
    );
    setSelectedClaimForEnhancement(null);
  };

  // Query Response
  const handleConfirmQueryResponse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClaimForQuery) return;

    updateInsuranceClaim(selectedClaimForQuery.id, {
      status: 'Pre-Auth Submitted',
      queryDetails: `Hospital Replied: ${queryResponse}`,
    });

    addToast('TPA Deficiency Resolved', 'Query responses & clinical records dispatched to TPA portal.', 'success');
    setSelectedClaimForQuery(null);
  };

  // Final Settlement
  const handleConfirmSettlement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClaimForSettlement) return;

    updateInsuranceClaim(selectedClaimForSettlement.id, {
      status: 'Claim Settled',
      approvedAmount: Number(settlementData.finalApprovedAmount),
      deductionAmount: Number(settlementData.deductions),
      coPayAmount: Number(settlementData.patientCoPay),
      settlementUtr: settlementData.settlementUtr,
    });

    addToast(
      'Claim Settled',
      `Final settlement of ₹${settlementData.finalApprovedAmount.toLocaleString()} reconciled via ${settlementData.settlementUtr}`,
      'success'
    );
    setSelectedClaimForSettlement(null);
  };

  // KPIs
  const totalPreAuthSubmitted = insuranceClaims.reduce((sum, c) => sum + c.preAuthAmount, 0);
  const totalApprovedCashless = insuranceClaims.reduce((sum, c) => sum + c.approvedAmount, 0);
  const govtSchemesAmount = govtSchemeClaims.reduce((sum, c) => sum + c.approvedAmount, 0);
  const pendingApprovalsCount = insuranceClaims.filter((c) => c.status === 'Pre-Auth Submitted' || c.status === 'Query Raised').length;

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* 1. Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-6 rounded-2xl border border-slate-800/80 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              Dr. YSR Aarogyasri, Ayushman Bharat (PM-JAY) &amp; TPA Cashless Desk
            </span>
            <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
              Role: {currentUser?.roleTitle || currentUser?.role}
            </span>
          </div>
          <h2 className="text-2xl font-black text-white mt-1">Insurance &amp; Government Schemes Management</h2>
          <p className="text-xs text-slate-400">
            Aarogya Mitra verification desk, Government standard package Pre-Auths, mandatory statutory formalities, Guarantee of Payment (GOP), and claim settlement.
          </p>
        </div>

        {canEdit && (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                setIsGovtSchemeModal(true);
                setPreAuthForm((prev) => ({
                  ...prev,
                  providerName: 'Dr. YSR Aarogyasri Health Care Trust',
                  tpaName: 'Aarogya Mitra Govt Desk',
                  policyNo: 'WAP08129910291',
                  memberId: 'RATION-BPL-548102',
                  sumInsured: 500000,
                  preAuthAmount: 65000,
                  diagnosis: 'C10.2.1 - Primary PCI Stenting (Single Drug-Eluting Stent)',
                }));
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-extrabold shadow-lg shadow-amber-600/30 transition active:scale-95"
            >
              <Award className="w-4 h-4" />
              <span>+ Aarogyasri / PM-JAY Pre-Auth</span>
            </button>

            <button
              onClick={() => {
                setIsGovtSchemeModal(false);
                setIsPreAuthModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-extrabold shadow-lg shadow-purple-600/30 transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ Private TPA Pre-Auth</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. Top Tab Navigation Bar */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 flex-wrap">
        <button
          onClick={() => setActiveTab('claims')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'claims'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-950/50'
              : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>🛡️ All Cashless Claims ({insuranceClaims.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('govt-schemes')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'govt-schemes'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-950/50'
              : 'bg-slate-950 text-amber-400/90 hover:text-amber-300 border border-amber-900/40'
          }`}
        >
          <Award className="w-4 h-4 text-amber-300" />
          <span>🏛️ Aarogyasri &amp; Govt Schemes Desk ({govtSchemeClaims.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('insured-patients')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'insured-patients'
              ? 'bg-cyan-600 text-white shadow-md shadow-cyan-950/50'
              : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <UserCheck className="w-4 h-4 text-cyan-300" />
          <span>👥 Beneficiaries &amp; Insured Patients ({insuredPatients.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('tpa-directory')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'tpa-directory'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950/50'
              : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4 text-indigo-300" />
          <span>🏢 Empaneled TPAs &amp; Health Trusts ({empaneledTPAs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settlements')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'settlements'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/50'
              : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <DollarSign className="w-4 h-4 text-emerald-300" />
          <span>📊 Settlement &amp; Co-Pay Ledger</span>
        </button>
      </div>

      {/* 3. Analytics KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-amber-500/30 shadow-md">
          <div className="flex items-center justify-between text-xs text-amber-400">
            <span>Aarogyasri &amp; Govt Receivables</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-black text-amber-300 mt-1.5 font-mono">
            ₹{govtSchemesAmount.toLocaleString()}
          </div>
          <span className="text-[10px] text-amber-500/80 font-mono mt-0.5 block">
            Across {govtSchemeClaims.length} 100% Free Scheme Admissions
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-emerald-500/30 shadow-md">
          <div className="flex items-center justify-between text-xs text-emerald-400">
            <span>Total Approved Limit (GOP Issued)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-black text-emerald-300 mt-1.5 font-mono">
            ₹{totalApprovedCashless.toLocaleString()}
          </div>
          <span className="text-[10px] text-emerald-500/80 font-mono mt-0.5 block">
            Guaranteed TPA &amp; Govt receivables
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-purple-500/30 shadow-md">
          <div className="flex items-center justify-between text-xs text-purple-400">
            <span>Total Pre-Auth Pipeline</span>
            <UploadCloud className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl font-black text-white mt-1.5 font-mono">
            ₹{totalPreAuthSubmitted.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
            Across {insuranceClaims.length} hospital claims
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-cyan-500/30 shadow-md">
          <div className="flex items-center justify-between text-xs text-cyan-400">
            <span>Pending Pre-Auths / Queries</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl font-black text-cyan-300 mt-1.5 font-mono">
            {pendingApprovalsCount} Cases
          </div>
          <span className="text-[10px] text-cyan-500/80 font-mono mt-0.5 block">
            Avg Trust Approval TAT: 1.5 Hours
          </span>
        </div>
      </div>

      {/* 4. TAB 2: AAROGYASRI & GOVT SCHEMES SPECIALIZED DESK */}
      {activeTab === 'govt-schemes' && (
        <div className="space-y-6">
          {/* Statutory Formalities Notice Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-orange-950/30 border border-amber-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-300 font-black text-sm">
                <BadgeCheck className="w-5 h-5 text-amber-400" />
                <span>Statutory Mandate: Dr. YSR Aarogyasri &amp; PM-JAY Beneficiary Formalities Checklist</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                100% Cashless Treatment Mandate
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-300">
              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
                <strong className="text-amber-400 flex items-center gap-1.5 font-bold text-xs">
                  <CheckSquare className="w-3.5 h-3.5" /> 1. Pre-Auth &amp; Biometric Intake
                </strong>
                <p className="text-[11px] text-slate-400">
                  Verify Aarogyasri / Ration / PM-JAY Golden Card with Aadhaar OTP authentication at Aarogya Mitra counter within 24h.
                </p>
              </div>

              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
                <strong className="text-amber-400 flex items-center gap-1.5 font-bold text-xs">
                  <CheckSquare className="w-3.5 h-3.5" /> 2. Free Medicine Handover
                </strong>
                <p className="text-[11px] text-slate-400">
                  Mandatory 10 to 30 days of free post-discharge prescribed medicines provided by hospital pharmacy prior to patient exit.
                </p>
              </div>

              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
                <strong className="text-amber-400 flex items-center gap-1.5 font-bold text-xs">
                  <CheckSquare className="w-3.5 h-3.5" /> 3. Travel Allowance &amp; OT Proof
                </strong>
                <p className="text-[11px] text-slate-400">
                  Record ₹100–₹500 travel allowance disbursement and upload pre &amp; post-procedure clinical scans for final Trust claim audit.
                </p>
              </div>
            </div>
          </div>

          {/* Government Scheme Claims Roster */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <span>Active Government Scheme Inpatient Cases ({govtSchemeClaims.length})</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  AP / Central Govt Health Trust
                </span>
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-mono">
                    <th className="py-3 px-3">Case / Claim #</th>
                    <th className="py-3 px-3">Beneficiary &amp; Card ID</th>
                    <th className="py-3 px-3">Govt Scheme &amp; Trust Desk</th>
                    <th className="py-3 px-3">Standard Package Code</th>
                    <th className="py-3 px-3">Govt Sanctioned GOP</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Formalities &amp; Slips</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {govtSchemeClaims.map((claim) => (
                    <tr key={claim.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-3">
                        <span className="font-mono font-bold text-amber-400 block">{claim.claimNo}</span>
                        <span className="text-[10px] text-slate-500 font-mono">Sub: {claim.submittedDate}</span>
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="font-bold text-white text-sm">{claim.patientName}</div>
                        <div className="text-[10px] text-amber-300 font-mono">
                          Card/Ration: <strong className="text-white">{claim.policyNo}</strong>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">UHID: {claim.patientUhid}</div>
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="font-bold text-slate-200">{claim.providerName}</div>
                        <div className="text-[10px] text-amber-400 font-semibold">{claim.tpaName}</div>
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-purple-300 font-mono font-bold text-[11px] block w-fit">
                          {claim.diagnosis?.split(' - ')[0] || 'Govt Pkg'}
                        </span>
                        <span className="text-[10px] text-slate-400 block truncate max-w-[200px]">
                          {claim.diagnosis || 'Tertiary Surgical Procedure'}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 font-mono">
                        <span className="font-black text-sm text-emerald-400 block">
                          ₹{claim.approvedAmount.toLocaleString()}.00
                        </span>
                        <span className="text-[9px] text-emerald-400/90 flex items-center gap-0.5">
                          <CheckCircle2 className="w-2.5 h-2.5" /> 100% Free Scheme Covered
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        <span
                          className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border ${getStatusStyle(
                            claim.status
                          )}`}
                        >
                          {claim.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedGovtChecklistClaim(claim)}
                            title="Verify Scheme Formalities Checklist"
                            className="px-2.5 py-1.5 rounded-lg bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-white border border-amber-500/30 text-[10px] font-bold transition flex items-center gap-1"
                          >
                            <CheckSquare className="w-3 h-3" />
                            <span>Formalities</span>
                          </button>

                          <button
                            onClick={() => setSelectedClaimForGOP(claim)}
                            title="Print Aarogyasri / PM-JAY GOP Certificate"
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 text-[10px] font-bold transition flex items-center gap-1"
                          >
                            <Printer className="w-3 h-3" />
                            <span>GOP Slip</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Standard Govt Package Catalog */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <span>Standard Government Package Tariff Catalog (Aarogyasri / PM-JAY Approved Rates)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {GOVT_SCHEME_PACKAGES.map((pkg) => (
                <div
                  key={pkg.code}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5 hover:border-amber-500/40 transition"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono font-bold text-[10px]">
                        Code: {pkg.code}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-1 font-semibold">{pkg.specialty}</span>
                    </div>
                    <span className="text-base font-black text-emerald-400 font-mono">
                      ₹{pkg.govtTariff.toLocaleString()}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-100 text-xs">{pkg.description}</h4>

                  <div className="p-2.5 bg-slate-900 rounded-lg text-[10px] text-slate-400 space-y-1">
                    <strong className="text-amber-300 block">Mandatory Documentation:</strong>
                    <ul className="list-disc list-inside space-y-0.5">
                      {pkg.requiredPreAuthDocs.map((doc, idx) => (
                        <li key={idx} className="truncate">{doc}</li>
                      ))}
                    </ul>
                    <div className="border-t border-slate-800 pt-1 text-emerald-400 font-semibold">
                      💊 Free Post-Op Medicine: <strong>{pkg.mandatoryFreeMedicineDays} Days Package</strong>
                    </div>
                  </div>

                  {canEdit && (
                    <button
                      onClick={() => {
                        setPreAuthForm((prev) => ({
                          ...prev,
                          selectedPackageCode: pkg.code,
                          diagnosis: `${pkg.code} - ${pkg.description}`,
                          preAuthAmount: pkg.govtTariff,
                        }));
                        setIsGovtSchemeModal(true);
                      }}
                      className="w-full py-1.5 rounded-lg bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-white border border-amber-500/30 text-[11px] font-bold transition flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Use this Govt Package</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. TAB 1: ALL CASHLESS CLAIMS */}
      {activeTab === 'claims' && (
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                'All',
                'Pre-Auth Submitted',
                'Pre-Auth Approved',
                'Query Raised',
                'Claim Settled',
                'Rejected',
              ].map((st) => (
                <button
                  key={st}
                  onClick={() => setSelectedStatus(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    selectedStatus === st
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search Claim #, Patient, TPA..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 font-medium"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-mono">
                  <th className="py-3 px-3">Claim &amp; Pre-Auth #</th>
                  <th className="py-3 px-3">Patient &amp; Card Details</th>
                  <th className="py-3 px-3">Insurance / Govt Trust</th>
                  <th className="py-3 px-3">Pre-Auth / Sum Insured</th>
                  <th className="py-3 px-3">Approved Limit (GOP)</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {filteredClaims.map((claim) => {
                  const isGovt =
                    claim.providerName.toLowerCase().includes('aarogya') ||
                    claim.providerName.toLowerCase().includes('pm-jay') ||
                    claim.providerName.toLowerCase().includes('pmjay') ||
                    claim.providerName.toLowerCase().includes('ehs');

                  return (
                    <tr key={claim.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-3">
                        <span className={`font-mono font-bold block ${isGovt ? 'text-amber-400' : 'text-purple-400'}`}>
                          {claim.claimNo}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">Sub: {claim.submittedDate}</span>
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="font-bold text-white text-sm">{claim.patientName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          UHID: <strong className="text-slate-300">{claim.patientUhid}</strong> • ID:{' '}
                          <strong className="text-slate-300">{claim.policyNo}</strong>
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="font-bold text-slate-200 flex items-center gap-1.5">
                          {isGovt && <Award className="w-3.5 h-3.5 text-amber-400" />}
                          <span>{claim.providerName}</span>
                        </div>
                        <div className="text-[10px] text-purple-400 font-semibold">
                          Desk: {claim.tpaName}
                        </div>
                      </td>

                      <td className="py-3.5 px-3 font-mono">
                        <span className="text-slate-200 font-bold block">
                          ₹{claim.preAuthAmount.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Sum Ins: ₹{claim.sumInsured.toLocaleString()}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 font-mono">
                        <span
                          className={`font-black text-sm block ${
                            claim.approvedAmount > 0 ? 'text-emerald-400' : 'text-slate-500'
                          }`}
                        >
                          ₹{claim.approvedAmount.toLocaleString()}
                        </span>
                        {claim.status === 'Pre-Auth Approved' && (
                          <span className="text-[9px] text-emerald-400/90 flex items-center gap-0.5">
                            <CheckCircle2 className="w-2.5 h-2.5" /> Initial GOP Active
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-3">
                        <span
                          className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border ${getStatusStyle(
                            claim.status
                          )}`}
                        >
                          {claim.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {claim.status === 'Pre-Auth Approved' && (
                            <button
                              onClick={() => setSelectedClaimForGOP(claim)}
                              title="Print Guarantee of Payment (GOP) Letter"
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 text-[10px] font-bold transition flex items-center gap-1"
                            >
                              <Printer className="w-3 h-3" />
                              <span>GOP Slip</span>
                            </button>
                          )}

                          {claim.status === 'Pre-Auth Approved' && canEdit && (
                            <button
                              onClick={() => setSelectedClaimForEnhancement(claim)}
                              title="Enhance Pre-Auth Limit"
                              className="px-2.5 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 text-[10px] font-bold transition flex items-center gap-1"
                            >
                              <ArrowUpRight className="w-3 h-3" />
                              <span>Enhance</span>
                            </button>
                          )}

                          {claim.status === 'Query Raised' && canEdit && (
                            <button
                              onClick={() => setSelectedClaimForQuery(claim)}
                              title="Respond to TPA Query"
                              className="px-2.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-[10px] font-bold transition flex items-center gap-1 animate-bounce"
                            >
                              <HelpCircle className="w-3 h-3" />
                              <span>Resolve Query</span>
                            </button>
                          )}

                          {(claim.status === 'Pre-Auth Approved' || claim.status === 'Claim Settled') && canEdit && (
                            <button
                              onClick={() => {
                                setSelectedClaimForSettlement(claim);
                                setSettlementData({
                                  finalApprovedAmount: claim.approvedAmount,
                                  deductions: isGovt ? 0 : 3500,
                                  patientCoPay: isGovt ? 0 : 2500,
                                  settlementUtr: claim.settlementUtr || (isGovt ? 'UTR-TREASURY-AP-8829101' : 'UTR-ICICI-8829101'),
                                });
                              }}
                              title="Final Claim Settlement & Co-Pay"
                              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[10px] font-bold transition flex items-center gap-1"
                            >
                              <DollarSign className="w-3 h-3 text-cyan-400" />
                              <span>{claim.status === 'Claim Settled' ? 'Settled' : 'Settle'}</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. TAB 3: INSURED PATIENTS DIRECTORY */}
      {activeTab === 'insured-patients' && (
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <span>Beneficiaries &amp; Insured Patients Directory</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Govt Schemes + Private Insurers
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Automatically detects any patient registered with Aarogyasri, PM-JAY, EHS, or Private Insurance.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {insuredPatients.map(({ patient, admission, existingClaim, isGovtScheme }) => (
              <div
                key={patient.id}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3.5 shadow-md hover:border-purple-500/40 transition"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                      {isGovtScheme && <Award className="w-3.5 h-3.5 text-amber-400" />}
                      <span>{patient.name}</span>
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono">
                      UHID: {patient.uhid} • {patient.age} Yrs / {patient.gender}
                    </span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[9px] font-extrabold ${
                      admission
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {admission ? `🏥 Admitted (${admission.bedNumber})` : '🟢 Outpatient / Planned'}
                  </span>
                </div>

                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800/80 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[10px]">Scheme / Provider:</span>
                    <strong className="text-cyan-300 text-[11px] font-bold">{patient.insuranceProvider}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[10px]">Card / Policy No:</span>
                    <span className="font-mono text-slate-200 text-[11px]">{patient.policyNumber || 'N/A'}</span>
                  </div>
                  {admission && (
                    <div className="flex items-center justify-between border-t border-slate-800 pt-1">
                      <span className="text-slate-400 text-[10px]">Diagnosis:</span>
                      <span className="text-slate-200 text-[10px] font-medium truncate max-w-[160px]">
                        {admission.diagnosis}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                  {existingClaim ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-400 font-mono">{existingClaim.claimNo}</span>
                      <span className={`px-2 py-0.5 text-[9px] font-bold rounded ${getStatusStyle(existingClaim.status)}`}>
                        {existingClaim.status}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-500 italic">No Active Pre-Auth</span>
                  )}

                  {canEdit && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleInitiateFastTrackPreAuth(patient, admission, isGovtScheme)}
                        className={`px-3 py-1.5 rounded-lg text-white text-[11px] font-bold transition flex items-center gap-1 ${
                          isGovtScheme
                            ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500'
                            : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500'
                        }`}
                      >
                        <Plus className="w-3 h-3" />
                        <span>{isGovtScheme ? 'Govt Pre-Auth' : 'TPA Pre-Auth'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. TAB 4: EMPANELED TPAs & GOVT HEALTH TRUSTS */}
      {activeTab === 'tpa-directory' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <span>Empaneled Government Health Trusts &amp; TPAs Directory</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  24x7 Helplines &amp; Portals
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Aarogyasri Health Care Trust, PM-JAY National Health Authority, and private TPA cashless desks.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {empaneledTPAs.map((tpa) => (
              <div
                key={tpa.id}
                className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3.5 shadow-xl hover:border-indigo-500/50 transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-white text-sm">{tpa.name}</h4>
                    <span className="text-[10px] text-indigo-400 font-semibold">{tpa.category}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                    {tpa.status}
                  </span>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5 text-xs font-mono">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-500 text-[10px] uppercase font-bold flex items-center gap-1 font-sans">
                      <PhoneCall className="w-3 h-3 text-emerald-400" /> Helpline:
                    </span>
                    <strong className="text-emerald-400 text-[11px]">{tpa.cashlessDeskPhone}</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-500 text-[10px] uppercase font-bold font-sans">Avg TAT:</span>
                    <span className="text-amber-400 font-bold">{tpa.avgTatHours} Hours</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-sans border-t border-slate-800 pt-1.5">
                    <strong className="text-slate-300">Coverage:</strong> {tpa.supportedInsurers.join(', ')}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                  <a
                    href={tpa.portalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold transition flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Open Trust Portal</span>
                  </a>

                  <button
                    onClick={() => {
                      setPreAuthForm((prev) => ({ ...prev, tpaName: tpa.name, providerName: tpa.name }));
                      if (tpa.category.includes('Govt')) {
                        setIsGovtSchemeModal(true);
                      } else {
                        setIsPreAuthModalOpen(true);
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-white border border-amber-500/30 text-[11px] font-bold transition"
                  >
                    Submit Pre-Auth
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. TAB 5: SETTLEMENT & CO-PAY LEDGER */}
      {activeTab === 'settlements' && (
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <span>Claims Financial Settlement &amp; Treasury Disbursement Ledger</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Reconciled Bank UTRs
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Breakdown of Govt Health Trust disbursements, Private TPA settlements, Non-Payable Deductions, and Patient Co-Pays.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-mono">
                  <th className="py-3 px-3">Claim &amp; Patient</th>
                  <th className="py-3 px-3">Payer / Health Scheme</th>
                  <th className="py-3 px-3">Total Billed</th>
                  <th className="py-3 px-3">Disbursed / Settled</th>
                  <th className="py-3 px-3">Deductions</th>
                  <th className="py-3 px-3">Patient Co-Pay</th>
                  <th className="py-3 px-3">Bank Settlement UTR</th>
                  <th className="py-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {insuranceClaims.map((claim) => {
                  const isGovt =
                    claim.providerName.toLowerCase().includes('aarogya') ||
                    claim.providerName.toLowerCase().includes('pm-jay') ||
                    claim.providerName.toLowerCase().includes('pmjay') ||
                    claim.providerName.toLowerCase().includes('ehs');
                  const deduction = claim.deductionAmount || (claim.status === 'Claim Settled' ? (isGovt ? 0 : 5500) : 0);
                  const coPay = claim.coPayAmount || (claim.status === 'Claim Settled' ? (isGovt ? 0 : 4500) : 0);

                  return (
                    <tr key={claim.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-3">
                        <strong className="text-white block font-bold">{claim.patientName}</strong>
                        <span className={`text-[10px] font-mono ${isGovt ? 'text-amber-400' : 'text-purple-400'}`}>
                          {claim.claimNo}
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="text-slate-200 block font-semibold">{claim.providerName}</span>
                        <span className="text-[10px] text-slate-500">{claim.tpaName}</span>
                      </td>

                      <td className="py-3.5 px-3 font-mono font-bold text-slate-200">
                        ₹{claim.preAuthAmount.toLocaleString()}
                      </td>

                      <td className="py-3.5 px-3 font-mono font-bold text-emerald-400">
                        ₹{claim.approvedAmount.toLocaleString()}
                      </td>

                      <td className="py-3.5 px-3 font-mono text-rose-300">
                        {deduction > 0 ? `₹${deduction.toLocaleString()}` : '₹0'}
                      </td>

                      <td className="py-3.5 px-3 font-mono text-amber-300">
                        {coPay > 0 ? `₹${coPay.toLocaleString()}` : isGovt ? '₹0 (100% Free)' : '₹0'}
                      </td>

                      <td className="py-3.5 px-3 font-mono text-slate-300">
                        {claim.settlementUtr ? (
                          <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] text-cyan-400">
                            {claim.settlementUtr}
                          </span>
                        ) : (
                          <span className="text-slate-500 italic text-[10px]">Pending Bank Credit</span>
                        )}
                      </td>

                      <td className="py-3.5 px-3">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${getStatusStyle(claim.status)}`}>
                          {claim.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 9. MODAL: DR. YSR AAROGYASRI & GOVT SCHEMES PRE-AUTH & FORMALITIES FORM */}
      {isGovtSchemeModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-slate-900 border border-amber-500/40 rounded-2xl p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto font-sans">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-6 h-6 text-amber-400" />
                <div>
                  <h3 className="text-base font-bold text-amber-300">
                    Aarogyasri / Ayushman Bharat (PM-JAY) Pre-Auth &amp; Formalities Submission
                  </h3>
                  <p className="text-[11px] text-slate-400">Government Health Care Trust Inpatient Cashless Initiation</p>
                </div>
              </div>
              <button onClick={() => setIsGovtSchemeModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handlePreAuthSubmit} className="space-y-4 text-xs">
              {/* Scheme Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Select Government Health Scheme *</label>
                  <select
                    value={preAuthForm.providerName}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPreAuthForm({
                        ...preAuthForm,
                        providerName: val,
                        tpaName: val.includes('Aarogya') ? 'Aarogya Mitra Govt Desk' : val.includes('PM-JAY') ? 'National Health Authority (NHA)' : 'State Health Agency',
                      });
                    }}
                    className="w-full bg-slate-950 border border-amber-500/40 rounded-xl px-3 py-2 text-amber-300 font-bold"
                    required
                  >
                    <option value="Dr. YSR Aarogyasri Health Care Trust">Dr. YSR Aarogyasri Health Care Trust (AP Govt)</option>
                    <option value="Ayushman Bharat (PM-JAY)">Ayushman Bharat (PM-JAY) - National Health Authority</option>
                    <option value="Employees Health Scheme (EHS)">Employees Health Scheme (EHS - AP Govt)</option>
                    <option value="Working Journalists Health Scheme (WJHS)">Working Journalists Health Scheme (WJHS)</option>
                    <option value="CGHS / ECHS Scheme">CGHS / ECHS Central Scheme</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Select Patient / Beneficiary *</label>
                  <select
                    value={preAuthForm.patientId}
                    onChange={(e) => {
                      const p = patients.find((pat) => pat.id === e.target.value);
                      if (p) {
                        const adm = admissions.find((a) => a.patientId === p.id && a.status === 'Admitted');
                        setPreAuthForm({
                          ...preAuthForm,
                          patientId: p.id,
                          policyNo: p.policyNumber || 'WAP08129910291',
                          memberId: `RATION-${p.uhid}`,
                          admissionId: adm ? adm.admissionId : preAuthForm.admissionId,
                          treatingDoctor: adm ? adm.attendingDoctor : preAuthForm.treatingDoctor,
                        });
                      }
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-bold"
                    required
                  >
                    <option value="">-- Choose Beneficiary Patient --</option>
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.uhid}) - {p.insuranceProvider || 'Aarogyasri / PM-JAY'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Card / Ration / Aadhaar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Aarogyasri Card / White Ration Card # *</label>
                  <input
                    type="text"
                    value={preAuthForm.policyNo}
                    onChange={(e) => setPreAuthForm({ ...preAuthForm, policyNo: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono font-bold"
                    placeholder="e.g. WAP08129910291"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">PM-JAY Golden Card / Member ID</label>
                  <input
                    type="text"
                    value={preAuthForm.memberId}
                    onChange={(e) => setPreAuthForm({ ...preAuthForm, memberId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono"
                    placeholder="e.g. GOLDEN-CARD-99182"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Sum Insured Limit (₹)</label>
                  <input
                    type="number"
                    value={preAuthForm.sumInsured}
                    readOnly
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-emerald-400 font-mono font-bold"
                  />
                </div>
              </div>

              {/* Govt Package Code Selector */}
              <div className="p-3.5 bg-slate-950 rounded-xl border border-amber-500/30 space-y-2">
                <label className="block text-amber-300 font-bold">Standard Government Package &amp; Tariff Code *</label>
                <select
                  value={preAuthForm.selectedPackageCode}
                  onChange={(e) => {
                    const code = e.target.value;
                    const pkg = GOVT_SCHEME_PACKAGES.find((p) => p.code === code);
                    if (pkg) {
                      setPreAuthForm({
                        ...preAuthForm,
                        selectedPackageCode: code,
                        diagnosis: `${pkg.code} - ${pkg.description}`,
                        preAuthAmount: pkg.govtTariff,
                      });
                    }
                  }}
                  className="w-full bg-slate-900 border border-amber-500/40 rounded-xl px-3 py-2 text-white font-bold"
                >
                  {GOVT_SCHEME_PACKAGES.map((pkg) => (
                    <option key={pkg.code} value={pkg.code}>
                      [{pkg.code}] {pkg.description} — ₹{pkg.govtTariff.toLocaleString()} ({pkg.specialty})
                    </option>
                  ))}
                </select>
                <div className="flex justify-between items-center text-[11px] text-slate-400">
                  <span>Selected Procedure Tariff:</span>
                  <strong className="text-emerald-400 font-mono text-sm font-black">
                    ₹{preAuthForm.preAuthAmount.toLocaleString()}.00 (100% Free Government Reimbursed)
                  </strong>
                </div>
              </div>

              {/* Mandatory Formalities Checklist */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2.5">
                <span className="text-amber-400 font-black text-xs block uppercase tracking-wider">
                  Mandatory Statutory Checklist (Required by Govt Health Trust)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preAuthForm.cardVerified}
                      onChange={(e) => setPreAuthForm({ ...preAuthForm, cardVerified: e.target.checked })}
                      className="accent-amber-500 w-4 h-4 rounded"
                    />
                    <span>1. Aarogyasri / Ration Card Verified at Desk</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preAuthForm.aadhaarOtpVerified}
                      onChange={(e) => setPreAuthForm({ ...preAuthForm, aadhaarOtpVerified: e.target.checked })}
                      className="accent-amber-500 w-4 h-4 rounded"
                    />
                    <span>2. Aadhaar Biometric / OTP Authenticated</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preAuthForm.diagnosticDocsAttached}
                      onChange={(e) => setPreAuthForm({ ...preAuthForm, diagnosticDocsAttached: e.target.checked })}
                      className="accent-amber-500 w-4 h-4 rounded"
                    />
                    <span>3. Pre-Op Diagnostics / Biopsy Uploaded</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preAuthForm.doctorRecommendationSigned}
                      onChange={(e) => setPreAuthForm({ ...preAuthForm, doctorRecommendationSigned: e.target.checked })}
                      className="accent-amber-500 w-4 h-4 rounded"
                    />
                    <span>4. Specialist Case Summary Signed</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preAuthForm.freeMedicineAcknowledged}
                      onChange={(e) => setPreAuthForm({ ...preAuthForm, freeMedicineAcknowledged: e.target.checked })}
                      className="accent-amber-500 w-4 h-4 rounded"
                    />
                    <span>5. Mandatory Free Post-Op Medicines Allocated</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preAuthForm.transportAllowanceProvided}
                      onChange={(e) => setPreAuthForm({ ...preAuthForm, transportAllowanceProvided: e.target.checked })}
                      className="accent-amber-500 w-4 h-4 rounded"
                    />
                    <span>6. Free Transport Allowance Slip Issued</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsGovtSchemeModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-extrabold shadow-lg shadow-amber-950/50"
                >
                  Submit Pre-Auth &amp; Transmit to Govt Health Trust
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 10. MODAL: PRIVATE TPA PRE-AUTH FORM */}
      {isPreAuthModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-purple-500/40 rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-purple-300 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-purple-400" />
                Submit Cashless Pre-Authorization Request (Private TPA)
              </h3>
              <button onClick={() => setIsPreAuthModalOpen(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handlePreAuthSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Select Patient *</label>
                  <select
                    value={preAuthForm.patientId}
                    onChange={(e) => {
                      const p = patients.find((pat) => pat.id === e.target.value);
                      if (p) {
                        const adm = admissions.find((a) => a.patientId === p.id && a.status === 'Admitted');
                        setPreAuthForm({
                          ...preAuthForm,
                          patientId: p.id,
                          providerName: p.insuranceProvider || 'Star Health & Allied Insurance',
                          policyNo: p.policyNumber || 'POL-88271-99',
                          memberId: `MEM-${p.uhid}`,
                          admissionId: adm ? adm.admissionId : preAuthForm.admissionId,
                          treatingDoctor: adm ? adm.attendingDoctor : preAuthForm.treatingDoctor,
                          diagnosis: adm ? adm.diagnosis : preAuthForm.diagnosis,
                        });
                      }
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-bold"
                    required
                  >
                    <option value="">-- Choose Insured Patient --</option>
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.uhid}) - {p.insuranceProvider || 'No Ins.'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Insurance Company *</label>
                  <input
                    type="text"
                    value={preAuthForm.providerName}
                    onChange={(e) => setPreAuthForm({ ...preAuthForm, providerName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">TPA Partner *</label>
                  <select
                    value={preAuthForm.tpaName}
                    onChange={(e) => setPreAuthForm({ ...preAuthForm, tpaName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-bold"
                  >
                    {empaneledTPAs.map((t) => (
                      <option key={t.id} value={t.name}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Policy Number *</label>
                  <input
                    type="text"
                    value={preAuthForm.policyNo}
                    onChange={(e) => setPreAuthForm({ ...preAuthForm, policyNo: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Member / TPA ID</label>
                  <input
                    type="text"
                    value={preAuthForm.memberId}
                    onChange={(e) => setPreAuthForm({ ...preAuthForm, memberId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Total Sum Insured (₹) *</label>
                  <input
                    type="number"
                    value={preAuthForm.sumInsured}
                    onChange={(e) => setPreAuthForm({ ...preAuthForm, sumInsured: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Pre-Auth Estimation Amount (₹) *</label>
                  <input
                    type="number"
                    value={preAuthForm.preAuthAmount}
                    onChange={(e) => setPreAuthForm({ ...preAuthForm, preAuthAmount: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-purple-500/50 rounded-xl px-3 py-2 text-purple-300 font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Provisional Diagnosis *</label>
                  <input
                    type="text"
                    value={preAuthForm.diagnosis}
                    onChange={(e) => setPreAuthForm({ ...preAuthForm, diagnosis: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Treating Consultant / Doctor *</label>
                  <input
                    type="text"
                    value={preAuthForm.treatingDoctor}
                    onChange={(e) => setPreAuthForm({ ...preAuthForm, treatingDoctor: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPreAuthModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold shadow-lg shadow-purple-950/50"
                >
                  Submit Pre-Auth &amp; Transmit to TPA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 11. MODAL: FORMALITIES CHECKLIST INSPECTOR */}
      {selectedGovtChecklistClaim && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-amber-500/40 rounded-2xl p-6 shadow-2xl space-y-4 text-xs font-sans">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-amber-300 font-bold">
                <Award className="w-5 h-5 text-amber-400" />
                <span>Govt Scheme Formalities &amp; Audit Trail</span>
              </div>
              <button onClick={() => setSelectedGovtChecklistClaim(null)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1 font-mono">
              <div className="flex justify-between text-slate-300">
                <span>Beneficiary:</span>
                <strong className="text-white font-sans">{selectedGovtChecklistClaim.patientName}</strong>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Scheme Card / Ration:</span>
                <span className="text-amber-400">{selectedGovtChecklistClaim.policyNo}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Sanctioned Limit:</span>
                <strong className="text-emerald-400">₹{selectedGovtChecklistClaim.approvedAmount.toLocaleString()}.00</strong>
              </div>
            </div>

            <div className="space-y-2 text-slate-200">
              <div className="flex items-center gap-2 p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <strong>Aarogya Mitra Intake Verification:</strong>
                  <div className="text-[10px] text-slate-400">Ration / Golden card matched with Aadhaar biometric.</div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <strong>Clinical Diagnostics &amp; Histopathology:</strong>
                  <div className="text-[10px] text-slate-400">Pre-op CAG / Biopsy films attached to Trust portal.</div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <strong>Mandatory Free Discharge Medicine Kit:</strong>
                  <div className="text-[10px] text-slate-400">30-day post-op medicine kit certified by hospital pharmacy.</div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <strong>Travel &amp; Transport Allowance Slip:</strong>
                  <div className="text-[10px] text-slate-400">Disbursed to beneficiary prior to discharge exit.</div>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedGovtChecklistClaim(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold"
              >
                Close Audit View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 12. MODAL: GUARANTEE OF PAYMENT (GOP) LETTER */}
      {selectedClaimForGOP && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white text-slate-900 rounded-2xl p-6 shadow-2xl space-y-4 font-sans text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h4 className="font-black text-sm text-purple-900 uppercase tracking-wider">
                  Guarantee of Payment (GOP) / Scheme Approval Letter
                </h4>
                <p className="text-[10px] text-slate-500">
                  {selectedClaimForGOP.providerName.includes('Aarogya') || selectedClaimForGOP.providerName.includes('PM-JAY')
                    ? 'Dr. YSR Aarogyasri / PM-JAY Cashless Admission Certificate'
                    : 'TPA Cashless Pre-Authorization Certificate'}
                </p>
              </div>
              <button
                onClick={() => setSelectedClaimForGOP(null)}
                className="text-slate-400 hover:text-slate-800 font-bold text-base"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 flex justify-between items-center">
              <div>
                <span className="text-[10px] text-purple-700 uppercase font-bold block">Authorization Reference</span>
                <span className="text-base font-black text-purple-900 font-mono">
                  GOP-{selectedClaimForGOP.claimNo.slice(4)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-purple-700 uppercase font-bold block">Sanctioned Cashless Limit</span>
                <span className="text-xl font-black text-emerald-600 font-mono">
                  ₹{selectedClaimForGOP.approvedAmount.toLocaleString()}.00
                </span>
              </div>
            </div>

            <div className="space-y-2 text-slate-700">
              <div className="grid grid-cols-2 gap-2 border-b border-slate-100 pb-2">
                <div>
                  <span className="text-[10px] text-slate-400 block">Beneficiary / Patient:</span>
                  <strong className="text-slate-900">{selectedClaimForGOP.patientName}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Patient UHID:</span>
                  <strong className="font-mono text-slate-900">{selectedClaimForGOP.patientUhid}</strong>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 border-b border-slate-100 pb-2">
                <div>
                  <span className="text-[10px] text-slate-400 block">Scheme / Payer:</span>
                  <strong className="text-slate-900">{selectedClaimForGOP.providerName}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Desk / TPA:</span>
                  <strong className="text-purple-700 font-bold">{selectedClaimForGOP.tpaName}</strong>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 border-b border-slate-100 pb-2">
                <div>
                  <span className="text-[10px] text-slate-400 block">Card / Ration / Policy ID:</span>
                  <strong className="font-mono text-slate-900">{selectedClaimForGOP.policyNo}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Procedure / Package:</span>
                  <strong className="text-slate-900">
                    {selectedClaimForGOP.diagnosis || 'Acute Inpatient Care'}
                  </strong>
                </div>
              </div>

              <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-[10px] text-amber-800 space-y-1">
                <strong>Statutory Terms &amp; Conditions:</strong>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>Treatment is 100% cashless for eligible scheme packages without out-of-pocket charges.</li>
                  <li>Free post-discharge prescribed medications (10–30 days) to be handed over at hospital pharmacy.</li>
                  <li>Final enhancement request must be submitted 12 hours prior to planned clinical discharge.</li>
                </ul>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => window.print()}
                className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official GOP Slip</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 13. MODAL: ENHANCE PRE-AUTH LIMIT */}
      {selectedClaimForEnhancement && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-purple-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-purple-300 flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4 text-purple-400" />
                Request Cashless Limit Enhancement
              </h3>
              <button onClick={() => setSelectedClaimForEnhancement(null)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmEnhancement} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px]">Patient:</span>
                <strong className="text-white text-sm block">{selectedClaimForEnhancement.patientName}</strong>
                <span className="text-slate-400 text-[10px]">
                  Current Approved: <strong className="text-emerald-400">₹{selectedClaimForEnhancement.approvedAmount.toLocaleString()}</strong>
                </span>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Additional Enhancement Amount (₹) *</label>
                <input
                  type="number"
                  value={enhancementAmount}
                  onChange={(e) => setEnhancementAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-purple-500/50 rounded-xl px-3 py-2 text-purple-300 font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Clinical Reason for Enhancement *</label>
                <textarea
                  rows={3}
                  value={enhancementReason}
                  onChange={(e) => setEnhancementReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedClaimForEnhancement(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold"
                >
                  Submit Enhancement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 14. MODAL: RESOLVE TPA DEFICIENCY QUERY */}
      {selectedClaimForQuery && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-amber-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                Resolve TPA / Health Trust Query
              </h3>
              <button onClick={() => setSelectedClaimForQuery(null)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmQueryResponse} className="space-y-4 text-xs">
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-1">
                <span className="text-amber-400 text-[10px] font-bold block">Deficiency Query Notice:</span>
                <p className="text-slate-200 text-xs">
                  {selectedClaimForQuery.queryDetails || 'Provide serial ECG records, Troponin-I values, and OT surgical notes.'}
                </p>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Hospital Clinical Response &amp; Justification *</label>
                <textarea
                  rows={3}
                  value={queryResponse}
                  onChange={(e) => setQueryResponse(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedClaimForQuery(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold"
                >
                  Dispatch Response to Portal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 15. MODAL: FINAL CLAIM SETTLEMENT */}
      {selectedClaimForSettlement && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-cyan-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-cyan-300 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-cyan-400" />
                Final Claim Settlement &amp; Bank UTR Reconciliation
              </h3>
              <button onClick={() => setSelectedClaimForSettlement(null)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmSettlement} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1 font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Patient / Beneficiary:</span>
                  <strong className="text-white font-sans">{selectedClaimForSettlement.patientName}</strong>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Total Billed:</span>
                  <strong className="text-slate-200">₹{selectedClaimForSettlement.preAuthAmount.toLocaleString()}</strong>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Final Settled / Disbursed Amount (₹) *</label>
                <input
                  type="number"
                  value={settlementData.finalApprovedAmount}
                  onChange={(e) => setSettlementData({ ...settlementData, finalApprovedAmount: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-emerald-500/50 rounded-xl px-3 py-2 text-emerald-300 font-mono font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Non-Payable Deductions (₹)</label>
                  <input
                    type="number"
                    value={settlementData.deductions}
                    onChange={(e) => setSettlementData({ ...settlementData, deductions: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-rose-300 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Patient Co-Pay (₹)</label>
                  <input
                    type="number"
                    value={settlementData.patientCoPay}
                    onChange={(e) => setSettlementData({ ...settlementData, patientCoPay: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-amber-300 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Treasury / Bank Payment Settlement UTR Number *</label>
                <input
                  type="text"
                  value={settlementData.settlementUtr}
                  onChange={(e) => setSettlementData({ ...settlementData, settlementUtr: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-cyan-300 font-mono font-bold"
                  placeholder="e.g. UTR-TREASURY-AP-8829101"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedClaimForSettlement(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold"
                >
                  Confirm Final Settlement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

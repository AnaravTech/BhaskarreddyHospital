import React, { useState, useMemo } from 'react';
import { useHospital } from '../../context/HospitalContext';
import {
  Building2,
  BedDouble,
  Stethoscope,
  Building,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Activity,
  Heart,
  Thermometer,
  Printer,
  Plus,
  Trash2,
  X,
  Droplets,
  Syringe,
  UserCheck,
  ShieldCheck,
  DollarSign,
  ClipboardCheck,
  Clock,
} from 'lucide-react';

export const IPDModule: React.FC = () => {
  const {
    admissions,
    doctors,
    departments,
    patients,
    currentUser,
    activeBranch,
    addToast,
    updatePatientEHR,
    updateBedStatus,
    setActiveModule,
  } = useHospital();

  const role = currentUser?.role;
  const isDoctorRole = role === 'doctor' || role === 'dmo' || role === 'admin' || role === 'ceo';
  const isNurseRole = role === 'nurse' || role === 'ward_manager';
  const isReceptionist = role === 'receptionist';

  // Granular Inpatient (IPD) Permissions:
  const canEditSOAP = isDoctorRole; // Attending Doctor / DMO only
  const canEditVitalsAndFluid = isDoctorRole || isNurseRole; // Nurses & Doctors can log vitals and I/O fluid chart
  const canPrescribeIpdMed = isDoctorRole; // Only Doctors can order/remove medications
  const canAdministerIpdMed = isDoctorRole || isNurseRole; // Nurses & Doctors can sign off dose administrations
  const canClearDischarge = isDoctorRole; // Only Doctors can sign and finalize discharge summaries

  // Resolve logged-in doctor profile
  const loggedInDoctor = useMemo(() => {
    if (!currentUser) return doctors[0];
    const match = doctors.find(
      (d) =>
        d.id === currentUser.id ||
        d.name.toLowerCase().includes(currentUser.name.toLowerCase()) ||
        currentUser.name.toLowerCase().includes(d.name.toLowerCase())
    );
    return match || doctors[0];
  }, [currentUser, doctors]);

  // Filters State
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('all');
  const [selectedDeptName, setSelectedDeptName] = useState<string>('all');
  const [wardFilter, setWardFilter] = useState<string>('all');
  const [censusTab, setCensusTab] = useState<'all' | 'admitted' | 'icu' | 'discharge_ready'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Selected Inpatient for Ward Round Workbench
  const [selectedAdmId, setSelectedAdmId] = useState<string>('');
  const [workbenchTab, setWorkbenchTab] = useState<'soap' | 'vitals_io' | 'mar' | 'discharge'>('soap');
  const [showDischargeModal, setShowDischargeModal] = useState(false);

  // Selected Doctor Object (for Receptionist/Nurse view)
  const currentDoctorObj = doctors.find((d) => d.id === selectedDoctorId);

  // Filter Admitted Inpatients dynamically:
  // IF DOCTOR: Locked strictly to doctor's assigned admissions (No Dropdown).
  // IF RECEPTIONIST / NURSE: Full access with dropdown filtering or show all hospital-wide.
  const filteredAdmissions = useMemo(() => {
    return admissions.filter((adm) => {
      // 1. Doctor & Department Filter
      let matchesDoc = true;
      let matchesDept = true;

      if (isDoctorRole) {
        matchesDoc = Boolean(
          adm.attendingDoctor.toLowerCase().includes(loggedInDoctor.name.toLowerCase()) ||
          (loggedInDoctor.name && adm.attendingDoctor.toLowerCase().includes(loggedInDoctor.name.replace('Dr. ', '').toLowerCase()))
        );
        
        matchesDept = Boolean(
          !loggedInDoctor.departmentName ||
          (adm.departmentName && adm.departmentName.toLowerCase().includes(loggedInDoctor.departmentName.toLowerCase())) ||
          (loggedInDoctor.departmentName && adm.departmentName && loggedInDoctor.departmentName.toLowerCase().includes(adm.departmentName.toLowerCase()))
        );
      } else {
        matchesDoc = Boolean(
          selectedDoctorId === 'all' ||
          (currentDoctorObj && adm.attendingDoctor.toLowerCase().includes(currentDoctorObj.name.toLowerCase()))
        );

        matchesDept = Boolean(
          selectedDeptName === 'all' ||
          (adm.departmentName && adm.departmentName.toLowerCase() === selectedDeptName.toLowerCase())
        );
      }

      // 3. Ward Filter
      const matchesWard =
        wardFilter === 'all' ||
        (adm.wardName && adm.wardName.toLowerCase().includes(wardFilter.toLowerCase()));

      // 4. Status / Stage Filter
      const matchesCensusTab =
        censusTab === 'all'
          ? true
          : censusTab === 'admitted'
          ? adm.status === 'Admitted'
          : censusTab === 'icu'
          ? adm.wardName.toLowerCase().includes('icu') || adm.bedNumber.toLowerCase().includes('icu')
          : adm.status === 'Transferred' || adm.status === 'Discharged';

      // 5. Search Query Filter
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        adm.patientName.toLowerCase().includes(q) ||
        adm.patientUhid.toLowerCase().includes(q) ||
        adm.admissionId.toLowerCase().includes(q) ||
        adm.bedNumber.toLowerCase().includes(q) ||
        adm.diagnosis.toLowerCase().includes(q);

      return matchesDoc && matchesDept && matchesWard && matchesCensusTab && matchesSearch;
    });
  }, [admissions, isDoctorRole, loggedInDoctor, selectedDoctorId, currentDoctorObj, selectedDeptName, wardFilter, censusTab, searchTerm]);

  // Active Inpatient
  const activeAdm = useMemo(() => {
    if (selectedAdmId) {
      const found = filteredAdmissions.find((a) => a.id === selectedAdmId);
      if (found) return found;
    }
    return filteredAdmissions[0] || null;
  }, [filteredAdmissions, selectedAdmId]);

  const activePatient = patients.find((p) => p.id === activeAdm?.patientId || p.uhid === activeAdm?.patientUhid);

  // SOAP Ward Round Form State
  const [soapRoundDate, setSoapRoundDate] = useState('2026-07-24');
  const [soapRoundTime, setSoapRoundTime] = useState('10:30 AM');
  const [roundType, setRoundType] = useState<'Morning Consultant Round' | 'Evening Review' | 'Emergency Call'>(
    'Morning Consultant Round'
  );
  const [painScore, setPainScore] = useState('2');
  const [soapSubjective, setSoapSubjective] = useState(
    'Patient reports restful sleep overnight. Mild surgical site soreness (VAS 2/10), no nausea or shortness of breath. Tolerating soft oral diet well.'
  );
  const [soapObjective, setSoapObjective] = useState(
    'Conscious, oriented, afebrile. Chest clear, bilateral air entry equal. S1 S2 heard, no murmurs. Abdomen soft, non-tender. Surgical dressing clean and intact without soakage. Minimal drain output (15ml serous).'
  );
  const [soapAssessment, setSoapAssessment] = useState(
    'Post-procedure Day 2 - Hemodynamically stable. Good clinical recovery. Inflammatory markers trending downwards. Ready for IV to oral antibiotic switch.'
  );
  const [soapPlan, setSoapPlan] = useState(
    '1. Switch IV Ceftriaxone to Tab. Cefixime 200mg BD.\n2. Step down from ICU / High-Dependency to Deluxe Ward.\n3. Encourage active ambulation with physiotherapy assistance.\n4. Repeat serum electrolytes tomorrow morning.'
  );

  // Vitals & Fluid Balance State
  const [inpatientVitals, setInpatientVitals] = useState({
    bp: '124/78',
    pulse: '72',
    temp: '98.6 °F',
    spO2: '99%',
    respRate: '16 /min',
    bloodSugar: '135 mg/dL',
  });

  const [fluidBalance, setFluidBalance] = useState({
    ivFluids: '1200',
    oralIntake: '800',
    urineOutput: '1550',
    drainOutput: '30',
  });

  const netBalance = useMemo(() => {
    const intake = (parseFloat(fluidBalance.ivFluids) || 0) + (parseFloat(fluidBalance.oralIntake) || 0);
    const output = (parseFloat(fluidBalance.urineOutput) || 0) + (parseFloat(fluidBalance.drainOutput) || 0);
    return intake - output;
  }, [fluidBalance]);

  // Inpatient Medication Administration Record (IPD MAR)
  const [ipdMeds, setIpdMeds] = useState([
    { id: 'm-1', drugName: 'Inj. Ceftriaxone 1g IV', route: 'IV Infusion', frequency: 'BD (1-0-1)', timing: '08:00 AM / 08:00 PM', status: 'Administered' },
    { id: 'm-2', drugName: 'Inj. Pantoprazole 40mg IV', route: 'Slow IV Push', frequency: 'OD (1-0-0)', timing: '07:00 AM (Fasting)', status: 'Administered' },
    { id: 'm-3', drugName: 'Inj. Paracetamol 1g IV Infusion', route: 'IV Drip', frequency: 'SOS / TDS', timing: 'As Needed for Pain/Fever', status: 'Active' },
    { id: 'm-4', drugName: 'Tab. Telmisartan 40mg', route: 'Oral', frequency: 'OD (1-0-0)', timing: '09:00 AM Post Meal', status: 'Administered' },
  ]);

  const [newIpdMed, setNewIpdMed] = useState({
    drugName: '',
    route: 'IV Infusion',
    frequency: 'BD (1-0-1)',
    timing: '08:00 AM / 08:00 PM',
  });

  const handleAddIpdMed = () => {
    if (!newIpdMed.drugName.trim()) return;
    setIpdMeds([...ipdMeds, { ...newIpdMed, id: `m-${Date.now()}`, status: 'Active' }]);
    setNewIpdMed({ drugName: '', route: 'IV Infusion', frequency: 'BD (1-0-1)', timing: '08:00 AM / 08:00 PM' });
  };

  const handleRemoveIpdMed = (id: string) => {
    setIpdMeds(ipdMeds.filter((m) => m.id !== id));
  };

  const handleToggleMedStatus = (id: string) => {
    if (!canAdministerIpdMed) {
      addToast('Permission Restricted', 'Medication administration sign-off is restricted to Nurses & Doctors.', 'error');
      return;
    }
    setIpdMeds((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              status: m.status === 'Administered' ? 'Active' : 'Administered',
            }
          : m
      )
    );
    addToast('MAR Dose Updated', 'Medication administration status updated in patient chart.', 'success');
  };

  // Top-Level Module View: Census vs. Multi-Stage Discharge Clearance Pipeline
  const [mainViewMode, setMainViewMode] = useState<'census' | 'discharge_pipeline'>('census');

  // Multi-Stage Role-Based Discharge Clearance Workflow State
  interface DischargePipelineRecord {
    id: string;
    admissionId: string;
    patientUhid: string;
    patientName: string;
    bedNumber: string;
    wardName: string;
    attendingDoctor: string;
    admissionDate: string;
    dischargeReason: string;
    // Stage 1: Doctor Clinical Clearance
    clinicalApproved: boolean;
    clinicalDoctorName?: string;
    clinicalApprovedAt?: string;
    conditionOnDischarge: string;
    hospitalCourse: string;
    dischargeDiet: string;
    followUpReview: string;
    // Stage 2: Nursing Care Checklist
    nursingApproved: boolean;
    nurseName?: string;
    nursingApprovedAt?: string;
    ivCannulaRemoved: boolean;
    catheterRemoved: boolean;
    woundDressed: boolean;
    vitalsStable: boolean;
    medsHandedOver: boolean;
    // Stage 3: Billing & Finance Settlement
    billingApproved: boolean;
    billingCashierName?: string;
    billingApprovedAt?: string;
    totalBillAmount: number;
    depositAdjusted: number;
    netPayable: number;
    paidAmount: number;
    dueAmount: number;
    // Stage 4: Insurance / TPA Clearance
    insuranceRequired: boolean;
    insuranceApproved: boolean;
    insuranceOfficerName?: string;
    insuranceApprovedAt?: string;
    claimApprovalNo?: string;
    // Stage 5: Reception Coordination & Documents Handover
    receptionHandoverDone: boolean;
    receptionistName?: string;
    receptionistAt?: string;
    // Stage 6: Bed Release
    bedReleased: boolean;
    bedReleasedAt?: string;
  }

  const [dischargePipelines, setDischargePipelines] = useState<DischargePipelineRecord[]>([
    {
      id: 'dc-101',
      admissionId: 'ADM-2026-00451',
      patientUhid: 'UHID-2026-0001',
      patientName: 'Rahul Kumar',
      bedNumber: 'ICU-02',
      wardName: 'Medical ICU',
      attendingDoctor: 'Dr. Vikram Reddy',
      admissionDate: '2026-08-28',
      dischargeReason: 'Routine Planned Post-Chemo Recovery',
      clinicalApproved: true,
      clinicalDoctorName: 'Dr. Vikram Reddy',
      clinicalApprovedAt: '02 Sep 2026, 09:30 AM',
      conditionOnDischarge: 'Hemodynamically Stable & Ambulatory',
      hospitalCourse: 'Admitted for targeted chemotherapy protocol. Vitals stable throughout. Responded well without acute adverse drug events.',
      dischargeDiet: 'High protein, soft bland diet, adequate hydration (2.5L/day).',
      followUpReview: 'Review in Medical Oncology OPD after 14 days with CBC and LFT.',
      nursingApproved: false,
      ivCannulaRemoved: true,
      catheterRemoved: true,
      woundDressed: true,
      vitalsStable: true,
      medsHandedOver: false,
      billingApproved: false,
      totalBillAmount: 48500,
      depositAdjusted: 25000,
      netPayable: 23500,
      paidAmount: 23500,
      dueAmount: 0,
      insuranceRequired: true,
      insuranceApproved: false,
      claimApprovalNo: 'TPA-MEDI-881920',
      receptionHandoverDone: false,
      bedReleased: false,
    },
    {
      id: 'dc-102',
      admissionId: 'ADM-2026-00452',
      patientUhid: 'UHID-2026-0002',
      patientName: 'Ananya Sharma',
      bedNumber: 'GW-05',
      wardName: 'Surgical Oncology Ward',
      attendingDoctor: 'Dr. Priya Sundaram',
      admissionDate: '2026-08-25',
      dischargeReason: 'Post-Surgical Resection Recovery',
      clinicalApproved: true,
      clinicalDoctorName: 'Dr. Priya Sundaram',
      clinicalApprovedAt: '02 Sep 2026, 08:45 AM',
      conditionOnDischarge: 'Surgical Wound Clean & Afebrile',
      hospitalCourse: 'Underwent laparoscopic tumor resection. Post-op recovery uneventful. Drain removed on POD-4.',
      dischargeDiet: 'Normal diabetic diet. Avoid straining.',
      followUpReview: 'Suture removal & pathology review in 7 days.',
      nursingApproved: true,
      nurseName: 'Staff Nurse Sunitha (RN)',
      nursingApprovedAt: '02 Sep 2026, 10:15 AM',
      ivCannulaRemoved: true,
      catheterRemoved: true,
      woundDressed: true,
      vitalsStable: true,
      medsHandedOver: true,
      billingApproved: true,
      billingCashierName: 'Accounts Cashier Ramesh',
      billingApprovedAt: '02 Sep 2026, 11:00 AM',
      totalBillAmount: 92000,
      depositAdjusted: 50000,
      netPayable: 42000,
      paidAmount: 42000,
      dueAmount: 0,
      insuranceRequired: false,
      insuranceApproved: true,
      receptionHandoverDone: false,
      bedReleased: false,
    },
    {
      id: 'dc-103',
      admissionId: 'ADM-2026-00448',
      patientUhid: 'UHID-2026-0003',
      patientName: 'Venkat Rao',
      bedNumber: 'DLX-01',
      wardName: 'Deluxe Private Ward',
      attendingDoctor: 'Dr. Vikram Reddy',
      admissionDate: '2026-08-22',
      dischargeReason: 'Radiation Therapy Cycle Completed',
      clinicalApproved: true,
      clinicalDoctorName: 'Dr. Vikram Reddy',
      clinicalApprovedAt: '01 Sep 2026, 05:00 PM',
      conditionOnDischarge: 'Stable & Discharged',
      hospitalCourse: 'Completed course of fractionated radiotherapy. Skin care regimen provided.',
      dischargeDiet: 'Nutritious balanced diet.',
      followUpReview: 'Review in 1 month with PET-CT.',
      nursingApproved: true,
      nurseName: 'Nurse In-charge Anita',
      nursingApprovedAt: '01 Sep 2026, 05:30 PM',
      ivCannulaRemoved: true,
      catheterRemoved: true,
      woundDressed: true,
      vitalsStable: true,
      medsHandedOver: true,
      billingApproved: true,
      billingCashierName: 'Accounts Cashier Ramesh',
      billingApprovedAt: '01 Sep 2026, 06:00 PM',
      totalBillAmount: 145000,
      depositAdjusted: 145000,
      netPayable: 0,
      paidAmount: 145000,
      dueAmount: 0,
      insuranceRequired: true,
      insuranceApproved: true,
      insuranceOfficerName: 'TPA Desk Officer Rajesh',
      insuranceApprovedAt: '01 Sep 2026, 06:15 PM',
      claimApprovalNo: 'TPA-STAR-771290',
      receptionHandoverDone: true,
      receptionistName: 'Receptionist Sravanthi',
      receptionistAt: '01 Sep 2026, 06:30 PM',
      bedReleased: true,
      bedReleasedAt: '01 Sep 2026, 06:45 PM',
    },
  ]);

  // Clearance Actions Handlers
  const handleApproveClinicalClearance = (pipeId: string) => {
    if (!isDoctorRole) {
      addToast('Permission Restricted', 'Only Attending Doctors can sign off clinical discharge clearance.', 'error');
      return;
    }
    setDischargePipelines((prev) =>
      prev.map((item) =>
        item.id === pipeId
          ? {
              ...item,
              clinicalApproved: true,
              clinicalDoctorName: currentUser?.name || 'Dr. Vikram Reddy',
              clinicalApprovedAt: new Date().toLocaleString(),
            }
          : item
      )
    );
    addToast('Clinical Clearance Approved', 'Doctor clinical discharge summary signed and approved.', 'success');
  };

  const handleApproveNursingClearance = (pipeId: string) => {
    if (!isNurseRole && !isDoctorRole) {
      addToast('Permission Restricted', 'Nursing clearance is restricted to Registered Nurses & Ward In-charges.', 'error');
      return;
    }
    setDischargePipelines((prev) =>
      prev.map((item) =>
        item.id === pipeId
          ? {
              ...item,
              nursingApproved: true,
              ivCannulaRemoved: true,
              catheterRemoved: true,
              woundDressed: true,
              vitalsStable: true,
              medsHandedOver: true,
              nurseName: currentUser?.name || 'Staff Nurse (RN)',
              nursingApprovedAt: new Date().toLocaleString(),
            }
          : item
      )
    );
    addToast('Nursing Checklist Completed', 'All post-discharge nursing checks and patient handover signed off.', 'success');
  };

  const handleApproveBillingClearance = (pipeId: string) => {
    if (role !== 'billing' && !isDoctorRole) {
      addToast('Permission Restricted', 'Billing clearance is restricted to Cashier & Accounts Department.', 'error');
      return;
    }
    setDischargePipelines((prev) =>
      prev.map((item) =>
        item.id === pipeId
          ? {
              ...item,
              billingApproved: true,
              billingCashierName: currentUser?.name || 'Chief Cashier',
              billingApprovedAt: new Date().toLocaleString(),
              dueAmount: 0,
            }
          : item
      )
    );
    addToast('Billing Clearance Cleared', 'Inpatient bill settled. Financial zero-dues clearance issued.', 'success');
  };

  const handleApproveInsuranceClearance = (pipeId: string) => {
    if (role !== 'insurance' && !isDoctorRole) {
      addToast('Permission Restricted', 'TPA Insurance clearance is restricted to Insurance Desk & TPA Coordinator.', 'error');
      return;
    }
    setDischargePipelines((prev) =>
      prev.map((item) =>
        item.id === pipeId
          ? {
              ...item,
              insuranceApproved: true,
              insuranceOfficerName: currentUser?.name || 'TPA Coordinator',
              insuranceApprovedAt: new Date().toLocaleString(),
            }
          : item
      )
    );
    addToast('TPA Insurance Cleared', 'Cashless claim approval verified and cleared for discharge.', 'success');
  };

  const handleCompleteReceptionHandover = (pipeId: string) => {
    if (!isReceptionist && !isDoctorRole) {
      addToast('Permission Restricted', 'Administrative document handover is coordinated by Reception Desk.', 'error');
      return;
    }
    setDischargePipelines((prev) =>
      prev.map((item) =>
        item.id === pipeId
          ? {
              ...item,
              receptionHandoverDone: true,
              receptionistName: currentUser?.name || 'Front Desk Executive',
              receptionistAt: new Date().toLocaleString(),
            }
          : item
      )
    );
    addToast('Handover Completed', 'Discharge certificate and bills handed to patient attendant.', 'success');
  };

  const handleReleaseBed = (pipeId: string, bedNumber: string) => {
    setDischargePipelines((prev) =>
      prev.map((item) =>
        item.id === pipeId
          ? {
              ...item,
              bedReleased: true,
              bedReleasedAt: new Date().toLocaleString(),
            }
          : item
      )
    );
    // Find bed by bedNumber if possible or update general bed
    updateBedStatus(bedNumber, 'Cleaning');
    addToast('Bed Released', `Bed ${bedNumber} released and transitioned to Housekeeping Cleaning status.`, 'success');
  };

  // Discharge Summary State
  const [dischargeData, setDischargeData] = useState({
    dischargeType: 'Routine Planned Discharge',
    conditionOnDischarge: 'Hemodynamically Stable & Ambulatory',
    hospitalCourse:
      'Patient was admitted under oncology/medicine for intensive monitoring and medical management. Responded well to protocolized IV therapy, serial vitals monitoring, and targeted therapy. Step-down care was uneventful. Discharged in stable condition on oral maintenance medications.',
    dischargeDiet: 'Diabetic, low-sodium, high-protein diet. Adequate water intake (2.5L/day).',
    followUpReview: 'Review in OPD with Dr. Vikram Reddy after 7 days with repeat CBC and biochemistry.',
    warningSigns: 'Immediate ER visit if recurrent high fever (>101°F), sudden shortness of breath, severe pain, or bleeding.',
  });

  // Census Quick Counts
  const censusCounts = useMemo(() => {
    const docAdms = admissions.filter((adm) => {
      const matchDoc =
        selectedDoctorId === 'all' ||
        (currentDoctorObj && adm.attendingDoctor.toLowerCase().includes(currentDoctorObj.name.toLowerCase()));
      const matchDept =
        selectedDeptName === 'all' ||
        (adm.departmentName && adm.departmentName.toLowerCase() === selectedDeptName.toLowerCase());
      return matchDoc && matchDept;
    });

    const total = docAdms.length;
    const admitted = docAdms.filter((a) => a.status === 'Admitted').length;
    const icu = docAdms.filter((a) => a.wardName.toLowerCase().includes('icu') || a.bedNumber.toLowerCase().includes('icu')).length;
    const dischargeReady = docAdms.filter((a) => a.status === 'Transferred' || a.status === 'Discharged').length;

    return { total, admitted, icu, dischargeReady };
  }, [admissions, selectedDoctorId, currentDoctorObj, selectedDeptName]);

  const handleSaveWardRound = () => {
    if (activePatient) {
      updatePatientEHR(activePatient.id, {
        vitals: {
          bp: inpatientVitals.bp,
          pulse: inpatientVitals.pulse,
          temp: inpatientVitals.temp,
          spo2: inpatientVitals.spO2,
          respRate: inpatientVitals.respRate,
          bmi: activePatient.vitals?.bmi || '22.9',
          weight: activePatient.vitals?.weight || '68 kg',
          height: activePatient.vitals?.height || '172 cm',
        },
        currentSummary: {
          diagnosis: activeAdm?.diagnosis || activePatient.currentSummary?.diagnosis || 'Inpatient Care',
          doctor: activeAdm?.attendingDoctor || 'Attending Physician',
          condition: 'Inpatient Under Treatment',
          treatment: soapPlan,
        },
        medications: ipdMeds.map((m) => ({
          drugName: m.drugName,
          dosage: m.frequency,
          frequency: m.frequency,
          duration: 'Inpatient Course',
          route: m.route,
          doctor: activeAdm?.attendingDoctor || 'Attending Doctor',
        })),
      });
    }

    addToast(
      'Ward Round SOAP Saved',
      `Doctor daily progress note and vitals updated in EHR for ${activeAdm?.patientName}`,
      'success'
    );
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* 1. Header & Inpatient Doctor/Department Filter Toolbar */}
      <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800/80 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" /> Inpatient Department (IPD) & Doctor Ward Rounds
              </span>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                Branch: {activeBranch.name}
              </span>
            </div>
            <h2 className="text-2xl font-black text-white mt-1">
              Inpatient Census, Bed Rounds & EHR Clinical Notes
            </h2>
            <p className="text-xs text-slate-400">
              Filter admitted patients by attending doctor or specialty, write daily SOAP progress notes, monitor fluid telemetry, and manage discharge summaries.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setActiveModule('bed-management')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold transition shadow"
            >
              <BedDouble className="w-4 h-4 text-purple-400" />
              <span>Ward Bed Grid</span>
            </button>

            {!isReceptionist && (
              <button
                onClick={() => setShowDischargeModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-extrabold transition shadow-lg shadow-purple-600/20"
              >
                <Printer className="w-4 h-4" />
                <span>Print Discharge Summary</span>
              </button>
            )}
          </div>
        </div>
        {isDoctorRole ? (
          /* DOCTOR LOGGED IN: Locked Personalized Inpatient Console (No Dropdown) */
          <div className="p-4 rounded-xl bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/80 border border-purple-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 font-black shrink-0">
                <Stethoscope className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-black text-white">{loggedInDoctor.name}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                    👨‍⚕️ Attending Inpatient Ward Rounds
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                    {loggedInDoctor.qualification || 'MBBS, MD'}
                  </span>
                </div>
                <div className="text-xs text-slate-300 mt-1 flex items-center gap-2 flex-wrap">
                  <span>Specialty: <strong className="text-purple-300">{loggedInDoctor.specialization}</strong></span>
                  <span className="text-slate-600">•</span>
                  <span>Department: <strong className="text-indigo-300">{loggedInDoctor.departmentName}</strong></span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-slate-950/80 px-4 py-2 rounded-xl border border-slate-800 shrink-0">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Your Inpatients</span>
                <span className="text-lg font-mono font-black text-purple-300">{filteredAdmissions.length} Admitted</span>
              </div>
            </div>
          </div>
        ) : (
          /* RECEPTIONIST / NURSE / ADMIN: Full Access with Attending Doctor & Department Dropdowns */
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="px-2.5 py-0.5 rounded-full font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" /> Full Inpatient Access (Reception Desk & Nursing Administration)
              </span>
              <span className="text-[11px] text-slate-400">
                Full hospital-wide census view across all wards and attending doctors.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
              {/* Attending Doctor Selector */}
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-purple-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Attending Doctor
                  </label>
                  <select
                    value={selectedDoctorId}
                    onChange={(e) => {
                      setSelectedDoctorId(e.target.value);
                      setSelectedAdmId('');
                    }}
                    className="w-full bg-transparent text-xs font-bold text-slate-100 focus:outline-none cursor-pointer truncate"
                  >
                    <option value="all" className="bg-slate-900">🌐 All Attending Doctors (Full Inpatient Census)</option>
                    {doctors.map((doc) => (
                      <option key={doc.id} value={doc.id} className="bg-slate-900">
                        {doc.name} — {doc.departmentName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Department Selector */}
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2">
                <Building className="w-4 h-4 text-indigo-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Clinical Specialty / Dept
                  </label>
                  <select
                    value={selectedDeptName}
                    onChange={(e) => {
                      setSelectedDeptName(e.target.value);
                      setSelectedAdmId('');
                    }}
                    className="w-full bg-transparent text-xs font-bold text-slate-100 focus:outline-none cursor-pointer truncate"
                  >
                    <option value="all" className="bg-slate-900">🌐 All Hospital Departments</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.name} className="bg-slate-900">
                        {dept.name} ({dept.headDoctor})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Ward Selector */}
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2">
                <BedDouble className="w-4 h-4 text-cyan-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Ward Category
                  </label>
                  <select
                    value={wardFilter}
                    onChange={(e) => {
                      setWardFilter(e.target.value);
                      setSelectedAdmId('');
                    }}
                    className="w-full bg-transparent text-xs font-bold text-slate-100 focus:outline-none cursor-pointer truncate"
                  >
                    <option value="all" className="bg-slate-900">🌐 All Wards & Units</option>
                    <option value="icu" className="bg-slate-900">🚨 ICU & Critical Care Suites</option>
                    <option value="private" className="bg-slate-900">👑 Deluxe Private Rooms</option>
                    <option value="general" className="bg-slate-900">🏥 General Wards (Male/Female)</option>
                    <option value="isolation" className="bg-slate-900">🛡️ Isolation & Special Units</option>
                  </select>
                </div>
              </div>

              {/* Doctor Inpatient Summary */}
              <div className="p-2.5 rounded-xl bg-purple-500/5 border border-purple-500/20 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold text-purple-400 uppercase">
                    {currentDoctorObj ? `Inpatient Roster: ${currentDoctorObj.name}` : 'Hospital-Wide Ward Census'}
                  </div>
                  <div className="text-xs font-extrabold text-slate-200 mt-0.5">
                    {currentDoctorObj ? currentDoctorObj.specialization : 'All Inpatient Beds'}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-semibold">Filtered Inpatients</span>
                  <span className="text-base font-mono font-black text-purple-300">{filteredAdmissions.length}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Mode Switcher */}
        <div className="flex items-center gap-2 border-t border-slate-800 pt-3">
          <button
            type="button"
            onClick={() => setMainViewMode('census')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              mainViewMode === 'census'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <BedDouble className="w-4 h-4" />
            <span>Active Admissions & Ward Rounds ({filteredAdmissions.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setMainViewMode('discharge_pipeline')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              mainViewMode === 'discharge_pipeline'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-950/50'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Multi-Role Discharge Clearance Pipeline ({dischargePipelines.length})</span>
          </button>
        </div>
      </div>

      {mainViewMode === 'census' ? (
        /* 2. Main Layout: Left Inpatient Census Column & Right Ward Round Workbench Column */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: Inpatient Census List */}
          <div className="lg:col-span-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-purple-400" />
              <span>Admitted Inpatient Census</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono font-extrabold bg-purple-500/20 text-purple-300">
                {filteredAdmissions.length}
              </span>
            </h3>
          </div>

          {/* Census Category Tabs */}
          <div className="grid grid-cols-4 gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-bold">
            <button
              onClick={() => setCensusTab('all')}
              className={`py-1.5 rounded-lg transition text-center ${
                censusTab === 'all' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({censusCounts.total})
            </button>
            <button
              onClick={() => setCensusTab('admitted')}
              className={`py-1.5 rounded-lg transition text-center ${
                censusTab === 'admitted' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Bed ({censusCounts.admitted})
            </button>
            <button
              onClick={() => setCensusTab('icu')}
              className={`py-1.5 rounded-lg transition text-center ${
                censusTab === 'icu' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ICU ({censusCounts.icu})
            </button>
            <button
              onClick={() => setCensusTab('discharge_ready')}
              className={`py-1.5 rounded-lg transition text-center ${
                censusTab === 'discharge_ready' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Discharge
            </button>
          </div>

          {/* Search Census */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search patient, UHID, Bed #, diagnosis..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Inpatient Cards List */}
          <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
            {filteredAdmissions.length === 0 ? (
              <div className="text-center py-12 px-4 rounded-xl bg-slate-950/40 border border-slate-800/80 text-slate-500 text-xs">
                No inpatients matching the selected doctor/department/ward filter.
              </div>
            ) : (
              filteredAdmissions.map((adm) => {
                const isSelected = activeAdm?.id === adm.id;
                const isICU = adm.wardName.toLowerCase().includes('icu') || adm.bedNumber.toLowerCase().includes('icu');

                return (
                  <div
                    key={adm.id}
                    onClick={() => setSelectedAdmId(adm.id)}
                    className={`p-3.5 rounded-xl border transition cursor-pointer relative overflow-hidden ${
                      isSelected
                        ? 'bg-slate-800/95 border-purple-500 shadow-md shadow-purple-950/50'
                        : 'bg-slate-950/50 border-slate-800/80 hover:bg-slate-800/40'
                    }`}
                  >
                    {/* Left Indicator Line */}
                    {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-purple-400" />}

                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-mono text-xs font-black px-2 py-0.5 rounded border ${
                            isICU
                              ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                              : 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                          }`}
                        >
                          Bed: {adm.bedNumber}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 font-semibold">{adm.admissionId}</span>
                      </div>

                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                        {adm.wardName}
                      </span>
                    </div>

                    <div className="mt-2.5">
                      <div className="text-xs font-extrabold text-slate-100 flex items-center justify-between">
                        <span>{adm.patientName}</span>
                        <span className="font-mono text-[10px] font-semibold text-purple-400">{adm.patientUhid}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                        <span className="text-slate-300 font-medium truncate max-w-[200px]">{adm.diagnosis}</span>
                        <span className="text-[10px] text-slate-500 font-mono shrink-0">{adm.admittedDate.split(' ')[0]}</span>
                      </div>
                      <div className="text-[10px] text-purple-300/80 mt-1 font-semibold flex items-center justify-between">
                        <span>Attending: {adm.attendingDoctor}</span>
                        <span className="text-emerald-400 font-mono">Adv: ₹{adm.depositAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Inpatient Ward Rounds & Clinical Encounter Workbench */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-6">
          {activeAdm ? (
            <>
              {/* Patient Inpatient Banner */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 font-extrabold text-lg shrink-0">
                      {activeAdm.patientName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-black text-white">{activeAdm.patientName}</h3>
                        <span className="font-mono text-xs font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/30">
                          {activeAdm.patientUhid}
                        </span>
                        <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
                          {activeAdm.bedNumber} ({activeAdm.wardName})
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-1 flex items-center gap-2 flex-wrap font-medium">
                        <span>{activeAdm.age} Yrs • {activeAdm.gender}</span>
                        <span className="text-slate-600">•</span>
                        <span>Blood Group: <strong className="text-slate-200">{activePatient?.bloodGroup || 'O+ve'}</strong></span>
                        <span className="text-slate-600">•</span>
                        <span>Admitted: <strong className="text-slate-200 font-mono">{activeAdm.admittedDate}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:items-end gap-1">
                    <div className="text-xs text-slate-400">
                      Attending Consultant: <strong className="text-slate-100">{activeAdm.attendingDoctor}</strong>
                    </div>
                    <div className="text-[11px] text-purple-400 font-semibold">{activeAdm.departmentName}</div>
                    <div className="text-[10px] font-mono text-emerald-400 font-bold">
                      Deposit: ₹{activeAdm.depositAmount.toLocaleString()} | Est Bill: ₹{activeAdm.totalEstimatedBill.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Inpatient Alerts & Clinical Highlights */}
                <div className="flex items-center justify-between gap-3 pt-2.5 border-t border-slate-800/80 flex-wrap text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-400 uppercase text-[10px]">Primary Diagnosis:</span>
                    <span className="font-extrabold text-slate-200">{activeAdm.diagnosis}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-rose-400 font-bold flex items-center gap-1 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                      <AlertTriangle className="w-3 h-3" /> Allergy: Penicillin / Sulfa
                    </span>
                    <span className="text-cyan-400 font-semibold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                      Diet: Diabetic Low-Salt
                    </span>
                  </div>
                </div>
              </div>

              {isReceptionist ? (
                /* RECEPTIONIST LIMITED VIEW: Front-Desk Inpatient Inquiry & Room Information */
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-purple-300">
                      <Building2 className="w-4 h-4" />
                      <span>Front-Desk Inpatient Inquiry (Read-Only Bed & Admission Details)</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      Clinical Charting: Locked to Doctors & Nurses
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Admission Information */}
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                      <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                        <BedDouble className="w-4 h-4 text-purple-400" />
                        Inpatient Stay & Allotment
                      </h4>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                          <span className="text-slate-400">Admission ID:</span>
                          <span className="font-mono font-bold text-purple-300">{activeAdm.admissionId}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                          <span className="text-slate-400">Allocated Bed:</span>
                          <span className="font-mono font-bold text-cyan-300">{activeAdm.bedNumber} ({activeAdm.wardName})</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                          <span className="text-slate-400">Admission Date:</span>
                          <span className="font-mono text-slate-200">{activeAdm.admittedDate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Room Daily Tariff:</span>
                          <span className="font-mono font-bold text-emerald-400">₹{activeAdm.wardName.toLowerCase().includes('icu') ? '4,500' : '1,500'}/day</span>
                        </div>
                      </div>
                    </div>

                    {/* Consultant & Billing Status */}
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                      <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                        <Stethoscope className="w-4 h-4 text-cyan-400" />
                        Attending Care Team & Deposit
                      </h4>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                          <span className="text-slate-400">Attending Doctor:</span>
                          <span className="font-bold text-slate-100">{activeAdm.attendingDoctor}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                          <span className="text-slate-400">Department:</span>
                          <span className="text-slate-200">{activeAdm.departmentName || 'General Medicine'}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                          <span className="text-slate-400">Initial Advance Paid:</span>
                          <span className="font-mono font-bold text-emerald-400">₹{activeAdm.depositAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Patient Status:</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            {activeAdm.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>
                      For bedside medicine chart administration, fluid balance recording, and discharge summary printing, please contact the <strong>Ward Nursing In-Charge</strong> or <strong>Attending Physician</strong>.
                    </span>
                  </div>
                </div>
              ) : (
                /* DOCTOR & NURSE FULL CLINICAL WORKBENCH */
                <>
                  {/* Workbench Tabs */}
                  <div className="flex items-center gap-2 border-b border-slate-800 pb-2 flex-wrap">
                    <button
                      onClick={() => setWorkbenchTab('soap')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        workbenchTab === 'soap'
                          ? 'bg-purple-600 text-white shadow-md shadow-purple-950/40'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Daily Doctor Round & SOAP Notes</span>
                    </button>

                    <button
                      onClick={() => setWorkbenchTab('vitals_io')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        workbenchTab === 'vitals_io'
                          ? 'bg-purple-600 text-white shadow-md shadow-purple-950/40'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                      }`}
                    >
                      <Activity className="w-3.5 h-3.5" />
                      <span>Vitals Telemetry & I/O Fluid Balance</span>
                    </button>

                    <button
                      onClick={() => setWorkbenchTab('mar')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        workbenchTab === 'mar'
                          ? 'bg-purple-600 text-white shadow-md shadow-purple-950/40'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                      }`}
                    >
                      <Syringe className="w-3.5 h-3.5" />
                      <span>Inpatient MAR (Medications: {ipdMeds.length})</span>
                    </button>

                    <button
                      onClick={() => setWorkbenchTab('discharge')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        workbenchTab === 'discharge'
                          ? 'bg-purple-600 text-white shadow-md shadow-purple-950/40'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                      }`}
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Discharge Planning & Summary</span>
                    </button>
                  </div>

              {/* TAB 1: SOAP Daily Doctor Round Notes */}
              {workbenchTab === 'soap' && (
                <div className="space-y-5">
                  {/* Round Metadata Bar */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Doctor Round Type {!canEditSOAP && <span className="text-slate-500 lowercase">(locked)</span>}
                      </label>
                      <select
                        disabled={!canEditSOAP}
                        value={roundType}
                        onChange={(e) => setRoundType(e.target.value as any)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-100 font-bold focus:outline-none disabled:opacity-75 disabled:cursor-not-allowed"
                      >
                        <option value="Morning Consultant Round">🌅 Morning Consultant Ward Round</option>
                        <option value="Evening Review">🌆 Evening Clinical Review</option>
                        <option value="Emergency Call">🚨 SOS / Emergency Bedside Call</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Round Timestamp {!canEditSOAP && <span className="text-slate-500 lowercase">(locked)</span>}
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="date"
                          disabled={!canEditSOAP}
                          value={soapRoundDate}
                          onChange={(e) => setSoapRoundDate(e.target.value)}
                          className="w-1/2 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-slate-100 font-mono text-[11px] disabled:opacity-75 disabled:cursor-not-allowed"
                        />
                        <input
                          type="text"
                          disabled={!canEditSOAP}
                          value={soapRoundTime}
                          onChange={(e) => setSoapRoundTime(e.target.value)}
                          className="w-1/2 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-slate-100 font-mono text-[11px] disabled:opacity-75 disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Visual Analog Pain Score (0 - 10)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          disabled={!canEditSOAP}
                          min="0"
                          max="10"
                          value={painScore}
                          onChange={(e) => setPainScore(e.target.value)}
                          className="flex-1 accent-purple-500 disabled:opacity-75 disabled:cursor-not-allowed"
                        />
                        <span className="font-mono font-bold text-purple-300 px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/30">
                          {painScore} / 10
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* SOAP Structure Sections */}
                  <div className="space-y-4">
                    {/* S - Subjective */}
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-extrabold text-purple-400 flex items-center gap-1.5">
                          <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-mono">S</span>
                          SUBJECTIVE — Patient Complaints & Overnight Events {!canEditSOAP && <span className="text-slate-500 font-normal lowercase">(read-only)</span>}
                        </span>
                        <span className="text-[10px] text-slate-500">Sleep, Pain, Nausea, Bowel</span>
                      </div>
                      <textarea
                        rows={2}
                        readOnly={!canEditSOAP}
                        value={soapSubjective}
                        onChange={(e) => setSoapSubjective(e.target.value)}
                        className={`w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500 font-medium ${!canEditSOAP ? 'cursor-default opacity-85' : ''}`}
                      />
                    </div>

                    {/* O - Objective */}
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-extrabold text-cyan-400 flex items-center gap-1.5">
                          <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-mono">O</span>
                          OBJECTIVE — Physical Examination & Clinical Findings {!canEditSOAP && <span className="text-slate-500 font-normal lowercase">(read-only)</span>}
                        </span>
                        <span className="text-[10px] text-slate-500">CVS, RS, PA, Drains, Surgical Site</span>
                      </div>
                      <textarea
                        rows={2}
                        readOnly={!canEditSOAP}
                        value={soapObjective}
                        onChange={(e) => setSoapObjective(e.target.value)}
                        className={`w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-medium ${!canEditSOAP ? 'cursor-default opacity-85' : ''}`}
                      />
                    </div>

                    {/* A - Assessment */}
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-extrabold text-amber-400 flex items-center gap-1.5">
                          <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono">A</span>
                          ASSESSMENT — Clinical Progression & Stability {!canEditSOAP && <span className="text-slate-500 font-normal lowercase">(read-only)</span>}
                        </span>
                        <span className="text-[10px] text-slate-500">Response to Therapy, Lab trends</span>
                      </div>
                      <textarea
                        rows={2}
                        readOnly={!canEditSOAP}
                        value={soapAssessment}
                        onChange={(e) => setSoapAssessment(e.target.value)}
                        className={`w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-medium ${!canEditSOAP ? 'cursor-default opacity-85' : ''}`}
                      />
                    </div>

                    {/* P - Plan */}
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-extrabold text-emerald-400 flex items-center gap-1.5">
                          <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono">P</span>
                          PLAN — Treatment Orders, Step-Down & Discharge Readiness {!canEditSOAP && <span className="text-slate-500 font-normal lowercase">(read-only)</span>}
                        </span>
                        <span className="text-[10px] text-slate-500">Medications, Diet, Physio</span>
                      </div>
                      <textarea
                        rows={3}
                        readOnly={!canEditSOAP}
                        value={soapPlan}
                        onChange={(e) => setSoapPlan(e.target.value)}
                        className={`w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 font-mono ${!canEditSOAP ? 'cursor-default opacity-85' : ''}`}
                      />
                    </div>
                  </div>

                  {/* Save Round Action Bar */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                    <div className="text-xs text-slate-400">
                      Attending Consultant: <strong className="text-slate-200">{activeAdm.attendingDoctor}</strong>
                    </div>
                    {canEditSOAP ? (
                      <button
                        onClick={handleSaveWardRound}
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-extrabold shadow-lg shadow-purple-600/30 transition flex items-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Save Daily Doctor Round Note</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-400 bg-amber-500/10 px-4 py-2 rounded-xl border border-amber-500/30">
                        <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>🔒 Ward Round SOAP notes can only be authored and signed by the Attending Physician.</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: Vitals Telemetry & I/O Fluid Balance */}
              {workbenchTab === 'vitals_io' && (
                <div className="space-y-6">
                  {/* Inpatient Vitals Grid */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-purple-400" /> Inpatient Bedside Vitals Telemetry
                        {!canEditVitalsAndFluid && <span className="text-[10px] text-slate-500 font-normal lowercase">(read-only)</span>}
                      </h4>
                      {!canEditVitalsAndFluid && (
                        <span className="text-[10px] text-amber-400 font-semibold flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" /> Nurse & Doctor Access Only
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Heart className="w-3 h-3 text-rose-400" /> Blood Pressure
                        </div>
                        <input
                          type="text"
                          readOnly={!canEditVitalsAndFluid}
                          value={inpatientVitals.bp}
                          onChange={(e) => setInpatientVitals({ ...inpatientVitals, bp: e.target.value })}
                          className={`w-full bg-transparent text-sm font-bold text-slate-100 focus:outline-none mt-1 ${!canEditVitalsAndFluid ? 'cursor-default' : ''}`}
                        />
                      </div>

                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Activity className="w-3 h-3 text-cyan-400" /> Pulse (bpm)
                        </div>
                        <input
                          type="text"
                          readOnly={!canEditVitalsAndFluid}
                          value={inpatientVitals.pulse}
                          onChange={(e) => setInpatientVitals({ ...inpatientVitals, pulse: e.target.value })}
                          className={`w-full bg-transparent text-sm font-bold text-slate-100 focus:outline-none mt-1 ${!canEditVitalsAndFluid ? 'cursor-default' : ''}`}
                        />
                      </div>

                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Thermometer className="w-3 h-3 text-amber-400" /> Temp (°F)
                        </div>
                        <input
                          type="text"
                          readOnly={!canEditVitalsAndFluid}
                          value={inpatientVitals.temp}
                          onChange={(e) => setInpatientVitals({ ...inpatientVitals, temp: e.target.value })}
                          className={`w-full bg-transparent text-sm font-bold text-slate-100 focus:outline-none mt-1 ${!canEditVitalsAndFluid ? 'cursor-default' : ''}`}
                        />
                      </div>

                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                        <div className="text-[10px] text-slate-400">SpO2 Oxygen</div>
                        <input
                          type="text"
                          readOnly={!canEditVitalsAndFluid}
                          value={inpatientVitals.spO2}
                          onChange={(e) => setInpatientVitals({ ...inpatientVitals, spO2: e.target.value })}
                          className={`w-full bg-transparent text-sm font-bold text-slate-100 focus:outline-none mt-1 ${!canEditVitalsAndFluid ? 'cursor-default' : ''}`}
                        />
                      </div>

                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                        <div className="text-[10px] text-slate-400">Resp Rate</div>
                        <input
                          type="text"
                          readOnly={!canEditVitalsAndFluid}
                          value={inpatientVitals.respRate}
                          onChange={(e) => setInpatientVitals({ ...inpatientVitals, respRate: e.target.value })}
                          className={`w-full bg-transparent text-sm font-bold text-slate-100 focus:outline-none mt-1 ${!canEditVitalsAndFluid ? 'cursor-default' : ''}`}
                        />
                      </div>

                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                        <div className="text-[10px] text-slate-400">Blood Sugar</div>
                        <input
                          type="text"
                          readOnly={!canEditVitalsAndFluid}
                          value={inpatientVitals.bloodSugar}
                          onChange={(e) => setInpatientVitals({ ...inpatientVitals, bloodSugar: e.target.value })}
                          className={`w-full bg-transparent text-sm font-bold text-slate-100 focus:outline-none mt-1 ${!canEditVitalsAndFluid ? 'cursor-default' : ''}`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* 24-Hour Input / Output Fluid Balance Monitoring */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Droplets className="w-3.5 h-3.5 text-cyan-400" /> 24-Hour Input / Output Fluid Balance
                        {!canEditVitalsAndFluid && <span className="text-[10px] text-slate-500 font-normal lowercase">(read-only)</span>}
                      </h4>
                      <div
                        className={`text-xs font-mono font-black px-2.5 py-0.5 rounded-lg border ${
                          netBalance >= 0
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        }`}
                      >
                        Net Fluid Balance: {netBalance > 0 ? `+${netBalance}` : netBalance} mL
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-[10px] text-slate-400 font-bold block">IV Infusions (mL)</span>
                        <input
                          type="number"
                          readOnly={!canEditVitalsAndFluid}
                          value={fluidBalance.ivFluids}
                          onChange={(e) => setFluidBalance({ ...fluidBalance, ivFluids: e.target.value })}
                          className={`w-full bg-transparent text-sm font-bold text-cyan-300 focus:outline-none mt-1 ${!canEditVitalsAndFluid ? 'cursor-default' : ''}`}
                        />
                      </div>

                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-[10px] text-slate-400 font-bold block">Oral Intake (mL)</span>
                        <input
                          type="number"
                          readOnly={!canEditVitalsAndFluid}
                          value={fluidBalance.oralIntake}
                          onChange={(e) => setFluidBalance({ ...fluidBalance, oralIntake: e.target.value })}
                          className={`w-full bg-transparent text-sm font-bold text-cyan-300 focus:outline-none mt-1 ${!canEditVitalsAndFluid ? 'cursor-default' : ''}`}
                        />
                      </div>

                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-[10px] text-slate-400 font-bold block">Urine Output (mL)</span>
                        <input
                          type="number"
                          readOnly={!canEditVitalsAndFluid}
                          value={fluidBalance.urineOutput}
                          onChange={(e) => setFluidBalance({ ...fluidBalance, urineOutput: e.target.value })}
                          className={`w-full bg-transparent text-sm font-bold text-amber-300 focus:outline-none mt-1 ${!canEditVitalsAndFluid ? 'cursor-default' : ''}`}
                        />
                      </div>

                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-[10px] text-slate-400 font-bold block">Drain / RT Output (mL)</span>
                        <input
                          type="number"
                          readOnly={!canEditVitalsAndFluid}
                          value={fluidBalance.drainOutput}
                          onChange={(e) => setFluidBalance({ ...fluidBalance, drainOutput: e.target.value })}
                          className={`w-full bg-transparent text-sm font-bold text-amber-300 focus:outline-none mt-1 ${!canEditVitalsAndFluid ? 'cursor-default' : ''}`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: Inpatient Medication Administration Record (IPD MAR) */}
              {workbenchTab === 'mar' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div>
                      <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                        <Syringe className="w-4 h-4 text-purple-400" />
                        <span>Inpatient Medication Administration Record (MAR)</span>
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Active IV infusions, scheduled injectables, oral tablets, and nurse administration logs.
                      </p>
                    </div>
                  </div>

                  {/* Active Inpatient Medication List */}
                  <div className="space-y-2">
                    {ipdMeds.map((med) => (
                      <div
                        key={med.id}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-0.5">
                          <div className="font-extrabold text-slate-100 flex items-center gap-2">
                            <span>{med.drugName}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                              {med.route}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-semibold">
                            Frequency: <strong className="text-slate-300">{med.frequency}</strong> • Scheduled Timing: {med.timing}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleMedStatus(med.id)}
                            disabled={!canAdministerIpdMed}
                            title={canAdministerIpdMed ? 'Click to toggle dose administration status' : 'Dose sign-off restricted to Nursing Staff'}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition ${
                              med.status === 'Administered'
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                                : 'bg-blue-500/20 text-blue-300 border-blue-500/40 hover:bg-blue-500/30'
                            } ${!canAdministerIpdMed ? 'cursor-default opacity-85' : 'cursor-pointer active:scale-95'}`}
                          >
                            {med.status === 'Administered' ? '✓ Administered (Nurse Signed)' : '⏳ Scheduled Dose'}
                          </button>
                          {canPrescribeIpdMed && (
                            <button
                              onClick={() => handleRemoveIpdMed(med.id)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 transition hover:bg-slate-900"
                              title="Discontinue Medication"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add New Inpatient Medication - ONLY when canPrescribeIpdMed */}
                  {canPrescribeIpdMed ? (
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                      <input
                        type="text"
                        placeholder="Medication & Strength (e.g. Inj. Meropenem 1g IV)"
                        value={newIpdMed.drugName}
                        onChange={(e) => setNewIpdMed({ ...newIpdMed, drugName: e.target.value })}
                        className="sm:col-span-5 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                      />
                      <select
                        value={newIpdMed.route}
                        onChange={(e) => setNewIpdMed({ ...newIpdMed, route: e.target.value })}
                        className="sm:col-span-3 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                      >
                        <option value="IV Infusion">IV Infusion</option>
                        <option value="Slow IV Push">Slow IV Push</option>
                        <option value="IM Injection">IM Injection</option>
                        <option value="Subcutaneous (SC)">Subcutaneous (SC)</option>
                        <option value="Oral Tablet/Syrup">Oral Tablet/Syrup</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Frequency (TDS / BD / OD)"
                        value={newIpdMed.frequency}
                        onChange={(e) => setNewIpdMed({ ...newIpdMed, frequency: e.target.value })}
                        className="sm:col-span-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                      />
                      <button
                        type="button"
                        onClick={handleAddIpdMed}
                        className="sm:col-span-2 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow transition flex items-center justify-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Order</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800">
                      <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0" />
                      <span>Inpatient drug prescriptions can only be ordered or discontinued by Attending Doctors.</span>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: Discharge Planning & Summary Builder */}
              {workbenchTab === 'discharge' && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-400" /> Physician Inpatient Discharge Summary
                        {!canClearDischarge && <span className="text-[10px] text-slate-500 font-normal lowercase">(locked)</span>}
                      </h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                        {dischargeData.dischargeType}
                      </span>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                          Hospital Course & Treatment Rendered {!canClearDischarge && <span className="text-slate-500 lowercase">(read-only)</span>}
                        </label>
                        <textarea
                          rows={3}
                          readOnly={!canClearDischarge}
                          value={dischargeData.hospitalCourse}
                          onChange={(e) => setDischargeData({ ...dischargeData, hospitalCourse: e.target.value })}
                          className={`w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500 ${!canClearDischarge ? 'cursor-default opacity-85' : ''}`}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                            Discharge Dietary & Lifestyle Advice {!canClearDischarge && <span className="text-slate-500 lowercase">(read-only)</span>}
                          </label>
                          <textarea
                            rows={2}
                            readOnly={!canClearDischarge}
                            value={dischargeData.dischargeDiet}
                            onChange={(e) => setDischargeData({ ...dischargeData, dischargeDiet: e.target.value })}
                            className={`w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500 ${!canClearDischarge ? 'cursor-default opacity-85' : ''}`}
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                            Follow-up Review & Red Flag Warning Signs {!canClearDischarge && <span className="text-slate-500 lowercase">(read-only)</span>}
                          </label>
                          <textarea
                            rows={2}
                            readOnly={!canClearDischarge}
                            value={dischargeData.followUpReview}
                            onChange={(e) => setDischargeData({ ...dischargeData, followUpReview: e.target.value })}
                            className={`w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500 ${!canClearDischarge ? 'cursor-default opacity-85' : ''}`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Discharge Financial Ledger & Pharmacy Clearance Breakdown Card */}
                    <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-emerald-400" />
                          <h5 className="text-xs font-bold text-white uppercase tracking-wider">
                            IPD Final Bill &amp; Pharmacy Clearance Ledger
                          </h5>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Pharmacy Clearance: Approved
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                          <span className="text-[10px] text-slate-400 block font-semibold">1. Bed &amp; Clinical Charges:</span>
                          <strong className="text-white font-mono text-sm block">₹{Math.round(activeAdm.totalEstimatedBill * 0.65).toLocaleString()}</strong>
                          <span className="text-[10px] text-slate-500">Room rent, nursing, doctor rounds</span>
                        </div>

                        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                          <span className="text-[10px] text-slate-400 block font-semibold">2. Pharmacy Medicines Billed:</span>
                          <strong className="text-cyan-300 font-mono text-sm block">₹{Math.round(activeAdm.totalEstimatedBill * 0.25).toLocaleString()}</strong>
                          <span className="text-[10px] text-slate-500">Ward indents &amp; IV fluids</span>
                        </div>

                        <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/30 space-y-1">
                          <span className="text-[10px] text-amber-300 block font-bold">3. Less: Pharmacy Return Credit:</span>
                          <strong className="text-amber-400 font-mono text-sm block">- ₹1,450</strong>
                          <span className="text-[10px] text-amber-300/80">Unused strips returned to pharmacy</span>
                        </div>

                        <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/30 space-y-1">
                          <span className="text-[10px] text-emerald-300 block font-bold">4. Less: Deposit Paid:</span>
                          <strong className="text-emerald-400 font-mono text-sm block">- ₹{activeAdm.depositAmount.toLocaleString()}</strong>
                          <span className="text-[10px] text-emerald-300/80">Paid at admission</span>
                        </div>
                      </div>

                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <div className="text-slate-300">
                            <strong>Net Settlement Due at Cash Counter: </strong>
                            <span className="font-mono text-sm font-black text-emerald-300 ml-1">
                              ₹{Math.max(0, activeAdm.totalEstimatedBill - activeAdm.depositAmount - 1450).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setActiveModule('pharmacy')}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold border border-slate-700 transition"
                          >
                            🔄 Return More Meds in Pharmacy
                          </button>

                          <button
                            type="button"
                            onClick={() => setActiveModule('billing')}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white text-[11px] font-bold border border-emerald-500/30 transition"
                          >
                            💳 Open Final Billing Receipt
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
                      {canClearDischarge ? (
                        <div className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" /> Ready for Clinical Discharge Clearance
                        </div>
                      ) : (
                        <div className="text-xs text-amber-400 font-bold flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4" /> Discharge Summary authoring locked to Attending Doctor
                        </div>
                      )}

                      <button
                        onClick={() => setShowDischargeModal(true)}
                        className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition flex items-center gap-1.5"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Preview &amp; Print Discharge Certificate</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      ) : (
            <div className="text-center py-20 text-slate-500 text-xs space-y-2">
              <Building2 className="w-8 h-8 text-slate-600 mx-auto" />
              <div className="font-bold text-slate-400">No Inpatient Selected from Census</div>
              <p>Please select an admitted patient bed from the left census list to review ward rounds & clinical notes.</p>
            </div>
          )}
        </div>
      </div>
      ) : (
        /* MULTI-STAGE ROLE-BASED DISCHARGE CLEARANCE PIPELINE VIEW */
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <span>Inpatient Multi-Stage Discharge Clearance Engine</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    6-Stage Cross-Functional Protocol
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Doctor Clinical Sign-Off ➔ Nursing Checklist ➔ Cashier Billing Clearance ➔ TPA Pre-Auth ➔ Reception Handover ➔ Bed Release.
                </p>
              </div>
            </div>

            <span className="px-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono font-bold text-emerald-400">
              {dischargePipelines.length} Active Requests
            </span>
          </div>

          <div className="space-y-4">
            {dischargePipelines.map((pipe) => {
              const isComplete =
                pipe.clinicalApproved &&
                pipe.nursingApproved &&
                pipe.billingApproved &&
                (!pipe.insuranceRequired || pipe.insuranceApproved) &&
                pipe.receptionHandoverDone &&
                pipe.bedReleased;

              return (
                <div key={pipe.id} className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-5 shadow-xl">
                  {/* Top Patient Header Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold">
                        {pipe.bedNumber}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-base font-black text-white">{pipe.patientName}</h4>
                          <span className="font-mono text-xs text-purple-400 font-bold">{pipe.patientUhid}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                            {pipe.admissionId}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          Ward: <strong className="text-slate-200">{pipe.wardName}</strong> • Attending: <strong className="text-purple-300">{pipe.attendingDoctor}</strong> • Reason: {pipe.dischargeReason}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                        isComplete ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {isComplete ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Fully Discharged & Cleared</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3.5 h-3.5 text-amber-400" />
                            <span>Clearance In Progress</span>
                          </>
                        )}
                      </span>

                      <button
                        onClick={() => setShowDischargeModal(true)}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition flex items-center gap-1.5"
                      >
                        <Printer className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Print Case Summary</span>
                      </button>
                    </div>
                  </div>

                  {/* 6-Stage Progression Flow Indicators */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5">
                    {/* Stage 1: Doctor Clinical */}
                    <div className={`p-3 rounded-xl border space-y-1.5 ${
                      pipe.clinicalApproved ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}>
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="flex items-center gap-1">
                          <Stethoscope className="w-3.5 h-3.5 text-purple-400" /> 1. Doctor
                        </span>
                        {pipe.clinicalApproved ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Clock className="w-3.5 h-3.5 text-slate-500" />}
                      </div>
                      <div className="text-[11px] font-semibold text-slate-200">
                        {pipe.clinicalApproved ? 'Clinical Cleared' : 'Pending Doctor'}
                      </div>
                      <div className="text-[9px] opacity-75">
                        {pipe.clinicalApproved ? `Dr. ${pipe.clinicalDoctorName}` : 'Requires Attending Review'}
                      </div>
                    </div>

                    {/* Stage 2: Nursing Checklist */}
                    <div className={`p-3 rounded-xl border space-y-1.5 ${
                      pipe.nursingApproved ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}>
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="flex items-center gap-1">
                          <ClipboardCheck className="w-3.5 h-3.5 text-cyan-400" /> 2. Nurse
                        </span>
                        {pipe.nursingApproved ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Clock className="w-3.5 h-3.5 text-slate-500" />}
                      </div>
                      <div className="text-[11px] font-semibold text-slate-200">
                        {pipe.nursingApproved ? 'Nursing Cleared' : 'Pending Nursing'}
                      </div>
                      <div className="text-[9px] opacity-75">
                        {pipe.nursingApproved ? `${pipe.nurseName}` : 'Cannula, Meds & Checklist'}
                      </div>
                    </div>

                    {/* Stage 3: Billing Settlement */}
                    <div className={`p-3 rounded-xl border space-y-1.5 ${
                      pipe.billingApproved ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}>
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> 3. Billing
                        </span>
                        {pipe.billingApproved ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Clock className="w-3.5 h-3.5 text-slate-500" />}
                      </div>
                      <div className="text-[11px] font-semibold text-slate-200">
                        {pipe.billingApproved ? 'Zero Dues Cleared' : 'Pending Payment'}
                      </div>
                      <div className="text-[9px] opacity-75">
                        {pipe.billingApproved ? `Paid ₹${pipe.paidAmount.toLocaleString()}` : `Due: ₹${pipe.dueAmount.toLocaleString()}`}
                      </div>
                    </div>

                    {/* Stage 4: Insurance TPA */}
                    <div className={`p-3 rounded-xl border space-y-1.5 ${
                      pipe.insuranceApproved ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : pipe.insuranceRequired ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-slate-950/40 border-slate-800/40 text-slate-500'
                    }`}>
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" /> 4. Insurance
                        </span>
                        {pipe.insuranceApproved ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : !pipe.insuranceRequired ? <span className="text-[9px]">N/A</span> : <Clock className="w-3.5 h-3.5 text-slate-500" />}
                      </div>
                      <div className="text-[11px] font-semibold text-slate-200">
                        {pipe.insuranceApproved ? 'Pre-Auth Cleared' : pipe.insuranceRequired ? 'Pending TPA' : 'Direct Cash (N/A)'}
                      </div>
                      <div className="text-[9px] opacity-75">
                        {pipe.insuranceApproved ? (pipe.claimApprovalNo || 'Approved') : pipe.insuranceRequired ? 'Approval Awaited' : 'No Claim'}
                      </div>
                    </div>

                    {/* Stage 5: Reception Coordination */}
                    <div className={`p-3 rounded-xl border space-y-1.5 ${
                      pipe.receptionHandoverDone ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}>
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-amber-400" /> 5. Reception
                        </span>
                        {pipe.receptionHandoverDone ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Clock className="w-3.5 h-3.5 text-slate-500" />}
                      </div>
                      <div className="text-[11px] font-semibold text-slate-200">
                        {pipe.receptionHandoverDone ? 'Handover Done' : 'Pending Docs'}
                      </div>
                      <div className="text-[9px] opacity-75">
                        {pipe.receptionHandoverDone ? pipe.receptionistName : 'Print & Hand File'}
                      </div>
                    </div>

                    {/* Stage 6: Bed Release */}
                    <div className={`p-3 rounded-xl border space-y-1.5 ${
                      pipe.bedReleased ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}>
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="flex items-center gap-1">
                          <BedDouble className="w-3.5 h-3.5 text-purple-400" /> 6. Bed Status
                        </span>
                        {pipe.bedReleased ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Clock className="w-3.5 h-3.5 text-slate-500" />}
                      </div>
                      <div className="text-[11px] font-semibold text-slate-200">
                        {pipe.bedReleased ? 'Bed Released' : 'Bed Occupied'}
                      </div>
                      <div className="text-[9px] opacity-75">
                        {pipe.bedReleased ? 'Set to Cleaning' : 'Release on Exit'}
                      </div>
                    </div>
                  </div>

                  {/* Role-Specific Action Controls Bar */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between flex-wrap gap-3">
                    <div className="text-xs text-slate-400">
                      Logged in as <strong className="text-white capitalize">{currentUser?.name}</strong> ({currentUser?.roleTitle || currentUser?.role || 'Staff'})
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {/* 1. Doctor Button */}
                      {!pipe.clinicalApproved && (
                        <button
                          onClick={() => handleApproveClinicalClearance(pipe.id)}
                          className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition shadow flex items-center gap-1"
                        >
                          <Stethoscope className="w-3.5 h-3.5" />
                          <span>Approve Doctor Clinical Clearance</span>
                        </button>
                      )}

                      {/* 2. Nurse Button */}
                      {!pipe.nursingApproved && pipe.clinicalApproved && (
                        <button
                          onClick={() => handleApproveNursingClearance(pipe.id)}
                          className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition shadow flex items-center gap-1"
                        >
                          <ClipboardCheck className="w-3.5 h-3.5" />
                          <span>Sign Off Nursing Checklist</span>
                        </button>
                      )}

                      {/* 3. Billing Button */}
                      {!pipe.billingApproved && (
                        <button
                          onClick={() => handleApproveBillingClearance(pipe.id)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow flex items-center gap-1"
                        >
                          <DollarSign className="w-3.5 h-3.5" />
                          <span>Sign Off Billing Settlement</span>
                        </button>
                      )}

                      {/* 4. Insurance Button */}
                      {pipe.insuranceRequired && !pipe.insuranceApproved && (
                        <button
                          onClick={() => handleApproveInsuranceClearance(pipe.id)}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow flex items-center gap-1"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Sign Off TPA Insurance</span>
                        </button>
                      )}

                      {/* 5. Receptionist Button */}
                      {!pipe.receptionHandoverDone && pipe.billingApproved && pipe.nursingApproved && (
                        <button
                          onClick={() => handleCompleteReceptionHandover(pipe.id)}
                          className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition shadow flex items-center gap-1"
                        >
                          <Building2 className="w-3.5 h-3.5" />
                          <span>Complete Reception Handover</span>
                        </button>
                      )}

                      {/* 6. Bed Manager / Release Bed Button */}
                      {!pipe.bedReleased && pipe.receptionHandoverDone && (
                        <button
                          onClick={() => handleReleaseBed(pipe.id, pipe.bedNumber)}
                          className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition shadow flex items-center gap-1.5"
                        >
                          <BedDouble className="w-3.5 h-3.5" />
                          <span>Release Bed → Available/Cleaning</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Official Printable Inpatient Discharge Summary / Case Sheet Modal */}
      {showDischargeModal && activeAdm && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden my-8 border border-slate-200">
            {/* Modal Header */}
            <div className="p-4 bg-slate-100 border-b border-slate-200 flex items-center justify-between print:hidden">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-purple-700" />
                <span className="text-xs font-bold text-slate-800">Print Official Inpatient Discharge Summary</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold transition shadow"
                >
                  Print Summary
                </button>
                <button
                  onClick={() => setShowDischargeModal(false)}
                  className="p-1 rounded-lg text-slate-500 hover:text-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Slip Content */}
            <div className="p-8 space-y-6">
              {/* Hospital Letterhead */}
              <div className="flex items-start justify-between border-b-2 border-purple-900 pb-4">
                <div>
                  <h1 className="text-xl font-black text-purple-900 tracking-tight">BHASKAR REDDY HOSPITAL</h1>
                  <div className="text-[11px] font-bold text-slate-700">INPATIENT CLINICAL DISCHARGE CERTIFICATE</div>
                  <div className="text-[10px] text-slate-500">
                    Main Branch: Nellore • NABH Accredited • Reg No: AP-HOSP-2024-8891
                  </div>
                </div>
                <div className="text-right text-[10px] text-slate-600">
                  <div className="font-mono font-bold text-purple-950 text-xs">{activeAdm.admissionId}</div>
                  <div>Bed: {activeAdm.bedNumber} ({activeAdm.wardName})</div>
                  <div>Admitted: {activeAdm.admittedDate}</div>
                </div>
              </div>

              {/* Patient & Consultant Info Grid */}
              <div className="grid grid-cols-2 gap-4 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                <div className="space-y-1">
                  <div>Patient Name: <strong className="text-slate-900">{activeAdm.patientName}</strong></div>
                  <div>UHID: <strong className="font-mono text-purple-900">{activeAdm.patientUhid}</strong></div>
                  <div>Age / Gender: {activeAdm.age} Yrs / {activeAdm.gender} • Blood: {activePatient?.bloodGroup || 'O+ve'}</div>
                </div>
                <div className="space-y-1 text-right">
                  <div>Attending Consultant: <strong className="text-purple-950">{activeAdm.attendingDoctor}</strong></div>
                  <div>Specialty: <strong>{activeAdm.departmentName}</strong></div>
                  <div>Condition on Discharge: <strong className="text-emerald-800">{dischargeData.conditionOnDischarge}</strong></div>
                </div>
              </div>

              {/* Final Diagnosis */}
              <div className="p-3 rounded-lg border border-slate-200 text-xs space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Final Inpatient Diagnosis</span>
                <span className="font-bold text-purple-950 text-sm">{activeAdm.diagnosis}</span>
              </div>

              {/* Hospital Course & Management */}
              <div className="space-y-1 text-xs">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Clinical Course in Hospital</span>
                <p className="text-slate-800 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                  {dischargeData.hospitalCourse}
                </p>
              </div>

              {/* Discharge Medications */}
              <div className="space-y-2">
                <div className="text-sm font-black text-purple-950 flex items-center gap-1 font-serif">
                  <span className="text-lg">℞</span> MEDICATIONS PRESCRIBED ON DISCHARGE
                </div>
                <table className="w-full text-xs text-left border border-slate-200">
                  <thead className="bg-slate-100 text-[11px] font-bold text-slate-700">
                    <tr>
                      <th className="p-2 border-b">#</th>
                      <th className="p-2 border-b">Medication Name</th>
                      <th className="p-2 border-b">Route</th>
                      <th className="p-2 border-b">Dosage & Frequency</th>
                      <th className="p-2 border-b">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {ipdMeds.map((m, i) => (
                      <tr key={i}>
                        <td className="p-2 font-mono text-slate-500">{i + 1}</td>
                        <td className="p-2 font-bold text-slate-900">{m.drugName}</td>
                        <td className="p-2">{m.route}</td>
                        <td className="p-2 font-mono text-purple-900 font-bold">{m.frequency}</td>
                        <td className="p-2 font-mono">15 Days</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Dietary Advice & Follow-up */}
              <div className="grid grid-cols-2 gap-4 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <span className="font-bold text-slate-900 block mb-1">Dietary & Activity Advice:</span>
                  <span className="text-slate-700">{dischargeData.dischargeDiet}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-900 block mb-1">Next OPD Follow-up Review:</span>
                  <span className="text-slate-700">{dischargeData.followUpReview}</span>
                </div>
              </div>

              {/* Footer Signatures */}
              <div className="pt-6 border-t-2 border-slate-200 flex items-end justify-between text-xs">
                <div>
                  <div className="text-[10px] text-slate-500">Emergency 24x7 Helpline: 0861-2345678 / 9849012345</div>
                  <div className="text-[10px] text-slate-400">Bhaskar Reddy Super Speciality Hospitals</div>
                </div>

                <div className="text-center space-y-1">
                  <div className="w-36 h-10 border-b border-dashed border-slate-400 mx-auto flex items-center justify-center italic text-slate-400 text-[10px]">
                    [Digitally Signed]
                  </div>
                  <div className="font-bold text-slate-900">{activeAdm.attendingDoctor}</div>
                  <div className="text-[10px] text-slate-500">{activeAdm.departmentName}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

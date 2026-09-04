import React, { useState, useEffect } from 'react';
import { useHospital } from '../../context/HospitalContext';
import type { EmergencyCase, IPDAdmission } from '../../types';
import {
  Siren,
  Plus,
  Clock,
  Phone,
  BedDouble,
  UserCheck,
  RefreshCw,
  Ticket,
  Building2,
  History,
  Printer,
  ChevronDown,
  ChevronUp,
  ArrowRightLeft,
  CheckCircle2,
} from 'lucide-react';

interface EmergencyDoctorSchedule {
  id: string;
  doctorName: string;
  specialty: string;
  qualification: string;
  shift: 'Morning (07:00 - 14:00)' | 'Evening (14:00 - 21:00)' | 'Night (21:00 - 07:00)' | '24x7 On-Call';
  assignedBay: string;
  status: 'On Duty' | 'In Surgery' | 'On Call' | 'On Leave';
  intercom: string;
  substituteDoctor?: string;
}

interface CaseAuditLog {
  id: string;
  timestamp: string;
  author: string;
  action: string;
  details: string;
}

const DEFAULT_AUDIT_HISTORY: Record<string, CaseAuditLog[]> = {
  'emg-1': [
    {
      id: 'log-1',
      timestamp: '10 mins ago (10:15 AM)',
      author: 'Sr. Lakshmi (Receptionist)',
      action: '🚨 Registered Priority RED',
      details: 'Admitted via 108 Ambulance. Acute Chest Pain, BP 80/50 mmHg.',
    },
    {
      id: 'log-2',
      timestamp: '8 mins ago (10:17 AM)',
      author: 'Dr. Sameer Khan (MEM)',
      action: '👨‍⚕️ Doctor Accepted & Attending',
      details: 'Lead trauma resuscitation initiated in EMR-BAY-01. ECG & Trop-I stat ordered.',
    },
    {
      id: 'log-3',
      timestamp: '5 mins ago (10:20 AM)',
      author: 'Sr. Anitha (Emergency Staff Nurse)',
      action: '📈 Bedside Vitals Logged',
      details: 'BP: 140/90 mmHg, Pulse: 110 bpm, SpO2: 93% on 4L O2 mask.',
    },
  ],
  'emg-2': [
    {
      id: 'log-4',
      timestamp: '25 mins ago (10:00 AM)',
      author: 'Reception Desk',
      action: '🟡 Registered Priority YELLOW',
      details: 'Brought by Bystanders (RTA). Femur Laceration, Compound Fracture.',
    },
    {
      id: 'log-5',
      timestamp: '22 mins ago (10:03 AM)',
      author: 'Dr. Rajeshwar Rao (Ortho)',
      action: '👨‍⚕️ Doctor Accepted & Attending',
      details: 'Wound debridement, splint stabilization & X-Ray pelvis/femur advised.',
    },
    {
      id: 'log-6',
      timestamp: '20 mins ago (10:05 AM)',
      author: 'MLC Officer',
      action: '⚖️ Medico-Legal Case (MLC) Intimation Dispatched',
      details: 'Police Intimation dispatched to Dargamitta Police Station, Nellore.',
    },
  ],
};

const DEFAULT_DOCTOR_ACCEPTANCE: Record<string, { status: string; acceptedAt: string; doctorName: string }> = {
  'emg-1': { status: 'Accepted & Attending', acceptedAt: '10:17 AM', doctorName: 'Dr. Sameer Khan' },
  'emg-2': { status: 'Accepted & Attending', acceptedAt: '10:03 AM', doctorName: 'Dr. Rajeshwar Rao' },
};

export const EmergencyModule: React.FC = () => {
  const {
    emergencyCases,
    addEmergencyCase,
    updateEmergencyCase,
    addAdmission,
    updateBedStatus,
    getPermission,
    currentUser,
    addToast,
    beds,
    addPatientMovement,
  } = useHospital();

  const canEdit = getPermission('emergency') === 'FULL';

  // Active View Tab: 'triage' | 'schedules' | 'register' | 'transferred'
  const [activeTab, setActiveTab] = useState<'triage' | 'schedules' | 'register' | 'transferred'>('triage');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Selected Case for Audit Logs / Doctor Change / Token / IPD Admission Modal
  const [selectedCaseForAudit, setSelectedCaseForAudit] = useState<string | null>(null);
  const [caseForDoctorChange, setCaseForDoctorChange] = useState<EmergencyCase | null>(null);
  const [caseForAdmission, setCaseForAdmission] = useState<EmergencyCase | null>(null);
  const [printedTokenCase, setPrintedTokenCase] = useState<{ case: EmergencyCase; tokenNo: string } | null>(null);

  // Per-case dynamic states: doctor acceptance, token, and audit history with localStorage persistence
  const [caseAuditHistory, setCaseAuditHistory] = useState<Record<string, CaseAuditLog[]>>(() => {
    try {
      const saved = localStorage.getItem('brhospital-er-audit');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch {}
    return DEFAULT_AUDIT_HISTORY;
  });

  useEffect(() => {
    try {
      localStorage.setItem('brhospital-er-audit', JSON.stringify(caseAuditHistory));
    } catch {}
  }, [caseAuditHistory]);

  const [doctorAcceptanceMap, setDoctorAcceptanceMap] = useState<Record<string, { status: string; acceptedAt: string; doctorName: string }>>(() => {
    try {
      const saved = localStorage.getItem('brhospital-er-doctors');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch {}
    return DEFAULT_DOCTOR_ACCEPTANCE;
  });

  useEffect(() => {
    try {
      localStorage.setItem('brhospital-er-doctors', JSON.stringify(doctorAcceptanceMap));
    } catch {}
  }, [doctorAcceptanceMap]);

  const [generatedTokens, setGeneratedTokens] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('brhospital-er-tokens');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch {}
    return { 'emg-1': 'EMG-TOK-01' };
  });

  useEffect(() => {
    try {
      localStorage.setItem('brhospital-er-tokens', JSON.stringify(generatedTokens));
    } catch {}
  }, [generatedTokens]);

  // Admission Modal State
  const [admissionForm, setAdmissionForm] = useState({
    targetBedId: 'bed-icu-02',
    targetWard: 'Cardiac ICU Suite',
    admittingConsultant: 'Dr. Vikram Reddy',
    depositAmount: 50000,
    clinicalNotes: 'Urgent shift from Emergency Bay for continuous hemodynamic monitoring.',
  });

  // Emergency Doctor Shift Schedules State
  const [erSchedules, setErSchedules] = useState<EmergencyDoctorSchedule[]>([
    {
      id: 'erd-1',
      doctorName: 'Dr. Sameer Khan',
      specialty: 'Emergency Medicine & Critical Trauma',
      qualification: 'MBBS, MEM (Emergency Medicine)',
      shift: 'Morning (07:00 - 14:00)',
      assignedBay: '🚨 Red Trauma Bay 01 & 02',
      status: 'On Duty',
      intercom: 'Ext: 108 / +91 98490 11001',
    },
    {
      id: 'erd-2',
      doctorName: 'Dr. Rajesh Varma',
      specialty: 'Trauma & General Surgeon (Emergency On-Duty)',
      qualification: 'MBBS, MS (General Surgery)',
      shift: 'Morning (07:00 - 14:00)',
      assignedBay: '🔪 Emergency Minor OT & Suture Bay',
      status: 'On Duty',
      intercom: 'Ext: 109 / +91 98490 11002',
    },
    {
      id: 'erd-3',
      doctorName: 'Dr. Vikram Reddy',
      specialty: 'Chief Interventional Cardiologist (STEMI Emergency Lead)',
      qualification: 'MBBS, MD, DM (Cardiology)',
      shift: '24x7 On-Call',
      assignedBay: '❤️ Cath Lab Emergency & CCU Bay',
      status: 'On Call',
      intercom: 'Ext: 102 / +91 98490 11003',
    },
    {
      id: 'erd-4',
      doctorName: 'Dr. Priya Sundaram',
      specialty: 'Critical Care & Neuro-Trauma Intensivist',
      qualification: 'MBBS, MD (Anesthesia), IDCCM',
      shift: 'Evening (14:00 - 21:00)',
      assignedBay: '🏥 Yellow Resuscitation Bay 03 & 04',
      status: 'On Duty',
      intercom: 'Ext: 110 / +91 98490 11004',
    },
    {
      id: 'erd-5',
      doctorName: 'Dr. Anita Desai',
      specialty: 'Pediatric Emergency & Neonatal Resuscitation',
      qualification: 'MBBS, DCH, DNB (Pediatrics)',
      shift: 'Evening (14:00 - 21:00)',
      assignedBay: '👶 Pediatric Emergency & PICU Bay',
      status: 'On Leave',
      substituteDoctor: 'Dr. Ramesh Kumar (DMO)',
      intercom: 'Ext: 112 / +91 98490 11005',
    },
    {
      id: 'erd-6',
      doctorName: 'Dr. Ramesh Kumar',
      specialty: 'Duty Medical Officer (DMO Night Trauma Lead)',
      qualification: 'MBBS, Fellowship in Emergency Care',
      shift: 'Night (21:00 - 07:00)',
      assignedBay: '🚨 Emergency Bay All Units',
      status: 'On Duty',
      intercom: 'Ext: 101 / +91 98490 11006',
    },
  ]);

  // Intake Form State
  const [formData, setFormData] = useState({
    patientName: '',
    age: '',
    gender: 'Male',
    triagePriority: 'Red - Critical' as EmergencyCase['triagePriority'],
    chiefComplaint: '',
    assignedDoctor: 'Dr. Sameer Khan',
    assignedBed: 'EMR-BAY-01',
    medicoLegalCase: false,
    mlcPoliceStation: 'Dargamitta Police Station, Nellore',
    vitalsBp: '130/85',
    vitalsPulse: '102',
    vitalsSpo2: '94%',
    gcsScore: '15/15 (Fully Conscious)',
    status: 'Under Resuscitation' as EmergencyCase['status'],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patientName) return;

    const newCaseId = `emg-${Date.now().toString().slice(-4)}`;

    addEmergencyCase({
      patientName: formData.patientName,
      age: Number(formData.age) || 35,
      gender: formData.gender,
      triagePriority: formData.triagePriority,
      chiefComplaint: formData.chiefComplaint || 'Acute Emergency Care',
      arrivalTime: 'Just now',
      assignedDoctor: formData.assignedDoctor,
      assignedBed: formData.assignedBed,
      medicoLegalCase: formData.medicoLegalCase,
      status: formData.status,
    });

    // Auto-create initial audit logs & doctor acceptance
    const nowTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    setCaseAuditHistory((prev) => ({
      ...prev,
      [newCaseId]: [
        {
          id: `log-${Date.now()}-1`,
          timestamp: `Just now (${nowTime})`,
          author: `${currentUser?.name || 'Staff'} (${currentUser?.roleTitle || 'Reception'})`,
          action: `🚨 Fast-Track Registered (${formData.triagePriority})`,
          details: `Bed: ${formData.assignedBed} | Chief Complaint: ${formData.chiefComplaint || 'Emergency Admission'}`,
        },
        {
          id: `log-${Date.now()}-2`,
          timestamp: `Just now (${nowTime})`,
          author: formData.assignedDoctor,
          action: '👨‍⚕️ Assigned On-Duty Doctor',
          details: `Doctor assigned for initial triage resuscitation.`,
        },
      ],
    }));

    setDoctorAcceptanceMap((prev) => ({
      ...prev,
      [newCaseId]: {
        status: 'Accepted & Attending',
        acceptedAt: nowTime,
        doctorName: formData.assignedDoctor,
      },
    }));

    addToast(
      'Emergency Patient Admitted',
      `${formData.patientName} triaged as ${formData.triagePriority} in ${formData.assignedBed}`,
      'success'
    );

    // Reset Form
    setFormData({
      patientName: '',
      age: '',
      gender: 'Male',
      triagePriority: 'Red - Critical',
      chiefComplaint: '',
      assignedDoctor: 'Dr. Sameer Khan',
      assignedBed: 'EMR-BAY-01',
      medicoLegalCase: false,
      mlcPoliceStation: 'Dargamitta Police Station, Nellore',
      vitalsBp: '130/85',
      vitalsPulse: '102',
      vitalsSpo2: '94%',
      gcsScore: '15/15 (Fully Conscious)',
      status: 'Under Resuscitation',
    });

    setIsModalOpen(false);
    setActiveTab('triage');
  };

  // 1. Generate Emergency Token Action
  const handleGenerateEmergencyToken = (emg: EmergencyCase) => {
    const nextTokenNum = Object.keys(generatedTokens).length + 1;
    const tokenStr = `EMG-TOK-${nextTokenNum.toString().padStart(2, '0')}`;

    setGeneratedTokens((prev) => ({ ...prev, [emg.id]: tokenStr }));

    // Log to audit history
    const nowTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const logItem: CaseAuditLog = {
      id: `log-${Date.now()}`,
      timestamp: `Just now (${nowTime})`,
      author: currentUser?.name || 'Reception Staff',
      action: `🎟️ Emergency Priority Token Issued (#${tokenStr})`,
      details: `Fast-track token generated for ${emg.patientName}. Linked to ${emg.assignedDoctor}.`,
    };

    setCaseAuditHistory((prev) => ({
      ...prev,
      [emg.id]: [logItem, ...(prev[emg.id] || [])],
    }));

    setPrintedTokenCase({ case: emg, tokenNo: tokenStr });
    addToast('Emergency Token Generated', `Token #${tokenStr} generated for ${emg.patientName}`, 'success');
  };

  // 2. Reassign / Change Accepted Doctor Action
  const handleConfirmDoctorChange = (emgId: string, newDoctor: string) => {
    const nowTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    setDoctorAcceptanceMap((prev) => ({
      ...prev,
      [emgId]: {
        status: 'Reassigned & Accepted',
        acceptedAt: nowTime,
        doctorName: newDoctor,
      },
    }));

    const logItem: CaseAuditLog = {
      id: `log-${Date.now()}`,
      timestamp: `Just now (${nowTime})`,
      author: currentUser?.name || 'Emergency Incharge',
      action: `👨‍⚕️ Accepted Doctor Changed to ${newDoctor}`,
      details: `Lead clinical care transferred from previous consultant to ${newDoctor}.`,
    };

    setCaseAuditHistory((prev) => ({
      ...prev,
      [emgId]: [logItem, ...(prev[emgId] || [])],
    }));

    addToast('Doctor Reassigned', `Lead emergency doctor updated to ${newDoctor}`, 'info');
    setCaseForDoctorChange(null);
  };

  // 3. Convert Emergency to Full IPD / ICU Admission
  const handleConfirmIPDAdmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseForAdmission) return;

    const targetBed = beds.find((b) => b.id === admissionForm.targetBedId);
    const bedName = targetBed ? targetBed.bedNumber : 'ICU-102';
    const nowTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    // 1. Update the Emergency Case status to 'Shifted to ICU'
    updateEmergencyCase(caseForAdmission.id, {
      status: 'Shifted to ICU',
      assignedBed: `Shifted to ${bedName}`,
    });

    // 2. Create real IPD Admission record in Hospital State & LocalStorage
    const newAdmission: IPDAdmission = {
      id: `adm-${Date.now().toString().slice(-4)}`,
      admissionId: `ADM-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      patientId: caseForAdmission.id,
      patientName: caseForAdmission.patientName,
      patientUhid: caseForAdmission.caseNo,
      age: caseForAdmission.age,
      gender: caseForAdmission.gender,
      admittedDate: new Date().toISOString().split('T')[0],
      bedId: admissionForm.targetBedId || 'bed-icu-02',
      bedNumber: bedName,
      wardName: admissionForm.targetWard,
      floor: admissionForm.targetWard.includes('ICU') ? '1st Floor - Critical Care' : '2nd Floor - Inpatient Wing',
      attendingDoctor: admissionForm.admittingConsultant,
      departmentName: 'Emergency & Critical Care',
      diagnosis: `Emergency Transfer: ${caseForAdmission.chiefComplaint}`,
      depositAmount: Number(admissionForm.depositAmount) || 50000,
      totalEstimatedBill: 75000,
      status: 'Admitted',
    };
    addAdmission(newAdmission);

    // 3. Mark the target bed as occupied in hospital bed telemetry
    if (admissionForm.targetBedId) {
      updateBedStatus(
        admissionForm.targetBedId,
        'Occupied',
        caseForAdmission.id,
        caseForAdmission.patientName,
        caseForAdmission.caseNo,
        admissionForm.admittingConsultant
      );
    }

    // 4. Log patient transfer movement
    addPatientMovement({
      patientId: caseForAdmission.id,
      patientName: caseForAdmission.patientName,
      patientUhid: caseForAdmission.caseNo,
      fromLocation: `Emergency Bay (${caseForAdmission.assignedBed})`,
      toLocation: `${admissionForm.targetWard} (${bedName})`,
      movementType: 'Emergency-to-ICU',
      reason: `Direct Emergency Transfer: ${admissionForm.clinicalNotes}`,
      authorizedBy: admissionForm.admittingConsultant,
      authorizedRole: 'Attending Consultant',
      transportMode: 'Stretcher',
      escortNurse: 'Sr. Lakshmi (Emergency Staff Nurse)',
      porterGDA: 'GDA Ramesh',
      lifeSupport: ['Oxygen Support', 'Cardiac Monitor'],
      status: 'Scheduled / Initiated',
    });

    // 5. Add Audit Log Entry
    const logItem: CaseAuditLog = {
      id: `log-${Date.now()}`,
      timestamp: `Just now (${nowTime})`,
      author: currentUser?.name || 'Admissions Desk',
      action: `🏥 Transferred & Admitted to IPD / ICU (${bedName})`,
      details: `Ward: ${admissionForm.targetWard} | Consultant: ${admissionForm.admittingConsultant} | Deposit: ₹${admissionForm.depositAmount}`,
    };

    setCaseAuditHistory((prev) => ({
      ...prev,
      [caseForAdmission.id]: [logItem, ...(prev[caseForAdmission.id] || [])],
    }));

    addToast(
      'Patient Shifted to IPD',
      `${caseForAdmission.patientName} successfully transferred to ${admissionForm.targetWard} (${bedName})`,
      'success'
    );

    setCaseForAdmission(null);
  };

  const handleShuffleDuty = (docId: string) => {
    if (!canEdit) {
      addToast('Permission Restricted', 'Only Clinical & Emergency Staff can shuffle doctor duty shifts.', 'error');
      return;
    }
    setErSchedules((prev) =>
      prev.map((d) => {
        if (d.id === docId) {
          const newStatus = d.status === 'On Duty' ? 'In Surgery' : d.status === 'In Surgery' ? 'On Call' : 'On Duty';
          return { ...d, status: newStatus };
        }
        return d;
      })
    );
    addToast('Emergency Shift Updated', 'Doctor emergency status and duty roster updated.', 'info');
  };

  const activeCases = emergencyCases.filter((c) => c.status !== 'Shifted to ICU' && c.status !== 'Discharged');
  const transferredCases = emergencyCases.filter((c) => c.status === 'Shifted to ICU' || c.status === 'Discharged');

  const criticalCount = activeCases.filter((c) => c.triagePriority.startsWith('Red')).length;
  const urgentCount = activeCases.filter((c) => c.triagePriority.startsWith('Yellow')).length;
  const greenCount = activeCases.filter((c) => c.triagePriority.startsWith('Green')).length;

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* 1. Header Command Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-6 rounded-2xl border border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1.5 animate-pulse">
              <Siren className="w-3.5 h-3.5" /> 24x7 Emergency Trauma Command
            </span>
            <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
              Role: {currentUser?.roleTitle || currentUser?.role}
            </span>
          </div>
          <h2 className="text-2xl font-black text-white mt-1">Emergency Triage &amp; Resuscitation Bay</h2>
          <p className="text-xs text-slate-400">
            Rapid Red/Yellow/Green priority triage, Accepted doctor tracking, Changes audit history, Instant ER tokens, and Direct IPD admission.
          </p>
        </div>

        {canEdit && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-extrabold shadow-lg shadow-rose-600/30 transition active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Fast-Track Emergency Admission</span>
          </button>
        )}
      </div>

      {/* 2. Top Tab Navigation Bar */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 flex-wrap">
        <button
          onClick={() => setActiveTab('triage')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'triage'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-950/50'
              : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Siren className="w-4 h-4" />
          <span>🚨 Active Trauma Bays ({activeCases.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('transferred')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'transferred'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/50'
              : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4 text-emerald-400" />
          <span>🏥 Shifted to IPD / ICU ({transferredCases.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('schedules')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'schedules'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-950/50'
              : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <UserCheck className="w-4 h-4 text-purple-300" />
          <span>👨‍⚕️ Emergency Doctors &amp; Shift Schedules ({erSchedules.length})</span>
        </button>

        {canEdit && (
          <button
            onClick={() => setActiveTab('register')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'register'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/50'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>📝 Fast-Track Registration Form</span>
          </button>
        )}
      </div>

      {/* 3. TAB CONTENT: LIVE TRIAGE BAY */}
      {activeTab === 'triage' && (
        <div className="space-y-6">
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">
                  Priority RED (Critical / Resuscitation)
                </span>
                <span className="text-xl font-mono font-black text-rose-200 mt-1 block">
                  {criticalCount} Active Cases
                </span>
              </div>
              <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
            </div>

            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                  Priority YELLOW (Urgent Care)
                </span>
                <span className="text-xl font-mono font-black text-amber-200 mt-1 block">
                  {urgentCount} Active Cases
                </span>
              </div>
              <span className="w-3 h-3 rounded-full bg-amber-500" />
            </div>

            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                  Priority GREEN (Minor Trauma / OPD)
                </span>
                <span className="text-xl font-mono font-black text-emerald-200 mt-1 block">
                  {greenCount} Triaged Cases
                </span>
              </div>
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
            </div>
          </div>

          {/* Triage Priority Columns Board */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Priority RED (Critical) */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-rose-500/40 space-y-3">
              <div className="flex items-center justify-between border-b border-rose-500/30 pb-2">
                <h3 className="text-sm font-bold text-rose-300 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
                  Priority RED (Immediate Resuscitation)
                </h3>
                <span className="text-xs font-mono text-rose-400 font-bold">0-Min ETA</span>
              </div>

              <div className="space-y-3.5">
                {activeCases.filter((c) => c.triagePriority.startsWith('Red')).length > 0 ? (
                  activeCases
                    .filter((c) => c.triagePriority.startsWith('Red'))
                    .map((emg) => {
                      const docStatus = doctorAcceptanceMap[emg.id] || {
                        status: 'Accepted & Attending',
                        acceptedAt: '10:15 AM',
                        doctorName: emg.assignedDoctor,
                      };
                      const logs = caseAuditHistory[emg.id] || [];
                      const tokenNo = generatedTokens[emg.id];
                      const isAuditOpen = selectedCaseForAudit === emg.id;

                      return (
                      <div
                        key={emg.id}
                        className="p-4 rounded-xl bg-slate-950 border border-rose-500/40 space-y-3 shadow-xl"
                      >
                        {/* Header & Case ID */}
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-extrabold text-slate-100 text-sm block">{emg.patientName}</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {emg.age} Yrs / {emg.gender} • Arr: {emg.arrivalTime}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {tokenNo && (
                              <span className="text-[10px] font-mono font-black text-cyan-300 bg-cyan-500/20 px-2 py-0.5 rounded border border-cyan-500/40 flex items-center gap-1">
                                <Ticket className="w-3 h-3" /> {tokenNo}
                              </span>
                            )}
                            <span className="text-[10px] font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30 font-bold">
                              {emg.caseNo}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-rose-200 font-medium">{emg.chiefComplaint}</p>

                        {/* Bedside Vitals Grid */}
                        <div className="grid grid-cols-3 gap-1 p-2 bg-slate-900/90 rounded border border-slate-800 text-[10px] font-mono text-center">
                          <div>
                            <span className="text-slate-500 block text-[9px]">Vitals BP</span>
                            <span className="font-bold text-rose-300">140/90</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[9px]">Pulse</span>
                            <span className="font-bold text-amber-300">110 bpm</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[9px]">SpO2</span>
                            <span className="font-bold text-cyan-300">93%</span>
                          </div>
                        </div>

                        {/* Accepted Doctor Banner */}
                        <div className="p-2.5 bg-purple-500/10 border border-purple-500/30 rounded-xl space-y-1 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-purple-300 font-bold flex items-center gap-1">
                              <UserCheck className="w-3.5 h-3.5 text-purple-400" /> Accepted Lead Doctor:
                            </span>
                            <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                              🟢 {docStatus.status}
                            </span>
                          </div>
                          <div className="flex items-center justify-between pt-0.5">
                            <strong className="text-white font-bold text-xs">{docStatus.doctorName}</strong>
                            <span className="text-[10px] font-mono text-purple-300">@{docStatus.acceptedAt}</span>
                          </div>
                        </div>

                        {/* Bed Allocation & MLC Alert */}
                        <div className="text-[10px] text-slate-400 font-mono flex justify-between pt-1 border-t border-slate-800/80">
                          <span>
                            Bed: <strong className="text-rose-300 font-bold">{emg.assignedBed}</strong>
                          </span>
                          <span>
                            Status: <strong className="text-amber-300 font-bold">{emg.status}</strong>
                          </span>
                        </div>

                        {/* Action Toolbar: Token, Admission Transfer, Doctor Change, Audit Logs */}
                        {canEdit && (
                          <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-1.5 text-[11px] font-bold">
                            {!tokenNo ? (
                              <button
                                onClick={() => handleGenerateEmergencyToken(emg)}
                                className="px-2.5 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600 text-cyan-300 hover:text-white border border-cyan-500/30 transition flex items-center justify-center gap-1"
                              >
                                <Ticket className="w-3.5 h-3.5" />
                                <span>+ Add Token</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => setPrintedTokenCase({ case: emg, tokenNo })}
                                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center justify-center gap-1"
                              >
                                <Printer className="w-3.5 h-3.5 text-cyan-400" />
                                <span>Print Token</span>
                              </button>
                            )}

                            <button
                              onClick={() => {
                                setCaseForAdmission(emg);
                                setAdmissionForm({
                                  targetBedId: 'bed-icu-02',
                                  targetWard: 'Cardiac ICU Suite',
                                  admittingConsultant: docStatus.doctorName,
                                  depositAmount: 50000,
                                  clinicalNotes: `Emergency Transfer from ${emg.assignedBed} for critical resuscitation.`,
                                });
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 transition flex items-center justify-center gap-1"
                            >
                              <Building2 className="w-3.5 h-3.5" />
                              <span>+ Add Admission</span>
                            </button>

                            <button
                              onClick={() => setCaseForDoctorChange(emg)}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition flex items-center justify-center gap-1"
                            >
                              <ArrowRightLeft className="w-3 h-3 text-purple-400" />
                              <span>Change Doctor</span>
                            </button>

                            <button
                              onClick={() => setSelectedCaseForAudit(isAuditOpen ? null : emg.id)}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition flex items-center justify-center gap-1"
                            >
                              <History className="w-3 h-3 text-amber-400" />
                              <span>Audit Log ({logs.length})</span>
                              {isAuditOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>
                          </div>
                        )}

                        {/* Collapsible Changes & Audit Log Drawer */}
                        {isAuditOpen && (
                          <div className="mt-2 p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2 text-[11px] animate-fadeIn">
                            <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider block flex items-center gap-1">
                              <History className="w-3 h-3 text-amber-400" /> Changes &amp; Activity Log
                            </span>
                            <div className="space-y-2 max-h-48 overflow-y-auto pr-1 divide-y divide-slate-800/60">
                              {logs.map((log) => (
                                <div key={log.id} className="pt-1.5 first:pt-0 space-y-0.5">
                                  <div className="flex justify-between items-center text-[10px]">
                                    <strong className="text-slate-200">{log.action}</strong>
                                    <span className="text-slate-500 font-mono">{log.timestamp}</span>
                                  </div>
                                  <p className="text-[10px] text-slate-400">{log.details}</p>
                                  <span className="text-[9px] text-cyan-400/80 block">By: {log.author}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-xs text-slate-500 italic bg-slate-950/40 rounded-xl border border-slate-800">
                    ✅ Red Trauma Bay is clear &amp; sanitized. 0 critical resuscitations pending.
                  </div>
                )}
              </div>
            </div>

            {/* Priority YELLOW (Urgent) */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-amber-500/40 space-y-3">
              <div className="flex items-center justify-between border-b border-amber-500/30 pb-2">
                <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500" />
                  Priority YELLOW (Urgent Care)
                </h3>
                <span className="text-xs font-mono text-amber-400 font-bold">&lt; 15 Mins</span>
              </div>

              <div className="space-y-3.5">
                {activeCases.filter((c) => c.triagePriority.startsWith('Yellow')).length > 0 ? (
                  activeCases
                    .filter((c) => c.triagePriority.startsWith('Yellow'))
                    .map((emg) => {
                      const docStatus = doctorAcceptanceMap[emg.id] || {
                        status: 'Accepted & Attending',
                        acceptedAt: '10:03 AM',
                        doctorName: emg.assignedDoctor,
                      };
                      const logs = caseAuditHistory[emg.id] || [];
                      const tokenNo = generatedTokens[emg.id];
                      const isAuditOpen = selectedCaseForAudit === emg.id;

                      return (
                      <div
                        key={emg.id}
                        className="p-4 rounded-xl bg-slate-950 border border-amber-500/40 space-y-3 shadow-xl"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-extrabold text-slate-100 text-sm block">{emg.patientName}</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {emg.age} Yrs / {emg.gender} • Arr: {emg.arrivalTime}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {tokenNo && (
                              <span className="text-[10px] font-mono font-black text-cyan-300 bg-cyan-500/20 px-2 py-0.5 rounded border border-cyan-500/40 flex items-center gap-1">
                                <Ticket className="w-3 h-3" /> {tokenNo}
                              </span>
                            )}
                            <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30 font-bold">
                              {emg.caseNo}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-amber-200 font-medium">{emg.chiefComplaint}</p>

                        {emg.medicoLegalCase && (
                          <div className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-between">
                            <span>⚖️ Medico-Legal Case (MLC)</span>
                            <span className="text-[9px] text-purple-400 font-mono">Police Intimated</span>
                          </div>
                        )}

                        {/* Accepted Doctor Banner */}
                        <div className="p-2.5 bg-purple-500/10 border border-purple-500/30 rounded-xl space-y-1 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-purple-300 font-bold flex items-center gap-1">
                              <UserCheck className="w-3.5 h-3.5 text-purple-400" /> Accepted Lead Doctor:
                            </span>
                            <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                              🟢 {docStatus.status}
                            </span>
                          </div>
                          <div className="flex items-center justify-between pt-0.5">
                            <strong className="text-white font-bold text-xs">{docStatus.doctorName}</strong>
                            <span className="text-[10px] font-mono text-purple-300">@{docStatus.acceptedAt}</span>
                          </div>
                        </div>

                        <div className="text-[10px] text-slate-400 font-mono flex justify-between pt-1 border-t border-slate-800">
                          <span>
                            Bed: <strong className="text-amber-300 font-bold">{emg.assignedBed}</strong>
                          </span>
                          <span>
                            Status: <strong className="text-slate-200 font-bold">{emg.status}</strong>
                          </span>
                        </div>

                        {/* Action Toolbar */}
                        {canEdit && (
                          <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-1.5 text-[11px] font-bold">
                            {!tokenNo ? (
                              <button
                                onClick={() => handleGenerateEmergencyToken(emg)}
                                className="px-2.5 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600 text-cyan-300 hover:text-white border border-cyan-500/30 transition flex items-center justify-center gap-1"
                              >
                                <Ticket className="w-3.5 h-3.5" />
                                <span>+ Add Token</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => setPrintedTokenCase({ case: emg, tokenNo })}
                                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center justify-center gap-1"
                              >
                                <Printer className="w-3.5 h-3.5 text-cyan-400" />
                                <span>Print Token</span>
                              </button>
                            )}

                            <button
                              onClick={() => {
                                setCaseForAdmission(emg);
                                setAdmissionForm({
                                  targetBedId: 'bed-gen-102',
                                  targetWard: 'General Male Ward',
                                  admittingConsultant: docStatus.doctorName,
                                  depositAmount: 15000,
                                  clinicalNotes: `Emergency Transfer from ${emg.assignedBed} for orthopedic stabilization.`,
                                });
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 transition flex items-center justify-center gap-1"
                            >
                              <Building2 className="w-3.5 h-3.5" />
                              <span>+ Add Admission</span>
                            </button>

                            <button
                              onClick={() => setCaseForDoctorChange(emg)}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition flex items-center justify-center gap-1"
                            >
                              <ArrowRightLeft className="w-3 h-3 text-purple-400" />
                              <span>Change Doctor</span>
                            </button>

                            <button
                              onClick={() => setSelectedCaseForAudit(isAuditOpen ? null : emg.id)}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition flex items-center justify-center gap-1"
                            >
                              <History className="w-3 h-3 text-amber-400" />
                              <span>Audit Log ({logs.length})</span>
                              {isAuditOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>
                          </div>
                        )}

                        {/* Collapsible Changes & Audit Log */}
                        {isAuditOpen && (
                          <div className="mt-2 p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2 text-[11px] animate-fadeIn">
                            <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider block flex items-center gap-1">
                              <History className="w-3 h-3 text-amber-400" /> Changes &amp; Activity Log
                            </span>
                            <div className="space-y-2 max-h-48 overflow-y-auto pr-1 divide-y divide-slate-800/60">
                              {logs.map((log) => (
                                <div key={log.id} className="pt-1.5 first:pt-0 space-y-0.5">
                                  <div className="flex justify-between items-center text-[10px]">
                                    <strong className="text-slate-200">{log.action}</strong>
                                    <span className="text-slate-500 font-mono">{log.timestamp}</span>
                                  </div>
                                  <p className="text-[10px] text-slate-400">{log.details}</p>
                                  <span className="text-[9px] text-cyan-400/80 block">By: {log.author}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-xs text-slate-500 italic bg-slate-950/40 rounded-xl border border-slate-800">
                    ✅ Yellow Urgent Care Bay is clear. All stabilized &amp; shifted.
                  </div>
                )}
              </div>
            </div>

            {/* Priority GREEN (Minor / Fast Track) */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-emerald-500/40 space-y-3">
              <div className="flex items-center justify-between border-b border-emerald-500/30 pb-2">
                <h3 className="text-sm font-bold text-emerald-300 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  Priority GREEN (Minor Trauma / Fast-Track)
                </h3>
                <span className="text-xs font-mono text-emerald-400 font-bold">&lt; 60 Mins</span>
              </div>

              <div className="space-y-3">
                {activeCases.filter((c) => c.triagePriority.startsWith('Green')).length > 0 ? (
                  activeCases
                    .filter((c) => c.triagePriority.startsWith('Green'))
                    .map((emg) => (
                      <div key={emg.id} className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-2.5">
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-slate-100 text-sm">{emg.patientName}</span>
                          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 font-bold">
                            {emg.caseNo}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300">{emg.chiefComplaint}</p>
                        <div className="text-[10px] text-slate-400 font-mono flex justify-between pt-1 border-t border-slate-800">
                          <span>Bed: {emg.assignedBed}</span>
                          <span>Lead: {emg.assignedDoctor}</span>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="p-8 text-center text-xs text-slate-500 italic bg-slate-950/40 rounded-xl border border-slate-800">
                    No active green priority patients pending triage. All minor trauma triaged to OPD bays.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. TAB CONTENT: TRANSFERRED TO IPD / ICU ROSTER */}
      {activeTab === 'transferred' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between flex-wrap gap-4 shadow-xl">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-400" />
                <span>Shifted to IPD / ICU Admissions Directory ({transferredCases.length})</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Emergency patients successfully stabilized and transferred to inpatient beds/ICUs. These beds in the Emergency Bay are now vacant for new 108 trauma arrivals.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono text-emerald-400 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                {transferredCases.length} Transferred Cases
              </span>
            </div>
          </div>

          {transferredCases.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {transferredCases.map((emg) => {
                const logs = caseAuditHistory[emg.id] || [];
                const isAuditOpen = selectedCaseForAudit === emg.id;

                return (
                  <div
                    key={emg.id}
                    className="p-5 rounded-2xl bg-slate-900/80 border border-emerald-500/30 space-y-3.5 shadow-xl transition hover:border-emerald-500/60"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <strong className="text-white text-base block font-bold">{emg.patientName}</strong>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {emg.age}Y / {emg.gender} • Case #{emg.caseNo}
                        </span>
                      </div>

                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        ✅ {emg.status}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1 text-xs">
                      <div className="text-slate-400 text-[10px]">Destination Ward / Bed:</div>
                      <div className="text-emerald-300 font-extrabold flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{emg.assignedBed}</span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-300 space-y-1">
                      <div>
                        <span className="text-slate-500">Chief Complaint:</span> {emg.chiefComplaint}
                      </div>
                      <div>
                        <span className="text-slate-500">Attending Consultant:</span>{' '}
                        <strong className="text-cyan-300">{emg.assignedDoctor}</strong>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
                      <button
                        onClick={() => setSelectedCaseForAudit(isAuditOpen ? null : emg.id)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition flex items-center gap-1 text-[11px] font-bold"
                      >
                        <History className="w-3.5 h-3.5 text-amber-400" />
                        <span>Audit Log ({logs.length})</span>
                        {isAuditOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>

                      <span className="text-[10px] text-slate-500 font-mono">
                        Handover Complete
                      </span>
                    </div>

                    {isAuditOpen && (
                      <div className="mt-2 p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-[11px] animate-fadeIn">
                        <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider block flex items-center gap-1">
                          <History className="w-3 h-3 text-amber-400" /> Changes &amp; Transfer Trail
                        </span>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1 divide-y divide-slate-800/60">
                          {logs.map((log) => (
                            <div key={log.id} className="pt-1.5 first:pt-0 space-y-0.5">
                              <div className="flex justify-between items-center text-[10px]">
                                <strong className="text-slate-200">{log.action}</strong>
                                <span className="text-slate-500 font-mono">{log.timestamp}</span>
                              </div>
                              <p className="text-[10px] text-slate-400">{log.details}</p>
                              <span className="text-[9px] text-cyan-400/80 block">By: {log.author}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 bg-slate-900/40 rounded-2xl border border-slate-800 space-y-2">
              <Building2 className="w-10 h-10 text-slate-600 mx-auto" />
              <div className="text-sm font-bold text-slate-400">No Shifted Inpatients Yet</div>
              <p className="text-xs text-slate-500">
                When you click <strong>&quot;+ Add Admission&quot;</strong> on any emergency case in the Triage Bay, the patient will be transferred to IPD / ICU and archived here.
              </p>
            </div>
          )}
        </div>
      )}

      {/* 4. TAB CONTENT: EMERGENCY DOCTORS & SHIFT SCHEDULES */}
      {activeTab === 'schedules' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <span>24x7 Emergency Doctors on Duty &amp; Resuscitation Roster</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Live Shift Matrix
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time active ER shifts, on-call trauma surgeons, cardiologist STEMI code responders, and substitute duty doctor assignments.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-400 font-bold">
                🟢 {erSchedules.filter((d) => d.status === 'On Duty').length} Doctors On Duty
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {erSchedules.map((doc) => (
              <div
                key={doc.id}
                className={`p-5 rounded-2xl border space-y-3.5 transition shadow-lg ${
                  doc.status === 'On Duty'
                    ? 'bg-slate-900/90 border-purple-500/40 shadow-purple-950/20'
                    : doc.status === 'In Surgery'
                    ? 'bg-slate-900/90 border-rose-500/40 shadow-rose-950/20'
                    : doc.status === 'On Leave'
                    ? 'bg-slate-900/60 border-slate-800 opacity-80'
                    : 'bg-slate-900/80 border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-black text-white flex items-center gap-1.5">
                      <span>{doc.doctorName}</span>
                    </h4>
                    <div className="text-[11px] font-semibold text-purple-400 mt-0.5">{doc.specialty}</div>
                    <div className="text-[10px] text-slate-400">{doc.qualification}</div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold shrink-0 ${
                      doc.status === 'On Duty'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : doc.status === 'In Surgery'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                        : doc.status === 'On Leave'
                        ? 'bg-slate-800 text-slate-400 border border-slate-700'
                        : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                    }`}
                  >
                    {doc.status === 'On Duty'
                      ? '🟢 On Duty'
                      : doc.status === 'In Surgery'
                      ? '🔴 In OT Surgery'
                      : doc.status === 'On Leave'
                      ? '🏖️ On Leave'
                      : '🟡 On Call'}
                  </span>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-500 text-[10px] uppercase font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3 text-cyan-400" /> Shift Hours:
                    </span>
                    <strong className="font-mono text-slate-200">{doc.shift}</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-500 text-[10px] uppercase font-bold flex items-center gap-1">
                      <BedDouble className="w-3 h-3 text-purple-400" /> Assigned Bay:
                    </span>
                    <span className="font-bold text-slate-200 text-[11px]">{doc.assignedBay}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300 border-t border-slate-800 pt-1.5">
                    <span className="text-slate-500 text-[10px] uppercase font-bold flex items-center gap-1">
                      <Phone className="w-3 h-3 text-emerald-400" /> Hotline / Ext:
                    </span>
                    <strong className="font-mono text-emerald-400 text-[11px]">{doc.intercom}</strong>
                  </div>

                  {doc.status === 'On Leave' && doc.substituteDoctor && (
                    <div className="mt-2 p-2 bg-purple-500/10 border border-purple-500/30 rounded text-[10px] text-purple-300">
                      <strong>Replaced by Duty Doctor:</strong> {doc.substituteDoctor}
                    </div>
                  )}
                </div>

                {canEdit && (
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
                    <button
                      onClick={() => handleShuffleDuty(doc.id)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold transition flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3 h-3 text-cyan-400" />
                      <span>Update Duty Status</span>
                    </button>

                    <button
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, assignedDoctor: doc.doctorName }));
                        setIsModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-[11px] font-bold transition"
                    >
                      Assign Patient
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. TAB CONTENT: INTEGRATED FAST-TRACK REGISTRATION FORM */}
      {activeTab === 'register' && canEdit && (
        <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl max-w-3xl mx-auto space-y-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Siren className="w-5 h-5 text-rose-400 animate-pulse" />
                <span>Fast-Track Emergency Trauma &amp; Triage Registration</span>
              </h3>
              <p className="text-xs text-slate-400">
                Instant patient intake for walk-in emergencies, ambulance transfers, and road traffic accident trauma cases.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
              Immediate Bed Allotment
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-slate-300 font-bold mb-1">Patient Full Name / Unknown Identifier *</label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Kumar or Unidentified Male (Brought by 108 Ambulance)"
                  value={formData.patientName}
                  onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 font-bold placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Age &amp; Gender *</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Age"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono"
                    required
                  />
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 text-slate-100"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Triage Priority Category *</label>
                <select
                  value={formData.triagePriority}
                  onChange={(e: any) => setFormData({ ...formData, triagePriority: e.target.value })}
                  className="w-full bg-slate-950 border border-rose-500/50 rounded-xl px-3 py-2.5 text-rose-300 font-bold focus:outline-none"
                >
                  <option value="Red - Critical">🚨 Red - Critical (0-Min Immediate Resuscitation)</option>
                  <option value="Yellow - Urgent">🟡 Yellow - Urgent Care (&lt; 15 Mins)</option>
                  <option value="Green - Non-Urgent">🟢 Green - Minor Trauma / Fast Track</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Assigned On-Duty Doctor *</label>
                <select
                  value={formData.assignedDoctor}
                  onChange={(e) => setFormData({ ...formData, assignedDoctor: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 font-bold"
                >
                  {erSchedules
                    .filter((d) => d.status === 'On Duty' || d.status === 'On Call')
                    .map((d) => (
                      <option key={d.id} value={d.doctorName}>
                        {d.doctorName} ({d.specialty.slice(0, 24)})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Assigned ER Bed / Bay *</label>
                <select
                  value={formData.assignedBed}
                  onChange={(e) => setFormData({ ...formData, assignedBed: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 font-bold"
                >
                  <option value="EMR-BAY-01">EMR-BAY-01 (Red Resuscitation)</option>
                  <option value="EMR-BAY-02">EMR-BAY-02 (Red Resuscitation)</option>
                  <option value="EMR-BAY-03">EMR-BAY-03 (Yellow Urgent)</option>
                  <option value="EMR-BAY-04">EMR-BAY-04 (Yellow Urgent)</option>
                  <option value="EMR-BAY-05">EMR-BAY-05 (Minor OT Bay)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Chief Presenting Emergency Complaint *</label>
              <input
                type="text"
                placeholder="e.g. Acute chest pain with diaphoresis, Road traffic accident with head injury, Poly-trauma"
                value={formData.chiefComplaint}
                onChange={(e) => setFormData({ ...formData, chiefComplaint: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                required
              />
            </div>

            {/* Bedside Vitals */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Bedside Triage Vitals &amp; Glasgow Coma Scale (GCS)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <span className="text-[10px] text-slate-500 block">Blood Pressure</span>
                  <input
                    type="text"
                    value={formData.vitalsBp}
                    onChange={(e) => setFormData({ ...formData, vitalsBp: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-xs text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Pulse (bpm)</span>
                  <input
                    type="text"
                    value={formData.vitalsPulse}
                    onChange={(e) => setFormData({ ...formData, vitalsPulse: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-xs text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">SpO2 Oxygen</span>
                  <input
                    type="text"
                    value={formData.vitalsSpo2}
                    onChange={(e) => setFormData({ ...formData, vitalsSpo2: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-xs text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">GCS Score</span>
                  <input
                    type="text"
                    value={formData.gcsScore}
                    onChange={(e) => setFormData({ ...formData, gcsScore: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-xs text-slate-100 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* MLC Checkbox */}
            <div className="p-3.5 bg-purple-500/10 border border-purple-500/30 rounded-xl space-y-2">
              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  id="mlcCheck"
                  checked={formData.medicoLegalCase}
                  onChange={(e) => setFormData({ ...formData, medicoLegalCase: e.target.checked })}
                  className="w-4 h-4 rounded border-purple-500/40 text-purple-600 focus:ring-0 cursor-pointer"
                />
                <label htmlFor="mlcCheck" className="text-xs text-purple-200 font-bold cursor-pointer">
                  Mark as Medico-Legal Case (MLC Mandatory Police Intimation Memo)
                </label>
              </div>
              {formData.medicoLegalCase && (
                <div className="pt-2 border-t border-purple-500/20">
                  <span className="text-[10px] text-purple-400 block mb-1">Police Station Jurisdiction:</span>
                  <input
                    type="text"
                    value={formData.mlcPoliceStation}
                    onChange={(e) => setFormData({ ...formData, mlcPoliceStation: e.target.value })}
                    className="w-full bg-slate-950 border border-purple-500/40 rounded-lg p-1.5 text-slate-200 text-xs"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('triage')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold shadow-lg shadow-rose-950/50 transition active:scale-95"
              >
                Confirm Fast-Track Emergency Admission
              </button>
            </div>
          </form>
        </div>
      )}



      {/* 6. MODAL: REASSIGN / CHANGE ACCEPTED DOCTOR */}
      {caseForDoctorChange && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-purple-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-purple-300 flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-purple-400" />
                Change Lead Attending Doctor
              </h3>
              <button onClick={() => setCaseForDoctorChange(null)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px] block">Patient:</span>
                <strong className="text-white text-sm block">{caseForDoctorChange.patientName}</strong>
                <span className="text-slate-400 text-[10px]">
                  Priority: <strong className="text-rose-400">{caseForDoctorChange.triagePriority}</strong> • Bed:{' '}
                  <strong className="text-slate-200">{caseForDoctorChange.assignedBed}</strong>
                </span>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1.5">Select New On-Duty Doctor / Consultant:</label>
                <div className="space-y-2">
                  {erSchedules.map((doc) => (
                    <button
                      key={doc.id}
                      type="button"
                      onClick={() => handleConfirmDoctorChange(caseForDoctorChange.id, doc.doctorName)}
                      className="w-full p-3 rounded-xl bg-slate-950 hover:bg-purple-950/40 border border-slate-800 hover:border-purple-500/50 text-left transition flex items-center justify-between"
                    >
                      <div>
                        <strong className="text-white block font-bold">{doc.doctorName}</strong>
                        <span className="text-[10px] text-purple-400">{doc.specialty}</span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                        {doc.status}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. MODAL: CONVERT TO FULL IPD / ICU ADMISSION */}
      {caseForAdmission && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-emerald-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-emerald-300 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-400" />
                Transfer &amp; Admit to IPD / ICU Ward
              </h3>
              <button onClick={() => setCaseForAdmission(null)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmIPDAdmission} className="space-y-4 text-xs">
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px]">Patient Name:</span>
                <strong className="text-white text-sm block">{caseForAdmission.patientName}</strong>
                <span className="text-slate-400 text-[10px]">
                  Case #{caseForAdmission.caseNo} • {caseForAdmission.age} Yrs / {caseForAdmission.gender}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Target Ward / Unit *</label>
                  <select
                    value={admissionForm.targetWard}
                    onChange={(e) => setAdmissionForm({ ...admissionForm, targetWard: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-bold"
                  >
                    <option value="Cardiac ICU Suite">Cardiac ICU Suite</option>
                    <option value="Neuro ICU Suite">Neuro ICU Suite</option>
                    <option value="General Male Ward">General Male Ward</option>
                    <option value="Deluxe Private Rooms">Deluxe Private Rooms</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Target Bed Number *</label>
                  <select
                    value={admissionForm.targetBedId}
                    onChange={(e) => setAdmissionForm({ ...admissionForm, targetBedId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-bold"
                  >
                    {beds
                      .filter((b) => b.status === 'Available')
                      .map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.bedNumber} ({b.wardName} - ₹{b.dailyRate}/day)
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Admitting Consultant *</label>
                  <input
                    type="text"
                    value={admissionForm.admittingConsultant}
                    onChange={(e) => setAdmissionForm({ ...admissionForm, admittingConsultant: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Admission Deposit (₹) *</label>
                  <input
                    type="number"
                    value={admissionForm.depositAmount}
                    onChange={(e) => setAdmissionForm({ ...admissionForm, depositAmount: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Clinical Handover Notes</label>
                <textarea
                  rows={2}
                  value={admissionForm.clinicalNotes}
                  onChange={(e) => setAdmissionForm({ ...admissionForm, clinicalNotes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setCaseForAdmission(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold shadow-lg shadow-emerald-950/50"
                >
                  Confirm IPD Admission &amp; Stretcher Handover
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. MODAL: PRINTABLE EMERGENCY TOKEN SLIP */}
      {printedTokenCase && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white text-slate-900 rounded-2xl p-6 shadow-2xl space-y-4 font-mono">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="text-left">
                <h4 className="font-extrabold text-xs text-rose-700 uppercase tracking-wider">
                  Bhaskar Reddy Cancer Hospital
                </h4>
                <p className="text-[9px] text-slate-500">24x7 Emergency Trauma &amp; Resuscitation Bay</p>
              </div>
              <button
                onClick={() => setPrintedTokenCase(null)}
                className="text-slate-400 hover:text-slate-800 font-sans"
              >
                ✕
              </button>
            </div>

            <div className="text-center py-2 bg-slate-50 rounded-xl border border-dashed border-slate-300">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Priority Emergency Token</span>
              <span className="text-3xl font-black text-rose-600 block mt-1 tracking-wider">
                {printedTokenCase.tokenNo}
              </span>
              <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-full inline-block mt-1">
                {printedTokenCase.case.triagePriority}
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-left">
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-500 text-[10px]">Patient:</span>
                <strong className="text-slate-800">{printedTokenCase.case.patientName}</strong>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-500 text-[10px]">Case ID:</span>
                <strong className="text-slate-800">{printedTokenCase.case.caseNo}</strong>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-500 text-[10px]">Attending Lead:</span>
                <strong className="text-slate-800">{printedTokenCase.case.assignedDoctor}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 text-[10px]">Emergency Bay Bed:</span>
                <strong className="text-rose-600 font-bold">{printedTokenCase.case.assignedBed}</strong>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-end gap-2 font-sans">
              <button
                onClick={() => window.print()}
                className="w-full py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print Thermal Slip</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. MODAL POPUP FOR QUICK EMERGENCY ENTRY */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-rose-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-rose-300 flex items-center gap-2">
                <Siren className="w-5 h-5 text-rose-400" />
                Rapid Emergency Triage Entry
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Patient Name *</label>
                <input
                  type="text"
                  placeholder="Patient Name or Unknown/Unidentified Male"
                  value={formData.patientName}
                  onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Age</label>
                  <input
                    type="number"
                    placeholder="30"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Triage Priority</label>
                <select
                  value={formData.triagePriority}
                  onChange={(e: any) => setFormData({ ...formData, triagePriority: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-bold text-rose-400"
                >
                  <option value="Red - Critical">Red - Critical (Immediate Resuscitation)</option>
                  <option value="Yellow - Urgent">Yellow - Urgent (Trauma / Laceration)</option>
                  <option value="Green - Non-Urgent">Green - Non-Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Chief Complaint</label>
                <input
                  type="text"
                  placeholder="e.g. Chest pain, RTA, Laceration"
                  value={formData.chiefComplaint}
                  onChange={(e) => setFormData({ ...formData, chiefComplaint: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="mlcModal"
                  checked={formData.medicoLegalCase}
                  onChange={(e) => setFormData({ ...formData, medicoLegalCase: e.target.checked })}
                  className="rounded border-slate-800"
                />
                <label htmlFor="mlcModal" className="text-slate-300 font-bold">
                  Mark as Medico-Legal Case (MLC Police Intimation Required)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold"
                >
                  Confirm Triage Admission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

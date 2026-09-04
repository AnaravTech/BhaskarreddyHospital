import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import type { Patient } from '../../types';
import {
  Users,
  Search,
  Clock,
  Shield,
  Phone,
  AlertCircle,
  Activity,
  ChevronRight,
  FileText,
  Printer,
  X,
  CheckSquare,
  Square,
  Download,
  Lock,
  RotateCcw,
  ShieldCheck,
  Building2,
  ArrowRightLeft,
  Stethoscope,
  Heart,
} from 'lucide-react';

interface SectionOption {
  id: string;
  label: string;
  category: 'core' | 'clinical' | 'administrative';
  isCore?: boolean;
}

const SECTION_OPTIONS: SectionOption[] = [
  { id: 'patientInfo', label: 'Patient Information', category: 'core', isCore: true },
  { id: 'medicalHistory', label: 'Medical History', category: 'clinical' },
  { id: 'allergiesAlerts', label: 'Allergies & Alerts', category: 'clinical' },
  { id: 'currentSummary', label: 'Current Diagnosis', category: 'clinical' },
  { id: 'vitals', label: 'Vital Signs', category: 'clinical' },
  { id: 'medications', label: 'Medications / Prescriptions', category: 'clinical' },
  { id: 'labReports', label: 'Lab Reports', category: 'clinical' },
  { id: 'radiologyReports', label: 'Radiology Reports', category: 'clinical' },
  { id: 'visits', label: 'Visits & Consultations', category: 'clinical' },
  { id: 'admissions', label: 'Admissions & Discharge Summary', category: 'clinical' },
  { id: 'procedures', label: 'Procedures / Surgeries', category: 'clinical' },
  { id: 'treatmentPlan', label: 'Follow-up & Treatment Plan', category: 'clinical' },
  { id: 'billing', label: 'Billing Summary', category: 'administrative' },
  { id: 'insurance', label: 'Insurance Information', category: 'administrative' },
  { id: 'documents', label: 'Attached Documents', category: 'administrative' },
];

export const PatientManagementModule: React.FC = () => {
  const {
    patients,
    checkOPValidity,
    currentUser,
    activeBranch,
    activeTenant,
    doctors,
    transferPatientBranch,
  } = useHospital();
  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilterScope, setBranchFilterScope] = useState<'current' | 'all'>('current');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(patients[0] || null);
  const [showEHRModal, setShowEHRModal] = useState(false);
  const [showSectionPickerModal, setShowSectionPickerModal] = useState(false);
  
  // Inter-Hospital Cross-Branch Transfer State
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferTargetBranchId, setTransferTargetBranchId] = useState(
    activeTenant.branches.find((b) => b.id !== activeBranch.id)?.id || 'b-2'
  );
  const [transferDoctorName, setTransferDoctorName] = useState('');
  const [transferReason, setTransferReason] = useState('Specialized Cross-Branch Tertiary Consultation');

  const [auditRecord, setAuditRecord] = useState<{
    id: string;
    userName: string;
    userRole: string;
    timestamp: string;
  } | null>(null);

  // Get initial role-tailored defaults
  const getRoleDefaultSections = (): Record<string, boolean> => {
    const role = currentUser?.role?.toLowerCase() || 'doctor';
    if (role.includes('doctor') || role.includes('consultant') || role.includes('admin')) {
      return {
        patientInfo: true,
        medicalHistory: true,
        allergiesAlerts: true,
        currentSummary: true,
        vitals: true,
        medications: true,
        labReports: true,
        radiologyReports: true,
        visits: true,
        admissions: true,
        procedures: true,
        treatmentPlan: true,
        billing: false,
        insurance: false,
        documents: false,
      };
    } else if (role.includes('nurse')) {
      return {
        patientInfo: true,
        medicalHistory: true,
        allergiesAlerts: true,
        currentSummary: true,
        vitals: true,
        medications: true,
        labReports: true,
        radiologyReports: false,
        visits: true,
        admissions: true,
        procedures: false,
        treatmentPlan: true,
        billing: false,
        insurance: false,
        documents: false,
      };
    } else if (role.includes('pharm')) {
      return {
        patientInfo: true,
        medicalHistory: false,
        allergiesAlerts: true,
        currentSummary: true,
        vitals: false,
        medications: true,
        labReports: false,
        radiologyReports: false,
        visits: false,
        admissions: false,
        procedures: false,
        treatmentPlan: false,
        billing: false,
        insurance: false,
        documents: false,
      };
    } else if (role.includes('lab')) {
      return {
        patientInfo: true,
        medicalHistory: false,
        allergiesAlerts: false,
        currentSummary: false,
        vitals: true,
        medications: false,
        labReports: true,
        radiologyReports: false,
        visits: false,
        admissions: false,
        procedures: false,
        treatmentPlan: false,
        billing: false,
        insurance: false,
        documents: false,
      };
    } else if (role.includes('recep') || role.includes('cashier')) {
      return {
        patientInfo: true,
        medicalHistory: false,
        allergiesAlerts: false,
        currentSummary: false,
        vitals: false,
        medications: false,
        labReports: false,
        radiologyReports: false,
        visits: true,
        admissions: true,
        procedures: false,
        treatmentPlan: false,
        billing: true,
        insurance: true,
        documents: false,
      };
    }
    // Default fallback
    return {
      patientInfo: true,
      medicalHistory: true,
      allergiesAlerts: true,
      currentSummary: true,
      vitals: true,
      medications: true,
      labReports: true,
      radiologyReports: true,
      visits: true,
      admissions: true,
      procedures: true,
      treatmentPlan: true,
      billing: false,
      insurance: false,
      documents: false,
    };
  };

  const [selectedSections, setSelectedSections] = useState<Record<string, boolean>>(getRoleDefaultSections());

  const handleToggleSection = (id: string) => {
    if (id === 'patientInfo') return; // Cannot uncheck core
    setSelectedSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSelectAll = () => {
    const allTrue: Record<string, boolean> = {};
    SECTION_OPTIONS.forEach((s) => {
      allTrue[s.id] = true;
    });
    setSelectedSections(allTrue);
  };

  const handleSelectClinicalOnly = () => {
    const clinical: Record<string, boolean> = {};
    SECTION_OPTIONS.forEach((s) => {
      clinical[s.id] = !!(s.category === 'clinical' || s.isCore);
    });
    setSelectedSections(clinical);
  };

  const handleResetToRole = () => {
    setSelectedSections(getRoleDefaultSections());
  };

  const handleTriggerDownloadEHR = () => {
    // Generate audit record
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const auditId = `AUD-${now.getFullYear()}-BRH-${Math.floor(1000 + Math.random() * 9000)}`;

    const audit = {
      id: auditId,
      userName: currentUser?.name || 'Dr. Vikram Reddy',
      userRole: currentUser?.roleTitle || (currentUser?.role ? currentUser.role.toUpperCase() : 'Medical Officer'),
      timestamp: `${dateStr}, ${timeStr}`,
    };

    setAuditRecord(audit);
    setShowSectionPickerModal(false);
    setShowEHRModal(true);
  };

  const filteredPatients = patients.filter((p) => {
    const q = searchTerm.toLowerCase().trim();
    const matchesBranch =
      branchFilterScope === 'all' ||
      (p.primaryBranchId ? p.primaryBranchId === activeBranch.id : true) ||
      q.length > 0; // If actively searching, search universally across all branches!

    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.uhid.toLowerCase().includes(q) ||
      (p.opNumber && p.opNumber.toLowerCase().includes(q)) ||
      p.phone.includes(q) ||
      (p.aadharNumber && p.aadharNumber.includes(q));

    return matchesBranch && matchesSearch;
  });

  const handleConfirmTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;
    transferPatientBranch(selectedPatient.id, transferTargetBranchId, transferReason, transferDoctorName);
    setShowTransferModal(false);
  };

  const targetBranchDoctors = doctors.filter(
    (d) => d.branchId === transferTargetBranchId || !d.branchId
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Module Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" />
              <span>Current Branch: <strong>{activeBranch.name}</strong></span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/30">
              Universal UHID Network
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">Digital Health Record Directory</h2>
          <p className="text-xs text-slate-400">
            Comprehensive UHID patient master profiles, longitudinal multi-branch visits, and cross-hospital transfers.
          </p>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search across all branches (UHID, Name, Mobile)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Directory Table */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              Patient Roster ({filteredPatients.length})
            </h3>

            {/* Branch Scope Toggle */}
            <div className="flex items-center p-0.5 bg-slate-950 rounded-lg border border-slate-800 text-[11px]">
              <button
                type="button"
                onClick={() => setBranchFilterScope('current')}
                className={`px-2.5 py-1 rounded-md font-semibold transition ${
                  branchFilterScope === 'current'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {activeBranch.city} Branch
              </button>
              <button
                type="button"
                onClick={() => setBranchFilterScope('all')}
                className={`px-2.5 py-1 rounded-md font-semibold transition flex items-center gap-1 ${
                  branchFilterScope === 'all'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>🌐 All Branches</span>
              </button>
            </div>
          </div>

          <div className="space-y-2 max-h-[650px] overflow-y-auto pr-1">
            {filteredPatients.map((pat) => {
              const isSelected = selectedPatient?.id === pat.id;
              const patVal = checkOPValidity(pat.lastVisitDate, pat.totalVisits);
              const isCrossBranch = pat.primaryBranchId && pat.primaryBranchId !== activeBranch.id;

              return (
                <div
                  key={pat.id}
                  onClick={() => setSelectedPatient(pat)}
                  className={`p-3.5 rounded-xl border transition cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800/90 border-cyan-500/60 shadow-md shadow-cyan-950/40'
                      : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-cyan-400">{pat.uhid}</span>
                      {isCrossBranch ? (
                        <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-0.5">
                          <Building2 className="w-2.5 h-2.5" />
                          {pat.registeredBranchName || 'Other Branch'}
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                          {activeBranch.city}
                        </span>
                      )}
                    </div>
                    <span
                      className={`px-2 py-0.5 text-[9px] font-bold rounded ${
                        pat.status === 'Admitted'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {pat.status}
                    </span>
                  </div>

                  <div className="mt-1.5 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-100">{pat.name}</div>
                      <div className="text-[10px] text-slate-400">
                        {pat.gender}, {pat.age} yrs • Blood: {pat.bloodGroup}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Last Visit: {pat.lastVisitDate || 'First Visit'}</span>
                    <span className={patVal.isValid ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>
                      {patVal.isValid ? `OP Free (${patVal.daysRemaining}d)` : 'Validity Expired'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Patient Comprehensive Profile Viewer */}
        <div className="lg:col-span-7">
          {selectedPatient ? (
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-6">
              {/* Profile Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-cyan-600/20">
                    {selectedPatient.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-black text-white">{selectedPatient.name}</h3>
                      <span className="font-mono text-xs text-cyan-400 font-bold px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/30 rounded">
                        {selectedPatient.uhid}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        {selectedPatient.registeredBranchName || activeBranch.name}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {selectedPatient.gender}, {selectedPatient.age} Years • Registered {selectedPatient.registeredDate}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => {
                      setTransferTargetBranchId(
                        activeTenant.branches.find((b) => b.id !== (selectedPatient.primaryBranchId || activeBranch.id))?.id || 'b-2'
                      );
                      setShowTransferModal(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 text-xs font-bold transition active:scale-95"
                    title="Transfer or refer patient to another hospital branch"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    <span>Transfer Branch</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedSections(getRoleDefaultSections());
                      setShowSectionPickerModal(true);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-cyan-900/40 transition active:scale-95"
                    title="Choose sections and download customized Patient Medical Record Summary PDF"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download EHR (PDF)</span>
                  </button>
                </div>
              </div>

              {/* Doctor-Specific 15-Day OP Consultation Validity Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    Doctor-Specific 15-Day OP Validity Ledger
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    (Validity is doctor-specific: Patient ID + Doctor ID → Valid Until)
                  </span>
                </div>

                {selectedPatient.doctorValidities && Object.keys(selectedPatient.doctorValidities).length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {Object.values(selectedPatient.doctorValidities).map((docRec) => {
                      const docVal = checkOPValidity(selectedPatient.id, docRec.doctorId);
                      return (
                        <div
                          key={docRec.doctorId}
                          className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                            docVal.isValid
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                              : 'bg-slate-950 border-slate-800 text-slate-400'
                          }`}
                        >
                          <div>
                            <div className="font-bold text-slate-100 flex items-center gap-1.5">
                              <span>{docRec.doctorName || docRec.doctorId}</span>
                            </div>
                            <div className="text-[10px] opacity-80 mt-0.5">
                              Last Visit: {docRec.lastVisitDate} • Valid Until: {docRec.validUntil}
                            </div>
                          </div>

                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                              docVal.isValid
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}
                          >
                            {docVal.isValid ? `Free OP (${docVal.daysRemaining}d left)` : 'Expired'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                    <span>No prior doctor-specific consultations recorded yet.</span>
                    <span className="text-[10px] font-semibold text-cyan-400">Standard Consultation Fee on next visit</span>
                  </div>
                )}
              </div>

              {/* Key Vitals & Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-slate-300 border-b border-slate-800/60 pb-1 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-cyan-400" /> Identity, Contact & Residence
                  </div>
                  <div className="text-xs space-y-1 text-slate-300">
                    <div>
                      <span className="text-slate-500">Aadhar No:</span>{' '}
                      <span className="font-mono font-bold text-cyan-400">{selectedPatient.aadharNumber || 'Not Linked'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">DOB:</span>{' '}
                      <span className="font-mono">{selectedPatient.dob || 'N/A'}</span> ({selectedPatient.age} yrs)
                    </div>
                    <div>
                      <span className="text-slate-500">Phone:</span> {selectedPatient.phone}
                    </div>
                    <div>
                      <span className="text-slate-500">Email:</span> {selectedPatient.email || 'Not Provided'}
                    </div>
                    <div>
                      <span className="text-slate-500">Address:</span> {selectedPatient.address}
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-slate-300 border-b border-slate-800/60 pb-1 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-purple-400" /> TPA & Clinical Demographics
                  </div>
                  <div className="text-xs space-y-1 text-slate-300">
                    <div>
                      <span className="text-slate-500">Blood Group:</span>{' '}
                      <span className="font-bold text-rose-400">{selectedPatient.bloodGroup || 'Unknown'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Gender:</span> {selectedPatient.gender}
                    </div>
                    <div>
                      <span className="text-slate-500">Provider:</span>{' '}
                      {selectedPatient.insuranceProvider || 'Cash / Self Pay'}
                    </div>
                    <div>
                      <span className="text-slate-500">Policy No:</span>{' '}
                      <span className="font-mono">{selectedPatient.policyNumber || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Total Visits:</span>{' '}
                      <span className="font-bold text-cyan-400">{selectedPatient.totalVisits || 1} Visits Recorded</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 1. Real-time Patient Clinical Vitals Telemetry Grid */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-cyan-400" />
                    Live Clinical Vitals Signs & Bedside Telemetry
                  </span>
                  <span className="text-[10px] text-cyan-400 font-mono">
                    Last Updated: {selectedPatient.lastVisitDate || selectedPatient.registeredDate}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Heart className="w-3 h-3 text-rose-400" /> Blood Pressure
                    </span>
                    <strong className="text-sm font-bold text-rose-400 font-mono block mt-0.5">
                      {selectedPatient.vitals?.bp || '120/80'}
                    </strong>
                    <span className="text-[9px] text-slate-500 block">mmHg</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Activity className="w-3 h-3 text-cyan-400" /> Pulse Rate
                    </span>
                    <strong className="text-sm font-bold text-cyan-400 font-mono block mt-0.5">
                      {selectedPatient.vitals?.pulse || '72'}
                    </strong>
                    <span className="text-[9px] text-slate-500 block">bpm (Norm: 60-100)</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Temperature</span>
                    <strong className="text-sm font-bold text-amber-400 font-mono block mt-0.5">
                      {selectedPatient.vitals?.temp || '98.6 °F'}
                    </strong>
                    <span className="text-[9px] text-slate-500 block">Afebrile</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Oxygen (SpO2)</span>
                    <strong className="text-sm font-bold text-emerald-400 font-mono block mt-0.5">
                      {selectedPatient.vitals?.spo2 || '99%'}
                    </strong>
                    <span className="text-[9px] text-slate-500 block">Room Air</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Resp. Rate</span>
                    <strong className="text-sm font-bold text-purple-400 font-mono block mt-0.5">
                      {selectedPatient.vitals?.respRate || '16 /min'}
                    </strong>
                    <span className="text-[9px] text-slate-500 block">Eupneic</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Body Composition</span>
                    <strong className="text-xs font-bold text-cyan-300 font-mono block mt-0.5">
                      {selectedPatient.vitals?.weight || '68 kg'} • {selectedPatient.vitals?.bmi ? `BMI ${selectedPatient.vitals.bmi}` : 'BMI 22.9'}
                    </strong>
                    <span className="text-[9px] text-slate-500 block">Ht: {selectedPatient.vitals?.height || '172 cm'}</span>
                  </div>
                </div>
              </div>

              {/* 2. Current Clinical Diagnosis & Doctor Encounter Notes */}
              {selectedPatient.currentSummary && (
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <Stethoscope className="w-3.5 h-3.5 text-cyan-400" /> Current Clinical Diagnosis & Impression
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                      {selectedPatient.currentSummary.condition}
                    </span>
                  </div>
                  <div className="text-xs space-y-1">
                    <div className="font-extrabold text-cyan-300 text-sm">{selectedPatient.currentSummary.diagnosis}</div>
                    <div className="text-[11px] text-slate-400">
                      Attending Consultant: <strong className="text-slate-200">{selectedPatient.currentSummary.doctor}</strong>
                    </div>
                    <div className="text-xs text-slate-300 bg-slate-900 p-2.5 rounded-lg border border-slate-800 mt-1">
                      <strong className="text-slate-400">Treatment Orders & Notes: </strong>
                      {selectedPatient.currentSummary.treatment}
                    </div>
                  </div>
                </div>
              )}

              {/* 3. Active Digital Prescriptions & Medications (Rx) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-cyan-400" /> Active Digital Prescriptions & Medications (Rx)
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {selectedPatient.medications?.length || 0} Active Prescriptions
                  </span>
                </div>

                {selectedPatient.medications && selectedPatient.medications.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedPatient.medications.map((med, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                        <div className="font-extrabold text-slate-100 flex items-center justify-between">
                          <span>{med.drugName}</span>
                          <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                            {med.dosage}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Frequency: <strong className="text-slate-200">{med.frequency}</strong> • Duration: {med.duration} • {med.route}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Prescribed by: {med.doctor}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-500">
                    No active digital prescriptions on file for this patient.
                  </div>
                )}
              </div>

              {/* Allergies & Alerts Banner */}
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-1">
                <div className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" /> Allergies & Medical Warnings
                </div>
                <div className="text-xs text-rose-200">
                  {selectedPatient.allergies && selectedPatient.allergies.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {selectedPatient.allergies.map((allergy, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-rose-500/20 border border-rose-500/30 font-medium">
                          ⚠️ {allergy}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-400">No known drug allergies reported (NKDA).</span>
                  )}
                </div>
              </div>

              {/* Past Medical History */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" /> Longitudinal Medical History & Diagnoses
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                  {selectedPatient.medicalHistory && selectedPatient.medicalHistory.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1 text-slate-300">
                      {selectedPatient.medicalHistory.map((history, idx) => (
                        <li key={idx}>{history}</li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-slate-500">No prior chronic medical history entered.</span>
                  )}
                </div>
              </div>

              {/* Inter-Hospital Cross-Branch Multi-Branch History */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-purple-400" />
                    Inter-Hospital Cross-Branch Visit & Transfer History
                  </span>
                  <span className="text-[10px] text-purple-400 font-mono">
                    Home Branch: {selectedPatient.registeredBranchName || activeBranch.name}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs">
                  {selectedPatient.interBranchHistory && selectedPatient.interBranchHistory.length > 0 ? (
                    <div className="space-y-2 divide-y divide-slate-800/60">
                      {selectedPatient.interBranchHistory.map((hist, idx) => (
                        <div key={idx} className="pt-2 first:pt-0 flex items-start justify-between gap-3">
                          <div className="space-y-0.5">
                            <div className="font-bold text-slate-200 flex items-center gap-2">
                              <span>🏢 {hist.branchName}</span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                {hist.type}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400">
                              Attending / Receiving: <strong className="text-cyan-400">{hist.doctorName}</strong>
                            </div>
                            {hist.notes && (
                              <div className="text-[10px] text-slate-500 italic mt-0.5">
                                "{hist.notes}"
                              </div>
                            )}
                          </div>
                          <span className="text-[10px] font-mono text-slate-400 shrink-0">
                            {hist.visitDate}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-slate-400 text-[11px] flex items-center justify-between">
                      <span>Registered at <strong>{selectedPatient.registeredBranchName || activeBranch.name}</strong>. No inter-branch transfers requested yet.</span>
                      <button
                        type="button"
                        onClick={() => {
                          setTransferTargetBranchId(
                            activeTenant.branches.find((b) => b.id !== (selectedPatient.primaryBranchId || activeBranch.id))?.id || 'b-2'
                          );
                          setShowTransferModal(true);
                        }}
                        className="text-[10px] font-bold text-purple-400 hover:text-purple-300 underline"
                      >
                        Initiate Transfer →
                      </button>
                    </div>
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 bg-slate-900/40 rounded-2xl border border-slate-800">
              Select a patient from the roster to view their medical profile and export EHR.
            </div>
          )}
        </div>
      </div>

      {/* 0. INTER-HOSPITAL CROSS-BRANCH TRANSFER MODAL */}
      {showTransferModal && selectedPatient && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in duration-150">
            {/* Modal Header */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/40 text-purple-400 flex items-center justify-center font-bold">
                  <ArrowRightLeft className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
                    TRANSFER PATIENT TO ANOTHER HOSPITAL BRANCH
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {selectedPatient.name} • <span className="font-mono text-cyan-400">{selectedPatient.uhid}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowTransferModal(false)}
                className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmTransfer} className="p-5 space-y-4 text-xs">
              {/* Patient Current Branch Badge */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <div className="text-[10px] text-slate-500 uppercase font-bold">Current Active Branch</div>
                <div className="text-slate-200 font-bold flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-cyan-400" />
                  <span>{selectedPatient.registeredBranchName || activeBranch.name}</span>
                  <span className="font-mono text-[10px] text-cyan-400 bg-cyan-950/60 px-1.5 py-0.2 rounded border border-cyan-800/40">
                    UHID: {selectedPatient.uhid}
                  </span>
                </div>
              </div>

              {/* Target Branch Selector */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-purple-400" />
                  <span>Select Destination Hospital Branch</span>
                  <span className="text-rose-400">*</span>
                </label>
                <select
                  value={transferTargetBranchId}
                  onChange={(e) => {
                    setTransferTargetBranchId(e.target.value);
                    setTransferDoctorName('');
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-purple-500"
                  required
                >
                  {activeTenant.branches
                    .filter((b) => b.id !== (selectedPatient.primaryBranchId || activeBranch.id))
                    .map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name} ({branch.city})
                      </option>
                    ))}
                </select>
              </div>

              {/* Target Doctor Assignment (Filtered for target branch) */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Refer To Receiving Doctor at Target Branch</span>
                </label>
                <select
                  value={transferDoctorName}
                  onChange={(e) => setTransferDoctorName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  <option value="">-- Any Available Specialist On Duty --</option>
                  {targetBranchDoctors.map((doc) => (
                    <option key={doc.id} value={doc.name}>
                      {doc.name} - {doc.specialization} ({doc.departmentName})
                    </option>
                  ))}
                </select>
              </div>

              {/* Transfer Reason & Clinical Referral Notes */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300">
                  Clinical Transfer Reason & Referral Notes
                </label>
                <textarea
                  rows={3}
                  value={transferReason}
                  onChange={(e) => setTransferReason(e.target.value)}
                  placeholder="E.g., Referred for robotic orthopedic joint replacement, tertiary NICU care, patient relocated..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div className="p-3 bg-purple-950/20 border border-purple-500/30 rounded-xl text-[11px] text-purple-300">
                💡 <strong>Universal UHID Guarantee:</strong> The patient will retain their existing UHID ({selectedPatient.uhid}), complete electronic health record, diagnoses, and lab results without creating duplicate profiles.
              </div>

              {/* Modal Footer */}
              <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-950/50 transition active:scale-95"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>Confirm Inter-Hospital Transfer</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 1. SELECTION POPUP MODAL: DOWNLOAD PATIENT EHR */}
      {showSectionPickerModal && selectedPatient && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in duration-150">
            {/* Modal Header */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center font-bold">
                  📄
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
                    DOWNLOAD PATIENT EHR
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {selectedPatient.name} • <span className="font-mono text-cyan-400">{selectedPatient.uhid}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSectionPickerModal(false)}
                className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Role Access Indicator */}
            <div className="px-5 py-2.5 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5 text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Active Role: <strong className="text-emerald-400">{currentUser?.roleTitle || (currentUser?.role ? currentUser.role.toUpperCase() : 'Doctor')}</strong></span>
              </div>
              <span className="text-[10px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                Role-Tailored Defaults
              </span>
            </div>

            {/* Quick Filter Actions */}
            <div className="px-5 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-2 text-xs">
              <span className="text-[11px] text-slate-400 font-medium">Include in Summary:</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-semibold transition"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={handleSelectClinicalOnly}
                  className="px-2 py-1 rounded bg-cyan-950/60 border border-cyan-700/50 hover:bg-cyan-900/60 text-cyan-300 text-[10px] font-semibold transition"
                >
                  Clinical Only
                </button>
                <button
                  type="button"
                  onClick={handleResetToRole}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold flex items-center gap-1 transition"
                  title="Reset to role-based default permissions"
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                  Reset
                </button>
              </div>
            </div>

            {/* Checkbox Section List */}
            <div className="p-5 max-h-[55vh] overflow-y-auto space-y-1.5 divide-y divide-slate-800/60">
              {SECTION_OPTIONS.map((sec) => {
                const isChecked = !!selectedSections[sec.id];
                const isLocked = !!sec.isCore;

                return (
                  <div
                    key={sec.id}
                    onClick={() => !isLocked && handleToggleSection(sec.id)}
                    className={`pt-2 first:pt-0 flex items-center justify-between p-2 rounded-lg cursor-pointer transition ${
                      isChecked
                        ? 'bg-slate-800/50 hover:bg-slate-800/80'
                        : 'bg-transparent hover:bg-slate-850 opacity-70'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 text-xs text-slate-200 font-medium select-none">
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-cyan-400 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-500 shrink-0" />
                      )}
                      <span className={isChecked ? 'text-slate-100 font-semibold' : 'text-slate-400'}>
                        {sec.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isLocked ? (
                        <span className="text-[10px] font-mono text-cyan-400/80 bg-cyan-950/60 border border-cyan-800/40 px-1.5 py-0.5 rounded flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" /> Core
                        </span>
                      ) : (
                        <span className={`text-[9px] uppercase px-1.5 py-0.2 rounded font-mono ${
                          sec.category === 'clinical'
                            ? 'text-blue-400 bg-blue-950/40 border border-blue-800/30'
                            : 'text-purple-400 bg-purple-950/40 border border-purple-800/30'
                        }`}>
                          {sec.category}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setShowSectionPickerModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleTriggerDownloadEHR}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/50 transition active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. PRINTABLE OFFICIAL PATIENT MEDICAL RECORD SUMMARY PDF MODAL */}
      {showEHRModal && selectedPatient && (() => {
        const allergies = (selectedPatient.allergies || []).filter(
          (a) => a && !a.toLowerCase().includes('no known') && a.toLowerCase() !== 'nkda' && a.toLowerCase() !== 'none'
        );
        const alerts: string[] = [
          ...(selectedPatient.age >= 60 ? ['Fall Risk Precaution'] : []),
          ...(selectedPatient.medicalHistory && selectedPatient.medicalHistory.some((m) => m.toLowerCase().includes('diabetes')) ? ['Diabetic Dietary Protocol'] : []),
          ...(selectedPatient.medicalHistory && selectedPatient.medicalHistory.some((m) => m.toLowerCase().includes('cardiac') || m.toLowerCase().includes('coronary')) ? ['Cardiac Care Monitored'] : []),
          ...(allergies.length > 0 ? ['High Drug Sensitivity Alert'] : []),
        ];
        const medicalHistory = (selectedPatient.medicalHistory || []).filter((m) => m && m.trim().length > 0);
        const currentSummary = selectedPatient.currentSummary;
        const vitals = selectedPatient.vitals;
        const medications = selectedPatient.medications || [];
        const labResults = selectedPatient.labResults || [];
        const radiologyReports = selectedPatient.radiologyReports || [];
        const visits = selectedPatient.lastVisitDate
          ? [
              {
                date: selectedPatient.lastVisitDate,
                doctor: currentSummary?.doctor || 'Attending Specialist',
                department: 'Outpatient Clinic',
                type: 'OP Consultation',
                notes: 'Consultation completed and recorded.',
              },
              ...(selectedPatient.registeredDate && selectedPatient.registeredDate !== selectedPatient.lastVisitDate
                ? [
                    {
                      date: selectedPatient.registeredDate,
                      doctor: 'Patient Registrar',
                      department: 'Front Desk',
                      type: 'Initial Registration',
                      notes: 'UHID master record created.',
                    },
                  ]
                : []),
            ]
          : [];
        const admissions = selectedPatient.status === 'Admitted'
          ? [
              {
                ipdNo: `IPD-2026-${selectedPatient.uhid.slice(-4)}`,
                ward: 'Inpatient Care Ward',
                admittedDate: selectedPatient.lastVisitDate || '2026-07-22',
                dischargeDate: 'Inpatient Active',
                status: 'Currently Admitted',
                summary: 'Under active inpatient clinical monitoring and care.',
              },
            ]
          : [];
        const procedures = selectedPatient.procedures || [];
        const treatmentPlan = selectedPatient.treatmentPlan;
        const attachedDocuments = selectedPatient.attachedDocuments || [];

        const ehr = {
          name: selectedPatient.name,
          uhid: selectedPatient.uhid,
          opNumber: selectedPatient.opNumber || `BRH260700${selectedPatient.id.replace(/\D/g, '').slice(-2) || '01'}`,
          dob: selectedPatient.dob || `19${90 - Math.min(60, selectedPatient.age)}-05-15`,
          age: selectedPatient.age,
          gender: selectedPatient.gender,
          bloodGroup: selectedPatient.bloodGroup || 'O+ve',
          phone: selectedPatient.phone,
          address: selectedPatient.address || 'Pogathota, Nellore - 524001',
          aadhar: selectedPatient.aadharNumber || '7823 4512 8899',
          allergies,
          alerts,
          currentSummary,
          medicalHistory,
          vitals,
          medications,
          labResults,
          radiologyReports,
          visits,
          admissions,
          procedures,
          treatmentPlan,
          attachedDocuments,
        };

        const activeAudit = auditRecord || {
          id: `AUD-2026-BRH-${Date.now().toString().slice(-4)}`,
          userName: currentUser?.name || 'Dr. Vikram Reddy',
          userRole: currentUser?.roleTitle || 'Medical Officer',
          timestamp: '24-Jul-2026, 04:30 PM',
        };

        return (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden my-8">
              {/* Top Bar with Document Switcher */}
              <div className="p-4 bg-slate-950 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-cyan-400" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">
                      Patient Medical Record Summary • {selectedPatient.name}
                    </h3>
                    <div className="text-[11px] font-mono text-cyan-400">
                      UHID: {selectedPatient.uhid} • Cons No: {ehr.opNumber}
                    </div>
                  </div>
                </div>

                {/* Document Type Switcher */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print PDF</span>
                  </button>
                  <button
                    onClick={() => setShowEHRModal(false)}
                    className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Printable Document Body */}
              <div className="p-8 bg-white text-slate-900 font-sans text-xs space-y-4 max-h-[80vh] overflow-y-auto print:max-h-none print:overflow-visible">
                
                {/* Header */}
                <div className="text-center border-b-2 border-slate-900 pb-3 space-y-1">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-950 text-white flex items-center justify-center font-bold text-base">
                      ✚
                    </div>
                    <h1 className="text-xl font-black uppercase tracking-wider text-blue-950">
                      BHASKAR REDDY HOSPITAL
                    </h1>
                  </div>
                  <p className="text-[11px] font-semibold text-slate-700">
                    (A Multi-Speciality Tertiary Care Hospital & Diagnostic Center)
                  </p>
                  <p className="text-[10px] text-slate-600">
                    Opp. Children's Park, Pogathota, Nellore - 524001, A.P. • Ph: 0861-2345678 • Reg. No: 6/1953
                  </p>
                  <div className="pt-2 flex justify-center">
                    <span className="inline-block px-5 py-1 border-2 border-blue-950 bg-blue-50 text-blue-950 font-black text-xs uppercase tracking-widest rounded shadow-sm">
                      🏥 ELECTRONIC HEALTH RECORD • MEDICAL SUMMARY
                    </span>
                  </div>
                </div>

                {/* SECTION: PATIENT INFORMATION (Checked & Core) */}
                {selectedSections.patientInfo && (
                  <div className="border border-slate-800 rounded-md overflow-hidden text-[11px]">
                    <div className="bg-slate-900 text-white px-3 py-1 font-bold uppercase text-[10px] tracking-wider">
                      PATIENT INFORMATION
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2.5 bg-slate-50 divide-x divide-slate-200">
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-slate-500 font-bold block">Patient Full Name</span>
                        <strong className="text-slate-950 text-xs">{ehr.name}</strong>
                      </div>
                      <div className="space-y-0.5 pl-2">
                        <span className="text-[10px] text-slate-500 font-bold block">UHID / Cons No</span>
                        <strong className="font-mono text-blue-950">{ehr.uhid} / {ehr.opNumber}</strong>
                      </div>
                      <div className="space-y-0.5 pl-2">
                        <span className="text-[10px] text-slate-500 font-bold block">DOB / Age / Gender</span>
                        <span className="font-semibold text-slate-900">{ehr.dob} ({ehr.age} Y) • {ehr.gender}</span>
                      </div>
                      <div className="space-y-0.5 pl-2">
                        <span className="text-[10px] text-slate-500 font-bold block">Blood Group & Aadhar</span>
                        <span className="font-bold text-rose-700">{ehr.bloodGroup}</span> • <span className="font-mono text-slate-700">{ehr.aadhar}</span>
                      </div>
                    </div>
                    <div className="px-3 py-1 bg-slate-100 border-t border-slate-200 text-[10px] text-slate-700 flex justify-between">
                      <span><strong>Phone:</strong> {ehr.phone}</span>
                      <span><strong>Address:</strong> {ehr.address}</span>
                    </div>
                  </div>
                )}

                {/* SECTION: ALLERGIES & MEDICAL ALERTS */}
                {selectedSections.allergiesAlerts && (ehr.allergies.length > 0 || ehr.alerts.length > 0) && (
                  <div className="border border-rose-400 bg-rose-50/70 rounded-md p-2.5 space-y-1.5 text-[11px]">
                    <div className="flex items-center gap-1.5 font-bold text-rose-950 text-[11px] uppercase tracking-wider">
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                      <span>⚠️ ALLERGIES & MEDICAL ALERTS</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-rose-200">
                      {ehr.allergies.length > 0 && (
                        <div>
                          <span className="text-[10px] font-bold text-rose-900 block">Drug & Environmental Allergies:</span>
                          <div className="font-semibold text-rose-800">
                            {ehr.allergies.map(a => `• ${a}`).join('  ')}
                          </div>
                        </div>
                      )}
                      {ehr.alerts.length > 0 && (
                        <div>
                          <span className="text-[10px] font-bold text-rose-900 block">Active Clinical Flags & Precautions:</span>
                          <div className="font-semibold text-rose-800">
                            {ehr.alerts.map(al => `🚩 ${al}`).join(' • ')}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* SECTION: CURRENT MEDICAL SUMMARY */}
                {selectedSections.currentSummary && ehr.currentSummary && (ehr.currentSummary.diagnosis || ehr.currentSummary.treatment) && (
                  <div className="border border-slate-800 rounded-md overflow-hidden text-[11px]">
                    <div className="bg-slate-900 text-white px-3 py-1 font-bold uppercase text-[10px] tracking-wider">
                      CURRENT DIAGNOSIS & MEDICAL SUMMARY
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2.5 bg-slate-50">
                      {ehr.currentSummary.diagnosis && (
                        <div>
                          <span className="text-[10px] text-slate-500 font-bold block">Primary Diagnosis</span>
                          <strong className="text-blue-950">{ehr.currentSummary.diagnosis}</strong>
                        </div>
                      )}
                      {ehr.currentSummary.doctor && (
                        <div>
                          <span className="text-[10px] text-slate-500 font-bold block">Attending Doctor</span>
                          <strong className="text-slate-900">{ehr.currentSummary.doctor}</strong>
                        </div>
                      )}
                      {ehr.currentSummary.condition && (
                        <div>
                          <span className="text-[10px] text-slate-500 font-bold block">Clinical Condition</span>
                          <span className="font-semibold text-emerald-800">{ehr.currentSummary.condition}</span>
                        </div>
                      )}
                      {ehr.currentSummary.treatment && (
                        <div>
                          <span className="text-[10px] text-slate-500 font-bold block">Active Treatment</span>
                          <span className="text-slate-800">{ehr.currentSummary.treatment}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* SECTION: MEDICAL HISTORY */}
                {selectedSections.medicalHistory && ehr.medicalHistory.length > 0 && (
                  <div className="border border-slate-300 rounded-md overflow-hidden text-[11px]">
                    <div className="bg-slate-200 px-3 py-1 font-bold text-slate-900 uppercase text-[10px] tracking-wider">
                      MEDICAL HISTORY & CHRONIC COMORBIDITIES
                    </div>
                    <div className="p-2.5 bg-white">
                      <ul className="list-disc list-inside grid grid-cols-1 sm:grid-cols-2 gap-1 text-slate-800">
                        {ehr.medicalHistory.map((item, idx) => (
                          <li key={idx} className="font-medium">{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* SECTION: LATEST VITALS */}
                {selectedSections.vitals && ehr.vitals && (ehr.vitals.bp || ehr.vitals.pulse || ehr.vitals.spo2 || ehr.vitals.temp) && (
                  <div className="border border-slate-300 rounded-md overflow-hidden text-[11px]">
                    <div className="bg-slate-200 px-3 py-1 font-bold text-slate-900 uppercase text-[10px] tracking-wider">
                      LATEST VITALS & PHYSIOLOGICAL METRICS
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 p-2.5 bg-slate-50 text-center font-mono divide-x divide-slate-200">
                      {ehr.vitals.bp && (
                        <div>
                          <span className="text-[9px] text-slate-500 font-sans font-bold block">Blood Pressure</span>
                          <strong className="text-slate-950">{ehr.vitals.bp}</strong>
                        </div>
                      )}
                      {ehr.vitals.pulse && (
                        <div>
                          <span className="text-[9px] text-slate-500 font-sans font-bold block">Heart Rate</span>
                          <strong className="text-slate-950">{ehr.vitals.pulse}</strong>
                        </div>
                      )}
                      {ehr.vitals.spo2 && (
                        <div>
                          <span className="text-[9px] text-slate-500 font-sans font-bold block">Oxygen (SpO2)</span>
                          <strong className="text-emerald-700">{ehr.vitals.spo2}</strong>
                        </div>
                      )}
                      {ehr.vitals.temp && (
                        <div>
                          <span className="text-[9px] text-slate-500 font-sans font-bold block">Temperature</span>
                          <strong className="text-slate-950">{ehr.vitals.temp}</strong>
                        </div>
                      )}
                      {ehr.vitals.respRate && (
                        <div>
                          <span className="text-[9px] text-slate-500 font-sans font-bold block">Resp. Rate</span>
                          <strong className="text-slate-950">{ehr.vitals.respRate}</strong>
                        </div>
                      )}
                      {(ehr.vitals.bmi || ehr.vitals.weight) && (
                        <div>
                          <span className="text-[9px] text-slate-500 font-sans font-bold block">BMI / Wt</span>
                          <strong className="text-slate-950">{ehr.vitals.bmi || ''} {ehr.vitals.weight ? `(${ehr.vitals.weight})` : ''}</strong>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* SECTION: CURRENT MEDICATIONS */}
                {selectedSections.medications && ehr.medications.length > 0 && (
                  <div className="border border-slate-300 rounded-md overflow-hidden text-[11px]">
                    <div className="bg-slate-200 px-3 py-1 font-bold text-slate-900 uppercase text-[10px] tracking-wider">
                      CURRENT MEDICATIONS & PRESCRIPTION SCHEDULE
                    </div>
                    <table className="w-full text-left">
                      <thead className="bg-slate-100 text-[10px] font-bold text-slate-700 border-b border-slate-300">
                        <tr>
                          <th className="p-1.5 border-r border-slate-200">Drug Formulation & Dosage</th>
                          <th className="p-1.5 border-r border-slate-200">Frequency & Timing</th>
                          <th className="p-1.5 border-r border-slate-200">Duration & Route</th>
                          <th className="p-1.5">Prescribing Physician</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {ehr.medications.map((m, i) => (
                          <tr key={i}>
                            <td className="p-1.5 border-r border-slate-200 font-bold text-slate-950">{m.drugName} ({m.dosage})</td>
                            <td className="p-1.5 border-r border-slate-200">{m.frequency}</td>
                            <td className="p-1.5 border-r border-slate-200">{m.duration} • {m.route}</td>
                            <td className="p-1.5 text-slate-700">{m.doctor}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* SECTION: LABORATORY RESULTS */}
                {selectedSections.labReports && ehr.labResults.length > 0 && (
                  <div className="border border-slate-300 rounded-md overflow-hidden text-[11px]">
                    <div className="bg-slate-200 px-3 py-1 font-bold text-slate-900 uppercase text-[10px] tracking-wider">
                      LABORATORY RESULTS & PATHOLOGY PANELS
                    </div>
                    <table className="w-full text-left">
                      <thead className="bg-slate-100 text-[10px] font-bold text-slate-700 border-b border-slate-300">
                        <tr>
                          <th className="p-1.5 border-r border-slate-200">Investigation Test Name</th>
                          <th className="p-1.5 border-r border-slate-200">Observed Value</th>
                          <th className="p-1.5 border-r border-slate-200">Biological Ref. Range</th>
                          <th className="p-1.5 border-r border-slate-200">Flag / Status</th>
                          <th className="p-1.5 text-right">Report Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {ehr.labResults.map((lab, i) => (
                          <tr key={i}>
                            <td className="p-1.5 border-r border-slate-200 font-bold text-slate-900">{lab.testName}</td>
                            <td className="p-1.5 border-r border-slate-200 font-mono font-bold text-slate-950">{lab.value} {lab.unit}</td>
                            <td className="p-1.5 border-r border-slate-200 text-slate-600 font-mono">{lab.normalRange} {lab.unit}</td>
                            <td className="p-1.5 border-r border-slate-200">
                              <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                                lab.flag === 'High' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                                lab.flag === 'Critical' ? 'bg-rose-100 text-rose-900 border border-rose-300' :
                                'bg-emerald-100 text-emerald-800'
                              }`}>
                                {lab.flag}
                              </span>
                            </td>
                            <td className="p-1.5 font-mono text-right text-slate-600">{lab.date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* SECTION: RADIOLOGY / IMAGING */}
                {selectedSections.radiologyReports && ehr.radiologyReports.length > 0 && (
                  <div className="border border-slate-300 rounded-md overflow-hidden text-[11px]">
                    <div className="bg-slate-200 px-3 py-1 font-bold text-slate-900 uppercase text-[10px] tracking-wider">
                      RADIOLOGY & DIAGNOSTIC IMAGING
                    </div>
                    <div className="divide-y divide-slate-200 p-2.5 bg-white space-y-2">
                      {ehr.radiologyReports.map((rad, i) => (
                        <div key={i} className="pt-1 first:pt-0 space-y-0.5">
                          <div className="flex justify-between font-bold text-blue-950">
                            <span>{rad.modality} • {rad.bodyPart}</span>
                            <span className="font-mono text-slate-600 text-[10px]">{rad.date}</span>
                          </div>
                          <div><strong>Impression:</strong> {rad.impression}</div>
                          <div className="text-slate-600 text-[10px]">Findings: {rad.findings} (Reported by: {rad.radiologist})</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SECTION: VISITS & CONSULTATIONS */}
                {selectedSections.visits && ehr.visits.length > 0 && (
                  <div className="border border-slate-300 rounded-md overflow-hidden text-[11px]">
                    <div className="bg-slate-200 px-3 py-1 font-bold text-slate-900 uppercase text-[10px] tracking-wider">
                      LONGITUDINAL VISITS & CONSULTATIONS
                    </div>
                    <table className="w-full text-left">
                      <thead className="bg-slate-100 text-[10px] font-bold text-slate-700 border-b border-slate-300">
                        <tr>
                          <th className="p-1.5 border-r border-slate-200">Visit Date & Department</th>
                          <th className="p-1.5 border-r border-slate-200">Consulting Specialist</th>
                          <th className="p-1.5">Consultation Notes & Outcomes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {ehr.visits.map((v, i) => (
                          <tr key={i}>
                            <td className="p-1.5 border-r border-slate-200 font-mono font-bold text-slate-950">{v.date} ({v.department})</td>
                            <td className="p-1.5 border-r border-slate-200 font-semibold text-slate-900">{v.doctor}</td>
                            <td className="p-1.5 text-slate-700">{v.notes}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* SECTION: ADMISSIONS & DISCHARGES */}
                {selectedSections.admissions && ehr.admissions.length > 0 && (
                  <div className="border border-slate-300 rounded-md overflow-hidden text-[11px]">
                    <div className="bg-slate-200 px-3 py-1 font-bold text-slate-900 uppercase text-[10px] tracking-wider">
                      INPATIENT ADMISSIONS & DISCHARGES
                    </div>
                    <div className="p-2.5 bg-white space-y-1.5">
                      {ehr.admissions.map((adm, i) => (
                        <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-1">
                          <div>
                            <strong>{adm.ipdNo}</strong> • {adm.ward} ({adm.admittedDate} to {adm.dischargeDate})
                            <div className="text-[10px] text-slate-600">{adm.summary}</div>
                          </div>
                          <span className="font-bold text-blue-900 mt-1 sm:mt-0">{adm.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SECTION: PROCEDURES / SURGERIES */}
                {selectedSections.procedures && ehr.procedures.length > 0 && (
                  <div className="border border-slate-300 rounded-md overflow-hidden text-[11px]">
                    <div className="bg-slate-200 px-3 py-1 font-bold text-slate-900 uppercase text-[10px] tracking-wider">
                      CLINICAL PROCEDURES & SURGICAL INTERVENTIONS
                    </div>
                    <table className="w-full text-left">
                      <thead className="bg-slate-100 text-[10px] font-bold text-slate-700 border-b border-slate-300">
                        <tr>
                          <th className="p-1.5 border-r border-slate-200">Procedure Name</th>
                          <th className="p-1.5 border-r border-slate-200">Date & Operating Surgeon</th>
                          <th className="p-1.5">Anesthesia & Outcome</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {ehr.procedures.map((p, i) => (
                          <tr key={i}>
                            <td className="p-1.5 border-r border-slate-200 font-bold text-slate-950">{p.procedureName}</td>
                            <td className="p-1.5 border-r border-slate-200">{p.date} • {p.surgeon}</td>
                            <td className="p-1.5">{p.anesthesia} • <strong className="text-emerald-800">{p.outcome}</strong></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* SECTION: TREATMENT & FOLLOW-UP PLAN */}
                {selectedSections.treatmentPlan && ehr.treatmentPlan && (ehr.treatmentPlan.followUpDate || ehr.treatmentPlan.dietInstructions || ehr.treatmentPlan.restrictions || ehr.treatmentPlan.warningSigns) && (
                  <div className="border border-slate-300 rounded-md overflow-hidden text-[11px]">
                    <div className="bg-slate-200 px-3 py-1 font-bold text-slate-900 uppercase text-[10px] tracking-wider">
                      DISCHARGE, TREATMENT & FOLLOW-UP PLAN
                    </div>
                    <div className="p-2.5 bg-slate-50 space-y-1">
                      {ehr.treatmentPlan.followUpDate && (
                        <div><strong>Next Review Date:</strong> <span className="font-mono font-bold text-blue-950">{ehr.treatmentPlan.followUpDate}</span> {ehr.treatmentPlan.doctor ? `with ${ehr.treatmentPlan.doctor}` : ''}</div>
                      )}
                      {ehr.treatmentPlan.dietInstructions && (
                        <div><strong>Dietary Guidelines:</strong> {ehr.treatmentPlan.dietInstructions}</div>
                      )}
                      {ehr.treatmentPlan.restrictions && (
                        <div><strong>Physical Activity & Restrictions:</strong> {ehr.treatmentPlan.restrictions}</div>
                      )}
                      {ehr.treatmentPlan.warningSigns && (
                        <div className="text-rose-900 font-semibold">⚠️ <strong>Emergency Warning Signs:</strong> {ehr.treatmentPlan.warningSigns}</div>
                      )}
                    </div>
                  </div>
                )}

                {/* SECTION: OPTIONAL BILLING SUMMARY */}
                {selectedSections.billing && (
                  <div className="border border-emerald-300 rounded-md overflow-hidden text-[11px]">
                    <div className="bg-emerald-900 text-white px-3 py-1 font-bold uppercase text-[10px] tracking-wider">
                      BILLING & FINANCIAL COLLECTIONS SUMMARY
                    </div>
                    <div className="p-2.5 bg-emerald-50/50 flex justify-between items-center text-slate-800">
                      <div>
                        <strong>Total Collections:</strong> ₹2,680.00 (OPD + Lab + Procedures)
                      </div>
                      <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                        ✓ Balance Cleared (₹0.00 Due)
                      </span>
                    </div>
                  </div>
                )}

                {/* SECTION: OPTIONAL INSURANCE INFORMATION */}
                {selectedSections.insurance && (
                  <div className="border border-purple-300 rounded-md overflow-hidden text-[11px]">
                    <div className="bg-purple-900 text-white px-3 py-1 font-bold uppercase text-[10px] tracking-wider">
                      INSURANCE & TPA COVERAGE DETAILS
                    </div>
                    <div className="p-2.5 bg-purple-50/50 grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-800">
                      <div>Payer: <strong>{selectedPatient.insuranceProvider || 'Direct Cash / Card'}</strong></div>
                      <div>Policy No: <span className="font-mono">{selectedPatient.policyNumber || 'N/A'}</span></div>
                      <div>Pre-Auth Code: <span className="font-mono text-purple-900 font-bold">AUTH-TPA-99824</span></div>
                      <div>Status: <strong className="text-emerald-700">Cashless Approved</strong></div>
                    </div>
                  </div>
                )}

                {/* SECTION: ATTACHED DOCUMENTS */}
                {selectedSections.documents && ehr.attachedDocuments.length > 0 && (
                  <div className="border border-slate-300 rounded-md overflow-hidden text-[11px]">
                    <div className="bg-slate-200 px-3 py-1 font-bold text-slate-900 uppercase text-[10px] tracking-wider">
                      ATTACHED CLINICAL DOCUMENTS & E-FILES
                    </div>
                    <div className="p-2 bg-white flex flex-wrap gap-2">
                      {ehr.attachedDocuments.map((doc, i) => (
                        <div key={i} className="px-2.5 py-1 bg-slate-100 rounded border border-slate-300 text-[10px] font-mono">
                          📄 {doc.docName} ({doc.uploadedDate})
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Security & Audit Log Record Banner */}
                <div className="p-2 bg-slate-50 border border-slate-300 rounded text-[10px] flex items-center justify-between font-mono text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Lock className="w-3 h-3 text-slate-700" />
                    <span>🔒 <strong>Audit Record:</strong> Generated by {activeAudit.userName} ({activeAudit.userRole})</span>
                  </div>
                  <div>
                    <span>{activeAudit.timestamp} • Ref: <strong>{activeAudit.id}</strong></span>
                  </div>
                </div>

                {/* Official Footer with Signatures & Seal */}
                <div className="flex items-center justify-between pt-3 border-t-2 border-slate-800 mt-2 text-[10px]">
                  <div className="w-16 h-16 rounded-full border-2 border-dashed border-blue-900 flex flex-col items-center justify-center text-center text-blue-950 rotate-[-4deg] bg-blue-50 font-black text-[8px] select-none">
                    <span>BHASKAR REDDY</span>
                    <span className="text-[10px]">★ MRD ★</span>
                    <span>SEAL</span>
                  </div>

                  <div className="text-center font-mono">
                    <div>Document: Electronic Health Record (EHR) Summary</div>
                    <div className="text-slate-500">UHID: {ehr.uhid} • Page 1 of 1</div>
                  </div>

                  <div className="text-right">
                    <div className="font-serif italic font-bold text-xs text-blue-950">{currentUser?.name || 'Dr. Medical Records Officer'}</div>
                    <div className="border-t border-slate-800 pt-0.5 font-bold">Authorized MRD Signatory</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

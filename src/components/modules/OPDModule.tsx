import React, { useState, useMemo } from 'react';
import { useHospital } from '../../context/HospitalContext';
import type { Appointment, AppointmentModel } from '../../types';
import {
  Clock,
  FileText,
  Upload,
  Trash2,
  Activity,
  Heart,
  Thermometer,
  Stethoscope,
  Building,
  Search,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  Printer,
  History,
  FlaskConical,
  Plus,
  Calendar,
  X,
  ShieldCheck,
  Zap,
  ArrowRightLeft,
  Globe,
  Building2,
} from 'lucide-react';

export const OPDModule: React.FC = () => {
  const {
    appointments,
    doctors,
    departments,
    patients,
    currentUser,
    activeBranch,
    addToast,
    updatePatientEHR,
    checkOPValidity,
    reassignAppointmentDoctor,
  } = useHospital();

  const isDoctorRole = currentUser?.role === 'doctor' || currentUser?.role === 'dmo';

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

  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('all');
  const [selectedDeptName, setSelectedDeptName] = useState<string>('all');
  const [queueStatusFilter, setQueueStatusFilter] = useState<'all' | 'waiting' | 'in_progress' | 'completed'>('all');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'website' | 'reception'>('all');
  const [queueSearchTerm, setQueueSearchTerm] = useState('');
  const [workbenchTab, setWorkbenchTab] = useState<'consultation' | 'ehr' | 'labs'>('consultation');
  const [ehrHistoryFilter, setEhrHistoryFilter] = useState<'all' | 'doctor' | 'dept'>('all');
  const [showRxModal, setShowRxModal] = useState(false);

  // Transfer Doctor Modal State
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferTargetApt, setTransferTargetApt] = useState<Appointment | null>(null);
  const [transferNewDoctorId, setTransferNewDoctorId] = useState('');
  const [transferNewModel, setTransferNewModel] = useState<AppointmentModel>('Normal Queue');
  const [transferPaymentMode, setTransferPaymentMode] = useState<'Cash' | 'Online UPI' | 'Card'>('Cash');
  const [transferUtrNumber, setTransferUtrNumber] = useState('');

  const targetTransferDoctor = useMemo(() => {
    return doctors.find((d) => d.id === transferNewDoctorId) || doctors[0];
  }, [doctors, transferNewDoctorId]);

  const transferFeeCalc = useMemo(() => {
    if (!transferTargetApt || !targetTransferDoctor) {
      return { newDocFee: 0, newTotalFee: 0, differential: 0, originalFee: 0 };
    }
    const newDocFee =
      transferNewModel === 'Premium Slot'
        ? (targetTransferDoctor.premiumFee ?? 500)
        : (targetTransferDoctor.consultationFee ?? 300);
    const regFee = transferTargetApt.hasHospitalFile ? 30 : 0;
    const newTotalFee = newDocFee + regFee;
    const originalFee = transferTargetApt.fee;
    const differential = newTotalFee - originalFee;

    return { newDocFee, newTotalFee, differential, originalFee };
  }, [transferTargetApt, targetTransferDoctor, transferNewModel]);

  const handleOpenTransferModal = (apt: Appointment) => {
    setTransferTargetApt(apt);
    setTransferNewDoctorId(apt.doctorId);
    setTransferNewModel(apt.model);
    setTransferPaymentMode('Cash');
    setTransferUtrNumber('');
    setIsTransferModalOpen(true);
  };

  const handleConfirmDoctorTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferTargetApt || !targetTransferDoctor) return;

    reassignAppointmentDoctor(
      transferTargetApt.id,
      targetTransferDoctor,
      transferNewModel,
      {
        newFee: transferFeeCalc.newTotalFee,
        differential: transferFeeCalc.differential,
        paymentMode: transferPaymentMode,
        utrNumber: transferUtrNumber,
      }
    );

    setIsTransferModalOpen(false);
  };

  // Selected Doctor Object (for Receptionist/Nurse view)
  const currentDoctorObj = doctors.find((d) => d.id === selectedDoctorId);

  // Filter queue dynamically:
  // IF DOCTOR LOGIN: Strictly locked to that doctor's own patients and department (No Dropdown).
  // IF RECEPTIONIST / NURSE / ADMIN: Full access with dropdown filtering or show all hospital-wide.
  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      // 1. Doctor & Department Filter
      let matchesDoctor = true;
      let matchesDept = true;

      if (isDoctorRole) {
        // Locked strictly to the logged-in doctor
        matchesDoctor = Boolean(
          apt.doctorId === loggedInDoctor.id ||
          apt.doctorName.toLowerCase().includes(loggedInDoctor.name.toLowerCase()) ||
          (loggedInDoctor.name && apt.doctorName.toLowerCase().includes(loggedInDoctor.name.replace('Dr. ', '').toLowerCase()))
        );
        
        matchesDept = Boolean(
          !loggedInDoctor.departmentName ||
          (apt.departmentName && apt.departmentName.toLowerCase().includes(loggedInDoctor.departmentName.toLowerCase())) ||
          (loggedInDoctor.departmentName && apt.departmentName && loggedInDoctor.departmentName.toLowerCase().includes(apt.departmentName.toLowerCase()))
        );
      } else {
        // Receptionist, Nurse, Admin: full access with optional dropdown filters
        matchesDoctor = Boolean(
          selectedDoctorId === 'all' ||
          apt.doctorId === selectedDoctorId ||
          (currentDoctorObj && apt.doctorName.toLowerCase().includes(currentDoctorObj.name.toLowerCase()))
        );

        matchesDept = Boolean(
          selectedDeptName === 'all' ||
          (apt.departmentName && apt.departmentName.toLowerCase() === selectedDeptName.toLowerCase())
        );
      }

      // 2. Status Filter
      const matchesStatus =
        queueStatusFilter === 'all'
          ? true
          : queueStatusFilter === 'waiting'
          ? apt.status === 'Scheduled' || apt.status === 'Checked-In'
          : queueStatusFilter === 'in_progress'
          ? apt.status === 'In Consultation'
          : apt.status === 'Completed';

      // 3. Source Filter
      const isWeb =
        apt.createdByName?.toLowerCase().includes('website') ||
        apt.createdByRole?.toLowerCase().includes('portal') ||
        apt.createdByRole?.toLowerCase().includes('web');
      const matchesSource =
        sourceFilter === 'all'
          ? true
          : sourceFilter === 'website'
          ? isWeb
          : !isWeb;

      // 4. Search Query Filter
      const q = queueSearchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        apt.patientName.toLowerCase().includes(q) ||
        (apt.patientUhid && apt.patientUhid.toLowerCase().includes(q)) ||
        (apt.tokenNumber && apt.tokenNumber.toLowerCase().includes(q)) ||
        (apt.doctorName && apt.doctorName.toLowerCase().includes(q));

      return matchesDoctor && matchesDept && matchesStatus && matchesSource && matchesSearch;
    });
  }, [
    appointments,
    isDoctorRole,
    loggedInDoctor,
    selectedDoctorId,
    currentDoctorObj,
    selectedDeptName,
    queueStatusFilter,
    sourceFilter,
    queueSearchTerm,
  ]);

  // Selected Active Appointment for Consultation
  const [selectedAptId, setSelectedAptId] = useState<string>('');

  // Automatically select the first matching appointment in the filtered queue if none selected or not in current list
  const activeApt = useMemo(() => {
    if (selectedAptId) {
      const match = filteredAppointments.find((a) => a.id === selectedAptId);
      if (match) return match;
    }
    return filteredAppointments[0] || null;
  }, [filteredAppointments, selectedAptId]);

  const activePatient = patients.find((p) => p.id === activeApt?.patientId || p.uhid === activeApt?.patientUhid);

  // Doctor-Specific 15-day OP Return Validity
  const validity = activePatient && activeApt
    ? checkOPValidity(activePatient.id, activeApt.doctorId || activeApt.doctorName)
    : null;

  // OPD Editing Permission: ONLY Doctors can edit and ONLY while consultation is active (not Completed)
  const canEditOPD = Boolean(isDoctorRole && activeApt?.status !== 'Completed');

  // Consultation Lifecycle State
  const [consultationStatus, setConsultationStatus] = useState<'Waiting' | 'In Consultation' | 'Hold / Lab Order' | 'Completed'>('In Consultation');

  // Prescription & Examination Form State
  const [diagnosis, setDiagnosis] = useState('Essential Hypertension & Hyperlipidemia');
  const [chiefComplaints, setChiefComplaints] = useState('Mild occipital headache, exertion fatigue, irregular sleep patterns.');
  const [clinicalNotes, setClinicalNotes] = useState(
    'Patient presents with grade-1 elevated blood pressure. Normal heart sounds S1 S2 heard. No pedal edema. Regular BP monitoring & dietary salt restriction advised.'
  );
  const [vitals, setVitals] = useState({
    bp: '130/85',
    pulse: '74',
    temp: '98.4 °F',
    spO2: '99%',
    respRate: '18 /min',
    bloodGlucose: '110 mg/dL',
    weight: '68 kg',
  });

  const [medicines, setMedicines] = useState([
    { medicineName: 'Tab. Telmisartan 40mg', dosage: '1-0-0', timing: 'Before Food', durationDays: 30, instructions: 'Take once daily morning' },
    { medicineName: 'Tab. Atorvastatin 10mg', dosage: '0-0-1', timing: 'After Food', durationDays: 30, instructions: 'Take once daily at bedtime' },
  ]);

  const [newMed, setNewMed] = useState({
    medicineName: '',
    dosage: '1-0-1',
    timing: 'After Food' as 'Before Food' | 'After Food',
    durationDays: 15,
    instructions: 'Take with warm water',
  });

  // Lab Diagnostics State
  const [labOrders, setLabOrders] = useState<string[]>([
    'Complete Blood Count (CBC)',
    'Lipid Profile (Fasting)',
    'Serum Creatinine & Electrolytes',
  ]);
  const [newLabTest, setNewLabTest] = useState('');

  const [followUpDays, setFollowUpDays] = useState('15');

  // Handlers for Medicine Builder
  const handleAddMedicine = () => {
    if (!newMed.medicineName.trim()) return;
    setMedicines([...medicines, newMed]);
    setNewMed({ medicineName: '', dosage: '1-0-1', timing: 'After Food', durationDays: 15, instructions: 'Take with warm water' });
  };

  const handleRemoveMedicine = (idx: number) => {
    setMedicines(medicines.filter((_, i) => i !== idx));
  };

  // Handlers for Lab Orders
  const handleAddLabOrder = () => {
    if (!newLabTest.trim()) return;
    setLabOrders([...labOrders, newLabTest.trim()]);
    setNewLabTest('');
  };

  const handleRemoveLabOrder = (idx: number) => {
    setLabOrders(labOrders.filter((_, i) => i !== idx));
  };

  const handleSaveConsultation = () => {
    setConsultationStatus('Completed');
    
    if (activePatient) {
      updatePatientEHR(activePatient.id, {
        lastVisitDate: '2026-07-24',
        currentSummary: {
          diagnosis: diagnosis || activePatient.currentSummary?.diagnosis || 'Essential Hypertension',
          doctor: activeApt?.doctorName || 'Attending Physician',
          condition: 'Active Clinical Care',
          treatment: chiefComplaints || 'Routine Medical Management',
        },
        vitals: {
          bp: vitals.bp,
          pulse: vitals.pulse,
          spo2: vitals.spO2,
          temp: vitals.temp,
          respRate: vitals.respRate,
          weight: vitals.weight,
          height: activePatient.vitals?.height || '172 cm',
          bmi: activePatient.vitals?.bmi || '22.9',
        },
        medications: medicines.map((m) => ({
          drugName: m.medicineName,
          dosage: m.dosage,
          frequency: m.timing,
          duration: `${m.durationDays} Days`,
          route: 'Oral / Topical',
          doctor: activeApt?.doctorName || 'Attending Doctor',
        })),
        treatmentPlan: {
          followUpDate: `After ${followUpDays} Days`,
          doctor: activeApt?.doctorName || 'Attending Doctor',
          dietInstructions: 'Normal / Diabetic Low Salt diet as advised',
          restrictions: 'Adequate hydration and rest',
          warningSigns: 'Immediate ER review if chest pain, high fever, or breathlessness occurs',
        },
      });
    }

    addToast(
      'OP Consultation & EHR Saved',
      `Digital prescription and vitals updated in Patient Directory & EHR for ${activeApt?.patientName}`,
      'success'
    );
  };

  // Counts for Queue Status Badges
  const queueStats = useMemo(() => {
    const docApts = appointments.filter((apt) => {
      const matchDoc =
        selectedDoctorId === 'all' ||
        apt.doctorId === selectedDoctorId ||
        (currentDoctorObj && apt.doctorName.toLowerCase().includes(currentDoctorObj.name.toLowerCase()));
      const matchDept =
        selectedDeptName === 'all' ||
        (apt.departmentName && apt.departmentName.toLowerCase() === selectedDeptName.toLowerCase());
      return matchDoc && matchDept;
    });

    const waiting = docApts.filter((a) => a.status === 'Scheduled' || a.status === 'Checked-In').length;
    const inProgress = docApts.filter((a) => a.status === 'In Consultation').length;
    const completed = docApts.filter((a) => a.status === 'Completed').length;

    return { total: docApts.length, waiting, inProgress, completed };
  }, [appointments, selectedDoctorId, currentDoctorObj, selectedDeptName]);

  // Simulated Longitudinal Medical History of Active Patient
  const patientPastRecords = useMemo(() => {
    if (!activePatient) return [];
    return [
      {
        id: 'rec-01',
        date: '2026-07-10',
        doctorName: 'Dr. Vikram Reddy',
        departmentName: 'Cardiology',
        diagnosis: 'Mild Sinus Bradycardia & Stage-1 HTN',
        vitals: 'BP: 135/88, Pulse: 68, SpO2: 98%',
        prescriptions: 'Tab. Telmisartan 40mg (1-0-0), Tab. Ecosprin 75mg (0-1-0)',
        notes: 'Routine cardiac review. Advised reduction in dietary sodium and 30 mins brisk walking.',
      },
      {
        id: 'rec-02',
        date: '2026-06-18',
        doctorName: 'Dr. Rajeshwar Rao',
        departmentName: 'General Medicine',
        diagnosis: 'Acute Viral Upper Respiratory Tract Infection',
        vitals: 'BP: 120/80, Pulse: 82, Temp: 100.2 °F',
        prescriptions: 'Tab. Paracetamol 650mg TDS, Cap. Amoxicillin 500mg TDS, Syp. Grilinctus 10ml',
        notes: 'Symptoms resolved in 5 days. Blood count was within normal limits.',
      },
      {
        id: 'rec-03',
        date: '2026-05-02',
        doctorName: 'Dr. Ananya Swaminathan',
        departmentName: 'Gynaecology & Obstetrics',
        diagnosis: 'Annual Well-Woman Wellness & Pelvic Sonography',
        vitals: 'BP: 118/76, Pulse: 72, SpO2: 99%',
        prescriptions: 'Tab. Calcium D3 once daily, Tab. Folvite 5mg',
        notes: 'Pelvic ultrasound normal. Recommended continuation of multivitamin therapy.',
      },
    ];
  }, [activePatient]);

  const filteredEhrRecords = useMemo(() => {
    if (ehrHistoryFilter === 'doctor' && currentDoctorObj) {
      return patientPastRecords.filter((r) => r.doctorName.toLowerCase().includes(currentDoctorObj.name.toLowerCase()));
    }
    if (ehrHistoryFilter === 'dept' && selectedDeptName !== 'all') {
      return patientPastRecords.filter((r) => r.departmentName.toLowerCase() === selectedDeptName.toLowerCase());
    }
    return patientPastRecords;
  }, [patientPastRecords, ehrHistoryFilter, currentDoctorObj, selectedDeptName]);

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* 1. Header & Doctor/Department Queue Filtering Command Center */}
      <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800/80 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5" /> Doctor OPD Console & EHR Workbench
              </span>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                Branch: {activeBranch.name}
              </span>
            </div>
            <h2 className="text-2xl font-black text-white mt-1">
              Patient Queue & Outpatient Consultation
            </h2>
            <p className="text-xs text-slate-400">
              Filtered patient queues, digital prescription builder, longitudinal medical records, and live telemetry.
            </p>
          </div>

          {/* Workflow Pipeline */}
          <div className="hidden xl:flex items-center gap-2 text-[10px] font-bold text-slate-400 bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800">
            <span className="text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> 1. Reception Token
            </span>
            <span>→</span>
            <span className="text-cyan-400 font-extrabold flex items-center gap-1 underline">
              <Clock className="w-3 h-3" /> 2. Doctor Queue
            </span>
            <span>→</span>
            <span className="text-slate-300">3. Vitals & EHR</span>
            <span>→</span>
            <span className="text-slate-300">4. Digital Rx</span>
            <span>→</span>
            <span className="text-slate-300">5. Billing / Pharmacy</span>
          </div>
        </div>

        {/* Doctor & Department Filter Bar */}
        {isDoctorRole ? (
          /* DOCTOR LOGGED IN: Locked Personalized Doctor Console (No Dropdown) */
          <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/80 via-slate-900 to-indigo-950/80 border border-cyan-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 font-black shrink-0">
                <Stethoscope className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-black text-white">{loggedInDoctor.name}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                    👨‍⚕️ Attending Consultant OPD Queue
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                    {loggedInDoctor.qualification || 'MBBS, MD'}
                  </span>
                </div>
                <div className="text-xs text-slate-300 mt-1 flex items-center gap-2 flex-wrap">
                  <span>Specialty: <strong className="text-cyan-300">{loggedInDoctor.specialization}</strong></span>
                  <span className="text-slate-600">•</span>
                  <span>Department: <strong className="text-indigo-300">{loggedInDoctor.departmentName}</strong></span>
                  <span className="text-slate-600">•</span>
                  <span className="text-emerald-400 font-semibold">Consultation Fee: ₹{loggedInDoctor.consultationFee}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-slate-950/80 px-4 py-2 rounded-xl border border-slate-800 shrink-0">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Your Queue Today</span>
                <span className="text-lg font-mono font-black text-cyan-300">{queueStats.total} Patients</span>
              </div>
              <div className="h-8 w-px bg-slate-800" />
              <div className="text-right">
                <span className="text-[10px] text-amber-400 block font-bold uppercase tracking-wider">Waiting</span>
                <span className="text-lg font-mono font-black text-amber-300">{queueStats.waiting}</span>
              </div>
            </div>
          </div>
        ) : (
          /* RECEPTIONIST / NURSE / ADMIN: Full Access with Doctor & Department Dropdowns */
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="px-2.5 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" /> Full Access Console (Reception Desk & Nursing Station Active)
              </span>
              <span className="text-[11px] text-slate-400">
                You have full access to view, filter, and manage all doctors' OPD patient queues.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
              {/* Doctor Selector */}
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-cyan-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Select Attending Doctor
                  </label>
                  <select
                    value={selectedDoctorId}
                    onChange={(e) => {
                      setSelectedDoctorId(e.target.value);
                      setSelectedAptId('');
                    }}
                    className="w-full bg-transparent text-xs font-bold text-slate-100 focus:outline-none cursor-pointer truncate"
                  >
                    <option value="all" className="bg-slate-900">🌐 All Doctors (Hospital-Wide Queue)</option>
                    {doctors.map((doc) => (
                      <option key={doc.id} value={doc.id} className="bg-slate-900">
                        {doc.name} — {doc.specialization} ({doc.departmentName})
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
                    Select Department / Specialty
                  </label>
                  <select
                    value={selectedDeptName}
                    onChange={(e) => {
                      setSelectedDeptName(e.target.value);
                      setSelectedAptId('');
                    }}
                    className="w-full bg-transparent text-xs font-bold text-slate-100 focus:outline-none cursor-pointer truncate"
                  >
                    <option value="all" className="bg-slate-900">🌐 All Departments</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.name} className="bg-slate-900">
                        {dept.name} ({dept.headDoctor})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Quick Doctor Info Badge */}
              <div className="p-2.5 rounded-xl bg-cyan-500/5 border border-cyan-500/20 flex items-center justify-between col-span-1 sm:col-span-2 lg:col-span-2">
                <div>
                  <div className="text-[10px] font-bold text-cyan-400 uppercase">
                    {currentDoctorObj ? `Active Filter: ${currentDoctorObj.name}` : 'Showing All Hospital OPD Consultations'}
                  </div>
                  <div className="text-xs font-extrabold text-slate-200 mt-0.5 flex items-center gap-2">
                    <span>{currentDoctorObj ? `${currentDoctorObj.qualification} • ${currentDoctorObj.departmentName}` : 'All Clinical Specialties'}</span>
                    <span className="text-slate-600">|</span>
                    <span className="text-emerald-400">Consultation Fee: ₹{currentDoctorObj ? currentDoctorObj.consultationFee : 300}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-semibold">Total Filtered</span>
                  <span className="text-base font-mono font-black text-cyan-300">{queueStats.total} Patients</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Main Layout: Left Queue Column & Right Workbench Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Filtered Doctor Patient Queue */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Doctor Patient Queue</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono font-extrabold bg-cyan-500/20 text-cyan-300">
                {filteredAppointments.length}
              </span>
            </h3>
          </div>

          {/* Queue Status Tabs */}
          <div className="grid grid-cols-4 gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-bold">
            <button
              onClick={() => setQueueStatusFilter('all')}
              className={`py-1.5 rounded-lg transition text-center ${
                queueStatusFilter === 'all' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({queueStats.total})
            </button>
            <button
              onClick={() => setQueueStatusFilter('waiting')}
              className={`py-1.5 rounded-lg transition text-center ${
                queueStatusFilter === 'waiting' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Wait ({queueStats.waiting})
            </button>
            <button
              onClick={() => setQueueStatusFilter('in_progress')}
              className={`py-1.5 rounded-lg transition text-center ${
                queueStatusFilter === 'in_progress' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Active ({queueStats.inProgress})
            </button>
            <button
              onClick={() => setQueueStatusFilter('completed')}
              className={`py-1.5 rounded-lg transition text-center ${
                queueStatusFilter === 'completed' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Done ({queueStats.completed})
            </button>
          </div>

          {/* Source Filter Pills */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 text-[10px] font-bold">
            <button
              onClick={() => setSourceFilter('all')}
              className={`flex-1 py-1 rounded-lg transition text-center ${
                sourceFilter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Sources
            </button>
            <button
              onClick={() => setSourceFilter('website')}
              className={`flex-1 py-1 rounded-lg transition text-center flex items-center justify-center gap-1 ${
                sourceFilter === 'website' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Globe className="w-3 h-3" />
              <span>Website</span>
            </button>
            <button
              onClick={() => setSourceFilter('reception')}
              className={`flex-1 py-1 rounded-lg transition text-center flex items-center justify-center gap-1 ${
                sourceFilter === 'reception' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Building2 className="w-3 h-3" />
              <span>Desk</span>
            </button>
          </div>

          {/* Search Queue */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search token, patient, UHID..."
              value={queueSearchTerm}
              onChange={(e) => setQueueSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Queue List Cards */}
          <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
            {filteredAppointments.length === 0 ? (
              <div className="text-center py-12 px-4 rounded-xl bg-slate-950/40 border border-slate-800/80 text-slate-500 text-xs">
                No patients in queue for the selected doctor/department filter.
              </div>
            ) : (
              filteredAppointments.map((apt) => {
                const isSelected = activeApt?.id === apt.id;
                const isCompleted = apt.status === 'Completed';
                const isInConsult = apt.status === 'In Consultation';
                const isWeb =
                  apt.createdByName?.toLowerCase().includes('website') ||
                  apt.createdByRole?.toLowerCase().includes('portal') ||
                  apt.createdByRole?.toLowerCase().includes('web');

                return (
                  <div
                    key={apt.id}
                    onClick={() => setSelectedAptId(apt.id)}
                    className={`p-3.5 rounded-xl border transition cursor-pointer relative overflow-hidden ${
                      isSelected
                        ? 'bg-slate-800/95 border-cyan-500 shadow-md shadow-cyan-950/50'
                        : 'bg-slate-950/50 border-slate-800/80 hover:bg-slate-800/40'
                    }`}
                  >
                    {/* Left Accent Bar for selected */}
                    {isSelected && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-400" />
                    )}

                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono text-xs font-black text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
                          #{apt.tokenNumber}
                        </span>
                        {apt.model === 'Premium Slot' && (
                          <span className="text-[10px] font-extrabold text-purple-300 bg-purple-500/10 border border-purple-500/30 px-1.5 py-0.2 rounded flex items-center gap-0.5">
                            <Zap className="w-2.5 h-2.5" /> VIP
                          </span>
                        )}
                        {isWeb && (
                          <span className="text-[9px] font-bold text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 px-1 py-0.2 rounded flex items-center gap-0.5">
                            <Globe className="w-2.5 h-2.5" /> Web
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" /> {apt.appointmentTime}
                        </span>
                        {isCompleted ? (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            Completed
                          </span>
                        ) : isInConsult ? (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30 animate-pulse">
                            Inside
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                            Waiting
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-2.5">
                      <div className="text-xs font-extrabold text-slate-100 flex items-center justify-between">
                        <span>{apt.patientName}</span>
                        <span className="font-mono text-[10px] font-semibold text-cyan-400/80">{apt.patientUhid || 'BRH14561'}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 flex items-center justify-between">
                        <span>Dr. {apt.doctorName.replace('Dr. ', '')}</span>
                        <span className="text-[10px] text-slate-500">{apt.departmentName}</span>
                      </div>
                      {apt.reassignedFromDoctor && (
                        <div className="mt-1">
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.2 rounded">
                            <ArrowRightLeft className="w-2.5 h-2.5" />
                            <span>Reassigned from {apt.reassignedFromDoctor}</span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Doctor Consultation Workbench & Patient EHR Records */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-6">
          {activeApt ? (
            <>
              {/* Patient Profile Header */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-extrabold text-lg shrink-0">
                      {activeApt.patientName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-black text-white">{activeApt.patientName}</h3>
                        <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
                          {activePatient?.uhid || activeApt.patientUhid || 'BRH14561'}
                        </span>
                        {activePatient?.opNumber && (
                          <span className="font-mono text-[11px] font-bold text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                            OP: {activePatient.opNumber}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 mt-1 flex items-center gap-2 flex-wrap font-medium">
                        <span>{activePatient?.age || 38} Yrs • {activePatient?.gender || 'Female'}</span>
                        <span className="text-slate-600">•</span>
                        <span>Blood Group: <strong className="text-slate-200">{activePatient?.bloodGroup || 'B+'}</strong></span>
                        <span className="text-slate-600">•</span>
                        <span>Phone: <strong className="text-slate-200">{activePatient?.phone || '9876543210'}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Consultation Status Tag & Transfer Action */}
                  <div className="flex flex-col sm:items-end gap-1.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold text-slate-400">Queue Stage:</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-500/15 text-blue-300 border border-blue-500/30">
                        Token #{activeApt.tokenNumber} ({consultationStatus})
                      </span>
                      <button
                        onClick={() => handleOpenTransferModal(activeApt)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold transition"
                        title="Reassign or Refer Patient to Another Doctor/Specialist"
                      >
                        <ArrowRightLeft className="w-3 h-3" />
                        <span>Transfer Doctor</span>
                      </button>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Consulting: <strong className="text-slate-200">{activeApt.doctorName}</strong> ({activeApt.departmentName})
                    </div>
                  </div>
                </div>

                {/* 15-Day Free Follow-up & Medical Alerts Banner */}
                <div className="flex items-center justify-between gap-3 pt-2.5 border-t border-slate-800/80 flex-wrap">
                  {validity && (
                    <div
                      className={`px-3 py-1 rounded-lg border text-xs font-bold flex items-center gap-1.5 ${
                        validity.isValid
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>
                        {validity.isValid
                          ? `Eligible 15-Day Free Follow-up with ${activeApt.doctorName} (${validity.daysRemaining} days remaining)`
                          : `Standard OPD Consultation for ${activeApt.doctorName}`}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-rose-400 font-bold flex items-center gap-1 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                      <AlertTriangle className="w-3 h-3" /> Allergy: Penicillin / Sulfa
                    </span>
                  </div>
                </div>
              </div>

              {/* Workbench Navigation Tabs */}
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                <button
                  onClick={() => setWorkbenchTab('consultation')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    workbenchTab === 'consultation'
                      ? 'bg-cyan-600 text-white shadow-md shadow-cyan-950/40'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Active Consultation & Digital Rx</span>
                </button>

                <button
                  onClick={() => setWorkbenchTab('ehr')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    workbenchTab === 'ehr'
                      ? 'bg-cyan-600 text-white shadow-md shadow-cyan-950/40'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <History className="w-3.5 h-3.5" />
                  <span>Patient Medical Records & Past History</span>
                </button>

                <button
                  onClick={() => setWorkbenchTab('labs')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    workbenchTab === 'labs'
                      ? 'bg-cyan-600 text-white shadow-md shadow-cyan-950/40'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <FlaskConical className="w-3.5 h-3.5" />
                  <span>Lab & Diagnostic Orders ({labOrders.length})</span>
                </button>
              </div>

              {/* TAB 1: Active Consultation Workbench */}
              {workbenchTab === 'consultation' && (
                <div className="space-y-6">
                  {/* Status Action Buttons */}
                  <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400">Encounter Status:</span>
                      <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold ${
                        consultationStatus === 'In Consultation'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : consultationStatus === 'Completed'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {consultationStatus}
                      </span>
                    </div>

                    {canEditOPD ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setConsultationStatus('In Consultation')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                            consultationStatus === 'In Consultation'
                              ? 'bg-blue-600 text-white shadow'
                              : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <Play className="w-3 h-3" />
                          <span>In Consultation</span>
                        </button>
                        <button
                          onClick={() => setConsultationStatus('Hold / Lab Order')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                            consultationStatus === 'Hold / Lab Order'
                              ? 'bg-amber-600 text-white shadow'
                              : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <Pause className="w-3 h-3" />
                          <span>Hold / Sent to Lab</span>
                        </button>
                        <button
                          onClick={() => setConsultationStatus('Completed')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                            consultationStatus === 'Completed'
                              ? 'bg-emerald-600 text-white shadow'
                              : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Mark Completed</span>
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-500 italic">
                        {activeApt.status === 'Completed' ? 'Encounters signed & finalized.' : 'Status changes restricted to Doctor'}
                      </span>
                    )}
                  </div>

                  {/* Vitals Telemetry Entry */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-cyan-400" /> Patient Vitals Telemetry
                      {!canEditOPD && <span className="text-[10px] text-slate-500 font-normal lowercase">(read-only)</span>}
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Heart className="w-3 h-3 text-rose-400" /> Blood Pressure
                        </div>
                        <input
                          type="text"
                          readOnly={!canEditOPD}
                          value={vitals.bp}
                          onChange={(e) => setVitals({ ...vitals, bp: e.target.value })}
                          className={`w-full bg-transparent text-sm font-bold text-slate-100 focus:outline-none mt-1 ${!canEditOPD ? 'cursor-default' : ''}`}
                        />
                      </div>

                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Activity className="w-3 h-3 text-cyan-400" /> Pulse Rate
                        </div>
                        <input
                          type="text"
                          readOnly={!canEditOPD}
                          value={vitals.pulse}
                          onChange={(e) => setVitals({ ...vitals, pulse: e.target.value })}
                          className={`w-full bg-transparent text-sm font-bold text-slate-100 focus:outline-none mt-1 ${!canEditOPD ? 'cursor-default' : ''}`}
                        />
                      </div>

                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Thermometer className="w-3 h-3 text-amber-400" /> Temperature
                        </div>
                        <input
                          type="text"
                          readOnly={!canEditOPD}
                          value={vitals.temp}
                          onChange={(e) => setVitals({ ...vitals, temp: e.target.value })}
                          className={`w-full bg-transparent text-sm font-bold text-slate-100 focus:outline-none mt-1 ${!canEditOPD ? 'cursor-default' : ''}`}
                        />
                      </div>

                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                        <div className="text-[10px] text-slate-400">SpO2 Oxygen</div>
                        <input
                          type="text"
                          readOnly={!canEditOPD}
                          value={vitals.spO2}
                          onChange={(e) => setVitals({ ...vitals, spO2: e.target.value })}
                          className={`w-full bg-transparent text-sm font-bold text-slate-100 focus:outline-none mt-1 ${!canEditOPD ? 'cursor-default' : ''}`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Chief Complaints & Clinical Findings */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                        Chief Complaints & Patient Symptoms {!canEditOPD && <span className="text-slate-500 lowercase">(read-only)</span>}
                      </label>
                      <input
                        type="text"
                        readOnly={!canEditOPD}
                        value={chiefComplaints}
                        onChange={(e) => setChiefComplaints(e.target.value)}
                        className={`w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-semibold ${!canEditOPD ? 'cursor-default opacity-85' : ''}`}
                        placeholder="e.g. Occipital headache for 3 days, dizziness"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                        Primary Clinical Diagnosis (ICD-10) {!canEditOPD && <span className="text-slate-500 lowercase">(read-only)</span>}
                      </label>
                      <input
                        type="text"
                        readOnly={!canEditOPD}
                        value={diagnosis}
                        onChange={(e) => setDiagnosis(e.target.value)}
                        className={`w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-semibold ${!canEditOPD ? 'cursor-default opacity-85' : ''}`}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                        Physician Clinical Notes & Examination Findings {!canEditOPD && <span className="text-slate-500 lowercase">(read-only)</span>}
                      </label>
                      <textarea
                        rows={3}
                        readOnly={!canEditOPD}
                        value={clinicalNotes}
                        onChange={(e) => setClinicalNotes(e.target.value)}
                        className={`w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 ${!canEditOPD ? 'cursor-default opacity-85' : ''}`}
                      />
                    </div>
                  </div>

                  {/* Digital Prescription Builder */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-cyan-400" /> Digital Prescription Medicines (Rx)
                        {!canEditOPD && <span className="text-[10px] text-slate-500 font-normal lowercase">(locked)</span>}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-medium">
                        Doctor: {activeApt?.doctorName || 'Doctor'}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {medicines.map((med, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs gap-3"
                        >
                          <div>
                            <div className="font-extrabold text-slate-100 flex items-center gap-2">
                              <span>{med.medicineName}</span>
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                                {med.dosage}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              {med.timing} • Duration: {med.durationDays} Days • {med.instructions}
                            </div>
                          </div>
                          {canEditOPD && (
                            <button
                              onClick={() => handleRemoveMedicine(idx)}
                              className="text-slate-500 hover:text-rose-400 transition p-1.5 rounded-lg hover:bg-slate-900"
                              title="Remove Medicine"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Add Medicine Inputs - ONLY visible when canEditOPD is TRUE */}
                    {canEditOPD && (
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                        <input
                          type="text"
                          placeholder="Medicine Name (e.g. Tab. Telmisartan 40mg)"
                          value={newMed.medicineName}
                          onChange={(e) => setNewMed({ ...newMed, medicineName: e.target.value })}
                          className="sm:col-span-5 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                        />
                        <input
                          type="text"
                          placeholder="Dosage (1-0-1)"
                          value={newMed.dosage}
                          onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })}
                          className="sm:col-span-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                        />
                        <select
                          value={newMed.timing}
                          onChange={(e) => setNewMed({ ...newMed, timing: e.target.value as any })}
                          className="sm:col-span-3 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                        >
                          <option value="Before Food">Before Food</option>
                          <option value="After Food">After Food</option>
                        </select>
                        <button
                          type="button"
                          onClick={handleAddMedicine}
                          className="sm:col-span-2 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow transition flex items-center justify-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Rx</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Follow-up Days Setting */}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                    <Calendar className="w-4 h-4 text-cyan-400" />
                    <span className="font-semibold text-slate-300">Recommended Follow-up Visit:</span>
                    <select
                      disabled={!canEditOPD}
                      value={followUpDays}
                      onChange={(e) => setFollowUpDays(e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-100 font-bold focus:outline-none disabled:opacity-75 disabled:cursor-not-allowed"
                    >
                      <option value="7">After 7 Days</option>
                      <option value="15">After 15 Days (Free Follow-up)</option>
                      <option value="30">After 1 Month</option>
                      <option value="SOS">SOS / As Needed</option>
                    </select>
                  </div>

                  {/* Action Bar */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
                    <div className="flex items-center gap-2">
                      {canEditOPD && (
                        <button
                          type="button"
                          onClick={() => addToast('OCR Paper Scanned', 'Handwritten OPD slip digitized and attached to EHR.', 'info')}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
                        >
                          <Upload className="w-4 h-4 text-cyan-400" />
                          <span>Upload Handwritten Rx</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setShowRxModal(true)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
                      >
                        <Printer className="w-4 h-4 text-cyan-400" />
                        <span>Print Prescription Slip</span>
                      </button>
                    </div>

                    {canEditOPD ? (
                      <button
                        type="button"
                        onClick={handleSaveConsultation}
                        className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-extrabold shadow-lg shadow-cyan-600/30 transition active:scale-95 flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Complete Consultation & Issue Digital Rx</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-400 bg-amber-500/10 px-4 py-2.5 rounded-xl border border-amber-500/30">
                        <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>
                          {activeApt?.status === 'Completed'
                            ? 'Encounter Completed & Signed (EHR Permanently Locked)'
                            : '🔒 View-Only Mode: Clinical Prescriptions & Diagnoses editing is restricted to Doctors.'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: Patient Medical Records & Past EHR History */}
              {workbenchTab === 'ehr' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                    <div>
                      <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                        <History className="w-4 h-4 text-cyan-400" />
                        <span>Longitudinal Medical Record History</span>
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Historical diagnoses, prescriptions, and vital telemetry across hospital visits.
                      </p>
                    </div>

                    {/* Filter History Scope */}
                    <div className="flex items-center p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-bold">
                      <button
                        onClick={() => setEhrHistoryFilter('all')}
                        className={`px-3 py-1 rounded-lg transition ${
                          ehrHistoryFilter === 'all' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        All Encounters
                      </button>
                      <button
                        onClick={() => setEhrHistoryFilter('doctor')}
                        className={`px-3 py-1 rounded-lg transition ${
                          ehrHistoryFilter === 'doctor' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        With {currentDoctorObj ? currentDoctorObj.name : 'Selected Doctor'}
                      </button>
                    </div>
                  </div>

                  {/* Medical Records Timeline */}
                  <div className="space-y-3">
                    {filteredEhrRecords.length === 0 ? (
                      <div className="text-center py-8 text-slate-500 text-xs">
                        No previous historical records found for this filter scope.
                      </div>
                    ) : (
                      filteredEhrRecords.map((rec) => (
                        <div key={rec.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                          <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-800/80">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                                {rec.date}
                              </span>
                              <span className="text-xs font-extrabold text-slate-200">{rec.diagnosis}</span>
                            </div>
                            <div className="text-[11px] text-slate-400">
                              Attending: <strong className="text-slate-200">{rec.doctorName}</strong> ({rec.departmentName})
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-slate-400 text-[10px] uppercase font-bold block">Vitals Recorded:</span>
                              <span className="font-mono text-slate-200">{rec.vitals}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 text-[10px] uppercase font-bold block">Prescriptions Issued:</span>
                              <span className="text-slate-200 font-medium">{rec.prescriptions}</span>
                            </div>
                          </div>

                          <div className="pt-1 text-xs text-slate-400 italic">
                            Doctor Advice: "{rec.notes}"
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: Diagnostic Lab & Radiology Orders */}
              {workbenchTab === 'labs' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-800">
                    <div>
                      <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                        <FlaskConical className="w-4 h-4 text-cyan-400" />
                        <span>Laboratory & Diagnostic Test Requisitions</span>
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Order pathological investigations, ECG, Radiology and receive real-time updates.
                      </p>
                    </div>
                  </div>

                  {/* Add New Lab Order - ONLY when canEditOPD */}
                  {canEditOPD ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter investigation name (e.g. 2D Echocardiogram, HbA1c, Thyroid Profile)..."
                        value={newLabTest}
                        onChange={(e) => setNewLabTest(e.target.value)}
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                      />
                      <button
                        onClick={handleAddLabOrder}
                        className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow transition flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Order Test</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800">
                      <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>Lab and Radiology requisitions are locked in read-only mode for non-attending staff.</span>
                    </div>
                  )}

                  {/* Active Requisition List */}
                  <div className="space-y-2">
                    {labOrders.map((test, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <FlaskConical className="w-4 h-4 text-cyan-400" />
                          <div>
                            <span className="font-extrabold text-slate-100">{test}</span>
                            <div className="text-[10px] text-slate-400">
                              Ordered by: {activeApt?.doctorName || 'Doctor'} • Priority: Routine OP
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                            Specimen Pending
                          </span>
                          {canEditOPD && (
                            <button
                              onClick={() => handleRemoveLabOrder(idx)}
                              className="p-1 rounded text-slate-500 hover:text-rose-400 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20 text-slate-500 text-xs space-y-2">
              <Clock className="w-8 h-8 text-slate-600 mx-auto" />
              <div className="font-bold text-slate-400">No Patient Selected from Queue</div>
              <p>Please select a patient token from the left queue to commence OPD consultation.</p>
            </div>
          )}
        </div>
      </div>

      {/* 3. Official Printable Digital Prescription Slip Modal */}
      {showRxModal && activeApt && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden my-8 border border-slate-200">
            {/* Modal Header */}
            <div className="p-4 bg-slate-100 border-b border-slate-200 flex items-center justify-between print:hidden">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-cyan-700" />
                <span className="text-xs font-bold text-slate-800">Print Official OPD Prescription Slip</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-1.5 rounded-lg bg-cyan-700 hover:bg-cyan-800 text-white text-xs font-bold transition shadow"
                >
                  Print Prescription
                </button>
                <button
                  onClick={() => setShowRxModal(false)}
                  className="p-1 rounded-lg text-slate-500 hover:text-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Slip Content */}
            <div className="p-8 space-y-6">
              {/* Hospital Letterhead */}
              <div className="flex items-start justify-between border-b-2 border-cyan-800 pb-4">
                <div>
                  <h1 className="text-xl font-black text-cyan-900 tracking-tight">BHASKAR REDDY HOSPITAL</h1>
                  <div className="text-[11px] font-bold text-slate-700">SUPER SPECIALITY & TERTIARY HEALTHCARE CENTER</div>
                  <div className="text-[10px] text-slate-500">
                    Main Branch: Nellore • NABH Accredited • Reg No: AP-HOSP-2024-8891
                  </div>
                </div>
                <div className="text-right text-[10px] text-slate-600">
                  <div className="font-mono font-bold text-cyan-950 text-xs">TOKEN #{activeApt.tokenNumber}</div>
                  <div>Date: 2026-07-24 • Time: {activeApt.appointmentTime}</div>
                  <div>Consultation ID: OPD-{activeApt.id.slice(-6).toUpperCase()}</div>
                </div>
              </div>

              {/* Patient & Doctor Info Grid */}
              <div className="grid grid-cols-2 gap-4 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                <div className="space-y-1">
                  <div>Patient Name: <strong className="text-slate-900">{activeApt.patientName}</strong></div>
                  <div>UHID: <strong className="font-mono text-cyan-900">{activePatient?.uhid || activeApt.patientUhid || 'BRH14561'}</strong></div>
                  <div>Age / Gender: {activePatient?.age || 38} Yrs / {activePatient?.gender || 'Female'} • Blood: {activePatient?.bloodGroup || 'B+'}</div>
                </div>
                <div className="space-y-1 text-right">
                  <div>Attending Doctor: <strong className="text-cyan-950">{activeApt.doctorName}</strong></div>
                  <div>Department: <strong>{activeApt.departmentName}</strong></div>
                  <div>Reg No: <strong>APMC/2014/99120</strong></div>
                </div>
              </div>

              {/* Vitals & Diagnosis */}
              <div className="grid grid-cols-3 gap-3 p-3 rounded-lg border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Vitals Telemetry</span>
                  <span className="font-mono font-semibold">BP: {vitals.bp} | Pulse: {vitals.pulse} bpm | SpO2: {vitals.spO2}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Diagnosis (ICD-10)</span>
                  <span className="font-bold text-cyan-950">{diagnosis}</span>
                </div>
              </div>

              {/* Rx Medicines Table */}
              <div className="space-y-2">
                <div className="text-sm font-black text-cyan-950 flex items-center gap-1 font-serif">
                  <span className="text-lg">℞</span> MEDICATIONS PRESCRIBED
                </div>
                <table className="w-full text-xs text-left border border-slate-200">
                  <thead className="bg-slate-100 text-[11px] font-bold text-slate-700">
                    <tr>
                      <th className="p-2 border-b">#</th>
                      <th className="p-2 border-b">Medicine Name</th>
                      <th className="p-2 border-b">Dosage</th>
                      <th className="p-2 border-b">Timing</th>
                      <th className="p-2 border-b">Duration</th>
                      <th className="p-2 border-b">Instructions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {medicines.map((m, i) => (
                      <tr key={i}>
                        <td className="p-2 font-mono text-slate-500">{i + 1}</td>
                        <td className="p-2 font-bold text-slate-900">{m.medicineName}</td>
                        <td className="p-2 font-mono text-cyan-900 font-bold">{m.dosage}</td>
                        <td className="p-2">{m.timing}</td>
                        <td className="p-2 font-mono">{m.durationDays} Days</td>
                        <td className="p-2 text-slate-600">{m.instructions}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Lab Orders & Advice */}
              {labOrders.length > 0 && (
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                  <span className="font-bold text-slate-900 block mb-1">Investigation Orders:</span>
                  <span className="text-slate-700">{labOrders.join(' • ')}</span>
                </div>
              )}

              {/* Follow-up & Footer Signature */}
              <div className="pt-6 border-t-2 border-slate-200 flex items-end justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-800">Follow-up Advice:</div>
                  <div className="text-slate-600">Review in OPD after {followUpDays} days with lab reports.</div>
                  <div className="text-[10px] text-emerald-800 font-bold mt-1">
                    * Eligible for Free Follow-up within 15 days under BRH OPD policy.
                  </div>
                </div>

                <div className="text-center space-y-1">
                  <div className="w-32 h-10 border-b border-dashed border-slate-400 mx-auto flex items-center justify-center italic text-slate-400 text-[10px]">
                    [Digitally Signed]
                  </div>
                  <div className="font-bold text-slate-900">{activeApt.doctorName}</div>
                  <div className="text-[10px] text-slate-500">{activeApt.departmentName}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Doctor Reassignment / Transfer Modal */}
      {isTransferModalOpen && transferTargetApt && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-slate-100">Refer / Transfer to Another Specialist</h3>
              </div>
              <button
                onClick={() => setIsTransferModalOpen(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Patient:</span>
                <strong className="text-slate-100">{transferTargetApt.patientName} (#{transferTargetApt.tokenNumber})</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Current Doctor:</span>
                <strong className="text-rose-400">{transferTargetApt.doctorName} ({transferTargetApt.departmentName})</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Paid Consultation Fee:</span>
                <strong className="text-slate-200 font-mono">₹{transferTargetApt.fee}</strong>
              </div>
            </div>

            <form onSubmit={handleConfirmDoctorTransfer} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Select Target Specialist / Doctor</label>
                <select
                  value={transferNewDoctorId}
                  onChange={(e) => setTransferNewDoctorId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-bold focus:outline-none focus:border-amber-500"
                >
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} — {d.specialization} ({d.departmentName}) [Fee: ₹{d.consultationFee}]
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Appointment Consultation Model</label>
                <select
                  value={transferNewModel}
                  onChange={(e) => setTransferNewModel(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none"
                >
                  <option value="Normal Queue">Normal Queue (₹{targetTransferDoctor.consultationFee})</option>
                  <option value="Premium Slot">Premium Slot (₹{targetTransferDoctor.premiumFee})</option>
                </select>
              </div>

              {/* Differential Calculation */}
              <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/30 text-xs flex items-center justify-between">
                <span className="text-amber-200 font-semibold">
                  {transferFeeCalc.differential > 0
                    ? `Additional Differential Fee Due:`
                    : transferFeeCalc.differential < 0
                    ? `Differential Refund:`
                    : `No Additional Fee Required:`}
                </span>
                <span className="font-mono font-black text-amber-300 text-sm">
                  ₹{Math.abs(transferFeeCalc.differential)}
                </span>
              </div>

              {transferFeeCalc.differential > 0 && (
                <div className="space-y-2">
                  <label className="block font-bold text-slate-300">Differential Payment Mode</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Cash', 'Online UPI', 'Card'] as const).map((mode) => (
                      <button
                        type="button"
                        key={mode}
                        onClick={() => setTransferPaymentMode(mode)}
                        className={`py-2 rounded-xl font-bold border transition text-center ${
                          transferPaymentMode === mode
                            ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>

                  {transferPaymentMode === 'Online UPI' && (
                    <input
                      type="text"
                      placeholder="12-digit UTR Number..."
                      value={transferUtrNumber}
                      onChange={(e) => setTransferUtrNumber(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono text-xs focus:outline-none"
                    />
                  )}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-black shadow-lg shadow-amber-600/30 transition flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Transfer Patient & Issue New Token</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

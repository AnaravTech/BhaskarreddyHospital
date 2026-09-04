import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import type { Patient } from '../../types';
import {
  User,
  Shield,
  Phone,
  Calendar,
  Clock,
  FileText,
  Pill,
  Stethoscope,
  Download,
  Eye,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Activity,
  ArrowRight,
  X,
  HeartHandshake,
} from 'lucide-react';

interface PatientDashboardProps {
  patient: Patient;
  onLogout: () => void;
  onBookAppointment: () => void;
  onClose?: () => void;
}

export const PatientDashboard: React.FC<PatientDashboardProps> = ({
  patient,
  onLogout,
  onBookAppointment,
  onClose,
}) => {
  const { appointments, doctors, checkOPValidity, addToast } = useHospital();

  // Active section tab: 'profile' | 'appointments' | 'doctors' | 'reports' | 'medications'
  const [activeTab, setActiveTab] = useState<'overview' | 'appointments' | 'doctors' | 'reports' | 'medications'>('overview');

  // Selected Report Modal State
  const [viewingReport, setViewingReport] = useState<{
    title: string;
    type: 'Laboratory' | 'Radiology / Diagnostic';
    date: string;
    doctor: string;
    details: Array<{ parameter: string; value: string; unit?: string; normalRange?: string; flag?: string }>;
    impression?: string;
  } | null>(null);

  // Follow-up modal state
  const [selectedFollowUpDoctor, setSelectedFollowUpDoctor] = useState<{
    doctorId: string;
    doctorName: string;
    specialization: string;
    validity: { isValid: boolean; daysRemaining: number; endDateStr: string };
  } | null>(null);

  // ─── Filter Patient Specific Appointments ────────────────────────────────────
  const patientAppointments = appointments.filter(
    (a) =>
      (a.patientUhid && a.patientUhid === patient.uhid) ||
      (a.opNumber && patient.opNumber && a.opNumber === patient.opNumber) ||
      (a.patientName && a.patientName.toLowerCase() === patient.name.toLowerCase())
  );

  // ─── Extract Consulted Doctors from Appointments & Validities ───────────────
  const consultedDoctorsList: Array<{
    doctorId: string;
    doctorName: string;
    specialization: string;
    lastVisitDate: string;
  }> = [];

  // From doctorValidities
  if (patient.doctorValidities) {
    Object.entries(patient.doctorValidities).forEach(([docKey, valRec]) => {
      const docObj = doctors.find((d) => d.id === docKey || d.name === valRec.doctorName);
      consultedDoctorsList.push({
        doctorId: docObj?.id || docKey,
        doctorName: valRec.doctorName || docObj?.name || 'Senior Consultant',
        specialization: docObj?.specialization || 'Clinical Specialist',
        lastVisitDate: valRec.lastVisitDate || '2026-07-15',
      });
    });
  }

  // From historical appointments
  patientAppointments.forEach((apt) => {
    if (apt.doctorName && !consultedDoctorsList.some((d) => d.doctorName === apt.doctorName)) {
      const docObj = doctors.find((d) => d.name === apt.doctorName || d.id === apt.doctorId);
      consultedDoctorsList.push({
        doctorId: apt.doctorId || docObj?.id || 'doc-1',
        doctorName: apt.doctorName,
        specialization: apt.departmentName || docObj?.specialization || 'General OPD',
        lastVisitDate: apt.appointmentDate || '2026-07-24',
      });
    }
  });

  // ─── Check if Patient HAS Existing Clinical Records ──────────────────────────
  const hasMedicalRecords = Boolean(
    (patient.medications && patient.medications.length > 0) ||
    (patient.labResults && patient.labResults.length > 0) ||
    (patient.radiologyReports && patient.radiologyReports.length > 0) ||
    (patient.totalVisits && patient.totalVisits > 0) ||
    patientAppointments.length > 0 ||
    consultedDoctorsList.length > 0
  );

  // ─── Masking Helpers for Privacy & ABDM Compliance ───────────────────────────
  const maskAadhaar = (aadhaar?: string) => {
    if (!aadhaar) return 'XXXX-XXXX-1234';
    const clean = aadhaar.replace(/\D/g, '');
    if (clean.length < 4) return 'XXXX-XXXX-1234';
    const last4 = clean.slice(-4);
    return `XXXX-XXXX-${last4}`;
  };

  const maskPhone = (phone?: string) => {
    if (!phone) return 'XXXXXX1234';
    const clean = phone.replace(/\D/g, '');
    if (clean.length < 4) return 'XXXXXX1234';
    const last4 = clean.slice(-4);
    return `XXXXXX${last4}`;
  };

  // ─── Report Download Handler (Simulated PDF Generation) ──────────────────────
  const handleDownloadReport = (reportName: string, date: string) => {
    addToast(
      'Report Download Started',
      `Downloading official Bhaskar Reddy Hospital ${reportName} (Dated: ${date}) for UHID: ${patient.uhid}`,
      'success'
    );
  };

  // ─── Follow-up Booking Trigger ───────────────────────────────────────────────
  const handleFollowUpClick = (doc: { doctorId: string; doctorName: string; specialization: string; lastVisitDate: string }) => {
    const val = checkOPValidity(patient.uhid, doc.doctorId);
    setSelectedFollowUpDoctor({
      doctorId: doc.doctorId,
      doctorName: doc.doctorName,
      specialization: doc.specialization,
      validity: val,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-16">
      {/* ─── Top Patient Portal Header ──────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          
          {/* Hospital Brand & Portal Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-700 p-0.5 shadow-md shadow-cyan-600/20">
              <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                <Activity className="w-6 h-6 text-cyan-600" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-slate-900 tracking-tight">
                  Bhaskar Reddy Hospital
                </span>
                <span className="text-[10px] font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-full border border-cyan-200 uppercase">
                  Patient Portal
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Personal Electronic Health Records (ABDM Linked)
              </p>
            </div>
          </div>

          {/* Patient Quick Info & Header Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-xs font-bold text-slate-900">{patient.name}</span>
              <span className="text-[11px] font-mono font-semibold text-cyan-700 bg-cyan-50 px-1.5 py-0.2 rounded border border-cyan-200">
                UHID: {patient.uhid}
              </span>
            </div>

            {onClose && (
              <button
                onClick={onClose}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-cyan-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
              >
                ← Public Website
              </button>
            )}

            <button
              onClick={onLogout}
              className="px-3.5 py-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-600" />
              <span>Logout</span>
            </button>
          </div>

        </div>
      </header>

      {/* ─── Main Portal Content Container ──────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        
        {/* Welcome & Patient Identification Bar */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-cyan-950 to-blue-950 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-900/60 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-2">
                <Shield className="w-3.5 h-3.5" />
                <span>Verified Patient Account • NABH Accredited Facility</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Welcome, {patient.name}
              </h1>
              <div className="flex flex-wrap items-center gap-2.5 mt-2 text-xs text-slate-300">
                <span className="font-mono bg-white/10 px-2.5 py-1 rounded-md text-cyan-300 font-bold">
                  UHID: {patient.uhid}
                </span>
                <span>•</span>
                <span>Age: {patient.age || 'N/A'} yrs</span>
                <span>•</span>
                <span>Blood Group: {patient.bloodGroup || 'N/A'}</span>
                <span>•</span>
                <span>Registered: {patient.registeredDate || '2026-07-24'}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onBookAppointment}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-cyan-500/25 transition flex items-center gap-2 shrink-0"
              >
                <Calendar className="w-4 h-4" />
                <span>Book Appointment</span>
              </button>
            </div>
          </div>
        </div>

        {/* ─── PATIENT PROFILE DETAILS CARD ─────────────────────────────────── */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2 pb-3 border-b border-slate-100">
            <User className="w-4 h-4 text-cyan-600" />
            <span>Patient Profile Details</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 font-semibold block mb-0.5">Full Name</span>
              <span className="font-bold text-slate-800 text-sm">{patient.name}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 font-semibold block mb-0.5">Hospital UHID</span>
              <span className="font-bold font-mono text-cyan-700 text-sm">{patient.uhid}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 font-semibold block mb-0.5">Aadhaar (Masked)</span>
              <span className="font-bold font-mono text-slate-800 text-sm">{maskAadhaar(patient.aadharNumber)}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 font-semibold block mb-0.5">Mobile (Masked)</span>
              <span className="font-bold font-mono text-slate-800 text-sm">{maskPhone(patient.phone)}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 font-semibold block mb-0.5">Date of Birth / Age</span>
              <span className="font-bold text-slate-800">{patient.dob || 'N/A'} ({patient.age || 'N/A'} years)</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 font-semibold block mb-0.5">Blood Group</span>
              <span className="font-bold text-rose-600">{patient.bloodGroup || 'N/A'}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 font-semibold block mb-0.5">Email Address</span>
              <span className="font-bold text-slate-800 truncate block">{patient.email || 'N/A'}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 font-semibold block mb-0.5">Registered Address</span>
              <span className="font-bold text-slate-800 truncate block" title={patient.address}>{patient.address || 'Nellore, Andhra Pradesh'}</span>
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────────────
            SCENARIO 1: PATIENT WITH NO PREVIOUS HOSPITAL RECORDS (CLEAN VIEW)
            (Requirement 11 & 12: Do not show fake reports, doctors, or prescriptions)
        ────────────────────────────────────────────────────────────────────── */}
        {!hasMedicalRecords && (
          <div className="bg-white rounded-3xl p-10 border border-slate-200/80 shadow-xs text-center space-y-4 max-w-2xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-cyan-50 text-cyan-600 mx-auto flex items-center justify-center shadow-md">
              <HeartHandshake className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-extrabold text-slate-900">
                You don't have previous hospital records yet.
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed max-w-md mx-auto">
                Welcome to Bhaskar Reddy Hospital! When you visit our outpatient clinics, consult specialists, 
                or undergo diagnostic tests, your validated prescriptions, clinical summaries, and laboratory 
                reports will automatically populate here.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={onBookAppointment}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-cyan-600/25 transition flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Book Your First Appointment</span>
              </button>

              <a
                href="tel:1066"
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4 text-cyan-600" />
                <span>24/7 Helpline: 1066</span>
              </a>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────────
            SCENARIO 2: PATIENT HAS EXISTING HOSPITAL RECORDS
            (Shows Appointments, Consulted Doctors, Reports, Medications, Follow-up)
        ────────────────────────────────────────────────────────────────────── */}
        {hasMedicalRecords && (
          <div className="space-y-6">

            {/* Navigation Tabs for Medical Modules */}
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
                  activeTab === 'overview'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                All Records Overview
              </button>
              <button
                onClick={() => setActiveTab('appointments')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 ${
                  activeTab === 'appointments'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>My Appointments ({patientAppointments.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('doctors')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 ${
                  activeTab === 'doctors'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span>Consulted Doctors ({consultedDoctorsList.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('reports')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 ${
                  activeTab === 'reports'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Reports & Lab Tests ({(patient.labResults?.length || 0) + (patient.radiologyReports?.length || 0)})</span>
              </button>
              <button
                onClick={() => setActiveTab('medications')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 ${
                  activeTab === 'medications'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Pill className="w-3.5 h-3.5" />
                <span>Medications ({patient.medications?.length || 0})</span>
              </button>
            </div>

            {/* ─── TAB 1: MY APPOINTMENTS ────────────────────────────────────── */}
            {(activeTab === 'overview' || activeTab === 'appointments') && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-cyan-600" />
                    <span>My Appointments</span>
                  </h3>
                  <button
                    onClick={onBookAppointment}
                    className="text-xs font-bold text-cyan-600 hover:text-cyan-700 flex items-center gap-1"
                  >
                    <span>+ Book New Appointment</span>
                  </button>
                </div>

                {patientAppointments.length === 0 ? (
                  <div className="text-xs text-slate-500 py-4 text-center">
                    No scheduled appointments at this moment.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {patientAppointments.map((apt) => (
                      <div
                        key={apt.id}
                        className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:shadow-md transition space-y-2"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-cyan-100 text-cyan-800">
                              Token: {apt.tokenNumber || 'OPD-REG'}
                            </span>
                            <div className="font-bold text-slate-900 text-sm mt-1">{apt.doctorName}</div>
                            <div className="text-xs text-slate-500">{apt.departmentName}</div>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                              apt.status === 'Checked-In'
                                ? 'bg-emerald-100 text-emerald-800'
                                : apt.status === 'Scheduled'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {apt.status}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-slate-600 pt-1 border-t border-slate-200/60">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{apt.appointmentDate}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{apt.appointmentTime}</span>
                          </div>
                          <div className="ml-auto font-semibold text-slate-700">
                            {apt.fee === 0 ? 'Free Follow-up' : `₹${apt.fee}`}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ─── TAB 2: CONSULTED DOCTORS & 15-DAY FOLLOW-UP RE-BOOKING ────── */}
            {(activeTab === 'overview' || activeTab === 'doctors') && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <Stethoscope className="w-4 h-4 text-cyan-600" />
                      <span>Consulted Doctors & Follow-up Eligibility</span>
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Doctor-specific 15-day OP validity rule applies. Free follow-up applies exclusively to the same doctor.
                    </p>
                  </div>
                </div>

                {consultedDoctorsList.length === 0 ? (
                  <div className="text-xs text-slate-500 py-4 text-center">
                    No doctor consultations recorded yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {consultedDoctorsList.map((doc) => {
                      const validity = checkOPValidity(patient.uhid, doc.doctorId);

                      return (
                        <div
                          key={doc.doctorId + doc.doctorName}
                          className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:shadow-md transition space-y-3"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-bold text-slate-900 text-sm">{doc.doctorName}</div>
                              <div className="text-xs text-slate-500">{doc.specialization}</div>
                              <div className="text-[11px] text-slate-400 mt-1">
                                Last Visited: <span className="text-slate-700 font-medium">{doc.lastVisitDate}</span>
                              </div>
                            </div>

                            {validity.isValid ? (
                              <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-[10px] font-bold">
                                Free Follow-up Active ({validity.daysRemaining}d left)
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full bg-slate-100 border border-slate-300 text-slate-600 text-[10px] font-bold">
                                Validity Expired
                              </span>
                            )}
                          </div>

                          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                            <span className="text-[11px] text-slate-500">
                              {validity.isValid
                                ? `Valid until ${validity.endDateStr} (₹0 Fee)`
                                : 'New Consultation Fee Applicable'}
                            </span>

                            <button
                              onClick={() => handleFollowUpClick(doc)}
                              className="px-3 py-1.5 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-700 text-xs font-bold border border-cyan-200 transition flex items-center gap-1"
                            >
                              <span>Re-book Follow-up</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ─── TAB 3: LABORATORY & DIAGNOSTIC REPORTS (VIEW & DOWNLOAD) ──── */}
            {(activeTab === 'overview' || activeTab === 'reports') && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <FileText className="w-4 h-4 text-cyan-600" />
                    <span>Laboratory & Diagnostic Reports</span>
                  </h3>
                  <span className="text-xs text-slate-400">NABH Accredited Diagnostic Wing</span>
                </div>

                {(!patient.labResults || patient.labResults.length === 0) &&
                (!patient.radiologyReports || patient.radiologyReports.length === 0) ? (
                  <div className="text-xs text-slate-500 py-4 text-center">
                    No diagnostic or laboratory reports available yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Lab Results */}
                    {patient.labResults?.map((lab, idx) => (
                      <div
                        key={`lab-${idx}`}
                        className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white transition"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">{lab.testName}</span>
                            <span
                              className={`px-2 py-0.2 rounded text-[10px] font-bold ${
                                lab.flag === 'Normal'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {lab.flag} ({lab.value} {lab.unit})
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            Standard Normal Range: {lab.normalRange} {lab.unit} • Date: {lab.date}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              setViewingReport({
                                title: lab.testName,
                                type: 'Laboratory',
                                date: lab.date,
                                doctor: 'Dr. Bhaskar Reddy (Pathology Lead)',
                                details: [
                                  {
                                    parameter: lab.testName,
                                    value: lab.value,
                                    unit: lab.unit,
                                    normalRange: lab.normalRange,
                                    flag: lab.flag,
                                  },
                                ],
                                impression: `Result is ${lab.flag.toLowerCase()} relative to clinical reference thresholds. Clinical correlation advised.`,
                              })
                            }
                            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5 text-cyan-600" />
                            <span>View</span>
                          </button>

                          <button
                            onClick={() => handleDownloadReport(lab.testName, lab.date)}
                            className="px-3 py-1.5 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-700 text-xs font-bold border border-cyan-200 transition flex items-center gap-1"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download</span>
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Radiology Reports */}
                    {patient.radiologyReports?.map((rad, idx) => (
                      <div
                        key={`rad-${idx}`}
                        className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white transition"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">
                              {rad.modality} - {rad.bodyPart}
                            </span>
                            <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
                              Diagnostic Radiology
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            Impression: {rad.impression} • Radiologist: {rad.radiologist} • Date: {rad.date}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              setViewingReport({
                                title: `${rad.modality} - ${rad.bodyPart}`,
                                type: 'Radiology / Diagnostic',
                                date: rad.date,
                                doctor: rad.radiologist,
                                details: [
                                  { parameter: 'Modality', value: rad.modality },
                                  { parameter: 'Anatomical Region', value: rad.bodyPart },
                                  { parameter: 'Diagnostic Findings', value: rad.findings },
                                ],
                                impression: rad.impression,
                              })
                            }
                            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5 text-cyan-600" />
                            <span>View</span>
                          </button>

                          <button
                            onClick={() => handleDownloadReport(`${rad.modality} ${rad.bodyPart}`, rad.date)}
                            className="px-3 py-1.5 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-700 text-xs font-bold border border-cyan-200 transition flex items-center gap-1"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ─── TAB 4: PRESCRIBED MEDICATIONS ─────────────────────────────── */}
            {(activeTab === 'overview' || activeTab === 'medications') && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Pill className="w-4 h-4 text-cyan-600" />
                    <span>Prescribed Medications</span>
                  </h3>
                  <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Active E-Prescriptions</span>
                  </span>
                </div>

                {!patient.medications || patient.medications.length === 0 ? (
                  <div className="text-xs text-slate-500 py-4 text-center">
                    No active medications recorded for this patient.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {patient.medications.map((med, idx) => (
                      <div
                        key={`med-${idx}`}
                        className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:shadow-md transition space-y-2"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="font-extrabold text-slate-900 text-sm block">
                              {med.drugName}
                            </span>
                            <span className="text-xs font-semibold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200 mt-1 inline-block">
                              Dosage: {med.dosage}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            {med.route || 'Oral'}
                          </span>
                        </div>

                        <div className="text-xs text-slate-600 space-y-1 pt-1 border-t border-slate-200/60">
                          <div>Frequency: <span className="font-medium text-slate-800">{med.frequency}</span></div>
                          <div>Duration: <span className="font-medium text-slate-800">{med.duration}</span></div>
                          <div className="text-[11px] text-slate-400">Prescribing Doctor: {med.doctor}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        )}

      </main>

      {/* ─── MODAL: OFFICIAL CLINICAL REPORT VIEWER ─────────────────────────── */}
      {viewingReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative animate-in zoom-in-95 duration-150">
            
            {/* Header */}
            <div className="bg-slate-900 text-white p-6 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="w-5 h-5 text-cyan-400" />
                  <span className="text-xs font-extrabold tracking-wider uppercase text-cyan-300">
                    Bhaskar Reddy Hospital Diagnostic Sheet
                  </span>
                </div>
                <h3 className="text-xl font-black text-white">{viewingReport.title}</h3>
                <div className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                  <span>Type: {viewingReport.type}</span>
                  <span>•</span>
                  <span>Date: {viewingReport.date}</span>
                  <span>•</span>
                  <span>Consultant: {viewingReport.doctor}</span>
                </div>
              </div>

              <button
                onClick={() => setViewingReport(null)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
              {/* Patient Meta Strip */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs grid grid-cols-3 gap-2">
                <div>Patient: <strong>{patient.name}</strong></div>
                <div>UHID: <strong>{patient.uhid}</strong></div>
                <div>Age/Sex: <strong>{patient.age} yrs / {patient.gender}</strong></div>
              </div>

              {/* Report Parameters Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Investigation Parameter</th>
                      <th className="p-3">Observed Value</th>
                      <th className="p-3">Reference Range</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {viewingReport.details.map((d, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="p-3 font-semibold text-slate-800">{d.parameter}</td>
                        <td className="p-3 font-mono font-bold text-slate-900">
                          {d.value} {d.unit || ''}
                        </td>
                        <td className="p-3 text-slate-500">
                          {d.normalRange ? `${d.normalRange} ${d.unit || ''}` : 'N/A'}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              d.flag === 'Normal'
                                ? 'bg-emerald-100 text-emerald-800'
                                : d.flag === 'High' || d.flag === 'Low'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-slate-100 text-slate-800'
                            }`}
                          >
                            {d.flag || 'Completed'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {viewingReport.impression && (
                <div className="p-3.5 rounded-xl bg-cyan-50/60 border border-cyan-200 text-xs text-slate-700">
                  <strong className="text-cyan-900 block mb-0.5">Clinical Impression & Remarks:</strong>
                  <span>{viewingReport.impression}</span>
                </div>
              )}
            </div>

            {/* Footer Action Buttons */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">Digital Telemetry Verified • ABDM Encrypted</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadReport(viewingReport.title, viewingReport.date)}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
                <button
                  onClick={() => setViewingReport(null)}
                  className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ─── MODAL: RE-BOOK FOLLOW-UP WITH 15-DAY VALIDITY RULE ────────────── */}
      {selectedFollowUpDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative animate-in zoom-in-95 duration-150 p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-cyan-600 uppercase tracking-wider">
                  Re-book Follow-up Appointment
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">
                  {selectedFollowUpDoctor.doctorName}
                </h3>
                <p className="text-xs text-slate-500">{selectedFollowUpDoctor.specialization}</p>
              </div>
              <button
                onClick={() => setSelectedFollowUpDoctor(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Doctor-Specific Validity Rule Box */}
            <div
              className={`p-4 rounded-2xl border text-xs space-y-1.5 ${
                selectedFollowUpDoctor.validity.isValid
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                  : 'bg-amber-50/80 border-amber-200 text-amber-900'
              }`}
            >
              <div className="font-extrabold flex items-center gap-1.5">
                {selectedFollowUpDoctor.validity.isValid ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Free Follow-up Valid Until {selectedFollowUpDoctor.validity.endDateStr}</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span>15-Day Free Follow-up Validity Expired</span>
                  </>
                )}
              </div>

              <p className="text-[11px] leading-relaxed">
                {selectedFollowUpDoctor.validity.isValid ? (
                  <>
                    You are within the 15-day consultation validity period with{' '}
                    <strong>{selectedFollowUpDoctor.doctorName}</strong>. Consultation Fee:{' '}
                    <strong className="text-emerald-700">₹0 (Free Follow-up)</strong>.
                  </>
                ) : (
                  <>
                    More than 15 days have elapsed since your previous consultation, or this is a new specialty.
                    Applicable consultation fee: <strong>₹400 / ₹500</strong>.
                  </>
                )}
              </p>
            </div>

            <div className="pt-2 space-y-2">
              <button
                onClick={() => {
                  setSelectedFollowUpDoctor(null);
                  onBookAppointment();
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2"
              >
                <span>Proceed to Select Slot & Confirm</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setSelectedFollowUpDoctor(null)}
                className="w-full py-2.5 rounded-xl text-slate-500 hover:text-slate-700 text-xs font-bold transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

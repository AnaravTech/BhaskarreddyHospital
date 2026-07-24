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
  Download,
} from 'lucide-react';

export const PatientManagementModule: React.FC = () => {
  const { patients, checkOPValidity } = useHospital();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(patients[0] || null);

  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.uhid.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone.includes(searchTerm)
  );

  const validity = selectedPatient ? checkOPValidity(selectedPatient.lastVisitDate) : null;

  return (
    <div className="space-y-6 pb-12">
      {/* Module Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80">
        <div>
          <h2 className="text-2xl font-extrabold text-white">Digital Health Record Directory</h2>
          <p className="text-xs text-slate-400">
            Comprehensive UHID patient profiles, longitudinal visit histories, and clinical summaries.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by UHID, Name, or Mobile..."
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
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              Patient Roster ({filteredPatients.length})
            </h3>
          </div>

          <div className="space-y-2 max-h-[650px] overflow-y-auto pr-1">
            {filteredPatients.map((pat) => {
              const isSelected = selectedPatient?.id === pat.id;
              const patVal = checkOPValidity(pat.lastVisitDate);

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
                    <span className="font-mono text-[11px] font-bold text-cyan-400">{pat.uhid}</span>
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
                    <span>Last Visit: {pat.lastVisitDate}</span>
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
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black text-white">{selectedPatient.name}</h3>
                      <span className="font-mono text-xs text-cyan-400 font-bold px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/30 rounded">
                        {selectedPatient.uhid}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {selectedPatient.gender}, {selectedPatient.age} Years • Registered {selectedPatient.registeredDate}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => alert(`Downloading Digital EHR Summary PDF for UHID: ${selectedPatient.uhid}`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export EHR</span>
                  </button>
                </div>
              </div>

              {/* 15-Day OP Consultation Validity Banner */}
              {validity && (
                <div
                  className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${
                    validity.isValid
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
                    <div>
                      <span className="font-bold">15-Day OP Consultation Validity Rule: </span>
                      {validity.isValid
                        ? `Active until ${validity.endDateStr} (${validity.daysRemaining} days remaining)`
                        : 'Expired. Consultation fee applicable for next visit.'}
                    </div>
                  </div>
                  {validity.isValid && (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px] uppercase">
                      Eligible Free OP
                    </span>
                  )}
                </div>
              )}

              {/* Key Vitals & Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-slate-300 border-b border-slate-800/60 pb-1 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-cyan-400" /> Contact & Residence
                  </div>
                  <div className="text-xs space-y-1 text-slate-300">
                    <div>
                      <span className="text-slate-500">Phone:</span> {selectedPatient.phone}
                    </div>
                    <div>
                      <span className="text-slate-500">Email:</span> {selectedPatient.email}
                    </div>
                    <div>
                      <span className="text-slate-500">Address:</span> {selectedPatient.address}
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-slate-300 border-b border-slate-800/60 pb-1 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-purple-400" /> TPA & Insurance Coverage
                  </div>
                  <div className="text-xs space-y-1 text-slate-300">
                    <div>
                      <span className="text-slate-500">Provider:</span>{' '}
                      {selectedPatient.insuranceProvider || 'Cash / Self Pay'}
                    </div>
                    <div>
                      <span className="text-slate-500">Policy No:</span>{' '}
                      {selectedPatient.policyNumber || 'N/A'}
                    </div>
                    <div>
                      <span className="text-slate-500">Blood Group:</span>{' '}
                      <span className="font-bold text-rose-400">{selectedPatient.bloodGroup}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Allergies & Medical History */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                  Clinical Risk Profile & Allergies
                </h4>

                <div className="flex flex-wrap gap-2">
                  {selectedPatient.allergies.map((allergy, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-rose-500/10 text-rose-300 border border-rose-500/30"
                    >
                      ⚠️ Allergy: {allergy}
                    </span>
                  ))}
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <div className="text-xs font-semibold text-slate-400">Past Diagnoses & Chronic History:</div>
                  <ul className="list-disc list-inside text-xs text-slate-200 space-y-0.5">
                    {selectedPatient.medicalHistory.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Visit History Timeline */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  Longitudinal Visit Timeline ({selectedPatient.totalVisits} Total Visits)
                </h4>

                <div className="relative pl-4 border-l-2 border-slate-800 space-y-4">
                  <div className="relative">
                    <span className="absolute -left-[21px] top-0 w-3.5 h-3.5 rounded-full bg-cyan-500 ring-4 ring-slate-900" />
                    <div className="text-xs font-bold text-slate-100">{selectedPatient.lastVisitDate}</div>
                    <div className="text-xs text-slate-400">
                      OPD Consultation with Dr. Sunita Kulkarni (Internal Medicine)
                    </div>
                  </div>

                  <div className="relative">
                    <span className="absolute -left-[21px] top-0 w-3.5 h-3.5 rounded-full bg-slate-700" />
                    <div className="text-xs font-bold text-slate-300">2026-03-10</div>
                    <div className="text-xs text-slate-400">
                      Routine Follow-up & Blood Glucose HBA1C Screening
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-2xl bg-slate-900/40 border border-slate-800 text-center text-slate-500 text-xs">
              Select a patient from the roster to view their complete digital health record profile.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

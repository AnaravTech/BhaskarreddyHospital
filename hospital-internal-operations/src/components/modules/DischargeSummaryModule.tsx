import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import { FileCheck, Printer } from 'lucide-react';

export const DischargeSummaryModule: React.FC = () => {
  const { addToast } = useHospital();

  const [selectedPatient, setSelectedPatient] = useState('Kavitha Venkatram');
  const [uhid, setUhid] = useState('UHID-2026-9041');
  const [admissionDate, setAdmissionDate] = useState('2026-07-20');
  const [dischargeDate, setDischargeDate] = useState('2026-07-24');
  const [attendingDoctor] = useState('Dr. Madhu Latha Marreddy');
  const [finalDiagnosis, setFinalDiagnosis] = useState('Acute Laparoscopic Appendectomy - Uneventful Recovery');
  const [courseInHospital, setCourseInHospital] = useState(
    'Patient admitted with severe right lower quadrant abdominal pain. Laparoscopic appendectomy performed under GA on 2026-07-21. Post-op recovery smooth. Vitals stable.'
  );
  const [dischargeMeds, setDischargeMeds] = useState('1. Cefixime 200mg (1-0-1 x 5 Days)\n2. Paracetamol 650mg (1-0-1 PRN)\n3. Pantoprazole 40mg (1-0-0 x 7 Days)');
  const [followupDate] = useState('2026-07-31 (OPD Room 102)');

  const handlePrintSummary = () => {
    addToast('Discharge Summary Generated', `Generated official discharge summary for ${selectedPatient} (${uhid})`, 'success');
  };

  return (
    <div className="space-y-6 text-slate-100">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/80 p-6 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <FileCheck className="w-6 h-6 text-emerald-400" />
            IPD Discharge Summary & Audit Generator
          </h2>
          <p className="text-xs text-slate-400 mt-1">Compile admission diagnosis, surgical notes, discharge Rx, and digital doctor signatures</p>
        </div>
        <button
          onClick={handlePrintSummary}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md"
        >
          <Printer className="w-4 h-4" /> Print / Export PDF Discharge Summary
        </button>
      </div>

      {/* Discharge Summary Form & Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
        <div className="lg:col-span-6 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white">Discharge Summary Metadata Form</h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Patient Name</label>
              <input
                type="text"
                value={selectedPatient}
                onChange={(e) => setSelectedPatient(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">UHID</label>
              <input
                type="text"
                value={uhid}
                onChange={(e) => setUhid(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Admission Date</label>
              <input
                type="date"
                value={admissionDate}
                onChange={(e) => setAdmissionDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Discharge Date</label>
              <input
                type="date"
                value={dischargeDate}
                onChange={(e) => setDischargeDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Final Discharge Diagnosis</label>
            <input
              type="text"
              value={finalDiagnosis}
              onChange={(e) => setFinalDiagnosis(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-bold"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Clinical Course in Hospital</label>
            <textarea
              rows={3}
              value={courseInHospital}
              onChange={(e) => setCourseInHospital(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Discharge Medications (e-Rx)</label>
            <textarea
              rows={3}
              value={dischargeMeds}
              onChange={(e) => setDischargeMeds(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono"
            />
          </div>
        </div>

        {/* Official Printable Discharge Summary Preview Document */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-white text-slate-900 border border-slate-300 shadow-xl space-y-4 font-sans">
          <div className="border-b-2 border-blue-600 pb-3 flex justify-between items-center">
            <div>
              <h3 className="text-base font-black text-slate-900">BHASKAR REDDY HOSPITAL</h3>
              <p className="text-[10px] text-slate-600">Pogathota, Near Vijayamahal Gate, Nellore - 524001 | 0861-2345678</p>
            </div>
            <span className="px-2.5 py-1 rounded bg-blue-100 text-blue-800 text-[10px] font-bold uppercase font-mono">
              OFFICIAL DISCHARGE SUMMARY
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div><strong>Patient Name:</strong> {selectedPatient}</div>
            <div><strong>UHID:</strong> {uhid}</div>
            <div><strong>Admitted Date:</strong> {admissionDate}</div>
            <div><strong>Discharged Date:</strong> {dischargeDate}</div>
            <div className="col-span-2"><strong>Attending Doctor:</strong> {attendingDoctor}</div>
          </div>

          <div className="space-y-1 text-[11px]">
            <div className="font-bold text-blue-900 uppercase tracking-wider text-[10px]">FINAL DIAGNOSIS:</div>
            <p className="font-semibold text-slate-800">{finalDiagnosis}</p>
          </div>

          <div className="space-y-1 text-[11px]">
            <div className="font-bold text-blue-900 uppercase tracking-wider text-[10px]">HOSPITAL COURSE & TREATMENT:</div>
            <p className="text-slate-700 leading-relaxed text-[11px]">{courseInHospital}</p>
          </div>

          <div className="space-y-1 text-[11px]">
            <div className="font-bold text-blue-900 uppercase tracking-wider text-[10px]">DISCHARGE MEDICATIONS:</div>
            <pre className="font-mono text-[10px] text-slate-800 bg-slate-50 p-2.5 rounded-lg border border-slate-200 whitespace-pre-wrap">
              {dischargeMeds}
            </pre>
          </div>

          <div className="pt-4 border-t border-slate-300 flex justify-between items-end text-[10px]">
            <div>
              <div><strong>Follow-up Visit:</strong> {followupDate}</div>
              <div className="text-slate-500">24/7 Emergency Line: 0861-2345678</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-blue-900 text-xs font-mono">[DIGITAL STAMP SIGNED]</div>
              <div className="text-slate-600 font-semibold">{attendingDoctor}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import { FlaskConical, FileText, CheckCircle2, Activity } from 'lucide-react';

export const DiagnosticsModule: React.FC = () => {
  const { addToast } = useHospital();
  const [selectedLabTest, setSelectedLabTest] = useState('CBC (Complete Blood Count)');
  const [patientName, setPatientName] = useState('Kavitha Venkatram');
  const [patientUhid, setPatientUhid] = useState('UHID-2026-9041');

  // Diagnostic Test Values
  const [valHb, setValHb] = useState('13.8');
  const [valWbc, setValWbc] = useState('7,200');
  const [valPlatelet, setValPlatelet] = useState('280,000');
  const [valSugar, setValSugar] = useState('105');

  const pendingTests = [
    { id: 'lab-301', uhid: 'UHID-2026-9041', patientName: 'Kavitha Venkatram', testName: 'CBC + Lipid Profile', doctor: 'Dr. Vikram Reddy', date: '2026-07-24', status: 'Sample Collected' },
    { id: 'lab-302', uhid: 'UHID-2026-8801', patientName: 'Narayana Swamy', testName: 'HbA1c & Fasting Blood Sugar', doctor: 'Dr. Sunita Kulkarni', date: '2026-07-24', status: 'Processing in Analyzer' },
    { id: 'lab-303', uhid: 'UHID-2026-7721', patientName: 'Suresh Babu', testName: 'Digital Chest X-Ray PA View', doctor: 'Dr. Sameer Khan', date: '2026-07-24', status: 'Imaging Complete' },
  ];

  const handleVerifyReport = (e: React.FormEvent) => {
    e.preventDefault();
    addToast('Lab Report Verified', `Verified PDF Lab Report for ${patientName} (${patientUhid}) with Pathologist Stamp`, 'success');
  };

  return (
    <div className="space-y-6 text-slate-100">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/80 p-6 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <FlaskConical className="w-6 h-6 text-cyan-400" />
            Laboratory & Radiology LIS / RIS Desk
          </h2>
          <p className="text-xs text-slate-400 mt-1">Sample processing, analyzer interface, and digital report generation</p>
        </div>
        <span className="px-3 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 text-xs font-bold border border-cyan-500/30">
          Pathology Analyzer Connected
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Pending Orders Queue */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            Active Diagnostic Worklist ({pendingTests.length})
          </h3>

          <div className="space-y-3 text-xs">
            {pendingTests.map((t) => (
              <div key={t.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-slate-100">{t.patientName}</div>
                    <div className="text-[10px] text-cyan-400 font-mono">{t.uhid} • Ordered by {t.doctor}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-bold">
                    {t.status}
                  </span>
                </div>

                <div className="font-bold text-slate-200">{t.testName}</div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-[10px] text-slate-400 font-mono">Date: {t.date}</span>
                  <button
                    onClick={() => {
                      setPatientName(t.patientName);
                      setPatientUhid(t.uhid);
                      setSelectedLabTest(t.testName);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[11px]"
                  >
                    Enter Values & Generate Report
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Report Verification & Values Entry */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-purple-400" />
            Pathology Entry & Verification Studio
          </h3>

          <form onSubmit={handleVerifyReport} className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="font-bold text-slate-100">{patientName}</div>
              <div className="text-[10px] text-cyan-400 font-mono">{patientUhid} • Test: {selectedLabTest}</div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Hemoglobin (Hb) g/dL</label>
                <input
                  type="text"
                  value={valHb}
                  onChange={(e) => setValHb(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Total WBC Count /cu.mm</label>
                <input
                  type="text"
                  value={valWbc}
                  onChange={(e) => setValWbc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Platelet Count /cu.mm</label>
                <input
                  type="text"
                  value={valPlatelet}
                  onChange={(e) => setValPlatelet(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Fasting Blood Sugar mg/dL</label>
                <input
                  type="text"
                  value={valSugar}
                  onChange={(e) => setValSugar(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" /> Sign & Issue Verified PDF Report
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

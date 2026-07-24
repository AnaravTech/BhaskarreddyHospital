import React from 'react';
import { useHospital } from '../../context/HospitalContext';
import { Stethoscope } from 'lucide-react';

export const DMODeskModule: React.FC = () => {
  const { addToast } = useHospital();

  const dmoWardCases = [
    { id: 'dmo-1', patientName: 'Srinivas Goud', uhid: 'BRH-2026-9012', bed: 'ICU-101', diagnosis: 'Post-PTCA Angioplasty Stent Monitoring', status: 'Stable', vBp: '130/85', vPulse: '72', vSpO2: '99%' },
    { id: 'dmo-2', patientName: 'Kavitha Venkatram', uhid: 'BRH-2026-8941', bed: 'PVT-301', diagnosis: 'IV Insulin Sliding Scale Protocol', status: 'Under Observation', vBp: '125/80', vPulse: '76', vSpO2: '98%' },
  ];

  return (
    <div className="space-y-6 text-slate-100 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/80 p-6 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-emerald-400" />
            Duty Medical Officer (DMO) Clinical Desk
          </h2>
          <p className="text-xs text-slate-400 mt-1">24/7 Ward monitoring, patient stabilization, shift handover notes, and emergency clinical orders</p>
        </div>
        <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
          DMO On-Duty Shift: Active
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        {dmoWardCases.map((c) => (
          <div key={c.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-extrabold text-sm text-white">{c.patientName}</h3>
                <span className="font-mono text-[10px] text-cyan-400">{c.uhid} • Bed: {c.bed}</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                {c.status}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] space-y-1">
              <div className="text-slate-300 font-semibold">Diagnosis: {c.diagnosis}</div>
              <div className="flex gap-3 text-slate-400 font-mono text-[10px] pt-1">
                <span>BP: <strong className="text-slate-200">{c.vBp}</strong></span>
                <span>Pulse: <strong className="text-slate-200">{c.vPulse} bpm</strong></span>
                <span>SpO2: <strong className="text-emerald-400">{c.vSpO2}</strong></span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-1">
              <button
                onClick={() => addToast('Shift Handover Recorded', `DMO Shift handover note logged for ${c.patientName}`, 'success')}
                className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
              >
                Record Shift Handover & DMO Orders
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

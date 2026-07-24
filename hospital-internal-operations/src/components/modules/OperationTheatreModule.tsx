import React from 'react';
import { useHospital } from '../../context/HospitalContext';
import { Scissors, CheckCircle2 } from 'lucide-react';

export const OperationTheatreModule: React.FC = () => {
  const { addToast } = useHospital();

  const surgeries = [
    {
      id: 'ot-1',
      otRoom: 'OT Suite 1 (Robotic)',
      procedure: 'Robotic Total Knee Replacement',
      patientName: 'Prabhakar Rao',
      uhid: 'UHID-2026-7890',
      surgeon: 'Dr. Rajeshwar Rao',
      anesthetist: 'Dr. Srinivas M, MD',
      timeSlot: '08:30 AM - 11:00 AM',
      npoStatus: 'Confirmed NPO (12 Hrs)',
      bloodReservation: '2 Units O+ Reserved',
      status: 'In Surgery',
    },
    {
      id: 'ot-2',
      otRoom: 'OT Suite 2 (Laparoscopic)',
      procedure: 'Laparoscopic Cholecystectomy',
      patientName: 'Kavitha Devi',
      uhid: 'UHID-2026-9041',
      surgeon: 'Dr. Madhu Latha Marreddy',
      anesthetist: 'Dr. Anitha K, DA',
      timeSlot: '11:30 AM - 01:30 PM',
      npoStatus: 'Confirmed NPO (8 Hrs)',
      bloodReservation: 'Crossmatched A+',
      status: 'Pre-Op PACU',
    },
    {
      id: 'ot-3',
      otRoom: 'OT Suite 3 (Cardiac)',
      procedure: 'Coronary Artery Bypass Graft (CABG)',
      patientName: 'Venkat Reddy',
      uhid: 'UHID-2026-5511',
      surgeon: 'Dr. Vikram Reddy',
      anesthetist: 'Dr. Srinivas M, MD',
      timeSlot: '02:00 PM - 06:00 PM',
      npoStatus: 'Confirmed NPO (10 Hrs)',
      bloodReservation: '4 Units B+ Reserved',
      status: 'Scheduled',
    },
  ];

  return (
    <div className="space-y-6 text-slate-100">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/80 p-6 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Scissors className="w-6 h-6 text-purple-400" />
            Operation Theatre (OT) & Surgical Suite Roster
          </h2>
          <p className="text-xs text-slate-400 mt-1">Robotic & Laparoscopic OT scheduling, pre-op checklists, and PACU recovery tracking</p>
        </div>
        <span className="px-3 py-1.5 rounded-xl bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30">
          OT Suites Active: 3 / 4
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
        {surgeries.map((s) => (
          <div key={s.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <span className="px-2.5 py-1 rounded bg-purple-500/20 text-purple-300 font-mono text-[11px] font-bold">
                  {s.otRoom}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    s.status === 'In Surgery'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse'
                      : s.status === 'Pre-Op PACU'
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {s.status}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white">{s.procedure}</h3>
                <div className="text-[11px] text-cyan-400 font-semibold mt-0.5">{s.patientName} ({s.uhid})</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-[11px]">
                <div className="text-slate-300">Lead Surgeon: <span className="font-bold text-white">{s.surgeon}</span></div>
                <div className="text-slate-400">Anesthetist: {s.anesthetist}</div>
                <div className="text-slate-400 font-mono">Slot: {s.timeSlot}</div>
              </div>

              <div className="space-y-1 text-[10px]">
                <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{s.npoStatus}</span>
                </div>
                <div className="flex items-center gap-1.5 text-cyan-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{s.bloodReservation}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => addToast('OT Status Updated', `Updated surgery status for ${s.patientName}`, 'info')}
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold"
            >
              Update Surgical Stage Log
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

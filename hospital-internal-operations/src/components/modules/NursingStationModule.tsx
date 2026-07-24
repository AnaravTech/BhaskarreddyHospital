import React from 'react';
import { useHospital } from '../../context/HospitalContext';
import { Activity, Pill } from 'lucide-react';

export const NursingStationModule: React.FC = () => {
  const { addToast } = useHospital();

  const nursingTasks = [
    { id: 'ns-1', patientName: 'Srinivas Goud', bed: 'ICU-101', medication: 'Inj. Heparin 5000 IU IV', time: '10:00 AM', status: 'Scheduled' },
    { id: 'ns-2', patientName: 'Kavitha Venkatram', bed: 'PVT-301', medication: 'Tab. Telmisartan 40mg PO', time: '11:00 AM', status: 'Given' },
  ];

  return (
    <div className="space-y-6 text-slate-100 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/80 p-6 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-cyan-400" />
            Ward Nursing Station & Medication Administration (MAR)
          </h2>
          <p className="text-xs text-slate-400 mt-1">Bedside care, MAR medication logging, vital signs charts, and doctor order execution</p>
        </div>
        <span className="px-3 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 text-xs font-bold border border-cyan-500/30">
          Ward Nurse Station Active
        </span>
      </div>

      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Pill className="w-4 h-4 text-emerald-400" /> Medication Administration Record (MAR)
        </h3>

        <div className="space-y-3 text-xs">
          {nursingTasks.map((t) => (
            <div key={t.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
              <div>
                <div className="font-bold text-white">{t.patientName} ({t.bed})</div>
                <div className="text-slate-300 text-[11px] font-mono mt-0.5">{t.medication} • Due: {t.time}</div>
              </div>

              <button
                onClick={() => addToast('Medication Administered', `Recorded MAR execution for ${t.patientName}`, 'success')}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs"
              >
                Mark Administered
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

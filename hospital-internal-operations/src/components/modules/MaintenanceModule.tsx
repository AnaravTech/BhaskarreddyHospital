import React from 'react';
import { useHospital } from '../../context/HospitalContext';
import { Wrench, Shield } from 'lucide-react';

export const MaintenanceModule: React.FC = () => {
  const { addToast } = useHospital();

  const assets = [
    { id: 'ast-1', name: 'Cath Lab Philips Allura Clarity', category: 'Biomedical Imaging', location: 'Cath Lab 1', lastCalibrated: '2026-05-10', status: 'Optimal' },
    { id: 'ast-2', name: 'Dräger Fabius Anesthesia Workstation', category: 'Operation Theatre', location: 'OT Suite 2', lastCalibrated: '2026-06-15', status: 'Maintenance Due' },
  ];

  return (
    <div className="space-y-6 text-slate-100 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/80 p-6 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Wrench className="w-6 h-6 text-amber-400" />
            Biomedical Asset & Equipment Maintenance Desk
          </h2>
          <p className="text-xs text-slate-400 mt-1">Biomedical equipment calibration, breakdown ticket resolution, AMC tracking, and asset health</p>
        </div>
        <span className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
          Asset Health Index: 98.4%
        </span>
      </div>

      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Shield className="w-4 h-4 text-cyan-400" /> Biomedical Equipment Master Register
        </h3>

        <div className="space-y-3 text-xs">
          {assets.map((a) => (
            <div key={a.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
              <div>
                <div className="font-bold text-white">{a.name}</div>
                <div className="text-slate-400 text-[11px] font-mono mt-0.5">{a.category} • Location: {a.location} • Calibration: {a.lastCalibrated}</div>
              </div>

              <button
                onClick={() => addToast('Calibration Logged', `Logged calibration for ${a.name}`, 'success')}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs"
              >
                Log Calibration Ticket
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

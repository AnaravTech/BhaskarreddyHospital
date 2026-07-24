import React from 'react';
import { useHospital } from '../../context/HospitalContext';
import { Star } from 'lucide-react';

export const DoctorsModule: React.FC = () => {
  const { doctors } = useHospital();

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30">
              Medical Roster
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-white mt-1">Doctor Profiles & Duty Schedules</h2>
          <p className="text-xs text-slate-400">
            Consultation fee structure, availability matrices, and surgical duty status.
          </p>
        </div>
      </div>

      {/* Doctor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {doctors.map((doc) => (
          <div
            key={doc.id}
            className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 transition flex flex-col justify-between space-y-4"
          >
            <div className="flex items-start gap-3">
              <img
                src={doc.image}
                alt={doc.name}
                className="w-14 h-14 rounded-2xl object-cover ring-2 ring-cyan-500/30 shadow-md shrink-0"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-slate-100">{doc.name}</h3>
                  <span className="flex items-center text-[10px] font-bold text-amber-400">
                    <Star className="w-3 h-3 fill-amber-400" /> {doc.rating}
                  </span>
                </div>
                <div className="text-[11px] text-cyan-400 font-semibold">{doc.specialization}</div>
                <div className="text-[10px] text-slate-400">{doc.qualification}</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Normal Consultation Fee:</span>
                <span className="font-bold text-slate-100 font-mono">₹{doc.consultationFee}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Premium Slot Fee:</span>
                <span className="font-bold text-purple-400 font-mono">₹{doc.premiumFee}</span>
              </div>
              <div className="flex justify-between text-slate-400 border-t border-slate-800 pt-1">
                <span>Working Hours:</span>
                <span className="text-slate-200">{doc.workingHours}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-1">
              <div className="flex gap-1">
                {doc.availabilityDays.map((d) => (
                  <span key={d} className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[9px]">
                    {d}
                  </span>
                ))}
              </div>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  doc.status === 'On Duty'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
              >
                {doc.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

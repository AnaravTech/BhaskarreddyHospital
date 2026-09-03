import React from 'react';
import {
  User,
  Phone,
  HeartPulse,
  Calendar,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

export const PatientCard = ({ patient, onSelect, onAction, compact = false }) => {
  if (!patient) return null;

  return (
    <div
      onClick={() => onSelect && onSelect(patient)}
      className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/40 hover:bg-slate-800/60 transition-all duration-200 cursor-pointer group shadow-sm flex flex-col justify-between"
    >
      <div>
        {/* Top bar with UHID & Status */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span className="font-mono text-[11px] font-semibold text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded">
            {patient.uhid}
          </span>
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
              patient.status === 'Active' || patient.status === 'Admitted'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {patient.status || 'Active'}
          </span>
        </div>

        {/* Patient Name & Demographics */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-950 border border-slate-700 flex items-center justify-center shrink-0 text-slate-300 group-hover:border-cyan-500/50 group-hover:text-cyan-300 transition">
            <User className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-bold text-slate-100 group-hover:text-cyan-300 transition truncate">
              {patient.name}
            </h4>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
              <span>{patient.age} yrs</span>
              <span>•</span>
              <span>{patient.gender}</span>
              {patient.bloodGroup && (
                <>
                  <span>•</span>
                  <span className="font-semibold text-rose-400">{patient.bloodGroup}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Details & Contacts */}
        <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1.5 text-xs text-slate-300">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-500 flex items-center gap-1">
              <Phone className="w-3 h-3" /> Contact
            </span>
            <span className="font-mono text-slate-300">{patient.phone}</span>
          </div>

          {patient.allergies && patient.allergies.length > 0 && patient.allergies[0] !== 'None' && (
            <div className="flex items-center gap-1.5 text-[11px] text-amber-400 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">
              <AlertTriangle className="w-3 h-3 shrink-0" />
              <span className="truncate">Allergy: {patient.allergies.join(', ')}</span>
            </div>
          )}

          {patient.insuranceDetails?.policyNumber && (
            <div className="flex items-center gap-1.5 text-[10px] text-cyan-300 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">
              <ShieldCheck className="w-3 h-3 shrink-0 text-cyan-400" />
              <span className="truncate">{patient.insuranceDetails.tpaName || 'TPA Covered'}</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      {!compact && (
        <div className="mt-3 pt-2.5 flex items-center justify-between text-xs text-cyan-400 font-medium group-hover:translate-x-0.5 transition-transform">
          <span className="text-[11px]">View Medical Record</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      )}
    </div>
  );
};

export default PatientCard;

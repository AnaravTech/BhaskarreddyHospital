import React from 'react';
import { mockPatientMovementLogs } from '../data/mockData';
import { GitCommit, ArrowRight } from 'lucide-react';
export const PatientMovementModule = () => {
    return (<div className="space-y-6 pb-12">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              Audit Telemetry Log
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-white mt-1">Patient Movement & Internal Transfer Log</h2>
          <p className="text-xs text-slate-400">
            Immutable tracking from Emergency → Observation → Ward → ICU → Room Transfer → Discharge.
          </p>
        </div>
      </div>

      {/* Movement Logs List */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-4">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <GitCommit className="w-4 h-4 text-cyan-400"/>
          Timestamped Movement Audit Trail
        </h3>

        <div className="space-y-3">
          {mockPatientMovementLogs.map((log) => (<div key={log.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-100 text-sm">{log.patientName}</span>
                  <span className="font-mono text-xs text-cyan-400 font-bold px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/30 rounded">
                    {log.patientUhid}
                  </span>
                </div>
                <div className="text-xs text-slate-300 flex items-center gap-2 font-mono">
                  <span className="text-amber-400">{log.fromLocation}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-cyan-400"/>
                  <span className="text-emerald-400 font-bold">{log.toLocation}</span>
                </div>
                <p className="text-[11px] text-slate-400 italic">Reason: {log.reason}</p>
              </div>

              <div className="text-right text-xs space-y-1">
                <div className="font-mono text-slate-400 text-[10px]">{log.timestamp}</div>
                <div className="text-slate-300 text-[11px] font-medium">Auth: {log.authorizedBy}</div>
              </div>
            </div>))}
        </div>
      </div>
    </div>);
};

export const PatientMovement = PatientMovementModule;
export default PatientMovementModule;

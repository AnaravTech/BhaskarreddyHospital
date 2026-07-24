import React from 'react';
import { useHospital } from '../../context/HospitalContext';
import { Sparkles } from 'lucide-react';

export const HousekeepingModule: React.FC = () => {
  const { housekeepingTasks, updateHousekeepingStatus } = useHospital();

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Sanitation & Hygiene Protocol
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-white mt-1">Floor-Wise Housekeeping & Room Readiness</h2>
          <p className="text-xs text-slate-400">
            Real-time room disinfection status, linen turnover, and staff sanitation allocation.
          </p>
        </div>
      </div>

      {/* Housekeeping Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {housekeepingTasks.map((task) => (
          <div
            key={task.id}
            className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 transition flex flex-col justify-between space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-100">{task.roomOrBed}</div>
                  <div className="text-[10px] text-slate-400">
                    {task.ward} • {task.floor}
                  </div>
                </div>
              </div>

              <span
                className={`px-2.5 py-0.5 text-[10px] font-bold rounded border ${
                  task.status === 'Completed' || task.status === 'Inspected'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                }`}
              >
                {task.status}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
              <div>
                <span className="text-slate-400">Task Type:</span>{' '}
                <span className="font-semibold text-slate-200">{task.taskType}</span>
              </div>
              <div>
                <span className="text-slate-400">Assigned Staff:</span>{' '}
                <span className="font-semibold text-cyan-400">{task.assignedStaff}</span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono">Requested: {task.requestedTime}</div>
            </div>

            <div className="flex items-center justify-between pt-1 text-xs">
              <span className="text-rose-400 font-bold text-[10px]">Priority: {task.priority}</span>
              {task.status !== 'Inspected' && (
                <button
                  onClick={() => updateHousekeepingStatus(task.id, 'Inspected')}
                  className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] transition"
                >
                  Mark Inspected & Ready
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

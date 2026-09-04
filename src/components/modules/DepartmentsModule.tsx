import React from 'react';
import { mockDepartments } from '../../data/mockData';
import { Briefcase, BedDouble, DoorOpen } from 'lucide-react';

export const DepartmentsModule: React.FC = () => {
  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              Specialty Divisions
            </span>
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
              👁️ View Only Access
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-white mt-1">Medical Departments Overview</h2>
          <p className="text-xs text-slate-400">
            Specialty heads, assigned OPD consultation rooms, and ward bed allocations across all clinical divisions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockDepartments.map((dept) => (
          <div
            key={dept.id}
            className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 transition space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">{dept.name}</h3>
                  <span className="font-mono text-[10px] text-cyan-400 font-bold">{dept.code}</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div>
                <span className="text-slate-400">Department Head:</span>
                <div className="font-bold text-slate-200">{dept.headDoctor}</div>
              </div>
              <div className="flex justify-between border-t border-slate-800 pt-2 text-[11px]">
                <span className="text-slate-400 flex items-center gap-1">
                  <DoorOpen className="w-3.5 h-3.5 text-cyan-400" /> Room: {dept.opdRoom}
                </span>
                <span className="text-slate-400 flex items-center gap-1">
                  <BedDouble className="w-3.5 h-3.5 text-purple-400" /> {dept.totalBeds} Beds
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Active Consultants:</span>
              <span className="font-bold text-cyan-400">{dept.activeDoctorsCount} Specialists</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

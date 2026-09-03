import React from 'react';
import { useHospital } from '../context/HospitalContext';
import { Building2, BedDouble } from 'lucide-react';
export const IPDModule = () => {
    const { admissions, setActiveModule } = useHospital();
    return (<div className="space-y-6 pb-12">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/30">
              Inpatient Management
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-white mt-1">IPD Inpatient Admissions & Discharge</h2>
          <p className="text-xs text-slate-400">
            Admission workflow, deposit balances, attending doctor rounds, and final discharge summaries.
          </p>
        </div>

        <button onClick={() => setActiveModule('bed-management')} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition shadow-md">
          <BedDouble className="w-4 h-4"/>
          <span>Allocate Bed & Admit</span>
        </button>
      </div>

      {/* Inpatients Table */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-4">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-purple-400"/>
          Currently Admitted Inpatients ({admissions.length})
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Admission ID</th>
                <th className="py-2.5 px-3">Patient Details</th>
                <th className="py-2.5 px-3">Bed & Location</th>
                <th className="py-2.5 px-3">Attending Doctor</th>
                <th className="py-2.5 px-3">Diagnosis</th>
                <th className="py-2.5 px-3">Advance Deposit</th>
                <th className="py-2.5 px-3">Estimated Bill</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {admissions.map((adm) => (<tr key={adm.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-3 font-mono font-bold text-purple-400">{adm.admissionId}</td>
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-100">{adm.patientName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      UHID: {adm.patientUhid} • {adm.gender}, {adm.age} yrs
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-bold text-cyan-400 font-mono">{adm.bedNumber}</div>
                    <div className="text-[10px] text-slate-400">
                      {adm.wardName} ({adm.floor})
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-200">{adm.attendingDoctor}</div>
                    <div className="text-[10px] text-slate-400">{adm.departmentName}</div>
                  </td>
                  <td className="py-3 px-3 text-slate-300 max-w-xs">{adm.diagnosis}</td>
                  <td className="py-3 px-3 font-mono font-bold text-emerald-400">
                    ₹{adm.depositAmount.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-slate-200">
                    ₹{adm.totalEstimatedBill.toLocaleString()}
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded">
                      {adm.status}
                    </span>
                  </td>
                </tr>))}
            </tbody>
          </table>
        </div>
      </div>
    </div>);
};

export const IPD = IPDModule;
export default IPDModule;

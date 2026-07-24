import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import type { EmergencyCase } from '../../types';
import { Siren, Plus } from 'lucide-react';

export const EmergencyModule: React.FC = () => {
  const { emergencyCases, addEmergencyCase } = useHospital();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    patientName: '',
    age: '',
    gender: 'Male',
    triagePriority: 'Red - Critical' as EmergencyCase['triagePriority'],
    chiefComplaint: '',
    assignedDoctor: 'Dr. Sameer Khan',
    assignedBed: 'EMR-BAY-02',
    medicoLegalCase: false,
    status: 'Under Resuscitation' as EmergencyCase['status'],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patientName) return;

    addEmergencyCase({
      patientName: formData.patientName,
      age: Number(formData.age) || 30,
      gender: formData.gender,
      triagePriority: formData.triagePriority,
      chiefComplaint: formData.chiefComplaint || 'Acute Trauma / Chest Pain',
      arrivalTime: 'Just now',
      assignedDoctor: formData.assignedDoctor,
      assignedBed: formData.assignedBed,
      medicoLegalCase: formData.medicoLegalCase,
      status: formData.status,
    });

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse">
              24/7 Trauma Command
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-white mt-1">Emergency Triage & Resuscitation Bay</h2>
          <p className="text-xs text-slate-400">
            Red/Yellow/Green priority triage, Medico-Legal Case (MLC) logging, and instant ICU transfer.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition animate-bounce"
        >
          <Plus className="w-4 h-4" />
          <span>+ Emergency Registration</span>
        </button>
      </div>

      {/* Triage Priority Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Priority RED (Critical) */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-rose-500/40 space-y-3">
          <div className="flex items-center justify-between border-b border-rose-500/30 pb-2">
            <h3 className="text-sm font-bold text-rose-300 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
              Priority RED (Critical / Resuscitative)
            </h3>
            <span className="text-xs font-mono text-rose-400 font-bold">Immediate</span>
          </div>

          <div className="space-y-3">
            {emergencyCases
              .filter((c) => c.triagePriority.startsWith('Red'))
              .map((emg) => (
                <div key={emg.id} className="p-4 rounded-xl bg-slate-950 border border-rose-500/30 space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-slate-100 text-sm">{emg.patientName}</span>
                    <span className="text-[10px] font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30">
                      {emg.caseNo}
                    </span>
                  </div>
                  <p className="text-xs text-rose-200">{emg.chiefComplaint}</p>
                  <div className="text-[10px] text-slate-400 font-mono flex justify-between pt-1 border-t border-slate-800">
                    <span>Bed: {emg.assignedBed}</span>
                    <span>Lead: {emg.assignedDoctor}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Priority YELLOW (Urgent) */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-amber-500/40 space-y-3">
          <div className="flex items-center justify-between border-b border-amber-500/30 pb-2">
            <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              Priority YELLOW (Urgent Care)
            </h3>
            <span className="text-xs font-mono text-amber-400 font-bold">&lt; 15 Mins</span>
          </div>

          <div className="space-y-3">
            {emergencyCases
              .filter((c) => c.triagePriority.startsWith('Yellow'))
              .map((emg) => (
                <div key={emg.id} className="p-4 rounded-xl bg-slate-950 border border-amber-500/30 space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-slate-100 text-sm">{emg.patientName}</span>
                    <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                      {emg.caseNo}
                    </span>
                  </div>
                  <p className="text-xs text-amber-200">{emg.chiefComplaint}</p>

                  {emg.medicoLegalCase && (
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 inline-block">
                      ⚖️ Medico-Legal Case (MLC Registered)
                    </span>
                  )}

                  <div className="text-[10px] text-slate-400 font-mono flex justify-between pt-1 border-t border-slate-800">
                    <span>Bed: {emg.assignedBed}</span>
                    <span>Lead: {emg.assignedDoctor}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Priority GREEN (Non-Urgent) */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-emerald-500/40 space-y-3">
          <div className="flex items-center justify-between border-b border-emerald-500/30 pb-2">
            <h3 className="text-sm font-bold text-emerald-300 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              Priority GREEN (Minor Trauma / OPD Shift)
            </h3>
            <span className="text-xs font-mono text-emerald-400 font-bold">&lt; 60 Mins</span>
          </div>

          <div className="p-8 text-center text-xs text-slate-500 italic">
            No green priority patients pending triage. All minor trauma triaged to OPD bays.
          </div>
        </div>
      </div>

      {/* Registration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-rose-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-rose-300 flex items-center gap-2">
                <Siren className="w-5 h-5 text-rose-400" />
                Rapid Emergency Triage Entry
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Patient Name *</label>
                <input
                  type="text"
                  placeholder="Patient Name or Unknown/Unidentified Male"
                  value={formData.patientName}
                  onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Triage Priority</label>
                <select
                  value={formData.triagePriority}
                  onChange={(e: any) => setFormData({ ...formData, triagePriority: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-bold text-rose-400"
                >
                  <option value="Red - Critical">Red - Critical (Immediate Resuscitation)</option>
                  <option value="Yellow - Urgent">Yellow - Urgent (Trauma / Laceration)</option>
                  <option value="Green - Non-Urgent">Green - Non-Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Chief Complaint</label>
                <input
                  type="text"
                  placeholder="e.g. Chest pain, RTA, Laceration"
                  value={formData.chiefComplaint}
                  onChange={(e) => setFormData({ ...formData, chiefComplaint: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="mlc"
                  checked={formData.medicoLegalCase}
                  onChange={(e) => setFormData({ ...formData, medicoLegalCase: e.target.checked })}
                  className="rounded border-slate-800"
                />
                <label htmlFor="mlc" className="text-slate-300 font-bold">
                  Mark as Medico-Legal Case (MLC Police Intimation Required)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 text-white font-bold"
                >
                  Confirm Triage Admission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

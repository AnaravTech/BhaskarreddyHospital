import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import type { Bed } from '../../types';
import {
  BedDouble,
  CheckCircle2,
  User,
  ArrowRightLeft,
  UserPlus,
  X as XIcon,
  ShieldAlert,
} from 'lucide-react';

export const BedManagementModule: React.FC = () => {
  const { beds, updateBedStatus, addToast, doctors, currentUser } = useHospital();

  const isReceptionist = currentUser?.role === 'receptionist';

  const [selectedFloor, setSelectedFloor] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  // Transfer Bed Modal State
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [sourceBed, setSourceBed] = useState<Bed | null>(null);
  const [targetBedId, setTargetBedId] = useState('');

  // Admit Patient Modal State
  const [admitModalOpen, setAdmitModalOpen] = useState(false);
  const [selectedBedForAdmission, setSelectedBedForAdmission] = useState<Bed | null>(null);
  const [patientName, setPatientName] = useState('');
  const [patientId, setPatientId] = useState('');
  const [doctorName, setDoctorName] = useState('Dr. Vikram Reddy');

  const floors = ['All', '1st Floor', '2nd Floor', '3rd Floor', '4th Floor'];
  const bedTypes = ['All', 'ICU', 'Private', 'General', 'Isolation'];
  const statuses = ['All', 'Available', 'Occupied', 'Cleaning', 'Reserved', 'Maintenance'];

  const filteredBeds = beds.filter((b) => {
    const matchFloor = selectedFloor === 'All' || b.floor === selectedFloor;
    const matchType = selectedType === 'All' || b.bedType === selectedType;
    const matchStatus = selectedStatus === 'All' || b.status === selectedStatus;
    return matchFloor && matchType && matchStatus;
  });

  const getStatusBadge = (status: Bed['status']) => {
    switch (status) {
      case 'Available':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'Occupied':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'Cleaning':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'Reserved':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Maintenance':
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  const openAdmitModal = (bed: Bed) => {
    setSelectedBedForAdmission(bed);
    setPatientName(bed.patientName || '');
    setPatientId(bed.patientUhid || `BRH-2026-${Math.floor(1000 + Math.random() * 9000)}`);
    setDoctorName(bed.attendingDoctor || (doctors.length > 0 ? doctors[0].name : 'Dr. Vikram Reddy'));
    setAdmitModalOpen(true);
  };

  const handleExecuteAdmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBedForAdmission || !patientName || !patientId || !doctorName) return;

    updateBedStatus(
      selectedBedForAdmission.id,
      'Occupied',
      patientId,
      patientName,
      patientId,
      doctorName
    );

    addToast(
      'Patient Admitted Successfully',
      `Allocated ${selectedBedForAdmission.bedNumber} (${selectedBedForAdmission.wardName}) to ${patientName} under ${doctorName}`,
      'success'
    );

    setAdmitModalOpen(false);
    setSelectedBedForAdmission(null);
  };

  const handleExecuteTransfer = () => {
    if (!sourceBed || !targetBedId) return;
    const targetBed = beds.find((b) => b.id === targetBedId);
    if (!targetBed) return;

    // Clear source bed & occupy target bed
    updateBedStatus(sourceBed.id, 'Available');
    updateBedStatus(
      targetBed.id,
      'Occupied',
      sourceBed.patientId,
      sourceBed.patientName,
      sourceBed.patientUhid,
      sourceBed.attendingDoctor
    );

    addToast(
      'Bed Transfer Completed',
      `Shifted ${sourceBed.patientName} from ${sourceBed.bedNumber} to ${targetBed.bedNumber}`,
      'success'
    );

    setTransferModalOpen(false);
    setSourceBed(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              Floor-Wise Telemetry Map
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-white mt-1">Ward & Bed Occupancy Grid</h2>
          <p className="text-xs text-slate-400">
            Real-time interactive floor map, status toggles, and instant bed transfer engine.
          </p>
        </div>

        {/* Live Counters */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            <span className="text-slate-400">Total Capacity: </span>
            <span className="font-extrabold text-white">{beds.length} Beds</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            <span className="text-slate-400">Occupied: </span>
            <span className="font-extrabold text-rose-400">
              {beds.filter((b) => b.status === 'Occupied').length}
            </span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            <span className="text-slate-400">Vacant Ready: </span>
            <span className="font-extrabold text-emerald-400">
              {beds.filter((b) => b.status === 'Available').length}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
        {/* Floor Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">Floor:</span>
          <div className="flex flex-wrap gap-1">
            {floors.map((f) => (
              <button
                key={f}
                onClick={() => setSelectedFloor(f)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  selectedFloor === f
                    ? 'bg-cyan-600 text-white'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Type & Status Filters */}
        <div className="flex items-center gap-3">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200"
          >
            {bedTypes.map((t) => (
              <option key={t} value={t}>
                {t === 'All' ? 'All Ward Types' : `${t} Wards`}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200"
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s === 'All' ? 'All Statuses' : s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bed Visualization Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredBeds.map((bed) => (
          <div
            key={bed.id}
            className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 hover:border-slate-700 transition flex flex-col justify-between space-y-3 relative group"
          >
            {/* Card Top */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center">
                  <BedDouble className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <div className="text-xs font-black text-slate-100">{bed.bedNumber}</div>
                  <div className="text-[10px] text-slate-400">{bed.wardName}</div>
                </div>
              </div>

              <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${getStatusBadge(bed.status)}`}>
                {bed.status}
              </span>
            </div>

            {/* Bed Patient Body */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 text-xs">
              {bed.status === 'Occupied' ? (
                <div className="space-y-1">
                  <div className="font-bold text-slate-100 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-cyan-400" />
                    {bed.patientName}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">UHID: {bed.patientUhid}</div>
                  <div className="text-[10px] text-slate-400">Doctor: {bed.attendingDoctor}</div>
                </div>
              ) : (
                <div className="text-slate-500 italic text-[11px]">
                  {bed.status === 'Available'
                    ? 'Sanitized & Ready for Admission'
                    : bed.status === 'Cleaning'
                    ? 'Housekeeping In Progress...'
                    : 'Maintenance Underway'}
                </div>
              )}
            </div>

            {/* Bed Action Bar */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[10px]">
              <span className="text-slate-400 font-mono font-semibold">₹{bed.dailyRate.toLocaleString()}/day</span>

              {!isReceptionist && (
                <div className="flex items-center gap-1.5">
                  {bed.status === 'Occupied' && (
                    <button
                      onClick={() => {
                        setSourceBed(bed);
                        setTransferModalOpen(true);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold flex items-center gap-1 transition"
                    >
                      <ArrowRightLeft className="w-3 h-3" />
                      <span>Transfer</span>
                    </button>
                  )}

                  {bed.status === 'Cleaning' && (
                    <button
                      onClick={() => updateBedStatus(bed.id, 'Available')}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-semibold flex items-center gap-1 transition"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Mark Ready</span>
                    </button>
                  )}

                  {bed.status !== 'Occupied' && (
                    <select
                      onChange={(e) => updateBedStatus(bed.id, e.target.value as Bed['status'])}
                      value={bed.status}
                      className="bg-slate-950 text-slate-300 rounded-lg border border-slate-800 text-[10px] px-1.5 py-1"
                    >
                      <option value="Available">Available</option>
                      <option value="Reserved">Reserved</option>
                      <option value="Cleaning">Cleaning</option>
                      <option value="Maintenance">Maintenance</option>
                    </select>
                  )}
                </div>
              )}
            </div>

            {/* Admit Patient Action Button - Blocked for Receptionist */}
            {!isReceptionist ? (
              <button
                onClick={() => openAdmitModal(bed)}
                className={`w-full py-1.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 shadow-sm ${
                  bed.status === 'Occupied'
                    ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700'
                    : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-cyan-600/20'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{bed.status === 'Occupied' ? 'Re-assign / Edit Admission' : 'Admit Patient'}</span>
              </button>
            ) : (
              <div className="w-full py-1 px-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60 text-slate-500 text-[10px] flex items-center justify-center gap-1 font-semibold">
                <ShieldAlert className="w-3 h-3 text-cyan-400" />
                <span>Inquiry Only (Admissions via Nursing)</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Admit Patient Pop-up Modal */}
      {admitModalOpen && selectedBedForAdmission && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleExecuteAdmission} className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">Inpatient Admission Allocation</h3>
                  <p className="text-[10px] text-slate-400">Direct Bed Allotment & Clinical Assignment</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAdmitModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Selected Ward Number & Bed Number Information Box */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-cyan-500/30 grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Ward Number / Unit</span>
                <span className="font-bold text-cyan-300 text-xs block mt-0.5">{selectedBedForAdmission.wardName}</span>
                <span className="text-[10px] text-slate-500 font-mono">{selectedBedForAdmission.floor}</span>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Bed Number</span>
                <span className="font-black text-white text-sm block mt-0.5 font-mono">{selectedBedForAdmission.bedNumber}</span>
                <span className="text-[10px] text-amber-400 font-semibold">{selectedBedForAdmission.bedType} • ₹{selectedBedForAdmission.dailyRate}/day</span>
              </div>
            </div>

            {/* Admission Details Form Fields */}
            <div className="space-y-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1 text-[11px]">
                  Patient Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Chandra"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1 text-[11px]">
                  Patient ID / UHID *
                </label>
                <input
                  type="text"
                  placeholder="e.g. BRH-2026-1048"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono font-bold text-cyan-400"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1 text-[11px]">
                  Attending Doctor Name *
                </label>
                <div className="space-y-1.5">
                  <select
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-semibold"
                  >
                    {doctors.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name} ({d.specialization})
                      </option>
                    ))}
                    <option value="Dr. Vikram Reddy">Dr. Vikram Reddy (Chief Interventional Cardiologist)</option>
                    <option value="Dr. Ramesh Kumar">Dr. Ramesh Kumar (Duty Medical Officer)</option>
                    <option value="Dr. Rajan Pillai">Dr. Rajan Pillai (Senior Orthopaedic Surgeon)</option>
                    <option value="Dr. Asha Nair">Dr. Asha Nair (Consultant Gynaecologist)</option>
                    <option value="Dr. Sameer Khan">Dr. Sameer Khan (Trauma & Emergency Lead)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setAdmitModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-cyan-600/30 transition active:scale-95"
              >
                Confirm Admission
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Bed Transfer Modal */}
      {transferModalOpen && sourceBed && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-cyan-400" />
                Inter-Ward Patient Transfer
              </h3>
              <button onClick={() => setTransferModalOpen(false)} className="text-slate-400">
                ✕
              </button>
            </div>

            <div className="text-xs space-y-3">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-slate-400">Current Patient Location:</div>
                <div className="font-bold text-slate-100">{sourceBed.patientName}</div>
                <div className="text-[10px] text-slate-400 font-mono">
                  From: {sourceBed.bedNumber} ({sourceBed.wardName})
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Select Destination Available Bed</label>
                <select
                  value={targetBedId}
                  onChange={(e) => setTargetBedId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                >
                  <option value="">-- Choose Vacant Bed --</option>
                  {beds
                    .filter((b) => b.status === 'Available' && b.id !== sourceBed.id)
                    .map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.bedNumber} ({b.wardName} • {b.floor}) - ₹{b.dailyRate}/day
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setTransferModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExecuteTransfer}
                  disabled={!targetBedId}
                  className="px-5 py-2 rounded-xl bg-cyan-600 disabled:opacity-50 text-white font-bold"
                >
                  Confirm Transfer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

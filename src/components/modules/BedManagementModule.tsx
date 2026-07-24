import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import type { Bed } from '../../types';
import {
  BedDouble,
  CheckCircle2,
  User,
  ArrowRightLeft,
} from 'lucide-react';

export const BedManagementModule: React.FC = () => {
  const { beds, updateBedStatus, addToast } = useHospital();

  const [selectedFloor, setSelectedFloor] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  // Transfer Bed Modal State
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [sourceBed, setSourceBed] = useState<Bed | null>(null);
  const [targetBedId, setTargetBedId] = useState('');

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
      sourceBed.patientUhid
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
              <span className="text-slate-400 font-mono">₹{bed.dailyRate.toLocaleString()}/day</span>

              <div className="flex items-center gap-1">
                {bed.status === 'Occupied' && (
                  <button
                    onClick={() => {
                      setSourceBed(bed);
                      setTransferModalOpen(true);
                    }}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold flex items-center gap-1 transition"
                  >
                    <ArrowRightLeft className="w-3 h-3" />
                    <span>Transfer</span>
                  </button>
                )}

                {bed.status === 'Cleaning' && (
                  <button
                    onClick={() => updateBedStatus(bed.id, 'Available')}
                    className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 font-semibold flex items-center gap-1 transition"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Mark Ready</span>
                  </button>
                )}

                {bed.status === 'Available' && (
                  <select
                    onChange={(e) => updateBedStatus(bed.id, e.target.value as Bed['status'])}
                    value={bed.status}
                    className="bg-slate-950 text-slate-300 rounded border border-slate-800 text-[10px] px-1 py-0.5"
                  >
                    <option value="Available">Available</option>
                    <option value="Reserved">Reserved</option>
                    <option value="Cleaning">Cleaning</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

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

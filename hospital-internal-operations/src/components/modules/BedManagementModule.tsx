import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import type { Bed } from '../../types';
import {
  BedDouble,
  CheckCircle2,
  User,
  ArrowRightLeft,
  Plus,
  Edit3,
  Trash2,
  X as XIcon,
} from 'lucide-react';

export const BedManagementModule: React.FC = () => {
  const { beds, updateBedStatus, addToast, currentUser } = useHospital();

  const isAdminOrBedManager = currentUser?.role === 'admin' || currentUser?.role === 'bed-manager';

  const [bedsList, setBedsList] = useState<Bed[]>(beds);

  const [selectedFloor, setSelectedFloor] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  // Transfer Bed Modal State
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [sourceBed, setSourceBed] = useState<Bed | null>(null);
  const [targetBedId, setTargetBedId] = useState('');

  // Add / Edit Bed Modal State
  const [isBedModalOpen, setIsBedModalOpen] = useState(false);
  const [editingBedId, setEditingBedId] = useState<string | null>(null);
  const [bedNo, setBedNo] = useState('');
  const [wardName, setWardName] = useState('');
  const [floor, setFloor] = useState('2nd Floor');
  const [bedType, setBedType] = useState<'ICU' | 'Private' | 'Semi-Private' | 'General'>('ICU');
  const [dailyRate, setDailyRate] = useState('7500');

  const floors = ['All', '1st Floor', '2nd Floor', '3rd Floor', '4th Floor'];
  const bedTypes = ['All', 'ICU', 'Private', 'General', 'Isolation'];
  const statuses = ['All', 'Available', 'Occupied', 'Cleaning', 'Reserved', 'Maintenance'];

  const filteredBeds = bedsList.filter((b) => {
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

  const openAddBedModal = () => {
    setEditingBedId(null);
    setBedNo('');
    setWardName('Deluxe Ward Suite');
    setFloor('2nd Floor');
    setBedType('Private');
    setDailyRate('4500');
    setIsBedModalOpen(true);
  };

  const openEditBedModal = (bed: Bed) => {
    setEditingBedId(bed.id);
    setBedNo(bed.bedNumber);
    setWardName(bed.wardName);
    setFloor(bed.floor);
    setBedType(bed.bedType as any);
    setDailyRate(bed.dailyRate.toString());
    setIsBedModalOpen(true);
  };

  const handleSaveBed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bedNo || !wardName) return;

    if (editingBedId) {
      setBedsList((prev) =>
        prev.map((b) =>
          b.id === editingBedId
            ? {
                ...b,
                bedNumber: bedNo,
                wardName,
                floor,
                bedType,
                dailyRate: Number(dailyRate) || 3500,
              }
            : b
        )
      );
      addToast('Bed Configuration Updated', `Modified bed details for ${bedNo}`, 'success');
    } else {
      const newBed: Bed = {
        id: `bed-${Date.now()}`,
        bedNumber: bedNo,
        wardId: `ward-${Date.now()}`,
        wardName,
        floor,
        bedType,
        status: 'Available',
        dailyRate: Number(dailyRate) || 3500,
      };
      setBedsList((prev) => [...prev, newBed]);
      addToast('New Bed Commissioned', `Added new bed ${bedNo} (${wardName}) to floor grid`, 'success');
    }

    setIsBedModalOpen(false);
  };

  const handleDeleteBed = (id: string, bedNumber: string) => {
    if (confirm(`Decommission and delete bed "${bedNumber}" from inventory?`)) {
      setBedsList((prev) => prev.filter((b) => b.id !== id));
      addToast('Bed Decommissioned', `Removed bed ${bedNumber} from hospital inventory`, 'warning');
    }
  };

  const handleExecuteTransfer = () => {
    if (!sourceBed || !targetBedId) return;
    const targetBed = bedsList.find((b) => b.id === targetBedId);
    if (!targetBed) return;

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
    <div className="space-y-6 pb-12 font-sans">
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
            Real-time interactive floor map, status toggles, and admin bed commissioning CRUD engine.
          </p>
        </div>

        {/* Action Button & Live Counters */}
        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
          {isAdminOrBedManager && (
            <button
              onClick={openAddBedModal}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md shadow-amber-600/30"
            >
              <Plus className="w-4 h-4" /> + Add New Bed / Ward
            </button>
          )}

          <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            <span className="text-slate-400">Total: </span>
            <span className="font-extrabold text-white">{bedsList.length} Beds</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            <span className="text-slate-400">Occupied: </span>
            <span className="font-extrabold text-rose-400">
              {bedsList.filter((b) => b.status === 'Occupied').length}
            </span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            <span className="text-slate-400">Vacant: </span>
            <span className="font-extrabold text-emerald-400">
              {bedsList.filter((b) => b.status === 'Available').length}
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
                    ? 'bg-cyan-600 text-white font-bold'
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

              <div className="flex items-center gap-1.5">
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${getStatusBadge(bed.status)}`}>
                  {bed.status}
                </span>

                {isAdminOrBedManager && (
                  <div className="flex items-center gap-1 opacity-80 hover:opacity-100">
                    <button
                      onClick={() => openEditBedModal(bed)}
                      title="Modify Bed Configuration"
                      className="p-1 rounded bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleDeleteBed(bed.id, bed.bedNumber)}
                      title="Delete / Decommission Bed"
                      className="p-1 rounded bg-slate-950 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-slate-800"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
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

      {/* Add / Edit Bed Modal */}
      {isBedModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleSaveBed} className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm">
                {editingBedId ? 'Modify Bed Configuration' : 'Commission New Hospital Bed'}
              </h3>
              <button type="button" onClick={() => setIsBedModalOpen(false)} className="text-slate-400 hover:text-white">
                <XIcon className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Bed Code / Number *</label>
              <input
                type="text"
                placeholder="e.g. ICU-103 or PVT-304"
                value={bedNo}
                onChange={(e) => setBedNo(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-cyan-400 font-mono font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Ward Name *</label>
              <input
                type="text"
                placeholder="e.g. Cardiac ICU Suite"
                value={wardName}
                onChange={(e) => setWardName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-bold"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Floor Location</label>
                <select
                  value={floor}
                  onChange={(e) => setFloor(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                >
                  <option value="1st Floor">1st Floor</option>
                  <option value="2nd Floor">2nd Floor</option>
                  <option value="3rd Floor">3rd Floor</option>
                  <option value="4th Floor">4th Floor</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Ward Type</label>
                <select
                  value={bedType}
                  onChange={(e) => setBedType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                >
                  <option value="ICU">ICU</option>
                  <option value="Private">Private</option>
                  <option value="Semi-Private">Semi-Private</option>
                  <option value="General">General</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Daily Bed Rate (₹)</label>
              <input
                type="number"
                placeholder="4500"
                value={dailyRate}
                onChange={(e) => setDailyRate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono font-bold"
              />
            </div>

            <button type="submit" className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold">
              {editingBedId ? 'Save Changes' : 'Commission Bed'}
            </button>
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
                  {bedsList
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

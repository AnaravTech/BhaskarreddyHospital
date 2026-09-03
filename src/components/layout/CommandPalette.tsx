import React, { useState, useEffect } from 'react';
import { useHospital } from '../../context/HospitalContext';
import type { ModuleType } from '../../types';
import {
  Search,
  Users,
  UserCheck,
  BedDouble,
  Receipt,
  FileCheck2,
  X,
  ArrowRight,
} from 'lucide-react';

export const CommandPalette: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    patients,
    doctors,
    beds,
    invoices,
    setActiveModule,
    getPermission,
  } = useHospital();

  const [query, setQuery] = useState('');

  // Keyboard shortcut listener (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(!isCommandPaletteOpen);
      }
      if (e.key === 'Escape' && isCommandPaletteOpen) {
        setIsCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setIsCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const filteredPatients = getPermission('patients') === 'HIDDEN'
    ? []
    : query
    ? patients.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.uhid.toLowerCase().includes(query.toLowerCase()) ||
          p.phone.includes(query)
      )
    : patients.slice(0, 3);

  const filteredDoctors = getPermission('doctors') === 'HIDDEN'
    ? []
    : query
    ? doctors.filter(
        (d) =>
          d.name.toLowerCase().includes(query.toLowerCase()) ||
          d.specialization.toLowerCase().includes(query.toLowerCase())
      )
    : doctors.slice(0, 3);

  const filteredBeds = getPermission('bed-management') === 'HIDDEN'
    ? []
    : query
    ? beds.filter(
        (b) =>
          b.bedNumber.toLowerCase().includes(query.toLowerCase()) ||
          b.wardName.toLowerCase().includes(query.toLowerCase())
      )
    : beds.filter((b) => b.status === 'Occupied').slice(0, 3);

  const filteredInvoices = getPermission('billing') === 'HIDDEN'
    ? []
    : query
    ? invoices.filter(
        (inv) =>
          inv.invoiceNo.toLowerCase().includes(query.toLowerCase()) ||
          inv.patientName.toLowerCase().includes(query.toLowerCase())
      )
    : invoices.slice(0, 2);

  const allActions: { label: string; module: ModuleType; icon: React.ElementType }[] = [
    { label: 'Register New Walk-in Patient', module: 'reception', icon: Users },
    { label: 'View Interactive Bed Occupancy Map', module: 'bed-management', icon: BedDouble },
    { label: 'Generate Billing & Multi-Payment Split', module: 'billing', icon: Receipt },
    { label: 'View Emergency Triage Bay', module: 'emergency', icon: FileCheck2 },
  ];
  const quickActions = allActions.filter((act) => getPermission(act.module) !== 'HIDDEN');

  const handleSelectModule = (module: ModuleType) => {
    if (getPermission(module) === 'HIDDEN') return;
    setActiveModule(module);
    setIsCommandPaletteOpen(false);
    setQuery('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-start justify-center pt-20 px-4">
      <div
        className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-cyan-400 shrink-0" />
          <input
            type="text"
            placeholder="Type a command, patient name, UHID, doctor, or bill..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
            autoFocus
          />
          <button
            onClick={() => setIsCommandPaletteOpen(false)}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Command Search Results */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {/* Quick Actions */}
          {!query && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                Quick Shortcuts
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {quickActions.map((action, i) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={i}
                      onClick={() => handleSelectModule(action.module)}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 hover:border-cyan-500/50 text-left transition group"
                    >
                      <div className="flex items-center gap-2.5 text-xs text-slate-200 font-medium">
                        <Icon className="w-4 h-4 text-cyan-400" />
                        <span>{action.label}</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Patient Results */}
          {filteredPatients.length > 0 && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-cyan-400" />
                Patients Directory ({filteredPatients.length})
              </div>
              <div className="space-y-1">
                {filteredPatients.map((patient) => (
                  <div
                    key={patient.id}
                    onClick={() => handleSelectModule('patients')}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/40 hover:bg-slate-800/80 border border-slate-800/60 cursor-pointer transition"
                  >
                    <div>
                      <div className="text-xs font-semibold text-slate-200">{patient.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        UHID: {patient.uhid} • {patient.gender}, {patient.age} yrs • {patient.phone}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 text-[10px] rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                      {patient.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Doctor Results */}
          {filteredDoctors.length > 0 && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                Doctors & Consultants ({filteredDoctors.length})
              </div>
              <div className="space-y-1">
                {filteredDoctors.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => handleSelectModule('doctors')}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/40 hover:bg-slate-800/80 border border-slate-800/60 cursor-pointer transition"
                  >
                    <div className="flex items-center gap-3">
                      <img src={doc.image} alt={doc.name} className="w-7 h-7 rounded-full object-cover" />
                      <div>
                        <div className="text-xs font-semibold text-slate-200">{doc.name}</div>
                        <div className="text-[10px] text-slate-400">
                          {doc.specialization} • Fee ₹{doc.consultationFee}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-medium">{doc.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Invoice / Billing Search */}
          {filteredInvoices.length > 0 && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-emerald-400" />
                Billing Invoices
              </div>
              <div className="space-y-1">
                {filteredInvoices.map((inv) => (
                  <div
                    key={inv.id}
                    onClick={() => handleSelectModule('billing')}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/40 hover:bg-slate-800/80 border border-slate-800/60 cursor-pointer transition"
                  >
                    <div>
                      <div className="text-xs font-semibold text-slate-200">{inv.invoiceNo}</div>
                      <div className="text-[10px] text-slate-400">
                        {inv.patientName} • Net Total ₹{inv.netTotal.toLocaleString()}
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-400">{inv.paymentStatus}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bed Occupancy Search */}
          {filteredBeds.length > 0 && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                <BedDouble className="w-3.5 h-3.5 text-purple-400" />
                Ward & Bed Status
              </div>
              <div className="space-y-1">
                {filteredBeds.map((bed) => (
                  <div
                    key={bed.id}
                    onClick={() => handleSelectModule('bed-management')}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/40 hover:bg-slate-800/80 border border-slate-800/60 cursor-pointer transition"
                  >
                    <div>
                      <div className="text-xs font-semibold text-slate-200">
                        {bed.bedNumber} ({bed.wardName})
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Floor: {bed.floor} • Patient: {bed.patientName || 'Vacant'}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 text-[10px] rounded bg-slate-800 text-slate-300">
                      {bed.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-3 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-500 flex justify-between items-center">
          <span>Navigate with mouse or keyboard</span>
          <span>Press ESC to close</span>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { useHospital } from '../../context/HospitalContext';
import type { PatientMovementLog, MovementType } from '../../types';
import {
  GitCommit,
  ArrowRight,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ShieldCheck,
  Lock,
  Printer,
  X,
  Activity,
  Building2,
  Ambulance,
  Ban,
} from 'lucide-react';

const MOVEMENT_TYPES: MovementType[] = [
  'Ward-to-Ward',
  'Emergency-to-ICU',
  'Pre-Op to OT',
  'OT to Recovery / PACU',
  'Diagnostic & Imaging Escort',
  'Dialysis Transit',
  'Inter-Branch Referral',
  'Discharge Transit',
];

const TRANSPORT_MODES = [
  'Stretcher',
  'Wheelchair',
  'Bed-Transfer',
  'Ambulance',
  'Walking Assist',
] as const;

const LIFE_SUPPORT_OPTIONS = [
  'Portable O2 Cylinder (4 L/min)',
  'Transport Cardiac Monitor',
  'IV Infusion / Syringe Pump',
  'Portable Suction Unit',
  'Emergency Airway & Ambu Kit',
  'Defibrillator Standby',
];

export const PatientMovementModule: React.FC = () => {
  const {
    currentUser,
    activeBranch,
    patientMovementLogs,
    addPatientMovement,
    updatePatientMovement,
    cancelPatientMovement,
    patients,
    admissions,
    addToast,
  } = useHospital();

  const role = currentUser?.role?.toLowerCase() || '';
  const isDoctor = role === 'doctor' || role === 'dmo' || role === 'admin' || role === 'ceo';
  const isNurse = role === 'nurse' || role === 'ward_manager';
  
  // Strict Clinical Movement Lockdown: Nurses & Doctors ONLY
  const canManageMovement = isDoctor || isNurse;

  // Search & Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // New Movement Modal State
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [movementType, setMovementType] = useState<MovementType>('Ward-to-Ward');
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [reason, setReason] = useState('');
  const [authorizedBy, setAuthorizedBy] = useState(
    isDoctor ? currentUser?.name || 'Dr. Vikram Reddy' : 'Dr. Vikram Reddy (Attending Consultant)'
  );
  const [escortNurse, setEscortNurse] = useState(
    isNurse ? currentUser?.name || 'Sr. Lakshmi Devi (Staff Nurse)' : 'Sr. Lakshmi Devi (Staff Nurse)'
  );
  const [porterGDA, setPorterGDA] = useState('GDA Ward Porter Ramesh');
  const [transportMode, setTransportMode] = useState<'Stretcher' | 'Wheelchair' | 'Bed-Transfer' | 'Ambulance' | 'Walking Assist'>('Stretcher');
  const [selectedLifeSupport, setSelectedLifeSupport] = useState<string[]>(['Portable O2 Cylinder (4 L/min)']);
  const [handoverNotes, setHandoverNotes] = useState('SBAR Handover: Patient vitals stable on transfer. Airway patent, IV lines patent, catheter clamped.');

  // Handover Receive Sign-off Modal State
  const [handoverLog, setHandoverLog] = useState<PatientMovementLog | null>(null);
  const [receivingNurseSign, setReceivingNurseSign] = useState(
    isNurse ? currentUser?.name || 'Sr. Anitha (Receiving Incharge)' : 'Sr. Anitha (Receiving Incharge)'
  );
  const [receivingNotes, setReceivingNotes] = useState('Patient received in bed. Bed rails up, telemetry monitoring initiated, vitals checked.');

  // Cancel Movement Modal State
  const [cancelModalLog, setCancelModalLog] = useState<PatientMovementLog | null>(null);
  const [cancelReason, setCancelReason] = useState('Patient hemodynamically unstable for transit — bedside procedure ordered.');

  // Printable Transfer Pass Modal State
  const [printSlipLog, setPrintSlipLog] = useState<PatientMovementLog | null>(null);

  // Filtered Movement Logs
  const filteredLogs = useMemo(() => {
    return patientMovementLogs.filter((log) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        log.patientName.toLowerCase().includes(q) ||
        log.patientUhid.toLowerCase().includes(q) ||
        log.fromLocation.toLowerCase().includes(q) ||
        log.toLocation.toLowerCase().includes(q) ||
        log.reason.toLowerCase().includes(q) ||
        (log.escortNurse && log.escortNurse.toLowerCase().includes(q)) ||
        (log.authorizedBy && log.authorizedBy.toLowerCase().includes(q));

      const matchesStatus =
        statusFilter === 'all' ? true : log.status === statusFilter;

      const matchesType =
        typeFilter === 'all' ? true : log.movementType === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [patientMovementLogs, searchTerm, statusFilter, typeFilter]);

  // Statistics Counts
  const stats = useMemo(() => {
    const total = patientMovementLogs.length;
    const inTransit = patientMovementLogs.filter((l) => l.status === 'In Transit').length;
    const completed = patientMovementLogs.filter((l) => l.status === 'Received & Bed Handover Complete').length;
    const scheduled = patientMovementLogs.filter((l) => l.status === 'Scheduled / Initiated').length;
    return { total, inTransit, completed, scheduled };
  }, [patientMovementLogs]);

  // Handlers
  const handleToggleLifeSupport = (opt: string) => {
    if (selectedLifeSupport.includes(opt)) {
      setSelectedLifeSupport(selectedLifeSupport.filter((x) => x !== opt));
    } else {
      setSelectedLifeSupport([...selectedLifeSupport, opt]);
    }
  };

  const handleSelectAdmittedPatient = (patId: string) => {
    setSelectedPatientId(patId);
    const pat = patients.find((p) => p.id === patId);
    const adm = admissions.find((a) => a.patientId === patId || a.patientUhid === pat?.uhid);
    if (adm) {
      setFromLocation(`${adm.wardName} - Bed ${adm.bedNumber} (Floor ${adm.floor})`);
      setAuthorizedBy(adm.attendingDoctor || currentUser?.name || 'Dr. Vikram Reddy');
    } else if (pat) {
      setFromLocation(`Emergency Triage Bay / OPD`);
    }
  };

  const handleSubmitNewMovement = (e: React.FormEvent) => {
    e.preventDefault();
    const pat = patients.find((p) => p.id === selectedPatientId);
    if (!pat) {
      addToast('Patient Required', 'Please select a valid patient for movement.', 'warning');
      return;
    }

    if (!fromLocation.trim() || !toLocation.trim()) {
      addToast('Location Required', 'Please specify both origin and destination locations.', 'warning');
      return;
    }

    addPatientMovement({
      patientId: pat.id,
      patientName: pat.name,
      patientUhid: pat.uhid,
      movementType,
      fromLocation,
      toLocation,
      reason: reason.trim() || 'Clinical internal department transfer',
      authorizedBy: authorizedBy.trim() || (currentUser?.name ? currentUser.name : 'Attending Physician'),
      authorizedRole: isDoctor ? 'Attending Doctor' : 'Charge Nurse',
      escortNurse: escortNurse.trim() || 'Assigned Escort Nurse',
      porterGDA: porterGDA.trim() || 'Ward GDA',
      transportMode,
      lifeSupport: selectedLifeSupport,
      status: 'Scheduled / Initiated',
      handoverNotes: handoverNotes.trim(),
    });

    setShowNewModal(false);
    setSelectedPatientId('');
    setReason('');
    setFromLocation('');
    setToLocation('');
  };

  const handleAdvanceStatus = (log: PatientMovementLog) => {
    if (log.status === 'Scheduled / Initiated') {
      updatePatientMovement(log.id, {
        status: 'In Transit',
        handoverNotes: `${log.handoverNotes || ''} | Transit started with ${log.transportMode || 'Stretcher'}.`,
      });
      addToast('Dispatched In Transit', `${log.patientName} is now in transit with Escort Nurse ${log.escortNurse || 'Staff'}.`, 'info');
    } else if (log.status === 'In Transit') {
      setHandoverLog(log);
    }
  };

  const handleConfirmReceivingHandover = (e: React.FormEvent) => {
    e.preventDefault();
    if (!handoverLog) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    updatePatientMovement(handoverLog.id, {
      status: 'Received & Bed Handover Complete',
      receivingNurseSign: receivingNurseSign.trim() || 'Signed Nurse',
      completedAt: timeStr,
      handoverNotes: `${handoverLog.handoverNotes || ''} | Received by ${receivingNurseSign}: ${receivingNotes}`,
    });

    setHandoverLog(null);
    addToast('Handover Completed', `Bed transfer and clinical handover finalized for ${handoverLog.patientName}.`, 'success');
  };

  const handleConfirmCancelMovement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelModalLog) return;
    cancelPatientMovement(cancelModalLog.id, cancelReason);
    setCancelModalLog(null);
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* 1. Header & Title Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/80 p-6 rounded-2xl border border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" />
              <span>Campus: <strong>{activeBranch.name}</strong></span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5" />
              <span>SBAR Clinical Handover Hub</span>
            </span>
            {canManageMovement ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Full Nurse & Doctor Authorization Active</span>
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" />
                <span>Read-Only Audit Mode</span>
              </span>
            )}
          </div>
          <h2 className="text-2xl font-extrabold text-white mt-1.5 flex items-center gap-2">
            Patient Movement & Clinical Transit Log
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time tracking of Emergency ➡️ OT ➡️ ICU ➡️ Ward transfers, life-support transport telemetry, and SBAR bed handovers.
          </p>
        </div>

        {/* Action Button for Nurses & Doctors */}
        <div>
          {canManageMovement ? (
            <button
              onClick={() => setShowNewModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-extrabold shadow-lg shadow-cyan-900/40 transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Initiate Patient Movement</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 text-xs font-medium">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Movement changes locked to Nurses & Doctors</span>
            </div>
          )}
        </div>
      </div>

      {/* Security Banner if non-nurse/doctor */}
      {!canManageMovement && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <strong className="text-amber-100 block font-bold">🔒 Clinical Movement Authorization Lockdown</strong>
            <span>
              You are viewing the audit log in read-only mode ({currentUser?.roleTitle || currentUser?.role}). Initiating transfers, dispatching in-transit escorts, and signing clinical bed handovers is strictly restricted to Registered Ward Nurses and Attending Doctors.
            </span>
          </div>
        </div>
      )}

      {/* 2. Key Metrics Telemetry Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">Total Transits</span>
            <span className="text-2xl font-black text-white font-mono">{stats.total}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-bold">
            <GitCommit className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">Scheduled / Queued</span>
            <span className="text-2xl font-black text-blue-400 font-mono">{stats.scheduled}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">Active In-Transit</span>
            <span className="text-2xl font-black text-amber-400 font-mono">{stats.inTransit}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold animate-pulse">
            <Ambulance className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">Completed Handovers</span>
            <span className="text-2xl font-black text-emerald-400 font-mono">{stats.completed}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by patient name, UHID, ward, nurse, doctor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Statuses</option>
            <option value="Scheduled / Initiated">Scheduled / Initiated</option>
            <option value="In Transit">In Transit</option>
            <option value="Received & Bed Handover Complete">Received & Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Transfer Types</option>
            {MOVEMENT_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 4. Movement Logs List */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <GitCommit className="w-4 h-4 text-cyan-400" />
            Live Patient Internal Transfer Telemetry ({filteredLogs.length} Records)
          </h3>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800">
            No movement records matching your search or filters.
          </div>
        ) : (
          <div className="space-y-3.5">
            {filteredLogs.map((log) => {
              const isInTransit = log.status === 'In Transit';
              const isScheduled = log.status === 'Scheduled / Initiated';
              const isCompleted = log.status === 'Received & Bed Handover Complete';
              const isCancelled = log.status === 'Cancelled';

              return (
                <div
                  key={log.id}
                  className={`p-4 rounded-xl border transition space-y-3 ${
                    isInTransit
                      ? 'bg-amber-950/20 border-amber-500/40 shadow-md shadow-amber-950/30'
                      : isCompleted
                      ? 'bg-slate-950 border-slate-800/80'
                      : isCancelled
                      ? 'bg-rose-950/10 border-rose-900/40 opacity-70'
                      : 'bg-slate-950 border-slate-800'
                  }`}
                >
                  {/* Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/60 pb-2.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-100 text-sm">{log.patientName}</span>
                      <span className="font-mono text-xs text-cyan-400 font-bold px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/30 rounded">
                        {log.patientUhid}
                      </span>
                      {log.movementType && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30">
                          {log.movementType}
                        </span>
                      )}
                      <span className="text-[10px] font-mono text-slate-400">
                        Mode: {log.transportMode || 'Stretcher'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Status Badge */}
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.8 rounded-full border flex items-center gap-1 ${
                          isInTransit
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                            : isCompleted
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                            : isCancelled
                            ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                            : 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          isInTransit ? 'bg-amber-400' : isCompleted ? 'bg-emerald-400' : isCancelled ? 'bg-rose-400' : 'bg-blue-400'
                        }`} />
                        {log.status}
                      </span>

                      {/* Print Slip Button */}
                      <button
                        type="button"
                        onClick={() => setPrintSlipLog(log)}
                        className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 hover:text-white transition"
                        title="Print SBAR Transfer Handover Pass"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Locations Origin ➡️ Destination Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                    <div className="md:col-span-5 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                      <span className="text-[10px] font-bold uppercase text-slate-500 block">Origin Location</span>
                      <strong className="text-amber-300 text-xs font-mono block">{log.fromLocation}</strong>
                    </div>

                    <div className="md:col-span-2 flex justify-center">
                      <div className="w-7 h-7 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-cyan-400">
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    <div className="md:col-span-5 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                      <span className="text-[10px] font-bold uppercase text-slate-500 block">Destination Location</span>
                      <strong className="text-emerald-400 text-xs font-mono block">{log.toLocation}</strong>
                    </div>
                  </div>

                  {/* Clinical Reason & SBAR Handover Notes */}
                  <div className="text-xs space-y-1 text-slate-300 bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/60">
                    <div>
                      <strong className="text-slate-400">Clinical Indication: </strong>
                      <span className="text-slate-200">{log.reason}</span>
                    </div>
                    {log.handoverNotes && (
                      <div className="text-[11px] text-slate-300">
                        <strong className="text-cyan-400">SBAR Notes: </strong>
                        <span>{log.handoverNotes}</span>
                      </div>
                    )}
                  </div>

                  {/* Transport Telemetry & Equipment Tags */}
                  {log.lifeSupport && log.lifeSupport.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Life Support:</span>
                      {log.lifeSupport.map((eq, i) => (
                        <span key={i} className="px-2 py-0.5 rounded text-[10px] font-medium bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                          ⚡ {eq}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Staff Audit & Action Progression Footer */}
                  <div className="pt-2 border-t border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="text-[11px] text-slate-400 flex items-center gap-3 flex-wrap">
                      <span>🕒 {log.timestamp}</span>
                      <span>•</span>
                      <span>Auth: <strong className="text-slate-200">{log.authorizedBy}</strong></span>
                      <span>•</span>
                      <span>Escort Nurse: <strong className="text-slate-200">{log.escortNurse || 'Assigned Nurse'}</strong></span>
                      {log.receivingNurseSign && (
                        <>
                          <span>•</span>
                          <span className="text-emerald-400">
                            ✓ Handover Signed: <strong>{log.receivingNurseSign}</strong> {log.completedAt ? `(${log.completedAt})` : ''}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Nurse / Doctor Operational Action Buttons */}
                    {canManageMovement && !isCompleted && !isCancelled && (
                      <div className="flex items-center gap-2 shrink-0">
                        {isScheduled && (
                          <button
                            type="button"
                            onClick={() => handleAdvanceStatus(log)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow transition active:scale-95"
                          >
                            <Ambulance className="w-3.5 h-3.5" />
                            <span>Mark In Transit</span>
                          </button>
                        )}

                        {isInTransit && (
                          <button
                            type="button"
                            onClick={() => setHandoverLog(log)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition active:scale-95"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Sign Bed Handover & Receive</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setCancelModalLog(log)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 border border-slate-700 hover:border-rose-500/40 text-xs font-semibold transition"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. INITIATE NEW PATIENT MOVEMENT MODAL (Nurses & Doctors Only) */}
      {showNewModal && canManageMovement && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in duration-150">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                  <GitCommit className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100 uppercase">
                    INITIATE CLINICAL PATIENT MOVEMENT & TRANSFER
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Authorized Ward Nurse & Doctor Clinical Transport Portal
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowNewModal(false)}
                className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitNewMovement} className="p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
              {/* 1. Select Patient */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">Select Patient *</label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => handleSelectAdmittedPatient(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-cyan-500"
                  required
                >
                  <option value="">-- Choose Admitted or Registered Patient --</option>
                  {patients.map((pat) => {
                    const adm = admissions.find((a) => a.patientId === pat.id || a.patientUhid === pat.uhid);
                    return (
                      <option key={pat.id} value={pat.id}>
                        {pat.name} ({pat.uhid}) {adm ? `• Bed ${adm.bedNumber} (${adm.wardName})` : `• ${pat.status}`}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* 2. Transfer Type & Transport Mode */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Movement Type *</label>
                  <select
                    value={movementType}
                    onChange={(e) => setMovementType(e.target.value as MovementType)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-cyan-500"
                  >
                    {MOVEMENT_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Transport Mode *</label>
                  <select
                    value={transportMode}
                    onChange={(e) => setTransportMode(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-cyan-500"
                  >
                    {TRANSPORT_MODES.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 3. Origin & Destination Locations */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">From Location (Origin) *</label>
                  <input
                    type="text"
                    value={fromLocation}
                    onChange={(e) => setFromLocation(e.target.value)}
                    placeholder="e.g., Emergency Bay 2, Floor 2 - Bed 201"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">To Location (Destination) *</label>
                  <input
                    type="text"
                    value={toLocation}
                    onChange={(e) => setToLocation(e.target.value)}
                    placeholder="e.g., Cardiac ICU Bed 02, Cath Lab Suite 1"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
              </div>

              {/* 4. Clinical Indication / Reason */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">Clinical Indication & Reason for Transfer *</label>
                <textarea
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g., Deterioration in respiratory score requiring mechanical ventilation / Elective bypass surgery pre-op shift."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              {/* 5. Authorizing Doctor & Escort Staff */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Authorizing Doctor *</label>
                  <input
                    type="text"
                    value={authorizedBy}
                    onChange={(e) => setAuthorizedBy(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Assigned Escort Nurse *</label>
                  <input
                    type="text"
                    value={escortNurse}
                    onChange={(e) => setEscortNurse(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Assigned Porter / GDA</label>
                  <input
                    type="text"
                    value={porterGDA}
                    onChange={(e) => setPorterGDA(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* 6. Life-Support & Critical Care Equipment Checklist */}
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">
                  Critical Care Transport Equipment Checklist
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {LIFE_SUPPORT_OPTIONS.map((opt) => {
                    const active = selectedLifeSupport.includes(opt);
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleToggleLifeSupport(opt)}
                        className={`p-2 rounded-lg border text-left text-[11px] font-medium transition flex items-center gap-1.5 ${
                          active
                            ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-200'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[9px] ${
                          active ? 'bg-cyan-500 border-cyan-400 text-slate-950 font-bold' : 'border-slate-700'
                        }`}>
                          {active ? '✓' : ''}
                        </span>
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 7. Clinical SBAR Handover Summary */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  SBAR Clinical Handover Notes (Situation, Background, Assessment, Recommendation)
                </label>
                <textarea
                  rows={2}
                  value={handoverNotes}
                  onChange={(e) => setHandoverNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold shadow-lg shadow-cyan-950/50"
                >
                  Confirm &amp; Log Movement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. RECEIVING BED HANDOVER SIGN-OFF MODAL */}
      {handoverLog && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in duration-150">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100 uppercase">
                    RECEIVING BED HANDOVER SIGN-OFF
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {handoverLog.patientName} ({handoverLog.patientUhid})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setHandoverLog(null)}
                className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmReceivingHandover} className="p-6 space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="text-slate-400">Transit Details:</div>
                <div className="font-bold text-slate-200">{handoverLog.fromLocation} ➡️ {handoverLog.toLocation}</div>
                <div className="text-[11px] text-slate-400">Escorted by: {handoverLog.escortNurse || 'Staff Nurse'}</div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Receiving Incharge Nurse Sign-off *</label>
                <input
                  type="text"
                  value={receivingNurseSign}
                  onChange={(e) => setReceivingNurseSign(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Bedside Handover Confirmation & Notes *</label>
                <textarea
                  rows={3}
                  value={receivingNotes}
                  onChange={(e) => setReceivingNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Confirming this handover marks the patient successfully received and finalizes the transit log.
                </span>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setHandoverLog(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-950/50"
                >
                  Sign &amp; Complete Handover
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. CANCEL MOVEMENT MODAL */}
      {cancelModalLog && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in duration-150">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
                  <Ban className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100 uppercase">
                    CANCEL PATIENT MOVEMENT
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {cancelModalLog.patientName} ({cancelModalLog.patientUhid})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCancelModalLog(null)}
                className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmCancelMovement} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Clinical Justification for Cancellation *</label>
                <textarea
                  rows={3}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCancelModalLog(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold"
                >
                  Confirm Cancellation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. PRINTABLE SBAR TRANSFER HANDOVER PASS (SLIP) */}
      {printSlipLog && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-8">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Printer className="w-4 h-4 text-cyan-400" />
                <span>Print SBAR Internal Transfer Pass</span>
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Slip</span>
                </button>
                <button
                  onClick={() => setPrintSlipLog(null)}
                  className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Slip Body */}
            <div className="p-8 bg-white text-slate-900 font-sans text-xs space-y-4 max-h-[80vh] overflow-y-auto print:max-h-none print:overflow-visible">
              <div className="text-center border-b-2 border-slate-900 pb-3 space-y-1">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-950 text-white flex items-center justify-center font-bold text-base">
                    ✚
                  </div>
                  <h1 className="text-lg font-black uppercase tracking-wider text-blue-950">
                    BHASKAR REDDY HOSPITAL
                  </h1>
                </div>
                <p className="text-[10px] text-slate-600 font-semibold">
                  {activeBranch.name} • Internal Patient Movement & SBAR Transfer Pass
                </p>
                <div className="pt-1">
                  <span className="inline-block px-3 py-0.5 border border-blue-950 bg-blue-50 text-blue-950 font-bold text-[10px] uppercase tracking-wider rounded">
                    TRANSIT PASS: #{printSlipLog.id.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Patient Demographics */}
              <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 border border-slate-300 rounded text-[11px]">
                <div>
                  <span className="text-slate-500 font-bold">Patient Name:</span>{' '}
                  <strong>{printSlipLog.patientName}</strong>
                </div>
                <div>
                  <span className="text-slate-500 font-bold">UHID:</span>{' '}
                  <strong className="font-mono">{printSlipLog.patientUhid}</strong>
                </div>
                <div>
                  <span className="text-slate-500 font-bold">Transit Type:</span>{' '}
                  <span>{printSlipLog.movementType || 'Ward-to-Ward'}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-bold">Transport Mode:</span>{' '}
                  <span>{printSlipLog.transportMode || 'Stretcher'}</span>
                </div>
              </div>

              {/* Route */}
              <div className="grid grid-cols-2 gap-2 border border-slate-300 rounded p-2.5 text-[11px]">
                <div>
                  <span className="text-slate-500 font-bold block">FROM (Origin):</span>
                  <strong className="text-amber-800">{printSlipLog.fromLocation}</strong>
                </div>
                <div>
                  <span className="text-slate-500 font-bold block">TO (Destination):</span>
                  <strong className="text-emerald-800">{printSlipLog.toLocation}</strong>
                </div>
              </div>

              {/* SBAR & Clinical */}
              <div className="border border-slate-300 rounded p-2.5 text-[11px] space-y-1">
                <div>
                  <span className="text-slate-500 font-bold">Clinical Reason:</span>{' '}
                  <span>{printSlipLog.reason}</span>
                </div>
                {printSlipLog.handoverNotes && (
                  <div>
                    <span className="text-slate-500 font-bold">SBAR Handover Summary:</span>{' '}
                    <span>{printSlipLog.handoverNotes}</span>
                  </div>
                )}
                {printSlipLog.lifeSupport && printSlipLog.lifeSupport.length > 0 && (
                  <div>
                    <span className="text-slate-500 font-bold">Equipment Attached:</span>{' '}
                    <span>{printSlipLog.lifeSupport.join(' • ')}</span>
                  </div>
                )}
              </div>

              {/* Signatures */}
              <div className="pt-6 grid grid-cols-3 gap-3 text-center text-[10px] border-t border-slate-300">
                <div className="space-y-4">
                  <div className="font-bold text-slate-800">{printSlipLog.authorizedBy}</div>
                  <div className="border-t border-slate-400 pt-1 text-slate-500">Authorizing Doctor / DMO</div>
                </div>
                <div className="space-y-4">
                  <div className="font-bold text-slate-800">{printSlipLog.escortNurse || 'Staff Nurse'}</div>
                  <div className="border-t border-slate-400 pt-1 text-slate-500">Escort Staff Nurse</div>
                </div>
                <div className="space-y-4">
                  <div className="font-bold text-slate-800">{printSlipLog.receivingNurseSign || '_________________'}</div>
                  <div className="border-t border-slate-400 pt-1 text-slate-500">Receiving Ward Incharge</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


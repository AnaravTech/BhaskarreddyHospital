import React, { useState, useMemo } from 'react';
import {
  Stethoscope, Activity, Search, Plus, CheckCircle2,
  Clock, AlertCircle, ShieldAlert, HeartPulse, 
  ClipboardCheck, UserCheck, Droplets, X,
  Calendar, AlertTriangle, User
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';

// --- Local Types & Mock Data ---

type OTStatus = 'In Progress' | 'Pre-Op Preparation' | 'Cleaning & Disinfection' | 'Available' | 'Maintenance';
type SurgeryStatus = 'Scheduled' | 'Pre-Op Check' | 'In Progress' | 'Completed' | 'PACU';
type AnaesthesiaType = 'General' | 'Spinal' | 'Epidural' | 'Regional' | 'Local';
type ASAGrade = 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI' | 'E';

interface OTRoom {
  id: string;
  name: string;
  type: string;
  status: OTStatus;
  currentSurgery?: {
    code: string;
    procedure: string;
    surgeon: string;
    anaesthetist: string;
    scrubNurse: string;
    patientName: string;
    uhid: string;
    elapsedMins: number;
    estTotalMins: number;
  };
  nextSurgery?: {
    procedure: string;
    time: string;
  };
}

interface SurgicalSchedule {
  id: string;
  code: string;
  patientName: string;
  uhid: string;
  procedure: string;
  surgeon: string;
  anaesthetist: string;
  anaesthesiaType: AnaesthesiaType;
  asaGrade: ASAGrade;
  scheduledStart: string;
  status: SurgeryStatus;
  isEmergency: boolean;
  npoHours: number;
  whoChecklistCompleted: boolean;
  pacuScore?: number;
}

const mockOTRooms: OTRoom[] = [
  {
    id: 'OT-1',
    name: 'OT-1',
    type: 'Cardiac & Vascular OT Suite',
    status: 'In Progress',
    currentSurgery: {
      code: 'SURG-2026-081',
      procedure: 'CABG Double Vessel',
      surgeon: 'Dr. Vikram Reddy',
      anaesthetist: 'Dr. K. S. Rao',
      scrubNurse: 'Sister Latha',
      patientName: 'Ravi Shankar M',
      uhid: 'BRH-2026-4421',
      elapsedMins: 105,
      estTotalMins: 210,
    }
  },
  {
    id: 'OT-2',
    name: 'OT-2',
    type: 'Orthopedic & Trauma Suite',
    status: 'Pre-Op Preparation',
    currentSurgery: {
      code: 'SURG-2026-082',
      procedure: 'Total Knee Replacement (TKR)',
      surgeon: 'Dr. Rajeshwar Rao',
      anaesthetist: 'Dr. K. S. Rao',
      scrubNurse: 'Sister Mary',
      patientName: 'Narasimha Rao D',
      uhid: 'BRH-2026-4512',
      elapsedMins: 0,
      estTotalMins: 150,
    }
  },
  {
    id: 'OT-3',
    name: 'OT-3',
    type: 'OB/GYN & General Surgery Suite',
    status: 'Cleaning & Disinfection',
    nextSurgery: {
      procedure: 'Emergency C-Section',
      time: '14:30',
    }
  }
];

const mockSchedule: SurgicalSchedule[] = [
  {
    id: '1', code: 'SURG-2026-081', patientName: 'Ravi Shankar M', uhid: 'BRH-2026-4421',
    procedure: 'CABG Double Vessel', surgeon: 'Dr. Vikram Reddy', anaesthetist: 'Dr. K. S. Rao',
    anaesthesiaType: 'General', asaGrade: 'III', scheduledStart: '08:00', status: 'In Progress',
    isEmergency: false, npoHours: 10, whoChecklistCompleted: true
  },
  {
    id: '2', code: 'SURG-2026-082', patientName: 'Narasimha Rao D', uhid: 'BRH-2026-4512',
    procedure: 'Total Knee Replacement (TKR)', surgeon: 'Dr. Rajeshwar Rao', anaesthetist: 'Dr. K. S. Rao',
    anaesthesiaType: 'Spinal', asaGrade: 'II', scheduledStart: '10:30', status: 'Pre-Op Check',
    isEmergency: false, npoHours: 8, whoChecklistCompleted: false
  },
  {
    id: '3', code: 'SURG-2026-088', patientName: 'Lakshmi Devi', uhid: 'BRH-2026-4601',
    procedure: 'Emergency C-Section', surgeon: 'Dr. Madhu Latha Marreddy', anaesthetist: 'Dr. S. K. Gupta',
    anaesthesiaType: 'Spinal', asaGrade: 'II', scheduledStart: '14:30', status: 'Scheduled',
    isEmergency: true, npoHours: 4, whoChecklistCompleted: false
  },
  {
    id: '4', code: 'SURG-2026-079', patientName: 'Srinivas G', uhid: 'BRH-2026-4122',
    procedure: 'Laparoscopic Appendectomy', surgeon: 'Dr. Sameer Khan', anaesthetist: 'Dr. S. K. Gupta',
    anaesthesiaType: 'General', asaGrade: 'I', scheduledStart: '06:00', status: 'PACU',
    isEmergency: true, npoHours: 6, whoChecklistCompleted: true, pacuScore: 8
  },
  {
    id: '5', code: 'SURG-2026-078', patientName: 'Padmavathi K', uhid: 'BRH-2026-4011',
    procedure: 'Cataract Surgery OD', surgeon: 'Dr. T. S. Rao', anaesthetist: 'Dr. K. S. Rao',
    anaesthesiaType: 'Local', asaGrade: 'I', scheduledStart: '07:00', status: 'PACU',
    isEmergency: false, npoHours: 6, whoChecklistCompleted: true, pacuScore: 10
  }
];

export const OperationTheatreModule: React.FC = () => {
  const { addToast } = useHospital();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<SurgeryStatus | 'All'>('All');
  const [schedules, setSchedules] = useState<SurgicalSchedule[]>(mockSchedule);
  
  // Modals state
  const [showWhoModal, setShowWhoModal] = useState(false);
  const [showPacuModal, setShowPacuModal] = useState(false);
  const [selectedSurgery, setSelectedSurgery] = useState<SurgicalSchedule | null>(null);

  // WHO Checklist State
  const [whoPhase, setWhoPhase] = useState<'signin' | 'timeout' | 'signout'>('signin');
  const [whoChecks, setWhoChecks] = useState<Record<string, boolean>>({});

  // PACU Aldrete Score State
  const [aldreteScores, setAldreteScores] = useState({
    activity: 0, respiration: 0, circulation: 0, consciousness: 0, saturation: 0
  });

  const filteredSchedules = useMemo(() => {
    return schedules.filter(s => {
      const matchesSearch = s.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            s.surgeon.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            s.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'All' || s.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [schedules, searchTerm, filterStatus]);

  const handleOpenWhoModal = (surgery: SurgicalSchedule) => {
    setSelectedSurgery(surgery);
    setWhoPhase('signin');
    setWhoChecks({}); // reset for demo
    setShowWhoModal(true);
  };

  const handleSaveWhoChecklist = () => {
    if (selectedSurgery) {
      setSchedules(prev => prev.map(s => 
        s.id === selectedSurgery.id ? { ...s, whoChecklistCompleted: true } : s
      ));
      addToast('WHO Surgical Safety Sign-Off completed successfully', 'success');
      setShowWhoModal(false);
    }
  };

  const handleOpenPacuModal = (surgery: SurgicalSchedule) => {
    setSelectedSurgery(surgery);
    setAldreteScores({ activity: 0, respiration: 0, circulation: 0, consciousness: 0, saturation: 0 });
    setShowPacuModal(true);
  };

  const calculatePacuScore = () => {
    return Object.values(aldreteScores).reduce((a, b) => a + b, 0);
  };

  const handleSavePacuScore = () => {
    if (selectedSurgery) {
      const score = calculatePacuScore();
      setSchedules(prev => prev.map(s => 
        s.id === selectedSurgery.id ? { ...s, pacuScore: score } : s
      ));
      addToast(`Aldrete Score ${score} saved for ${selectedSurgery.patientName}`, 'success');
      setShowPacuModal(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Command Bar */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">Active Surgeries Today</p>
            <h3 className="text-2xl font-bold text-slate-100 mt-1">5</h3>
          </div>
          <div className="h-12 w-12 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Activity size={24} />
          </div>
        </div>
        
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">In Progress</p>
            <h3 className="text-2xl font-bold text-slate-100 mt-1">2</h3>
          </div>
          <div className="h-12 w-12 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
            <Clock size={24} />
          </div>
        </div>
        
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">Pre-Op Recovery</p>
            <h3 className="text-2xl font-bold text-slate-100 mt-1">1</h3>
          </div>
          <div className="h-12 w-12 rounded-xl bg-violet-500/20 flex items-center justify-center text-violet-400">
            <UserCheck size={24} />
          </div>
        </div>
        
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">PACU Recovery</p>
            <h3 className="text-2xl font-bold text-slate-100 mt-1">2</h3>
          </div>
          <div className="h-12 w-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
            <HeartPulse size={24} />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">Emergency Surgeries</p>
            <h3 className="text-2xl font-bold text-rose-500 mt-1">1</h3>
          </div>
          <div className="h-12 w-12 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-500">
            <AlertCircle size={24} />
          </div>
        </div>
      </div>

      {/* OT Rooms Live Monitor Grid */}
      <div>
        <h2 className="text-xl font-bold text-slate-100 mb-4 flex items-center gap-2">
          <Stethoscope className="text-cyan-400" size={24} />
          OT Rooms Live Monitor
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {mockOTRooms.map((room) => (
            <div key={room.id} className="bg-slate-900/90 border border-slate-800/80 rounded-2xl overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-800/80 bg-slate-800/30 flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg text-slate-100">{room.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">{room.type}</p>
                </div>
                <span className={`px-2 py-1 rounded-md text-xs font-semibold ${
                  room.status === 'In Progress' ? 'bg-amber-500/20 text-amber-400' :
                  room.status === 'Pre-Op Preparation' ? 'bg-cyan-500/20 text-cyan-400' :
                  'bg-slate-700/50 text-slate-300'
                }`}>
                  {room.status}
                </span>
              </div>
              
              <div className="p-4 flex-1">
                {room.currentSurgery ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-slate-400">Current Surgery</p>
                      <p className="font-semibold text-slate-200 mt-1">{room.currentSurgery.procedure}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-xs text-slate-500">Surgeon</p>
                        <p className="text-slate-300">{room.currentSurgery.surgeon}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Anaesthetist</p>
                        <p className="text-slate-300">{room.currentSurgery.anaesthetist}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs text-slate-500">Patient</p>
                        <p className="text-slate-300">{room.currentSurgery.patientName} ({room.currentSurgery.uhid})</p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">Progress</span>
                        <span className="text-cyan-400">{room.currentSurgery.elapsedMins}m / {room.currentSurgery.estTotalMins}m</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2">
                        <div 
                          className="bg-cyan-500 h-2 rounded-full transition-all duration-1000 relative overflow-hidden"
                          style={{ width: `${Math.min(100, (room.currentSurgery.elapsedMins / room.currentSurgery.estTotalMins) * 100)}%` }}
                        >
                          <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : room.nextSurgery ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-6">
                    <div className="h-16 w-16 rounded-full bg-slate-800/50 flex items-center justify-center">
                      <Droplets className="text-slate-400" size={32} />
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Preparing for next surgery</p>
                      <p className="font-semibold text-slate-200 mt-1">{room.nextSurgery.procedure}</p>
                      <p className="text-xs text-rose-400 mt-1">Scheduled: {room.nextSurgery.time}</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-500 py-6">
                    No active operations
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Surgical Schedule Timetable */}
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-800/80 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Calendar className="text-cyan-400" size={24} />
            Surgical Schedule Timetable
          </h2>
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search surgeon, patient, code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as SurgeryStatus | 'All')}
              className="bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50"
            >
              <option value="All">All Statuses</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Pre-Op Check">Pre-Op Check</option>
              <option value="In Progress">In Progress</option>
              <option value="PACU">PACU</option>
              <option value="Completed">Completed</option>
            </select>
            <button className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors">
              <Plus size={16} /> Schedule New
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/50 text-slate-400 text-xs uppercase tracking-wider">
                <th className="p-4 font-medium">Time & Code</th>
                <th className="p-4 font-medium">Patient Details</th>
                <th className="p-4 font-medium">Procedure & Team</th>
                <th className="p-4 font-medium">Pre-Op Info</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredSchedules.map((schedule) => (
                <tr key={schedule.id} className="hover:bg-slate-800/30 transition-colors group">
                  <td className="p-4 align-top">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-200">{schedule.scheduledStart}</span>
                      <span className="text-xs text-slate-500">{schedule.code}</span>
                      {schedule.isEmergency && (
                        <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-400/10 px-1.5 py-0.5 rounded w-fit">
                          <AlertTriangle size={10} /> Emergency
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 align-top">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-300">{schedule.patientName}</span>
                      <span className="text-xs text-slate-500">{schedule.uhid}</span>
                    </div>
                  </td>
                  <td className="p-4 align-top">
                    <div className="flex flex-col">
                      <span className="font-medium text-cyan-400">{schedule.procedure}</span>
                      <span className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                        <User size={12} /> {schedule.surgeon}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 align-top">
                    <div className="flex flex-col gap-1 text-xs">
                      <span className="text-slate-400">
                        <span className="text-slate-500">Anaes:</span> {schedule.anaesthesiaType}
                      </span>
                      <span className="flex items-center gap-1">
                         <span className="text-slate-500">ASA:</span>
                         <span className="bg-slate-700/50 px-1.5 rounded font-medium text-slate-300">Grade {schedule.asaGrade}</span>
                      </span>
                      <span className="text-slate-400">
                         <span className="text-slate-500">NPO:</span> {schedule.npoHours}h
                      </span>
                    </div>
                  </td>
                  <td className="p-4 align-top">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                      schedule.status === 'In Progress' ? 'bg-amber-500/20 text-amber-400' :
                      schedule.status === 'PACU' ? 'bg-emerald-500/20 text-emerald-400' :
                      schedule.status === 'Pre-Op Check' ? 'bg-cyan-500/20 text-cyan-400' :
                      'bg-slate-700/50 text-slate-300'
                    }`}>
                      {schedule.status}
                    </span>
                  </td>
                  <td className="p-4 align-top text-right">
                    <div className="flex flex-col items-end gap-2">
                      <button 
                        onClick={() => handleOpenWhoModal(schedule)}
                        className={`text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-semibold transition-colors ${
                          schedule.whoChecklistCompleted 
                            ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20' 
                            : 'bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/20'
                        }`}
                      >
                        <ShieldAlert size={14} />
                        {schedule.whoChecklistCompleted ? 'WHO Done' : 'WHO Checklist'}
                      </button>
                      
                      {schedule.status === 'PACU' && (
                        <button 
                          onClick={() => handleOpenPacuModal(schedule)}
                          className="text-xs px-3 py-1.5 rounded-lg bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 border border-violet-500/20 flex items-center gap-1.5 font-semibold transition-colors"
                        >
                          <Activity size={14} />
                          {schedule.pacuScore !== undefined ? `PACU: ${schedule.pacuScore}/10` : 'PACU Score'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredSchedules.length === 0 && (
                 <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No surgeries found matching filters.
                  </td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* WHO Surgical Safety Checklist Modal */}
      {showWhoModal && selectedSurgery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl flex flex-col shadow-2xl overflow-hidden max-h-[90vh]">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="bg-cyan-500/20 p-2 rounded-xl">
                  <ShieldAlert className="text-cyan-400" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-100">WHO Surgical Safety Checklist</h3>
                  <p className="text-sm text-slate-400">{selectedSurgery.patientName} ({selectedSurgery.uhid}) - {selectedSurgery.procedure}</p>
                </div>
              </div>
              <button onClick={() => setShowWhoModal(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="flex border-b border-slate-800 bg-slate-900">
              <button 
                className={`flex-1 py-3 text-sm font-bold flex justify-center items-center gap-2 border-b-2 transition-colors ${whoPhase === 'signin' ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5' : 'border-transparent text-slate-400 hover:bg-slate-800/50'}`}
                onClick={() => setWhoPhase('signin')}
              >
                1. SIGN IN <span className="text-xs font-normal opacity-70">(Before Induction)</span>
              </button>
              <button 
                className={`flex-1 py-3 text-sm font-bold flex justify-center items-center gap-2 border-b-2 transition-colors ${whoPhase === 'timeout' ? 'border-amber-500 text-amber-400 bg-amber-500/5' : 'border-transparent text-slate-400 hover:bg-slate-800/50'}`}
                onClick={() => setWhoPhase('timeout')}
              >
                2. TIME OUT <span className="text-xs font-normal opacity-70">(Before Incision)</span>
              </button>
              <button 
                className={`flex-1 py-3 text-sm font-bold flex justify-center items-center gap-2 border-b-2 transition-colors ${whoPhase === 'signout' ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5' : 'border-transparent text-slate-400 hover:bg-slate-800/50'}`}
                onClick={() => setWhoPhase('signout')}
              >
                3. SIGN OUT <span className="text-xs font-normal opacity-70">(Before Leaving OT)</span>
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 bg-slate-900/50">
              {whoPhase === 'signin' && (
                <div className="space-y-4">
                  {[
                    { id: 'si1', label: 'Patient identity, site, procedure & consent confirmed' },
                    { id: 'si2', label: 'Surgical site marked by surgeon' },
                    { id: 'si3', label: 'Anaesthesia safety check completed' },
                    { id: 'si4', label: 'Pulse oximeter on patient and functioning' },
                    { id: 'si5', label: 'Known allergy check completed (Yes/No)' },
                    { id: 'si6', label: 'Difficult airway / aspiration risk evaluated' },
                    { id: 'si7', label: 'Risk of >500ml blood loss evaluated' },
                  ].map(item => (
                    <label key={item.id} className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/30 hover:bg-slate-800/60 transition-colors cursor-pointer border border-slate-800/50">
                      <div className="pt-0.5">
                        <input 
                          type="checkbox" 
                          className="w-5 h-5 rounded border-slate-600 text-cyan-500 focus:ring-cyan-500/20 bg-slate-700"
                          checked={whoChecks[item.id] || false}
                          onChange={(e) => setWhoChecks(prev => ({...prev, [item.id]: e.target.checked}))}
                        />
                      </div>
                      <span className="text-slate-200 text-sm font-medium">{item.label}</span>
                    </label>
                  ))}
                </div>
              )}

              {whoPhase === 'timeout' && (
                <div className="space-y-4">
                  {[
                    { id: 'to1', label: 'Confirm all team members introduced by name & role' },
                    { id: 'to2', label: 'Surgeon, Anaesthetist & Nurse verbally confirm patient name, site, procedure' },
                    { id: 'to3', label: 'Antibiotic prophylaxis given within last 60 minutes' },
                    { id: 'to4', label: 'Anticipated critical steps reviewed by surgeon, anaesthetist & nurse' },
                    { id: 'to5', label: 'Essential imaging displayed in OT' },
                  ].map(item => (
                    <label key={item.id} className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/30 hover:bg-slate-800/60 transition-colors cursor-pointer border border-slate-800/50">
                      <div className="pt-0.5">
                        <input 
                          type="checkbox" 
                          className="w-5 h-5 rounded border-slate-600 text-amber-500 focus:ring-amber-500/20 bg-slate-700"
                          checked={whoChecks[item.id] || false}
                          onChange={(e) => setWhoChecks(prev => ({...prev, [item.id]: e.target.checked}))}
                        />
                      </div>
                      <span className="text-slate-200 text-sm font-medium">{item.label}</span>
                    </label>
                  ))}
                </div>
              )}

              {whoPhase === 'signout' && (
                <div className="space-y-4">
                  {[
                    { id: 'so1', label: 'Nurse verbally confirms procedure recorded' },
                    { id: 'so2', label: 'Instrument, sponge & needle counts completed and correct' },
                    { id: 'so3', label: 'Surgical specimen labeled correctly with patient UHID' },
                    { id: 'so4', label: 'Equipment issues addressed' },
                    { id: 'so5', label: 'Key concerns for recovery and management reviewed' },
                  ].map(item => (
                    <label key={item.id} className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/30 hover:bg-slate-800/60 transition-colors cursor-pointer border border-slate-800/50">
                      <div className="pt-0.5">
                        <input 
                          type="checkbox" 
                          className="w-5 h-5 rounded border-slate-600 text-emerald-500 focus:ring-emerald-500/20 bg-slate-700"
                          checked={whoChecks[item.id] || false}
                          onChange={(e) => setWhoChecks(prev => ({...prev, [item.id]: e.target.checked}))}
                        />
                      </div>
                      <span className="text-slate-200 text-sm font-medium">{item.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="p-5 border-t border-slate-800 bg-slate-800/50 flex justify-between items-center">
              <span className="text-xs text-slate-400">Digital signature required for final sign-off</span>
              <button 
                onClick={handleSaveWhoChecklist}
                className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center gap-2"
              >
                <ClipboardCheck size={18} />
                Save & Complete WHO Sign-Off
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PACU Aldrete Score Modal */}
      {showPacuModal && selectedSurgery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl flex flex-col shadow-2xl overflow-hidden max-h-[90vh]">
             <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="bg-violet-500/20 p-2 rounded-xl">
                  <Activity className="text-violet-400" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-100">PACU Aldrete Recovery Score</h3>
                  <p className="text-sm text-slate-400">{selectedSurgery.patientName} - Post-Op Evaluation</p>
                </div>
              </div>
              <button onClick={() => setShowPacuModal(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 bg-slate-900/50 space-y-6">
              
              {/* Score Categories */}
              <div className="space-y-4">
                
                {/* Activity */}
                <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-800/50">
                  <h4 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                    <User size={16} className="text-cyan-400"/> Activity
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {[
                      { val: 2, label: 'Moves 4 limbs' },
                      { val: 1, label: 'Moves 2 limbs' },
                      { val: 0, label: 'Moves 0 limbs' }
                    ].map(opt => (
                      <button 
                        key={opt.val}
                        onClick={() => setAldreteScores(p => ({...p, activity: opt.val}))}
                        className={`p-2 rounded-lg text-sm font-medium border transition-colors ${
                          aldreteScores.activity === opt.val 
                            ? 'bg-violet-500/20 border-violet-500/50 text-violet-300' 
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        {opt.label} ({opt.val})
                      </button>
                    ))}
                  </div>
                </div>

                {/* Respiration */}
                <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-800/50">
                  <h4 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                    <Droplets size={16} className="text-cyan-400"/> Respiration
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {[
                      { val: 2, label: 'Deep breath/cough' },
                      { val: 1, label: 'Dyspnea/shallow' },
                      { val: 0, label: 'Apneic' }
                    ].map(opt => (
                      <button 
                        key={opt.val}
                        onClick={() => setAldreteScores(p => ({...p, respiration: opt.val}))}
                        className={`p-2 rounded-lg text-sm font-medium border transition-colors ${
                          aldreteScores.respiration === opt.val 
                            ? 'bg-violet-500/20 border-violet-500/50 text-violet-300' 
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        {opt.label} ({opt.val})
                      </button>
                    ))}
                  </div>
                </div>

                {/* Circulation */}
                <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-800/50">
                  <h4 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                    <HeartPulse size={16} className="text-cyan-400"/> Circulation (BP)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {[
                      { val: 2, label: '±20% pre-op' },
                      { val: 1, label: '±20-50% pre-op' },
                      { val: 0, label: '±50% pre-op' }
                    ].map(opt => (
                      <button 
                        key={opt.val}
                        onClick={() => setAldreteScores(p => ({...p, circulation: opt.val}))}
                        className={`p-2 rounded-lg text-sm font-medium border transition-colors ${
                          aldreteScores.circulation === opt.val 
                            ? 'bg-violet-500/20 border-violet-500/50 text-violet-300' 
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        {opt.label} ({opt.val})
                      </button>
                    ))}
                  </div>
                </div>

                {/* Consciousness */}
                <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-800/50">
                  <h4 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                    <Stethoscope size={16} className="text-cyan-400"/> Consciousness
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {[
                      { val: 2, label: 'Fully awake' },
                      { val: 1, label: 'Arousable' },
                      { val: 0, label: 'Unresponsive' }
                    ].map(opt => (
                      <button 
                        key={opt.val}
                        onClick={() => setAldreteScores(p => ({...p, consciousness: opt.val}))}
                        className={`p-2 rounded-lg text-sm font-medium border transition-colors ${
                          aldreteScores.consciousness === opt.val 
                            ? 'bg-violet-500/20 border-violet-500/50 text-violet-300' 
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        {opt.label} ({opt.val})
                      </button>
                    ))}
                  </div>
                </div>

                {/* O2 Saturation */}
                <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-800/50">
                  <h4 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                    <Droplets size={16} className="text-cyan-400"/> O2 Saturation
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {[
                      { val: 2, label: '>92% room air' },
                      { val: 1, label: 'Needs O2' },
                      { val: 0, label: '<90% on O2' }
                    ].map(opt => (
                      <button 
                        key={opt.val}
                        onClick={() => setAldreteScores(p => ({...p, saturation: opt.val}))}
                        className={`p-2 rounded-lg text-sm font-medium border transition-colors ${
                          aldreteScores.saturation === opt.val 
                            ? 'bg-violet-500/20 border-violet-500/50 text-violet-300' 
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        {opt.label} ({opt.val})
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            <div className="p-5 border-t border-slate-800 bg-slate-800/50 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-xs text-slate-400 uppercase tracking-wider">Total Score</p>
                  <p className="text-3xl font-bold text-white">{calculatePacuScore()}<span className="text-lg text-slate-500">/10</span></p>
                </div>
                {calculatePacuScore() >= 9 ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-sm font-bold border border-emerald-500/30">
                    <CheckCircle2 size={16} /> Fit for Ward Discharge
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-400 text-sm font-bold border border-amber-500/30">
                    <Clock size={16} /> Retain in PACU
                  </span>
                )}
              </div>
              <button 
                onClick={handleSavePacuScore}
                className="bg-violet-600 hover:bg-violet-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center gap-2"
              >
                Save Evaluation
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

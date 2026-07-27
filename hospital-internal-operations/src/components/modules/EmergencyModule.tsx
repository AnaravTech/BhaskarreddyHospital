import React, { useState, useMemo } from 'react';
import { 
  AlertTriangle, 
  Activity, 
  Clock, 
  HeartPulse, 
  ShieldAlert, 
  Bed, 
  Search, 
  Stethoscope, 
  AlertCircle, 
  UserPlus,
  ArrowRight,
  ClipboardList,
  Flame,
  Zap,
  Printer,
  X,
  CheckCircle2,
  Brain,
  Ambulance,
  Gavel
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';

// Mock Data
const TRIAGE_CASES = [
  { id: 'EM-1001', name: 'Unknown Male #1', age: 45, gender: 'M', arrival: '10 mins ago', triage: 'Red', type: 'Road Traffic Accident', attending: 'Dr. Sameer Khan', status: 'Resuscitation', bp: '80/50', pulse: '120', spo2: '88%', gcs: 8, mlc: true },
  { id: 'EM-1002', name: 'Ravi Teja', age: 52, gender: 'M', arrival: '25 mins ago', triage: 'Red', type: 'Acute STEMI', attending: 'Dr. Vikram Reddy', status: 'In Cath Lab', bp: '90/60', pulse: '45', spo2: '92%', gcs: 15, mlc: false },
  { id: 'EM-1003', name: 'Sita Devi', age: 34, gender: 'F', arrival: '40 mins ago', triage: 'Yellow', type: 'Severe Asthma', attending: 'Dr. Sameer Khan', status: 'Stabilization', bp: '130/85', pulse: '110', spo2: '90%', gcs: 15, mlc: false },
  { id: 'EM-1004', name: 'K. Prasad', age: 28, gender: 'M', arrival: '1 hr ago', triage: 'Yellow', type: 'Snake Bite', attending: 'Dr. Sameer Khan', status: 'Observation', bp: '110/70', pulse: '95', spo2: '98%', gcs: 15, mlc: true },
  { id: 'EM-1005', name: 'M. Lakshmi', age: 60, gender: 'F', arrival: '1.5 hrs ago', triage: 'Yellow', type: 'Suspected Stroke', attending: 'Dr. Sameer Khan', status: 'Awaiting CT', bp: '180/100', pulse: '88', spo2: '96%', gcs: 14, mlc: false },
  { id: 'EM-1006', name: 'V. Kumar', age: 19, gender: 'M', arrival: '2 hrs ago', triage: 'Green', type: 'Minor Cut/Laceration', attending: 'Dr. Sameer Khan', status: 'Awaiting Suture', bp: '120/80', pulse: '78', spo2: '99%', gcs: 15, mlc: false },
  { id: 'EM-1007', name: 'P. Rani', age: 40, gender: 'F', arrival: '2.5 hrs ago', triage: 'Green', type: 'Viral Fever / Dehydration', attending: 'Dr. Sameer Khan', status: 'IV Fluids', bp: '110/70', pulse: '90', spo2: '98%', gcs: 15, mlc: false },
];

const MLC_CASES = [
  { id: 'MLC-2026-001', emId: 'EM-1001', patientName: 'Unknown Male #1', type: 'Road Traffic Accident', station: 'II Town Police Station, Nellore', status: 'Pending Intimation', broughtBy: '108 Ambulance (AP 26 TA 1234)', date: 'Today, 14:30' },
  { id: 'MLC-2026-002', emId: 'EM-1004', patientName: 'K. Prasad', type: 'Poisoning / Snake Bite', station: 'Rural Police Station, Nellore', status: 'Intimated', broughtBy: 'Ramesh (Brother, 9876543210)', date: 'Today, 13:15' },
  { id: 'MLC-2026-003', emId: 'EM-0998', patientName: 'S. Suresh', type: 'Assault', station: 'IV Town Police Station, Nellore', status: 'FIR Filed', broughtBy: 'Self', date: 'Yesterday, 22:00' },
];

const PROTOCOLS = [
  { title: 'Cardiac Arrest (ACLS)', icon: <HeartPulse className="w-5 h-5" />, color: 'rose', steps: ['Initiate CPR (30:2)', 'Attach Defibrillator/Monitor', 'Shockable rhythm? -> Defibrillate', 'Epinephrine 1mg IV every 3-5 mins', 'Amiodarone 300mg IV for refractory VF/pVT', 'Consider H&Ts'] },
  { title: 'Anaphylaxis', icon: <AlertCircle className="w-5 h-5" />, color: 'amber', steps: ['Remove trigger if possible', 'Epinephrine 0.3-0.5mg IM (Anterolateral thigh)', 'High-flow oxygen', 'IV Fluids (Normal Saline)', 'Antihistamines (Diphenhydramine 50mg IV)', 'Corticosteroids (Hydrocortisone 200mg IV)'] },
  { title: 'Snake Bite (ASV Protocol)', icon: <Zap className="w-5 h-5" />, color: 'emerald', steps: ['Immobilize affected limb', 'Do NOT incise, suction, or apply tourniquet', 'Check 20WBCT (20 min Whole Blood Clotting Test)', 'If 20WBCT abnormal -> Administer 10 vials ASV (Polyvalent) in 500ml NS over 1 hr', 'Monitor for anaphylaxis to ASV', 'Repeat 20WBCT after 6 hrs'] },
  { title: 'Acute Stroke (Thrombolysis)', icon: <Brain className="w-5 h-5" />, color: 'violet', steps: ['Activate Stroke Team', 'Urgent Non-Contrast CT Head', 'Check Blood Glucose', 'Determine time of onset (<4.5 hrs window)', 'Control BP (<185/110 mmHg)', 'Alteplase (rt-PA) 0.9 mg/kg (max 90mg) if eligible'] },
];

export const EmergencyModule: React.FC = () => {
  const { addToast, setActiveModule } = useHospital();
  
  const [activeTab, setActiveTab] = useState<'triage' | 'mlc' | 'protocols'>('triage');
  const [triageFilter, setTriageFilter] = useState<'All' | 'Red' | 'Yellow' | 'Green'>('All');
  
  const [isIntakeModalOpen, setIsIntakeModalOpen] = useState(false);
  const [isMlcModalOpen, setIsMlcModalOpen] = useState(false);
  const [selectedMlcCase, setSelectedMlcCase] = useState<any>(null);

  const filteredCases = useMemo(() => {
    if (triageFilter === 'All') return TRIAGE_CASES;
    return TRIAGE_CASES.filter(c => c.triage === triageFilter);
  }, [triageFilter]);

  const handleStabilize = (name: string) => {
    addToast(`Stabilization protocols initiated for ${name}`, 'success');
  };

  const openMlcForm = (emCase?: any) => {
    setSelectedMlcCase(emCase || null);
    setIsMlcModalOpen(true);
  };

  const getTriageColor = (level: string) => {
    switch (level) {
      case 'Red': return 'bg-rose-500/20 text-rose-400 border-rose-500/50';
      case 'Yellow': return 'bg-amber-500/20 text-amber-400 border-amber-500/50';
      case 'Green': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6 animate-in fade-in duration-500">
      {/* Header & KPI Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Ambulance className="w-8 h-8 text-rose-500" />
            Emergency Command Center
          </h1>
          <p className="text-slate-400 mt-1">Level 1 Trauma & Emergency Response</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsIntakeModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(244,63,94,0.3)] hover:shadow-[0_0_25px_rgba(244,63,94,0.5)]"
          >
            <UserPlus className="w-5 h-5" />
            Rapid Intake
          </button>
          <button 
            onClick={() => openMlcForm()}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold transition-all"
          >
            <ShieldAlert className="w-5 h-5" />
            Register MLC
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Cases</span>
            <Activity className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">7</span>
            <span className="text-sm text-cyan-400">Total</span>
          </div>
        </div>
        
        <div className="bg-slate-900/90 border border-rose-500/30 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute inset-0 bg-rose-500/5 group-hover:bg-rose-500/10 transition-colors"></div>
          <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-rose-500 animate-ping"></div>
          <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-rose-500"></div>
          
          <div className="flex items-center justify-between text-slate-400 relative z-10">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-400">Red Priority</span>
            <Flame className="w-5 h-5 text-rose-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2 relative z-10">
            <span className="text-3xl font-bold text-white">2</span>
            <span className="text-sm text-rose-400">Critical</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">Yellow Priority</span>
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">3</span>
            <span className="text-sm text-amber-400">Urgent</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Green Priority</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">2</span>
            <span className="text-sm text-emerald-400">Non-Urgent</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-violet-500/30 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider text-violet-400">Active MLC</span>
            <Gavel className="w-5 h-5 text-violet-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">2</span>
            <span className="text-sm text-violet-400">Cases</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">ER Beds</span>
            <Bed className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">8</span>
            <span className="text-lg text-slate-400">/ 10</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2">
            <div className="bg-cyan-500 h-1.5 rounded-full" style={{ width: '80%' }}></div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800/80 gap-6">
        <button
          onClick={() => setActiveTab('triage')}
          className={`pb-3 font-semibold text-sm transition-colors relative ${activeTab === 'triage' ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-300'}`}
        >
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Triage Queue
          </div>
          {activeTab === 'triage' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-t-full shadow-[0_0_10px_rgba(34,211,238,0.5)]" />}
        </button>
        <button
          onClick={() => setActiveTab('mlc')}
          className={`pb-3 font-semibold text-sm transition-colors relative ${activeTab === 'mlc' ? 'text-violet-400' : 'text-slate-400 hover:text-slate-300'}`}
        >
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4" />
            MLC Register
          </div>
          {activeTab === 'mlc' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-400 rounded-t-full shadow-[0_0_10px_rgba(167,139,250,0.5)]" />}
        </button>
        <button
          onClick={() => setActiveTab('protocols')}
          className={`pb-3 font-semibold text-sm transition-colors relative ${activeTab === 'protocols' ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-300'}`}
        >
          <div className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4" />
            ER Protocols
          </div>
          {activeTab === 'protocols' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-t-full shadow-[0_0_10px_rgba(34,211,238,0.5)]" />}
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {activeTab === 'triage' && (
          <div className="space-y-4">
            <div className="flex gap-2 mb-4">
              {['All', 'Red', 'Yellow', 'Green'].map(filter => (
                <button
                  key={filter}
                  onClick={() => setTriageFilter(filter as any)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
                    triageFilter === filter 
                      ? filter === 'All' ? 'bg-slate-700 text-white' : getTriageColor(filter)
                      : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {filter} Priority
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-4">
              {filteredCases.map(c => (
                <div key={c.id} className={`bg-slate-900/90 border rounded-2xl p-4 flex flex-col lg:flex-row gap-4 transition-all hover:bg-slate-800/80 ${
                  c.triage === 'Red' ? 'border-rose-500/30' : 
                  c.triage === 'Yellow' ? 'border-amber-500/30' : 
                  'border-emerald-500/30'
                }`}>
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Patient Info */}
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-white text-lg">{c.name}</h3>
                          <div className="text-slate-400 text-xs mt-1 flex items-center gap-2">
                            <span>{c.age} Y / {c.gender}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                            <span>{c.id}</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold border ${getTriageColor(c.triage)}`}>
                          {c.triage} Priority
                        </span>
                        {c.mlc && (
                          <span className="px-2 py-0.5 rounded text-xs font-bold bg-violet-500/20 text-violet-400 border border-violet-500/50 flex items-center gap-1">
                            <Gavel className="w-3 h-3" /> MLC
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Clinical Details */}
                    <div>
                      <div className="text-slate-400 text-xs font-semibold mb-1 uppercase">Condition</div>
                      <div className="text-white font-medium">{c.type}</div>
                      <div className="text-slate-400 text-xs mt-2 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Arr: {c.arrival}
                      </div>
                      <div className="text-slate-400 text-xs mt-1 flex items-center gap-1">
                        <Stethoscope className="w-3 h-3" /> {c.attending}
                      </div>
                    </div>

                    {/* Vitals */}
                    <div className="bg-slate-950/50 rounded-xl p-2 border border-slate-800">
                      <div className="text-slate-400 text-xs font-semibold mb-2 uppercase">Initial Vitals</div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-slate-500 block text-[10px]">BP</span>
                          <span className={parseInt(c.bp.split('/')[0]) < 90 || parseInt(c.bp.split('/')[0]) > 160 ? 'text-rose-400 font-bold' : 'text-slate-200'}>{c.bp}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">Pulse</span>
                          <span className={parseInt(c.pulse) > 100 || parseInt(c.pulse) < 60 ? 'text-rose-400 font-bold' : 'text-slate-200'}>{c.pulse}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">SpO2</span>
                          <span className={parseInt(c.spo2) < 94 ? 'text-amber-400 font-bold' : 'text-slate-200'}>{c.spo2}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">GCS</span>
                          <span className={c.gcs < 15 ? 'text-amber-400 font-bold' : 'text-slate-200'}>{c.gcs}/15</span>
                        </div>
                      </div>
                    </div>

                    {/* Status & Actions */}
                    <div className="flex flex-col justify-between">
                      <div>
                        <div className="text-slate-400 text-xs font-semibold mb-1 uppercase">Current Status</div>
                        <div className="text-cyan-400 font-medium text-sm flex items-center gap-1.5">
                          <Activity className="w-4 h-4" /> {c.status}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="lg:w-48 flex flex-col gap-2 border-t lg:border-t-0 lg:border-l border-slate-800/80 pt-4 lg:pt-0 lg:pl-4">
                    <button 
                      onClick={() => handleStabilize(c.name)}
                      className="w-full px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 border border-slate-700"
                    >
                      <Activity className="w-3.5 h-3.5" /> Stabilize
                    </button>
                    <button 
                      onClick={() => setActiveModule('bed-management')}
                      className="w-full px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 border border-slate-700"
                    >
                      <Bed className="w-3.5 h-3.5" /> Req ICU Bed
                    </button>
                    {!c.mlc && (
                      <button 
                        onClick={() => openMlcForm(c)}
                        className="w-full px-3 py-1.5 bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 border border-violet-500/30"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" /> Register MLC
                      </button>
                    )}
                    <button 
                      onClick={() => addToast(`Transferring ${c.name} to OT`, 'success')}
                      className="w-full px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 border border-slate-700 mt-auto"
                    >
                      Transfer OT <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'mlc' && (
          <div className="space-y-4">
            <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-900">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <Gavel className="w-5 h-5 text-violet-400" />
                  Medico-Legal Case (MLC) Register
                </h3>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    placeholder="Search MLC / Patient..." 
                    className="bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-lg pl-9 pr-4 py-1.5 focus:outline-none focus:border-violet-500 w-64"
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="text-xs text-slate-400 uppercase bg-slate-950/50 border-b border-slate-800/80">
                    <tr>
                      <th className="px-4 py-3">MLC No & Date</th>
                      <th className="px-4 py-3">Patient / EM ID</th>
                      <th className="px-4 py-3">Incident Type</th>
                      <th className="px-4 py-3">Police Station</th>
                      <th className="px-4 py-3">Brought By</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MLC_CASES.map((mlc) => (
                      <tr key={mlc.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-violet-400">{mlc.id}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{mlc.date}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-white">{mlc.patientName}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{mlc.emId}</div>
                        </td>
                        <td className="px-4 py-3">{mlc.type}</td>
                        <td className="px-4 py-3">{mlc.station}</td>
                        <td className="px-4 py-3">
                          <span className="text-xs">{mlc.broughtBy}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                            mlc.status === 'Pending Intimation' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' :
                            mlc.status === 'FIR Filed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                            'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          }`}>
                            {mlc.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button 
                            onClick={() => addToast('Generating Police Intimation Form...', 'info')}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors inline-flex"
                            title="Print Form"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'protocols' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PROTOCOLS.map((protocol, i) => (
              <div key={i} className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 hover:border-cyan-500/30 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2.5 rounded-xl bg-${protocol.color}-500/20 text-${protocol.color}-400 border border-${protocol.color}-500/30`}>
                    {protocol.icon}
                  </div>
                  <h3 className="font-bold text-white text-lg">{protocol.title}</h3>
                </div>
                <div className="space-y-2">
                  {protocol.steps.map((step, idx) => (
                    <div key={idx} className="flex gap-3 text-sm">
                      <div className="w-5 h-5 rounded bg-slate-800 text-slate-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <div className="text-slate-300">{step}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rapid Intake Modal */}
      {isIntakeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-rose-500" />
                Rapid Trauma Intake
              </h2>
              <button onClick={() => setIsIntakeModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase">Patient Name</label>
                  <input type="text" defaultValue="Unknown Male #2" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400 uppercase">Est. Age</label>
                    <input type="number" placeholder="e.g. 30" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400 uppercase">Gender</label>
                    <select className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500">
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase">Triage Level</label>
                <div className="grid grid-cols-3 gap-3">
                  <button className="py-2 rounded-lg border-2 border-rose-500 bg-rose-500/20 text-rose-400 font-bold flex items-center justify-center gap-2">
                    <Flame className="w-4 h-4" /> Red (Critical)
                  </button>
                  <button className="py-2 rounded-lg border border-slate-700 bg-slate-950 text-slate-400 hover:border-amber-500 hover:text-amber-400 font-bold transition-colors">
                    Yellow (Urgent)
                  </button>
                  <button className="py-2 rounded-lg border border-slate-700 bg-slate-950 text-slate-400 hover:border-emerald-500 hover:text-emerald-400 font-bold transition-colors">
                    Green (Non-Urgent)
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase">Chief Complaint / Injury</label>
                <input type="text" placeholder="e.g. Road traffic accident, severe head trauma" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500" />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase mb-2 block">Initial Vitals</label>
                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500">BP (mmHg)</label>
                    <input type="text" placeholder="120/80" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500">Pulse (bpm)</label>
                    <input type="number" placeholder="80" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500">SpO2 (%)</label>
                    <input type="number" placeholder="98" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500">GCS (3-15)</label>
                    <input type="number" placeholder="15" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end gap-3">
              <button 
                onClick={() => setIsIntakeModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  addToast('Patient registered in Triage', 'success');
                  setIsIntakeModalOpen(false);
                }}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-bold transition-colors"
              >
                Register & Allocate Bed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MLC Registration Modal */}
      {isMlcModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-violet-500" />
                Medico-Legal Case (MLC) Registration
              </h2>
              <button onClick={() => setIsMlcModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                {/* Left Col */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-white mb-3 border-b border-slate-800 pb-1">Patient Details</h3>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-400 uppercase">Patient Name</label>
                        <input type="text" defaultValue={selectedMlcCase?.name || ''} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-400 uppercase">Brought By</label>
                        <input type="text" placeholder="Name, Relationship, Contact, Vehicle #" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white mb-3 border-b border-slate-800 pb-1">Incident Details</h3>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-400 uppercase">MLC Type</label>
                        <select className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500">
                          <option>Road Traffic Accident (RTA)</option>
                          <option>Assault</option>
                          <option>Poisoning / Snake Bite</option>
                          <option>Burn Injury</option>
                          <option>Hanging / Asphyxia</option>
                          <option>Gunshot / Stab Wound</option>
                          <option>Brought Dead</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-400 uppercase">Police Station Jurisdiction</label>
                        <select className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500">
                          <option>II Town Police Station, Nellore</option>
                          <option>IV Town Police Station, Nellore</option>
                          <option>Rural Police Station, Nellore</option>
                          <option>Dargamitta Police Station</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Col */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-white mb-3 border-b border-slate-800 pb-1">Sample Preservation & Evidence</h3>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 p-2 bg-slate-950 border border-slate-800 rounded-lg cursor-pointer hover:border-violet-500/50">
                        <input type="checkbox" className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-violet-500 focus:ring-violet-500 focus:ring-offset-slate-900" />
                        <span className="text-sm text-slate-300">Blood sample preserved (BAC/Tox)</span>
                      </label>
                      <label className="flex items-center gap-2 p-2 bg-slate-950 border border-slate-800 rounded-lg cursor-pointer hover:border-violet-500/50">
                        <input type="checkbox" className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-violet-500 focus:ring-violet-500 focus:ring-offset-slate-900" />
                        <span className="text-sm text-slate-300">Stomach wash preserved</span>
                      </label>
                      <label className="flex items-center gap-2 p-2 bg-slate-950 border border-slate-800 rounded-lg cursor-pointer hover:border-violet-500/50">
                        <input type="checkbox" className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-violet-500 focus:ring-violet-500 focus:ring-offset-slate-900" />
                        <span className="text-sm text-slate-300">Clothes/Belongings preserved & sealed</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white mb-3 border-b border-slate-800 pb-1">Injury Description</h3>
                    <div className="space-y-1">
                      <textarea 
                        rows={4} 
                        placeholder="Describe injuries, dimensions, type (laceration, abrasion, contusion) and location..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500 resize-none"
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-between items-center">
              <div className="text-xs text-slate-400">
                Generating MLC will assign a unique Medico-Legal ID.
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsMlcModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    addToast('MLC Registered. Police Intimation Form Generated.', 'success');
                    setIsMlcModalOpen(false);
                  }}
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-bold transition-colors flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" /> Register & Print Form
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

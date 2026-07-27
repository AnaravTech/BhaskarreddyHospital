import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import { 
  Activity, Pill, Droplets, ClipboardCheck, History, AlertTriangle, 
  Thermometer, HeartPulse, User, CheckCircle2, Clock,
  ArrowDown, ArrowUp, Plus, X
} from 'lucide-react';

type Ward = 'Cardiac ICU' | 'Surgical ICU' | 'Female Ward' | 'Male General Ward' | 'Private Deluxe Suite';

const WARDS: Ward[] = ['Cardiac ICU', 'Surgical ICU', 'Female Ward', 'Male General Ward', 'Private Deluxe Suite'];

interface PatientDisplay {
  id: string;
  uhid: string;
  name: string;
  age: number;
  gender: string;
  bed: string;
  doctor: string;
  diagnosis: string;
  status: 'Stable' | 'Observation' | 'Critical';
}

const MOCK_PATIENTS: Record<Ward, PatientDisplay[]> = {
  'Cardiac ICU': [
    { id: 'P001', uhid: 'UHID-2394', name: 'Ramesh Kumar', age: 58, gender: 'M', bed: 'CICU-01', doctor: 'Dr. Vikram Reddy', diagnosis: 'Myocardial Infarction', status: 'Critical' },
    { id: 'P002', uhid: 'UHID-8832', name: 'Sujatha Rao', age: 62, gender: 'F', bed: 'CICU-02', doctor: 'Dr. Vikram Reddy', diagnosis: 'Severe Angina', status: 'Observation' },
  ],
  'Surgical ICU': [
    { id: 'P003', uhid: 'UHID-1102', name: 'Kiran Reddy', age: 45, gender: 'M', bed: 'SICU-01', doctor: 'Dr. Rajeshwar Rao', diagnosis: 'Post-op Femur Fracture', status: 'Observation' },
  ],
  'Female Ward': [
    { id: 'P004', uhid: 'UHID-5541', name: 'Lakshmi Devi', age: 34, gender: 'F', bed: 'FW-12', doctor: 'Dr. Madhu Latha Marreddy', diagnosis: 'Post-CS', status: 'Stable' },
  ],
  'Male General Ward': [
    { id: 'P005', uhid: 'UHID-9921', name: 'Srinivasulu', age: 50, gender: 'M', bed: 'MGW-05', doctor: 'Dr. Sameer Khan', diagnosis: 'Viral Fever', status: 'Stable' },
  ],
  'Private Deluxe Suite': [
    { id: 'P006', uhid: 'UHID-7732', name: 'Venkatesh', age: 40, gender: 'M', bed: 'PDS-01', doctor: 'Dr. Vikram Reddy', diagnosis: 'Hypertension Evaluation', status: 'Stable' },
  ]
};

type TabType = 'mar' | 'vitals' | 'io' | 'assessments' | 'handover';

export const NursingStationModule: React.FC = () => {
  const { addToast, currentUser } = useHospital();
  const [selectedWard, setSelectedWard] = useState<Ward>('Cardiac ICU');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>('P001');
  const [activeTab, setActiveTab] = useState<TabType>('mar');

  // Modal States
  const [showVitalsModal, setShowVitalsModal] = useState(false);
  const [showIOModal, setShowIOModal] = useState<'intake' | 'output' | null>(null);

  const wardPatients = MOCK_PATIENTS[selectedWard];
  const selectedPatient = wardPatients.find(p => p.id === selectedPatientId) || wardPatients[0];

  // Handler for changing patient implicitly updates selected patient id if not found
  React.useEffect(() => {
    if (!wardPatients.find(p => p.id === selectedPatientId) && wardPatients.length > 0) {
      setSelectedPatientId(wardPatients[0].id);
    }
  }, [selectedWard, selectedPatientId, wardPatients]);

  const handleAction = (msg: string) => {
    addToast(msg, 'success');
  };

  return (
    <div className="h-full flex flex-col space-y-4 text-slate-200">
      {/* Ward Header */}
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-cyan-400">Nursing Workstation</h2>
          <p className="text-sm text-slate-400">Shift: Morning | Nurse: {currentUser?.name || 'Staff'}</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {WARDS.map(w => (
            <button
              key={w}
              onClick={() => setSelectedWard(w)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                selectedWard === w ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {w}
            </button>
          ))}
        </div>
      </div>

      {/* Ward Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">Total Patients</p>
            <p className="text-2xl font-bold text-slate-100">{wardPatients.length}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-cyan-900/50 flex items-center justify-center text-cyan-400">
            <User className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">MAR Due</p>
            <p className="text-2xl font-bold text-slate-100">4</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-900/50 flex items-center justify-center text-emerald-400">
            <Pill className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">Vitals Due</p>
            <p className="text-2xl font-bold text-slate-100">2</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-purple-900/50 flex items-center justify-center text-purple-400">
            <Activity className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">Urgent Alerts</p>
            <p className="text-2xl font-bold text-rose-500">1</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-rose-900/50 flex items-center justify-center text-rose-500">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Patient Selector */}
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 overflow-x-auto">
        <div className="flex space-x-4 min-w-max">
          {wardPatients.map(p => (
            <div
              key={p.id}
              onClick={() => setSelectedPatientId(p.id)}
              className={`flex-shrink-0 w-64 p-3 rounded-xl border cursor-pointer transition-all ${
                selectedPatientId === p.id 
                  ? 'border-cyan-500 bg-cyan-950/30' 
                  : 'border-slate-700 bg-slate-800/50 hover:bg-slate-800'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold bg-slate-700 px-2 py-1 rounded text-cyan-300">
                  {p.bed}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                  p.status === 'Critical' ? 'bg-rose-500/20 text-rose-400' :
                  p.status === 'Observation' ? 'bg-amber-500/20 text-amber-400' :
                  'bg-emerald-500/20 text-emerald-400'
                }`}>
                  {p.status}
                </span>
              </div>
              <h3 className="font-bold text-slate-100 truncate">{p.name}</h3>
              <p className="text-xs text-slate-400">{p.uhid} • {p.age}y/{p.gender}</p>
              <p className="text-xs text-slate-400 truncate mt-1">Dr. {p.doctor}</p>
              <p className="text-xs text-cyan-200/70 truncate">{p.diagnosis}</p>
            </div>
          ))}
          {wardPatients.length === 0 && (
            <p className="text-slate-500 p-4">No patients in this ward currently.</p>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {selectedPatient && (
        <div className="flex-1 bg-slate-900/90 border border-slate-800/80 rounded-2xl overflow-hidden flex flex-col min-h-[500px]">
          {/* Tabs */}
          <div className="flex overflow-x-auto border-b border-slate-800">
            {[
              { id: 'mar', label: 'MAR', icon: Pill },
              { id: 'vitals', label: 'Vitals & Telemetry', icon: Activity },
              { id: 'io', label: 'Fluid Balance (I/O)', icon: Droplets },
              { id: 'assessments', label: 'Assessments', icon: ClipboardCheck },
              { id: 'handover', label: 'Shift Handover', icon: History }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center px-6 py-4 text-sm font-semibold transition-colors border-b-2 whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'border-cyan-500 text-cyan-400 bg-cyan-950/20' 
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'mar' && <MARTab patient={selectedPatient} onAction={handleAction} />}
            {activeTab === 'vitals' && <VitalsTab patient={selectedPatient} onLog={() => setShowVitalsModal(true)} />}
            {activeTab === 'io' && <FluidBalanceTab patient={selectedPatient} onLog={(type: string) => setShowIOModal(type.toLowerCase() as 'intake' | 'output')} />}
            {activeTab === 'assessments' && <AssessmentsTab patient={selectedPatient} onAction={handleAction} />}
            {activeTab === 'handover' && <HandoverTab patient={selectedPatient} onAction={handleAction} />}
          </div>
        </div>
      )}

      {/* Modals */}
      {showVitalsModal && (
        <VitalsModal onClose={() => setShowVitalsModal(false)} onSave={() => { setShowVitalsModal(false); handleAction('Vitals logged successfully'); }} />
      )}
      {showIOModal && (
        <IOModal type={showIOModal} onClose={() => setShowIOModal(null)} onSave={() => { setShowIOModal(null); handleAction(`${showIOModal === 'intake' ? 'Intake' : 'Output'} logged successfully`); }} />
      )}

    </div>
  );
};

// --- Sub-components for Tabs ---

const MARTab = ({ patient: _patient, onAction }: any) => {
  const marData = [
    { id: 1, med: 'Inj. Pantoprazole 40mg', route: 'IV', time: '08:00 AM', status: 'Given', nurse: 'Anjali', timeGiven: '08:05 AM' },
    { id: 2, med: 'Tab. Aspirin 75mg', route: 'Oral', time: '08:00 AM', status: 'Given', nurse: 'Anjali', timeGiven: '08:10 AM' },
    { id: 3, med: 'Inj. Ceftriaxone 1g', route: 'IV', time: '14:00 PM', status: 'Pending', nurse: '-', timeGiven: '-' },
    { id: 4, med: 'Tab. Metoprolol 25mg', route: 'Oral', time: '14:00 PM', status: 'Pending', nurse: '-', timeGiven: '-' },
    { id: 5, med: 'Inj. Heparin 5000 IU', route: 'SC', time: '20:00 PM', status: 'Pending', nurse: '-', timeGiven: '-' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold flex items-center"><Pill className="w-5 h-5 mr-2 text-cyan-400" /> Medication Schedule - Today</h3>
        <span className="px-3 py-1 bg-slate-800 rounded-lg text-sm text-cyan-300 border border-slate-700">Allergies: Penicillin</span>
      </div>
      
      <div className="bg-slate-800/30 rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-800/80 text-slate-300">
            <tr>
              <th className="px-4 py-3">Medicine</th>
              <th className="px-4 py-3">Route</th>
              <th className="px-4 py-3">Scheduled</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Given By</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {marData.map(row => (
              <tr key={row.id} className="hover:bg-slate-800/50">
                <td className="px-4 py-3 font-medium text-slate-200">{row.med}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${row.route === 'IV' ? 'bg-purple-500/20 text-purple-400' : row.route === 'Oral' ? 'bg-blue-500/20 text-blue-400' : 'bg-amber-500/20 text-amber-400'}`}>
                    {row.route}
                  </span>
                </td>
                <td className="px-4 py-3">{row.time}</td>
                <td className="px-4 py-3">
                  {row.status === 'Given' ? (
                    <span className="flex items-center text-emerald-400 text-xs font-semibold"><CheckCircle2 className="w-3 h-3 mr-1" /> Given at {row.timeGiven}</span>
                  ) : (
                    <span className="text-amber-400 text-xs font-semibold flex items-center"><Clock className="w-3 h-3 mr-1" /> Pending</span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-400">{row.nurse}</td>
                <td className="px-4 py-3 text-right space-x-2">
                  {row.status === 'Pending' && (
                    <>
                      <button onClick={() => onAction(`Marked ${row.med} as Given`)} className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-semibold text-xs transition-colors">Given</button>
                      <button onClick={() => onAction(`Marked ${row.med} as Refused`)} className="px-3 py-1 bg-slate-700 hover:bg-rose-600 text-white rounded font-semibold text-xs transition-colors">Refused</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const VitalsTab = ({ patient: _patient, onLog }: any) => {
  const vitalsData = [
    { time: '12:00 PM', bp: '138/88', pulse: 92, temp: 98.6, spo2: 96, rr: 18, pain: 2 },
    { time: '08:00 AM', bp: '142/92', pulse: 98, temp: 99.1, spo2: 95, rr: 20, pain: 4 },
    { time: '04:00 AM', bp: '135/85', pulse: 88, temp: 98.4, spo2: 97, rr: 16, pain: 2 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold flex items-center"><Activity className="w-5 h-5 mr-2 text-cyan-400" /> 24-Hr Vitals Telemetry</h3>
        <button onClick={onLog} className="flex items-center px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold transition-colors text-sm">
          <Plus className="w-4 h-4 mr-1" /> Log Vitals
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        {/* Latest Vitals Strip */}
        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 text-center">
          <HeartPulse className="w-6 h-6 text-rose-400 mx-auto mb-2" />
          <p className="text-xs text-slate-400">Blood Pressure</p>
          <p className="text-lg font-bold text-amber-400">138/88 <span className="text-xs">mmHg</span></p>
        </div>
        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 text-center">
          <Activity className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
          <p className="text-xs text-slate-400">Heart Rate</p>
          <p className="text-lg font-bold text-slate-200">92 <span className="text-xs">bpm</span></p>
        </div>
        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 text-center">
          <Thermometer className="w-6 h-6 text-amber-400 mx-auto mb-2" />
          <p className="text-xs text-slate-400">Temperature</p>
          <p className="text-lg font-bold text-slate-200">98.6 <span className="text-xs">°F</span></p>
        </div>
        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 text-center">
          <Droplets className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
          <p className="text-xs text-slate-400">SpO2</p>
          <p className="text-lg font-bold text-slate-200">96 <span className="text-xs">%</span></p>
        </div>
        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 text-center">
          <Activity className="w-6 h-6 text-blue-400 mx-auto mb-2" />
          <p className="text-xs text-slate-400">Resp Rate</p>
          <p className="text-lg font-bold text-slate-200">18 <span className="text-xs">/min</span></p>
        </div>
        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 text-center">
          <AlertTriangle className="w-6 h-6 text-purple-400 mx-auto mb-2" />
          <p className="text-xs text-slate-400">Pain Score</p>
          <p className="text-lg font-bold text-slate-200">2 <span className="text-xs">/10</span></p>
        </div>
      </div>

      <div className="bg-slate-800/30 rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-800/80 text-slate-300">
            <tr>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">BP (mmHg)</th>
              <th className="px-4 py-3">Pulse (bpm)</th>
              <th className="px-4 py-3">Temp (°F)</th>
              <th className="px-4 py-3">SpO2 (%)</th>
              <th className="px-4 py-3">RR (/min)</th>
              <th className="px-4 py-3">Pain (0-10)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {vitalsData.map((v, i) => (
              <tr key={i} className="hover:bg-slate-800/50 text-slate-200">
                <td className="px-4 py-3 font-medium text-slate-400">{v.time}</td>
                <td className="px-4 py-3">
                  <span className={v.bp.startsWith('14') ? 'text-amber-400 font-bold' : ''}>{v.bp}</span>
                </td>
                <td className="px-4 py-3">{v.pulse}</td>
                <td className="px-4 py-3">{v.temp}</td>
                <td className="px-4 py-3">{v.spo2}</td>
                <td className="px-4 py-3">{v.rr}</td>
                <td className="px-4 py-3">{v.pain}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const FluidBalanceTab = ({ patient: _patient, onLog }: any) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold flex items-center"><Droplets className="w-5 h-5 mr-2 text-cyan-400" /> 24-Hr Fluid Balance</h3>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 flex justify-between items-center shadow-lg">
        <div className="text-center px-6">
          <p className="text-sm text-slate-400 mb-1">Total Intake</p>
          <p className="text-2xl font-bold text-cyan-400">2,450 mL</p>
        </div>
        <div className="text-4xl text-slate-600">-</div>
        <div className="text-center px-6">
          <p className="text-sm text-slate-400 mb-1">Total Output</p>
          <p className="text-2xl font-bold text-amber-400">1,800 mL</p>
        </div>
        <div className="text-4xl text-slate-600">=</div>
        <div className="text-center px-6 border-l border-slate-700">
          <p className="text-sm text-slate-400 mb-1">Net Balance</p>
          <p className="text-2xl font-bold text-emerald-400">+650 mL</p>
          <p className="text-xs text-emerald-500/70">Positive</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Intake */}
        <div className="border border-slate-700 rounded-xl p-4 bg-slate-800/30">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold text-slate-200 flex items-center"><ArrowDown className="w-4 h-4 mr-2 text-cyan-400" /> Intake</h4>
            <button onClick={() => onLog('intake')} className="text-xs bg-cyan-900/50 hover:bg-cyan-800/50 text-cyan-300 px-3 py-1 rounded-lg transition-colors">+ Log Intake</button>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-slate-700/50 pb-2">
              <span className="text-slate-400">08:00 AM - IV Normal Saline</span>
              <span className="font-medium text-slate-200">500 mL</span>
            </div>
            <div className="flex justify-between border-b border-slate-700/50 pb-2">
              <span className="text-slate-400">10:30 AM - Oral Water</span>
              <span className="font-medium text-slate-200">250 mL</span>
            </div>
            <div className="flex justify-between border-b border-slate-700/50 pb-2">
              <span className="text-slate-400">13:00 PM - Soup (Oral)</span>
              <span className="font-medium text-slate-200">200 mL</span>
            </div>
            <div className="flex justify-between border-b border-slate-700/50 pb-2">
              <span className="text-slate-400">14:00 PM - IV RL</span>
              <span className="font-medium text-slate-200">1000 mL</span>
            </div>
             <div className="flex justify-between pt-2">
              <span className="text-cyan-400 font-bold">Total Intake</span>
              <span className="font-bold text-cyan-400">2450 mL</span>
            </div>
          </div>
        </div>

        {/* Output */}
        <div className="border border-slate-700 rounded-xl p-4 bg-slate-800/30">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold text-slate-200 flex items-center"><ArrowUp className="w-4 h-4 mr-2 text-amber-400" /> Output</h4>
            <button onClick={() => onLog('output')} className="text-xs bg-amber-900/50 hover:bg-amber-800/50 text-amber-300 px-3 py-1 rounded-lg transition-colors">+ Log Output</button>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-slate-700/50 pb-2">
              <span className="text-slate-400">09:00 AM - Urine (Catheter)</span>
              <span className="font-medium text-slate-200">600 mL</span>
            </div>
            <div className="flex justify-between border-b border-slate-700/50 pb-2">
              <span className="text-slate-400">12:00 PM - Surgical Drain</span>
              <span className="font-medium text-slate-200">150 mL</span>
            </div>
            <div className="flex justify-between border-b border-slate-700/50 pb-2">
              <span className="text-slate-400">14:30 PM - Urine (Catheter)</span>
              <span className="font-medium text-slate-200">550 mL</span>
            </div>
            <div className="flex justify-between border-b border-slate-700/50 pb-2">
              <span className="text-slate-400">17:00 PM - Urine (Catheter)</span>
              <span className="font-medium text-slate-200">500 mL</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-amber-400 font-bold">Total Output</span>
              <span className="font-bold text-amber-400">1800 mL</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AssessmentsTab = ({ patient: _patient, onAction }: any) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold flex items-center"><ClipboardCheck className="w-5 h-5 mr-2 text-cyan-400" /> Nursing Clinical Assessments</h3>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Morse Fall Risk */}
        <div className="border border-slate-700 rounded-xl p-5 bg-slate-800/30">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h4 className="font-bold text-slate-200 text-lg">Morse Fall Risk Assessment</h4>
              <p className="text-xs text-slate-400">Last assessed: Today, 08:00 AM</p>
            </div>
            <span className="px-3 py-1 bg-amber-500/20 text-amber-400 font-bold rounded-lg border border-amber-500/50">Score: 35 (Moderate)</span>
          </div>
          
          <div className="space-y-2 text-sm text-slate-300">
            <div className="flex justify-between"><span>History of falling:</span> <span className="font-semibold">No (0)</span></div>
            <div className="flex justify-between"><span>Secondary diagnosis:</span> <span className="font-semibold">Yes (15)</span></div>
            <div className="flex justify-between"><span>Ambulatory aid:</span> <span className="font-semibold">None (0)</span></div>
            <div className="flex justify-between"><span>IV/Heparin Lock:</span> <span className="font-semibold">Yes (20)</span></div>
            <div className="flex justify-between"><span>Gait/Transferring:</span> <span className="font-semibold">Normal (0)</span></div>
            <div className="flex justify-between"><span>Mental status:</span> <span className="font-semibold">Oriented (0)</span></div>
          </div>
          <button onClick={() => onAction('Fall Risk Assessment updated')} className="mt-4 w-full py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-semibold transition-colors">Re-assess Fall Risk</button>
        </div>

        {/* Braden Scale */}
        <div className="border border-slate-700 rounded-xl p-5 bg-slate-800/30">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h4 className="font-bold text-slate-200 text-lg">Braden Pressure Ulcer Risk</h4>
              <p className="text-xs text-slate-400">Last assessed: Today, 08:15 AM</p>
            </div>
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 font-bold rounded-lg border border-emerald-500/50">Score: 18 (Low Risk)</span>
          </div>
          
          <div className="space-y-2 text-sm text-slate-300">
            <div className="flex justify-between"><span>Sensory perception:</span> <span className="font-semibold">4 - No Impairment</span></div>
            <div className="flex justify-between"><span>Moisture:</span> <span className="font-semibold">3 - Occasionally</span></div>
            <div className="flex justify-between"><span>Activity:</span> <span className="font-semibold">4 - Walks</span></div>
            <div className="flex justify-between"><span>Mobility:</span> <span className="font-semibold">4 - No Limitations</span></div>
            <div className="flex justify-between"><span>Nutrition:</span> <span className="font-semibold">3 - Adequate</span></div>
            <div className="flex justify-between"><span>Friction/Shear:</span> <span className="font-semibold">3 - No Problem</span></div>
          </div>
          <button onClick={() => onAction('Braden Scale updated')} className="mt-4 w-full py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-semibold transition-colors">Re-assess Braden Scale</button>
        </div>
      </div>
    </div>
  );
};

const HandoverTab = ({ patient: _patient, onAction }: any) => {
  const [note, setNote] = useState('');
  
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold flex items-center"><History className="w-5 h-5 mr-2 text-cyan-400" /> Shift Handover (SBAR)</h3>

      <div className="bg-slate-800/30 border border-slate-700 p-4 rounded-xl">
        <h4 className="text-sm font-bold text-slate-300 mb-2">Previous Shift (Night) - Nurse Sunita</h4>
        <div className="bg-slate-900/50 p-3 rounded-lg text-sm text-slate-300 space-y-2">
          <p><strong className="text-cyan-400">S (Situation):</strong> Patient admitted with severe angina. Stable overnight.</p>
          <p><strong className="text-cyan-400">B (Background):</strong> 58M, known case of HTN, Type 2 DM.</p>
          <p><strong className="text-cyan-400">A (Assessment):</strong> Vitals stable, pain 2/10. IV fluids continuing at 100ml/hr.</p>
          <p><strong className="text-cyan-400">R (Recommendation):</strong> Review morning ECG. Continue monitoring BP strictly.</p>
        </div>
      </div>

      <div className="bg-slate-800/30 border border-slate-700 p-4 rounded-xl">
        <h4 className="text-sm font-bold text-slate-300 mb-3">Add Current Shift Handover (Morning)</h4>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Enter Situation, Background, Assessment, and Recommendation..."
          className="w-full h-32 bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 placeholder-slate-600"
        />
        <div className="flex justify-end mt-3">
          <button 
            onClick={() => {
              if(!note) return onAction('Please enter notes');
              onAction('Handover saved successfully');
              setNote('');
            }} 
            className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold transition-colors"
          >
            Save Handover Note
          </button>
        </div>
      </div>
    </div>
  );
};


// Modals

const VitalsModal = ({ onClose, onSave }: any) => (
  <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
      <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
        <h3 className="font-bold text-lg text-slate-200">Log New Vitals</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
      </div>
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Blood Pressure (mmHg)</label>
            <input type="text" placeholder="120/80" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Heart Rate (bpm)</label>
            <input type="number" placeholder="72" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Temperature (°F)</label>
            <input type="number" placeholder="98.6" step="0.1" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">SpO2 (%)</label>
            <input type="number" placeholder="98" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Resp Rate (/min)</label>
            <input type="number" placeholder="16" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Pain Score (0-10)</label>
            <input type="number" min="0" max="10" placeholder="0" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500" />
          </div>
        </div>
      </div>
      <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex justify-end space-x-3">
        <button onClick={onClose} className="px-4 py-2 rounded-xl font-bold text-slate-300 hover:bg-slate-800 transition-colors">Cancel</button>
        <button onClick={onSave} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold transition-colors">Save Vitals</button>
      </div>
    </div>
  </div>
);

const IOModal = ({ type, onClose, onSave }: any) => (
  <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
      <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
        <h3 className="font-bold text-lg text-slate-200 capitalize">Log {type}</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
      </div>
      <div className="p-4 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Source / Item</label>
          <select className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500">
            {type === 'intake' ? (
              <>
                <option>IV Fluid (Normal Saline)</option>
                <option>IV Fluid (RL)</option>
                <option>Oral (Water/Juice)</option>
                <option>Blood Transfusion</option>
              </>
            ) : (
              <>
                <option>Urine (Catheter)</option>
                <option>Urine (Voided)</option>
                <option>Surgical Drain</option>
                <option>Vomitus</option>
              </>
            )}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Volume (mL)</label>
          <input type="number" placeholder="e.g. 500" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500" />
        </div>
      </div>
      <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex justify-end space-x-3">
        <button onClick={onClose} className="px-4 py-2 rounded-xl font-bold text-slate-300 hover:bg-slate-800 transition-colors">Cancel</button>
        <button onClick={onSave} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold transition-colors">Save {type}</button>
      </div>
    </div>
  </div>
);

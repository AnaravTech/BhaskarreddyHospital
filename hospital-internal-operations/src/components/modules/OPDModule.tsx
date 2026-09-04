import React, { useState, useMemo } from 'react';
import { useHospital } from '../../context/HospitalContext';
import { 
  Users, CheckCircle, Activity,
  FileText, Pill, Plus, X,
  Printer, AlertTriangle, Stethoscope,
  ArrowRight, ClipboardPlus, Edit3, Send, AlertCircle, FileSearch
} from 'lucide-react';

const COMMON_SYMPTOMS = ['Chest Pain', 'Shortness of Breath', 'Palpitations', 'Headache', 'Fever', 'Cough', 'Fatigue', 'Nausea', 'Vomiting', 'Dizziness', 'Leg Pain', 'Back Pain'];
const MEDICINE_DB = ['Telmisartan 40mg', 'Amlodipine 5mg', 'Metoprolol 50mg', 'Aspirin 75mg', 'Pantoprazole 40mg', 'Metformin 500mg', 'Glimepiride 1mg', 'Rosuvastatin 10mg', 'Azithromycin 500mg', 'Cefixime 200mg'];
const LAB_TESTS = ['CBC', 'LFT', 'RFT', 'HbA1c', 'Lipid Profile', 'ECG', 'Echo', 'Chest X-Ray', 'CT Chest', 'MRI Brain'];

export const OPDModule: React.FC = () => {
  const { appointments, patients, addToast, setActiveModule } = useHospital();
  
  const [docStatus, setDocStatus] = useState<'On Duty' | 'In Consultation' | 'Break'>('On Duty');
  
  // Create a realistic queue from context data or fallback
  const todayQueue = useMemo(() => {
    if (appointments && appointments.length > 0 && patients && patients.length > 0) {
      return appointments.map((a, i) => {
        const p = patients.find(p => p.id === a.patientId);
        return {
          id: a.id,
          token: `CARD-${String(i+1).padStart(3, '0')}`,
          name: p?.name || 'Unknown',
          age: p?.age || 45,
          gender: p?.gender || 'M',
          bloodGroup: p?.bloodGroup || 'O+',
          type: i % 3 === 0 ? 'Follow-up' : i % 5 === 0 ? 'Premium' : 'New',
          status: i === 0 ? 'Done' : i === 1 ? 'In Consultation' : 'Waiting',
          time: a.appointmentTime || '10:00 AM',
          uhid: p?.id || `BRH-2026-${1000 + i}`
        };
      });
    }
    
    // Fallback if no context data
    return [
      { id: '1', token: 'CARD-001', name: 'Ramesh Babu', age: 45, gender: 'M', bloodGroup: 'O+', type: 'Follow-up', status: 'Done', time: '09:00 AM', uhid: 'BRH-2026-1001' },
      { id: '2', token: 'CARD-002', name: 'Srinivasa Rao', age: 62, gender: 'M', bloodGroup: 'A+', type: 'New', status: 'In Consultation', time: '09:30 AM', uhid: 'BRH-2026-1002' },
      { id: '3', token: 'CARD-003', name: 'Lakshmi Devi', age: 58, gender: 'F', bloodGroup: 'B+', type: 'Premium', status: 'Waiting', time: '10:00 AM', uhid: 'BRH-2026-1003' },
      { id: '4', token: 'CARD-004', name: 'Venkata Ramana', age: 50, gender: 'M', bloodGroup: 'O-', type: 'Follow-up', status: 'Waiting', time: '10:30 AM', uhid: 'BRH-2026-1004' },
      { id: '5', token: 'CARD-005', name: 'Padmavathi', age: 39, gender: 'F', bloodGroup: 'AB+', type: 'New', status: 'Waiting', time: '11:00 AM', uhid: 'BRH-2026-1005' },
    ];
  }, [appointments, patients]);

  const [activePatientId, setActivePatientId] = useState<string>(todayQueue.find(q => q.status === 'In Consultation')?.id || todayQueue[0]?.id);
  const activePatient = todayQueue.find(q => q.id === activePatientId) || todayQueue[0];

  const currentToken = todayQueue.find(q => q.status === 'In Consultation')?.token || '---';
  const waitingCount = todayQueue.filter(q => q.status === 'Waiting').length;
  
  // Vitals State
  const [vitals, setVitals] = useState({ sys: 120, dia: 80, pulse: 72, temp: 98.6, spo2: 98, weight: 70, height: 170 });
  const bmi = useMemo(() => (vitals.weight / ((vitals.height / 100) ** 2)).toFixed(1), [vitals.weight, vitals.height]);
  const bmiCategory = Number(bmi) < 18.5 ? 'Underweight' : Number(bmi) < 25 ? 'Normal' : Number(bmi) < 30 ? 'Overweight' : 'Obese';

  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(['Chest Pain', 'Fatigue']);
  const [customComplaint, setCustomComplaint] = useState('');
  
  const [diagnosis, setDiagnosis] = useState('I10 - Essential Hypertension');
  const [severity, setSeverity] = useState<'Mild' | 'Moderate' | 'Severe' | 'Critical'>('Moderate');

  const [activeNoteTab, setActiveNoteTab] = useState<'Subjective' | 'Objective' | 'Assessment' | 'Plan'>('Subjective');
  const [notes, setNotes] = useState({
    Subjective: 'Patient c/o intermittent chest pain for 3 days, non-radiating, associated with fatigue.',
    Objective: 'Patient is conscious, oriented. BP 140/90. No murmur.',
    Assessment: 'Suspected mild angina vs muscular pain. Essential HTN uncontrolled.',
    Plan: 'Adjust HTN meds. Order ECG and Trop-I. Advise strict salt restriction.'
  });

  const [prescriptions, setPrescriptions] = useState([
    { id: 'p1', medicine: 'Telmisartan 40mg', dosage: '1-0-0', timing: 'After Food', duration: 15 },
    { id: 'p2', medicine: 'Atorvastatin 10mg', dosage: '0-0-1', timing: 'After Food', duration: 30 }
  ]);
  const [newMed, setNewMed] = useState('');
  const [newDosage, setNewDosage] = useState('1-0-1');
  const [newTiming, setNewTiming] = useState('After Food');
  const [newDuration, setNewDuration] = useState('15');

  const [orderedLabs, setOrderedLabs] = useState<string[]>([]);
  const [followUpDate, setFollowUpDate] = useState('');

  const handleNextPatient = () => {
    const next = todayQueue.find(q => q.status === 'Waiting');
    if (next) {
      setActivePatientId(next.id);
      addToast(`Called next patient: ${next.name} (${next.token})`, 'success');
    } else {
      addToast('No more waiting patients', 'info');
    }
  };

  const handleAddMed = () => {
    if (newMed) {
      setPrescriptions([...prescriptions, { id: Math.random().toString(), medicine: newMed, dosage: newDosage, timing: newTiming, duration: parseInt(newDuration) || 5 }]);
      setNewMed('');
    }
  };

  const toggleLab = (test: string) => {
    if (orderedLabs.includes(test)) {
      setOrderedLabs(orderedLabs.filter(t => t !== test));
    } else {
      setOrderedLabs([...orderedLabs, test]);
    }
  };

  return (
    <div className="h-full w-full bg-slate-950 text-slate-100 p-2 sm:p-4 overflow-y-auto">
      <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4 lg:h-[calc(100vh-6rem)]">
        
        {/* LEFT PANEL: Queue Dashboard */}
        <div className="lg:col-span-3 flex flex-col gap-4 overflow-y-auto hidden-scrollbar">
          {/* Header Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-cyan-400" />
                Dr. Vikram Reddy
              </h2>
              <p className="text-xs text-slate-400">Cardiology Dept</p>
            </div>
            
            <div className="flex gap-2">
              {(['On Duty', 'In Consultation', 'Break'] as const).map(s => (
                <button 
                  key={s}
                  onClick={() => setDocStatus(s)}
                  className={`text-xs px-3 py-1.5 rounded-lg border flex-1 transition-colors ${
                    docStatus === s 
                      ? s === 'On Duty' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                      : s === 'In Consultation' ? 'bg-rose-500/20 border-rose-500/50 text-rose-400'
                      : 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between mt-2">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Current Token</p>
                <p className="text-3xl font-black text-cyan-400 tracking-tight">{currentToken}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400">Waiting</p>
                <div className="flex items-center justify-end gap-2">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span className={`text-xl font-bold ${waitingCount > 10 ? 'text-amber-400' : 'text-slate-100'}`}>{waitingCount}</span>
                </div>
              </div>
            </div>

            <button 
              onClick={handleNextPatient}
              className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              Next Patient <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Queue List */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl flex-1 flex flex-col min-h-[300px] overflow-hidden">
            <div className="p-3 border-b border-slate-800/80 bg-slate-800/30 flex justify-between items-center">
              <h3 className="font-bold text-sm">Today's Queue</h3>
              <span className="text-xs text-slate-400">Avg Wait: <span className="text-amber-400 font-bold">28m</span></span>
            </div>
            <div className="overflow-y-auto flex-1 p-2 space-y-2 hidden-scrollbar">
              {todayQueue.map(q => (
                <div 
                  key={q.id}
                  onClick={() => setActivePatientId(q.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    activePatientId === q.id ? 'bg-cyan-900/20 border-cyan-500/50 ring-1 ring-cyan-500/20' : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-bold text-cyan-400">{q.token}</span>
                    <span className="text-[10px] text-slate-400">{q.time}</span>
                  </div>
                  <div className="font-semibold text-sm mb-1">{q.name}</div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">{q.age}y • {q.gender}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      q.type === 'Follow-up' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' : 
                      q.type === 'Premium' ? 'bg-violet-500/20 text-violet-400 border border-violet-500/20' : 
                      'bg-cyan-500/20 text-cyan-400 border border-cyan-500/20'
                    }`}>{q.type}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      q.status === 'Waiting' ? 'bg-amber-400' :
                      q.status === 'In Consultation' ? 'bg-rose-400' : 'bg-emerald-400'
                    }`} />
                    <span className="text-[10px] text-slate-300">{q.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mini Missed & Avail */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3">
            <h3 className="text-xs font-bold text-slate-400 mb-2 uppercase">Other Doctors</h3>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs items-center bg-slate-800/50 p-1.5 rounded-lg">
                <span className="text-slate-300 truncate pr-2">Dr. Madhu Latha (OB/GYN)</span>
                <span className="text-rose-400 whitespace-nowrap">In Consult</span>
              </div>
              <div className="flex justify-between text-xs items-center bg-slate-800/50 p-1.5 rounded-lg">
                <span className="text-slate-300 truncate pr-2">Dr. Rajeshwar Rao (Ortho)</span>
                <span className="text-emerald-400 whitespace-nowrap">On Duty</span>
              </div>
            </div>
          </div>
        </div>

        {/* CENTER PANEL: Consultation Workbench */}
        <div className="lg:col-span-6 flex flex-col gap-4 overflow-y-auto hidden-scrollbar">
          
          {/* Patient Header */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-xl font-bold text-white shadow-inner">
                {activePatient?.name.substring(0,2).toUpperCase()}
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-100">{activePatient?.name}</h1>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                  <span>{activePatient?.uhid}</span>
                  <span>•</span>
                  <span>{activePatient?.age}y / {activePatient?.gender}</span>
                  <span>•</span>
                  <span className="text-rose-400 font-bold bg-rose-500/10 px-1.5 rounded">{activePatient?.bloodGroup}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
                activePatient?.type === 'Follow-up' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
              }`}>
                {activePatient?.type === 'Follow-up' ? 'Follow-up Valid — ₹0 Fee' : 'New Consultation'}
              </div>
              {activePatient?.name.includes('Devi') && (
                <div className="flex items-center gap-1 text-[10px] bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded-full border border-rose-500/30">
                  <AlertTriangle className="w-3 h-3" /> Allergy: Sulfa
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 flex-1">
            
            {/* Vitals */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-sm flex items-center gap-2"><Activity className="w-4 h-4 text-cyan-400"/> Triage & Vitals</h3>
                <button onClick={() => addToast('Vitals saved to EMR', 'success')} className="text-xs bg-slate-800 hover:bg-slate-700 text-cyan-400 px-3 py-1 rounded-lg transition-colors border border-slate-700">Save</button>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                <div className="bg-slate-800/50 p-2 rounded-xl border border-slate-700/50">
                  <label className="text-[10px] text-slate-400 block mb-1">BP (mmHg)</label>
                  <div className="flex items-center gap-1">
                    <input type="number" value={vitals.sys} onChange={e=>setVitals({...vitals, sys: +e.target.value})} className="w-full bg-transparent text-sm font-semibold text-slate-100 outline-none p-0 text-center" />
                    <span className="text-slate-500">/</span>
                    <input type="number" value={vitals.dia} onChange={e=>setVitals({...vitals, dia: +e.target.value})} className="w-full bg-transparent text-sm font-semibold text-slate-100 outline-none p-0 text-center" />
                  </div>
                  {vitals.sys > 140 && <div className="text-[9px] text-amber-400 text-center mt-1">Elevated</div>}
                </div>
                <div className="bg-slate-800/50 p-2 rounded-xl border border-slate-700/50">
                  <label className="text-[10px] text-slate-400 block mb-1">Pulse (bpm)</label>
                  <input type="number" value={vitals.pulse} onChange={e=>setVitals({...vitals, pulse: +e.target.value})} className="w-full bg-transparent text-sm font-semibold text-slate-100 outline-none p-0 text-center" />
                </div>
                <div className="bg-slate-800/50 p-2 rounded-xl border border-slate-700/50">
                  <label className="text-[10px] text-slate-400 block mb-1">Temp (°F)</label>
                  <input type="number" value={vitals.temp} onChange={e=>setVitals({...vitals, temp: +e.target.value})} className="w-full bg-transparent text-sm font-semibold text-slate-100 outline-none p-0 text-center" />
                </div>
                <div className="bg-slate-800/50 p-2 rounded-xl border border-slate-700/50">
                  <label className="text-[10px] text-slate-400 block mb-1">SpO2 (%)</label>
                  <input type="number" value={vitals.spo2} onChange={e=>setVitals({...vitals, spo2: +e.target.value})} className={`w-full bg-transparent text-sm font-semibold outline-none p-0 text-center ${vitals.spo2 < 94 ? 'text-rose-400' : 'text-slate-100'}`} />
                </div>
                <div className="bg-slate-800/50 p-2 rounded-xl border border-slate-700/50 col-span-2">
                  <label className="text-[10px] text-slate-400 block mb-1">BMI (Wt: {vitals.weight}kg / Ht: {vitals.height}cm)</label>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-slate-100">{bmi}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${bmiCategory === 'Normal' ? 'bg-emerald-500/20 text-emerald-400' : bmiCategory === 'Obese' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'}`}>{bmiCategory}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Symptoms & Diagnosis */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
              <h3 className="font-bold text-sm mb-3 flex items-center gap-2"><ClipboardPlus className="w-4 h-4 text-cyan-400"/> Symptoms & Diagnosis</h3>
              
              <div className="mb-4">
                <label className="text-xs text-slate-400 block mb-2">Chief Complaints</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {COMMON_SYMPTOMS.map(sym => (
                    <button
                      key={sym}
                      onClick={() => {
                        if (selectedSymptoms.includes(sym)) setSelectedSymptoms(selectedSymptoms.filter(s => s !== sym));
                        else setSelectedSymptoms([...selectedSymptoms, sym]);
                      }}
                      className={`text-[11px] px-3 py-1.5 rounded-full transition-all border ${
                        selectedSymptoms.includes(sym) ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      {sym}
                    </button>
                  ))}
                </div>
                <input 
                  type="text" 
                  value={customComplaint}
                  onChange={e => setCustomComplaint(e.target.value)}
                  placeholder="+ Add custom complaint..."
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-cyan-500/50"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Primary Diagnosis (ICD-10)</label>
                  <input 
                    type="text" 
                    value={diagnosis}
                    onChange={e => setDiagnosis(e.target.value)}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-2 text-sm text-emerald-400 outline-none focus:border-cyan-500/50 font-medium"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Severity</label>
                  <div className="flex gap-2 h-[38px]">
                    {(['Mild', 'Moderate', 'Severe', 'Critical'] as const).map(s => (
                      <button 
                        key={s}
                        onClick={() => setSeverity(s)}
                        className={`flex-1 text-[11px] rounded-lg border transition-colors ${
                          severity === s 
                            ? s === 'Critical' ? 'bg-rose-500/20 border-rose-500/50 text-rose-400' 
                            : s === 'Severe' ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                            : s === 'Moderate' ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                            : 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Clinical Notes SOAP */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col">
              <h3 className="font-bold text-sm mb-3 flex items-center gap-2"><Edit3 className="w-4 h-4 text-cyan-400"/> Clinical Notes (SOAP)</h3>
              <div className="flex gap-1 mb-2 border-b border-slate-800">
                {(['Subjective', 'Objective', 'Assessment', 'Plan'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveNoteTab(tab)}
                    className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors ${
                      activeNoteTab === tab ? 'border-cyan-400 text-cyan-400 bg-cyan-400/5' : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <textarea
                value={notes[activeNoteTab]}
                onChange={e => setNotes({...notes, [activeNoteTab]: e.target.value})}
                className="w-full flex-1 min-h-[100px] bg-slate-800/30 border border-slate-700 rounded-xl p-3 text-sm text-slate-300 outline-none focus:border-cyan-500/50 focus:bg-slate-800/50 resize-none"
              />
            </div>

            {/* E-Prescription */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
              <h3 className="font-bold text-sm mb-3 flex items-center gap-2"><Pill className="w-4 h-4 text-violet-400"/> e-Prescription</h3>
              
              <div className="bg-slate-950/50 rounded-xl border border-slate-800 overflow-hidden mb-4">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800 text-slate-400">
                    <tr>
                      <th className="p-2 font-medium">Medicine</th>
                      <th className="p-2 font-medium">Dosage</th>
                      <th className="p-2 font-medium">Timing</th>
                      <th className="p-2 font-medium">Duration</th>
                      <th className="p-2 font-medium w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {prescriptions.map(p => (
                      <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="p-2 font-medium text-slate-200">{p.medicine}</td>
                        <td className="p-2 text-slate-300">{p.dosage}</td>
                        <td className="p-2 text-slate-300">{p.timing}</td>
                        <td className="p-2 text-slate-300">{p.duration} days</td>
                        <td className="p-2">
                          <button onClick={() => setPrescriptions(prescriptions.filter(x => x.id !== p.id))} className="text-slate-500 hover:text-rose-400"><X className="w-4 h-4"/></button>
                        </td>
                      </tr>
                    ))}
                    {prescriptions.length === 0 && (
                      <tr><td colSpan={5} className="p-4 text-center text-slate-500">No medicines prescribed</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-5">
                  <label className="text-[10px] text-slate-400 block mb-1">Medicine Name</label>
                  <input list="meds" type="text" value={newMed} onChange={e=>setNewMed(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 outline-none" placeholder="e.g. Telmisartan 40mg" />
                  <datalist id="meds">{MEDICINE_DB.map(m => <option key={m} value={m} />)}</datalist>
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] text-slate-400 block mb-1">Dosage</label>
                  <select value={newDosage} onChange={e=>setNewDosage(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 outline-none">
                    <option>1-0-0</option><option>0-1-0</option><option>0-0-1</option><option>1-0-1</option><option>1-1-1</option>
                  </select>
                </div>
                <div className="col-span-3">
                  <label className="text-[10px] text-slate-400 block mb-1">Timing</label>
                  <select value={newTiming} onChange={e=>setNewTiming(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 outline-none">
                    <option>After Food</option><option>Before Food</option>
                  </select>
                </div>
                <div className="col-span-1">
                  <label className="text-[10px] text-slate-400 block mb-1">Days</label>
                  <input type="number" value={newDuration} onChange={e=>setNewDuration(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 outline-none text-center" />
                </div>
                <div className="col-span-1">
                  <button onClick={handleAddMed} className="w-full bg-violet-500 hover:bg-violet-400 text-white rounded-lg p-2 flex items-center justify-center transition-colors"><Plus className="w-4 h-4"/></button>
                </div>
              </div>
            </div>

            {/* Labs & Radiology */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-sm flex items-center gap-2"><Activity className="w-4 h-4 text-emerald-400"/> Lab & Radiology Orders (LIS/RIS)</h3>
                {orderedLabs.length > 0 && <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">Integration Sync Active</span>}
              </div>
              <div className="flex flex-wrap gap-2">
                {LAB_TESTS.map(test => (
                  <button
                    key={test}
                    onClick={() => toggleLab(test)}
                    className={`text-[11px] px-3 py-1.5 rounded-lg transition-all border ${
                      orderedLabs.includes(test) ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {test}
                  </button>
                ))}
              </div>
            </div>

            {/* Follow-up & Complete */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1">
                  <label className="text-xs text-slate-400 block mb-1">Follow-up Date</label>
                  <input type="date" value={followUpDate} onChange={e=>setFollowUpDate(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-slate-200 outline-none" />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-slate-400 block mb-1">Follow-up Type</label>
                  <select className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-slate-200 outline-none">
                    <option>Standard Review (Free &lt; 15 days)</option>
                    <option>SOS / Emergency</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-800">
                <button onClick={() => addToast('Prescription saved & printing started', 'success')} className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold py-2.5 rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-colors">
                  <Printer className="w-4 h-4"/> Print Rx
                </button>
                <button onClick={() => addToast('Prescription sent to pharmacy queue', 'success')} className="bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/50 text-violet-400 text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors">
                  <Send className="w-4 h-4"/> Pharmacy
                </button>
                <button onClick={() => addToast('Referral created', 'info')} className="bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-400 text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors">
                  <Users className="w-4 h-4"/> Refer
                </button>
                <button onClick={() => addToast('Consultation completed successfully', 'success')} className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold py-2.5 rounded-xl shadow-[0_0_15px_rgba(34,211,238,0.4)] flex items-center justify-center gap-2 transition-all">
                  <CheckCircle className="w-4 h-4"/> Complete
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT PANEL: Patient Context */}
        <div className="lg:col-span-3 flex flex-col gap-4 overflow-y-auto hidden-scrollbar">
          
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 flex gap-3">
            <AlertCircle className="w-6 h-6 text-rose-400 shrink-0" />
            <div>
              <h3 className="text-xs font-bold text-rose-400 uppercase tracking-wide">Allergy Alert</h3>
              <p className="text-sm font-medium text-slate-200 mt-1">Sulfa Drugs, Penicillin</p>
              <p className="text-[10px] text-slate-400 mt-1">Reported: 12 Aug 2024</p>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col min-h-[250px]">
            <h3 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wide flex items-center gap-2"><FileSearch className="w-4 h-4" /> Previous Visits</h3>
            <div className="space-y-3 flex-1">
              <div className="bg-slate-800/40 p-2.5 rounded-xl border border-slate-700/50">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-semibold text-cyan-400">14 Jan 2026</span>
                  <span className="text-[10px] text-slate-400">Dr. V. Reddy</span>
                </div>
                <p className="text-xs text-slate-300">I10 - Essential HTN. BP 150/95. Meds adjusted.</p>
              </div>
              <div className="bg-slate-800/40 p-2.5 rounded-xl border border-slate-700/50">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-semibold text-cyan-400">10 Nov 2025</span>
                  <span className="text-[10px] text-slate-400">Dr. V. Reddy</span>
                </div>
                <p className="text-xs text-slate-300">Routine cardiac eval. Echo normal.</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
            <h3 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wide flex items-center gap-2"><Activity className="w-4 h-4" /> LIS / RIS Results</h3>
            <div className="bg-amber-500/10 border border-amber-500/20 p-2 rounded-lg mb-3">
              <p className="text-xs text-amber-400 font-medium text-center">2 Pending Reports from LIS</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs bg-slate-800/50 p-2 rounded-lg">
                <span className="text-slate-200">CBC</span>
                <span className="text-[10px] bg-slate-700 px-1.5 py-0.5 rounded text-slate-300">Pending</span>
              </div>
              <div className="flex justify-between items-center text-xs bg-slate-800/50 p-2 rounded-lg">
                <span className="text-slate-200">Lipid Profile</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded">Ready</span>
              </div>
            </div>
            <button onClick={() => addToast('Opening LIS Portal in secure viewer...', 'info')} className="w-full mt-3 text-xs bg-slate-800 hover:bg-slate-700 text-cyan-400 py-1.5 rounded-lg transition-colors border border-slate-700">
              View in LIS →
            </button>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 mt-auto">
            <h3 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wide">Quick Actions</h3>
            <div className="space-y-2">
              <button onClick={() => setActiveModule('ipd')} className="w-full text-xs bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 py-2 rounded-lg transition-colors border border-rose-500/30 font-semibold flex items-center justify-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5"/> Admit to IPD
              </button>
              <button onClick={() => setActiveModule('patients')} className="w-full text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-lg transition-colors border border-slate-700 font-semibold flex items-center justify-center gap-2">
                <FileText className="w-3.5 h-3.5"/> View Full EMR
              </button>
            </div>
          </div>

        </div>

      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .hidden-scrollbar::-webkit-scrollbar { display: none; }
        .hidden-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
};

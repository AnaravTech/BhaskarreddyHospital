import React, { useState } from 'react';
import { useHospital } from '../context/HospitalContext';
import { Clock, FileText, Upload, Trash2, Activity, Heart, Thermometer, } from 'lucide-react';
export const OPDModule = () => {
    const { appointments, patients, addToast, checkOPValidity } = useHospital();
    const [selectedAptId, setSelectedAptId] = useState(appointments[0]?.id || '');
    const activeApt = appointments.find((a) => a.id === selectedAptId);
    const activePatient = patients.find((p) => p.id === activeApt?.patientId);
    const validity = activePatient ? checkOPValidity(activePatient.lastVisitDate) : null;
    // Prescription Form State
    const [diagnosis, setDiagnosis] = useState('Essential Hypertension & Hyperlipidemia');
    const [clinicalNotes, setClinicalNotes] = useState('Patient presents with mild occipital headache and fatigue. Regular BP monitoring advised.');
    const [vitals, setVitals] = useState({
        bp: '130/85',
        pulse: '74',
        temp: '98.4 °F',
        spO2: '99%',
    });
    const [medicines, setMedicines] = useState([
        { medicineName: 'Tab. Telmisartan 40mg', dosage: '1-0-0', timing: 'Before Food', durationDays: 30 },
        { medicineName: 'Tab. Atorvastatin 10mg', dosage: '0-0-1', timing: 'After Food', durationDays: 30 },
    ]);
    const [newMed, setNewMed] = useState({
        medicineName: '',
        dosage: '1-0-1',
        timing: 'After Food',
        durationDays: 15,
    });
    const handleAddMedicine = () => {
        if (!newMed.medicineName)
            return;
        setMedicines([...medicines, newMed]);
        setNewMed({ medicineName: '', dosage: '1-0-1', timing: 'After Food', durationDays: 15 });
    };
    const handleRemoveMedicine = (idx) => {
        setMedicines(medicines.filter((_, i) => i !== idx));
    };
    const handleSaveConsultation = () => {
        addToast('OPD Consultation Complete', `Digital prescription saved for ${activeApt?.patientName}`, 'success');
    };
    return (<div className="space-y-6 pb-12">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              Outpatient Department Engine
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-white mt-1">Doctor OPD Consultation & EHR Upload</h2>
          <p className="text-xs text-slate-400">
            Digital prescription writing, vitals telemetry, and 15-day free follow-up validity tracking.
          </p>
        </div>

        {/* Workflow Pipeline Visualization */}
        <div className="hidden lg:flex items-center gap-2 text-[10px] font-bold text-slate-400 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
          <span className="text-emerald-400">1. Registration</span>
          <span>→</span>
          <span className="text-emerald-400">2. Token</span>
          <span>→</span>
          <span className="text-cyan-400 underline">3. Consultation</span>
          <span>→</span>
          <span>4. Prescription</span>
          <span>→</span>
          <span>5. Billing</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Waiting Queue Selection */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-3">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400"/>
            Active OPD Waiting Queue ({appointments.length})
          </h3>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {appointments.map((apt) => {
            const isSelected = apt.id === selectedAptId;
            return (<div key={apt.id} onClick={() => setSelectedAptId(apt.id)} className={`p-3.5 rounded-xl border transition cursor-pointer ${isSelected
                    ? 'bg-slate-800/90 border-cyan-500/60 shadow-md shadow-cyan-950/40'
                    : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/40'}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
                      #{apt.tokenNumber}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">{apt.appointmentTime}</span>
                  </div>

                  <div className="mt-2">
                    <div className="text-xs font-bold text-slate-100">{apt.patientName}</div>
                    <div className="text-[10px] text-slate-400">
                      Doctor: {apt.doctorName} • {apt.departmentName}
                    </div>
                  </div>
                </div>);
        })}
          </div>
        </div>

        {/* Right OPD Consultation Workbench */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-6">
          {activeApt ? (<>
              {/* Consultation Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-white">{activeApt.patientName}</h3>
                    <span className="font-mono text-xs font-bold text-cyan-400">{activePatient?.uhid}</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Attending: {activeApt.doctorName} ({activeApt.departmentName})
                  </div>
                </div>

                {validity && (<div className={`px-3 py-1.5 rounded-xl border text-xs font-bold ${validity.isValid
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400'}`}>
                    {validity.isValid
                    ? `Eligible 15-Day Free Follow-up (${validity.daysRemaining}d left)`
                    : 'New OP Validity Window Started'}
                  </div>)}
              </div>

              {/* Vitals Telemetry Entry */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-cyan-400"/> Vitals Telemetry
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Heart className="w-3 h-3 text-rose-400"/> Blood Pressure
                    </div>
                    <input type="text" value={vitals.bp} onChange={(e) => setVitals({ ...vitals, bp: e.target.value })} className="w-full bg-transparent text-sm font-bold text-slate-100 focus:outline-none mt-1"/>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Activity className="w-3 h-3 text-cyan-400"/> Pulse Rate
                    </div>
                    <input type="text" value={vitals.pulse} onChange={(e) => setVitals({ ...vitals, pulse: e.target.value })} className="w-full bg-transparent text-sm font-bold text-slate-100 focus:outline-none mt-1"/>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Thermometer className="w-3 h-3 text-amber-400"/> Temperature
                    </div>
                    <input type="text" value={vitals.temp} onChange={(e) => setVitals({ ...vitals, temp: e.target.value })} className="w-full bg-transparent text-sm font-bold text-slate-100 focus:outline-none mt-1"/>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="text-[10px] text-slate-400">SpO2 Oxygen</div>
                    <input type="text" value={vitals.spO2} onChange={(e) => setVitals({ ...vitals, spO2: e.target.value })} className="w-full bg-transparent text-sm font-bold text-slate-100 focus:outline-none mt-1"/>
                  </div>
                </div>
              </div>

              {/* Diagnosis & Clinical Notes */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Primary Diagnosis
                  </label>
                  <input type="text" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-semibold"/>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Clinical Notes & Complaints
                  </label>
                  <textarea rows={3} value={clinicalNotes} onChange={(e) => setClinicalNotes(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"/>
                </div>
              </div>

              {/* Digital Prescription Builder */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-cyan-400"/> Digital Prescription Medicines
                </h4>

                <div className="space-y-2">
                  {medicines.map((med, idx) => (<div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                      <div>
                        <span className="font-bold text-slate-100">{med.medicineName}</span>
                        <span className="text-[10px] text-slate-400 ml-2">
                          ({med.dosage} • {med.timing} • {med.durationDays} Days)
                        </span>
                      </div>
                      <button onClick={() => handleRemoveMedicine(idx)} className="text-slate-500 hover:text-rose-400 transition p-1">
                        <Trash2 className="w-4 h-4"/>
                      </button>
                    </div>))}
                </div>

                {/* Add Medicine Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2">
                  <input type="text" placeholder="Medicine Name (e.g. Paracetamol)" value={newMed.medicineName} onChange={(e) => setNewMed({ ...newMed, medicineName: e.target.value })} className="sm:col-span-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100"/>
                  <input type="text" placeholder="Dosage (1-0-1)" value={newMed.dosage} onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })} className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100"/>
                  <button type="button" onClick={handleAddMedicine} className="py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold">
                    + Add
                  </button>
                </div>
              </div>

              {/* Prescription Scan Upload Simulation & Save Action */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
                <button type="button" onClick={() => addToast('Scan Uploaded', 'Handwritten prescription OCR digitized successfully.', 'info')} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold">
                  <Upload className="w-4 h-4 text-cyan-400"/>
                  <span>Upload Scanned Paper Rx</span>
                </button>

                <button type="button" onClick={handleSaveConsultation} className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-extrabold shadow-md shadow-cyan-600/20 transition">
                  Complete Consultation & Send Digital Rx
                </button>
              </div>
            </>) : (<div className="text-center py-12 text-slate-500 text-xs">
              Select an appointment from the queue to start OPD consultation.
            </div>)}
        </div>
      </div>
    </div>);
};

export const OPD = OPDModule;
export default OPDModule;

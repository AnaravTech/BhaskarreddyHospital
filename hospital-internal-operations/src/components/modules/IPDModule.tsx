import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import { 
  Search, Filter, Bed, ArrowRight, X, Stethoscope, Save, ClipboardList, CheckCircle, Clock, AlertCircle, FileText
} from 'lucide-react';

interface IPDPatient {
  id: string;
  uhid: string;
  name: string;
  ward: string;
  bed: string;
  doctor: string;
  admissionDate: string;
  losDays: number;
  advanceDeposit: number;
  totalBill: number;
  status: 'Admitted' | 'Discharge Initiated';
}

const MOCK_IPD_PATIENTS: IPDPatient[] = [
  { id: 'IPD-101', uhid: 'UHID-2394', name: 'Ramesh Kumar', ward: 'Cardiac ICU', bed: 'CICU-01', doctor: 'Dr. Vikram Reddy', admissionDate: '2023-10-24', losDays: 3, advanceDeposit: 50000, totalBill: 65000, status: 'Admitted' },
  { id: 'IPD-102', uhid: 'UHID-1102', name: 'Kiran Reddy', ward: 'Surgical ICU', bed: 'SICU-01', doctor: 'Dr. Rajeshwar Rao', admissionDate: '2023-10-25', losDays: 2, advanceDeposit: 30000, totalBill: 25000, status: 'Admitted' },
  { id: 'IPD-103', uhid: 'UHID-5541', name: 'Lakshmi Devi', ward: 'Female Ward', bed: 'FW-12', doctor: 'Dr. Madhu Latha Marreddy', admissionDate: '2023-10-26', losDays: 1, advanceDeposit: 20000, totalBill: 18000, status: 'Discharge Initiated' },
  { id: 'IPD-104', uhid: 'UHID-9921', name: 'Srinivasulu', ward: 'Male General Ward', bed: 'MGW-05', doctor: 'Dr. Sameer Khan', admissionDate: '2023-10-20', losDays: 7, advanceDeposit: 15000, totalBill: 45000, status: 'Admitted' },
];

export const IPDModule: React.FC = () => {
  const { addToast, setActiveModule } = useHospital();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<IPDPatient | null>(null);

  const filteredPatients = MOCK_IPD_PATIENTS.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.uhid.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.ward.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col space-y-6 text-slate-200">
      
      {!selectedPatient ? (
        <>
          <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
            <div>
              <h2 className="text-3xl font-bold text-slate-100 mb-2">Inpatient Ward Rounds</h2>
              <p className="text-slate-400">Manage admitted patients, round notes, and discharges.</p>
            </div>
            
            <div className="flex items-center space-x-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search patient, UHID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-700 rounded-xl focus:outline-none focus:border-cyan-500 text-slate-200"
                />
              </div>
              <button className="p-2 bg-slate-800 border border-slate-700 rounded-xl hover:bg-slate-700 transition-colors">
                <Filter className="w-5 h-5 text-slate-300" />
              </button>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl flex-1">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-800/80 text-slate-300 border-b border-slate-700/50">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Patient & UHID</th>
                    <th className="px-6 py-4 font-semibold">Ward & Bed</th>
                    <th className="px-6 py-4 font-semibold">Attending Doctor</th>
                    <th className="px-6 py-4 font-semibold">Admission Info</th>
                    <th className="px-6 py-4 font-semibold">Financials</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {filteredPatients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-100">{patient.name}</div>
                        <div className="text-xs text-slate-400">{patient.uhid}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-cyan-400">{patient.ward}</div>
                        <div className="text-xs text-slate-400 flex items-center mt-1"><Bed className="w-3 h-3 mr-1"/> {patient.bed}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-300">{patient.doctor}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-300">{patient.admissionDate}</div>
                        <div className="text-xs text-slate-400 mt-1">LOS: {patient.losDays} days</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-emerald-400 text-xs">Adv: ₹{patient.advanceDeposit.toLocaleString()}</div>
                        <div className="text-rose-400 text-xs mt-1">Bill: ₹{patient.totalBill.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          patient.status === 'Discharge Initiated' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {patient.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedPatient(patient)}
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-xl text-sm font-bold transition-colors inline-flex items-center"
                        >
                          Rounds <ArrowRight className="w-4 h-4 ml-1" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredPatients.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                        No admitted patients found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <DoctorRoundsConsole 
          patient={selectedPatient} 
          onBack={() => setSelectedPatient(null)} 
          onAction={(msg: string) => addToast('Doctor Round Note Saved', msg, 'success')}
          onDischarge={() => setActiveModule('discharge-summary')}
        />
      )}

    </div>
  );
};


const DoctorRoundsConsole = ({ patient, onBack, onAction, onDischarge }: any) => {
  const [notes, setNotes] = useState('');
  const [diet, setDiet] = useState('Normal Diet');
  const [dischargeStatus, setDischargeStatus] = useState('Not Ready');

  const handleSave = () => {
    if(!notes) return onAction('Please enter progress notes');
    onAction('Daily progress notes saved successfully');
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors">
            <X className="w-6 h-6" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-cyan-400 flex items-center">
              {patient.name} <span className="text-sm font-normal text-slate-400 ml-3 bg-slate-800 px-2 py-1 rounded">{patient.uhid}</span>
            </h2>
            <p className="text-sm text-slate-400">{patient.ward} • {patient.bed} • Admitted: {patient.admissionDate} (Day {patient.losDays})</p>
          </div>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-sm text-slate-400">Attending Doctor</p>
          <p className="font-bold text-slate-200">{patient.doctor}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 flex-1">
        {/* Left Column: Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center text-slate-100">
              <Stethoscope className="w-5 h-5 mr-2 text-cyan-400" /> Today's Clinical Progress (SOAP)
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-400 mb-2">Subjective, Objective, Assessment, Plan</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter detailed daily round notes..."
                  className="w-full h-40 bg-slate-950 border border-slate-700 rounded-xl p-4 text-slate-200 focus:outline-none focus:border-cyan-500 placeholder-slate-600"
                ></textarea>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-400 mb-2">Special Diet Orders</label>
                  <select 
                    value={diet}
                    onChange={(e) => setDiet(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option>Normal Diet</option>
                    <option>Soft Diet</option>
                    <option>Diabetic Diet</option>
                    <option>Renal Diet</option>
                    <option>NPO (Nothing by Mouth)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-400 mb-2">Discharge Readiness</label>
                  <select 
                    value={dischargeStatus}
                    onChange={(e) => setDischargeStatus(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option>Not Ready</option>
                    <option>Fit for Discharge in 24h</option>
                    <option>Fit for Discharge Today</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <button 
                  onClick={handleSave}
                  className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold transition-colors flex items-center"
                >
                  <Save className="w-5 h-5 mr-2" /> Save Round Note
                </button>
              </div>
            </div>
          </div>

          {/* History */}
          <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6">
             <h3 className="text-lg font-bold mb-4 flex items-center text-slate-100">
              <ClipboardList className="w-5 h-5 mr-2 text-cyan-400" /> Previous Round Notes
            </h3>
            <div className="space-y-4">
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-slate-200 text-sm">Yesterday, 10:30 AM</span>
                  <span className="text-xs text-slate-400">Dr. {patient.doctor}</span>
                </div>
                <p className="text-sm text-slate-300">Patient feeling better. Pain reduced to 2/10. Vitals stable. Continue current antibiotics for 2 more days. Tolerating soft diet well.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Discharge Checklist */}
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center text-slate-100">
              <CheckCircle className="w-5 h-5 mr-2 text-emerald-400" /> Discharge Clearance
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                <div className="flex items-center">
                  {dischargeStatus === 'Fit for Discharge Today' ? (
                     <CheckCircle className="w-5 h-5 text-emerald-400 mr-3" />
                  ) : (
                     <Clock className="w-5 h-5 text-amber-400 mr-3" />
                  )}
                  <div>
                    <p className="text-sm font-bold text-slate-200">Clinical Clearance</p>
                    <p className="text-xs text-slate-400">Doctor sign-off</p>
                  </div>
                </div>
                <span className="text-xs font-semibold bg-slate-900 px-2 py-1 rounded">
                  {dischargeStatus === 'Fit for Discharge Today' ? 'Cleared' : 'Pending'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                <div className="flex items-center">
                   <Clock className="w-5 h-5 text-amber-400 mr-3" />
                  <div>
                    <p className="text-sm font-bold text-slate-200">Nursing Clearance</p>
                    <p className="text-xs text-slate-400">MAR completed, cannula removed</p>
                  </div>
                </div>
                <span className="text-xs font-semibold bg-slate-900 px-2 py-1 rounded text-amber-400">Pending</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                <div className="flex items-center">
                   <Clock className="w-5 h-5 text-amber-400 mr-3" />
                  <div>
                    <p className="text-sm font-bold text-slate-200">Pharmacy</p>
                    <p className="text-xs text-slate-400">Take-home meds ready</p>
                  </div>
                </div>
                <span className="text-xs font-semibold bg-slate-900 px-2 py-1 rounded text-amber-400">Pending</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                <div className="flex items-center">
                   <AlertCircle className="w-5 h-5 text-rose-400 mr-3" />
                  <div>
                    <p className="text-sm font-bold text-slate-200">Billing Clearance</p>
                    <p className="text-xs text-slate-400">Dues: ₹{(patient.totalBill - patient.advanceDeposit).toLocaleString()}</p>
                  </div>
                </div>
                <span className="text-xs font-semibold bg-slate-900 px-2 py-1 rounded text-rose-400">Pending</span>
              </div>

            </div>

            <div className="mt-6 pt-6 border-t border-slate-800">
               <button 
                  onClick={onDischarge}
                  disabled={dischargeStatus !== 'Fit for Discharge Today'}
                  className={`w-full py-3 rounded-xl font-bold transition-colors flex items-center justify-center ${
                    dischargeStatus === 'Fit for Discharge Today' 
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white' 
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <FileText className="w-5 h-5 mr-2" /> Initiate Discharge Summary
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

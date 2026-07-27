import React, { useState, useMemo } from 'react';
import { useHospital } from '../../context/HospitalContext';
import {
  Search, Plus, User, Phone, MapPin, Droplet, Calendar,
  AlertTriangle, Heart, Shield, FileText, Activity, CreditCard,
  Syringe, Stethoscope, ChevronDown, ChevronUp, Download, Eye, QrCode,
  Receipt, CheckCircle
} from 'lucide-react';

export const PatientManagementModule: React.FC = () => {
  const { patients, currentUser, addToast } = useHospital();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTab, setFilterTab] = useState<'All' | 'Active' | 'Admitted' | 'Discharged'>('All');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(patients.length > 0 ? patients[0].id : null);
  const [activeRightTab, setActiveRightTab] = useState<'profile' | 'timeline' | 'clinical' | 'admission' | 'billing' | 'insurance' | 'documents'>('profile');
  const [expandedConsultation, setExpandedConsultation] = useState<string | null>(null);

  // Filter patients
  const filteredPatients = useMemo(() => {
    return patients.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            p.uhid.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            p.phone.includes(searchTerm);
      const matchesTab = filterTab === 'All' || p.status === filterTab;
      return matchesSearch && matchesTab;
    });
  }, [patients, searchTerm, filterTab]);

  const selectedPatient = patients.find(p => p.id === selectedPatientId) || patients[0];

  // Role checks
  const isDoctor = ['doctor', 'dmo'].includes(currentUser?.role || '');
  const isReceptionist = ['receptionist', 'admin'].includes(currentUser?.role || '');
  const isBilling = ['billing', 'admin', 'ceo'].includes(currentUser?.role || '');
  const isInsurance = ['insurance', 'billing', 'admin', 'ceo', 'doctor'].includes(currentUser?.role || '');
  const canSeeBilling = ['billing', 'admin', 'ceo'].includes(currentUser?.role || '');
  
  const handleAction = (action: string) => {
    addToast('Action Initiated', `Opening ${action} for ${selectedPatient?.name}`, 'info');
  };

  // Mock Data Generators for Selected Patient
  const mockAllergies = ['Penicillin', 'Sulfa drugs', 'Peanuts'];
  const mockMedicalHistory = ['Hypertension', 'Type 2 Diabetes', 'CABG-2023'];

  const mockTimeline = [
    { id: '1', date: '2026-07-24 10:30', type: 'opd', title: 'OPD Visit - Cardiology', desc: 'Dr. Vikram Reddy - Routine Checkup', icon: <Stethoscope className="w-4 h-4 text-cyan-400" />, color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
    { id: '2', date: '2026-07-24 11:15', type: 'lab', title: 'Lab Order', desc: 'CBC, Lipid Profile, HbA1c', icon: <Syringe className="w-4 h-4 text-violet-400" />, color: 'bg-violet-500/20 text-violet-400 border-violet-500/30' },
    { id: '3', date: '2026-07-24 14:00', type: 'pharmacy', title: 'Prescription Filled', desc: '3 Medications dispensed', icon: <Droplet className="w-4 h-4 text-emerald-400" />, color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    { id: '4', date: '2026-05-10 09:00', type: 'admission', title: 'Admission - ICU', desc: 'Chest Pain Observation', icon: <Activity className="w-4 h-4 text-indigo-400" />, color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' },
    { id: '5', date: '2026-05-12 16:30', type: 'discharge', title: 'Discharged', desc: 'LOS: 2 Days. Stable.', icon: <CheckCircle className="w-4 h-4 text-slate-400" />, color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
    { id: '6', date: '2026-05-12 17:00', type: 'billing', title: 'Final Bill Settled', desc: '₹45,000 via Insurance', icon: <CreditCard className="w-4 h-4 text-amber-400" />, color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  ];

  const mockConsultations = [
    { id: 'c1', date: '2026-07-24', doctor: 'Dr. Vikram Reddy (Cardiology)', token: 'T-104', bp: '130/85', pulse: '78', temp: '98.6°F', spo2: '98%', weight: '76 kg', complaints: 'Occasional chest tightness after meals.', diagnosis: 'Non-cardiac chest pain, GERD suspected.', meds: [{ name: 'Pantoprazole 40mg', dose: '1-0-0', duration: '14 days' }, { name: 'Aspirin 75mg', dose: '0-1-0', duration: 'Continue' }], tests: 'ECG, Upper GI Endoscopy (referral)', followup: '2026-08-07' },
    { id: 'c2', date: '2026-04-15', doctor: 'Dr. Vikram Reddy (Cardiology)', token: 'T-042', bp: '145/90', pulse: '82', temp: '98.4°F', spo2: '97%', weight: '77 kg', complaints: 'Routine follow up for HTN.', diagnosis: 'Essential Hypertension', meds: [{ name: 'Telmisartan 40mg', dose: '1-0-0', duration: '30 days' }], tests: 'Lipid Profile', followup: '2026-07-15' }
  ];

  const mockAdmissions = [
    { id: 'IP-2026-0892', admitDate: '2026-05-10', dischargeDate: '2026-05-12', los: '2 days', ward: 'ICU-1', doctor: 'Dr. Vikram Reddy', dept: 'Cardiology', diagnosis: 'Acute Chest Pain - R/O ACS', procedures: 'ECG, 2D Echo, Troponin T', deposit: '₹10,000', totalBill: '₹45,000', insuranceStatus: 'Approved' },
    { id: 'IP-2025-4421', admitDate: '2025-11-05', dischargeDate: '2025-11-08', los: '3 days', ward: 'General Ward - A', doctor: 'Dr. Rajeshwar Rao', dept: 'Orthopedics', diagnosis: 'Right Tibia Fracture', procedures: 'ORIF with plating', deposit: '₹20,000', totalBill: '₹85,000', insuranceStatus: 'Settled' }
  ];

  const mockInvoices = [
    { id: 'INV-26-4592', date: '2026-07-24', amount: '₹1,500', paid: '₹1,500', due: '₹0', mode: 'UPI', status: 'Paid' },
    { id: 'INV-26-3101', date: '2026-05-12', amount: '₹45,000', paid: '₹45,000', due: '₹0', mode: 'Insurance (₹35k) + Card (₹10k)', status: 'Paid' },
    { id: 'INV-25-8822', date: '2025-11-08', amount: '₹85,000', paid: '₹85,000', due: '₹0', mode: 'Cash', status: 'Paid' }
  ];

  const mockClaims = [
    { id: 'CLM-778192', provider: 'Star Health', reqAmount: '₹45,000', aprAmount: '₹35,000', status: 'Settled', subDate: '2026-05-13', setDate: '2026-05-20', docs: 'Complete' },
    { id: 'CLM-610023', provider: 'Dr. YSR Aarogyasri', reqAmount: '₹85,000', aprAmount: '₹85,000', status: 'Settled', subDate: '2025-11-09', setDate: '2025-11-30', docs: 'Complete' }
  ];

  const mockDocuments = [
    { id: 'd1', type: 'pdf', name: 'Discharge_Summary_May2026.pdf', size: '2.4 MB', by: 'Dr. Vikram Reddy', date: '2026-05-12', status: 'Signed' },
    { id: 'd2', type: 'image', name: 'ECG_Report_May10.jpg', size: '1.1 MB', by: 'Lab Technician', date: '2026-05-10', status: 'Active' },
    { id: 'd3', type: 'doc', name: 'Consent_Form_Surgery.pdf', size: '800 KB', by: 'Admin', date: '2025-11-05', status: 'Signed' }
  ];

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 overflow-hidden">
      
      {/* LEFT PANEL - PATIENT LIST */}
      <div className="w-1/3 min-w-[320px] max-w-[400px] border-r border-slate-800/80 flex flex-col bg-slate-900/50">
        <div className="p-4 border-b border-slate-800/80">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-slate-100">Patients</h2>
            {isReceptionist && (
              <button 
                onClick={() => handleAction('Register New Patient')}
                className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-1 transition-colors"
              >
                <Plus className="w-4 h-4" /> Register
              </button>
            )}
          </div>
          
          <div className="relative mb-3">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search Name, UHID, Phone..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700/50 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
            />
          </div>

          <div className="flex bg-slate-800/50 rounded-lg p-1">
            {['All', 'Active', 'Admitted', 'Discharged'].map(tab => (
              <button
                key={tab}
                onClick={() => setFilterTab(tab as any)}
                className={`flex-1 text-xs py-1.5 rounded-md font-medium transition-colors ${
                  filterTab === tab ? 'bg-slate-700 text-slate-100 shadow-sm' : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {filteredPatients.map(patient => (
            <div 
              key={patient.id}
              onClick={() => setSelectedPatientId(patient.id)}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                selectedPatientId === patient.id 
                  ? 'bg-cyan-500/10 border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.1)]' 
                  : 'bg-slate-900/60 border-slate-800/50 hover:bg-slate-800/80 hover:border-slate-700/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-300 text-sm flex-shrink-0">
                  {patient.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className={`font-bold truncate text-sm ${selectedPatientId === patient.id ? 'text-cyan-400' : 'text-slate-200'}`}>
                      {patient.name}
                    </h3>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium border ${
                      patient.status === 'Admitted' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                      patient.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      'bg-slate-500/10 text-slate-400 border-slate-500/20'
                    }`}>
                      {patient.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">{patient.uhid}</div>
                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                    <span>{patient.age}y • {patient.gender.charAt(0)}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                    <span className="text-rose-400">{patient.bloodGroup}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {filteredPatients.length === 0 && (
            <div className="text-center py-10 text-slate-500 text-sm">
              No patients found matching the criteria.
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANEL - PATIENT 360 */}
      <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden relative">
        {selectedPatient ? (
          <>
            {/* 360 Header */}
            <div className="bg-slate-900/80 border-b border-slate-800/80 p-5 shrink-0 z-10 relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500"></div>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 flex items-center justify-center text-2xl font-bold text-slate-400 shadow-xl">
                    {selectedPatient.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </div>
                  <div>
                    <h1 className="text-3xl font-extrabold text-slate-100 flex items-center gap-3">
                      {selectedPatient.name}
                      <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
                        selectedPatient.status === 'Admitted' ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' :
                        selectedPatient.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                        'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {selectedPatient.status.toUpperCase()}
                      </span>
                    </h1>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1.5 bg-slate-800/50 px-2.5 py-1 rounded-lg border border-slate-700/50">
                        <QrCode className="w-4 h-4 text-cyan-400" />
                        <span className="font-mono text-sm text-cyan-100 font-semibold">{selectedPatient.uhid}</span>
                      </div>
                      <div className="text-sm text-slate-400 flex items-center gap-2">
                        <span>{selectedPatient.age} Years</span>
                        <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                        <span>{selectedPatient.gender}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {isDoctor && (
                    <>
                      <button onClick={() => handleAction('New Consultation')} className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/30 px-4 py-2 rounded-xl text-sm font-bold transition-colors">
                        New Consult
                      </button>
                      <button onClick={() => handleAction('View Prescriptions')} className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2 rounded-xl text-sm font-bold transition-colors">
                        Rx
                      </button>
                    </>
                  )}
                  {isReceptionist && (
                    <button onClick={() => handleAction('Book Appointment')} className="bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 border border-indigo-500/30 px-4 py-2 rounded-xl text-sm font-bold transition-colors">
                      Book Appointment
                    </button>
                  )}
                  {isBilling && (
                    <button onClick={() => handleAction('Create Invoice')} className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 px-4 py-2 rounded-xl text-sm font-bold transition-colors">
                      New Invoice
                    </button>
                  )}
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 mt-6 border-b border-slate-800 overflow-x-auto pb-px scrollbar-hide">
                {[
                  { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
                  { id: 'timeline', label: 'Timeline', icon: <Activity className="w-4 h-4" /> },
                  { id: 'clinical', label: 'Clinical', icon: <Stethoscope className="w-4 h-4" /> },
                  { id: 'admission', label: 'Admissions', icon: <Heart className="w-4 h-4" /> },
                  ...(canSeeBilling ? [{ id: 'billing', label: 'Billing', icon: <Receipt className="w-4 h-4" /> }] : []),
                  ...(isInsurance ? [{ id: 'insurance', label: 'Insurance', icon: <Shield className="w-4 h-4" /> }] : []),
                  { id: 'documents', label: 'Documents', icon: <FileText className="w-4 h-4" /> },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveRightTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                      activeRightTab === tab.id 
                        ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5 rounded-t-lg' 
                        : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-t-lg'
                    }`}
                  >
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content Area */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
              
              {/* TAB 1: PROFILE */}
              {activeRightTab === 'profile' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Demographics */}
                  <div className="col-span-1 lg:col-span-2 space-y-6">
                    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5">
                      <h3 className="text-sm font-bold text-slate-300 mb-4 uppercase tracking-wider flex items-center gap-2">
                        <User className="w-4 h-4 text-cyan-500" /> Demographics
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <div>
                          <div className="text-xs text-slate-500 mb-1">Phone</div>
                          <div className="text-sm font-medium text-slate-200 flex items-center gap-2"><Phone className="w-3 h-3 text-slate-400"/> {selectedPatient.phone}</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500 mb-1">Blood Group</div>
                          <div className="text-sm font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded w-max">
                            {selectedPatient.bloodGroup}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500 mb-1">DOB (Est)</div>
                          <div className="text-sm font-medium text-slate-200">{new Date(new Date().setFullYear(new Date().getFullYear() - selectedPatient.age)).toLocaleDateString()}</div>
                        </div>
                        <div className="col-span-2 sm:col-span-3">
                          <div className="text-xs text-slate-500 mb-1">Address</div>
                          <div className="text-sm font-medium text-slate-200 flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5"/> 
                            14-2/3, Gandhi Nagar, Near VRC Ground, Nellore, AP - 524001
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {/* Allergies */}
                      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5">
                        <h3 className="text-sm font-bold text-slate-300 mb-4 uppercase tracking-wider flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-rose-500" /> Allergies
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {mockAllergies.map((allergy, i) => (
                            <span key={i} className="px-2.5 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-lg text-xs font-semibold">
                              {allergy}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* History */}
                      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5">
                        <h3 className="text-sm font-bold text-slate-300 mb-4 uppercase tracking-wider flex items-center gap-2">
                          <Activity className="w-4 h-4 text-indigo-500" /> Medical History
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {mockMedicalHistory.map((hist, i) => (
                            <span key={i} className="px-2.5 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg text-xs font-semibold">
                              {hist}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    {/* Emergency Contact */}
                    <div className="bg-slate-900/60 border border-amber-500/30 rounded-2xl p-5 relative overflow-hidden">
                      <div className="absolute -right-4 -top-4 bg-amber-500/10 w-24 h-24 rounded-full blur-2xl"></div>
                      <h3 className="text-sm font-bold text-amber-500 mb-4 uppercase tracking-wider flex items-center gap-2">
                        <Phone className="w-4 h-4" /> Emergency Contact
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <div className="text-xs text-slate-500">Name</div>
                          <div className="text-sm font-medium text-slate-200">K. Srinivas Reddy (Son)</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500">Phone</div>
                          <div className="text-sm font-bold text-slate-200">98765 43210</div>
                        </div>
                      </div>
                    </div>

                    {/* Insurance Card */}
                    <div className="bg-gradient-to-br from-blue-900/40 to-slate-900/80 border border-blue-500/30 rounded-2xl p-5">
                      <h3 className="text-sm font-bold text-blue-400 mb-4 uppercase tracking-wider flex items-center gap-2">
                        <Shield className="w-4 h-4" /> Primary Insurance
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <div className="text-xs text-blue-200/50">Provider</div>
                          <div className="text-sm font-bold text-blue-100">Star Health & Allied Insurance</div>
                        </div>
                        <div>
                          <div className="text-xs text-blue-200/50">Policy No.</div>
                          <div className="text-sm font-mono text-blue-200">SH-992-817263</div>
                        </div>
                        <div className="flex justify-between items-end">
                          <div>
                            <div className="text-xs text-blue-200/50">Sum Insured</div>
                            <div className="text-sm font-bold text-emerald-400">₹5,00,000</div>
                          </div>
                          <div className="text-xs px-2 py-1 bg-blue-500/20 text-blue-300 rounded border border-blue-500/30">Active</div>
                        </div>
                      </div>
                    </div>

                    {/* Aarogyasri Card */}
                    <div className="bg-gradient-to-br from-emerald-900/30 to-slate-900/80 border border-emerald-500/30 rounded-2xl p-5">
                      <h3 className="text-sm font-bold text-emerald-500 mb-3 uppercase tracking-wider">
                        Govt. Scheme
                      </h3>
                      <div className="space-y-2">
                        <div className="text-sm font-bold text-emerald-100">Dr. YSR Aarogyasri</div>
                        <div className="text-xs text-slate-400">Card No: <span className="font-mono text-emerald-200">AP-8829-1102</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: TIMELINE */}
              {activeRightTab === 'timeline' && (
                <div className="max-w-3xl mx-auto py-6">
                  <div className="relative border-l-2 border-slate-800 ml-4 space-y-8">
                    {mockTimeline.map((event) => (
                      <div key={event.id} className="relative pl-8">
                        <div className={`absolute -left-[17px] top-1 w-8 h-8 rounded-full border-2 bg-slate-950 flex items-center justify-center ${event.color.split(' ')[2]} shadow-lg`}>
                          {event.icon}
                        </div>
                        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 hover:border-slate-700/80 transition-colors">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-slate-200">{event.title}</h4>
                            <span className="text-xs text-slate-400 bg-slate-800/50 px-2 py-1 rounded-md border border-slate-700/50">
                              {new Date(event.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                            </span>
                          </div>
                          <p className="text-sm text-slate-400">{event.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: CLINICAL */}
              {activeRightTab === 'clinical' && (
                <div className="space-y-4 max-w-4xl">
                  {mockConsultations.map(consult => (
                    <div key={consult.id} className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden transition-all">
                      <div 
                        className="p-4 flex justify-between items-center cursor-pointer hover:bg-slate-800/40"
                        onClick={() => setExpandedConsultation(expandedConsultation === consult.id ? null : consult.id)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex flex-col items-center justify-center text-cyan-500">
                            <span className="text-xs font-bold">{new Date(consult.date).getDate()}</span>
                            <span className="text-[10px] uppercase">{new Date(consult.date).toLocaleString('default', { month: 'short' })}</span>
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-200">{consult.doctor}</h4>
                            <div className="text-xs text-slate-400 flex gap-3 mt-1">
                              <span>Token: <span className="font-mono text-slate-300">{consult.token}</span></span>
                              <span>Diagnosis: <span className="text-slate-300 truncate max-w-[200px] inline-block align-bottom">{consult.diagnosis}</span></span>
                            </div>
                          </div>
                        </div>
                        <div className="text-slate-500">
                          {expandedConsultation === consult.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </div>
                      </div>

                      {expandedConsultation === consult.id && (
                        <div className="p-5 border-t border-slate-800/80 bg-slate-900/30">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="col-span-1 space-y-4">
                              <div>
                                <h5 className="text-xs font-bold text-slate-500 uppercase mb-2">Vitals</h5>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div className="bg-slate-800/50 p-2 rounded-lg border border-slate-700/50">
                                    <span className="text-xs text-slate-400 block">BP</span>
                                    <span className="font-semibold text-rose-400">{consult.bp}</span>
                                  </div>
                                  <div className="bg-slate-800/50 p-2 rounded-lg border border-slate-700/50">
                                    <span className="text-xs text-slate-400 block">Pulse</span>
                                    <span className="font-semibold text-amber-400">{consult.pulse}</span>
                                  </div>
                                  <div className="bg-slate-800/50 p-2 rounded-lg border border-slate-700/50">
                                    <span className="text-xs text-slate-400 block">SpO2</span>
                                    <span className="font-semibold text-cyan-400">{consult.spo2}</span>
                                  </div>
                                  <div className="bg-slate-800/50 p-2 rounded-lg border border-slate-700/50">
                                    <span className="text-xs text-slate-400 block">Weight</span>
                                    <span className="font-semibold text-slate-200">{consult.weight}</span>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <h5 className="text-xs font-bold text-slate-500 uppercase mb-2">Follow Up</h5>
                                <div className="text-sm font-medium text-amber-400 flex items-center gap-2">
                                  <Calendar className="w-4 h-4" /> {new Date(consult.followup).toLocaleDateString()}
                                </div>
                              </div>
                            </div>

                            <div className="col-span-1 md:col-span-2 space-y-5">
                              <div>
                                <h5 className="text-xs font-bold text-slate-500 uppercase mb-1">Chief Complaints</h5>
                                <p className="text-sm text-slate-200 bg-slate-800/30 p-3 rounded-lg border border-slate-700/30">{consult.complaints}</p>
                              </div>
                              
                              <div>
                                <h5 className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
                                  <Droplet className="w-4 h-4 text-emerald-500" /> Prescriptions
                                </h5>
                                <div className="space-y-2">
                                  {consult.meds.map((med, i) => (
                                    <div key={i} className="flex justify-between items-center bg-slate-800/50 p-2.5 rounded-lg border border-slate-700/50">
                                      <span className="text-sm font-bold text-emerald-100">{med.name}</span>
                                      <div className="flex gap-4 text-xs font-mono text-slate-400">
                                        <span>{med.dose}</span>
                                        <span>{med.duration}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {consult.tests && (
                                <div>
                                  <h5 className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
                                    <Syringe className="w-4 h-4 text-violet-500" /> Lab Orders
                                  </h5>
                                  <div className="text-sm text-slate-300 bg-violet-500/5 border border-violet-500/20 p-3 rounded-lg">
                                    {consult.tests}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 4: ADMISSIONS */}
              {activeRightTab === 'admission' && (
                <div className="space-y-4 max-w-5xl">
                  {mockAdmissions.map(adm => (
                    <div key={adm.id} className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                        <Heart className="w-24 h-24" />
                      </div>
                      
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-lg font-bold text-slate-100">{adm.id}</h3>
                            <span className="px-2 py-0.5 text-xs font-bold rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                              {adm.ward}
                            </span>
                          </div>
                          <div className="text-sm text-slate-400">
                            {new Date(adm.admitDate).toLocaleDateString()} - {new Date(adm.dischargeDate).toLocaleDateString()} ({adm.los})
                          </div>
                        </div>
                        <button onClick={() => handleAction('View Discharge Summary')} className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors">
                          <FileText className="w-4 h-4" /> Summary
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                        <div>
                          <div className="text-xs text-slate-500 mb-1">Attending Doctor</div>
                          <div className="text-sm font-semibold text-slate-200">{adm.doctor}</div>
                          <div className="text-xs text-slate-400">{adm.dept}</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500 mb-1">Primary Diagnosis</div>
                          <div className="text-sm font-semibold text-rose-200">{adm.diagnosis}</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500 mb-1">Procedures</div>
                          <div className="text-sm font-semibold text-slate-200">{adm.procedures}</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500 mb-1">Billing</div>
                          <div className="text-sm font-semibold text-emerald-400">{adm.totalBill}</div>
                          <div className="text-xs text-slate-400">Ins: {adm.insuranceStatus}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 5: BILLING */}
              {activeRightTab === 'billing' && canSeeBilling && (
                <div className="max-w-4xl space-y-4">
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4">
                      <div className="text-xs text-slate-400 uppercase font-bold mb-1">Total Billed (Lifetime)</div>
                      <div className="text-2xl font-bold text-slate-200">₹1,31,500</div>
                    </div>
                    <div className="bg-slate-900/60 border border-emerald-900/50 rounded-xl p-4">
                      <div className="text-xs text-emerald-400/70 uppercase font-bold mb-1">Total Paid</div>
                      <div className="text-2xl font-bold text-emerald-400">₹1,31,500</div>
                    </div>
                    <div className="bg-slate-900/60 border border-rose-900/50 rounded-xl p-4">
                      <div className="text-xs text-rose-400/70 uppercase font-bold mb-1">Outstanding Due</div>
                      <div className="text-2xl font-bold text-rose-400">₹0</div>
                    </div>
                  </div>

                  <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-800/50 text-xs uppercase text-slate-400">
                          <th className="p-4 font-semibold">Invoice No</th>
                          <th className="p-4 font-semibold">Date</th>
                          <th className="p-4 font-semibold">Amount</th>
                          <th className="p-4 font-semibold">Status</th>
                          <th className="p-4 font-semibold">Mode</th>
                          <th className="p-4 font-semibold text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50">
                        {mockInvoices.map((inv) => (
                          <tr key={inv.id} className="hover:bg-slate-800/20 transition-colors">
                            <td className="p-4 font-mono text-sm text-slate-300">{inv.id}</td>
                            <td className="p-4 text-sm text-slate-400">{new Date(inv.date).toLocaleDateString()}</td>
                            <td className="p-4 text-sm font-bold text-slate-200">{inv.amount}</td>
                            <td className="p-4">
                              <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                {inv.status}
                              </span>
                            </td>
                            <td className="p-4 text-sm text-slate-400">{inv.mode}</td>
                            <td className="p-4 text-right">
                              <button onClick={() => handleAction('Print Receipt')} className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors">
                                <Download className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 6: INSURANCE */}
              {activeRightTab === 'insurance' && isInsurance && (
                <div className="max-w-4xl space-y-4">
                  {mockClaims.map(claim => (
                    <div key={claim.id} className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5">
                      <div className="flex justify-between items-start mb-4 pb-4 border-b border-slate-800/50">
                        <div>
                          <h3 className="text-lg font-bold text-blue-400">{claim.provider}</h3>
                          <div className="text-sm font-mono text-slate-400 mt-1">Claim ID: {claim.id}</div>
                        </div>
                        <span className="px-3 py-1 rounded-lg text-sm font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {claim.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <div className="text-xs text-slate-500 mb-1">Requested</div>
                          <div className="text-sm font-bold text-slate-200">{claim.reqAmount}</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500 mb-1">Approved</div>
                          <div className="text-sm font-bold text-emerald-400">{claim.aprAmount}</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500 mb-1">Submitted On</div>
                          <div className="text-sm font-medium text-slate-300">{new Date(claim.subDate).toLocaleDateString()}</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500 mb-1">Settled On</div>
                          <div className="text-sm font-medium text-slate-300">{new Date(claim.setDate).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 7: DOCUMENTS */}
              {activeRightTab === 'documents' && (
                <div className="max-w-4xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {mockDocuments.map(doc => (
                      <div key={doc.id} className="bg-slate-900/60 border border-slate-800/80 hover:border-cyan-500/30 rounded-xl p-4 transition-all group">
                        <div className="flex items-start gap-3 mb-3">
                          <div className={`p-2.5 rounded-lg shrink-0 ${
                            doc.type === 'pdf' ? 'bg-rose-500/10 text-rose-400' :
                            doc.type === 'image' ? 'bg-blue-500/10 text-blue-400' :
                            'bg-amber-500/10 text-amber-400'
                          }`}>
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-semibold text-slate-200 truncate" title={doc.name}>{doc.name}</h4>
                            <div className="text-xs text-slate-500 mt-0.5">{doc.size} • {new Date(doc.date).toLocaleDateString()}</div>
                          </div>
                        </div>
                        <div className="flex justify-between items-center mt-4">
                          <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                            doc.status === 'Signed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {doc.status}
                          </span>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleAction('Document Preview')} className="p-1.5 hover:bg-slate-800 rounded text-slate-300 hover:text-cyan-400 transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleAction('Download')} className="p-1.5 hover:bg-slate-800 rounded text-slate-300 hover:text-cyan-400 transition-colors">
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <button onClick={() => handleAction('Upload Document')} className="bg-slate-900/30 border border-dashed border-slate-700 hover:border-cyan-500/50 hover:bg-cyan-500/5 rounded-xl p-4 flex flex-col items-center justify-center gap-2 text-slate-500 hover:text-cyan-400 transition-all min-h-[140px]">
                      <Plus className="w-6 h-6" />
                      <span className="text-sm font-medium">Upload New</span>
                    </button>
                  </div>
                </div>
              )}

            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
            <User className="w-16 h-16 mb-4 text-slate-800" />
            <h2 className="text-xl font-bold text-slate-400">No Patient Selected</h2>
            <p className="text-sm mt-2">Select a patient from the list or register a new one.</p>
          </div>
        )}
      </div>
    </div>
  );
};

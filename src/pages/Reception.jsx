import React, { useState } from 'react';
import { useHospital } from '../context/HospitalContext';
import { UserPlus, Search, Ticket, MessageSquare, CheckCircle2, AlertTriangle, } from 'lucide-react';
export const ReceptionModule = () => {
    const { patients, doctors, appointments, addPatient, addAppointment, checkOPValidity } = useHospital();
    const [activeTab, setActiveTab] = useState('queue');
    // Form State for Walk-in Patient Registration
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        gender: 'Male',
        phone: '',
        email: '',
        bloodGroup: 'O+ve',
        address: '',
        emergencyName: '',
        emergencyPhone: '',
        allergies: '',
    });
    // Token / Appointment Booking State
    const [selectedPatientId, setSelectedPatientId] = useState('');
    const [selectedDoctorId, setSelectedDoctorId] = useState(doctors[0]?.id || '');
    const [appointmentModel, setAppointmentModel] = useState('Normal Queue');
    const [timeSlot, setTimeSlot] = useState('10:00 AM');
    const [searchFilter, setSearchFilter] = useState('');
    const selectedDoctor = doctors.find((d) => d.id === selectedDoctorId);
    const selectedPatient = patients.find((p) => p.id === selectedPatientId);
    // Computed validity check if patient selected
    const validityStatus = selectedPatient ? checkOPValidity(selectedPatient.lastVisitDate) : null;
    const handleRegister = (e) => {
        e.preventDefault();
        if (!formData.name || !formData.phone)
            return;
        addPatient({
            name: formData.name,
            age: Number(formData.age) || 30,
            gender: formData.gender,
            phone: formData.phone,
            email: formData.email,
            bloodGroup: formData.bloodGroup,
            address: formData.address,
            emergencyContact: {
                name: formData.emergencyName || 'Relative',
                relationship: 'Family',
                phone: formData.emergencyPhone || formData.phone,
            },
            allergies: formData.allergies ? formData.allergies.split(',') : [],
            medicalHistory: ['Initial OP Registration'],
            lastVisitDate: '2026-07-24',
            opValidityEndDate: '2026-08-08',
        });
        setFormData({
            name: '',
            age: '',
            gender: 'Male',
            phone: '',
            email: '',
            bloodGroup: 'O+ve',
            address: '',
            emergencyName: '',
            emergencyPhone: '',
            allergies: '',
        });
        setActiveTab('queue');
    };
    const handleIssueToken = (e) => {
        e.preventDefault();
        if (!selectedPatient || !selectedDoctor)
            return;
        const fee = validityStatus?.isValid ? 0 : appointmentModel === 'Premium Slot' ? selectedDoctor.premiumFee : selectedDoctor.consultationFee;
        addAppointment({
            patientId: selectedPatient.id,
            patientName: selectedPatient.name,
            patientPhone: selectedPatient.phone,
            patientAge: selectedPatient.age,
            patientGender: selectedPatient.gender,
            doctorId: selectedDoctor.id,
            doctorName: selectedDoctor.name,
            departmentName: selectedDoctor.departmentName,
            appointmentDate: '2026-07-24',
            appointmentTime: timeSlot,
            model: appointmentModel,
            fee,
            isFollowUp: validityStatus?.isValid || false,
            status: 'Checked-In',
            paymentStatus: fee === 0 ? 'Waived' : 'Paid',
            whatsappSent: true,
            smsSent: true,
        });
        setSelectedPatientId('');
    };
    const filteredQueue = appointments.filter((apt) => apt.patientName.toLowerCase().includes(searchFilter.toLowerCase()) ||
        apt.tokenNumber.toLowerCase().includes(searchFilter.toLowerCase()) ||
        apt.doctorName.toLowerCase().includes(searchFilter.toLowerCase()));
    return (<div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              Central Reception Desk
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-white mt-1">Patient Check-in & Token Generation</h2>
          <p className="text-xs text-slate-400">
            Issue instant tokens, perform returning UHID lookup, and manage walk-in queues.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center p-1 bg-slate-950 rounded-xl border border-slate-800">
          <button onClick={() => setActiveTab('queue')} className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${activeTab === 'queue' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}>
            Today's Queue ({appointments.length})
          </button>
          <button onClick={() => setActiveTab('register')} className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${activeTab === 'register' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}>
            + New Walk-in Registration
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'queue' && (<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Issue Token Form Panel */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 h-fit">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 mb-3">
              <Ticket className="w-4 h-4 text-cyan-400"/>
              Quick OPD Token Generator
            </h3>

            <form onSubmit={handleIssueToken} className="space-y-4">
              {/* Select Patient */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Select Patient (UHID Search)</label>
                <select value={selectedPatientId} onChange={(e) => setSelectedPatientId(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500" required>
                  <option value="">-- Choose Returning Patient --</option>
                  {patients.map((pat) => (<option key={pat.id} value={pat.id}>
                      {pat.name} ({pat.uhid}) - {pat.phone}
                    </option>))}
                </select>
              </div>

              {/* Patient 15-day OP Validity Alert Banner */}
              {selectedPatient && validityStatus && (<div className={`p-3 rounded-xl border text-xs ${validityStatus.isValid
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-300'}`}>
                  <div className="font-semibold flex items-center gap-1.5">
                    {validityStatus.isValid ? <CheckCircle2 className="w-4 h-4 text-emerald-400"/> : <AlertTriangle className="w-4 h-4 text-amber-400"/>}
                    {validityStatus.isValid
                    ? `Active 15-Day OP Free Consultation (${validityStatus.daysRemaining} days left)`
                    : '15-Day OP Validity Expired - Standard Fee Applies'}
                  </div>
                  <div className="text-[10px] opacity-80 mt-0.5">
                    Last Visit: {selectedPatient.lastVisitDate} • Valid Until: {validityStatus.endDateStr}
                  </div>
                </div>)}

              {/* Doctor Selection */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Select Attending Doctor</label>
                <select value={selectedDoctorId} onChange={(e) => setSelectedDoctorId(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500">
                  {doctors.map((doc) => (<option key={doc.id} value={doc.id}>
                      {doc.name} - {doc.specialization} (Fee ₹{doc.consultationFee})
                    </option>))}
                </select>
              </div>

              {/* Appointment Model Selector */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Appointment Model</label>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setAppointmentModel('Normal Queue')} className={`py-2 rounded-xl text-xs font-semibold border transition ${appointmentModel === 'Normal Queue'
                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'}`}>
                    Normal Walk-in Queue
                  </button>

                  <button type="button" onClick={() => setAppointmentModel('Premium Slot')} className={`py-2 rounded-xl text-xs font-semibold border transition ${appointmentModel === 'Premium Slot'
                ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'}`}>
                    Premium Time Slot
                  </button>
                </div>
              </div>

              {/* Time Slot Picker for Premium */}
              {appointmentModel === 'Premium Slot' && (<div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Select Fixed Time Slot</label>
                  <select value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100">
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="10:15 AM">10:15 AM</option>
                    <option value="10:30 AM">10:30 AM</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="11:30 AM">11:30 AM</option>
                  </select>
                </div>)}

              {/* Token Fee Summary */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center text-xs">
                <span className="text-slate-400">Total Consultation Fee:</span>
                <span className="font-extrabold text-cyan-400 text-sm">
                  {validityStatus?.isValid
                ? '₹0 (Free Follow-up)'
                : `₹${appointmentModel === 'Premium Slot' ? selectedDoctor?.premiumFee : selectedDoctor?.consultationFee}`}
                </span>
              </div>

              <button type="submit" className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-cyan-600/20 transition">
                Generate Token & Send Alerts
              </button>
            </form>
          </div>

          {/* Active OPD Queue Grid */}
          <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-cyan-400"/>
                Live Reception Queue Monitor
              </h3>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5"/>
                <input type="text" placeholder="Filter queue..." value={searchFilter} onChange={(e) => setSearchFilter(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"/>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-3">Token #</th>
                    <th className="py-2.5 px-3">Patient Name</th>
                    <th className="py-2.5 px-3">Doctor</th>
                    <th className="py-2.5 px-3">Model</th>
                    <th className="py-2.5 px-3">Fee Status</th>
                    <th className="py-2.5 px-3">Alert Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {filteredQueue.map((apt) => (<tr key={apt.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-3">
                        <span className="font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
                          {apt.tokenNumber}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-100">{apt.patientName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {apt.patientGender}, {apt.patientAge} yrs • {apt.patientPhone}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-medium text-slate-200">{apt.doctorName}</div>
                        <div className="text-[10px] text-slate-400">{apt.departmentName}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 text-[10px] font-semibold rounded ${apt.model === 'Premium Slot'
                    ? 'bg-purple-500/10 text-purple-300 border border-purple-500/30'
                    : 'bg-slate-800 text-slate-300'}`}>
                          {apt.model} ({apt.appointmentTime})
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        {apt.isFollowUp ? (<span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded">
                            Free Follow-up
                          </span>) : (<span className="font-semibold text-slate-200">₹{apt.fee}</span>)}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5 text-[10px] text-emerald-400">
                          <MessageSquare className="w-3 h-3 text-emerald-400"/>
                          <span>SMS & WhatsApp Sent</span>
                        </div>
                      </td>
                    </tr>))}
                </tbody>
              </table>
            </div>
          </div>
        </div>)}

      {/* New Registration Tab */}
      {activeTab === 'register' && (<div className="max-w-3xl mx-auto p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-6">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-cyan-400"/>
            <h3 className="text-base font-bold text-slate-100">Walk-in Patient Comprehensive Registration</h3>
          </div>

          <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Full Patient Name *</label>
              <input type="text" placeholder="e.g. Ramesh Kumar" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500" required/>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Mobile Phone Number *</label>
              <input type="text" placeholder="+91 98490 00000" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500" required/>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Age</label>
              <input type="number" placeholder="e.g. 42" value={formData.age} onChange={(e) => setFormData({ ...formData, age: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"/>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Gender</label>
              <select value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Blood Group</label>
              <select value={formData.bloodGroup} onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100">
                <option value="O+ve">O+ve</option>
                <option value="A+ve">A+ve</option>
                <option value="B+ve">B+ve</option>
                <option value="AB+ve">AB+ve</option>
                <option value="O-ve">O-ve</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Email Address</label>
              <input type="email" placeholder="patient@email.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"/>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1">Residential Address</label>
              <input type="text" placeholder="Plot no, street, city..." value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"/>
            </div>

            <div className="md:col-span-2 flex justify-end gap-3 pt-4">
              <button type="button" onClick={() => setActiveTab('queue')} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition">
                Cancel
              </button>
              <button type="submit" className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md shadow-cyan-600/20 transition">
                Register Patient & Issue UHID
              </button>
            </div>
          </form>
        </div>)}
    </div>);
};

export const Reception = ReceptionModule;
export default ReceptionModule;

import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import type { AppointmentModel } from '../../types';
import {
  CalendarCheck,
  Clock,
  MessageSquare,
  Search,
  Plus,
  Zap,
} from 'lucide-react';

export const AppointmentModule: React.FC = () => {
  const { appointments, doctors, patients, addAppointment, checkOPValidity } = useHospital();

  const [activeTab, setActiveTab] = useState<'all' | 'premium' | 'normal'>('all');
  const [selectedDoctorId, setSelectedDoctorId] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Booking Modal State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingPatientId, setBookingPatientId] = useState(patients[0]?.id || '');
  const [bookingDoctorId, setBookingDoctorId] = useState(doctors[0]?.id || '');
  const [bookingModel, setBookingModel] = useState<AppointmentModel>('Premium Slot');
  const [bookingSlot, setBookingSlot] = useState('10:20 AM');

  const selectedPatient = patients.find((p) => p.id === bookingPatientId);
  const selectedDoctor = doctors.find((d) => d.id === bookingDoctorId);
  const validity = selectedPatient ? checkOPValidity(selectedPatient.lastVisitDate) : null;

  const filteredAppointments = appointments.filter((apt) => {
    const matchesModel =
      activeTab === 'all'
        ? true
        : activeTab === 'premium'
        ? apt.model === 'Premium Slot'
        : apt.model === 'Normal Queue';
    const matchesDoctor = selectedDoctorId === 'all' || apt.doctorId === selectedDoctorId;
    const matchesSearch =
      apt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.tokenNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesModel && matchesDoctor && matchesSearch;
  });

  const timeSlots = ['10:00 AM', '10:10 AM', '10:20 AM', '10:30 AM', '10:40 AM', '11:00 AM', '11:15 AM', '11:30 AM'];

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient || !selectedDoctor) return;

    const fee = validity?.isValid
      ? 0
      : bookingModel === 'Premium Slot'
      ? selectedDoctor.premiumFee
      : selectedDoctor.consultationFee;

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
      appointmentTime: bookingSlot,
      model: bookingModel,
      fee,
      isFollowUp: validity?.isValid || false,
      status: 'Scheduled',
      paymentStatus: fee === 0 ? 'Waived' : 'Paid',
      whatsappSent: true,
      smsSent: true,
    });

    setIsBookingModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              Dual Scheduling Engine
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-white mt-1">Appointment Management</h2>
          <p className="text-xs text-slate-400">
            Fixed 10-min time slot reservations & high-throughput reception walk-in queue.
          </p>
        </div>

        <button
          onClick={() => setIsBookingModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-cyan-600/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Book Appointment</span>
        </button>
      </div>

      {/* Appointment Model Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Model 1: Premium Fixed Slot */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 to-slate-900 border border-purple-500/30 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-purple-200">Premium Appointment Model</h3>
              <span className="px-1.5 py-0.2 text-[9px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded">
                Fixed 10-Min Slots
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 leading-snug">
              Guaranteed time slots (10:00, 10:10, 10:20...). Fee: ₹400-₹850. Includes automatic 15-day OP return validity.
            </p>
          </div>
        </div>

        {/* Model 2: Normal Queue */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 to-slate-900 border border-cyan-500/30 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-cyan-200">Normal Appointment Model</h3>
              <span className="px-1.5 py-0.2 text-[9px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded">
                Queue Based
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 leading-snug">
              Reception / Phone / Walk-in token allocation. Fee: ₹300-₹400. First-come, first-served consultation flow.
            </p>
          </div>
        </div>
      </div>

      {/* Filter & Table Toolbar */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Model Filter Pills */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'all' ? 'bg-cyan-600 text-white' : 'bg-slate-950 text-slate-400 border border-slate-800'
              }`}
            >
              All Appointments ({appointments.length})
            </button>
            <button
              onClick={() => setActiveTab('premium')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'premium' ? 'bg-purple-600 text-white' : 'bg-slate-950 text-slate-400 border border-slate-800'
              }`}
            >
              Premium Slots ({appointments.filter((a) => a.model === 'Premium Slot').length})
            </button>
            <button
              onClick={() => setActiveTab('normal')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'normal' ? 'bg-cyan-600 text-white' : 'bg-slate-950 text-slate-400 border border-slate-800'
              }`}
            >
              Normal Queue ({appointments.filter((a) => a.model === 'Normal Queue').length})
            </button>
          </div>

          {/* Search & Doctor Filter */}
          <div className="flex items-center gap-2">
            <select
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200"
            >
              <option value="all">All Doctors</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search patient, token..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Appointments Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Token / Slot</th>
                <th className="py-2.5 px-3">Patient Details</th>
                <th className="py-2.5 px-3">Doctor & Specialty</th>
                <th className="py-2.5 px-3">Model Type</th>
                <th className="py-2.5 px-3">Fee & Validity</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">SMS & WhatsApp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {filteredAppointments.map((apt) => (
                <tr key={apt.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-3 font-mono">
                    <span className="font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
                      {apt.tokenNumber}
                    </span>
                    <div className="text-[10px] text-slate-400 mt-1">{apt.appointmentTime}</div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-100">{apt.patientName}</div>
                    <div className="text-[10px] text-slate-400">
                      {apt.patientGender}, {apt.patientAge} yrs • {apt.patientPhone}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-200">{apt.doctorName}</div>
                    <div className="text-[10px] text-slate-400">{apt.departmentName}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                        apt.model === 'Premium Slot'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {apt.model}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    {apt.isFollowUp ? (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded">
                        15-Day OP Free
                      </span>
                    ) : (
                      <span className="font-extrabold text-slate-100">₹{apt.fee}</span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                        apt.status === 'Checked-In'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                      }`}
                    >
                      {apt.status}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1 text-[10px] text-emerald-400">
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Sent</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Modal */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-cyan-400" />
                Schedule Appointment Wizard
              </h3>
              <button
                onClick={() => setIsBookingModalOpen(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBookingSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Select Patient</label>
                <select
                  value={bookingPatientId}
                  onChange={(e) => setBookingPatientId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.uhid})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Select Doctor</label>
                <select
                  value={bookingDoctorId}
                  onChange={(e) => setBookingDoctorId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                >
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.specialization})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Appointment Model</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setBookingModel('Premium Slot')}
                    className={`py-2 rounded-xl border text-xs font-bold ${
                      bookingModel === 'Premium Slot'
                        ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    Premium Slot (Fixed)
                  </button>
                  <button
                    type="button"
                    onClick={() => setBookingModel('Normal Queue')}
                    className={`py-2 rounded-xl border text-xs font-bold ${
                      bookingModel === 'Normal Queue'
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    Normal Queue
                  </button>
                </div>
              </div>

              {bookingModel === 'Premium Slot' && (
                <div>
                  <label className="block text-slate-400 mb-1">Choose Fixed 10-Min Slot</label>
                  <div className="grid grid-cols-4 gap-2">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setBookingSlot(slot)}
                        className={`py-1.5 rounded-lg border text-[11px] font-mono font-semibold ${
                          bookingSlot === slot
                            ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                            : 'bg-slate-950 border-slate-800 text-slate-300'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Total Consultation Fee:</span>
                <span className="font-extrabold text-cyan-400 text-sm">
                  {validity?.isValid
                    ? '₹0 (Free Follow-up)'
                    : `₹${bookingModel === 'Premium Slot' ? selectedDoctor?.premiumFee : selectedDoctor?.consultationFee}`}
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBookingModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-600 text-white font-bold"
                >
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

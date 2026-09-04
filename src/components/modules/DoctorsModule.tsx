import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import {
  Star,
  Building2,
  Stethoscope,
  UserPlus,
  X,
  CheckCircle2,
  Upload,
  Camera,
} from 'lucide-react';
import type { Doctor } from '../../types';

export const DoctorsModule: React.FC = () => {
  const { doctors, departments, activeBranch, activeTenant, currentUser, addDoctor, updateDoctorStatus, addBranch } = useHospital();
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>(activeBranch.id);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [searchDoctorTerm, setSearchDoctorTerm] = useState<string>('');
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);
  const [showAddBranchModal, setShowAddBranchModal] = useState(false);

  // New Branch Form
  const [newBranchForm, setNewBranchForm] = useState({
    name: '',
    city: '',
    isMainBranch: false,
  });

  const handleAddBranchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranchForm.name.trim() || !newBranchForm.city.trim()) return;

    addBranch({
      name: newBranchForm.name.trim(),
      city: newBranchForm.city.trim(),
      isMainBranch: newBranchForm.isMainBranch,
    });

    setShowAddBranchModal(false);
    setNewBranchForm({ name: '', city: '', isMainBranch: false });
  };

  // Permission Check: ONLY Admin / CEO / HR can onboard or add doctors
  const canAddDoctor =
    currentUser?.role === 'admin' ||
    currentUser?.role === 'ceo' ||
    currentUser?.role === 'hr';

  // Permission to change doctor duty status: Admin, CEO, HR, or the doctor themselves
  const canChangeStatus = (doc: Doctor) => {
    if (canAddDoctor) return true;
    if (currentUser?.role === 'doctor' || currentUser?.role === 'dmo') {
      return (
        currentUser.name.toLowerCase().includes(doc.name.toLowerCase().replace('dr. ', '')) ||
        doc.name.toLowerCase().includes(currentUser.name.toLowerCase())
      );
    }
    return false;
  };

  // Status Metrics Breakdown
  const onDutyCount = doctors.filter((d) => d.status === 'On Duty').length;
  const inSurgeryCount = doctors.filter((d) => d.status === 'In Surgery').length;
  const onLeaveCount = doctors.filter((d) => d.status === 'On Leave').length;
  const offDutyCount = doctors.filter((d) => d.status === 'Off Duty').length;

  // Form State for Onboarding New Doctor
  const [newDoctorForm, setNewDoctorForm] = useState({
    doctorId: `DOC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    name: '',
    designation: 'Senior Consultant',
    qualification: 'MBBS, MD',
    departmentId: departments[0]?.id || 'dept-1',
    specialization: '',
    email: '',
    opdRoom: 'OPD-102',
    consultationFee: 400,
    premiumFee: 600,
    workingHours: '09:00 AM - 04:30 PM',
    maxPatientsPerDay: 35,
    experienceYears: 10,
    branchId: activeBranch.id,
    availabilityDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80',
  });

  const allDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const toggleDay = (day: string) => {
    setNewDoctorForm((prev) => {
      const exists = prev.availabilityDays.includes(day);
      if (exists) {
        return { ...prev, availabilityDays: prev.availabilityDays.filter((d) => d !== day) };
      }
      return { ...prev, availabilityDays: [...prev.availabilityDays, day] };
    });
  };

  // Handle Photo File Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setNewDoctorForm((prev) => ({ ...prev, image: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddDoctorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoctorForm.name.trim()) return;

    const matchedDept = departments.find((d) => d.id === newDoctorForm.departmentId);
    const matchedBranch = activeTenant.branches.find((b) => b.id === newDoctorForm.branchId);

    const emailPrefix = newDoctorForm.name.toLowerCase().replace(/^dr\.\s*/, '').replace(/[^a-z0-9]/g, '.');
    const autoEmail = newDoctorForm.email.trim() || `${emailPrefix}@anaravhealth.com`;

    const doctorPayload: Omit<Doctor, 'id'> = {
      doctorId: newDoctorForm.doctorId || `DOC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      name: newDoctorForm.name.startsWith('Dr.') ? newDoctorForm.name : `Dr. ${newDoctorForm.name}`,
      designation: newDoctorForm.designation || newDoctorForm.specialization || 'Consultant Specialist',
      qualification: newDoctorForm.qualification,
      departmentId: newDoctorForm.departmentId,
      departmentName: matchedDept?.name || 'General Medicine',
      specialization: newDoctorForm.specialization || newDoctorForm.designation || `${matchedDept?.name || 'General'} Specialist`,
      email: autoEmail,
      opdRoom: newDoctorForm.opdRoom || 'OPD-101',
      consultationFee: Number(newDoctorForm.consultationFee) || 300,
      premiumFee: Number(newDoctorForm.premiumFee) || 500,
      workingHours: newDoctorForm.workingHours,
      maxPatientsPerDay: Number(newDoctorForm.maxPatientsPerDay) || 30,
      experienceYears: Number(newDoctorForm.experienceYears) || 5,
      rating: 4.9,
      status: 'On Duty',
      branchId: newDoctorForm.branchId,
      branchName: matchedBranch?.name || activeBranch.name,
      availabilityDays: newDoctorForm.availabilityDays.length > 0 ? newDoctorForm.availabilityDays : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      image: newDoctorForm.image,
      avatar: newDoctorForm.image,
    };

    addDoctor(doctorPayload);
    setShowAddDoctorModal(false);

    // Reset Form
    setNewDoctorForm({
      doctorId: `DOC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      name: '',
      designation: 'Senior Consultant',
      qualification: 'MBBS, MD',
      departmentId: departments[0]?.id || 'dept-1',
      specialization: '',
      email: '',
      opdRoom: 'OPD-102',
      consultationFee: 400,
      premiumFee: 600,
      workingHours: '09:00 AM - 04:30 PM',
      maxPatientsPerDay: 35,
      experienceYears: 10,
      branchId: activeBranch.id,
      availabilityDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80',
    });
  };

  const filteredDoctors = doctors.filter((doc) => {
    const matchesBranch = selectedBranchFilter === 'all' || doc.branchId === selectedBranchFilter || (!doc.branchId && selectedBranchFilter === 'b-1');
    const matchesStatus = selectedStatusFilter === 'all' || doc.status === selectedStatusFilter;
    const matchesSearch =
      !searchDoctorTerm ||
      doc.name.toLowerCase().includes(searchDoctorTerm.toLowerCase()) ||
      doc.specialization?.toLowerCase().includes(searchDoctorTerm.toLowerCase()) ||
      doc.designation?.toLowerCase().includes(searchDoctorTerm.toLowerCase()) ||
      doc.departmentName.toLowerCase().includes(searchDoctorTerm.toLowerCase());

    return matchesBranch && matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30 flex items-center gap-1">
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Medical Roster</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" />
              <span>{activeBranch.name}</span>
            </span>
            {canAddDoctor && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30">
                Admin Authorized
              </span>
            )}
          </div>
          <h2 className="text-2xl font-black text-white">Doctors &amp; Medical Faculty Directory</h2>
          <p className="text-xs text-slate-400">
            Consultant profiles, clinical designations, branch allocation, OPD chambers, tariffs, and duty schedules.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {canAddDoctor && (
            <>
              <button
                type="button"
                onClick={() => setShowAddDoctorModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-purple-600/30 transition active:scale-95"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ Add Doctor</span>
              </button>
              <button
                type="button"
                onClick={() => setShowAddBranchModal(true)}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs shadow-sm transition"
              >
                <Building2 className="w-4 h-4 text-cyan-400" />
                <span>+ Add Branch</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Campus / Branch Filter Selector */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-slate-900/90 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Building2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="text-xs font-bold text-slate-300">Selected Branch:</span>
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs flex-wrap">
            {activeTenant.branches.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setSelectedBranchFilter(b.id)}
                className={`px-3 py-1.5 rounded-xl font-bold transition ${
                  selectedBranchFilter === b.id
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                📍 {b.name.split('(')[0].trim()} ({doctors.filter((d) => d.branchId === b.id || (!d.branchId && b.id === 'b-1')).length})
              </button>
            ))}
            <button
              type="button"
              onClick={() => setSelectedBranchFilter('all')}
              className={`px-3 py-1.5 rounded-xl font-bold transition ${
                selectedBranchFilter === 'all'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              🌐 All Branches ({doctors.length})
            </button>
          </div>
        </div>

        <div className="text-xs text-slate-400">
          Showing <strong className="text-white">{filteredDoctors.length}</strong> doctors
        </div>
      </div>

      {/* Live Roster Status Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div
          onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'On Duty' ? 'all' : 'On Duty')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            selectedStatusFilter === 'On Duty'
              ? 'bg-emerald-500/20 border-emerald-500 ring-2 ring-emerald-500/40'
              : 'bg-slate-900/80 border-slate-800 hover:border-emerald-500/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              On Duty (OPD &amp; Wards)
            </span>
            <span className="text-xl font-mono font-black text-emerald-300">{onDutyCount}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Available for live consultations</p>
        </div>

        <div
          onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'In Surgery' ? 'all' : 'In Surgery')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            selectedStatusFilter === 'In Surgery'
              ? 'bg-purple-500/20 border-purple-500 ring-2 ring-purple-500/40'
              : 'bg-slate-900/80 border-slate-800 hover:border-purple-500/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              In Surgery (OT Complex)
            </span>
            <span className="text-xl font-mono font-black text-purple-300">{inSurgeryCount}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Operating Theater active case</p>
        </div>

        <div
          onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'On Leave' ? 'all' : 'On Leave')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            selectedStatusFilter === 'On Leave'
              ? 'bg-amber-500/20 border-amber-500 ring-2 ring-amber-500/40'
              : 'bg-slate-900/80 border-slate-800 hover:border-amber-500/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              On Approved Leave
            </span>
            <span className="text-xl font-mono font-black text-amber-300">{onLeaveCount}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Leave of absence / Conference</p>
        </div>

        <div
          onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'Off Duty' ? 'all' : 'Off Duty')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            selectedStatusFilter === 'Off Duty'
              ? 'bg-slate-700/40 border-slate-500 ring-2 ring-slate-400/40'
              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-500" />
              Off Duty / Post-Shift
            </span>
            <span className="text-xl font-mono font-black text-slate-200">{offDutyCount}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Shift concluded / Day off</p>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between gap-3 text-xs">
        <input
          type="text"
          placeholder="Search by doctor name, designation, department..."
          value={searchDoctorTerm}
          onChange={(e) => setSearchDoctorTerm(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
        />
      </div>

      {/* Doctor Directory Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDoctors.map((doc) => (
          <div
            key={doc.id}
            className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 transition shadow-xl space-y-4 relative"
          >
            {/* Top Profile Banner */}
            <div className="flex items-start gap-3.5">
              <img
                src={doc.image || doc.avatar}
                alt={doc.name}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-cyan-500/40 shrink-0 shadow-md"
              />
              <div className="overflow-hidden flex-1">
                <div className="flex items-center justify-between gap-1">
                  <h3 className="font-extrabold text-white text-sm truncate">{doc.name}</h3>
                  <span className="text-[10px] text-amber-400 font-bold flex items-center gap-1 shrink-0 font-mono">
                    <Star className="w-3 h-3 fill-amber-400" /> {doc.rating}
                  </span>
                </div>
                <div className="text-xs text-cyan-400 font-bold truncate">
                  {doc.designation || doc.specialization}
                </div>
                <div className="text-[11px] text-slate-400 truncate">{doc.departmentName}</div>

                <div className="pt-1 flex items-center gap-1.5 flex-wrap">
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30">
                    <Building2 className="w-2.5 h-2.5" />
                    {doc.branchName || (doc.branchId === 'b-2' ? 'Tirupati Branch' : doc.branchId === 'b-3' ? 'Vijayawada Center' : 'Nellore Main Campus')}
                  </span>
                  {doc.doctorId && (
                    <span className="inline-flex items-center text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {doc.doctorId}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Fees & Chamber Info */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Qualifications:</span>
                <span className="text-slate-200 font-medium">{doc.qualification}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>OPD Consultation Fee:</span>
                <span className="font-bold text-emerald-400 font-mono">₹{doc.consultationFee}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>OPD Chamber:</span>
                <span className="text-cyan-300 font-bold font-mono">{doc.opdRoom || 'OPD-102'}</span>
              </div>
              <div className="flex justify-between text-slate-400 border-t border-slate-800/80 pt-1">
                <span>Working Hours:</span>
                <span className="text-slate-200 font-semibold">{doc.workingHours}</span>
              </div>
            </div>

            {/* Duty Status & Action */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Duty Status:</span>
              {canChangeStatus(doc) ? (
                <select
                  value={doc.status}
                  onChange={(e) => updateDoctorStatus(doc.id, e.target.value as Doctor['status'])}
                  className={`text-xs font-bold px-2.5 py-1 rounded-lg border focus:outline-none transition cursor-pointer ${
                    doc.status === 'On Duty'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : doc.status === 'In Surgery'
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                      : doc.status === 'On Leave'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  <option value="On Duty">🟢 On Duty (OPD &amp; Wards)</option>
                  <option value="In Surgery">🟣 In Surgery (OT Complex)</option>
                  <option value="On Leave">🟡 On Approved Leave</option>
                  <option value="Off Duty">⚪ Off Duty / Post-Shift</option>
                </select>
              ) : (
                <span
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                    doc.status === 'On Duty'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : doc.status === 'In Surgery'
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                      : doc.status === 'On Leave'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  {doc.status === 'On Duty' && '🟢 On Duty'}
                  {doc.status === 'In Surgery' && '🟣 In Surgery (OT)'}
                  {doc.status === 'On Leave' && '🟡 On Leave'}
                  {doc.status === 'Off Duty' && '⚪ Off Duty'}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Admin Doctor Onboarding Modal */}
      {showAddDoctorModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-purple-500/40 text-slate-100 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-8">
            {/* Modal Header */}
            <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Add New Doctor Profile &amp; Account</h3>
                  <p className="text-xs text-slate-400">
                    Register medical faculty, branch allocation, designation, profile picture, tariffs, and duty roster
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddDoctorModal(false)}
                className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddDoctorSubmit} className="p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
              {/* Profile Picture Upload & Preview */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-4">
                <div className="relative">
                  <img
                    src={newDoctorForm.image}
                    alt="Doctor Avatar"
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-purple-500 shadow-md"
                  />
                  <div className="absolute -bottom-1 -right-1 p-1 bg-purple-600 rounded-full text-white">
                    <Camera className="w-3 h-3" />
                  </div>
                </div>

                <div className="space-y-1.5 flex-1">
                  <label className="block text-slate-300 font-bold">Doctor Profile Picture / Avatar</label>
                  <div className="flex items-center gap-2">
                    <label className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] cursor-pointer shadow-md transition flex items-center gap-1">
                      <Upload className="w-3 h-3" />
                      <span>Upload Photo</span>
                      <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                    </label>
                    <span className="text-[10px] text-slate-500">or enter image URL below</span>
                  </div>
                  <input
                    type="url"
                    value={newDoctorForm.image}
                    onChange={(e) => setNewDoctorForm({ ...newDoctorForm, image: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-[11px] text-slate-300 font-mono"
                  />
                </div>
              </div>

              {/* Doctor Core Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Doctor Name */}
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Doctor Full Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Rahul Sharma"
                    value={newDoctorForm.name}
                    onChange={(e) => setNewDoctorForm({ ...newDoctorForm, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-bold focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Designation / Role */}
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Designation / Clinical Role <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Medical Oncologist / Senior Consultant"
                    value={newDoctorForm.designation}
                    onChange={(e) => setNewDoctorForm({ ...newDoctorForm, designation: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-bold focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Department */}
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Clinical Department <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={newDoctorForm.departmentId}
                    onChange={(e) => setNewDoctorForm({ ...newDoctorForm, departmentId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-bold focus:outline-none focus:border-purple-500"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Hospital Branch Assignment */}
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Hospital Branch / Campus <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={newDoctorForm.branchId}
                    onChange={(e) => setNewDoctorForm({ ...newDoctorForm, branchId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-cyan-300 font-bold focus:outline-none focus:border-cyan-500"
                  >
                    {activeTenant.branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        📍 {b.name} ({b.city})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Doctor ID / Code */}
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Doctor ID / Registration Code</label>
                  <input
                    type="text"
                    value={newDoctorForm.doctorId}
                    onChange={(e) => setNewDoctorForm({ ...newDoctorForm, doctorId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono font-bold"
                  />
                </div>

                {/* Official Email / Username */}
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Official Doctor Email</label>
                  <input
                    type="email"
                    placeholder="e.g. rahul.sharma@anaravhealth.com"
                    value={newDoctorForm.email}
                    onChange={(e) => setNewDoctorForm({ ...newDoctorForm, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono"
                  />
                </div>

                {/* Qualification */}
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Qualifications &amp; Degrees</label>
                  <input
                    type="text"
                    placeholder="e.g. MBBS, MD, DM (Oncology), ESMO"
                    value={newDoctorForm.qualification}
                    onChange={(e) => setNewDoctorForm({ ...newDoctorForm, qualification: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>

                {/* OPD Chamber Room */}
                <div>
                  <label className="block text-slate-300 font-bold mb-1">OPD Chamber Room</label>
                  <input
                    type="text"
                    placeholder="e.g. OPD-104 (1st Floor)"
                    value={newDoctorForm.opdRoom}
                    onChange={(e) => setNewDoctorForm({ ...newDoctorForm, opdRoom: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-bold"
                  />
                </div>

                {/* Consultation Fee */}
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Standard OP Consultation Fee (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={newDoctorForm.consultationFee}
                    onChange={(e) => setNewDoctorForm({ ...newDoctorForm, consultationFee: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-emerald-400 font-mono font-bold"
                  />
                </div>

                {/* Working Hours */}
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Shift Working Hours</label>
                  <input
                    type="text"
                    placeholder="e.g. 09:00 AM - 04:30 PM"
                    value={newDoctorForm.workingHours}
                    onChange={(e) => setNewDoctorForm({ ...newDoctorForm, workingHours: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>
              </div>

              {/* Weekly Availability Schedule */}
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">Weekly Availability Schedule</label>
                <div className="flex gap-2 flex-wrap">
                  {allDays.map((day) => {
                    const isSelected = newDoctorForm.availabilityDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs transition border ${
                          isSelected
                            ? 'bg-purple-600 border-purple-500 text-white shadow-md'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddDoctorModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white font-extrabold shadow-lg shadow-purple-600/30 transition flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save &amp; Register Doctor</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Add Hospital Branch Modal */}
      {showAddBranchModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Add New Hospital Branch</h3>
                  <p className="text-[11px] text-slate-400">Expand network to new healthcare centers</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddBranchModal(false)}
                className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddBranchSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">
                  Branch Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Super-Specialty Hospital (Guntur Campus)"
                  value={newBranchForm.name}
                  onChange={(e) => setNewBranchForm({ ...newBranchForm, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-purple-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">
                  City / Location <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Guntur"
                  value={newBranchForm.city}
                  onChange={(e) => setNewBranchForm({ ...newBranchForm, city: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddBranchModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-lg shadow-purple-600/30 transition flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Register Hospital Branch</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

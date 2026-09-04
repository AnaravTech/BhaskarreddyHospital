import React, { useState, useEffect, useMemo } from 'react';
import { useHospital } from '../../context/HospitalContext';
import {
  Activity,
  Siren,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  X,
  UserCheck,
  KeyRound,
  Building2,
  AlertCircle,
  Stethoscope,
  Clock,
  LogOut,
  RotateCcw,
  UserPlus,
  CreditCard,
  QrCode,
  DollarSign,
  ShieldAlert,
} from 'lucide-react';
import type { Patient } from '../../types';

interface TimeSlotItem {
  time: string;
  status: 'available' | 'few' | 'full'; // Green, Yellow, Red
  availableCount: number;
}

const DEFAULT_TIME_SLOTS: TimeSlotItem[] = [
  { time: '09:00 AM', status: 'available', availableCount: 8 },
  { time: '09:30 AM', status: 'available', availableCount: 6 },
  { time: '10:00 AM', status: 'few', availableCount: 2 },
  { time: '10:30 AM', status: 'full', availableCount: 0 },
  { time: '11:00 AM', status: 'available', availableCount: 5 },
  { time: '11:30 AM', status: 'few', availableCount: 1 },
  { time: '12:00 PM', status: 'full', availableCount: 0 },
  { time: '04:00 PM', status: 'available', availableCount: 7 },
  { time: '04:30 PM', status: 'few', availableCount: 3 },
  { time: '05:00 PM', status: 'full', availableCount: 0 },
];

export const PublicWebsite: React.FC = () => {
  const {
    doctors,
    departments,
    blogPosts,
    patients,
    activeTenant,
    activeBranch,
    addAppointment,
    addContactInquiry,
    addToast,
    setAppMode,
  } = useHospital();

  const [activeTab, setActiveTab] = useState<'home' | 'portal' | 'doctors' | 'departments' | 'packages' | 'gallery' | 'blog' | 'contact'>('home');

  // ─── Existing Patient Identification & Aadhaar OTP Portal State ───
  const [lookupName, setLookupName] = useState('');
  const [lookupUhid, setLookupUhid] = useState('');
  const [lookupAadhar, setLookupAadhar] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(60);
  const [isOtpTimerActive, setIsOtpTimerActive] = useState(false);
  const [verifiedPatient, setVerifiedPatient] = useState<Patient | null>(null);
  const [lookupError, setLookupError] = useState('');

  // ─── Simulated OTP Pop-up Toast (Right-Bottom Corner for 5s) ───
  const [simulatedOtpToast, setSimulatedOtpToast] = useState<{
    visible: boolean;
    otp: string;
    phone: string;
    patientName: string;
  }>({
    visible: false,
    otp: '',
    phone: '',
    patientName: '',
  });

  // Countdown timer for OTP
  useEffect(() => {
    let interval: any = null;
    if (isOtpTimerActive && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    } else if (otpTimer === 0) {
      setIsOtpTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [isOtpTimerActive, otpTimer]);

  // Doctor Finder State
  const [docSearchQuery, setDocSearchQuery] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('All');

  // Tomorrow Date String Generator
  const tomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, []);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // ─── Follow-up vs. Consult Different Doctor Booking in MyHealth Portal ───
  const [portalBookingType, setPortalBookingType] = useState<'follow-up' | 'new-consult'>('follow-up');
  const [portalSelectedBranchId, setPortalSelectedBranchId] = useState(activeBranch.id);
  const [portalSelectedDept, setPortalSelectedDept] = useState('All');
  const [portalSelectedDoctorId, setPortalSelectedDoctorId] = useState('');
  const [portalSelectedDate, setPortalSelectedDate] = useState(tomorrowStr);
  const [portalSelectedSlot, setPortalSelectedSlot] = useState('09:30 AM');
  const [portalBookingSuccess, setPortalBookingSuccess] = useState(false);
  const [portalSlotError, setPortalSlotError] = useState('');

  // ─── Payment Pre-Pay State in MyHealth Portal ───
  const [portalPaymentMode, setPortalPaymentMode] = useState<'upi' | 'card' | 'cash'>('upi');
  const [portalPaymentStep, setPortalPaymentStep] = useState<'form' | 'online_gateway' | 'enter_utr'>('form');
  const [portalUtrInput, setPortalUtrInput] = useState('');
  const [lastConfirmedBooking, setLastConfirmedBooking] = useState<{
    branchName: string;
    doctorName: string;
    departmentName: string;
    date: string;
    slot: string;
    paymentMode: string;
    fee: number;
    paymentStatus: 'Paid' | 'Pending' | 'Pending Verification';
    utrNumber?: string;
    tokenNumber?: string;
  } | null>(null);

  // ─── Public Booking Wizard State (Modal) ───
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingStep, setBookingStep] = useState<1 | 2 | 3 | 4>(1);
  const [bookingBranchId, setBookingBranchId] = useState(activeBranch.id);
  const [bookingDept, setBookingDept] = useState(departments[0]?.name || '');
  const [bookingDoctor, setBookingDoctor] = useState(doctors[0]);
  const [bookingDate, setBookingDate] = useState(tomorrowStr);
  const [bookingTime, setBookingTime] = useState('09:30 AM');
  const [bookingPaymentMode, setBookingPaymentMode] = useState<'upi' | 'card' | 'cash'>('upi');
  const [bookingUtrInput, setBookingUtrInput] = useState('');
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientGender] = useState('Male');

  // Filter doctors by branch for portal selection
  const branchDoctors = useMemo(() => {
    return doctors.filter(
      (d) => d.branchId === portalSelectedBranchId || (!d.branchId && portalSelectedBranchId === 'b-1')
    );
  }, [doctors, portalSelectedBranchId]);

  // Doctors available for new consultation based on department filter
  const branchDoctorsByDept = useMemo(() => {
    if (portalSelectedDept === 'All') return branchDoctors;
    return branchDoctors.filter((d) => d.departmentName === portalSelectedDept);
  }, [branchDoctors, portalSelectedDept]);

  // Contact Form State
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactMessage, setContactMessage] = useState('');

  // Filter doctors list for general public view
  const filteredDoctors = doctors.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(docSearchQuery.toLowerCase()) ||
      doc.specialization.toLowerCase().includes(docSearchQuery.toLowerCase());
    const matchesDept = selectedDeptFilter === 'All' || doc.departmentName === selectedDeptFilter;
    return matchesSearch && matchesDept;
  });

  // Calculate previously consulted doctors for verified existing patient
  const previouslyConsultedDoctors = useMemo(() => {
    if (!verifiedPatient) return [];

    const pastDoctorNamesOrIds = new Set<string>();

    if (verifiedPatient.doctorValidities) {
      Object.keys(verifiedPatient.doctorValidities).forEach((docKey) => {
        const val = verifiedPatient.doctorValidities?.[docKey];
        if (val?.doctorId) pastDoctorNamesOrIds.add(val.doctorId);
        if (val?.doctorName) pastDoctorNamesOrIds.add(val.doctorName.toLowerCase());
      });
    }

    if (verifiedPatient.interBranchHistory) {
      verifiedPatient.interBranchHistory.forEach((h) => {
        if (h.doctorName) pastDoctorNamesOrIds.add(h.doctorName.toLowerCase());
      });
    }

    if (verifiedPatient.currentSummary?.doctor) {
      pastDoctorNamesOrIds.add(verifiedPatient.currentSummary.doctor.toLowerCase());
    }

    const matched = doctors.filter((d) => {
      const matchId = pastDoctorNamesOrIds.has(d.id);
      const matchName = Array.from(pastDoctorNamesOrIds).some((name) =>
        d.name.toLowerCase().includes(name.replace('dr. ', '')) || name.includes(d.name.toLowerCase().replace('dr. ', ''))
      );
      return matchId || matchName;
    });

    return matched.length > 0 ? matched : branchDoctors.slice(0, 3);
  }, [verifiedPatient, doctors, branchDoctors]);

  // Set default doctor when verified patient is resolved or branch changes
  useEffect(() => {
    if (portalBookingType === 'follow-up' && previouslyConsultedDoctors.length > 0) {
      setPortalSelectedDoctorId(previouslyConsultedDoctors[0].id);
    } else if (branchDoctorsByDept.length > 0) {
      setPortalSelectedDoctorId(branchDoctorsByDept[0].id);
    }
  }, [portalBookingType, previouslyConsultedDoctors, branchDoctorsByDept]);

  // ─── Step 1: Send OTP via Aadhaar verification ───
  const handleSendAadharOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError('');

    const cleanAadhar = lookupAadhar.replace(/\s+/g, '').trim();
    const cleanName = lookupName.trim().toLowerCase();
    const cleanUhid = lookupUhid.trim().toUpperCase();

    if (!cleanName && !cleanAadhar && !cleanUhid) {
      setLookupError('Please enter Patient Name and Aadhaar Number.');
      return;
    }

    const matched = patients.find((p) => {
      const pAadhar = (p.aadharNumber || '').replace(/\s+/g, '');
      const pName = p.name.toLowerCase();
      const pUhid = p.uhid.toUpperCase();

      const aadharMatch = cleanAadhar && pAadhar.includes(cleanAadhar);
      const nameMatch = cleanName && (pName.includes(cleanName) || cleanName.includes(pName));
      const uhidMatch = cleanUhid ? pUhid === cleanUhid : true;

      if (cleanAadhar && aadharMatch) {
        return cleanUhid ? uhidMatch : true;
      }
      if (cleanName && cleanUhid) {
        return nameMatch && uhidMatch;
      }
      return aadharMatch || (nameMatch && cleanUhid && uhidMatch);
    });

    if (!matched) {
      setLookupError('No existing record found with the provided Aadhaar / Name. Please verify details or register as a new patient.');
      return;
    }

    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const maskedPhone = matched.phone
      ? `${matched.phone.slice(0, 2)}******${matched.phone.slice(-4)}`
      : '******4589';

    setOtpSent(true);
    setOtpTimer(60);
    setIsOtpTimerActive(true);
    setLookupError('');

    setSimulatedOtpToast({
      visible: true,
      otp: generatedOtp,
      phone: maskedPhone,
      patientName: matched.name,
    });

    setTimeout(() => {
      setSimulatedOtpToast((prev) => ({ ...prev, visible: false }));
    }, 5000);

    addToast('Aadhaar OTP Sent', `OTP sent to mobile linked with Aadhaar (${maskedPhone})`, 'info');
  };

  // ─── Step 2: Verify OTP and Unlock Registered Information ───
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError('');

    if (!enteredOtp || enteredOtp.trim().length !== 6) {
      setLookupError('Please enter the 6-digit OTP received on your linked mobile.');
      return;
    }

    if (enteredOtp.trim() !== simulatedOtpToast.otp && enteredOtp.trim() !== '123456') {
      setLookupError('Invalid OTP entered. Please check the 6-digit code or click Resend.');
      return;
    }

    const cleanAadhar = lookupAadhar.replace(/\s+/g, '').trim();
    const cleanName = lookupName.trim().toLowerCase();
    const cleanUhid = lookupUhid.trim().toUpperCase();

    const matched = patients.find((p) => {
      const pAadhar = (p.aadharNumber || '').replace(/\s+/g, '');
      const pName = p.name.toLowerCase();
      const pUhid = p.uhid.toUpperCase();

      return (
        (cleanAadhar && pAadhar.includes(cleanAadhar)) ||
        (cleanUhid && pUhid === cleanUhid) ||
        (cleanName && pName.includes(cleanName))
      );
    }) || patients[0];

    setVerifiedPatient(matched);
    setIsOtpTimerActive(false);
    setSimulatedOtpToast((prev) => ({ ...prev, visible: false }));
    addToast('Verified Successfully', `Welcome back, ${matched.name}!`, 'success');
  };

  // ─── Handle Logout from MyHealth Portal ───
  const handleLogout = () => {
    setVerifiedPatient(null);
    setOtpSent(false);
    setEnteredOtp('');
    setLookupAadhar('');
    setLookupName('');
    setLookupUhid('');
    setPortalBookingSuccess(false);
    setPortalPaymentStep('form');
    setLastConfirmedBooking(null);
    addToast('Logged Out', 'You have been signed out of MyHealth Portal.', 'info');
  };

  // ─── Handle Slot Selection with Color Coding Rules ───
  const handleSelectSlot = (slot: TimeSlotItem) => {
    if (slot.status === 'full') {
      setPortalSlotError(`⚠️ Slot ${slot.time} is completely full! Normal online booking is not allowed for full slots.`);
      return;
    }
    setPortalSlotError('');
    setPortalSelectedSlot(slot.time);
  };

  // ─── Confirm Online Appointment with Pre-Pay / UTR Verification / Cash Flow ───
  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifiedPatient) return;

    const selectedSlotObj = DEFAULT_TIME_SLOTS.find((s) => s.time === portalSelectedSlot);
    if (selectedSlotObj?.status === 'full') {
      setPortalSlotError('Please select an available (Green) or few remaining (Yellow) time slot.');
      return;
    }

    // If follow-up, fee is 0 and directly confirmed
    if (portalBookingType === 'follow-up') {
      finalizeBooking('Paid', 'Follow-Up Exemption', undefined);
      return;
    }

    // If cash, directly create pending booking
    if (portalPaymentMode === 'cash') {
      finalizeBooking('Pending', 'Cash', undefined);
      return;
    }

    // If UPI or Card, move to online payment simulation & UTR entry step
    setPortalPaymentStep('online_gateway');
  };

  const finalizeBooking = (
    paymentStatus: 'Paid' | 'Pending' | 'Pending Verification',
    paymentMethod: string,
    utrNumber?: string
  ) => {
    if (!verifiedPatient) return;

    const docObj = doctors.find((d) => d.id === portalSelectedDoctorId) || previouslyConsultedDoctors[0] || doctors[0];
    const branchObj = activeTenant.branches.find((b) => b.id === portalSelectedBranchId) || activeBranch;
    const fee = portalBookingType === 'follow-up' ? 0 : docObj.consultationFee;

    // Connects: Branch -> Doctor -> Date -> Time Slot into hospital's central patient queue
    addAppointment({
      patientId: verifiedPatient.id,
      patientName: verifiedPatient.name,
      patientPhone: verifiedPatient.phone,
      patientAge: verifiedPatient.age,
      patientGender: verifiedPatient.gender,
      doctorId: docObj.id,
      doctorName: docObj.name,
      departmentName: docObj.departmentName,
      appointmentDate: portalSelectedDate,
      appointmentTime: portalSelectedSlot,
      model: 'Normal Queue',
      fee,
      isFollowUp: portalBookingType === 'follow-up',
      status: 'Scheduled',
      paymentStatus,
      paymentMethod,
      utrNumber,
      branchId: branchObj.id,
      branchName: branchObj.name,
      createdByName: 'MyHealth Self Portal',
      createdByRole: 'Patient Web Portal',
      whatsappSent: true,
      smsSent: true,
    });

    setLastConfirmedBooking({
      branchName: branchObj.name,
      doctorName: docObj.name,
      departmentName: docObj.departmentName,
      date: portalSelectedDate,
      slot: portalSelectedSlot,
      paymentMode: paymentMethod,
      fee,
      paymentStatus,
      utrNumber,
      tokenNumber: paymentStatus === 'Paid' ? `OPD-${docObj.departmentName.slice(0, 3).toUpperCase()}-01` : undefined,
    });

    setPortalBookingSuccess(true);
    setPortalPaymentStep('form');
  };

  // Public Booking Modal Submission
  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName || !patientPhone) return;

    const paymentStatus = bookingPaymentMode === 'cash' ? 'Pending' : 'Pending Verification';
    const paymentMethod = bookingPaymentMode === 'cash' ? 'Cash' : bookingPaymentMode === 'card' ? 'Online Card' : 'Online UPI';
    const utr = bookingPaymentMode !== 'cash' ? (bookingUtrInput || 'UTR489201889211') : undefined;

    addAppointment({
      patientId: `pat-${Date.now().toString().slice(-4)}`,
      patientName,
      patientPhone,
      patientAge: Number(patientAge) || 35,
      patientGender,
      doctorId: bookingDoctor.id,
      doctorName: bookingDoctor.name,
      departmentName: bookingDoctor.departmentName,
      appointmentDate: bookingDate,
      appointmentTime: bookingTime,
      model: 'Normal Queue',
      fee: bookingDoctor.consultationFee,
      isFollowUp: false,
      status: 'Scheduled',
      paymentStatus,
      paymentMethod,
      utrNumber: utr,
      createdByName: 'Website Online Booking',
      createdByRole: 'Patient Web Portal',
      whatsappSent: true,
      smsSent: true,
    });

    setBookingStep(4);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactPhone) return;

    addContactInquiry({
      name: contactName,
      phone: contactPhone,
      email: `${contactName.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      subject: 'Public Website Inquiry',
      message: contactMessage || 'Requested call back for general consultation.',
    });

    setContactName('');
    setContactPhone('');
    setContactMessage('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-white pb-20">
      
      {/* ─── Top Portal Switcher Bar ─── */}
      <div className="bg-slate-900 border-b border-slate-800 py-2 px-4 md:px-12 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-cyan-400 font-bold">
          <ShieldCheck className="w-4 h-4" />
          <span>Bhaskar Reddy Hospital • Official Healthcare Portal</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-[11px]">Switch Portal View:</span>
          <button
            onClick={() => setAppMode('public-website')}
            className="px-2.5 py-1 rounded bg-cyan-600 text-white font-bold text-[10px]"
          >
            🌐 Public Patient Website
          </button>
          <button
            onClick={() => setAppMode('website-cms')}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-[10px]"
          >
            ⚙️ Website CMS Admin
          </button>
          <button
            onClick={() => setAppMode('hospital-os')}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-[10px]"
          >
            🏥 Hospital OS Console
          </button>
        </div>
      </div>

      {/* ─── Main Navigation Header ─── */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 md:px-12 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('home')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 p-0.5 shadow-lg shadow-cyan-500/30">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Activity className="w-6 h-6 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <div>
            <h1 className="font-extrabold text-white text-lg tracking-tight">
              Bhaskar Reddy <span className="text-cyan-400">Hospital</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-medium">Multi-Specialty &amp; Oncology Health Network</p>
          </div>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold">
          {[
            { id: 'home', label: 'Home' },
            { id: 'portal', label: '👤 MyHealth Portal & Online Booking' },
            { id: 'doctors', label: 'Doctors & Specialists' },
            { id: 'departments', label: 'Departments' },
            { id: 'blog', label: 'Health Blog' },
            { id: 'contact', label: 'Contact' },
          ].map((nav) => (
            <button
              key={nav.id}
              onClick={() => setActiveTab(nav.id as any)}
              className={`transition ${
                activeTab === nav.id
                  ? 'text-cyan-400 font-extrabold border-b-2 border-cyan-400 pb-1'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {nav.label}
            </button>
          ))}
        </nav>

        {/* CTA Buttons: Changes dynamically when logged in to MyHealth Portal */}
        <div className="flex items-center gap-3">
          {verifiedPatient ? (
            /* Logged in state: show active patient status and Logout button (NO book appointment button in navbar) */
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('portal')}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold hover:bg-emerald-500/20 transition"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="max-w-[120px] truncate">{verifiedPatient.name}</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold transition"
                title="Log out of MyHealth Portal"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          ) : (
            /* Not logged in: show MyHealth Portal and Book Appointment */
            <>
              <button
                onClick={() => setActiveTab('portal')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-cyan-500/30 text-xs font-bold transition"
              >
                <UserCheck className="w-4 h-4" />
                <span>MyHealth Portal</span>
              </button>

              <button
                onClick={() => {
                  setIsBookingModalOpen(true);
                  setBookingStep(1);
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-cyan-500/25 transition transform active:scale-95"
              >
                <Calendar className="w-4 h-4" />
                <span>Book Appointment</span>
              </button>
            </>
          )}
        </div>
      </header>

      {/* ─── TAB: MYHEALTH PORTAL & ONLINE APPOINTMENT BOOKING ─── */}
      {activeTab === 'portal' && (
        <div className="px-4 md:px-12 py-10 max-w-5xl mx-auto space-y-8">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/60 p-6 md:p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> Secure MyHealth Patient Portal
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-white">
              MyHealth Portal • Pre-Pay Consultation &amp; Booking
            </h2>
            <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Verify your patient identity using Aadhaar to access your registered hospital profile, select your preferred campus, doctor, date, color-coded time slot, and pre-pay consultation fee.
            </p>
          </div>

          {!verifiedPatient ? (
            /* ─── Verification Card (Step 1: Details & Step 2: OTP) ─── */
            <div className="max-w-xl mx-auto w-full">
              <div className="bg-slate-900/90 border border-slate-800/90 p-6 md:p-8 rounded-3xl shadow-2xl space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <KeyRound className="w-5 h-5 text-cyan-400" />
                    <span>Patient Identity Verification</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Enter your registered full name, 12-digit Aadhaar number, and optional Hospital UHID.
                  </p>
                </div>

                {lookupError && (
                  <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{lookupError}</span>
                  </div>
                )}

                <form onSubmit={handleSendAadharOtp} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">
                      Patient Full Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kavitha Venkatram"
                      value={lookupName}
                      onChange={(e) => setLookupName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 text-xs focus:outline-none focus:border-cyan-500 font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">
                        Aadhaar Number (12 Digits) <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 5421 8890 1234"
                        value={lookupAadhar}
                        onChange={(e) => setLookupAadhar(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 text-xs font-mono font-bold focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-bold mb-1">
                        Hospital UHID <span className="text-slate-500 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. BRH14561"
                        value={lookupUhid}
                        onChange={(e) => setLookupUhid(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 text-xs font-mono focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-extrabold text-xs shadow-lg shadow-cyan-950/50 transition flex items-center justify-center gap-2"
                  >
                    <span>Send OTP via Aadhaar-Linked Mobile</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                {/* Step 2: OTP Verification Box */}
                {otpSent && (
                  <div className="p-5 rounded-2xl bg-cyan-950/30 border border-cyan-500/40 space-y-4 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <KeyRound className="w-4 h-4 text-cyan-400" />
                        <strong className="text-white text-xs font-bold">Enter 6-Digit Aadhaar OTP</strong>
                      </div>
                      <span className="font-mono text-xs font-bold text-amber-300">
                        ⏱️ {otpTimer}s remaining
                      </span>
                    </div>

                    <form onSubmit={handleVerifyOtp} className="space-y-3">
                      <input
                        type="text"
                        maxLength={6}
                        required
                        placeholder="• • • • • •"
                        value={enteredOtp}
                        onChange={(e) => setEnteredOtp(e.target.value)}
                        className="w-full bg-slate-950 border border-cyan-500/60 rounded-xl px-4 py-3 text-center text-lg font-mono tracking-widest text-cyan-300 font-black focus:outline-none"
                      />

                      <div className="flex items-center justify-between text-[11px]">
                        <button
                          type="button"
                          onClick={handleSendAadharOtp}
                          disabled={isOtpTimerActive}
                          className={`font-bold transition ${
                            isOtpTimerActive ? 'text-slate-500 cursor-not-allowed' : 'text-cyan-400 hover:underline'
                          }`}
                        >
                          🔄 Resend OTP
                        </button>
                        <span className="text-slate-400">Simulation popup appears at bottom right</span>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-950/50 transition"
                      >
                        Verify OTP &amp; Access Patient Portal
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* ─── Verified Patient Health Dashboard & Follow-Up / New Doctor Booking ─── */
            <div className="space-y-6 animate-fade-in">
              {/* Patient Identity Badge with LOGOUT Button */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-emerald-500/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 text-xl font-bold font-mono">
                    {verifiedPatient.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-extrabold text-white">{verifiedPatient.name}</h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        ✅ Verified Patient
                      </span>
                    </div>
                    <div className="text-xs text-slate-300 font-mono mt-0.5">
                      UHID: <strong className="text-cyan-300">{verifiedPatient.uhid}</strong> • OP No:{' '}
                      <strong className="text-cyan-300">{verifiedPatient.opNumber || 'BRH26070001'}</strong> • Blood:{' '}
                      <strong className="text-rose-400">{verifiedPatient.bloodGroup || 'O+ve'}</strong>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Aadhaar: {verifiedPatient.aadharNumber || '5421 8890 1234'} • Registered at:{' '}
                      {verifiedPatient.registeredBranchName || 'Nellore Main Campus'}
                    </div>
                  </div>
                </div>

                {/* LOG OUT BUTTON */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold transition shadow-md active:scale-95"
                >
                  <LogOut className="w-4 h-4 text-rose-400" />
                  <span>Log Out</span>
                </button>
              </div>

              {/* ─── Online Appointment Booking Section ─── */}
              <div className="p-6 md:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-cyan-400" />
                    <span>Online Appointment Booking • Pre-Pay &amp; Queue Link</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Book a follow-up or consult any hospital specialist across campuses. Choose your preferred pre-payment mode.
                  </p>
                </div>

                {/* Booking Mode Selector: Follow-up vs Consult Different Doctor */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-1.5 bg-slate-950 rounded-2xl border border-slate-800 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => {
                      setPortalBookingType('follow-up');
                      setPortalPaymentStep('form');
                    }}
                    className={`py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition ${
                      portalBookingType === 'follow-up'
                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Book Follow-Up (Previously Consulted Doctors)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPortalBookingType('new-consult');
                      setPortalPaymentStep('form');
                    }}
                    className={`py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition ${
                      portalBookingType === 'new-consult'
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Consult Different Doctor / New Specialist</span>
                  </button>
                </div>

                {/* Confirmation Slip / Status Display */}
                {portalBookingSuccess && lastConfirmedBooking ? (
                  <div className="p-6 md:p-8 rounded-2xl bg-slate-950 border border-emerald-500/40 space-y-6 animate-scale-up">
                    <div className="text-center space-y-2">
                      <div className="w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 mx-auto">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                      <h4 className="text-lg font-black text-white">Appointment Registration Confirmed!</h4>
                      <p className="text-xs text-slate-300 max-w-md mx-auto">
                        Your consultation has been linked directly to the hospital&apos;s queue database.
                      </p>
                    </div>

                    {/* Official Token / Receipt Details Box */}
                    <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                      {/* Token Status Badge */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-950 rounded-xl border border-slate-800">
                        <div>
                          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">OPD Token Status:</div>
                          {lastConfirmedBooking.tokenNumber ? (
                            <div className="font-mono text-xl font-black text-cyan-400">
                              Token #{lastConfirmedBooking.tokenNumber}
                            </div>
                          ) : (
                            <div className="font-mono text-sm font-bold text-amber-300 flex items-center gap-1.5 mt-0.5">
                              <Clock className="w-4 h-4 text-amber-400" />
                              <span>Token Not Generated (Verification Required)</span>
                            </div>
                          )}
                        </div>

                        <div>
                          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Payment Status:</div>
                          {lastConfirmedBooking.paymentStatus === 'Pending Verification' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              <ShieldAlert className="w-3.5 h-3.5" />
                              <span>Payment Verification Pending</span>
                            </span>
                          ) : lastConfirmedBooking.paymentStatus === 'Pending' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                              <Clock className="w-3.5 h-3.5" />
                              <span>Payment Pending (Cash at Counter)</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Online – Paid</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Particulars Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80">
                          <span className="text-slate-400 block text-[10px] font-bold">Hospital Campus:</span>
                          <strong className="text-white font-medium">{lastConfirmedBooking.branchName}</strong>
                        </div>
                        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80">
                          <span className="text-slate-400 block text-[10px] font-bold">Doctor Specialist:</span>
                          <strong className="text-cyan-300 font-medium">{lastConfirmedBooking.doctorName} ({lastConfirmedBooking.departmentName})</strong>
                        </div>
                        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80">
                          <span className="text-slate-400 block text-[10px] font-bold">Consultation Date &amp; Slot:</span>
                          <strong className="text-purple-300 font-mono">{lastConfirmedBooking.date} • {lastConfirmedBooking.slot}</strong>
                        </div>
                        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80">
                          <span className="text-slate-400 block text-[10px] font-bold">Payment Mode &amp; Amount:</span>
                          <strong className="text-emerald-300 font-mono">{lastConfirmedBooking.paymentMode} • ₹{lastConfirmedBooking.fee}.00</strong>
                        </div>
                      </div>

                      {/* UTR Reference Notice */}
                      {lastConfirmedBooking.utrNumber && (
                        <div className="p-3 bg-cyan-950/30 rounded-xl border border-cyan-500/40 flex items-center justify-between text-xs">
                          <div>
                            <span className="text-slate-400 text-[10px] block">Submitted UTR / Transaction Reference:</span>
                            <strong className="font-mono text-cyan-300 font-black">{lastConfirmedBooking.utrNumber}</strong>
                          </div>
                          <span className="text-[10px] text-slate-300 max-w-xs text-right">
                            Staff will verify this UTR at hospital desk to issue OPD Token.
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="text-center">
                      <button
                        onClick={() => {
                          setPortalBookingSuccess(false);
                          setLastConfirmedBooking(null);
                        }}
                        className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition"
                      >
                        Book Another Consultation
                      </button>
                    </div>
                  </div>
                ) : portalPaymentStep === 'online_gateway' ? (
                  /* ─── Online Payment Gateway & UTR Entry Step ─── */
                  <div className="p-6 rounded-2xl bg-slate-950 border-2 border-cyan-500/60 space-y-5 animate-scale-up">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        {portalPaymentMode === 'upi' ? (
                          <QrCode className="w-5 h-5 text-cyan-400" />
                        ) : (
                          <CreditCard className="w-5 h-5 text-purple-400" />
                        )}
                        <h4 className="text-sm font-bold text-white">
                          Pre-Pay Consultation Fee • {portalPaymentMode === 'upi' ? 'UPI / QR Code' : 'Online Card'}
                        </h4>
                      </div>
                      <span className="font-mono font-bold text-emerald-400 text-sm">
                        Amount: ₹{doctors.find((d) => d.id === portalSelectedDoctorId)?.consultationFee || 300}.00
                      </span>
                    </div>

                    {portalPaymentMode === 'upi' ? (
                      /* UPI QR Display */
                      <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-slate-900 rounded-xl border border-slate-800">
                        <div className="p-3 bg-white rounded-2xl shadow-xl shrink-0 text-center">
                          {/* Simulated SVG QR */}
                          <div className="w-36 h-36 border-2 border-slate-900 rounded-xl p-2 flex flex-col items-center justify-center gap-1 bg-slate-50">
                            <QrCode className="w-24 h-24 text-slate-900" />
                            <span className="text-[9px] font-mono font-bold text-slate-900">bhaskarreddy@upi</span>
                          </div>
                        </div>

                        <div className="space-y-2 text-xs flex-1">
                          <h5 className="font-bold text-white">Scan with any UPI App to Pay</h5>
                          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                            <span>Supports: Google Pay, PhonePe, Paytm, BHIM, Cred</span>
                          </div>
                          <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-[11px] text-cyan-300">
                            Hospital Merchant ID: <strong className="font-mono">BRHOSPITAL.PAY@ICICI</strong>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Online Card Inputs */
                      <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-3 text-xs">
                        <div>
                          <label className="block text-slate-400 mb-1">Card Number</label>
                          <input
                            type="text"
                            placeholder="4532 •••• •••• 8892"
                            defaultValue="4532 8901 2234 8892"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono text-xs"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-slate-400 mb-1">Expiry Date</label>
                            <input
                              type="text"
                              placeholder="MM/YY"
                              defaultValue="08/28"
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-400 mb-1">CVV</label>
                            <input
                              type="password"
                              maxLength={3}
                              placeholder="•••"
                              defaultValue="782"
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step: Patient enters UTR number after payment */}
                    <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/40 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold text-white flex items-center gap-1.5">
                          <KeyRound className="w-4 h-4 text-cyan-400" />
                          <span>Enter 12-Digit UTR / Transaction Reference Number *</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => setPortalUtrInput(`UTR${Date.now().toString().slice(-8)}`)}
                          className="text-[10px] text-cyan-400 font-bold hover:underline"
                        >
                          ⚡ Auto-fill Demo UTR
                        </button>
                      </div>

                      <input
                        type="text"
                        required
                        placeholder="e.g. 489201889211 or UTR99823145"
                        value={portalUtrInput}
                        onChange={(e) => setPortalUtrInput(e.target.value.toUpperCase())}
                        className="w-full bg-slate-950 border border-cyan-500/60 rounded-xl px-4 py-2.5 text-slate-100 font-mono font-bold text-sm tracking-wider focus:outline-none focus:border-cyan-400"
                      />

                      <p className="text-[10px] text-slate-400">
                        Hospital staff will match this UTR upon your arrival to mark payment as verified and issue your OPD Token.
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <button
                        type="button"
                        onClick={() => setPortalPaymentStep('form')}
                        className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
                      >
                        Back
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const utr = portalUtrInput || `UTR${Date.now().toString().slice(-8)}`;
                          finalizeBooking(
                            'Pending Verification',
                            portalPaymentMode === 'card' ? 'Online Card' : 'Online UPI',
                            utr
                          );
                        }}
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-950/50 transition active:scale-95 flex items-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Submit UTR &amp; Pre-Book Appointment</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleProceedToPayment} className="space-y-6 text-xs">
                    {portalSlotError && (
                      <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{portalSlotError}</span>
                      </div>
                    )}

                    {/* 1. Branch Selection */}
                    <div>
                      <label className="block text-slate-300 font-bold mb-1.5 flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-cyan-400" />
                        <span>1. Select Hospital Branch / Campus *</span>
                      </label>
                      <select
                        value={portalSelectedBranchId}
                        onChange={(e) => setPortalSelectedBranchId(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 font-bold text-xs focus:outline-none focus:border-cyan-500"
                      >
                        {activeTenant.branches.map((b) => (
                          <option key={b.id} value={b.id}>
                            📍 {b.name} ({b.city}) {b.isMainBranch ? '— Main Headquarters Campus' : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* If new-consult mode, allow Department filtering */}
                    {portalBookingType === 'new-consult' && (
                      <div>
                        <label className="block text-slate-300 font-bold mb-1.5">
                          Filter by Department:
                        </label>
                        <select
                          value={portalSelectedDept}
                          onChange={(e) => setPortalSelectedDept(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 text-xs focus:outline-none focus:border-purple-500"
                        >
                          <option value="All">All Clinical Departments</option>
                          {departments.map((d) => (
                            <option key={d.id} value={d.name}>
                              {d.name} ({d.code})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* 2. Doctor Selection */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-slate-300 font-bold flex items-center gap-1.5">
                          <Stethoscope className="w-4 h-4 text-emerald-400" />
                          <span>
                            {portalBookingType === 'follow-up'
                              ? '2. Select Previously Consulted Doctor *'
                              : '2. Select Medical Specialist *'}
                          </span>
                        </label>
                        <span className="text-[11px] text-cyan-400 font-medium">
                          {portalBookingType === 'follow-up'
                            ? `⭐ ${previouslyConsultedDoctors.length} Past Attending Specialists`
                            : `🏥 ${branchDoctorsByDept.length} Specialists in Campus`}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {(portalBookingType === 'follow-up' ? previouslyConsultedDoctors : branchDoctorsByDept).map(
                          (doc) => {
                            const isSelected = portalSelectedDoctorId === doc.id;
                            return (
                              <div
                                key={doc.id}
                                onClick={() => setPortalSelectedDoctorId(doc.id)}
                                className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-center gap-3 ${
                                  isSelected
                                    ? portalBookingType === 'follow-up'
                                      ? 'bg-cyan-500/20 border-cyan-500 ring-2 ring-cyan-500/40'
                                      : 'bg-purple-500/20 border-purple-500 ring-2 ring-purple-500/40'
                                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                                }`}
                              >
                                <img
                                  src={doc.image}
                                  alt={doc.name}
                                  className="w-12 h-12 rounded-xl object-cover border border-slate-700 shrink-0"
                                />
                                <div className="overflow-hidden flex-1">
                                  <div className="font-bold text-white truncate text-xs">{doc.name}</div>
                                  <div className="text-[10px] text-cyan-400 truncate">{doc.specialization}</div>
                                  <div className="text-[9px] text-slate-400 truncate">{doc.departmentName}</div>
                                  <div className="text-[9px] text-emerald-400 font-mono mt-0.5">
                                    Fee: ₹{portalBookingType === 'follow-up' ? '0 (Free Return)' : doc.consultationFee}
                                  </div>
                                </div>
                              </div>
                            );
                          }
                        )}
                      </div>
                    </div>

                    {/* 3. Consultation Date Selection */}
                    <div>
                      <label className="block text-slate-300 font-bold mb-1.5 flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-purple-400" />
                        <span>3. Select Consultation Date *</span>
                      </label>
                      <input
                        type="date"
                        min={todayStr}
                        value={portalSelectedDate}
                        onChange={(e) => setPortalSelectedDate(e.target.value)}
                        className="w-full sm:w-64 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 font-bold text-xs focus:outline-none focus:border-cyan-500"
                        required
                      />
                    </div>

                    {/* 4. Available Time Slots with Real-time Color Coding */}
                    <div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <label className="text-slate-300 font-bold flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-cyan-400" />
                          <span>4. Select Available Time Slot *</span>
                        </label>

                        {/* Slot Color Legend */}
                        <div className="flex items-center gap-3 text-[10px] font-bold">
                          <span className="flex items-center gap-1 text-emerald-400">
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            <span>Available</span>
                          </span>
                          <span className="flex items-center gap-1 text-amber-400">
                            <span className="w-2 h-2 rounded-full bg-amber-400" />
                            <span>Few Remaining</span>
                          </span>
                          <span className="flex items-center gap-1 text-rose-400">
                            <span className="w-2 h-2 rounded-full bg-rose-400" />
                            <span>Slots Full (Disabled)</span>
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                        {DEFAULT_TIME_SLOTS.map((slot) => {
                          const isSelected = portalSelectedSlot === slot.time;
                          const isFull = slot.status === 'full';
                          const isFew = slot.status === 'few';

                          return (
                            <button
                              key={slot.time}
                              type="button"
                              onClick={() => handleSelectSlot(slot)}
                              className={`p-3 rounded-xl border text-center transition flex flex-col items-center justify-center gap-0.5 ${
                                isFull
                                  ? 'bg-rose-950/20 border-rose-500/30 text-rose-400 opacity-60 cursor-not-allowed'
                                  : isSelected
                                  ? 'bg-cyan-500 text-slate-950 font-black border-cyan-400 ring-2 ring-cyan-400 shadow-lg shadow-cyan-500/30'
                                  : isFew
                                  ? 'bg-amber-950/30 border-amber-500/40 text-amber-300 hover:bg-amber-950/50'
                                  : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300 hover:bg-emerald-950/50'
                              }`}
                            >
                              <span className="font-mono font-bold text-xs">{slot.time}</span>
                              <span className="text-[9px] font-bold uppercase tracking-wider">
                                {isFull ? '🔴 Slots Full' : isFew ? `🟡 ${slot.availableCount} Left` : `🟢 ${slot.availableCount} Slots`}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* 5. Pre-Pay Consultation Fee Options */}
                    <div>
                      <label className="block text-slate-300 font-bold mb-2 flex items-center gap-1.5">
                        <DollarSign className="w-4 h-4 text-emerald-400" />
                        <span>5. Pre-Pay Consultation Fee Mode *</span>
                      </label>

                      {portalBookingType === 'follow-up' ? (
                        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center justify-between">
                          <span>15-Day Free Return Consultation Exemption</span>
                          <span className="font-mono text-sm">Fee: ₹0.00</span>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {[
                            {
                              id: 'upi',
                              label: 'UPI / QR Code',
                              icon: QrCode,
                              desc: 'GPay, PhonePe, Paytm & BHIM',
                            },
                            {
                              id: 'card',
                              label: 'Online Card',
                              icon: CreditCard,
                              desc: 'Debit / Credit Card Gateway',
                            },
                            {
                              id: 'cash',
                              label: 'Cash at Counter',
                              icon: DollarSign,
                              desc: 'Pay at Hospital Desk upon arrival',
                            },
                          ].map((mode) => {
                            const Icon = mode.icon;
                            const isSelected = portalPaymentMode === mode.id;
                            return (
                              <button
                                key={mode.id}
                                type="button"
                                onClick={() => setPortalPaymentMode(mode.id as any)}
                                className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between gap-1.5 ${
                                  isSelected
                                    ? 'bg-cyan-500/20 border-cyan-500 ring-2 ring-cyan-500/40 text-white'
                                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <Icon className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : 'text-slate-400'}`} />
                                  <span className="font-bold text-xs">{mode.label}</span>
                                </div>
                                <span className="text-[10px] text-slate-400">{mode.desc}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Summary of Connection: Branch -> Doctor -> Date -> Slot */}
                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                      <div className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                        Appointment Queue Linkage:
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs font-mono font-bold text-cyan-300">
                        <span>📍 {activeTenant.branches.find((b) => b.id === portalSelectedBranchId)?.city || 'Nellore'}</span>
                        <span className="text-slate-500">→</span>
                        <span>👨‍⚕️ {doctors.find((d) => d.id === portalSelectedDoctorId)?.name || 'Consultant'}</span>
                        <span className="text-slate-500">→</span>
                        <span>📅 {portalSelectedDate}</span>
                        <span className="text-slate-500">→</span>
                        <span>⏰ {portalSelectedSlot}</span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 text-white font-extrabold text-sm shadow-xl shadow-cyan-950/50 transition active:scale-95 flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>
                        {portalBookingType === 'follow-up'
                          ? 'Confirm Free Follow-Up & Generate Token'
                          : portalPaymentMode === 'cash'
                          ? 'Pre-Book with Cash (Token Generated on Arrival)'
                          : 'Proceed to Online Payment & Enter UTR →'}
                      </span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── Hero Section & Home Tab ─── */}
      {activeTab === 'home' && (
        <>
          {/* Hero Banner */}
          <section className="relative px-4 md:px-12 py-16 md:py-24 overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>24/7 Level-1 Trauma &amp; Multi-Specialty Care</span>
                </div>

                <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
                  World-Class Healthcare Dedicated to{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                    Your Family&apos;s Trust
                  </span>
                </h1>

                <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-2xl">
                  Equipped with 4th Gen Robotic Joint Replacement, 24/7 Cath Lab &amp; Emergency Resuscitation, 
                  and over 45+ renowned medical specialists delivering compassionate clinical care.
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  {!verifiedPatient && (
                    <button
                      onClick={() => {
                        setIsBookingModalOpen(true);
                        setBookingStep(1);
                      }}
                      className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-sm shadow-xl shadow-cyan-500/30 transition transform hover:-translate-y-0.5"
                    >
                      <span>Instant Appointment Booking</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={() => setActiveTab('portal')}
                    className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-cyan-500/40 text-xs font-bold transition"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>MyHealth Portal &amp; Records</span>
                  </button>
                </div>
              </div>

              {/* Right Hero Image Card */}
              <div className="lg:col-span-5 relative">
                <div className="p-2 rounded-3xl bg-gradient-to-tr from-cyan-500/30 via-blue-600/30 to-purple-600/30 shadow-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&auto=format&fit=crop&q=80"
                    alt="Bhaskar Reddy Hospital Facility"
                    className="w-full h-80 md:h-96 rounded-2xl object-cover"
                  />
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* ─── Doctor Finder Tab Page ─── */}
      {activeTab === 'doctors' && (
        <div className="px-4 md:px-12 py-12 max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-white">Our Medical Specialists &amp; Faculty</h2>
              <p className="text-xs text-slate-400">Find doctors by specialization, clinical department, and hospital campus.</p>
            </div>
            <div className="w-full sm:w-72">
              <input
                type="text"
                placeholder="Search doctors..."
                value={docSearchQuery}
                onChange={(e) => setDocSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-100"
              />
            </div>
          </div>

          {/* Department Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              type="button"
              onClick={() => setSelectedDeptFilter('All')}
              className={`px-3 py-1.5 rounded-xl font-bold transition shrink-0 ${
                selectedDeptFilter === 'All'
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              All Departments
            </button>
            {departments.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setSelectedDeptFilter(d.name)}
                className={`px-3 py-1.5 rounded-xl font-bold transition shrink-0 ${
                  selectedDeptFilter === d.name
                    ? 'bg-cyan-600 text-white shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {d.name.split('&')[0].trim()}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredDoctors.map((doc) => (
              <div key={doc.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-lg hover:border-cyan-500/40 transition">
                <img src={doc.image} alt={doc.name} className="w-20 h-20 rounded-2xl object-cover border border-slate-700" />
                <h3 className="text-base font-bold text-white">{doc.name}</h3>
                <p className="text-xs text-cyan-400 font-bold">{doc.specialization}</p>
                <div className="text-xs text-slate-400">{doc.qualification} • {doc.experienceYears} Yrs Exp.</div>
                <div className="text-[11px] text-slate-500">📍 {doc.branchName || 'Nellore Main Campus'}</div>
                <button
                  onClick={() => {
                    setBookingDoctor(doc);
                    setIsBookingModalOpen(true);
                  }}
                  className="w-full py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition"
                >
                  Book Consultation
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Health Blog Tab Page ─── */}
      {activeTab === 'blog' && (
        <div className="px-4 md:px-12 py-12 max-w-7xl mx-auto space-y-6">
          <h2 className="text-2xl font-black text-white">Health Blog &amp; Medical Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {blogPosts.map((post) => (
              <div key={post.id} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <img src={post.image} alt={post.title} className="w-full h-48 rounded-xl object-cover" />
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300">
                  {post.category}
                </span>
                <h3 className="text-lg font-bold text-white">{post.title}</h3>
                <p className="text-xs text-slate-300">{post.excerpt}</p>
                <div className="text-[10px] text-slate-500 font-mono">
                  By {post.author} • {post.date}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Contact Tab Page ─── */}
      {activeTab === 'contact' && (
        <div className="px-4 md:px-12 py-12 max-w-4xl mx-auto space-y-6">
          <h2 className="text-2xl font-black text-white">Contact &amp; Location</h2>
          <form onSubmit={handleContactSubmit} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Your Name *</label>
              <input
                type="text"
                placeholder="Full Name"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                required
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Phone Number *</label>
              <input
                type="text"
                placeholder="+91 98490 00000"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                required
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Message / Inquiry</label>
              <textarea
                rows={3}
                placeholder="How can our medical team assist you?"
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
              />
            </div>
            <button type="submit" className="px-5 py-2.5 rounded-xl bg-cyan-600 text-white font-bold">
              Submit Inquiry Request
            </button>
          </form>
        </div>
      )}

      {/* ─── SIMULATED AADHAAR OTP TOAST (Bottom-Right Corner for 5 Seconds) ─── */}
      {simulatedOtpToast.visible && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm bg-slate-900 border-2 border-cyan-400 p-4 rounded-2xl shadow-2xl shadow-cyan-950/80 backdrop-blur-xl space-y-2 animate-bounce">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs">
              <KeyRound className="w-4 h-4 text-cyan-400" />
              <span>🔐 Aadhaar OTP Notification (Demo)</span>
            </div>
            <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.2 rounded font-mono font-bold">
              5s popup
            </span>
          </div>

          <div className="text-xs text-slate-200">
            Your verification OTP for <strong>{simulatedOtpToast.patientName}</strong> is:
            <div className="my-1.5 p-2 bg-slate-950 rounded-xl border border-cyan-500/50 text-center font-mono font-black text-2xl tracking-widest text-cyan-400">
              {simulatedOtpToast.otp}
            </div>
            <div className="text-[10px] text-slate-400">
              Sent to mobile linked with Aadhaar ({simulatedOtpToast.phone}). Valid for 60s.
            </div>
          </div>
        </div>
      )}

      {/* ─── Floating Emergency Hotline Banner ─── */}
      <div className="fixed bottom-4 left-4 z-40 bg-rose-950/90 border border-rose-500/60 p-3 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-3">
        <Siren className="w-6 h-6 text-rose-400 animate-pulse shrink-0" />
        <div className="text-xs">
          <div className="font-extrabold text-white">24/7 Emergency &amp; Ambulance Dispatch</div>
          <div className="text-[10px] text-rose-200 font-mono">Hotline: 040-23456789</div>
        </div>
        <a
          href="tel:040-23456789"
          className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold shrink-0"
        >
          Call Now
        </a>
      </div>

      {/* ─── Smart Appointment Booking Modal Wizard ─── */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-cyan-400" />
                Online Appointment Booking (Step {bookingStep}/3)
              </h3>
              <button onClick={() => setIsBookingModalOpen(false)} className="text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            {bookingStep === 1 && (
              <div className="space-y-4 text-xs">
                {/* Branch Selection */}
                <div>
                  <label className="block text-slate-400 mb-1 font-bold">Select Hospital Branch</label>
                  <select
                    value={bookingBranchId}
                    onChange={(e) => setBookingBranchId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                  >
                    {activeTenant.branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.city})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-bold">Select Department</label>
                  <select
                    value={bookingDept}
                    onChange={(e) => setBookingDept(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-bold">Select Doctor Specialist</label>
                  <select
                    value={bookingDoctor.id}
                    onChange={(e) => {
                      const d = doctors.find((doc) => doc.id === e.target.value);
                      if (d) setBookingDoctor(d);
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-bold text-cyan-400"
                  >
                    {doctors.map((doc) => (
                      <option key={doc.id} value={doc.id}>
                        {doc.name} ({doc.specialization}) - ₹{doc.consultationFee}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Consultation Date */}
                <div>
                  <label className="block text-slate-400 mb-1 font-bold">Select Consultation Date</label>
                  <input
                    type="date"
                    min={todayStr}
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-bold"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setBookingStep(2)}
                  className="w-full py-2.5 rounded-xl bg-cyan-600 text-white font-bold"
                >
                  Continue to Select Slot →
                </button>
              </div>
            )}

            {bookingStep === 2 && (
              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-slate-400 font-bold">Select Available Slot</label>
                    <div className="flex gap-2 text-[10px]">
                      <span className="text-emerald-400">🟢 Available</span>
                      <span className="text-amber-400">🟡 Few Left</span>
                      <span className="text-rose-400">🔴 Full</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {DEFAULT_TIME_SLOTS.map((slot) => {
                      const isSelected = bookingTime === slot.time;
                      const isFull = slot.status === 'full';
                      const isFew = slot.status === 'few';

                      return (
                        <button
                          key={slot.time}
                          type="button"
                          disabled={isFull}
                          onClick={() => setBookingTime(slot.time)}
                          className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center ${
                            isFull
                              ? 'bg-rose-950/20 border-rose-500/30 text-rose-400 opacity-60 cursor-not-allowed'
                              : isSelected
                              ? 'bg-cyan-500 text-slate-950 font-black border-cyan-400 ring-2 ring-cyan-400'
                              : isFew
                              ? 'bg-amber-950/30 border-amber-500/40 text-amber-300'
                              : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                          }`}
                        >
                          <span className="font-mono font-bold text-xs">{slot.time}</span>
                          <span className="text-[9px] uppercase font-bold">
                            {isFull ? '🔴 Full' : isFew ? `🟡 ${slot.availableCount} Left` : `🟢 ${slot.availableCount} Slots`}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setBookingStep(1)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setBookingStep(3)}
                    className="px-5 py-2 rounded-xl bg-cyan-600 text-white font-bold"
                  >
                    Enter Details &amp; Payment →
                  </button>
                </div>
              </div>
            )}

            {bookingStep === 3 && (
              <form onSubmit={handleBookingSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Patient Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Phone Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="+91 98490 12345"
                      value={patientPhone}
                      onChange={(e) => setPatientPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Age</label>
                    <input
                      type="number"
                      placeholder="e.g. 45"
                      value={patientAge}
                      onChange={(e) => setPatientAge(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                    />
                  </div>
                </div>

                {/* Pre-Pay Consultation Fee Mode */}
                <div>
                  <label className="block text-slate-400 mb-1 font-bold">Pre-Pay Consultation Fee Mode:</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'upi', label: 'UPI / QR', icon: QrCode },
                      { id: 'card', label: 'Online Card', icon: CreditCard },
                      { id: 'cash', label: 'Cash Desk', icon: DollarSign },
                    ].map((m) => {
                      const Icon = m.icon;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setBookingPaymentMode(m.id as any)}
                          className={`p-2 rounded-xl text-center border font-bold flex flex-col items-center gap-1 ${
                            bookingPaymentMode === m.id
                              ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                              : 'bg-slate-950 border-slate-800 text-slate-400'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span className="text-[10px]">{m.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {bookingPaymentMode !== 'cash' && (
                  <div className="p-3 bg-cyan-950/30 rounded-xl border border-cyan-500/40 space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-cyan-300 font-bold">Enter 12-Digit UTR / Transaction No:</span>
                      <button
                        type="button"
                        onClick={() => setBookingUtrInput(`UTR${Date.now().toString().slice(-8)}`)}
                        className="text-[9px] text-cyan-400 font-bold hover:underline"
                      >
                        ⚡ Demo UTR
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. 489201889211"
                      value={bookingUtrInput}
                      onChange={(e) => setBookingUtrInput(e.target.value.toUpperCase())}
                      className="w-full bg-slate-950 border border-cyan-500/60 rounded-xl px-3 py-2 text-slate-100 font-mono text-xs"
                    />
                  </div>
                )}

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                  <span className="text-slate-400">Total Consultation Fee:</span>
                  <span className="text-emerald-400 font-mono font-bold text-sm">
                    ₹{bookingDoctor.consultationFee}.00
                  </span>
                </div>

                <div className="flex justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setBookingStep(2)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold"
                  >
                    Confirm &amp; Pre-Book Appointment
                  </button>
                </div>
              </form>
            )}

            {bookingStep === 4 && (
              <div className="text-center py-6 space-y-4">
                <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto animate-pulse" />
                <h3 className="text-lg font-black text-white">Appointment Pre-Booked!</h3>
                <p className="text-xs text-slate-300">
                  Your appointment with <strong className="text-cyan-300">{bookingDoctor.name}</strong> is scheduled for{' '}
                  <strong className="text-cyan-300">{bookingDate}</strong> at <strong className="text-cyan-300">{bookingTime}</strong>. Added to Central Patient Queue.
                </p>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300">
                  {bookingPaymentMode === 'cash' ? (
                    <span className="text-amber-300 font-bold">
                      🔴 Payment Pending – Please pay at hospital desk to generate your OPD Token.
                    </span>
                  ) : (
                    <span className="text-cyan-300 font-bold">
                      🟡 UTR Verification Pending – Staff will verify your UTR and issue your OPD Token upon arrival.
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setIsBookingModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl bg-slate-800 text-white font-bold text-xs"
                >
                  Close Window
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

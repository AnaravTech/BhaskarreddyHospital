import React, { useState, useEffect } from 'react';
import { useHospital } from '../../context/HospitalContext';
import type { Patient } from '../../types';
import {
  X,
  User,
  Phone,
  Shield,
  KeyRound,
  Calendar,
  Mail,
  MapPin,
  Droplet,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Activity,
  Send,
  RotateCw,
  Sparkles,
} from 'lucide-react';

interface PatientAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (patient: Patient) => void;
}

export const PatientAuthModal: React.FC<PatientAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { patients, addPatient, patientLogin, generateUniqueUHID } = useHospital();

  // Mode: 'login' | 'register' | 'registered_success'
  const [mode, setMode] = useState<'login' | 'register' | 'registered_success'>('login');

  // ─── Login Form Fields ───────────────────────────────────────────────────────
  const [loginName, setLoginName] = useState('');
  const [loginAadhaar, setLoginAadhaar] = useState('');
  const [loginMobile, setLoginMobile] = useState('');
  const [loginOtp, setLoginOtp] = useState('');

  // ─── Registration Form Fields ────────────────────────────────────────────────
  const [regName, setRegName] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regDob, setRegDob] = useState('');
  const [regAadhaar, setRegAadhaar] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regBloodGroup, setRegBloodGroup] = useState('Unknown / N/A');
  const [regOtp, setRegOtp] = useState('');

  // Newly registered patient reference for success screen
  const [registeredPatient, setRegisteredPatient] = useState<Patient | null>(null);

  // ─── UI & Error States ───────────────────────────────────────────────────────
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [existingPatientPrompt, setExistingPatientPrompt] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(false);

  // ─── Simulated OTP State ─────────────────────────────────────────────────────
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [otpCountdown, setOtpCountdown] = useState<number>(0);
  const [otpToastVisible, setOtpToastVisible] = useState(false);
  const [otpSentAtLeastOnce, setOtpSentAtLeastOnce] = useState(false);

  // Countdown timer effect for simulated OTP (5 seconds)
  useEffect(() => {
    if (otpCountdown <= 0) {
      setOtpToastVisible(false);
      return;
    }

    const timer = setInterval(() => {
      setOtpCountdown((prev) => {
        if (prev <= 1) {
          setOtpToastVisible(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [otpCountdown]);

  // Reset states when modal opens / closes
  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      setExistingPatientPrompt(null);
    } else {
      setOtpToastVisible(false);
      setOtpCountdown(0);
      setGeneratedOtp(null);
      setOtpSentAtLeastOnce(false);
    }
  }, [isOpen]);

  // ─── Automatic Age Calculation Engine ─────────────────────────────────────────
  const calculateAge = (dobString: string): number | null => {
    if (!dobString) return null;
    const birthDate = new Date(dobString);
    if (isNaN(birthDate.getTime())) return null;

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 0 ? age : 0;
  };

  const calculatedAge = calculateAge(regDob);

  // ─── Helper: Clean numbers for strict matching ───────────────────────────────
  const cleanDigits = (val: string) => val.replace(/\D/g, '');

  // ─── Simulated OTP Trigger ───────────────────────────────────────────────────
  const handleSendOtp = (forMode: 'login' | 'register') => {
    setErrorMessage(null);
    setExistingPatientPrompt(null);

    const mobile = (forMode === 'login' ? cleanDigits(loginMobile) : cleanDigits(regMobile)).slice(-10);
    const aadhaar = (forMode === 'login' ? cleanDigits(loginAadhaar) : cleanDigits(regAadhaar)).slice(-12);
    const name = forMode === 'login' ? loginName.trim() : regName.trim();

    if (!name) {
      setErrorMessage('Please enter Full Name before requesting OTP.');
      return;
    }
    if (aadhaar.length !== 12) {
      setErrorMessage('Please enter a valid 12-digit Aadhaar Number.');
      return;
    }
    if (mobile.length !== 10) {
      setErrorMessage('Please enter a valid 10-digit Mobile Number.');
      return;
    }

    // In registration mode: verify duplicate check immediately before issuing OTP
    if (forMode === 'register') {
      const existing = patients.find((p) => {
        const pAadhaar = cleanDigits(p.aadharNumber || '').slice(-12);
        const pPhone = cleanDigits(p.phone || '').slice(-10);
        return (pAadhaar && pAadhaar === aadhaar) || (pPhone && pPhone === mobile);
      });

      if (existing) {
        setExistingPatientPrompt(existing);
        setErrorMessage(
          `An existing patient record was found for ${existing.name} (UHID: ${existing.uhid}). Please use Patient Login instead of creating a new registration.`
        );
        return;
      }
    }

    // Generate random 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setOtpCountdown(5); // 5 seconds requirement
    setOtpToastVisible(true);
    setOtpSentAtLeastOnce(true);

    // If in development/demo, prefill or allow instant insert
  };

  // ─── Existing Patient Login Submit ───────────────────────────────────────────
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanAadh = cleanDigits(loginAadhaar);
    const cleanMob = cleanDigits(loginMobile);
    const trimmedName = loginName.trim().toLowerCase();

    if (!trimmedName || cleanAadh.length !== 12 || cleanMob.length !== 10) {
      setErrorMessage('Please fill in Full Name, 12-digit Aadhaar, and 10-digit Mobile Number.');
      return;
    }

    if (!generatedOtp) {
      setErrorMessage('Please click [ Send OTP ] to generate and verify your one-time password.');
      return;
    }

    if (loginOtp.trim() !== generatedOtp) {
      setErrorMessage('Invalid OTP code. Please enter the 6-digit OTP received on your mobile.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      // Find matching patient from hospital records
      const match = patients.find((p) => {
        const pAadhaar = cleanDigits(p.aadharNumber || '').slice(-12);
        const pPhone = cleanDigits(p.phone || '').slice(-10);
        const pName = p.name.toLowerCase().trim();

        // Exact Aadhaar match or (Phone match AND Name match)
        const aadhaarMatch = pAadhaar && pAadhaar.length === 12 && pAadhaar === cleanAadh;
        const phoneMatch = pPhone && pPhone.length === 10 && pPhone === cleanMob;
        const nameMatch = pName.includes(trimmedName) || trimmedName.includes(pName);

        return aadhaarMatch || (phoneMatch && nameMatch);
      });

      setLoading(false);

      if (match) {
        // Patient found: retrieve UHID and login directly!
        const enrichedMatch: Patient = {
          ...match,
          aadharNumber: match.aadharNumber || `${cleanAadh.slice(0, 4)} ${cleanAadh.slice(4, 8)} ${cleanAadh.slice(8, 12)}`,
        };
        patientLogin(enrichedMatch);
        onSuccess(enrichedMatch);
        onClose();
      } else {
        setErrorMessage(
          'No existing hospital patient record was found matching this Aadhaar and Mobile number. If you are visiting Bhaskar Reddy Hospital for the first time, please click "Register here" below.'
        );
      }
    }, 400);
  };

  // ─── New Patient Registration Submit ────────────────────────────────────────
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanAadh = cleanDigits(regAadhaar);
    const cleanMob = cleanDigits(regMobile);
    const trimmedName = regName.trim();

    if (!trimmedName) {
      setErrorMessage('Full Name is required.');
      return;
    }
    if (cleanMob.length !== 10) {
      setErrorMessage('Please enter a valid 10-digit Mobile Number.');
      return;
    }
    if (!regDob) {
      setErrorMessage('Date of Birth is required to calculate age and setup patient chart.');
      return;
    }
    if (cleanAadh.length !== 12) {
      setErrorMessage('A valid 12-digit Aadhaar Number is required.');
      return;
    }
    if (!regAddress.trim()) {
      setErrorMessage('Residential Address is required.');
      return;
    }
    if (!generatedOtp) {
      setErrorMessage('Please click [ Send OTP ] to verify your mobile number before registering.');
      return;
    }
    if (regOtp.trim() !== generatedOtp) {
      setErrorMessage('Invalid OTP code. Please enter the 6-digit OTP displayed in the notification.');
      return;
    }

    // Final Duplicate Patient Check
    const existing = patients.find((p) => {
      const pAadhaar = cleanDigits(p.aadharNumber || '').slice(-12);
      const pPhone = cleanDigits(p.phone || '').slice(-10);
      return (pAadhaar && pAadhaar === cleanAadh) || (pPhone && pPhone === cleanMob);
    });

    if (existing) {
      setExistingPatientPrompt(existing);
      setErrorMessage(
        `An existing patient record was found for ${existing.name} (UHID: ${existing.uhid}). Please use Patient Login instead of creating a duplicate registration.`
      );
      return;
    }

    setLoading(true);
    setTimeout(() => {
      // Generate genuine unique UHID
      const uhid = generateUniqueUHID();
      const ageVal = calculatedAge ?? 0;

      const newPatient: Patient = {
        id: `pat-${Date.now().toString().slice(-4)}`,
        uhid,
        name: trimmedName,
        aadharNumber: `${cleanAadh.slice(0, 4)} ${cleanAadh.slice(4, 8)} ${cleanAadh.slice(8, 12)}`,
        dob: regDob,
        age: ageVal,
        gender: 'Other',
        phone: cleanMob,
        email: regEmail.trim() || undefined,
        bloodGroup: regBloodGroup === 'Unknown / N/A' ? undefined : regBloodGroup,
        address: regAddress.trim(),
        emergencyContact: {
          name: 'Family Contact',
          relationship: 'Next of Kin',
          phone: cleanMob,
        },
        allergies: [],
        medicalHistory: [],
        registeredDate: new Date().toISOString().split('T')[0],
        totalVisits: 0,
        status: 'Active',
        medications: [],
        labResults: [],
        radiologyReports: [],
      };

      addPatient(newPatient);
      patientLogin(newPatient);
      setRegisteredPatient(newPatient);
      setLoading(false);
      setMode('registered_success');
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* ─── Backdrop Blur Overlay ────────────────────────────────────────── */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 transition-opacity animate-in fade-in duration-200"
      />

      {/* ─── Modal Dialog Container ───────────────────────────────────────── */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden relative animate-in zoom-in-95 duration-200"
        >
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-cyan-700 via-cyan-800 to-blue-900 px-6 py-5 text-white relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center">
                <Activity className="w-4 h-4 text-cyan-300" />
              </div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-cyan-200">
                Bhaskar Reddy Hospital
              </span>
            </div>

            <h2 className="text-xl font-black tracking-tight text-white">
              {mode === 'login' && 'Patient Portal Login'}
              {mode === 'register' && 'New Patient Registration'}
              {mode === 'registered_success' && 'Registration Complete'}
            </h2>
            <p className="text-xs text-cyan-100/80 mt-0.5">
              {mode === 'login' && 'Enter your Aadhaar & mobile number to access your EHR & reports.'}
              {mode === 'register' && 'Create your permanent digital hospital record and UHID.'}
              {mode === 'registered_success' && 'Your permanent UHID has been generated successfully.'}
            </p>

            {/* Mode Switcher Tabs */}
            {mode !== 'registered_success' && (
              <div className="mt-4 flex bg-cyan-950/50 p-1 rounded-xl border border-cyan-700/50">
                <button
                  type="button"
                  id="auth-tab-login"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage(null);
                    setExistingPatientPrompt(null);
                  }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                    mode === 'login'
                      ? 'bg-white text-cyan-950 shadow-sm'
                      : 'text-cyan-200 hover:text-white'
                  }`}
                >
                  Existing Patient Login
                </button>
                <button
                  type="button"
                  id="auth-tab-register"
                  onClick={() => {
                    setMode('register');
                    setErrorMessage(null);
                    setExistingPatientPrompt(null);
                  }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                    mode === 'register'
                      ? 'bg-white text-cyan-950 shadow-sm'
                      : 'text-cyan-200 hover:text-white'
                  }`}
                >
                  New Patient Registration
                </button>
              </div>
            )}
          </div>

          {/* Modal Body */}
          <div className="p-6 max-h-[75vh] overflow-y-auto">
            {/* Error Message Alert */}
            {errorMessage && (
              <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-semibold">{errorMessage}</div>
                  {existingPatientPrompt && (
                    <button
                      type="button"
                      id="go-to-patient-login-prompt-btn"
                      onClick={() => {
                        setMode('login');
                        setLoginName(existingPatientPrompt.name);
                        setLoginAadhaar(existingPatientPrompt.aadharNumber || '');
                        setLoginMobile(existingPatientPrompt.phone || '');
                        setExistingPatientPrompt(null);
                        setErrorMessage(null);
                      }}
                      className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-cyan-700 bg-cyan-50 px-2.5 py-1 rounded-md border border-cyan-300 hover:bg-cyan-100 transition"
                    >
                      <span>[ Go to Patient Login ]</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* ─────────────────────────────────────────────────────────────────
                MODE 1: EXISTING PATIENT LOGIN
            ────────────────────────────────────────────────────────────────── */}
            {mode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Name (as per Hospital / Aadhaar record) *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kavitha Venkatram"
                      value={loginName}
                      onChange={(e) => setLoginName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition"
                    />
                  </div>
                </div>

                {/* Aadhaar Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    12-Digit Aadhaar Number *
                  </label>
                  <div className="relative">
                    <Shield className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      maxLength={14}
                      required
                      placeholder="5421 8890 1234"
                      value={loginAadhaar}
                      onChange={(e) => setLoginAadhaar(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Example demo registered Aadhaar: <strong>5421 8890 1234</strong>
                  </span>
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Registered Mobile Number *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      maxLength={10}
                      required
                      placeholder="9849012345"
                      value={loginMobile}
                      onChange={(e) => setLoginMobile(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Example demo registered mobile: <strong>9849012345</strong>
                  </span>
                </div>

                {/* OTP Field with Send OTP Button */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">
                      One-Time Password (OTP) *
                    </label>
                    <button
                      type="button"
                      onClick={() => handleSendOtp('login')}
                      className="text-xs font-bold text-cyan-700 hover:text-cyan-800 flex items-center gap-1 hover:underline"
                    >
                      <Send className="w-3 h-3" />
                      <span>{otpSentAtLeastOnce ? 'Resend OTP' : 'Send OTP'}</span>
                    </button>
                  </div>

                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      maxLength={6}
                      required
                      placeholder="Enter 6-digit OTP"
                      value={loginOtp}
                      onChange={(e) => setLoginOtp(e.target.value)}
                      className="w-full pl-9 pr-24 py-2 text-sm font-mono tracking-widest border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition"
                    />
                    <button
                      type="button"
                      id="login-send-otp-btn"
                      onClick={() => handleSendOtp('login')}
                      className="absolute right-1.5 top-1.5 px-3 py-1.5 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-700 text-xs font-bold border border-cyan-200 transition"
                    >
                      {otpSentAtLeastOnce ? 'Resend' : 'Send OTP'}
                    </button>
                  </div>

                  {otpToastVisible && (
                    <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                      <Clock className="w-3 h-3 animate-spin" />
                      <span>OTP active (expires in {otpCountdown}s)</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="pt-2">
                  <button
                    type="submit"
                    id="login-submit-btn"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-sm shadow-md shadow-cyan-600/25 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <RotateCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Login to Patient Portal</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

                {/* Register Here Link */}
                <div className="text-center pt-2 border-t border-slate-100">
                  <span className="text-xs text-slate-500">New patient? </span>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setErrorMessage(null);
                      setExistingPatientPrompt(null);
                    }}
                    className="text-xs font-bold text-cyan-700 hover:text-cyan-800 hover:underline"
                  >
                    Register here
                  </button>
                </div>
              </form>
            )}

            {/* ─────────────────────────────────────────────────────────────────
                MODE 2: NEW PATIENT REGISTRATION
            ────────────────────────────────────────────────────────────────── */}
            {mode === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Kumar"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition"
                    />
                  </div>
                </div>

                {/* Mobile Number & DOB in 2-col */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Mobile Number *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="tel"
                        maxLength={10}
                        required
                        placeholder="10-digit mobile"
                        value={regMobile}
                        onChange={(e) => setRegMobile(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none transition"
                      />
                    </div>
                  </div>

                  {/* DOB with Automatic Age Calculation */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700">
                        Date of Birth *
                      </label>
                      {calculatedAge !== null && (
                        <span className="text-[11px] font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-full border border-cyan-200">
                          Age: {calculatedAge} years
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                      <input
                        type="date"
                        required
                        value={regDob}
                        onChange={(e) => setRegDob(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Aadhaar Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    12-Digit Aadhaar Number *
                  </label>
                  <div className="relative">
                    <Shield className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      maxLength={14}
                      required
                      placeholder="XXXX XXXX XXXX"
                      value={regAadhaar}
                      onChange={(e) => setRegAadhaar(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none transition"
                    />
                  </div>
                </div>

                {/* Email & Blood Group */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Gmail / Email (Optional)
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        placeholder="patient@gmail.com"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Blood Group
                    </label>
                    <div className="relative">
                      <Droplet className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                      <select
                        value={regBloodGroup}
                        onChange={(e) => setRegBloodGroup(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none transition bg-white"
                      >
                        <option value="Unknown / N/A">Unknown / N/A</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Residential Address */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Residential Address *
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="House/Flat, Street, Area, City, Andhra Pradesh"
                      value={regAddress}
                      onChange={(e) => setRegAddress(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none transition"
                    />
                  </div>
                </div>

                {/* Registration OTP Field */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">
                      OTP Verification *
                    </label>
                    <button
                      type="button"
                      onClick={() => handleSendOtp('register')}
                      className="text-xs font-bold text-cyan-700 hover:text-cyan-800 flex items-center gap-1 hover:underline"
                    >
                      <Send className="w-3 h-3" />
                      <span>{otpSentAtLeastOnce ? 'Resend OTP' : 'Send OTP'}</span>
                    </button>
                  </div>

                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      maxLength={6}
                      required
                      placeholder="Enter 6-digit OTP"
                      value={regOtp}
                      onChange={(e) => setRegOtp(e.target.value)}
                      className="w-full pl-9 pr-24 py-2 text-sm font-mono tracking-widest border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none transition"
                    />
                    <button
                      type="button"
                      id="reg-send-otp-btn"
                      onClick={() => handleSendOtp('register')}
                      className="absolute right-1.5 top-1.5 px-3 py-1.5 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-700 text-xs font-bold border border-cyan-200 transition"
                    >
                      {otpSentAtLeastOnce ? 'Resend' : 'Send OTP'}
                    </button>
                  </div>

                  {otpToastVisible && (
                    <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                      <Clock className="w-3 h-3 animate-spin" />
                      <span>OTP active (expires in {otpCountdown}s)</span>
                    </div>
                  )}
                </div>

                {/* Register Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    id="reg-submit-btn"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-sm shadow-md shadow-emerald-600/25 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <RotateCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Complete Registration & Generate UHID</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

                {/* Already registered link */}
                <div className="text-center pt-2 border-t border-slate-100">
                  <span className="text-xs text-slate-500">Already have a hospital UHID? </span>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setErrorMessage(null);
                      setExistingPatientPrompt(null);
                    }}
                    className="text-xs font-bold text-cyan-700 hover:text-cyan-800 hover:underline"
                  >
                    Go to Login
                  </button>
                </div>
              </form>
            )}

            {/* ─────────────────────────────────────────────────────────────────
                MODE 3: REGISTRATION SUCCESS CARD
            ────────────────────────────────────────────────────────────────── */}
            {mode === 'registered_success' && registeredPatient && (
              <div className="text-center py-4 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-lg shadow-emerald-600/10">
                  <CheckCircle2 className="w-9 h-9" />
                </div>

                <div>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    Registration Successful
                  </span>
                  <h3 className="text-xl font-black text-slate-900 mt-2">
                    Welcome, {registeredPatient.name}!
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Your digital hospital health file has been initialized under Bhaskar Reddy Hospital network.
                  </p>
                </div>

                {/* Generated UHID Highlight Box */}
                <div className="p-4 rounded-2xl bg-slate-900 text-white border border-cyan-500/30 max-w-sm mx-auto shadow-xl">
                  <div className="text-[11px] font-bold text-cyan-300 uppercase tracking-widest mb-1">
                    Your Permanent Hospital UHID
                  </div>
                  <div className="text-3xl font-black font-mono tracking-wider text-white">
                    {registeredPatient.uhid}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Save this UHID for all future appointments, OPD visits, and lab report downloads.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    id="continue-to-dashboard-btn"
                    onClick={() => {
                      onSuccess(registeredPatient);
                      onClose();
                    }}
                    className="w-full max-w-sm py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-cyan-600/30 transition flex items-center justify-center gap-2 mx-auto"
                  >
                    <span>Continue to Patient Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── FLOATING SIMULATED OTP NOTIFICATION (BOTTOM-RIGHT CORNER) ───────── */}
      {/* Visible for exactly 5 seconds as specified in requirement 2 */}
      {otpToastVisible && generatedOtp && (
        <div className="fixed bottom-5 right-5 z-[100] max-w-sm w-full bg-slate-950 text-white p-4 rounded-2xl shadow-2xl border border-cyan-500/60 animate-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-extrabold text-white">
                  Bhaskar Reddy Hospital
                </div>
                <div className="text-[10px] text-cyan-400 font-medium">
                  ABDM SMS Gateway Telemetry
                </div>
              </div>
            </div>

            {/* Countdown Badge */}
            <div className="px-2 py-0.5 rounded-full bg-rose-950/80 border border-rose-500/40 text-rose-300 text-[10px] font-bold flex items-center gap-1">
              <Clock className="w-3 h-3 animate-pulse text-rose-400" />
              <span>Expires in {otpCountdown}s</span>
            </div>
          </div>

          <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 my-2 text-center">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
              Your 6-Digit Verification OTP
            </div>
            <div className="text-2xl font-black font-mono tracking-widest text-cyan-400">
              {generatedOtp}
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 pt-1 text-[10px] text-slate-400">
            <span>* Simulated OTP for frontend demonstration.</span>
            <button
              type="button"
              id="otp-toast-autofill-btn"
              onClick={() => {
                if (mode === 'login') setLoginOtp(generatedOtp);
                if (mode === 'register') setRegOtp(generatedOtp);
              }}
              className="text-cyan-400 font-bold hover:underline cursor-pointer"
            >
              [ Auto-fill OTP ]
            </button>
          </div>
        </div>
      )}
    </>
  );
};

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useHospital } from '../../context/HospitalContext';
import type { Appointment } from '../../types';
import {
  UserPlus,
  Search,
  Ticket,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  X,
  User,
  Stethoscope,
  FileText,
  CreditCard,
  QrCode,
  Copy,
  Check,
  DollarSign,
  Wallet,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Printer,
  Receipt,
  ArrowRightLeft,
  Ban,
  AlertCircle,
  Building2,
  Globe,
  Activity,
} from 'lucide-react';

export const ReceptionModule: React.FC = () => {
  const {
    patients,
    doctors,
    departments,
    appointments,
    activeTenant,
    addPatient,
    addAppointment,
    verifyAppointmentPayment,
    reassignAppointmentDoctor,
    cancelAppointment,
    checkOPValidity,
    addUnverifiedUTR,
    addToast,
    currentUser,
    activeBranch,
    findPatientByGlobalUHID,
  } = useHospital();

  // UTR Payment Verification Modal State
  const [showVerifyUtrModal, setShowVerifyUtrModal] = useState(false);
  const [selectedVerifyApt, setSelectedVerifyApt] = useState<Appointment | null>(null);

  // Cash Collection & Token Issuance Modal State
  const [showReceiveCashModal, setShowReceiveCashModal] = useState(false);
  const [selectedCashApt, setSelectedCashApt] = useState<Appointment | null>(null);

  const [activeTab, setActiveTabState] = useState<'register' | 'queue'>(() => {
    try {
      const saved = localStorage.getItem('brhospital-tab-reception');
      if (saved === 'register' || saved === 'queue') return saved;
    } catch {}
    return 'queue';
  });

  const setActiveTab = (tab: 'register' | 'queue') => {
    setActiveTabState(tab);
    try {
      localStorage.setItem('brhospital-tab-reception', tab);
    } catch {}
  };

  // Live Next OP Number Preview Engine (BRH + YY + MM + XXXX)
  const nextOPNumber = useMemo(() => {
    const targetDateStr = '2026-07-24';
    const d = new Date(targetDateStr);
    const year2 = String(d.getFullYear()).slice(-2);
    const month2 = String(d.getMonth() + 1).padStart(2, '0');
    const prefix = `BRH${year2}${month2}`;

    let maxSeq = 0;
    patients.forEach((p) => {
      if (p.opNumber && p.opNumber.startsWith(prefix)) {
        const seqStr = p.opNumber.slice(prefix.length);
        const num = parseInt(seqStr, 10);
        if (!isNaN(num) && num > maxSeq) maxSeq = num;
      }
    });

    return `${prefix}${String(maxSeq + 1).padStart(4, '0')}`;
  }, [patients]);

  // Live Next UHID Preview Engine (BRH + 5-digit number, e.g. BRH14568)
  const nextUHID = useMemo(() => {
    const prefix = 'BRH';
    let maxSeq = 14560;
    patients.forEach((p) => {
      if (p.uhid && p.uhid.startsWith(prefix)) {
        const seqStr = p.uhid.slice(prefix.length).replace(/[^0-9]/g, '');
        const num = parseInt(seqStr, 10);
        if (!isNaN(num) && num > maxSeq) maxSeq = num;
      }
    });
    return `${prefix}${maxSeq + 1}`;
  }, [patients]);

  // Form State for Walk-in Patient Registration
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    aadharNumber: '',
    dob: '',
    age: '',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    address: '',
    bloodGroup: '',
    email: '',
    emergencyName: '',
    emergencyPhone: '',
    allergies: '',
  });

  const [phoneError, setPhoneError] = useState('');
  const [aadharError, setAadharError] = useState('');

  // Token / Appointment Booking State
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [patientSearchTerm, setPatientSearchTerm] = useState('');
  const [doctorSearchTerm, setDoctorSearchTerm] = useState('');
  const [isPatientDropdownOpen, setIsPatientDropdownOpen] = useState(false);
  const [isDoctorDropdownOpen, setIsDoctorDropdownOpen] = useState(false);
  const [appointmentModel, setAppointmentModel] = useState<'Premium Slot' | 'Normal Queue'>('Normal Queue');
  const [timeSlot, setTimeSlot] = useState('10:00 AM');
  const [includeHospitalFile, setIncludeHospitalFile] = useState(false);

  // Payment Options & UTR Verification State
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Online UPI' | 'Card'>('Cash');
  const [cashTendered, setCashTendered] = useState<string>('');
  
  // Hospital-Standard EDC / POS Card Payment Details
  const [cardDetails, setCardDetails] = useState({
    cardType: 'Credit Card' as 'Credit Card' | 'Debit Card',
    cardNetwork: 'Visa' as 'Visa' | 'Mastercard' | 'RuPay' | 'Amex',
    last4Digits: '',
    authCode: '',
    terminalId: 'ICICI POS Terminal #01',
    issuingBank: 'HDFC Bank',
    batchNo: 'BATCH-0042',
  });

  const [utrNumber, setUtrNumber] = useState<string>('UTR');
  const [utrStatus, setUtrStatus] = useState<'idle' | 'verified' | 'not_found' | 'logged'>('idle');
  const [utrFeedback, setUtrFeedback] = useState<string>('');
  const [copiedUPI, setCopiedUPI] = useState(false);

  // Formatter for UTR Number (Starts with default 'UTR' and accepts strictly up to 12 numeric digits)
  const handleUtrChange = (val: string) => {
    let clean = val.toUpperCase().trim();
    if (!clean.startsWith('UTR')) {
      const digits = clean.replace(/\D/g, '').slice(0, 12);
      clean = `UTR${digits}`;
    } else {
      const digits = clean.slice(3).replace(/\D/g, '').slice(0, 12);
      clean = `UTR${digits}`;
    }
    setUtrNumber(clean);
    setUtrStatus('idle');
    setUtrFeedback('');
  };

  const utrDigitsCount = utrNumber.startsWith('UTR') ? utrNumber.slice(3).length : 0;

  // Registration Charges Constant (REG01)
  const REGISTRATION_FILE_CHARGE = 30;
  const REGISTRATION_SERVICE_CODE = 'REG01';

  // Department Code Resolver (Preserving Standard Hospital Shortcuts)
  const getDepartmentPrefix = (deptName = ''): string => {
    const clean = deptName.toLowerCase();
    if (clean.includes('cardio')) return 'CARD';
    if (clean.includes('ortho')) return 'ORTH';
    if (clean.includes('neuro')) return 'NEUR';
    if (clean.includes('gyn') || clean.includes('obste') || clean.includes('women')) return 'OBGY';
    if (clean.includes('emerg') || clean.includes('trauma')) return 'EMRG';
    if (clean.includes('pedia') || clean.includes('child')) return 'PEDIA';
    if (clean.includes('derma')) return 'DERMA';
    if (clean.includes('ent')) return 'ENT';
    if (clean.includes('eye') || clean.includes('ophth')) return 'OPHTH';
    if (clean.includes('gen') || clean.includes('intern')) return 'GENMED';
    return deptName.replace(/[^A-Za-z]/g, '').slice(0, 4).toUpperCase() || 'OPD';
  };

  const [searchFilter, setSearchFilter] = useState('');

  const patientDropdownRef = useRef<HTMLDivElement>(null);
  const doctorDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (patientDropdownRef.current && !patientDropdownRef.current.contains(event.target as Node)) {
        setIsPatientDropdownOpen(false);
      }
      if (doctorDropdownRef.current && !doctorDropdownRef.current.contains(event.target as Node)) {
        setIsDoctorDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedDoctor = useMemo(() => {
    if (selectedDoctorId) {
      const found = doctors.find((d) => d.id === selectedDoctorId);
      if (found) return found;
    }
    if (doctorSearchTerm.trim()) {
      const term = doctorSearchTerm.toLowerCase();
      const found = doctors.find(
        (d) =>
          d.name.toLowerCase().includes(term) ||
          term.includes(d.name.toLowerCase()) ||
          d.specialization.toLowerCase().includes(term)
      );
      if (found) return found;
    }
    return null;
  }, [doctors, selectedDoctorId, doctorSearchTerm]);

  const selectedPatient = patients.find((p) => p.id === selectedPatientId);

  // Doctor-Specific 15-Day OP Consultation Validity Check (Patient ID + Doctor ID -> Valid Until)
  const validityStatus = useMemo(() => {
    if (!selectedPatient || !selectedDoctor) return null;
    return checkOPValidity(selectedPatient.id, selectedDoctor.id);
  }, [selectedPatient, selectedDoctor, checkOPValidity]);

  // Real-time Doctor Consultation Fee - ONLY calculates when patient & doctor are chosen, defaults to 0
  const doctorConsultationFee = selectedDoctor && selectedPatient
    ? appointmentModel === 'Premium Slot'
      ? (selectedDoctor.premiumFee ?? 500)
      : (selectedDoctor.consultationFee ?? 300)
    : 0;

  const effectiveConsultationFee = selectedDoctor && selectedPatient
    ? (validityStatus?.isValid ? 0 : doctorConsultationFee)
    : 0;

  const registrationChargesFee = includeHospitalFile ? REGISTRATION_FILE_CHARGE : 0;
  const totalPayableFee = (selectedDoctor && selectedPatient)
    ? effectiveConsultationFee + registrationChargesFee
    : registrationChargesFee;

  const [selectedReceiptApt, setSelectedReceiptApt] = useState<any | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // Re-assign Doctor Modal State
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedTransferApt, setSelectedTransferApt] = useState<Appointment | null>(null);
  const [transferDoctorId, setTransferDoctorId] = useState('');
  const [transferModel, setTransferModel] = useState<'Normal Queue' | 'Premium Slot'>('Normal Queue');
  const [transferPaymentMethod, setTransferPaymentMethod] = useState<'Cash' | 'Online UPI' | 'Card'>('Cash');
  const [transferUtrNumber, setTransferUtrNumber] = useState('UTR');

  // Cancel & Refund Modal State
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedCancelApt, setSelectedCancelApt] = useState<Appointment | null>(null);
  const [cancelReason, setCancelReason] = useState('Doctor Unavailable / Emergency Operation');
  const [cancelRefundMode, setCancelRefundMode] = useState<'Cash' | 'Online UPI Reversal' | 'Credit Voucher'>('Cash');

  // Refund Slip Modal State
  const [showRefundSlipModal, setShowRefundSlipModal] = useState(false);
  const [selectedRefundSlipApt, setSelectedRefundSlipApt] = useState<Appointment | null>(null);

  // Helper to convert number to English words for receipt
  const numberToWords = (num: number): string => {
    if (num === 0) return 'Zero Rupees Only';
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    if (num < 20) return `${ones[num]} Rupees Only`;
    if (num < 100) return `${tens[Math.floor(num / 10)]}${num % 10 !== 0 ? ' ' + ones[num % 10] : ''} Rupees Only`;
    if (num < 1000) {
      const rem = num % 100;
      return `${ones[Math.floor(num / 100)]} Hundred${rem !== 0 ? ' and ' + (rem < 20 ? ones[rem] : tens[Math.floor(rem / 10)] + (rem % 10 !== 0 ? ' ' + ones[rem % 10] : '')) : ''} Rupees Only`;
    }
    return `${num} Rupees Only`;
  };

  // Open Transfer Doctor Modal for selected Appointment
  const handleOpenTransferModal = (apt: Appointment) => {
    setSelectedTransferApt(apt);
    setTransferDoctorId(apt.doctorId);
    setTransferModel(apt.model);
    setTransferPaymentMethod('Cash');
    setTransferUtrNumber('UTR');
    setShowTransferModal(true);
  };

  // Open Cancel & Refund Modal for selected Appointment
  const handleOpenCancelModal = (apt: Appointment) => {
    setSelectedCancelApt(apt);
    setCancelReason('Doctor Unavailable / Emergency Operation');
    setCancelRefundMode('Cash');
    setShowCancelModal(true);
  };

  // Target Doctor for Transfer
  const targetTransferDoctor = useMemo(() => {
    return doctors.find((d) => d.id === transferDoctorId) || null;
  }, [doctors, transferDoctorId]);

  // Dynamic Differential Fee for Transfer
  const transferFeeCalculation = useMemo(() => {
    if (!selectedTransferApt || !targetTransferDoctor) {
      return { newDocFee: 0, newTotalFee: 0, differential: 0, originalFee: 0 };
    }
    const newDocFee = transferModel === 'Premium Slot'
      ? (targetTransferDoctor.premiumFee ?? 500)
      : (targetTransferDoctor.consultationFee ?? 300);
    const regFee = selectedTransferApt.hasHospitalFile ? 30 : 0;
    const newTotalFee = newDocFee + regFee;
    const originalFee = selectedTransferApt.fee;
    const differential = newTotalFee - originalFee;

    return {
      newDocFee,
      newTotalFee,
      differential,
      originalFee,
    };
  }, [selectedTransferApt, targetTransferDoctor, transferModel]);

  // Submit Doctor Transfer
  const handleConfirmDoctorTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTransferApt || !targetTransferDoctor) return;

    if (transferFeeCalculation.differential > 0 && transferPaymentMethod === 'Online UPI') {
      const digits = transferUtrNumber.replace(/\D/g, '');
      if (digits.length < 12) {
        addToast('Invalid UTR', 'Please enter a valid 12-digit UTR for differential payment.', 'warning');
        return;
      }
    }

    const updated = reassignAppointmentDoctor(
      selectedTransferApt.id,
      targetTransferDoctor,
      transferModel,
      {
        newFee: transferFeeCalculation.newTotalFee,
        differential: transferFeeCalculation.differential,
        paymentMode: transferPaymentMethod,
        utrNumber: transferPaymentMethod === 'Online UPI' ? transferUtrNumber : undefined,
      }
    );

    setShowTransferModal(false);
    if (updated) {
      setSelectedReceiptApt(updated);
      setShowReceiptModal(true);
    }
  };

  // Submit Consultation Cancellation
  const handleConfirmCancellation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCancelApt) return;

    cancelAppointment(
      selectedCancelApt.id,
      cancelReason,
      cancelRefundMode,
      selectedCancelApt.fee
    );

    const cancelledSnapshot: Appointment = {
      ...selectedCancelApt,
      status: 'Cancelled',
      paymentStatus: 'Refunded',
      cancellationReason: cancelReason,
      refundMode: cancelRefundMode,
      refundAmount: selectedCancelApt.fee,
      cancelledAt: `2026-07-24 ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`,
      refundReference: `REF-${Date.now().toString().slice(-6)}`,
    };

    setShowCancelModal(false);
    setSelectedRefundSlipApt(cancelledSnapshot);
    setShowRefundSlipModal(true);
  };

  // Verified bank UTR check (Requires full 12 digits)
  const handleCheckUTR = () => {
    const digits = utrNumber.startsWith('UTR') ? utrNumber.slice(3) : utrNumber.replace(/\D/g, '');
    if (digits.length === 0) {
      addToast('Missing UTR', 'Please enter the 12-digit UTR number', 'warning');
      return;
    }
    if (digits.length < 12) {
      addToast('Incomplete UTR', `UTR requires exactly 12 numbers (currently ${digits.length}/12 entered)`, 'warning');
      return;
    }

    const cleanUTR = utrNumber.trim().toUpperCase();
    const verifiedLedger = [
      '612983719283',
      '772183912845',
      '991204481234',
      '202607240189',
      '881290314567',
      'UTR612983719283',
      'UTR772183912845',
      'UTR991204481234',
      'UTR202607240189',
    ];

    const isMatch = verifiedLedger.some((v) => cleanUTR.includes(v) || v.includes(cleanUTR) || v.includes(digits));

    if (isMatch) {
      setUtrStatus('verified');
      setUtrFeedback(`✅ UTR ${utrNumber} Verified: ICICI Corporate Settlement Received (Ref #ICICI-SETTL-8821)`);
      addToast('UTR Verified', `Payment of ₹${totalPayableFee} confirmed in bank gateway!`, 'success');
    } else {
      setUtrStatus('not_found');
      setUtrFeedback(`⚠️ UTR ${utrNumber} (12-digit) Not Found in Immediate Bank Feed. You can click below to log this UTR into the Reports Section for account reconciliation.`);
      addToast('UTR Not Found', 'Transaction not found in immediate bank ledger', 'warning');
    }
  };

  const handleLogUTRToReports = () => {
    const digits = utrNumber.startsWith('UTR') ? utrNumber.slice(3) : utrNumber.replace(/\D/g, '');
    if (digits.length === 0) {
      addToast('Missing UTR', 'Please enter a UTR number before logging', 'warning');
      return;
    }

    addUnverifiedUTR({
      utrNumber: utrNumber.trim(),
      patientName: selectedPatient?.name || 'Walk-in Patient',
      patientUhid: selectedPatient?.uhid || 'Pending UHID',
      doctorName: selectedDoctor?.name || 'Assigned Specialist',
      amount: totalPayableFee,
      paymentMode: 'Online UPI',
      notes: 'Logged from Reception OPD Desk for bank reconciliation audit',
    });

    setUtrStatus('logged');
    setUtrFeedback('📋 UTR successfully logged into Reports Section under "UTR & Payment Audit"');
  };

  const handleCopyUPI = () => {
    navigator.clipboard.writeText('bhaskarreddyhospital@icici');
    setCopiedUPI(true);
    addToast('UPI ID Copied', 'bhaskarreddyhospital@icici copied to clipboard', 'info');
    setTimeout(() => setCopiedUPI(false), 2000);
  };

  // Global Universal UHID Look-up Match
  const globalUHIDMatch = useMemo(() => {
    if (!patientSearchTerm || patientSearchTerm.length < 3 || selectedPatientId) return null;
    return findPatientByGlobalUHID(patientSearchTerm);
  }, [patientSearchTerm, selectedPatientId, findPatientByGlobalUHID]);

  // Searchable Filtered Patients (Smart Combobox Filter)
  const filteredPatients = useMemo(() => {
    const selectedDisplay = selectedPatient
      ? `${selectedPatient.name} [${selectedPatient.opNumber ? `${selectedPatient.opNumber} • ` : ''}${selectedPatient.uhid}]`
      : '';
    const isFullSelectionDisplay = selectedPatient && patientSearchTerm === selectedDisplay;
    const q = isFullSelectionDisplay ? '' : patientSearchTerm.toLowerCase().trim();

    if (!q) return patients;
    return patients.filter((pat) =>
      pat.name.toLowerCase().includes(q) ||
      pat.uhid.toLowerCase().includes(q) ||
      (pat.opNumber && pat.opNumber.toLowerCase().includes(q)) ||
      pat.phone.includes(q) ||
      (pat.aadharNumber && pat.aadharNumber.includes(q))
    );
  }, [patients, patientSearchTerm, selectedPatient]);

  // Helper to find a covering duty doctor for an on-leave doctor
  const getCoveringDutyDoctor = (onLeaveDoc: typeof doctors[0]) => {
    if (onLeaveDoc.coveringDoctorName) {
      const explicitMatch = doctors.find((d) => d.id === onLeaveDoc.coveringDoctorId || d.name === onLeaveDoc.coveringDoctorName);
      if (explicitMatch) return explicitMatch;
    }
    // 1. Try finding an on-duty doctor in the same department
    const sameDeptDutyDoc = doctors.find(
      (d) => d.id !== onLeaveDoc.id && d.departmentName === onLeaveDoc.departmentName && (d.status === 'On Duty' || !d.status)
    );
    if (sameDeptDutyDoc) return sameDeptDutyDoc;

    // 2. Try finding any on-duty doctor in the same branch
    const sameBranchDutyDoc = doctors.find(
      (d) => d.id !== onLeaveDoc.id && d.branchId === onLeaveDoc.branchId && (d.status === 'On Duty' || !d.status)
    );
    if (sameBranchDutyDoc) return sameBranchDutyDoc;

    // 3. Fallback to any active on-duty doctor
    return doctors.find((d) => d.id !== onLeaveDoc.id && d.status === 'On Duty') || doctors[0];
  };

  // Searchable Filtered Doctors (OPD Token Generator Availability Engine)
  const filteredDoctors = useMemo(() => {
    const todayShort = new Date().toLocaleDateString('en-US', { weekday: 'short' }); // e.g. 'Wed'

    // Sort: Current branch first, then other branches
    const currentBranchDocs = doctors.filter((d) => d.branchId === activeBranch.id);
    const otherDocs = doctors.filter((d) => d.branchId !== activeBranch.id);
    const allSortedDocs = [...currentBranchDocs, ...otherDocs];

    const selectedDisplay = selectedDoctor
      ? `${selectedDoctor.name} - ${selectedDoctor.specialization}`
      : '';
    const isFullSelectionDisplay = selectedDoctor && doctorSearchTerm === selectedDisplay;
    const q = isFullSelectionDisplay ? '' : doctorSearchTerm.toLowerCase().trim();

    if (!q) {
      // DEFAULT VIEW (OPD Token Generator):
      // 1. Filter out doctors who are strictly 'Off Duty' or not working on today's day of the week.
      // 2. Include 'On Duty', 'In Surgery' (with OT delay indicator), and 'On Leave' (with covering duty doctor).
      const availableTodayDocs = allSortedDocs.filter((doc) => {
        const isScheduledToday = doc.availabilityDays && doc.availabilityDays.some(
          (d) => d.toLowerCase().startsWith(todayShort.toLowerCase()) || todayShort.toLowerCase().startsWith(d.toLowerCase())
        );
        // If doctor status is 'Off Duty', hide from active booking
        if (doc.status === 'Off Duty') return false;
        // If doctor availability days are specified and doctor is off today, hide from active booking
        if (doc.availabilityDays && doc.availabilityDays.length > 0 && !isScheduledToday && doc.status !== 'On Duty') return false;
        return true;
      });

      // Priority sort: On Duty (1st) -> In Surgery (2nd) -> On Leave (3rd)
      return availableTodayDocs.sort((a, b) => {
        const score = (d: typeof a) => (d.status === 'On Duty' ? 3 : d.status === 'In Surgery' ? 2 : d.status === 'On Leave' ? 1 : 0);
        return score(b) - score(a);
      });
    }

    // SEARCH QUERY ACTIVE: Show all matching doctors with their live status tags
    return allSortedDocs.filter((doc) =>
      doc.name.toLowerCase().includes(q) ||
      doc.specialization.toLowerCase().includes(q) ||
      doc.departmentName.toLowerCase().includes(q) ||
      (doc.qualification && doc.qualification.toLowerCase().includes(q))
    );
  }, [doctors, doctorSearchTerm, selectedDoctor, activeBranch]);

  const handleSelectPatient = (pat: typeof patients[0]) => {
    setSelectedPatientId(pat.id);
    setPatientSearchTerm(`${pat.name} [${pat.opNumber ? `${pat.opNumber} • ` : ''}${pat.uhid}]`);
    setIsPatientDropdownOpen(false);
  };

  const handleClearPatient = () => {
    setSelectedPatientId('');
    setPatientSearchTerm('');
    setIncludeHospitalFile(false);
    setPaymentMethod('Cash');
    setCashTendered('');
    setUtrNumber('');
    setUtrStatus('idle');
    setUtrFeedback('');
    setIsPatientDropdownOpen(false);
  };

  const handleSelectDoctor = (doc: typeof doctors[0]) => {
    setSelectedDoctorId(doc.id);
    setDoctorSearchTerm(`${doc.name} - ${doc.specialization}`);
    setIsDoctorDropdownOpen(false);
  };

  const handleClearDoctor = () => {
    setSelectedDoctorId('');
    setDoctorSearchTerm('');
    setIsDoctorDropdownOpen(false);
  };

  // Live duplicate Aadhar check
  const cleanAadharInput = formData.aadharNumber.replace(/[\s-]/g, '');
  const duplicateAadharPatient = cleanAadharInput.length >= 12
    ? patients.find((p) => p.aadharNumber && p.aadharNumber.replace(/[\s-]/g, '') === cleanAadharInput)
    : null;

  // Auto age calculator from DOB
  const handleDobChange = (dobValue: string) => {
    let calculatedAge = '';
    if (dobValue) {
      const birthDate = new Date(dobValue);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      calculatedAge = String(Math.max(0, age));
    }
    setFormData((prev) => ({
      ...prev,
      dob: dobValue,
      age: calculatedAge,
    }));
  };

  const handlePhoneChange = (val: string) => {
    // Digits only, maximum 10 digits
    const digitsOnly = val.replace(/\D/g, '').slice(0, 10);
    setFormData((prev) => ({ ...prev, phone: digitsOnly }));
    if (digitsOnly.length > 0 && digitsOnly.length < 10) {
      setPhoneError('Mobile phone number must be exactly 10 digits');
    } else {
      setPhoneError('');
    }
  };

  const handleAadharChange = (val: string) => {
    // 12 digits format with clean digits
    const digitsOnly = val.replace(/\D/g, '').slice(0, 12);
    // Format as XXXX XXXX XXXX
    const formatted = digitsOnly.replace(/(\d{4})(?=\d)/g, '$1 ');
    setFormData((prev) => ({ ...prev, aadharNumber: formatted }));

    if (digitsOnly.length > 0 && digitsOnly.length < 12) {
      setAadharError('Aadhar number must be exactly 12 digits');
    } else {
      setAadharError('');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      addToast('Missing Name', 'Please enter the patient’s full name', 'warning');
      return;
    }

    if (formData.phone.length !== 10) {
      setPhoneError('Please enter a valid 10-digit mobile number');
      addToast('Invalid Phone Number', 'Mobile phone number must be exactly 10 digits', 'warning');
      return;
    }

    if (cleanAadharInput.length > 0 && cleanAadharInput.length !== 12) {
      setAadharError('Please enter a valid 12-digit Aadhar number');
      addToast('Invalid Aadhar Number', 'Aadhar card number must be exactly 12 digits', 'warning');
      return;
    }

    if (duplicateAadharPatient) {
      addToast('Duplicate Aadhar Number', `Patient already exists with Aadhar ${formData.aadharNumber} under UHID: ${duplicateAadharPatient.uhid}`, 'error');
      return;
    }

    if (!formData.dob) {
      addToast('Missing Date of Birth', 'Please select the patient’s date of birth (DOB)', 'warning');
      return;
    }

    if (!formData.address.trim()) {
      addToast('Missing Address', 'Please enter residential address', 'warning');
      return;
    }

    addPatient({
      name: formData.name.trim(),
      phone: formData.phone,
      aadharNumber: formData.aadharNumber,
      dob: formData.dob,
      age: Number(formData.age) || 0,
      gender: formData.gender,
      address: formData.address.trim(),
      bloodGroup: formData.bloodGroup || 'Unknown',
      email: formData.email.trim() || undefined,
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
      phone: '',
      aadharNumber: '',
      dob: '',
      age: '',
      gender: 'Male',
      address: '',
      bloodGroup: 'B+ve',
      email: '',
      emergencyName: '',
      emergencyPhone: '',
      allergies: '',
    });

    setActiveTab('queue');
  };

  // Dynamically resolve exact patient, doctor, validity dates, bill number, and itemized ledger for receipt
  const getReceiptDetails = (apt: Appointment | null) => {
    if (!apt) return null;
    const pat = patients.find((p) => p.id === apt.patientId || p.uhid === apt.patientUhid || p.name === apt.patientName);
    const doc = doctors.find((d) => d.id === apt.doctorId || d.name === apt.doctorName);

    let uhid = apt.patientUhid || pat?.uhid || 'BRH14561';
    if (uhid.startsWith('pat-') || uhid.startsWith('pat_')) {
      uhid = pat?.uhid || `BRH${uhid.replace(/\D/g, '') || '14561'}`;
    }

    let opNumber = apt.opNumber || pat?.opNumber || `BRH26070001`;
    if (opNumber.startsWith('pat-') || opNumber.startsWith('OP-pat')) {
      opNumber = pat?.opNumber || `BRH26070001`;
    }
    if (opNumber.startsWith('OP-BRH')) {
      opNumber = opNumber.replace(/^OP-/, '');
    }
    const patientName = apt.patientName || pat?.name || 'Patient';
    const patientAge = apt.patientAge || pat?.age || 40;
    const patientGender = apt.patientGender || pat?.gender || 'Male';
    const patientPhone = apt.patientPhone || pat?.phone || '+91 98490 00000';
    const patientAddress = apt.patientAddress || pat?.address || 'Nellore, Andhra Pradesh';
    const doctorName = apt.doctorName || doc?.name || 'Consulting Specialist';
    const departmentName = apt.departmentName || doc?.departmentName || 'General OPD';
    const appointmentDate = apt.appointmentDate || '2026-07-24';
    const appointmentTime = apt.appointmentTime || '10:00 AM';

    // Compute Doctor-Specific 15-Day Return Validity dynamically based on the appointment date
    let validUntil = apt.validUntil;
    if (!validUntil) {
      try {
        const d = new Date(appointmentDate);
        d.setDate(d.getDate() + 15);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        validUntil = `${String(d.getDate()).padStart(2, '0')}-${months[d.getMonth()]}-${d.getFullYear()}`;
      } catch {
        validUntil = '15 Days from Visit';
      }
    }

    const consBillNo =
      apt.consBillNo ||
      apt.billNo ||
      `BRH/OPB/2026/${String(apt.tokenNumber ? apt.tokenNumber.replace(/\D/g, '') : apt.id.slice(-4)).padStart(4, '0')}`;
    const billNo = consBillNo;

    const hasHospitalFile = Boolean(apt.hasHospitalFile || (apt.registrationCharges && apt.registrationCharges > 0));
    const isFollowUp = Boolean(apt.isFollowUp || (apt.fee === 0 && !hasHospitalFile));
    const docStandardFee = doc ? (apt.model === 'Premium Slot' ? doc.premiumFee : doc.consultationFee) : 300;
    const regCharge = hasHospitalFile ? 30 : 0;
    const consultCharge = isFollowUp ? 0 : Math.max(0, apt.fee - regCharge);
    const totalFee = apt.fee;
    const grossFee = isFollowUp ? docStandardFee + regCharge : totalFee;
    const waiverFee = isFollowUp ? docStandardFee : 0;

    const creatorName = apt.createdByName || currentUser?.name || 'Priyanka M';
    const creatorRole = apt.createdByRole || currentUser?.roleTitle || 'Front Desk & Patient Registrar';

    return {
      uhid,
      opNumber,
      patientName,
      patientAge,
      patientGender,
      patientPhone,
      patientAddress,
      doctorName,
      departmentName,
      appointmentDate,
      appointmentTime,
      validUntil,
      consBillNo,
      billNo,
      hasHospitalFile,
      isFollowUp,
      docStandardFee,
      regCharge,
      consultCharge,
      totalFee,
      grossFee,
      waiverFee,
      creatorName,
      creatorRole,
      paymentMethod: apt.paymentMethod || (totalFee === 0 ? 'Free Follow-up' : 'Cash'),
      utrNumber: apt.utrNumber,
      tokenNumber: apt.tokenNumber,
      tokenModel: apt.model,
      reassignedFromDoctor: apt.reassignedFromDoctor,
      reassignedAt: apt.reassignedAt,
      differentialFeePaid: apt.differentialFeePaid,
    };
  };

  const handleIssueToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient || !selectedDoctor) return;

    const validDate = new Date('2026-07-24');
    validDate.setDate(validDate.getDate() + 15);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dynamicValidUntil = `${String(validDate.getDate()).padStart(2, '0')}-${months[validDate.getMonth()]}-${validDate.getFullYear()}`;
    const dynamicConsBillNo = `BRH/OPB/2026/${String(appointments.length + 1).padStart(4, '0')}`;
    const dynamicBillNo = dynamicConsBillNo;

    let maxSeq = 0;
    appointments.forEach((a) => {
      if (a.tokenNumber) {
        const match = a.tokenNumber.match(/(\d+)$/);
        if (match) {
          const num = parseInt(match[1], 10);
          if (!isNaN(num) && num > maxSeq) {
            maxSeq = num;
          }
        }
      }
    });
    if (maxSeq === 0) maxSeq = appointments.length;
    const nextSeq = String(maxSeq + 1).padStart(2, '0');
    const deptPrefix = getDepartmentPrefix(selectedDoctor.departmentName);
    const dynamicTokenNumber = `${deptPrefix}-${nextSeq}`;

    // Auto-capture UTR from counter entry, exact dynamic UPI QR code, or POS Card Swipe
    let finalUtr = utrNumber?.trim();
    if (paymentMethod === 'Online UPI') {
      if (!finalUtr) {
        finalUtr = `UPI${Date.now().toString().slice(-8)}${Math.floor(1000 + Math.random() * 9000)}`;
      }
      addUnverifiedUTR({
        utrNumber: finalUtr,
        patientName: selectedPatient.name,
        patientUhid: selectedPatient.uhid,
        doctorName: selectedDoctor.name,
        amount: totalPayableFee,
        paymentMode: 'Online UPI',
        date: '2026-07-24',
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        notes: `OPD Token #${dynamicTokenNumber} • Dynamic Counter UPI QR Payment • Recorded by ${currentUser?.name || 'Priyanka M'}`,
      });
    } else if (paymentMethod === 'Card') {
      const auth = cardDetails.authCode || `AUTH-${Date.now().toString().slice(-6)}`;
      const formattedCardType = `${cardDetails.cardNetwork} ${cardDetails.cardType}`;
      const last4 = cardDetails.last4Digits || '4589';
      const cardRef = `${formattedCardType} (•••• ${last4}) • Auth: ${auth} • TID: ${cardDetails.terminalId}`;
      finalUtr = cardRef;
      addUnverifiedUTR({
        utrNumber: auth.startsWith('AUTH') || auth.startsWith('CARD') ? auth : `CARD-${auth}`,
        patientName: selectedPatient.name,
        patientUhid: selectedPatient.uhid,
        doctorName: selectedDoctor.name,
        amount: totalPayableFee,
        paymentMode: 'Card / POS',
        cardType: formattedCardType,
        cardLast4: last4,
        posTerminalId: cardDetails.terminalId,
        authCode: auth,
        date: '2026-07-24',
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        notes: `OPD Token #${dynamicTokenNumber} • POS Machine Slip • ${cardRef} • Recorded by ${currentUser?.name || 'Priyanka M'}`,
      });
    }

    const receiptData: Appointment = {
      id: `apt-${Date.now()}`,
      tokenNumber: dynamicTokenNumber,
      opNumber: selectedPatient.opNumber || nextOPNumber,
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      patientUhid: selectedPatient.uhid,
      patientPhone: selectedPatient.phone,
      patientAge: selectedPatient.age,
      patientGender: selectedPatient.gender,
      patientAddress: selectedPatient.address || 'Nellore, Andhra Pradesh',
      doctorId: selectedDoctor.id,
      doctorName: selectedDoctor.name,
      departmentName: selectedDoctor.departmentName,
      appointmentDate: '2026-07-24',
      appointmentTime: timeSlot,
      model: appointmentModel,
      fee: totalPayableFee,
      hasHospitalFile: includeHospitalFile,
      registrationCharges: registrationChargesFee,
      isFollowUp: validityStatus?.isValid || false,
      validUntil: dynamicValidUntil,
      consBillNo: dynamicConsBillNo,
      billNo: dynamicBillNo,
      paymentMethod,
      utrNumber: (paymentMethod === 'Online UPI' || paymentMethod === 'Card') ? finalUtr : undefined,
      createdByName: currentUser?.name || 'Priyanka M',
      createdByRole: currentUser?.roleTitle || 'Front Desk & Patient Registrar',
      status: 'Checked-In',
      paymentStatus: totalPayableFee === 0 ? 'Waived' : 'Paid',
      whatsappSent: true,
      smsSent: true,
    };

    addAppointment(receiptData);
    setSelectedReceiptApt(receiptData);
    setShowReceiptModal(true);

    handleClearPatient();
  };

  // Filter & Sort States for Patient Queue (Branch, Doctor, Date, Time Slot, Type, Payment, Token)
  const [selectedQueueBranchId, setSelectedQueueBranchId] = useState('all');
  const [selectedQueueDoctorId, setSelectedQueueDoctorId] = useState('all');
  const [selectedQueueDept, setSelectedQueueDept] = useState('all');
  const [selectedQueueDate, setSelectedQueueDate] = useState('');
  const [selectedQueueTimeSlot, setSelectedQueueTimeSlot] = useState('all');
  const [selectedQueueType, setSelectedQueueType] = useState('all');
  const [selectedQueuePaymentStatus, setSelectedQueuePaymentStatus] = useState('all');
  const [selectedQueueTokenStatus, setSelectedQueueTokenStatus] = useState('all');
  const [queueSourceFilter, setQueueSourceFilter] = useState<'all' | 'website' | 'reception'>('all');
  const [queueSortBy, setQueueSortBy] = useState<'time' | 'token' | 'patient' | 'payment' | 'branch'>('time');
  const [queueSortOrder, setQueueSortOrder] = useState<'asc' | 'desc'>('asc');

  const filteredQueue = useMemo(() => {
    const list = appointments.filter((apt) => {
      // 1. Branch
      const matchesBranch =
        selectedQueueBranchId === 'all' ||
        apt.branchId === selectedQueueBranchId ||
        (!apt.branchId && selectedQueueBranchId === 'b-1');

      // 2. Doctor
      const matchesDoctor = selectedQueueDoctorId === 'all' || apt.doctorId === selectedQueueDoctorId;

      // 3. Dept
      const matchesDept =
        selectedQueueDept === 'all' ||
        (apt.departmentName && apt.departmentName.toLowerCase() === selectedQueueDept.toLowerCase());

      // 4. Date
      const matchesDate = !selectedQueueDate || apt.appointmentDate === selectedQueueDate;

      // 5. Time Slot
      const matchesTimeSlot =
        selectedQueueTimeSlot === 'all' ||
        (apt.appointmentTime && apt.appointmentTime.toLowerCase().includes(selectedQueueTimeSlot.toLowerCase()));

      // 6. Appointment Type
      const matchesType =
        selectedQueueType === 'all' ||
        (selectedQueueType === 'Follow-Up' && apt.isFollowUp) ||
        (selectedQueueType === 'New Consultation' && !apt.isFollowUp) ||
        (selectedQueueType === 'Premium Slot' && apt.model === 'Premium Slot') ||
        (selectedQueueType === 'Normal Queue' && apt.model === 'Normal Queue');

      // 7. Payment Status
      const matchesPayment =
        selectedQueuePaymentStatus === 'all' ||
        (selectedQueuePaymentStatus === 'Paid' && apt.paymentStatus === 'Paid') ||
        (selectedQueuePaymentStatus === 'Pending Verification' && apt.paymentStatus === 'Pending Verification') ||
        (selectedQueuePaymentStatus === 'Pending' && apt.paymentStatus === 'Pending') ||
        (selectedQueuePaymentStatus === 'Waived' && (apt.paymentStatus === 'Waived' || apt.fee === 0));

      // 8. Token Status
      const matchesToken =
        selectedQueueTokenStatus === 'all' ||
        (selectedQueueTokenStatus === 'Assigned' && Boolean(apt.tokenNumber)) ||
        (selectedQueueTokenStatus === 'Pending' && !apt.tokenNumber);

      // 9. Source
      const isWeb =
        apt.createdByName?.toLowerCase().includes('website') ||
        apt.createdByRole?.toLowerCase().includes('portal') ||
        apt.createdByRole?.toLowerCase().includes('web');
      const matchesSource =
        queueSourceFilter === 'all'
          ? true
          : queueSourceFilter === 'website'
          ? isWeb
          : !isWeb;

      // 10. Search
      const matchesSearch =
        apt.patientName.toLowerCase().includes(searchFilter.toLowerCase()) ||
        (apt.tokenNumber && apt.tokenNumber.toLowerCase().includes(searchFilter.toLowerCase())) ||
        apt.doctorName.toLowerCase().includes(searchFilter.toLowerCase()) ||
        (apt.branchName && apt.branchName.toLowerCase().includes(searchFilter.toLowerCase())) ||
        (apt.patientUhid && apt.patientUhid.toLowerCase().includes(searchFilter.toLowerCase()));

      return (
        matchesBranch &&
        matchesDoctor &&
        matchesDept &&
        matchesDate &&
        matchesTimeSlot &&
        matchesType &&
        matchesPayment &&
        matchesToken &&
        matchesSource &&
        matchesSearch
      );
    });

    return list.sort((a, b) => {
      let comparison = 0;
      if (queueSortBy === 'time') {
        comparison = (a.appointmentTime || '').localeCompare(b.appointmentTime || '');
      } else if (queueSortBy === 'token') {
        comparison = (a.tokenNumber || 'ZZZ').localeCompare(b.tokenNumber || 'ZZZ');
      } else if (queueSortBy === 'patient') {
        comparison = a.patientName.localeCompare(b.patientName);
      } else if (queueSortBy === 'payment') {
        comparison = (a.paymentStatus || '').localeCompare(b.paymentStatus || '');
      } else if (queueSortBy === 'branch') {
        comparison = (a.branchName || '').localeCompare(b.branchName || '');
      }
      return queueSortOrder === 'asc' ? comparison : -comparison;
    });
  }, [
    appointments,
    selectedQueueBranchId,
    selectedQueueDoctorId,
    selectedQueueDept,
    selectedQueueDate,
    selectedQueueTimeSlot,
    selectedQueueType,
    selectedQueuePaymentStatus,
    selectedQueueTokenStatus,
    queueSourceFilter,
    searchFilter,
    queueSortBy,
    queueSortOrder,
  ]);

  // Global Keyboard Shortcuts (F10 = Generate Bill / Print Slip, Ctrl+G = Approve Doctor Transfer)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Ctrl + G -> Approve Doctor Transfer
      if ((e.ctrlKey || e.metaKey) && (e.key === 'g' || e.key === 'G')) {
        e.preventDefault();
        if (showTransferModal && selectedTransferApt && targetTransferDoctor) {
          handleConfirmDoctorTransfer(e as unknown as React.FormEvent);
          addToast('Shortcut Triggered', `Doctor transfer approved via [Ctrl+G] to ${targetTransferDoctor.name}`, 'info');
        } else if (!showTransferModal && filteredQueue.length > 0) {
          handleOpenTransferModal(filteredQueue[0]);
          addToast('Transfer Mode Opened', 'Doctor transfer modal opened via [Ctrl+G]. Select doctor and press [Ctrl+G] to approve.', 'info');
        }
      }

      // 2. F10 -> Generate Bill / Print Slip
      if (e.key === 'F10') {
        e.preventDefault();
        if (showReceiptModal || showRefundSlipModal) {
          window.print();
          addToast('Printing Receipt', 'Bill print triggered via [F10]', 'info');
        } else if (selectedPatient && selectedDoctor) {
          handleIssueToken(e as unknown as React.FormEvent);
          addToast('OP Bill Generated', 'Token and OP bill generated via [F10]', 'success');
        } else {
          addToast('Generate Bill [F10]', 'Please select a Patient and Doctor first from the left panel to generate bill.', 'warning');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    showTransferModal,
    selectedTransferApt,
    targetTransferDoctor,
    showReceiptModal,
    showRefundSlipModal,
    selectedPatient,
    selectedDoctor,
    filteredQueue,
    handleConfirmDoctorTransfer,
    handleIssueToken,
    handleOpenTransferModal,
    addToast,
  ]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              Central Reception Desk
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] bg-slate-950 border border-slate-700 text-slate-300">
              <span className="text-cyan-400 font-bold">⚡ Quick Keys:</span>
              <kbd className="px-1.5 py-0.2 bg-slate-800 border border-slate-600 rounded text-[10px] font-mono font-bold text-cyan-300">F10</kbd>
              <span className="text-slate-400">Generate Bill</span>
              <span className="text-slate-600">•</span>
              <kbd className="px-1.5 py-0.2 bg-slate-800 border border-slate-600 rounded text-[10px] font-mono font-bold text-amber-300">Ctrl+G</kbd>
              <span className="text-slate-400">Approve Transfer</span>
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-white mt-1">Patient Check-in & Token Generation</h2>
          <p className="text-xs text-slate-400">
            Issue instant tokens, perform returning UHID lookup, and manage walk-in queues.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center p-1 bg-slate-950 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'queue' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Today's Queue ({appointments.length})
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'register' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            + New Walk-in Registration
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'queue' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick OPD Token Generator Panel */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5 h-fit backdrop-blur-sm">
            {/* Form Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-600/30">
                  <Ticket className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100 tracking-tight">
                    Quick OPD Token Generator
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Walk-in Patient Consultation & Billing
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                Step 1 of 2
              </span>
            </div>

            <form onSubmit={handleIssueToken} className="space-y-4">
              {/* Section 1: Patient Selection */}
              <div className="space-y-1.5" ref={patientDropdownRef}>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Select Patient</span>
                    <span className="text-rose-400">*</span>
                  </label>
                  {selectedPatient && (
                    <span className="text-[10px] font-mono text-cyan-400 font-semibold">
                      UHID: {selectedPatient.uhid}
                    </span>
                  )}
                </div>

                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by Name, UHID, OP No, Phone..."
                    value={patientSearchTerm}
                    onChange={(e) => {
                      setPatientSearchTerm(e.target.value);
                      if (selectedPatientId) setSelectedPatientId('');
                      setIsPatientDropdownOpen(true);
                    }}
                    onFocus={() => setIsPatientDropdownOpen(true)}
                    className={`w-full bg-slate-950/80 border rounded-xl pl-3.5 pr-9 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none transition ${
                      selectedPatientId
                        ? 'border-cyan-500/60 bg-cyan-950/20 font-semibold text-cyan-200'
                        : 'border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30'
                    }`}
                  />
                  {selectedPatientId || patientSearchTerm ? (
                    <button
                      type="button"
                      onClick={handleClearPatient}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition"
                      title="Clear Selection"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsPatientDropdownOpen((prev) => !prev)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-300 transition"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Patient Dropdown Menu */}
                {isPatientDropdownOpen && (
                  <div className="absolute z-50 left-0 right-0 mt-1.5 max-h-64 overflow-y-auto bg-slate-900 border border-cyan-500/40 rounded-xl shadow-2xl shadow-black ring-1 ring-black/50 divide-y divide-slate-800/80">
                    <div className="sticky top-0 bg-slate-950/95 backdrop-blur-sm px-3.5 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex justify-between items-center border-b border-slate-800 z-10">
                      <span>Select Patient ({filteredPatients.length} Found)</span>
                      <span className="text-cyan-400">15-Day Policy</span>
                    </div>

                    {/* Quick Global Cross-Branch Match Banner */}
                    {globalUHIDMatch && globalUHIDMatch.found && !globalUHIDMatch.isCurrentBranch && globalUHIDMatch.patient && (
                      <div
                        onClick={() => handleSelectPatient(globalUHIDMatch.patient!)}
                        className="p-3 bg-purple-950/60 hover:bg-purple-900/60 border-b border-purple-500/40 cursor-pointer transition flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-0.5">
                          <div className="font-bold text-purple-200 flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-purple-400" />
                            <span>🌐 Global Match: {globalUHIDMatch.patient.name}</span>
                            <span className="font-mono text-[10px] text-cyan-300">
                              [{globalUHIDMatch.patient.uhid}]
                            </span>
                          </div>
                          <div className="text-[11px] text-purple-300">
                            Registered at: <strong>{globalUHIDMatch.homeBranchName}</strong> • Click to consult at {activeBranch.name}
                          </div>
                        </div>
                        <span className="px-2 py-1 rounded-lg bg-purple-600 text-white font-bold text-[10px] shrink-0">
                          Consult Here →
                        </span>
                      </div>
                    )}
                    {filteredPatients.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400 space-y-2">
                        <div>No matching patient records found.</div>
                        <button
                          type="button"
                          onClick={() => {
                            setIsPatientDropdownOpen(false);
                            setActiveTab('register');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 text-[11px] font-bold hover:bg-cyan-600/30 transition"
                        >
                          + Register New Walk-in Patient
                        </button>
                      </div>
                    ) : (
                      filteredPatients.map((pat) => {
                        const patValidity = checkOPValidity(pat.lastVisitDate, pat.totalVisits);
                        return (
                          <button
                            key={pat.id}
                            type="button"
                            onClick={() => handleSelectPatient(pat)}
                            className={`w-full text-left p-3 hover:bg-cyan-500/10 transition flex items-center justify-between gap-3 ${
                              selectedPatientId === pat.id ? 'bg-cyan-500/15 ring-1 ring-inset ring-cyan-500/30' : ''
                            }`}
                          >
                            <div className="space-y-0.5">
                              <div className="text-xs font-bold text-slate-100 flex items-center gap-2 flex-wrap">
                                <span>{pat.name}</span>
                                {pat.opNumber && (
                                  <span className="text-[10px] font-mono font-bold text-cyan-300 bg-cyan-500/20 border border-cyan-500/40 px-1.5 py-0.2 rounded">
                                    {pat.opNumber}
                                  </span>
                                )}
                                {pat.primaryBranchId && pat.primaryBranchId !== activeBranch.id ? (
                                  <span className="text-[9px] font-bold text-purple-300 bg-purple-500/20 border border-purple-500/30 px-1.5 py-0.2 rounded flex items-center gap-0.5">
                                    <Building2 className="w-2.5 h-2.5" />
                                    {pat.registeredBranchName || 'Other Branch'}
                                  </span>
                                ) : (
                                  <span className="text-[9px] font-bold text-slate-400 bg-slate-800 px-1.5 py-0.2 rounded">
                                    {pat.uhid}
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
                                <span>📞 {pat.phone}</span>
                                <span>•</span>
                                <span>{pat.gender}, {pat.age} yrs</span>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              {patValidity.isValid ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                                  <CheckCircle2 className="w-3 h-3" />
                                  15-Day Free OP
                                </span>
                              ) : patValidity.isNewPatient ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full">
                                  New Patient
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-400/90 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                                  OP Expired
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                )}

                {/* Cross-Branch Inter-Hospital Consultation Alert Banner */}
                {selectedPatient && selectedPatient.primaryBranchId && selectedPatient.primaryBranchId !== activeBranch.id && (
                  <div className="p-3 bg-purple-950/40 border border-purple-500/40 rounded-xl space-y-1 text-xs animate-in fade-in">
                    <div className="flex items-center justify-between text-purple-300 font-bold">
                      <span className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-purple-400" />
                        <span>Visiting Patient from {selectedPatient.registeredBranchName || 'Another Branch'}</span>
                      </span>
                      <span className="font-mono text-[10px] text-cyan-400">
                        Universal UHID: {selectedPatient.uhid}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Universal UHID recognized across all branches. Complete EHR, allergies, past diagnoses & prescriptions are active and will be linked to this consultation with <strong>{selectedDoctor?.name || `any specialist at ${activeBranch.name}`}</strong>.
                    </p>
                  </div>
                )}
              </div>

              {/* Section 2: Doctor Selection */}
              <div className="space-y-1.5" ref={doctorDropdownRef}>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Stethoscope className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Attending Specialist</span>
                    <span className="text-rose-400">*</span>
                  </label>
                  {selectedDoctor && (
                    <span className="text-[10px] font-semibold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                      {selectedDoctor.departmentName}
                    </span>
                  )}
                </div>

                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search doctor by Name, Department, Speciality..."
                    value={doctorSearchTerm}
                    onChange={(e) => {
                      const val = e.target.value;
                      setDoctorSearchTerm(val);
                      const match = doctors.find(
                        (d) =>
                          d.name.toLowerCase().includes(val.toLowerCase()) ||
                          d.specialization.toLowerCase().includes(val.toLowerCase())
                      );
                      if (match) {
                        setSelectedDoctorId(match.id);
                      }
                      setIsDoctorDropdownOpen(true);
                    }}
                    onFocus={() => setIsDoctorDropdownOpen(true)}
                    className={`w-full bg-slate-950/80 border rounded-xl pl-3.5 pr-9 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none transition ${
                      selectedDoctorId
                        ? 'border-cyan-500/60 bg-cyan-950/20 font-semibold text-cyan-200'
                        : 'border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30'
                    }`}
                  />
                  {selectedDoctorId || doctorSearchTerm ? (
                    <button
                      type="button"
                      onClick={handleClearDoctor}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition"
                      title="Clear Selection"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsDoctorDropdownOpen((prev) => !prev)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-300 transition"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Doctor Dropdown Menu */}
                {isDoctorDropdownOpen && (
                  <div className="absolute z-50 left-0 right-0 mt-1.5 max-h-64 overflow-y-auto bg-slate-900 border border-cyan-500/40 rounded-xl shadow-2xl shadow-black ring-1 ring-black/50 divide-y divide-slate-800/80">
                    <div className="sticky top-0 bg-slate-950/95 backdrop-blur-sm px-3.5 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex justify-between items-center border-b border-slate-800 z-10">
                      <span>Select Doctor ({filteredDoctors.length} Available)</span>
                      <span className="text-cyan-400">Consultation Fee</span>
                    </div>
                    {filteredDoctors.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400">
                        No matching on-duty or available doctors found for today's schedule.
                      </div>
                    ) : (
                      filteredDoctors.map((doc) => {
                        const coveringDoc = doc.status === 'On Leave' ? getCoveringDutyDoctor(doc) : null;

                        return (
                          <button
                            key={doc.id}
                            type="button"
                            onClick={() => handleSelectDoctor(doc)}
                            className={`w-full text-left p-3 hover:bg-cyan-500/10 transition flex items-center justify-between gap-3 ${
                              selectedDoctorId === doc.id ? 'bg-cyan-500/15 ring-1 ring-inset ring-cyan-500/30' : ''
                            } ${doc.status === 'On Leave' ? 'bg-amber-500/5' : doc.status === 'In Surgery' ? 'bg-purple-500/5' : ''}`}
                          >
                            <div className="space-y-1">
                              <div className="text-xs font-bold text-slate-100 flex items-center gap-2 flex-wrap">
                                <span>{doc.name}</span>
                                <span className="text-[10px] font-semibold text-cyan-400 bg-cyan-500/15 border border-cyan-500/30 px-1.5 py-0.2 rounded">
                                  {doc.departmentName}
                                </span>
                                {doc.branchName && (
                                  <span className="text-[9px] font-medium text-slate-400 bg-slate-800 border border-slate-700 px-1.5 py-0.2 rounded">
                                    {doc.branchName}
                                  </span>
                                )}
                                {/* Doctor Status Pill */}
                                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border flex items-center gap-1 ${
                                  doc.status === 'On Duty'
                                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                    : doc.status === 'In Surgery'
                                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                                    : doc.status === 'On Leave'
                                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                    : 'bg-slate-800 text-slate-400 border-slate-700'
                                }`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${
                                    doc.status === 'On Duty' ? 'bg-emerald-400' : doc.status === 'In Surgery' ? 'bg-purple-400' : doc.status === 'On Leave' ? 'bg-amber-400' : 'bg-slate-500'
                                  }`} />
                                  {doc.status}
                                </span>
                              </div>

                              <div className="text-[11px] text-slate-400 flex items-center gap-2 flex-wrap">
                                <span>{doc.specialization}</span>
                                <span>•</span>
                                <span className="font-mono text-cyan-300">🕒 {doc.workingHours}</span>
                                <span>•</span>
                                <span className="text-[10px] text-slate-500">
                                  Days: {doc.availabilityDays?.join(', ')}
                                </span>
                              </div>

                              {/* On Leave Replacement Doctor Notice */}
                              {doc.status === 'On Leave' && coveringDoc && (
                                <div className="text-[10px] font-semibold text-amber-300 flex items-center gap-1 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-md w-fit">
                                  <ArrowRightLeft className="w-3 h-3 text-amber-400" />
                                  <span>Covering Duty Doctor: {coveringDoc.name} ({coveringDoc.departmentName})</span>
                                </div>
                              )}

                              {/* Surgery Delay Notice */}
                              {doc.status === 'In Surgery' && (
                                <div className="text-[10px] font-semibold text-purple-300 flex items-center gap-1 bg-purple-500/15 border border-purple-500/30 px-2 py-0.5 rounded-md w-fit">
                                  <Activity className="w-3 h-3 text-purple-400" />
                                  <span>In Surgery (OT) • Consultations queued post-operation</span>
                                </div>
                              )}
                            </div>

                            <div className="text-right shrink-0">
                              <span className="font-mono font-bold text-cyan-300 text-xs block">
                                ₹{doc.consultationFee}
                              </span>
                              <span className="text-[9px] text-slate-400 block">
                                Premium: ₹{doc.premiumFee}
                              </span>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                )}

                {/* Selected Doctor Status Alerts & Smart Replacement Router */}
                {selectedDoctor && selectedDoctor.status === 'On Leave' && (() => {
                  const coveringDoc = getCoveringDutyDoctor(selectedDoctor);
                  return (
                    <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/40 text-xs space-y-2 animate-in fade-in">
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-amber-300 flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                          <span>Dr. {selectedDoctor.name} is on Approved Leave today</span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          Duty Replacement Active
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300">
                        Assigned Covering Duty Doctor: <strong className="text-white">{coveringDoc?.name}</strong> ({coveringDoc?.departmentName} • {coveringDoc?.workingHours}).
                      </p>
                      {coveringDoc && (
                        <button
                          type="button"
                          onClick={() => handleSelectDoctor(coveringDoc)}
                          className="w-full py-1.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow transition active:scale-95"
                        >
                          <ArrowRightLeft className="w-3.5 h-3.5" />
                          <span>Route Token to Replaced Duty Doctor: {coveringDoc.name}</span>
                        </button>
                      )}
                    </div>
                  );
                })()}

                {selectedDoctor && selectedDoctor.status === 'In Surgery' && (
                  <div className="p-3 rounded-xl bg-purple-500/15 border border-purple-500/40 text-xs flex items-center justify-between gap-2 animate-in fade-in">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-purple-400 shrink-0" />
                      <div>
                        <div className="font-bold text-purple-300">Dr. {selectedDoctor.name} is currently in Surgery (OT)</div>
                        <div className="text-[11px] text-slate-300">Token will be queued according to weekly OT schedule. Working Hours: {selectedDoctor.workingHours}.</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 shrink-0">
                      OT In Progress
                    </span>
                  </div>
                )}

                {/* Quick 1-Click Specialist Chips */}
                {!selectedDoctorId && (
                  <div className="pt-1">
                    <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Quick Select Available Duty Doctor:</div>
                    <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                      {filteredDoctors.slice(0, 6).map((doc) => (
                        <button
                          key={doc.id}
                          type="button"
                          onClick={() => handleSelectDoctor(doc)}
                          className={`px-2 py-0.8 rounded-lg border text-[10px] font-medium transition flex items-center gap-1 ${
                            doc.status === 'In Surgery'
                              ? 'bg-purple-950/40 border-purple-500/30 text-purple-300 hover:border-purple-400'
                              : doc.status === 'On Leave'
                              ? 'bg-amber-950/40 border-amber-500/30 text-amber-300 hover:border-amber-400'
                              : 'bg-slate-950 hover:bg-cyan-950/40 border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-200'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            doc.status === 'On Duty' ? 'bg-emerald-400' : doc.status === 'In Surgery' ? 'bg-purple-400' : 'bg-amber-400'
                          }`} />
                          <span>{doc.name} ({doc.departmentName.split(' ')[0]})</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Doctor-Specific 15-Day Validity Alert Ribbon */}
              {selectedPatient && (
                <div
                  className={`p-3 rounded-xl border text-xs transition animate-in fade-in ${
                    validityStatus?.isValid
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : validityStatus && !validityStatus.isValid && !validityStatus.isNewPatient
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                      : 'bg-blue-500/10 border-blue-500/30 text-blue-300'
                  }`}
                >
                  {selectedDoctor && validityStatus ? (
                    <div className="space-y-1">
                      <div className="font-bold flex items-center gap-2">
                        {validityStatus.isValid ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : validityStatus.isNewPatient ? (
                          <UserPlus className="w-4 h-4 text-cyan-400 shrink-0" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                        )}
                        <span>
                          {validityStatus.isValid
                            ? `15-Day Free Follow-up Active for ${selectedDoctor.name}`
                            : validityStatus.isNewPatient
                            ? `New Consultation with ${selectedDoctor.name}`
                            : `15-Day Validity for ${selectedDoctor.name} Expired`}
                        </span>
                      </div>
                      <p className="text-[11px] opacity-85 leading-relaxed pl-6">
                        {validityStatus.isValid
                          ? `Last consult: ${validityStatus.lastVisitDate} • Return valid till ${validityStatus.endDateStr} • Fee Waived (₹0)`
                          : validityStatus.isNewPatient
                          ? `Validity with another doctor does not apply. A separate 15-day validity will begin for ${selectedDoctor.name}.`
                          : `Previous visit was on ${validityStatus.lastVisitDate}. Standard consultation fee applies.`}
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-cyan-300">
                      <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span className="text-[11px]">
                        Select a doctor above to check 15-day return validity for {selectedPatient.name}.
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Section 3: Appointment Model (Normal vs Premium) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">
                  Consultation Queue Priority
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setAppointmentModel('Normal Queue')}
                    className={`p-2.5 rounded-xl text-left border transition ${
                      appointmentModel === 'Normal Queue'
                        ? 'bg-cyan-500/15 border-cyan-500 text-cyan-200 ring-1 ring-cyan-500/30'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold">Normal Walk-in</div>
                    <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                      Fee: ₹{selectedDoctor?.consultationFee || 300}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAppointmentModel('Premium Slot')}
                    className={`p-2.5 rounded-xl text-left border transition ${
                      appointmentModel === 'Premium Slot'
                        ? 'bg-purple-500/15 border-purple-500 text-purple-200 ring-1 ring-purple-500/30'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold flex items-center justify-between">
                      <span>⭐ Premium Priority</span>
                      <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.2 rounded">VIP</span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                      Fee: ₹{selectedDoctor?.premiumFee || (selectedDoctor ? selectedDoctor.consultationFee + 200 : 500)}
                    </div>
                  </button>
                </div>
              </div>

              {/* Time Slot Picker with Live Online Booking & Capacity Link */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Consultation Time Slot (Live Capacity)</span>
                  </label>
                  <span className="text-[10px] text-slate-400">
                    {appointmentModel === 'Premium Slot' ? '⭐ Premium Priority Slot Active' : 'Normal Slot (Max 5/slot)'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    '09:00 AM',
                    '09:30 AM',
                    '10:00 AM',
                    '10:30 AM',
                    '11:00 AM',
                    '11:30 AM',
                    '12:00 PM',
                    '04:00 PM',
                  ].map((slot) => {
                    const bookedCount = selectedDoctor
                      ? appointments.filter(
                          (a) =>
                            a.doctorId === selectedDoctor.id &&
                            a.appointmentDate === '2026-07-24' &&
                            a.appointmentTime === slot &&
                            a.status !== 'Cancelled'
                        ).length
                      : 0;

                    const isFull = bookedCount >= 5;
                    const isSelected = timeSlot === slot;

                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => {
                          setTimeSlot(slot);
                          if (isFull && appointmentModel === 'Normal Queue') {
                            setAppointmentModel('Premium Slot');
                            addToast(
                              'Normal Slot Full',
                              `Slot ${slot} has reached capacity (${bookedCount}/5). Configured Premium/Priority Slot activated.`,
                              'info'
                            );
                          }
                        }}
                        className={`p-2 rounded-xl border text-center transition flex flex-col items-center justify-center gap-0.5 ${
                          isSelected
                            ? appointmentModel === 'Premium Slot'
                              ? 'bg-purple-600 text-white font-black border-purple-400 shadow-md shadow-purple-900/50'
                              : 'bg-cyan-500 text-slate-950 font-black border-cyan-400 shadow-md shadow-cyan-900/50'
                            : isFull
                            ? 'bg-rose-950/20 border-rose-500/30 text-rose-300 hover:bg-rose-950/40'
                            : bookedCount >= 3
                            ? 'bg-amber-950/20 border-amber-500/30 text-amber-300 hover:bg-amber-950/40'
                            : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <span className="font-mono text-xs">{slot}</span>
                        <span className="text-[9px] font-bold">
                          {isFull
                            ? `🔴 Full (${bookedCount}/5)`
                            : bookedCount > 0
                            ? `🟡 ${bookedCount} Booked`
                            : '🟢 Available'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section 4: Hospital File Registration (REG01) */}
              <div
                className={`p-3.5 rounded-xl border transition cursor-pointer ${
                  includeHospitalFile
                    ? 'bg-amber-500/10 border-amber-500/40 ring-1 ring-amber-500/30'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
                onClick={() => setIncludeHospitalFile((prev) => !prev)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={includeHospitalFile}
                      onChange={(e) => {
                        e.stopPropagation();
                        setIncludeHospitalFile(e.target.checked);
                      }}
                      className="mt-0.5 h-4 w-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500/40 focus:ring-offset-slate-950 accent-cyan-500 cursor-pointer"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-100 flex items-center gap-2 flex-wrap">
                        <FileText className="w-3.5 h-3.5 text-amber-400" />
                        <span>Registration Charges (Hospital Case File)</span>
                        <span className="font-mono text-[10px] font-bold text-amber-300 bg-amber-500/20 border border-amber-500/40 px-1.5 py-0.2 rounded">
                          {REGISTRATION_SERVICE_CODE}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Physical case file folder for new registrations or patients without previous file.
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-mono font-bold text-amber-300 text-sm block">
                      +₹{REGISTRATION_FILE_CHARGE}
                    </span>
                    <span className="text-[9px] text-slate-400 font-medium block">
                      {includeHospitalFile ? 'Added' : 'Optional'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 5: Dynamic Fee Summary Ledger */}
              <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">Doctor Consultation Fee:</span>
                  <span className="font-mono font-bold text-slate-200">
                    ₹{doctorConsultationFee}
                  </span>
                </div>

                {validityStatus?.isValid && (
                  <div className="flex justify-between items-center text-[11px] text-emerald-400 pt-1 border-t border-slate-800/80">
                    <span className="flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      15-Day Free Follow-up Waiver:
                    </span>
                    <span className="font-mono font-bold">-₹{doctorConsultationFee}</span>
                  </div>
                )}

                {includeHospitalFile && (
                  <div className="flex justify-between items-center text-[11px] text-amber-300 pt-1 border-t border-slate-800/80">
                    <span className="flex items-center gap-1.5 font-semibold">
                      <FileText className="w-3.5 h-3.5 text-amber-400" />
                      <span>Registration Charges (REG01):</span>
                    </span>
                    <span className="font-mono font-bold">+₹{REGISTRATION_FILE_CHARGE}</span>
                  </div>
                )}

                <div className="flex justify-between items-center pt-2.5 border-t-2 border-slate-800">
                  <span className="font-extrabold text-white text-xs uppercase tracking-wider">
                    Total Payable Amount:
                  </span>
                  <span
                    className={`font-mono font-extrabold text-lg ${
                      totalPayableFee === 0 ? 'text-emerald-400' : 'text-cyan-400'
                    }`}
                  >
                    ₹{totalPayableFee}.00
                  </span>
                </div>
              </div>

              {/* Section 6: Payment Method & Online UPI */}
              {totalPayableFee > 0 && (
                <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <Wallet className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Payment Method</span>
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">₹{totalPayableFee}</span>
                  </div>

                  {/* Payment Mode Selector Tabs */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentMethod('Cash');
                        setUtrStatus('idle');
                        setUtrFeedback('');
                      }}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
                        paymentMethod === 'Cash'
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>Cash</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setPaymentMethod('Online UPI');
                        setUtrStatus('idle');
                        setUtrFeedback('');
                      }}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
                        paymentMethod === 'Online UPI'
                          ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Online UPI</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setPaymentMethod('Card');
                        setUtrStatus('idle');
                        setUtrFeedback('');
                      }}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
                        paymentMethod === 'Card'
                          ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Card POS</span>
                    </button>
                  </div>

                  {/* Cash Mode */}
                  {paymentMethod === 'Cash' && (
                    <div className="pt-2 border-t border-slate-800/80 space-y-2 text-xs animate-in fade-in">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-slate-400">Cash Tendered:</span>
                        <div className="relative w-36">
                          <span className="absolute left-2.5 top-2 text-slate-500 font-mono">₹</span>
                          <input
                            type="number"
                            placeholder={String(totalPayableFee)}
                            value={cashTendered}
                            onChange={(e) => setCashTendered(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-6 pr-2 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-500 text-right"
                          />
                        </div>
                      </div>

                      {Number(cashTendered) > totalPayableFee && (
                        <div className="flex justify-between items-center bg-emerald-500/10 border border-emerald-500/30 p-2 rounded-lg text-emerald-300 font-medium">
                          <span>Return Change:</span>
                          <span className="font-mono font-bold text-sm text-emerald-400">
                            ₹{Number(cashTendered) - totalPayableFee}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Online UPI & UTR Verification */}
                  {paymentMethod === 'Online UPI' && (
                    <div className="pt-2 border-t border-slate-800/80 space-y-3 animate-in fade-in">
                      {/* Hospital UPI VPA */}
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 font-medium">Hospital UPI VPA:</span>
                          <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded-md border border-slate-800 font-mono text-cyan-300 text-[11px]">
                            <span>bhaskarreddyhospital@icici</span>
                            <button
                              type="button"
                              onClick={handleCopyUPI}
                              className="text-slate-400 hover:text-white"
                              title="Copy UPI VPA"
                            >
                              {copiedUPI ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">Bank:</span>
                          <span className="font-semibold text-slate-200">ICICI Bank, Nellore</span>
                        </div>
                      </div>

                      {/* UTR Input */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-300">
                            12-Digit UTR Number
                          </label>
                          <span
                            className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                              utrDigitsCount === 12
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            }`}
                          >
                            {utrDigitsCount}/12 digits
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            maxLength={15}
                            placeholder="UTR123456789012"
                            value={utrNumber}
                            onChange={(e) => handleUtrChange(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-500 uppercase font-semibold"
                          />
                          <button
                            type="button"
                            onClick={handleCheckUTR}
                            className="px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow transition shrink-0"
                          >
                            Check
                          </button>
                        </div>
                      </div>

                      {/* UTR Feedback */}
                      {utrStatus === 'verified' && (
                        <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span className="font-semibold">{utrFeedback}</span>
                        </div>
                      )}

                      {utrStatus === 'not_found' && (
                        <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs space-y-2">
                          <div className="flex items-start gap-2">
                            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                            <span>{utrFeedback}</span>
                          </div>
                          <div className="flex items-center justify-end">
                            <button
                              type="button"
                              onClick={handleLogUTRToReports}
                              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-extrabold text-[11px] shadow transition"
                            >
                              Add UTR to Reports
                            </button>
                          </div>
                        </div>
                      )}

                      {utrStatus === 'logged' && (
                        <div className="p-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 text-xs flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                          <span className="font-semibold">{utrFeedback}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Card Mode: Full EDC / POS Swipe Machine Details */}
                  {paymentMethod === 'Card' && (
                    <div className="pt-2 border-t border-slate-800/80 space-y-3 text-xs animate-in fade-in">
                      {/* Interactive Visual Card Chip Badge */}
                      <div className="p-3 rounded-xl bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/80 border border-purple-500/30 flex items-center justify-between">
                        <div className="space-y-0.5">
                          <span className="text-[10px] text-purple-300 font-bold uppercase tracking-wider block">
                            Hospital EDC / POS Machine Swipe
                          </span>
                          <div className="font-mono text-xs font-black text-white tracking-widest">
                            •••• •••• •••• {cardDetails.last4Digits ? cardDetails.last4Digits : '4589'}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="inline-block px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold text-[10px] border border-purple-500/40">
                            {cardDetails.cardNetwork} • {cardDetails.cardType}
                          </span>
                        </div>
                      </div>

                      {/* Row 1: Card Type & Card Network */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-slate-300 block mb-1">Card Type</label>
                          <select
                            value={cardDetails.cardType}
                            onChange={(e: any) => setCardDetails({ ...cardDetails, cardType: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
                          >
                            <option value="Credit Card">Credit Card</option>
                            <option value="Debit Card">Debit Card</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-300 block mb-1">Card Network</label>
                          <select
                            value={cardDetails.cardNetwork}
                            onChange={(e: any) => setCardDetails({ ...cardDetails, cardNetwork: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
                          >
                            <option value="Visa">Visa</option>
                            <option value="Mastercard">Mastercard</option>
                            <option value="RuPay">RuPay (Domestic)</option>
                            <option value="Amex">American Express</option>
                          </select>
                        </div>
                      </div>

                      {/* Row 2: Last 4 Digits & POS Approval Auth Code */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-slate-300 block mb-1">
                            Last 4 Digits of Card <span className="text-purple-400">*</span>
                          </label>
                          <input
                            type="text"
                            maxLength={4}
                            placeholder="e.g. 4589"
                            value={cardDetails.last4Digits}
                            onChange={(e) => {
                              const digits = e.target.value.replace(/\D/g, '').slice(0, 4);
                              setCardDetails({ ...cardDetails, last4Digits: digits });
                            }}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-300 block mb-1">
                            POS Slip Auth / Approval Code <span className="text-purple-400">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. AUTH-892014"
                            value={cardDetails.authCode}
                            onChange={(e) => setCardDetails({ ...cardDetails, authCode: e.target.value.toUpperCase() })}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-purple-500 uppercase"
                          />
                        </div>
                      </div>

                      {/* Row 3: Hospital POS Machine Terminal & Issuing Bank */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-slate-300 block mb-1">Hospital POS Machine Terminal</label>
                          <select
                            value={cardDetails.terminalId}
                            onChange={(e) => setCardDetails({ ...cardDetails, terminalId: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                          >
                            <option value="ICICI POS Terminal #01">ICICI POS Terminal #01 (Reception)</option>
                            <option value="HDFC EDC Machine #02">HDFC EDC Machine #02 (Central)</option>
                            <option value="SBI EDC Counter #03">SBI EDC Counter #03 (Emergency)</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-300 block mb-1">Cardholder Bank</label>
                          <select
                            value={cardDetails.issuingBank}
                            onChange={(e) => setCardDetails({ ...cardDetails, issuingBank: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                          >
                            <option value="HDFC Bank">HDFC Bank</option>
                            <option value="State Bank of India">State Bank of India (SBI)</option>
                            <option value="ICICI Bank">ICICI Bank</option>
                            <option value="Axis Bank">Axis Bank</option>
                            <option value="Kotak Mahindra">Kotak Mahindra</option>
                            <option value="Other Bank">Other Scheduled Bank</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Submit / Issue Token Action */}
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/25 transition active:scale-[0.99] flex items-center justify-between px-4"
              >
                <div className="flex items-center gap-2">
                  <Ticket className="w-4 h-4 shrink-0" />
                  <span>
                    {totalPayableFee === 0
                      ? 'Generate Free Follow-up Token & Slip'
                      : `Generate Token • Collect ₹${totalPayableFee} (${paymentMethod})`}
                  </span>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-black/40 border border-cyan-300/40 text-[10px] font-mono text-cyan-200 tracking-wider">
                  F10
                </span>
              </button>
            </form>
          </div>

          {/* Active OPD Queue Grid */}
          <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-4">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-cyan-400" />
                  Live Reception Queue Monitor ({filteredQueue.length})
                </h3>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* 1. Branch Filter */}
                <select
                  value={selectedQueueBranchId}
                  onChange={(e) => setSelectedQueueBranchId(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1 text-xs text-slate-200 font-medium"
                >
                  <option value="all">📍 All Hospital Branches</option>
                  {activeTenant.branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      📍 {b.name} ({b.city})
                    </option>
                  ))}
                </select>

                {/* 2. Doctor Filter */}
                <select
                  value={selectedQueueDoctorId}
                  onChange={(e) => setSelectedQueueDoctorId(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1 text-xs text-slate-200 font-medium"
                >
                  <option value="all">👨‍⚕️ All Doctors</option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.departmentName})
                    </option>
                  ))}
                </select>

                {/* Dept Filter */}
                <select
                  value={selectedQueueDept}
                  onChange={(e) => setSelectedQueueDept(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1 text-xs text-slate-200 font-medium"
                >
                  <option value="all">🏥 All Departments</option>
                  {departments?.map((dept) => (
                    <option key={dept.id} value={dept.name}>
                      {dept.name}
                    </option>
                  ))}
                </select>

                {/* Time Slot Filter */}
                <select
                  value={selectedQueueTimeSlot}
                  onChange={(e) => setSelectedQueueTimeSlot(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1 text-xs text-slate-200 font-medium font-mono"
                >
                  <option value="all">⏰ All Time Slots</option>
                  <option value="09:00 AM">09:00 AM</option>
                  <option value="09:30 AM">09:30 AM</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="10:30 AM">10:30 AM</option>
                  <option value="11:00 AM">11:00 AM</option>
                  <option value="11:30 AM">11:30 AM</option>
                  <option value="12:00 PM">12:00 PM</option>
                  <option value="04:00 PM">04:00 PM</option>
                  <option value="04:30 PM">04:30 PM</option>
                  <option value="05:00 PM">05:00 PM</option>
                </select>

                {/* 3. Payment Status Filter */}
                <select
                  value={selectedQueuePaymentStatus}
                  onChange={(e) => setSelectedQueuePaymentStatus(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1 text-xs text-slate-200 font-medium"
                >
                  <option value="all">💳 All Payment Statuses</option>
                  <option value="Paid">🟢 Online – Paid</option>
                  <option value="Pending Verification">🟡 UTR Pending</option>
                  <option value="Pending">🔴 Cash Pending</option>
                  <option value="Waived">⚪ Free Waived</option>
                </select>

                {/* 4. Token Status Filter */}
                <select
                  value={selectedQueueTokenStatus}
                  onChange={(e) => setSelectedQueueTokenStatus(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1 text-xs text-slate-200 font-medium"
                >
                  <option value="all">🎟️ All Token Statuses</option>
                  <option value="Assigned">✅ Token Assigned</option>
                  <option value="Pending">⏳ Token Pending (No Token)</option>
                </select>

                {/* 5. Appointment Type Filter */}
                <select
                  value={selectedQueueType}
                  onChange={(e) => setSelectedQueueType(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1 text-xs text-slate-200 font-medium"
                >
                  <option value="all">📋 All Types</option>
                  <option value="Follow-Up">🔄 Follow-Up Consultation</option>
                  <option value="New Consultation">➕ New Specialist Visit</option>
                  <option value="Premium Slot">⭐ Premium Slot</option>
                  <option value="Normal Queue">🚶 Normal Queue</option>
                </select>

                {/* 6. Date Filter */}
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-[11px] text-slate-400">Date:</span>
                  <input
                    type="date"
                    value={selectedQueueDate}
                    onChange={(e) => setSelectedQueueDate(e.target.value)}
                    className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer font-mono"
                  />
                  {selectedQueueDate && (
                    <button
                      type="button"
                      onClick={() => setSelectedQueueDate('')}
                      className="text-[10px] text-cyan-400 hover:underline ml-1"
                    >
                      Show All
                    </button>
                  )}
                </div>

                {/* 7. Sort Dropdown & Order Toggle */}
                <div className="flex items-center gap-1">
                  <select
                    value={queueSortBy}
                    onChange={(e) => setQueueSortBy(e.target.value as any)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1 text-xs text-slate-200 font-medium"
                  >
                    <option value="time">Sort by: ⏰ Time</option>
                    <option value="token">Sort by: 🎟️ Token</option>
                    <option value="patient">Sort by: 👤 Patient</option>
                    <option value="payment">Sort by: 💳 Payment</option>
                    <option value="branch">Sort by: 📍 Branch</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => setQueueSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
                    className="px-2 py-1 bg-slate-950 border border-slate-800 rounded-xl text-xs text-cyan-400 font-bold hover:border-cyan-500"
                    title="Toggle Sort Order"
                  >
                    {queueSortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
                  </button>
                </div>

                {/* Source Filter */}
                <div className="flex items-center gap-1 p-0.5 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => setQueueSourceFilter('all')}
                    className={`px-2 py-1 rounded-lg transition ${
                      queueSourceFilter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={() => setQueueSourceFilter('website')}
                    className={`px-2 py-1 rounded-lg transition flex items-center gap-1 ${
                      queueSourceFilter === 'website' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Globe className="w-3 h-3" />
                    <span>Website</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setQueueSourceFilter('reception')}
                    className={`px-2 py-1 rounded-lg transition flex items-center gap-1 ${
                      queueSourceFilter === 'reception' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Building2 className="w-3 h-3" />
                    <span>Desk</span>
                  </button>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2" />
                  <input
                    type="text"
                    placeholder="Search queue..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-3">Patient</th>
                    <th className="py-2.5 px-3">Doctor</th>
                    <th className="py-2.5 px-3">Branch</th>
                    <th className="py-2.5 px-3">Time &amp; Type</th>
                    <th className="py-2.5 px-3">Payment</th>
                    <th className="py-2.5 px-3">Token</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {filteredQueue.map((apt) => {
                    const isWeb =
                      apt.createdByName?.toLowerCase().includes('website') ||
                      apt.createdByRole?.toLowerCase().includes('portal') ||
                      apt.createdByRole?.toLowerCase().includes('web');

                    const branchObj = activeTenant.branches.find((b) => b.id === apt.branchId) || activeBranch;

                    return (
                      <tr key={apt.id} className="hover:bg-slate-800/40 transition">
                        {/* 1. Patient Column */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-100">{apt.patientName}</span>
                            {apt.opNumber && (
                              <span className="font-mono text-[10px] font-bold text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 px-1.5 py-0.5 rounded">
                                {apt.opNumber}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {apt.patientGender}, {apt.patientAge} yrs • {apt.patientPhone}
                          </div>
                        </td>

                        {/* 2. Doctor Column */}
                        <td className="py-3 px-3">
                          <div className="font-medium text-slate-200">{apt.doctorName}</div>
                          <div className="text-[10px] text-slate-400">{apt.departmentName}</div>
                          {(() => {
                            const docObj = doctors.find((d) => d.name === apt.doctorName || d.id === apt.doctorId);
                            if (!docObj) return null;
                            const coveringDoc = docObj.status === 'On Leave' ? getCoveringDutyDoctor(docObj) : null;

                            return (
                              <div className="mt-1 flex flex-col gap-0.5">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                                    docObj.status === 'On Duty'
                                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                      : docObj.status === 'In Surgery'
                                      ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                                      : docObj.status === 'On Leave'
                                      ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                                      : 'bg-slate-800 text-slate-400 border-slate-700'
                                  }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${
                                      docObj.status === 'On Duty' ? 'bg-emerald-400' : docObj.status === 'In Surgery' ? 'bg-purple-400' : docObj.status === 'On Leave' ? 'bg-amber-400' : 'bg-slate-500'
                                    }`} />
                                    {docObj.status}
                                  </span>
                                  <span className="text-[9px] text-slate-400 font-mono">
                                    {docObj.workingHours}
                                  </span>
                                </div>
                                {docObj.status === 'On Leave' && coveringDoc && (
                                  <span className="text-[9px] font-medium text-amber-300 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.2 rounded inline-block">
                                    Covered by: {coveringDoc.name}
                                  </span>
                                )}
                              </div>
                            );
                          })()}
                          {apt.reassignedFromDoctor && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.2 rounded mt-0.5">
                              <ArrowRightLeft className="w-2.5 h-2.5" />
                              <span>Transferred (Replaced {apt.reassignedFromDoctor})</span>
                            </span>
                          )}
                        </td>

                        {/* 3. Branch Column */}
                        <td className="py-3 px-3">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-bold text-[10px]">
                            <Building2 className="w-3 h-3 text-indigo-400" />
                            <span>{apt.branchName || branchObj.name}</span>
                          </span>
                        </td>

                        {/* 4. Time & Type Column */}
                        <td className="py-3 px-3">
                          <div className="space-y-1">
                            <div className="text-slate-100 text-xs font-mono font-bold">
                              {apt.appointmentTime}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {apt.appointmentDate}
                            </div>
                            <div className="flex items-center gap-1 flex-wrap">
                              {isWeb ? (
                                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-1.5 py-0.2 rounded">
                                  <Globe className="w-2.5 h-2.5" /> Web Booking
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-slate-400 bg-slate-900 border border-slate-800 px-1.5 py-0.2 rounded">
                                  <Building2 className="w-2.5 h-2.5" /> Desk Walk-in
                                </span>
                              )}
                              {apt.isFollowUp && (
                                <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.2 rounded">
                                  🔄 Follow-up
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* 5. Payment Column */}
                        <td className="py-3 px-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {apt.paymentStatus === 'Pending Verification' ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-lg border bg-amber-500/20 text-amber-300 border-amber-500/40">
                                  <ShieldAlert className="w-3 h-3 text-amber-400" />
                                  <span>UTR Pending</span>
                                </span>
                              ) : apt.paymentStatus === 'Pending' ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-lg border bg-rose-500/20 text-rose-300 border-rose-500/40">
                                  <Clock className="w-3 h-3 text-rose-400" />
                                  <span>Cash Pending</span>
                                </span>
                              ) : apt.fee === 0 ? (
                                <span className="inline-block px-2 py-0.5 text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 rounded-lg">
                                  Free OP Waived
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-lg border bg-emerald-500/20 text-emerald-300 border-emerald-500/40">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                  <span>Online Paid</span>
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1 text-[10px] font-mono text-slate-300">
                              <span>Fee: ₹{apt.fee}</span>
                              {apt.utrNumber && (
                                <span className="text-cyan-300 font-bold ml-1">
                                  • {apt.utrNumber}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* 6. Token Column */}
                        <td className="py-3 px-3">
                          {apt.tokenNumber ? (
                            <span className="font-mono font-black text-xs text-cyan-400 bg-cyan-500/15 px-2.5 py-1 rounded-xl border border-cyan-500/40 shadow-sm inline-block">
                              {apt.tokenNumber}
                            </span>
                          ) : (
                            <span className="font-mono text-sm font-bold text-slate-500 px-2 py-0.5">
                              —
                            </span>
                          )}
                        </td>

                        {/* 7. Action Column */}
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            {apt.paymentStatus === 'Pending Verification' ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedVerifyApt(apt);
                                  setShowVerifyUtrModal(true);
                                }}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-extrabold text-[11px] shadow-lg shadow-emerald-950/50 transition active:scale-95"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Verify UTR &amp; Issue Token</span>
                              </button>
                            ) : apt.paymentStatus === 'Pending' ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedCashApt(apt);
                                  setShowReceiveCashModal(true);
                                }}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 text-white font-extrabold text-[11px] shadow-lg shadow-emerald-950/50 transition active:scale-95"
                              >
                                <DollarSign className="w-3.5 h-3.5" />
                                <span>Receive Cash &amp; Issue Token</span>
                              </button>
                            ) : apt.status !== 'Cancelled' ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleOpenTransferModal(apt)}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/30 text-[10px] font-bold transition shadow-sm"
                                  title="Change Doctor / Re-assign Consultation"
                                >
                                  <ArrowRightLeft className="w-3 h-3" />
                                  <span>Change Doctor</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleOpenCancelModal(apt)}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/30 text-[10px] font-bold transition shadow-sm"
                                  title="Cancel Consultation & Issue Refund"
                                >
                                  <Ban className="w-3 h-3" />
                                  <span>Cancel</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedReceiptApt(apt);
                                    setShowReceiptModal(true);
                                  }}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-cyan-600/20 hover:bg-cyan-600 text-cyan-300 hover:text-white border border-cyan-500/40 text-[10px] font-bold transition shadow-sm"
                                  title="Download & Print OP Bill Cum Receipt"
                                >
                                  <Receipt className="w-3 h-3" />
                                  <span>Receipt</span>
                                </button>
                              </>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedRefundSlipApt(apt);
                                  setShowRefundSlipModal(true);
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 text-[10px] font-bold transition shadow-sm"
                              >
                                <Receipt className="w-3 h-3" />
                                <span>Refund Slip</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* New Registration Tab */}
      {activeTab === 'register' && (
        <div className="max-w-3xl mx-auto p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base font-bold text-slate-100">Walk-in Patient Comprehensive Registration</h3>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 px-3 py-1 rounded-xl text-xs">
                <span className="text-slate-300">Next UHID:</span>
                <span className="font-mono font-bold text-purple-300">{nextUHID}</span>
              </div>
              <div className="flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 rounded-xl text-xs">
                <Ticket className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-slate-300">Next OP No:</span>
                <span className="font-mono font-bold text-cyan-300">{nextOPNumber}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Duplicate Aadhar Warning Alert */}
            {duplicateAadharPatient && (
              <div className="md:col-span-2 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center justify-between gap-3 animate-in fade-in duration-200">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                  <div>
                    <strong className="text-rose-200 font-bold">Duplicate Aadhar Number Detected:</strong>
                    <div className="text-[11px] text-rose-300 mt-0.5">
                      Patient <strong>"{duplicateAadharPatient.name}"</strong> is already registered with this Aadhar under UHID: <strong className="font-mono text-white">{duplicateAadharPatient.uhid}</strong>. Duplicate record creation is prevented.
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPatientId(duplicateAadharPatient.id);
                    setActiveTab('queue');
                  }}
                  className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] shrink-0"
                >
                  Book Token for this Patient
                </button>
              </div>
            )}

            {/* 1. Name (Mandatory) */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Full Patient Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Ramesh Kumar"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-medium"
                required
              />
            </div>

            {/* 2. Phone Number (10 Digits Only, Mandatory) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-300">
                  Mobile Phone Number <span className="text-rose-400">*</span>
                </label>
                <span className="text-[10px] text-cyan-400 font-mono font-semibold">10 digits only</span>
              </div>
              <input
                type="tel"
                placeholder="9849012345"
                maxLength={10}
                value={formData.phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                className={`w-full bg-slate-950 border rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none ${
                  phoneError ? 'border-rose-500 focus:border-rose-500' : 'border-slate-800 focus:border-cyan-500'
                }`}
                required
              />
              {phoneError && <p className="text-[10px] text-rose-400 mt-1">{phoneError}</p>}
            </div>

            {/* 3. Aadhar Number (Optional & Duplicate Protected) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-300">
                  Aadhar Card Number <span className="text-slate-500 font-normal">(Optional)</span>
                </label>
                <span className="text-[10px] text-slate-400 font-mono font-medium">12 digits (Duplicate Protected)</span>
              </div>
              <input
                type="text"
                placeholder="1234 5678 9012 (Optional)"
                maxLength={14}
                value={formData.aadharNumber}
                onChange={(e) => handleAadharChange(e.target.value)}
                className={`w-full bg-slate-950 border rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none ${
                  duplicateAadharPatient || aadharError
                    ? 'border-rose-500 focus:border-rose-500 text-rose-300'
                    : 'border-slate-800 focus:border-cyan-500'
                }`}
              />
              {aadharError && <p className="text-[10px] text-rose-400 mt-1">{aadharError}</p>}
            </div>

            {/* 4. Date of Birth (DOB, Mandatory - Auto calculates age) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-300">
                  Date of Birth (DOB) <span className="text-rose-400">*</span>
                </label>
                <span className="text-[10px] text-emerald-400 font-semibold">Auto-generates Age</span>
              </div>
              <input
                type="date"
                max={new Date().toISOString().split('T')[0]}
                value={formData.dob}
                onChange={(e) => handleDobChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
                required
              />
            </div>

            {/* 5. Age (Mandatory - Generated from DOB) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-300">
                  Age (Years) <span className="text-rose-400">*</span>
                </label>
                {formData.dob && (
                  <span className="text-[10px] text-emerald-400 font-semibold">Calculated from DOB</span>
                )}
              </div>
              <input
                type="number"
                min="0"
                max="125"
                placeholder="Auto-calculated from DOB"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            {/* 6. Gender (Mandatory) */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Gender <span className="text-rose-400">*</span>
              </label>
              <select
                value={formData.gender}
                onChange={(e: any) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                required
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* 7. Blood Group (Optional / Not Mandatory) */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Blood Group <span className="text-slate-500">(Optional)</span>
              </label>
              <select
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              >
                <option value="">-- Select Blood Group (Optional) --</option>
                <option value="NA">NA (Not Available / Unknown)</option>
                <option value="O+ve">O+ve</option>
                <option value="A+ve">A+ve</option>
                <option value="B+ve">B+ve</option>
                <option value="AB+ve">AB+ve</option>
                <option value="O-ve">O-ve</option>
                <option value="A-ve">A-ve</option>
                <option value="B-ve">B-ve</option>
                <option value="AB-ve">AB-ve</option>
              </select>
            </div>

            {/* 8. Email Address (Optional / Not Mandatory) */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Email Address <span className="text-slate-500">(Optional)</span>
              </label>
              <input
                type="email"
                placeholder="patient@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* 9. Residential Address (Mandatory) */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Residential Address <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                placeholder="House / Plot no, street, locality, city..."
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div className="md:col-span-2 flex justify-end gap-3 pt-4 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => setActiveTab('queue')}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={Boolean(duplicateAadharPatient)}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-cyan-600/20 disabled:opacity-40 disabled:cursor-not-allowed transition active:scale-98 flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Register Patient & Generate OP No ({nextOPNumber}) / UHID</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* OP Bill - Cum - Receipt Modal */}
      {showReceiptModal && selectedReceiptApt && (() => {
        const rec = getReceiptDetails(selectedReceiptApt);
        if (!rec) return null;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
            <div className="relative w-full max-w-2xl bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-300 flex flex-col max-h-[94vh]">
              {/* Top Action Bar */}
              <div className="flex items-center justify-between px-6 py-3 bg-slate-900 text-white print:hidden border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Official Hospital OPD Receipt • {rec.patientName} ({rec.uhid})
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-md shadow-emerald-950/40"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Receipt Slip</span>
                    <span className="px-1.5 py-0.2 rounded bg-black/30 border border-emerald-400/40 text-[10px] font-mono text-emerald-100">
                      F10
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowReceiptModal(false)}
                    className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Printable Professional A5 Slip */}
              <div className="p-6 md:p-8 overflow-y-auto font-sans text-xs text-slate-900 space-y-4 print:p-0 print:m-0 print:text-black bg-white">
                {/* Header with Hospital Brand, Active Branch & Address */}
                <div className="text-center border-b-2 border-slate-900 pb-3 space-y-1">
                  <div className="flex items-center justify-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-900 text-white flex items-center justify-center font-serif font-black text-lg shadow-sm">
                      ✚
                    </div>
                    <h1 className="text-xl md:text-2xl font-black uppercase tracking-wider text-blue-950 font-serif">
                      BHASKAR REDDY HOSPITAL
                    </h1>
                  </div>
                  <p className="text-[11px] font-bold text-blue-900 tracking-wide uppercase">
                    {activeBranch?.name ? `${activeBranch.name} • ${activeBranch.city}` : 'Main Multi-Specialty Hospital • Nellore Campus'}
                  </p>
                  <p className="text-[10px] text-slate-600">
                    {activeBranch?.city === 'Hyderabad'
                      ? `${activeBranch.name}, Hyderabad - 500032, Telangana • Phone: 040-23456789 • Reg. No: 6/1953`
                      : 'D.No. 16-2-524, Pogathota, Sankara Agraharam, Nellore - 524001, Andhra Pradesh • Phone: 0861-2347701-05 (5 Lines) • Reg. No: 6/1953 • GSTIN: 37AAAAA0000A1Z5'}
                  </p>

                  <div className="pt-2 flex justify-center">
                    <span className="inline-block px-5 py-1 border-2 border-blue-950 rounded-md font-black text-xs uppercase tracking-widest bg-blue-50 text-blue-950 shadow-sm">
                      OP BILL - CUM - RECEIPT
                    </span>
                  </div>
                </div>

                {/* Patient & Consultation Details Grid */}
                <div className="border border-slate-300 rounded-lg overflow-hidden text-[11px]">
                  <div className="grid grid-cols-2 divide-x divide-slate-300 bg-slate-50/50 border-b border-slate-300">
                    <div className="p-2.5 space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-semibold">Patient Name:</span>
                        <strong className="text-slate-950 text-xs">{rec.patientName}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-semibold">UHID / UMR No:</span>
                        <strong className="font-mono text-blue-900 font-extrabold text-xs">{rec.uhid}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-semibold">Cons. No (OP Number):</span>
                        <strong className="font-mono text-slate-950 font-bold">{rec.opNumber}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-semibold">Age / Gender:</span>
                        <span className="font-bold text-slate-900">{rec.patientAge} Yrs / {rec.patientGender}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-semibold">Mobile:</span>
                        <span className="font-mono font-medium">{rec.patientPhone}</span>
                      </div>
                    </div>

                    <div className="p-2.5 space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-semibold">Cons. Bill No:</span>
                        <strong className="font-mono text-blue-950 font-black">{rec.consBillNo || rec.billNo}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-semibold">Date & Time:</span>
                        <span className="font-mono font-medium text-slate-900">
                          {rec.appointmentDate} • {rec.appointmentTime}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-semibold">Consultant:</span>
                        <strong className="text-blue-950 font-bold">{rec.doctorName}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-semibold">Department:</span>
                        <span className="font-medium text-slate-900">{rec.departmentName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-semibold">Queue Token:</span>
                        <span className="font-mono font-bold text-cyan-900 bg-cyan-100 px-1.5 py-0.5 rounded border border-cyan-300">
                          {rec.tokenNumber} ({rec.tokenModel})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 15-Day Doctor Validity Callout Strip */}
                  <div className="p-2.5 bg-blue-50/90 border-t-2 border-b border-blue-300 text-blue-950 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-[11px] rounded-b">
                    <div className="flex items-center gap-1.5 font-bold">
                      <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0"></span>
                      <span>
                        15-Day OP Return Validity for <strong>{rec.doctorName}</strong> ({rec.departmentName}):
                      </span>
                    </div>
                    <div className="flex items-center gap-2 font-mono shrink-0">
                      <span className="text-[10px] bg-white border border-blue-300 px-2 py-0.5 rounded text-blue-900 font-semibold">
                        From: <strong>{rec.appointmentDate}</strong>
                      </span>
                      <span className="text-[10px] bg-blue-200 border border-blue-400 px-2 py-0.5 rounded text-blue-950 font-extrabold">
                        Upto: <strong>{rec.validUntil}</strong> (15 Days)
                      </span>
                    </div>
                  </div>

                  {/* Doctor Transfer & Endorsement Banner */}
                  {rec.reassignedFromDoctor && (
                    <div className="p-2 bg-amber-50 border-t border-amber-300 text-amber-950 text-[10px] flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1 font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                        <span>
                          Transfer Endorsement: Re-assigned from <strong>{rec.reassignedFromDoctor}</strong> to <strong>{rec.doctorName}</strong>
                        </span>
                      </span>
                      <span className="font-mono font-semibold bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded text-[9px]">
                        Payment Credited {rec.differentialFeePaid && rec.differentialFeePaid > 0 ? `• Differential +₹${rec.differentialFeePaid} Collected` : ''}
                      </span>
                    </div>
                  )}
                </div>

                {/* Itemized Services Ledger Table */}
                <div className="border border-slate-300 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300 uppercase text-[10px]">
                      <tr>
                        <th className="py-2 px-3 border-r border-slate-300 text-center w-12">S.No</th>
                        <th className="py-2 px-3 border-r border-slate-300 w-24">Code</th>
                        <th className="py-2 px-3 border-r border-slate-300">Service Particulars</th>
                        <th className="py-2 px-3 border-r border-slate-300 text-center w-12">Qty</th>
                        <th className="py-2 px-3 border-r border-slate-300 text-right w-24">Rate (₹)</th>
                        <th className="py-2 px-3 text-right w-28">Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-medium">
                      {rec.hasHospitalFile && (
                        <tr>
                          <td className="py-2 px-3 border-r border-slate-300 text-center text-slate-500">1</td>
                          <td className="py-2 px-3 border-r border-slate-300 font-mono font-bold text-slate-700">REG01</td>
                          <td className="py-2 px-3 border-r border-slate-300 text-slate-900 font-semibold">
                            Registration Charges & Hospital Health Record File
                          </td>
                          <td className="py-2 px-3 border-r border-slate-300 text-center">1</td>
                          <td className="py-2 px-3 border-r border-slate-300 text-right font-mono">30.00</td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-slate-950">30.00</td>
                        </tr>
                      )}
                      <tr>
                        <td className="py-2 px-3 border-r border-slate-300 text-center text-slate-500">
                          {rec.hasHospitalFile ? 2 : 1}
                        </td>
                        <td className="py-2 px-3 border-r border-slate-300 font-mono font-bold text-slate-700">CONS01</td>
                        <td className="py-2 px-3 border-r border-slate-300 text-slate-900 font-semibold">
                          OP Specialist Doctor Consultation Fee ({rec.doctorName})
                          {rec.isFollowUp && (
                            <span className="ml-2 inline-block text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                              15-Day Free Follow-up Waived
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 border-r border-slate-300 text-center">1</td>
                        <td className="py-2 px-3 border-r border-slate-300 text-right font-mono">
                          {rec.docStandardFee.toFixed(2)}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-slate-950">
                          {rec.consultCharge.toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Totals & Words Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1 items-start">
                  <div className="space-y-1.5 p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="text-[10px] uppercase font-bold text-slate-500">Amount in Words:</div>
                    <div className="text-[11px] font-bold text-slate-900 italic">
                      {numberToWords(rec.totalFee)}
                    </div>
                    <div className="text-[10px] text-slate-600 pt-1 border-t border-slate-200 flex items-center justify-between flex-wrap gap-2">
                      <span>Payment Mode: <strong className="text-slate-950">{rec.paymentMethod}</strong></span>
                      {rec.utrNumber && (
                        <span className="font-mono bg-cyan-50 border border-cyan-200 px-1.5 py-0.5 rounded text-cyan-900 font-bold text-[10px]">
                          UTR: {rec.utrNumber}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-600 pt-1 border-t border-slate-200 flex items-center justify-between flex-wrap gap-2">
                      <span>Generated By Front Desk Registrar: <strong className="text-slate-950">{rec.creatorName}</strong></span>
                      <span>Designation: <strong className="text-slate-700">{rec.creatorRole}</strong></span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg border border-slate-300 space-y-1.5 text-[11px]">
                    <div className="flex justify-between text-slate-600">
                      <span>Gross Bill Amount:</span>
                      <span className="font-mono font-bold text-slate-900">₹ {rec.grossFee}.00</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Discount / 15-Day Waiver:</span>
                      <span className="font-mono font-bold text-emerald-700">₹ {rec.waiverFee}.00</span>
                    </div>
                    <div className="flex justify-between border-t-2 border-slate-900 pt-1.5 text-xs font-extrabold text-slate-950 bg-slate-100 -mx-3 -mb-3 p-2.5 rounded-b-lg">
                      <span>NET AMOUNT PAID:</span>
                      <span className="font-mono text-emerald-700 text-sm">₹ {rec.totalFee}.00</span>
                    </div>
                  </div>
                </div>

                {/* Professional Footer with Red Circular Stamp, Barcode & Signature */}
                <div className="flex items-center justify-between pt-4 border-t-2 border-slate-900 mt-2">
                  {/* Red Circular Hospital Rubber Stamp */}
                  <div className="relative w-20 h-20 rounded-full border-2 border-dashed border-rose-700/80 flex flex-col items-center justify-center text-center text-rose-800 rotate-[-6deg] bg-rose-50/40 select-none">
                    <span className="text-[7px] font-black uppercase tracking-tighter leading-none">BHASKAR REDDY</span>
                    <span className="text-[11px] font-black leading-none my-0.5">★ PAID ★</span>
                    <span className="text-[7px] font-bold uppercase tracking-tighter leading-none">NELLORE</span>
                  </div>

                  {/* Barcode Graphic */}
                  <div className="text-center font-mono">
                    <div className="text-[10px] tracking-[0.25em] font-extrabold text-slate-800 leading-none">
                      ||||||||||||||||||||||||||||||||||||||||||
                    </div>
                    <div className="text-[10px] font-bold text-slate-900 mt-1">
                      UHID: {rec.uhid} • Cons No: {rec.opNumber} • Cons Bill No: {rec.consBillNo || rec.billNo}
                    </div>
                  </div>

                  {/* Official Receptionist / Cashier Signature */}
                  <div className="text-right space-y-0.5">
                    <div className="font-serif italic text-sm text-blue-950 font-bold select-none tracking-wide">
                      {rec.creatorName}
                    </div>
                    <div className="text-[10px] font-bold text-slate-900 border-t border-slate-800 pt-0.5">
                      Authorized Front Desk Registrar Signatory
                    </div>
                    <div className="text-[9px] text-slate-600 font-medium">
                      {rec.creatorName} • ({rec.creatorRole})
                    </div>
                    <div className="text-[9px] text-slate-500 font-mono">
                      Counter: RECP-01 • Central Desk
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 3. Re-assign Consultation Doctor Modal */}
      {showTransferModal && selectedTransferApt && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 bg-gradient-to-r from-amber-950/60 to-slate-900 border-b border-amber-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                  <ArrowRightLeft className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">Change Consultation Doctor</h3>
                  <p className="text-[11px] text-slate-400">
                    Patient: <strong className="text-slate-200">{selectedTransferApt.patientName}</strong> ({selectedTransferApt.patientUhid})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowTransferModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmDoctorTransfer} className="p-5 space-y-4 text-xs">
              {/* Current Booking Summary */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Current Assigned Consultation:</div>
                <div className="flex justify-between items-center text-slate-200 font-medium">
                  <span>Doctor: <strong>{selectedTransferApt.doctorName}</strong> ({selectedTransferApt.departmentName})</span>
                  <span className="font-mono text-cyan-300 font-bold">Token: {selectedTransferApt.tokenNumber}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400 text-[11px]">
                  <span>Amount Paid: <strong className="text-emerald-400 font-mono">₹{selectedTransferApt.fee}</strong></span>
                  <span>Model: {selectedTransferApt.model}</span>
                </div>
              </div>

              {/* Select New Doctor */}
              <div className="space-y-1">
                <label className="text-slate-300 font-bold flex items-center gap-1.5">
                  <Stethoscope className="w-3.5 h-3.5 text-amber-400" />
                  <span>Select New Consultation Doctor</span>
                  <span className="text-rose-400">*</span>
                </label>
                <select
                  value={transferDoctorId}
                  onChange={(e) => setTransferDoctorId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  required
                >
                  <option value="">-- Choose New Doctor --</option>
                  {doctors.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.name} • {doc.specialization} ({doc.departmentName}) — Fee: ₹{doc.consultationFee}
                    </option>
                  ))}
                </select>
              </div>

              {/* Queue Priority Model */}
              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Queue Model</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTransferModel('Normal Queue')}
                    className={`p-2 rounded-xl text-left border transition ${
                      transferModel === 'Normal Queue'
                        ? 'bg-amber-500/15 border-amber-500 text-amber-200'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="font-bold">Normal Walk-in</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Fee: ₹{targetTransferDoctor?.consultationFee || 300}
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTransferModel('Premium Slot')}
                    className={`p-2 rounded-xl text-left border transition ${
                      transferModel === 'Premium Slot'
                        ? 'bg-purple-500/15 border-purple-500 text-purple-200'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="font-bold">Premium Priority</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Fee: ₹{targetTransferDoctor?.premiumFee || 500}
                    </div>
                  </button>
                </div>
              </div>

              {/* Fee Adjustment Breakdown */}
              {targetTransferDoctor && (
                <div className="p-3.5 rounded-xl bg-slate-950 border border-amber-500/30 space-y-1.5">
                  <div className="flex justify-between items-center text-slate-400">
                    <span>New Doctor Consultation Fee:</span>
                    <span className="font-mono font-bold text-slate-200">₹{transferFeeCalculation.newDocFee}</span>
                  </div>
                  {selectedTransferApt.hasHospitalFile && (
                    <div className="flex justify-between items-center text-slate-400">
                      <span>Registration Charges (REG01):</span>
                      <span className="font-mono text-slate-300">+₹30</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Previously Paid Fee:</span>
                    <span className="font-mono text-slate-300">-₹{transferFeeCalculation.originalFee}</span>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs font-bold">
                    <span>Adjustment Balance:</span>
                    {transferFeeCalculation.differential > 0 ? (
                      <span className="font-mono text-amber-400">
                        +₹{transferFeeCalculation.differential} (Collect from Patient)
                      </span>
                    ) : transferFeeCalculation.differential < 0 ? (
                      <span className="font-mono text-emerald-400">
                        ₹{Math.abs(transferFeeCalculation.differential)} (Refund to Patient)
                      </span>
                    ) : (
                      <span className="font-mono text-cyan-300">₹0 (No Adjustment Needed)</span>
                    )}
                  </div>
                </div>
              )}

              {/* Differential Payment Mode if additional collection required */}
              {transferFeeCalculation.differential > 0 && (
                <div className="space-y-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
                  <label className="text-amber-300 font-bold block">
                    Select Differential Payment Mode (₹{transferFeeCalculation.differential}):
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Cash', 'Online UPI', 'Card'] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setTransferPaymentMethod(mode)}
                        className={`py-1.5 px-2 rounded-lg text-center font-bold text-xs border transition ${
                          transferPaymentMethod === mode
                            ? 'bg-amber-500 text-slate-950 border-amber-400'
                            : 'bg-slate-900 text-slate-300 border-slate-700'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>

                  {transferPaymentMethod === 'Online UPI' && (
                    <div className="space-y-1 pt-1">
                      <label className="text-[11px] text-slate-300">12-Digit Differential UTR:</label>
                      <input
                        type="text"
                        value={transferUtrNumber}
                        onChange={(e) => setTransferUtrNumber(e.target.value.toUpperCase())}
                        placeholder="UTR123456789012"
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-amber-300 font-mono"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!targetTransferDoctor}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-slate-950 font-bold text-xs shadow-lg transition active:scale-95 disabled:opacity-50 flex items-center gap-2"
                >
                  <span>Confirm Doctor Transfer & Update Slip</span>
                  <span className="px-1.5 py-0.2 rounded bg-black/40 border border-amber-950/50 text-[10px] font-mono text-amber-200">
                    Ctrl+G
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Cancel Consultation & Refund Modal */}
      {showCancelModal && selectedCancelApt && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/40 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 bg-gradient-to-r from-rose-950/60 to-slate-900 border-b border-rose-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
                  <Ban className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">Cancel OPD Consultation & Refund</h3>
                  <p className="text-[11px] text-slate-400">
                    Patient: <strong className="text-slate-200">{selectedCancelApt.patientName}</strong> ({selectedCancelApt.patientUhid})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCancelModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmCancellation} className="p-5 space-y-4 text-xs">
              {/* Token & Payment Summary */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex justify-between items-center text-slate-200">
                  <span>Token: <strong className="text-cyan-400 font-mono">{selectedCancelApt.tokenNumber}</strong></span>
                  <span>Consultant: <strong>{selectedCancelApt.doctorName}</strong></span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span>Total Amount Paid:</span>
                  <span className="font-mono font-bold text-rose-400 text-sm">₹{selectedCancelApt.fee}</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  Original Mode: {selectedCancelApt.paymentMethod || 'Cash'} {selectedCancelApt.utrNumber ? `• UTR: ${selectedCancelApt.utrNumber}` : ''}
                </div>
              </div>

              {/* Reason for Cancellation */}
              <div className="space-y-1">
                <label className="text-slate-300 font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                  <span>Cancellation Reason</span>
                  <span className="text-rose-400">*</span>
                </label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-rose-500"
                  required
                >
                  <option value="Doctor Unavailable / Emergency Operation">Doctor Unavailable / Emergency Operation</option>
                  <option value="Patient Emergency / Urgent Departure">Patient Emergency / Urgent Departure</option>
                  <option value="Incorrect Doctor / Department Selected">Incorrect Doctor / Department Selected</option>
                  <option value="Patient Request / Long Wait Time">Patient Request / Long Wait Time</option>
                  <option value="Duplicate Token Generated">Duplicate Token Generated</option>
                  <option value="Other Front-Desk Cancellation">Other Front-Desk Cancellation</option>
                </select>
              </div>

              {/* Refund Mode */}
              <div className="space-y-1.5">
                <label className="text-slate-300 font-bold flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Refund Disbursal Mode</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'Cash', label: 'Cash Counter' },
                    { id: 'Online UPI Reversal', label: 'UPI Reversal' },
                    { id: 'Credit Voucher', label: 'Credit Voucher' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setCancelRefundMode(m.id as any)}
                      className={`p-2 rounded-xl text-center border text-xs font-bold transition ${
                        cancelRefundMode === m.id
                          ? 'bg-rose-500/20 border-rose-500 text-rose-200'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Refund Confirmation Notice */}
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px] space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>Refund Confirmation: ₹{selectedCancelApt.fee}</span>
                </div>
                <p className="text-slate-300 text-[10px]">
                  Cancelling will remove the patient from active doctor queue, log the refund in Accounts Reconciliation, and print an official OPD Cancellation Voucher.
                </p>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg transition active:scale-95"
                >
                  Confirm Cancellation & Issue Refund Slip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Official OPD Cancellation & Refund Voucher Modal */}
      {showRefundSlipModal && selectedRefundSlipApt && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-8">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-rose-400" />
                <h3 className="text-sm font-bold text-slate-100">OPD Cancellation & Refund Voucher</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Refund Slip</span>
                </button>
                <button
                  onClick={() => setShowRefundSlipModal(false)}
                  className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Refund Slip Paper */}
            <div className="p-6 bg-white text-slate-900">
              <div className="border-2 border-rose-600 rounded-xl p-6 space-y-4 font-sans text-xs">
                {/* Hospital Header */}
                <div className="text-center border-b-2 border-rose-600 pb-3 space-y-1">
                  <h2 className="text-lg font-black tracking-tight text-blue-950 uppercase">
                    BHASKAR REDDY HOSPITAL
                  </h2>
                  <p className="text-[10px] text-slate-600 font-medium">
                    Opp. Children's Park, Pogathota, Nellore - 524001, A.P. • Ph: 0861-2345678
                  </p>
                  <div className="pt-1">
                    <span className="inline-block px-4 py-0.5 border-2 border-rose-700 bg-rose-50 text-rose-900 font-black text-xs uppercase tracking-wider rounded">
                      ★ OPD CANCELLATION & REFUND VOUCHER ★
                    </span>
                  </div>
                </div>

                {/* Patient & Voucher Details */}
                <div className="grid grid-cols-2 gap-3 text-[11px] bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div className="space-y-1">
                    <div>Patient Name: <strong className="text-slate-950">{selectedRefundSlipApt.patientName}</strong></div>
                    <div>UHID: <strong className="font-mono text-blue-900">{selectedRefundSlipApt.patientUhid}</strong></div>
                    <div>Original Bill No: <span className="font-mono">{selectedRefundSlipApt.billNo || 'BIL-2026-OPD'}</span></div>
                    <div>Cancelled Token #: <span className="font-mono font-bold text-rose-700">{selectedRefundSlipApt.tokenNumber}</span></div>
                  </div>
                  <div className="space-y-1">
                    <div>Refund Voucher #: <strong className="font-mono text-rose-900">{selectedRefundSlipApt.refundReference || 'REF-819203'}</strong></div>
                    <div>Cancelled On: <span className="font-mono">{selectedRefundSlipApt.cancelledAt || '2026-07-24'}</span></div>
                    <div>Consultant: <strong>{selectedRefundSlipApt.doctorName}</strong></div>
                    <div>Department: {selectedRefundSlipApt.departmentName}</div>
                  </div>
                </div>

                {/* Refund Particulars Table */}
                <table className="w-full border border-slate-300 text-[11px] text-left">
                  <thead className="bg-slate-100 font-bold border-b border-slate-300">
                    <tr>
                      <th className="p-2 border-r border-slate-300">Description</th>
                      <th className="p-2 border-r border-slate-300">Reason</th>
                      <th className="p-2 border-r border-slate-300">Disbursal Mode</th>
                      <th className="p-2 text-right">Refund Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2 border-r border-slate-300 font-medium">OPD Consultation Fee Refund</td>
                      <td className="p-2 border-r border-slate-300 text-rose-800 font-semibold">{selectedRefundSlipApt.cancellationReason || 'Patient Request'}</td>
                      <td className="p-2 border-r border-slate-300 font-bold text-slate-900">{selectedRefundSlipApt.refundMode || 'Cash Counter'}</td>
                      <td className="p-2 text-right font-mono font-bold text-rose-700 text-sm">₹{selectedRefundSlipApt.refundAmount || selectedRefundSlipApt.fee}.00</td>
                    </tr>
                  </tbody>
                </table>

                {/* Amount in Words */}
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded text-[11px] font-bold text-rose-950 flex justify-between items-center">
                  <span>Amount Refunded in Words: <em>{numberToWords(selectedRefundSlipApt.refundAmount || selectedRefundSlipApt.fee)}</em></span>
                  <span className="font-mono text-sm">TOTAL: ₹{selectedRefundSlipApt.refundAmount || selectedRefundSlipApt.fee}.00</span>
                </div>

                {/* Footer with Seal & Signatures */}
                <div className="flex items-center justify-between pt-4 border-t-2 border-slate-800 mt-3">
                  <div className="w-20 h-20 rounded-full border-2 border-dashed border-rose-700 flex flex-col items-center justify-center text-center text-rose-800 rotate-[-6deg] bg-rose-50 font-black text-[9px] select-none">
                    <span>BHASKAR REDDY</span>
                    <span className="text-xs">★ REFUND ★</span>
                    <span>NELLORE</span>
                  </div>

                  <div className="text-center font-mono text-[10px]">
                    <div>Patient / Attendant Signature</div>
                    <div className="mt-6 border-t border-slate-400 pt-1 text-slate-600">Acknowledged Cash / Transfer</div>
                  </div>

                  <div className="text-right text-[10px]">
                    <div className="font-serif italic font-bold text-xs text-blue-950">{currentUser?.name || 'Priyanka M'}</div>
                    <div className="border-t border-slate-800 pt-0.5 font-bold">Authorized Cashier / Receptionist</div>
                    <div className="text-slate-500 font-mono">Counter: RECP-01</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. UTR Verification & OPD Token Generation Modal */}
      {showVerifyUtrModal && selectedVerifyApt && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-scale-up">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-100">Verify Online UTR &amp; Generate OPD Token</h3>
              </div>
              <button
                onClick={() => setShowVerifyUtrModal(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {/* Patient & Appointment Details */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">Patient Name:</span>
                  <strong className="text-white text-sm">{selectedVerifyApt.patientName}</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">Doctor Specialist:</span>
                  <strong className="text-cyan-300">{selectedVerifyApt.doctorName} ({selectedVerifyApt.departmentName})</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">Date &amp; Slot:</span>
                  <span className="font-mono text-slate-200">{selectedVerifyApt.appointmentDate} • {selectedVerifyApt.appointmentTime}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">Consultation Fee:</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">₹{selectedVerifyApt.fee}.00</span>
                </div>
              </div>

              {/* UTR Reference Verification Box */}
              <div className="p-4 rounded-xl bg-cyan-950/30 border-2 border-cyan-500/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-cyan-300 font-bold flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-cyan-400" />
                    <span>Patient Submitted UTR / Transaction No:</span>
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                    {selectedVerifyApt.paymentMethod || 'Online UPI'}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-950 rounded-lg border border-cyan-500/60 font-mono text-base font-black text-center text-cyan-300 tracking-wider">
                  {selectedVerifyApt.utrNumber || 'UTR489201889211'}
                </div>
                <p className="text-[10px] text-slate-400">
                  Staff Checklist: Check hospital bank ledger / UPI gateway statement. If transaction matches ₹{selectedVerifyApt.fee}, click below to confirm.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Marking payment as verified will assign the next OPD Token in queue and activate 15-day OP validity.</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowVerifyUtrModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    verifyAppointmentPayment(selectedVerifyApt.id, selectedVerifyApt.paymentMethod || 'Online Paid', selectedVerifyApt.utrNumber);
                    setShowVerifyUtrModal(false);
                    setSelectedVerifyApt(null);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-extrabold shadow-lg shadow-emerald-950/50 transition active:scale-95 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm UTR Match &amp; Generate OPD Token</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. Receive Cash Payment & Generate OPD Token Modal */}
      {showReceiveCashModal && selectedCashApt && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-scale-up">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-100">Collect Cash &amp; Generate OPD Token</h3>
              </div>
              <button
                onClick={() => setShowReceiveCashModal(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">Patient Name:</span>
                  <strong className="text-white text-sm">{selectedCashApt.patientName}</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">Doctor Specialist:</span>
                  <strong className="text-cyan-300">{selectedCashApt.doctorName}</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">Date &amp; Slot:</span>
                  <span className="font-mono text-slate-200">{selectedCashApt.appointmentDate} • {selectedCashApt.appointmentTime}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                  <span className="text-slate-300 font-bold">Total Cash Amount to Collect:</span>
                  <span className="font-mono font-black text-emerald-400 text-lg">₹{selectedCashApt.fee}.00</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Collect ₹{selectedCashApt.fee} at the cash counter. Generating token will print the official OP Bill Cum Receipt.</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowReceiveCashModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    verifyAppointmentPayment(selectedCashApt.id, 'Cash');
                    setShowReceiveCashModal(false);
                    setSelectedCashApt(null);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 text-white font-extrabold shadow-lg shadow-emerald-950/50 transition active:scale-95 flex items-center gap-1.5"
                >
                  <DollarSign className="w-4 h-4" />
                  <span>Receive Cash &amp; Generate OPD Token</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

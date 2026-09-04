import React, { useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  HeartPulse,
  MapPin,
  Menu,
  PhoneCall,
  Search,
  ShieldCheck,
  Stethoscope,
  X,
  Quote,
  MapPin,
  Phone,
  FileText,
  CreditCard,
  Video,
  Download,
  Award,
  Heart,
  Stethoscope,
  ChevronDown,
  Building2,
  Clock,
  Check,
  HelpCircle,
  Pill,
  Droplet,
  Coffee,
  Car,
} from 'lucide-react';

export const PublicWebsite: React.FC = () => {
  const {
    doctors,
    departments,
    blogPosts,
    galleryItems,
    testimonials,
    addAppointment,
    addContactInquiry,
    addToast,
    setActiveView,
  } = useWebsite();

  const [activeTab, setActiveTab] = useState<'home' | 'doctors' | 'departments' | 'packages' | 'gallery' | 'blog' | 'careers' | 'contact' | 'symptom-checker' | 'patient-portal' | 'pay-online'>('home');

  // --- AI Symptom Checker State ---
  const [symptomMessages, setSymptomMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string; triage?: 'Red' | 'Yellow' | 'Green'; dept?: string }>>([
    { sender: 'bot', text: "Hello! I am your AI Symptom Assistant. Tell me what symptoms you are experiencing (e.g. 'chest pain', 'persistent cough', 'fever'), and I will help triage them and direct you to the right clinic." }
  ]);
  const [symptomInput, setSymptomInput] = useState('');

  // --- Patient Portal State ---
  const [portalUhidInput, setPortalUhidInput] = useState('');
  const [portalPassword, setPortalPassword] = useState('');
  const [portalLoggedIn, setPortalLoggedIn] = useState(false);
  const [portalActiveSubTab, setPortalActiveSubTab] = useState<'reports' | 'prescriptions' | 'discharge' | 'invoices'>('reports');
  const [portalUser, setPortalUser] = useState<{ name: string; uhid: string; age: number; gender: string } | null>(null);

  // --- Pay Online State ---
  const [payUhid, setPayUhid] = useState('');
  const [payBillNo, setPayBillNo] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const [payType, setPayType] = useState<'OPD' | 'IPD_Deposit' | 'Final_Bill'>('OPD');
  const [payMethod, setPayMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [payStatus, setPayStatus] = useState<'form' | 'processing' | 'success'>('form');
  const [payTxnId, setPayTxnId] = useState('');

  // Doctor Search
  const [docSearchQuery, setDocSearchQuery] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('All');

  // Interactive Specialty Tab on Home
  const [selectedSpecialtyTab, setSelectedSpecialtyTab] = useState('Obstetrics & Gynecology (Women Health)');

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Self Service Tools
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [lookupUhid, setLookupUhid] = useState('');

  // Booking Wizard State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingStep, setBookingStep] = useState<1 | 2 | 3 | 4>(1);
  const [bookingDept, setBookingDept] = useState(departments[0]?.name || '');
  const [bookingDoctor, setBookingDoctor] = useState(doctors[0]);
  const [bookingModel, setBookingModel] = useState<'Premium Slot' | 'Normal Queue'>('Premium Slot');
  const [bookingTime, setBookingTime] = useState('10:00 AM');
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientGender] = useState('Male');

  // Contact Form State
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactMessage, setContactMessage] = useState('');

  // Career Application State
  const [applicantName, setApplicantName] = useState('');
  const [applicantRole, setApplicantRole] = useState('Staff Nurse (ICU/OT)');

  const filteredDoctors = doctors.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(docSearchQuery.toLowerCase()) ||
      doc.specialization.toLowerCase().includes(docSearchQuery.toLowerCase());
    const matchesDept = selectedDeptFilter === 'All' || doc.departmentName === selectedDeptFilter;
    return matchesSearch && matchesDept;
  });

  const activeDeptObj = departments.find((d) => d.name === selectedSpecialtyTab) || departments[0];

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName || !patientPhone) return;

    addAppointment({
      patientName: booking.name,
      patientPhone: booking.phone,
      patientAge: 35,
      patientGender: "Not specified",
      doctorName: selectedDoctor.name,
      departmentName: selectedDoctor.departmentName,
      appointmentDate: booking.date || "2026-07-25",
      appointmentTime: booking.time,
      model: "Normal Queue",
      fee: selectedDoctor.consultationFee,
    });
    setBookingOpen(false);
    setBooking({ name: "", phone: "", date: "", time: "10:00 AM" });
  };
  const submitContact = (event: React.FormEvent) => {
    event.preventDefault();
    if (!contact.name || !contact.phone) return;
    addContactInquiry({
      name: contact.name,
      phone: contact.phone,
      email: "",
      subject: "Website callback request",
      message: contact.message || "Please call me back.",
    });
    setContact({ name: "", phone: "", message: "" });
  };
  const navItems: { id: Section; label: string }[] = [
    { id: "home", label: "Home" },
    { id: "doctors", label: "Find a doctor" },
    { id: "departments", label: "Our care" },
    { id: "wellness", label: "Wellness journal" },
    { id: "contact", label: "Visit us" },
  ];

  const handleCareerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantName) return;

    addToast('Application Received', `Received job application for ${applicantRole} position from ${applicantName}.`, 'success');
    setApplicantName('');
  };

  const handleSymptomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptomInput.trim()) return;

    const userText = symptomInput.trim();
    const newMsgs = [...symptomMessages, { sender: 'user' as const, text: userText }];
    setSymptomMessages(newMsgs);
    setSymptomInput('');

    setTimeout(() => {
      const lowerText = userText.toLowerCase();
      let responseText = '';
      let triage: 'Red' | 'Yellow' | 'Green' = 'Green';
      let dept = 'General Medicine';

      if (lowerText.includes('chest pain') || lowerText.includes('heart') || lowerText.includes('cardiac') || lowerText.includes('breathless') || lowerText.includes('unconscious') || lowerText.includes('accident') || lowerText.includes('bleeding')) {
        triage = 'Red';
        responseText = "🚨 CRITICAL TRIAGE (Red Priority): Based on your symptoms, this could be a life-threatening emergency. Please proceed immediately to our 24/7 Emergency Command Center or call the Pogathota Emergency Hotline: 0861-2345678.";
      } else if (lowerText.includes('cough') || lowerText.includes('wheez') || lowerText.includes('asthma') || lowerText.includes('breath')) {
        triage = 'Yellow';
        dept = 'Pulmonology';
        responseText = "⚠️ Triage: Yellow Priority (Urgent). Respiratory distress or persistent cough needs specialist review. We suggest booking an appointment with our Pulmonology department.";
      } else if (lowerText.includes('stomach') || lowerText.includes('abdomen') || lowerText.includes('vomit') || lowerText.includes('loose motion') || lowerText.includes('digest')) {
        triage = 'Yellow';
        dept = 'Gastroenterology';
        responseText = "⚠️ Triage: Yellow Priority. Persistent abdominal concerns should be evaluated by our Gastroenterology division.";
      } else if (lowerText.includes('pregnancy') || lowerText.includes('delivery') || lowerText.includes('period') || lowerText.includes('gynec') || lowerText.includes('maternity')) {
        triage = 'Green';
        dept = 'Obstetrics & Gynecology (Women Health)';
        responseText = "🔔 Triage: Green Priority. For maternity, prenatal, and general women's health concerns, consult our Obstetrics & Gynecology department.";
      } else if (lowerText.includes('fracture') || lowerText.includes('bone') || lowerText.includes('joint') || lowerText.includes('knee') || lowerText.includes('fall')) {
        triage = 'Yellow';
        dept = 'Orthopedics';
        responseText = "⚠️ Triage: Yellow Priority. Bone or joint symptoms should be evaluated by our Orthopedics department.";
      } else {
        triage = 'Green';
        dept = 'General Medicine';
        responseText = "🔔 Triage: Green Priority (Standard). For general symptoms, we suggest starting with our General Medicine department.";
      }

      setSymptomMessages(prev => [...prev, { sender: 'bot', text: responseText, triage, dept }]);
    }, 1000);
  };

  const handlePortalLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!portalUhidInput) return;
    
    // Simulate lookup / authenticate
    setPortalUser({
      name: 'Ravi Kumar Devarala',
      uhid: portalUhidInput.toUpperCase().startsWith('UHID-') ? portalUhidInput.toUpperCase() : `UHID-${portalUhidInput}`,
      age: 38,
      gender: 'Male'
    });
    setPortalLoggedIn(true);
    addToast('Access Granted', 'Logged in successfully to MyHealth Desk.', 'success');
  };

  const handlePortalLogout = () => {
    setPortalLoggedIn(false);
    setPortalUser(null);
    setPortalUhidInput('');
    setPortalPassword('');
    addToast('Logged Out', 'Successfully logged out of MyHealth Desk.', 'info');
  };

  const handlePaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payAmount || Number(payAmount) <= 0) {
      addToast('Error', 'Please enter a valid amount.', 'warning');
      return;
    }
    setPayStatus('processing');
    
    setTimeout(() => {
      const generatedId = `TXN-${Math.floor(100000000 + Math.random() * 900000000)}`;
      setPayTxnId(generatedId);
      setPayStatus('success');
      addToast('Payment Success', `Paid ₹${payAmount} successfully. Transaction ID: ${generatedId}`, 'success');
    }, 1500);
  };

  const faqs = [
    {
      q: 'Is Dr. YSR Aarogyasri accepted for cashless treatments?',
      a: 'Yes! Bhaskar Reddy Hospital is officially empanelled under Dr. YSR Aarogyasri Scheme (AP Govt) for eligible surgeries, cardiac procedures, and maternity care.',
    },
    {
      q: 'How does the 10-Minute Premium Reserved Slot work?',
      a: 'When you book a Premium Reserved Slot (e.g. 10:00 AM, 10:10 AM), your consultation with the doctor is scheduled at an exact guaranteed time with zero waiting line.',
    },
    {
      q: 'What are the OPD and Emergency hours at Pogathota Nellore?',
      a: 'Outpatient (OPD) consultation operates Monday through Saturday from 9:00 AM to 5:00 PM. Emergency & Trauma Resuscitation, Cardiac Cath Lab, and NICU operate 24/7 365 days a year.',
    },
    {
      q: 'How can I download diagnostic lab test reports online?',
      a: 'Click on "Download Lab Reports" in the top bar or footer, enter your patient UHID or registered mobile number, and your PDF report will download instantly.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-600 selection:text-white flex flex-col justify-between">
      <div>
        {/* Top Notification Bar & Nellore Location */}
        <div className="bg-slate-900 text-slate-200 py-2 px-4 md:px-12 flex flex-col sm:flex-row items-center justify-between text-xs border-b border-slate-800 gap-2">
          <div className="flex items-center gap-3 text-cyan-400 font-bold">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Bhaskar Reddy Hospital • Nellore Campus</span>
            </div>
            <span className="hidden md:inline text-slate-500">|</span>
            <div className="hidden md:flex items-center gap-1 text-slate-300 font-medium">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              <span>Pogathota, Near Vijayamahal Gate, Nellore - 524001</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a href="tel:08612345678" className="text-slate-300 hover:text-white font-mono text-[11px] flex items-center gap-1">
              <Phone className="w-3 h-3 text-blue-400" />
              <span>Helpline: 0861-2345678</span>
            </a>
            <button
              onClick={() => setActiveView('website-cms')}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-[10px]"
            >
              ⚙️ Website CMS Admin
            </button>
          </div>
        </div>

        {/* Main Navigation Header */}
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 md:px-12 py-3.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 p-0.5 shadow-md shadow-blue-500/20">
              <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                <Activity className="w-6 h-6 text-blue-600 animate-pulse" />
              </div>
            </div>
            <div>
              <h1 className="font-extrabold text-slate-900 text-lg tracking-tight">
                Bhaskar Reddy <span className="text-blue-600">Hospital</span>
              </h1>
              <p className="text-[10px] text-slate-500 font-medium">Multi-Specialty & Women Health Care • Nellore</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold">
            {[
              { id: 'home', label: 'Home' },
              { id: 'doctors', label: 'Find Doctors' },
              { id: 'departments', label: 'Departments' },
              { id: 'packages', label: 'Health Packages' },
              { id: 'symptom-checker', label: '🤖 AI Symptom Checker' },
              { id: 'patient-portal', label: '📱 MyHealth Portal' },
              { id: 'pay-online', label: '💳 Pay Online' },
              { id: 'contact', label: 'Contact Us' },
            ].map((nav) => (
              <button
                key={nav.id}
                onClick={() => setActiveTab(nav.id as any)}
                className={`transition ${
                  activeTab === nav.id
                    ? 'text-blue-600 font-extrabold border-b-2 border-blue-600 pb-1'
                    : 'text-slate-600 hover:text-blue-600'
                }`}
              >
                {nav.label}
              </button>
            ))}
          </nav>

          <button
            onClick={() => {
              setIsBookingModalOpen(true);
              setBookingStep(1);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-600/20 transition transform active:scale-95"
          >
            <Calendar className="w-4 h-4" />
            <span>Book Appointment</span>
          </button>
        </header>

        {/* Home Page Content */}
        {activeTab === 'home' && (
          <>
            {/* 1. Hero Section */}
            <section className="relative px-4 md:px-12 py-16 md:py-24 bg-gradient-to-b from-blue-50/70 via-slate-50 to-white overflow-hidden">
              <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                <div className="lg:col-span-7 space-y-6">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-100/80 border border-blue-200 text-blue-800 text-xs font-semibold">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span>Leading Hospital in Pogathota, Nellore • Dr. YSR Aarogyasri Empanelled</span>
                  </div>

                  <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
                    World-Class Healthcare Dedicated to <span className="text-blue-600">Your Family's Trust</span>
                  </h1>

                  <p className="text-slate-600 text-sm md:text-base leading-relaxed max-w-2xl">
                    Equipped with Advanced Laparoscopic Surgery, 24/7 Interventional Cardiology & Cath Lab, 
                    Level-3 NICU, and Robotic Joint Replacement. Led by Dr. Madhu Latha Marreddy and renowned medical specialists.
                  </p>

                  <div className="flex flex-wrap items-center gap-4 pt-2">
                    <button
                      onClick={() => {
                        setIsBookingModalOpen(true);
                        setBookingStep(1);
                      }}
                      className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-600/25 transition transform hover:-translate-y-0.5"
                    >
                      <span>Instant Doctor Booking</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <a
                      href="tel:08612345678"
                      className="flex items-center gap-2.5 px-5 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-rose-600 border border-rose-200 shadow-xs text-xs font-bold transition"
                    >
                      <Siren className="w-4 h-4 text-rose-600 animate-pulse" />
                      <span>Nellore Hotline: 0861-2345678</span>
                    </a>
                  </div>
                </div>

                <div className="lg:col-span-5 relative">
                  <div className="p-3 rounded-3xl bg-white border border-slate-200 shadow-xl space-y-3">
                    <img
                      src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&auto=format&fit=crop&q=80"
                      alt="Bhaskar Reddy Hospital Nellore Facility"
                      className="w-full h-80 md:h-96 rounded-2xl object-cover"
                    />
                    <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-between text-xs font-bold text-blue-900">
                      <span>NABH Accredited Tertiary Care Center</span>
                      <span className="text-emerald-600">✓ 24/7 Resuscitation Open</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 2. Patient Self-Service Desk */}
            <section className="px-4 md:px-12 py-8 bg-slate-900 text-white">
              <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div
                  onClick={() => setIsReportModalOpen(true)}
                  className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 hover:border-cyan-400 cursor-pointer transition flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Download Lab Reports</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">Enter UHID / Phone to fetch PDF test reports online</p>
                  </div>
                </div>

                <div
                  onClick={() => setIsBillModalOpen(true)}
                  className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 hover:border-cyan-400 cursor-pointer transition flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Pay Hospital Bill Online</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">Instant online payment via UPI, GPay, Cards & NetBanking</p>
                  </div>
                </div>

                <div
                  onClick={() => {
                    setIsBookingModalOpen(true);
                    setBookingStep(1);
                  }}
                  className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 hover:border-cyan-400 cursor-pointer transition flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                    <Video className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Video Tele-Consultation</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">Consult with Senior Doctors virtually from home</p>
                  </div>
                </div>
              </div>
            </section>

            {/* 3. WOW Factor 1: Overview Counters */}
            <section className="px-4 md:px-12 py-12 bg-white border-y border-slate-200">
              <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-xs space-y-1">
                  <div className="text-3xl md:text-4xl font-black text-blue-600 font-mono">250,000+</div>
                  <div className="text-xs text-slate-600 font-semibold">Patients Treated</div>
                </div>
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-xs space-y-1">
                  <div className="text-3xl md:text-4xl font-black text-emerald-600 font-mono">25+</div>
                  <div className="text-xs text-slate-600 font-semibold">Years of Medical Service</div>
                </div>
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-xs space-y-1">
                  <div className="text-3xl md:text-4xl font-black text-indigo-600 font-mono">45+</div>
                  <div className="text-xs text-slate-600 font-semibold">Senior Specialists & Doctors</div>
                </div>
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-xs space-y-1">
                  <div className="text-3xl md:text-4xl font-black text-amber-600 font-mono">50,000+</div>
                  <div className="text-xs text-slate-600 font-semibold">Successful Surgeries & Deliveries</div>
                </div>
              </div>
            </section>

            {/* 4. Interactive Clinical Specialty Explorer (Tabbed Explorer) */}
            <section className="px-4 md:px-12 py-16 max-w-7xl mx-auto space-y-8">
              <div className="text-center space-y-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                  Clinical Excellence
                </span>
                <h2 className="text-3xl font-black text-slate-900">Centers of Clinical Excellence</h2>
                <p className="text-xs text-slate-500 max-w-xl mx-auto">
                  Explore specialized clinical divisions, advanced technology, and head consultants at Bhaskar Reddy Hospital Nellore.
                </p>
              </div>

              {/* Specialty Selector Tabs */}
              <div className="flex flex-wrap items-center justify-center gap-2 border-b border-slate-200 pb-4">
                {departments.map((dept) => (
                  <button
                    key={dept.id}
                    onClick={() => setSelectedSpecialtyTab(dept.name)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                      selectedSpecialtyTab === dept.name
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {dept.name}
                  </button>
                ))}
              </div>

              {/* Active Specialty Detail View */}
              {activeDeptObj && (
                <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-md grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                  <div className="md:col-span-7 space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-blue-50 text-blue-800 border border-blue-200">
                        {activeDeptObj.code} DIVISION
                      </span>
                      <span className="text-xs text-slate-500 font-medium">OPD Room: {activeDeptObj.opdRoom}</span>
                    </div>

                    <h3 className="text-2xl font-black text-slate-900">{activeDeptObj.name}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{activeDeptObj.description}</p>

                    <div className="space-y-2 pt-2">
                      <div className="text-xs font-bold text-slate-800">Key Procedures & Clinical Treatments:</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {activeDeptObj.services.map((srv) => (
                          <div key={srv} className="flex items-center gap-2 text-xs text-slate-700">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>{srv}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                      <div className="text-xs">
                        <span className="text-slate-500">Head Consultant: </span>
                        <span className="font-bold text-slate-900">{activeDeptObj.headDoctor}</span>
                      </div>
                      <button
                        onClick={() => {
                          setBookingDept(activeDeptObj.name);
                          setIsBookingModalOpen(true);
                          setBookingStep(1);
                        }}
                        className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                      >
                        Book Appointment in {activeDeptObj.name.split(' ')[0]} →
                      </button>
                    </div>
                  </div>

                  <div className="md:col-span-5">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                      <div className="text-xs font-bold text-slate-800">Inpatient Infrastructure</div>
                      <div className="grid grid-cols-2 gap-3 text-center">
                        <div className="p-3 bg-white rounded-xl border border-slate-200">
                          <div className="text-xl font-mono font-black text-blue-600">{activeDeptObj.totalBeds}</div>
                          <div className="text-[10px] text-slate-500">Dedicated Beds</div>
                        </div>
                        <div className="p-3 bg-white rounded-xl border border-slate-200">
                          <div className="text-xl font-mono font-black text-emerald-600">24/7</div>
                          <div className="text-[10px] text-slate-500">Emergency On-Call</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* 5. Patient Care Journey (4 Steps) */}
            <section className="px-4 md:px-12 py-16 bg-gradient-to-b from-slate-100/80 to-white border-y border-slate-200">
              <div className="max-w-7xl mx-auto space-y-8">
                <div className="text-center space-y-2">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                    Seamless Experience
                  </span>
                  <h2 className="text-3xl font-black text-slate-900">Your 4-Step Patient Care Journey</h2>
                  <p className="text-xs text-slate-500">From initial consultation to complete recovery and follow-up care</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
                  <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3 relative">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-mono font-black flex items-center justify-center text-sm shadow-md">
                      01
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm">Doctor Consultation</h3>
                    <p className="text-slate-500 text-[11px] leading-relaxed">
                      Book online with guaranteed 10-minute reserved slots or walk into Pogathota OPD desk.
                    </p>
                  </div>

                  <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3 relative">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-mono font-black flex items-center justify-center text-sm shadow-md">
                      02
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm">Diagnostic Screening</h3>
                    <p className="text-slate-500 text-[11px] leading-relaxed">
                      Rapid in-house digital radiology, 128-slice CT, and automated biochemistry lab testing.
                    </p>
                  </div>

                  <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3 relative">
                    <div className="w-10 h-10 rounded-xl bg-purple-600 text-white font-mono font-black flex items-center justify-center text-sm shadow-md">
                      03
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm">Advanced Clinical Care</h3>
                    <p className="text-slate-500 text-[11px] leading-relaxed">
                      Minimally invasive laparoscopic surgery, robotic joint replacement, or comfortable IPD stay.
                    </p>
                  </div>

                  <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3 relative">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-mono font-black flex items-center justify-center text-sm shadow-md">
                      04
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm">Post-Care & Tele-Support</h3>
                    <p className="text-slate-500 text-[11px] leading-relaxed">
                      Digital discharge summary, WhatsApp prescription updates, and remote tele-followups.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 6. WOW Factor 2: Doctor Finder */}
            <section className="px-4 md:px-12 py-16 max-w-7xl mx-auto space-y-8">
              <div className="text-center space-y-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                  WOW Factor 2
                </span>
                <h2 className="text-3xl font-black text-slate-900">Find Specialist Doctors in Nellore</h2>
                <p className="text-xs text-slate-500 max-w-xl mx-auto">
                  Search gynecologists, interventional cardiologists, robotic joint surgeons, and emergency leads.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="Search doctor by name or specialization..."
                    value={docSearchQuery}
                    onChange={(e) => setDocSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <select
                  value={selectedDeptFilter}
                  onChange={(e) => setSelectedDeptFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-600"
                >
                  <option value="All">All Specialty Departments</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDoctors.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md transition space-y-4 flex flex-col justify-between"
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={doc.image}
                        alt={doc.name}
                        className="w-16 h-16 rounded-2xl object-cover ring-2 ring-blue-500/20 shrink-0"
                      />
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                          {doc.name}
                          <span className="flex items-center text-[10px] font-bold text-amber-500">
                            <Star className="w-3 h-3 fill-amber-400" /> {doc.rating}
                          </span>
                        </h3>
                        <div className="text-xs text-blue-600 font-semibold">{doc.specialization}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{doc.qualification}</div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">{doc.experienceYears} Years Exp.</div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1 text-xs">
                      <div className="flex justify-between text-slate-600">
                        <span>Normal Queue Fee:</span>
                        <span className="font-bold text-slate-900 font-mono">₹{doc.consultationFee}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Premium 10-Min Slot:</span>
                        <span className="font-bold text-indigo-600 font-mono">₹{doc.premiumFee}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setBookingDoctor(doc);
                        setIsBookingModalOpen(true);
                        setBookingStep(1);
                      }}
                      className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition"
                    >
                      Book Consultation
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* 7. Health Checkup Packages Section */}
            <section className="px-4 md:px-12 py-16 bg-blue-50/40 border-y border-slate-200">
              <div className="max-w-7xl mx-auto space-y-8">
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-black text-slate-900">Preventive Health Checkup Packages</h2>
                  <p className="text-xs text-slate-500">Comprehensive health screenings designed for peace of mind</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {healthPackages.map((pkg) => (
                    <div
                      key={pkg.id}
                      className={`p-6 rounded-2xl bg-white border transition flex flex-col justify-between space-y-4 ${
                        pkg.isPopular ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-lg' : 'border-slate-200 shadow-xs'
                      }`}
                    >
                      <div>
                        {pkg.isPopular && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white uppercase tracking-wider mb-2 inline-block">
                            Most Popular
                          </span>
                        )}
                        <h3 className="text-lg font-extrabold text-slate-900">{pkg.title}</h3>
                        <div className="text-xs text-slate-500 mt-1">{pkg.recommendedFor}</div>

                        <div className="mt-4 flex items-baseline gap-2 font-mono">
                          <span className="text-2xl font-black text-blue-600">₹{pkg.price}</span>
                          <span className="text-xs text-slate-400 line-through">₹{pkg.originalPrice}</span>
                        </div>

                        <div className="mt-4 space-y-2 text-xs text-slate-700">
                          {pkg.features.map((feat) => (
                            <div key={feat} className="flex items-center gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>{feat}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => addToast('Package Booked', `Booked ${pkg.title}`, 'success')}
                        className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition"
                      >
                        Book Checkup Package
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 8. Campus Patient Amenities Showcase */}
            <section className="px-4 md:px-12 py-16 max-w-7xl mx-auto space-y-8">
              <div className="text-center space-y-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                  Patient Comfort
                </span>
                <h2 className="text-3xl font-black text-slate-900">World-Class Campus Amenities</h2>
                <p className="text-xs text-slate-500">Designed for patient comfort and family convenience at Pogathota Nellore</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-xs">
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2 text-center">
                  <Pill className="w-8 h-8 text-blue-600 mx-auto" />
                  <div className="font-bold text-slate-900">24/7 In-House Pharmacy</div>
                  <div className="text-[11px] text-slate-500">100% genuine medications available round-the-clock.</div>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2 text-center">
                  <Droplet className="w-8 h-8 text-rose-600 mx-auto" />
                  <div className="font-bold text-slate-900">24/7 Blood Bank Storage</div>
                  <div className="text-[11px] text-slate-500">Cross-matched blood components & platelet storage.</div>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2 text-center">
                  <Coffee className="w-8 h-8 text-amber-600 mx-auto" />
                  <div className="font-bold text-slate-900">Hygienic Dietary Cafeteria</div>
                  <div className="text-[11px] text-slate-500">Clinical dietitian planned meals for patient recovery.</div>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2 text-center">
                  <Car className="w-8 h-8 text-indigo-600 mx-auto" />
                  <div className="font-bold text-slate-900">Valet & Multi-Level Parking</div>
                  <div className="text-[11px] text-slate-500">Ample parking space with instant ambulance driveway.</div>
                </div>
              </div>
            </section>

            {/* 9. Interactive FAQ Accordion */}
            <section className="px-4 md:px-12 py-16 bg-slate-100/70 border-t border-slate-200">
              <div className="max-w-4xl mx-auto space-y-8">
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-black text-slate-900">Frequently Asked Questions (FAQs)</h2>
                  <p className="text-xs text-slate-500">Common questions from patients visiting Bhaskar Reddy Hospital Nellore</p>
                </div>

                <div className="space-y-4 text-xs">
                  {faqs.map((faq, idx) => (
                    <div key={idx} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                      <button
                        onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                        className="w-full flex items-center justify-between font-bold text-slate-900 text-left"
                      >
                        <span className="flex items-center gap-2">
                          <HelpCircle className="w-4 h-4 text-blue-600 shrink-0" />
                          {faq.q}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition ${openFaqIndex === idx ? 'rotate-180 text-blue-600' : ''}`} />
                      </button>

                      {openFaqIndex === idx && (
                        <p className="text-slate-600 leading-relaxed pt-2 border-t border-slate-100 text-[11px]">
                          {faq.a}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}

        {/* Dedicated Departments Tab */}
        {activeTab === 'departments' && (
          <div className="px-4 md:px-12 py-12 max-w-7xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-black text-slate-900">All Specialty Medical Departments ({departments.length})</h2>
              <p className="text-xs text-slate-500">Clinical & surgical specialties at Bhaskar Reddy Hospital, Pogathota Nellore</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {departments.map((dept) => (
                <div key={dept.id} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{dept.name}</h3>
                      <div className="text-xs text-blue-600 font-semibold mt-0.5">Code: {dept.code}</div>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-blue-50 text-blue-800 text-xs font-mono font-bold">
                      {dept.opdRoom}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{dept.description}</p>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                    <div className="font-bold text-slate-800">Specialty Head: {dept.headDoctor}</div>
                    <div className="text-slate-500">Inpatient Beds: {dept.totalBeds} Beds</div>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="font-bold text-slate-700">Procedures & Treatments Offered:</div>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {dept.services.map((srv) => (
                        <span key={srv} className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-800 text-[11px] font-medium border border-blue-100">
                          ✓ {srv}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setBookingDept(dept.name);
                      setIsBookingModalOpen(true);
                      setBookingStep(1);
                    }}
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition"
                  >
                    Book Consultation in {dept.name}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dedicated Health Packages Tab */}
        {activeTab === 'packages' && (
          <div className="px-4 md:px-12 py-12 max-w-7xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-black text-slate-900">Preventive Health Checkup Packages ({healthPackages.length})</h2>
              <p className="text-xs text-slate-500">Comprehensive health screenings tailored for Nellore families</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {healthPackages.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`p-6 rounded-2xl bg-white border transition flex flex-col justify-between space-y-4 ${
                    pkg.isPopular ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-lg' : 'border-slate-200 shadow-xs'
                  }`}
                >
                  <div>
                    {pkg.isPopular && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white uppercase tracking-wider mb-2 inline-block">
                        Most Popular Checkup
                      </span>
                    )}
                    <h3 className="text-lg font-extrabold text-slate-900">{pkg.title}</h3>
                    <div className="text-xs text-slate-500 mt-1">{pkg.recommendedFor}</div>

                    <div className="mt-4 flex items-baseline gap-2 font-mono">
                      <span className="text-2xl font-black text-blue-600">₹{pkg.price}</span>
                      <span className="text-xs text-slate-400 line-through">₹{pkg.originalPrice}</span>
                    </div>

                    <div className="mt-4 space-y-2 text-xs text-slate-700">
                      {pkg.features.map((feat) => (
                        <div key={feat} className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => addToast('Checkup Booked', `Booked ${pkg.title}`, 'success')}
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition"
                  >
                    Reserve Health Checkup Package
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Doctor Directory */}
        {activeTab === 'doctors' && (
          <div className="px-4 md:px-12 py-12 max-w-7xl mx-auto space-y-6">
            <h2 className="text-2xl font-black text-slate-900">Senior Doctors & Consultants (Nellore Campus)</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {doctors.map((doc) => (
                <div key={doc.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                  <img src={doc.image} alt={doc.name} className="w-20 h-20 rounded-2xl object-cover" />
                  <h3 className="text-base font-bold text-slate-900">{doc.name}</h3>
                  <p className="text-xs text-blue-600">{doc.specialization}</p>
                  <div className="text-xs text-slate-500">{doc.qualification} • {doc.experienceYears} Yrs Exp.</div>
                  <button
                    onClick={() => {
                      setBookingDoctor(doc);
                      setIsBookingModalOpen(true);
                    }}
                    className="w-full py-2 rounded-xl bg-blue-600 text-white font-bold text-xs"
                  >
                    Book Consultation
                  </button>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* WOW Factor 6: Virtual Tour */}
        {activeTab === 'gallery' && (
          <div className="px-4 md:px-12 py-12 max-w-7xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                WOW Factor 6
              </span>
              <h2 className="text-3xl font-black text-slate-900">Virtual Tour of Bhaskar Reddy Hospital Nellore</h2>
              <p className="text-xs text-slate-500">Operation Theatres, ICUs, and Maternity Suites at Pogathota</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {galleryItems.map((item) => (
                <div key={item.id} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                  <img src={item.image} alt={item.title} className="w-full h-56 rounded-xl object-cover" />
                  <div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                      {item.category}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1">{item.title}</h3>
                    <p className="text-xs text-slate-600">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact */}
        {activeTab === 'contact' && (
          <div className="px-4 md:px-12 py-12 max-w-4xl mx-auto space-y-6">
            <h2 className="text-2xl font-black text-slate-900">Contact & Nellore Location</h2>
            <div className="p-6 rounded-2xl bg-slate-900 text-white space-y-3 text-xs">
              <div className="font-bold text-sm text-cyan-400">Bhaskar Reddy Hospital - Pogathota Campus</div>
              <div>📍 Address: Near Vijayamahal Gate, Pogathota, Nellore, Andhra Pradesh - 524001</div>
              <div>📞 Emergency Hotline: 0861-2345678 / 0861-2345679</div>
              <div>✉️ Email: care@bhaskarreddyhospital.com</div>
            </div>

            <form onSubmit={handleContactSubmit} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 mb-1">Your Name *</label>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">Phone Number *</label>
                <input
                  type="text"
                  placeholder="+91 98490 00000"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">Message</label>
                <textarea
                  rows={3}
                  placeholder="How can our medical team assist you?"
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                />
              </div>
              <button type="submit" className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold">
                Submit Inquiry Request
              </button>
            </form>
          </div>
        )}

        {/* AI Symptom Checker & Department Router */}
        {activeTab === 'symptom-checker' && (
          <div className="px-4 md:px-12 py-12 max-w-3xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">
                AI Triage System
              </span>
              <h2 className="text-3xl font-black text-slate-900">AI Symptom Checker & Router</h2>
              <p className="text-xs text-slate-500">Provide your symptoms below. Our automated triage system will guide you to appropriate care.</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-3xl overflow-hidden flex flex-col h-[500px]">
              <div className="bg-slate-900 px-6 py-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white">
                  🤖
                </div>
                <div>
                  <h3 className="font-bold text-white text-xs">Bhaskar Reddy Hospital AI Bot</h3>
                  <p className="text-[10px] text-slate-400">Online Symptom Triage Desk</p>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4">
                {symptomMessages.map((msg, index) => (
                  <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl p-4 text-xs ${
                      msg.sender === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-xs'
                    }`}>
                      <div className="whitespace-pre-wrap">{msg.text}</div>
                      
                      {msg.triage && (
                        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold">Estimated Triage:</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              msg.triage === 'Red' ? 'bg-rose-100 text-rose-800' :
                              msg.triage === 'Yellow' ? 'bg-amber-100 text-amber-800' :
                              'bg-emerald-100 text-emerald-800'
                            }`}>
                              {msg.triage} Priority
                            </span>
                          </div>

                          {msg.triage === 'Red' ? (
                            <div className="flex gap-2">
                              <a href="tel:08612345678" className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-[10px] transition text-center flex-1">
                                Call Emergency Hotline
                              </a>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  const matchingDept = departments.find(d => d.name === msg.dept) || departments[0];
                                  setBookingDept(matchingDept.name);
                                  const matchedDoc = doctors.find(d => d.departmentName === matchingDept.name) || doctors[0];
                                  setBookingDoctor(matchedDoc);
                                  setIsBookingModalOpen(true);
                                  setBookingStep(1);
                                }}
                                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-[10px] transition text-center flex-1"
                              >
                                Book {msg.dept || 'Consultation'} Slot
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSymptomSubmit} className="p-4 border-t border-slate-200 bg-white flex gap-2">
                <input
                  type="text"
                  placeholder="Describe symptoms, e.g., chest pain, cough and cold..."
                  value={symptomInput}
                  onChange={(e) => setSymptomInput(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-hidden focus:border-indigo-500"
                />
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition">
                  Send
                </button>
              </form>
            </div>
            
            {/* Quick Prompts */}
            <div className="flex flex-wrap gap-2 justify-center">
              {[
                "Severe chest pain and sweating",
                "Continuous coughing for 3 days",
                "High fever with body chills",
                "Pregnancy checkup",
                "Fractured leg / joint pain"
              ].map((phrase, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setSymptomInput(phrase);
                  }}
                  className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-[11px] transition shadow-2xs"
                >
                  {phrase}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Patient Portal (MyHealth Desk) */}
        {activeTab === 'patient-portal' && (
          <div className="px-4 md:px-12 py-12 max-w-5xl mx-auto space-y-6">
            {!portalLoggedIn ? (
              <div className="max-w-md mx-auto p-8 rounded-3xl bg-white border border-slate-200 shadow-md space-y-6">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto text-xl font-bold">
                    📱
                  </div>
                  <h2 className="text-xl font-black text-slate-900">MyHealth Portal Login</h2>
                  <p className="text-[11px] text-slate-500">Access your lab reports, prescriptions, and invoices online.</p>
                </div>

                <form onSubmit={handlePortalLogin} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-600 mb-1">Patient UHID or Registered Mobile Number</label>
                    <input
                      type="text"
                      placeholder="e.g. UHID-908123 or 9849012345"
                      value={portalUhidInput}
                      onChange={(e) => setPortalUhidInput(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Password or OTP</label>
                    <input
                      type="password"
                      placeholder="••••••"
                      value={portalPassword}
                      onChange={(e) => setPortalPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                    />
                  </div>
                  <button type="submit" className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition">
                    Access MyHealth Desk
                  </button>
                </form>
                
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-[10px] text-slate-500">
                  💡 <strong>Quick Demo:</strong> Enter any value (e.g. <code>UHID-908123</code>) and click login.
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h2 className="text-xl font-black">{portalUser?.name}</h2>
                    <p className="text-[11px] text-blue-100">Patient ID: {portalUser?.uhid} • Age: {portalUser?.age} • Gender: {portalUser?.gender}</p>
                  </div>
                  <button
                    onClick={handlePortalLogout}
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-xs font-bold rounded-xl transition"
                  >
                    Logout Desk
                  </button>
                </div>

                {/* Sub tabs */}
                <div className="flex border-b border-slate-200 gap-4">
                  {[
                    { id: 'reports', label: '📁 Lab Reports' },
                    { id: 'prescriptions', label: '💊 Prescriptions' },
                    { id: 'discharge', label: '📄 Discharge Summaries' },
                    { id: 'invoices', label: '🧾 Invoices & Bills' }
                  ].map((subTab) => (
                    <button
                      key={subTab.id}
                      onClick={() => setPortalActiveSubTab(subTab.id as any)}
                      className={`pb-3 font-semibold text-xs transition-colors relative ${
                        portalActiveSubTab === subTab.id ? 'text-blue-600 font-bold border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {subTab.label}
                    </button>
                  ))}
                </div>

                {/* Tab Contents */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 text-xs shadow-2xs">
                  {portalActiveSubTab === 'reports' && (
                    <div className="space-y-4">
                      <h3 className="font-bold text-slate-800 text-sm">Diagnostic Lab Investigations</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-slate-200 text-slate-500">
                              <th className="pb-3">Test Name</th>
                              <th className="pb-3">Referred By</th>
                              <th className="pb-3">Date</th>
                              <th className="pb-3">Status</th>
                              <th className="pb-3 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[
                              { name: 'Lipid Profile Report', doc: 'Dr. Vikram Reddy', date: '2026-07-10', status: 'Completed' },
                              { name: 'Complete Blood Count (CBC)', doc: 'Dr. Vikram Reddy', date: '2026-07-10', status: 'Completed' },
                              { name: 'Thyroid Panel (T3, T4, TSH)', doc: 'Dr. Madhu Latha Marreddy', date: '2026-06-15', status: 'Completed' },
                            ].map((rep, idx) => (
                              <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition">
                                <td className="py-3 font-semibold text-slate-800">{rep.name}</td>
                                <td className="py-3 text-slate-600">{rep.doc}</td>
                                <td className="py-3 text-slate-500">{rep.date}</td>
                                <td className="py-3">
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                    {rep.status}
                                  </span>
                                </td>
                                <td className="py-3 text-right">
                                  <button
                                    onClick={() => addToast('Download Started', `Downloading PDF for ${rep.name}...`, 'success')}
                                    className="px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold rounded-lg text-[10px]"
                                  >
                                    Download PDF
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {portalActiveSubTab === 'prescriptions' && (
                    <div className="space-y-4">
                      <h3 className="font-bold text-slate-800 text-sm">Active & Past Outpatient Prescriptions</h3>
                      <div className="space-y-3">
                        {[
                          { med: 'Atorvastatin 10mg', ins: '1 tablet once daily at bedtime', duration: '30 days', doc: 'Dr. Vikram Reddy', date: '2026-07-10' },
                          { med: 'Metformin 500mg', ins: '1 tablet twice daily after breakfast & dinner', duration: '60 days', doc: 'Dr. Vikram Reddy', date: '2026-07-10' },
                        ].map((rx, idx) => (
                          <div key={idx} className="p-4 border border-slate-100 rounded-2xl flex justify-between items-start hover:bg-slate-50 transition">
                            <div className="space-y-1">
                              <div className="font-bold text-slate-900">{rx.med}</div>
                              <div className="text-slate-600">Instructions: {rx.ins}</div>
                              <div className="text-[10px] text-slate-400">Duration: {rx.duration} • Prescribed by {rx.doc} on {rx.date}</div>
                            </div>
                            <button
                              onClick={() => addToast('Print Job Sent', 'Opening print preview for Rx slip...', 'success')}
                              className="px-3 py-1 border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold rounded-lg text-[10px]"
                            >
                              Print
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {portalActiveSubTab === 'discharge' && (
                    <div className="space-y-4">
                      <h3 className="font-bold text-slate-800 text-sm">IPD Inpatient Discharge Summaries</h3>
                      <div className="p-4 border border-slate-100 rounded-2xl flex justify-between items-center hover:bg-slate-50 transition">
                        <div>
                          <div className="font-bold text-slate-950">Acute Gastroenteritis Admission Summary</div>
                          <div className="text-slate-500">Admitted: 2026-05-10 • Discharged: 2026-05-12</div>
                          <div className="text-[10px] text-slate-400">Division: Gastroenterology Care • Dr. S. K. Gupta</div>
                        </div>
                        <button
                          onClick={() => addToast('Summary Download', 'Downloading DischargeSummary_May2026.pdf...', 'success')}
                          className="px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold rounded-lg text-[10px]"
                        >
                          Download PDF
                        </button>
                      </div>
                    </div>
                  )}

                  {portalActiveSubTab === 'invoices' && (
                    <div className="space-y-4">
                      <h3 className="font-bold text-slate-800 text-sm">Financial Statements & Receipts</h3>
                      <div className="space-y-2">
                        {[
                          { id: 'INV-2026-0710', desc: 'Lab Investigations (Lipid + CBC)', amount: '₹1,800', status: 'Paid' },
                          { id: 'INV-2026-0512', desc: 'IPD Admission Settled Bill', amount: '₹12,500', status: 'Paid' },
                          { id: 'INV-2026-0726', desc: 'OPD Consultation Fee', amount: '₹500', status: 'Unpaid/Pending' },
                        ].map((inv, idx) => (
                          <div key={idx} className="p-4 border border-slate-100 rounded-2xl flex justify-between items-center hover:bg-slate-50 transition">
                            <div>
                              <div className="font-bold text-slate-900">{inv.desc}</div>
                              <div className="text-slate-400 text-[10px]">Invoice ID: {inv.id}</div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-slate-900">{inv.amount}</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${inv.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                                {inv.status}
                              </span>
                              {inv.status === 'Unpaid/Pending' && (
                                <button
                                  onClick={() => {
                                    setPayUhid(portalUser?.uhid || '');
                                    setPayBillNo(inv.id);
                                    setPayAmount('500');
                                    setPayType('OPD');
                                    setActiveTab('pay-online');
                                  }}
                                  className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-[10px]"
                                >
                                  Pay Now
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Pay Online */}
        {activeTab === 'pay-online' && (
          <div className="px-4 md:px-12 py-12 max-w-md mx-auto space-y-6">
            <div className="text-center space-y-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                Payment Gateways
              </span>
              <h2 className="text-3xl font-black text-slate-900">Pay Hospital Bill Online</h2>
              <p className="text-xs text-slate-500">Secure online gateway for outpatient care and inpatient deposits.</p>
            </div>

            {payStatus === 'form' && (
              <form onSubmit={handlePaySubmit} className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 text-xs">
                <div>
                  <label className="block text-slate-600 mb-1">Enter UHID (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. UHID-908123"
                    value={payUhid}
                    onChange={(e) => setPayUhid(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Enter Bill Number or Admission ID</label>
                  <input
                    type="text"
                    placeholder="e.g. BILL-2026-8801"
                    value={payBillNo}
                    onChange={(e) => setPayBillNo(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Select Payment Category</label>
                  <select
                    value={payType}
                    onChange={(e: any) => setPayType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                  >
                    <option value="OPD">OPD Consultation Charges</option>
                    <option value="IPD_Deposit">IPD / Emergency Advance Deposit</option>
                    <option value="Final_Bill">Final Hospital Bill Settlement</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Amount to Pay (INR) *</label>
                  <input
                    type="number"
                    placeholder="e.g. 500"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                    required
                  />
                </div>

                <div className="space-y-2 pt-2">
                  <label className="block text-slate-600">Select Payment Method</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'upi', label: '📱 UPI (GPay/PhonePe)' },
                      { id: 'card', label: '💳 Card' },
                      { id: 'netbanking', label: '🌐 Net Banking' }
                    ].map((method) => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setPayMethod(method.id as any)}
                        className={`py-2 rounded-xl text-[10px] font-bold border transition ${
                          payMethod === method.id
                            ? 'bg-emerald-50 border-emerald-600 text-emerald-800'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {method.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 mt-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition"
                >
                  Pay ₹{payAmount || '0'} Now
                </button>
              </form>
            )}

            {payStatus === 'processing' && (
              <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm text-center space-y-4">
                <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <h3 className="font-bold text-slate-900 text-sm">Processing Secure Transaction...</h3>
                <p className="text-[10px] text-slate-500">Do not hit back or refresh. Authenticating via Payment Gateway...</p>
              </div>
            )}

            {payStatus === 'success' && (
              <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-lg text-center space-y-4 text-xs">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                  ✓
                </div>
                <h3 className="font-black text-slate-900 text-sm">Payment Successful!</h3>
                <p className="text-[10px] text-slate-500">Receipt generated and sent via SMS/WhatsApp.</p>

                <div className="border-t border-b border-slate-100 py-3 space-y-2 text-left text-[11px]">
                  <div className="flex justify-between"><span className="text-slate-500">Transaction ID:</span> <span className="font-mono text-slate-800 font-bold">{payTxnId}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Bill / Admission No:</span> <span className="text-slate-800 font-bold">{payBillNo}</span></div>
                  {payUhid && <div className="flex justify-between"><span className="text-slate-500">Patient UHID:</span> <span className="text-slate-800 font-bold">{payUhid}</span></div>}
                  <div className="flex justify-between"><span className="text-slate-500">Amount Paid:</span> <span className="text-emerald-600 font-bold">₹{payAmount}</span></div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setPayStatus('form');
                    setPayAmount('');
                    setPayBillNo('');
                    setPayUhid('');
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs"
                >
                  Pay Another Bill
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Lab Report Lookup Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" /> Download Patient Lab Reports
              </h3>
              <button onClick={() => setIsReportModalOpen(false)} className="text-slate-400"><X className="w-4 h-4" /></button>
            </div>
            <div>
              <label className="block text-slate-600 mb-1">Enter Patient UHID or Phone Number</label>
              <input
                type="text"
                placeholder="e.g. UHID-908123 or 9849012345"
                value={lookupUhid}
                onChange={(e) => setLookupUhid(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
              />
            </div>
            <button
              onClick={() => {
                addToast('Lab Report Found', 'Downloading Lab_Report_CBC_Lipid.pdf...', 'success');
                setIsReportModalOpen(false);
              }}
              className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" /> Download PDF Report
            </button>
          </div>
        </div>
      )}

      {/* Pay Hospital Bill Modal */}
      {isBillModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" /> Pay Hospital Bill Online
              </h3>
              <button onClick={() => setIsBillModalOpen(false)} className="text-slate-400"><X className="w-4 h-4" /></button>
            </div>
            <div>
              <label className="block text-slate-600 mb-1">Enter IPD / OPD Bill Number</label>
              <input
                type="text"
                placeholder="e.g. BILL-2026-8801"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
              />
            </div>
            <button
              onClick={() => {
                addToast('Payment Gateway Redirect', 'Redirecting to Razorpay / PhonePe Gateway...', 'success');
                setIsBillModalOpen(false);
              }}
              className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold"
            >
              Proceed to Pay via UPI / Cards
            </button>
          </div>
        </div>
      )}

      {/* Floating Emergency Banner */}
      <div className="fixed bottom-4 left-4 z-40 bg-rose-600 text-white p-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
        <Siren className="w-6 h-6 text-white animate-pulse shrink-0" />
        <div className="text-xs">
          <div className="font-extrabold text-white">24/7 Nellore Emergency & Ambulance</div>
          <div className="text-[10px] text-rose-100 font-mono">Hotline: 0861-2345678</div>
        </div>
        <a
          href="tel:08612345678"
          className="px-3 py-1.5 rounded-xl bg-white text-rose-600 text-[10px] font-bold shrink-0 shadow-xs"
        >
          Call Now
        </a>
      </div>

      {/* Booking Wizard Modal */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Smart Appointment Booking Wizard (Step {bookingStep}/3)
              </h3>
              <button onClick={() => setIsBookingModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {bookingStep === 1 && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Select Department</label>
                  <select
                    value={bookingDept}
                    onChange={(e) => setBookingDept(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Select Doctor Specialist</label>
                  <select
                    value={bookingDoctor.id}
                    onChange={(e) => {
                      const d = doctors.find((doc) => doc.id === e.target.value);
                      if (d) setBookingDoctor(d);
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold text-blue-600"
                  >
                    {doctors.map((doc) => (
                      <option key={doc.id} value={doc.id}>
                        {doc.name} ({doc.specialization})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <label className="block text-slate-600 mb-1 font-medium">Choose Appointment Model</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setBookingModel('Premium Slot')}
                      className={`p-2.5 rounded-xl border text-left transition ${
                        bookingModel === 'Premium Slot'
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-bold'
                          : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      <div className="text-xs">Premium Fixed Slot</div>
                      <div className="text-[10px] font-mono mt-0.5">₹{bookingDoctor.premiumFee} • 10-Min Reserved</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setBookingModel('Normal Queue')}
                      className={`p-2.5 rounded-xl border text-left transition ${
                        bookingModel === 'Normal Queue'
                          ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold'
                          : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      <div className="text-xs">Normal Queue</div>
                      <div className="text-[10px] font-mono mt-0.5">₹{bookingDoctor.consultationFee} • Queue Token</div>
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setBookingStep(2)}
                  className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-bold"
                >
                  Continue to Select Slot →
                </button>
              </div>
            )}

            {bookingStep === 2 && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-600 mb-1 font-medium font-mono">Available Premium Time Slots for Tomorrow</label>
                  <div className="grid grid-cols-3 gap-2 font-mono">
                    {['10:00 AM', '10:10 AM', '10:20 AM', '10:30 AM', '11:00 AM', '11:15 AM'].map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setBookingTime(time)}
                        className={`py-2 rounded-xl border text-center transition ${
                          bookingTime === time
                            ? 'bg-blue-600 text-white font-bold border-blue-600'
                            : 'bg-slate-50 border-slate-200 text-slate-800'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setBookingStep(1)}
                    className="px-4 py-2 rounded-xl bg-slate-200 text-slate-700"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setBookingStep(3)}
                    className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold"
                  >
                    Enter Patient Details →
                  </button>
                </div>
              </div>
            )}

            {bookingStep === 3 && (
              <form onSubmit={handleBookingSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Patient Full Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Kavitha Venkatram"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-600 mb-1 font-medium">Mobile Phone *</label>
                    <input
                      type="text"
                      placeholder="+91 98490 00000"
                      value={patientPhone}
                      onChange={(e) => setPatientPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1 font-medium">Age & Gender</label>
                    <input
                      type="number"
                      placeholder="Age (e.g. 45)"
                      value={patientAge}
                      onChange={(e) => setPatientAge(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                    />
                  </div>
                </div>

                <div className="flex justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setBookingStep(2)}
                    className="px-4 py-2 rounded-xl bg-slate-200 text-slate-700"
                  >
                    Back
                  </button>
                  <button type="submit" className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold">
                    Confirm & Reserve Slot
                  </button>
                </div>
              </form>
            )}

            {bookingStep === 4 && (
              <div className="p-6 text-center space-y-4 text-xs">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="text-lg font-bold text-slate-900">Appointment Reserved Successfully!</h4>
                <p className="text-slate-600">
                  Confirmation sent to <span className="text-blue-600 font-bold">{patientPhone}</span> via SMS & WhatsApp.
                </p>
                <button
                  onClick={() => setIsBookingModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold"
                >
                  <option>10:00 AM</option>
                  <option>12:30 PM</option>
                  <option>03:00 PM</option>
                  <option>05:30 PM</option>
                </select>
              </label>
            </div>
            <div className="chosen-doctor">
              <img src={selectedDoctor.image} alt="" />
              <span>
                <small>Requesting an appointment with</small>
                <strong>{selectedDoctor.name}</strong>
              </span>
              <ChevronDown size={16} />
            </div>
            <button className="button button-primary full-button">
              Request appointment <ArrowRight size={17} />
            </button>
            <p className="modal-footnote">
              <Clock3 size={14} /> Our team responds within one working hour.
            </p>
          </form>
        </div>
      )}

      {/* Public Website Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 mt-16 px-4 md:px-12 py-12 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <h3 className="text-white font-extrabold text-sm">Bhaskar Reddy Hospital</h3>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Leading multi-specialty and women healthcare hospital in Pogathota, Nellore, Andhra Pradesh.
            </p>
            <div className="text-[10px] text-slate-500 font-mono">Near Vijayamahal Gate, Pogathota, Nellore - 524001</div>
          </div>

          <div>
            <h4 className="text-white font-bold text-xs mb-3">Quick Navigation</h4>
            <div className="space-y-1.5 text-[11px]">
              <div><button onClick={() => setActiveTab('doctors')} className="hover:text-cyan-400">Find a Doctor</button></div>
              <div><button onClick={() => setActiveTab('departments')} className="hover:text-cyan-400">Specialty Divisions</button></div>
              <div><button onClick={() => setActiveTab('packages')} className="hover:text-cyan-400">Health Checkup Packages</button></div>
              <div><button onClick={() => setActiveTab('gallery')} className="hover:text-cyan-400">Virtual Facility Tour</button></div>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold text-xs mb-3">Emergency & Contact</h4>
            <div className="space-y-1.5 text-[11px]">
              <div>Emergency Hotline: <span className="text-rose-400 font-bold">0861-2345678</span></div>
              <div>Ambulance Dispatch: <span className="text-cyan-400 font-bold">+91 98490 11223</span></div>
              <div>Email: <span className="text-slate-300">care@bhaskarreddyhospital.com</span></div>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold text-xs mb-3">Patient Resources</h4>
            <div className="space-y-1.5 text-[11px]">
              <div><button onClick={() => setIsReportModalOpen(true)} className="hover:text-cyan-400">Download Lab Reports</button></div>
              <div><button onClick={() => setIsBillModalOpen(true)} className="hover:text-cyan-400">Pay Hospital Bill Online</button></div>
              <div><button onClick={() => setActiveTab('contact')} className="hover:text-cyan-400">Inquiry & Location</button></div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 mt-8 border-t border-slate-800 flex justify-between items-center text-[10px]">
          <div>© 2026 Bhaskar Reddy Hospital, Nellore. All rights reserved.</div>
          <div>Empanelled under Dr. YSR Aarogyasri Scheme</div>
        </div>
      </footer>
    </div>
  );
};

const Page: React.FC<{
  title: string;
  intro: string;
  kicker: string;
  children: React.ReactNode;
}> = ({ title, intro, kicker, children }) => (
  <main className="inner-page">
    <section className="page-heading">
      <p className="eyebrow">
        <span className="eyebrow-dot" /> {kicker}
      </p>
      <h1>{title}</h1>
      <p>{intro}</p>
    </section>
    <section className="page-content">{children}</section>
  </main>
);

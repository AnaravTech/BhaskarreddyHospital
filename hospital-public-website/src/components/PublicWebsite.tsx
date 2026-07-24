import React, { useState } from 'react';
import { useWebsite } from '../context/WebsiteContext';
import {
  Activity,
  Siren,
  Search,
  Calendar,
  ShieldCheck,
  Star,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  X,
  Quote,
} from 'lucide-react';

export const PublicWebsite: React.FC = () => {
  const {
    doctors,
    departments,
    healthPackages,
    blogPosts,
    galleryItems,
    testimonials,
    addAppointment,
    addContactInquiry,
    addToast,
    setActiveView,
  } = useWebsite();

  const [activeTab, setActiveTab] = useState<'home' | 'doctors' | 'departments' | 'packages' | 'gallery' | 'blog' | 'careers' | 'contact'>('home');

  // Doctor Search
  const [docSearchQuery, setDocSearchQuery] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('All');

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
  const [applicantRole, setApplicantRole] = useState('Staff Nurse');

  const filteredDoctors = doctors.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(docSearchQuery.toLowerCase()) ||
      doc.specialization.toLowerCase().includes(docSearchQuery.toLowerCase());
    const matchesDept = selectedDeptFilter === 'All' || doc.departmentName === selectedDeptFilter;
    return matchesSearch && matchesDept;
  });

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName || !patientPhone) return;

    addAppointment({
      patientName,
      patientPhone,
      patientAge: Number(patientAge) || 35,
      patientGender,
      doctorName: bookingDoctor.name,
      departmentName: bookingDoctor.departmentName,
      appointmentDate: '2026-07-25',
      appointmentTime: bookingTime,
      model: bookingModel,
      fee: bookingModel === 'Premium Slot' ? bookingDoctor.premiumFee : bookingDoctor.consultationFee,
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

  const handleCareerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantName) return;

    addToast('Application Received', `Received job application for ${applicantRole} position from ${applicantName}.`, 'success');
    setApplicantName('');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-600 selection:text-white flex flex-col justify-between">
      <div>
        {/* Top Notification Bar */}
        <div className="bg-slate-900 text-slate-200 py-2 px-4 md:px-12 flex items-center justify-between text-xs border-b border-slate-800">
          <div className="flex items-center gap-2 text-cyan-400 font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Bhaskar Reddy Hospital • Official Healthcare Portal</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveView('public-website')}
              className="px-2.5 py-1 rounded bg-blue-600 text-white font-bold text-[10px]"
            >
              🌐 Public Patient Website
            </button>
            <button
              onClick={() => setActiveView('website-cms')}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-[10px]"
            >
              ⚙️ Website CMS Admin
            </button>
          </div>
        </div>

        {/* Main Navigation Header (Clean White Theme) */}
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
              <p className="text-[10px] text-slate-500 font-medium">Multi-Specialty & Cardiac Institute</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold">
            {[
              { id: 'home', label: 'Home' },
              { id: 'doctors', label: 'Find Doctors' },
              { id: 'departments', label: 'Departments' },
              { id: 'packages', label: 'Health Checkups' },
              { id: 'gallery', label: 'Virtual Tour' },
              { id: 'blog', label: 'Health Blog' },
              { id: 'careers', label: 'Careers' },
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
            {/* Hero Section (Clean Light Backdrop) */}
            <section className="relative px-4 md:px-12 py-16 md:py-24 bg-gradient-to-b from-blue-50/60 via-slate-50 to-white overflow-hidden">
              <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                <div className="lg:col-span-7 space-y-6">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-100/80 border border-blue-200 text-blue-800 text-xs font-semibold">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span>24/7 Level-1 Trauma & Multi-Specialty Hospital</span>
                  </div>

                  <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
                    World-Class Healthcare Dedicated to <span className="text-blue-600">Your Family's Trust</span>
                  </h1>

                  <p className="text-slate-600 text-sm md:text-base leading-relaxed max-w-2xl">
                    Equipped with 4th Gen Robotic Joint Replacement, 24/7 Cath Lab & Emergency Resuscitation, 
                    and over 45+ renowned medical specialists delivering compassionate clinical care.
                  </p>

                  <div className="flex flex-wrap items-center gap-4 pt-2">
                    <button
                      onClick={() => {
                        setIsBookingModalOpen(true);
                        setBookingStep(1);
                      }}
                      className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-600/25 transition transform hover:-translate-y-0.5"
                    >
                      <span>Instant Appointment Booking</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <a
                      href="tel:040-23456789"
                      className="flex items-center gap-2.5 px-5 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-rose-600 border border-rose-200 shadow-xs text-xs font-bold transition"
                    >
                      <Siren className="w-4 h-4 text-rose-600 animate-pulse" />
                      <span>Emergency Hotline: 040-23456789</span>
                    </a>
                  </div>
                </div>

                <div className="lg:col-span-5 relative">
                  <div className="p-3 rounded-3xl bg-white border border-slate-200 shadow-xl">
                    <img
                      src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&auto=format&fit=crop&q=80"
                      alt="Bhaskar Reddy Hospital Facility"
                      className="w-full h-80 md:h-96 rounded-2xl object-cover"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* WOW Factor 1: Animated Overview Counters (Clean White Cards) */}
            <section className="px-4 md:px-12 py-12 bg-white border-y border-slate-200">
              <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-xs space-y-1">
                  <div className="text-3xl md:text-4xl font-black text-blue-600 font-mono">250,000+</div>
                  <div className="text-xs text-slate-600 font-semibold">Patients Treated</div>
                </div>
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-xs space-y-1">
                  <div className="text-3xl md:text-4xl font-black text-emerald-600 font-mono">25+</div>
                  <div className="text-xs text-slate-600 font-semibold">Years of Medical Excellence</div>
                </div>
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-xs space-y-1">
                  <div className="text-3xl md:text-4xl font-black text-indigo-600 font-mono">45+</div>
                  <div className="text-xs text-slate-600 font-semibold">Senior Specialists & Doctors</div>
                </div>
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-xs space-y-1">
                  <div className="text-3xl md:text-4xl font-black text-amber-600 font-mono">50,000+</div>
                  <div className="text-xs text-slate-600 font-semibold">Successful Surgeries</div>
                </div>
              </div>
            </section>

            {/* WOW Factor 2: Doctor Finder */}
            <section className="px-4 md:px-12 py-16 max-w-7xl mx-auto space-y-8">
              <div className="text-center space-y-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                  WOW Factor 2
                </span>
                <h2 className="text-3xl font-black text-slate-900">Find Your Specialist Doctor</h2>
                <p className="text-xs text-slate-500 max-w-xl mx-auto">
                  Search our panel of interventional cardiologists, neurosurgeons, robotic joint specialists, and emergency physicians.
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

            {/* WOW Factor 4: Interactive Department Explorer */}
            <section className="px-4 md:px-12 py-16 bg-slate-100/60 border-y border-slate-200">
              <div className="max-w-7xl mx-auto space-y-8">
                <div className="text-center space-y-2">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                    WOW Factor 4
                  </span>
                  <h2 className="text-3xl font-black text-slate-900">Interactive Department Explorer</h2>
                  <p className="text-xs text-slate-500">
                    Discover specialized care, procedures, and technology across our departments.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {departments.map((dept) => (
                    <div
                      key={dept.id}
                      className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-blue-500 hover:shadow-md transition space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-extrabold text-slate-900">{dept.name}</h3>
                        <span className="font-mono text-[10px] text-blue-700 font-bold px-2 py-0.5 bg-blue-50 rounded">
                          {dept.code}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">{dept.description}</p>

                      <div className="space-y-1">
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Services & Procedures:</div>
                        <div className="flex flex-wrap gap-1">
                          {dept.services?.map((srv) => (
                            <span key={srv} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px]">
                              {srv}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-xs">
                        <span className="text-slate-500">Head: {dept.headDoctor.split(',')[0]}</span>
                        <button
                          onClick={() => {
                            setIsBookingModalOpen(true);
                            setBookingStep(1);
                          }}
                          className="text-blue-600 font-bold hover:underline"
                        >
                          Book Slot →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* WOW Factor 5: Hospital Journey Timeline */}
            <section className="px-4 md:px-12 py-16 max-w-7xl mx-auto space-y-8">
              <div className="text-center space-y-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                  WOW Factor 5
                </span>
                <h2 className="text-3xl font-black text-slate-900">Hospital Journey & Milestones</h2>
                <p className="text-xs text-slate-500">Over 25 years of relentless healthcare innovation</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                  <div className="font-mono font-black text-blue-600 text-lg">1998</div>
                  <div className="font-bold text-slate-900">Inception of Bhaskar Reddy Hospital</div>
                  <p className="text-slate-500 text-[11px]">Started as a 50-bed community hospital in Gachibowli.</p>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                  <div className="font-mono font-black text-indigo-600 text-lg">2008</div>
                  <div className="font-bold text-slate-900">24/7 Cardiac Cath Lab Wing</div>
                  <p className="text-slate-500 text-[11px]">Launched dedicated interventional cardiology unit.</p>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                  <div className="font-mono font-black text-purple-600 text-lg">2018</div>
                  <div className="font-bold text-slate-900">Robotic Joint Replacement Suite</div>
                  <p className="text-slate-500 text-[11px]">Pioneered robotic total knee replacement in Hyderabad.</p>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                  <div className="font-mono font-black text-emerald-600 text-lg">2026</div>
                  <div className="font-bold text-slate-900">Anarav AI Hospital Operating System</div>
                  <p className="text-slate-500 text-[11px]">Deployed digital health platform for zero-latency care.</p>
                </div>
              </div>
            </section>

            {/* Preventive Health Checkup Packages */}
            <section className="px-4 md:px-12 py-16 bg-blue-50/40 border-y border-slate-200">
              <div className="max-w-7xl mx-auto space-y-8">
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-black text-slate-900">Preventive Health Checkup Packages</h2>
                  <p className="text-xs text-slate-500">Comprehensive health screenings for peace of mind</p>
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

            {/* Testimonials */}
            <section className="px-4 md:px-12 py-16 bg-white">
              <div className="max-w-7xl mx-auto space-y-8">
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-black text-slate-900">Patient Testimonials & Reviews</h2>
                  <p className="text-xs text-slate-500">Real recovery stories from patients treated at Bhaskar Reddy Hospital</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {testimonials.map((t) => (
                    <div key={t.id} className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                      <Quote className="w-8 h-8 text-blue-500/30" />
                      <p className="text-xs text-slate-700 italic leading-relaxed">"{t.reviewText}"</p>

                      <div className="flex items-center gap-3 pt-2 border-t border-slate-200">
                        <img src={t.photo} alt={t.patientName} className="w-10 h-10 rounded-full object-cover" />
                        <div>
                          <div className="text-xs font-bold text-slate-900">{t.patientName} ({t.age} yrs)</div>
                          <div className="text-[10px] text-blue-600 font-semibold">{t.treatment} • Treated by {t.doctorName}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}

        {/* Doctor Directory */}
        {activeTab === 'doctors' && (
          <div className="px-4 md:px-12 py-12 max-w-7xl mx-auto space-y-6">
            <h2 className="text-2xl font-black text-slate-900">Our Senior Medical Specialists</h2>
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
                </div>
              ))}
            </div>
          </div>
        )}

        {/* WOW Factor 6: Virtual Facility Gallery */}
        {activeTab === 'gallery' && (
          <div className="px-4 md:px-12 py-12 max-w-7xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                WOW Factor 6
              </span>
              <h2 className="text-3xl font-black text-slate-900">Virtual Hospital Tour & Infrastructure</h2>
              <p className="text-xs text-slate-500">Explore our Operation Theatres, ICUs, and Patient Suites</p>
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

        {/* Careers */}
        {activeTab === 'careers' && (
          <div className="px-4 md:px-12 py-12 max-w-3xl mx-auto space-y-6">
            <h2 className="text-2xl font-black text-slate-900">Join Our Healthcare Team</h2>
            <p className="text-xs text-slate-500">Explore open opportunities for Staff Nurses, RMOs, and Technicians.</p>

            <form onSubmit={handleCareerSubmit} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 mb-1">Full Name *</label>
                <input
                  type="text"
                  placeholder="Applicant Name"
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1">Select Position</label>
                <select
                  value={applicantRole}
                  onChange={(e) => setApplicantRole(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                >
                  <option value="Staff Nurse (ICU/OT)">Staff Nurse (ICU/OT)</option>
                  <option value="Resident Medical Officer (RMO)">Resident Medical Officer (RMO)</option>
                  <option value="Medical Counselor">Medical Counselor</option>
                  <option value="Radiology Technician">Radiology Technician</option>
                </select>
              </div>

              <button type="submit" className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold">
                Submit Online Application
              </button>
            </form>
          </div>
        )}

        {/* Contact */}
        {activeTab === 'contact' && (
          <div className="px-4 md:px-12 py-12 max-w-4xl mx-auto space-y-6">
            <h2 className="text-2xl font-black text-slate-900">Contact & Location</h2>
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
      </div>

      {/* Floating Emergency Banner */}
      <div className="fixed bottom-4 left-4 z-40 bg-rose-600 text-white p-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
        <Siren className="w-6 h-6 text-white animate-pulse shrink-0" />
        <div className="text-xs">
          <div className="font-extrabold text-white">24/7 Emergency & Ambulance Dispatch</div>
          <div className="text-[10px] text-rose-100 font-mono">Hotline: 040-23456789</div>
        </div>
        <a
          href="tel:040-23456789"
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
                  <label className="block text-slate-600 mb-1 font-medium">Available Premium Time Slots for Tomorrow</label>
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
                  Done & Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Public Website Footer (Deep Slate Blue) */}
      <footer className="bg-slate-900 border-t border-slate-800 mt-16 px-4 md:px-12 py-12 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <h3 className="text-white font-extrabold text-sm">Bhaskar Reddy Hospital</h3>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Leading multi-specialty institute providing 24/7 cardiac, trauma, and surgical healthcare services.
            </p>
            <div className="text-[10px] text-slate-500 font-mono">Gachibowli, Hyderabad, Telangana</div>
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
              <div>Emergency Hotline: <span className="text-rose-400 font-bold">040-23456789</span></div>
              <div>Ambulance Dispatch: <span className="text-cyan-400 font-bold">+91 98490 11223</span></div>
              <div>Email: <span className="text-slate-300">care@bhaskarreddyhospital.com</span></div>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold text-xs mb-3">Patient Resources</h4>
            <div className="space-y-1.5 text-[11px]">
              <div><button onClick={() => setActiveTab('blog')} className="hover:text-cyan-400">Health Tips & Blog</button></div>
              <div><button onClick={() => setActiveTab('careers')} className="hover:text-cyan-400">Careers & Recruitment</button></div>
              <div><button onClick={() => setActiveTab('contact')} className="hover:text-cyan-400">Inquiry & Feedback</button></div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 mt-8 border-t border-slate-800 flex justify-between items-center text-[10px]">
          <div>© 2026 Bhaskar Reddy Hospital. All rights reserved.</div>
          <div>NABH & NABL Accredited Healthcare Institute</div>
        </div>
      </footer>
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { useHospital } from '../../context/HospitalContext';
import type { UserSession, Patient } from '../../types';
import { PatientAuthModal } from './PatientAuthModal';
import { PatientDashboard } from './PatientDashboard';
import {
  Activity,
  Heart,
  Shield,
  Clock,
  UserCheck,
  Stethoscope,
  Building2,
  Calendar,
  Phone,
  Mail,
  MapPin,
  ChevronRight,
  Menu,
  X,
  Sparkles,
  ArrowRight,
  Award,
  AlertCircle,
  Pill,
  Microscope,
  Bed,
  CheckCircle2,
  Siren,
  Hospital,
  Flame,
  Radio,
  ExternalLink,
  ChevronDown,
  Crown,
  ShieldCheck,
  Users,
  Lock,
  KeyRound,
  LogIn,
  User,
  LogOut,
} from 'lucide-react';

// ─── Custom Hook for Animated Counter on Viewport Entry ──────────────────────
function useAnimatedCounter(endValue: number, duration = 2000, trigger = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!trigger) return;
    let startTimestamp: number | null = null;
    let frameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeProgress * endValue));

      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      } else {
        setCount(endValue);
      }
    };

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [endValue, duration, trigger]);

  return count;
}

export const PublicLandingPage: React.FC = () => {
  const { setAppMode, login, setActiveModule, currentPatient, patientLogout } = useHospital();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const [isPatientAuthModalOpen, setIsPatientAuthModalOpen] = useState(false);
  const [isPatientDashboardOpen, setIsPatientDashboardOpen] = useState(false);
  const statsRef = useRef<HTMLDivElement | null>(null);

  // Handlers for Anarav OS internal redirection
  const handleCeoLogin = () => {
    const ceoUser: UserSession = {
      id: 'user-ceo',
      name: 'Dr. Bhaskar Reddy',
      email: 'ceo@anaravhealth.com',
      role: 'ceo',
      roleTitle: 'Chief Executive Officer',
      department: 'Hospital Leadership & Governance',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
      defaultModule: 'dashboard',
    };
    login(ceoUser);
    setActiveModule('dashboard');
    setAppMode('hospital-os');
  };

  const handleAdminLogin = () => {
    const adminUser: UserSession = {
      id: 'user-admin',
      name: 'K. Somasekhar',
      email: 'admin@anaravhealth.com',
      role: 'admin',
      roleTitle: 'Hospital Administrator',
      department: 'Administration & Operations',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      defaultModule: 'settings',
    };
    login(adminUser);
    setActiveModule('settings');
    setAppMode('hospital-os');
  };

  const handleStaffLogin = () => {
    // Redirects to Anarav OS Staff Login / Operations portal
    setAppMode('hospital-os');
  };

  // Track scroll for sticky navbar compression & glassmorphism
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 24) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // IntersectionObserver for stats counter trigger
  useEffect(() => {
    const currentRef = statsRef.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsVisible(true);
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(currentRef);
    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, []);

  // Counters
  const countSpecialists = useAnimatedCounter(20, 1800, statsVisible);
  const countDepts = useAnimatedCounter(10, 1500, statsVisible);
  const countPatients = useAnimatedCounter(1000, 2200, statsVisible);

  // Smooth scroll handler
  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  // Render Patient Health Dashboard if patient is logged in & dashboard is open
  if (isPatientDashboardOpen && currentPatient) {
    return (
      <PatientDashboard
        patient={currentPatient}
        onLogout={() => {
          patientLogout();
          setIsPatientDashboardOpen(false);
        }}
        onBookAppointment={() => {
          setIsPatientDashboardOpen(false);
          setTimeout(() => scrollToSection('appointment-cta'), 150);
        }}
        onClose={() => setIsPatientDashboardOpen(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-cyan-600 selection:text-white relative overflow-x-hidden">
      
      {/* ─── 1. Header / Navbar ────────────────────────────────────────────── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-md py-3 border-b border-slate-200/80'
            : 'bg-white/80 backdrop-blur-sm py-4 md:py-5 border-b border-slate-100'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            
            {/* Brand Logo & Name */}
            <div
              onClick={() => scrollToSection('home')}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-700 p-0.5 shadow-md shadow-cyan-600/20 group-hover:scale-105 transition-transform duration-200">
                <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                  <Activity className="w-6 h-6 text-cyan-600" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-lg sm:text-xl text-slate-900 tracking-tight">
                    Bhaskar Reddy
                  </span>
                  <span className="text-xs font-bold text-cyan-700 bg-cyan-50 px-1.5 py-0.5 rounded border border-cyan-200/60 uppercase">
                    Hospital
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] font-medium text-slate-500 hidden sm:block">
                  Multi-Specialty & Research Institute
                </p>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-2">
              <button
                onClick={() => scrollToSection('home')}
                className="px-3 py-2 text-sm font-semibold text-slate-700 hover:text-cyan-700 hover:bg-slate-100/80 rounded-lg transition"
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection('about')}
                className="px-3 py-2 text-sm font-semibold text-slate-700 hover:text-cyan-700 hover:bg-slate-100/80 rounded-lg transition"
              >
                About
              </button>
              <button
                onClick={() => scrollToSection('services')}
                className="px-3 py-2 text-sm font-semibold text-slate-700 hover:text-cyan-700 hover:bg-slate-100/80 rounded-lg transition"
              >
                Services
              </button>
              <button
                onClick={() => scrollToSection('doctors')}
                className="px-3 py-2 text-sm font-semibold text-slate-700 hover:text-cyan-700 hover:bg-slate-100/80 rounded-lg transition"
              >
                Doctors
              </button>
              <button
                onClick={() => scrollToSection('facilities')}
                className="px-3 py-2 text-sm font-semibold text-slate-700 hover:text-cyan-700 hover:bg-slate-100/80 rounded-lg transition"
              >
                Facilities
              </button>
              <button
                onClick={() => scrollToSection('contact')}
                className="px-3 py-2 text-sm font-semibold text-slate-700 hover:text-cyan-700 hover:bg-slate-100/80 rounded-lg transition"
              >
                Contact
              </button>
            </nav>

            {/* Navbar Primary Action Button & Login */}
            <div className="hidden sm:flex items-center gap-2.5">
              <a
                href="tel:1066"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200/80 rounded-lg hover:bg-rose-100 transition"
              >
                <Siren className="w-3.5 h-3.5 animate-pulse" />
                <span>24/7 Helpline: 1066</span>
              </a>

              {/* Patient Login & Active Portal Session (Navbar) */}
              {currentPatient ? (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    id="navbar-patient-portal-btn"
                    onClick={() => setIsPatientDashboardOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-900 text-xs sm:text-sm font-bold border border-cyan-200/90 transition shadow-xs cursor-pointer"
                    title="Open Your Patient Health Portal"
                  >
                    <User className="w-4 h-4 text-cyan-600" />
                    <span>{currentPatient.name.split(' ')[0]}</span>
                    <span className="font-mono text-[11px] text-cyan-700 bg-white px-1.5 py-0.2 rounded border border-cyan-200">
                      {currentPatient.uhid}
                    </span>
                  </button>
                  <button
                    type="button"
                    id="navbar-patient-logout-btn"
                    onClick={() => patientLogout()}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200/80 transition cursor-pointer"
                    title="Logout from Patient Portal"
                    aria-label="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  id="navbar-patient-login-btn"
                  onClick={() => setIsPatientAuthModalOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-700 hover:text-cyan-700 hover:bg-slate-100/90 border border-slate-200/90 bg-white transition shadow-xs cursor-pointer"
                  title="Patient Portal Login"
                >
                  <LogIn className="w-4 h-4 text-cyan-600" />
                  <span>Login</span>
                </button>
              )}

              <button
                onClick={() => scrollToSection('appointment-cta')}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-cyan-600/25 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                Book Appointment
              </button>
            </div>

            {/* Mobile Actions: Patient Login, Book, Hamburger Toggle */}
            <div className="flex items-center gap-2 md:hidden">
              {currentPatient ? (
                <button
                  onClick={() => setIsPatientDashboardOpen(true)}
                  className="px-2.5 py-1.5 rounded-lg border border-cyan-200 bg-cyan-50 text-cyan-800 font-bold text-xs shadow-xs flex items-center gap-1 cursor-pointer"
                >
                  <User className="w-3.5 h-3.5 text-cyan-600" />
                  <span>{currentPatient.uhid}</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsPatientAuthModalOpen(true)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:text-cyan-700 font-bold text-xs shadow-xs flex items-center gap-1 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5 text-cyan-600" />
                  <span>Login</span>
                </button>
              )}

              <button
                onClick={() => scrollToSection('appointment-cta')}
                className="px-3 py-1.5 rounded-lg bg-cyan-600 text-white font-bold text-xs shadow-sm cursor-pointer"
              >
                Book
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-700 hover:text-cyan-700 hover:bg-slate-100 focus:outline-none cursor-pointer"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-2 shadow-xl animate-in slide-in-from-top duration-200">
            <button
              onClick={() => scrollToSection('home')}
              className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-800 hover:bg-cyan-50 hover:text-cyan-700"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection('about')}
              className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-800 hover:bg-cyan-50 hover:text-cyan-700"
            >
              About Hospital
            </button>
            <button
              onClick={() => scrollToSection('services')}
              className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-800 hover:bg-cyan-50 hover:text-cyan-700"
            >
              Medical Services
            </button>
            <button
              onClick={() => scrollToSection('doctors')}
              className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-800 hover:bg-cyan-50 hover:text-cyan-700"
            >
              Meet Our Doctors
            </button>
            <button
              onClick={() => scrollToSection('facilities')}
              className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-800 hover:bg-cyan-50 hover:text-cyan-700"
            >
              Hospital Facilities
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-800 hover:bg-cyan-50 hover:text-cyan-700"
            >
              Contact & Location
            </button>

            {/* Mobile Patient Portal Section */}
            <div className="pt-2 border-t border-slate-100">
              {currentPatient ? (
                <div className="p-3 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900">{currentPatient.name}</div>
                    <div className="text-[11px] font-mono text-cyan-700 font-semibold">UHID: {currentPatient.uhid}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { setMobileMenuOpen(false); setIsPatientDashboardOpen(true); }}
                      className="px-3 py-1.5 rounded-xl bg-cyan-600 text-white text-xs font-bold shadow-xs cursor-pointer"
                    >
                      My Records
                    </button>
                    <button
                      onClick={() => { setMobileMenuOpen(false); patientLogout(); }}
                      className="p-1.5 rounded-xl text-rose-600 hover:bg-rose-100 cursor-pointer"
                      title="Logout"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => { setMobileMenuOpen(false); setIsPatientAuthModalOpen(true); }}
                  className="w-full py-2.5 px-3 rounded-xl bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 text-cyan-800 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <LogIn className="w-4 h-4 text-cyan-600" />
                  <span>Patient Health Portal Login</span>
                </button>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              <a
                href="tel:1066"
                className="w-full py-2.5 text-center text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 rounded-lg flex items-center justify-center gap-2"
              >
                <Siren className="w-4 h-4 animate-pulse" />
                Emergency Hotline: 1066
              </a>
              <button
                onClick={() => scrollToSection('appointment-cta')}
                className="w-full py-3 rounded-xl bg-cyan-600 text-white font-bold text-sm text-center shadow-md shadow-cyan-600/20 cursor-pointer"
              >
                Book Appointment
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ─── 2. Hero Section ───────────────────────────────────────────────── */}
      <section
        id="home"
        className="pt-28 pb-16 md:pt-36 md:pb-24 bg-gradient-to-b from-cyan-50/60 via-slate-50 to-white relative overflow-hidden"
      >
        {/* Subtle Decorative Ambient Background Blobs */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-r from-cyan-200/30 via-blue-200/20 to-teal-100/30 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="absolute -top-24 right-0 w-96 h-96 bg-cyan-100/40 rounded-full blur-2xl -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-100/80 border border-cyan-300/60 text-cyan-800 text-xs font-bold shadow-xs">
                <Shield className="w-3.5 h-3.5 text-cyan-600" />
                <span>NABH Accredited • Multi-Specialty Tertiary Care</span>
              </div>

              {/* Main Headline */}
              <div className="space-y-3">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
                  Bhaskar Reddy <br className="hidden sm:inline" />
                  <span className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Hospital
                  </span>
                </h1>
                <p className="text-xl sm:text-2xl font-bold text-slate-700 tracking-tight">
                  Compassionate Care. Advanced Medicine. Better Lives.
                </p>
              </div>

              {/* Supporting Narrative */}
              <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Welcome to Bhaskar Reddy Hospital, where clinical expertise meets patient-centered 
                compassion. Equipped with state-of-the-art diagnostic technologies, modular operation 
                theatres, and dedicated medical specialists available round the clock.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <button
                  onClick={() => scrollToSection('appointment-cta')}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-cyan-600/30 hover:shadow-cyan-600/40 hover:-translate-y-0.5 transition duration-200 flex items-center justify-center gap-2 group"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book Appointment</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <a
                  href="tel:1066"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white hover:bg-rose-50 text-rose-600 font-bold text-sm border-2 border-rose-200 hover:border-rose-300 shadow-sm transition duration-200 flex items-center justify-center gap-2 group"
                >
                  <Siren className="w-4 h-4 text-rose-500 animate-pulse" />
                  <span>Emergency Care: 1066</span>
                </a>
              </div>

              {/* Mini Trust Highlights */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>NABH Certified Protocols</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>24/7 Critical Trauma Bay</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Cashless Insurance TPA</span>
                </div>
              </div>
            </div>

            {/* Right Visual / Hero Graphic */}
            <div className="lg:col-span-5 relative flex justify-center">
              
              {/* Outer Decorative Ring */}
              <div className="relative w-full max-w-md aspect-[4/5] sm:aspect-square lg:aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-100">
                <img
                  src="https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80"
                  alt="Bhaskar Reddy Hospital Medical Team"
                  className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                
                {/* Visual Caption on Image */}
                <div className="absolute bottom-5 left-5 right-5 text-white">
                  <div className="flex items-center gap-2 text-cyan-300 text-xs font-bold mb-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Excellence in Healthcare</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold leading-tight drop-shadow-sm">
                    Modern Clinical Facilities & Experienced Medical Team
                  </h3>
                </div>
              </div>

              {/* Floating Element 1: 24/7 Emergency */}
              <div className="absolute -top-4 -left-4 sm:-left-8 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3 animate-float-slow">
                <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shadow-inner">
                  <Siren className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="text-xs font-extrabold text-slate-900">24/7 Emergency</div>
                  <div className="text-[11px] text-slate-500">Immediate Trauma Care</div>
                </div>
              </div>

              {/* Floating Element 2: Patient Rating */}
              <div className="absolute -bottom-5 -right-4 sm:-right-6 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3 animate-float-delayed">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500 shadow-inner">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-extrabold text-slate-900">4.9 ★ Rated Trust</div>
                  <div className="text-[11px] text-slate-500">1,000+ Satisfied Patients</div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ─── 3. Quick Hospital Highlights ──────────────────────────────────── */}
      <section className="py-8 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            
            {/* Highlight 1 */}
            <div className="p-5 rounded-2xl bg-slate-50 hover:bg-cyan-50/60 border border-slate-200/80 hover:border-cyan-200 transition-all duration-300 group hover:-translate-y-1 hover:shadow-md">
              <div className="w-11 h-11 rounded-xl bg-rose-100/80 text-rose-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Siren className="w-6 h-6" />
              </div>
              <h4 className="text-base font-extrabold text-slate-900 mb-1">24/7 Emergency</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Immediate response trauma resuscitation bays, cardiac care, and ready ALS ambulances.
              </p>
            </div>

            {/* Highlight 2 */}
            <div className="p-5 rounded-2xl bg-slate-50 hover:bg-cyan-50/60 border border-slate-200/80 hover:border-cyan-200 transition-all duration-300 group hover:-translate-y-1 hover:shadow-md">
              <div className="w-11 h-11 rounded-xl bg-blue-100/80 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <UserCheck className="w-6 h-6" />
              </div>
              <h4 className="text-base font-extrabold text-slate-900 mb-1">Experienced Doctors</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Distinguished specialists and surgeons with decades of collective tertiary care experience.
              </p>
            </div>

            {/* Highlight 3 */}
            <div className="p-5 rounded-2xl bg-slate-50 hover:bg-cyan-50/60 border border-slate-200/80 hover:border-cyan-200 transition-all duration-300 group hover:-translate-y-1 hover:shadow-md">
              <div className="w-11 h-11 rounded-xl bg-cyan-100/80 text-cyan-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Building2 className="w-6 h-6" />
              </div>
              <h4 className="text-base font-extrabold text-slate-900 mb-1">Advanced Facilities</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Modern modular OTs, digital catheterization lab, and fully computerized automated labs.
              </p>
            </div>

            {/* Highlight 4 */}
            <div className="p-5 rounded-2xl bg-slate-50 hover:bg-cyan-50/60 border border-slate-200/80 hover:border-cyan-200 transition-all duration-300 group hover:-translate-y-1 hover:shadow-md">
              <div className="w-11 h-11 rounded-xl bg-emerald-100/80 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Heart className="w-6 h-6" />
              </div>
              <h4 className="text-base font-extrabold text-slate-900 mb-1">Patient-Centered Care</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Transparent billing, ethical consultations, and personalized care pathways for every recovery.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ─── 4. About Hospital Section ─────────────────────────────────────── */}
      <section id="about" className="py-20 md:py-28 bg-slate-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Visual Image Grid */}
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-200">
                <img
                  src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&auto=format&fit=crop&q=80"
                  alt="Bhaskar Reddy Hospital Campus"
                  className="w-full h-80 sm:h-96 object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Floating Mission Badge */}
              <div className="absolute -bottom-6 -right-2 sm:right-6 bg-white p-5 rounded-2xl shadow-xl border border-slate-100 max-w-xs">
                <div className="flex items-center gap-2 text-cyan-600 font-bold text-xs mb-1">
                  <Activity className="w-4 h-4" />
                  <span>Our Healing Mission</span>
                </div>
                <p className="text-xs text-slate-600 italic">
                  &ldquo;Delivering healthcare with precision, dignity, and accessibility for all.&rdquo;
                </p>
              </div>
            </div>

            {/* Text & Narrative */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-100 text-cyan-800 text-xs font-bold">
                <Hospital className="w-3.5 h-3.5" />
                <span>About Bhaskar Reddy Hospital</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-snug">
                Pioneering Healthcare Excellence with a Heart for Humanity
              </h2>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Founded with the commitment to elevate medical care in the region, Bhaskar Reddy Hospital
                brings together multi-specialty clinical infrastructure, cutting-edge diagnostic technology,
                and an exceptional team of senior consultants and caring nurses.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-slate-900">Comprehensive Clinical Disciplines</h5>
                    <p className="text-xs text-slate-500">From interventional cardiology to emergency trauma and advanced orthopedics under one roof.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-slate-900">Patient Safety & NABH Compliance</h5>
                    <p className="text-xs text-slate-500">Zero-infection OT protocols, digital medication management, and transparent medical charting.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-slate-900">Community & Ethical Focus</h5>
                    <p className="text-xs text-slate-500">Committed to providing compassionate care with accessible consultation fee structures.</p>
                  </div>
                </div>
              </div>

              <div className="pt-3">
                <button
                  onClick={() => scrollToSection('facilities')}
                  className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-md transition duration-200 flex items-center gap-2"
                >
                  <span>Explore Facilities</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── 5. Hospital Statistics (Animated Counters) ─────────────────────── */}
      <section
        ref={statsRef}
        className="py-14 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white relative overflow-hidden"
      >
        {/* Subtle Background Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(6,182,212,0.15),transparent_50%)]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/80 px-3 py-1 rounded-full border border-cyan-800/60">
              Trusted Clinical Excellence
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
              Our Journey in Numbers
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Indicative hospital statistics reflecting our active departments and clinical reach.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            
            {/* Stat 1 */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs hover:border-cyan-500/40 transition">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-cyan-400 mb-1">
                {countSpecialists}+
              </div>
              <div className="text-sm font-bold text-slate-200">Specialists</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Senior Medical Consultants</div>
            </div>

            {/* Stat 2 */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs hover:border-cyan-500/40 transition">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-blue-400 mb-1">
                {countDepts}+
              </div>
              <div className="text-sm font-bold text-slate-200">Departments</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Multi-Specialty Centers</div>
            </div>

            {/* Stat 3 */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs hover:border-cyan-500/40 transition">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-emerald-400 mb-1">
                24/7
              </div>
              <div className="text-sm font-bold text-slate-200">Emergency Care</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Round-the-Clock Support</div>
            </div>

            {/* Stat 4 */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs hover:border-cyan-500/40 transition">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-purple-400 mb-1">
                {countPatients}+
              </div>
              <div className="text-sm font-bold text-slate-200">Patients Served</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Compassionate Consultations</div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── 6. Services Section ───────────────────────────────────────────── */}
      <section id="services" className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-100 text-cyan-800 text-xs font-bold mb-3">
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Comprehensive Healthcare</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Our Medical Services
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
              We provide a full spectrum of healthcare services designed to offer preventive, 
              curative, and rehabilitative care with advanced medical technology.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Service 1: OPD */}
            <div className="p-6 rounded-2xl bg-slate-50 hover:bg-cyan-50/50 border border-slate-200/80 hover:border-cyan-300 transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1.5 hover:shadow-lg">
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <UserCheck className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-2">OPD Services</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Daily outpatient consultations across cardiology, neurology, general medicine, and pediatrics.
                </p>
              </div>
              <button
                onClick={() => scrollToSection('appointment-cta')}
                className="mt-5 text-xs font-bold text-cyan-700 hover:text-cyan-800 flex items-center gap-1.5 group-hover:underline"
              >
                <span>View OPD Details</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Service 2: Emergency */}
            <div className="p-6 rounded-2xl bg-slate-50 hover:bg-rose-50/50 border border-slate-200/80 hover:border-rose-300 transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1.5 hover:shadow-lg">
              <div>
                <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Siren className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-2">Emergency Care</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  24/7 trauma triage, cardiac resuscitation, acute stroke intervention, and ALS ambulance dispatch.
                </p>
              </div>
              <a
                href="tel:1066"
                className="mt-5 text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1.5 group-hover:underline"
              >
                <span>24/7 Hotline: 1066</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Service 3: Specialist Consultation */}
            <div className="p-6 rounded-2xl bg-slate-50 hover:bg-cyan-50/50 border border-slate-200/80 hover:border-cyan-300 transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1.5 hover:shadow-lg">
              <div>
                <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-2">Specialist Consultation</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Senior board-certified physicians in Cardiology, Orthopedics, Neurosurgery, and Oncology.
                </p>
              </div>
              <button
                onClick={() => scrollToSection('doctors')}
                className="mt-5 text-xs font-bold text-cyan-700 hover:text-cyan-800 flex items-center gap-1.5 group-hover:underline"
              >
                <span>Meet Specialists</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Service 4: IPD / Inpatient Care */}
            <div className="p-6 rounded-2xl bg-slate-50 hover:bg-cyan-50/50 border border-slate-200/80 hover:border-cyan-300 transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1.5 hover:shadow-lg">
              <div>
                <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Bed className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-2">IPD / Inpatient Care</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Comfortable single rooms, semi-private suites, and general wards with round-the-clock nursing.
                </p>
              </div>
              <button
                onClick={() => scrollToSection('facilities')}
                className="mt-5 text-xs font-bold text-cyan-700 hover:text-cyan-800 flex items-center gap-1.5 group-hover:underline"
              >
                <span>Explore Inpatient</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Service 5: Pharmacy */}
            <div className="p-6 rounded-2xl bg-slate-50 hover:bg-cyan-50/50 border border-slate-200/80 hover:border-cyan-300 transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1.5 hover:shadow-lg">
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Pill className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-2">24/7 Pharmacy</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  In-house certified dispensary stocking genuine branded, surgical, and life-saving critical medicines.
                </p>
              </div>
              <span className="mt-5 text-xs font-bold text-slate-500 flex items-center gap-1">
                <span>In-House Counter</span>
              </span>
            </div>

            {/* Service 6: Clinical Laboratory */}
            <div className="p-6 rounded-2xl bg-slate-50 hover:bg-cyan-50/50 border border-slate-200/80 hover:border-cyan-300 transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1.5 hover:shadow-lg">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Microscope className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-2">Clinical Laboratory</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Automated hematology, biochemistry, microbiology, and fast digital report turnaround times.
                </p>
              </div>
              <span className="mt-5 text-xs font-bold text-slate-500 flex items-center gap-1">
                <span>NABL Standard Testing</span>
              </span>
            </div>

            {/* Service 7: Diagnostics */}
            <div className="p-6 rounded-2xl bg-slate-50 hover:bg-cyan-50/50 border border-slate-200/80 hover:border-cyan-300 transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1.5 hover:shadow-lg">
              <div>
                <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Activity className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-2">Diagnostics</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  High-definition digital X-Ray, 3D Echocardiography, Doppler Ultrasound, and computerized ECG.
                </p>
              </div>
              <span className="mt-5 text-xs font-bold text-slate-500 flex items-center gap-1">
                <span>Precision Imaging</span>
              </span>
            </div>

            {/* Service 8: Critical Care */}
            <div className="p-6 rounded-2xl bg-slate-50 hover:bg-cyan-50/50 border border-slate-200/80 hover:border-cyan-300 transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1.5 hover:shadow-lg">
              <div>
                <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Heart className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-2">Critical Care (ICU)</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Dedicated multi-bed intensive care unit with advanced mechanical ventilators & 1:1 nursing ratios.
                </p>
              </div>
              <span className="mt-5 text-xs font-bold text-rose-600 flex items-center gap-1">
                <span>Continuous Telemetry</span>
              </span>
            </div>

          </div>
        </div>
      </section>

      {/* ─── 7. Doctors Section ("Meet Our Specialists") ───────────────────── */}
      <section id="doctors" className="py-20 md:py-28 bg-slate-50 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-100 text-cyan-800 text-xs font-bold mb-3">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Medical Leadership</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Meet Our Specialists
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
              Our multidisciplinary medical team combines deep clinical expertise, renowned hospital
              experience, and a dedicated commitment to patient outcomes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Doctor 1 */}
            <div className="bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&auto=format&fit=crop&q=80"
                    alt="Dr. Vikram Reddy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 bg-cyan-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-xs">
                    18+ Yrs Exp
                  </div>
                </div>
                <div className="p-5">
                  <span className="text-[11px] font-bold text-cyan-700 uppercase tracking-wider">Cardiology</span>
                  <h4 className="text-base font-extrabold text-slate-900 mt-1">Dr. Vikram Reddy</h4>
                  <p className="text-xs text-slate-500 mt-0.5">MD, DM (Cardiology), FSCAI</p>
                  <p className="text-xs text-slate-600 mt-3 line-clamp-2">
                    Chief Interventional Cardiologist specializing in complex angioplasties and structural heart therapies.
                  </p>
                </div>
              </div>
              <div className="p-5 pt-0">
                <button
                  onClick={() => scrollToSection('appointment-cta')}
                  className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-cyan-600 hover:text-white text-slate-800 font-bold text-xs transition duration-200 flex items-center justify-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book Consultation</span>
                </button>
              </div>
            </div>

            {/* Doctor 2 */}
            <div className="bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1594824813566-88855ce78961?w=400&auto=format&fit=crop&q=80"
                    alt="Dr. Ananya Swaminathan"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 bg-cyan-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-xs">
                    14+ Yrs Exp
                  </div>
                </div>
                <div className="p-5">
                  <span className="text-[11px] font-bold text-cyan-700 uppercase tracking-wider">Neurosurgery</span>
                  <h4 className="text-base font-extrabold text-slate-900 mt-1">Dr. Ananya Swaminathan</h4>
                  <p className="text-xs text-slate-500 mt-0.5">MS, M.Ch (Neurosurgery)</p>
                  <p className="text-xs text-slate-600 mt-3 line-clamp-2">
                    Senior Brain & Spine Surgeon with clinical focus on minimally invasive spine surgery and stroke rescue.
                  </p>
                </div>
              </div>
              <div className="p-5 pt-0">
                <button
                  onClick={() => scrollToSection('appointment-cta')}
                  className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-cyan-600 hover:text-white text-slate-800 font-bold text-xs transition duration-200 flex items-center justify-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book Consultation</span>
                </button>
              </div>
            </div>

            {/* Doctor 3 */}
            <div className="bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&auto=format&fit=crop&q=80"
                    alt="Dr. Sameer Khan"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 bg-cyan-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-xs">
                    11+ Yrs Exp
                  </div>
                </div>
                <div className="p-5">
                  <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">Emergency & Trauma</span>
                  <h4 className="text-base font-extrabold text-slate-900 mt-1">Dr. Sameer Khan</h4>
                  <p className="text-xs text-slate-500 mt-0.5">MD (Emergency Medicine), MEM</p>
                  <p className="text-xs text-slate-600 mt-3 line-clamp-2">
                    Head of Trauma & Emergency Resuscitation leading round-the-clock level 1 emergency protocols.
                  </p>
                </div>
              </div>
              <div className="p-5 pt-0">
                <button
                  onClick={() => scrollToSection('appointment-cta')}
                  className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-cyan-600 hover:text-white text-slate-800 font-bold text-xs transition duration-200 flex items-center justify-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book Consultation</span>
                </button>
              </div>
            </div>

            {/* Doctor 4 */}
            <div className="bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80"
                    alt="Dr. Sunita Kulkarni"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 bg-cyan-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-xs">
                    12+ Yrs Exp
                  </div>
                </div>
                <div className="p-5">
                  <span className="text-[11px] font-bold text-cyan-700 uppercase tracking-wider">Internal Medicine</span>
                  <h4 className="text-base font-extrabold text-slate-900 mt-1">Dr. Sunita Kulkarni</h4>
                  <p className="text-xs text-slate-500 mt-0.5">MD (General Medicine), DNB</p>
                  <p className="text-xs text-slate-600 mt-3 line-clamp-2">
                    Consultant in Diabetology, metabolic disorders, infectious diseases, and comprehensive health checkups.
                  </p>
                </div>
              </div>
              <div className="p-5 pt-0">
                <button
                  onClick={() => scrollToSection('appointment-cta')}
                  className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-cyan-600 hover:text-white text-slate-800 font-bold text-xs transition duration-200 flex items-center justify-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book Consultation</span>
                </button>
              </div>
            </div>

          </div>

          <div className="mt-8 text-center text-xs text-slate-500 italic">
            * Doctor profiles and consulting schedules are placeholder demonstrations. Additional specialist schedules available at the front desk.
          </div>

        </div>
      </section>

      {/* ─── 8. Facilities Section ─────────────────────────────────────────── */}
      <section id="facilities" className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-100 text-cyan-800 text-xs font-bold mb-3">
              <Building2 className="w-3.5 h-3.5" />
              <span>Hospital Infrastructure</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              World-Class Facilities
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
              Designed according to international NABH safety guidelines, our medical infrastructure
              ensures maximum hygiene, quick clinical response, and superior patient comfort.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Facility 1: ICU */}
            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shadow-xs hover:shadow-lg transition-all duration-300 group">
              <div className="aspect-[16/10] overflow-hidden bg-slate-200">
                <img
                  src="https://images.unsplash.com/photo-1516549655169-df83a0774514?w=400&auto=format&fit=crop&q=80"
                  alt="Intensive Care Unit (ICU)"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-4">
                <h4 className="text-base font-bold text-slate-900">Intensive Care Unit (ICU)</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  High-tech multipara monitors, invasive ventilation, and dedicated 24/7 intensivist supervision.
                </p>
              </div>
            </div>

            {/* Facility 2: Operation Theatre */}
            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shadow-xs hover:shadow-lg transition-all duration-300 group">
              <div className="aspect-[16/10] overflow-hidden bg-slate-200">
                <img
                  src="https://images.unsplash.com/photo-1551076805-e1869033e561?w=400&auto=format&fit=crop&q=80"
                  alt="Modular Operation Theatre"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-4">
                <h4 className="text-base font-bold text-slate-900">Modular Operation Theatre</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Laminar airflow, HEPA filtration, anti-microbial surfaces, and modern surgical endoscopy units.
                </p>
              </div>
            </div>

            {/* Facility 3: Emergency Department */}
            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shadow-xs hover:shadow-lg transition-all duration-300 group">
              <div className="aspect-[16/10] overflow-hidden bg-slate-200">
                <img
                  src="https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=400&auto=format&fit=crop&q=80"
                  alt="Emergency Department"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-4">
                <h4 className="text-base font-bold text-slate-900">Emergency & Trauma Bay</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Direct ramp ambulance access, multi-bed trauma resuscitation bays, and emergency minor OT.
                </p>
              </div>
            </div>

            {/* Facility 4: Laboratory */}
            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shadow-xs hover:shadow-lg transition-all duration-300 group">
              <div className="aspect-[16/10] overflow-hidden bg-slate-200">
                <img
                  src="https://images.unsplash.com/photo-1579154204601-01588f351e67?w=400&auto=format&fit=crop&q=80"
                  alt="Clinical Laboratory"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-4">
                <h4 className="text-base font-bold text-slate-900">Clinical Laboratory</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Fully automated high-throughput analyzers ensuring fast, error-free diagnostic test reports.
                </p>
              </div>
            </div>

            {/* Facility 5: Pharmacy */}
            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shadow-xs hover:shadow-lg transition-all duration-300 group">
              <div className="aspect-[16/10] overflow-hidden bg-slate-200">
                <img
                  src="https://images.unsplash.com/photo-1586015555751-63c25e8a5b28?w=400&auto=format&fit=crop&q=80"
                  alt="24/7 Pharmacy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-4">
                <h4 className="text-base font-bold text-slate-900">24/7 In-House Pharmacy</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Stocked with critical injectables, cold-chain biologics, and everyday post-consultation medicines.
                </p>
              </div>
            </div>

            {/* Facility 6: Patient Rooms */}
            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shadow-xs hover:shadow-lg transition-all duration-300 group">
              <div className="aspect-[16/10] overflow-hidden bg-slate-200">
                <img
                  src="https://images.unsplash.com/photo-1512678080530-7760d81faba6?w=400&auto=format&fit=crop&q=80"
                  alt="Patient Rooms & Suites"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-4">
                <h4 className="text-base font-bold text-slate-900">Patient Rooms & Suites</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Quiet, hygienic private suites, deluxe AC rooms, and well-ventilated recovery wards.
                </p>
              </div>
            </div>

            {/* Facility 7: Diagnostics */}
            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shadow-xs hover:shadow-lg transition-all duration-300 group">
              <div className="aspect-[16/10] overflow-hidden bg-slate-200">
                <img
                  src="https://images.unsplash.com/photo-1516549655169-df83a0774514?w=400&auto=format&fit=crop&q=80"
                  alt="Diagnostic Imaging Facilities"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-4">
                <h4 className="text-base font-bold text-slate-900">Diagnostic Facilities</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Digital radiography, ultrasound color doppler, pulmonary function testing, and endoscopy suites.
                </p>
              </div>
            </div>

            {/* Facility 8: Ambulance */}
            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shadow-xs hover:shadow-lg transition-all duration-300 group">
              <div className="aspect-[16/10] overflow-hidden bg-slate-200">
                <img
                  src="https://images.unsplash.com/photo-1587745416684-47953f16f02f?w=400&auto=format&fit=crop&q=80"
                  alt="ALS Ambulance Fleet"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-4">
                <h4 className="text-base font-bold text-slate-900">ALS Ambulance Fleet</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Equipped with mobile transport ventilators, defibrillators, oxygen supply, and paramedic staff.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── 9. Why Choose Us Section ──────────────────────────────────────── */}
      <section id="why-us" className="py-20 md:py-28 bg-slate-50 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-100 text-cyan-800 text-xs font-bold mb-3">
              <Shield className="w-3.5 h-3.5" />
              <span>Why Choose Us</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Why Patients Trust Bhaskar Reddy Hospital
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
              We stand as a trusted healthcare partner for thousands of families through dedicated clinical excellence,
              patient-first integrity, and modern infrastructure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Reason 1 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-300 group hover:-translate-y-1">
              <div className="w-11 h-11 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <UserCheck className="w-6 h-6" />
              </div>
              <h4 className="text-base font-extrabold text-slate-900 mb-2">Experienced Medical Team</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Our senior clinicians and surgeons bring comprehensive expertise from leading medical institutions,
                delivering accurate diagnosis and personalized treatment plans.
              </p>
            </div>

            {/* Reason 2 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-300 group hover:-translate-y-1">
              <div className="w-11 h-11 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Heart className="w-6 h-6" />
              </div>
              <h4 className="text-base font-extrabold text-slate-900 mb-2">Patient-Focused Care</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                From pre-admission counseling to post-discharge recovery monitoring, your comfort, dignity,
                and speedy recovery remain our foremost priorities.
              </p>
            </div>

            {/* Reason 3 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-300 group hover:-translate-y-1">
              <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Building2 className="w-6 h-6" />
              </div>
              <h4 className="text-base font-extrabold text-slate-900 mb-2">Modern Medical Facilities</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                High-definition digital diagnostics, modern modular operating theatres, and clean sterile recovery
                wards built strictly to NABH accreditation benchmarks.
              </p>
            </div>

            {/* Reason 4 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-300 group hover:-translate-y-1">
              <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Clock className="w-6 h-6" />
              </div>
              <h4 className="text-base font-extrabold text-slate-900 mb-2">24/7 Emergency Support</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Always-awake trauma resuscitation team, on-call emergency surgical specialists, in-house blood bank
                coordination, and quick response ambulance dispatches.
              </p>
            </div>

            {/* Reason 5 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-300 group hover:-translate-y-1">
              <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6" />
              </div>
              <h4 className="text-base font-extrabold text-slate-900 mb-2">Easy Appointment Booking</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Streamlined outpatient registration with zero unnecessary waiting times and simplified token tracking
                for doctor consultations.
              </p>
            </div>

            {/* Reason 6 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-300 group hover:-translate-y-1">
              <div className="w-11 h-11 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6" />
              </div>
              <h4 className="text-base font-extrabold text-slate-900 mb-2">Comprehensive Healthcare</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Under one roof: Outpatient, Inpatient, Diagnostics, Pharmacy, Emergency, and Cashless Insurance TPA
                services for a seamless healing journey.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ─── 10. Appointment Call-to-Action (CTA) ─────────────────────────── */}
      <section id="appointment-cta" className="py-16 md:py-24 bg-gradient-to-tr from-slate-900 via-blue-900 to-cyan-900 text-white relative overflow-hidden">
        {/* Soft Radial Ambient Glow */}
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-xs font-bold mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Fast & Convenient Consultation</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">
            Your Health Is Our Priority
          </h2>

          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed mb-8">
            Book an appointment with our experienced medical professionals today. Our front desk and care 
            coordinators are ready to assist you with quick scheduling.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="tel:+918612345678"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-xl shadow-cyan-500/30 hover:shadow-cyan-500/40 hover:-translate-y-0.5 transition duration-200 flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Call Front Desk: +91 861 234 5678</span>
            </a>

            <button
              onClick={() => scrollToSection('contact')}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 backdrop-blur-xs transition duration-200 flex items-center justify-center gap-2"
            >
              <Mail className="w-4 h-4" />
              <span>Contact Us</span>
            </button>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-300">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              No Prepayment Required
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Same-Day Specialist Slots
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Dedicated Patient Assistance
            </span>
          </div>
        </div>
      </section>

      {/* ─── 11. Contact Preview Section ───────────────────────────────────── */}
      <section id="contact" className="py-20 md:py-28 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-100 text-cyan-800 text-xs font-bold mb-3">
              <MapPin className="w-3.5 h-3.5" />
              <span>Get In Touch</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Contact & Location
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
              Find our hospital campus, reach out for inquiry assistance, or connect with our 24/7 emergency dispatch.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Contact Details Cards */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* Address */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-sm font-bold text-slate-900">Hospital Address</h5>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Bhaskar Reddy Hospital Campus,<br />
                    Main Multi-Specialty Road, Nellore,<br />
                    Andhra Pradesh - 524001, India.
                  </p>
                </div>
              </div>

              {/* Phone Contacts */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-sm font-bold text-slate-900">Phone Numbers</h5>
                  <p className="text-xs text-slate-600 mt-1">
                    Front Desk: <a href="tel:+918612345678" className="font-semibold text-slate-800 hover:text-cyan-700">+91 861 234 5678</a>
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Appointments: <a href="tel:+918612345679" className="font-semibold text-slate-800 hover:text-cyan-700">+91 861 234 5679</a>
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-sm font-bold text-slate-900">Email Inquiry</h5>
                  <p className="text-xs text-slate-600 mt-1">
                    General: <a href="mailto:contact@bhaskarreddyhospital.com" className="font-semibold text-slate-800 hover:text-cyan-700">contact@bhaskarreddyhospital.com</a>
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Help Desk: <a href="mailto:helpdesk@bhaskarreddyhospital.com" className="font-semibold text-slate-800 hover:text-cyan-700">helpdesk@bhaskarreddyhospital.com</a>
                  </p>
                </div>
              </div>

              {/* 24/7 Emergency Availability */}
              <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <Siren className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h5 className="text-sm font-bold text-rose-900">Emergency Availability</h5>
                    <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Open 24/7</span>
                  </div>
                  <p className="text-xs text-rose-700 mt-1 leading-relaxed">
                    Trauma Bay, ICU admissions, and Ambulance Dispatch operational 24 hours a day, 365 days a year.
                  </p>
                </div>
              </div>

            </div>

            {/* Map Placeholder Graphic */}
            <div className="lg:col-span-7">
              <div className="h-full min-h-[380px] rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-xs p-6 flex flex-col justify-between relative">
                
                {/* Stylized Mock Map Visual */}
                <div className="relative w-full h-64 sm:h-72 rounded-2xl bg-gradient-to-br from-slate-100 via-cyan-50/40 to-slate-200 overflow-hidden border border-slate-200/80 flex items-center justify-center">
                  
                  {/* Grid Lines to simulate map cartography */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:28px_28px] opacity-70" />
                  
                  {/* Simulated Road network */}
                  <div className="absolute top-1/2 left-0 right-0 h-4 bg-slate-300/80 -translate-y-1/2" />
                  <div className="absolute top-0 bottom-0 left-1/3 w-3 bg-slate-300/80" />
                  <div className="absolute top-0 bottom-0 right-1/4 w-3 bg-slate-300/80" />

                  {/* Hospital Location Pin */}
                  <div className="relative z-10 flex flex-col items-center animate-bounce">
                    <div className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-xl border border-cyan-400 flex items-center gap-1.5 mb-1">
                      <Activity className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Bhaskar Reddy Hospital</span>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-rose-600 border-2 border-white shadow-lg flex items-center justify-center text-white">
                      <MapPin className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Location Legend Overlay */}
                  <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-slate-200 text-[11px] text-slate-600 font-medium">
                    📍 Nellore Main Medical Campus
                  </div>
                </div>

                <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <div className="text-xs text-slate-500">
                    * Interactive navigation map integration placeholder. Real Google Maps coordinates can be connected in settings.
                  </div>
                  <a
                    href="https://maps.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition shrink-0"
                  >
                    <span>Get Directions</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── 12. Hospital Footer & Anarav OS Governance Access ─────────────── */}
      <footer className="bg-slate-950 text-slate-400 border-t border-slate-800/80 pt-16 pb-12 relative overflow-hidden">
        {/* Subtle Ambient Radial Lighting */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-900/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-900/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Main Footer Links Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800/80">
            
            {/* Column 1 & 2: Hospital Info & Accreditations (2 cols on lg) */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-700 p-0.5 shadow-md shadow-cyan-600/30">
                  <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                    <Activity className="w-6 h-6 text-cyan-400" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-xl text-white tracking-tight">
                      Bhaskar Reddy
                    </span>
                    <span className="text-xs font-bold text-cyan-400 bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-800/80 uppercase">
                      Hospital
                    </span>
                  </div>
                  <p className="text-[11px] font-medium text-slate-400">
                    Multi-Specialty & Research Institute
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                Committed to delivering compassionate, precision tertiary healthcare with round-the-clock emergency 
                trauma readiness, experienced specialists, and modern clinical infrastructure across Andhra Pradesh.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[11px] text-cyan-400 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  <span>NABH Accredited</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[11px] text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>ABDM Compliant</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[11px] text-purple-400 font-medium">
                  <Award className="w-3.5 h-3.5 text-purple-400" />
                  <span>ISO 9001:2015</span>
                </div>
              </div>
            </div>

            {/* Column 3: Quick Navigation */}
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />
                <span>Quick Navigation</span>
              </h4>
              <ul className="space-y-2.5 text-xs">
                <li>
                  <button
                    onClick={() => scrollToSection('home')}
                    className="hover:text-cyan-400 transition flex items-center gap-1"
                  >
                    <span>Home Page</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection('about')}
                    className="hover:text-cyan-400 transition flex items-center gap-1"
                  >
                    <span>About Hospital</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection('services')}
                    className="hover:text-cyan-400 transition flex items-center gap-1"
                  >
                    <span>Medical Services</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection('doctors')}
                    className="hover:text-cyan-400 transition flex items-center gap-1"
                  >
                    <span>Meet Our Specialists</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection('facilities')}
                    className="hover:text-cyan-400 transition flex items-center gap-1"
                  >
                    <span>World-Class Facilities</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection('why-us')}
                    className="hover:text-cyan-400 transition flex items-center gap-1"
                  >
                    <span>Why Choose Us</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection('contact')}
                    className="hover:text-cyan-400 transition flex items-center gap-1"
                  >
                    <span>Contact & Directions</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 4: Clinical Specialties */}
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />
                <span>Specialties</span>
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-400">
                <li className="hover:text-slate-200 transition">Cardiology & Cath-Lab</li>
                <li className="hover:text-slate-200 transition">Neurology & Neurosurgery</li>
                <li className="hover:text-slate-200 transition">Orthopedics & Joint Care</li>
                <li className="hover:text-slate-200 transition">24/7 Trauma Resuscitation</li>
                <li className="hover:text-slate-200 transition">General Internal Medicine</li>
                <li className="hover:text-slate-200 transition">Pediatrics & Neonatology</li>
                <li className="hover:text-slate-200 transition">Diagnostic Radiology</li>
              </ul>
            </div>

            {/* Column 5: 24/7 Emergency & Front Desk */}
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />
                <span>Emergency Care</span>
              </h4>
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-900/60">
                  <div className="flex items-center gap-2 text-rose-400 text-xs font-bold mb-1">
                    <Siren className="w-4 h-4 animate-pulse" />
                    <span>24/7 Trauma Hotline</span>
                  </div>
                  <a
                    href="tel:1066"
                    className="text-base font-extrabold text-white hover:text-rose-300 transition"
                  >
                    Dial: 1066
                  </a>
                  <p className="text-[10px] text-rose-300/80 mt-0.5">Toll-free emergency line</p>
                </div>

                <div className="text-xs space-y-1 text-slate-400">
                  <p>Front Desk: <a href="tel:+918612345678" className="text-slate-200 font-semibold hover:text-cyan-400">+91 861 234 5678</a></p>
                  <p>Inquiries: <a href="mailto:contact@bhaskarreddyhospital.com" className="text-slate-200 font-semibold hover:text-cyan-400">contact@bhaskarreddyhospital.com</a></p>
                </div>
              </div>
            </div>

          </div>

          {/* ─── HIGHLIGHTED INTERNAL PORTAL ACCESS: Admin, CEO & Staff Login ─── */}
          <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-blue-950/70 border border-cyan-500/30 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
              
              {/* Heading & Information */}
              <div className="space-y-1.5 max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950 border border-cyan-700/60 text-cyan-400 text-[11px] font-bold">
                  <Lock className="w-3 h-3" />
                  <span>Hospital Staff & Governance Access • Anarav OS</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Hospital Operating System (Anarav OS) Portals
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Authorized medical staff, hospital administrators, and executive governance can sign in 
                  directly to access the digital clinical console, patient EHR, and management modules.
                </p>
              </div>

              {/* 3 Dedicated Login Buttons: Admin, CEO, Staff */}
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full lg:w-auto">
                
                {/* 1. CEO Login Button */}
                <button
                  onClick={handleCeoLogin}
                  className="flex-1 sm:flex-initial px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/20 hover:from-amber-500/30 hover:to-amber-600/30 border border-amber-500/40 text-amber-300 font-bold text-xs transition duration-200 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 group"
                  title="Sign in as Chief Executive Officer (Dr. Bhaskar Reddy)"
                >
                  <Crown className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                  <div className="text-left">
                    <div className="leading-tight font-extrabold text-amber-200">CEO Login</div>
                    <div className="text-[9px] text-amber-400/80 font-normal">Executive Governance</div>
                  </div>
                </button>

                {/* 2. Admin Login Button */}
                <button
                  onClick={handleAdminLogin}
                  className="flex-1 sm:flex-initial px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-500/20 to-purple-600/20 hover:from-indigo-500/30 hover:to-purple-600/30 border border-indigo-500/40 text-indigo-300 font-bold text-xs transition duration-200 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/10 group"
                  title="Sign in as Hospital Operations Administrator (K. Somasekhar)"
                >
                  <ShieldCheck className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                  <div className="text-left">
                    <div className="leading-tight font-extrabold text-indigo-200">Admin Login</div>
                    <div className="text-[9px] text-indigo-400/80 font-normal">Operations & Admin</div>
                  </div>
                </button>

                {/* 3. Staff Login Button */}
                <button
                  onClick={handleStaffLogin}
                  className="flex-1 sm:flex-initial px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs transition duration-200 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/25 group"
                  title="Open Anarav OS Staff Login Console"
                >
                  <Users className="w-4 h-4 text-cyan-200 group-hover:scale-110 transition-transform" />
                  <div className="text-left">
                    <div className="leading-tight font-extrabold text-white">Staff Login</div>
                    <div className="text-[9px] text-cyan-100 font-normal">Doctors, Nurses & Desks</div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 ml-1 text-cyan-200 group-hover:translate-x-1 transition-transform" />
                </button>

              </div>

            </div>
          </div>

          {/* Bottom Copyright & Security Notice */}
          <div className="mt-10 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div>
              © 2026 Bhaskar Reddy Hospital. All rights reserved.
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              <span>Powered by <strong className="text-cyan-400 font-semibold">Anarav Hospital OS</strong> Enterprise V4.2</span>
              <span>•</span>
              <span className="text-slate-400">Encrypted Clinical Records</span>
            </div>
          </div>

        </div>
      </footer>

      {/* ─── Patient Authentication Modal (Login & Registration) ─────────── */}
      <PatientAuthModal
        isOpen={isPatientAuthModalOpen}
        onClose={() => setIsPatientAuthModalOpen(false)}
        onSuccess={(_pat) => {
          setIsPatientAuthModalOpen(false);
          setIsPatientDashboardOpen(true);
        }}
      />

    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { useHospital } from '../../context/HospitalContext';
import type { UserSession } from '../../types';
import { PatientAuthModal } from './PatientAuthModal';
import { PatientDashboard } from './PatientDashboard';
import './landing-theme.css';
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
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Sparkles,
  ArrowRight,
  Award,
  Pill,
  Microscope,
  Bed,
  CheckCircle2,
  Siren,
  Hospital,
  ExternalLink,
  ChevronDown,
  Crown,
  ShieldCheck,
  Users,
  Lock,
  LogIn,
  User,
  LogOut,
  Palette,
} from 'lucide-react';

// ─── Theme Definitions & Options ──────────────────────────────────────────────
export type LandingTheme =
  | 'medical-blue'
  | 'healthcare-green'
  | 'modern-purple'
  | 'ocean'
  | 'dark-medical'
  | 'warm-care';

export interface ThemeOption {
  id: LandingTheme;
  name: string;
  emoji: string;
  dotColor: string;
  description: string;
}

export const LANDING_THEMES: ThemeOption[] = [
  {
    id: 'medical-blue',
    name: 'Medical Blue',
    emoji: '🔵',
    dotColor: '#0284c7',
    description: 'Professional, clean, trustworthy',
  },
  {
    id: 'healthcare-green',
    name: 'Healthcare Green',
    emoji: '🟢',
    dotColor: '#059669',
    description: 'Calm, fresh, patient-friendly',
  },
  {
    id: 'modern-purple',
    name: 'Modern Purple',
    emoji: '🟣',
    dotColor: '#7c3aed',
    description: 'Premium, elegant, modern',
  },
  {
    id: 'ocean',
    name: 'Ocean',
    emoji: '🌊',
    dotColor: '#0891b2',
    description: 'Calm, clean, modern',
  },
  {
    id: 'dark-medical',
    name: 'Dark Medical',
    emoji: '🌙',
    dotColor: '#38bdf8',
    description: 'Premium dark healthcare design',
  },
  {
    id: 'warm-care',
    name: 'Warm Care',
    emoji: '☀️',
    dotColor: '#ea580c',
    description: 'Friendly, welcoming, comfortable',
  },
];

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

// ─── Background Scrolling Hospital Gallery Images ────────────────────────────
const BACKGROUND_SCROLL_IMAGES = [
  {
    url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&auto=format&fit=crop&q=80',
    title: 'Consultant Physicians & Surgeons',
    tag: 'Clinical Care',
  },
  {
    url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&auto=format&fit=crop&q=80',
    title: 'Precision Modular Surgical OTs',
    tag: 'Surgical Mastery',
  },
  {
    url: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=600&auto=format&fit=crop&q=80',
    title: 'Compassionate Nursing & Patient Care',
    tag: 'Patient Care',
  },
  {
    url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=600&auto=format&fit=crop&q=80',
    title: 'Dedicated Senior Specialist Doctors',
    tag: 'Diagnostics',
  },
  {
    url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&auto=format&fit=crop&q=80',
    title: 'Modern Inpatient Suites & Critical Care',
    tag: 'Recovery Bay',
  },
  {
    url: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600&auto=format&fit=crop&q=80',
    title: 'Advanced Diagnostic MRI & Radiology',
    tag: 'Medical Tech',
  },
  {
    url: 'https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?w=600&auto=format&fit=crop&q=80',
    title: 'Empathetic Doctor Checkups',
    tag: 'Health Check',
  },
  {
    url: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=600&auto=format&fit=crop&q=80',
    title: '24/7 ICU & Cardiac Monitoring',
    tag: 'Telemetry',
  },
];

// ─── Featured Hero Slides (Auto-scrolling in Right-side Card) ─────────────────
const HERO_FEATURED_SLIDES = [
  {
    url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80',
    badge: 'Excellence in Healthcare',
    title: 'Modern Clinical Facilities & Experienced Medical Team',
    desc: 'Round-the-clock multidisciplinary specialist consultants',
  },
  {
    url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&auto=format&fit=crop&q=80',
    badge: 'State-of-the-Art Surgery',
    title: 'Advanced Modular Operation Theatres & Clean Air OT',
    desc: 'Laparoscopic and minimally invasive surgical suites',
  },
  {
    url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=800&auto=format&fit=crop&q=80',
    badge: 'Compassionate Consultation',
    title: 'Senior Doctors & Personalized Patient Treatment',
    desc: 'Dedicated to ethical, transparent, and empathetic healing',
  },
  {
    url: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=800&auto=format&fit=crop&q=80',
    badge: 'Dedicated Nursing Care',
    title: '24/7 Warm Bedside Care & Patient Comfort Support',
    desc: 'Compassionate nursing staff prioritizing patient wellbeing',
  },
  {
    url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&auto=format&fit=crop&q=80',
    badge: 'Critical Care Excellence',
    title: 'Modern Critical Care Units & Ultra-Clean Recovery Bays',
    desc: 'Equipped with rapid response life support and ICU bays',
  },
];

// ─── Pioneering Healthcare Excellence & Heart for Humanity Slides (About Section Left Box) ───
const ABOUT_EXCELLENCE_SLIDES = [
  {
    url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80',
    tag: 'Heart for Humanity',
    title: 'Compassionate Medical Care & Healing',
    desc: 'Empathetic consultations with gentle clinical healing and patient dignity.',
  },
  {
    url: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800&auto=format&fit=crop&q=80',
    tag: 'Cardiology Excellence',
    title: 'Advanced Cardiac ICU & Rhythm Telemetry',
    desc: 'Cutting-edge telemetry monitoring and continuous hemodynamic clinical supervision.',
  },
  {
    url: 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=800&auto=format&fit=crop&q=80',
    tag: 'Pioneering Precision',
    title: 'Ultra-Modern Hybrid Operation Theatres',
    desc: 'Laminar airflow surgical suites with minimally invasive precision instrumentation.',
  },
  {
    url: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=800&auto=format&fit=crop&q=80',
    tag: 'Patient Dignity',
    title: 'Dedicated Bedside Nursing with Empathy',
    desc: 'Round-the-clock personalized nursing care prioritizing human connection and comfort.',
  },
  {
    url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&auto=format&fit=crop&q=80',
    tag: 'Clinical Infrastructure',
    title: 'State-of-the-Art Multi-Specialty Campus',
    desc: 'Comprehensive diagnostics, emergency trauma bays, and patient-centered healing spaces.',
  },
];

const HOSPITAL_HIGHLIGHTS = [
  {
    icon: Siren,
    badge: 'Always Ready',
    title: '24/7 Emergency Care',
    desc: 'Immediate response trauma resuscitation bays, cardiac care, and ready ALS ambulances.',
    delay: '0s',
    iconColor: '#ef4444',
  },
  {
    icon: UserCheck,
    badge: 'Senior Specialists',
    title: 'Experienced Doctors',
    desc: 'Distinguished consultants and surgeons with decades of collective tertiary care experience.',
    delay: '0.4s',
    iconColor: 'var(--primary)',
  },
  {
    icon: Building2,
    badge: 'Ultra-Modern Tech',
    title: 'Advanced Facilities',
    desc: 'Modern modular OTs, digital catheterization lab, and fully computerized automated labs.',
    delay: '0.8s',
    iconColor: '#10b981',
  },
  {
    icon: Heart,
    badge: 'Compassionate',
    title: 'Patient-Centered Care',
    desc: 'Transparent billing, ethical consultations, and personalized care pathways for every recovery.',
    delay: '1.2s',
    iconColor: '#f43f5e',
  },
  {
    icon: ShieldCheck,
    badge: 'NABH Accredited',
    title: 'Certified Safe Standards',
    desc: 'Strict international infection control, safety protocols, and gold-standard surgical hygiene.',
    delay: '1.6s',
    iconColor: '#6366f1',
  },
  {
    icon: Pill,
    badge: 'Rapid Access',
    title: '24/7 Pharmacy & Labs',
    desc: 'Round-the-clock internal pharmacy, automated blood analyzers, and computerized imaging.',
    delay: '2.0s',
    iconColor: '#f59e0b',
  },
];

export const PublicLandingPage: React.FC = () => {
  const { setAppMode, login, setActiveModule, currentPatient, patientLogout } = useHospital();
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<'home' | 'about' | 'services' | 'doctors' | 'facilities' | 'contact'>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const [isPatientAuthModalOpen, setIsPatientAuthModalOpen] = useState(false);
  const [isPatientDashboardOpen, setIsPatientDashboardOpen] = useState(false);
  const statsRef = useRef<HTMLDivElement | null>(null);

  // Auto-scrolling featured hero visual card
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
  const [isHeroSlidePaused, setIsHeroSlidePaused] = useState(false);

  useEffect(() => {
    if (isHeroSlidePaused) return;
    const interval = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % HERO_FEATURED_SLIDES.length);
    }, 3800);
    return () => clearInterval(interval);
  }, [isHeroSlidePaused]);

  const handlePrevHeroSlide = () => {
    setCurrentHeroSlide((prev) => (prev - 1 + HERO_FEATURED_SLIDES.length) % HERO_FEATURED_SLIDES.length);
  };

  const handleNextHeroSlide = () => {
    setCurrentHeroSlide((prev) => (prev + 1) % HERO_FEATURED_SLIDES.length);
  };

  // Auto-scrolling visual slider for Pioneering Healthcare Excellence (Left Box)
  const [currentAboutSlide, setCurrentAboutSlide] = useState(0);
  const [isAboutSlidePaused, setIsAboutSlidePaused] = useState(false);

  useEffect(() => {
    if (isAboutSlidePaused) return;
    const interval = setInterval(() => {
      setCurrentAboutSlide((prev) => (prev + 1) % ABOUT_EXCELLENCE_SLIDES.length);
    }, 3600);
    return () => clearInterval(interval);
  }, [isAboutSlidePaused]);

  const handlePrevAboutSlide = () => {
    setCurrentAboutSlide((prev) => (prev - 1 + ABOUT_EXCELLENCE_SLIDES.length) % ABOUT_EXCELLENCE_SLIDES.length);
  };

  const handleNextAboutSlide = () => {
    setCurrentAboutSlide((prev) => (prev + 1) % ABOUT_EXCELLENCE_SLIDES.length);
  };

  const NAV_ITEMS = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'services', label: 'Services' },
    { id: 'doctors', label: 'Doctors' },
    { id: 'facilities', label: 'Facilities' },
    { id: 'contact', label: 'Contact' },
  ] as const;

  // Landing Page Theme State & Persistence
  const [theme, setTheme] = useState<LandingTheme>(() => {
    try {
      const saved = localStorage.getItem('brh_landing_theme') as LandingTheme | null;
      return saved && LANDING_THEMES.some((t) => t.id === saved) ? saved : 'medical-blue';
    } catch {
      return 'medical-blue';
    }
  });
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const themeDropdownRef = useRef<HTMLDivElement | null>(null);

  const handleSelectTheme = (newTheme: LandingTheme) => {
    setTheme(newTheme);
    try {
      localStorage.setItem('brh_landing_theme', newTheme);
    } catch (e) {
      console.warn('Unable to persist theme to localStorage', e);
    }
    setThemeDropdownOpen(false);
  };

  // Close theme dropdown on outside click or escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (themeDropdownRef.current && !themeDropdownRef.current.contains(event.target as Node)) {
        setThemeDropdownOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setThemeDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const currentThemeOption = LANDING_THEMES.find((t) => t.id === theme) || LANDING_THEMES[0];

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
      setScrolled(window.scrollY > 24);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
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
  }, [activeSection]);

  // Counters
  const countSpecialists = useAnimatedCounter(20, 1800, statsVisible);
  const countDepts = useAnimatedCounter(10, 1500, statsVisible);
  const countPatients = useAnimatedCounter(1000, 2200, statsVisible);

  // Switch tab view with smooth scroll to top & stats activation
  const switchTab = (tabId: 'home' | 'about' | 'services' | 'doctors' | 'facilities' | 'contact') => {
    setActiveSection(tabId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setStatsVisible(true);
  };

  // Universal navigation handler for buttons & footer links
  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    if (['home', 'about', 'services', 'doctors', 'facilities', 'contact'].includes(id)) {
      switchTab(id as any);
      return;
    }
    if (id === 'appointment-cta') {
      if (activeSection !== 'home' && activeSection !== 'services') {
        setActiveSection('home');
      }
      setTimeout(() => {
        const el = document.getElementById('appointment-cta');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // ── Tab Header Banner ──────────────────────────────────────────────────────
  const renderTabHeader = (breadcrumbLabel: string, title: string, subtitle: string) => (
    <div
      className="pt-28 pb-8 md:pt-32 md:pb-10 border-b theme-section-surface relative overflow-hidden select-none"
      style={{ borderColor: 'var(--border)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex items-center gap-2 text-xs font-semibold theme-muted mb-2.5">
          <button
            onClick={() => switchTab('home')}
            className="hover:underline cursor-pointer flex items-center gap-1 hover:text-primary transition-colors"
          >
            <span>Home</span>
          </button>
          <span>/</span>
          <span className="font-bold" style={{ color: 'var(--primary)' }}>
            {breadcrumbLabel}
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold theme-heading tracking-tight">
          {title}
        </h1>
        <p className="text-xs sm:text-sm theme-body mt-1 max-w-2xl leading-relaxed">
          {subtitle}
        </p>
      </div>
    </div>
  );

  // ── Hospital Statistics Section ──────────────────────────────────────────
  const renderStatsSection = (key?: string) => (
    <section
      key={key}
      ref={statsRef}
      className="py-14 text-white relative overflow-hidden theme-cta-banner"
    >
      {/* Subtle Background Glow */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle at 30% 50%, var(--primary), transparent 60%)' }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span
            className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderColor: 'rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
            }}
          >
            Trusted Clinical Excellence
          </span>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
            Our Journey in Numbers
          </h3>
          <p className="text-xs text-white/80 mt-1">
            Indicative hospital statistics reflecting our active departments and clinical reach.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          <div className="p-6 rounded-2xl backdrop-blur-xs transition theme-stat-card">
            <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-1 theme-stat-num">
              {countSpecialists}+
            </div>
            <div className="text-sm font-bold text-white">Specialists</div>
            <div className="text-[11px] text-white/75 mt-0.5">Senior Medical Consultants</div>
          </div>

          <div className="p-6 rounded-2xl backdrop-blur-xs transition theme-stat-card">
            <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-1 theme-stat-num">
              {countDepts}+
            </div>
            <div className="text-sm font-bold text-white">Departments</div>
            <div className="text-[11px] text-white/75 mt-0.5">Multi-Specialty Centers</div>
          </div>

          <div className="p-6 rounded-2xl backdrop-blur-xs transition theme-stat-card">
            <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-1 theme-stat-num">
              24/7
            </div>
            <div className="text-sm font-bold text-white">Emergency Care</div>
            <div className="text-[11px] text-white/75 mt-0.5">Round-the-Clock Support</div>
          </div>

          <div className="p-6 rounded-2xl backdrop-blur-xs transition theme-stat-card">
            <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-1 theme-stat-num">
              {countPatients}+
            </div>
            <div className="text-sm font-bold text-white">Patients Served</div>
            <div className="text-[11px] text-white/75 mt-0.5">Compassionate Consultations</div>
          </div>
        </div>
      </div>
    </section>
  );

  // ── Why Choose Us Section ────────────────────────────────────────────────
  const renderWhyUsSection = (key?: string) => (
    <section
      key={key}
      id="why-us"
      className="py-16 md:py-24 border-t theme-section-alt"
      style={{ borderColor: 'var(--border)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-3 theme-badge">
            <Shield className="w-3.5 h-3.5" />
            <span>Why Choose Us</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight theme-heading">
            Why Patients Trust Bhaskar Reddy Hospital
          </h2>
          <p className="text-sm sm:text-base mt-3 leading-relaxed theme-body">
            We stand as a trusted healthcare partner for thousands of families through dedicated clinical excellence,
            patient-first integrity, and modern infrastructure.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl transition-all duration-300 group hover:-translate-y-1 theme-card">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
              style={{ backgroundColor: 'var(--accent-light)', color: 'var(--primary)' }}
            >
              <UserCheck className="w-6 h-6" />
            </div>
            <h4 className="text-base font-extrabold mb-2 theme-heading">Experienced Medical Team</h4>
            <p className="text-xs leading-relaxed theme-body">
              Our senior clinicians and surgeons bring comprehensive expertise from leading medical institutions,
              delivering accurate diagnosis and personalized treatment plans.
            </p>
          </div>

          <div className="p-6 rounded-2xl transition-all duration-300 group hover:-translate-y-1 theme-card">
            <div className="w-11 h-11 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Heart className="w-6 h-6" />
            </div>
            <h4 className="text-base font-extrabold mb-2 theme-heading">Patient-Focused Care</h4>
            <p className="text-xs leading-relaxed theme-body">
              From pre-admission counseling to post-discharge recovery monitoring, your comfort, dignity,
              and speedy recovery remain our foremost priorities.
            </p>
          </div>

          <div className="p-6 rounded-2xl transition-all duration-300 group hover:-translate-y-1 theme-card">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
              style={{ backgroundColor: 'var(--accent-light)', color: 'var(--primary)' }}
            >
              <Building2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-extrabold mb-2 theme-heading">Modern Medical Facilities</h4>
            <p className="text-xs leading-relaxed theme-body">
              High-definition digital diagnostics, modern modular operating theatres, and clean sterile recovery
              wards built strictly to NABH accreditation benchmarks.
            </p>
          </div>

          <div className="p-6 rounded-2xl transition-all duration-300 group hover:-translate-y-1 theme-card">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
              style={{ backgroundColor: 'var(--accent-light)', color: 'var(--primary)' }}
            >
              <Clock className="w-6 h-6" />
            </div>
            <h4 className="text-base font-extrabold mb-2 theme-heading">24/7 Emergency Support</h4>
            <p className="text-xs leading-relaxed theme-body">
              Always-awake trauma resuscitation team, on-call emergency surgical specialists, in-house blood bank
              coordination, and quick response ambulance dispatches.
            </p>
          </div>

          <div className="p-6 rounded-2xl transition-all duration-300 group hover:-translate-y-1 theme-card">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
              style={{ backgroundColor: 'var(--accent-light)', color: 'var(--primary)' }}
            >
              <Calendar className="w-6 h-6" />
            </div>
            <h4 className="text-base font-extrabold mb-2 theme-heading">Easy Appointment Booking</h4>
            <p className="text-xs leading-relaxed theme-body">
              Streamlined outpatient registration with zero unnecessary waiting times and simplified token tracking
              for doctor consultations.
            </p>
          </div>

          <div className="p-6 rounded-2xl transition-all duration-300 group hover:-translate-y-1 theme-card">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
              style={{ backgroundColor: 'var(--accent-light)', color: 'var(--primary)' }}
            >
              <Shield className="w-6 h-6" />
            </div>
            <h4 className="text-base font-extrabold mb-2 theme-heading">Comprehensive Healthcare</h4>
            <p className="text-xs leading-relaxed theme-body">
              Under one roof: Outpatient, Inpatient, Diagnostics, Pharmacy, Emergency, and Cashless Insurance TPA
              services for a seamless healing journey.
            </p>
          </div>
        </div>
      </div>
    </section>
  );

  // ── Appointment Booking CTA Banner ───────────────────────────────────────
  const renderAppointmentCtaSection = (key?: string) => (
    <section
      key={key}
      id="appointment-cta"
      className="py-16 md:py-24 text-white relative overflow-hidden theme-cta-banner"
    >
      <div
        className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-30"
        style={{ background: 'var(--primary)' }}
      />
      <div
        className="absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-25"
        style={{ background: 'var(--accent)' }}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-xs font-bold mb-4 shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Fast & Convenient Consultation</span>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">
          Your Health Is Our Priority
        </h2>

        <p className="text-white/80 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed mb-8">
          Book an appointment with our experienced medical professionals today. Our front desk and care 
          coordinators are ready to assist you with quick scheduling.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="tel:+918612345678"
            className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-sm shadow-xl hover:-translate-y-0.5 transition duration-200 flex items-center justify-center gap-2 theme-btn-primary"
          >
            <Calendar className="w-4 h-4" />
            <span>Call Front Desk: +91 861 234 5678</span>
          </a>

          <button
            onClick={() => switchTab('contact')}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 backdrop-blur-xs transition duration-200 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Mail className="w-4 h-4" />
            <span>Contact Us</span>
          </button>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-white/80">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            No Prepayment Required
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            Same-Day Specialist Slots
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            Dedicated Patient Assistance
          </span>
        </div>
      </div>
    </section>
  );

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
    <div
      className="landing-theme-root font-sans relative selection:bg-cyan-600 selection:text-white"
      data-landing-theme={theme}
    >
      
      {/* ─── 1. Header / Navbar ────────────────────────────────────────────── */}
      {/* ─── 1. Header / Navbar ────────────────────────────────────────────── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 theme-nav ${
          scrolled
            ? 'shadow-lg py-3 border-b'
            : 'py-4 md:py-4.5 border-b'
        }`}
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            
            {/* ── LEFT: Hospital Logo & Brand Name ──────────────────────────── */}
            <div
              onClick={() => scrollToSection('home')}
              className="flex items-center gap-3 cursor-pointer group select-none shrink-0"
              id="landing-logo-btn"
              title="Bhaskar Reddy Hospital Home"
            >
              <div
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl p-0.5 shadow-md group-hover:scale-105 transition-transform duration-200 shrink-0"
                style={{
                  background: 'var(--logo-gradient)',
                  boxShadow: '0 4px 14px var(--glow-color)',
                }}
              >
                <div
                  className="w-full h-full rounded-[10px] flex items-center justify-center"
                  style={{ backgroundColor: 'var(--surface)' }}
                >
                  <Activity className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: 'var(--primary)' }} />
                </div>
              </div>
              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-2 leading-tight">
                  <span className="font-extrabold text-base sm:text-lg lg:text-xl tracking-tight theme-heading whitespace-nowrap">
                    Bhaskar Reddy
                  </span>
                  <span
                    className="text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded-md border uppercase tracking-wider theme-badge shrink-0"
                  >
                    Hospital
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] font-medium hidden sm:block theme-muted tracking-tight leading-tight mt-0.5">
                  Multi-Specialty & Research Institute
                </p>
              </div>
            </div>

            {/* ── CENTER: Desktop Navigation Tabs (Transparent Background) ──── */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2 bg-transparent">
              {NAV_ITEMS.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => switchTab(item.id)}
                    className={`relative px-3.5 py-2 text-sm font-semibold rounded-lg transition-all duration-200 cursor-pointer flex items-center justify-center bg-transparent ${
                      isActive ? 'theme-nav-link-active' : 'theme-nav-link'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <span>{item.label}</span>
                    {isActive && (
                      <span
                        className="absolute bottom-0 left-2.5 right-2.5 h-0.5 rounded-full pointer-events-none"
                        style={{ backgroundColor: 'var(--primary)' }}
                      />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* ── RIGHT: Login & Theme Selector (Right Corner, Small Size) ──── */}
            <div className="hidden sm:flex items-center gap-2 lg:gap-2.5 shrink-0">
              {/* Login (Secondary Button) */}
              {currentPatient ? (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    id="navbar-patient-portal-btn"
                    onClick={() => setIsPatientDashboardOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold border transition-all duration-200 shadow-xs cursor-pointer theme-badge"
                    title="Open Your Patient Health Portal"
                  >
                    <User className="w-3.5 h-3.5" style={{ color: 'var(--primary)' }} />
                    <span className="hidden lg:inline">{currentPatient.name.split(' ')[0]}</span>
                    <span
                      className="font-mono text-[11px] px-1.5 py-0.5 rounded border"
                      style={{
                        backgroundColor: 'var(--surface)',
                        color: 'var(--text-primary)',
                        borderColor: 'var(--border)',
                      }}
                    >
                      {currentPatient.uhid}
                    </span>
                  </button>
                  <button
                    type="button"
                    id="navbar-patient-logout-btn"
                    onClick={() => patientLogout()}
                    className="p-1.5 rounded-lg hover:text-rose-600 hover:bg-rose-50 border transition-all duration-200 cursor-pointer theme-btn-secondary"
                    title="Logout from Patient Portal"
                    aria-label="Logout"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  id="navbar-patient-login-btn"
                  onClick={() => setIsPatientAuthModalOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all duration-200 shadow-xs cursor-pointer theme-btn-secondary"
                  title="Patient Portal Login"
                >
                  <LogIn className="w-3.5 h-3.5" style={{ color: 'var(--primary)' }} />
                  <span>Login</span>
                </button>
              )}

              {/* 🎨 Theme Selector (At Right Corner, Small Size) */}
              <div className="relative" ref={themeDropdownRef}>
                <button
                  type="button"
                  id="landing-theme-selector-btn"
                  onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 shadow-xs cursor-pointer theme-btn-secondary"
                  title="Select Landing Page Theme"
                  aria-expanded={themeDropdownOpen}
                  aria-label="Theme selector"
                >
                  <span className="text-xs leading-none">{currentThemeOption?.emoji}</span>
                  <span className="hidden xl:inline text-xs font-medium">{currentThemeOption?.name}</span>
                  <Palette className="w-3 h-3" style={{ color: 'var(--primary)' }} />
                  <ChevronDown
                    className={`w-3 h-3 transition-transform duration-200 ${
                      themeDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {themeDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-60 p-2 rounded-2xl theme-selector-popover animate-in fade-in zoom-in-95 z-50 shadow-2xl">
                    <div
                      className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider theme-muted flex items-center justify-between border-b"
                      style={{ borderColor: 'var(--border)' }}
                    >
                      <span>Theme 🎨</span>
                      <span className="text-[10px] font-normal opacity-80">6 Presets</span>
                    </div>
                    <div className="space-y-1 mt-1.5">
                      {LANDING_THEMES.map((t) => {
                        const isSelected = t.id === theme;
                        return (
                          <button
                            key={t.id}
                            type="button"
                            id={`theme-option-${t.id}`}
                            onClick={() => handleSelectTheme(t.id)}
                            className={`theme-option-item ${isSelected ? 'active' : ''}`}
                          >
                            <span className="text-sm leading-none">{t.emoji}</span>
                            <div className="flex-1 text-left">
                              <div className="text-xs font-medium leading-tight">{t.name}</div>
                              <div className="text-[9px] font-normal opacity-75">{t.description}</div>
                            </div>
                            <div
                              className="w-3 h-3 rounded-full border border-white/40 shrink-0 shadow-xs"
                              style={{ backgroundColor: t.dotColor }}
                            />
                            {isSelected && (
                              <CheckCircle2
                                className="w-3.5 h-3.5 shrink-0"
                                style={{ color: 'var(--primary)' }}
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── MOBILE CONTROLS (Compact: Login, Small Theme, Hamburger) ─── */}
            <div className="flex sm:hidden items-center gap-1.5">
              {/* Mobile Login Button */}
              {currentPatient ? (
                <button
                  onClick={() => setIsPatientDashboardOpen(true)}
                  className="px-2.5 py-1.5 rounded-lg border font-bold text-xs shadow-xs flex items-center gap-1 cursor-pointer theme-badge"
                >
                  <User className="w-3.5 h-3.5" style={{ color: 'var(--primary)' }} />
                  <span className="font-mono text-[11px]">{currentPatient.uhid}</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsPatientAuthModalOpen(true)}
                  className="px-2.5 py-1.5 rounded-lg border font-bold text-xs shadow-xs flex items-center gap-1 cursor-pointer theme-btn-secondary"
                >
                  <LogIn className="w-3.5 h-3.5" style={{ color: 'var(--primary)' }} />
                  <span>Login</span>
                </button>
              )}

              {/* Compact Mobile Theme Button (Right Corner) */}
              <button
                type="button"
                id="mobile-theme-btn"
                onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
                className="p-1.5 rounded-lg border theme-btn-secondary text-xs flex items-center gap-1 cursor-pointer transition-all duration-200"
                title="Change Theme"
                aria-label="Change Theme"
              >
                <span className="text-xs leading-none">{currentThemeOption?.emoji}</span>
                <Palette className="w-3 h-3" style={{ color: 'var(--primary)' }} />
              </button>

              {/* Mobile Theme Popover */}
              {themeDropdownOpen && (
                <div className="absolute right-4 top-16 w-60 p-2 rounded-2xl theme-selector-popover shadow-2xl z-50">
                  <div
                    className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider theme-muted flex items-center justify-between border-b"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    <span>Select Theme 🎨</span>
                    <span className="text-[10px] font-normal opacity-80">6 Themes</span>
                  </div>
                  <div className="space-y-1 mt-1.5">
                    {LANDING_THEMES.map((t) => {
                      const isSelected = t.id === theme;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => handleSelectTheme(t.id)}
                          className={`theme-option-item ${isSelected ? 'active' : ''}`}
                        >
                          <span className="text-sm leading-none">{t.emoji}</span>
                          <div className="flex-1 text-left">
                            <div className="text-xs font-medium leading-tight">{t.name}</div>
                          </div>
                          <div
                            className="w-3 h-3 rounded-full border border-white/40 shrink-0"
                            style={{ backgroundColor: t.dotColor }}
                          />
                          {isSelected && (
                            <CheckCircle2
                              className="w-3.5 h-3.5 shrink-0"
                              style={{ color: 'var(--primary)' }}
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Hamburger Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1.5 rounded-lg focus:outline-none cursor-pointer theme-btn-secondary border transition-all duration-200"
                aria-label="Toggle Navigation Menu"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

            {/* Tablet Menu Toggle (for screens between sm and lg with Theme/Login/Book visible, but hidden center nav) */}
            <div className="hidden sm:flex lg:hidden items-center ml-1">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl focus:outline-none cursor-pointer theme-btn-secondary border transition-all duration-200"
                aria-label="Toggle Navigation Menu"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

          </div>
        </div>

        {/* ── Mobile / Tablet Navigation Drawer ─────────────────────────── */}
        {mobileMenuOpen && (
          <div
            className="lg:hidden border-b px-4 pt-3 pb-6 space-y-3 shadow-2xl animate-in slide-in-from-top-2 duration-200"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <div className="space-y-1">
              {NAV_ITEMS.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => switchTab(item.id)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-between ${
                      isActive ? 'theme-nav-link-active font-bold' : 'theme-nav-link'
                    }`}
                  >
                    <span>{item.label}</span>
                    {isActive && (
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: 'var(--primary)' }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Mobile Theme Selection Palette */}
            <div className="pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
              <div className="text-[11px] font-bold uppercase tracking-wider mb-2 px-1 theme-muted flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5" style={{ color: 'var(--primary)' }} />
                <span>Theme ({currentThemeOption?.name})</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {LANDING_THEMES.map((t) => {
                  const isSelected = t.id === theme;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleSelectTheme(t.id)}
                      className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition ${
                        isSelected ? 'theme-badge font-bold' : 'theme-btn-secondary'
                      }`}
                    >
                      <span className="text-sm">{t.emoji}</span>
                      <span className="truncate">{t.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mobile Patient Portal Section */}
            <div className="pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
              {currentPatient ? (
                <div className="p-3 rounded-2xl border flex items-center justify-between theme-card">
                  <div>
                    <div className="text-xs font-bold theme-heading">{currentPatient.name}</div>
                    <div
                      className="text-[11px] font-mono font-semibold"
                      style={{ color: 'var(--primary)' }}
                    >
                      UHID: {currentPatient.uhid}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setIsPatientDashboardOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs cursor-pointer theme-btn-primary"
                    >
                      My Records
                    </button>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        patientLogout();
                      }}
                      className="p-1.5 rounded-xl text-rose-600 hover:bg-rose-100 cursor-pointer"
                      title="Logout"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setIsPatientAuthModalOpen(true);
                  }}
                  className="w-full py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer theme-btn-secondary"
                >
                  <LogIn className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                  <span>Patient Health Portal Login</span>
                </button>
              )}
            </div>

            {/* Mobile Book Appointment CTA */}
            <div className="pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
              <button
                onClick={() => scrollToSection('appointment-cta')}
                className="w-full py-3 rounded-xl font-bold text-sm text-center shadow-md cursor-pointer theme-btn-primary flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Book Appointment</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ─── 2. Hero Section ───────────────────────────────────────────────── */}
      <section
        id="home"
        className="pt-28 pb-16 md:pt-36 md:pb-24 theme-hero-bg relative overflow-hidden"
      >
        {/* Subtle Decorative Ambient Background Blobs */}
        <div
          className="absolute top-12 left-1/2 -translate-x-1/2 w-[800px] h-[350px] rounded-full blur-3xl z-0 pointer-events-none opacity-40"
          style={{ background: 'var(--accent-gradient)' }}
        />
        <div
          className="absolute -top-24 right-0 w-96 h-96 rounded-full blur-2xl z-0 pointer-events-none opacity-25"
          style={{ background: 'var(--primary)' }}
        />

        {/* ── Background Automatically Scrolling Images (Hospital, Doctors, Patient Care) ── */}
        <div className="absolute inset-x-0 top-16 sm:top-20 z-0 pointer-events-none overflow-hidden select-none opacity-[0.24] dark:opacity-[0.18] hero-marquee-mask">
          <div className="hero-marquee-track gap-4 py-2">
            {[...BACKGROUND_SCROLL_IMAGES, ...BACKGROUND_SCROLL_IMAGES].map((img, idx) => (
              <div
                key={idx}
                className="w-48 h-28 sm:w-60 sm:h-36 shrink-0 rounded-2xl overflow-hidden border shadow-xs relative bg-white/40 dark:bg-slate-900/40"
                style={{ borderColor: 'var(--border)' }}
              >
                <img
                  src={img.url}
                  alt={img.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-2.5">
                  <span
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider w-max mb-0.5"
                    style={{ backgroundColor: 'var(--badge-bg)', color: 'var(--badge-text)' }}
                  >
                    {img.tag}
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-semibold text-white leading-tight line-clamp-1 drop-shadow-xs">
                    {img.title}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-xs theme-badge">
                <Shield className="w-3.5 h-3.5" style={{ color: 'var(--primary)' }} />
                <span>NABH Accredited • Multi-Specialty Tertiary Care</span>
              </div>

              {/* Main Headline */}
              <div className="space-y-3">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.12] theme-heading">
                  Bhaskar Reddy <br className="hidden sm:inline" />
                  <span className="theme-hero-gradient-text">
                    Hospital
                  </span>
                </h1>
                <p className="text-xl sm:text-2xl font-bold tracking-tight theme-body">
                  Compassionate Care. Advanced Medicine. Better Lives.
                </p>
              </div>

              {/* Supporting Narrative */}
              <p className="text-sm sm:text-base max-w-xl mx-auto lg:mx-0 leading-relaxed theme-muted">
                Welcome to Bhaskar Reddy Hospital, where clinical expertise meets patient-centered 
                compassion. Equipped with state-of-the-art diagnostic technologies, modular operation 
                theatres, and dedicated medical specialists available round the clock.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <button
                  onClick={() => scrollToSection('appointment-cta')}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-sm hover:-translate-y-0.5 transition duration-200 flex items-center justify-center gap-2 group cursor-pointer theme-btn-primary"
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
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 text-xs font-medium">
                <div
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border backdrop-blur-xs shadow-2xs transition-all duration-200 theme-card"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <div className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-semibold text-xs theme-heading">NABH Certified Protocols</span>
                </div>
                <div
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border backdrop-blur-xs shadow-2xs transition-all duration-200 theme-card"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <div className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-semibold text-xs theme-heading">24/7 Critical Trauma Bay</span>
                </div>
                <div
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border backdrop-blur-xs shadow-2xs transition-all duration-200 theme-card"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <div className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-semibold text-xs theme-heading">Cashless Insurance TPA</span>
                </div>
              </div>
            </div>

            {/* Right Visual / Hero Graphic (Reduced Dimensions & Auto-Scrolling Gallery) */}
            <div className="lg:col-span-5 relative flex justify-center py-2">
              
              {/* Reduced Box Dimensions: max-w-[370px], h-[360px] */}
              <div
                className="relative w-full max-w-[340px] sm:max-w-[360px] lg:max-w-[370px] h-[330px] sm:h-[350px] lg:h-[360px] rounded-3xl overflow-hidden shadow-2xl border-4 select-none group"
                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
                onMouseEnter={() => setIsHeroSlidePaused(true)}
                onMouseLeave={() => setIsHeroSlidePaused(false)}
              >
                {/* Auto Slider Progress Bar on Top */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-black/30 z-30 overflow-hidden">
                  <div
                    key={currentHeroSlide}
                    className="h-full hero-slide-timer-bar"
                    style={{ backgroundColor: 'var(--primary)' }}
                  />
                </div>

                {/* Slides Track */}
                <div className="relative w-full h-full">
                  {HERO_FEATURED_SLIDES.map((slide, index) => {
                    const isActive = index === currentHeroSlide;
                    return (
                      <div
                        key={index}
                        className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                          isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                        }`}
                      >
                        <img
                          src={slide.url}
                          alt={slide.title}
                          className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700"
                          loading={index === 0 ? 'eager' : 'lazy'}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-transparent" />
                        
                        {/* Slide Content Caption */}
                        <div className="absolute bottom-4 left-4 right-4 text-white z-20">
                          <div
                            className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2 py-0.5 rounded-md mb-1.5 backdrop-blur-md shadow-xs"
                            style={{ backgroundColor: 'rgba(var(--primary-rgb, 2, 132, 199), 0.25)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.2)' }}
                          >
                            <Sparkles className="w-3 h-3" style={{ color: 'var(--primary)' }} />
                            <span>{slide.badge}</span>
                          </div>
                          <h3 className="text-sm sm:text-base font-bold leading-tight drop-shadow-sm text-white line-clamp-2">
                            {slide.title}
                          </h3>
                          <p className="text-[11px] text-slate-200 font-medium leading-tight mt-1 line-clamp-1 opacity-90">
                            {slide.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Slide Nav Controls (Prev / Next Arrows on Hover) */}
                <button
                  type="button"
                  onClick={handlePrevHeroSlide}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-30 w-7 h-7 rounded-full bg-black/45 hover:bg-black/75 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer backdrop-blur-xs shadow-md"
                  aria-label="Previous image"
                  title="Previous image"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextHeroSlide}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-30 w-7 h-7 rounded-full bg-black/45 hover:bg-black/75 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer backdrop-blur-xs shadow-md"
                  aria-label="Next image"
                  title="Next image"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* Bottom Slide Indicators (Dots) */}
                <div className="absolute top-3.5 right-3.5 z-30 flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2 py-1 rounded-full border border-white/15">
                  {HERO_FEATURED_SLIDES.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentHeroSlide(i)}
                      className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                        i === currentHeroSlide
                          ? 'w-4'
                          : 'w-1.5 bg-white/40 hover:bg-white/70'
                      }`}
                      style={{
                        backgroundColor: i === currentHeroSlide ? 'var(--primary)' : undefined,
                      }}
                      aria-label={`Go to slide ${i + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* Floating Element 1: 24/7 Emergency (Positioned snugly around reduced box) */}
              <div className="absolute -top-2 -left-2 sm:-left-5 backdrop-blur-md p-2.5 sm:p-3 rounded-2xl shadow-xl flex items-center gap-2.5 animate-float-slow theme-card z-30">
                <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shadow-inner shrink-0">
                  <Siren className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <div className="text-xs font-extrabold theme-heading leading-tight">24/7 Emergency</div>
                  <div className="text-[10px] sm:text-[11px] theme-muted leading-tight">Immediate Trauma Care</div>
                </div>
              </div>

              {/* Floating Element 2: Patient Rating (Positioned snugly around reduced box) */}
              <div className="absolute -bottom-3 -right-2 sm:-right-4 backdrop-blur-md p-2.5 sm:p-3 rounded-2xl shadow-xl flex items-center gap-2.5 animate-float-delayed theme-card z-30">
                <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500 shadow-inner shrink-0">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-extrabold theme-heading leading-tight">4.9 ★ Rated Trust</div>
                  <div className="text-[10px] sm:text-[11px] theme-muted leading-tight">1,000+ Satisfied Patients</div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ─── 3. Quick Hospital Highlights (Auto-Scrolling Marquee & Heartbeat Pulse) ─── */}
      <section
        className="py-10 border-y theme-section-surface relative overflow-hidden"
        style={{ borderColor: 'var(--border)' }}
      >
        {/* Subtle background ambient radial glow */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            background: 'radial-gradient(ellipse at 50% 50%, rgba(var(--primary-rgb, 2, 132, 199), 0.08) 0%, transparent 70%)',
          }}
        />

        <div className="hero-marquee-mask overflow-hidden py-2 relative z-10">
          <div className="highlights-marquee-track gap-5 px-4">
            {[...HOSPITAL_HIGHLIGHTS, ...HOSPITAL_HIGHLIGHTS].map((item, index) => (
              <div
                key={index}
                className="w-72 sm:w-80 shrink-0 p-6 rounded-3xl highlight-card-bg animate-box-heartbeat flex flex-col justify-between transition-all duration-300 group cursor-pointer hover:shadow-xl relative select-none"
                style={{ animationDelay: item.delay }}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm"
                      style={{ backgroundColor: 'var(--accent-light)', color: item.iconColor }}
                    >
                      <item.icon className="w-6 h-6" />
                    </div>
                    <span
                      className="text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider"
                      style={{ backgroundColor: 'var(--accent-light)', color: 'var(--primary)' }}
                    >
                      {item.badge}
                    </span>
                  </div>
                  <h4 className="text-base font-extrabold mb-2 theme-heading group-hover:text-primary transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-xs leading-relaxed theme-body">
                    {item.desc}
                  </p>
                </div>

                {/* Heartbeat rate indicator line at bottom of card */}
                <div
                  className="mt-5 pt-3 border-t flex items-center justify-between text-[11px] font-medium"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
                >
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
                    24/7 Verified
                  </span>
                  <span className="font-mono text-xs opacity-75 flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                    Pulse Active
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 4. About Hospital Section ─────────────────────────────────────── */}
      <section id="about" className="py-20 md:py-28 theme-section-alt relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Visual Image Slider with Auto-Scrolling Animation (Left Box) */}
            <div className="lg:col-span-6 relative group select-none">
              <div
                className="relative rounded-3xl overflow-hidden shadow-2xl border-4 h-80 sm:h-[390px] md:h-[420px] lg:h-[430px]"
                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
                onMouseEnter={() => setIsAboutSlidePaused(true)}
                onMouseLeave={() => setIsAboutSlidePaused(false)}
              >
                {/* Auto Slider Progress Bar on Top */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-black/30 z-30 overflow-hidden">
                  <div
                    key={currentAboutSlide}
                    className="h-full hero-slide-timer-bar"
                    style={{ backgroundColor: 'var(--primary)' }}
                  />
                </div>

                {/* Animated Horizontal Sliding Track */}
                <div
                  className="flex h-full transition-transform duration-700 ease-out"
                  style={{ transform: `translateX(-${currentAboutSlide * 100}%)` }}
                >
                  {ABOUT_EXCELLENCE_SLIDES.map((slide, index) => (
                    <div key={index} className="w-full h-full shrink-0 relative overflow-hidden">
                      <img
                        src={slide.url}
                        alt={slide.title}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                        loading={index === 0 ? 'eager' : 'lazy'}
                      />
                      {/* Gradient scrim overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-transparent" />

                      {/* Content Overlay */}
                      <div className="absolute bottom-6 left-5 right-5 text-white z-20">
                        <div
                          className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full mb-2 backdrop-blur-md shadow-xs border border-white/20"
                          style={{ backgroundColor: 'rgba(var(--primary-rgb, 2, 132, 199), 0.35)', color: '#ffffff' }}
                        >
                          <Heart className="w-3 h-3 text-rose-400 fill-rose-400 animate-pulse" />
                          <span>{slide.tag}</span>
                        </div>
                        <h3 className="text-base sm:text-lg font-bold leading-snug drop-shadow-sm text-white">
                          {slide.title}
                        </h3>
                        <p className="text-xs text-slate-200 font-medium leading-tight mt-1 opacity-90 line-clamp-2">
                          {slide.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Prev / Next Nav Buttons on Hover */}
                <button
                  type="button"
                  onClick={handlePrevAboutSlide}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-black/45 hover:bg-black/75 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer backdrop-blur-xs shadow-md"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextAboutSlide}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-black/45 hover:bg-black/75 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer backdrop-blur-xs shadow-md"
                  aria-label="Next slide"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* Slide Indicators (Dots) */}
                <div className="absolute top-3.5 right-3.5 z-30 flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/15">
                  {ABOUT_EXCELLENCE_SLIDES.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentAboutSlide(i)}
                      className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                        i === currentAboutSlide
                          ? 'w-4.5 bg-sky-400'
                          : 'w-1.5 bg-white/40 hover:bg-white/70'
                      }`}
                      style={{
                        backgroundColor: i === currentAboutSlide ? 'var(--primary)' : undefined,
                      }}
                      aria-label={`Go to slide ${i + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* Floating Mission Badge */}
              <div className="absolute -bottom-5 -right-2 sm:right-5 p-3.5 sm:p-4 rounded-2xl shadow-xl max-w-[260px] sm:max-w-xs theme-card z-30 border backdrop-blur-md">
                <div className="flex items-center gap-2 font-bold text-xs mb-0.5" style={{ color: 'var(--primary)' }}>
                  <Activity className="w-3.5 h-3.5 animate-pulse" />
                  <span>Our Healing Mission</span>
                </div>
                <p className="text-[11px] sm:text-xs italic theme-body leading-snug">
                  &ldquo;Delivering healthcare with precision, dignity, and accessibility for all.&rdquo;
                </p>
              </div>
            </div>

            {/* Text & Narrative CSS Box (Reduced & Refined Size) */}
            <div className="lg:col-span-6 p-5 sm:p-6 lg:p-7 rounded-3xl theme-card border shadow-xl relative overflow-hidden space-y-3.5 sm:space-y-4">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold theme-badge">
                <Hospital className="w-3 h-3" />
                <span>About Bhaskar Reddy Hospital</span>
              </div>

              <h2 className="text-2xl sm:text-[27px] font-extrabold tracking-tight leading-snug theme-heading">
                Pioneering Healthcare Excellence with a Heart for Humanity
              </h2>

              <p className="text-xs sm:text-[13px] leading-relaxed theme-body">
                Founded with the commitment to elevate medical care in the region, Bhaskar Reddy Hospital
                brings together multi-specialty clinical infrastructure, cutting-edge diagnostic technology,
                and an exceptional team of senior consultants and caring nurses.
              </p>

              {/* ── Heartbeat Scrolling ECG Live Monitor at Center of CSS Box ── */}
              <div
                className="relative z-10 w-full rounded-2xl border p-2.5 sm:p-3 select-none overflow-hidden shadow-xs theme-card-alt"
                style={{
                  borderColor: 'var(--border)',
                  backgroundColor: 'rgba(var(--primary-rgb, 2, 132, 199), 0.04)',
                }}
              >
                {/* Subtle ECG Millimeter Graph Paper Grid */}
                <div className="absolute inset-0 hero-ecg-grid opacity-40 pointer-events-none" />

                {/* Telemetry Status Pill & Live Indicator */}
                <div className="relative z-10 flex items-center justify-between mb-1.5">
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-mono font-bold tracking-tight border shadow-xs backdrop-blur-md theme-badge">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: 'var(--primary)' }} />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ backgroundColor: 'var(--primary)' }} />
                    </span>
                    <Heart className="w-3 h-3 text-rose-500 fill-rose-500 animate-heart-beat" />
                    <span className="font-extrabold uppercase tracking-wider" style={{ color: 'var(--primary)' }}>
                      Live ECG Telemetry
                    </span>
                    <span className="opacity-40">•</span>
                    <span>72 BPM</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-mono theme-muted">
                    <span className="hidden sm:inline">LEAD II • Sinus Rhythm</span>
                    <span className="text-emerald-600 font-semibold font-sans">99% SpO₂</span>
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                </div>

                {/* Scrolling Continuous Cardiac Waveform (Compact h-10) */}
                <div className="relative h-10 w-full overflow-hidden rounded-lg">
                  <div className="hero-ecg-track items-center">
                    {/* SVG Loop 1 */}
                    <svg
                      className="h-10 w-[1000px] shrink-0"
                      viewBox="0 0 1000 60"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M 0,30 L 35,30 Q 42,22 50,22 Q 58,30 65,30 L 85,30 L 92,35 L 102,5 L 112,56 L 120,24 L 126,30 L 140,30 Q 155,16 170,30 L 250,30 L 285,30 Q 292,22 300,22 Q 308,30 315,30 L 335,30 L 342,35 L 352,5 L 362,56 L 370,24 L 376,30 L 390,30 Q 405,16 420,30 L 500,30 L 535,30 Q 542,22 550,22 Q 558,30 565,30 L 585,30 L 592,35 L 602,5 L 612,56 L 620,24 L 626,30 L 640,30 Q 655,16 670,30 L 750,30 L 785,30 Q 792,22 800,22 Q 808,30 815,30 L 835,30 L 842,35 L 852,5 L 862,56 L 870,24 L 876,30 L 890,30 Q 905,16 920,30 L 1000,30"
                        stroke="var(--primary)"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ filter: 'drop-shadow(0 0 5px var(--primary))' }}
                      />
                    </svg>

                    {/* SVG Loop 2 */}
                    <svg
                      className="h-10 w-[1000px] shrink-0"
                      viewBox="0 0 1000 60"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M 0,30 L 35,30 Q 42,22 50,22 Q 58,30 65,30 L 85,30 L 92,35 L 102,5 L 112,56 L 120,24 L 126,30 L 140,30 Q 155,16 170,30 L 250,30 L 285,30 Q 292,22 300,22 Q 308,30 315,30 L 335,30 L 342,35 L 352,5 L 362,56 L 370,24 L 376,30 L 390,30 Q 405,16 420,30 L 500,30 L 535,30 Q 542,22 550,22 Q 558,30 565,30 L 585,30 L 592,35 L 602,5 L 612,56 L 620,24 L 626,30 L 640,30 Q 655,16 670,30 L 750,30 L 785,30 Q 792,22 800,22 Q 808,30 815,30 L 835,30 L 842,35 L 852,5 L 862,56 L 870,24 L 876,30 L 890,30 Q 905,16 920,30 L 1000,30"
                        stroke="var(--primary)"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ filter: 'drop-shadow(0 0 5px var(--primary))' }}
                      />
                    </svg>
                  </div>
                  {/* Real-time Telemetry Light Beam Scanner */}
                  <div className="ecg-scanner-beam" />
                </div>
              </div>

              {/* Tighter 3 Clinical Feature Points */}
              <div className="space-y-2 pt-1">
                <div className="flex items-start gap-2.5">
                  <div
                    className="w-4.5 h-4.5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    style={{ backgroundColor: 'var(--badge-bg)', color: 'var(--primary)' }}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                  </div>
                  <div>
                    <h5 className="text-xs sm:text-[13px] font-bold theme-heading leading-snug">Comprehensive Clinical Disciplines</h5>
                    <p className="text-[11px] sm:text-xs theme-muted leading-tight">Interventional cardiology, emergency trauma, and advanced orthopedics.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div
                    className="w-4.5 h-4.5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    style={{ backgroundColor: 'var(--badge-bg)', color: 'var(--primary)' }}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                  </div>
                  <div>
                    <h5 className="text-xs sm:text-[13px] font-bold theme-heading leading-snug">Patient Safety & NABH Compliance</h5>
                    <p className="text-[11px] sm:text-xs theme-muted leading-tight">Zero-infection OT protocols, digital medication management, and transparent charting.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div
                    className="w-4.5 h-4.5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    style={{ backgroundColor: 'var(--badge-bg)', color: 'var(--primary)' }}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                  </div>
                  <div>
                    <h5 className="text-xs sm:text-[13px] font-bold theme-heading leading-snug">Community & Ethical Focus</h5>
                    <p className="text-[11px] sm:text-xs theme-muted leading-tight">Compassionate care with accessible, transparent consultation fee structures.</p>
                  </div>
                </div>
              </div>

              <div className="pt-1.5">
                <button
                  onClick={() => scrollToSection('facilities')}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs shadow-sm transition duration-200 flex items-center gap-2 cursor-pointer theme-btn-primary"
                >
                  <span>Explore Facilities</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── 5. Hospital Statistics (Animated Counters) ─────────────────────── */}
      <section
        ref={statsRef}
        className="py-14 text-white relative overflow-hidden theme-cta-banner"
      >
        {/* Subtle Background Glow */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle at 30% 50%, var(--primary), transparent 60%)' }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span
              className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderColor: 'rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
              }}
            >
              Trusted Clinical Excellence
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
              Our Journey in Numbers
            </h3>
            <p className="text-xs text-white/80 mt-1">
              Indicative hospital statistics reflecting our active departments and clinical reach.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            
            {/* Stat 1 */}
            <div className="p-6 rounded-2xl backdrop-blur-xs transition theme-stat-card">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-1 theme-stat-num">
                {countSpecialists}+
              </div>
              <div className="text-sm font-bold text-white">Specialists</div>
              <div className="text-[11px] text-white/75 mt-0.5">Senior Medical Consultants</div>
            </div>

            {/* Stat 2 */}
            <div className="p-6 rounded-2xl backdrop-blur-xs transition theme-stat-card">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-1 theme-stat-num">
                {countDepts}+
              </div>
              <div className="text-sm font-bold text-white">Departments</div>
              <div className="text-[11px] text-white/75 mt-0.5">Multi-Specialty Centers</div>
            </div>

            {/* Stat 3 */}
            <div className="p-6 rounded-2xl backdrop-blur-xs transition theme-stat-card">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-1 theme-stat-num">
                24/7
              </div>
              <div className="text-sm font-bold text-white">Emergency Care</div>
              <div className="text-[11px] text-white/75 mt-0.5">Round-the-Clock Support</div>
            </div>

            {/* Stat 4 */}
            <div className="p-6 rounded-2xl backdrop-blur-xs transition theme-stat-card">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-1 theme-stat-num">
                {countPatients}+
              </div>
              <div className="text-sm font-bold text-white">Patients Served</div>
              <div className="text-[11px] text-white/75 mt-0.5">Compassionate Consultations</div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── 6. Services Section ───────────────────────────────────────────── */}
      <section id="services" className="py-20 md:py-28 theme-section-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-3 theme-badge">
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Comprehensive Healthcare</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight theme-heading">
              Our Medical Services
            </h2>
            <p className="text-sm sm:text-base mt-3 leading-relaxed theme-body">
              We provide a full spectrum of healthcare services designed to offer preventive, 
              curative, and rehabilitative care with advanced medical technology.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Service 1: OPD */}
            <div className="p-6 sm:p-6.5 rounded-2xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1 theme-card min-h-[250px]">
              <div>
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300 shadow-2xs"
                  style={{ backgroundColor: 'var(--accent-light)', color: 'var(--primary)' }}
                >
                  <UserCheck className="w-6 h-6" />
                </div>
                <h4 className="text-base sm:text-lg font-bold mb-2 theme-heading">OPD Services</h4>
                <p className="text-xs sm:text-[13px] leading-relaxed theme-body line-clamp-3">
                  Daily outpatient consultations across cardiology, neurology, general medicine, and pediatrics.
                </p>
              </div>
              <div className="pt-3.5 mt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                <button
                  onClick={() => scrollToSection('appointment-cta')}
                  className="text-xs font-bold flex items-center gap-1.5 cursor-pointer theme-primary-text group-hover:gap-2 transition-all"
                >
                  <span>View OPD Details</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>

            {/* Service 2: Emergency */}
            <div className="p-6 sm:p-6.5 rounded-2xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1 theme-card min-h-[250px]">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300 shadow-2xs border border-rose-100 dark:border-rose-900/40">
                  <Siren className="w-6 h-6" />
                </div>
                <h4 className="text-base sm:text-lg font-bold mb-2 theme-heading">Emergency Care</h4>
                <p className="text-xs sm:text-[13px] leading-relaxed theme-body line-clamp-3">
                  24/7 trauma triage, cardiac resuscitation, acute stroke intervention, and ALS ambulance dispatch.
                </p>
              </div>
              <div className="pt-3.5 mt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                <a
                  href="tel:1066"
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1.5 group-hover:gap-2 transition-all"
                >
                  <span>24/7 Hotline: 1066</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </a>
              </div>
            </div>

            {/* Service 3: Specialist Consultation */}
            <div className="p-6 sm:p-6.5 rounded-2xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1 theme-card min-h-[250px]">
              <div>
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300 shadow-2xs"
                  style={{ backgroundColor: 'var(--accent-light)', color: 'var(--primary)' }}
                >
                  <Stethoscope className="w-6 h-6" />
                </div>
                <h4 className="text-base sm:text-lg font-bold mb-2 theme-heading">Specialist Consultation</h4>
                <p className="text-xs sm:text-[13px] leading-relaxed theme-body line-clamp-3">
                  Senior board-certified physicians in Cardiology, Orthopedics, Neurosurgery, and Oncology.
                </p>
              </div>
              <div className="pt-3.5 mt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                <button
                  onClick={() => scrollToSection('doctors')}
                  className="text-xs font-bold flex items-center gap-1.5 cursor-pointer theme-primary-text group-hover:gap-2 transition-all"
                >
                  <span>Meet Specialists</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>

            {/* Service 4: IPD / Inpatient Care */}
            <div className="p-6 sm:p-6.5 rounded-2xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1 theme-card min-h-[250px]">
              <div>
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300 shadow-2xs"
                  style={{ backgroundColor: 'var(--accent-light)', color: 'var(--primary)' }}
                >
                  <Bed className="w-6 h-6" />
                </div>
                <h4 className="text-base sm:text-lg font-bold mb-2 theme-heading">IPD / Inpatient Care</h4>
                <p className="text-xs sm:text-[13px] leading-relaxed theme-body line-clamp-3">
                  Comfortable single rooms, semi-private suites, and general wards with round-the-clock nursing.
                </p>
              </div>
              <div className="pt-3.5 mt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                <button
                  onClick={() => scrollToSection('facilities')}
                  className="text-xs font-bold flex items-center gap-1.5 cursor-pointer theme-primary-text group-hover:gap-2 transition-all"
                >
                  <span>Explore Inpatient</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>

            {/* Service 5: Pharmacy */}
            <div className="p-6 sm:p-6.5 rounded-2xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1 theme-card min-h-[250px]">
              <div>
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300 shadow-2xs"
                  style={{ backgroundColor: 'var(--accent-light)', color: 'var(--primary)' }}
                >
                  <Pill className="w-6 h-6" />
                </div>
                <h4 className="text-base sm:text-lg font-bold mb-2 theme-heading">24/7 Pharmacy</h4>
                <p className="text-xs sm:text-[13px] leading-relaxed theme-body line-clamp-3">
                  In-house certified dispensary stocking genuine branded, surgical, and life-saving critical medicines.
                </p>
              </div>
              <div className="pt-3.5 mt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                <span className="text-xs font-semibold theme-muted flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>In-House Counter</span>
                </span>
              </div>
            </div>

            {/* Service 6: Clinical Laboratory */}
            <div className="p-6 sm:p-6.5 rounded-2xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1 theme-card min-h-[250px]">
              <div>
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300 shadow-2xs"
                  style={{ backgroundColor: 'var(--accent-light)', color: 'var(--primary)' }}
                >
                  <Microscope className="w-6 h-6" />
                </div>
                <h4 className="text-base sm:text-lg font-bold mb-2 theme-heading">Clinical Laboratory</h4>
                <p className="text-xs sm:text-[13px] leading-relaxed theme-body line-clamp-3">
                  Automated hematology, biochemistry, microbiology, and fast digital report turnaround times.
                </p>
              </div>
              <div className="pt-3.5 mt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                <span className="text-xs font-semibold theme-muted flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>NABL Standard Testing</span>
                </span>
              </div>
            </div>

            {/* Service 7: Diagnostics */}
            <div className="p-6 sm:p-6.5 rounded-2xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1 theme-card min-h-[250px]">
              <div>
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300 shadow-2xs"
                  style={{ backgroundColor: 'var(--accent-light)', color: 'var(--primary)' }}
                >
                  <Activity className="w-6 h-6" />
                </div>
                <h4 className="text-base sm:text-lg font-bold mb-2 theme-heading">Diagnostics</h4>
                <p className="text-xs sm:text-[13px] leading-relaxed theme-body line-clamp-3">
                  High-definition digital X-Ray, 3D Echocardiography, Doppler Ultrasound, and computerized ECG.
                </p>
              </div>
              <div className="pt-3.5 mt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                <span className="text-xs font-semibold theme-muted flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Precision Imaging</span>
                </span>
              </div>
            </div>

            {/* Service 8: Critical Care */}
            <div className="p-6 sm:p-6.5 rounded-2xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1 theme-card min-h-[250px]">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300 shadow-2xs border border-rose-100 dark:border-rose-900/40">
                  <Heart className="w-6 h-6" />
                </div>
                <h4 className="text-base sm:text-lg font-bold mb-2 theme-heading">Critical Care (ICU)</h4>
                <p className="text-xs sm:text-[13px] leading-relaxed theme-body line-clamp-3">
                  Dedicated multi-bed intensive care unit with advanced mechanical ventilators & 1:1 nursing ratios.
                </p>
              </div>
              <div className="pt-3.5 mt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                <span className="text-xs font-semibold text-rose-600 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  <span>Continuous Telemetry</span>
                </span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── 7. Doctors Section ("Meet Our Specialists") ───────────────────── */}
      <section
        id="doctors"
        className="py-20 md:py-28 border-t theme-section-alt"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-3 theme-badge">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Medical Leadership</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight theme-heading">
              Meet Our Specialists
            </h2>
            <p className="text-sm sm:text-base mt-3 leading-relaxed theme-body">
              Our multidisciplinary medical team combines deep clinical expertise, renowned hospital
              experience, and a dedicated commitment to patient outcomes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Doctor 1 */}
            <div className="rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1.5 theme-card">
              <div>
                <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&auto=format&fit=crop&q=80"
                    alt="Dr. Vikram Reddy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-xs theme-btn-primary">
                    18+ Yrs Exp
                  </div>
                </div>
                <div className="p-5">
                  <span className="text-[11px] font-bold uppercase tracking-wider theme-primary-text">Cardiology</span>
                  <h4 className="text-base font-extrabold mt-1 theme-heading">Dr. Vikram Reddy</h4>
                  <p className="text-xs mt-0.5 theme-muted">MD, DM (Cardiology), FSCAI</p>
                  <p className="text-xs mt-3 line-clamp-2 theme-body">
                    Chief Interventional Cardiologist specializing in complex angioplasties and structural heart therapies.
                  </p>
                </div>
              </div>
              <div className="p-5 pt-0">
                <button
                  onClick={() => scrollToSection('appointment-cta')}
                  className="w-full py-2.5 rounded-xl font-bold text-xs transition duration-200 flex items-center justify-center gap-1.5 cursor-pointer theme-btn-secondary"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book Consultation</span>
                </button>
              </div>
            </div>

            {/* Doctor 2 */}
            <div className="rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1.5 theme-card">
              <div>
                <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1594824813566-88855ce78961?w=400&auto=format&fit=crop&q=80"
                    alt="Dr. Ananya Swaminathan"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-xs theme-btn-primary">
                    14+ Yrs Exp
                  </div>
                </div>
                <div className="p-5">
                  <span className="text-[11px] font-bold uppercase tracking-wider theme-primary-text">Neurosurgery</span>
                  <h4 className="text-base font-extrabold mt-1 theme-heading">Dr. Ananya Swaminathan</h4>
                  <p className="text-xs mt-0.5 theme-muted">MS, M.Ch (Neurosurgery)</p>
                  <p className="text-xs mt-3 line-clamp-2 theme-body">
                    Senior Brain & Spine Surgeon with clinical focus on minimally invasive spine surgery and stroke rescue.
                  </p>
                </div>
              </div>
              <div className="p-5 pt-0">
                <button
                  onClick={() => scrollToSection('appointment-cta')}
                  className="w-full py-2.5 rounded-xl font-bold text-xs transition duration-200 flex items-center justify-center gap-1.5 cursor-pointer theme-btn-secondary"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book Consultation</span>
                </button>
              </div>
            </div>

            {/* Doctor 3 */}
            <div className="rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1.5 theme-card">
              <div>
                <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&auto=format&fit=crop&q=80"
                    alt="Dr. Sameer Khan"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-xs theme-btn-primary">
                    11+ Yrs Exp
                  </div>
                </div>
                <div className="p-5">
                  <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">Emergency & Trauma</span>
                  <h4 className="text-base font-extrabold mt-1 theme-heading">Dr. Sameer Khan</h4>
                  <p className="text-xs mt-0.5 theme-muted">MD (Emergency Medicine), MEM</p>
                  <p className="text-xs mt-3 line-clamp-2 theme-body">
                    Head of Trauma & Emergency Resuscitation leading round-the-clock level 1 emergency protocols.
                  </p>
                </div>
              </div>
              <div className="p-5 pt-0">
                <button
                  onClick={() => scrollToSection('appointment-cta')}
                  className="w-full py-2.5 rounded-xl font-bold text-xs transition duration-200 flex items-center justify-center gap-1.5 cursor-pointer theme-btn-secondary"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book Consultation</span>
                </button>
              </div>
            </div>

            {/* Doctor 4 */}
            <div className="rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1.5 theme-card">
              <div>
                <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80"
                    alt="Dr. Sunita Kulkarni"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-xs theme-btn-primary">
                    12+ Yrs Exp
                  </div>
                </div>
                <div className="p-5">
                  <span className="text-[11px] font-bold uppercase tracking-wider theme-primary-text">Internal Medicine</span>
                  <h4 className="text-base font-extrabold mt-1 theme-heading">Dr. Sunita Kulkarni</h4>
                  <p className="text-xs mt-0.5 theme-muted">MD (General Medicine), DNB</p>
                  <p className="text-xs mt-3 line-clamp-2 theme-body">
                    Consultant in Diabetology, metabolic disorders, infectious diseases, and comprehensive health checkups.
                  </p>
                </div>
              </div>
              <div className="p-5 pt-0">
                <button
                  onClick={() => scrollToSection('appointment-cta')}
                  className="w-full py-2.5 rounded-xl font-bold text-xs transition duration-200 flex items-center justify-center gap-1.5 cursor-pointer theme-btn-secondary"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book Consultation</span>
                </button>
              </div>
            </div>

          </div>

          <div className="mt-8 text-center text-xs italic theme-muted">
            * Doctor profiles and consulting schedules are placeholder demonstrations. Additional specialist schedules available at the front desk.
          </div>

        </div>
      </section>

      {/* ─── 8. Facilities Section ─────────────────────────────────────────── */}
      <section id="facilities" className="py-20 md:py-28 theme-section-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-3 theme-badge">
              <Building2 className="w-3.5 h-3.5" />
              <span>Hospital Infrastructure</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight theme-heading">
              World-Class Facilities
            </h2>
            <p className="text-sm sm:text-base mt-3 leading-relaxed theme-body">
              Designed according to international NABH safety guidelines, our medical infrastructure
              ensures maximum hygiene, quick clinical response, and superior patient comfort.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Facility 1: ICU */}
            <div className="rounded-2xl overflow-hidden transition-all duration-300 group theme-card">
              <div className="aspect-[16/10] overflow-hidden bg-slate-200">
                <img
                  src="https://images.unsplash.com/photo-1516549655169-df83a0774514?w=400&auto=format&fit=crop&q=80"
                  alt="Intensive Care Unit (ICU)"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-4">
                <h4 className="text-base font-bold theme-heading">Intensive Care Unit (ICU)</h4>
                <p className="text-xs mt-1 leading-relaxed theme-body">
                  High-tech multipara monitors, invasive ventilation, and dedicated 24/7 intensivist supervision.
                </p>
              </div>
            </div>

            {/* Facility 2: Operation Theatre */}
            <div className="rounded-2xl overflow-hidden transition-all duration-300 group theme-card">
              <div className="aspect-[16/10] overflow-hidden bg-slate-200">
                <img
                  src="https://images.unsplash.com/photo-1551076805-e1869033e561?w=400&auto=format&fit=crop&q=80"
                  alt="Modular Operation Theatre"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-4">
                <h4 className="text-base font-bold theme-heading">Modular Operation Theatre</h4>
                <p className="text-xs mt-1 leading-relaxed theme-body">
                  Laminar airflow, HEPA filtration, anti-microbial surfaces, and modern surgical endoscopy units.
                </p>
              </div>
            </div>

            {/* Facility 3: Emergency Department */}
            <div className="rounded-2xl overflow-hidden transition-all duration-300 group theme-card">
              <div className="aspect-[16/10] overflow-hidden bg-slate-200">
                <img
                  src="https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=400&auto=format&fit=crop&q=80"
                  alt="Emergency Department"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-4">
                <h4 className="text-base font-bold theme-heading">Emergency & Trauma Bay</h4>
                <p className="text-xs mt-1 leading-relaxed theme-body">
                  Direct ramp ambulance access, multi-bed trauma resuscitation bays, and emergency minor OT.
                </p>
              </div>
            </div>

            {/* Facility 4: Laboratory */}
            <div className="rounded-2xl overflow-hidden transition-all duration-300 group theme-card">
              <div className="aspect-[16/10] overflow-hidden bg-slate-200">
                <img
                  src="https://images.unsplash.com/photo-1579154204601-01588f351e67?w=400&auto=format&fit=crop&q=80"
                  alt="Clinical Laboratory"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-4">
                <h4 className="text-base font-bold theme-heading">Clinical Laboratory</h4>
                <p className="text-xs mt-1 leading-relaxed theme-body">
                  Fully automated high-throughput analyzers ensuring fast, error-free diagnostic test reports.
                </p>
              </div>
            </div>

            {/* Facility 5: Pharmacy */}
            <div className="rounded-2xl overflow-hidden transition-all duration-300 group theme-card">
              <div className="aspect-[16/10] overflow-hidden bg-slate-200">
                <img
                  src="https://images.unsplash.com/photo-1586015555751-63c25e8a5b28?w=400&auto=format&fit=crop&q=80"
                  alt="24/7 Pharmacy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-4">
                <h4 className="text-base font-bold theme-heading">24/7 In-House Pharmacy</h4>
                <p className="text-xs mt-1 leading-relaxed theme-body">
                  Stocked with critical injectables, cold-chain biologics, and everyday post-consultation medicines.
                </p>
              </div>
            </div>

            {/* Facility 6: Patient Rooms */}
            <div className="rounded-2xl overflow-hidden transition-all duration-300 group theme-card">
              <div className="aspect-[16/10] overflow-hidden bg-slate-200">
                <img
                  src="https://images.unsplash.com/photo-1512678080530-7760d81faba6?w=400&auto=format&fit=crop&q=80"
                  alt="Patient Rooms & Suites"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-4">
                <h4 className="text-base font-bold theme-heading">Patient Rooms & Suites</h4>
                <p className="text-xs mt-1 leading-relaxed theme-body">
                  Quiet, hygienic private suites, deluxe AC rooms, and well-ventilated recovery wards.
                </p>
              </div>
            </div>

            {/* Facility 7: Diagnostics */}
            <div className="rounded-2xl overflow-hidden transition-all duration-300 group theme-card">
              <div className="aspect-[16/10] overflow-hidden bg-slate-200">
                <img
                  src="https://images.unsplash.com/photo-1516549655169-df83a0774514?w=400&auto=format&fit=crop&q=80"
                  alt="Diagnostic Imaging Facilities"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-4">
                <h4 className="text-base font-bold theme-heading">Diagnostic Facilities</h4>
                <p className="text-xs mt-1 leading-relaxed theme-body">
                  Digital radiography, ultrasound color doppler, pulmonary function testing, and endoscopy suites.
                </p>
              </div>
            </div>

            {/* Facility 8: Ambulance */}
            <div className="rounded-2xl overflow-hidden transition-all duration-300 group theme-card">
              <div className="aspect-[16/10] overflow-hidden bg-slate-200">
                <img
                  src="https://images.unsplash.com/photo-1587745416684-47953f16f02f?w=400&auto=format&fit=crop&q=80"
                  alt="ALS Ambulance Fleet"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-4">
                <h4 className="text-base font-bold theme-heading">ALS Ambulance Fleet</h4>
                <p className="text-xs mt-1 leading-relaxed theme-body">
                  Equipped with mobile transport ventilators, defibrillators, oxygen supply, and paramedic staff.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── 9. Why Choose Us Section ──────────────────────────────────────── */}
      <section
        id="why-us"
        className="py-20 md:py-28 border-t theme-section-alt"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-3 theme-badge">
              <Shield className="w-3.5 h-3.5" />
              <span>Why Choose Us</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight theme-heading">
              Why Patients Trust Bhaskar Reddy Hospital
            </h2>
            <p className="text-sm sm:text-base mt-3 leading-relaxed theme-body">
              We stand as a trusted healthcare partner for thousands of families through dedicated clinical excellence,
              patient-first integrity, and modern infrastructure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Reason 1 */}
            <div className="p-6 rounded-2xl transition-all duration-300 group hover:-translate-y-1 theme-card">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                style={{ backgroundColor: 'var(--accent-light)', color: 'var(--primary)' }}
              >
                <UserCheck className="w-6 h-6" />
              </div>
              <h4 className="text-base font-extrabold mb-2 theme-heading">Experienced Medical Team</h4>
              <p className="text-xs leading-relaxed theme-body">
                Our senior clinicians and surgeons bring comprehensive expertise from leading medical institutions,
                delivering accurate diagnosis and personalized treatment plans.
              </p>
            </div>

            {/* Reason 2 */}
            <div className="p-6 rounded-2xl transition-all duration-300 group hover:-translate-y-1 theme-card">
              <div className="w-11 h-11 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Heart className="w-6 h-6" />
              </div>
              <h4 className="text-base font-extrabold mb-2 theme-heading">Patient-Focused Care</h4>
              <p className="text-xs leading-relaxed theme-body">
                From pre-admission counseling to post-discharge recovery monitoring, your comfort, dignity,
                and speedy recovery remain our foremost priorities.
              </p>
            </div>

            {/* Reason 3 */}
            <div className="p-6 rounded-2xl transition-all duration-300 group hover:-translate-y-1 theme-card">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                style={{ backgroundColor: 'var(--accent-light)', color: 'var(--primary)' }}
              >
                <Building2 className="w-6 h-6" />
              </div>
              <h4 className="text-base font-extrabold mb-2 theme-heading">Modern Medical Facilities</h4>
              <p className="text-xs leading-relaxed theme-body">
                High-definition digital diagnostics, modern modular operating theatres, and clean sterile recovery
                wards built strictly to NABH accreditation benchmarks.
              </p>
            </div>

            {/* Reason 4 */}
            <div className="p-6 rounded-2xl transition-all duration-300 group hover:-translate-y-1 theme-card">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                style={{ backgroundColor: 'var(--accent-light)', color: 'var(--primary)' }}
              >
                <Clock className="w-6 h-6" />
              </div>
              <h4 className="text-base font-extrabold mb-2 theme-heading">24/7 Emergency Support</h4>
              <p className="text-xs leading-relaxed theme-body">
                Always-awake trauma resuscitation team, on-call emergency surgical specialists, in-house blood bank
                coordination, and quick response ambulance dispatches.
              </p>
            </div>

            {/* Reason 5 */}
            <div className="p-6 rounded-2xl transition-all duration-300 group hover:-translate-y-1 theme-card">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                style={{ backgroundColor: 'var(--accent-light)', color: 'var(--primary)' }}
              >
                <Calendar className="w-6 h-6" />
              </div>
              <h4 className="text-base font-extrabold mb-2 theme-heading">Easy Appointment Booking</h4>
              <p className="text-xs leading-relaxed theme-body">
                Streamlined outpatient registration with zero unnecessary waiting times and simplified token tracking
                for doctor consultations.
              </p>
            </div>

            {/* Reason 6 */}
            <div className="p-6 rounded-2xl transition-all duration-300 group hover:-translate-y-1 theme-card">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                style={{ backgroundColor: 'var(--accent-light)', color: 'var(--primary)' }}
              >
                <Shield className="w-6 h-6" />
              </div>
              <h4 className="text-base font-extrabold mb-2 theme-heading">Comprehensive Healthcare</h4>
              <p className="text-xs leading-relaxed theme-body">
                Under one roof: Outpatient, Inpatient, Diagnostics, Pharmacy, Emergency, and Cashless Insurance TPA
                services for a seamless healing journey.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ─── 10. Appointment Call-to-Action (CTA) ─────────────────────────── */}
      <section
        id="appointment-cta"
        className="py-16 md:py-24 text-white relative overflow-hidden theme-cta-banner"
      >
        {/* Soft Radial Ambient Glow */}
        <div
          className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-30"
          style={{ background: 'var(--primary)' }}
        />
        <div
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-25"
          style={{ background: 'var(--accent)' }}
        />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-xs font-bold mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Fast & Convenient Consultation</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">
            Your Health Is Our Priority
          </h2>

          <p className="text-white/80 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed mb-8">
            Book an appointment with our experienced medical professionals today. Our front desk and care 
            coordinators are ready to assist you with quick scheduling.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="tel:+918612345678"
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-sm shadow-xl hover:-translate-y-0.5 transition duration-200 flex items-center justify-center gap-2 theme-btn-primary"
            >
              <Calendar className="w-4 h-4" />
              <span>Call Front Desk: +91 861 234 5678</span>
            </a>

            <button
              onClick={() => scrollToSection('contact')}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 backdrop-blur-xs transition duration-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Mail className="w-4 h-4" />
              <span>Contact Us</span>
            </button>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-white/80">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              No Prepayment Required
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              Same-Day Specialist Slots
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              Dedicated Patient Assistance
            </span>
          </div>
        </div>
      </section>

      {/* ─── 11. Contact Preview Section ───────────────────────────────────── */}
      <section id="contact" className="py-20 md:py-28 theme-section-alt">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-3 theme-badge">
              <MapPin className="w-3.5 h-3.5" />
              <span>Get In Touch</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight theme-heading">
              Contact & Location
            </h2>
            <p className="text-sm sm:text-base mt-3 leading-relaxed theme-body">
              Find our hospital campus, reach out for inquiry assistance, or connect with our 24/7 emergency dispatch.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Contact Details Cards */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* Address */}
              <div className="p-5 rounded-2xl shadow-xs flex items-start gap-4 theme-card">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: 'var(--accent-light)', color: 'var(--primary)' }}
                >
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-sm font-bold theme-heading">Hospital Address</h5>
                  <p className="text-xs mt-1 leading-relaxed theme-body">
                    Bhaskar Reddy Hospital Campus,<br />
                    Main Multi-Specialty Road, Nellore,<br />
                    Andhra Pradesh - 524001, India.
                  </p>
                </div>
              </div>

              {/* Phone Contacts */}
              <div className="p-5 rounded-2xl shadow-xs flex items-start gap-4 theme-card">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: 'var(--accent-light)', color: 'var(--primary)' }}
                >
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-sm font-bold theme-heading">Phone Numbers</h5>
                  <p className="text-xs mt-1 theme-body">
                    Front Desk: <a href="tel:+918612345678" className="font-semibold theme-primary-text">+91 861 234 5678</a>
                  </p>
                  <p className="text-xs mt-0.5 theme-body">
                    Appointments: <a href="tel:+918612345679" className="font-semibold theme-primary-text">+91 861 234 5679</a>
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="p-5 rounded-2xl shadow-xs flex items-start gap-4 theme-card">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: 'var(--accent-light)', color: 'var(--primary)' }}
                >
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-sm font-bold theme-heading">Email Inquiry</h5>
                  <p className="text-xs mt-1 theme-body">
                    General: <a href="mailto:contact@bhaskarreddyhospital.com" className="font-semibold theme-primary-text">contact@bhaskarreddyhospital.com</a>
                  </p>
                  <p className="text-xs mt-0.5 theme-body">
                    Help Desk: <a href="mailto:helpdesk@bhaskarreddyhospital.com" className="font-semibold theme-primary-text">helpdesk@bhaskarreddyhospital.com</a>
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
              <div className="h-full min-h-[380px] rounded-3xl overflow-hidden p-6 flex flex-col justify-between relative theme-card">
                
                {/* Stylized Mock Map Visual */}
                <div
                  className="relative w-full h-64 sm:h-72 rounded-2xl overflow-hidden border flex items-center justify-center"
                  style={{ backgroundColor: 'var(--section-alt-bg)', borderColor: 'var(--border)' }}
                >
                  
                  {/* Grid Lines to simulate map cartography */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(150,150,150,0.15)_1px,transparent_1px),linear-gradient(to_bottom,rgba(150,150,150,0.15)_1px,transparent_1px)] bg-[size:28px_28px] opacity-70" />
                  
                  {/* Simulated Road network */}
                  <div
                    className="absolute top-1/2 left-0 right-0 h-4 -translate-y-1/2"
                    style={{ backgroundColor: 'var(--border)' }}
                  />
                  <div
                    className="absolute top-0 bottom-0 left-1/3 w-3"
                    style={{ backgroundColor: 'var(--border)' }}
                  />
                  <div
                    className="absolute top-0 bottom-0 right-1/4 w-3"
                    style={{ backgroundColor: 'var(--border)' }}
                  />

                  {/* Hospital Location Pin */}
                  <div className="relative z-10 flex flex-col items-center animate-bounce">
                    <div
                      className="px-3 py-1.5 rounded-xl text-white text-xs font-bold shadow-xl border flex items-center gap-1.5 mb-1"
                      style={{ backgroundColor: 'var(--surface)', color: 'var(--text-primary)', borderColor: 'var(--primary)' }}
                    >
                      <Activity className="w-3.5 h-3.5" style={{ color: 'var(--primary)' }} />
                      <span>Bhaskar Reddy Hospital</span>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-rose-600 border-2 border-white shadow-lg flex items-center justify-center text-white">
                      <MapPin className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Location Legend Overlay */}
                  <div
                    className="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg border text-[11px] font-medium"
                    style={{ backgroundColor: 'var(--surface)', color: 'var(--text-secondary)', borderColor: 'var(--border)' }}
                  >
                    📍 Nellore Main Medical Campus
                  </div>
                </div>

                <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <div className="text-xs theme-muted">
                    * Interactive navigation map integration placeholder. Real Google Maps coordinates can be connected in settings.
                  </div>
                  <a
                    href="https://maps.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition shrink-0 theme-btn-secondary"
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

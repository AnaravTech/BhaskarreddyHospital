import type {
  Doctor,
  Department,
  HealthPackage,
  BlogPost,
  GalleryItem,
  Testimonial,
  ContactInquiry,
  OnlineAppointment,
} from './types';

export const mockDepartments: Department[] = [
  {
    id: 'dept-1',
    name: 'Cardiology & Cardiac Surgery',
    code: 'CARD',
    headDoctor: 'Dr. Vikram Reddy, MD, DM',
    opdRoom: 'OPD-101',
    totalBeds: 45,
    description: 'Comprehensive 24/7 cardiac emergency care, interventional cardiology, TAVI, and minimally invasive bypass surgeries.',
    services: ['24/7 Cath Lab & Angioplasty', 'Coronary Artery Bypass (CABG)', 'Pacemaker Implantation', '3D Echocardiography'],
  },
  {
    id: 'dept-2',
    name: 'Neurology & Neurosurgery',
    code: 'NEUR',
    headDoctor: 'Dr. Ananya Swaminathan, M.Ch',
    opdRoom: 'OPD-104',
    totalBeds: 30,
    description: 'Advanced brain and spine surgery, stroke resuscitation unit, epilepsy care, and neuro-critical monitoring.',
    services: ['Micro-Neurosurgery', 'Endoscopic Brain Surgery', 'Spine Stabilization', 'Stroke Emergency Unit'],
  },
  {
    id: 'dept-3',
    name: 'Orthopedics & Joint Replacement',
    code: 'ORTH',
    headDoctor: 'Dr. Rajeshwar Rao, MS (Ortho)',
    opdRoom: 'OPD-202',
    totalBeds: 50,
    description: 'Robotic knee and hip replacement, complex trauma surgery, sports medicine, and arthroscopy.',
    services: ['Robotic Total Knee Replacement', 'Hip Resurfacing & Revision', 'Arthroscopic Ligament Repair', 'Polytrauma Care'],
  },
];

export const mockDoctors: Doctor[] = [
  {
    id: 'doc-1',
    name: 'Dr. Vikram Reddy',
    qualification: 'MD, DM (Cardiology), FACC',
    departmentName: 'Cardiology & Cardiac Surgery',
    specialization: 'Interventional Cardiologist',
    consultationFee: 500,
    premiumFee: 750,
    availabilityDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    workingHours: '09:00 AM - 04:30 PM',
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80',
    rating: 4.9,
    experienceYears: 18,
  },
  {
    id: 'doc-2',
    name: 'Dr. Ananya Swaminathan',
    qualification: 'MS, M.Ch (Neurosurgery)',
    departmentName: 'Neurology & Neurosurgery',
    specialization: 'Brain & Spine Surgeon',
    consultationFee: 600,
    premiumFee: 850,
    availabilityDays: ['Mon', 'Wed', 'Thu', 'Fri'],
    workingHours: '10:00 AM - 05:00 PM',
    image: 'https://images.unsplash.com/photo-1594824813566-88855ce78961?w=300&auto=format&fit=crop&q=80',
    rating: 4.95,
    experienceYears: 14,
  },
  {
    id: 'doc-3',
    name: 'Dr. Rajeshwar Rao',
    qualification: 'MS (Ortho), Fellowship UK',
    departmentName: 'Orthopedics & Joint Replacement',
    specialization: 'Robotic Knee & Hip Specialist',
    consultationFee: 400,
    premiumFee: 600,
    availabilityDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    workingHours: '09:30 AM - 03:30 PM',
    image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=300&auto=format&fit=crop&q=80',
    rating: 4.8,
    experienceYears: 16,
  },
];

export const mockHealthPackages: HealthPackage[] = [
  {
    id: 'pkg-1',
    title: 'Executive Master Health Checkup',
    price: 4999,
    originalPrice: 9500,
    recommendedFor: 'Men & Women (Age 35+)',
    isPopular: true,
    features: [
      'Complete Blood Count (CBC) with ESR',
      'Lipid Profile & Cardiac Risk Markers',
      'Liver & Kidney Function Tests (LFT/KFT)',
      'HBA1C & Fasting Blood Sugar',
      'Digital Chest X-Ray & ECG',
      'Doctor Consultation & Diet Advice',
    ],
  },
  {
    id: 'pkg-2',
    title: 'Comprehensive Cardiac Health Shield',
    price: 6499,
    originalPrice: 12000,
    recommendedFor: 'Patients with High BP, Cholesterol, Diabetes',
    isPopular: false,
    features: [
      'Treadmill Stress Test (TMT) / ECHO',
      'Hs-CRP & High Sensitivity Cardiac Markers',
      'Complete Lipid & Triglyceride Panel',
      'Interventional Cardiologist Review',
    ],
  },
];

export const mockBlogPosts: BlogPost[] = [
  {
    id: 'blog-1',
    title: 'Recognizing Early Warning Signs of Heart Attack: Minutes Save Muscles',
    category: 'Cardiology',
    author: 'Dr. Vikram Reddy, MD, DM',
    date: '2026-07-20',
    excerpt: 'Understanding atypical chest discomfort, diaphoresis, and shortness of breath can dramatically reduce myocardial infarction damage.',
    content: 'Chest pain is not the only indicator of an impending heart attack...',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=80',
    seoTitle: 'Early Heart Attack Symptoms & Cardiac Care | Bhaskar Reddy Hospital',
    seoDescription: 'Learn early warning signs of heart attack from Chief Cardiologist Dr. Vikram Reddy.',
    status: 'Published',
  },
];

export const mockGalleryItems: GalleryItem[] = [
  { id: 'g-1', title: 'Ultra-Modern Hybrid Operation Theatre', category: 'Operation Theatre', image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&auto=format&fit=crop&q=80', description: 'HEPA laminar airflow 4th Gen OT suite' },
  { id: 'g-2', title: 'Cardiac Intensive Care Unit (ICU)', category: 'ICU & Rooms', image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=600&auto=format&fit=crop&q=80', description: 'Central telemetry 1:1 nursing monitoring' },
];

export const mockTestimonials: Testimonial[] = [
  {
    id: 'test-1',
    patientName: 'Prabhakar Rao',
    age: 58,
    treatment: 'Robotic Knee Replacement',
    doctorName: 'Dr. Rajeshwar Rao',
    rating: 5,
    reviewText: 'I was unable to walk due to severe osteoarthritis. After robotic knee replacement at Bhaskar Reddy Hospital, I was walking pain-free on the 2nd day!',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
];

export const mockContactInquiries: ContactInquiry[] = [
  {
    id: 'inq-1',
    name: 'Anand Kumar',
    phone: '+91 98480 77112',
    email: 'anand.k@gmail.com',
    subject: 'Inquiry for Cardiac Health Package',
    message: 'I want to book an Executive Cardiac Health Checkup for my parents. Please call back.',
    date: '2026-07-24 09:15',
    status: 'New Inquiry',
  },
];

export const mockAppointments: OnlineAppointment[] = [
  {
    id: 'apt-1',
    patientName: 'Kavitha Venkatram',
    patientPhone: '+91 98490 12345',
    patientAge: 48,
    patientGender: 'Female',
    doctorName: 'Dr. Vikram Reddy',
    departmentName: 'Cardiology & Cardiac Surgery',
    appointmentDate: '2026-07-25',
    appointmentTime: '10:00 AM',
    model: 'Premium Slot',
    fee: 750,
    status: 'Confirmed',
  },
];

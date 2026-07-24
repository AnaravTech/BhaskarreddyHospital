export interface Doctor {
  id: string;
  name: string;
  qualification: string;
  departmentName: string;
  specialization: string;
  consultationFee: number;
  premiumFee: number;
  availabilityDays: string[];
  workingHours: string;
  image: string;
  rating: number;
  experienceYears: number;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  headDoctor: string;
  opdRoom: string;
  totalBeds: number;
  description: string;
  services: string[];
}

export interface HealthPackage {
  id: string;
  title: string;
  price: number;
  originalPrice: number;
  recommendedFor: string;
  features: string[];
  isPopular?: boolean;
}

export interface BlogPost {
  id: string;
  title: string;
  category: string;
  author: string;
  date: string;
  excerpt: string;
  content: string;
  image: string;
  seoTitle: string;
  seoDescription: string;
  status: 'Published' | 'Draft';
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'Operation Theatre' | 'ICU & Rooms' | 'Diagnostics' | 'Reception & Lobby';
  image: string;
  description: string;
}

export interface Testimonial {
  id: string;
  patientName: string;
  age: number;
  treatment: string;
  doctorName: string;
  rating: number;
  reviewText: string;
  photo: string;
}

export interface ContactInquiry {
  id: string;
  name: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
  date: string;
  status: 'New Inquiry' | 'Callback Scheduled' | 'Resolved';
}

export interface OnlineAppointment {
  id: string;
  patientName: string;
  patientPhone: string;
  patientAge: number;
  patientGender: string;
  doctorName: string;
  departmentName: string;
  appointmentDate: string;
  appointmentTime: string;
  model: 'Premium Slot' | 'Normal Queue';
  fee: number;
  status: 'Confirmed' | 'Completed';
}

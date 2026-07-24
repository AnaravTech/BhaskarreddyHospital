import React, { createContext, useContext, useState } from 'react';
import type {
  Doctor,
  Department,
  HealthPackage,
  BlogPost,
  GalleryItem,
  Testimonial,
  ContactInquiry,
  OnlineAppointment,
} from '../types';
import {
  mockDoctors,
  mockDepartments,
  mockHealthPackages,
  mockBlogPosts,
  mockGalleryItems,
  mockTestimonials,
  mockContactInquiries,
  mockAppointments,
} from '../mockData';

interface ToastNotification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning';
}

interface WebsiteContextType {
  activeView: 'public-website' | 'website-cms';
  setActiveView: (view: 'public-website' | 'website-cms') => void;

  doctors: Doctor[];
  departments: Department[];
  healthPackages: HealthPackage[];
  blogPosts: BlogPost[];
  galleryItems: GalleryItem[];
  testimonials: Testimonial[];
  contactInquiries: ContactInquiry[];
  appointments: OnlineAppointment[];
  toasts: ToastNotification[];

  addAppointment: (apt: Omit<OnlineAppointment, 'id' | 'status'>) => void;
  addContactInquiry: (inq: Omit<ContactInquiry, 'id' | 'date' | 'status'>) => void;
  addBlogPost: (post: Omit<BlogPost, 'id'>) => void;
  addToast: (title: string, message: string, type?: ToastNotification['type']) => void;
  removeToast: (id: string) => void;
}

const WebsiteContext = createContext<WebsiteContextType | undefined>(undefined);

export const WebsiteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeView, setActiveView] = useState<'public-website' | 'website-cms'>('public-website');

  const [doctors] = useState<Doctor[]>(mockDoctors);
  const [departments] = useState<Department[]>(mockDepartments);
  const [healthPackages] = useState<HealthPackage[]>(mockHealthPackages);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(mockBlogPosts);
  const [galleryItems] = useState<GalleryItem[]>(mockGalleryItems);
  const [testimonials] = useState<Testimonial[]>(mockTestimonials);
  const [contactInquiries, setContactInquiries] = useState<ContactInquiry[]>(mockContactInquiries);
  const [appointments, setAppointments] = useState<OnlineAppointment[]>(mockAppointments);

  const [toasts, setToasts] = useState<ToastNotification[]>([
    {
      id: 't-1',
      title: 'Welcome to Bhaskar Reddy Hospital',
      message: 'Explore doctors, health packages, and online appointment booking.',
      type: 'info',
    },
  ]);

  const addToast = (title: string, message: string, type: ToastNotification['type'] = 'info') => {
    const newToast: ToastNotification = { id: `toast-${Date.now()}`, title, message, type };
    setToasts((prev) => [newToast, ...prev]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addAppointment = (aptData: Omit<OnlineAppointment, 'id' | 'status'>) => {
    const created: OnlineAppointment = {
      ...aptData,
      id: `apt-${Date.now()}`,
      status: 'Confirmed',
    };
    setAppointments([created, ...appointments]);
    addToast('Appointment Reserved', `Appointment confirmed with ${aptData.doctorName}`, 'success');
  };

  const addContactInquiry = (inqData: Omit<ContactInquiry, 'id' | 'date' | 'status'>) => {
    const created: ContactInquiry = {
      ...inqData,
      id: `inq-${Date.now()}`,
      date: '2026-07-24 10:00',
      status: 'New Inquiry',
    };
    setContactInquiries([created, ...contactInquiries]);
    addToast('Inquiry Submitted', 'Our medical team will call back shortly.', 'success');
  };

  const addBlogPost = (postData: Omit<BlogPost, 'id'>) => {
    const created: BlogPost = {
      ...postData,
      id: `blog-${Date.now()}`,
    };
    setBlogPosts([created, ...blogPosts]);
    addToast('Blog Article Published', `Published article: "${postData.title}"`, 'success');
  };

  return (
    <WebsiteContext.Provider
      value={{
        activeView,
        setActiveView,
        doctors,
        departments,
        healthPackages,
        blogPosts,
        galleryItems,
        testimonials,
        contactInquiries,
        appointments,
        toasts,
        addAppointment,
        addContactInquiry,
        addBlogPost,
        addToast,
        removeToast,
      }}
    >
      {children}
    </WebsiteContext.Provider>
  );
};

export const useWebsite = () => {
  const context = useContext(WebsiteContext);
  if (!context) {
    throw new Error('useWebsite must be used within a WebsiteProvider');
  }
  return context;
};

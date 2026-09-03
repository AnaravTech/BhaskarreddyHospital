/**
 * Hospital Operations API Service
 * Centralizes data access, network simulations, and operations for all hospital modules.
 */

import {
  mockPatients,
  mockDoctors,
  mockDepartments,
  mockAppointments,
  mockBeds,
  mockIPDAdmissions,
  mockInvoices,
  mockInsuranceClaims,
  mockEmergencyCases,
  mockConsentForms,
  mockHousekeepingTasks,
  mockTenants,
} from '../data/mockData';

// Simulated latency helper
const simulateDelay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

export const api = {
  // Patients
  async getPatients() {
    await simulateDelay();
    return [...mockPatients];
  },

  async getPatientById(id) {
    await simulateDelay();
    return mockPatients.find((p) => p.id === id || p.uhid === id) || null;
  },

  // Doctors
  async getDoctors() {
    await simulateDelay();
    return [...mockDoctors];
  },

  // Appointments
  async getAppointments() {
    await simulateDelay();
    return [...mockAppointments];
  },

  // Beds & Wards
  async getBeds() {
    await simulateDelay();
    return [...mockBeds];
  },

  // IPD Admissions
  async getIPDAdmissions() {
    await simulateDelay();
    return [...mockIPDAdmissions];
  },

  // Invoices & Billing
  async getInvoices() {
    await simulateDelay();
    return [...mockInvoices];
  },

  // Insurance & TPA Claims
  async getInsuranceClaims() {
    await simulateDelay();
    return [...mockInsuranceClaims];
  },

  // Emergency Cases
  async getEmergencyCases() {
    await simulateDelay();
    return [...mockEmergencyCases];
  },

  // Departments
  async getDepartments() {
    await simulateDelay();
    return [...mockDepartments];
  },

  // Housekeeping
  async getHousekeepingTasks() {
    await simulateDelay();
    return [...mockHousekeepingTasks];
  },

  // Tenants & Branches
  async getTenants() {
    await simulateDelay();
    return [...mockTenants];
  },
};

export default api;

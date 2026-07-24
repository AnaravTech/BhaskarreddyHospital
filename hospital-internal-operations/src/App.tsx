import React from 'react';
import { HospitalProvider, useHospital } from './context/HospitalContext';
import { Login } from './components/auth/Login';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { CommandPalette } from './components/layout/CommandPalette';
import { AIAssistantDrawer } from './components/layout/AIAssistantDrawer';
import { NotificationCenter } from './components/layout/NotificationCenter';

// Hospital OS Module Components
import { CEODashboard } from './components/modules/CEODashboard';
import { ReceptionModule } from './components/modules/ReceptionModule';
import { PatientManagementModule } from './components/modules/PatientManagementModule';
import { AppointmentModule } from './components/modules/AppointmentModule';
import { OPDModule } from './components/modules/OPDModule';
import { IPDModule } from './components/modules/IPDModule';
import { DMODeskModule } from './components/modules/DMODeskModule';
import { NursingStationModule } from './components/modules/NursingStationModule';
import { BedManagementModule } from './components/modules/BedManagementModule';
import { PatientMovementModule } from './components/modules/PatientMovementModule';
import { PharmacyModule } from './components/modules/PharmacyModule';
import { DiagnosticsModule } from './components/modules/DiagnosticsModule';
import { OperationTheatreModule } from './components/modules/OperationTheatreModule';
import { DischargeSummaryModule } from './components/modules/DischargeSummaryModule';
import { DoctorsModule } from './components/modules/DoctorsModule';
import { DepartmentsModule } from './components/modules/DepartmentsModule';
import { BillingModule } from './components/modules/BillingModule';
import { InsuranceModule } from './components/modules/InsuranceModule';
import { EmergencyModule } from './components/modules/EmergencyModule';
import { ConsentFormsModule } from './components/modules/ConsentFormsModule';
import { HousekeepingModule } from './components/modules/HousekeepingModule';
import { MaintenanceModule } from './components/modules/MaintenanceModule';
import { ReportsModule } from './components/modules/ReportsModule';
import { SettingsModule } from './components/modules/SettingsModule';
import { X, CheckCircle2, Info, Siren } from 'lucide-react';

const MainContent: React.FC = () => {
  const { currentUser, activeModule, toasts, removeToast } = useHospital();

  // If user is not authenticated yet, present the Enterprise Login Screen
  if (!currentUser) {
    return <Login />;
  }

  const renderActiveModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <CEODashboard />;
      case 'reception':
        return <ReceptionModule />;
      case 'patients':
        return <PatientManagementModule />;
      case 'appointments':
        return <AppointmentModule />;
      case 'opd':
        return <OPDModule />;
      case 'ipd':
        return <IPDModule />;
      case 'dmo-desk':
        return <DMODeskModule />;
      case 'nursing-station':
        return <NursingStationModule />;
      case 'bed-management':
        return <BedManagementModule />;
      case 'patient-movement':
        return <PatientMovementModule />;
      case 'pharmacy':
        return <PharmacyModule />;
      case 'diagnostics':
        return <DiagnosticsModule />;
      case 'operation-theatre':
        return <OperationTheatreModule />;
      case 'discharge-summary':
        return <DischargeSummaryModule />;
      case 'doctors':
        return <DoctorsModule />;
      case 'departments':
        return <DepartmentsModule />;
      case 'billing':
        return <BillingModule />;
      case 'insurance':
        return <InsuranceModule />;
      case 'emergency':
        return <EmergencyModule />;
      case 'consent-forms':
        return <ConsentFormsModule />;
      case 'housekeeping':
        return <HousekeepingModule />;
      case 'maintenance':
        return <MaintenanceModule />;
      case 'reports':
        return <ReportsModule />;
      case 'settings':
        return <SettingsModule />;
      default:
        return <CEODashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Operating Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-gradient-to-b from-slate-950 via-slate-900/60 to-slate-950">
          {renderActiveModule()}
        </main>
      </div>

      {/* Global Modals & Overlay Panels */}
      <CommandPalette />
      <AIAssistantDrawer />
      <NotificationCenter />

      {/* Floating Toast Notification Stack */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none">
        {toasts.slice(0, 3).map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto p-3.5 rounded-2xl bg-slate-900/95 border border-slate-700/80 shadow-2xl backdrop-blur-md flex items-start gap-3 animate-in slide-in-from-bottom duration-200"
          >
            {toast.type === 'warning' ? (
              <Siren className="w-5 h-5 text-rose-400 shrink-0" />
            ) : toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <Info className="w-5 h-5 text-cyan-400 shrink-0" />
            )}

            <div className="flex-1 pr-2">
              <div className="text-xs font-bold text-slate-100">{toast.title}</div>
              <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">{toast.message}</div>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-500 hover:text-slate-300 transition"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <HospitalProvider>
      <MainContent />
    </HospitalProvider>
  );
}

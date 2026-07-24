import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import {
  Building,
  ShieldCheck,
  Check,
  X as XIcon,
  Briefcase,
  Plus,
  ToggleLeft,
  ToggleRight,
  UserCheck,
  Save,
  Sliders,
} from 'lucide-react';

interface RolePermission {
  roleName: string;
  roleCode: string;
  userCount: number;
  description: string;
  permissions: {
    patientReg: boolean;
    writePrescription: boolean;
    bedTransfer: boolean;
    processPayment: boolean;
    applyDiscount: boolean;
    tpaPreAuth: boolean;
    viewFinancials: boolean;
    modifyTariffs: boolean;
  };
}

export const SettingsModule: React.FC = () => {
  const { activeTenant, addToast, tariffConfig, setTariffConfig, currentUser } = useHospital();

  const [activeTab, setActiveTab] = useState<'rbac' | 'departments' | 'workflows' | 'tariffs' | 'saas'>('tariffs');

  // Role Permissions State Matrix
  const [roles, setRoles] = useState<RolePermission[]>([
    {
      roleName: 'System Super Administrator',
      roleCode: 'ROLE_SUPERADMIN',
      userCount: 2,
      description: 'Unrestricted system access, multi-tenant branch provisioning, and audit log controls.',
      permissions: {
        patientReg: true,
        writePrescription: true,
        bedTransfer: true,
        processPayment: true,
        applyDiscount: true,
        tpaPreAuth: true,
        viewFinancials: true,
        modifyTariffs: true,
      },
    },
    {
      roleName: 'CEO / Managing Director',
      roleCode: 'ROLE_CEO',
      userCount: 3,
      description: 'Executive telemetry command center, financial analytics, and hospital performance dashboards.',
      permissions: {
        patientReg: true,
        writePrescription: false,
        bedTransfer: true,
        processPayment: true,
        applyDiscount: true,
        tpaPreAuth: true,
        viewFinancials: true,
        modifyTariffs: true,
      },
    },
    {
      roleName: 'Doctor / Medical Consultant',
      roleCode: 'ROLE_DOCTOR',
      userCount: 24,
      description: 'OPD queue management, EHR digital prescription writing, vitals telemetry, and discharge summaries.',
      permissions: {
        patientReg: true,
        writePrescription: true,
        bedTransfer: true,
        processPayment: false,
        applyDiscount: false,
        tpaPreAuth: false,
        viewFinancials: false,
        modifyTariffs: false,
      },
    },
    {
      roleName: 'Front Desk & Reception Registrar',
      roleCode: 'ROLE_RECEPTION',
      userCount: 12,
      description: 'Walk-in patient registration, UHID issuance, token generation, and appointment booking.',
      permissions: {
        patientReg: true,
        writePrescription: false,
        bedTransfer: false,
        processPayment: true,
        applyDiscount: false,
        tpaPreAuth: false,
        viewFinancials: false,
        modifyTariffs: false,
      },
    },
    {
      roleName: 'Billing & Cashier Manager',
      roleCode: 'ROLE_CASHIER',
      userCount: 8,
      description: 'Multi-payment split processing (Cash/UPI/Cards), itemized invoice printing, and cashier ledger entries.',
      permissions: {
        patientReg: false,
        writePrescription: false,
        bedTransfer: false,
        processPayment: true,
        applyDiscount: true,
        tpaPreAuth: false,
        viewFinancials: true,
        modifyTariffs: false,
      },
    },
  ]);

  // Dynamic Departments State
  const [departmentsList, setDepartmentsList] = useState([
    { name: 'Obstetrics & Gynecology (Women Health)', code: 'OBGY', opdRoom: 'OPD-102', head: 'Dr. Madhu Latha Marreddy', beds: 40 },
    { name: 'Cardiology & Cardiac Surgery', code: 'CARD', opdRoom: 'OPD-101', head: 'Dr. Vikram Reddy', beds: 45 },
    { name: 'Orthopedics & Joint Replacement', code: 'ORTH', opdRoom: 'OPD-202', head: 'Dr. Rajeshwar Rao', beds: 50 },
    { name: 'Neurology & Neurosurgery', code: 'NEUR', opdRoom: 'OPD-104', head: 'Dr. Ananya Swaminathan', beds: 30 },
    { name: 'Emergency & Trauma Critical Care', code: 'EMER', opdRoom: 'EMR-BAY-01', head: 'Dr. Sameer Khan', beds: 25 },
  ]);

  // System Workflow Feature Toggles
  const [workflows, setWorkflows] = useState([
    { id: 'opd-work', name: 'OPD Consultation & e-Prescription Module', description: 'Enable vital telemetry and digital prescription builder', enabled: true },
    { id: 'ipd-work', name: 'IPD Admissions & Bed Grid Engine', description: 'Enable floor-wise bed allocation and ward transfer tracking', enabled: true },
    { id: 'pharmacy-work', name: 'Pharmacy & Stock Telemetry Module', description: 'Enable e-prescription queue dispensing and batch tracking', enabled: true },
    { id: 'lis-work', name: 'Laboratory & Radiology LIS Desk', description: 'Enable sample processing and automated PDF report verification', enabled: true },
    { id: 'ot-work', name: 'Operation Theatre & Surgical Suite Roster', description: 'Enable OT scheduling, pre-op checklists, and PACU recovery log', enabled: true },
    { id: 'tpa-work', name: 'TPA Insurance Cashless Pre-Auth Engine', description: 'Enable Dr. YSR Aarogyasri & private TPA claim processing', enabled: true },
    { id: 'emergency-work', name: '24/7 Emergency Triage & MLC Intimation Bay', description: 'Enable Red/Yellow/Green triage and police MLC registration', enabled: true },
  ]);

  // Tariff Form Local Inputs
  const [stdMin, setStdMin] = useState(tariffConfig.stdOpdMinFee);
  const [stdMax, setStdMax] = useState(tariffConfig.stdOpdMaxFee);
  const [premMin, setPremMin] = useState(tariffConfig.premiumSlotMinFee);
  const [premMax, setPremMax] = useState(tariffConfig.premiumSlotMaxFee);
  const [validDays, setValidDays] = useState(tariffConfig.opReturnValidityDays);
  const [icuTariff, setIcuTariff] = useState(tariffConfig.icuBedDailyTariff);

  // Modal States for Add Department
  const [isAddDeptModalOpen, setIsAddDeptModalOpen] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptCode, setNewDeptCode] = useState('');
  const [newDeptRoom, setNewDeptRoom] = useState('');
  const [newDeptHead, setNewDeptHead] = useState('');
  const [newDeptBeds, setNewDeptBeds] = useState('20');

  const togglePermission = (roleCode: string, key: keyof RolePermission['permissions']) => {
    setRoles((prev) =>
      prev.map((r) => {
        if (r.roleCode === roleCode) {
          return {
            ...r,
            permissions: {
              ...r.permissions,
              [key]: !r.permissions[key],
            },
          };
        }
        return r;
      })
    );
    addToast('RBAC Permission Updated', `Security policy updated for ${roleCode}`, 'info');
  };

  const toggleWorkflow = (id: string) => {
    setWorkflows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, enabled: !w.enabled } : w))
    );
    addToast('Workflow Configured', 'System feature module status updated live', 'success');
  };

  const handleSaveTariffs = (e: React.FormEvent) => {
    e.preventDefault();
    setTariffConfig({
      stdOpdMinFee: Number(stdMin),
      stdOpdMaxFee: Number(stdMax),
      premiumSlotMinFee: Number(premMin),
      premiumSlotMaxFee: Number(premMax),
      opReturnValidityDays: Number(validDays),
      icuBedDailyTariff: Number(icuTariff),
    });

    addToast(
      'Tariff Master Saved',
      `Updated Tariff Engine: Standard OPD (₹${stdMin}-₹${stdMax}), Premium (₹${premMin}-₹${premMax}), Validity (${validDays} Days)`,
      'success'
    );
  };

  const handleAddDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName || !newDeptCode) return;

    setDepartmentsList((prev) => [
      ...prev,
      {
        name: newDeptName,
        code: newDeptCode.toUpperCase(),
        opdRoom: newDeptRoom || 'OPD-110',
        head: newDeptHead || 'Dr. Specialist',
        beds: Number(newDeptBeds) || 20,
      },
    ]);

    addToast('Department Registered', `Created new clinical department: ${newDeptName} (${newDeptCode.toUpperCase()})`, 'success');
    setNewDeptName('');
    setNewDeptCode('');
    setNewDeptRoom('');
    setNewDeptHead('');
    setIsAddDeptModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12 text-slate-100 font-sans">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              System Governance & Admin Department
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-white mt-1">Administration & Hospital Control Center</h2>
          <p className="text-xs text-slate-400">
            Logged in as <span className="text-cyan-400 font-bold">{currentUser?.name} ({currentUser?.roleTitle})</span>. Modify tariffs, OP validity rules, and RBAC matrix.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center p-1 bg-slate-950 rounded-xl border border-slate-800 overflow-x-auto">
          <button
            onClick={() => setActiveTab('tariffs')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'tariffs' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Master Tariffs & Rules
          </button>
          <button
            onClick={() => setActiveTab('rbac')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'rbac' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            User Roles & RBAC
          </button>
          <button
            onClick={() => setActiveTab('departments')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'departments' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Departments Master
          </button>
          <button
            onClick={() => setActiveTab('workflows')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'workflows' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            System Workflows
          </button>
          <button
            onClick={() => setActiveTab('saas')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'saas' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Multi-Tenant Campuses
          </button>
        </div>
      </div>

      {/* Tab: Master Tariffs & Rule Engine (Interactive Editing) */}
      {activeTab === 'tariffs' && (
        <form onSubmit={handleSaveTariffs} className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-6 max-w-4xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <Sliders className="w-5 h-5 text-cyan-400" />
              <div>
                <h3 className="text-sm font-bold text-slate-100">Configurable Tariff Master Data & Rule Engine</h3>
                <p className="text-xs text-slate-400">Modify fee structures, consultation rules, and OP validity thresholds live</p>
              </div>
            </div>

            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30"
            >
              <Save className="w-4 h-4" /> Save Tariff & Rule Engine
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Standard OPD Consultation Fee */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="font-bold text-slate-200 flex justify-between items-center">
                <span>Standard OPD Consultation Fee</span>
                <span className="text-cyan-400 font-mono text-xs">Normal Walk-in Queue</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 text-[10px] mb-1">Min Fee (₹)</label>
                  <input
                    type="number"
                    value={stdMin}
                    onChange={(e) => setStdMin(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 font-mono text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[10px] mb-1">Max Fee (₹)</label>
                  <input
                    type="number"
                    value={stdMax}
                    onChange={(e) => setStdMax(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 font-mono text-slate-100"
                  />
                </div>
              </div>
            </div>

            {/* Premium Fixed Slot Fee */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="font-bold text-slate-200 flex justify-between items-center">
                <span>Premium Time Slot Consultation Fee</span>
                <span className="text-purple-400 font-mono text-xs">10-Min Reserved Slot</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 text-[10px] mb-1">Min Fee (₹)</label>
                  <input
                    type="number"
                    value={premMin}
                    onChange={(e) => setPremMin(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 font-mono text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[10px] mb-1">Max Fee (₹)</label>
                  <input
                    type="number"
                    value={premMax}
                    onChange={(e) => setPremMax(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 font-mono text-slate-100"
                  />
                </div>
              </div>
            </div>

            {/* 15-Day OP Return Validity Rule */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="font-bold text-slate-200 flex justify-between items-center">
                <span>OP Consultation Return Validity Rule</span>
                <span className="text-emerald-400 font-mono text-xs">Auto Waiver Threshold</span>
              </div>
              <div>
                <label className="block text-slate-400 text-[10px] mb-1">Validity Days (e.g. 7, 10, 15, 30 days)</label>
                <input
                  type="number"
                  value={validDays}
                  onChange={(e) => setValidDays(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 font-mono text-emerald-400 font-bold"
                />
              </div>
              <p className="text-[10px] text-slate-500">Patients returning within {validDays} days pay zero consultation fee.</p>
            </div>

            {/* ICU Daily Bed Rate */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="font-bold text-slate-200 flex justify-between items-center">
                <span>ICU Critical Care Suite Daily Tariff</span>
                <span className="text-rose-400 font-mono text-xs">Per Day Inpatient Charge</span>
              </div>
              <div>
                <label className="block text-slate-400 text-[10px] mb-1">Daily ICU Rate (₹)</label>
                <input
                  type="number"
                  value={icuTariff}
                  onChange={(e) => setIcuTariff(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 font-mono text-slate-100 font-bold"
                />
              </div>
              <p className="text-[10px] text-slate-500">Includes cardiac telemetry, oxygen line, and 1:1 nursing monitoring.</p>
            </div>
          </div>
        </form>
      )}

      {/* Tab: RBAC Permission Matrix */}
      {activeTab === 'rbac' && (
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              <div>
                <h3 className="text-sm font-bold text-slate-100">Role-Based Access Control (RBAC) Security Policy</h3>
                <p className="text-xs text-slate-400">Configure granular module permissions per user role</p>
              </div>
            </div>

            <button
              onClick={() => addToast('Role Created', 'New custom system role added to policy store.', 'success')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Create Custom Role</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[9px] tracking-wider">
                  <th className="py-3 px-4">Role Title & Code</th>
                  <th className="py-3 px-3 text-center">Patient Reg</th>
                  <th className="py-3 px-3 text-center">Write Rx</th>
                  <th className="py-3 px-3 text-center">Bed Transfer</th>
                  <th className="py-3 px-3 text-center">Process Pay</th>
                  <th className="py-3 px-3 text-center">Apply Discount</th>
                  <th className="py-3 px-3 text-center">TPA Pre-Auth</th>
                  <th className="py-3 px-3 text-center">Financials</th>
                  <th className="py-3 px-3 text-center">Tariffs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {roles.map((role) => (
                  <tr key={role.roleCode} className="hover:bg-slate-900/60 transition">
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-bold text-slate-100">{role.roleName}</div>
                      <div className="font-mono text-[10px] text-cyan-400">{role.roleCode} • {role.userCount} Users</div>
                      <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">{role.description}</div>
                    </td>

                    {(Object.keys(role.permissions) as (keyof RolePermission['permissions'])[]).map((permKey) => {
                      const hasPerm = role.permissions[permKey];
                      return (
                        <td key={permKey} className="py-3.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => togglePermission(role.roleCode, permKey)}
                            className={`p-1.5 rounded-lg border transition ${
                              hasPerm
                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/30'
                                : 'bg-slate-900 text-slate-600 border-slate-800 hover:text-slate-400'
                            }`}
                          >
                            {hasPerm ? <Check className="w-3.5 h-3.5" /> : <XIcon className="w-3.5 h-3.5" />}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Departments Master */}
      {activeTab === 'departments' && (
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-cyan-400" />
              <div>
                <h3 className="text-sm font-bold text-slate-100">Hospital Departments Master Register ({departmentsList.length})</h3>
                <p className="text-xs text-slate-400">Add or manage clinical divisions across the hospital</p>
              </div>
            </div>
            <button
              onClick={() => setIsAddDeptModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md"
            >
              <Plus className="w-4 h-4" /> Add New Department
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {departmentsList.map((dept) => (
              <div key={dept.code} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex justify-between items-start font-bold text-slate-100">
                  <span>{dept.name}</span>
                  <span className="text-cyan-400 font-mono font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    {dept.code}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>Head: {dept.head}</span>
                  <span>Room: {dept.opdRoom} • Beds: {dept.beds}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: System Workflows & Feature Toggles */}
      {activeTab === 'workflows' && (
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-4">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-purple-400" />
            <div>
              <h3 className="text-sm font-bold text-slate-100">System Feature Modules & Workflow Toggles</h3>
              <p className="text-xs text-slate-400">Enable or disable operational modules across the platform</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            {workflows.map((wf) => (
              <div key={wf.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-100">{wf.name}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{wf.description}</div>
                </div>

                <button
                  onClick={() => toggleWorkflow(wf.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-bold transition ${
                    wf.enabled
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-900 text-slate-500 border-slate-800'
                  }`}
                >
                  {wf.enabled ? <ToggleRight className="w-5 h-5 text-emerald-400" /> : <ToggleLeft className="w-5 h-5 text-slate-600" />}
                  <span>{wf.enabled ? 'Active' : 'Disabled'}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Multi-Tenant SaaS */}
      {activeTab === 'saas' && (
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-6 max-w-3xl">
          <div className="flex items-center gap-3">
            <Building className="w-6 h-6 text-cyan-400" />
            <div>
              <h3 className="text-sm font-bold text-slate-100">{activeTenant.name}</h3>
              <p className="text-xs text-slate-400">Tenant Code: {activeTenant.code} • Multi-Tenant SaaS Isolation</p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Registered Hospital Campuses</h4>
            <div className="space-y-2">
              {activeTenant.branches.map((b) => (
                <div
                  key={b.id}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-100">{b.name}</div>
                    <div className="text-[10px] text-slate-400">City: {b.city}</div>
                  </div>
                  {b.isMainBranch && (
                    <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold text-[10px]">
                      Headquarters
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Department Modal */}
      {isAddDeptModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleAddDepartment} className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm">Add New Hospital Department</h3>
              <button type="button" onClick={() => setIsAddDeptModalOpen(false)} className="text-slate-400 hover:text-white">
                <XIcon className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Department Name *</label>
              <input
                type="text"
                placeholder="e.g. Pulmonology & Respiratory Medicine"
                value={newDeptName}
                onChange={(e) => setNewDeptName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-bold"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Department Code *</label>
                <input
                  type="text"
                  placeholder="e.g. PULM"
                  value={newDeptCode}
                  onChange={(e) => setNewDeptCode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-cyan-400 font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">OPD Room No</label>
                <input
                  type="text"
                  placeholder="e.g. OPD-305"
                  value={newDeptRoom}
                  onChange={(e) => setNewDeptRoom(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Head Consultant Doctor</label>
              <input
                type="text"
                placeholder="e.g. Dr. Ramesh Kumar, MD"
                value={newDeptHead}
                onChange={(e) => setNewDeptHead(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Total Inpatient Beds</label>
              <input
                type="number"
                placeholder="20"
                value={newDeptBeds}
                onChange={(e) => setNewDeptBeds(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
              />
            </div>

            <button type="submit" className="w-full py-2.5 rounded-xl bg-cyan-600 text-white font-bold">
              Register Department
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

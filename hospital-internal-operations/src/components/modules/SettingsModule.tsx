import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import {
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
  Trash2,
  Edit3,
  UserPlus,
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
  const { addToast, tariffConfig, setTariffConfig, currentUser } = useHospital();

  const [activeTab, setActiveTab] = useState<'tariffs' | 'departments' | 'users' | 'rbac' | 'workflows'>('tariffs');

  // Dynamic Staff Users Roster State (Admin CRUD)
  const [staffList, setStaffList] = useState([
    { id: 'stf-1', name: 'Rajesh V', title: 'System Super Administrator', roleCode: 'admin', email: 'admin@anaravhealth.com', status: 'Active' },
    { id: 'stf-2', name: 'Dr. Bhaskar Reddy', title: 'Chairman / MD / CEO', roleCode: 'ceo', email: 'ceo@anaravhealth.com', status: 'Active' },
    { id: 'stf-3', name: 'Dr. Vikram Reddy', title: 'Consultant Cardiologist', roleCode: 'doctor', email: 'vikram.reddy@anaravhealth.com', status: 'Active' },
    { id: 'stf-4', name: 'Priyanka M', title: 'Front Office Executive', roleCode: 'receptionist', email: 'reception@anaravhealth.com', status: 'Active' },
    { id: 'stf-5', name: 'Anil Kumar', title: 'Billing Manager', roleCode: 'billing', email: 'billing@anaravhealth.com', status: 'Active' },
  ]);

  // Dynamic Departments State (Admin CRUD)
  const [departmentsList, setDepartmentsList] = useState([
    { id: 'dept-1', name: 'Obstetrics & Gynecology (Women Health)', code: 'OBGY', opdRoom: 'OPD-102', head: 'Dr. Madhu Latha Marreddy', beds: 40 },
    { id: 'dept-2', name: 'Cardiology & Cardiac Surgery', code: 'CARD', opdRoom: 'OPD-101', head: 'Dr. Vikram Reddy', beds: 45 },
    { id: 'dept-3', name: 'Orthopedics & Joint Replacement', code: 'ORTH', opdRoom: 'OPD-202', head: 'Dr. Rajeshwar Rao', beds: 50 },
    { id: 'dept-4', name: 'Neurology & Neurosurgery', code: 'NEUR', opdRoom: 'OPD-104', head: 'Dr. Ananya Swaminathan', beds: 30 },
    { id: 'dept-5', name: 'Emergency & Trauma Critical Care', code: 'EMER', opdRoom: 'EMR-BAY-01', head: 'Dr. Sameer Khan', beds: 25 },
  ]);

  // Role Permissions Matrix State
  const [roles, setRoles] = useState<RolePermission[]>([
    {
      roleName: 'System Super Administrator',
      roleCode: 'ROLE_SUPERADMIN',
      userCount: 2,
      description: 'Unrestricted system access, multi-tenant branch provisioning, and audit log controls.',
      permissions: { patientReg: true, writePrescription: true, bedTransfer: true, processPayment: true, applyDiscount: true, tpaPreAuth: true, viewFinancials: true, modifyTariffs: true },
    },
    {
      roleName: 'CEO / Managing Director',
      roleCode: 'ROLE_CEO',
      userCount: 3,
      description: 'Executive telemetry command center, financial analytics, and hospital performance dashboards.',
      permissions: { patientReg: true, writePrescription: false, bedTransfer: true, processPayment: true, applyDiscount: true, tpaPreAuth: true, viewFinancials: true, modifyTariffs: true },
    },
    {
      roleName: 'Doctor / Medical Consultant',
      roleCode: 'ROLE_DOCTOR',
      userCount: 24,
      description: 'OPD queue management, EHR digital prescription writing, vitals telemetry, and discharge summaries.',
      permissions: { patientReg: true, writePrescription: true, bedTransfer: true, processPayment: false, applyDiscount: false, tpaPreAuth: false, viewFinancials: false, modifyTariffs: false },
    },
  ]);

  // System Workflow Feature Toggles
  const [workflows, setWorkflows] = useState([
    { id: 'opd-work', name: 'OPD Consultation & e-Prescription Module', description: 'Enable vital telemetry and digital prescription builder', enabled: true },
    { id: 'ipd-work', name: 'IPD Admissions & Bed Grid Engine', description: 'Enable floor-wise bed allocation and ward transfer tracking', enabled: true },
    { id: 'pharmacy-work', name: 'Pharmacy & Stock Telemetry Module', description: 'Enable e-prescription queue dispensing and batch tracking', enabled: true },
    { id: 'lis-work', name: 'Laboratory & Radiology LIS Desk', description: 'Enable sample processing and automated PDF report verification', enabled: true },
  ]);

  // Tariff Form Local Inputs
  const [stdMin, setStdMin] = useState(tariffConfig.stdOpdMinFee);
  const [stdMax, setStdMax] = useState(tariffConfig.stdOpdMaxFee);
  const [premMin, setPremMin] = useState(tariffConfig.premiumSlotMinFee);
  const [premMax, setPremMax] = useState(tariffConfig.premiumSlotMaxFee);
  const [validDays, setValidDays] = useState(tariffConfig.opReturnValidityDays);
  const [icuTariff, setIcuTariff] = useState(tariffConfig.icuBedDailyTariff);

  // Modal States for Add/Edit Department
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [editingDeptId, setEditingDeptId] = useState<string | null>(null);
  const [deptName, setDeptName] = useState('');
  const [deptCode, setDeptCode] = useState('');
  const [deptRoom, setDeptRoom] = useState('');
  const [deptHead, setDeptHead] = useState('');
  const [deptBeds, setDeptBeds] = useState('20');

  // Modal States for Add/Edit Staff User
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [staffName, setStaffName] = useState('');
  const [staffTitle, setStaffTitle] = useState('');
  const [staffRoleCode, setStaffRoleCode] = useState('doctor');
  const [staffEmail, setStaffEmail] = useState('');

  // Department CRUD Handlers
  const openAddDeptModal = () => {
    setEditingDeptId(null);
    setDeptName('');
    setDeptCode('');
    setDeptRoom('');
    setDeptHead('');
    setDeptBeds('20');
    setIsDeptModalOpen(true);
  };

  const openEditDeptModal = (dept: (typeof departmentsList)[0]) => {
    setEditingDeptId(dept.id);
    setDeptName(dept.name);
    setDeptCode(dept.code);
    setDeptRoom(dept.opdRoom);
    setDeptHead(dept.head);
    setDeptBeds(dept.beds.toString());
    setIsDeptModalOpen(true);
  };

  const handleSaveDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptName || !deptCode) return;

    if (editingDeptId) {
      // Modify existing department
      setDepartmentsList((prev) =>
        prev.map((d) =>
          d.id === editingDeptId
            ? {
                ...d,
                name: deptName,
                code: deptCode.toUpperCase(),
                opdRoom: deptRoom || 'OPD-110',
                head: deptHead || 'Dr. Lead Consultant',
                beds: Number(deptBeds) || 20,
              }
            : d
        )
      );
      addToast('Department Updated', `Modified clinical department: ${deptName}`, 'success');
    } else {
      // Add new department
      const newDept = {
        id: `dept-${Date.now()}`,
        name: deptName,
        code: deptCode.toUpperCase(),
        opdRoom: deptRoom || 'OPD-110',
        head: deptHead || 'Dr. Lead Consultant',
        beds: Number(deptBeds) || 20,
      };
      setDepartmentsList((prev) => [...prev, newDept]);
      addToast('Department Created', `Registered new clinical department: ${deptName}`, 'success');
    }

    setIsDeptModalOpen(false);
  };

  const handleDeleteDepartment = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete department "${name}"?`)) {
      setDepartmentsList((prev) => prev.filter((d) => d.id !== id));
      addToast('Department Removed', `Deleted department ${name} from master register`, 'warning');
    }
  };

  // Staff User CRUD Handlers
  const openAddStaffModal = () => {
    setEditingStaffId(null);
    setStaffName('');
    setStaffTitle('');
    setStaffRoleCode('doctor');
    setStaffEmail('');
    setIsStaffModalOpen(true);
  };

  const openEditStaffModal = (stf: (typeof staffList)[0]) => {
    setEditingStaffId(stf.id);
    setStaffName(stf.name);
    setStaffTitle(stf.title);
    setStaffRoleCode(stf.roleCode);
    setStaffEmail(stf.email);
    setIsStaffModalOpen(true);
  };

  const handleSaveStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName || !staffEmail) return;

    if (editingStaffId) {
      setStaffList((prev) =>
        prev.map((s) =>
          s.id === editingStaffId
            ? { ...s, name: staffName, title: staffTitle, roleCode: staffRoleCode, email: staffEmail }
            : s
        )
      );
      addToast('Staff User Updated', `Modified user profile for ${staffName}`, 'success');
    } else {
      const newStf = {
        id: `stf-${Date.now()}`,
        name: staffName,
        title: staffTitle || 'Staff Specialist',
        roleCode: staffRoleCode,
        email: staffEmail,
        status: 'Active',
      };
      setStaffList((prev) => [...prev, newStf]);
      addToast('Staff User Provisioned', `Created new staff account for ${staffName}`, 'success');
    }

    setIsStaffModalOpen(false);
  };

  const handleDeleteStaff = (id: string, name: string) => {
    if (confirm(`Deactivate staff account for "${name}"?`)) {
      setStaffList((prev) => prev.filter((s) => s.id !== id));
      addToast('User Account Deactivated', `Removed ${name} from active staff roster`, 'warning');
    }
  };

  const togglePermission = (roleCode: string, key: keyof RolePermission['permissions']) => {
    setRoles((prev) =>
      prev.map((r) => {
        if (r.roleCode === roleCode) {
          return {
            ...r,
            permissions: { ...r.permissions, [key]: !r.permissions[key] },
          };
        }
        return r;
      })
    );
    addToast('RBAC Permission Saved', `Security policy updated for ${roleCode}`, 'info');
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
      'Master Tariffs & Rules Saved',
      `Updated: Standard OPD (₹${stdMin}-₹${stdMax}), Premium Slot (₹${premMin}-₹${premMax}), Validity (${validDays} Days), ICU Bed Rate (₹${icuTariff})`,
      'success'
    );
  };

  return (
    <div className="space-y-6 pb-12 text-slate-100 font-sans">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
              System Governance & Admin Console
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-white mt-1">Administration & Hospital Control Center</h2>
          <p className="text-xs text-slate-400">
            Logged in as <span className="text-amber-400 font-bold">{currentUser?.name} ({currentUser?.roleTitle})</span>. Full Add, Edit, Delete CRUD permissions over staff, departments, & tariffs.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center p-1 bg-slate-950 rounded-xl border border-slate-800 overflow-x-auto">
          <button
            onClick={() => setActiveTab('tariffs')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'tariffs' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Master Tariffs & Rules
          </button>
          <button
            onClick={() => setActiveTab('departments')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'departments' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Departments Master ({departmentsList.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'users' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Staff User Accounts ({staffList.length})
          </button>
          <button
            onClick={() => setActiveTab('rbac')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'rbac' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            User Roles & RBAC
          </button>
          <button
            onClick={() => setActiveTab('workflows')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'workflows' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            System Workflows
          </button>
        </div>
      </div>

      {/* Tab: Master Tariffs & Rule Engine (Interactive Editing) */}
      {activeTab === 'tariffs' && (
        <form onSubmit={handleSaveTariffs} className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-6 max-w-4xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <Sliders className="w-5 h-5 text-amber-400" />
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

      {/* Tab: Departments Master (Full Add, Modify, Delete CRUD) */}
      {activeTab === 'departments' && (
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="text-sm font-bold text-slate-100">Hospital Departments Master Register ({departmentsList.length})</h3>
                <p className="text-xs text-slate-400">Admin Control: Add, Modify, or Delete clinical specialty divisions</p>
              </div>
            </div>
            <button
              onClick={openAddDeptModal}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md"
            >
              <Plus className="w-4 h-4" /> + Add New Department
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {departmentsList.map((dept) => (
              <div key={dept.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 relative group">
                <div className="flex justify-between items-start font-bold text-slate-100 pr-16">
                  <span>{dept.name}</span>
                  <span className="text-amber-400 font-mono font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    {dept.code}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>Head: {dept.head}</span>
                  <span>Room: {dept.opdRoom} • Beds: {dept.beds}</span>
                </div>

                {/* Admin Action Buttons (Edit / Delete) */}
                <div className="absolute top-3 right-3 flex items-center gap-1">
                  <button
                    onClick={() => openEditDeptModal(dept)}
                    title="Modify Department"
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteDepartment(dept.id, dept.name)}
                    title="Delete Department"
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-slate-800"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Staff User Accounts (Full Add, Modify, Delete CRUD) */}
      {activeTab === 'users' && (
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="text-sm font-bold text-slate-100">Staff Accounts & User Provisioning ({staffList.length})</h3>
                <p className="text-xs text-slate-400">Admin Control: Register new staff accounts, modify designation, or delete access</p>
              </div>
            </div>
            <button
              onClick={openAddStaffModal}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md"
            >
              <UserPlus className="w-4 h-4" /> + Register Staff User
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[9px] tracking-wider">
                  <th className="py-3 px-4">Staff Name & Title</th>
                  <th className="py-3 px-3">Role Designation</th>
                  <th className="py-3 px-3">Official Email</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {staffList.map((stf) => (
                  <tr key={stf.id} className="hover:bg-slate-900/60 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{stf.name}</div>
                      <div className="text-[10px] text-slate-400">{stf.title}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                        {stf.roleCode}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-300">{stf.email}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {stf.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditStaffModal(stf)}
                          className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-[11px] font-semibold border border-slate-800"
                        >
                          Modify
                        </button>
                        <button
                          onClick={() => handleDeleteStaff(stf.id, stf.name)}
                          className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-[11px] font-semibold border border-rose-500/30"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: RBAC Permission Matrix */}
      {activeTab === 'rbac' && (
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="text-sm font-bold text-slate-100">Role-Based Access Control (RBAC) Security Policy</h3>
                <p className="text-xs text-slate-400">Configure granular module permissions per user role</p>
              </div>
            </div>
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
                      <div className="font-mono text-[10px] text-amber-400">{role.roleCode} • {role.userCount} Users</div>
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

      {/* Tab: System Workflows & Feature Toggles */}
      {activeTab === 'workflows' && (
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-4">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-amber-400" />
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

      {/* Department Add/Modify Modal */}
      {isDeptModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleSaveDepartment} className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm">
                {editingDeptId ? 'Modify Clinical Department' : 'Add New Hospital Department'}
              </h3>
              <button type="button" onClick={() => setIsDeptModalOpen(false)} className="text-slate-400 hover:text-white">
                <XIcon className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Department Name *</label>
              <input
                type="text"
                placeholder="e.g. Pulmonology & Respiratory Medicine"
                value={deptName}
                onChange={(e) => setDeptName(e.target.value)}
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
                  value={deptCode}
                  onChange={(e) => setDeptCode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-amber-400 font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">OPD Room No</label>
                <input
                  type="text"
                  placeholder="e.g. OPD-305"
                  value={deptRoom}
                  onChange={(e) => setDeptRoom(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Head Consultant Doctor</label>
              <input
                type="text"
                placeholder="e.g. Dr. Ramesh Kumar, MD"
                value={deptHead}
                onChange={(e) => setDeptHead(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Total Inpatient Beds</label>
              <input
                type="number"
                placeholder="20"
                value={deptBeds}
                onChange={(e) => setDeptBeds(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
              />
            </div>

            <button type="submit" className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold">
              {editingDeptId ? 'Save Changes' : 'Register Department'}
            </button>
          </form>
        </div>
      )}

      {/* Staff Add/Modify Modal */}
      {isStaffModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleSaveStaff} className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm">
                {editingStaffId ? 'Modify Staff Account' : 'Register Staff Account'}
              </h3>
              <button type="button" onClick={() => setIsStaffModalOpen(false)} className="text-slate-400 hover:text-white">
                <XIcon className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Full Staff Name *</label>
              <input
                type="text"
                placeholder="e.g. Dr. Ananya Swaminathan"
                value={staffName}
                onChange={(e) => setStaffName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Role Title / Designation</label>
              <input
                type="text"
                placeholder="e.g. Senior Neurologist"
                value={staffTitle}
                onChange={(e) => setStaffTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Role Code *</label>
                <select
                  value={staffRoleCode}
                  onChange={(e) => setStaffRoleCode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-amber-400 font-mono font-bold"
                >
                  <option value="admin">admin</option>
                  <option value="ceo">ceo</option>
                  <option value="doctor">doctor</option>
                  <option value="dmo">dmo</option>
                  <option value="receptionist">receptionist</option>
                  <option value="billing">billing</option>
                  <option value="insurance">insurance</option>
                  <option value="nurse">nurse</option>
                  <option value="emergency">emergency</option>
                  <option value="bed-manager">bed-manager</option>
                  <option value="housekeeping-sup">housekeeping-sup</option>
                  <option value="maintenance">maintenance</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Official Email *</label>
                <input
                  type="email"
                  placeholder="name@anaravhealth.com"
                  value={staffEmail}
                  onChange={(e) => setStaffEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono"
                  required
                />
              </div>
            </div>

            <button type="submit" className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold">
              {editingStaffId ? 'Save Account Changes' : 'Provision Staff Account'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

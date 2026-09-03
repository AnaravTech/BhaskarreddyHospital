import React, { useState } from 'react';
import { useHospital } from '../context/HospitalContext';
import { Building, MessageSquare, Database, ShieldCheck, Check, X as XIcon, Briefcase, Plus, } from 'lucide-react';
export const SettingsModule = () => {
    const { activeTenant, addToast } = useHospital();
    const [activeTab, setActiveTab] = useState('rbac');
    // Role Permissions State Matrix
    const [roles, setRoles] = useState([
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
        {
            roleName: 'TPA & Insurance Claims Officer',
            roleCode: 'ROLE_INSURANCE',
            userCount: 5,
            description: 'Pre-Authorization request submissions, claim document upload, and TPA settlement tracking.',
            permissions: {
                patientReg: false,
                writePrescription: false,
                bedTransfer: false,
                processPayment: true,
                applyDiscount: false,
                tpaPreAuth: true,
                viewFinancials: true,
                modifyTariffs: false,
            },
        },
    ]);
    const [smsTemplate, setSmsTemplate] = useState('Dear {PATIENT_NAME}, your token #{TOKEN_NUMBER} with Dr. {DOCTOR_NAME} at {HOSPITAL_NAME} is confirmed for {TIME}.');
    const [whatsappTemplate, setWhatsappTemplate] = useState('🏥 *{HOSPITAL_NAME} Alert*: Hello {PATIENT_NAME}, your appointment is scheduled today. Follow-up validity active until {OP_VALID_DATE}.');
    const togglePermission = (roleCode, key) => {
        setRoles((prev) => prev.map((r) => {
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
        }));
        addToast('RBAC Permission Updated', `Security policy updated for ${roleCode}`, 'info');
    };
    const handleSaveTemplates = (e) => {
        e.preventDefault();
        addToast('Templates Saved', 'SMS & WhatsApp notification templates updated successfully.', 'success');
    };
    return (<div className="space-y-6 pb-12">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              System Governance & Admin Console
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-white mt-1">Administration, User Roles & Master Data</h2>
          <p className="text-xs text-slate-400">
            Role-Based Access Control (RBAC), multi-tenant branch settings, and master tariff matrices.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center p-1 bg-slate-950 rounded-xl border border-slate-800 overflow-x-auto">
          <button onClick={() => setActiveTab('rbac')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${activeTab === 'rbac' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>
            User Roles & RBAC
          </button>
          <button onClick={() => setActiveTab('departments')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${activeTab === 'departments' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>
            Departments Master
          </button>
          <button onClick={() => setActiveTab('tariffs')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${activeTab === 'tariffs' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>
            Master Tariffs
          </button>
          <button onClick={() => setActiveTab('saas')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${activeTab === 'saas' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>
            Multi-Tenant SaaS
          </button>
          <button onClick={() => setActiveTab('templates')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${activeTab === 'templates' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>
            SMS / WhatsApp Alerts
          </button>
        </div>
      </div>

      {/* Tab 1: RBAC Permission Matrix */}
      {activeTab === 'rbac' && (<div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-cyan-400"/>
              <div>
                <h3 className="text-sm font-bold text-slate-100">Role-Based Access Control (RBAC) Security Policy</h3>
                <p className="text-xs text-slate-400">Configure granular module permissions per user role</p>
              </div>
            </div>

            <button onClick={() => addToast('Role Created', 'New custom system role added to policy store.', 'success')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md">
              <Plus className="w-4 h-4"/>
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
                {roles.map((role) => (<tr key={role.roleCode} className="hover:bg-slate-900/60 transition">
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-bold text-slate-100">{role.roleName}</div>
                      <div className="font-mono text-[10px] text-cyan-400">{role.roleCode} • {role.userCount} Users</div>
                      <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">{role.description}</div>
                    </td>

                    {Object.keys(role.permissions).map((permKey) => {
                    const hasPerm = role.permissions[permKey];
                    return (<td key={permKey} className="py-3.5 px-3 text-center">
                          <button type="button" onClick={() => togglePermission(role.roleCode, permKey)} className={`p-1.5 rounded-lg border transition ${hasPerm
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/30'
                            : 'bg-slate-900 text-slate-600 border-slate-800 hover:text-slate-400'}`}>
                            {hasPerm ? <Check className="w-3.5 h-3.5"/> : <XIcon className="w-3.5 h-3.5"/>}
                          </button>
                        </td>);
                })}
                  </tr>))}
              </tbody>
            </table>
          </div>
        </div>)}

      {/* Tab 2: Departments Master */}
      {activeTab === 'departments' && (<div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-cyan-400"/>
              <h3 className="text-sm font-bold text-slate-100">Hospital Departments Master Register</h3>
            </div>
            <button onClick={() => addToast('Department Added', 'New specialty division registered.', 'success')} className="px-3 py-1.5 rounded-xl bg-cyan-600 text-white text-xs font-bold">
              + Add Department
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex justify-between font-bold text-slate-100">
                <span>Cardiology & Cardiac Surgery (CARD)</span>
                <span className="text-cyan-400 font-mono">OPD Room: 101</span>
              </div>
              <div className="text-slate-400">Head: Dr. Vikram Reddy • Beds: 45</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex justify-between font-bold text-slate-100">
                <span>Neurology & Neurosurgery (NEUR)</span>
                <span className="text-cyan-400 font-mono">OPD Room: 104</span>
              </div>
              <div className="text-slate-400">Head: Dr. Ananya Swaminathan • Beds: 30</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex justify-between font-bold text-slate-100">
                <span>Orthopedics & Joint Replacement (ORTH)</span>
                <span className="text-cyan-400 font-mono">OPD Room: 202</span>
              </div>
              <div className="text-slate-400">Head: Dr. Rajeshwar Rao • Beds: 50</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex justify-between font-bold text-slate-100">
                <span>Emergency & Trauma Critical Care (EMER)</span>
                <span className="text-rose-400 font-mono">Bay 1-6</span>
              </div>
              <div className="text-slate-400">Head: Dr. Sameer Khan • Resuscitation Beds: 25</div>
            </div>
          </div>
        </div>)}

      {/* Tab 3: Tariffs & Rules */}
      {activeTab === 'tariffs' && (<div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-4 max-w-3xl">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-cyan-400"/>
            <h3 className="text-sm font-bold text-slate-100">Configurable Tariff Master Data & Rule Engine</h3>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
              <div>
                <div className="font-bold text-slate-200">Standard OPD Consultation Fee</div>
                <div className="text-[10px] text-slate-400">Normal Walk-in Queue Model</div>
              </div>
              <span className="font-bold text-cyan-400 font-mono text-sm">₹300 - ₹500</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
              <div>
                <div className="font-bold text-slate-200">Premium Time Slot Consultation Fee</div>
                <div className="text-[10px] text-slate-400">Fixed 10-Min Reservation Model</div>
              </div>
              <span className="font-bold text-purple-400 font-mono text-sm">₹400 - ₹850</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
              <div>
                <div className="font-bold text-slate-200">15-Day OP Consultation Return Validity</div>
                <div className="text-[10px] text-slate-400">Automatic Fee Waiver Threshold Engine</div>
              </div>
              <span className="font-bold text-emerald-400 font-mono text-sm">15 Days Active</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
              <div>
                <div className="font-bold text-slate-200">ICU Suite Daily Tariff</div>
                <div className="text-[10px] text-slate-400">Includes Cardiac & Neuro Monitoring Line</div>
              </div>
              <span className="font-bold text-slate-100 font-mono text-sm">₹7,500 / day</span>
            </div>
          </div>
        </div>)}

      {/* Tab 4: Multi-Tenant SaaS */}
      {activeTab === 'saas' && (<div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-6 max-w-3xl">
          <div className="flex items-center gap-3">
            <Building className="w-6 h-6 text-cyan-400"/>
            <div>
              <h3 className="text-sm font-bold text-slate-100">{activeTenant.name}</h3>
              <p className="text-xs text-slate-400">Tenant Code: {activeTenant.code} • Multi-Tenant SaaS Isolation</p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Registered Hospital Branches</h4>
            <div className="space-y-2">
              {activeTenant.branches.map((b) => (<div key={b.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-100">{b.name}</div>
                    <div className="text-[10px] text-slate-400">City: {b.city}</div>
                  </div>
                  {b.isMainBranch && (<span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold text-[10px]">
                      Headquarters
                    </span>)}
                </div>))}
            </div>
          </div>
        </div>)}

      {/* Tab 5: Templates */}
      {activeTab === 'templates' && (<form onSubmit={handleSaveTemplates} className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-4 max-w-3xl">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-cyan-400"/>
            <h3 className="text-sm font-bold text-slate-100">SMS & WhatsApp Notification Templates</h3>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              SMS Gateway Template
            </label>
            <textarea rows={3} value={smsTemplate} onChange={(e) => setSmsTemplate(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"/>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              WhatsApp API Gateway Template
            </label>
            <textarea rows={3} value={whatsappTemplate} onChange={(e) => setWhatsappTemplate(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"/>
          </div>

          <button type="submit" className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition shadow-md">
            Save Gateway Templates
          </button>
        </form>)}
    </div>);
};

export const Administration = SettingsModule;
export default SettingsModule;

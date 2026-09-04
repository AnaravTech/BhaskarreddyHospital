import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import {
  CheckCircle2, Clock, AlertTriangle, X, ChevronDown, ChevronUp,
  ShieldAlert, BedDouble, DollarSign, Siren
} from 'lucide-react';
import type { ApprovalType } from '../../types';

interface ApprovalItem {
  id: string;
  type: ApprovalType;
  patientName: string;
  patientUhid: string;
  requestedBy: string;
  requestedByRole: string;
  amount?: number;
  reason: string;
  requestedAt: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Escalated';
  priority: 'Normal' | 'Urgent' | 'Critical';
  details?: string;
}

const MOCK_APPROVALS: ApprovalItem[] = [
  { id: 'appr-001', type: 'Admission', patientName: 'Ravi Shankar M', patientUhid: 'BRH-2026-4421', requestedBy: 'Priyanka M (Reception)', requestedByRole: 'receptionist', reason: 'Cardiac chest pain, requires monitoring', requestedAt: '2026-07-24 08:30', status: 'Pending', priority: 'Critical', details: 'Ward preference: CCU / Cardiac ICU. Referring Doctor: Dr. Vikram Reddy' },
  { id: 'appr-002', type: 'Discount', patientName: 'Lakshmi Devi K', patientUhid: 'BRH-2026-3312', requestedBy: 'Anil Kumar (Billing)', requestedByRole: 'billing', amount: 15000, reason: 'Patient is BPL card holder, poor financial condition', requestedAt: '2026-07-24 09:15', status: 'Pending', priority: 'Normal', details: '20% discount requested on total bill of ₹75,000' },
  { id: 'appr-003', type: 'Refund', patientName: 'Suresh Babu T', patientUhid: 'BRH-2026-2891', requestedBy: 'Anil Kumar (Billing)', requestedByRole: 'billing', amount: 8500, reason: 'Surgery postponed — advance deposit refund', requestedAt: '2026-07-24 09:45', status: 'Pending', priority: 'Normal', details: 'Advance of ₹25,000 collected, refund ₹8,500 after deducting consultation' },
  { id: 'appr-004', type: 'Insurance Pre-Auth', patientName: 'Mohammed Aziz', patientUhid: 'BRH-2026-5501', requestedBy: 'Srinivas Rao (TPA)', requestedByRole: 'insurance', amount: 85000, reason: 'CABG surgery pre-authorization — Star Health', requestedAt: '2026-07-24 10:00', status: 'Pending', priority: 'Urgent', details: 'Policy No: SH-2024-88742, Sum Insured: ₹5,00,000, Requested: ₹85,000' },
  { id: 'appr-005', type: 'Bed Transfer', patientName: 'Annapurna V', patientUhid: 'BRH-2026-1234', requestedBy: 'Suresh V (Bed Manager)', requestedByRole: 'bed-manager', reason: 'Patient condition improved, shift from ICU to Private Ward', requestedAt: '2026-07-24 10:30', status: 'Pending', priority: 'Normal', details: 'From: ICU-101 → To: PVT-302. Clinical clearance: Dr. Anish Kumar' },
  { id: 'appr-006', type: 'Discharge', patientName: 'Venkata Ramaiah P', patientUhid: 'BRH-2026-7721', requestedBy: 'Dr. Vikram Reddy', requestedByRole: 'doctor', reason: 'Medically fit — post PTCA, 5 days LOS', requestedAt: '2026-07-24 11:00', status: 'Pending', priority: 'Normal', details: 'Billing status: Partially cleared. Insurance claim: Star Health pending' },
  { id: 'appr-007', type: 'Discount', patientName: 'Chandra Kala B', patientUhid: 'BRH-2026-6612', requestedBy: 'Anil Kumar (Billing)', requestedByRole: 'billing', amount: 5000, reason: 'Employee family member — 10% standard discount', requestedAt: '2026-07-24 11:30', status: 'Approved', priority: 'Normal', details: '10% discount on ₹50,000 bill. Approved by Admin.' },
  { id: 'appr-008', type: 'Admission', patientName: 'Narasimha Rao D', patientUhid: 'BRH-2026-9981', requestedBy: 'Priyanka M (Reception)', requestedByRole: 'receptionist', reason: 'Elective hip replacement surgery', requestedAt: '2026-07-24 07:00', status: 'Approved', priority: 'Normal', details: 'Ward: Ortho Private. Surgeon: Dr. Rajeshwar Rao. Pre-op assessment done.' },
  { id: 'appr-009', type: 'Refund', patientName: 'Sita Ramaiah G', patientUhid: 'BRH-2026-3344', requestedBy: 'Anil Kumar (Billing)', requestedByRole: 'billing', amount: 2000, reason: 'Duplicate payment received via UPI', requestedAt: '2026-07-23 16:00', status: 'Rejected', priority: 'Normal', details: 'Rejection reason: Transaction ID not matching hospital records. Needs reverification.' },
];

const TYPE_CONFIG: Record<ApprovalType, { label: string; color: string; icon: React.ElementType }> = {
  'Admission': { label: 'Admission', color: 'cyan', icon: BedDouble },
  'Discount': { label: 'Discount', color: 'amber', icon: DollarSign },
  'Refund': { label: 'Refund', color: 'violet', icon: DollarSign },
  'Insurance Pre-Auth': { label: 'Pre-Auth', color: 'blue', icon: ShieldAlert },
  'Bed Transfer': { label: 'Bed Transfer', color: 'indigo', icon: BedDouble },
  'Discharge': { label: 'Discharge', color: 'emerald', icon: CheckCircle2 },
  'OT Schedule': { label: 'OT Schedule', color: 'rose', icon: Siren },
};

const PRIORITY_BADGE: Record<string, string> = {
  'Critical': 'bg-rose-500/20 text-rose-300 border border-rose-500/40',
  'Urgent': 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
  'Normal': 'bg-slate-800 text-slate-300 border border-slate-700',
};

const STATUS_BADGE: Record<string, string> = {
  'Pending': 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
  'Approved': 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
  'Rejected': 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
  'Escalated': 'bg-violet-500/20 text-violet-300 border border-violet-500/30',
};

export const WorkflowModule: React.FC = () => {
  const { currentUser, addToast } = useHospital();
  const [approvals, setApprovals] = useState<ApprovalItem[]>(MOCK_APPROVALS);
  const [activeTab, setActiveTab] = useState<ApprovalType | 'All' | 'History'>('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const role = currentUser?.role || 'admin';

  const allowedTypes: ApprovalType[] = role === 'admin' || role === 'ceo'
    ? ['Admission', 'Discount', 'Refund', 'Insurance Pre-Auth', 'Bed Transfer', 'Discharge', 'OT Schedule']
    : role === 'billing'
    ? ['Discount', 'Refund']
    : role === 'bed-manager'
    ? ['Admission', 'Bed Transfer']
    : role === 'insurance'
    ? ['Insurance Pre-Auth']
    : role === 'doctor'
    ? ['Discharge', 'OT Schedule']
    : [];

  const tabs: (ApprovalType | 'All' | 'History')[] = ['All', ...allowedTypes, 'History'];

  const displayApprovals = approvals.filter(a => {
    const typeMatch = activeTab === 'All' ? allowedTypes.includes(a.type) : activeTab === 'History' ? a.status !== 'Pending' : a.type === activeTab;
    const pendingFilter = activeTab === 'History' ? true : a.status === 'Pending';
    return typeMatch && (activeTab === 'History' ? true : pendingFilter);
  });

  const pendingCount = approvals.filter(a => a.status === 'Pending' && allowedTypes.includes(a.type)).length;

  const handleApprove = (id: string) => {
    setApprovals(prev => prev.map(a => a.id === id ? { ...a, status: 'Approved', approvedBy: currentUser?.name } as ApprovalItem : a));
    addToast('Request Approved', 'Approval processed and recorded in audit trail.', 'success');
  };

  const handleReject = (id: string) => {
    if (!rejectReason) { addToast('Rejection Reason Required', 'Please provide a reason before rejecting.', 'warning'); return; }
    setApprovals(prev => prev.map(a => a.id === id ? { ...a, status: 'Rejected' } as ApprovalItem : a));
    addToast('Request Rejected', `Rejection recorded: "${rejectReason}"`, 'warning');
    setRejectingId(null);
    setRejectReason('');
  };

  const handleEscalate = (id: string) => {
    setApprovals(prev => prev.map(a => a.id === id ? { ...a, status: 'Escalated' } as ApprovalItem : a));
    addToast('Escalated to Senior Management', 'Request escalated and flagged for CEO attention.', 'info');
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-950/60 via-slate-900 to-slate-900 p-6 rounded-2xl border border-slate-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-500/10 text-violet-400 border border-violet-500/30">Enterprise Workflow Engine</span>
              {pendingCount > 0 && <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse">{pendingCount} Pending</span>}
            </div>
            <h2 className="text-2xl font-extrabold text-white">Workflow Approval Center</h2>
            <p className="text-xs text-slate-400 mt-0.5">Multi-level approval engine for Admissions, Discounts, Refunds, Insurance & Discharges.</p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl"><span className="text-slate-400">Your Queue: </span><span className="font-bold text-amber-400">{pendingCount} pending</span></div>
            <div className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl"><span className="text-slate-400">Approved Today: </span><span className="font-bold text-emerald-400">{approvals.filter(a => a.status === 'Approved').length}</span></div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              activeTab === tab ? 'bg-violet-600 text-white' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            {tab === 'All' ? `All Pending (${pendingCount})` : tab === 'History' ? '📋 History' : tab}
          </button>
        ))}
      </div>

      {/* Approval Cards */}
      {displayApprovals.length === 0 ? (
        <div className="text-center py-16 text-slate-500 bg-slate-900/40 rounded-2xl border border-slate-800/60">
          <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-emerald-500/50" />
          <div className="text-lg font-bold text-slate-300">All Clear!</div>
          <div className="text-xs mt-1">No pending approvals in your queue.</div>
        </div>
      ) : (
        <div className="space-y-3">
          {displayApprovals.map(item => {
            const config = TYPE_CONFIG[item.type];
            const Icon = config.icon;
            const isExpanded = expandedId === item.id;
            const isRejecting = rejectingId === item.id;

            return (
              <div key={item.id} className={`bg-slate-900/90 border border-slate-800/80 rounded-2xl overflow-hidden transition-all ${item.priority === 'Critical' ? 'border-l-4 border-l-rose-500' : item.priority === 'Urgent' ? 'border-l-4 border-l-amber-500' : ''}`}>
                {/* Card Header */}
                <div className="p-4 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`w-9 h-9 rounded-xl bg-${config.color}-500/10 border border-${config.color}-500/30 flex items-center justify-center shrink-0`}>
                      <Icon className={`w-4 h-4 text-${config.color}-400`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-100">{item.type}</span>
                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${PRIORITY_BADGE[item.priority]}`}>{item.priority}</span>
                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${STATUS_BADGE[item.status]}`}>{item.status}</span>
                      </div>
                      <div className="text-sm font-bold text-white mt-0.5">{item.patientName} <span className="text-xs font-mono text-slate-400">({item.patientUhid})</span></div>
                      <div className="text-xs text-slate-400 mt-0.5">{item.reason}</div>
                      {item.amount && <div className="text-xs font-bold text-amber-400 mt-0.5">Amount: ₹{item.amount.toLocaleString()}</div>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-1 text-[10px] text-slate-500">
                      <Clock className="w-3 h-3" />
                      <span>{item.requestedAt}</span>
                    </div>
                    <button onClick={() => setExpandedId(isExpanded ? null : item.id)} className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400">
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-slate-800/60 pt-3 space-y-3">
                    <div className="bg-slate-950/60 rounded-xl p-3 text-xs space-y-1.5">
                      <div className="text-slate-400">Request Details:</div>
                      <div className="text-slate-200">{item.details}</div>
                      <div className="text-slate-400 mt-2">Requested by: <span className="text-slate-200 font-semibold">{item.requestedBy}</span></div>
                    </div>

                    {item.status === 'Pending' && (
                      <>
                        {isRejecting ? (
                          <div className="space-y-2">
                            <textarea
                              value={rejectReason}
                              onChange={e => setRejectReason(e.target.value)}
                              placeholder="Enter rejection reason (required)..."
                              className="w-full bg-slate-950 border border-rose-500/40 rounded-xl px-3 py-2 text-xs text-slate-200 resize-none h-20"
                            />
                            <div className="flex gap-2">
                              <button onClick={() => handleReject(item.id)} className="px-4 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold">Confirm Reject</button>
                              <button onClick={() => setRejectingId(null)} className="px-4 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs">Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 flex-wrap">
                            <button onClick={() => handleApprove(item.id)} className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                            </button>
                            <button onClick={() => setRejectingId(item.id)} className="px-4 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-1.5 border border-rose-500/30">
                              <X className="w-3.5 h-3.5" /> Reject
                            </button>
                            {(role === 'admin' || role === 'ceo') && (
                              <button onClick={() => handleEscalate(item.id)} className="px-4 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold border border-amber-500/30 flex items-center gap-1.5">
                                <AlertTriangle className="w-3.5 h-3.5" /> Escalate
                              </button>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* History Section */}
      {activeTab === 'History' && (
        <div className="bg-slate-900/60 rounded-2xl border border-slate-800/80 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-800/60">
            <h3 className="text-sm font-bold text-slate-200">Approval Audit Trail</h3>
            <p className="text-xs text-slate-400">All approvals, rejections, and escalations with timestamps.</p>
          </div>
          <div className="divide-y divide-slate-800/40">
            {approvals.filter(a => a.status !== 'Pending').map(a => (
              <div key={a.id} className="px-4 py-3 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded-full font-bold ${STATUS_BADGE[a.status]}`}>{a.status}</span>
                  <div>
                    <div className="font-semibold text-slate-200">{a.type} — {a.patientName}</div>
                    <div className="text-slate-400">{a.requestedBy} • {a.requestedAt}</div>
                  </div>
                </div>
                {a.amount && <div className="font-mono text-amber-400 font-bold">₹{a.amount.toLocaleString()}</div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

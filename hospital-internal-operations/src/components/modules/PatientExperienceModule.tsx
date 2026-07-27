import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import {
  Star, Send,
  X, ChevronDown, ChevronUp
} from 'lucide-react';

interface FeedbackItem {
  id: string;
  patientName: string;
  uhid: string;
  visitType: 'OP' | 'IP' | 'Emergency';
  doctorName: string;
  departmentName: string;
  overallRating: number;
  doctorRating: number;
  nursingRating: number;
  facilityRating: number;
  foodRating: number;
  comments: string;
  submittedAt: string;
  status: 'New' | 'Acknowledged' | 'Resolved';
}

interface ComplaintItem {
  id: string;
  complaintNo: string;
  patientName: string;
  phone: string;
  subject: string;
  description: string;
  category: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  submittedAt: string;
  assignedTo?: string;
  resolution?: string;
}

interface FollowUpLog {
  id: string;
  patientName: string;
  uhid: string;
  type: string;
  channel: 'SMS' | 'WhatsApp' | 'Email';
  sentAt: string;
  status: 'Sent' | 'Delivered' | 'Failed';
}

const MOCK_FEEDBACKS: FeedbackItem[] = [
  { id: 'f1', patientName: 'Ravi Shankar M', uhid: 'BRH-2026-4421', visitType: 'IP', doctorName: 'Dr. Vikram Reddy', departmentName: 'Cardiology', overallRating: 5, doctorRating: 5, nursingRating: 4, facilityRating: 5, foodRating: 4, comments: 'Excellent care by Dr. Vikram and the entire cardiology team. Very professional. Room was clean and comfortable. Highly recommend.', submittedAt: '2026-07-23', status: 'Acknowledged' },
  { id: 'f2', patientName: 'Annapurna V', uhid: 'BRH-2026-1234', visitType: 'IP', doctorName: 'Dr. Madhu Latha Marreddy', departmentName: 'Obstetrics', overallRating: 5, doctorRating: 5, nursingRating: 5, facilityRating: 4, foodRating: 3, comments: 'Dr. Madhu Latha was amazing. Normal delivery was smooth. The food could be improved — a bit bland.', submittedAt: '2026-07-22', status: 'Acknowledged' },
  { id: 'f3', patientName: 'Suresh Babu T', uhid: 'BRH-2026-2891', visitType: 'OP', doctorName: 'Dr. Rajeshwar Rao', departmentName: 'Orthopedics', overallRating: 4, doctorRating: 5, nursingRating: 4, facilityRating: 4, foodRating: 0, comments: 'Very good consultation. Waiting time was a bit long — about 35 minutes. Doctor spent quality time explaining the X-ray.', submittedAt: '2026-07-24', status: 'New' },
  { id: 'f4', patientName: 'Lakshmi Devi K', uhid: 'BRH-2026-3312', visitType: 'Emergency', doctorName: 'Dr. Sameer Khan', departmentName: 'Emergency', overallRating: 5, doctorRating: 5, nursingRating: 5, facilityRating: 5, foodRating: 0, comments: 'Life-saving care. Emergency team responded within seconds. Cannot thank Dr. Sameer and the nurses enough.', submittedAt: '2026-07-21', status: 'Resolved' },
  { id: 'f5', patientName: 'Narasimha Rao D', uhid: 'BRH-2026-9981', visitType: 'IP', doctorName: 'Dr. Rajeshwar Rao', departmentName: 'Orthopedics', overallRating: 3, doctorRating: 4, nursingRating: 3, facilityRating: 3, foodRating: 2, comments: 'Surgery went well but billing process was confusing and took too long. Insurance desk needs better coordination.', submittedAt: '2026-07-20', status: 'New' },
];

const MOCK_COMPLAINTS: ComplaintItem[] = [
  { id: 'c1', complaintNo: 'COMP-2026-001', patientName: 'Mohammed Aziz', phone: '9876543210', subject: 'Long waiting time at billing counter', description: 'Had to wait 2 hours at billing counter even though my insurance was pre-approved. The staff were not coordinating properly.', category: 'Administrative', severity: 'Medium', status: 'In Progress', submittedAt: '2026-07-23 14:00', assignedTo: 'Anil Kumar (Billing Lead)' },
  { id: 'c2', complaintNo: 'COMP-2026-002', patientName: 'Sita Ramaiah G', phone: '9765432109', subject: 'Cleanliness issue in ward bathroom', description: 'The bathroom in Room 204 was not cleaned properly. There was water stagnation issue for more than half a day.', category: 'Facility', severity: 'High', status: 'Resolved', submittedAt: '2026-07-22 11:30', assignedTo: 'Raju Lead (Housekeeping)', resolution: 'Deep cleaned and plumber fixed drainage. Supervisor inspected and certified.' },
  { id: 'c3', complaintNo: 'COMP-2026-003', patientName: 'Chandra Kala B', phone: '9654321098', subject: 'Rude behavior by night duty nurse', description: 'The night duty nurse on 3rd floor was impolite when I called for assistance at 2 AM. I understand it is night but better communication is expected.', category: 'Staff Behavior', severity: 'High', status: 'Open', submittedAt: '2026-07-24 08:00' },
  { id: 'c4', complaintNo: 'COMP-2026-004', patientName: 'Venkata Ramaiah P', phone: '9543210987', subject: 'Incorrect billing for pharmacy items', description: 'I was charged for medicines that were already included in my package. Billing team initially refused to correct it.', category: 'Billing', severity: 'Critical', status: 'In Progress', submittedAt: '2026-07-23 16:00', assignedTo: 'Anil Kumar (Billing Lead)' },
];

const MOCK_FOLLOWUPS: FollowUpLog[] = [
  { id: 'fu1', patientName: 'Ravi Shankar M', uhid: 'BRH-2026-4421', type: '15-Day OP Follow-up Reminder', channel: 'WhatsApp', sentAt: '2026-07-24 09:00', status: 'Delivered' },
  { id: 'fu2', patientName: 'Annapurna V', uhid: 'BRH-2026-1234', type: 'Post-Discharge Follow-up', channel: 'SMS', sentAt: '2026-07-24 09:30', status: 'Delivered' },
  { id: 'fu3', patientName: 'Suresh Babu T', uhid: 'BRH-2026-2891', type: 'Lab Result Notification', channel: 'SMS', sentAt: '2026-07-23 15:00', status: 'Delivered' },
  { id: 'fu4', patientName: 'Mohammed Aziz', uhid: 'BRH-2026-5501', type: 'Appointment Reminder', channel: 'WhatsApp', sentAt: '2026-07-23 10:00', status: 'Sent' },
  { id: 'fu5', patientName: 'Chandra Kala B', uhid: 'BRH-2026-6612', type: '15-Day OP Follow-up Reminder', channel: 'Email', sentAt: '2026-07-22 09:00', status: 'Failed' },
];

const DEPT_SCORES = [
  { dept: 'Cardiology', score: 4.8, responses: 124, trend: '+0.2' },
  { dept: 'Obstetrics & Gynecology', score: 4.9, responses: 98, trend: '+0.1' },
  { dept: 'Orthopedics', score: 4.6, responses: 87, trend: '−0.1' },
  { dept: 'Emergency', score: 4.7, responses: 156, trend: '+0.3' },
  { dept: 'General Medicine', score: 4.3, responses: 201, trend: '0.0' },
  { dept: 'Pediatrics', score: 4.8, responses: 74, trend: '+0.2' },
];

const CATEGORY_SCORES = [
  { label: 'Doctor Care', score: 4.6, color: 'emerald' },
  { label: 'Nursing Care', score: 4.4, color: 'cyan' },
  { label: 'Cleanliness', score: 4.1, color: 'blue' },
  { label: 'Food Quality', score: 3.8, color: 'amber' },
  { label: 'Billing Transparency', score: 4.2, color: 'violet' },
  { label: 'Wait Time', score: 3.5, color: 'rose' },
  { label: 'Overall Facility', score: 4.3, color: 'indigo' },
];

const SEVERITY_BADGE: Record<string, string> = {
  'Low': 'bg-slate-800 text-slate-300 border border-slate-700',
  'Medium': 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
  'High': 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
  'Critical': 'bg-rose-700/30 text-rose-200 border border-rose-600/50 animate-pulse',
};
const STATUS_BADGE_C: Record<string, string> = {
  'Open': 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
  'In Progress': 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
  'Resolved': 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
  'Closed': 'bg-slate-800 text-slate-400 border border-slate-700',
};

const renderStars = (rating: number) =>
  Array.from({ length: 5 }, (_, i) => (
    <Star key={i} className={`w-3.5 h-3.5 ${i < rating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} />
  ));

export const PatientExperienceModule: React.FC = () => {
  const { addToast } = useHospital();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'feedback' | 'complaints' | 'followup'>('dashboard');
  const [expandedComplaint, setExpandedComplaint] = useState<string | null>(null);
  const [showNewComplaint, setShowNewComplaint] = useState(false);
  const [compForm, setCompForm] = useState({ name: '', phone: '', subject: '', description: '', category: 'Administrative', severity: 'Medium' });
  const [newFeedbackRatings, setNewFeedbackRatings] = useState({ overall: 0, doctor: 0, nursing: 0, facility: 0, food: 0 });
  const [feedbackComment, setFeedbackComment] = useState('');

  const TABS = [
    { id: 'dashboard' as const, label: '📊 Satisfaction Dashboard' },
    { id: 'feedback' as const, label: '📝 Feedback Collection' },
    { id: 'complaints' as const, label: '🚨 Complaints' },
    { id: 'followup' as const, label: '📢 Follow-up Log' },
  ];

  const overallAvg = (MOCK_FEEDBACKS.reduce((sum, f) => sum + f.overallRating, 0) / MOCK_FEEDBACKS.length).toFixed(1);

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-900 p-6 rounded-2xl border border-slate-800/80">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">Patient Experience & CX</span>
        </div>
        <h2 className="text-2xl font-extrabold text-white">Patient Satisfaction & Feedback Center</h2>
        <p className="text-xs text-slate-400 mt-0.5">Feedback collection, complaint management, follow-up logs, and satisfaction analytics.</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${activeTab === tab.id ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── DASHBOARD TAB ─── */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Overall Score */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-emerald-900/40 to-slate-900 border border-emerald-500/30 rounded-2xl p-6 text-center">
              <div className="text-5xl font-extrabold text-emerald-400">{overallAvg}</div>
              <div className="flex items-center justify-center gap-1 mt-2">
                {renderStars(Math.round(Number(overallAvg)))}
              </div>
              <div className="text-xs text-slate-400 mt-2">Overall Patient Satisfaction</div>
              <div className="text-[10px] text-emerald-400 mt-1">Based on {MOCK_FEEDBACKS.length} responses</div>
            </div>

            <div className="col-span-2 bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5">
              <h3 className="text-xs font-bold text-slate-300 mb-4">Category-wise Ratings</h3>
              <div className="space-y-2.5">
                {CATEGORY_SCORES.map(cat => (
                  <div key={cat.label} className="flex items-center gap-3 text-xs">
                    <span className="text-slate-400 w-32 shrink-0">{cat.label}</span>
                    <div className="flex-1 bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full bg-${cat.color}-500 rounded-full transition-all`}
                        style={{ width: `${(cat.score / 5) * 100}%` }}
                      />
                    </div>
                    <span className={`font-bold text-${cat.color}-400 w-8 text-right`}>{cat.score}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Feedbacks */}
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-800/60 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-200">Recent Patient Feedback</h3>
              <span className="text-xs text-slate-400">{MOCK_FEEDBACKS.length} responses</span>
            </div>
            <div className="divide-y divide-slate-800/40">
              {MOCK_FEEDBACKS.map(f => (
                <div key={f.id} className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="text-xs font-bold text-slate-100">{f.patientName}</div>
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">{f.visitType}</span>
                        {f.status === 'New' && <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 animate-pulse">New</span>}
                      </div>
                      <div className="text-[10px] text-slate-400">{f.doctorName} • {f.departmentName} • {f.submittedAt}</div>
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0">
                      {renderStars(f.overallRating)}
                      <span className="ml-1 text-xs font-bold text-amber-400">{f.overallRating}/5</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 italic">"{f.comments}"</p>
                </div>
              ))}
            </div>
          </div>

          {/* Department Scores Table */}
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-800/60">
              <h3 className="text-sm font-bold text-slate-200">Department-wise Satisfaction Scores</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-800/60">
                    <th className="text-left px-4 py-2.5 text-slate-400 font-semibold">Department</th>
                    <th className="text-center px-4 py-2.5 text-slate-400 font-semibold">Score</th>
                    <th className="text-center px-4 py-2.5 text-slate-400 font-semibold">Responses</th>
                    <th className="text-center px-4 py-2.5 text-slate-400 font-semibold">Trend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {DEPT_SCORES.map(d => (
                    <tr key={d.dept} className="hover:bg-slate-800/30 transition">
                      <td className="px-4 py-2.5 font-semibold text-slate-200">{d.dept}</td>
                      <td className="px-4 py-2.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          <span className="font-bold text-amber-400">{d.score}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-center text-slate-400">{d.responses}</td>
                      <td className={`px-4 py-2.5 text-center font-bold ${d.trend.startsWith('+') ? 'text-emerald-400' : d.trend.startsWith('−') ? 'text-rose-400' : 'text-slate-400'}`}>{d.trend}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── FEEDBACK COLLECTION TAB ─── */}
      {activeTab === 'feedback' && (
        <div className="max-w-2xl space-y-4">
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 space-y-5">
            <h3 className="text-sm font-bold text-slate-200">Record Patient Feedback</h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Patient UHID</label>
                <input type="text" placeholder="BRH-2026-XXXX" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono" />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Visit Type</label>
                <select className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200">
                  <option>OP</option><option>IP</option><option>Emergency</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-xs font-semibold text-slate-300">Star Ratings (click to rate)</div>
              {[
                { key: 'overall' as const, label: 'Overall Experience' },
                { key: 'doctor' as const, label: 'Doctor Care' },
                { key: 'nursing' as const, label: 'Nursing Care' },
                { key: 'facility' as const, label: 'Facility & Cleanliness' },
                { key: 'food' as const, label: 'Food Quality (IP only)' },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center gap-4">
                  <span className="text-xs text-slate-400 w-44">{label}</span>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }, (_, i) => (
                      <button key={i} onClick={() => setNewFeedbackRatings(prev => ({ ...prev, [key]: i + 1 }))}>
                        <Star className={`w-5 h-5 transition ${i < newFeedbackRatings[key] ? 'text-amber-400 fill-amber-400' : 'text-slate-600 hover:text-amber-300'}`} />
                      </button>
                    ))}
                    <span className="ml-2 text-xs text-amber-400 font-bold w-4">{newFeedbackRatings[key] > 0 ? newFeedbackRatings[key] : ''}</span>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Patient Comments</label>
              <textarea
                value={feedbackComment}
                onChange={e => setFeedbackComment(e.target.value)}
                placeholder="Patient's feedback in their own words..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 resize-none h-24"
              />
            </div>

            <button onClick={() => { addToast('Feedback Recorded', 'Patient satisfaction score saved to analytics dashboard.', 'success'); setFeedbackComment(''); setNewFeedbackRatings({ overall: 0, doctor: 0, nursing: 0, facility: 0, food: 0 }); }} className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold">
              Submit Feedback & Update Dashboard
            </button>
          </div>
        </div>
      )}

      {/* ─── COMPLAINTS TAB ─── */}
      {activeTab === 'complaints' && (
        <div className="space-y-4">
          {/* Stats strip */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Open', value: MOCK_COMPLAINTS.filter(c => c.status === 'Open').length, color: 'text-rose-400' },
              { label: 'In Progress', value: MOCK_COMPLAINTS.filter(c => c.status === 'In Progress').length, color: 'text-amber-400' },
              { label: 'Resolved', value: MOCK_COMPLAINTS.filter(c => c.status === 'Resolved').length, color: 'text-emerald-400' },
              { label: 'Critical', value: MOCK_COMPLAINTS.filter(c => c.severity === 'Critical').length, color: 'text-rose-300' },
            ].map(s => (
              <div key={s.label} className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-3 text-center">
                <div className={`text-2xl font-extrabold ${s.color}`}>{s.value}</div>
                <div className="text-[10px] text-slate-400">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <button onClick={() => setShowNewComplaint(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold">
              + Log New Complaint
            </button>
          </div>

          <div className="space-y-3">
            {MOCK_COMPLAINTS.map(c => {
              const isExpanded = expandedComplaint === c.id;
              return (
                <div key={c.id} className={`bg-slate-900/90 border border-slate-800/80 rounded-2xl overflow-hidden ${c.severity === 'Critical' ? 'border-l-4 border-l-rose-600' : ''}`}>
                  <div className="p-4 flex items-start justify-between gap-3 cursor-pointer" onClick={() => setExpandedComplaint(isExpanded ? null : c.id)}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono text-slate-400">{c.complaintNo}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${SEVERITY_BADGE[c.severity]}`}>{c.severity}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_BADGE_C[c.status]}`}>{c.status}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">{c.category}</span>
                      </div>
                      <div className="text-sm font-bold text-slate-100 mt-1">{c.subject}</div>
                      <div className="text-xs text-slate-400">{c.patientName} • {c.phone} • {c.submittedAt}</div>
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                  </div>
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-slate-800/60 pt-3 space-y-3 text-xs">
                      <div className="bg-slate-950/60 rounded-xl p-3">
                        <div className="text-slate-400 mb-1">Description:</div>
                        <div className="text-slate-200">{c.description}</div>
                      </div>
                      {c.assignedTo && <div className="text-slate-400">Assigned to: <span className="text-slate-200 font-semibold">{c.assignedTo}</span></div>}
                      {c.resolution && <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-xl p-3"><div className="text-emerald-400 font-bold mb-1">Resolution:</div><div className="text-emerald-200">{c.resolution}</div></div>}
                      {c.status === 'Open' && (
                        <div className="flex gap-2">
                          <button onClick={() => addToast('Status Updated', `${c.complaintNo} marked In Progress`, 'info')} className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">Mark In Progress</button>
                          <button onClick={() => addToast('Complaint Resolved', `${c.complaintNo} resolved successfully`, 'success')} className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">Mark Resolved</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── FOLLOW-UP LOG TAB ─── */}
      {activeTab === 'followup' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => addToast('Follow-up Reminder Sent', 'WhatsApp message dispatched to patient.', 'success')} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold">
              <Send className="w-4 h-4" /> Send Follow-up Reminder
            </button>
          </div>
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-800/60">
              <h3 className="text-sm font-bold text-slate-200">Communication History Log</h3>
            </div>
            <div className="divide-y divide-slate-800/40">
              {MOCK_FOLLOWUPS.map(f => (
                <div key={f.id} className="px-4 py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${f.channel === 'WhatsApp' ? 'bg-emerald-500/20' : f.channel === 'SMS' ? 'bg-cyan-500/20' : 'bg-violet-500/20'}`}>
                      <Send className={`w-3.5 h-3.5 ${f.channel === 'WhatsApp' ? 'text-emerald-400' : f.channel === 'SMS' ? 'text-cyan-400' : 'text-violet-400'}`} />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-200">{f.patientName} <span className="font-mono text-slate-400">({f.uhid})</span></div>
                      <div className="text-slate-400">{f.type} • via {f.channel}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${f.status === 'Delivered' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : f.status === 'Sent' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'}`}>{f.status}</div>
                    <div className="text-slate-500 text-[10px] mt-0.5">{f.sentAt}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* New Complaint Modal */}
      {showNewComplaint && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex justify-between items-center"><h3 className="text-sm font-bold text-white">Log New Complaint</h3><button onClick={() => setShowNewComplaint(false)} className="text-slate-400"><X className="w-4 h-4" /></button></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-slate-400 mb-1">Patient Name *</label><input value={compForm.name} onChange={e => setCompForm(p => ({ ...p, name: e.target.value }))} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200" /></div>
              <div><label className="block text-slate-400 mb-1">Phone *</label><input value={compForm.phone} onChange={e => setCompForm(p => ({ ...p, phone: e.target.value }))} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200" /></div>
            </div>
            <div><label className="block text-slate-400 mb-1">Subject *</label><input value={compForm.subject} onChange={e => setCompForm(p => ({ ...p, subject: e.target.value }))} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-slate-400 mb-1">Category</label><select value={compForm.category} onChange={e => setCompForm(p => ({ ...p, category: e.target.value }))} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"><option>Clinical</option><option>Administrative</option><option>Billing</option><option>Facility</option><option>Staff Behavior</option></select></div>
              <div><label className="block text-slate-400 mb-1">Severity</label><select value={compForm.severity} onChange={e => setCompForm(p => ({ ...p, severity: e.target.value }))} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"><option>Low</option><option>Medium</option><option>High</option><option>Critical</option></select></div>
            </div>
            <div><label className="block text-slate-400 mb-1">Description *</label><textarea value={compForm.description} onChange={e => setCompForm(p => ({ ...p, description: e.target.value }))} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 resize-none h-20" /></div>
            <button onClick={() => { addToast('Complaint Logged', `COMP-2026-00${MOCK_COMPLAINTS.length + 1} registered & assigned.`, 'warning'); setShowNewComplaint(false); }} className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold">Log Complaint & Assign</button>
          </div>
        </div>
      )}
    </div>
  );
};

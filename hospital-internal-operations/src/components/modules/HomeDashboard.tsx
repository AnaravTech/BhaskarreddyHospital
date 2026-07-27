import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import {
  Activity, ArrowRight, Bed, Calendar, CheckCircle, ClipboardList, Clock,
  CreditCard, FileText, HeartPulse, Hospital, Settings, ShieldAlert,
  Stethoscope, Syringe, TrendingUp, Users, Wrench, AlertTriangle, AlertCircle,
  IndianRupee, PieChart, BarChart3, Pill,
  UserPlus, FileCheck, Layers, FileClock
} from 'lucide-react';

// --- Reusable Subcomponents ---

const KPICard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend: string;
  trendUp: boolean;
  colorClass: string;
}> = ({ title, value, icon: Icon, trend, trendUp, colorClass }) => (
  <div className="bg-slate-900/90 border border-slate-800/80 p-4 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition-colors">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl bg-opacity-20 ${colorClass.replace('text-', 'bg-')} ${colorClass}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className={`flex items-center text-xs font-bold ${trendUp ? 'text-emerald-400' : 'text-rose-400'}`}>
        {trendUp ? '↑' : '↓'} {trend}
      </div>
    </div>
    <div>
      <h3 className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">{title}</h3>
      <p className="text-3xl font-bold text-slate-100">{value}</p>
    </div>
  </div>
);

const QuickAction: React.FC<{
  label: string;
  icon: React.ElementType;
  colorClass: string;
  onClick: () => void;
}> = ({ label, icon: Icon, colorClass, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800 transition-all min-w-max group ${colorClass}`}
  >
    <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
    <span className="font-bold text-sm text-slate-200">{label}</span>
  </button>
);

const TaskItem: React.FC<{
  title: string;
  desc: string;
  priority: 'Critical' | 'High' | 'Normal';
  time: string;
}> = ({ title, desc, priority, time }) => {
  const [done, setDone] = useState(false);
  const priorityColor = priority === 'Critical' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                        priority === 'High' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                        'bg-slate-700/50 text-slate-300 border-slate-700';

  if (done) return null;

  return (
    <div className="flex items-start justify-between p-3 border-b border-slate-800/50 last:border-0 hover:bg-slate-800/20 rounded-lg transition-colors">
      <div className="flex gap-3 items-start">
        <button onClick={() => setDone(true)} className="mt-1 text-slate-500 hover:text-emerald-400 transition-colors">
          <CheckCircle className="w-5 h-5" />
        </button>
        <div>
          <h4 className="text-sm font-semibold text-slate-200">{title}</h4>
          <p className="text-xs text-slate-400">{desc}</p>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${priorityColor}`}>
          {priority}
        </span>
        <span className="text-[10px] text-slate-500">{time}</span>
      </div>
    </div>
  );
};

const ActivityItem: React.FC<{
  action: string;
  user: string;
  time: string;
  dotColor: string;
}> = ({ action, user, time, dotColor }) => (
  <div className="flex gap-3 relative pb-4 last:pb-0">
    <div className="absolute left-1.5 top-2 bottom-0 w-px bg-slate-800 last:bg-transparent"></div>
    <div className={`w-3 h-3 rounded-full mt-1.5 relative z-10 ${dotColor}`}></div>
    <div>
      <p className="text-sm text-slate-300">
        <span className="font-semibold text-slate-100">{user}</span> {action}
      </p>
      <span className="text-xs text-slate-500">{time}</span>
    </div>
  </div>
);

const DEFAULT_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const SvgBarChart: React.FC<{ data: number[]; color: string; labels?: string[] }> = ({
  data,
  color,
  labels = DEFAULT_DAYS,
}) => {
  const max = Math.max(...data, 1);

  return (
    <div className="w-full mt-4 bg-slate-950/40 p-4 rounded-xl border border-slate-800/60">
      <div className="h-36 w-full flex items-end justify-between gap-2">
        {data.map((val, i) => {
          const heightPercent = max > 0 ? (val / max) * 100 : 0;
          return (
            <div key={i} className="flex-1 h-full flex flex-col items-center justify-end group">
              <span className="text-[10px] font-bold text-slate-300 mb-1 opacity-90 group-hover:opacity-100 transition-opacity">
                {val > 1000 ? `${(val / 1000).toFixed(0)}k` : val}
              </span>
              <div className="w-full flex-1 flex items-end justify-center min-h-[40px]">
                <div
                  className={`w-full max-w-[32px] rounded-t-md ${color} opacity-85 group-hover:opacity-100 transition-all duration-300 shadow-md`}
                  style={{ height: `${Math.max(heightPercent, 6)}%` }}
                  title={`${labels[i] || `Day ${i + 1}`}: ${val}`}
                ></div>
              </div>
              <span className="text-[10px] text-slate-400 mt-2 font-medium truncate max-w-full">
                {labels[i] || `D${i + 1}`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const HomeDashboard: React.FC = () => {
  const { currentUser, setActiveModule, beds, housekeepingTasks, activeTheme, setActiveTheme } = useHospital();

  const currentDate = "2026-07-24";

  if (!currentUser) return <div className="p-8 text-white">Please login.</div>;

  const renderDashboardContent = () => {
    switch (currentUser.role) {
      case 'admin':
        return (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <KPICard title="Total Staff" value={48} icon={Users} trend="2%" trendUp={true} colorClass="text-cyan-400" />
              <KPICard title="Active Depts" value={12} icon={Layers} trend="0%" trendUp={true} colorClass="text-violet-400" />
              <KPICard title="Audit Events" value={34} icon={Activity} trend="15%" trendUp={true} colorClass="text-emerald-400" />
              <KPICard title="Pending Approvals" value={5} icon={FileCheck} trend="12%" trendUp={false} colorClass="text-amber-400" />
            </div>

            <div className="overflow-x-auto pb-4 mb-6 scrollbar-hide">
              <div className="flex gap-4">
                <QuickAction label="Admin Console" icon={Settings} colorClass="text-cyan-400" onClick={() => setActiveModule('settings')} />
                <QuickAction label="Patient Directory" icon={Users} colorClass="text-emerald-400" onClick={() => setActiveModule('patients')} />
                <QuickAction label="View Reports" icon={BarChart3} colorClass="text-violet-400" onClick={() => setActiveModule('reports')} />
                <QuickAction label="Approvals" icon={FileCheck} colorClass="text-amber-400" onClick={() => setActiveModule('workflow')} />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5">
                <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2"><Activity className="w-5 h-5 text-cyan-400" /> System Events Overview (Last 7 Days)</h3>
                <SvgBarChart data={[45, 52, 38, 65, 48, 71, 34]} color="bg-cyan-500" />
              </div>
              <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5">
                <h3 className="text-lg font-bold text-slate-100 mb-4">Pending Tasks</h3>
                <div className="space-y-1">
                  <TaskItem title="Approve Leave - Dr. Reddy" desc="Requested 2 days next week" priority="Normal" time="2h ago" />
                  <TaskItem title="System Backup Check" desc="Verify weekly DB backup" priority="High" time="5h ago" />
                  <TaskItem title="New User Registration" desc="Nurse Priya requires access" priority="Normal" time="1d ago" />
                  <TaskItem title="Review Security Audit" desc="Q2 compliance report" priority="Critical" time="1d ago" />
                </div>
              </div>
            </div>
          </>
        );

      case 'ceo':
        return (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <KPICard title="Today's Revenue" value="₹4,28,500" icon={IndianRupee} trend="8%" trendUp={true} colorClass="text-emerald-400" />
              <KPICard title="Bed Occupancy" value="78%" icon={Bed} trend="3%" trendUp={true} colorClass="text-cyan-400" />
              <KPICard title="OP Patients" value={142} icon={Users} trend="5%" trendUp={false} colorClass="text-violet-400" />
              <KPICard title="Pending Discharges" value={8} icon={ArrowRight} trend="10%" trendUp={true} colorClass="text-amber-400" />
            </div>

            <div className="overflow-x-auto pb-4 mb-6 scrollbar-hide">
              <div className="flex gap-4">
                <QuickAction label="Command Center" icon={PieChart} colorClass="text-cyan-400" onClick={() => setActiveModule('dashboard')} />
                <QuickAction label="Exec Reports" icon={BarChart3} colorClass="text-violet-400" onClick={() => setActiveModule('reports')} />
                <QuickAction label="Bed Occupancy" icon={Bed} colorClass="text-emerald-400" onClick={() => setActiveModule('dashboard')} />
                <QuickAction label="Department View" icon={BarChart3} colorClass="text-amber-400" onClick={() => setActiveModule('departments')} />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5">
                <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-emerald-400" /> 7-Day Revenue Trend</h3>
                <SvgBarChart data={[280, 310, 250, 420, 380, 450, 428]} color="bg-emerald-500" />
              </div>
              <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5">
                <h3 className="text-lg font-bold text-slate-100 mb-4">Strategic Alerts</h3>
                <div className="space-y-4 mt-4">
                  <ActivityItem action="approved monthly budget" user="Finance Dept" time="1h ago" dotColor="bg-emerald-400" />
                  <ActivityItem action="reported high ICU occupancy (95%)" user="DMO" time="3h ago" dotColor="bg-rose-400" />
                  <ActivityItem action="completed JCI compliance review" user="Admin" time="Yesterday" dotColor="bg-cyan-400" />
                  <ActivityItem action="onboarded 2 new specialists" user="HR" time="Yesterday" dotColor="bg-violet-400" />
                </div>
              </div>
            </div>
          </>
        );
      
      case 'doctor':
        return (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <KPICard title="Today's OPD" value={24} icon={Users} trend="12%" trendUp={true} colorClass="text-cyan-400" />
              <KPICard title="Pending Consults" value={7} icon={Stethoscope} trend="2" trendUp={false} colorClass="text-amber-400" />
              <KPICard title="Pending Sign-offs" value={3} icon={FileCheck} trend="1" trendUp={true} colorClass="text-violet-400" />
              <KPICard title="Follow-up Due" value={5} icon={Calendar} trend="15%" trendUp={true} colorClass="text-emerald-400" />
            </div>

            <div className="overflow-x-auto pb-4 mb-6 scrollbar-hide">
              <div className="flex gap-4">
                <QuickAction label="Start OPD" icon={Stethoscope} colorClass="text-cyan-400" onClick={() => setActiveModule('opd')} />
                <QuickAction label="Ward Rounds" icon={Bed} colorClass="text-emerald-400" onClick={() => setActiveModule('ipd')} />
                <QuickAction label="Discharge Summary" icon={ClipboardList} colorClass="text-amber-400" onClick={() => setActiveModule('discharge-summary')} />
                <QuickAction label="OT Schedule" icon={Activity} colorClass="text-rose-400" onClick={() => setActiveModule('operation-theatre')} />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5">
                <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2"><Users className="w-5 h-5 text-cyan-400" /> Patients Per Day (This Week)</h3>
                <SvgBarChart data={[18, 22, 25, 20, 28, 24, 0]} color="bg-cyan-500" />
              </div>
              <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5">
                <h3 className="text-lg font-bold text-slate-100 mb-4">My Schedule Today</h3>
                <div className="space-y-1 mt-2">
                  <TaskItem title="Morning OPD" desc="Room 102" priority="High" time="09:00 AM" />
                  <TaskItem title="Ward Rounds" desc="General & Private Wards" priority="Normal" time="01:00 PM" />
                  <TaskItem title="Review Reports" desc="5 Pending lab results" priority="Critical" time="02:30 PM" />
                  <TaskItem title="Evening OPD" desc="Room 102" priority="Normal" time="05:00 PM" />
                </div>
              </div>
            </div>
          </>
        );

      case 'dmo':
        return (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <KPICard title="Active Ward Cases" value={18} icon={Bed} trend="5%" trendUp={true} colorClass="text-cyan-400" />
              <KPICard title="Emerg Escalations" value={2} icon={AlertTriangle} trend="1" trendUp={false} colorClass="text-rose-400" />
              <KPICard title="Pending Handovers" value={4} icon={FileClock} trend="0" trendUp={true} colorClass="text-amber-400" />
              <KPICard title="Critical Patients" value={3} icon={HeartPulse} trend="1" trendUp={false} colorClass="text-rose-500" />
            </div>

            <div className="overflow-x-auto pb-4 mb-6 scrollbar-hide">
              <div className="flex gap-4">
                <QuickAction label="DMO Desk" icon={ClipboardList} colorClass="text-cyan-400" onClick={() => setActiveModule('dmo-desk')} />
                <QuickAction label="Ward Rounds" icon={Bed} colorClass="text-emerald-400" onClick={() => setActiveModule('ipd')} />
                <QuickAction label="Emergency" icon={ShieldAlert} colorClass="text-rose-400" onClick={() => setActiveModule('emergency')} />
                <QuickAction label="Patient Lookup" icon={Users} colorClass="text-violet-400" onClick={() => setActiveModule('patients')} />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5">
                <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2"><Activity className="w-5 h-5 text-amber-400" /> Cases Managed Per Shift</h3>
                <SvgBarChart data={[12, 15, 8, 18, 14, 10, 5]} color="bg-amber-500" />
              </div>
              <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5">
                <h3 className="text-lg font-bold text-slate-100 mb-4">Pending Tasks & Alerts</h3>
                <div className="space-y-1 mt-2">
                  <TaskItem title="Shift Handover" desc="Sign off morning shift notes" priority="High" time="30m ago" />
                  <TaskItem title="Vitals Review" desc="Bed 204 showing hypotension" priority="Critical" time="1h ago" />
                  <TaskItem title="Verify Discharge" desc="Patient in Ward A" priority="Normal" time="2h ago" />
                  <TaskItem title="Update Care Plan" desc="Consult with Dr. Reddy" priority="Normal" time="4h ago" />
                </div>
              </div>
            </div>
          </>
        );
      
      case 'receptionist':
        return (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <KPICard title="Walk-ins Today" value={67} icon={UserPlus} trend="12%" trendUp={true} colorClass="text-cyan-400" />
              <KPICard title="Tokens Issued" value={67} icon={FileText} trend="12%" trendUp={true} colorClass="text-violet-400" />
              <KPICard title="Validity Checks" value={12} icon={FileCheck} trend="5%" trendUp={false} colorClass="text-emerald-400" />
              <KPICard title="Pending Appts" value={23} icon={Calendar} trend="8%" trendUp={true} colorClass="text-amber-400" />
            </div>

            <div className="overflow-x-auto pb-4 mb-6 scrollbar-hide">
              <div className="flex gap-4">
                <QuickAction label="Register Patient" icon={UserPlus} colorClass="text-cyan-400" onClick={() => setActiveModule('reception')} />
                <QuickAction label="Book Appt" icon={Calendar} colorClass="text-emerald-400" onClick={() => setActiveModule('appointments')} />
                <QuickAction label="Patient Transfer" icon={ArrowRight} colorClass="text-violet-400" onClick={() => setActiveModule('patient-movement')} />
                <QuickAction label="Search Patient" icon={Users} colorClass="text-amber-400" onClick={() => setActiveModule('patients')} />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5">
                <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2"><Users className="w-5 h-5 text-cyan-400" /> Hourly Walk-in Distribution</h3>
                <SvgBarChart data={[2, 15, 25, 12, 8, 4, 1]} color="bg-cyan-500" />
              </div>
              <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5">
                <h3 className="text-lg font-bold text-slate-100 mb-4">Recent Activity</h3>
                <div className="space-y-4 mt-4">
                  <ActivityItem action="registered new patient" user="You" time="5m ago" dotColor="bg-cyan-400" />
                  <ActivityItem action="booked consultation" user="You" time="12m ago" dotColor="bg-emerald-400" />
                  <ActivityItem action="handled OP return validity" user="You" time="30m ago" dotColor="bg-violet-400" />
                  <ActivityItem action="updated patient details" user="You" time="1h ago" dotColor="bg-slate-400" />
                </div>
              </div>
            </div>
          </>
        );

      case 'billing':
        return (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <KPICard title="Today's Colln" value="₹1,82,300" icon={IndianRupee} trend="15%" trendUp={true} colorClass="text-emerald-400" />
              <KPICard title="Pending Invoices" value={14} icon={FileText} trend="2" trendUp={false} colorClass="text-amber-400" />
              <KPICard title="Refund Queue" value={3} icon={CreditCard} trend="1" trendUp={true} colorClass="text-rose-400" />
              <KPICard title="Due > 7 Days" value="₹48,000" icon={AlertCircle} trend="5%" trendUp={false} colorClass="text-rose-500" />
            </div>

            <div className="overflow-x-auto pb-4 mb-6 scrollbar-hide">
              <div className="flex gap-4">
                <QuickAction label="Billing Desk" icon={CreditCard} colorClass="text-emerald-400" onClick={() => setActiveModule('billing')} />
                <QuickAction label="Revenue Report" icon={BarChart3} colorClass="text-violet-400" onClick={() => setActiveModule('reports')} />
                <QuickAction label="Discount Apprvl" icon={FileCheck} colorClass="text-amber-400" onClick={() => setActiveModule('workflow')} />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5">
                <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2"><CreditCard className="w-5 h-5 text-emerald-400" /> Collections by Mode</h3>
                <SvgBarChart data={[120000, 45000, 15000, 2300]} color="bg-emerald-500" />
                <div className="flex justify-between text-xs text-slate-400 mt-2 px-2">
                  <span>Cash</span><span>UPI</span><span>Card</span><span>Insurance</span>
                </div>
              </div>
              <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5">
                <h3 className="text-lg font-bold text-slate-100 mb-4">Pending Tasks</h3>
                <div className="space-y-1 mt-2">
                  <TaskItem title="Process IP Final Bill" desc="Bed 104 Discharge" priority="High" time="15m ago" />
                  <TaskItem title="Verify UPI Payment" desc="TXN-998234" priority="Normal" time="1h ago" />
                  <TaskItem title="Discount Approval" desc="Waiting on Admin" priority="Critical" time="2h ago" />
                  <TaskItem title="End of Day Tally" desc="Reconcile cash drawer" priority="Normal" time="4h ago" />
                </div>
              </div>
            </div>
          </>
        );

      case 'insurance':
        return (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <KPICard title="Pending Pre-Auth" value={8} icon={Clock} trend="2" trendUp={false} colorClass="text-amber-400" />
              <KPICard title="Approved Claims" value={12} icon={CheckCircle} trend="20%" trendUp={true} colorClass="text-emerald-400" />
              <KPICard title="Rejected Claims" value={2} icon={AlertTriangle} trend="1" trendUp={false} colorClass="text-rose-400" />
              <KPICard title="Pending Docs" value={5} icon={FileText} trend="3" trendUp={true} colorClass="text-violet-400" />
            </div>

            <div className="overflow-x-auto pb-4 mb-6 scrollbar-hide">
              <div className="flex gap-4">
                <QuickAction label="TPA Operations" icon={ShieldAlert} colorClass="text-cyan-400" onClick={() => setActiveModule('insurance')} />
                <QuickAction label="Pre-Auth Queue" icon={Clock} colorClass="text-amber-400" onClick={() => setActiveModule('workflow')} />
                <QuickAction label="Patient Lookup" icon={Users} colorClass="text-emerald-400" onClick={() => setActiveModule('patients')} />
                <QuickAction label="Consent Forms" icon={FileCheck} colorClass="text-violet-400" onClick={() => setActiveModule('consent-forms')} />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5">
                <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2"><ShieldAlert className="w-5 h-5 text-cyan-400" /> Claims Processing Funnel</h3>
                <SvgBarChart data={[25, 20, 15, 12]} color="bg-cyan-500" />
                <div className="flex justify-between text-xs text-slate-400 mt-2 px-2">
                  <span>Submitted</span><span>Pre-Auth</span><span>Query</span><span>Approved</span>
                </div>
              </div>
              <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5">
                <h3 className="text-lg font-bold text-slate-100 mb-4">Pending Tasks</h3>
                <div className="space-y-1 mt-2">
                  <TaskItem title="Upload Discharge Sum" desc="Star Health claim" priority="High" time="1h ago" />
                  <TaskItem title="Reply to TPA Query" desc="Missing lab report" priority="Critical" time="2h ago" />
                  <TaskItem title="Aarogyasri Pre-Auth" desc="New admission" priority="High" time="3h ago" />
                  <TaskItem title="File Final Claim" desc="Patient discharged yesterday" priority="Normal" time="5h ago" />
                </div>
              </div>
            </div>
          </>
        );

      case 'nurse':
        return (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <KPICard title="MAR Due" value={12} icon={Pill} trend="4" trendUp={false} colorClass="text-rose-400" />
              <KPICard title="Vitals Pending" value={6} icon={HeartPulse} trend="2" trendUp={true} colorClass="text-amber-400" />
              <KPICard title="Meds Given" value={48} icon={Syringe} trend="15%" trendUp={true} colorClass="text-emerald-400" />
              <KPICard title="Patient Alerts" value={2} icon={AlertCircle} trend="1" trendUp={false} colorClass="text-rose-500" />
            </div>

            <div className="overflow-x-auto pb-4 mb-6 scrollbar-hide">
              <div className="flex gap-4">
                <QuickAction label="Open MAR" icon={ClipboardList} colorClass="text-cyan-400" onClick={() => setActiveModule('nursing-station')} />
                <QuickAction label="Patient Directory" icon={Users} colorClass="text-emerald-400" onClick={() => setActiveModule('patients')} />
                <QuickAction label="Consent Forms" icon={FileCheck} colorClass="text-violet-400" onClick={() => setActiveModule('consent-forms')} />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5">
                <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2"><Clock className="w-5 h-5 text-emerald-400" /> Meds Administered by Hour</h3>
                <SvgBarChart data={[2, 10, 15, 8, 4, 6, 3]} color="bg-emerald-500" />
              </div>
              <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5">
                <h3 className="text-lg font-bold text-slate-100 mb-4">Pending Tasks</h3>
                <div className="space-y-1 mt-2">
                  <TaskItem title="Administer Antibiotics" desc="Bed 201 - 2:00 PM dose" priority="Critical" time="Now" />
                  <TaskItem title="Record Vitals" desc="ICU Beds 1-4" priority="High" time="15m ago" />
                  <TaskItem title="Dressing Change" desc="Bed 105" priority="Normal" time="1h ago" />
                  <TaskItem title="Collect Blood Sample" desc="Bed 302" priority="High" time="2h ago" />
                </div>
              </div>
            </div>
          </>
        );

      case 'emergency':
        return (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <KPICard title="Active Triage" value={5} icon={Activity} trend="2" trendUp={true} colorClass="text-amber-400" />
              <KPICard title="Red Critical" value={2} icon={AlertTriangle} trend="1" trendUp={false} colorClass="text-rose-500" />
              <KPICard title="Yellow Urgent" value={2} icon={HeartPulse} trend="0" trendUp={true} colorClass="text-amber-500" />
              <KPICard title="MLC Cases" value={1} icon={ShieldAlert} trend="1" trendUp={false} colorClass="text-violet-400" />
            </div>

            <div className="overflow-x-auto pb-4 mb-6 scrollbar-hide">
              <div className="flex gap-4">
                <QuickAction label="Emerg Command" icon={Activity} colorClass="text-rose-500" onClick={() => setActiveModule('emergency')} />
                <QuickAction label="Patient Lookup" icon={Users} colorClass="text-cyan-400" onClick={() => setActiveModule('patients')} />
                <QuickAction label="Patient Transfer" icon={ArrowRight} colorClass="text-emerald-400" onClick={() => setActiveModule('patient-movement')} />
                <QuickAction label="MLC Consent" icon={FileCheck} colorClass="text-violet-400" onClick={() => setActiveModule('consent-forms')} />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5">
                <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2"><Activity className="w-5 h-5 text-rose-500" /> Triage Cases (Last 12 Hrs)</h3>
                <SvgBarChart data={[1, 3, 0, 5, 2, 4, 1]} color="bg-rose-500" />
              </div>
              <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5">
                <h3 className="text-lg font-bold text-slate-100 mb-4">Pending Actions</h3>
                <div className="space-y-1 mt-2">
                  <TaskItem title="Police Intimation" desc="MLC #2045 pending info" priority="Critical" time="15m ago" />
                  <TaskItem title="Shift to ICU" desc="Patient Triage 1 stabilized" priority="High" time="30m ago" />
                  <TaskItem title="Arrange Blood" desc="O-ve 2 units for Triage 2" priority="Critical" time="45m ago" />
                  <TaskItem title="Clear ER Bed 3" desc="Discharge processing" priority="Normal" time="1h ago" />
                </div>
              </div>
            </div>
          </>
        );
        
      case 'bed-manager':
        const totalBeds = beds.length;
        const occupied = beds.filter(b => b.status === 'Occupied').length;
        const available = beds.filter(b => b.status === 'Available').length;
        
        return (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <KPICard title="Total Beds" value={totalBeds} icon={Bed} trend="0" trendUp={true} colorClass="text-cyan-400" />
              <KPICard title="Occupied" value={occupied} icon={Users} trend="2%" trendUp={true} colorClass="text-emerald-400" />
              <KPICard title="Available" value={available} icon={CheckCircle} trend="5%" trendUp={false} colorClass="text-amber-400" />
              <KPICard title="ICU Occupancy" value="85%" icon={HeartPulse} trend="10%" trendUp={true} colorClass="text-rose-400" />
            </div>

            <div className="overflow-x-auto pb-4 mb-6 scrollbar-hide">
              <div className="flex gap-4">
                <QuickAction label="Bed Control" icon={Bed} colorClass="text-cyan-400" onClick={() => setActiveModule('bed-management')} />
                <QuickAction label="Patient Transfer" icon={ArrowRight} colorClass="text-violet-400" onClick={() => setActiveModule('patient-movement')} />
                <QuickAction label="Patient Lookup" icon={Users} colorClass="text-emerald-400" onClick={() => setActiveModule('patients')} />
                <QuickAction label="Admissions" icon={FileText} colorClass="text-amber-400" onClick={() => setActiveModule('workflow')} />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5">
                <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2"><Bed className="w-5 h-5 text-cyan-400" /> Bed Occupancy by Ward</h3>
                <SvgBarChart data={[20, 15, 18, 5, 12]} color="bg-cyan-500" />
                <div className="flex justify-between text-xs text-slate-400 mt-2 px-2">
                  <span>Gen</span><span>Semi</span><span>Pvt</span><span>ICU</span><span>NICU</span>
                </div>
              </div>
              <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5">
                <h3 className="text-lg font-bold text-slate-100 mb-4">Pending Tasks</h3>
                <div className="space-y-1 mt-2">
                  <TaskItem title="Approve Ward Shift" desc="Pvt to Gen - Patient request" priority="Normal" time="30m ago" />
                  <TaskItem title="Clear Discharged Bed" desc="Bed 102 vacant, mark ready" priority="High" time="1h ago" />
                  <TaskItem title="ICU Bed Request" desc="From Emergency" priority="Critical" time="1h ago" />
                  <TaskItem title="Maintenance Block" desc="Bed 405 oxygen port issue" priority="Normal" time="2h ago" />
                </div>
              </div>
            </div>
          </>
        );

      case 'housekeeping-sup':
        const pendingTasks = housekeepingTasks.filter(t => t.status === 'Pending').length;
        const inProgTasks = housekeepingTasks.filter(t => t.status === 'In Progress').length;

        return (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <KPICard title="Pending Tasks" value={pendingTasks} icon={ClipboardList} trend="3" trendUp={false} colorClass="text-rose-400" />
              <KPICard title="In Progress" value={inProgTasks} icon={Activity} trend="1" trendUp={true} colorClass="text-amber-400" />
              <KPICard title="Completed Today" value={8} icon={CheckCircle} trend="12%" trendUp={true} colorClass="text-emerald-400" />
              <KPICard title="Urgent Alerts" value={2} icon={AlertTriangle} trend="2" trendUp={false} colorClass="text-rose-500" />
            </div>

            <div className="overflow-x-auto pb-4 mb-6 scrollbar-hide">
              <div className="flex gap-4">
                <QuickAction label="Task Board" icon={ClipboardList} colorClass="text-cyan-400" onClick={() => setActiveModule('housekeeping')} />
                <QuickAction label="Bed Status" icon={Bed} colorClass="text-emerald-400" onClick={() => setActiveModule('bed-management')} />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5">
                <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2"><CheckCircle className="w-5 h-5 text-emerald-400" /> Task Completion by Shift</h3>
                <SvgBarChart data={[15, 22, 18, 5, 0, 0, 0]} color="bg-emerald-500" />
              </div>
              <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5">
                <h3 className="text-lg font-bold text-slate-100 mb-4">Pending Tasks</h3>
                <div className="space-y-1 mt-2">
                  <TaskItem title="Discharge Cleaning" desc="Bed 204" priority="High" time="10m ago" />
                  <TaskItem title="Spill in Corridor A" desc="Biohazard protocol" priority="Critical" time="15m ago" />
                  <TaskItem title="Routine Restroom Check" desc="OPD Block" priority="Normal" time="1h ago" />
                  <TaskItem title="Linen Replacement" desc="ICU Block" priority="High" time="2h ago" />
                </div>
              </div>
            </div>
          </>
        );

      case 'maintenance':
        return (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <KPICard title="Open Tickets" value={6} icon={Wrench} trend="1" trendUp={false} colorClass="text-amber-400" />
              <KPICard title="Critical Breakdown" value={1} icon={AlertTriangle} trend="1" trendUp={false} colorClass="text-rose-500" />
              <KPICard title="AMC Alerts" value={3} icon={Clock} trend="0" trendUp={true} colorClass="text-violet-400" />
              <KPICard title="Overdue Calib." value={2} icon={AlertCircle} trend="1" trendUp={false} colorClass="text-rose-400" />
            </div>

            <div className="overflow-x-auto pb-4 mb-6 scrollbar-hide">
              <div className="flex gap-4">
                <QuickAction label="Maint. Desk" icon={Wrench} colorClass="text-cyan-400" onClick={() => setActiveModule('maintenance')} />
                <QuickAction label="Equip Report" icon={FileText} colorClass="text-violet-400" onClick={() => setActiveModule('reports')} />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5">
                <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2"><Wrench className="w-5 h-5 text-cyan-400" /> Tickets Resolved (This Month)</h3>
                <SvgBarChart data={[5, 8, 12, 6, 15, 9, 11]} color="bg-cyan-500" />
              </div>
              <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5">
                <h3 className="text-lg font-bold text-slate-100 mb-4">Pending Tasks</h3>
                <div className="space-y-1 mt-2">
                  <TaskItem title="OT AC Malfunction" desc="Temp fluctuation in OT-2" priority="Critical" time="30m ago" />
                  <TaskItem title="Fix Bed Motor" desc="Bed 105 tilt issue" priority="High" time="2h ago" />
                  <TaskItem title="Generator Service" desc="Monthly routine check" priority="Normal" time="1d ago" />
                  <TaskItem title="Calibrate ECG Mach." desc="OPD Room 3" priority="High" time="1d ago" />
                </div>
              </div>
            </div>
          </>
        );
        
      default:
        return <div className="p-8 text-white">Dashboard for {currentUser.role} not yet implemented.</div>;
    }
  };

  return (
    <div className="p-1 font-sans">
      {/* Welcome Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 lg:p-8 mb-6 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Hospital className="w-32 h-32 text-slate-300" />
        </div>
        
        <div className="flex items-center gap-6 relative z-10">
          {currentUser.avatar ? (
            <img src={currentUser.avatar} alt="Avatar" className="w-20 h-20 rounded-2xl border-2 border-cyan-500/30 object-cover shadow-lg" />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center">
              <Users className="w-8 h-8 text-slate-400" />
            </div>
          )}
          
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Bhaskar Reddy Hospital</h1>
              <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 text-xs font-bold rounded-full border border-cyan-500/20 uppercase tracking-wider">
                Nellore Campus
              </span>
            </div>
            <p className="text-slate-400 flex items-center gap-2 text-xs">
              <Hospital className="w-4 h-4 text-cyan-400" /> NABH Accredited Multi-Specialty & Women Health Care • Pogathota, Nellore
            </p>
            <p className="text-slate-400 text-xs mt-1">
              Logged in: <span className="font-semibold text-slate-200">{currentUser.name}</span> ({currentUser.roleTitle}) | Date: {currentDate} | Shift: Morning
            </p>
          </div>
        </div>
      </div>

      {/* Dynamic Brand Identity Selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 mb-6 shadow-xs">
        <h2 className="text-md font-bold text-slate-100 mb-1">Select Visual Theme Selection (stakeholder review)</h2>
        <p className="text-xs text-slate-400 mb-4">Click below to change the visual identity of the Internal OS to one of the three premium agency directions:</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => setActiveTheme('modern')}
            className={`p-4 rounded-2xl border text-left transition-all duration-300 ${activeTheme === 'modern' ? 'border-cyan-500 bg-cyan-500/5 ring-1 ring-cyan-500/20' : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'}`}
          >
            <div className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              Theme 1: Modern Premium
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Corporate clinical theme. Deep blue and emerald green highlights on a pure light background.</div>
          </button>

          <button 
            onClick={() => setActiveTheme('heritage')}
            className={`p-4 rounded-2xl border text-left transition-all duration-300 ${activeTheme === 'heritage' ? 'border-[#800020] bg-[#800020]/5 ring-1 ring-[#800020]/20' : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'}`}
          >
            <div className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#800020]"></span>
              Theme 2: Authentic Healing
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Indian heritage elements. Sandstone outlines, deep maroon, muted gold, warm ivory backdrops, and serif font headings.</div>
          </button>

          <button 
            onClick={() => setActiveTheme('digital')}
            className={`p-4 rounded-2xl border text-left transition-all duration-300 ${activeTheme === 'digital' ? 'border-cyan-400 bg-cyan-500/10 ring-1 ring-cyan-500/30' : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'}`}
          >
            <div className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(0,210,255,0.5)]"></span>
              Theme 3: Future Digital
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Cyber smart hospital theme. Midnight blue dark layout, neon cyan glows, glassmorphism, and data telemetry fonts.</div>
          </button>
        </div>
      </div>

      {/* Dynamic Role Content */}
      {renderDashboardContent()}
    </div>
  );
};

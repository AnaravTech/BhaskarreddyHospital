import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import { 
  TrendingUp, IndianRupee, Users, 
  BedDouble, AlertTriangle, Clock, CreditCard, 
  Activity, ArrowRight, HeartPulse, UserPlus, 
  CheckCircle, ShieldAlert, X, Building2, Bell, 
  Zap, Calendar, Star, Stethoscope, FileText
} from 'lucide-react';

export const CEODashboard: React.FC = () => {
  const { setActiveModule } = useHospital();

  const [alerts, setAlerts] = useState([
    { id: 1, type: 'critical', title: 'ICU CRITICAL', message: 'Bed capacity at 85%', time: '2m ago' },
    { id: 2, type: 'critical', title: 'EMERGENCY OVERFLOW', message: '7 active cases, 2 awaiting beds', time: '12m ago' },
    { id: 3, type: 'warning', title: 'INSURANCE DELAY', message: '3 pre-auth requests pending >48hrs', time: '45m ago' },
    { id: 4, type: 'warning', title: 'HIGH WAIT TIME', message: 'OPD waiting time 34 min (threshold: 20 min)', time: '1h ago' },
    { id: 5, type: 'warning', title: 'PENDING MLC', message: '1 medico-legal case awaiting police intimation', time: '1.5h ago' },
    { id: 6, type: 'success', title: 'DISCHARGE READY', message: '3 patients medically fit, billing pending', time: '2h ago' },
  ]);

  const dismissAlert = (id: number) => {
    setAlerts(alerts.filter(a => a.id !== id));
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical': return <ShieldAlert className="w-5 h-5 text-rose-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'success': return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      default: return <Bell className="w-5 h-5 text-cyan-500" />;
    }
  };

  const getAlertBorder = (type: string) => {
    switch (type) {
      case 'critical': return 'border-l-rose-500';
      case 'warning': return 'border-l-amber-500';
      case 'success': return 'border-l-emerald-500';
      default: return 'border-l-cyan-500';
    }
  };

  const deptData = [
    { name: 'Cardiology', op: 42, ip: 8, rev: '₹1,24,000', rating: 4.8, status: 'Active', statusColor: 'emerald' },
    { name: 'Obstetrics & Gynecology', op: 38, ip: 12, rev: '₹98,500', rating: 4.9, status: 'Busy', statusColor: 'amber' },
    { name: 'Orthopedics', op: 29, ip: 5, rev: '₹82,000', rating: 4.7, status: 'Active', statusColor: 'emerald' },
    { name: 'Emergency', op: 22, ip: 14, rev: '₹74,000', rating: 4.6, status: 'At Capacity', statusColor: 'rose' },
    { name: 'General Medicine', op: 55, ip: 6, rev: '₹41,000', rating: 4.5, status: 'Active', statusColor: 'emerald' },
    { name: 'Pediatrics', op: 31, ip: 4, rev: '₹33,000', rating: 4.8, status: 'Active', statusColor: 'emerald' }
  ];

  const docsData = [
    { name: 'Dr. Vikram Reddy', spec: 'Cardiology', pts: 28, rev: '₹42,000', rating: 4.9 },
    { name: 'Dr. Madhu Latha Marreddy', spec: 'OB/GYN', pts: 22, rev: '₹33,000', rating: 4.8 },
    { name: 'Dr. Rajeshwar Rao', spec: 'Orthopedics', pts: 19, rev: '₹28,500', rating: 4.7 },
    { name: 'Dr. Sameer Khan', spec: 'Emergency', pts: 31, rev: '₹0', rating: 4.9 },
    { name: 'Dr. Suresh Kumar', spec: 'Medicine', pts: 24, rev: '₹24,000', rating: 4.6 }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-950/50 via-slate-900 to-slate-900 border-b border-slate-800/80 p-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
            Executive Command Center
          </h1>
          <p className="text-slate-400 mt-1 flex items-center gap-2">
            Bhaskar Reddy Hospital <span className="text-slate-600">•</span> Nellore
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-full text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Live • Updated 2 min ago
          </div>
        </div>
      </div>

      {/* Section 1: Revenue Command Strip */}
      <div className="bg-slate-900 border-b border-slate-800 p-4 overflow-x-auto whitespace-nowrap hide-scrollbar flex items-center gap-8">
        <div className="flex items-center gap-3 pr-8 border-r border-slate-800">
          <div className="p-2 bg-emerald-500/20 rounded-lg">
            <IndianRupee className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Total Revenue Today</p>
            <div className="flex items-end gap-3">
              <h2 className="text-3xl font-bold text-white">₹4,28,500</h2>
              <span className="flex items-center text-emerald-400 text-sm font-medium mb-1">
                <TrendingUp className="w-4 h-4 mr-1" /> +12.4%
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-6 pr-8 border-r border-slate-800">
          <div>
            <p className="text-xs text-slate-500 mb-1">Source Split</p>
            <div className="flex gap-4 text-sm">
              <span className="text-slate-300">OP <span className="text-white font-medium">₹1.24L</span></span>
              <span className="text-slate-300">IP <span className="text-white font-medium">₹2.18L</span></span>
              <span className="text-slate-300">ER <span className="text-rose-400 font-medium">₹42K</span></span>
              <span className="text-slate-300">Other <span className="text-white font-medium">₹44K</span></span>
            </div>
          </div>
        </div>

        <div className="flex gap-6">
          <div>
            <p className="text-xs text-slate-500 mb-1">Mode Split</p>
            <div className="flex gap-4 text-sm">
              <span className="text-slate-300">Cash <span className="text-emerald-400 font-medium">₹1.82L</span></span>
              <span className="text-slate-300">UPI <span className="text-cyan-400 font-medium">₹98K</span></span>
              <span className="text-slate-300">Card <span className="text-purple-400 font-medium">₹64K</span></span>
              <span className="text-slate-300">Insurance <span className="text-blue-400 font-medium">₹83K</span></span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-[1600px] mx-auto space-y-6">
        
        {/* Section 2: Operational KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Today's OP Count", val: "142", sub: "+8 vs yesterday", icon: <Users className="w-5 h-5" />, color: "cyan" },
            { label: "New Admissions", val: "18", sub: "+3 vs yesterday", icon: <UserPlus className="w-5 h-5" />, color: "emerald" },
            { label: "Discharges Today", val: "14", sub: "-2 vs yesterday", icon: <CheckCircle className="w-5 h-5" />, color: "blue" },
            { label: "Emergency Cases", val: "7", sub: "2 critical", icon: <Activity className="w-5 h-5" />, color: "rose", subColor: "text-rose-400" },
            { label: "ICU Occupancy", val: "85%", sub: "17/20 beds", icon: <HeartPulse className="w-5 h-5" />, color: "amber", isProgress: true, progVal: 85 },
            { label: "Overall Bed Occupancy", val: "78%", sub: "62/80 beds", icon: <BedDouble className="w-5 h-5" />, color: "cyan", isProgress: true, progVal: 78 },
            { label: "Average LOS", val: "4.2", sub: "days", icon: <Calendar className="w-5 h-5" />, color: "violet" },
            { label: "Avg Waiting Time", val: "28", sub: "min (Alert: >20m)", icon: <Clock className="w-5 h-5" />, color: "amber", subColor: "text-amber-400" },
          ].map((kpi, i) => (
            <div key={i} className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden group hover:border-slate-700 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div className={`p-2 rounded-lg bg-${kpi.color}-500/10 text-${kpi.color}-400`}>
                  {kpi.icon}
                </div>
                <div className="text-right">
                  <h3 className="text-2xl font-bold text-slate-100">{kpi.val}</h3>
                </div>
              </div>
              <p className="text-slate-400 text-sm font-medium">{kpi.label}</p>
              <p className={`text-xs mt-1 ${kpi.subColor || 'text-slate-500'}`}>{kpi.sub}</p>
              
              {kpi.isProgress && (
                <div className="w-full bg-slate-800 rounded-full h-1.5 mt-3">
                  <div className={`bg-${kpi.color}-500 h-1.5 rounded-full`} style={{ width: `${kpi.progVal}%` }}></div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Section 3: Clinical KPI Alert Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 border-l-4 border-l-rose-500 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-rose-400 font-bold mb-1">
                <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" /> Critical Patients
              </div>
              <p className="text-2xl font-bold text-white mb-1">5</p>
              <p className="text-xs text-slate-400">currently in ICU/CCU</p>
            </div>
            <button onClick={() => setActiveModule('bed-management')} className="text-xs text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1 mt-3 w-fit">
              View Details <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 border-l-4 border-l-amber-500 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-amber-400 font-bold mb-1">
                <div className="w-2 h-2 rounded-full bg-amber-500" /> Pending Discharges
              </div>
              <p className="text-2xl font-bold text-white mb-1">8</p>
              <p className="text-xs text-slate-400">awaiting billing clearance</p>
            </div>
            <button onClick={() => setActiveModule('billing')} className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 mt-3 w-fit">
              View Details <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 border-l-4 border-l-blue-500 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-blue-400 font-bold mb-1">
                <div className="w-2 h-2 rounded-full bg-blue-500" /> Insurance Approvals
              </div>
              <p className="text-2xl font-bold text-white mb-1">6</p>
              <p className="text-xs text-slate-400">pre-auth pending</p>
            </div>
            <button onClick={() => setActiveModule('insurance')} className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 mt-3 w-fit">
              View Details <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 border-l-4 border-l-emerald-500 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 font-bold mb-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500" /> Doctor Sign-offs
              </div>
              <p className="text-2xl font-bold text-white mb-1">3</p>
              <p className="text-xs text-slate-400">discharge summaries</p>
            </div>
            <button onClick={() => setActiveModule('ipd')} className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 mt-3 w-fit">
              View Details <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            
            {/* Section 4: Financial KPI Panel */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
                <h4 className="text-sm text-slate-400 font-medium mb-2">Outstanding Bills</h4>
                <p className="text-xl font-bold text-rose-400 mb-2">₹2,84,000</p>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between"><span className="text-slate-500">&lt; 7 days</span><span className="text-slate-300">₹1,20,000</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">7-30 days</span><span className="text-slate-300">₹98,000</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">&gt; 30 days</span><span className="text-rose-400 font-medium">₹66,000</span></div>
                </div>
              </div>
              
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <h4 className="text-sm text-slate-400 font-medium mb-2">Advance Deposits Today</h4>
                  <p className="text-xl font-bold text-cyan-400 mb-1">₹48,500</p>
                  <p className="text-xs text-slate-500">Total collected from new IP admissions</p>
                </div>
                <CreditCard className="w-8 h-8 text-cyan-900/50 self-end mt-2" />
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <h4 className="text-sm text-slate-400 font-medium mb-2">Refund Queue</h4>
                  <p className="text-xl font-bold text-amber-400 mb-1">3 pending</p>
                  <p className="text-xs text-slate-500">Total value: ₹12,400</p>
                </div>
                <button className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium py-2 rounded-lg mt-3 transition-colors">
                  Review & Approve
                </button>
              </div>
            </div>

            {/* Section 5: 7-Day Revenue Bar Chart */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-cyan-400" /> Revenue Trend (Last 7 Days)
                </h3>
                <span className="text-xs text-emerald-400 font-medium bg-emerald-500/10 px-2 py-1 rounded">Avg: ₹3.97L / day</span>
              </div>
              
              <div className="h-48 flex items-end justify-between gap-2 px-2">
                {[
                  { day: 'Mon', val: 3.8, label: '3.8L' },
                  { day: 'Tue', val: 4.1, label: '4.1L' },
                  { day: 'Wed', val: 3.6, label: '3.6L' },
                  { day: 'Thu', val: 4.4, label: '4.4L' },
                  { day: 'Fri', val: 4.7, label: '4.7L' },
                  { day: 'Sat', val: 3.2, label: '3.2L' },
                  { day: 'Today', val: 4.28, label: '4.28L', isToday: true }
                ].map((d, i) => (
                  <div key={i} className="flex flex-col items-center justify-end flex-1 h-full group">
                    <span className="text-[10px] font-bold text-slate-200 mb-1">₹{d.label}</span>
                    <div className="w-full flex-1 flex items-end justify-center min-h-[40px]">
                      <div 
                        className={`w-full max-w-[40px] rounded-t-md transition-all duration-300 group-hover:opacity-90 shadow-md ${d.isToday ? 'bg-gradient-to-t from-cyan-600 to-cyan-400' : 'bg-gradient-to-t from-slate-700 to-slate-500'}`}
                        style={{ height: `${(d.val / 5) * 100}%` }}
                        title={`₹${d.val} Lakhs`}
                      ></div>
                    </div>
                    <span className={`text-xs mt-2 ${d.isToday ? 'text-cyan-400 font-bold' : 'text-slate-500'}`}>{d.day}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>30-Day Trend</span>
                  {/* Sparkline SVG */}
                  <svg className="w-3/4 h-6 text-emerald-500" preserveAspectRatio="none" viewBox="0 0 100 20">
                    <polyline fill="none" stroke="currentColor" strokeWidth="1.5" points="0,15 10,12 20,18 30,8 40,10 50,5 60,12 70,6 80,4 90,8 100,2" />
                    <circle cx="100" cy="2" r="2" fill="currentColor" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Section 7: Department Performance Table */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-indigo-400" /> Department Performance
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-400 uppercase bg-slate-950/50">
                    <tr>
                      <th className="px-4 py-3 font-medium">Department</th>
                      <th className="px-4 py-3 font-medium">Today's OP</th>
                      <th className="px-4 py-3 font-medium">IP Admitted</th>
                      <th className="px-4 py-3 font-medium">Revenue Today</th>
                      <th className="px-4 py-3 font-medium">Rating</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {deptData.map((dept, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-4 py-3 font-medium text-slate-200">{dept.name}</td>
                        <td className="px-4 py-3 text-cyan-400">{dept.op}</td>
                        <td className="px-4 py-3 text-blue-400">{dept.ip}</td>
                        <td className="px-4 py-3 text-slate-300">{dept.rev}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 text-amber-400">
                            {dept.rating} <Star className="w-3 h-3 fill-current" />
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium bg-${dept.statusColor}-500/10 text-${dept.statusColor}-400 border border-${dept.statusColor}-500/20`}>
                            {dept.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          <div className="space-y-6">
            
            {/* Section 6: Executive Alert Feed */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl flex flex-col h-[350px]">
              <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900 rounded-t-xl">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-400" /> Executive Alerts
                </h3>
                <span className="bg-rose-500/10 text-rose-400 text-xs px-2 py-1 rounded-full font-bold">{alerts.length} Active</span>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {alerts.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500">
                    <CheckCircle className="w-8 h-8 mb-2 opacity-50" />
                    <p className="text-sm">No active alerts</p>
                  </div>
                ) : (
                  alerts.map((alert) => (
                    <div key={alert.id} className={`p-3 rounded-lg bg-slate-950 border-l-2 ${getAlertBorder(alert.type)} border-t border-r border-b border-slate-800 relative group`}>
                      <button 
                        onClick={() => dismissAlert(alert.id)}
                        className="absolute top-2 right-2 p-1 text-slate-500 hover:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Dismiss"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <div className="flex gap-3">
                        <div className="mt-0.5">{getAlertIcon(alert.type)}</div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h4 className="text-sm font-bold text-slate-200">{alert.title}</h4>
                            <span className="text-[10px] text-slate-500 pr-4">{alert.time}</span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1">{alert.message}</p>
                          <div className="mt-2 flex gap-2">
                            <button className="text-[10px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded transition-colors">
                              Take Action
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Section 8: Doctor Productivity Leaderboard */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
                <Stethoscope className="w-5 h-5 text-emerald-400" /> Top Performers Today
              </h3>
              <div className="space-y-4">
                {docsData.map((doc, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 text-xs font-bold border border-slate-700">
                        #{i + 1}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-200">{doc.name}</p>
                        <p className="text-[10px] text-slate-500">{doc.spec} • ⭐ {doc.rating}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-cyan-400">{doc.pts} pts</p>
                      <p className="text-[10px] text-slate-400">{doc.rev}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 9: Insurance/Scheme Revenue Widget */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-blue-400" /> Revenue Mix
              </h3>
              <div className="space-y-4">
                {[
                  { label: 'Dr. YSR Aarogyasri', val: '₹48,200', pct: 11.2, color: 'blue' },
                  { label: 'Star Health', val: '₹35,100', pct: 8.2, color: 'purple' },
                  { label: 'Cash Patients', val: '₹1,82,300', pct: 42.5, color: 'emerald' },
                  { label: 'UPI/Card', val: '₹1,62,900', pct: 38.0, color: 'cyan' },
                ].map((item, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300 font-medium">{item.label}</span>
                      <span className="text-slate-400">{item.val} ({item.pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5">
                      <div className={`bg-${item.color}-500 h-1.5 rounded-full`} style={{ width: `${item.pct}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

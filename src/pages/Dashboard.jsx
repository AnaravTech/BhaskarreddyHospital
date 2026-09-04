import React from 'react';
import { useHospital } from '../context/HospitalContext';
import { Building2, BedDouble, Receipt, Siren, TrendingUp, ArrowUpRight, CalendarCheck, Stethoscope, Activity, Plus, ShieldCheck, } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, } from 'recharts';
export const CEODashboard = () => {
    const { appointments, beds, admissions, invoices, emergencyCases, setActiveModule, } = useHospital();
    const todayAppointments = appointments.length;
    const activeAdmissions = admissions.filter((a) => a.status === 'Admitted').length;
    const occupiedBeds = beds.filter((b) => b.status === 'Occupied').length;
    const totalBeds = beds.length;
    const bedOccupancyPercent = Math.round((occupiedBeds / totalBeds) * 100);
    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
    // Chart Data
    const revenueTrendData = [
        { day: 'Mon', revenue: 145000, opdCount: 85 },
        { day: 'Tue', revenue: 198000, opdCount: 110 },
        { day: 'Wed', revenue: 230000, opdCount: 140 },
        { day: 'Thu', revenue: 210000, opdCount: 125 },
        { day: 'Fri', revenue: 285000, opdCount: 165 },
        { day: 'Sat', revenue: 310000, opdCount: 180 },
        { day: 'Sun', revenue: 175000, opdCount: 95 },
    ];
    const bedTypeData = [
        { name: 'ICU Beds', value: beds.filter((b) => b.bedType === 'ICU').length, color: '#ef4444' },
        { name: 'Private Suites', value: beds.filter((b) => b.bedType === 'Private').length, color: '#3b82f6' },
        { name: 'General Wards', value: beds.filter((b) => b.bedType === 'General').length, color: '#10b981' },
        { name: 'Isolation', value: beds.filter((b) => b.bedType === 'Isolation').length, color: '#f59e0b' },
    ];
    const departmentPerformanceData = [
        { name: 'Cardiology', opd: 42, ipd: 12, revenue: 185000 },
        { name: 'Neurology', opd: 28, ipd: 8, revenue: 142000 },
        { name: 'Orthopedics', opd: 35, ipd: 15, revenue: 195000 },
        { name: 'Gen Medicine', opd: 55, ipd: 6, revenue: 88000 },
    ];
    return (<div className="space-y-6 pb-12">
      {/* Executive Welcome & Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Live Operations Online
            </span>
            <span className="text-xs text-slate-400 font-mono">Synced: Today 23:52 IST</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white mt-1">Hospital Executive Command Center</h2>
          <p className="text-xs text-slate-400">
            Real-time multi-branch clinical performance, bed telemetry, and financial analytics.
          </p>
        </div>

        {/* Executive Quick Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => setActiveModule('reception')} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md shadow-cyan-600/20 transition">
            <Plus className="w-4 h-4"/>
            <span>Walk-in Token</span>
          </button>

          <button onClick={() => setActiveModule('bed-management')} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition">
            <BedDouble className="w-4 h-4 text-cyan-400"/>
            <span>Ward Occupancy</span>
          </button>

          <button onClick={() => setActiveModule('emergency')} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-semibold transition animate-pulse">
            <Siren className="w-4 h-4 text-rose-400"/>
            <span>Emergency Bay</span>
          </button>
        </div>
      </div>

      {/* Primary CEO KPI Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Today's Revenue */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-cyan-500/40 transition shadow-sm group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Today Revenue</span>
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Receipt className="w-5 h-5"/>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white">₹{totalRevenue.toLocaleString()}</div>
            <div className="flex items-center gap-1 mt-1 text-xs text-emerald-400 font-medium">
              <ArrowUpRight className="w-3.5 h-3.5"/>
              <span>+18.4% vs yesterday</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Bed Occupancy */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-blue-500/40 transition shadow-sm group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Bed Occupancy</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <BedDouble className="w-5 h-5"/>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white">
              {occupiedBeds} / {totalBeds}{' '}
              <span className="text-sm font-semibold text-cyan-400">({bedOccupancyPercent}%)</span>
            </div>
            <div className="flex items-center gap-1 mt-1 text-xs text-cyan-400 font-medium">
              <Activity className="w-3.5 h-3.5"/>
              <span>4 ICU Beds Active</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Today's OPD & Appointments */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-emerald-500/40 transition shadow-sm group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Appointments & Tokens</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CalendarCheck className="w-5 h-5"/>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white">{todayAppointments} Booked</div>
            <div className="flex items-center gap-1 mt-1 text-xs text-slate-400">
              <span>Includes Fixed & Queue Tokens</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Active IPD Admissions */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-purple-500/40 transition shadow-sm group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Active IPD Inpatients</span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Building2 className="w-5 h-5"/>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white">{activeAdmissions} Patients</div>
            <div className="flex items-center gap-1 mt-1 text-xs text-emerald-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5"/>
              <span>Insurance Pre-Auth Approved</span>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Revenue & OPD Count Trend Chart */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400"/>
                Revenue & OPD Volume Analytics
              </h3>
              <p className="text-[11px] text-slate-400">7-day collection trajectory across all payment channels</p>
            </div>
            <span className="px-2 py-1 text-[10px] bg-slate-800 text-slate-300 rounded font-mono">Weekly</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b"/>
                <XAxis dataKey="day" stroke="#64748b" fontSize={11}/>
                <YAxis stroke="#64748b" fontSize={11} tickFormatter={(val) => `₹${val / 1000}k`}/>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} formatter={(val) => [`₹${Number(val).toLocaleString()}`, 'Revenue']}/>
                <Area type="monotone" dataKey="revenue" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)"/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bed Utilization Distribution Pie Chart */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex flex-col justify-between">
          <div className="mb-2">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <BedDouble className="w-4 h-4 text-purple-400"/>
              Ward Capacity Mix
            </h3>
            <p className="text-[11px] text-slate-400">Total hospital bed allocation breakdown</p>
          </div>

          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={bedTypeData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={5} dataKey="value">
                  {bedTypeData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color}/>))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}/>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-800/80">
            {bedTypeData.map((item, idx) => (<div key={idx} className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}/>
                <span className="text-slate-400 truncate">{item.name}:</span>
                <span className="font-semibold text-slate-200">{item.value}</span>
              </div>))}
          </div>
        </div>
      </div>

      {/* Department Performance & Recent Emergency Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Revenue Contribution */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-blue-400"/>
              Specialty Department Performance
            </h3>
            <button onClick={() => setActiveModule('departments')} className="text-xs text-cyan-400 hover:underline">
              View All
            </button>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b"/>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11}/>
                <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `₹${v / 1000}k`}/>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}/>
                <Bar dataKey="revenue" fill="#3b82f6" radius={[6, 6, 0, 0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Emergency Triage Status Panel */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Siren className="w-4 h-4 text-rose-400 animate-pulse"/>
                Emergency Resuscitation Feed
              </h3>
              <button onClick={() => setActiveModule('emergency')} className="text-xs text-rose-400 hover:underline font-semibold">
                Go to Triage Bay
              </button>
            </div>

            <div className="space-y-2.5">
              {emergencyCases.map((ec) => (<div key={ec.id} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full animate-ping ${ec.triagePriority.startsWith('Red') ? 'bg-rose-500' : 'bg-amber-500'}`}/>
                    <div>
                      <div className="text-xs font-bold text-slate-100">{ec.patientName}</div>
                      <div className="text-[10px] text-slate-400">
                        {ec.chiefComplaint} • Bed: {ec.assignedBed}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${ec.triagePriority.startsWith('Red')
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}`}>
                      {ec.triagePriority.split(' - ')[0]}
                    </span>
                    <div className="text-[9px] text-slate-500 font-mono mt-0.5">{ec.arrivalTime}</div>
                  </div>
                </div>))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>On-Duty Emergency Lead: Dr. Sameer Khan</span>
            <span className="text-emerald-400 font-medium">100% Resuscitation Bay Ready</span>
          </div>
        </div>
      </div>
    </div>);
};

export const Dashboard = CEODashboard;
export default CEODashboard;

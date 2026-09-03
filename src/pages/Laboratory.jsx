import React, { useState } from 'react';
import { useHospital } from '../context/HospitalContext';
import {
  FlaskConical,
  Search,
  CheckCircle2,
  Clock,
  FileCheck,
  AlertCircle,
  FileText,
  User,
  Printer,
  Download,
  Filter,
} from 'lucide-react';

const INITIAL_LAB_ORDERS = [
  {
    id: 'lab-101',
    orderNumber: 'LAB-2026-049',
    patientName: 'Kavitha Reddy',
    uhid: 'UHID-2026-0042',
    testName: 'Complete Blood Count (CBC) + ESR',
    department: 'Hematology',
    doctorName: 'Dr. Vikram Reddy',
    status: 'Verified & Ready',
    orderTime: '08:30 AM',
    sampleType: 'Whole Blood (EDTA)',
    results: [
      { parameter: 'Hemoglobin', value: '13.2', unit: 'g/dL', normal: '12.0 - 15.5', status: 'Normal' },
      { parameter: 'WBC Count', value: '7,400', unit: '/mcL', normal: '4,500 - 11,000', status: 'Normal' },
      { parameter: 'Platelets', value: '2.4', unit: 'Lakh/mcL', normal: '1.5 - 4.5', status: 'Normal' },
      { parameter: 'ESR (1 hr)', value: '14', unit: 'mm/hr', normal: '0 - 20', status: 'Normal' },
    ],
  },
  {
    id: 'lab-102',
    orderNumber: 'LAB-2026-050',
    patientName: 'Ramesh Naidu',
    uhid: 'UHID-2026-0089',
    testName: 'Cardiac Troponin-I (High Sensitivity)',
    department: 'Biochemistry / Emergency',
    doctorName: 'Dr. Sameer Khan',
    status: 'Verified & Ready',
    orderTime: '09:15 AM',
    sampleType: 'Serum',
    results: [
      { parameter: 'High-Sensitivity Trop-I', value: '1.85', unit: 'ng/mL', normal: '< 0.04', status: 'Critical High' },
    ],
  },
  {
    id: 'lab-103',
    orderNumber: 'LAB-2026-051',
    patientName: 'Mohammed Ismail',
    uhid: 'UHID-2026-0104',
    testName: 'HbA1c & Fasting Blood Sugar',
    department: 'Clinical Pathology',
    doctorName: 'Dr. Praveen Kumar',
    status: 'Processing',
    orderTime: '10:00 AM',
    sampleType: 'Fluoride Plasma',
    results: [],
  },
  {
    id: 'lab-104',
    orderNumber: 'LAB-2026-052',
    patientName: 'Sunita Sharma',
    uhid: 'UHID-2026-0012',
    testName: 'Thyroid Stimulating Hormone (TSH)',
    department: 'Endocrinology',
    doctorName: 'Dr. Vikram Reddy',
    status: 'Sample Received',
    orderTime: '10:45 AM',
    sampleType: 'Serum',
    results: [],
  },
  {
    id: 'lab-105',
    orderNumber: 'LAB-2026-053',
    patientName: 'B. Venkat Rao',
    uhid: 'UHID-2026-0155',
    testName: 'Renal Function Test (RFT) + Electrolytes',
    department: 'Biochemistry',
    doctorName: 'Dr. Praveen Kumar',
    status: 'Pending Sample',
    orderTime: '11:10 AM',
    sampleType: 'Pending',
    results: [],
  },
];

export const Laboratory = () => {
  const { addToast } = useHospital();
  const [labOrders, setLabOrders] = useState(INITIAL_LAB_ORDERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedReport, setSelectedReport] = useState(INITIAL_LAB_ORDERS[0]);

  const filteredOrders = labOrders.filter((order) => {
    const matchSearch =
      order.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.uhid.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'All' || order.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleUpdateStatus = (orderId, newStatus) => {
    setLabOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    if (selectedReport && selectedReport.id === orderId) {
      setSelectedReport((prev) => ({ ...prev, status: newStatus }));
    }
    if (addToast) {
      addToast({
        title: 'Laboratory Status Updated',
        message: `Order #${orderId} marked as ${newStatus}.`,
        type: 'success',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <FlaskConical className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-100 tracking-tight">
              Clinical Laboratory & Diagnostic Services
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Pathology, Biochemistry, Hematology, Barcode Sample Tracking & Digital Reports
            </p>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">Active Test Orders</div>
            <div className="text-2xl font-bold text-slate-100 mt-1">{labOrders.length} Requests</div>
            <div className="text-[11px] text-cyan-400 mt-0.5">Automated analyzer integration</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-800 text-cyan-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">Awaiting Verification</div>
            <div className="text-2xl font-bold text-amber-400 mt-1">1 Test</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Pathologist review queue</div>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">Ready Reports</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">2 Verified</div>
            <div className="text-[11px] text-emerald-400/80 mt-0.5">Sync to patient EMR done</div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">Critical Value Alerts</div>
            <div className="text-2xl font-bold text-rose-400 mt-1">1 Panic Alert</div>
            <div className="text-[11px] text-rose-400 mt-0.5">Troponin-I alert communicated</div>
          </div>
          <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Split View: Queue & Live Report Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Orders List */}
        <div className="lg:col-span-7 rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search patient, test, UHID..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700/80 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {['All', 'Verified & Ready', 'Processing', 'Sample Received', 'Pending Sample'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition ${
                    statusFilter === st
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                      : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2.5 max-h-[540px] overflow-y-auto pr-1">
            {filteredOrders.map((order) => {
              const isSelected = selectedReport?.id === order.id;
              return (
                <div
                  key={order.id}
                  onClick={() => setSelectedReport(order)}
                  className={`p-3.5 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-slate-800/80 border-cyan-500/50 shadow-md'
                      : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/40 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] font-bold text-cyan-400">
                          {order.orderNumber}
                        </span>
                        <span className="text-[11px] text-slate-400">• {order.orderTime}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-100 mt-1">{order.testName}</h4>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {order.patientName} ({order.uhid})
                      </div>
                    </div>

                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                        order.status === 'Verified & Ready'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : order.status === 'Processing'
                          ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 animate-pulse'
                          : order.status === 'Sample Received'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Ordered by: {order.doctorName}</span>
                    <span className="font-mono text-cyan-300">{order.department}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Diagnostic Report Preview */}
        <div className="lg:col-span-5 rounded-2xl bg-slate-900 border border-slate-800 p-5 flex flex-col justify-between space-y-4">
          {selectedReport ? (
            <>
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-cyan-400" />
                    <div>
                      <h3 className="font-bold text-slate-100 text-sm">Official Diagnostic Report</h3>
                      <p className="text-[10px] text-slate-400">{selectedReport.orderNumber}</p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                      selectedReport.status === 'Verified & Ready'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    }`}
                  >
                    {selectedReport.status}
                  </span>
                </div>

                {/* Patient Summary Header */}
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-1 mb-4">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Patient:</span>
                    <span className="font-bold text-slate-100">{selectedReport.patientName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">UHID:</span>
                    <span className="font-mono text-cyan-400">{selectedReport.uhid}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Specimen:</span>
                    <span className="text-slate-200">{selectedReport.sampleType}</span>
                  </div>
                </div>

                {/* Results Section */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Investigation Findings
                  </h4>

                  {selectedReport.results && selectedReport.results.length > 0 ? (
                    <div className="rounded-xl border border-slate-800 overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-950/80 text-[10px] uppercase font-bold text-slate-400">
                          <tr>
                            <th className="py-2 px-3">Test Parameter</th>
                            <th className="py-2 px-3">Observed</th>
                            <th className="py-2 px-3">Reference Range</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/80">
                          {selectedReport.results.map((res, i) => (
                            <tr key={i} className="hover:bg-slate-800/30">
                              <td className="py-2 px-3 text-slate-200 font-medium">{res.parameter}</td>
                              <td className="py-2 px-3 font-mono font-bold">
                                <span
                                  className={
                                    res.status.includes('Critical')
                                      ? 'text-rose-400'
                                      : 'text-emerald-400'
                                  }
                                >
                                  {res.value} {res.unit}
                                </span>
                              </td>
                              <td className="py-2 px-3 text-slate-400 text-[11px]">{res.normal}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
                      Specimen is currently in automated analyzer testing. Results will appear once verified by Dr. Meena Sharma (Pathologist).
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2.5">
                {selectedReport.status !== 'Verified & Ready' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedReport.id, 'Verified & Ready')}
                    className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Approve & Sign
                  </button>
                )}
                <button
                  onClick={() => alert(`Printing official laboratory report for ${selectedReport.patientName}...`)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" /> Print
                </button>
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-slate-500 text-xs">
              Select a test order from the left to view the official diagnostic report.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Laboratory;

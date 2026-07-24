import React from 'react';
import { useHospital } from '../../context/HospitalContext';
import { BarChart3, Download, FileSpreadsheet } from 'lucide-react';

export const ReportsModule: React.FC = () => {
  const { appointments, invoices, addToast } = useHospital();

  const reportItems = [
    { title: "Daily OP Consultation Register", category: "Clinical", records: appointments.length, format: "PDF / CSV" },
    { title: "Financial Collections & Cash Counter Ledger", category: "Finance", records: invoices.length, format: "Excel / PDF" },
    { title: "Specialty Doctor Revenue Contribution Report", category: "Executive", records: 5, format: "PDF" },
    { title: "TPA Insurance Pre-Auth & Settlement Analytics", category: "Insurance", records: 3, format: "CSV" },
    { title: "Inpatient Bed Occupancy & Discharge History", category: "Operations", records: 8, format: "PDF" },
  ];

  const handleExportCSV = (title: string) => {
    addToast('CSV Export Initiated', `Generated spreadsheet report for: ${title}`, 'success');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              Enterprise Business Intelligence
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-white mt-1">Reports & Financial Analytics</h2>
          <p className="text-xs text-slate-400">
            Daily OP/IP counts, doctor revenue metrics, payment mode distribution, and audit summaries.
          </p>
        </div>

        <button
          onClick={() => handleExportCSV('Full Hospital Operations Audit')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md transition"
        >
          <Download className="w-4 h-4" />
          <span>Export All Master Reports (CSV)</span>
        </button>
      </div>

      {/* Reports Table */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-4">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-cyan-400" />
          Standard Hospital Reporting Suite
        </h3>

        <div className="space-y-2">
          {reportItems.map((rpt, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4 hover:border-slate-700 transition"
            >
              <div>
                <div className="text-sm font-bold text-slate-100">{rpt.title}</div>
                <div className="text-[10px] text-slate-400">
                  Category: {rpt.category} • Format: {rpt.format}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExportCSV(rpt.title)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold border border-slate-700 transition"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Download CSV</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

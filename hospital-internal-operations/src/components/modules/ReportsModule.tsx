import React from 'react';
import { useHospital } from '../../context/HospitalContext';
import { BarChart3, Download, FileSpreadsheet, ShieldCheck, FileText } from 'lucide-react';

export const ReportsModule: React.FC = () => {
  const { appointments, invoices, addToast } = useHospital();

  const reportItems = [
    { title: "System Audit Log & User Access Trail", category: "Compliance & Security", records: 34, format: "CSV / PDF", isAudit: true },
    { title: "Daily OP Consultation Register", category: "Clinical", records: appointments.length, format: "PDF / CSV" },
    { title: "Financial Collections & Cash Counter Ledger", category: "Finance", records: invoices.length, format: "Excel / PDF" },
    { title: "Discount & Concession Approval Audit Trail", category: "Workflow", records: 9, format: "CSV / PDF" },
    { title: "Specialty Doctor Revenue Contribution Report", category: "Executive", records: 5, format: "PDF" },
    { title: "TPA Insurance Pre-Auth & Settlement Analytics", category: "Insurance", records: 3, format: "CSV" },
    { title: "Inpatient Bed Occupancy & Discharge History", category: "Operations", records: 8, format: "PDF" },
  ];

  const triggerCSVDownload = (title: string) => {
    let csvContent = "";
    let filename = "";

    if (title.includes("Audit")) {
      filename = `bhaskar_reddy_hospital_audit_log_${new Date().toISOString().split('T')[0]}.csv`;
      csvContent = `Timestamp,User,Role,Module,Action,Status,IP_Address\n` +
        `2026-07-24 08:30:12,Rajesh V (Chief Admin),admin,Settings,Updated Tariff Config (ICU Bed ₹7500),Success,192.168.1.10\n` +
        `2026-07-24 09:15:45,Dr. Vikram Reddy,doctor,OPD,Digital Prescription Signed (BRH-2026-4421),Success,192.168.1.15\n` +
        `2026-07-24 10:00:22,Anil Kumar,billing,Workflow,Discount Approval Requested (₹15000),Success,192.168.1.22\n` +
        `2026-07-24 10:30:10,Rajesh V (Chief Admin),admin,Workflow,Approved Discount Request #appr-002,Success,192.168.1.10\n` +
        `2026-07-24 11:15:00,Sister Mary Joseph,nurse,MAR,Inj Heparin 5000 IU Administered (ICU-101),Success,192.168.1.40\n` +
        `2026-07-24 12:00:30,Dr. Sameer Khan,emergency,Emergency,Registered Medico-Legal Case MLC-2026-042,Success,192.168.1.33\n`;
    } else {
      filename = `${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
      csvContent = `Record_ID,Title,Category,Generated_Date,Status\n` +
        `REC-001,${title},General,${new Date().toISOString().split('T')[0]},Verified\n`;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast('CSV Download Started', `Downloaded file: ${filename}`, 'success');
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              Enterprise Reporting & Audit Repository
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-white mt-1">Reports & System Audit Trail</h2>
          <p className="text-xs text-slate-400">
            Downloadable audit logs, daily OP/IP registers, doctor revenue metrics, and compliance reports.
          </p>
        </div>

        <button
          onClick={() => triggerCSVDownload('System Audit Log & User Access Trail')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 transition"
        >
          <Download className="w-4 h-4" />
          <span>Download System Audit Log (CSV)</span>
        </button>
      </div>

      {/* Reports Table */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-4">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-cyan-400" />
          Downloadable Reports & Audit Logs
        </h3>

        <div className="space-y-2">
          {reportItems.map((rpt, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition ${
                rpt.isAudit ? 'bg-slate-950 border-emerald-500/40' : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-xl mt-0.5 ${rpt.isAudit ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                  {rpt.isAudit ? <ShieldCheck className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <span>{rpt.title}</span>
                    {rpt.isAudit && <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">SECURITY AUDIT</span>}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Category: {rpt.category} • Records: {rpt.records} • Format: {rpt.format}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => triggerCSVDownload(rpt.title)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    rpt.isAudit 
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                      : 'bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700'
                  }`}
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

import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import type { InsuranceClaim } from '../../types';
import { Search, Upload } from 'lucide-react';

export const InsuranceModule: React.FC = () => {
  const { insuranceClaims, addToast } = useHospital();
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredClaims = insuranceClaims.filter((claim) => {
    const matchStatus = selectedStatus === 'All' || claim.status === selectedStatus;
    const matchSearch =
      claim.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.claimNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.providerName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  const getStatusStyle = (status: InsuranceClaim['status']) => {
    switch (status) {
      case 'Pre-Auth Approved':
      case 'Claim Settled':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'Pre-Auth Submitted':
      case 'Documents Pending':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'Rejected':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/30">
              TPA Cashless Desk
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-white mt-1">Insurance & TPA Claims Management</h2>
          <p className="text-xs text-slate-400">
            Pre-Authorization tracking, document upload, sum insured verification, and claim settlement.
          </p>
        </div>

        <button
          onClick={() => addToast('Pre-Auth Form Launched', 'Upload insurance policy copy & estimation bill.', 'info')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/20 transition"
        >
          <Upload className="w-4 h-4" />
          <span>New Pre-Auth Request</span>
        </button>
      </div>

      {/* Analytics KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80">
          <div className="text-xs text-slate-400">Total Pre-Auth Amount Submitted</div>
          <div className="text-xl font-black text-white mt-1 font-mono">₹2,15,000</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80">
          <div className="text-xs text-slate-400">Approved TPA Cashless Limit</div>
          <div className="text-xl font-black text-emerald-400 mt-1 font-mono">₹1,50,000</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80">
          <div className="text-xs text-slate-400">Pending Authorization Cases</div>
          <div className="text-xl font-black text-amber-400 mt-1">
            {insuranceClaims.filter((c) => c.status === 'Pre-Auth Submitted').length} Cases
          </div>
        </div>
      </div>

      {/* Claims Roster Table */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {['All', 'Pre-Auth Submitted', 'Pre-Auth Approved', 'Claim Settled'].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  selectedStatus === st
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-950 text-slate-400 border border-slate-800'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search Claim #, Provider..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Claim #</th>
                <th className="py-2.5 px-3">Patient & Policy</th>
                <th className="py-2.5 px-3">Insurance & TPA Name</th>
                <th className="py-2.5 px-3">Pre-Auth Submitted</th>
                <th className="py-2.5 px-3">Approved Limit</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {filteredClaims.map((claim) => (
                <tr key={claim.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-3 font-mono font-bold text-purple-400">{claim.claimNo}</td>
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-100">{claim.patientName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      UHID: {claim.patientUhid} • Pol: {claim.policyNo}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-200">{claim.providerName}</div>
                    <div className="text-[10px] text-slate-400">TPA: {claim.tpaName}</div>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-slate-200">
                    ₹{claim.preAuthAmount.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-emerald-400">
                    ₹{claim.approvedAmount.toLocaleString()}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${getStatusStyle(claim.status)}`}>
                      {claim.status}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <button
                      onClick={() => addToast('Documents Verified', `Verified documents for ${claim.claimNo}`, 'info')}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-semibold border border-slate-700 transition"
                    >
                      Inspect Dossier
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

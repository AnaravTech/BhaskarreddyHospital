import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import { FileCheck2, Signature, Printer, ShieldCheck } from 'lucide-react';

export const ConsentFormsModule: React.FC = () => {
  const { consentForms, toggleConsentSignStatus } = useHospital();
  const [selectedFormId, setSelectedFormId] = useState(consentForms[0]?.id || '');
  const [signerName, setSignerName] = useState('');

  const selectedForm = consentForms.find((f) => f.id === selectedFormId);

  const handleSign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedForm || !signerName) return;

    toggleConsentSignStatus(selectedForm.id, signerName);
    setSignerName('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              Legal & Clinical Governance
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-white mt-1">Digital Patient Consent Forms</h2>
          <p className="text-xs text-slate-400">
            Digital signature capture, high-risk surgery consents, and immutable audit timestamps.
          </p>
        </div>

        <button
          onClick={() => alert('Printing digital consent form document with signature proof...')}
          disabled={!selectedForm}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold hover:bg-slate-700 transition"
        >
          <Printer className="w-4 h-4 text-cyan-400" />
          <span>Print Signed Consent</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left List */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-3">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-cyan-400" />
            Consent Documents ({consentForms.length})
          </h3>

          <div className="space-y-2">
            {consentForms.map((form) => {
              const isSelected = form.id === selectedFormId;
              return (
                <div
                  key={form.id}
                  onClick={() => setSelectedFormId(form.id)}
                  className={`p-3.5 rounded-xl border transition cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800/90 border-cyan-500/60 shadow-md'
                      : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-100">{form.formType}</span>
                    <span
                      className={`px-2 py-0.5 text-[9px] font-bold rounded ${
                        form.status === 'Signed'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {form.status}
                    </span>
                  </div>

                  <div className="mt-1 text-[11px] text-slate-400">
                    Patient: <span className="text-slate-200 font-semibold">{form.patientName}</span>
                  </div>
                  <div className="text-[10px] text-slate-500">{form.procedureName}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Form Workbench */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-6">
          {selectedForm ? (
            <>
              <div className="flex justify-between items-start pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-lg font-black text-white">{selectedForm.formType} Consent</h3>
                  <div className="text-xs text-slate-400">
                    Procedure: <span className="text-cyan-400 font-semibold">{selectedForm.procedureName}</span>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 text-xs font-bold rounded-xl border ${
                    selectedForm.status === 'Signed'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  }`}
                >
                  {selectedForm.status}
                </span>
              </div>

              {/* Legal Text Sample */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2 leading-relaxed font-mono">
                <p>
                  I, the undersigned, hereby give my voluntary informed consent to Dr.{' '}
                  <span className="text-cyan-300 font-bold">{selectedForm.doctorName}</span> and team at Bhaskar
                  Reddy Multi-Specialty Hospital to perform the clinical procedure:{' '}
                  <span className="text-cyan-300 font-bold">{selectedForm.procedureName}</span>.
                </p>
                <p className="text-[11px] text-slate-400">
                  I confirm that all potential clinical risks, anesthesia complications, and post-procedure protocols
                  have been explained in my primary language.
                </p>
              </div>

              {/* Signature Info / Digital Sign Form */}
              {selectedForm.status === 'Signed' ? (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-2 text-xs">
                  <div className="flex items-center gap-2 font-bold text-emerald-300">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    Digital Signature Verified & Stored
                  </div>
                  <div className="text-slate-300 space-y-1">
                    <div>
                      <span className="text-slate-500">Signed By:</span> {selectedForm.signedBy} ({selectedForm.relationship})
                    </div>
                    <div>
                      <span className="text-slate-500">Timestamp:</span> {selectedForm.signedTimestamp}
                    </div>
                    <div>
                      <span className="text-slate-500">SHA-256 Hash:</span>{' '}
                      <span className="font-mono text-[10px] text-slate-400">e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</span>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSign} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
                  <div className="font-bold text-slate-200 flex items-center gap-2">
                    <Signature className="w-4 h-4 text-cyan-400" /> Digital Signature Pad Simulation
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Full Name of Signatory (Patient / Next of Kin)</label>
                    <input
                      type="text"
                      placeholder="e.g. Prashanth Goud (Son)"
                      value={signerName}
                      onChange={(e) => setSignerName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                      required
                    />
                  </div>

                  <div className="p-6 rounded-xl border border-dashed border-slate-700 bg-slate-900 text-center text-slate-500 font-mono text-xs">
                    [ Touch / Mouse Signature Area Simulated ]
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition shadow-md"
                  >
                    Attach Digital Signature & Lock Consent
                  </button>
                </form>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs">
              Select a consent form to inspect digital signatures.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

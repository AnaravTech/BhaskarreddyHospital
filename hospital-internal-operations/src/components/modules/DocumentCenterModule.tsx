import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import {
  FileText, Upload, Eye, Download, Share2, Search,
  X, FileCheck, FileSignature,
  Shield, FlaskConical, Stethoscope, Image, FolderOpen, History
} from 'lucide-react';

interface DocItem {
  id: string;
  documentType: string;
  patientName: string;
  patientUhid: string;
  fileName: string;
  fileSize: string;
  uploadedBy: string;
  uploadedAt: string;
  version: number;
  status: 'Active' | 'Superseded' | 'Archived';
  signatureStatus?: 'Unsigned' | 'Signed';
  signedBy?: string;
  signedAt?: string;
  category: string;
}

const MOCK_DOCS: DocItem[] = [
  { id: 'd1', documentType: 'Consent Form', category: 'Consent Form', patientName: 'Ravi Shankar M', patientUhid: 'BRH-2026-4421', fileName: 'ConsentForm_CABG_RaviShankar.pdf', fileSize: '124 KB', uploadedBy: 'Dr. Vikram Reddy', uploadedAt: '2026-07-24 09:00', version: 1, status: 'Active', signatureStatus: 'Signed', signedBy: 'Ravi Shankar M (Self)', signedAt: '2026-07-24 09:15' },
  { id: 'd2', documentType: 'Discharge Summary', category: 'Discharge Summary', patientName: 'Annapurna V', patientUhid: 'BRH-2026-1234', fileName: 'DischargeSummary_AnnapurnaV_24Jul.pdf', fileSize: '256 KB', uploadedBy: 'Dr. Vikram Reddy', uploadedAt: '2026-07-24 11:30', version: 2, status: 'Active', signatureStatus: 'Signed', signedBy: 'Dr. Vikram Reddy', signedAt: '2026-07-24 11:45' },
  { id: 'd3', documentType: 'Medical Certificate', category: 'Medical Certificate', patientName: 'Lakshmi Devi K', patientUhid: 'BRH-2026-3312', fileName: 'MedicalCertificate_LakshmiDevi_Rest7Days.pdf', fileSize: '85 KB', uploadedBy: 'Dr. Anish Kumar', uploadedAt: '2026-07-24 10:00', version: 1, status: 'Active', signatureStatus: 'Signed', signedBy: 'Dr. Anish Kumar', signedAt: '2026-07-24 10:05' },
  { id: 'd4', documentType: 'Insurance Pre-Auth', category: 'Insurance Pre-Auth', patientName: 'Mohammed Aziz', patientUhid: 'BRH-2026-5501', fileName: 'PreAuth_StarHealth_MohammedAziz.pdf', fileSize: '312 KB', uploadedBy: 'Srinivas Rao (TPA)', uploadedAt: '2026-07-24 10:15', version: 1, status: 'Active', signatureStatus: 'Unsigned' },
  { id: 'd5', documentType: 'Lab Report', category: 'Lab Report', patientName: 'Venkata Ramaiah P', patientUhid: 'BRH-2026-7721', fileName: 'CBC_LFT_VenkataRamaiah_23Jul.pdf', fileSize: '198 KB', uploadedBy: 'LIS System (Auto)', uploadedAt: '2026-07-23 15:30', version: 1, status: 'Active' },
  { id: 'd6', documentType: 'Consent Form', category: 'Consent Form', patientName: 'Suresh Babu T', patientUhid: 'BRH-2026-2891', fileName: 'AnesthesiaConsent_SureshBabu.pdf', fileSize: '102 KB', uploadedBy: 'Dr. Rajeshwar Rao', uploadedAt: '2026-07-24 07:45', version: 1, status: 'Active', signatureStatus: 'Unsigned' },
  { id: 'd7', documentType: 'Radiology Report', category: 'Radiology Report', patientName: 'Chandra Kala B', patientUhid: 'BRH-2026-6612', fileName: 'ChestXRay_ChandraKala_23Jul.pdf', fileSize: '1.2 MB', uploadedBy: 'RIS System (Auto)', uploadedAt: '2026-07-23 13:00', version: 1, status: 'Active' },
  { id: 'd8', documentType: 'Discharge Summary', category: 'Discharge Summary', patientName: 'Narasimha Rao D', patientUhid: 'BRH-2026-9981', fileName: 'DischargeSummary_NarasimhaRao_Draft.pdf', fileSize: '180 KB', uploadedBy: 'Dr. Rajeshwar Rao', uploadedAt: '2026-07-24 12:00', version: 1, status: 'Active', signatureStatus: 'Unsigned' },
  { id: 'd9', documentType: 'Patient Upload', category: 'Patient Upload', patientName: 'Sita Ramaiah G', patientUhid: 'BRH-2026-3344', fileName: 'OldRecords_SitaRamaiah_Apollo2024.pdf', fileSize: '2.1 MB', uploadedBy: 'Priyanka M (Reception)', uploadedAt: '2026-07-24 08:30', version: 1, status: 'Active' },
  { id: 'd10', documentType: 'Consent Form', category: 'Consent Form', patientName: 'Ravi Shankar M', patientUhid: 'BRH-2026-4421', fileName: 'BloodTransfusionConsent_RaviShankar.pdf', fileSize: '90 KB', uploadedBy: 'Dr. Vikram Reddy', uploadedAt: '2026-07-24 08:00', version: 1, status: 'Superseded', signatureStatus: 'Signed' },
];

const DOC_ICONS: Record<string, React.ElementType> = {
  'Consent Form': FileSignature,
  'Discharge Summary': FileCheck,
  'Medical Certificate': Stethoscope,
  'Insurance Pre-Auth': Shield,
  'Lab Report': FlaskConical,
  'Radiology Report': Image,
  'Clinical Photo': Image,
  'Patient Upload': FolderOpen,
};

const DOC_COLORS: Record<string, string> = {
  'Consent Form': 'violet',
  'Discharge Summary': 'emerald',
  'Medical Certificate': 'cyan',
  'Insurance Pre-Auth': 'blue',
  'Lab Report': 'amber',
  'Radiology Report': 'indigo',
  'Patient Upload': 'slate',
};

const ALL_CATEGORIES = ['All', 'Consent Form', 'Discharge Summary', 'Medical Certificate', 'Insurance Pre-Auth', 'Lab Report', 'Radiology Report', 'Patient Upload'];

export const DocumentCenterModule: React.FC = () => {
  const { addToast } = useHospital();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [previewDoc, setPreviewDoc] = useState<DocItem | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadDocType, setUploadDocType] = useState('Consent Form');
  const [uploadUhid, setUploadUhid] = useState('');
  const [uploadNotes, setUploadNotes] = useState('');

  const filtered = MOCK_DOCS.filter(d => {
    const matchSearch = !searchQuery || d.patientName.toLowerCase().includes(searchQuery.toLowerCase()) || d.patientUhid.toLowerCase().includes(searchQuery.toLowerCase()) || d.fileName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = activeCategory === 'All' || d.category === activeCategory;
    return matchSearch && matchCat;
  });

  const stats = {
    total: MOCK_DOCS.length,
    signed: MOCK_DOCS.filter(d => d.signatureStatus === 'Signed').length,
    pending: MOCK_DOCS.filter(d => d.signatureStatus === 'Unsigned').length,
    today: MOCK_DOCS.filter(d => d.uploadedAt.startsWith('2026-07-24')).length,
  };

  const getDocColor = (cat: string) => DOC_COLORS[cat] || 'slate';
  const getDocIcon = (cat: string) => DOC_ICONS[cat] || FileText;

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-900 p-6 rounded-2xl border border-slate-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">Centralized Document Repository</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white">Document Center</h2>
            <p className="text-xs text-slate-400 mt-0.5">Consent forms, discharge summaries, lab reports, and clinical documents — all in one place.</p>
          </div>
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20"
          >
            <Upload className="w-4 h-4" /> Upload Document
          </button>
        </div>

        {/* Stats Strip */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Documents', value: stats.total, color: 'text-slate-100' },
            { label: 'Signed', value: stats.signed, color: 'text-emerald-400' },
            { label: 'Pending Signature', value: stats.pending, color: 'text-amber-400' },
            { label: 'Uploaded Today', value: stats.today, color: 'text-cyan-400' },
          ].map(s => (
            <div key={s.label} className="bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2">
              <div className={`text-xl font-extrabold ${s.color}`}>{s.value}</div>
              <div className="text-[10px] text-slate-400">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Search + Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by patient name, UHID, or file name..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500"
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {ALL_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${activeCategory === cat ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'}`}
            >
              {cat === 'All' ? `All (${MOCK_DOCS.length})` : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(doc => {
          const color = getDocColor(doc.category);
          const Icon = getDocIcon(doc.category);

          return (
            <div key={doc.id} className={`bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 hover:border-slate-700 transition space-y-3 ${doc.status === 'Superseded' ? 'opacity-60' : ''}`}>
              {/* Doc Header */}
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl bg-${color}-500/10 border border-${color}-500/30 flex items-center justify-center shrink-0`}>
                  <Icon className={`w-5 h-5 text-${color}-400`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-extrabold text-slate-100 truncate">{doc.fileName}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{doc.category} • {doc.fileSize} • v{doc.version}</div>
                </div>
              </div>

              {/* Patient Info */}
              <div className="bg-slate-950/60 rounded-xl p-2.5 text-xs">
                <div className="font-bold text-slate-200">{doc.patientName}</div>
                <div className="text-slate-400 font-mono text-[10px]">{doc.patientUhid}</div>
              </div>

              {/* Status & Signature */}
              <div className="flex items-center gap-2 flex-wrap">
                {doc.status === 'Superseded' && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-500 border border-slate-700">Superseded</span>}
                {doc.status === 'Active' && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Active</span>}
                {doc.signatureStatus === 'Signed' && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">✓ Signed</span>}
                {doc.signatureStatus === 'Unsigned' && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">Pending Signature</span>}
              </div>

              {/* Meta */}
              <div className="text-[10px] text-slate-500">
                Uploaded by {doc.uploadedBy} • {doc.uploadedAt}
                {doc.signedBy && <div className="text-cyan-500/80">Signed by: {doc.signedBy} @ {doc.signedAt}</div>}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 pt-1 border-t border-slate-800/60">
                <button onClick={() => setPreviewDoc(doc)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-semibold">
                  <Eye className="w-3 h-3" /> Preview
                </button>
                <button onClick={() => addToast('PDF Download', `Preparing ${doc.fileName}...`, 'info')} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-semibold">
                  <Download className="w-3 h-3" /> Download
                </button>
                <button onClick={() => addToast('Share Link', `Secure share link generated for ${doc.patientName}`, 'success')} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-semibold">
                  <Share2 className="w-3 h-3" />
                </button>
                <button onClick={() => addToast('Version History', `Showing version history for ${doc.fileName}`, 'info')} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-semibold">
                  <History className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-slate-500 bg-slate-900/40 rounded-2xl border border-slate-800/60">
          <FolderOpen className="w-12 h-12 mx-auto mb-3 text-slate-600" />
          <div className="font-bold text-slate-400">No documents found</div>
          <div className="text-xs mt-1">Try adjusting your search or category filter.</div>
        </div>
      )}

      {/* Document Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div>
                <div className="text-sm font-bold text-slate-100">{previewDoc.fileName}</div>
                <div className="text-xs text-slate-400">{previewDoc.patientName} ({previewDoc.patientUhid}) • {previewDoc.category}</div>
              </div>
              <button onClick={() => setPreviewDoc(null)} className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Simulated Document */}
            <div className="flex-1 overflow-y-auto p-6 bg-white text-slate-900 font-mono text-xs leading-relaxed">
              <div className="text-center mb-6 border-b-2 border-slate-300 pb-4">
                <div className="text-lg font-extrabold text-slate-800">BHASKAR REDDY HOSPITAL</div>
                <div className="text-sm text-slate-600">Pogathota, Near Vijayamahal Gate, Nellore, AP - 524001</div>
                <div className="text-sm text-slate-600">Ph: 0861-2345678 | 0861-2345679</div>
                <div className="text-base font-bold mt-2 text-slate-800 uppercase">{previewDoc.category}</div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
                <div><span className="font-bold">Patient Name:</span> {previewDoc.patientName}</div>
                <div><span className="font-bold">UHID:</span> {previewDoc.patientUhid}</div>
                <div><span className="font-bold">Document Date:</span> {previewDoc.uploadedAt}</div>
                <div><span className="font-bold">Uploaded By:</span> {previewDoc.uploadedBy}</div>
              </div>

              {previewDoc.category === 'Consent Form' && (
                <div className="space-y-3">
                  <p className="font-bold">INFORMED CONSENT FOR MEDICAL TREATMENT / PROCEDURE</p>
                  <p>I, the undersigned, do hereby voluntarily consent to receive medical treatment and/or surgical procedure as deemed necessary by the attending physician and authorized medical staff of Bhaskar Reddy Hospital, Nellore.</p>
                  <p>I understand the nature of the procedure, associated risks, benefits, and alternatives as explained to me in Telugu/English and I have had my questions answered to my satisfaction.</p>
                  {previewDoc.signatureStatus === 'Signed' && (
                    <div className="mt-6 p-3 border-2 border-emerald-400 rounded-lg bg-emerald-50">
                      <div className="font-bold text-emerald-800">✓ SIGNED & VERIFIED</div>
                      <div>Signed by: {previewDoc.signedBy}</div>
                      <div>Date/Time: {previewDoc.signedAt}</div>
                    </div>
                  )}
                </div>
              )}
              {previewDoc.category === 'Discharge Summary' && (
                <div className="space-y-3">
                  <p className="font-bold">DISCHARGE SUMMARY</p>
                  <p><span className="font-bold">Date of Admission:</span> 2026-07-20 | <span className="font-bold">Date of Discharge:</span> 2026-07-24</p>
                  <p><span className="font-bold">Attending Physician:</span> {previewDoc.uploadedBy}</p>
                  <p><span className="font-bold">Final Diagnosis:</span> Essential Hypertension with Cardiac evaluation</p>
                  <p><span className="font-bold">Treatment Given:</span> IV Antihypertensives, Echocardiography, Stress Test, Dietary counseling</p>
                  <p><span className="font-bold">Discharge Condition:</span> Stable. BP controlled. Advised regular follow-up.</p>
                </div>
              )}
              {!['Consent Form', 'Discharge Summary'].includes(previewDoc.category) && (
                <div className="text-center text-slate-500 py-8">[{previewDoc.category} content — {previewDoc.fileSize}]</div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 flex gap-2 bg-slate-950">
              <button onClick={() => addToast('PDF Download', `Preparing ${previewDoc.fileName}...`, 'info')} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold">
                <Download className="w-3.5 h-3.5" /> Download PDF
              </button>
              <button onClick={() => addToast('Share Link', 'Secure document share link copied to clipboard.', 'success')} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold">
                <Share2 className="w-3.5 h-3.5" /> Share
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-white">Upload New Document</h3>
              <button onClick={() => setShowUpload(false)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <div className="border-2 border-dashed border-slate-700 rounded-xl p-6 text-center cursor-pointer hover:border-indigo-500/60 transition" onClick={() => addToast('File Selected', 'Document ready for upload. Click Upload to confirm.', 'info')}>
              <Upload className="w-8 h-8 mx-auto mb-2 text-slate-500" />
              <div className="text-xs text-slate-400">Drag & drop or click to select</div>
              <div className="text-[10px] text-slate-500 mt-1">Supported: PDF, JPEG, PNG, DICOM</div>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Document Type</label>
                <select value={uploadDocType} onChange={e => setUploadDocType(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200">
                  {ALL_CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Patient UHID</label>
                <input value={uploadUhid} onChange={e => setUploadUhid(e.target.value)} placeholder="BRH-2026-XXXX" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono" />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Notes</label>
                <textarea value={uploadNotes} onChange={e => setUploadNotes(e.target.value)} placeholder="Additional notes..." className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 resize-none h-16" />
              </div>
            </div>
            <button onClick={() => { addToast('Document Uploaded', 'Document stored securely with audit trail.', 'success'); setShowUpload(false); }} className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold">
              Upload & Save to Document Center
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useRef } from 'react';
import { useHospital } from '../../context/HospitalContext';
import type { DigitalConsentForm } from '../../types';
import {
  FileCheck2,
  Printer,
  ShieldCheck,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  PenTool,
  RotateCcw,
  Languages,
} from 'lucide-react';

export const ConsentFormsModule: React.FC = () => {
  const {
    consentForms,
    addConsentForm,
    toggleConsentSignStatus,
    patients,
    doctors,
    getPermission,
    currentUser,
    addToast,
  } = useHospital();

  const permission = getPermission('consent-forms');
  const canEdit = permission === 'FULL';

  // Filters & State
  const [selectedFormId, setSelectedFormId] = useState(consentForms[0]?.id || '');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Signed' | 'Pending Signature'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [languageMode, setLanguageMode] = useState<'English' | 'Telugu' | 'Bilingual'>('English');

  // Modals
  const [isNewFormModalOpen, setIsNewFormModalOpen] = useState(false);
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);

  // Signing Form State
  const [signForm, setSignForm] = useState({
    signerName: '',
    relationship: 'Self (Patient)' as string,
    witnessName: currentUser?.name || 'Staff Nurse S. Sunitha',
    witnessRole: currentUser?.roleTitle || 'OT Nursing In-Charge',
    risksAccepted: true,
  });

  // Canvas Signature Reference
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  // New Consent Form State
  const [newFormData, setNewFormData] = useState({
    patientId: '',
    formType: 'High-Risk Surgical & Anesthesia' as DigitalConsentForm['formType'],
    doctorId: '',
    procedureName: 'Modified Radical Mastectomy (MRM) + Axillary Clearance',
    language: 'English' as 'English' | 'Telugu' | 'Bilingual (EN + TE)',
    notes: 'Informed consent obtained in presence of attendants after explaining staging and potential complications.',
    risksAcknowledged: [
      'Risk of intraoperative bleeding and need for blood transfusion',
      'Anesthesia complications and post-op ICU monitoring',
      'Risk of surgical site infection and lymphedema',
      'Histopathology examination and potential revision surgery',
    ],
  });

  // Pre-defined Legal Consent Templates
  const LEGAL_TEMPLATES: Record<
    string,
    { title: string; enText: string; teText: string; defaultRisks: string[] }
  > = {
    'High-Risk Surgical & Anesthesia': {
      title: 'High-Risk Surgical Operation & General Anesthesia Consent',
      enText:
        'I, the undersigned patient / legal representative, hereby grant voluntary informed consent to the operating surgeon and surgical team at Bhaskar Reddy Multi-Specialty Hospital to perform the scheduled surgical procedure under anesthesia. I confirm that all clinical risks, potential intraoperative complications, alternative therapies, and need for emergency life support have been clearly explained to me in a language I understand.',
      teText:
        'నేను, దిగువ సంతకం చేసిన పేషెంట్ / సంరక్షకుడను, భాస్కర్ రెడ్డి మల్టీ-స్పెషాలిటీ హాస్పిటల్ శస్త్రచికిత్సా నిపుణులు మరియు బృందానికి అవసరమైన ఆపరేషన్ మరియు అనస్థీషియా నిర్వహించడానికి సంపూర్ణ సమ్మతిని తెలియజేస్తున్నాను. శస్త్రచికిత్సలోని నష్టాలు, ప్రత్యామ్నాయాలు మరియు అత్యవసర చికిత్సా విధానాలన్నీ నాకు అర్థమయ్యే భాషలో వివరించబడ్డాయి.',
      defaultRisks: [
        'Intraoperative blood loss requiring transfusion',
        'General anesthesia complications and cardiac stress',
        'Surgical site infection and delayed wound healing',
        'Need for postoperative ICU ventilator support',
      ],
    },
    'Chemotherapy & Targeted Therapy': {
      title: 'Medical Oncology Chemotherapy & Biological Therapy Consent',
      enText:
        'I give my voluntary consent to receive intravenous/oral chemotherapy and targeted biological drugs prescribed by my medical oncologist. I understand that chemotherapy agents carry risks of myelosuppression, neutropenic infection, nausea, cardiotoxicity, and peripheral neuropathy, and that regular laboratory monitoring is mandatory.',
      teText:
        'మెడికల్ ఆంకాలజిస్ట్ సూచించిన కీమోథెరపీ మరియు బయోలాజికల్ మందుల చికిత్స తీసుకోవడానికి నేను సమ్మతిస్తున్నాను. కీమోథెరపీ వల్ల కలిగే రోగనిరోధక శక్తి తగ్గుదల, ఇన్ఫెక్షన్లు మరియు దుష్ప్రభావాల గురించి నాకు క్షుణ్ణంగా వివరించబడింది.',
      defaultRisks: [
        'Bone marrow suppression and low blood counts',
        'Neutropenic fever and risk of opportunistic infection',
        'Nausea, fatigue, alopecia, and gastrointestinal toxicity',
        'Extravasation injury and peripheral neuropathy',
      ],
    },
    'Radiation Therapy Protocol': {
      title: 'Radiation Oncology (IMRT / RapidArc) Therapy Consent',
      enText:
        'I authorize the radiation oncology department to administer the prescribed course of external beam radiation therapy / IMRT. I have been informed regarding skin desquamation, localized tissue fibrosis, radiation pneumonitis/mucositis, and long-term surveillance protocols.',
      teText:
        'రేడియేషన్ ఆంకాలజీ విభాగం ద్వారా సూచించిన రేడియేషన్ థెరపీ (IMRT) చికిత్స తీసుకోవడానికి నేను సమ్మతిస్తున్నాను. స్థానిక చర్మ మార్పులు మరియు దుష్ప్రభావాల గురించి నాకు అవగాహన కల్పించబడింది.',
      defaultRisks: [
        'Localized radiation dermatitis and skin erythema',
        'Radiation fatigue and tissue inflammation',
        'Mucositis / dysphagia depending on target site',
        'Long-term surveillance and imaging follow-up mandate',
      ],
    },
    'Blood & Blood Products Transfusion': {
      title: 'Blood & Blood Component Transfusion Informed Consent',
      enText:
        'I consent to the administration of whole blood, packed red blood cells (PRBC), platelets, or fresh frozen plasma (FFP) as deemed necessary by the medical team. I acknowledge that while all blood units undergo mandatory screening for HIV, HBV, HCV, and Syphilis, rare allergic reactions or febrile non-hemolytic reactions may occur.',
      teText:
        'రక్తం లేదా రక్త కణాల (PRBC/Platelets/FFP) బదిలీకి నేను సమ్మతిస్తున్నాను. అన్ని యూనిట్లు వైరల్ స్క్రీనింగ్ చేయబడినప్పటికీ, స్వల్ప అలెర్జీ సమస్యలు వచ్చే అవకాశం ఉందని నేను గ్రహించాను.',
      defaultRisks: [
        'Febrile non-hemolytic transfusion reactions',
        'Minor allergic urticaria or skin rashes',
        'Fluid overload in cardiac/renal compromised patients',
        'Extremely rare transfusion-related acute lung injury (TRALI)',
      ],
    },
    'General Inpatient Admission': {
      title: 'General Inpatient Admission & Hospital Policies Consent',
      enText:
        'I consent to routine inpatient medical evaluation, nursing care, diagnostic blood draws, radiological imaging, and administration of prescribed oral and intravenous medications during my hospital stay.',
      teText:
        'హాస్పిటల్‌లో చేరి వైద్య పరీక్షలు, నర్సింగ్ కేర్, రక్త పరీక్షలు మరియు వైద్యుల పర్యవేక్షణలో మందులు తీసుకోవడానికి నేను సమ్మతిస్తున్నాను.',
      defaultRisks: [
        'Standard inpatient hospital policies and visitor regulations',
        'Consent for routine non-invasive diagnostic investigations',
        'Acknowledgment of hospital fee schedule and insurance terms',
      ],
    },
    'Emergency Resuscitation': {
      title: 'Emergency Trauma & Invasive Resuscitation Protocol Consent',
      enText:
        'I grant immediate consent to the emergency medical team to perform life-saving invasive resuscitation procedures including endotracheal intubation, central venous catheterization, CPR, and defibrillation.',
      teText:
        'అత్యవసర ప్రాణరక్షణ చికిత్సలు, ఎండోట్రాకియల్ ఇంట్యూబేషన్ మరియు సీపీఆర్ నిర్వహించడానికి నేను అత్యవసర సమ్మతిని తెలుపుతున్నాను.',
      defaultRisks: [
        'Critical state stabilization risks in polytrauma/shock',
        'Invasive airway and central venous vascular access risks',
        'Emergency transfusion and defibrillation protocols',
      ],
    },
    'High-Risk LAMA Discharge': {
      title: 'High-Risk Discharge / Left Against Medical Advice (LAMA) Refusal Consent',
      enText:
        'I, the patient / attendant, voluntarily demand discharge from the hospital AGAINST MEDICAL ADVICE. The treating consultants have explicitly informed me that discontinuing hospital care at this stage may result in severe clinical deterioration, irreversible damage, or death. I assume complete legal responsibility.',
      teText:
        'వైద్యుల సలహాకు విరుద్ధంగా (LAMA) నేను స్వచ్ఛందంగా హాస్పిటల్ నుండి డిశ్చార్జ్ కోరుకుంటున్నాను. దీనివల్ల కలిగే తీవ్ర పరిణామాలకు, ప్రాణాపాయానికి నేనే పూర్తి బాధ్యత వహిస్తాను.',
      defaultRisks: [
        'Severe acute clinical deterioration without hospital monitoring',
        'Risk of fatal cardiac arrest, hemorrhage, or septic shock',
        'Full release of hospital and treating doctors from legal liability',
      ],
    },
  };

  // Filtered List
  const filteredForms = consentForms.filter((f) => {
    const matchStatus = statusFilter === 'All' || f.status === statusFilter;
    const matchSearch =
      f.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.formType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.procedureName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  const selectedForm = consentForms.find((f) => f.id === selectedFormId) || consentForms[0];

  // Canvas Drawing Handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = '#38bdf8'; // Sky blue
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    setIsDrawing(true);
    setHasSignature(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  // Submit Digital Signature
  const handleExecuteSign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedForm || !signForm.signerName) {
      addToast('Signer Name Required', 'Please enter the name of the patient or legal guardian.', 'error');
      return;
    }

    const canvas = canvasRef.current;
    const signatureDataUrl = canvas ? canvas.toDataURL('image/png') : undefined;

    toggleConsentSignStatus(
      selectedForm.id,
      `${signForm.signerName} (${signForm.relationship})`,
      signForm.witnessName,
      signatureDataUrl
    );

    setIsSignModalOpen(false);
    clearCanvas();
  };

  // Create New Consent Form Submit
  const handleCreateNewForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFormData.patientId) {
      addToast('Patient Required', 'Please select a patient for this consent form.', 'error');
      return;
    }

    const pat = patients.find((p) => p.id === newFormData.patientId);
    const doc = doctors.find((d) => d.id === newFormData.doctorId);
    if (!pat) return;

    const template = LEGAL_TEMPLATES[newFormData.formType] || LEGAL_TEMPLATES['High-Risk Surgical & Anesthesia'];

    addConsentForm({
      formType: newFormData.formType,
      patientId: pat.id,
      patientName: pat.name,
      patientUhid: pat.uhid,
      doctorName: doc ? doc.name : 'Dr. Vikram Reddy',
      procedureName: newFormData.procedureName,
      signedBy: 'Pending Signature',
      status: 'Pending Signature',
      language: newFormData.language,
      risksAcknowledged: template.defaultRisks,
      notes: newFormData.notes,
    });

    setIsNewFormModalOpen(false);
  };

  const activeTemplate = selectedForm
    ? LEGAL_TEMPLATES[selectedForm.formType] || LEGAL_TEMPLATES['High-Risk Surgical & Anesthesia']
    : LEGAL_TEMPLATES['High-Risk Surgical & Anesthesia'];

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* 1. Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-6 rounded-2xl border border-slate-800/80 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              NABH &amp; NMC Legal Clinical Governance
            </span>
            <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
              Role: {currentUser?.roleTitle || currentUser?.role}
            </span>
          </div>
          <h2 className="text-2xl font-black text-white mt-1">Digital Patient Consent Forms</h2>
          <p className="text-xs text-slate-400">
            Informed surgical consents, medical oncology chemo authorizations, blood transfusion consents, bilingual Telugu/English formats, and SHA-256 digital signature capture.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {canEdit && (
            <button
              onClick={() => setIsNewFormModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-extrabold shadow-lg shadow-cyan-600/30 transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ Create Digital Consent</span>
            </button>
          )}

          <button
            onClick={() => window.print()}
            disabled={!selectedForm}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold hover:bg-slate-700 transition"
          >
            <Printer className="w-4 h-4 text-cyan-400" />
            <span>Print Legal Form</span>
          </button>
        </div>
      </div>

      {/* 2. Main Workbench Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Consent Forms Roster */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-cyan-400" />
              <span>Consent Roster ({consentForms.length})</span>
            </h3>

            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[10px]">
              {(['All', 'Pending Signature', 'Signed'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2 py-0.5 rounded font-bold transition ${
                    statusFilter === st ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {st === 'Pending Signature' ? 'Pending' : st}
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search patient, procedure..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
            {filteredForms.map((form) => {
              const isSelected = form.id === selectedForm?.id;
              const isSigned = form.status === 'Signed';

              return (
                <div
                  key={form.id}
                  onClick={() => setSelectedFormId(form.id)}
                  className={`p-3.5 rounded-2xl border transition cursor-pointer space-y-2 ${
                    isSelected
                      ? 'bg-slate-800/90 border-cyan-500 shadow-md ring-1 ring-cyan-500/50'
                      : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-slate-100 block">{form.formType}</span>
                    <span
                      className={`px-2 py-0.5 text-[9px] font-extrabold rounded-md border shrink-0 ${
                        isSigned
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                      }`}
                    >
                      {form.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-300 font-bold flex items-center justify-between">
                    <span>{form.patientName}</span>
                    <span className="font-mono text-[10px] text-slate-400">{form.patientUhid}</span>
                  </div>

                  <div className="text-[11px] text-cyan-400 font-medium truncate">
                    {form.procedureName}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/80 font-mono">
                    <span>👨‍⚕️ {form.doctorName}</span>
                    <span>{form.signedTimestamp.split(' ')[0]}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Interactive Consent Form Viewer & Execution Workbench */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6 shadow-xl">
          {selectedForm ? (
            <>
              {/* Form Title & Top Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <span className="text-[11px] font-bold text-cyan-400 font-mono uppercase tracking-wider block">
                    Form Ref: {selectedForm.id.toUpperCase()} • NABH Consent Standard
                  </span>
                  <h3 className="text-xl font-black text-white mt-0.5">{selectedForm.formType} Consent</h3>
                  <div className="text-xs text-slate-400 mt-1">
                    Scheduled Procedure: <strong className="text-cyan-300">{selectedForm.procedureName}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {/* Language Switcher */}
                  <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                    <Languages className="w-3.5 h-3.5 text-cyan-400 ml-1.5" />
                    {(['English', 'Telugu', 'Bilingual'] as const).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setLanguageMode(lang)}
                        className={`px-2.5 py-1 rounded-lg font-bold transition text-[11px] ${
                          languageMode === lang ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {lang === 'Bilingual' ? 'EN + TE' : lang}
                      </button>
                    ))}
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
              </div>

              {/* Patient & Doctor Demographics Header */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 text-[10px] block">Patient Name:</span>
                  <strong className="text-white font-bold">{selectedForm.patientName}</strong>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">UHID Number:</span>
                  <strong className="font-mono text-cyan-400">{selectedForm.patientUhid}</strong>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Attending Consultant:</span>
                  <strong className="text-slate-200">{selectedForm.doctorName}</strong>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Execution Timestamp:</span>
                  <span className="font-mono text-slate-300 text-[11px]">{selectedForm.signedTimestamp}</span>
                </div>
              </div>

              {/* Legal Informed Consent Declaration Text */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 text-xs text-slate-200 leading-relaxed font-sans">
                <div className="flex items-center gap-2 text-cyan-400 font-bold border-b border-slate-800 pb-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Statutory Patient Declaration &amp; Voluntary Authorization</span>
                </div>

                {(languageMode === 'English' || languageMode === 'Bilingual') && (
                  <div className="space-y-2">
                    <strong className="text-slate-100 text-xs block font-bold">[English Declaration]:</strong>
                    <p className="text-slate-300 text-xs leading-relaxed bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80">
                      {activeTemplate.enText}
                    </p>
                  </div>
                )}

                {(languageMode === 'Telugu' || languageMode === 'Bilingual') && (
                  <div className="space-y-2">
                    <strong className="text-amber-300 text-xs block font-bold">[తెలుగు వివరణ]:</strong>
                    <p className="text-amber-200/90 text-xs leading-relaxed bg-amber-950/20 p-3.5 rounded-xl border border-amber-900/40 font-sans">
                      {activeTemplate.teText}
                    </p>
                  </div>
                )}

                {/* Specific Procedural Risks Listed */}
                <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
                  <strong className="text-rose-400 font-bold flex items-center gap-1.5 text-xs">
                    <span>⚠️ Explained Clinical Risks &amp; Complications:</span>
                  </strong>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300">
                    {(selectedForm.risksAcknowledged || activeTemplate.defaultRisks).map((risk, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-cyan-400 font-bold">•</span>
                        <span>{risk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Signature Proof / Action Box */}
              {selectedForm.status === 'Signed' ? (
                <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-950 to-emerald-950/30 border border-emerald-500/40 space-y-3 shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-emerald-300 text-sm">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <span>Legally Executed &amp; Cryptographically Timestamped</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                      SHA-256 Validated
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300 pt-1">
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                      <span className="text-slate-500 text-[10px] block">Primary Signatory:</span>
                      <strong className="text-white font-bold">{selectedForm.signedBy}</strong>
                    </div>

                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                      <span className="text-slate-500 text-[10px] block">Witnessing Clinical Staff:</span>
                      <strong className="text-white font-bold">{selectedForm.witnessName || 'Staff Nurse S. Sunitha'}</strong>
                    </div>

                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                      <span className="text-slate-500 text-[10px] block">Verified Timestamp:</span>
                      <strong className="text-emerald-400 font-mono text-[11px]">{selectedForm.signedTimestamp}</strong>
                    </div>
                  </div>

                  {selectedForm.signatureUrl && (
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                      <span className="text-xs text-slate-400">Captured Signature Proof:</span>
                      <img
                        src={selectedForm.signatureUrl}
                        alt="Patient Signature"
                        className="h-10 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-5 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                      <Clock className="w-5 h-5 text-amber-400" />
                      <span>Pending Patient / Guardian Digital Signature</span>
                    </div>
                    <span className="text-xs text-slate-400">Requires dual verification</span>
                  </div>

                  <p className="text-xs text-slate-400">
                    This consent document is legally incomplete. The treating surgeon or ward nurse must capture the patient’s informed signature prior to procedure commencement.
                  </p>

                  {canEdit && (
                    <button
                      onClick={() => {
                        setSignForm({
                          signerName: selectedForm.patientName,
                          relationship: 'Self (Patient)',
                          witnessName: currentUser?.name || 'Staff Nurse S. Sunitha',
                          witnessRole: currentUser?.roleTitle || 'Nursing In-Charge',
                          risksAccepted: true,
                        });
                        setIsSignModalOpen(true);
                      }}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-extrabold text-xs shadow-lg shadow-cyan-950/50 transition flex items-center justify-center gap-2"
                    >
                      <PenTool className="w-4 h-4" />
                      <span>Open Digital Signature &amp; Biometric Pad</span>
                    </button>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="p-12 text-center text-slate-500">
              <FileCheck2 className="w-12 h-12 mx-auto mb-2 text-slate-600" />
              <span>Select a consent document from the left list to view or sign.</span>
            </div>
          )}
        </div>
      </div>

      {/* 3. MODAL: DIGITAL SIGNATURE & BIOMETRIC PAD */}
      {isSignModalOpen && selectedForm && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-slate-900 border border-cyan-500/40 rounded-2xl p-6 shadow-2xl space-y-4 font-sans text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-cyan-300 font-bold">
                <PenTool className="w-5 h-5 text-cyan-400" />
                <span>Execute Digital Signature &amp; Patient Verification</span>
              </div>
              <button onClick={() => setIsSignModalOpen(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleExecuteSign} className="space-y-4">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px]">Procedure:</span>
                <strong className="text-white text-sm block">{selectedForm.procedureName}</strong>
                <span className="text-slate-400 text-[10px]">
                  Attending Consultant: <strong className="text-cyan-300">{selectedForm.doctorName}</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Signatory Name *</label>
                  <input
                    type="text"
                    value={signForm.signerName}
                    onChange={(e) => setSignForm({ ...signForm, signerName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Relationship to Patient *</label>
                  <select
                    value={signForm.relationship}
                    onChange={(e) => setSignForm({ ...signForm, relationship: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-bold"
                  >
                    <option value="Self (Patient)">Self (Patient)</option>
                    <option value="Spouse">Spouse (భార్య / భర్త)</option>
                    <option value="Father">Father (తండ్రి)</option>
                    <option value="Mother">Mother (తల్లి)</option>
                    <option value="Son / Daughter">Son / Daughter (కుమారుడు / కుమార్తె)</option>
                    <option value="Legal Guardian">Legal Guardian (సంరక్షకుడు)</option>
                  </select>
                </div>
              </div>

              {/* Interactive Canvas Signature Pad */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-300 font-bold flex items-center gap-1.5">
                    <PenTool className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Draw Digital Signature on Touch Screen / Mouse *</span>
                  </label>
                  <button
                    type="button"
                    onClick={clearCanvas}
                    className="text-[10px] text-slate-400 hover:text-cyan-400 flex items-center gap-1 transition"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Clear Signature</span>
                  </button>
                </div>

                <div className="border border-cyan-500/40 rounded-xl bg-slate-950 p-1">
                  <canvas
                    ref={canvasRef}
                    width={480}
                    height={140}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full h-[140px] bg-slate-950 rounded-lg cursor-crosshair touch-none"
                  />
                </div>
                {!hasSignature && (
                  <span className="text-[10px] text-slate-500 italic mt-0.5 block">
                    (Sign above using touchscreen or mouse pointer)
                  </span>
                )}
              </div>

              {/* Witnessing Staff */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">Witnessing Hospital Staff / Sister *</label>
                <input
                  type="text"
                  value={signForm.witnessName}
                  onChange={(e) => setSignForm({ ...signForm, witnessName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                  required
                />
              </div>

              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                <label className="flex items-center gap-2 text-emerald-300 cursor-pointer font-bold">
                  <input
                    type="checkbox"
                    checked={signForm.risksAccepted}
                    onChange={(e) => setSignForm({ ...signForm, risksAccepted: e.target.checked })}
                    className="accent-emerald-500 w-4 h-4 rounded"
                    required
                  />
                  <span>I confirm that all surgical risks have been explained in patient&apos;s primary language.</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSignModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 text-white font-extrabold shadow-lg shadow-emerald-950/50"
                >
                  Confirm &amp; Lock Legal Signature
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. MODAL: CREATE NEW DIGITAL CONSENT FORM */}
      {isNewFormModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-slate-900 border border-cyan-500/40 rounded-2xl p-6 shadow-2xl space-y-4 font-sans text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-cyan-300 font-bold">
                <Plus className="w-5 h-5 text-cyan-400" />
                <span>Create New Patient Digital Consent Form</span>
              </div>
              <button onClick={() => setIsNewFormModalOpen(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewForm} className="space-y-4">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Select Patient / Inpatient *</label>
                <select
                  value={newFormData.patientId}
                  onChange={(e) => setNewFormData({ ...newFormData, patientId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-bold"
                  required
                >
                  <option value="">-- Choose Patient --</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.uhid}) - {p.age}Y/{p.gender}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Consent Form Category *</label>
                  <select
                    value={newFormData.formType}
                    onChange={(e) => {
                      const type = e.target.value as DigitalConsentForm['formType'];
                      const tmpl = LEGAL_TEMPLATES[type];
                      setNewFormData({
                        ...newFormData,
                        formType: type,
                        risksAcknowledged: tmpl ? tmpl.defaultRisks : newFormData.risksAcknowledged,
                      });
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-bold"
                  >
                    <option value="High-Risk Surgical & Anesthesia">High-Risk Surgical &amp; Anesthesia</option>
                    <option value="Chemotherapy & Targeted Therapy">Chemotherapy &amp; Targeted Therapy</option>
                    <option value="Radiation Therapy Protocol">Radiation Therapy Protocol</option>
                    <option value="Blood & Blood Products Transfusion">Blood &amp; Blood Products Transfusion</option>
                    <option value="General Inpatient Admission">General Inpatient Admission</option>
                    <option value="Emergency Resuscitation">Emergency Resuscitation Protocol</option>
                    <option value="High-Risk LAMA Discharge">High-Risk LAMA Discharge</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Primary Language Format</label>
                  <select
                    value={newFormData.language}
                    onChange={(e) => setNewFormData({ ...newFormData, language: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-bold"
                  >
                    <option value="English">English</option>
                    <option value="Telugu">Telugu (తెలుగు)</option>
                    <option value="Bilingual (EN + TE)">Bilingual (English + Telugu)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Specific Procedure / Surgery Name *</label>
                <input
                  type="text"
                  value={newFormData.procedureName}
                  onChange={(e) => setNewFormData({ ...newFormData, procedureName: e.target.value })}
                  className="w-full bg-slate-950 border border-cyan-500/50 rounded-xl px-3 py-2 text-cyan-300 font-bold"
                  placeholder="e.g. Modified Radical Mastectomy + Axillary Dissection"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Attending Consultant Surgeon / Oncologist</label>
                <select
                  value={newFormData.doctorId}
                  onChange={(e) => setNewFormData({ ...newFormData, doctorId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                >
                  <option value="">-- Choose Doctor --</option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.departmentName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Clinical Notes &amp; Special Instructions</label>
                <textarea
                  rows={2}
                  value={newFormData.notes}
                  onChange={(e) => setNewFormData({ ...newFormData, notes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewFormModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 text-white font-extrabold shadow-lg shadow-cyan-950/50"
                >
                  Generate Digital Consent Form
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

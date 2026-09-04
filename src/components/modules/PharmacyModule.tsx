import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import {
  Pill,
  Search,
  ShoppingBag,
  Package,
  Plus,
  CheckCircle2,
  RotateCcw,
  Building2,
  Printer,
  FileCheck,
} from 'lucide-react';

interface MedicineItem {
  id: string;
  name: string;
  genericName: string;
  category: string;
  stock: number;
  minStock: number;
  price: number;
  expiry: string;
  batch: string;
  location: string;
}

interface PrescriptionItem {
  id: string;
  uhid: string;
  patientName: string;
  age: number;
  gender: string;
  doctorName: string;
  department: string;
  items: string;
  total: number;
  status: 'Pending Dispense' | 'Dispensed';
  timestamp: string;
}

interface WardIndentItem {
  id: string;
  indentNo: string;
  admissionId: string;
  patientName: string;
  patientUhid: string;
  bedNumber: string;
  wardName: string;
  doctorName: string;
  nurseName: string;
  medicines: { name: string; qty: number; price: number; total: number }[];
  totalAmount: number;
  status: 'Pending Dispense' | 'Dispensed & Billed to IPD';
  orderedAt: string;
}

interface MedicineReturnRecord {
  id: string;
  returnVoucherNo: string;
  patientName: string;
  patientUhid: string;
  admissionId: string;
  bedNumber: string;
  wardName: string;
  returnedItems: { name: string; batch: string; qty: number; unitPrice: number; refundAmount: number }[];
  totalRefund: number;
  reason: 'Discharge Unused' | 'Therapy Discontinued / Changed' | 'Excess Dispensed' | 'Adverse Effect';
  returnedBy: string; // Attendant or Staff Nurse
  pharmacist: string;
  timestamp: string;
  status: 'Credited to IPD Bill' | 'Cash Refunded';
}

const INITIAL_INVENTORY: MedicineItem[] = [
  { id: 'med-1', name: 'Paracetamol 650mg (Dolo)', genericName: 'Acetaminophen 650mg', category: 'Analgesic / Antipyretic', stock: 1450, minStock: 300, price: 3.5, expiry: '2027-11', batch: 'BATCH-D90', location: 'Rack A-01' },
  { id: 'med-2', name: 'Augmentin 625mg Duo', genericName: 'Amoxicillin 500mg + Clavulanate 125mg', category: 'Antibiotic', stock: 420, minStock: 100, price: 22.0, expiry: '2027-04', batch: 'BATCH-A12', location: 'Rack B-04' },
  { id: 'med-3', name: 'Telma 40mg', genericName: 'Telmisartan 40mg', category: 'Antihypertensive', stock: 890, minStock: 200, price: 8.5, expiry: '2028-01', batch: 'BATCH-T44', location: 'Rack C-02' },
  { id: 'med-4', name: 'Glycomet 500mg SR', genericName: 'Metformin Hydrochloride 500mg', category: 'Antidiabetic', stock: 2100, minStock: 400, price: 4.0, expiry: '2027-09', batch: 'BATCH-M08', location: 'Rack C-05' },
  { id: 'med-5', name: 'Pan 40mg', genericName: 'Pantoprazole Sodium 40mg', category: 'Antacid / PPI', stock: 680, minStock: 150, price: 9.0, expiry: '2027-06', batch: 'BATCH-P19', location: 'Rack A-03' },
  { id: 'med-6', name: 'Atorva 10mg', genericName: 'Atorvastatin Calcium 10mg', category: 'Statin / Lipid Lowering', stock: 540, minStock: 120, price: 12.0, expiry: '2027-12', batch: 'BATCH-S31', location: 'Rack C-01' },
  { id: 'med-7', name: 'Azithral 500mg', genericName: 'Azithromycin 500mg', category: 'Antibiotic', stock: 85, minStock: 100, price: 24.5, expiry: '2026-10', batch: 'BATCH-AZ22', location: 'Rack B-01' },
  { id: 'med-8', name: 'Montek-LC', genericName: 'Montelukast 10mg + Levocetirizine 5mg', category: 'Antihistamine / Respiratory', stock: 340, minStock: 100, price: 16.0, expiry: '2027-08', batch: 'BATCH-ML04', location: 'Rack D-02' },
  { id: 'med-9', name: 'Inj. Tramadol 50mg/ml', genericName: 'Tramadol HCl 50mg', category: 'Emergency / Opioid Analgesic', stock: 45, minStock: 50, price: 42.0, expiry: '2027-02', batch: 'BATCH-TR88', location: 'Cold Storage Safe' },
  { id: 'med-10', name: 'Inj. Pantoprazole 40mg IV', genericName: 'Pantoprazole Sodium IV Vial', category: 'Critical Care / IV Injections', stock: 320, minStock: 80, price: 55.0, expiry: '2027-05', batch: 'BATCH-PN40', location: 'Rack E-01' },
  { id: 'med-11', name: 'IV Normal Saline 0.9% (500ml)', genericName: 'Sodium Chloride 0.9%', category: 'IV Fluids', stock: 580, minStock: 150, price: 45.0, expiry: '2028-03', batch: 'BATCH-NS50', location: 'IV Store Bay' },
];

const INITIAL_PRESCRIPTIONS: PrescriptionItem[] = [
  { id: 'rx-101', uhid: 'BRH-2026-9041', patientName: 'Kavitha Venkatram', age: 48, gender: 'Female', doctorName: 'Dr. Vikram Reddy', department: 'Cardiology', items: 'Telma 40mg (1-0-0) x 30 days, Atorva 10mg (0-0-1) x 30 days, Dolo 650mg SOS', total: 615, status: 'Pending Dispense', timestamp: 'Today, 10:15 AM' },
  { id: 'rx-102', uhid: 'BRH-2026-8801', patientName: 'Narayana Swamy', age: 62, gender: 'Male', doctorName: 'Dr. Rajeshwar Rao', department: 'Orthopaedics', items: 'Glycomet 500mg SR (1-0-1) x 30 days, Pan 40 (1-0-0) x 15 days', total: 375, status: 'Pending Dispense', timestamp: 'Today, 10:45 AM' },
  { id: 'rx-103', uhid: 'BRH-2026-7712', patientName: 'Meera Nambiar', age: 34, gender: 'Female', doctorName: 'Dr. Asha Nair', department: 'Obstetrics & Gynaecology', items: 'Augmentin 625mg Duo (1-0-1) x 5 days, Dolo 650mg (TID) x 3 days', total: 295, status: 'Pending Dispense', timestamp: 'Today, 11:20 AM' },
];

const INITIAL_WARD_INDENTS: WardIndentItem[] = [
  {
    id: 'ind-01',
    indentNo: 'IND-2026-0811',
    admissionId: 'ADM-2026-8812',
    patientName: 'K. Venkateswarlu',
    patientUhid: 'BRH-2026-9041',
    bedNumber: 'ICU-102',
    wardName: 'Cardiac ICU Suite',
    doctorName: 'Dr. Vikram Reddy',
    nurseName: 'Sr. Lakshmi (ICU Staff)',
    medicines: [
      { name: 'Inj. Pantoprazole 40mg IV', qty: 2, price: 55, total: 110 },
      { name: 'IV Normal Saline 0.9% (500ml)', qty: 4, price: 45, total: 180 },
      { name: 'Telma 40mg (Strip of 15)', qty: 2, price: 127.5, total: 255 },
    ],
    totalAmount: 545,
    status: 'Dispensed & Billed to IPD',
    orderedAt: 'Today, 08:30 AM',
  },
  {
    id: 'ind-02',
    indentNo: 'IND-2026-0812',
    admissionId: 'ADM-2026-4491',
    patientName: 'Subbamma Chenchu',
    patientUhid: 'BRH-2026-8801',
    bedNumber: 'DLX-204',
    wardName: 'Deluxe Private Rooms',
    doctorName: 'Dr. Sameer Khan',
    nurseName: 'Sr. Sunitha (Ward Nurse)',
    medicines: [
      { name: 'Augmentin 625mg Duo (Strip of 10)', qty: 1, price: 220, total: 220 },
      { name: 'Paracetamol 650mg (Strip of 15)', qty: 2, price: 52.5, total: 105 },
      { name: 'Pan 40mg (Strip of 15)', qty: 1, price: 135, total: 135 },
    ],
    totalAmount: 460,
    status: 'Pending Dispense',
    orderedAt: 'Today, 10:45 AM',
  },
];

const INITIAL_RETURNS: MedicineReturnRecord[] = [
  {
    id: 'ret-01',
    returnVoucherNo: 'PHARM-RET-2026-019',
    patientName: 'Subbamma Chenchu',
    patientUhid: 'BRH-2026-8801',
    admissionId: 'ADM-2026-4491',
    bedNumber: 'DLX-204',
    wardName: 'Deluxe Private Rooms',
    returnedItems: [
      { name: 'IV Normal Saline 0.9% (500ml)', batch: 'BATCH-NS50', qty: 2, unitPrice: 45, refundAmount: 90 },
      { name: 'Inj. Pantoprazole 40mg IV', batch: 'BATCH-PN40', qty: 1, unitPrice: 55, refundAmount: 55 },
    ],
    totalRefund: 145,
    reason: 'Discharge Unused',
    returnedBy: 'Attendant (Ramesh)',
    pharmacist: 'Pharmacist Praveen (Reg #8821)',
    timestamp: 'Today, 11:30 AM',
    status: 'Credited to IPD Bill',
  },
];

export const PharmacyModule: React.FC = () => {
  const { addToast, admissions } = useHospital();

  const [activeTab, setActiveTab] = useState<'indents' | 'returns' | 'prescriptions' | 'inventory' | 'otc'>('indents');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [inventory, setInventory] = useState<MedicineItem[]>(INITIAL_INVENTORY);
  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>(INITIAL_PRESCRIPTIONS);
  const [wardIndents, setWardIndents] = useState<WardIndentItem[]>(INITIAL_WARD_INDENTS);
  const [returnRecords, setReturnRecords] = useState<MedicineReturnRecord[]>(INITIAL_RETURNS);

  // Return Medicine Modal State
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedReturnAdmId, setSelectedReturnAdmId] = useState(admissions[0]?.id || '');
  const [returnMedName, setReturnMedName] = useState(inventory[0]?.name || '');
  const [returnBatch, setReturnBatch] = useState('BATCH-D90');
  const [returnQty, setReturnQty] = useState('2');
  const [returnUnitPrice, setReturnUnitPrice] = useState('45');
  const [returnReason, setReturnReason] = useState<MedicineReturnRecord['reason']>('Discharge Unused');
  const [returnedByPerson, setReturnedByPerson] = useState('Ward Staff Nurse / Attendant');

  // New Medicine Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newMedName, setNewMedName] = useState('');
  const [newGenericName, setNewGenericName] = useState('');
  const [newCategory, setNewCategory] = useState('Antibiotic');
  const [newStock, setNewStock] = useState('100');
  const [newPrice, setNewPrice] = useState('10');
  const [newExpiry, setNewExpiry] = useState('2027-12');
  const [newBatch, setNewBatch] = useState('BATCH-X01');
  const [newLocation, setNewLocation] = useState('Rack A-05');

  // Direct OTC Walk-in POS state
  const [otcPatientName, setOtcPatientName] = useState('');
  const [otcPhone, setOtcPhone] = useState('');
  const [otcSelectedMedId, setOtcSelectedMedId] = useState(inventory[0]?.id || '');
  const [otcQuantity, setOtcQuantity] = useState('10');

  const categories = ['All', ...Array.from(new Set(inventory.map((m) => m.category)))];

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.batch.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const pendingPrescriptionsCount = prescriptions.filter((p) => p.status === 'Pending Dispense').length;
  const pendingIndentsCount = wardIndents.filter((i) => i.status === 'Pending Dispense').length;
  const lowStockCount = inventory.filter((m) => m.stock <= m.minStock).length;

  // Dispense Ward Indent
  const handleDispenseWardIndent = (indent: WardIndentItem) => {
    setWardIndents((prev) =>
      prev.map((i) => (i.id === indent.id ? { ...i, status: 'Dispensed & Billed to IPD' } : i))
    );
    addToast(
      'IPD Medicines Dispensed',
      `Ward Indent #${indent.indentNo} (₹${indent.totalAmount}) billed directly to ${indent.patientName}'s IPD ledger`,
      'success'
    );
  };

  // Process Medicine Return & Issue Credit Note
  const handleConfirmMedicineReturn = (e: React.FormEvent) => {
    e.preventDefault();
    const adm = admissions.find((a) => a.id === selectedReturnAdmId) || admissions[0];
    if (!adm) return;

    const qty = Number(returnQty) || 1;
    const unitPrice = Number(returnUnitPrice) || 45;
    const totalRefund = qty * unitPrice;

    const returnVoucherNo = `PHARM-RET-2026-${Math.floor(100 + Math.random() * 900)}`;

    const newRecord: MedicineReturnRecord = {
      id: `ret-${Date.now()}`,
      returnVoucherNo,
      patientName: adm.patientName,
      patientUhid: adm.patientUhid,
      admissionId: adm.admissionId,
      bedNumber: adm.bedNumber,
      wardName: adm.wardName,
      returnedItems: [
        {
          name: returnMedName,
          batch: returnBatch,
          qty,
          unitPrice,
          refundAmount: totalRefund,
        },
      ],
      totalRefund,
      reason: returnReason,
      returnedBy: returnedByPerson,
      pharmacist: 'Chief Pharmacist (Duty Desk)',
      timestamp: 'Just now',
      status: 'Credited to IPD Bill',
    };

    // Restock the returned medicine to Central Pharmacy Inventory
    setInventory((prev) =>
      prev.map((m) => {
        if (m.name.toLowerCase().includes(returnMedName.toLowerCase()) || returnMedName.includes(m.name)) {
          return { ...m, stock: m.stock + qty };
        }
        return m;
      })
    );

    setReturnRecords([newRecord, ...returnRecords]);
    setIsReturnModalOpen(false);

    addToast(
      'Medicine Return Accepted',
      `Credit Note #${returnVoucherNo} issued for ₹${totalRefund}. Amount credited to ${adm.patientName}'s IPD Discharge Bill and inventory restocked (+${qty}).`,
      'success'
    );
  };

  const handleDispensePrescription = (rx: PrescriptionItem) => {
    setPrescriptions((prev) =>
      prev.map((p) => (p.id === rx.id ? { ...p, status: 'Dispensed' } : p))
    );
    addToast(
      'Prescription Dispensed',
      `Dispensed medicines and generated invoice ₹${rx.total} for ${rx.patientName} (${rx.uhid})`,
      'success'
    );
  };

  const handleAddMedicine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedName.trim()) {
      addToast('Error', 'Please enter medicine name', 'warning');
      return;
    }

    const created: MedicineItem = {
      id: `med-${Date.now()}`,
      name: newMedName,
      genericName: newGenericName || newMedName,
      category: newCategory,
      stock: Number(newStock) || 50,
      minStock: 100,
      price: Number(newPrice) || 10,
      expiry: newExpiry,
      batch: newBatch,
      location: newLocation,
    };

    setInventory([created, ...inventory]);
    setIsAddModalOpen(false);
    setNewMedName('');
    setNewGenericName('');
    addToast('Medicine Stocked', `Successfully added ${created.name} (${created.stock} units) to Central Pharmacy`, 'success');
  };

  const handleProcessOtcSale = (e: React.FormEvent) => {
    e.preventDefault();
    const med = inventory.find((m) => m.id === otcSelectedMedId);
    if (!med) return;

    const qty = Number(otcQuantity) || 1;
    if (qty > med.stock) {
      addToast('Insufficient Stock', `Only ${med.stock} units available in stock`, 'warning');
      return;
    }

    const total = qty * med.price;
    setInventory((prev) =>
      prev.map((m) => (m.id === med.id ? { ...m, stock: m.stock - qty } : m))
    );

    addToast(
      'OTC Sale Completed',
      `Sold ${qty}x ${med.name} (₹${total}) to ${otcPatientName || 'Walk-in Customer'}`,
      'success'
    );

    setOtcPatientName('');
    setOtcPhone('');
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* 1. Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-6 rounded-2xl border border-slate-800/80 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
              <Pill className="w-3.5 h-3.5" /> Central Pharmacy &amp; Inpatient Dispensary
            </span>
          </div>
          <h2 className="text-2xl font-black text-white mt-1">Hospital Pharmacy &amp; Medicine Return Desk</h2>
          <p className="text-xs text-slate-400">
            Ward indents, automated IPD running billing, unused medicine return credit notes, OP dispensing, and central batch inventory.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsReturnModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-extrabold shadow-lg shadow-amber-600/30 transition active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>+ Return Unused Medicines</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-extrabold shadow-lg shadow-cyan-600/30 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Drug Stock</span>
          </button>
        </div>
      </div>

      {/* 2. Top Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 flex-wrap">
        <button
          onClick={() => setActiveTab('indents')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'indents'
              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-950/50'
              : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4 text-cyan-300" />
          <span>🏥 IPD Ward Indents ({wardIndents.length})</span>
          {pendingIndentsCount > 0 && (
            <span className="px-1.5 py-0.2 text-[10px] bg-rose-500 text-white rounded-full font-black animate-pulse">
              {pendingIndentsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('returns')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'returns'
              ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md shadow-amber-950/50'
              : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <RotateCcw className="w-4 h-4 text-amber-300" />
          <span>🔄 Medicine Returns &amp; Credit Notes ({returnRecords.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('prescriptions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'prescriptions'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-950/50'
              : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <FileCheck className="w-4 h-4 text-emerald-300" />
          <span>📋 OP Prescriptions ({prescriptions.length})</span>
          {pendingPrescriptionsCount > 0 && (
            <span className="px-1.5 py-0.2 text-[10px] bg-amber-500 text-slate-950 rounded-full font-black">
              {pendingPrescriptionsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'inventory'
              ? 'bg-slate-800 text-white shadow-md'
              : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Package className="w-4 h-4 text-purple-300" />
          <span>📦 Central Drug Inventory ({inventory.length})</span>
          {lowStockCount > 0 && (
            <span className="px-1.5 py-0.2 text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded-full font-black">
              {lowStockCount} Low
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('otc')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'otc'
              ? 'bg-slate-800 text-white shadow-md'
              : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <ShoppingBag className="w-4 h-4 text-cyan-300" />
          <span>🛒 Walk-in POS Billing</span>
        </button>
      </div>

      {/* 3. TAB 1: IPD WARD INDENTS */}
      {activeTab === 'indents' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between flex-wrap gap-3">
            <div className="text-xs text-slate-300">
              <strong className="text-white block font-bold">Inpatient Pharmacy Indents (Running Account Billing)</strong>
              <span>Medicines dispensed here are automatically linked to the patient&apos;s running IPD ledger for final discharge settlement.</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {wardIndents.map((indent) => {
              const isDispensed = indent.status === 'Dispensed & Billed to IPD';
              return (
                <div
                  key={indent.id}
                  className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3.5 shadow-xl transition hover:border-slate-700"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-white text-base font-bold">{indent.patientName}</strong>
                        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
                          {indent.patientUhid}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 font-mono">
                        Bed: <strong className="text-emerald-300">{indent.bedNumber}</strong> • {indent.wardName}
                      </span>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${
                        isDispensed
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                      }`}
                    >
                      {indent.status}
                    </span>
                  </div>

                  {/* Medicines List Table */}
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Prescribed Inpatient Medications:
                    </div>
                    <div className="space-y-1 divide-y divide-slate-800/60 font-mono">
                      {indent.medicines.map((m, idx) => (
                        <div key={idx} className="flex justify-between items-center pt-1 first:pt-0">
                          <span className="text-slate-200">{m.name}</span>
                          <span className="text-slate-400">
                            {m.qty}x @ ₹{m.price} = <strong className="text-cyan-300">₹{m.total}</strong>
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-xs font-bold">
                      <span className="text-slate-400">Total Indent Amount:</span>
                      <span className="text-emerald-400 font-mono text-sm">₹{indent.totalAmount}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>👨‍⚕️ Prescribed: {indent.doctorName}</span>
                    <span>👩‍⚕️ Nurse: {indent.nurseName}</span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <span className="text-[10px] font-mono text-slate-500">{indent.orderedAt}</span>

                    {!isDispensed ? (
                      <button
                        onClick={() => handleDispenseWardIndent(indent)}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-950/50 transition flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Dispense &amp; Bill to IPD</span>
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Added to Running Discharge Bill
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. TAB 2: MEDICINE RETURNS & CREDIT NOTES */}
      {activeTab === 'returns' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between flex-wrap gap-3">
            <div className="text-xs text-amber-200">
              <strong className="text-amber-100 block font-bold flex items-center gap-1.5">
                <RotateCcw className="w-4 h-4 text-amber-400" />
                Unused Medicine Return &amp; Discharge Credit Desk
              </strong>
              <span>
                When admitted patients are discharged or therapy is discontinued, unused unopened medicine strips and IV fluids are returned here. The refund amount is automatically credited against their final IPD discharge bill.
              </span>
            </div>

            <button
              onClick={() => setIsReturnModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-extrabold shadow-lg shadow-amber-950/50 transition flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Issue Return Credit Note</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {returnRecords.map((ret) => (
              <div
                key={ret.id}
                className="p-5 rounded-2xl bg-slate-900/80 border border-amber-500/30 space-y-3.5 shadow-xl transition hover:border-amber-500/60"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-amber-400 font-bold uppercase block">
                      Voucher #{ret.returnVoucherNo}
                    </span>
                    <strong className="text-white text-base font-bold block">{ret.patientName}</strong>
                    <span className="text-[11px] text-slate-400 font-mono">
                      UHID: {ret.patientUhid} • Bed: <strong className="text-emerald-300">{ret.bedNumber}</strong>
                    </span>
                  </div>

                  <span className="px-2.5 py-0.5 text-[10px] font-black rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                    ✅ {ret.status}
                  </span>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Returned Medicine Details:
                  </div>
                  <div className="space-y-1 divide-y divide-slate-800 font-mono">
                    {ret.returnedItems.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center pt-1 first:pt-0">
                        <div>
                          <span className="text-slate-200 block">{item.name}</span>
                          <span className="text-[10px] text-slate-500">{item.batch}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-300">{item.qty} units</span>
                          <span className="text-amber-400 font-bold block">₹{item.refundAmount}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-xs font-bold">
                    <span className="text-slate-400">Total Credit Amount:</span>
                    <span className="text-emerald-400 font-mono text-sm">₹{ret.totalRefund}</span>
                  </div>
                </div>

                <div className="text-xs text-slate-400 space-y-0.5">
                  <div>
                    <span className="text-slate-500">Return Reason:</span> <strong className="text-slate-200">{ret.reason}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Handed by:</span> {ret.returnedBy}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px]">
                  <span className="text-slate-500 font-mono">{ret.timestamp}</span>
                  <button
                    onClick={() => addToast('Voucher Printed', `Printing Credit Note #${ret.returnVoucherNo}`, 'info')}
                    className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-bold"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Credit Slip</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. TAB 3: OP PRESCRIPTIONS */}
      {activeTab === 'prescriptions' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {prescriptions.map((rx) => {
            const isDispensed = rx.status === 'Dispensed';
            return (
              <div
                key={rx.id}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3.5 shadow-xl"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <strong className="text-white text-base block font-bold">{rx.patientName}</strong>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {rx.age}Y / {rx.gender} • UHID: {rx.uhid}
                    </span>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${
                      isDispensed
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                    }`}
                  >
                    {rx.status}
                  </span>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-slate-300">
                  {rx.items}
                </div>

                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-400">Prescription Total:</span>
                  <span className="text-emerald-400 font-mono text-sm">₹{rx.total}</span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <span className="text-[10px] font-mono text-slate-500">{rx.timestamp}</span>
                  {!isDispensed ? (
                    <button
                      onClick={() => handleDispensePrescription(rx)}
                      className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md shadow-emerald-950/50"
                    >
                      Dispense &amp; Collect
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-emerald-400">✅ Dispensed</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 6. TAB 4: CENTRAL INVENTORY */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search medicine name, generic, batch..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold shrink-0 transition ${
                    selectedCategory === cat
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Drug Name &amp; Generic</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Batch / Rack</th>
                  <th className="p-3.5">Current Stock</th>
                  <th className="p-3.5">Unit Price</th>
                  <th className="p-3.5">Expiry</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-sans">
                {filteredInventory.map((item) => {
                  const isLow = item.stock <= item.minStock;
                  return (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3.5">
                        <strong className="text-white block font-bold">{item.name}</strong>
                        <span className="text-[10px] text-slate-400 font-mono">{item.genericName}</span>
                      </td>
                      <td className="p-3.5 text-slate-300">{item.category}</td>
                      <td className="p-3.5 font-mono text-[11px] text-slate-400">
                        {item.batch} • {item.location}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`font-mono font-bold text-xs ${
                            isLow ? 'text-rose-400 animate-pulse' : 'text-emerald-400'
                          }`}
                        >
                          {item.stock} units {isLow && '(Reorder!)'}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-slate-200 font-bold">₹{item.price}</td>
                      <td className="p-3.5 font-mono text-slate-400">{item.expiry}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. TAB 5: OTC POS BILLING */}
      {activeTab === 'otc' && (
        <div className="max-w-xl mx-auto p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-base font-black text-white flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-cyan-400" />
            <span>Walk-In Direct OTC Pharmacy Counter</span>
          </h3>

          <form onSubmit={handleProcessOtcSale} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Customer / Patient Name</label>
                <input
                  type="text"
                  value={otcPatientName}
                  onChange={(e) => setOtcPatientName(e.target.value)}
                  placeholder="e.g. S. Murthy"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Phone Number</label>
                <input
                  type="text"
                  value={otcPhone}
                  onChange={(e) => setOtcPhone(e.target.value)}
                  placeholder="e.g. 98490 12345"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Select Medicine *</label>
              <select
                value={otcSelectedMedId}
                onChange={(e) => setOtcSelectedMedId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-bold"
              >
                {inventory.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} — ₹{m.price}/unit (In Stock: {m.stock})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Quantity *</label>
              <input
                type="number"
                min="1"
                value={otcQuantity}
                onChange={(e) => setOtcQuantity(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono font-bold"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 text-white font-extrabold text-xs shadow-lg shadow-cyan-950/50 transition"
            >
              Confirm Sale &amp; Print Cash Receipt
            </button>
          </form>
        </div>
      )}

      {/* 8. MODAL: RETURN UNUSED MEDICINES & CREDIT NOTE */}
      {isReturnModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-slate-900 border border-amber-500/40 rounded-2xl p-6 shadow-2xl space-y-4 font-sans text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-amber-300 font-bold">
                <RotateCcw className="w-5 h-5 text-amber-400" />
                <span>Issue Medicine Return Credit Note (Discharge / Ward Return)</span>
              </div>
              <button onClick={() => setIsReturnModalOpen(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmMedicineReturn} className="space-y-4">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Select Inpatient / Discharge Patient *</label>
                <select
                  value={selectedReturnAdmId}
                  onChange={(e) => setSelectedReturnAdmId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-bold"
                  required
                >
                  {admissions.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.patientName} ({a.patientUhid}) — Bed: {a.bedNumber} ({a.wardName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Returned Medicine Name *</label>
                  <input
                    type="text"
                    value={returnMedName}
                    onChange={(e) => setReturnMedName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-bold"
                    placeholder="e.g. IV Normal Saline 0.9%"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Batch Number</label>
                  <input
                    type="text"
                    value={returnBatch}
                    onChange={(e) => setReturnBatch(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono"
                    placeholder="e.g. BATCH-NS50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Returned Quantity (Unopened) *</label>
                  <input
                    type="number"
                    min="1"
                    value={returnQty}
                    onChange={(e) => setReturnQty(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Unit Price (₹) *</label>
                  <input
                    type="number"
                    min="1"
                    value={returnUnitPrice}
                    onChange={(e) => setReturnUnitPrice(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Reason for Return</label>
                  <select
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-bold"
                  >
                    <option value="Discharge Unused">Discharge Unused Medications</option>
                    <option value="Therapy Discontinued / Changed">Therapy Discontinued / Changed</option>
                    <option value="Excess Dispensed">Excess Dispensed</option>
                    <option value="Adverse Effect">Adverse Effect / Allergy</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Handed Over By</label>
                  <input
                    type="text"
                    value={returnedByPerson}
                    onChange={(e) => setReturnedByPerson(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                    placeholder="Staff Nurse / Patient Attendant"
                  />
                </div>
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between">
                <span className="text-amber-300 font-bold">Total Credit Amount to Offset in Discharge Bill:</span>
                <span className="font-mono font-black text-amber-300 text-base">
                  ₹{(Number(returnQty) || 0) * (Number(returnUnitPrice) || 0)}
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsReturnModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 text-white font-extrabold shadow-lg shadow-amber-950/50"
                >
                  Confirm Restock &amp; Issue Credit Slip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 9. MODAL: ADD DRUG STOCK */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-cyan-500/40 rounded-2xl p-6 shadow-2xl space-y-4 font-sans text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-cyan-300 font-bold">
                <Plus className="w-5 h-5 text-cyan-400" />
                <span>Add Drug Stock to Central Pharmacy</span>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddMedicine} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Brand Name *</label>
                  <input
                    type="text"
                    value={newMedName}
                    onChange={(e) => setNewMedName(e.target.value)}
                    placeholder="e.g. Dolo 650mg"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Generic Name</label>
                  <input
                    type="text"
                    value={newGenericName}
                    onChange={(e) => setNewGenericName(e.target.value)}
                    placeholder="e.g. Paracetamol 650mg"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Initial Stock (Units) *</label>
                  <input
                    type="number"
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Unit Selling Price (₹) *</label>
                  <input
                    type="number"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Drug Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-bold"
                  >
                    <option value="Antibiotic">Antibiotic</option>
                    <option value="Analgesic / Antipyretic">Analgesic / Antipyretic</option>
                    <option value="Antihypertensive">Antihypertensive</option>
                    <option value="Antidiabetic">Antidiabetic</option>
                    <option value="Antacid / PPI">Antacid / PPI</option>
                    <option value="Critical Care / IV Injections">Critical Care / IV Injections</option>
                    <option value="IV Fluids">IV Fluids</option>
                    <option value="Emergency / Opioid Analgesic">Emergency / Opioid Analgesic</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Batch Number</label>
                  <input
                    type="text"
                    value={newBatch}
                    onChange={(e) => setNewBatch(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Expiry Date</label>
                  <input
                    type="text"
                    value={newExpiry}
                    onChange={(e) => setNewExpiry(e.target.value)}
                    placeholder="YYYY-MM"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Storage Rack</label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 text-white font-extrabold shadow-lg shadow-cyan-950/50"
                >
                  Save to Inventory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

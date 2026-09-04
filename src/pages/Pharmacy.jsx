import React, { useState, useMemo } from 'react';
import { useHospital } from '../context/HospitalContext';
import {
  Pill,
  Search,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Package,
  Clock,
  Filter,
  DollarSign,
  TrendingDown,
  FileText,
  Building,
  User,
  ShieldAlert,
  ArrowUpRight,
} from 'lucide-react';

const INITIAL_MEDICINES = [
  { id: 'med-1', name: 'Paracetamol 650mg (Dolo)', category: 'Analgesics', stock: 1420, minStock: 200, unitPrice: 2.5, rack: 'A-12', expiry: '2027-08', batch: 'DL-992' },
  { id: 'med-2', name: 'Amoxicillin + Clavulanic 625mg (Augmentin)', category: 'Antibiotics', stock: 320, minStock: 100, unitPrice: 22.0, rack: 'B-04', expiry: '2026-12', batch: 'AG-441' },
  { id: 'med-3', name: 'Atorvastatin 20mg (Atorva)', category: 'Cardiology', stock: 85, minStock: 150, unitPrice: 14.5, rack: 'C-01', expiry: '2027-03', batch: 'AT-810' },
  { id: 'med-4', name: 'Pantoprazole 40mg (Pan-40)', category: 'Gastroenterology', stock: 950, minStock: 200, unitPrice: 9.0, rack: 'A-05', expiry: '2027-11', batch: 'PN-201' },
  { id: 'med-5', name: 'Metformin 500mg (Glycomet)', category: 'Diabetology', stock: 610, minStock: 150, unitPrice: 4.2, rack: 'D-08', expiry: '2028-01', batch: 'GL-633' },
  { id: 'med-6', name: 'Inj. Ceftriaxone 1g (Monocef)', category: 'Injectables', stock: 45, minStock: 80, unitPrice: 65.0, rack: 'ER-Fridge', expiry: '2026-10', batch: 'MN-112' },
  { id: 'med-7', name: 'Normal Saline 0.9% 500ml', category: 'IV Fluids', stock: 210, minStock: 100, unitPrice: 45.0, rack: 'IV-Bay', expiry: '2028-06', batch: 'NS-500' },
  { id: 'med-8', name: 'Emergency Cardiac Kit (Aspirin+Clopidogrel+Atorvastatin)', category: 'Emergency Kits', stock: 24, minStock: 30, unitPrice: 180.0, rack: 'ER-CrashCart', expiry: '2027-04', batch: 'CK-009' },
];

export const Pharmacy = () => {
  const { patients = [], addToast } = useHospital();
  const [medicines, setMedicines] = useState(INITIAL_MEDICINES);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'dispense'
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || '');
  const [dispenseItems, setDispenseItems] = useState([
    { medicineId: 'med-1', quantity: 10 },
  ]);

  const categories = ['All', 'Analgesics', 'Antibiotics', 'Cardiology', 'Gastroenterology', 'Diabetology', 'Injectables', 'IV Fluids', 'Emergency Kits'];

  const filteredMedicines = useMemo(() => {
    return medicines.filter((m) => {
      const matchSearch =
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.batch.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.rack.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = categoryFilter === 'All' || m.category === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [medicines, searchTerm, categoryFilter]);

  const lowStockMedicines = medicines.filter((m) => m.stock < m.minStock);

  const handleDispense = (e) => {
    e.preventDefault();
    const patient = patients.find((p) => p.id === selectedPatientId) || patients[0];
    
    // Deduct stock
    setMedicines((prev) =>
      prev.map((med) => {
        const item = dispenseItems.find((d) => d.medicineId === med.id);
        if (item) {
          return { ...med, stock: Math.max(0, med.stock - Number(item.quantity || 0)) };
        }
        return med;
      })
    );

    if (addToast) {
      addToast({
        title: 'Prescription Dispensed',
        message: `Medications dispensed to ${patient?.name || 'Patient'} and added to hospital ledger.`,
        type: 'success',
      });
    }

    // Reset dispense form
    setDispenseItems([{ medicineId: 'med-1', quantity: 5 }]);
    setActiveTab('inventory');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Pill className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-100 tracking-tight">
                Pharmacy & Dispensary Management
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Central Drug Store, Formulary, Outpatient Dispensing & Real-time Stock Alerts
              </p>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 bg-slate-900/80 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'inventory'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Drug Formulary ({medicines.length})
          </button>
          <button
            onClick={() => setActiveTab('dispense')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'dispense'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Dispense Prescription
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">Total Formulations</div>
            <div className="text-2xl font-bold text-slate-100 mt-1">{medicines.length} Items</div>
            <div className="text-[11px] text-cyan-400 mt-0.5">100% In National Formulary</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-800 text-cyan-400">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">Low Stock Warnings</div>
            <div className="text-2xl font-bold text-amber-400 mt-1">{lowStockMedicines.length} Drugs</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Below critical reorder level</div>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">Today's Dispensed Count</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">184 Prescriptions</div>
            <div className="text-[11px] text-emerald-400/80 mt-0.5">₹42,850 Turnout</div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">Emergency Bay Stock</div>
            <div className="text-2xl font-bold text-purple-400 mt-1">Fully Stocked</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Crash cart verified today</div>
          </div>
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'inventory' ? (
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-sm space-y-4">
          {/* Filter and Search Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search medicine, batch, rack..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                    categoryFilter === cat
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                      : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Medicines Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-4">Medicine Name & Formulation</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Batch & Expiry</th>
                  <th className="py-3 px-4">Rack / Shelf</th>
                  <th className="py-3 px-4">In Stock</th>
                  <th className="py-3 px-4">Unit Price</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
                {filteredMedicines.map((med) => {
                  const isLow = med.stock < med.minStock;
                  return (
                    <tr key={med.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-semibold text-slate-100">{med.name}</td>
                      <td className="py-3 px-4 text-slate-400">{med.category}</td>
                      <td className="py-3 px-4 font-mono text-[11px]">
                        <span className="text-slate-300">{med.batch}</span>
                        <span className="text-slate-500 ml-2">Exp: {med.expiry}</span>
                      </td>
                      <td className="py-3 px-4 font-mono text-cyan-400">{med.rack}</td>
                      <td className="py-3 px-4 font-bold text-slate-200">
                        {med.stock} units
                      </td>
                      <td className="py-3 px-4 font-mono text-emerald-400">₹{med.unitPrice.toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                            isLow
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          }`}
                        >
                          {isLow ? 'Low Stock' : 'Adequate'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Prescription Dispensing Form */
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-sm max-w-3xl mx-auto space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-100">Outpatient Prescription Dispensing</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Select patient, verify doctor prescription, and dispense medications directly from pharmacy bay.
            </p>
          </div>

          <form onSubmit={handleDispense} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Select Patient (UHID)
              </label>
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.uhid}) - {p.gender}, {p.age} yrs - {p.phone}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3 pt-2">
              <label className="block text-xs font-semibold text-slate-300">
                Prescribed Medications
              </label>
              {dispenseItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <select
                    value={item.medicineId}
                    onChange={(e) => {
                      const val = e.target.value;
                      setDispenseItems((prev) =>
                        prev.map((it, i) => (i === idx ? { ...it, medicineId: val } : it))
                      );
                    }}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  >
                    {medicines.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} (Stock: {m.stock}) - ₹{m.unitPrice}
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={item.quantity}
                    onChange={(e) => {
                      const qty = Number(e.target.value);
                      setDispenseItems((prev) =>
                        prev.map((it, i) => (i === idx ? { ...it, quantity: qty } : it))
                      );
                    }}
                    className="w-24 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 text-center"
                    placeholder="Qty"
                  />
                </div>
              ))}
            </div>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('inventory')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold transition shadow-lg shadow-cyan-600/20"
              >
                Complete Dispense & Print Invoice
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Pharmacy;

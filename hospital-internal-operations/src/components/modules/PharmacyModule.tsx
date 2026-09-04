import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import { Pill, Search, ShoppingBag, Package } from 'lucide-react';

export const PharmacyModule: React.FC = () => {
  const { addToast } = useHospital();
  const [searchQuery, setSearchQuery] = useState('');

  const inventory = [
    { id: 'med-1', name: 'Paracetamol 650mg (Dolo)', category: 'Analgesic', stock: 1450, price: 3.5, expiry: '2027-11', batch: 'BATCH-D90' },
    { id: 'med-2', name: 'Amoxicillin + Clavulanate 625mg', category: 'Antibiotic', stock: 420, price: 18.0, expiry: '2027-04', batch: 'BATCH-A12' },
    { id: 'med-3', name: 'Telmisartan 40mg (Telma)', category: 'Antihypertensive', stock: 890, price: 8.5, expiry: '2028-01', batch: 'BATCH-T44' },
    { id: 'med-4', name: 'Metformin 500mg SR (Glycomet)', category: 'Antidiabetic', stock: 2100, price: 4.0, expiry: '2027-09', batch: 'BATCH-M08' },
    { id: 'med-5', name: 'Pantoprazole 40mg (Pan-40)', category: 'Antacid / PPI', stock: 680, price: 9.0, expiry: '2027-06', batch: 'BATCH-P19' },
    { id: 'med-6', name: 'Atorvastatin 10mg (Atorva)', category: 'Statin / Lipid', stock: 540, price: 12.0, expiry: '2027-12', batch: 'BATCH-S31' },
  ];

  const pendingPrescriptions = [
    { id: 'rx-101', uhid: 'UHID-2026-9041', patientName: 'Kavitha Venkatram', doctorName: 'Dr. Vikram Reddy', items: 'Telmisartan 40mg (1-0-0), Atorvastatin 10mg (0-0-1)', total: 615, status: 'Pending Dispense' },
    { id: 'rx-102', uhid: 'UHID-2026-8801', patientName: 'Narayana Swamy', doctorName: 'Dr. Sunita Kulkarni', items: 'Metformin 500mg (1-0-1), Pan-40 (1-0-0)', total: 390, status: 'Pending Dispense' },
  ];

  const filteredInventory = inventory.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 text-slate-100">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/80 p-6 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Pill className="w-6 h-6 text-emerald-400" />
            Hospital OPD & IPD Pharmacy Desk
          </h2>
          <p className="text-xs text-slate-400 mt-1">Real-time e-Prescription fulfillment, stock telemetry, and batch tracking</p>
        </div>
        <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
          Stock Status: 6,080 Units Online
        </span>
      </div>

      {/* Pending Prescriptions Queue */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-cyan-400" />
          Pending e-Prescriptions Queue ({pendingPrescriptions.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {pendingPrescriptions.map((rx) => (
            <div key={rx.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bold text-slate-100">{rx.patientName}</div>
                  <div className="text-[10px] text-cyan-400 font-mono">{rx.uhid} • Prescribed by {rx.doctorName}</div>
                </div>
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                  {rx.status}
                </span>
              </div>

              <div className="text-slate-300 text-[11px] bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                {rx.items}
              </div>

              <div className="flex justify-between items-center pt-1">
                <span className="font-mono text-sm font-bold text-emerald-400">Total: ₹{rx.total}</span>
                <button
                  onClick={() => addToast('Prescription Dispensed', `Dispensed medicines & billed ₹${rx.total} for ${rx.patientName}`, 'success')}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
                >
                  Dispense & Bill Receipt
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pharmacy Medicine Stock Telemetry */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Package className="w-4 h-4 text-purple-400" />
            Medicine Inventory & Batch Telemetry
          </h3>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search medicine name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-100"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3">Medicine Name</th>
                <th className="p-3">Category</th>
                <th className="p-3">Batch No</th>
                <th className="p-3">Stock Units</th>
                <th className="p-3">Unit Price</th>
                <th className="p-3">Expiry Date</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredInventory.map((item) => (
                <tr key={item.id} className="hover:bg-slate-950/60">
                  <td className="p-3 font-bold text-white">{item.name}</td>
                  <td className="p-3 text-cyan-400">{item.category}</td>
                  <td className="p-3 font-mono text-[10px] text-slate-400">{item.batch}</td>
                  <td className="p-3 font-mono font-bold text-emerald-400">{item.stock} Units</td>
                  <td className="p-3 font-mono text-slate-200">₹{item.price.toFixed(2)}</td>
                  <td className="p-3 font-mono text-slate-400">{item.expiry}</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => addToast('Stock Restocked', `Added 100 units to ${item.name}`, 'info')}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-[10px]"
                    >
                      + Add Stock
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

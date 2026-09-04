import React, { useState, useMemo } from 'react';
import { useHospital } from '../../context/HospitalContext';
import type { PaymentSplit, BillItem, BillingInvoice } from '../../types';
import {
  Receipt,
  Search,
  Plus,
  Printer,
  Trash2,
  X,
  Building2,
  CheckCircle2,
} from 'lucide-react';

export const BillingModule: React.FC = () => {
  const {
    invoices,
    processPayment,
    addInvoice,
    patients,
    doctors,
    activeBranch,
    currentUser,
    addToast,
  } = useHospital();

  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>(invoices[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Paid' | 'Partial' | 'Unpaid'>('all');

  // Payment Processing Split State
  const [newSplitMode, setNewSplitMode] = useState<PaymentSplit['mode']>('UPI');
  const [newSplitAmount, setNewSplitAmount] = useState<string>('');
  const [newSplitRef, setNewSplitRef] = useState<string>('');
  const [discountInput, setDiscountInput] = useState<string>('');

  // Create New Invoice Modal State
  const [showNewInvoiceModal, setShowNewInvoiceModal] = useState(false);
  const [newInvPatientId, setNewInvPatientId] = useState('');
  const [newInvCategory, setNewInvCategory] = useState<'OP Consultation' | 'IPD Inpatient' | 'Pharmacy' | 'Diagnostics' | 'Day Care'>('OP Consultation');
  const [newInvDoctorName, setNewInvDoctorName] = useState(doctors[0]?.name || 'Dr. Vikram Reddy');
  const [newInvItems, setNewInvItems] = useState<BillItem[]>([
    {
      id: 'item-1',
      description: 'Senior Consultant OPD Examination Fee',
      category: 'Consultation',
      quantity: 1,
      unitPrice: 500,
      totalPrice: 500,
    },
    {
      id: 'item-2',
      description: 'Hospital Digital Case Sheet & Registration Charges',
      category: 'Procedure',
      quantity: 1,
      unitPrice: 30,
      totalPrice: 30,
    },
  ]);
  const [customItemDesc, setCustomItemDesc] = useState('');
  const [customItemCategory, setCustomItemCategory] = useState<BillItem['category']>('Procedure');
  const [customItemPrice, setCustomItemPrice] = useState('350');
  const [customItemQty, setCustomItemQty] = useState('1');

  // Printable Receipt Modal State
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [receiptToPrint, setReceiptToPrint] = useState<BillingInvoice | null>(null);

  const selectedInvoice = invoices.find((inv) => inv.id === selectedInvoiceId);

  // Filtered Invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        inv.invoiceNo.toLowerCase().includes(q) ||
        inv.patientName.toLowerCase().includes(q) ||
        inv.patientUhid.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === 'all' ? true : inv.paymentStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [invoices, searchQuery, statusFilter]);

  // Cashier End-of-Shift Reconciliation Totals
  const reconciliation = useMemo(() => {
    let totalInvoiced = 0;
    let totalDiscount = 0;
    let totalPaid = 0;
    let totalDue = 0;
    let cashTotal = 0;
    let upiTotal = 0;
    let cardTotal = 0;
    let insuranceTotal = 0;

    invoices.forEach((inv) => {
      totalInvoiced += inv.subtotal;
      totalDiscount += inv.discountAmount || 0;
      totalPaid += inv.paidAmount;
      totalDue += inv.dueAmount;

      inv.payments.forEach((p) => {
        if (p.mode === 'Cash') cashTotal += p.amount;
        else if (p.mode === 'UPI') upiTotal += p.amount;
        else if (p.mode === 'Credit Card' || p.mode === 'Debit Card' || p.mode === 'Net Banking') cardTotal += p.amount;
        else if (p.mode === 'Insurance') insuranceTotal += p.amount;
      });
    });

    return {
      totalInvoiced,
      totalDiscount,
      netRevenue: totalInvoiced - totalDiscount,
      totalPaid,
      totalDue,
      cashTotal,
      upiTotal,
      cardTotal,
      insuranceTotal,
    };
  }, [invoices]);

  const handleAddPaymentSplit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice || !newSplitAmount) return;

    const amount = Number(newSplitAmount);
    if (isNaN(amount) || amount <= 0) {
      addToast('Invalid Amount', 'Please enter a valid payment amount.', 'warning');
      return;
    }

    const newPayment: PaymentSplit = {
      mode: newSplitMode,
      amount,
      referenceNo: newSplitRef || `${newSplitMode.toUpperCase()}-${Date.now().toString().slice(-6)}`,
    };

    const discount = Number(discountInput) || 0;

    processPayment(selectedInvoice.id, [newPayment], discount);

    setNewSplitAmount('');
    setNewSplitRef('');
    setDiscountInput('');
  };

  const handleAddCustomBillItem = () => {
    if (!customItemDesc.trim()) return;
    const price = Number(customItemPrice) || 0;
    const qty = Number(customItemQty) || 1;
    const newItem: BillItem = {
      id: `bi-${Date.now()}`,
      description: customItemDesc.trim(),
      category: customItemCategory,
      quantity: qty,
      unitPrice: price,
      totalPrice: price * qty,
    };
    setNewInvItems([...newInvItems, newItem]);
    setCustomItemDesc('');
    setCustomItemPrice('200');
    setCustomItemQty('1');
  };

  const handleRemoveBillItem = (id: string) => {
    setNewInvItems(newInvItems.filter((it) => it.id !== id));
  };

  const handleCreateNewInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const pat = patients.find((p) => p.id === newInvPatientId);
    if (!pat) {
      addToast('Patient Required', 'Please select a registered patient.', 'warning');
      return;
    }

    if (newInvItems.length === 0) {
      addToast('Items Required', 'Please add at least one line item to the bill.', 'warning');
      return;
    }

    const subtotal = newInvItems.reduce((acc, it) => acc + it.totalPrice, 0);
    const invoiceNo = `INV-${new Date().getFullYear()}-${Math.floor(70000 + Math.random() * 29000)}`;

    const newInv: Omit<BillingInvoice, 'id'> = {
      invoiceNo,
      patientId: pat.id,
      patientName: pat.name,
      patientUhid: pat.uhid,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      items: newInvItems,
      subtotal,
      discountAmount: 0,
      taxAmount: 0,
      netTotal: subtotal,
      payments: [],
      paidAmount: 0,
      dueAmount: subtotal,
      paymentStatus: 'Unpaid',
      generatedBy: currentUser?.name || 'Chief Cashier',
    };

    addInvoice(newInv);
    setShowNewInvoiceModal(false);
    setNewInvPatientId('');
  };

  const handleOpenPrintReceipt = (inv: BillingInvoice) => {
    setReceiptToPrint(inv);
    setShowPrintModal(true);
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/80 p-6 rounded-2xl border border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" />
              <span>Campus: <strong>{activeBranch?.name}</strong></span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center gap-1">
              <Receipt className="w-3.5 h-3.5" />
              <span>Multi-Split Payment Ledger</span>
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-white mt-1.5 flex items-center gap-2">
            Billing & Cash Counter Operations
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Instant OP consultation bills, IPD running ledgers, multi-split mode receipt generation, and cashier shift closure.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setShowNewInvoiceModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-extrabold shadow-lg shadow-emerald-950/50 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Generate New Bill</span>
          </button>

          {selectedInvoice && (
            <button
              onClick={() => handleOpenPrintReceipt(selectedInvoice)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 text-xs font-bold transition"
            >
              <Printer className="w-4 h-4 text-cyan-400" />
              <span>Print Bill / Receipt</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Net Invoiced</span>
          <strong className="text-lg font-black text-slate-100 font-mono block mt-0.5">
            ₹{reconciliation.netRevenue.toLocaleString()}
          </strong>
          <span className="text-[9px] text-slate-500">Gross: ₹{reconciliation.totalInvoiced.toLocaleString()}</span>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">Total Collected</span>
          <strong className="text-lg font-black text-emerald-400 font-mono block mt-0.5">
            ₹{reconciliation.totalPaid.toLocaleString()}
          </strong>
          <span className="text-[9px] text-emerald-500/80">Realized Cash & Digital</span>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">💵 Cash In Vault</span>
          <strong className="text-lg font-black text-amber-400 font-mono block mt-0.5">
            ₹{reconciliation.cashTotal.toLocaleString()}
          </strong>
          <span className="text-[9px] text-slate-500">Physical Counter Cash</span>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block">📱 UPI / QR Scan</span>
          <strong className="text-lg font-black text-cyan-400 font-mono block mt-0.5">
            ₹{reconciliation.upiTotal.toLocaleString()}
          </strong>
          <span className="text-[9px] text-slate-500">Instant Bank Transfers</span>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider block">💳 Card & POS</span>
          <strong className="text-lg font-black text-purple-400 font-mono block mt-0.5">
            ₹{reconciliation.cardTotal.toLocaleString()}
          </strong>
          <span className="text-[9px] text-slate-500">Debit & Credit Cards</span>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider block">⚠️ Total Outstanding</span>
          <strong className="text-lg font-black text-rose-400 font-mono block mt-0.5">
            ₹{reconciliation.totalDue.toLocaleString()}
          </strong>
          <span className="text-[9px] text-rose-500/80">Pending Patient Dues</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-400" />
              Invoices Roster ({filteredInvoices.length})
            </h3>
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[10px]">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-2 py-0.5 rounded font-semibold ${statusFilter === 'all' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('Unpaid')}
                className={`px-2 py-0.5 rounded font-semibold ${statusFilter === 'Unpaid' ? 'bg-rose-600 text-white' : 'text-slate-400'}`}
              >
                Unpaid
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('Paid')}
                className={`px-2 py-0.5 rounded font-semibold ${statusFilter === 'Paid' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}
              >
                Paid
              </button>
            </div>
          </div>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search Invoice #, Patient Name, UHID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filteredInvoices.map((inv) => {
              const isSelected = inv.id === selectedInvoiceId;
              return (
                <div
                  key={inv.id}
                  onClick={() => setSelectedInvoiceId(inv.id)}
                  className={`p-3.5 rounded-xl border transition cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800/90 border-emerald-500/60 shadow-md shadow-emerald-950/40'
                      : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-emerald-400">{inv.invoiceNo}</span>
                    <span
                      className={`px-2 py-0.5 text-[9px] font-bold rounded ${
                        inv.paymentStatus === 'Paid'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : inv.paymentStatus === 'Partial'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {inv.paymentStatus}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-100">{inv.patientName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">UHID: {inv.patientUhid} • {inv.date.slice(0, 10)}</div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="text-xs font-extrabold text-slate-100">
                        ₹{inv.netTotal.toLocaleString()}
                      </div>
                      {inv.dueAmount > 0 ? (
                        <div className="text-[10px] text-rose-400 font-bold">Due: ₹{inv.dueAmount.toLocaleString()}</div>
                      ) : (
                        <div className="text-[10px] text-emerald-400 font-bold">Fully Cleared</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-6">
          {selectedInvoice ? (
            <>
              <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-white font-mono">{selectedInvoice.invoiceNo}</h3>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {selectedInvoice.paymentStatus}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Issued on <span className="font-mono text-slate-300">{selectedInvoice.date}</span> by{' '}
                    <strong className="text-slate-200">{selectedInvoice.generatedBy}</strong>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-100">{selectedInvoice.patientName}</div>
                  <div className="text-[10px] text-slate-400 font-mono">UHID: {selectedInvoice.patientUhid}</div>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Rendered Clinical & Hospitality Line Items
                </span>
                <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950/60">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-900 text-slate-400 text-[10px] uppercase font-bold border-b border-slate-800">
                      <tr>
                        <th className="p-2.5">Service Description</th>
                        <th className="p-2.5">Category</th>
                        <th className="p-2.5 text-center">Qty</th>
                        <th className="p-2.5 text-right">Unit Price</th>
                        <th className="p-2.5 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      {selectedInvoice.items.map((it) => (
                        <tr key={it.id} className="hover:bg-slate-900/40">
                          <td className="p-2.5 font-sans font-medium text-slate-200">{it.description}</td>
                          <td className="p-2.5 font-sans text-[10px] text-slate-400">{it.category}</td>
                          <td className="p-2.5 text-center text-slate-300">{it.quantity}</td>
                          <td className="p-2.5 text-right text-slate-300">₹{it.unitPrice.toLocaleString()}</td>
                          <td className="p-2.5 text-right font-bold text-slate-100">₹{it.totalPrice.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between flex-wrap gap-4 font-mono">
                <div>
                  <span className="text-[10px] uppercase text-slate-500 block">Subtotal</span>
                  <span className="text-sm font-bold text-slate-300">₹{selectedInvoice.subtotal.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-500 block">Discount</span>
                  <span className="text-sm font-bold text-amber-400">-₹{selectedInvoice.discountAmount.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-500 block">Net Payable</span>
                  <span className="text-base font-black text-cyan-400">₹{selectedInvoice.netTotal.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-500 block">Paid Amount</span>
                  <span className="text-base font-black text-emerald-400">₹{selectedInvoice.paidAmount.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-500 block">Balance Due</span>
                  <span className={`text-base font-black ${selectedInvoice.dueAmount > 0 ? 'text-rose-400' : 'text-slate-500'}`}>
                    ₹{selectedInvoice.dueAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Recorded Multi-Split Payment Vouchers ({selectedInvoice.payments.length})
                </span>
                {selectedInvoice.payments.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedInvoice.payments.map((p, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            {p.mode}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400">{p.referenceNo}</span>
                        </div>
                        <strong className="font-mono text-emerald-400 font-bold">₹{p.amount.toLocaleString()}</strong>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 text-slate-500 text-xs text-center">
                    No payment transactions received yet.
                  </div>
                )}
              </div>

              {selectedInvoice.dueAmount > 0 ? (
                <form onSubmit={handleAddPaymentSplit} className="p-4 rounded-xl bg-slate-950/90 border border-emerald-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <Plus className="w-3.5 h-3.5" /> Collect Payment / Post Split Voucher
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Remaining Due: <strong className="text-rose-400">₹{selectedInvoice.dueAmount.toLocaleString()}</strong>
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-400 font-bold mb-1">Payment Mode</label>
                      <select
                        value={newSplitMode}
                        onChange={(e) => setNewSplitMode(e.target.value as any)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                      >
                        <option value="Cash">💵 Cash</option>
                        <option value="UPI">📱 UPI / QR Code</option>
                        <option value="Credit Card">💳 Credit Card</option>
                        <option value="Debit Card">💳 Debit Card</option>
                        <option value="Insurance">🛡️ TPA Insurance Pre-Auth</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-400 font-bold mb-1">Split Amount (₹) *</label>
                      <input
                        type="number"
                        value={newSplitAmount}
                        onChange={(e) => setNewSplitAmount(e.target.value)}
                        placeholder={`e.g., ${selectedInvoice.dueAmount}`}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-bold mb-1">UTR / Card Auth / Ref #</label>
                      <input
                        type="text"
                        value={newSplitRef}
                        onChange={(e) => setNewSplitRef(e.target.value)}
                        placeholder="e.g. UPI/419283921"
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md transition active:scale-95"
                    >
                      Record Split Payment
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <strong>This invoice is fully settled and cleared.</strong>
                  </span>
                  <button
                    onClick={() => handleOpenPrintReceipt(selectedInvoice)}
                    className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                  >
                    Print Final Receipt
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs">
              Select an invoice to view line items and record payment transactions.
            </div>
          )}
        </div>
      </div>

      {/* CREATE NEW BILL / INVOICE MODAL */}
      {showNewInvoiceModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in duration-150">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100 uppercase">
                    GENERATE NEW MEDICAL INVOICE / BILL
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    OP Consultation, Inpatient Services, Lab &amp; Pharmacy
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowNewInvoiceModal(false)}
                className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewInvoice} className="p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Select Patient *</label>
                <select
                  value={newInvPatientId}
                  onChange={(e) => setNewInvPatientId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-emerald-500"
                  required
                >
                  <option value="">-- Choose Registered Patient (UHID) --</option>
                  {patients.map((pat) => (
                    <option key={pat.id} value={pat.id}>
                      {pat.name} ({pat.uhid}) • {pat.phone}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Billing Service Category</label>
                  <select
                    value={newInvCategory}
                    onChange={(e) => setNewInvCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="OP Consultation">OP Consultation &amp; Registration</option>
                    <option value="IPD Inpatient">IPD Inpatient Hospitalization</option>
                    <option value="Pharmacy">Pharmacy &amp; Medicines</option>
                    <option value="Diagnostics">Diagnostics / Pathology Lab</option>
                    <option value="Day Care">Day Care / Minor Procedure</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Attending Consultant / Doctor</label>
                  <select
                    value={newInvDoctorName}
                    onChange={(e) => setNewInvDoctorName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    {doctors.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name} ({d.departmentName})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-slate-300 block">Itemized Services &amp; Tariffs</span>
                <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-900 text-slate-400 text-[10px] uppercase font-bold border-b border-slate-800">
                      <tr>
                        <th className="p-2">Item Description</th>
                        <th className="p-2">Category</th>
                        <th className="p-2 text-center">Qty</th>
                        <th className="p-2 text-right">Price</th>
                        <th className="p-2 text-right">Total</th>
                        <th className="p-2 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 font-mono">
                      {newInvItems.map((item) => (
                        <tr key={item.id}>
                          <td className="p-2 font-sans text-slate-200">{item.description}</td>
                          <td className="p-2 font-sans text-[10px] text-slate-400">{item.category}</td>
                          <td className="p-2 text-center">{item.quantity}</td>
                          <td className="p-2 text-right">₹{item.unitPrice}</td>
                          <td className="p-2 text-right font-bold text-emerald-400">₹{item.totalPrice}</td>
                          <td className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveBillItem(item.id)}
                              className="text-rose-400 hover:text-rose-300 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                  <Plus className="w-3 h-3 text-emerald-400" /> Add Additional Charge
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                  <input
                    type="text"
                    placeholder="Service / Medicine name..."
                    value={customItemDesc}
                    onChange={(e) => setCustomItemDesc(e.target.value)}
                    className="sm:col-span-2 bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-100"
                  />
                  <select
                    value={customItemCategory}
                    onChange={(e) => setCustomItemCategory(e.target.value as any)}
                    className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-100"
                  >
                    <option value="Procedure">Procedure</option>
                    <option value="Consultation">Consultation</option>
                    <option value="Pharmacy">Pharmacy</option>
                    <option value="Investigation">Investigation</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Price ₹"
                    value={customItemPrice}
                    onChange={(e) => setCustomItemPrice(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-100 font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomBillItem}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg transition"
                  >
                    + Add Line
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between font-mono">
                <span className="text-slate-400">Gross Estimated Bill:</span>
                <strong className="text-base text-emerald-400 font-bold">
                  ₹{newInvItems.reduce((a, b) => a + b.totalPrice, 0).toLocaleString()}
                </strong>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewInvoiceModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-950/50"
                >
                  Generate &amp; Post Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. OFFICIAL HIGH-DEFINITION PRINTABLE BILL-CUM-RECEIPT MODAL */}
      {showPrintModal && receiptToPrint && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white print:static">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden my-6 print:my-0 print:border-none print:shadow-none print:w-full print:max-w-none">
            {/* Modal Controls (Hidden in Print) */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between print:hidden">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                  <Printer className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100 uppercase">
                    Official Tax Invoice &amp; Payment Receipt
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {receiptToPrint.invoiceNo} • {receiptToPrint.patientName}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-950/50 transition flex items-center gap-1.5 active:scale-95"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Document</span>
                </button>
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* PRINTABLE RECEIPT CONTAINER */}
            <div className="p-8 bg-white text-slate-900 font-sans text-xs space-y-4 max-h-[82vh] overflow-y-auto print:max-h-none print:overflow-visible print:p-4 print:text-black">
              {/* 1. Official Hospital Letterhead */}
              <div className="border-b-2 border-slate-900 pb-3 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-slate-950 text-white flex items-center justify-center font-black text-lg border border-slate-900">
                      ✚
                    </div>
                    <div>
                      <h1 className="text-xl font-black uppercase tracking-tight text-slate-950 leading-none">
                        BHASKAR REDDY SUPER SPECIALITY HOSPITALS
                      </h1>
                      <div className="text-[11px] font-bold text-slate-700 tracking-wide mt-0.5">
                        CANCER RESEARCH INSTITUTE &amp; TERTIARY CARE CENTRE
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-600 font-medium">
                    {activeBranch.name} • Dargamitta Main Road, Nellore, AP - 524003 • 24x7 Emergency: 0861-2345678 / 9849012345
                  </p>
                  <div className="flex items-center gap-3 text-[9px] font-semibold text-slate-500">
                    <span>GSTIN: <strong className="text-slate-800">37AAAAA1234A1Z8</strong></span>
                    <span>•</span>
                    <span>PAN: <strong className="text-slate-800">AAAAA1234A</strong></span>
                    <span>•</span>
                    <span>Reg No: <strong className="text-slate-800">AP-MED-2024-8891</strong></span>
                    <span>•</span>
                    <span className="text-emerald-800 font-bold">NABH &amp; NABL Accredited</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="border border-slate-900 bg-slate-100 px-3 py-1 rounded text-center">
                    <span className="text-[11px] font-black text-slate-950 uppercase tracking-wider block">
                      TAX INVOICE &amp; RECEIPT
                    </span>
                    <span className="text-[9px] text-slate-600 block font-mono">Original for Recipient</span>
                  </div>
                  <div className="mt-1 font-mono text-[10px] text-slate-600">
                    <div>Date: <strong>{receiptToPrint.date.slice(0, 10)}</strong></div>
                    <div>Time: <strong>{receiptToPrint.date.slice(11) || '11:30 AM'}</strong></div>
                  </div>
                </div>
              </div>

              {/* 2. Structured Two-Column Patient & Clinical Demographics */}
              <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 border border-slate-300 rounded-lg text-[11px]">
                <div className="space-y-1">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-0.5">
                    <span className="text-slate-500">Patient Name:</span>
                    <strong className="text-slate-950 font-bold uppercase">{receiptToPrint.patientName}</strong>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-200 pb-0.5">
                    <span className="text-slate-500">UHID / MRN:</span>
                    <strong className="font-mono text-purple-900 font-bold">{receiptToPrint.patientUhid}</strong>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-200 pb-0.5">
                    <span className="text-slate-500">Age / Gender:</span>
                    <span className="text-slate-800 font-medium">52 Yrs / Male • Blood: O+ve</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Mobile Phone:</span>
                    <span className="font-mono text-slate-800">+91 98490 54321</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-0.5">
                    <span className="text-slate-500">Bill / Receipt #:</span>
                    <strong className="font-mono text-slate-950 font-bold">{receiptToPrint.invoiceNo}</strong>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-200 pb-0.5">
                    <span className="text-slate-500">Attending Consultant:</span>
                    <strong className="text-slate-900">Dr. Vikram Reddy, MD, DM</strong>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-200 pb-0.5">
                    <span className="text-slate-500">Department:</span>
                    <span className="text-slate-800 font-medium">Medical Oncology (Room #204)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Payment Category:</span>
                    <span className="font-bold text-emerald-800">Direct Patient Self-Pay</span>
                  </div>
                </div>
              </div>

              {/* 3. High-Definition Itemized Tariff Table */}
              <div className="rounded border border-slate-300 overflow-hidden">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-slate-100 text-[10px] uppercase font-bold text-slate-800 border-b border-slate-300">
                    <tr>
                      <th className="p-2 w-8 text-center border-r border-slate-300">#</th>
                      <th className="p-2 border-r border-slate-300">Service Description / Tariff Item</th>
                      <th className="p-2 border-r border-slate-300 text-center w-20">SAC / Code</th>
                      <th className="p-2 border-r border-slate-300 text-center w-12">Qty</th>
                      <th className="p-2 border-r border-slate-300 text-right w-24">Rate (₹)</th>
                      <th className="p-2 border-r border-slate-300 text-right w-20">Disc (₹)</th>
                      <th className="p-2 text-right w-24">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                    {receiptToPrint.items.map((it, idx) => (
                      <tr key={it.id} className="hover:bg-slate-50">
                        <td className="p-2 text-center text-slate-500 border-r border-slate-200">{idx + 1}</td>
                        <td className="p-2 font-sans font-medium text-slate-900 border-r border-slate-200">
                          <div>{it.description}</div>
                          <div className="text-[9px] text-slate-500 font-sans">{it.category}</div>
                        </td>
                        <td className="p-2 text-center text-slate-600 border-r border-slate-200 text-[10px]">
                          999312
                        </td>
                        <td className="p-2 text-center text-slate-800 border-r border-slate-200">{it.quantity}</td>
                        <td className="p-2 text-right text-slate-700 border-r border-slate-200">
                          ₹{it.unitPrice.toFixed(2)}
                        </td>
                        <td className="p-2 text-right text-slate-500 border-r border-slate-200">₹0.00</td>
                        <td className="p-2 text-right font-bold text-slate-950">
                          ₹{it.totalPrice.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 4. Financial Calculations & Totals Bar */}
              <div className="grid grid-cols-12 gap-4 items-start">
                {/* Left Amount in Words & Notes */}
                <div className="col-span-7 space-y-2 text-[11px]">
                  <div className="p-2.5 bg-slate-50 border border-slate-300 rounded space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Amount in Words:</span>
                    <strong className="text-slate-950 font-bold block italic font-serif">
                      Rupees {receiptToPrint.netTotal.toLocaleString()} Only
                    </strong>
                  </div>

                  {/* Multi-Payment Recorded Details */}
                  {receiptToPrint.payments.length > 0 && (
                    <div className="p-2.5 border border-slate-300 rounded space-y-1 bg-slate-50">
                      <span className="text-[10px] font-bold uppercase text-slate-600 block">
                        Payment Mode Voucher Ledger:
                      </span>
                      <div className="space-y-0.5 text-[10px] font-mono">
                        {receiptToPrint.payments.map((p, i) => (
                          <div key={i} className="flex justify-between border-b border-slate-200 pb-0.5">
                            <span>
                              <strong>{p.mode}</strong> (Ref: {p.referenceNo}):
                            </span>
                            <strong className="text-emerald-900">₹{p.amount.toFixed(2)}</strong>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Numerical Financial Summary */}
                <div className="col-span-5 border border-slate-300 rounded bg-slate-50 p-2.5 font-mono text-xs space-y-1">
                  <div className="flex justify-between text-slate-600">
                    <span>Gross Total:</span>
                    <span>₹{receiptToPrint.subtotal.toFixed(2)}</span>
                  </div>
                  {receiptToPrint.discountAmount > 0 && (
                    <div className="flex justify-between text-amber-700">
                      <span>Discount / Waiver:</span>
                      <span>-₹{receiptToPrint.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600">
                    <span>CGST (0%):</span>
                    <span>₹0.00</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>SGST (0%):</span>
                    <span>₹0.00</span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-slate-950 border-t-2 border-slate-300 pt-1">
                    <span>Net Bill Amount:</span>
                    <span>₹{receiptToPrint.netTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-800 font-bold">
                    <span>Paid Amount:</span>
                    <span>₹{receiptToPrint.paidAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-rose-700 font-bold border-t border-slate-200 pt-0.5">
                    <span>Balance Due:</span>
                    <span>₹{receiptToPrint.dueAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* 5. Policy Notice & 15-Day OP Consultation Validity */}
              <div className="p-2.5 border border-dashed border-slate-400 rounded bg-slate-50/80 text-[10px] space-y-1 text-slate-700">
                <div className="font-bold text-slate-900 uppercase flex items-center gap-1">
                  <span>ℹ️ Consultation Validity &amp; Hospital Terms:</span>
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-slate-600">
                  <li>
                    <strong>15-Day Free Follow-Up:</strong> This outpatient consultation receipt is valid for <strong>15 days</strong> from the date of issue for 1 free follow-up review with the same consultant.
                  </li>
                  <li>
                    Please present this physical or digital bill receipt at the reception and pharmacy counters for verification.
                  </li>
                  <li>
                    Healthcare diagnostic &amp; consultation services are exempt from GST under Indian Tax Regulations.
                  </li>
                </ul>
              </div>

              {/* 6. Signatures, Barcode & Digital Authentication */}
              <div className="pt-4 border-t-2 border-slate-900 grid grid-cols-3 gap-4 items-end text-[10px]">
                <div className="text-center space-y-3">
                  <div className="h-8 border-b border-slate-400"></div>
                  <div className="text-slate-600 font-medium">Patient / Attendant Signature</div>
                </div>

                <div className="text-center space-y-1">
                  <div className="font-mono text-[9px] text-slate-400 tracking-widest">
                    ||||| | |||| ||| |||||| |||| | ||
                  </div>
                  <div className="text-[9px] font-mono font-bold text-slate-700">{receiptToPrint.invoiceNo}</div>
                  <div className="text-[8px] text-slate-400">Digitally Verified &amp; Encrypted</div>
                </div>

                <div className="text-center space-y-1">
                  <div className="h-8 flex items-end justify-center font-serif italic text-slate-800 font-bold text-xs">
                    {receiptToPrint.generatedBy}
                  </div>
                  <div className="border-t border-slate-400 pt-0.5 font-bold text-slate-900">
                    Authorized Cashier / Accounts
                  </div>
                  <div className="text-[9px] text-slate-500">Bhaskar Reddy Super Speciality Hospitals</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

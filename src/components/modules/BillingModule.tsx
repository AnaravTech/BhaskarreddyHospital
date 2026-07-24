import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import type { PaymentSplit } from '../../types';
import {
  Receipt,
  Search,
  Plus,
  Printer,
  FileText,
  Lock,
} from 'lucide-react';

export const BillingModule: React.FC = () => {
  const { invoices, processPayment } = useHospital();

  const [selectedInvoiceId, setSelectedInvoiceId] = useState(invoices[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');

  // Payment Processing Split State
  const [newSplitMode, setNewSplitMode] = useState<PaymentSplit['mode']>('UPI');
  const [newSplitAmount, setNewSplitAmount] = useState<string>('');
  const [newSplitRef, setNewSplitRef] = useState<string>('');
  const [discountInput, setDiscountInput] = useState<string>('');

  const selectedInvoice = invoices.find((inv) => inv.id === selectedInvoiceId);

  const filteredInvoices = invoices.filter(
    (inv) =>
      inv.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.patientUhid.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddPaymentSplit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice || !newSplitAmount) return;

    const amount = Number(newSplitAmount);
    if (isNaN(amount) || amount <= 0) return;

    const newPayment: PaymentSplit = {
      mode: newSplitMode,
      amount,
      referenceNo: newSplitRef || `REF-${Date.now().toString().slice(-6)}`,
    };

    const discount = Number(discountInput) || 0;

    processPayment(selectedInvoice.id, [newPayment], discount);

    setNewSplitAmount('');
    setNewSplitRef('');
    setDiscountInput('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Immutable Cash Desk Ledger
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-white mt-1">Billing & Multi-Payment Split Engine</h2>
          <p className="text-xs text-slate-400">
            Split payments across Cash, UPI, Cards, and TPA Insurance with instant audit logging.
          </p>
        </div>

        <button
          onClick={() => alert('Printing itemized medical invoice receipt...')}
          disabled={!selectedInvoice}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition"
        >
          <Printer className="w-4 h-4 text-cyan-400" />
          <span>Print Receipt</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Invoice List */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-400" />
              Invoices Roster ({filteredInvoices.length})
            </h3>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search Invoice #, Patient..."
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
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {inv.paymentStatus}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-100">{inv.patientName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">UHID: {inv.patientUhid}</div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="text-xs font-extrabold text-slate-100">
                        ₹{inv.netTotal.toLocaleString()}
                      </div>
                      {inv.dueAmount > 0 && (
                        <div className="text-[10px] text-rose-400 font-bold">Due: ₹{inv.dueAmount}</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Invoice & Multi-Split Workbench */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-6">
          {selectedInvoice ? (
            <>
              {/* Invoice Summary Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-white">{selectedInvoice.invoiceNo}</h3>
                    <span className="text-xs text-slate-400 font-mono">• {selectedInvoice.date}</span>
                  </div>
                  <div className="text-xs text-slate-300 mt-0.5">
                    Patient: <span className="font-bold text-slate-100">{selectedInvoice.patientName}</span> (
                    {selectedInvoice.patientUhid})
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-400">Net Payable Amount</div>
                  <div className="text-2xl font-black text-emerald-400 font-mono">
                    ₹{selectedInvoice.netTotal.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-cyan-400" /> Itemized Bill Line Items
                </h4>
                <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 uppercase text-[9px]">
                        <th className="py-2 px-3">Description</th>
                        <th className="py-2 px-3">Category</th>
                        <th className="py-2 px-3">Qty</th>
                        <th className="py-2 px-3 text-right">Unit Price</th>
                        <th className="py-2 px-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-200 font-mono">
                      {selectedInvoice.items.map((item) => (
                        <tr key={item.id}>
                          <td className="py-2 px-3 font-sans font-medium">{item.description}</td>
                          <td className="py-2 px-3 text-[10px] text-slate-400 font-sans">{item.category}</td>
                          <td className="py-2 px-3">{item.quantity}</td>
                          <td className="py-2 px-3 text-right">₹{item.unitPrice.toLocaleString()}</td>
                          <td className="py-2 px-3 text-right font-bold">₹{item.totalPrice.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Subtotal, Discount & Due Breakdown */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal Amount:</span>
                  <span>₹{selectedInvoice.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-amber-400">
                  <span>Discount Applied:</span>
                  <span>- ₹{selectedInvoice.discountAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-emerald-400 font-bold border-t border-slate-800 pt-1.5">
                  <span>Net Total:</span>
                  <span>₹{selectedInvoice.netTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-cyan-400">
                  <span>Total Amount Paid So Far:</span>
                  <span>₹{selectedInvoice.paidAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-rose-400 font-bold">
                  <span>Outstanding Balance Due:</span>
                  <span>₹{selectedInvoice.dueAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Existing Payment Split Log (Immutable Ledger) */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" /> Immutable Payment Log
                </h4>
                <div className="space-y-1.5">
                  {selectedInvoice.payments.map((p, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                          {p.mode}
                        </span>
                        <span className="text-slate-300 font-mono text-[11px]">Ref: {p.referenceNo}</span>
                      </div>
                      <span className="font-extrabold text-slate-100 font-mono">
                        + ₹{p.amount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Multi-Split Payment Collector Form */}
              {selectedInvoice.dueAmount > 0 && (
                <form
                  onSubmit={handleAddPaymentSplit}
                  className="p-4 rounded-xl bg-gradient-to-r from-slate-950 to-slate-900 border border-cyan-500/30 space-y-3"
                >
                  <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5" /> Process Additional Multi-Payment Split
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">Payment Mode</label>
                      <select
                        value={newSplitMode}
                        onChange={(e: any) => setNewSplitMode(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
                      >
                        <option value="UPI">UPI / GPay / PhonePe</option>
                        <option value="Cash">Cash</option>
                        <option value="Credit Card">Credit Card</option>
                        <option value="Insurance">Insurance TPA Cashless</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">Amount (₹)</label>
                      <input
                        type="number"
                        placeholder={`Max ₹${selectedInvoice.dueAmount}`}
                        value={newSplitAmount}
                        onChange={(e) => setNewSplitAmount(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-mono"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">Transaction Ref / UTR</label>
                      <input
                        type="text"
                        placeholder="UPI Txn ID or Receipt #"
                        value={newSplitRef}
                        onChange={(e) => setNewSplitRef(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md transition"
                  >
                    Submit Payment Entry & Update Ledger
                  </button>
                </form>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs">
              Select an invoice to view line items and record payment transactions.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

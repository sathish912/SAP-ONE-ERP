import React from 'react';
import { Printer, X, Download, CheckCircle, Clock, AlertCircle, Building2 } from 'lucide-react';

export default function InvoicePrintModal({
  isOpen,
  onClose,
  invoice,
  type = 'AR', // 'AR' (Customer Invoice) or 'AP' (Supplier Voucher)
  company,
}) {
  if (!isOpen || !invoice) return null;

  const isAR = type === 'AR';
  const partyName = isAR ? invoice.customer_name : invoice.vendor_name;
  const total = Number(invoice.total_amount) || 0;
  const settled = isAR ? Number(invoice.received_amount || 0) : Number(invoice.paid_amount || 0);
  const remaining = Number(invoice.remaining_amount || 0);

  // Derive tax breakdown (assuming standard 18% GST: 9% CGST + 9% SGST)
  const taxableSubtotal = total / 1.18;
  const totalTax = total - taxableSubtotal;
  const cgst = totalTax / 2;
  const sgst = totalTax / 2;

  const formatCurrency = (amt) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: company?.currency || 'INR',
    }).format(amt || 0);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="no-print bg-slate-50 dark:bg-slate-800/80 px-6 py-3.5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400">
              <Printer className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {isAR ? 'Commercial Tax Invoice Preview' : 'Supplier Payment Voucher Preview'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Print ready format • GST Compliant
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition cursor-pointer active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-6 sm:p-10 overflow-y-auto flex-1 bg-white text-slate-800" id="printable-invoice">
          {/* Header & Logo */}
          <div className="border-b-2 border-slate-900 pb-6 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div>
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-9 h-9 rounded-xl bg-slate-900 text-white font-extrabold text-xl flex items-center justify-center">
                    S
                  </div>
                  <div>
                    <h1 className="text-xl font-black text-slate-900 tracking-tight">
                      {company?.company_name || 'SAP ONEERP TECHNOLOGIES LTD'}
                    </h1>
                    <span className="text-[11px] font-mono font-semibold text-slate-500 uppercase">
                      Co. Code: {company?.company_code || '1000'} • Corp Financial Ledger
                    </span>
                  </div>
                </div>
                <div className="text-xs text-slate-600 space-y-0.5">
                  <p>Cyber City Technology Park, Tower 4, Suite 800</p>
                  <p>Bangalore, Karnataka - 560100, India</p>
                  <p className="font-semibold text-slate-700">
                    GSTIN: <span className="font-mono text-sky-800">{company?.tax_identifier || '29AABCS1429B1Z8'}</span>
                  </p>
                </div>
              </div>

              <div className="text-right sm:self-start">
                <div className="inline-block px-3 py-1 bg-slate-900 text-white rounded text-xs font-black tracking-widest uppercase mb-2">
                  {isAR ? 'TAX INVOICE' : 'PAYMENT VOUCHER'}
                </div>
                <div className="text-xs space-y-1">
                  <p>
                    <span className="text-slate-500">Document No: </span>
                    <span className="font-mono font-bold text-slate-900">{invoice.invoice_number}</span>
                  </p>
                  <p>
                    <span className="text-slate-500">Date of Issue: </span>
                    <span className="font-medium text-slate-800">{invoice.invoice_date}</span>
                  </p>
                  <p>
                    <span className="text-slate-500">Due Date: </span>
                    <span className="font-medium text-slate-800">{invoice.due_date}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Billed To / Party Details */}
          <div className="grid grid-cols-2 gap-6 mb-8 text-xs">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                {isAR ? 'Bill To (Customer / Client):' : 'Remit To (Supplier / Creditor):'}
              </span>
              <p className="text-sm font-bold text-slate-900 mb-1">{partyName}</p>
              <p className="text-slate-600">Enterprise Commercial Services Division</p>
              <p className="text-slate-600">Commercial District, Metro Zone</p>
              <p className="text-slate-600 mt-1">
                GSTIN: <span className="font-mono font-semibold text-slate-800">29AAACG8291Q1Z4</span>
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Settlement & Audit Status:
              </span>
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-600">Status:</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded text-[11px] uppercase ${
                      invoice.status === 'PAID'
                        ? 'bg-emerald-100 text-emerald-800'
                        : invoice.status === 'PARTIAL'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {invoice.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Billing Currency:</span>
                  <span className="font-bold text-slate-900">{company?.currency || 'INR'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Payment Term:</span>
                  <span className="font-medium text-slate-800">Net 30 Days</span>
                </div>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden mb-6">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">#</th>
                  <th className="py-2.5 px-4">Item & Description</th>
                  <th className="py-2.5 px-4 text-center">HSN/SAC</th>
                  <th className="py-2.5 px-4 text-center">Qty</th>
                  <th className="py-2.5 px-4 text-right">Taxable Rate</th>
                  <th className="py-2.5 px-4 text-right">Tax (18%)</th>
                  <th className="py-2.5 px-4 text-right">Total Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-3 px-4 font-mono text-slate-500">01</td>
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-900">
                      {isAR ? 'Enterprise IT Consulting & Cloud Migration Services' : 'Corporate Infrastructure Hardware & IT Support'}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Services rendered under Master Service Agreement ref #{invoice.invoice_number}
                    </p>
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-slate-600">998313</td>
                  <td className="py-3 px-4 text-center font-mono">1.00</td>
                  <td className="py-3 px-4 text-right font-mono font-medium">{formatCurrency(taxableSubtotal)}</td>
                  <td className="py-3 px-4 text-right font-mono text-slate-600">{formatCurrency(totalTax)}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">{formatCurrency(total)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Calculation Breakdown & Bank Details */}
          <div className="grid grid-cols-2 gap-6 mb-8 text-xs">
            <div>
              <div className="border border-slate-200 rounded-xl p-3 bg-slate-50">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Bank Settlement Details:
                </span>
                <p className="font-semibold text-slate-800">State Bank of India — Corporate Branch</p>
                <p className="text-slate-600">Account No: <span className="font-mono font-bold text-slate-900">00003928192039</span></p>
                <p className="text-slate-600">IFSC Code: <span className="font-mono font-bold text-slate-900">SBIN0004921</span></p>
                <p className="text-slate-600">SWIFT / BIC: <span className="font-mono font-bold text-slate-900">SBININBB492</span></p>
              </div>
              <p className="text-[11px] text-slate-400 mt-2 italic">
                * Please quote invoice reference {invoice.invoice_number} in your bank remittance memo.
              </p>
            </div>

            <div className="space-y-2 border-t sm:border-t-0 sm:border-l border-slate-200 sm:pl-6">
              <div className="flex justify-between text-slate-600">
                <span>Taxable Subtotal:</span>
                <span className="font-mono font-medium">{formatCurrency(taxableSubtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>CGST (9.0%):</span>
                <span className="font-mono">{formatCurrency(cgst)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>SGST (9.0%):</span>
                <span className="font-mono">{formatCurrency(sgst)}</span>
              </div>
              <div className="border-t border-slate-300 pt-2 flex justify-between text-sm font-black text-slate-900">
                <span>Total Invoice Value:</span>
                <span className="font-mono text-sky-700">{formatCurrency(total)}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-semibold pt-1">
                <span>{isAR ? 'Amount Collected:' : 'Amount Paid:'}</span>
                <span className="font-mono">{formatCurrency(settled)}</span>
              </div>
              <div className="border-t border-slate-200 pt-1 flex justify-between font-bold text-rose-600">
                <span>Balance Outstanding:</span>
                <span className="font-mono">{formatCurrency(remaining)}</span>
              </div>
            </div>
          </div>

          {/* Signature & Declaration */}
          <div className="border-t border-slate-200 pt-6 mt-8 flex justify-between items-end text-xs">
            <div className="max-w-sm text-slate-500 text-[11px]">
              <p className="font-bold text-slate-700 mb-0.5">Declaration:</p>
              <p>
                We declare that this invoice shows the actual price of the goods or services described and that all particulars are true and correct.
              </p>
            </div>
            <div className="text-center">
              <div className="w-48 border-b border-slate-400 mb-2 h-12 flex items-center justify-center">
                <span className="font-serif italic text-slate-400 text-sm">Authorized Signature</span>
              </div>
              <p className="font-bold text-slate-800">For {company?.company_name || 'STACKLY SAP ONEERP'}</p>
              <p className="text-[10px] text-slate-500">Authorized Signatory</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


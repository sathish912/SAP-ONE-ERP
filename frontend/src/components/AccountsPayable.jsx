import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../api/client';
import {
  Plus,
  X,
  Search,
  Download,
  Filter,
  Printer,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { exportToCSV } from '../utils/exportCsv';
import InvoicePrintModal from './InvoicePrintModal';

export default function AccountsPayable({
  currentCompanyId,
  currentCompany,
  onRefresh,
  onToast,
}) {
  const [invoices, setInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    vendor_name: '',
    invoice_number: '',
    total_amount: '',
    invoice_date: '2026-04-10',
    due_date: '2026-04-30',
  });
  const [submitting, setSubmitting] = useState(false);

  // Print Modal State
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState(null);

  // Sorting State
  const [sortField, setSortField] = useState('invoice_date');
  const [sortDirection, setSortDirection] = useState('desc'); // 'asc' or 'desc'

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Payment Recording Modal State
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [activeInvoice, setActiveInvoice] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');

  useEffect(() => {
    loadInvoices();
  }, [currentCompanyId]);

  const loadInvoices = async () => {
    try {
      const res = await api.getAPInvoices(currentCompanyId);
      setInvoices(res.data || []);
    } catch (err) {
      onToast('error', err.message);
    }
  };

  const formatCurrency = (amt) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currentCompany?.currency || 'INR',
    }).format(amt || 0);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.createAPInvoice({
        company_id: currentCompanyId,
        ...formData,
        total_amount: parseFloat(formData.total_amount),
      });
      onToast('success', 'Supplier Invoice created successfully!');
      setModalOpen(false);
      setFormData({
        vendor_name: '',
        invoice_number: '',
        total_amount: '',
        invoice_date: '2026-04-10',
        due_date: '2026-04-30',
      });
      loadInvoices();
      onRefresh();
    } catch (err) {
      onToast('error', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.recordAPPayment(
        activeInvoice.ap_invoice_id,
        parseFloat(paymentAmount)
      );
      onToast('success', 'Payment applied to invoice!');
      setPayModalOpen(false);
      setPaymentAmount('');
      setActiveInvoice(null);
      loadInvoices();
      onRefresh();
    } catch (err) {
      onToast('error', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  // Filtered and Sorted list
  const filteredAndSortedInvoices = useMemo(() => {
    const filtered = invoices.filter((i) => {
      const matchesSearch =
        i.vendor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.invoice_number.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || i.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    return filtered.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (['total_amount', 'paid_amount', 'remaining_amount'].includes(sortField)) {
        valA = Number(valA) || 0;
        valB = Number(valB) || 0;
      } else {
        valA = String(valA || '').toLowerCase();
        valB = String(valB || '').toLowerCase();
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [invoices, searchTerm, statusFilter, sortField, sortDirection]);

  // Paginated data
  const totalPages = Math.ceil(filteredAndSortedInvoices.length / pageSize) || 1;
  const paginatedInvoices = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedInvoices.slice(start, start + pageSize);
  }, [filteredAndSortedInvoices, currentPage, pageSize]);

  const handleExport = () => {
    const headers = [
      { label: 'Invoice #', accessor: 'invoice_number' },
      { label: 'Supplier / Vendor', accessor: 'vendor_name' },
      { label: 'Invoice Date', accessor: 'invoice_date' },
      { label: 'Due Date', accessor: 'due_date' },
      { label: 'Total Amount', accessor: 'total_amount' },
      { label: 'Paid Amount', accessor: 'paid_amount' },
      { label: 'Remaining Balance', accessor: 'remaining_amount' },
      { label: 'Status', accessor: 'status' },
    ];
    exportToCSV(`AP_Invoices_${currentCompany?.company_code || 'ALL'}`, headers, filteredAndSortedInvoices);
    onToast('success', 'AP Invoices exported to CSV.');
  };

  const openPrintPreview = (inv) => {
    setSelectedInvoiceForPrint(inv);
    setPrintModalOpen(true);
  };

  const renderSortIndicator = (field) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-60 inline ml-1" />;
    }
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-3.5 h-3.5 text-sky-600 inline ml-1" />
    ) : (
      <ChevronDown className="w-3.5 h-3.5 text-sky-600 inline ml-1" />
    );
  };

  return (
    <div className="space-y-6">
      {/* Invoice / Voucher Print Modal */}
      <InvoicePrintModal
        isOpen={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
        invoice={selectedInvoiceForPrint}
        type="AP"
        company={currentCompany}
      />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Accounts Payable (AP)</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Supplier invoices, 3-way matching, due-date aging, and outward cash settlements.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExport}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="bg-sky-600 hover:bg-sky-700 active:scale-95 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow-md shadow-sky-600/20 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Supplier Invoice</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row gap-3 justify-between items-center">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search vendor or invoice #..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Status:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
          >
            <option value="ALL">All Invoices ({invoices.length})</option>
            <option value="UNPAID">Unpaid Only</option>
            <option value="PARTIAL">Partially Settled</option>
            <option value="PAID">Fully Paid</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th
                onClick={() => handleSort('invoice_number')}
                className="py-3.5 px-4 cursor-pointer select-none hover:text-sky-600 transition"
              >
                Invoice # {renderSortIndicator('invoice_number')}
              </th>
              <th
                onClick={() => handleSort('vendor_name')}
                className="py-3.5 px-4 cursor-pointer select-none hover:text-sky-600 transition"
              >
                Supplier / Vendor {renderSortIndicator('vendor_name')}
              </th>
              <th
                onClick={() => handleSort('due_date')}
                className="py-3.5 px-4 cursor-pointer select-none hover:text-sky-600 transition"
              >
                Due Date {renderSortIndicator('due_date')}
              </th>
              <th
                onClick={() => handleSort('total_amount')}
                className="py-3.5 px-4 text-right cursor-pointer select-none hover:text-sky-600 transition"
              >
                Invoice Total {renderSortIndicator('total_amount')}
              </th>
              <th
                onClick={() => handleSort('paid_amount')}
                className="py-3.5 px-4 text-right cursor-pointer select-none hover:text-sky-600 transition"
              >
                Paid {renderSortIndicator('paid_amount')}
              </th>
              <th
                onClick={() => handleSort('remaining_amount')}
                className="py-3.5 px-4 text-right cursor-pointer select-none hover:text-sky-600 transition"
              >
                Remaining Balance {renderSortIndicator('remaining_amount')}
              </th>
              <th
                onClick={() => handleSort('status')}
                className="py-3.5 px-4 text-center cursor-pointer select-none hover:text-sky-600 transition"
              >
                Status {renderSortIndicator('status')}
              </th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {paginatedInvoices.length === 0 ? (
              <tr>
                <td colSpan="8" className="p-8 text-center text-slate-400 text-xs">
                  No matching AP invoices found.
                </td>
              </tr>
            ) : (
              paginatedInvoices.map((i) => (
                <tr key={i.ap_invoice_id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-sky-600 dark:text-sky-400">{i.invoice_number}</td>
                  <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-white">{i.vendor_name}</td>
                  <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 text-xs">{i.due_date}</td>
                  <td className="py-3.5 px-4 text-right num-align text-slate-900 dark:text-white font-semibold">
                    {formatCurrency(i.total_amount)}
                  </td>
                  <td className="py-3.5 px-4 text-right num-align text-emerald-600 dark:text-emerald-400 font-semibold">
                    {formatCurrency(i.paid_amount)}
                  </td>
                  <td className="py-3.5 px-4 text-right num-align font-bold text-rose-600 dark:text-rose-400">
                    {formatCurrency(i.remaining_amount)}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`text-[11px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                        i.status === 'PAID'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                          : i.status === 'PARTIAL'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                      }`}
                    >
                      {i.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openPrintPreview(i)}
                        title="Print / View Payment Voucher"
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>

                      {i.status !== 'PAID' ? (
                        <button
                          onClick={() => {
                            setActiveInvoice(i);
                            setPaymentAmount(String(i.remaining_amount));
                            setPayModalOpen(true);
                          }}
                          className="text-xs bg-sky-50 dark:bg-sky-950 hover:bg-sky-100 dark:hover:bg-sky-900 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-800 font-bold px-2.5 py-1 rounded-lg transition cursor-pointer"
                        >
                          Pay
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic px-2">Settled</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination Bar */}
        <div className="bg-slate-50 dark:bg-slate-900/80 px-4 py-3 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 font-bold text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span className="hidden sm:inline">
              • Showing {filteredAndSortedInvoices.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
              {Math.min(currentPage * pageSize, filteredAndSortedInvoices.length)} of {filteredAndSortedInvoices.length} invoices
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-bold text-slate-700 dark:text-slate-300">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Register Supplier Invoice</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Vendor / Supplier Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AWS Cloud Infrastructure India"
                  value={formData.vendor_name}
                  onChange={(e) => setFormData({ ...formData, vendor_name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Invoice Number</label>
                  <input
                    type="text"
                    required
                    placeholder="INV-AP-9901"
                    value={formData.invoice_number}
                    onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Total Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="50000.00"
                    value={formData.total_amount}
                    onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Invoice Date</label>
                  <input
                    type="date"
                    required
                    value={formData.invoice_date}
                    onChange={(e) => setFormData({ ...formData, invoice_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-sky-600 text-white font-bold rounded-lg hover:bg-sky-700"
                >
                  {submitting ? 'Saving...' : 'Register Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pay Modal */}
      {payModalOpen && activeInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Apply Payment</h3>
              <button onClick={() => setPayModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Recording cash outflow to <b>{activeInvoice.vendor_name}</b> for Invoice #{activeInvoice.invoice_number}.
            </p>
            <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Payment Amount (Remaining: {formatCurrency(activeInvoice.remaining_amount)})
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  max={activeInvoice.remaining_amount}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 text-sm font-bold"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPayModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700"
                >
                  {submitting ? 'Applying...' : 'Confirm Outflow'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { api } from '../api/client';
import { Calendar, Plus, X } from 'lucide-react';

export default function FiscalYears({
  fiscalYears,
  currentCompanyId,
  onRefresh,
  onToast,
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    year_name: 'FY 2026-2027',
    start_date: '2026-04-01',
    end_date: '2027-03-31',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.createFiscalYear({
        company_id: currentCompanyId,
        ...formData,
      });
      onToast('success', 'Fiscal Year and 12 monthly periods generated successfully!');
      setModalOpen(false);
      onRefresh();
    } catch (err) {
      onToast('error', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (periodId, status) => {
    try {
      await api.updatePeriodStatus(periodId, status);
      onToast('info', `Period updated to ${status}`);
      onRefresh();
    } catch (err) {
      onToast('error', err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Fiscal Years & Financial Periods</h1>
          <p className="text-xs text-slate-500 mt-1">Manage reporting years and open/close posting periods.</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="bg-sky-600 hover:bg-sky-700 text-white font-medium text-xs px-4 py-2.5 rounded-lg transition shadow-sm flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Create Fiscal Year</span>
        </button>
      </div>

      {fiscalYears.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-dashed border-slate-300">
          <Calendar className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-500 text-sm mb-4">No Fiscal Year has been created for this company yet.</p>
          <button
            onClick={() => setModalOpen(true)}
            className="bg-sky-600 text-white text-xs px-4 py-2 rounded-lg font-semibold hover:bg-sky-700 transition"
          >
            Create First Fiscal Year (FY 2026-2027)
          </button>
        </div>
      ) : (
        fiscalYears.map((fy) => (
          <div key={fy.fiscal_year_id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
              <div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-sky-100 text-sky-800 uppercase">
                  Active Reporting Year
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-1">{fy.year_name}</h2>
                <p className="text-xs text-slate-500">{fy.start_date} to {fy.end_date}</p>
              </div>
              <span className="text-xs text-slate-400">12 Accounting Periods Generated</span>
            </div>

            {/* Periods Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {(fy.periods || []).map((p) => {
                const isOpen = p.status === 'OPEN';
                return (
                  <div
                    key={p.period_id}
                    className={`p-3.5 rounded-lg border ${
                      isOpen ? 'border-emerald-200 bg-emerald-50/40' : 'border-slate-200 bg-slate-50'
                    } flex justify-between items-center`}
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-800">
                        Period {p.period_number}: {p.period_name}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {p.start_date} to {p.end_date}
                      </div>
                      <span
                        className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isOpen ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {p.status}
                      </span>
                    </div>
                    <button
                      onClick={() => handleToggle(p.period_id, isOpen ? 'CLOSED' : 'OPEN')}
                      className={`text-xs px-2.5 py-1.5 rounded font-medium transition ${
                        isOpen
                          ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                          : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                      }`}
                    >
                      {isOpen ? 'Close' : 'Open'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}

      {/* Modal: Create FY */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800 text-base">Define New Fiscal Year</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Fiscal Year Label</label>
                <input
                  type="text"
                  required
                  value={formData.year_name}
                  onChange={(e) => setFormData({ ...formData, year_name: e.target.value })}
                  className="w-full text-sm px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full text-sm px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full text-sm px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm py-2 rounded-lg transition mt-2"
              >
                {submitting ? 'Generating 12 Periods...' : 'Generate Fiscal Year & 12 Periods'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


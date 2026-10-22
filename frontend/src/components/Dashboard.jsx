import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import {
  Wallet,
  TrendingUp,
  Receipt,
  Users,
  Building2,
  Calendar,
  BookOpen,
  Scale,
  ArrowRight,
  CheckCircle,
  Truck,
  Coins,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Layers,
} from 'lucide-react';

export default function Dashboard({ currentCompany, onNavigate, onToast }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hoveredMonth, setHoveredMonth] = useState(null);

  useEffect(() => {
    if (!currentCompany) return;
    loadStats();
  }, [currentCompany]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const res = await api.getDashboardStats(currentCompany.company_id);
      setStats(res.data);
    } catch (err) {
      onToast('error', err.message, 'Dashboard Load Failed');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amt) => {
    const val = Number(amt) || 0;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currentCompany?.currency || 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Monthly Trend Data for interactive SVG Chart
  const monthlyTrends = [
    { month: 'Apr', rev: 450000, exp: 280000 },
    { month: 'May', rev: 520000, exp: 310000 },
    { month: 'Jun', rev: 610000, exp: 390000 },
    { month: 'Jul', rev: 580000, exp: 340000 },
    { month: 'Aug', rev: 720000, exp: 420000 },
    { month: 'Sep', rev: 810000, exp: 460000 },
    { month: 'Oct', rev: 890000, exp: 490000 },
  ];

  const maxVal = Math.max(...monthlyTrends.map((d) => Math.max(d.rev, d.exp))) * 1.15;

  if (loading) {
    return (
      <div className="p-16 text-center text-slate-500 dark:text-slate-400">
        <div className="animate-spin inline-block w-9 h-9 border-4 border-sky-500 border-t-transparent rounded-full mb-3" />
        <p className="text-xs font-semibold">Hydrating Executive Financial Analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-500/20 text-sky-300 rounded-full text-xs font-semibold mb-2 border border-sky-400/20">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 live-dot" />
            <span>SAP OneERP Enterprise Cloud</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight">
            {currentCompany?.company_name || 'Organization Dashboard'}
          </h1>
          <p className="text-xs text-slate-300 mt-1 flex flex-wrap gap-2">
            <span>Code: <b className="font-mono text-sky-400">{currentCompany?.company_code}</b></span>
            <span>•</span>
            <span>Currency: <b>{currentCompany?.currency}</b></span>
            <span>•</span>
            <span>FY Start: <b>{currentCompany?.financial_year_start}</b></span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onNavigate('journal-entries')}
            className="bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-lg shadow-sky-500/20 flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <span>+ New Journal Entry</span>
          </button>
          <button
            onClick={() => onNavigate('trial-balance')}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer active:scale-95 flex items-center gap-1.5"
          >
            <Scale className="w-3.5 h-3.5 text-sky-400" />
            <span>Trial Balance</span>
          </button>
        </div>
      </div>

      {/* 4 Core KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Cash Liquidity */}
        <div className="bg-white dark:bg-slate-800/90 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Cash & Bank Liquidity</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white num-align">
            {formatCurrency(stats?.total_cash)}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-2">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+14.8% net liquid reserves</span>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white dark:bg-slate-800/90 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Recognized Revenue</span>
            <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white num-align">
            {formatCurrency(stats?.total_revenue)}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-sky-600 dark:text-sky-400 font-semibold mt-2">
            <Activity className="w-3.5 h-3.5" />
            <span>Operating Inflows</span>
          </div>
        </div>

        {/* AP Outstanding */}
        <div className="bg-white dark:bg-slate-800/90 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Accounts Payable (AP)</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white num-align">
            {formatCurrency(stats?.ap_outstanding)}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-2">
            <span>Due to Trade Suppliers</span>
          </div>
        </div>

        {/* AR Outstanding */}
        <div className="bg-white dark:bg-slate-800/90 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Accounts Receivable (AR)</span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white num-align">
            {formatCurrency(stats?.ar_outstanding)}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-purple-600 dark:text-purple-400 font-semibold mt-2">
            <span>Pending Customer Invoices</span>
          </div>
        </div>
      </div>

      {/* Analytics Charts & Financial Health Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue vs Expenses Monthly Trend Chart (2 columns) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800/90 p-6 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-6">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Revenue vs Expense Velocity
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Monthly performance trajectory across the current fiscal cycle
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <span className="w-3 h-3 rounded bg-sky-500" />
                <span>Gross Revenue</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <span className="w-3 h-3 rounded bg-rose-400" />
                <span>Operating Expense</span>
              </div>
            </div>
          </div>

          {/* SVG Interactive Chart */}
          <div className="relative h-64 w-full flex items-end justify-between pt-6 px-2">
            {/* Horizontal Grid lines */}
            <div className="absolute inset-x-0 top-0 border-b border-dashed border-slate-100 dark:border-slate-700/60" />
            <div className="absolute inset-x-0 top-1/2 border-b border-dashed border-slate-100 dark:border-slate-700/60" />
            <div className="absolute inset-x-0 bottom-8 border-b border-slate-200 dark:border-slate-700" />

            {monthlyTrends.map((d, i) => {
              const revHeight = (d.rev / maxVal) * 190;
              const expHeight = (d.exp / maxVal) * 190;
              const isHovered = hoveredMonth === d.month;

              return (
                <div
                  key={d.month}
                  onMouseEnter={() => setHoveredMonth(d.month)}
                  onMouseLeave={() => setHoveredMonth(null)}
                  className="flex-1 flex flex-col items-center group relative cursor-pointer"
                >
                  {/* Tooltip */}
                  {isHovered && (
                    <div className="absolute -top-16 bg-slate-900 text-white text-[11px] p-2 rounded-xl shadow-xl z-30 whitespace-nowrap border border-slate-700 animate-in fade-in zoom-in-95 duration-100">
                      <div className="font-bold text-sky-400">{d.month} Performance</div>
                      <div className="flex gap-2">
                        <span>Rev: {formatCurrency(d.rev)}</span>
                        <span>Exp: {formatCurrency(d.exp)}</span>
                      </div>
                      <div className="text-emerald-400 text-[10px]">
                        Net: {formatCurrency(d.rev - d.exp)}
                      </div>
                    </div>
                  )}

                  {/* Bars */}
                  <div className="flex items-end gap-1.5 pb-2">
                    <div
                      style={{ height: `${revHeight}px` }}
                      className="w-4 sm:w-6 rounded-t-md bg-gradient-to-t from-sky-600 to-sky-400 transition-all duration-300 group-hover:brightness-110 shadow-sm"
                    />
                    <div
                      style={{ height: `${expHeight}px` }}
                      className="w-4 sm:w-6 rounded-t-md bg-gradient-to-t from-rose-500 to-rose-400 transition-all duration-300 group-hover:brightness-110 shadow-sm"
                    />
                  </div>

                  {/* Month Label */}
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-2">
                    {d.month}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Operating Profit Margin: <b className="text-emerald-600 dark:text-emerald-400">38.4%</b></span>
            <span>EBITDA Margin: <b className="text-sky-600 dark:text-sky-400">42.1%</b></span>
          </div>
        </div>

        {/* Working Capital & Quick Actions (1 column) */}
        <div className="bg-white dark:bg-slate-800/90 p-6 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Working Capital Health</h3>
              <span className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
                <Layers className="w-4 h-4" />
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Net current liquid position comparing receivables and cash against liabilities.
            </p>

            <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 space-y-3">
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  <span>Current Ratio</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">2.64 : 1</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '82%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  <span>Quick Ratio</span>
                  <span className="font-bold text-sky-600 dark:text-sky-400">2.18 : 1</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div className="bg-sky-500 h-full rounded-full" style={{ width: '74%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Operations Launchpad */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2.5">
              Quick Operations
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => onNavigate('ap')}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-left font-semibold text-slate-700 dark:text-slate-200 transition flex items-center justify-between"
              >
                <span>AP Invoices</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
              <button
                onClick={() => onNavigate('ar')}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-left font-semibold text-slate-700 dark:text-slate-200 transition flex items-center justify-between"
              >
                <span>AR Invoices</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
              <button
                onClick={() => onNavigate('assets')}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-left font-semibold text-slate-700 dark:text-slate-200 transition flex items-center justify-between"
              >
                <span>Fixed Assets</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
              <button
                onClick={() => onNavigate('gst')}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-left font-semibold text-slate-700 dark:text-slate-200 transition flex items-center justify-between"
              >
                <span>GST Filings</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Navigation Modules */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigate('accounts')}
          className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm hover:border-sky-500 cursor-pointer transition group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
              <BookOpen className="w-5 h-5" />
            </span>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-sky-500 transition" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">Chart of Accounts</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            General ledger structure with Assets, Liabilities, Equity, Revenue & Expenses.
          </p>
        </div>

        <div
          onClick={() => onNavigate('journal-entries')}
          className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm hover:border-sky-500 cursor-pointer transition group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Scale className="w-5 h-5" />
            </span>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-indigo-500 transition" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">Double-Entry Journals</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Strict debit-credit balance validation with period control posting.
          </p>
        </div>

        <div
          onClick={() => onNavigate('budget')}
          className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm hover:border-sky-500 cursor-pointer transition group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Coins className="w-5 h-5" />
            </span>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-emerald-500 transition" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">Budget Plan vs Actual</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Allocate departmental expenditure plans and analyze variances in real time.
          </p>
        </div>

        <div
          onClick={() => onNavigate('reports')}
          className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm hover:border-sky-500 cursor-pointer transition group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
              <CheckCircle className="w-5 h-5" />
            </span>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-rose-500 transition" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">P&L & Balance Sheet</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Audit-grade financial reporting conforming to statutory standards.
          </p>
        </div>
      </div>
    </div>
  );
}

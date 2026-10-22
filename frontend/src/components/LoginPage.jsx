import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, ShieldCheck, ArrowRight, Building, CheckCircle2 } from 'lucide-react';
import { api } from '../api/client';

export default function LoginPage({ onLoginSuccess }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please provide both username and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.login(username.trim(), password);
      if (res.success && res.data?.access_token) {
        api.setToken(res.data.access_token);
        onLoginSuccess(res.data);
      } else {
        setError(res.message || 'Login failed. Please verify credentials.');
      }
    } catch (err) {
      setError(err.message || 'Unable to connect to server. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (user, pass) => {
    setUsername(user);
    setPassword(pass);
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 to-cyan-400 text-white font-black text-2xl shadow-xl shadow-sky-500/20 mb-4 border border-white/20">
            S
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">STACKLY SAP OneERP</h1>
          <p className="text-sm text-slate-400 mt-1">Enterprise Cloud Resource Planning & Financials</p>
        </div>

        {/* Card */}
        <div className="bg-slate-800/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl p-6 sm:p-8">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-700">
            <div>
              <h2 className="text-base font-bold text-white">Sign In to Workspace</h2>
              <p className="text-xs text-slate-400">Enter your enterprise credentials</p>
            </div>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2.5 py-1 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5" />
              Secure 256-bit
            </span>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
              <span className="font-bold">Error:</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Username / Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. admin"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 active:scale-[0.99] text-white font-bold rounded-xl shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 transition disabled:opacity-60 cursor-pointer text-sm"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Demo Credentials Quick-Fill Banner */}
          <div className="mt-6 pt-5 border-t border-slate-700/80 text-xs">
            <div className="text-slate-400 font-medium mb-2.5 flex items-center justify-between">
              <span>Demo Quick-Fill Access:</span>
              <span className="text-[10px] text-slate-500 font-mono">Development Mode</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('admin', 'admin123')}
                className="flex-1 px-3 py-2 bg-slate-900/60 hover:bg-slate-700/60 border border-slate-700 rounded-lg text-left text-slate-300 transition flex items-center justify-between group"
              >
                <div>
                  <div className="font-semibold text-sky-400 text-xs group-hover:underline">Admin User</div>
                  <div className="text-[10px] text-slate-400 font-mono">admin / admin123</div>
                </div>
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-500 group-hover:text-sky-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center mt-6 text-xs text-slate-500">
          STACKLY SAP OneERP • Commercial Multi-Company Architecture
        </div>
      </div>
    </div>
  );
}


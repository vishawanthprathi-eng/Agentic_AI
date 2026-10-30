import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Cpu, Lock, Mail, ArrowRight, ShieldCheck, UserCheck, AlertCircle } from 'lucide-react';
import { authAPI } from '../services/api';

export default function Login({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login({ email, password });
      const { token, user } = response.data;

      localStorage.setItem('agenticsync_token', token);
      localStorage.setItem('agenticsync_user', JSON.stringify(user));

      onLoginSuccess(user);

      if (user.role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/member-dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid credentials or server unavailable';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Demo shortcut login for judges & hackathon testing
  const handleQuickDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        
        {/* Top Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-xl shadow-indigo-500/20 mb-4 animate-glow">
            <Cpu className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Sign In to AgenticSync
          </h1>
          <p className="text-slate-400 text-sm mt-2">
            Autonomous AI Code Verification & Collaboration Hub
          </p>
        </div>

        {/* Card Form */}
        <div className="glass-panel p-8 rounded-2xl border border-slate-800 shadow-2xl relative">
          
          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl font-medium text-sm text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials for Reviewers */}
          <div className="mt-6 pt-6 border-t border-slate-800">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-center mb-3">
              ⚡ Quick Demo One-Click Access:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('admin@agenticsync.ai', 'admin123')}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium bg-purple-950/40 border border-purple-500/30 text-purple-300 hover:bg-purple-900/40 transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Demo Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('dev@agenticsync.ai', 'member123')}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-900/40 transition-colors"
              >
                <UserCheck className="w-3.5 h-3.5" />
                Demo Member
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-4">
              Create an account
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}

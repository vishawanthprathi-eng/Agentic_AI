import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Cpu, Lock, Mail, ArrowRight, AlertCircle, Shield, User } from 'lucide-react';
import { authAPI } from '../services/api';

export default function Register({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('member');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.register({ email, password, role });
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
      const msg = err.response?.data?.message || 'Registration failed. Try another email.';
      setError(msg);
    } finally {
      setLoading(false);
    }
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
            Join AgenticSync
          </h1>
          <p className="text-slate-400 text-sm mt-2">
            Accelerate team projects with Autonomous AI Verification
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
                Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="developer@team.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Password (min 6 characters)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Select Your Role
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('member')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-medium transition-all ${
                    role === 'member'
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 ring-2 ring-indigo-500/30'
                      : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  Team Member
                </button>
                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-medium transition-all ${
                    role === 'admin'
                      ? 'bg-purple-600/20 border-purple-500 text-purple-300 ring-2 ring-purple-500/30'
                      : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  Project Admin
                </button>
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
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-4">
              Sign In
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Cpu, Lock, Mail, ArrowRight, ShieldCheck, UserCheck, 
  AlertCircle, Eye, EyeOff, Sparkles, CheckCircle2 
} from 'lucide-react';
import { authAPI, getApiErrorMessage } from '../services/api';

export default function Login({ onLoginSuccess }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  useEffect(() => {
    // Check if redirected due to session expiration
    const params = new URLSearchParams(location.search);
    if (params.get('expired') === 'true') {
      setInfoMessage('Your session has expired. Please sign in again to continue.');
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');

    if (!email.trim() || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.login({ 
        email: email.trim().toLowerCase(), 
        password 
      });
      const { token, user } = response.data;

      // 1. Save token and user details to localStorage
      localStorage.setItem('agenticsync_token', token);
      localStorage.setItem('agenticsync_user', JSON.stringify(user));

      // 2. Synchronize App-level authentication state
      onLoginSuccess(user);

      // 3. Determine redirect route
      const destination = location.state?.from?.pathname || (user.role === 'admin' ? '/admin-dashboard' : '/member-dashboard');
      navigate(destination, { replace: true });
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Invalid email or password. Please verify your credentials.');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // 1-Click Demo shortcut login for judges and reviewers
  const handleQuickDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
    setInfoMessage('');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md">
        
        {/* Top Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 shadow-xl shadow-indigo-500/25 mb-4 animate-glow">
            <Cpu className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Sign In to AgenticSync
          </h1>
          <p className="text-slate-400 text-sm mt-1.5 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Autonomous AI Team Code Verification Hub
          </p>
        </div>

        {/* Card Form */}
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-2xl relative">
          
          {/* Info Notice (Session Expiry) */}
          {infoMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>{infoMessage}</span>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <div className="flex-1">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="developer@team.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  <span>Authenticating...</span>
                </>
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
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-center mb-3 flex items-center justify-center gap-1">
              <span>⚡ One-Click Reviewer Access:</span>
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleQuickDemo('admin@agenticsync.ai', 'admin123')}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-medium bg-purple-950/40 border border-purple-500/30 text-purple-300 hover:bg-purple-900/50 hover:border-purple-500/50 transition-all"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                Demo Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('dev@agenticsync.ai', 'member123')}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-medium bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-900/50 hover:border-emerald-500/50 transition-all"
              >
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                Demo Member
              </button>
            </div>
          </div>

          {/* Switch to Register Link */}
          <div className="mt-6 text-center text-xs text-slate-400">
            Don't have an account?{' '}
            <Link 
              to="/register" 
              className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-4 transition-colors"
            >
              Create an account here
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}

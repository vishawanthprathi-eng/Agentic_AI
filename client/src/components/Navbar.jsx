import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Cpu, ShieldCheck, UploadCloud, LayoutDashboard, LogOut, Code, User } from 'lucide-react';

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#0B0F19]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                AgenticSync
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                AI Agent v1.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">Team Code Verification & Collaboration Hub</p>
          </div>
        </Link>

        {/* Navigation Links */}
        {user && (
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/member-dashboard"
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                isActive('/member-dashboard')
                  ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Code className="w-4 h-4" />
              Member Hub
            </Link>

            <Link
              to="/upload"
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                isActive('/upload')
                  ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              Upload & Verify
            </Link>

            {user.role === 'admin' && (
              <Link
                to="/admin-dashboard"
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  isActive('/admin-dashboard')
                    ? 'bg-purple-600/15 text-purple-400 border border-purple-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Admin Dashboard
              </Link>
            )}
          </nav>
        )}

        {/* User Badge & Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden sm:flex items-center gap-2.5 pl-3 border-l border-slate-800">
                <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
                  <User className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-medium text-slate-200 truncate max-w-[140px]">
                    {user.email}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`inline-block w-1.5 h-1.5 rounded-full ${user.role === 'admin' ? 'bg-purple-400' : 'bg-emerald-400'}`}></span>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      {user.role}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={onLogout}
                title="Sign Out"
                className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition-all"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}

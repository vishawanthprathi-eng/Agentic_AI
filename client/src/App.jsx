import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import MemberDashboard from './pages/MemberDashboard';
import AdminDashboard from './pages/AdminDashboard';
import UploadCode from './pages/UploadCode';
import { authAPI } from './services/api';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize and verify authentication session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = localStorage.getItem('agenticsync_token');
      const savedUser = localStorage.getItem('agenticsync_user');

      if (savedToken && savedUser) {
        try {
          // Immediately set optimistic user state from localStorage
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);

          // Validate token with backend asynchronously
          const res = await authAPI.getMe();
          if (res.data.success && res.data.user) {
            setUser(res.data.user);
            localStorage.setItem('agenticsync_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.warn('Session verification notice:', err.message);
          // If token verification explicitly returned 401 or failed, clean up
          if (err.response && err.response.status === 401) {
            localStorage.removeItem('agenticsync_token');
            localStorage.removeItem('agenticsync_user');
            setUser(null);
          }
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('agenticsync_token');
    localStorage.removeItem('agenticsync_user');
    setUser(null);
  };

  const handleLoginSuccess = (authenticatedUser) => {
    setUser(authenticatedUser);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
          <span className="text-xs text-slate-400 font-mono tracking-wider uppercase">
            Loading AgenticSync Hub...
          </span>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
        <Navbar user={user} onLogout={handleLogout} />

        <main className="flex-1">
          <Routes>
            {/* Root Route Redirect */}
            <Route
              path="/"
              element={
                user ? (
                  user.role === 'admin' ? (
                    <Navigate to="/admin-dashboard" replace />
                  ) : (
                    <Navigate to="/member-dashboard" replace />
                  )
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            {/* Public Authentication Routes */}
            <Route
              path="/login"
              element={
                user ? (
                  <Navigate to={user.role === 'admin' ? '/admin-dashboard' : '/member-dashboard'} replace />
                ) : (
                  <Login onLoginSuccess={handleLoginSuccess} />
                )
              }
            />

            <Route
              path="/register"
              element={
                user ? (
                  <Navigate to={user.role === 'admin' ? '/admin-dashboard' : '/member-dashboard'} replace />
                ) : (
                  <Register onLoginSuccess={handleLoginSuccess} />
                )
              }
            />

            {/* Protected Member Routes */}
            <Route
              path="/member-dashboard"
              element={
                <ProtectedRoute user={user}>
                  <MemberDashboard user={user} />
                </ProtectedRoute>
              }
            />

            <Route
              path="/upload"
              element={
                <ProtectedRoute user={user}>
                  <UploadCode user={user} />
                </ProtectedRoute>
              }
            />

            {/* Protected Admin Routes */}
            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute user={user} requiredRole="admin">
                  <AdminDashboard user={user} />
                </ProtectedRoute>
              }
            />

            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Global Footer */}
        <footer className="border-t border-slate-800/80 bg-[#080B11] py-6 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="font-medium text-slate-400">
              AgenticSync © 2026 — Theme: Agentic AI & Intelligent Systems
            </span>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-slate-400">Google Gemini Autonomous Verification Agent Active</span>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

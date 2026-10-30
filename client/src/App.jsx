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

  useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = localStorage.getItem('agenticsync_token');
      const savedUser = localStorage.getItem('agenticsync_user');

      if (savedToken && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          // Verify token validity with backend
          const res = await authAPI.getMe();
          if (res.data.success && res.data.user) {
            setUser(res.data.user);
            localStorage.setItem('agenticsync_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.warn('Session expired or invalid:', err.message);
          localStorage.removeItem('agenticsync_token');
          localStorage.removeItem('agenticsync_user');
          setUser(null);
        }
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
          <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
          <span className="text-xs text-slate-400 font-mono">Initializing AgenticSync Hub...</span>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col font-sans">
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

            {/* Auth Routes */}
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
        <footer className="border-t border-slate-800/60 py-6 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>AgenticSync © 2026 — Theme: Agentic AI & Intelligent Systems</span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Gemini AI Autonomous Code Verification Engine Online
            </span>
          </div>
        </footer>
      </div>
    </Router>
  );
}

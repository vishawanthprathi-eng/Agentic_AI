import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * ProtectedRoute Component
 * Guards routes requiring authentication and enforces role-based access control.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {Object|null} props.user
 * @param {string} [props.requiredRole] - Optional role requirement (e.g. 'admin')
 */
export default function ProtectedRoute({ children, user, requiredRole }) {
  const location = useLocation();
  const token = localStorage.getItem('agenticsync_token');

  // If no token exists in localStorage or state, redirect to login with return path
  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If route requires admin role and current user is not admin, redirect to member dashboard
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/member-dashboard" replace />;
  }

  return children;
}

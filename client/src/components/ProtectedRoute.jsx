import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, user, requiredRole }) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // If regular member tries to access admin-only route, redirect to member dashboard
    return <Navigate to="/member-dashboard" replace />;
  }

  return children;
}

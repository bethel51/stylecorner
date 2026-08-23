import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { SplashScreen } from './SplashScreen';

export const ProtectedRoute = ({ children, requiredRole, allowedRoles }) => {
  const { user, token, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return <SplashScreen />;
  }

  if (!token || !isAuthenticated) {
    // Save where they were trying to go, redirect to login
    const redirectPath = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirectPath}`} replace />;
  }

  const validRoles = allowedRoles || (requiredRole ? [requiredRole] : null);
  if (validRoles && !validRoles.includes(user?.role)) {
    const fallbackPath =
      user?.role === 'admin'
        ? '/admin'
        : user?.role === 'staff'
        ? '/expert-dashboard'
        : '/customer-dashboard';
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
};

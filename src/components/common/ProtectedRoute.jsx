import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { SplashScreen } from './SplashScreen';

export const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, token, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <SplashScreen />;
  }

  if (!token || !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    const fallbackPath = user?.role === 'staff' ? '/expert-dashboard' : '/customer-dashboard';
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
};

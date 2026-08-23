import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';

import { Home } from './pages/Home';
import { Services } from './pages/Services';
import { Experts } from './pages/Experts';
import { Gallery } from './pages/Gallery';
import { Store } from './pages/Store';
import { Booking } from './pages/Booking';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { RoleSelection } from './pages/RoleSelection';
import { Signup } from './pages/Signup';
import { VerifyOTP } from './pages/VerifyOTP';
import { Login } from './pages/Login';
import { ForgotPassword } from './pages/ForgotPassword';
import { CustomerDashboard } from './pages/CustomerDashboard';
import { ExpertDashboard } from './pages/ExpertDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { Payment } from './pages/Payment';
import { Policies } from './pages/Policies';
import { Profile } from './pages/Profile';

export const App = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/experts" element={<Experts />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/store" element={<Store />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />

            {/* Auth Routes */}
            <Route path="/role-selection" element={<RoleSelection />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/verify" element={<VerifyOTP />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* User Profile Route */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Role Protected Routes */}
            <Route
              path="/customer-dashboard"
              element={
                <ProtectedRoute requiredRole="customer">
                  <CustomerDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/expert-dashboard"
              element={
                <ProtectedRoute requiredRole="staff">
                  <ExpertDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="staff">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Checkout & Policy Routes */}
            <Route
              path="/payment"
              element={
                <ProtectedRoute>
                  <Payment />
                </ProtectedRoute>
              }
            />
            <Route path="/policies" element={<Policies />} />

            {/* Fallback Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
};

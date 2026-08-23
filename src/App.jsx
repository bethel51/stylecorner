import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { Scissors } from 'lucide-react';

// Eager load Home page for instant initial render
import { Home } from './pages/Home';

// Lazy load remaining routes for ultra-fast bundle splitting and zero-lag navigation
const Services = lazy(() => import('./pages/Services').then(m => ({ default: m.Services })));
const Experts = lazy(() => import('./pages/Experts').then(m => ({ default: m.Experts })));
const Gallery = lazy(() => import('./pages/Gallery').then(m => ({ default: m.Gallery })));
const Store = lazy(() => import('./pages/Store').then(m => ({ default: m.Store })));
const Booking = lazy(() => import('./pages/Booking').then(m => ({ default: m.Booking })));
const About = lazy(() => import('./pages/About').then(m => ({ default: m.About })));
const Contact = lazy(() => import('./pages/Contact').then(m => ({ default: m.Contact })));
const RoleSelection = lazy(() => import('./pages/RoleSelection').then(m => ({ default: m.RoleSelection })));
const Signup = lazy(() => import('./pages/Signup').then(m => ({ default: m.Signup })));
const VerifyOTP = lazy(() => import('./pages/VerifyOTP').then(m => ({ default: m.VerifyOTP })));
const Login = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword').then(m => ({ default: m.ForgotPassword })));
const CustomerDashboard = lazy(() => import('./pages/CustomerDashboard').then(m => ({ default: m.CustomerDashboard })));
const ExpertDashboard = lazy(() => import('./pages/ExpertDashboard').then(m => ({ default: m.ExpertDashboard })));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const Payment = lazy(() => import('./pages/Payment').then(m => ({ default: m.Payment })));
const Policies = lazy(() => import('./pages/Policies').then(m => ({ default: m.Policies })));
const Profile = lazy(() => import('./pages/Profile').then(m => ({ default: m.Profile })));
const ExpertProfile = lazy(() => import('./pages/ExpertProfile').then(m => ({ default: m.ExpertProfile })));
const ProductDetail = lazy(() => import('./pages/ProductDetail').then(m => ({ default: m.ProductDetail })));

// Ultra-sleek Gold Page Loader Component
const PageLoader = () => (
  <div
    style={{
      minHeight: '80vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1rem',
      color: '#d4af37',
    }}
  >
    <div
      style={{
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        background: 'rgba(212, 175, 55, 0.12)',
        border: '1.5px solid rgba(212, 175, 55, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 8px 24px rgba(212, 175, 55, 0.2)',
        animation: 'pulse 1.2s infinite ease-in-out',
      }}
    >
      <Scissors size={26} color="#d4af37" />
    </div>
    <span
      style={{
        fontFamily: 'Outfit',
        fontSize: '0.85rem',
        fontWeight: 800,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: '#171717',
      }}
    >
      Loading...
    </span>
  </div>
);

export const App = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/services" element={<Services />} />
              <Route path="/experts" element={<Experts />} />
              <Route path="/expert-profile" element={<ExpertProfile />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/store" element={<Store />} />
              <Route path="/product/:id" element={<ProductDetail />} />
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
          </Suspense>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
};

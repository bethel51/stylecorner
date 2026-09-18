import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { ScrollToTop } from './components/common/ScrollToTop';
import { Scissors } from 'lucide-react';

// Eager load Home page for instant initial render
import { Home } from './pages/Home';

// Route loader dictionary for instant prefetching
const routeLoaders = {
  '/services': () => import('./pages/Services'),
  '/experts': () => import('./pages/Experts'),
  '/expert-profile': () => import('./pages/ExpertProfile'),
  '/gallery': () => import('./pages/Gallery'),
  '/store': () => import('./pages/Store'),
  '/cart': () => import('./pages/Cart'),
  '/booking': () => import('./pages/Booking'),
  '/about': () => import('./pages/About'),
  '/contact': () => import('./pages/Contact'),
  '/role-selection': () => import('./pages/RoleSelection'),
  '/signup': () => import('./pages/Signup'),
  '/verify': () => import('./pages/VerifyOTP'),
  '/login': () => import('./pages/Login'),
  '/forgot-password': () => import('./pages/ForgotPassword'),
  '/customer-dashboard': () => import('./pages/CustomerDashboard'),
  '/expert-dashboard': () => import('./pages/ExpertDashboard'),
  '/payment': () => import('./pages/Payment'),
  '/policies': () => import('./pages/Policies'),
  '/profile': () => import('./pages/Profile'),
  '/ai-stylist-finder': () => import('./pages/AiStylistFinder'),
  '/wallet': () => import('./pages/Wallet'),
  '/notifications': () => import('./pages/Notifications'),
};

// Global helper to prefetch route JavaScript chunk on hover/touchstart
export const preloadRoute = (path) => {
  if (!path) return;
  const basePath = path.split('?')[0].split('#')[0];
  const loader = routeLoaders[basePath];
  if (loader) {
    loader().catch(() => {});
  }
};

// Helper to safely import lazy components with automatic page reload retry if chunk hash changes after deployment
const safeLazy = (importFn) =>
  lazy(async () => {
    try {
      return await importFn();
    } catch (error) {
      console.warn('[PWA] Module script import failed after deployment update. Reloading for fresh build...', error);
      const hasReloaded = sessionStorage.getItem('chunk_reload_retry');
      if (!hasReloaded) {
        sessionStorage.setItem('chunk_reload_retry', 'true');
        window.location.reload();
      }
      throw error;
    }
  });

// Lazy load remaining routes with ultra-fast bundle splitting
const Services = safeLazy(() => import('./pages/Services').then(m => ({ default: m.Services })));
const Experts = safeLazy(() => import('./pages/Experts').then(m => ({ default: m.Experts })));
const Gallery = safeLazy(() => import('./pages/Gallery').then(m => ({ default: m.Gallery })));
const Store = safeLazy(() => import('./pages/Store').then(m => ({ default: m.Store })));
const Booking = safeLazy(() => import('./pages/Booking').then(m => ({ default: m.Booking })));
const About = safeLazy(() => import('./pages/About').then(m => ({ default: m.About })));
const Contact = safeLazy(() => import('./pages/Contact').then(m => ({ default: m.Contact })));
const RoleSelection = safeLazy(() => import('./pages/RoleSelection').then(m => ({ default: m.RoleSelection })));
const Signup = safeLazy(() => import('./pages/Signup').then(m => ({ default: m.Signup })));
const VerifyOTP = safeLazy(() => import('./pages/VerifyOTP').then(m => ({ default: m.VerifyOTP })));
const Login = safeLazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const ForgotPassword = safeLazy(() => import('./pages/ForgotPassword').then(m => ({ default: m.ForgotPassword })));
const CustomerDashboard = safeLazy(() => import('./pages/CustomerDashboard').then(m => ({ default: m.CustomerDashboard })));
const ExpertDashboard = safeLazy(() => import('./pages/ExpertDashboard').then(m => ({ default: m.ExpertDashboard })));
const Payment = safeLazy(() => import('./pages/Payment').then(m => ({ default: m.Payment })));
const Policies = safeLazy(() => import('./pages/Policies').then(m => ({ default: m.Policies })));
const Profile = safeLazy(() => import('./pages/Profile').then(m => ({ default: m.Profile })));
const ExpertProfile = safeLazy(() => import('./pages/ExpertProfile').then(m => ({ default: m.ExpertProfile })));
const ProductDetail = safeLazy(() => import('./pages/ProductDetail').then(m => ({ default: m.ProductDetail })));
const Cart = safeLazy(() => import('./pages/Cart').then(m => ({ default: m.Cart })));
const AiStylistFinder = safeLazy(() => import('./pages/AiStylistFinder').then(m => ({ default: m.AiStylistFinder })));
const Wallet = safeLazy(() => import('./pages/Wallet').then(m => ({ default: m.Wallet })));
const Notifications = safeLazy(() => import('./pages/Notifications').then(m => ({ default: m.Notifications })));

// Real simple, nice, fast and smooth PageLoader
export const PageLoader = () => (
  <div
    style={{
      minHeight: '55vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.85rem',
      padding: '2rem 1rem',
      animation: 'fadeIn 0.15s ease-out',
    }}
  >
    {/* High-speed indeterminate top loader bar */}
    <div className="top-nav-loader" />

    {/* Elegant smooth spinning gold ring */}
    <div
      style={{
        position: 'relative',
        width: '42px',
        height: '42px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          border: '2.5px solid rgba(245, 185, 66, 0.15)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          border: '2.5px solid transparent',
          borderTopColor: '#f5b942',
          borderRightColor: 'rgba(245, 185, 66, 0.6)',
          animation: 'spin 0.65s linear infinite',
        }}
      />
      <Scissors size={18} color="#f5b942" />
    </div>

    <span
      style={{
        fontFamily: 'Outfit',
        fontSize: '0.78rem',
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: '#94a3b8',
        margin: 0,
      }}
    >
      Style Corner
    </span>
  </div>
);

export const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <ScrollToTop />
            <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/services" element={<Services />} />
              <Route path="/experts" element={<Experts />} />
              <Route path="/expert-profile" element={<ExpertProfile />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/store" element={<Store />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/booking" element={<Booking />} />
              <Route path="/ai-stylist-finder" element={<AiStylistFinder />} />
              <Route path="/notifications" element={<Notifications />} />
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
              <Route
                path="/wallet"
                element={
                  <ProtectedRoute>
                    <Wallet />
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
  </ThemeProvider>
  );
};

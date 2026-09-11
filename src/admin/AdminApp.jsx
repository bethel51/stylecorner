import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { ScrollToTop } from '../components/common/ScrollToTop';
import { Shield } from 'lucide-react';

// ── Safe lazy loader for admin chunks ──
const safeLazy = (importFn) =>
  lazy(async () => {
    try {
      return await importFn();
    } catch (error) {
      console.warn('[Admin] Module load failed. Reloading...', error);
      const hasReloaded = sessionStorage.getItem('admin_chunk_retry');
      if (!hasReloaded) {
        sessionStorage.setItem('admin_chunk_retry', 'true');
        window.location.reload();
      }
      throw error;
    }
  });

const AdminLogin = safeLazy(() =>
  import('../pages/AdminLogin').then((m) => ({ default: m.AdminLogin }))
);
const AdminDashboard = safeLazy(() =>
  import('../pages/AdminDashboard').then((m) => ({ default: m.AdminDashboard }))
);

// ── Minimal loader for the admin portal ──
const AdminLoader = () => (
  <div
    style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1rem',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #141414 100%)',
    }}
  >
    <div
      style={{
        width: '64px',
        height: '64px',
        borderRadius: '18px',
        background: 'rgba(212,175,55,0.12)',
        border: '1.5px solid rgba(212,175,55,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 8px 24px rgba(212,175,55,0.2)',
      }}
    >
      <Shield size={28} color="#d4af37" />
    </div>
    <span
      style={{
        fontFamily: 'Outfit, sans-serif',
        fontSize: '0.78rem',
        fontWeight: 700,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: 'rgba(212,175,55,0.7)',
      }}
    >
      Admin Portal
    </span>
  </div>
);

// ── Admin-only route guard (defined after AdminLoader to avoid hoisting issues) ──
const AdminGuard = ({ children }) => {
  const { user, token, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) return <AdminLoader />;

  if (!token || !isAuthenticated) {
    const redirectPath = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/admin/login?redirect=${redirectPath}`} replace />;
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

// ── Standalone Admin Application ──
// This is a completely isolated React app with its own router and clean provider scope.
export const AdminApp = () => (
  <AuthProvider>
    <CartProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Suspense fallback={<AdminLoader />}>
          <Routes>
            {/* Admin login */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Protected admin dashboard */}
            <Route
              path="/admin"
              element={
                <AdminGuard>
                  <AdminDashboard />
                </AdminGuard>
              }
            />

            {/* Catch /admin/* sub-paths */}
            <Route path="/admin/*" element={<Navigate to="/admin" replace />} />

            {/* Any unmatched path in admin context → dashboard */}
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </CartProvider>
  </AuthProvider>
);

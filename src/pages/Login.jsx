import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User, Scissors, Lock, Mail, LogIn, Sparkles, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PageContainer } from '../components/common/PageContainer';

export const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '';
  const initialRole = searchParams.get('role');

  const { login, showToast } = useAuth();

  const [activeRole, setActiveRole] = useState(
    initialRole === 'admin' ? 'admin' : initialRole === 'staff' ? 'staff' : 'customer'
  ); // 'customer' | 'staff' | 'admin'

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please enter both email and password.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const loggedUser = await login(email, password, activeRole);
      const decoded = redirectPath ? decodeURIComponent(redirectPath) : null;
      if (loggedUser?.role === 'admin') {
        if (decoded && (decoded === '/admin' || decoded === '/profile' || decoded.startsWith('/admin'))) {
          navigate(decoded);
        } else {
          navigate('/admin');
        }
      } else if (decoded && decoded.startsWith('/')) {
        navigate(decoded);
      } else if (loggedUser?.role === 'staff') {
        navigate('/expert-dashboard');
      } else {
        navigate('/customer-dashboard');
      }
    } catch (err) {
      if (err.isUnverified && err.email) {
        showToast(err.message || 'Please verify your email address.', 'error');
        navigate(`/verify?email=${encodeURIComponent(err.email)}`);
      } else {
        showToast(err.message || 'Login failed', 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageContainer title={activeRole === 'admin' ? "Admin Portal Sign In" : "Sign In"}>
      <div style={{ maxWidth: '440px', margin: '0.5rem auto 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '18px',
              background: activeRole === 'admin' ? 'linear-gradient(135deg, #d4af37, #b5952f)' : 'linear-gradient(135deg, #1f1f1f, #121212)',
              color: activeRole === 'admin' ? '#ffffff' : '#d4af37',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              border: '1.5px solid rgba(212, 175, 55, 0.4)',
              boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
              transition: 'all 0.3s ease',
            }}
          >
            {activeRole === 'admin' ? <Shield size={30} /> : <Sparkles size={28} />}
          </div>

          <h2
            style={{
              fontFamily: 'Outfit',
              fontSize: '1.75rem',
              fontWeight: 800,
              color: '#171717',
            }}
          >
            {activeRole === 'admin' ? 'Admin Portal Access' : 'Welcome Back'}
          </h2>
          <p style={{ color: '#6b7280', fontSize: '0.88rem', marginTop: '0.2rem' }}>
            {activeRole === 'admin'
              ? 'Sign in with your administrator account to manage store & bookings'
              : 'Access your appointments, profile & grooming dashboard'}
          </p>
        </div>

        {/* Role Segmented Controller */}
        <div
          style={{
            background: '#e5e7eb',
            borderRadius: '14px',
            padding: '4px',
            display: 'flex',
            marginBottom: '1.25rem',
            gap: '2px',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveRole('customer')}
            style={{
              flex: 1,
              padding: '0.65rem 0.4rem',
              borderRadius: '11px',
              border: 'none',
              fontFamily: 'Outfit',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              background: activeRole === 'customer' ? '#ffffff' : 'transparent',
              color: activeRole === 'customer' ? '#171717' : '#6b7280',
              boxShadow: activeRole === 'customer' ? '0 4px 12px rgba(0,0,0,0.06)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.3rem',
              transition: 'all 0.2s ease',
            }}
          >
            <User size={15} />
            <span>Customer</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveRole('staff')}
            style={{
              flex: 1,
              padding: '0.65rem 0.4rem',
              borderRadius: '11px',
              border: 'none',
              fontFamily: 'Outfit',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              background: activeRole === 'staff' ? '#ffffff' : 'transparent',
              color: activeRole === 'staff' ? '#171717' : '#6b7280',
              boxShadow: activeRole === 'staff' ? '0 4px 12px rgba(0,0,0,0.06)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.3rem',
              transition: 'all 0.2s ease',
            }}
          >
            <Scissors size={15} />
            <span>Expert</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveRole('admin')}
            style={{
              flex: 1,
              padding: '0.65rem 0.4rem',
              borderRadius: '11px',
              border: 'none',
              fontFamily: 'Outfit',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              background: activeRole === 'admin' ? '#ffffff' : 'transparent',
              color: activeRole === 'admin' ? '#b5952f' : '#6b7280',
              boxShadow: activeRole === 'admin' ? '0 4px 12px rgba(0,0,0,0.06)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.3rem',
              transition: 'all 0.2s ease',
            }}
          >
            <Shield size={15} />
            <span>Admin</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="app-card" style={{ padding: '1.5rem' }}>
          <div className="app-input-group">
            <label className="app-label">
              {activeRole === 'admin' ? 'Administrator Email' : 'Email Address'}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={activeRole === 'admin' ? "admin@stylecorner.com" : "name@example.com"}
              className="app-input"
              required
            />
          </div>

          <div className="app-input-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="app-label">Password</label>
              <span
                onClick={() => navigate('/forgot-password')}
                style={{
                  fontSize: '0.78rem',
                  color: '#d4af37',
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginBottom: '0.35rem',
                }}
              >
                Forgot Password?
              </span>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="app-input"
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="app-btn app-btn-primary"
            style={{
              marginTop: '0.5rem',
              backgroundColor: activeRole === 'admin' ? '#d4af37' : undefined,
              borderColor: activeRole === 'admin' ? '#d4af37' : undefined,
            }}
          >
            {submitting ? (
              <span>Authenticating...</span>
            ) : (
              <>
                {activeRole === 'admin' ? <Shield size={18} /> : <LogIn size={18} />}
                <span>
                  Sign In as {activeRole === 'admin' ? 'Administrator' : activeRole === 'staff' ? 'Expert' : 'Customer'}
                </span>
              </>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <p style={{ color: '#6b7280', fontSize: '0.88rem' }}>
            New to Style Corner?{' '}
            <span
              onClick={() => navigate('/role-selection')}
              style={{
                color: '#d4af37',
                fontWeight: 700,
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Create an Account
            </span>
          </p>
        </div>
      </div>
    </PageContainer>
  );
};

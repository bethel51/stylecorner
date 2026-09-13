import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User, Scissors, Lock, Mail, LogIn, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PageContainer } from '../components/common/PageContainer';

export const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '';
  const initialRole = searchParams.get('role');

  const { login, showToast } = useAuth();

  // If someone lands here with role=admin in URL, redirect them to dedicated admin portal
  useEffect(() => {
    if (initialRole === 'admin') {
      const redirectUrl = redirectPath ? `/admin/login?redirect=${encodeURIComponent(redirectPath)}` : '/admin/login';
      navigate(redirectUrl, { replace: true });
    }
  }, [initialRole, redirectPath, navigate]);

  const [activeRole, setActiveRole] = useState(
    initialRole === 'staff' ? 'staff' : 'customer'
  ); // 'customer' | 'staff'

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
        navigate('/admin');
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
    <PageContainer title="Sign In">
      <div style={{ maxWidth: '440px', margin: '0.5rem auto 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #151822, #0C0E14)',
              color: '#F5B942',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.1rem',
              border: '1.5px solid rgba(245, 185, 66, 0.35)',
              boxShadow: '0 10px 30px rgba(245,185,66,0.15)',
            }}
          >
            <Sparkles size={28} />
          </div>

          <h2
            style={{
              fontFamily: 'Outfit',
              fontSize: '1.75rem',
              fontWeight: 800,
              color: '#FFFFFF',
            }}
          >
            Welcome Back
          </h2>
          <p style={{ color: '#9AA2B3', fontSize: '0.88rem', marginTop: '0.25rem' }}>
            Access your appointments, profile & grooming dashboard
          </p>
        </div>

        {/* Role Segmented Controller */}
        <div
          style={{
            background: '#151822',
            borderRadius: '16px',
            padding: '4px',
            display: 'flex',
            marginBottom: '1.25rem',
            gap: '4px',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveRole('customer')}
            style={{
              flex: 1,
              padding: '0.7rem 0.4rem',
              borderRadius: '12px',
              border: 'none',
              fontFamily: 'Outfit',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              background: activeRole === 'customer' ? '#F5B942' : 'transparent',
              color: activeRole === 'customer' ? '#0C0E14' : '#9AA2B3',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              transition: 'all 0.2s ease',
            }}
          >
            <User size={16} />
            <span>Customer</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveRole('staff')}
            style={{
              flex: 1,
              padding: '0.7rem 0.4rem',
              borderRadius: '12px',
              border: 'none',
              fontFamily: 'Outfit',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              background: activeRole === 'staff' ? '#F5B942' : 'transparent',
              color: activeRole === 'staff' ? '#0C0E14' : '#9AA2B3',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              transition: 'all 0.2s ease',
            }}
          >
            <Scissors size={16} />
            <span>Expert</span>
          </button>
        </div>

        {/* Form Card */}
        <div style={{ background: '#151822', borderRadius: '24px', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '1.5rem' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#9AA2B3', marginBottom: '0.5rem', fontFamily: 'Outfit' }}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                style={{
                  width: '100%', padding: '0.85rem 1rem', borderRadius: '14px',
                  background: '#0C0E14', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#FFFFFF', fontFamily: 'Outfit', fontSize: '0.92rem', outline: 'none'
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#9AA2B3', fontFamily: 'Outfit' }}>Password</label>
                <span
                  onClick={() => navigate('/forgot-password')}
                  style={{ fontSize: '0.78rem', color: '#F5B942', fontWeight: 600, cursor: 'pointer' }}
                >
                  Forgot Password?
                </span>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: '100%', padding: '0.85rem 1rem', borderRadius: '14px',
                  background: '#0C0E14', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#FFFFFF', fontFamily: 'Outfit', fontSize: '0.92rem', outline: 'none'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                width: '100%', padding: '1rem', borderRadius: '16px',
                background: submitting ? 'rgba(245,185,66,0.6)' : '#F5B942',
                color: '#0C0E14', fontFamily: 'Outfit', fontWeight: 800,
                fontSize: '0.95rem', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
              }}
            >
              {submitting ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <LogIn size={18} />
                  <span>Sign In as {activeRole === 'staff' ? 'Expert' : 'Customer'}</span>
                </>
              )}
            </button>
          </form>
        </div>

        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#9AA2B3', fontSize: '0.88rem' }}>
            New to Style Corner?{' '}
            <span
              onClick={() => navigate('/role-selection')}
              style={{ color: '#F5B942', fontWeight: 700, cursor: 'pointer' }}
            >
              Create an Account
            </span>
          </p>
        </div>
      </div>
    </PageContainer>
  );
};


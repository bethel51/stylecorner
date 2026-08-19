import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User, Scissors, Lock, Mail, LogIn, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PageContainer } from '../components/common/PageContainer';

export const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '';

  const { login, showToast } = useAuth();

  const [activeRole, setActiveRole] = useState('customer'); // 'customer' or 'staff'
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
      const user = await login(email, password, activeRole);
      if (redirectPath) {
        navigate(`/${redirectPath}`);
      } else if (user.role === 'staff') {
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
      <div style={{ maxWidth: '420px', margin: '0.5rem auto 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '18px',
              background: 'linear-gradient(135deg, #1f1f1f, #121212)',
              color: '#d4af37',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              border: '1.5px solid rgba(212, 175, 55, 0.4)',
              boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
            }}
          >
            <Sparkles size={28} />
          </div>

          <h2
            style={{
              fontFamily: 'Outfit',
              fontSize: '1.75rem',
              fontWeight: 800,
              color: '#171717',
            }}
          >
            Welcome Back
          </h2>
          <p style={{ color: '#6b7280', fontSize: '0.88rem', marginTop: '0.2rem' }}>
            Access your appointments, profile & grooming dashboard
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
          }}
        >
          <button
            type="button"
            onClick={() => setActiveRole('customer')}
            style={{
              flex: 1,
              padding: '0.7rem',
              borderRadius: '11px',
              border: 'none',
              fontFamily: 'Outfit',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              background: activeRole === 'customer' ? '#ffffff' : 'transparent',
              color: activeRole === 'customer' ? '#171717' : '#6b7280',
              boxShadow: activeRole === 'customer' ? '0 4px 12px rgba(0,0,0,0.06)' : 'none',
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
              padding: '0.7rem',
              borderRadius: '11px',
              border: 'none',
              fontFamily: 'Outfit',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              background: activeRole === 'staff' ? '#ffffff' : 'transparent',
              color: activeRole === 'staff' ? '#171717' : '#6b7280',
              boxShadow: activeRole === 'staff' ? '0 4px 12px rgba(0,0,0,0.06)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              transition: 'all 0.2s ease',
            }}
          >
            <Scissors size={16} />
            <span>Expert / Staff</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="app-card" style={{ padding: '1.5rem' }}>
          <div className="app-input-group">
            <label className="app-label">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="app-input"
              required
            />
          </div>

          <div className="app-input-group">
            <label className="app-label">Password</label>
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
            style={{ marginTop: '0.5rem' }}
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

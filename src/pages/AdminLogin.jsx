import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Shield, Lock, Mail, LogIn, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PageContainer } from '../components/common/PageContainer';

export const AdminLogin = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '';

  const { login, showToast, user, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // If already logged in as admin, redirect to admin dashboard
  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      const decoded = redirectPath ? decodeURIComponent(redirectPath) : null;
      if (decoded && (decoded === '/admin' || decoded.startsWith('/admin'))) {
        navigate(decoded, { replace: true });
      } else {
        navigate('/admin', { replace: true });
      }
    }
  }, [isAuthenticated, user, redirectPath, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please enter both administrator email and password.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const loggedUser = await login(email, password, 'admin');
      if (loggedUser?.role === 'admin') {
        const decoded = redirectPath ? decodeURIComponent(redirectPath) : null;
        if (decoded && (decoded === '/admin' || decoded.startsWith('/admin'))) {
          navigate(decoded);
        } else {
          navigate('/admin');
        }
      } else {
        showToast('Account does not have administrator privileges.', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Admin authentication failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageContainer title="Admin Portal Sign In">
      <div style={{ maxWidth: '440px', margin: '1rem auto 2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div
            style={{
              width: '68px',
              height: '68px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #d4af37 0%, #92700a 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
              border: '2px solid rgba(212, 175, 55, 0.5)',
              boxShadow: '0 12px 30px rgba(212, 175, 55, 0.25)',
            }}
          >
            <Shield size={34} />
          </div>

          <span
            style={{
              display: 'inline-block',
              padding: '0.25rem 0.75rem',
              borderRadius: '20px',
              background: 'rgba(212, 175, 55, 0.12)',
              color: '#d4af37',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              fontSize: '0.72rem',
              fontWeight: 800,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '0.5rem',
              fontFamily: 'Outfit',
            }}
          >
            Restricted Access · Executive Space
          </span>

          <h2
            style={{
              fontFamily: 'Outfit',
              fontSize: '1.85rem',
              fontWeight: 800,
              color: '#171717',
              marginTop: '0.2rem',
            }}
          >
            Admin Portal Access
          </h2>
          <p style={{ color: '#6b7280', fontSize: '0.88rem', marginTop: '0.3rem', lineHeight: 1.4 }}>
            Sign in with your authorized administrator credentials to manage platform operations & services.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="app-card"
          style={{
            padding: '1.75rem',
            borderRadius: '24px',
            border: '1.5px solid rgba(212, 175, 55, 0.3)',
            boxShadow: '0 12px 35px rgba(0,0,0,0.06)',
          }}
        >
          <div className="app-input-group" style={{ marginBottom: '1.25rem' }}>
            <label className="app-label" style={{ fontWeight: 700 }}>
              Administrator Email
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@stylecorner.com"
                className="app-input"
                style={{ paddingLeft: '2.6rem' }}
                required
              />
              <Mail
                size={18}
                style={{
                  position: 'absolute',
                  left: '0.9rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#9ca3af',
                }}
              />
            </div>
          </div>

          <div className="app-input-group" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="app-label" style={{ fontWeight: 700 }}>
                Master Password
              </label>
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
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="app-input"
                style={{ paddingLeft: '2.6rem' }}
                required
              />
              <Lock
                size={18}
                style={{
                  position: 'absolute',
                  left: '0.9rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#9ca3af',
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="app-btn app-btn-primary"
            style={{
              width: '100%',
              padding: '0.85rem',
              fontSize: '0.95rem',
              fontWeight: 700,
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #d4af37 0%, #b5952f 100%)',
              color: '#ffffff',
              border: 'none',
              cursor: submitting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: '0 8px 20px rgba(212, 175, 55, 0.3)',
            }}
          >
            {submitting ? (
              <span>Authenticating Admin...</span>
            ) : (
              <>
                <Shield size={18} />
                <span>Sign In to Admin Dashboard</span>
              </>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.75rem' }}>
          <Link
            to="/"
            style={{
              color: '#6b7280',
              fontSize: '0.88rem',
              fontWeight: 600,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <ArrowLeft size={16} /> Return to Public Website
          </Link>
        </div>
      </div>
    </PageContainer>
  );
};

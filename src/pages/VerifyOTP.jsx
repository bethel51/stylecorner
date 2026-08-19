import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { KeyRound, CheckCircle2, RotateCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { PageContainer } from '../components/common/PageContainer';

export const VerifyOTP = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get('email') || '';

  const { verifyOtp, showToast } = useAuth();

  const [email, setEmail] = useState(emailParam);
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!email || !code) {
      showToast('Please enter both your email and the 6-digit code.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const user = await verifyOtp(email, code);
      if (user.role === 'staff') {
        navigate('/expert-dashboard');
      } else {
        navigate('/customer-dashboard');
      }
    } catch (err) {
      showToast(err.message || 'OTP verification failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      showToast('Please specify an email address.', 'error');
      return;
    }
    setResending(true);
    try {
      const res = await api.resendOtp(email);
      showToast(res.message || 'New verification code sent to your email.', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to resend code.', 'error');
    } finally {
      setResending(false);
    }
  };

  return (
    <PageContainer title="Verify Account">
      <div style={{ maxWidth: '420px', margin: '1rem auto 2rem', textAlign: 'center' }}>
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            background: 'rgba(212, 175, 55, 0.12)',
            color: '#d4af37',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
            border: '1px solid rgba(212, 175, 55, 0.3)',
          }}
        >
          <KeyRound size={32} />
        </div>

        <h2
          style={{
            fontFamily: 'Outfit',
            fontSize: '1.6rem',
            fontWeight: 800,
            color: '#171717',
            marginBottom: '0.4rem',
          }}
        >
          Verification Code
        </h2>

        <p style={{ color: '#6b7280', fontSize: '0.88rem', marginBottom: '1.75rem', lineHeight: 1.5 }}>
          Enter the 6-digit code sent to <strong style={{ color: '#171717' }}>{email || 'your email'}</strong>
        </p>

        <form onSubmit={handleVerify} className="app-card" style={{ padding: '1.75rem' }}>
          <div className="app-input-group" style={{ textAlign: 'left' }}>
            <label className="app-label">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="app-input"
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="app-input-group" style={{ textAlign: 'left' }}>
            <label className="app-label">6-Digit OTP Code</label>
            <input
              type="text"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="123456"
              className="app-input"
              style={{
                letterSpacing: '0.4em',
                fontSize: '1.4rem',
                textAlign: 'center',
                fontFamily: 'Outfit',
                fontWeight: 800,
              }}
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
              <span>Verifying Code...</span>
            ) : (
              <>
                <CheckCircle2 size={18} />
                <span>Verify & Login</span>
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            style={{
              background: 'none',
              border: 'none',
              color: '#d4af37',
              fontFamily: 'Outfit',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
            }}
          >
            <RotateCw size={16} className={resending ? 'fa-spin' : ''} />
            <span>{resending ? 'Sending Code...' : 'Resend 6-Digit Code'}</span>
          </button>
        </div>
      </div>
    </PageContainer>
  );
};

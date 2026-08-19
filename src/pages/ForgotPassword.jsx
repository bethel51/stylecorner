import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, KeyRound, ArrowLeft, CheckCircle2, Eye, EyeOff, Sparkles, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PageContainer } from '../components/common/PageContainer';

export const ForgotPassword = () => {
  const navigate = useNavigate();
  const { showToast } = useAuth();

  // Wizard Step: 1 = Email, 2 = Verify OTP, 3 = New Password
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  // Step 1: Request Password Reset OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!email || !email.trim()) {
      showToast('Please enter your account email address.', 'error');
      return;
    }

    setLoading(true);
    try {
      const data = await api.forgotPassword(email.trim());
      showToast(data.message || 'Verification code sent to your email!', 'success');
      setStep(2);
    } catch (err) {
      showToast(err.message || 'Failed to send reset code.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP Code
  const handleResendOtp = async () => {
    setResending(true);
    try {
      await api.forgotPassword(email.trim());
      showToast('New verification code sent to your email!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to resend code.', 'error');
    } finally {
      setResending(false);
    }
  };

  // Step 2: Verify OTP Code
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length < 6) {
      showToast('Please enter the 6-digit verification code.', 'error');
      return;
    }

    setLoading(true);
    try {
      await api.verifyResetOtp(email.trim(), otpCode.trim());
      showToast('Code verified! Set your new password.', 'success');
      setStep(3);
    } catch (err) {
      showToast(err.message || 'Invalid or expired code.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Complete Password Reset
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      showToast('New password must be at least 6 characters.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match.', 'error');
      return;
    }

    setLoading(true);
    try {
      await api.resetPassword(email.trim(), otpCode.trim(), newPassword);
      showToast('Password reset successfully! Please sign in with your new password.', 'success');
      navigate('/login');
    } catch (err) {
      showToast(err.message || 'Failed to reset password.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer title="Reset Password" showBack>
      <div style={{ maxWidth: '440px', margin: '0 auto', padding: '1rem 0' }}>
        
        {/* Step Progress Tracker */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  fontFamily: 'Outfit',
                  backgroundColor: step >= s ? '#d4af37' : 'rgba(255,255,255,0.08)',
                  color: step >= s ? '#000000' : '#6b7280',
                  border: step === s ? '2px solid #ffffff' : 'none',
                  transition: 'all 0.25s ease',
                  boxShadow: step === s ? '0 0 15px rgba(212,175,55,0.4)' : 'none',
                }}
              >
                {step > s ? <CheckCircle2 size={18} /> : s}
              </div>
              {s < 3 && (
                <div
                  style={{
                    height: '2px',
                    width: '40px',
                    backgroundColor: step > s ? '#d4af37' : 'rgba(255,255,255,0.1)',
                    transition: 'all 0.25s ease',
                  }}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* --- STEP 1: ENTER EMAIL --- */}
        {step === 1 && (
          <div
            className="app-card"
            style={{
              backgroundColor: '#18181b',
              borderRadius: '24px',
              padding: '2rem 1.5rem',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, rgba(212,175,55,0.2), rgba(212,175,55,0.05))',
                  border: '1px solid rgba(212,175,55,0.3)',
                  color: '#d4af37',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem auto',
                }}
              >
                <Mail size={26} />
              </div>
              <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, color: '#ffffff', margin: 0, fontSize: '1.4rem' }}>
                Forgot Password?
              </h2>
              <p style={{ color: '#9ca3af', fontSize: '0.85rem', marginTop: '0.35rem', lineHeight: '1.4' }}>
                Enter your account email address and we'll send you a 6-digit verification code to reset your password.
              </p>
            </div>

            <form onSubmit={handleRequestOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="app-input-group">
                <label className="app-label">Account Email Address</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    required
                    placeholder="e.g. alex@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="app-input"
                    style={{ paddingLeft: '2.75rem' }}
                  />
                  <Mail
                    size={18}
                    style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="app-btn app-btn-primary"
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  borderRadius: '14px',
                  backgroundColor: '#d4af37',
                  color: '#000000',
                  border: 'none',
                  cursor: 'pointer',
                  marginTop: '0.5rem',
                }}
              >
                {loading ? 'Sending Code...' : 'Send Verification Code'}
              </button>

              <div style={{ textAlign: 'center', marginTop: '0.75rem' }}>
                <Link
                  to="/login"
                  style={{
                    color: '#9ca3af',
                    fontSize: '0.85rem',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <ArrowLeft size={14} /> Back to Sign In
                </Link>
              </div>
            </form>
          </div>
        )}

        {/* --- STEP 2: VERIFY OTP --- */}
        {step === 2 && (
          <div
            className="app-card"
            style={{
              backgroundColor: '#18181b',
              borderRadius: '24px',
              padding: '2rem 1.5rem',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, rgba(212,175,55,0.2), rgba(212,175,55,0.05))',
                  border: '1px solid rgba(212,175,55,0.3)',
                  color: '#d4af37',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem auto',
                }}
              >
                <KeyRound size={26} />
              </div>
              <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, color: '#ffffff', margin: 0, fontSize: '1.4rem' }}>
                Enter Reset Code
              </h2>
              <p style={{ color: '#9ca3af', fontSize: '0.85rem', marginTop: '0.35rem', lineHeight: '1.4' }}>
                We sent a 6-digit code to <strong style={{ color: '#d4af37' }}>{email}</strong>
              </p>
            </div>

            <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="app-input-group">
                <label className="app-label">6-Digit Verification Code</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="123456"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  className="app-input"
                  style={{
                    textAlign: 'center',
                    fontSize: '1.35rem',
                    letterSpacing: '0.4rem',
                    fontWeight: 800,
                    fontFamily: 'Outfit',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="app-btn app-btn-primary"
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  borderRadius: '14px',
                  backgroundColor: '#d4af37',
                  color: '#000000',
                  border: 'none',
                  cursor: 'pointer',
                  marginTop: '0.5rem',
                }}
              >
                {loading ? 'Verifying...' : 'Verify Reset Code'}
              </button>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', fontSize: '0.82rem' }}>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
                >
                  Change Email
                </button>
                <button
                  type="button"
                  disabled={resending}
                  onClick={handleResendOtp}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#d4af37',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}
                >
                  <RefreshCw size={13} className={resending ? 'spin' : ''} /> Resend Code
                </button>
              </div>
            </form>
          </div>
        )}

        {/* --- STEP 3: SET NEW PASSWORD --- */}
        {step === 3 && (
          <div
            className="app-card"
            style={{
              backgroundColor: '#18181b',
              borderRadius: '24px',
              padding: '2rem 1.5rem',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, rgba(212,175,55,0.2), rgba(212,175,55,0.05))',
                  border: '1px solid rgba(212,175,55,0.3)',
                  color: '#d4af37',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem auto',
                }}
              >
                <Lock size={26} />
              </div>
              <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, color: '#ffffff', margin: 0, fontSize: '1.4rem' }}>
                Set New Password
              </h2>
              <p style={{ color: '#9ca3af', fontSize: '0.85rem', marginTop: '0.35rem', lineHeight: '1.4' }}>
                Please create a strong new password for your Style Corner account.
              </p>
            </div>

            <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="app-input-group">
                <label className="app-label">New Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="app-input"
                    style={{ paddingLeft: '2.75rem', paddingRight: '2.75rem' }}
                  />
                  <Lock
                    size={18}
                    style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '1rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#9ca3af',
                      cursor: 'pointer',
                    }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="app-input-group">
                <label className="app-label">Confirm New Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="app-input"
                    style={{ paddingLeft: '2.75rem' }}
                  />
                  <Lock
                    size={18}
                    style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="app-btn app-btn-primary"
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  borderRadius: '14px',
                  backgroundColor: '#d4af37',
                  color: '#000000',
                  border: 'none',
                  cursor: 'pointer',
                  marginTop: '0.5rem',
                }}
              >
                {loading ? 'Resetting Password...' : 'Save New Password'}
              </button>
            </form>
          </div>
        )}
      </div>
    </PageContainer>
  );
};

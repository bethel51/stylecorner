import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Scissors, ArrowRight, ShieldCheck, QrCode, Layers, Wallet, Check, Sparkles } from 'lucide-react';
import { PageContainer } from '../components/common/PageContainer';
import { useTheme } from '../context/ThemeContext';

export const RoleSelection = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [selectedRole, setSelectedRole] = useState('customer');

  const handleProceed = () => {
    navigate(`/signup?role=${selectedRole}`);
  };

  const isCustomer = selectedRole === 'customer';
  const isSpecialist = selectedRole === 'staff';

  return (
    <PageContainer title="Select Role | Style Corner">
      <style>{`
        .role-sel-card {
          cursor: pointer;
          position: relative;
          border-radius: 20px;
          box-sizing: border-box;
          transform: translate3d(0, 0, 0);
          transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1),
                      border-color 0.22s ease,
                      box-shadow 0.22s ease,
                      background 0.22s ease;
          user-select: none;
          -webkit-tap-highlight-color: transparent;
        }

        .role-sel-card:hover {
          transform: translate3d(0, -3px, 0);
        }

        .role-sel-card:active {
          transform: translate3d(0, 0, 0) scale(0.99);
        }

        .cta-gold-btn {
          background: linear-gradient(135deg, #F5B942 0%, #E8912D 100%);
          box-shadow: 0 8px 26px -4px rgba(245, 185, 66, 0.45);
          transition: transform 0.18s cubic-bezier(0.16, 1, 0.3, 1),
                      box-shadow 0.18s ease;
        }

        .cta-gold-btn:hover {
          transform: translate3d(0, -2px, 0);
          box-shadow: 0 14px 34px -4px rgba(245, 185, 66, 0.65);
        }

        .micro-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.22rem 0.6rem;
          border-radius: 8px;
          font-size: 0.72rem;
          font-weight: 700;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
      `}</style>

      <div style={{ maxWidth: '440px', margin: '1rem auto 2.5rem', textAlign: 'center', padding: '0 0.5rem' }}>
        {/* Emblem / Logo */}
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            overflow: 'hidden',
            margin: '0 auto 1.15rem',
            border: '2px solid rgba(245, 185, 66, 0.5)',
            boxShadow: '0 10px 28px rgba(245, 185, 66, 0.32)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#08090C',
          }}
        >
          <img
            src="/pwa-icon-192.png"
            alt="Style Corner"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>

        {/* Welcome Pill Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: isDark ? 'rgba(245, 185, 66, 0.12)' : 'rgba(245, 185, 66, 0.16)',
            border: '1px solid rgba(245, 185, 66, 0.35)',
            borderRadius: '50px',
            padding: '0.32rem 0.95rem',
            fontSize: '0.74rem',
            fontWeight: 800,
            color: isDark ? '#F5B942' : '#B47806',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            marginBottom: '0.65rem',
            fontFamily: 'Outfit, sans-serif',
          }}
        >
          <Sparkles size={13} color="#F5B942" />
          Style Corner Atelier
        </div>

        <h1
          style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: 'clamp(1.75rem, 5.5vw, 2.15rem)',
            fontWeight: 900,
            color: isDark ? '#FFFFFF' : '#0F172A',
            marginBottom: '0.4rem',
            letterSpacing: '-0.025em',
          }}
        >
          Select Your Role
        </h1>

        <p
          style={{
            color: isDark ? '#94a3b8' : '#64748b',
            fontSize: '0.9rem',
            marginBottom: '1.6rem',
            lineHeight: 1.55,
            fontFamily: 'Plus Jakarta Sans, sans-serif',
          }}
        >
          Choose how you will experience Style Corner to set up your account.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
          {/* Customer Role Card */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => setSelectedRole('customer')}
            onKeyDown={(e) => e.key === 'Enter' && setSelectedRole('customer')}
            className="role-sel-card"
            style={{
              padding: '1.25rem 1.35rem',
              textAlign: 'left',
              background: isCustomer
                ? isDark
                  ? 'linear-gradient(145deg, rgba(245, 185, 66, 0.14) 0%, rgba(20, 24, 34, 0.98) 100%)'
                  : 'linear-gradient(145deg, rgba(245, 185, 66, 0.18) 0%, #FFFFFF 100%)'
                : isDark
                ? '#11141E'
                : '#FFFFFF',
              border: `2px solid ${
                isCustomer
                  ? '#F5B942'
                  : isDark
                  ? 'rgba(255, 255, 255, 0.08)'
                  : 'rgba(0, 0, 0, 0.08)'
              }`,
              boxShadow: isCustomer
                ? '0 14px 34px -4px rgba(245, 185, 66, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
                : isDark
                ? '0 4px 18px rgba(0, 0, 0, 0.25)'
                : '0 4px 18px rgba(0, 0, 0, 0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flex: 1 }}>
                <div
                  style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '16px',
                    background: isCustomer
                      ? 'linear-gradient(135deg, rgba(245, 185, 66, 0.3) 0%, rgba(232, 145, 45, 0.18) 100%)'
                      : isDark
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(0, 0, 0, 0.04)',
                    border: isCustomer ? '1.5px solid rgba(245, 185, 66, 0.6)' : '1px solid transparent',
                    color: isCustomer ? '#F5B942' : isDark ? '#94a3b8' : '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <User size={25} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontFamily: 'Outfit, sans-serif',
                        fontSize: '1.12rem',
                        fontWeight: 800,
                        color: isDark ? '#FFFFFF' : '#0F172A',
                      }}
                    >
                      Client / Customer
                    </span>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        padding: '0.18rem 0.6rem',
                        borderRadius: '50px',
                        background: 'rgba(16, 185, 129, 0.15)',
                        color: '#10b981',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                      }}
                    >
                      Book Sessions
                    </span>
                  </div>
                  <p
                    style={{
                      margin: '0 0 0.65rem',
                      fontSize: '0.84rem',
                      color: isDark ? '#94a3b8' : '#64748b',
                      lineHeight: 1.45,
                    }}
                  >
                    Book verified barbers, lash techs, nail artists, braiders &amp; wig stylists.
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                    <span
                      className="micro-pill"
                      style={{
                        background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                        border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}`,
                        color: isDark ? '#cbd5e1' : '#475569',
                      }}
                    >
                      <ShieldCheck size={13} color="#10b981" />
                      Escrow Protected
                    </span>
                    <span
                      className="micro-pill"
                      style={{
                        background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                        border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}`,
                        color: isDark ? '#cbd5e1' : '#475569',
                      }}
                    >
                      <QrCode size={13} color="#F5B942" />
                      Digital Pass Check-In
                    </span>
                  </div>
                </div>
              </div>
              <div
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  border: `2px solid ${isCustomer ? '#F5B942' : isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.2)'}`,
                  background: isCustomer ? '#F5B942' : 'transparent',
                  boxShadow: isCustomer ? '0 0 0 3px rgba(245, 185, 66, 0.25)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '4px',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                {isCustomer && <Check size={15} color="#08090C" strokeWidth={3.2} />}
              </div>
            </div>
          </div>

          {/* Expert / Staff Role Card */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => setSelectedRole('staff')}
            onKeyDown={(e) => e.key === 'Enter' && setSelectedRole('staff')}
            className="role-sel-card"
            style={{
              padding: '1.25rem 1.35rem',
              textAlign: 'left',
              background: isSpecialist
                ? isDark
                  ? 'linear-gradient(145deg, rgba(245, 185, 66, 0.14) 0%, rgba(20, 24, 34, 0.98) 100%)'
                  : 'linear-gradient(145deg, rgba(245, 185, 66, 0.18) 0%, #FFFFFF 100%)'
                : isDark
                ? '#11141E'
                : '#FFFFFF',
              border: `2px solid ${
                isSpecialist
                  ? '#F5B942'
                  : isDark
                  ? 'rgba(255, 255, 255, 0.08)'
                  : 'rgba(0, 0, 0, 0.08)'
              }`,
              boxShadow: isSpecialist
                ? '0 14px 34px -4px rgba(245, 185, 66, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
                : isDark
                ? '0 4px 18px rgba(0, 0, 0, 0.25)'
                : '0 4px 18px rgba(0, 0, 0, 0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flex: 1 }}>
                <div
                  style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '16px',
                    background: isSpecialist
                      ? 'linear-gradient(135deg, rgba(245, 185, 66, 0.3) 0%, rgba(232, 145, 45, 0.18) 100%)'
                      : isDark
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(0, 0, 0, 0.04)',
                    border: isSpecialist ? '1.5px solid rgba(245, 185, 66, 0.6)' : '1px solid transparent',
                    color: isSpecialist ? '#F5B942' : isDark ? '#94a3b8' : '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Scissors size={25} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontFamily: 'Outfit, sans-serif',
                        fontSize: '1.12rem',
                        fontWeight: 800,
                        color: isDark ? '#FFFFFF' : '#0F172A',
                      }}
                    >
                      Specialist / Expert
                    </span>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        padding: '0.18rem 0.6rem',
                        borderRadius: '50px',
                        background: 'rgba(245, 185, 66, 0.15)',
                        color: '#F5B942',
                        border: '1px solid rgba(245, 185, 66, 0.35)',
                      }}
                    >
                      Earn &amp; Grow
                    </span>
                  </div>
                  <p
                    style={{
                      margin: '0 0 0.65rem',
                      fontSize: '0.84rem',
                      color: isDark ? '#94a3b8' : '#64748b',
                      lineHeight: 1.45,
                    }}
                  >
                    Showcase your portfolio, receive client bookings &amp; get paid directly to your wallet.
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                    <span
                      className="micro-pill"
                      style={{
                        background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                        border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}`,
                        color: isDark ? '#cbd5e1' : '#475569',
                      }}
                    >
                      <Layers size={13} color="#a855f7" />
                      Lookbook Showcase
                    </span>
                    <span
                      className="micro-pill"
                      style={{
                        background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                        border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}`,
                        color: isDark ? '#cbd5e1' : '#475569',
                      }}
                    >
                      <Wallet size={13} color="#10b981" />
                      Direct Wallet Payout
                    </span>
                  </div>
                </div>
              </div>
              <div
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  border: `2px solid ${isSpecialist ? '#F5B942' : isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.2)'}`,
                  background: isSpecialist ? '#F5B942' : 'transparent',
                  boxShadow: isSpecialist ? '0 0 0 3px rgba(245, 185, 66, 0.25)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '4px',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                {isSpecialist && <Check size={15} color="#08090C" strokeWidth={3.2} />}
              </div>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <button
          type="button"
          onClick={handleProceed}
          className="cta-gold-btn"
          style={{
            width: '100%',
            minHeight: '54px',
            border: 'none',
            borderRadius: '16px',
            color: '#08090C',
            fontFamily: 'Outfit, sans-serif',
            fontSize: '1rem',
            fontWeight: 900,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.55rem',
            marginBottom: '1.25rem',
          }}
        >
          <span>{isCustomer ? 'Continue as Client' : 'Continue as Specialist'}</span>
          <ArrowRight size={19} strokeWidth={2.8} />
        </button>

        <div>
          <p style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '0.88rem' }}>
            Already have an account?{' '}
            <span
              onClick={() => navigate('/login')}
              style={{ color: '#F5B942', fontWeight: 800, cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}
            >
              Sign In
            </span>
          </p>
        </div>
      </div>
    </PageContainer>
  );
};

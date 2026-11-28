import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
  QrCode,
  Layers,
  Wallet,
  Sparkles,
  Check,
  Compass,
} from 'lucide-react';
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
        .role-editorial-item {
          cursor: pointer;
          position: relative;
          padding: 1.35rem 1.15rem;
          border-radius: 16px;
          border: 1.5px solid transparent;
          transition: all 0.24s cubic-bezier(0.16, 1, 0.3, 1);
          user-select: none;
          -webkit-tap-highlight-color: transparent;
        }

        .role-editorial-item:hover {
          transform: translate3d(0, -2px, 0);
        }

        .role-editorial-item:active {
          transform: scale(0.99);
        }

        .cta-gold-btn {
          background: linear-gradient(135deg, #F5B942 0%, #E8912D 100%);
          box-shadow: 0 10px 28px -4px rgba(245, 185, 66, 0.45);
          transition: transform 0.18s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.18s ease;
        }

        .cta-gold-btn:hover {
          transform: translate3d(0, -2px, 0);
          box-shadow: 0 14px 34px -4px rgba(245, 185, 66, 0.65);
        }

        .feature-tag {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.74rem;
          font-weight: 600;
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: ${isDark ? '#cbd5e1' : '#475569'};
        }
      `}</style>

      <div
        style={{
          maxWidth: '460px',
          margin: '0 auto',
          padding: '1.25rem 0.75rem 3.5rem',
          boxSizing: 'border-box',
          width: '100%',
        }}
      >
        {/* Top Header Mark */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          {/* Logo Emblem */}
          <div
            style={{
              width: '58px',
              height: '58px',
              borderRadius: '18px',
              overflow: 'hidden',
              margin: '0 auto 1.1rem',
              border: '2px solid rgba(245, 185, 66, 0.55)',
              boxShadow: '0 8px 24px rgba(245, 185, 66, 0.28)',
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

          {/* Micro Pill Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: isDark ? 'rgba(245, 185, 66, 0.12)' : 'rgba(245, 185, 66, 0.14)',
              border: '1px solid rgba(245, 185, 66, 0.35)',
              borderRadius: '50px',
              padding: '0.28rem 0.85rem',
              fontSize: '0.72rem',
              fontWeight: 800,
              color: isDark ? '#F5B942' : '#B47806',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '0.65rem',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            <Sparkles size={12} color="#F5B942" />
            Style Corner Atelier
          </div>

          {/* Clean Editorial Title (Inspired by Image 2) */}
          <h1
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 'clamp(1.75rem, 5.5vw, 2.15rem)',
              fontWeight: 800,
              color: isDark ? '#FFFFFF' : '#0F172A',
              marginBottom: '0.45rem',
              letterSpacing: '-0.025em',
              lineHeight: 1.2,
            }}
          >
            Select Your Role
          </h1>

          <p
            style={{
              color: isDark ? '#94a3b8' : '#64748b',
              fontSize: '0.88rem',
              lineHeight: 1.55,
              margin: '0 auto',
              maxWidth: '380px',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 400,
            }}
          >
            Choose how you will experience Style Corner to set up your personalized atelier account.
          </p>
        </div>

        {/* ── Editorial Selection List (Inspired by Image 2 - Ademola Commerciale) ── */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            marginBottom: '1.75rem',
          }}
        >
          {/* Option 01: Client / Customer */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => setSelectedRole('customer')}
            onKeyDown={(e) => e.key === 'Enter' && setSelectedRole('customer')}
            className="role-editorial-item"
            style={{
              background: isCustomer
                ? isDark
                  ? 'rgba(245, 185, 66, 0.08)'
                  : 'rgba(245, 185, 66, 0.06)'
                : isDark
                ? '#12151E'
                : '#FFFFFF',
              borderColor: isCustomer
                ? '#F5B942'
                : isDark
                ? 'rgba(255, 255, 255, 0.08)'
                : 'rgba(0, 0, 0, 0.08)',
              borderLeft: isCustomer
                ? '4px solid #F5B942'
                : `1.5px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'}`,
              boxShadow: isCustomer
                ? '0 10px 28px -4px rgba(245, 185, 66, 0.22)'
                : isDark
                ? '0 4px 18px rgba(0, 0, 0, 0.2)'
                : '0 4px 18px rgba(0, 0, 0, 0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              {/* Number Index (01) */}
              <div
                style={{
                  fontFamily: "'Space Grotesk', 'Plus Jakarta Sans', monospace",
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  color: isCustomer ? '#F5B942' : isDark ? '#64748b' : '#94a3b8',
                  lineHeight: 1.3,
                  paddingTop: '2px',
                  flexShrink: 0,
                  transition: 'color 0.2s ease',
                }}
              >
                01
              </div>

              {/* Main Content */}
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                  <h3
                    style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      color: isDark ? '#FFFFFF' : '#0F172A',
                      margin: 0,
                      letterSpacing: '-0.015em',
                    }}
                  >
                    Client / Customer
                  </h3>
                  <span
                    style={{
                      fontSize: '0.66rem',
                      fontWeight: 700,
                      padding: '0.16rem 0.55rem',
                      borderRadius: '50px',
                      background: 'rgba(16, 185, 129, 0.14)',
                      color: '#10b981',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                    }}
                  >
                    Book Sessions
                  </span>
                </div>

                <p
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: '0.84rem',
                    color: isDark ? '#94a3b8' : '#64748b',
                    lineHeight: 1.5,
                    margin: '0 0 0.65rem',
                    fontWeight: 400,
                  }}
                >
                  Book verified barbers, lash techs, nail artists, braiders &amp; wig stylists across Lagos &amp; Ibadan.
                </p>

                {/* Feature Tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <span className="feature-tag">
                    <ShieldCheck size={14} color="#10b981" />
                    <span>100% Escrow Protected</span>
                  </span>
                  <span className="feature-tag">
                    <QrCode size={13} color="#F5B942" />
                    <span>Digital Pass Check-In</span>
                  </span>
                </div>
              </div>

              {/* Selection Indicator & Sleek Arrow */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0, paddingTop: '3px' }}>
                <div
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    border: `1.5px solid ${isCustomer ? '#F5B942' : isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'}`,
                    background: isCustomer ? '#F5B942' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {isCustomer && <Check size={13} color="#08090C" strokeWidth={3} />}
                </div>
                <ArrowRight
                  size={18}
                  style={{
                    color: isCustomer ? '#F5B942' : isDark ? '#475569' : '#94a3b8',
                    transform: isCustomer ? 'translateX(3px)' : 'translateX(0)',
                    transition: 'transform 0.2s ease, color 0.2s ease',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Option 02: Specialist / Expert */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => setSelectedRole('staff')}
            onKeyDown={(e) => e.key === 'Enter' && setSelectedRole('staff')}
            className="role-editorial-item"
            style={{
              background: isSpecialist
                ? isDark
                  ? 'rgba(245, 185, 66, 0.08)'
                  : 'rgba(245, 185, 66, 0.06)'
                : isDark
                ? '#12151E'
                : '#FFFFFF',
              borderColor: isSpecialist
                ? '#F5B942'
                : isDark
                ? 'rgba(255, 255, 255, 0.08)'
                : 'rgba(0, 0, 0, 0.08)',
              borderLeft: isSpecialist
                ? '4px solid #F5B942'
                : `1.5px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'}`,
              boxShadow: isSpecialist
                ? '0 10px 28px -4px rgba(245, 185, 66, 0.22)'
                : isDark
                ? '0 4px 18px rgba(0, 0, 0, 0.2)'
                : '0 4px 18px rgba(0, 0, 0, 0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              {/* Number Index (02) */}
              <div
                style={{
                  fontFamily: "'Space Grotesk', 'Plus Jakarta Sans', monospace",
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  color: isSpecialist ? '#F5B942' : isDark ? '#64748b' : '#94a3b8',
                  lineHeight: 1.3,
                  paddingTop: '2px',
                  flexShrink: 0,
                  transition: 'color 0.2s ease',
                }}
              >
                02
              </div>

              {/* Main Content */}
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                  <h3
                    style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      color: isDark ? '#FFFFFF' : '#0F172A',
                      margin: 0,
                      letterSpacing: '-0.015em',
                    }}
                  >
                    Specialist / Expert
                  </h3>
                  <span
                    style={{
                      fontSize: '0.66rem',
                      fontWeight: 700,
                      padding: '0.16rem 0.55rem',
                      borderRadius: '50px',
                      background: 'rgba(245, 185, 66, 0.15)',
                      color: '#F5B942',
                      border: '1px solid rgba(245, 185, 66, 0.35)',
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                    }}
                  >
                    Earn &amp; Grow
                  </span>
                </div>

                <p
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: '0.84rem',
                    color: isDark ? '#94a3b8' : '#64748b',
                    lineHeight: 1.5,
                    margin: '0 0 0.65rem',
                    fontWeight: 400,
                  }}
                >
                  Showcase your portfolio, receive client appointments &amp; get paid directly to your wallet.
                </p>

                {/* Feature Tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <span className="feature-tag">
                    <Layers size={13} color="#a855f7" />
                    <span>Lookbook Showcase</span>
                  </span>
                  <span className="feature-tag">
                    <Wallet size={13} color="#10b981" />
                    <span>Direct Wallet Payout</span>
                  </span>
                </div>
              </div>

              {/* Selection Indicator & Sleek Arrow */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0, paddingTop: '3px' }}>
                <div
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    border: `1.5px solid ${isSpecialist ? '#F5B942' : isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'}`,
                    background: isSpecialist ? '#F5B942' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {isSpecialist && <Check size={13} color="#08090C" strokeWidth={3} />}
                </div>
                <ArrowRight
                  size={18}
                  style={{
                    color: isSpecialist ? '#F5B942' : isDark ? '#475569' : '#94a3b8',
                    transform: isSpecialist ? 'translateX(3px)' : 'translateX(0)',
                    transition: 'transform 0.2s ease, color 0.2s ease',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Primary Action CTA Button ── */}
        <button
          type="button"
          onClick={handleProceed}
          className="cta-gold-btn"
          style={{
            width: '100%',
            minHeight: '52px',
            border: 'none',
            borderRadius: '14px',
            color: '#08090C',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: '0.98rem',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.55rem',
            marginBottom: '1.25rem',
          }}
        >
          <span>{isCustomer ? 'Continue as Client' : 'Continue as Specialist'}</span>
          <ArrowRight size={18} strokeWidth={2.8} />
        </button>

        {/* Sign In Link */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <p
            style={{
              color: isDark ? '#94a3b8' : '#64748b',
              fontSize: '0.86rem',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            Already have an account?{' '}
            <span
              onClick={() => navigate('/login')}
              style={{
                color: '#F5B942',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                textDecoration: 'underline',
                textUnderlineOffset: '3px',
              }}
            >
              Sign In
            </span>
          </p>
        </div>

        {/* ── Divider ── */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
            marginBottom: '1.25rem',
          }}
        >
          <div style={{ flex: 1, height: '1px', background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }} />
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              color: isDark ? '#64748b' : '#94a3b8',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            Or Continue As Guest
          </span>
          <div style={{ flex: 1, height: '1px', background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }} />
        </div>

        {/* ── Explore as Guest Button ── */}
        <button
          type="button"
          onClick={() => navigate('/services')}
          style={{
            width: '100%',
            minHeight: '48px',
            background: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)',
            border: `1.5px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'}`,
            borderRadius: '14px',
            color: isDark ? '#FFFFFF' : '#0F172A',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: '0.9rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 1.15rem',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Compass size={18} color="#F5B942" />
            <span>Explore Atelier Services as Guest</span>
          </div>
          <ArrowRight size={16} color={isDark ? '#94a3b8' : '#64748b'} />
        </button>
      </div>
    </PageContainer>
  );
};
export default RoleSelection;

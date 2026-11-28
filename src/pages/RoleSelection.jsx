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
  Sun,
  Moon,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const RoleSelection = () => {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const [selectedRole, setSelectedRole] = useState('customer');

  const handleProceed = () => {
    navigate(`/signup?role=${selectedRole}`);
  };

  const isCustomer = selectedRole === 'customer';
  const isSpecialist = selectedRole === 'staff';

  return (
    <div
      style={{
        minHeight: '100dvh',
        width: '100%',
        backgroundColor: isDark ? '#08090C' : '#FFFFFF',
        color: isDark ? '#FFFFFF' : '#0F172A',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        display: 'flex',
        flexDirection: 'column',
        overflowX: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;700&display=swap');

        .rs-role-row {
          cursor: pointer;
          position: relative;
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1.4rem 1.1rem;
          border-bottom: 1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)'};
          transition: background 0.22s ease;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
          user-select: none;
          min-height: 56px;
        }

        .rs-role-row:first-of-type {
          border-top: 1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)'};
        }

        .rs-role-row:active {
          background: ${isDark ? 'rgba(245,185,66,0.06)' : 'rgba(245,185,66,0.05)'};
        }

        .rs-cta-btn {
          background: linear-gradient(135deg, #F5B942 0%, #E8912D 100%);
          box-shadow: 0 10px 28px -4px rgba(245, 185, 66, 0.42);
          transition: transform 0.18s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.18s ease;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }

        .rs-cta-btn:active {
          transform: scale(0.98);
        }

        .rs-guest-btn {
          transition: background 0.18s ease;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }

        .rs-guest-btn:active {
          background: ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'} !important;
        }

        .rs-left-accent {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          border-radius: 0 2px 2px 0;
          transition: background 0.22s ease, opacity 0.22s ease;
        }
      `}</style>

      {/* ── Minimal Header ── */}
      <header
        style={{
          width: '100%',
          maxWidth: '480px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'calc(env(safe-area-inset-top, 0px) + 1rem) 1.25rem 0.85rem',
          boxSizing: 'border-box',
          borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`,
        }}
      >
        {/* Logo + Brand */}
        <div
          onClick={() => navigate('/')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '11px',
              overflow: 'hidden',
              border: '1.5px solid rgba(245, 185, 66, 0.5)',
              boxShadow: '0 3px 12px rgba(245,185,66,0.2)',
              background: '#08090C',
              flexShrink: 0,
            }}
          >
            <img
              src="/pwa-icon-192.png"
              alt="Style Corner"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          <div>
            <div
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: '0.95rem',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: isDark ? '#FFFFFF' : '#0F172A',
                lineHeight: 1.1,
              }}
            >
              Style<span style={{ color: '#F5B942' }}>Corner</span>
            </div>
            <div
              style={{
                fontSize: '0.6rem',
                fontWeight: 700,
                color: '#F5B942',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              Atelier
            </div>
          </div>
        </div>

        {/* Right: theme toggle + login */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <button
            onClick={toggleTheme}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.09)'}`,
              background: 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: isDark ? '#94a3b8' : '#64748b',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button
            onClick={() => navigate('/login')}
            style={{
              height: '36px',
              padding: '0 0.9rem',
              borderRadius: '10px',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
              background: 'transparent',
              color: isDark ? '#e2e8f0' : '#334155',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            Sign In
          </button>
        </div>
      </header>

      {/* ── Scrollable Body ── */}
      <div
        style={{
          flex: 1,
          width: '100%',
          maxWidth: '480px',
          margin: '0 auto',
          padding: '0 1.25rem',
          boxSizing: 'border-box',
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 2.5rem)',
        }}
      >
        {/* Title Section */}
        <div style={{ paddingTop: '2rem', paddingBottom: '1.75rem' }}>
          {/* Pill */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: isDark ? 'rgba(245,185,66,0.1)' : 'rgba(245,185,66,0.12)',
              border: '1px solid rgba(245,185,66,0.3)',
              borderRadius: '50px',
              padding: '0.26rem 0.8rem',
              marginBottom: '1rem',
            }}
          >
            <Sparkles size={12} color="#F5B942" />
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 800,
                color: isDark ? '#F5B942' : '#B47806',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              Welcome to Style Corner
            </span>
          </div>

          {/* Large editorial heading */}
          <h1
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 'clamp(2rem, 7vw, 2.5rem)',
              fontWeight: 800,
              color: isDark ? '#FFFFFF' : '#0F172A',
              margin: '0 0 0.5rem',
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
            }}
          >
            Select Your<br />
            <span style={{ color: '#F5B942' }}>Role.</span>
          </h1>

          <p
            style={{
              color: isDark ? '#94a3b8' : '#64748b',
              fontSize: '0.875rem',
              lineHeight: 1.6,
              margin: 0,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 400,
              maxWidth: '340px',
            }}
          >
            Choose how you will experience Style Corner and set up your personalized atelier account.
          </p>
        </div>

        {/* ── Ademola-style Editorial Role List ── */}
        <div
          style={{
            marginBottom: '1.75rem',
            borderRadius: '16px',
            overflow: 'hidden',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)'}`,
            background: isDark ? '#0D1017' : '#FAFAFA',
          }}
        >
          {/* Row 01 — Client / Customer */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => setSelectedRole('customer')}
            onKeyDown={(e) => e.key === 'Enter' && setSelectedRole('customer')}
            className="rs-role-row"
            style={{
              background: isCustomer
                ? isDark ? 'rgba(245,185,66,0.08)' : 'rgba(245,185,66,0.05)'
                : 'transparent',
            }}
          >
            {/* Gold left accent bar */}
            <div
              className="rs-left-accent"
              style={{
                background: '#F5B942',
                opacity: isCustomer ? 1 : 0,
              }}
            />

            {/* Number index */}
            <div
              style={{
                fontFamily: "'Space Grotesk', monospace",
                fontSize: '0.9rem',
                fontWeight: 700,
                color: isCustomer ? '#F5B942' : isDark ? '#475569' : '#94a3b8',
                lineHeight: 1.3,
                paddingTop: '3px',
                flexShrink: 0,
                minWidth: '28px',
                transition: 'color 0.2s ease',
              }}
            >
              01
            </div>

            {/* Content */}
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.3rem',
                  flexWrap: 'wrap',
                }}
              >
                <span
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    color: isDark ? '#FFFFFF' : '#0F172A',
                    letterSpacing: '-0.015em',
                  }}
                >
                  Client / Customer
                </span>
                <span
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.5rem',
                    borderRadius: '50px',
                    background: 'rgba(16,185,129,0.14)',
                    color: '#10b981',
                    border: '1px solid rgba(16,185,129,0.3)',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  Book Sessions
                </span>
              </div>

              <p
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: '0.83rem',
                  color: isDark ? '#94a3b8' : '#64748b',
                  lineHeight: 1.55,
                  margin: '0 0 0.65rem',
                  fontWeight: 400,
                }}
              >
                Book verified barbers, lash techs, nail artists, braiders &amp; wig stylists.
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    fontSize: '0.73rem',
                    fontWeight: 600,
                    color: isDark ? '#94a3b8' : '#475569',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  <ShieldCheck size={13} color="#10b981" />
                  Escrow Protected
                </span>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    fontSize: '0.73rem',
                    fontWeight: 600,
                    color: isDark ? '#94a3b8' : '#475569',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  <QrCode size={12} color="#F5B942" />
                  Digital Pass Check-In
                </span>
              </div>
            </div>

            {/* Right: radio + arrow */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                flexShrink: 0,
                paddingTop: '2px',
              }}
            >
              <div
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  border: `1.5px solid ${isCustomer ? '#F5B942' : isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}`,
                  background: isCustomer ? '#F5B942' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                  flexShrink: 0,
                }}
              >
                {isCustomer && <Check size={12} color="#08090C" strokeWidth={3} />}
              </div>
              <ArrowRight
                size={17}
                style={{
                  color: isCustomer ? '#F5B942' : isDark ? '#475569' : '#94a3b8',
                  transform: isCustomer ? 'translateX(2px)' : 'translateX(0)',
                  transition: 'transform 0.2s ease, color 0.2s ease',
                }}
              />
            </div>
          </div>

          {/* Row 02 — Specialist / Expert */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => setSelectedRole('staff')}
            onKeyDown={(e) => e.key === 'Enter' && setSelectedRole('staff')}
            className="rs-role-row"
            style={{
              background: isSpecialist
                ? isDark ? 'rgba(245,185,66,0.08)' : 'rgba(245,185,66,0.05)'
                : 'transparent',
            }}
          >
            {/* Gold left accent bar */}
            <div
              className="rs-left-accent"
              style={{
                background: '#F5B942',
                opacity: isSpecialist ? 1 : 0,
              }}
            />

            {/* Number index */}
            <div
              style={{
                fontFamily: "'Space Grotesk', monospace",
                fontSize: '0.9rem',
                fontWeight: 700,
                color: isSpecialist ? '#F5B942' : isDark ? '#475569' : '#94a3b8',
                lineHeight: 1.3,
                paddingTop: '3px',
                flexShrink: 0,
                minWidth: '28px',
                transition: 'color 0.2s ease',
              }}
            >
              02
            </div>

            {/* Content */}
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.3rem',
                  flexWrap: 'wrap',
                }}
              >
                <span
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    color: isDark ? '#FFFFFF' : '#0F172A',
                    letterSpacing: '-0.015em',
                  }}
                >
                  Specialist / Expert
                </span>
                <span
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.5rem',
                    borderRadius: '50px',
                    background: 'rgba(245,185,66,0.14)',
                    color: '#F5B942',
                    border: '1px solid rgba(245,185,66,0.3)',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  Earn &amp; Grow
                </span>
              </div>

              <p
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: '0.83rem',
                  color: isDark ? '#94a3b8' : '#64748b',
                  lineHeight: 1.55,
                  margin: '0 0 0.65rem',
                  fontWeight: 400,
                }}
              >
                Showcase your portfolio, receive client appointments &amp; get paid directly to your wallet.
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    fontSize: '0.73rem',
                    fontWeight: 600,
                    color: isDark ? '#94a3b8' : '#475569',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  <Layers size={12} color="#a855f7" />
                  Lookbook Showcase
                </span>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    fontSize: '0.73rem',
                    fontWeight: 600,
                    color: isDark ? '#94a3b8' : '#475569',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  <Wallet size={12} color="#10b981" />
                  Direct Wallet Payout
                </span>
              </div>
            </div>

            {/* Right: radio + arrow */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                flexShrink: 0,
                paddingTop: '2px',
              }}
            >
              <div
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  border: `1.5px solid ${isSpecialist ? '#F5B942' : isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}`,
                  background: isSpecialist ? '#F5B942' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                  flexShrink: 0,
                }}
              >
                {isSpecialist && <Check size={12} color="#08090C" strokeWidth={3} />}
              </div>
              <ArrowRight
                size={17}
                style={{
                  color: isSpecialist ? '#F5B942' : isDark ? '#475569' : '#94a3b8',
                  transform: isSpecialist ? 'translateX(2px)' : 'translateX(0)',
                  transition: 'transform 0.2s ease, color 0.2s ease',
                }}
              />
            </div>
          </div>
        </div>

        {/* ── Activation note for experts ── */}
        {isSpecialist && (
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.65rem',
              padding: '0.85rem 1rem',
              borderRadius: '12px',
              background: isDark ? 'rgba(245,185,66,0.08)' : 'rgba(245,185,66,0.07)',
              border: '1px solid rgba(245,185,66,0.25)',
              marginBottom: '1.25rem',
            }}
          >
            <Sparkles size={15} color="#F5B942" style={{ flexShrink: 0, marginTop: '1px' }} />
            <p
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: '0.78rem',
                color: isDark ? '#e2c97e' : '#92680a',
                lineHeight: 1.5,
                margin: 0,
                fontWeight: 500,
              }}
            >
              Expert accounts require a one-time <strong>₦3,000 activation</strong> to go live and receive bookings. Payment is processed after registration.
            </p>
          </div>
        )}

        {/* ── CTA Button ── */}
        <button
          type="button"
          onClick={handleProceed}
          className="rs-cta-btn"
          style={{
            width: '100%',
            minHeight: '54px',
            border: 'none',
            borderRadius: '14px',
            color: '#08090C',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: '1rem',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.55rem',
            marginBottom: '1rem',
            boxSizing: 'border-box',
          }}
        >
          <span>{isCustomer ? 'Continue as Client' : 'Continue as Specialist'}</span>
          <ArrowRight size={18} strokeWidth={2.8} />
        </button>

        {/* Sign In link */}
        <p
          style={{
            textAlign: 'center',
            color: isDark ? '#94a3b8' : '#64748b',
            fontSize: '0.86rem',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            marginBottom: '1.5rem',
          }}
        >
          Already have an account?{' '}
          <span
            onClick={() => navigate('/login')}
            style={{
              color: '#F5B942',
              fontWeight: 700,
              cursor: 'pointer',
              textDecoration: 'underline',
              textUnderlineOffset: '3px',
            }}
          >
            Sign In
          </span>
        </p>

        {/* Divider */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
            marginBottom: '1rem',
          }}
        >
          <div style={{ flex: 1, height: '1px', background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }} />
          <span
            style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              color: isDark ? '#64748b' : '#94a3b8',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              whiteSpace: 'nowrap',
            }}
          >
            Or Continue As Guest
          </span>
          <div style={{ flex: 1, height: '1px', background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }} />
        </div>

        {/* Guest explore button */}
        <button
          type="button"
          onClick={() => navigate('/services')}
          className="rs-guest-btn"
          style={{
            width: '100%',
            minHeight: '50px',
            background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
            border: `1.5px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
            borderRadius: '14px',
            color: isDark ? '#FFFFFF' : '#0F172A',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: '0.9rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 1.1rem',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Compass size={17} color="#F5B942" />
            <span>Explore Atelier Services as Guest</span>
          </div>
          <ArrowRight size={15} color={isDark ? '#94a3b8' : '#64748b'} />
        </button>
      </div>
    </div>
  );
};

export default RoleSelection;

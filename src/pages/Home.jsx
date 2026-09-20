import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scissors, ArrowRight, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { PageContainer } from '../components/common/PageContainer';
import { preloadRoute } from '../App';

export const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated, role, user } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    // Preload next routes for instant tap response
    preloadRoute('/signup');
    preloadRoute('/login');
    preloadRoute('/services');
  }, []);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      if (role === 'staff') {
        navigate('/expert-dashboard');
      } else {
        navigate('/customer-dashboard');
      }
    } else {
      navigate('/signup');
    }
  };

  const handleLogin = () => {
    if (isAuthenticated) {
      if (role === 'staff') {
        navigate('/expert-dashboard');
      } else {
        navigate('/customer-dashboard');
      }
    } else {
      navigate('/login');
    }
  };

  return (
    <PageContainer hideHeader={true} hideNav={true} noPadding={true}>
      <div
        style={{
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: isDark ? '#0B0D13' : '#F3F4F6',
          padding: '0',
          position: 'relative',
          overflowX: 'hidden',
          transition: 'background 0.3s ease',
        }}
      >
        {/* Main Phone / Card Frame */}
        <div
          style={{
            width: '100%',
            maxWidth: '460px',
            minHeight: '100dvh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: isDark ? '#131620' : '#FFFFFF',
            boxShadow: isDark
              ? '0 25px 60px -15px rgba(0, 0, 0, 0.7)'
              : '0 25px 60px -15px rgba(0, 0, 0, 0.1)',
            position: 'relative',
            transition: 'background 0.3s ease',
          }}
        >
          {/* ── TOP HERO SECTION (Reference-Inspired 3D Atelier Graphic) ── */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '58vh',
              minHeight: '390px',
              maxHeight: '520px',
              background: 'linear-gradient(180deg, #F9BA32 0%, #F5A623 50%, #E89518 100%)',
              borderBottomLeftRadius: '42px',
              borderBottomRightRadius: '42px',
              overflow: 'hidden',
              boxShadow: '0 20px 35px -10px rgba(232, 149, 24, 0.35)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* 3D Atelier Visual Asset */}
            <img
              src="/images/landing-hero-3d.jpg"
              alt="Style Corner Atelier"
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center 40%',
                pointerEvents: 'none',
              }}
            />

            {/* Subtle Gradient Highlights */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '130px',
                background: 'linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0) 100%)',
                pointerEvents: 'none',
              }}
            />

            {/* ── APP LOGO HEADER & THEME TOGGLE ── */}
            <div
              style={{
                position: 'relative',
                zIndex: 10,
                paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1.5rem)',
                paddingLeft: '1.25rem',
                paddingRight: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* Brand Logo Pill (Matching reference style with scissors & Atelier branding) */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  background: 'rgba(255, 255, 255, 0.22)',
                  backdropFilter: 'blur(14px)',
                  WebkitBackdropFilter: 'blur(14px)',
                  padding: '0.45rem 1.15rem 0.45rem 0.65rem',
                  borderRadius: '50px',
                  border: '1px solid rgba(255, 255, 255, 0.45)',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                }}
              >
                {/* Logo Icon Badge */}
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#E89518',
                    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.12)',
                  }}
                >
                  <Scissors size={18} strokeWidth={2.5} />
                </div>

                {/* Typography */}
                <span
                  style={{
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: '1.2rem',
                    fontWeight: 800,
                    letterSpacing: '-0.01em',
                    color: '#FFFFFF',
                    textShadow: '0 2px 8px rgba(0, 0, 0, 0.18)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px',
                  }}
                >
                  Style<span style={{ fontWeight: 900, color: '#FFF9ED' }}>Corner</span>
                </span>
              </div>

              {/* Discreet Theme Switcher */}
              <button
                type="button"
                onClick={toggleTheme}
                style={{
                  position: 'absolute',
                  right: '1.25rem',
                  top: 'calc(env(safe-area-inset-top, 0px) + 1.6rem)',
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.35)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'all 0.2s ease',
                }}
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDark ? <Sun size={16} /> : <Moon size={16} />}
              </button>
            </div>
          </div>

          {/* ── BOTTOM CONTENT & CTA SECTION ── */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '2.25rem 1.75rem calc(env(safe-area-inset-bottom, 0px) + 2rem)',
              textAlign: 'center',
              background: isDark ? '#131620' : '#FFFFFF',
              transition: 'background 0.3s ease',
            }}
          >
            {/* Title & Description */}
            <div style={{ maxWidth: '360px', margin: '0 auto' }}>
              <h1
                style={{
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: '2.15rem',
                  fontWeight: 900,
                  color: isDark ? '#F9FAFB' : '#111827',
                  margin: '0 0 0.85rem',
                  letterSpacing: '-0.025em',
                  lineHeight: 1.15,
                }}
              >
                Start your journey
              </h1>

              <p
                style={{
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: '0.98rem',
                  color: isDark ? '#9CA3AF' : '#4B5563',
                  margin: 0,
                  lineHeight: 1.55,
                  fontWeight: 500,
                }}
              >
                {isAuthenticated
                  ? `Welcome back, ${user?.firstname || 'Stylist'}! Access your appointments, wallet, and grooming orders.`
                  : 'Discover premier barbers, hair stylists & grooming specialists. Book luxury appointments in seconds.'}
              </p>
            </div>

            {/* Actions & CTAs */}
            <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Primary "Get Started" Button */}
              <button
                onClick={handleGetStarted}
                onMouseEnter={() => preloadRoute('/signup')}
                className="app-btn"
                style={{
                  width: '100%',
                  minHeight: '56px',
                  height: '56px',
                  background: 'linear-gradient(135deg, #FF6A00 0%, #EE5100 100%)',
                  color: '#FFFFFF',
                  borderRadius: '18px',
                  border: 'none',
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: '1.08rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 12px 28px -6px rgba(238, 81, 0, 0.42)',
                  transition: 'all 0.2s ease',
                }}
              >
                <span>{isAuthenticated ? 'Go to Dashboard' : 'Get Started'}</span>
                <ArrowRight size={19} strokeWidth={2.5} />
              </button>

              {/* Secondary Navigation Row (Login & Guest Explore) */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem',
                  fontSize: '0.92rem',
                  fontFamily: 'Outfit, sans-serif',
                  color: isDark ? '#9CA3AF' : '#6B7280',
                  fontWeight: 500,
                }}
              >
                {isAuthenticated ? (
                  <span>
                    Logged in as <strong style={{ color: isDark ? '#F9FAFB' : '#111827' }}>{user?.email}</strong>
                  </span>
                ) : (
                  <>
                    <span>Already have an account?</span>
                    <button
                      type="button"
                      onClick={handleLogin}
                      onMouseEnter={() => preloadRoute('/login')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#EE5100',
                        fontWeight: 800,
                        cursor: 'pointer',
                        padding: '4px',
                        fontSize: '0.92rem',
                        fontFamily: 'Outfit, sans-serif',
                        textDecoration: 'none',
                      }}
                    >
                      Log In
                    </button>
                  </>
                )}
              </div>

              {/* Guest Explore Quick Link */}
              <button
                type="button"
                onClick={() => navigate('/services')}
                onMouseEnter={() => preloadRoute('/services')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: isDark ? '#6B7280' : '#9CA3AF',
                  fontSize: '0.82rem',
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: '4px',
                  marginTop: '0.25rem',
                  letterSpacing: '0.02em',
                }}
              >
                Or browse services as guest →
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

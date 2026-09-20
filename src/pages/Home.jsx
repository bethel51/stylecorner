import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sun, Moon } from 'lucide-react';
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
          background: '#07080B',
          padding: '0',
          position: 'relative',
          overflowX: 'hidden',
        }}
      >
        {/* Main Phone / Card Container */}
        <div
          style={{
            width: '100%',
            maxWidth: '460px',
            minHeight: '100dvh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: '#0D0E12',
            boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8)',
            position: 'relative',
          }}
        >
          {/* ── TOP HERO PHOTO SECTION ── */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '59vh',
              minHeight: '390px',
              maxHeight: '520px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Real Atelier Salon Hero Visual */}
            <img
              src="/images/stylecorner-salon-top.jpg"
              alt="Style Corner Luxury Atelier"
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center top',
              }}
            />

            {/* Seamless Bottom Gradient Fade into Dark Canvas */}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '80px',
                background: 'linear-gradient(180deg, rgba(13,14,18,0) 0%, rgba(13,14,18,0.85) 65%, #0D0E12 100%)',
                pointerEvents: 'none',
              }}
            />

            {/* Interactive Theme Switcher Overlay on top-right sun icon */}
            <button
              type="button"
              onClick={toggleTheme}
              style={{
                position: 'absolute',
                right: '1.25rem',
                top: 'calc(env(safe-area-inset-top, 0px) + 1.25rem)',
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                zIndex: 20,
              }}
              aria-label="Toggle Theme"
              title={isDark ? 'Switch Theme' : 'Switch Theme'}
            />
          </div>

          {/* ── BOTTOM CONTENT & CTA SECTION (Exact Reference Typography & Colors) ── */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '1.75rem 1.75rem calc(env(safe-area-inset-bottom, 0px) + 2rem)',
              textAlign: 'center',
              background: '#0D0E12',
            }}
          >
            {/* Title & Subtitle */}
            <div style={{ maxWidth: '370px', margin: '0 auto' }}>
              <h1
                style={{
                  fontFamily: 'Outfit, -apple-system, BlinkMacSystemFont, sans-serif',
                  fontSize: '2.35rem',
                  fontWeight: 800,
                  color: '#FFFFFF',
                  margin: '0 0 0.85rem',
                  letterSpacing: '-0.025em',
                  lineHeight: 1.15,
                }}
              >
                Start your <span style={{ color: '#F5B942' }}>journey</span>
              </h1>

              <p
                style={{
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: '0.98rem',
                  color: '#9CA3AF',
                  margin: 0,
                  lineHeight: 1.55,
                  fontWeight: 400,
                }}
              >
                {isAuthenticated
                  ? `Welcome back, ${user?.firstname || 'Stylist'}! Access your bookings, digital wallet, and appointments.`
                  : 'Discover premier barbers, hair stylists & grooming specialists. Book luxury appointments in seconds.'}
              </p>
            </div>

            {/* Action Buttons & Links */}
            <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Primary "Get Started" Button (Golden Pill with Black Text) */}
              <button
                onClick={handleGetStarted}
                onMouseEnter={() => preloadRoute('/signup')}
                className="app-btn"
                style={{
                  width: '100%',
                  minHeight: '54px',
                  height: '54px',
                  background: '#F5B942',
                  color: '#0D0E12',
                  borderRadius: '50px',
                  border: 'none',
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: '1.05rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 10px 25px -5px rgba(245, 185, 66, 0.4)',
                  transition: 'all 0.2s ease',
                }}
              >
                <span>{isAuthenticated ? 'Go to Dashboard' : 'Get Started'}</span>
                <ArrowRight size={20} strokeWidth={2.8} />
              </button>

              {/* Secondary Row: Log In */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem',
                  fontSize: '0.92rem',
                  fontFamily: 'Outfit, sans-serif',
                  color: '#8E8E93',
                  fontWeight: 500,
                }}
              >
                {isAuthenticated ? (
                  <span>
                    Logged in as <strong style={{ color: '#F5B942' }}>{user?.email}</strong>
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
                        color: '#F5B942',
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

              {/* Quick Guest Catalogue Link */}
              <button
                type="button"
                onClick={() => navigate('/services')}
                onMouseEnter={() => preloadRoute('/services')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748B',
                  fontSize: '0.82rem',
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: '4px',
                  marginTop: '0.15rem',
                  letterSpacing: '0.02em',
                }}
              >
                Or explore services as guest →
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

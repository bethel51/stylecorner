import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, User, Sparkles, Shield, Bell, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../services/api';
import { ImagePreviewModal } from './ImagePreviewModal';
import { NotificationSheet } from './NotificationSheet';
import { OptimizedImage } from './OptimizedImage';
import { preloadRoute } from '../../App';

export const AppHeader = ({ title, showBack, onOpenAiMatcher, onOpenCart }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, role } = useAuth();
  const { itemCount = 0 } = useCart() || {};
  const { theme, toggleTheme, isDark } = useTheme();
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const isHome = location.pathname === '/';

  const fetchUnread = async () => {
    if (!isAuthenticated) return;
    try {
      const data = await api.getNotifications();
      setUnreadCount(data.unreadCount || 0);
    } catch (e) {}
  };

  React.useEffect(() => {
    if (isAuthenticated) {
      fetchUnread();
      const timer = setInterval(fetchUnread, 20000);
      return () => clearInterval(timer);
    }
  }, [isAuthenticated]);

  const handleProfileClick = () => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      navigate('/profile');
    }
  };

  const handleNavigateDashboard = () => {
    if (role === 'staff') {
      navigate('/expert-dashboard');
    } else {
      navigate('/customer-dashboard');
    }
  };

  return (
    <>
      <header className="app-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', flex: 1, minWidth: 0 }}>
          {showBack || (!isHome && location.pathname !== '/customer-dashboard' && location.pathname !== '/expert-dashboard') ? (
            <button
              className="app-header-btn"
              onClick={() => navigate(-1)}
              aria-label="Go Back"
            >
              <ArrowLeft size={18} />
            </button>
          ) : (
            <div
              onClick={() => navigate('/')}
              onMouseEnter={() => preloadRoute('/')}
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.45rem' }}
            >
              <Sparkles size={18} fill="var(--color-accent)" color="var(--color-accent)" />
            </div>
          )}

          <div className="app-header-title">
            {title ? (
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</span>
            ) : (
              <span style={{ letterSpacing: '0.04em', fontWeight: 800, fontSize: '1.05rem', whiteSpace: 'nowrap' }}>
                STYLE<span style={{ color: 'var(--color-accent)' }}>CORNER</span>
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
          {/* Theme Toggle Button */}
          <button
            className="app-header-btn"
            onClick={toggleTheme}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle Theme"
          >
            {isDark ? <Sun size={17} color="var(--color-accent)" /> : <Moon size={17} color="var(--color-accent)" />}
          </button>

          <button
            className="app-header-btn"
            onClick={onOpenAiMatcher || (() => navigate('/ai-matcher'))}
            onMouseEnter={() => preloadRoute('/ai-matcher')}
            title="AI Specialist Matcher"
            style={{ color: 'var(--color-accent)', borderColor: 'var(--color-border-accent)' }}
          >
            <Sparkles size={17} />
          </button>

          <button
            className="app-header-btn"
            onClick={() => {
              if (isAuthenticated) {
                navigate('/notifications');
              } else {
                navigate('/login');
              }
            }}
            onMouseEnter={() => preloadRoute(isAuthenticated ? '/notifications' : '/login')}
            title="Notifications"
            aria-label="Notifications"
            style={{ position: 'relative' }}
          >
            <Bell size={18} color="var(--color-text-primary)" />
            {unreadCount > 0 && <span className="badge-dot" />}
          </button>

          {!isHome && (
            <button
              className="app-header-btn"
              onClick={onOpenCart || (() => navigate('/cart'))}
              onMouseEnter={() => preloadRoute('/cart')}
              aria-label="Store Cart"
            >
              <ShoppingBag size={18} color="var(--color-text-primary)" />
              {itemCount > 0 && <span className="badge-dot" />}
            </button>
          )}

          <button
            className="app-header-btn"
            onClick={handleProfileClick}
            onMouseEnter={() => preloadRoute(isAuthenticated ? '/profile' : '/login')}
            aria-label="User Profile"
            style={{
              borderColor: 'var(--color-accent)',
              overflow: 'hidden',
              padding: 0,
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--color-card-surface)',
            }}
          >
            {user?.avatarUrl ? (
              <OptimizedImage
                src={user.avatarUrl}
                alt={user?.firstname || 'User Profile'}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '50%',
                }}
              />
            ) : (user?.firstname && typeof user.firstname === 'string') ? (
              <span
                style={{
                  fontFamily: 'Outfit',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  color: '#f5b942',
                  textTransform: 'uppercase',
                }}
              >
                {user.firstname.charAt(0)}
              </span>
            ) : (
              <User size={17} color="#f5b942" />
            )}
          </button>
        </div>
      </header>

      <NotificationSheet
        isOpen={showNotifications}
        onClose={() => { setShowNotifications(false); fetchUnread(); }}
        onSelectNotification={(notif) => {
          if (notif.orderId) {
            if (role === 'admin') navigate('/admin');
            else navigate('/customer-dashboard');
          }
        }}
      />

      <ImagePreviewModal
        isOpen={showImagePreview}
        onClose={() => setShowImagePreview(false)}
        imageUrl={user?.avatarUrl}
        title={user ? `${user.firstname || 'User'}'s Profile Picture` : 'Profile Picture'}
        onNavigateDashboard={handleNavigateDashboard}
      />
    </>
  );
};

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
        <div className="app-header-left">
          {showBack ? (
            <button
              className="app-header-btn"
              onClick={() => navigate(-1)}
              aria-label="Go Back"
            >
              <ArrowLeft size={18} />
            </button>
          ) : null}

          <div
            onClick={() => navigate('/')}
            onMouseEnter={() => preloadRoute('/')}
            className="app-header-brand-wrap"
          >
            <img
              src="/pwa-icon-192.png"
              alt="StyleCorner Logo"
              className="app-header-logo"
            />
            <div className="app-header-brand-text">
              <span className="brand-primary-text">
                STYLE<span style={{ color: 'var(--color-accent)' }}>CORNER</span>
              </span>
              <span className="brand-sub-badge">Atelier Grooming</span>
            </div>
          </div>

          {title && !isHome && (
            <div className="app-header-subpage-badge mobile-hide">
              <span className="subpage-sep">/</span>
              <span className="subpage-title">{title}</span>
            </div>
          )}
        </div>

        {/* Desktop Navigation Links (>=1024px) */}
        <nav className="desktop-nav-menu" aria-label="Main Navigation">
          {[
            { label: 'Home', path: '/' },
            { label: 'Services', path: '/services' },
            { label: 'Specialists', path: '/experts' },
            { label: 'Gallery', path: '/gallery' },
            { label: 'Store', path: '/store' },
            { label: 'About', path: '/about' },
            { label: 'Contact', path: '/contact' },
          ].map((item) => {
            const isActive = item.path === '/' 
              ? location.pathname === '/' 
              : location.pathname.startsWith(item.path);

            return (
              <button
                key={item.path}
                type="button"
                onClick={() => {
                  preloadRoute(item.path);
                  navigate(item.path);
                }}
                onMouseEnter={() => preloadRoute(item.path)}
                className={`desktop-nav-link ${isActive ? 'active' : ''}`}
              >
                {item.label}
                {isActive && <span className="desktop-nav-active-pip" />}
              </button>
            );
          })}
        </nav>

        {/* Right Action Cluster */}
        <div className="app-header-right">
          {/* Theme Toggle Button */}
          <button
            className="app-header-btn"
            onClick={toggleTheme}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle Theme"
          >
            {isDark ? <Sun size={17} color="var(--color-accent)" /> : <Moon size={17} color="var(--color-accent)" />}
          </button>

          {/* AI Matcher Pill — hidden on mobile, shown on desktop */}
          <button
            className="app-header-btn desktop-ai-btn"
            onClick={onOpenAiMatcher || (() => navigate('/ai-matcher'))}
            onMouseEnter={() => preloadRoute('/ai-matcher')}
            title="AI Specialist Matcher"
          >
            <Sparkles size={16} />
            <span className="desktop-only-text">AI Matcher</span>
          </button>

          {/* Notifications */}
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

          {/* Cart Icon */}
          <button
            className="app-header-btn"
            onClick={onOpenCart || (() => navigate('/cart'))}
            onMouseEnter={() => preloadRoute('/cart')}
            aria-label="Store Cart"
            title="Shopping Cart"
            style={{ position: 'relative' }}
          >
            <ShoppingBag size={18} color="var(--color-text-primary)" />
            {itemCount > 0 && <span className="badge-dot" />}
          </button>

          {/* Desktop Book Appointment CTA Button */}
          <button
            type="button"
            onClick={() => {
              preloadRoute('/booking');
              navigate('/booking');
            }}
            onMouseEnter={() => preloadRoute('/booking')}
            className="desktop-book-btn"
            title="Book an Appointment"
          >
            <span>Book Now</span>
          </button>

          {/* User Profile / Login Avatar */}
          <button
            className="app-header-btn profile-avatar-btn"
            onClick={handleProfileClick}
            onMouseEnter={() => preloadRoute(isAuthenticated ? '/profile' : '/login')}
            aria-label="User Profile"
            title={isAuthenticated ? "View Profile" : "Sign In"}
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

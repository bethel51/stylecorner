import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, User, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { ImagePreviewModal } from './ImagePreviewModal';

export const AppHeader = ({ title, showBack, onOpenAiMatcher, onOpenCart }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, role } = useAuth();
  const { itemCount } = useCart();
  const [showImagePreview, setShowImagePreview] = useState(false);

  const isHome = location.pathname === '/';

  const handleProfileClick = () => {
    if (!isAuthenticated) {
      navigate('/login');
    } else if (user?.avatarUrl) {
      setShowImagePreview(true);
    } else {
      navigate(role === 'staff' ? '/expert-dashboard' : '/customer-dashboard');
    }
  };

  const handleNavigateDashboard = () => {
    navigate(role === 'staff' ? '/expert-dashboard' : '/customer-dashboard');
  };

  return (
    <>
      <header className="app-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #1f1f1f, #121212)',
                  border: '1px solid rgba(212, 175, 55, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#d4af37',
                }}
              >
                <Sparkles size={16} />
              </div>
            </div>
          )}

          <div className="app-header-title">
            {title ? (
              title
            ) : (
              <span>
                STYLE<span style={{ color: '#d4af37' }}>CORNER</span>
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {onOpenAiMatcher && (
            <button
              className="app-header-btn"
              onClick={onOpenAiMatcher}
              title="AI Specialist Matcher"
              style={{ color: '#d4af37', borderColor: 'rgba(212,175,55,0.3)' }}
            >
              <Sparkles size={18} />
            </button>
          )}

          <button
            className="app-header-btn"
            onClick={onOpenCart || (() => navigate('/store'))}
            aria-label="Store Cart"
          >
            <ShoppingBag size={18} />
            {itemCount > 0 && <span className="badge-dot" />}
          </button>

          <button
            className="app-header-btn"
            onClick={handleProfileClick}
            aria-label="User Profile"
            style={{
              borderColor: isAuthenticated ? '#d4af37' : undefined,
              overflow: 'hidden',
              padding: user?.avatarUrl ? 0 : undefined,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {user?.avatarUrl ? (
              <img
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
                  fontSize: '0.85rem',
                  color: '#d4af37',
                  textTransform: 'uppercase',
                }}
              >
                {user.firstname.charAt(0)}
              </span>
            ) : (
              <User size={18} />
            )}
          </button>
        </div>
      </header>

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

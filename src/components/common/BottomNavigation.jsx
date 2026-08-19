import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Scissors, CalendarPlus, ShoppingBag, User, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, role, showToast } = useAuth();

  const getDashboardPath = () => {
    if (!isAuthenticated) return '/login';
    return role === 'staff' ? '/expert-dashboard' : '/customer-dashboard';
  };

  const handleBookClick = () => {
    if (isAuthenticated && role === 'staff') {
      showToast('Experts cannot book services.', 'error');
      navigate('/expert-dashboard');
      return;
    }
    navigate('/booking');
  };

  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Services', path: '/services', icon: Scissors },
    { label: 'Book', path: '/booking', icon: CalendarPlus, isCTA: true, onClick: handleBookClick },
    { label: 'Store', path: '/store', icon: ShoppingBag },
    {
      label: isAuthenticated ? (role === 'staff' ? 'Dashboard' : 'Profile') : 'Sign In',
      path: getDashboardPath(),
      icon: isAuthenticated ? LayoutDashboard : User,
    },
  ];

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          location.pathname === item.path ||
          (item.path !== '/' && location.pathname.startsWith(item.path));

        if (item.isCTA) {
          return (
            <button
              key={item.path}
              onClick={item.onClick || (() => navigate(item.path))}
              style={{
                background: 'linear-gradient(135deg, #d4af37, #b5952f)',
                border: 'none',
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 6px 16px rgba(212, 175, 55, 0.4)',
                cursor: 'pointer',
                transform: 'translateY(-10px)',
                transition: 'all 0.25s ease',
              }}
              title="Book Visit"
            >
              <Icon size={22} />
            </button>
          );
        }

        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`bottom-nav-item ${isActive ? 'active' : ''}`}
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            {isActive && <div className="bottom-nav-indicator" />}
            <Icon size={20} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

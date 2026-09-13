import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Scissors, Plus, ShoppingBag, User, Sparkles, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { preloadRoute } from '../../App';

export const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, role, showToast } = useAuth();

  const getDashboardPath = () => {
    if (!isAuthenticated) return '/login';
    if (role === 'admin') return '/admin';
    return role === 'staff' ? '/expert-dashboard' : '/customer-dashboard';
  };

  const handleBookClick = () => {
    if (isAuthenticated && (role === 'staff' || role === 'admin')) {
      if (role === 'admin') {
        navigate('/admin');
      } else {
        showToast('Experts cannot book services.', 'error');
        navigate('/expert-dashboard');
      }
      return;
    }
    navigate('/booking');
  };

  const isExpertsPath = location.pathname.startsWith('/experts');

  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Services', path: '/services', icon: Scissors },
    { label: 'Book', path: '/booking', icon: Plus, isCTA: true, onClick: handleBookClick },
    {
      label: isExpertsPath ? 'Stylists' : 'Store',
      path: isExpertsPath ? '/experts' : '/store',
      icon: isExpertsPath ? Users : ShoppingBag,
    },
    {
      label: 'Profile',
      path: isAuthenticated ? (role === 'staff' ? '/expert-dashboard' : role === 'admin' ? '/admin' : '/profile') : '/login',
      icon: User,
    },
  ];

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          location.pathname === item.path ||
          (item.path !== '/' && location.pathname.startsWith(item.path));

        const handlePrefetch = () => preloadRoute(item.path);

        if (item.isCTA) {
          return (
            <button
              key={item.path}
              onClick={item.onClick || (() => navigate(item.path))}
              onMouseEnter={handlePrefetch}
              onTouchStart={handlePrefetch}
              className="bottom-nav-cta"
              title="Book Appointment"
              aria-label="Book Appointment"
            >
              <Icon size={24} strokeWidth={2.8} />
            </button>
          );
        }

        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            onMouseEnter={handlePrefetch}
            onTouchStart={handlePrefetch}
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

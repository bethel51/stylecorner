import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Scissors, CalendarPlus, ShoppingBag, User, LayoutDashboard, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

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

  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Services', path: '/services', icon: Scissors },
    { label: 'Book', path: '/booking', icon: CalendarPlus, isCTA: true, onClick: handleBookClick },
    { label: 'Store', path: '/store', icon: ShoppingBag },
    {
      label: isAuthenticated ? (role === 'admin' ? 'Admin' : role === 'staff' ? 'Dashboard' : 'Profile') : 'Sign In',
      path: getDashboardPath(),
      icon: isAuthenticated ? (role === 'admin' ? Shield : LayoutDashboard) : User,
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
              className="bottom-nav-cta"
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

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Wallet,
  Gift,
  User,
  Package,
  Sparkles,
  CheckCheck,
} from 'lucide-react';
import { PageContainer } from '../components/common/PageContainer';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const DEFAULT_NOTIFICATIONS = [
  {
    id: 'n1',
    category: 'Bookings',
    type: 'booking',
    title: 'Booking Confirmed',
    message: 'Your hair styling appointment is confirmed for Sat, 23 Aug at 11:00 AM.',
    timeAgo: '2m ago',
    icon: Calendar,
  },
  {
    id: 'n2',
    category: 'Updates',
    type: 'payment',
    title: 'Payment Successful',
    message: '₦12,000 has been deducted from your wallet.',
    timeAgo: '15m ago',
    icon: Wallet,
  },
  {
    id: 'n3',
    category: 'Promotions',
    type: 'promo',
    title: 'Special Offer',
    message: 'Get 20% off all makeup products this week!',
    timeAgo: '1h ago',
    icon: Gift,
  },
  {
    id: 'n4',
    category: 'Updates',
    type: 'stylist',
    title: 'New Stylist',
    message: 'Zainab A. is now available for bookings.',
    timeAgo: '3h ago',
    icon: User,
  },
  {
    id: 'n5',
    category: 'Updates',
    type: 'order',
    title: 'Order Update',
    message: 'Your order #SC1234 has been shipped.',
    timeAgo: '5h ago',
    icon: Package,
  },
];

export const Notifications = () => {
  const navigate = useNavigate();
  const { isAuthenticated, showToast } = useAuth();

  const [activeTab, setActiveTab] = useState('All');
  const [notifications, setNotifications] = useState(DEFAULT_NOTIFICATIONS);

  const filterTabs = ['All', 'Bookings', 'Promotions', 'Updates'];

  useEffect(() => {
    if (isAuthenticated) {
      api.getNotifications()
        .then((data) => {
          if (Array.isArray(data?.notifications) && data.notifications.length > 0) {
            const mapped = data.notifications.map((n) => ({
              id: n._id,
              category: n.type === 'booking' ? 'Bookings' : n.type === 'promo' ? 'Promotions' : 'Updates',
              type: n.type,
              title: n.title || 'Notification',
              message: n.message || '',
              timeAgo: 'Recently',
              icon: n.type === 'booking' ? Calendar : n.type === 'order' ? Package : Sparkles,
            }));
            setNotifications([...mapped, ...DEFAULT_NOTIFICATIONS]);
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated]);

  const filteredNotifs = activeTab === 'All'
    ? notifications
    : notifications.filter((n) => n.category === activeTab);

  return (
    <PageContainer showBack={true}>
      <div style={{ maxWidth: '480px', margin: '0 auto', paddingBottom: '3rem' }}>
        
        {/* Screen 11: Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h1 style={{ fontFamily: 'Outfit', fontSize: '1.65rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
            Notifications
          </h1>

          <button
            onClick={() => {
              if (isAuthenticated) api.markAllNotificationsRead().catch(() => {});
              showToast('All notifications marked as read', 'success');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#f5b942',
              fontFamily: 'Outfit',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}
          >
            <CheckCheck size={14} /> Mark all
          </button>
        </div>

        {/* Filter Tabs matching Screen 11 */}
        <div
          style={{
            display: 'flex',
            gap: '0.45rem',
            overflowX: 'auto',
            paddingBottom: '0.2rem',
            marginBottom: '1.25rem',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {filterTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`category-chip ${activeTab === tab ? 'active' : ''}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Notifications Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filteredNotifs.map((n) => {
            const Icon = n.icon || Sparkles;
            return (
              <div
                key={n.id}
                style={{
                  background: '#151822',
                  borderRadius: '16px',
                  padding: '1rem',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.85rem',
                }}
              >
                {/* Icon Container with Gold Accent */}
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: 'rgba(245, 185, 66, 0.12)',
                    color: '#f5b942',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px',
                  }}
                >
                  <Icon size={18} />
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                    <h3 style={{ fontFamily: 'Outfit', fontSize: '0.92rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                      {n.title}
                    </h3>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                      {n.timeAgo}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0, lineHeight: 1.4 }}>
                    {n.message}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </PageContainer>
  );
};

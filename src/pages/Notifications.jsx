import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Wallet,
  Gift,
  User,
  Package,
  Sparkles,
  CheckCheck,
  Trash2,
  Bell,
  MessageSquare,
  ArrowRight,
} from 'lucide-react';
import { PageContainer } from '../components/common/PageContainer';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const formatTimeAgo = (dateInput) => {
  if (!dateInput) return 'Just now';
  const diffMs = Date.now() - new Date(dateInput).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateInput).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

export const Notifications = () => {
  const navigate = useNavigate();
  const { isAuthenticated, showToast, user } = useAuth();

  const [activeTab, setActiveTab] = useState('All');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const filterTabs = ['All', 'Bookings', 'Orders', 'Messages'];

  const fetchNotifs = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await api.getNotifications();
      if (Array.isArray(data?.notifications)) {
        setNotifications(data.notifications);
      } else {
        setNotifications([]);
      }
    } catch (err) {
      console.warn('Failed to load notifications:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, [isAuthenticated]);

  const handleMarkAllRead = async () => {
    if (!isAuthenticated) return;
    try {
      await api.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      showToast('All notifications marked as read', 'success');
    } catch (err) {
      showToast('Failed to mark all as read', 'error');
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      await api.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
      showToast('Notification removed', 'info');
    } catch (err) {}
  };

  const handleNotificationClick = async (n) => {
    if (!n.read) {
      try {
        await api.markNotificationRead(n._id);
        setNotifications(prev => prev.map(item => item._id === n._id ? { ...item, read: true } : item));
      } catch (e) {}
    }

    if (n.bookingId) {
      if (user?.role === 'staff' || user?.role === 'expert') {
        navigate('/expert-profile');
      } else if (user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/customer-dashboard');
      }
    } else if (n.orderId) {
      if (user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/customer-dashboard');
      }
    }
  };

  const filteredNotifs = useMemo(() => {
    if (activeTab === 'Bookings') return notifications.filter(n => n.type === 'booking');
    if (activeTab === 'Orders') return notifications.filter(n => n.type === 'order');
    if (activeTab === 'Messages') return notifications.filter(n => n.type === 'message');
    return notifications;
  }, [notifications, activeTab]);

  return (
    <PageContainer showBack={true}>
      <div style={{ maxWidth: '580px', margin: '0 auto', paddingBottom: '3.5rem' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h1 style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              color: 'var(--color-text-primary, #ffffff)',
              margin: '0 0 0.2rem',
              letterSpacing: '-0.02em'
            }}>
              Notifications
            </h1>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-secondary, #94a3b8)' }}>
              Stay updated with your latest bookings, atelier orders, and alerts
            </p>
          </div>

          {notifications.some(n => !n.read) && (
            <button
              onClick={handleMarkAllRead}
              style={{
                background: 'var(--color-accent-soft, rgba(212,175,55,0.12))',
                border: '1px solid var(--color-border-accent, rgba(212,175,55,0.3))',
                color: 'var(--color-accent, #d4af37)',
                fontWeight: 700,
                fontSize: '0.78rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '6px 12px',
                borderRadius: '999px',
                transition: 'all 0.18s ease'
              }}
            >
              <CheckCheck size={14} /> Mark all
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            overflowX: 'auto',
            paddingBottom: '0.35rem',
            marginBottom: '1.4rem',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {filterTabs.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  background: isActive ? 'var(--color-accent, #d4af37)' : 'var(--color-surface, #151822)',
                  color: isActive ? '#0c0e14' : 'var(--color-text-secondary, #94a3b8)',
                  border: `1px solid ${isActive ? 'var(--color-accent, #d4af37)' : 'var(--color-border, rgba(255, 255, 255, 0.08))'}`,
                  borderRadius: '999px',
                  padding: '6px 16px',
                  fontSize: '0.78rem',
                  fontWeight: isActive ? 800 : 600,
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  whiteSpace: 'nowrap'
                }}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Notifications Feed */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--color-text-secondary, #94a3b8)' }}>
            <Sparkles size={28} className="animate-spin" style={{ color: 'var(--color-accent, #d4af37)', margin: '0 auto 0.75rem' }} />
            <p style={{ fontSize: '0.85rem' }}>Loading messages...</p>
          </div>
        ) : filteredNotifs.length === 0 ? (
          <div style={{
            background: 'var(--color-surface, #151822)',
            borderRadius: '20px',
            border: '1px solid var(--color-border, rgba(255,255,255,0.08))',
            padding: '3rem 1.5rem',
            textAlign: 'center'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-accent-soft, rgba(212,175,55,0.12))',
              color: 'var(--color-accent, #d4af37)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              border: '1px solid var(--color-border-accent, rgba(212,175,55,0.25))'
            }}>
              <Bell size={24} />
            </div>
            <h3 style={{
              fontSize: '1.05rem',
              fontWeight: 800,
              color: 'var(--color-text-primary, #ffffff)',
              margin: '0 0 0.35rem'
            }}>
              No Notifications Found
            </h3>
            <p style={{
              fontSize: '0.82rem',
              color: 'var(--color-text-secondary, #94a3b8)',
              margin: 0,
              maxWidth: '320px',
              marginInline: 'auto',
              lineHeight: 1.45
            }}>
              {activeTab === 'All'
                ? "You're all caught up! New appointment updates and order dispatches will appear here."
                : `No notifications currently match the "${activeTab}" filter.`}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filteredNotifs.map((n) => {
              const isBooking = n.type === 'booking';
              const isOrder = n.type === 'order';
              const isMessage = n.type === 'message';

              const Icon = isOrder ? Package : isMessage ? MessageSquare : isBooking ? Calendar : Sparkles;
              const accentColor = isMessage ? '#3b82f6' : isBooking ? '#10b981' : 'var(--color-accent, #d4af37)';
              const badgeBg = isMessage ? 'rgba(59,130,246,0.12)' : isBooking ? 'rgba(16,185,129,0.12)' : 'var(--color-accent-soft, rgba(212,175,55,0.12))';
              const categoryLabel = isOrder ? 'STORE' : isMessage ? 'CHAT' : isBooking ? 'APPOINTMENT' : 'ATELIER';

              return (
                <div
                  key={n._id}
                  onClick={() => handleNotificationClick(n)}
                  style={{
                    background: n.read
                      ? 'var(--color-surface, #151822)'
                      : 'var(--color-surface-hover, #1c202d)',
                    borderRadius: '18px',
                    padding: '1rem 1.15rem',
                    border: n.read
                      ? '1px solid var(--color-border, rgba(255, 255, 255, 0.08))'
                      : '1px solid var(--color-border-accent, rgba(212, 175, 55, 0.4))',
                    borderLeft: n.read
                      ? '1px solid var(--color-border, rgba(255, 255, 255, 0.08))'
                      : `4px solid var(--color-accent, #d4af37)`,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '1rem',
                    cursor: (n.bookingId || n.orderId) ? 'pointer' : 'default',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                    boxShadow: n.read ? 'none' : '0 6px 20px rgba(0,0,0,0.25)'
                  }}
                >
                  {/* Icon Container */}
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '12px',
                      background: badgeBg,
                      color: accentColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px',
                      border: `1px solid ${accentColor}22`
                    }}
                  >
                    <Icon size={20} />
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', minWidth: 0 }}>
                        <span style={{
                          fontSize: '0.62rem',
                          fontWeight: 800,
                          letterSpacing: '0.05em',
                          color: accentColor,
                          background: badgeBg,
                          padding: '1px 6px',
                          borderRadius: '4px',
                          textTransform: 'uppercase'
                        }}>
                          {categoryLabel}
                        </span>
                        {!n.read && (
                          <span style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--color-accent, #d4af37)',
                            boxShadow: '0 0 6px var(--color-accent, #d4af37)',
                            display: 'inline-block'
                          }} />
                        )}
                      </div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted, #64748b)', flexShrink: 0, fontWeight: 500 }}>
                        {formatTimeAgo(n.createdAt)}
                      </span>
                    </div>

                    <h3 style={{
                      fontSize: '0.94rem',
                      fontWeight: n.read ? 600 : 800,
                      color: 'var(--color-text-primary, #ffffff)',
                      margin: '0 0 0.3rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {n.title}
                    </h3>

                    <p style={{
                      fontSize: '0.8rem',
                      color: 'var(--color-text-secondary, #94a3b8)',
                      margin: 0,
                      lineHeight: 1.45
                    }}>
                      {n.message}
                    </p>

                    {(n.bookingId || n.orderId) && (
                      <div style={{
                        marginTop: '0.5rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: 'var(--color-accent, #d4af37)'
                      }}>
                        <span>View details</span>
                        <ArrowRight size={12} />
                      </div>
                    )}
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={(e) => handleDelete(e, n._id)}
                    title="Delete"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-text-muted, #64748b)',
                      cursor: 'pointer',
                      padding: '4px',
                      borderRadius: '6px',
                      transition: 'color 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-muted, #64748b)'}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </PageContainer>
  );
};


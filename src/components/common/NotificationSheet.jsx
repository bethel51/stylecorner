import React, { useState, useEffect, useMemo } from 'react';
import { Bell, CheckCheck, Trash2, Package, MessageSquare, Calendar, Sparkles, Clock, Check, ChevronRight } from 'lucide-react';
import { BottomSheet } from './BottomSheet';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

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

export const NotificationSheet = ({ isOpen, onClose, onSelectNotification }) => {
  const { isAuthenticated, showToast } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'booking', 'order', 'message'

  const fetchNotifs = async () => {
    if (!isAuthenticated) return;
    try {
      const data = await api.getNotifications();
      setNotifications(Array.isArray(data.notifications) ? data.notifications : []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.warn('Failed to fetch notifications:', err.message);
    }
  };

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      fetchNotifs();
    }
  }, [isOpen, isAuthenticated]);

  // Polling every 25 seconds when component mounted
  useEffect(() => {
    if (!isAuthenticated) return;
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 25000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      showToast('All notifications marked as read', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update notifications', 'error');
    }
  };

  const handleReadSingle = async (notif) => {
    if (!notif.read) {
      try {
        await api.markNotificationRead(notif._id);
        setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (err) {}
    }
    if (onSelectNotification) {
      onSelectNotification(notif);
    }
    onClose();
  };

  const handleDeleteSingle = async (e, id) => {
    e.stopPropagation();
    try {
      await api.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
      setUnreadCount(prev => {
        const item = notifications.find(n => n._id === id);
        return item && !item.read ? Math.max(0, prev - 1) : prev;
      });
    } catch (err) {}
  };

  const filteredNotifs = useMemo(() => {
    if (filter === 'unread') return notifications.filter(n => !n.read);
    if (filter === 'booking') return notifications.filter(n => n.type === 'booking');
    if (filter === 'order') return notifications.filter(n => n.type === 'order');
    if (filter === 'message') return notifications.filter(n => n.type === 'message');
    return notifications;
  }, [notifications, filter]);

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span>Notifications</span>
          {unreadCount > 0 && (
            <span style={{
              background: 'var(--color-accent, #d4af37)',
              color: '#0c0e14',
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: '999px',
              letterSpacing: '0.02em'
            }}>
              {unreadCount} new
            </span>
          )}
        </div>
      }
    >
      <div style={{ width: '100%', overflowX: 'hidden' }}>
        
        {/* Filter Pills & Mark All Action */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem',
          marginBottom: '0.85rem',
          flexWrap: 'wrap'
        }}>
          {/* Filter Chips */}
          <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto', paddingBottom: '2px' }}>
            {[
              { id: 'all', label: 'All' },
              { id: 'unread', label: `Unread ${unreadCount > 0 ? `(${unreadCount})` : ''}` },
              { id: 'booking', label: 'Bookings' },
              { id: 'order', label: 'Orders' },
              { id: 'message', label: 'Messages' }
            ].map(tab => {
              const isActive = filter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id)}
                  style={{
                    background: isActive ? 'var(--color-accent, #d4af37)' : 'var(--color-surface, #151822)',
                    color: isActive ? '#0c0e14' : 'var(--color-text-secondary, #94a3b8)',
                    border: `1px solid ${isActive ? 'var(--color-accent, #d4af37)' : 'var(--color-border, rgba(255,255,255,0.08))'}`,
                    padding: '4px 11px',
                    borderRadius: '999px',
                    fontSize: '0.72rem',
                    fontWeight: isActive ? 800 : 600,
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Mark All Read */}
          {notifications.length > 0 && (
            <button
              onClick={handleMarkAllRead}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-accent, #d4af37)',
                fontWeight: 700,
                fontSize: '0.75rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                padding: '4px 6px',
                borderRadius: '6px',
                transition: 'opacity 0.15s ease'
              }}
            >
              <CheckCheck size={14} /> Mark Read
            </button>
          )}
        </div>

        {/* Notifications List */}
        {filteredNotifs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-text-secondary, #94a3b8)' }}>
            <div style={{
              width: '58px',
              height: '58px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-accent-soft, rgba(212,175,55,0.1))',
              border: '1px solid var(--color-border-accent, rgba(212,175,55,0.25))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 0.85rem',
              color: 'var(--color-accent, #d4af37)'
            }}>
              <Bell size={24} />
            </div>
            <h4 style={{
              fontSize: '1rem',
              fontWeight: 800,
              color: 'var(--color-text-primary, #ffffff)',
              margin: '0 0 0.35rem'
            }}>
              {filter === 'unread' ? 'All caught up!' : 'No notifications'}
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary, #94a3b8)', margin: 0, maxWidth: '280px', marginInline: 'auto' }}>
              {filter === 'unread'
                ? 'You have reviewed all latest messages and updates.'
                : 'Appointments, order dispatches, and specialist messages will appear here.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1rem' }}>
            {filteredNotifs.map((n) => {
              const isBooking = n.type === 'booking';
              const isOrder = n.type === 'order';
              const isMessage = n.type === 'message';

              const IconComponent = isOrder ? Package : isMessage ? MessageSquare : isBooking ? Calendar : Sparkles;
              const accentColor = isMessage ? '#3b82f6' : isBooking ? '#10b981' : 'var(--color-accent, #d4af37)';
              const badgeBg = isMessage ? 'rgba(59,130,246,0.12)' : isBooking ? 'rgba(16,185,129,0.12)' : 'var(--color-accent-soft, rgba(212,175,55,0.12))';
              const categoryLabel = isOrder ? 'STORE' : isMessage ? 'CHAT' : isBooking ? 'APPOINTMENT' : 'ATELIER';

              return (
                <div
                  key={n._id}
                  onClick={() => handleReadSingle(n)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.85rem',
                    padding: '0.9rem',
                    borderRadius: '16px',
                    background: n.read
                      ? 'var(--color-surface, #151822)'
                      : 'var(--color-surface-hover, #1c202d)',
                    border: n.read
                      ? '1px solid var(--color-border, rgba(255, 255, 255, 0.08))'
                      : '1px solid var(--color-border-accent, rgba(212, 175, 55, 0.35))',
                    borderLeft: n.read
                      ? '1px solid var(--color-border, rgba(255, 255, 255, 0.08))'
                      : `4px solid var(--color-accent, #d4af37)`,
                    boxShadow: n.read ? 'none' : '0 4px 16px rgba(0, 0, 0, 0.2)',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                >
                  {/* Icon Badge */}
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    backgroundColor: badgeBg,
                    color: accentColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px',
                    border: `1px solid ${accentColor}22`
                  }}>
                    <IconComponent size={19} />
                  </div>

                  {/* Body Text */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.4rem', marginBottom: '0.2rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', minWidth: 0 }}>
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
                      <span style={{ fontSize: '0.68rem', color: 'var(--color-text-muted, #64748b)', flexShrink: 0, fontWeight: 500 }}>
                        {formatTimeAgo(n.createdAt)}
                      </span>
                    </div>

                    <h4 style={{
                      fontSize: '0.88rem',
                      fontWeight: n.read ? 600 : 800,
                      color: 'var(--color-text-primary, #ffffff)',
                      margin: '0 0 0.25rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {n.title}
                    </h4>

                    <p style={{
                      fontSize: '0.78rem',
                      color: 'var(--color-text-secondary, #94a3b8)',
                      margin: 0,
                      lineHeight: 1.4,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {n.message}
                    </p>
                  </div>

                  {/* Actions Column */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', alignSelf: 'stretch' }}>
                    <button
                      onClick={(e) => handleDeleteSingle(e, n._id)}
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
                      <Trash2 size={14} />
                    </button>
                    <ChevronRight size={14} style={{ color: 'var(--color-text-muted, #64748b)', opacity: 0.6 }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </BottomSheet>
  );
};


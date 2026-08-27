import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, Trash2, Package, MessageSquare, Calendar, Sparkles, X, Clock } from 'lucide-react';
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
  return `${days}d ago`;
};

export const NotificationSheet = ({ isOpen, onClose, onSelectNotification }) => {
  const { isAuthenticated, showToast } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

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
    } catch (err) {}
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={`Notifications ${unreadCount > 0 ? `(${unreadCount} new)` : ''}`}>
      <div style={{ width: '100%', overflowX: 'hidden' }}>
        
        {/* Top Actions Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
          <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600, fontFamily: 'Outfit' }}>
            {unreadCount > 0 ? `${unreadCount} unread message${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
          </span>
          {notifications.length > 0 && (
            <button
              onClick={handleMarkAllRead}
              style={{
                background: 'none',
                border: 'none',
                color: '#d4af37',
                fontWeight: 800,
                fontSize: '0.78rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontFamily: 'Outfit'
              }}
            >
              <CheckCheck size={14} /> Mark All Read
            </button>
          )}
        </div>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#94a3b8' }}>
            <div style={{
              width: '54px', height: '54px', borderRadius: '50%',
              backgroundColor: '#faf9f5', border: '1px dashed rgba(212,175,55,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 0.75rem', color: '#d4af37'
            }}>
              <Bell size={24} />
            </div>
            <h4 style={{ fontFamily: 'Outfit', fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem' }}>
              No Notifications
            </h4>
            <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>
              Order updates, specialist replies, and appointment alerts will appear here.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1rem' }}>
            {notifications.map((n) => {
              const IconComponent = n.type === 'order' ? Package : n.type === 'message' ? MessageSquare : n.type === 'booking' ? Calendar : Sparkles;
              const iconColor = n.type === 'message' ? '#3b82f6' : n.type === 'booking' ? '#10b981' : '#d4af37';
              const iconBg = n.type === 'message' ? 'rgba(59,130,246,0.12)' : n.type === 'booking' ? 'rgba(16,185,129,0.12)' : 'rgba(212,175,55,0.12)';

              return (
                <div
                  key={n._id}
                  onClick={() => handleReadSingle(n)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    padding: '0.85rem',
                    borderRadius: '14px',
                    background: n.read ? '#ffffff' : '#faf9f5',
                    border: n.read ? '1px solid rgba(0,0,0,0.06)' : '1.5px solid rgba(212,175,55,0.4)',
                    boxShadow: n.read ? 'none' : '0 4px 12px rgba(212,175,55,0.08)',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {/* Icon */}
                  <div style={{
                    width: '38px', height: '38px', borderRadius: '12px',
                    backgroundColor: iconBg, color: iconColor,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, marginTop: '2px'
                  }}>
                    <IconComponent size={18} />
                  </div>

                  {/* Body Text */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                      <h4 style={{
                        fontFamily: 'Outfit', fontSize: '0.85rem', fontWeight: n.read ? 700 : 900,
                        color: '#0f172a', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                      }}>
                        {n.title}
                      </h4>
                      <span style={{ fontSize: '0.68rem', color: '#94a3b8', flexShrink: 0, fontWeight: 500 }}>
                        {formatTimeAgo(n.createdAt)}
                      </span>
                    </div>

                    <p style={{
                      fontSize: '0.78rem', color: '#475569', margin: '0.2rem 0 0',
                      lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                    }}>
                      {n.message}
                    </p>
                  </div>

                  {/* Unread dot & Delete */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.35rem' }}>
                    {!n.read && (
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#d4af37', boxShadow: '0 0 6px #d4af37' }} />
                    )}
                    <button
                      onClick={(e) => handleDeleteSingle(e, n._id)}
                      title="Delete"
                      style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', padding: '2px' }}
                    >
                      <Trash2 size={13} />
                    </button>
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

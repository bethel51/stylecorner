import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  Send,
  MessageSquare,
  Calendar,
  Clock,
  MapPin,
  Scissors,
  User,
  Phone,
  RefreshCw,
  CheckCircle,
  Hash,
  Sparkles,
  ChevronLeft,
  Check,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import { PageContainer } from '../components/common/PageContainer';
import { Avatar } from '../components/common/Avatar';
import { StatusBadge } from '../components/common/StatusBadge';

const formatTime = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit', hour12: true });
};

const formatDateLabel = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
};

const QUICK_REPLIES = [
  '👋 Hello! Looking forward to your session.',
  '📍 Please share your location or landmark.',
  '✅ Your booking is confirmed. See you soon!',
  '🔑 Please have your check-in pass code ready.',
  '⏳ Running about 5 minutes behind, on my way!',
];

export const ExpertChatPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, showToast } = useAuth();
  const { isDark } = useTheme();

  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Chat thread states
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [mobileView, setMobileView] = useState('list'); // 'list' | 'thread'

  const messagesEndRef = useRef(null);
  const pollingRef = useRef(null);
  const queryBookingId = searchParams.get('bookingId');

  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  }, []);

  // Fetch expert bookings
  useEffect(() => {
    setLoadingBookings(true);
    api.getBookings()
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setBookings(list);
        if (queryBookingId) {
          const match = list.find((b) => String(b._id) === String(queryBookingId));
          if (match) {
            setSelectedBooking(match);
            setMobileView('thread');
          }
        } else if (list.length > 0 && window.innerWidth >= 768) {
          setSelectedBooking(list[0]);
        }
      })
      .catch((err) => {
        showToast(err.message || 'Failed to load bookings', 'error');
      })
      .finally(() => setLoadingBookings(false));
  }, [queryBookingId, showToast]);

  // Fetch messages for selected booking
  const fetchMessages = useCallback(async (silent = false) => {
    if (!selectedBooking?._id) return;
    if (!silent) setLoadingMessages(true);
    try {
      const data = await api.getBookingMessages(selectedBooking._id);
      setMessages(data.messages || []);
    } catch (err) {
      if (!silent) showToast(err.message || 'Failed to fetch messages', 'error');
    } finally {
      if (!silent) setLoadingMessages(false);
    }
  }, [selectedBooking?._id, showToast]);

  // Poll for new messages every 4 seconds
  useEffect(() => {
    if (!selectedBooking?._id) return;
    setMessages([]);
    setInputText('');
    fetchMessages(false).then(() => {
      setTimeout(() => scrollToBottom(false), 80);
    });

    pollingRef.current = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
      fetchMessages(true);
    }, 4000);

    return () => clearInterval(pollingRef.current);
  }, [selectedBooking?._id, fetchMessages, scrollToBottom]);

  // Send message handler
  const handleSendMessage = async (textToSend) => {
    const text = (typeof textToSend === 'string' ? textToSend : inputText).trim();
    if (!text || sending || !selectedBooking?._id) return;

    setSending(true);
    setInputText('');

    const tempId = `temp-${Date.now()}`;
    const optimisticMsg = {
      _id: tempId,
      text,
      sender: user?.firstname ? `${user.firstname} ${user.lastname || ''}`.trim() : 'Expert',
      senderRole: 'specialist',
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);
    setTimeout(() => scrollToBottom(), 40);

    try {
      const data = await api.sendBookingMessage(selectedBooking._id, text);
      setMessages(data.messages || []);
      setTimeout(() => scrollToBottom(), 80);
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m._id !== tempId));
      setInputText(text);
      showToast('Failed to send message. Please retry.', 'error');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // WhatsApp quick helper
  const openClientWhatsApp = (phone, name = 'Client') => {
    const clean = (phone || '').replace(/[^0-9+]/g, '');
    if (!clean) {
      showToast('No phone number registered for WhatsApp', 'error');
      return;
    }
    const intl = clean.startsWith('+') ? clean.slice(1) : clean.startsWith('0') ? '234' + clean.slice(1) : clean;
    const msg = encodeURIComponent(`Hello ${name}, this is ${user?.firstname || 'your Stylist'} from Style Corner regarding your booking.`);
    window.open(`https://wa.me/${intl}?text=${msg}`, '_blank');
  };

  // Filter client list
  const filteredClients = useMemo(() => {
    return bookings.filter((b) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const name = (b.clientName || '').toLowerCase();
      const service = (b.service || '').toLowerCase();
      const code = (b.checkInCode || '').toLowerCase();
      return name.includes(q) || service.includes(q) || code.includes(q);
    });
  }, [bookings, searchQuery]);

  // Color tokens
  const cardBg = isDark ? '#151824' : '#ffffff';
  const cardBorder = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)';
  const textPrimary = isDark ? '#ffffff' : '#0f172a';
  const textSecondary = isDark ? '#94a3b8' : '#64748b';
  const leftPanelBg = isDark ? '#10121c' : '#f8fafc';
  const activeItemBg = isDark ? 'rgba(245, 185, 66, 0.12)' : '#fef3c7';

  return (
    <PageContainer>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0.75rem 0 2rem' }}>
        
        {/* Top Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={() => navigate('/expert-dashboard')}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                background: isDark ? '#151824' : '#f1f5f9',
                border: `1px solid ${cardBorder}`,
                color: textPrimary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              title="Back to Dashboard"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h1 style={{ fontFamily: 'Outfit', fontSize: '1.35rem', fontWeight: 900, color: textPrimary, margin: 0 }}>
                  Client Messages & Chat
                </h1>
                <span
                  style={{
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: '#10b981',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: '20px',
                    padding: '0.1rem 0.5rem',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    fontFamily: 'Outfit',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}
                >
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                  Live Chat Desk
                </span>
              </div>
              <p style={{ color: textSecondary, fontSize: '0.78rem', margin: '0.1rem 0 0' }}>
                Chat directly with your booked clients in real-time
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/expert/appointments')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: isDark ? '#151824' : '#f1f5f9',
              border: `1px solid ${cardBorder}`,
              color: textPrimary,
              borderRadius: '12px',
              padding: '0.5rem 0.85rem',
              fontSize: '0.78rem',
              fontWeight: 800,
              fontFamily: 'Outfit',
              cursor: 'pointer',
            }}
          >
            <Calendar size={14} />
            <span>My Appointments</span>
          </button>
        </div>

        {/* Chat Workspace (Two-Column Layout) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '340px 1fr',
            height: 'calc(100vh - 180px)',
            minHeight: '560px',
            background: cardBg,
            border: `1px solid ${cardBorder}`,
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: isDark ? '0 12px 32px -12px rgba(0, 0, 0, 0.6)' : '0 4px 24px -4px rgba(15, 23, 42, 0.08)',
          }}
        >
          {/* ── LEFT PANE: CLIENT BOOKINGS LIST ── */}
          <div
            style={{
              display: (mobileView === 'list' || window.innerWidth >= 768) ? 'flex' : 'none',
              flexDirection: 'column',
              background: leftPanelBg,
              borderRight: `1px solid ${cardBorder}`,
              height: '100%',
              minWidth: 0,
            }}
          >
            {/* Search Box */}
            <div style={{ padding: '0.85rem', borderBottom: `1px solid ${cardBorder}` }}>
              <div style={{ position: 'relative' }}>
                <Search
                  size={15}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: textSecondary,
                  }}
                />
                <input
                  type="text"
                  placeholder="Search client or pass code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '0.65rem 0.75rem 0.65rem 2.3rem',
                    borderRadius: '12px',
                    background: isDark ? '#151824' : '#ffffff',
                    border: `1px solid ${cardBorder}`,
                    color: textPrimary,
                    fontSize: '0.8rem',
                    fontFamily: 'Inter, sans-serif',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* Client Items Scroll Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
              {loadingBookings ? (
                <div style={{ padding: '2rem 1rem', textAlign: 'center', color: textSecondary }}>
                  <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 0.5rem', display: 'block' }} />
                  <span style={{ fontSize: '0.8rem' }}>Loading client conversations...</span>
                </div>
              ) : filteredClients.length === 0 ? (
                <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: textSecondary }}>
                  <MessageSquare size={28} style={{ opacity: 0.35, margin: '0 auto 0.5rem', display: 'block' }} />
                  <p style={{ fontSize: '0.82rem', margin: 0, fontWeight: 600 }}>No client chats found</p>
                </div>
              ) : (
                filteredClients.map((b) => {
                  const isSelected = selectedBooking?._id === b._id;
                  return (
                    <div
                      key={b._id}
                      onClick={() => {
                        setSelectedBooking(b);
                        setSearchParams({ bookingId: b._id });
                        setMobileView('thread');
                      }}
                      style={{
                        padding: '0.75rem 0.85rem',
                        borderRadius: '14px',
                        background: isSelected ? activeItemBg : 'transparent',
                        border: `1px solid ${isSelected ? (isDark ? 'rgba(245, 185, 66, 0.35)' : '#fde68a') : 'transparent'}`,
                        cursor: 'pointer',
                        marginBottom: '0.35rem',
                        transition: 'all 0.15s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.65rem',
                      }}
                    >
                      <Avatar
                        src={b.clientAvatar || ''}
                        name={b.clientName || 'Client'}
                        size={38}
                        borderRadius="50%"
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.15rem' }}>
                          <h4
                            style={{
                              fontFamily: 'Outfit',
                              fontSize: '0.88rem',
                              fontWeight: isSelected ? 800 : 700,
                              color: isSelected ? (isDark ? '#f5b942' : '#b45309') : textPrimary,
                              margin: 0,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {b.clientName || 'Client'}
                          </h4>
                          <span style={{ fontSize: '0.68rem', color: textSecondary, flexShrink: 0 }}>
                            {b.time || ''}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.4rem' }}>
                          <span
                            style={{
                              fontSize: '0.72rem',
                              color: textSecondary,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {b.service || 'Appointment'}
                          </span>
                          {b.checkInCode && (
                            <span
                              style={{
                                fontSize: '0.64rem',
                                color: isDark ? '#f5b942' : '#b45309',
                                background: isDark ? 'rgba(245,185,66,0.12)' : '#fef3c7',
                                borderRadius: '4px',
                                padding: '0.05rem 0.35rem',
                                fontFamily: 'monospace',
                                fontWeight: 800,
                                flexShrink: 0,
                              }}
                            >
                              {b.checkInCode}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ── RIGHT PANE: ACTIVE LIVE CHAT ── */}
          <div
            style={{
              display: (mobileView === 'thread' || window.innerWidth >= 768) ? 'flex' : 'none',
              flexDirection: 'column',
              background: cardBg,
              height: '100%',
              minWidth: 0,
            }}
          >
            {selectedBooking ? (
              <>
                {/* Thread Top Bar */}
                <div
                  style={{
                    padding: '0.85rem 1.15rem',
                    borderBottom: `1px solid ${cardBorder}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
                    {/* Mobile back button */}
                    <button
                      onClick={() => setMobileView('list')}
                      style={{
                        display: window.innerWidth < 768 ? 'flex' : 'none',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '32px',
                        height: '32px',
                        borderRadius: '10px',
                        background: isDark ? '#1e2230' : '#f1f5f9',
                        border: 'none',
                        color: textPrimary,
                        cursor: 'pointer',
                      }}
                    >
                      <ChevronLeft size={18} />
                    </button>

                    <Avatar
                      src={selectedBooking.clientAvatar || ''}
                      name={selectedBooking.clientName || 'Client'}
                      size={40}
                      borderRadius="50%"
                    />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <h3
                          style={{
                            fontFamily: 'Outfit',
                            fontSize: '0.98rem',
                            fontWeight: 800,
                            color: textPrimary,
                            margin: 0,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {selectedBooking.clientName || 'Client'}
                        </h3>
                        <StatusBadge status={selectedBooking.status} />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.72rem', color: textSecondary }}>
                        <span>{selectedBooking.service || 'Service'}</span>
                        <span>•</span>
                        <span>{selectedBooking.date} {selectedBooking.time}</span>
                        {selectedBooking.checkInCode && (
                          <span
                            style={{
                              color: '#f5b942',
                              background: 'rgba(245, 185, 66, 0.1)',
                              border: '1px solid rgba(245, 185, 66, 0.25)',
                              borderRadius: '4px',
                              padding: '0.05rem 0.35rem',
                              fontFamily: 'monospace',
                              fontWeight: 800,
                            }}
                          >
                            Pass: {selectedBooking.checkInCode}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions: WhatsApp / Call */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    {selectedBooking.clientPhone && (
                      <button
                        onClick={() => openClientWhatsApp(selectedBooking.clientPhone, selectedBooking.clientName)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          background: isDark ? 'rgba(16, 185, 129, 0.15)' : '#ecfdf5',
                          border: `1px solid ${isDark ? 'rgba(16, 185, 129, 0.35)' : 'rgba(16, 185, 129, 0.25)'}`,
                          color: '#10b981',
                          borderRadius: '10px',
                          padding: '0.38rem 0.75rem',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          fontFamily: 'Outfit',
                          cursor: 'pointer',
                        }}
                      >
                        <Phone size={12} /> WhatsApp
                      </button>
                    )}
                    {selectedBooking.clientPhone && (
                      <a
                        href={`tel:${selectedBooking.clientPhone}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          background: isDark ? 'rgba(59, 130, 246, 0.14)' : '#eff6ff',
                          border: `1px solid ${isDark ? 'rgba(59, 130, 246, 0.35)' : 'rgba(59, 130, 246, 0.25)'}`,
                          color: isDark ? '#60a5fa' : '#2563eb',
                          borderRadius: '10px',
                          padding: '0.38rem 0.75rem',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          fontFamily: 'Outfit',
                          textDecoration: 'none',
                        }}
                      >
                        <Phone size={12} /> Call
                      </a>
                    )}
                  </div>
                </div>

                {/* Messages Scroll Thread */}
                <div
                  style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    background: isDark ? '#0d1017' : '#f8fafc',
                  }}
                >
                  {loadingMessages && (
                    <div style={{ textAlign: 'center', padding: '1rem', color: textSecondary }}>
                      <Loader2 size={20} className="animate-spin" style={{ margin: '0 auto 0.3rem', display: 'block' }} />
                      <span style={{ fontSize: '0.74rem' }}>Syncing chat thread...</span>
                    </div>
                  )}

                  {!loadingMessages && messages.length === 0 && (
                    <div style={{ textAlign: 'center', margin: 'auto 0', padding: '2rem 1rem' }}>
                      <div
                        style={{
                          width: '50px',
                          height: '50px',
                          borderRadius: '50%',
                          background: isDark ? 'rgba(245, 185, 66, 0.12)' : '#fef3c7',
                          color: '#f5b942',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: '0.75rem',
                        }}
                      >
                        <MessageSquare size={22} />
                      </div>
                      <h4 style={{ fontFamily: 'Outfit', fontSize: '0.96rem', fontWeight: 800, color: textPrimary, margin: '0 0 0.25rem' }}>
                        Start Chatting with {selectedBooking.clientName || 'Client'}
                      </h4>
                      <p style={{ color: textSecondary, fontSize: '0.78rem', margin: 0 }}>
                        Send quick updates, directions, or confirm appointment details below.
                      </p>
                    </div>
                  )}

                  {messages.map((msg, idx) => {
                    const isExpert = msg.senderRole === 'specialist';
                    return (
                      <div
                        key={msg._id || idx}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: isExpert ? 'flex-end' : 'flex-start',
                        }}
                      >
                        <div
                          style={{
                            maxWidth: '75%',
                            padding: '0.75rem 1rem',
                            borderRadius: isExpert ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                            background: isExpert
                              ? 'linear-gradient(135deg, #f5b942 0%, #e0a32d 100%)'
                              : isDark
                              ? '#1e2230'
                              : '#ffffff',
                            color: isExpert ? '#0c0e14' : textPrimary,
                            border: isExpert
                              ? 'none'
                              : `1px solid ${cardBorder}`,
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                            fontSize: '0.85rem',
                            lineHeight: 1.45,
                            wordBreak: 'break-word',
                          }}
                        >
                          <p style={{ margin: 0 }}>{msg.text}</p>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'flex-end',
                              gap: '0.25rem',
                              marginTop: '0.3rem',
                              fontSize: '0.65rem',
                              color: isExpert ? 'rgba(12, 14, 20, 0.7)' : textSecondary,
                            }}
                          >
                            <span>{formatTime(msg.createdAt)}</span>
                            {isExpert && <Check size={11} strokeWidth={3} />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Reply Chips */}
                <div
                  style={{
                    padding: '0.5rem 1rem',
                    borderTop: `1px solid ${cardBorder}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    overflowX: 'auto',
                    scrollbarWidth: 'none',
                    background: cardBg,
                  }}
                >
                  {QUICK_REPLIES.map((reply, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(reply)}
                      style={{
                        padding: '0.32rem 0.7rem',
                        borderRadius: '20px',
                        background: isDark ? '#151824' : '#f1f5f9',
                        border: `1px solid ${cardBorder}`,
                        color: textSecondary,
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        fontFamily: 'Inter, sans-serif',
                        whiteSpace: 'nowrap',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {reply}
                    </button>
                  ))}
                </div>

                {/* Input Footer */}
                <div
                  style={{
                    padding: '0.75rem 1rem',
                    borderTop: `1px solid ${cardBorder}`,
                    background: cardBg,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                  }}
                >
                  <input
                    type="text"
                    placeholder={`Message ${selectedBooking.clientName || 'client'}...`}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    style={{
                      flex: 1,
                      padding: '0.75rem 1rem',
                      borderRadius: '14px',
                      background: isDark ? '#0d1017' : '#f8fafc',
                      border: `1px solid ${cardBorder}`,
                      color: textPrimary,
                      fontSize: '0.86rem',
                      fontFamily: 'Inter, sans-serif',
                      outline: 'none',
                    }}
                  />
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={!inputText.trim() || sending}
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #f5b942 0%, #e0a32d 100%)',
                      border: 'none',
                      color: '#0c0e14',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: (!inputText.trim() || sending) ? 'not-allowed' : 'pointer',
                      opacity: (!inputText.trim() || sending) ? 0.5 : 1,
                      boxShadow: '0 4px 14px rgba(245, 185, 66, 0.35)',
                      flexShrink: 0,
                    }}
                  >
                    {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  </button>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '2rem', textAlign: 'center' }}>
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: isDark ? 'rgba(245, 185, 66, 0.12)' : '#fef3c7',
                    color: '#f5b942',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1rem',
                  }}
                >
                  <MessageSquare size={28} />
                </div>
                <h3 style={{ fontFamily: 'Outfit', fontSize: '1.15rem', fontWeight: 800, color: textPrimary, margin: '0 0 0.4rem' }}>
                  Select a Client Conversation
                </h3>
                <p style={{ color: textSecondary, fontSize: '0.82rem', margin: 0, maxWidth: '320px' }}>
                  Choose any client booking from the list on the left to start chatting in real-time.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </PageContainer>
  );
};

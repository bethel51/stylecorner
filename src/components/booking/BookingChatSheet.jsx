import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  Send,
  MessageSquare,
  Calendar,
  Clock,
  MapPin,
  Scissors,
  Loader2,
  User,
  ChevronDown,
} from 'lucide-react';
import { api } from '../../services/api';

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

const groupMessagesByDate = (messages) => {
  const groups = [];
  let lastDate = null;
  messages.forEach((msg) => {
    const label = formatDateLabel(msg.createdAt);
    if (label !== lastDate) {
      groups.push({ type: 'date-divider', label });
      lastDate = label;
    }
    groups.push({ type: 'message', ...msg });
  });
  return groups;
};

// ─── BookingChatSheet ─────────────────────────────────────────────────────────

/**
 * BookingChatSheet
 * @param {object}   booking          — booking object with _id, service, date, time, stylist, clientName, location, clientEmail
 * @param {string}   currentUserEmail — logged-in user email
 * @param {string}   viewerRole       — 'customer' | 'specialist'
 * @param {boolean}  isOpen           — visibility flag
 * @param {function} onClose          — close handler
 */
export const BookingChatSheet = ({ booking, currentUserEmail, viewerRole, isOpen, onClose }) => {
  const [messages, setMessages]   = useState([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending]     = useState(false);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const messagesEndRef       = useRef(null);
  const messagesContainerRef = useRef(null);
  const inputRef             = useRef(null);
  const pollingRef           = useRef(null);
  const prevMsgCount         = useRef(0);

  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  }, []);

  // ── Fetch ───────────────────────────────────────────────────────────────────
  const fetchMessages = useCallback(async (silent = false) => {
    if (!booking?._id) return;
    if (!silent) setLoading(true);
    try {
      const data = await api.getBookingMessages(booking._id);
      setMessages(data.messages || []);
      setError(null);
    } catch (err) {
      if (!silent) setError(err.message);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [booking?._id]);

  // ── Lifecycle ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen || !booking?._id) return;
    setMessages([]);
    setInputText('');
    setError(null);
    setLoading(true);
    prevMsgCount.current = 0;

    fetchMessages(false).then(() => {
      setTimeout(() => scrollToBottom(false), 120);
    });

    pollingRef.current = setInterval(() => fetchMessages(true), 5000);
    return () => clearInterval(pollingRef.current);
  }, [isOpen, booking?._id, fetchMessages, scrollToBottom]);

  // ── Auto-scroll on new messages ─────────────────────────────────────────────
  useEffect(() => {
    if (messages.length > prevMsgCount.current) {
      const container = messagesContainerRef.current;
      if (container) {
        const distFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
        if (distFromBottom < 140) scrollToBottom();
      }
    }
    prevMsgCount.current = messages.length;
  }, [messages, scrollToBottom]);

  // ── Scroll button visibility ────────────────────────────────────────────────
  const handleScroll = () => {
    const c = messagesContainerRef.current;
    if (!c) return;
    setShowScrollBtn(c.scrollHeight - c.scrollTop - c.clientHeight > 150);
  };

  // ── Send ────────────────────────────────────────────────────────────────────
  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || sending) return;
    setSending(true);
    setInputText('');
    try {
      const data = await api.sendBookingMessage(booking._id, text);
      setMessages(data.messages || []);
      setTimeout(() => scrollToBottom(), 80);
    } catch (err) {
      setInputText(text);
      setError('Failed to send message. Please try again.');
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen || !booking) return null;

  const userEmail  = (currentUserEmail || '').trim().toLowerCase();
  const clientEmail = (booking.clientEmail || '').trim().toLowerCase();
  const isCustomer  = viewerRole === 'customer' || userEmail === clientEmail;
  const otherParty  = isCustomer ? (booking.stylist || 'Your Specialist') : (booking.clientName || 'Client');

  const groupedItems = groupMessagesByDate(messages);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(5px)',
          zIndex: 9000,
          animation: 'bcsFadeIn 0.2s ease',
        }}
      />

      {/* Sheet */}
      <div
        style={{
          position: 'fixed',
          bottom: 0, left: 0, right: 0,
          height: '92vh',
          maxWidth: '680px',
          margin: '0 auto',
          background: 'var(--color-card, #0d0f18)',
          borderRadius: '24px 24px 0 0',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 9001,
          animation: 'bcsSlideUp 0.32s cubic-bezier(0.16,1,0.3,1)',
          boxShadow: '0 -8px 60px rgba(0,0,0,0.6), 0 -1px 0 rgba(255,255,255,0.06)',
          overflow: 'hidden',
        }}
      >
        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div style={{ padding: '0.9rem 1.1rem 0.7rem', borderBottom: '1px solid var(--color-border, rgba(255,255,255,0.07))', flexShrink: 0 }}>
          {/* Drag handle */}
          <div style={{ width: 40, height: 4, borderRadius: 9, background: 'rgba(255,255,255,0.12)', margin: '0 auto 0.85rem' }} />

          {/* Title + close */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.7rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                boxShadow: '0 4px 14px rgba(124,58,237,0.4)',
              }}>
                <MessageSquare size={17} color="#fff" />
              </div>
              <div>
                <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '0.98rem', color: 'var(--color-text-primary, #f1f5f9)', lineHeight: 1.15 }}>
                  Booking Chat
                </div>
                <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.72rem', color: 'var(--color-text-secondary, #94a3b8)' }}>
                  with {otherParty}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.09)',
                borderRadius: '50%',
                width: 36, height: 36,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'var(--color-text-secondary, #94a3b8)',
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Booking summary card */}
          <div style={{
            background: 'rgba(167,139,250,0.07)',
            border: '1px solid rgba(167,139,250,0.18)',
            borderRadius: '14px',
            padding: '0.6rem 0.9rem',
            display: 'flex', flexWrap: 'wrap', gap: '0.45rem 0.9rem', alignItems: 'center',
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.28rem', color: '#c4b5fd', fontSize: '0.75rem', fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>
              <Scissors size={12} /> {booking.service || 'Service'}
            </span>
            {booking.date && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.28rem', color: 'var(--color-text-secondary, #94a3b8)', fontSize: '0.73rem', fontFamily: 'Outfit, sans-serif' }}>
                <Calendar size={12} color="#a78bfa" /> {booking.date}
              </span>
            )}
            {booking.time && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.28rem', color: 'var(--color-text-secondary, #94a3b8)', fontSize: '0.73rem', fontFamily: 'Outfit, sans-serif' }}>
                <Clock size={12} color="#a78bfa" /> {booking.time}
              </span>
            )}
            {booking.location && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.28rem', color: 'var(--color-text-secondary, #94a3b8)', fontSize: '0.73rem', fontFamily: 'Outfit, sans-serif' }}>
                <MapPin size={12} color="#a78bfa" /> {booking.location}
              </span>
            )}
            <span style={{ marginLeft: 'auto', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.28)', borderRadius: 20, padding: '0.12rem 0.5rem', fontSize: '0.67rem', fontWeight: 800, color: '#34d399', fontFamily: 'Outfit, sans-serif' }}>
              ✓ PAID
            </span>
          </div>
        </div>

        {/* ── Messages ────────────────────────────────────────────────────────── */}
        <div
          ref={messagesContainerRef}
          onScroll={handleScroll}
          style={{ flex: 1, overflowY: 'auto', padding: '0.9rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}
        >
          {loading ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.7rem', color: 'var(--color-text-secondary, #64748b)' }}>
              <Loader2 size={28} color="#a78bfa" style={{ animation: 'bcsSpin 1s linear infinite' }} />
              <span style={{ fontSize: '0.82rem', fontFamily: 'Outfit, sans-serif' }}>Loading conversation…</span>
            </div>
          ) : error ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.55rem', color: '#f87171', textAlign: 'center', padding: '2rem' }}>
              <span style={{ fontSize: '1.6rem' }}>⚠️</span>
              <span style={{ fontSize: '0.82rem', fontFamily: 'Outfit, sans-serif', maxWidth: 260, lineHeight: 1.5 }}>{error}</span>
            </div>
          ) : messages.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.8rem', textAlign: 'center', padding: '2.5rem 1.5rem' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(167,139,250,0.08)', border: '2px solid rgba(167,139,250,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MessageSquare size={28} color="#a78bfa" />
              </div>
              <div>
                <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '0.92rem', color: 'var(--color-text-primary, #f1f5f9)', marginBottom: '0.4rem' }}>
                  Start the conversation
                </div>
                <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.78rem', color: 'var(--color-text-secondary, #64748b)', lineHeight: 1.6, maxWidth: 260 }}>
                  Send a message to your {isCustomer ? 'specialist' : 'client'} about this {booking.service} appointment.
                </div>
              </div>
            </div>
          ) : (
            groupedItems.map((item, idx) => {
              if (item.type === 'date-divider') {
                return (
                  <div key={`div-${idx}`} style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', margin: '0.55rem 0' }}>
                    <div style={{ flex: 1, height: 1, background: 'var(--color-border, rgba(255,255,255,0.07))' }} />
                    <span style={{ fontSize: '0.67rem', fontWeight: 700, color: 'var(--color-text-secondary, #64748b)', fontFamily: 'Outfit, sans-serif', whiteSpace: 'nowrap', letterSpacing: '0.04em' }}>
                      {item.label}
                    </span>
                    <div style={{ flex: 1, height: 1, background: 'var(--color-border, rgba(255,255,255,0.07))' }} />
                  </div>
                );
              }

              const msg       = item;
              const isSystem  = msg.senderRole === 'system';
              const isSelf    = (isCustomer && msg.senderRole === 'customer') || (!isCustomer && msg.senderRole === 'specialist');

              if (isSystem) {
                return (
                  <div key={msg._id || idx} style={{ display: 'flex', justifyContent: 'center', margin: '0.35rem 0' }}>
                    <div style={{
                      background: 'rgba(167,139,250,0.07)', border: '1px solid rgba(167,139,250,0.15)',
                      borderRadius: 12, padding: '0.45rem 0.75rem', maxWidth: '88%',
                      fontSize: '0.72rem', color: '#c4b5fd', fontFamily: 'Outfit, sans-serif',
                      textAlign: 'center', lineHeight: 1.55,
                    }}>
                      {msg.text}
                    </div>
                  </div>
                );
              }

              return (
                <div key={msg._id || idx} style={{ display: 'flex', flexDirection: 'column', alignItems: isSelf ? 'flex-end' : 'flex-start', marginBottom: '0.12rem' }}>
                  {!isSelf && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.28rem', marginBottom: '0.18rem', marginLeft: '0.15rem' }}>
                      <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(167,139,250,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <User size={10} color="#a78bfa" />
                      </div>
                      <span style={{ fontSize: '0.67rem', fontWeight: 700, color: 'var(--color-text-secondary, #64748b)', fontFamily: 'Outfit, sans-serif' }}>
                        {msg.sender}
                      </span>
                    </div>
                  )}
                  <div style={{
                    maxWidth: '78%',
                    padding: '0.6rem 0.9rem',
                    borderRadius: isSelf ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    background: isSelf
                      ? 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)'
                      : 'var(--color-surface, rgba(255,255,255,0.06))',
                    border: isSelf ? 'none' : '1px solid var(--color-border, rgba(255,255,255,0.08))',
                    color: isSelf ? '#fff' : 'var(--color-text-primary, #f1f5f9)',
                    fontSize: '0.86rem',
                    fontFamily: 'Inter, Outfit, sans-serif',
                    lineHeight: 1.55,
                    wordBreak: 'break-word',
                    boxShadow: isSelf ? '0 4px 14px rgba(109,40,217,0.3)' : 'none',
                  }}>
                    {msg.text}
                  </div>
                  <div style={{ fontSize: '0.63rem', color: 'var(--color-text-secondary, #475569)', fontFamily: 'Outfit, sans-serif', marginTop: '0.18rem', [isSelf ? 'marginRight' : 'marginLeft']: '0.18rem' }}>
                    {formatTime(msg.createdAt)}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* ── Scroll-to-bottom FAB ─────────────────────────────────────────────── */}
        {showScrollBtn && (
          <button
            onClick={() => scrollToBottom()}
            style={{
              position: 'absolute', bottom: 80, right: 16,
              width: 36, height: 36, borderRadius: '50%',
              background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
              border: 'none', color: '#fff', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(109,40,217,0.45)',
              animation: 'bcsFadeIn 0.2s ease',
            }}
          >
            <ChevronDown size={18} />
          </button>
        )}

        {/* ── Input bar ───────────────────────────────────────────────────────── */}
        <div style={{
          padding: '0.7rem 1rem',
          borderTop: '1px solid var(--color-border, rgba(255,255,255,0.07))',
          background: 'var(--color-card, #0d0f18)',
          flexShrink: 0,
          paddingBottom: 'max(0.7rem, env(safe-area-inset-bottom))',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.55rem' }}>
            <textarea
              ref={inputRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${otherParty}…`}
              rows={1}
              disabled={sending || loading}
              style={{
                flex: 1,
                background: 'var(--color-surface, rgba(255,255,255,0.05))',
                border: '1.5px solid var(--color-border, rgba(255,255,255,0.09))',
                borderRadius: '16px',
                padding: '0.65rem 1rem',
                color: 'var(--color-text-primary, #f1f5f9)',
                fontSize: '0.87rem',
                fontFamily: 'Inter, Outfit, sans-serif',
                outline: 'none',
                resize: 'none',
                maxHeight: '100px',
                overflowY: 'auto',
                lineHeight: 1.5,
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => { e.target.style.borderColor = 'rgba(167,139,250,0.55)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--color-border, rgba(255,255,255,0.09))'; }}
            />
            <button
              onClick={handleSend}
              disabled={!inputText.trim() || sending || loading}
              style={{
                width: 44, height: 44, borderRadius: '50%',
                background: inputText.trim() && !sending
                  ? 'linear-gradient(135deg, #7c3aed, #6d28d9)'
                  : 'rgba(255,255,255,0.05)',
                border: 'none',
                color: inputText.trim() && !sending ? '#fff' : 'var(--color-text-secondary, #475569)',
                cursor: inputText.trim() && !sending ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                transition: 'background 0.2s, box-shadow 0.2s, transform 0.12s',
                boxShadow: inputText.trim() && !sending ? '0 4px 14px rgba(109,40,217,0.4)' : 'none',
              }}
              onMouseDown={(e) => { if (inputText.trim()) e.currentTarget.style.transform = 'scale(0.88)'; }}
              onMouseUp={(e) => { e.currentTarget.style.transform = ''; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = ''; }}
            >
              {sending
                ? <Loader2 size={18} style={{ animation: 'bcsSpin 1s linear infinite' }} />
                : <Send size={18} />
              }
            </button>
          </div>
          <div style={{ textAlign: 'center', fontSize: '0.62rem', color: 'var(--color-text-secondary, #475569)', marginTop: '0.35rem', fontFamily: 'Outfit, sans-serif' }}>
            Enter to send · Shift+Enter for new line
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bcsSlideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes bcsFadeIn  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes bcsSpin    { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
};

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Scissors,
  Sparkles,
  User,
  CheckCircle2,
  Star,
  ShieldCheck,
  ChevronRight,
  ArrowLeft,
  MapPin,
  Search,
  Filter,
  RefreshCw,
  X,
  Download,
  MessageSquare,
  QrCode,
  AlertCircle,
  Check,
  CalendarDays,
  Ban,
  Printer,
  ChevronDown,
  ArrowUpRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import { PageContainer } from '../components/common/PageContainer';
import { StatusBadge } from '../components/common/StatusBadge';
import { SkeletonList } from '../components/common/SkeletonLoader';
import { PopupModal } from '../components/common/PopupModal';
import { AppointmentPassModal } from '../components/booking/AppointmentPassModal';
import { BookingChatSheet } from '../components/booking/BookingChatSheet';
import { downloadBookingHistoryCSV, printBookingHistoryReport } from '../utils/bookingHistoryExport';
import { getGoogleCalendarUrl, downloadIcsFile } from '../utils/calendar';

export const MyBookings = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, showToast } = useAuth();
  const { isDark } = useTheme();

  const isStaff = user?.role === 'staff' || user?.role === 'expert';

  // Navigation tab from URL query or default to 'upcoming'
  const initialTab = searchParams.get('tab') || 'upcoming';
  const [activeTab, setActiveTab] = useState(initialTab); // 'upcoming' | 'history' | 'cancelled' | 'all'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' | 'oldest'

  // Data state
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modals & Sheets
  const [passBooking, setPassBooking] = useState(null);
  const [chatBooking, setChatBooking] = useState(null);
  const [reviewBooking, setReviewBooking] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Cancellation modal
  const [cancelModalBooking, setCancelModalBooking] = useState(null);
  const [cancelReason, setCancelReason] = useState('Schedule conflict');
  const [cancelling, setCancelling] = useState(false);

  // Sync tab with URL
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const fetchBookings = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await api.getBookings();
      if (Array.isArray(data)) {
        setBookings(data);
      } else {
        setBookings([]);
      }
    } catch (err) {
      console.warn('Error fetching bookings:', err);
      showToast('Could not refresh bookings. Showing latest cached sessions.', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Handle direct tab=orders navigation by smoothly redirecting to Order Tracking
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'orders') {
      api.getOrders().then((ordersList) => {
        const valid = Array.isArray(ordersList) ? ordersList : ordersList?.orders || [];
        if (valid.length > 0) {
          const targetId = valid[0]._id || valid[0].id;
          navigate(`/order-tracking/${targetId}`, { replace: true });
        } else {
          showToast('No active orders found. Visit our Atelier Store.', 'info');
          navigate('/store', { replace: true });
        }
      }).catch(() => {
        navigate('/store', { replace: true });
      });
    }
  }, [searchParams, navigate, showToast]);

  // Status classifier helper
  const isUpcoming = (status) => {
    const s = (status || 'pending').toLowerCase();
    return s === 'pending' || s === 'accepted' || s === 'confirmed' || s === 'in_progress';
  };

  const isPast = (status) => {
    const s = (status || '').toLowerCase();
    return s === 'completed';
  };

  const isCancelled = (status) => {
    const s = (status || '').toLowerCase();
    return s === 'cancelled' || s === 'rejected';
  };

  // Metrics counts
  const counts = useMemo(() => {
    const upcoming = bookings.filter((b) => isUpcoming(b.status)).length;
    const completed = bookings.filter((b) => isPast(b.status)).length;
    const cancelled = bookings.filter((b) => isCancelled(b.status)).length;
    const totalSpent = bookings
      .filter((b) => isPast(b.status) || String(b.paymentStatus || '').startsWith('paid'))
      .reduce((sum, b) => sum + (Number(b.price) || 0), 0);
    return { upcoming, completed, cancelled, total: bookings.length, totalSpent };
  }, [bookings]);

  // Filtered & Sorted Bookings
  const filteredBookings = useMemo(() => {
    let list = [...bookings];

    // Filter by Tab
    if (activeTab === 'upcoming') {
      list = list.filter((b) => isUpcoming(b.status));
    } else if (activeTab === 'history') {
      list = list.filter((b) => isPast(b.status));
    } else if (activeTab === 'cancelled') {
      list = list.filter((b) => isCancelled(b.status));
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((b) => {
        const service = (b.service || '').toLowerCase();
        const stylist = (b.stylist || '').toLowerCase();
        const client = (b.clientName || '').toLowerCase();
        const loc = (b.location || '').toLowerCase();
        const pass = (b.checkInCode || '').toLowerCase();
        const date = (b.date || '').toLowerCase();
        return (
          service.includes(q) ||
          stylist.includes(q) ||
          client.includes(q) ||
          loc.includes(q) ||
          pass.includes(q) ||
          date.includes(q)
        );
      });
    }

    // Filter by Category
    if (selectedCategory !== 'all') {
      list = list.filter((b) => {
        const s = (b.service || '').toLowerCase();
        if (selectedCategory === 'barber') return s.includes('barber') || s.includes('groom');
        if (selectedCategory === 'hair') return s.includes('braid') || s.includes('hair') || s.includes('twist');
        if (selectedCategory === 'nails') return s.includes('nail') || s.includes('manicure') || s.includes('pedicure');
        if (selectedCategory === 'lashes') return s.includes('lash') || s.includes('eye');
        if (selectedCategory === 'spa') return s.includes('spa') || s.includes('facial') || s.includes('massage');
        return true;
      });
    }

    // Sort order
    list.sort((a, b) => {
      const dateA = new Date(a.date || a.createdAt || 0).getTime();
      const dateB = new Date(b.date || b.createdAt || 0).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return list;
  }, [bookings, activeTab, searchQuery, selectedCategory, sortOrder]);

  // Export handlers
  const handleExportCSV = () => {
    if (filteredBookings.length === 0) {
      showToast('No booking sessions to export in this filter.', 'error');
      return;
    }
    const filename = `StyleCorner_Bookings_${user?.firstname || 'Member'}_${activeTab}.csv`;
    const ok = downloadBookingHistoryCSV(filteredBookings, filename);
    if (ok) showToast('Booking statement exported to CSV successfully!', 'success');
  };

  const handlePrintStatement = () => {
    if (filteredBookings.length === 0) {
      showToast('No booking sessions to print.', 'error');
      return;
    }
    printBookingHistoryReport(
      filteredBookings,
      `${user?.firstname || 'Member'}'s Atelier Appointment Statement`
    );
  };

  // Review submission
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewBooking) return;
    setSubmittingReview(true);
    try {
      await api.postReview({
        bookingId: reviewBooking._id,
        stylistName: reviewBooking.stylist,
        serviceName: reviewBooking.service,
        rating: reviewRating,
        comment: reviewComment.trim(),
      });
      showToast(`Thank you! Your ${reviewRating}★ review for ${reviewBooking.stylist} is live. ✨`, 'success');
      setReviewBooking(null);
      setReviewComment('');
    } catch (err) {
      showToast(err.message || 'Failed to submit review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Cancellation handler
  const handleConfirmCancel = async () => {
    if (!cancelModalBooking) return;
    setCancelling(true);
    try {
      await api.updateBookingStatus(cancelModalBooking._id, {
        status: 'cancelled',
        cancellationReason: cancelReason,
      });

      setBookings((prev) =>
        prev.map((b) => (b._id === cancelModalBooking._id ? { ...b, status: 'cancelled' } : b))
      );

      showToast('Appointment cancelled successfully.', 'success');
      setCancelModalBooking(null);
    } catch (err) {
      showToast(err.message || 'Could not cancel booking.', 'error');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <PageContainer showBack={true} backTo="/profile">
      <div
        style={{
          maxWidth: '780px',
          width: '100%',
          margin: '0 auto',
          boxSizing: 'border-box',
          paddingBottom: 'calc(var(--bottom-nav-height, 70px) + env(safe-area-inset-bottom, 24px) + 3.5rem)',
        }}
      >
        
        {/* Top Header & Breadcrumb */}
        <div style={{ marginBottom: '1.25rem', width: '100%', boxSizing: 'border-box' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.65rem',
              marginBottom: '0.4rem',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0, flex: '1 1 220px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: 'rgba(245, 185, 66, 0.12)',
                  color: '#f5b942',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(245, 185, 66, 0.25)',
                  flexShrink: 0,
                }}
              >
                <Calendar size={20} />
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <h1
                  style={{
                    fontFamily: 'Outfit',
                    fontSize: 'clamp(1.2rem, 4.4vw, 1.45rem)',
                    fontWeight: 900,
                    color: 'var(--color-text-primary, #ffffff)',
                    margin: 0,
                    letterSpacing: '-0.02em',
                    lineHeight: 1.25,
                    wordBreak: 'break-word',
                  }}
                >
                  {isStaff ? 'Client Appointments & History' : 'My Bookings & History'}
                </h1>
                <p
                  style={{
                    fontSize: 'clamp(0.74rem, 2.3vw, 0.8rem)',
                    color: 'var(--color-text-secondary, #94a3b8)',
                    margin: '0.15rem 0 0',
                    lineHeight: 1.35,
                  }}
                >
                  {isStaff
                    ? 'Track scheduled client appointments, passes & past styling sessions'
                    : 'Manage active appointments, digital passes & service history'}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexShrink: 0 }}>
              <button
                onClick={() => fetchBookings(true)}
                disabled={refreshing}
                title="Refresh sessions"
                style={{
                  background: 'var(--color-surface, #151822)',
                  border: '1px solid var(--color-border, rgba(255, 255, 255, 0.08))',
                  color: '#94a3b8',
                  borderRadius: '12px',
                  width: '38px',
                  height: '38px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  touchAction: 'manipulation',
                }}
              >
                <RefreshCw size={16} className={refreshing ? 'spin-animation' : ''} />
              </button>

              {!isStaff && (
                <button
                  onClick={() => navigate('/booking')}
                  className="app-btn app-btn-accent"
                  style={{
                    borderRadius: '12px',
                    padding: '0.5rem 0.95rem',
                    fontSize: 'clamp(0.78rem, 2.4vw, 0.84rem)',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    minHeight: '38px',
                    touchAction: 'manipulation',
                  }}
                >
                  <Sparkles size={14} /> Book New
                </button>
              )}
            </div>
          </div>

          {isStaff && (
            <div
              style={{
                marginTop: '0.5rem',
                padding: '0.65rem 0.85rem',
                borderRadius: '12px',
                background: 'rgba(245, 185, 66, 0.08)',
                border: '1px solid rgba(245, 185, 66, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={16} color="#f5b942" />
                <span style={{ fontSize: '0.78rem', color: '#f5b942', fontWeight: 700 }}>
                  Specialist Access: Viewing your atelier bookings & client appointments.
                </span>
              </div>
              <button
                onClick={() => navigate('/expert-dashboard')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-text-primary, #ffffff)',
                  fontSize: '0.76rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.2rem',
                }}
              >
                Studio Dashboard <ArrowUpRight size={13} />
              </button>
            </div>
          )}
        </div>

        {/* Hero Quick Stat Metrics (Fluid 4-column grid with zero mobile clipping) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
            gap: '0.45rem',
            marginBottom: '1.15rem',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          <div
            onClick={() => handleTabChange('upcoming')}
            role="button"
            tabIndex={0}
            style={{
              background: activeTab === 'upcoming' ? 'rgba(16, 185, 129, 0.16)' : 'var(--color-surface, #151822)',
              border: activeTab === 'upcoming' ? '1.5px solid #10b981' : '1px solid var(--color-border, rgba(255, 255, 255, 0.06))',
              borderRadius: '14px',
              padding: 'clamp(0.6rem, 2vw, 0.75rem) 0.35rem',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              touchAction: 'manipulation',
              minWidth: 0,
            }}
          >
            <div style={{ fontFamily: 'Outfit', fontSize: 'clamp(1.15rem, 3.8vw, 1.35rem)', fontWeight: 900, color: '#10b981', lineHeight: 1 }}>
              {counts.upcoming}
            </div>
            <div style={{ fontSize: 'clamp(0.62rem, 1.9vw, 0.7rem)', fontWeight: 800, color: '#94a3b8', marginTop: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Upcoming
            </div>
          </div>

          <div
            onClick={() => handleTabChange('history')}
            role="button"
            tabIndex={0}
            style={{
              background: activeTab === 'history' ? 'rgba(245, 185, 66, 0.16)' : 'var(--color-surface, #151822)',
              border: activeTab === 'history' ? '1.5px solid #f5b942' : '1px solid var(--color-border, rgba(255, 255, 255, 0.06))',
              borderRadius: '14px',
              padding: 'clamp(0.6rem, 2vw, 0.75rem) 0.35rem',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              touchAction: 'manipulation',
              minWidth: 0,
            }}
          >
            <div style={{ fontFamily: 'Outfit', fontSize: 'clamp(1.15rem, 3.8vw, 1.35rem)', fontWeight: 900, color: '#f5b942', lineHeight: 1 }}>
              {counts.completed}
            </div>
            <div style={{ fontSize: 'clamp(0.62rem, 1.9vw, 0.7rem)', fontWeight: 800, color: '#94a3b8', marginTop: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Completed
            </div>
          </div>

          <div
            onClick={() => handleTabChange('cancelled')}
            role="button"
            tabIndex={0}
            style={{
              background: activeTab === 'cancelled' ? 'rgba(239, 68, 68, 0.16)' : 'var(--color-surface, #151822)',
              border: activeTab === 'cancelled' ? '1.5px solid #ef4444' : '1px solid var(--color-border, rgba(255, 255, 255, 0.06))',
              borderRadius: '14px',
              padding: 'clamp(0.6rem, 2vw, 0.75rem) 0.35rem',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              touchAction: 'manipulation',
              minWidth: 0,
            }}
          >
            <div style={{ fontFamily: 'Outfit', fontSize: 'clamp(1.15rem, 3.8vw, 1.35rem)', fontWeight: 900, color: '#ef4444', lineHeight: 1 }}>
              {counts.cancelled}
            </div>
            <div style={{ fontSize: 'clamp(0.62rem, 1.9vw, 0.7rem)', fontWeight: 800, color: '#94a3b8', marginTop: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Cancelled
            </div>
          </div>

          <div
            onClick={() => handleTabChange('all')}
            role="button"
            tabIndex={0}
            style={{
              background: activeTab === 'all' ? 'rgba(99, 102, 241, 0.18)' : 'var(--color-surface, #151822)',
              border: activeTab === 'all' ? '1.5px solid #6366f1' : '1px solid var(--color-border, rgba(255, 255, 255, 0.06))',
              borderRadius: '14px',
              padding: 'clamp(0.6rem, 2vw, 0.75rem) 0.35rem',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              touchAction: 'manipulation',
              minWidth: 0,
            }}
          >
            <div style={{ fontFamily: 'Outfit', fontSize: 'clamp(1.15rem, 3.8vw, 1.35rem)', fontWeight: 900, color: 'var(--color-text-primary, #ffffff)', lineHeight: 1 }}>
              {counts.total}
            </div>
            <div style={{ fontSize: 'clamp(0.62rem, 1.9vw, 0.7rem)', fontWeight: 800, color: '#94a3b8', marginTop: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              All Total
            </div>
          </div>
        </div>

        {/* Tab Selector & Statement Export Bar (Mobile Optimized: Full-width smooth scroll, no truncation) */}
        <div style={{ marginBottom: '1.15rem', width: '100%', boxSizing: 'border-box' }}>
          {/* Segmented Tab Pill Strip */}
          <div
            style={{
              display: 'flex',
              overflowX: 'auto',
              WebkitOverflowScrolling: 'touch',
              background: 'var(--color-surface, #151822)',
              borderRadius: '16px',
              padding: '0.3rem',
              border: '1px solid var(--color-border, rgba(255, 255, 255, 0.08))',
              gap: '0.35rem',
              width: '100%',
              boxSizing: 'border-box',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              marginBottom: '0.65rem',
            }}
          >
            {[
              { id: 'upcoming', label: 'Upcoming', count: counts.upcoming },
              { id: 'history', label: 'Past History', count: counts.completed },
              { id: 'cancelled', label: 'Cancelled', count: counts.cancelled },
              { id: 'all', label: 'All Sessions', count: counts.total },
            ].map((t) => {
              const active = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => handleTabChange(t.id)}
                  style={{
                    flex: '0 0 auto',
                    minHeight: '38px',
                    borderRadius: '11px',
                    border: 'none',
                    background: active ? '#f5b942' : 'transparent',
                    color: active ? '#0c0e14' : '#94a3b8',
                    fontFamily: 'Outfit',
                    fontSize: '0.82rem',
                    fontWeight: active ? 800 : 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    transition: 'all 0.15s ease',
                    whiteSpace: 'nowrap',
                    padding: '0 0.85rem',
                    touchAction: 'manipulation',
                  }}
                >
                  <span>{t.label}</span>
                  <span
                    style={{
                      background: active ? '#0c0e14' : 'rgba(255, 255, 255, 0.08)',
                      color: active ? '#f5b942' : '#ffffff',
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      padding: '0.1rem 0.45rem',
                      borderRadius: '999px',
                    }}
                  >
                    {t.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Statement Export Toolbar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.5rem',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700 }}>
              Showing {filteredBookings.length} {filteredBookings.length === 1 ? 'session' : 'sessions'}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <button
                onClick={handleExportCSV}
                title="Download CSV Statement"
                style={{
                  background: 'var(--color-surface, #151822)',
                  border: '1px solid var(--color-border, rgba(255, 255, 255, 0.08))',
                  borderRadius: '10px',
                  padding: '0.45rem 0.75rem',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  color: '#94a3b8',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  cursor: 'pointer',
                  minHeight: '34px',
                  touchAction: 'manipulation',
                }}
              >
                <Download size={13} color="#f5b942" /> CSV
              </button>
              <button
                onClick={handlePrintStatement}
                title="Print Booking Report"
                style={{
                  background: 'var(--color-surface, #151822)',
                  border: '1px solid var(--color-border, rgba(255, 255, 255, 0.08))',
                  borderRadius: '10px',
                  padding: '0.45rem 0.75rem',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  color: '#94a3b8',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  cursor: 'pointer',
                  minHeight: '34px',
                  touchAction: 'manipulation',
                }}
              >
                <Printer size={13} color="#f5b942" /> Print
              </button>
            </div>
          </div>
        </div>

        {/* Search & Category Filter Controls */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.65rem',
            marginBottom: '1.25rem',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          {/* Search Input (Responsive placeholder, 16px to prevent iOS auto-zoom) */}
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              boxSizing: 'border-box',
            }}
          >
            <Search
              size={16}
              color="#94a3b8"
              style={{ position: 'absolute', left: '0.9rem', pointerEvents: 'none' }}
            />
            <input
              type="text"
              placeholder={isStaff ? 'Search client, service, code...' : 'Search specialist, service, code...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--color-surface, #151822)',
                border: '1px solid var(--color-border, rgba(255, 255, 255, 0.08))',
                borderRadius: '14px',
                padding: '0.7rem 2.2rem 0.7rem 2.4rem',
                fontSize: '16px', // 16px prevents iOS Safari auto-zoom
                color: 'var(--color-text-primary, #ffffff)',
                outline: 'none',
                fontFamily: 'Outfit',
                boxSizing: 'border-box',
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '0.2rem',
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Category Chips & Sort dropdown (Smooth horizontal touch scroll) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.5rem',
              width: '100%',
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                display: 'flex',
                gap: '0.4rem',
                flexWrap: 'nowrap',
                overflowX: 'auto',
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                paddingBottom: '0.2rem',
                minWidth: 0,
                flex: 1,
              }}
            >
              {[
                { id: 'all', label: 'All Services' },
                { id: 'barber', label: 'Barber Grooming' },
                { id: 'hair', label: 'Braids & Hair' },
                { id: 'nails', label: 'Nails' },
                { id: 'lashes', label: 'Lashes' },
                { id: 'spa', label: 'Spa' },
              ].map((c) => {
                const isSelected = selectedCategory === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(c.id)}
                    style={{
                      borderRadius: '999px',
                      padding: '0.35rem 0.75rem',
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      border: isSelected ? '1px solid #f5b942' : '1px solid rgba(255, 255, 255, 0.08)',
                      background: isSelected ? 'rgba(245, 185, 66, 0.15)' : 'var(--color-surface, #151822)',
                      color: isSelected ? '#f5b942' : '#94a3b8',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>

            <div style={{ flexShrink: 0 }}>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                style={{
                  background: 'var(--color-surface, #151822)',
                  border: '1px solid var(--color-border, rgba(255, 255, 255, 0.08))',
                  color: '#94a3b8',
                  borderRadius: '10px',
                  padding: '0.35rem 0.6rem',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  outline: 'none',
                  cursor: 'pointer',
                  fontFamily: 'Outfit',
                }}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <SkeletonList count={4} />
        ) : filteredBookings.length === 0 ? (
          /* Empty State */
          <div
            style={{
              background: 'var(--color-surface, #151822)',
              borderRadius: '20px',
              border: '1px solid var(--color-border, rgba(255, 255, 255, 0.06))',
              padding: '3rem 1.5rem',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.85rem',
              marginTop: '0.5rem',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(245, 185, 66, 0.1)',
                color: '#f5b942',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(245, 185, 66, 0.25)',
              }}
            >
              <CalendarDays size={32} />
            </div>

            <h3
              style={{
                fontFamily: 'Outfit',
                fontSize: '1.2rem',
                fontWeight: 800,
                color: 'var(--color-text-primary, #ffffff)',
                margin: 0,
              }}
            >
              {searchQuery || selectedCategory !== 'all'
                ? 'No matching appointments found'
                : activeTab === 'upcoming'
                ? 'No upcoming appointments scheduled'
                : activeTab === 'history'
                ? 'No completed appointments yet'
                : activeTab === 'cancelled'
                ? 'No cancelled appointments'
                : 'No appointments in your records'}
            </h3>

            <p
              style={{
                fontSize: '0.84rem',
                color: 'var(--color-text-secondary, #94a3b8)',
                maxWidth: '380px',
                lineHeight: 1.5,
                margin: 0,
              }}
            >
              {searchQuery || selectedCategory !== 'all'
                ? 'Try clearing your search query or selecting a different service category to view your appointments.'
                : isStaff
                ? 'When clients book appointments with you, they will appear here in your live schedule.'
                : 'Experience personalized master grooming, bespoke braiding, and lash aesthetics at our luxury atelier.'}
            </p>

            <div style={{ display: 'flex', gap: '0.65rem', marginTop: '0.5rem' }}>
              {searchQuery || selectedCategory !== 'all' ? (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  className="app-btn app-btn-outline"
                  style={{ borderRadius: '12px', fontSize: '0.82rem' }}
                >
                  Clear Filters
                </button>
              ) : !isStaff ? (
                <button
                  onClick={() => navigate('/booking')}
                  className="app-btn app-btn-accent"
                  style={{ borderRadius: '14px', padding: '0.6rem 1.4rem', fontSize: '0.88rem', fontWeight: 800 }}
                >
                  <Sparkles size={16} /> Book Atelier Service
                </button>
              ) : null}
            </div>
          </div>
        ) : (
          /* Booking Cards Grid / List */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {filteredBookings.map((b) => {
              const passCode = b.checkInCode || `SC-${String(b._id || '7890').slice(-4).toUpperCase()}`;
              const isCheckedIn = b.checkInStatus === 'checked_in' || !!b.checkedInAt;
              const statusNormalized = (b.status || 'pending').toLowerCase();
              const canCancel = isUpcoming(b.status);
              const canReview = isPast(b.status);

              return (
                <div
                  key={b._id}
                  style={{
                    background: 'var(--color-surface, #151822)',
                    borderRadius: '18px',
                    border: '1px solid var(--color-border, rgba(255, 255, 255, 0.08))',
                    padding: '1.15rem',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.22)',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'border-color 0.15s ease',
                  }}
                >
                  {/* Subtle Top Accent bar based on status */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '3px',
                      background:
                        statusNormalized === 'completed'
                          ? 'linear-gradient(90deg, #6366f1, #f5b942)'
                          : statusNormalized === 'cancelled'
                          ? '#ef4444'
                          : 'linear-gradient(90deg, #10b981, #f5b942)',
                    }}
                  />

                  {/* Header Row: Service title, Status Badge */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: '0.75rem',
                      marginBottom: '0.75rem',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.2rem' }}>
                        <span
                          style={{
                            background: 'rgba(245, 185, 66, 0.12)',
                            color: '#f5b942',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '6px',
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            letterSpacing: '0.04em',
                            textTransform: 'uppercase',
                          }}
                        >
                          Pass #{passCode}
                        </span>
                        {isCheckedIn && (
                          <span
                            style={{
                              background: 'rgba(16, 185, 129, 0.15)',
                              color: '#10b981',
                              padding: '0.15rem 0.45rem',
                              borderRadius: '6px',
                              fontSize: '0.68rem',
                              fontWeight: 800,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.2rem',
                            }}
                          >
                            <Check size={11} strokeWidth={3} /> Checked In
                          </span>
                        )}
                      </div>

                      <h3
                        style={{
                          fontFamily: 'Outfit',
                          fontSize: '1.05rem',
                          fontWeight: 800,
                          color: 'var(--color-text-primary, #ffffff)',
                          margin: 0,
                          lineHeight: 1.3,
                        }}
                      >
                        {b.service || 'Atelier Styling Session'}
                      </h3>
                    </div>

                    <div style={{ flexShrink: 0 }}>
                      <StatusBadge status={b.status} />
                    </div>
                  </div>

                  {/* Info Grid: Specialist/Client, Schedule Date & Time, Location */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                      gap: '0.65rem',
                      background: 'rgba(255, 255, 255, 0.02)',
                      borderRadius: '12px',
                      padding: '0.75rem',
                      border: '1px solid rgba(255, 255, 255, 0.04)',
                      marginBottom: '0.85rem',
                    }}
                  >
                    {/* Specialist / Client */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: 'rgba(245, 185, 66, 0.14)',
                          color: '#f5b942',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '0.82rem',
                          flexShrink: 0,
                        }}
                      >
                        <User size={16} />
                      </div>
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                          {isStaff ? 'Client' : 'Specialist'}
                        </div>
                        <div
                          style={{
                            fontSize: '0.84rem',
                            fontWeight: 700,
                            color: 'var(--color-text-primary, #ffffff)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {isStaff ? (b.clientName || b.clientEmail || 'Private Member') : (b.stylist || 'Master Stylist')}
                        </div>
                      </div>
                    </div>

                    {/* Schedule Date & Time */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: 'rgba(99, 102, 241, 0.14)',
                          color: '#818cf8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Clock size={16} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                          Appointment Time
                        </div>
                        <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--color-text-primary, #ffffff)' }}>
                          {b.date || 'TBD'} • {b.time || '10:00 AM'}
                        </div>
                      </div>
                    </div>

                    {/* Location */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: 'rgba(16, 185, 129, 0.14)',
                          color: '#10b981',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <MapPin size={16} />
                      </div>
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                          Location
                        </div>
                        <div
                          style={{
                            fontSize: '0.84rem',
                            fontWeight: 700,
                            color: 'var(--color-text-primary, #ffffff)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {b.location || 'Style Corner Main Atelier'}
                        </div>
                      </div>
                    </div>

                    {/* Price & Payment */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: 'rgba(245, 185, 66, 0.14)',
                          color: '#f5b942',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '0.85rem',
                          flexShrink: 0,
                        }}
                      >
                        ₦
                      </div>
                      <div>
                        <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                          Price & Payment
                        </div>
                        <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#f5b942' }}>
                          ₦{Number(b.price || 0).toLocaleString()} • {String(b.paymentStatus || '').startsWith('paid') ? 'Paid' : 'Awaiting Payment'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Toolbar */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.5rem',
                      flexWrap: 'wrap',
                      borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                      paddingTop: '0.75rem',
                    }}
                  >
                    {/* Left Quick Buttons: Digital Pass & Chat */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => setPassBooking(b)}
                        style={{
                          background: 'rgba(245, 185, 66, 0.12)',
                          color: '#f5b942',
                          border: '1px solid rgba(245, 185, 66, 0.3)',
                          borderRadius: '10px',
                          padding: '0.42rem 0.75rem',
                          fontSize: '0.76rem',
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          cursor: 'pointer',
                        }}
                      >
                        <QrCode size={14} /> Pass & QR
                      </button>

                      <button
                        onClick={() => setChatBooking(b)}
                        style={{
                          background: 'var(--color-surface, #151822)',
                          color: 'var(--color-text-primary, #ffffff)',
                          border: '1px solid var(--color-border, rgba(255, 255, 255, 0.1))',
                          borderRadius: '10px',
                          padding: '0.42rem 0.75rem',
                          fontSize: '0.76rem',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          cursor: 'pointer',
                        }}
                      >
                        <MessageSquare size={14} color="#818cf8" />
                        Chat
                      </button>

                      {/* Calendar export for upcoming */}
                      {isUpcoming(b.status) && (
                        <>
                          <a
                            href={getGoogleCalendarUrl(b)}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Add to Google Calendar"
                            style={{
                              background: 'var(--color-surface, #151822)',
                              color: '#94a3b8',
                              border: '1px solid var(--color-border, rgba(255, 255, 255, 0.08))',
                              borderRadius: '10px',
                              padding: '0.42rem 0.65rem',
                              fontSize: '0.76rem',
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              textDecoration: 'none',
                            }}
                          >
                            <Calendar size={13} color="#10b981" /> +Google
                          </a>
                          <button
                            type="button"
                            onClick={() => downloadIcsFile(b)}
                            title="Download .ics for Apple / Outlook Calendar"
                            style={{
                              background: 'var(--color-surface, #151822)',
                              color: '#94a3b8',
                              border: '1px solid var(--color-border, rgba(255, 255, 255, 0.08))',
                              borderRadius: '10px',
                              padding: '0.42rem 0.65rem',
                              fontSize: '0.76rem',
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              cursor: 'pointer',
                            }}
                          >
                            <CalendarDays size={13} color="#38bdf8" /> .ics
                          </button>
                        </>
                      )}
                    </div>

                    {/* Right Action: Rebook, Review, Cancel */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginLeft: 'auto' }}>
                      {canReview && (
                        <button
                          onClick={() => {
                            setReviewBooking(b);
                            setReviewRating(5);
                            setReviewComment('');
                          }}
                          style={{
                            background: 'rgba(245, 185, 66, 0.15)',
                            color: '#f5b942',
                            border: '1px solid rgba(245, 185, 66, 0.4)',
                            borderRadius: '10px',
                            padding: '0.42rem 0.75rem',
                            fontSize: '0.76rem',
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            cursor: 'pointer',
                          }}
                        >
                          <Star size={13} fill="#f5b942" /> Leave Review
                        </button>
                      )}

                      {!isStaff && (
                        <button
                          onClick={() => {
                            navigate(
                              `/booking?service=${encodeURIComponent(b.service || '')}&stylist=${encodeURIComponent(
                                b.stylist || ''
                              )}`
                            );
                          }}
                          style={{
                            background: 'var(--color-surface, #151822)',
                            color: 'var(--color-text-primary, #ffffff)',
                            border: '1px solid var(--color-border, rgba(255, 255, 255, 0.12))',
                            borderRadius: '10px',
                            padding: '0.42rem 0.75rem',
                            fontSize: '0.76rem',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            cursor: 'pointer',
                          }}
                        >
                          <Sparkles size={13} color="#f5b942" /> Rebook
                        </button>
                      )}

                      {canCancel && (
                        <button
                          onClick={() => {
                            setCancelModalBooking(b);
                            setCancelReason('Schedule conflict');
                          }}
                          style={{
                            background: 'none',
                            color: '#f87171',
                            border: '1px solid rgba(239, 68, 68, 0.25)',
                            borderRadius: '10px',
                            padding: '0.42rem 0.65rem',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                          }}
                        >
                          <Ban size={12} /> Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Appointment Digital Pass Modal */}
      {passBooking && (
        <AppointmentPassModal
          booking={passBooking}
          isOpen={!!passBooking}
          onClose={() => setPassBooking(null)}
          onCheckInSuccess={(bookingId) => {
            setBookings((prev) =>
              prev.map((b) =>
                b._id === bookingId ? { ...b, checkInStatus: 'checked_in', checkedInAt: new Date() } : b
              )
            );
            if (passBooking?._id === bookingId) {
              setPassBooking((prev) => ({
                ...prev,
                checkInStatus: 'checked_in',
                checkedInAt: new Date(),
              }));
            }
          }}
        />
      )}

      {/* Booking Live Chat Sheet */}
      {chatBooking && (
        <BookingChatSheet
          booking={chatBooking}
          currentUserEmail={user?.email}
          viewerRole={isStaff ? 'specialist' : 'customer'}
          isOpen={!!chatBooking}
          onClose={() => setChatBooking(null)}
        />
      )}

      {/* Leave Review Modal */}
      <PopupModal
        isOpen={!!reviewBooking}
        onClose={() => setReviewBooking(null)}
        title="Review Your Atelier Session"
      >
        {reviewBooking && (
          <form onSubmit={handleSubmitReview}>
            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.82rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                {reviewBooking.service}
              </div>
              <h3 style={{ fontFamily: 'Outfit', fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-primary, #ffffff)', margin: '0.2rem 0' }}>
                With {reviewBooking.stylist}
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                Rate your craftsmanship and service experience
              </p>

              {/* 5-Star Selector */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', margin: '1rem 0' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '0.25rem',
                      transform: star <= reviewRating ? 'scale(1.15)' : 'scale(1)',
                      transition: 'transform 0.15s ease',
                    }}
                  >
                    <Star
                      size={28}
                      color={star <= reviewRating ? '#f5b942' : '#475569'}
                      fill={star <= reviewRating ? '#f5b942' : 'none'}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="app-input-group">
              <label className="app-label">Your Experience & Feedback</label>
              <textarea
                className="app-textarea"
                rows={3}
                placeholder="Share your thoughts on the haircut, lashes, styling, punctuality, or atmosphere..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '0.65rem', marginTop: '1rem' }}>
              <button
                type="button"
                onClick={() => setReviewBooking(null)}
                className="app-btn app-btn-outline"
                style={{ flex: 1, borderRadius: '12px' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingReview}
                className="app-btn app-btn-accent"
                style={{ flex: 1.5, borderRadius: '12px', fontWeight: 800 }}
              >
                {submittingReview ? 'Posting Review...' : `Submit ${reviewRating}★ Review`}
              </button>
            </div>
          </form>
        )}
      </PopupModal>

      {/* Cancellation Confirmation Modal */}
      <PopupModal
        isOpen={!!cancelModalBooking}
        onClose={() => setCancelModalBooking(null)}
        title="Cancel Appointment?"
      >
        {cancelModalBooking && (
          <div>
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: '12px',
                padding: '0.85rem',
                marginBottom: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#ef4444', fontWeight: 800, fontSize: '0.85rem' }}>
                <AlertCircle size={16} /> Cancellation Notice
              </div>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '0.35rem 0 0', lineHeight: 1.4 }}>
                You are cancelling your session for <strong>{cancelModalBooking.service}</strong> with <strong>{cancelModalBooking.stylist}</strong> scheduled for <strong>{cancelModalBooking.date} at {cancelModalBooking.time}</strong>.
              </p>
            </div>

            <div className="app-input-group">
              <label className="app-label">Reason for cancellation</label>
              <select
                className="app-select"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              >
                <option value="Schedule conflict">Schedule conflict</option>
                <option value="Personal emergency">Personal emergency</option>
                <option value="Booked incorrect date/time">Booked incorrect date/time</option>
                <option value="Need to reschedule later">Need to reschedule later</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '0.65rem', marginTop: '1.25rem' }}>
              <button
                type="button"
                onClick={() => setCancelModalBooking(null)}
                className="app-btn app-btn-outline"
                style={{ flex: 1, borderRadius: '12px' }}
              >
                Keep Appointment
              </button>
              <button
                type="button"
                disabled={cancelling}
                onClick={handleConfirmCancel}
                className="app-btn"
                style={{ flex: 1, background: '#ef4444', color: '#ffffff', borderRadius: '12px', fontWeight: 800 }}
              >
                {cancelling ? 'Cancelling...' : 'Confirm Cancel'}
              </button>
            </div>
          </div>
        )}
      </PopupModal>

    </PageContainer>
  );
};

export default MyBookings;

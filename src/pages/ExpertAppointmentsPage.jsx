import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Calendar,
  Clock,
  ArrowLeft,
  Search,
  CheckCircle,
  XCircle,
  Scissors,
  MapPin,
  Mail,
  Phone,
  MessageSquare,
  QrCode,
  Download,
  Printer,
  RefreshCw,
  Check,
  AlertCircle,
  TrendingUp,
  Sparkles,
  Copy,
  ChevronRight,
  ShieldCheck,
  Hash,
  X,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import { PageContainer } from '../components/common/PageContainer';
import { StatusBadge } from '../components/common/StatusBadge';
import { Avatar } from '../components/common/Avatar';
import { CheckInScannerModal } from '../components/booking/CheckInScannerModal';
import { downloadBookingHistoryCSV, printBookingHistoryReport } from '../utils/bookingHistoryExport';

export const ExpertAppointmentsPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, showToast } = useAuth();
  const { isDark } = useTheme();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);

  // Sync tab with URL
  useEffect(() => {
    const qStatus = searchParams.get('status');
    if (qStatus && qStatus !== statusFilter) {
      setStatusFilter(qStatus);
    }
  }, [searchParams]);

  const fetchBookings = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const data = await api.getBookings();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      showToast(err.message || 'Failed to load appointments', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Update Status Handler (Accept, Reject, Complete)
  const handleUpdateStatus = async (bookingId, newStatus) => {
    setUpdatingId(bookingId);
    try {
      await api.updateBookingStatus(bookingId, newStatus);
      setBookings((prev) =>
        prev.map((b) => (b._id === bookingId ? { ...b, status: newStatus } : b))
      );
      if (newStatus === 'accepted') {
        showToast('Appointment accepted! Client notified.', 'success');
      } else if (newStatus === 'rejected') {
        showToast('Appointment declined.', 'accent');
      } else if (newStatus === 'completed') {
        showToast('Service marked as completed! Payout credited to your wallet.', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to update booking status', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const isToday = (dateVal) => {
    if (!dateVal) return false;
    const d = new Date(dateVal);
    return !isNaN(d.getTime()) && d.toDateString() === new Date().toDateString();
  };

  // WhatsApp helper
  const openClientWhatsApp = (phone, name = 'Client', service = 'Appointment', date = '', time = '') => {
    const clean = (phone || '').replace(/[^0-9+]/g, '');
    if (!clean) {
      showToast('No phone number registered for WhatsApp', 'error');
      return;
    }
    const intl = clean.startsWith('+') ? clean.slice(1) : clean.startsWith('0') ? '234' + clean.slice(1) : clean;
    const greeting = `Hello ${name || 'there'}, this is ${user?.firstname || 'your Atelier Specialist'} regarding your upcoming ${service} appointment on ${date} at ${time}. Looking forward to hosting you at Style Corner!`;
    window.open(`https://wa.me/${intl}?text=${encodeURIComponent(greeting)}`, '_blank');
  };

  // Copy Pass Code
  const handleCopyCode = (code) => {
    if (!code) return;
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    showToast(`Pass Code ${code} copied!`, 'success');
    setTimeout(() => setCopiedCode(null), 2500);
  };

  // Export handlers
  const handleExportCSV = () => {
    if (bookings.length === 0) {
      showToast('No appointment records to export.', 'accent');
      return;
    }
    downloadBookingHistoryCSV(filteredBookings, `StyleCorner_Appointments_${statusFilter}_${Date.now()}.csv`);
    showToast('Appointment CSV downloaded successfully!', 'success');
  };

  const handlePrintStatement = () => {
    if (bookings.length === 0) {
      showToast('No appointment records to print.', 'accent');
      return;
    }
    printBookingHistoryReport(filteredBookings, `Appointments Statement - ${user?.firstname || 'Specialist'}`);
  };

  // Filter calculations
  const pendingCount = useMemo(() => bookings.filter((b) => b.status === 'pending').length, [bookings]);
  const confirmedCount = useMemo(() => bookings.filter((b) => b.status === 'accepted').length, [bookings]);
  const completedCount = useMemo(() => bookings.filter((b) => b.status === 'completed').length, [bookings]);
  const todayCount = useMemo(() => bookings.filter((b) => isToday(b.date || b.createdAt)).length, [bookings]);

  const totalRevenue = useMemo(() => {
    return bookings
      .filter((b) => b.status === 'completed')
      .reduce((sum, b) => sum + (Number(b.price) || 0), 0);
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      // Status match
      if (statusFilter === 'pending' && b.status !== 'pending') return false;
      if (statusFilter === 'accepted' && b.status !== 'accepted') return false;
      if (statusFilter === 'completed' && b.status !== 'completed') return false;
      if (statusFilter === 'today' && !isToday(b.date || b.createdAt)) return false;

      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const client = (b.clientName || '').toLowerCase();
        const email = (b.clientEmail || '').toLowerCase();
        const phone = (b.clientPhone || '').toLowerCase();
        const service = (b.service || '').toLowerCase();
        const code = (b.checkInCode || '').toLowerCase();
        const location = (b.location || '').toLowerCase();
        const match =
          client.includes(q) ||
          email.includes(q) ||
          phone.includes(q) ||
          service.includes(q) ||
          code.includes(q) ||
          location.includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [bookings, statusFilter, searchQuery]);

  // Luxury theme tokens
  const cardBg = isDark ? '#141724' : '#ffffff';
  const cardBorder = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)';
  const cardShadow = isDark ? '0 12px 36px -12px rgba(0, 0, 0, 0.65)' : '0 8px 28px -8px rgba(15, 23, 42, 0.08)';
  const textPrimary = isDark ? '#ffffff' : '#0f172a';
  const textSecondary = isDark ? '#94a3b8' : '#64748b';
  const tagBg = isDark ? 'rgba(255, 255, 255, 0.04)' : '#f8fafc';
  const tagBorder = isDark ? 'rgba(255, 255, 255, 0.07)' : '#e2e8f0';

  return (
    <PageContainer>
      <div style={{ maxWidth: '1060px', margin: '0 auto', padding: '1rem 0 3.5rem' }}>
        
        {/* ── Top Header Navigation Bar ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.25rem',
            flexWrap: 'wrap',
            gap: '0.85rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={() => navigate('/expert-dashboard')}
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '14px',
                background: isDark ? '#161a29' : '#ffffff',
                border: `1px solid ${cardBorder}`,
                color: textPrimary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.04)',
              }}
              title="Return to Studio Dashboard"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                <h1
                  className="keep-white"
                  style={{
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: '1.45rem',
                    fontWeight: 900,
                    color: textPrimary,
                    margin: 0,
                    letterSpacing: '-0.02em',
                  }}
                >
                  Appointments Manager
                </h1>
                <span
                  style={{
                    background: 'rgba(245, 185, 66, 0.15)',
                    color: '#f5b942',
                    border: '1px solid rgba(245, 185, 66, 0.35)',
                    borderRadius: '50px',
                    padding: '0.15rem 0.6rem',
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    fontFamily: 'Outfit',
                  }}
                >
                  {bookings.length} Total
                </span>
              </div>
              <p style={{ color: textSecondary, fontSize: '0.8rem', margin: '0.15rem 0 0' }}>
                Manage bookings, client arrivals, check-in passes & live communication
              </p>
            </div>
          </div>

          {/* Quick Action Suite */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', flexWrap: 'wrap' }}>
            {/* Check-In Desk Scanner */}
            <button
              type="button"
              onClick={() => setShowCheckInModal(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                background: 'linear-gradient(135deg, rgba(245,185,66,0.2), rgba(212,175,55,0.18))',
                border: '1.5px solid rgba(245, 185, 66, 0.5)',
                color: '#f5b942',
                borderRadius: '12px',
                padding: '0.55rem 0.95rem',
                fontSize: '0.8rem',
                fontWeight: 800,
                fontFamily: 'Outfit',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(245, 185, 66, 0.18)',
              }}
            >
              <QrCode size={15} />
              <span>Check-In Scanner</span>
            </button>

            {/* Direct Client Messaging */}
            <button
              type="button"
              onClick={() => navigate('/expert/chat')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                background: isDark ? 'rgba(167, 139, 250, 0.14)' : '#f5f3ff',
                border: '1.5px solid rgba(167, 139, 250, 0.35)',
                color: isDark ? '#c4b5fd' : '#7c3aed',
                borderRadius: '12px',
                padding: '0.55rem 0.95rem',
                fontSize: '0.8rem',
                fontWeight: 800,
                fontFamily: 'Outfit',
                cursor: 'pointer',
              }}
            >
              <MessageSquare size={15} />
              <span>Client Chat</span>
            </button>

            {/* Refresh */}
            <button
              type="button"
              onClick={() => fetchBookings(true)}
              disabled={refreshing}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                background: isDark ? '#161a29' : '#ffffff',
                border: `1px solid ${cardBorder}`,
                color: textSecondary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              title="Refresh Appointments"
            >
              <RefreshCw size={15} className={refreshing ? 'spin' : ''} />
            </button>

            {/* Export CSV */}
            <button
              type="button"
              onClick={handleExportCSV}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                background: isDark ? '#161a29' : '#ffffff',
                border: `1px solid ${cardBorder}`,
                color: textSecondary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              title="Download CSV"
            >
              <Download size={15} />
            </button>

            {/* Print Statement */}
            <button
              type="button"
              onClick={handlePrintStatement}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                background: isDark ? '#161a29' : '#ffffff',
                border: `1px solid ${cardBorder}`,
                color: textSecondary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              title="Print Official Statement"
            >
              <Printer size={15} />
            </button>
          </div>
        </div>

        {/* ── KPI Metrics Bar ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '0.75rem',
            marginBottom: '1.25rem',
          }}
        >
          <div
            onClick={() => { setStatusFilter('today'); setSearchParams({ status: 'today' }); }}
            style={{
              background: cardBg,
              border: `1px solid ${statusFilter === 'today' ? '#f5b942' : cardBorder}`,
              borderRadius: '16px',
              padding: '1rem',
              cursor: 'pointer',
              boxShadow: cardShadow,
              transition: 'all 0.18s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '0.7rem', color: textSecondary, fontWeight: 800, fontFamily: 'Outfit' }}>TODAY</span>
              <Clock size={14} color="#f5b942" />
            </div>
            <div style={{ fontFamily: 'Outfit', fontSize: '1.5rem', fontWeight: 900, color: '#f5b942' }}>
              {todayCount}
            </div>
            <span style={{ fontSize: '0.7rem', color: textSecondary }}>Scheduled sessions</span>
          </div>

          <div
            onClick={() => { setStatusFilter('pending'); setSearchParams({ status: 'pending' }); }}
            style={{
              background: cardBg,
              border: `1px solid ${statusFilter === 'pending' ? '#ef4444' : cardBorder}`,
              borderRadius: '16px',
              padding: '1rem',
              cursor: 'pointer',
              boxShadow: cardShadow,
              transition: 'all 0.18s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '0.7rem', color: pendingCount > 0 ? '#f87171' : textSecondary, fontWeight: 800, fontFamily: 'Outfit' }}>PENDING</span>
              <AlertCircle size={14} color={pendingCount > 0 ? '#ef4444' : textSecondary} />
            </div>
            <div style={{ fontFamily: 'Outfit', fontSize: '1.5rem', fontWeight: 900, color: pendingCount > 0 ? '#ef4444' : textPrimary }}>
              {pendingCount}
            </div>
            <span style={{ fontSize: '0.7rem', color: textSecondary }}>Awaiting acceptance</span>
          </div>

          <div
            onClick={() => { setStatusFilter('accepted'); setSearchParams({ status: 'accepted' }); }}
            style={{
              background: cardBg,
              border: `1px solid ${statusFilter === 'accepted' ? '#10b981' : cardBorder}`,
              borderRadius: '16px',
              padding: '1rem',
              cursor: 'pointer',
              boxShadow: cardShadow,
              transition: 'all 0.18s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '0.7rem', color: textSecondary, fontWeight: 800, fontFamily: 'Outfit' }}>CONFIRMED</span>
              <CheckCircle size={14} color="#10b981" />
            </div>
            <div style={{ fontFamily: 'Outfit', fontSize: '1.5rem', fontWeight: 900, color: '#10b981' }}>
              {confirmedCount}
            </div>
            <span style={{ fontSize: '0.7rem', color: textSecondary }}>Upcoming active</span>
          </div>

          <div
            onClick={() => { setStatusFilter('completed'); setSearchParams({ status: 'completed' }); }}
            style={{
              background: cardBg,
              border: `1px solid ${statusFilter === 'completed' ? '#38bdf8' : cardBorder}`,
              borderRadius: '16px',
              padding: '1rem',
              cursor: 'pointer',
              boxShadow: cardShadow,
              transition: 'all 0.18s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '0.7rem', color: textSecondary, fontWeight: 800, fontFamily: 'Outfit' }}>TOTAL EARNINGS</span>
              <TrendingUp size={14} color="#38bdf8" />
            </div>
            <div style={{ fontFamily: 'Outfit', fontSize: '1.5rem', fontWeight: 900, color: '#38bdf8' }}>
              ₦{totalRevenue.toLocaleString()}
            </div>
            <span style={{ fontSize: '0.7rem', color: textSecondary }}>{completedCount} completed visits</span>
          </div>
        </div>

        {/* ── Search & Filter Controls ── */}
        <div
          style={{
            background: cardBg,
            border: `1px solid ${cardBorder}`,
            borderRadius: '20px',
            padding: '1.15rem',
            marginBottom: '1.35rem',
            boxShadow: cardShadow,
          }}
        >
          {/* Search Box */}
          <div style={{ position: 'relative', marginBottom: '0.95rem' }}>
            <Search
              size={17}
              style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: textSecondary,
              }}
            />
            <input
              type="text"
              placeholder="Search by client name, pass code (e.g. SC-CT37), service, or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '0.75rem 2.5rem 0.75rem 2.6rem',
                borderRadius: '12px',
                background: isDark ? '#0d1018' : '#f8fafc',
                border: `1px solid ${cardBorder}`,
                color: textPrimary,
                fontSize: '0.86rem',
                fontFamily: 'Inter, sans-serif',
                outline: 'none',
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: textSecondary,
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Filter Pills with Live Badges */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              overflowX: 'auto',
              scrollbarWidth: 'none',
              paddingBottom: '0.2rem',
            }}
          >
            {[
              { id: 'all', label: 'All Bookings', count: bookings.length },
              { id: 'today', label: 'Today', count: todayCount },
              { id: 'pending', label: 'Pending', count: pendingCount },
              { id: 'accepted', label: 'Confirmed', count: confirmedCount },
              { id: 'completed', label: 'Completed', count: completedCount },
            ].map((tab) => {
              const isActive = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setStatusFilter(tab.id);
                    setSearchParams({ status: tab.id });
                  }}
                  style={{
                    padding: '0.45rem 0.95rem',
                    borderRadius: '50px',
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: '0.78rem',
                    fontWeight: isActive ? 800 : 600,
                    cursor: 'pointer',
                    background: isActive
                      ? 'linear-gradient(135deg, #f5b942 0%, #e0a32d 100%)'
                      : isDark
                      ? '#171c2b'
                      : '#f1f5f9',
                    color: isActive
                      ? '#0c0e14'
                      : isDark
                      ? '#cbd5e1'
                      : '#475569',
                    border: `1.5px solid ${isActive ? '#f5b942' : 'transparent'}`,
                    whiteSpace: 'nowrap',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    transition: 'all 0.16s ease',
                    boxShadow: isActive ? '0 4px 14px rgba(245, 185, 66, 0.25)' : 'none',
                  }}
                >
                  <span>{tab.label}</span>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      padding: '0.08rem 0.45rem',
                      borderRadius: '50px',
                      background: isActive ? 'rgba(12, 14, 20, 0.25)' : isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
                      color: isActive ? '#0c0e14' : textSecondary,
                      fontWeight: 800,
                    }}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Appointments Loading Skeleton ── */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                style={{
                  height: '160px',
                  borderRadius: '20px',
                  background: isDark ? '#141724' : '#f1f5f9',
                  animation: 'pulse 1.5s infinite',
                }}
              />
            ))}
          </div>
        )}

        {/* ── Empty State ── */}
        {!loading && filteredBookings.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: '3.5rem 1.5rem',
              background: cardBg,
              border: `1.5px dashed ${cardBorder}`,
              borderRadius: '24px',
              boxShadow: cardShadow,
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(245, 185, 66, 0.12)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#f5b942',
                marginBottom: '1rem',
              }}
            >
              <Calendar size={28} />
            </div>
            <h3
              className="keep-white"
              style={{ fontFamily: 'Outfit', fontSize: '1.2rem', fontWeight: 800, color: textPrimary, margin: '0 0 0.4rem' }}
            >
              No {statusFilter === 'all' ? '' : statusFilter} appointments found
            </h3>
            <p style={{ color: textSecondary, fontSize: '0.84rem', margin: '0 auto 1.5rem', maxWidth: '420px', lineHeight: 1.5 }}>
              {searchQuery
                ? `No appointment matched your search query "${searchQuery}". Try searching another name or clearing filters.`
                : statusFilter === 'pending'
                ? 'You are all caught up! When clients schedule a session with you, their requests will appear here for instant acceptance.'
                : 'No appointments currently recorded under this view.'}
            </p>
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{
                  background: '#f5b942',
                  color: '#0c0e14',
                  border: 'none',
                  borderRadius: '50px',
                  padding: '0.55rem 1.25rem',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  fontFamily: 'Outfit',
                  cursor: 'pointer',
                }}
              >
                Clear Search Filter
              </button>
            ) : statusFilter !== 'all' ? (
              <button
                type="button"
                onClick={() => { setStatusFilter('all'); setSearchParams({}); }}
                style={{
                  background: 'rgba(245, 185, 66, 0.15)',
                  border: '1px solid rgba(245, 185, 66, 0.4)',
                  color: '#f5b942',
                  borderRadius: '50px',
                  padding: '0.55rem 1.25rem',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  fontFamily: 'Outfit',
                  cursor: 'pointer',
                }}
              >
                View All Appointments ({bookings.length})
              </button>
            ) : null}
          </div>
        )}

        {/* ── Clean Luxury Appointment Cards List ── */}
        {!loading && filteredBookings.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredBookings.map((b) => {
              const isPaid = b.paymentStatus === 'paid';
              const isCheckedIn = b.checkInStatus === 'checked_in' || b.checkedInAt;
              const isUpdating = updatingId === b._id;

              // Left status accent color
              const statusAccent =
                b.status === 'accepted'
                  ? '#10b981'
                  : b.status === 'pending'
                  ? '#f5b942'
                  : b.status === 'completed'
                  ? '#38bdf8'
                  : '#ef4444';

              return (
                <div
                  key={b._id}
                  style={{
                    background: cardBg,
                    border: `1px solid ${cardBorder}`,
                    borderLeft: `5px solid ${statusAccent}`,
                    borderRadius: '22px',
                    padding: '1.25rem',
                    boxShadow: cardShadow,
                    transition: 'all 0.2s ease',
                  }}
                >
                  {/* Row 1: Client Identity & Price Tag */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '0.85rem',
                      gap: '0.75rem',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                      <Avatar
                        src={b.clientAvatar || ''}
                        name={b.clientName || 'Client'}
                        size={44}
                        borderRadius="14px"
                      />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <h3
                            className="keep-white"
                            style={{
                              fontFamily: 'Outfit, sans-serif',
                              fontSize: '1.08rem',
                              fontWeight: 800,
                              color: textPrimary,
                              margin: 0,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {b.clientName || 'Client Appointment'}
                          </h3>
                          <StatusBadge status={b.status} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.76rem', color: textSecondary, marginTop: '0.15rem', flexWrap: 'wrap' }}>
                          {b.clientEmail && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <Mail size={12} /> {b.clientEmail}
                            </span>
                          )}
                          {b.clientPhone && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <Phone size={12} /> {b.clientPhone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 'auto' }}>
                      <span
                        style={{
                          fontFamily: 'Outfit, sans-serif',
                          fontSize: '1.25rem',
                          fontWeight: 900,
                          color: '#f5b942',
                          display: 'block',
                          lineHeight: 1,
                        }}
                      >
                        ₦{Number(b.price || 0).toLocaleString()}
                      </span>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          fontFamily: 'Outfit',
                          color: isPaid ? '#10b981' : '#f5b942',
                          marginTop: '0.25rem',
                          display: 'inline-block',
                        }}
                      >
                        {isPaid ? '✓ Paid via Paystack' : '⏳ Payment Pending'}
                      </span>
                    </div>
                  </div>

                  {/* Row 2: Service & Schedule Details Grid */}
                  <div
                    style={{
                      background: tagBg,
                      border: `1px solid ${tagBorder}`,
                      borderRadius: '16px',
                      padding: '0.85rem 1rem',
                      marginBottom: '1rem',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                      gap: '0.75rem',
                    }}
                  >
                    {/* Service */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'rgba(245, 185, 66, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f5b942', flexShrink: 0 }}>
                        <Scissors size={14} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <span style={{ fontSize: '0.66rem', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', fontWeight: 700 }}>Service</span>
                        <span className="keep-white" style={{ fontSize: '0.82rem', fontWeight: 700, color: textPrimary, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {b.service || 'Specialist Appointment'}
                        </span>
                      </div>
                    </div>

                    {/* Date & Time */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8', flexShrink: 0 }}>
                        <Calendar size={14} />
                      </div>
                      <div>
                        <span style={{ fontSize: '0.66rem', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', fontWeight: 700 }}>Scheduled For</span>
                        <span className="keep-white" style={{ fontSize: '0.82rem', fontWeight: 700, color: textPrimary }}>
                          {b.date || 'TBD'} at {b.time || '10:00 AM'}
                        </span>
                      </div>
                    </div>

                    {/* Location */}
                    {b.location && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'rgba(168, 85, 247, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c084fc', flexShrink: 0 }}>
                          <MapPin size={14} />
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <span style={{ fontSize: '0.66rem', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', fontWeight: 700 }}>Location</span>
                          <span className="keep-white" style={{ fontSize: '0.82rem', fontWeight: 700, color: textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                            {b.location}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Pass Code & Check-In Status */}
                    {b.checkInCode && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'rgba(245, 185, 66, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f5b942', flexShrink: 0 }}>
                          <Hash size={14} />
                        </div>
                        <div>
                          <span style={{ fontSize: '0.66rem', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', fontWeight: 700 }}>Pass Code</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <span style={{ fontFamily: 'monospace', fontSize: '0.86rem', fontWeight: 800, color: '#f5b942' }}>
                              {b.checkInCode}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyCode(b.checkInCode)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: copiedCode === b.checkInCode ? '#10b981' : textSecondary,
                                cursor: 'pointer',
                                padding: '2px',
                                display: 'flex',
                                alignItems: 'center',
                              }}
                              title="Copy Pass Code"
                            >
                              {copiedCode === b.checkInCode ? <Check size={12} /> : <Copy size={12} />}
                            </button>
                            {isCheckedIn ? (
                              <span style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: 800, background: 'rgba(16, 185, 129, 0.15)', padding: '0.05rem 0.35rem', borderRadius: '4px' }}>
                                Checked In
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Row 3: Action Buttons Bar */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.65rem',
                      flexWrap: 'wrap',
                    }}
                  >
                    {/* Left: Client Communication Channels */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                      {b.clientPhone && (
                        <button
                          type="button"
                          onClick={() => openClientWhatsApp(b.clientPhone, b.clientName, b.service, b.date, b.time)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            background: isDark ? 'rgba(34, 197, 94, 0.14)' : '#ecfdf5',
                            border: `1px solid ${isDark ? 'rgba(34, 197, 94, 0.35)' : 'rgba(34, 197, 94, 0.3)'}`,
                            color: '#4ade80',
                            borderRadius: '10px',
                            padding: '0.45rem 0.8rem',
                            fontSize: '0.76rem',
                            fontWeight: 700,
                            fontFamily: 'Outfit',
                            cursor: 'pointer',
                          }}
                        >
                          <Phone size={13} /> WhatsApp
                        </button>
                      )}

                      {b.clientPhone && (
                        <a
                          href={`tel:${b.clientPhone}`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            background: isDark ? 'rgba(56, 189, 248, 0.12)' : '#eff6ff',
                            border: `1px solid ${isDark ? 'rgba(56, 189, 248, 0.35)' : 'rgba(56, 189, 248, 0.3)'}`,
                            color: isDark ? '#60a5fa' : '#0284c7',
                            borderRadius: '10px',
                            padding: '0.45rem 0.8rem',
                            fontSize: '0.76rem',
                            fontWeight: 700,
                            fontFamily: 'Outfit',
                            textDecoration: 'none',
                          }}
                        >
                          <Phone size={13} /> Call
                        </a>
                      )}

                      {/* In-App Live Chat */}
                      <button
                        type="button"
                        onClick={() => navigate(`/expert/chat?bookingId=${b._id}`)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          background: isDark ? 'rgba(167, 139, 250, 0.14)' : '#f5f3ff',
                          border: `1px solid ${isDark ? 'rgba(167, 139, 250, 0.35)' : 'rgba(167, 139, 250, 0.3)'}`,
                          color: isDark ? '#c4b5fd' : '#7c3aed',
                          borderRadius: '10px',
                          padding: '0.45rem 0.8rem',
                          fontSize: '0.76rem',
                          fontWeight: 700,
                          fontFamily: 'Outfit',
                          cursor: 'pointer',
                        }}
                      >
                        <MessageSquare size={13} /> Chat Client
                      </button>
                    </div>

                    {/* Right: Appointment Lifecycle Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginLeft: 'auto' }}>
                      {/* PENDING: Accept or Decline */}
                      {b.status === 'pending' && (
                        <>
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => handleUpdateStatus(b._id, 'accepted')}
                            style={{
                              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                              border: 'none',
                              color: '#ffffff',
                              borderRadius: '10px',
                              padding: '0.5rem 1.15rem',
                              fontFamily: 'Outfit',
                              fontSize: '0.8rem',
                              fontWeight: 800,
                              cursor: isUpdating ? 'wait' : 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                            }}
                          >
                            <CheckCircle size={14} />
                            <span>{isUpdating ? 'Updating…' : 'Accept Appointment'}</span>
                          </button>
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => handleUpdateStatus(b._id, 'rejected')}
                            style={{
                              background: 'rgba(239, 68, 68, 0.1)',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              color: '#f87171',
                              borderRadius: '10px',
                              padding: '0.5rem 0.85rem',
                              fontFamily: 'Outfit',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              cursor: isUpdating ? 'wait' : 'pointer',
                            }}
                          >
                            Decline
                          </button>
                        </>
                      )}

                      {/* ACCEPTED: Mark Complete or Scan Check-In */}
                      {b.status === 'accepted' && (
                        <>
                          <button
                            type="button"
                            onClick={() => setShowCheckInModal(true)}
                            style={{
                              background: 'rgba(245, 185, 66, 0.12)',
                              border: '1px solid rgba(245, 185, 66, 0.35)',
                              color: '#f5b942',
                              borderRadius: '10px',
                              padding: '0.5rem 0.85rem',
                              fontFamily: 'Outfit',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                            }}
                          >
                            <QrCode size={13} /> Check-In Pass
                          </button>
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => handleUpdateStatus(b._id, 'completed')}
                            style={{
                              background: 'linear-gradient(135deg, #f5b942 0%, #e0a32d 100%)',
                              border: 'none',
                              color: '#0c0e14',
                              borderRadius: '10px',
                              padding: '0.5rem 1.15rem',
                              fontFamily: 'Outfit',
                              fontSize: '0.8rem',
                              fontWeight: 900,
                              cursor: isUpdating ? 'wait' : 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              boxShadow: '0 4px 14px rgba(245, 185, 66, 0.25)',
                            }}
                          >
                            <CheckCircle size={14} />
                            <span>{isUpdating ? 'Completing…' : 'Mark Completed'}</span>
                          </button>
                        </>
                      )}

                      {/* COMPLETED: Verified Badge */}
                      {b.status === 'completed' && (
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            background: 'rgba(16, 185, 129, 0.12)',
                            color: '#10b981',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            borderRadius: '10px',
                            padding: '0.45rem 0.85rem',
                            fontSize: '0.78rem',
                            fontWeight: 800,
                            fontFamily: 'Outfit',
                          }}
                        >
                          <Check size={14} />
                          <span>Service Completed & Payout Credited</span>
                        </div>
                      )}

                      {/* DECLINED / CANCELLED */}
                      {b.status === 'rejected' && (
                        <span style={{ fontSize: '0.78rem', color: '#f87171', fontWeight: 700 }}>
                          Declined
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* ── Check-In Scanner Desk Modal ── */}
      <CheckInScannerModal
        isOpen={showCheckInModal}
        onClose={() => setShowCheckInModal(false)}
        onCheckInComplete={(updatedBooking) => {
          setBookings((prev) =>
            prev.map((b) => (b._id === updatedBooking._id ? { ...b, ...updatedBooking } : b))
          );
          showToast('Client arrival confirmed & verified via Scanner!', 'success');
        }}
      />
    </PageContainer>
  );
};

export default ExpertAppointmentsPage;

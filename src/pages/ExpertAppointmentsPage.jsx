import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Calendar,
  Clock,
  ArrowLeft,
  Search,
  Filter,
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
  User,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  CreditCard,
  Hash,
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

  // WhatsApp quick helper
  const openClientWhatsApp = (phone, name = 'Client') => {
    const clean = (phone || '').replace(/[^0-9+]/g, '');
    if (!clean) {
      showToast('No phone number registered for WhatsApp', 'error');
      return;
    }
    const intl = clean.startsWith('+') ? clean.slice(1) : clean.startsWith('0') ? '234' + clean.slice(1) : clean;
    const msg = encodeURIComponent(`Hello ${name}, this is ${user?.firstname || 'your Stylist'} from Style Corner regarding your appointment.`);
    window.open(`https://wa.me/${intl}?text=${msg}`, '_blank');
  };

  // Filter calculations
  const pendingCount = useMemo(() => bookings.filter((b) => b.status === 'pending').length, [bookings]);
  const confirmedCount = useMemo(() => bookings.filter((b) => b.status === 'accepted').length, [bookings]);
  const completedCount = useMemo(() => bookings.filter((b) => b.status === 'completed').length, [bookings]);
  const todayCount = useMemo(() => bookings.filter((b) => isToday(b.date || b.createdAt)).length, [bookings]);

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

  // Card theme tokens
  const cardBg = isDark ? 'linear-gradient(145deg, #151824 0%, #10121c 100%)' : '#ffffff';
  const cardBorder = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)';
  const cardShadow = isDark ? '0 10px 30px -10px rgba(0, 0, 0, 0.5)' : '0 4px 20px -4px rgba(15, 23, 42, 0.06)';
  const textPrimary = isDark ? '#ffffff' : '#0f172a';
  const textSecondary = isDark ? '#94a3b8' : '#64748b';
  const tagBg = isDark ? 'rgba(255, 255, 255, 0.04)' : '#f8fafc';
  const tagBorder = isDark ? 'rgba(255, 255, 255, 0.06)' : '#e2e8f0';

  return (
    <PageContainer>
      <div style={{ maxWidth: '1020px', margin: '0 auto', padding: '1rem 0 3rem' }}>
        
        {/* Top Header Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={() => navigate('/expert-dashboard')}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: isDark ? '#151824' : '#f1f5f9',
                border: `1px solid ${cardBorder}`,
                color: textPrimary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.18s ease',
              }}
              title="Back to Dashboard"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h1 style={{ fontFamily: 'Outfit', fontSize: '1.45rem', fontWeight: 900, color: textPrimary, margin: 0 }}>
                  Client Appointments
                </h1>
                <span
                  style={{
                    background: 'rgba(245, 185, 66, 0.15)',
                    color: '#f5b942',
                    border: '1px solid rgba(245, 185, 66, 0.3)',
                    borderRadius: '20px',
                    padding: '0.12rem 0.55rem',
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    fontFamily: 'Outfit',
                  }}
                >
                  {bookings.length} Total
                </span>
              </div>
              <p style={{ color: textSecondary, fontSize: '0.8rem', margin: '0.15rem 0 0' }}>
                Manage bookings, verify client check-in passes, and chat in real-time
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowCheckInModal(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                background: 'linear-gradient(135deg, rgba(245,185,66,0.18), rgba(212,175,55,0.18))',
                border: '1.5px solid rgba(245, 185, 66, 0.45)',
                color: '#f5b942',
                borderRadius: '12px',
                padding: '0.55rem 0.95rem',
                fontSize: '0.8rem',
                fontWeight: 800,
                fontFamily: 'Outfit',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(245, 185, 66, 0.15)',
              }}
            >
              <QrCode size={15} />
              <span>Check-In Scanner</span>
            </button>

            <button
              onClick={() => navigate('/expert/chat')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                background: isDark ? 'rgba(167,139,250,0.14)' : '#f5f3ff',
                border: '1.5px solid rgba(167,139,250,0.35)',
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

            <button
              onClick={() => fetchBookings(true)}
              disabled={refreshing}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                background: isDark ? '#151824' : '#f1f5f9',
                border: `1px solid ${cardBorder}`,
                color: textSecondary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              title="Refresh Bookings"
            >
              <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
            </button>

            <button
              onClick={() => downloadBookingHistoryCSV(filteredBookings, `Expert_Appointments_${statusFilter}`)}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                background: isDark ? '#151824' : '#f1f5f9',
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
          </div>
        </div>

        {/* Search Bar & Filter Tabs */}
        <div
          style={{
            background: cardBg,
            border: `1px solid ${cardBorder}`,
            borderRadius: '18px',
            padding: '1rem',
            marginBottom: '1.25rem',
            boxShadow: cardShadow,
          }}
        >
          {/* Search Input */}
          <div style={{ position: 'relative', marginBottom: '0.85rem' }}>
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
              placeholder="Search by client name, pass code (e.g. SC-CT37), service, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '0.75rem 1rem 0.75rem 2.6rem',
                borderRadius: '12px',
                background: isDark ? '#0d1017' : '#f8fafc',
                border: `1px solid ${cardBorder}`,
                color: textPrimary,
                fontSize: '0.86rem',
                fontFamily: 'Inter, sans-serif',
                outline: 'none',
              }}
            />
            {searchQuery && (
              <button
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
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}
              >
                Clear
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              overflowX: 'auto',
              scrollbarWidth: 'none',
              paddingBottom: '0.15rem',
            }}
          >
            {[
              { id: 'all', label: 'All', count: bookings.length },
              { id: 'pending', label: 'Pending', count: pendingCount },
              { id: 'accepted', label: 'Confirmed', count: confirmedCount },
              { id: 'completed', label: 'Completed', count: completedCount },
              { id: 'today', label: 'Today', count: todayCount },
            ].map((tab) => {
              const isActive = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setStatusFilter(tab.id);
                    setSearchParams({ status: tab.id });
                  }}
                  style={{
                    padding: '0.42rem 0.85rem',
                    borderRadius: '20px',
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: '0.78rem',
                    fontWeight: isActive ? 800 : 600,
                    cursor: 'pointer',
                    background: isActive
                      ? '#f5b942'
                      : isDark
                      ? '#1e2230'
                      : '#f1f5f9',
                    color: isActive
                      ? '#0c0e14'
                      : isDark
                      ? '#94a3b8'
                      : '#64748b',
                    border: `1.5px solid ${isActive ? '#f5b942' : 'transparent'}`,
                    whiteSpace: 'nowrap',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span>{tab.label}</span>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      padding: '0.08rem 0.4rem',
                      borderRadius: '10px',
                      background: isActive ? 'rgba(12, 14, 20, 0.2)' : isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
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

        {/* Loading Skeleton */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                style={{
                  height: '140px',
                  borderRadius: '18px',
                  background: isDark ? '#151824' : '#f1f5f9',
                  animation: 'pulse 1.5s infinite',
                }}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredBookings.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: '3.5rem 1.5rem',
              background: cardBg,
              border: `1px dashed ${cardBorder}`,
              borderRadius: '22px',
              boxShadow: cardShadow,
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: isDark ? 'rgba(245, 185, 66, 0.12)' : '#fef3c7',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#f5b942',
                marginBottom: '1rem',
              }}
            >
              <Calendar size={28} />
            </div>
            <h3 style={{ fontFamily: 'Outfit', fontSize: '1.15rem', fontWeight: 800, color: textPrimary, margin: '0 0 0.4rem' }}>
              No Appointments Found
            </h3>
            <p style={{ color: textSecondary, fontSize: '0.84rem', margin: '0 auto 1.5rem', maxWidth: '400px', lineHeight: 1.5 }}>
              {searchQuery
                ? `No bookings match "${searchQuery}". Try searching by another keyword or clear filters.`
                : statusFilter !== 'all'
                ? `You have no ${statusFilter} appointments currently.`
                : 'You have no recorded client bookings yet. As soon as clients schedule with you, they will appear here in real time.'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  background: 'linear-gradient(135deg, #f5b942 0%, #e0a32d 100%)',
                  color: '#0c0e14',
                  border: 'none',
                  borderRadius: '50px',
                  padding: '0.6rem 1.4rem',
                  fontFamily: 'Outfit',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Clear Search
              </button>
            )}
          </div>
        )}

        {/* Bookings List */}
        {!loading && filteredBookings.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredBookings.map((b) => {
              const isPaid = b.paymentStatus === 'paid';
              const isCheckedIn = b.checkInStatus === 'checked_in' || b.checkedInAt;
              const isUpdating = updatingId === b._id;

              return (
                <div
                  key={b._id}
                  style={{
                    background: cardBg,
                    border: `1px solid ${cardBorder}`,
                    borderRadius: '20px',
                    padding: '1.25rem',
                    boxShadow: cardShadow,
                    transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                  }}
                >
                  {/* Top Row: Client Name, Status Badge, Price */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.55rem', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', minWidth: 0 }}>
                      <Avatar
                        src={b.clientAvatar || ''}
                        name={b.clientName || 'Client'}
                        size={38}
                        borderRadius="50%"
                      />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                          <h3
                            style={{
                              fontFamily: 'Outfit',
                              fontSize: '1.02rem',
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
                        <span style={{ fontSize: '0.74rem', color: textSecondary, display: 'block' }}>
                          {b.clientEmail || 'Direct Customer'}
                        </span>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <span
                        style={{
                          fontFamily: 'Outfit',
                          fontSize: '1.18rem',
                          fontWeight: 900,
                          color: isDark ? '#f5b942' : '#b45309',
                          display: 'block',
                        }}
                      >
                        ₦{Number(b.price || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Badges Row: Payment, Check-In, Pass Code, Service */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.85rem', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        fontFamily: 'Outfit',
                        background: isPaid ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 185, 66, 0.15)',
                        color: isPaid ? '#10b981' : '#f5b942',
                        border: `1px solid ${isPaid ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 185, 66, 0.3)'}`,
                        padding: '0.15rem 0.55rem',
                        borderRadius: '50px',
                      }}
                    >
                      {isPaid ? '✓ Paid via Paystack' : '⏳ Payment Pending'}
                    </span>

                    {isCheckedIn ? (
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          fontFamily: 'Outfit',
                          background: 'rgba(16, 185, 129, 0.18)',
                          color: '#10b981',
                          border: '1px solid rgba(16, 185, 129, 0.35)',
                          padding: '0.15rem 0.55rem',
                          borderRadius: '50px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.2rem',
                        }}
                      >
                        ✓ Client Checked In
                      </span>
                    ) : (
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          fontFamily: 'Outfit',
                          background: isDark ? 'rgba(148, 163, 184, 0.1)' : '#f1f5f9',
                          color: textSecondary,
                          padding: '0.15rem 0.55rem',
                          borderRadius: '50px',
                        }}
                      >
                        ⏳ Awaiting Arrival
                      </span>
                    )}

                    {b.checkInCode && (
                      <span
                        style={{
                          fontSize: '0.7rem',
                          color: isDark ? '#f5b942' : '#b45309',
                          background: isDark ? 'rgba(245, 185, 66, 0.1)' : '#fef3c7',
                          border: `1px solid ${isDark ? 'rgba(245, 185, 66, 0.25)' : '#fde68a'}`,
                          borderRadius: '6px',
                          padding: '0.1rem 0.45rem',
                          fontFamily: 'monospace',
                          fontWeight: 800,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.2rem',
                        }}
                      >
                        <Hash size={11} /> Pass: {b.checkInCode}
                      </span>
                    )}

                    <span style={{ fontSize: '0.74rem', color: textSecondary }}>•</span>

                    <span
                      style={{
                        fontSize: '0.78rem',
                        color: textPrimary,
                        fontWeight: 700,
                        fontFamily: 'Outfit',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                      }}
                    >
                      <Scissors size={13} color="#f5b942" /> {b.service || 'Beauty Session'}
                    </span>
                  </div>

                  {/* Schedule & Location Pill */}
                  <div
                    style={{
                      background: tagBg,
                      border: `1px solid ${tagBorder}`,
                      borderRadius: '12px',
                      padding: '0.65rem 0.85rem',
                      marginBottom: '0.95rem',
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '0.95rem',
                      fontSize: '0.76rem',
                      color: textSecondary,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Calendar size={13} color="#f5b942" />
                      <span>{b.date || 'Scheduled Date'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Clock size={13} color="#f5b942" />
                      <span>{b.time || '10:00 AM'}</span>
                    </div>
                    {b.location && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <MapPin size={13} color="#f5b942" />
                        <span>{b.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.65rem', flexWrap: 'wrap' }}>
                    
                    {/* Communication Buttons: WhatsApp, Call, Live Chat */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      {b.clientPhone && (
                        <button
                          onClick={() => openClientWhatsApp(b.clientPhone, b.clientName)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            background: isDark ? 'rgba(16, 185, 129, 0.15)' : '#ecfdf5',
                            border: `1px solid ${isDark ? 'rgba(16, 185, 129, 0.35)' : 'rgba(16, 185, 129, 0.25)'}`,
                            color: '#10b981',
                            borderRadius: '10px',
                            padding: '0.42rem 0.75rem',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            fontFamily: 'Outfit',
                            cursor: 'pointer',
                          }}
                        >
                          <Phone size={12} /> WhatsApp
                        </button>
                      )}

                      {b.clientPhone && (
                        <a
                          href={`tel:${b.clientPhone}`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            background: isDark ? 'rgba(59, 130, 246, 0.14)' : '#eff6ff',
                            border: `1px solid ${isDark ? 'rgba(59, 130, 246, 0.35)' : 'rgba(59, 130, 246, 0.25)'}`,
                            color: isDark ? '#60a5fa' : '#2563eb',
                            borderRadius: '10px',
                            padding: '0.42rem 0.75rem',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            fontFamily: 'Outfit',
                            textDecoration: 'none',
                          }}
                        >
                          <Phone size={12} /> Call
                        </a>
                      )}

                      <button
                        onClick={() => navigate(`/expert/chat?bookingId=${b._id}`)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          background: isDark ? 'rgba(167, 139, 250, 0.15)' : '#f5f3ff',
                          border: `1px solid ${isDark ? 'rgba(167, 139, 250, 0.35)' : 'rgba(139, 92, 246, 0.25)'}`,
                          color: isDark ? '#c4b5fd' : '#7c3aed',
                          borderRadius: '10px',
                          padding: '0.42rem 0.85rem',
                          fontSize: '0.74rem',
                          fontWeight: 800,
                          fontFamily: 'Outfit',
                          cursor: 'pointer',
                        }}
                      >
                        <MessageSquare size={13} /> Chat Client
                      </button>
                    </div>

                    {/* Operational Action Buttons (Accept / Decline / Complete) */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto' }}>
                      {b.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(b._id, 'rejected')}
                            disabled={isUpdating}
                            style={{
                              padding: '0.42rem 0.85rem',
                              borderRadius: '10px',
                              background: 'rgba(239, 68, 68, 0.12)',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              color: '#ef4444',
                              fontSize: '0.76rem',
                              fontWeight: 800,
                              fontFamily: 'Outfit',
                              cursor: 'pointer',
                            }}
                          >
                            Decline
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(b._id, 'accepted')}
                            disabled={isUpdating}
                            style={{
                              padding: '0.42rem 1rem',
                              borderRadius: '10px',
                              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                              border: 'none',
                              color: '#ffffff',
                              fontSize: '0.76rem',
                              fontWeight: 800,
                              fontFamily: 'Outfit',
                              cursor: 'pointer',
                              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
                            }}
                          >
                            Accept
                          </button>
                        </>
                      )}

                      {b.status === 'accepted' && (
                        <button
                          onClick={() => handleUpdateStatus(b._id, 'completed')}
                          disabled={isUpdating}
                          style={{
                            padding: '0.42rem 1rem',
                            borderRadius: '10px',
                            background: isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.12)',
                            border: '1.5px solid rgba(16, 185, 129, 0.5)',
                            color: isDark ? '#10b981' : '#059669',
                            fontSize: '0.76rem',
                            fontWeight: 800,
                            fontFamily: 'Outfit',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                          }}
                        >
                          <Check size={13} strokeWidth={3} /> Complete Service
                        </button>
                      )}

                      {b.status === 'completed' && (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            color: '#10b981',
                            fontSize: '0.74rem',
                            fontWeight: 800,
                            fontFamily: 'Outfit',
                            background: 'rgba(16, 185, 129, 0.1)',
                            padding: '0.35rem 0.7rem',
                            borderRadius: '8px',
                          }}
                        >
                          <Check size={13} /> Completed
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

      {/* QR Check-In Scanner Modal */}
      {showCheckInModal && (
        <CheckInScannerModal
          isOpen={showCheckInModal}
          onClose={() => setShowCheckInModal(false)}
          onSuccess={() => {
            fetchBookings(true);
            showToast('Client verified and successfully checked in!', 'success');
          }}
        />
      )}
    </PageContainer>
  );
};

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  ShoppingBag,
  Sparkles,
  User,
  LogOut,
  Edit,
  Clock,
  ChevronRight,
  Plus,
  RefreshCw,
  Award,
  ShieldCheck,
  Star,
  CheckCircle,
  Phone,
  ArrowRight,
  Download,
  Truck,
  Trash2,
  AlertTriangle,
  Eye,
  MessageSquare,
  History,
  Activity,
  Wallet,
  ArrowUpRight,
  Scissors,
  Sun,
  Moon,
  MapPin,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import { uploadToCloudinary } from '../services/cloudinary';
import { PageContainer } from '../components/common/PageContainer';
import { StatusBadge } from '../components/common/StatusBadge';
import { SkeletonList } from '../components/common/SkeletonLoader';
import { BottomSheet } from '../components/common/BottomSheet';
import { PopupModal } from '../components/common/PopupModal';
import { WithdrawFundsModal } from '../components/common/WithdrawFundsModal';
import { AISpecialistMatcherSheet } from '../components/booking/AISpecialistMatcherSheet';
import { ImagePreviewModal } from '../components/common/ImagePreviewModal';
import { Avatar } from '../components/common/Avatar';
import { OrderTrackingSheet } from '../components/store/OrderTrackingSheet';
import { LocationSelector } from '../components/store/LocationSelector';
import { downloadBookingHistoryCSV, printBookingHistoryReport } from '../utils/bookingHistoryExport';
import { OptimizedImage } from '../components/common/OptimizedImage';

export const CustomerDashboard = () => {
  const navigate = useNavigate();
  const { user, logout, updateProfile, deleteAccount, showToast } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();

  const [bookings, setBookings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' | 'orders'

  // Dedicated Sheet/Page Navigation States
  const [showHistorySheet, setShowHistorySheet] = useState(false);
  const [showActivitySheet, setShowActivitySheet] = useState(false);

  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState(null);
  const [showProfileSheet, setShowProfileSheet] = useState(false);
  const [showAiSheet, setShowAiSheet] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEnlargedAvatar, setShowEnlargedAvatar] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [walletBalance, setWalletBalance] = useState(user?.walletBalance ?? 0);

  const [profileForm, setProfileForm] = useState({
    firstname: user?.firstname || '',
    lastname: user?.lastname || '',
    phone: user?.phone || '',
    avatarUrl: user?.avatarUrl || '',
  });

  const [location, setLocation] = useState({
    state: user?.state || 'Lagos',
    lga: user?.lga || 'Ikeja',
    street: user?.street || '',
    houseNumber: user?.houseNumber || '',
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, WEBP).', 'error');
      return;
    }
    const previewUrl = URL.createObjectURL(file);
    setProfileForm((prev) => ({ ...prev, avatarUrl: previewUrl }));
    setUploadingPhoto(true);
    try {
      const url = await uploadToCloudinary(file);
      setProfileForm((prev) => ({ ...prev, avatarUrl: url }));
      await updateProfile({ avatarUrl: url });
      showToast('Profile photo updated & saved!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to upload photo. Please try again.', 'error');
      setProfileForm((prev) => ({ ...prev, avatarUrl: user?.avatarUrl || '' }));
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    try {
      await deleteAccount();
      setShowDeleteModal(false);
      navigate('/', { replace: true });
    } catch (err) {
      showToast(err.message || 'Failed to delete account', 'error');
    } finally {
      setDeletingAccount(false);
    }
  };

  const handleDownloadHistory = () => {
    if (bookings.length === 0) {
      showToast('No booking history available to download.', 'error');
      return;
    }
    const success = downloadBookingHistoryCSV(bookings, `Customer_Booking_History_${user?.firstname || 'VIP'}.csv`);
    printBookingHistoryReport(bookings, `${user?.firstname || 'Customer'}'s Booking History Statement`);
    if (success) showToast('Booking history downloaded & printable statement opened!', 'success');
  };

  const handleClearHistory = async () => {
    if (bookings.length === 0) {
      showToast('No booking history to clear.', 'accent');
      return;
    }
    if (!window.confirm('Are you sure you want to clear and delete all your booking history?')) return;
    try {
      setLoading(true);
      await api.clearBookingHistory();
      setBookings([]);
      showToast('All booking history cleared successfully.', 'success');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = async (orderId, trackingStatus) => {
    const shipped = ['shipped', 'out for delivery', 'delivered'].includes(
      (trackingStatus || '').toLowerCase()
    );
    if (shipped) {
      showToast('This order has already shipped and cannot be deleted.', 'error');
      return;
    }
    if (!window.confirm('Delete this order? This cannot be undone.')) return;
    try {
      await api.deleteOrder(orderId);
      setOrders((prev) => prev.filter((o) => o._id !== orderId));
      showToast('Order deleted successfully.', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to delete order.', 'error');
    }
  };

  const [reviewModalBooking, setReviewModalBooking] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewModalBooking) return;
    setSubmittingReview(true);
    try {
      await api.postReview({
        bookingId: reviewModalBooking._id,
        stylistName: reviewModalBooking.stylist,
        serviceName: reviewModalBooking.service,
        rating: reviewRating,
        comment: reviewComment.trim(),
      });
      showToast(`Thank you! Your ${reviewRating}-star review for ${reviewModalBooking.stylist} has been posted. ⭐`, 'success');
      setReviewModalBooking(null);
      setReviewComment('');
    } catch (err) {
      showToast(err.message || 'Failed to submit review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bookingsResult, ordersResult, walletResult] = await Promise.allSettled([
        api.getBookings(),
        api.getOrders(),
        api.getWalletBalance(),
      ]);
      if (bookingsResult.status === 'fulfilled') {
        setBookings(Array.isArray(bookingsResult.value) ? bookingsResult.value : []);
      }
      if (ordersResult.status === 'fulfilled') {
        setOrders(Array.isArray(ordersResult.value) ? ordersResult.value : []);
      }
      if (walletResult.status === 'fulfilled') {
        setWalletBalance(walletResult.value.walletBalance ?? 0);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (user) {
      setProfileForm({
        firstname: user.firstname || '',
        lastname: user.lastname || '',
        phone: user.phone || '',
        avatarUrl: user.avatarUrl || '',
      });
      setLocation({
        state: user.state || 'Lagos',
        lga: user.lga || 'Ikeja',
        street: user.street || '',
        houseNumber: user.houseNumber || '',
      });
    }
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateProfile({
        ...profileForm,
        state: location.state,
        lga: location.lga,
        street: location.street.trim(),
        houseNumber: location.houseNumber.trim(),
      });
      setShowProfileSheet(false);
    } catch (err) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  // Stats
  const completedCount = bookings.filter((b) => b.status === 'completed').length;
  // Only DELIVERED orders earn points — placing an order alone doesn't count
  const deliveredOrdersCount = orders.filter(
    (o) => o.trackingStatus === 'delivered' || o.status === 'delivered'
  ).length;
  // Harder tier: 100pts/completed booking, 45pts/delivered order, 150pt welcome bonus
  // First voucher requires ~25 completed bookings or a mix of ~28+ total actions
  const LOYALTY_TIER_SIZE = 3000;
  const rewardPoints = (completedCount * 100) + (deliveredOrdersCount * 45);
  const pointsToNextReward = LOYALTY_TIER_SIZE - (rewardPoints % LOYALTY_TIER_SIZE);
  const tiersEarned = Math.floor(rewardPoints / LOYALTY_TIER_SIZE);

  // Nearest upcoming appointment for prominent countdown display
  const upcomingBooking = bookings
    .filter(b => ['confirmed', 'accepted', 'pending'].includes((b.status || '').toLowerCase()))
    .sort((a, b) => new Date(a.date || a.createdAt) - new Date(b.date || b.createdAt))[0];

  // Section label style helper
  const sectionLabel = {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    marginBottom: '0.85rem',
  };
  const sectionTitle = {
    fontFamily: 'var(--font-heading)', fontSize: '0.78rem', fontWeight: 700,
    color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em',
  };
  const sectionIcon = (bg, color) => ({
    width: '26px', height: '26px', borderRadius: '8px',
    background: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center',
  });

  return (
    <PageContainer title="Style Corner" onOpenAiMatcher={() => setShowAiSheet(true)}>
      <div style={{ maxWidth: '480px', margin: '0 auto', paddingBottom: '3rem' }}>

        {/* ── Greeting Header with Theme Switcher ── */}
        <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-primary)', margin: '0 0 0.2rem', letterSpacing: '-0.02em' }}>
              {(() => {
                const hour = new Date().getHours();
                const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
                const name = user?.firstname || user?.email?.split('@')[0] || 'there';
                return `${greeting}, ${name} 👋`;
              })()}
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.82rem', margin: 0 }}>
              Here's what's happening with your Style Corner.
            </p>
          </div>

          <button
            onClick={toggleTheme}
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '20px',
              padding: '0.35rem 0.65rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              color: 'var(--color-text-secondary)',
              fontSize: '0.72rem',
              fontFamily: 'var(--font-heading)',
              fontWeight: 600,
              cursor: 'pointer',
              flexShrink: 0,
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            {isDark ? <Sun size={13} color="var(--color-accent)" /> : <Moon size={13} color="var(--color-accent)" />}
            <span>{isDark ? 'Light' : 'Dark'}</span>
          </button>
        </div>


        {/* ── Upcoming Appointment Card (Real Data & Live Status Sync) ── */}
        {(() => {
          const upcoming = bookings.find((b) => b.status === 'pending' || b.status === 'accepted' || b.status === 'confirmed');
          if (upcoming) {
            const isPending = upcoming.status === 'pending';
            const isAccepted = upcoming.status === 'accepted' || upcoming.status === 'confirmed';

            return (
              <div
                style={{
                  background: isPending
                    ? 'linear-gradient(135deg, rgba(245, 185, 66, 0.08) 0%, var(--color-surface) 100%)'
                    : 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, var(--color-surface) 100%)',
                  borderRadius: '22px',
                  padding: '1.25rem',
                  border: `1.5px solid ${isPending ? 'rgba(245, 185, 66, 0.35)' : 'rgba(16, 185, 129, 0.4)'}`,
                  marginBottom: '1.25rem',
                  position: 'relative',
                  boxShadow: 'var(--shadow-md)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: isPending ? '#f5b942' : '#10b981', fontFamily: 'var(--font-heading)', fontSize: '0.8rem', fontWeight: 800 }}>
                    <Calendar size={16} />
                    <span>{isPending ? 'Appointment Request Awaiting Specialist' : 'Confirmed Appointment'}</span>
                  </div>
                  <span
                    style={{
                      background: isPending ? 'rgba(245, 185, 66, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                      color: isPending ? '#f5b942' : '#10b981',
                      border: `1px solid ${isPending ? 'rgba(245, 185, 66, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
                      padding: '0.25rem 0.75rem',
                      borderRadius: '50px',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      fontFamily: 'Outfit',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                    }}
                  >
                    {isPending ? (
                      <>
                        <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#f5b942', animation: 'pulse 1.5s infinite' }} />
                        Awaiting Specialist
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={13} />
                        Specialist Accepted
                      </>
                    )}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.85rem' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.08rem', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '0.2rem', lineHeight: 1.25 }}>
                      {upcoming.service || 'Bespoke Atelier Service'}
                    </div>

                    <p style={{ fontSize: '0.84rem', color: 'var(--color-text-secondary)', margin: '0 0 0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                      <span style={{ color: 'var(--color-text-primary)', fontWeight: 700 }}>
                        {upcoming.date}
                      </span>
                      {upcoming.time && (
                        <>
                          <span>•</span>
                          <span style={{ color: 'var(--color-accent)', fontWeight: 700 }}>{upcoming.time}</span>
                        </>
                      )}
                      <span>•</span>
                      <span>With {upcoming.stylist || 'Verified Specialist'}</span>
                    </p>

                    {upcoming.location && (
                      <div style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <MapPin size={12} color="var(--color-accent)" />
                        <span>{upcoming.location}</span>
                        <span style={{ margin: '0 0.2rem' }}>•</span>
                        <span style={{ fontWeight: 800, color: 'var(--color-accent)' }}>₦{Number(upcoming.price || 0).toLocaleString()}</span>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', alignItems: 'center' }}>
                      <button
                        onClick={() => setShowHistorySheet(true)}
                        style={{
                          background: 'var(--color-card-surface)',
                          border: '1px solid var(--color-border)',
                          color: 'var(--color-text-primary)',
                          borderRadius: '12px',
                          padding: '0.4rem 0.85rem',
                          fontFamily: 'var(--font-heading)',
                          fontSize: '0.76rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Session Details
                      </button>

                      {isAccepted && upcoming.stylist && (
                        <a
                          href={`https://wa.me/?text=${encodeURIComponent(`Hello ${upcoming.stylist}, I have a booking with you for ${upcoming.service} on ${upcoming.date} at ${upcoming.time} via Style Corner.`)}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            background: 'rgba(34, 197, 94, 0.15)',
                            border: '1px solid rgba(34, 197, 94, 0.4)',
                            color: '#4ade80',
                            borderRadius: '12px',
                            padding: '0.4rem 0.85rem',
                            fontFamily: 'var(--font-heading)',
                            fontSize: '0.76rem',
                            fontWeight: 800,
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                          }}
                        >
                          <MessageSquare size={13} /> Chat Specialist
                        </a>
                      )}
                    </div>
                  </div>

                  <div
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '18px',
                      overflow: 'hidden',
                      backgroundColor: 'var(--color-card-surface)',
                      flexShrink: 0,
                      border: '2px solid var(--color-border)',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    <Avatar
                      src={upcoming.stylistImage}
                      name={upcoming.stylist || 'Stylist'}
                      size={60}
                      borderRadius="18px"
                      style={{ width: '100%', height: '100%' }}
                    />
                  </div>
                </div>
              </div>
            );
          }
          return (
            <div
              style={{
                background: 'var(--color-surface)',
                borderRadius: '20px',
                padding: '1.15rem',
                border: '1px solid var(--color-border)',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-heading)', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                  <Calendar size={15} color="var(--color-accent)" />
                  <span>Appointments</span>
                </div>
                <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.94rem', fontWeight: 700, color: 'var(--color-text-primary)', margin: '0 0 0.35rem' }}>
                  No upcoming appointments
                </h4>
                <button
                  onClick={() => navigate('/booking')}
                  style={{
                    background: 'var(--color-accent)',
                    color: '#0c0e14',
                    border: 'none',
                    borderRadius: '50px',
                    padding: '0.45rem 1rem',
                    fontFamily: 'var(--font-heading)',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Book a Service
                </button>
              </div>
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '16px',
                  backgroundColor: 'var(--color-accent-soft)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-accent)',
                  flexShrink: 0,
                }}
              >
                <Scissors size={22} />
              </div>
            </div>
          );
        })()}



        {/* ── Beauty Store Promo Banner ── */}
        <div
          onClick={() => navigate('/store')}
          style={{
            background: 'var(--color-surface)',
            borderRadius: '20px',
            padding: '1.15rem 1.25rem',
            border: '1px solid var(--color-border)',
            marginBottom: '1rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', borderRadius: '50%', background: 'var(--color-accent-soft)', pointerEvents: 'none' }} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
              <ShoppingBag size={14} color="var(--color-accent)" />
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Beauty Store</span>
            </div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.98rem', fontWeight: 700, color: 'var(--color-text-primary)', margin: '0 0 0.2rem' }}>Hair, Nails & Grooming</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', margin: 0 }}>Shop premium beauty products &rarr;</p>
          </div>
          <div style={{
            width: '46px', height: '46px', borderRadius: '14px',
            background: 'var(--color-accent-soft)', border: '1px solid var(--color-border-accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Sparkles size={20} color="var(--color-accent)" />
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            SECTION 2 — STATS TILES
        ══════════════════════════════════════════════ */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={sectionLabel}>
            <div style={sectionIcon('var(--color-accent-soft)', 'var(--color-accent)')}><Star size={13} /></div>
            <span style={sectionTitle}>Overview</span>
          </div>
          <div className="dashboard-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.65rem' }}>
            {[
              { label: 'Bookings', value: bookings.length, color: 'var(--color-accent)', icon: Calendar, action: () => setShowHistorySheet(true) },
              { label: 'Orders', value: orders.length, color: '#38bdf8', icon: ShoppingBag, action: () => { setActiveTab('orders'); setShowHistorySheet(true); } },
              { label: 'Completed', value: completedCount, color: '#10b981', icon: CheckCircle, action: () => setShowHistorySheet(true) },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  onClick={stat.action}
                  style={{
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '18px',
                    padding: '0.9rem 0.5rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'transform 0.15s ease',
                  }}
                >
                  <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '26px', borderRadius: '50%', background: 'var(--color-card-surface)', color: stat.color, marginBottom: '0.35rem' }}>
                    <Icon size={13} />
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: 800, color: stat.color, lineHeight: 1,
                  }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: '0.68rem', fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--color-text-secondary)', marginTop: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>


        {/* ══════════════════════════════════════════════
            SECTION 3 — CATEGORIES
        ══════════════════════════════════════════════ */}
        <div style={{
          background: 'var(--color-surface)',
          borderRadius: '22px',
          padding: '1.1rem 1rem',
          marginBottom: '1rem',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>
              Categories
            </h3>
            <button
              onClick={() => navigate('/services')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-accent)',
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              View all &gt;
            </button>
          </div>

          <div
            className="filter-pills-scroll"
            style={{
              display: 'flex',
              gap: '0.75rem',
              overflowX: 'auto',
              paddingBottom: '0.4rem',
              scrollbarWidth: 'none'
            }}
          >
            {[
              {
                label: 'Barber',
                service: 'Barber',
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 3h10v3H7z" />
                    <path d="M9 6v15M15 6v15" />
                    <path d="M5 21h14" />
                    <circle cx="12" cy="11" r="2" />
                  </svg>
                )
              },
              {
                label: 'Hair',
                service: 'Hair Stylist (Braider)',
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19c2.5-4 4.5-9 4.5-14a4 4 0 0 1 8 0c0 5 2 10 4.5 14" />
                    <path d="M9 14c1.5 2 4.5 2 6 0" />
                    <path d="M12 5v4" />
                  </svg>
                )
              },
              {
                label: 'Nails',
                service: 'Nail Tech',
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 3h6a2 2 0 0 1 2 2v13a4 4 0 0 1-4 4h-2a4 4 0 0 1-4-4V5a2 2 0 0 1 2-2z" />
                    <path d="M9 9h6" />
                    <path d="M12 3v3" />
                  </svg>
                )
              },
              {
                label: 'Lashes',
                service: 'Lash Tech',
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 10s3.5 4 10 4 10-4 10-4" />
                    <path d="M4 11l-2 3" />
                    <path d="M8 13.5l-1.5 3.5" />
                    <path d="M12 14v4" />
                    <path d="M16 13.5l1.5 3.5" />
                    <path d="M20 11l2 3" />
                  </svg>
                )
              },
              {
                label: 'Makeup',
                service: 'Makeup Artist',
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 3l4 4-2 7H7l-2-7 4-4z" />
                    <path d="M7 14v7h4v-7" />
                    <circle cx="17" cy="7" r="3" />
                    <path d="M19 10l2 11h-4l1-11" />
                  </svg>
                )
              },
              {
                label: 'Wigs',
                service: 'Wig Installer',
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3c-4.97 0-9 4.03-9 9 0 3.5 2 6.5 5 8" />
                    <path d="M12 3c4.97 0 9 4.03 9 9 0 3.5-2 6.5-5 8" />
                    <path d="M8 12c1.5-1 3-1.5 4-1.5s2.5.5 4 1.5" />
                    <path d="M9 16c1-0.5 2-0.8 3-0.8s2 0.3 3 0.8" />
                  </svg>
                )
              },
              {
                label: 'Manicure',
                service: 'Manicure',
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="7" y="2" width="10" height="20" rx="5" />
                    <path d="M7 8h10" />
                    <path d="M10 2v3" />
                    <path d="M14 2v3" />
                  </svg>
                )
              },
              {
                label: 'Pedicure',
                service: 'Pedicure',
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 16c0 4 3.5 5 8 5s8-1 8-5c0-4-3-8-8-12-5 4-8 8-8 12z" />
                    <circle cx="8" cy="15" r="1" />
                    <circle cx="12" cy="14" r="1" />
                    <circle cx="16" cy="15" r="1" />
                  </svg>
                )
              },
            ].map((cat) => (
              <div
                key={cat.label}
                onClick={() => navigate(`/booking?service=${encodeURIComponent(cat.service)}`)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.45rem',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
              >
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '16px',
                    background: 'var(--color-card-surface)',
                    border: '1px solid var(--color-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-accent)',
                    transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.borderColor = 'var(--color-accent)';
                    e.currentTarget.style.boxShadow = '0 6px 18px var(--color-accent-soft)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = '';
                    e.currentTarget.style.borderColor = 'var(--color-border)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                  }}
                >
                  {cat.icon}
                </div>
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.74rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>
                  {cat.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            SECTION 4 — QUICK ACTION SHORTCUTS
        ══════════════════════════════════════════════ */}
        <div style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: '22px',
          padding: '1.1rem',
          marginBottom: '1rem',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={sectionLabel}>
            <div style={sectionIcon('var(--color-accent-soft)', 'var(--color-accent)')}><Sparkles size={13} /></div>
            <span style={sectionTitle}>Quick Shortcuts</span>
          </div>

          <div className="dashboard-quick-actions" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
            {[
              {
                icon: <History size={20} />, label: 'My Bookings',
                sub: `${bookings.length} visits & orders`,
                iconColor: 'var(--color-accent)', action: () => setShowHistorySheet(true),
              },
              {
                icon: <Activity size={20} />, label: 'Recent Activity',
                sub: 'Live activity timeline',
                iconColor: '#10b981', action: () => setShowActivitySheet(true),
              },
              {
                icon: <Calendar size={20} />, label: 'Book a Visit',
                sub: 'Hair, Nails, Braids',
                iconColor: 'var(--color-accent)', action: () => navigate('/booking'),
              },
              {
                icon: <Sparkles size={20} />, label: 'AI Matcher',
                sub: 'Find matched artist',
                iconColor: 'var(--color-accent)', action: () => setShowAiSheet(true),
              },
              {
                icon: <Truck size={20} />, label: 'Track Delivery',
                sub: 'Order status & items',
                iconColor: '#38bdf8',
                action: () => {
                  if (orders.length > 0) setSelectedOrderForTracking(orders[0]);
                  else { showToast('No active orders. Visit the store first.', 'accent'); navigate('/store'); }
                },
              },
              {
                icon: <ShoppingBag size={20} />, label: 'Visit Store',
                sub: 'Beauty & hair care',
                iconColor: '#ec4899', action: () => navigate('/store'),
              },
            ].map((item) => (
              <button
                key={item.label}
                onClick={item.action}
                style={{
                  background: 'var(--color-card-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '16px',
                  padding: '0.95rem 0.85rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.45rem',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                  minHeight: '94px',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
              >
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  background: 'var(--color-surface)',
                  color: item.iconColor,
                  border: '1px solid var(--color-border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {item.icon}
                </div>
                <div>
                  <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.86rem', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>
                    {item.label}
                  </h4>
                  <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', margin: '0.15rem 0 0' }}>
                    {item.sub}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            SECTION 5 — ACCOUNT SETTINGS
        ══════════════════════════════════════════════ */}
        <div style={{
          background: '#151822', border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: '22px', padding: '1.1rem',
        }}>
          <div style={sectionLabel}>
            <div style={sectionIcon('rgba(239,68,68,0.15)', '#ef4444')}><AlertTriangle size={13} /></div>
            <span style={{ ...sectionTitle, color: '#94a3b8' }}>Account Settings</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <button
              onClick={logout}
              className="app-btn app-btn-outline"
              style={{ justifyContent: 'center', gap: '0.4rem', minHeight: '46px', borderRadius: '14px', fontSize: '0.85rem' }}
            >
              <LogOut size={15} /> Sign Out of Account
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="app-btn"
              style={{
                background: 'rgba(239,68,68,0.07)', color: '#ef4444',
                border: '1px solid rgba(239,68,68,0.22)',
                justifyContent: 'center', gap: '0.4rem', minHeight: '46px', borderRadius: '14px', fontSize: '0.85rem',
              }}
            >
              <Trash2 size={15} /> Delete My Account
            </button>
          </div>
        </div>

      </div>

      {/* ═══ DEDICATED FULL-PAGE BOTTOM SHEETS FOR MY HISTORY & RECENT ACTIVITY ═══ */}

      {/* ── 1. DEDICATED MY HISTORY & BOOKINGS PAGE SHEET ── */}
      <BottomSheet
        isOpen={showHistorySheet}
        onClose={() => setShowHistorySheet(false)}
        title="My History & Bookings"
      >
        <div style={{ paddingBottom: '1rem', maxWidth: '100%', overflow: 'hidden' }}>

          {/* Export & Clear Actions Toolbar */}
          <div className="history-toolbar" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={handleDownloadHistory}
              style={{
                flex: '1 1 auto', minWidth: '120px', background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.35)',
                color: '#b5952f', padding: '0.6rem 0.5rem', borderRadius: '12px',
                fontFamily: 'Outfit', fontWeight: 800, fontSize: '0.75rem',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem',
                minHeight: '42px',
              }}
            >
              <Download size={14} /> Export CSV
            </button>
            <button
              onClick={handleClearHistory}
              style={{
                flex: '1 1 auto', minWidth: '120px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
                color: '#ef4444', padding: '0.6rem 0.5rem', borderRadius: '12px',
                fontFamily: 'Outfit', fontWeight: 800, fontSize: '0.75rem',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem',
                minHeight: '42px',
              }}
            >
              <Trash2 size={14} /> Clear History
            </button>
          </div>

          {/* Tab Switcher */}
          <div style={{
            display: 'flex', background: '#1c202d',
            borderRadius: '14px', padding: '4px', gap: '4px', marginBottom: '1.1rem',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            {[
              { id: 'bookings', label: 'Appointments', icon: <Calendar size={14} />, count: bookings.length },
              { id: 'orders', label: 'Orders', icon: <ShoppingBag size={14} />, count: orders.length },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1, padding: '0.6rem', borderRadius: '11px', border: 'none',
                  fontFamily: 'Outfit', fontWeight: 800, fontSize: '0.82rem',
                  cursor: 'pointer', transition: 'all 0.2s ease',
                  background: activeTab === tab.id ? '#151822' : 'transparent',
                  color: activeTab === tab.id ? '#ffffff' : '#64748b',
                  boxShadow: activeTab === tab.id ? '0 2px 10px rgba(0,0,0,0.3)' : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
                }}
              >
                {tab.icon}
                {tab.label}
                <span style={{
                  background: activeTab === tab.id ? 'rgba(245,185,66,0.2)' : 'rgba(255,255,255,0.08)',
                  color: activeTab === tab.id ? '#f5b942' : '#64748b',
                  borderRadius: '50px', padding: '0 0.4rem', fontSize: '0.7rem', fontWeight: 900,
                }}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* ── APPOINTMENTS TAB ── */}
          {activeTab === 'bookings' && (
            <div>
              {loading ? (
                <SkeletonList count={2} />
              ) : bookings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
                  <Calendar size={40} color="#e5e7eb" style={{ marginBottom: '0.75rem' }} />
                  <h4 style={{ fontFamily: 'Outfit', fontSize: '1rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.4rem' }}>
                    No Bookings Yet
                  </h4>
                  <p style={{ color: '#9ca3af', fontSize: '0.82rem', marginBottom: '1.25rem' }}>
                    Book your first visit — hair cuts, braids, or nails.
                  </p>
                  <button onClick={() => { setShowHistorySheet(false); navigate('/booking'); }} className="app-btn app-btn-primary"
                    style={{ maxWidth: '160px', margin: '0 auto', minHeight: '40px', fontSize: '0.82rem' }}>
                    Book Now
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {bookings.map((b) => (
                    <div key={b._id} style={{
                      border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px',
                      padding: '0.9rem', background: '#151822', overflow: 'hidden',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.55rem', gap: '0.4rem', flexWrap: 'wrap' }}>
                        <div style={{ flex: '1 1 0%', minWidth: 0 }}>
                          <h4 style={{ fontFamily: 'Outfit', fontSize: '0.92rem', fontWeight: 800, color: '#ffffff', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {b.service}
                          </h4>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem', fontSize: '0.72rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <Sparkles size={10} color="#d4af37" style={{ flexShrink: 0 }} />
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Specialist: <strong style={{ color: '#94a3b8' }}>{b.stylist}</strong></span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem', flexShrink: 0 }}>
                          <StatusBadge status={b.status} />
                          <span style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: '0.92rem', color: '#b5952f', whiteSpace: 'nowrap' }}>
                            ₦{Number(b.price).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '0.35rem',
                        background: 'rgba(245,185,66,0.08)', border: '1px solid rgba(245,185,66,0.18)',
                        borderRadius: '10px', padding: '0.45rem 0.65rem', marginBottom: '0.55rem',
                        fontSize: '0.75rem', color: '#ffffff', fontWeight: 700, overflow: 'hidden',
                      }}>
                        <Clock size={12} color="#d4af37" style={{ flexShrink: 0 }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.date} at {b.time}</span>
                      </div>

                      {b.status === 'accepted' && (
                        <div style={{ padding: '0.4rem 0.65rem', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '10px', fontSize: '0.72rem', color: '#10b981', fontWeight: 700, marginBottom: '0.45rem' }}>
                          ✓ Accepted by {b.stylist}
                        </div>
                      )}
                      {b.status === 'completed' && (
                        <div style={{ padding: '0.4rem 0.65rem', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '10px', fontSize: '0.72rem', color: '#10b981', fontWeight: 700, marginBottom: '0.45rem' }}>
                          ✓ Service rendered successfully
                        </div>
                      )}

                      {b.status !== 'rejected' && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                          {b.status === 'completed' && (
                            <button
                              onClick={() => {
                                setReviewModalBooking(b);
                                setReviewRating(5);
                                setReviewComment('');
                              }}
                              style={{
                                background: 'rgba(212,175,55,0.15)',
                                border: '1px solid rgba(212,175,55,0.4)',
                                color: '#b5952f',
                                minHeight: '34px', width: 'auto', fontSize: '0.75rem', padding: '0.35rem 0.8rem', borderRadius: '10px',
                                fontFamily: 'Outfit', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem'
                              }}
                            >
                              <Star size={11} fill="#b5952f" /> Rate Specialist
                            </button>
                          )}
                          <button
                            onClick={() => { setShowHistorySheet(false); navigate(`/booking?stylist=${encodeURIComponent(b.stylist)}&service=${encodeURIComponent(b.service)}`); }}
                            className="app-btn app-btn-outline"
                            style={{ minHeight: '34px', width: 'auto', fontSize: '0.75rem', padding: '0.35rem 0.8rem', borderRadius: '10px' }}
                          >
                            <RefreshCw size={11} /> Rebook
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── ORDERS TAB ── */}
          {activeTab === 'orders' && (
            <div>
              {loading ? (
                <SkeletonList count={2} />
              ) : orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
                  <ShoppingBag size={40} color="#e5e7eb" style={{ marginBottom: '0.75rem' }} />
                  <h4 style={{ fontFamily: 'Outfit', fontSize: '1rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.4rem' }}>
                    No Orders Yet
                  </h4>
                  <p style={{ color: '#9ca3af', fontSize: '0.82rem', marginBottom: '1.25rem' }}>
                    Shop hair products, beard kits, and more.
                  </p>
                  <button onClick={() => { setShowHistorySheet(false); navigate('/store'); }} className="app-btn app-btn-accent"
                    style={{ maxWidth: '160px', margin: '0 auto', minHeight: '40px', fontSize: '0.82rem' }}>
                    Browse Store
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {orders.map((o) => (
                    <div key={o._id} style={{
                      border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px',
                      padding: '0.9rem', background: '#151822', overflow: 'hidden',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.55rem', gap: '0.4rem', flexWrap: 'wrap' }}>
                        <div style={{ flex: '1 1 0%', minWidth: 0 }}>
                          <h4 style={{ fontFamily: 'Outfit', fontSize: '0.92rem', fontWeight: 800, color: '#ffffff', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {o.item || 'Grooming Product'}
                          </h4>
                          <p style={{ color: '#64748b', fontSize: '0.7rem', margin: '0.15rem 0 0' }}>
                            Order #{String(o._id).slice(-6).toUpperCase()}
                          </p>
                          {o.address && (
                            <p style={{ color: '#6b7280', fontSize: '0.7rem', marginTop: '0.15rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              📍 {o.address}
                            </p>
                          )}
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <StatusBadge status={o.trackingStatus || o.status || 'processing'} />
                          <div style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: '0.95rem', color: '#171717', marginTop: '0.25rem', whiteSpace: 'nowrap' }}>
                            ₦{Number(o.totalPrice || o.price || 0).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.55rem', display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => { setShowHistorySheet(false); setSelectedOrderForTracking(o); }}
                          className="app-btn app-btn-accent"
                          style={{ flex: 1, minHeight: '38px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                        >
                          <Truck size={14} /> Track Delivery
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(o._id, o.trackingStatus || o.status)}
                          style={{
                            background: 'rgba(239,68,68,0.08)',
                            border: '1px solid rgba(239,68,68,0.25)',
                            color: '#ef4444',
                            borderRadius: '10px',
                            minHeight: '38px',
                            padding: '0 0.75rem',
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.2s ease',
                          }}
                          title="Delete order"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </BottomSheet>

      {/* ── 2. DEDICATED RECENT ACTIVITY STREAM PAGE SHEET ── */}
      <BottomSheet
        isOpen={showActivitySheet}
        onClose={() => setShowActivitySheet(false)}
        title="Recent Activity Stream"
      >
        <div style={{ paddingBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.82rem', color: '#6b7280', marginBottom: '1rem' }}>
            Live stream timeline of all your recent visits, appointments, and store orders.
          </p>

          {bookings.length === 0 && orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#9ca3af', fontSize: '0.85rem' }}>
              No recent activity found. Book a visit or order products to build your stream!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                ...bookings.map(b => ({
                  type: 'booking', icon: <Calendar size={16} />,
                  title: b.service || 'Grooming Service',
                  sub: `${b.date || ''} @ ${b.time || ''} · Specialist: ${b.stylist || 'VIP Expert'}`,
                  status: b.status, date: b.createdAt || new Date().toISOString(),
                  iconBg: 'rgba(212,175,55,0.15)', iconColor: '#d4af37',
                })),
                ...orders.map(o => ({
                  type: 'order', icon: <ShoppingBag size={16} />,
                  title: o.item || `Store Order #${String(o._id).slice(-6).toUpperCase()}`,
                  sub: `Total: ₦${Number(o.totalPrice || o.price || 0).toLocaleString()} · Tracking: ${o.trackingStatus || o.status || 'Processing'}`,
                  status: o.status || 'processing', date: o.createdAt || new Date().toISOString(),
                  iconBg: 'rgba(16,185,129,0.12)', iconColor: '#10b981',
                })),
              ]
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((item, idx) => (
                  <div key={idx} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.7rem 0.75rem', borderRadius: '14px',
                    background: '#151822', border: '1px solid rgba(255,255,255,0.08)',
                    gap: '0.5rem', overflow: 'hidden',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: '1 1 0%', minWidth: 0, overflow: 'hidden' }}>
                      <div style={{
                        width: '36px', height: '36px', minWidth: '36px', borderRadius: '10px',
                        background: item.iconBg, color: item.iconColor, flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {item.icon}
                      </div>
                      <div style={{ minWidth: 0, overflow: 'hidden' }}>
                        <div style={{
                          fontFamily: 'Outfit', fontSize: '0.82rem', fontWeight: 800, color: '#ffffff',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>{item.title}</div>
                        <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '0.1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.sub}</div>
                      </div>
                    </div>
                    <div style={{ flexShrink: 0 }}>
                      <StatusBadge status={item.status} />
                    </div>
                  </div>
                ))
              }
            </div>
          )}
        </div>
      </BottomSheet>

      {/* Profile Edit Sheet */}
      <BottomSheet isOpen={showProfileSheet} onClose={() => setShowProfileSheet(false)} title="Edit Profile">
        <form onSubmit={handleProfileSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.25rem', gap: '0.75rem' }}>
            <label htmlFor="customer-avatar-upload" style={{ cursor: uploadingPhoto ? 'wait' : 'pointer', position: 'relative', display: 'inline-block' }}>
              <div style={{
                width: '94px', height: '94px', borderRadius: '50%',
                background: profileForm.avatarUrl ? `url(${profileForm.avatarUrl}) center/cover no-repeat` : 'linear-gradient(135deg, #d4af37, #b5952f)',
                border: '3px solid #d4af37', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '2.2rem', fontFamily: 'Outfit', fontWeight: 900, color: '#fff',
                boxShadow: '0 6px 20px rgba(212,175,55,0.3)', position: 'relative', overflow: 'hidden',
              }}>
                {!profileForm.avatarUrl && (profileForm.firstname?.[0]?.toUpperCase() || 'C')}
                {uploadingPhoto ? (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(2px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.2rem' }}>
                    <RefreshCw size={18} color="#d4af37" style={{ animation: 'spin 1s linear infinite' }} />
                    <span style={{ color: '#d4af37', fontSize: '0.65rem', fontFamily: 'Outfit', fontWeight: 800 }}>Saving...</span>
                  </div>
                ) : (
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.45)', padding: '2px 0', display: 'flex', justifyContent: 'center' }}>
                    <Edit size={12} color="#fff" />
                  </div>
                )}
              </div>
            </label>
            <label htmlFor="customer-avatar-upload" style={{
              cursor: uploadingPhoto ? 'not-allowed' : 'pointer',
              background: uploadingPhoto ? 'rgba(212,175,55,0.3)' : 'rgba(212,175,55,0.15)',
              border: '1px solid rgba(212,175,55,0.4)', color: '#d4af37',
              padding: '0.45rem 1.1rem', borderRadius: '50px',
              fontSize: '0.8rem', fontFamily: 'Outfit', fontWeight: 800,
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            }}>
              <Edit size={13} />
              {uploadingPhoto ? 'Uploading...' : profileForm.avatarUrl ? 'Change Photo' : 'Upload Photo'}
            </label>
            <input id="customer-avatar-upload" type="file" accept="image/*" style={{ display: 'none' }} disabled={uploadingPhoto} onChange={handlePhotoChange} />
          </div>

          <div className="app-input-group">
            <label className="app-label">First Name *</label>
            <input type="text" value={profileForm.firstname} onChange={(e) => setProfileForm({ ...profileForm, firstname: e.target.value })} className="app-input" required />
          </div>
          <div className="app-input-group">
            <label className="app-label">Last Name</label>
            <input type="text" value={profileForm.lastname} onChange={(e) => setProfileForm({ ...profileForm, lastname: e.target.value })} className="app-input" />
          </div>
          <div className="app-input-group">
            <label className="app-label">Phone Number</label>
            <input type="tel" value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} className="app-input" />
          </div>

          {/* Delivery Location Section */}
          <div style={{ background: '#faf9f5', borderRadius: '16px', padding: '0.85rem', border: '1px solid rgba(212,175,55,0.3)', marginBottom: '1rem' }}>
            <label className="app-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#171717', fontWeight: 800, marginBottom: '0.65rem' }}>
              Default Delivery Location
            </label>
            <LocationSelector location={location} onChange={setLocation} />
          </div>

          <button type="submit" disabled={savingProfile} className="app-btn app-btn-primary" style={{ marginTop: '0.5rem' }}>
            {savingProfile ? 'Saving Profile & Location...' : 'Save Profile & Location'}
          </button>
        </form>
      </BottomSheet>

      {/* Delete Confirmation Modal */}
      <PopupModal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Account?">
        <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
          <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: 'rgba(239,68,68,0.12)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <AlertTriangle size={28} />
          </div>
          <h4 style={{ fontFamily: 'Outfit', fontSize: '1.1rem', fontWeight: 800, color: '#171717', marginBottom: '0.5rem' }}>
            Permanent Account Deletion
          </h4>
          <p style={{ color: '#6b7280', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
            This will permanently erase your account and all data. This cannot be undone.
          </p>
          <div style={{ display: 'flex', gap: '0.65rem' }}>
            <button onClick={() => setShowDeleteModal(false)} className="app-btn app-btn-outline" style={{ flex: 1 }}>Cancel</button>
            <button onClick={handleDeleteAccount} disabled={deletingAccount} className="app-btn" style={{ flex: 1, background: '#ef4444', color: '#fff', border: 'none' }}>
              {deletingAccount ? 'Deleting...' : 'Delete Permanently'}
            </button>
          </div>
        </div>
      </PopupModal>

      {/* AI Matcher Sheet */}
      <AISpecialistMatcherSheet
        isOpen={showAiSheet}
        onClose={() => setShowAiSheet(false)}
        onApplyMatch={(match) => {
          setShowAiSheet(false);
          const params = new URLSearchParams();
          if (match.stylist) params.append('stylist', match.stylist);
          if (match.service) params.append('service', match.service);
          if (match.location) params.append('location', match.location);
          if (match.stylistId) params.append('stylistId', match.stylistId);
          navigate(`/booking?${params.toString()}`);
        }}
      />

      {/* Avatar Full Size */}
      <ImagePreviewModal isOpen={showEnlargedAvatar} onClose={() => setShowEnlargedAvatar(false)} imageUrl={user?.avatarUrl} title={`${user?.firstname || 'User'}'s Profile Picture`} />

      {/* Order Tracking */}
      <OrderTrackingSheet
        isOpen={!!selectedOrderForTracking}
        onClose={() => setSelectedOrderForTracking(null)}
        order={selectedOrderForTracking}
        onOrderUpdated={(updated) => {
          setOrders(prev => prev.map(o => o._id === updated._id ? updated : o));
          setSelectedOrderForTracking(updated);
        }}
      />

      {/* Rate & Review Specialist Sheet */}
      <BottomSheet
        isOpen={!!reviewModalBooking}
        onClose={() => setReviewModalBooking(null)}
        title="Rate & Review Specialist"
      >
        {reviewModalBooking && (
          <form onSubmit={handleSubmitReview} style={{ paddingBottom: '1rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '0.78rem', fontFamily: 'Outfit', fontWeight: 800, color: '#d4af37', textTransform: 'uppercase' }}>
                {reviewModalBooking.service}
              </span>
              <h3 style={{ fontFamily: 'Outfit', fontSize: '1.15rem', fontWeight: 900, color: '#171717', margin: '0.2rem 0' }}>
                How was your session with {reviewModalBooking.stylist}?
              </h3>
              <p style={{ color: '#6b7280', fontSize: '0.8rem', margin: 0 }}>
                Your feedback helps us maintain verified luxury standards.
              </p>
            </div>

            {/* Star Selection */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setReviewRating(star)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer', padding: '0.2rem',
                    transition: 'transform 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <Star
                    size={32}
                    fill={star <= reviewRating ? '#f59e0b' : 'none'}
                    color={star <= reviewRating ? '#f59e0b' : '#d1d5db'}
                  />
                </button>
              ))}
            </div>

            <div className="app-input-group" style={{ marginBottom: '1.25rem' }}>
              <label className="app-label">Your Experience & Feedback</label>
              <textarea
                rows={3}
                placeholder="Share your thoughts about the hairstyle, nail art, or barbering service..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="app-textarea"
                style={{ width: '100%', padding: '0.65rem', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.12)', fontFamily: 'Outfit', fontSize: '0.85rem' }}
              />
            </div>

            <button
              type="submit"
              disabled={submittingReview}
              className="app-btn app-btn-accent"
              style={{ width: '100%', minHeight: '44px', borderRadius: '14px', fontSize: '0.88rem', fontWeight: 800 }}
            >
              {submittingReview ? 'Submitting Review...' : `Submit ${reviewRating}-Star Review`}
            </button>
          </form>
        )}
      </BottomSheet>
      <WithdrawFundsModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        walletBalance={walletBalance}
        onSuccess={(newBal) => {
          if (updateProfile) updateProfile({ walletBalance: newBal });
        }}
      />
    </PageContainer>
  );
};

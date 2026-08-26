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
  Activity
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { uploadToCloudinary } from '../services/cloudinary';
import { PageContainer } from '../components/common/PageContainer';
import { StatusBadge } from '../components/common/StatusBadge';
import { SkeletonList } from '../components/common/SkeletonLoader';
import { BottomSheet } from '../components/common/BottomSheet';
import { PopupModal } from '../components/common/PopupModal';
import { AISpecialistMatcherSheet } from '../components/booking/AISpecialistMatcherSheet';
import { ImagePreviewModal } from '../components/common/ImagePreviewModal';
import { OrderTrackingSheet } from '../components/store/OrderTrackingSheet';
import { downloadBookingHistoryCSV, printBookingHistoryReport } from '../utils/bookingHistoryExport';

export const CustomerDashboard = () => {
  const navigate = useNavigate();
  const { user, logout, updateProfile, deleteAccount, showToast } = useAuth();

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

  const [profileForm, setProfileForm] = useState({
    firstname: user?.firstname || '',
    lastname: user?.lastname || '',
    phone: user?.phone || '',
    avatarUrl: user?.avatarUrl || '',
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
    } catch (err) {
      showToast(err.message || 'Failed to clear history', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bookingsResult, ordersResult] = await Promise.allSettled([
        api.getBookings(),
        api.getOrders(),
      ]);
      if (bookingsResult.status === 'fulfilled') {
        setBookings(Array.isArray(bookingsResult.value) ? bookingsResult.value : []);
      }
      if (ordersResult.status === 'fulfilled') {
        setOrders(Array.isArray(ordersResult.value) ? ordersResult.value : []);
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
    }
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateProfile(profileForm);
      setShowProfileSheet(false);
    } catch (err) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  // Stats
  const completedCount = bookings.filter((b) => b.status === 'completed').length;
  const rewardPoints = (completedCount * 150) + (orders.length * 80) + 250;
  const pointsToNextReward = 1000 - (rewardPoints % 1000);

  // Section label style helper
  const sectionLabel = {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    marginBottom: '1rem',
  };
  const sectionTitle = {
    fontFamily: 'Outfit', fontSize: '0.78rem', fontWeight: 900,
    color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em',
  };
  const sectionIcon = (bg, color) => ({
    width: '26px', height: '26px', borderRadius: '8px',
    background: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center',
  });

  return (
    <PageContainer title="My Dashboard" onOpenAiMatcher={() => setShowAiSheet(true)}>
      <div style={{ paddingBottom: '2rem' }}>

        {/* ══════════════════════════════════════════════
            SECTION 1 — HERO PROFILE BANNER
        ══════════════════════════════════════════════ */}
        <div
          className="hero-profile-banner"
          style={{
            background: 'linear-gradient(135deg, #111111 0%, #1a1a1a 60%, #0d0d0d 100%)',
            borderRadius: '24px',
            padding: '1.5rem',
            marginBottom: '1rem',
            border: '1.5px solid rgba(212,175,55,0.4)',
            boxShadow: '0 20px 48px rgba(0,0,0,0.22)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Decorative glow */}
          <div style={{
            position: 'absolute', top: '-40px', right: '-40px',
            width: '160px', height: '160px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(212,175,55,0.18) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          {/* Top row: Avatar + Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
            {/* Avatar */}
            <div
              onClick={() => user?.avatarUrl ? setShowEnlargedAvatar(true) : setShowProfileSheet(true)}
              style={{ position: 'relative', flexShrink: 0, cursor: 'pointer' }}
              title={user?.avatarUrl ? 'View full picture' : 'Upload profile picture'}
            >
              <div style={{
                width: '78px', height: '78px', borderRadius: '50%',
                background: user?.avatarUrl
                  ? `url(${user.avatarUrl}) center/cover no-repeat`
                  : 'linear-gradient(135deg, #d4af37, #b5952f)',
                border: '2.5px solid #d4af37',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '2rem', fontFamily: 'Outfit', fontWeight: 900, color: '#fff',
                boxShadow: '0 8px 24px rgba(212,175,55,0.35)',
              }}>
                {!user?.avatarUrl && (user?.firstname?.[0]?.toUpperCase() || 'C')}
              </div>
              <div style={{
                position: 'absolute', bottom: 0, right: 0,
                width: '26px', height: '26px', borderRadius: '50%',
                background: '#d4af37', color: '#111', border: '2px solid #111',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Edit size={11} />
              </div>
            </div>

            {/* Name & badge */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                <h2 className="dashboard-user-name" style={{
                  fontFamily: 'Outfit', fontSize: '1.25rem', fontWeight: 900,
                  color: '#fff', margin: 0, lineHeight: 1.1,
                }}>
                  {user?.firstname} {user?.lastname}
                </h2>
                <ShieldCheck size={15} color="#d4af37" />
              </div>
              <p style={{ color: '#9ca3af', fontSize: '0.78rem', margin: '0.2rem 0 0.6rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.email}
              </p>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                background: 'rgba(212,175,55,0.18)', color: '#d4af37',
                fontSize: '0.68rem', fontFamily: 'Outfit', fontWeight: 800,
                padding: '0.2rem 0.65rem', borderRadius: '50px',
                border: '1px solid rgba(212,175,55,0.35)', textTransform: 'uppercase', letterSpacing: '0.06em',
              }}>
                <Star size={10} fill="#d4af37" /> Style Corner VIP
              </span>
            </div>
          </div>

          {/* Bottom row: Loyalty bar */}
          <div style={{
            background: 'rgba(255,255,255,0.06)', borderRadius: '16px',
            padding: '0.85rem 1rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Award size={14} color="#d4af37" />
                <span style={{ fontFamily: 'Outfit', fontSize: '0.8rem', fontWeight: 800, color: '#d4af37' }}>
                  Loyalty Rewards
                </span>
              </div>
              <span style={{ fontFamily: 'Outfit', fontSize: '1.1rem', fontWeight: 900, color: '#fff' }}>
                {rewardPoints} <span style={{ fontSize: '0.68rem', color: '#9ca3af', fontWeight: 700 }}>PTS</span>
              </span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '50px', height: '6px', overflow: 'hidden', marginBottom: '0.35rem' }}>
              <div style={{
                width: `${Math.min(100, (rewardPoints % 1000) / 10)}%`,
                height: '100%', background: 'linear-gradient(90deg, #d4af37, #f0c040)',
                borderRadius: '50px', transition: 'width 0.6s ease',
              }} />
            </div>
            <p style={{ fontSize: '0.7rem', color: '#6b7280', margin: 0 }}>
              {pointsToNextReward} pts to your next ₦25,000 reward voucher
            </p>
          </div>

          {/* Action row */}
          <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1rem' }}>
            <button
              onClick={() => navigate('/profile')}
              style={{
                flex: 1, background: 'rgba(255,255,255,0.09)',
                border: '1px solid rgba(255,255,255,0.14)', color: '#fff',
                padding: '0.65rem', borderRadius: '14px',
                fontSize: '0.82rem', fontFamily: 'Outfit', fontWeight: 700,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
              }}
            >
              <User size={14} /> My Profile Info
            </button>
            <button
              onClick={logout}
              style={{
                background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
                color: '#f87171', padding: '0.65rem 1.1rem', borderRadius: '14px',
                fontSize: '0.82rem', fontFamily: 'Outfit', fontWeight: 700,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem',
              }}
            >
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            SECTION 2 — STATS TILES
        ══════════════════════════════════════════════ */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={sectionLabel}>
            <div style={sectionIcon('rgba(212,175,55,0.15)', '#d4af37')}><Star size={13} /></div>
            <span style={sectionTitle}>Overview</span>
          </div>
          <div className="dashboard-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.65rem' }}>
            {[
              { label: 'Bookings', value: bookings.length, color: '#d4af37', bg: 'rgba(212,175,55,0.08)', border: 'rgba(212,175,55,0.25)', action: () => setShowHistorySheet(true) },
              { label: 'Orders', value: orders.length, color: '#3b82f6', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.2)', action: () => { setActiveTab('orders'); setShowHistorySheet(true); } },
              { label: 'Completed', value: completedCount, color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)', action: () => setShowHistorySheet(true) },
            ].map((stat) => (
              <div
                key={stat.label}
                onClick={stat.action}
                style={{
                  background: stat.bg, border: `1px solid ${stat.border}`,
                  borderRadius: '18px', padding: '1rem 0.5rem', textAlign: 'center', cursor: 'pointer',
                }}
              >
                <div style={{
                  fontFamily: 'Outfit', fontSize: '2rem', fontWeight: 900, color: stat.color, lineHeight: 1,
                }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: '0.72rem', fontFamily: 'Outfit', fontWeight: 800, color: '#6b7280', marginTop: '0.3rem', textTransform: 'uppercase' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            SECTION 3 — CATEGORIES (MATCHING USER SCREENSHOT)
        ══════════════════════════════════════════════ */}
        <div style={{
          background: '#ffffff',
          borderRadius: '22px',
          padding: '1.1rem 1rem',
          marginBottom: '1rem',
          border: '1px solid rgba(0,0,0,0.06)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
            <h3 style={{ fontFamily: 'Outfit', fontSize: '1.1rem', fontWeight: 800, color: '#171717', margin: 0 }}>
              Categories
            </h3>
            <button
              onClick={() => navigate('/services')}
              style={{
                background: 'none',
                border: 'none',
                color: '#ec4899',
                fontFamily: 'Outfit',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              View all
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
                label: 'Hair',
                service: 'Hair Stylist (Braider)',
                icon: (
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/>
                    <line x1="20" y1="4" x2="8.12" y2="15.88"/>
                    <line x1="14.47" y1="14.48" x2="20" y2="20"/>
                    <line x1="8.12" y1="8.12" x2="12" y2="12"/>
                  </svg>
                ),
                bg: '#FAF5F5'
              },
              {
                label: 'Nails',
                service: 'Nail Tech',
                icon: (
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2v6"/><path d="M6 8h12v10a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8z"/>
                    <path d="M9 2h6"/>
                  </svg>
                ),
                bg: '#FAF5F5'
              },
              {
                label: 'Lashes',
                service: 'Lash Tech',
                icon: (
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/>
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M3 8l-1.5-2"/><path d="M7 5L6 2"/><path d="M12 4V1"/><path d="M17 5l1-3"/><path d="M21 8l1.5-2"/>
                  </svg>
                ),
                bg: '#FAF5F5'
              },
              {
                label: 'Makeup',
                service: 'Makeup Artist',
                icon: (
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2l4 4-10 10H8v-4L18 2z"/><path d="M3 21h6"/>
                    <path d="M15 5l4 4"/>
                  </svg>
                ),
                bg: '#FAF5F5'
              },
              {
                label: 'Wigs',
                service: 'Wig Installer',
                icon: (
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 4l3 12h14l3-12-6 7-4-5-4 5-6-7z"/>
                  </svg>
                ),
                bg: '#FAF5F5'
              },
              {
                label: 'Manicure',
                service: 'Manicure',
                icon: (
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v5"/>
                    <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v6"/>
                    <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"/>
                    <path d="M18 8a2 2 0 0 1 2 2v4a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.8-6-3l-3-4.5a2 2 0 0 1 3.2-2.4l1.8 2.4"/>
                  </svg>
                ),
                bg: '#FAF5F5'
              },
              {
                label: 'Pedicure',
                service: 'Pedicure',
                icon: (
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                ),
                bg: '#FAF5F5'
              },
            ].map((cat) => (
              <div
                key={cat.label}
                onClick={() => navigate(`/booking?service=${encodeURIComponent(cat.service)}`)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.4rem',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
              >
                <div
                  style={{
                    width: '74px',
                    height: '74px',
                    borderRadius: '20px',
                    background: cat.bg,
                    border: '1px solid rgba(236,72,153,0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(236,72,153,0.18)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.03)'; }}
                >
                  {cat.icon}
                </div>
                <span style={{ fontFamily: 'Outfit', fontSize: '0.78rem', fontWeight: 700, color: '#374151' }}>
                  {cat.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            SECTION 4 — QUICK ACTION SHORTCUTS (ICON CARDS)
        ══════════════════════════════════════════════ */}
        <div style={{
          background: '#fff', border: '1px solid rgba(0,0,0,0.07)',
          borderRadius: '22px', padding: '1.1rem', marginBottom: '1rem',
          boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
        }}>
          <div style={sectionLabel}>
            <div style={sectionIcon('#171717', '#d4af37')}><Sparkles size={13} /></div>
            <span style={sectionTitle}>Quick Shortcuts</span>
          </div>

          <div className="dashboard-quick-actions" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {[
              {
                icon: <History size={22} />, label: 'My Bookings History',
                sub: `View ${bookings.length} visits & orders`,
                bg: 'rgba(212,175,55,0.12)', iconBg: '#d4af37', iconColor: '#fff',
                border: 'rgba(212,175,55,0.4)', action: () => setShowHistorySheet(true),
              },
              {
                icon: <Activity size={22} />, label: 'Recent Activity',
                sub: 'Live activity timeline',
                bg: 'rgba(16,185,129,0.08)', iconBg: '#10b981', iconColor: '#fff',
                border: 'rgba(16,185,129,0.3)', action: () => setShowActivitySheet(true),
              },
              {
                icon: <Calendar size={22} />, label: 'Book a Visit',
                sub: 'Hair, Nails, Braids',
                bg: 'rgba(17,24,39,0.04)', iconBg: '#171717', iconColor: '#fff',
                border: 'rgba(17,24,39,0.15)', action: () => navigate('/booking'),
              },
              {
                icon: <Sparkles size={22} />, label: 'AI Matcher',
                sub: 'Find your specialist',
                bg: 'linear-gradient(135deg, #171717, #0d0d0d)', iconBg: '#d4af37', iconColor: '#171717',
                border: 'rgba(212,175,55,0.5)', textColor: '#fff', subColor: '#a1a1aa',
                action: () => setShowAiSheet(true),
              },
              {
                icon: <Truck size={22} />, label: 'Track Delivery',
                sub: 'Order status & details',
                bg: 'rgba(59,130,246,0.08)', iconBg: 'rgba(59,130,246,0.15)', iconColor: '#3b82f6',
                border: 'rgba(59,130,246,0.2)',
                action: () => {
                  if (orders.length > 0) setSelectedOrderForTracking(orders[0]);
                  else { showToast('No active orders. Visit the store first.', 'accent'); navigate('/store'); }
                },
              },
              {
                icon: <ShoppingBag size={22} />, label: 'Visit Store',
                sub: 'Hair & grooming products',
                bg: 'rgba(236,72,153,0.08)', iconBg: 'rgba(236,72,153,0.15)', iconColor: '#ec4899',
                border: 'rgba(236,72,153,0.2)', action: () => navigate('/store'),
              },
            ].map((item) => (
              <button
                key={item.label}
                onClick={item.action}
                style={{
                  background: item.bg, border: `1.5px solid ${item.border}`,
                  borderRadius: '18px', padding: '1.1rem 0.85rem',
                  cursor: 'pointer', textAlign: 'left', display: 'flex',
                  flexDirection: 'column', gap: '0.5rem',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                  minHeight: '102px',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
              >
                <div style={{
                  width: '42px', height: '42px', borderRadius: '12px',
                  background: item.iconBg, color: item.iconColor,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {item.icon}
                </div>
                <div>
                  <div style={{ fontFamily: 'Outfit', fontSize: '0.88rem', fontWeight: 800, color: item.textColor || '#171717', lineHeight: 1.1 }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: item.subColor || '#6b7280', marginTop: '0.15rem', fontWeight: 600 }}>
                    {item.sub}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            SECTION 4 — ACCOUNT SETTINGS
        ══════════════════════════════════════════════ */}
        <div style={{
          background: '#fff', border: '1px solid rgba(239,68,68,0.18)',
          borderRadius: '22px', padding: '1.1rem',
          boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
        }}>
          <div style={sectionLabel}>
            <div style={sectionIcon('rgba(239,68,68,0.1)', '#ef4444')}><AlertTriangle size={13} /></div>
            <span style={sectionTitle}>Account Settings</span>
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
            display: 'flex', background: '#f3f4f6',
            borderRadius: '14px', padding: '4px', gap: '4px', marginBottom: '1.1rem',
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
                  background: activeTab === tab.id ? '#fff' : 'transparent',
                  color: activeTab === tab.id ? '#171717' : '#6b7280',
                  boxShadow: activeTab === tab.id ? '0 2px 10px rgba(0,0,0,0.08)' : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
                }}
              >
                {tab.icon}
                {tab.label}
                <span style={{
                  background: activeTab === tab.id ? '#171717' : 'rgba(0,0,0,0.08)',
                  color: activeTab === tab.id ? '#d4af37' : '#6b7280',
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
                  <h4 style={{ fontFamily: 'Outfit', fontSize: '1rem', fontWeight: 800, color: '#171717', marginBottom: '0.4rem' }}>
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
                      border: '1px solid rgba(0,0,0,0.07)', borderRadius: '16px',
                      padding: '0.9rem', background: '#fafafa', overflow: 'hidden',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.55rem', gap: '0.4rem', flexWrap: 'wrap' }}>
                        <div style={{ flex: '1 1 0%', minWidth: 0 }}>
                          <h4 style={{ fontFamily: 'Outfit', fontSize: '0.92rem', fontWeight: 800, color: '#171717', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {b.service}
                          </h4>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem', fontSize: '0.72rem', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <Sparkles size={10} color="#d4af37" style={{ flexShrink: 0 }} />
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Specialist: <strong style={{ color: '#171717' }}>{b.stylist}</strong></span>
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
                        background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)',
                        borderRadius: '10px', padding: '0.45rem 0.65rem', marginBottom: '0.55rem',
                        fontSize: '0.75rem', color: '#171717', fontWeight: 700, overflow: 'hidden',
                      }}>
                        <Clock size={12} color="#d4af37" style={{ flexShrink: 0 }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.date} at {b.time}</span>
                      </div>

                      {b.status === 'accepted' && (
                        <div style={{ padding: '0.4rem 0.65rem', background: 'rgba(16,185,129,0.09)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '10px', fontSize: '0.72rem', color: '#065f46', fontWeight: 700, marginBottom: '0.45rem' }}>
                          ✓ Accepted by {b.stylist}
                        </div>
                      )}
                      {b.status === 'completed' && (
                        <div style={{ padding: '0.4rem 0.65rem', background: 'rgba(16,185,129,0.09)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '10px', fontSize: '0.72rem', color: '#065f46', fontWeight: 700, marginBottom: '0.45rem' }}>
                          ✓ Service rendered successfully
                        </div>
                      )}

                      {b.status !== 'rejected' && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
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
                  <h4 style={{ fontFamily: 'Outfit', fontSize: '1rem', fontWeight: 800, color: '#171717', marginBottom: '0.4rem' }}>
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
                      border: '1px solid rgba(0,0,0,0.07)', borderRadius: '16px',
                      padding: '0.9rem', background: '#fafafa', overflow: 'hidden',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.55rem', gap: '0.4rem', flexWrap: 'wrap' }}>
                        <div style={{ flex: '1 1 0%', minWidth: 0 }}>
                          <h4 style={{ fontFamily: 'Outfit', fontSize: '0.92rem', fontWeight: 800, color: '#171717', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {o.item || 'Grooming Product'}
                          </h4>
                          <p style={{ color: '#9ca3af', fontSize: '0.7rem', margin: '0.15rem 0 0' }}>
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
                      <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '0.55rem' }}>
                        <button
                          onClick={() => { setShowHistorySheet(false); setSelectedOrderForTracking(o); }}
                          className="app-btn app-btn-accent"
                          style={{ width: '100%', minHeight: '38px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                        >
                          <Truck size={14} /> Track Delivery & Details
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
                    background: '#fafafa', border: '1px solid rgba(0,0,0,0.06)',
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
                          fontFamily: 'Outfit', fontSize: '0.82rem', fontWeight: 800, color: '#171717',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>{item.title}</div>
                        <div style={{ fontSize: '0.68rem', color: '#6b7280', marginTop: '0.1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.sub}</div>
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
          <button type="submit" disabled={savingProfile} className="app-btn app-btn-primary" style={{ marginTop: '0.5rem' }}>
            {savingProfile ? 'Saving...' : 'Save Changes'}
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
          navigate(`/booking?stylist=${encodeURIComponent(match.firstname)}`);
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
    </PageContainer>
  );
};

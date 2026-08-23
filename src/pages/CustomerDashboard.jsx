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
  MessageSquare
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
import { downloadBookingHistoryCSV } from '../utils/bookingHistoryExport';

export const CustomerDashboard = () => {
  const navigate = useNavigate();
  const { user, logout, updateProfile, deleteAccount, showToast } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' | 'orders'

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

    // Instant local preview
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
      // Reset back to user's saved avatar if upload failed
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
    if (success) showToast('Booking history downloaded successfully!', 'success');
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

  useEffect(() => {
    fetchData();
  }, []);

  // Sync profileForm when user data loads from server
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

  // Calculate stats
  const completedCount = bookings.filter((b) => b.status === 'completed').length;
  const rewardPoints = (completedCount * 150) + (orders.length * 80) + 250; // Welcome points
  const pointsToNextReward = 1000 - (rewardPoints % 1000);

  return (
    <PageContainer title="My Dashboard" onOpenAiMatcher={() => setShowAiSheet(true)}>
      <div>

        {/* ── Executive Profile Header Card ── */}
        <div
          className="app-card"
          style={{
            background: 'linear-gradient(135deg, #1f1f1f 0%, #121212 100%)',
            color: '#ffffff',
            border: '1.5px solid rgba(212, 175, 55, 0.45)',
            padding: '1.5rem 1.25rem',
            borderRadius: '24px',
            position: 'relative',
            boxShadow: '0 16px 36px rgba(0,0,0,0.2)',
            marginBottom: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
            {/* Avatar */}
            <div
              onClick={() => {
                if (user?.avatarUrl) {
                  setShowEnlargedAvatar(true);
                } else {
                  setShowProfileSheet(true);
                }
              }}
              style={{ position: 'relative', flexShrink: 0, cursor: 'pointer' }}
              title={user?.avatarUrl ? "Click to view full size picture" : "Click to upload profile picture"}
            >
              <div
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  background: user?.avatarUrl
                    ? `url(${user.avatarUrl}) center/cover no-repeat`
                    : 'linear-gradient(135deg, #d4af37, #b5952f)',
                  border: '2.5px solid #d4af37',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.75rem',
                  fontFamily: 'Outfit',
                  fontWeight: 900,
                  color: '#ffffff',
                  boxShadow: '0 6px 18px rgba(212,175,55,0.3)',
                }}
              >
                {!user?.avatarUrl && (user?.firstname ? user.firstname[0].toUpperCase() : 'C')}
              </div>
              <div
                style={{
                  position: 'absolute',
                  bottom: -2,
                  right: -2,
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: '#d4af37',
                  color: '#121212',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                }}
              >
                <Edit size={12} />
              </div>
            </div>

            {/* Client Info */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <h2 style={{ fontFamily: 'Outfit', fontSize: '1.3rem', fontWeight: 800, color: '#ffffff' }}>
                  {user?.firstname} {user?.lastname}
                </h2>
                <ShieldCheck size={16} color="#d4af37" />
              </div>
              <p style={{ color: '#a1a1aa', fontSize: '0.82rem', margin: '0.15rem 0 0.5rem' }}>
                {user?.email}
              </p>
              <span
                style={{
                  background: 'rgba(212, 175, 55, 0.15)',
                  color: '#d4af37',
                  fontSize: '0.7rem',
                  fontFamily: 'Outfit',
                  fontWeight: 800,
                  padding: '0.2rem 0.6rem',
                  borderRadius: '50px',
                  border: '1px solid rgba(212,175,55,0.3)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                STYLE CORNER VIP
              </span>
            </div>
          </div>

          {/* Quick Profile Controls */}
          <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem' }}>
            <button
              onClick={() => navigate('/profile')}
              style={{
                flex: 1,
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#ffffff',
                padding: '0.55rem',
                borderRadius: '12px',
                fontSize: '0.8rem',
                fontFamily: 'Outfit',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
              }}
            >
              <User size={14} /> My Profile Info
            </button>

            <button
              onClick={logout}
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#ef4444',
                padding: '0.55rem 1rem',
                borderRadius: '12px',
                fontSize: '0.8rem',
                fontFamily: 'Outfit',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
              }}
            >
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </div>

        {/* ── Atelier Loyalty & Rewards Card ── */}
        <div
          className="app-card"
          style={{
            background: 'linear-gradient(135deg, rgba(212,175,55,0.12) 0%, rgba(23,23,23,0.03) 100%)',
            border: '1.5px solid rgba(212, 175, 55, 0.4)',
            padding: '1.25rem',
            marginBottom: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#171717', color: '#d4af37', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Award size={18} />
              </div>
              <div>
                <h4 style={{ fontFamily: 'Outfit', fontSize: '0.95rem', fontWeight: 800, color: '#171717' }}>
                  Loyalty Rewards
                </h4>
                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Earn points on every booking and order</span>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'Outfit', fontSize: '1.3rem', fontWeight: 900, color: '#d4af37' }}>
                {rewardPoints} <span style={{ fontSize: '0.72rem', color: '#6b7280' }}>PTS</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div style={{ background: 'rgba(0,0,0,0.06)', borderRadius: '50px', height: '8px', overflow: 'hidden', marginBottom: '0.5rem' }}>
            <div
              style={{
                width: `${Math.min(100, (rewardPoints % 1000) / 10)}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #d4af37, #b5952f)',
                borderRadius: '50px',
                transition: 'width 0.4s ease',
              }}
            />
          </div>
          <p style={{ fontSize: '0.75rem', color: '#6b7280', textAlign: 'right' }}>
            {pointsToNextReward} pts to your next $25 reward voucher
          </p>
        </div>

        {/* ── Enhanced Quick Action Shortcuts Bar ── */}
        <div className="app-card" style={{ padding: '1rem', marginBottom: '1.25rem', borderRadius: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h4 style={{ fontFamily: 'Outfit', fontSize: '0.9rem', fontWeight: 800, color: '#171717', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              ⚡ Quick Shortcuts
            </h4>
            <span style={{ fontSize: '0.72rem', color: '#6b7280', fontWeight: 600 }}>Instant Navigation</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.6rem' }}>
            <div
              className="app-card"
              onClick={() => navigate('/booking')}
              style={{ cursor: 'pointer', padding: '0.85rem 0.4rem', textAlign: 'center', marginBottom: 0, border: '1px solid rgba(0,0,0,0.08)', borderRadius: '14px', background: '#faf9f5' }}
            >
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(212,175,55,0.18)', color: '#d4af37', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.4rem' }}>
                <Calendar size={18} />
              </div>
              <span style={{ fontFamily: 'Outfit', fontSize: '0.76rem', fontWeight: 800, color: '#171717', display: 'block' }}>Book Visit</span>
            </div>

            <div
              className="app-card"
              onClick={() => setShowAiSheet(true)}
              style={{ cursor: 'pointer', padding: '0.85rem 0.4rem', textAlign: 'center', marginBottom: 0, border: '1.5px solid rgba(212,175,55,0.4)', borderRadius: '14px', background: 'linear-gradient(135deg, #171717, #0d0d0d)', color: '#ffffff' }}
            >
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#d4af37', color: '#171717', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.4rem' }}>
                <Sparkles size={18} />
              </div>
              <span style={{ fontFamily: 'Outfit', fontSize: '0.76rem', fontWeight: 800, color: '#ffffff', display: 'block' }}>AI Matcher</span>
            </div>

            <div
              className="app-card"
              onClick={() => {
                if (orders.length > 0) {
                  setSelectedOrderForTracking(orders[0]);
                } else {
                  showToast('No active orders to track. Visit the store to place an order.', 'accent');
                  navigate('/store');
                }
              }}
              style={{ cursor: 'pointer', padding: '0.85rem 0.4rem', textAlign: 'center', marginBottom: 0, border: '1px solid rgba(0,0,0,0.08)', borderRadius: '14px', background: '#faf9f5' }}
            >
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(16,185,129,0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.4rem' }}>
                <Truck size={18} />
              </div>
              <span style={{ fontFamily: 'Outfit', fontSize: '0.76rem', fontWeight: 800, color: '#171717', display: 'block' }}>Track Delivery</span>
            </div>

            <div
              className="app-card"
              onClick={() => navigate('/store')}
              style={{ cursor: 'pointer', padding: '0.85rem 0.4rem', textAlign: 'center', marginBottom: 0, border: '1px solid rgba(0,0,0,0.08)', borderRadius: '14px', background: '#faf9f5' }}
            >
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(59,130,246,0.15)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.4rem' }}>
                <ShoppingBag size={18} />
              </div>
              <span style={{ fontFamily: 'Outfit', fontSize: '0.76rem', fontWeight: 800, color: '#171717', display: 'block' }}>Store</span>
            </div>
          </div>
        </div>

        {/* ── Recent Activity Feed Widget ── */}
        <div className="app-card" style={{ padding: '1.1rem', marginBottom: '1.25rem', borderRadius: '18px', background: 'linear-gradient(135deg, #ffffff 0%, #faf9f5 100%)', border: '1px solid rgba(0,0,0,0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Clock size={16} color="#d4af37" />
              <h4 style={{ fontFamily: 'Outfit', fontSize: '0.95rem', fontWeight: 800, color: '#171717', margin: 0 }}>
                Recent Activity & Updates
              </h4>
            </div>
            <span style={{ fontSize: '0.72rem', color: '#6b7280' }}>Live Timeline</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {bookings.length === 0 && orders.length === 0 ? (
              <p style={{ color: '#9ca3af', fontSize: '0.78rem', textAlign: 'center', margin: '0.5rem 0' }}>
                No recent activity. Book a visit or make a purchase to see updates here!
              </p>
            ) : (
              [
                ...bookings.map(b => ({
                  type: 'booking',
                  title: `Appointment: ${b.service || 'Grooming Service'}`,
                  subtitle: `Stylist: ${b.stylist || 'VIP Specialist'} · ${b.date || ''} @ ${b.time || ''}`,
                  status: b.status,
                  date: b.createdAt || new Date().toISOString(),
                })),
                ...orders.map(o => ({
                  type: 'order',
                  title: `Store Order: #${String(o._id).slice(-6).toUpperCase()}`,
                  subtitle: `Total: $${o.totalPrice || o.price || 0} · Stage: ${o.trackingStatus || o.status || 'Processing'}`,
                  status: o.status || 'processing',
                  date: o.createdAt || new Date().toISOString(),
                }))
              ]
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 3)
                .map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '12px',
                      background: '#ffffff',
                      border: '1px solid rgba(0,0,0,0.06)',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: item.type === 'booking' ? 'rgba(212,175,55,0.15)' : 'rgba(16,185,129,0.15)', color: item.type === 'booking' ? '#d4af37' : '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {item.type === 'booking' ? <Calendar size={16} /> : <ShoppingBag size={16} />}
                      </div>
                      <div>
                        <span style={{ fontFamily: 'Outfit', fontSize: '0.82rem', fontWeight: 800, color: '#171717', display: 'block' }}>
                          {item.title}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: '#6b7280' }}>
                          {item.subtitle}
                        </span>
                      </div>
                    </div>
                    <StatusBadge status={item.status} />
                  </div>
                ))
            )}
          </div>
        </div>

        {/* ── Segmented Tab Switcher (Bookings vs Orders) ── */}
        <div style={{ background: '#e5e7eb', borderRadius: '14px', padding: '4px', display: 'flex', marginBottom: '1.25rem' }}>
          <button
            type="button"
            onClick={() => setActiveTab('bookings')}
            style={{
              flex: 1,
              padding: '0.65rem',
              borderRadius: '11px',
              border: 'none',
              fontFamily: 'Outfit',
              fontWeight: 800,
              fontSize: '0.85rem',
              cursor: 'pointer',
              background: activeTab === 'bookings' ? '#ffffff' : 'transparent',
              color: activeTab === 'bookings' ? '#171717' : '#6b7280',
              boxShadow: activeTab === 'bookings' ? '0 4px 12px rgba(0,0,0,0.06)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              transition: 'all 0.2s ease',
            }}
          >
            <Calendar size={15} />
            <span>Appointments ({bookings.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            style={{
              flex: 1,
              padding: '0.65rem',
              borderRadius: '11px',
              border: 'none',
              fontFamily: 'Outfit',
              fontWeight: 800,
              fontSize: '0.85rem',
              cursor: 'pointer',
              background: activeTab === 'orders' ? '#ffffff' : 'transparent',
              color: activeTab === 'orders' ? '#171717' : '#6b7280',
              boxShadow: activeTab === 'orders' ? '0 4px 12px rgba(0,0,0,0.06)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              transition: 'all 0.2s ease',
            }}
          >
            <ShoppingBag size={15} />
            <span>Orders ({orders.length})</span>
          </button>
        </div>

        {/* ── Tab 1: Bookings Feed ── */}
        {activeTab === 'bookings' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h3 style={{ fontFamily: 'Outfit', fontSize: '1.1rem', fontWeight: 800, color: '#171717' }}>
                My Bookings
              </h3>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                {bookings.length > 0 && (
                  <>
                    <button
                      onClick={handleDownloadHistory}
                      title="Download Booking History (CSV)"
                      style={{
                        background: 'rgba(212,175,55,0.12)',
                        border: '1px solid rgba(212,175,55,0.3)',
                        color: '#d4af37',
                        padding: '0.35rem 0.65rem',
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                        fontFamily: 'Outfit',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                      }}
                    >
                      <Download size={13} /> Export CSV
                    </button>

                    <button
                      onClick={handleClearHistory}
                      title="Clear & Delete All History"
                      style={{
                        background: 'rgba(239,68,68,0.1)',
                        border: '1px solid rgba(239,68,68,0.25)',
                        color: '#ef4444',
                        padding: '0.35rem 0.65rem',
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                        fontFamily: 'Outfit',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                      }}
                    >
                      <Trash2 size={13} /> Clear
                    </button>
                  </>
                )}

                <button
                  onClick={() => navigate('/booking')}
                  style={{ background: 'none', border: 'none', color: '#d4af37', fontFamily: 'Outfit', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem', marginLeft: '0.3rem' }}
                >
                  <Plus size={16} /> Book New
                </button>
              </div>
            </div>

            {loading ? (
              <SkeletonList count={2} />
            ) : bookings.length === 0 ? (
              <div className="app-card" style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#6b7280' }}>
                <Calendar size={36} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
                <h4 style={{ fontFamily: 'Outfit', fontSize: '1.05rem', fontWeight: 800, color: '#171717', marginBottom: '0.25rem' }}>
                  No Bookings Yet
                </h4>
                <p style={{ fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                  Book your first visit — hair cut, braids, or nails.
                </p>
                <button onClick={() => navigate('/booking')} className="app-btn app-btn-primary" style={{ maxWidth: '180px', margin: '0 auto', minHeight: '38px', fontSize: '0.82rem' }}>
                  Book Now
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {bookings.map((b) => (
                  <div
                    key={b._id}
                    className="app-card"
                    style={{
                      marginBottom: 0,
                      padding: '1.15rem',
                      borderRadius: '18px',
                      border: '1px solid rgba(0,0,0,0.07)',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {/* Header: Service + Price + Status */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <div>
                        <h4 style={{ fontFamily: 'Outfit', fontSize: '1.05rem', fontWeight: 800, color: '#171717', lineHeight: 1.2 }}>
                          {b.service}
                        </h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.3rem', fontSize: '0.78rem', color: '#6b7280' }}>
                          <Sparkles size={13} color="#d4af37" />
                          <span>Specialist: <strong style={{ color: '#171717' }}>{b.stylist}</strong></span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <span style={{ fontFamily: 'Outfit', fontSize: '1.15rem', fontWeight: 900, color: '#b5952f' }}>
                          ${b.price}
                        </span>
                        <StatusBadge status={b.status} />
                      </div>
                    </div>

                    {/* Date & Time Badge */}
                    <div style={{ background: '#faf9f5', padding: '0.65rem 0.85rem', borderRadius: '12px', border: '1px solid rgba(212,175,55,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.82rem', color: '#171717', fontWeight: 700 }}>
                        <Clock size={15} color="#d4af37" />
                        <span>{b.date} at {b.time}</span>
                      </div>
                      <span style={{ fontSize: '0.7rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Schedule</span>
                    </div>

                    {/* Status Helper Banner */}
                    {b.status === 'accepted' && (
                      <div style={{ padding: '0.55rem 0.75rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '10px', fontSize: '0.78rem', color: '#065f46', fontFamily: 'Outfit', fontWeight: 700, marginBottom: '0.5rem' }}>
                        ✓ Request accepted by {b.stylist}
                      </div>
                    )}

                    {b.status === 'rejected' && (
                      <div style={{ padding: '0.6rem 0.75rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', fontSize: '0.8rem', color: '#991b1b', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.4rem' }}>
                        <span style={{ fontWeight: 600 }}>Request unavailable. Try another expert.</span>
                        <button
                          onClick={() => navigate(`/booking?service=${encodeURIComponent(b.service)}`)}
                          className="app-btn app-btn-accent"
                          style={{ minHeight: '32px', width: 'auto', fontSize: '0.75rem', padding: '0.35rem 0.75rem', borderRadius: '8px' }}
                        >
                          <RefreshCw size={12} /> Rebook
                        </button>
                      </div>
                    )}

                    {b.status === 'completed' && (
                      <div style={{ padding: '0.55rem 0.75rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '10px', fontSize: '0.78rem', color: '#065f46', fontFamily: 'Outfit', fontWeight: 700, marginBottom: '0.5rem' }}>
                        ✓ Service rendered successfully
                      </div>
                    )}

                    {b.status === 'pending' && (
                      <div style={{ padding: '0.5rem 0.75rem', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '10px', fontSize: '0.78rem', color: '#92400e', marginBottom: '0.5rem' }}>
                        ⏳ Pending confirmation from {b.stylist}
                      </div>
                    )}

                    {/* Neat Action Buttons */}
                    {b.status !== 'rejected' && (
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => navigate(`/booking?stylist=${encodeURIComponent(b.stylist)}&service=${encodeURIComponent(b.service)}`)}
                          className="app-btn app-btn-outline"
                          style={{ minHeight: '34px', width: 'auto', fontSize: '0.78rem', padding: '0.4rem 0.85rem', borderRadius: '10px' }}
                        >
                          <RefreshCw size={13} /> Rebook
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Tab 2: Orders Feed ── */}
        {activeTab === 'orders' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
              <h3 style={{ fontFamily: 'Outfit', fontSize: '1.1rem', fontWeight: 800, color: '#171717' }}>
                My Orders
              </h3>
              <button
                onClick={() => navigate('/store')}
                style={{ background: 'none', border: 'none', color: '#d4af37', fontFamily: 'Outfit', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer' }}
              >
                Shop Essentials
              </button>
            </div>

            {loading ? (
              <SkeletonList count={2} />
            ) : orders.length === 0 ? (
              <div className="app-card" style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#6b7280' }}>
                <ShoppingBag size={36} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
                <h4 style={{ fontFamily: 'Outfit', fontSize: '1.05rem', fontWeight: 800, color: '#171717', marginBottom: '0.25rem' }}>
                  No Orders Yet
                </h4>
                <p style={{ fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                  Shop hair products, beard kits, and more.
                </p>
                <button onClick={() => navigate('/store')} className="app-btn app-btn-accent" style={{ maxWidth: '180px', margin: '0 auto', minHeight: '38px', fontSize: '0.82rem' }}>
                  Browse Store
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {orders.map((o) => (
                  <div key={o._id} className="app-card" style={{ marginBottom: 0, padding: '1.15rem', borderRadius: '18px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.65rem' }}>
                      <div>
                        <h4 style={{ fontFamily: 'Outfit', fontSize: '0.98rem', fontWeight: 800, color: '#171717' }}>
                          {o.item || 'Grooming Product'}
                        </h4>
                        <p style={{ color: '#6b7280', fontSize: '0.78rem', marginTop: '0.15rem' }}>
                          Order ID: #{String(o._id).slice(-6).toUpperCase()}
                        </p>
                        {o.address && (
                          <p style={{ color: '#9ca3af', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                            📍 Delivery: {o.address}
                          </p>
                        )}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <StatusBadge status={o.trackingStatus || o.status || 'processing'} />
                        <div style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: '1.1rem', color: '#171717', marginTop: '0.35rem' }}>
                          ${o.totalPrice || o.price || 0}
                        </div>
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '0.65rem', display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => setSelectedOrderForTracking(o)}
                        className="app-btn app-btn-accent"
                        style={{ minHeight: '34px', width: 'auto', fontSize: '0.78rem', padding: '0.35rem 0.85rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
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

        {/* ── Account Management Card ── */}
        <div className="app-card" style={{ marginTop: '1.5rem', background: '#ffffff', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '18px', padding: '1.15rem' }}>
          <h4 style={{ fontFamily: 'Outfit', fontSize: '0.98rem', fontWeight: 800, color: '#171717', marginBottom: '0.85rem' }}>
            Account Settings
          </h4>

          <div style={{ display: 'flex', gap: '0.65rem' }}>
            <button
              onClick={logout}
              className="app-btn app-btn-outline"
              style={{ flex: 1, justifyContent: 'center', gap: '0.4rem', minHeight: '40px', fontSize: '0.82rem', borderRadius: '12px' }}
            >
              <LogOut size={15} />
              <span>Sign Out</span>
            </button>

            <button
              onClick={() => setShowDeleteModal(true)}
              className="app-btn"
              style={{
                flex: 1,
                background: 'rgba(239, 68, 68, 0.08)',
                color: '#ef4444',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                justifyContent: 'center',
                gap: '0.4rem',
                minHeight: '40px',
                fontSize: '0.82rem',
                borderRadius: '12px',
              }}
            >
              <Trash2 size={15} />
              <span>Delete Account</span>
            </button>
          </div>
        </div>

      </div>

      <BottomSheet
        isOpen={showProfileSheet}
        onClose={() => setShowProfileSheet(false)}
        title="Edit Profile"
      >
        <form onSubmit={handleProfileSubmit}>
          {/* Avatar upload */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.25rem', gap: '0.75rem' }}>
            <label
              htmlFor="customer-avatar-upload"
              style={{
                cursor: uploadingPhoto ? 'wait' : 'pointer',
                position: 'relative',
                display: 'inline-block',
              }}
            >
              <div
                style={{
                  width: '94px',
                  height: '94px',
                  borderRadius: '50%',
                  background: profileForm.avatarUrl
                    ? `url(${profileForm.avatarUrl}) center/cover no-repeat`
                    : 'linear-gradient(135deg, #d4af37, #b5952f)',
                  border: '3px solid #d4af37',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.2rem',
                  fontFamily: 'Outfit',
                  fontWeight: 900,
                  color: '#ffffff',
                  boxShadow: '0 6px 20px rgba(212,175,55,0.3)',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'transform 0.2s ease, filter 0.2s ease',
                }}
              >
                {!profileForm.avatarUrl && (profileForm.firstname ? profileForm.firstname[0].toUpperCase() : 'C')}
                {uploadingPhoto ? (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(2px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.2rem' }}>
                    <RefreshCw size={18} color="#d4af37" className="spin-animation" style={{ animation: 'spin 1s linear infinite' }} />
                    <span style={{ color: '#d4af37', fontSize: '0.65rem', fontFamily: 'Outfit', fontWeight: 800 }}>Saving...</span>
                  </div>
                ) : (
                  <div style={{ position: 'absolute', bottom: 0, insetX: 0, background: 'rgba(0,0,0,0.45)', padding: '2px 0', display: 'flex', justifyContent: 'center' }}>
                    <Edit size={12} color="#ffffff" />
                  </div>
                )}
              </div>
            </label>

            <label
              htmlFor="customer-avatar-upload"
              style={{
                cursor: uploadingPhoto ? 'not-allowed' : 'pointer',
                background: uploadingPhoto ? 'rgba(212,175,55,0.3)' : 'rgba(212,175,55,0.15)',
                border: '1px solid rgba(212,175,55,0.4)',
                color: '#d4af37',
                padding: '0.45rem 1.1rem',
                borderRadius: '50px',
                fontSize: '0.8rem',
                fontFamily: 'Outfit',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'all 0.2s ease',
              }}
            >
              <Edit size={13} />
              {uploadingPhoto ? 'Uploading...' : profileForm.avatarUrl ? 'Change Photo' : 'Upload Photo'}
            </label>
            <input
              id="customer-avatar-upload"
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              disabled={uploadingPhoto}
              onChange={handlePhotoChange}
            />
          </div>

          <div className="app-input-group">
            <label className="app-label">First Name *</label>
            <input
              type="text"
              value={profileForm.firstname}
              onChange={(e) => setProfileForm({ ...profileForm, firstname: e.target.value })}
              className="app-input"
              required
            />
          </div>

          <div className="app-input-group">
            <label className="app-label">Last Name</label>
            <input
              type="text"
              value={profileForm.lastname}
              onChange={(e) => setProfileForm({ ...profileForm, lastname: e.target.value })}
              className="app-input"
            />
          </div>

          <div className="app-input-group">
            <label className="app-label">Phone Number</label>
            <input
              type="tel"
              value={profileForm.phone}
              onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
              className="app-input"
            />
          </div>

          <button type="submit" disabled={savingProfile} className="app-btn app-btn-primary" style={{ marginTop: '0.5rem' }}>
            {savingProfile ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </BottomSheet>

      {/* Delete Account Confirmation Modal */}
      <PopupModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Account?"
      >
        <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.12)',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
            }}
          >
            <AlertTriangle size={28} />
          </div>

          <h4 style={{ fontFamily: 'Outfit', fontSize: '1.1rem', fontWeight: 800, color: '#171717', marginBottom: '0.5rem' }}>
            Permanent Account Deletion
          </h4>

          <p style={{ color: '#6b7280', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
            Are you sure you want to permanently delete your account? This action cannot be undone and all your profile data will be erased.
          </p>

          <div style={{ display: 'flex', gap: '0.65rem' }}>
            <button
              onClick={() => setShowDeleteModal(false)}
              className="app-btn app-btn-outline"
              style={{ flex: 1 }}
            >
              Cancel
            </button>

            <button
              onClick={handleDeleteAccount}
              disabled={deletingAccount}
              className="app-btn"
              style={{
                flex: 1,
                background: '#ef4444',
                color: '#ffffff',
                border: 'none',
              }}
            >
              {deletingAccount ? 'Deleting...' : 'Delete Permanently'}
            </button>
          </div>
        </div>
      </PopupModal>

      {/* AI Specialist Matcher Bottom Sheet */}
      <AISpecialistMatcherSheet
        isOpen={showAiSheet}
        onClose={() => setShowAiSheet(false)}
        onApplyMatch={(match) => {
          setShowAiSheet(false);
          navigate(`/booking?stylist=${encodeURIComponent(match.firstname)}`);
        }}
      />

      {/* Profile Picture Full Size Modal */}
      <ImagePreviewModal
        isOpen={showEnlargedAvatar}
        onClose={() => setShowEnlargedAvatar(false)}
        imageUrl={user?.avatarUrl}
        title={`${user?.firstname || 'User'}'s Profile Picture`}
      />

      {/* Order Tracking & Communication Sheet */}
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

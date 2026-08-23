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

  // Section label style
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
                <h2 style={{
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
              {pointsToNextReward} pts to your next $25 reward voucher
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
                transition: 'background 0.2s',
              }}
            >
              <User size={14} /> My Profile
            </button>
            <button
              onClick={logout}
              style={{
                background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
                color: '#f87171', padding: '0.65rem 1.1rem', borderRadius: '14px',
                fontSize: '0.82rem', fontFamily: 'Outfit', fontWeight: 700,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem',
                transition: 'background 0.2s',
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
              { label: 'Bookings', value: bookings.length, color: '#d4af37', bg: 'rgba(212,175,55,0.08)', border: 'rgba(212,175,55,0.25)' },
              { label: 'Orders', value: orders.length, color: '#3b82f6', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.2)' },
              { label: 'Completed', value: completedCount, color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)' },
            ].map((stat) => (
              <div key={stat.label} style={{
                background: stat.bg, border: `1px solid ${stat.border}`,
                borderRadius: '18px', padding: '1rem 0.5rem', textAlign: 'center',
              }}>
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
            SECTION 3 — QUICK ACTIONS (2×2 GRID)
        ══════════════════════════════════════════════ */}
        <div style={{
          background: '#fff', border: '1px solid rgba(0,0,0,0.07)',
          borderRadius: '22px', padding: '1.1rem', marginBottom: '1rem',
          boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
        }}>
          <div style={sectionLabel}>
            <div style={sectionIcon('#171717', '#d4af37')}><Sparkles size={13} /></div>
            <span style={sectionTitle}>Quick Actions</span>
          </div>
          <div className="dashboard-quick-actions" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {[
              {
                icon: <Calendar size={22} />, label: 'Book a Visit',
                sub: 'Hair, Nails, Braids',
                bg: 'rgba(212,175,55,0.1)', iconBg: '#d4af37', iconColor: '#fff',
                border: 'rgba(212,175,55,0.3)', action: () => navigate('/booking'),
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
                bg: 'rgba(16,185,129,0.08)', iconBg: 'rgba(16,185,129,0.15)', iconColor: '#10b981',
                border: 'rgba(16,185,129,0.2)',
                action: () => {
                  if (orders.length > 0) setSelectedOrderForTracking(orders[0]);
                  else { showToast('No active orders. Visit the store first.', 'accent'); navigate('/store'); }
                },
              },
              {
                icon: <ShoppingBag size={22} />, label: 'Visit Store',
                sub: 'Hair & grooming products',
                bg: 'rgba(59,130,246,0.08)', iconBg: 'rgba(59,130,246,0.15)', iconColor: '#3b82f6',
                border: 'rgba(59,130,246,0.2)', action: () => navigate('/store'),
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
                  minHeight: '100px',
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
                  <div style={{ fontFamily: 'Outfit', fontSize: '0.9rem', fontWeight: 800, color: item.textColor || '#171717', lineHeight: 1.1 }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: item.subColor || '#6b7280', marginTop: '0.15rem', fontWeight: 600 }}>
                    {item.sub}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            SECTION 4 — RECENT ACTIVITY FEED
        ══════════════════════════════════════════════ */}
        <div style={{
          background: '#fff', border: '1px solid rgba(0,0,0,0.07)',
          borderRadius: '22px', padding: '1.1rem', marginBottom: '1rem',
          boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
        }}>
          <div style={sectionLabel}>
            <div style={sectionIcon('rgba(16,185,129,0.12)', '#10b981')}><Clock size={13} /></div>
            <span style={sectionTitle}>Recent Activity</span>
          </div>

          {bookings.length === 0 && orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '1.5rem 0', color: '#9ca3af', fontSize: '0.82rem' }}>
              No recent activity — book a visit or make a purchase!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              {[
                ...bookings.map(b => ({
                  type: 'booking', icon: <Calendar size={15} />,
                  title: b.service || 'Grooming Service',
                  sub: `${b.date || ''} @ ${b.time || ''} · ${b.stylist || ''}`,
                  status: b.status, date: b.createdAt || new Date().toISOString(),
                  iconBg: 'rgba(212,175,55,0.15)', iconColor: '#d4af37',
                })),
                ...orders.map(o => ({
                  type: 'order', icon: <ShoppingBag size={15} />,
                  title: o.item || `Order #${String(o._id).slice(-6).toUpperCase()}`,
                  sub: `$${o.totalPrice || o.price || 0} · ${o.trackingStatus || o.status || 'Processing'}`,
                  status: o.status || 'processing', date: o.createdAt || new Date().toISOString(),
                  iconBg: 'rgba(16,185,129,0.12)', iconColor: '#10b981',
                })),
              ]
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 4)
                .map((item, idx) => (
                  <div key={idx} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.75rem 0.85rem', borderRadius: '14px',
                    background: '#faf9f6', border: '1px solid rgba(0,0,0,0.05)',
                    gap: '0.65rem',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flex: 1, minWidth: 0 }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '10px',
                        background: item.iconBg, color: item.iconColor, flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {item.icon}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{
                          fontFamily: 'Outfit', fontSize: '0.85rem', fontWeight: 800, color: '#171717',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>{item.title}</div>
                        <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '0.1rem' }}>{item.sub}</div>
                      </div>
                    </div>
                    <StatusBadge status={item.status} />
                  </div>
                ))
              }
            </div>
          )}
        </div>

        {/* ══════════════════════════════════════════════
            SECTION 5 — APPOINTMENTS & ORDERS (TABBED)
        ══════════════════════════════════════════════ */}
        <div style={{
          background: '#fff', border: '1px solid rgba(0,0,0,0.07)',
          borderRadius: '22px', padding: '1.1rem', marginBottom: '1rem',
          boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
        }}>
          {/* Section label */}
          <div style={sectionLabel}>
            <div style={sectionIcon('rgba(59,130,246,0.12)', '#3b82f6')}><Calendar size={13} /></div>
            <span style={sectionTitle}>My History</span>
          </div>

          {/* Tab switcher */}
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

          {/* ── BOOKINGS TAB ── */}
          {activeTab === 'bookings' && (
            <div>
              {/* Tab toolbar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', gap: '0.5rem' }}>
                <button
                  onClick={() => navigate('/booking')}
                  style={{
                    background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.3)',
                    color: '#b5952f', padding: '0.45rem 0.85rem', borderRadius: '10px',
                    fontSize: '0.8rem', fontFamily: 'Outfit', fontWeight: 800, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '0.3rem',
                  }}
                >
                  <Plus size={14} /> New Booking
                </button>
                <button
                  onClick={fetchData}
                  style={{
                    background: 'none', border: 'none', color: '#9ca3af',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem',
                    fontSize: '0.78rem', fontFamily: 'Outfit', fontWeight: 700,
                  }}
                >
                  <RefreshCw size={13} /> Refresh
                </button>
              </div>

              {loading ? (
                <SkeletonList count={2} />
              ) : bookings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
                  <Calendar size={40} color="#e5e7eb" style={{ marginBottom: '0.75rem' }} />
                  <h4 style={{ fontFamily: 'Outfit', fontSize: '1rem', fontWeight: 800, color: '#171717', marginBottom: '0.4rem' }}>
                    No Bookings Yet
                  </h4>
                  <p style={{ color: '#9ca3af', fontSize: '0.82rem', marginBottom: '1.25rem' }}>
                    Book your first visit — hair, braids, or nails.
                  </p>
                  <button onClick={() => navigate('/booking')} className="app-btn app-btn-primary"
                    style={{ maxWidth: '160px', margin: '0 auto', minHeight: '40px', fontSize: '0.82rem' }}>
                    Book Now
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {bookings.map((b) => (
                    <div key={b._id} style={{
                      border: '1px solid rgba(0,0,0,0.07)', borderRadius: '18px',
                      padding: '1.1rem', background: '#fafafa',
                      transition: 'box-shadow 0.2s ease',
                    }}>
                      {/* Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.65rem', gap: '0.5rem' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h4 style={{ fontFamily: 'Outfit', fontSize: '1rem', fontWeight: 800, color: '#171717', margin: 0 }}>
                            {b.service}
                          </h4>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.25rem', fontSize: '0.75rem', color: '#6b7280' }}>
                            <Sparkles size={11} color="#d4af37" />
                            <span>Specialist: <strong style={{ color: '#171717' }}>{b.stylist}</strong></span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.3rem', flexShrink: 0 }}>
                          <StatusBadge status={b.status} />
                          <span style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: '1rem', color: '#b5952f' }}>
                            ${b.price}
                          </span>
                        </div>
                      </div>

                      {/* Date pill */}
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '0.4rem',
                        background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)',
                        borderRadius: '10px', padding: '0.5rem 0.75rem', marginBottom: '0.65rem',
                        fontSize: '0.8rem', color: '#171717', fontWeight: 700,
                      }}>
                        <Clock size={13} color="#d4af37" />
                        {b.date} at {b.time}
                      </div>

                      {/* Status banners */}
                      {b.status === 'accepted' && (
                        <div style={{ padding: '0.5rem 0.75rem', background: 'rgba(16,185,129,0.09)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '10px', fontSize: '0.75rem', color: '#065f46', fontWeight: 700, marginBottom: '0.5rem' }}>
                          ✓ Accepted by {b.stylist}
                        </div>
                      )}
                      {b.status === 'rejected' && (
                        <div style={{ padding: '0.5rem 0.75rem', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', fontSize: '0.75rem', color: '#991b1b', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <span>Request unavailable. Try another expert.</span>
                          <button
                            onClick={() => navigate(`/booking?service=${encodeURIComponent(b.service)}`)}
                            className="app-btn app-btn-accent"
                            style={{ minHeight: '30px', width: 'auto', fontSize: '0.72rem', padding: '0.3rem 0.75rem', borderRadius: '8px' }}
                          >
                            <RefreshCw size={11} /> Rebook
                          </button>
                        </div>
                      )}
                      {b.status === 'completed' && (
                        <div style={{ padding: '0.5rem 0.75rem', background: 'rgba(16,185,129,0.09)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '10px', fontSize: '0.75rem', color: '#065f46', fontWeight: 700, marginBottom: '0.5rem' }}>
                          ✓ Service rendered successfully
                        </div>
                      )}
                      {b.status === 'pending' && (
                        <div style={{ padding: '0.5rem 0.75rem', background: 'rgba(245,158,11,0.09)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '10px', fontSize: '0.75rem', color: '#92400e', fontWeight: 700, marginBottom: '0.5rem' }}>
                          ⏳ Awaiting confirmation from {b.stylist}
                        </div>
                      )}

                      {/* Rebook action */}
                      {b.status !== 'rejected' && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => navigate(`/booking?stylist=${encodeURIComponent(b.stylist)}&service=${encodeURIComponent(b.service)}`)}
                            className="app-btn app-btn-outline"
                            style={{ minHeight: '36px', width: 'auto', fontSize: '0.78rem', padding: '0.4rem 0.9rem', borderRadius: '10px' }}
                          >
                            <RefreshCw size={12} /> Rebook
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
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.85rem' }}>
                <button
                  onClick={() => navigate('/store')}
                  style={{
                    background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)',
                    color: '#3b82f6', padding: '0.45rem 0.85rem', borderRadius: '10px',
                    fontSize: '0.8rem', fontFamily: 'Outfit', fontWeight: 800, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '0.3rem',
                  }}
                >
                  <ShoppingBag size={14} /> Shop Essentials
                </button>
              </div>

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
                  <button onClick={() => navigate('/store')} className="app-btn app-btn-accent"
                    style={{ maxWidth: '160px', margin: '0 auto', minHeight: '40px', fontSize: '0.82rem' }}>
                    Browse Store
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {orders.map((o) => (
                    <div key={o._id} style={{
                      border: '1px solid rgba(0,0,0,0.07)', borderRadius: '18px',
                      padding: '1.1rem', background: '#fafafa',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.65rem', gap: '0.5rem' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h4 style={{ fontFamily: 'Outfit', fontSize: '0.98rem', fontWeight: 800, color: '#171717', margin: 0 }}>
                            {o.item || 'Grooming Product'}
                          </h4>
                          <p style={{ color: '#9ca3af', fontSize: '0.72rem', margin: '0.2rem 0 0' }}>
                            Order #{String(o._id).slice(-6).toUpperCase()}
                          </p>
                          {o.address && (
                            <p style={{ color: '#6b7280', fontSize: '0.72rem', marginTop: '0.2rem' }}>
                              📍 {o.address}
                            </p>
                          )}
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <StatusBadge status={o.trackingStatus || o.status || 'processing'} />
                          <div style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: '1.05rem', color: '#171717', marginTop: '0.3rem' }}>
                            ${o.totalPrice || o.price || 0}
                          </div>
                        </div>
                      </div>
                      <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '0.65rem' }}>
                        <button
                          onClick={() => setSelectedOrderForTracking(o)}
                          className="app-btn app-btn-accent"
                          style={{ width: '100%', minHeight: '40px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                        >
                          <Truck size={15} /> Track Delivery & Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ══════════════════════════════════════════════
            SECTION 6 — ACCOUNT SETTINGS
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

          {/* Booking history management */}
          {bookings.length > 0 && (
            <div style={{
              background: '#faf9f6', borderRadius: '14px', padding: '0.85rem',
              marginBottom: '0.85rem', border: '1px solid rgba(0,0,0,0.06)',
            }}>
              <p style={{ fontFamily: 'Outfit', fontSize: '0.8rem', fontWeight: 800, color: '#171717', margin: '0 0 0.65rem' }}>
                Booking History
              </p>
              <div style={{ display: 'flex', gap: '0.65rem' }}>
                <button
                  onClick={handleDownloadHistory}
                  style={{
                    flex: 1, background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)',
                    color: '#b5952f', padding: '0.6rem', borderRadius: '12px',
                    fontFamily: 'Outfit', fontWeight: 800, fontSize: '0.8rem',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
                    minHeight: '44px',
                  }}
                >
                  <Download size={14} /> Export CSV
                </button>
                <button
                  onClick={handleClearHistory}
                  style={{
                    flex: 1, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.22)',
                    color: '#ef4444', padding: '0.6rem', borderRadius: '12px',
                    fontFamily: 'Outfit', fontWeight: 800, fontSize: '0.8rem',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
                    minHeight: '44px',
                  }}
                >
                  <Trash2 size={14} /> Clear History
                </button>
              </div>
            </div>
          )}

          {/* Danger zone */}
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

      {/* ═══ MODALS & SHEETS ═══ */}

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

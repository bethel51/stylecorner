import React, { useState, useEffect } from 'react';
import {
  Scissors,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
  LogOut,
  RefreshCw,
  Sparkles,
  DollarSign,
  Star,
  Award,
  ToggleLeft,
  ToggleRight,
  Mail,
  Phone,
  Check,
  Edit,
  ShoppingBag,
  Truck,
  Shield,
  Download,
  Plus,
  Trash2,
  AlertTriangle,
  History,
  Activity,
  ListOrdered
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { uploadToCloudinary } from '../services/cloudinary';
import { PageContainer } from '../components/common/PageContainer';
import { StatusBadge } from '../components/common/StatusBadge';
import { SkeletonList } from '../components/common/SkeletonLoader';
import { PopupModal } from '../components/common/PopupModal';
import { BottomSheet } from '../components/common/BottomSheet';
import { ImagePreviewModal } from '../components/common/ImagePreviewModal';
import { downloadBookingHistoryCSV, printBookingHistoryReport } from '../utils/bookingHistoryExport';

export const ExpertDashboard = () => {
  const navigate = useNavigate();
  const { user, logout, updateProfile, deleteAccount, showToast } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [isAvailable, setIsAvailable] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  // Dedicated Sheet/Page Navigation States
  const [showAppointmentsSheet, setShowAppointmentsSheet] = useState(false);
  const [showActivitySheet, setShowActivitySheet] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEnlargedAvatar, setShowEnlargedAvatar] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  // Avatar edit state
  const [showAvatarSheet, setShowAvatarSheet] = useState(false);
  const [avatarInput, setAvatarInput] = useState(user?.avatarUrl || '');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    if (user) setAvatarInput(user.avatarUrl || '');
  }, [user]);

  const handleExpertPhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file.', 'error');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setAvatarInput(previewUrl);
    setUploadingPhoto(true);

    try {
      const url = await uploadToCloudinary(file);
      setAvatarInput(url);
      await updateProfile({ avatarUrl: url });
      showToast('Profile picture updated!', 'success');
      setTimeout(() => setShowAvatarSheet(false), 500);
    } catch (err) {
      showToast(err.message || 'Failed to upload photo. Please try again.', 'error');
      setAvatarInput(user?.avatarUrl || '');
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

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await api.getBookings();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      showToast(err.message || 'Failed to fetch appointments data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      await api.updateBookingStatus(id, { status: newStatus });
      setBookings((prev) =>
        prev.map((item) => (item._id === id ? { ...item, status: newStatus } : item))
      );
      if (newStatus === 'accepted') {
        showToast('Booking request accepted!', 'success');
      } else if (newStatus === 'rejected') {
        showToast('Booking request rejected.', 'accent');
      } else if (newStatus === 'completed') {
        showToast('Your scheduled services have been rendered. Thanks for using Style Corner!', 'success');
      } else {
        showToast(`Status updated to ${newStatus}`, 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to update status', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  // Metrics
  const pendingBookings = bookings.filter((b) => b.status === 'pending');
  const acceptedBookings = bookings.filter((b) => b.status === 'accepted');
  const completedBookings = bookings.filter((b) => b.status === 'completed');

  // Download booking history handler
  const handleDownloadHistory = () => {
    if (bookings.length === 0) {
      showToast('No booking history available to download.', 'error');
      return;
    }
    const success = downloadBookingHistoryCSV(bookings, `Expert_Booking_History_${user?.firstname || 'Stylist'}.csv`);
    printBookingHistoryReport(bookings, `Expert Appointment History Statement - ${user?.firstname || 'Stylist'}`);
    if (success) showToast('Booking history downloaded & printable statement opened!', 'success');
  };

  // Clear all booking history handler
  const handleClearHistory = async () => {
    if (bookings.length === 0) {
      showToast('No booking history to clear.', 'accent');
      return;
    }
    if (!window.confirm('Are you sure you want to clear and delete all booking history?')) return;
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

  const totalRevenue = completedBookings.reduce((sum, b) => sum + (Number(b.price) || 0), 0);

  const filteredList = bookings.filter((b) => {
    if (filterStatus === 'all') return true;
    return b.status === filterStatus;
  });

  // Reusable Section Label Components
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
    <PageContainer title="Expert Dashboard">
      <div style={{ paddingBottom: '2rem' }}>

        {/* ══════════════════════════════════════════════
            SECTION 1 — HERO EXPERT PROFILE BANNER
        ══════════════════════════════════════════════ */}
        <div
          className="hero-profile-banner"
          style={{
            background: 'linear-gradient(135deg, #111111 0%, #1c1917 60%, #0c0a09 100%)',
            borderRadius: '24px',
            padding: '1.5rem',
            marginBottom: '1rem',
            border: '1.5px solid rgba(212, 175, 55, 0.45)',
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

          {/* Avatar + Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.1rem' }}>
            <div
              onClick={() => user?.avatarUrl ? setShowEnlargedAvatar(true) : setShowAvatarSheet(true)}
              style={{ position: 'relative', flexShrink: 0, cursor: 'pointer' }}
              title={user?.avatarUrl ? "Click to view full size picture" : "Click to upload profile picture"}
            >
              <div
                style={{
                  width: '78px',
                  height: '78px',
                  borderRadius: '50%',
                  background: user?.avatarUrl
                    ? `url(${user.avatarUrl}) center/cover no-repeat`
                    : 'linear-gradient(135deg, #d4af37, #b5952f)',
                  border: '2.5px solid #d4af37',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 24px rgba(212,175,55,0.35)',
                }}
              >
                {!user?.avatarUrl && <Scissors size={34} color="#ffffff" />}
              </div>
              <div
                style={{
                  position: 'absolute', bottom: 0, right: 0,
                  width: '26px', height: '26px', borderRadius: '50%',
                  background: '#d4af37', color: '#111111', border: '2px solid #111111',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Edit size={11} />
              </div>
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                <h2 className="dashboard-user-name" style={{ fontFamily: 'Outfit', fontSize: '1.25rem', fontWeight: 900, color: '#ffffff', margin: 0, lineHeight: 1.1 }}>
                  {user?.firstname} {user?.lastname}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#d4af37', fontSize: '0.8rem', fontWeight: 900 }}>
                  <Star size={13} fill="#d4af37" /> 4.9
                </div>
              </div>

              <p style={{ color: '#d4af37', fontSize: '0.78rem', fontFamily: 'Outfit', fontWeight: 800, margin: '0.2rem 0 0.5rem', letterSpacing: '0.04em' }}>
                MASTER STYLIST & SPECIALIST
              </p>

              {/* Status Switcher Toggle Pill */}
              <button
                type="button"
                onClick={() => {
                  const next = !isAvailable;
                  setIsAvailable(next);
                  showToast(next ? 'Status set to: Accepting Bookings' : 'Status set to: On Break / Away', 'accent');
                }}
                style={{
                  background: isAvailable ? 'rgba(16, 185, 129, 0.16)' : 'rgba(239, 68, 68, 0.16)',
                  border: isAvailable ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(239, 68, 68, 0.35)',
                  color: isAvailable ? '#10b981' : '#f87171',
                  fontSize: '0.7rem',
                  fontFamily: 'Outfit',
                  fontWeight: 900,
                  padding: '0.25rem 0.65rem',
                  borderRadius: '50px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: isAvailable ? '#10b981' : '#ef4444' }} />
                <span>{isAvailable ? 'AVAILABLE FOR BOOKINGS' : 'ON BREAK'}</span>
              </button>
            </div>
          </div>

          {/* Quick Profile Controls Bar */}
          <div style={{ display: 'flex', gap: '0.6rem', borderTop: '1px solid rgba(255,255,255,0.09)', paddingTop: '1rem' }}>
            <button
              onClick={() => navigate('/profile')}
              style={{
                flex: 1,
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.14)',
                color: '#ffffff',
                padding: '0.65rem',
                borderRadius: '14px',
                fontSize: '0.82rem',
                fontFamily: 'Outfit',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
              }}
            >
              <User size={14} /> Edit Profile Info
            </button>

            <button
              onClick={logout}
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                padding: '0.65rem 1.1rem',
                borderRadius: '14px',
                fontSize: '0.82rem',
                fontFamily: 'Outfit',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            SECTION 2 — EARNINGS & APPOINTMENT METRICS TILES
        ══════════════════════════════════════════════ */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={sectionLabel}>
            <div style={sectionIcon('rgba(212,175,55,0.15)', '#d4af37')}><DollarSign size={13} /></div>
            <span style={sectionTitle}>Performance Overview</span>
          </div>

          <div className="dashboard-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.65rem' }}>
            <div
              onClick={() => { setFilterStatus('pending'); setShowAppointmentsSheet(true); }}
              style={{
                background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.22)',
                borderRadius: '18px', padding: '1rem 0.5rem', textAlign: 'center', cursor: 'pointer',
              }}
            >
              <div style={{ fontFamily: 'Outfit', fontSize: '1.9rem', fontWeight: 900, color: '#f59e0b', lineHeight: 1 }}>
                {pendingBookings.length}
              </div>
              <div style={{ fontSize: '0.7rem', fontFamily: 'Outfit', fontWeight: 800, color: '#6b7280', marginTop: '0.3rem', textTransform: 'uppercase' }}>
                Pending
              </div>
            </div>

            <div
              onClick={() => { setFilterStatus('accepted'); setShowAppointmentsSheet(true); }}
              style={{
                background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.22)',
                borderRadius: '18px', padding: '1rem 0.5rem', textAlign: 'center', cursor: 'pointer',
              }}
            >
              <div style={{ fontFamily: 'Outfit', fontSize: '1.9rem', fontWeight: 900, color: '#10b981', lineHeight: 1 }}>
                {acceptedBookings.length}
              </div>
              <div style={{ fontSize: '0.7rem', fontFamily: 'Outfit', fontWeight: 800, color: '#6b7280', marginTop: '0.3rem', textTransform: 'uppercase' }}>
                Confirmed
              </div>
            </div>

            <div
              onClick={() => { setFilterStatus('completed'); setShowAppointmentsSheet(true); }}
              style={{
                background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.25)',
                borderRadius: '18px', padding: '1rem 0.5rem', textAlign: 'center', cursor: 'pointer',
              }}
            >
              <div style={{ fontFamily: 'Outfit', fontSize: '1.7rem', fontWeight: 900, color: '#b5952f', lineHeight: 1 }}>
                ₦{Number(totalRevenue).toLocaleString()}
              </div>
              <div style={{ fontSize: '0.7rem', fontFamily: 'Outfit', fontWeight: 800, color: '#6b7280', marginTop: '0.3rem', textTransform: 'uppercase' }}>
                Earnings
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            SECTION 3 — MY EXPERT SERVICES & OFFERINGS
        ══════════════════════════════════════════════ */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid rgba(0, 0, 0, 0.07)',
            borderRadius: '22px',
            padding: '1.1rem',
            marginBottom: '1rem',
            boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
            <div style={sectionLabel}>
              <div style={sectionIcon('#171717', '#d4af37')}><Scissors size={13} /></div>
              <span style={sectionTitle}>My Offered Services</span>
            </div>

            <button
              onClick={() => navigate('/profile')}
              style={{
                background: 'rgba(212,175,55,0.12)',
                border: '1px solid rgba(212,175,55,0.3)',
                color: '#b5952f',
                padding: '0.35rem 0.75rem',
                borderRadius: '10px',
                fontSize: '0.78rem',
                fontFamily: 'Outfit',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                marginBottom: '1rem',
              }}
            >
              <Edit size={12} /> Edit Offerings
            </button>
          </div>

          {/* List of Expert Services */}
          {(() => {
            const specs = Array.isArray(user?.specialties)
              ? user.specialties
              : (typeof user?.specialties === 'string' && user.specialties.trim())
                ? user.specialties.split(',').map(s => s.trim())
                : ['Skin Fades & Beard Trim', 'Knotless Braids & Locs', 'Manicure & Gel Nails', 'Scalp Care Treatment'];

            return (
              <div className="dashboard-services-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                {specs.map((s, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: '#faf9f6',
                      border: '1px solid rgba(0,0,0,0.06)',
                      padding: '0.75rem 0.85rem',
                      borderRadius: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.4rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', minWidth: 0 }}>
                      <Sparkles size={13} color="#d4af37" style={{ flexShrink: 0 }} />
                      <span style={{ fontFamily: 'Outfit', fontSize: '0.82rem', fontWeight: 800, color: '#171717', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {s}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.62rem', background: 'rgba(16,185,129,0.12)', color: '#059669', padding: '0.15rem 0.45rem', borderRadius: '50px', fontWeight: 900, textTransform: 'uppercase', flexShrink: 0 }}>
                      Active
                    </span>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>

        {/* ══════════════════════════════════════════════
            SECTION 4 — QUICK SHORTCUTS (ICON CARDS)
        ══════════════════════════════════════════════ */}
        <div style={{
          background: '#fff', border: '1px solid rgba(0,0,0,0.07)',
          borderRadius: '22px', padding: '1.1rem', marginBottom: '1rem',
          boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
        }}>
          <div style={sectionLabel}>
            <div style={sectionIcon('#171717', '#d4af37')}><Sparkles size={13} /></div>
            <span style={sectionTitle}>Specialist Shortcuts</span>
          </div>

          <div className="dashboard-quick-actions" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <button
              onClick={() => setShowAppointmentsSheet(true)}
              style={{
                background: 'rgba(212,175,55,0.12)', border: '1.5px solid rgba(212,175,55,0.4)',
                borderRadius: '18px', padding: '1.1rem 0.85rem',
                cursor: 'pointer', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.5rem',
                minHeight: '102px',
              }}
            >
              <div style={{
                width: '42px', height: '42px', borderRadius: '12px',
                background: '#d4af37', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <ListOrdered size={22} />
              </div>
              <div>
                <div style={{ fontFamily: 'Outfit', fontSize: '0.88rem', fontWeight: 800, color: '#171717' }}>
                  Appointments Queue
                </div>
                <div style={{ fontSize: '0.7rem', color: '#6b7280', marginTop: '0.15rem', fontWeight: 600 }}>
                  Manage {bookings.length} client requests
                </div>
              </div>
            </button>

            <button
              onClick={() => setShowActivitySheet(true)}
              style={{
                background: 'rgba(16,185,129,0.08)', border: '1.5px solid rgba(16,185,129,0.3)',
                borderRadius: '18px', padding: '1.1rem 0.85rem',
                cursor: 'pointer', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.5rem',
                minHeight: '102px',
              }}
            >
              <div style={{
                width: '42px', height: '42px', borderRadius: '12px',
                background: '#10b981', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Activity size={22} />
              </div>
              <div>
                <div style={{ fontFamily: 'Outfit', fontSize: '0.88rem', fontWeight: 800, color: '#171717' }}>
                  Recent Activity Feed
                </div>
                <div style={{ fontSize: '0.7rem', color: '#6b7280', marginTop: '0.15rem', fontWeight: 600 }}>
                  Live booking events
                </div>
              </div>
            </button>

            <button
              onClick={() => {
                const next = !isAvailable;
                setIsAvailable(next);
                showToast(next ? 'Status: Accepting Bookings' : 'Status: On Break', 'accent');
              }}
              style={{
                background: isAvailable ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                border: isAvailable ? '1.5px solid rgba(16,185,129,0.25)' : '1.5px solid rgba(239,68,68,0.25)',
                borderRadius: '18px', padding: '1.1rem 0.85rem',
                cursor: 'pointer', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.5rem',
                minHeight: '102px',
              }}
            >
              <div style={{
                width: '42px', height: '42px', borderRadius: '12px',
                background: isAvailable ? '#10b981' : '#ef4444', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Clock size={20} />
              </div>
              <div>
                <div style={{ fontFamily: 'Outfit', fontSize: '0.88rem', fontWeight: 800, color: isAvailable ? '#059669' : '#dc2626' }}>
                  {isAvailable ? 'Available' : 'On Break'}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#6b7280', marginTop: '0.15rem', fontWeight: 600 }}>
                  Toggle availability
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate(`/expert-profile?name=${encodeURIComponent(user?.firstname || 'Stella Hair')}`)}
              style={{
                background: 'rgba(236,72,153,0.08)', border: '1.5px solid rgba(236,72,153,0.3)',
                borderRadius: '18px', padding: '1.1rem 0.85rem',
                cursor: 'pointer', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.5rem',
                minHeight: '102px',
              }}
            >
              <div style={{
                width: '42px', height: '42px', borderRadius: '12px',
                background: '#ec4899', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Scissors size={20} />
              </div>
              <div>
                <div style={{ fontFamily: 'Outfit', fontSize: '0.88rem', fontWeight: 800, color: '#171717' }}>
                  Manage Public Page
                </div>
                <div style={{ fontSize: '0.7rem', color: '#6b7280', marginTop: '0.15rem', fontWeight: 600 }}>
                  Edit bio, photos & prices
                </div>
              </div>
            </button>

            <button
              onClick={handleDownloadHistory}
              style={{
                background: 'rgba(59,130,246,0.08)', border: '1.5px solid rgba(59,130,246,0.25)',
                borderRadius: '18px', padding: '1.1rem 0.85rem',
                cursor: 'pointer', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.5rem',
                minHeight: '102px',
              }}
            >
              <div style={{
                width: '42px', height: '42px', borderRadius: '12px',
                background: '#3b82f6', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Download size={20} />
              </div>
              <div>
                <div style={{ fontFamily: 'Outfit', fontSize: '0.88rem', fontWeight: 800, color: '#171717' }}>
                  Export CSV / PDF
                </div>
                <div style={{ fontSize: '0.7rem', color: '#6b7280', marginTop: '0.15rem', fontWeight: 600 }}>
                  Statement & records
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            SECTION 5 — ACCOUNT SETTINGS & DANGER ZONE
        ══════════════════════════════════════════════ */}
        <div style={{
          background: '#fff', border: '1px solid rgba(239,68,68,0.18)',
          borderRadius: '22px', padding: '1.1rem',
          boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
        }}>
          <div style={sectionLabel}>
            <div style={sectionIcon('rgba(239,68,68,0.1)', '#ef4444')}><AlertTriangle size={13} /></div>
            <span style={sectionTitle}>Account & Data Settings</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <button
              onClick={logout}
              className="app-btn app-btn-outline"
              style={{ justifyContent: 'center', gap: '0.5rem', minHeight: '46px', borderRadius: '14px', fontSize: '0.85rem' }}
            >
              <LogOut size={16} /> Sign Out of Account
            </button>

            <button
              onClick={() => setShowDeleteModal(true)}
              className="app-btn"
              style={{
                background: 'rgba(239, 68, 68, 0.07)',
                color: '#ef4444',
                border: '1px solid rgba(239, 68, 68, 0.22)',
                justifyContent: 'center',
                gap: '0.5rem',
                minHeight: '46px',
                borderRadius: '14px',
                fontSize: '0.85rem',
              }}
            >
              <Trash2 size={16} /> Delete Account Permanently
            </button>
          </div>
        </div>

      </div>

      {/* ═══ DEDICATED FULL-PAGE BOTTOM SHEETS FOR EXPERT APPOINTMENTS & RECENT ACTIVITY ═══ */}

      {/* ── 1. DEDICATED EXPERT APPOINTMENTS QUEUE PAGE SHEET ── */}
      <BottomSheet
        isOpen={showAppointmentsSheet}
        onClose={() => setShowAppointmentsSheet(false)}
        title="Client Appointments Queue"
      >
        <div style={{ paddingBottom: '1rem' }}>

          {/* Export & Clear Actions Toolbar */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <button
              onClick={handleDownloadHistory}
              style={{
                flex: 1, background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.35)',
                color: '#b5952f', padding: '0.6rem', borderRadius: '12px',
                fontFamily: 'Outfit', fontWeight: 800, fontSize: '0.8rem',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
                minHeight: '44px',
              }}
            >
              <Download size={15} /> Export CSV / Statement
            </button>

            <button
              onClick={handleClearHistory}
              style={{
                flex: 1, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
                color: '#ef4444', padding: '0.6rem', borderRadius: '12px',
                fontFamily: 'Outfit', fontWeight: 800, fontSize: '0.8rem',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
                minHeight: '44px',
              }}
            >
              <Trash2 size={15} /> Clear History
            </button>
          </div>

          {/* Status Filter Pills Horizontal Scroll */}
          <div style={{
            display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.5rem',
            marginBottom: '1rem', scrollbarWidth: 'none',
          }}>
            {[
              { id: 'all', label: `All (${bookings.length})` },
              { id: 'pending', label: `Pending (${pendingBookings.length})` },
              { id: 'accepted', label: `Confirmed (${acceptedBookings.length})` },
              { id: 'completed', label: `Completed (${completedBookings.length})` },
            ].map((pill) => (
              <button
                key={pill.id}
                onClick={() => setFilterStatus(pill.id)}
                style={{
                  background: filterStatus === pill.id ? '#171717' : '#f3f4f6',
                  color: filterStatus === pill.id ? '#d4af37' : '#6b7280',
                  border: filterStatus === pill.id ? 'none' : '1px solid rgba(0,0,0,0.06)',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '50px',
                  fontFamily: 'Outfit',
                  fontWeight: 800,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  boxShadow: filterStatus === pill.id ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                {pill.label}
              </button>
            ))}
          </div>

          {loading ? (
            <SkeletonList count={3} />
          ) : filteredList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#6b7280' }}>
              <Calendar size={38} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
              <h4 style={{ fontFamily: 'Outfit', fontSize: '1rem', fontWeight: 800, color: '#171717', marginBottom: '0.25rem' }}>
                No Bookings Found
              </h4>
              <p style={{ fontSize: '0.82rem' }}>
                Client requests matching this filter will show up here.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {filteredList.map((b) => (
                <div
                  key={b._id}
                  style={{
                    border: '1px solid rgba(0,0,0,0.07)',
                    borderRadius: '18px',
                    padding: '1.1rem',
                    background: '#fafafa',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', gap: '0.5rem' }}>
                    <div>
                      <h4 style={{ fontFamily: 'Outfit', fontSize: '1.05rem', fontWeight: 800, color: '#171717', margin: 0 }}>
                        {b.clientName || 'Client'}
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Mail size={12} /> {b.clientEmail}
                        </span>
                        {b.clientPhone && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Phone size={12} /> {b.clientPhone}
                          </span>
                        )}
                      </div>
                    </div>
                    <StatusBadge status={b.status} />
                  </div>

                  <div style={{ background: '#ffffff', padding: '0.85rem', borderRadius: '14px', border: '1px solid rgba(0,0,0,0.06)', marginBottom: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.92rem', color: '#171717', fontFamily: 'Outfit' }}>
                        {b.service}
                      </span>
                      <span style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: '1.15rem', color: '#b5952f' }}>
                        ₦{Number(b.price).toLocaleString()}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#4b5563', marginTop: '0.4rem', fontWeight: 700 }}>
                      <Clock size={14} color="#d4af37" />
                      <span>{b.date} at {b.time}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.6rem' }}>
                    {b.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(b._id, 'accepted')}
                          disabled={updatingId === b._id}
                          className="app-btn app-btn-primary"
                          style={{ flex: 1, minHeight: '44px', fontSize: '0.82rem', borderRadius: '12px' }}
                        >
                          <CheckCircle size={15} /> Accept Request
                        </button>

                        <button
                          onClick={() => handleUpdateStatus(b._id, 'rejected')}
                          disabled={updatingId === b._id}
                          className="app-btn app-btn-outline"
                          style={{ flex: 1, minHeight: '44px', fontSize: '0.82rem', borderColor: '#ef4444', color: '#ef4444', borderRadius: '12px' }}
                        >
                          <XCircle size={15} /> Reject
                        </button>
                      </>
                    )}

                    {b.status === 'accepted' && (
                      <button
                        onClick={() => handleUpdateStatus(b._id, 'completed')}
                        disabled={updatingId === b._id}
                        className="app-btn app-btn-accent"
                        style={{ width: '100%', minHeight: '44px', fontSize: '0.85rem', borderRadius: '12px' }}
                      >
                        <CheckCircle size={15} /> Mark Service as Completed & Settled
                      </button>
                    )}

                    {b.status === 'completed' && (
                      <div style={{ width: '100%', textAlign: 'center', fontSize: '0.78rem', color: '#10b981', fontFamily: 'Outfit', fontWeight: 800, padding: '0.5rem', background: 'rgba(16,185,129,0.08)', borderRadius: '10px' }}>
                        ✓ Completed & Settled
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </BottomSheet>

      {/* ── 2. DEDICATED RECENT APPOINTMENT STREAM PAGE SHEET ── */}
      <BottomSheet
        isOpen={showActivitySheet}
        onClose={() => setShowActivitySheet(false)}
        title="Recent Appointment Stream"
      >
        <div style={{ paddingBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.82rem', color: '#6b7280', marginBottom: '1rem' }}>
            Live stream timeline of client appointments and booking updates in real-time.
          </p>

          {bookings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#9ca3af', fontSize: '0.85rem' }}>
              No active appointments yet. Client bookings will appear here in real time!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {bookings
                .slice()
                .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
                .map((item, idx) => (
                  <div key={idx} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.85rem 1rem', borderRadius: '16px',
                    background: '#fafafa', border: '1px solid rgba(0,0,0,0.06)',
                    gap: '0.75rem',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '12px',
                        background: 'rgba(212,175,55,0.15)', color: '#d4af37', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Calendar size={16} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{
                          fontFamily: 'Outfit', fontSize: '0.88rem', fontWeight: 800, color: '#171717',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {item.clientName || 'Client'} — {item.service || 'Service'}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#6b7280', marginTop: '0.15rem' }}>
                          📅 {item.date || ''} @ {item.time || ''} · Amount: ₦{Number(item.price || 0).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <StatusBadge status={item.status} />
                  </div>
                ))}
            </div>
          )}
        </div>
      </BottomSheet>

      {/* Delete Confirmation Modal */}
      <PopupModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Account?"
      >
        <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
          <div style={{
            width: '54px', height: '54px', borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1rem',
          }}>
            <AlertTriangle size={28} />
          </div>
          <h4 style={{ fontFamily: 'Outfit', fontSize: '1.1rem', fontWeight: 800, color: '#171717', marginBottom: '0.5rem' }}>
            Permanent Account Deletion
          </h4>
          <p style={{ color: '#6b7280', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
            Are you sure? This will permanently delete your expert account and all associated booking data. This cannot be undone.
          </p>
          <div style={{ display: 'flex', gap: '0.65rem' }}>
            <button onClick={() => setShowDeleteModal(false)} className="app-btn app-btn-outline" style={{ flex: 1 }}>
              Cancel
            </button>
            <button
              onClick={handleDeleteAccount}
              disabled={deletingAccount}
              className="app-btn"
              style={{ flex: 1, background: '#ef4444', color: '#ffffff', border: 'none' }}
            >
              {deletingAccount ? 'Deleting...' : 'Delete Permanently'}
            </button>
          </div>
        </div>
      </PopupModal>

      {/* Avatar Edit Sheet */}
      <BottomSheet
        isOpen={showAvatarSheet}
        onClose={() => setShowAvatarSheet(false)}
        title="Edit Profile Picture"
      >
        <div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <label
              htmlFor="expert-avatar-upload"
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
                  background: avatarInput
                    ? `url(${avatarInput}) center/cover no-repeat`
                    : 'linear-gradient(135deg, #d4af37, #b5952f)',
                  border: '3px solid #d4af37',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 6px 20px rgba(212,175,55,0.3)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {!avatarInput && <Scissors size={36} color="#ffffff" />}
                {uploadingPhoto ? (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(2px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.2rem' }}>
                    <RefreshCw size={18} color="#d4af37" style={{ animation: 'spin 1s linear infinite' }} />
                    <span style={{ color: '#d4af37', fontSize: '0.65rem', fontFamily: 'Outfit', fontWeight: 800 }}>Saving...</span>
                  </div>
                ) : (
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.45)', padding: '2px 0', display: 'flex', justifyContent: 'center' }}>
                    <Edit size={12} color="#ffffff" />
                  </div>
                )}
              </div>
            </label>

            <label
              htmlFor="expert-avatar-upload"
              style={{
                cursor: uploadingPhoto ? 'not-allowed' : 'pointer',
                background: uploadingPhoto ? 'rgba(212,175,55,0.3)' : 'rgba(212,175,55,0.15)',
                border: '1px solid rgba(212,175,55,0.4)',
                color: '#d4af37',
                padding: '0.5rem 1.25rem',
                borderRadius: '50px',
                fontSize: '0.82rem',
                fontFamily: 'Outfit',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <Edit size={14} />
              {uploadingPhoto ? 'Uploading...' : avatarInput ? 'Change Photo' : 'Upload Photo'}
            </label>
            <input
              id="expert-avatar-upload"
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              disabled={uploadingPhoto}
              onChange={handleExpertPhotoChange}
            />

            <p style={{ fontSize: '0.75rem', color: '#9ca3af', textAlign: 'center', fontFamily: 'Outfit' }}>
              Photo uploads automatically and saves to your profile
            </p>
          </div>
        </div>
      </BottomSheet>

      {/* Profile Picture Full Size Modal */}
      <ImagePreviewModal
        isOpen={showEnlargedAvatar}
        onClose={() => setShowEnlargedAvatar(false)}
        imageUrl={user?.avatarUrl}
        title={`${user?.firstname || 'Expert'}'s Profile Picture`}
      />
    </PageContainer>
  );
};

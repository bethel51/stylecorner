import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  ShieldCheck,
  Calendar,
  ShoppingBag,
  Wallet,
  Bell,
  Settings as SettingsIcon,
  HelpCircle,
  ChevronRight,
  LogOut,
  Trash2,
  Edit,
  Camera,
  Check,
  Sparkles,
  Star,
  Sun,
  Moon,
  Volume2,
  Lock,
  ArrowUpRight,
  Phone,
  Mail,
  MessageCircle,
  Clock,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { PageContainer } from '../components/common/PageContainer';
import { uploadToCloudinary } from '../services/cloudinary';
import { OptimizedImage } from '../components/common/OptimizedImage';
import { PopupModal } from '../components/common/PopupModal';
import { api } from '../services/api';
import { getFavoritesCount, subscribeToFavorites } from '../utils/favorites';
import { LocationSelector } from '../components/store/LocationSelector';

export const Profile = () => {
  const navigate = useNavigate();
  const { user, logout, updateProfile, deleteAccount, showToast } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();

  const [profileForm, setProfileForm] = useState({
    firstname: user?.firstname || '',
    lastname: user?.lastname || '',
    phone: user?.phone || '',
    avatarUrl: user?.avatarUrl || '',
  });

  const [profileLocation, setProfileLocation] = useState({
    state: user?.state || 'Lagos',
    lga: user?.lga || 'Ikeja',
    street: '',
    houseNumber: '',
  });

  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [saving, setSaving] = useState(false);

  // Settings Toggles (Persisted in localStorage)
  const [settingsPreferences, setSettingsPreferences] = useState(() => {
    return {
      bookingAlerts: localStorage.getItem('pref_booking_alerts') !== 'false',
      specialPromos: localStorage.getItem('pref_special_promos') === 'true',
      hapticSounds: localStorage.getItem('pref_sound_effects') !== 'false',
    };
  });

  const handleTogglePref = (key) => {
    setSettingsPreferences((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      localStorage.setItem(`pref_${key}`, updated[key]);
      return updated;
    });
  };

  const [stats, setStats] = useState({
    bookings: 0,
    reviews: 0,
    favorites: getFavoritesCount(),
  });
  const [reviewsList, setReviewsList] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);

  const isStaff = user?.role === 'staff' || user?.role === 'expert';

  useEffect(() => {
    let isMounted = true;
    const fetchUserStats = async () => {
      setLoadingStats(true);
      try {
        const fullName = `${user?.firstname || ''} ${user?.lastname || ''}`.trim() || user?.firstname || '';
        
        const [bookingsRes, reviewsRes] = await Promise.all([
          api.getBookings().catch(() => []),
          isStaff
            ? (fullName ? api.getSpecialistReviews(fullName).catch(() => []) : Promise.resolve([]))
            : api.getMyReviews().catch(() => []),
        ]);

        if (isMounted) {
          const loadedReviews = Array.isArray(reviewsRes) ? reviewsRes : [];
          setReviewsList(loadedReviews);
          setStats({
            bookings: Array.isArray(bookingsRes) ? bookingsRes.length : 0,
            reviews: loadedReviews.length,
            favorites: getFavoritesCount(),
          });
        }
      } catch (err) {
        console.warn('Profile stats fetch notice:', err);
      } finally {
        if (isMounted) setLoadingStats(false);
      }
    };

    fetchUserStats();

    const unsub = subscribeToFavorites((_, count) => {
      if (isMounted) {
        setStats((prev) => ({ ...prev, favorites: count }));
      }
    });

    return () => {
      isMounted = false;
      unsub();
    };
  }, [user, isStaff]);

  useEffect(() => {
    if (user) {
      setProfileForm({
        firstname: user.firstname || '',
        lastname: user.lastname || '',
        phone: user.phone || '',
        avatarUrl: user.avatarUrl || '',
      });
      setProfileLocation({
        state: user.state || 'Lagos',
        lga: user.lga || 'Ikeja',
        street: '',
        houseNumber: '',
      });
    }
  }, [user]);

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file.', 'error');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setProfileForm((prev) => ({ ...prev, avatarUrl: previewUrl }));
    setUploadingPhoto(true);

    try {
      const url = await uploadToCloudinary(file);
      setProfileForm((prev) => ({ ...prev, avatarUrl: url }));
      await updateProfile({ avatarUrl: url });
      showToast('Profile picture updated successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to upload photo.', 'error');
      setProfileForm((prev) => ({ ...prev, avatarUrl: user?.avatarUrl || '' }));
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        firstname: profileForm.firstname.trim(),
        lastname: profileForm.lastname.trim(),
        phone: profileForm.phone.trim(),
        state: profileLocation.state,
        lga: profileLocation.lga,
      });
      setShowEditModal(false);
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update profile.', 'error');
    } finally {
      setSaving(false);
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

  const handleClearCache = () => {
    localStorage.removeItem('cached_products_offline');
    sessionStorage.clear();
    showToast('Atelier cache refreshed!', 'success');
    setTimeout(() => window.location.reload(), 400);
  };

  // Structured menu items with fully corrected navigation flows
  const menuItems = [
    ...(isStaff
      ? [
          {
            id: 'expert-studio',
            label: 'Specialist Studio Dashboard',
            badge: 'Pro Studio',
            icon: Sparkles,
            onClick: () => navigate('/expert-dashboard'),
          },
        ]
      : []),
    {
      id: 'my-profile',
      label: 'My Profile',
      icon: User,
      onClick: () => setShowEditModal(true),
    },
    {
      id: 'my-bookings',
      label: isStaff ? 'Client Appointments & History' : 'My Bookings & History',
      badge: stats.bookings > 0 ? `${stats.bookings}` : null,
      icon: Calendar,
      onClick: () => navigate('/my-bookings'),
    },
    {
      id: 'my-orders',
      label: isStaff ? 'Shop Boutique' : 'My Orders & Boutique',
      icon: ShoppingBag,
      onClick: () => navigate(isStaff ? '/store' : '/customer-dashboard'),
    },
    {
      id: 'wallet-payments',
      label: 'Wallet & Payments',
      icon: Wallet,
      onClick: () => navigate('/wallet'),
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      onClick: () => navigate('/notifications'),
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: SettingsIcon,
      onClick: () => setShowSettingsModal(true),
    },
    {
      id: 'help-support',
      label: 'Help & Support',
      icon: HelpCircle,
      onClick: () => setShowHelpModal(true),
    },
  ];

  return (
    <PageContainer showBack={true} backTo="/">
      <div style={{ maxWidth: '480px', margin: '0 auto', paddingBottom: '3.5rem' }}>
        
        {/* Profile Header Card */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            marginBottom: '1.5rem',
          }}
        >
          {/* Avatar with Camera upload button */}
          <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
            <div
              style={{
                width: '86px',
                height: '86px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '2.5px solid #f5b942',
                backgroundColor: 'var(--color-surface, #1c202d)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
              }}
            >
              {user?.avatarUrl ? (
                <OptimizedImage
                  src={user.avatarUrl}
                  alt={user?.firstname || 'Profile'}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <span style={{ fontFamily: 'Outfit', fontSize: '2.2rem', fontWeight: 900, color: '#f5b942' }}>
                  {user?.firstname?.charAt(0) || 'B'}
                </span>
              )}
            </div>

            <label
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                background: '#f5b942',
                color: '#0c0e14',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                border: '2.5px solid #0c0e14',
                boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
              }}
              title="Upload photo"
            >
              <Camera size={15} />
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                style={{ display: 'none' }}
              />
            </label>
          </div>

          {/* Name & Verified Badge */}
          <h2 style={{ fontFamily: 'Outfit', fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-text-primary, #ffffff)', margin: '0 0 0.25rem' }}>
            {user ? (`${user.firstname || ''} ${user.lastname || ''}`.trim() || user.email?.split('@')[0] || 'Valued Member') : 'Guest User'}
          </h2>

          {(user?.role === 'staff' || user?.isVerified) && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#f5b942', fontSize: '0.78rem', fontWeight: 700, fontFamily: 'Outfit' }}>
              <ShieldCheck size={14} />
              <span>Verified {user?.role === 'staff' ? 'Specialist' : 'Member'}</span>
            </div>
          )}

          {/* Stat Counters: Bookings | Reviews | Favorites */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              width: '100%',
              background: 'linear-gradient(145deg, #151822 0%, #10131b 100%)',
              borderRadius: '20px',
              padding: '0.95rem 0.5rem',
              marginTop: '1.25rem',
              border: '1px solid rgba(245, 185, 66, 0.18)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
            }}
          >
            {/* Bookings Counter -> Navigates directly to the new My Bookings page */}
            <div
              onClick={() => navigate('/my-bookings')}
              style={{ cursor: 'pointer', textAlign: 'center' }}
              title="View all bookings & schedule history"
            >
              <div style={{ fontFamily: 'Outfit', fontSize: '1.4rem', fontWeight: 900, color: 'var(--color-text-primary, #ffffff)', lineHeight: 1 }}>
                {loadingStats ? '…' : stats.bookings}
              </div>
              <div style={{ fontSize: '0.72rem', fontFamily: 'Outfit', fontWeight: 700, color: '#94a3b8', marginTop: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Bookings
              </div>
            </div>

            {/* Reviews Counter -> Opens dedicated Reviews Modal */}
            <div
              onClick={() => setShowReviewsModal(true)}
              style={{
                borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
                borderRight: '1px solid rgba(255, 255, 255, 0.08)',
                cursor: 'pointer',
                textAlign: 'center',
              }}
              title="View ratings & reviews"
            >
              <div style={{ fontFamily: 'Outfit', fontSize: '1.4rem', fontWeight: 900, color: '#f5b942', lineHeight: 1 }}>
                {loadingStats ? '…' : stats.reviews}
              </div>
              <div style={{ fontSize: '0.72rem', fontFamily: 'Outfit', fontWeight: 700, color: '#94a3b8', marginTop: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Reviews
              </div>
            </div>

            {/* Favorites Counter -> Navigates to Boutique Store */}
            <div
              onClick={() => navigate('/store')}
              style={{ cursor: 'pointer', textAlign: 'center' }}
              title="View saved favorites in Boutique"
            >
              <div style={{ fontFamily: 'Outfit', fontSize: '1.4rem', fontWeight: 900, color: 'var(--color-text-primary, #ffffff)', lineHeight: 1 }}>
                {stats.favorites}
              </div>
              <div style={{ fontSize: '0.72rem', fontFamily: 'Outfit', fontWeight: 700, color: '#94a3b8', marginTop: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Favorites
              </div>
            </div>
          </div>
        </div>

        {/* Menu Items List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', marginBottom: '1.75rem' }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                onClick={item.onClick}
                style={{
                  background: 'var(--color-surface, #151822)',
                  borderRadius: '16px',
                  padding: '1rem',
                  border: '1px solid var(--color-border, rgba(255, 255, 255, 0.06))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '11px',
                      background: 'rgba(245, 185, 66, 0.12)',
                      color: '#f5b942',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon size={19} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontFamily: 'Outfit', fontSize: '0.94rem', fontWeight: 700, color: 'var(--color-text-primary, #ffffff)' }}>
                      {item.label}
                    </span>
                    {item.badge && (
                      <span
                        style={{
                          background: '#f5b942',
                          color: '#0c0e14',
                          fontSize: '0.65rem',
                          fontWeight: 800,
                          padding: '0.1rem 0.45rem',
                          borderRadius: '999px',
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                </div>

                <ChevronRight size={18} color="#64748b" />
              </div>
            );
          })}
        </div>

        {/* Log Out & Delete Account Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          <button
            onClick={logout}
            className="app-btn app-btn-outline"
            style={{
              borderRadius: '14px',
              minHeight: '46px',
              color: '#f87171',
              borderColor: 'rgba(239, 68, 68, 0.3)',
              fontWeight: 800,
              fontSize: '0.92rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
            }}
          >
            <LogOut size={17} /> Sign Out
          </button>

          <button
            onClick={() => setShowDeleteModal(true)}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
              fontFamily: 'Outfit',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              padding: '0.5rem',
            }}
          >
            Delete Account Permanently
          </button>
        </div>

      </div>

      {/* 1. Edit Profile Modal */}
      <PopupModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="My Profile Information"
      >
        <form onSubmit={handleSaveProfile}>
          <div className="app-input-group">
            <label className="app-label">First Name</label>
            <input
              type="text"
              className="app-input"
              value={profileForm.firstname}
              onChange={(e) => setProfileForm({ ...profileForm, firstname: e.target.value })}
              required
            />
          </div>

          <div className="app-input-group">
            <label className="app-label">Last Name</label>
            <input
              type="text"
              className="app-input"
              value={profileForm.lastname}
              onChange={(e) => setProfileForm({ ...profileForm, lastname: e.target.value })}
              required
            />
          </div>

          <div className="app-input-group">
            <label className="app-label">Phone Number</label>
            <input
              type="tel"
              className="app-input"
              value={profileForm.phone}
              placeholder="+234 800 000 0000"
              onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
            />
          </div>

          {/* Location */}
          <div
            style={{
              background: 'rgba(245, 185, 66, 0.06)',
              border: '1px solid rgba(245, 185, 66, 0.2)',
              borderRadius: '14px',
              padding: '0.85rem',
              marginBottom: '0.75rem',
            }}
          >
            <label
              className="app-label"
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 800, marginBottom: '0.45rem' }}
            >
              <MapPin size={15} color="#f5b942" /> Your Primary Location
            </label>
            <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '0 0 0.65rem', lineHeight: 1.4 }}>
              Used to match you with nearby master stylists, lash artists, and barbers.
            </p>
            <LocationSelector
              location={profileLocation}
              onChange={(loc) => setProfileLocation((prev) => ({ ...prev, state: loc.state, lga: loc.lga }))}
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="app-btn app-btn-accent"
            style={{ marginTop: '0.5rem', borderRadius: '12px', minHeight: '46px', fontWeight: 800 }}
          >
            {saving ? 'Saving Changes...' : 'Save Profile Changes'}
          </button>
        </form>
      </PopupModal>

      {/* 2. Dedicated Settings Modal (Appearance, Notifications, Security) */}
      <PopupModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        title="Account & App Settings"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Appearance Section */}
          <div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Appearance
            </div>
            <div
              style={{
                background: 'var(--color-surface, #151822)',
                border: '1px solid var(--color-border, rgba(255, 255, 255, 0.08))',
                borderRadius: '14px',
                padding: '0.85rem 1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'rgba(245, 185, 66, 0.15)',
                    color: '#f5b942',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {isDark ? <Moon size={16} /> : <Sun size={16} />}
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--color-text-primary, #ffffff)' }}>
                    {isDark ? 'Dark Atelier Theme' : 'Light Atelier Theme'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                    {isDark ? 'Signature obsidian & champagne aesthetic' : 'Bright atelier clean view'}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={toggleTheme}
                style={{
                  background: '#f5b942',
                  color: '#0c0e14',
                  border: 'none',
                  borderRadius: '999px',
                  padding: '0.35rem 0.85rem',
                  fontSize: '0.76rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Switch to {isDark ? 'Light' : 'Dark'}
              </button>
            </div>
          </div>

          {/* Preferences Section */}
          <div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Notifications & Sound
            </div>
            <div
              style={{
                background: 'var(--color-surface, #151822)',
                border: '1px solid var(--color-border, rgba(255, 255, 255, 0.08))',
                borderRadius: '14px',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div
                style={{
                  padding: '0.85rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-text-primary, #ffffff)' }}>
                    Booking Reminders
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                    Receive alerts 2 hours prior to your session
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settingsPreferences.bookingAlerts}
                  onChange={() => handleTogglePref('bookingAlerts')}
                  style={{ accentColor: '#f5b942', width: '18px', height: '18px', cursor: 'pointer' }}
                />
              </div>

              <div
                style={{
                  padding: '0.85rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-text-primary, #ffffff)' }}>
                    Special Atelier Offers
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                    VIP promotional rates and limited seasonal slots
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settingsPreferences.specialPromos}
                  onChange={() => handleTogglePref('specialPromos')}
                  style={{ accentColor: '#f5b942', width: '18px', height: '18px', cursor: 'pointer' }}
                />
              </div>
            </div>
          </div>

          {/* Security & System Actions */}
          <div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Security & Cache
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => {
                  setShowSettingsModal(false);
                  navigate('/forgot-password');
                }}
                className="app-btn app-btn-outline"
                style={{
                  borderRadius: '12px',
                  minHeight: '42px',
                  fontSize: '0.82rem',
                  justifyContent: 'flex-start',
                  paddingLeft: '1rem',
                  color: 'var(--color-text-primary, #ffffff)',
                }}
              >
                <Lock size={15} color="#f5b942" /> Reset / Change Password
              </button>

              <button
                type="button"
                onClick={handleClearCache}
                className="app-btn app-btn-outline"
                style={{
                  borderRadius: '12px',
                  minHeight: '42px',
                  fontSize: '0.82rem',
                  justifyContent: 'flex-start',
                  paddingLeft: '1rem',
                  color: '#94a3b8',
                }}
              >
                Clear Offline Cache & Refresh App
              </button>
            </div>
          </div>

        </div>
      </PopupModal>

      {/* 3. Dedicated Reviews Modal */}
      <PopupModal
        isOpen={showReviewsModal}
        onClose={() => setShowReviewsModal(false)}
        title={isStaff ? 'Client Reviews & Ratings' : 'My Session Reviews'}
      >
        <div>
          {reviewsList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <Star size={36} color="#f5b942" style={{ margin: '0 auto 0.75rem', opacity: 0.8 }} />
              <h4 style={{ fontFamily: 'Outfit', fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-text-primary, #ffffff)', margin: '0 0 0.35rem' }}>
                No reviews yet
              </h4>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
                {isStaff
                  ? 'Completed client appointments will receive reviews and ratings that appear here.'
                  : 'After completing an appointment, you can rate your master specialist and leave feedback.'}
              </p>
              {!isStaff && (
                <button
                  onClick={() => {
                    setShowReviewsModal(false);
                    navigate('/my-bookings?tab=history');
                  }}
                  className="app-btn app-btn-accent"
                  style={{ marginTop: '1rem', borderRadius: '12px', fontSize: '0.84rem' }}
                >
                  View Completed Sessions
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '60vh', overflowY: 'auto' }}>
              {reviewsList.map((rev, idx) => (
                <div
                  key={rev._id || idx}
                  style={{
                    background: 'var(--color-surface, #151822)',
                    borderRadius: '14px',
                    padding: '0.85rem',
                    border: '1px solid var(--color-border, rgba(255, 255, 255, 0.08))',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--color-text-primary, #ffffff)' }}>
                      {rev.serviceName || rev.service || 'Atelier Service'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={13}
                          color={i < (rev.rating || 5) ? '#f5b942' : '#475569'}
                          fill={i < (rev.rating || 5) ? '#f5b942' : 'none'}
                        />
                      ))}
                    </div>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#cbd5e1', margin: '0 0 0.35rem', lineHeight: 1.4 }}>
                    "{rev.comment || 'Exceptional craftsmanship and punctual service.'}"
                  </p>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                    Specialist: {rev.stylistName || 'Master Stylist'} • {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'Recent'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </PopupModal>

      {/* 4. Help & Support Modal */}
      <PopupModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
        title="Concierge & Client Support"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <p style={{ fontSize: '0.86rem', color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
            Need immediate assistance with your booking, custom styling requests, or VIP concierge service? Our atelier desk is here for you.
          </p>

          <div
            style={{
              background: 'var(--color-surface, #151822)',
              border: '1px solid var(--color-border, rgba(255, 255, 255, 0.08))',
              borderRadius: '14px',
              padding: '0.85rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'rgba(245, 185, 66, 0.15)',
                  color: '#f5b942',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Mail size={16} />
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>
                  Concierge Email
                </span>
                <div style={{ color: 'var(--color-text-primary, #ffffff)', fontWeight: 700, fontSize: '0.88rem' }}>
                  concierge@stylecorner.world
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MessageCircle size={16} />
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>
                  WhatsApp Concierge
                </span>
                <div style={{ color: 'var(--color-text-primary, #ffffff)', fontWeight: 700, fontSize: '0.88rem' }}>
                  +234 812 345 6789
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              setShowHelpModal(false);
              navigate('/contact');
            }}
            className="app-btn app-btn-accent"
            style={{ borderRadius: '12px', minHeight: '44px', fontWeight: 800 }}
          >
            Open Dedicated Contact Form
          </button>
        </div>
      </PopupModal>

      {/* 5. Delete Account Confirmation Modal */}
      <PopupModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Account?"
      >
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '0.88rem', color: '#f87171', marginBottom: '1.25rem', lineHeight: 1.4 }}>
            Are you sure you want to delete your account? This action will permanently erase your profile, saved appointments, and wallet history.
          </p>
          <div style={{ display: 'flex', gap: '0.65rem' }}>
            <button
              type="button"
              onClick={() => setShowDeleteModal(false)}
              className="app-btn app-btn-outline"
              style={{ flex: 1, borderRadius: '12px' }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteAccount}
              disabled={deletingAccount}
              className="app-btn"
              style={{ flex: 1, background: '#ef4444', color: '#ffffff', borderRadius: '12px', fontWeight: 800 }}
            >
              {deletingAccount ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </PopupModal>

    </PageContainer>
  );
};

export default Profile;

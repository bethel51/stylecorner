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
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PageContainer } from '../components/common/PageContainer';
import { uploadToCloudinary } from '../services/cloudinary';
import { OptimizedImage } from '../components/common/OptimizedImage';
import { PopupModal } from '../components/common/PopupModal';
import { api } from '../services/api';
import { getFavoritesCount, subscribeToFavorites } from '../utils/favorites';

export const Profile = () => {
  const navigate = useNavigate();
  const { user, logout, updateProfile, deleteAccount, showToast } = useAuth();

  const [profileForm, setProfileForm] = useState({
    firstname: user?.firstname || '',
    lastname: user?.lastname || '',
    phone: user?.phone || '',
    avatarUrl: user?.avatarUrl || '',
  });

  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [saving, setSaving] = useState(false);

  const [stats, setStats] = useState({
    bookings: 0,
    reviews: 0,
    favorites: getFavoritesCount(),
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchUserStats = async () => {
      setLoadingStats(true);
      try {
        const isStaff = user?.role === 'staff' || user?.role === 'expert';
        const fullName = `${user?.firstname || ''} ${user?.lastname || ''}`.trim() || user?.firstname || '';
        
        const [bookingsRes, reviewsRes] = await Promise.all([
          api.getBookings().catch(() => []),
          isStaff
            ? (fullName ? api.getSpecialistReviews(fullName).catch(() => []) : Promise.resolve([]))
            : api.getMyReviews().catch(() => []),
        ]);

        if (isMounted) {
          setStats({
            bookings: Array.isArray(bookingsRes) ? bookingsRes.length : 0,
            reviews: Array.isArray(reviewsRes) ? reviewsRes.length : 0,
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
  }, [user]);

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

  const isStaff = user?.role === 'staff' || user?.role === 'expert';

  const menuItems = [
    ...(isStaff
      ? [
          {
            id: 'expert-studio',
            label: 'Specialist Studio Dashboard',
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
      label: isStaff ? 'Client Appointments' : 'My Bookings',
      icon: Calendar,
      onClick: () => navigate(isStaff ? '/expert-dashboard' : '/customer-dashboard'),
    },
    {
      id: 'my-orders',
      label: isStaff ? 'Shop Boutique' : 'My Orders',
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
      onClick: () => setShowEditModal(true),
    },
    {
      id: 'help-support',
      label: 'Help & Support',
      icon: HelpCircle,
      onClick: () => setShowHelpModal(true),
    },
  ];

  return (
    <PageContainer showBack={true}>
      <div style={{ maxWidth: '480px', margin: '0 auto', paddingBottom: '3rem' }}>
        
        {/* Screen 9: Profile Header Card */}
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
                width: '84px',
                height: '84px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '2.5px solid #f5b942',
                backgroundColor: '#1c202d',
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
                <span style={{ fontFamily: 'Outfit', fontSize: '2rem', fontWeight: 900, color: '#f5b942' }}>
                  {user?.firstname?.charAt(0) || 'B'}
                </span>
              )}
            </div>

            <label
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: '#f5b942',
                color: '#0c0e14',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                border: '2px solid #0c0e14',
              }}
              title="Upload photo"
            >
              <Camera size={14} />
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                style={{ display: 'none' }}
              />
            </label>
          </div>

          {/* Name & Verified Badge */}
          <h2 style={{ fontFamily: 'Outfit', fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.25rem' }}>
            {user ? (`${user.firstname || ''} ${user.lastname || ''}`.trim() || user.email?.split('@')[0] || 'Valued Member') : 'Guest User'}
          </h2>

          {(user?.role === 'staff' || user?.isVerified) && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#f5b942', fontSize: '0.78rem', fontWeight: 700, fontFamily: 'Outfit' }}>
              <ShieldCheck size={14} />
              <span>Verified {user?.role === 'staff' ? 'Specialist' : 'Member'}</span>
            </div>
          )}

          {/* Stat Counters: Bookings | Reviews | Favorites (100% Real Dynamic Live Data) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              width: '100%',
              background: 'linear-gradient(145deg, #151822 0%, #10131b 100%)',
              borderRadius: '20px',
              padding: '0.95rem 0.5rem',
              marginTop: '1.25rem',
              border: '1px solid rgba(245, 185, 66, 0.15)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
            }}
          >
            <div
              onClick={() => navigate(isStaff ? '/expert-dashboard' : '/customer-dashboard')}
              style={{ cursor: 'pointer', textAlign: 'center' }}
              title="View bookings"
            >
              <div style={{ fontFamily: 'Outfit', fontSize: '1.35rem', fontWeight: 900, color: '#ffffff', lineHeight: 1 }}>
                {loadingStats ? '…' : stats.bookings}
              </div>
              <div style={{ fontSize: '0.72rem', fontFamily: 'Outfit', fontWeight: 700, color: '#94a3b8', marginTop: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Bookings
              </div>
            </div>

            <div
              onClick={() => navigate(isStaff ? '/expert-dashboard' : '/customer-dashboard')}
              style={{
                borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
                borderRight: '1px solid rgba(255, 255, 255, 0.08)',
                cursor: 'pointer',
                textAlign: 'center',
              }}
              title="View reviews"
            >
              <div style={{ fontFamily: 'Outfit', fontSize: '1.35rem', fontWeight: 900, color: '#f5b942', lineHeight: 1 }}>
                {loadingStats ? '…' : stats.reviews}
              </div>
              <div style={{ fontSize: '0.72rem', fontFamily: 'Outfit', fontWeight: 700, color: '#94a3b8', marginTop: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Reviews
              </div>
            </div>

            <div
              onClick={() => navigate('/store')}
              style={{ cursor: 'pointer', textAlign: 'center' }}
              title="View saved favorites in Boutique"
            >
              <div style={{ fontFamily: 'Outfit', fontSize: '1.35rem', fontWeight: 900, color: '#ffffff', lineHeight: 1 }}>
                {stats.favorites}
              </div>
              <div style={{ fontSize: '0.72rem', fontFamily: 'Outfit', fontWeight: 700, color: '#94a3b8', marginTop: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Favorites
              </div>
            </div>
          </div>
        </div>


        {/* Screen 9: Menu List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                onClick={item.onClick}
                style={{
                  background: '#151822',
                  borderRadius: '16px',
                  padding: '1rem',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: 'rgba(245, 185, 66, 0.12)',
                      color: '#f5b942',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon size={18} />
                  </div>
                  <span style={{ fontFamily: 'Outfit', fontSize: '0.92rem', fontWeight: 700, color: '#ffffff' }}>
                    {item.label}
                  </span>
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
            style={{ borderRadius: '14px', minHeight: '44px', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.3)' }}
          >
            <LogOut size={16} /> Sign Out
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

      {/* Edit Profile Modal */}
      <PopupModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Profile"
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
              onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="app-btn app-btn-accent"
            style={{ marginTop: '1rem', borderRadius: '12px' }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </PopupModal>

      {/* Help & Support Modal */}
      <PopupModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
        title="Help & Support"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.5 }}>
            Need assistance with your booking or order? Our StyleCorner concierge team is available 24/7.
          </p>
          <div style={{ background: '#1c202d', padding: '0.85rem', borderRadius: '12px' }}>
            <span style={{ fontSize: '0.75rem', color: '#f5b942', fontWeight: 800, textTransform: 'uppercase' }}>Direct Support Email</span>
            <div style={{ color: '#ffffff', fontWeight: 700, marginTop: '0.2rem' }}>support@stylecorner.com</div>
          </div>
          <button
            onClick={() => navigate('/contact')}
            className="app-btn app-btn-accent"
            style={{ borderRadius: '12px', minHeight: '44px' }}
          >
            Open Contact Form
          </button>
        </div>
      </PopupModal>

      {/* Delete Account Confirmation Modal */}
      <PopupModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Account?"
      >
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '0.88rem', color: '#f87171', marginBottom: '1.25rem' }}>
            Are you sure you want to delete your account? This action is permanent and cannot be undone.
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
              style={{ flex: 1, background: '#ef4444', color: '#ffffff', borderRadius: '12px' }}
            >
              {deletingAccount ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </PopupModal>

    </PageContainer>
  );
};

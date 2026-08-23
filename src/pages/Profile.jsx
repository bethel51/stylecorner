import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  Edit,
  LogOut,
  Trash2,
  MapPin,
  Building,
  Home,
  Check,
  RefreshCw,
  Sparkles,
  ArrowLeft,
  Calendar,
  Award
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PageContainer } from '../components/common/PageContainer';
import { uploadToCloudinary } from '../services/cloudinary';
import { ImagePreviewModal } from '../components/common/ImagePreviewModal';
import { PopupModal } from '../components/common/PopupModal';
import { LocationSelector } from '../components/store/LocationSelector';

export const Profile = () => {
  const navigate = useNavigate();
  const { user, logout, updateProfile, deleteAccount, showToast } = useAuth();

  const [profileForm, setProfileForm] = useState({
    firstname: user?.firstname || '',
    lastname: user?.lastname || '',
    phone: user?.phone || '',
    avatarUrl: user?.avatarUrl || '',
    specialties: user?.specialties ? (Array.isArray(user.specialties) ? user.specialties.join(', ') : user.specialties) : '',
  });

  const [location, setLocation] = useState({
    state: user?.state || 'Lagos',
    lga: user?.lga || 'Ikeja',
    street: user?.street || '',
    houseNumber: user?.houseNumber || '',
  });

  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showEnlargedAvatar, setShowEnlargedAvatar] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({
        firstname: user.firstname || '',
        lastname: user.lastname || '',
        phone: user.phone || '',
        avatarUrl: user.avatarUrl || '',
        specialties: user.specialties ? (Array.isArray(user.specialties) ? user.specialties.join(', ') : user.specialties) : '',
      });
      setLocation({
        state: user.state || 'Lagos',
        lga: user.lga || 'Ikeja',
        street: user.street || '',
        houseNumber: user.houseNumber || '',
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const specialtiesArr = profileForm.specialties
        ? profileForm.specialties.split(',').map(s => s.trim()).filter(Boolean)
        : [];

      await updateProfile({
        firstname: profileForm.firstname.trim(),
        lastname: profileForm.lastname.trim(),
        phone: profileForm.phone.trim(),
        specialties: specialtiesArr,
        state: location.state,
        lga: location.lga,
        street: location.street,
        houseNumber: location.houseNumber,
      });

      showToast('Profile and location details saved successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to save profile', 'error');
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

  const isStaff = user?.role === 'staff';

  return (
    <PageContainer title={`${isStaff ? 'Expert' : 'User'} Profile`}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        
        {/* Top Back & Navigation Banner */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: 'none',
              border: 'none',
              color: '#d4af37',
              fontFamily: 'Outfit',
              fontWeight: 800,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <ArrowLeft size={16} /> Back to {isStaff ? 'Expert Dashboard' : 'Dashboard'}
          </button>
        </div>

        {/* Profile Card Header */}
        <div
          className="app-card"
          style={{
            background: 'linear-gradient(135deg, #1f1f1f 0%, #121212 100%)',
            color: '#ffffff',
            border: '1.5px solid rgba(212, 175, 55, 0.45)',
            padding: '1.5rem',
            borderRadius: '24px',
            marginBottom: '1.5rem',
            boxShadow: '0 16px 36px rgba(0,0,0,0.2)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
            {/* Avatar with click to view / upload */}
            <div style={{ position: 'relative' }}>
              <div
                onClick={() => {
                  if (user?.avatarUrl) setShowEnlargedAvatar(true);
                }}
                style={{
                  width: '90px',
                  height: '90px',
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
                  boxShadow: '0 8px 24px rgba(212,175,55,0.3)',
                  cursor: user?.avatarUrl ? 'pointer' : 'default',
                }}
              >
                {!profileForm.avatarUrl && (profileForm.firstname ? profileForm.firstname[0].toUpperCase() : 'U')}
              </div>

              <label
                htmlFor="profile-page-avatar-upload"
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  background: '#d4af37',
                  color: '#121212',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                }}
                title="Upload Photo"
              >
                <Edit size={14} />
              </label>
              <input
                id="profile-page-avatar-upload"
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                disabled={uploadingPhoto}
                onChange={handlePhotoChange}
              />
            </div>

            {/* User Info Details */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <h2 style={{ fontFamily: 'Outfit', fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                  {user?.firstname} {user?.lastname}
                </h2>
                <span
                  style={{
                    background: 'rgba(212, 175, 55, 0.2)',
                    color: '#d4af37',
                    fontSize: '0.7rem',
                    fontFamily: 'Outfit',
                    fontWeight: 800,
                    padding: '0.2rem 0.65rem',
                    borderRadius: '50px',
                    border: '1px solid rgba(212,175,55,0.4)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {isStaff ? 'Styling Expert' : 'Atelier VIP Client'}
                </span>
              </div>

              <p style={{ color: '#a1a1aa', fontSize: '0.85rem', margin: '0.35rem 0 0.5rem' }}>
                📧 {user?.email}
              </p>

              {user?.phone && (
                <p style={{ color: '#a1a1aa', fontSize: '0.85rem', margin: 0 }}>
                  📞 {user.phone}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Profile Edit Form & Location Selector Form */}
        <form onSubmit={handleSubmit}>
          
          {/* Section 1: Personal Details */}
          <div className="app-card" style={{ marginBottom: '1.25rem', padding: '1.25rem' }}>
            <h3 style={{ fontFamily: 'Outfit', fontSize: '1.05rem', fontWeight: 800, color: '#171717', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <User size={18} color="#d4af37" /> Personal Information
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
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
            </div>

            <div className="app-input-group">
              <label className="app-label">Phone Number</label>
              <input
                type="tel"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                className="app-input"
                placeholder="+234 800 000 0000"
              />
            </div>

            {isStaff && (
              <div className="app-input-group">
                <label className="app-label">Specialties & Offerings (Comma separated)</label>
                <input
                  type="text"
                  value={profileForm.specialties}
                  onChange={(e) => setProfileForm({ ...profileForm, specialties: e.target.value })}
                  className="app-input"
                  placeholder="Skin Fades, Knotless Braids, Beard Elixirs, Gel Nails"
                />
              </div>
            )}
          </div>

          {/* Section 2: Saved Delivery Address */}
          <div className="app-card" style={{ marginBottom: '1.25rem', padding: '1.25rem' }}>
            <h3 style={{ fontFamily: 'Outfit', fontSize: '1.05rem', fontWeight: 800, color: '#171717', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <MapPin size={18} color="#d4af37" /> Default Delivery Location
            </h3>
            
            <LocationSelector location={location} onChange={setLocation} />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="app-btn app-btn-primary"
            style={{ marginBottom: '1.5rem', minHeight: '46px', fontSize: '0.9rem' }}
          >
            {saving ? 'Saving Profile Changes...' : 'Save Profile Changes'}
          </button>
        </form>

        {/* Section 3: Account Actions */}
        <div className="app-card" style={{ padding: '1.25rem', border: '1px solid rgba(239,68,68,0.2)' }}>
          <h3 style={{ fontFamily: 'Outfit', fontSize: '1.05rem', fontWeight: 800, color: '#171717', marginBottom: '1rem' }}>
            Account Controls
          </h3>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={logout}
              className="app-btn app-btn-outline"
              style={{ flex: 1, justifyContent: 'center', gap: '0.5rem', minHeight: '42px' }}
            >
              <LogOut size={16} /> Sign Out
            </button>

            <button
              onClick={() => setShowDeleteModal(true)}
              className="app-btn"
              style={{
                flex: 1,
                background: 'rgba(239,68,68,0.08)',
                color: '#ef4444',
                border: '1px solid rgba(239,68,68,0.3)',
                justifyContent: 'center',
                gap: '0.5rem',
                minHeight: '42px',
              }}
            >
              <Trash2 size={16} /> Delete Account
            </button>
          </div>
        </div>

      </div>

      {/* Profile Picture Full Modal */}
      <ImagePreviewModal
        isOpen={showEnlargedAvatar}
        onClose={() => setShowEnlargedAvatar(false)}
        imageUrl={user?.avatarUrl}
        title={`${user?.firstname || 'User'}'s Profile Picture`}
      />

      {/* Delete Account Modal */}
      <PopupModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Account?"
      >
        <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
          <h4 style={{ fontFamily: 'Outfit', fontSize: '1.1rem', fontWeight: 800, color: '#171717', marginBottom: '0.5rem' }}>
            Permanent Account Deletion
          </h4>
          <p style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            Are you sure you want to permanently delete your account? All data will be removed.
          </p>
          <div style={{ display: 'flex', gap: '0.65rem' }}>
            <button onClick={() => setShowDeleteModal(false)} className="app-btn app-btn-outline" style={{ flex: 1 }}>
              Cancel
            </button>
            <button onClick={handleDeleteAccount} disabled={deletingAccount} className="app-btn" style={{ flex: 1, background: '#ef4444', color: '#ffffff', border: 'none' }}>
              {deletingAccount ? 'Deleting...' : 'Delete Permanently'}
            </button>
          </div>
        </div>
      </PopupModal>
    </PageContainer>
  );
};

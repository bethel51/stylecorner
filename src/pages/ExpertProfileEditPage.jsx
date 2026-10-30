import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Camera,
  MapPin,
  Sparkles,
  Phone,
  Briefcase,
  Check,
  ShieldCheck,
  Building,
} from 'lucide-react';
import { PageContainer } from '../components/common/PageContainer';
import { useAuth } from '../context/AuthContext';
import { uploadToCloudinary } from '../services/cloudinary';
import { LocationSelector } from '../components/store/LocationSelector';

export const ExpertProfileEditPage = () => {
  const navigate = useNavigate();
  const { user, updateProfile, showToast } = useAuth();

  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const [expertProfileForm, setExpertProfileForm] = useState({
    firstname: user?.firstname || '',
    lastname: user?.lastname || '',
    phone: user?.phone || '',
    title: user?.title || '',
    businessAddress: user?.businessAddress || '',
    avatarUrl: user?.avatarUrl || '',
    coverUrl: user?.coverUrl || '',
    bio: user?.bio || '',
  });

  const [expertLocation, setExpertLocation] = useState({
    state: user?.state || 'Lagos',
    lga: user?.lga || 'Ikeja',
    street: user?.businessAddress || '',
    houseNumber: '',
  });

  useEffect(() => {
    if (user) {
      setExpertProfileForm({
        firstname: user.firstname || '',
        lastname: user.lastname || '',
        phone: user.phone || '',
        title: user.title || '',
        businessAddress: user.businessAddress || '',
        avatarUrl: user.avatarUrl || '',
        coverUrl: user.coverUrl || '',
        bio: user.bio || '',
      });
      setExpertLocation({
        state: user.state || 'Lagos',
        lga: user.lga || 'Ikeja',
        street: user.businessAddress || '',
        houseNumber: '',
      });
    }
  }, [user]);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const url = await uploadToCloudinary(file);
      setExpertProfileForm((p) => ({ ...p, avatarUrl: url }));
      await updateProfile({ avatarUrl: url });
      showToast('Profile photo updated successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to upload photo', 'error');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    try {
      const url = await uploadToCloudinary(file);
      setExpertProfileForm((p) => ({ ...p, coverUrl: url }));
      await updateProfile({ coverUrl: url });
      showToast('Cover photo updated successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to upload cover banner', 'error');
    } finally {
      setUploadingCover(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateProfile({
        ...expertProfileForm,
        state: expertLocation.state,
        lga: expertLocation.lga,
        businessAddress: expertProfileForm.businessAddress.trim() || expertLocation.street.trim(),
      });
      showToast('Specialist profile & location updated successfully!', 'success');
      navigate('/expert-dashboard');
    } catch (err) {
      showToast(err.message || 'Failed to save profile changes', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <PageContainer showBack={false}>
      <div style={{ maxWidth: '640px', margin: '0 auto', paddingBottom: '4rem' }}>
        
        {/* Top Header Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <button
            onClick={() => navigate('/expert-dashboard')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '0.55rem 0.95rem',
              color: '#e2e8f0',
              fontFamily: 'Outfit',
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
        </div>

        {/* Page Title */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#f5b942', fontSize: '0.76rem', fontWeight: 800, fontFamily: 'Outfit', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.35rem' }}>
            <Sparkles size={13} /> Specialist Identity & Studio Info
          </div>
          <h1 style={{ fontFamily: 'Outfit', fontSize: '1.9rem', fontWeight: 900, color: '#ffffff', margin: 0, lineHeight: 1.2 }}>
            Edit Profile & Studio Location
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.86rem', marginTop: '0.35rem', marginBottom: 0 }}>
            Update your public specialist title, contact information, profile photos, and neighborhood location.
          </p>
        </div>

        {/* Photos Card */}
        <div
          style={{
            background: '#151824',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            boxShadow: '0 8px 24px -10px rgba(0, 0, 0, 0.5)',
          }}
        >
          <h3 style={{ fontFamily: 'Outfit', fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', margin: '0 0 1rem' }}>
            Profile & Banner Visuals
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
            {/* Avatar Preview & Upload */}
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <div
                style={{
                  width: '84px',
                  height: '84px',
                  borderRadius: '22px',
                  background: expertProfileForm.avatarUrl ? `url(${expertProfileForm.avatarUrl}) center/cover no-repeat` : 'linear-gradient(135deg, #f5b942 0%, #c48b17 100%)',
                  border: '2px solid rgba(245, 185, 66, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0c0e14',
                  fontFamily: 'Outfit',
                  fontSize: '1.8rem',
                  fontWeight: 900,
                  overflow: 'hidden',
                }}
              >
                {!expertProfileForm.avatarUrl && (user?.firstname?.[0] || 'S')}
              </div>
              <label
                style={{
                  position: 'absolute',
                  bottom: '-6px',
                  right: '-6px',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: '#f5b942',
                  color: '#0c0e14',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: uploadingAvatar ? 'wait' : 'pointer',
                  border: '2px solid #151824',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                }}
                title="Change Avatar Photo"
              >
                <Camera size={15} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={uploadingAvatar}
                  style={{ display: 'none' }}
                />
              </label>
            </div>

            <div style={{ flex: 1, minWidth: '180px' }}>
              <div style={{ fontFamily: 'Outfit', fontSize: '0.94rem', fontWeight: 800, color: '#ffffff' }}>
                {uploadingAvatar ? 'Uploading avatar…' : 'Specialist Avatar Photo'}
              </div>
              <p style={{ fontSize: '0.76rem', color: '#94a3b8', margin: '0.2rem 0 0.5rem', lineHeight: 1.4 }}>
                Recommended square ratio (500x500px). Shown on your public booking page and reviews.
              </p>
              <label
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  background: 'rgba(245, 185, 66, 0.12)',
                  color: '#f5b942',
                  border: '1px solid rgba(245, 185, 66, 0.3)',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '50px',
                  fontSize: '0.74rem',
                  fontFamily: 'Outfit',
                  fontWeight: 700,
                  cursor: uploadingAvatar ? 'wait' : 'pointer',
                }}
              >
                <Camera size={13} /> {uploadingAvatar ? 'Uploading...' : 'Upload New Photo'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={uploadingAvatar}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          </div>
        </div>

        {/* Profile Information Form */}
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div
            style={{
              background: '#151824',
              borderRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <h3 style={{ fontFamily: 'Outfit', fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
              Specialist Information
            </h3>

            {/* First & Last Name */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
              <div className="app-input-group" style={{ marginBottom: 0 }}>
                <label className="app-label">First Name *</label>
                <input
                  type="text"
                  value={expertProfileForm.firstname}
                  onChange={(e) => setExpertProfileForm((p) => ({ ...p, firstname: e.target.value }))}
                  className="app-input"
                  style={{ fontSize: '16px', background: '#0e111a', border: '1px solid rgba(255,255,255,0.1)' }}
                  required
                />
              </div>

              <div className="app-input-group" style={{ marginBottom: 0 }}>
                <label className="app-label">Last Name</label>
                <input
                  type="text"
                  value={expertProfileForm.lastname}
                  onChange={(e) => setExpertProfileForm((p) => ({ ...p, lastname: e.target.value }))}
                  className="app-input"
                  style={{ fontSize: '16px', background: '#0e111a', border: '1px solid rgba(255,255,255,0.1)' }}
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="app-input-group" style={{ marginBottom: 0 }}>
              <label className="app-label">Contact / WhatsApp Phone Number *</label>
              <input
                type="tel"
                value={expertProfileForm.phone}
                onChange={(e) => setExpertProfileForm((p) => ({ ...p, phone: e.target.value }))}
                className="app-input"
                placeholder="e.g. +234 801 234 5678"
                style={{ fontSize: '16px', background: '#0e111a', border: '1px solid rgba(255,255,255,0.1)' }}
                required
              />
            </div>

            {/* Professional Title */}
            <div className="app-input-group" style={{ marginBottom: 0 }}>
              <label className="app-label">Professional Title / Specialty *</label>
              <input
                type="text"
                value={expertProfileForm.title}
                onChange={(e) => setExpertProfileForm((p) => ({ ...p, title: e.target.value }))}
                className="app-input"
                placeholder="e.g. Master Stylist & Colorist, Certified Lash Aesthetician"
                style={{ fontSize: '16px', background: '#0e111a', border: '1px solid rgba(255,255,255,0.1)' }}
                required
              />
            </div>

            {/* Bio / About */}
            <div className="app-input-group" style={{ marginBottom: 0 }}>
              <label className="app-label">Specialist Bio / Atelier Introduction</label>
              <textarea
                rows={3}
                value={expertProfileForm.bio}
                onChange={(e) => setExpertProfileForm((p) => ({ ...p, bio: e.target.value }))}
                className="app-input"
                placeholder="Share your experience, specialties, techniques, and why clients love booking with you..."
                style={{ fontSize: '16px', background: '#0e111a', border: '1px solid rgba(255,255,255,0.1)', resize: 'vertical' }}
              />
            </div>
          </div>

          {/* Location Card */}
          <div
            style={{
              background: '#151824',
              borderRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#f5b942', fontWeight: 800, fontFamily: 'Outfit' }}>
              <MapPin size={16} />
              <h3 style={{ fontFamily: 'Outfit', fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                Business Location & Operating Area
              </h3>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 0.5rem', lineHeight: 1.4 }}>
              This location determines which local clients see your availability when searching for nearby specialists.
            </p>

            <LocationSelector location={expertLocation} onChange={setExpertLocation} />

            <div className="app-input-group" style={{ marginBottom: 0 }}>
              <label className="app-label">Full Studio / Business Address</label>
              <input
                type="text"
                value={expertProfileForm.businessAddress}
                onChange={(e) => setExpertProfileForm((p) => ({ ...p, businessAddress: e.target.value }))}
                className="app-input"
                placeholder="e.g. 23 Allen Avenue, Ikeja, Lagos"
                style={{ fontSize: '16px', background: '#0e111a', border: '1px solid rgba(255,255,255,0.1)' }}
              />
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={savingProfile}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #f5b942 0%, #e0a32d 100%)',
              color: '#0c0e14',
              border: 'none',
              borderRadius: '16px',
              padding: '0.95rem',
              minHeight: '52px',
              fontFamily: 'Outfit',
              fontSize: '1rem',
              fontWeight: 800,
              cursor: savingProfile ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 18px rgba(245, 185, 66, 0.35)',
              transition: 'transform 0.15s ease',
            }}
          >
            {savingProfile ? (
              <>
                <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '2px solid rgba(12,14,20,0.3)', borderTopColor: '#0c0e14', animation: 'spin 0.7s linear infinite' }} />
                <span>Saving Profile & Location…</span>
              </>
            ) : (
              <>
                <Check size={18} /> Save Profile & Studio Details
              </>
            )}
          </button>
        </form>

      </div>
    </PageContainer>
  );
};

export default ExpertProfileEditPage;

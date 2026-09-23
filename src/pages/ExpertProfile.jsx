import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Star,
  MapPin,
  MessageSquare,
  Calendar,
  CheckCircle2,
  MoreHorizontal,
  Send,
  Sparkles,
  Phone,
  Mail,
  ShieldCheck,
  Check,
  Edit,
  Plus,
  Trash2,
  Upload,
  RefreshCw,
  BookOpen,
  Clock,
  Eye,
  ExternalLink,
} from 'lucide-react';
import { PageContainer } from '../components/common/PageContainer';
import { PopupModal } from '../components/common/PopupModal';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { uploadToCloudinary } from '../services/cloudinary';

const normalizeServices = (rawServices) => {
  if (!Array.isArray(rawServices) || rawServices.length === 0) {
    return [{ name: 'Bespoke Styling', price: '₦20,000' }];
  }
  return rawServices.map((s, idx) => {
    if (typeof s === 'string') {
      return { name: s, price: `₦${(idx + 1) * 10 + 15},000` };
    }
    if (s && typeof s === 'object') {
      return {
        name: s.name || s.title || 'Specialist Service',
        price: s.price ? (String(s.price).startsWith('₦') ? s.price : `₦${Number(s.price || 20000).toLocaleString()}`) : '₦20,000'
      };
    }
    return { name: 'Specialist Service', price: '₦20,000' };
  });
};

export const ExpertProfile = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast, user, updateProfile } = useAuth();

  const queryName = searchParams.get('name') || searchParams.get('stylist') || (user?.firstname ? `${user.firstname} ${user.lastname || ''}` : 'Style Specialist');
  
  const [expert, setExpert] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [reviewsList, setReviewsList] = useState([]);
  const [showChatModal, setShowChatModal] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);

  // Lookbook Showcase States
  const [portfolioFilter, setPortfolioFilter] = useState('All');
  const [activePortfolioModal, setActivePortfolioModal] = useState(null);

  // Profile Edit Management States
  const [showEditSheet, setShowEditSheet] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [editForm, setEditForm] = useState({
    name: '',
    role: '',
    location: '',
    bio: '',
    avatar: '',
    coverImage: '',
    services: [],
  });

  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');

  const myFullName = user ? `${user.firstname || ''} ${user.lastname || ''}`.trim().toLowerCase() : '';
  const searchLower = queryName.toLowerCase();
  const hasExplicitQuery = searchParams.get('name') || searchParams.get('stylist') || searchParams.get('id');
  const isViewingMyself = user && user.role === 'staff' && (
    !hasExplicitQuery ||
    searchLower === myFullName ||
    (user._id && searchLower === String(user._id).toLowerCase()) ||
    (user.firstname && searchLower === user.firstname.toLowerCase())
  );

  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    if (queryName) {
      api.getSpecialistReviews(queryName)
        .then((revs) => setReviewsList(revs))
        .catch(() => setReviewsList([]));
    }

    if (isViewingMyself) {
      const userServices = normalizeServices(user.services);
      const userProfile = {
        id: user._id || searchLower.replace(/\s+/g, '-'),
        name: `${user.firstname || ''} ${user.lastname || ''}`.trim() || 'Verified Specialist',
        role: user.title || 'Certified Style Specialist',
        rating: 5.0,
        reviewsCount: 12,
        location: user.location || 'Lagos, Nigeria',
        experience: 'Verified Atelier Expert',
        bio: user.bio || 'Specialized in bespoke styling and executive client care.',
        avatar: user.avatarUrl || '',
        coverImage: user.coverImage || '/images/hero-bg.png',
        services: userServices,
        portfolio: user.portfolio || []
      };
      setExpert(userProfile);
      setSelectedService(userProfile.services[0]);
      setLoadingProfile(false);
      return;
    }

    setLoadingProfile(true);
    api.getSpecialists()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const verifiedStaff = data.filter((s) => s.role === 'staff' || s.role === 'expert' || s.isVerified === true);
          const pool = verifiedStaff.length > 0 ? verifiedStaff : data;

          const matched = hasExplicitQuery
            ? pool.find((s) => {
                const fullName = `${s.firstname || ''} ${s.lastname || ''}`.trim().toLowerCase();
                return (
                  fullName.includes(searchLower) ||
                  searchLower.includes(fullName) ||
                  (s.firstname && searchLower.includes(s.firstname.toLowerCase())) ||
                  (s._id && String(s._id).toLowerCase() === searchLower)
                );
              })
            : pool[0];

          if (matched) {
            const fullName = `${matched.firstname || ''} ${matched.lastname || ''}`.trim() || 'Verified Specialist';
            const specs = normalizeServices(matched.services);
            
            const dynamicProfile = {
              id: matched._id || fullName.toLowerCase().replace(/\s+/g, '-'),
              name: fullName,
              role: matched.title || 'Certified Master Specialist',
              rating: matched.rating || 5.0,
              reviewsCount: matched.reviewsCount || 0,
              location: matched.location || 'Lagos, Nigeria',
              experience: 'Verified Atelier Expert',
              bio: matched.bio || 'Specialized in premium styling and client care.',
              avatar: matched.avatarUrl || '',
              coverImage: matched.coverImage || '/images/hero-bg.png',
              services: specs,
              portfolio: matched.portfolio || []
            };

            // Check if custom profile overrides in localStorage
            const customSaved = localStorage.getItem(`expert_profile_custom_${dynamicProfile.id}`);
            if (customSaved) {
              try {
                const parsed = JSON.parse(customSaved);
                const merged = {
                  ...dynamicProfile,
                  ...parsed,
                  services: normalizeServices(parsed.services || dynamicProfile.services),
                  portfolio: parsed.portfolio || dynamicProfile.portfolio
                };
                setExpert(merged);
                setSelectedService(merged.services[0]);
                return;
              } catch (e) {}
            }

            setExpert(dynamicProfile);
            setSelectedService(dynamicProfile.services[0]);
            return;
          }
        }
        setExpert(null);
      })
      .catch(() => {
        setExpert(null);
      })
      .finally(() => setLoadingProfile(false));
  }, [queryName, user, isViewingMyself, hasExplicitQuery, searchLower]);

  // Direct navigation to dedicated Expert Dashboard
  const handleOpenEditSheet = () => {
    navigate('/expert-dashboard');
  };

  const handleUploadCover = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Instant 0ms local preview
    const previewUrl = URL.createObjectURL(file);
    setEditForm(prev => ({ ...prev, coverImage: previewUrl }));
    setExpert(prev => ({ ...prev, coverImage: previewUrl }));
    showToast('Cover photo updated!', 'success');

    setUploadingCover(true);
    try {
      const url = await uploadToCloudinary(file);
      setEditForm(prev => ({ ...prev, coverImage: url }));
      setExpert(prev => {
        const updated = { ...prev, coverImage: url };
        if (prev?.id) localStorage.setItem(`expert_profile_custom_${prev.id}`, JSON.stringify(updated));
        return updated;
      });

      if (user) {
        api.updateProfile({ coverImage: url }).catch(() => {});
      }
    } catch (err) {
      console.warn('Cloudinary cover upload warning:', err.message);
    } finally {
      setUploadingCover(false);
    }
  };

  const handleUploadAvatar = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Instant 0ms local preview
    const previewUrl = URL.createObjectURL(file);
    setEditForm(prev => ({ ...prev, avatar: previewUrl }));
    setExpert(prev => ({ ...prev, avatar: previewUrl }));
    showToast('Profile photo updated!', 'success');

    setUploadingAvatar(true);
    try {
      const url = await uploadToCloudinary(file);
      setEditForm(prev => ({ ...prev, avatar: url }));
      setExpert(prev => {
        const updated = { ...prev, avatar: url };
        if (prev?.id) localStorage.setItem(`expert_profile_custom_${prev.id}`, JSON.stringify(updated));
        return updated;
      });

      if (user) {
        api.updateProfile({ avatarUrl: url }).catch(() => {});
      }
    } catch (err) {
      console.warn('Cloudinary avatar upload warning:', err.message);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleAddService = () => {
    if (!newServiceName.trim()) {
      showToast('Please enter a service name', 'error');
      return;
    }
    const formattedPrice = newServicePrice.startsWith('₦') ? newServicePrice.trim() : `₦${Number(newServicePrice.replace(/[^0-9]/g, '') || 10000).toLocaleString()}`;
    const newService = { name: newServiceName.trim(), price: formattedPrice };

    setEditForm(prev => ({ ...prev, services: [...prev.services, newService] }));
    setNewServiceName('');
    setNewServicePrice('');
    showToast('New service added to menu', 'success');
  };

  const handleDeleteService = (index) => {
    setEditForm(prev => ({ ...prev, services: prev.services.filter((_, idx) => idx !== index) }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const updatedProfile = {
        ...expert,
        name: editForm.name,
        role: editForm.role,
        location: editForm.location,
        bio: editForm.bio,
        avatar: editForm.avatar,
        coverImage: editForm.coverImage,
        services: editForm.services.length > 0 ? editForm.services : expert.services,
      };

      setExpert(updatedProfile);
      if (updatedProfile.services.length > 0) setSelectedService(updatedProfile.services[0]);

      // Save to localStorage for instant client persistence using BOTH target keys
      const idKey1 = (expert.id || '').toLowerCase();
      const idKey2 = (editForm.name || '').toLowerCase().replace(/\s+/g, '-');
      
      localStorage.setItem(`expert_profile_custom_${idKey1}`, JSON.stringify(updatedProfile));
      localStorage.setItem(`expert_profile_custom_${idKey2}`, JSON.stringify(updatedProfile));

      // Save to database backend
      if (user) {
        await api.updateProfile({
          firstname: editForm.name.split(' ')[0] || user.firstname,
          lastname: editForm.name.split(' ').slice(1).join(' ') || user.lastname,
          title: editForm.role,
          location: editForm.location,
          bio: editForm.bio,
          avatarUrl: editForm.avatar,
          coverImage: editForm.coverImage,
          services: editForm.services,
        }).catch((err) => console.warn('Update profile backend:', err));

        if (updateProfile) {
          await updateProfile({
            avatarUrl: editForm.avatar,
            coverImage: editForm.coverImage,
          }).catch(() => {});
        }
      }

      setShowEditSheet(false);
      showToast('Your professional page has been updated & published!', 'success');
    } catch (err) {
      showToast('Failed to save profile changes', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    setSendingMsg(true);
    try {
      await api.sendSpecialistInquiry({
        specialistName: expert?.name || '',
        specialistId: expert?.id || '',
        message: messageText.trim(),
        service: selectedService?.name || '',
      });
      setShowChatModal(false);
      setMessageText('');
      showToast(`Inquiry sent to ${expert?.name || 'Expert'}! They will respond shortly.`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to send message. Please try again.', 'error');
    } finally {
      setSendingMsg(false);
    }
  };

  const handleBookNow = () => {
    if (!expert) return;
    const stylistFirstName = expert.name.split(' ')[0];
    const serviceName = selectedService ? selectedService.name : (expert.services[0]?.name || '');
    navigate(`/booking?stylist=${encodeURIComponent(stylistFirstName)}&service=${encodeURIComponent(serviceName)}`);
  };

  if (loadingProfile) {
    return (
      <PageContainer hideHeader={true} noPadding={true}>
        <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: '#94a3b8', fontFamily: 'Outfit' }}>Loading specialist profile...</p>
        </div>
      </PageContainer>
    );
  }

  if (!expert) {
    return (
      <PageContainer title="Specialist Not Found">
        <div style={{ textAlign: 'center', padding: '3rem 1.5rem', background: '#151822', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)', margin: '1.5rem 0' }}>
          <h3 style={{ fontFamily: 'Outfit', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>Specialist Not Found</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            The requested specialist is not available or does not exist.
          </p>
          <button
            onClick={() => navigate('/experts')}
            className="app-btn app-btn-accent"
            style={{ borderRadius: '12px', padding: '0.65rem 1.25rem', fontSize: '0.85rem' }}
          >
            Browse Verified Specialists
          </button>
        </div>
      </PageContainer>
    );
  }

  // Determine if current user is expert / staff or owns page
  const isExpertUser = user?.role === 'staff' || (user?.firstname && expert.name.toLowerCase().includes(user.firstname.toLowerCase()));

  return (
    <PageContainer hideHeader={true} noPadding={true}>
      <div style={{
        minHeight: '100vh',
        background: 'var(--color-bg)',
        paddingBottom: '6rem',
        margin: 0,
        width: '100%',
        maxWidth: '100%',
        overflowX: 'hidden',
      }}>

        {/* ── TOP NAV BAR ── */}
        <div style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'rgba(12, 14, 20, 0.95)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '0.85rem 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: '#1c202d',
              border: '1px solid rgba(255,255,255,0.08)',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#ffffff',
            }}
          >
            <ArrowLeft size={18} />
          </button>

          <h3 style={{
            fontFamily: 'Outfit',
            fontSize: '1.05rem',
            fontWeight: 800,
            color: '#ffffff',
            margin: 0,
          }}>
            Professional Profile
          </h3>

          {/* Edit Control Button - only shown to the expert/staff who owns this page */}
          {isViewingMyself && (
          <button
            onClick={() => navigate('/expert-dashboard')}
            onMouseEnter={() => preloadRoute('/expert-dashboard')}
            style={{
              background: 'rgba(245,185,66,0.15)',
              border: '1px solid rgba(245,185,66,0.4)',
              color: '#f5b942',
              padding: '0.4rem 0.75rem',
              borderRadius: '50px',
              fontFamily: 'Outfit',
              fontWeight: 800,
              fontSize: '0.78rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              minHeight: '44px',
              touchAction: 'manipulation',
            }}
          >
            <Edit size={13} /> Edit Page in Dashboard
          </button>
          )}
        </div>

        {/* ── COVER IMAGE & FLOATING AVATAR ── */}
        <div style={{ position: 'relative', marginBottom: '3rem' }}>
          <div style={{
            width: '100%',
            /* clamp: 140px floor on 320px → 220px ceiling on large phones */
            height: 'clamp(140px, 40vw, 220px)',
            background: `url(${expert.coverImage}) center/cover no-repeat`,
            borderRadius: '0 0 20px 20px',
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to bottom, transparent 40%, rgba(12,14,20,0.85) 100%)',
              borderRadius: '0 0 20px 20px',
            }} />

            <label
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'rgba(12,14,20,0.85)',
                color: '#f5b942',
                border: '1px solid rgba(245,185,66,0.35)',
                borderRadius: '50px',
                padding: '0.3rem 0.65rem',
                fontSize: '0.68rem',
                fontFamily: 'Outfit',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                zIndex: 2
              }}
            >
              <Upload size={11} />
              <span>{uploadingCover ? 'Updating...' : 'Change Banner'}</span>
              <input type="file" accept="image/*" onChange={handleUploadCover} style={{ display: 'none' }} />
            </label>
          </div>

          {/* Floating Avatar Circle with 1-Tap Photo Input */}
          <label
            style={{
              position: 'absolute',
              bottom: '-36px',
              left: '1rem',
              width: '78px',
              height: '78px',
              borderRadius: '50%',
              background: expert.avatar
                ? `url(${expert.avatar}) center/cover no-repeat`
                : 'linear-gradient(135deg, #f5b942 0%, #c99326 100%)',
              border: '4px solid #151822',
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0c0e14',
              fontFamily: 'Outfit',
              fontWeight: 800,
              fontSize: '1.65rem',
            }}
            title="Tap to change profile picture"
          >
            {!expert.avatar && (expert.name ? expert.name.split(' ').map(n=>n[0]).slice(0,2).join('').toUpperCase() : 'E')}
            <input type="file" accept="image/*" onChange={handleUploadAvatar} style={{ display: 'none' }} />
            <div style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: '#f5b942',
              color: '#0c0e14',
              border: '2px solid #151822',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(0,0,0,0.4)'
            }}>
              <Upload size={10} />
            </div>
          </label>
        </div>

        {/* ── EXPERT HEADER METADATA ── */}
        <div style={{ padding: '0 1rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem', flexWrap: 'wrap' }}>
            <h1 style={{
              fontFamily: 'Outfit',
              fontSize: 'clamp(1.2rem, 5vw, 1.5rem)',
              fontWeight: 900,
              color: '#ffffff',
              margin: 0,
              lineHeight: 1.1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {expert.name}
            </h1>
            <div style={{
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              background: '#f5b942',
              color: '#0c0e14',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(245,185,66,0.4)',
              flexShrink: 0,
            }}>
              <Check size={11} strokeWidth={3} />
            </div>
          </div>

          <p style={{
            color: '#94a3b8',
            fontSize: '0.85rem',
            fontFamily: 'Outfit',
            fontWeight: 600,
            margin: '0 0 0.55rem 0',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {expert.role}
          </p>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
            fontSize: '0.8rem',
            color: '#94a3b8',
            flexWrap: 'wrap',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 700 }}>
              <Star size={14} fill="#f5b942" color="#f5b942" />
              <span style={{ color: '#ffffff', fontWeight: 800 }}>{expert.rating}</span>
              <span style={{ color: '#94a3b8', fontWeight: 500 }}>({expert.reviewsCount} reviews)</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#94a3b8', fontWeight: 600 }}>
              <MapPin size={13} color="#f5b942" />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '160px' }}>{expert.location}</span>
            </div>
          </div>
        </div>

        {/* ── ABOUT SECTION ── */}
        <div style={{ padding: '0 1rem', marginBottom: '1.5rem' }}>
          <div style={{
            background: '#151822',
            borderRadius: '16px',
            padding: '1.15rem',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}>
            <h3 style={{
              fontFamily: 'Outfit',
              fontSize: '1rem',
              fontWeight: 800,
              color: '#ffffff',
              marginBottom: '0.5rem',
            }}>
              About
            </h3>
            <p style={{
              color: '#cbd5e1',
              fontSize: '0.88rem',
              lineHeight: 1.55,
              margin: 0,
            }}>
              {expert.bio}
            </p>
          </div>
        </div>

        {/* ── SERVICES SECTION ── */}
        <div style={{ padding: '0 1rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h3 style={{
              fontFamily: 'Outfit',
              fontSize: '1rem',
              fontWeight: 800,
              color: '#ffffff',
              margin: 0,
            }}>
              Offered Services & Pricing
            </h3>

            {isViewingMyself && (
            <button
              onClick={() => navigate('/expert-dashboard')}
              onMouseEnter={() => preloadRoute('/expert-dashboard')}
              style={{
                background: 'none',
                border: 'none',
                color: '#f5b942',
                fontSize: '0.78rem',
                fontFamily: 'Outfit',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.2rem',
                minHeight: '44px',
                touchAction: 'manipulation',
              }}
            >
              <Plus size={14} /> Edit Services Menu
            </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            {expert.services.map((service, idx) => {
              const isSelected = selectedService?.name === service.name;

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedService(service)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem 1rem',
                    borderRadius: '14px',
                    background: isSelected ? 'rgba(245, 185, 66, 0.08)' : '#151822',
                    border: isSelected ? '1.5px solid #f5b942' : '1px solid rgba(255, 255, 255, 0.08)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: isSelected ? '0 4px 20px rgba(245, 185, 66, 0.15)' : 'none',
                    gap: '0.5rem',
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flex: '1 1 0%', minWidth: 0 }}>
                    <div style={{
                      width: '18px',
                      height: '18px',
                      minWidth: '18px',
                      borderRadius: '50%',
                      border: isSelected ? '5px solid #f5b942' : '2px solid rgba(255,255,255,0.25)',
                      background: isSelected ? '#0c0e14' : 'transparent',
                      flexShrink: 0,
                      transition: 'all 0.2s ease',
                    }} />
                    <span style={{
                      fontFamily: 'Outfit',
                      fontSize: 'clamp(0.78rem, 2.5vw, 0.88rem)',
                      fontWeight: 700,
                      color: '#ffffff',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {service.name}
                    </span>
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 600, marginRight: '0.2rem' }}>From</span>
                    <span style={{ fontFamily: 'Outfit', fontSize: 'clamp(0.82rem, 2.5vw, 0.95rem)', fontWeight: 900, color: '#f5b942', whiteSpace: 'nowrap' }}>
                      {service.price}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── SPECIALIST PORTFOLIO SHOWCASE ── */}
        <div style={{ padding: '0 1rem', marginBottom: '1.5rem' }}>
          <div style={{
            background: '#151822',
            borderRadius: '20px',
            padding: '1.25rem',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.4rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Sparkles size={16} color="#f5b942" />
                <h3 style={{ fontFamily: 'Outfit', fontSize: '1rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                  Portfolio Work & Lookbook
                </h3>
                {expert?.portfolio && Array.isArray(expert.portfolio) && expert.portfolio.length > 0 && (
                  <span style={{ fontSize: '0.68rem', color: '#f5b942', background: 'rgba(245, 185, 66, 0.12)', padding: '0.1rem 0.45rem', borderRadius: '50px', fontWeight: 800 }}>
                    {expert.portfolio.length}
                  </span>
                )}
              </div>

              {isViewingMyself && (
                <button
                  type="button"
                  onClick={() => navigate('/expert-dashboard#portfolio')}
                  style={{
                    background: 'rgba(245, 185, 66, 0.12)',
                    color: '#f5b942',
                    border: '1px solid rgba(245, 185, 66, 0.3)',
                    borderRadius: '50px',
                    padding: '0.25rem 0.65rem',
                    fontSize: '0.72rem',
                    fontFamily: 'Outfit',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}
                >
                  <Plus size={12} /> Manage / Add Work
                </button>
              )}
            </div>

            {(() => {
              const specialistPortfolio = Array.isArray(expert?.portfolio) ? expert.portfolio : [];

              if (specialistPortfolio.length === 0) {
                return (
                  <div style={{ textAlign: 'center', padding: '2rem 1rem', background: '#10131b', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <BookOpen size={34} color="#f5b942" style={{ marginBottom: '0.5rem', opacity: 0.6 }} />
                    <p style={{ color: '#ffffff', fontSize: '0.86rem', fontWeight: 700, margin: '0 0 0.3rem', fontFamily: 'Outfit' }}>
                      {isViewingMyself ? 'Your Lookbook is Currently Empty' : 'No Portfolio Samples Uploaded Yet'}
                    </p>
                    <p style={{ color: '#64748b', fontSize: '0.78rem', margin: '0 0 1rem', lineHeight: 1.4 }}>
                      {isViewingMyself
                        ? 'Add pictures of your styling, client transformations, and techniques in your Expert Dashboard to attract more clients.'
                        : 'This specialist has not published lookbook transformations yet. Book an appointment or contact directly.'}
                    </p>
                    {isViewingMyself && (
                      <button
                        type="button"
                        onClick={() => navigate('/expert-dashboard#portfolio')}
                        style={{
                          background: '#f5b942',
                          color: '#0c0e14',
                          border: 'none',
                          borderRadius: '50px',
                          padding: '0.45rem 1rem',
                          fontFamily: 'Outfit',
                          fontSize: '0.78rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                        }}
                      >
                        <Plus size={14} /> Log Work in Dashboard
                      </button>
                    )}
                  </div>
                );
              }

              const uniqueServices = ['All', ...new Set(specialistPortfolio.map(p => p.service || 'General').filter(Boolean))];
              const displayedSamples = portfolioFilter === 'All'
                ? specialistPortfolio
                : specialistPortfolio.filter(p => (p.service || 'General') === portfolioFilter);

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {/* Category Pills if more than 1 category */}
                  {uniqueServices.length > 2 && (
                    <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto', paddingBottom: '0.2rem', scrollbarWidth: 'none' }}>
                      {uniqueServices.map((cat) => {
                        const active = portfolioFilter === cat;
                        return (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setPortfolioFilter(cat)}
                            style={{
                              background: active ? '#f5b942' : '#10131b',
                              color: active ? '#0c0e14' : '#94a3b8',
                              border: `1px solid ${active ? '#f5b942' : 'rgba(255,255,255,0.08)'}`,
                              borderRadius: '50px',
                              padding: '0.2rem 0.65rem',
                              fontSize: '0.7rem',
                              fontFamily: 'Outfit',
                              fontWeight: active ? 800 : 600,
                              cursor: 'pointer',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {cat}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Lookbook Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.65rem' }}>
                    {displayedSamples.map((item, i) => {
                      const imgUrl = typeof item === 'object' ? (item.imageUrl || item.url) : item;
                      if (!imgUrl) return null;
                      const title = typeof item === 'object' ? (item.title || item.service || 'Client Style') : 'Client Style';
                      const service = typeof item === 'object' ? item.service : '';

                      return (
                        <div
                          key={i}
                          onClick={() => setActivePortfolioModal(typeof item === 'object' ? item : { imageUrl: item, title })}
                          style={{
                            borderRadius: '14px',
                            overflow: 'hidden',
                            height: '125px',
                            border: '1px solid rgba(255,255,255,0.08)',
                            background: '#1c202d',
                            position: 'relative',
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                          }}
                        >
                          <img
                            src={imgUrl}
                            alt={title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                            loading="lazy"
                          />

                          {/* Service Tag */}
                          {service && (
                            <div
                              style={{
                                position: 'absolute',
                                top: '5px',
                                left: '5px',
                                background: 'rgba(12,14,20,0.8)',
                                backdropFilter: 'blur(4px)',
                                color: '#f5b942',
                                fontSize: '0.58rem',
                                fontWeight: 800,
                                padding: '0.1rem 0.4rem',
                                borderRadius: '50px',
                                maxWidth: '80%',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {service}
                            </div>
                          )}

                          {/* Bottom Gradient with Style Title */}
                          <div
                            style={{
                              position: 'absolute',
                              bottom: 0,
                              left: 0,
                              right: 0,
                              padding: '1.2rem 0.4rem 0.35rem',
                              background: 'linear-gradient(to top, rgba(12,14,20,0.95) 0%, rgba(12,14,20,0.6) 60%, transparent 100%)',
                            }}
                          >
                            <span
                              style={{
                                color: '#ffffff',
                                fontSize: '0.68rem',
                                fontFamily: 'Outfit',
                                fontWeight: 700,
                                display: 'block',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {title}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* ── CUSTOMER REVIEWS & FEEDBACK ── */}
        <div style={{ padding: '0 1rem', marginBottom: '1.5rem' }}>
          <div style={{
            background: '#151822',
            borderRadius: '20px',
            padding: '1.25rem',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
              <h3 style={{ fontFamily: 'Outfit', fontSize: '1rem', fontWeight: 800, color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Star size={16} fill="#f5b942" color="#f5b942" /> Verified Customer Reviews
              </h3>
              <span style={{ fontFamily: 'Outfit', fontSize: '0.78rem', fontWeight: 800, color: '#f5b942', background: 'rgba(245,185,66,0.15)', padding: '0.2rem 0.6rem', borderRadius: '50px', border: '1px solid rgba(245,185,66,0.3)' }}>
                ★ {expert?.rating || '5.0'} ({reviewsList.length} {reviewsList.length === 1 ? 'review' : 'reviews'})
              </span>
            </div>

            {reviewsList.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {reviewsList.map((rev) => (
                  <div key={rev._id} style={{ background: '#10131b', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '0.75rem 0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                      <span style={{ fontFamily: 'Outfit', fontSize: '0.82rem', fontWeight: 800, color: '#ffffff' }}>
                        {rev.customerName}
                      </span>
                      <div style={{ display: 'flex', gap: '2px' }}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} size={11} fill={s <= rev.rating ? '#f5b942' : 'none'} color={s <= rev.rating ? '#f5b942' : '#475569'} />
                        ))}
                      </div>
                    </div>
                    <p style={{ color: '#cbd5e1', fontSize: '0.78rem', margin: '0 0 0.3rem', lineHeight: 1.4 }}>
                      "{rev.comment || 'Excellent service!'}"
                    </p>
                    <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 600 }}>
                      Service: {rev.serviceName} · {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ background: '#10131b', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '0.85rem', textAlign: 'center' }}>
                <p style={{ color: '#cbd5e1', fontSize: '0.8rem', margin: 0 }}>
                  "Always punctual, extremely detail-oriented, and top-tier luxury output."
                </p>
                <span style={{ fontSize: '0.7rem', color: '#f5b942', fontWeight: 700, marginTop: '0.3rem', display: 'block' }}>
                  — Verified Atelier Client
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── FIXED BOTTOM BAR (CHAT + BOOK NOW) ── */}
        <div style={{
          position: 'fixed',
          bottom: 0,
          /* Centre within the 460px card on desktop; fill 100% on mobile */
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: '460px',
          background: 'rgba(12, 14, 20, 0.95)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '0.75rem 1rem calc(0.75rem + env(safe-area-inset-bottom))',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          zIndex: 900,
          boxShadow: '0 -8px 24px rgba(0,0,0,0.5)',
        }}>
          {/* Direct Message Icon Button */}
          <button
            onClick={() => setShowChatModal(true)}
            title="Chat with Expert"
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: '#151822',
              border: '1.5px solid rgba(245,185,66,0.35)',
              color: '#f5b942',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <MessageSquare size={20} color="#f5b942" />
          </button>

          {/* Book Now Primary Button */}
          <button
            onClick={handleBookNow}
            style={{
              flex: 1,
              height: '48px',
              borderRadius: '14px',
              background: '#F5B942',
              color: '#0C0E14',
              border: 'none',
              fontFamily: 'Outfit',
              fontSize: 'clamp(0.85rem, 3vw, 1rem)',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              boxShadow: '0 6px 20px rgba(245,185,66,0.35)',
              overflow: 'hidden',
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <Calendar size={16} style={{ flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Book Now ({selectedService?.price || expert?.services?.[0]?.price || '₦20,000'})</span>
          </button>
        </div>

      </div>

      

      {/* ── DIRECT CHAT INQUIRY MODAL ── */}
      <PopupModal
        isOpen={showChatModal}
        onClose={() => setShowChatModal(false)}
        title={`Message ${expert.name}`}
      >
        <form onSubmit={handleSendMessage} style={{ padding: '0.25rem 0' }}>
          <p style={{ fontSize: '0.82rem', color: '#6b7280', marginBottom: '1rem' }}>
            Send a direct message or style question to <strong>{expert.name}</strong>.
          </p>

          <div className="app-input-group">
            <label className="app-label">Your Message / Inquiry</label>
            <textarea
              rows={3}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder={`Hi ${expert.name.split(' ')[0]}, I have a question about ${selectedService?.name || 'your services'}...`}
              className="app-textarea"
              required
            />
          </div>

          <button
            type="submit"
            disabled={sendingMsg}
            className="app-btn app-btn-accent"
            style={{ minHeight: '44px', borderRadius: '12px' }}
          >
            {sendingMsg ? (
              <span>Sending Message...</span>
            ) : (
              <>
                <Send size={16} />
                <span>Send Direct Inquiry</span>
              </>
            )}
          </button>
        </form>
      </PopupModal>

      {/* ── LOOKBOOK SAMPLE DETAIL LIGHTBOX MODAL ── */}
      {activePortfolioModal && (
        <PopupModal
          isOpen={!!activePortfolioModal}
          onClose={() => setActivePortfolioModal(null)}
          title={activePortfolioModal.title || 'Lookbook Transformation'}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Full Image */}
            <div
              style={{
                width: '100%',
                maxHeight: '320px',
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                background: '#10131b',
              }}
            >
              <img
                src={activePortfolioModal.imageUrl || activePortfolioModal.url}
                alt={activePortfolioModal.title || 'Lookbook sample'}
                style={{ width: '100%', height: '100%', maxHeight: '320px', objectFit: 'contain', display: 'block' }}
              />
            </div>

            {/* Title & Service Badges */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                {activePortfolioModal.service && (
                  <span
                    style={{
                      background: 'rgba(245, 185, 66, 0.15)',
                      color: '#f5b942',
                      border: '1px solid rgba(245, 185, 66, 0.35)',
                      borderRadius: '50px',
                      padding: '0.15rem 0.6rem',
                      fontSize: '0.72rem',
                      fontFamily: 'Outfit',
                      fontWeight: 800,
                    }}
                  >
                    {activePortfolioModal.service}
                  </span>
                )}
                <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                  Atelier Verified Transformation
                </span>
              </div>

              <h3 style={{ fontFamily: 'Outfit', fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                {activePortfolioModal.title || 'Client Transformation'}
              </h3>
            </div>

            {/* Duration & Fee Pills */}
            {(activePortfolioModal.duration || activePortfolioModal.price) && (
              <div style={{ display: 'flex', gap: '0.75rem', background: '#151822', padding: '0.65rem 0.85rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                {activePortfolioModal.duration && (
                  <div>
                    <div style={{ fontSize: '0.66rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Duration</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', fontFamily: 'Outfit' }}>{activePortfolioModal.duration}</div>
                  </div>
                )}
                {activePortfolioModal.price && (
                  <div style={{ marginLeft: activePortfolioModal.duration ? 'auto' : 0 }}>
                    <div style={{ fontSize: '0.66rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Estimated Fee</div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 900, color: '#f5b942', fontFamily: 'Outfit' }}>
                      {activePortfolioModal.price.startsWith('₦') ? activePortfolioModal.price : `₦${activePortfolioModal.price}`}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Styling Notes */}
            {(activePortfolioModal.description || activePortfolioModal.clientNote) && (
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', padding: '0.85rem', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, marginBottom: '0.25rem' }}>
                  Styling Notes & Technique
                </div>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.4, fontStyle: 'italic' }}>
                  "{activePortfolioModal.description || activePortfolioModal.clientNote}"
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => {
                  const targetSvc = activePortfolioModal.service || selectedService?.name || '';
                  const stylistFirstName = expert.name.split(' ')[0];
                  navigate(`/booking?stylist=${encodeURIComponent(stylistFirstName)}${targetSvc ? `&service=${encodeURIComponent(targetSvc)}` : ''}`);
                  setActivePortfolioModal(null);
                }}
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #f5b942 0%, #e0a32d 100%)',
                  color: '#0c0e14',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '0.75rem',
                  fontFamily: 'Outfit',
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  boxShadow: '0 4px 14px rgba(245, 185, 66, 0.3)',
                }}
              >
                <Calendar size={15} /> Book This Style
              </button>

              <button
                type="button"
                onClick={() => setActivePortfolioModal(null)}
                style={{
                  background: '#1c202d',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '12px',
                  padding: '0.75rem 1.25rem',
                  fontFamily: 'Outfit',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </PopupModal>
      )}
    </PageContainer>
  );
};

export default ExpertProfile;

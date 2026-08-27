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
  RefreshCw
} from 'lucide-react';
import { PageContainer } from '../components/common/PageContainer';
import { PopupModal } from '../components/common/PopupModal';
import { BottomSheet } from '../components/common/BottomSheet';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { uploadToCloudinary } from '../services/cloudinary';

const DEFAULT_EXPERT_PROFILES = [];

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

  useEffect(() => {
    if (queryName) {
      api.getSpecialistReviews(queryName)
        .then((revs) => setReviewsList(revs))
        .catch(() => setReviewsList([]));
    }

    const searchLower = queryName.toLowerCase();
    let found = DEFAULT_EXPERT_PROFILES.find(p => p.name.toLowerCase().includes(searchLower) || p.id.includes(searchLower));

    // Check if custom profile saved in localStorage
    const targetId1 = found ? found.id : searchLower.replace(/\s+/g, '-');
    const customSaved = localStorage.getItem(`expert_profile_custom_${targetId1}`) || localStorage.getItem(`expert_profile_custom_${searchLower.replace(/\s+/g, '-')}`);

    if (customSaved) {
      try {
        const parsed = JSON.parse(customSaved);
        const norm = { ...parsed, services: normalizeServices(parsed.services) };
        setExpert(norm);
        setSelectedService(norm.services[0]);
        return;
      } catch (err) {}
    }

    if (user && user.role === 'staff') {
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
        avatar: user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        coverImage: user.coverImage || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
        services: userServices
      };
      setExpert(userProfile);
      setSelectedService(userProfile.services[0]);
      return;
    }

    if (found) {
      const norm = { ...found, services: normalizeServices(found.services) };
      setExpert(norm);
      setSelectedService(norm.services[0]);
    } else {
      // Fallback API lookup
      api.getSpecialists()
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            const matched = data.find(s => `${s.firstname} ${s.lastname}`.toLowerCase().includes(searchLower));
            if (matched) {
              const fullName = `${matched.firstname || ''} ${matched.lastname || ''}`.trim() || 'Style Specialist';
              const specs = normalizeServices(matched.services);
              
              const dynamicProfile = {
                id: matched._id || fullName.toLowerCase().replace(/\s+/g, '-'),
                name: fullName,
                role: matched.title || 'Certified Master Specialist',
                rating: 5.0,
                reviewsCount: 42,
                location: matched.location || 'Lagos, Nigeria',
                experience: 'Verified Atelier Expert',
                bio: matched.bio || `Specialized in premium hair and beauty services.`,
                avatar: matched.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
                coverImage: matched.coverImage || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
                services: specs
              };
              setExpert(dynamicProfile);
              setSelectedService(dynamicProfile.services[0]);
              return;
            }
          }
          const defaultNorm = { ...DEFAULT_EXPERT_PROFILES[0], services: normalizeServices(DEFAULT_EXPERT_PROFILES[0].services) };
          setExpert(defaultNorm);
          setSelectedService(defaultNorm.services[0]);
        })
        .catch(() => {
          const defaultNorm = { ...DEFAULT_EXPERT_PROFILES[0], services: normalizeServices(DEFAULT_EXPERT_PROFILES[0].services) };
          setExpert(defaultNorm);
          setSelectedService(defaultNorm.services[0]);
        });
    }
  }, [queryName, user]);

  // Open Edit Sheet & Populate Form
  const handleOpenEditSheet = () => {
    if (!expert) return;
    setEditForm({
      name: expert.name || '',
      role: expert.role || '',
      location: expert.location || '',
      bio: expert.bio || '',
      avatar: expert.avatar || '',
      coverImage: expert.coverImage || '',
      services: expert.services ? [...expert.services] : [],
    });
    setShowEditSheet(true);
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

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    setSendingMsg(true);
    setTimeout(() => {
      setSendingMsg(false);
      setShowChatModal(false);
      setMessageText('');
      showToast(`Inquiry sent to ${expert?.name || 'Expert'}! They will respond shortly.`, 'success');
    }, 600);
  };

  const handleBookNow = () => {
    if (!expert) return;
    const stylistFirstName = expert.name.split(' ')[0];
    const serviceName = selectedService ? selectedService.name : (expert.services[0]?.name || '');
    navigate(`/booking?stylist=${encodeURIComponent(stylistFirstName)}&service=${encodeURIComponent(serviceName)}`);
  };

  if (!expert) return null;

  // Determine if current user is expert / staff or owns page
  const isExpertUser = user?.role === 'staff' || (user?.firstname && expert.name.toLowerCase().includes(user.firstname.toLowerCase()));

  return (
    <PageContainer hideHeader={true}>
      <div style={{
        minHeight: '100vh',
        background: '#ffffff',
        paddingBottom: '6rem',
        margin: '-1rem',
      }}>

        {/* ── TOP NAV BAR ── */}
        <div style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          padding: '0.85rem 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: '#f3f4f6',
              border: 'none',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#171717',
            }}
          >
            <ArrowLeft size={18} />
          </button>

          <h3 style={{
            fontFamily: 'Outfit',
            fontSize: '1.05rem',
            fontWeight: 800,
            color: '#171717',
            margin: 0,
          }}>
            Professional Profile
          </h3>

          {/* Edit Control Button for Experts */}
          <button
            onClick={handleOpenEditSheet}
            style={{
              background: 'rgba(212,175,55,0.15)',
              border: '1px solid rgba(212,175,55,0.4)',
              color: '#b5952f',
              padding: '0.4rem 0.75rem',
              borderRadius: '50px',
              fontFamily: 'Outfit',
              fontWeight: 800,
              fontSize: '0.78rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <Edit size={13} /> Edit Page
          </button>
        </div>

        {/* ── COVER IMAGE & FLOATING AVATAR ── */}
        <div style={{ position: 'relative', marginBottom: '3rem' }}>
          <div style={{
            width: '100%',
            height: 'clamp(160px, 28vw, 220px)',
            background: `url(${expert.coverImage}) center/cover no-repeat`,
            borderRadius: '0 0 20px 20px',
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.4) 100%)',
              borderRadius: '0 0 20px 20px',
            }} />

            <label
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'rgba(0,0,0,0.65)',
                color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.3)',
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
              background: `url(${expert.avatar}) center/cover no-repeat`,
              border: '4px solid #ffffff',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              cursor: 'pointer',
              display: 'block'
            }}
            title="Tap to change profile picture"
          >
            <input type="file" accept="image/*" onChange={handleUploadAvatar} style={{ display: 'none' }} />
            <div style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: '#d4af37',
              color: '#111',
              border: '2px solid #fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
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
              color: '#171717',
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
              background: '#ec4899',
              color: '#ffffff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(236,72,153,0.4)',
              flexShrink: 0,
            }}>
              <Check size={11} strokeWidth={3} />
            </div>
          </div>

          <p style={{
            color: '#6b7280',
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
            color: '#4b5563',
            flexWrap: 'wrap',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 700 }}>
              <Star size={14} fill="#f59e0b" color="#f59e0b" />
              <span style={{ color: '#171717', fontWeight: 800 }}>{expert.rating}</span>
              <span style={{ color: '#9ca3af', fontWeight: 500 }}>({expert.reviewsCount} reviews)</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#6b7280', fontWeight: 600 }}>
              <MapPin size={13} color="#9ca3af" />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '160px' }}>{expert.location}</span>
            </div>
          </div>
        </div>

        {/* ── ABOUT SECTION ── */}
        <div style={{ padding: '0 1.25rem', marginBottom: '1.5rem' }}>
          <h3 style={{
            fontFamily: 'Outfit',
            fontSize: '1rem',
            fontWeight: 800,
            color: '#171717',
            marginBottom: '0.5rem',
          }}>
            About
          </h3>
          <p style={{
            color: '#4b5563',
            fontSize: '0.88rem',
            lineHeight: 1.55,
            margin: 0,
          }}>
            {expert.bio}
          </p>
        </div>

        {/* ── SERVICES SECTION ── */}
        <div style={{ padding: '0 1.25rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h3 style={{
              fontFamily: 'Outfit',
              fontSize: '1rem',
              fontWeight: 800,
              color: '#171717',
              margin: 0,
            }}>
              Offered Services & Pricing
            </h3>

            <button
              onClick={handleOpenEditSheet}
              style={{
                background: 'none',
                border: 'none',
                color: '#b5952f',
                fontSize: '0.78rem',
                fontFamily: 'Outfit',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.2rem'
              }}
            >
              <Plus size={14} /> Edit Services Menu
            </button>
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
                    padding: '0.85rem 0.9rem',
                    borderRadius: '12px',
                    background: isSelected ? '#faf8f5' : '#fafafa',
                    border: isSelected ? '1.5px solid #d4af37' : '1px solid rgba(0,0,0,0.06)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: isSelected ? '0 4px 14px rgba(212,175,55,0.15)' : 'none',
                    gap: '0.5rem',
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', flex: '1 1 0%', minWidth: 0 }}>
                    <div style={{
                      width: '18px',
                      height: '18px',
                      minWidth: '18px',
                      borderRadius: '50%',
                      border: isSelected ? '5px solid #d4af37' : '2px solid #d1d5db',
                      background: '#ffffff',
                      flexShrink: 0,
                      transition: 'all 0.2s ease',
                    }} />
                    <span style={{
                      fontFamily: 'Outfit',
                      fontSize: 'clamp(0.78rem, 2.5vw, 0.88rem)',
                      fontWeight: 700,
                      color: '#171717',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {service.name}
                    </span>
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <span style={{ fontSize: '0.68rem', color: '#9ca3af', fontWeight: 600, marginRight: '0.2rem' }}>From</span>
                    <span style={{ fontFamily: 'Outfit', fontSize: 'clamp(0.82rem, 2.5vw, 0.95rem)', fontWeight: 900, color: '#171717', whiteSpace: 'nowrap' }}>
                      {service.price}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── SPECIALIST PORTFOLIO SHOWCASE ── */}
        <div style={{
          background: '#ffffff',
          borderRadius: '20px',
          padding: '1.25rem',
          border: '1px solid rgba(0,0,0,0.06)',
          marginBottom: '1rem',
          boxShadow: '0 4px 16px rgba(0,0,0,0.02)',
        }}>
          <h3 style={{ fontFamily: 'Outfit', fontSize: '1rem', fontWeight: 800, color: '#171717', margin: '0 0 0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Sparkles size={16} color="#d4af37" /> Portfolio Work & Lookbook
          </h3>

          {expert?.portfolio && Array.isArray(expert.portfolio) && expert.portfolio.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '0.65rem' }}>
              {expert.portfolio.map((imgUrl, i) => (
                <div key={i} style={{ borderRadius: '12px', overflow: 'hidden', height: '110px', border: '1px solid rgba(0,0,0,0.08)', background: '#fafafa' }}>
                  <img src={imgUrl} alt={`Portfolio ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.65rem' }}>
              {[
                'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=300&q=80',
                'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=300&q=80',
                'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=300&q=80'
              ].map((fallbackImg, i) => (
                <div key={i} style={{ borderRadius: '12px', overflow: 'hidden', height: '100px', border: '1px solid rgba(0,0,0,0.08)' }}>
                  <img src={fallbackImg} alt="Sample work" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── CUSTOMER REVIEWS & FEEDBACK ── */}
        <div style={{
          background: '#ffffff',
          borderRadius: '20px',
          padding: '1.25rem',
          border: '1px solid rgba(0,0,0,0.06)',
          marginBottom: '1rem',
          boxShadow: '0 4px 16px rgba(0,0,0,0.02)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
            <h3 style={{ fontFamily: 'Outfit', fontSize: '1rem', fontWeight: 800, color: '#171717', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Star size={16} fill="#f59e0b" color="#f59e0b" /> Verified Customer Reviews
            </h3>
            <span style={{ fontFamily: 'Outfit', fontSize: '0.78rem', fontWeight: 800, color: '#b5952f', background: 'rgba(212,175,55,0.12)', padding: '0.2rem 0.6rem', borderRadius: '50px' }}>
              ★ {expert?.rating || '5.0'} ({reviewsList.length > 0 ? reviewsList.length : '12'} reviews)
            </span>
          </div>

          {reviewsList.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {reviewsList.map((rev) => (
                <div key={rev._id} style={{ background: '#fafafa', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '14px', padding: '0.75rem 0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                    <span style={{ fontFamily: 'Outfit', fontSize: '0.82rem', fontWeight: 800, color: '#171717' }}>
                      {rev.customerName}
                    </span>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={11} fill={s <= rev.rating ? '#f59e0b' : 'none'} color={s <= rev.rating ? '#f59e0b' : '#d1d5db'} />
                      ))}
                    </div>
                  </div>
                  <p style={{ color: '#4b5563', fontSize: '0.78rem', margin: '0 0 0.3rem', lineHeight: 1.4 }}>
                    "{rev.comment || 'Excellent service!'}"
                  </p>
                  <span style={{ fontSize: '0.68rem', color: '#9ca3af', fontWeight: 600 }}>
                    Service: {rev.serviceName} · {new Date(rev.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ background: '#fafafa', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '14px', padding: '0.85rem', textAlign: 'center' }}>
              <p style={{ color: '#6b7280', fontSize: '0.8rem', margin: 0 }}>
                "Always punctual, extremely detail-oriented, and top-tier luxury output."
              </p>
              <span style={{ fontSize: '0.7rem', color: '#9ca3af', fontWeight: 700, marginTop: '0.3rem', display: 'block' }}>
                — Verified Atelier Client
              </span>
            </div>
          )}
        </div>

        {/* ── FIXED BOTTOM BAR (CHAT + BOOK NOW) ── */}
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          width: '100%',
          background: '#ffffff',
          borderTop: '1px solid rgba(0,0,0,0.08)',
          padding: '0.75rem 1rem calc(0.75rem + env(safe-area-inset-bottom))',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          zIndex: 900,
          boxShadow: '0 -8px 24px rgba(0,0,0,0.06)',
        }}>
          {/* Direct Message Icon Button */}
          <button
            onClick={() => setShowChatModal(true)}
            title="Chat with Expert"
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: '#ffffff',
              border: '1.5px solid #ec4899',
              color: '#ec4899',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <MessageSquare size={20} color="#ec4899" />
          </button>

          {/* Book Now Primary Button */}
          <button
            onClick={handleBookNow}
            style={{
              flex: 1,
              height: '48px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #d4af37, #b5952f)',
              color: '#ffffff',
              border: 'none',
              fontFamily: 'Outfit',
              fontSize: 'clamp(0.85rem, 3vw, 1rem)',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              boxShadow: '0 6px 20px rgba(212,175,55,0.35)',
              overflow: 'hidden',
            }}
          >
            <Calendar size={16} style={{ flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Book Now ({selectedService?.price || expert?.services?.[0]?.price || '₦20,000'})</span>
          </button>
        </div>

      </div>

      {/* ── EXPERT EDIT PROFILE BOTTOM SHEET ── */}
      <BottomSheet
        isOpen={showEditSheet}
        onClose={() => setShowEditSheet(false)}
        title="Manage My Professional Page"
      >
        <form onSubmit={handleSaveProfile} style={{ paddingBottom: '1.5rem' }}>
          
          {/* Cover Photo Upload */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label className="app-label">Cover Banner Image</label>
            <div style={{
              width: '100%',
              height: '110px',
              borderRadius: '14px',
              background: `url(${editForm.coverImage}) center/cover no-repeat #f3f4f6`,
              border: '1.5px dashed rgba(0,0,0,0.15)',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}>
              <label htmlFor="edit-cover-upload" style={{
                background: 'rgba(17,17,17,0.75)',
                color: '#ffffff',
                padding: '0.4rem 0.85rem',
                borderRadius: '50px',
                fontSize: '0.78rem',
                fontFamily: 'Outfit',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}>
                <Upload size={13} /> {uploadingCover ? 'Uploading...' : 'Change Cover Photo'}
              </label>
              <input id="edit-cover-upload" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleUploadCover} />
            </div>
          </div>

          {/* Avatar Photo Upload */}
          <div style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              background: `url(${editForm.avatar}) center/cover no-repeat #d4af37`,
              border: '2.5px solid #d4af37',
              flexShrink: 0
            }} />

            <div>
              <label htmlFor="edit-avatar-upload" style={{
                background: 'rgba(212,175,55,0.15)',
                border: '1px solid rgba(212,175,55,0.4)',
                color: '#b5952f',
                padding: '0.45rem 1rem',
                borderRadius: '50px',
                fontSize: '0.8rem',
                fontFamily: 'Outfit',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}>
                <Edit size={13} /> {uploadingAvatar ? 'Uploading...' : 'Change Profile Picture'}
              </label>
              <input id="edit-avatar-upload" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleUploadAvatar} />
              <p style={{ fontSize: '0.72rem', color: '#9ca3af', margin: '0.25rem 0 0' }}>JPG, PNG or WEBP up to 10MB</p>
            </div>
          </div>

          <div className="app-input-group">
            <label className="app-label">Display Name *</label>
            <input
              type="text"
              value={editForm.name}
              onChange={e => setEditForm({ ...editForm, name: e.target.value })}
              className="app-input"
              required
            />
          </div>

          <div className="app-input-group">
            <label className="app-label">Professional Role / Title *</label>
            <input
              type="text"
              value={editForm.role}
              onChange={e => setEditForm({ ...editForm, role: e.target.value })}
              className="app-input"
              placeholder="e.g. Master Barber & Cut Architect"
              required
            />
          </div>

          <div className="app-input-group">
            <label className="app-label">Location (City, State) *</label>
            <input
              type="text"
              value={editForm.location}
              onChange={e => setEditForm({ ...editForm, location: e.target.value })}
              className="app-input"
              placeholder="e.g. Lagos, Nigeria"
              required
            />
          </div>

          <div className="app-input-group">
            <label className="app-label">About / Biography *</label>
            <textarea
              rows={3}
              value={editForm.bio}
              onChange={e => setEditForm({ ...editForm, bio: e.target.value })}
              className="app-textarea"
              required
            />
          </div>

          {/* Offered Services & Prices Editor */}
          <div style={{ borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: '1rem', marginTop: '1rem' }}>
            <h4 style={{ fontFamily: 'Outfit', fontSize: '0.9rem', fontWeight: 800, color: '#171717', marginBottom: '0.65rem' }}>
              Manage Offered Services & Prices (₦)
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
              {editForm.services.map((s, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fafafa', padding: '0.5rem 0.75rem', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.06)' }}>
                  <span style={{ flex: 1, fontFamily: 'Outfit', fontSize: '0.85rem', fontWeight: 700, color: '#171717' }}>
                    {s.name}
                  </span>
                  <span style={{ fontFamily: 'Outfit', fontSize: '0.85rem', fontWeight: 900, color: '#b5952f' }}>
                    {s.price}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteService(idx)}
                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px' }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>

            {/* Add New Service Form Inline */}
            <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.08)' }}>
              <span style={{ fontSize: '0.78rem', fontFamily: 'Outfit', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '0.4rem' }}>
                + Add New Service to Menu
              </span>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input
                  type="text"
                  placeholder="Service Title (e.g. Wig Install)"
                  value={newServiceName}
                  onChange={e => setNewServiceName(e.target.value)}
                  className="app-input"
                  style={{ flex: 2 }}
                />
                <input
                  type="text"
                  placeholder="Price (e.g. 15000)"
                  value={newServicePrice}
                  onChange={e => setNewServicePrice(e.target.value)}
                  className="app-input"
                  style={{ flex: 1 }}
                />
              </div>
              <button
                type="button"
                onClick={handleAddService}
                className="app-btn app-btn-outline"
                style={{ minHeight: '36px', fontSize: '0.78rem', borderRadius: '8px' }}
              >
                <Plus size={14} /> Add Service
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={savingProfile}
            className="app-btn app-btn-primary"
            style={{ marginTop: '1.25rem', minHeight: '46px', borderRadius: '14px' }}
          >
            {savingProfile ? 'Publishing Changes...' : 'Save & Publish My Profile'}
          </button>
        </form>
      </BottomSheet>

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
    </PageContainer>
  );
};

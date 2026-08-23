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

const DEFAULT_EXPERT_PROFILES = [
  {
    id: 'stella-hair',
    name: 'Stella Hair',
    role: 'Wig Installer & Hair Artisan',
    rating: 4.9,
    reviewsCount: 86,
    location: 'Lagos, Nigeria',
    experience: '8+ Years Experience',
    bio: 'Specialized in luxury wigs, closures, frontals and custom wig customization. Renowned for flawless melting, scalp-matching lace, and long-lasting installs.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    coverImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
    services: [
      { name: 'Frontal Wig Install', price: '₦20,000' },
      { name: 'Closure Wig Install', price: '₦15,000' },
      { name: 'Wig Revamp & Styling', price: '₦10,000' },
      { name: 'Custom Wig Making', price: '₦25,000' },
    ]
  },
  {
    id: 'julian-reed',
    name: 'Julian Reed',
    role: 'Master Barber & Cut Architect',
    rating: 4.9,
    reviewsCount: 112,
    location: 'Abuja, Nigeria',
    experience: '12+ Years Experience',
    bio: 'Specializing in precision hair geometry, skin fades, and classic tailored cuts for executive clients.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    coverImage: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80',
    services: [
      { name: 'Precision Skin Fade & Cut', price: '₦12,000' },
      { name: 'Executive Beard Trim & Sculpting', price: '₦8,000' },
      { name: 'Scalp & Hair Treatment Combo', price: '₦15,000' },
      { name: 'Hot Towel Royal Shave', price: '₦10,000' },
    ]
  },
  {
    id: 'elena-thorne',
    name: 'Elena Thorne',
    role: 'Braiding & Extensions Artisan',
    rating: 5.0,
    reviewsCount: 94,
    location: 'Lagos, Nigeria',
    experience: '9+ Years Experience',
    bio: 'Renowned for gentle tension-free knotless braiding techniques, cornrows, and protective styling.',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    coverImage: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
    services: [
      { name: 'Knotless Box Braids', price: '₦22,000' },
      { name: 'Cornrows & Custom Pattern', price: '₦14,000' },
      { name: 'Goddess Braids Styling', price: '₦20,000' },
      { name: 'Loc Maintenance & Retwist', price: '₦18,000' },
    ]
  },
  {
    id: 'marcus-grey',
    name: 'Marcus Grey',
    role: 'Nail Architect & Pedicure Tech',
    rating: 4.8,
    reviewsCount: 76,
    location: 'Port Harcourt, Nigeria',
    experience: '7+ Years Experience',
    bio: 'Creating immaculate nail shapes, custom color gel architecture, and soothing therapeutic foot treatments.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    coverImage: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80',
    services: [
      { name: 'Full Gel Nail Architecture', price: '₦15,000' },
      { name: 'Luxury Spa Pedicure Session', price: '₦12,000' },
      { name: 'Acrylic Full Set Extension', price: '₦18,000' },
      { name: 'Custom Nail Art (Per Hand)', price: '₦6,000' },
    ]
  }
];

export const ExpertProfile = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast, user } = useAuth();

  const queryName = searchParams.get('name') || searchParams.get('stylist') || 'Stella Hair';
  
  const [expert, setExpert] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
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
    const searchLower = queryName.toLowerCase();
    let found = DEFAULT_EXPERT_PROFILES.find(p => p.name.toLowerCase().includes(searchLower) || p.id.includes(searchLower));

    // Check if custom profile saved in localStorage
    const targetId = found ? found.id : searchLower.replace(/\s+/g, '-');
    const customSaved = localStorage.getItem(`expert_profile_custom_${targetId}`);

    if (customSaved) {
      try {
        const parsed = JSON.parse(customSaved);
        setExpert(parsed);
        setSelectedService(parsed.services[0]);
        return;
      } catch (err) {}
    }

    if (found) {
      setExpert(found);
      setSelectedService(found.services[0]);
    } else {
      // Fallback API lookup or generate dynamic profile
      api.getSpecialists()
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            const matched = data.find(s => `${s.firstname} ${s.lastname}`.toLowerCase().includes(searchLower));
            if (matched) {
              const fullName = `${matched.firstname || ''} ${matched.lastname || ''}`.trim() || 'Style Specialist';
              const specs = Array.isArray(matched.services)
                ? matched.services
                : (matched.services ? String(matched.services).split(',') : ['Hair Cut & Styling', 'Beard Trim']);
              
              const dynamicProfile = {
                id: matched._id || fullName.toLowerCase().replace(/\s+/g, '-'),
                name: fullName,
                role: matched.specialties ? (Array.isArray(matched.specialties) ? matched.specialties.join(' · ') : matched.specialties) : 'Certified Master Specialist',
                rating: 5.0,
                reviewsCount: 42,
                location: matched.state ? `${matched.state}, Nigeria` : 'Lagos, Nigeria',
                experience: 'Verified Atelier Expert',
                bio: `Specialized in premium ${specs.join(', ')}. Dedicated to luxury client care and bespoke grooming experiences.`,
                avatar: matched.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
                coverImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
                services: specs.map((s, idx) => ({
                  name: s,
                  price: `₦${(idx + 1) * 10 + 5},000`
                }))
              };
              setExpert(dynamicProfile);
              setSelectedService(dynamicProfile.services[0]);
              return;
            }
          }
          setExpert(DEFAULT_EXPERT_PROFILES[0]);
          setSelectedService(DEFAULT_EXPERT_PROFILES[0].services[0]);
        })
        .catch(() => {
          setExpert(DEFAULT_EXPERT_PROFILES[0]);
          setSelectedService(DEFAULT_EXPERT_PROFILES[0].services[0]);
        });
    }
  }, [queryName]);

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
    setUploadingCover(true);
    try {
      const url = await uploadToCloudinary(file);
      setEditForm(prev => ({ ...prev, coverImage: url }));
      showToast('Cover photo uploaded!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to upload cover photo', 'error');
    } finally {
      setUploadingCover(false);
    }
  };

  const handleUploadAvatar = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const url = await uploadToCloudinary(file);
      setEditForm(prev => ({ ...prev, avatar: url }));
      showToast('Avatar photo uploaded!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to upload avatar photo', 'error');
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

  const handleSaveProfile = (e) => {
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

      // Save to localStorage for persistence
      localStorage.setItem(`expert_profile_custom_${expert.id}`, JSON.stringify(updatedProfile));
      setShowEditSheet(false);
      showToast('Your professional profile has been updated & published!', 'success');
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
            height: '200px',
            background: `url(${expert.coverImage}) center/cover no-repeat`,
            borderRadius: '0 0 24px 24px',
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.4) 100%)',
              borderRadius: '0 0 24px 24px',
            }} />

            <button
              onClick={handleOpenEditSheet}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'rgba(0,0,0,0.65)',
                color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '50px',
                padding: '0.35rem 0.75rem',
                fontSize: '0.72rem',
                fontFamily: 'Outfit',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}
            >
              <Edit size={12} /> Change Banner
            </button>
          </div>

          {/* Floating Avatar Circle */}
          <div
            onClick={handleOpenEditSheet}
            style={{
              position: 'absolute',
              bottom: '-36px',
              left: '1.25rem',
              width: '84px',
              height: '84px',
              borderRadius: '50%',
              background: `url(${expert.avatar}) center/cover no-repeat`,
              border: '4px solid #ffffff',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              cursor: 'pointer'
            }}
          >
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
              justifyContent: 'center'
            }}>
              <Edit size={10} />
            </div>
          </div>
        </div>

        {/* ── EXPERT HEADER METADATA ── */}
        <div style={{ padding: '0 1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
            <h1 style={{
              fontFamily: 'Outfit',
              fontSize: '1.5rem',
              fontWeight: 900,
              color: '#171717',
              margin: 0,
              lineHeight: 1.1,
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
            }}>
              <Check size={11} strokeWidth={3} />
            </div>
          </div>

          <p style={{
            color: '#6b7280',
            fontSize: '0.88rem',
            fontFamily: 'Outfit',
            fontWeight: 600,
            margin: '0 0 0.65rem 0',
          }}>
            {expert.role}
          </p>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
            fontSize: '0.82rem',
            color: '#4b5563',
            flexWrap: 'wrap',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 700 }}>
              <Star size={15} fill="#f59e0b" color="#f59e0b" />
              <span style={{ color: '#171717', fontWeight: 800 }}>{expert.rating}</span>
              <span style={{ color: '#9ca3af', fontWeight: 500 }}>({expert.reviewsCount} reviews)</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#6b7280', fontWeight: 600 }}>
              <MapPin size={15} color="#9ca3af" />
              <span>{expert.location}</span>
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
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
                    padding: '0.95rem 1rem',
                    borderRadius: '14px',
                    background: isSelected ? '#faf8f5' : '#fafafa',
                    border: isSelected ? '1.5px solid #d4af37' : '1px solid rgba(0,0,0,0.06)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: isSelected ? '0 4px 14px rgba(212,175,55,0.15)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      border: isSelected ? '5px solid #d4af37' : '2px solid #d1d5db',
                      background: '#ffffff',
                      flexShrink: 0,
                      transition: 'all 0.2s ease',
                    }} />
                    <span style={{
                      fontFamily: 'Outfit',
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      color: '#171717',
                    }}>
                      {service.name}
                    </span>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.72rem', color: '#9ca3af', fontWeight: 600, marginRight: '0.25rem' }}>From</span>
                    <span style={{ fontFamily: 'Outfit', fontSize: '0.95rem', fontWeight: 900, color: '#171717' }}>
                      {service.price}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── FIXED BOTTOM BAR (CHAT + BOOK NOW) ── */}
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: '480px',
          background: '#ffffff',
          borderTop: '1px solid rgba(0,0,0,0.08)',
          padding: '0.85rem 1.25rem calc(0.85rem + env(safe-area-inset-bottom))',
          display: 'flex',
          alignItems: 'center',
          gap: '0.85rem',
          zIndex: 900,
          boxShadow: '0 -8px 24px rgba(0,0,0,0.06)',
        }}>
          {/* Direct Message Icon Button */}
          <button
            onClick={() => setShowChatModal(true)}
            title="Chat with Expert"
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '16px',
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
            <MessageSquare size={22} color="#ec4899" />
          </button>

          {/* Book Now Primary Button */}
          <button
            onClick={handleBookNow}
            style={{
              flex: 1,
              height: '52px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #d4af37, #b5952f)',
              color: '#ffffff',
              border: 'none',
              fontFamily: 'Outfit',
              fontSize: '1rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: '0 6px 20px rgba(212,175,55,0.35)',
            }}
          >
            <Calendar size={18} />
            <span>Book Now ({selectedService ? selectedService.price : expert.services[0].price})</span>
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

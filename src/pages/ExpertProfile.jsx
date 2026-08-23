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
  Check
} from 'lucide-react';
import { PageContainer } from '../components/common/PageContainer';
import { PopupModal } from '../components/common/PopupModal';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

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
      { name: 'Frontal Wig Install', price: '₦20,000', usdPrice: 50 },
      { name: 'Closure Wig Install', price: '₦15,000', usdPrice: 38 },
      { name: 'Wig Revamp & Styling', price: '₦10,000', usdPrice: 25 },
      { name: 'Custom Wig Making', price: '₦25,000', usdPrice: 62 },
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
      { name: 'Precision Skin Fade & Cut', price: '₦12,000', usdPrice: 30 },
      { name: 'Executive Beard Trim & Sculpting', price: '₦8,000', usdPrice: 20 },
      { name: 'Scalp & Hair Treatment Combo', price: '₦15,000', usdPrice: 38 },
      { name: 'Hot Towel Royal Shave', price: '₦10,000', usdPrice: 25 },
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
      { name: 'Knotless Box Braids', price: '₦22,000', usdPrice: 55 },
      { name: 'Cornrows & Custom Pattern', price: '₦14,000', usdPrice: 35 },
      { name: 'Goddess Braids Styling', price: '₦20,000', usdPrice: 50 },
      { name: 'Loc Maintenance & Retwist', price: '₦18,000', usdPrice: 45 },
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
      { name: 'Full Gel Nail Architecture', price: '₦15,000', usdPrice: 38 },
      { name: 'Luxury Spa Pedicure Session', price: '₦12,000', usdPrice: 30 },
      { name: 'Acrylic Full Set Extension', price: '₦18,000', usdPrice: 45 },
      { name: 'Custom Nail Art (Per Hand)', price: '₦6,000', usdPrice: 15 },
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

  useEffect(() => {
    // Find matching expert from defaults or API
    const searchLower = queryName.toLowerCase();
    let found = DEFAULT_EXPERT_PROFILES.find(p => p.name.toLowerCase().includes(searchLower) || p.id.includes(searchLower));

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
                  price: `₦${(idx + 1) * 10 + 10},000`,
                  usdPrice: (idx + 1) * 20 + 20
                }))
              };
              setExpert(dynamicProfile);
              setSelectedService(dynamicProfile.services[0]);
              return;
            }
          }
          // Default fallback to Stella Hair
          setExpert(DEFAULT_EXPERT_PROFILES[0]);
          setSelectedService(DEFAULT_EXPERT_PROFILES[0].services[0]);
        })
        .catch(() => {
          setExpert(DEFAULT_EXPERT_PROFILES[0]);
          setSelectedService(DEFAULT_EXPERT_PROFILES[0].services[0]);
        });
    }
  }, [queryName]);

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

  return (
    <PageContainer hideHeader={true}>
      <div style={{
        minHeight: '100vh',
        background: '#ffffff',
        paddingBottom: '6rem',
        margin: '-1rem', // full bleed container
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

          <button
            style={{
              background: 'none',
              border: 'none',
              color: '#171717',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <MoreHorizontal size={20} />
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
          </div>

          {/* Floating Avatar Circle */}
          <div style={{
            position: 'absolute',
            bottom: '-36px',
            left: '1.25rem',
            width: '84px',
            height: '84px',
            borderRadius: '50%',
            background: `url(${expert.avatar}) center/cover no-repeat`,
            border: '4px solid #ffffff',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          }} />
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
            {/* Verified Badge Circle */}
            <div style={{
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              background: '#ec4899', // Pinkish red badge as in reference UI
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
          <h3 style={{
            fontFamily: 'Outfit',
            fontSize: '1rem',
            fontWeight: 800,
            color: '#171717',
            marginBottom: '0.75rem',
          }}>
            Services
          </h3>

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
              transition: 'transform 0.2s ease',
            }}
            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.94)'}
            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
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
              transition: 'transform 0.2s ease',
            }}
            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <Calendar size={18} />
            <span>Book Now ({selectedService ? selectedService.price : expert.services[0].price})</span>
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
    </PageContainer>
  );
};

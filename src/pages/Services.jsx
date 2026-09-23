import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ChevronRight, ArrowRight } from 'lucide-react';
import { PageContainer } from '../components/common/PageContainer';
import { preloadRoute } from '../App';

// SVG Icons for the 6 services
const LashTechIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" width="32" height="32">
    <ellipse cx="32" cy="34" rx="18" ry="10" fill="#F5B942" fillOpacity="0.18" />
    <path d="M14 34 Q32 18 50 34" stroke="#F5B942" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M20 30 Q22 22 24 18" stroke="#F5B942" strokeWidth="2" strokeLinecap="round" />
    <path d="M26 27 Q27 19 29 14" stroke="#F5B942" strokeWidth="2" strokeLinecap="round" />
    <path d="M32 26 Q32 18 32 13" stroke="#F5B942" strokeWidth="2" strokeLinecap="round" />
    <path d="M38 27 Q37 19 35 14" stroke="#F5B942" strokeWidth="2" strokeLinecap="round" />
    <path d="M44 30 Q42 22 40 18" stroke="#F5B942" strokeWidth="2" strokeLinecap="round" />
    <ellipse cx="32" cy="35" rx="7" ry="4" fill="#F5B942" fillOpacity="0.35" />
    <circle cx="32" cy="35" r="3" fill="#F5B942" />
  </svg>
);

const NailTechIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" width="32" height="32">
    <rect x="22" y="8" width="8" height="32" rx="4" fill="#e879f9" fillOpacity="0.2" stroke="#e879f9" strokeWidth="2" />
    <rect x="34" y="12" width="8" height="28" rx="4" fill="#e879f9" fillOpacity="0.2" stroke="#e879f9" strokeWidth="2" />
    <rect x="10" y="16" width="8" height="24" rx="4" fill="#e879f9" fillOpacity="0.2" stroke="#e879f9" strokeWidth="2" />
    <rect x="46" y="16" width="8" height="24" rx="4" fill="#e879f9" fillOpacity="0.2" stroke="#e879f9" strokeWidth="2" />
    <rect x="10" y="44" width="44" height="10" rx="5" fill="#e879f9" fillOpacity="0.4" stroke="#e879f9" strokeWidth="1.5" />
    <rect x="23" y="9" width="6" height="10" rx="3" fill="#e879f9" fillOpacity="0.6" />
    <rect x="35" y="13" width="6" height="10" rx="3" fill="#e879f9" fillOpacity="0.6" />
  </svg>
);

const HairBraiderIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" width="32" height="32">
    <circle cx="32" cy="14" r="9" fill="#34d399" fillOpacity="0.2" stroke="#34d399" strokeWidth="2" />
    <path d="M26 23 Q20 34 22 50 Q26 58 32 58 Q38 58 42 50 Q44 34 38 23" fill="#34d399" fillOpacity="0.12" stroke="#34d399" strokeWidth="2" />
    <path d="M26 28 Q32 35 38 28" stroke="#34d399" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M24 36 Q32 43 40 36" stroke="#34d399" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M25 44 Q32 50 39 44" stroke="#34d399" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="32" cy="14" r="4" fill="#34d399" fillOpacity="0.6" />
  </svg>
);

const BarberIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" width="32" height="32">
    <path d="M20 8 L26 22 L20 36" stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M44 8 L38 22 L44 36" stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="26" cy="22" r="4" fill="#60a5fa" fillOpacity="0.5" stroke="#60a5fa" strokeWidth="1.5" />
    <circle cx="38" cy="22" r="4" fill="#60a5fa" fillOpacity="0.5" stroke="#60a5fa" strokeWidth="1.5" />
    <rect x="26" y="20" width="12" height="4" rx="2" fill="#60a5fa" fillOpacity="0.3" />
    <rect x="12" y="42" width="40" height="6" rx="3" fill="#60a5fa" fillOpacity="0.15" stroke="#60a5fa" strokeWidth="1.5" />
    <rect x="16" y="48" width="32" height="10" rx="3" fill="#60a5fa" fillOpacity="0.25" stroke="#60a5fa" strokeWidth="1.5" />
    <line x1="32" y1="42" x2="32" y2="58" stroke="#60a5fa" strokeWidth="1.5" />
  </svg>
);

const MakeupArtistIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" width="32" height="32">
    <ellipse cx="32" cy="28" rx="14" ry="16" fill="#f87171" fillOpacity="0.12" stroke="#f87171" strokeWidth="2" />
    <path d="M22 28 Q32 36 42 28" stroke="#f87171" strokeWidth="2" strokeLinecap="round" />
    <ellipse cx="25" cy="24" rx="3" ry="2" fill="#f87171" fillOpacity="0.5" />
    <ellipse cx="39" cy="24" rx="3" ry="2" fill="#f87171" fillOpacity="0.5" />
    <path d="M26 20 Q28 17 32 18 Q36 17 38 20" stroke="#f87171" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="32" cy="50" r="5" fill="#f87171" fillOpacity="0.25" stroke="#f87171" strokeWidth="2" />
    <path d="M32 44 L32 54" stroke="#f87171" strokeWidth="2" strokeLinecap="round" />
    <circle cx="32" cy="50" r="2" fill="#f87171" />
  </svg>
);

const WigInstallerIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" width="32" height="32">
    <path d="M14 30 Q12 14 32 10 Q52 14 50 30 L50 40 Q50 50 32 52 Q14 50 14 40 Z" fill="#a78bfa" fillOpacity="0.15" stroke="#a78bfa" strokeWidth="2" />
    <path d="M14 30 Q8 20 16 14" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" />
    <path d="M50 30 Q56 20 48 14" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" />
    <path d="M18 18 Q18 10 26 8" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" />
    <path d="M46 18 Q46 10 38 8" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" />
    <path d="M32 10 Q32 6 32 4" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" />
    <ellipse cx="32" cy="36" rx="10" ry="6" fill="#a78bfa" fillOpacity="0.25" />
  </svg>
);

const SERVICES_LIST = [
  {
    id: 'lash_tech',
    categoryKey: 'lash_tech',
    title: 'Lash Tech',
    price: 'From ₦6,000',
    duration: '75 mins',
    desc: 'Classic, hybrid & volume silk lash extensions — tailored to your eye shape.',
    icon: LashTechIcon,
    color: '#F5B942',
    bg: 'rgba(245,185,66,0.1)',
  },
  {
    id: 'nail_tech',
    categoryKey: 'nail_tech',
    title: 'Nail Tech',
    price: 'From ₦4,500',
    duration: '60 mins',
    desc: 'Gel extensions, nail architecture & 3D nail art — precision finish every time.',
    icon: NailTechIcon,
    color: '#e879f9',
    bg: 'rgba(232,121,249,0.1)',
  },
  {
    id: 'hair_braider',
    categoryKey: 'hair_braider',
    title: 'Hair Braider & Stylist',
    price: 'From ₦6,500',
    duration: '120 mins',
    desc: 'Knotless box braids, goddess braids, twists & protective styles done by skilled hands.',
    icon: HairBraiderIcon,
    color: '#34d399',
    bg: 'rgba(52,211,153,0.1)',
  },
  {
    id: 'barber',
    categoryKey: 'barber',
    title: 'Barber',
    price: 'From ₦4,000',
    duration: '45 mins',
    desc: 'Precision fades, sharp line-ups & beard sculpting — always clean, always fresh.',
    icon: BarberIcon,
    color: '#60a5fa',
    bg: 'rgba(96,165,250,0.1)',
  },
  {
    id: 'makeup_artist',
    categoryKey: 'makeup_artist',
    title: 'Makeup Artist',
    price: 'From ₦9,000',
    duration: '90 mins',
    desc: 'Bridal glam, soft natural beat, photoshoot makeup & sculpted brows by certified artists.',
    icon: MakeupArtistIcon,
    color: '#f87171',
    bg: 'rgba(248,113,113,0.1)',
  },
  {
    id: 'wig_installer',
    categoryKey: 'wig_installer',
    title: 'Wig Installer & Revamper',
    price: 'From ₦7,500',
    duration: '90 mins',
    desc: 'Lace melting, custom frontal install, deep washing & hot-comb wig revival services.',
    icon: WigInstallerIcon,
    color: '#a78bfa',
    bg: 'rgba(167,139,250,0.1)',
  },
];

export const Services = () => {
  const navigate = useNavigate();

  const handleSelectService = (categoryKey) => {
    // Direct navigation to registered specialists matching this category (no modal popup)
    navigate(`/experts?category=${encodeURIComponent(categoryKey)}`);
  };

  return (
    <PageContainer showBack={true} onOpenAiMatcher={() => navigate('/ai-matcher')}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h1 style={{ fontFamily: 'Outfit', fontSize: '1.65rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.25rem' }}>
              Atelier Services
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.84rem', margin: 0 }}>
              Tap any service to view registered & verified specialists near you.
            </p>
          </div>
          <button
            onClick={() => navigate('/ai-matcher')}
            onMouseEnter={() => preloadRoute('/ai-matcher')}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              background: 'linear-gradient(135deg, rgba(245,185,66,0.18), rgba(245,185,66,0.06))',
              border: '1.5px solid rgba(245,185,66,0.45)', borderRadius: '50px',
              padding: '0.5rem 0.95rem', color: '#f5b942', fontFamily: 'Outfit',
              fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer', minHeight: '44px', touchAction: 'manipulation',
            }}
          >
            <Sparkles size={15} /><span>AI Matcher</span>
          </button>
        </div>

        {/* AI Matcher Hero Banner */}
        <div
          onClick={() => navigate('/ai-matcher')}
          onMouseEnter={() => preloadRoute('/ai-matcher')}
          style={{
            background: 'linear-gradient(135deg, rgba(245,185,66,0.12), rgba(20,24,34,0.95))',
            border: '1px solid rgba(245,185,66,0.35)', borderRadius: '18px',
            padding: '1.1rem 1.25rem', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', gap: '1rem', cursor: 'pointer', touchAction: 'manipulation',
            boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(245,185,66,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f5b942', flexShrink: 0 }}>
              <Sparkles size={22} />
            </div>
            <div>
              <h4 style={{ fontFamily: 'Outfit', fontSize: '0.94rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.2rem' }}>
                Need Personalized Recommendations?
              </h4>
              <p style={{ color: '#94a3b8', fontSize: '0.76rem', margin: 0 }}>
                Let our AI Matcher pair your exact look, vibe & location with top verified artists.
              </p>
            </div>
          </div>
          <span style={{ color: '#f5b942', fontSize: '0.82rem', fontWeight: 800, fontFamily: 'Outfit', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.3rem', flexShrink: 0 }}>
            Match Now <ArrowRight size={14} />
          </span>
        </div>

        {/* Section Label */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.72rem', fontFamily: 'Outfit', fontWeight: 800, color: '#F5B942', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
            Select Service Category
          </span>
          <span style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'Outfit' }}>
            6 Specialized Fields
          </span>
        </div>

        {/* Services Grid — 2 columns on mobile/tablet */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {SERVICES_LIST.map((service) => {
            const IconComponent = service.icon;
            return (
              <div
                key={service.id}
                onClick={() => handleSelectService(service.categoryKey)}
                onMouseEnter={() => preloadRoute('/experts')}
                style={{
                  background: '#151822',
                  borderRadius: '20px',
                  padding: '1.25rem',
                  border: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  touchAction: 'manipulation',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.borderColor = service.color + '66';
                  e.currentTarget.style.boxShadow = `0 10px 28px ${service.color}1a`;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Accent top border highlight */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: `linear-gradient(90deg, transparent, ${service.color}, transparent)` }} />

                {/* Icon & Title Row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div style={{ width: '54px', height: '54px', borderRadius: '14px', background: service.bg, border: `1.5px solid ${service.color}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <IconComponent />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontFamily: 'Outfit', fontSize: '1rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.2rem' }}>
                      {service.title}
                    </h3>
                    <p style={{ fontSize: '0.78rem', color: service.color, fontWeight: 800, fontFamily: 'Outfit', margin: 0 }}>
                      {service.price}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <p style={{ fontSize: '0.76rem', color: '#94a3b8', margin: 0, lineHeight: 1.45 }}>
                  {service.desc}
                </p>

                {/* Action Footer */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', fontFamily: 'Outfit', background: 'rgba(255,255,255,0.04)', padding: '0.2rem 0.55rem', borderRadius: '6px' }}>
                    ⏱ {service.duration}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: service.color, fontSize: '0.76rem', fontWeight: 800, fontFamily: 'Outfit' }}>
                    <span>Find Specialists</span>
                    <div style={{ width: '24px', height: '24px', borderRadius: '8px', background: service.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ChevronRight size={14} color={service.color} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </PageContainer>
  );
};

export default Services;

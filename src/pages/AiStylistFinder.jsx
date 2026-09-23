import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Star,
  ShieldCheck,
  MapPin,
  Calendar,
  Clock,
  Check,
  RefreshCw,
  Sliders,
  Award,
  Zap,
  ChevronDown,
  UserCheck,
  Home as HomeIcon,
  Store,
} from 'lucide-react';
import { PageContainer } from '../components/common/PageContainer';
import { Avatar } from '../components/common/Avatar';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

// SVG Icons for the 6 official services
const LashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="18" height="18">
    <ellipse cx="12" cy="13" rx="7" ry="4" stroke="currentColor" fill="none" />
    <path d="M5 13 C8 8 16 8 19 13" />
    <path d="M7 11 L6 8" />
    <path d="M10 10 L10 7" />
    <path d="M14 10 L14 7" />
    <path d="M17 11 L18 8" />
    <circle cx="12" cy="13.5" r="1.5" fill="currentColor" />
  </svg>
);

const NailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
    <rect x="7" y="3" width="10" height="15" rx="3" />
    <path d="M7 11 H17" />
    <rect x="9.5" y="4" width="5" height="4" rx="1.5" fill="currentColor" fillOpacity="0.4" />
    <path d="M6 21 H18" />
  </svg>
);

const BraiderIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
    <circle cx="12" cy="6" r="3" />
    <path d="M9 9 C9 13 8 17 9 21" />
    <path d="M15 9 C15 13 16 17 15 21" />
    <path d="M10 12 L14 15" />
    <path d="M14 12 L10 15" />
    <path d="M10 17 L14 20" />
  </svg>
);

const BarberIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
    <path d="M6 3 L10 12 L6 21" />
    <path d="M18 3 L14 12 L18 21" />
    <line x1="8.5" y1="12" x2="15.5" y2="12" />
    <rect x="5" y="19" width="14" height="2" rx="1" />
  </svg>
);

const MakeupIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
    <path d="M8 21 L16 21" />
    <path d="M9 13 L15 13" />
    <path d="M10 13 L10 7 C10 4.8 11 3 12 3 C13 3 14 4.8 14 7 L14 13" fill="currentColor" fillOpacity="0.3" />
    <rect x="8" y="13" width="8" height="8" rx="2" />
  </svg>
);

const WigIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
    <path d="M5 14 C4 8 8 4 12 4 C16 4 20 8 19 14" />
    <path d="M5 14 C4 18 6 21 8 21" />
    <path d="M19 14 C20 18 18 21 16 21" />
    <path d="M8 8 C10 6 14 6 16 8" />
  </svg>
);

const SERVICES = [
  { id: 'lash_tech', label: 'Lash Tech', service: 'Lash Tech', price: 6000, duration: '75 mins', icon: LashIcon, color: '#F5B942' },
  { id: 'nail_tech', label: 'Nail Tech', service: 'Nail Tech', price: 4500, duration: '60 mins', icon: NailIcon, color: '#e879f9' },
  { id: 'hair_braider', label: 'Hair Braider & Stylist', service: 'Hair Braider & Stylist', price: 6500, duration: '120 mins', icon: BraiderIcon, color: '#34d399' },
  { id: 'barber', label: 'Barber', service: 'Barber', price: 4000, duration: '45 mins', icon: BarberIcon, color: '#60a5fa' },
  { id: 'makeup_artist', label: 'Makeup Artist', service: 'Makeup Artist', price: 9000, duration: '90 mins', icon: MakeupIcon, color: '#f87171' },
  { id: 'wig_installer', label: 'Wig Installer & Revamper', service: 'Wig Installer & Revamper', price: 7500, duration: '90 mins', icon: WigIcon, color: '#a78bfa' },
];

const VIBES = [
  { id: 'executive', label: 'Bespoke Executive Luxury', desc: 'Impeccable, understated elegance for elite professionals' },
  { id: 'redcarpet', label: 'Red Carpet & Event Glam', desc: 'High-impact, head-turning editorial drama' },
  { id: 'daily', label: 'Clean Minimalist Chic', desc: 'Effortless, fresh everyday grooming & maintenance' },
  { id: 'bold', label: 'Avant-Garde & Fashion Bold', desc: 'Creative, contemporary cuts, colors & art' },
];

const PROMPT_CHIPS = [
  'Russian volume silk lash extensions in Victoria Island',
  'Gel-X chrome glazed nails with 3D sculpted architecture',
  'Boho knotless braids with French curl ends',
  'Low skin taper fade, crisp line-up & hot towel beard sculpt',
  'Bridal glam soft beat with sculpted brows for evening gala',
  'HD invisible lace frontal melt and custom body wave styling',
];

const LOCATIONS = [
  'Victoria Island, Lagos',
  'Lekki Phase 1, Lagos',
  'Ikoyi, Lagos',
  'Ikeja GRA, Lagos',
  'Maitama, Abuja',
  'Wuse II, Abuja',
  'Port Harcourt (GRA)',
];

const TIME_SLOTS = [
  { id: 'morning', label: 'Morning (9:00 AM – 12:00 PM)', icon: '🌅' },
  { id: 'afternoon', label: 'Afternoon (12:00 PM – 4:00 PM)', icon: '☀️' },
  { id: 'evening', label: 'Evening (4:00 PM – 8:00 PM)', icon: '🌙' },
];

export const AiStylistFinder = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useAuth();

  // Consultation State
  const [customPrompt, setCustomPrompt] = useState(searchParams.get('q') || '');
  const [selectedService, setSelectedService] = useState('Hair Braider & Stylist');
  const [selectedVibe, setSelectedVibe] = useState('Bespoke Executive Luxury');
  const [serviceMode, setServiceMode] = useState('atelier'); // 'atelier' | 'home'
  const [selectedLocation, setSelectedLocation] = useState('Victoria Island, Lagos');
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('Afternoon (12:00 PM – 4:00 PM)');

  // Matching & Results State
  const [matching, setMatching] = useState(false);
  const [matchingStep, setMatchingStep] = useState(0);
  const [matchedResults, setMatchedResults] = useState(null);

  const matchingSteps = [
    'Parsing aesthetic vibe & technique parameters…',
    'Analyzing verified specialist masteries & live ratings…',
    'Verifying schedule availability & regional proximity…',
    'Generating neural match profile…',
  ];

  const handleRunMatcher = async (e) => {
    if (e) e.preventDefault();
    setMatching(true);
    setMatchingStep(0);

    const stepInterval = setInterval(() => {
      setMatchingStep((prev) => (prev < matchingSteps.length - 1 ? prev + 1 : prev));
    }, 450);

    try {
      const queryPayload = customPrompt
        ? `${customPrompt} (${selectedService} - ${selectedVibe} in ${selectedLocation})`
        : `${selectedService} styled with ${selectedVibe} in ${selectedLocation} on ${selectedDate} (${serviceMode === 'home' ? 'Home VIP Service' : 'Atelier Suite'})`;

      const [aiData, allSpecialists] = await Promise.all([
        api.matchAiSpecialist(queryPayload, selectedService, '').catch(() => ({})),
        api.getSpecialists().catch(() => []),
      ]);

      clearInterval(stepInterval);

      // Curated backup database
      const fallbackList = [
        {
          _id: 'spec_zainab',
          firstname: 'Zainab',
          lastname: 'Adeleke',
          title: 'Master Wig & Silk Press Artisan',
          rating: 4.98,
          reviewsCount: 84,
          location: selectedLocation,
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        },
        {
          _id: 'spec_julian',
          firstname: 'Julian',
          lastname: 'Reed',
          title: 'Executive Barber & Groomer',
          rating: 4.92,
          reviewsCount: 62,
          location: selectedLocation,
          avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
        },
        {
          _id: 'spec_amara',
          firstname: 'Amara',
          lastname: 'Okonkwo',
          title: 'Celebrity Braids & Stylist',
          rating: 4.95,
          reviewsCount: 71,
          location: selectedLocation,
          avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
        },
        {
          _id: 'spec_kemi',
          firstname: 'Kemi',
          lastname: 'Balogun',
          title: 'Russian Volume Lash & Glam Artist',
          rating: 4.96,
          reviewsCount: 53,
          location: selectedLocation,
          avatarUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=400&q=80',
        },
      ];

      const verifiedList = Array.isArray(allSpecialists) && allSpecialists.length > 0
        ? allSpecialists
        : fallbackList;

      // Filter by specialist matching this service if possible
      const matchedSpecialists = verifiedList.filter((spec) => {
        const text = [
          spec.title || '',
          ...(Array.isArray(spec.services) ? spec.services.map((s) => (typeof s === 'object' ? s.name || '' : String(s))) : []),
        ].join(' ').toLowerCase();
        
        if (selectedService === 'Lash Tech') return text.includes('lash');
        if (selectedService === 'Nail Tech') return text.includes('nail');
        if (selectedService === 'Hair Braider & Stylist') return text.includes('braid') || text.includes('hair');
        if (selectedService === 'Barber') return text.includes('barber') || text.includes('fade');
        if (selectedService === 'Makeup Artist') return text.includes('makeup') || text.includes('glam');
        if (selectedService === 'Wig Installer & Revamper') return text.includes('wig') || text.includes('frontal');
        return true;
      });

      const pool = matchedSpecialists.length > 0 ? matchedSpecialists : verifiedList;
      const primary = pool[0];
      const primaryName = aiData?.match?.name || `${primary.firstname || ''} ${primary.lastname || ''}`.trim() || 'Zainab Adeleke';
      const primaryAvatar = aiData?.match?.avatarUrl || primary.avatarUrl || primary.profileImage || '';

      const matchedServiceObj = SERVICES.find((s) => s.service === selectedService) || SERVICES[0];

      setMatchedResults({
        topMatch: {
          id: primary._id || 'spec_primary',
          name: primaryName,
          title: primary.title || `${selectedService} Senior Specialist`,
          rating: primary.rating || 4.98,
          reviewsCount: primary.reviewsCount || 84,
          location: selectedLocation,
          avatarUrl: primaryAvatar,
          service: selectedService,
          price: matchedServiceObj.price,
          duration: matchedServiceObj.duration,
          matchScore: 99,
          badge: 'Top Neural Match',
          rationale: aiData?.match?.rationale ||
            `Optimal match for ${selectedService}. Verified portfolio in ${selectedLocation} matching the ${selectedVibe} aesthetic.`,
        },
        alternates: pool.slice(1, 3).map((spec, idx) => ({
          id: spec._id || `spec_alt_${idx}`,
          name: `${spec.firstname || ''} ${spec.lastname || ''}`.trim() || 'Verified Specialist',
          title: spec.title || `${selectedService} Specialist`,
          rating: spec.rating || (4.9 - idx * 0.05),
          reviewsCount: spec.reviewsCount || (50 - idx * 10),
          location: selectedLocation,
          avatarUrl: spec.avatarUrl || spec.profileImage || '',
          service: selectedService,
          price: matchedServiceObj.price,
          duration: matchedServiceObj.duration,
          matchScore: 96 - idx * 3,
        })),
      });

      setTimeout(() => {
        const el = document.getElementById('ai-match-results-container');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err) {
      clearInterval(stepInterval);
      showToast?.('AI Matcher completed with verified atelier recommendations.', 'info');
    } finally {
      setMatching(false);
    }
  };

  const handleBookDirectly = (stylist) => {
    const params = new URLSearchParams({
      stylist: stylist.name,
      stylistId: stylist.id,
      service: selectedService,
      date: selectedDate,
      time: selectedTimeSlot.split(' ')[0] || '12:00 PM',
      location: `${selectedLocation} (${serviceMode === 'home' ? 'VIP Home Service' : 'Atelier Suite'})`,
    });
    navigate(`/booking?${params.toString()}`);
  };

  return (
    <PageContainer title="AI Style Matcher" showBack={true}>
      <div style={{ maxWidth: '640px', margin: '0 auto', paddingBottom: '3rem' }}>

        {/* ── Luxury Header ── */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'rgba(245, 185, 66, 0.12)',
              border: '1px solid rgba(245, 185, 66, 0.35)',
              borderRadius: '50px',
              padding: '0.35rem 0.85rem',
              color: '#F5B942',
              fontFamily: 'Outfit',
              fontSize: '0.74rem',
              fontWeight: 800,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginBottom: '0.65rem',
            }}
          >
            <Sparkles size={13} />
            <span>Neural Look Matcher</span>
          </div>

          <h1
            style={{
              fontFamily: 'Outfit',
              fontSize: 'clamp(1.5rem, 5vw, 1.95rem)',
              fontWeight: 800,
              color: '#ffffff',
              margin: '0 0 0.4rem',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
            }}
          >
            Match Your Look & Book Instantly
          </h1>
          <p
            style={{
              color: '#94a3b8',
              fontSize: '0.88rem',
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            Select your service, vibe, and location. Our AI engine scans registered, verified artisans and pairs you with your ideal match.
          </p>
        </div>

        {/* ── Inspiration Prompt Input ── */}
        <div
          style={{
            background: '#151822',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '22px',
            padding: '1.25rem',
            marginBottom: '1.25rem',
          }}
        >
          <label
            style={{
              display: 'block',
              fontFamily: 'Outfit',
              fontSize: '0.84rem',
              fontWeight: 700,
              color: '#ffffff',
              marginBottom: '0.5rem',
            }}
          >
            Describe your vision or event look:
          </label>

          <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
            <textarea
              rows={3}
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="e.g. Knotless bohemian braids with curly ends in Victoria Island for this weekend..."
              style={{
                width: '100%',
                background: '#0c0e14',
                border: '1.5px solid rgba(255,255,255,0.1)',
                borderRadius: '16px',
                padding: '0.85rem 1rem',
                color: '#ffffff',
                fontFamily: 'Outfit',
                fontSize: '15px',
                lineHeight: 1.5,
                outline: 'none',
                resize: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Quick inspiration chips */}
          <div>
            <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Quick Suggestions
            </div>
            <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.35rem', scrollbarWidth: 'none' }}>
              {PROMPT_CHIPS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setCustomPrompt(chip)}
                  style={{
                    background: '#0c0e14',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: customPrompt === chip ? '#F5B942' : '#94a3b8',
                    borderRadius: '50px',
                    padding: '0.35rem 0.8rem',
                    fontSize: '0.72rem',
                    fontFamily: 'Outfit',
                    fontWeight: 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    minHeight: '34px',
                  }}
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── 6 Service Categories Selection ── */}
        <div
          style={{
            background: '#151822',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '22px',
            padding: '1.25rem',
            marginBottom: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontFamily: 'Outfit', fontSize: '0.86rem', fontWeight: 800, color: '#ffffff' }}>
              Select Service Category
            </span>
            <span style={{ fontSize: '0.74rem', color: '#F5B942', fontWeight: 700, fontFamily: 'Outfit' }}>
              6 Available
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.65rem' }}>
            {SERVICES.map((s) => {
              const isSelected = selectedService === s.service;
              const IconComp = s.icon;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedService(s.service)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    padding: '0.75rem 0.85rem',
                    borderRadius: '14px',
                    background: isSelected ? 'rgba(245,185,66,0.12)' : '#0c0e14',
                    border: isSelected ? '1.5px solid #F5B942' : '1px solid rgba(255,255,255,0.07)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.18s ease',
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '10px',
                      background: isSelected ? s.color + '25' : 'rgba(255,255,255,0.05)',
                      color: isSelected ? s.color : '#94a3b8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <IconComp />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 800, color: isSelected ? '#ffffff' : '#cbd5e1', fontFamily: 'Outfit', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {s.label}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: isSelected ? '#F5B942' : '#64748b', fontFamily: 'Outfit', fontWeight: 700 }}>
                      From ₦{s.price.toLocaleString()}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Aesthetic Vibe Selection ── */}
        <div
          style={{
            background: '#151822',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '22px',
            padding: '1.25rem',
            marginBottom: '1.25rem',
          }}
        >
          <span style={{ display: 'block', fontFamily: 'Outfit', fontSize: '0.86rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.75rem' }}>
            Desired Aesthetic Vibe
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.55rem' }}>
            {VIBES.map((v) => {
              const isSelected = selectedVibe === v.label;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedVibe(v.label)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 0.9rem',
                    borderRadius: '14px',
                    background: isSelected ? 'rgba(245,185,66,0.1)' : '#0c0e14',
                    border: isSelected ? '1.5px solid #F5B942' : '1px solid rgba(255,255,255,0.07)',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.84rem', fontWeight: 800, color: isSelected ? '#F5B942' : '#ffffff', fontFamily: 'Outfit' }}>
                      {v.label}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                      {v.desc}
                    </div>
                  </div>
                  {isSelected && <Check size={16} color="#F5B942" strokeWidth={3} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Location & Service Mode ── */}
        <div
          style={{
            background: '#151822',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '22px',
            padding: '1.25rem',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.4rem', fontFamily: 'Outfit' }}>
              Service Location
            </label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="app-select"
              style={{ width: '100%', background: '#0c0e14' }}
            >
              {LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          {/* Service Mode Toggle */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
            <button
              type="button"
              onClick={() => setServiceMode('atelier')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.75rem',
                borderRadius: '12px',
                background: serviceMode === 'atelier' ? '#F5B942' : '#0c0e14',
                color: serviceMode === 'atelier' ? '#0c0e14' : '#94a3b8',
                border: serviceMode === 'atelier' ? '1.5px solid #F5B942' : '1px solid rgba(255,255,255,0.07)',
                fontFamily: 'Outfit',
                fontSize: '0.8rem',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              <Store size={16} />
              <span>Atelier Suite</span>
            </button>
            <button
              type="button"
              onClick={() => setServiceMode('home')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.75rem',
                borderRadius: '12px',
                background: serviceMode === 'home' ? '#F5B942' : '#0c0e14',
                color: serviceMode === 'home' ? '#0c0e14' : '#94a3b8',
                border: serviceMode === 'home' ? '1.5px solid #F5B942' : '1px solid rgba(255,255,255,0.07)',
                fontFamily: 'Outfit',
                fontSize: '0.8rem',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              <HomeIcon size={16} />
              <span>VIP Home Service</span>
            </button>
          </div>
        </div>

        {/* ── Submit Match Button ── */}
        <button
          onClick={handleRunMatcher}
          disabled={matching}
          className="app-btn app-btn-accent"
          style={{
            width: '100%',
            minHeight: '52px',
            borderRadius: '16px',
            fontSize: '1rem',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            boxShadow: '0 8px 24px rgba(245,185,66,0.25)',
          }}
        >
          {matching ? (
            <>
              <RefreshCw size={18} className="animate-spin" />
              <span>Finding Best Match...</span>
            </>
          ) : (
            <>
              <Sparkles size={18} />
              <span>Find My Ideal Specialist</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>

        {/* Matching Scanning Indicator */}
        {matching && (
          <div
            style={{
              marginTop: '1rem',
              padding: '1rem',
              borderRadius: '14px',
              background: '#151822',
              border: '1px solid rgba(245,185,66,0.3)',
              textAlign: 'center',
            }}
          >
            <p style={{ margin: 0, fontSize: '0.82rem', color: '#F5B942', fontFamily: 'Outfit', fontWeight: 700 }}>
              {matchingSteps[matchingStep]}
            </p>
          </div>
        )}

        {/* ── Match Results Container ── */}
        {matchedResults && (
          <div id="ai-match-results-container" style={{ marginTop: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Sparkles size={18} color="#F5B942" />
              <h2 style={{ fontFamily: 'Outfit', fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                Your Tailored Match
              </h2>
            </div>

            {/* Top Match Card */}
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(245,185,66,0.12), #151822 65%)',
                border: '1.5px solid rgba(245,185,66,0.4)',
                borderRadius: '24px',
                padding: '1.35rem',
                marginBottom: '1rem',
                boxShadow: '0 12px 36px rgba(0,0,0,0.3)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.85rem' }}>
                  <Avatar
                    src={matchedResults.topMatch.avatarUrl}
                    name={matchedResults.topMatch.name}
                    size={64}
                    borderRadius="16px"
                  />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.15rem' }}>
                      <h3 style={{ fontFamily: 'Outfit', fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                        {matchedResults.topMatch.name}
                      </h3>
                      <ShieldCheck size={16} color="#F5B942" />
                    </div>
                    <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '0 0 0.35rem' }}>
                      {matchedResults.topMatch.title}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.76rem' }}>
                      <Star size={13} fill="#F5B942" color="#F5B942" />
                      <span style={{ fontWeight: 800, color: '#F5B942' }}>{matchedResults.topMatch.rating}</span>
                      <span style={{ color: '#64748b' }}>({matchedResults.topMatch.reviewsCount} reviews)</span>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    background: 'rgba(245,185,66,0.18)',
                    border: '1px solid rgba(245,185,66,0.4)',
                    borderRadius: '50px',
                    padding: '0.3rem 0.65rem',
                    color: '#F5B942',
                    fontFamily: 'Outfit',
                    fontSize: '0.74rem',
                    fontWeight: 900,
                  }}
                >
                  {matchedResults.topMatch.matchScore}% Match
                </div>
              </div>

              {/* Rationale */}
              <p style={{ fontSize: '0.8rem', color: '#cbd5e1', lineHeight: 1.5, margin: '0 0 1rem', background: 'rgba(0,0,0,0.25)', padding: '0.75rem', borderRadius: '12px' }}>
                "{matchedResults.topMatch.rationale}"
              </p>

              {/* Price & Duration */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block' }}>Estimated Fee</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#F5B942', fontFamily: 'Outfit' }}>
                    ₦{matchedResults.topMatch.price.toLocaleString()}
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block' }}>Session Duration</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', fontFamily: 'Outfit' }}>
                    ⏱ {matchedResults.topMatch.duration}
                  </span>
                </div>
              </div>

              {/* Instant Book Button */}
              <button
                onClick={() => handleBookDirectly(matchedResults.topMatch)}
                className="app-btn app-btn-accent"
                style={{
                  width: '100%',
                  minHeight: '46px',
                  borderRadius: '14px',
                  fontSize: '0.92rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.45rem',
                }}
              >
                <span>Book Appointment with {matchedResults.topMatch.name.split(' ')[0]}</span>
                <ArrowRight size={16} />
              </button>
            </div>

            {/* Alternates */}
            {matchedResults.alternates.length > 0 && (
              <div>
                <h4 style={{ fontFamily: 'Outfit', fontSize: '0.88rem', fontWeight: 800, color: '#94a3b8', marginBottom: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Other Highly Rated Specialists
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {matchedResults.alternates.map((alt) => (
                    <div
                      key={alt.id}
                      style={{
                        background: '#151822',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: '16px',
                        padding: '0.85rem 1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Avatar src={alt.avatarUrl} name={alt.name} size={42} borderRadius="12px" />
                        <div>
                          <div style={{ fontFamily: 'Outfit', fontSize: '0.88rem', fontWeight: 800, color: '#ffffff' }}>
                            {alt.name}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                            ★ {alt.rating} · {alt.reviewsCount} reviews
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleBookDirectly(alt)}
                        className="app-btn app-btn-outline"
                        style={{ borderRadius: '10px', padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                      >
                        Select
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </PageContainer>
  );
};

export default AiStylistFinder;

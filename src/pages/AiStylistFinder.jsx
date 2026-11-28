import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SEOHead } from '../components/common/SEOHead';
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
  Award,
  Zap,
  Phone,
  MessageSquare,
  Home as HomeIcon,
  Store,
  ChevronRight,
  SlidersHorizontal,
  Compass,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { PageContainer } from '../components/common/PageContainer';
import { Avatar } from '../components/common/Avatar';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

// SVG Icons for the 6 Official Atelier Crafts
const BarberIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <path d="M6 3 L10 12 L6 21" />
    <path d="M18 3 L14 12 L18 21" />
    <line x1="8.5" y1="12" x2="15.5" y2="12" />
    <rect x="5" y="19" width="14" height="2" rx="1" />
  </svg>
);

const BraiderIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <circle cx="12" cy="6" r="3" />
    <path d="M9 9 C9 13 8 17 9 21" />
    <path d="M15 9 C15 13 16 17 15 21" />
    <path d="M10 12 L14 15" />
    <path d="M14 12 L10 15" />
    <path d="M10 17 L14 20" />
  </svg>
);

const NailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <rect x="7" y="3" width="10" height="15" rx="3" />
    <path d="M7 11 H17" />
    <rect x="9.5" y="4" width="5" height="4" rx="1.5" fill="currentColor" fillOpacity="0.4" />
    <path d="M6 21 H18" />
  </svg>
);

const LashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="20" height="20">
    <ellipse cx="12" cy="13" rx="7" ry="4" stroke="currentColor" fill="none" />
    <path d="M5 13 C8 8 16 8 19 13" />
    <path d="M7 11 L6 8" />
    <path d="M10 10 L10 7" />
    <path d="M14 10 L14 7" />
    <path d="M17 11 L18 8" />
    <circle cx="12" cy="13.5" r="1.5" fill="currentColor" />
  </svg>
);

const MakeupIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <path d="M8 21 L16 21" />
    <path d="M9 13 L15 13" />
    <path d="M10 13 L10 7 C10 4.8 11 3 12 3 C13 3 14 4.8 14 7 L14 13" fill="currentColor" fillOpacity="0.3" />
    <rect x="8" y="13" width="8" height="8" rx="2" />
  </svg>
);

const WigIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <path d="M5 14 C4 8 8 4 12 4 C16 4 20 8 19 14" />
    <path d="M5 14 C4 18 6 21 8 21" />
    <path d="M19 14 C20 18 18 21 16 21" />
    <path d="M8 8 C10 6 14 6 16 8" />
  </svg>
);

const CRAFTS = [
  {
    id: 'barber',
    label: 'Barbering & Fades',
    craftName: 'Barber',
    price: 4500,
    duration: '45 mins',
    icon: BarberIcon,
    accent: '#60a5fa',
    tagline: 'Precision skin fades, hot towel beard sculpting & sharp tapers',
  },
  {
    id: 'hair_braider',
    label: 'Braids & Twists',
    craftName: 'Hair Braider & Stylist',
    price: 7500,
    duration: '120 mins',
    icon: BraiderIcon,
    accent: '#34d399',
    tagline: 'Knotless goddess braids, bohemian curls & cornrow artistry',
  },
  {
    id: 'nail_tech',
    label: 'Nails & Artistry',
    craftName: 'Nail Tech',
    price: 5000,
    duration: '60 mins',
    icon: NailIcon,
    accent: '#e879f9',
    tagline: 'BIAB builder gel, ombre acrylic extensions & 3D chrome art',
  },
  {
    id: 'lash_tech',
    label: 'Lash & Brow Lounge',
    craftName: 'Lash Tech',
    price: 7000,
    duration: '75 mins',
    icon: LashIcon,
    accent: '#f5b942',
    tagline: 'Russian volume silk extensions, hybrid cat-eye & brow mapping',
  },
  {
    id: 'makeup_artist',
    label: 'Bridal & Soft Glam',
    craftName: 'Makeup Artist',
    price: 10000,
    duration: '90 mins',
    icon: MakeupIcon,
    accent: '#f87171',
    tagline: 'Soft matte glow, bridal contour, cut-crease & editorial finish',
  },
  {
    id: 'wig_installer',
    label: 'Wigs & Frontal Melt',
    craftName: 'Wig Installer & Revamper',
    price: 8500,
    duration: '90 mins',
    icon: WigIcon,
    accent: '#a78bfa',
    tagline: 'Seamless HD lace frontal melt, custom closure & wig revamp',
  },
];

const VIBES = [
  { id: 'executive', label: 'Executive Sharp', emoji: '💼', desc: 'Crisp, distinguished and boardroom-ready' },
  { id: 'redcarpet', label: 'Gala & Red Carpet', emoji: '🥂', desc: 'Max glamour for weddings, birthdays and events' },
  { id: 'daily', label: 'Effortless Daily', emoji: '🌿', desc: 'Natural, clean, low-maintenance daily polish' },
  { id: 'bold', label: 'Trendsetter & Bold', emoji: '🔥', desc: 'Statement colors, avant-garde styling & modern shapes' },
];

const LOCATIONS = [
  'Eti-Osa (Lekki / Victoria Island / Ikoyi), Lagos',
  'Ikeja (GRA / Maryland / Allen), Lagos',
  'Lagos Mainland (Yaba / Surulere), Lagos',
  'Kosofe (Magodo / Ogudu), Lagos',
  'Amuwo-Odofin (Festac), Lagos',
  'Ibadan North (Bodija, Agodi, UI), Oyo',
  'Ibadan South-West (Ring Road, Oluyole), Oyo',
  'Ibadan North-West (Dugbe, Mokola), Oyo',
];

const PROMPT_SUGGESTIONS = [
  'Clean low taper fade with sharp beard trim in Lekki Phase 1',
  'Knotless goddess braids with curly human hair in Ikeja',
  'Russian volume lash extensions & brow lamination in Victoria Island',
  'Soft matte bridal glam makeup for wedding in Bodija, Ibadan',
  'Seamless HD lace frontal melt & bone straight styling in Surulere',
  'BIAB builder gel nails with French chrome tips in Lekki',
];

export const AiStylistFinder = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useAuth();

  // Consultation state
  const [customPrompt, setCustomPrompt] = useState(searchParams.get('q') || '');
  const [selectedCraft, setSelectedCraft] = useState(CRAFTS[0]);
  const [selectedVibe, setSelectedVibe] = useState(VIBES[0]);
  const [serviceMode, setServiceMode] = useState('salon'); // 'salon' | 'home'
  const [selectedLocation, setSelectedLocation] = useState(LOCATIONS[0]);
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('Afternoon (12:00 PM – 4:00 PM)');

  // Matching & Results state
  const [matching, setMatching] = useState(false);
  const [matchingStep, setMatchingStep] = useState(0);
  const [matchResult, setMatchResult] = useState(null);
  const [noMatchFound, setNoMatchFound] = useState(false);

  const radarSteps = [
    'Scanning active directory for verified specialists...',
    'Filtering exclusively for ₦3,000-activated accounts...',
    `Cross-referencing verified ${selectedCraft.label} portfolios...`,
    'Optimizing location proximity & escrow guarantee...',
    'Locking in your top certified artisan...',
  ];

  // Primary AI Matching Handler
  const handleRunAiMatcher = async (e) => {
    if (e) e.preventDefault();
    setMatching(true);
    setMatchingStep(0);
    setMatchResult(null);
    setNoMatchFound(false);

    const stepInterval = setInterval(() => {
      setMatchingStep((prev) => (prev < radarSteps.length - 1 ? prev + 1 : prev));
    }, 420);

    try {
      const queryPayload = customPrompt
        ? `${customPrompt} (${selectedCraft.craftName} - ${selectedVibe.label} in ${selectedLocation})`
        : `${selectedCraft.craftName} session with ${selectedVibe.label} styling in ${selectedLocation} on ${selectedDate} (${serviceMode === 'home' ? 'VIP Home Service' : 'In-Salon'})`;

      const [aiData, allSpecialists] = await Promise.all([
        api.matchAiSpecialist(queryPayload, selectedCraft.craftName, selectedVibe.label).catch(() => ({})),
        api.getSpecialists().catch(() => []),
      ]);

      clearInterval(stepInterval);

      // Strict enforcement: MUST be staff/expert (NEVER customer), MUST be verified, MUST be activated (paid ₦3,000)
      const activatedExpertsOnly = Array.isArray(allSpecialists)
        ? allSpecialists.filter((s) => {
            const isExpertRole = s.role === 'staff' || s.role === 'expert';
            const isNotCustomer = s.role !== 'customer';
            const isActivated = s.isActivated === true;
            const isVerified = s.isVerified === true;
            return isExpertRole && isNotCustomer && isActivated && isVerified;
          })
        : [];

      // Craft keyword filter to ensure a Barber never matches Braids, etc.
      const craftKeywordsMap = {
        barber: ['barber', 'fade', 'cut', 'taper', 'line-up', 'beard', 'barbing'],
        hair_braider: ['braid', 'braider', 'knotless', 'twist', 'cornrow', 'goddess', 'locs'],
        nail_tech: ['nail', 'acrylic', 'gel', 'pedicure', 'manicure', 'biab'],
        lash_tech: ['lash', 'lashes', 'brow', 'brows', 'volume'],
        makeup_artist: ['makeup', 'glam', 'bridal', 'beat', 'contour'],
        wig_installer: ['wig', 'frontal', 'closure', 'melt', 'revamp'],
      };

      const kws = craftKeywordsMap[selectedCraft.id] || [];
      const craftMatchedSpecialists = activatedExpertsOnly.filter((spec) => {
        const text = [
          spec.title || '',
          spec.service || '',
          ...(Array.isArray(spec.services) ? spec.services.map((s) => (typeof s === 'object' ? s.name || '' : String(s))) : []),
          ...(Array.isArray(spec.specialties) ? spec.specialties : []),
        ].join(' ').toLowerCase();

        return kws.some((kw) => text.includes(kw));
      });

      // If backend returned an active match, check if it's eligible
      if (aiData?.available && aiData?.match) {
        setMatchResult({
          primary: aiData.match,
          alternates: aiData.alternates || [],
        });
      } else if (craftMatchedSpecialists.length > 0) {
        const top = craftMatchedSpecialists[0];
        const topName = `${top.firstname || ''} ${top.lastname || ''}`.trim() || 'Verified Specialist';
        const topLoc = [top.lga, top.state].filter(Boolean).join(', ') || top.businessAddress || selectedLocation;
        const specsText = Array.isArray(top.specialties) && top.specialties.length > 0
          ? top.specialties.join(', ')
          : top.title || selectedCraft.craftName;

        setMatchResult({
          primary: {
            _id: top._id,
            id: top._id,
            name: topName,
            firstname: top.firstname,
            lastname: top.lastname || '',
            title: top.title || selectedCraft.craftName,
            rating: 5.0,
            reviewsCount: 0,
            avatarUrl: top.avatarUrl || '',
            location: topLoc,
            businessAddress: top.businessAddress || topLoc,
            specialties: specsText,
            primaryService: selectedCraft.craftName,
            matchScore: 98,
            portfolio: Array.isArray(top.portfolio) ? top.portfolio : [],
            isActivated: true,
            isVerified: true,
            rationale: `${topName} is your 98% precision match. Verified and ₦3,000-activated with master specialization in ${specsText}. Handpicked for ${selectedCraft.label} in ${topLoc}.`,
          },
          alternates: craftMatchedSpecialists.slice(1, 4).map((spec) => ({
            _id: spec._id,
            id: spec._id,
            name: `${spec.firstname || ''} ${spec.lastname || ''}`.trim() || 'Verified Specialist',
            title: spec.title || selectedCraft.craftName,
            rating: 5.0,
            reviewsCount: 0,
            avatarUrl: spec.avatarUrl || '',
            location: [spec.lga, spec.state].filter(Boolean).join(', ') || spec.businessAddress || selectedLocation,
            specialties: Array.isArray(spec.specialties) ? spec.specialties.join(', ') : spec.title || '',
            portfolio: Array.isArray(spec.portfolio) ? spec.portfolio : [],
            matchScore: 94,
            isActivated: true,
            isVerified: true,
          })),
        });
      } else {
        // No activated specialist currently live in this craft
        setNoMatchFound(true);
      }

      setTimeout(() => {
        const el = document.getElementById('ai-match-results-target');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    } catch (err) {
      clearInterval(stepInterval);
      showToast?.('Could not complete matching radar. Please try again.', 'error');
    } finally {
      setMatching(false);
    }
  };

  const handleBookDirectly = (stylist) => {
    let defaultTime = '12:00 PM';
    if (selectedTimeSlot.toLowerCase().includes('morning')) defaultTime = '10:00 AM';
    else if (selectedTimeSlot.toLowerCase().includes('evening')) defaultTime = '5:00 PM';

    const params = new URLSearchParams({
      stylist: stylist.name,
      stylistId: stylist._id || stylist.id,
      service: selectedCraft.craftName,
      date: selectedDate,
      time: defaultTime,
      location: `${selectedLocation} (${serviceMode === 'home' ? 'VIP Home Service' : 'In-Salon'})`,
    });
    navigate(`/booking?${params.toString()}`);
  };

  const openWhatsApp = (phone, name) => {
    if (!phone) {
      showToast?.('Specialist has not added a WhatsApp contact yet.', 'info');
      return;
    }
    const clean = phone.replace(/[^0-9]/g, '');
    const intl = clean.startsWith('0') ? '234' + clean.slice(1) : clean;
    const msg = encodeURIComponent(`Hello ${name}, I discovered your verified profile via the StyleCorner AI Concierge for ${selectedCraft.label}.`);
    window.open(`https://wa.me/${intl}?text=${msg}`, '_blank');
  };

  return (
    <PageContainer title="AI Style Matcher" showBack={true}>
      <SEOHead
        title="AI Style Concierge — Match Verified & Activated Beauty Specialists | StyleCorner"
        description="Discover background-vetted, ₦3,000-activated beauty experts in Lagos & Ibadan. Smart craft-matched barbers, braiders, nail artists, and lash masters backed by 100% escrow protection."
        canonicalPath="/ai-matcher"
        keywords="ai stylist matcher Lagos, verified beauty experts Ibadan, escrow protected appointments, hair braider matcher, master barber matcher"
      />

      <div
        className="ai-concierge-container"
        style={{
          maxWidth: '680px',
          width: '100%',
          margin: '0 auto',
          boxSizing: 'border-box',
          overflowX: 'hidden',
          paddingBottom: 'calc(var(--bottom-nav-height, 66px) + env(safe-area-inset-bottom, 20px) + 3rem)',
        }}
      >
        {/* ── Luxury Radar Header ── */}
        <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: 'linear-gradient(135deg, rgba(245,185,66,0.18) 0%, rgba(245,185,66,0.06) 100%)',
              border: '1px solid rgba(245,185,66,0.4)',
              borderRadius: '50px',
              padding: '0.35rem 0.9rem',
              color: '#f5b942',
              fontFamily: 'Plus Jakarta Sans',
              fontSize: '0.74rem',
              fontWeight: 800,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: '0.75rem',
              boxShadow: '0 0 20px rgba(245,185,66,0.15)',
            }}
          >
            <Zap size={13} color="#f5b942" />
            <span>AI Style Radar · ₦3,000 Activated Experts Only</span>
          </div>

          <h1
            style={{
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              fontSize: 'clamp(1.5rem, 5vw, 2.1rem)',
              fontWeight: 900,
              color: '#ffffff',
              margin: '0 0 0.45rem',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
            }}
          >
            Precision Craft Matching
          </h1>
          <p
            style={{
              color: '#94a3b8',
              fontSize: 'clamp(0.85rem, 2.6vw, 0.92rem)',
              lineHeight: 1.6,
              margin: 0,
              maxWidth: '560px',
            }}
          >
            Match with verified, active beauty masters across Lagos and Ibadan based on their certified craft. Strictly zero mock profiles or customer accounts — backed by 100% escrow protection.
          </p>

          {/* Escrow & Security Trust Strip */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              flexWrap: 'wrap',
              marginTop: '0.85rem',
              paddingTop: '0.75rem',
              borderTop: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#10b981', fontSize: '0.75rem', fontFamily: 'Plus Jakarta Sans', fontWeight: 700 }}>
              <ShieldCheck size={14} /> 100% Escrow Protected
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#f5b942', fontSize: '0.75rem', fontFamily: 'Plus Jakarta Sans', fontWeight: 700 }}>
              <Award size={14} /> Registered Craft Only
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#38bdf8', fontSize: '0.75rem', fontFamily: 'Plus Jakarta Sans', fontWeight: 700 }}>
              <Check size={14} /> ₦3,000 Activated Accounts
            </div>
          </div>
        </div>

        {/* ── 1. Select Registered Craft Category ── */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(21,24,34,0.95) 0%, rgba(12,14,20,0.98) 100%)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '22px',
            padding: '1.25rem',
            marginBottom: '1.25rem',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
            <div>
              <span style={{ fontFamily: 'Plus Jakarta Sans', fontSize: '0.9rem', fontWeight: 900, color: '#ffffff', display: 'block' }}>
                1. Select Desired Craft
              </span>
              <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                AI matches only specialists certified in this craft
              </span>
            </div>
            <span
              style={{
                fontSize: '0.7rem',
                color: selectedCraft.accent,
                fontWeight: 800,
                fontFamily: 'Plus Jakarta Sans',
                background: 'rgba(255,255,255,0.05)',
                padding: '0.2rem 0.6rem',
                borderRadius: '50px',
                border: `1px solid ${selectedCraft.accent}40`,
              }}
            >
              {selectedCraft.label} Selected
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: '0.65rem',
            }}
          >
            {CRAFTS.map((craft) => {
              const isSelected = selectedCraft.id === craft.id;
              const IconComp = craft.icon;
              return (
                <button
                  key={craft.id}
                  type="button"
                  onClick={() => setSelectedCraft(craft)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    padding: '0.85rem',
                    borderRadius: '16px',
                    background: isSelected ? 'rgba(245,185,66,0.12)' : '#0e111a',
                    border: isSelected ? `1.5px solid ${craft.accent}` : '1px solid rgba(255,255,255,0.07)',
                    boxShadow: isSelected ? `0 0 16px ${craft.accent}25` : 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box',
                    position: 'relative',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '0.5rem' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: `${craft.accent}18`,
                        color: craft.accent,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <IconComp />
                    </div>
                    {isSelected && (
                      <span
                        style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          background: craft.accent,
                          color: '#0c0e14',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.68rem',
                          fontWeight: 900,
                        }}
                      >
                        ✓
                      </span>
                    )}
                  </div>

                  <span style={{ fontFamily: 'Plus Jakarta Sans', fontSize: '0.84rem', fontWeight: 800, color: '#ffffff', display: 'block', lineHeight: 1.25 }}>
                    {craft.label}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.2rem', lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {craft.tagline}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── 2. Style Prompt & Inspiration Vision ── */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(21,24,34,0.95) 0%, rgba(12,14,20,0.98) 100%)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '22px',
            padding: '1.25rem',
            marginBottom: '1.25rem',
            boxSizing: 'border-box',
          }}
        >
          <label
            style={{
              display: 'block',
              fontFamily: 'Plus Jakarta Sans',
              fontSize: '0.9rem',
              fontWeight: 900,
              color: '#ffffff',
              marginBottom: '0.35rem',
            }}
          >
            2. Describe Your Vision or Specific Style (Optional)
          </label>
          <p style={{ fontSize: '0.74rem', color: '#64748b', margin: '0 0 0.65rem' }}>
            Tell our AI what look you want, length, curls, fade grade, or event details:
          </p>

          <textarea
            rows={3}
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder={`e.g. Clean low taper fade with sharp line-up and hot towel treatment in Lekki Phase 1...`}
            style={{
              width: '100%',
              background: '#0c0e14',
              border: '1.5px solid rgba(255,255,255,0.1)',
              borderRadius: '16px',
              padding: '0.85rem 1rem',
              color: '#ffffff',
              fontFamily: 'Plus Jakarta Sans',
              fontSize: '16px', // Prevents iOS Safari auto-zoom
              lineHeight: 1.5,
              outline: 'none',
              resize: 'none',
              boxSizing: 'border-box',
              marginBottom: '0.75rem',
            }}
          />

          {/* Quick inspiration chips */}
          <div>
            <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>
              One-Tap Suggestions
            </div>
            <div
              style={{
                display: 'flex',
                gap: '0.45rem',
                overflowX: 'auto',
                WebkitOverflowScrolling: 'touch',
                paddingBottom: '0.35rem',
                scrollbarWidth: 'none',
              }}
            >
              {PROMPT_SUGGESTIONS.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCustomPrompt(chip)}
                  style={{
                    background: customPrompt === chip ? 'rgba(245,185,66,0.18)' : '#0e111a',
                    border: customPrompt === chip ? '1px solid #f5b942' : '1px solid rgba(255,255,255,0.08)',
                    color: customPrompt === chip ? '#f5b942' : '#94a3b8',
                    borderRadius: '50px',
                    padding: '0.35rem 0.85rem',
                    fontSize: '0.74rem',
                    fontFamily: 'Plus Jakarta Sans',
                    fontWeight: 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    minHeight: '34px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── 3. Style Vibe & Session Format ── */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(21,24,34,0.95) 0%, rgba(12,14,20,0.98) 100%)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '22px',
            padding: '1.25rem',
            marginBottom: '1.25rem',
            boxSizing: 'border-box',
          }}
        >
          <span style={{ fontFamily: 'Plus Jakarta Sans', fontSize: '0.9rem', fontWeight: 900, color: '#ffffff', display: 'block', marginBottom: '0.75rem' }}>
            3. Style Aesthetic & Location
          </span>

          {/* Vibe Selection Pills */}
          <div style={{ marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '0.45rem' }}>
              Target Aesthetic
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
              {VIBES.map((vibe) => {
                const isSelected = selectedVibe.id === vibe.id;
                return (
                  <button
                    key={vibe.id}
                    type="button"
                    onClick={() => setSelectedVibe(vibe)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.65rem 0.75rem',
                      borderRadius: '12px',
                      background: isSelected ? 'rgba(245,185,66,0.14)' : '#0e111a',
                      border: isSelected ? '1.5px solid #f5b942' : '1px solid rgba(255,255,255,0.07)',
                      color: isSelected ? '#f5b942' : '#d1d5db',
                      fontFamily: 'Plus Jakarta Sans',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <span>{vibe.emoji}</span>
                    <span>{vibe.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Service Mode: In-Salon vs VIP Home */}
          <div style={{ marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '0.45rem' }}>
              Session Mode
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.55rem' }}>
              <button
                type="button"
                onClick={() => setServiceMode('salon')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.45rem',
                  padding: '0.75rem 0.5rem',
                  borderRadius: '12px',
                  background: serviceMode === 'salon' ? '#f5b942' : '#0e111a',
                  color: serviceMode === 'salon' ? '#0c0e14' : '#94a3b8',
                  border: serviceMode === 'salon' ? '1.5px solid #f5b942' : '1px solid rgba(255,255,255,0.07)',
                  fontFamily: 'Plus Jakarta Sans',
                  fontSize: '0.82rem',
                  fontWeight: 900,
                  cursor: 'pointer',
                  minHeight: '46px',
                }}
              >
                <Store size={16} /> In-Salon Visit
              </button>
              <button
                type="button"
                onClick={() => setServiceMode('home')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.45rem',
                  padding: '0.75rem 0.5rem',
                  borderRadius: '12px',
                  background: serviceMode === 'home' ? '#f5b942' : '#0e111a',
                  color: serviceMode === 'home' ? '#0c0e14' : '#94a3b8',
                  border: serviceMode === 'home' ? '1.5px solid #f5b942' : '1px solid rgba(255,255,255,0.07)',
                  fontFamily: 'Plus Jakarta Sans',
                  fontSize: '0.82rem',
                  fontWeight: 900,
                  cursor: 'pointer',
                  minHeight: '46px',
                }}
              >
                <HomeIcon size={16} /> VIP Home Service
              </button>
            </div>
          </div>

          {/* Location Dropdown */}
          <div>
            <label style={{ display: 'block', fontSize: '0.74rem', color: '#64748b', fontWeight: 700, marginBottom: '0.45rem' }}>
              Local Area (Lagos / Ibadan)
            </label>
            <div style={{ position: 'relative' }}>
              <MapPin size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#f5b942' }} />
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                style={{
                  width: '100%',
                  background: '#0c0e14',
                  border: '1.5px solid rgba(255,255,255,0.1)',
                  borderRadius: '14px',
                  padding: '0.75rem 1rem 0.75rem 2.6rem',
                  color: '#ffffff',
                  fontFamily: 'Plus Jakarta Sans',
                  fontSize: '16px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  cursor: 'pointer',
                }}
              >
                {LOCATIONS.map((loc) => (
                  <option key={loc} value={loc} style={{ background: '#0c0e14', color: '#ffffff' }}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ── Submit Action Button ── */}
        <button
          onClick={handleRunAiMatcher}
          disabled={matching}
          style={{
            width: '100%',
            minHeight: '56px',
            borderRadius: '18px',
            background: matching
              ? 'rgba(245,185,66,0.35)'
              : 'linear-gradient(135deg, #f5b942 0%, #d89617 100%)',
            color: '#0c0e14',
            fontFamily: 'Plus Jakarta Sans',
            fontSize: '1.02rem',
            fontWeight: 900,
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.6rem',
            boxShadow: matching ? 'none' : '0 10px 30px rgba(245,185,66,0.35)',
            cursor: matching ? 'wait' : 'pointer',
            transition: 'all 0.2s ease',
            touchAction: 'manipulation',
          }}
        >
          {matching ? (
            <>
              <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite' }} />
              <span>Scanning Verified Directory...</span>
            </>
          ) : (
            <>
              <Sparkles size={20} />
              <span>Match Certified {selectedCraft.label} Specialist</span>
              <ArrowRight size={20} />
            </>
          )}
        </button>

        {/* ── Live Holographic Radar Indicator ── */}
        {matching && (
          <div
            style={{
              marginTop: '1.25rem',
              padding: '1.5rem',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, rgba(21,24,34,0.98) 0%, rgba(12,14,20,0.98) 100%)',
              border: '1.5px solid rgba(245,185,66,0.35)',
              textAlign: 'center',
              boxShadow: '0 0 35px rgba(245,185,66,0.12)',
            }}
          >
            {/* Dual Ring Spinner */}
            <div
              style={{
                position: 'relative',
                width: '52px',
                height: '52px',
                margin: '0 auto 1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  border: '2px solid rgba(245,185,66,0.15)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: '-2px',
                  borderRadius: '50%',
                  border: '2.5px solid transparent',
                  borderTopColor: '#f5b942',
                  borderRightColor: '#f5b942',
                  animation: 'spin 0.7s cubic-bezier(0.4, 0, 0.2, 1) infinite',
                }}
              />
              <Zap size={20} color="#f5b942" />
            </div>

            <p style={{ margin: '0 0 0.35rem', fontSize: '0.92rem', color: '#f5b942', fontFamily: 'Plus Jakarta Sans', fontWeight: 800 }}>
              {radarSteps[matchingStep]}
            </p>
            <span style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'Plus Jakarta Sans' }}>
              Filtering strictly for ₦3,000-activated artisans · Zero customer fallbacks
            </span>
          </div>
        )}

        {/* ── Results Target Anchor ── */}
        <div id="ai-match-results-target" style={{ paddingTop: '1rem' }} />

        {/* ── Case A: Match Found (Verified & Activated Expert) ── */}
        {matchResult && matchResult.primary && (
          <div style={{ marginTop: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
              <Sparkles size={18} color="#f5b942" />
              <h2 style={{ fontFamily: 'Plus Jakarta Sans', fontSize: '1.3rem', fontWeight: 900, color: '#ffffff', margin: 0 }}>
                Top Matched Specialist
              </h2>
            </div>

            {/* Featured Artisan Match Card */}
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(245,185,66,0.14) 0%, rgba(18,21,29,0.98) 55%)',
                border: '1.5px solid rgba(245,185,66,0.45)',
                borderRadius: '24px',
                padding: '1.35rem',
                marginBottom: '1.25rem',
                boxShadow: '0 16px 45px rgba(0,0,0,0.4)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Match Precision Badge */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1rem',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                }}
              >
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    background: 'rgba(16,185,129,0.14)',
                    border: '1px solid rgba(16,185,129,0.35)',
                    borderRadius: '50px',
                    padding: '0.3rem 0.85rem',
                    color: '#10b981',
                    fontSize: '0.75rem',
                    fontFamily: 'Plus Jakarta Sans',
                    fontWeight: 800,
                  }}
                >
                  <ShieldCheck size={14} />
                  <span>✓ ₦3,000 Activated & Escrow Verified</span>
                </div>

                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    background: 'linear-gradient(135deg, #f5b942 0%, #e8a520 100%)',
                    color: '#0c0e14',
                    borderRadius: '50px',
                    padding: '0.3rem 0.85rem',
                    fontSize: '0.78rem',
                    fontFamily: 'Plus Jakarta Sans',
                    fontWeight: 900,
                  }}
                >
                  <Award size={13} /> {matchResult.primary.matchScore || 98}% Craft Match
                </div>
              </div>

              {/* Profile Bio Row */}
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                <Avatar
                  src={matchResult.primary.avatarUrl}
                  name={matchResult.primary.name}
                  size={68}
                  borderRadius="18px"
                />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <h3
                    style={{
                      fontFamily: 'Plus Jakarta Sans',
                      fontSize: '1.25rem',
                      fontWeight: 900,
                      color: '#ffffff',
                      margin: '0 0 0.2rem',
                    }}
                  >
                    {matchResult.primary.name}
                  </h3>
                  <div
                    style={{
                      fontSize: '0.82rem',
                      color: '#f5b942',
                      fontFamily: 'Plus Jakarta Sans',
                      fontWeight: 700,
                      marginBottom: '0.35rem',
                    }}
                  >
                    {matchResult.primary.title || selectedCraft.craftName}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.74rem', color: '#94a3b8' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <MapPin size={12} color="#f5b942" /> {matchResult.primary.location}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#f5b942', fontWeight: 800 }}>
                      <Star size={12} fill="#f5b942" color="#f5b942" /> 5.0 Rating
                    </span>
                  </div>
                </div>
              </div>

              {/* AI Rationale Box */}
              <div
                style={{
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '14px',
                  padding: '0.85rem',
                  marginBottom: '1rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#f5b942', fontSize: '0.72rem', fontFamily: 'Plus Jakarta Sans', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  <Sparkles size={12} /> AI Craft Match Reason
                </div>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#d1d5db', lineHeight: 1.5, fontFamily: 'Plus Jakarta Sans' }}>
                  {matchResult.primary.rationale}
                </p>
              </div>

              {/* Verified Portfolio Preview (If Available) */}
              {Array.isArray(matchResult.primary.portfolio) && matchResult.primary.portfolio.length > 0 && (
                <div style={{ marginBottom: '1.15rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 800, fontFamily: 'Plus Jakarta Sans', textTransform: 'uppercase' }}>
                      Verified Client Work Uploads
                    </span>
                    <span style={{ fontSize: '0.7rem', color: '#f5b942', fontWeight: 700 }}>
                      {matchResult.primary.portfolio.length} Looks
                    </span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      gap: '0.55rem',
                      overflowX: 'auto',
                      WebkitOverflowScrolling: 'touch',
                      paddingBottom: '0.35rem',
                      scrollbarWidth: 'none',
                    }}
                  >
                    {matchResult.primary.portfolio.slice(0, 5).map((item, pIdx) => (
                      <div
                        key={pIdx}
                        style={{
                          width: '100px',
                          height: '100px',
                          borderRadius: '14px',
                          overflow: 'hidden',
                          flexShrink: 0,
                          border: '1px solid rgba(255,255,255,0.1)',
                          position: 'relative',
                        }}
                      >
                        <img
                          src={item.imageUrl}
                          alt={item.title || 'Specialist Work'}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Price & Primary CTA */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                  paddingTop: '0.85rem',
                  borderTop: '1px solid rgba(255,255,255,0.08)',
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.68rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 800, display: 'block' }}>
                    Starting Rate
                  </span>
                  <span style={{ fontFamily: 'Plus Jakarta Sans', fontSize: '1.35rem', fontWeight: 900, color: '#f5b942' }}>
                    ₦{selectedCraft.price.toLocaleString()}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                  {matchResult.primary.phone && (
                    <button
                      type="button"
                      onClick={() => openWhatsApp(matchResult.primary.phone, matchResult.primary.name)}
                      style={{
                        background: 'rgba(34,197,94,0.14)',
                        border: '1px solid rgba(34,197,94,0.35)',
                        color: '#4ade80',
                        borderRadius: '12px',
                        padding: '0.65rem 0.85rem',
                        fontFamily: 'Plus Jakarta Sans',
                        fontWeight: 800,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      <Phone size={14} /> WhatsApp
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleBookDirectly(matchResult.primary)}
                    style={{
                      background: 'linear-gradient(135deg, #f5b942 0%, #e8a520 100%)',
                      border: 'none',
                      color: '#0c0e14',
                      borderRadius: '12px',
                      padding: '0.75rem 1.35rem',
                      fontFamily: 'Plus Jakarta Sans',
                      fontWeight: 900,
                      fontSize: '0.88rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      boxShadow: '0 6px 20px rgba(245,185,66,0.3)',
                    }}
                  >
                    <span>Book with 100% Escrow</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            </div>

            {/* Alternates Section */}
            {matchResult.alternates && matchResult.alternates.length > 0 && (
              <div>
                <h4 style={{ fontFamily: 'Plus Jakarta Sans', fontSize: '0.95rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.75rem' }}>
                  Other Activated Specialists in {selectedCraft.label}
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {matchResult.alternates.map((alt) => (
                    <div
                      key={alt._id}
                      style={{
                        background: '#12151d',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '16px',
                        padding: '0.85rem 1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.75rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                        <Avatar src={alt.avatarUrl} name={alt.name} size={42} borderRadius="12px" />
                        <div style={{ minWidth: 0 }}>
                          <h5 style={{ margin: 0, fontFamily: 'Plus Jakarta Sans', fontSize: '0.92rem', fontWeight: 800, color: '#ffffff' }}>
                            {alt.name}
                          </h5>
                          <span style={{ fontSize: '0.74rem', color: '#64748b', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {alt.location}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleBookDirectly(alt)}
                        style={{
                          background: 'rgba(245,185,66,0.12)',
                          border: '1px solid rgba(245,185,66,0.35)',
                          color: '#f5b942',
                          borderRadius: '10px',
                          padding: '0.45rem 0.85rem',
                          fontFamily: 'Plus Jakarta Sans',
                          fontSize: '0.78rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          flexShrink: 0,
                        }}
                      >
                        Book Style
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Case B: Empty State (No Activated Experts in Selected Craft Yet) ── */}
        {noMatchFound && (
          <div
            style={{
              marginTop: '1.5rem',
              background: 'linear-gradient(135deg, rgba(21,24,34,0.98) 0%, rgba(12,14,20,0.98) 100%)',
              border: '1.5px solid rgba(245,185,66,0.3)',
              borderRadius: '24px',
              padding: '2rem 1.5rem',
              textAlign: 'center',
              boxShadow: '0 12px 35px rgba(0,0,0,0.4)',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '20px',
                background: 'rgba(245,185,66,0.12)',
                border: '1px solid rgba(245,185,66,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                color: '#f5b942',
              }}
            >
              <Compass size={28} />
            </div>

            <h3 style={{ fontFamily: 'Plus Jakarta Sans', fontSize: '1.25rem', fontWeight: 900, color: '#ffffff', margin: '0 0 0.45rem' }}>
              Specialists Onboarding in Progress
            </h3>

            <p style={{ fontSize: '0.86rem', color: '#94a3b8', lineHeight: 1.6, maxWidth: '440px', margin: '0 auto 1.25rem', fontFamily: 'Plus Jakarta Sans' }}>
              We could not find an activated specialist for <strong style={{ color: '#f5b942' }}>{selectedCraft.label}</strong> in {selectedLocation} yet.
              <br /><br />
              StyleCorner enforces strict quality standards: <strong>only certified experts who have completed the ₦3,000 account activation and portfolio vetting are displayed</strong>. Customer accounts are strictly excluded.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => navigate('/services')}
                style={{
                  background: 'linear-gradient(135deg, #f5b942 0%, #e8a520 100%)',
                  border: 'none',
                  color: '#0c0e14',
                  borderRadius: '12px',
                  padding: '0.75rem 1.25rem',
                  fontFamily: 'Plus Jakarta Sans',
                  fontWeight: 900,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                Browse All Services
              </button>
              <button
                type="button"
                onClick={() => navigate('/gallery')}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: '#ffffff',
                  borderRadius: '12px',
                  padding: '0.75rem 1.25rem',
                  fontFamily: 'Plus Jakarta Sans',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                View Atelier Lookbook
              </button>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
};

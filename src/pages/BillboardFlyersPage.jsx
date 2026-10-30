import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Copy, Loader, Maximize, Minimize, X, FileDown, Image as ImageIcon } from 'lucide-react';
import { QrWorldSvg, QrRecruitSvg } from '../components/common/QrCodeSvgs';
import PhoneShowcaseFlyerCard from '../components/common/PhoneShowcaseFlyerCard';
import { downloadElementAsPdf, downloadMultipleElementsAsPdf, downloadElementAsImage } from '../utils/flyerPdfExport';

/* ─────────────────────────────────────────────────────────────────────────────
   NEW 3-PHONE SHOWCASE FLYERS (Based on Hand-Held Phone Reference)
   - Flyer 1: Customer (Girl 1)
   - Flyer 2: Expert Recruit (Boy)
   - Flyer 3: Customer VIP Glam (Girl 2)
───────────────────────────────────────────────────────────────────────────── */
export const PHONE_SHOWCASE_FLYERS = [
  {
    id: 'showcase-customer-girl',
    tabLabel: '👱‍♀️ Customer 1 (Girl)',
    badgeTop: 'STYLECORNER NIGERIA',
    badgeSub: 'LAGOS & IBADAN',
    headlineWhite: 'Get Every Beauty Service You Need',
    headlineGold: 'From One Place.',
    description: "StyleCorner connects you with verified top-rated braiders, lash techs, nail artists & precision barbers near you in Lagos & Ibadan.",
    characterType: 'girl-1',
    floatingPillsLeft: ['+ Knotless Braids', '+ Precision Fade', '+ Gel Nail Art', '+ 100% Escrow'],
    floatingPillsRight: ['+ Wispy Lash Ext.', '+ Soft Glam Makeup', '+ Frontal Lace Melt', '+ In-Salon / VIP Home'],
    calloutText: 'Join Us Now!! ✨',
    trustPoints: [
      { icon: '🛡️', text: '100% Escrow Protected' },
      { icon: '⭐', text: '4.9 ★ Community Rated' },
      { icon: '📍', text: 'Lagos & Ibadan' },
    ],
    cardTitle: '⚡ INSTANT MOBILE BOOKING',
    cardScanText: 'SCAN WITH CAMERA',
    cardSubText: 'Point phone camera to join ·',
    cardUrl: 'www.stylecorner.world',
    fullUrl: 'https://www.stylecorner.world',
    qrType: 'world',
    accentGold: '#F5B942',
  },
  {
    id: 'showcase-expert-boy',
    tabLabel: '✂️ Expert Recruit (Boy)',
    badgeTop: 'STYLECORNER PRO',
    badgeSub: 'EXPERT ONBOARDING',
    headlineWhite: 'Get Verified Paying Clients',
    headlineGold: 'Direct To Your Phone.',
    description: "Join Nigeria's fastest growing beauty network. Direct verified paying clients, instant wallet payouts to your bank & zero registration fees.",
    characterType: 'boy-1',
    floatingPillsLeft: ['+ ₦15k–₦60k+ Daily', '+ 0% Registration Fee', '+ Instant Bank Payouts', '+ Free Pro Profile'],
    floatingPillsRight: ['+ AI Client Matching', '+ QR Business Card', '+ Salon Seat Host', '+ Escrow Guaranteed Pay'],
    calloutText: 'Start Earning Today!! 💰',
    trustPoints: [
      { icon: '💰', text: '₦15k–₦60k+ Daily Earnings' },
      { icon: '🛡️', text: 'Escrow Protected Payouts' },
      { icon: '📍', text: 'Lagos & Ibadan LGAs' },
    ],
    cardTitle: '✂️ EXPERT REGISTRATION',
    cardScanText: 'SCAN TO JOIN AS EXPERT',
    cardSubText: 'Scan to apply — zero fees ·',
    cardUrl: 'stylecorner.world/role-selection',
    fullUrl: 'https://www.stylecorner.world/role-selection',
    qrType: 'recruit',
    accentGold: '#F5B942',
  },
  {
    id: 'showcase-vip-girl',
    tabLabel: '✨ VIP Glam (Girl)',
    badgeTop: 'STYLECORNER VIP',
    badgeSub: 'AT-HOME LUXURY GLAM',
    headlineWhite: 'Skip Lagos Traffic. Bring The Salon',
    headlineGold: 'To Your Living Room.',
    description: "Book verified 5-star beauty experts for VIP mobile home visits or luxury salon appointments in AC comfort across Lagos & Ibadan.",
    characterType: 'girl-2',
    floatingPillsLeft: ['+ 100% AC Comfort', '+ Zero Lagos Traffic', '+ Vetted Beauty Techs', '+ 100% Escrow Vault'],
    floatingPillsRight: ['+ Frontals & Braids', '+ Luxury Nail Care', '+ VIP Home Fades', '+ 30-Second Booking'],
    calloutText: 'Experience VIP Glam!! 🏡',
    trustPoints: [
      { icon: '🏡', text: 'In-Home VIP Convenience' },
      { icon: '⭐', text: '4.9 ★ Verified Reviews' },
      { icon: '📍', text: 'Lekki · Ikeja · Ikoyi · Bodija' },
    ],
    cardTitle: '✨ VIP AT-HOME BOOKING',
    cardScanText: 'SCAN FOR VIP HOME VISIT',
    cardSubText: 'Scan to schedule home visit ·',
    cardUrl: 'www.stylecorner.world',
    fullUrl: 'https://www.stylecorner.world',
    qrType: 'world',
    accentGold: '#F5B942',
  },
];

/* ─────────────────────────────────────────────────────────────────────────────
   ROLE CONFIGURATIONS — Premium Black + Gold Cinematic Flyer (Reference Layout)
───────────────────────────────────────────────────────────────────────────── */
const FLYER_ROLES = [
  {
    id: 'billboard',
    tabLabel: '📋 Customer Booking',
    badgeTop: 'STYLECORNER NIGERIA',
    badgeSub: 'LAGOS & IBADAN',
    headlineWhite: 'Book Verified Stylists, Barbers & Braiders.',
    headlineGold: 'In Seconds.',
    description: "Lagos & Ibadan's premier beauty network. AI matches you with top-rated barbers, braiders, lash techs & nail artists near you. In-salon or VIP home visits.",
    tags: ['+ Hair Braiders', '+ Precision Barbers', '+ Lash Techs', '+ Nail Art', '+ Soft Glam Makeup', '+ Wig Frontal Install'],
    trustPoints: [
      { icon: '🛡️', text: '100% Escrow Protected' },
      { icon: '⭐', text: '4.9 ★ Community Rated' },
      { icon: '📍', text: 'Lagos & Ibadan' },
    ],
    cardTitle: '⚡ INSTANT MOBILE BOOKING',
    cardScanText: 'SCAN WITH CAMERA',
    cardSubText: 'Point phone camera to join ·',
    cardUrl: 'www.stylecorner.world',
    fullUrl: 'https://www.stylecorner.world',
    qrType: 'world',
    accentGold: '#F5B942',
  },
  {
    id: 'recruit',
    tabLabel: '✂️ Expert Recruit',
    badgeTop: 'STYLECORNER PRO',
    badgeSub: 'EXPERT ONBOARDING',
    headlineWhite: 'Are You a Barber, Braider or Lash Tech?',
    headlineGold: 'Get Booked. Get Paid.',
    description: "Join Nigeria's fastest growing verified beauty platform. Direct verified paying clients, instant wallet payouts to your bank & zero registration fees.",
    tags: ['+ Instant Wallet Payouts', '+ Free Pro Profile', '+ AI Client Matching', '+ QR Business Card', '+ VIP Home Bookings', '+ Salon Seat Host'],
    trustPoints: [
      { icon: '💰', text: '₦15k–₦60k+ Daily Earnings' },
      { icon: '🛡️', text: 'Escrow Protected Payouts' },
      { icon: '📍', text: 'Lagos & Ibadan LGAs' },
    ],
    cardTitle: '✂️ EXPERT REGISTRATION',
    cardScanText: 'SCAN TO JOIN AS EXPERT',
    cardSubText: 'Scan to apply — zero fees ·',
    cardUrl: 'stylecorner.world/role-selection',
    fullUrl: 'https://www.stylecorner.world/role-selection',
    qrType: 'recruit',
    accentGold: '#F5B942',
  },
  {
    id: 'store',
    tabLabel: '🛍️ Atelier Store',
    badgeTop: 'STYLECORNER ATELIER',
    badgeSub: 'STORE & CARE',
    headlineWhite: 'Curated Hair Care & Grooming Essentials.',
    headlineGold: 'Delivered Fast.',
    description: 'Shop authentic edge control, scalp treatment oils, professional clippers, lash serums & lace glue. Fast dispatch directly to Lagos & Ibadan.',
    tags: ['+ Edge Control Gel', '+ Scalp Growth Oil', '+ Fade Clipper Kit', '+ Lash Care Serum', '+ Frontal Lace Glue', '+ Sulfate-Free Shampoo'],
    trustPoints: [
      { icon: '🚚', text: 'Express Nationwide Delivery' },
      { icon: '✨', text: '100% Authentic Guaranteed' },
      { icon: '💳', text: 'Secure Paystack Escrow' },
    ],
    cardTitle: '🛍️ ATELIER STORE',
    cardScanText: 'SCAN TO SHOP PRODUCTS',
    cardSubText: 'Scan to browse & order ·',
    cardUrl: 'www.stylecorner.world/store',
    fullUrl: 'https://www.stylecorner.world/store',
    qrType: 'world',
    accentGold: '#F5B942',
  },
  {
    id: 'ai_matcher',
    tabLabel: '🤖 AI Matcher',
    badgeTop: 'STYLECORNER AI',
    badgeSub: 'SMART MATCHER',
    headlineWhite: 'Find Your Perfect Stylist In Your Neighborhood.',
    headlineGold: 'In 10 Seconds.',
    description: 'Tell our AI your desired hairstyle, budget & neighborhood. Instant match with vetted top-rated beauty specialists. Zero guesswork.',
    tags: ['+ 10-Second Match', '+ Budget Filter', '+ Neighborhood Match', '+ Verified Portfolio', '+ In-Salon / Home Visit', '+ Escrow Protection'],
    trustPoints: [
      { icon: '🤖', text: 'Smart AI Concierge' },
      { icon: '⭐', text: '4.9 ★ Verified Reviews' },
      { icon: '🛡️', text: 'Escrow Protected' },
    ],
    cardTitle: '🤖 AI STYLIST MATCHER',
    cardScanText: 'SCAN TO MATCH NOW',
    cardSubText: 'Scan for instant AI match ·',
    cardUrl: 'www.stylecorner.world/ai-matcher',
    fullUrl: 'https://www.stylecorner.world/ai-matcher',
    qrType: 'world',
    accentGold: '#F5B942',
  },
];

export const BillboardFlyersPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const getInitialStyle = () => {
    const params = new URLSearchParams(location.search);
    const qStyle = params.get('style');
    if (qStyle === 'showcase') return 'showcase'; // from admin dashboard phone flyers button
    return 'classic'; // default: show classic billboard flyers
  };

  const getInitialDesign = () => {
    const params = new URLSearchParams(location.search);
    const qDesign = params.get('design');
    if (qDesign) return qDesign.toLowerCase();
    const hash = (location.hash || '').replace('#', '').toLowerCase();
    if (hash === 'portrait' || hash === 'flyer' || hash === 'street') return 'billboard';
    if (hash === 'recruitment' || hash === 'stylist') return 'recruit';
    if (hash === 'highway' || hash === 'banner') return 'billboard';
    if (hash === 'store') return 'store';
    if (hash === 'ai' || hash === 'ai-matcher') return 'ai_matcher';
    if (['billboard', 'recruit', 'store', 'ai_matcher'].includes(hash)) return hash;
    return 'all';
  };

  const [flyerStyle, setFlyerStyle] = useState(getInitialStyle); // 'showcase' (phone flyers) or 'classic'
  const [activeDesign, setActiveDesign] = useState('all');
  const [copiedType, setCopiedType] = useState(null);
  const [screenshotMode, setScreenshotMode] = useState(false);
  const [savingPdf, setSavingPdf] = useState(false);
  const [isCssFullscreen, setIsCssFullscreen] = useState(false);

  // Dynamic ref map for all flyer cards across both styles
  const flyerRefs = useRef({});
  [...PHONE_SHOWCASE_FLYERS, ...FLYER_ROLES].forEach(r => {
    if (!flyerRefs.current[r.id]) {
      flyerRefs.current[r.id] = React.createRef();
    }
  });

  /* ── CSS Fullscreen ── */
  const toggleFullscreen = () => {
    if (!isCssFullscreen && !document.fullscreenElement) {
      const el = document.documentElement;
      const req = el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen;
      if (req) {
        try {
          Promise.resolve(req.call(el)).catch(() => setIsCssFullscreen(true));
          return;
        } catch (_) { /* fall through */ }
      }
      setIsCssFullscreen(true);
    } else if (isCssFullscreen) {
      setIsCssFullscreen(false);
    } else {
      const exit = document.exitFullscreen || document.webkitExitFullscreen;
      if (exit) exit.call(document).catch(() => {});
    }
  };

  useEffect(() => {
    const onFsChange = () => {
      if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        setIsCssFullscreen(false);
      }
    };
    document.addEventListener('fullscreenchange', onFsChange);
    document.addEventListener('webkitfullscreenchange', onFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFsChange);
      document.removeEventListener('webkitfullscreenchange', onFsChange);
    };
  }, []);

  useEffect(() => {
    const current = getInitialDesign();
    setActiveDesign(current);
    const newStyle = getInitialStyle();
    setFlyerStyle(newStyle);
    const params = new URLSearchParams(location.search);
    if (params.get('download') === 'true') {
      setTimeout(() => saveToPdf(current), 1500);
    }
  }, [location.search, location.hash]);

  /* ─────────────────────────────────────────────────────────────────
     saveToPdf — Direct real PDF download without print dialog
  ───────────────────────────────────────────────────────────────── */
  const saveToPdf = async (designType) => {
    const target = designType || activeDesign;
    setSavingPdf(true);

    try {
      if (target === 'all') {
        const activeList = flyerStyle === 'showcase' ? PHONE_SHOWCASE_FLYERS : FLYER_ROLES;
        const elementsWithConfig = activeList.map(role => ({
          el: flyerRefs.current[role.id]?.current,
          isLandscape: false,
        })).filter(item => Boolean(item.el));

        if (elementsWithConfig.length === 0) {
          throw new Error('Flyer elements not found in DOM');
        }

        const packName = flyerStyle === 'showcase'
          ? 'StyleCorner_PhoneShowcase_Flyers_Pack.pdf'
          : 'StyleCorner_Marketing_Flyers_Pack.pdf';
        await downloadMultipleElementsAsPdf(elementsWithConfig, packName);
      } else {
        const el = flyerRefs.current[target]?.current || document.querySelector(`.print-card[data-design="${target}"]`);
        if (!el) throw new Error(`Flyer ${target} not found`);

        const filename = `StyleCorner_${target.toUpperCase()}_Flyer.pdf`;
        await downloadElementAsPdf(el, filename, false);
      }
    } catch (err) {
      console.error('PDF export error:', err);
      alert('⚠️ PDF direct export failed. You can tap "Save PNG" instead, or try in Chrome/Edge.');
    } finally {
      setSavingPdf(false);
    }
  };

  const saveToImage = async (designType) => {
    const target = designType || activeDesign;
    try {
      const el = flyerRefs.current[target]?.current || document.querySelector(`.print-card[data-design="${target}"]`);
      if (!el) return;
      await downloadElementAsImage(el, `StyleCorner_${target.toUpperCase()}_Flyer.png`);
    } catch (err) {
      console.error('Image export failed:', err);
    }
  };

  const copyUrl = (type, url) => {
    navigator.clipboard.writeText(url);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const isNativeFullscreen = Boolean(
    typeof document !== 'undefined' &&
    (document.fullscreenElement || document.webkitFullscreenElement)
  );
  const isFullscreen = isCssFullscreen || isNativeFullscreen;

  const currentRolesList = FLYER_ROLES; // always show classic billboard flyers
  const visibleRoles = activeDesign === 'all'
    ? currentRolesList
    : currentRolesList.filter(r => r.id === activeDesign);

  return (
    <div
      className="flyers-page-root"
      style={{
        backgroundColor: '#050608',
        color: '#FFFFFF',
        minHeight: '100vh',
        fontFamily: "'Outfit', -apple-system, sans-serif",
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: screenshotMode ? '0' : '1rem 0.75rem 3rem',
        boxSizing: 'border-box',
        ...(isCssFullscreen ? {
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '0.75rem 0.5rem 3rem',
          WebkitOverflowScrolling: 'touch',
        } : {}),
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&display=swap');
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          @page { margin: 0; size: auto; }
          body, html {
            background-color: #050608 !important;
            background: #050608 !important;
            color: #FFFFFF !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
          }
          .no-print, .print-hide, .flyer-toolbar, button { display: none !important; }
          .flyers-page-root {
            padding: 0 !important; margin: 0 !important;
            min-height: unset !important; background: #050608 !important;
            display: block !important;
          }
          .billboard-container {
            display: block !important; max-width: 100% !important;
            width: 100% !important; gap: 0 !important;
            padding: 0 !important; margin: 0 !important;
          }
          .print-card {
            page-break-before: auto; page-break-after: always; break-after: page;
            border-radius: 0 !important; box-shadow: none !important;
            margin: 0 !important; max-width: 100% !important; width: 100% !important;
          }
          .print-card:last-child { page-break-after: avoid !important; break-after: avoid !important; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Mobile toolbar scroll */
        .flyer-toolbar { scrollbar-width: none; }
        .flyer-toolbar::-webkit-scrollbar { display: none; }

        /* Responsive flyer grid */
        @media (max-width: 680px) {
          .flyer-content-grid {
            flex-direction: column !important;
            gap: 1.75rem !important;
          }
          .flyer-qr-card {
            width: 100% !important;
            max-width: 280px !important;
            align-self: center !important;
            margin-top: 0.5rem !important;
          }
          .flyer-gold-blob {
            width: 95% !important;
            height: 60% !important;
            top: -5% !important;
            right: -25% !important;
          }
        }
      `}</style>

      {/* Floating Toolbar */}
      {!screenshotMode && (
        <div
          className="flyer-toolbar no-print"
          style={{
            position: 'sticky',
            top: '0.75rem',
            zIndex: 100,
            backgroundColor: 'rgba(15, 17, 24, 0.97)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(245, 185, 66, 0.4)',
            borderRadius: '50px',
            padding: '0.4rem 0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            marginBottom: '1.5rem',
            boxShadow: '0 10px 30px rgba(0,0,0,0.8), 0 0 20px rgba(245,185,66,0.15)',
            width: 'calc(100% - 1.5rem)',
            maxWidth: '960px',
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{
              background: 'none', border: 'none', color: '#94a3b8',
              cursor: 'pointer', display: 'flex', alignItems: 'center',
              padding: '0.35rem', borderRadius: '50%', flexShrink: 0,
            }}
            title="Go Back"
          >
            <ArrowLeft size={16} />
          </button>



          {/* All tab */}
          <button
            type="button"
            onClick={() => setActiveDesign('all')}
            style={{
              backgroundColor: activeDesign === 'all' ? '#F5B942' : 'transparent',
              color: activeDesign === 'all' ? '#08090C' : '#cbd5e1',
              border: activeDesign === 'all' ? '1px solid #F5B942' : '1px solid transparent',
              borderRadius: '50px',
              padding: '0.35rem 0.7rem',
              fontSize: '0.72rem',
              fontWeight: 800,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
              flexShrink: 0,
            }}
          >
            All {currentRolesList.length}
          </button>

          {/* Role tabs */}
          {currentRolesList.map((role) => (
            <button
              key={role.id}
              type="button"
              onClick={() => setActiveDesign(role.id)}
              style={{
                backgroundColor: activeDesign === role.id ? '#F5B942' : 'transparent',
                color: activeDesign === role.id ? '#08090C' : '#cbd5e1',
                border: activeDesign === role.id ? '1px solid #F5B942' : '1px solid transparent',
                borderRadius: '50px',
                padding: '0.35rem 0.7rem',
                fontSize: '0.72rem',
                fontWeight: 800,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
                flexShrink: 0,
              }}
            >
              {role.tabLabel}
            </button>
          ))}

          {/* Save as PDF */}
          <button
            type="button"
            onClick={() => saveToPdf(activeDesign)}
            disabled={savingPdf}
            style={{
              backgroundColor: savingPdf ? 'rgba(245,185,66,0.08)' : 'rgba(245,185,66,0.18)',
              color: '#F5B942',
              border: '1px solid #F5B942',
              borderRadius: '50px',
              padding: '0.35rem 0.85rem',
              fontSize: '0.72rem',
              fontWeight: 800,
              cursor: savingPdf ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              whiteSpace: 'nowrap',
              opacity: savingPdf ? 0.7 : 1,
              flexShrink: 0,
            }}
          >
            {savingPdf
              ? <><Loader size={13} style={{ animation: 'spin 1s linear infinite' }} /> Saving PDF…</>
              : <><FileDown size={13} /> Save as PDF</>
            }
          </button>

          {/* Download Image (PNG) */}
          <button
            type="button"
            onClick={() => saveToImage(activeDesign === 'all' ? 'billboard' : activeDesign)}
            disabled={savingPdf}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              color: '#cbd5e1',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '50px',
              padding: '0.35rem 0.8rem',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            <ImageIcon size={13} /> Save Image (PNG)
          </button>

          {/* Fullscreen */}
          <button
            type="button"
            onClick={toggleFullscreen}
            style={{
              backgroundColor: isFullscreen ? 'rgba(245,185,66,0.2)' : 'rgba(255,255,255,0.08)',
              color: isFullscreen ? '#F5B942' : '#ffffff',
              border: isFullscreen ? '1px solid #F5B942' : '1px solid rgba(255,255,255,0.15)',
              borderRadius: '50px',
              padding: '0.35rem 0.8rem',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              flexShrink: 0,
            }}
          >
            {isFullscreen
              ? <><Minimize size={13} /> Exit</>
              : <><Maximize size={13} /> Fullscreen</>
            }
          </button>

          <button
            type="button"
            onClick={() => setScreenshotMode(true)}
            style={{
              backgroundColor: 'rgba(255,255,255,0.06)',
              color: '#94a3b8',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '50px',
              padding: '0.35rem 0.75rem',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            📷 Clean View
          </button>
        </div>
      )}

      {screenshotMode && (
        <div
          onClick={() => setScreenshotMode(false)}
          className="no-print"
          style={{
            position: 'fixed', bottom: '1rem', left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(0,0,0,0.85)',
            border: '1px solid #F5B942', color: '#F5B942',
            padding: '0.5rem 1.25rem', borderRadius: '50px',
            fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer', zIndex: 9999,
          }}
        >
          📷 Tap anywhere to restore controls
        </div>
      )}

      {/* CSS Fullscreen Exit Button */}
      {isCssFullscreen && (
        <button
          type="button"
          onClick={() => setIsCssFullscreen(false)}
          className="no-print"
          style={{
            position: 'fixed', top: '0.75rem', right: '0.75rem', zIndex: 10001,
            background: 'rgba(245,185,66,0.9)', color: '#08090C',
            border: 'none', borderRadius: '50%',
            width: '40px', height: '40px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: '0 4px 14px rgba(0,0,0,0.5)',
          }}
        >
          <X size={18} strokeWidth={2.5} />
        </button>
      )}

      {/* Main Container */}
      <div
        className="billboard-container"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '3rem',
          alignItems: 'center',
          width: '100%',
          maxWidth: '700px',
        }}
      >
        {visibleRoles.map((role) => (
          <div key={role.id} style={{ width: '100%' }}>
            {/* Header label above each flyer */}
            <div className="no-print" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: '0.65rem', paddingInline: '0.35rem',
            }}>
              <span style={{ fontSize: '0.76rem', color: '#94a3b8', fontWeight: 700 }}>
                {role.tabLabel} · StyleCorner Official Flyer
              </span>
              <span style={{ fontSize: '0.7rem', color: '#F5B942', fontWeight: 800 }}>
                {role.cardUrl}
              </span>
            </div>

            {/* Classic Billboard Flyer Card */}
            <div
                ref={flyerRefs.current[role.id]}
                className="print-card"
                data-design={role.id}
              style={{
                width: '100%',
                backgroundColor: '#09090b',
                borderRadius: '28px',
                padding: '0',
                boxShadow: '0 32px 96px rgba(0,0,0,0.97), 0 0 60px rgba(245,185,66,0.10)',
                display: 'flex',
                flexDirection: 'column',
                boxSizing: 'border-box',
                position: 'relative',
                overflow: 'hidden',
                border: '1.5px solid rgba(245,185,66,0.28)',
                minHeight: '480px',
              }}
            >
              {/* TOP gold accent line */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3.5px', background: 'linear-gradient(90deg, #F5B942, #c8930a, #F5B942)', zIndex: 10 }} />
              {/* BOTTOM gold accent line */}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3.5px', background: 'linear-gradient(90deg, #F5B942, #c8930a, #F5B942)', zIndex: 10 }} />

              {/* ─── GIANT GOLD ORGANIC BLOB (top-right, rounded, just like reference) ─── */}
              <div
                className="flyer-gold-blob"
                style={{
                  position: 'absolute',
                  top: '-18%',
                  right: '-18%',
                  width: '72%',
                  height: '95%',
                  borderRadius: '50%',
                  background: 'radial-gradient(ellipse at 40% 40%, #FFCF5C 0%, #F5B942 45%, #C8930A 100%)',
                  zIndex: 0,
                  pointerEvents: 'none',
                  opacity: 0.97,
                }}
              />

              {/* Subtle dark vignette on left side over the blob */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(100deg, rgba(9,9,11,0.96) 38%, rgba(9,9,11,0.0) 68%)',
                zIndex: 1, pointerEvents: 'none',
              }} />

              {/* ─── FLYER BODY CONTENT ─── */}
              <div style={{
                position: 'relative',
                zIndex: 2,
                padding: 'clamp(1.5rem, 5vw, 2.5rem)',
                boxSizing: 'border-box',
              }}>

                {/* ─── TOP-LEFT PILL BADGE WITH STYLECORNER SQUARE LOGO ─── */}
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  backgroundColor: 'rgba(18,18,20,0.95)',
                  border: '1.5px solid rgba(245,185,66,0.55)',
                  borderRadius: '100px',
                  padding: '0.38rem 1.1rem 0.38rem 0.45rem',
                  marginBottom: '2rem',
                  boxShadow: '0 4px 18px rgba(0,0,0,0.55), 0 0 12px rgba(245,185,66,0.08)',
                }}>
                  {/* StyleCorner Square Emblem */}
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #F5B942 0%, #C8930A 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0 2px 8px rgba(245,185,66,0.3)',
                  }}>
                    <div style={{
                      width: '13px',
                      height: '13px',
                      borderRadius: '3px',
                      border: '2.5px solid #09090b',
                    }} />
                  </div>
                  {/* Badge Text: Two lines */}
                  <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
                    <span style={{
                      fontSize: '0.68rem',
                      fontWeight: 900,
                      color: '#F5B942',
                      letterSpacing: '0.07em',
                      textTransform: 'uppercase',
                    }}>
                      {role.badgeTop}
                    </span>
                    <span style={{
                      fontSize: '0.61rem',
                      fontWeight: 800,
                      color: '#c8930a',
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                    }}>
                      {role.badgeSub}
                    </span>
                  </div>
                </div>

                {/* ─── MAIN CONTENT GRID: Left Info & Right QR Card ─── */}
                <div
                  className="flyer-content-grid"
                  style={{
                    display: 'flex',
                    gap: '1.5rem',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                  }}
                >
                  {/* ─── LEFT COLUMN: Headlines, Description, Tags, Trust ─── */}
                  <div style={{ flex: 1, minWidth: 0 }}>

                    {/* Big Bold White Headline */}
                    <h1 style={{
                      fontSize: 'clamp(1.85rem, 5.2vw, 2.6rem)',
                      fontWeight: 900,
                      lineHeight: 1.1,
                      letterSpacing: '-0.04em',
                      color: '#ffffff',
                      margin: '0 0 0.3rem',
                      textShadow: '0 2px 20px rgba(0,0,0,0.6)',
                    }}>
                      {role.headlineWhite}
                    </h1>

                    {/* Gold Highlighted Sub-Headline */}
                    <div style={{
                      fontSize: 'clamp(1.85rem, 5.2vw, 2.6rem)',
                      fontWeight: 900,
                      color: '#F5B942',
                      lineHeight: 1.1,
                      letterSpacing: '-0.04em',
                      marginBottom: '1.1rem',
                      textShadow: '0 0 30px rgba(245,185,66,0.35)',
                    }}>
                      {role.headlineGold}
                    </div>

                    {/* Description */}
                    <p style={{
                      fontSize: '0.86rem',
                      color: '#a1a1aa',
                      lineHeight: 1.65,
                      marginBottom: '1.4rem',
                      maxWidth: '330px',
                      fontWeight: 500,
                    }}>
                      {role.description}
                    </p>

                    {/* Service / Feature Pill Tags */}
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '0.42rem',
                      marginBottom: '1.5rem',
                    }}>
                      {role.tags.map((tag) => (
                        <span
                          key={tag}
                          style={{
                            backgroundColor: 'rgba(24,24,27,0.92)',
                            border: '1px solid rgba(255,255,255,0.12)',
                            borderRadius: '100px',
                            padding: '0.4rem 1rem',
                            fontSize: '0.77rem',
                            fontWeight: 700,
                            color: '#e4e4e7',
                            whiteSpace: 'nowrap',
                            letterSpacing: '0.01em',
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Trust Badges */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.52rem',
                    }}>
                      {role.trustPoints.map(({ icon, text }) => (
                        <div
                          key={text}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.6rem',
                            fontSize: '0.83rem',
                            fontWeight: 700,
                            color: '#e4e4e7',
                          }}
                        >
                          <span style={{ fontSize: '1.05rem', lineHeight: 1 }}>{icon}</span>
                          <span>{text}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ─── RIGHT COLUMN: Floating QR Card (sits over the gold curve) ─── */}
                  <div
                    className="flyer-qr-card"
                    style={{
                      flexShrink: 0,
                      backgroundColor: '#0f1014',
                      border: '1.5px solid rgba(255,255,255,0.1)',
                      borderRadius: '22px',
                      padding: '1.35rem 1.1rem 1.2rem',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      minWidth: '185px',
                      maxWidth: '215px',
                      boxShadow: '0 20px 60px rgba(0,0,0,0.92), 0 0 30px rgba(245,185,66,0.14)',
                      boxSizing: 'border-box',
                    }}
                  >
                    {/* Card Top Title */}
                    <div style={{
                      fontSize: '0.7rem',
                      fontWeight: 900,
                      color: '#F5B942',
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      marginBottom: '0.9rem',
                      lineHeight: 1.35,
                    }}>
                      {role.cardTitle}
                    </div>

                    {/* QR Code — White card container matching reference */}
                    <div style={{
                      backgroundColor: '#ffffff',
                      borderRadius: '14px',
                      padding: '10px',
                      marginBottom: '0.9rem',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                    }}>
                      {role.qrType === 'recruit' ? (
                        <QrRecruitSvg size={150} logoSize={32} />
                      ) : (
                        <QrWorldSvg size={150} logoSize={32} />
                      )}
                    </div>

                    {/* SCAN WITH CAMERA */}
                    <div style={{
                      fontSize: '0.83rem',
                      fontWeight: 900,
                      color: '#ffffff',
                      marginBottom: '0.18rem',
                      letterSpacing: '0.04em',
                    }}>
                      {role.cardScanText}
                    </div>

                    <div style={{
                      fontSize: '0.7rem',
                      color: '#71717a',
                      fontWeight: 600,
                      marginBottom: '0.22rem',
                      lineHeight: 1.4,
                    }}>
                      {role.cardSubText}
                    </div>

                    <div style={{
                      fontSize: '0.78rem',
                      fontWeight: 900,
                      color: '#F5B942',
                      letterSpacing: '0.02em',
                    }}>
                      {role.cardUrl}
                    </div>
                  </div>
                </div>

                {/* ─── Bottom Action Buttons (hidden when printing / PDF) ─── */}
                <div
                  className="no-print"
                  style={{
                    display: 'flex',
                    gap: '0.55rem',
                    marginTop: '1.6rem',
                    flexWrap: 'wrap',
                    paddingTop: '1.2rem',
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => saveToPdf(role.id)}
                    disabled={savingPdf}
                    style={{
                      background: 'linear-gradient(135deg, #F5B942 0%, #C8930A 100%)',
                      color: '#09090b',
                      border: 'none',
                      borderRadius: '50px',
                      padding: '0.6rem 1.4rem',
                      fontSize: '0.82rem',
                      fontWeight: 900,
                      cursor: savingPdf ? 'wait' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      boxShadow: '0 4px 18px rgba(245,185,66,0.35)',
                    }}
                  >
                    <FileDown size={14} /> Save as PDF
                  </button>

                  <button
                    type="button"
                    onClick={() => saveToImage(role.id)}
                    style={{
                      backgroundColor: 'rgba(24,24,27,0.95)',
                      color: '#e4e4e7',
                      border: '1px solid rgba(255,255,255,0.14)',
                      borderRadius: '50px',
                      padding: '0.6rem 1.15rem',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                    }}
                  >
                    <ImageIcon size={14} /> Save PNG
                  </button>

                  <button
                    type="button"
                    onClick={() => copyUrl(role.id, role.fullUrl)}
                    style={{
                      backgroundColor: 'rgba(24,24,27,0.95)',
                      color: copiedType === role.id ? '#4ade80' : '#e4e4e7',
                      border: '1px solid rgba(255,255,255,0.14)',
                      borderRadius: '50px',
                      padding: '0.6rem 1rem',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                    }}
                  >
                    {copiedType === role.id ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy Link</>}
                  </button>
                </div>

              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BillboardFlyersPage;

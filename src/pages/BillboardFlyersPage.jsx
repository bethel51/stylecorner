import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Copy, Maximize, Minimize, X, FileDown, Image as ImageIcon, Sparkles } from 'lucide-react';
import { QrWorldSvg, QrRecruitSvg } from '../components/common/QrCodeSvgs';
import { downloadElementAsPdf, downloadMultipleElementsAsPdf, downloadElementAsImage } from '../utils/flyerPdfExport';

export const BillboardFlyersPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const getInitialDesign = () => {
    const params = new URLSearchParams(location.search);
    const qDesign = params.get('design');
    if (qDesign) {
      const lower = qDesign.toLowerCase();
      if (lower === 'billboard' || lower === 'landscape') return 'billboard';
      if (lower === 'street' || lower === 'portrait') return 'street';
      if (lower === 'recruit' || lower === 'recruitment') return 'recruit';
    }
    const hash = (location.hash || '').replace('#', '').toLowerCase();
    if (hash === 'billboard' || hash === 'landscape') return 'billboard';
    if (hash === 'street' || hash === 'portrait') return 'street';
    if (hash === 'recruit' || hash === 'recruitment') return 'recruit';
    return 'all';
  };

  const [activeDesign, setActiveDesign] = useState('all');
  const [copiedType, setCopiedType] = useState(null);
  const [screenshotMode, setScreenshotMode] = useState(false);
  const [savingPdf, setSavingPdf] = useState(false);
  const [isCssFullscreen, setIsCssFullscreen] = useState(false);

  // Dynamic ref map for all 3 flyer cards
  const flyerRefs = {
    billboard: useRef(null),
    street: useRef(null),
    recruit: useRef(null),
  };

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
    const params = new URLSearchParams(location.search);
    if (params.get('download') === 'true') {
      setTimeout(() => saveToPdf(current), 1500);
    }
  }, [location.search, location.hash]);

  /* ── saveToPdf — Direct real PDF download without print dialog ── */
  const saveToPdf = async (designType) => {
    const target = designType || activeDesign;
    setSavingPdf(true);

    try {
      if (target === 'all') {
        const elementsWithConfig = [
          { el: flyerRefs.billboard.current, isLandscape: true },
          { el: flyerRefs.street.current, isLandscape: false },
          { el: flyerRefs.recruit.current, isLandscape: false },
        ].filter(item => Boolean(item.el));

        if (elementsWithConfig.length === 0) {
          throw new Error('Flyer elements not found in DOM');
        }

        const packName = 'StyleCorner_Marketing_Flyers_Pack.pdf';
        await downloadMultipleElementsAsPdf(elementsWithConfig, packName);
      } else {
        const el = flyerRefs[target]?.current || document.querySelector(`.print-card[data-design="${target}"]`);
        if (!el) throw new Error(`Flyer ${target} not found`);

        const isLandscape = target === 'billboard';
        const filename = `StyleCorner_${target.toUpperCase()}_Flyer.pdf`;
        await downloadElementAsPdf(el, filename, isLandscape);
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
      if (target === 'all') {
        const list = ['billboard', 'street', 'recruit'];
        for (const id of list) {
          const el = flyerRefs[id]?.current;
          if (el) {
            await downloadElementAsImage(el, `StyleCorner_${id.toUpperCase()}_Flyer.png`);
            await new Promise(r => setTimeout(r, 600));
          }
        }
      } else {
        const el = flyerRefs[target]?.current;
        if (el) {
          await downloadElementAsImage(el, `StyleCorner_${target.toUpperCase()}_Flyer.png`);
        }
      }
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
        padding: screenshotMode ? '0' : '1.5rem 1rem 4rem',
        boxSizing: 'border-box',
        ...(isCssFullscreen ? {
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '1rem 0.5rem 3rem',
          WebkitOverflowScrolling: 'touch',
        } : {}),
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&display=swap');
        
        * {
          box-sizing: border-box;
        }

        /* Mobile toolbar scroll & touch smoothness */
        .flyer-toolbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .flyer-toolbar::-webkit-scrollbar { display: none; }

        /* Mobile responsive adjustments */
        @media (max-width: 860px) {
          .billboard-wide-grid {
            grid-template-columns: 1fr !important;
            min-height: auto !important;
          }
          .bb-left-panel {
            padding: 2.2rem 1.5rem !important;
          }
          .bb-right-panel {
            min-height: 360px !important;
          }
        }

        @media (max-width: 600px) {
          .flyers-page-root {
            padding: 0.75rem 0.5rem calc(3.5rem + env(safe-area-inset-bottom, 0px)) !important;
          }
          .flyer-toolbar {
            width: calc(100% - 0.5rem) !important;
            padding: 0.35rem 0.55rem !important;
            gap: 0.35rem !important;
            margin-bottom: 1.5rem !important;
            border-radius: 20px !important;
          }
          .flyer-toolbar button {
            font-size: 0.72rem !important;
            padding: 0.35rem 0.65rem !important;
          }
          .billboard-container {
            gap: 2.5rem !important;
          }
          .bb-left-panel {
            padding: 1.75rem 1.15rem !important;
          }
          .bb-right-panel {
            min-height: 340px !important;
          }
          .street-photo-hero, .recruit-photo-hero {
            height: 300px !important;
          }
          .street-body, .recruit-body {
            padding: 1.25rem 1.1rem 2rem !important;
          }
          .recruit-features-grid {
            grid-template-columns: 1fr !important;
            gap: 0.6rem !important;
          }
          .stat-chips-container {
            left: 0.5rem !important;
            right: 0.5rem !important;
            gap: 0.4rem !important;
          }
          .stat-chip {
            padding: 0.35rem 0.5rem !important;
          }
          .stat-chip-num {
            font-size: 0.88rem !important;
          }
          .stat-chip-lbl {
            font-size: 0.55rem !important;
          }
          .qr-box-mobile {
            max-width: 100% !important;
            padding: 1.2rem 1rem !important;
          }
        }

        @media (max-width: 400px) {
          .bb-qr-float-card {
            right: 50% !important;
            transform: translateX(50%) !important;
            bottom: 1rem !important;
            width: calc(100% - 2rem) !important;
            max-width: 220px !important;
          }
        }

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
      `}</style>

      {/* Floating Toolbar */}
      {!screenshotMode && (
        <div
          className="flyer-toolbar no-print"
          style={{
            position: 'sticky',
            top: '0.75rem',
            zIndex: 100,
            backgroundColor: 'rgba(15, 17, 24, 0.96)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(245, 185, 66, 0.4)',
            borderRadius: '50px',
            padding: '0.45rem 0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '2.5rem',
            boxShadow: '0 12px 30px rgba(0,0,0,0.85), 0 0 20px rgba(245,185,66,0.15)',
            width: 'calc(100% - 1.5rem)',
            maxWidth: '980px',
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
              padding: '0.4rem 0.85rem',
              fontSize: '0.76rem',
              fontWeight: 800,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
              flexShrink: 0,
            }}
          >
            All 3 Designs
          </button>

          <button
            type="button"
            onClick={() => setActiveDesign('billboard')}
            style={{
              backgroundColor: activeDesign === 'billboard' ? '#F5B942' : 'transparent',
              color: activeDesign === 'billboard' ? '#08090C' : '#cbd5e1',
              border: activeDesign === 'billboard' ? '1px solid #F5B942' : '1px solid transparent',
              borderRadius: '50px',
              padding: '0.4rem 0.85rem',
              fontSize: '0.76rem',
              fontWeight: 800,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
              flexShrink: 0,
            }}
          >
            1. Landscape Billboard
          </button>

          <button
            type="button"
            onClick={() => setActiveDesign('street')}
            style={{
              backgroundColor: activeDesign === 'street' ? '#F5B942' : 'transparent',
              color: activeDesign === 'street' ? '#08090C' : '#cbd5e1',
              border: activeDesign === 'street' ? '1px solid #F5B942' : '1px solid transparent',
              borderRadius: '50px',
              padding: '0.4rem 0.85rem',
              fontSize: '0.76rem',
              fontWeight: 800,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
              flexShrink: 0,
            }}
          >
            2. Street Flyer
          </button>

          <button
            type="button"
            onClick={() => setActiveDesign('recruit')}
            style={{
              backgroundColor: activeDesign === 'recruit' ? '#F5B942' : 'transparent',
              color: activeDesign === 'recruit' ? '#08090C' : '#cbd5e1',
              border: activeDesign === 'recruit' ? '1px solid #F5B942' : '1px solid transparent',
              borderRadius: '50px',
              padding: '0.4rem 0.85rem',
              fontSize: '0.76rem',
              fontWeight: 800,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
              flexShrink: 0,
            }}
          >
            3. Recruitment Poster
          </button>

          <div style={{ flex: 1 }} />

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
              padding: '0.4rem 0.95rem',
              fontSize: '0.76rem',
              fontWeight: 800,
              cursor: savingPdf ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              whiteSpace: 'nowrap',
              opacity: savingPdf ? 0.7 : 1,
              flexShrink: 0,
            }}
          >
            <FileDown size={14} />
            {savingPdf ? 'Exporting PDF...' : 'Download PDF'}
          </button>

          {/* Save Image */}
          <button
            type="button"
            onClick={() => saveToImage(activeDesign)}
            style={{
              backgroundColor: 'rgba(255,255,255,0.08)',
              color: '#ffffff',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '50px',
              padding: '0.4rem 0.85rem',
              fontSize: '0.76rem',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              flexShrink: 0,
            }}
          >
            <ImageIcon size={14} /> Save PNG
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
              padding: '0.4rem 0.85rem',
              fontSize: '0.76rem',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              flexShrink: 0,
            }}
          >
            {isFullscreen ? <><Minimize size={14} /> Exit</> : <><Maximize size={14} /> Fullscreen</>}
          </button>
        </div>
      )}

      {/* Main Container */}
      <div
        className="billboard-container"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '3.5rem',
          alignItems: 'center',
          width: '100%',
          maxWidth: '1080px',
        }}
      >
        {/* ═════════════════════════════════════════════════════════════════════
            DESIGN 1 — LANDSCAPE BILLBOARD (Gold Accent)
            ═════════════════════════════════════════════════════════════════════ */}
        {(activeDesign === 'all' || activeDesign === 'billboard') && (
          <div style={{ width: '100%' }}>
            <div className="no-print" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', paddingInline: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#F5B942', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Sparkles size={14} /> 1. Landscape Billboard · 16:9 Format
              </span>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>www.stylecorner.world</span>
            </div>

            <div
              ref={flyerRefs.billboard}
              className="print-card billboard-wide-grid"
              data-design="billboard"
              style={{
                width: '100%',
                minHeight: '540px',
                backgroundColor: '#08090d',
                borderRadius: '32px',
                border: '1.5px solid rgba(245,185,66,0.35)',
                boxShadow: '0 40px 90px -10px rgba(0,0,0,0.95), 0 0 60px rgba(245,185,66,0.12)',
                position: 'relative',
                overflow: 'hidden',
                display: 'grid',
                gridTemplateColumns: '1fr 420px',
                boxSizing: 'border-box',
              }}
            >
              {/* Left copy panel */}
              <div className="bb-left-panel" style={{ position: 'relative', zIndex: 2, padding: '3.2rem 2.8rem 3.2rem 3.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.55rem', backgroundColor: 'rgba(245,185,66,0.1)', border: '1px solid rgba(245,185,66,0.35)', borderRadius: '50px', padding: '0.35rem 0.95rem', marginBottom: '1.3rem', width: 'fit-content' }}>
                  <img src="/pwa-icon-192.png" alt="SC" style={{ width: '18px', height: '18px', borderRadius: '5px', objectFit: 'cover' }} />
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#F5B942', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    StyleCorner Nigeria · Lagos &amp; Ibadan
                  </span>
                </div>

                <h1 style={{ fontSize: 'clamp(2.1rem, 4vw, 3.2rem)', fontWeight: 900, lineHeight: 1.08, letterSpacing: '-0.03em', margin: '0 0 1rem', color: '#ffffff' }}>
                  Book Verified Stylists,<br />
                  Barbers &amp; Braiders.<br />
                  <span style={{ background: 'linear-gradient(135deg, #F5B942 0%, #ffd57e 45%, #e8891d 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    In Seconds.
                  </span>
                </h1>

                <p style={{ fontSize: '0.96rem', color: '#94a3b8', lineHeight: 1.65, margin: '0 0 1.6rem', maxWidth: '440px', fontWeight: 500 }}>
                  Lagos &amp; Ibadan's premier beauty network. AI matches you with top-rated barbers, braiders, lash techs &amp; nail artists near you. In-salon or VIP home visits.
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.6rem' }}>
                  {['✓ Hair Braiders', '✓ Precision Barbers', '✓ Lash Techs', '✓ Nail Art', '✓ Soft Glam Makeup', '✓ Wig Frontal Install'].map(p => (
                    <div key={p} style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '50px', padding: '0.38rem 0.9rem', fontSize: '0.78rem', fontWeight: 700, color: '#e2e8f0' }}>
                      {p}
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '1.2rem', fontSize: '0.82rem', fontWeight: 700, color: '#94a3b8' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>🛡️ <span>100% Escrow Protected</span></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>⭐ <span>4.9★ Community Rated</span></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>📍 <span>Lagos &amp; Ibadan</span></div>
                </div>
              </div>

              {/* Right photo + floating QR card panel */}
              <div className="bb-right-panel" style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', minHeight: '480px' }}>
                <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
                  <img src="/banner-braider.jpg" alt="Nigerian Braider" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }} />
                  {/* Left gradient fade */}
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, #08090d 0%, rgba(8,9,13,0.3) 30%, transparent 60%)', zIndex: 1, pointerEvents: 'none' }} />
                  {/* Bottom gradient fade */}
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '45%', background: 'linear-gradient(to top, #08090d 0%, transparent 100%)', zIndex: 1, pointerEvents: 'none' }} />
                </div>

                {/* Floating QR Card */}
                <div className="bb-qr-float-card" style={{
                  position: 'absolute', bottom: '1.5rem', right: '1.5rem', zIndex: 3,
                  backgroundColor: 'rgba(8,9,13,0.92)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
                  border: '1.5px solid rgba(245,185,66,0.45)', borderRadius: '22px', padding: '1.2rem',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.85), 0 0 30px rgba(245,185,66,0.15)', width: '185px',
                  boxSizing: 'border-box',
                }}>
                  <div style={{ width: '130px', height: '130px', backgroundColor: '#ffffff', borderRadius: '12px', padding: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <QrWorldSvg size={120} logoSize={26} />
                  </div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 900, color: '#F5B942', letterSpacing: '0.04em', textTransform: 'uppercase', textAlign: 'center' }}>
                    POINT CAMERA TO BOOK
                  </div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#ffffff' }}>
                    www.stylecorner.world
                  </div>
                  <button
                    type="button"
                    onClick={() => saveToPdf('billboard')}
                    className="no-print"
                    style={{
                      background: 'linear-gradient(135deg, #F5B942, #C8930A)', color: '#08090C',
                      border: 'none', borderRadius: '50px', padding: '0.35rem 0.9rem', fontSize: '0.68rem',
                      fontWeight: 900, cursor: 'pointer', marginTop: '0.2rem', width: '100%',
                    }}
                  >
                    Save as PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════
            DESIGN 2 — STREET FLYER (Purple Accent)
            ═════════════════════════════════════════════════════════════════════ */}
        {(activeDesign === 'all' || activeDesign === 'street') && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="no-print" style={{ width: '100%', maxWidth: '620px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', paddingInline: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#c084fc', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Sparkles size={14} /> 2. Street Flyer · 4:5 / 9:16 Portrait
              </span>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>www.stylecorner.world</span>
            </div>

            <div
              ref={flyerRefs.street}
              className="print-card"
              data-design="street"
              style={{
                width: '100%',
                maxWidth: '620px',
                minHeight: '880px',
                backgroundColor: '#0a0812',
                border: '2px solid rgba(168,85,247,0.4)',
                borderRadius: '40px',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 40px 90px -10px rgba(0,0,0,0.95), 0 0 60px rgba(168,85,247,0.2)',
                display: 'flex',
                flexDirection: 'column',
                boxSizing: 'border-box',
              }}
            >
              {/* Photo hero */}
              <div className="street-photo-hero" style={{ width: '100%', height: '390px', position: 'relative', flexShrink: 0 }}>
                <img src="/banner-barber.jpg" alt="Barbershop Scene" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%', display: 'block' }} />
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(to bottom, rgba(10,8,18,0.15) 0%, rgba(10,8,18,0.65) 65%, #0a0812 100%)',
                }} />

                {/* Logo pill top-centre */}
                <div style={{
                  position: 'absolute', top: '1.5rem', left: '50%', transform: 'translateX(-50%)',
                  zIndex: 2, display: 'inline-flex', alignItems: 'center', gap: '0.55rem',
                  backgroundColor: 'rgba(10,8,18,0.85)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
                  border: '1.5px solid rgba(245,185,66,0.6)', borderRadius: '50px', padding: '0.45rem 1.25rem',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
                }}>
                  <img src="/pwa-icon-192.png" alt="SC" style={{ width: '22px', height: '22px', borderRadius: '6px', objectFit: 'cover' }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#F5B942', letterSpacing: '0.04em' }}>StyleCorner</span>
                </div>

                {/* Headline overlay */}
                <div style={{ position: 'absolute', bottom: '1.2rem', left: '2rem', right: '2rem', zIndex: 2, textAlign: 'center' }}>
                  <h2 style={{ fontSize: 'clamp(1.8rem, 5.5vw, 2.6rem)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.03em', margin: 0, textShadow: '0 2px 20px rgba(0,0,0,0.8)' }}>
                    Your Next Look.<br />
                    <span style={{ background: 'linear-gradient(135deg, #c084fc 0%, #a855f7 50%, #7c3aed 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                      Verified Stylist.
                    </span><br />
                    Booked In 30s.
                  </h2>
                </div>
              </div>

              {/* Content body */}
              <div className="street-body" style={{ padding: '1.5rem 2rem 2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', flex: 1 }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                  backgroundColor: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.4)',
                  borderRadius: '50px', padding: '0.35rem 0.9rem', fontSize: '0.72rem', fontWeight: 800,
                  color: '#c084fc', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1.1rem',
                }}>
                  ✨ Nigeria's Smart Beauty Network
                </div>

                <p style={{ fontSize: '0.92rem', color: '#94a3b8', lineHeight: 1.6, margin: '0 0 1.5rem', maxWidth: '440px', fontWeight: 500 }}>
                  Browse top-rated braiders, barbers, lash techs &amp; makeup artists in your LGA across Lagos &amp; Ibadan.
                </p>

                {/* Tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.8rem' }}>
                  {['Knotless Braids', 'Fades & Beard Trims', 'Volume Lash Tech', 'Gel & Acrylic Nails', 'Soft Glam Makeup', 'Frontal Wig Install'].map(t => (
                    <div key={t} style={{ backgroundColor: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.3)', borderRadius: '50px', padding: '0.38rem 0.9rem', fontSize: '0.78rem', fontWeight: 800, color: '#e9d5ff' }}>
                      {t}
                    </div>
                  ))}
                </div>

                {/* Purple QR Box */}
                <div className="qr-box-mobile" style={{
                  backgroundColor: 'rgba(168,85,247,0.08)', border: '1.5px solid rgba(168,85,247,0.5)',
                  borderRadius: '24px', padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: '0.55rem', width: '100%', maxWidth: '320px', marginBottom: '1.5rem',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.6), 0 0 30px rgba(168,85,247,0.2)',
                  boxSizing: 'border-box',
                }}>
                  <div style={{ width: '150px', height: '150px', backgroundColor: '#ffffff', borderRadius: '16px', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <QrWorldSvg size={140} logoSize={30} />
                  </div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 900, color: '#c084fc', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    POINT CAMERA TO SCAN
                  </div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ffffff' }}>
                    www.stylecorner.world
                  </div>
                  <button
                    type="button"
                    onClick={() => saveToPdf('street')}
                    className="no-print"
                    style={{
                      background: 'linear-gradient(135deg, #a855f7, #7c3aed)', color: '#ffffff',
                      border: 'none', borderRadius: '50px', padding: '0.45rem 1.4rem', fontSize: '0.76rem',
                      fontWeight: 900, cursor: 'pointer', marginTop: '0.3rem', width: '100%',
                    }}
                  >
                    Save as PDF
                  </button>
                </div>

                {/* Footer trust */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.2rem', width: '100%' }}>
                  <span>📍 Lagos &amp; Ibadan</span>
                  <span>🛡️ Protected Escrow</span>
                  <span>⭐ 4.9★ Rating</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════
            DESIGN 3 — RECRUITMENT POSTER (Emerald Green Accent)
            ═════════════════════════════════════════════════════════════════════ */}
        {(activeDesign === 'all' || activeDesign === 'recruit') && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="no-print" style={{ width: '100%', maxWidth: '620px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', paddingInline: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#4ade80', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Sparkles size={14} /> 3. Recruitment Poster · Pro Onboarding
              </span>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>stylecorner.world/role-selection</span>
            </div>

            <div
              ref={flyerRefs.recruit}
              className="print-card"
              data-design="recruit"
              style={{
                width: '100%',
                maxWidth: '620px',
                minHeight: '900px',
                backgroundColor: '#060f0a',
                border: '2px solid rgba(16,185,129,0.4)',
                borderRadius: '40px',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 40px 90px -10px rgba(0,0,0,0.95), 0 0 60px rgba(16,185,129,0.18)',
                display: 'flex',
                flexDirection: 'column',
                boxSizing: 'border-box',
              }}
            >
              {/* Photo hero */}
              <div className="recruit-photo-hero" style={{ width: '100%', height: '390px', position: 'relative', flexShrink: 0 }}>
                <img src="/banner-beauty-team.jpg" alt="Nigerian Beauty Professionals Team" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%', display: 'block' }} />
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(to bottom, rgba(6,15,10,0.15) 0%, rgba(6,15,10,0.65) 65%, #060f0a 100%)',
                }} />

                {/* Logo pill top-centre */}
                <div style={{
                  position: 'absolute', top: '1.5rem', left: '50%', transform: 'translateX(-50%)',
                  zIndex: 2, display: 'inline-flex', alignItems: 'center', gap: '0.55rem',
                  backgroundColor: 'rgba(6,15,10,0.85)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
                  border: '1.5px solid rgba(16,185,129,0.5)', borderRadius: '50px', padding: '0.45rem 1.25rem',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
                }}>
                  <img src="/pwa-icon-192.png" alt="SC" style={{ width: '22px', height: '22px', borderRadius: '6px', objectFit: 'cover' }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#4ade80', letterSpacing: '0.04em' }}>StyleCorner Pro</span>
                </div>

                {/* Floating stat chips on photo bottom */}
                <div className="stat-chips-container" style={{
                  position: 'absolute', bottom: '1.2rem', left: '1.5rem', right: '1.5rem',
                  display: 'flex', justifyContent: 'center', gap: '0.75rem', zIndex: 2,
                }}>
                  {[
                    { num: '2,400+', label: 'Active Clients' },
                    { num: '₦0', label: 'Joining Fee' },
                    { num: '24h', label: 'Fast Payouts' },
                  ].map(s => (
                    <div key={s.label} className="stat-chip" style={{
                      backgroundColor: 'rgba(6,15,10,0.85)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
                      border: '1px solid rgba(16,185,129,0.3)', borderRadius: '14px', padding: '0.45rem 0.9rem',
                      textAlign: 'center', flex: 1,
                    }}>
                      <div className="stat-chip-num" style={{ fontSize: '1rem', fontWeight: 900, color: '#4ade80', lineHeight: 1.1 }}>{s.num}</div>
                      <div className="stat-chip-lbl" style={{ fontSize: '0.62rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Content body */}
              <div className="recruit-body" style={{ padding: '1.5rem 2rem 2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', flex: 1 }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                  backgroundColor: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.4)',
                  borderRadius: '50px', padding: '0.35rem 0.9rem', fontSize: '0.72rem', fontWeight: 800,
                  color: '#4ade80', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1.1rem',
                }}>
                  📢 Calling All Beauty &amp; Grooming Professionals
                </div>

                <h2 style={{ fontSize: 'clamp(1.8rem, 5.5vw, 2.6rem)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.03em', margin: '0 0 0.9rem' }}>
                  Are You a Barber,<br />Braider or Stylist?<br />
                  <span style={{ background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 50%, #10b981 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Get Booked. Get Paid.
                  </span>
                </h2>

                <p style={{ fontSize: '0.92rem', color: '#94a3b8', lineHeight: 1.6, margin: '0 0 1.5rem', maxWidth: '440px', fontWeight: 500 }}>
                  Join StyleCorner's verified beauty network in Lagos &amp; Ibadan. Fill your open calendar slots with high-value clients — zero commission for first 3 months.
                </p>

                {/* 2x2 Feature Grid */}
                <div className="recruit-features-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.7rem', width: '100%', marginBottom: '1.6rem', textAlign: 'left' }}>
                  <div style={{ backgroundColor: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.18)', borderRadius: '14px', padding: '0.9rem' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#4ade80', marginBottom: '0.25rem' }}>💰 Instant Wallet Payouts</div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', lineHeight: 1.4 }}>Get paid directly upon service completion with full escrow protection.</div>
                  </div>
                  <div style={{ backgroundColor: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.18)', borderRadius: '14px', padding: '0.9rem' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#4ade80', marginBottom: '0.25rem' }}>📍 Direct Local Clients</div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', lineHeight: 1.4 }}>Matched with clients right in your neighborhood and preferred LGA.</div>
                  </div>
                  <div style={{ backgroundColor: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.18)', borderRadius: '14px', padding: '0.9rem' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#4ade80', marginBottom: '0.25rem' }}>💈 Salon or Home Service</div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', lineHeight: 1.4 }}>Host clients at your station or offer premium home visits.</div>
                  </div>
                  <div style={{ backgroundColor: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.18)', borderRadius: '14px', padding: '0.9rem' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#4ade80', marginBottom: '0.25rem' }}>⭐ Free Verification</div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', lineHeight: 1.4 }}>Zero joining fee. Build a verified profile with client reviews &amp; portfolio.</div>
                  </div>
                </div>

                {/* Green QR Box */}
                <div style={{
                  backgroundColor: 'rgba(16,185,129,0.07)', border: '1.5px solid rgba(16,185,129,0.5)',
                  borderRadius: '22px', padding: '1.4rem 1.8rem', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: '0.5rem', width: '100%', maxWidth: '300px', marginBottom: '1.4rem',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.6), 0 0 30px rgba(16,185,129,0.18)',
                  boxSizing: 'border-box',
                }}>
                  <div style={{ width: '150px', height: '150px', backgroundColor: '#ffffff', borderRadius: '14px', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <QrRecruitSvg size={140} logoSize={30} />
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#4ade80', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Scan to Join as Expert
                  </div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#ffffff' }}>
                    stylecorner.world/role-selection
                  </div>
                  <button
                    type="button"
                    onClick={() => saveToPdf('recruit')}
                    className="no-print"
                    style={{
                      background: 'linear-gradient(135deg, #10b981, #059669)', color: '#ffffff',
                      border: 'none', borderRadius: '50px', padding: '0.45rem 1.4rem', fontSize: '0.76rem',
                      fontWeight: 900, cursor: 'pointer', marginTop: '0.3rem', width: '100%',
                    }}
                  >
                    Save as PDF
                  </button>
                </div>

                {/* Footer */}
                <div style={{ fontSize: '0.75rem', color: '#64748b', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.2rem', width: '100%' }}>
                  StyleCorner Nigeria · Lagos &amp; Ibadan Verified Beauty &amp; Grooming Platform
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BillboardFlyersPage;

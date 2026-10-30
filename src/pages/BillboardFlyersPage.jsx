import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Check, Copy, Loader, Maximize, Minimize, X, FileDown, Image as ImageIcon } from 'lucide-react';
import { QrWorldSvg, QrRecruitSvg } from '../components/common/QrCodeSvgs';
import { downloadElementAsPdf, downloadMultipleElementsAsPdf, downloadElementAsImage } from '../utils/flyerPdfExport';

export const BillboardFlyersPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const getInitialDesign = () => {
    const params = new URLSearchParams(location.search);
    const qDesign = params.get('design');
    if (qDesign) return qDesign.toLowerCase();
    const hash = (location.hash || '').replace('#', '').toLowerCase();
    if (hash === 'portrait' || hash === 'flyer' || hash === 'story') return 'street';
    if (hash === 'recruitment' || hash === 'stylist') return 'recruit';
    if (hash === 'highway' || hash === 'banner') return 'billboard';
    if (['billboard', 'street', 'recruit'].includes(hash)) return hash;
    return 'all';
  };

  const [activeDesign, setActiveDesign] = useState(getInitialDesign());
  const [copiedType, setCopiedType] = useState(null);
  const [screenshotMode, setScreenshotMode] = useState(false);
  const [savingPdf, setSavingPdf] = useState(false);
  const [isCssFullscreen, setIsCssFullscreen] = useState(false);
  const billboardRef = useRef(null);
  const streetRef = useRef(null);
  const recruitRef = useRef(null);

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

  /* ─────────────────────────────────────────────────────────────────
     saveToPdf — Directly generates a high-resolution, downloadable PDF
     file via jsPDF & html2canvas and saves it directly to the user's
     device / downloads folder (no printer dialog).
  ───────────────────────────────────────────────────────────────── */
  const saveToPdf = async (designType) => {
    const target = designType || activeDesign;
    setSavingPdf(true);

    try {
      if (target === 'all') {
        const elementsWithConfig = [
          { el: billboardRef.current, isLandscape: true },
          { el: streetRef.current, isLandscape: false },
          { el: recruitRef.current, isLandscape: false },
        ].filter(item => Boolean(item.el));

        if (elementsWithConfig.length === 0) {
          throw new Error('Flyer elements not found in DOM');
        }

        await downloadMultipleElementsAsPdf(elementsWithConfig, 'StyleCorner_Marketing_Flyers_Pack.pdf');
      } else {
        const refMap = { billboard: billboardRef, street: streetRef, recruit: recruitRef };
        const el = refMap[target]?.current || document.querySelector(`.print-card[data-design="${target}"]`);
        if (!el) throw new Error(`Flyer ${target} not found`);

        const isLandscape = (target === 'billboard');
        const filename = `StyleCorner_${target.toUpperCase()}_Flyer.pdf`;
        await downloadElementAsPdf(el, filename, isLandscape);
      }
    } catch (err) {
      console.error('PDF export error:', err);
      // Show a user-friendly alert — never fall back to print dialog
      alert('⚠️ PDF export failed. Please try the "Save Image (PNG)" button instead, or open in Chrome/Edge for best results.');
    } finally {
      setSavingPdf(false);
    }
  };

  const saveToImage = async (designType) => {
    const target = designType || activeDesign;
    try {
      const refMap = { billboard: billboardRef, street: streetRef, recruit: recruitRef };
      const el = refMap[target]?.current || document.querySelector(`.print-card[data-design="${target}"]`);
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

  /* ────────────────────────────────────────────────────────────────── */
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

        /* Mobile sweep: let billboard fit phone screens cleanly */
        @media (max-width: 768px) {
          .billboard-main-card {
            min-width: 0 !important;
            width: 100% !important;
            grid-template-columns: 1fr !important;
            padding: 1.25rem 1rem !important;
            gap: 1.5rem !important;
          }
          .billboard-scroll-wrapper {
            overflow-x: visible !important;
          }
        }

        /* Fullscreen scrollable banner wrapper */
        .banner-fullscreen-scroll {
          width: 100%;
          overflow-x: auto;
          overflow-y: hidden;
          -webkit-overflow-scrolling: touch;
        }
        .banner-fullscreen-scroll > * {
          min-width: 320px;
        }

        /* Expert human silhouette */
        .expert-silhouette {
          width: 110px;
          height: 180px;
          flex-shrink: 0;
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
            maxWidth: '900px',
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

          {[
            { id: 'all', label: 'All 3' },
            { id: 'billboard', label: '🏙 Billboard' },
            { id: 'street', label: '📄 Street Flyer' },
            { id: 'recruit', label: '✂️ Expert Recruit' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveDesign(tab.id)}
              style={{
                backgroundColor: activeDesign === tab.id ? '#F5B942' : 'transparent',
                color: activeDesign === tab.id ? '#08090C' : '#cbd5e1',
                border: activeDesign === tab.id ? '1px solid #F5B942' : '1px solid transparent',
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
              {tab.label}
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
            onClick={() => saveToImage(activeDesign)}
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
          gap: '2.5rem',
          alignItems: 'center',
          width: '100%',
          maxWidth: '1100px',
        }}
      >
        {/* ══════════════════════════════════════════════════════════════════
             DESIGN 1: WIDE LUXURY BILLBOARD (16:9 / Landscape)
             ══════════════════════════════════════════════════════════════════ */}
        {(activeDesign === 'all' || activeDesign === 'billboard') && (
          <div style={{ width: '100%', maxWidth: '1080px' }}>
            {/* Mobile scroll hint label */}
            <div className="no-print" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: '0.6rem', paddingInline: '0.25rem',
            }}>
              <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
                🏙 Billboard Flyer · Swipe sideways on mobile
              </span>
              <span style={{ fontSize: '0.68rem', color: '#F5B942', fontWeight: 700 }}>↔ scroll</span>
            </div>

            {/* Horizontally scrollable wrapper on mobile */}
            <div
              className="billboard-scroll-wrapper"
              style={{
                width: '100%',
                overflowX: 'auto',
                overflowY: 'visible',
                WebkitOverflowScrolling: 'touch',
                borderRadius: '32px',
                scrollbarWidth: 'none',
              }}
            >
              <div
                ref={billboardRef}
                className="print-card billboard-main-card"
                data-design="billboard"
                style={{
                  minWidth: '680px', // keeps landscape ratio on desktop
                  width: '100%',
                  background: 'radial-gradient(circle at 85% 20%, rgba(245,185,66,0.18) 0%, transparent 45%), linear-gradient(135deg, #0d0f16 0%, #08090d 60%, #050608 100%)',
                  border: '2px solid rgba(245,185,66,0.45)',
                  borderRadius: '32px',
                  padding: 'clamp(1.5rem, 4vw, 3.5rem)',
                  boxShadow: '0 35px 80px -15px rgba(0,0,0,0.95), 0 0 50px rgba(245,185,66,0.15)',
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  gap: '2.5rem',
                  alignItems: 'center',
                  boxSizing: 'border-box',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.55rem',
                    backgroundColor: 'rgba(245,185,66,0.12)',
                    border: '1px solid rgba(245,185,66,0.35)',
                    borderRadius: '50px', padding: '0.4rem 1rem', marginBottom: '1.25rem',
                  }}>
                    <img src="/pwa-icon-192.png" alt="StyleCorner"
                      style={{ width: '22px', height: '22px', borderRadius: '5px', objectFit: 'cover' }} />
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#F5B942', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                      StyleCorner Nigeria · Lagos &amp; Ibadan
                    </span>
                  </div>

                  <h1 style={{
                    fontSize: 'clamp(1.8rem, 4vw, 3.2rem)', fontWeight: 900,
                    lineHeight: 1.1, letterSpacing: '-0.035em', marginBottom: '1.2rem',
                  }}>
                    Book Verified Stylists, Barbers &amp; Braiders. <br />
                    <span style={{
                      background: 'linear-gradient(135deg, #F5B942 0%, #ffc857 40%, #e8891d 100%)',
                      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    }}>
                      In Seconds.
                    </span>
                  </h1>

                  <p style={{ fontSize: '1rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: '1.8rem', maxWidth: '560px' }}>
                    Lagos &amp; Ibadan's premier beauty network. AI matches you with top-rated barbers, braiders, lash techs &amp; nail artists near you. In-salon or VIP home visits.
                  </p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.75rem' }}>
                    {['✦ Hair Braiders', '✦ Precision Barbers', '✦ Lash Techs', '✦ Nail Art', '✦ Soft Glam Makeup', '✦ Wig Frontal Install'].map((p) => (
                      <span key={p} style={{
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: '50px', padding: '0.4rem 0.9rem',
                        fontSize: '0.8rem', fontWeight: 700, color: '#e2e8f0',
                      }}>
                        {p}
                      </span>
                    ))}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', color: '#cbd5e1', fontSize: '0.82rem', fontWeight: 700, flexWrap: 'wrap' }}>
                    <span>🛡️ 100% Escrow Protected</span>
                    <span>⭐ 4.9 ★ Community Rated</span>
                    <span>📍 Lagos &amp; Ibadan</span>
                  </div>
                </div>

                {/* Right QR Showcase */}
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  backgroundColor: 'rgba(255,255,255,0.04)',
                  border: '1.5px solid rgba(245,185,66,0.35)',
                  borderRadius: '26px', padding: '2rem 1.5rem', textAlign: 'center',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.7)',
                  minWidth: '200px',
                }}>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                    backgroundColor: '#F5B942', color: '#08090C',
                    fontSize: '0.8rem', fontWeight: 900,
                    padding: '0.4rem 1.1rem', borderRadius: '50px',
                    textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '1rem',
                  }}>
                    ⚡ Instant Mobile Booking
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <QrWorldSvg size={200} logoSize={40} />
                  </div>

                  <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#FFFFFF', marginBottom: '0.3rem' }}>
                    SCAN WITH CAMERA
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>
                    Point phone camera to join · <strong style={{ color: '#F5B942' }}>www.stylecorner.world</strong>
                  </div>

                  <div className="no-print" style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <button
                      type="button"
                      onClick={() => saveToPdf('billboard')}
                      disabled={savingPdf}
                      style={{
                        backgroundColor: '#F5B942', color: '#08090C', border: 'none',
                        borderRadius: '50px', padding: '0.55rem 1.25rem',
                        fontSize: '0.8rem', fontWeight: 900, cursor: 'pointer',
                        display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                      }}
                    >
                      <FileDown size={13} /> Save as PDF
                    </button>
                    <button
                      type="button"
                      onClick={() => copyUrl('billboard', 'https://www.stylecorner.world')}
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.08)',
                        color: copiedType === 'billboard' ? '#4ade80' : '#cbd5e1',
                        border: '1px solid rgba(255,255,255,0.15)',
                        borderRadius: '50px', padding: '0.55rem 0.95rem',
                        fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer',
                      }}
                    >
                      {copiedType === 'billboard' ? <Check size={13} /> : <Copy size={13} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
             DESIGN 2: PORTRAIT STREET FLYER — GOLD & BLACK THEME
             ══════════════════════════════════════════════════════════════════ */}
        {(activeDesign === 'all' || activeDesign === 'street') && (
          <div
            ref={streetRef}
            className="print-card"
            data-design="street"
            style={{
              width: '100%',
              maxWidth: '560px',
              background: 'radial-gradient(circle at 50% 8%, rgba(245,185,66,0.22) 0%, transparent 52%), linear-gradient(175deg, #120e02 0%, #0d0a01 55%, #050400 100%)',
              border: '2.5px solid rgba(245,185,66,0.55)',
              borderRadius: '36px',
              padding: 'clamp(1.75rem, 5vw, 3rem) clamp(1.25rem, 4vw, 2.5rem)',
              boxShadow: '0 40px 90px -15px rgba(0,0,0,0.95), 0 0 55px rgba(245,185,66,0.2)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              boxSizing: 'border-box',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
              <img src="/pwa-icon-192.png" alt="StyleCorner"
                style={{ width: '44px', height: '44px', borderRadius: '14px', objectFit: 'cover' }} />
              <span style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.02em', color: '#FFFFFF' }}>
                StyleCorner
              </span>
            </div>

            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              backgroundColor: 'rgba(245,185,66,0.14)',
              border: '1px solid rgba(245,185,66,0.45)',
              borderRadius: '50px', padding: '0.35rem 0.9rem', marginBottom: '1.2rem',
              fontSize: '0.74rem', fontWeight: 800, color: '#F5B942', textTransform: 'uppercase',
            }}>
              ⚡ Nigeria's Smart Beauty Network
            </div>

            <h2 style={{
              fontSize: 'clamp(1.9rem, 5.5vw, 2.8rem)', fontWeight: 900,
              lineHeight: 1.12, letterSpacing: '-0.035em', marginBottom: '1rem',
            }}>
              Your Next Look. <br />
              <span style={{
                background: 'linear-gradient(135deg, #F5B942 0%, #ffd06e 45%, #e8891d 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                Verified Stylist.
              </span> <br />
              Booked In 30s.
            </h2>

            <p style={{ fontSize: '0.95rem', color: '#a89070', lineHeight: 1.6, maxWidth: '420px', marginBottom: '1.5rem' }}>
              No more guessing salon quality. Get matched to vetted braiders, barbers, lash techs &amp; makeup artists in your LGA across Lagos &amp; Ibadan.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.45rem', marginBottom: '1.75rem' }}>
              {['✦ Knotless Braids', '✦ Fade & Beard Trim', '✦ Volume Lash Tech', '✦ Gel & Acrylic Nails', '✦ Soft Glam Makeup', '✦ Frontal Wig Install'].map((s) => (
                <span key={s} style={{
                  backgroundColor: 'rgba(245,185,66,0.09)',
                  border: '1px solid rgba(245,185,66,0.3)',
                  borderRadius: '50px', padding: '0.35rem 0.85rem',
                  fontSize: '0.78rem', fontWeight: 700, color: '#e2c97a',
                }}>
                  {s}
                </span>
              ))}
            </div>

            {/* QR Box — Gold theme */}
            <div style={{
              backgroundColor: 'rgba(245,185,66,0.1)',
              border: '2px solid rgba(245,185,66,0.5)',
              borderRadius: '28px', padding: '1.75rem 2rem',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              marginBottom: '1.5rem', width: '100%', maxWidth: '300px',
              boxSizing: 'border-box',
              boxShadow: '0 18px 45px rgba(0,0,0,0.7), 0 0 35px rgba(245,185,66,0.2)',
            }}>
              <div style={{ marginBottom: '0.85rem' }}>
                <QrWorldSvg size={190} logoSize={38} />
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#F5B942', letterSpacing: '0.04em' }}>
                POINT CAMERA TO SCAN
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#FFFFFF', marginTop: '3px' }}>
                www.stylecorner.world
              </div>

              <div className="no-print" style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={() => saveToPdf('street')}
                  disabled={savingPdf}
                  style={{
                    backgroundColor: '#F5B942', color: '#08090C', border: 'none',
                    borderRadius: '50px', padding: '0.55rem 1.25rem',
                    fontSize: '0.8rem', fontWeight: 900, cursor: 'pointer',
                    display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                    boxShadow: '0 4px 14px rgba(245,185,66,0.4)',
                  }}
                >
                  <FileDown size={13} /> Save as PDF
                </button>
                <button
                  type="button"
                  onClick={() => copyUrl('street', 'https://www.stylecorner.world')}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    color: copiedType === 'street' ? '#4ade80' : '#cbd5e1',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '50px', padding: '0.55rem 0.95rem',
                    fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer',
                  }}
                >
                  {copiedType === 'street' ? <Check size={13} /> : <Copy size={13} />}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1.25rem', color: '#6b5b30', fontSize: '0.78rem', fontWeight: 700 }}>
              <span>📍 Lagos &amp; Ibadan</span>
              <span>🛡️ Protected Escrow</span>
              <span>⭐ 4.9 ★ Rating</span>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
             DESIGN 3: STYLIST & SALON RECRUITMENT POSTER — GOLD & BLACK
             ══════════════════════════════════════════════════════════════════ */}
        {(activeDesign === 'all' || activeDesign === 'recruit') && (
          <div
            ref={recruitRef}
            className="print-card"
            data-design="recruit"
            style={{
              width: '100%',
              maxWidth: '600px',
              background: 'radial-gradient(circle at 50% 10%, rgba(245,185,66,0.2) 0%, transparent 52%), linear-gradient(175deg, #120e02 0%, #0d0a01 60%, #050400 100%)',
              border: '2.5px solid rgba(245,185,66,0.55)',
              borderRadius: '36px',
              padding: 'clamp(1.75rem, 5vw, 3rem) clamp(1.25rem, 4vw, 2.5rem)',
              boxShadow: '0 40px 90px -15px rgba(0,0,0,0.95), 0 0 55px rgba(245,185,66,0.22)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              boxSizing: 'border-box',
            }}
          >
            {/* Logo row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
              <img src="/pwa-icon-192.png" alt="StyleCorner"
                style={{ width: '44px', height: '44px', borderRadius: '14px', objectFit: 'cover' }} />
              <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#FFFFFF' }}>StyleCorner</span>
            </div>

            {/* Badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              backgroundColor: 'rgba(245,185,66,0.14)',
              border: '1px solid rgba(245,185,66,0.45)',
              borderRadius: '50px', padding: '0.35rem 0.9rem', marginBottom: '1.2rem',
              fontSize: '0.74rem', fontWeight: 800, color: '#F5B942', textTransform: 'uppercase',
            }}>
              ✂️ Calling All Beauty &amp; Grooming Professionals
            </div>

            {/* Human Expert Silhouette + Headline row */}
            <div style={{
              display: 'flex', alignItems: 'flex-end', gap: '1.25rem',
              marginBottom: '1rem', width: '100%', justifyContent: 'center',
            }}>
              {/* SVG expert silhouette — barber/stylist figure */}
              <svg
                className="expert-silhouette"
                viewBox="0 0 110 195"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                {/* Glow aura behind figure */}
                <ellipse cx="55" cy="160" rx="38" ry="18" fill="rgba(245,185,66,0.12)" />

                {/* Body / Tunic */}
                <path
                  d="M30 95 Q28 120 26 160 Q24 175 30 178 L80 178 Q86 175 84 160 Q82 120 80 95 Q70 105 55 107 Q40 105 30 95Z"
                  fill="url(#bodyGrad)"
                />

                {/* Collar / Shirt detail */}
                <path
                  d="M44 96 Q55 108 66 96 L60 130 L55 136 L50 130Z"
                  fill="rgba(245,185,66,0.25)"
                />

                {/* Gold accent stripe */}
                <rect x="52" y="108" width="6" height="55" rx="3" fill="rgba(245,185,66,0.55)" />

                {/* Left arm */}
                <path
                  d="M30 95 Q18 110 16 140 Q15 150 22 150 Q30 148 32 138 Q34 118 38 100Z"
                  fill="url(#bodyGrad)"
                />
                {/* Left hand + scissors */}
                <ellipse cx="20" cy="152" rx="7" ry="5" fill="#c8a060" />
                {/* Scissors SVG */}
                <g transform="translate(8, 148) rotate(-25)">
                  <line x1="0" y1="0" x2="14" y2="10" stroke="#F5B942" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="4" y1="0" x2="10" y2="10" stroke="#F5B942" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="0" cy="0" r="2.5" fill="none" stroke="#F5B942" strokeWidth="1.5"/>
                  <circle cx="4" cy="0" r="2.5" fill="none" stroke="#F5B942" strokeWidth="1.5"/>
                </g>

                {/* Right arm */}
                <path
                  d="M80 95 Q92 108 94 136 Q95 148 88 149 Q80 148 78 138 Q76 116 72 100Z"
                  fill="url(#bodyGrad)"
                />
                {/* Right hand + comb */}
                <ellipse cx="90" cy="151" rx="7" ry="5" fill="#c8a060" />
                {/* Comb */}
                <rect x="86" y="142" width="8" height="2" rx="1" fill="#F5B942" />
                {[0,2,4,6,8].map(i => (
                  <rect key={i} x={86 + i} y="144" width="1.2" height="5" rx="0.6" fill="#F5B942" />
                ))}

                {/* Neck */}
                <rect x="49" y="75" width="12" height="22" rx="6" fill="#c8a060" />

                {/* Head */}
                <ellipse cx="55" cy="60" rx="22" ry="24" fill="#c8a060" />

                {/* Hair (natural/braids hint) */}
                <path
                  d="M33 52 Q35 30 55 28 Q75 30 77 52 Q75 38 70 36 Q60 28 50 36 Q42 38 37 52Z"
                  fill="#2a1a00"
                />
                {/* Braid strands */}
                <path d="M38 34 Q36 42 38 50" stroke="#3d2500" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                <path d="M44 30 Q42 40 44 48" stroke="#3d2500" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                <path d="M55 28 Q54 38 55 46" stroke="#3d2500" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                <path d="M66 30 Q68 40 66 48" stroke="#3d2500" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                <path d="M72 34 Q74 42 72 50" stroke="#3d2500" strokeWidth="2.5" strokeLinecap="round" fill="none"/>

                {/* Earring */}
                <circle cx="33" cy="62" r="2.5" fill="none" stroke="#F5B942" strokeWidth="1.5"/>
                <circle cx="77" cy="62" r="2.5" fill="none" stroke="#F5B942" strokeWidth="1.5"/>

                {/* Face features */}
                {/* Eyes */}
                <ellipse cx="47" cy="58" rx="3" ry="3.5" fill="#1a1000" />
                <ellipse cx="63" cy="58" rx="3" ry="3.5" fill="#1a1000" />
                <circle cx="48" cy="57" r="1" fill="rgba(255,255,255,0.6)" />
                <circle cx="64" cy="57" r="1" fill="rgba(255,255,255,0.6)" />

                {/* Smile */}
                <path d="M47 70 Q55 76 63 70" stroke="#1a1000" strokeWidth="1.8" fill="none" strokeLinecap="round"/>

                {/* Legs */}
                <path d="M38 178 Q36 190 36 193 Q44 194 46 193 Q46 190 46 178Z" fill="url(#bodyGrad)" />
                <path d="M72 178 Q74 190 74 193 Q66 194 64 193 Q64 190 64 178Z" fill="url(#bodyGrad)" />

                {/* Shoes */}
                <ellipse cx="41" cy="193" rx="8" ry="3" fill="#1a1000" />
                <ellipse cx="69" cy="193" rx="8" ry="3" fill="#1a1000" />

                {/* Gold star badge on chest */}
                <polygon
                  points="55,112 57,118 63,118 58,122 60,128 55,124 50,128 52,122 47,118 53,118"
                  fill="#F5B942" opacity="0.9"
                />

                <defs>
                  <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1a1200" />
                    <stop offset="60%" stopColor="#0e0900" />
                    <stop offset="100%" stopColor="#050400" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Headline text */}
              <div style={{ textAlign: 'left', flex: 1, minWidth: 0 }}>
                <h2 style={{
                  fontSize: 'clamp(1.55rem, 4.5vw, 2.4rem)', fontWeight: 900,
                  lineHeight: 1.15, letterSpacing: '-0.03em', marginBottom: '0.5rem',
                }}>
                  Are You a Barber, Braider, Lash Tech or Stylist?
                </h2>
                <span style={{
                  fontSize: 'clamp(1.4rem, 4vw, 2.1rem)', fontWeight: 900,
                  background: 'linear-gradient(135deg, #F5B942 0%, #ffd06e 45%, #e8891d 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  display: 'block',
                }}>
                  Get Booked. Get Paid.
                </span>
              </div>
            </div>

            <p style={{ fontSize: '0.95rem', color: '#a89070', lineHeight: 1.5, maxWidth: '440px', marginBottom: '1.75rem', textAlign: 'center' }}>
              Join StyleCorner's verified beauty network in Lagos &amp; Ibadan. Fill your open calendar slots with high-value clients.
            </p>

            {/* 4 Value Points — Gold theme */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
              gap: '0.75rem', width: '100%', marginBottom: '1.75rem',
            }}>
              {[
                { title: '💰 Instant Wallet Payouts', desc: 'Direct escrow release upon service completion.' },
                { title: '📍 Direct Local Clients', desc: 'Matched near your neighborhood and LGA.' },
                { title: '🏠 Salon or Home Service', desc: 'Host station or offer VIP mobile visits.' },
                { title: '⭐ Free Verification', desc: 'Zero registration or onboarding fee.' },
              ].map((feat) => (
                <div key={feat.title} style={{
                  backgroundColor: 'rgba(245,185,66,0.07)',
                  border: '1px solid rgba(245,185,66,0.22)',
                  borderRadius: '16px', padding: '0.9rem', textAlign: 'left',
                }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#F5B942', marginBottom: '0.2rem' }}>
                    {feat.title}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', lineHeight: 1.4 }}>
                    {feat.desc}
                  </div>
                </div>
              ))}
            </div>

            {/* Recruitment QR Code — Gold theme */}
            <div style={{
              backgroundColor: 'rgba(245,185,66,0.1)',
              border: '2px solid rgba(245,185,66,0.5)',
              borderRadius: '28px', padding: '1.75rem 2rem',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              marginBottom: '1.5rem', width: '100%', maxWidth: '300px',
              boxSizing: 'border-box',
              boxShadow: '0 18px 45px rgba(0,0,0,0.7), 0 0 35px rgba(245,185,66,0.2)',
            }}>
              <div style={{ marginBottom: '0.85rem' }}>
                <QrRecruitSvg size={190} logoSize={38} />
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#F5B942', textTransform: 'uppercase' }}>
                SCAN TO JOIN AS AN EXPERT
              </div>
              <div style={{ fontSize: '0.85rem', color: '#FFFFFF', fontWeight: 700, marginTop: '3px' }}>
                stylecorner.world/role-selection
              </div>

              <div className="no-print" style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={() => saveToPdf('recruit')}
                  disabled={savingPdf}
                  style={{
                    backgroundColor: '#F5B942', color: '#08090C', border: 'none',
                    borderRadius: '50px', padding: '0.55rem 1.25rem',
                    fontSize: '0.8rem', fontWeight: 900, cursor: 'pointer',
                    display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                    boxShadow: '0 4px 14px rgba(245,185,66,0.4)',
                  }}
                >
                  <FileDown size={13} /> Save as PDF
                </button>
                <button
                  type="button"
                  onClick={() => copyUrl('recruit', 'https://www.stylecorner.world/role-selection')}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    color: copiedType === 'recruit' ? '#4ade80' : '#cbd5e1',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '50px', padding: '0.55rem 0.95rem',
                    fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer',
                  }}
                >
                  {copiedType === 'recruit' ? <Check size={13} /> : <Copy size={13} />}
                </button>
              </div>
            </div>

            <div style={{ fontSize: '0.78rem', color: '#6b5b30', fontWeight: 600 }}>
              StyleCorner Nigeria · Lagos &amp; Ibadan Verified Beauty &amp; Grooming Platform
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BillboardFlyersPage;

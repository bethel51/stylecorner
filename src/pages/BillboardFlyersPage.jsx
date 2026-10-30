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

  /* â”€â”€ CSS Fullscreen â”€â”€ */
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

  /* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
     saveToPdf â€” Directly generates a high-resolution, downloadable PDF
     file via jsPDF & html2canvas and saves it directly to the user's
     device / downloads folder (no printer dialog).
  â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
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
      // Show a user-friendly alert â€” never fall back to print dialog
      alert('âš ï¸ PDF export failed. Please try the "Save Image (PNG)" button instead, or open in Chrome/Edge for best results.');
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

  /* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
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
            { id: 'billboard', label: 'ðŸ™ Billboard' },
            { id: 'street', label: 'ðŸ“„ Street Flyer' },
            { id: 'recruit', label: 'âœ‚ï¸ Expert Recruit' },
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
              ? <><Loader size={13} style={{ animation: 'spin 1s linear infinite' }} /> Saving PDFâ€¦</>
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
            ðŸ“· Clean View
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
          ðŸ“· Tap anywhere to restore controls
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
          maxWidth: '680px',
        }}
      >
        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
             DESIGN 1: CUSTOMER BOOKING FLYER â€” Bold Black + Gold Blob
             Portrait A4 Â· Target: walk-in customers, social media, print
             â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        {(activeDesign === 'all' || activeDesign === 'billboard') && (
          <div style={{ width: '100%', maxWidth: '560px' }}>
            <div className="no-print" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: '0.6rem', paddingInline: '0.25rem',
            }}>
              <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
                ðŸ“‹ Customer Booking Flyer
              </span>
            </div>

            <div
              ref={billboardRef}
              className="print-card"
              data-design="billboard"
              style={{
                width: '100%',
                backgroundColor: '#09090b',
                borderRadius: '28px',
                padding: '0',
                boxShadow: '0 40px 80px rgba(0,0,0,0.9)',
                display: 'flex',
                flexDirection: 'column',
                boxSizing: 'border-box',
                position: 'relative',
                overflow: 'hidden',
                border: '1.5px solid rgba(245,185,66,0.2)',
              }}
            >
              {/* Giant gold blob top-right */}
              <div style={{
                position: 'absolute',
                top: '-80px',
                right: '-80px',
                width: '340px',
                height: '340px',
                borderRadius: '50%',
                backgroundColor: '#F5B942',
                zIndex: 0,
              }} />
              {/* Dark swoosh over blob bottom-left corner */}
              <div style={{
                position: 'absolute',
                top: '40px',
                left: '-60px',
                width: '280px',
                height: '280px',
                borderRadius: '50%',
                backgroundColor: '#09090b',
                zIndex: 1,
              }} />

              {/* Content â€” above blobs */}
              <div style={{ position: 'relative', zIndex: 2, padding: 'clamp(1.5rem,5vw,2.5rem)' }}>

                {/* Brand Badge */}
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.45rem',
                  backgroundColor: '#18181b',
                  border: '1px solid rgba(245,185,66,0.3)',
                  borderRadius: '50px',
                  padding: '0.35rem 0.9rem',
                  marginBottom: '1.75rem',
                }}>
                  <img src="/pwa-icon-192.png" alt="SC"
                    style={{ width: '18px', height: '18px', borderRadius: '4px', objectFit: 'cover' }} />
                  <span style={{
                    fontSize: '0.7rem', fontWeight: 900, color: '#F5B942',
                    letterSpacing: '0.07em', textTransform: 'uppercase',
                  }}>StyleCorner Nigeria Â· Lagos &amp; Ibadan</span>
                </div>

                {/* Two-column: headline left, QR right */}
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>

                  {/* Left column */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h1 style={{
                      fontSize: 'clamp(1.9rem,6vw,2.8rem)', fontWeight: 900,
                      lineHeight: 1.1, letterSpacing: '-0.03em',
                      color: '#ffffff', margin: '0 0 0.35rem',
                    }}>
                      Book Verified Stylists, Barbers &amp; Braiders.
                    </h1>
                    <div style={{
                      fontSize: 'clamp(1.9rem,6vw,2.8rem)', fontWeight: 900,
                      color: '#F5B942', lineHeight: 1.1,
                      letterSpacing: '-0.03em', marginBottom: '1.1rem',
                    }}>In Seconds.</div>

                    <p style={{
                      fontSize: '0.9rem', color: '#a1a1aa', lineHeight: 1.65,
                      marginBottom: '1.5rem', maxWidth: '320px',
                    }}>
                      Lagos &amp; Ibadan's premier beauty network. AI matches you with top-rated barbers, braiders, lash techs &amp; nail artists near you. In-salon or VIP home visits.
                    </p>

                    {/* Service Tags */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginBottom: '1.6rem' }}>
                      {['+ Hair Braiders', '+ Precision Barbers', '+ Lash Techs', '+ Nail Art', '+ Soft Glam Makeup', '+ Wig Frontal Install'].map((s) => (
                        <span key={s} style={{
                          backgroundColor: '#18181b',
                          border: '1px solid #27272a',
                          borderRadius: '50px',
                          padding: '0.4rem 0.9rem',
                          fontSize: '0.8rem', fontWeight: 700, color: '#e4e4e7',
                        }}>{s}</span>
                      ))}
                    </div>

                    {/* Trust Badges */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {[
                        { icon: 'ðŸ›¡ï¸', text: '100% Escrow Protected' },
                        { icon: 'â­', text: '4.9 â˜… Community Rated' },
                        { icon: 'ðŸ“', text: 'Lagos & Ibadan' },
                      ].map(({ icon, text }) => (
                        <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', fontWeight: 700, color: '#a1a1aa' }}>
                          <span style={{ fontSize: '1rem' }}>{icon}</span>
                          {text}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right column â€” QR Card */}
                  <div style={{
                    flexShrink: 0,
                    backgroundColor: '#18181b',
                    border: '1.5px solid rgba(245,185,66,0.35)',
                    borderRadius: '24px',
                    padding: '1.25rem 1rem',
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    textAlign: 'center',
                    minWidth: '160px',
                    maxWidth: '195px',
                  }}>
                    <div style={{
                      fontSize: '0.72rem', fontWeight: 900, color: '#F5B942',
                      letterSpacing: '0.06em', textTransform: 'uppercase',
                      marginBottom: '0.85rem', lineHeight: 1.3,
                    }}>âš¡ INSTANT MOBILE<br />BOOKING</div>

                    <div style={{ marginBottom: '0.85rem' }}>
                      <QrWorldSvg size={150} logoSize={30} />
                    </div>

                    <div style={{ fontSize: '0.8rem', fontWeight: 900, color: '#ffffff', marginBottom: '0.25rem', letterSpacing: '0.03em' }}>
                      SCAN WITH CAMERA
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#71717a', fontWeight: 600, marginBottom: '0.2rem' }}>
                      Point phone camera to join Â·
                    </div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 900, color: '#F5B942' }}>
                      www.stylecorner.world
                    </div>
                  </div>
                </div>

                {/* Bottom buttons */}
                <div className="no-print" style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                  <button type="button" onClick={() => saveToPdf('billboard')} disabled={savingPdf}
                    style={{
                      backgroundColor: '#F5B942', color: '#09090b', border: 'none',
                      borderRadius: '50px', padding: '0.6rem 1.4rem',
                      fontSize: '0.82rem', fontWeight: 900, cursor: 'pointer',
                      display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                    }}>
                    <FileDown size={13} /> Save as PDF
                  </button>
                  <button type="button" onClick={() => saveToImage('billboard')}
                    style={{
                      backgroundColor: '#18181b', color: '#a1a1aa',
                      border: '1px solid #27272a', borderRadius: '50px',
                      padding: '0.6rem 1.1rem', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
                      display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                    }}>
                    <ImageIcon size={13} /> Save PNG
                  </button>
                  <button type="button" onClick={() => copyUrl('billboard', 'https://www.stylecorner.world')}
                    style={{
                      backgroundColor: '#18181b', color: copiedType === 'billboard' ? '#4ade80' : '#a1a1aa',
                      border: '1px solid #27272a', borderRadius: '50px',
                      padding: '0.6rem 1rem', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
                    }}>
                    {copiedType === 'billboard' ? <Check size={13} /> : <Copy size={13} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
             DESIGN 2: STREET FLYER â€” Bold Black + Gold Blob
             Portrait A5 Â· Target: street distribution, WhatsApp, Instagram
             â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        {(activeDesign === 'all' || activeDesign === 'street') && (
          <div style={{ width: '100%', maxWidth: '560px' }}>
            <div className="no-print" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: '0.6rem', paddingInline: '0.25rem',
            }}>
              <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
                ðŸ“„ Street Flyer Â· WhatsApp / Instagram Story
              </span>
            </div>

            <div
              ref={streetRef}
              className="print-card"
              data-design="street"
              style={{
                width: '100%',
                backgroundColor: '#09090b',
                borderRadius: '28px',
                boxShadow: '0 40px 80px rgba(0,0,0,0.9)',
                display: 'flex',
                flexDirection: 'column',
                boxSizing: 'border-box',
                position: 'relative',
                overflow: 'hidden',
                border: '1.5px solid rgba(245,185,66,0.2)',
              }}
            >
              {/* Gold blob top-right */}
              <div style={{
                position: 'absolute', top: '-70px', right: '-70px',
                width: '300px', height: '300px', borderRadius: '50%',
                backgroundColor: '#F5B942', zIndex: 0,
              }} />
              {/* Dark swoosh */}
              <div style={{
                position: 'absolute', top: '50px', left: '-70px',
                width: '260px', height: '260px', borderRadius: '50%',
                backgroundColor: '#09090b', zIndex: 1,
              }} />

              <div style={{ position: 'relative', zIndex: 2, padding: 'clamp(1.5rem,5vw,2.5rem)' }}>

                {/* Brand badge */}
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.45rem',
                  backgroundColor: '#18181b', border: '1px solid rgba(245,185,66,0.3)',
                  borderRadius: '50px', padding: '0.35rem 0.9rem', marginBottom: '1rem',
                }}>
                  <img src="/pwa-icon-192.png" alt="SC"
                    style={{ width: '18px', height: '18px', borderRadius: '4px', objectFit: 'cover' }} />
                  <span style={{ fontSize: '0.7rem', fontWeight: 900, color: '#F5B942', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
                    âš¡ Nigeria's Smart Beauty Network
                  </span>
                </div>

                {/* Two-column */}
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>

                  {/* Left */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h2 style={{
                      fontSize: 'clamp(1.8rem,5.5vw,2.6rem)', fontWeight: 900,
                      lineHeight: 1.1, letterSpacing: '-0.03em',
                      color: '#ffffff', margin: '0 0 0.3rem',
                    }}>
                      Your Next Look.<br />Verified Stylist.
                    </h2>
                    <div style={{
                      fontSize: 'clamp(1.8rem,5.5vw,2.6rem)', fontWeight: 900,
                      color: '#F5B942', lineHeight: 1.1,
                      letterSpacing: '-0.03em', marginBottom: '1.1rem',
                    }}>Booked in 30s.</div>

                    <p style={{
                      fontSize: '0.88rem', color: '#a1a1aa', lineHeight: 1.65,
                      marginBottom: '1.4rem', maxWidth: '300px',
                    }}>
                      No more guessing salon quality. Get matched to vetted braiders, barbers, lash techs &amp; makeup artists in your LGA.
                    </p>

                    {/* Service Tags */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.5rem' }}>
                      {['+ Knotless Braids', '+ Fade & Beard', '+ Volume Lash', '+ Gel & Acrylic Nails', '+ Soft Glam', '+ Frontal Wig Install'].map((s) => (
                        <span key={s} style={{
                          backgroundColor: '#18181b', border: '1px solid #27272a',
                          borderRadius: '50px', padding: '0.38rem 0.85rem',
                          fontSize: '0.78rem', fontWeight: 700, color: '#e4e4e7',
                        }}>{s}</span>
                      ))}
                    </div>

                    {/* Trust */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                      {[
                        { icon: 'ðŸ“', text: 'Lagos & Ibadan' },
                        { icon: 'ðŸ›¡ï¸', text: 'Protected Escrow' },
                        { icon: 'â­', text: '4.9 â˜… Rating' },
                      ].map(({ icon, text }) => (
                        <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.81rem', fontWeight: 700, color: '#a1a1aa' }}>
                          <span style={{ fontSize: '1rem' }}>{icon}</span>{text}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* QR Card */}
                  <div style={{
                    flexShrink: 0,
                    backgroundColor: '#18181b',
                    border: '1.5px solid rgba(245,185,66,0.35)',
                    borderRadius: '22px',
                    padding: '1.1rem 0.85rem',
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    textAlign: 'center',
                    minWidth: '150px', maxWidth: '180px',
                  }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 900, color: '#F5B942', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.75rem', lineHeight: 1.3 }}>
                      âš¡ SCAN TO<br />BOOK NOW
                    </div>
                    <div style={{ marginBottom: '0.75rem' }}>
                      <QrWorldSvg size={140} logoSize={28} />
                    </div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 900, color: '#ffffff', marginBottom: '0.2rem' }}>POINT CAMERA TO SCAN</div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 900, color: '#F5B942' }}>www.stylecorner.world</div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="no-print" style={{ display: 'flex', gap: '0.5rem', marginTop: '1.4rem', flexWrap: 'wrap' }}>
                  <button type="button" onClick={() => saveToPdf('street')} disabled={savingPdf}
                    style={{
                      backgroundColor: '#F5B942', color: '#09090b', border: 'none',
                      borderRadius: '50px', padding: '0.6rem 1.4rem',
                      fontSize: '0.82rem', fontWeight: 900, cursor: 'pointer',
                      display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                    }}>
                    <FileDown size={13} /> Save as PDF
                  </button>
                  <button type="button" onClick={() => saveToImage('street')}
                    style={{
                      backgroundColor: '#18181b', color: '#a1a1aa', border: '1px solid #27272a',
                      borderRadius: '50px', padding: '0.6rem 1.1rem',
                      fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
                      display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                    }}>
                    <ImageIcon size={13} /> Save PNG
                  </button>
                  <button type="button" onClick={() => copyUrl('street', 'https://www.stylecorner.world')}
                    style={{
                      backgroundColor: '#18181b', color: copiedType === 'street' ? '#4ade80' : '#a1a1aa',
                      border: '1px solid #27272a', borderRadius: '50px',
                      padding: '0.6rem 1rem', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
                    }}>
                    {copiedType === 'street' ? <Check size={13} /> : <Copy size={13} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
             DESIGN 3: EXPERT RECRUITMENT FLYER â€” Bold Black + Gold Blob
             Portrait A4 Â· Target: barbers, braiders, lash techs, salons
             â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        {(activeDesign === 'all' || activeDesign === 'recruit') && (
          <div style={{ width: '100%', maxWidth: '560px' }}>
            <div className="no-print" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: '0.6rem', paddingInline: '0.25rem',
            }}>
              <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
                âœ‚ï¸ Expert Recruitment Flyer Â· Stylists, Barbers &amp; Braiders
              </span>
            </div>

            <div
              ref={recruitRef}
              className="print-card"
              data-design="recruit"
              style={{
                width: '100%',
                backgroundColor: '#09090b',
                borderRadius: '28px',
                boxShadow: '0 40px 80px rgba(0,0,0,0.9)',
                display: 'flex',
                flexDirection: 'column',
                boxSizing: 'border-box',
                position: 'relative',
                overflow: 'hidden',
                border: '1.5px solid rgba(245,185,66,0.2)',
              }}
            >
              {/* Gold blob top-right */}
              <div style={{
                position: 'absolute', top: '-70px', right: '-70px',
                width: '300px', height: '300px', borderRadius: '50%',
                backgroundColor: '#F5B942', zIndex: 0,
              }} />
              {/* Dark swoosh */}
              <div style={{
                position: 'absolute', top: '40px', left: '-70px',
                width: '270px', height: '270px', borderRadius: '50%',
                backgroundColor: '#09090b', zIndex: 1,
              }} />

              <div style={{ position: 'relative', zIndex: 2, padding: 'clamp(1.5rem,5vw,2.5rem)' }}>

                {/* Brand badge */}
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.45rem',
                  backgroundColor: '#18181b', border: '1px solid rgba(245,185,66,0.3)',
                  borderRadius: '50px', padding: '0.35rem 0.9rem', marginBottom: '1rem',
                }}>
                  <img src="/pwa-icon-192.png" alt="SC"
                    style={{ width: '18px', height: '18px', borderRadius: '4px', objectFit: 'cover' }} />
                  <span style={{ fontSize: '0.7rem', fontWeight: 900, color: '#F5B942', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
                    âœ‚ï¸ Calling All Beauty &amp; Grooming Professionals
                  </span>
                </div>

                {/* Two-column */}
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>

                  {/* Left */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h2 style={{
                      fontSize: 'clamp(1.8rem,5.5vw,2.6rem)', fontWeight: 900,
                      lineHeight: 1.1, letterSpacing: '-0.03em',
                      color: '#ffffff', margin: '0 0 0.3rem',
                    }}>
                      Are You a Barber, Braider or Lash Tech?
                    </h2>
                    <div style={{
                      fontSize: 'clamp(1.8rem,5.5vw,2.6rem)', fontWeight: 900,
                      color: '#F5B942', lineHeight: 1.1,
                      letterSpacing: '-0.03em', marginBottom: '1.1rem',
                    }}>Get Booked. Get Paid.</div>

                    <p style={{
                      fontSize: '0.88rem', color: '#a1a1aa', lineHeight: 1.65,
                      marginBottom: '1.4rem', maxWidth: '300px',
                    }}>
                      Join StyleCorner's verified beauty network in Lagos &amp; Ibadan. Fill your open calendar slots with high-value paying clients. Zero registration fees.
                    </p>

                    {/* Perks as tags */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.5rem' }}>
                      {['+ Instant Wallet Payouts', '+ Free Expert Profile', '+ AI Client Matching', '+ QR Code Business Card', '+ Salon or Home Service', '+ Zero Joining Fee'].map((s) => (
                        <span key={s} style={{
                          backgroundColor: '#18181b', border: '1px solid #27272a',
                          borderRadius: '50px', padding: '0.38rem 0.85rem',
                          fontSize: '0.78rem', fontWeight: 700, color: '#e4e4e7',
                        }}>{s}</span>
                      ))}
                    </div>

                    {/* Trust */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                      {[
                        { icon: 'ðŸ’°', text: 'â‚¦15,000â€“â‚¦60,000+ monthly avg earnings' },
                        { icon: 'ðŸ“', text: 'Lagos & Ibadan based' },
                        { icon: 'ðŸ›¡ï¸', text: 'Escrow protected payouts' },
                      ].map(({ icon, text }) => (
                        <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.81rem', fontWeight: 700, color: '#a1a1aa' }}>
                          <span style={{ fontSize: '1rem' }}>{icon}</span>{text}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* QR Card */}
                  <div style={{
                    flexShrink: 0,
                    backgroundColor: '#18181b',
                    border: '1.5px solid rgba(245,185,66,0.35)',
                    borderRadius: '22px',
                    padding: '1.1rem 0.85rem',
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    textAlign: 'center',
                    minWidth: '150px', maxWidth: '180px',
                  }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 900, color: '#F5B942', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.75rem', lineHeight: 1.3 }}>
                      âœ‚ï¸ SCAN TO<br />JOIN AS EXPERT
                    </div>
                    <div style={{ marginBottom: '0.75rem' }}>
                      <QrRecruitSvg size={140} logoSize={28} />
                    </div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 900, color: '#ffffff', marginBottom: '0.2rem' }}>SCAN TO APPLY â€” FREE</div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 900, color: '#F5B942', lineHeight: 1.3 }}>stylecorner.world/<br />role-selection</div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="no-print" style={{ display: 'flex', gap: '0.5rem', marginTop: '1.4rem', flexWrap: 'wrap' }}>
                  <button type="button" onClick={() => saveToPdf('recruit')} disabled={savingPdf}
                    style={{
                      backgroundColor: '#F5B942', color: '#09090b', border: 'none',
                      borderRadius: '50px', padding: '0.6rem 1.4rem',
                      fontSize: '0.82rem', fontWeight: 900, cursor: 'pointer',
                      display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                    }}>
                    <FileDown size={13} /> Save as PDF
                  </button>
                  <button type="button" onClick={() => saveToImage('recruit')}
                    style={{
                      backgroundColor: '#18181b', color: '#a1a1aa', border: '1px solid #27272a',
                      borderRadius: '50px', padding: '0.6rem 1.1rem',
                      fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
                      display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                    }}>
                    <ImageIcon size={13} /> Save PNG
                  </button>
                  <button type="button" onClick={() => copyUrl('recruit', 'https://www.stylecorner.world/role-selection')}
                    style={{
                      backgroundColor: '#18181b', color: copiedType === 'recruit' ? '#4ade80' : '#a1a1aa',
                      border: '1px solid #27272a', borderRadius: '50px',
                      padding: '0.6rem 1rem', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
                    }}>
                    {copiedType === 'recruit' ? <Check size={13} /> : <Copy size={13} />}
                  </button>
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

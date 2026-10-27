import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Check, Copy, Loader, Maximize, Minimize, X } from 'lucide-react';
import { QrWorldSvg, QrRecruitSvg } from '../components/common/QrCodeSvgs';

export const BillboardFlyersPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Read design from query (?design=...) or hash (#...)
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

  /* ── CSS Fullscreen (works on all devices including iOS Safari) ── */
  const toggleFullscreen = () => {
    // First try native Fullscreen API (desktop/Android Chrome)
    if (!isCssFullscreen && !document.fullscreenElement) {
      const el = document.documentElement;
      const req = el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen;
      if (req) {
        try {
          Promise.resolve(req.call(el)).catch(() => {
            // Native API failed (iOS) — fall back to CSS fullscreen
            setIsCssFullscreen(true);
          });
          return;
        } catch (_) { /* fall through */ }
      }
      // No native API available (iOS) — CSS fullscreen
      setIsCssFullscreen(true);
    } else if (isCssFullscreen) {
      setIsCssFullscreen(false);
    } else {
      // Native fullscreen is active — exit it
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
     saveToPdf — opens a new window, injects the card HTML + all
     computed styles, then triggers window.print().
     This approach works on ALL browsers (mobile + desktop) because:
       • It uses the native print engine — no canvas taint issues
       • No CDN dependencies — works offline
       • iOS Safari triggers the "Save to PDF" sheet natively
     ───────────────────────────────────────────────────────────────── */
  const saveToPdf = async (designType) => {
    const target = designType || activeDesign;
    setSavingPdf(true);

    // Pick the correct ref(s)
    const refMap = { billboard: billboardRef, street: streetRef, recruit: recruitRef };
    let cardEls = [];
    if (target === 'all') {
      cardEls = [billboardRef, streetRef, recruitRef]
        .map(r => r.current)
        .filter(Boolean);
    } else if (refMap[target]?.current) {
      cardEls = [refMap[target].current];
    }

    // Fallback — scan DOM
    if (cardEls.length === 0) {
      const sel = target === 'all'
        ? '.print-card'
        : `.print-card[data-design="${target}"]`;
      cardEls = Array.from(document.querySelectorAll(sel));
    }

    if (cardEls.length === 0) {
      // Last resort — just print the page
      window.print();
      setSavingPdf(false);
      return;
    }

    /* ── Build a self-contained print document ── */
    const isBillboard = (target === 'billboard');
    const pageSize = isBillboard
      ? 'size: A4 landscape; margin: 0;'
      : 'size: A4 portrait; margin: 0;';

    // Collect outer HTML of each card
    const cardsHtml = cardEls.map(el => {
      // Clone so we can remove .no-print elements
      const clone = el.cloneNode(true);
      clone.querySelectorAll('.no-print').forEach(np => np.remove());
      // Strip the data attribute so no scoping issues
      clone.style.maxWidth = '100%';
      clone.style.width = '100%';
      clone.style.borderRadius = '0';
      clone.style.margin = '0 auto';
      clone.style.boxShadow = 'none';
      return clone.outerHTML;
    }).join('<div style="page-break-after:always"></div>');

    // Google Fonts
    const fontsLink = `<link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&display=swap" />`;

    // Absolute URL for the logo image so the print window can load it
    const logoUrl = `${window.location.origin}/pwa-icon-192.png`;

    const printDoc = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>StyleCorner Flyer</title>
  ${fontsLink}
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    html, body {
      margin: 0; padding: 0;
      background: #050608;
      color: #fff;
      font-family: 'Outfit', -apple-system, sans-serif;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    @page { ${pageSize} }
    @media print {
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      body { background: #050608 !important; }
      .no-print { display: none !important; }
    }
    .print-card {
      width: 100%;
      page-break-after: always;
      break-after: page;
    }
    .print-card:last-child {
      page-break-after: avoid;
      break-after: avoid;
    }
    img { max-width: 100%; display: block; }
  </style>
</head>
<body>
  ${cardsHtml.replace(/\/pwa-icon-192\.png/g, logoUrl)}
  <script>
    // Replace any remaining relative paths
    document.querySelectorAll('img').forEach(function(img){
      if(img.src && img.src.indexOf('pwa-icon') !== -1 && !img.src.startsWith('http')) {
        img.src = '${logoUrl}';
      }
    });
    // Wait for fonts + images then print
    var ready = false;
    function doPrint() {
      if (ready) return;
      ready = true;
      setTimeout(function(){ window.print(); setTimeout(function(){ window.close(); }, 1000); }, 600);
    }
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(doPrint);
    } else {
      setTimeout(doPrint, 800);
    }
    window.onafterprint = function(){ window.close(); };
  <\/script>
</body>
</html>`;

    try {
      const pw = window.open('', '_blank', 'width=900,height=700,scrollbars=yes');
      if (pw) {
        pw.document.open();
        pw.document.write(printDoc);
        pw.document.close();
      } else {
        // Popup blocked — fall back to blob URL
        const blob = new Blob([printDoc], { type: 'text/html' });
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.target = '_blank';
        a.rel = 'noopener';
        a.click();
        setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
      }
    } catch (err) {
      console.warn('Print window failed, falling back to window.print()', err);
      window.print();
    } finally {
      setSavingPdf(false);
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
        padding: screenshotMode ? '0' : '1.25rem 1rem 3rem',
        boxSizing: 'border-box',
        /* CSS Fullscreen styles applied inline */
        ...(isCssFullscreen ? {
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          overflow: 'auto',
          padding: '0.75rem 0.5rem',
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
          .no-print,
          .print-hide,
          .flyer-toolbar,
          button { display: none !important; }
          .flyers-page-root {
            padding: 0 !important;
            margin: 0 !important;
            min-height: unset !important;
            background: #050608 !important;
            display: block !important;
          }
          .billboard-container {
            display: block !important;
            max-width: 100% !important;
            width: 100% !important;
            gap: 0 !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .print-card {
            page-break-before: auto;
            page-break-after: always;
            break-after: page;
            border-radius: 0 !important;
            box-shadow: none !important;
            margin: 0 !important;
            max-width: 100% !important;
            width: 100% !important;
          }
          .print-card:last-child {
            page-break-after: avoid !important;
            break-after: avoid !important;
          }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Floating Toolbar */}
      {!screenshotMode && (
        <div
          className="flyer-toolbar no-print"
          style={{
            position: 'sticky',
            top: '1rem',
            zIndex: 100,
            backgroundColor: 'rgba(15, 17, 24, 0.97)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(245, 185, 66, 0.4)',
            borderRadius: '50px',
            padding: '0.45rem 0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1.75rem',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.8), 0 0 20px rgba(245, 185, 66, 0.15)',
            maxWidth: '100%',
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '0.35rem',
              borderRadius: '50%',
              flexShrink: 0,
            }}
            title="Go Back"
          >
            <ArrowLeft size={16} />
          </button>

          {[
            { id: 'all', label: 'All 3', activeBg: '#F5B942', activeColor: '#08090C' },
            { id: 'billboard', label: '1. Billboard', activeBg: '#F5B942', activeColor: '#08090C' },
            { id: 'street', label: '2. Street Flyer', activeBg: '#a855f7', activeColor: '#ffffff' },
            { id: 'recruit', label: '3. Recruit', activeBg: '#10b981', activeColor: '#ffffff' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveDesign(tab.id)}
              style={{
                backgroundColor: activeDesign === tab.id ? tab.activeBg : 'transparent',
                color: activeDesign === tab.id ? tab.activeColor : '#cbd5e1',
                border: activeDesign === tab.id ? `1px solid ${tab.activeBg}` : '1px solid transparent',
                borderRadius: '50px',
                padding: '0.35rem 0.75rem',
                fontSize: '0.74rem',
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
              backgroundColor: savingPdf ? 'rgba(245, 185, 66, 0.08)' : 'rgba(245, 185, 66, 0.18)',
              color: '#F5B942',
              border: '1px solid #F5B942',
              borderRadius: '50px',
              padding: '0.35rem 0.9rem',
              fontSize: '0.74rem',
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
              ? <><Loader size={13} style={{ animation: 'spin 1s linear infinite' }} /> Preparing…</>
              : <><Download size={13} /> Save to PDF</>
            }
          </button>

          {/* View Full Screen */}
          <button
            type="button"
            onClick={toggleFullscreen}
            style={{
              backgroundColor: isFullscreen ? 'rgba(245, 185, 66, 0.2)' : 'rgba(255, 255, 255, 0.08)',
              color: isFullscreen ? '#F5B942' : '#ffffff',
              border: isFullscreen ? '1px solid #F5B942' : '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '50px',
              padding: '0.35rem 0.85rem',
              fontSize: '0.74rem',
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
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              color: '#94a3b8',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '50px',
              padding: '0.35rem 0.8rem',
              fontSize: '0.74rem',
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
            position: 'fixed',
            bottom: '1rem',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            border: '1px solid #F5B942',
            color: '#F5B942',
            padding: '0.5rem 1.25rem',
            borderRadius: '50px',
            fontSize: '0.78rem',
            fontWeight: 800,
            cursor: 'pointer',
            zIndex: 9999,
          }}
        >
          📷 Tap anywhere to restore controls
        </div>
      )}

      {/* ── CSS Fullscreen Exit Button (always visible when in CSS fullscreen) ── */}
      {isCssFullscreen && (
        <button
          type="button"
          onClick={() => setIsCssFullscreen(false)}
          className="no-print"
          style={{
            position: 'fixed',
            top: '0.75rem',
            right: '0.75rem',
            zIndex: 10001,
            background: 'rgba(245, 185, 66, 0.9)',
            color: '#08090C',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(0,0,0,0.5)',
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
          maxWidth: '1100px',
        }}
      >
        {/* ══════════════════════════════════════════════════════════════════
             DESIGN 1: WIDE LUXURY BILLBOARD (16:9 / Landscape)
             ══════════════════════════════════════════════════════════════════ */}
        {(activeDesign === 'all' || activeDesign === 'billboard') && (
          <div
            ref={billboardRef}
            className="print-card"
            data-design="billboard"
            style={{
              width: '100%',
              maxWidth: '1080px',
              background: 'radial-gradient(circle at 85% 20%, rgba(245, 185, 66, 0.18) 0%, transparent 45%), linear-gradient(135deg, #0d0f16 0%, #08090d 60%, #050608 100%)',
              border: '2px solid rgba(245, 185, 66, 0.45)',
              borderRadius: '32px',
              padding: 'clamp(1.5rem, 4vw, 3.5rem)',
              boxShadow: '0 35px 80px -15px rgba(0, 0, 0, 0.95), 0 0 50px rgba(245, 185, 66, 0.15)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
              gap: '2.5rem',
              alignItems: 'center',
              boxSizing: 'border-box',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.55rem',
                  backgroundColor: 'rgba(245, 185, 66, 0.12)',
                  border: '1px solid rgba(245, 185, 66, 0.35)',
                  borderRadius: '50px',
                  padding: '0.4rem 1rem',
                  marginBottom: '1.25rem',
                }}
              >
                <img
                  src="/pwa-icon-192.png"
                  alt="StyleCorner"
                  style={{ width: '22px', height: '22px', borderRadius: '5px', objectFit: 'cover' }}
                />
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#F5B942', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  StyleCorner Nigeria · Lagos &amp; Ibadan
                </span>
              </div>

              <h1
                style={{
                  fontSize: 'clamp(2rem, 4.5vw, 3.2rem)',
                  fontWeight: 900,
                  lineHeight: 1.1,
                  letterSpacing: '-0.035em',
                  marginBottom: '1.2rem',
                }}
              >
                Book Verified Stylists, Barbers &amp; Braiders. <br />
                <span
                  style={{
                    background: 'linear-gradient(135deg, #F5B942 0%, #ffc857 40%, #e8891d 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  In Seconds.
                </span>
              </h1>

              <p style={{ fontSize: '1rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: '1.8rem', maxWidth: '580px' }}>
                Lagos &amp; Ibadan's premier beauty network. AI matches you with top-rated barbers, braiders, lash techs &amp; nail artists near you. In-salon or VIP home visits.
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.55rem', marginBottom: '1.75rem' }}>
                {['✦ Hair Braiders', '✦ Precision Barbers', '✦ Lash Techs', '✦ Nail Art', '✦ Soft Glam Makeup', '✦ Wig Frontal Install'].map((p) => (
                  <span
                    key={p}
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '50px',
                      padding: '0.4rem 0.95rem',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      color: '#e2e8f0',
                    }}
                  >
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
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1.5px solid rgba(245, 185, 66, 0.35)',
                borderRadius: '26px',
                padding: '2rem 1.5rem',
                textAlign: 'center',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
              }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  backgroundColor: '#F5B942',
                  color: '#08090C',
                  fontSize: '0.8rem',
                  fontWeight: 900,
                  padding: '0.4rem 1.1rem',
                  borderRadius: '50px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  marginBottom: '1rem',
                }}
              >
                ⚡ Instant Mobile Booking
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <QrWorldSvg size={210} logoSize={42} />
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
                    backgroundColor: '#F5B942',
                    color: '#08090C',
                    border: 'none',
                    borderRadius: '50px',
                    padding: '0.55rem 1.25rem',
                    fontSize: '0.8rem',
                    fontWeight: 900,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <Download size={13} /> Save to PDF
                </button>
                <button
                  type="button"
                  onClick={() => copyUrl('billboard', 'https://www.stylecorner.world')}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    color: copiedType === 'billboard' ? '#4ade80' : '#cbd5e1',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '50px',
                    padding: '0.55rem 0.95rem',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {copiedType === 'billboard' ? <Check size={13} /> : <Copy size={13} />}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
             DESIGN 2: PORTRAIT STREET FLYER & POSTER (Vertical 4:5 / 9:16)
             ══════════════════════════════════════════════════════════════════ */}
        {(activeDesign === 'all' || activeDesign === 'street') && (
          <div
            ref={streetRef}
            className="print-card"
            data-design="street"
            style={{
              width: '100%',
              maxWidth: '620px',
              background: 'radial-gradient(circle at 50% 10%, rgba(168, 85, 247, 0.28) 0%, transparent 55%), linear-gradient(180deg, #150d24 0%, #0d0817 65%, #06040a 100%)',
              border: '2.5px solid rgba(168, 85, 247, 0.5)',
              borderRadius: '36px',
              padding: 'clamp(1.75rem, 5vw, 3rem) clamp(1.25rem, 4vw, 2.5rem)',
              boxShadow: '0 40px 90px -15px rgba(0, 0, 0, 0.95), 0 0 50px rgba(168, 85, 247, 0.22)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              boxSizing: 'border-box',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
              <img
                src="/pwa-icon-192.png"
                alt="StyleCorner"
                style={{ width: '44px', height: '44px', borderRadius: '14px', objectFit: 'cover' }}
              />
              <span style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.02em', color: '#FFFFFF' }}>
                StyleCorner
              </span>
            </div>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: 'rgba(168, 85, 247, 0.16)',
                border: '1px solid rgba(168, 85, 247, 0.45)',
                borderRadius: '50px',
                padding: '0.35rem 0.9rem',
                marginBottom: '1.2rem',
                fontSize: '0.74rem',
                fontWeight: 800,
                color: '#c084fc',
                textTransform: 'uppercase',
              }}
            >
              ⚡ Nigeria's Smart Beauty Network
            </div>

            <h2
              style={{
                fontSize: 'clamp(2rem, 5.5vw, 2.8rem)',
                fontWeight: 900,
                lineHeight: 1.12,
                letterSpacing: '-0.035em',
                marginBottom: '1rem',
              }}
            >
              Your Next Look. <br />
              <span
                style={{
                  background: 'linear-gradient(135deg, #c084fc 0%, #a855f7 50%, #f472b6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Verified Stylist.
              </span> <br />
              Booked In 30s.
            </h2>

            <p style={{ fontSize: '0.95rem', color: '#94a3b8', lineHeight: 1.6, maxWidth: '440px', marginBottom: '1.5rem' }}>
              No more guessing salon quality. Get matched to vetted braiders, barbers, lash techs &amp; makeup artists in your LGA across Lagos &amp; Ibadan.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.75rem' }}>
              {['✦ Knotless Braids', '✦ Fade & Beard Trim', '✦ Volume Lash Tech', '✦ Gel & Acrylic Nails', '✦ Soft Glam Makeup', '✦ Frontal Wig Install'].map((s) => (
                <span
                  key={s}
                  style={{
                    backgroundColor: 'rgba(168, 85, 247, 0.1)',
                    border: '1px solid rgba(168, 85, 247, 0.35)',
                    borderRadius: '50px',
                    padding: '0.35rem 0.85rem',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: '#e9d5ff',
                  }}
                >
                  {s}
                </span>
              ))}
            </div>

            {/* Prominent QR Box */}
            <div
              style={{
                backgroundColor: 'rgba(168, 85, 247, 0.12)',
                border: '2px solid rgba(168, 85, 247, 0.55)',
                borderRadius: '28px',
                padding: '1.75rem 2rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginBottom: '1.5rem',
                width: '100%',
                maxWidth: '320px',
                boxSizing: 'border-box',
                boxShadow: '0 18px 45px rgba(0, 0, 0, 0.7), 0 0 35px rgba(168, 85, 247, 0.25)',
              }}
            >
              <div style={{ marginBottom: '0.85rem' }}>
                <QrWorldSvg size={200} logoSize={40} />
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#c084fc', letterSpacing: '0.04em' }}>
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
                    backgroundColor: '#a855f7',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '50px',
                    padding: '0.55rem 1.25rem',
                    fontSize: '0.8rem',
                    fontWeight: 900,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    boxShadow: '0 4px 14px rgba(168,85,247,0.4)',
                  }}
                >
                  <Download size={13} /> Save to PDF
                </button>
                <button
                  type="button"
                  onClick={() => copyUrl('street', 'https://www.stylecorner.world')}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    color: copiedType === 'street' ? '#4ade80' : '#cbd5e1',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '50px',
                    padding: '0.55rem 0.95rem',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {copiedType === 'street' ? <Check size={13} /> : <Copy size={13} />}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1.25rem', color: '#64748b', fontSize: '0.78rem', fontWeight: 700 }}>
              <span>📍 Lagos &amp; Ibadan</span>
              <span>🛡️ Protected Escrow</span>
              <span>⭐ 4.9 ★ Rating</span>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
             DESIGN 3: STYLIST & SALON RECRUITMENT POSTER
             ══════════════════════════════════════════════════════════════════ */}
        {(activeDesign === 'all' || activeDesign === 'recruit') && (
          <div
            ref={recruitRef}
            className="print-card"
            data-design="recruit"
            style={{
              width: '100%',
              maxWidth: '640px',
              background: 'radial-gradient(circle at 50% 10%, rgba(16, 185, 129, 0.28) 0%, transparent 55%), linear-gradient(180deg, #0a1f14 0%, #07150d 65%, #040a06 100%)',
              border: '2.5px solid rgba(16, 185, 129, 0.5)',
              borderRadius: '36px',
              padding: 'clamp(1.75rem, 5vw, 3rem) clamp(1.25rem, 4vw, 2.5rem)',
              boxShadow: '0 40px 90px -15px rgba(0, 0, 0, 0.95), 0 0 50px rgba(16, 185, 129, 0.22)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              boxSizing: 'border-box',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
              <img
                src="/pwa-icon-192.png"
                alt="StyleCorner"
                style={{ width: '44px', height: '44px', borderRadius: '14px', objectFit: 'cover' }}
              />
              <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#FFFFFF' }}>
                StyleCorner
              </span>
            </div>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: 'rgba(16, 185, 129, 0.16)',
                border: '1px solid rgba(16, 185, 129, 0.45)',
                borderRadius: '50px',
                padding: '0.35rem 0.9rem',
                marginBottom: '1.2rem',
                fontSize: '0.74rem',
                fontWeight: 800,
                color: '#4ade80',
                textTransform: 'uppercase',
              }}
            >
              ✂️ Calling All Beauty &amp; Grooming Professionals
            </div>

            <h2
              style={{
                fontSize: 'clamp(1.8rem, 5vw, 2.6rem)',
                fontWeight: 900,
                lineHeight: 1.15,
                letterSpacing: '-0.035em',
                marginBottom: '1rem',
              }}
            >
              Are You a Barber, Braider, Lash Tech or Stylist? <br />
              <span
                style={{
                  background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 50%, #10b981 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Get Booked. Get Paid.
              </span>
            </h2>

            <p style={{ fontSize: '0.95rem', color: '#94a3b8', lineHeight: 1.5, maxWidth: '440px', marginBottom: '1.75rem' }}>
              Join StyleCorner's verified beauty network in Lagos &amp; Ibadan. Fill your open calendar slots with high-value clients.
            </p>

            {/* 4 Value Points */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '0.75rem',
                width: '100%',
                marginBottom: '1.75rem',
              }}
            >
              {[
                { title: '💰 Instant Wallet Payouts', desc: 'Direct escrow release upon service completion.' },
                { title: '📍 Direct Local Clients', desc: 'Matched near your neighborhood and LGA.' },
                { title: '🏠 Salon or Home Service', desc: 'Host station or offer VIP mobile visits.' },
                { title: '⭐ Free Verification', desc: 'Zero registration or onboarding fee.' },
              ].map((feat) => (
                <div
                  key={feat.title}
                  style={{
                    backgroundColor: 'rgba(16, 185, 129, 0.08)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    borderRadius: '16px',
                    padding: '0.9rem',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#4ade80', marginBottom: '0.2rem' }}>
                    {feat.title}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', lineHeight: 1.4 }}>
                    {feat.desc}
                  </div>
                </div>
              ))}
            </div>

            {/* Recruitment QR Code */}
            <div
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                border: '2px solid rgba(16, 185, 129, 0.55)',
                borderRadius: '28px',
                padding: '1.75rem 2rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginBottom: '1.5rem',
                width: '100%',
                maxWidth: '320px',
                boxSizing: 'border-box',
                boxShadow: '0 18px 45px rgba(0, 0, 0, 0.7), 0 0 35px rgba(16, 185, 129, 0.25)',
              }}
            >
              <div style={{ marginBottom: '0.85rem' }}>
                <QrRecruitSvg size={200} logoSize={40} />
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#4ade80', textTransform: 'uppercase' }}>
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
                    backgroundColor: '#10b981',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '50px',
                    padding: '0.55rem 1.25rem',
                    fontSize: '0.8rem',
                    fontWeight: 900,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    boxShadow: '0 4px 14px rgba(16,185,129,0.4)',
                  }}
                >
                  <Download size={13} /> Save to PDF
                </button>
                <button
                  type="button"
                  onClick={() => copyUrl('recruit', 'https://www.stylecorner.world/role-selection')}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    color: copiedType === 'recruit' ? '#4ade80' : '#cbd5e1',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '50px',
                    padding: '0.55rem 0.95rem',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {copiedType === 'recruit' ? <Check size={13} /> : <Copy size={13} />}
                </button>
              </div>
            </div>

            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
              StyleCorner Nigeria · Lagos &amp; Ibadan Verified Beauty &amp; Grooming Platform
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BillboardFlyersPage;

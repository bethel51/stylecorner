import React from 'react';
import { FileDown, Image as ImageIcon, Check, Copy } from 'lucide-react';
import { QrWorldSvg, QrRecruitSvg } from './QrCodeSvgs';

/* ─────────────────────────────────────────────────────────────────────────────
   PHONE SHOWCASE FLYER CARD — Matching Reference Flyer Style
   Features:
   - Person holding smartphone forward with hands, rings & manicured nails
   - Girl 1 (Customer), Boy (Expert Recruit), Girl 2 (VIP Glam)
   - Smartphone screen with StyleCorner squircle emblem & live QR code
   - Floating feature pills orbiting around the phone with drop shadows
   - Hand-drawn callout oval with directional arrow (like "Join Us Now!!")
   - Full PDF and high-res PNG export compatibility
───────────────────────────────────────────────────────────────────────────── */

export const PhoneShowcaseFlyerCard = React.forwardRef(({
  flyer,
  onSavePdf,
  onSaveImage,
  onCopyLink,
  copied,
  savingPdf
}, ref) => {
  const isExpert = flyer.id === 'showcase-expert-boy';
  const isGirl1 = flyer.characterType === 'girl-1';
  const isBoy = flyer.characterType === 'boy-1';
  const isGirl2 = flyer.characterType === 'girl-2';

  return (
    <div
      ref={ref}
      className="print-card phone-showcase-card"
      data-design={flyer.id}
      style={{
        width: '100%',
        backgroundColor: '#07080c',
        backgroundImage: 'radial-gradient(circle at 50% 48%, #1f1a0e 0%, #10121b 48%, #050609 100%)',
        borderRadius: '32px',
        border: '1.5px solid rgba(245, 185, 66, 0.35)',
        boxShadow: '0 35px 100px rgba(0,0,0,0.96), 0 0 50px rgba(245,185,66,0.12)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 'clamp(1.5rem, 4vw, 2.75rem) clamp(1rem, 3.5vw, 2.25rem) 2rem',
        boxSizing: 'border-box',
        color: '#ffffff',
        fontFamily: "'Outfit', -apple-system, sans-serif",
      }}
    >
      {/* Top & Bottom Gold Razor Accent Bars */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3.5px', background: 'linear-gradient(90deg, #F5B942, #c8930a, #F5B942)', zIndex: 10 }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3.5px', background: 'linear-gradient(90deg, #F5B942, #c8930a, #F5B942)', zIndex: 10 }} />

      {/* ── 1. Top Brand Pill (Center) ── */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.6rem',
        backgroundColor: 'rgba(18, 20, 28, 0.95)',
        border: '1.5px solid rgba(245, 185, 66, 0.55)',
        borderRadius: '100px',
        padding: '0.4rem 1.25rem 0.4rem 0.5rem',
        marginBottom: '1.25rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
        zIndex: 5,
      }}>
        {/* Gold Squircle Emblem */}
        <div style={{
          width: '26px',
          height: '26px',
          borderRadius: '7px',
          background: 'linear-gradient(135deg, #FFF3C4 0%, #F5B942 50%, #C8930A 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '2.5px',
            border: '2px solid #09090b',
          }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 900, color: '#F5B942', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            {flyer.badgeTop}
          </span>
          <span style={{ fontSize: '0.6rem', fontWeight: 800, color: '#d4af37', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            {flyer.badgeSub}
          </span>
        </div>
      </div>

      {/* ── 2. Bold Headline & Subtitle ── */}
      <div style={{ textAlign: 'center', maxWidth: '580px', marginBottom: '1.5rem', zIndex: 5 }}>
        <h1 style={{
          fontSize: 'clamp(1.85rem, 5vw, 2.65rem)',
          fontWeight: 900,
          lineHeight: 1.12,
          letterSpacing: '-0.035em',
          margin: '0 0 0.35rem',
          color: '#ffffff',
          textShadow: '0 2px 20px rgba(0,0,0,0.7)',
        }}>
          {flyer.headlineWhite}{' '}
          <span style={{
            color: '#F5B942',
            textShadow: '0 0 35px rgba(245,185,66,0.45)',
            display: 'inline-block',
          }}>
            {flyer.headlineGold}
          </span>
        </h1>
        <p style={{
          fontSize: 'clamp(0.82rem, 2.2vw, 0.94rem)',
          color: '#cbd5e1',
          lineHeight: 1.55,
          margin: '0 auto',
          maxWidth: '480px',
          fontWeight: 500,
        }}>
          {flyer.description}
        </p>
      </div>

      {/* ── 3. HERO CENTER STAGE: CHARACTER HOLDING PHONE + ORBITING PILLS ── */}
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '560px',
        minHeight: '430px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0.5rem 0 1.5rem',
      }}>

        {/* ── Left Orbiting Floating Pills ── */}
        <div style={{
          position: 'absolute',
          left: 'clamp(0px, 2vw, 12px)',
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          zIndex: 8,
        }}>
          {flyer.floatingPillsLeft.map((pill, idx) => (
            <div
              key={pill}
              style={{
                backgroundColor: '#ffffff',
                color: '#08090C',
                padding: '0.48rem 0.95rem',
                borderRadius: '50px',
                fontSize: 'clamp(0.72rem, 1.8vw, 0.82rem)',
                fontWeight: 800,
                boxShadow: '0 12px 28px rgba(0,0,0,0.65), 0 0 12px rgba(245,185,66,0.18)',
                border: '1.5px solid rgba(245,185,66,0.45)',
                whiteSpace: 'nowrap',
                transform: `rotate(${idx % 2 === 0 ? -4 : 2}deg)`,
                letterSpacing: '-0.01em',
              }}
            >
              {pill}
            </div>
          ))}

          {/* Sketchy "Join Us Now!!" Oval Callout with Arrow (Matching Reference) */}
          <div style={{
            position: 'relative',
            marginTop: '0.2rem',
            alignSelf: 'flex-start',
            transform: 'rotate(-6deg)',
          }}>
            <div style={{
              border: '2px dashed #F5B942',
              borderRadius: '50px',
              padding: '0.35rem 0.85rem',
              backgroundColor: 'rgba(245, 185, 66, 0.15)',
              color: '#F5B942',
              fontSize: '0.74rem',
              fontWeight: 900,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              boxShadow: '0 0 15px rgba(245,185,66,0.3)',
            }}>
              {flyer.calloutText} ➔
            </div>
          </div>
        </div>

        {/* ── Right Orbiting Floating Pills ── */}
        <div style={{
          position: 'absolute',
          right: 'clamp(0px, 2vw, 12px)',
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          alignItems: 'flex-end',
          zIndex: 8,
        }}>
          {flyer.floatingPillsRight.map((pill, idx) => (
            <div
              key={pill}
              style={{
                backgroundColor: '#ffffff',
                color: '#08090C',
                padding: '0.48rem 0.95rem',
                borderRadius: '50px',
                fontSize: 'clamp(0.72rem, 1.8vw, 0.82rem)',
                fontWeight: 800,
                boxShadow: '0 12px 28px rgba(0,0,0,0.65), 0 0 12px rgba(245,185,66,0.18)',
                border: '1.5px solid rgba(245,185,66,0.45)',
                whiteSpace: 'nowrap',
                transform: `rotate(${idx % 2 === 0 ? 3 : -3}deg)`,
                letterSpacing: '-0.01em',
              }}
            >
              {pill}
            </div>
          ))}
        </div>

        {/* ── CENTER VECTOR CHARACTER HOLDING SMARTPHONE ── */}
        <div style={{
          position: 'relative',
          width: '260px',
          height: '420px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 4,
        }}>
          {/* Character Shoulders & Hair Silhouette Behind Phone */}
          <svg
            viewBox="0 0 260 420"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          >
            {/* Ambient Backlight Rim Glow */}
            <defs>
              <radialGradient id={`glow-${flyer.id}`} cx="50%" cy="45%" r="50%">
                <stop offset="0%" stopColor="#F5B942" stopOpacity="0.4" />
                <stop offset="60%" stopColor="#c8930a" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#07080c" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx="130" cy="180" r="120" fill={`url(#glow-${flyer.id})`} />

            {/* Character Shoulders (Sweater / Top) */}
            <path
              d="M20 420 Q130 330 240 420 L240 420 L20 420 Z"
              fill={isBoy ? '#161924' : isGirl2 ? '#1c1524' : '#141c2c'}
              stroke="rgba(245, 185, 66, 0.25)"
              strokeWidth="2"
            />

            {/* Character Head & Hair Above Phone */}
            {isBoy ? (
              // Boy: Sharp male fade & lineup
              <g>
                {/* Neck */}
                <rect x="110" y="55" width="40" height="40" fill="#6a3e22" />
                {/* Head */}
                <ellipse cx="130" cy="55" rx="36" ry="42" fill="#784728" />
                {/* Crisp Hairline Fade */}
                <path d="M94 50 Q130 30 166 50 Q160 18 130 18 Q100 18 94 50 Z" fill="#090a0f" />
                {/* Hair Curls Texture */}
                <circle cx="115" cy="24" r="7" fill="#090a0f" />
                <circle cx="130" cy="22" r="7.5" fill="#090a0f" />
                <circle cx="145" cy="24" r="7" fill="#090a0f" />
              </g>
            ) : isGirl2 ? (
              // Girl 2 (VIP Glam): Long Goddess Braids with gold cuffs
              <g>
                <rect x="110" y="55" width="40" height="40" fill="#6d4125" />
                <ellipse cx="130" cy="55" rx="38" ry="44" fill="#7a4b2c" />
                {/* Flowing Braids on sides */}
                <path d="M92 48 Q70 120 74 240" stroke="#090a0f" strokeWidth="14" fill="none" strokeLinecap="round" />
                <path d="M168 48 Q190 120 186 240" stroke="#090a0f" strokeWidth="14" fill="none" strokeLinecap="round" />
                {/* Gold Hair Cuffs */}
                <rect x="68" y="110" width="12" height="8" rx="2" fill="#F5B942" />
                <rect x="180" y="110" width="12" height="8" rx="2" fill="#F5B942" />
                <rect x="70" y="180" width="12" height="8" rx="2" fill="#F5B942" />
                <rect x="178" y="180" width="12" height="8" rx="2" fill="#F5B942" />
              </g>
            ) : (
              // Girl 1 (Customer): Sleek center-part afro puffs / sleek hair
              <g>
                <rect x="110" y="55" width="40" height="40" fill="#6e4226" />
                <ellipse cx="130" cy="55" rx="36" ry="42" fill="#7d4c2d" />
                {/* Center Part Hair */}
                <path d="M94 52 Q130 32 166 52 Q164 22 130 22 Q96 22 94 52 Z" fill="#090a0f" />
                <circle cx="86" cy="36" r="22" fill="#090a0f" />
                <circle cx="174" cy="36" r="22" fill="#090a0f" />
                {/* Gold Hoop Earrings */}
                <circle cx="92" cy="74" r="8" stroke="#F5B942" strokeWidth="2.5" fill="none" />
                <circle cx="168" cy="74" r="8" stroke="#F5B942" strokeWidth="2.5" fill="none" />
              </g>
            )}
          </svg>

          {/* ── THE CENTER SMARTPHONE WITH STYLECORNER DISPLAY ── */}
          <div
            style={{
              position: 'relative',
              width: '185px',
              height: '315px',
              backgroundColor: '#0a0b10',
              borderRadius: '34px',
              border: '3.5px solid #F5B942',
              boxShadow: '0 25px 70px rgba(0,0,0,0.95), 0 0 40px rgba(245,185,66,0.22)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxSizing: 'border-box',
              zIndex: 3,
            }}
          >
            {/* Phone Speaker Notch */}
            <div style={{
              width: '55px',
              height: '5px',
              backgroundColor: '#000000',
              borderRadius: '3px',
              marginTop: '8px',
              marginBottom: '6px',
            }} />

            {/* Phone Screen Display (Crisp White Screen Matching Reference Image) */}
            <div style={{
              flex: 1,
              width: 'calc(100% - 10px)',
              backgroundColor: '#ffffff',
              borderRadius: '26px',
              marginBottom: '6px',
              padding: '10px 8px 8px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              boxSizing: 'border-box',
              overflow: 'hidden',
            }}>
              {/* App Header Logo Pill */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                marginBottom: '6px',
              }}>
                <div style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '5px',
                  backgroundColor: '#090a0f',
                  border: '1.5px solid #F5B942',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <div style={{ width: '7px', height: '7px', borderRadius: '1.5px', border: '1.5px solid #F5B942' }} />
                </div>
                <span style={{ fontSize: '0.7rem', fontWeight: 900, color: '#090a0f', letterSpacing: '0.04em' }}>
                  {isExpert ? 'STYLECORNER PRO' : 'STYLECORNER'}
                </span>
              </div>

              {/* Vector High-Res QR Code */}
              <div style={{ marginBottom: '6px' }}>
                {flyer.qrType === 'recruit' ? (
                  <QrRecruitSvg size={140} logoSize={30} />
                ) : (
                  <QrWorldSvg size={140} logoSize={30} />
                )}
              </div>

              {/* Scan With Camera Text */}
              <div style={{
                fontSize: '0.78rem',
                fontWeight: 900,
                color: '#090a0f',
                letterSpacing: '0.04em',
                lineHeight: 1.15,
                marginBottom: '2px',
              }}>
                {isExpert ? 'SCAN TO JOIN AS EXPERT' : 'SCAN WITH CAMERA'}
              </div>

              <div style={{
                fontSize: '0.64rem',
                color: '#64748b',
                fontWeight: 600,
                marginBottom: '2px',
              }}>
                Point phone camera to join ·
              </div>

              <div style={{
                fontSize: '0.72rem',
                fontWeight: 900,
                color: '#c8930a',
                letterSpacing: '0.01em',
              }}>
                {flyer.cardUrl}
              </div>
            </div>
          </div>

          {/* ── HANDS HOLDING PHONE SIDES (WITH RINGS & MANICURED NAILS) ── */}
          <svg
            viewBox="0 0 260 420"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              zIndex: 5,
            }}
          >
            {/* Left Hand Fingers Wrapping Phone Edge (X: 30 to 45, Y: 150 to 270) */}
            <g>
              {/* Left Wrist with Jewelry */}
              <path d="M12 370 Q30 320 38 270" stroke={isBoy ? '#6a3e22' : '#7a4b2c'} strokeWidth="24" strokeLinecap="round" fill="none" />
              {isBoy ? (
                // Gold Rolex-style Watch on wrist
                <rect x="18" y="325" width="22" height="12" rx="4" fill="#F5B942" stroke="#c8930a" strokeWidth="1" />
              ) : (
                // Stacked Gold Bangles
                <g>
                  <path d="M16 325 Q32 318 42 322" stroke="#F5B942" strokeWidth="3" fill="none" />
                  <path d="M18 333 Q34 326 44 330" stroke="#F5B942" strokeWidth="3" fill="none" />
                </g>
              )}

              {/* 4 Fingers Clasping Left Bezel */}
              {[
                { y: 172, len: 26, nail: true, ring: true },
                { y: 198, len: 28, nail: true, ring: false },
                { y: 224, len: 28, nail: true, ring: true },
                { y: 250, len: 24, nail: true, ring: false },
              ].map((f, i) => (
                <g key={`lf-${i}`}>
                  {/* Finger */}
                  <rect
                    x={38}
                    y={f.y - 7}
                    width={f.len}
                    height="14"
                    rx="7"
                    fill={isBoy ? '#6a3e22' : '#7a4b2c'}
                  />
                  {/* Gold Ring */}
                  {f.ring && (
                    <rect x={44} y={f.y - 7} width="5" height="14" fill="#F5B942" />
                  )}
                  {/* Manicured Nail Overlapping Bezel */}
                  <ellipse
                    cx={38 + f.len - 3}
                    cy={f.y}
                    rx="5"
                    ry="5.5"
                    fill={isBoy ? '#523019' : isGirl2 ? '#F5B942' : '#ffffff'}
                    stroke={isGirl2 ? '#ffffff' : '#e2e8f0'}
                    strokeWidth="0.8"
                  />
                </g>
              ))}
            </g>

            {/* Right Hand Fingers Wrapping Phone Edge (X: 215 to 228, Y: 150 to 270) */}
            <g>
              {/* Right Wrist with Jewelry */}
              <path d="M248 370 Q230 320 222 270" stroke={isBoy ? '#6a3e22' : '#7a4b2c'} strokeWidth="24" strokeLinecap="round" fill="none" />
              {!isBoy && (
                <path d="M244 328 Q228 322 218 326" stroke="#F5B942" strokeWidth="3" fill="none" />
              )}

              {/* 4 Fingers Clasping Right Bezel */}
              {[
                { y: 172, len: 26, ring: false },
                { y: 198, len: 28, ring: true },
                { y: 224, len: 28, ring: false },
                { y: 250, len: 24, ring: true },
              ].map((f, i) => (
                <g key={`rf-${i}`}>
                  {/* Finger */}
                  <rect
                    x={222 - f.len}
                    y={f.y - 7}
                    width={f.len}
                    height="14"
                    rx="7"
                    fill={isBoy ? '#6a3e22' : '#7a4b2c'}
                  />
                  {/* Gold Ring */}
                  {f.ring && (
                    <rect x={222 - f.len + 12} y={f.y - 7} width="5" height="14" fill="#F5B942" />
                  )}
                  {/* Manicured Nail Overlapping Bezel */}
                  <ellipse
                    cx={222 - f.len + 3}
                    cy={f.y}
                    rx="5"
                    ry="5.5"
                    fill={isBoy ? '#523019' : isGirl2 ? '#F5B942' : '#ffffff'}
                    stroke={isGirl2 ? '#ffffff' : '#e2e8f0'}
                    strokeWidth="0.8"
                  />
                </g>
              ))}
            </g>
          </svg>
        </div>
      </div>

      {/* ── 4. Bottom Trust & Value Guarantee Bar ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: 'clamp(0.6rem, 2vw, 1.25rem)',
        padding: '0.85rem 1.4rem',
        backgroundColor: 'rgba(18, 20, 28, 0.95)',
        border: '1px solid rgba(245, 185, 66, 0.35)',
        borderRadius: '50px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        marginTop: '0.5rem',
        zIndex: 5,
      }}>
        {flyer.trustPoints.map(({ icon, text }) => (
          <div
            key={text}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              fontSize: 'clamp(0.74rem, 1.9vw, 0.84rem)',
              fontWeight: 800,
              color: '#e2e8f0',
            }}
          >
            <span>{icon}</span>
            <span>{text}</span>
          </div>
        ))}
      </div>

      {/* ── 5. Action Buttons (Hidden when printing or exporting to PDF/PNG) ── */}
      <div
        className="no-print"
        style={{
          display: 'flex',
          gap: '0.55rem',
          marginTop: '1.5rem',
          flexWrap: 'wrap',
          justifyContent: 'center',
          paddingTop: '1.1rem',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          width: '100%',
          zIndex: 10,
        }}
      >
        <button
          type="button"
          onClick={() => onSavePdf(flyer.id)}
          disabled={savingPdf}
          style={{
            background: 'linear-gradient(135deg, #F5B942 0%, #C8930A 100%)',
            color: '#08090C',
            border: 'none',
            borderRadius: '50px',
            padding: '0.58rem 1.35rem',
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
          onClick={() => onSaveImage(flyer.id)}
          style={{
            backgroundColor: 'rgba(24,24,28,0.95)',
            color: '#e2e8f0',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '50px',
            padding: '0.58rem 1.15rem',
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
          onClick={() => onCopyLink(flyer.id, flyer.fullUrl)}
          style={{
            backgroundColor: 'rgba(24,24,28,0.95)',
            color: copied === flyer.id ? '#4ade80' : '#e2e8f0',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '50px',
            padding: '0.58rem 1rem',
            fontSize: '0.82rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          {copied === flyer.id ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy Link</>}
        </button>
      </div>
    </div>
  );
});

PhoneShowcaseFlyerCard.displayName = 'PhoneShowcaseFlyerCard';
export default PhoneShowcaseFlyerCard;

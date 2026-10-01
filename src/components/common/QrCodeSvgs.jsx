import React from 'react';

/**
 * 100% Inline Vector SVG QR code for https://www.stylecorner.world
 * Embedded with zero external network requests so it renders reliably on all mobile devices and offline.
 */
export const QrWorldSvg = ({ size = 180, showLogo = true, logoSize = 36 }) => (
  <div
    style={{
      width: `${size}px`,
      height: `${size}px`,
      backgroundColor: '#ffffff',
      borderRadius: Math.max(10, Math.round(size * 0.08)) + 'px',
      padding: Math.max(6, Math.round(size * 0.04)) + 'px',
      position: 'relative',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
      boxSizing: 'border-box',
    }}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 37 37"
      shapeRendering="crispEdges"
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      <path fill="#ffffff" d="M0 0h37v37H0z" />
      <path
        stroke="#000000"
        d="M4 4.5h7m5 0h1m1 0h1m4 0h1m2 0h7M4 5.5h1m5 0h1m1 0h6m5 0h2m1 0h1m5 0h1M4 6.5h1m1 0h3m1 0h1m8 0h1m2 0h1m3 0h1m1 0h3m1 0h1M4 7.5h1m1 0h3m1 0h1m2 0h2m1 0h2m2 0h1m2 0h1m2 0h1m1 0h3m1 0h1M4 8.5h1m1 0h3m1 0h1m1 0h1m1 0h1m1 0h2m2 0h4m2 0h1m1 0h3m1 0h1M4 9.5h1m5 0h1m2 0h1m2 0h1m1 0h3m1 0h2m2 0h1m5 0h1M4 10.5h7m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h7M13 11.5h4m2 0h1m1 0h1m2 0h1M4 12.5h1m1 0h1m1 0h1m1 0h1m2 0h1m6 0h2m1 0h2m3 0h1m2 0h1M6 13.5h1m1 0h1m3 0h1m1 0h1m2 0h1m1 0h4m1 0h1m1 0h1m2 0h1m2 0h1M5 14.5h2m1 0h4m1 0h4m1 0h4m2 0h1m1 0h1m3 0h3M4 15.5h3m1 0h2m2 0h1m1 0h5m1 0h3m3 0h1m1 0h1m2 0h1M8 16.5h4m1 0h2m3 0h2m1 0h1m3 0h2m2 0h1m1 0h2M5 17.5h1m1 0h1m1 0h1m2 0h2m1 0h2m1 0h2m4 0h1m1 0h2m1 0h1m2 0h1M4 18.5h1m3 0h3m1 0h2m2 0h2m3 0h1m3 0h3m1 0h1m1 0h2M4 19.5h1m1 0h4m5 0h2m2 0h1m1 0h2m1 0h2m3 0h1m1 0h1M4 20.5h2m2 0h1m1 0h2m2 0h1m1 0h1m3 0h2m1 0h5m1 0h1m1 0h2M5 21.5h1m3 0h1m3 0h1m1 0h1m1 0h1m1 0h4m1 0h1m1 0h1m2 0h2m1 0h1M4 22.5h1m1 0h1m1 0h1m1 0h6m2 0h5m4 0h1m3 0h2M5 23.5h1m1 0h2m4 0h1m1 0h4m1 0h2m7 0h1m1 0h1M4 24.5h1m1 0h1m1 0h7m3 0h2m1 0h1m2 0h5M12 25.5h1m5 0h2m3 0h2m3 0h1m1 0h3M4 26.5h7m2 0h1m2 0h2m5 0h2m1 0h1m1 0h2m1 0h2M4 27.5h1m5 0h1m4 0h1m3 0h1m1 0h1m2 0h1m3 0h2M4 28.5h1m1 0h3m1 0h1m1 0h1m2 0h2m3 0h2m2 0h5m2 0h1M4 29.5h1m1 0h3m1 0h1m2 0h1m2 0h2m1 0h3m6 0h1m1 0h1M4 30.5h1m1 0h3m1 0h1m1 0h1m2 0h1m1 0h1m1 0h2m2 0h2m2 0h3m2 0h1M4 31.5h1m5 0h1m2 0h5m2 0h2m1 0h2m1 0h1m1 0h1m2 0h1M4 32.5h7m1 0h1m3 0h1m1 0h3m1 0h3m1 0h4m1 0h2"
      />
    </svg>
    {showLogo && (
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: `${logoSize}px`,
          height: `${logoSize}px`,
          borderRadius: Math.max(5, Math.round(logoSize * 0.25)) + 'px',
          backgroundColor: '#08090C',
          border: '2px solid #F5B942',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
        }}
      >
        <img
          src="/pwa-icon-192.png"
          alt="StyleCorner"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
    )}
  </div>
);

/**
 * 100% Inline Vector SVG QR code for https://www.stylecorner.world/role-selection
 */
export const QrRecruitSvg = ({ size = 180, showLogo = true, logoSize = 36 }) => (
  <div
    style={{
      width: `${size}px`,
      height: `${size}px`,
      backgroundColor: '#ffffff',
      borderRadius: Math.max(10, Math.round(size * 0.08)) + 'px',
      padding: Math.max(6, Math.round(size * 0.04)) + 'px',
      position: 'relative',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
      boxSizing: 'border-box',
    }}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 41 41"
      shapeRendering="crispEdges"
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      <path fill="#ffffff" d="M0 0h41v41H0z" />
      <path
        stroke="#000000"
        d="M4 4.5h7m2 0h3m1 0h1m3 0h4m1 0h2m2 0h7M4 5.5h1m5 0h1m4 0h1m1 0h3m1 0h1m4 0h1m3 0h1m5 0h1M4 6.5h1m1 0h3m1 0h1m1 0h2m2 0h2m1 0h6m2 0h2m1 0h1m1 0h3m1 0h1M4 7.5h1m1 0h3m1 0h1m1 0h1m3 0h1m1 0h3m2 0h4m1 0h1m1 0h1m1 0h3m1 0h1M4 8.5h1m1 0h3m1 0h1m1 0h1m2 0h3m1 0h1m2 0h1m2 0h1m2 0h1m1 0h1m1 0h3m1 0h1M4 9.5h1m5 0h1m1 0h3m2 0h4m3 0h3m1 0h1m1 0h1m5 0h1M4 10.5h7m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h7M12 11.5h2m1 0h1m2 0h2m5 0h1m1 0h1M4 12.5h1m1 0h5m2 0h1m1 0h1m1 0h3m1 0h1m4 0h2m2 0h5M11 13.5h1m2 0h3m1 0h1m1 0h1m2 0h5m2 0h2m1 0h2m1 0h1M4 14.5h1m1 0h2m2 0h3m1 0h1m1 0h1m2 0h1m2 0h1m2 0h1m2 0h2m2 0h1m1 0h2M4 15.5h1m3 0h1m2 0h1m1 0h3m2 0h3m2 0h1m1 0h3m1 0h1m2 0h3M6 16.5h1m1 0h1m1 0h2m3 0h1m6 0h1m2 0h1m1 0h3m1 0h3m1 0h2M4 17.5h4m1 0h1m3 0h1m1 0h1m1 0h4m3 0h1m1 0h2m2 0h1m2 0h4M6 18.5h1m3 0h2m1 0h1m1 0h4m2 0h3m1 0h1m3 0h3m1 0h3M4 19.5h1m1 0h1m2 0h1m1 0h3m4 0h1m1 0h1m1 0h6m1 0h2m1 0h1m1 0h1M4 20.5h1m1 0h1m1 0h3m1 0h2m1 0h1m5 0h4m1 0h4m1 0h2m3 0h1M7 21.5h1m1 0h1m2 0h2m1 0h2m3 0h5m2 0h5m1 0h2m1 0h1M4 22.5h2m3 0h3m7 0h1m1 0h1m2 0h1m1 0h1m4 0h2m1 0h2M5 23.5h1m1 0h1m4 0h4m1 0h2m2 0h4m2 0h1m1 0h8M4 24.5h1m1 0h2m2 0h1m1 0h1m1 0h2m1 0h4m2 0h4m1 0h2m1 0h3m1 0h2M4 25.5h1m4 0h1m1 0h1m4 0h2m1 0h1m1 0h2m4 0h1m1 0h2m2 0h1m2 0h1M4 26.5h1m2 0h1m2 0h2m2 0h2m3 0h3m2 0h3m2 0h1m3 0h3M4 27.5h1m2 0h2m2 0h2m1 0h1m1 0h1m1 0h2m2 0h1m2 0h1m2 0h3m2 0h2M4 28.5h1m1 0h1m2 0h2m3 0h4m1 0h3m4 0h8m1 0h2M12 29.5h1m3 0h1m3 0h1m2 0h3m1 0h2m3 0h1m1 0h1m1 0h1M4 30.5h7m2 0h3m3 0h2m1 0h1m1 0h2m1 0h2m1 0h1m1 0h1m1 0h2M4 31.5h1m5 0h1m1 0h2m1 0h3m2 0h1m2 0h1m1 0h4m3 0h3m1 0h1M4 32.5h1m1 0h3m1 0h1m1 0h3m1 0h2m4 0h1m2 0h1m2 0h6M4 33.5h1m1 0h3m1 0h1m1 0h1m3 0h1m2 0h2m3 0h4m1 0h1m2 0h1m1 0h1m1 0h1M4 34.5h1m1 0h3m1 0h1m1 0h1m4 0h2m2 0h1m1 0h1m1 0h7m1 0h1M4 35.5h1m5 0h1m2 0h2m1 0h3m1 0h1m2 0h4m2 0h1m2 0h3M4 36.5h7m1 0h1m2 0h2m1 0h1m2 0h1m1 0h1m2 0h3m2 0h1m3 0h1"
      />
    </svg>
    {showLogo && (
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: `${logoSize}px`,
          height: `${logoSize}px`,
          borderRadius: Math.max(5, Math.round(logoSize * 0.25)) + 'px',
          backgroundColor: '#08090C',
          border: '2px solid #a78bfa',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
        }}
      >
        <img
          src="/pwa-icon-192.png"
          alt="SC"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
    )}
  </div>
);

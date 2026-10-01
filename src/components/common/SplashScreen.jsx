import React from 'react';
import { Sparkles } from 'lucide-react';

export const SplashScreen = () => {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#121212',
        color: '#ffffff',
        zIndex: 5000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: '84px',
          height: '84px',
          borderRadius: '22px',
          overflow: 'hidden',
          boxShadow: '0 12px 35px rgba(245, 185, 66, 0.4)',
          marginBottom: '1.5rem',
          border: '2px solid rgba(245, 185, 66, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'pulse 2s infinite ease-in-out',
        }}
      >
        <img
          src="/pwa-icon-192.png"
          alt="StyleCorner Logo"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>

      <h1
        style={{
          fontFamily: 'Outfit',
          fontSize: '2rem',
          fontWeight: 900,
          letterSpacing: '0.05em',
          marginBottom: '0.5rem',
        }}
      >
        STYLE<span style={{ color: '#d4af37' }}>CORNER</span>
      </h1>

      <p
        style={{
          color: '#8e8e93',
          fontFamily: 'Inter',
          fontSize: '0.85rem',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          marginBottom: '2.5rem',
        }}
      >
        Atelier Grooming & Styling
      </p>

      <div
        style={{
          width: '40px',
          height: '3px',
          background: '#d4af37',
          borderRadius: '10px',
          animation: 'skeletonPulse 1.2s infinite ease-in-out',
        }}
      />
    </div>
  );
};

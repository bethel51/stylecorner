import React, { useState } from 'react';

/**
 * Luxury Initials & Profile Avatar Component
 * Displays the user's real uploaded photo, or elegantly falls back to their initials
 * on a luxury warm-gold gradient. Never uses dummy stock photos.
 */
export const Avatar = ({
  src,
  name = 'User',
  size = 48,
  borderRadius = '50%',
  style = {},
  className = '',
  fontSize,
  border = '1.5px solid rgba(245, 185, 66, 0.35)',
}) => {
  const [imgError, setImgError] = useState(false);

  // Compute initials (up to 2 characters)
  const getInitials = (n) => {
    if (!n) return 'U';
    const parts = String(n).trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return (parts[0]?.[0] || 'U').toUpperCase();
  };

  const initials = getInitials(name);
  const calculatedFontSize = fontSize || `${Math.max(12, Math.round(size * 0.38))}px`;

  // If a valid image URL is supplied and hasn't errored
  const hasValidImage = src && typeof src === 'string' && src.trim().length > 0 && !imgError && !src.includes('photo-1534528741775-53994a69daeb');

  if (hasValidImage) {
    return (
      <div
        className={className}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius,
          overflow: 'hidden',
          backgroundColor: '#1c202d',
          border,
          flexShrink: 0,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...style,
        }}
      >
        <img
          src={src}
          alt={name}
          onError={() => setImgError(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
          loading="lazy"
        />
      </div>
    );
  }

  // Fallback: Luxury Gold Gradient Badge with Initials
  return (
    <div
      className={className}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius,
        background: 'linear-gradient(135deg, #f5b942 0%, #c99326 100%)',
        color: '#0c0e14',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Outfit, sans-serif',
        fontWeight: 800,
        fontSize: calculatedFontSize,
        letterSpacing: '0.02em',
        border,
        flexShrink: 0,
        boxShadow: '0 2px 10px rgba(245, 185, 66, 0.2)',
        userSelect: 'none',
        ...style,
      }}
      title={name}
    >
      {initials}
    </div>
  );
};
export default Avatar;

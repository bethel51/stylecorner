import React, { useState } from 'react';

export const OptimizedImage = ({
  src,
  alt = '',
  className = '',
  style = {},
  onClick,
  onMouseEnter,
  onMouseLeave,
  loading = 'lazy',
  fallbackSrc,
  aspectRatio,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  const defaultStyle = {
    position: 'relative',
    overflow: 'hidden',
    willChange: 'opacity',
    transform: 'translateZ(0)',
    backfaceVisibility: 'hidden',
    ...style,
  };

  const displaySrc = hasError
    ? fallbackSrc || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=400&q=70&fm=webp'
    : src;

  return (
    <div
      className={`optimized-image-wrapper ${isLoaded ? 'is-loaded' : 'is-loading'} ${className}`}
      style={defaultStyle}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {!isLoaded && <div className="image-skeleton-shimmer" />}
      <img
        src={displaySrc}
        alt={alt}
        loading={loading}
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
        style={{
          width: '100%',
          height: '100%',
          objectFit: style.objectFit || 'cover',
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1), transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          display: 'block',
          transform: 'translateZ(0)',
        }}
      />
    </div>
  );
};

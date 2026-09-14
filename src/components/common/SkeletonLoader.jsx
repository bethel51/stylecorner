import React from 'react';

export const SkeletonCard = ({ style = {} }) => (
  <div
    className="app-card"
    style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
      background: '#151822',
      border: '1px solid rgba(255, 255, 255, 0.06)',
      borderRadius: '18px',
      padding: '1rem',
      marginBottom: 0,
      ...style,
    }}
  >
    <div className="skeleton" style={{ height: '18px', width: '55%', borderRadius: '6px' }} />
    <div className="skeleton" style={{ height: '13px', width: '85%', borderRadius: '4px' }} />
    <div className="skeleton" style={{ height: '13px', width: '40%', borderRadius: '4px' }} />
  </div>
);

export const SkeletonGrid = ({ count = 4, columns = 2, height = 210 }) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gap: '0.85rem',
    }}
  >
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        style={{
          background: '#151822',
          borderRadius: '18px',
          padding: '0.75rem',
          height: `${height}px`,
          border: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.65rem',
          boxSizing: 'border-box',
        }}
      >
        <div
          className="skeleton"
          style={{ height: `${height * 0.58}px`, width: '100%', borderRadius: '14px' }}
        />
        <div className="skeleton" style={{ height: '14px', width: '70%', borderRadius: '4px' }} />
        <div
          className="skeleton"
          style={{ height: '16px', width: '45%', borderRadius: '4px', marginTop: 'auto' }}
        />
      </div>
    ))}
  </div>
);

export const SkeletonList = ({ count = 3, gap = '0.85rem' }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap }}>
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

export const SkeletonRow = () => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.85rem',
      padding: '0.85rem',
      borderRadius: '16px',
      background: '#151822',
      border: '1px solid rgba(255, 255, 255, 0.06)',
    }}
  >
    <div className="skeleton" style={{ width: '48px', height: '48px', borderRadius: '14px', flexShrink: 0 }} />
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
      <div className="skeleton" style={{ height: '14px', width: '60%', borderRadius: '4px' }} />
      <div className="skeleton" style={{ height: '12px', width: '35%', borderRadius: '4px' }} />
    </div>
  </div>
);

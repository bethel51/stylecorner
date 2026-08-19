import React from 'react';

export const SkeletonCard = () => (
  <div className="app-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
    <div className="skeleton" style={{ height: '20px', width: '60%' }} />
    <div className="skeleton" style={{ height: '14px', width: '90%' }} />
    <div className="skeleton" style={{ height: '14px', width: '40%' }} />
  </div>
);

export const SkeletonList = ({ count = 3 }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

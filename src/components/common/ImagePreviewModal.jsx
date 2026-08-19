import React from 'react';
import { X, ExternalLink } from 'lucide-react';

export const ImagePreviewModal = ({ isOpen, onClose, imageUrl, title = "Profile Picture", onNavigateDashboard }) => {
  if (!isOpen || !imageUrl) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.88)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        animation: 'fadeIn 0.25s ease-out',
      }}
      onClick={onClose}
    >
      {/* Close button X */}
      <button
        onClick={onClose}
        aria-label="Close image preview"
        style={{
          position: 'absolute',
          top: '1.5rem',
          right: '1.5rem',
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 255, 255, 0.12)',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          zIndex: 100000,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.3)';
          e.currentTarget.style.borderColor = '#d4af37';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
        }}
      >
        <X size={24} />
      </button>

      {/* Modal Content */}
      <div
        style={{
          maxWidth: '90vw',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.25rem',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Enlarge Image Container */}
        <div
          style={{
            position: 'relative',
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 20px 50px rgba(0,0,0,0.8), 0 0 30px rgba(212,175,55,0.25)',
            border: '2px solid rgba(212, 175, 55, 0.5)',
            backgroundColor: '#121212',
          }}
        >
          <img
            src={imageUrl}
            alt={title}
            style={{
              maxWidth: '85vw',
              maxHeight: '65vh',
              objectFit: 'contain',
              display: 'block',
              borderRadius: '22px',
            }}
          />
        </div>

        {/* Caption & Navigation Button if provided */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ color: '#e0e0e0', fontFamily: 'Outfit', fontWeight: 600, fontSize: '1rem', letterSpacing: '0.5px' }}>
            {title}
          </span>
          {onNavigateDashboard && (
            <button
              onClick={() => {
                onClose();
                onNavigateDashboard();
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.6rem 1.25rem',
                borderRadius: '50px',
                background: 'linear-gradient(135deg, #d4af37, #aa882c)',
                color: '#000000',
                fontWeight: 700,
                fontSize: '0.85rem',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(212,175,55,0.3)',
                marginTop: '0.25rem',
              }}
            >
              Go to Dashboard <ExternalLink size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

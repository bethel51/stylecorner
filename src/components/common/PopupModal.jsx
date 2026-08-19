import React, { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * PopupModal – center-screen popup (replaces slide-up bottom sheet for key actions).
 * Appears with a quick scale-in animation instead of sliding from bottom.
 */
export const PopupModal = ({ isOpen, onClose, title, children, maxWidth = '420px' }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="popup-modal-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        zIndex: 2000,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '1rem',
        animation: 'popupFadeIn 0.18s ease-out',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth,
          maxHeight: '88vh',
          background: '#ffffff',
          borderRadius: '20px',
          padding: '1.5rem 1.25rem',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.3)',
          animation: 'popupScaleIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
          position: 'relative',
          willChange: 'transform',
        }}
      >
        {/* Header row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.1rem',
          }}
        >
          {title && (
            <h3
              style={{
                fontFamily: 'Outfit',
                fontSize: '1.15rem',
                fontWeight: 800,
                color: '#171717',
              }}
            >
              {title}
            </h3>
          )}
          <button
            onClick={onClose}
            style={{
              background: 'rgba(0,0,0,0.06)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6b7280',
              cursor: 'pointer',
              marginLeft: 'auto',
              flexShrink: 0,
            }}
          >
            <X size={16} />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
};

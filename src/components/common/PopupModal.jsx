import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

/**
 * PopupModal – smart responsive modal:
 *  • Mobile  (≤640px): slides up from bottom like a native phone sheet (full-height scrollable)
 *  • Desktop (>640px): pops in as a centered dialog with scale animation
 */
export const PopupModal = ({ isOpen, onClose, title, children, maxWidth = '480px' }) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Scroll the sheet body to top when opening
      if (scrollRef.current) {
        scrollRef.current.scrollTop = 0;
      }
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Dark overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          zIndex: 2000,
          animation: 'pmFadeIn 0.18s ease-out',
        }}
      />

      {/* Sheet / Modal panel — flex column layout for proper scroll */}
      <div
        className="pm-panel"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 2001,
          background: '#ffffff',
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 -12px 40px rgba(0,0,0,0.25)',
          animation: 'pmSlideUp 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Drag handle — fixed at top */}
        <div style={{
          flexShrink: 0,
          padding: '0.6rem 1.25rem 0',
        }}>
          <div style={{ width: '40px', height: '4px', background: '#e5e7eb', borderRadius: '10px', margin: '0 auto 0.75rem' }} />
        </div>

        {/* Header — fixed at top */}
        <div style={{
          flexShrink: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 1.25rem 0.75rem',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
        }}>
          {title && (
            <h3 style={{ fontFamily: 'Outfit', fontSize: '1.15rem', fontWeight: 800, color: '#171717', margin: 0 }}>
              {title}
            </h3>
          )}
          <button
            onClick={onClose}
            aria-label="Close"
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

        {/* Scrollable body */}
        <div
          ref={scrollRef}
          className="pm-scroll-body"
          style={{
            flex: '1 1 auto',
            overflowY: 'auto',
            overflowX: 'hidden',
            WebkitOverflowScrolling: 'touch',
            touchAction: 'pan-y',
            overscrollBehaviorY: 'contain',
            padding: '1rem 1.25rem calc(1.5rem + env(safe-area-inset-bottom))',
            minHeight: 0,
          }}
        >
          {children}
        </div>
      </div>

      <style>{`
        @keyframes pmFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes pmSlideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0); opacity: 1; }
        }
        @keyframes pmScaleIn {
          from { opacity: 0; transform: translate(-50%, -48%) scale(0.92); }
          to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }

        /* Mobile-specific optimizations */
        @media (max-width: 640px) {
          .pm-panel {
            height: 90vh !important;
            height: 90dvh !important;
            max-height: 90dvh !important;
            border-top-left-radius: 20px !important;
            border-top-right-radius: 20px !important;
          }
          .pm-scroll-body {
            padding-left: 1rem !important;
            padding-right: 1rem !important;
            touch-action: pan-y !important;
            -webkit-overflow-scrolling: touch !important;
          }
        }

        @media (max-width: 380px) {
          .pm-panel {
            height: 92vh !important;
            height: 92dvh !important;
            max-height: 92dvh !important;
          }
          .pm-scroll-body {
            padding-left: 0.75rem !important;
            padding-right: 0.75rem !important;
          }
        }

        /* Desktop: switch sheet into centered dialog */
        @media (min-width: 641px) {
          .pm-panel {
            top: 50% !important;
            left: 50% !important;
            bottom: auto !important;
            right: auto !important;
            transform: translate(-50%, -50%) !important;
            width: calc(100% - 2rem) !important;
            max-width: ${maxWidth} !important;
            max-height: 85vh !important;
            height: auto !important;
            border-radius: 20px !important;
            animation: pmScaleIn 0.22s cubic-bezier(0.34, 1.4, 0.64, 1) !important;
          }
          .pm-panel > div:first-child {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
};


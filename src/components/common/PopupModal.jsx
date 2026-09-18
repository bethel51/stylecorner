import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

/**
 * PopupModal – smart responsive modal:
 *  • Mobile  (≤640px): sweeps up from bottom with a spring easing (no stiff pop)
 *  • Desktop (>640px): scales in from centre with spring overshoot
 *
 * Improvements over v1:
 *  - Smooth EXIT animation before unmount (closing class added, then removed after delay)
 *  - Spring cubic-bezier so it feels native & bouncy, not mechanical
 *  - Theme-variable background (works in both light & dark mode)
 *  - Overlay fades out on close too
 */
export const PopupModal = ({ isOpen, onClose, title, children, maxWidth = '480px' }) => {
  const scrollRef = useRef(null);
  const [visible, setVisible] = useState(false);   // controls DOM presence
  const [closing, setClosing] = useState(false);   // triggers exit animation

  // Handle open → start entry animation
  useEffect(() => {
    if (isOpen) {
      setClosing(false);
      setVisible(true);
      document.body.style.overflow = 'hidden';
      document.body.classList.add('modal-open');
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
    } else if (visible) {
      // Trigger exit animation, then unmount after it completes
      setClosing(true);
      const t = setTimeout(() => {
        setVisible(false);
        setClosing(false);
        document.body.style.overflow = '';
        document.body.classList.remove('modal-open');
      }, 260); // must match pmSlideDown / pmScaleOut duration
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
      document.body.classList.remove('modal-open');
    };
  }, []);

  if (!visible) return null;

  return (
    <>
      {/* Overlay — fades in on open, fades out on close */}
      <div
        onClick={onClose}
        className={closing ? 'pm-overlay pm-overlay-out' : 'pm-overlay pm-overlay-in'}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(5px)',
          WebkitBackdropFilter: 'blur(5px)',
          zIndex: 99998,
        }}
      />

      {/* Sheet / Modal panel */}
      <div
        className={`pm-panel ${closing ? 'pm-panel-closing' : ''}`}
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 99999,
          background: 'var(--color-surface)',
          borderTop: '1.5px solid var(--color-border-accent)',
          borderLeft: '1px solid var(--color-border)',
          borderRight: '1px solid var(--color-border)',
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 -20px 60px rgba(0, 0, 0, 0.5)',
          '--pm-max-width': maxWidth,
        }}
      >
        {/* Drag handle */}
        <div style={{ flexShrink: 0, padding: '0.6rem 1.25rem 0' }}>
          <div style={{
            width: '40px',
            height: '4px',
            background: 'var(--color-border-accent)',
            borderRadius: '10px',
            margin: '0 auto 0.7rem',
            opacity: 0.5,
          }} />
        </div>

        {/* Header */}
        <div style={{
          flexShrink: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 1.25rem 0.75rem',
          borderBottom: '1px solid var(--color-border)',
        }}>
          {title && (
            <h3 style={{
              fontFamily: 'Outfit',
              fontSize: '1.1rem',
              fontWeight: 800,
              color: 'var(--color-text-primary)',
              margin: 0,
              flex: 1,
              minWidth: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              paddingRight: '0.75rem',
            }}>
              {title}
            </h3>
          )}
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: 'var(--color-card-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'background 0.15s ease',
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
            padding: '1rem 1.25rem calc(2rem + env(safe-area-inset-bottom, 20px))',
            minHeight: 0,
          }}
        >
          {children}
        </div>
      </div>

      <style>{`
        body.modal-open .bottom-nav {
          display: none !important;
          opacity: 0 !important;
          pointer-events: none !important;
          visibility: hidden !important;
        }

        /* ── Overlay animations ── */
        @keyframes pmOverlayIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes pmOverlayOut {
          from { opacity: 1; }
          to   { opacity: 0; }
        }
        .pm-overlay-in  { animation: pmOverlayIn  0.22s ease-out forwards; }
        .pm-overlay-out { animation: pmOverlayOut 0.22s ease-in  forwards; }

        /* ── Sheet entry / exit (mobile) ── */
        @keyframes pmSheetUp {
          from {
            opacity: 0.4;
            transform: translateY(60%) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes pmSheetDown {
          from {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          to {
            opacity: 0;
            transform: translateY(55%) scale(0.97);
          }
        }

        /* ── Dialog entry / exit (desktop) ── */
        @keyframes pmDialogIn {
          0%   { opacity: 0;   transform: translate(-50%, -46%) scale(0.90); }
          70%  { opacity: 1;   transform: translate(-50%, -51%) scale(1.02); }
          100% { opacity: 1;   transform: translate(-50%, -50%) scale(1);    }
        }
        @keyframes pmDialogOut {
          from { opacity: 1; transform: translate(-50%, -50%) scale(1);    }
          to   { opacity: 0; transform: translate(-50%, -46%) scale(0.92); }
        }

        /* Mobile sheet */
        @media (max-width: 640px) {
          .pm-panel {
            height: 90vh !important;
            height: 90dvh !important;
            max-height: 90dvh !important;
            border-top-left-radius: 22px !important;
            border-top-right-radius: 22px !important;
            animation: pmSheetUp 0.38s cubic-bezier(0.32, 1.15, 0.58, 1) both !important;
          }
          .pm-panel.pm-panel-closing {
            animation: pmSheetDown 0.26s cubic-bezier(0.4, 0, 0.8, 0.6) both !important;
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

        /* Desktop centered dialog */
        @media (min-width: 641px) {
          .pm-panel {
            top: 50% !important;
            left: 50% !important;
            bottom: auto !important;
            right: auto !important;
            transform: translate(-50%, -50%) !important;
            width: calc(100% - 2rem) !important;
            max-width: var(--pm-max-width) !important;
            max-height: 85vh !important;
            height: auto !important;
            border-radius: 22px !important;
            border: 1px solid var(--color-border) !important;
            animation: pmDialogIn 0.32s cubic-bezier(0.32, 1.15, 0.58, 1) both !important;
          }
          .pm-panel.pm-panel-closing {
            animation: pmDialogOut 0.22s cubic-bezier(0.4, 0, 0.8, 0.6) both !important;
          }
        }
      `}</style>
    </>
  );
};

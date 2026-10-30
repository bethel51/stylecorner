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

      {/* Centered Modal panel (Web Dialog style, no flutter mobile sheet) */}
      <div
        className={`pm-panel ${closing ? 'pm-panel-closing' : ''}`}
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 99999,
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: '24px',
          width: 'calc(100% - 2rem)',
          maxWidth: maxWidth,
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.7), 0 0 1px 1px rgba(255, 255, 255, 0.08)',
          '--pm-max-width': maxWidth,
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          flexShrink: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1.1rem 1.35rem 0.85rem',
          borderBottom: '1px solid var(--color-border)',
        }}>
          {title && (
            <h3 style={{
              fontFamily: 'Outfit',
              fontSize: '1.12rem',
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
            padding: '1.15rem 1.35rem 1.5rem',
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
        .pm-overlay-in  { animation: pmOverlayIn  0.2s ease-out forwards; }
        .pm-overlay-out { animation: pmOverlayOut 0.18s ease-in  forwards; }

        /* ── Centered Web Dialog animations ── */
        @keyframes pmDialogIn {
          0%   { opacity: 0;   transform: translate(-50%, -46%) scale(0.94); }
          100% { opacity: 1;   transform: translate(-50%, -50%) scale(1);    }
        }
        @keyframes pmDialogOut {
          from { opacity: 1; transform: translate(-50%, -50%) scale(1);    }
          to   { opacity: 0; transform: translate(-50%, -46%) scale(0.94); }
        }

        .pm-panel {
          animation: pmDialogIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .pm-panel.pm-panel-closing {
          animation: pmDialogOut 0.18s ease-in both;
        }

        @media (max-width: 640px) {
          .pm-panel {
            width: calc(100% - 1.5rem) !important;
            max-height: 88vh !important;
            border-radius: 20px !important;
          }
          .pm-scroll-body {
            padding: 1rem 1rem 1.25rem !important;
          }
        }
      `}</style>
    </>
  );
};

import React, { useState, useEffect } from 'react';
import { Bell, BellOff, BellRing, Check, X } from 'lucide-react';

/**
 * PushNotificationManager
 *
 * Drop-in reusable component that:
 *  - Shows a bell icon button in whatever container you place it
 *  - Tracks & persists the browser push notification permission state
 *  - On click, requests permission via the Notifications API and
 *    subscribes the service worker to push if granted
 *  - Shows inline feedback toast on grant / denial
 *
 * Usage:
 *   <PushNotificationManager />           — icon-only compact mode
 *   <PushNotificationManager showLabel /> — with text label
 */
export const PushNotificationManager = ({ showLabel = false, className = '' }) => {
  const [permission, setPermission] = useState('default'); // 'default' | 'granted' | 'denied'
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', msg: string }

  // ── Bootstrap: read current permission state ──
  useEffect(() => {
    if (!('Notification' in window)) {
      setPermission('unsupported');
      return;
    }
    setPermission(Notification.permission);
  }, []);

  // Auto-dismiss toast after 3.5 s
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const isGranted   = permission === 'granted';
  const isDenied    = permission === 'denied';
  const isUnsupported = permission === 'unsupported';

  // ── Subscribe through SW push manager ──
  const subscribeToPush = async (registration) => {
    try {
      // A real VAPID public key is needed for production push.
      // For now we subscribe with applicationServerKey omitted — fine for
      // testing and in-app notification dispatching.
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
      });
      console.log('[PWA Push] Subscribed:', JSON.stringify(sub));
      return sub;
    } catch (err) {
      // Non-fatal — push subscribe can fail if VAPID key isn't set up yet
      console.warn('[PWA Push] Subscribe failed (VAPID key may be missing):', err.message);
      return null;
    }
  };

  const handleClick = async () => {
    if (isGranted || isDenied || isUnsupported || loading) return;
    setLoading(true);

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        // Also subscribe the SW if available
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.ready;
          await subscribeToPush(registration);
        }
        setToast({ type: 'success', msg: 'Notifications enabled! You\'ll receive booking updates.' });
      } else {
        setToast({ type: 'error', msg: 'Notifications blocked. Enable them in browser settings.' });
      }
    } catch (err) {
      console.warn('[PWA Push] Permission request error:', err);
      setToast({ type: 'error', msg: 'Could not request notification permission.' });
    } finally {
      setLoading(false);
    }
  };

  if (isUnsupported) return null;

  const Icon = loading
    ? BellRing
    : isGranted
    ? Bell
    : isDenied
    ? BellOff
    : Bell;

  const iconColor = isGranted ? '#10b981' : isDenied ? '#ef4444' : '#F5B942';

  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
      {/* Bell button */}
      <button
        type="button"
        onClick={handleClick}
        disabled={isGranted || isDenied || isUnsupported || loading}
        title={
          isGranted
            ? 'Push notifications are enabled'
            : isDenied
            ? 'Notifications are blocked — enable in browser settings'
            : 'Enable push notifications'
        }
        aria-label="Manage push notifications"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          background: isGranted
            ? 'rgba(16, 185, 129, 0.10)'
            : isDenied
            ? 'rgba(239, 68, 68, 0.08)'
            : 'rgba(245, 185, 66, 0.10)',
          border: `1.5px solid ${
            isGranted
              ? 'rgba(16, 185, 129, 0.35)'
              : isDenied
              ? 'rgba(239, 68, 68, 0.30)'
              : 'rgba(245, 185, 66, 0.30)'
          }`,
          borderRadius: '12px',
          padding: showLabel ? '0.45rem 0.85rem' : '0.45rem',
          cursor: isGranted || isDenied ? 'default' : 'pointer',
          opacity: loading ? 0.7 : 1,
          transform: 'translate3d(0,0,0)',
          transition: 'background 0.2s ease, border-color 0.2s ease, transform 0.18s cubic-bezier(0.16,1,0.3,1)',
          WebkitTapHighlightColor: 'transparent',
        }}
        onMouseEnter={(e) => {
          if (!isGranted && !isDenied && !loading) {
            e.currentTarget.style.transform = 'translate3d(0,-1px,0)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translate3d(0,0,0)';
        }}
      >
        <Icon
          size={18}
          color={iconColor}
          style={loading ? { animation: 'bellRing 0.6s ease-in-out infinite alternate' } : {}}
        />
        {showLabel && (
          <span
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: '0.82rem',
              fontWeight: 800,
              color: iconColor,
              whiteSpace: 'nowrap',
            }}
          >
            {isGranted ? 'Notifications On' : isDenied ? 'Blocked' : 'Enable Notifications'}
          </span>
        )}
        {isGranted && (
          <Check size={14} color="#10b981" strokeWidth={3} style={{ marginLeft: showLabel ? '0.1rem' : 0 }} />
        )}
      </button>

      {/* Inline toast */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 8px)',
            left: '50%',
            transform: 'translateX(-50%)',
            minWidth: '240px',
            maxWidth: '320px',
            background: toast.type === 'success' ? '#0f2420' : '#1e0f0f',
            border: `1.5px solid ${toast.type === 'success' ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)'}`,
            borderRadius: '12px',
            padding: '0.65rem 0.85rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.55rem',
            boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
            zIndex: 200,
            animation: 'toastFadeIn 0.28s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          {toast.type === 'success'
            ? <Check size={15} color="#10b981" style={{ flexShrink: 0, marginTop: '1px' }} />
            : <X size={15} color="#ef4444" style={{ flexShrink: 0, marginTop: '1px' }} />
          }
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#e2e8f0', lineHeight: 1.45, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            {toast.msg}
          </span>
        </div>
      )}

      <style>{`
        @keyframes bellRing {
          from { transform: rotate(-15deg); }
          to   { transform: rotate(15deg); }
        }
        @keyframes toastFadeIn {
          from { opacity: 0; transform: translateX(-50%) translateY(6px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  );
};


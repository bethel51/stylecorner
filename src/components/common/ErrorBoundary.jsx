import React from 'react';
import { AlertTriangle, RefreshCw, Home, ChevronDown } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, showDetails: false, isPurging: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught React UI Error:', error, errorInfo);
    const msg = String(error?.message || error || '');
    if (
      msg.includes('Importing a module script failed') ||
      msg.includes('dynamically imported module') ||
      msg.includes('Loading chunk') ||
      msg.includes('MIME type') ||
      msg.includes('Failed to fetch') ||
      msg.includes('itemCount') ||
      msg.includes('destructure')
    ) {
      const hasReloaded = sessionStorage.getItem('chunk_reload_retry_v2');
      if (!hasReloaded) {
        sessionStorage.setItem('chunk_reload_retry_v2', 'true');
        console.warn('[PWA] Stale asset or bundle error detected. Purging cache and reloading fresh build...');
        this.performHardReload();
      }
    }
  }

  performHardReload = async () => {
    this.setState({ isPurging: true });
    try {
      // 1. Unregister all active service workers completely
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(reg => reg.unregister().catch(() => {})));
      }
      // 2. Wipe all CacheStorage buckets
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name).catch(() => {})));
      }
      // 3. Clear session storage flags
      sessionStorage.removeItem('chunk_reload_retry');
      sessionStorage.removeItem('chunk_reload_retry_v2');
    } catch (err) {
      console.warn('[ErrorBoundary] Hard reload cleanup error:', err);
    } finally {
      // 4. Force browser navigation to fresh URL with cache-bust query param
      const cleanUrl = window.location.origin + window.location.pathname + '?bust=' + Date.now();
      window.location.replace(cleanUrl);
    }
  };

  render() {
    if (this.state.hasError) {
      const errorMsg = String(this.state.error?.message || this.state.error || 'Unknown UI Error');

      return (
        <div
          style={{
            minHeight: '100vh',
            backgroundColor: '#0C0E14',
            color: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem 1.5rem',
            textAlign: 'center',
            fontFamily: 'Outfit, sans-serif',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '20px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.25rem',
            }}
          >
            <AlertTriangle size={32} />
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: '#ffffff' }}>
            Application Update Available
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', maxWidth: '420px', marginBottom: '1.5rem', lineHeight: '1.5' }}>
            A newer version of Style Corner was deployed. Tap below to clear cached files and load the fresh update.
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <button
              onClick={this.performHardReload}
              disabled={this.state.isPurging}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.35rem',
                borderRadius: '50px',
                backgroundColor: '#F5B942',
                color: '#0C0E14',
                fontWeight: 800,
                fontSize: '0.85rem',
                border: 'none',
                cursor: this.state.isPurging ? 'wait' : 'pointer',
                boxShadow: '0 4px 16px rgba(245, 185, 66, 0.3)',
              }}
            >
              <RefreshCw size={16} className={this.state.isPurging ? 'spin' : ''} />
              {this.state.isPurging ? 'Purging Cache & Reloading...' : 'Update & Reload Page'}
            </button>
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                this.performHardReload();
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.25rem',
                borderRadius: '50px',
                backgroundColor: 'rgba(255,255,255,0.06)',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '0.85rem',
                border: '1px solid rgba(255,255,255,0.12)',
                textDecoration: 'none',
              }}
            >
              <Home size={16} /> Go Home
            </a>
          </div>

          {/* Diagnostic Details Toggle */}
          <div style={{ maxWidth: '440px', width: '100%', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={() => this.setState(prev => ({ showDetails: !prev.showDetails }))}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748b',
                fontSize: '0.72rem',
                fontFamily: 'Outfit',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                padding: '0.25rem 0.5rem',
              }}
            >
              <span>{this.state.showDetails ? 'Hide technical info' : 'View technical info'}</span>
              <ChevronDown size={12} style={{ transform: this.state.showDetails ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>

            {this.state.showDetails && (
              <div
                style={{
                  marginTop: '0.5rem',
                  padding: '0.75rem',
                  borderRadius: '10px',
                  backgroundColor: '#151822',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#f87171',
                  fontSize: '0.75rem',
                  fontFamily: 'monospace',
                  textAlign: 'left',
                  wordBreak: 'break-all',
                  lineHeight: 1.4,
                }}
              >
                {errorMsg}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

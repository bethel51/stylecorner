import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App.jsx';
import { ErrorBoundary } from './components/common/ErrorBoundary.jsx';
import './index.css';

// ── Auto-Updating PWA Service Worker Registration ──
if ('serviceWorker' in navigator) {
  let refreshing = false;

  // Auto-reload once when a new service worker replaces the old one
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      refreshing = true;
      console.log('[PWA] New version activated. Reloading page for fresh update...');
      window.location.reload();
    }
  });

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('[PWA] Service Worker active with scope:', registration.scope);

        // Check for updates on load
        registration.update().catch(() => {});

        // Listen for new updates found
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[PWA] New feature update available! Triggering activation...');
                newWorker.postMessage({ type: 'SKIP_WAITING' });
              }
            });
          }
        });

        // Periodically check for new updates every 60 seconds
        setInterval(() => {
          registration.update().catch(() => {});
        }, 60000);
      })
      .catch((err) => {
        console.warn('[PWA] ServiceWorker registration failed:', err);
      });
  });

  // Check for updates when window gains focus
  window.addEventListener('focus', () => {
    navigator.serviceWorker.getRegistration().then((reg) => {
      if (reg) reg.update().catch(() => {});
    });
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

// =====================================================================
// PWA Context - Service Worker Registration, Install Prompt & Offline State
// =====================================================================

import React, { createContext, useContext, useState, useEffect } from 'react';

const PwaContext = createContext(null);

export const PwaProvider = ({ children }) => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [swRegistration, setSwRegistration] = useState(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  // Register Service Worker
  useEffect(() => {
    if ('serviceWorker' in navigator && typeof window !== 'undefined') {
      const registerSW = () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            setSwRegistration(reg);
            try { reg.update(); } catch (_) {}

            // Check for updates
            reg.onupdatefound = () => {
              const installingWorker = reg.installing;
              if (installingWorker) {
                installingWorker.onstatechange = () => {
                  if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    setUpdateAvailable(true);
                  }
                };
              }
            };
          })
          .catch((err) => {
            console.warn('PWA Service Worker registration warning:', err);
          });
      };

      if (document.readyState === 'complete') {
        registerSW();
      } else {
        window.addEventListener('load', registerSW);
        return () => window.removeEventListener('load', registerSW);
      }
    }

    // Check if already in standalone/installed mode
    const checkStandalone = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                           window.navigator.standalone === true;
      setIsInstalled(isStandalone);
    };
    checkStandalone();

    // Listen for beforeinstallprompt event
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsInstallable(false);
      setIsInstalled(true);
    };

    // Online/Offline tracking
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Action to trigger installation prompt
  const installApp = async () => {
    if (!deferredPrompt) {
      // Fallback instruction for iOS / unsupported browsers
      alert('To install this app:\n- On Chrome/Edge: Click the install icon in the address bar or browser menu.\n- On iPhone/iPad (Safari): Tap Share and select "Add to Home Screen".');
      return false;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    if (outcome === 'accepted') {
      setIsInstallable(false);
      setIsInstalled(true);
      return true;
    }
    return false;
  };

  // Reload to activate SW update
  const applyUpdate = () => {
    if (swRegistration?.waiting) {
      swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
    window.location.reload();
  };

  return (
    <PwaContext.Provider
      value={{
        isInstallable,
        isInstalled,
        isOffline,
        installApp,
        updateAvailable,
        applyUpdate
      }}
    >
      {children}
    </PwaContext.Provider>
  );
};

export const usePwa = () => {
  const ctx = useContext(PwaContext);
  if (!ctx) {
    return {
      isInstallable: false,
      isInstalled: false,
      isOffline: false,
      installApp: async () => false,
      updateAvailable: false,
      applyUpdate: () => {}
    };
  }
  return ctx;
};

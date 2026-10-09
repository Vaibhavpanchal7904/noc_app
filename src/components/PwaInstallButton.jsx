// =====================================================================
// PwaInstallButton - Install App Trigger for Desktop and Mobile PWA
// =====================================================================

import React from 'react';
import { usePwa } from '../context/PwaContext';
import { Download, CheckCircle, Smartphone } from 'lucide-react';

export const PwaInstallButton = ({ variant = 'header' }) => {
  const { isInstallable, isInstalled, installApp } = usePwa();

  // If already running as an installed standalone app, show subtle status or hide
  if (isInstalled) {
    if (variant === 'sidebar') {
      return (
        <div className="pwa-status-badge">
          <CheckCircle size={14} color="#10b981" />
          <span>App Installed</span>
        </div>
      );
    }
    return null;
  }

  // If installable or user wants to know how to install
  const handleInstallClick = async () => {
    await installApp();
  };

  if (variant === 'sidebar') {
    return (
      <button 
        className="sidebar-install-app-btn"
        onClick={handleInstallClick}
        title="Install NOC Portal on your PC or Mobile"
      >
        <Download size={16} />
        <span>Install Desktop App</span>
      </button>
    );
  }

  return (
    <button
      className="btn btn-primary btn-sm header-install-pwa-btn"
      onClick={handleInstallClick}
      title="Install NOC Portal App for faster offline access"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontWeight: 600,
        fontSize: '12px',
        padding: '5px 11px',
        background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
        color: '#ffffff',
        border: 'none',
        borderRadius: 6,
        boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)',
        cursor: 'pointer'
      }}
    >
      <Download size={14} />
      <span className="header-btn-text">Install App</span>
    </button>
  );
};

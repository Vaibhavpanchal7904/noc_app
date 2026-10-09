// =====================================================================
// ToastNotification - Floating Rich Alert for New Requests & Updates
// =====================================================================

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import { BellRing, FilePlus, X, ArrowRight, ExternalLink } from 'lucide-react';

export const ToastNotification = () => {
  const { activeToast, dismissToast, markAsRead } = useNotification();
  const navigate = useNavigate();

  if (!activeToast) return null;

  const handleView = () => {
    markAsRead(activeToast.id);
    dismissToast();
    if (activeToast.requestId) {
      navigate(`/requests/${activeToast.requestId}`);
    } else {
      navigate('/requests');
    }
  };

  return (
    <div className="toast-notification-container" role="alert" aria-live="assertive">
      <div className="toast-notification-card">
        {/* Glow / Category Strip */}
        <div className="toast-strip" />

        <div className="toast-content">
          <div className="toast-icon-wrapper">
            <FilePlus size={20} className="toast-icon" />
          </div>

          <div className="toast-text-wrapper">
            <div className="toast-header-row">
              <span className="toast-badge">NEW REQUEST</span>
              <span className="toast-time">Just now</span>
            </div>
            
            <div className="toast-title">
              {activeToast.requestNo ? `${activeToast.requestNo}` : 'New NOC Case'}
            </div>

            <p className="toast-message">
              {activeToast.message}
            </p>

            <div className="toast-actions">
              <button 
                className="toast-btn-primary"
                onClick={handleView}
              >
                <span>View Details</span>
                <ArrowRight size={13} />
              </button>
              <button 
                className="toast-btn-dismiss"
                onClick={dismissToast}
              >
                Dismiss
              </button>
            </div>
          </div>

          <button 
            className="toast-close-btn" 
            onClick={dismissToast}
            aria-label="Close notification"
          >
            <X size={15} />
          </button>
        </div>

        {/* Animated Timeout Progress Bar */}
        <div className="toast-progress-bar" />
      </div>
    </div>
  );
};

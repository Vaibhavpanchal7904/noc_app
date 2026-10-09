// =====================================================================
// NotificationCenter - Bell Icon with Live Badge & Rich Popover List
// =====================================================================

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import { 
  Bell, 
  Check, 
  Trash2, 
  Volume2, 
  VolumeX, 
  FilePlus, 
  CheckCircle2, 
  Clock, 
  ExternalLink,
  ShieldAlert,
  Sparkles
} from 'lucide-react';

export const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef(null);
  const navigate = useNavigate();

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    soundEnabled,
    toggleSound,
    desktopPermission,
    requestDesktopPermission
  } = useNotification();

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelectNotification = (notif) => {
    markAsRead(notif.id);
    setIsOpen(false);
    if (notif.requestId) {
      navigate(`/requests/${notif.requestId}`);
    } else {
      navigate('/requests');
    }
  };

  const formatTimeAgo = (isoString) => {
    try {
      const now = new Date();
      const past = new Date(isoString);
      const diffSec = Math.floor((now - past) / 1000);

      if (diffSec < 45) return 'Just now';
      if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
      if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
      return past.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    } catch {
      return 'Recent';
    }
  };

  return (
    <div className="notification-center-wrapper" ref={popoverRef}>
      {/* Bell Button */}
      <button
        className={`btn-icon notification-bell-btn ${unreadCount > 0 ? 'has-unread' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
        title="Notifications & Alerts"
      >
        <Bell size={18} className={unreadCount > 0 ? 'bell-ringing-icon' : ''} />
        {unreadCount > 0 && (
          <span className="notification-badge-count">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown Popover */}
      {isOpen && (
        <div className="notification-popover">
          {/* Header */}
          <div className="notification-header">
            <div className="notification-header-title">
              <span>Notifications</span>
              {unreadCount > 0 && (
                <span className="notification-unread-pill">{unreadCount} New</span>
              )}
            </div>

            <div className="notification-header-actions">
              {/* Sound Mute/Unmute toggle */}
              <button
                className="btn-icon-sm"
                onClick={toggleSound}
                title={soundEnabled ? 'Mute chime sounds' : 'Enable chime sounds'}
                aria-label="Toggle Sound"
              >
                {soundEnabled ? <Volume2 size={15} color="#2563eb" /> : <VolumeX size={15} color="#94a3b8" />}
              </button>

              {/* Mark All Read */}
              {unreadCount > 0 && (
                <button
                  className="btn-text-sm"
                  onClick={markAllAsRead}
                  title="Mark all as read"
                >
                  <Check size={14} />
                  <span>Mark read</span>
                </button>
              )}

              {/* Clear All */}
              {notifications.length > 0 && (
                <button
                  className="btn-icon-sm"
                  onClick={clearNotifications}
                  title="Clear all notifications"
                  aria-label="Clear All"
                >
                  <Trash2 size={14} color="#ef4444" />
                </button>
              )}
            </div>
          </div>

          {/* Desktop Push Banner Prompt if permission not granted */}
          {desktopPermission === 'default' && (
            <div className="notification-push-prompt">
              <div className="prompt-text">
                <strong>Enable Desktop Alerts</strong>
                <span>Get instant popups when a new request is created</span>
              </div>
              <button
                className="btn btn-primary btn-xs"
                onClick={requestDesktopPermission}
              >
                Enable
              </button>
            </div>
          )}

          {/* Notification List */}
          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="notification-empty-state">
                <div className="empty-icon-circle">
                  <Sparkles size={24} color="#94a3b8" />
                </div>
                <div className="empty-title">All caught up!</div>
                <div className="empty-subtitle">
                  When a new NOC request or approval is created, you will be notified here instantly.
                </div>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`notification-item ${notif.read ? 'read' : 'unread'}`}
                  onClick={() => handleSelectNotification(notif)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="notif-item-icon">
                    <FilePlus size={16} />
                  </div>

                  <div className="notif-item-body">
                    <div className="notif-item-top">
                      <span className="notif-item-tag">{notif.requestNo || 'NOC Case'}</span>
                      <span className="notif-item-time">{formatTimeAgo(notif.timestamp)}</span>
                    </div>

                    <div className="notif-item-title">{notif.title}</div>
                    <div className="notif-item-message">{notif.message}</div>

                    {notif.createdByName && (
                      <div className="notif-item-footer">
                        <span className="notif-author">By: {notif.createdByName}</span>
                      </div>
                    )}
                  </div>

                  {!notif.read && <div className="notif-unread-dot" />}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="notification-footer">
              <button 
                className="notification-view-all-btn"
                onClick={() => {
                  setIsOpen(false);
                  navigate('/requests');
                }}
              >
                <span>View All System Requests</span>
                <ExternalLink size={13} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// =====================================================================
// Notification Context - Realtime In-App Notifications, Audio Chimes,
// Floating Toasts & Native Desktop Push Notifications
// =====================================================================

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

// Web Audio API Synthesizer for pleasant chime
const playChimeSound = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;
    
    // Note 1: 587.33 Hz (D5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.15, now + 0.04);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.36);

    // Note 2: 880 Hz (A5)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.1);
    gain2.gain.setValueAtTime(0, now + 0.1);
    gain2.gain.linearRampToValueAtTime(0.18, now + 0.14);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.1);
    osc2.stop(now + 0.62);
  } catch (e) {
    // Non-blocking audio fallback
  }
};

export const NotificationProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const userId = currentUser?.id || 'default_user';

  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem(`noc_notifications_${userId}`);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  const [activeToast, setActiveToast] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('noc_notification_sound') !== 'disabled';
  });
  const [desktopPermission, setDesktopPermission] = useState(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'unsupported';
  });

  const toastTimerRef = useRef(null);
  const broadcastChannelRef = useRef(null);

  // Sync notifications storage when user switches or notifications change
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`noc_notifications_${userId}`);
      if (saved) {
        setNotifications(JSON.parse(saved));
      } else {
        setNotifications([]);
      }
    } catch (e) {}
  }, [userId]);

  // Persist notifications
  useEffect(() => {
    try {
      localStorage.setItem(`noc_notifications_${userId}`, JSON.stringify(notifications.slice(0, 50)));
    } catch (e) {}
  }, [notifications, userId]);

  // BroadcastChannel for cross-tab realtime sync
  useEffect(() => {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const channel = new BroadcastChannel('noc_notifications_channel');
      broadcastChannelRef.current = channel;

      channel.onmessage = (event) => {
        const { type, payload } = event.data || {};
        if (type === 'NEW_NOTIFICATION') {
          handleIncomingNotification(payload, false); // Don't rebroadcast
        }
      };

      return () => {
        channel.close();
      };
    }
  }, [handleIncomingNotification]);

  // Listen for local and Supabase Realtime custom DOM events
  useEffect(() => {
    const recentCreatedIds = new Set();

    const handleLocalCreate = (e) => {
      const { request, user } = e.detail || {};
      if (!request) return;
      recentCreatedIds.add(request.id);
      recentCreatedIds.add(request.request_no);
      setTimeout(() => {
        recentCreatedIds.delete(request.id);
        recentCreatedIds.delete(request.request_no);
      }, 10000);

      notifyNewRequest(request, user?.full_name || 'Current User');
    };

    const handleRealtimeInsert = (e) => {
      const row = e.detail;
      if (!row || !row.request_no) return;
      // Skip if it was created locally right now to avoid double notification
      if (recentCreatedIds.has(row.id) || recentCreatedIds.has(row.request_no)) {
        return;
      }

      handleIncomingNotification({
        type: 'NEW_REQUEST',
        title: 'New NOC Request Created',
        message: `${row.request_no}: ${row.title || 'Purchase / Work Case'}`,
        requestId: row.id,
        requestNo: row.request_no,
        amount: row.estimated_budget,
        timestamp: row.created_at || new Date().toISOString()
      }, true);
    };

    window.addEventListener('noc_request_created', handleLocalCreate);
    window.addEventListener('noc_request_inserted_realtime', handleRealtimeInsert);

    return () => {
      window.removeEventListener('noc_request_created', handleLocalCreate);
      window.removeEventListener('noc_request_inserted_realtime', handleRealtimeInsert);
    };
  }, [notifyNewRequest, handleIncomingNotification]);

  // Request browser desktop notification permission
  const requestDesktopPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        setDesktopPermission(perm);
        return perm;
      } catch (err) {
        console.warn('Desktop notification permission error:', err);
      }
    }
    return 'unsupported';
  };

  // Trigger Native Desktop Notification
  const showNativeDesktopNotification = useCallback((notif) => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        const title = notif.title || 'New NOC Request Alert';
        const options = {
          body: `${notif.requestNo ? notif.requestNo + ': ' : ''}${notif.message}`,
          icon: '/pwa-icon-192.svg',
          badge: '/favicon.svg',
          tag: notif.id || notif.requestId || 'noc-alert',
          renotify: true
        };

        const nativeNotif = new Notification(title, options);
        nativeNotif.onclick = () => {
          window.focus();
          if (notif.requestId) {
            window.location.hash = `#/requests/${notif.requestId}`;
          }
          nativeNotif.close();
        };
      } catch (err) {
        console.warn('Could not display native notification:', err);
      }
    }
  }, []);

  // Core handler for incoming notifications
  const handleIncomingNotification = useCallback((notif, shouldBroadcast = true) => {
    const newNotif = {
      id: notif.id || `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      type: notif.type || 'NEW_REQUEST',
      title: notif.title || 'New NOC Request Created',
      message: notif.message || notif.title || 'A new request has been registered.',
      requestId: notif.requestId || notif.id,
      requestNo: notif.requestNo || '',
      instituteName: notif.instituteName || '',
      createdByName: notif.createdByName || 'NOC Staff',
      timestamp: notif.timestamp || new Date().toISOString(),
      read: false,
      amount: notif.amount || null,
      stage: notif.stage || 'requirement'
    };

    // Add to notification center list (avoiding exact duplicates)
    setNotifications(prev => {
      if (prev.some(n => n.id === newNotif.id || (n.requestId === newNotif.requestId && n.timestamp === newNotif.timestamp))) {
        return prev;
      }
      return [newNotif, ...prev];
    });

    // Play pleasant sound
    if (soundEnabled) {
      playChimeSound();
    }

    // Show floating toast
    setActiveToast(newNotif);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setActiveToast(null);
    }, 7000);

    // Show native desktop notification if window is minimized or inactive
    showNativeDesktopNotification(newNotif);

    // Broadcast to other open browser tabs
    if (shouldBroadcast && broadcastChannelRef.current) {
      broadcastChannelRef.current.postMessage({
        type: 'NEW_NOTIFICATION',
        payload: newNotif
      });
    }
  }, [soundEnabled, showNativeDesktopNotification]);

  // Public API to dispatch "New Request Created" notification
  const notifyNewRequest = useCallback((requestData, creatorName) => {
    const title = 'New NOC Request Created';
    const reqNo = requestData.request_no || 'NOC';
    const message = `${reqNo}: ${requestData.title || 'Purchase/Work Request'}`;
    const by = creatorName || currentUser?.full_name || 'Staff';

    handleIncomingNotification({
      type: 'NEW_REQUEST',
      title,
      message,
      requestId: requestData.id,
      requestNo: reqNo,
      instituteName: requestData.institute_name || '',
      createdByName: by,
      amount: requestData.estimated_budget,
      timestamp: new Date().toISOString()
    }, true);
  }, [currentUser, handleIncomingNotification]);

  // Mark single as read
  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Clear all notifications
  const clearNotifications = () => {
    setNotifications([]);
    if (userId) {
      localStorage.removeItem(`noc_notifications_${userId}`);
    }
  };

  // Dismiss toast
  const dismissToast = () => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setActiveToast(null);
  };

  // Toggle audio
  const toggleSound = () => {
    setSoundEnabled(prev => {
      const next = !prev;
      localStorage.setItem('noc_notification_sound', next ? 'enabled' : 'disabled');
      if (next) playChimeSound();
      return next;
    });
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        activeToast,
        soundEnabled,
        desktopPermission,
        notifyNewRequest,
        markAsRead,
        markAllAsRead,
        clearNotifications,
        dismissToast,
        toggleSound,
        requestDesktopPermission,
        handleIncomingNotification
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    return {
      notifications: [],
      unreadCount: 0,
      activeToast: null,
      soundEnabled: false,
      desktopPermission: 'unsupported',
      notifyNewRequest: () => {},
      markAsRead: () => {},
      markAllAsRead: () => {},
      clearNotifications: () => {},
      dismissToast: () => {},
      toggleSound: () => {},
      requestDesktopPermission: async () => 'unsupported',
      handleIncomingNotification: () => {}
    };
  }
  return ctx;
};

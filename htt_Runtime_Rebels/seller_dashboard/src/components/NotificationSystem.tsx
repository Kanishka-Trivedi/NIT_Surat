'use client';

import { useState, useEffect } from 'react';
import { ReturnCreatedEvent, StatusChangeEvent } from '@/types';

interface Notification {
  id: string;
  type: 'success' | 'info' | 'warning';
  title: string;
  message: string;
  timestamp: string;
  returnId?: string;
}

interface NotificationSystemProps {
  onNotificationClick?: (returnId: string) => void;
}

// Mock notifications for demo
const mockNotifications: Notification[] = [
  {
    id: 'mock-1',
    type: 'info',
    title: 'New Return Request',
    message: 'Return RET-2024-001 has been submitted and is awaiting processing.',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 mins ago
    returnId: 'RET-2024-001',
  },
  {
    id: 'mock-2',
    type: 'success',
    title: 'Status Updated',
    message: 'Return RET-2024-002 changed from initiated to seller_received.',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
    returnId: 'RET-2024-002',
  },
  {
    id: 'mock-3',
    type: 'warning',
    title: 'High Fraud Risk Detected',
    message: 'Return RET-2024-003 has a fraud score of 85. Review recommended.',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
    returnId: 'RET-2024-003',
  },
  {
    id: 'mock-4',
    type: 'success',
    title: 'Refund Approved',
    message: 'Return RET-2024-004 has been approved for refund of $2,400.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
    returnId: 'RET-2024-004',
  },
  {
    id: 'mock-5',
    type: 'info',
    title: 'Dropoff Store Update',
    message: 'New dropoff store "Kirana Express - Mumbai Central" is now active.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
  },
];

export function NotificationSystem({ onNotificationClick }: NotificationSystemProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load mock notifications on mount
  useEffect(() => {
    setNotifications(mockNotifications);
    setUnreadCount(3); // 3 unread notifications
  }, []);

  // Listen for new returns from event system
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Handler for new returns
    const handleNewReturn = (event: ReturnCreatedEvent) => {
      const newNotification: Notification = {
        id: `notif-${Date.now()}`,
        type: 'info',
        title: 'New Return Request',
        message: `Return ${event.return_id} has been submitted and is awaiting processing.`,
        timestamp: event.timestamp,
        returnId: event.return_id,
      };

      setNotifications(prev => [newNotification, ...prev].slice(0, 50)); // Keep last 50
      setUnreadCount(prev => prev + 1);

      // Auto-dismiss after 8 seconds
      setTimeout(() => {
        dismissNotification(newNotification.id);
      }, 8000);
    };

    // Handler for status changes
    const handleStatusChange = (event: StatusChangeEvent) => {
      const newNotification: Notification = {
        id: `notif-${Date.now()}`,
        type: 'success',
        title: 'Status Updated',
        message: `Return ${event.return_id} changed from ${event.previous_status} to ${event.new_status}.`,
        timestamp: event.timestamp,
        returnId: event.return_id,
      };

      setNotifications(prev => [newNotification, ...prev].slice(0, 50));
      setUnreadCount(prev => prev + 1);

      setTimeout(() => {
        dismissNotification(newNotification.id);
      }, 8000);
    };

    // Subscribe to events via custom event (cross-tab communication)
    const handleCustomEvent = (e: CustomEvent) => {
      const { type, data } = e.detail;
      if (type === 'return:created') {
        handleNewReturn(data);
      } else if (type === 'status:changed') {
        handleStatusChange(data);
      }
    };

    window.addEventListener('returniq:event' as any, handleCustomEvent);

    // Also try to listen to BroadcastChannel for cross-tab sync
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('returniq_notifications');
      bc.onmessage = (e) => {
        if (e.data.type === 'return:created') {
          handleNewReturn(e.data.payload);
        } else if (e.data.type === 'status:changed') {
          handleStatusChange(e.data.payload);
        }
      };
    } catch {
      // BroadcastChannel not supported, fall back to window events
    }

    return () => {
      window.removeEventListener('returniq:event' as any, handleCustomEvent);
      bc?.close();
    };
  }, []);

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const markAllRead = () => {
    setUnreadCount(0);
  };

  const handleNotificationClick = (notification: Notification) => {
    if (notification.returnId && onNotificationClick) {
      onNotificationClick(notification.returnId);
    }
    dismissNotification(notification.id);
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Notification Bell */}
      <button
        onClick={() => {
          setIsExpanded(!isExpanded);
          if (!isExpanded) markAllRead();
        }}
        style={{
          position: 'relative',
          padding: '10px',
          backgroundColor: '#1f2937',
          border: '1px solid #374151',
          borderRadius: '8px',
          color: '#9ca3af',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              backgroundColor: '#ef4444',
              color: '#fff',
              fontSize: '11px',
              fontWeight: 700,
              padding: '2px 6px',
              borderRadius: '10px',
              minWidth: '18px',
              textAlign: 'center',
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isExpanded && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: '360px',
            maxHeight: '480px',
            backgroundColor: '#111827',
            border: '1px solid #374151',
            borderRadius: '12px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
            zIndex: 1000,
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '16px',
              borderBottom: '1px solid #374151',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#f3f4f6' }}>
              Notifications
            </span>
            <button
              onClick={clearAll}
              style={{
                fontSize: '12px',
                color: '#9ca3af',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Clear all
            </button>
          </div>

          {/* Notifications List */}
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div
                style={{
                  padding: '40px 20px',
                  textAlign: 'center',
                  color: '#6b7280',
                }}
              >
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#4b5563"
                  strokeWidth="1.5"
                  style={{ marginBottom: '12px' }}
                >
                  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                  <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                </svg>
                <p style={{ fontSize: '14px' }}>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid #1f2937',
                    cursor: notification.returnId ? 'pointer' : 'default',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#1f2937';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                    }}
                  >
                    {/* Icon */}
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        marginTop: '6px',
                        backgroundColor:
                          notification.type === 'success'
                            ? '#10b981'
                            : notification.type === 'warning'
                            ? '#f59e0b'
                            : '#3b82f6',
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <p
                        style={{
                          fontSize: '13px',
                          fontWeight: 600,
                          color: '#f3f4f6',
                          marginBottom: '4px',
                        }}
                      >
                        {notification.title}
                      </p>
                      <p
                        style={{
                          fontSize: '12px',
                          color: '#9ca3af',
                          lineHeight: 1.5,
                        }}
                      >
                        {notification.message}
                      </p>
                      <p
                        style={{
                          fontSize: '11px',
                          color: '#6b7280',
                          marginTop: '6px',
                        }}
                      >
                        {new Date(notification.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        dismissNotification(notification.id);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#6b7280',
                        cursor: 'pointer',
                        padding: '4px',
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationSystem;

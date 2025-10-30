'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { API_URL } from '../lib/constants';

interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  severity?: string;
  timestamp: Date;
}

interface NotificationToastProps {
  userId: string;
}

export default function NotificationToast({ userId }: NotificationToastProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dismissTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const connectToStream = useCallback(() => {
    // Clear any pending reconnection
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // Close existing connection if any
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    // Create new SSE connection
    const eventSource = new EventSource(
      `${API_URL}/notifications/stream/${userId}`,
    );

    eventSource.onopen = () => {
      console.log('SSE connection established');
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const notification = JSON.parse(event.data) as Notification;
        console.log('Received notification:', notification);

        // Add notification to the list
        setNotifications((prev) => [notification, ...prev]);

        // Auto-remove after 10 seconds
        const timeoutId = setTimeout(() => {
          setNotifications((prev) =>
            prev.filter((n) => n.id !== notification.id),
          );
          dismissTimeoutsRef.current.delete(notification.id);
        }, 10000);
        
        dismissTimeoutsRef.current.set(notification.id, timeoutId);
      } catch (error) {
        console.error('Error parsing notification:', error);
      }
    };

    eventSource.onerror = () => {
      setIsConnected(false);
      eventSource.close();

      // Attempt to reconnect after 5 seconds - use arrow function to avoid ref issues
      reconnectTimeoutRef.current = setTimeout(() => {
        console.log('Attempting to reconnect...');
        // Call directly since we're already in the callback scope
        const reconnect = () => {
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
          }
          if (eventSourceRef.current) {
            eventSourceRef.current.close();
          }
          const newEventSource = new EventSource(
            `${API_URL}/notifications/stream/${userId}`,
          );
          newEventSource.onopen = () => {
            console.log('SSE connection re-established');
            setIsConnected(true);
          };
          newEventSource.onmessage = eventSource.onmessage;
          newEventSource.onerror = eventSource.onerror;
          eventSourceRef.current = newEventSource;
        };
        reconnect();
      }, 5000);
    };

    eventSourceRef.current = eventSource;
  }, [userId]);

  useEffect(() => {
    connectToStream();

    return () => {
      // Clean up on unmount
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      // Clear all dismiss timeouts
      const timeouts = dismissTimeoutsRef.current;
      timeouts.forEach((timeout) => clearTimeout(timeout));
      timeouts.clear();
    };
  }, [connectToStream]);

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    
    // Clear the auto-dismiss timeout
    const timeout = dismissTimeoutsRef.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      dismissTimeoutsRef.current.delete(id);
    }
  };

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'error':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'success':
        return 'bg-green-500';
      case 'info':
      default:
        return 'bg-blue-500';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'absence':
        return '🚫';
      case 'late':
        return '⏰';
      case 'overtime':
        return '⏱️';
      default:
        return '📢';
    }
  };

  return (
    <>
      {/* Connection Status Indicator */}
      <div className="fixed top-4 right-4 z-40">
        {isConnected ? (
          <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Connected
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs">
            <span className="inline-block w-2 h-2 bg-red-500 rounded-full"></span>
            Disconnected
          </div>
        )}
      </div>

      {/* Notification Toasts */}
      <div className="fixed top-16 right-4 z-50 space-y-2 max-w-sm">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className="bg-white rounded-lg shadow-lg border-l-4 p-4 animate-slide-in"
            style={{
              borderLeftColor: getSeverityColor(notification.severity),
            }}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <span className="text-2xl">{getIcon(notification.type)}</span>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 text-sm">
                    {notification.title}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(notification.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => dismissNotification(notification.id)}
                className="text-gray-400 hover:text-gray-600 ml-2"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
}

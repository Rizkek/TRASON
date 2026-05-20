'use client';

import { useCallback, useEffect, useRef } from 'react';
import { Reminder } from '@/types/database';
import { useUserPreferences } from './useUserPreferences';

export interface UseScheduleNotificationsOptions {
  enabled?: boolean;
}

export function useScheduleNotifications(options: UseScheduleNotificationsOptions = {}) {
  const prefs = useUserPreferences();
  const enabled = (options.enabled ?? true) && prefs.notifications_enabled && prefs.push_notifications_enabled;
  const notificationTimeoutRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Send browser notification
  const sendNotification = useCallback(async (reminder: Reminder) => {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return;
    }

    if (Notification.permission !== 'granted') {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return;
    }

    new Notification(reminder.title, {
      body: reminder.description || '',
      icon: '/favicon.svg',
      tag: `reminder-${reminder.id}`,
    });
  }, []);

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }, []);

  // Check and schedule notifications for reminders
  const scheduleReminders = useCallback((reminders: Reminder[]) => {
    if (!enabled) return;

    const now = new Date();

    reminders.forEach((reminder) => {
      if (reminder.status !== 'pending' || !reminder.due_datetime) return;

      const dueDate = new Date(reminder.due_datetime);
      
      // Notify times (minutes before)
      const notifyMinutes = reminder.notify_times || [0, 15, 60];
      
      notifyMinutes.forEach((mins) => {
        const notifyTime = new Date(dueDate.getTime() - mins * 60000);
        const timeUntilNotify = notifyTime.getTime() - now.getTime();

        // If notification time is in the future and within next 24 hours
        if (timeUntilNotify > 0 && timeUntilNotify < 24 * 60 * 60 * 1000) {
          const key = `${reminder.id}-${mins}`;
          
          if (!notificationTimeoutRef.current.has(key)) {
            const timeout = setTimeout(() => {
              sendNotification(reminder);
              notificationTimeoutRef.current.delete(key);
            }, timeUntilNotify);

            notificationTimeoutRef.current.set(key, timeout);
          }
        }
      });
    });
  }, [enabled, sendNotification]);

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      notificationTimeoutRef.current.forEach((timeout) => clearTimeout(timeout));
    };
  }, []);

  return {
    sendNotification,
    requestNotificationPermission,
    scheduleReminders,
    isSupported: typeof window !== 'undefined' && 'Notification' in window,
    permission: typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default',
  };
}

# Push Notification Architecture & Implementation - TRASON PWA

## 1. Overview: How Push Notifications Work

### 1.1 Technical Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                   USER'S BROWSER/DEVICE                         │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Web App (Next.js)                                      │   │
│  │  - User subscribes: notificationPermission = 'granted' │   │
│  │  - Service Worker registered                           │   │
│  └────────────────┬──────────────────────────────────────┘   │
│                   │                                             │
│                   │ 1. Subscribe & Get VAPID Keys               │
│                   ▼                                             │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Service Worker                                         │   │
│  │  - Registration object contains subscription endpoint   │   │
│  │  - Store endpoint + VAPID keys locally                  │   │
│  │  - Send to backend for storage                          │   │
│  └────────────────┬──────────────────────────────────────┘   │
│                   │                                             │
│                   │ 2. Subscription Details (via HTTPS)        │
│                   ▼                                             │
└─────────────────────┼───────────────────────────────────────┬──┘
                      │                                         │
                      │ NETWORK / REST API                      │
                      │                                         │
┌─────────────────────▼─────────────────────────────────────┬──┐
│              BACKEND SERVER (Node.js)                      │   │
│                                                            │   │
│  ┌──────────────────────────────────────────────────────┐ │   │
│  │  Store Subscription Endpoint                         │ │   │
│  │  POST /api/v1/subscriptions                          │ │   │
│  │  {                                                   │ │   │
│  │    endpoint: "https://fcm.googleapis.com/...",      │ │   │
│  │    p256dh: "base64encodedkey...",                   │ │   │
│  │    auth: "base64encodedauth..."                     │ │   │
│  │  }                                                   │ │   │
│  │  ↓                                                   │ │   │
│  │  Save to PostgreSQL push_subscriptions table        │ │   │
│  └──────────────────────────────────────────────────────┘ │   │
│                                                            │   │
│  ┌──────────────────────────────────────────────────────┐ │   │
│  │  When Reminder/Notification Needed:                 │ │   │
│  │  1. Job Scheduler (Cron) triggers                   │ │   │
│  │  2. Backend fetches user subscriptions              │ │   │
│  │  3. Sign VAPID JWT with private key                 │ │   │
│  │  4. Encrypt payload with p256dh & auth keys         │ │   │
│  │  5. Send to FCM/Web Push API endpoint               │ │   │
│  └──────────────────┬───────────────────────────────────┘ │   │
│                     │                                       │   │
└─────────────────────┼──────────────────┬────────────────────┘   │
                      │                  │                        
                      │ 3. POST Request │                        
                      │ (Encrypted Payload)                      
                      ▼                  │                        
         ┌────────────────────┐         │                        
         │  Firebase Cloud    │         │                        
         │  Messaging (FCM)   │         │                        
         │  or                │         │                        
         │  Mozilla Push      │         │                        
         │  Service (Web Push)│         │                        
         └────────┬───────────┘         │                        
                  │                     │ (Alt: Direct)         
                  │ 4. Route to Device  │                        
                  ▼                     │                        
         ┌────────────────────┐         │                        
         │  Browser/Device    │◄────────┘                        
         │  via FCM           │                                  
         └────────┬───────────┘                                  
                  │                                              
                  │ 5. Deliver to Service Worker                
                  ▼                                              
         ┌────────────────────┐                                  
         │  Service Worker    │                                  
         │  'push' event      │                                  
         │  triggered         │                                  
         └────────┬───────────┘                                  
                  │                                              
                  │ 6. showNotification()                       
                  ▼                                              
         ┌────────────────────┐                                  
         │  Browser System    │                                  
         │  Notification      │                                  
         │  Displayed to User │                                  
         └────────────────────┘                                  
```

## 2. VAPID Keys and Encryption

### 2.1 VAPID (Voluntary Application Server Identification)

VAPID is a security mechanism that allows:
- Browser to verify server identity
- Server to prove ownership of domain
- Protection against unauthorized push senders

**Generate VAPID Keys (One-time):**
```bash
npm install web-push -g
web-push generate-vapid-keys

# Output:
# Public Key: BMxyz123...
# Private Key: AbcXYZ789...
```

### 2.2 Encryption Process

```
User Data
├─ Payload (reminder data)
│  ├─ title: "Take Vitamin"
│  ├─ body: "Remember to take your daily supplement"
│  └─ icon: "icon-192.png"
│
├─ p256dh key (from user's subscription)
│  └─ Used to derive shared secret
│
├─ auth token (from user's subscription)
│  └─ Additional authentication factor
│
└─ Server's VAPID private key
   └─ Sign the request with server identity


Encryption Steps:
1. Generate ephemeral key pair (ecdh_server)
2. Perform ECDH with user's p256dh to derive shared secret
3. KDF (Key Derivation Function) to produce encryption keys
4. AEAD-ChaCha20-Poly1305 encryption
5. Result: encrypted binary blob

Push Message = {
  headers: {
    "Crypto-Key": "p256ecdsa=...",
    "Encryption": "salt=...",
    "Authorization": "Bearer <VAPID_JWT>"
  },
  body: <encrypted_payload>
}
```

## 3. Backend Implementation

### 3.1 Setup Firebase Cloud Messaging (FCM)

```typescript
// src/config/fcm.ts

import admin from 'firebase-admin';
import fs from 'fs';

const serviceAccount = JSON.parse(
  fs.readFileSync(process.env.FCM_SERVICE_ACCOUNT_PATH || '', 'utf8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export const messaging = admin.messaging();
```

### 3.2 Subscription Service

```typescript
// src/services/subscriptionService.ts

import { prisma } from '@/config/database';
import webpush from 'web-push';

export class SubscriptionService {
  static async subscribeUser(
    userId: string,
    subscription: PushSubscription
  ) {
    // Save subscription to database
    return prisma.pushSubscription.create({
      data: {
        userId,
        endpoint: subscription.endpoint,
        p256dh: subscription.getKey('p256dh')?.toString('base64') || '',
        auth: subscription.getKey('auth')?.toString('base64') || '',
        deviceName: 'Browser',
        isActive: true,
      },
    });
  }

  static async getActiveSubscriptions(userId: string) {
    return prisma.pushSubscription.findMany({
      where: {
        userId,
        isActive: true,
      },
    });
  }

  static async sendNotificationToUser(
    userId: string,
    payload: {
      title: string;
      body: string;
      icon?: string;
      badge?: string;
      tag?: string;
      data?: Record<string, string>;
    }
  ) {
    const subscriptions = await this.getActiveSubscriptions(userId);

    const promises = subscriptions.map((sub) => {
      try {
        return webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          JSON.stringify({
            title: payload.title,
            body: payload.body,
            icon: payload.icon,
            badge: payload.badge,
            tag: payload.tag,
            data: payload.data || {},
          })
        );
      } catch (error) {
        console.error(`Failed to send notification to ${sub.endpoint}`, error);
        // Mark subscription as inactive if endpoint no longer valid
        if (error.statusCode === 410) {
          return prisma.pushSubscription.update({
            where: { id: sub.id },
            data: { isActive: false },
          });
        }
        return null;
      }
    });

    return Promise.allSettled(promises);
  }
}
```

### 3.3 Background Job for Scheduled Notifications

```typescript
// src/jobs/notificationJob.ts

import { CronJob } from 'cron';
import { prisma } from '@/config/database';
import { SubscriptionService } from '@/services/subscriptionService';
import { logger } from '@/utils/logger';

export function setupNotificationJobs() {
  // Run every minute to check for due reminders
  const job = new CronJob('*/1 * * * *', async () => {
    try {
      const now = new Date();

      // Get reminders due in next 5 minutes
      const dueReminders = await prisma.reminderOccurrence.findMany({
        where: {
          status: 'pending',
          scheduledDatetime: {
            lte: new Date(now.getTime() + 5 * 60 * 1000),
            gte: now,
          },
        },
        include: {
          reminder: true,
        },
      });

      logger.info(`Processing ${dueReminders.length} due reminders`);

      for (const occurrence of dueReminders) {
        const { reminder } = occurrence;
        
        // Send notification
        await SubscriptionService.sendNotificationToUser(
          reminder.userId,
          {
            title: 'Reminder',
            body: reminder.title,
            icon: '/icons/icon-192.png',
            tag: `reminder-${reminder.id}`,
            data: {
              reminderId: reminder.id,
              action: 'reminder',
            },
          }
        );

        // Update occurrence as notified
        await prisma.reminderOccurrence.update({
          where: { id: occurrence.id },
          data: { notifiedAt: new Date() },
        });
      }
    } catch (error) {
      logger.error('Error in notification job', error);
    }
  });

  job.start();
  logger.info('Notification job started');
}
```

### 3.4 API Endpoint for Subscriptions

```typescript
// src/routes/subscriptions.ts

import { Router } from 'express';
import { authenticate } from '@/middleware/auth';
import { SubscriptionService } from '@/services/subscriptionService';
import { prisma } from '@/config/database';

const router = Router();

// Subscribe to push notifications
router.post('/', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const subscription = req.body; // PushSubscription object from frontend

    await SubscriptionService.subscribeUser(userId, subscription);

    res.status(201).json({
      success: true,
      message: 'Subscribed to push notifications',
    });
  } catch (error) {
    next(error);
  }
});

// Unsubscribe
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    await prisma.pushSubscription.updateMany({
      where: { id, userId },
      data: { isActive: false },
    });

    res.json({
      success: true,
      message: 'Unsubscribed from push notifications',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
```

## 4. Frontend Implementation

### 4.1 Service Worker Registration

```typescript
// src/services/notification/serviceWorker.ts

export async function registerServiceWorker() {
  if ('serviceWorker' not in navigator) {
    console.log('Service Workers not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    console.log('Service Worker registered', registration);
    return registration;
  } catch (error) {
    console.error('Service Worker registration failed', error);
    return null;
  }
}
```

### 4.2 Push Notification Subscription

```typescript
// src/services/notification/pushNotification.ts

import { apiClient } from '@/services/api/client';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';

export async function subscribeToPushNotifications() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.error('Push notifications not supported');
    return false;
  }

  try {
    // Step 1: Check notification permission
    if (Notification.permission === 'denied') {
      console.log('Notification permission denied');
      return false;
    }

    if (Notification.permission !== 'granted') {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        return false;
      }
    }

    // Step 2: Get service worker registration
    const registration = await navigator.serviceWorker.ready;

    // Step 3: Check if already subscribed
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      // Step 4: Subscribe to push
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
    }

    // Step 5: Send subscription to backend
    await apiClient.post('/subscriptions', subscription);

    console.log('Push notification subscription successful');
    return true;
  } catch (error) {
    console.error('Failed to subscribe to push notifications', error);
    return false;
  }
}

// Helper function: Convert base64 to Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
```

### 4.3 Hook for Push Notifications

```typescript
// src/hooks/usePushNotification.ts

import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import {
  subscribeToPushNotifications,
  registerServiceWorker,
} from '@/services/notification/pushNotification';

export const usePushNotification = () => {
  const { isAuthenticated } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    const setupPushNotifications = async () => {
      try {
        // Register service worker
        await registerServiceWorker();

        // Subscribe to push notifications
        const success = await subscribeToPushNotifications();
        setIsSubscribed(success);
      } catch (error) {
        console.error('Error setting up push notifications', error);
      } finally {
        setLoading(false);
      }
    };

    setupPushNotifications();
  }, [isAuthenticated]);

  return { isSubscribed, loading };
};
```

### 4.4 Enhanced Service Worker with Push Handling

```javascript
// public/sw.js (Enhanced)

const CACHE_NAME = 'trason-v1';

// Handle push events
self.addEventListener('push', (event) => {
  console.log('Push event received', event);

  let data = {
    title: 'TRASON Notification',
    body: 'You have a new notification',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: 'trason-notification',
  };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    tag: data.tag,
    data: data.data || {},
    actions: [
      {
        action: 'open',
        title: 'Open',
      },
      {
        action: 'close',
        title: 'Close',
      },
    ],
    // Allow notification to persist even if app is closed
    requireInteraction: false,
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked', event);

  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  let urlToOpen = '/';

  // Navigate based on notification data
  if (event.notification.data?.action === 'reminder') {
    urlToOpen = '/reminders';
  } else if (event.notification.data?.action === 'transaction') {
    urlToOpen = '/finance';
  }

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true,
    }).then((clientList) => {
      // Check if app already open
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed', event);
});

// Background sync (for offline actions)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-reminders') {
    event.waitUntil(
      fetch('/api/v1/reminders/sync')
        .then((response) => response.json())
        .catch(() => null)
    );
  }
});
```

## 5. Testing Push Notifications

### 5.1 Curl Test
```bash
# Send test notification via curl
curl -X POST 'https://fcm.googleapis.com/fcm/send' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: key=YOUR_SERVER_API_KEY' \
  -d '{
    "to": "DEVICE_REGISTRATION_TOKEN",
    "notification": {
      "title": "Test Reminder",
      "body": "This is a test notification",
      "icon": "/icons/icon-192.png"
    }
  }'
```

### 5.2 Node.js Test
```typescript
// test-push.ts
import webpush from 'web-push';

webpush.setVapidDetails(
  'mailto:your-email@example.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

async function sendTestNotification(subscriptionJson: string) {
  const subscription = JSON.parse(subscriptionJson);

  try {
    await webpush.sendNotification(
      subscription,
      JSON.stringify({
        title: 'Test Notification',
        body: 'This is a test push notification from TRASON',
        icon: '/icons/icon-192.png',
      })
    );
    console.log('Notification sent successfully');
  } catch (error) {
    console.error('Error sending notification', error);
  }
}

// Run: npx ts-node test-push.ts '{"endpoint":"...","keys":{...}}'
```

## 6. Troubleshooting Push Notifications

| Issue | Solution |
|-------|----------|
| "NotAllowedError: permission denied" | User must grant notification permission |
| "InvalidStateError: Registration not active" | Service Worker not properly registered |
| "Network error" | Check HTTPS is enabled, backend is reachable |
| Notification doesn't appear | Check browser tab is inactive, notification preference is ON |
| Duplicate notifications | Check for multiple service worker registrations |
| FCM token invalid | Regenerate subscription after reinstall/cache clear |

## 7. Production Checklist

- ✅ VAPID keys generated and stored securely
- ✅ Service Worker caches appropriately
- ✅ Subscription stored in database
- ✅ HTTPS enabled
- ✅ Notification permission requested only once
- ✅ Old subscriptions cleaned up (410 responses)
- ✅ Background jobs scheduled and running
- ✅ Encryption properly configured
- ✅ Error handling and logging in place
- ✅ Analytics track notification delivery/open rates


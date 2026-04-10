# Arsitektur Sistem - TRASON PWA (Self-Improvement Platform)

## 1. Gambaran Umum Arsitektur

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT SIDE (PWA)                        │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Next.js Frontend (React + TypeScript)                     │ │
│  │  - Pages: Dashboard, Finance, Timeline, Reminders, Insight│ │
│  │  - Components: Reusable UI components                      │ │
│  │  - Services: API calls, data management                    │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Service Worker + Web Push                                 │ │
│  │  - Background sync                                         │ │
│  │  - Offline support                                         │ │
│  │  - Push notification handling                              │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  Local Storage / IndexedDB                                       │
│  - Cache data, offline access                                    │
└─────────────────────────────────────────────────────────────────┘
                              ↕
                    REST API / gRPC
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                    SERVER SIDE (Backend)                         │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Node.js/Express atau Go/Gin Server                        │ │
│  │  - Authentication (JWT)                                    │ │
│  │  - REST API endpoints                                      │ │
│  │  - Business logic                                          │ │
│  │  - Data validation                                         │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Background Jobs / Queue System                            │ │
│  │  - Scheduled reminders                                     │ │
│  │  - Push notifikasi                                         │ │
│  │  - Insight generation                                      │ │
│  │  - Tool: Bull Queue (Node.js) atau RabbitMQ               │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Database Layer                                            │ │
│  │  - PostgreSQL (primary)                                    │ │
│  │  - Redis (cache & session)                                 │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                   EXTERNAL SERVICES                              │
│  - Firebase Cloud Messaging (FCM) / Web Push API                │
│  - Email Service (SendGrid / Mailgun)                           │
│  - Analytics (Mixpanel / Plausible)                             │
└─────────────────────────────────────────────────────────────────┘
```

## 2. Komponen Utama

### 2.1 Frontend (PWA - Next.js)
**Stack:**
- Next.js 14+ (React 18+)
- TypeScript
- TailwindCSS / ShadcnUI
- Zustand / Redux (State Management)
- Azure Services (optional) atau Vercel
- Service Worker untuk PWA

**Fitur Utama:**
- Server-Side Rendering (SSR) untuk performa
- Static Generation untuk halaman statis
- API Routes untuk lightweight backend
- Internationalization (i18n) - support multi-bahasa
- Progressive Enhancement

### 2.2 Backend (Node.js + Express atau Go)
**Opsi 1: Node.js + Express**
- Express.js untuk HTTP server
- Prisma atau TypeORM untuk ORM
- Bull Queue untuk background jobs
- JWT untuk authentication
- Rate limiting, CORS, security middleware

**Opsi 2: Go + Gin (Recommended untuk Scalability)**
- Gin framework untuk HTTP
- sqlc untuk type-safe SQL
- Go routines untuk concurrency
- Dependency collision free
- Excellent performance

Saya sarankan **Go + Gin** untuk performa dan scalability lebih baik.

### 2.3 Database (PostgreSQL)
- TimescaleDB extension untuk time-series data (aktivitas, spending)
- Partitioning untuk data besar
- Full-text search untuk timeline search
- JSONB untuk flexible schema

### 2.4 Cache Layer (Redis)
- User sessions
- Real-time notifications status
- Rate limiting
- Scheduled notifications queue

### 2.5 Push Notification System
- **Web Push API** untuk browser push
- **Firebase Cloud Messaging (FCM)** untuk mobile
- Service Worker untuk handling background notifications
- Batching notifications untuk efficiency

## 3. API Structure

### 3.1 Authentication Endpoints
```
POST   /api/v1/auth/register         - Register user
POST   /api/v1/auth/login            - Login
POST   /api/v1/auth/refresh          - Refresh token
POST   /api/v1/auth/logout           - Logout
POST   /api/v1/auth/forgot-password  - Password reset
```

### 3.2 Finance Endpoints
```
GET    /api/v1/transactions          - List transactions
POST   /api/v1/transactions          - Create transaction
PUT    /api/v1/transactions/:id      - Update transaction
DELETE /api/v1/transactions/:id      - Delete transaction
GET    /api/v1/transactions/analytics - Get insights (spending by category)
GET    /api/v1/categories            - Get all categories
POST   /api/v1/categories            - Create custom category
```

### 3.3 Timeline/Activity Endpoints
```
GET    /api/v1/activities            - List activities (with pagination)
POST   /api/v1/activities            - Create activity
PUT    /api/v1/activities/:id        - Update activity
DELETE /api/v1/activities/:id        - Delete activity
GET    /api/v1/activities/:date      - Get activities for specific date
GET    /api/v1/activities/search     - Search activities
```

### 3.4 Reminder Endpoints
```
GET    /api/v1/reminders             - List reminders
POST   /api/v1/reminders             - Create reminder
PUT    /api/v1/reminders/:id         - Update reminder
DELETE /api/v1/reminders/:id         - Delete reminder
POST   /api/v1/reminders/:id/mark-done - Mark reminder as done
GET    /api/v1/reminders/due         - Get due reminders
```

### 3.5 Insight Endpoints
```
GET    /api/v1/insights/daily/:date  - Daily summary
GET    /api/v1/insights/weekly       - Weekly summary
GET    /api/v1/insights/monthly      - Monthly summary
GET    /api/v1/insights/habits       - Habit analysis
GET    /api/v1/insights/spending     - Spending analysis
```

### 3.6 Notification Subscription Endpoints
```
POST   /api/v1/subscriptions         - Subscribe to push notifications
DELETE /api/v1/subscriptions         - Unsubscribe
PUT    /api/v1/subscriptions/preferences - Update notification preferences
```

## 4. Data Flow

### 4.1 User Input → Notification Flow
```
1. User membuat reminder di frontend
   ↓
2. Frontend POST ke /api/v1/reminders
   ↓
3. Server simpan ke database
   ↓
4. Server add job ke Queue (Bull/RabbitMQ) dengan scheduled time
   ↓
5. Background job worker trigger di scheduled time
   ↓
6. Worker send push notification via FCM/Web Push API
   ↓
7. Service Worker receive notification
   ↓
8. Browser display notification ke user
```

### 4.2 Insight Generation Flow
```
1. User open dashboard
   ↓
2. Frontend GET /api/v1/insights/daily
   ↓
3. Server query database (aggregations)
   ↓
4. Server compute insights (spending patterns, habits)
   ↓
5. Cache result di Redis (5 minutes TTL)
   ↓
6. Return JSON ke frontend
   ↓
7. Frontend render insights dengan charts
```

### 4.3 Offline Workflow
```
1. Service Worker intercept network requests
   ↓
2. If online → pass to network
   ↓
3. If offline → return from cache/IndexedDB
   ↓
4. User can create transaction/activity offline
   ↓
5. Store in IndexedDB locally
   ↓
6. When online → sync via background sync API
   ↓
7. Server merge/update data
```

## 5. Security Considerations

### 5.1 Authentication & Authorization
- JWT tokens dengan expiration (15 menit access, 7 hari refresh)
- Secure cookie storage
- HTTPS everywhere
- CORS policy yang ketat

### 5.2 Data Protection
- End-to-end encryption untuk sensitive data (password, pins)
- Rate limiting per user
- Input validation & sanitization
- SQL injection prevention (prepared statements)
- XSS protection (CSP headers)

### 5.3 API Security
```
Headers Required:
- Authorization: Bearer <JWT>
- X-API-Version: 1
- X-Client-Version: <version>
```

## 6. Scalability Strategy

### 6.1 Horizontal Scaling
- Stateless backend servers (dapat di-scale up/down)
- Load balancer (nginx/HAProxy)
- Database replication (primary-replica)

### 6.2 Performance Optimization
- CDN untuk static assets
- Database indexing strategy
- Query optimization & caching
- Lazy loading di frontend
- Code splitting Next.js
- Image optimization

### 6.3 Monitoring
- Prometheus untuk metrics
- ELK Stack (Elasticsearch, Logstash, Kibana) untuk logging
- Sentry untuk error tracking
- Uptime monitoring (Pingdom/UptimeRobot)

## 7. Deployment Architecture

### Option 1: Traditional VPS
```
- VPS (DigitalOcean/Linode)
- Dokcer containers untuk consistency
- Docker Compose untuk local development
- GitHub Actions untuk CI/CD
```

### Option 2: Serverless (Recommended for MVP)
```
- Vercel untuk Next.js frontend
- AWS Lambda untuk backend
- AWS RDS untuk PostgreSQL
- AWS SQS untuk queuing
- AWS SNS untuk notifications
```

### Option 3: Kubernetes (Enterprise)
```
- GKE / EKS / AKS
- Helm untuk package management
- Persistent volumes untuk database
- Service mesh (Istio)
```

## 8. Development Timeline (12 Minggu)

- **Week 1-2:** Setup infrastructure, DB schema, auth
- **Week 3-4:** Dashboard + Finance feature (backend + frontend)
- **Week 5-6:** Timeline + Activity logging
- **Week 7-8:** Reminder system + Push notifications
- **Week 9-10:** Insight generation + Analytics
- **Week 11:** Testing, optimization, PWA setup
- **Week 12:** Deployment, documentation, launch


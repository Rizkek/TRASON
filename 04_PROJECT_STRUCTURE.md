# Project Folder Structure - TRASON PWA

## 1. Root Directory Structure

```
TRASON/
├── frontend/                    # Next.js PWA application
├── backend/                     # Go/Node.js backend API
├── mobile/                      # React Native (optional future)
├── infrastructure/              # Docker, K8s, CI/CD configs
├── docs/                        # Documentation
├── scripts/                     # Build & deployment scripts
├── .github/                     # GitHub Actions workflows
├── docker-compose.yml           # Local dev environment
└── README.md
```

## 2. Frontend Structure (Next.js 14+)

```
frontend/
├── public/                      # Static assets
│   ├── icons/
│   ├── images/
│   └── manifest.json            # PWA manifest
│
├── src/
│   ├── app/                     # App Router (Next.js 13+)
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Home page
│   │   ├── global.css           # Global styles
│   │   │
│   │   ├── (auth)/              # Auth group
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── signup/
│   │   │   │   └── page.tsx
│   │   │   └── forgot-password/
│   │   │       └── page.tsx
│   │   │
│   │   ├── (dashboard)/         # Dashboard group (protected)
│   │   │   ├── layout.tsx       # Dashboard layout
│   │   │   ├── page.tsx         # Dashboard home
│   │   │   │
│   │   │   ├── finance/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   ├── timeline/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [date]/
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   ├── reminders/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   ├── insights/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── daily/
│   │   │   │   ├── weekly/
│   │   │   │   └── monthly/
│   │   │   │
│   │   │   └── settings/
│   │   │       ├── page.tsx
│   │   │       ├── account/
│   │   │       ├── notifications/
│   │   │       └── privacy/
│   │   │
│   │   └── api/                 # API routes
│   │       ├── auth/
│   │       ├── transactions/
│   │       ├── activities/
│   │       └── reminders/
│   │
│   ├── components/              # Reusable components
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── BottomNav.tsx
│   │   │
│   │   ├── common/              # Shared components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Loading.tsx
│   │   │   ├── Toast.tsx
│   │   │   ├── Dropdown.tsx
│   │   │   ├── DatePicker.tsx
│   │   │   └── SearchBar.tsx
│   │   │
│   │   ├── dashboard/           # Dashboard specific
│   │   │   ├── SummaryCard.tsx
│   │   │   ├── QuickAddButtons.tsx
│   │   │   ├── ActivityTimeline.tsx
│   │   │   ├── FinanceWidget.tsx
│   │   │   └── ReminderWidget.tsx
│   │   │
│   │   ├── finance/
│   │   │   ├── TransactionList.tsx
│   │   │   ├── TransactionCard.tsx
│   │   │   ├── CategoryChart.tsx
│   │   │   ├── TransactionModal.tsx
│   │   │   └── FilterPanel.tsx
│   │   │
│   │   ├── timeline/
│   │   │   ├── ActivityList.tsx
│   │   │   ├── ActivityCard.tsx
│   │   │   ├── ActivityModal.tsx
│   │   │   └── MoodSelector.tsx
│   │   │
│   │   ├── reminders/
│   │   │   ├── ReminderList.tsx
│   │   │   ├── ReminderCard.tsx
│   │   │   ├── ReminderModal.tsx
│   │   │   ├── RecurrenceEditor.tsx
│   │   │   └── NotificationSettings.tsx
│   │   │
│   │   ├── insights/
│   │   │   ├── InsightCard.tsx
│   │   │   ├── FinanceChart.tsx
│   │   │   ├── RecommendationCard.tsx
│   │   │   ├── HabitTracker.tsx
│   │   │   └── ReportGenerator.tsx
│   │   │
│   │   └── auth/
│   │       ├── LoginForm.tsx
│   │       ├── SignupForm.tsx
│   │       └── ForgotPasswordForm.tsx
│   │
│   ├── hooks/                   # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useTransaction.ts
│   │   ├── useActivity.ts
│   │   ├── useReminder.ts
│   │   ├── useInsight.ts
│   │   ├── useLocalStorage.ts
│   │   └── useNotification.ts
│   │
│   ├── context/                 # React Context
│   │   ├── AuthContext.tsx
│   │   ├── ThemeContext.tsx
│   │   └── NotificationContext.tsx
│   │
│   ├── services/                # API & External services
│   │   ├── api/
│   │   │   ├── client.ts        # Axios/Fetch wrapper
│   │   │   ├── auth.ts
│   │   │   ├── transactions.ts
│   │   │   ├── activities.ts
│   │   │   ├── reminders.ts
│   │   │   ├── insights.ts
│   │   │   └── subscriptions.ts
│   │   │
│   │   ├── storage/
│   │   │   ├── localStorage.ts
│   │   │   ├── indexedDB.ts
│   │   │   └── cache.ts
│   │   │
│   │   ├── notification/
│   │   │   ├── pushNotification.ts
│   │   │   └── serviceWorker.ts
│   │   │
│   │   └── analytics.ts
│   │
│   ├── store/                   # State management (Zustand)
│   │   ├── authStore.ts
│   │   ├── transactionStore.ts
│   │   ├── activityStore.ts
│   │   ├── reminderStore.ts
│   │   ├── uiStore.ts
│   │   └── notificationStore.ts
│   │
│   ├── types/                   # TypeScript types/interfaces
│   │   ├── index.ts
│   │   ├── auth.ts
│   │   ├── transaction.ts
│   │   ├── activity.ts
│   │   ├── reminder.ts
│   │   ├── insight.ts
│   │   ├── user.ts
│   │   └── api.ts
│   │
│   ├── libs/                    # Utility functions
│   │   ├── format.ts            # Date, currency formatting
│   │   ├── validate.ts          # Form validation
│   │   ├── calculate.ts         # Math calculations
│   │   └── helpers.ts           # General helpers
│   │
│   ├── styles/                  # Global styles
│   │   ├── globals.css
│   │   ├── variables.css        # CSS custom properties
│   │   └── animations.css
│   │
│   └── middleware/              # Next.js middleware
│       └── auth.ts
│
├── public/
│   ├── sw.js                    # Service Worker
│   ├── manifest.json            # PWA manifest
│   ├── icons/
│   │   ├── icon-192.png
│   │   ├── icon-512.png
│   │   └── favicon.ico
│   └── images/
│
├── tests/
│   ├── __tests__/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── pages/
│   ├── integration/
│   └── e2e/
│
├── .env.example
├── .env.local                   # Local env vars (not committed)
├── .eslintrc.json
├── tsconfig.json
├── tailwind.config.js
├── next.config.js
├── package.json
└── README.md
```

## 3. Backend Structure (Node.js/Go)

### 3.1 Node.js + Express

```
backend/
├── src/
│   ├── config/                  # Configuration
│   │   ├── database.ts
│   │   ├── redis.ts
│   │   ├── queue.ts
│   │   ├── email.ts
│   │   └── env.ts
│   │
│   ├── routes/                  # API routes
│   │   ├── auth.ts
│   │   ├── transactions.ts
│   │   ├── activities.ts
│   │   ├── reminders.ts
│   │   ├── insights.ts
│   │   ├── subscriptions.ts
│   │   ├── users.ts
│   │   └── index.ts             # Route aggregator
│   │
│   ├── controllers/             # Route handlers
│   │   ├── authController.ts
│   │   ├── transactionController.ts
│   │   ├── activityController.ts
│   │   ├── reminderController.ts
│   │   ├── insightController.ts
│   │   ├── subscriptionController.ts
│   │   └── userController.ts
│   │
│   ├── services/                # Business logic
│   │   ├── authService.ts
│   │   ├── transactionService.ts
│   │   ├── activityService.ts
│   │   ├── reminderService.ts
│   │   ├── insightService.ts
│   │   ├── subscriptionService.ts
│   │   ├── notificationService.ts
│   │   └── emailService.ts
│   │
│   ├── models/                  # Database models (Prisma)
│   │   ├── prisma.client.ts
│   │   └── index.ts
│   │
│   ├── middleware/              # Express middleware
│   │   ├── auth.ts
│   │   ├── errorHandler.ts
│   │   ├── validation.ts
│   │   ├── rateLimiter.ts
│   │   ├── cors.ts
│   │   ├── logger.ts
│   │   └── index.ts
│   │
│   ├── jobs/                    # Background jobs
│   │   ├── reminderJob.ts       # Process scheduled reminders
│   │   ├── notificationJob.ts   # Send push notifications
│   │   ├── insightJob.ts        # Generate insights
│   │   ├── cleanupJob.ts        # Data cleanup
│   │   └── index.ts
│   │
│   ├── utils/                   # Helper functions
│   │   ├── format.ts
│   │   ├── validate.ts
│   │   ├── calculate.ts
│   │   ├── jwt.ts
│   │   ├── crypto.ts
│   │   ├── logger.ts
│   │   └── errors.ts
│   │
│   ├── types/                   # TypeScript types
│   │   ├── index.ts
│   │   ├── express.ts           # Extend Express types
│   │   └── api.ts
│   │
│   ├── tests/
│   │   ├── unit/
│   │   ├── integration/
│   │   └── fixtures/
│   │
│   └── app.ts                   # Express app setup
│
├── prisma/
│   ├── schema.prisma            # Database schema
│   └── migrations/              # DB migrations
│
├── docker/
│   └── Dockerfile
│
├── .env.example
├── .env.local
├── .eslintrc.json
├── tsconfig.json
├── package.json
├── docker-compose.yml
└── README.md
```

### 3.2 Go + Gin (Alternative - Recommended)

```
backend/
├── cmd/
│   └── api/
│       └── main.go              # Entry point
│
├── internal/
│   ├── config/
│   │   ├── config.go
│   │   └── database.go
│   │
│   ├── models/
│   │   ├── user.go
│   │   ├── transaction.go
│   │   ├── activity.go
│   │   ├── reminder.go
│   │   └── insight.go
│   │
│   ├── handlers/
│   │   ├── auth.go
│   │   ├── transaction.go
│   │   ├── activity.go
│   │   ├── reminder.go
│   │   ├── insight.go
│   │   └── subscription.go
│   │
│   ├── services/
│   │   ├── auth_service.go
│   │   ├── transaction_service.go
│   │   ├── activity_service.go
│   │   ├── reminder_service.go
│   │   ├── insight_service.go
│   │   ├── notification_service.go
│   │   └── email_service.go
│   │
│   ├── repository/
│   │   ├── user_repo.go
│   │   ├── transaction_repo.go
│   │   ├── activity_repo.go
│   │   ├── reminder_repo.go
│   │   └── insight_repo.go
│   │
│   ├── middleware/
│   │   ├── auth.go
│   │   ├── error.go
│   │   ├── cors.go
│   │   ├── rate_limiter.go
│   │   └── logger.go
│   │
│   ├── jobs/
│   │   ├── reminder_job.go
│   │   ├── notification_job.go
│   │   ├── insight_job.go
│   │   └── scheduler.go
│   │
│   └── utils/
│       ├── jwt.go
│       ├── crypto.go
│       ├── validator.go
│       ├── logger.go
│       └── errors.go
│
├── migrations/                  # SQL migrations
│   ├── 001_init.up.sql
│   └── 001_init.down.sql
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── fixtures/
│
├── docker/
│   └── Dockerfile
│
├── go.mod
├── go.sum
├── main.go
├── .env.example
├── .dockerignore
└── README.md
```

## 4. Infrastructure & Deployment

```
infrastructure/
├── docker/
│   ├── Dockerfile.frontend
│   ├── Dockerfile.backend
│   ├── nginx.conf
│   └── docker-compose.yml
│
├── kubernetes/
│   ├── kustomization.yaml
│   ├── base/
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   ├── configmap.yaml
│   │   └── secret.yaml
│   └── overlays/
│       ├── dev/
│       ├── staging/
│       └── prod/
│
├── terraform/                   # IaC (optional)
│   ├── main.tf
│   ├── variables.tf
│   ├── outputs.tf
│   ├── vpc.tf
│   ├── rds.tf
│   └── eks.tf
│
├── scripts/
│   ├── setup.sh
│   ├── deploy.sh
│   ├── backup.sh
│   └── migrate.sh
│
└── monitoring/
    ├── prometheus.yml
    ├── grafana/
    └── alerting/
```

## 5. Documentation

```
docs/
├── README.md
├── ARCHITECTURE.md              # High-level architecture
├── API.md                       # API documentation
├── DATABASE.md                  # Database documentation
├── DEPLOYMENT.md                # Deployment guide
├── CONTRIBUTING.md              # Contribution guidelines
├── SETUP.md                     # Local development setup
├── TESTING.md                   # Testing guide
└── USER_GUIDE.md                # End-user documentation
```

## 6. Key Configuration Files

### 6.1 Frontend Key Files
```
frontend/
├── next.config.js               # Next.js config
├── tailwind.config.js           # TailwindCSS config
├── tsconfig.json                # TypeScript config
├── .eslintrc.json               # ESLint config
├── jest.config.js               # Jest testing config
└── package.json                 # Dependencies
```

### 6.2 Backend Key Files
```
backend/
├── package.json (Node.js)       # npm dependencies
├── tsconfig.json                # TypeScript config
├── .editorconfig
├── prisma/schema.prisma         # Database schema
├── go.mod (Go)                  # Go module definition
├── Makefile (Go)                # Build commands
└── docker-compose.yml
```

## 7. Environment Variables

### 7.1 Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_FCM_API_KEY=xxx
NEXT_PUBLIC_VAPID_PUBLIC_KEY=xxx
NEXT_PUBLIC_APP_NAME=TRASON
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### 7.2 Backend (.env.local)
```
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/trason_db

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRE=15m
REFRESH_TOKEN_EXPIRE=7d

# Firebase/FCM
FCM_PROJECT_ID=xxx
FCM_SERVICE_ACCOUNT_KEY=xxx

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_FROM=noreply@trason.app

# Server
PORT=3001
NODE_ENV=development
LOG_LEVEL=debug
```

## 8. Build & Development Scripts

### 8.1 Frontend (package.json)
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint . --fix",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:e2e": "playwright test"
  }
}
```

### 8.2 Backend Node.js (package.json)
```json
{
  "scripts": {
    "dev": "ts-node-dev --respawn src/app.ts",
    "build": "tsc",
    "start": "node dist/app.js",
    "lint": "eslint src/**/*.ts",
    "test": "jest",
    "db:migrate": "prisma migrate dev",
    "db:seed": "ts-node prisma/seed.ts"
  }
}
```

### 8.3 Backend Go (Makefile)
```makefile
build:
	go build -o trason ./cmd/api

run:
	go run ./cmd/api

test:
	go test ./...

lint:
	golangci-lint run

migrate-up:
	migrate -path migrations -database $(DATABASE_URL) up

migrate-down:
	migrate -path migrations -database $(DATABASE_URL) down
```


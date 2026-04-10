# TRASON Frontend

A Progressive Web App (PWA) for personal finance tracking, daily activity logging, smart reminders, and AI-powered insights.

## Features

- 💰 **Personal Finance Tracker** - Track income and expenses with detailed categories
- 📅 **Daily Timeline** - Log activities and track your daily progress
- 🔔 **Smart Reminders** - Set recurring reminders with priority levels
- 💡 **AI Insights** - Get personalized recommendations and analytics
- 📱 **PWA Support** - Install as a standalone app on mobile and desktop
- 🔐 **Secure Authentication** - JWT-based authentication with refresh tokens
- 🌐 **Offline Support** - Works offline with automatic sync when online

## Tech Stack

- **Framework**: Next.js 14+ with React 18+
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **State Management**: Zustand
- **API Client**: Axios with token refresh interceptor
- **Deployment**: Vercel-ready PWA

## Prerequisites

Before running the frontend, make sure you have:

- Node.js 18+ installed
- npm or yarn package manager
- Backend API running on `http://localhost:3001` (or configured in `.env.local`)

## Installation

1. **Clone the repository**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your configuration:
   - `NEXT_PUBLIC_API_BASE_URL` - Backend API URL
   - `NEXT_PUBLIC_VAPID_PUBLIC_KEY` - For push notifications

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Open browser**
   Navigate to `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Type check TypeScript

## Project Structure

```
frontend/
├── public/
│   ├── manifest.json       # PWA manifest
│   ├── sw.js              # Service Worker
│   └── icon-*.png         # App icons
├── src/
│   ├── app/               # Next.js App Router pages
│   │   ├── (auth)/        # Auth pages (login, signup)
│   │   ├── dashboard/     # Dashboard page
│   │   ├── finance/       # Finance page
│   │   ├── timeline/      # Timeline page
│   │   ├── reminders/     # Reminders page
│   │   ├── insights/      # Insights page
│   │   └── layout.tsx     # Root layout
│   ├── components/        # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── Alert.tsx
│   │   ├── Badge.tsx
│   │   ├── Loading.tsx
│   │   └── Layout.tsx
│   ├── hooks/             # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useFetch.ts
│   │   ├── useTransaction.ts
│   │   ├── useActivity.ts
│   │   ├── useReminder.ts
│   │   └── usePushNotification.ts
│   ├── libs/              # Utility functions
│   │   ├── format.ts      # Formatting utilities
│   │   ├── date.ts        # Date utilities
│   │   └── helpers.ts     # General helpers
│   ├── services/          # API services
│   │   └── apiClient.ts   # Axios instance with interceptors
│   ├── store/             # Zustand state management
│   │   ├── authStore.ts
│   │   └── transactionStore.ts
│   └── types/             # TypeScript type definitions
└── .env.local             # Environment variables (create from .env.example)
```

## Usage

### Authentication

```typescript
import { useAuth } from '@/hooks/useAuth';

export default function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();
  
  if (!isAuthenticated) return <div>Please login</div>;
  
  return (
    <div>
      <h1>Welcome, {user?.name}</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Fetching Data

```typescript
import { useTransaction } from '@/hooks/useTransaction';

export default function MyComponent() {
  const { transactions, isLoading, fetchTransactions } = useTransaction();
  
  useEffect(() => {
    fetchTransactions();
  }, []);
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <ul>
      {transactions.map(t => (
        <li key={t.id}>{t.title}</li>
      ))}
    </ul>
  );
}
```

### State Management

```typescript
import { useAuthStore } from '@/store/authStore';

export default function MyComponent() {
  const { user, setUser, logout } = useAuthStore();
  
  return <div>{user?.name}</div>;
}
```

## PWA Installation

### On Desktop (Chrome)
1. Click the install icon (⬇️) in the address bar
2. Click "Install TRASON"
3. The app will be installed and can be launched from your applications

### On Mobile
1. Open in Chrome
2. Tap the menu (⋮)
3. Tap "Install app"
4. The app will be installed on your home screen

## Service Worker

The app includes a Service Worker (`public/sw.js`) that provides:
- Offline support via caching strategy
- Push notification handling
- Background sync for offline transactions

## API Integration

The frontend automatically handles:
- JWT token refresh on 401 responses
- Request/response interceptors
- Error handling and logging
- Base URL configuration from environment

## Development Tips

- **Type Safety**: All API responses are typed
- **State Persistence**: Auth and transaction state persists to localStorage
- **Error Handling**: Use the Alert component for user feedback
- **Loading States**: Use the Loading component for async operations
- **Responsive Design**: All components are mobile-first

## Troubleshooting

### Can't connect to backend
- Check `NEXT_PUBLIC_API_BASE_URL` in `.env.local`
- Verify backend is running on configured port
- Check CORS settings on backend

### Authentication errors
- Clear localStorage and hard refresh
- Verify JWT tokens in browser DevTools
- Check backend JWT_SECRET configuration

### PWA not installing
- Use HTTPS in production
- Verify manifest.json is accessible
- Check Service Worker registration in console

## Building for Production

```bash
npm run build
npm start
```

The app will be optimized for production deployment on Vercel or any Node.js hosting.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Web PWA Documentation](https://web.dev/progressive-web-apps/)

## License

MIT

# 🧭 TRASON

> **Your Sovereign Personal Life OS for Intentional Growth**

TRASON is a beautiful, unified Personal OS designed as a calm, editorial digital sanctuary. It consolidates your finances, physical vitality, career pipelines, task schedules, and habits into a secure, private, and offline-first digital living space.

---

## 🎨 Visual Philosophy & Design System

TRASON avoids generic corporate SaaS layouts, opting instead for a minimalist, premium editorial aesthetic built on a warm, high-contrast dark theme.

*   **Warm Black (`#0B0F14`)**: The interface foundation, offering a surgical-clean surface that minimizes cognitive strain.
*   **Warm Gold (`#F4C95D`)**: The primary signal color, utilized surgically for active states, CTAs, and milestone achievements.
*   **Soft Cream (`#F8FAFC`)**: A calm, high-contrast typography color that provides sharp legibility without standard pure-white screen fatigue.
*   **Glassmorphism**: low-opacity card elements (`bg-white/3`) with high-level blurs (`backdrop-blur-xl`) and hairline borders (`border-white/5`) to present tactile hierarchy and clean physical depth.
*   **Tactile Typography**: Editorial headers rendered in a serif typeface (**Cormorant Garamond**) paired with high-precision sans-serif controls (**Inter** / **Instrument Sans**).

---

## ⚡ Tech Stack & Architecture

TRASON is engineered with speed, security, and portability in mind:

*   **Core**: Next.js 15+ (App Router) & React 18
*   **Styling**: Tailwind CSS & Vanilla Custom CSS Tokens
*   **Database & Auth**: Supabase SSR (`@supabase/ssr` & standard RLS policies)
*   **State Management**: Zustand (fully persistent via `localStorage`)
*   **PWA Integrations**: Standard Service Workers for offline notification queuing
*   **Engine**: Bun (fully compliant, rapid dependency loading)

---

## ⚙️ Setup & Installation

### Prerequisites
Make sure you have [Bun](https://bun.sh) (recommended) or [NodeJS](https://nodejs.org) installed on your machine.

### 1. Clone the project and install dependencies:
```bash
# Using Bun (Highly recommended)
bun install

# Or using NPM
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file at the root of the project:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
OPENAI_API_KEY=your-openai-key-for-ai-insights
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-vapid-key-for-push-notifications
```

### 3. Run Development Server
```bash
# Using Bun
bun dev

# Or using NPM
npm run dev
```
Open `http://localhost:3000` to begin.

---

## 📂 Codebase Directory Structure

```yaml
src/
  ├── app/                  # Next.js App Router (pages & API endpoints)
  │     ├── api/            # Secured API routes (LLM, parse, validation)
  │     ├── dashboard/      # Primary Life OS Dashboard
  │     ├── finance/        # Capital cash-flow tracking module
  │     ├── insights/       # Cross-module AI strategist panel
  │     ├── investments/    # Long-term assets & allocations module
  │     ├── reminders/      # Task scheduler & mindful push alerts
  │     ├── sport/          # Workout & vitality history tracking
  │     └── timeline/       # Life log & memory spine
  ├── components/           # Reusable UI & modular layout components
  ├── hooks/                # Core hooks (Auth, SWR queries, notifications)
  ├── libs/                 # Localizations (i18n), formatting & helper utils
  ├── providers/            # React context providers (Auth initializer)
  ├── services/             # Supabase queries & external APIs (OpenAI, DNS)
  ├── store/                # Zustand global state persistence models
  └── utils/                # Standard Supabase middleware & server actions
```

---

## 📖 Deep Dives & Specifications
For more architectural and database-level specifications, refer to our dedicated documentation folder:

*   **[Database Schema & Security RLS Rules](file:///d:/coding/TRASON/docs/DATABASE_SCHEMA.md)**: Deep-dive into our Supabase schema, table constraints, triggers, and Row-Level Security parameters.
*   **[API Endpoint Specification & JWT Auth](file:///d:/coding/TRASON/docs/API_DOCUMENTATION.md)**: Details on the REST route handlers, payloads, and the middleware JWT verification flow.

# Personal OS: Master Architecture & Development Plan

## 1. Product Vision
The Personal OS is a modular, emotionally engaging "Personal Life Management Web App" designed to track daily life, health, investments, and career growth. It prioritizes a calm, minimal, and human-centered user experience over generic SaaS or admin-panel layouts. 

**Core Tenets:**
- **Personal & Minimal:** Soft interactions, whitespace-focused, typography-driven.
- **Human-Readable:** Insights delivered in natural language (e.g., "You exercised 4 times this week").
- **Additive Modularity:** New modules plug into the core without requiring rewrites of existing systems.

## 2. Core System (Existing Foundation)
The current architecture must remain intact. All new features will build *on top* of or *alongside* these core systems:
- **Today Dashboard:** The central hub for daily overview.
- **Timeline / Life Log:** The chronological record of all activities.
- **Quick Input System:** The low-friction entry point for all data types.
- **Insight System:** The human-readable feedback engine.

## 3. Tech Stack Validation
The current stack is validated and will be extended as follows:
- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS, `shadcn/ui` (for accessible primitive components).
- **State Management:** SWR (for server state caching & revalidation) + Zustand (for lightweight global client state, already in use).
- **Backend/DB:** Supabase (PostgreSQL, Auth).
- **Hosting:** Vercel.
- **Notifications:** PWA + Service Worker (Web Push API).

## 4. Software Engineering Architecture

### 4.1. Clean Scalable Folder Structure
The existing structure will be strictly maintained and extended modularly.
```text
src/
├── app/                  # Next.js App Router (Pages & Layouts)
│   ├── (core)/           # Dashboard, Timeline, Insights (Logical grouping)
│   ├── investments/      # Investment Module routes
│   ├── sport/            # Sport Module routes
│   └── api/              # API Routes (backend logic)
├── components/           # UI Components
│   ├── ui/               # Base primitives (shadcn, buttons, inputs)
│   ├── core/             # Core system components (QuickInput, Timeline)
│   └── modules/          # Module-specific components
├── hooks/                # React Hooks
├── store/                # Zustand client state (activityStore, investmentStore)
├── services/             # API / Supabase client wrappers
├── libs/                 # Utilities (formatters, validators)
└── types/                # Shared TypeScript definitions
```

### 4.2. Modular Architecture Strategy
- **Isolation:** Each module (Sport, Investment) must define its own types, components, and API routes.
- **Core Integration:** Modules register their activity types with the core `ActivityStore` to appear in the unified Timeline.
- **No Cross-Module Dependency:** The Sport module should never directly import from the Investment module. Keep domains separated.

### 4.3. Database Schema Additions (Supabase/PostgreSQL)
To support the modules additively without breaking core tables:
- `activities` (Existing): Ensure an extensible `category` or `type` enum.
- `sport_logs` (New): `id`, `user_id`, `activity_id` (FK), `type` (run, lift), `duration`, `reps`, `distance`.
- `investments` (Existing/New): `id`, `user_id`, `asset_symbol`, `quantity`, `average_buy_price`.

### 4.4. Error Handling & Logging Strategy
- **Frontend:** Wrap module sections in React `<ErrorBoundary>`. Use a unified `apiErrors.ts` utility for consistent UI feedback (toasts).
- **API:** Standardize Next.js Route Handler responses: `{ success: boolean, data?: T, error?: string, message?: string }`.
- **Logging:** For MVP, rely on Vercel Logs for server-side errors and simple `console.error` wrappers locally. 

### 4.5. Offline / PWA & Caching Strategy
- **Caching:** Leverage existing SWR configuration (`revalidateOnFocus: false`, `revalidateOnReconnect: true`).
- **Offline:** Use the Service Worker to cache the app shell. Allow "optimistic UI" updates via Zustand/SWR mutations when adding logs offline, syncing when the connection is restored.

## 5. UI/UX & Design Principles
- **Aesthetics:** Use a soft, minimal color palette. Avoid harsh borders; prefer subtle shadows and background tonal shifts.
- **Typography:** Use clean, modern sans-serif fonts with distinct, readable sizing for hierarchy.
- **Interactions:** Implement soft transitions for micro-interactions (e.g., button presses, modal opens).
- **Avoid:** Complex charts unless absolutely necessary. For investments, show large "Total Value" numbers with +/- percentages and simple human-readable insights.

## 6. Accessibility (WCAG)
Accessibility is foundational and non-negotiable:
- **Semantic HTML:** Use `<nav>`, `<main>`, `<article>`, `<section>`.
- **Keyboard Navigation:** Ensure all interactive elements have visible focus states (`focus-visible:ring-2 focus-visible:ring-offset-2`).
- **Contrast:** Validate all text against background colors (aim for AA standard, 4.5:1).
- **Screen Readers:** Use `aria-label` on icon-only buttons (like the Quick Input '+' button) and `aria-live="polite"` for human-readable insight announcements.

## 7. Security Architecture
- **Authentication:** Rely strictly on Supabase Auth. Use Server-Side Auth in Next.js middleware to protect all private routes.
- **Authorization & RLS:** EVERY table in Supabase MUST have Row Level Security enabled. Policy strictly enforced: `(auth.uid() = user_id)`.
- **API Validation:** Use `zod` for validating incoming API request bodies to prevent malformed data and injection attacks.
- **Rate Limiting:** Implement basic rate limiting in Next.js Middleware or API routes to prevent abuse (e.g., Quick Input spam).
- **Secrets:** Keep all external API keys (CoinGecko, Alpha Vantage) in `.env.local` and ONLY access them on server-side API routes. NEVER expose them to the client.

## 8. Testing Strategy
- **Priorities for MVP Solo Dev:** Focus on high ROI testing to prevent regressions.
  - **Unit Tests:** Jest for critical pure functions (e.g., profit/loss calculators, formatting dates in `libs/`).
  - **Component Tests:** React Testing Library for core UI components ensuring a11y.
  - **API Tests:** Test core data transformations.
- **Prevention:** Rely heavily on TypeScript strict mode (`noImplicitAny`, strict null checks) to catch errors at compile time.
- **A11y Testing:** Enforce `eslint-plugin-jsx-a11y` rules during development.

## 9. UX Flow Examples
- **Home Dashboard:** User opens app -> Sees calm greeting -> Sees top insight ("Portfolio up 2.3% today") -> Sees simple list of today's activities. No clutter.
- **Quick Input:** User clicks floating '+' -> Modal opens -> Enters "Ran 5k in 25 mins" -> Saves -> Modal closes softly -> Timeline updates instantly via optimistic UI.

## 10. Development Strategy & Roadmap

### Phase 1: Core Fortification & Sport Module (Weeks 1-2)
- **Goal:** Ensure Timeline, Quick Input, and Insight engine work flawlessly. Build additive Sport Module schema and UI.
- **Action:** Implement `sport_logs` DB schema, integrate with `activities`. Add basic frontend views.
- **Validation:** Verify RLS and basic offline caching.

### Phase 2: Investment Module Integration (Weeks 3-4)
- **Goal:** Read-only tracking of assets with insights.
- **Action:** Integrate CoinGecko/Alpha Vantage APIs securely on the backend. Create simple Portfolio summary components.
- **Constraint:** Do not build charts. Focus on numbers and human-readable daily percentage changes.

### Phase 3: Polish, A11y, & PWA (Week 5)
- **Goal:** Make it feel native, accessible, and fast.
- **Action:** Refine UI interactions, audit accessibility (keyboard + screen reader), ensure Service Worker caches core assets properly.

### Phase 4: Career & Skill Tracker (Future)
- **Goal:** Track job applications and professional growth.
- **Action:** Implement `career_logs` and `skill_logs` schema. Create a "Career Journal" view that integrates with the Timeline.

**Refactoring Prevention Rule:** Always ask: "Does this new feature require modifying the Timeline core logic?" If yes, rethink the approach. Extend via modular composition, do not mutate core systems.

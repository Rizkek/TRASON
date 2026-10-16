# TRASON

Track & Sync OS. A personal operating system that keeps money, investments, schedule, reminders, workouts and job applications in one connected place. Installable as a PWA, English and Indonesian first (Japanese and Spanish dictionaries included).

## Modules

| Module | What it does |
|---|---|
| Dashboard | Life Score, what is due next, current state of money, training and career, today's tasks |
| Finance | Income and expenses, budgets, subscriptions, installments, receipt and driver payout capture |
| Investments | Positions for stocks, crypto, gold, property, debt and vehicles with live price refresh |
| Schedule | Weekly activity log and a daily checklist that resets by the user's timezone |
| Reminders | Due-time reminders delivered as web push, with Active and History views |
| Sport | Workout plans, sessions and personal records |
| Career | Application pipeline, interview journal and resume match |
| Insights | On-demand summaries; scores and streaks are computed with plain rules, not an LLM |

## Visual language

Flat and solid. No gradients, glow, shadows, emoji or loading animations in the product UI; loading is shown as static text. Colors are CSS variables in `src/app/globals.css`, mapped by role in `tailwind.config.js` (`background`, `surface`, `foreground`, `primary`, `success|danger|warning|info`, ...) and checked against WCAG AA in both themes by a test. Fonts: Geist (UI), Geist Mono (numbers), DM Serif Display (wordmark and landing titles). Dark and light themes are supported through the `dark` / `light` class on `<html>`, and a system preference follows the device; the light theme is still being completed screen by screen.

## Tech stack

- Next.js 15 (App Router), React 18, TypeScript strict
- Tailwind CSS 3.4, Phosphor icons, Chart.js
- Supabase (Postgres, Auth, Storage) with Row Level Security, accessed through `@supabase/ssr`
- SWR for client data, Zustand for auth state
- Vercel AI SDK with Google Gemini for capture and insights
- Serwist service worker and `web-push` for PWA and notifications, Resend for email digest
- Jest, ts-jest and Testing Library

## Getting started

Requires Node.js 20 or newer. Use npm unless you deliberately use Bun (both lockfiles exist).

```bash
npm install
npm run dev
```

Create `.env.local` at the project root. Variable names only; get the values from your own Supabase, Google AI, VAPID and Resend accounts:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GOOGLE_GENERATIVE_AI_API_KEY=
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_EMAIL=
CRON_SECRET=
RESEND_API_KEY=
ALPHA_VANTAGE_API_KEY=
COINGECKO_DEMO_API_KEY=
```

`SUPABASE_SERVICE_ROLE_KEY`, `VAPID_PRIVATE_KEY`, `CRON_SECRET` and the API keys are server-only. Never prefix them with `NEXT_PUBLIC_`.

| Command | Purpose |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build (TypeScript errors block it; ESLint does not) |
| `npm run type-check` | `tsc --noEmit` |
| `npm run lint` | ESLint over `src`, with autofix |
| `npm test` | Jest |

## Project structure

```
src/
  app/
    (app)/       authenticated pages: dashboard, finance, investments, schedule, reminders,
                 insights, sport, career, settings, onboarding
    (auth)/      login, signup
    (landing)/   public pages: about, pricing, vision, roadmap, legal
    api/         route handlers (AI capture, prices, push, cron, validation)
    sw.ts        service worker source
  components/    ui primitives, layout shell, landing, module components
  hooks/         one SWR hook per domain
  services/      data access per domain; the only place that calls supabase.from()
  libs/          pure utilities: date, format, validation, i18n, analytics, cron
  store/         Zustand auth store
  types/         database.ts is the source of truth for table types
  modules/       module registry and toggles
  utils/supabase/ server client and session middleware
docs/            product, API and database documentation
```

## Documentation

- `CLAUDE.md`: architecture patterns, UI rules and working rules. The most current reference.
- `docs/DATABASE_SCHEMA.md`: tables, soft delete and RLS rules.
- `docs/api-database.md` and `docs/API_DOCUMENTATION.md`: data access and API routes.
- `docs/setup-environment.md` and `docs/deployment-maintenance.md`: setup, release and manual migrations.
- `docs/product-language.md` and `docs/strategic-vision.md`: product vocabulary and direction.

The code is the final source of truth when a document disagrees with it.

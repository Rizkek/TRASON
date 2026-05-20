# Supabase Optional Modules

Some TRASON screens can run before every database module exists. Missing optional tables should show an empty or setup state, not a console error.

## Weekly Routine / Schedule

Used by:
- `/schedule`
- `src/hooks/useWeeklyTemplate.ts`
- `src/services/templateQueries.ts`

Tables:
- `weekly_templates`
- `template_activities`
- `template_overrides`

Setup:
- Run `src/migrations/001_create_weekly_templates.sql` in Supabase SQL editor.

If missing:
- Weekly Schedule should show an unavailable/setup state.
- Reads return `null` or `[]`.
- Writes warn that weekly schedule tables are not available yet.

## Insights

Used by:
- `/insights`
- `src/services/queries.ts` via `insightQueries`

Table:
- `insights`

Setup:
- Run the base setup SQL that creates `public.insights`, for example `SUPABASE_FINAL_SETUP.sql`.

If missing:
- Insights page should show the empty synthesis state.
- Reads return `[]`.
- No `console.error(..., {})` should appear for a missing optional table.

## Push Subscriptions

Used by:
- Settings > Alerts > Browser Push
- `src/hooks/usePushNotification.ts`

Table:
- `push_subscriptions`

Required env:
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`

Setup:
- Run the base setup SQL that creates `public.push_subscriptions`.
- Configure the VAPID public key in `.env.local`.
- Ensure `/public/sw.js` exists before enabling browser push.

If missing or unconfigured:
- Browser Push should show a clear error.
- The app should not save `push_notifications_enabled: true` when push cannot be configured.

## Current Behavior Contract

- Optional module reads should degrade gracefully.
- Optional module writes should fail visibly with a clear warning or UI error.
- Core app modules should continue working when optional modules are not installed.

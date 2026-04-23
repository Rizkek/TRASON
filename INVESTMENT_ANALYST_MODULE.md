# Investment Analyst Module

This module extends TRASON without replacing any existing module.

## Integration points

- Navigation: add `/investments` beside Finance, Timeline, Reminders, and Insights.
- Dashboard: add one additive summary card that shows portfolio value, unrealized P/L, and allocation mix.
- Timeline: create a normal `activities` entry whenever a position is created, updated, or archived.
- Insight system: generate lightweight portfolio observations through `/api/investments/insights` and surface them in the Insights page and dashboard.
- Supabase: use new tables only, keeping the existing `users`, `activities`, and `insights` structures untouched.

## New tables

- `investment_positions`
- `investment_price_snapshots`

See `SUPABASE_ADD_INVESTMENT_ANALYST.sql`.

## API endpoints

- `POST /api/investments/prices`
- `POST /api/investments/insights`

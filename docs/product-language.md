# TRASON — Product Language Dictionary
**Version:** 1.0  
**Status:** Official — treat as a product decision document  
**Last updated:** August 2026  
**Authority:** Product + Design

This document defines the **official vocabulary** for TRASON. Every word used in the product — UI labels, marketing copy, error messages, navigation, onboarding, documentation, and i18n strings — must conform to the definitions here.

When in doubt, **match this document exactly.**  
When a term is missing from this document, add it here before using it in production.

---

## How to Use This Dictionary

Each entry contains:
- **Definition** — what the term means within TRASON
- **Type** — Noun / Verb / Modifier / Concept
- **Status** — `CANONICAL` · `DEPRECATED` · `INTERNAL_ONLY` · `OVERCLAIM`
- **Use as** — how to apply it grammatically
- **Do not use** — forbidden synonyms and alternatives with reasons
- **Affected locations** — where this term appears (nav, i18n key, page, etc.)

---

## A

### Activity
**Definition:** A single logged event within the Schedule module. Represents something the user did or plans to do — has a title, day, time, duration, category, mood rating, and optional notes.  
**Type:** Noun  
**Status:** `CANONICAL`  
**Use as:** Singular: "activity." Plural: "activities." The action to create one: "log."  
**Do not use:**
- "Event" — ambiguous with calendar events
- "Task" — reserved for Daily Checklist items only
- "Entry" — too generic  

**Affected locations:** `timeline_page.form`, `timeline_page.log_activity_btn`, `timeline_page.edit_log`, `dashboard.recent_moments`

---

### Application
**Definition:** A single job application record in the Career module. Moves through the pipeline: Applied → Reviewing → Interview → Offer → Accepted / Rejected / Withdrawn.  
**Type:** Noun  
**Status:** `CANONICAL`  
**Use as:** Singular: "application." Plural: "applications." Never abbreviated.  
**Do not use:**
- "Job" as the primary noun (acceptable as modifier: "job application URL")
- "Opportunity" — implies intent, not action
- "Move" — informal, inconsistent  

**Affected locations:** `career_page.new_application`, `career_page.empty_all`, `career_page.tabs`, `career_page.form`

---

## B

### Budget
**Definition:** A spending limit set by the user. Two types: (1) a global monthly budget covering total expenses, and (2) per-category budgets for specific expense categories. Not predictive — it is a static limit that tracks actual spending against a defined target.  
**Type:** Noun  
**Status:** `CANONICAL`  
**Use as:** Singular: "budget." Plural: "budgets." Action: "set a budget."  
**Do not use:**
- "Predictive Blueprint" — overclaims; the budget has no predictive function
- "Target" as a standalone noun for budget (acceptable as a column label in a budget table)
- "Spending limit" — acceptable informally but "budget" is preferred  

**Affected locations:** `finance.budget.globalMonthly`, `finance.budget.predictiveBlueprint` → **[TO BE RENAMED]** to `finance.budget.categoryBudgets`

---

## C

### Career
**Definition:** The TRASON module for tracking job applications through a structured pipeline. Users log applications, track interview stages, and review career analytics.  
**Type:** Noun / Module name  
**Status:** `CANONICAL`  
**Use as:** Standalone noun for the module: "Career." Sub-label for the pipeline view: "pipeline."  
**Do not use:**
- "Career Tracker" as a page title — "Tracker" adds nothing
- "Career Pipeline" as the primary module label — acceptable as a section label within the module
- "Career Architect" — previously used in marketing copy, overclaims  

**Affected locations:** `nav.career`, `career_page.title`, `career_page.title_highlight` → **[TO BE MERGED]**

---

### Dashboard
**Definition:** The home view of TRASON. Displays a real-time, cross-module overview: Life Score, reminders due today, finance and vitality pillars, daily tasks, and optional financial analytics.  
**Type:** Noun / Module name  
**Status:** `CANONICAL`  
**Use as:** Always capitalized in navigation and page titles.  
**Do not use:**
- "Home"
- "Overview"
- "Command Center" — enterprise jargon, does not fit the calm/minimal positioning  

**Affected locations:** `nav.dashboard`, `app/(app)/dashboard/`

---

## E

### Expenses
**Definition:** Money the user has spent. One of the two transaction types (alongside Income). Displayed as a negative flow.  
**Type:** Noun  
**Status:** `CANONICAL`  
**Use as:** Always plural when referring to the aggregate ("your expenses this month"). Singular "expense" for a single transaction type.  
**Do not use:**
- "Outflow" as the primary label — acceptable in financial chart legends or as a secondary label, but "Expenses" is the canonical primary label for the summary card
- "Spending" — acceptable informally but not in UI labels  

**Affected locations:** `finance.totalExpense`, `finance.filterExpense`, `finance.modal.type.expense`, `finance.feed.filterExpense`

---

## F

### Finance
**Definition:** The TRASON module for tracking income, expenses, subscriptions, and budgets. Provides a monthly view of cash flow with historical transaction records.  
**Type:** Noun / Module name  
**Status:** `CANONICAL`  
**Use as:** Standalone noun for both the module name and the page title.  
**Do not use:**
- "Financial Flow" as a page title — "Financial Flow" is a concept, not a page name; acceptable only as a chart section label
- "Financial" as a standalone heading (grammatically requires a noun: "Financial Overview," "Financial Health")  

**Affected locations:** `nav.finance`, `finance.title` → **[TO BE CHANGED]** from `"Financial Flow"` to `"Finance"`

---

## I

### Income
**Definition:** Money the user has received. One of the two transaction types (alongside Expenses). Displayed as a positive flow.  
**Type:** Noun  
**Status:** `CANONICAL`  
**Use as:** Singular. "your income this month."  
**Do not use:**
- "Inflow" as the primary label — acceptable in financial chart legends; not as a primary summary card label  

**Affected locations:** `finance.totalIncome`, `finance.filterIncome`, `finance.modal.type.income`, `finance.feed.filterIncome`

---

### Insights
**Definition:** The TRASON module that generates an AI-produced text summary of the user's activity across all active modules. User-triggered (not automatic). One generation per session.  
**Type:** Noun / Module name  
**Status:** `CANONICAL`  
**Use as:** Always plural for the module name and page title. Singular "insight" for a single generated item.  
**Do not use:**
- "Strategic Insights" — overclaims; the module generates summaries, not strategies
- "AI Insights" — "AI" is implied; adding it creates inconsistency with the navigation label
- "Analysis Engine" — developer jargon, not a user-facing concept
- "Architect's Perspective" — has no defined meaning in the product  

**Affected locations:** `nav.insights`, `insights_page.title` → **[TO BE CHANGED]**, `insights_page.desc` → **[TO BE CHANGED]**

---

### Investments
**Definition:** The TRASON module for tracking long-term financial positions — stocks, crypto, and gold — with simple cost-basis tracking and daily pricing via external APIs.  
**Type:** Noun / Module name  
**Status:** `CANONICAL`  
**Use as:** Plural for the module name. Singular "investment" for a concept or modifier.  
**Do not use:**
- "Investment Analyst" as a page title — overclaims; the module tracks positions, it does not advise
- "Portfolio" alone (acceptable as a section label within the module: "your portfolio")  

**Affected locations:** `nav.investments`, `investment_page.investment_analyst_title` → **[TO BE CHANGED]**

---

## L

### Life Score
**Definition:** A composite score from 0–100 calculated from the user's activity across four dimensions: Finance (30%), Productivity (25%), Health (25%), Career (20%). Recalculated in real time from live data. Not predictive — reflects current-day behavior.  
**Type:** Concept / Proper Noun  
**Status:** `CANONICAL`  
**Use as:** Always two words, always capitalized: "Life Score."  
**Do not use:**
- "Holistic life score" — redundant descriptor
- "Life Balance Score"
- Any phrasing that implies the score predicts the future  

**Affected locations:** `life_score.ui.title`, `life_score.ui.subtitle`, dashboard widget

---

### Log (verb)
**Definition:** The primary action of adding a record to the TRASON system. Used for activities, workout sessions, and as a casual alternative for transactions.  
**Type:** Verb  
**Status:** `CANONICAL`  
**Use as:** "Log a session." "Log an activity." For finance, prefer "Add a transaction" over "Log a transaction" to maintain module distinction.  
**Do not use:**
- "Capture" as the primary verb (acceptable only in the Smart Input context where the user is capturing natural-language input)
- "Record" — too clinical
- "Track" — acceptable as a high-level product description, but not as a UI action verb  

**Affected locations:** `timeline_page.log_activity_btn`, `dashboard.log_new`, `sport_page.quick_log_workout`

---

## P

### Position
**Definition:** A single tracked investment within the Investments module. Represents one holding: one stock, one crypto asset, or one gold allocation. Has a buy price, quantity, and current market value.  
**Type:** Noun  
**Status:** `CANONICAL`  
**Use as:** Singular: "position." Plural: "positions."  
**Do not use:**
- "Holding" — acceptable informally but "position" is the canonical term
- "Asset" — acceptable as a column label ("Asset Type"), but not as the primary noun for an individual tracked record  

**Affected locations:** `investment_page.add_position`, `investment_page.tracked_position`, `investment_page.add_first_position`

---

## R

### Reminders
**Definition:** The TRASON module for creating and managing time-based alerts. Each reminder has a title, due date and time, priority level, and optional notes. Delivered via push notification.  
**Type:** Noun / Module name  
**Status:** `CANONICAL`  
**Use as:** Plural for the module name. Singular "reminder" for an individual item.  
**Do not use:**
- "Smart Reminders" — "Smart" implies AI intelligence that is not present; the feature schedules push notifications
- "Notifications" — that is the delivery mechanism, not the object
- "Alerts" — acceptable as an informal synonym but "reminders" is preferred  

**Affected locations:** `nav.reminders`, `reminders_page.title`, onboarding module card

---

## S

### Schedule
**Definition:** The TRASON module for planning and viewing activities across the week. Contains two sub-views: the **Weekly Log** (historical activity records) and the **Daily Checklist** (tasks to complete today).  
**Type:** Noun / Module name  
**Status:** `CANONICAL` as the user-facing label. `INTERNAL_ONLY` for the route (`/timeline`) and module key (`timeline`).  
**Use as:** "Schedule" in all user-facing labels. Never "Timeline" in UI copy.  
**Do not use:**
- "Timeline" in UI — deprecated as a user-facing label (retained in code as the route and module ID for backward compatibility)
- "Planner"
- "Daily Planner"  

**Affected locations:** `nav.timeline` (renders as "Schedule"), `timeline_page.title`, `dashboard.view_schedule`, `dashboard.open_timeline`

---

### Session
**Definition:** A single workout log entry within the Vitality module. Represents one training event: type of workout, duration, intensity, and optional exercises.  
**Type:** Noun  
**Status:** `CANONICAL`  
**Use as:** Singular: "session." Plural: "sessions."  
**Do not use:**
- "Workout" as the noun for an individual logged entry (acceptable as a modifier: "workout plan," "workout type")
- "Log" as a noun for a session entry  

**Affected locations:** `sport_page.total_sessions`, `dashboard.sessions`, `dashboard.log_first_session`

---

### Settings
**Definition:** The configuration area of TRASON. Contains tabs for Profile, Appearance, Notifications, Modules, and Security.  
**Type:** Noun / Module name  
**Status:** `CANONICAL`  
**Use as:** Always singular noun, never "Preferences" as the page title (acceptable as a tab label within Settings, e.g., "Notification preferences").  

**Affected locations:** `nav.settings`, `settings.title`

---

### Subscription
**Definition:** A recurring expense that bills on a fixed cycle (monthly, yearly, or weekly). Tracked separately from one-time transactions. Examples: Netflix, Spotify, cloud hosting.  
**Type:** Noun  
**Status:** `CANONICAL`  
**Use as:** Singular: "subscription." Plural: "subscriptions."  
**Do not use:**
- "Recurring payment" — too generic
- "Recurring expense" — acceptable as a description in help text but not as a primary label  

**Affected locations:** `finance.subscriptions`, `finance.addSubscription`, `finance.modal.makeRecurring`

---

## T

### Task
**Definition:** An item on the Daily Checklist within the Schedule module. Represents something the user intends to complete today. Can recur daily. Completion is tracked for the Life Score's Productivity dimension.  
**Type:** Noun  
**Status:** `CANONICAL`  
**Use as:** Singular: "task." Plural: "tasks."  
**Do not use:**
- "Todo" or "To-Do" — inconsistent with the product's terminology
- "Item" — too generic
- "Activity" — reserved for logged Schedule activities, not checklist items  

**Affected locations:** `dashboard.dailyTasks`, `timeline_page.daily_checklist`, `dashboard.view_all_tasks`

---

### Timeline
**Definition:** The internal code identifier for the Schedule module. Not a user-facing concept.  
**Type:** Internal ID only  
**Status:** `DEPRECATED` as a user-facing label. `INTERNAL_ONLY` for route and module key.  
**Use as:** Only in code: `module_features['timeline']`, route `/timeline`, i18n namespace `timeline_page`. Never in UI copy.  
**Do not use:** In any user-facing label, nav item, page title, empty state, or marketing copy.  

**Affected locations:** Route `/timeline`, module registry key `timeline`, i18n namespace `timeline_page`

---

### Transaction
**Definition:** A single financial record in the Finance module. Has a type (Income or Expense), amount, date, category, and optional notes.  
**Type:** Noun  
**Status:** `CANONICAL`  
**Use as:** Singular: "transaction." Plural: "transactions."  
**Do not use:**
- "Entry" as the primary label (acceptable in a confirmation context: "Remove entry")
- "Record" — too clinical  

**Affected locations:** `finance.newEntry`, `finance.table.transaction`, `finance.modal.addTitle`, `finance.feed.transactionHistory`

---

## V

### Vitality
**Definition:** The TRASON module for logging workout sessions, tracking personal records, and monitoring physical consistency across the week. Contributes to the Life Score's Health dimension.  
**Type:** Noun / Module name  
**Status:** `CANONICAL` as the user-facing label. The internal route (`/sport`) and module key (`sport`) remain for backward compatibility.  
**Use as:** "Vitality" in all user-facing labels. Never "Sport" or "Sport & Workout" in UI.  
**Do not use:**
- "Sport" in UI copy (acceptable as internal code ID)
- "Sport & Workout" — previously used in onboarding, now deprecated
- "Fitness"
- "Health" — reserved as the Life Score dimension label only  

**Affected locations:** `nav.sport` (renders as "Vitality"), `sport_page.sport_fitness_title`, onboarding module card → **[TO BE CHANGED]** from "Sport & Workout" to "Vitality"

---

## W

### Week / Weekly
**Definition:** The current calendar week (Monday–Sunday). Used as a time scope in Vitality, Schedule, and dashboard summaries.  
**Type:** Noun / Modifier  
**Status:** `CANONICAL`  
**Use as:** "This week" for the current period. "Weekly" as a modifier for recurring items or summaries.  
**Notes:** Do not use "This Week" and "Weekly" interchangeably. "This Week" scopes data to the current calendar week. "Weekly" describes a frequency or pattern.

---

## Deprecated & Forbidden Terms

The following terms have been used in TRASON copy at some point and are now officially retired. Do not reintroduce them.

| Forbidden Term | Why | Use Instead |
|---|---|---|
| Timeline | Ambiguous as a UI label; retained only as internal ID | Schedule |
| Strategic Insights | Overclaims | Insights |
| AI Insights | Inconsistent with nav label | Insights |
| Investment Analyst | Overclaims | Investments |
| Career Tracker | Redundant | Career |
| Career Architect | Never shipped; overclaims | Career |
| Smart Reminders | "Smart" is unsupported | Reminders |
| Sport & Workout | Inconsistent with nav label | Vitality |
| Financial Flow (page title) | Describes a concept, not the page | Finance |
| Predictive Category Blueprint | Overclaims | Category Budgets |
| Architect's Perspective | Meaningless; AI-generated sounding | Remove |
| Command Center | Enterprise/military tone | Remove |
| Sanctuary (empty state) | Undefined within the product | Nothing here yet. |
| Moderate Confidence (badge) | Overclaims unimplemented feature | Remove |
| Deciphering patterns | Jargon | Remove or rewrite plainly |
| Operational history | Developer-speak | Remove |
| Analysis engine | Developer-speak | Remove |
| Magnitude (table column) | Developer-speak | Amount |
| Timestamp (table column) | Developer-speak | Date |
| Classification (table column) | Developer-speak | Category |
| Refinement (table column) | Developer-speak | Actions |
| Mindful Spending | Life-coach language | Spending context (or remove) |
| Capture (primary action verb) | Inconsistent | Log / Add |
| Design Your Life (badge) | Life-coach marketing language | Personal OS or remove |
| Dompet | Indonesian in English UI | Wallet |
| digunakan | Indonesian in English UI | used |

---

## Tone Reference

When writing new copy for TRASON, use this scale:

| ✅ On-brand | ❌ Off-brand |
|---|---|
| Precise | Vague |
| Restrained | Enthusiastic |
| Confident | Boastful |
| Human | Corporate |
| Clear | Clever |
| Minimal | Verbose |
| Honest | Overclaiming |
| Specific | Generic |

**One test:** Read the sentence and ask — *"Does this sentence exist to help the user, or to impress them?"*  
If the answer is "impress," remove the sentence or simplify it.

---

## Copy Patterns to Avoid

| Pattern | Example | Why | Alternative |
|---|---|---|---|
| Rhetorical questions at app load | "Feeling overwhelmed?" | Patronizing to returning users | Remove; use brand name or silence |
| Life-coach affirmations in empty states | "Every interview is a learning opportunity." | Users are adults | Just describe the empty state |
| Unnecessary second sentences | "No reminders yet. Start by adding one." | The action is obvious | "No reminders yet." |
| ALL CAPS form labels | `TRANSACTION / MERCHANT NAME` | Aggressive, unnecessary | Use sentence case |
| Developer jargon in UI | "Magnitude," "Timestamp," "VAPID" | Users don't know these terms | Use plain language |
| "Smart" as a modifier | "Smart Reminders" | Implies intelligence that doesn't exist | Just use the noun |
| Overclaiming adjectives | "Predictive," "Strategic," "Intelligent" | Must be earned by the feature | Remove unless technically accurate |
| Emoji in form labels | "✨ Mindful Spending Notes" | Inconsistent with premium aesthetic | Remove emojis from functional labels |
| Indonesian in English UI | "Dompet," "digunakan" | Broken localization | Move all strings to i18n |

---

## Content Hierarchy

```
TRASON (Personal OS)
│
├── DASHBOARD
│   ├── Life Score (Finance · Productivity · Health · Career)
│   ├── Up Next (Reminders due today)
│   ├── Current State (Finance · Vitality · Career pillars)
│   ├── Daily Tasks (Today's checklist)
│   └── Financial Analytics (collapsible deep-dive)
│
├── SCHEDULE  [route: /timeline]
│   ├── Weekly Log (Activities this week)
│   │   └── ACTIVITY (title · duration · category · mood)
│   └── Daily Checklist (Tasks to complete today)
│       └── TASK (title · daily/recurring · completion state)
│
├── REMINDERS  [route: /reminders]
│   └── REMINDER (title · date · time · priority · push notification)
│
├── FINANCE  [route: /finance]
│   ├── TRANSACTION (income or expense entry)
│   ├── BUDGET (global monthly or per-category limit)
│   └── SUBSCRIPTION (recurring expense)
│
├── INVESTMENTS  [route: /investments]
│   └── POSITION (one tracked asset: stock · crypto · gold)
│
├── VITALITY  [route: /sport]
│   ├── SESSION (single workout log)
│   ├── Workout Plans
│   └── Personal Records
│
├── CAREER  [route: /career]
│   ├── APPLICATION (job application in pipeline)
│   └── Interview Notes (journal entries per application)
│
└── INSIGHTS  [route: /insights]
    └── AI-generated summary (user-triggered · one per session)
```

---

*This document is a living standard. Update it when introducing new features, renaming existing terms, or resolving open terminology decisions.*  
*Do not introduce new product copy without consulting this document first.*

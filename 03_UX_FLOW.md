# UX Flow & User Journey - TRASON PWA

## 1. Main User Flows

### 1.1 Onboarding Flow
```
┌─────────────┐
│   Landing   │
└──────┬──────┘
       │
       ├─► [Sign Up]
       │    ├─► Email Input
       │    ├─► Password Setup
       │    ├─► Name & Avatar
       │    └─► Preferences (Currency, Language, Timezone)
       │
       └─► [Log In]
            ├─► Email & Password
            ├─► 2FA (optional)
            └─► Welcome Dashboard
```

### 1.2 Main Dashboard Flow
```
┌──────────────────────────────────────┐
│         DASHBOARD (Home)              │
├──────────────────────────────────────┤
│  [Profile] [Notifications] [Settings]│
├──────────────────────────────────────┤
│                                       │
│  ┌─ Today's Summary Card ─┐          │
│  │ - Today's Balance      │          │
│  │ - Pending Reminders    │          │
│  │ - Mood Tracker         │          │
│  └────────────────────────┘          │
│                                       │
│  ┌─ Quick Add Buttons ─┐             │
│  │ [+ Transaction] [+ Activity]      │
│  │ [+ Reminder] [+ Log]              │
│  └─────────────────────┘             │
│                                       │
│  ┌─ Today's Activities ─┐            │
│  │ Timeline (latest first)           │
│  └──────────────────────┘            │
│                                       │
│  ┌─ Finance Widget ─┐                │
│  │ Income vs Expense (today)         │
│  │ Categories breakdown              │
│  └──────────────────┘                │
│                                       │
│  ┌─ Pending Reminders ─┐             │
│  │ Next 3 due reminders              │
│  │ [Mark Done] [Snooze]              │
│  └──────────────────────┘            │
│                                       │
│  Bottom Navigation:                  │
│  [Home] [Finance] [Timeline]         │
│  [Reminders] [Insights] [Profile]    │
└──────────────────────────────────────┘
```

### 1.3 Add Transaction Flow
```
┌──────────────────┐
│  Click "+" Button│  (from any screen)
└────────┬─────────┘
         │
    ┌────▼────┐
    │ Modal   │
    ├─────────┤
    │ Type [Income/Expense]
    │ Category (Dropdown)
    │ Amount (Number input)
    │ Date (Picker)
    │ Time (Optional)
    │ Description (Text)
    │ Tags (Optional)
    │ Receipt Photo (Optional)
    │
    │ [Save] [Cancel]
    └──────────────────
         │
         ├─► Validation
         │    └─► Amount > 0
         │    └─► Category exists
         │    └─► Date valid
         │
         ├─ Save to Server
         │    └─► Sync to backend
         │    └─► Update UI
         │
         └─► Show Success Toast
```

### 1.4 Finance Module Flow
```
┌─────────────────────────────────────┐
│      FINANCE / SPENDING PAGE         │
├─────────────────────────────────────┤
│  Filters: [Date Range] [Category]   │
├─────────────────────────────────────┤
│                                      │
│  ┌─ Summary Card ─┐                 │
│  │ Total Income: $5,000              │
│  │ Total Expense: $2,350             │
│  │ Net: $2,650                       │
│  └─────────────────┘                 │
│                                      │
│  ┌─ Pie Chart ─┐                     │
│  │ Spending by Category              │
│  │ (interactive - click for details) │
│  └──────────────┘                    │
│                                      │
│  ┌─ Transactions List ─┐             │
│  │ Date | Category | Amount | Edit   │
│  │ ──────────────────────────────── │
│  │ Today | Food | -$15.50 | [...]  │
│  │ Today | Transport | -$8.00 |[...]│
│  │ Yesterday| Salary | +$3000 |[...]│
│  │ Swipe left to edit/delete         │
│  └──────────────────────┘            │
│                                      │
│  [+ Add Transaction]                 │
└─────────────────────────────────────┘
```

### 1.5 Timeline Module Flow
```
┌────────────────────────────────────┐
│      TIMELINE / ACTIVITY LOG         │
├────────────────────────────────────┤
│  [Date Picker] View activities for: │
│  └► Today | Yesterday | Custom Date │
├────────────────────────────────────┤
│                                     │
│  ┌─ Activity 1 (Morning) ─┐        │
│  │ 06:00 - Workout         │        │
│  │ Duration: 1 hour        │        │
│  │ ⭐⭐⭐⭐⭐ (mood: Great)    │        │
│  │ #exercise #health       │        │
│  │ [View Details] [Edit]   │        │
│  └──────────────────────────┘       │
│                                     │
│  ┌─ Activity 2 (Work) ─┐            │
│  │ 09:00 - 12:00 Meeting │          │
│  │ Project: Dashboard     │          │
│  │ Attendees: John, Jane  │          │
│  │ Notes: Discussed Q2... │          │
│  │ [View Details] [Edit]  │         │
│  └────────────────────────┘         │
│                                     │
│  ┌─ Activity 3 (Lunch) ─┐           │
│  │ 12:30 - Lunch with Mom │         │
│  │ Location: Restaurant   │         │
│  │ ⭐⭐⭐⭐⭐ (mood: Happy)     │     │
│  │ [View Details] [Edit]  │         │
│  └────────────────────────┘         │
│                                     │
│  [+ Add Activity]                  │
│  [Search] [Filter by mood/category]│
└────────────────────────────────────┘
```

### 1.6 Reminders Module Flow
```
┌──────────────────────────────────┐
│        REMINDERS / TASKS          │
├──────────────────────────────────┤
│  Filter: [All] [Pending] [Done]  │
│  Sort: [Due Date] [Priority]     │
├──────────────────────────────────┤
│                                   │
│  🔴 HIGH PRIORITY                 │
│  ┌─ Reminder 1 ─┐                │
│  │ Pay Credit Card Bill           │
│  │ Due: Tomorrow 5:00 PM          │
│  │ Category: Bill                 │
│  │ Recurring: Monthly             │
│  │ [Mark Done] [Edit] [Snooze]   │
│  └────────────────────────────────┘
│                                   │
│  🟡 MEDIUM PRIORITY               │
│  ┌─ Reminder 2 ─┐                │
│  │ Team Meeting                   │
│  │ Due: Today 3:00 PM             │
│  │ Category: Appointment          │
│  │ [Mark Done] [Edit] [Snooze]   │
│  └────────────────────────────────┘
│                                   │
│  🟢 LOW PRIORITY                  │
│  ┌─ Reminder 3 ─┐                │
│  │ Call Mom Back                  │
│  │ Due: In 3 days                 │
│  │ Category: Personal             │
│  │ [Mark Done] [Edit] [Snooze]   │
│  └────────────────────────────────┘
│                                   │
│  [✓] Reminder 4 (Completed)      │
│  Buy groceries - Due: 2 days ago │
│                                   │
│  [+ Add Reminder]                │
└──────────────────────────────────┘
```

### 1.7 Create Recurring Reminder Flow
```
┌────────────────────────────────┐
│   New Reminder Dialog           │
├────────────────────────────────┤
│ Title: [Take Vitamin]          │
│ Description: [Take supplements]│
│ Category: [Health] ▼           │
│ Priority: [Medium] ▼           │
│ Due: [Today] [5:00 PM]         │
│                                 │
│ ┌─ Recurring ─────────────────┐ │
│ │ [OFF] ◀──● [ON]              │ │
│ │                              │ │
│ │ Repeat: [Daily] ▼            │ │
│ │ Until: [Never] ▼             │ │
│ │ - Sunday ☑                   │ │
│ │ - Monday ☑                   │ │
│ │ - Tuesday ☑                  │ │
│ │ - Wednesday ☑                │ │
│ │ - Thursday ☑                 │ │
│ │ - Friday ☑                   │ │
│ │ - Saturday ☑                 │ │
│ │                              │ │
│ │ Notifications:               │ │
│ │ [✓] 30 minutes before        │ │
│ │ [✓] At time                  │ │
│ └────────────────────────────┘  │
│                                  │
│ [Save & Close] [Cancel]          │
└────────────────────────────────┘
```

### 1.8 Insights / Analytics Flow
```
┌──────────────────────────────────┐
│      INSIGHTS & ANALYTICS         │
├──────────────────────────────────┤
│  View: [Daily] [Weekly] [Monthly]│
├──────────────────────────────────┤
│                                   │
│  📊 FINANCIAL INSIGHTS            │
│  ┌─ This Month's Summary ─┐      │
│  │ Income: $5,000         │      │
│  │ Expense: $2,350 (47%)  │      │
│  │ Savings: $2,650 (53%)  │      │
│  │                        │      │
│  │ vs Last Month:         │      │
│  │ ↑ +5% income           │      │
│  │ ↓ -12% expense         │      │
│  └────────────────────────┘      │
│                                   │
│  Top Expenses This Month:         │
│  1. Rent: $1,500 (64%) 📈        │
│  2. Food: $450 (19%)             │
│  3. Transport: $200 (8%)         │
│  4. Entertainment: $150 (6%)     │
│  5. Utilities: $50 (2%)          │
│                                   │
│  💡 INSIGHTS & RECOMMENDATIONS   │
│  • You spent 32% more on dining  │
│    out than usual last week      │
│  • Your most expensive category  │
│    is Rent (64% of expenses)     │
│  • Spending trend: Increasing    │
│  Recommendation: Review          │
│    discretionary spending        │
│                                   │
│  📈 ACTIVITY INSIGHTS             │
│  ┌─ Time Spent by Category ─┐   │
│  │ Work: 40 hours           │   │
│  │ Health: 5 hours          │   │
│  │ Learning: 3 hours        │   │
│  │ Entertainment: 20 hours  │   │
│  │ Rest: 56 hours           │   │
│  └─────────────────────────┘    │
│                                   │
│  📋 HABIT TRACKING                │
│  Meditation Streak: 7 days ✓     │
│  Exercise: 3 of 7 days ⚠         │
│  Reading: 2 hours this week      │
│                                   │
│  [Download Report] [Share]        │
└──────────────────────────────────┘
```

### 1.9 Settings/Preferences Flow
```
┌────────────────────────────────┐
│      SETTINGS & PREFERENCES     │
├────────────────────────────────┤
│                                 │
│  ACCOUNT                         │
│  ├─ [Profile Info]              │
│  ├─ [Email Address]             │
│  ├─ [Password]                  │
│  ├─ [Connected Devices]         │
│  └─ [Delete Account]            │
│                                  │
│  PREFERENCES                     │
│  ├─ Theme: [Light] [Dark] [Auto]│
│  ├─ Language: [English] ▼       │
│  ├─ Currency: [USD] ▼           │
│  ├─ Timezone: [GMT+7] ▼         │
│  └─ Date Format: [DD/MM/YYYY]   │
│                                  │
│  NOTIFICATIONS                   │
│  ├─ [✓] Push Notifications      │
│  ├─ [✓] Email Digest            │
│  │  Digest Frequency: [Weekly]▼ │
│  ├─ [✓] Reminder Alerts         │
│  ├─ [✓] Insights Emails         │
│  └─ [✓] Sound on Notifications  │
│                                  │
│  PRIVACY                         │
│  ├─ [✓] Analytics Tracking      │
│  ├─ [✓] Share Anonymous Stats   │
│  └─ Download Your Data          │
│                                  │
│  ABOUT                           │
│  ├─ Version: 1.0.0              │
│  ├─ Privacy Policy              │
│  ├─ Terms of Service            │
│  └─ Help & Support              │
│                                  │
│              [Log Out]           │
└────────────────────────────────┘
```

## 2. Component Hierarchy

```
App
├─ Layout
│  ├─ Header
│  ├─ NavigationBar (Bottom)
│  ├─ NotificationCenter
│  ├─ Sidebar (Desktop)
│  └─ Main Content
│
├─ Pages
│  ├─ Dashboard
│  │  ├─ SummaryCard
│  │  ├─ QuickAddButtons
│  │  ├─ ActivityTimeline
│  │  ├─ FinanceWidget
│  │  └─ ReminderWidget
│  │
│  ├─ Finance
│  │  ├─ TransactionList
│  │  ├─ Charts (Pie, Bar)
│  │  ├─ CategoryBreakdown
│  │  ├─ FilterPanel
│  │  └─ TransactionModal
│  │
│  ├─ Timeline
│  │  ├─ DatePicker
│  │  ├─ ActivityList
│  │  ├─ ActivityCard
│  │  ├─ MoodSelector
│  │  └─ SearchBar
│  │
│  ├─ Reminders
│  │  ├─ ReminderList
│  │  ├─ ReminderCard
│  │  ├─ ReminderModal
│  │  ├─ RecurrenceEditor
│  │  └─ NotificationSettings
│  │
│  ├─ Insights
│  │  ├─ InsightCard
│  │  ├─ Charts (Multiple types)
│  │  ├─ RecommendationCard
│  │  ├─ HabitTracker
│  │  └─ ReportGenerator
│  │
│  ├─ Settings
│  │  ├─ AccountSettings
│  │  ├─ PreferenceSettings
│  │  ├─ NotificationSettings
│  │  └─ PrivacySettings
│  │
│  └─ Auth
│     ├─ LoginPage
│     ├─ SignupPage
│     ├─ ForgotPasswordPage
│     └─ VerificationPage
│
└─ Modals
   ├─ AddTransactionModal
   ├─ AddActivityModal
   ├─ AddReminderModal
   ├─ ConfirmDialog
   └─ ErrorDialog
```

## 3. Mobile-First Design Principles

### 3.1 Viewport Breakpoints
```
Mobile: 320px - 480px
Tablet: 480px - 1024px
Desktop: 1024px+
```

### 3.2 Bottom Navigation (Mobile)
```
[Home] [Finance] [Timeline] [Reminders] [Profile]
```

### 3.3 Gesture Support
- Swipe left: Edit/Delete
- Swipe right: Archive/Back
- Tap & hold: More options
- Double tap: Mark as done
- Pull to refresh: Sync data

### 3.4 Accessibility (A11Y)
- WCAG 2.1 AA compliance
- Screen reader support
- Keyboard navigation
- High contrast mode
- Font size adjustable

## 4. Data Pagination & Loading

```
- Default: 20 items per page
- Infinite scroll OR traditional pagination
- Loading skeleton while fetching
- "Pull to refresh" on mobile
- Cached results shown while loading new data
```


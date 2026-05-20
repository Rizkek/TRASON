# Timeline & Reminders Integration - Visual Diagrams

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      USER INTERFACE                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐   │
│  │   Dashboard      │  │   Timeline       │  │  Reminders   │   │
│  │   (Unified View) │  │   (Daily View)   │  │  (List/Cal)  │   │
│  └────────┬─────────┘  └────────┬─────────┘  └──────┬───────┘   │
│           │                     │                    │            │
│           └─────────────────────┼────────────────────┘            │
│                                 │                                 │
│                    useSchedule Hook                              │
│               (Combined Activities + Reminders)                  │
│                                 │                                 │
└─────────────────────────────────┼─────────────────────────────────┘
                                  │
                ┌─────────────────┼─────────────────┐
                │                 │                 │
                ▼                 ▼                 ▼
          ┌──────────┐       ┌──────────┐     ┌──────────┐
          │Activities│       │Reminders │     │ Schedule │
          │ Queries  │       │ Queries  │     │ Queries  │
          └────┬─────┘       └────┬─────┘     └────┬─────┘
               │                  │                 │
               └──────────────────┼─────────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
                    ▼                           ▼
            ┌─────────────────┐       ┌──────────────────┐
            │   Supabase      │       │  Schedule Utils  │
            │   Database      │       │  (Merging,       │
            │                 │       │   Conflict       │
            │  • activities   │       │   Detection)     │
            │  • reminders    │       │                  │
            └─────────────────┘       └──────────────────┘
```

## 2. Data Flow - Weekly Schedule View (Template-Based)

```
USER OPENS WEEKLY SCHEDULE
           │
           ▼
┌─────────────────────────────────────────────────────┐
│ Which template to use for this week?               │
│ (User select or auto-select default)               │
│ Example: "My Regular Routine"                      │
└────────────┬─────────────────────────────────────────┘
             │
             ├──────────────────────────┐
             │                          │
             ▼                          ▼
      ┌────────────────┐       ┌──────────────────────┐
      │ getTemplate    │       │ checkOverride        │
      │ ByID("routine")│       │ ForWeek(startDate)   │
      │                │       │                      │
      │ Returns:       │       │ Is there an override?│
      │ - template_id  │       │ (template_overrides) │
      │ - is_active    │       │                      │
      │ - created_date │       │ If YES:              │
      └────────┬───────┘       │ Apply changes        │
               │               │                      │
               │               └──────────┬───────────┘
               │                          │
               └──────────────┬───────────┘
                              │
                              ▼
          ┌─────────────────────────────────────┐
          │ getTemplateActivities(template_id)  │
          │                                     │
          │ Returns template_activities for:   │
          │ [                                   │
          │   {                                 │
          │    day: Monday (0=Sun, 1=Mon)      │
          │    start_time: "06:30"             │
          │    duration: 60 minutes            │
          │    title: "Olahraga"               │
          │    category: "Exercise"            │
          │   },                                │
          │   {                                 │
          │    day: Monday                      │
          │    start_time: "09:00"             │
          │    duration: 540 minutes (9h)      │
          │    title: "Kerja"                  │
          │    category: "Work"                │
          │   },                                │
          │   ... (setiap hari)                │
          │ ]                                   │
          └────────────┬────────────────────────┘
                       │
                       ▼
          ┌─────────────────────────────────────┐
          │ getReminders(startDate, endDate)    │
          │ Fetch all reminders for the week    │
          │                                     │
          │ Returns:                            │
          │ [                                   │
          │   {                                 │
          │    id: "rem1"                       │
          │    title: "Bayar tagihan"          │
          │    due: Mon 18:00                  │
          │    priority: "high"                │
          │   },                                │
          │   ...                               │
          │ ]                                   │
          └────────────┬────────────────────────┘
                       │
                       ├─── (Apply any overrides) ───┐
                       │                             │
                       ▼                             │
        ┌────────────────────────────┐              │
        │ Merge Template Activities  │              │
        │ + Apply Overrides          │◄─────────────┘
        │                            │
        │ ScheduleBlock[] {          │
        │   type: "activity",        │
        │   day: "Monday",           │
        │   from_template: true,     │
        │   ...                      │
        │ }                          │
        └────────────┬───────────────┘
                     │
                     ▼
        ┌────────────────────────────┐
        │ detectConflicts()          │
        │ - Reminders vs template    │
        │ - Check overlaps           │
        │ - Check buffer time        │
        └────────────┬───────────────┘
                     │
                     ▼
        ┌────────────────────────────┐
        │ RENDER Weekly Schedule     │
        │ - Template activities      │
        │   (icon: 🔄)               │
        │ - Reminders (icon: 🔔)     │
        │ - Overrides (highlighted)  │
        │ - Conflicts                │
        └────────────────────────────┘
```

## 3. Activity Creation with Smart Reminder

```
USER CREATES ACTIVITY
│
├─ Title: "Team Meeting"
├─ Date: Monday, 12 Mei
├─ Time: 10:00 - 11:30
├─ Category: Work
│
└─► SYSTEM SHOWS OPTIONS:
    │
    ├─ ☐ Create linked reminder?
    │  └─► Reminder Title: "Prepare for Team Meeting"
    │      Auto set due_time: 09:00 (1 hour before)
    │      Priority: "high"
    │      linked_activity_id: "act_12345"
    │
    ├─ ☐ Add notification?
    │  ├─ 15 minutes before activity (09:45)
    │  ├─ 30 minutes before activity (09:30)
    │  ├─ 1 hour before activity (09:00) ← DEFAULT
    │  └─ Custom time
    │
    └─► SAVE
        │
        ├─► Create activity_id: "act_12345"
        │   activity_id --created at--> 2025-05-12 10:00:00
        │
        └─► Create reminder_id: "rem_67890"
            reminder_id --created at--> 2025-05-12 09:00:00
            linked_activity_id = "act_12345"
```

## 4. Notification Timeline

```
REMINDER: "Team Meeting Preparation" (Due: Monday 10:00)
Notification times: [15min, 30min, 1hour before]

Timeline:
─────────────────────────────────────────────────────────────
│
│  Saturday 10:00 (3 days before)
│  └─► FIRST NOTIFICATION OPTION (if long-lead enabled)
│
│  Sunday 10:00 (1 day before)
│  └─► DAILY REMINDER
│
│  Monday 08:00
│  ├─► "Don't forget: Team Meeting in 2 hours!"
│  │   └─► User can snooze (15min) or dismiss
│  │
│  Monday 09:00
│  ├─► PRIMARY NOTIFICATION
│  │   └─► "Prepare for Team Meeting - starts in 1 hour"
│  │       └─► User can snooze (5min), dismiss, or open
│  │
│  Monday 09:45
│  ├─► FINAL REMINDER
│  │   └─► "Team Meeting in 15 minutes!"
│  │
│  Monday 10:00
│  └─► ACTIVITY STARTS
│      └─► Mark activity as "in progress"
│
─────────────────────────────────────────────────────────────
```

## 5. Weekly Schedule Visualization (Template-Based)

```
┌──────────────────────────────────────────────────────────────────────────┐
│              MY SCHEDULE - WEEK OF MAY 12-18, 2025                       │
│         (Based on "My Weekly Routine" Template)                          │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  Template: "My Weekly Routine"  [Edit Template] [Select Different]       │
│                                                                            │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━    │
│                                                                            │
│  MON, 12 MAY  ┌────────────────────────────────────────────────────┐    │
│  ─────────    │ From Template: "My Weekly Routine"               │    │
│  06:30        │ [🔄 🏃 Olahraga - 1h] (Template Activity)       │    │
│  08:00        │ [☕ Sarapan - 30m] (Template Activity)           │    │
│  09:00        │ [🔔 REMINDER: Bayar tagihan (HIGH)]              │    │
│  09:00-18:00  │ [🔄 👔 Kerja - 9h] (Template Activity)          │    │
│  12:00-13:00  │ [🔄 🍽️ Makan siang] (Template Activity)         │    │
│  18:00-19:00  │ [🔄 🎓 Belajar] (Template Activity)             │    │
│  19:00        │ [🔔 REMINDER: Laporan harian (MED)]              │    │
│               │                                                    │    │
│               │ SUMMARY: 6 from template, 2 reminders             │    │
│               └────────────────────────────────────────────────────┘    │
│                                                                            │
│  TUE, 13 MAY  ┌────────────────────────────────────────────────────┐    │
│  ─────────    │ From Template: "My Weekly Routine"               │    │
│  06:30        │ [🔄 🏃 Olahraga - 1h]                            │    │
│  09:00-18:00  │ [🔄 👔 Kerja - 9h]                               │    │
│  12:00-13:00  │ [🔄 🍽️ Makan siang]                             │    │
│  14:00        │ [🔔 REMINDER: Review project (MED)]              │    │
│  18:00-19:00  │ [🔄 🎓 Belajar]                                  │    │
│  19:00-20:30  │ [🔄 👨‍👩‍👧‍👦 Family Time]                            │    │
│               │                                                    │    │
│               │ SUMMARY: 5 from template, 1 reminder              │    │
│               └────────────────────────────────────────────────────┘    │
│                                                                            │
│  WED, 14 MAY  ┌────────────────────────────────────────────────────┐    │
│  ─────────    │ OVERRIDE DETECTED ⚠️                              │    │
│  (⭕ Override │ Holiday Week - Modified Schedule                  │    │
│   from        │ [❌ REMOVED: Kerja]                               │    │
│   template)   │ [➕ ADDED: Traveling - 08:00 to 18:00]          │    │
│               │ [🏃 Olahraga - 1h] (Template)                    │    │
│               │ [🚗 Traveling - 10h] (Override)                  │    │
│               │ [🍽️ Dinner - 19:00] (Override)                  │    │
│               │                                                    │    │
│               │ Reason: Holiday trip to Bali                      │    │
│               └────────────────────────────────────────────────────┘    │
│                                                                            │
│  ... (Days kembali ke template)                                           │
│                                                                            │
│  WEEKLY STATS                                                              │
│  ─────────────                                                             │
│  Template Used:         "My Weekly Routine"                              │
│  Days with Override:    1 day (Wednesday)                                │
│  Total Activities:      32 items (from template)                         │
│  Total Reminders:       8 tasks                                          │
│  Schedule Conflicts:    0                                                │
│  Adherence to Template: 85.7% (6/7 days)                                │
│                                                                            │
│  [🔄 Edit Template] [➕ Create New Template] [⚙️ Settings]               │
│                                                                            │
└──────────────────────────────────────────────────────────────────────────┘
```

Legend:
- 🔄 = From Active Template (Recurring)
- 🔔 = Reminder/Task  
- ⚠️ = Override Applied
- ❌ = Removed from Template
- ➕ = Added to Override

## 6. Unified Schedule Component Hierarchy

```
UnifiedScheduleView
│
├─► Header
│   ├─ Week selector
│   ├─ View toggle (day/week/month)
│   └─ Export button
│
├─► ConflictAlertBanner
│   └─ Shows current conflicts/warnings
│
├─► WeeklySchedule
│   │
│   ├─► DaySchedule (x7 days)
│   │   │
│   │   ├─► TimelineBlock[] (sorted by time)
│   │   │   │
│   │   │   ├─► ActivityBlock
│   │   │   │   ├─ title
│   │   │   │   ├─ time range
│   │   │   │   ├─ category icon
│   │   │   │   └─ duration
│   │   │   │
│   │   │   └─► ReminderBlock
│   │   │       ├─ title
│   │   │       ├─ priority badge
│   │   │       ├─ status (pending/completed)
│   │   │       └─ notification icon
│   │   │
│   │   └─► DaySummary
│   │       ├─ Total items
│   │       ├─ Conflicts
│   │       └─ Free time
│   │
│   └─► WeeklySummary
│       ├─ Total activities
│       ├─ Total reminders
│       ├─ Conflicts
│       └─ Productivity score
│
└─► QuickAddButton
    └─ Create activity or reminder quickly
```

## 7. Conflict Detection Logic

```
CONFLICT CHECK PSEUDOCODE:

function detectConflicts(activities, reminders) {
  conflicts = []
  
  FOR EACH activity IN activities:
    FOR EACH reminder IN reminders:
      
      // Get time windows
      actStart = activity.start_time
      actEnd = activity.end_time
      remTime = reminder.due_datetime
      
      // Type 1: EXACT OVERLAP
      IF (remTime >= actStart AND remTime <= actEnd):
        conflicts.push({
          type: "overlap",
          severity: "error",
          message: `Reminder at ${remTime} conflicts with activity`
        })
      
      // Type 2: NO BUFFER TIME
      IF (remTime is within 15 minutes of actStart):
        conflicts.push({
          type: "no_buffer",
          severity: "warning",
          message: `Not enough prep time before activity`
        })
      
      // Type 3: BACK-TO-BACK
      IF (remTime < 30 minutes after actEnd):
        conflicts.push({
          type: "back_to_back",
          severity: "warning",
          message: `No recovery time after activity`
        })
    
    // Check multiple activities
    FOR EACH other_activity IN activities:
      IF (other_activity.id != activity.id):
        IF (overlap_exists(activity, other_activity)):
          conflicts.push({
            type: "activity_overlap",
            severity: "error"
          })
  
  RETURN conflicts
}
```

## 8. State Management Flow

```
useSchedule Hook:
├─ State Variables:
│  ├─ activities: Activity[]
│  ├─ reminders: Reminder[]
│  ├─ scheduleBlocks: ScheduleBlock[]
│  ├─ conflicts: ScheduleConflict[]
│  ├─ isLoading: boolean
│  └─ error: string | null
│
├─ Computed Values:
│  ├─ mergedBlocks = mergeScheduleBlocks(activities, reminders)
│  ├─ weekSchedule = organizeByDay(mergedBlocks)
│  └─ stats = calculateStats(activities, reminders)
│
├─ Methods:
│  ├─ fetchWeekSchedule(startDate, endDate)
│  ├─ addActivity(activity)
│  ├─ addReminder(reminder)
│  ├─ updateScheduleItem(id, type, updates)
│  ├─ deleteScheduleItem(id, type)
│  ├─ linkActivityToReminder(actId, remId)
│  └─ detectAndRefreshConflicts()
│
└─ Subscriptions:
   ├─ Watch activities changes → recalculate conflicts
   ├─ Watch reminders changes → recalculate conflicts
   └─ Watch notification times → send notifications
```

## 9. Type System

```
TimelineBlock type:
├─ ActivityBlock
│  ├─ type: "activity"
│  ├─ id: Activity.id
│  ├─ title: Activity.title
│  ├─ start: Date (from Activity.start_time)
│  ├─ end?: Date (from Activity.end_time)
│  ├─ duration_minutes?: number
│  ├─ category?: string
│  ├─ mood?: string
│  ├─ location?: string
│  ├─ color?: string
│  └─ icon?: string
│
└─ ReminderBlock
   ├─ type: "reminder"
   ├─ id: Reminder.id
   ├─ title: Reminder.title
   ├─ start: Date (from Reminder.due_datetime)
   ├─ priority: "low" | "medium" | "high"
   ├─ status: "pending" | "completed"
   ├─ linked_activity_id?: string
   ├─ color?: string (based on priority)
   ├─ icon: string ("🔔" for reminders)
   └─ notifications?: NotificationTime[]
```

---

**Note:** Diagram ini menunjukkan konsep visual dari integrasi Timeline + Reminders. Actual implementation mungkin berbeda tergantung requirement yang lebih detail.

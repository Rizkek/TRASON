# Analisis Timeline & Reminders Integration

## 📋 Daftar Isi
1. [Status Implementasi Saat Ini](#status-implementasi-saat-ini)
2. [Konsep Integrasi yang Diusulkan](#konsep-integrasi-yang-diusulkan)
3. [Arsitektur Sistem](#arsitektur-sistem)
4. [Struktur Data](#struktur-data)
5. [Alur Kerja](#alur-kerja)
6. [Roadmap Implementasi](#roadmap-implementasi)

---

## Status Implementasi Saat Ini

### Timeline (`src/app/timeline/page.tsx`)
**Tujuan:** Menampilkan jadwal aktivitas per hari dalam format timeline
- ✅ **View:** Timeline per hari (24 jam)
- ✅ **Data:** Activities dengan start_time, end_time, duration
- ✅ **Fitur:** Create, Read, Update, Delete activities
- ✅ **Kategori:** Work, Study, Exercise, Meals, Social, Rest, Personal, Other
- ✅ **Info:** Mood, rating, location, duration
- ✅ **Navigation:** Date picker untuk navigasi harian

**Struktur Activity:**
```typescript
{
  id: string;
  title: string;
  description?: string;
  category?: string;
  start_time: string;      // ISO datetime
  end_time?: string;       // ISO datetime
  duration_minutes?: number;
  mood?: string;
  rating?: number;
  location?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}
```

### Reminders (`src/app/reminders/page.tsx`)
**Tujuan:** Menampilkan pengingat/tugas dengan deadline dan prioritas
- ✅ **View:** Calendar + List view
- ✅ **Data:** Reminders dengan due_date, due_time, priority
- ✅ **Fitur:** Create, Read, Update, Delete reminders
- ✅ **Priority:** Low, Medium, High
- ✅ **Status:** Pending, Completed, Cancelled
- ⚠️ **Recurrence:** Sudah ada field tapi belum di-implement

**Struktur Reminder:**
```typescript
{
  id: string;
  title: string;
  description?: string;
  due_date?: string;
  due_time?: string;
  due_datetime?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed' | 'cancelled';
  is_recurring: boolean;
  recurrence_pattern?: string;
  notify_days_before?: number;
  notify_hours_before?: number;
  notify_times?: number[];
}
```

---

## Konsep Integrasi yang Diusulkan

### Ide Utama
Timeline dan Reminders akan bekerja sebagai **unified schedule management system** dimana:

#### 1. **Timeline = Habitual Weekly Schedule Template (Jadwal Mingguan Berulang)**
- Template jadwal seminggu yang di-**setup sekali saja** dan berlaku untuk **semua minggu**
- Aktivitas rutinitas dengan waktu yang konsisten setiap minggu
- Fokus pada **"Apa rutinitas saya setiap minggu?"** 
- Contoh:
  - **Senin-Jumat**: 06:30 Olahraga, 09:00 Kerja, 12:00 Makan siang, 18:00 Belajar
  - **Sabtu**: 08:00 Belanja, 10:00 Olahraga, 14:00 Rumah tangga
  - **Minggu**: 07:00 Santai, 10:00 Ibadah, 15:00 Family time
- Setup sekali → diterapkan ke semua minggu secara otomatis
- Fleksibel untuk override pada minggu tertentu jika ada perubahan

#### 2. **Reminders = One-time Tasks + Notifications (Tugas Penting + Notifikasi)**
- Tugas spesifik dengan deadline tertentu (bukan rutinitas)
- Bisa recurring atau one-time
- Fokus pada **"Apa yang harus saya selesaikan?"** dan **"Kapan deadline?"**
- Contoh: "Bayar tagihan" (due 25 Mei), "Review project" (due Jumat jam 17:00), "Booking tiket pesawat" (due Sabtu)

#### 3. **Integrasi Unified**
```
┌─────────────────────────────────────────────────────┐
│     WEEKLY SCHEDULE VIEW (Berdasarkan Template)      │
├─────────────────────────────────────────────────────┤
│                                                      │
│  📅 Minggu ini: 12-18 Mei 2025 (Template Apply)    │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━    │
│                                                      │
│  🔄 TEMPLATE JADWAL MINGGUAN (Setup 1x, Pakai semua minggu):
│                                                      │
│  Senin                                              │
│  ├─ 06:30 🏃 Olahraga [1h] - Template              │
│  ├─ 09:00 👔 Kerja [9h]    - Template              │
│  ├─ 12:00 🍽️ Makan siang [1h] - Template          │
│  └─ 18:00 📌 [REMINDER] Laporan harian (High)       │
│                                                      │
│  Selasa                                             │
│  ├─ 06:30 🏃 Olahraga [1h] - Template              │
│  ├─ 09:00 👔 Kerja [9h]    - Template              │
│  ├─ 12:00 🍽️ Makan siang [1h] - Template          │
│  ├─ 14:00 📌 [REMINDER] Review project (Med)        │
│  └─ 19:00 👨‍👩‍👧‍👦 Family Time [1.5h] - Template │
│                                                      │
│  ... (pola sama untuk tiap minggu) ...              │
│                                                      │
│  📌 REMINDERS (Deadline specific):                  │
│  ├─ 🔔 [HIGH] Bayar tagihan - Due: 15 Mei          │
│  ├─ 🔔 [MED] Review project - Due: 16 Mei 17:00    │
│  └─ 🔔 [LOW] Email penawaran - Due: 20 Mei         │
│                                                      │
│  ⚙️ NOTE: Override jika ada perubahan pada minggu    │
│           tertentu, tapi template tetap berlaku      │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### Keunggulan Integrasi Ini

| Aspek | Manfaat |
|-------|---------|
| **Setup Sekali Pakai Semua Minggu** | Bikin template jadwal seminggu → otomatis berlaku ke semua minggu |
| **Efisiensi Perencanaan** | Tidak perlu atur jadwal baru setiap minggu, cukup override jika ada perubahan |
| **Visibilitas 360°** | Lihat template rutinitas + reminders deadline dalam satu tempat |
| **Collision Detection** | Deteksi bentrok jadwal antara reminder dan template activities |
| **Habit Tracking** | Pantau konsistensi rutinitas mingguan (apakah mengikuti template) |
| **Flexible Override** | Tetap bisa override hari tertentu tanpa mengganggu template |
| **Smart Reminders** | Reminder berdasarkan jadwal template (e.g., 30 min sebelum kerja) |
| **Productivity Analytics** | Analisis pola mingguan & produktivitas berdasarkan template |

---

## Arsitektur Sistem

### Database Schema Enhancement

#### Existing Tables
- `activities` - Jadwal mingguan template yang recurring
- `reminders` - Tugas penting dengan deadline

#### New Tables Diusulkan

##### `weekly_templates` - Template jadwal seminggu
```sql
CREATE TABLE weekly_templates (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  name VARCHAR NOT NULL (e.g., "My Weekly Routine"),
  description TEXT,
  
  -- Template info
  is_active BOOLEAN DEFAULT TRUE,
  start_date DATE (kapan template ini mulai berlaku),
  end_date DATE (kapan template ini berakhir, NULL = selamanya),
  
  -- Timing
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  deleted_at TIMESTAMP
);
```

##### `template_activities` - Activities dalam template
```sql
CREATE TABLE template_activities (
  id UUID PRIMARY KEY,
  weekly_template_id UUID NOT NULL,
  
  -- Schedule
  day_of_week INT (0=Sunday, 1=Monday, ..., 6=Saturday),
  start_time TIME (e.g., "06:30:00"),
  duration_minutes INT,
  
  -- Activity info
  title VARCHAR NOT NULL,
  description TEXT,
  category VARCHAR,
  mood VARCHAR,
  location VARCHAR,
  
  -- Override option
  allow_override BOOLEAN DEFAULT TRUE (bisa di-skip untuk minggu tertentu?),
  
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  
  FOREIGN KEY (weekly_template_id) REFERENCES weekly_templates(id)
);
```

##### `template_overrides` - Override untuk minggu tertentu
```sql
CREATE TABLE template_overrides (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  weekly_template_id UUID NOT NULL,
  
  -- Tanggal yang di-override
  override_date DATE (tanggal mulai minggu yang di-override),
  
  -- Perubahan
  changes JSONB ({
    removed_activities: [id1, id2],
    added_activities: [activity_objects],
    modified_activities: {id: new_values}
  }),
  
  reason VARCHAR (e.g., "Holiday", "Travel", "Special event"),
  
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (weekly_template_id) REFERENCES weekly_templates(id)
);
```

#### Relasi yang Diusulkan
```
weekly_templates (1) ──── (M) template_activities
weekly_templates (1) ──── (M) template_overrides (untuk customization per minggu)
reminders (N) ──────────── (M) weekly_templates (reminder bisa link ke template)
```

### Component Architecture

```
src/
├── app/
│   ├── dashboard/
│   │   └── page.tsx (unified schedule view)
│   ├── timeline/
│   │   ├── page.tsx (daily timeline)
│   │   └── components/
│   │       ├── TimelineDay.tsx (new: weekly view)
│   │       └── TimelineWeek.tsx (new)
│   └── reminders/
│       └── page.tsx (calendar + list)
│
├── components/
│   ├── ScheduleView/
│   │   ├── UnifiedScheduleView.tsx (new: kombinasi timeline + reminders)
│   │   ├── WeeklySchedule.tsx (new)
│   │   ├── DaySchedule.tsx (new)
│   │   └── ScheduleConflictAlert.tsx (new: deteksi bentrok)
│   │
│   └── Timeline/
│       ├── TimelineBlock.tsx (new: bisa activity atau reminder)
│       └── NotificationManager.tsx (new)
│
├── hooks/
│   ├── useActivity.ts (existing)
│   ├── useReminder.ts (existing)
│   ├── useSchedule.ts (new: combined hook)
│   └── useScheduleNotifications.ts (new)
│
├── services/
│   ├── queries.ts (activity queries)
│   ├── activityQueries.ts
│   ├── reminderQueries.ts (existing)
│   └── scheduleQueries.ts (new: unified queries)
│
├── libs/
│   ├── schedule.ts (new: helper functions)
│   │   ├── getScheduleConflicts()
│   │   ├── mergeActivitiesAndReminders()
│   │   ├── calculateNotificationTimes()
│   │   └── formatScheduleBlock()
│   │
│   └── notifications.ts (new: notification logic)
│       ├── sendNotification()
│       ├── scheduleNotification()
│       └── getSoonNotifications()
│
└── types/
    └── database.ts
        ├── Activity (existing)
        ├── Reminder (existing)
        ├── ScheduleBlock (new)
        └── ScheduleConflict (new)
```

---

## Struktur Data

### Type Definitions

#### Enhanced Reminder
```typescript
export interface Reminder {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  
  // Timing
  due_date?: string;          // YYYY-MM-DD
  due_time?: string;          // HH:MM
  due_datetime?: string;      // ISO string
  
  // Schedule
  linked_activity_id?: string;  // NEW: Link ke activity jika ada
  is_all_day?: boolean;         // NEW
  
  // Priority & Status
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed' | 'cancelled';
  
  // Notifications
  notify_days_before?: number;
  notify_hours_before?: number;
  notify_times?: number[];      // Array of minutes before due time
  notification_last_sent?: string;
  
  // Recurrence
  is_recurring: boolean;
  recurrence_pattern?: string;  // 'daily', 'weekly', 'monthly'
  recurrence_end_date?: string;
  
  // Metadata
  category?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  
  created_at: string;
  updated_at: string;
}
```

#### New: ScheduleConflict
```typescript
export interface ScheduleConflict {
  type: 'overlap' | 'back-to-back' | 'no-buffer';
  activity1: Activity | Reminder;
  activity2: Activity | Reminder;
  conflictTime: string;
  severity: 'warning' | 'error';
  suggestion?: string;
}
```

#### New: ScheduleBlock (unified view)
```typescript
export interface ScheduleBlock {
  id: string;
  type: 'activity' | 'reminder' | 'break' | 'focus-time';
  title: string;
  description?: string;
  start: Date;
  end?: Date;
  duration_minutes?: number;
  priority?: 'low' | 'medium' | 'high';
  status?: 'pending' | 'completed' | 'cancelled';
  source_id: string;           // ID dari Activity atau Reminder
  source_type: 'activity' | 'reminder';
  icon?: string;
  color?: string;
  isFlexible: boolean;
}
```

---

## Alur Kerja

### 1. **Weekly Template Creation (Setup sekali)**

```
┌─────────────────────────────────────────────┐
│  User membuat Weekly Template (Setup sekali) │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│  Masukkan jadwal untuk setiap hari:         │
│  - Senin: Olahraga 06:30 (1h), Kerja 09:00 │
│  - Selasa: Olahraga 06:30 (1h), Kerja 09:00│
│  - dst...                                   │
│  - Save sebagai "My Weekly Routine"         │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│  Saved dalam: weekly_templates table        │
│  dengan template_activities untuk setiap    │
│  activity beserta day_of_week & time        │
└─────────────────────────────────────────────┘
```

### 2. **Weekly Schedule Display (Setiap minggu pakai template)**

```
┌──────────────────────────────────────────────────────┐
│  User buka Timeline/Weekly View untuk minggu tertentu │
└────────────────┬─────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────┐
│  System: Ambil active template (weekly_templates)    │
│  Fetch: template_activities berdasarkan template_id  │
└────────────────┬─────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────┐
│  Check: Ada override untuk minggu ini?               │
│  Jika ya: Apply overrides (add/remove/modify)        │
│  Jika tidak: Gunakan template as-is                  │
└────────────────┬─────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────┐
│  Fetch Reminders untuk minggu ini                    │
│  getReminders(startOfWeek, endOfWeek)               │
└────────────────┬─────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────┐
│  Merge template activities + reminders               │
│  Sort by time & day                                  │
└────────────────┬─────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────┐
│  Detect conflicts & render weekly schedule           │
│  ✓ Template activities (dengan icon "🔄")            │
│  ✓ Reminders (dengan icon "🔔")                      │
│  ✓ Overrides (dengan highlight khusus)              │
└──────────────────────────────────────────────────────┘
```

### 3. **Override Jadwal untuk Minggu Tertentu**

```
User: "Minggu depan ada liburan, skip template"
           │
           ├─→ System offers:
           │   1. Remove specific activities
           │   2. Add temporary activities
           │   3. Modify timing
           │   4. Add reason/note
           │
           └─→ Save as template_override
               (minggu berikutnya kembali ke template)
```

### 4. **Reminder Notification Flow (Sama seperti sebelumnya)**

```
Reminder dengan due_date tertentu
  ├─ Set notification times: [30 min, 1 hour before]
  ├─ Scheduled via service worker
  └─ Send notification saat waktunya
```

---

## Roadmap Implementasi

### Phase 1: Foundation - Template System (2-3 minggu)
- [ ] Create weekly_templates table
- [ ] Create template_activities table  
- [ ] Create template_overrides table
- [ ] Extend reminders table (add linked_template_activity_id)
- [ ] Create type definitions (WeeklyTemplate, TemplateActivity, TemplateOverride)
- [ ] Create template utility functions (getTemplate, applyOverride, mergeWithOverrides)
- [ ] Create `useWeeklyTemplate` hook
- [ ] Database migration script

### Phase 2: Template UI Components (2-3 minggu)
- [ ] Create `TemplateBuilder` component (setup template)
- [ ] Create `TemplateSelector` component (choose which template to use)
- [ ] Create `WeeklyScheduleView` component (display merged template + overrides)
- [ ] Create `OverrideManager` component (manage overrides per minggu)
- [ ] Create `DaySchedule` component (show day with template activities)
- [ ] Create `ScheduleConflictAlert` component
- [ ] Enhance Timeline page with template view

### Phase 3: Override & Flexibility System (1-2 minggu)
- [ ] Implement override creation UI
- [ ] Implement override modification UI
- [ ] Implement override removal UI
- [ ] Add reason/note tracking for overrides
- [ ] Add adherence tracking (% following template)
- [ ] Smart suggestions untuk conflicts

### Phase 4: Notifications & Reminders (1-2 minggu)
- [ ] Implement browser notification API
- [ ] Create notification scheduling system
- [ ] Add service worker notification logic
- [ ] Create `useScheduleNotifications` hook
- [ ] Link reminders to template activities
- [ ] Add notification preferences UI

### Phase 5: Analytics & Advanced Features (2-3 minggu)
- [ ] Analytics dashboard (adherence, patterns, productivity)
- [ ] Export schedule template
- [ ] Import schedule template
- [ ] Multiple template management
- [ ] Recurring reminders integration
- [ ] Calendar export (ICS)

### Phase 6: Testing & Optimization (1-2 minggu)
- [ ] E2E testing
- [ ] Performance optimization
- [ ] Accessibility audit
- [ ] Mobile responsiveness
- [ ] Documentation

---

## File Perubahan yang Diperlukan

### Database Migrations
```sql
-- Phase 1: Create template tables
CREATE TABLE weekly_templates (...)
CREATE TABLE template_activities (...)
CREATE TABLE template_overrides (...)

-- Extend existing tables
ALTER TABLE reminders ADD COLUMN linked_template_activity_id UUID;
ALTER TABLE reminders ADD COLUMN is_recurring_weekly BOOLEAN;
```

### New Type Definitions
- `src/types/database.ts` 
  - WeeklyTemplate
  - TemplateActivity
  - TemplateOverride
  - ScheduleBlock (updated)
  - ScheduleConflict
  - WeeklyScheduleSnapshot

### New Utility Functions
- `src/libs/template.ts` - Template operations
  - getActiveTemplate()
  - getTemplateActivitiesForWeek()
  - applyTemplateOverrides()
  - mergeTemplateWithOverrides()
  - getWeekSchedule()
  
- `src/libs/schedule.ts` - Schedule operations
  - detectConflicts()
  - calculateScheduleStats()
  - calculateNotificationTimes()

### New Hooks
- `src/hooks/useWeeklyTemplate.ts` - Template management
- `src/hooks/useWeekSchedule.ts` - Combined view
- `src/hooks/useScheduleNotifications.ts` - Notifications
- `src/hooks/useTemplateOverride.ts` - Override management

### New Components
- `src/components/Template/TemplateBuilder.tsx` - Create/edit template
- `src/components/Template/TemplateSelector.tsx` - Choose template
- `src/components/Template/OverrideManager.tsx` - Manage overrides
- `src/components/Schedule/WeeklyScheduleView.tsx` - Display schedule
- `src/components/Schedule/DaySchedule.tsx` - Day view
- `src/components/Schedule/ScheduleConflictAlert.tsx` - Conflicts

### Modified Components
- `src/app/timeline/page.tsx` - Add template-based view
- `src/app/dashboard/page.tsx` - Show template schedule
- `src/app/reminders/page.tsx` - Link to template activities

### New Services
- `src/services/templateQueries.ts` - Template queries
- `src/services/scheduleQueries.ts` - Schedule queries

---

## Contoh Implementasi (Pseudocode)

### Template Queries
```typescript
export const templateQueries = {
  async getActiveTemplate(userId: string): Promise<WeeklyTemplate> {
    // Get default active template
    const template = await db
      .from('weekly_templates')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .eq('is_default', true)
      .single();
    return template;
  },

  async getTemplateActivities(templateId: string): Promise<TemplateActivity[]> {
    const activities = await db
      .from('template_activities')
      .select('*')
      .eq('weekly_template_id', templateId)
      .order('day_of_week, start_time');
    return activities;
  },

  async getOverridesForWeek(
    userId: string,
    weekStartDate: string
  ): Promise<TemplateOverride> {
    const override = await db
      .from('template_overrides')
      .select('*')
      .eq('user_id', userId)
      .eq('week_start_date', weekStartDate)
      .maybeSingle();
    return override;
  }
};
```

### Schedule Queries
```typescript
export const scheduleQueries = {
  async getWeekSchedule(
    userId: string,
    weekStartDate: Date
  ): Promise<WeeklyScheduleSnapshot> {
    // 1. Get active template
    const template = await templateQueries.getActiveTemplate(userId);
    
    // 2. Get template activities
    const templateActivities = await templateQueries.getTemplateActivities(template.id);
    
    // 3. Check for overrides
    const override = await templateQueries.getOverridesForWeek(
      userId,
      weekStartDate.toISOString().split('T')[0]
    );
    
    // 4. Apply overrides
    let weekActivities = applyOverrides(templateActivities, override);
    
    // 5. Get reminders for the week
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekEndDate.getDate() + 6);
    const reminders = await reminderQueries.getReminders(
      weekStartDate,
      weekEndDate
    );
    
    // 6. Merge to schedule blocks
    const blocks = mergeToScheduleBlocks(weekActivities, reminders);
    
    // 7. Detect conflicts
    const conflicts = detectConflicts(blocks);
    
    // 8. Calculate stats
    const stats = calculateStats(blocks, templateActivities);
    
    return {
      week_start_date: weekStartDate.toISOString().split('T')[0],
      template_id: template.id,
      has_overrides: !!override,
      blocks,
      conflicts,
      stats
    };
  }
};
```

### Template Utility Functions
```typescript
export function applyOverrides(
  templateActivities: TemplateActivity[],
  override?: TemplateOverride
): TemplateActivity[] {
  if (!override) return templateActivities;

  let result = [...templateActivities];

  // Remove activities
  if (override.removed_activity_ids?.length > 0) {
    result = result.filter(
      (a) => !override.removed_activity_ids?.includes(a.id)
    );
  }

  // Modify activities
  if (override.modified_activities) {
    result = result.map((a) => {
      if (override.modified_activities?.[a.id]) {
        return { ...a, ...override.modified_activities[a.id] };
      }
      return a;
    });
  }

  // Add activities
  if (override.added_activities?.length > 0) {
    result.push(...override.added_activities);
  }

  return result.sort((a, b) => {
    if (a.day_of_week !== b.day_of_week) return a.day_of_week - b.day_of_week;
    return a.start_time.localeCompare(b.start_time);
  });
}

export function mergeToScheduleBlocks(
  templateActivities: TemplateActivity[],
  reminders: Reminder[]
): ScheduleBlock[] {
  const blocks: ScheduleBlock[] = [];

  // Convert template activities to blocks
  templateActivities.forEach((ta) => {
    blocks.push({
      id: `tact_${ta.id}`,
      user_id: ta.weekly_template_id, // Would need to pass user_id
      type: 'template_activity',
      title: ta.title,
      day_of_week: ta.day_of_week,
      start_time: ta.start_time,
      duration_minutes: ta.duration_minutes,
      category: ta.category,
      from_template: true,
      source_id: ta.id,
      color: getCategoryColor(ta.category),
      icon: getCategoryIcon(ta.category),
      created_at: ta.created_at,
      updated_at: ta.updated_at
    });
  });

  // Convert reminders to blocks
  reminders.forEach((r) => {
    const reminderDate = new Date(r.due_datetime || r.due_date || new Date());
    blocks.push({
      id: `rem_${r.id}`,
      user_id: r.user_id,
      type: 'reminder',
      title: r.title,
      start_time: r.due_datetime || r.due_date || new Date().toISOString(),
      priority: r.priority,
      status: r.status,
      linked_template_activity_id: r.linked_template_activity_id,
      source_id: r.id,
      color: getPriorityColor(r.priority),
      icon: '🔔',
      created_at: r.created_at,
      updated_at: r.updated_at
    });
  });

  return blocks.sort((a, b) => {
    const dayDiff = (a.day_of_week || 0) - (b.day_of_week || 0);
    if (dayDiff !== 0) return dayDiff;
    return a.start_time.localeCompare(b.start_time);
  });
}
```

---

## FAQ

### Q: Apa bedanya Timeline (Activity) dan Reminder?
**A:**
- **Timeline (Template Activities)**: 
  - Jadwal **repetitif/berulang** setiap minggu (habitual schedule)
  - Setup **sekali saja**, berlaku untuk **semua minggu**
  - Contoh: Setiap hari kerja 06:30 olahraga, setiap Senin ada meeting
  - Bisa di-override untuk minggu tertentu jika ada perubahan
  
- **Reminders**: 
  - Tugas/deadline **spesifik** yang harus diselesaikan
  - One-time atau recurring dengan waktu yang berbeda-beda
  - Contoh: "Bayar tagihan 25 Mei", "Review project Jumat 17:00"
  - Memiliki priority dan notification options

### Q: Bagaimana jika ada perubahan jadwal mingguan?
**A:** 
- Gunakan **template override** untuk minggu tertentu
- Pilih aktivitas mana yang dihapus/dimodifikasi/ditambah
- Override hanya berlaku untuk minggu itu saja
- Minggu berikutnya template kembali normal

### Q: Bisakah satu template dipakai untuk berbagai keadaan?
**A:** Ya! Anda bisa membuat multiple templates:
- "Routine - Normal Week"
- "Routine - Busy Week" 
- "Routine - Holiday"
- Aktifkan template mana yang sesuai dengan kondisi saat itu

### Q: Bagaimana reminder link ke template?
**A:** Optional feature. Reminder bisa:
1. Standalone (deadline sendiri, tidak link ke template)
2. Linked ke template activity (otomatis set notification berdasarkan template timing)
   - Contoh: Reminder "Prep meeting" → auto notify 1 jam sebelum template "Meeting" dimulai

### Q: Bagaimana notifikasi bekerja?
**A:** Menggunakan:
1. Browser Notification API (desktop)
2. Push notifications (PWA)
3. Service Worker scheduling

---

## Kesimpulan

Integrasi Timeline + Reminders akan menciptakan **unified schedule management system** dimana:

✅ **Timeline (Template-based)** = Habitual weekly activities yang setup sekali & berlaku semua minggu
✅ **Reminders** = One-time/recurring tasks dengan deadline & notifications  
✅ **Integration** = Unified weekly view dengan template application & overrides
✅ **Notifications** = Smart reminders berdasarkan schedule

Dengan sistem ini, Anda bisa:
- 📋 Setup jadwal rutin sekali saja, pakai untuk semua minggu
- 🔄 Override untuk minggu tertentu tanpa mengganggu template
- 🔔 Mendapat notifikasi untuk reminder penting
- 📊 Analisis produktivitas berdasarkan rutinitas mingguan
- 🎯 Membedakan antara kebiasaan (template) vs deadline (reminder)

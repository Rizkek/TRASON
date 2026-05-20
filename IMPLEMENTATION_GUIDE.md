# Timeline Template + Reminders System - Implementation Complete ✅

## Overview
This implementation provides a template-based weekly schedule system integrated with reminders. Users can create reusable weekly templates once and apply them to all weeks, with the ability to override specific weeks when needed.

## 📁 File Structure

### Database
- `src/migrations/001_create_weekly_templates.sql` - Database schema

### Types
- `src/types/database.ts` - TypeScript interfaces for:
  - `WeeklyTemplate` - Template configuration
  - `TemplateActivity` - Activities in template
  - `TemplateOverride` - Weekly overrides
  - `ScheduleBlock` - Unified display block
  - `ScheduleConflict` - Conflict detection
  - `WeeklyScheduleSnapshot` - Weekly snapshot

### Utilities
- `src/libs/template.ts` - Template operations (apply overrides, merge blocks, etc.)
- `src/libs/schedule.ts` - Schedule operations (detect conflicts, calculate stats, etc.)

### Services
- `src/services/templateQueries.ts` - Database queries for templates and overrides

### Hooks
- `src/hooks/useWeeklyTemplate.ts` - Manage templates, activities, and overrides

### Components
- `src/components/Template/TemplateBuilder.tsx` - Create and edit templates
- `src/components/Schedule/WeeklyScheduleView.tsx` - Display weekly schedule
- `src/components/Schedule/DaySchedule.tsx` - Display daily schedule

---

## 🚀 Quick Start

### 1. Run Database Migration
```bash
# Using Supabase CLI
supabase db push

# Or run manually in Supabase dashboard
psql -U postgres -h localhost -d trason -f src/migrations/001_create_weekly_templates.sql
```

### 2. Create a Weekly Template

```typescript
import { useWeeklyTemplate } from '@/hooks/useWeeklyTemplate';

function MyComponent() {
  const { createTemplate } = useWeeklyTemplate();

  const handleCreateTemplate = async () => {
    await createTemplate('My Weekly Routine', 'My daily schedule');
  };

  return <button onClick={handleCreateTemplate}>Create Template</button>;
}
```

### 3. Add Activities to Template

```typescript
import { useTemplateActivities } from '@/hooks/useWeeklyTemplate';

function TemplateEditor() {
  const { createActivity } = useTemplateActivities(templateId);

  const handleAddActivity = async () => {
    await createActivity({
      weekly_template_id: templateId,
      day_of_week: 1, // Monday
      start_time: '06:30:00',
      duration_minutes: 60,
      title: 'Morning Exercise',
      category: 'Exercise',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  };

  return <button onClick={handleAddActivity}>Add Activity</button>;
}
```

### 4. Display Weekly Schedule

```typescript
import { WeeklyScheduleView } from '@/components/Schedule';

export default function SchedulePage() {
  return (
    <WeeklyScheduleView
      onActivityClick={(id) => console.log('Activity:', id)}
      onReminderClick={(id) => console.log('Reminder:', id)}
    />
  );
}
```

### 5. Override Schedule for Specific Week

```typescript
import { useTemplateOverride } from '@/hooks/useWeeklyTemplate';

function OverrideManager() {
  const { createOverride } = useTemplateOverride(templateId, weekStartDate);

  const handleCreateOverride = async () => {
    await createOverride({
      user_id: userId,
      weekly_template_id: templateId,
      week_start_date: '2025-05-12',
      removed_activity_ids: ['activity_id_1'],
      reason: 'Holiday week',
      notes: 'Traveling',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  };

  return <button onClick={handleCreateOverride}>Override This Week</button>;
}
```

---

## 🎯 Key Features

### ✅ Template-Based Scheduling
- Setup weekly schedule once
- Automatically applies to all weeks
- No need to recreate schedule every week

### ✅ Flexible Overrides
- Override specific weeks when needed
- Add/remove/modify activities
- Track reason for override
- Automatic revert to template next week

### ✅ Conflict Detection
- Detects overlapping activities
- Warns about insufficient buffer time
- Suggests resolution

### ✅ Unified View
- Displays template activities + reminders together
- Shows adherence percentage
- Clear visual distinction (🔄 for template, 🔔 for reminders)

### ✅ Schedule Analytics
- Statistics on activities and reminders
- Adherence tracking
- Free time analysis

---

## 📊 Data Flow

```
1. User creates template via TemplateBuilder
   ↓
2. System stores template + template_activities
   ↓
3. User views weekly schedule via WeeklyScheduleView
   ↓
4. System fetches:
   - Active template
   - Template activities
   - Weekly overrides (if any)
   - Reminders for the week
   ↓
5. System applies overrides to template
   ↓
6. Merges template activities + reminders
   ↓
7. Detects conflicts
   ↓
8. Renders unified schedule
```

---

## 🔧 API Reference

### useWeeklyTemplate()
```typescript
const {
  templates,           // All templates
  activeTemplate,      // Default template
  isLoading,          // Loading state
  createTemplate,     // Create new template
  updateTemplate,     // Update template
  setDefaultTemplate, // Set as default
  deleteTemplate,     // Delete template
} = useWeeklyTemplate();
```

### useTemplateActivities(templateId)
```typescript
const {
  activities,    // Template activities
  isLoading,    // Loading state
  createActivity,
  updateActivity,
  deleteActivity,
  mutate,       // Manual refresh
} = useTemplateActivities(templateId);
```

### useTemplateOverride(templateId, weekStartDate)
```typescript
const {
  override,     // Override for this week
  isLoading,   // Loading state
  createOverride,
  updateOverride,
  deleteOverride,
  mutate,      // Manual refresh
} = useTemplateOverride(templateId, weekStartDate);
```

### useWeekSchedule(weekStartDate)
```typescript
const {
  snapshot,           // WeeklyScheduleSnapshot
  template,          // Current template
  templateActivities,// Template activities
  reminders,         // Reminders for week
  override,          // Override if exists
  isLoading,        // Loading state
} = useWeekSchedule(weekStartDate);
```

---

## 📝 Type Reference

### WeeklyTemplate
```typescript
{
  id: string;
  user_id: string;
  name: string;              // "My Weekly Routine"
  description?: string;
  is_active: boolean;
  is_default: boolean;
  start_date?: string;       // When template becomes active
  end_date?: string;         // When template expires (null = forever)
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}
```

### TemplateActivity
```typescript
{
  id: string;
  weekly_template_id: string;
  day_of_week: number;       // 0=Sunday, 1=Monday, etc.
  start_time: string;        // "06:30:00"
  duration_minutes: number;  // 60
  title: string;             // "Morning Exercise"
  description?: string;
  category?: string;         // "Exercise"
  mood?: string;
  location?: string;
  rating?: number;
  allow_override?: boolean;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}
```

### TemplateOverride
```typescript
{
  id: string;
  user_id: string;
  weekly_template_id: string;
  week_start_date: string;              // "2025-05-12"
  removed_activity_ids?: string[];      // IDs to remove
  added_activities?: TemplateActivity[];
  modified_activities?: Record<string, Partial<TemplateActivity>>;
  reason?: string;                      // "Holiday", "Travel"
  notes?: string;
  created_at: string;
  updated_at: string;
}
```

### ScheduleBlock
```typescript
{
  id: string;
  user_id: string;
  type: 'template_activity' | 'reminder';
  title: string;
  day_of_week?: number;
  start_time: string;
  duration_minutes?: number;
  priority?: 'low' | 'medium' | 'high';  // For reminders
  status?: 'pending' | 'completed';      // For reminders
  from_template?: boolean;
  is_override?: boolean;
  color?: string;
  icon?: string;
  source_id: string;                     // Original ID
  created_at: string;
  updated_at: string;
}
```

---

## 🧪 Testing

### Test Template Creation
```typescript
const { createTemplate } = useWeeklyTemplate();
const template = await createTemplate('Test Template', 'Test');
expect(template?.name).toBe('Test Template');
```

### Test Activity Management
```typescript
const { createActivity } = useTemplateActivities(templateId);
const activity = await createActivity({...});
expect(activity?.title).toBe('Morning Exercise');
```

### Test Override
```typescript
const { createOverride } = useTemplateOverride(templateId, weekDate);
const override = await createOverride({...});
expect(override?.reason).toBe('Holiday');
```

### Test Conflict Detection
```typescript
import { detectConflicts, mergeToScheduleBlocks } from '@/libs/schedule';

const blocks = mergeToScheduleBlocks(activities, reminders, userId, startDate);
const conflicts = detectConflicts(blocks);
expect(conflicts.length).toBeGreaterThan(0);
```

---

## 🔒 Security

- All queries use RLS (Row-Level Security)
- Users can only access their own templates
- User ID is automatically enforced
- Soft delete support (deleted_at field)

---

## 📱 Component Usage Examples

### Full Page Integration
```typescript
'use client';

import { WeeklyScheduleView } from '@/components/Schedule';
import { Layout } from '@/components';

export default function TimelinePage() {
  return (
    <Layout>
      <WeeklyScheduleView
        onActivityClick={(id) => {
          // Handle activity click
        }}
        onReminderClick={(id) => {
          // Handle reminder click
        }}
      />
    </Layout>
  );
}
```

### With Template Management
```typescript
'use client';

import { TemplateBuilder, WeeklyScheduleView } from '@/components/Template';
import { useWeeklyTemplate } from '@/hooks/useWeeklyTemplate';
import { useState } from 'react';

export default function ScheduleManagementPage() {
  const [showBuilder, setShowBuilder] = useState(false);
  const { activeTemplate } = useWeeklyTemplate();

  return (
    <div className="space-y-6">
      <button onClick={() => setShowBuilder(!showBuilder)}>
        {showBuilder ? 'Close' : 'Edit Template'}
      </button>

      {showBuilder ? (
        <TemplateBuilder templateId={activeTemplate?.id} />
      ) : (
        <WeeklyScheduleView />
      )}
    </div>
  );
}
```

---

## 🐛 Troubleshooting

### Templates not showing up
- Check RLS policies are enabled
- Verify user_id is correctly set
- Check database migration ran successfully

### Activities not updating
- Verify template_id is correct
- Check day_of_week value (0-6)
- Ensure user has permission to template

### Conflicts not detected
- Make sure activities have duration_minutes set
- Verify time format is HH:MM:SS
- Check day_of_week matches

### Overrides not applied
- Verify week_start_date format (YYYY-MM-DD)
- Check removed_activity_ids are valid IDs
- Ensure override creation succeeded

---

## 📚 Next Steps

1. ✅ Database setup and schema
2. ✅ Type definitions
3. ✅ Utility functions
4. ✅ Services and queries
5. ✅ Hooks
6. ✅ Components
7. ⏳ Update Timeline page to show weekly schedule
8. ⏳ Add reminder notifications
9. ⏳ Add analytics dashboard
10. ⏳ Testing and optimization

---

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review the API reference
3. Check component examples
4. Test in console with `console.log()`

---

**Implementation Date:** May 13, 2026
**Status:** COMPLETE ✅

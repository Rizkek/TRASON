# Timeline & Reminders Integration - Implementation Guide

## 📝 Table of Contents
1. [Quick Start](#quick-start)
2. [Database Setup](#database-setup)
3. [Type Definitions](#type-definitions)
4. [Core Utilities](#core-utilities)
5. [Hooks Implementation](#hooks-implementation)
6. [UI Components](#ui-components)
7. [Integration Steps](#integration-steps)

---

## Quick Start

### Prerequisites
- ✅ Existing Activity system (Timeline page)
- ✅ Existing Reminder system (Reminders page)
- ✅ Supabase with activities & reminders tables
- ✅ Next.js 15+ with React 18+

### Phase 1 Tasks (Week 1)
1. [ ] Extend database schema (add columns to reminders)
2. [ ] Add new type definitions
3. [ ] Create utility functions for merging/conflict detection
4. [ ] Create `useSchedule` hook

### Phase 2 Tasks (Week 2)
5. [ ] Create `UnifiedScheduleView` component
6. [ ] Create `WeeklySchedule` component
7. [ ] Enhance Timeline page with weekly view
8. [ ] Add conflict alert UI

### Phase 3 Tasks (Week 3)
9. [ ] Implement browser notifications
10. [ ] Create notification scheduling service
11. [ ] Add notification preferences
12. [ ] Testing & optimization

---

## Database Setup

### 1. Create Weekly Templates Table

```sql
-- Create weekly templates table
CREATE TABLE weekly_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  
  -- Template info
  name VARCHAR(255) NOT NULL,        -- e.g., "My Weekly Routine"
  description TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  is_default BOOLEAN DEFAULT FALSE,  -- Default template to use
  
  -- Validity
  start_date DATE,                   -- When template becomes active
  end_date DATE,                     -- When template expires (NULL = forever)
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create template activities table
CREATE TABLE template_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  weekly_template_id UUID NOT NULL,
  
  -- Day of week (0=Sunday, 1=Monday, ..., 6=Saturday)
  day_of_week INT NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  
  -- Timing
  start_time TIME NOT NULL,          -- e.g., "06:30:00"
  duration_minutes INT NOT NULL,
  
  -- Activity info
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50),              -- Work, Study, Exercise, etc.
  mood VARCHAR(50),
  location VARCHAR(255),
  rating DECIMAL(2,1),
  
  -- Options
  allow_override BOOLEAN DEFAULT TRUE, -- Can be skipped/modified?
  
  -- Metadata
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (weekly_template_id) REFERENCES weekly_templates(id) ON DELETE CASCADE
);

-- Create template overrides table (untuk customize per minggu)
CREATE TABLE template_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  weekly_template_id UUID NOT NULL,
  
  -- Week info (date of Monday of that week)
  week_start_date DATE NOT NULL,
  
  -- Changes
  removed_activity_ids UUID[] DEFAULT ARRAY[]::UUID[],  -- Activity IDs to remove
  
  added_activities JSONB,            -- Array of activity objects to add
  modified_activities JSONB,         -- Modified activity_id -> changes
  
  -- Info
  reason VARCHAR(255),               -- e.g., "Holiday", "Travel", "Sick day"
  notes TEXT,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (weekly_template_id) REFERENCES weekly_templates(id) ON DELETE CASCADE,
  UNIQUE(user_id, weekly_template_id, week_start_date)
);

-- Extend reminders table
ALTER TABLE reminders ADD COLUMN IF NOT EXISTS linked_template_activity_id UUID;
ALTER TABLE reminders ADD COLUMN IF NOT EXISTS is_recurring_weekly BOOLEAN DEFAULT FALSE;

-- Create indexes
CREATE INDEX idx_weekly_templates_user_id ON weekly_templates(user_id);
CREATE INDEX idx_weekly_templates_is_active ON weekly_templates(user_id, is_active);
CREATE INDEX idx_weekly_templates_is_default ON weekly_templates(user_id, is_default);
CREATE INDEX idx_template_activities_template_id ON template_activities(weekly_template_id);
CREATE INDEX idx_template_overrides_user_week ON template_overrides(user_id, week_start_date);
CREATE INDEX idx_reminders_linked_template ON reminders(linked_template_activity_id);
```

---

## Type Definitions

### File: `src/types/database.ts`

```typescript
// Add ke existing database.ts

/** Weekly template - Setup sekali untuk semua minggu */
export interface WeeklyTemplate {
  id: string;
  user_id: string;
  
  // Template info
  name: string;                // e.g., "My Weekly Routine"
  description?: string;
  
  // Status
  is_active: boolean;
  is_default: boolean;         // Default template to use
  
  // Validity
  start_date?: string;         // When template becomes active
  end_date?: string;           // When template expires (null = forever)
  
  // Metadata
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

/** Activity dalam weekly template */
export interface TemplateActivity {
  id: string;
  weekly_template_id: string;
  
  // Day info
  day_of_week: number;         // 0=Sunday, 1=Monday, ..., 6=Saturday
  
  // Timing
  start_time: string;          // HH:MM:SS format
  duration_minutes: number;
  
  // Activity info
  title: string;
  description?: string;
  category?: string;           // Work, Study, Exercise, etc.
  mood?: string;
  location?: string;
  rating?: number;
  
  // Options
  allow_override?: boolean;    // Can be skipped/modified?
  
  // Metadata
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

/** Override untuk minggu tertentu */
export interface TemplateOverride {
  id: string;
  user_id: string;
  weekly_template_id: string;
  
  // Week info
  week_start_date: string;     // Date of Monday of that week
  
  // Changes
  removed_activity_ids?: string[];  // Activity IDs to remove
  added_activities?: TemplateActivity[];
  modified_activities?: Record<string, Partial<TemplateActivity>>;
  
  // Info
  reason?: string;             // e.g., "Holiday", "Travel"
  notes?: string;
  
  // Metadata
  created_at: string;
  updated_at: string;
}

/** Unified schedule block (Template Activity or Reminder) */
export interface ScheduleBlock {
  id: string;
  user_id: string;
  
  // Basic info
  type: 'template_activity' | 'reminder';
  title: string;
  description?: string;
  
  // Timing
  day_of_week?: number;        // For template activities
  start_time: string;
  duration_minutes?: number;
  
  // Categorization
  category?: string;
  tags?: string[];
  
  // Template activity specific
  mood?: string;
  rating?: number;
  location?: string;
  from_template?: boolean;     // Is this from template?
  is_override?: boolean;       // Is this an override?
  
  // Reminder specific
  priority?: 'low' | 'medium' | 'high';
  status?: 'pending' | 'completed' | 'cancelled';
  linked_template_activity_id?: string;
  
  // Metadata
  source_id: string;           // Original template_activity or reminder ID
  color?: string;
  icon?: string;
  
  created_at: string;
  updated_at: string;
}

/** Schedule conflict detected */
export interface ScheduleConflict {
  id?: string;
  conflict_type: 'overlap' | 'no_buffer' | 'back_to_back';
  block1: ScheduleBlock;
  block2: ScheduleBlock;
  conflict_time: string;
  duration_minutes: number;
  severity: 'warning' | 'error';
  suggestion?: string;
  created_at?: string;
}

/** Weekly schedule snapshot */
export interface WeeklyScheduleSnapshot {
  week_start_date: string;
  template_id: string;
  has_overrides: boolean;
  blocks: ScheduleBlock[];
  conflicts: ScheduleConflict[];
  stats: {
    total_activities: number;
    total_reminders: number;
    adherence_percentage: number; // % following template
  };
}
```

---

## Core Utilities

### File: `src/libs/schedule.ts`

```typescript
import { Activity, Reminder } from '@/types/database';
import { ScheduleBlock, ScheduleConflict } from '@/types/database';

/**
 * Merge activities dan reminders menjadi unified schedule blocks
 * @param activities - Array of activities
 * @param reminders - Array of reminders
 * @returns Sorted array of schedule blocks
 */
export function mergeScheduleBlocks(
  activities: Activity[],
  reminders: Reminder[]
): ScheduleBlock[] {
  const blocks: ScheduleBlock[] = [];

  // Convert activities to blocks
  activities.forEach((activity) => {
    blocks.push({
      id: `act_${activity.id}`,
      user_id: activity.user_id,
      type: 'activity',
      title: activity.title,
      description: activity.description,
      start_time: activity.start_time,
      end_time: activity.end_time,
      duration_minutes: activity.duration_minutes,
      category: activity.category,
      tags: activity.tags,
      mood: activity.mood,
      rating: activity.rating,
      location: activity.location,
      source_id: activity.id,
      color: getCategoryColor(activity.category),
      icon: getCategoryIcon(activity.category),
      created_at: activity.created_at,
      updated_at: activity.updated_at,
    });
  });

  // Convert reminders to blocks
  reminders.forEach((reminder) => {
    blocks.push({
      id: `rem_${reminder.id}`,
      user_id: reminder.user_id,
      type: 'reminder',
      title: reminder.title,
      description: reminder.description,
      start_time: reminder.due_datetime || reminder.due_date || new Date().toISOString(),
      end_time: undefined,
      duration_minutes: undefined,
      category: reminder.category,
      tags: reminder.tags,
      priority: reminder.priority,
      status: reminder.status,
      linked_activity_id: reminder.linked_activity_id,
      is_all_day: reminder.is_all_day,
      notify_times: reminder.notify_times,
      source_id: reminder.id,
      color: getPriorityColor(reminder.priority),
      icon: '🔔',
      created_at: reminder.created_at,
      updated_at: reminder.updated_at,
    });
  });

  // Sort by start time
  return blocks.sort((a, b) => 
    new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  );
}

/**
 * Organize schedule blocks by day
 */
export function organizeByDay(blocks: ScheduleBlock[]): Record<string, ScheduleBlock[]> {
  const organized: Record<string, ScheduleBlock[]> = {};

  blocks.forEach((block) => {
    const date = new Date(block.start_time).toISOString().split('T')[0];
    if (!organized[date]) {
      organized[date] = [];
    }
    organized[date].push(block);
  });

  return organized;
}

/**
 * Detect conflicts between schedule blocks
 */
export function detectConflicts(blocks: ScheduleBlock[]): ScheduleConflict[] {
  const conflicts: ScheduleConflict[] = [];
  const BUFFER_MINUTES = 15; // Min time between blocks

  for (let i = 0; i < blocks.length; i++) {
    for (let j = i + 1; j < blocks.length; j++) {
      const block1 = blocks[i];
      const block2 = blocks[j];

      // Skip if on different days
      const date1 = block1.start_time.split('T')[0];
      const date2 = block2.start_time.split('T')[0];
      if (date1 !== date2) continue;

      const start1 = new Date(block1.start_time).getTime();
      const end1 = block1.end_time 
        ? new Date(block1.end_time).getTime()
        : start1 + (block1.duration_minutes || 0) * 60000;

      const start2 = new Date(block2.start_time).getTime();
      const end2 = block2.end_time
        ? new Date(block2.end_time).getTime()
        : start2 + (block2.duration_minutes || 0) * 60000;

      // Check for overlap
      if (!(end1 <= start2 || start1 >= end2)) {
        const overlapStart = Math.max(start1, start2);
        const overlapEnd = Math.min(end1, end2);
        const overlapDuration = Math.round((overlapEnd - overlapStart) / 60000);

        conflicts.push({
          conflict_type: 'overlap',
          block1,
          block2,
          conflict_time: new Date(overlapStart).toISOString(),
          duration_minutes: overlapDuration,
          severity: 'error',
          suggestion: `${block1.title} and ${block2.title} overlap for ${overlapDuration} minutes`,
        });
      }

      // Check for insufficient buffer
      if (end1 <= start2 && start2 - end1 < BUFFER_MINUTES * 60000) {
        conflicts.push({
          conflict_type: 'no_buffer',
          block1,
          block2,
          conflict_time: new Date(end1).toISOString(),
          duration_minutes: Math.round((start2 - end1) / 60000),
          severity: 'warning',
          suggestion: `Only ${Math.round((start2 - end1) / 60000)} minutes between ${block1.title} and ${block2.title}`,
        });
      }

      // Check for back-to-back without recovery
      if (end1 <= start2 && end1 > start2 - 30 * 60000) {
        conflicts.push({
          conflict_type: 'back_to_back',
          block1,
          block2,
          conflict_time: new Date(end1).toISOString(),
          duration_minutes: 0,
          severity: 'warning',
          suggestion: 'No recovery time after activity',
        });
      }
    }
  }

  return conflicts;
}

/**
 * Calculate notification times for a reminder
 */
export function calculateNotificationTimes(reminder: Reminder): Date[] {
  const times: Date[] = [];
  const dueDate = new Date(reminder.due_datetime || reminder.due_date || new Date());

  // Custom notify times
  if (reminder.notify_times && reminder.notify_times.length > 0) {
    reminder.notify_times.forEach((minutes) => {
      times.push(new Date(dueDate.getTime() - minutes * 60000));
    });
  }

  // Days before
  if (reminder.notify_days_before && reminder.notify_days_before > 0) {
    times.push(new Date(dueDate.getTime() - reminder.notify_days_before * 24 * 3600000));
  }

  // Hours before
  if (reminder.notify_hours_before && reminder.notify_hours_before > 0) {
    times.push(new Date(dueDate.getTime() - reminder.notify_hours_before * 3600000));
  }

  // Filter past times and duplicates
  const now = new Date();
  return [...new Set(times)]
    .filter((t) => t > now)
    .sort((a, b) => a.getTime() - b.getTime());
}

/**
 * Get color based on category
 */
export function getCategoryColor(category?: string): string {
  const colors: Record<string, string> = {
    'Work': '#3B82F6',      // blue
    'Study': '#8B5CF6',     // purple
    'Exercise': '#10B981',  // green
    'Meals': '#F59E0B',     // amber
    'Social': '#EC4899',    // pink
    'Rest': '#6366F1',      // indigo
    'Personal': '#06B6D4',  // cyan
    'Other': '#6B7280',     // gray
  };
  return colors[category || 'Other'];
}

/**
 * Get icon based on category
 */
export function getCategoryIcon(category?: string): string {
  const icons: Record<string, string> = {
    'Work': '👔',
    'Study': '🎓',
    'Exercise': '🏃',
    'Meals': '🍽️',
    'Social': '👥',
    'Rest': '😴',
    'Personal': '🎯',
    'Other': '📌',
  };
  return icons[category || 'Other'];
}

/**
 * Get color based on priority
 */
export function getPriorityColor(priority?: string): string {
  const colors: Record<string, string> = {
    'high': '#EF4444',      // red
    'medium': '#F59E0B',    // amber
    'low': '#3B82F6',       // blue
  };
  return colors[priority || 'low'];
}

/**
 * Check if two time ranges overlap
 */
export function hasTimeOverlap(
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date
): boolean {
  return !(end1 <= start2 || start1 >= end2);
}

/**
 * Format block for display
 */
export function formatScheduleBlock(block: ScheduleBlock): {
  timeRange: string;
  duration: string;
  displayText: string;
} {
  const startTime = new Date(block.start_time);
  const endTime = block.end_time ? new Date(block.end_time) : null;

  const timeRange = `${startTime.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })}${endTime ? ` - ${endTime.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })}` : ''}`;

  let duration = '';
  if (block.duration_minutes) {
    const hours = Math.floor(block.duration_minutes / 60);
    const minutes = block.duration_minutes % 60;
    if (hours > 0) {
      duration = `${hours}h${minutes > 0 ? ` ${minutes}m` : ''}`;
    } else {
      duration = `${minutes}m`;
    }
  }

  return {
    timeRange,
    duration,
    displayText: `${block.icon || ''} ${block.title} ${duration ? `(${duration})` : ''}`,
  };
}

/**
 * Calculate schedule statistics
 */
export function calculateScheduleStats(
  blocks: ScheduleBlock[],
  dateRange: { start: Date; end: Date }
): any {
  const totalDays = Math.ceil(
    (dateRange.end.getTime() - dateRange.start.getTime()) / (24 * 3600000)
  );
  const activities = blocks.filter((b) => b.type === 'activity');
  const reminders = blocks.filter((b) => b.type === 'reminder');

  const totalDuration = activities.reduce((sum, a) => sum + (a.duration_minutes || 0), 0);
  const avgDuration = activities.length > 0 ? totalDuration / activities.length : 0;

  const busyMinutes = activities.reduce((sum, a) => sum + (a.duration_minutes || 0), 0);
  const freeMinutes = (totalDays * 24 * 60) - busyMinutes;

  const productivityScore = Math.min(10, Math.round((activities.length / 10) * 10));

  const categoryCounts = activities.reduce((acc, a) => {
    acc[a.category || 'Other'] = (acc[a.category || 'Other'] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const mostCommonCategory = Object.keys(categoryCounts).reduce((a, b) =>
    categoryCounts[a] > categoryCounts[b] ? a : b,
    'Other'
  );

  return {
    total_activities: activities.length,
    total_reminders: reminders.length,
    total_blocks: blocks.length,
    free_hours: Math.round(freeMinutes / 60),
    productivity_score: productivityScore,
    busiest_day: 'Monday', // TODO: calculate
    most_common_category: mostCommonCategory,
    average_activity_duration: Math.round(avgDuration),
  };
}
```

---

## Hooks Implementation

### File: `src/hooks/useSchedule.ts`

```typescript
'use client';

import { useCallback, useMemo } from 'react';
import useSWR from 'swr';
import { useActivity } from './useActivity';
import { useReminder } from './useReminder';
import {
  mergeScheduleBlocks,
  organizeByDay,
  detectConflicts,
  calculateScheduleStats,
} from '@/libs/schedule';
import { ScheduleBlock, ScheduleConflict } from '@/types/database';

export interface UseScheduleOptions {
  startDate: Date;
  endDate: Date;
  enableConflictDetection?: boolean;
  enableStats?: boolean;
}

export function useSchedule(options: UseScheduleOptions) {
  const {
    startDate,
    endDate,
    enableConflictDetection = true,
    enableStats = true,
  } = options;

  // Fetch activities for the range
  const { activities = [] } = useActivity();
  
  // Fetch reminders for the range
  const { reminders = [] } = useReminder(startDate, endDate);

  // Generate cache key
  const cacheKey = [
    'schedule',
    startDate.toISOString().split('T')[0],
    endDate.toISOString().split('T')[0],
  ];

  // Merge and organize
  const { data: scheduleData, isLoading, error } = useSWR(
    cacheKey,
    async () => {
      const blocks = mergeScheduleBlocks(activities, reminders);
      const organized = organizeByDay(blocks);
      const conflicts = enableConflictDetection ? detectConflicts(blocks) : [];
      const stats = enableStats ? calculateScheduleStats(blocks, { start: startDate, end: endDate }) : null;

      return { blocks, organized, conflicts, stats };
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
      keepPreviousData: true,
    }
  );

  const scheduleBlocks = useMemo(() => scheduleData?.blocks || [], [scheduleData]);
  const organizedSchedule = useMemo(() => scheduleData?.organized || {}, [scheduleData]);
  const conflicts = useMemo(() => scheduleData?.conflicts || [], [scheduleData]);
  const stats = useMemo(() => scheduleData?.stats, [scheduleData]);

  // Get blocks for a specific day
  const getBlocksByDay = useCallback(
    (date: Date): ScheduleBlock[] => {
      const dateStr = date.toISOString().split('T')[0];
      return organizedSchedule[dateStr] || [];
    },
    [organizedSchedule]
  );

  // Get conflicts for a specific day
  const getConflictsByDay = useCallback(
    (date: Date): ScheduleConflict[] => {
      const dateStr = date.toISOString().split('T')[0];
      return conflicts.filter((c) => {
        const cDate = new Date(c.conflict_time).toISOString().split('T')[0];
        return cDate === dateStr;
      });
    },
    [conflicts]
  );

  // Check if time slot is free
  const isTimeFree = useCallback(
    (date: Date, startTime: Date, duration: number): boolean => {
      const endTime = new Date(startTime.getTime() + duration * 60000);
      const dayBlocks = getBlocksByDay(date);

      return !dayBlocks.some((block) => {
        const blockStart = new Date(block.start_time);
        const blockEnd = block.end_time
          ? new Date(block.end_time)
          : new Date(blockStart.getTime() + (block.duration_minutes || 0) * 60000);

        return !(endTime <= blockStart || startTime >= blockEnd);
      });
    },
    [getBlocksByDay]
  );

  return {
    scheduleBlocks,
    organizedSchedule,
    conflicts,
    stats,
    isLoading,
    error,
    getBlocksByDay,
    getConflictsByDay,
    isTimeFree,
  };
}
```

### File: `src/hooks/useScheduleNotifications.ts`

```typescript
'use client';

import { useCallback, useEffect, useRef } from 'react';
import useSWR from 'swr';
import { calculateNotificationTimes } from '@/libs/schedule';
import { Reminder } from '@/types/database';

export interface UseScheduleNotificationsOptions {
  enabled?: boolean;
  pollInterval?: number;
}

export function useScheduleNotifications(options: UseScheduleNotificationsOptions = {}) {
  const { enabled = true, pollInterval = 60000 } = options; // Poll every minute
  const notificationTimeoutRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Check for notifications that should be sent
  const checkAndSendNotifications = useCallback(async (reminders: Reminder[]) => {
    const now = new Date();

    for (const reminder of reminders) {
      if (reminder.status !== 'pending') continue;

      const notificationTimes = calculateNotificationTimes(reminder);

      for (const notifTime of notificationTimes) {
        const timeUntilNotif = notifTime.getTime() - now.getTime();

        // If notification time is within next minute, schedule it
        if (timeUntilNotif > 0 && timeUntilNotif < 60000) {
          const key = `${reminder.id}_${notifTime.getTime()}`;

          if (!notificationTimeoutRef.current.has(key)) {
            const timeout = setTimeout(() => {
              sendNotification(reminder, notifTime);
              notificationTimeoutRef.current.delete(key);
            }, timeUntilNotif);

            notificationTimeoutRef.current.set(key, timeout);
          }
        }
      }
    }
  }, []);

  // Send browser notification
  const sendNotification = useCallback(async (reminder: Reminder, time: Date) => {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return;
    }

    if (Notification.permission !== 'granted') {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return;
    }

    const notification = new Notification(reminder.title, {
      body: reminder.description || '',
      icon: '/icon-192x192.png',
      tag: `reminder-${reminder.id}`,
      badge: '/badge-72x72.png',
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  }, []);

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }, []);

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      notificationTimeoutRef.current.forEach((timeout) => clearTimeout(timeout));
    };
  }, []);

  return {
    checkAndSendNotifications,
    sendNotification,
    requestNotificationPermission,
    isNotificationsSupported: 'Notification' in window,
    isNotificationsGranted: typeof window !== 'undefined' && 'Notification' in window ? Notification.permission === 'granted' : false,
  };
}
```

---

## UI Components

### File: `src/components/ScheduleView/UnifiedScheduleView.tsx`

```typescript
'use client';

import React, { useState } from 'react';
import { useSchedule } from '@/hooks/useSchedule';
import { Button, Loading, ErrorAlert } from '@/components';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import WeeklySchedule from './WeeklySchedule';
import ScheduleConflictAlert from './ScheduleConflictAlert';

interface UnifiedScheduleViewProps {
  initialDate?: Date;
  enableConflicts?: boolean;
  onActivityClick?: (id: string) => void;
  onReminderClick?: (id: string) => void;
}

export default function UnifiedScheduleView({
  initialDate = new Date(),
  enableConflicts = true,
  onActivityClick,
  onReminderClick,
}: UnifiedScheduleViewProps) {
  const [currentDate, setCurrentDate] = useState(initialDate);
  
  // Calculate week range (Monday - Sunday)
  const startDate = new Date(currentDate);
  startDate.setDate(currentDate.getDate() - currentDate.getDay() + 1);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);
  endDate.setHours(23, 59, 59, 999);

  const { scheduleBlocks, conflicts, stats, isLoading, error, getBlocksByDay } = useSchedule({
    startDate,
    endDate,
    enableConflictDetection: enableConflicts,
    enableStats: true,
  });

  const handlePrevWeek = () => {
    const prev = new Date(currentDate);
    prev.setDate(currentDate.getDate() - 7);
    setCurrentDate(prev);
  };

  const handleNextWeek = () => {
    const next = new Date(currentDate);
    next.setDate(currentDate.getDate() + 7);
    setCurrentDate(next);
  };

  if (isLoading) return <Loading type="narrative" />;
  if (error) return <ErrorAlert title="Error" message={String(error)} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Schedule</h1>
          <p className="text-gray-500">
            {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevWeek}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextWeek}
            className="gap-2"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Conflicts Alert */}
      {conflicts.length > 0 && (
        <ScheduleConflictAlert conflicts={conflicts} />
      )}

      {/* Weekly Schedule */}
      <WeeklySchedule
        startDate={startDate}
        endDate={endDate}
        blocks={scheduleBlocks}
        getBlocksByDay={getBlocksByDay}
        onActivityClick={onActivityClick}
        onReminderClick={onReminderClick}
      />

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Activities" value={stats.total_activities} />
          <StatCard label="Reminders" value={stats.total_reminders} />
          <StatCard label="Free Hours" value={stats.free_hours} />
          <StatCard label="Productivity" value={`${stats.productivity_score}/10`} />
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
```

### File: `src/components/ScheduleView/WeeklySchedule.tsx`

```typescript
'use client';

import React from 'react';
import { ScheduleBlock } from '@/types/database';
import { formatScheduleBlock } from '@/libs/schedule';
import DaySchedule from './DaySchedule';

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface WeeklyScheduleProps {
  startDate: Date;
  endDate: Date;
  blocks: ScheduleBlock[];
  getBlocksByDay: (date: Date) => ScheduleBlock[];
  onActivityClick?: (id: string) => void;
  onReminderClick?: (id: string) => void;
}

export default function WeeklySchedule({
  startDate,
  endDate,
  blocks,
  getBlocksByDay,
  onActivityClick,
  onReminderClick,
}: WeeklyScheduleProps) {
  const days: Date[] = [];
  const current = new Date(startDate);

  while (current <= endDate) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
      {days.map((date) => (
        <DaySchedule
          key={date.toISOString()}
          date={date}
          dayName={WEEKDAYS[date.getDay()]}
          blocks={getBlocksByDay(date)}
          onActivityClick={onActivityClick}
          onReminderClick={onReminderClick}
        />
      ))}
    </div>
  );
}
```

### File: `src/components/ScheduleView/DaySchedule.tsx`

```typescript
'use client';

import React from 'react';
import { ScheduleBlock } from '@/types/database';
import { formatScheduleBlock } from '@/libs/schedule';

interface DayScheduleProps {
  date: Date;
  dayName: string;
  blocks: ScheduleBlock[];
  onActivityClick?: (id: string) => void;
  onReminderClick?: (id: string) => void;
}

export default function DaySchedule({
  date,
  dayName,
  blocks,
  onActivityClick,
  onReminderClick,
}: DayScheduleProps) {
  const formatted = formatScheduleBlock;

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">{dayName}</h3>
        <p className="text-sm text-gray-500">
          {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </p>
      </div>

      {/* Blocks */}
      <div className="divide-y divide-gray-200">
        {blocks.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            No activities or reminders
          </div>
        ) : (
          blocks.map((block) => (
            <ScheduleBlockItem
              key={block.id}
              block={block}
              formatted={formatted(block)}
              onActivityClick={onActivityClick}
              onReminderClick={onReminderClick}
            />
          ))
        )}
      </div>

      {/* Summary */}
      {blocks.length > 0 && (
        <div className="bg-gray-50 p-3 border-t border-gray-200 text-xs text-gray-600">
          {blocks.length} item{blocks.length > 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}

function ScheduleBlockItem({
  block,
  formatted,
  onActivityClick,
  onReminderClick,
}: {
  block: ScheduleBlock;
  formatted: ReturnType<typeof formatScheduleBlock>;
  onActivityClick?: (id: string) => void;
  onReminderClick?: (id: string) => void;
}) {
  const isActivity = block.type === 'activity';
  const isReminder = block.type === 'reminder';

  const handleClick = () => {
    if (isActivity) {
      onActivityClick?.(block.source_id);
    } else if (isReminder) {
      onReminderClick?.(block.source_id);
    }
  };

  return (
    <div
      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors border-l-4`}
      style={{ borderLeftColor: block.color || '#6B7280' }}
      onClick={handleClick}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <p className="font-medium text-gray-900 text-sm">
            {formatted.displayText}
          </p>
          <p className="text-xs text-gray-500 mt-1">{formatted.timeRange}</p>
        </div>
        {isReminder && block.priority && (
          <span
            className={`px-2 py-1 text-xs font-semibold rounded ${
              block.priority === 'high'
                ? 'bg-red-100 text-red-700'
                : block.priority === 'medium'
                ? 'bg-amber-100 text-amber-700'
                : 'bg-blue-100 text-blue-700'
            }`}
          >
            {block.priority}
          </span>
        )}
      </div>
    </div>
  );
}
```

### File: `src/components/ScheduleView/ScheduleConflictAlert.tsx`

```typescript
'use client';

import React from 'react';
import { Alert } from '@/components';
import { AlertTriangle, AlertCircle } from 'lucide-react';
import { ScheduleConflict } from '@/types/database';

interface ScheduleConflictAlertProps {
  conflicts: ScheduleConflict[];
}

export default function ScheduleConflictAlert({
  conflicts,
}: ScheduleConflictAlertProps) {
  if (conflicts.length === 0) return null;

  const errors = conflicts.filter((c) => c.severity === 'error');
  const warnings = conflicts.filter((c) => c.severity === 'warning');

  return (
    <div className="space-y-3">
      {errors.length > 0 && (
        <Alert
          type="error"
          title={`${errors.length} Schedule Conflict${errors.length > 1 ? 's' : ''}`}
          icon={AlertCircle}
        >
          <ul className="mt-2 space-y-1">
            {errors.map((conflict) => (
              <li key={`${conflict.block1.id}-${conflict.block2.id}`} className="text-sm">
                <span className="font-medium">{conflict.block1.title}</span>
                {' '}and{' '}
                <span className="font-medium">{conflict.block2.title}</span>
                {': '}{conflict.suggestion}
              </li>
            ))}
          </ul>
        </Alert>
      )}

      {warnings.length > 0 && (
        <Alert
          type="warning"
          title={`${warnings.length} Schedule Warning${warnings.length > 1 ? 's' : ''}`}
          icon={AlertTriangle}
        >
          <ul className="mt-2 space-y-1">
            {warnings.map((conflict) => (
              <li key={`${conflict.block1.id}-${conflict.block2.id}`} className="text-sm">
                {conflict.suggestion}
              </li>
            ))}
          </ul>
        </Alert>
      )}
    </div>
  );
}
```

---

## Integration Steps

### Step 1: Database Migration
```bash
# Run migration
psql -U postgres -h localhost -d trason -f src/migrations/001_extend_reminders.sql
```

### Step 2: Add Types
1. Update `src/types/database.ts` dengan definitions di bagian [Type Definitions](#type-definitions)

### Step 3: Add Utilities
1. Create `src/libs/schedule.ts` dengan code dari bagian [Core Utilities](#core-utilities)

### Step 4: Add Hooks
1. Create `src/hooks/useSchedule.ts`
2. Create `src/hooks/useScheduleNotifications.ts`

### Step 5: Add Components
1. Create `src/components/ScheduleView/` directory
2. Add component files dari bagian [UI Components](#ui-components)

### Step 6: Integrate to Existing Pages

#### Update Dashboard
```typescript
// src/app/dashboard/page.tsx
import UnifiedScheduleView from '@/components/ScheduleView/UnifiedScheduleView';

export default function DashboardPage() {
  return (
    <Layout>
      <UnifiedScheduleView 
        enableConflicts={true}
        onActivityClick={(id) => console.log('Activity:', id)}
        onReminderClick={(id) => console.log('Reminder:', id)}
      />
    </Layout>
  );
}
```

#### Update Timeline Page
```typescript
// src/app/timeline/page.tsx
// Add weekly view toggle
const [view, setView] = useState<'daily' | 'weekly'>('daily');

if (view === 'weekly') {
  return <UnifiedScheduleView initialDate={selectedDate} />;
}
```

---

## Testing Checklist

- [ ] Merge activities and reminders correctly
- [ ] Conflict detection works for overlaps
- [ ] Conflict detection works for buffer times
- [ ] Weekly view displays all days
- [ ] Clicking activities/reminders triggers callbacks
- [ ] Stats calculation is accurate
- [ ] Notifications are sent at correct times
- [ ] Mobile responsive design
- [ ] Performance with large schedules (100+ items/week)

---

## Next Steps

1. **Week 2-3**: Implement components and integrate to pages
2. **Week 3-4**: Add notification system
3. **Week 4-5**: Advanced features (recurring reminders, export, etc.)
4. **Week 5-6**: Testing and optimization

Good luck with the implementation! 🚀

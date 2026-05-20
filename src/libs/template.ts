'use client';

import {
  WeeklyTemplate,
  TemplateActivity,
  TemplateOverride,
  ScheduleBlock,
  ScheduleConflict,
  Reminder,
} from '@/types/database';

/**
 * Apply template overrides to template activities
 */
export function applyOverrides(
  templateActivities: TemplateActivity[],
  override?: TemplateOverride
): TemplateActivity[] {
  if (!override) return templateActivities;

  let result = [...templateActivities];
  const removedActivityIds = override.removed_activity_ids || [];
  const addedActivities = override.added_activities || [];

  // Remove activities
  if (removedActivityIds.length > 0) {
    result = result.filter((a) => !removedActivityIds.includes(a.id));
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
  if (addedActivities.length > 0) {
    result.push(...addedActivities);
  }

  // Sort by day and time
  return result.sort((a, b) => {
    if (a.day_of_week !== b.day_of_week) return a.day_of_week - b.day_of_week;
    return a.start_time.localeCompare(b.start_time);
  });
}

/**
 * Get color based on category
 */
export function getCategoryColor(category?: string): string {
  const colors: Record<string, string> = {
    Work: '#3B82F6',
    Study: '#8B5CF6',
    Exercise: '#10B981',
    Meals: '#F59E0B',
    Social: '#EC4899',
    Rest: '#6366F1',
    Personal: '#06B6D4',
    Other: '#6B7280',
  };
  return colors[category || 'Other'] || '#6B7280';
}

/**
 * Get icon based on category
 */
export function getCategoryIcon(category?: string): string {
  const icons: Record<string, string> = {
    Work: '👔',
    Study: '🎓',
    Exercise: '🏃',
    Meals: '🍽️',
    Social: '👥',
    Rest: '😴',
    Personal: '🎯',
    Other: '📌',
  };
  return icons[category || 'Other'] || '📌';
}

/**
 * Get color based on priority
 */
export function getPriorityColor(priority?: string): string {
  const colors: Record<string, string> = {
    high: '#EF4444',
    medium: '#F59E0B',
    low: '#3B82F6',
  };
  return colors[priority || 'low'] || '#3B82F6';
}

/**
 * Format time to HH:MM format
 */
export function formatTime(timeStr: string): string {
  try {
    const [hours, minutes] = timeStr.split(':');
    return `${hours}:${minutes}`;
  } catch {
    return timeStr;
  }
}

/**
 * Get day name from day_of_week number
 */
export function getDayName(dayOfWeek: number): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayOfWeek] || 'Unknown';
}

/**
 * Get short day name
 */
export function getShortDayName(dayOfWeek: number): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[dayOfWeek] || 'Unknown';
}

/**
 * Get date for a specific day of week in a given week
 */
export function getDateForDayOfWeek(weekStartDate: Date, dayOfWeek: number): Date {
  const date = new Date(weekStartDate);
  // weekStartDate is Monday (1), dayOfWeek is 0=Sunday
  // Monday is day 1, so offset is dayOfWeek - 1
  const daysToAdd = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  date.setDate(date.getDate() + daysToAdd);
  return date;
}

/**
 * Get start of week (Monday) from any date
 */
export function getWeekStartDate(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
  return new Date(d.setDate(diff));
}

/**
 * Get end of week (Sunday) from any date
 */
export function getWeekEndDate(date: Date): Date {
  const startDate = getWeekStartDate(date);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 6);
  return endDate;
}

/**
 * Format duration in minutes to readable format
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

/**
 * Convert template activity to schedule block
 */
export function convertTemplateActivityToBlock(
  ta: TemplateActivity,
  userId: string,
  weekStartDate: Date,
  isOverride: boolean = false,
  actualDate?: Date
): ScheduleBlock {
  return {
    id: `tact_${ta.id}`,
    user_id: userId,
    type: 'template_activity',
    title: ta.title,
    description: ta.description,
    day_of_week: ta.day_of_week,
    start_time: ta.start_time,
    duration_minutes: ta.duration_minutes,
    category: ta.category,
    mood: ta.mood,
    location: ta.location,
    rating: ta.rating,
    from_template: true,
    is_override: isOverride,
    source_id: ta.id,
    color: getCategoryColor(ta.category),
    icon: getCategoryIcon(ta.category),
    created_at: ta.created_at,
    updated_at: ta.updated_at,
  };
}

/**
 * Convert reminder to schedule block
 */
export function convertReminderToBlock(reminder: Reminder): ScheduleBlock {
  const dueDate = new Date(reminder.due_datetime || reminder.due_date || new Date());
  const dayOfWeek = dueDate.getDay();

  return {
    id: `rem_${reminder.id}`,
    user_id: reminder.user_id,
    type: 'reminder',
    title: reminder.title,
    description: reminder.description,
    day_of_week: dayOfWeek,
    start_time: reminder.due_time || '12:00:00',
    priority: reminder.priority,
    status: reminder.status,
    linked_template_activity_id: reminder.linked_template_activity_id,
    source_id: reminder.id,
    color: getPriorityColor(reminder.priority),
    icon: '🔔',
    created_at: reminder.created_at,
    updated_at: reminder.updated_at,
  };
}

/**
 * Merge template activities and reminders into schedule blocks
 */
export function mergeToScheduleBlocks(
  templateActivities: TemplateActivity[],
  reminders: Reminder[],
  userId: string,
  weekStartDate: Date
): ScheduleBlock[] {
  const blocks: ScheduleBlock[] = [];

  // Convert template activities
  templateActivities.forEach((ta) => {
    blocks.push(convertTemplateActivityToBlock(ta, userId, weekStartDate));
  });

  // Convert reminders
  reminders.forEach((r) => {
    blocks.push(convertReminderToBlock(r));
  });

  // Sort by day and time
  return blocks.sort((a, b) => {
    const dayDiff = (a.day_of_week || 0) - (b.day_of_week || 0);
    if (dayDiff !== 0) return dayDiff;
    return (a.start_time || '').localeCompare(b.start_time || '');
  });
}

/**
 * Check if two time ranges overlap
 */
export function hasTimeOverlap(
  startTime1: string,
  duration1: number,
  startTime2: string,
  duration2: number
): boolean {
  const [h1, m1] = startTime1.split(':').map(Number);
  const [h2, m2] = startTime2.split(':').map(Number);

  const start1Ms = (h1 * 60 + m1) * 60000;
  const end1Ms = start1Ms + duration1 * 60000;

  const start2Ms = (h2 * 60 + m2) * 60000;
  const end2Ms = start2Ms + duration2 * 60000;

  return !(end1Ms <= start2Ms || start1Ms >= end2Ms);
}

/**
 * Check if blocks overlap considering their duration
 */
export function blocksOverlap(block1: ScheduleBlock, block2: ScheduleBlock): boolean {
  // Different days - no overlap
  if (block1.day_of_week !== block2.day_of_week) {
    return false;
  }

  // Reminders have no duration consideration
  if (block1.type === 'reminder' || block2.type === 'reminder') {
    return false;
  }

  return hasTimeOverlap(
    block1.start_time,
    block1.duration_minutes || 0,
    block2.start_time,
    block2.duration_minutes || 0
  );
}

/**
 * Detect scheduling conflicts
 */
export function detectConflicts(blocks: ScheduleBlock[]): ScheduleConflict[] {
  const conflicts: ScheduleConflict[] = [];
  const BUFFER_MINUTES = 15;

  for (let i = 0; i < blocks.length; i++) {
    for (let j = i + 1; j < blocks.length; j++) {
      const block1 = blocks[i];
      const block2 = blocks[j];

      // Skip if different days
      if (block1.day_of_week !== block2.day_of_week) continue;

      // Skip if either is a reminder
      if (block1.type === 'reminder' || block2.type === 'reminder') continue;

      const [h1, m1] = block1.start_time.split(':').map(Number);
      const [h2, m2] = block2.start_time.split(':').map(Number);

      const start1 = (h1 * 60 + m1) * 60000;
      const end1 = start1 + (block1.duration_minutes || 0) * 60000;

      const start2 = (h2 * 60 + m2) * 60000;
      const end2 = start2 + (block2.duration_minutes || 0) * 60000;

      // Check for overlap
      if (!(end1 <= start2 || start1 >= end2)) {
        const overlapStart = Math.max(start1, start2);
        const overlapEnd = Math.min(end1, end2);
        const overlapMinutes = Math.round((overlapEnd - overlapStart) / 60000);

        conflicts.push({
          conflict_type: 'overlap',
          block1,
          block2,
          conflict_time: `${block1.day_of_week}`,
          duration_minutes: overlapMinutes,
          severity: 'error',
          suggestion: `${block1.title} and ${block2.title} overlap for ${overlapMinutes} minutes`,
        });
      }

      // Check for insufficient buffer
      if (end1 <= start2 && start2 - end1 < BUFFER_MINUTES * 60000) {
        conflicts.push({
          conflict_type: 'no_buffer',
          block1,
          block2,
          conflict_time: `${block1.day_of_week}`,
          duration_minutes: Math.round((start2 - end1) / 60000),
          severity: 'warning',
          suggestion: `Only ${Math.round((start2 - end1) / 60000)} minutes between ${block1.title} and ${block2.title}`,
        });
      }
    }
  }

  return conflicts;
}

/**
 * Calculate adherence percentage (% of template followed)
 */
export function calculateAdherence(
  templateActivityCount: number,
  override?: TemplateOverride
): number {
  if (templateActivityCount === 0) return 100;

  let removed = override?.removed_activity_ids?.length || 0;
  let remaining = templateActivityCount - removed;

  return Math.round((remaining / templateActivityCount) * 100);
}

/**
 * Format schedule block for display
 */
export function formatScheduleBlock(block: ScheduleBlock): string {
  const icon = block.icon || '';
  const title = block.title;
  const duration =
    block.duration_minutes && block.type === 'template_activity'
      ? ` (${formatDuration(block.duration_minutes)})`
      : '';
  const priority = block.priority ? ` [${block.priority.toUpperCase()}]` : '';

  return `${icon} ${title}${duration}${priority}`.trim();
}

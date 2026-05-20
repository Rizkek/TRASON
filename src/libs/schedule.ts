'use client';

import { ScheduleBlock, WeeklyScheduleSnapshot, TemplateActivity, Reminder } from '@/types/database';
import {
  applyOverrides,
  mergeToScheduleBlocks,
  detectConflicts,
  calculateAdherence,
  getWeekStartDate,
} from './template';

/**
 * Calculate schedule statistics
 */
export function calculateScheduleStats(
  blocks: ScheduleBlock[],
  templateActivityCount: number,
  overriddenActivityCount: number = 0
) {
  const activities = blocks.filter((b) => b.type === 'template_activity');
  const reminders = blocks.filter((b) => b.type === 'reminder');

  const totalMinutes = activities.reduce((sum, a) => sum + (a.duration_minutes || 0), 0);
  const totalHours = Math.round(totalMinutes / 60);

  // Total available minutes in a week (7 days * 24 hours)
  const totalWeekMinutes = 7 * 24 * 60;
  const freeMinutes = totalWeekMinutes - totalMinutes;

  const adheredActivities = activities.length;
  const adherencePercentage =
    templateActivityCount > 0
      ? Math.round((adheredActivities / templateActivityCount) * 100)
      : 100;

  return {
    total_activities: activities.length,
    total_reminders: reminders.length,
    total_hours: totalHours,
    free_hours: Math.round(freeMinutes / 60),
    adherence_percentage: adherencePercentage,
  };
}

/**
 * Organize blocks by day of week
 */
export function organizeByDay(blocks: ScheduleBlock[]): Record<number, ScheduleBlock[]> {
  const organized: Record<number, ScheduleBlock[]> = {};

  for (let i = 0; i <= 6; i++) {
    organized[i] = [];
  }

  blocks.forEach((block) => {
    const day = block.day_of_week || 0;
    if (!organized[day]) {
      organized[day] = [];
    }
    organized[day].push(block);
  });

  return organized;
}

/**
 * Get blocks for a specific day
 */
export function getBlocksByDay(blocks: ScheduleBlock[], dayOfWeek: number): ScheduleBlock[] {
  return blocks.filter((b) => b.day_of_week === dayOfWeek);
}

/**
 * Check if a time slot is free
 */
export function isTimeSlotFree(
  blocks: ScheduleBlock[],
  dayOfWeek: number,
  startTime: string,
  durationMinutes: number
): boolean {
  const dayBlocks = getBlocksByDay(blocks, dayOfWeek);

  const [startHour, startMin] = startTime.split(':').map(Number);
  const startMs = (startHour * 60 + startMin) * 60000;
  const endMs = startMs + durationMinutes * 60000;

  return !dayBlocks.some((block) => {
    if (block.type === 'reminder') return false; // Reminders don't block slots

    const [blockHour, blockMin] = block.start_time.split(':').map(Number);
    const blockStart = (blockHour * 60 + blockMin) * 60000;
    const blockEnd = blockStart + (block.duration_minutes || 0) * 60000;

    return !(endMs <= blockStart || startMs >= blockEnd);
  });
}

/**
 * Get available time slots for a day
 */
export function getAvailableSlots(
  blocks: ScheduleBlock[],
  dayOfWeek: number,
  slotDuration: number = 30
): Array<{ startTime: string; endTime: string }> {
  const dayBlocks = getBlocksByDay(blocks, dayOfWeek)
    .filter((b) => b.type === 'template_activity')
    .sort((a, b) => a.start_time.localeCompare(b.start_time));

  const slots: Array<{ startTime: string; endTime: string }> = [];
  let currentHour = 6; // Start from 6 AM

  for (const block of dayBlocks) {
    const [blockHour, blockMin] = block.start_time.split(':').map(Number);
    const blockStart = blockHour * 60 + blockMin;

    // Add available time before this block
    while (currentHour * 60 < blockStart) {
      const endHour = Math.min(currentHour + 1, Math.floor(blockStart / 60));
      if (endHour * 60 - currentHour * 60 >= slotDuration) {
        slots.push({
          startTime: `${String(currentHour).padStart(2, '0')}:00`,
          endTime: `${String(endHour).padStart(2, '0')}:00`,
        });
      }
      currentHour = endHour;
    }

    // Skip past this block
    const blockDuration = block.duration_minutes || 0;
    currentHour = Math.ceil((blockStart + blockDuration) / 60);
  }

  // Add remaining time until 22:00 (10 PM)
  while (currentHour < 22) {
    const endHour = Math.min(currentHour + 1, 22);
    if (endHour * 60 - currentHour * 60 >= slotDuration) {
      slots.push({
        startTime: `${String(currentHour).padStart(2, '0')}:00`,
        endTime: `${String(endHour).padStart(2, '0')}:00`,
      });
    }
    currentHour = endHour;
  }

  return slots;
}

/**
 * Create weekly schedule snapshot
 */
export function createWeeklyScheduleSnapshot(
  templateId: string,
  weekStartDate: Date,
  templateActivities: TemplateActivity[],
  reminders: Reminder[],
  userId: string,
  override?: any
): WeeklyScheduleSnapshot {
  // Apply overrides
  const mergedActivities = applyOverrides(templateActivities, override);

  // Merge to blocks
  const blocks = mergeToScheduleBlocks(mergedActivities, reminders, userId, weekStartDate);

  // Detect conflicts
  const conflicts = detectConflicts(blocks);

  // Calculate stats
  const stats = calculateScheduleStats(blocks, templateActivities.length, override ? 1 : 0);

  return {
    week_start_date: weekStartDate.toISOString().split('T')[0],
    template_id: templateId,
    has_overrides: !!override,
    blocks,
    conflicts,
    stats: {
      total_activities: stats.total_activities,
      total_reminders: stats.total_reminders,
      adherence_percentage: stats.adherence_percentage,
    },
  };
}

/**
 * Find best available time slot
 */
export function findBestTimeSlot(
  blocks: ScheduleBlock[],
  dayOfWeek: number,
  preferredHour: number = 9,
  durationMinutes: number = 60
): string | null {
  const availableSlots = getAvailableSlots(blocks, dayOfWeek, durationMinutes);

  if (availableSlots.length === 0) return null;

  // Find slot closest to preferred hour
  let bestSlot = availableSlots[0];
  let minDiff = Math.abs(parseInt(bestSlot.startTime) - preferredHour);

  for (const slot of availableSlots) {
    const slotHour = parseInt(slot.startTime);
    const diff = Math.abs(slotHour - preferredHour);

    if (diff < minDiff) {
      minDiff = diff;
      bestSlot = slot;
    }
  }

  return bestSlot.startTime;
}

/**
 * Get busy hours for a day
 */
export function getBusyHours(blocks: ScheduleBlock[], dayOfWeek: number): number {
  return blocks
    .filter((b) => b.day_of_week === dayOfWeek && b.type === 'template_activity')
    .reduce((sum, b) => sum + (b.duration_minutes || 0), 0) / 60;
}

/**
 * Get busiest days in order
 */
export function getBusiestDays(blocks: ScheduleBlock[]): Array<{ day: number; hours: number }> {
  const dayHours: Record<number, number> = {};

  for (let i = 0; i <= 6; i++) {
    dayHours[i] = getBusyHours(blocks, i);
  }

  return Object.entries(dayHours)
    .map(([day, hours]) => ({ day: parseInt(day), hours }))
    .sort((a, b) => b.hours - a.hours);
}

/**
 * Generate weekly schedule report
 */
export function generateWeeklyReport(snapshot: WeeklyScheduleSnapshot): string {
  const lines: string[] = [];

  lines.push('Weekly Schedule Report');
  lines.push(`Week: ${snapshot.week_start_date}`);
  lines.push('');

  lines.push('Statistics:');
  lines.push(`  - Routine Activities: ${snapshot.stats.total_activities}`);
  lines.push(`  - Reminders: ${snapshot.stats.total_reminders}`);
  lines.push(`  - Adherence: ${snapshot.stats.adherence_percentage}%`);
  lines.push('');

  if (snapshot.conflicts.length > 0) {
    lines.push(`Conflicts Found: ${snapshot.conflicts.length}`);
    snapshot.conflicts.forEach((c) => {
      lines.push(`  - ${c.suggestion}`);
    });
    lines.push('');
  } else {
    lines.push('No conflicts detected');
    lines.push('');
  }

  if (snapshot.has_overrides) {
    lines.push('Routine Changes Applied: Yes');
  }

  return lines.join('\n');
}

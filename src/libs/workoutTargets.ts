import type { WorkoutExercise } from '@/types/database';

type Target = Pick<WorkoutExercise, 'target_sets' | 'target_reps' | 'target_weight_kg' | 'target_distance_m' | 'target_duration_s'>;

const trim = (value: number) => String(Math.round(value * 100) / 100);

/** One line for an exercise's targets, such as "3 × 10 · 50 kg" or "5 km". Empty when nothing is set. */
export function describeTarget(exercise: Target, minuteLabel: string): string {
  const parts: string[] = [];
  if (exercise.target_sets && exercise.target_reps) parts.push(`${exercise.target_sets} × ${exercise.target_reps}`);
  if (exercise.target_weight_kg) parts.push(`${trim(exercise.target_weight_kg)} kg`);
  if (exercise.target_distance_m) parts.push(`${trim(exercise.target_distance_m / 1000)} km`);
  if (exercise.target_duration_s) parts.push(`${Math.round(exercise.target_duration_s / 60)} ${minuteLabel}`);
  return parts.join(' · ');
}

/** Monday first, the way the week is shown everywhere else. Sunday is 0 in the database. */
export const weekdayOrder = (dayOfWeek: number): number => (dayOfWeek + 6) % 7;


import { Activity, SportLog } from './supabaseClient';
import { sportQueries } from './sportQueries';

/**
 * Service for Sport Module logic and data transformations
 */

export const generateSportInsights = (activities: Activity[], sportLogs: SportLog[]) => {
  const insights: string[] = [];

  // 1. Exercise frequency this week
  const exerciseActivities = activities.filter(a => a.category === 'Exercise' || a.category === 'Sport');
  if (exerciseActivities.length > 0) {
    insights.push(`You exercised ${exerciseActivities.length} times this week. Keep it up!`);
  }

  // 2. Volume insights (lifting)
  const liftLogs = sportLogs.filter(l => l.type === 'lift');
  if (liftLogs.length > 0) {
    const totalReps = liftLogs.reduce((acc, log) => acc + (log.reps || 0) * (log.sets || 1), 0);
    insights.push(`You completed a total of ${totalReps} repetitions in your strength training.`);
  }

  // 3. Distance insights (running/cycling)
  const distanceLogs = sportLogs.filter(l => l.type === 'run' || l.type === 'cycle');
  if (distanceLogs.length > 0) {
    const totalDistanceMeters = distanceLogs.reduce((acc, log) => acc + (log.distance_meters || 0), 0);
    const totalDistanceKm = (totalDistanceMeters / 1000).toFixed(2);
    insights.push(`You covered a total of ${totalDistanceKm} km this week.`);
  }

  return insights;
};

/**
 * Format a sport log into a human-readable string for the timeline
 */
export const formatSportSummary = (log: SportLog): string => {
  switch (log.type) {
    case 'run':
      return `Ran ${(log.distance_meters || 0) / 1000}km in ${Math.floor((log.duration_seconds || 0) / 60)}m`;
    case 'lift':
      return `Lifted ${log.weight_kg}kg for ${log.sets} sets of ${log.reps}`;
    case 'cycle':
      return `Cycled ${(log.distance_meters || 0) / 1000}km`;
    default:
      return 'Logged sport activity';
  }
};

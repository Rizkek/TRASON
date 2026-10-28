/**
 * TRASON Analytics Engine — Career Analytics
 * Rule-based career insight generation. Zero AI cost.
 */

import { CareerApplication } from '@/types/database';
import { daysBetweenDates, formatDateOnly } from '@/libs/date';

const ACTIVE_STATUSES: CareerApplication['status'][] = ['applied', 'reviewing', 'interview', 'offer'];
const INTERVIEW_STATUSES: CareerApplication['status'][] = ['interview', 'offer', 'accepted'];
const OFFER_STATUSES: CareerApplication['status'][] = ['offer', 'accepted'];

/** Keys under `career_page.insights` in the i18n dictionaries; params fill `{name}` placeholders. */
export type CareerInsightKey = 'stale' | 'low_response' | 'low_interview' | 'no_active' | 'offers';

export interface CareerInsight {
  key: CareerInsightKey;
  params: Record<string, number>;
}

export interface CareerAnalytics {
  totalApplications: number;
  activeApplications: number;
  closedApplications: number;
  responseRate: number;        // % of non-withdrawn applications the company answered
  interviewRate: number;       // % of non-withdrawn applications that reached an interview
  offerRate: number;           // % of non-withdrawn applications that got an offer
  daysSinceLastApplication: number | null;
  avgDaysToInterview: number | null;
  insights: CareerInsight[];
  statusBreakdown: Record<string, number>;
}

const percent = (part: number, whole: number) => (whole > 0 ? (part / whole) * 100 : 0);

/**
 * Only the current status is stored, so an application rejected after an interview would look
 * like it never got one; a recorded interview_date counts as reaching the interview stage.
 * Withdrawn applications are left out of every rate: the user ended them, not the company.
 */
export function calculateCareerAnalytics(applications: CareerApplication[], today: Date = new Date()): CareerAnalytics {
  const total = applications.length;
  const todayStr = formatDateOnly(today);

  const active = applications.filter((a) => ACTIVE_STATUSES.includes(a.status)).length;
  const considered = applications.filter((a) => a.status !== 'withdrawn');
  const reachedInterview = (a: CareerApplication) => INTERVIEW_STATUSES.includes(a.status) || Boolean(a.interview_date);
  const responded = considered.filter((a) => a.status !== 'applied' || reachedInterview(a)).length;
  const interviewed = considered.filter(reachedInterview).length;
  const offered = considered.filter((a) => OFFER_STATUSES.includes(a.status)).length;

  const statusBreakdown: Record<string, number> = {};
  applications.forEach((a) => {
    statusBreakdown[a.status] = (statusBreakdown[a.status] || 0) + 1;
  });

  const appliedDates = applications.map((a) => formatDateOnly(a.applied_date)).sort();
  const lastApplied = appliedDates[appliedDates.length - 1];
  const daysSinceLastApplication = lastApplied ? Math.max(0, daysBetweenDates(lastApplied, todayStr)) : null;

  const interviewGaps = applications
    .filter((a) => a.interview_date && a.applied_date)
    .map((a) => daysBetweenDates(formatDateOnly(a.applied_date), formatDateOnly(a.interview_date!)))
    .filter((days) => days >= 0);
  const avgDaysToInterview =
    interviewGaps.length > 0 ? Math.round(interviewGaps.reduce((sum, d) => sum + d, 0) / interviewGaps.length) : null;

  const responseRate = percent(responded, considered.length);
  const interviewRate = percent(interviewed, considered.length);

  const insights: CareerInsight[] = [];
  const pendingOffers = applications.filter((a) => a.status === 'offer').length;
  if (pendingOffers > 0) insights.push({ key: 'offers', params: { count: pendingOffers } });
  if (total > 0 && active === 0) insights.push({ key: 'no_active', params: {} });
  if (daysSinceLastApplication !== null && daysSinceLastApplication > 14) {
    insights.push({ key: 'stale', params: { days: daysSinceLastApplication } });
  }
  if (considered.length >= 5 && responseRate < 15) {
    insights.push({ key: 'low_response', params: { rate: Math.round(responseRate) } });
  }
  if (considered.length >= 10 && interviewRate < 10) {
    insights.push({ key: 'low_interview', params: { rate: Math.round(interviewRate) } });
  }

  return {
    totalApplications: total,
    activeApplications: active,
    closedApplications: total - active,
    responseRate,
    interviewRate,
    offerRate: percent(offered, considered.length),
    daysSinceLastApplication,
    avgDaysToInterview,
    insights,
    statusBreakdown,
  };
}

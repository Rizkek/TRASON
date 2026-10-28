import { calculateCareerAnalytics } from '../analytics/careerAnalytics';
import { daysBetweenDates } from '../date';
import type { CareerApplication } from '@/types/database';

const app = (status: CareerApplication['status'], applied_date: string, interview_date?: string) =>
  ({ id: `${status}-${applied_date}`, status, applied_date, interview_date }) as CareerApplication;

const TODAY = new Date(2026, 9, 28); // 28 Oct 2026, local time

describe('daysBetweenDates', () => {
  it('counts calendar days regardless of timezone', () => {
    expect(daysBetweenDates('2026-10-01', '2026-10-28')).toBe(27);
    expect(daysBetweenDates('2026-03-28', '2026-03-30')).toBe(2);
    expect(daysBetweenDates('2026-10-28', '2026-10-27')).toBe(-1);
  });
});

describe('calculateCareerAnalytics', () => {
  it('does not count withdrawn applications as responses', () => {
    const result = calculateCareerAnalytics([app('withdrawn', '2026-08-01'), app('withdrawn', '2026-08-02')], TODAY);
    expect(result.responseRate).toBe(0);
    expect(result.activeApplications).toBe(0);
    expect(result.closedApplications).toBe(2);
  });

  it('counts a rejection after an interview as reaching the interview stage', () => {
    const result = calculateCareerAnalytics(
      [app('rejected', '2026-08-01', '2026-08-12'), app('applied', '2026-08-05')],
      TODAY
    );
    expect(result.responseRate).toBe(50);
    expect(result.interviewRate).toBe(50);
    expect(result.avgDaysToInterview).toBe(11);
  });

  it('measures days since the latest application by calendar date', () => {
    const result = calculateCareerAnalytics([app('applied', '2026-08-07'), app('rejected', '2026-07-01')], TODAY);
    expect(result.daysSinceLastApplication).toBe(82);
    expect(result.insights.map((i) => i.key)).toContain('stale');
    expect(result.insights.find((i) => i.key === 'stale')?.params).toEqual({ days: 82 });
  });

  it('flags when nothing is active and reports pending offers', () => {
    expect(calculateCareerAnalytics([app('rejected', '2026-10-20')], TODAY).insights.map((i) => i.key)).toEqual(['no_active']);
    const withOffer = calculateCareerAnalytics([app('offer', '2026-10-20'), app('accepted', '2026-09-01')], TODAY);
    expect(withOffer.insights).toEqual([{ key: 'offers', params: { count: 1 } }]);
    expect(withOffer.offerRate).toBe(100);
  });

  it('returns zeros for no applications', () => {
    const result = calculateCareerAnalytics([], TODAY);
    expect(result).toMatchObject({ totalApplications: 0, responseRate: 0, daysSinceLastApplication: null, insights: [] });
  });
});

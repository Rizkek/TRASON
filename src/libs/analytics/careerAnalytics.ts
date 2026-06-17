/**
 * TRASON Analytics Engine — Career Analytics
 * Rule-based career insight generation. Zero AI cost.
 */

import { CareerApplication } from '@/types/database';

const ACTIVE_STATUSES: CareerApplication['status'][] = ['applied', 'reviewing', 'interview', 'offer'];
const CLOSED_STATUSES: CareerApplication['status'][] = ['accepted', 'rejected', 'withdrawn'];

export interface CareerAnalytics {
  totalApplications: number;
  activeApplications: number;
  closedApplications: number;
  responseRate: number;        // % that moved beyond 'applied'
  interviewRate: number;       // % that reached interview/offer
  offerRate: number;           // % that got offer/accepted
  daysSinceLastApplication: number | null;
  avgDaysToInterview: number | null;
  insights: string[];
  statusBreakdown: Record<string, number>;
}

export function calculateCareerAnalytics(applications: CareerApplication[]): CareerAnalytics {
  const total = applications.length;

  if (total === 0) {
    return {
      totalApplications: 0,
      activeApplications: 0,
      closedApplications: 0,
      responseRate: 0,
      interviewRate: 0,
      offerRate: 0,
      daysSinceLastApplication: null,
      avgDaysToInterview: null,
      insights: ['Belum ada lamaran. Mulai rekam proses pencarian kerja Anda!'],
      statusBreakdown: {},
    };
  }

  const active = applications.filter(a => ACTIVE_STATUSES.includes(a.status)).length;
  const responded = applications.filter(a => a.status !== 'applied').length;
  const interviewed = applications.filter(a => ['interview', 'offer', 'accepted'].includes(a.status)).length;
  const offered = applications.filter(a => ['offer', 'accepted'].includes(a.status)).length;

  // Status breakdown
  const statusBreakdown: Record<string, number> = {};
  applications.forEach(a => {
    statusBreakdown[a.status] = (statusBreakdown[a.status] || 0) + 1;
  });

  // Days since last application
  const sortedByDate = [...applications].sort(
    (a, b) => new Date(b.applied_date).getTime() - new Date(a.applied_date).getTime()
  );
  const lastApp = sortedByDate[0];
  const daysSinceLastApplication = lastApp
    ? Math.floor((Date.now() - new Date(lastApp.applied_date).getTime()) / 86_400_000)
    : null;

  // Avg days to interview (rough calculation)
  const withInterviewDate = applications.filter(a => a.interview_date && a.applied_date);
  const avgDaysToInterview = withInterviewDate.length > 0
    ? Math.round(
        withInterviewDate.reduce((sum, a) => {
          const days = (new Date(a.interview_date!).getTime() - new Date(a.applied_date).getTime()) / 86_400_000;
          return sum + days;
        }, 0) / withInterviewDate.length
      )
    : null;

  // Rule-based insights
  const insights: string[] = [];

  if (daysSinceLastApplication !== null && daysSinceLastApplication > 14) {
    insights.push(`Sudah ${daysSinceLastApplication} hari tidak ada lamaran baru. Saatnya aktif kembali.`);
  }

  const responseRateVal = total > 0 ? (responded / total) * 100 : 0;
  if (total >= 5 && responseRateVal < 15) {
    insights.push(`Response rate hanya ${responseRateVal.toFixed(0)}%. Pertimbangkan untuk memperbarui resume atau cover letter.`);
  }

  const interviewRateVal = total > 0 ? (interviewed / total) * 100 : 0;
  if (total >= 10 && interviewRateVal < 10) {
    insights.push(`Interview rate ${interviewRateVal.toFixed(0)}% — coba fokus pada posisi yang lebih sesuai dengan skillset Anda.`);
  }

  if (active === 0 && total > 0) {
    insights.push('Tidak ada lamaran yang sedang aktif. Mulai lagi dengan posisi baru.');
  }

  if (offered > 0) {
    insights.push(`Selamat! Anda memiliki ${offered} penawaran kerja yang perlu ditindaklanjuti.`);
  }

  return {
    totalApplications: total,
    activeApplications: active,
    closedApplications: total - active,
    responseRate: responseRateVal,
    interviewRate: interviewRateVal,
    offerRate: total > 0 ? (offered / total) * 100 : 0,
    daysSinceLastApplication,
    avgDaysToInterview,
    insights,
    statusBreakdown,
  };
}

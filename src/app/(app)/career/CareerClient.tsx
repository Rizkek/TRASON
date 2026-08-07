'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Layout, Card, Button, Badge, Loading, Modal, Input, ErrorAlert, ConfirmModal, Select, DatePicker, CreatableAutocomplete } from '@/components';
import { useAuthStore } from '@/store/authStore';
import { useCareer } from '@/hooks/useCareer';
import { useCareerAnalytics } from '@/hooks/useCareerAnalytics';
import { CareerApplication } from '@/types/database';
import { ATSMatcher } from './components/ATSMatcher';
import { getLocalISODate } from '@/libs/format';
import { sanitizeError } from '@/libs/validation';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { Briefcase, Plus, Trash as Trash2, ArrowSquareOut as ExternalLink, Calendar, MapPin, Clock, GraduationCap, Rocket, BookOpen, Star, Target, Chat as MessageSquare, FunnelSimple, CheckCircle, Users, XCircle, Newspaper, Robot, Bell, Money } from '@phosphor-icons/react';
import { useInterviewJournal } from '@/hooks/useInterviewJournal';
import { useReminder } from '@/hooks/useReminder';
import { useHolidays } from '@/hooks/useHolidays';

const FILTER_TABS = [
  { id: 'all',       labelKey: 'all',       icon: FunnelSimple },
  { id: 'active',    labelKey: 'active',    icon: CheckCircle },
  { id: 'interview', labelKey: 'interview', icon: Users },
  { id: 'closed',    labelKey: 'closed',    icon: XCircle },
] as const;

type FilterTab = typeof FILTER_TABS[number]['id'];

const ACTIVE_STATUSES: CareerApplication['status'][] = ['applied', 'reviewing', 'interview', 'offer'];
const CLOSED_STATUSES: CareerApplication['status'][] = ['accepted', 'rejected', 'withdrawn'];

type CareerFormData = {
  company_name: string;
  role_title: string;
  application_type: CareerApplication['application_type'];
  status: CareerApplication['status'];
  applied_date: string;
  interview_date: string;
  location: string;
  work_scheme: string;
  salary_currency: string;
  salary_min: string;
  salary_max: string;
  notes: string;
  url: string;
  priority: CareerApplication['priority'];
  sync_to_reminder?: boolean;
};

const defaultForm: CareerFormData = {
  company_name: '',
  role_title: '',
  application_type: 'full_time',
  status: 'applied',
  applied_date: getLocalISODate(),
  interview_date: '',
  location: '',
  work_scheme: 'wfo',
  salary_currency: 'IDR',
  salary_min: '',
  salary_max: '',
  notes: '',
  url: '',
  priority: 'medium',
  sync_to_reminder: true,
};

function validateCareerForm(form: CareerFormData): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!form.company_name.trim()) errors.company_name = 'Company name is required';
  if (!form.role_title.trim()) errors.role_title = 'Role title is required';
  if (!form.applied_date) errors.applied_date = 'Application date is required';
  if (form.url && !/^https?:\/\//i.test(form.url)) errors.url = 'URL must start with http:// or https://';
  return errors;
}

interface Props {
  initialApplications?: CareerApplication[];
}

export default function CareerClient({ initialApplications }: Props) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const authLoading = useAuthStore((s) => s.isLoading);
  const { t } = useTranslation();
  const { locale } = useUserPreferences();

  const { applications, stats, isLoading, error, createApplication, updateApplication, deleteApplication } = useCareer(initialApplications);
  const { analytics } = useCareerAnalytics();
  const { createReminder } = useReminder();
  const { holidays } = useHolidays();

  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [editingApp, setEditingApp] = useState<CareerApplication | null>(null);
  const [form, setForm] = useState<CareerFormData>(defaultForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);

  const [mainTab, setMainTab] = useState<'applications' | 'journal' | 'ats_matcher'>('applications');

  const { journals, isLoading: journalLoading, createJournal, updateJournal, deleteJournal } = useInterviewJournal();
  const [isJournalModalOpen, setIsJournalModalOpen] = useState(false);
  const [editingJournal, setEditingJournal] = useState<any>(null);
  const [journalForm, setJournalForm] = useState<any>({
    company_name: '',
    role_title: '',
    interview_date: getLocalISODate(),
    questions_asked: '',
    difficulty: 'medium',
    outcome: 'pending',
    lessons_learned: '',
    notes: ''
  });
  const [deleteJournalConfirmId, setDeleteJournalConfirmId] = useState<string | null>(null);

  const STATUS_CONFIG: Record<
    CareerApplication['status'],
    { label: string; color: string; badgeVariant: 'default' | 'success' | 'warning' | 'danger' | 'income' | 'expense' | 'activity' | 'insight' | 'info' | undefined }
  > = {
    applied:    { label: t('career_page.form.options.status_applied'),    color: 'text-primary', badgeVariant: 'default' },
    reviewing:  { label: t('career_page.form.options.status_reviewing'),  color: 'text-amber-400', badgeVariant: 'warning' },
    interview:  { label: t('career_page.form.options.status_interview'),  color: 'text-purple-400', badgeVariant: 'info' },
    offer:      { label: t('career_page.form.options.status_offer'),      color: 'text-income', badgeVariant: 'income' },
    accepted:   { label: t('career_page.form.options.status_accepted'),   color: 'text-income', badgeVariant: 'success' },
    rejected:   { label: t('career_page.form.options.status_rejected'),   color: 'text-expense', badgeVariant: 'expense' },
    withdrawn:  { label: t('career_page.form.options.status_withdrawn'),  color: 'text-gray-light', badgeVariant: 'default' },
  };

  const TYPE_CONFIG: Record<CareerApplication['application_type'], { label: string; icon: React.ReactNode }> = {
    job:        { label: t('career_page.form.options.job'),        icon: <Briefcase size={12} className="inline mr-1" /> },
    internship: { label: t('career_page.form.options.internship'), icon: <GraduationCap size={12} className="inline mr-1" /> },
    freelance:  { label: t('career_page.form.options.freelance'),  icon: <Rocket size={12} className="inline mr-1" /> },
    full_time:  { label: t('career_page.form.options.full_time'),  icon: <Briefcase size={12} className="inline mr-1" /> },
    part_time:  { label: t('career_page.form.options.part_time'),  icon: <Clock size={12} className="inline mr-1" /> },
    contract:   { label: t('career_page.form.options.contract'),   icon: <Briefcase size={12} className="inline mr-1" /> },
  };

  const uniqueCompanies = Array.from(
    new Set([
      ...applications.map((a) => a.company_name),
      ...journals.map((j: any) => j.company_name),
    ])
  ).filter(Boolean);

  const uniqueRoles = Array.from(
    new Set([
      ...applications.map((a) => a.role_title),
      ...journals.map((j: any) => j.role_title),
    ])
  ).filter(Boolean);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login');
  }, [authLoading, isAuthenticated, router]);

  const filteredApps = applications.filter((app) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'active') return ACTIVE_STATUSES.includes(app.status);
    if (activeFilter === 'interview') return app.status === 'interview';
    if (activeFilter === 'closed') return CLOSED_STATUSES.includes(app.status);
    return true;
  });

  const openAddModal = useCallback(() => {
    setEditingApp(null);
    setForm(defaultForm);
    setFormErrors({});
    setIsModalOpen(true);
  }, []);

  const openEditModal = useCallback((app: CareerApplication) => {
    setEditingApp(app);
    let c = 'IDR';
    let sMin = '';
    let sMax = '';
    if (app.salary_range) {
      let raw = app.salary_range.trim();
      const parts = raw.split(' ');
      if (parts.length > 1 && /^[A-Z]{2,4}$/i.test(parts[0])) {
         c = parts[0].toUpperCase();
         raw = parts.slice(1).join(' ');
      }
      if (raw.includes('-')) {
        const [min, max] = raw.split('-').map(s => s.trim());
        sMin = min || '';
        sMax = max || '';
      } else {
        sMin = raw;
      }
    }
    setForm({
      company_name: app.company_name,
      role_title: app.role_title,
      application_type: app.application_type,
      status: app.status,
      applied_date: app.applied_date,
      interview_date: app.interview_date?.split('T')[0] || '',
      location: app.location || '',
      work_scheme: app.work_scheme || 'wfo',
      salary_currency: c,
      salary_min: sMin,
      salary_max: sMax,
      notes: app.notes || '',
      url: app.url || '',
      priority: app.priority,
    });
    setFormErrors({});
    setIsModalOpen(true);
  }, []);

  const openAddJournalModal = useCallback(() => {
    setEditingJournal(null);
    setJournalForm({
      company_name: '',
      role_title: '',
      interview_date: getLocalISODate(),
      questions_asked: '',
      difficulty: 'medium',
      outcome: 'pending',
      lessons_learned: '',
      notes: ''
    });
    setIsJournalModalOpen(true);
  }, []);

  const openEditJournalModal = useCallback((j: any) => {
    setEditingJournal(j);
    setJournalForm({
      company_name: j.company_name,
      role_title: j.role_title,
      interview_date: j.interview_date,
      questions_asked: j.questions_asked || '',
      difficulty: j.difficulty || 'medium',
      outcome: j.outcome || 'pending',
      lessons_learned: j.lessons_learned || '',
      notes: j.notes || ''
    });
    setIsJournalModalOpen(true);
  }, []);

  const handleSave = async () => {
    const errors = validateCareerForm(form);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSaving(true);
    setPageError(null);
    try {
      let finalSalaryRange: string | undefined = undefined;
      const minVal = form.salary_min.trim();
      const maxVal = form.salary_max.trim();
      if (minVal && maxVal) {
        finalSalaryRange = `${form.salary_currency} ${minVal} - ${maxVal}`;
      } else if (minVal) {
        finalSalaryRange = `${form.salary_currency} ${minVal}`;
      } else if (maxVal) {
        finalSalaryRange = `${form.salary_currency} Up to ${maxVal}`;
      }

      const payload = {
        company_name: form.company_name.trim(),
        role_title: form.role_title.trim(),
        application_type: form.application_type,
        status: form.status,
        applied_date: form.applied_date,
        interview_date: form.interview_date ? new Date(form.interview_date + 'T09:00:00').toISOString() : undefined,
        location: form.location.trim() || undefined,
        work_scheme: form.work_scheme || undefined,
        salary_range: finalSalaryRange,
        notes: form.notes.trim() || undefined,
        url: form.url.trim() || undefined,
        priority: form.priority,
      };

      if (editingApp) {
        await updateApplication(editingApp.id, payload);
      } else {
        await createApplication(payload as any);
      }

      if (form.interview_date && form.sync_to_reminder) {
        try {
          await createReminder({
            title: `Wawancara: ${form.role_title} @ ${form.company_name}`,
            description: `Wawancara kerja untuk posisi ${form.role_title} di ${form.company_name}.\nLokasi: ${form.location || form.work_scheme || 'WFO'}\nCatatan: ${form.notes || '-'}`,
            due_date: form.interview_date,
            due_time: '09:00',
            due_datetime: new Date(form.interview_date + 'T09:00:00').toISOString(),
            category: 'career',
            priority: 'high',
            status: 'pending',
            is_recurring: false,
            notify_times: [60, 180, 1440],
          });
        } catch (remErr) {
          console.warn('[Career] Failed to auto-create reminder:', remErr);
        }
      }

      setIsModalOpen(false);
    } catch (err) {
      setPageError(sanitizeError(err));
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await deleteApplication(deleteConfirmId);
    } catch (err) {
      setPageError(sanitizeError(err));
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const handleSaveJournal = async () => {
    setIsSaving(true);
    setPageError(null);
    try {
      const payload = {
        company_name: journalForm.company_name.trim(),
        role_title: journalForm.role_title.trim(),
        interview_date: journalForm.interview_date,
        questions_asked: journalForm.questions_asked?.trim() || undefined,
        difficulty: journalForm.difficulty,
        outcome: journalForm.outcome,
        lessons_learned: journalForm.lessons_learned?.trim() || undefined,
        notes: journalForm.notes?.trim() || undefined
      };

      if (editingJournal) {
        await updateJournal(editingJournal.id, payload);
      } else {
        await createJournal(payload);
      }
      setIsJournalModalOpen(false);
    } catch (err) {
      setPageError(sanitizeError(err));
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDeleteJournal = async () => {
    if (!deleteJournalConfirmId) return;
    try {
      await deleteJournal(deleteJournalConfirmId);
    } catch (err) {
      setPageError(sanitizeError(err));
    } finally {
      setDeleteJournalConfirmId(null);
    }
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="flex justify-center py-2xl"><Loading text={t('dashboard.checking_session')} /></div>
      </Layout>
    );
  }
  if (!isAuthenticated) return null;

  return (
    <>
      <ErrorAlert error={pageError || error} onDismiss={() => setPageError(null)} />
      <Layout>
        <div className="space-y-xl animate-fade-in pb-4xl">

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-lg">
            <div className="space-y-xs">
              <h1 className="text-5xl font-sans font-bold tracking-tight">
                {t('career_page.title')} <span className="text-warm-gold italic">{t('career_page.title_highlight')}</span>
              </h1>
              <p className="text-gray-light font-light">{t('career_page.desc')}</p>
            </div>
            <div className="hidden md:block">
              <Button 
                variant="primary" 
                onClick={mainTab === 'applications' ? openAddModal : openAddJournalModal} 
                className="rounded-full px-xl" 
                aria-label={mainTab === 'applications' ? "Add new application" : "Add new journal entry"}
              >
                <Plus size={18} className="mr-2" />
                {mainTab === 'applications' 
                  ? t('career_page.new_application') 
                  : t('career_page.interview_journal.new_entry')}
              </Button>
            </div>
          </div>

          {!isLoading && (
            <div className="flex flex-row justify-between gap-sm md:gap-md overflow-x-auto snap-x no-scrollbar pb-2">
              {[
                { label: t('career_page.stats.applied'), value: stats.applied, color: 'text-primary' },
                { label: t('career_page.stats.reviewing'), value: stats.reviewing, color: 'text-amber-400' },
                { label: t('career_page.stats.interview'), value: stats.interview, color: 'text-purple-400' },
                { label: t('career_page.stats.offer'), value: stats.offer, color: 'text-income' },
              ].map((s) => (
                <Card key={s.label} className="glass border-none p-sm md:p-xl text-center flex-1 min-w-[70px] snap-center">
                  <p className={`text-xl md:text-3xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-[8px] md:text-xs text-gray-light uppercase tracking-widest mt-1 md:mt-xs">{s.label}</p>
                </Card>
              ))}
            </div>
          )}

          {!isLoading && analytics && analytics.totalApplications > 0 && (
            <Card className="p-sm md:p-lg border border-black/[0.05] dark:border-white/[0.05] bg-black/[0.02]">
              <div className="flex items-center gap-md sm:gap-xl overflow-x-auto snap-x no-scrollbar flex-nowrap pb-1">
                <div className="text-center shrink-0 snap-center">
                  <p className="text-md md:text-lg font-bold text-white">{analytics.responseRate.toFixed(0)}%</p>
                  <p className="text-[8px] md:text-[10px] text-gray-light uppercase tracking-widest hidden md:block">{t('career_page.stats_labels.responseRate')}</p>
                  <p className="text-[8px] md:hidden text-gray-light uppercase tracking-widest">{t('career_page.stats_labels.resp')}</p>
                </div>
                <div className="w-px h-6 md:h-8 bg-white/10 hidden sm:block" />
                <div className="text-center shrink-0 snap-center">
                  <p className="text-md md:text-lg font-bold text-white">{analytics.interviewRate.toFixed(0)}%</p>
                  <p className="text-[8px] md:text-[10px] text-gray-light uppercase tracking-widest hidden md:block">{t('career_page.stats_labels.interviewRate')}</p>
                  <p className="text-[8px] md:hidden text-gray-light uppercase tracking-widest">{t('career_page.stats_labels.intv')}</p>
                </div>
                <div className="w-px h-6 md:h-8 bg-white/10 hidden sm:block" />
                <div className="text-center shrink-0 snap-center">
                  <p className="text-md md:text-lg font-bold text-white">{analytics.offerRate.toFixed(0)}%</p>
                  <p className="text-[8px] md:text-[10px] text-gray-light uppercase tracking-widest hidden md:block">{t('career_page.stats_labels.offerRate')}</p>
                  <p className="text-[8px] md:hidden text-gray-light uppercase tracking-widest">{t('career_page.stats_labels.offer')}</p>
                </div>
                {analytics.avgDaysToInterview !== null && (
                  <>
                    <div className="w-px h-6 md:h-8 bg-white/10 hidden sm:block" />
                    <div className="text-center shrink-0 snap-center">
                      <p className="text-md md:text-lg font-bold text-white">{analytics.avgDaysToInterview}d</p>
                      <p className="text-[8px] md:text-[10px] text-gray-light uppercase tracking-widest hidden md:block">{t('career_page.stats_labels.avgToInterview')}</p>
                      <p className="text-[8px] md:hidden text-gray-light uppercase tracking-widest">{t('career_page.stats_labels.avg')}</p>
                    </div>
                  </>
                )}
                {analytics.insights.length > 0 && (
                  <div className="flex-1 min-w-[200px] shrink-0 ml-auto snap-center">
                    <div className="space-y-1">
                      {analytics.insights.slice(0, 2).map((insight, i) => (
                        <p key={i} className="text-xs text-amber-400 truncate">{insight}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          <div className="flex bg-black/[0.03] dark:bg-white/[0.03] p-1 rounded-full border border-black/[0.05] dark:border-white/[0.05] overflow-x-auto whitespace-nowrap no-scrollbar max-w-fit gap-0.5">
            <button
              onClick={() => setMainTab('applications')}
              title={t('career_page.tabs.all').replace('All', 'Applications').replace('Semua', 'Lamaran')}
              className={`flex items-center gap-1.5 px-xl py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                mainTab === 'applications'
                  ? 'bg-warm-gold text-warm-black shadow-md'
                  : 'text-gray-light hover:text-soft-cream'
              }`}
            >
              <Briefcase size={14} weight="bold" />
              <span className="hidden md:inline">{t('career_page.tabs.all').replace('All', 'Applications').replace('Semua', 'Lamaran')}</span>
            </button>
            <button
              onClick={() => setMainTab('journal')}
              title={t('career_page.interview_journal.tab')}
              className={`flex items-center gap-1.5 px-xl py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                mainTab === 'journal'
                  ? 'bg-warm-gold text-warm-black shadow-md'
                  : 'text-gray-light hover:text-soft-cream'
              }`}
            >
              <Newspaper size={14} weight="bold" />
              <span className="hidden md:inline">{t('career_page.interview_journal.tab')}</span>
            </button>
            <button
              onClick={() => setMainTab('ats_matcher')}
              title={t('career_page.ats_matcher.title')}
              className={`flex items-center gap-1.5 px-xl py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                mainTab === 'ats_matcher'
                  ? 'bg-warm-gold text-warm-black shadow-md'
                  : 'text-gray-light hover:text-soft-cream'
              }`}
            >
              <Robot size={14} weight="bold" />
              <span className="hidden md:inline">{t('career_page.ats_matcher.title')}</span>
            </button>
          </div>

          {mainTab === 'applications' ? (
            <>
          <div className="flex bg-black/[0.03] dark:bg-white/[0.03] p-1 rounded-full border border-black/[0.05] dark:border-white/[0.05] overflow-x-auto whitespace-nowrap no-scrollbar max-w-full gap-0.5" role="tablist" aria-label="Application filter">
            {FILTER_TABS.map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  role="tab"
                  aria-selected={activeFilter === tab.id}
                  title={t(`career_page.tabs.${tab.labelKey}`)}
                  className={`flex items-center gap-1.5 px-xl py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                    activeFilter === tab.id
                      ? 'bg-warm-gold text-warm-black shadow-md'
                      : 'text-gray-light hover:text-soft-cream'
                  }`}
                >
                  <TabIcon size={14} weight="bold" />
                  <span className="hidden md:inline">{t(`career_page.tabs.${tab.labelKey}`)}</span>
                </button>
              );
            })}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-2xl"><Loading /></div>
          ) : filteredApps.length === 0 ? (
            <div className="glass-card p-4xl text-center space-y-md">
              <Briefcase size={48} className="mx-auto text-deep-sage opacity-20" />
              <p className="text-gray-light font-light italic">
                {activeFilter === 'all' ? t('career_page.empty_all') : t('career_page.empty_filter').replace('{filter}', t(`career_page.tabs.${activeFilter}`))}
              </p>
            </div>
          ) : (
            <div className="space-y-md">
              {filteredApps.map((app) => {
                const status = STATUS_CONFIG[app.status];
                const type = TYPE_CONFIG[app.application_type];
                const hasInterview = app.interview_date && new Date(app.interview_date) > new Date();

                return (
                  <div
                    key={app.id}
                    className="glass-card p-xl flex flex-col sm:flex-row sm:items-center gap-lg group transition-all hover:border-black/10 dark:border-white/10"
                    role="article"
                    aria-label={`${app.company_name} — ${app.role_title}`}
                  >
                    <div className="flex-1 min-w-0 space-y-sm">
                      <div className="flex flex-wrap items-center gap-sm">
                        <Badge
                          variant={status.badgeVariant}
                          aria-label={`Status: ${status.label}`}
                        >
                          {status.label}
                        </Badge>
                        <span className="text-[10px] text-gray-light uppercase tracking-widest flex items-center">
                          {type.icon} {type.label}
                        </span>
                        {app.priority === 'high' && (
                          <span className="text-[9px] text-expense font-bold uppercase tracking-widest">
                            {t('career_page.high_priority')}
                          </span>
                        )}
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-soft-cream">{app.company_name}</h3>
                        <p className="text-sm text-gray-light">{app.role_title}</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-md text-[10px] text-gray-light opacity-80">
                        <span className="flex items-center gap-1">
                          <Calendar size={10} />
                          {t('career_page.applied_on')} {new Date(app.applied_date).toLocaleDateString(locale, { month: 'short', day: 'numeric' })}
                        </span>
                        {app.location && (
                          <span className="flex items-center gap-1">
                            <MapPin size={10} />
                            {app.location}
                          </span>
                        )}
                        {hasInterview && (
                          <span className="flex items-center gap-1 text-purple-400 opacity-100">
                            <Clock size={10} />
                            {t('career_page.interview_on')} {new Date(app.interview_date!).toLocaleDateString(locale, { weekday: 'short', month: 'short', day: 'numeric' })}
                          </span>
                        )}
                        {app.salary_range && (
                          <span className="inline-flex items-center gap-1 text-emerald-400 font-mono text-[11px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-bold">
                            <Money size={12} className="shrink-0 text-emerald-400" />
                            {app.salary_range}
                          </span>
                        )}
                      </div>

                      {app.notes && (
                        <p className="text-xs text-gray-light italic line-clamp-1 opacity-80">
                          {app.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-sm opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex-shrink-0">
                      {app.url && (
                        <a
                          href={app.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-light hover:text-primary transition-colors rounded-md hover:bg-black/5 dark:bg-white/5"
                          aria-label={`Open ${app.company_name} job posting`}
                        >
                          <ExternalLink size={16} />
                        </a>
                      )}
                      <button
                        onClick={() => openEditModal(app)}
                        className="px-md py-3 min-h-[44px] flex items-center justify-center text-xs font-bold uppercase tracking-widest text-gray-light hover:text-soft-cream border border-black/10 dark:border-white/10 hover:border-black/20 dark:border-white/20 rounded-md transition-all"
                        aria-label={`Edit ${app.company_name} application`}
                      >
                        {t('career_page.edit')}
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(app.id)}
                        className="p-3 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-light hover:text-expense transition-colors rounded-md hover:bg-black/5 dark:bg-white/5"
                        aria-label={`Delete ${app.company_name} application`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          </>
          ) : mainTab === 'journal' ? (
          <>
            {journalLoading ? (
              <div className="flex justify-center py-2xl"><Loading /></div>
            ) : journals.length === 0 ? (
              <div className="glass-card p-4xl text-center space-y-md">
                <BookOpen size={48} className="mx-auto text-deep-sage opacity-20" />
                <p className="text-gray-light font-light italic">
                  {(t('career_page.interview_journal.empty') as string) || 'No interview notes yet.'}
                </p>
              </div>
            ) : (
              <div className="space-y-md">
                {journals.map((journal: any) => {
                  const difficultyColor = 
                    journal.difficulty === 'hard' ? 'text-expense' : 
                    journal.difficulty === 'medium' ? 'text-amber-400' : 'text-income';
                  
                  return (
                    <div
                      key={journal.id}
                      className="glass-card p-xl flex flex-col gap-md group transition-all hover:border-black/10 dark:border-white/10"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-bold text-soft-cream">{journal.company_name}</h3>
                          <p className="text-sm text-gray-light">{journal.role_title}</p>
                          <div className="flex flex-wrap items-center gap-md text-[10px] text-gray-light opacity-80 mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar size={10} />
                              {new Date(journal.interview_date).toLocaleDateString(locale, { weekday: 'short', month: 'short', day: 'numeric' })}
                            </span>
                            <span className={`flex items-center gap-1 ${difficultyColor} opacity-100 font-bold`}>
                              <Target size={10} />
                              {(t(`career_page.interview_journal.options.difficulty_${journal.difficulty}`) as string) || journal.difficulty}
                            </span>
                            <Badge variant={
                              journal.outcome === 'pass' ? 'success' : 
                              journal.outcome === 'fail' ? 'expense' : 'default'
                            }>
                              {(t(`career_page.interview_journal.options.outcome_${journal.outcome}`) as string) || journal.outcome}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-sm opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEditJournalModal(journal)}
                            className="px-md py-2 flex items-center justify-center text-xs font-bold uppercase tracking-widest text-gray-light hover:text-soft-cream border border-black/10 dark:border-white/10 hover:border-black/20 dark:border-white/20 rounded-md transition-all"
                            aria-label={`Edit journal entry`}
                          >
                            {t('career_page.edit')}
                          </button>
                          <button
                            onClick={() => setDeleteJournalConfirmId(journal.id)}
                            className="p-2 flex items-center justify-center text-gray-light hover:text-expense transition-colors rounded-md hover:bg-black/5 dark:bg-white/5"
                            aria-label={`Delete journal entry`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      {journal.questions_asked && (
                        <div className="bg-black/5 dark:bg-white/5 p-md rounded-md">
                          <p className="text-[10px] font-bold text-gray-light mb-1 flex items-center gap-1">
                            <MessageSquare size={10} />
                            {(t('career_page.interview_journal.questions') as string) || 'Questions Asked'}
                          </p>
                          <p className="text-sm text-soft-cream whitespace-pre-wrap font-light">{journal.questions_asked}</p>
                        </div>
                      )}

                      {journal.lessons_learned && (
                        <div className="bg-primary/5 p-md rounded-md border border-primary/10">
                          <p className="text-[10px] font-bold text-primary mb-1 flex items-center gap-1">
                            <Star size={10} />
                            {(t('career_page.interview_journal.lessons') as string) || 'Lessons Learned'}
                          </p>
                          <p className="text-sm text-soft-cream whitespace-pre-wrap font-light">{journal.lessons_learned}</p>
                        </div>
                      )}
                      
                      {journal.notes && (
                        <div>
                          <p className="text-xs text-gray-light italic opacity-80 whitespace-pre-wrap">
                            {journal.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
          ) : mainTab === 'ats_matcher' ? (
            <ATSMatcher applications={applications} />
          ) : null}
        </div>

        <div className="md:hidden fixed bottom-24 right-4 z-40">
          <Button 
            variant="primary" 
            onClick={mainTab === 'applications' ? openAddModal : openAddJournalModal} 
            className="rounded-full w-14 h-14 flex items-center justify-center shadow-[0_4px_20px_rgba(244,201,93,0.4)]"
            aria-label={mainTab === 'applications' ? "Add new application" : "Add new journal entry"}
          >
            <Plus size={24} />
          </Button>
        </div>

        {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingApp ? (t('career_page.edit_app') as string) : (t('career_page.new_app') as string)}
          maxWidth="2xl"
          footer={
            <div className="flex gap-md justify-end">
              <Button variant="ghost" size="md" onClick={() => setIsModalOpen(false)}>{t('investment_page.cancel_upper')}</Button>
              <Button variant="primary" size="md" onClick={handleSave} disabled={isSaving}>
                {isSaving ? t('investment_page.saving_upper') : (t('career_page.save_btn') as string)}
              </Button>
            </div>
          }
        >
          <div className="space-y-md">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
              <CreatableAutocomplete
                label={t('career_page.form.company')}
                placeholder={t('career_page.form.company_placeholder')}
                value={form.company_name}
                onChange={(val) => setForm((f) => ({ ...f, company_name: val }))}
                type="company"
                customHistory={uniqueCompanies}
                error={formErrors.company_name}
                required
              />
              <CreatableAutocomplete
                label={t('career_page.form.role')}
                placeholder={t('career_page.form.role_placeholder')}
                value={form.role_title}
                onChange={(val) => setForm((f) => ({ ...f, role_title: val }))}
                type="role"
                customHistory={uniqueRoles}
                error={formErrors.role_title}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-md">
              <Select
                id="modal-type"
                label={t('career_page.form.type')}
                value={form.application_type}
                onValueChange={(val) => setForm((f) => ({ ...f, application_type: val as CareerApplication['application_type'] }))}
                options={[
                  { value: 'job', label: t('career_page.form.options.job') },
                  { value: 'internship', label: t('career_page.form.options.internship') },
                  { value: 'freelance', label: t('career_page.form.options.freelance') },
                  { value: 'full_time', label: t('career_page.form.options.full_time') },
                  { value: 'part_time', label: t('career_page.form.options.part_time') },
                  { value: 'contract', label: t('career_page.form.options.contract') },
                ]}
              />
              <Select
                id="modal-status"
                label={t('career_page.form.status')}
                value={form.status}
                onValueChange={(val) => setForm((f) => ({ ...f, status: val as CareerApplication['status'] }))}
                options={[
                  { value: 'applied', label: t('career_page.form.options.status_applied') },
                  { value: 'reviewing', label: t('career_page.form.options.status_reviewing') },
                  { value: 'interview', label: t('career_page.form.options.status_interview') },
                  { value: 'offer', label: t('career_page.form.options.status_offer') },
                  { value: 'accepted', label: t('career_page.form.options.status_accepted') },
                  { value: 'rejected', label: t('career_page.form.options.status_rejected') },
                  { value: 'withdrawn', label: t('career_page.form.options.status_withdrawn') },
                ]}
              />
              <Select
                id="modal-priority"
                label={t('career_page.form.priority')}
                value={form.priority}
                onValueChange={(val) => setForm((f) => ({ ...f, priority: val as CareerApplication['priority'] }))}
                options={[
                  { value: 'low', label: t('career_page.form.options.low') },
                  { value: 'medium', label: t('career_page.form.options.medium') },
                  { value: 'high', label: t('career_page.form.options.high') },
                ]}
              />
            </div>

            <div className="space-y-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm">
                <DatePicker
                  id="modal-applied"
                  label={t('career_page.form.applied_date')}
                  value={form.applied_date}
                  onChange={(val) => setForm((f) => ({ ...f, applied_date: val }))}
                  error={formErrors.applied_date}
                  holidays={holidays}
                />
                <DatePicker
                  id="modal-interview"
                  label={t('career_page.form.interview_date')}
                  value={form.interview_date}
                  onChange={(val) => setForm((f) => ({ ...f, interview_date: val }))}
                  placeholder="Optional interview date"
                  holidays={holidays}
                />
              </div>

              {form.interview_date && (
                <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 border border-primary/20 rounded-lg animate-fade-in">
                  <input
                    type="checkbox"
                    id="sync-reminder-cb"
                    checked={form.sync_to_reminder ?? true}
                    onChange={(e) => setForm((f) => ({ ...f, sync_to_reminder: e.target.checked }))}
                    className="w-4 h-4 rounded border-primary/40 text-primary focus:ring-primary bg-black/20"
                  />
                  <label htmlFor="sync-reminder-cb" className="text-xs text-soft-cream font-medium cursor-pointer flex items-center gap-1.5">
                    <Bell size={14} className="text-primary" />
                    <span>Tambahkan otomatis ke Pengingat / Kalender (notifikasi 1 jam & 1 hari sebelum)</span>
                  </label>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-sm">
              <Input
                label={t('career_page.form.location')}
                placeholder={t('career_page.form.location_placeholder')}
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              />
              <Select
                id="modal-work-scheme"
                label={t('career_page.form.work_scheme')}
                value={form.work_scheme}
                onValueChange={(val) => setForm((f) => ({ ...f, work_scheme: val }))}
                options={[
                  { value: 'wfo', label: t('career_page.form.options.wfo') },
                  { value: 'wfh', label: t('career_page.form.options.wfh') },
                  { value: 'hybrid', label: t('career_page.form.options.hybrid') },
                ]}
              />
              <Input
                label={t('career_page.form.url')}
                placeholder={t('career_page.form.url_placeholder')}
                value={form.url}
                onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
                error={formErrors.url}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-bold text-gray-light uppercase tracking-wider select-none">
                  {t('career_page.form.salary')}
                </label>
                {(form.salary_min.trim() || form.salary_max.trim()) && (
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                    <Money size={12} />
                    {form.salary_currency}{' '}
                    {form.salary_min && form.salary_max
                      ? `${form.salary_min} – ${form.salary_max}`
                      : form.salary_min
                      ? `${form.salary_min}`
                      : `Up to ${form.salary_max}`}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-[96px_1fr_auto_1fr] items-center gap-2">
                <Select
                  value={form.salary_currency}
                  onValueChange={(val) => setForm((f) => ({ ...f, salary_currency: val }))}
                  options={[
                    { value: 'IDR', label: 'IDR' },
                    { value: 'USD', label: 'USD' },
                    { value: 'EUR', label: 'EUR' },
                    { value: 'SGD', label: 'SGD' },
                    { value: 'GBP', label: 'GBP' },
                    { value: 'AUD', label: 'AUD' },
                  ]}
                />
                <input
                  type="text"
                  value={form.salary_min}
                  onChange={(e) => setForm((f) => ({ ...f, salary_min: e.target.value }))}
                  placeholder={t('career_page.form.salary_min_placeholder') || 'Min'}
                  className="w-full h-10 bg-gray-strong/80 hover:bg-gray-strong border border-white/10 hover:border-white/20 focus:border-primary rounded-lg text-sm px-3 text-soft-cream focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all font-mono"
                />
                <span className="text-gray-light/50 font-bold select-none text-xs px-1">—</span>
                <input
                  type="text"
                  value={form.salary_max}
                  onChange={(e) => setForm((f) => ({ ...f, salary_max: e.target.value }))}
                  placeholder={t('career_page.form.salary_max_placeholder') || 'Max'}
                  className="w-full h-10 bg-gray-strong/80 hover:bg-gray-strong border border-white/10 hover:border-white/20 focus:border-primary rounded-lg text-sm px-3 text-soft-cream focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all font-mono"
                />
              </div>

              {/* Quick Salary Presets */}
              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                <span className="text-[10px] text-gray-light/60 font-medium">Preset cepat:</span>
                {form.salary_currency === 'IDR' ? (
                  [
                    { label: '5-10 Jt', min: '5.000.000', max: '10.000.000' },
                    { label: '10-20 Jt', min: '10.000.000', max: '20.000.000' },
                    { label: '20-35 Jt', min: '20.000.000', max: '35.000.000' },
                    { label: '35-50 Jt', min: '35.000.000', max: '50.000.000' },
                  ].map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, salary_min: p.min, salary_max: p.max }))}
                      className="text-[10px] px-2 py-0.5 rounded bg-white/5 hover:bg-primary/20 hover:text-primary text-gray-light border border-white/10 transition-colors font-mono"
                    >
                      {p.label}
                    </button>
                  ))
                ) : (
                  [
                    { label: '2k-4k', min: '2,000', max: '4,000' },
                    { label: '4k-8k', min: '4,000', max: '8,000' },
                    { label: '8k-12k', min: '8,000', max: '12,000' },
                    { label: '12k+', min: '12,000', max: '20,000' },
                  ].map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, salary_min: p.min, salary_max: p.max }))}
                      className="text-[10px] px-2 py-0.5 rounded bg-white/5 hover:bg-primary/20 hover:text-primary text-gray-light border border-white/10 transition-colors font-mono"
                    >
                      {p.label}
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-gray-light uppercase tracking-wider select-none">
                {t('career_page.form.notes_label') || 'Catatan / Keterangan'}
              </label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder={t('career_page.form.notes_placeholder')}
                rows={3}
                aria-label="Notes"
                className="w-full bg-gray-strong border border-black/5 dark:border-white/5 rounded-md p-lg text-sm text-soft-cream focus:border-primary focus:outline-none resize-none"
              />
            </div>
          </div>
        </Modal>
        )}

        <ConfirmModal
          isOpen={!!deleteConfirmId}
          onClose={() => setDeleteConfirmId(null)}
          title={t('career_page.remove_app')}
          description={t('career_page.remove_desc')}
          confirmText={t('career_page.remove_btn')}
          isDangerous={true}
          onConfirm={handleConfirmDelete}
        />

        {/* Add / Edit Journal Modal */}
        {isJournalModalOpen && (
        <Modal
          isOpen={isJournalModalOpen}
          onClose={() => setIsJournalModalOpen(false)}
          title={(t('career_page.interview_journal.new_entry_modal') as string) || 'Interview Journal'}
          maxWidth="2xl"
          footer={
            <div className="flex gap-md justify-end">
              <Button variant="ghost" size="md" onClick={() => setIsJournalModalOpen(false)}>{t('investment_page.cancel_upper')}</Button>
              <Button variant="primary" size="md" onClick={handleSaveJournal} disabled={isSaving}>
                {isSaving ? t('investment_page.saving_upper') : ((t('career_page.interview_journal.save') as string) || 'Save')}
              </Button>
            </div>
          }
        >
          <div className="space-y-md">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm">
              <CreatableAutocomplete
                label={(t('career_page.interview_journal.company') as string) || 'Company'}
                value={journalForm.company_name}
                onChange={(val) => setJournalForm((f: any) => ({ ...f, company_name: val }))}
                type="company"
                customHistory={uniqueCompanies}
                autoFocus
              />
              <CreatableAutocomplete
                label={(t('career_page.interview_journal.role') as string) || 'Role'}
                value={journalForm.role_title}
                onChange={(val) => setJournalForm((f: any) => ({ ...f, role_title: val }))}
                type="role"
                customHistory={uniqueRoles}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-sm">
              <DatePicker
                label={(t('career_page.interview_journal.date') as string) || 'Interview Date'}
                value={journalForm.interview_date}
                onChange={(val) => setJournalForm((f: any) => ({ ...f, interview_date: val }))}
                holidays={holidays}
              />
              <Select
                label={(t('career_page.interview_journal.difficulty') as string) || 'Difficulty'}
                value={journalForm.difficulty}
                onValueChange={(val) => setJournalForm((f: any) => ({ ...f, difficulty: val }))}
                options={[
                  { value: 'easy', label: (t('career_page.interview_journal.options.difficulty_easy') as string) || 'Easy' },
                  { value: 'medium', label: (t('career_page.interview_journal.options.difficulty_medium') as string) || 'Medium' },
                  { value: 'hard', label: (t('career_page.interview_journal.options.difficulty_hard') as string) || 'Hard' },
                ]}
              />
              <Select
                label={(t('career_page.interview_journal.outcome') as string) || 'Outcome'}
                value={journalForm.outcome}
                onValueChange={(val) => setJournalForm((f: any) => ({ ...f, outcome: val }))}
                options={[
                  { value: 'pending', label: (t('career_page.interview_journal.options.outcome_pending') as string) || 'Pending' },
                  { value: 'pass', label: (t('career_page.interview_journal.options.outcome_pass') as string) || 'Passed' },
                  { value: 'fail', label: (t('career_page.interview_journal.options.outcome_fail') as string) || 'Failed' },
                  { value: 'unknown', label: (t('career_page.interview_journal.options.outcome_unknown') as string) || 'Unknown' },
                ]}
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-light mb-1 block">
                {(t('career_page.interview_journal.questions') as string) || 'Questions Asked'}
              </label>
              <textarea
                value={journalForm.questions_asked}
                onChange={(e) => setJournalForm((f: any) => ({ ...f, questions_asked: e.target.value }))}
                placeholder={(t('career_page.interview_journal.questions_placeholder') as string) || 'What did they ask?'}
                rows={4}
                className="w-full bg-gray-strong border border-black/5 dark:border-white/5 rounded-md p-lg text-sm text-soft-cream focus:border-primary focus:outline-none resize-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-light mb-1 block">
                {(t('career_page.interview_journal.lessons') as string) || 'Lessons Learned'}
              </label>
              <textarea
                value={journalForm.lessons_learned}
                onChange={(e) => setJournalForm((f: any) => ({ ...f, lessons_learned: e.target.value }))}
                placeholder={(t('career_page.interview_journal.lessons_placeholder') as string) || 'What would you do differently?'}
                rows={3}
                className="w-full bg-gray-strong border border-black/5 dark:border-white/5 rounded-md p-lg text-sm text-soft-cream focus:border-primary focus:outline-none resize-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-light mb-1 block">
                {(t('career_page.interview_journal.notes') as string) || 'Notes'}
              </label>
              <textarea
                value={journalForm.notes}
                onChange={(e) => setJournalForm((f: any) => ({ ...f, notes: e.target.value }))}
                placeholder={(t('career_page.interview_journal.notes_placeholder') as string) || 'Additional context...'}
                rows={2}
                className="w-full bg-gray-strong border border-black/5 dark:border-white/5 rounded-md p-lg text-sm text-soft-cream focus:border-primary focus:outline-none resize-none"
              />
            </div>
          </div>
        </Modal>
        )}

        <ConfirmModal
          isOpen={!!deleteJournalConfirmId}
          onClose={() => setDeleteJournalConfirmId(null)}
          title={(t('career_page.interview_journal.remove_entry') as string) || 'Remove Entry'}
          description={(t('career_page.interview_journal.remove_desc') as string) || 'Are you sure you want to remove this journal entry?'}
          confirmText={(t('career_page.interview_journal.remove_btn') as string) || 'Remove'}
          isDangerous={true}
          onConfirm={handleConfirmDeleteJournal}
        />
        
        {/* Mobile-only FAB for Add */}
        <div className="md:hidden fixed bottom-24 right-4 z-40">
          <Button 
            variant="primary" 
            onClick={mainTab === 'applications' ? openAddModal : openAddJournalModal} 
            className="rounded-full w-14 h-14 flex items-center justify-center shadow-[0_4px_20px_rgba(244,201,93,0.4)]"
            aria-label={mainTab === 'applications' ? t('career_page.new_application') : 'New Journal Entry'}
          >
            <Plus size={24} />
          </Button>
        </div>
      </Layout>
    </>
  );
}

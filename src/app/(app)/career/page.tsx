'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Layout, Card, Button, Badge, Loading, Modal, Input, ErrorAlert, ConfirmModal } from '@/components';
import { useAuthStore } from '@/store/authStore';
import { useCareer } from '@/hooks/useCareer';
import { useCareerAnalytics } from '@/hooks/useCareerAnalytics';
import { CareerApplication } from '@/types/database';
import { getLocalISODate } from '@/libs/format';
import { sanitizeError } from '@/libs/validation';
import { useTranslation } from '@/libs/i18n/useTranslation';
import {
  Briefcase,
  Plus,
  Trash2,
  ExternalLink,
  Calendar,
  MapPin,
  Clock,
  GraduationCap,
  Rocket,
  BookOpen,
  Star,
  Target,
  MessageSquare
} from 'lucide-react';
import { useInterviewJournal } from '@/hooks/useInterviewJournal';

const FILTER_TABS = [
  { id: 'all',      labelKey: 'all' },
  { id: 'active',   labelKey: 'active' },
  { id: 'interview',labelKey: 'interview' },
  { id: 'closed',   labelKey: 'closed' },
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
  salary_range: string;
  notes: string;
  url: string;
  priority: CareerApplication['priority'];
};

const defaultForm: CareerFormData = {
  company_name: '',
  role_title: '',
  application_type: 'job',
  status: 'applied',
  applied_date: getLocalISODate(),
  interview_date: '',
  location: '',
  salary_range: '',
  notes: '',
  url: '',
  priority: 'medium',
};

function validateCareerForm(form: CareerFormData): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!form.company_name.trim()) errors.company_name = 'Company name is required';
  if (!form.role_title.trim()) errors.role_title = 'Role title is required';
  if (!form.applied_date) errors.applied_date = 'Application date is required';
  if (form.url && !/^https?:\/\//i.test(form.url)) errors.url = 'URL must start with http:// or https://';
  return errors;
}

export default function CareerPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const authLoading = useAuthStore((s) => s.isLoading);
  const { t } = useTranslation();

  const { applications, stats, isLoading, error, createApplication, updateApplication, deleteApplication } = useCareer();
  const { analytics } = useCareerAnalytics();

  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [editingApp, setEditingApp] = useState<CareerApplication | null>(null);
  const [form, setForm] = useState<CareerFormData>(defaultForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);

  const [mainTab, setMainTab] = useState<'applications' | 'journal'>('applications');

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

  // Status and Type configurations using translation hook
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
  };

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
    setForm({
      company_name: app.company_name,
      role_title: app.role_title,
      application_type: app.application_type,
      status: app.status,
      applied_date: app.applied_date,
      interview_date: app.interview_date?.split('T')[0] || '',
      location: app.location || '',
      salary_range: app.salary_range || '',
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
      const payload = {
        company_name: form.company_name.trim(),
        role_title: form.role_title.trim(),
        application_type: form.application_type,
        status: form.status,
        applied_date: form.applied_date,
        interview_date: form.interview_date ? new Date(form.interview_date + 'T09:00:00').toISOString() : undefined,
        location: form.location.trim() || undefined,
        salary_range: form.salary_range.trim() || undefined,
        notes: form.notes.trim() || undefined,
        url: form.url.trim() || undefined,
        priority: form.priority,
      };

      if (editingApp) {
        await updateApplication(editingApp.id, payload);
      } else {
        await createApplication(payload as any);
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

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-lg">
            <div className="space-y-xs">
              <h1 className="text-5xl font-serif">
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
                  : (t('career_page.interview_journal.new_entry') as string) || 'New Entry'}
              </Button>
            </div>
          </div>

          {/* Stats Row */}
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

          {/* Analytics Bar — Rule-based Intelligence */}
          {!isLoading && analytics && analytics.totalApplications > 0 && (
            <Card className="p-sm md:p-lg border border-black/[0.05] dark:border-white/[0.05] bg-black/[0.02]">
              <div className="flex items-center gap-md sm:gap-xl overflow-x-auto snap-x no-scrollbar flex-nowrap pb-1">
                <div className="text-center shrink-0 snap-center">
                  <p className="text-md md:text-lg font-bold text-white">{analytics.responseRate.toFixed(0)}%</p>
                  <p className="text-[8px] md:text-[10px] text-gray-light uppercase tracking-widest hidden md:block">Response Rate</p>
                  <p className="text-[8px] md:hidden text-gray-light uppercase tracking-widest">Resp.</p>
                </div>
                <div className="w-px h-6 md:h-8 bg-white/10 hidden sm:block" />
                <div className="text-center shrink-0 snap-center">
                  <p className="text-md md:text-lg font-bold text-white">{analytics.interviewRate.toFixed(0)}%</p>
                  <p className="text-[8px] md:text-[10px] text-gray-light uppercase tracking-widest hidden md:block">Interview Rate</p>
                  <p className="text-[8px] md:hidden text-gray-light uppercase tracking-widest">Intv.</p>
                </div>
                <div className="w-px h-6 md:h-8 bg-white/10 hidden sm:block" />
                <div className="text-center shrink-0 snap-center">
                  <p className="text-md md:text-lg font-bold text-white">{analytics.offerRate.toFixed(0)}%</p>
                  <p className="text-[8px] md:text-[10px] text-gray-light uppercase tracking-widest hidden md:block">Offer Rate</p>
                  <p className="text-[8px] md:hidden text-gray-light uppercase tracking-widest">Offer</p>
                </div>
                {analytics.avgDaysToInterview !== null && (
                  <>
                    <div className="w-px h-6 md:h-8 bg-white/10 hidden sm:block" />
                    <div className="text-center shrink-0 snap-center">
                      <p className="text-md md:text-lg font-bold text-white">{analytics.avgDaysToInterview}d</p>
                      <p className="text-[8px] md:text-[10px] text-gray-light uppercase tracking-widest hidden md:block">Avg. to Interview</p>
                      <p className="text-[8px] md:hidden text-gray-light uppercase tracking-widest">Avg.</p>
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

          {/* Main Tabs */}
          <div className="flex bg-black/[0.03] dark:bg-white/[0.03] p-1 rounded-full border border-black/[0.05] dark:border-white/[0.05] overflow-x-auto whitespace-nowrap no-scrollbar max-w-fit gap-0.5">
            <button
              onClick={() => setMainTab('applications')}
              className={`px-xl py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                mainTab === 'applications'
                  ? 'bg-warm-gold text-warm-black shadow-md'
                  : 'text-gray-light hover:text-soft-cream'
              }`}
            >
              {t('career_page.tabs.all').replace('All', 'Applications').replace('Semua', 'Lamaran')}
            </button>
            <button
              onClick={() => setMainTab('journal')}
              className={`px-xl py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                mainTab === 'journal'
                  ? 'bg-warm-gold text-warm-black shadow-md'
                  : 'text-gray-light hover:text-soft-cream'
              }`}
            >
              {(t('career_page.interview_journal.tab') as string) || 'Journal'}
            </button>
          </div>

          {mainTab === 'applications' ? (
            <>
              {/* Filter Tabs */}
          <div className="flex bg-black/[0.03] dark:bg-white/[0.03] p-1 rounded-full border border-black/[0.05] dark:border-white/[0.05] overflow-x-auto whitespace-nowrap no-scrollbar max-w-full gap-0.5" role="tablist" aria-label="Application filter">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                role="tab"
                aria-selected={activeFilter === tab.id}
                className={`px-xl py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                  activeFilter === tab.id
                    ? 'bg-warm-gold text-warm-black shadow-md'
                    : 'text-gray-light hover:text-soft-cream'
                }`}
              >
                {t(`career_page.tabs.${tab.labelKey}`)}
              </button>
            ))}
          </div>

          {/* Application Cards */}
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
                    {/* Left: Info */}
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
                          {t('career_page.applied_on')} {new Date(app.applied_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
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
                            {t('career_page.interview_on')} {new Date(app.interview_date!).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                          </span>
                        )}
                        {app.salary_range && (
                          <span>{app.salary_range}</span>
                        )}
                      </div>

                      {app.notes && (
                        <p className="text-xs text-gray-light italic line-clamp-1 opacity-80">
                          {app.notes}
                        </p>
                      )}
                    </div>

                    {/* Right: Actions */}
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
          ) : (
          <>
            {/* Journal UI */}
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
                              {new Date(journal.interview_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
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
                        
                        {/* Right: Actions */}
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
          )}
        </div>

        {/* Add / Edit Modal */}
        {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingApp ? t('career_page.edit_app') : t('career_page.new_app')}
          footer={
            <div className="flex gap-md justify-end">
              <Button variant="ghost" size="md" onClick={() => setIsModalOpen(false)}>{t('investment_page.cancel_upper')}</Button>
              <Button variant="primary" size="md" onClick={handleSave} disabled={isSaving}>
                {isSaving ? t('investment_page.saving_upper') : t('career_page.save')}
              </Button>
            </div>
          }
        >
          <div className="space-y-xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
              <Input
                label={t('career_page.form.company')}
                placeholder={t('career_page.form.company_placeholder')}
                value={form.company_name}
                onChange={(e) => setForm((f) => ({ ...f, company_name: e.target.value }))}
                error={formErrors.company_name}
                autoFocus
              />
              <Input
                label={t('career_page.form.role')}
                placeholder={t('career_page.form.role_placeholder')}
                value={form.role_title}
                onChange={(e) => setForm((f) => ({ ...f, role_title: e.target.value }))}
                error={formErrors.role_title}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-md">
              <div>
                <label className="text-[10px] font-bold text-gray-light mb-1 block" htmlFor="modal-type">{t('career_page.form.type')}</label>
                <select
                  id="modal-type"
                  value={form.application_type}
                  onChange={(e) => setForm((f) => ({ ...f, application_type: e.target.value as any }))}
                  className="w-full h-10 bg-gray-strong border border-black/5 dark:border-white/5 rounded-sm text-sm px-sm text-white focus:border-primary focus:outline-none"
                >
                  {Object.entries(TYPE_CONFIG).map(([val, cfg]) => (
                    <option key={val} value={val}>{cfg.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-light mb-1 block" htmlFor="modal-status">{t('career_page.form.status')}</label>
                <select
                  id="modal-status"
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as any }))}
                  className="w-full h-10 bg-gray-strong border border-black/5 dark:border-white/5 rounded-sm text-sm px-sm text-white focus:border-primary focus:outline-none"
                >
                  <optgroup label="In Progress">
                    {ACTIVE_STATUSES.map((val) => (
                      <option key={val} value={val}>{STATUS_CONFIG[val].label}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Closed">
                    {CLOSED_STATUSES.map((val) => (
                      <option key={val} value={val}>{STATUS_CONFIG[val].label}</option>
                    ))}
                  </optgroup>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-light mb-1 block" htmlFor="modal-priority">{t('career_page.form.priority')}</label>
                <select
                  id="modal-priority"
                  value={form.priority}
                  onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as any }))}
                  className="w-full h-10 bg-gray-strong border border-black/5 dark:border-white/5 rounded-sm text-sm px-sm text-white focus:border-primary focus:outline-none"
                >
                  <option value="low">{t('career_page.form.options.low')}</option>
                  <option value="medium">{t('career_page.form.options.medium')}</option>
                  <option value="high">{t('career_page.form.options.high')}</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
              <div>
                <label className="text-[10px] font-bold text-gray-light mb-1 block" htmlFor="modal-applied">{t('career_page.form.applied_date')}</label>
                <input
                  id="modal-applied"
                  type="date"
                  value={form.applied_date}
                  onChange={(e) => setForm((f) => ({ ...f, applied_date: e.target.value }))}
                  className="w-full h-10 bg-gray-strong border border-black/5 dark:border-white/5 rounded-sm text-sm px-sm text-white focus:border-primary focus:outline-none"
                />
                {formErrors.applied_date && <p className="text-expense text-xs mt-1">{formErrors.applied_date}</p>}
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-light mb-1 block" htmlFor="modal-interview">{t('career_page.form.interview_date')}</label>
                <input
                  id="modal-interview"
                  type="date"
                  value={form.interview_date}
                  onChange={(e) => setForm((f) => ({ ...f, interview_date: e.target.value }))}
                  className="w-full h-10 bg-gray-strong border border-black/5 dark:border-white/5 rounded-sm text-sm px-sm text-white focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
              <Input
                label={t('career_page.form.location')}
                placeholder={t('career_page.form.location_placeholder')}
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              />
              <Input
                label={t('career_page.form.salary')}
                placeholder={t('career_page.form.salary_placeholder')}
                value={form.salary_range}
                onChange={(e) => setForm((f) => ({ ...f, salary_range: e.target.value }))}
              />
            </div>

            <Input
              label={t('career_page.form.url')}
              placeholder={t('career_page.form.url_placeholder')}
              value={form.url}
              onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
              error={formErrors.url}
            />

            <textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder={t('career_page.form.notes_placeholder')}
              rows={3}
              aria-label="Notes"
              className="w-full bg-gray-strong border border-black/5 dark:border-white/5 rounded-md p-lg text-sm text-soft-cream focus:border-primary focus:outline-none resize-none"
            />
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
          footer={
            <div className="flex gap-md justify-end">
              <Button variant="ghost" size="md" onClick={() => setIsJournalModalOpen(false)}>{t('investment_page.cancel_upper')}</Button>
              <Button variant="primary" size="md" onClick={handleSaveJournal} disabled={isSaving}>
                {isSaving ? t('investment_page.saving_upper') : ((t('career_page.interview_journal.save') as string) || 'Save')}
              </Button>
            </div>
          }
        >
          <div className="space-y-xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
              <Input
                label={(t('career_page.interview_journal.company') as string) || 'Company'}
                value={journalForm.company_name}
                onChange={(e) => setJournalForm((f: any) => ({ ...f, company_name: e.target.value }))}
                autoFocus
              />
              <Input
                label={(t('career_page.interview_journal.role') as string) || 'Role'}
                value={journalForm.role_title}
                onChange={(e) => setJournalForm((f: any) => ({ ...f, role_title: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-md">
              <div>
                <label className="text-[10px] font-bold text-gray-light mb-1 block">
                  {(t('career_page.interview_journal.date') as string) || 'Interview Date'}
                </label>
                <input
                  type="date"
                  value={journalForm.interview_date}
                  onChange={(e) => setJournalForm((f: any) => ({ ...f, interview_date: e.target.value }))}
                  className="w-full h-10 bg-gray-strong border border-black/5 dark:border-white/5 rounded-sm text-sm px-sm text-white focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-light mb-1 block">
                  {(t('career_page.interview_journal.difficulty') as string) || 'Difficulty'}
                </label>
                <select
                  value={journalForm.difficulty}
                  onChange={(e) => setJournalForm((f: any) => ({ ...f, difficulty: e.target.value }))}
                  className="w-full h-10 bg-gray-strong border border-black/5 dark:border-white/5 rounded-sm text-sm px-sm text-white focus:border-primary focus:outline-none"
                >
                  <option value="easy">{(t('career_page.interview_journal.options.difficulty_easy') as string) || 'Easy'}</option>
                  <option value="medium">{(t('career_page.interview_journal.options.difficulty_medium') as string) || 'Medium'}</option>
                  <option value="hard">{(t('career_page.interview_journal.options.difficulty_hard') as string) || 'Hard'}</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-light mb-1 block">
                  {(t('career_page.interview_journal.outcome') as string) || 'Outcome'}
                </label>
                <select
                  value={journalForm.outcome}
                  onChange={(e) => setJournalForm((f: any) => ({ ...f, outcome: e.target.value }))}
                  className="w-full h-10 bg-gray-strong border border-black/5 dark:border-white/5 rounded-sm text-sm px-sm text-white focus:border-primary focus:outline-none"
                >
                  <option value="pending">{(t('career_page.interview_journal.options.outcome_pending') as string) || 'Pending'}</option>
                  <option value="pass">{(t('career_page.interview_journal.options.outcome_pass') as string) || 'Passed'}</option>
                  <option value="fail">{(t('career_page.interview_journal.options.outcome_fail') as string) || 'Failed'}</option>
                  <option value="unknown">{(t('career_page.interview_journal.options.outcome_unknown') as string) || 'Unknown'}</option>
                </select>
              </div>
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
            className="rounded-full w-14 h-14 flex items-center justify-center shadow-[0_4px_20px_rgba(78,79,235,0.4)]"
            aria-label={mainTab === 'applications' ? t('career_page.new_application') : 'New Journal Entry'}
          >
            <Plus size={24} />
          </Button>
        </div>
      </Layout>
    </>
  );
}

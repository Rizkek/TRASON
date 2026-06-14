'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Layout, Card, Button, Badge, Loading, Modal, Input, ErrorAlert, ConfirmModal } from '@/components';
import { useAuthStore } from '@/store/authStore';
import { useCareer } from '@/hooks/useCareer';
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
} from 'lucide-react';

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

  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [editingApp, setEditingApp] = useState<CareerApplication | null>(null);
  const [form, setForm] = useState<CareerFormData>(defaultForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);

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
    withdrawn:  { label: t('career_page.form.options.status_withdrawn'),  color: 'text-gray-light', badgeVariant: undefined },
  };

  const TYPE_CONFIG: Record<CareerApplication['application_type'], { label: string; emoji: string }> = {
    job:        { label: t('career_page.form.options.job'),        emoji: 'ðŸ’¼' },
    internship: { label: t('career_page.form.options.internship'), emoji: 'ðŸŽ“' },
    freelance:  { label: t('career_page.form.options.freelance'),  emoji: 'ðŸš€' },
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
            <Button variant="primary" onClick={openAddModal} className="rounded-full px-xl" aria-label="Add new application">
              <Plus size={18} className="mr-2" />
              {t('career_page.new_application')}
            </Button>
          </div>

          {/* Stats Row */}
          {!isLoading && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-md">
              {[
                { label: t('career_page.stats.applied'), value: stats.applied, color: 'text-primary' },
                { label: t('career_page.stats.reviewing'), value: stats.reviewing, color: 'text-amber-400' },
                { label: t('career_page.stats.interview'), value: stats.interview, color: 'text-purple-400' },
                { label: t('career_page.stats.offer'), value: stats.offer, color: 'text-income' },
              ].map((s) => (
                <Card key={s.label} className="glass border-none p-xl text-center">
                  <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-[10px] text-gray-light uppercase tracking-widest mt-xs">{s.label}</p>
                </Card>
              ))}
            </div>
          )}

          {/* Filter Tabs */}
          <div className="flex bg-black/[0.03] dark:bg-white/[0.03] p-1 rounded-full border border-black/[0.05] dark:border-white/[0.05] w-fit gap-0.5" role="tablist" aria-label="Application filter">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                role="tab"
                aria-selected={activeFilter === tab.id}
                className={`px-xl py-sm rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
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
                    aria-label={`${app.company_name} â€” ${app.role_title}`}
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
                        <span className="text-[10px] text-gray-light uppercase tracking-widest">
                          {type.emoji} {type.label}
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

                      <div className="flex flex-wrap items-center gap-md text-[10px] text-gray-light opacity-60">
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
                        <p className="text-xs text-gray-light italic line-clamp-1 opacity-60">
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
                          className="p-sm text-gray-light hover:text-primary transition-colors rounded-md hover:bg-black/5 dark:bg-white/5"
                          aria-label={`Open ${app.company_name} job posting`}
                        >
                          <ExternalLink size={16} />
                        </a>
                      )}
                      <button
                        onClick={() => openEditModal(app)}
                        className="px-md py-sm text-[10px] font-bold uppercase tracking-widest text-gray-light hover:text-soft-cream border border-black/10 dark:border-white/10 hover:border-black/20 dark:border-white/20 rounded-md transition-all"
                        aria-label={`Edit ${app.company_name} application`}
                      >
                        {t('career_page.edit')}
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(app.id)}
                        className="p-sm text-gray-light hover:text-expense transition-colors rounded-md hover:bg-black/5 dark:bg-white/5"
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
        </div>

        {/* Add / Edit Modal */}
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
                    <option key={val} value={val}>{cfg.emoji} {cfg.label}</option>
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
                  {Object.entries(STATUS_CONFIG).map(([val, cfg]) => (
                    <option key={val} value={val}>{cfg.label}</option>
                  ))}
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

        <ConfirmModal
          isOpen={!!deleteConfirmId}
          onClose={() => setDeleteConfirmId(null)}
          title={t('career_page.remove_app')}
          description={t('career_page.remove_desc')}
          confirmText={t('career_page.remove_btn')}
          isDangerous={true}
          onConfirm={handleConfirmDelete}
        />
      </Layout>
    </>
  );
}

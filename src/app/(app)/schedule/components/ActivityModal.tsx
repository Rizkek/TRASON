'use client';

import { Textarea } from '@/components/ui/Textarea';
import React from 'react';
import { Modal, Button, Input, Select } from '@/components';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { Activity } from '@/services/supabase/supabaseClient';
import { ActivityFormData, CATEGORY_OPTIONS, HOURS, formatHour } from './types';
import { Repeat } from '@phosphor-icons/react';
import { Paragraph } from '@/components/ui/typography';

interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingActivity: Activity | null;
  form: ActivityFormData;
  setForm: React.Dispatch<React.SetStateAction<ActivityFormData>>;
  formErrors: Record<string, string>;
  isSaving: boolean;
  onSave: () => void;
  onDelete: () => void;
  daysOfWeek: Date[];
  locale: string;
}

export function ActivityModal({
  isOpen,
  onClose,
  editingActivity,
  form,
  setForm,
  formErrors,
  isSaving,
  onSave,
  onDelete,
  daysOfWeek,
  locale,
}: ActivityModalProps) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingActivity ? t('timeline_page.edit_log') : t('timeline_page.log_activity_modal')}
      footer={
        <div className="flex gap-4 justify-end">
          {editingActivity && (
            <Button variant="ghost" size="md" onClick={onDelete} disabled={isSaving} className="mr-auto text-danger">
              {t('timeline_page.delete_btn')}
            </Button>
          )}
          <Button variant="ghost" size="md" onClick={onClose}>
            {t('investment_page.cancel_upper')}
          </Button>
          <Button variant="primary" size="md" onClick={onSave} disabled={isSaving}>
            {isSaving ? t('investment_page.saving_upper') : t('career_page.save')}
          </Button>
        </div>
      }
    >
      <div className="space-y-8">
        {/* Weekly Routine Template selector */}
        <div className="p-3 rounded-lg bg-accent-purple/10 border border-accent-purple/20 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Repeat size={18} className="text-accent-purple shrink-0" />
            <div>
              <label htmlFor="routine-checkbox" className="text-xs font-bold text-foreground cursor-pointer block">{t('schedule_ui.routine_title')}</label>
              <Paragraph className="text-xs text-muted-foreground">{t('schedule_ui.routine_desc')}</Paragraph>
            </div>
          </div>
          <input
            type="checkbox"
            id="routine-checkbox"
            checked={form.isWeeklyRoutine}
            onChange={(e) => setForm((f) => ({ ...f, isWeeklyRoutine: e.target.checked }))}
            className="w-4 h-4 rounded border-accent-purple text-accent-purple focus:ring-accent-purple bg-background/60"
          />
        </div>

        <Input
          label={t('timeline_page.form.title')}
          placeholder={t('timeline_page.form.title_placeholder')}
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          error={formErrors.title}
          autoFocus
        />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <Select
              id="form-day"
              label={t('timeline_page.form.day')}
              value={String(form.dayIndex)}
              onValueChange={(val) => setForm((f) => ({ ...f, dayIndex: +val }))}
              disabled={form.applyToAllDays}
              options={daysOfWeek.map((d, i) => ({
                value: String(i),
                label: d.toLocaleDateString(locale, { weekday: 'long' }),
              }))}
            />
          </div>
          <Select
            id="form-hour"
            label={t('timeline_page.form.hour')}
            value={String(form.start_hour)}
            onValueChange={(val) => setForm((f) => ({ ...f, start_hour: +val }))}
            options={HOURS.map((h) => ({
              value: String(h),
              label: formatHour(h),
            }))}
          />
          <Select
            id="form-min"
            label={t('timeline_page.form.min')}
            value={String(form.start_minute)}
            onValueChange={(val) => setForm((f) => ({ ...f, start_minute: +val }))}
            options={[0, 15, 30, 45].map((m) => ({
              value: String(m),
              label: String(m).padStart(2, '0'),
            }))}
          />
          <Select
            id="form-dur"
            label={t('timeline_page.form.duration')}
            value={String(form.duration_minutes)}
            onValueChange={(val) => setForm((f) => ({ ...f, duration_minutes: +val }))}
            options={[15, 30, 45, 60, 90, 120, 180, 240].map((m) => ({
              value: String(m),
              label: m < 60 ? `${m}m` : `${m / 60}h`,
            }))}
          />
        </div>

        <Select
          id="form-cat"
          label={t('timeline_page.form.category')}
          value={form.category || 'none'}
          onValueChange={(val) => setForm((f) => ({ ...f, category: val === 'none' ? '' : val }))}
          options={[
            { value: 'none', label: t('timeline_page.form.uncategorized') },
            ...CATEGORY_OPTIONS.map((c) => ({
              value: c,
              label: t(`timeline_page.form.categories.${c}`),
            })),
          ]}
        />

        <Textarea
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder={`${t('timeline_page.form.notes')} (${t('common.optional')})`}
          rows={3}
          aria-label={t('timeline_page.form.notes')}
        />
      </div>
    </Modal>
  );
}

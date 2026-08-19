'use client';

import React from 'react';
import { Modal, Button, Input, Select } from '@/components';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { Activity } from '@/services/supabase/supabaseClient';
import { ActivityFormData, CATEGORY_OPTIONS, MOOD_OPTIONS, HOURS, formatHour } from './types';
import { Repeat, Star, MapPin } from '@phosphor-icons/react';

interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingActivity: Activity | null;
  form: ActivityFormData;
  setForm: React.Dispatch<React.SetStateAction<ActivityFormData>>;
  formErrors: Record<string, string>;
  isSaving: boolean;
  onSave: () => void;
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
        <div className="flex gap-md justify-end">
          <Button variant="ghost" size="md" onClick={onClose}>
            {t('investment_page.cancel_upper')}
          </Button>
          <Button variant="primary" size="md" onClick={onSave} disabled={isSaving}>
            {isSaving ? t('investment_page.saving_upper') : t('career_page.save')}
          </Button>
        </div>
      }
    >
      <div className="space-y-xl">
        {/* Weekly Routine Template selector */}
        <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Repeat size={18} className="text-indigo-400 shrink-0" />
            <div>
              <label htmlFor="routine-checkbox" className="text-xs font-bold text-soft-cream cursor-pointer block">
                Jadwal Rutin Mingguan (Template)
              </label>
              <p className="text-[10px] text-gray-light">
                Aktivitas berulang tiap minggu (misal: jam kerja, kuliah, olahraga, standup).
              </p>
            </div>
          </div>
          <input
            type="checkbox"
            id="routine-checkbox"
            checked={form.isWeeklyRoutine}
            onChange={(e) => setForm((f) => ({ ...f, isWeeklyRoutine: e.target.checked }))}
            className="w-4 h-4 rounded border-indigo-400 text-indigo-500 focus:ring-indigo-400 bg-black/20"
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

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-md">
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

        <div className="grid grid-cols-2 gap-md">
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
          <Select
            id="form-mood"
            label={t('timeline_page.form.mood')}
            value={form.mood || 'none'}
            onValueChange={(val) => setForm((f) => ({ ...f, mood: val === 'none' ? '' : val }))}
            options={[
              { value: 'none', label: t('timeline_page.form.none') },
              ...MOOD_OPTIONS.map((m) => ({
                value: m.value,
                label: `${m.emoji} ${t(`timeline_page.form.moods.${m.labelKey}`)}`,
              })),
            ]}
          />
        </div>

        <div>
          <label className="text-[10px] font-bold text-gray-light mb-2 block">
            {t('timeline_page.form.rating')} <span className="font-normal opacity-70">({t('common.optional')})</span>
          </label>
          <div className="flex gap-md" role="group" aria-label="Rating">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setForm((f) => ({ ...f, rating: f.rating === s ? 0 : s }))}
                aria-label={`${s} star${s > 1 ? 's' : ''}`}
                className={`transition-all ${
                  s <= form.rating
                    ? 'text-primary scale-125'
                    : 'text-gray-light opacity-20 hover:opacity-100 hover:text-primary'
                }`}
              >
                <Star fill={s <= form.rating ? 'currentColor' : 'none'} size={22} />
              </button>
            ))}
          </div>
        </div>

        <div className="relative">
          <MapPin size={14} className="absolute left-md top-1/2 -translate-y-1/2 text-primary" />
          <input
            placeholder={`${t('timeline_page.form.location')} (${t('common.optional')})`}
            value={form.location}
            onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
            aria-label="Location"
            className="w-full pl-xl pr-md py-md bg-gray-strong/40 border border-black/5 dark:border-white/5 rounded-md text-sm focus:border-primary focus:outline-none transition-all"
          />
        </div>

        <textarea
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder={`${t('timeline_page.form.notes')} (${t('common.optional')})`}
          rows={3}
          aria-label="Notes"
          className="w-full bg-gray-strong border border-black/5 dark:border-white/5 rounded-md p-lg text-sm text-soft-cream focus:border-primary focus:outline-none resize-none"
        />
      </div>
    </Modal>
  );
}

'use client';

import React, { useState } from 'react';
import { Plus, Trash, Play } from '@phosphor-icons/react';
import { Badge, Button, ConfirmModal, ErrorAlert, Input, Modal, Select } from '@/components';
import { EmptyState } from '@/components/ui/EmptyState';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { sanitizeError } from '@/libs/validation';
import { describeTarget, weekdayOrder } from '@/libs/workoutTargets';
import type { useWorkoutPlan } from '@/hooks/useWorkoutPlan';
import type { SportType, WorkoutDay, WorkoutExercise, WorkoutPlan } from '@/types/database';

type PlanActions = Pick<
  ReturnType<typeof useWorkoutPlan>,
  'addDay' | 'deleteDay' | 'addExercise' | 'deleteExercise' | 'setActivePlan' | 'deletePlan'
>;
type ExerciseDraft = Omit<WorkoutExercise, 'id' | 'user_id' | 'workout_day_id' | 'created_at' | 'updated_at'>;

// Monday first, Sunday last; the values are the database's day_of_week.
const WEEKDAYS = [1, 2, 3, 4, 5, 6, 0];

const positive = (value: string): number | undefined => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
};

interface ExerciseFormProps {
  sortOrder: number;
  disabled: boolean;
  onSubmit: (draft: ExerciseDraft) => void;
  onCancel: () => void;
}

function ExerciseForm({ sortOrder, disabled, onSubmit, onCancel }: ExerciseFormProps) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [type, setType] = useState<SportType>('lift');
  const [sets, setSets] = useState('3');
  const [reps, setReps] = useState('10');
  const [weight, setWeight] = useState('');
  const [distance, setDistance] = useState('');
  const [minutes, setMinutes] = useState('');
  const [nameError, setNameError] = useState<string>();

  const submit = () => {
    if (!name.trim()) {
      setNameError(t('plan_ui.name_required'));
      return;
    }
    const draft: ExerciseDraft = { name: name.trim(), sport_type: type, sort_order: sortOrder };
    if (type === 'lift') {
      draft.target_sets = positive(sets);
      draft.target_reps = positive(reps);
      draft.target_weight_kg = positive(weight);
    } else if (type === 'run' || type === 'cycle' || type === 'swim') {
      const km = positive(distance);
      if (km) draft.target_distance_m = Math.round(km * 1000);
    } else {
      const min = positive(minutes);
      if (min) draft.target_duration_s = Math.round(min * 60);
    }
    onSubmit(draft);
  };

  return (
    <div className="mt-3 space-y-3 rounded-lg bg-foreground/[0.03] p-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input
          label={t('plan_ui.exercise_name')}
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setNameError(undefined);
          }}
          error={nameError}
          autoFocus
        />
        <Select
          id={`exercise-type-${sortOrder}`}
          label={t('plan_ui.exercise_type')}
          value={type}
          onValueChange={(value) => setType(value as SportType)}
          options={[
            { value: 'lift', label: t('sport_forms.type_lift') },
            { value: 'run', label: t('sport_forms.type_run') },
            { value: 'cycle', label: t('sport_forms.type_cycle') },
            { value: 'swim', label: t('sport_forms.type_swim') },
            { value: 'yoga', label: t('sport_forms.type_yoga') },
            { value: 'other', label: t('sport_forms.type_other') },
          ]}
        />
      </div>

      {type === 'lift' ? (
        <div className="grid grid-cols-3 gap-3">
          <Input label={t('sport_forms.sets')} type="number" min="1" value={sets} onChange={(e) => setSets(e.target.value)} />
          <Input label={t('sport_forms.reps')} type="number" min="1" value={reps} onChange={(e) => setReps(e.target.value)} />
          <Input label={t('sport_forms.weight')} type="number" min="0" step="0.5" value={weight} onChange={(e) => setWeight(e.target.value)} />
        </div>
      ) : type === 'run' || type === 'cycle' || type === 'swim' ? (
        <Input label={t('sport_forms.distance')} type="number" min="0" step="0.1" value={distance} onChange={(e) => setDistance(e.target.value)} />
      ) : (
        <Input label={t('sport_forms.duration')} type="number" min="1" value={minutes} onChange={(e) => setMinutes(e.target.value)} />
      )}

      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onCancel} disabled={disabled}>
          {t('common.cancel')}
        </Button>
        <Button size="sm" onClick={submit} disabled={disabled}>
          {t('common.save')}
        </Button>
      </div>
    </div>
  );
}

interface Props {
  plan: WorkoutPlan;
  actions: PlanActions;
  onClose: () => void;
  onLogDay: (plan: WorkoutPlan, day: WorkoutDay) => void;
}

/** One plan with its training days and the exercises of each day. */
export function PlanDetailModal({ plan, actions, onClose, onLogDay }: Props) {
  const { t } = useTranslation();
  const { locale } = useUserPreferences();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [showDayForm, setShowDayForm] = useState(false);
  const [dayForm, setDayForm] = useState({ weekday: '1', name: '', minutes: '' });
  const [exerciseDayId, setExerciseDayId] = useState<string | null>(null);
  const [dayToDelete, setDayToDelete] = useState<WorkoutDay | null>(null);
  const [confirmDeletePlan, setConfirmDeletePlan] = useState(false);

  const days = [...(plan.days ?? [])].sort((a, b) => weekdayOrder(a.day_of_week) - weekdayOrder(b.day_of_week));
  const weekdayLabel = (dayOfWeek: number) => new Date(2024, 0, 7 + dayOfWeek).toLocaleDateString(locale, { weekday: 'long' });

  const run = async (action: () => Promise<unknown>): Promise<boolean> => {
    setError(null);
    setBusy(true);
    try {
      await action();
      return true;
    } catch (err) {
      setError(sanitizeError(err) || t('plan_ui.action_failed'));
      return false;
    } finally {
      setBusy(false);
    }
  };

  const submitDay = async () => {
    const saved = await run(() =>
      actions.addDay(plan.id, {
        day_of_week: Number(dayForm.weekday),
        name: dayForm.name.trim() || undefined,
        target_duration_minutes: positive(dayForm.minutes),
      })
    );
    if (saved) {
      setShowDayForm(false);
      setDayForm({ weekday: '1', name: '', minutes: '' });
    }
  };

  return (
    <>
      <Modal
        isOpen
        onClose={onClose}
        title={plan.name}
        description={t('plan_ui.summary').replace('{weeks}', String(plan.duration_weeks)).replace('{days}', String(days.length))}
        maxWidth="2xl"
        footer={
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Button variant="ghost" size="sm" className="text-danger" onClick={() => setConfirmDeletePlan(true)} disabled={busy}>
              {t('plan_ui.delete_plan')}
            </Button>
            {plan.is_active ? (
              <Badge variant="info" size="sm">
                {t('sport_forms.active_plan')}
              </Badge>
            ) : (
              <Button variant="outline" size="sm" leftIcon={<Play size={14} />} onClick={() => run(() => actions.setActivePlan(plan.id))} disabled={busy}>
                {t('sport_forms.activate')}
              </Button>
            )}
          </div>
        }
      >
        <div className="space-y-4">
          <ErrorAlert error={error} onDismiss={() => setError(null)} />

          {days.length === 0 && !showDayForm && (
            <EmptyState
              title={t('plan_ui.no_days_title')}
              description={t('plan_ui.no_days_desc')}
              action={
                <Button variant="outline" size="sm" leftIcon={<Plus size={14} />} onClick={() => setShowDayForm(true)}>
                  {t('plan_ui.add_day')}
                </Button>
              }
            />
          )}

          {days.map((day) => {
            const exercises = [...(day.exercises ?? [])].sort((a, b) => a.sort_order - b.sort_order);
            return (
              <section key={day.id} className="rounded-lg border border-foreground/10 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="break-words text-title-md text-foreground">
                      {weekdayLabel(day.day_of_week)}
                      {day.name ? ` · ${day.name}` : ''}
                    </h3>
                    {day.target_duration_minutes ? (
                      <p className="text-xs text-muted-foreground">
                        {day.target_duration_minutes} {t('sport_page.min_label')}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button variant="outline" size="sm" leftIcon={<Play size={12} />} onClick={() => onLogDay(plan, day)} disabled={busy}>
                      {t('plan_ui.log_day')}
                    </Button>
                    <button
                      type="button"
                      onClick={() => setDayToDelete(day)}
                      aria-label={t('plan_ui.delete_day')}
                      title={t('plan_ui.delete_day')}
                      className="flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-danger/10 hover:text-danger"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                </div>

                {exercises.length === 0 ? (
                  <p className="mt-3 text-sm text-muted-foreground">{t('plan_ui.no_exercises')}</p>
                ) : (
                  <ul className="mt-3 divide-y divide-foreground/5">
                    {exercises.map((exercise) => (
                      <li key={exercise.id} className="flex items-center justify-between gap-3 py-2">
                        <div className="min-w-0">
                          <p className="break-words text-sm font-medium text-foreground">{exercise.name}</p>
                          <p className="font-mono text-xs text-muted-foreground">{describeTarget(exercise, t('sport_page.min_label'))}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => run(() => actions.deleteExercise(exercise.id))}
                          disabled={busy}
                          aria-label={t('plan_ui.remove_exercise')}
                          title={t('plan_ui.remove_exercise')}
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-danger disabled:opacity-50"
                        >
                          <Trash size={14} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                {exerciseDayId === day.id ? (
                  <ExerciseForm
                    sortOrder={exercises.length}
                    disabled={busy}
                    onCancel={() => setExerciseDayId(null)}
                    onSubmit={async (draft) => {
                      if (await run(() => actions.addExercise(day.id, draft))) setExerciseDayId(null);
                    }}
                  />
                ) : (
                  <Button variant="ghost" size="sm" className="mt-2" leftIcon={<Plus size={14} />} onClick={() => setExerciseDayId(day.id)}>
                    {t('plan_ui.add_exercise')}
                  </Button>
                )}
              </section>
            );
          })}

          {showDayForm ? (
            <div className="space-y-3 rounded-lg border border-foreground/10 p-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Select
                  id="plan-weekday"
                  label={t('plan_ui.weekday')}
                  value={dayForm.weekday}
                  onValueChange={(value) => setDayForm((f) => ({ ...f, weekday: value }))}
                  options={WEEKDAYS.map((dayOfWeek) => ({ value: String(dayOfWeek), label: weekdayLabel(dayOfWeek) }))}
                />
                <Input
                  label={t('plan_ui.day_name')}
                  placeholder={t('plan_ui.day_name_placeholder')}
                  value={dayForm.name}
                  onChange={(e) => setDayForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <Input
                label={t('plan_ui.day_minutes')}
                type="number"
                min="1"
                value={dayForm.minutes}
                onChange={(e) => setDayForm((f) => ({ ...f, minutes: e.target.value }))}
              />
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => setShowDayForm(false)} disabled={busy}>
                  {t('common.cancel')}
                </Button>
                <Button size="sm" onClick={submitDay} disabled={busy}>
                  {t('common.save')}
                </Button>
              </div>
            </div>
          ) : (
            days.length > 0 && (
              <Button variant="outline" size="sm" leftIcon={<Plus size={14} />} onClick={() => setShowDayForm(true)}>
                {t('plan_ui.add_day')}
              </Button>
            )
          )}
        </div>
      </Modal>

      <ConfirmModal
        isOpen={dayToDelete !== null}
        onClose={() => !busy && setDayToDelete(null)}
        onConfirm={async () => {
          if (dayToDelete && (await run(() => actions.deleteDay(dayToDelete.id)))) setDayToDelete(null);
        }}
        title={t('plan_ui.delete_day_title')}
        description={t('plan_ui.delete_day_desc')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        isDangerous
        isLoading={busy}
      />

      <ConfirmModal
        isOpen={confirmDeletePlan}
        onClose={() => !busy && setConfirmDeletePlan(false)}
        onConfirm={async () => {
          if (await run(() => actions.deletePlan(plan.id))) onClose();
        }}
        title={t('plan_ui.delete_plan_title')}
        description={t('plan_ui.delete_plan_desc')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        isDangerous
        isLoading={busy}
      />
    </>
  );
}

'use client';

import { useTranslation } from '@/libs/i18n/useTranslation';
import { Textarea } from '@/components/ui/Textarea';
import React, { useState, useEffect, useRef } from 'react';
import { Modal, Input, Button } from '@/components';
import { Barbell as Dumbbell} from '@phosphor-icons/react';
import type { SportType, WorkoutDay, WorkoutPlan } from '@/types/database';
import { SportExercise } from '@/data/sportExercisesData';
import { getProfileToday } from '@/libs/profileDate';
import { describeTarget } from '@/libs/workoutTargets';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
  /** Logging a day of a plan: the session is linked to it and starts from its targets. */
  planDay?: { plan: WorkoutPlan; day: WorkoutDay };
}

export const QuickLogModal: React.FC<Props> = ({ isOpen, onClose, onSubmit, isLoading, planDay }) => {
  const { t } = useTranslation();
  const plannedExercises = [...(planDay?.day.exercises ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  const plannedType = plannedExercises[0]?.sport_type;
  const [sportType, setSportType] = useState<SportType>(!plannedType ? 'lift' : plannedType === 'hiit' ? 'other' : plannedType);
  const [durationMinutes, setDurationMinutes] = useState(String(planDay?.day.target_duration_minutes ?? 60));
  const [rating, setRating] = useState('3');
  const [notes, setNotes] = useState('');

  // Specific exercise logging
  const [exerciseQuery, setExerciseQuery] = useState('');
  const [selectedExercise, setSelectedExercise] = useState<SportExercise | null>(null);
  const [exerciseSuggestions, setExerciseSuggestions] = useState<SportExercise[]>([]);
  const [isSearchingExercises, setIsSearchingExercises] = useState(false);
  const [isExerciseDropdownOpen, setIsExerciseDropdownOpen] = useState(false);

  // Exercise metrics
  const [sets, setSets] = useState('3');
  const [reps, setReps] = useState('10');
  const [weightKg, setWeightKg] = useState('50');
  const [distanceKm, setDistanceKm] = useState('5');

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch exercise suggestions from API
  useEffect(() => {
    const timer = setTimeout(() => {
      const q = exerciseQuery.trim();
      setIsSearchingExercises(true);
      fetch(`/api/sport/exercises?q=${encodeURIComponent(q)}`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data.exercises)) {
            setExerciseSuggestions(data.exercises);
          }
        })
        .catch(() => {})
        .finally(() => setIsSearchingExercises(false));
    }, 200);

    return () => clearTimeout(timer);
  }, [exerciseQuery]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsExerciseDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectExercise = (ex: SportExercise) => {
    setSelectedExercise(ex);
    setExerciseQuery(ex.name);
    setIsExerciseDropdownOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const exercisesLog = [];
    if (exerciseQuery.trim()) {
      exercisesLog.push({
        name: selectedExercise?.name || exerciseQuery.trim(),
        category: selectedExercise?.category || (sportType === 'lift' ? 'Weight Lifting' : sportType),
        equipment: selectedExercise?.equipment,
        sets: sportType === 'lift' ? parseInt(sets) || 0 : undefined,
        reps: sportType === 'lift' ? parseInt(reps) || 0 : undefined,
        weight_kg: sportType === 'lift' ? parseFloat(weightKg) || 0 : undefined,
        distance_km: ['run', 'cycle', 'swim'].includes(sportType) ? parseFloat(distanceKm) || 0 : undefined,
      });
    }

    await onSubmit({
      session_date: getProfileToday(),
      duration_minutes: parseInt(durationMinutes) || 0,
      rating: parseInt(rating),
      notes: notes.trim() ? notes : (exerciseQuery ? t('sport_forms.exercise_note').replace('{name}', exerciseQuery) : ''),
      exercises_log: exercisesLog,
      ...(planDay && { workout_plan_id: planDay.plan.id, workout_day_id: planDay.day.id }),
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={planDay ? t('plan_ui.log_for').replace('{day}', planDay.day.name || planDay.plan.name) : t('sport_page.quick_log_workout')}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {plannedExercises.length > 0 && (
          <div className="rounded-lg bg-foreground/[0.03] p-3">
            <p className="mb-1 text-xs font-semibold text-muted-foreground">{t('plan_ui.planned_title')}</p>
            <ul className="space-y-0.5 text-sm text-foreground">
              {plannedExercises.map((exercise) => (
                <li key={exercise.id} className="flex flex-wrap justify-between gap-x-3">
                  <span>{exercise.name}</span>
                  <span className="font-mono text-xs text-muted-foreground">{describeTarget(exercise, t('sport_page.min_label'))}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Sport Type */}
        <div>
          <label className="block text-xs font-semibold text-subtle mb-2">{t('sport_forms.category_label')}</label>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'lift', label: t('sport_forms.type_lift') },
              { id: 'run', label: t('sport_forms.type_run') },
              { id: 'cycle', label: t('sport_forms.type_cycle') },
              { id: 'swim', label: t('sport_forms.type_swim') },
              { id: 'yoga', label: t('sport_forms.type_yoga') },
              { id: 'other', label: t('sport_forms.type_other') },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setSportType(item.id as SportType);
                  setSelectedExercise(null);
                  setExerciseQuery('');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  sportType === item.id
                    ? 'bg-primary text-on-primary'
                    : 'bg-foreground/5 text-muted-foreground hover:bg-foreground/10'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Exercise Autocomplete / Name */}
        <div ref={dropdownRef} className="relative">
          <label className="mb-1 flex items-center justify-between text-xs font-semibold text-subtle">
            <span>{t('sport_forms.exercise_label')}</span>
            <span className="text-xs text-muted-foreground">WGER Open Exercise DB</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={exerciseQuery}
              onChange={(e) => {
                setExerciseQuery(e.target.value);
                setIsExerciseDropdownOpen(true);
              }}
              onFocus={() => setIsExerciseDropdownOpen(true)}
              placeholder={
                sportType === 'lift'
                  ? t('sport_forms.placeholder_lift')
                  : sportType === 'run'
                  ? t('sport_forms.placeholder_run')
                  : t('sport_forms.placeholder_other')
              }
              className="w-full h-11 px-6 bg-surface/70 border border-muted-foreground/25 rounded-md focus:ring-2 focus:ring-secondary/40 text-foreground text-sm outline-none transition-all placeholder:text-muted-foreground/50"
            />
            {isSearchingExercises && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{t('common.loading')}</span>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {isExerciseDropdownOpen && exerciseSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1 z-[300] max-h-56 overflow-y-auto rounded-xl border border-foreground/10 bg-background p-1 text-foreground ">
              <div className="px-2 py-1 text-xs font-bold text-muted-foreground border-b border-foreground/5 mb-1">{t('sport_forms.catalog')}</div>
              {exerciseSuggestions.map((ex) => (
                <button
                  key={ex.id}
                  type="button"
                  onClick={() => handleSelectExercise(ex)}
                  className="w-full text-left flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs hover:bg-foreground/10 transition-colors"
                >
                  <span className="font-medium text-foreground">{ex.name}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs px-1.5 py-0.5 rounded bg-foreground/5 text-muted-foreground border border-foreground/10">
                      {ex.category}
                    </span>
                    {ex.equipment && (
                      <span className="text-xs text-muted-foreground font-mono">
                        {ex.equipment}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Dynamic Metrics */}
        {sportType === 'lift' ? (
          <div className="grid grid-cols-3 gap-2 p-3 rounded-lg bg-foreground/[0.02] border border-foreground/5">
            <Input
              label={t('sport_forms.sets')}
              type="number"
              min="1"
              value={sets}
              onChange={(e) => setSets(e.target.value)}
            />
            <Input
              label={t('sport_forms.reps')}
              type="number"
              min="1"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
            />
            <Input
              label={t('sport_forms.weight')}
              type="number"
              step="0.5"
              min="0"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
            />
          </div>
        ) : ['run', 'cycle', 'swim'].includes(sportType) ? (
          <div className="grid grid-cols-1 gap-2 p-3 rounded-lg bg-foreground/[0.02] border border-foreground/5">
            <Input
              label={t('sport_forms.distance')}
              type="number"
              step="0.1"
              min="0"
              value={distanceKm}
              onChange={(e) => setDistanceKm(e.target.value)}
            />
          </div>
        ) : null}

        {/* Duration & Rating */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label={t('sport_forms.duration')}
            type="number"
            min="1"
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(e.target.value)}
            required
          />
          <Input
            label={t('sport_forms.intensity')}
            type="number"
            min="1"
            max="5"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-subtle mb-1">{t('sport_forms.notes_label')}</label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder={t('sport_forms.notes_placeholder')}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-foreground/10">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>{t('common.cancel')}</Button>
          <Button type="submit" variant="primary" isLoading={isLoading} leftIcon={<Dumbbell size={16} />}>{t('sport_forms.save')}</Button>
        </div>
      </form>
    </Modal>
  );
};

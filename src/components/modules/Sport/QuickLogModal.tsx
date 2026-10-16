'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Modal, Input, Button } from '@/components';
import { Barbell as Dumbbell, Plus, Trash as Trash2, Fire, Heartbeat } from '@phosphor-icons/react';
import type { SportType } from '@/types/database';
import { SportExercise } from '@/data/sportExercisesData';
import { getProfileToday } from '@/libs/profileDate';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
}

export const QuickLogModal: React.FC<Props> = ({ isOpen, onClose, onSubmit, isLoading }) => {
  const [sportType, setSportType] = useState<SportType>('lift');
  const [durationMinutes, setDurationMinutes] = useState('60');
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
      notes: notes.trim() ? notes : (exerciseQuery ? `Gerakan: ${exerciseQuery}` : ''),
      exercises_log: exercisesLog,
    });

    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Quick Log Workout">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Sport Type */}
        <div>
          <label className="block text-xs font-semibold text-subtle tracking-wide mb-2">
            Kategori Olahraga
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'lift', label: 'Lifting / Gym' },
              { id: 'run', label: 'Running' },
              { id: 'cycle', label: 'Cycling' },
              { id: 'swim', label: 'Swimming' },
              { id: 'yoga', label: 'Yoga' },
              { id: 'other', label: 'Sport & Other' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setSportType(item.id as SportType);
                  setSelectedExercise(null);
                  setExerciseQuery('');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all ${
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
          <label className="block text-xs font-semibold text-subtle tracking-wide mb-1 flex items-center justify-between">
            <span>Nama Gerakan / Olahraga (Opsional)</span>
            <span className="text-xs text-muted-foreground/60">WGER Open Exercise DB</span>
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
                  ? 'Contoh: Bench Press, Barbell Squat, Deadlift...'
                  : sportType === 'run'
                  ? 'Contoh: 5K Morning Run, Interval Sprint...'
                  : 'Contoh: Badminton, Futsal, Sepeda Santai...'
              }
              className="w-full h-11 px-6 bg-surface/70 border border-muted-foreground/25 rounded-md focus:ring-2 focus:ring-secondary/40 text-foreground text-sm outline-none transition-all placeholder:text-muted-foreground/50"
            />
            {isSearchingExercises && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">Searching</span>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {isExerciseDropdownOpen && exerciseSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1 z-[300] max-h-56 overflow-y-auto rounded-xl border border-foreground/10 bg-background p-1 text-foreground ">
              <div className="px-2 py-1 text-xs font-bold uppercase tracking-wider text-muted-foreground/50 border-b border-foreground/5 mb-1">
                Katalog Gerakan Latihan Terverifikasi
              </div>
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
                      <span className="text-xs text-muted-foreground/60 font-mono">
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
              label="Sets"
              type="number"
              min="1"
              value={sets}
              onChange={(e) => setSets(e.target.value)}
            />
            <Input
              label="Reps / Set"
              type="number"
              min="1"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
            />
            <Input
              label="Beban (Kg)"
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
              label="Jarak (Km)"
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
            label="Durasi (Menit)"
            type="number"
            min="1"
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(e.target.value)}
            required
          />
          <Input
            label="Intensitas (1-5)"
            type="number"
            min="1"
            max="5"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-subtle tracking-wide mb-1">
            Catatan / Evaluasi Sesi
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-surface/50 border border-muted-foreground/20 rounded-md p-3 text-foreground text-sm focus:outline-none focus:border-secondary/50 transition-colors"
            rows={2}
            placeholder="Bagaimana rasanya latihan hari ini?"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-foreground/10">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            Batal
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading} leftIcon={<Dumbbell size={16} />}>
            Simpan Latihan
          </Button>
        </div>
      </form>
    </Modal>
  );
};

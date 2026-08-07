'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Modal, Input, Button } from '@/components';
import { Barbell as Dumbbell, Plus, Trash as Trash2, Sparkle, Fire, Heartbeat } from '@phosphor-icons/react';
import type { SportType } from '@/types/database';
import { SportExercise } from '@/data/sportExercisesData';

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
      session_date: new Date().toISOString().split('T')[0],
      duration_minutes: parseInt(durationMinutes) || 0,
      rating: parseInt(rating),
      notes: notes.trim() ? notes : (exerciseQuery ? `Gerakan: ${exerciseQuery}` : ''),
      exercises_log: exercisesLog,
    });

    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Quick Log Workout">
      <form onSubmit={handleSubmit} className="space-y-md">
        {/* Sport Type */}
        <div>
          <label className="block text-xs font-semibold text-gray-very-light tracking-wide mb-2">
            Kategori Olahraga
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'lift', label: '🏋️ Lifting / Gym' },
              { id: 'run', label: '🏃 Running' },
              { id: 'cycle', label: '🚴 Cycling' },
              { id: 'swim', label: '🏊 Swimming' },
              { id: 'yoga', label: '🧘 Yoga' },
              { id: 'other', label: '🏸 Sport & Other' },
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
                    ? 'bg-primary text-warm-black shadow-[0_0_15px_rgba(244,201,93,0.3)]'
                    : 'bg-black/5 dark:bg-white/5 text-gray-light hover:bg-black/10 dark:bg-white/10'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Exercise Autocomplete / Name */}
        <div ref={dropdownRef} className="relative">
          <label className="block text-xs font-semibold text-gray-very-light tracking-wide mb-1 flex items-center justify-between">
            <span>Nama Gerakan / Olahraga (Opsional)</span>
            <span className="text-[10px] text-gray-light/60">WGER Open Exercise DB</span>
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
              className="w-full h-11 px-lg bg-gray-strong/70 border border-gray-light/25 rounded-md focus:ring-2 focus:ring-secondary/40 text-soft-cream text-sm outline-none transition-all placeholder:text-gray-light/50"
            />
            {isSearchingExercises && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {isExerciseDropdownOpen && exerciseSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1 z-[300] max-h-56 overflow-y-auto rounded-xl border border-white/10 bg-warm-black/95 backdrop-blur-2xl p-1 text-soft-cream shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-light/50 border-b border-white/5 mb-1">
                Katalog Gerakan Latihan Terverifikasi
              </div>
              {exerciseSuggestions.map((ex) => (
                <button
                  key={ex.id}
                  type="button"
                  onClick={() => handleSelectExercise(ex)}
                  className="w-full text-left flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs hover:bg-white/10 transition-colors"
                >
                  <span className="font-medium text-soft-cream">{ex.name}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-gray-light border border-white/10">
                      {ex.category}
                    </span>
                    {ex.equipment && (
                      <span className="text-[9px] text-gray-light/60 font-mono">
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
          <div className="grid grid-cols-3 gap-sm p-3 rounded-lg bg-white/[0.02] border border-white/5">
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
          <div className="grid grid-cols-1 gap-sm p-3 rounded-lg bg-white/[0.02] border border-white/5">
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
        <div className="grid grid-cols-2 gap-md">
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
          <label className="block text-xs font-semibold text-gray-very-light tracking-wide mb-1">
            Catatan / Evaluasi Sesi
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-gray-strong/50 border border-gray-light/20 rounded-md p-3 text-soft-cream text-sm focus:outline-none focus:border-secondary/50 transition-colors"
            rows={2}
            placeholder="Bagaimana rasanya latihan hari ini?"
          />
        </div>

        <div className="flex justify-end gap-3 pt-md border-t border-white/10">
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

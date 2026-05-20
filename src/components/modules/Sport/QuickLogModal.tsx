'use client';

import React, { useState } from 'react';
import { Modal, Input, Button } from '@/components';
import { useAuthStore } from '@/store/authStore';
import { Dumbbell, Plus, Trash2 } from 'lucide-react';
import type { SportType } from '@/types/database';

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
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      session_date: new Date().toISOString().split('T')[0],
      duration_minutes: parseInt(durationMinutes) || 0,
      rating: parseInt(rating),
      notes,
      exercises_log: [], // Quick log doesn't detail exercises by default, could be added
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Quick Log Workout">
      <form onSubmit={handleSubmit} className="space-y-md">
        <div className="grid grid-cols-2 gap-md">
          <Input
            label="Duration (minutes)"
            type="number"
            min="1"
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(e.target.value)}
            required
          />
          <Input
            label="Intensity Rating (1-5)"
            type="number"
            min="1"
            max="5"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-white mb-2">Sport Type</label>
          <div className="flex flex-wrap gap-2">
            {['lift', 'run', 'cycle', 'swim', 'yoga', 'other'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setSportType(type as SportType)}
                className={`px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase transition-all ${
                  sportType === type 
                    ? 'bg-primary text-warm-black shadow-[0_0_10px_rgba(78,79,235,0.3)]' 
                    : 'bg-white/5 text-gray-light hover:bg-white/10'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-white mb-2">Notes (Optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-md p-3 text-white focus:outline-none focus:border-primary/50 transition-colors"
            rows={3}
            placeholder="How did it feel?"
          />
        </div>

        <div className="flex justify-end gap-3 pt-md border-t border-white/10">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            Save Workout
          </Button>
        </div>
      </form>
    </Modal>
  );
};

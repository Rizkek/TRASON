'use client';

import React, { useState } from 'react';
import { Modal, Input, Button } from '@/components';
import { Dumbbell } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
}

export const CreatePlanModal: React.FC<Props> = ({ isOpen, onClose, onSubmit, isLoading }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [durationWeeks, setDurationWeeks] = useState('4');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      name,
      description,
      duration_weeks: parseInt(durationWeeks) || 4,
      is_active: true
    });
    setName('');
    setDescription('');
    setDurationWeeks('4');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Workout Plan">
      <form onSubmit={handleSubmit} className="space-y-md">
        <Input
          label="Plan Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. 5x5 Strength, Summer Shred"
          required
        />
        
        <Input
          label="Duration (Weeks)"
          type="number"
          min="1"
          max="52"
          value={durationWeeks}
          onChange={(e) => setDurationWeeks(e.target.value)}
          required
        />

        <div>
          <label className="block text-sm font-semibold text-white mb-2">Description (Optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-md p-3 text-white focus:outline-none focus:border-primary/50 transition-colors"
            rows={3}
            placeholder="What is the goal of this plan?"
          />
        </div>

        <div className="flex justify-end gap-3 pt-md border-t border-black/10 dark:border-white/10">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading} leftIcon={<Dumbbell size={16} />}>
            Create Plan
          </Button>
        </div>
      </form>
    </Modal>
  );
};

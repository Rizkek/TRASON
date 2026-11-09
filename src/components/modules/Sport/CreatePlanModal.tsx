'use client';

import { useTranslation } from '@/libs/i18n/useTranslation';
import { Textarea } from '@/components/ui/Textarea';
import React, { useState } from 'react';
import { Modal, Input, Button } from '@/components';
import { Barbell as Dumbbell } from '@phosphor-icons/react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
}

export const CreatePlanModal: React.FC<Props> = ({ isOpen, onClose, onSubmit, isLoading }) => {
  const { t } = useTranslation();
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
    <Modal isOpen={isOpen} onClose={onClose} title={t('sport_forms.plan_title')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={t('sport_forms.plan_name')}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('sport_forms.plan_name_placeholder')}
          required
        />
        
        <Input
          label={t('sport_forms.plan_weeks')}
          type="number"
          min="1"
          max="52"
          value={durationWeeks}
          onChange={(e) => setDurationWeeks(e.target.value)}
          required
        />

        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">{t('sport_forms.plan_desc_label')}</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder={t('sport_forms.plan_desc_placeholder')}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-foreground/10">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>{t('common.cancel')}</Button>
          <Button type="submit" variant="primary" isLoading={isLoading} leftIcon={<Dumbbell size={16} />}>{t('sport_forms.plan_create')}</Button>
        </div>
      </form>
    </Modal>
  );
};

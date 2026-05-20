'use client';

import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input } from './Input';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
  requireInput?: string;
  isLoading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDangerous = false,
  requireInput,
  isLoading = false,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    if (requireInput && inputValue !== requireInput) {
      setError(`Please type "${requireInput}" to confirm.`);
      return;
    }
    setError('');
    onConfirm();
  };

  // Reset state when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setInputValue('');
      setError('');
    }
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={
        <div className="flex justify-end gap-md">
          <Button variant="ghost" size="md" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            variant={isDangerous ? 'danger' : 'primary'}
            size="md"
            onClick={handleConfirm}
            isLoading={isLoading}
            disabled={isLoading || (!!requireInput && inputValue !== requireInput)}
          >
            {confirmText}
          </Button>
        </div>
      }
    >
      <div className="space-y-md">
        <p className="text-sm text-soft-cream whitespace-pre-wrap">{description}</p>
        
        {requireInput && (
          <div className="space-y-sm pt-sm">
            <p className="text-xs text-gray-light italic">
              Type <span className="font-bold text-white select-all">{requireInput}</span> below to confirm:
            </p>
            <Input
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                if (error) setError('');
              }}
              placeholder={requireInput}
              disabled={isLoading}
            />
            {error && <p className="text-xs text-danger">{error}</p>}
          </div>
        )}
      </div>
    </Modal>
  );
};

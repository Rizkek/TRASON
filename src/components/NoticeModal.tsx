'use client';

import React from 'react';
import { Modal } from './Modal';
import { Button } from './ui/Button';

interface NoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  buttonText?: string;
}

/** One-button dialog for telling the user why an action was refused. Stacks above form modals. */
export const NoticeModal: React.FC<NoticeModalProps> = ({ isOpen, onClose, title, message, buttonText = 'OK' }) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title={title}
    baseZIndex={100}
    maxWidth="sm"
    footer={
      <div className="flex justify-end">
        <Button variant="primary" size="md" onClick={onClose}>
          {buttonText}
        </Button>
      </div>
    }
  >
    <p className="text-sm text-gray-very-light leading-relaxed" role="alert">
      {message}
    </p>
  </Modal>
);

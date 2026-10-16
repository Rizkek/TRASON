'use client';

import React from 'react';
import { Eye, EyeSlash } from '@phosphor-icons/react';
import { useTranslation } from '@/libs/i18n/useTranslation';

interface PasswordToggleProps {
  visible: boolean;
  onToggle: () => void;
}

// Sits in the Input suffix slot; the negative margin keeps a 44px target inside the field height.
export function PasswordToggle({ visible, onToggle }: PasswordToggleProps) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={visible ? t('auth.hide_password') : t('auth.show_password')}
      aria-pressed={visible}
      className="-mr-3 flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
    >
      {visible ? <EyeSlash size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
    </button>
  );
}

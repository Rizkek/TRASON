'use client';

import React from 'react';
import { useTranslation } from '@/libs/i18n/useTranslation';

interface PlaceholderProps {
  className?: string;
  label?: string;
}

/**
 * Static stand-in for content that is still loading. It does not animate (no pulse or shimmer);
 * the label is read out by screen readers.
 */
export const Placeholder: React.FC<PlaceholderProps> = ({ className = 'h-10 w-full', label }) => {
  const { t } = useTranslation();
  return (
    <div role="status" aria-busy="true" className={`rounded-lg bg-foreground/[0.07] ${className}`}>
      <span className="sr-only">{label ?? t('common.loading_section')}</span>
    </div>
  );
};

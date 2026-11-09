'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Card } from './Card';

const TONES = {
  default: 'text-foreground',
  income: 'text-income',
  expense: 'text-expense',
  primary: 'text-primary',
};

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  tone?: keyof typeof TONES;
  isLoading?: boolean;
  className?: string;
}

/** One figure with its label. A long amount wraps rather than truncates, because a cut-off total is a wrong total. */
export function StatCard({ label, value, hint, tone = 'default', isLoading, className }: StatCardProps) {
  return (
    <Card className={cn('p-4 md:p-5', className)}>
      <p className="text-label-sm font-normal text-muted-foreground">{label}</p>
      <p
        className={cn(
          'mt-1 break-words font-mono text-base font-semibold tabular-nums sm:text-title-lg xl:text-heading-md',
          isLoading ? 'text-muted-foreground' : TONES[tone]
        )}
      >
        {isLoading ? '…' : value}
      </p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </Card>
  );
}

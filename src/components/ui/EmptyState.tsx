'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: React.ElementType;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center gap-2 px-4 py-12 text-center', className)}>
      {Icon && <Icon size={32} aria-hidden="true" className="mb-1 text-muted-foreground" />}
      <p className="text-body-md font-medium text-foreground">{title}</p>
      {description && <p className="max-w-md text-body-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

'use client';

import React, { useRef } from 'react';
import { cn } from '@/lib/utils';

export interface TabItem<T extends string> {
  id: T;
  label: string;
  icon?: React.ElementType;
}

interface TabsProps<T extends string> {
  items: TabItem<T>[];
  value: T;
  onChange: (id: T) => void;
  /** Names the group for screen readers. */
  label: string;
  /** `underline` switches between sections of a page; `segmented` filters one list. */
  variant?: 'underline' | 'segmented';
  className?: string;
}

const CONTAINER = {
  underline: 'flex gap-1 border-b border-foreground/10',
  segmented: 'inline-flex max-w-full gap-1 rounded-lg bg-foreground/[0.05] p-1',
};

const TAB = {
  underline: '-mb-px min-h-11 border-b-2 px-3',
  segmented: 'min-h-9 rounded-md border px-3',
};

const TAB_STATE = {
  underline: {
    active: 'border-primary text-foreground',
    idle: 'border-transparent text-muted-foreground hover:text-foreground',
  },
  segmented: {
    active: 'border-foreground/10 bg-surface text-foreground',
    idle: 'border-transparent text-muted-foreground hover:text-foreground',
  },
};

/** The one tab control. Labels stay visible at every width; a long row scrolls instead of hiding them. */
export function Tabs<T extends string>({ items, value, onChange, label, variant = 'underline', className }: TabsProps<T>) {
  const listRef = useRef<HTMLDivElement>(null);

  const select = (id: T) => {
    onChange(id);
    const tab = listRef.current?.querySelector<HTMLElement>(`[data-tab="${id}"]`);
    tab?.focus();
    tab?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (step === 0) return;
    e.preventDefault();
    select(items[(index + step + items.length) % items.length].id);
  };

  return (
    <div ref={listRef} role="tablist" aria-label={label} className={cn(CONTAINER[variant], 'no-scrollbar overflow-x-auto', className)}>
      {items.map((item, index) => {
        const isActive = item.id === value;
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            data-tab={item.id}
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => select(item.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={cn(
              'flex shrink-0 items-center gap-2 whitespace-nowrap text-label-md transition-colors focus-visible:-outline-offset-2',
              TAB[variant],
              TAB_STATE[variant][isActive ? 'active' : 'idle']
            )}
          >
            {Icon && <Icon size={16} aria-hidden="true" className="shrink-0" />}
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

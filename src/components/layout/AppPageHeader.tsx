import React from 'react';
import { Heading, Paragraph } from '@/components/ui/typography';
import { cn } from '@/lib/utils';

interface AppPageHeaderProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  /**
   * Small buttons on the right, on the same row as the title at every width so the header
   * never grows a second row on phones. Use `size="sm"`; pass `iconOnlyOnMobile` to secondary
   * actions, and hide actions that already have a floating button on mobile.
   */
  actions?: React.ReactNode;
  /** Controls that belong to the header but not the title row, such as a month switcher. */
  children?: React.ReactNode;
  className?: string;
}

/** Shared title block for pages inside the (app) shell. */
export function AppPageHeader({ title, description, actions, children, className }: AppPageHeaderProps) {
  return (
    <header className={cn('space-y-3', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1">
          <Heading as="h1" size="h2" weight="semibold" className="tracking-tight text-foreground">
            {title}
          </Heading>
          {description && <Paragraph className="text-body-md text-muted-foreground">{description}</Paragraph>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
      {children}
    </header>
  );
}

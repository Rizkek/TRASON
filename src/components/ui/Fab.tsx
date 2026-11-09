'use client';

import React from 'react';
import { Plus } from '@phosphor-icons/react';
import { Button } from './Button';

interface FabProps {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
}

/** The page's main action on phones, above the bottom bar. From `md` the same action sits in the page header. */
export function Fab({ label, onClick, icon = <Plus size={24} aria-hidden="true" /> }: FabProps) {
  return (
    <Button
      variant="primary"
      onClick={onClick}
      aria-label={label}
      className="fixed bottom-[calc(6rem+env(safe-area-inset-bottom))] right-4 z-40 h-14 w-14 rounded-full px-0 md:hidden"
    >
      {icon}
    </Button>
  );
}

import React from 'react';
import { Check } from '@phosphor-icons/react';

interface ModuleSelectionCardProps {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  isSelected: boolean;
  onToggle: (id: string) => void;
}

export const ModuleSelectionCard: React.FC<ModuleSelectionCardProps> = ({
  id,
  title,
  description,
  icon: Icon,
  isSelected,
  onToggle,
}) => (
  <button
    type="button"
    role="checkbox"
    aria-checked={isSelected}
    onClick={() => onToggle(id)}
    className={`flex min-h-20 w-full items-start gap-4 rounded-xl border p-4 text-left transition-colors ${
      isSelected
        ? 'border-primary bg-primary/[0.06]'
        : 'border-foreground/15 bg-foreground/[0.03] hover:border-foreground/30'
    }`}
  >
    <span
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${
        isSelected ? 'bg-primary/20 text-primary' : 'bg-foreground/[0.06] text-muted-foreground'
      }`}
    >
      <Icon size={22} aria-hidden="true" />
    </span>

    <span className="min-w-0 flex-1">
      <span className="block text-title-md text-foreground">{title}</span>
      <span className="mt-0.5 block text-body-md text-muted-foreground">{description}</span>
    </span>

    <span
      aria-hidden="true"
      className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
        isSelected ? 'border-primary bg-primary text-on-primary' : 'border-muted-foreground/60'
      }`}
    >
      {isSelected && <Check size={14} weight="bold" />}
    </span>
  </button>
);

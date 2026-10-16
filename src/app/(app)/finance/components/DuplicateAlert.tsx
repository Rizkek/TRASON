import React from 'react';
import { WarningCircle, ArrowRight } from '@phosphor-icons/react';
import { DuplicateMatch } from '@/services/finance/capture/duplicateDetector';
import { formatCurrency, formatDate } from '@/libs/format';

interface Props {
  matches: DuplicateMatch[];
  currency?: string;
  locale?: string;
  onIgnore: () => void;
  onViewDuplicate: (id: string) => void;
}

export function DuplicateAlert({ matches, currency = 'USD', locale = 'en-US', onIgnore, onViewDuplicate }: Props) {
  if (matches.length === 0) return null;

  const topMatch = matches[0];

  return (
    <div className="bg-warning/10 border border-warning/30 rounded-xl p-4 mb-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-warning" />
      <div className="flex items-start gap-3">
        <WarningCircle size={20} className="text-warning shrink-0 mt-0.5" weight="fill" />
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-warning mb-1">Possible Duplicate Detected</h4>
          <p className="text-xs text-muted-foreground mb-3">
            {topMatch.reason}
          </p>
          
          <div className="bg-background/60 rounded-lg p-3 mb-3 flex items-center justify-between border border-foreground/5">
            <div>
              <p className="text-xs font-medium text-foreground">{topMatch.transaction.title}</p>
              <p className="text-xs text-muted-foreground">{formatDate(topMatch.transaction.date)}</p>
            </div>
            <p className="text-sm font-bold text-foreground">
              {formatCurrency(topMatch.transaction.amount, topMatch.transaction.original_currency || currency, locale)}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onIgnore}
              className="text-xs font-semibold text-warning hover:text-foreground transition-colors"
            >
              Ignore & Save Anyway
            </button>
            <button
              type="button"
              onClick={() => onViewDuplicate(topMatch.transaction.id)}
              className="text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              View Existing <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

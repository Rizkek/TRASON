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
          <p className="text-xs text-gray-light mb-3">
            {topMatch.reason}
          </p>
          
          <div className="bg-black/20 rounded-lg p-3 mb-3 flex items-center justify-between border border-black/10 dark:border-white/5">
            <div>
              <p className="text-xs font-medium text-soft-cream">{topMatch.transaction.title}</p>
              <p className="text-[10px] text-gray-light">{formatDate(topMatch.transaction.date)}</p>
            </div>
            <p className="text-sm font-bold text-soft-cream">
              {formatCurrency(topMatch.transaction.amount, topMatch.transaction.original_currency || currency, locale)}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onIgnore}
              className="text-xs font-semibold text-warning hover:text-white transition-colors"
            >
              Ignore & Save Anyway
            </button>
            <button
              type="button"
              onClick={() => onViewDuplicate(topMatch.transaction.id)}
              className="text-xs font-semibold text-gray-light hover:text-white flex items-center gap-1 transition-colors"
            >
              View Existing <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

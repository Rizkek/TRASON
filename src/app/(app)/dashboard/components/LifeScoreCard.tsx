'use client';

import React, { useState, useMemo } from 'react';
import { useLifeScore } from '@/hooks/useLifeScore';
import { Card, InlineError } from '@/components';
import { Placeholder } from '@/components/ui/Placeholder';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { TrendUp as TrendingUp, CaretDown as ChevronDown, CaretUp as ChevronUp } from '@phosphor-icons/react';

const DIMENSION_KEYS = ['finance', 'productivity', 'health', 'career'] as const;

const toneFor = (score: number) =>
  score >= 80 ? 'success' : score >= 60 ? 'primary' : score >= 40 ? 'warning' : 'danger';

const TONE_TEXT = { success: 'text-success', primary: 'text-primary', warning: 'text-warning', danger: 'text-danger' } as const;
const TONE_BADGE = {
  success: 'border-success/40 bg-success/10 text-success',
  primary: 'border-primary/40 bg-primary/10 text-primary',
  warning: 'border-warning/40 bg-warning/10 text-warning',
  danger: 'border-danger/40 bg-danger/10 text-danger',
} as const;

export function LifeScoreCard() {
  const { lifeScore, isLoading, error } = useLifeScore();
  const [showInsights, setShowInsights] = useState(false);
  const { t } = useTranslation();
  const { module_features } = useUserPreferences();

  const activeDimensions = useMemo(
    () =>
      DIMENSION_KEYS.filter((key) => {
        if (key === 'finance') return module_features?.['finance'] !== false;
        if (key === 'productivity') return module_features?.['timeline'] !== false;
        if (key === 'health') return module_features?.['sport'] !== false;
        if (key === 'career') return module_features?.['career'] !== false;
        return true;
      }),
    [module_features]
  );

  if (error) {
    return <InlineError message={t('dashboard.section_load_failed')} />;
  }

  if (isLoading) {
    return (
      <Card className="p-4">
        <Placeholder className="h-12 w-full" />
      </Card>
    );
  }

  if (!lifeScore) return null;

  const tone = toneFor(lifeScore.overall);
  const scoreLabel =
    lifeScore.overall >= 80
      ? t('life_score.labels.excellent')
      : lifeScore.overall >= 60
      ? t('life_score.labels.good')
      : lifeScore.overall >= 40
      ? t('life_score.labels.needs_attention')
      : t('life_score.labels.critical');

  return (
    <Card className="p-4">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <span className="rounded-lg bg-primary/15 p-2 text-primary">
            <TrendingUp size={18} aria-hidden="true" />
          </span>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="text-label-sm uppercase text-foreground">{t('life_score.ui.title')}</span>
            <span className="font-mono text-title-md text-foreground">
              {lifeScore.overall}
              <span className="text-xs font-normal text-muted-foreground">/100</span>
            </span>
            <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${TONE_BADGE[tone]}`}>{scoreLabel}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs text-muted-foreground sm:flex sm:flex-wrap sm:items-center sm:gap-x-5">
          {activeDimensions.map((key) => {
            const value = lifeScore[key];
            return (
              <div key={key} className="flex items-center justify-between gap-2 font-medium sm:justify-start">
                <span>{t(`life_score.dimensions.${key}`)}</span>
                <span className={`font-mono font-semibold ${TONE_TEXT[toneFor(value)]}`}>{value}</span>
              </div>
            );
          })}
        </div>
      </div>

      {lifeScore.insights.length > 0 && (
        <div className="mt-2 border-t border-foreground/10 pt-1">
          <button
            type="button"
            onClick={() => setShowInsights(!showInsights)}
            aria-expanded={showInsights}
            className="-ml-2 flex min-h-11 items-center gap-1 rounded-md px-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <span>
              {lifeScore.insights.length} {t('life_score.ui.insights_today')}
            </span>
            {showInsights ? <ChevronUp size={12} aria-hidden="true" /> : <ChevronDown size={12} aria-hidden="true" />}
          </button>

          {showInsights && (
            <ul className="space-y-2 pb-1 pt-1">
              {lifeScore.insights.map((insight: string, i: number) => (
                <li key={i} className="border-l-2 border-primary/50 pl-3 text-body-md text-muted-foreground">
                  {t(insight)}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Card>
  );
}

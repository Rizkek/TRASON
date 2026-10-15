'use client';

import React, { useState, useMemo } from 'react';
import { useLifeScore } from '@/hooks/useLifeScore';
import { Card, Loading } from '@/components';
import { Heading, Paragraph } from '@/components/ui/typography';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { TrendUp as TrendingUp, CaretDown as ChevronDown, CaretUp as ChevronUp } from '@phosphor-icons/react';

const DIMENSION_KEYS = ['finance', 'productivity', 'health', 'career'] as const;

export function LifeScoreCard() {
  const { lifeScore, isLoading } = useLifeScore();
  const [showInsights, setShowInsights] = useState(false);
  const { t } = useTranslation();
  const { module_features } = useUserPreferences();

  // Filter dimensions dynamically based on active modules
  const activeDimensions = useMemo(() => {
    return DIMENSION_KEYS.filter((key) => {
      if (key === 'finance') return module_features?.['finance'] !== false;
      if (key === 'productivity') return module_features?.['timeline'] !== false;
      if (key === 'health') return module_features?.['sport'] !== false;
      if (key === 'career') return module_features?.['career'] !== false;
      return true;
    });
  }, [module_features]);

  if (isLoading) {
    return (
      <Card className="p-4 bg-black/[0.02] dark:bg-white/[0.02] border-black/[0.05] dark:border-white/[0.05]">
        <div className="h-10 w-full bg-white/[0.02] rounded-lg" />
      </Card>
    );
  }

  if (!lifeScore) return null;

  const scoreColor =
    lifeScore.overall >= 80 ? 'text-success border-success/30 bg-success/10' :
    lifeScore.overall >= 60 ? 'text-primary border-primary/30 bg-primary/10' :
    lifeScore.overall >= 40 ? 'text-warning border-warning/30 bg-warning/10' :
    'text-danger border-danger/30 bg-danger/10';

  const scoreLabel =
    lifeScore.overall >= 80 ? t('life_score.labels.excellent') :
    lifeScore.overall >= 60 ? t('life_score.labels.good') :
    lifeScore.overall >= 40 ? t('life_score.labels.needs_attention') : t('life_score.labels.critical');

  return (
    <Card className="p-3.5 md:p-4 bg-black/[0.03] dark:bg-black/40 border border-black/[0.05] dark:border-white/[0.05] relative overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Overall Score and Label */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <TrendingUp size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium uppercase tracking-widest text-soft-cream">
                {t('life_score.ui.title')}
              </span>
              <span className="font-mono text-base font-semibold text-soft-cream">
                {lifeScore.overall}
                <span className="text-[10px] text-gray-light font-normal opacity-60">/100</span>
              </span>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${scoreColor}`}>
                {scoreLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Center / Right: Dimension Breakdown in Single Row */}
        <div className="flex items-center gap-4 flex-wrap text-xs text-gray-light">
          {activeDimensions.map((key) => {
            const val = lifeScore[key];
            const valColor =
              val >= 80 ? 'text-success' :
              val >= 60 ? 'text-primary' :
              val >= 40 ? 'text-warning' :
              'text-danger';

            return (
              <div key={key} className="flex items-center gap-1.5 font-medium">
                <span className="opacity-75">{t(`life_score.dimensions.${key}`)}</span>
                <span className={`font-mono font-semibold ${valColor}`}>{val}</span>
              </div>
            );
          })}

          {lifeScore.insights.length > 0 && (
            <button
              onClick={() => setShowInsights(!showInsights)}
              className="ml-auto text-[11px] font-medium text-gray-light hover:text-soft-cream transition-colors flex items-center gap-1 py-1 px-2 rounded-md hover:bg-white/5"
            >
              <span>{lifeScore.insights.length} {t('life_score.ui.insights_today')}</span>
              {showInsights ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          )}
        </div>
      </div>

      {/* Collapsible Insights */}
      {showInsights && lifeScore.insights.length > 0 && (
        <div className="mt-3 pt-3 border-t border-black/[0.05] dark:border-white/[0.05] space-y-2">
          {lifeScore.insights.map((insight: string, i: number) => (
            <Paragraph key={i} className="text-xs text-gray-light leading-relaxed pl-2 border-l-2 border-primary/40">
              {t(insight)}
            </Paragraph>
          ))}
        </div>
      )}
    </Card>
  );
}

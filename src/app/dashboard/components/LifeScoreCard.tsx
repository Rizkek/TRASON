'use client';

import React, { useState } from 'react';
import { useLifeScore } from '@/hooks/useLifeScore';
import { Card, Loading } from '@/components';
import { TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';

const DIMENSION_CONFIG = {
  finance: {
    label: 'Finance',
    color: '#10B981',
    bgColor: 'bg-emerald-500/10',
    textColor: 'text-emerald-400',
    icon: '💰',
  },
  productivity: {
    label: 'Produktivitas',
    color: '#8B5CF6',
    bgColor: 'bg-violet-500/10',
    textColor: 'text-violet-400',
    icon: '✅',
  },
  health: {
    label: 'Kesehatan',
    color: '#F59E0B',
    bgColor: 'bg-amber-500/10',
    textColor: 'text-amber-400',
    icon: '🏃',
  },
  career: {
    label: 'Karier',
    color: '#3B82F6',
    bgColor: 'bg-blue-500/10',
    textColor: 'text-blue-400',
    icon: '💼',
  },
};

function ScoreRing({ score, size = 120 }: { score: number; size?: number }) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const color = score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : score >= 40 ? '#F97316' : '#EF4444';

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={8}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={8}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold text-white leading-none">{score}</span>
        <span className="text-[10px] text-gray-light tracking-widest">/ 100</span>
      </div>
    </div>
  );
}

function DimensionBar({ label, score, icon, color, bgColor, textColor }: {
  label: string;
  score: number;
  icon: string;
  color: string;
  bgColor: string;
  textColor: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs text-gray-light">
          <span>{icon}</span>
          <span>{label}</span>
        </span>
        <span className={`text-xs font-bold ${textColor}`}>{score}</span>
      </div>
      <div className="h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export function LifeScoreCard() {
  const { lifeScore, isLoading } = useLifeScore();
  const [showInsights, setShowInsights] = useState(false);

  if (isLoading) {
    return (
      <Card className="p-xl">
        <div className="flex items-center justify-center py-2xl">
          <Loading text="Menghitung Life Score..." />
        </div>
      </Card>
    );
  }

  if (!lifeScore) return null;

  const scoreColor =
    lifeScore.overall >= 80 ? 'text-emerald-400' :
    lifeScore.overall >= 60 ? 'text-amber-400' :
    lifeScore.overall >= 40 ? 'text-orange-400' : 'text-red-400';

  const scoreLabel =
    lifeScore.overall >= 80 ? 'Sangat Baik' :
    lifeScore.overall >= 60 ? 'Baik' :
    lifeScore.overall >= 40 ? 'Perlu Perhatian' : 'Kritis';

  return (
    <Card className="p-xl bg-gradient-to-br from-gray-strong/80 to-black/60 border border-black/[0.05] dark:border-white/[0.05] relative overflow-hidden">
      {/* Glow */}
      <div className="absolute -top-8 -right-8 w-40 h-40 bg-primary/10 blur-3xl rounded-full pointer-events-none" />

      <div className="flex items-center justify-between mb-xl">
        <div>
          <h3 className="font-serif italic text-lg text-white flex items-center gap-sm">
            <TrendingUp size={18} className="text-primary" />
            Life Score
          </h3>
          <p className="text-micro text-gray-light mt-1">Skor holistik kehidupan Anda hari ini</p>
        </div>
        <div className={`text-xs font-bold px-sm py-xs rounded-full border ${
          lifeScore.overall >= 80 ? 'border-emerald-400/30 text-emerald-400 bg-emerald-400/10' :
          lifeScore.overall >= 60 ? 'border-amber-400/30 text-amber-400 bg-amber-400/10' :
          'border-red-400/30 text-red-400 bg-red-400/10'
        }`}>
          {scoreLabel}
        </div>
      </div>

      <div className="flex items-center gap-xl">
        {/* Score Ring */}
        <div className="flex-shrink-0">
          <ScoreRing score={lifeScore.overall} size={120} />
        </div>

        {/* Dimension Bars */}
        <div className="flex-1 space-y-md">
          {(Object.entries(DIMENSION_CONFIG) as [keyof typeof DIMENSION_CONFIG, typeof DIMENSION_CONFIG[keyof typeof DIMENSION_CONFIG]][]).map(([key, config]) => (
            <DimensionBar
              key={key}
              label={config.label}
              score={lifeScore[key]}
              icon={config.icon}
              color={config.color}
              bgColor={config.bgColor}
              textColor={config.textColor}
            />
          ))}
        </div>
      </div>

      {/* Insights */}
      {lifeScore.insights.length > 0 && (
        <div className="mt-xl pt-md border-t border-black/[0.05] dark:border-white/[0.05]">
          <button
            onClick={() => setShowInsights(!showInsights)}
            className="flex items-center gap-sm text-[11px] text-gray-light hover:text-soft-cream transition-colors w-full"
          >
            {showInsights ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            <span className="font-bold uppercase tracking-wider">
              {lifeScore.insights.length} Insight Hari Ini
            </span>
          </button>

          {showInsights && (
            <div className="mt-md space-y-sm">
              {lifeScore.insights.map((insight, i) => (
                <p key={i} className="text-xs text-gray-light leading-relaxed pl-sm border-l-2 border-primary/30">
                  {insight}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

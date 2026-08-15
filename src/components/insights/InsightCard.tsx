import React, { useState } from 'react';
import Link from 'next/link';
import { InsightCandidate } from '@/types/insight';
import { Card } from '@/components/ui/Card';
import { Info, ArrowRight, TrendUp, WarningCircle, Sparkle } from '@phosphor-icons/react';

interface InsightCardProps {
  insight: InsightCandidate;
  className?: string;
}

export function InsightCard({ insight, className = '' }: InsightCardProps) {
  const [showEvidence, setShowEvidence] = useState(false);

  const renderIcon = () => {
    switch (insight.type) {
      case 'attention': return <WarningCircle weight="fill" className="w-5 h-5 text-amber-500" />;
      case 'progress': return <TrendUp weight="bold" className="w-5 h-5 text-emerald-500" />;
      case 'pattern': return <Sparkle weight="fill" className="w-5 h-5 text-blue-500" />;
      case 'change': return <TrendUp weight="bold" className="w-5 h-5 text-indigo-500" />;
      default: return <Info weight="bold" className="w-5 h-5 text-muted-foreground" />;
    }
  };

  return (
    <Card className={`p-5 flex flex-col gap-3 bg-card border border-border shadow-sm rounded-xl ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          {renderIcon()}
          <h3 className="font-semibold text-foreground text-sm tracking-tight">{insight.title}</h3>
        </div>
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed">
        {insight.description}
      </p>

      {insight.evidence && (
        <div className="mt-1">
          <button 
            onClick={() => setShowEvidence(!showEvidence)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Info className="w-3 h-3" />
            <span>Why am I seeing this?</span>
          </button>
          
          {showEvidence && (
            <div className="mt-3 p-3 bg-secondary/50 rounded-lg text-xs text-secondary-foreground">
              {insight.evidence.metric && (
                <div className="flex justify-between items-center py-1">
                  <span className="text-muted-foreground">Metric</span>
                  <span className="font-medium">{insight.evidence.metric}</span>
                </div>
              )}
              {insight.evidence.comparison && (
                <div className="flex justify-between items-center py-1 border-t border-border/50">
                  <span className="text-muted-foreground">Change</span>
                  <span className="font-medium">{insight.evidence.comparison}</span>
                </div>
              )}
              {insight.evidence.period && (
                <div className="flex justify-between items-center py-1 border-t border-border/50">
                  <span className="text-muted-foreground">Period</span>
                  <span className="font-medium">{insight.evidence.period}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {insight.action && (
        <div className="mt-2 flex justify-end">
          <Link 
            href={insight.action.href}
            className="flex items-center gap-1 text-sm font-medium text-foreground hover:text-primary transition-colors"
          >
            {insight.action.label}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </Card>
  );
}

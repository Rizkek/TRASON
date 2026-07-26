'use client';

import React, { useMemo } from 'react';
import { Card, Badge, Loading } from '@/components';
import { useInvestmentJournal } from '@/hooks/useInvestmentJournal';
import { formatCurrency } from '@/libs/format';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { Briefcase, CurrencyCircleDollar, GraduationCap, TrendUp } from '@phosphor-icons/react';

// Unified Event Type
type LifeEvent = {
  id: string;
  date: Date;
  type: 'investment' | 'career' | 'life';
  title: string;
  description: string;
  icon: React.ElementType;
  colorClass: string;
  metadata?: any;
};

export function LifeEventsFeed() {
  const { locale, currency } = useUserPreferences();
  
  // 1. Fetch data
  const { journals: investments, isLoading: isInvLoading } = useInvestmentJournal();
  // TODO: Fetch from useCareer and useActivity
  // For MVP UI, we'll mock the career and life events to show the "chain" concept
  
  const events: LifeEvent[] = useMemo(() => {
    const list: LifeEvent[] = [];
    
    // Add Investment Journals (Focus on Rationale & Notes)
    investments.forEach(inv => {
      list.push({
        id: `inv-${inv.id}`,
        date: new Date(inv.transaction_date),
        type: 'investment',
        title: `Keputusan Finansial: ${inv.asset_name || inv.asset_symbol}`,
        description: inv.notes || `Alasan: ${inv.rationale_type?.replace('_', ' ').toUpperCase() || 'Tanpa Alasan'}`,
        icon: TrendUp,
        colorClass: 'text-primary bg-primary/10 border-primary/20',
        metadata: { rationale: inv.rationale_type, amount: formatCurrency(inv.total_value, inv.currency, locale) }
      });
    });

    // Mock Career Events
    const now = new Date();
    list.push({
      id: 'career-1',
      date: new Date(now.getTime() - 7 * 30 * 24 * 60 * 60 * 1000), // 7 months ago
      type: 'career',
      title: 'Mulai Magang',
      description: 'Diterima magang di Tech Corp.',
      icon: Briefcase,
      colorClass: 'text-info bg-info/10 border-info/20',
    });

    list.push({
      id: 'life-1',
      date: new Date(now.getTime() - 8 * 30 * 24 * 60 * 60 * 1000), // 8 months ago
      type: 'life',
      title: 'Lulus Kuliah',
      description: 'Lulus S1 Teknik Informatika.',
      icon: GraduationCap,
      colorClass: 'text-success bg-success/10 border-success/20',
    });
    
    list.push({
      id: 'career-2',
      date: new Date(now.getTime() - 2 * 30 * 24 * 60 * 60 * 1000), // 2 months ago
      type: 'career',
      title: 'Kenaikan Gaji (Bonus)',
      description: 'Mendapat bonus tahunan dan promosi.',
      icon: CurrencyCircleDollar,
      colorClass: 'text-warning bg-warning/10 border-warning/20',
    });

    // Sort descending (newest first)
    return list.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [investments, locale, currency]);

  if (isInvLoading) {
    return <div className="py-12"><Loading text="Memuat perjalanan hidup Anda..." /></div>;
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="relative border-l-2 border-white/10 ml-6 space-y-12 pb-12">
        {events.map((event, index) => {
          const Icon = event.icon;
          return (
            <div key={event.id} className="relative pl-10 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
              {/* Timeline dot/icon */}
              <div className={`absolute -left-[17px] top-0 w-8 h-8 rounded-full border flex items-center justify-center ${event.colorClass}`}>
                <Icon size={16} weight="bold" />
              </div>

              {/* Content Card */}
              <Card className="p-lg hover:border-white/20 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-white">{event.title}</h3>
                  <span className="text-xs text-gray-light">
                    {event.date.toLocaleDateString(locale, { month: 'long', year: 'numeric' })}
                  </span>
                </div>
                <p className="text-sm text-soft-cream">{event.description}</p>
                
                {event.metadata?.rationale && (
                  <div className="mt-3">
                    <Badge variant="default" size="sm">
                      Alasan: {event.metadata.rationale.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                )}
              </Card>
              
              {/* Connector line indicator (optional, just CSS effect) */}
              {index < events.length - 1 && (
                <div className="absolute left-[-9px] top-12 bottom-[-48px] w-0.5 bg-gradient-to-b from-white/10 to-transparent" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

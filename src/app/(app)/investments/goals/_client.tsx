'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Layout, Card, Button, Loading } from '@/components';
import { useAuthStore } from '@/store/authStore';
import { useGoal } from '@/hooks/useGoal';
import { formatCurrency, formatNumber } from '@/libs/format';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { Target, Plus, CheckCircle, Clock } from '@phosphor-icons/react';
import { Heading, Paragraph } from '@/components/ui/typography';

export function InvestmentGoalsClient() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const authLoading = useAuthStore((s) => s.isLoading);
  const { currency, locale } = useUserPreferences();
  const { t } = useTranslation();
  
  const { goals, isLoading } = useGoal();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loading text={t('dashboard.checking_session')} />
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        {/* Header Section */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-2 max-w-2xl">
            <Heading as="h1" size="h2" weight="semibold" className="tracking-tight text-soft-cream">Goal-based Investment</Heading>
            <Paragraph className="text-subtext flex items-center gap-2">
              Berhenti berinvestasi tanpa arah. Setiap rupiah yang Anda alokasikan memiliki tujuan hidupnya sendiri.
            </Paragraph>
          </div>
          <div className="hidden md:flex gap-4">
            <Button variant="primary" size="md">
              <Plus size={16} className="mr-2" />
              Buat Goal Baru
            </Button>
          </div>
        </div>

        {/* Goals List */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="p-8 animate-pulse h-48 bg-white/5" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
            {goals.map((goal) => {
              const progressPct = Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100));
              
              return (
                <Card 
                  key={goal.id} 
                  className="p-8 relative overflow-hidden group hover:border-white/20 transition-all duration-300"
                >
                  {/* Glassmorphic Background Blur specific to goal color */}
                  <div 
                    className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-20 blur-3xl transition-opacity group-hover:opacity-40"
                    style={{ backgroundColor: goal.color || '#4F46E5' }}
                  />
                  
                  <div className="relative z-10 flex flex-col h-full justify-between gap-6">
                    {/* Goal Header */}
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-1 mb-1">
                          <Target size={16} weight="duotone" style={{ color: goal.color || '#4F46E5' }} />
                          <Paragraph className="text-[10px] tracking-widest uppercase font-semibold text-gray-light">
                            {goal.status === 'completed' ? 'Tercapai' : 'Progres'}
                          </Paragraph>
                        </div>
                        <Heading as="h3" size="h3" className="text-xl font-bold text-white mb-1">{goal.title}</Heading>
                        {goal.target_date && (
                          <div className="flex items-center gap-1 text-xs text-gray-light">
                            <Clock size={12} />
                            <span>Target: {new Date(goal.target_date).toLocaleDateString(locale, { month: 'short', year: 'numeric' })}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="text-right">
                        <Paragraph className="text-2xl font-bold text-white">
                          {progressPct}%
                        </Paragraph>
                      </div>
                    </div>

                    {/* Progress Bar & Amount */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-light font-medium">
                          {formatCurrency(goal.current_amount, goal.currency, locale)}
                        </span>
                        <span className="text-white/50">
                          {formatCurrency(goal.target_amount, goal.currency, locale)}
                        </span>
                      </div>
                      
                      {/* Dynamic Custom Progress Bar */}
                      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-1000 ease-out"
                          style={{ 
                            width: `${progressPct}%`,
                            backgroundColor: goal.color || '#4F46E5',
                            boxShadow: `0 0 10px ${goal.color || '#4F46E5'}80`
                          }}
                        />
                      </div>
                    </div>
                    
                    {/* Insights/Action area */}
                    <div className="pt-2 mt-auto border-t border-white/5 flex justify-between items-center">
                      <Paragraph className="text-xs text-gray-light">
                        {progressPct >= 100 
                          ? 'Selamat! Tujuan Anda tercapai.' 
                          : `Sisa ${formatCurrency(goal.target_amount - goal.current_amount, goal.currency, locale)}`
                        }
                      </Paragraph>
                      <Button variant="ghost" size="sm" className="text-xs">
                        Alokasikan
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}

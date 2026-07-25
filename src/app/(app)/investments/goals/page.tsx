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

export default function InvestmentGoalsPage() {
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
      <div className="space-y-xl animate-fade-in">
        {/* Header Section */}
        <div className="flex items-start justify-between gap-md flex-wrap">
          <div className="space-y-sm max-w-2xl">
            <h1 className="text-display font-serif text-gradient">Goal-based Investment</h1>
            <p className="text-subtext flex items-center gap-sm">
              Berhenti berinvestasi tanpa arah. Setiap rupiah yang Anda alokasikan memiliki tujuan hidupnya sendiri.
            </p>
          </div>
          <div className="hidden md:flex gap-md">
            <Button variant="primary" size="md">
              <Plus size={16} className="mr-2" />
              Buat Goal Baru
            </Button>
          </div>
        </div>

        {/* Goals List */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md md:gap-lg">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="p-xl animate-pulse h-48 bg-white/5" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-md md:gap-lg">
            {goals.map((goal) => {
              const progressPct = Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100));
              
              return (
                <Card 
                  key={goal.id} 
                  className="p-xl relative overflow-hidden group hover:border-white/20 transition-all duration-300"
                >
                  {/* Glassmorphic Background Blur specific to goal color */}
                  <div 
                    className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-20 blur-3xl transition-opacity group-hover:opacity-40"
                    style={{ backgroundColor: goal.color || '#4F46E5' }}
                  />
                  
                  <div className="relative z-10 flex flex-col h-full justify-between gap-lg">
                    {/* Goal Header */}
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-xs mb-1">
                          <Target size={16} weight="duotone" style={{ color: goal.color || '#4F46E5' }} />
                          <p className="text-[10px] tracking-widest uppercase font-semibold text-gray-light">
                            {goal.status === 'completed' ? 'Tercapai' : 'Progres'}
                          </p>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-xs">{goal.title}</h3>
                        {goal.target_date && (
                          <div className="flex items-center gap-1 text-xs text-gray-light">
                            <Clock size={12} />
                            <span>Target: {new Date(goal.target_date).toLocaleDateString(locale, { month: 'short', year: 'numeric' })}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="text-right">
                        <p className="text-2xl font-bold text-white">
                          {progressPct}%
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar & Amount */}
                    <div className="space-y-sm">
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
                    <div className="pt-sm mt-auto border-t border-white/5 flex justify-between items-center">
                      <p className="text-xs text-gray-light">
                        {progressPct >= 100 
                          ? 'Selamat! Tujuan Anda tercapai.' 
                          : `Sisa ${formatCurrency(goal.target_amount - goal.current_amount, goal.currency, locale)}`
                        }
                      </p>
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

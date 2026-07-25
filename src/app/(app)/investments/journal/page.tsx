'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Layout, Card, Button, Loading, Badge } from '@/components';
import { useAuthStore } from '@/store/authStore';
import { useInvestmentJournal } from '@/hooks/useInvestmentJournal';
import { formatCurrency, formatNumber } from '@/libs/format';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { Notebook, Question, Lightbulb, ChatText, ChartLineUp } from '@phosphor-icons/react';

export default function InvestmentJournalPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const authLoading = useAuthStore((s) => s.isLoading);
  const { currency, locale } = useUserPreferences();
  const { t } = useTranslation();
  
  const { journals, isLoading } = useInvestmentJournal();
  const [filter, setFilter] = useState<'all' | 'needs_review' | 'reviewed'>('needs_review');

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

  const now = new Date();
  
  const filteredJournals = journals.filter(j => {
    if (filter === 'all') return true;
    
    const isDue = new Date(j.review_date!) <= now;
    if (filter === 'needs_review') return isDue && !j.is_reviewed;
    if (filter === 'reviewed') return j.is_reviewed;
    
    return true;
  });

  return (
    <Layout>
      <div className="space-y-xl animate-fade-in">
        {/* Header Section */}
        <div className="flex items-start justify-between gap-md flex-wrap">
          <div className="space-y-sm max-w-2xl">
            <h1 className="text-display font-serif text-gradient flex items-center gap-2">
              <Notebook weight="duotone" className="text-primary" />
              Investment Journal
            </h1>
            <p className="text-subtext">
              Belajar dari keputusan masa lalu. Tinjau kembali tesis investasi Anda setelah 6 bulan.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 border-b border-white/10 pb-4">
          <Button 
            variant={filter === 'needs_review' ? 'primary' : 'ghost'} 
            size="sm" 
            onClick={() => setFilter('needs_review')}
            className={filter !== 'needs_review' ? 'text-gray-light hover:text-white' : ''}
          >
            Perlu Direview
          </Button>
          <Button 
            variant={filter === 'reviewed' ? 'primary' : 'ghost'} 
            size="sm" 
            onClick={() => setFilter('reviewed')}
            className={filter !== 'reviewed' ? 'text-gray-light hover:text-white' : ''}
          >
            Sudah Direview
          </Button>
          <Button 
            variant={filter === 'all' ? 'primary' : 'ghost'} 
            size="sm" 
            onClick={() => setFilter('all')}
            className={filter !== 'all' ? 'text-gray-light hover:text-white' : ''}
          >
            Semua Catatan
          </Button>
        </div>

        {/* Journals List */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md md:gap-lg">
            {[...Array(2)].map((_, i) => (
              <Card key={i} className="p-xl animate-pulse h-64 bg-white/5" />
            ))}
          </div>
        ) : filteredJournals.length === 0 ? (
          <div className="py-24 text-center">
            <Notebook size={48} className="mx-auto text-white/20 mb-4" />
            <h3 className="text-lg font-bold text-white">Tidak ada jurnal</h3>
            <p className="text-gray-light mt-2 max-w-sm mx-auto">
              {filter === 'needs_review' 
                ? 'Belum ada investasi yang berusia > 6 bulan untuk direview saat ini.' 
                : 'Tidak ada catatan investasi.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-md md:gap-lg">
            {filteredJournals.map((journal) => {
              const isDue = new Date(journal.review_date!) <= now;
              const isReviewed = journal.is_reviewed;
              
              return (
                  <Card 
                    key={journal.id} 
                    className={`p-xl relative overflow-hidden transition-all duration-300 ${
                      !isReviewed && isDue ? 'border-primary/50 bg-primary/5' : 'border-white/5'
                    }`}
                  >
                  <div className="space-y-lg">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-bold text-white text-lg">{journal.asset_symbol}</span>
                          <Badge variant="info" size="sm">{journal.type.toUpperCase()}</Badge>
                          <Badge variant="default" size="sm">{journal.rationale_type?.replace('_', ' ').toUpperCase()}</Badge>
                        </div>
                        <p className="text-xs text-gray-light">
                          {new Date(journal.transaction_date).toLocaleDateString(locale, { 
                            day: 'numeric', month: 'long', year: 'numeric' 
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-white">
                          {formatCurrency(journal.total_value, journal.currency, locale)}
                        </p>
                        <p className="text-xs text-gray-light mt-1">
                          {formatNumber(journal.amount, 4)} unit
                        </p>
                      </div>
                    </div>

                    {/* Original Note */}
                    <div className="bg-black/20 rounded-lg p-md border border-white/5">
                      <div className="flex gap-2 items-start text-sm">
                        <ChatText size={16} className="text-primary shrink-0 mt-1" />
                        <div>
                          <p className="text-gray-light font-semibold mb-1 text-xs">Catatan Pembelian:</p>
                          <p className="text-soft-cream leading-relaxed">{journal.notes || '-'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Reflection Area */}
                    <div className="pt-2">
                      {!isReviewed && isDue ? (
                        <div className="space-y-4">
                          <div className="flex items-start gap-2 text-warning bg-warning/10 p-sm rounded-md">
                            <Question size={18} className="shrink-0 mt-0.5" />
                            <p className="text-sm">Sudah 6 bulan berlalu. Apakah tesis investasi Anda masih valid? Bagaimana performa aset ini dibanding ekspektasi?</p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="primary" size="sm" className="w-full">
                              Mulai Review
                            </Button>
                          </div>
                        </div>
                      ) : isReviewed ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-success">
                            <Lightbulb size={16} weight="fill" />
                            <p className="text-xs font-bold uppercase tracking-wide">Pelajaran Dipetik</p>
                          </div>
                          <p className="text-sm text-soft-cream italic border-l-2 border-success/30 pl-3">
                            "{journal.review_notes}"
                          </p>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-gray-light text-xs">
                          <ChartLineUp size={16} />
                          <p>Review terbuka pada {new Date(journal.review_date!).toLocaleDateString(locale, { month: 'long', year: 'numeric' })}</p>
                        </div>
                      )}
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

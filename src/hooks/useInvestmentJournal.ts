'use client';

import { useState, useEffect } from 'react';
import { InvestmentTransaction } from '@/types/database';

// Mock hook for MVP UI
export const useInvestmentJournal = () => {
  const [journals, setJournals] = useState<(InvestmentTransaction & { asset_symbol: string, asset_name: string })[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate network delay
    const timer = setTimeout(() => {
      
      const now = new Date();
      const sixMonthsAgo = new Date(now);
      sixMonthsAgo.setMonth(now.getMonth() - 6);
      
      const eightMonthsAgo = new Date(now);
      eightMonthsAgo.setMonth(now.getMonth() - 8);

      setJournals([
        {
          id: 'txn-1',
          user_id: 'user-1',
          position_id: 'pos-1',
          asset_symbol: 'BBCA',
          asset_name: 'Bank Central Asia',
          type: 'buy',
          amount: 100,
          price_per_unit: 9000,
          total_value: 900000,
          currency: 'IDR',
          transaction_date: eightMonthsAgo.toISOString(),
          rationale_type: 'long_term',
          notes: 'Beli BBCA karena laporan Q2 bagus dan prospek kredit naik.',
          review_date: new Date(eightMonthsAgo.getTime() + 180 * 24 * 60 * 60 * 1000).toISOString(),
          is_reviewed: false,
          created_at: eightMonthsAgo.toISOString(),
          updated_at: eightMonthsAgo.toISOString(),
        },
        {
          id: 'txn-2',
          user_id: 'user-1',
          position_id: 'pos-2',
          asset_symbol: 'GOTO',
          asset_name: 'GoTo Gojek Tokopedia',
          type: 'buy',
          amount: 10000,
          price_per_unit: 50,
          total_value: 500000,
          currency: 'IDR',
          transaction_date: sixMonthsAgo.toISOString(),
          rationale_type: 'fomo',
          notes: 'Ikut-ikutan teman karena katanya bakal mantul dari gocap.',
          review_date: new Date(sixMonthsAgo.getTime() + 180 * 24 * 60 * 60 * 1000).toISOString(),
          is_reviewed: true,
          review_notes: 'Ternyata belum mantul. Seharusnya lebih riset dulu.',
          created_at: sixMonthsAgo.toISOString(),
          updated_at: sixMonthsAgo.toISOString(),
        },
        {
          id: 'txn-3',
          user_id: 'user-1',
          position_id: 'pos-3',
          asset_symbol: 'BTC',
          asset_name: 'Bitcoin',
          type: 'buy',
          amount: 0.05,
          price_per_unit: 60000,
          total_value: 3000,
          currency: 'USD',
          transaction_date: new Date().toISOString(),
          rationale_type: 'dca',
          notes: 'Rutin DCA bulanan.',
          review_date: new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000).toISOString(),
          is_reviewed: false,
          created_at: now.toISOString(),
          updated_at: now.toISOString(),
        }
      ]);
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return {
    journals,
    isLoading,
    error: null,
  };
};

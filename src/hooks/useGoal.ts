'use client';

import { useState, useEffect } from 'react';

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  target_amount: number;
  current_amount: number; // For MVP, we calculate this from allocations/transactions
  target_date?: string;
  currency: string;
  status: 'active' | 'completed' | 'cancelled';
  icon?: string;
  color?: string;
  created_at: string;
  updated_at: string;
}

// Mock hook for MVP UI
export const useGoal = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate network delay
    const timer = setTimeout(() => {
      setGoals([
        {
          id: 'goal-1',
          user_id: 'user-1',
          title: 'Laptop Baru',
          target_amount: 15000000,
          current_amount: 8300000,
          currency: 'IDR',
          status: 'active',
          icon: 'Laptop',
          color: '#4F46E5', // Indigo
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'goal-2',
          user_id: 'user-1',
          title: 'Dana Nikah',
          target_amount: 80000000,
          current_amount: 50400000, // 63%
          currency: 'IDR',
          status: 'active',
          icon: 'Heart',
          color: '#EC4899', // Pink
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          target_date: '2027-12-31',
        },
        {
          id: 'goal-3',
          user_id: 'user-1',
          title: 'Emergency Fund',
          target_amount: 50000000,
          current_amount: 35000000, // 70%
          currency: 'IDR',
          status: 'active',
          icon: 'Shield',
          color: '#10B981', // Emerald
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ]);
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return {
    goals,
    isLoading,
    error: null,
  };
};

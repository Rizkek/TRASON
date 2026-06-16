'use client';

/**
 * useCareerAnalytics — Rule-based career insight hook
 * Built on top of the existing useCareer hook.
 */

import { useMemo } from 'react';
import { useCareer } from '@/hooks/useCareer';
import { calculateCareerAnalytics, CareerAnalytics } from '@/libs/analytics/careerAnalytics';

export function useCareerAnalytics(): {
  analytics: CareerAnalytics | null;
  isLoading: boolean;
} {
  const { applications, isLoading } = useCareer();

  const analytics = useMemo(() => {
    if (isLoading) return null;
    return calculateCareerAnalytics(applications);
  }, [applications, isLoading]);

  return { analytics, isLoading };
}

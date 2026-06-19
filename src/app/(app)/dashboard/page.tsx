import React from 'react';
import { getAuthenticatedUser } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { DashboardClient } from './DashboardClient';
import { DashboardProvider } from './DashboardProvider';

export default async function DashboardPage() {
  // 1. Fetch user session natively on the server (No Client Waterfall)
  const user = await getAuthenticatedUser();
  
  if (!user) {
    redirect('/login');
  }

  // 2. We could pre-fetch transactions here and populate fallback data
  // For now, we wrap it in the Provider to enable future SWR prefetching
  const fallback = {};

  return (
    <DashboardProvider fallback={fallback}>
      <DashboardClient />
    </DashboardProvider>
  );
}

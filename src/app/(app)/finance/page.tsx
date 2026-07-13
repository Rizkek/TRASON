import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import FinanceClient from './FinanceClient';

import { getDateRange } from '@/libs/date';

export const dynamic = 'force-dynamic';

export default async function FinancePage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Initial Data Fetching (current month)
  const now = new Date();
  const { start, end } = getDateRange(now.getMonth(), now.getFullYear());
  
  let initialTransactions = [];

  if (user) {
    const { data } = await supabase
      .from('transactions')
      .select(`
        *,
        categories (
          id,
          name,
          color,
          icon
        )
      `)
      .eq('user_id', user.id)
      .gte('date', start.toISOString())
      .lte('date', end.toISOString())
      .order('date', { ascending: false });

    if (data) {
      initialTransactions = data;
    }
  }

  return <FinanceClient initialTransactions={initialTransactions as any} />;
}

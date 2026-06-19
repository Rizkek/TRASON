import { getCurrentUser } from '@/services/supabase/supabaseClient';

export async function withAuthQuery<T>(queryFn: (userId: string) => Promise<T>): Promise<T> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');
  return queryFn(user.id);
}

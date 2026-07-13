import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import CareerClient from './CareerClient';


export const dynamic = 'force-dynamic';

export default async function CareerPage() {
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

  let initialApplications = [];

  if (user) {
    const { data } = await supabase
      .from('career_applications')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (data) {
      initialApplications = data;
    }
  }

  return <CareerClient initialApplications={initialApplications as any} />;
}

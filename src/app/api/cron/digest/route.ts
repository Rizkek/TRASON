import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { generateDigestEmailHTML } from '@/libs/email/templates';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const now = new Date();
  console.log(`[CRON-DIGEST] [${now.toISOString()}] Route invoked.`);

  // Validate Secret
  const authHeader = request.headers.get('Authorization');
  const expectedSecret = process.env.CRON_SECRET;
  
  if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
    console.warn('[CRON-DIGEST] Unauthorized access attempt.');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error(`[CRON-DIGEST] Supabase credentials missing!`);
    return NextResponse.json({ error: 'Supabase credentials missing' }, { status: 500 });
  }

  if (!resendApiKey) {
    console.error(`[CRON-DIGEST] Resend API Key missing!`);
    return NextResponse.json({ error: 'Resend credentials missing' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const resend = new Resend(resendApiKey);

  // Fetch users with email digest enabled
  console.log('[CRON-DIGEST] Fetching users with email_digest_enabled...');
  const { data: prefs, error: prefsError } = await supabase
    .from('user_preferences')
    .select('user_id, digest_frequency, currency')
    .eq('email_digest_enabled', true);

  if (prefsError) {
    console.error('[CRON-DIGEST] Failed to fetch preferences:', prefsError);
    return NextResponse.json({ error: prefsError.message }, { status: 500 });
  }

  if (!prefs || prefs.length === 0) {
    console.log('[CRON-DIGEST] No users with email digest enabled.');
    return NextResponse.json({ success: true, sent: 0 });
  }

  // Determine which frequencies should trigger today
  const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday...
  const dateOfMonth = now.getDate(); // 1-31

  const shouldRunDaily = true;
  // E.g. Run weekly on Mondays
  const shouldRunWeekly = dayOfWeek === 1;
  // E.g. Run monthly on the 1st
  const shouldRunMonthly = dateOfMonth === 1;

  let sentCount = 0;

  for (const pref of prefs) {
    const freq = pref.digest_frequency || 'weekly';

    if (freq === 'daily' && !shouldRunDaily) continue;
    if (freq === 'weekly' && !shouldRunWeekly) continue;
    if (freq === 'monthly' && !shouldRunMonthly) continue;

    console.log(`[CRON-DIGEST] Processing digest for user ${pref.user_id} (${freq})`);

    // Fetch user details
    const { data: userRecord, error: userError } = await supabase
      .from('users')
      .select('email, first_name')
      .eq('id', pref.user_id)
      .single();

    if (userError || !userRecord || !userRecord.email) {
      console.warn(`[CRON-DIGEST] Could not fetch user data for ${pref.user_id}`);
      continue;
    }

    const email = userRecord.email;
    const firstName = userRecord.first_name || 'User';

    // Calculate time bounds for data fetching
    const endDate = new Date();
    const startDate = new Date();
    if (freq === 'daily') startDate.setDate(startDate.getDate() - 1);
    else if (freq === 'weekly') startDate.setDate(startDate.getDate() - 7);
    else if (freq === 'monthly') startDate.setMonth(startDate.getMonth() - 1);

    const startIso = startDate.toISOString();
    const endIso = endDate.toISOString();

    // 1. Fetch Finance Stats
    const { data: transactions } = await supabase
      .from('finance_transactions')
      .select('amount, type')
      .eq('user_id', pref.user_id)
      .gte('date', startIso.split('T')[0])
      .lte('date', endIso.split('T')[0]);

    let income = 0;
    let expense = 0;
    if (transactions) {
      transactions.forEach(t => {
        if (t.type === 'income') income += Number(t.amount);
        if (t.type === 'expense') expense += Number(t.amount);
      });
    }

    // 2. Fetch Tasks Stats (completed vs total scheduled in period - simplified)
    const { data: logs } = await supabase
      .from('daily_task_logs')
      .select('id')
      .eq('user_id', pref.user_id)
      .gte('completed_date', startIso.split('T')[0])
      .lte('completed_date', endIso.split('T')[0]);
      
    // Count total tasks user has active
    const { count: tasksCount } = await supabase
      .from('daily_tasks')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', pref.user_id);

    const periodDays = freq === 'daily' ? 1 : freq === 'weekly' ? 7 : 30;
    const tasksTotal = (tasksCount || 0) * periodDays;
    const tasksCompleted = logs ? logs.length : 0;

    // 3. Fetch Reminders Stats
    const { count: remindersCompleted } = await supabase
      .from('reminders')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', pref.user_id)
      .eq('status', 'completed')
      .gte('updated_at', startIso)
      .lte('updated_at', endIso);

    const htmlContent = generateDigestEmailHTML({
      userName: firstName,
      period: freq.charAt(0).toUpperCase() + freq.slice(1), // 'Weekly'
      dateStr: now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      stats: {
        tasksCompleted,
        tasksTotal,
        remindersCompleted: remindersCompleted || 0,
        financeIncome: income,
        financeExpense: expense,
        currency: pref.currency || 'USD'
      }
    });

    // Send Email via Resend
    try {
      const result = await resend.emails.send({
        from: 'TRASON <onboarding@resend.dev>', // Change to your custom domain later
        to: email,
        subject: `Your ${freq.charAt(0).toUpperCase() + freq.slice(1)} TRASON Digest`,
        html: htmlContent,
      });

      if (result.error) {
        console.error(`[CRON-DIGEST] Failed to send to ${email}:`, result.error);
      } else {
        console.log(`[CRON-DIGEST] Successfully sent to ${email}. ID: ${result.data?.id}`);
        sentCount++;
      }
    } catch (e) {
      console.error(`[CRON-DIGEST] Exception sending to ${email}:`, e);
    }
  }

  return NextResponse.json({ success: true, processed: prefs.length, sent: sentCount });
}

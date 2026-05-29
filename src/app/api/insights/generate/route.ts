import { NextResponse } from 'next/server';
import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

// Tambah maxDuration agar Vercel memberi waktu lebih untuk AI generation
// Free: max 10s, Pro: max 60s — set 25s sebagai kompromi
export const maxDuration = 25;

const insightsSchema = z.object({
  insights: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      type: z.enum(['finance', 'health', 'productivity', 'career', 'investment', 'general']),
      actionable_advice: z.string()
    })
  )
});

export async function POST(req: Request) {
  // AbortController dengan timeout 22 detik (sedikit di bawah maxDuration)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 22000);

  try {
    const { userContextText } = await req.json();

    if (!userContextText) {
      return NextResponse.json({ error: 'Context data is required' }, { status: 400 });
    }

    const { object } = await generateObject({
      model: openai('gpt-4o-mini'),
      schema: insightsSchema,
      prompt: `
        You are a highly analytical and empathetic lifestyle architect and coach AI for TRASON (Personal Life OS).
        Read the user context below, which aggregates their finances, life logs, daily task reminders, career pipeline status, investment portfolio performance, and sport activity/vitality summaries.
        
        Generate exactly 3 deep, cross-module insights / daily briefing highlights.
        Connect different modules together (e.g. correlation between high sport activity and low dining expenses, or how an upcoming high-priority career interview demands schedule time-blocking, or how their cash-flow runway matches their portfolio volatility).
        
        Be concise — each insight max 2 sentences for description and actionable advice.
        
        Data Context:
        ${userContextText}
      `,
      abortSignal: controller.signal,
    });

    clearTimeout(timeoutId);
    return NextResponse.json(object);
  } catch (error: any) {
    clearTimeout(timeoutId);

    // Timeout atau abort
    if (error?.name === 'AbortError' || controller.signal.aborted) {
      console.warn('[insights/generate] AI generation timed out after 22s');
      return NextResponse.json(
        { error: 'AI generation timed out. Please try again.' },
        { status: 504 }
      );
    }

    // API key tidak dikonfigurasi
    if (error?.message?.includes('API key') || error?.status === 401) {
      return NextResponse.json(
        { error: 'AI service not configured. Set OPENAI_API_KEY in environment.' },
        { status: 503 }
      );
    }

    console.error('[insights/generate] Error:', error?.message || error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}


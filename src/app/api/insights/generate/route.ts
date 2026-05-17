import { NextResponse } from 'next/server';
import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { aggregateUserDataForAI } from '@/modules/insights/aggregator';

const insightsSchema = z.object({
  insights: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      type: z.enum(['finance', 'health', 'productivity', 'general']),
      actionable_advice: z.string()
    })
  )
});

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // 1. Gather context
    const userContextText = await aggregateUserDataForAI(userId);

    // 2. Generate insights
    const { object } = await generateObject({
      model: openai('gpt-4o-mini'),
      schema: insightsSchema,
      prompt: `
        You are a highly analytical and empathetic life coach AI for TRASON.
        Read the following user data summary and generate exactly 3 insights.
        One should be financial, one productivity/health if applicable (or general), and one wildcard.
        
        Data:
        ${userContextText}
      `,
    });

    // 3. Save to database (optional, or just return to client)
    // Here we'll return to client, client can save or we can save directly.
    return NextResponse.json(object);
  } catch (error: any) {
    console.error('Error generating insights:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}

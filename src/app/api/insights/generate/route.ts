import { NextResponse } from 'next/server';
import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

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
    const { userContextText } = await req.json();

    if (!userContextText) {
      return NextResponse.json({ error: 'Context data is required' }, { status: 400 });
    }

    // 1. Gather context (Already passed from client)

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

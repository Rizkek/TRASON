import { NextResponse } from 'next/server';
import { parseNaturalLanguageInput } from '@/services/ai/parser';
import { getAuthenticatedUser } from '@/utils/supabase/server';

export async function POST(req: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
  }

  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Invalid prompt provided.' }, { status: 400 });
    }

    const parsedData = await parseNaturalLanguageInput(prompt);

    return NextResponse.json(parsedData);
  } catch (error: any) {
    console.error('Error in parse API route:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}

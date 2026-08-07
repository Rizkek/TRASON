import { NextRequest, NextResponse } from 'next/server';
import { CURATED_EXERCISES, SportExercise } from '@/data/sportExercisesData';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = (searchParams.get('q') || '').trim().toLowerCase();
    const category = (searchParams.get('category') || '').trim();

    const results: SportExercise[] = [];
    const seenNames = new Set<string>();

    // 1. Filter local curated list
    for (const ex of CURATED_EXERCISES) {
      const matchCategory = !category || ex.category.toLowerCase() === category.toLowerCase();
      const matchQuery =
        !query ||
        ex.name.toLowerCase().includes(query) ||
        ex.category.toLowerCase().includes(query) ||
        ex.equipment.toLowerCase().includes(query);

      if (matchCategory && matchQuery) {
        seenNames.add(ex.name.toLowerCase());
        results.push(ex);
      }
    }

    // 2. Query WGER Open Source Exercise Database if query is at least 3 chars
    if (query.length >= 3) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);

        const wgerUrl = `https://wger.de/api/v2/exercise/search/?term=${encodeURIComponent(query)}`;
        const res = await fetch(wgerUrl, {
          signal: controller.signal,
          headers: { 'Accept': 'application/json', 'User-Agent': 'TRASON-LifeOS/1.0' },
        });

        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.suggestions)) {
            for (const item of data.suggestions) {
              const name = item.value || item.data?.name;
              if (name && !seenNames.has(name.toLowerCase())) {
                seenNames.add(name.toLowerCase());
                results.push({
                  id: `wger-${item.data?.id || name}`,
                  name,
                  category: item.data?.category || 'Gym Exercise',
                  equipment: 'Various',
                });
              }
            }
          }
        }
      } catch {
        // Silently continue if WGER is down/offline
      }
    }

    return NextResponse.json(
      { count: results.length, exercises: results.slice(0, 25) },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error', exercises: [] },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { INDONESIA_COMPANIES, INDONESIA_ROLES } from '@/data/indonesiaCareerData';

export interface AutocompleteItem {
  id: string;
  title: string;
  subtitle?: string;
  badge?: string;
  badgeType?: 'local' | 'api';
  domain?: string;
  logo?: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = (searchParams.get('q') || '').trim().toLowerCase();
    const type = (searchParams.get('type') || 'company') as 'company' | 'role';

    const results: AutocompleteItem[] = [];
    const seenTitles = new Set<string>();

    if (type === 'role') {
      // Filter roles from taxonomy
      for (const role of INDONESIA_ROLES) {
        if (!query || role.title.toLowerCase().includes(query)) {
          if (!seenTitles.has(role.title.toLowerCase())) {
            seenTitles.add(role.title.toLowerCase());
            results.push({
              id: `role-${role.title}`,
              title: role.title,
              badge: role.category,
              badgeType: 'local',
            });
          }
        }
      }

      return NextResponse.json(
        { results: results.slice(0, 15) },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
          },
        }
      );
    }

    // --- Company Autocomplete ---
    // 1. Match from curated Indonesian database
    for (const comp of INDONESIA_COMPANIES) {
      if (
        !query ||
        comp.name.toLowerCase().includes(query) ||
        (comp.domain && comp.domain.toLowerCase().includes(query))
      ) {
        if (!seenTitles.has(comp.name.toLowerCase())) {
          seenTitles.add(comp.name.toLowerCase());
          results.push({
            id: `local-${comp.name}`,
            title: comp.name,
            subtitle: comp.domain,
            badge: comp.category,
            badgeType: 'local',
            domain: comp.domain,
          });
        }
      }
    }

    // 2. Query Clearbit API for global/other startups if query is at least 2 chars
    if (query.length >= 2) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500); // 2.5s timeout

        const clearbitUrl = `https://autocomplete.clearbit.com/v1/companies/suggest?query=${encodeURIComponent(
          query
        )}`;
        const res = await fetch(clearbitUrl, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'TRASON-App/1.0',
          },
        });

        clearTimeout(timeoutId);

        if (res.ok) {
          const data: Array<{ name: string; domain?: string; logo?: string }> = await res.json();
          if (Array.isArray(data)) {
            for (const item of data) {
              if (item.name && !seenTitles.has(item.name.toLowerCase())) {
                seenTitles.add(item.name.toLowerCase());
                results.push({
                  id: `api-${item.name}-${item.domain || ''}`,
                  title: item.name,
                  subtitle: item.domain,
                  badge: 'Global / API',
                  badgeType: 'api',
                  domain: item.domain,
                  logo: item.logo,
                });
              }
            }
          }
        }
      } catch (apiErr) {
        // Silently continue if Clearbit is unavailable or timed out
      }
    }

    return NextResponse.json(
      { results: results.slice(0, 15) },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error', results: [] },
      { status: 500 }
    );
  }
}

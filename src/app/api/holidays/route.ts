import { NextRequest, NextResponse } from 'next/server';

export interface HolidayItem {
  date: string; // YYYY-MM-DD
  name: string;
  is_cuti_bersama: boolean;
}

// Curated Offline Fallback for Indonesian Holidays (2025 - 2027)
const FALLBACK_HOLIDAYS: HolidayItem[] = [
  // 2025
  { date: '2025-01-01', name: 'Tahun Baru 2025 Masehi', is_cuti_bersama: false },
  { date: '2025-01-27', name: 'Isra Mikraj Nabi Muhammad SAW', is_cuti_bersama: false },
  { date: '2025-01-29', name: 'Tahun Baru Imlek 2576 Kongzili', is_cuti_bersama: false },
  { date: '2025-03-29', name: 'Hari Suci Nyepi (Tahun Baru Saka 1947)', is_cuti_bersama: false },
  { date: '2025-03-31', name: 'Idul Fitri 1446 H', is_cuti_bersama: false },
  { date: '2025-04-01', name: 'Idul Fitri 1446 H', is_cuti_bersama: false },
  { date: '2025-04-18', name: 'Wafat Yesus Kristus', is_cuti_bersama: false },
  { date: '2025-04-20', name: 'Kebangkitan Yesus Kristus (Paskah)', is_cuti_bersama: false },
  { date: '2025-05-01', name: 'Hari Buruh Internasional', is_cuti_bersama: false },
  { date: '2025-05-12', name: 'Hari Raya Waisak 2569 BE', is_cuti_bersama: false },
  { date: '2025-05-29', name: 'Kenaikan Yesus Kristus', is_cuti_bersama: false },
  { date: '2025-06-01', name: 'Hari Lahir Pancasila', is_cuti_bersama: false },
  { date: '2025-06-06', name: 'Idul Adha 1446 H', is_cuti_bersama: false },
  { date: '2025-06-27', name: '1 Muharam 1447 H (Tahun Baru Islam)', is_cuti_bersama: false },
  { date: '2025-08-17', name: 'Proklamasi Kemerdekaan RI', is_cuti_bersama: false },
  { date: '2025-09-05', name: 'Maulid Nabi Muhammad SAW', is_cuti_bersama: false },
  { date: '2025-12-25', name: 'Hari Raya Natal', is_cuti_bersama: false },

  // 2026
  { date: '2026-01-01', name: 'Tahun Baru 2026 Masehi', is_cuti_bersama: false },
  { date: '2026-01-16', name: 'Isra Mikraj Nabi Muhammad SAW', is_cuti_bersama: false },
  { date: '2026-02-17', name: 'Tahun Baru Imlek 2577 Kongzili', is_cuti_bersama: false },
  { date: '2026-03-19', name: 'Hari Suci Nyepi', is_cuti_bersama: false },
  { date: '2026-03-20', name: 'Idul Fitri 1447 H (Hari 1)', is_cuti_bersama: false },
  { date: '2026-03-21', name: 'Idul Fitri 1447 H (Hari 2)', is_cuti_bersama: false },
  { date: '2026-03-23', name: 'Cuti Bersama Idul Fitri', is_cuti_bersama: true },
  { date: '2026-03-24', name: 'Cuti Bersama Idul Fitri', is_cuti_bersama: true },
  { date: '2026-04-03', name: 'Wafat Yesus Kristus (Jumat Agung)', is_cuti_bersama: false },
  { date: '2026-05-01', name: 'Hari Buruh Internasional', is_cuti_bersama: false },
  { date: '2026-05-14', name: 'Kenaikan Yesus Kristus', is_cuti_bersama: false },
  { date: '2026-05-27', name: 'Idul Adha 1447 H', is_cuti_bersama: false },
  { date: '2026-05-31', name: 'Hari Raya Waisak 2570 BE', is_cuti_bersama: false },
  { date: '2026-06-01', name: 'Hari Lahir Pancasila', is_cuti_bersama: false },
  { date: '2026-06-16', name: 'Tahun Baru Islam 1448 H', is_cuti_bersama: false },
  { date: '2026-08-17', name: 'Hari Kemerdekaan RI ke-81', is_cuti_bersama: false },
  { date: '2026-08-25', name: 'Maulid Nabi Muhammad SAW', is_cuti_bersama: false },
  { date: '2026-12-25', name: 'Hari Raya Natal', is_cuti_bersama: false },
  { date: '2026-12-26', name: 'Cuti Bersama Natal', is_cuti_bersama: true },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const targetYear = searchParams.get('year') || new Date().getFullYear().toString();

    let holidays: HolidayItem[] = [];

    // 1. Try public Open API (DayOff / HariLibur API)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch(`https://dayoffapi.vercel.app/api?year=${targetYear}`, {
        signal: controller.signal,
        headers: { 'User-Agent': 'TRASON-App/1.0' },
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const rawData = await response.json();
        if (Array.isArray(rawData)) {
          holidays = rawData.map((item: any) => ({
            date: item.tanggal || item.date || item.holiday_date,
            name: item.keterangan || item.holiday_name || item.name,
            is_cuti_bersama: Boolean(item.is_cuti || item.is_cuti_bersama || (item.keterangan || '').toLowerCase().includes('cuti')),
          })).filter((h) => Boolean(h.date && h.name));
        }
      }
    } catch (fetchErr) {
      console.warn('[API /api/holidays] External fetch failed, falling back to local dataset:', fetchErr);
    }

    // 2. If API failed or returned empty, use curated offline fallback
    if (holidays.length === 0) {
      holidays = FALLBACK_HOLIDAYS.filter((h) => h.date.startsWith(targetYear));
    }

    console.log(`[API /api/holidays] Returning ${holidays.length} holidays for year: ${targetYear}`);

    return NextResponse.json(
      { year: targetYear, count: holidays.length, holidays },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
        },
      }
    );
  } catch (error) {
    console.error('[API /api/holidays] Internal error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error', holidays: [] },
      { status: 500 }
    );
  }
}

import useSWR from 'swr';
import { useCallback, useEffect } from 'react';

export interface HolidayItem {
  date: string; // YYYY-MM-DD
  name: string;
  is_cuti_bersama: boolean;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch holidays: ${res.statusText}`);
  }
  return res.json();
};

export function useHolidays(year?: number) {
  const targetYear = year ?? new Date().getFullYear();

  const { data, error, isLoading } = useSWR<{ year: string; count: number; holidays: HolidayItem[] }>(
    `/api/holidays?year=${targetYear}`,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 1000 * 60 * 60, // 1 hour
      keepPreviousData: true,
    }
  );

  const holidays: HolidayItem[] = data?.holidays ?? [];

  useEffect(() => {
    if (holidays.length > 0) {
      console.log(`[useHolidays] Loaded ${holidays.length} holidays for year ${targetYear}`);
    }
    if (error) {
      console.error(`[useHolidays] Failed loading holidays for year ${targetYear}:`, error);
    }
  }, [holidays.length, targetYear, error]);

  const getHolidayForDate = useCallback(
    (date: Date): HolidayItem | undefined => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${d}`;
      return holidays.find((h) => h.date === dateStr);
    },
    [holidays]
  );

  return { holidays, getHolidayForDate, isLoading, error };
}

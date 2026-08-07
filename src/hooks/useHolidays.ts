import useSWR from 'swr';
import { useCallback } from 'react';

export interface HolidayItem {
  date: string; // YYYY-MM-DD
  name: string;
  is_cuti_bersama: boolean;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useHolidays(year?: number) {
  const targetYear = year ?? new Date().getFullYear();

  const { data } = useSWR<{ holidays: HolidayItem[] }>(
    `/api/timeline/holidays?year=${targetYear}`,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 1000 * 60 * 60, // 1 hour
    }
  );

  const holidays: HolidayItem[] = data?.holidays ?? [];

  const getHolidayForDate = useCallback(
    (date: Date): HolidayItem | undefined => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return holidays.find((h) => h.date === `${y}-${m}-${d}`);
    },
    [holidays]
  );

  return { holidays, getHolidayForDate };
}

'use client';

import React, { useState } from 'react';
import { CaretLeft as ChevronLeft, CaretRight as ChevronRight, CalendarCheck } from '@phosphor-icons/react';
import { useHolidays, HolidayItem } from '@/hooks/useHolidays';

interface CalendarProps {
  onDateSelect?: (date: Date) => void;
  selectedDate?: Date;
  events?: any[];
  locale?: string;
  holidays?: HolidayItem[];
}

export const Calendar: React.FC<CalendarProps> = ({
  onDateSelect,
  selectedDate = new Date(),
  events = [],
  locale = 'en-US',
  holidays: propHolidays,
}) => {
  const [viewDate, setViewDate] = useState(new Date(selectedDate));

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  // If holidays are not passed as props, fetch them for the viewed year
  const { holidays: fetchedHolidays, getHolidayForDate } = useHolidays(year);
  const holidays = propHolidays ?? fetchedHolidays;

  const daysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const firstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();

  const monthName = viewDate.toLocaleString(locale, { month: 'long' });

  const handlePrevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const days = [];
  const totalDays = daysInMonth(year, month);
  const startOffset = firstDayOfMonth(year, month);

  // Padding for start of month
  for (let i = 0; i < startOffset; i++) {
    days.push(<div key={`pad-${i}`} className="h-16 md:h-32 border border-black/[0.03] dark:border-white/[0.03] bg-transparent opacity-20" />);
  }

  for (let d = 1; d <= totalDays; d++) {
    const date = new Date(year, month, d);
    const isSelected = date.toDateString() === selectedDate.toDateString();
    const isToday = date.toDateString() === new Date().toDateString();
    const isSunday = date.getDay() === 0;

    // Check for holiday
    const cellDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const holiday = holidays.find((h) => h.date === cellDateStr);

    // Check for events on this date
    const dateEvents = events.filter(e => {
       const eventDateStr = e.due_date || (e.due_datetime ? e.due_datetime.split('T')[0] : '');
       return eventDateStr === cellDateStr;
    });

    const isHolidayRed = Boolean(holiday && !holiday.is_cuti_bersama);
    const isCutiAmber = Boolean(holiday && holiday.is_cuti_bersama);

    days.push(
      <div 
        key={d}
        onClick={() => onDateSelect?.(date)}
        title={holiday ? `${holiday.name} (${holiday.is_cuti_bersama ? 'Cuti Bersama' : 'Libur Nasional'})` : undefined}
        className={`h-16 md:h-32 border border-black/[0.03] dark:border-white/[0.03] p-1.5 md:p-2 transition-all cursor-pointer group hover:bg-black/[0.02] dark:bg-white/[0.02] relative ${
          isSelected 
            ? 'bg-warm-gold/10 border-warm-gold/40 shadow-inner' 
            : isHolidayRed 
            ? 'bg-rose-500/[0.07] hover:bg-rose-500/[0.12]' 
            : isCutiAmber 
            ? 'bg-amber-500/[0.07] hover:bg-amber-500/[0.12]' 
            : ''
        }`}
      >
        <div className="flex justify-between items-start">
          <span className={`text-xs font-sans transition-colors ${
            isToday 
              ? 'bg-warm-gold text-warm-black w-6 h-6 flex items-center justify-center rounded-full font-bold shadow-[0_0_10px_rgba(244,201,93,0.4)]' 
              : isSelected 
              ? 'text-warm-gold font-bold' 
              : isHolidayRed || isSunday 
              ? 'text-rose-400 font-extrabold' 
              : isCutiAmber 
              ? 'text-amber-300 font-bold' 
              : 'text-gray-light'
          }`}>
            {d}
          </span>
          <div className="flex items-center gap-1">
            {dateEvents.some(e => e.status !== 'completed') && (
              <div className="w-1.5 h-1.5 bg-warm-gold rounded-full shadow-[0_0_8px_rgba(212,165,116,0.6)]" />
            )}
          </div>
        </div>

        {/* Holiday Banner in Cell (Desktop) */}
        {holiday && (
          <div className="mt-1 hidden md:block">
            <div className={`text-[9px] px-1.5 py-0.5 rounded border truncate font-medium ${
              holiday.is_cuti_bersama
                ? 'bg-amber-500/15 text-amber-200 border-amber-500/30'
                : 'bg-rose-500/15 text-rose-200 border-rose-500/30'
            }`}>
              {holiday.name}
            </div>
          </div>
        )}
        
        {/* Events list */}
        <div className="mt-1 space-y-1 overflow-hidden hidden md:block">
          {dateEvents.slice(0, 2).map((e, i) => (
            <div key={i} className={`text-[10px] truncate px-1.5 py-0.5 rounded border font-light ${
              e.status === 'completed'
                ? 'bg-black/5 dark:bg-white/5 text-gray-light border-black/10 dark:border-white/10 line-through opacity-60'
                : 'bg-deep-sage/10 text-soft-cream border-deep-sage/20'
            }`}>
              {e.title}
            </div>
          ))}
          {dateEvents.length > 2 && (
            <div className="text-[9px] text-gray-light italic pl-1">+{dateEvents.length - 2} more</div>
          )}
        </div>
      </div>
    );
  }

  // Month holidays summary
  const currentMonthHolidays = holidays.filter((h) => {
    const [y, m] = h.date.split('-').map(Number);
    return y === year && m === month + 1;
  });

  return (
    <div className="glass-card overflow-hidden border-black/[0.03] dark:border-white/[0.03]">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-lg border-b border-black/[0.03] dark:border-white/[0.03]">
        <h3 className="font-serif text-2xl flex items-center gap-2">
          <span className="text-warm-gold">{monthName}</span> <span className="text-soft-cream/40 font-light">{year}</span>
        </h3>
        <div className="flex gap-sm">
          <button onClick={handlePrevMonth} aria-label="Previous month" className="p-2 hover:bg-black/5 dark:bg-white/5 rounded-full transition-colors text-soft-cream">
            <ChevronLeft size={20} />
          </button>
          <button onClick={handleNextMonth} aria-label="Next month" className="p-2 hover:bg-black/5 dark:bg-white/5 rounded-full transition-colors text-soft-cream">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Days of week (Sunday is red / tanggal merah) */}
      <div className="grid grid-cols-7 border-b border-black/[0.03] dark:border-white/[0.03] bg-black/[0.01] dark:bg-white/[0.01]">
        {Array.from({ length: 7 }, (_, i) => {
          // 2024-01-07 was a Sunday (0)
          const d = new Date(2024, 0, 7 + i);
          return d.toLocaleDateString(locale, { weekday: 'short' });
        }).map((day, i) => (
          <div 
            key={day} 
            className={`py-2 text-center text-[10px] uppercase tracking-[0.2em] font-bold ${
              i === 0 ? 'text-rose-400 font-extrabold' : 'text-gray-light/60'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7">
        {days}
      </div>

      {/* Month Holiday Footer Summary */}
      {currentMonthHolidays.length > 0 && (
        <div className="p-md md:px-lg border-t border-black/[0.05] dark:border-white/[0.05] bg-gray-strong/30 flex items-start gap-md flex-wrap">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-light uppercase tracking-wider shrink-0 pt-0.5">
            <CalendarCheck size={14} className="text-primary" />
            <span>Hari Libur Bulan Ini:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {currentMonthHolidays.map((h) => {
              const d = parseInt(h.date.split('-')[2], 10);
              return (
                <div
                  key={h.date}
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium border ${
                    h.is_cuti_bersama
                      ? 'bg-amber-500/10 text-amber-200 border-amber-500/20'
                      : 'bg-rose-500/10 text-rose-200 border-rose-500/20'
                  }`}
                >
                  <span className="font-bold font-mono">{d}</span>
                  <span>{h.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

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
    days.push(<div key={`pad-${i}`} className="h-16 md:h-32 border border-foreground/[0.03] bg-transparent opacity-20" />);
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
        className={`h-16 md:h-32 border border-foreground/[0.03] p-1.5 md:p-2 transition-all cursor-pointer group hover:bg-foreground/[0.02] relative ${
          isSelected 
            ? 'bg-primary/10 border-primary/40 shadow-inner' 
            : isHolidayRed 
            ? 'bg-danger/[0.07] hover:bg-danger/[0.12]' 
            : isCutiAmber 
            ? 'bg-warning/[0.07] hover:bg-warning/[0.12]' 
            : ''
        }`}
      >
        <div className="flex justify-between items-start">
          <span className={`text-xs font-sans transition-colors ${
            isToday 
              ? 'bg-primary text-on-primary w-6 h-6 flex items-center justify-center rounded-full font-semibold' 
              : isSelected 
              ? 'text-primary font-semibold' 
              : isHolidayRed || isSunday 
              ? 'text-danger font-extrabold' 
              : isCutiAmber 
              ? 'text-warning font-semibold' 
              : 'text-muted-foreground'
          }`}>
            {d}
          </span>
          <div className="flex items-center gap-1">
            {dateEvents.some(e => e.status !== 'completed') && (
              <div className="w-1.5 h-1.5 bg-primary rounded-full" />
            )}
          </div>
        </div>

        {/* Holiday Banner in Cell (Desktop) */}
        {holiday && (
          <div className="mt-1 hidden md:block">
            <div className={`text-xs px-1.5 py-0.5 rounded border truncate font-medium ${
              holiday.is_cuti_bersama
                ? 'bg-warning/15 text-warning border-warning/30'
                : 'bg-danger/15 text-danger border-danger/30'
            }`}>
              {holiday.name}
            </div>
          </div>
        )}
        
        {/* Events list */}
        <div className="mt-1 space-y-1 overflow-hidden hidden md:block">
          {dateEvents.slice(0, 2).map((e, i) => (
            <div key={i} className={`text-xs truncate px-1.5 py-0.5 rounded border font-light ${
              e.status === 'completed'
                ? 'bg-foreground/5 text-muted-foreground border-foreground/10 line-through opacity-60'
                : 'bg-deep-sage/10 text-foreground border-deep-sage/20'
            }`}>
              {e.title}
            </div>
          ))}
          {dateEvents.length > 2 && (
            <div className="text-xs text-muted-foreground italic pl-1">+{dateEvents.length - 2} more</div>
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
    <div className="glass-card overflow-hidden border-foreground/[0.03]">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-6 border-b border-foreground/[0.03]">
        <h3 className="text-heading-lg flex items-center gap-2">
          <span className="text-primary">{monthName}</span> <span className="text-foreground/40 font-light">{year}</span>
        </h3>
        <div className="flex gap-2">
          <button onClick={handlePrevMonth} aria-label="Previous month" className="p-2 hover:bg-foreground/5 rounded-full transition-colors text-foreground">
            <ChevronLeft size={20} />
          </button>
          <button onClick={handleNextMonth} aria-label="Next month" className="p-2 hover:bg-foreground/5 rounded-full transition-colors text-foreground">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Days of week (Sunday is red / tanggal merah) */}
      <div className="grid grid-cols-7 border-b border-foreground/[0.03] bg-foreground/[0.01]">
        {Array.from({ length: 7 }, (_, i) => {
          // 2024-01-07 was a Sunday (0)
          const d = new Date(2024, 0, 7 + i);
          return d.toLocaleDateString(locale, { weekday: 'short' });
        }).map((day, i) => (
          <div 
            key={day} 
            className={`py-2 text-center text-xs uppercase tracking-[0.2em] font-medium ${
              i === 0 ? 'text-danger font-extrabold' : 'text-muted-foreground/60'
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
        <div className="p-4 md:px-6 border-t border-foreground/[0.05] bg-surface/30 flex items-start gap-4 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider shrink-0 pt-0.5">
            <CalendarCheck size={14} className="text-primary" />
            <span>Hari Libur Bulan Ini:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {currentMonthHolidays.map((h) => {
              const d = parseInt(h.date.split('-')[2], 10);
              return (
                <div
                  key={h.date}
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium border ${
                    h.is_cuti_bersama
                      ? 'bg-warning/10 text-warning border-warning/20'
                      : 'bg-danger/10 text-danger border-danger/20'
                  }`}
                >
                  <span className="font-semibold font-mono">{d}</span>
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

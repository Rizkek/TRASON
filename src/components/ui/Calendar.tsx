'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarProps {
  onDateSelect?: (date: Date) => void;
  selectedDate?: Date;
  events?: any[];
}

export const Calendar: React.FC<CalendarProps> = ({
  onDateSelect,
  selectedDate = new Date(),
  events = [],
}) => {
  const [viewDate, setViewDate] = useState(new Date(selectedDate));

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const monthName = viewDate.toLocaleString('default', { month: 'long' });
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const handlePrevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const days = [];
  const totalDays = daysInMonth(year, month);
  const startOffset = firstDayOfMonth(year, month);

  // Padding for start of month
  for (let i = 0; i < startOffset; i++) {
    days.push(<div key={`pad-${i}`} className="h-24 border border-black/[0.03] dark:border-white/[0.03] bg-transparent opacity-20" />);
  }

  for (let d = 1; d <= totalDays; d++) {
    const date = new Date(year, month, d);
    const isSelected = date.toDateString() === selectedDate.toDateString();
    const isToday = date.toDateString() === new Date().toDateString();
    
    // Check for events on this date
    const dateEvents = events.filter(e => {
       // Format both dates as YYYY-MM-DD strings for a clean timezone-agnostic comparison
       const eventDateStr = e.due_date || (e.due_datetime ? e.due_datetime.split('T')[0] : '');
       
       // Format calendar cell date as local YYYY-MM-DD
       const cellDateStr = date.getFullYear() + '-' + 
         String(date.getMonth() + 1).padStart(2, '0') + '-' + 
         String(date.getDate()).padStart(2, '0');
         
       return eventDateStr === cellDateStr;
    });

    days.push(
      <div 
        key={d}
        onClick={() => onDateSelect?.(date)}
        className={`h-14 md:h-32 border border-black/[0.03] dark:border-white/[0.03] p-2 transition-all cursor-pointer group hover:bg-black/[0.02] dark:bg-white/[0.02] ${
          isSelected ? 'bg-warm-gold/5 border-warm-gold/20' : ''
        }`}
      >
        <div className="flex justify-between items-start">
          <span className={`text-xs font-sans ${
            isToday ? 'bg-warm-gold text-warm-black w-6 h-6 flex items-center justify-center rounded-full font-bold' : 
            isSelected ? 'text-warm-gold font-bold' : 'text-gray-light'
          }`}>
            {d}
          </span>
          {dateEvents.length > 0 && (
            <div className="w-1.5 h-1.5 bg-warm-gold rounded-full shadow-[0_0_8px_rgba(212,165,116,0.6)]" />
          )}
        </div>
        
        <div className="mt-2 space-y-1 overflow-hidden hidden md:block">
          {dateEvents.slice(0, 2).map((e, i) => (
            <div key={i} className="text-[10px] truncate bg-deep-sage/10 text-soft-cream px-1.5 py-0.5 rounded border border-deep-sage/20 font-light">
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

  return (
    <div className="glass-card overflow-hidden border-black/[0.03] dark:border-white/[0.03]">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-lg border-b border-black/[0.03] dark:border-white/[0.03]">
        <h3 className="font-serif text-2xl">
          <span className="text-warm-gold">{monthName}</span> <span className="text-soft-cream/40 font-light">{year}</span>
        </h3>
        <div className="flex gap-sm">
          <button onClick={handlePrevMonth} className="p-2 hover:bg-black/5 dark:bg-white/5 rounded-full transition-colors">
            <ChevronLeft size={20} />
          </button>
          <button onClick={handleNextMonth} className="p-2 hover:bg-black/5 dark:bg-white/5 rounded-full transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Days of week */}
      <div className="grid grid-cols-7 border-b border-black/[0.03] dark:border-white/[0.03] bg-black/[0.01] dark:bg-white/[0.01]">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="py-2 text-center text-[10px] uppercase tracking-[0.2em] text-gray-light/60 font-bold">
            {day}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7">
        {days}
      </div>
    </div>
  );
};

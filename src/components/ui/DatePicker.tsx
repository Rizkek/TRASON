'use client';

import React, { useState, useEffect } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { DayPicker } from 'react-day-picker';
import { CalendarBlank, CaretLeft, CaretRight, X, Check } from '@phosphor-icons/react';
import { formatDateOnly } from '@/libs/date';

export interface HolidayItem {
  date: string;
  name: string;
  is_cuti_bersama: boolean;
}

export interface DatePickerProps {
  value?: string | Date;
  onChange?: (dateStr: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  minDate?: Date;
  maxDate?: Date;
  holidays?: HolidayItem[];
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = 'Select date...',
  label,
  error,
  disabled = false,
  className = '',
  id,
  minDate,
  maxDate,
  holidays = [],
}) => {
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState<Date | undefined>(undefined);
  
  // Parse value to Date
  const parseDate = (val?: string | Date): Date | undefined => {
    if (!val) return undefined;
    if (val instanceof Date) return isNaN(val.getTime()) ? undefined : val;
    // Format YYYY-MM-DD
    const parts = val.split('-');
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      return isNaN(d.getTime()) ? undefined : d;
    }
    const d = new Date(val);
    return isNaN(d.getTime()) ? undefined : d;
  };

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(() => parseDate(value));

  useEffect(() => {
    setSelectedDate(parseDate(value));
  }, [value]);

  const handleSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      const formatted = formatDateOnly(date);
      onChange?.(formatted);
      setOpen(false);
    } else {
      onChange?.('');
    }
  };

  const handleQuickToday = () => {
    const today = new Date();
    setSelectedDate(today);
    onChange?.(formatDateOnly(today));
    setOpen(false);
  };

  const handleClear = () => {
    setSelectedDate(undefined);
    onChange?.('');
    setOpen(false);
  };

  const displayString = selectedDate
    ? selectedDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '';

  // Parse holidays into Date sets
  const holidayDates = holidays
    .filter((h) => !h.is_cuti_bersama)
    .map((h) => {
      const [y, m, d] = h.date.split('-').map(Number);
      return new Date(y, m - 1, d);
    });

  const cutiDates = holidays
    .filter((h) => h.is_cuti_bersama)
    .map((h) => {
      const [y, m, d] = h.date.split('-').map(Number);
      return new Date(y, m - 1, d);
    });

  // Holidays for the current viewed month
  const currentViewMonth = viewMonth ?? selectedDate ?? new Date();
  const monthHolidays = holidays.filter((h) => {
    const [y, m] = h.date.split('-').map(Number);
    return y === currentViewMonth.getFullYear() && m === currentViewMonth.getMonth() + 1;
  });

  return (
    <div className={`w-full space-y-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="block text-xs font-medium text-muted-foreground uppercase tracking-wider select-none"
        >
          {label}
        </label>
      )}

      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild disabled={disabled}>
          <button
            type="button"
            id={id}
            className={`w-full h-10 px-3 bg-surface border ${
              error
                ? 'border-danger/70 focus:border-danger focus:ring-danger/30'
                : 'border-foreground/15 hover:border-foreground/30 focus:border-primary focus:ring-primary/30'
            } transition-colors duration-200 rounded-lg text-sm text-left flex items-center justify-between gap-2 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer group`}
          >
            <div className="flex items-center gap-2.5 min-w-0 truncate">
              <CalendarBlank
                size={16}
                weight="bold"
                className="text-primary/80 group-hover:text-primary shrink-0 transition-colors"
              />
              {displayString ? (
                <span className="text-foreground font-medium truncate">{displayString}</span>
              ) : (
                <span className="text-muted-foreground/60 truncate">{placeholder}</span>
              )}
            </div>

            {selectedDate && !disabled && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                className="p-1 text-muted-foreground hover:text-foreground rounded-full hover:bg-foreground/10 transition-colors"
                title="Clear date"
              >
                <X size={12} weight="bold" />
              </span>
            )}
          </button>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            align="start"
            sideOffset={6}
            className="z-[250] rounded-2xl border border-foreground/10 bg-background p-4 text-foreground animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2 select-none"
          >
            <style>{`
              .rdp-root {
                --rdp-accent-color: rgb(var(--color-primary-text));
                --rdp-accent-background-color: rgb(var(--color-primary) / 0.15);
                font-family: inherit;
              }
              .rdp-month_caption {
                display: flex;
                align-items: center;
                justify-content: space-between;
                font-family: var(--font-sans), sans-serif;
                font-weight: 700;
                font-size: 1rem;
                color: rgb(var(--color-foreground));
                padding-bottom: 0.75rem;
                margin-bottom: 0.5rem;
                border-bottom: 1px solid rgb(var(--color-foreground) / 0.1);
              }
              .rdp-nav {
                display: flex;
                gap: 0.25rem;
              }
              .rdp-button_previous, .rdp-button_next {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 32px;
                height: 32px;
                border-radius: 8px;
                border: 1px solid rgb(var(--color-foreground) / 0.12);
                background: rgb(var(--color-foreground) / 0.04);
                color: rgb(var(--color-muted));
                transition: background-color 0.2s, color 0.2s, border-color 0.2s;
              }
              .rdp-button_previous:hover, .rdp-button_next:hover {
                background: rgb(var(--color-foreground) / 0.1);
                color: rgb(var(--color-foreground));
                border-color: rgb(var(--color-primary-text) / 0.4);
              }
              .rdp-weeks {
                border-collapse: collapse;
              }
              .rdp-weekday {
                font-size: 0.75rem;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.1em;
                color: rgb(var(--color-muted));
                padding: 0.5rem 0.25rem;
                text-align: center;
              }
              .rdp-day {
                width: 36px;
                height: 36px;
                font-size: 0.875rem;
                border-radius: 8px;
                text-align: center;
                color: rgb(var(--color-foreground));
              }
              .rdp-day_button {
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 8px;
              }
              .rdp-day_button:hover:not([disabled]) {
                background-color: rgb(var(--color-foreground) / 0.08);
                color: rgb(var(--color-primary-text));
              }
              .rdp-selected .rdp-day_button {
                background: rgb(var(--color-primary)) !important;
                color: rgb(var(--color-on-primary)) !important;
                font-weight: 700 !important;
              }
              .rdp-today:not(.rdp-selected) .rdp-day_button {
                border: 1px solid rgb(var(--color-primary-text) / 0.6);
                color: rgb(var(--color-primary-text));
                font-weight: 600;
              }
              .rdp-outside {
                opacity: 0.4;
              }
              .rdp-disabled {
                opacity: 0.3;
                cursor: not-allowed;
              }
              /* Holiday day styles */
              .rdp-day.rdp-holiday .rdp-day_button {
                border: 1px solid rgb(var(--color-danger) / 0.5) !important;
                color: rgb(var(--color-danger)) !important;
                font-weight: 700;
                background: rgb(var(--color-danger) / 0.08);
              }
              .rdp-day.rdp-holiday.rdp-selected .rdp-day_button {
                background: rgb(var(--color-danger)) !important;
                color: rgb(var(--color-background)) !important;
              }
              /* Cuti bersama day styles */
              .rdp-day.rdp-cuti .rdp-day_button {
                border: 1px solid rgb(var(--color-warning) / 0.5) !important;
                color: rgb(var(--color-warning)) !important;
                font-weight: 700;
                background: rgb(var(--color-warning) / 0.08);
              }
              .rdp-day.rdp-cuti.rdp-selected .rdp-day_button {
                background: rgb(var(--color-warning)) !important;
                color: rgb(var(--color-background)) !important;
              }
            `}</style>

            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={handleSelect}
              month={viewMonth}
              onMonthChange={setViewMonth}
              disabled={[
                ...(minDate ? [{ before: minDate }] : []),
                ...(maxDate ? [{ after: maxDate }] : []),
              ]}
              modifiers={{
                holiday: holidayDates,
                cuti: cutiDates,
              }}
              modifiersClassNames={{
                holiday: 'rdp-holiday',
                cuti: 'rdp-cuti',
              }}
              showOutsideDays
            />

            {/* Holiday info for current month */}
            {monthHolidays.length > 0 && (
              <div className="mt-2 pt-2 border-t border-foreground/10 space-y-1">
                {monthHolidays.map((h) => {
                  const [y, m, d] = h.date.split('-').map(Number);
                  const dateObj = new Date(y, m - 1, d);
                  return (
                    <div key={h.date} className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${h.is_cuti_bersama ? 'bg-warning' : 'bg-danger'}`} />
                      <span className={`text-xs font-semibold ${
                        h.is_cuti_bersama ? 'text-warning' : 'text-danger'
                      }`}>
                        {d} —
                      </span>
                      <span className="text-xs text-muted-foreground truncate">{h.name}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Quick Action Footer */}
            <div className="mt-3 pt-3 border-t border-foreground/10 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleClear}
                className="px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground rounded-md hover:bg-foreground/5 transition-colors"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={handleQuickToday}
                className="px-3 py-1 text-xs font-medium bg-primary/15 text-primary hover:bg-primary hover:text-on-primary rounded-lg transition-all"
              >
                Today
              </button>
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      {error && <p className="text-xs text-danger font-medium">{error}</p>}
    </div>
  );
};

DatePicker.displayName = 'DatePicker';

'use client';

import React, { useState, useEffect } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { DayPicker } from 'react-day-picker';
import { CalendarBlank, CaretLeft, CaretRight, X, Check } from '@phosphor-icons/react';
import { formatDateOnly } from '@/libs/date';

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
}) => {
  const [open, setOpen] = useState(false);
  
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

  return (
    <div className={`w-full space-y-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="block text-[11px] font-bold text-gray-light uppercase tracking-wider select-none"
        >
          {label}
        </label>
      )}

      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild disabled={disabled}>
          <button
            type="button"
            id={id}
            className={`w-full h-10 px-3 bg-gray-strong/80 hover:bg-gray-strong/95 border ${
              error
                ? 'border-red-500/70 focus:border-red-500 focus:ring-red-500/30'
                : 'border-white/10 hover:border-white/20 focus:border-primary focus:ring-primary/30'
            } transition-all duration-200 rounded-lg text-sm text-left flex items-center justify-between gap-2 shadow-sm focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer group`}
          >
            <div className="flex items-center gap-2.5 min-w-0 truncate">
              <CalendarBlank
                size={16}
                weight="bold"
                className="text-warm-gold/80 group-hover:text-warm-gold shrink-0 transition-colors"
              />
              {displayString ? (
                <span className="text-soft-cream font-medium truncate">{displayString}</span>
              ) : (
                <span className="text-gray-light/60 truncate">{placeholder}</span>
              )}
            </div>

            {selectedDate && !disabled && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                className="p-1 text-gray-light/50 hover:text-soft-cream rounded-full hover:bg-white/10 transition-colors"
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
            className="z-[250] rounded-2xl border border-white/10 bg-warm-black/95 backdrop-blur-2xl p-4 text-soft-cream shadow-[0_25px_60px_rgba(0,0,0,0.8)] animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2 select-none"
          >
            <style>{`
              .rdp-root {
                --rdp-accent-color: #F4C95D;
                --rdp-accent-background-color: rgba(244, 201, 93, 0.15);
                font-family: inherit;
              }
              .rdp-month_caption {
                display: flex;
                align-items: center;
                justify-content: space-between;
                font-family: var(--font-display), sans-serif;
                font-weight: 700;
                font-size: 1rem;
                color: #F8FAFC;
                padding-bottom: 0.75rem;
                margin-bottom: 0.5rem;
                border-bottom: 1px solid rgba(255, 255, 255, 0.08);
              }
              .rdp-nav {
                display: flex;
                gap: 0.25rem;
              }
              .rdp-button_previous, .rdp-button_next {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 28px;
                height: 28px;
                border-radius: 8px;
                border: 1px solid rgba(255, 255, 255, 0.08);
                background: rgba(255, 255, 255, 0.04);
                color: #94A3B8;
                transition: all 0.2s;
              }
              .rdp-button_previous:hover, .rdp-button_next:hover {
                background: rgba(255, 255, 255, 0.1);
                color: #F8FAFC;
                border-color: rgba(244, 201, 93, 0.3);
              }
              .rdp-weeks {
                border-collapse: collapse;
              }
              .rdp-weekday {
                font-size: 0.7rem;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.1em;
                color: #94A3B8;
                opacity: 0.6;
                padding: 0.5rem 0.25rem;
                text-align: center;
              }
              .rdp-day {
                width: 34px;
                height: 34px;
                font-size: 0.85rem;
                border-radius: 8px;
                transition: all 0.15s;
                text-align: center;
                color: #F8FAFC;
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
                background-color: rgba(255, 255, 255, 0.08);
                color: #F4C95D;
              }
              .rdp-selected .rdp-day_button {
                background: #F4C95D !important;
                color: #0B0F14 !important;
                font-weight: 700 !important;
                box-shadow: 0 0 14px rgba(244, 201, 93, 0.4);
              }
              .rdp-today:not(.rdp-selected) .rdp-day_button {
                border: 1px solid rgba(244, 201, 93, 0.5);
                color: #F4C95D;
                font-weight: 600;
              }
              .rdp-outside {
                opacity: 0.25;
              }
              .rdp-disabled {
                opacity: 0.2;
                cursor: not-allowed;
              }
            `}</style>

            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={handleSelect}
              disabled={[
                ...(minDate ? [{ before: minDate }] : []),
                ...(maxDate ? [{ after: maxDate }] : []),
              ]}
              showOutsideDays
            />

            {/* Quick Action Footer */}
            <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleClear}
                className="px-2.5 py-1 text-xs text-gray-light hover:text-soft-cream rounded-md hover:bg-white/5 transition-colors"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={handleQuickToday}
                className="px-3 py-1 text-xs font-bold bg-warm-gold/15 text-warm-gold hover:bg-warm-gold hover:text-warm-black rounded-lg transition-all"
              >
                Today
              </button>
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      {error && <p className="text-xs text-red-400 font-medium">{error}</p>}
    </div>
  );
};

DatePicker.displayName = 'DatePicker';

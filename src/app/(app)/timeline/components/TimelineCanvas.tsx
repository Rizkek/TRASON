'use client';

import React, { useRef, useEffect } from 'react';
import { Loading } from '@/components';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { Activity, Reminder } from '@/services/supabase/supabaseClient';
import { HOURS, CELL_HEIGHT, formatHour, getDurationLabel } from './types';
import { Plus, Trash as Trash2, CaretLeft, CaretRight, Bell, Warning, Repeat, CalendarCheck } from '@phosphor-icons/react';

interface Holiday {
  date: string;
  name: string;
  is_cuti_bersama: boolean;
}

interface TimelineCanvasProps {
  locale: string;
  daysOfWeek: Date[];
  activities: Activity[];
  reminders: Reminder[];
  grid: Record<number, Record<number, Activity[]>>;
  remindersGrid: Record<number, Record<number, Reminder[]>>;
  isLoading: boolean;
  getHolidayForDate: (date: Date) => Holiday | undefined;
  onOpenAddModal: (date?: Date, hour?: number) => void;
  onOpenEditModal: (activity: Activity) => void;
  onConfirmDelete: (activityId: string) => void;
  mobileDayIdx: number;
  setMobileDayIdx: React.Dispatch<React.SetStateAction<number>>;
}

export function TimelineCanvas({
  locale,
  daysOfWeek,
  activities,
  reminders,
  grid,
  remindersGrid,
  isLoading,
  getHolidayForDate,
  onOpenAddModal,
  onOpenEditModal,
  onConfirmDelete,
  mobileDayIdx,
  setMobileDayIdx,
}: TimelineCanvasProps) {
  const { t } = useTranslation();
  const currentHour = new Date().getHours();
  const currentMinute = new Date().getMinutes();
  const gridRef = useRef<HTMLDivElement>(null);

  // Scroll to current time on mount
  useEffect(() => {
    if (gridRef.current) {
      const scrollTarget = currentHour * CELL_HEIGHT - 150;
      gridRef.current.scrollTop = Math.max(0, scrollTarget);
    }
  }, [currentHour]);

  const currentTimeOffset = currentHour * CELL_HEIGHT + (currentMinute / 60) * CELL_HEIGHT;

  if (isLoading) {
    return (
      <div className="flex justify-center py-2xl">
        <Loading />
      </div>
    );
  }

  return (
    <div className="glass rounded-xl border border-black/[0.05] dark:border-white/[0.05] overflow-hidden">
      {/* Desktop View */}
      <div className="hidden md:block overflow-x-auto custom-scrollbar">
        <div className="min-w-[700px] md:min-w-0">
          <div className="grid grid-cols-[64px_repeat(7,1fr)] border-b border-black/[0.05] dark:border-white/[0.05] bg-gray-strong/60 sticky top-0 z-20">
            <div className="border-r border-black/[0.03] dark:border-white/[0.03]" />
            {daysOfWeek.map((day, idx) => {
              const isToday = day.toDateString() === new Date().toDateString();
              const holiday = getHolidayForDate(day);
              return (
                <div
                  key={idx}
                  className={`px-sm py-md text-center border-r border-black/[0.03] dark:border-white/[0.03] last:border-r-0 relative transition-colors ${
                    isToday ? 'bg-primary/10' : holiday ? 'bg-rose-500/10' : ''
                  }`}
                  title={
                    holiday
                      ? `${holiday.name} (${holiday.is_cuti_bersama ? 'Cuti Bersama' : 'Libur Nasional'})`
                      : undefined
                  }
                >
                  {isToday && (
                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  )}
                  <p
                    className={`text-[11px] font-bold uppercase tracking-[0.15em] ${
                      isToday ? 'text-primary' : holiday ? 'text-rose-400 font-extrabold' : 'text-gray-light'
                    }`}
                  >
                    {day.toLocaleDateString(locale, { weekday: 'short' })}
                  </p>
                  <p
                    className={`text-[10px] font-mono mt-0.5 ${
                      holiday ? 'text-rose-300 font-bold' : 'text-gray-light/60'
                    }`}
                  >
                    {day.getDate()}
                  </p>
                  {holiday && (
                    <div className="mt-1 flex items-center justify-center">
                      <span
                        className={`text-[8px] px-1 py-0.5 rounded truncate max-w-[95%] font-semibold block ${
                          holiday.is_cuti_bersama
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {holiday.is_cuti_bersama ? '🏖️ Cuti' : '🔴 Libur'}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Scrollable Grid Body */}
          <div
            ref={gridRef}
            className="overflow-y-auto"
            style={{ maxHeight: 'calc(100vh - 280px)' }}
            role="grid"
            aria-label="Weekly schedule grid"
          >
            <div className="relative">
              {/* Current time line */}
              <div
                className="absolute left-16 right-0 z-10 pointer-events-none"
                style={{ top: `${currentTimeOffset}px` }}
              >
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-red-500 -ml-1 flex-shrink-0" />
                  <div className="flex-1 h-px bg-red-500/70" />
                </div>
              </div>

              {HOURS.map((hour) => {
                const isCurrentHour =
                  hour === currentHour && new Date().toDateString() === new Date().toDateString();
                return (
                  <div
                    key={hour}
                    className="grid grid-cols-[64px_repeat(7,1fr)]"
                    style={{ minHeight: `${CELL_HEIGHT}px` }}
                    role="row"
                  >
                    {/* Hour label */}
                    <div
                      className={`flex items-start justify-end pr-sm pt-sm border-r border-black/[0.03] dark:border-white/[0.03] sticky left-0 bg-gray-strong/40 ${
                        isCurrentHour ? 'text-red-400' : 'text-gray-light opacity-40'
                      }`}
                    >
                      <span className="text-[10px] font-bold font-mono">{formatHour(hour)}</span>
                    </div>

                    {/* Day cells */}
                    {daysOfWeek.map((day, dayIdx) => {
                      const isToday = day.toDateString() === new Date().toDateString();
                      const cellActivities = grid[dayIdx]?.[hour] || [];
                      const cellReminders = remindersGrid[dayIdx]?.[hour] || [];
                      const hasClash = cellActivities.length > 0 && cellReminders.length > 0;

                      return (
                        <div
                          key={dayIdx}
                          role="gridcell"
                          className={`border-r border-b border-black/[0.03] dark:border-white/[0.03] last:border-r-0 p-1 cursor-pointer group relative ${
                            isToday ? 'bg-primary/[0.02]' : 'hover:bg-black/[0.01] dark:bg-white/[0.01]'
                          }`}
                          onClick={() => {
                            if (cellActivities.length === 0 && cellReminders.length === 0)
                              onOpenAddModal(day, hour);
                          }}
                          aria-label={`${day.toLocaleDateString(locale, {
                            weekday: 'long',
                            month: 'short',
                            day: 'numeric',
                          })} at ${formatHour(hour)}`}
                        >
                          {/* Empty slot hint */}
                          {cellActivities.length === 0 && cellReminders.length === 0 && (
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                              <Plus size={12} className="text-primary opacity-50" />
                            </div>
                          )}

                          {/* Clash indicator */}
                          {hasClash && (
                            <div className="flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded px-1.5 py-0.5 mb-1 text-[8px] font-bold">
                              <Warning size={10} className="shrink-0" />
                              <span className="truncate">Bentrok ({cellReminders.length} Pengingat)</span>
                            </div>
                          )}

                          {/* Reminder cards */}
                          {cellReminders.map((rem) => (
                            <div
                              key={rem.id}
                              className="rounded p-1 mb-1 text-left border-l-2 border-amber-400 bg-amber-500/10 text-soft-cream relative group/rem"
                              title={`Pengingat: ${rem.title}${rem.due_time ? ' (' + rem.due_time + ')' : ''}`}
                            >
                              <div className="flex items-center gap-1">
                                <Bell size={10} className="text-amber-400 shrink-0" />
                                <p className="text-[9px] font-bold text-amber-200 truncate leading-tight flex-1">
                                  {rem.title}
                                </p>
                              </div>
                              {rem.due_time && (
                                <span className="text-[8px] text-amber-300/70 font-mono block mt-0.5">
                                  {rem.due_time}
                                </span>
                              )}
                            </div>
                          ))}

                          {/* Activity cards */}
                          {cellActivities.map((act) => {
                            const isRoutine = Boolean(
                              (act.metadata as any)?.is_weekly_routine ||
                                (act as any).is_weekly_template
                            );
                            return (
                              <div
                                key={act.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onOpenEditModal(act);
                                }}
                                className={`rounded p-1 mb-0.5 cursor-pointer group/card hover:brightness-110 transition-all text-left relative overflow-hidden ${
                                  isRoutine ? 'border-dashed' : ''
                                }`}
                                style={{
                                  background: isRoutine
                                    ? `linear-gradient(135deg, rgba(78,79,235,0.15), rgba(78,79,235,0.05))`
                                    : `linear-gradient(135deg, #4e4feb22, #4e4feb11)`,
                                  borderLeft: isRoutine ? '2px dashed #818cf8' : '2px solid #4e4feb',
                                }}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => e.key === 'Enter' && onOpenEditModal(act)}
                                aria-label={`${act.title}, ${act.category || 'activity'}`}
                              >
                                <div className="flex items-center gap-1">
                                  {isRoutine && (
                                    <span title="Jadwal Rutin Mingguan" className="inline-flex items-center shrink-0">
                                      <Repeat size={10} className="text-indigo-300" />
                                    </span>
                                  )}
                                  <p className="text-[9px] font-bold text-soft-cream truncate leading-tight flex-1">
                                    {act.title}
                                  </p>
                                </div>
                                <div className="flex items-center gap-1 mt-0.5">
                                  {act.category && (
                                    <span className="text-[8px] text-primary opacity-80 uppercase tracking-wide">
                                      {act.category}
                                    </span>
                                  )}
                                  {getDurationLabel(act) && (
                                    <span className="text-[8px] text-gray-light opacity-60">
                                      {getDurationLabel(act)}
                                    </span>
                                  )}
                                </div>
                                {/* Delete on hover */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onConfirmDelete(act.id);
                                  }}
                                  className="absolute top-0.5 right-0.5 opacity-0 group-hover/card:opacity-100 text-gray-light hover:text-red-400 transition-all"
                                  aria-label={`Delete ${act.title}`}
                                >
                                  <Trash2 size={9} />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Holiday Info Panel (Desktop) */}
      {(() => {
        const weekHolidays = daysOfWeek
          .map((d) => ({ day: d, holiday: getHolidayForDate(d) }))
          .filter((x) => !!x.holiday);
        if (weekHolidays.length === 0) return null;
        return (
          <div className="hidden md:flex items-start gap-md px-xl py-md border-t border-black/[0.05] dark:border-white/[0.05] bg-gray-strong/20 flex-wrap">
            <div className="flex items-center gap-xs text-[10px] font-bold text-gray-light uppercase tracking-widest shrink-0 pt-px">
              <CalendarCheck size={12} className="text-primary" />
              Hari Libur Minggu Ini
            </div>
            <div className="flex flex-wrap gap-sm">
              {weekHolidays.map(({ day, holiday }) => (
                <div
                  key={day.toDateString()}
                  className={`flex items-center gap-1.5 px-sm py-1 rounded-md text-[11px] font-medium border ${
                    holiday!.is_cuti_bersama
                      ? 'bg-amber-500/10 text-amber-200 border-amber-500/20'
                      : 'bg-rose-500/10 text-rose-200 border-rose-500/20'
                  }`}
                >
                  <span>{holiday!.is_cuti_bersama ? '🏖️' : '🔴'}</span>
                  <span className="font-semibold">
                    {day.toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short' })}
                  </span>
                  <span className="text-[10px] opacity-75">—</span>
                  <span className="text-[10px]">{holiday!.name}</span>
                  {holiday!.is_cuti_bersama && (
                    <span className="text-[9px] uppercase tracking-wider font-bold bg-amber-500/20 text-amber-300 px-1 rounded">Cuti</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      <div className="md:hidden p-md space-y-md min-h-[50vh]">
        <div className="flex items-center justify-between border-b border-black/[0.05] dark:border-white/[0.05] pb-2 mb-md">
          <button
            onClick={() => setMobileDayIdx((p) => (p > 0 ? p - 1 : 6))}
            className="p-1 hover:bg-black/5 rounded-full"
          >
            <CaretLeft size={20} />
          </button>
          <h3 className="font-bold text-soft-cream uppercase tracking-widest text-sm flex-1 text-center">
            {daysOfWeek[mobileDayIdx]?.toLocaleDateString(locale, {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
          </h3>
          <button
            onClick={() => setMobileDayIdx((p) => (p < 6 ? p + 1 : 0))}
            className="p-1 hover:bg-black/5 rounded-full"
          >
            <CaretRight size={20} />
          </button>
        </div>
        {(() => {
          const mobileDay = daysOfWeek[mobileDayIdx];
          const mobileHoliday = mobileDay ? getHolidayForDate(mobileDay) : undefined;
          const todaysActivities = grid[mobileDayIdx]
            ? HOURS.flatMap((h) => grid[mobileDayIdx][h] || [])
            : [];
          const todaysReminders = remindersGrid[mobileDayIdx]
            ? HOURS.flatMap((h) => remindersGrid[mobileDayIdx][h] || [])
            : [];

          return (
            <>
              {/* Mobile Holiday Banner */}
              {mobileHoliday && (
                <div
                  className={`p-sm rounded-lg border flex items-center gap-2 mb-sm ${
                    mobileHoliday.is_cuti_bersama
                      ? 'border-amber-500/30 bg-amber-500/10 text-amber-200'
                      : 'border-rose-500/30 bg-rose-500/10 text-rose-200'
                  }`}
                >
                  <span className="text-base">{mobileHoliday.is_cuti_bersama ? '🏖️' : '🔴'}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold truncate">{mobileHoliday.name}</p>
                    <p className="text-[10px] opacity-75">
                      {mobileHoliday.is_cuti_bersama
                        ? 'Cuti Bersama Resmi'
                        : 'Hari Libur Nasional Indonesia'}
                    </p>
                  </div>
                </div>
              )}

              {todaysActivities.length === 0 && todaysReminders.length === 0 && (
                <div className="text-center py-xl space-y-sm">
                  <p className="text-gray-light italic text-xs">
                    {t('timeline_page.no_activities_today')}
                  </p>
                  <button
                    onClick={() => onOpenAddModal()}
                    className="text-primary hover:text-primary-light flex items-center gap-1 text-sm mx-auto mt-4"
                  >
                    <Plus size={16} /> {t('timeline_page.log_activity_btn')}
                  </button>
                </div>
              )}

              {/* Reminders section in mobile */}
              {todaysReminders.map((rem) => (
                <div
                  key={rem.id}
                  className="p-sm rounded-lg border border-amber-500/30 bg-amber-500/10 flex items-start gap-md"
                >
                  <Bell size={16} className="text-amber-400 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm text-amber-200 truncate">{rem.title}</p>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 font-bold uppercase tracking-wider">
                        Pengingat
                      </span>
                    </div>
                    {rem.due_time && (
                      <p className="text-xs text-amber-300/80 font-mono mt-0.5">
                        Waktu: {rem.due_time}
                      </p>
                    )}
                  </div>
                </div>
              ))}

              {/* Activities */}
              {todaysActivities.map((act) => {
                const isRoutine = Boolean(
                  (act.metadata as any)?.is_weekly_routine || (act as any).is_weekly_template
                );
                return (
                  <div
                    key={act.id}
                    onClick={() => onOpenEditModal(act)}
                    className="glass-card p-sm flex items-start gap-md active:bg-black/10 transition-colors"
                  >
                    <div className="text-[10px] font-bold text-gray-light w-10 text-right pt-0.5 shrink-0">
                      {formatHour(new Date(act.start_time).getHours())}
                    </div>
                    <div
                      className={`flex-1 border-l-2 ${
                        isRoutine ? 'border-indigo-400 border-dashed' : 'border-primary'
                      } pl-md relative group min-w-0`}
                    >
                      <div className="flex items-center gap-1.5">
                        {isRoutine && <Repeat size={12} className="text-indigo-400 shrink-0" />}
                        <p className="font-bold text-sm text-soft-cream truncate">{act.title}</p>
                      </div>
                      <div className="flex flex-wrap gap-2 text-[8px] text-gray-light uppercase tracking-widest mt-1">
                        {isRoutine && (
                          <span className="text-indigo-300 bg-indigo-500/20 px-1 rounded shrink-0">
                            Rutin
                          </span>
                        )}
                        {act.category && <span className="text-primary shrink-0">{act.category}</span>}
                        {getDurationLabel(act) && <span className="shrink-0">• {getDurationLabel(act)}</span>}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onConfirmDelete(act.id);
                        }}
                        className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 text-gray-light hover:text-expense transition-opacity"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
              <button
                onClick={() => onOpenAddModal()}
                className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-white/10 hover:border-primary/50 text-gray-light hover:text-primary rounded-lg transition-colors text-xs font-bold uppercase tracking-widest mt-4"
              >
                <Plus size={14} /> {t('timeline_page.log_activity_btn')}
              </button>
            </>
          );
        })()}
      </div>
    </div>
  );
}

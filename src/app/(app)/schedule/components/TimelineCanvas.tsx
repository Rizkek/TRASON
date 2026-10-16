'use client';

import React, { useRef, useEffect } from 'react';
import { Loading } from '@/components';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { Activity, Reminder } from '@/services/supabase/supabaseClient';
import { HOURS, CELL_HEIGHT, formatHour, getDurationLabel } from './types';
import { Plus, Trash as Trash2, CaretLeft, CaretRight, Bell, Warning, Repeat } from '@phosphor-icons/react';
import { Heading, Paragraph } from '@/components/ui/typography';

interface TimelineCanvasProps {
  locale: string;
  daysOfWeek: Date[];
  activities: Activity[];
  reminders: Reminder[];
  grid: Record<number, Record<number, Activity[]>>;
  remindersGrid: Record<number, Record<number, Reminder[]>>;
  isLoading: boolean;
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
      <div className="flex justify-center py-12">
        <Loading />
      </div>
    );
  }

  return (
    <div className="glass rounded-xl border border-foreground/[0.05] overflow-hidden">
      {/* Desktop View */}
      <div className="hidden md:block overflow-x-auto custom-scrollbar">
        <div className="min-w-[700px] md:min-w-0">
          <div className="grid grid-cols-[64px_repeat(7,1fr)] border-b border-foreground/[0.05] bg-surface/60 sticky top-0 z-20">
            <div className="border-r border-foreground/[0.03]" />
            {daysOfWeek.map((day, idx) => {
              const isToday = day.toDateString() === new Date().toDateString();
              return (
                <div
                  key={idx}
                  className={`px-2 py-4 text-center border-r border-foreground/[0.03] last:border-r-0 relative transition-colors ${
                    isToday ? 'bg-primary/10' : ''
                  }`}
                >
                  {isToday && (
                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
                  )}
                  <Paragraph
                    className={`text-xs font-bold uppercase tracking-[0.15em] ${
                      isToday ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    {day.toLocaleDateString(locale, { weekday: 'short' })}
                  </Paragraph>
                  <Paragraph
                    className="text-xs font-mono mt-0.5 text-muted-foreground/60"
                  >
                    {day.getDate()}
                  </Paragraph>
                </div>
              );
            })}
          </div>

          {/* Scrollable Grid Body */}
          <div
            ref={gridRef}
            className="overflow-y-auto"
            style={{ maxHeight: 'calc(100dvh - 280px)' }}
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
                  <div className="w-2 h-2 rounded-full bg-danger -ml-1 flex-shrink-0" />
                  <div className="flex-1 h-px bg-danger/70" />
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
                      className={`flex items-start justify-end pr-2 pt-2 border-r border-foreground/[0.03] sticky left-0 bg-surface/40 ${
                        isCurrentHour ? 'text-danger' : 'text-muted-foreground opacity-40'
                      }`}
                    >
                      <span className="text-xs font-bold font-mono">{formatHour(hour)}</span>
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
                          className={`border-r border-b border-foreground/[0.03] last:border-r-0 p-1 cursor-pointer group relative ${
                            isToday ? 'bg-primary/[0.02]' : 'hover:bg-foreground/[0.01]'
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
                            <div className="flex items-center gap-1 bg-warning/20 text-warning border border-warning/40 rounded px-1.5 py-0.5 mb-1 text-xs font-bold">
                              <Warning size={10} className="shrink-0" />
                              <span className="truncate">Bentrok ({cellReminders.length} Pengingat)</span>
                            </div>
                          )}

                          {/* Reminder cards */}
                          {cellReminders.map((rem) => (
                            <div
                              key={rem.id}
                              className="rounded p-1 mb-1 text-left border-l-2 border-warning bg-warning/10 text-foreground relative group/rem"
                              title={`Pengingat: ${rem.title}${rem.due_time ? ' (' + rem.due_time + ')' : ''}`}
                            >
                              <div className="flex items-center gap-1">
                                <Bell size={10} className="text-warning shrink-0" />
                                <Paragraph className="text-xs font-bold text-warning truncate leading-tight flex-1">
                                  {rem.title}
                                </Paragraph>
                              </div>
                              {rem.due_time && (
                                <span className="text-xs text-warning/70 font-mono block mt-0.5">
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
                                    ? 'rgb(var(--color-primary) / 0.15)'
                                    : 'rgb(var(--color-primary) / 0.1)',
                                  borderLeft: isRoutine ? '2px dashed rgb(var(--color-primary))' : '2px solid rgb(var(--color-primary) / 0.5)',
                                }}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => e.key === 'Enter' && onOpenEditModal(act)}
                                aria-label={`${act.title}, ${act.category || 'activity'}`}
                              >
                                <div className="flex items-center gap-1">
                                  {isRoutine && (
                                    <span title="Jadwal Rutin Mingguan" className="inline-flex items-center shrink-0">
                                      <Repeat size={10} className="text-primary" />
                                    </span>
                                  )}
                                  <Paragraph className="text-xs font-bold text-foreground truncate leading-tight flex-1">
                                    {act.title}
                                  </Paragraph>
                                </div>
                                <div className="flex items-center gap-1 mt-0.5">
                                  {act.category && (
                                    <span className="text-xs text-primary opacity-80 uppercase tracking-wide">
                                      {act.category}
                                    </span>
                                  )}
                                  {getDurationLabel(act) && (
                                    <span className="text-xs text-muted-foreground opacity-60">
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
                                  className="absolute top-0.5 right-0.5 opacity-0 group-hover/card:opacity-100 text-muted-foreground hover:text-danger transition-all"
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

      <div className="md:hidden p-4 space-y-4 min-h-[50vh]">
        <div className="flex items-center justify-between border-b border-foreground/[0.05] pb-2 mb-4">
          <button
            onClick={() => setMobileDayIdx((p) => (p > 0 ? p - 1 : 6))}
            className="p-1 hover:bg-foreground/5 rounded-full"
          >
            <CaretLeft size={20} />
          </button>
          <Heading as="h3" size="h3" className="font-bold text-foreground uppercase tracking-widest text-sm flex-1 text-center">
            {daysOfWeek[mobileDayIdx]?.toLocaleDateString(locale, {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
          </Heading>
          <button
            onClick={() => setMobileDayIdx((p) => (p < 6 ? p + 1 : 0))}
            className="p-1 hover:bg-foreground/5 rounded-full"
          >
            <CaretRight size={20} />
          </button>
        </div>
        {(() => {
          const todaysActivities = grid[mobileDayIdx]
            ? HOURS.flatMap((h) => grid[mobileDayIdx][h] || [])
            : [];
          const todaysReminders = remindersGrid[mobileDayIdx]
            ? HOURS.flatMap((h) => remindersGrid[mobileDayIdx][h] || [])
            : [];

          return (
            <>

              {todaysActivities.length === 0 && todaysReminders.length === 0 && (
                <div className="text-center py-8 space-y-2">
                  <Paragraph className="text-muted-foreground italic text-xs">
                    {t('timeline_page.no_activities_today')}
                  </Paragraph>
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
                  className="p-2 rounded-lg border border-warning/30 bg-warning/10 flex items-start gap-4"
                >
                  <Bell size={16} className="text-warning shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Paragraph className="font-bold text-sm text-warning truncate">{rem.title}</Paragraph>
                      <span className="text-xs px-1.5 py-0.5 rounded bg-warning/20 text-warning font-bold uppercase tracking-wider">
                        Pengingat
                      </span>
                    </div>
                    {rem.due_time && (
                      <Paragraph className="text-xs text-warning/80 font-mono mt-0.5">
                        Waktu: {rem.due_time}
                      </Paragraph>
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
                    className="glass-card p-2 flex items-start gap-4 active:bg-foreground/10 transition-colors"
                  >
                    <div className="text-xs font-bold text-muted-foreground w-10 text-right pt-0.5 shrink-0">
                      {formatHour(new Date(act.start_time).getHours())}
                    </div>
                    <div
                      className={`flex-1 border-l-2 ${
                        isRoutine ? 'border-accent-purple border-dashed' : 'border-primary'
                      } pl-4 relative group min-w-0`}
                    >
                      <div className="flex items-center gap-1.5">
                        {isRoutine && <Repeat size={12} className="text-accent-purple shrink-0" />}
                        <Paragraph className="font-bold text-sm text-foreground truncate">{act.title}</Paragraph>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground uppercase tracking-widest mt-1">
                        {isRoutine && (
                          <span className="text-accent-purple bg-accent-purple/20 px-1 rounded shrink-0">
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
                        className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-expense transition-opacity"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
              <button
                onClick={() => onOpenAddModal()}
                className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-foreground/10 hover:border-primary/50 text-muted-foreground hover:text-primary rounded-lg transition-colors text-xs font-bold uppercase tracking-widest mt-4"
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

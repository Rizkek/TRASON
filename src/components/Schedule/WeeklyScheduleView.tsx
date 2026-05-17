'use client';

import React, { useState } from 'react';
import { Button, Loading, Card } from '@/components';
import { useWeekSchedule } from '@/hooks/useWeeklyTemplate';
import { getWeekStartDate, getDayName } from '@/libs/template';
import { ChevronLeft, ChevronRight, AlertTriangle, AlertCircle } from 'lucide-react';
import DaySchedule from './DaySchedule';

interface WeeklyScheduleViewProps {
  initialDate?: Date;
  onAddActivity?: () => void;
  onAddReminder?: () => void;
  onActivityClick?: (id: string) => void;
  onReminderClick?: (id: string) => void;
}

export default function WeeklyScheduleView({
  initialDate,
  onAddActivity,
  onAddReminder,
  onActivityClick,
  onReminderClick,
}: WeeklyScheduleViewProps) {
  const [currentDate, setCurrentDate] = useState(initialDate || new Date());

  const weekStartDate = getWeekStartDate(currentDate);
  const weekEndDate = new Date(weekStartDate);
  weekEndDate.setDate(weekEndDate.getDate() + 6);

  const { snapshot, template, override, isLoading } =
    useWeekSchedule(weekStartDate);

  const handlePrevWeek = () => {
    const prev = new Date(currentDate);
    prev.setDate(currentDate.getDate() - 7);
    setCurrentDate(prev);
  };

  const handleNextWeek = () => {
    const next = new Date(currentDate);
    next.setDate(currentDate.getDate() + 7);
    setCurrentDate(next);
  };

  if (isLoading) return <Loading />;

  if (!snapshot) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-md p-lg flex items-start gap-md">
        <AlertCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
        <div>
          <h2 className="text-lg font-semibold text-soft-cream">Schedule Not Available</h2>
          <p className="text-sm text-gray-light mt-1">
            Create a weekly routine first, then add routine activities to build your weekly schedule.
          </p>
        </div>
      </div>
    );
  }

  const errors = snapshot.conflicts.filter((c) => c.severity === 'error');
  const warnings = snapshot.conflicts.filter((c) => c.severity === 'warning');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Weekly Schedule</h1>
          <p className="text-gray-600">
            {template?.name} - {weekStartDate.toLocaleDateString()} -{' '}
            {weekEndDate.toLocaleDateString()}
          </p>
          {override && <p className="text-sm text-blue-600 mt-1">This week has routine changes</p>}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handlePrevWeek} className="gap-2">
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={handleNextWeek} className="gap-2">
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Conflicts */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-900">
                {errors.length} Scheduling Conflict{errors.length > 1 ? 's' : ''}
              </h3>
              <ul className="mt-2 space-y-1">
                {errors.map((c) => (
                  <li key={`${c.block1.id}-${c.block2.id}`} className="text-sm text-red-800">
                    - {c.suggestion}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {warnings.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-amber-900">
                {warnings.length} Scheduling Warning{warnings.length > 1 ? 's' : ''}
              </h3>
              <ul className="mt-2 space-y-1">
                {warnings.map((c) => (
                  <li key={`${c.block1.id}-${c.block2.id}`} className="text-sm text-amber-800">
                    - {c.suggestion}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {errors.length === 0 && warnings.length === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
          <p className="text-green-800 font-medium">No scheduling conflicts detected!</p>
        </div>
      )}

      {/* Weekly Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
        {Array.from({ length: 7 }).map((_, i) => {
          const dayDate = new Date(weekStartDate);
          dayDate.setDate(dayDate.getDate() + i);

          return (
            <DaySchedule
              key={i}
              date={dayDate}
              dayName={getDayName(dayDate.getDay())}
              dayOfWeek={dayDate.getDay()}
              blocks={snapshot.blocks.filter((b) => b.day_of_week === dayDate.getDay())}
              onActivityClick={onActivityClick}
              onReminderClick={onReminderClick}
              onAddActivity={onAddActivity}
              onAddReminder={onAddReminder}
            />
          );
        })}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Routine Activities" value={snapshot.stats.total_activities} />
        <StatCard label="Reminders" value={snapshot.stats.total_reminders} />
        <StatCard label="Adherence" value={`${snapshot.stats.adherence_percentage}%`} />
        <StatCard label="Conflicts" value={snapshot.conflicts.length} />
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <div className="p-4">
        <p className="text-sm text-gray-600">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </Card>
  );
}

import React from 'react';
import { Card } from '@/components';
import { Bell } from 'lucide-react';
import { Reminder } from '@/services/supabaseClient';

interface Props {
  reminders: Reminder[];
}

export const RemindersSidebar = ({ reminders }: Props) => {
  const upcomingReminders = reminders
    .filter((r) => r.status !== 'completed')
    .slice(0, 5);

  return (
    <Card className="overflow-hidden relative group">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="px-lg py-md border-b border-white/[0.05] flex justify-between items-center bg-white/[0.01]">
        <div className="flex items-center gap-sm">
          <Bell size={16} className="text-secondary" />
          <h3 className="text-sm font-bold tracking-tight">REMINDERS</h3>
        </div>
        <div className="w-5 h-5 bg-danger text-[10px] font-bold text-white rounded-full flex items-center justify-center">
          {upcomingReminders.length}
        </div>
      </div>
      <div className="p-md space-y-md relative z-10">
        {upcomingReminders.map((r) => (
          <div key={r.id} className="flex gap-md p-sm rounded-md bg-white/[0.02] border border-white/[0.03]">
            <div className="text-xs font-serif italic text-secondary min-w-[40px] pt-0.5">
              {r.due_time || 'All day'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{r.title}</p>
              {r.description && <p className="text-[10px] text-gray-light truncate mt-0.5">{r.description}</p>}
            </div>
          </div>
        ))}
        {upcomingReminders.length === 0 && (
          <div className="py-lg text-center text-gray-light text-xs italic">All clear!</div>
        )}
      </div>
    </Card>
  );
};

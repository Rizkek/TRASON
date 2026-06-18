import React from 'react';
import { Card, Badge, Loading } from '@/components';
import { useDailyTasks } from '@/hooks/useDailyTasks';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { ListChecks } from 'lucide-react';

export const DailyTasksSummary = () => {
  const { t } = useTranslation();
  const { tasks, isLoading, toggleTask } = useDailyTasks();

  const totalCount = tasks.length;
  const completedCount = tasks.filter(t => t.completed_today).length;

  return (
    <Card className="p-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.05] h-full flex flex-col">
      <div className="flex items-center justify-between mb-xl">
        <div className="flex items-center gap-md">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
            <ListChecks size={20} />
          </div>
          <div>
            <h3 className="font-serif italic text-lg text-white">Daily Tasks</h3>
            <p className="text-micro text-gray-light mt-1">Today's checklist</p>
          </div>
        </div>
        {totalCount > 0 && (
          <Badge variant={completedCount === totalCount ? 'success' : 'default'} size="sm">
            {completedCount} / {totalCount}
          </Badge>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center py-xl"><Loading /></div>
        ) : tasks.length === 0 ? (
          <p className="text-sm text-gray-light italic text-center py-xl opacity-60">No daily tasks yet.</p>
        ) : (
          <div className="space-y-sm">
            {tasks.map(task => (
              <div key={task.id} className="flex items-center gap-md p-sm hover:bg-black/5 dark:hover:bg-white/5 rounded-md transition-colors cursor-pointer group" onClick={() => toggleTask(task.id, !task.completed_today)}>
                <div className={`w-4 h-4 rounded-sm border flex items-center justify-center flex-shrink-0 transition-colors ${task.completed_today ? 'bg-primary border-primary' : 'border-gray-light group-hover:border-primary'}`}>
                  {task.completed_today && <ListChecks size={10} className="text-white" />}
                </div>
                <span className={`text-sm truncate transition-opacity ${task.completed_today ? 'opacity-40 line-through' : 'text-soft-cream'}`}>
                  {task.title}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};
